import { SlashCommandBuilder, MessageFlags, PermissionFlagsBits } from 'discord.js';
import { ownerOnly } from '../../utils/common.js';

export const data = new SlashCommandBuilder()
  .setName('bot-guilds')
  .setDescription('List connected Discord server IDs (Bot Owner Only)')
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .setDMPermission(false);

export async function execute(interaction) {
  if (!ownerOnly(interaction)) {
    return interaction.reply({
      content: '❌ This command is strictly restricted to **Bot Owners**.',
      flags: MessageFlags.Ephemeral
    });
  }

  const list = interaction.client.guilds.cache.map(g => `• **${g.name}** — \`${g.id}\` (${(g.memberCount || 0).toLocaleString()} members)`).slice(0, 30);

  return interaction.reply({
    content: list.length > 0
      ? `🌐 **Connected Discord Servers (${interaction.client.guilds.cache.size}):**\n\n` + list.join('\n') + `\n\n💡 *For full pagination and server management, use \`/server list\`.*`
      : 'No servers currently connected.',
    flags: MessageFlags.Ephemeral
  });
}

