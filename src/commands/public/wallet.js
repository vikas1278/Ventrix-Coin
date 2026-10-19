import {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  MessageFlags
} from 'discord.js';
import { Wallet, Ledger } from '../../models.js';
import {
  formatCoins,
  coinIcon,
  coinName,
  escapeText,
  C,
  err,
  replyEmbed,
  adminOnly
} from '../../utils/common.js';

export const data = new SlashCommandBuilder()
  .setName('wallet')
  .setDescription('View your coin balance and access your transaction ledger')
  .addUserOption(o => o.setName('user').setDescription('Admin: inspect another member\'s wallet').setRequired(false));

const ITEMS_PER_PAGE = 8;

const typeDetails = {
  admin_grant:     { emoji: '🎁', label: 'Admin Grant' },
  admin_deduct:    { emoji: '🔻', label: 'Admin Deduction' },
  purchase_credit: { emoji: '🪙', label: 'Coin Top-up' },
  shop_purchase:   { emoji: '🛍️', label: 'Shop Purchase' },
};

/**
 * Builds the paginated ledger embed for private viewing.
 */
export async function buildLedgerEmbed(userId, guildId, pageNumber = 1, callerId = null, client = null) {
  const filter = { userId };
  if (guildId && guildId !== 'DM') {
    filter.$or = [{ guildId }, { guildId: 'global' }, { guildId: 'DM' }];
  }

  const [totalItems, wallet, userObj] = await Promise.all([
    Ledger.countDocuments(filter),
    Wallet.findOne({ guildId: { $in: [guildId, 'DM', 'global'] }, userId }).lean(),
    client ? client.users.fetch(userId).catch(() => null) : null
  ]);

  const targetName = userObj ? (userObj.displayName || userObj.username) : userId;
  const balance = wallet?.balance || 0;
  const isSelf = !callerId || callerId === userId;

  const totalPages = Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE));
  const currentPage = Math.min(Math.max(1, pageNumber), totalPages);

  if (totalItems === 0) {
    const emptyEmbed = new EmbedBuilder()
      .setColor(C.muted)
      .setTitle(isSelf ? '📜  Your Ledger is Empty' : `📜  Ledger is Empty — ${escapeText(targetName)}`)
      .setDescription(
        isSelf
          ? `You do not have any coin ledger transactions recorded yet.\n\n` +
            `• Top up ${coinName()}: \`/buycoin\`\n` +
            `• Browse shop items: \`/shop\``
          : `<@${userId}> does not have any coin ledger activity recorded yet.`
      )
      .setFooter({ text: 'Ledger tracks all coin grants, deductions, and shop purchases' })
      .setTimestamp();

    return { embed: emptyEmbed, row: null, totalPages: 1, currentPage: 1 };
  }

  const entries = await Ledger.find(filter)
    .sort({ createdAt: -1 })
    .skip((currentPage - 1) * ITEMS_PER_PAGE)
    .limit(ITEMS_PER_PAGE)
    .lean();

  const embed = new EmbedBuilder()
    .setColor(C.brand)
    .setTitle(
      isSelf
        ? `📜  Your Coin Ledger (Page ${currentPage}/${totalPages})`
        : `📜  Coin Ledger — ${escapeText(targetName)} (Page ${currentPage}/${totalPages})`
    )
    .setDescription(
      `👤 **Member:** <@${userId}> • **Balance:** **${formatCoins(balance)}**\n` +
      `Showing **${entries.length}** of **${totalItems}** total ledger audit records.`
    )
    .setFooter({
      text: `Page ${currentPage} of ${totalPages} • Total Records: ${totalItems}`
    })
    .setTimestamp();

  for (const entry of entries) {
    const detail = typeDetails[entry.type] || { emoji: '•', label: entry.type || 'Transaction' };
    const sign = entry.coins >= 0 ? '+' : '';
    const ts = Math.floor(new Date(entry.createdAt).getTime() / 1000);
    const reason = entry.reason ? escapeText(entry.reason) : 'No note provided';
    const adminTag =
      entry.performedBy && entry.performedBy !== 'system' && entry.performedBy !== entry.userId
        ? ` • 🛡️ Admin: <@${entry.performedBy}>`
        : '';

    embed.addFields({
      name: `${detail.emoji}  **${sign}${formatCoins(entry.coins)}**  \`[${detail.label}]\``,
      value: `⏱️ <t:${ts}:R> (<t:${ts}:d>) • 📝 *${reason}*${adminTag}\n🔖 \`${entry.rrn || entry.orderId}\``,
      inline: false
    });
  }

  let row = null;
  if (totalPages > 1) {
    const activeCallerId = callerId || userId;
    row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`wallet_page_${userId}_${currentPage - 1}_${activeCallerId}`)
        .setLabel('◀️ Previous')
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(currentPage <= 1),
      new ButtonBuilder()
        .setCustomId(`wallet_page_noop_${userId}`)
        .setLabel(`Page ${currentPage} / ${totalPages}`)
        .setStyle(ButtonStyle.Primary)
        .setDisabled(true),
      new ButtonBuilder()
        .setCustomId(`wallet_page_${userId}_${currentPage + 1}_${activeCallerId}`)
        .setLabel('Next ▶️')
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(currentPage >= totalPages)
    );
  }

  return { embed, row, totalPages, currentPage };
}

