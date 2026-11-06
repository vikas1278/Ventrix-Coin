import {
  SlashCommandBuilder,
  ContainerBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder,
  MessageFlags
} from 'discord.js';
import { Product } from '../../models.js';
import { formatCoins, coinName, config, escapeText } from '../../utils/common.js';
import { buildInventoryEmbed } from './item.js';

export const data = new SlashCommandBuilder()
  .setName('shop')
  .setDescription('Browse available shop items, prices, stock, and details');

const ITEMS_PER_PAGE = 8;
const TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes timeout

// ─── Discord Components V2 Card Builder (No Images) ──────────────────────────
function buildV2Card(title, sections, actionRows = [], accentColor = 0x00e5ff) {
  const container = new ContainerBuilder()
    .setAccentColor(accentColor)
    .addTextDisplayComponents(textDisplay => textDisplay.setContent(`## ${title}`));

  for (const section of sections) {
    container
      .addSeparatorComponents(separator => separator)
      .addTextDisplayComponents(textDisplay => textDisplay.setContent(section));
  }

  if (actionRows.length) {
    container
      .addSeparatorComponents(separator => separator)
      .addActionRowComponents(actionRows);
  }

  return container;
}

// ─── Shop Catalogue View (Components V2) ──────────────────────────────────────
export async function buildShopCatalogueEmbed(guildIdOrPage = null, pageNumber = 1, isDisabled = false, authorId = null) {
  let guildId = null;
  let page = pageNumber;
  if (typeof guildIdOrPage === 'number') {
    page = guildIdOrPage;
  } else {
    guildId = guildIdOrPage;
  }

  const filter = { active: true };
  if (guildId && guildId !== 'DM') {
    filter.guildId = { $in: [guildId, 'global'] };
  }

  const totalItems = await Product.countDocuments(filter);
  const totalPages = Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE));
  const currentPage = Math.min(Math.max(1, page), totalPages);

  if (totalItems === 0) {
    const emptySections = [
      `### 🎒 Shop Catalogue is Empty\nNo items are currently listed in this server's shop. Ask an administrator to add items with \`/create-item\`!`,
      `🔍 **Quick try:** \`/buycoin\` • \`/wallet\` • \`/help\``
    ];
    const emptyCard = buildV2Card(
      `🛍️ ${config.shopName || 'Vyntrix Shop Catalogue'}`,
      emptySections,
      [],
      0x00e5ff
    );
    return { card: emptyCard, totalPages: 1, currentPage: 1 };
  }

  const items = await Product.find(filter)
    .sort({ createdAt: -1 })
    .skip((currentPage - 1) * ITEMS_PER_PAGE)
    .limit(ITEMS_PER_PAGE)
    .lean();

  // All active items in catalogue for the dropdown (up to 25 items)
  const allDropdownItems = await Product.find(filter)
    .sort({ createdAt: -1 })
    .limit(25)
    .lean();

  // Exact Requested Format:
  // Item • VIP  <:coin:...> 20 coins  • ⏱️ Duration: 20m  • 📦 Stock: 1 left
  const formattedItems = items.map(item => {
    const durationText = item.duration ? item.duration : 'Permanent';
    const stockText = item.stock != null
      ? (item.stock > 0 ? `${item.stock} left` : 'Out of Stock')
      : 'Unlimited';

    return `Item • **${escapeText(item.name)}**  **${formatCoins(item.coins)}**  • ⏱️ Duration: **${durationText}**  • 📦 Stock: **${stockText}**`;
  }).join('\n\n');

  const sections = [
    `Use \`/buycoin\` to top up coins • \`/buyitem <name>\` to purchase`,
    `### 🛒 Available Items (${totalItems})\n${formattedItems}`
  ];

  if (isDisabled) {
    sections.push(`⌛ *This shop menu has timed out. Run \`/shop\` to browse again.*`);
  }

  const actionRows = [];

  // Dropdown Select Menu to inspect item full details
  if (allDropdownItems.length > 0) {
    const selectOptions = allDropdownItems.map(item => {
      const stockBadge = item.stock != null ? (item.stock > 0 ? `${item.stock} left` : 'Out of stock') : 'Unlimited';
      return {
        label: item.name.slice(0, 100),
        description: `${item.coins} ${coinName()} • ${item.duration || 'Permanent'} • Stock: ${stockBadge}`.slice(0, 100),
        value: String(item._id),
        emoji: item.roleId ? '🎖️' : '🛍️',
      };
    });

    const selectMenuRow = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId(authorId ? `shop_${authorId}_select_item` : 'shop_select_item')
        .setPlaceholder(isDisabled ? '⌛ Menu expired' : 'Select an item to view details...')
        .setDisabled(isDisabled)
        .addOptions(selectOptions)
    );

    actionRows.push(selectMenuRow);
  }

  // Pagination & Inventory buttons row
  const paginationRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(authorId ? `shop_${authorId}_page_${currentPage - 1}` : `shop_page_${currentPage - 1}`)
      .setLabel('◀️ Previous')
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(isDisabled || currentPage <= 1),
    new ButtonBuilder()
      .setCustomId(authorId ? `shop_${authorId}_page_info` : 'shop_page_info')
      .setLabel(`Page ${currentPage} of ${totalPages}`)
      .setStyle(ButtonStyle.Primary)
      .setDisabled(true),
    new ButtonBuilder()
      .setCustomId(authorId ? `shop_${authorId}_page_${currentPage + 1}` : `shop_page_${currentPage + 1}`)
      .setLabel('Next ▶️')
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(isDisabled || currentPage >= totalPages),
    new ButtonBuilder()
      .setCustomId(authorId ? `shop_${authorId}_view_inventory` : 'shop_view_inventory')
      .setLabel('My Inventory')
      .setEmoji('🎒')
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(isDisabled)
  );
  actionRows.push(paginationRow);

  const card = buildV2Card(
    `🛍️ ${config.shopName || 'Vyntrix Shop Catalogue'}`,
    sections,
    actionRows,
    0x00e5ff
  );

  return { card, totalPages, currentPage };
}

