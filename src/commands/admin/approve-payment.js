import { SlashCommandBuilder } from 'discord.js';
import { Order } from '../../models.js';
import { money, formatCoins, coinIcon, coinName, ok, err, replyEmbed, adminOnly } from '../../utils/common.js';
import { creditVerifiedPayment } from '../../services/credit.js';

export const data = new SlashCommandBuilder()
  .setName('approve-payment')
  .setDescription('Manually verify and credit an ambiguous or unmatched UPI payment (admin)')
  .addStringOption(o => o.setName('order_id').setDescription('Order ID').setRequired(true))
  .addNumberOption(o => o.setName('amount').setDescription('Exact amount received in INR').setRequired(true).setMinValue(0.01))
  .addStringOption(o => o.setName('rrn').setDescription('RRN / UTR from bank statement').setRequired(true));

export async function execute(interaction) {
  if (!adminOnly(interaction)) {
    return replyEmbed(interaction, err('Access Denied', 'This command is restricted to administrators.'));
  }

  const orderId = interaction.options.getString('order_id').trim();
  const rrn = interaction.options.getString('rrn').trim();
  const amountInr = interaction.options.getNumber('amount');

  if (!/^\d{8,20}$/.test(rrn)) {
    return replyEmbed(
      interaction,
      err('Invalid RRN', 'Enter the numeric RRN / UTR (8–20 digits) shown in your bank statement or Slice app.')
    );
  }

  const order = await Order.findOne({ orderId });
  if (!order) {
    return replyEmbed(interaction, err('Order Not Found', `No order exists with Order ID \`${orderId}\`.`));
  }

  if (order.status === 'paid') {
    return replyEmbed(interaction, err('Already Paid', `Order \`${order.orderId}\` has already been credited.`));
  }

  const amountPaise = Math.round(amountInr * 100);
  if (amountPaise !== order.payablePaise) {
    return replyEmbed(
      interaction,
      err(
        'Amount Mismatch',
        `Order expects **${money(order.payablePaise)}**, but you entered **${money(amountPaise)}**.\nNothing was credited.`
      )
    );
  }

  const result = await creditVerifiedPayment({
    order,
    rrn,
    amountPaise,
    source: 'admin',
    senderName: 'Manual Bank Verification',
    rawSnippet: `Approved manually by ${interaction.user.tag || interaction.user.id}`,
    verifiedBy: interaction.user.id,
  });

  if (result.startsWith('credited:')) {
    const newBalance = result.split(':')[1];
    return replyEmbed(
      interaction,
      ok('Payment Approved & Credited', `**+${formatCoins(order.coins)}** credited to <@${order.userId}>.\nOrder \`${order.orderId}\` marked as paid.`)
        .addFields(
          { name: '🆔 Order ID',    value: `\`${order.orderId}\``,        inline: true },
          { name: '🔑 RRN / UTR',    value: `\`${rrn}\``,                  inline: true },
          { name: `${coinIcon()} ${coinName()} Added`, value: `**${formatCoins(order.coins)}**`, inline: true },
          { name: '👛 Member Total', value: `**${formatCoins(newBalance)}**`, inline: true },
        )
    );
  }

  return replyEmbed(
    interaction,
    err('Verification Failed', `Result: \`${result}\`\nCheck whether this RRN was already credited for another order.`)
  );
}
