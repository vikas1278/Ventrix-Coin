import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import {
  SlashCommandBuilder,
  ContainerBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder,
  MediaGalleryBuilder,
  MessageFlags,
  AttachmentBuilder
} from 'discord.js';
import { adminOnly, ownerOnly, coinIcon, coinName, config } from '../../utils/common.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BANNER_PATH = path.resolve(__dirname, '../../assets/banner.jpg');

export const data = new SlashCommandBuilder()
  .setName('help')
  .setDescription('View bot help menu and commands')
  .addStringOption(o =>
    o.setName('category')
      .setDescription('Directly jump to a category')
      .setRequired(false)
      .addChoices(
        { name: '🏡 Main Menu', value: 'overview' },
        { name: '🛍️ Shop & Items', value: 'shop' },
        { name: '🪙 Coin Economy', value: 'economy' },
        { name: '🎮 Gaming Hub', value: 'gaming' },
        { name: '🛡️ Admin Controls', value: 'admin' },
        { name: '👑 Owner Commands', value: 'owner' },
        { name: '📖 Quick Guide', value: 'guide' },
      )
  );

// ─── Categories & Commands Metadata ──────────────────────────────────────────
const CATEGORIES = {
  shop: {
    name: 'Shop & Items',
    emoji: '🛍️',
    description: 'Browse and purchase items.',
    commands: [
      {
        name: 'shop',
        description: 'Browse shop items',
        usage: '/shop',
        access: 'Everyone'
      },
      {
        name: 'buyitem',
        description: 'Buy item using coins',
        usage: '/buyitem <item>',
        access: 'Everyone'
      },
      {
        name: 'inventory',
        description: 'View your purchased items and active roles',
        usage: '/inventory',
        access: 'Everyone'
      },
      {
        name: 'item',
        description: 'Use or claim an item from your inventory',
        usage: '/item use',
        access: 'Everyone'
      }
    ]
  },
  economy: {
    get name() { return `${coinName()} Economy`; },
    get emoji() { return coinIcon(); },
    get description() { return `Manage ${coinName().toLowerCase()} and wallet.`; },
    commands: [
      {
        name: 'buycoin',
        description: 'Buy coins via UPI',
        usage: '/buycoin <amount>',
        access: 'Everyone'
      },
      {
        name: 'wallet',
        description: 'Check coin balance',
        usage: '/wallet [user]',
        access: 'Everyone'
      },
      {
        name: 'wallet-2',
        description: 'Interactive VIP Wallet 2.0 card',
        usage: '/wallet-2 [user]',
        access: 'Everyone'
      },
      {
        name: 'transfer',
        description: 'Transfer coins to another member',
        usage: '/transfer user:<@member/ID> amount:<coins>',
        access: 'Everyone'
      },
      {
        name: 'transactions',
        description: 'View order history',
        usage: '/transactions [user]',
        access: 'Everyone'
      },
      {
        name: 'dashboard',
        description: 'Open web dashboard & online control center',
        usage: '/dashboard',
        access: 'Everyone'
      },
      {
        name: 'help',
        description: 'View help menu',
        usage: '/help [category]',
        access: 'Everyone'
      }
    ]
  },
  gaming: {
    name: 'Gaming Hub',
    emoji: '🎮',
    description: 'Play games, compete on leaderboards, and win coins.',
    commands: [
      {
        name: 'mine',
        description: 'Play 3x3 Mines game with diamonds and cashout',
        usage: '/mine <bet>',
        access: 'Everyone'
      },
      {
        name: 'coinflip',
        description: 'Flip a 3D golden coin for a 2x payout (Heads or Tails)',
        usage: '/coinflip <bet> <choice>',
        access: 'Everyone'
      },
      {
        name: 'guess',
        description: 'Mystery Number Guess game (1-100, 5 attempts, up to 5x payout)',
        usage: '/guess <bet>',
        access: 'Everyone'
      },
      {
        name: 'rps',
        description: 'Play Rock Paper Scissors against the bot for a 2x payout',
        usage: '/rps <amount>',
        access: 'Everyone'
      },
      {
        name: 'leaderboard',
        description: 'View top coin holders and gaming champions',
        usage: '/leaderboard [sort]',
        access: 'Everyone'
      },
      {
        name: 'profile',
        description: 'View player gaming profile, level, XP, and stats',
        usage: '/profile [user]',
        access: 'Everyone'
      },
      {
        name: 'history',
        description: 'View your recent gaming round history',
        usage: '/history [limit]',
        access: 'Everyone'
      }
    ]
  },
  admin: {
    name: 'Admin Controls',
    emoji: '🛡️',
    description: 'Shop and admin management.',
    commands: [
      {
        name: 'create-item',
        description: 'Add new shop item',
        usage: '/create-item <name> <price> <behavior> [options...]',
        access: 'Admin'
      },
      {
        name: 'edit-item',
        description: 'Edit shop item',
        usage: '/edit-item <id> [options...]',
        access: 'Admin'
      },
      {
        name: 'delete-item',
        description: 'Delete shop item',
        usage: '/delete-item <id>',
        access: 'Admin'
      },
      {
        name: 'give-coins',
        description: 'Grant coins to user',
        usage: '/give-coins <user> <amount> [reason]',
        access: 'Admin'
      },
      {
        name: 'remove-coins',
        description: 'Remove coins from user',
        usage: '/remove-coins <user> <amount> [reason]',
        access: 'Admin'
      },
      {
        name: 'game-settings',
        description: 'Configure server min/max bets and starting coins',
        usage: '/game-settings <min-bet> <max-bet> [starting-coins]',
        access: 'Admin'
      },
      {
        name: 'game-toggle',
        description: 'Enable or disable specific games in server',
        usage: '/game-toggle <game> <enabled>',
        access: 'Admin'
      },
      {
        name: 'server-config',
        description: 'View server gaming configuration',
        usage: '/server-config',
        access: 'Admin'
      },
      {
        name: 'set-rate',
        description: 'Set coin rate',
        usage: '/set-rate <coins_per_inr>',
        access: 'Admin'
      },
      {
        name: 'approve-payment',
        description: 'Approve payment order',
        usage: '/approve-payment <order_id> [utr] [note]',
        access: 'Admin'
      },
      {
        name: 'reject-order',
        description: 'Reject & delete order',
        usage: '/reject-order <order_id> [reason]',
        access: 'Admin'
      },
      {
        name: 'shop-config',
        description: 'View shop settings',
        usage: '/shop-config',
        access: 'Admin'
      },
      {
        name: 'order',
        description: 'Lookup order details',
        usage: '/order <order_id>',
        access: 'Admin'
      },
      {
        name: 'orderhistory',
        description: 'View pending /buycoin orders with pagination',
        usage: '/orderhistory [user]',
        access: 'Admin'
      },
      {
        name: 'dropbox',
        description: 'Manage automated multi-drop coin distribution events',
        usage: '/dropbox <setup|start|status|list|preview|cancel|logs>',
        access: 'Admin'
      },
      {
        name: 'dropbox-delete',
        description: 'Permanently delete a dropbox event from database',
        usage: '/dropbox-delete <event_id>',
        access: 'Admin'
      },
      {
        name: 'remove-item',
        description: 'Remove item from user inventory',
        usage: '/remove-item [user] [inventory_id] [revoke_role]',
        access: 'Admin'
      }
    ]
  },
  owner: {
    name: 'Owner Commands',
    emoji: '👑',
    description: 'Bot owner tools.',
    commands: [
      {
        name: 'admin-add',
        description: 'Add bot admin',
        usage: '/admin-add <user> [note]',
        access: 'Owner'
      },
      {
        name: 'admin-remove',
        description: 'Remove bot admin',
        usage: '/admin-remove <user>',
        access: 'Owner'
      },
      {
        name: 'admin-list',
        description: 'List bot admins',
        usage: '/admin-list',
        access: 'Owner'
      },
      {
        name: 'clearserver',
        description: 'Wipe all database records for a server',
        usage: '/clearserver <server>',
        access: 'Owner'
      },
      {
        name: 'server',
        description: 'View connected servers list or leave a server',
        usage: '/server <list|remove>',
        access: 'Owner'
      },
      {
        name: 'bot-stats',
        description: 'View bot performance, memory usage, and metrics',
        usage: '/bot-stats',
        access: 'Owner'
      },
      {
        name: 'bot-guilds',
        description: 'List all connected Discord servers',
        usage: '/bot-guilds',
        access: 'Owner'
      },
      {
        name: 'bot-blacklist',
        description: 'Blacklist a server from using the bot',
        usage: '/bot-blacklist <guild-id> <reason>',
        access: 'Owner'
      },
      {
        name: 'bot-unblacklist',
        description: 'Remove a server from the blacklist',
        usage: '/bot-unblacklist <guild-id>',
        access: 'Owner'
      }
    ]
  },
  guide: {
    name: 'Quick Guide',
    emoji: '📖',
    description: 'Quick guide to buy coins and items.',
    steps: [
      '**1.** `/wallet` — Check coin balance',
      '**2.** `/buycoin <amount>` — Generate UPI QR & pay',
      '**3.** Auto-Credit — Coins added automatically',
      '**4.** `/mine <bet>` — Play Mines & cash out for profit!',
      '**5.** `/shop` & `/buyitem` — Browse and buy items!'
    ]
  }
};

