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
  .setName('give-coins')
  .setDescription('Grant coins to a user with an optional audit reason (Admin)')
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .setDMPermission(false)
  .addUserOption(o =>
    o
      .setName('user')
      .setDescription('Target member to grant coins')
      .setRequired(true)
  )
  .addIntegerOption(o =>
    o
      .setName('coins')
      .setDescription('Amount of coins to give')
      .setRequired(true)
      .setMinValue(1)
      .setMaxValue(1000000000)
  )
  .addStringOption(o =>
    o
      .setName('reason')
      .setDescription('Optional reason for granting coins')
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
      err('Invalid Target', 'You cannot grant coins to bot accounts.')
    );
  }

  const amount = interaction.options.getInteger('coins', true);
  const reason = (interaction.options.getString('reason') || 'Admin coin grant').trim();
  const guildId = interaction.guildId || 'DM';
  const guildName = interaction.guild?.name || 'Direct Message';
  const username = target.tag || target.username || '';

  const wallet = await Wallet.findOneAndUpdate(
    { guildId, userId: target.id },
    {
      $inc: { balance: amount },
      $set: { guildName, username },
      $setOnInsert: { guildId, userId: target.id }
    },
    { upsert: true, new: true }
  );

  const orderId = newOrderId();
  const txId = `ADMIN-GRANT-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  await Ledger.create({
    guildId,
    guildName,
    userId: target.id,
    username,
    orderId,
    rrn: txId,
    coins: amount,
    type: 'admin_grant',
    direction: 'credit',
    description: `Granted by admin: +${amount.toLocaleString()} coins`,
    reason,
    balanceBefore: wallet.balance - amount,
    balanceAfter: wallet.balance,
    transactionId: txId,
    performedBy: interaction.user.id,
  }).catch(err => console.error('[GIVE-COINS] Ledger error:', err));

  const embed = new EmbedBuilder()
    .setColor(C.success)
    .setTitle(`${coinTitleIcon()}  ${coinName()} Granted`)
    .setDescription(`Successfully added **+${formatCoins(amount)}** to <@${target.id}>.`)
    .addFields(
      { name: '👤 Member',       value: `<@${target.id}>`,                   inline: true },
      { name: '➕ Amount Added', value: `**+${formatCoins(amount)}**`,       inline: true },
      { name: '👛 New Balance',  value: `**${formatCoins(wallet.balance)}**`, inline: true },
      { name: '📝 Audit Reason', value: escapeText(reason),                   inline: false },
      { name: '🛡️ Admin',        value: `<@${interaction.user.id}>`,         inline: true }
    )
    .setFooter({ text: `Issued by ${interaction.user.tag || interaction.user.id}` })
    .setTimestamp();

  return replyEmbed(interaction, embed);
}
