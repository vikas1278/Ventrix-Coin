import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import {
  ownerOnly, addAdminUser, removeAdminUser, listAllAdmins,
  escapeText, C, ok, err, replyEmbed
} from '../../utils/common.js';

export const data = new SlashCommandBuilder()
  .setName('bot-owner')
  .setDescription('Owner-only administrative controls (Bot Owner Only)')
  .addSubcommand(sub =>
    sub.setName('add-admin')
      .setDescription('Grant bot administrator privileges to a member')
      .addUserOption(o => o.setName('user').setDescription('Target member').setRequired(true))
      .addStringOption(o => o.setName('note').setDescription('Optional note or role info').setRequired(false))
  )
  .addSubcommand(sub =>
    sub.setName('remove-admin')
      .setDescription('Revoke bot administrator privileges from a member')
      .addUserOption(o => o.setName('user').setDescription('Target member').setRequired(true))
  )
  .addSubcommand(sub =>
    sub.setName('list-admins')
      .setDescription('View all bot owners, static admins, and dynamic administrators')
  );

export async function execute(interaction) {
  if (!ownerOnly(interaction)) {
    return replyEmbed(
      interaction,
      err('Access Denied', 'This command is strictly restricted to **Bot Owners**.')
    );
  }

  const subcommand = interaction.options.getSubcommand();

  if (subcommand === 'add-admin') {
    const targetUser = interaction.options.getUser('user');
    const note = interaction.options.getString('note') || '';

    const record = await addAdminUser({
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

  if (subcommand === 'remove-admin') {
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

  if (subcommand === 'list-admins') {
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
}
