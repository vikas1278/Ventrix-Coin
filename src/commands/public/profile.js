import {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  AttachmentBuilder,
  MessageFlags
} from 'discord.js';
import { Wallet, Ledger, UserInventory } from '../../models.js';
import {
  coinName,
  adminOnly,
  ownerOnly,
  isAdmin,
  isOwner
} from '../../utils/common.js';
import config from '../../config.js';
import { generateProfileCardImage } from '../../utils/profile-card.js';
import { buildShopCatalogueEmbed } from './shop.js';
import { buildLedgerEmbed } from './wallet.js';

export const data = new SlashCommandBuilder()
  .setName('wallet-2')
  .setDescription('View your interactive graphical VIP Wallet 2.0 card and stats')
  .addUserOption(o => o.setName('user').setDescription('Inspect another member\'s card (Admin only)').setRequired(false));

/**
 * Calculates user membership tier badge text based on permissions, roles, and balance
 */
function getMemberTier(balance, userId, member = null) {
  // 1. Bot Owner
  if (isOwner(userId)) return 'OWNER';

  // 2. Admin (MongoDB dynamic admin)
  if (isAdmin(userId)) return 'ADMIN';

  // 3. Staff (Discord Staff Role ID configured in config.js)
  const staffRoleId = config.staffRoleId;
  if (staffRoleId && member?.roles?.cache?.has(staffRoleId)) {
    return 'STAFF';
  }

  // 4. Wallet Balance-Based Tiers
  const limits = config.tierThresholds || { diamond: 5000, gold: 2000, silver: 500, vip: 100 };
  if (balance >= limits.diamond) return 'DIAMOND';
  if (balance >= limits.gold) return 'GOLD';
  if (balance >= limits.silver) return 'SILVER';
  if (balance >= (limits.vip ?? 100)) return 'VIP';
  return 'MEMBER';
}

/**
 * Fetches stats, generates the graphical PNG card, and prepares the Discord embed payload
 */
export async function buildProfileCardPayload(targetUser, guildId, callerId, member = null) {
  const userId = targetUser.id;

  // 1. Fetch wallet balance
  const wallet = await Wallet.findOne({ guildId: { $in: [guildId, 'global', 'DM'] }, userId }).lean();
  const balance = wallet?.balance || 0;

  // 2. Aggregate Ledger Statistics (Total Purchased & Total Spent)
  const ledgerEntries = await Ledger.find({
    userId,
    guildId: { $in: [guildId, 'global', 'DM'] }
  }).lean();

  let totalPurchased = 0;
  let totalSpent = 0;

  for (const entry of ledgerEntries) {
    if (entry.type === 'purchase_credit' || (entry.type === 'admin_grant' && entry.coins > 0)) {
      totalPurchased += Math.abs(entry.coins);
    } else if (entry.type === 'shop_purchase' || entry.type === 'admin_deduct') {
      totalSpent += Math.abs(entry.coins);
    }
  }

  const tier = getMemberTier(balance, userId, member);
  const avatarUrl = targetUser.displayAvatarURL({ extension: 'png', size: 256, forceStatic: true });

  // 3. Generate High-Res Graphical Card (PNG)
  const imageBuffer = await generateProfileCardImage({
    username: targetUser.displayName || targetUser.username,
    userId: targetUser.id,
    avatarUrl,
    tierBadge: tier,
    balance,
    totalPurchased,
    totalSpent
  });

  const attachment = new AttachmentBuilder(imageBuffer, { name: 'profile-card.png' });

  // 4. Clean Embed Displaying the Rendered Card
  const embed = new EmbedBuilder()
    .setColor(0x7c3aed)
    .setImage('attachment://profile-card.png');

  // 5. Interactive Action Buttons (Green & Blue)
  const actionRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`prof_ledger_${userId}_${callerId}`)
      .setLabel('History')
      .setEmoji('📜')
      .setStyle(ButtonStyle.Success),
    new ButtonBuilder()
      .setCustomId(`prof_refresh_${userId}_${callerId}`)
      .setLabel('Refresh')
      .setEmoji('🔄')
      .setStyle(ButtonStyle.Primary)
  );

  return { embed, attachment, actionRow };
}