const ALL_CATEGORY_KEYS = ['shop', 'economy', 'gaming', 'admin', 'owner', 'guide'];

function formatUptime(uptimeMs = 0) {
  const totalSec = Math.floor(uptimeMs / 1000);
  const days = Math.floor(totalSec / 86400);
  const hours = Math.floor((totalSec % 86400) / 3600);
  const mins = Math.floor((totalSec % 3600) / 60);
  const secs = totalSec % 60;
  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0 || days > 0) parts.push(`${hours}h`);
  parts.push(`${mins}m`);
  parts.push(`${secs}s`);
  return parts.join(' ');
}

function getUserRoleBadge(isUserOwner, isUserAdmin) {
  if (isUserOwner) return { name: 'Bot Developer', emoji: '👑' };
  if (isUserAdmin) return { name: 'Administrator', emoji: '🛡️' };
  return { name: 'Member', emoji: '👤' };
}

function getVisibleCategories(isUserAdmin, isUserOwner) {
  return ALL_CATEGORY_KEYS.filter(cat => {
    if (cat === 'owner') return isUserOwner;
    if (cat === 'admin') return isUserAdmin || isUserOwner;
    return true;
  });
}

// ─── Discord Components V2 Card Builder (Ventrix Bot) ───────────
function buildCard(title, sections, actionRows = [], banner = null, accentColor = 0x00e5ff) {
  const container = new ContainerBuilder()
    .setAccentColor(accentColor)
    .addTextDisplayComponents(textDisplay => textDisplay.setContent(`## ${title}`));

  if (banner) {
    container
      .addSeparatorComponents(separator => separator)
      .addMediaGalleryComponents(banner);
  }

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

function buildHelpBanner() {
  const bannerUrl = String(config.bannerUrl || process.env.BANNER_URL || '').trim();
  if (bannerUrl) {
    try {
      new URL(bannerUrl);
      return new MediaGalleryBuilder().addItems(mediaItem =>
        mediaItem.setURL(bannerUrl).setDescription('Vyntrix Banner')
      );
    } catch (_) {}
  }

  if (fs.existsSync(BANNER_PATH)) {
    return new MediaGalleryBuilder().addItems(mediaItem =>
      mediaItem.setURL('attachment://banner.jpg').setDescription('Vyntrix Banner')
    );
  }

  return null;
}

// ─── Interactive Navigation Tabs (Discord V2 Active State Highlight) ─────────
function buildTabsRows(activeKey, visibleCategories, userId = '') {
  const prefix = userId ? `help_${userId}_` : 'help_';
  const styleFor = key => (activeKey === key ? ButtonStyle.Danger : ButtonStyle.Secondary);

  const allButtons = [
    new ButtonBuilder()
      .setCustomId(`${prefix}tab_overview`)
      .setLabel('Overview')
      .setEmoji('🏡')
      .setStyle(styleFor('overview'))
  ];

  visibleCategories.forEach(cat => {
    const meta = CATEGORIES[cat];
    if (!meta) return;
    allButtons.push(
      new ButtonBuilder()
        .setCustomId(`${prefix}tab_${cat}`)
        .setLabel(meta.name.replace(' Commands', '').replace(' Controls', ''))
        .setEmoji(meta.emoji)
        .setStyle(styleFor(cat))
    );
  });

  const rows = [];
  for (let i = 0; i < allButtons.length; i += 5) {
    rows.push(new ActionRowBuilder().addComponents(allButtons.slice(i, i + 5)));
  }

  return rows;
}

function buildControlsRow(backCustomId, userId = '') {
  const prefix = userId ? `help_${userId}_` : 'help_';
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(backCustomId)
      .setLabel('Back')
      .setEmoji('🏡')
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId(`${prefix}close`)
      .setLabel('Close')
      .setEmoji('🗑️')
      .setStyle(ButtonStyle.Danger)
  );
}

