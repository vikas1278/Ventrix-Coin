import crypto from 'node:crypto';
import { EmbedBuilder } from 'discord.js';
import { Config } from '../models.js';
import config from '../config.js';

// ─── Colour Palette ────────────────────────────────────────────────────────────
export const C = {
  brand:   0x7c3aed, // Purple  — Shop catalogue / Info
  success: 0x22c55e, // Green   — Purchase successful / Credited
  warning: 0xf59e0b, // Amber   — Buycoin checkout / Pending / Review
  danger:  0xef4444, // Red     — Errors / Rejected / Deactivated
  muted:   0x64748b, // Slate   — Neutral admin config / Logs
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
  (process.env.BOT_OWNER_IDS || process.env.OWNER_USER_IDS || '')
    .split(',')
    .map(x => x.trim())
    .filter(Boolean);

export const isOwner = (userId) => getOwnerIds().includes(String(userId));

export const ownerOnly = (interaction) => isOwner(interaction.user.id);

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
  await loadAdminsFromDb().catch(() => {});
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
