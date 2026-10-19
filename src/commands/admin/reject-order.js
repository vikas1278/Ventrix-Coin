import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { Order, Payment, Ledger, UserInventory } from '../../models.js';
import { escapeText, C, err, replyEmbed, adminOnly } from '../../utils/common.js';

export const data = new SlashCommandBuilder()
  .setName('reject-order')
  .setDescription('Reject a payment order and permanently delete it from DB (admin)')
  .addStringOption(o => o.setName('order_id').setDescription('Order ID to reject').setRequired(true))
  .addStringOption(o => o.setName('reason').setDescription('Reason for rejection').setRequired(true));

export async function execute(interaction) {
  if (!adminOnly(interaction)) {
    return replyEmbed(interaction, err('Access Denied', 'This command is restricted to administrators.'));
  }

  const orderId = interaction.options.getString('order_id').trim();
  const reason = interaction.options.getString('reason').trim();

  const order = await Order.findOne({ orderId });
  if (!order) {
    return replyEmbed(interaction, err('Order Not Found', `No order exists with ID \`${orderId}\`.`));
  }

  if (order.status === 'paid') {
    return replyEmbed(interaction, err('Cannot Reject', `Order \`${order.orderId}\` has already been paid & credited with coins.`));
  }

  // Attempt to notify user via DM before deleting the record
  try {
    const buyer = await interaction.client.users.fetch(order.userId);
    if (buyer) {
      const dmEmbed = new EmbedBuilder()
        .setColor(C.danger)
        .setTitle('🚫  Order Rejected')
        .setDescription(`Your order \`${order.orderId}\` for **${escapeText(order.productName)}** has been rejected.`)
        .addFields(
          { name: '🆔 Order ID', value: `\`${order.orderId}\``, inline: true },
          { name: '📝 Reason',   value: escapeText(reason),     inline: false },
        )
        .setFooter({ text: 'If you already paid, please contact an administrator with your payment proof.' })
        .setTimestamp();

      await buyer.send({ embeds: [dmEmbed] }).catch(() => {});
    }
  } catch {
    // Ignored if user's DMs are closed
  }

  // Permanently delete the order and any associated pending records from database
  await Order.deleteOne({ orderId: order.orderId });
  await Payment.deleteMany({ orderId: order.orderId }).catch(() => {});
  await Ledger.deleteMany({ orderId: order.orderId }).catch(() => {});
  await UserInventory.deleteMany({ orderId: order.orderId }).catch(() => {});

  const embed = new EmbedBuilder()
    .setColor(C.danger)
    .setTitle(`🚫  Order Rejected & Removed — ${order.orderId}`)
    .setDescription(`Order \`${order.orderId}\` for **${escapeText(order.productName)}** has been rejected and permanently removed from the database.`)
    .addFields(
      { name: '🆔 Order ID',    value: `\`${order.orderId}\``,        inline: true },
      { name: '👤 Member',      value: `<@${order.userId}>`,          inline: true },
      { name: '📝 Reason',      value: escapeText(reason),            inline: false },
      { name: '🛡️ Rejected By', value: `<@${interaction.user.id}>`,   inline: true },
    )
    .setFooter({ text: 'Order permanently deleted from database • Coins were not credited' })
    .setTimestamp();

  return replyEmbed(interaction, embed);
}
