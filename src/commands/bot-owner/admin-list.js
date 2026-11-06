import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { ownerOnly, listAllAdmins, escapeText, C, err, replyEmbed } from '../../utils/common.js';

export const data = new SlashCommandBuilder()
  .setName('admin-list')
  .setDescription('View all bot owners and administrators (Bot Owner Only)')
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .setDMPermission(false);

export async function execute(interaction) {
  if (!ownerOnly(interaction)) {
    return replyEmbed(
      interaction,
      err('Access Denied', 'This command is strictly restricted to **Bot Owners**.')
    );
  }

  const { owners, dbAdmins } = await listAllAdmins();

  const ownerLines = owners.length
    ? owners.map(id => `• 👑 <@${id}> (\`${id}\`)`).join('\n')
    : '*No bot owners configured in .env.*';

  const dbLines = dbAdmins.length
    ? dbAdmins.map(a => `• 🛡️ <@${a.userId}> (\`${a.userId}\`) — Added by: *${escapeText(a.addedBy)}*${a.note ? ` (${escapeText(a.note)})` : ''}`).join('\n')
    : '*No administrators added yet. Use `/admin-add` to add.*';

  const embed = new EmbedBuilder()
    .setColor(C.brand)
    .setTitle('👑  Bot Owners & Administrators')
    .setDescription('Hierarchical access list for this bot:')
    .addFields(
      { name: `👑 Bot Owners (${owners.length})`,        value: ownerLines, inline: false },
      { name: `🛡️ Bot Administrators (${dbAdmins.length})`, value: dbLines,    inline: false },
    )
    .setFooter({ text: 'Bot Owners have full super-admin access across all commands' })
    .setTimestamp();

  return replyEmbed(interaction, embed);
}
