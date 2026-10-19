import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { Order } from '../../models.js';
import { coinIcon, formatCoins, escapeText, C, err, replyEmbed, adminOnly } from '../../utils/common.js';

export const data = new SlashCommandBuilder()
  .setName('order')
  .setDescription('Inspect full details, status, and payment logs of an order (admin)')
  .addStringOption(o =>
    o
      .setName('order_id')
      .setDescription('Order ID to inspect (e.g. GS-XXXX)')
      .setRequired(true)
      .setAutocomplete(true)
  );

const STATUS_CONFIG = {
  paid:      { text: 'Paid / Credited', emoji: '🟢', color: C.success },
  pending:   { text: 'Pending Payment', emoji: '🟡', color: C.warning },
  review:    { text: 'Needs Review',   emoji: '🟠', color: C.warning },
  expired:   { text: 'Expired',        emoji: '⏱️', color: C.muted },
  rejected:  { text: 'Rejected',       emoji: '🔴', color: C.danger },
};

export async function execute(interaction) {
  if (!adminOnly(interaction)) {
    return replyEmbed(interaction, err('Access Denied', 'This command is restricted to administrators.'));
  }

  const inputId = interaction.options.getString('order_id', true).trim();
  const order = await Order.findOne({
    orderId: { $regex: new RegExp(`^${inputId}$`, 'i') }
  }).lean();

  if (!order) {
    return replyEmbed(
      interaction,
      err('Order Not Found', `No order was found with ID \`${escapeText(inputId)}\`.\nMake sure the Order ID is entered correctly.`)
    );
  }

  const statusMeta = STATUS_CONFIG[order.status] || { text: order.status, emoji: '⚪', color: C.brand };
  const createdTs = Math.floor(new Date(order.createdAt).getTime() / 1000);
  const expiresTs = Math.floor(new Date(order.expiresAt).getTime() / 1000);
  const inrAmount = (order.payablePaise / 100).toFixed(2);

  const embed = new EmbedBuilder()
    .setColor(statusMeta.color)
    .setTitle(`📦  Order Details — #${order.orderId}`)
    .setDescription(
      `**Status:** ${statusMeta.emoji} **${statusMeta.text.toUpperCase()}**\n` +
      `**Product:** **${escapeText(order.productName || 'Coins')}**\n` +
      `**Buyer:** <@${order.userId}> (\`${order.userId}\`)`
    )
    .addFields(
      {
        name: '💰 Amount & Coins',
        value:
          `• Payable: **₹${inrAmount}**\n` +
          `• Coins: **${formatCoins(order.coins)}**\n` +
          `• Type: \`${order.type || 'coin_purchase'}\``,
        inline: true
      },
      {
        name: '📅 Timeline',
        value:
          `• Created: <t:${createdTs}:f> (<t:${createdTs}:R>)\n` +
          `• Expires: <t:${expiresTs}:R>\n` +
          (order.paidAt ? `• Paid At: <t:${Math.floor(new Date(order.paidAt).getTime() / 1000)}:f>\n` : '') +
          (order.rejectedAt ? `• Rejected At: <t:${Math.floor(new Date(order.rejectedAt).getTime() / 1000)}:f>\n` : ''),
        inline: true
      },
      {
        name: '🔍 Verification & Audit',
        value:
          `• RRN / UTR: ${order.rrn ? `\`${order.rrn}\`` : '*None*'}\n` +
          `• Source: \`${order.verificationSource || 'None'}\`\n` +
          (order.verifiedBy ? `• Verified By: <@${order.verifiedBy}>\n` : '') +
          (order.rejectionReason ? `• Rejection Reason: **${escapeText(order.rejectionReason)}**\n` : '') +
          (order.note ? `• Note: *${escapeText(order.note)}*` : ''),
        inline: false
      }
    )
    .setFooter({ text: `Guild: ${order.guildId || 'Global'} • Server Order Audit` })
    .setTimestamp();

  return replyEmbed(interaction, embed);
}

export async function autocomplete(interaction) {
  try {
    const focusedValue = interaction.options.getFocused().trim();
    const filter = {};
    if (interaction.guildId) {
      filter.guildId = { $in: [interaction.guildId, 'global', 'DM'] };
    }
    if (focusedValue) {
      filter.orderId = { $regex: new RegExp(focusedValue, 'i') };
    }

    const recentOrders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .limit(20)
      .select('orderId status amountInr payablePaise productName userId')
      .lean();

    const choices = recentOrders.map(o => {
      const inr = ((o.payablePaise || (o.amountInr * 100)) / 100).toFixed(0);
      return {
        name: `${o.orderId} • [${o.status.toUpperCase()}] • ₹${inr} (${o.productName.slice(0, 30)})`.slice(0, 100),
        value: o.orderId,
      };
    });

    return interaction.respond(choices).catch(() => {});
  } catch {
    return interaction.respond([]).catch(() => {});
  }
}