function buildCommandSelect(categoryKey, commands, userId = '') {
  const prefix = userId ? `help_${userId}_` : 'help_';
  const options = commands.slice(0, 25).map(cmd => ({
    label: `/${cmd.name}`,
    description: (cmd.description || 'No description').slice(0, 100),
    value: cmd.name
  }));

  return new ActionRowBuilder().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId(`${prefix}select_${categoryKey}`)
      .setPlaceholder('Select a command for detailed info')
      .addOptions(options)
  );
}

// ─── Views Generators ─────────────────────────────────────────────────────────
function buildMainBody(client, isUserOwner, isUserAdmin, visibleCategories) {
  const roleBadge = getUserRoleBadge(isUserOwner, isUserAdmin);
  const totalServers = client?.guilds?.cache.size || 1;
  const totalUsers =
    client?.guilds?.cache.reduce((acc, g) => acc + (g.memberCount || 0), 0) ||
    client?.users?.cache.size ||
    1;
  const uptime = formatUptime(client?.uptime || process.uptime() * 1000);
  const wsPing = Math.round(client?.ws?.ping || 0);
  const pingStatus = wsPing > 0 ? `${wsPing}ms (✅ Good)` : 'Connected (✅ Good)';

  const userAccessibleCommands = visibleCategories.reduce((acc, cat) => {
    return acc + (CATEGORIES[cat]?.commands?.length || 0);
  }, 0);

  const categoriesList = visibleCategories.map(catKey => {
    const meta = CATEGORIES[catKey];
    const count = meta.commands ? `(${meta.commands.length} commands)` : '(5 steps)';
    return `${meta.emoji} **${meta.name}** \`${count}\``;
  }).join('\n');

  const totalAllCommands = Object.values(CATEGORIES).reduce((acc, cat) => acc + (cat.commands?.length || 0), 0);

  const sections = [
    [
      `### ⚡ Overview`,
      `• Access Level: **${roleBadge.emoji} ${roleBadge.name}**`,
      `• Available Commands: **${userAccessibleCommands}** / ${totalAllCommands}`,
      `• Servers: **${totalServers}** • Users: **${totalUsers.toLocaleString()}**`,
      `• Uptime: **${uptime}** • Ping: **${pingStatus}**`
    ].join('\n'),
    [
      `### 📁 Available Categories (${visibleCategories.length})`,
      categoriesList
    ].join('\n'),
    `🏡 *Click any button below to view category commands.*`,
    `🔍 **Quick try:** \`/shop\` • \`/buycoin\` • \`/wallet\` • \`/buyitem\` • \`/transactions\``
  ];

  return sections;
}

