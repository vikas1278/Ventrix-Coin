import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags } from 'discord.js';
import config from '../../config.js';
import { isOwner, isAdmin } from '../../utils/common.js';

export const data = new SlashCommandBuilder()
  .setName('dashboard')
  .setDescription('Get direct link to the Web Dashboard & Online Control Center');

export async function execute(interaction) {
  const shopName = config.shopName || 'Ventrix Coin Shop';
  const role = isOwner(interaction.user.id) ? '👑 Bot Owner' : isAdmin(interaction.user.id) ? '🛡️ Admin' : '👛 Member';

  // Construct URL
  const host =
    process.env.DASHBOARD_URL ||
    (process.env.RENDER_EXTERNAL_HOSTNAME ? `https://${process.env.RENDER_EXTERNAL_HOSTNAME}` : 'http://localhost:10000');

  const embed = new EmbedBuilder()
    .setColor(0x8b5cf6)
    .setTitle(`🌐  ${shopName} — Web Dashboard`)
    .setDescription(
      `Welcome <@${interaction.user.id}>! You can access the **Full Online Web Dashboard** directly in your browser:\n\n` +
      `👛 **For Members:**\n` +
      `• View real-time coin wallet & transaction history\n` +
      `• Top up coins with instant UPI QR payments\n` +
      `• Browse the shop catalog & buy items\n\n` +
      `🛡️ **For Admins & Owners:**\n` +
      `• 1-Click UPI payment approvals & rejections\n` +
      `• Manage shop items (create, edit, stock, delete)\n` +
      `• Adjust user coin balances & configure exchange rates\n` +
      `• Manage bot admins & monitor server health\n\n` +
      `👉 **Your Role:** **${role}**\n\n` +
      `🌐 *Click the button below to open the Web Dashboard in your browser.*`
    )
    .setFooter({ text: 'Ventrix Web Control Center' })
    .setTimestamp();

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setLabel('🌐 Open Web Dashboard')
      .setStyle(ButtonStyle.Link)
      .setURL(host)
  );

  await interaction.reply({
    embeds: [embed],
    components: [row],
    flags: MessageFlags.Ephemeral,
  });
}
