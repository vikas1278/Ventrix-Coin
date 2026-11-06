import { SlashCommandBuilder, MessageFlags, PermissionFlagsBits } from 'discord.js';
import { GAMES } from '../../games/catalog.js';
import { getGameSettings, saveGameSettings } from '../../services/gaming.js';
import { canManageServerGames } from '../../utils/common.js';

export const data = new SlashCommandBuilder()
  .setName('game-toggle')
  .setDescription('Enable or disable specific games in this server (Admin)')
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
  .setDMPermission(false)
  .addStringOption(option =>
    option
      .setName('game')
      .setDescription('Game to toggle')
      .setRequired(true)
      .addChoices(...GAMES.map(g => ({ name: g.name, value: g.id })))
  )
  .addBooleanOption(option =>
    option
      .setName('enabled')
      .setDescription('Enable or disable this game')
      .setRequired(true)
  );

export async function execute(interaction) {
  if (!interaction.guild) {
    return interaction.reply({
      content: '❌ This command can only be used inside a server.',
      flags: MessageFlags.Ephemeral
    });
  }

  if (!canManageServerGames(interaction)) {
    return interaction.reply({
      content: '❌ You need **Manage Server** or Administrator permission to toggle games.',
      flags: MessageFlags.Ephemeral
    });
  }

  const game = interaction.options.getString('game');
  const enabled = interaction.options.getBoolean('enabled');

  const s = await getGameSettings(interaction.guildId);
  const disabled = enabled
    ? (s.disabledGames || []).filter(x => x !== game)
    : [...new Set([...(s.disabledGames || []), game])];

  await saveGameSettings(interaction.guildId, { disabledGames: disabled }, interaction.user.id);

  const gameMeta = GAMES.find(g => g.id === game) || { name: game };
  return interaction.reply({
    content: `🎮 **${gameMeta.name}** is now **${enabled ? '🟢 ENABLED' : '🔴 DISABLED'}** in **${interaction.guild.name}**.`,
    flags: MessageFlags.Ephemeral
  });
}

