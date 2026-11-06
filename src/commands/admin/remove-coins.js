import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { Wallet, Ledger } from '../../models.js';
import {
  formatCoins,
  coinTitleIcon,
  coinName,
  newOrderId,
  escapeText,
  C,
  err,
  replyEmbed,
  adminOnly
} from '../../utils/common.js';

export const data = new SlashCommandBuilder()
  .setName('remove-coins')
  .setDescription('Remove or deduct coins from a user with an optional audit reason (Admin)')
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .setDMPermission(false)
  .addUserOption(o =>
    o
      .setName('user')
      .setDescription('Target member to remove coins from')
      .setRequired(true)
  )
  .addIntegerOption(o =>
    o
      .setName('coins')
      .setDescription('Amount of coins to remove')
      .setRequired(true)
      .setMinValue(1)
      .setMaxValue(1000000000)
  )
  .addStringOption(o =>
    o
      .setName('reason')
      .setDescription('Optional reason for removing coins')
      .setRequired(false)
      .setMaxLength(200)
  );

export async function execute(interaction) {
  if (!adminOnly(interaction)) {
    return replyEmbed(
      interaction,
      err('Access Denied', 'This command is strictly restricted to **Bot Owners** and **Bot Administrators**.')
    );
  }

  const target = interaction.options.getUser('user', true);
  if (target.bot) {
    return replyEmbed(
      interaction,
      err('Invalid Target', 'Bot accounts do not have coin wallets.')
    );
  }

  const amount = interaction.options.getInteger('coins', true);
  const reason = (interaction.options.getString('reason') || 'Admin coin removal').trim();
  const guildId = interaction.guildId || 'DM';
  const guildName = interaction.guild?.name || 'Direct Message';
  const username = target.tag || target.username || '';

  const currentWallet = await Wallet.findOne({ guildId, userId: target.id });
  const currentBalance = currentWallet?.balance || 0;
  if (currentBalance < amount) {
    return replyEmbed(
      interaction,
      err('Insufficient Balance', `<@${target.id}> only has **${formatCoins(currentBalance)}** on this server, cannot remove **${formatCoins(amount)}**.`)
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
  const txId = `ADMIN-REMOVE-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  await Ledger.create({
    guildId,
    guildName,
    userId: target.id,
    username,
    orderId,
    rrn: txId,
    coins: -amount,
    type: 'admin_deduct',
    direction: 'debit',
    description: `Removed by admin: -${amount.toLocaleString()} coins`,
    reason,
    balanceBefore: currentBalance,
    balanceAfter: wallet.balance,
    transactionId: txId,
    performedBy: interaction.user.id,
  }).catch(err => console.error('[REMOVE-COINS] Ledger error:', err));

  const embed = new EmbedBuilder()
    .setColor(C.warning)
    .setTitle(`${coinTitleIcon()}  ${coinName()} Removed`)
    .setDescription(`Successfully removed **-${formatCoins(amount)}** from <@${target.id}>.`)
    .addFields(
      { name: '👤 Member',        value: `<@${target.id}>`,                   inline: true },
      { name: '➖ Amount Removed', value: `**-${formatCoins(amount)}**`,      inline: true },
      { name: '👛 New Balance',   value: `**${formatCoins(wallet.balance)}**`, inline: true },
      { name: '📝 Audit Reason',  value: escapeText(reason),                   inline: false },
      { name: '🛡️ Admin',         value: `<@${interaction.user.id}>`,         inline: true }
    )
    .setFooter({ text: `Issued by ${interaction.user.tag || interaction.user.id}` })
    .setTimestamp();

  return replyEmbed(interaction, embed);
}

