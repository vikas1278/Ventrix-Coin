import { SlashCommandBuilder, MessageFlags, PermissionFlagsBits } from 'discord.js';
import { getGameSettings, saveGameSettings } from '../../services/gaming.js';
import { canManageServerGames, coinIcon } from '../../utils/common.js';

export const data = new SlashCommandBuilder()
  .setName('game-settings')
  .setDescription('Configure this server\'s gaming economy (Admin)')
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
  .setDMPermission(false)
  .addIntegerOption(option =>
    option
      .setName('min-bet')
      .setDescription('Minimum allowed bet')
      .setRequired(true)
      .setMinValue(1)
      .setMaxValue(1000000)
  )
  .addIntegerOption(option =>
    option
      .setName('max-bet')
      .setDescription('Maximum allowed bet')
      .setRequired(true)
      .setMinValue(1)
      .setMaxValue(1000000)
  )
  .addIntegerOption(option =>
    option
      .setName('starting-coins')
      .setDescription('Starting coins for newly created wallets in this server')
      .setRequired(false)
      .setMinValue(0)
      .setMaxValue(10000000)
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
      content: '❌ You need **Manage Server** or Administrator permission to configure game settings.',
      flags: MessageFlags.Ephemeral
    });
  }

  const minBet = interaction.options.getInteger('min-bet');
  const maxBet = interaction.options.getInteger('max-bet');
  const startingCoins = interaction.options.getInteger('starting-coins');

  if (minBet > maxBet) {
    return interaction.reply({
      content: '❌ Minimum bet cannot exceed maximum bet.',
      flags: MessageFlags.Ephemeral
    });
  }

  const s = await getGameSettings(interaction.guildId);
  const updates = {
    minBet,
    maxBet
  };
  if (startingCoins !== null && startingCoins !== undefined) {
    updates.startingCoins = startingCoins;
  }

  await saveGameSettings(interaction.guildId, updates, interaction.user.id);

  return interaction.reply({
    content: `✅ **Gaming settings updated for ${interaction.guild.name}:**\n` +
      `• Min Bet: **${minBet.toLocaleString()}** ${coinIcon()}\n` +
      `• Max Bet: **${maxBet.toLocaleString()}** ${coinIcon()}\n` +
      (updates.startingCoins !== undefined ? `• Starting Coins: **${updates.startingCoins.toLocaleString()}** ${coinIcon()}\n` : ''),
    flags: MessageFlags.Ephemeral
  });
}

