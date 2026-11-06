import { SlashCommandBuilder, EmbedBuilder, MessageFlags, PermissionFlagsBits } from 'discord.js';
import mongoose from 'mongoose';
import { ownerOnly, C } from '../../utils/common.js';

export const data = new SlashCommandBuilder()
  .setName('bot-stats')
  .setDescription('View bot runtime performance and server metrics (Bot Owner Only)')
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .setDMPermission(false);

export async function execute(interaction) {
  if (!ownerOnly(interaction)) {
    return interaction.reply({
      content: '❌ This command is strictly restricted to **Bot Owners**.',
      flags: MessageFlags.Ephemeral
    });
  }

  const mem = process.memoryUsage();
  const uptimeSec = Math.floor(process.uptime());
  const hours = Math.floor(uptimeSec / 3600);
  const minutes = Math.floor((uptimeSec % 3600) / 60);
  const seconds = uptimeSec % 60;
  const uptimeStr = `${hours}h ${minutes}m ${seconds}s`;

  const totalServers = interaction.client.guilds.cache.size;
  const totalMembers = interaction.client.guilds.cache.reduce((acc, g) => acc + (g.memberCount || 0), 0);
  const dbStatus = mongoose.connection.readyState === 1 ? '🟢 Connected (MongoDB Atlas)' : '🔴 Disconnected';

  const embed = new EmbedBuilder()
    .setColor(C.brand || 0x7c3aed)
    .setTitle('⚡  Bot Owner Runtime Statistics')
    .addFields(
      { name: '🏰 Servers', value: `\`${totalServers.toLocaleString()}\``, inline: true },
      { name: '👥 Total Members', value: `\`${totalMembers.toLocaleString()}\``, inline: true },
      { name: '⏱️ Uptime', value: `\`${uptimeStr}\``, inline: true },
      { name: '💾 RAM RSS', value: `\`${Math.round(mem.rss / 1024 / 1024)} MB\``, inline: true },
      { name: '🧠 Heap Used', value: `\`${Math.round(mem.heapUsed / 1024 / 1024)} MB\``, inline: true },
      { name: '🏓 WebSocket Ping', value: `\`${Math.round(interaction.client.ws.ping)} ms\``, inline: true },
      { name: '🗄️ Database', value: dbStatus, inline: false },
      { name: '⚙️ Node.js', value: `\`${process.version}\``, inline: true },
      { name: '🤖 Discord.js', value: `\`v14.25.1\``, inline: true }
    )
    .setFooter({ text: 'Bot Owner Security Clearance Verified' })
    .setTimestamp();

  return interaction.reply({
    embeds: [embed],
    flags: MessageFlags.Ephemeral
  });
}

