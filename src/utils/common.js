import crypto from 'node:crypto';
import { EmbedBuilder } from 'discord.js';
import { Config } from '../models.js';
import config from '../config.js';

// ─── Colour Palette ────────────────────────────────────────────────────────────
export const C = {
  brand: 0x7c3aed, // Purple  — Shop catalogue / Info
  primary: 0x7c3aed, // Alias for brand / primary purple
  accent: 0x7c3aed, // Alias for accent
  success: 0x22c55e, // Green   — Purchase successful / Credited
  warning: 0xf59e0b, // Amber   — Buycoin checkout / Pending / Review
  danger: 0xef4444, // Red     — Errors / Rejected / Deactivated
  muted: 0x64748b, // Slate   — Neutral admin config / Logs
};

// ─── Shared Embed Helpers ──────────────────────────────────────────────────────
export function ok(title, description, extra = {}) {
  return new EmbedBuilder()
    .setColor(extra.color ?? C.success)
    .setTitle(`✅  ${title}`)
    .setDescription(description)
    .setTimestamp();
}

export function err(title, description) {
  return new EmbedBuilder()
    .setColor(C.danger)
    .setTitle(`❌  ${title}`)
    .setDescription(description)
    .setTimestamp();
}

export function info(title, description, extra = {}) {
  return new EmbedBuilder()
    .setColor(extra.color ?? C.brand)
    .setTitle(`ℹ️  ${title}`)
    .setDescription(description)
    .setTimestamp();
}

export async function replyEmbed(interaction, embed, extra = {}) {
  const { fetchReply, ...rest } = extra;
  if (interaction.deferred || interaction.replied) {
    await interaction.followUp({ embeds: [embed], ...rest });
  } else {
    await interaction.reply({ embeds: [embed], ...rest });
  }
  if (fetchReply) {
    return interaction.fetchReply();
  }
}

// ─── Bot Owners & Permissions ──────────────────────────────────────────────────
export const getOwnerIds = () =>
  (process.env.BOT_OWNER_IDS || process.env.OWNER_USER_IDS || process.env.BOT_OWNER_ID || '')
    .split(',')
    .map(x => x.trim())
    .filter(Boolean);

export const isOwner = (userId) => getOwnerIds().includes(String(userId));

export const ownerOnly = (interaction) => isOwner(interaction.user.id);

export function isServerOwner(interaction) {
  return Boolean(interaction.guild && interaction.guild.ownerId === interaction.user.id);
}

export function isServerAdmin(interaction) {
  if (!interaction.guild) return false;
  return Boolean(
    interaction.memberPermissions?.has('ManageGuild') ||
    interaction.memberPermissions?.has('Administrator')
  );
}

export function canManageServerGames(interaction) {
  return (
    isOwner(interaction.user.id) ||
    isAdmin(interaction.user.id) ||
    isServerOwner(interaction) ||
    isServerAdmin(interaction)
  );
}

// In-memory cache for fast synchronous permission checks
const cachedDbAdmins = new Map(); // userId -> { userId, username, addedBy, note }

export async function loadAdminsFromDb() {
  try {
    const { Admin } = await import('../models.js');
    const list = await Admin.find().lean();
    cachedDbAdmins.clear();
    for (const a of list) {
      cachedDbAdmins.set(String(a.userId), a);
    }
    return Array.from(cachedDbAdmins.values());
  } catch {
    return [];
  }
}

export function getStaticAdminIds() {
  return [];
}

export const isAdmin = (userId) => {
  const uid = String(userId);
  // 1. Bot Owners have highest super permissions across all bot commands
  if (isOwner(uid)) return true;
  // 2. Administrators stored dynamically in database
  return cachedDbAdmins.has(uid);
};

export const adminOnly = (interaction) => isAdmin(interaction.user.id);

