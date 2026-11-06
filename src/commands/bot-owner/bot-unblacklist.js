import { SlashCommandBuilder, MessageFlags, PermissionFlagsBits } from 'discord.js';
import { Blacklist } from '../../models.js';
import { ownerOnly } from '../../utils/common.js';

export const data = new SlashCommandBuilder()
  .setName('bot-unblacklist')
  .setDescription('Remove a server from the blacklist (Bot Owner Only)')
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .setDMPermission(false)
  .addStringOption(option =>
    option
      .setName('guild-id')
      .setDescription('The 17-20 digit Discord Server ID to unblacklist')
      .setRequired(true)
  );

export async function execute(interaction) {
  if (!ownerOnly(interaction)) {
    return interaction.reply({
      content: '❌ This command is strictly restricted to **Bot Owners**.',
      flags: MessageFlags.Ephemeral
    });
  }

  const guildId = interaction.options.getString('guild-id').trim();
  const deleted = await Blacklist.findOneAndDelete({ guildId });

  if (!deleted) {
    return interaction.reply({
      content: `ℹ️ Server ID \`${guildId}\` is not currently blacklisted.`,
      flags: MessageFlags.Ephemeral
    });
  }

  return interaction.reply({
    content: `✅ Server ID \`${guildId}\` has been **removed from the blacklist**.`,
    flags: MessageFlags.Ephemeral
  });
}