// ─── Slash Command Execution ──────────────────────────────────────────────────
export async function execute(interaction) {
  try {
    await interaction.deferReply();
  } catch (err) {
    if (err?.code === 10062) return;
    throw err;
  }
  const targetUser = interaction.options.getUser('user') || interaction.user;

  if (targetUser.id !== interaction.user.id && !adminOnly(interaction)) {
    return interaction.editReply({
      content: '❌ Only administrators can inspect another member\'s profile card.'
    });
  }

  const guildId = interaction.guildId || 'DM';
  const member = interaction.guild
    ? (interaction.guild.members.cache.get(targetUser.id) || await interaction.guild.members.fetch(targetUser.id).catch(() => null))
    : null;
  const { embed, attachment, actionRow } = await buildProfileCardPayload(targetUser, guildId, interaction.user.id, member);

  const reply = await interaction.editReply({
    embeds: [embed],
    files: [attachment],
    components: [actionRow]
  });

  // Automatically remove buttons completely after 3 minutes
  const collector = reply.createMessageComponentCollector({
    time: 3 * 60 * 1000 // 3 minutes
  });

  collector.on('end', async () => {
    try {
      await interaction.editReply({
        components: [] // Completely removes the buttons
      });
    } catch (_) {}
  });

  return reply;
}

// ─── Component Interactions Router ────────────────────────────────────────────
export async function component(interaction) {
  // Check 3-minute expiration guard
  const msgAge = Date.now() - (interaction.message?.createdTimestamp || 0);
  if (msgAge > 3 * 60 * 1000) {
    interaction.message?.edit({ components: [] }).catch(() => {});
    return interaction.reply({
      content: '⏱️ These buttons have timed out after 3 minutes. Please run `/profile` again.',
      flags: MessageFlags.Ephemeral
    });
  }

  const parts = interaction.customId.split('_');
  // Format: prof_<action>_<targetUserId>_<callerId>
  const action = parts[1];
  const targetUserId = parts[2];
  const callerId = parts[3];

  if (callerId && interaction.user.id !== callerId) {
    return interaction.reply({
      content: '❌ Only the user who opened this card can use these buttons. Run `/profile` to open your own!',
      flags: MessageFlags.Ephemeral
    });
  }

  const guildId = interaction.guildId || 'DM';

  // 1. Top Up Coins Guide
  if (action === 'buy') {
    return interaction.reply({
      content:
        `🪙 **How to Top Up ${coinName()}:**\n` +
        `1. Run \`/buycoin <amount>\` (e.g. \`/buycoin 100\`).\n` +
        `2. Scan the instant UPI QR code with GPay, PhonePe, or Paytm.\n` +
        `3. Your coins will be credited automatically to your wallet!`,
      flags: MessageFlags.Ephemeral
    });
  }

  // 2. Open Shop Catalogue
  if (action === 'shop') {
    const { card } = await buildShopCatalogueEmbed(guildId, 1, false, interaction.user.id);
    return interaction.reply({
      components: [card],
      flags: [MessageFlags.Ephemeral, MessageFlags.IsComponentsV2]
    });
  }

  // 3. Open Private Ledger History
  if (action === 'ledger') {
    const { embed, row } = await buildLedgerEmbed(
      targetUserId,
      guildId,
      1,
      interaction.user.id,
      interaction.client
    );
    const components = row ? [row] : [];
    return interaction.reply({
      embeds: [embed],
      components,
      flags: MessageFlags.Ephemeral
    });
  }

  // 4. Live Refresh
  if (action === 'refresh') {
    await interaction.deferUpdate();
    const targetUser = await interaction.client.users.fetch(targetUserId).catch(() => interaction.user);
    const member = interaction.guild
      ? (interaction.guild.members.cache.get(targetUserId) || await interaction.guild.members.fetch(targetUserId).catch(() => null))
      : null;
    const { embed, attachment, actionRow } = await buildProfileCardPayload(targetUser, guildId, callerId, member);

    return interaction.editReply({
      embeds: [embed],
      files: [attachment],
      components: [actionRow]
    });
  }
}