function buildCategoryBody(categoryKey) {
  const meta = CATEGORIES[categoryKey];
  if (categoryKey === 'guide') {
    return [
      `### 📖 Quick Guide\n` + meta.steps.join('\n')
    ];
  }

  const commands = meta.commands || [];
  const list = commands
    .map(cmd => `• \`/${cmd.name}\` — ${cmd.description}`)
    .join('\n');

  return [
    `### ${meta.emoji} ${meta.name}\n${list}`
  ];
}

function buildCommandDetailsBody(categoryKey, command) {
  return [
    `### \`/${command.name}\` — ${command.description}`,
    `• **Usage:** \`${command.usage}\`\n• **Access:** ${command.access}`
  ];
}

// ─── Unified Components V2 Response Sender ────────────────────────────────────
function sendHelpResponse(interaction, card, files = []) {
  const response = {
    components: [card],
    flags: MessageFlags.IsComponentsV2,
    ...(files.length ? { files } : {})
  };

  if (interaction.deferred || interaction.replied) {
    return interaction.editReply(response);
  }

  if (interaction.isButton?.() || interaction.isStringSelectMenu?.()) {
    return interaction.update(response);
  }

  return interaction.reply(response);
}

function getBannerFiles(interaction = null) {
  // If updating an existing message via button/select, attachment is already present
  if (interaction?.message?.attachments?.size > 0) {
    return [];
  }
  const hasUrlBanner = Boolean(String(config.bannerUrl || process.env.BANNER_URL || '').trim());
  if (hasUrlBanner) {
    return [];
  }
  const files = [];
  if (fs.existsSync(BANNER_PATH)) {
    files.push(new AttachmentBuilder(BANNER_PATH, { name: 'banner.jpg' }));
  }
  return files;
}