export async function addAdminUser({ userId, username = '', addedBy, note = '' }) {
  const uid = String(userId).trim();
  const { Admin } = await import('../models.js');
  const record = await Admin.findOneAndUpdate(
    { userId: uid },
    { userId: uid, username, addedBy, note },
    { upsert: true, new: true }
  ).lean();
  cachedDbAdmins.set(uid, record);
  return record;
}

export async function removeAdminUser(userId) {
  const uid = String(userId).trim();
  const { Admin } = await import('../models.js');
  const deleted = await Admin.findOneAndDelete({ userId: uid }).lean();
  cachedDbAdmins.delete(uid);
  return Boolean(deleted);
}

export async function listAllAdmins() {
  await loadAdminsFromDb().catch(() => { });
  const dbAdmins = Array.from(cachedDbAdmins.values());
  const owners = getOwnerIds();
  return { owners, staticAdmins: [], dbAdmins };
}

export const money = (paise) => `₹${(paise / 100).toFixed(2)}`;

export const coinIcon = () => (config.coinSymbol || '🪙').trim();
export const coinName = () => (config.coinName || 'Coins').trim();
export const coinTitleIcon = () => (coinIcon().startsWith('<:') ? '🪙' : coinIcon());

export const formatCoins = (coins = 0) => `${Number(coins).toLocaleString()} ${coinIcon()}`;

export { config };

export const newOrderId = () =>
  `GS-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

export const escapeText = (s = '') => String(s).replace(/[<>]/g, '');

export function parseAmountInr(value) {
  const n = Number(value);
  if (!Number.isFinite(n) || n < 1 || n > 100_000) {
    throw new Error('Amount must be between ₹1 and ₹100,000.');
  }
  // Enforce 2 decimal places maximum (paise precision)
  const rounded = Math.round(n * 100) / 100;
  return rounded;
}

export function parsePrice(value) {
  return Math.round(parseAmountInr(value) * 100);
}

// ─── Fixed Database Name Helper ──────────────────────────────────────────────
export const DB_NAME = 'COINS';

export function getBotDbName(botUsername = null) {
  return process.env.MONGODB_DB_NAME || DB_NAME;
}

// ─── Configurable Coin Conversion Rate ─────────────────────────────────────────
// Default: 1 INR = 1 coin. Can be configured dynamically per server or globally.
export async function getCoinRate(guildId = null) {
  try {
    if (guildId) {
      const serverDoc = await Config.findOne({ guildId, key: 'COINS_PER_INR' }).lean();
      if (serverDoc && Number(serverDoc.value) > 0) {
        return Number(serverDoc.value);
      }
    }
    const doc = await Config.findOne({ key: 'COINS_PER_INR' }).lean();
    if (doc && Number(doc.value) > 0) {
      return Number(doc.value);
    }
  } catch {
    // If DB is not connected yet, fall through to env
  }
  const defaultRate = Number(config.coinsPerInr || process.env.COINS_PER_INR);
  return Number.isFinite(defaultRate) && defaultRate > 0 ? defaultRate : 1;
}

export async function setCoinRate(rate, adminId = 'system', guildId = null) {
  const numericRate = Number(rate);
  if (!Number.isFinite(numericRate) || numericRate <= 0) {
    throw new Error('Conversion rate must be a positive number.');
  }
  const query = guildId ? { guildId, key: 'COINS_PER_INR' } : { key: 'COINS_PER_INR' };
  return Config.findOneAndUpdate(
    query,
    {
      ...query,
      value: numericRate,
      description: 'Coins credited per 1 INR paid',
      updatedBy: adminId,
    },
    { upsert: true, new: true }
  );
}

export function inrToCoins(amountInr, rate = 1) {
  // Integer arithmetic on paise to avoid floating-point inaccuracies
  const paise = Math.round(amountInr * 100);
  const calculatedCoins = Math.floor((paise * rate) / 100);
  return Math.max(1, calculatedCoins);
}

// ─── Exact UPI URI Builder (no random paise, exact requested amount) ──────────
export function makeUpiUri({ upiId, payeeName, amountPaise, note }) {
  const amountFormatted = (amountPaise / 100).toFixed(2);
  const params = new URLSearchParams({
    pa: upiId,
    pn: payeeName,
    am: amountFormatted,
    cu: 'INR',
    tn: note.slice(0, 80),
  });
  return `upi://pay?${params.toString()}`;
}

