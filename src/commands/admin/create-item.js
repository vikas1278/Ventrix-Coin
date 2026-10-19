import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { Product } from '../../models.js';
import { formatCoins, coinIcon, coinName, escapeText, C, err, replyEmbed, adminOnly } from '../../utils/common.js';
import { parseDuration, formatDuration } from '../../utils/duration.js';

export const data = new SlashCommandBuilder()
  .setName('create-item')
  .setDescription('Add a new item to the shop catalogue (admin)')
  .addStringOption(o =>
    o.setName('name')
      .setDescription('Item name')
      .setRequired(true)
  )
  .addIntegerOption(o =>
    o.setName('price')
      .setDescription('Price in coins')
      .setRequired(true)
      .setMinValue(1)
  )
  .addStringOption(o =>
    o.setName('type')
      .setDescription('Item type: Static (permanent) or Timed (expiring)')
      .setRequired(true)
      .addChoices(
        { name: 'Static (Permanent / Manual Claim)', value: 'STATIC' },
        { name: 'Timed (Duration-based Expiration)', value: 'TIMED' },
      )
  )
  .addStringOption(o =>
    o.setName('description')
      .setDescription('Item description and details')
      .setRequired(false)
  )
  .addStringOption(o =>
    o.setName('duration')
      .setDescription('Duration for timed items (e.g. 1m, 1h, 7d, 30d, 2h30m)')
      .setRequired(false)
  )
  .addRoleOption(o =>
    o.setName('role')
      .setDescription('Discord role associated with this item')
      .setRequired(false)
  )
  .addIntegerOption(o =>
    o.setName('stock')
      .setDescription('Available quantity limit (leave empty for unlimited)')
      .setMinValue(1)
      .setRequired(false)
  )
  .addStringOption(o =>
    o.setName('image')
      .setDescription('Public HTTPS image URL')
      .setRequired(false)
  );

export async function execute(interaction) {
  if (!adminOnly(interaction)) {
    return replyEmbed(interaction, err('Access Denied', 'This command is restricted to administrators.'));
  }

  const name = interaction.options.getString('name').trim();
  const price = interaction.options.getInteger('price');
  const type = interaction.options.getString('type');
  const description = interaction.options.getString('description') || '';
  const rawDuration = interaction.options.getString('duration')?.trim() || '';
  const role = interaction.options.getRole('role');
  const stock = interaction.options.getInteger('stock');
  const imageUrl = interaction.options.getString('image') || '';

  if (imageUrl && !/^https:\/\//i.test(imageUrl)) {
    return replyEmbed(interaction, err('Invalid Image URL', 'The image URL must start with `https://`.'));
  }

  let durationMs = 0;
  let formattedDuration = '';

  if (type === 'TIMED') {
    if (!rawDuration) {
      return replyEmbed(
        interaction,
        err(
          'Duration Required for Timed Items',
          'Please specify a valid duration for Timed items (e.g. `1m`, `10m`, `1h`, `12h`, `1d`, `7d`, `30d`, `45d`, `2h30m`).'
        )
      );
    }
    const parsed = parseDuration(rawDuration);
    if (!parsed) {
      return replyEmbed(
        interaction,
        err(
          'Invalid Duration Format',
          `\`${rawDuration}\` is not a valid duration format.\nExamples: \`1m\` (1 minute), \`1h\` (1 hour), \`7d\` (7 days), \`30d\` (30 days), \`2h30m\` (2 hours 30 mins).`
        )
      );
    }
    durationMs = parsed;
    formattedDuration = formatDuration(durationMs);
  }

  // Determine behavior type
  let behaviorType = 'manual_claim';
  if (role) {
    behaviorType = type === 'TIMED' ? 'role_temporary' : 'role_permanent';
  } else if (type === 'TIMED') {
    behaviorType = 'consumable';
  } else {
    behaviorType = 'manual_claim';
  }

  const product = await Product.create({
    guildId: interaction.guildId || 'global',
    name,
    description,
    imageUrl,
    coins: price,
    type,
    behaviorType,
    duration: formattedDuration || rawDuration,
    durationMs,
    roleId: role?.id || null,
    stock: stock ?? null,
    createdBy: interaction.user.id,
  });

  const behaviorLabel = {
    role_permanent: `🎖️ Permanent Role (<@&${role?.id}>)`,
    role_temporary: `⏳ Temporary Role (<@&${role?.id}> • ${formattedDuration})`,
    manual_claim: '📋 Manual Claim Required (Support Ticket)',
    consumable: `📦 Consumable Reward (${formattedDuration ? formattedDuration : 'Instant'})`,
  }[behaviorType];

  const createdEmbed = new EmbedBuilder()
    .setColor(C.success)
    .setTitle(`✅  Shop Item Created — ${escapeText(product.name)}`)
    .setDescription(escapeText(product.description || 'No description provided.'))
    .addFields(
      { name: `${coinIcon()} ${coinName()}`, value: `**${formatCoins(product.coins)}**`, inline: true },
      { name: '🏷️ Type', value: `**${product.type}**`, inline: true },
      { name: '📦 Stock', value: product.stock != null ? `**${product.stock} left**` : '`Unlimited`', inline: true },
      { name: '⚙️ Behavior', value: behaviorLabel, inline: false },
      { name: '🆔 Product ID', value: `\`${product._id}\``, inline: true },
    )
    .setFooter({ text: 'Item is live in shop catalogue • Users can purchase with /buyitem' })
    .setTimestamp();

  if (product.duration && product.type === 'TIMED') {
    createdEmbed.addFields({ name: '⏱️ Duration', value: `\`${product.duration}\``, inline: true });
  }

  if (product.imageUrl) createdEmbed.setThumbnail(product.imageUrl);

  return replyEmbed(interaction, createdEmbed);
}