// ─── Handlers ─────────────────────────────────────────────────────────────────
async function showMainMenu(interaction) {
  const isUserAdmin = adminOnly(interaction);
  const isUserOwner = ownerOnly(interaction);
  const visibleCategories = getVisibleCategories(isUserAdmin, isUserOwner);
  const botName = interaction.client?.user?.displayName || interaction.client?.user?.username || 'Vyntrix Coin Bot';
  const banner = buildHelpBanner();

  const card = buildCard(
    `${botName} Control Panel`,
    buildMainBody(interaction.client, isUserOwner, isUserAdmin, visibleCategories),
    buildTabsRows('overview', visibleCategories, interaction.user.id),
    banner,
    0x00e5ff
  );

  return sendHelpResponse(interaction, card, getBannerFiles(interaction));
}

async function showCategoryPage(interaction, categoryKey) {
  const isUserAdmin = adminOnly(interaction);
  const isUserOwner = ownerOnly(interaction);
  const visibleCategories = getVisibleCategories(isUserAdmin, isUserOwner);

  if (!visibleCategories.includes(categoryKey)) {
    return showMainMenu(interaction);
  }

  const meta = CATEGORIES[categoryKey];
  const banner = buildHelpBanner();
  const prefix = `help_${interaction.user.id}_`;

  const actionRows = [...buildTabsRows(categoryKey, visibleCategories, interaction.user.id)];
  if (meta.commands && meta.commands.length > 0) {
    actionRows.push(buildCommandSelect(categoryKey, meta.commands, interaction.user.id));
  }
  actionRows.push(buildControlsRow(`${prefix}back_overview`, interaction.user.id));

  const card = buildCard(
    `${meta.emoji} ${meta.name}`,
    buildCategoryBody(categoryKey),
    actionRows,
    banner,
    0x00e5ff
  );

  return sendHelpResponse(interaction, card, getBannerFiles(interaction));
}