// ─── Membership Tier Thresholds & Themes ───────────────────────────────────────
export function getMemberTier(balance = 0, userId = '', member = null) {
  const uid = String(userId || '');
  if (uid && isOwner(uid)) return 'OWNER';
  if (uid && isAdmin(uid)) return 'ADMIN';

  const staffRoleId = config.staffRoleId;
  if (staffRoleId && member?.roles?.cache?.has(staffRoleId)) {
    return 'STAFF';
  }

  const limits = config.tierThresholds || { diamond: 5000, gold: 2000, silver: 500, vip: 100 };
  const numBal = Number(balance) || 0;
  if (numBal >= limits.diamond) return 'DIAMOND';
  if (numBal >= limits.gold) return 'GOLD';
  if (numBal >= limits.silver) return 'SILVER';
  if (numBal >= (limits.vip ?? 100)) return 'VIP';
  return 'MEMBER';
}

export function getTierTheme(tier = 'MEMBER') {
  const t = String(tier || '').toUpperCase();
  const limits = config.tierThresholds || { diamond: 5000, gold: 2000, silver: 500, vip: 100 };

  if (t.includes('OWNER')) {
    return {
      name: 'OWNER',
      label: 'OWNER',
      icon: '👑',
      border: '#f43f5e',
      glow: 'rgba(244, 63, 94, 0.65)',
      bg: 'rgba(244, 63, 94, 0.18)',
      text: '#ff3b69',
      minCoins: 0,
      perks: 'Bot Owner • Full Server Clearance & Maximum VIP Perks',
    };
  }
  if (t.includes('ADMIN')) {
    return {
      name: 'ADMIN',
      label: 'ADMIN',
      icon: '🛡️',
      border: '#06b6d4',
      glow: 'rgba(6, 182, 212, 0.65)',
      bg: 'rgba(6, 182, 212, 0.18)',
      text: '#22d3ee',
      minCoins: 0,
      perks: 'System Administrator • Elevated Access & Privileges',
    };
  }
  if (t.includes('STAFF')) {
    return {
      name: 'STAFF',
      label: 'STAFF',
      icon: '⚔️',
      border: '#10b981',
      glow: 'rgba(16, 185, 129, 0.6)',
      bg: 'rgba(16, 185, 129, 0.18)',
      text: '#34d399',
      minCoins: 0,
      perks: 'Discord Server Staff Member • Official Role Verified',
    };
  }
  if (t.includes('DIAMOND')) {
    return {
      name: 'DIAMOND',
      label: 'DIAMOND',
      icon: '💎',
      border: '#a855f7',
      glow: 'rgba(168, 85, 247, 0.6)',
      bg: 'rgba(168, 85, 247, 0.18)',
      text: '#c084fc',
      minCoins: limits.diamond,
      perks: `Top Tier Elite • 5,000+ VCoins High Roller Status`,
    };
  }
  if (t.includes('GOLD')) {
    return {
      name: 'GOLD',
      label: 'GOLD',
      icon: '🥇',
      border: '#eab308',
      glow: 'rgba(234, 179, 8, 0.6)',
      bg: 'rgba(234, 179, 8, 0.18)',
      text: '#facc15',
      minCoins: limits.gold,
      perks: `Gold Tier Member • 2,000+ VCoins Balance`,
    };
  }
  if (t.includes('SILVER')) {
    return {
      name: 'SILVER',
      label: 'SILVER',
      icon: '🥈',
      border: '#94a3b8',
      glow: 'rgba(148, 163, 184, 0.5)',
      bg: 'rgba(148, 163, 184, 0.15)',
      text: '#e2e8f0',
      minCoins: limits.silver,
      perks: `Silver Tier Member • 500+ VCoins Balance`,
    };
  }
  if (t.includes('VIP')) {
    return {
      name: 'VIP',
      label: 'VIP',
      icon: '⭐',
      border: '#d97706',
      glow: 'rgba(217, 119, 6, 0.55)',
      bg: 'rgba(217, 119, 6, 0.16)',
      text: '#22c55e',
      minCoins: limits.vip ?? 100,
      perks: `VIP Supporter • 100+ VCoins Balance`,
    };
  }
  return {
    name: 'MEMBER',
    label: 'MEMBER',
    icon: '👤',
    border: '#0db2f8ff',
    glow: 'rgba(56, 189, 248, 0.45)',
    bg: 'rgba(56, 189, 248, 0.14)',
    text: '#7dd3fc',
    minCoins: 0,
    perks: `Standard Member • Top up 100 VCoins to unlock VIP`,
  };
}