// ─── Item Details View (Components V2 Card) ───────────────────────────────────
export async function buildItemDetailsCard(itemId, guildId = null, isDisabled = false, authorId = null) {
  const filter = { _id: itemId };
  if (guildId && guildId !== 'DM') {
    filter.guildId = { $in: [guildId, 'global'] };
  }

  const item = await Product.findOne(filter).lean();
  if (!item) {
    return null;
  }

  const durationText = item.duration ? item.duration : 'Permanent (Never expires)';
  const stockText = item.stock != null
    ? (item.stock > 0 ? `${item.stock} left in stock` : 'Out of Stock')
    : 'Unlimited Stock';

  const roleText = item.roleId
    ? `• **Role Reward:** <@&${item.roleId}> *(Granted automatically upon \`/item use\`)*\n`
    : '';

  const claimText = item.behaviorType === 'manual_claim'
    ? `• **Claim Type:** 📋 **Manual Claim Required** *(Staff ticket required)*\n`
    : '';

  const sections = [
    [
      `### 🛒 Item Information`,
      `• **Name:** **${escapeText(item.name)}**`,
      `• **Price:** **${formatCoins(item.coins)}**`,
      `• **Type:** **${item.type || 'STATIC'}**`,
      `• **Duration:** ⏱️ **${durationText}**`,
      `• **Stock:** 📦 **${stockText}**`
    ].join('\n'),

    [
      `### ⚙️ Delivery & Reward`,
      roleText +
      claimText +
      `• **Product ID:** \`${item._id}\``
    ].filter(Boolean).join('\n'),

    [
      `### 📝 Description`,
      `> ${escapeText(item.description || 'No description provided for this item.')}`
    ].join('\n'),

    [
      `### 💳 How to Buy & Use`,
      `1️⃣ Top up ${coinName()}: \`/buycoin\``,
      `2️⃣ Purchase: **\`/buyitem item:${escapeText(item.name)}\`** *(or using ID \`${item._id}\`)*`,
      `3️⃣ Use/Activate: Check your **\`/item list\`** and run **\`/item use\`**!`
    ].join('\n')
  ];

  // Fetch all active items for quick-switching in the select menu
  const allDropdownItems = await Product.find({ active: true, ...(guildId && guildId !== 'DM' ? { guildId: { $in: [guildId, 'global'] } } : {}) })
    .sort({ createdAt: -1 })
    .limit(25)
    .lean();

  const actionRows = [];

  if (allDropdownItems.length > 0) {
    const selectOptions = allDropdownItems.map(p => ({
      label: p.name.slice(0, 100),
      description: `${p.coins} ${coinName()} • ${p.duration || 'Permanent'} • Stock: ${p.stock != null ? p.stock : 'Unlimited'}`.slice(0, 100),
      value: String(p._id),
      default: String(p._id) === String(item._id),
      emoji: p.roleId ? '🎖️' : '🛍️',
    }));

    const selectMenuRow = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId(authorId ? `shop_${authorId}_select_item` : 'shop_select_item')
        .setPlaceholder(isDisabled ? '⌛ Menu expired' : 'Select another item...')
        .setDisabled(isDisabled)
        .addOptions(selectOptions)
    );

    actionRows.push(selectMenuRow);
  }

  // Navigation button row
  const buttonRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(authorId ? `shop_${authorId}_back_catalogue` : 'shop_back_catalogue')
      .setLabel('Back to Catalogue')
      .setEmoji('◀️')
      .setStyle(ButtonStyle.Primary)
      .setDisabled(isDisabled),
    new ButtonBuilder()
      .setCustomId(authorId ? `shop_${authorId}_view_inventory` : 'shop_view_inventory')
      .setLabel('My Inventory')
      .setEmoji('🎒')
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(isDisabled)
  );
  actionRows.push(buttonRow);

  const card = buildV2Card(
    `🏷️ ${item.name} — Full Details`,
    sections,
    actionRows,
    0x00e5ff
  );

  return { card };
}