async function showCommandDetails(interaction, categoryKey, commandName) {
  const isUserAdmin = adminOnly(interaction);
  const isUserOwner = ownerOnly(interaction);
  const visibleCategories = getVisibleCategories(isUserAdmin, isUserOwner);

  if (!visibleCategories.includes(categoryKey)) {
    return showMainMenu(interaction);
  }

  const meta = CATEGORIES[categoryKey];
  const command = (meta.commands || []).find(c => c.name === commandName);
  if (!command) {
    return showCategoryPage(interaction, categoryKey);
  }

  const banner = buildHelpBanner();
  const prefix = `help_${interaction.user.id}_`;
  const actionRows = [
    ...buildTabsRows(categoryKey, visibleCategories, interaction.user.id),
    buildCommandSelect(categoryKey, meta.commands, interaction.user.id),
    buildControlsRow(`${prefix}back_cat_${categoryKey}`, interaction.user.id)
  ];

  const card = buildCard(
    `🔍 Command Details: /${command.name}`,
    buildCommandDetailsBody(categoryKey, command),
    actionRows,
    banner,
    0x00e5ff
  );

  return sendHelpResponse(interaction, card, getBannerFiles(interaction));
}

export async function execute(interaction) {
  await interaction.deferReply();
  const requestedCategory = interaction.options.getString('category') || 'overview';
  if (requestedCategory === 'overview' || requestedCategory === 'main') {
    return showMainMenu(interaction);
  }
  return showCategoryPage(interaction, requestedCategory);
}

export async function component(interaction) {
  // Extract user ID from customId pattern: help_<userId>_<action>
  const match = interaction.customId.match(/^help_(\d+)_(.+)$/);
  const targetUserId = match ? match[1] : (interaction.message?.interactionMetadata?.user?.id || interaction.message?.interaction?.user?.id);

  // Restrict interactions strictly to the user who ran /help
  if (targetUserId && interaction.user.id !== targetUserId) {
    return interaction.reply({
      content: '❌ Only the user who ran `/help` can interact with this control panel. Run `/help` to open your own!',
      flags: MessageFlags.Ephemeral
    });
  }

  const rawAction = match ? match[2] : interaction.customId.replace('help_', '');

  // Handle Close Button
  if (rawAction === 'close') {
    return interaction.message.delete().catch(() => {
      interaction.deferUpdate().catch(() => {});
    });
  }

  // Handle Back to Overview
  if (rawAction === 'back_overview' || rawAction === 'tab_overview') {
    return showMainMenu(interaction);
  }

  // Handle Back to Category
  if (rawAction.startsWith('back_cat_')) {
    const category = rawAction.replace('back_cat_', '');
    return showCategoryPage(interaction, category);
  }

  // Handle Category Tab Buttons
  if (rawAction.startsWith('tab_')) {
    const category = rawAction.replace('tab_', '');
    return showCategoryPage(interaction, category);
  }

  // Handle Command Dropdown Selection
  if (interaction.isStringSelectMenu() && rawAction.startsWith('select_')) {
    const category = rawAction.replace('select_', '');
    const commandName = interaction.values[0];
    return showCommandDetails(interaction, category, commandName);
  }
}

// Backwards compatibility helper
export function buildHelpEmbed(category = 'overview', isUserAdmin = false, isUserOwner = false, client = null) {
  const visibleCategories = getVisibleCategories(isUserAdmin, isUserOwner);
  const botName = client?.user?.displayName || client?.user?.username || 'Vyntrix Coin Bot';
  const banner = buildHelpBanner();
  const card = buildCard(
    `${botName} Control Panel`,
    buildMainBody(client, isUserOwner, isUserAdmin, visibleCategories),
    buildTabsRows(category, visibleCategories),
    banner,
    0x00e5ff
  );
  return { card, components: [card] };
}
