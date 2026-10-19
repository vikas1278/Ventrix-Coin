import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { Product } from '../../models.js';
import { formatCoins, coinIcon, coinName, escapeText, C, err, replyEmbed, adminOnly } from '../../utils/common.js';
import { parseDuration, formatDuration } from '../../utils/duration.js';

export const data = new SlashCommandBuilder()
  .setName('edit-item')
  .setDescription('Edit an existing shop item (admin)')
  .addStringOption(o =>
    o.setName('id')
      .setDescription('Select item or enter Product ID')
      .setRequired(true)
      .setAutocomplete(true)
  )
  .addStringOption(o => o.setName('name').setDescription('New item name').setRequired(false))
  .addIntegerOption(o => o.setName('price').setDescription('New price in coins').setMinValue(1).setRequired(false))
  .addStringOption(o =>
    o.setName('type')
      .setDescription('New item type')
      .setRequired(false)
      .addChoices(
        { name: 'Static (Permanent / Manual Claim)', value: 'STATIC' },
        { name: 'Timed (Duration-based Expiration)', value: 'TIMED' },
      )
  )
  .addStringOption(o => o.setName('duration').setDescription('New duration (e.g. 7d, 30d, 2h30m)').setRequired(false))
  .addRoleOption(o => o.setName('role').setDescription('New Discord role associated with item').setRequired(false))
  .addIntegerOption(o => o.setName('stock').setDescription('New stock limit (use 0 for out of stock, -1 for unlimited)').setRequired(false))
  .addStringOption(o => o.setName('description').setDescription('New description').setRequired(false))
  .addStringOption(o => o.setName('image').setDescription('New image URL').setRequired(false));

export async function execute(interaction) {
  if (!adminOnly(interaction)) {
    return replyEmbed(interaction, err('Access Denied', 'This command is restricted to administrators.'));
  }

  const filter = { _id: interaction.options.getString('id') };
  if (interaction.guildId) filter.guildId = { $in: [interaction.guildId, 'global'] };
  const p = await Product.findOne(filter);
  if (!p) {
    return replyEmbed(interaction, err('Not Found', 'No product found with that ID in this server.'));
  }

  const n = interaction.options.getString('name');
  const price = interaction.options.getInteger('price');
  const type = interaction.options.getString('type');
  const rawDuration = interaction.options.getString('duration');
  const role = interaction.options.getRole('role');
  const stock = interaction.options.getInteger('stock');
  const image = interaction.options.getString('image');
  const desc = interaction.options.getString('description');

  if (n !== null) p.name = n.trim();
  if (price !== null) p.coins = price;
  if (desc !== null) p.description = desc;

  if (image !== null) {
    if (image && !/^https:\/\//i.test(image)) {
      return replyEmbed(interaction, err('Invalid Image URL', 'The image URL must start with `https://`.'));
    }
    p.imageUrl = image;
  }

  if (type !== null) {
    p.type = type;
  }

  if (rawDuration !== null) {
    const trimmed = rawDuration.trim();
    if (trimmed) {
      const parsed = parseDuration(trimmed);
      if (!parsed) {
        return replyEmbed(
          interaction,
          err('Invalid Duration Format', `\`${trimmed}\` is invalid. Examples: \`1m\`, \`1h\`, \`7d\`, \`30d\`, \`2h30m\`.`)
        );
      }
      p.duration = formatDuration(parsed);
      p.durationMs = parsed;
    } else {
      p.duration = '';
      p.durationMs = 0;
    }
  }

  if (role !== null) {
    p.roleId = role.id;
  }

  if (stock !== null) {
    p.stock = stock < 0 ? null : stock;
  }

  // Update behavior type based on current or new attributes
  if (p.roleId) {
    p.behaviorType = p.type === 'TIMED' ? 'role_temporary' : 'role_permanent';
  } else if (p.type === 'TIMED') {
    p.behaviorType = 'consumable';
  } else {
    p.behaviorType = 'manual_claim';
  }

  await p.save();

  const embed = new EmbedBuilder()
    .setColor(C.brand)
    .setTitle(`✅  Item Updated — ${escapeText(p.name)}`)
    .setDescription(escapeText(p.description || 'No description provided.'))
    .addFields(
      { name: `${coinIcon()} ${coinName()}`, value: `**${formatCoins(p.coins)}**`, inline: true },
      { name: '🏷️ Type', value: `**${p.type || 'STATIC'}**`, inline: true },
      { name: '📦 Stock', value: p.stock != null ? `**${p.stock} left**` : '`Unlimited`', inline: true },
      { name: '🆔 Product ID', value: `\`${p._id}\``, inline: true },
    )
    .setFooter({ text: 'Updated in shop catalogue • Existing purchased items remain unaffected' })
    .setTimestamp();

  if (p.duration && p.type === 'TIMED') {
    embed.addFields({ name: '⏱️ Duration', value: `\`${p.duration}\``, inline: true });
  }

  if (p.roleId) {
    embed.addFields({ name: '🎖️ Role', value: `<@&${p.roleId}>`, inline: true });
  }

  if (p.imageUrl) embed.setThumbnail(p.imageUrl);

  return replyEmbed(interaction, embed);
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
      name: `🛍️ ${p.name} — ${formatCoins(p.coins)} (${p.type || 'STATIC'}) (ID: ${String(p._id).slice(-6)})`.slice(0, 100),
      value: String(p._id),
    }))
  );
}