// ─── Unified Sender for Components V2 ─────────────────────────────────────────
function sendShopResponse(interaction, card) {
  const response = {
    components: [card],
    flags: MessageFlags.IsComponentsV2
  };

  if (interaction.deferred || interaction.replied) {
    return interaction.editReply(response);
  }

  if (interaction.isButton?.() || interaction.isStringSelectMenu?.()) {
    return interaction.update(response);
  }

  return interaction.reply(response);
}

// ─── Slash Command Execution ──────────────────────────────────────────────────
export async function execute(interaction) {
  const guildId = interaction.guildId || 'DM';
  const authorId = interaction.user.id;
  const { card } = await buildShopCatalogueEmbed(guildId, 1, false, authorId);

  await interaction.reply({
    components: [card],
    flags: MessageFlags.IsComponentsV2
  });
  const reply = await interaction.fetchReply();

  // Attach a 5-minute timeout collector to disable buttons & dropdown
  const collector = reply.createMessageComponentCollector({
    time: TIMEOUT_MS
  });

  collector.on('end', async (_, reason) => {
    if (reason === 'time') {
      try {
        const { card: expiredCard } = await buildShopCatalogueEmbed(guildId, 1, true, authorId);
        await interaction.editReply({
          components: [expiredCard],
          flags: MessageFlags.IsComponentsV2
        }).catch(() => {});
      } catch (_) {}
    }
  });
}

// ─── Component Interactions Router ────────────────────────────────────────────
export async function component(interaction) {
  const guildId = interaction.guildId || 'DM';

  // Check 5-minute timeout guard
  const msgAge = Date.now() - interaction.message.createdTimestamp;
  if (msgAge > TIMEOUT_MS) {
    return interaction.reply({
      content: '⏱️ This shop menu has timed out after 5 minutes. Please run `/shop` again.',
      flags: MessageFlags.Ephemeral
    });
  }

  // Parse authorId from customId or message metadata
  const parts = interaction.customId.split('_');
  let authorId = null;
  if (parts.length >= 3 && /^\d{16,21}$/.test(parts[1])) {
    authorId = parts[1];
  } else if (interaction.message?.interactionMetadata?.user?.id) {
    authorId = interaction.message.interactionMetadata.user.id;
  } else if (interaction.message?.interaction?.user?.id) {
    authorId = interaction.message.interaction.user.id;
  }

  // Restrict interactions strictly to the user who ran /shop
  if (authorId && interaction.user.id !== authorId) {
    return interaction.reply({
      content: '❌ Only the user who ran `/shop` can interact with this shop menu. Run `/shop` to open your own catalogue!',
      flags: MessageFlags.Ephemeral
    });
  }

  // 1. Dropdown select menu to view item full details
  if (interaction.isStringSelectMenu() && interaction.customId.includes('select_item')) {
    const selectedItemId = interaction.values[0];
    const details = await buildItemDetailsCard(selectedItemId, guildId, false, authorId);
    if (!details) {
      const { card } = await buildShopCatalogueEmbed(guildId, 1, false, authorId);
      return sendShopResponse(interaction, card);
    }
    return sendShopResponse(interaction, details.card);
  }

  // 2. Back to Catalogue Button
  if (interaction.isButton() && interaction.customId.includes('back_catalogue')) {
    const { card } = await buildShopCatalogueEmbed(guildId, 1, false, authorId);
    return sendShopResponse(interaction, card);
  }

  // 3. View Inventory Button (Always Private / Ephemeral)
  if (interaction.isButton() && interaction.customId.includes('view_inventory')) {
    const avatarUrl = interaction.user?.displayAvatarURL ? interaction.user.displayAvatarURL({ extension: 'png', size: 256 }) : null;
    const { embed, row } = await buildInventoryEmbed(interaction.user.id, guildId, 1, interaction.user.id, null, avatarUrl);
    const components = row ? [row] : [];
    return interaction.reply({
      embeds: [embed],
      components,
      flags: MessageFlags.Ephemeral
    });
  }

  // 4. Pagination Buttons
  if (interaction.isButton() && interaction.customId.includes('_page_')) {
    const lastPart = parts[parts.length - 1];
    const targetPage = Number(lastPart);
    if (!Number.isFinite(targetPage) || targetPage < 1) {
      return interaction.deferUpdate();
    }
    const { card } = await buildShopCatalogueEmbed(guildId, targetPage, false, authorId);
    return sendShopResponse(interaction, card);
  }
}
