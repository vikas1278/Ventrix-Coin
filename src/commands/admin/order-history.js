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
  formatCoins,
  C,
  err,
  replyEmbed,
  adminOnly,
} from '../../utils/common.js';

export const data = new SlashCommandBuilder()
  .setName('orderhistory')
  .setDescription('View all pending /buycoin orders from all members with pagination (Admin)')
  .addUserOption(o =>
    o
      .setName('user')
      .setDescription('Filter pending orders by a specific member (optional)')
      .setRequired(false)
  );

const ITEMS_PER_PAGE = 5;

export async function buildOrderHistoryEmbed(guildId, pageNumber = 1, callerId = null, filterUserId = null, isExpired = false) {
  const filter = {
    type: 'coin_purchase',
    status: 'pending',
  };

  if (guildId && guildId !== 'DM') {
    filter.guildId = { $in: [guildId, 'global', 'DM'] };
  }

  if (filterUserId) {
    filter.userId = filterUserId;
  }

  const totalItems = await Order.countDocuments(filter);
  const totalPages = Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE));
  const currentPage = Math.min(Math.max(1, pageNumber), totalPages);

  if (totalItems === 0) {
    const emptyEmbed = new EmbedBuilder()
      .setColor(C.success)
      .setTitle('📦  Pending Buycoin Orders')
      .setDescription(
        filterUserId
          ? `No pending \`/buycoin\` orders found for <@${filterUserId}>.\nAll orders are either approved, paid, or rejected.`
          : '🎉 **No pending orders!**\nThere are currently no pending `/buycoin` orders waiting for approval or verification.\nApproved and rejected orders are automatically hidden from this list.'
      )
      .setFooter({ text: 'Admin Order Audit • Filter: status=pending' })
      .setTimestamp();

    return { embed: emptyEmbed, row: null, totalPages: 1, currentPage: 1 };
  }

  const rows = await Order.find(filter)
    .sort({ createdAt: -1 })
    .skip((currentPage - 1) * ITEMS_PER_PAGE)
    .limit(ITEMS_PER_PAGE)
    .lean();

  const fields = rows.map((o, index) => {
    const itemNumber = (currentPage - 1) * ITEMS_PER_PAGE + index + 1;
    const amountInr = ((o.payablePaise || (o.amountInr * 100)) / 100).toFixed(2);
    const createdTs = Math.floor(new Date(o.createdAt).getTime() / 1000);

    return {
      name: `${itemNumber}. 📦 Order \`#${o.orderId}\``,
      value:
        `• **Buyer:** <@${o.userId}> (\`${o.userId}\`)\n` +
        `• **Amount:** **₹${amountInr}** (${formatCoins(o.coins)})\n` +
        `• **Status:** ⏳ \`PENDING\`\n` +
        `• **Created:** <t:${createdTs}:R> (<t:${createdTs}:f>)\n`

    };
  });

  const title = filterUserId
    ? `📦  Pending Buycoin Orders — Member: <@${filterUserId}> (Page ${currentPage}/${totalPages})`
    : `📦  Pending Buycoin Orders (Page ${currentPage}/${totalPages})`;

  const embed = new EmbedBuilder()
    .setColor(C.warning)
    .setTitle(title)
    .setDescription(
      `Showing all pending \`/buycoin\` orders waiting for verification.\n`
    )
    .addFields(fields)
    .setFooter({
      text: isExpired
        ? `Total Pending: ${totalItems} • Page ${currentPage} of ${totalPages} • ⌛ Buttons expired after 5m of inactivity`
        : `Total Pending: ${totalItems} • Page ${currentPage} of ${totalPages} • Admin Panel (5m active)`,
    })
    .setTimestamp();

  const activeCallerId = callerId || 'admin';
  const filterParam = filterUserId || 'all';

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`ord_hist_${filterParam}_${currentPage - 1}_${activeCallerId}`)
      .setLabel('◀️ Previous')
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(isExpired || currentPage <= 1),
    new ButtonBuilder()
      .setCustomId(`ord_hist_noop_${currentPage}`)
      .setLabel(isExpired ? '⌛ Expired (5m)' : `Page ${currentPage} / ${totalPages}`)
      .setStyle(isExpired ? ButtonStyle.Secondary : ButtonStyle.Primary)
      .setDisabled(true),
    new ButtonBuilder()
      .setCustomId(`ord_hist_${filterParam}_${currentPage + 1}_${activeCallerId}`)
      .setLabel('Next ▶️')
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(isExpired || currentPage >= totalPages),
    new ButtonBuilder()
      .setCustomId(`ord_hist_${filterParam}_${currentPage}_${activeCallerId}`)
      .setLabel('🔄 Refresh')
      .setStyle(isExpired ? ButtonStyle.Secondary : ButtonStyle.Success)
      .setDisabled(isExpired)
  );

  return { embed, row, totalPages, currentPage };
}

export async function execute(interaction) {
  if (!adminOnly(interaction)) {
    return replyEmbed(interaction, err('Access Denied', 'This command is restricted to administrators.'));
  }

  const filterUser = interaction.options.getUser('user');
  const callerId = interaction.user.id;
  const filterUserId = filterUser?.id || null;

  const { embed, row, currentPage } = await buildOrderHistoryEmbed(
    interaction.guildId || 'DM',
    1,
    callerId,
    filterUserId
  );

  const components = row ? [row] : [];
  await replyEmbed(interaction, embed, { components });
  const reply = await interaction.fetchReply();

  // Attach 5-minute inactivity collector for the user who ran the command
  if (row && reply?.createMessageComponentCollector) {
    const collector = reply.createMessageComponentCollector({
      filter: i => i.customId.startsWith('ord_hist_'),
      idle: 5 * 60 * 1000, // 5 minutes inactivity
    });

    collector.on('end', async () => {
      try {
        const { embed: expiredEmbed, row: expiredRow } = await buildOrderHistoryEmbed(
          interaction.guildId || 'DM',
          currentPage,
          callerId,
          filterUserId,
          true // isExpired
        );
        await interaction.editReply({
          embeds: [expiredEmbed],
          components: expiredRow ? [expiredRow] : [],
        }).catch(() => {});
      } catch (_) {}
    });
  }

  return reply;
}

export async function component(interaction) {
  if (!interaction.customId.startsWith('ord_hist_')) return;

  const parts = interaction.customId.split('_');
  const filterParam = parts[2];
  const targetPage = parseInt(parts[3], 10);
  const callerId = parts[4];

  if (!adminOnly(interaction)) {
    return interaction.reply({
      content: '❌ Only administrators can interact with order history.',
      flags: MessageFlags.Ephemeral,
    });
  }

  if (callerId && callerId !== 'admin' && interaction.user.id !== callerId) {
    return interaction.reply({
      content: '❌ Only the administrator who ran this command can use this pagination.',
      flags: MessageFlags.Ephemeral,
    });
  }

  if (isNaN(targetPage)) return;

  // Fallback 5-minute inactivity check if collector was cleared
  const messageAgeMs = interaction.message?.createdTimestamp
    ? Date.now() - interaction.message.createdTimestamp
    : 0;
  const isExpired = messageAgeMs > 5 * 60 * 1000;

  const filterUserId = filterParam === 'all' ? null : filterParam;
  const { embed, row } = await buildOrderHistoryEmbed(
    interaction.guildId || 'DM',
    targetPage,
    callerId,
    filterUserId,
    isExpired
  );

  const components = row ? [row] : [];
  return interaction.update({ embeds: [embed], components });
}
