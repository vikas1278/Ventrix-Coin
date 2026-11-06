import { SlashCommandBuilder, EmbedBuilder, MessageFlags, PermissionFlagsBits } from 'discord.js';
import { getGameSettings } from '../../services/gaming.js';
import { canManageServerGames, coinIcon, coinName } from '../../utils/common.js';

export const data = new SlashCommandBuilder()
  .setName('server-config')
  .setDescription('View this server\'s gaming economy configuration (Admin)')
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
  .setDMPermission(false);

export async function execute(interaction) {
  if (!interaction.guild) {
    return interaction.reply({
      content: '❌ This command can only be used inside a server.',
      flags: MessageFlags.Ephemeral
    });
  }

  if (!canManageServerGames(interaction)) {
    return interaction.reply({
      content: '❌ You need **Manage Server** or Administrator permission to view server configuration.',
      flags: MessageFlags.Ephemeral
    });
  }

  const s = await getGameSettings(interaction.guildId);
  const disabledList = s.disabledGames && s.disabledGames.length > 0 ? s.disabledGames.join(', ') : 'None (all games enabled)';

  const embed = new EmbedBuilder()
    .setColor(0x7dbbeb)
    .setTitle(`⚙️  Gaming Configuration — ${interaction.guild.name}`)
    .addFields(
      { name: '🪙 Minimum Bet', value: `**${s.minBet.toLocaleString()}** ${coinIcon()}`, inline: true },
      { name: '🪙 Maximum Bet', value: `**${s.maxBet.toLocaleString()}** ${coinIcon()}`, inline: true },
      { name: '🎁 Starting Coins', value: `**${(s.startingCoins || 0).toLocaleString()}** ${coinIcon()}`, inline: true },
      { name: '🎲 Betting Status', value: s.bettingEnabled !== false ? '🟢 Active' : '🔴 Disabled', inline: true },
      { name: '🚫 Disabled Games', value: `\`${disabledList}\``, inline: true }
    )
    .setFooter({ text: `Virtual coins only • ${coinName()}` })
    .setTimestamp();

  return interaction.reply({
    embeds: [embed],
    flags: MessageFlags.Ephemeral
  });
}

