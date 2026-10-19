import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { Product } from '../../models.js';
import { formatCoins, escapeText, C, err, replyEmbed, adminOnly } from '../../utils/common.js';

export const data = new SlashCommandBuilder()
  .setName('delete-item')
  .setDescription('Deactivate an item from the shop (admin)')
  .addStringOption(o => o.setName('id').setDescription('Select item or enter Product ID').setRequired(true).setAutocomplete(true));

export async function execute(interaction) {
  if (!adminOnly(interaction)) {
    return replyEmbed(interaction, err('Access Denied', 'This command is restricted to administrators.'));
  }

  const filter = { _id: interaction.options.getString('id') };
  if (interaction.guildId) filter.guildId = { $in: [interaction.guildId, 'global'] };
  const p = await Product.findOneAndUpdate(
    filter,
    { active: false },
    { new: true }
  );
  if (!p) {
    return replyEmbed(interaction, err('Not Found', 'No product found with that ID in this server.'));
  }

  return replyEmbed(
    interaction,
    new EmbedBuilder()
      .setColor(C.danger)
      .setTitle('🗑️  Item Deactivated')
      .setDescription(`**${escapeText(p.name)}** has been removed from the shop catalogue.\n*Existing user inventories and purchase histories remain safely preserved.*`)
      .setFooter({ text: `Product ID: ${p._id} • Soft-deactivated` })
      .setTimestamp()
  );
}

export async function autocomplete(interaction) {
  const focused = interaction.options.getFocused(true);
  const query = String(focused.value || '').trim().toLowerCase();
  const filter = { active: true };
  if (interaction.guildId) filter.guildId = { $in: [interaction.guildId, 'global'] };

  const products = await Product.find(filter).sort({ createdAt: -1 }).limit(25).lean();

  const filtered = products
    .filter(p =>
      !query ||
      p.name.toLowerCase().includes(query) ||
      String(p._id).toLowerCase().includes(query)
    )
    .slice(0, 25);

  return interaction.respond(
    filtered.map(p => ({
      name: `🛍️ ${p.name} — ${formatCoins(p.coins)} (ID: ${String(p._id).slice(-6)})`.slice(0, 100),
      value: String(p._id),
    }))
  );
}
