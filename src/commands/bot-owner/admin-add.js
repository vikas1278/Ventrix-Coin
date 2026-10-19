import { SlashCommandBuilder } from 'discord.js';
import { ownerOnly, addAdminUser, escapeText, ok, err, replyEmbed } from '../../utils/common.js';

export const data = new SlashCommandBuilder()
  .setName('admin-add')
  .setDescription('Add a new administrator to the bot (Bot Owner Only)')
  .addUserOption(o => o.setName('user').setDescription('Target member').setRequired(true))
  .addStringOption(o => o.setName('note').setDescription('Optional note or role info').setRequired(false));

export async function execute(interaction) {
  if (!ownerOnly(interaction)) {
    return replyEmbed(
      interaction,
      err('Access Denied', 'This command is strictly restricted to **Bot Owners**.')
    );
  }

  const targetUser = interaction.options.getUser('user');
  const note = interaction.options.getString('note') || '';

  await addAdminUser({
    userId: targetUser.id,
    username: targetUser.tag || targetUser.username,
    addedBy: interaction.user.tag || interaction.user.id,
    note,
  });

  const embed = ok(
    'Administrator Added',
    `Successfully granted bot administrator privileges to <@${targetUser.id}> (\`${targetUser.id}\`).`
  ).addFields(
    { name: '👤 Admin User', value: `<@${targetUser.id}> (\`${targetUser.tag || targetUser.username}\`)`, inline: true },
    { name: '🛡️ Granted By', value: `<@${interaction.user.id}>`, inline: true },
    { name: '📝 Note',       value: escapeText(note || 'No note provided'), inline: false },
  );

  return replyEmbed(interaction, embed);
}
