import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { ownerOnly, removeAdminUser, ok, err, replyEmbed } from '../../utils/common.js';

export const data = new SlashCommandBuilder()
  .setName('admin-remove')
  .setDescription('Revoke administrator privileges from a member (Bot Owner Only)')
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .setDMPermission(false)
  .addUserOption(o => o.setName('user').setDescription('Target member').setRequired(true));

export async function execute(interaction) {
  if (!ownerOnly(interaction)) {
    return replyEmbed(
      interaction,
      err('Access Denied', 'This command is strictly restricted to **Bot Owners**.')
    );
  }

  const targetUser = interaction.options.getUser('user');
  const removed = await removeAdminUser(targetUser.id);

  if (!removed) {
    return replyEmbed(
      interaction,
      err('Not Found', `<@${targetUser.id}> is not in the dynamic administrators database.`)
    );
  }

  const embed = ok(
    'Administrator Removed',
    `Revoked bot administrator privileges from <@${targetUser.id}> (\`${targetUser.id}\`).`
  ).addFields(
    { name: '👤 Removed Member', value: `<@${targetUser.id}>`, inline: true },
    { name: '🛡️ Revoked By',     value: `<@${interaction.user.id}>`, inline: true },
  );

  return replyEmbed(interaction, embed);
}
