import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { Wallet, Ledger } from '../../models.js';
import { formatCoins, coinIcon, coinName, coinTitleIcon, newOrderId, escapeText, C, err, replyEmbed, adminOnly } from '../../utils/common.js';

export const data = new SlashCommandBuilder()
  .setName('take-coins')
  .setDescription('Deduct coins from a user with an audit reason (admin)')
  .addUserOption(o => o.setName('user').setDescription('Target member').setRequired(true))
  .addIntegerOption(o => o.setName('coins').setDescription('Coins to deduct').setRequired(true).setMinValue(1))
  .addStringOption(o => o.setName('reason').setDescription('Mandatory audit reason').setRequired(true));

export async function execute(interaction) {
  if (!adminOnly(interaction)) {
    return replyEmbed(interaction, err('Access Denied', 'This command is restricted to administrators.'));
  }

  const target = interaction.options.getUser('user');
  const amount = interaction.options.getInteger('coins');
  const reason = interaction.options.getString('reason').trim();
  const guildId = interaction.guildId || 'DM';
  const guildName = interaction.guild?.name || 'Direct Message';
  const username = target.tag || target.username || '';

  const currentWallet = await Wallet.findOne({ guildId, userId: target.id });
  const currentBalance = currentWallet?.balance || 0;
  if (currentBalance < amount) {
    return replyEmbed(
      interaction,
      err('Insufficient Balance', `<@${target.id}> only has **${formatCoins(currentBalance)}** on this server, cannot deduct **${formatCoins(amount)}**.`)
    );
  }

  const wallet = await Wallet.findOneAndUpdate(
    { guildId, userId: target.id, balance: { $gte: amount } },
    {
      $inc: { balance: -amount },
      $set: { guildName, username }
    },
    { new: true }
  );

  const orderId = newOrderId();
  await Ledger.create({
    guildId,
    guildName,
    userId: target.id,
    username,
    orderId,
    rrn: `ADMIN-DEDUCT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    coins: -amount,
    type: 'admin_deduct',
    reason,
    performedBy: interaction.user.id,
  });

  const embed = new EmbedBuilder()
    .setColor(C.warning)
    .setTitle(`${coinTitleIcon()}  ${coinName()} Deducted`)
    .setDescription(`Successfully deducted **-${formatCoins(amount)}** from <@${target.id}>.`)
    .addFields(
      { name: '👤 Member',         value: `<@${target.id}>`,                   inline: true },
      { name: '➖ Amount Deducted', value: `**-${formatCoins(amount)}**`,      inline: true },
      { name: '👛 New Balance',    value: `**${formatCoins(wallet.balance)}**`, inline: true },
      { name: '📝 Audit Reason',   value: escapeText(reason),                   inline: false },
    )
    .setFooter({ text: `Issued by ${interaction.user.tag || interaction.user.id}` })
    .setTimestamp();

  return replyEmbed(interaction, embed);
}
