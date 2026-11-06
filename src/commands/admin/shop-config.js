import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { Product, Order } from '../../models.js';
import config from '../../config.js';
import { getCoinRate, coinIcon, coinName, C, err, replyEmbed, adminOnly } from '../../utils/common.js';

export const data = new SlashCommandBuilder()
  .setName('shop-config')
  .setDescription('Show shop setup status, conversion rate, and payment health (admin)')
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .setDMPermission(false);

export async function execute(interaction) {
  if (!adminOnly(interaction)) {
    return replyEmbed(interaction, err('Access Denied', 'This command is restricted to administrators.'));
  }

  const upiOk = Boolean(config.upiId);
  const payeeOk = Boolean(config.upiPayeeName);
  const gmailOk = Boolean(
    process.env.GMAIL_CLIENT_ID && process.env.GMAIL_CLIENT_SECRET && process.env.GMAIL_REFRESH_TOKEN
  );
  const senderOk = Boolean(
    process.env.SLICE_ALLOWED_SENDER && process.env.SLICE_ALLOWED_SENDER !== 'notifications@example.com'
  );
  const tick = v => v ? '✅' : '❌';

  const guildId = interaction.guildId;
  const productFilter = { active: true };
  const orderFilter = {};
  if (guildId) {
    productFilter.guildId = { $in: [guildId, 'global'] };
    orderFilter.guildId = guildId;
  }

  const currentRate = await getCoinRate(guildId);
  const activeItemsCount = await Product.countDocuments(productFilter);
  const pendingOrdersCount = await Order.countDocuments({ ...orderFilter, status: 'pending' });
  const reviewOrdersCount = await Order.countDocuments({ ...orderFilter, status: 'review' });

  const embed = new EmbedBuilder()
    .setColor(C.muted)
    .setTitle('⚙️  Vyntrix Shop Configuration')
    .addFields(
      { name: `${coinIcon()} Conversion Rate`, value: `**1 INR = ${currentRate} ${coinName()}**`, inline: true },
      { name: '🛍️ Active Catalogue Items',  value: `**${activeItemsCount} items**`,      inline: true },
      { name: '⏳ Pending / Review Orders', value: `${pendingOrdersCount} pending / ${reviewOrdersCount} review`, inline: true },
      { name: `${tick(upiOk)}  UPI ID`,     value: upiOk ? `\`${config.upiId}\`` : 'Not set', inline: true },
      { name: `${tick(payeeOk)}  Payee Name`, value: payeeOk ? config.upiPayeeName : 'Not set', inline: true },
      { name: `${tick(gmailOk)}  Gmail OAuth`, value: gmailOk ? 'Configured' : 'Not configured', inline: true },
      { name: `${tick(senderOk)}  Slice Sender`, value: senderOk ? `\`${process.env.SLICE_ALLOWED_SENDER}\`` : 'Default / Not set', inline: false },
    )
    .setFooter({ text: 'Use /set-rate to change conversion rate • Keep credentials secure' })
    .setTimestamp();

  return replyEmbed(interaction, embed);
}