export async function execute(interaction) {
  const targetUser = interaction.options.getUser('user') || interaction.user;
  if (targetUser.id !== interaction.user.id && !adminOnly(interaction)) {
    return replyEmbed(
      interaction,
      err('Access Denied', 'Only administrators can inspect another member\'s wallet.')
    );
  }

  const guildId = interaction.guildId || 'DM';
  const wallet = await Wallet.findOne({ guildId, userId: targetUser.id }).lean();
  const balance = wallet?.balance || 0;
  const isSelf = targetUser.id === interaction.user.id;

  const embed = new EmbedBuilder()
    .setColor(C.brand)
    .setTitle(`👛  ${coinName()} Wallet — ${escapeText(targetUser.displayName || targetUser.username)}`)
    .setThumbnail(targetUser.displayAvatarURL({ dynamic: true }))
    .addFields(
      { name: '👤 Member',                       value: `<@${targetUser.id}>`,         inline: true },
      { name: `${coinIcon()} Available Balance`, value: `**${formatCoins(balance)}**`, inline: true },
    )
    .setDescription(
      isSelf
        ? `Welcome to your personal wallet! Click **View Ledger History** below to inspect your full transaction audit privately.`
        : `Inspecting wallet for <@${targetUser.id}>.\nClick **View Ledger History** below to inspect their full transaction audit.`
    )
    .setFooter({ text: 'Use /shop to browse items • Use /buycoin to top up' })
    .setTimestamp();

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`wallet_ledger_open_${targetUser.id}_${interaction.user.id}`)
      .setLabel('📜 View Ledger History')
      .setStyle(ButtonStyle.Primary)
  );

  return replyEmbed(interaction, embed, { components: [row] });
}

export async function component(interaction) {
  // 1. Open Private Ephemeral Ledger View
  if (interaction.customId.startsWith('wallet_ledger_open_')) {
    const parts = interaction.customId.split('_');
    const targetUserId = parts[3];
    const callerId = parts[4] || targetUserId;

    if (interaction.user.id !== callerId) {
      return interaction.reply({
        content: '❌ Only the user who ran this command can open this ledger history.',
        flags: MessageFlags.Ephemeral
      });
    }

    const { embed, row } = await buildLedgerEmbed(
      targetUserId,
      interaction.guildId || 'DM',
      1,
      callerId,
      interaction.client
    );

    const components = row ? [row] : [];
    return interaction.reply({
      embeds: [embed],
      components,
      flags: MessageFlags.Ephemeral
    });
  }

  // 2. Paginate inside the Private Ephemeral Ledger View
  if (interaction.customId.startsWith('wallet_page_')) {
    const parts = interaction.customId.split('_');
    const targetUserId = parts[2];
    const targetPage = parseInt(parts[3], 10);
    const callerId = parts[4] || targetUserId;

    if (interaction.user.id !== callerId) {
      return interaction.reply({
        content: '❌ Only the user who ran this command can interact with the ledger pagination.',
        flags: MessageFlags.Ephemeral
      });
    }

    if (isNaN(targetPage)) return;

    const { embed, row } = await buildLedgerEmbed(
      targetUserId,
      interaction.guildId || 'DM',
      targetPage,
      callerId,
      interaction.client
    );

    const components = row ? [row] : [];
    return interaction.update({ embeds: [embed], components });
  }
}