export function getTierProgress(balance = 0) {
  const limits = config.tierThresholds || { diamond: 5000, gold: 2000, silver: 500, vip: 100 };
  const numBal = Number(balance) || 0;

  if (numBal >= limits.diamond) {
    return {
      currentTier: 'DIAMOND',
      nextTier: null,
      nextThreshold: limits.diamond,
      currentThreshold: limits.diamond,
      coinsNeeded: 0,
      percentage: 100,
      isMaxTier: true,
      message: 'Maximum VIP Diamond Tier achieved! 💎',
    };
  }
  if (numBal >= limits.gold) {
    const range = limits.diamond - limits.gold;
    const progress = Math.min(100, Math.round(((numBal - limits.gold) / range) * 100));
    const needed = limits.diamond - numBal;
    return {
      currentTier: 'GOLD',
      nextTier: 'DIAMOND',
      nextThreshold: limits.diamond,
      currentThreshold: limits.gold,
      coinsNeeded: needed,
      percentage: Math.max(0, progress),
      isMaxTier: false,
      message: `${needed.toLocaleString()} more VCoins needed to reach DIAMOND 💎`,
    };
  }
  if (numBal >= limits.silver) {
    const range = limits.gold - limits.silver;
    const progress = Math.min(100, Math.round(((numBal - limits.silver) / range) * 100));
    const needed = limits.gold - numBal;
    return {
      currentTier: 'SILVER',
      nextTier: 'GOLD',
      nextThreshold: limits.gold,
      currentThreshold: limits.silver,
      coinsNeeded: needed,
      percentage: Math.max(0, progress),
      isMaxTier: false,
      message: `${needed.toLocaleString()} more VCoins needed to reach GOLD 🥇`,
    };
  }
  if (numBal >= (limits.vip ?? 100)) {
    const vipMin = limits.vip ?? 100;
    const range = limits.silver - vipMin;
    const progress = Math.min(100, Math.round(((numBal - vipMin) / range) * 100));
    const needed = limits.silver - numBal;
    return {
      currentTier: 'VIP',
      nextTier: 'SILVER',
      nextThreshold: limits.silver,
      currentThreshold: vipMin,
      coinsNeeded: needed,
      percentage: Math.max(0, progress),
      isMaxTier: false,
      message: `${needed.toLocaleString()} more VCoins needed to reach SILVER 🥈`,
    };
  }
  const vipMin = limits.vip ?? 100;
  const progress = Math.min(100, Math.round((numBal / vipMin) * 100));
  const needed = Math.max(0, vipMin - numBal);
  return {
    currentTier: 'MEMBER',
    nextTier: 'VIP',
    nextThreshold: vipMin,
    currentThreshold: 0,
    coinsNeeded: needed,
    percentage: Math.max(0, progress),
    isMaxTier: false,
    message: `${needed.toLocaleString()} more VCoins needed to unlock VIP ⭐`,
  };
}
