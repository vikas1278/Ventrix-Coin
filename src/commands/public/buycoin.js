import { SlashCommandBuilder, EmbedBuilder, AttachmentBuilder, MessageFlags } from 'discord.js';
import QRCode from 'qrcode';
import { Order } from '../../models.js';
import config from '../../config.js';
import {
  parseAmountInr, getCoinRate, inrToCoins, newOrderId,
  makeUpiUri, formatCoins, coinIcon, coinName, coinTitleIcon, C, err
} from '../../utils/common.js';

export const data = new SlashCommandBuilder()
  .setName('buycoin')
  .setDescription('Buy coins via UPI QR payment (credited automatically after verification)')
  .addNumberOption(o => o.setName('amount').setDescription('Amount in INR (e.g. 100)').setRequired(true).setMinValue(1));

export async function execute(interaction) {
  // Ephemeral: only visible to the user who ran the command
  await interaction.deferReply({ flags: MessageFlags.Ephemeral });

  const upiId = config.upiId;
  const payeeName = config.upiPayeeName;

  if (!upiId || !payeeName) {
    return interaction.editReply({
      embeds: [err('UPI Not Configured', 'The administrator has not configured UPI ID and Payee Name in config.js.')],
    });
  }

  const inputAmount = interaction.options.getNumber('amount');
  let amountInr;
  try {
    amountInr = parseAmountInr(inputAmount);
  } catch (e) {
    return interaction.editReply({ embeds: [err('Invalid Amount', e.message)] });
  }

  // Calculate coins to credit based on configurable conversion rate
  const conversionRate = await getCoinRate(interaction.guildId);
  const coinsToCredit = inrToCoins(amountInr, conversionRate);
  const payablePaise = Math.round(amountInr * 100);

  const now = new Date();
  const ttlMinutes = Math.max(5, Number(config.orderTtlMinutes || 10));
  const expiresAt = new Date(now.getTime() + ttlMinutes * 60_000);
  const orderId = newOrderId();
  const notePrefix = config.upiNotePrefix || 'VyntrixShop';

  // Standard UPI URI with exact amount and order ID in payment note
  const upiUri = makeUpiUri({
    upiId,
    payeeName,
    amountPaise: payablePaise,
    note: `${notePrefix} ${orderId}`,
  });

  // Create pending order
  await Order.create({
    orderId,
    userId: interaction.user.id,
    username: interaction.user.tag || interaction.user.username || '',
    guildId: interaction.guildId || 'DM',
    guildName: interaction.guild?.name || 'Direct Message',
    type: 'coin_purchase',
    productName: `${coinsToCredit.toLocaleString()} ${coinName()}`,
    amountInr,
    basePricePaise: payablePaise,
    payablePaise,
    coins: coinsToCredit,
    status: 'pending',
    upiUri,
    expiresAt,
    note: `${notePrefix} ${orderId}`,
  });

  // Generate exact QR code image
  const qrBuffer = await QRCode.toBuffer(upiUri, {
    type: 'png',
    width: 420,
    margin: 2,
    errorCorrectionLevel: 'M',
  });
  const file = new AttachmentBuilder(qrBuffer, { name: `upi-${orderId}.png` });

  // Embed without raw UPI ID or payee details (clean & private)
  const embed = new EmbedBuilder()
    .setColor(C.warning)
    .setTitle(`${coinTitleIcon()}  Buy ${coinName()} — Order #${orderId}`)
    .setDescription(
      `Pay **₹${amountInr.toFixed(2)}** using any UPI app to receive **${formatCoins(coinsToCredit)}**.\n` +
      `Scan the QR code below with PhonePe, Google Pay, Paytm, or any UPI app.`
    )
    .addFields(
      { name: '💸 Exact Amount to Pay', value: `**₹${amountInr.toFixed(2)}** (No surcharge)`, inline: true },
      { name: `${coinIcon()} ${coinName()} to Receive`, value: `**${formatCoins(coinsToCredit)}**`, inline: true },
      { name: '📊 Conversion Rate',      value: `1 INR = ${conversionRate} ${coinName()}`,     inline: true },
      { name: '🆔 Order ID',             value: `\`${orderId}\``,                                inline: true },
      { name: '⏰ QR Validity',          value: `<t:${Math.floor(expiresAt.getTime() / 1000)}:R>`, inline: true },
      {
        name: 'ℹ️  Payment Instructions & Verification',
        value:
          `• **Only 1 payment allowed:** Pay only once for this order. Do not pay a 2nd time.\n` +
          `• **Automatic Credit:** ${coinName()} will be credited automatically to your \`/wallet\` once verified via bank notification.\n` +
          `• **QR Validity:** QR disappears after 10 minutes. If unpaid, please pay one time or generate a new order with \`/buycoin\`.`,
        inline: false,
      },
    )
    .setImage(`attachment://upi-${orderId}.png`)
    .setFooter({ text: 'Private Checkout • Scan QR to pay • One-time payment only • 10m validity' })
    .setTimestamp();

  const response = await interaction.editReply({
    embeds: [embed],
    files: [file],
  });

  // Calculate remaining TTL milliseconds to auto-remove QR code from message
  const ttlMs = Math.max(1, expiresAt.getTime() - Date.now());

  setTimeout(async () => {
    try {
      // Check if order was already verified and credited
      const order = await Order.findOne({ orderId });
      if (order && order.status === 'paid') {
        return; // Don't overwrite if already paid and credited
      }

      // Order status remains 'pending' in database (no expired status in DB)

      const expiredEmbed = new EmbedBuilder()
        .setColor(C.warning)
        .setTitle(`⏱️  QR Code Expired — Order #${orderId}`)
        .setDescription(
          `The **QR code for this order has expired and been removed** from the screen.\n\n` +
          `⚠️ **Important Notice:**\n` +
          `• **Only 1 payment allowed:** Make only one payment for this order. **Do NOT pay a 2nd time.**\n` +
          `• **If you already paid:** Please wait a moment. Once verified by the bank, **${formatCoins(coinsToCredit)}** will be credited automatically to your \`/wallet\`.\n` +
          `• **If you haven't paid yet:** Please pay one time or run **\`/buycoin\`** to generate a fresh order.`
        )
        .addFields(
          { name: '🆔 Order ID', value: `\`${orderId}\``, inline: true },
          { name: '💸 Order Amount', value: `₹${amountInr.toFixed(2)}`, inline: true },
          { name: '⏳ Database Status', value: '`PENDING`', inline: true },
        )
        .setFooter({ text: 'QR Expired • One-time payment only • Run /buycoin for new order' })
        .setTimestamp();

      await interaction.editReply({
        embeds: [expiredEmbed],
        files: [],
        attachments: []
      }).catch(() => {});
    } catch (_) {}
  }, ttlMs);

  return response;
}
