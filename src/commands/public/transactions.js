import {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  MessageFlags,
} from 'discord.js';
import { Order } from '../../models.js';
import {
  money,
  formatCoins,
  coinIcon,
  escapeText,
  C,
  info,
  replyEmbed,
} from '../../utils/common.js';

export const data = new SlashCommandBuilder()
  .setName('transactions')
  .setDescription('View shop orders and coin payment history')
  .addUserOption(o =>
    o
      .setName('user')
      .setDescription('Member mention or Discord ID to view history (optional)')
      .setRequired(false)
  );

const ITEMS_PER_PAGE = 6;

const statusEmoji = {
  paid: '✅',
  pending: '⏳',
  expired: '❌',
  review: '⚠️',
  rejected: '🚫',
};

export async function buildTransactionsEmbed(userId, guildId, pageNumber = 1, callerId = null, targetName = null) {
  const filter = { userId };
  if (guildId && guildId !== 'DM') filter.guildId = guildId;

  const totalItems = await Order.countDocuments(filter);
  const totalPages = Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE));
  const currentPage = Math.min(Math.max(1, pageNumber), totalPages);

  const isSelf = !callerId || callerId === userId;
  const displayName = targetName || `<@${userId}>`;

  if (totalItems === 0) {
    const emptyEmbed = new EmbedBuilder()
      .setColor(C.muted)
      .setTitle(isSelf ? '🧾  No Transactions' : `🧾  No Transactions — ${displayName}`)
      .setDescription(
        isSelf
          ? 'You haven\'t made any coin purchases or shop orders yet.\n\n' +
            '• Browse shop: `/shop`\n' +
            '• Top up coins: `/buycoin`'
          : `<@${userId}> hasn't made any coin purchases or shop orders yet in this server.`
      )
      .setFooter({ text: isSelf ? 'Your order history is securely saved' : 'Inspected by member' })
      .setTimestamp();

    return { embed: emptyEmbed, row: null, totalPages: 1, currentPage: 1 };
  }

  const rows = await Order.find(filter)
    .sort({ createdAt: -1 })
    .skip((currentPage - 1) * ITEMS_PER_PAGE)
    .limit(ITEMS_PER_PAGE)
    .lean();

  const fields = rows.map(o => {
    const isShop = o.type === 'shop_purchase';
    const priceDisplay = isShop
      ? formatCoins(o.coins)
      : `💸 ${money(o.payablePaise)} (+${formatCoins(o.coins)})`;
    const rrnText = o.rrn ? ` • RRN: \`${o.rrn}\`` : '';
    const reasonText = o.rejectionReason
      ? `\n> Rejection Reason: *${escapeText(o.rejectionReason)}*`
      : '';
    const dateText = o.createdAt
      ? ` • <t:${Math.floor(new Date(o.createdAt).getTime() / 1000)}:d>`
      : '';

    return {
      name: `${statusEmoji[o.status] ?? '•'}  ${escapeText(o.productName)}`,
      value: `ID: \`${o.orderId}\` • ${priceDisplay} • **${o.status.toUpperCase()}**${dateText}${rrnText}${reasonText}`,
      inline: false,
    };
  });

  const embed = new EmbedBuilder()
    .setColor(C.brand)
    .setTitle(
      isSelf
        ? `🧾  Your Orders & Purchases (Page ${currentPage}/${totalPages})`
        : `🧾  Orders & Purchases — ${displayName} (Page ${currentPage}/${totalPages})`
    )
    .setDescription(
      isSelf
        ? 'Here is your recent order and payment history in this server.'
        : `Viewing order and payment history for <@${userId}>.`
    )
    .addFields(fields)
    .setFooter({ text: `Total Orders: ${totalItems} • Page ${currentPage} of ${totalPages}` })
    .setTimestamp();

  let row = null;
  if (totalPages > 1) {
    const activeCallerId = callerId || userId;
    row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`tx_page_${userId}_${currentPage - 1}_${activeCallerId}`)
        .setLabel('◀️ Previous')
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(currentPage <= 1),
      new ButtonBuilder()
        .setCustomId(`tx_page_noop_${userId}`)
        .setLabel(`Page ${currentPage} / ${totalPages}`)
        .setStyle(ButtonStyle.Primary)
        .setDisabled(true),
      new ButtonBuilder()
        .setCustomId(`tx_page_${userId}_${currentPage + 1}_${activeCallerId}`)
        .setLabel('Next ▶️')
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(currentPage >= totalPages)
    );
  }

  return { embed, row, totalPages, currentPage };
}

export async function execute(interaction) {
  const targetUser = interaction.options.getUser('user') || interaction.user;
  const { embed, row } = await buildTransactionsEmbed(
    targetUser.id,
    interaction.guildId || 'DM',
    1,
    interaction.user.id,
    targetUser.displayName || targetUser.username
  );

  const components = row ? [row] : [];
  return replyEmbed(interaction, embed, { components });
}

export async function component(interaction) {
  if (!interaction.customId.startsWith('tx_page_')) return;

  const parts = interaction.customId.split('_');
  const targetUserId = parts[2];
  const targetPage = parseInt(parts[3], 10);
  const callerId = parts[4] || targetUserId;

  if (interaction.user.id !== callerId) {
    return interaction.reply({
      content: '❌ Only the user who ran this command can interact with the transaction pagination.',
      flags: MessageFlags.Ephemeral,
    });
  }

  if (isNaN(targetPage)) return;

  const { embed, row } = await buildTransactionsEmbed(
    targetUserId,
    interaction.guildId || 'DM',
    targetPage,
    callerId
  );
  const components = row ? [row] : [];

  return interaction.update({ embeds: [embed], components });
}
