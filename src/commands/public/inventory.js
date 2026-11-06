import { SlashCommandBuilder } from 'discord.js';
import { buildInventoryEmbed } from './item.js';
import { checkExpiredRoles } from '../../services/role-expiration.js';

export const data = new SlashCommandBuilder()
  .setName('inventory')
  .setDescription('View your purchased shop inventory items, statuses, and expiration dates');

export async function execute(interaction) {
  // Proactively check expired roles in background
  checkExpiredRoles(interaction.client).catch(() => {});

  const userId = interaction.user.id;
  const guildId = interaction.guildId || 'DM';
  const avatarUrl = interaction.user?.displayAvatarURL ? interaction.user.displayAvatarURL({ extension: 'png', size: 256 }) : null;

  const { embed, row } = await buildInventoryEmbed(userId, guildId, 1, userId, null, avatarUrl);
  const components = row ? [row] : [];

  return interaction.reply({ embeds: [embed], components });
}

export { component } from './item.js';
