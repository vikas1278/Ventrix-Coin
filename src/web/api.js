import os from 'node:os';
import QRCode from 'qrcode';
import ExcelJS from 'exceljs';
import mongoose from 'mongoose';
import {
  Product,
  Order,
  Payment,
  Wallet,
  Ledger,
  UserInventory,
  ItemActivation,
  ManualClaim,
  Admin,
  Guild,
  Config,
  DropboxEvent,
  DropboxDrop,
  DropboxClaim,
} from '../models.js';
import config from '../config.js';
import {
  getCoinRate,
  setCoinRate,
  inrToCoins,
  newOrderId,
  makeUpiUri,
  addAdminUser,
  removeAdminUser,
  listAllAdmins,
  getOwnerIds,
  isOwner,
  isAdmin,
  getMemberTier,
  getTierTheme,
  getTierProgress,
} from '../utils/common.js';
import { creditVerifiedPayment } from '../services/credit.js';
import { isUserGuildAdmin } from './auth.js';
import { purgeSingleInventoryItem } from '../commands/admin/remove-item.js';
import { cancelEvent, generateEventId, postDrop } from '../services/dropbox.js';
import { parseDuration, formatDuration } from '../utils/duration.js';
import { ChannelType, PermissionFlagsBits } from 'discord.js';

export async function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      if (body.length > 1e6) {
        req.destroy();
        reject(new Error('Payload too large'));
      }
    });
    req.on('end', () => {
      if (!body) return resolve({});
      try {
        resolve(JSON.parse(body));
      } catch (e) {
        reject(new Error('Invalid JSON'));
      }
    });
  });
}

export function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
  });
  res.end(JSON.stringify(data));
}

// Helper to resolve guild details
async function resolveGuildInfo(guildId, botClient) {
  if (!guildId || guildId === 'global' || guildId === 'DM') {
    return { guildId: 'global', guildName: 'Global Economy' };
  }
  const cached = botClient?.guilds?.cache?.get(guildId);
  if (cached) {
    return { guildId: cached.id, guildName: cached.name, iconUrl: cached.iconURL() || '' };
  }
  const dbGuild = await Guild.findOne({ guildId }).lean();
  if (dbGuild) {
    return { guildId: dbGuild.guildId, guildName: dbGuild.guildName, iconUrl: dbGuild.iconUrl || '' };
  }
  return { guildId, guildName: 'Discord Server' };
}

// Helper to resolve discord user details
async function resolveDiscordUser(userId, botClient) {
  if (!userId) return null;
  try {
    const cached = botClient?.users?.cache?.get(userId);
    if (cached) {
      return {
        id: cached.id,
        username: cached.username,
        discriminator: cached.discriminator,
        avatar: cached.displayAvatarURL?.() || cached.avatarURL?.() || null
      };
    }
    const fetched = await botClient?.users?.fetch(userId).catch(() => null);
    if (fetched) {
      return {
        id: fetched.id,
        username: fetched.username,
        discriminator: fetched.discriminator,
        avatar: fetched.displayAvatarURL?.() || fetched.avatarURL?.() || null
      };
    }
  } catch (e) {}
  return null;
}

// Helper to format clean reason / item names for transaction tables
export function formatCleanReason(rawReason, type) {
  if (!rawReason) {
    if (type === 'purchase_credit') return 'UPI top-up';
    if (type === 'shop_purchase') return 'Shop Item';
    if (type === 'admin_grant') return 'Admin Grant';
    if (type === 'admin_deduct') return 'Admin Deduction';
    if (type === 'DROPBOX_REWARD') return 'Daily reward';
    if (type === 'transfer') return 'Coin Transfer';
    return 'No description';
  }

  let text = String(rawReason).trim();
  text = text.replace(/\s*\([0-9a-fA-F]{24}\)/g, '');
  text = text.replace(/^Purchased item:\s*/i, '');
  text = text.replace(/^Order:\s*/i, '');

  if (/^transferred/i.test(text) || /^received/i.test(text)) return text;
  if (/^upi payment verified/i.test(text)) return 'UPI top-up';
  if (/^admin grant via web dashboard/i.test(text)) return 'Admin Grant';
  if (/^coin dropbox/i.test(text)) return 'Daily reward';
  if (text.toLowerCase() === 'vip') return 'VIP Role';
  if (text.toLowerCase() === 'vip 1') return 'VIP 1';
  if (text.toLowerCase() === 'custom role') return 'Custom Role';
  if (text.toLowerCase() === 'special access') return 'Special Access';
  if (text.toLowerCase() === 'gift') return 'Gift';

  const formatted = text.charAt(0).toUpperCase() + text.slice(1);
  return formatted.length > 50 ? formatted.slice(0, 47) + '...' : formatted;
}

// Helper to verify if user is an active member of a specific guild
async function isUserMemberOfGuild(userId, guildId, botClient) {
  if (!guildId || guildId === 'global') return true;
  if (!botClient?.guilds?.cache) return true;
  const guild = botClient.guilds.cache.get(guildId);
  if (!guild) return false;
  try {
    const member = guild.members.cache.get(userId) || await guild.members.fetch(userId).catch(() => null);
    return Boolean(member);
  } catch {
    return false;
  }
}

// Helper to enrich user inventory items with live role info and product icons
async function enrichInventoryItems(items, guildId, botClient) {
  if (!items || !items.length) return [];
  const guild = (guildId && guildId !== 'global' && guildId !== 'invalid')
    ? (botClient?.guilds?.cache?.get(guildId) || await botClient?.guilds?.fetch(guildId).catch(() => null))
    : null;

  const now = new Date();
  const enriched = [];

  for (const item of items) {
    const itemObj = { ...item };

    // Dynamically check if active timed role expired
    if (itemObj.status === 'active' && itemObj.expiresAt && new Date(itemObj.expiresAt) <= now) {
      itemObj.status = 'expired';
    }

    // Role enrichment
    if (itemObj.roleId && guild) {
      const role = guild.roles?.cache?.get(itemObj.roleId) || await guild.roles?.fetch(itemObj.roleId).catch(() => null);
      if (role) {
        itemObj.roleName = role.name;
        itemObj.roleColor = role.hexColor && role.hexColor !== '#000000' ? role.hexColor : '#a855f7';
      }
    }

    // Product enrichment (icon/image/description)
    if (itemObj.productId) {
      try {
        const prod = await Product.findById(itemObj.productId).lean();
        if (prod) {
          itemObj.imageUrl = itemObj.imageUrl || prod.imageUrl || '';
          itemObj.icon = itemObj.icon || prod.icon || '👑';
          itemObj.coins = itemObj.coins || prod.coins || 0;
          itemObj.productDesc = prod.description || '';
        }
      } catch {}
    }

    enriched.push(itemObj);
  }

  return enriched;
}

// ─── USER APIS (SERVER-SCOPED) ────────────────────────────────────────────────
export async function handleUserApi(pathname, method, req, res, session, botClient, url) {
  const userId = session.userId;
  const requestedGuildId = url.searchParams.get('guildId') || null;
  const isPrivileged = session.role === 'owner' || session.role === 'admin' || isOwner(userId) || isAdmin(userId);

  // 1. GET /api/guilds - List Discord servers
  // Regular users ONLY see mutual servers (where both user and bot are present).
  // Bot Admins and Bot Owners see all servers connected to the bot and database.
  if (pathname === '/api/guilds' && method === 'GET') {
    let activeGuilds = [];

    // Sync from bot memory cache first
    if (botClient?.guilds?.cache) {
      const allBotGuilds = Array.from(botClient.guilds.cache.values());

      if (isPrivileged) {
        for (const g of allBotGuilds) {
          activeGuilds.push({
            guildId: g.id,
            guildName: g.name,
            iconUrl: g.iconURL() || '',
            memberCount: g.memberCount || 0,
            isAdmin: true,
          });
        }
      } else {
        // Filter strictly to mutual servers where BOTH the user and the bot are present
        const memberChecks = allBotGuilds.map(async (g) => {
          try {
            let member = g.members.cache.get(userId);
            if (!member) {
              member = await g.members.fetch(userId).catch(() => null);
            }
            if (member) {
              return {
                guildId: g.id,
                guildName: g.name,
                iconUrl: g.iconURL() || '',
                memberCount: g.memberCount || 0,
                isAdmin: false,
              };
            }
          } catch (e) {}
          return null;
        });

        const results = await Promise.all(memberChecks);
        activeGuilds = results.filter(Boolean);
      }
    }

    // Always merge active guilds from database for complete multi-server tracking
    if (isPrivileged) {
      const dbList = await Guild.find({ status: 'active' }).sort({ guildName: 1 }).lean();
      for (const g of dbList) {
        if (!activeGuilds.some(existing => existing.guildId === g.guildId)) {
          activeGuilds.push({
            guildId: g.guildId,
            guildName: g.guildName,
            iconUrl: g.iconUrl || '',
            memberCount: g.memberCount || 0,
            isAdmin: true,
          });
        }
      }
    }

    const defaultGuildId = activeGuilds[0]?.guildId || '';
    return sendJson(res, 200, { guilds: activeGuilds, defaultGuildId });
  }

  // 2. GET /api/me - Profile, wallet balance, and orders for requested guild
  if (pathname === '/api/me' && method === 'GET') {
    let guildId = requestedGuildId;
    if (!guildId || guildId === 'global') {
      const firstGuild = await Guild.findOne({ status: 'active' }).sort({ guildName: 1 }).lean();
      guildId = firstGuild ? firstGuild.guildId : 'invalid';
    }

    // Verify membership for regular users
    if (!isPrivileged && guildId !== 'invalid') {
      const isMember = await isUserMemberOfGuild(userId, guildId, botClient);
      if (!isMember) {
        guildId = 'invalid';
      }
    }

    const guildInfo = guildId === 'invalid'
      ? { guildId: 'invalid', guildName: 'Unknown Server' }
      : await resolveGuildInfo(guildId, botClient);

    // Get specific server wallet balance
    const serverWallet = guildId === 'invalid' ? null : await Wallet.findOne({ userId, guildId }).lean();
    const serverBalance = serverWallet ? serverWallet.balance : 0;

    // Also get all wallets for overview
    const allWallets = await Wallet.find({ userId }).lean();
    const totalAcrossServers = allWallets.reduce((acc, w) => acc + (w.balance || 0), 0);

    // Filter orders, inventory, and ledger for this guild
    const guildFilter = guildId === 'global' ? {} : { guildId: { $in: [guildId, 'global'] } };

    // User data isolation: strictly show ONLY the logged-in user's personal orders & ledger
    const orderFilter = { userId, ...guildFilter };
    const ledgerFilter = { userId, ...guildFilter };

    const recentOrders = guildId === 'invalid' ? [] : await Order.find(orderFilter).sort({ createdAt: -1 }).limit(100).lean();
    const rawInventory = guildId === 'invalid' ? [] : await UserInventory.find({ userId, ...guildFilter }).sort({ createdAt: -1 }).limit(100).lean();
    const inventory = await enrichInventoryItems(rawInventory, guildId, botClient);
    const ledger = guildId === 'invalid' ? [] : await Ledger.find(ledgerFilter).sort({ createdAt: -1 }).limit(200).lean();
    const conversionRate = guildId === 'invalid' ? 1 : await getCoinRate(guildId);

    // Enrich orders and ledger entries with actual server name for multi-server display
    const guildNameCache = new Map([
      ['global', 'Global Overview'],
      ['782239943228391434', 'Computer World'],
      ['1103380063925317783', 'Ventrix Official'],
    ]);

    const getGuildName = async (gid) => {
      if (!gid || gid === 'global') return 'Global Overview';
      if (guildNameCache.has(gid)) return guildNameCache.get(gid);
      const info = await resolveGuildInfo(gid, botClient);
      const name = info?.guildName || 'Discord Server';
      guildNameCache.set(gid, name);
      return name;
    };

    for (const o of recentOrders) {
      if (!o.guildName) {
        o.guildName = await getGuildName(o.guildId);
      }
    }
    const userCache = new Map();
    for (const l of ledger) {
      if (!l.guildName) {
        l.guildName = await getGuildName(l.guildId);
      }
      const uid = l.userId;
      if (uid) {
        if (userCache.has(uid)) {
          const cached = userCache.get(uid);
          l.username = l.username || cached.username;
          l.userTag = cached.userTag;
          l.avatar = cached.avatar;
        } else if (uid === session.userId) {
          l.username = l.username || session.username;
          l.userTag = '#0001';
          l.avatar = session.avatar;
          userCache.set(uid, { username: l.username, userTag: l.userTag, avatar: l.avatar });
        } else {
          try {
            const memberOrUser = botClient?.users?.cache?.get(uid) || await botClient?.users?.fetch(uid).catch(() => null);
            if (memberOrUser) {
              const uName = memberOrUser.displayName || memberOrUser.username;
              const uTag = memberOrUser.discriminator && memberOrUser.discriminator !== '0' ? `#${memberOrUser.discriminator}` : `#${uid.slice(-4)}`;
              const uAvatar = memberOrUser.displayAvatarURL?.({ size: 64 }) || memberOrUser.avatarURL?.() || `https://cdn.discordapp.com/embed/avatars/${(parseInt(uid.slice(-1) || '0') % 5)}.png`;
              l.username = l.username || uName;
              l.userTag = uTag;
              l.avatar = uAvatar;
              userCache.set(uid, { username: l.username, userTag: uTag, avatar: uAvatar });
            } else {
              l.username = l.username || `User_${uid.slice(-4)}`;
              l.userTag = `#${uid.slice(-4)}`;
              l.avatar = `https://cdn.discordapp.com/embed/avatars/${(parseInt(uid.slice(-1) || '0') % 5)}.png`;
              userCache.set(uid, { username: l.username, userTag: l.userTag, avatar: l.avatar });
            }
          } catch {
            l.username = l.username || `User_${uid.slice(-4)}`;
            l.userTag = `#${uid.slice(-4)}`;
            l.avatar = `https://cdn.discordapp.com/embed/avatars/0.png`;
          }
        }
      }
    }

    const isGuildAdmin = isPrivileged;

    // Fetch live Discord member to evaluate role-based and balance-based membership tier
    const activeGuild = (guildId && guildId !== 'global' && guildId !== 'invalid')
      ? (botClient?.guilds?.cache?.get(guildId) || await botClient?.guilds?.fetch(guildId).catch(() => null))
      : null;
    let discordMember = null;
    if (activeGuild) {
      discordMember = activeGuild.members?.cache?.get(userId) || await activeGuild.members?.fetch(userId).catch(() => null);
    }

    const tierThresholds = config.tierThresholds || { diamond: 5000, gold: 2000, silver: 500, vip: 100 };
    const userTier = getMemberTier(serverBalance, userId, discordMember);
    const userTierTheme = getTierTheme(userTier);
    const userTierProgress = getTierProgress(serverBalance);

    return sendJson(res, 200, {
      user: {
        userId: session.userId,
        username: session.username,
        avatar: session.avatar,
        role: session.role,
        isGuildAdmin,
        balance: serverBalance,
        totalBalance: totalAcrossServers,
        currentGuild: guildInfo,
        conversionRate,
        tier: userTier,
        tierTheme: userTierTheme,
        tierProgress: userTierProgress,
      },
      recentOrders,
      inventory,
      ledger,
      config: {
        shopName: config.shopName || 'Ventrix Coin Shop',
        coinName: config.coinName || 'VCoins',
        conversionRate,
        tierThresholds,
      },
    });
  }

  // 3. GET /api/shop - Shop products strictly for requested server with filters, sort, counts, and pagination
  if (pathname === '/api/shop' && method === 'GET') {
    const guildId = requestedGuildId || 'global';

    if (!isPrivileged && guildId !== 'global') {
      const isMember = await isUserMemberOfGuild(userId, guildId, botClient);
      if (!isMember) {
        return sendJson(res, 200, {
          success: true,
          products: [],
          total: 0,
          page: 1,
          totalPages: 0,
          limit: 8,
          categoryCounts: { all: 0, roles: 0, consumables: 0, claims: 0 },
          guildId,
          guildName: 'Unknown Server',
          userBalance: 0,
        });
      }
    }

    const guildInfo = await resolveGuildInfo(guildId, botClient);

    // Fetch user wallet balance for current guild
    let userBalance = 0;
    try {
      const userWallet = await Wallet.findOne({ userId, guildId: { $in: [guildId, 'global'] } }).lean();
      if (userWallet) userBalance = userWallet.balance || 0;
    } catch (e) {}

    // Calculate dynamic category counts for all active products in this server
    const baseServerFilter = {
      active: true,
      guildId: { $in: [guildId, 'global'] },
    };

    const [allCount, rolesCount, consumablesCount, claimsCount] = await Promise.all([
      Product.countDocuments(baseServerFilter),
      Product.countDocuments({
        ...baseServerFilter,
        $or: [
          { behaviorType: { $in: ['role_permanent', 'role_timed', 'role_temporary'] } },
          { roleId: { $ne: null } },
        ],
      }),
      Product.countDocuments({
        ...baseServerFilter,
        behaviorType: 'consumable',
      }),
      Product.countDocuments({
        ...baseServerFilter,
        behaviorType: 'manual_claim',
      }),
    ]);

    const categoryCounts = {
      all: allCount,
      roles: rolesCount,
      consumables: consumablesCount,
      claims: claimsCount,
    };

    // Filter params
    const category = url.searchParams.get('category') || 'all';
    const typeFilter = url.searchParams.get('type') || 'all';
    const statusFilter = url.searchParams.get('status') || 'all';
    const priceRange = url.searchParams.get('priceRange') || 'all';
    const sortParam = url.searchParams.get('sort') || 'newest';
    const searchQuery = (url.searchParams.get('search') || '').trim();
    const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(url.searchParams.get('limit') || '8', 10) || 8));

    const filter = { ...baseServerFilter };

    // Category filter
    if (category === 'roles') {
      filter.$or = [
        { behaviorType: { $in: ['role_permanent', 'role_timed', 'role_temporary'] } },
        { roleId: { $ne: null } },
      ];
    } else if (category === 'consumables') {
      filter.behaviorType = 'consumable';
    } else if (category === 'claims') {
      filter.behaviorType = 'manual_claim';
    }

    // Type filter: STATIC or TIMED
    if (typeFilter === 'STATIC' || typeFilter === 'TIMED') {
      filter.type = typeFilter;
    }

    // Status filter: in_stock or out_of_stock
    if (statusFilter === 'in_stock') {
      filter.$and = filter.$and || [];
      filter.$and.push({
        $or: [{ stock: null }, { stock: { $gt: 0 } }],
      });
    } else if (statusFilter === 'out_of_stock') {
      filter.stock = { $lte: 0 };
    }

    // Price range filter
    if (priceRange === 'under_500') {
      filter.coins = { $lt: 500 };
    } else if (priceRange === '500_1500') {
      filter.coins = { $gte: 500, $lte: 1500 };
    } else if (priceRange === '1500_3000') {
      filter.coins = { $gte: 1500, $lte: 3000 };
    } else if (priceRange === 'above_3000') {
      filter.coins = { $gt: 3000 };
    }

    // Search query
    if (searchQuery) {
      const escaped = searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const searchRegex = new RegExp(escaped, 'i');
      filter.$and = filter.$and || [];
      filter.$and.push({
        $or: [{ name: searchRegex }, { description: searchRegex }],
      });
    }

    // Sorting
    let sortObj = { createdAt: -1 };
    if (sortParam === 'newest') sortObj = { createdAt: -1 };
    else if (sortParam === 'oldest') sortObj = { createdAt: 1 };
    else if (sortParam === 'price_asc') sortObj = { coins: 1, createdAt: -1 };
    else if (sortParam === 'price_desc') sortObj = { coins: -1, createdAt: -1 };
    else if (sortParam === 'popular') sortObj = { salesCount: -1, createdAt: -1 };
    else if (sortParam === 'name_asc') sortObj = { name: 1 };

    const total = await Product.countDocuments(filter);
    const totalPages = Math.ceil(total / limit) || 1;
    const skip = (page - 1) * limit;

    const products = await Product.find(filter)
      .sort(sortObj)
      .skip(skip)
      .limit(limit)
      .lean();

    return sendJson(res, 200, {
      success: true,
      products,
      total,
      page,
      totalPages,
      limit,
      categoryCounts,
      guildId,
      guildName: guildInfo.guildName,
      userBalance,
    });
  }

  // 4. POST /api/buycoin - Top up coins for specific server
  if (pathname === '/api/buycoin' && method === 'POST') {
    const body = await parseJsonBody(req);
    const amountInr = Number(body.amount);
    const guildId = body.guildId || 'global';

    if (!isPrivileged && guildId !== 'global') {
      const isMember = await isUserMemberOfGuild(userId, guildId, botClient);
      if (!isMember) {
        return sendJson(res, 403, { error: 'You can only top up coins in servers where you are currently a member.' });
      }
    }

    const guildInfo = await resolveGuildInfo(guildId, botClient);

    if (!amountInr || amountInr < 1) {
      return sendJson(res, 400, { error: 'Amount must be at least ₹1.' });
    }

    const upiId = config.upiId;
    const payeeName = config.upiPayeeName;
    if (!upiId || !payeeName) {
      return sendJson(res, 400, { error: 'UPI ID is not configured on the server.' });
    }

    const conversionRate = await getCoinRate(guildId);
    const coinsToCredit = inrToCoins(amountInr, conversionRate);
    const payablePaise = Math.round(amountInr * 100);

    const ttlMinutes = Math.max(5, Number(config.orderTtlMinutes || 10));
    const expiresAt = new Date(Date.now() + ttlMinutes * 60_000);
    const orderId = newOrderId();
    const notePrefix = config.upiNotePrefix || 'VentrixShop';

    const upiUri = makeUpiUri({
      upiId,
      payeeName,
      amountPaise: payablePaise,
      note: `${notePrefix} ${orderId}`,
    });

    const qrDataUrl = await QRCode.toDataURL(upiUri, { width: 320, margin: 2 });

    const order = await Order.create({
      orderId,
      userId,
      username: session.username,
      guildId,
      guildName: guildInfo.guildName,
      type: 'coin_purchase',
      productName: `${coinsToCredit} ${config.coinName || 'Coins'}`,
      amountInr,
      payablePaise,
      coins: coinsToCredit,
      status: 'pending',
      upiUri,
      expiresAt,
      note: `Web Top-up for server: ${guildInfo.guildName} (${guildId})`,
    });

    return sendJson(res, 200, {
      success: true,
      order: {
        orderId: order.orderId,
        amountInr: order.amountInr,
        coins: order.coins,
        expiresAt: order.expiresAt,
        upiUri: order.upiUri,
        qrDataUrl,
        guildName: guildInfo.guildName,
      },
    });
  }

  // 5. POST /api/buyitem - Purchase item in specific server
  if (pathname === '/api/buyitem' && method === 'POST') {
    const body = await parseJsonBody(req);
    const productId = body.productId;
    const guildId = body.guildId || 'global';

    if (!isPrivileged && guildId !== 'global') {
      const isMember = await isUserMemberOfGuild(userId, guildId, botClient);
      if (!isMember) {
        return sendJson(res, 403, { error: 'You can only purchase items in servers where you are currently a member.' });
      }
    }

    const guildInfo = await resolveGuildInfo(guildId, botClient);

    const product = await Product.findOne({
      _id: productId,
      active: true,
      guildId: { $in: [guildId, 'global'] },
    });

    if (!product) {
      return sendJson(res, 404, { error: 'Item not found or unavailable in this server.' });
    }

    if (product.stock !== null && product.stock <= 0) {
      return sendJson(res, 400, { error: 'Item is out of stock.' });
    }

    // Deduct coins atomically from user's server wallet
    const updatedWallet = await Wallet.findOneAndUpdate(
      { userId, guildId, balance: { $gte: product.coins } },
      { $inc: { balance: -product.coins }, $setOnInsert: { username: session.username, guildName: guildInfo.guildName } },
      { new: true }
    );

    if (!updatedWallet) {
      return sendJson(res, 400, {
        error: `Insufficient ${config.coinName || 'Coins'} balance in server "${guildInfo.guildName}".`,
      });
    }

    // Decrement stock if finite, and increment salesCount
    const productUpdate = { $inc: { salesCount: 1 } };
    if (product.stock !== null) {
      productUpdate.$inc.stock = -1;
    }
    await Product.updateOne({ _id: product._id }, productUpdate);

    const orderId = newOrderId();
    const inventoryId = `INV-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 10000).toString(36).toUpperCase()}`;
    const initialStatus = product.behaviorType === 'manual_claim' ? 'claim_required' : 'available';

    await Promise.all([
      Order.create({
        orderId,
        userId,
        username: session.username,
        guildId,
        guildName: guildInfo.guildName,
        type: 'shop_purchase',
        productId: product._id,
        productName: product.name,
        amountInr: 0,
        payablePaise: 0,
        coins: product.coins,
        status: 'paid',
        upiUri: '',
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        paidAt: new Date(),
        verificationSource: 'coins',
        note: `Purchased: ${product.name} in ${guildInfo.guildName}`,
      }),
      Ledger.create({
        guildId,
        guildName: guildInfo.guildName,
        userId,
        username: session.username,
        orderId,
        rrn: `WEB-BUY-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
        coins: -product.coins,
        type: 'shop_purchase',
        reason: `Purchased item: ${product.name} (${product._id})`,
        performedBy: userId,
      }),
      UserInventory.create({
        inventoryId,
        userId,
        username: session.username,
        guildId,
        guildName: guildInfo.guildName,
        productId: product._id,
        productName: product.name,
        itemType: product.type || 'STATIC',
        behaviorType: product.behaviorType || 'manual_claim',
        roleId: product.roleId || null,
        duration: product.duration || '',
        durationMs: product.durationMs || (product.duration ? parseDuration(product.duration) : 0) || 0,
        quantity: 1,
        purchasedAt: new Date(),
        status: initialStatus,
        orderId,
      }),
    ]);

    return sendJson(res, 200, {
      success: true,
      message: `Successfully purchased ${product.name}! Item added to your inventory.`,
      orderId,
      inventoryId,
      newBalance: updatedWallet.balance,
      guildName: guildInfo.guildName,
    });
  }

  // 6.5 GET /api/inventory — STRICT SERVER-ISOLATED PURCHASED ITEMS
  if (pathname === '/api/inventory' && method === 'GET') {
    const guildId = requestedGuildId;
    if (!guildId || guildId === 'invalid') {
      return sendJson(res, 400, { error: 'Please select a valid Discord server from the header.' });
    }
    const guildFilter = guildId === 'global' ? {} : { guildId: { $in: [guildId, 'global'] } };
    const rawItems = await UserInventory.find({ userId, ...guildFilter }).sort({ createdAt: -1 }).limit(100).lean();
    const items = await enrichInventoryItems(rawItems, guildId, botClient);
    return sendJson(res, 200, { inventory: items });
  }

  // 6.6 POST /api/inventory/use — ACTIVATE OR CLAIM AN INVENTORY ITEM
  if (pathname === '/api/inventory/use' && method === 'POST') {
    const body = await parseJsonBody(req);
    const { inventoryId, guildId: bodyGuildId } = body;
    const guildId = bodyGuildId || requestedGuildId;

    if (!inventoryId) {
      return sendJson(res, 400, { error: 'Inventory ID is required.' });
    }
    if (!guildId || guildId === 'global' || guildId === 'invalid') {
      return sendJson(res, 400, { error: 'Please select a valid Discord server.' });
    }

    // Verify member belongs to guild
    if (!isPrivileged) {
      const isMember = await isUserMemberOfGuild(userId, guildId, botClient);
      if (!isMember) {
        return sendJson(res, 403, { error: 'You are not a member of this Discord server.' });
      }
    }

    // Find the item
    const item = await UserInventory.findOne({
      inventoryId,
      userId,
      guildId: { $in: [guildId, 'global'] },
      status: { $in: ['available', 'claim_required'] },
    });

    if (!item) {
      return sendJson(res, 404, {
        error: 'This item is no longer available in your inventory or was already used.'
      });
    }

    // ─── BEHAVIOR 1: Discord Role Items (Permanent or Timed) ───────────────
    if (item.behaviorType === 'role_permanent' || item.behaviorType === 'role_temporary') {
      if (!item.roleId) {
        return sendJson(res, 400, { error: 'This item has no Discord role ID configured. Please contact server admins.' });
      }

      const guild = botClient.guilds?.cache?.get(guildId) || await botClient.guilds?.fetch(guildId).catch(() => null);
      if (!guild) {
        return sendJson(res, 404, { error: 'Discord server not found or bot is not in the server.' });
      }

      const role = guild.roles?.cache?.get(item.roleId) || await guild.roles?.fetch(item.roleId).catch(() => null);
      if (!role) {
        return sendJson(res, 404, { error: 'The configured role was deleted or does not exist in this Discord server.' });
      }

      const botMember = guild.members?.me || await guild.members?.fetchMe().catch(() => null);
      if (!botMember?.permissions?.has(PermissionFlagsBits.ManageRoles)) {
        return sendJson(res, 400, { error: 'Bot is missing the "Manage Roles" permission in this Discord server.' });
      }

      if (botMember.roles.highest.position <= role.position) {
        return sendJson(res, 400, {
          error: `Bot hierarchy error: The bot's highest role is lower than @${role.name}. An admin must move the bot's role higher in Server Settings > Roles.`
        });
      }

      const member = guild.members?.cache?.get(userId) || await guild.members?.fetch(userId).catch(() => null);
      if (!member) {
        return sendJson(res, 404, { error: 'You are not found in this Discord server. Please join first.' });
      }

      const hasRoleAlready = member.roles.cache.has(role.id);
      let expiresAt = null;
      let isRenewal = false;

      if (item.itemType === 'TIMED' || item.behaviorType === 'role_temporary') {
        let durationMs = item.durationMs || 0;
        if (!durationMs && item.duration) {
          durationMs = parseDuration(item.duration) || 0;
        }
        if (!durationMs && item.productId) {
          const origProd = await Product.findById(item.productId).lean();
          durationMs = origProd?.durationMs || (origProd?.duration ? parseDuration(origProd.duration) : 0) || 0;
        }
        if (!durationMs) {
          durationMs = 86400000;
        }

        const existingActivation = await ItemActivation.findOne({
          userId,
          guildId,
          roleId: role.id,
          status: 'active',
          expiresAt: { $gt: new Date() }
        });

        if (existingActivation) {
          isRenewal = true;
          const baseTs = Math.max(Date.now(), existingActivation.expiresAt ? existingActivation.expiresAt.getTime() : Date.now());
          expiresAt = new Date(baseTs + durationMs);
          existingActivation.expiresAt = expiresAt;
          existingActivation.inventoryId = item.inventoryId;
          await existingActivation.save();

          await UserInventory.updateMany(
            {
              userId,
              guildId: { $in: [guildId, 'global'] },
              roleId: role.id,
              status: 'active'
            },
            { expiresAt }
          );
        } else {
          expiresAt = new Date(Date.now() + durationMs);
        }
      } else {
        // Permanent role: check if user already has it
        if (hasRoleAlready) {
          return sendJson(res, 400, {
            error: `You already have the @${role.name} role assigned! Your inventory item was not consumed.`
          });
        }
      }

      // Assign the role in Discord
      if (!hasRoleAlready) {
        await member.roles.add(role.id, `Used web inventory item: ${item.productName} (${item.inventoryId})`);
      }

      // Record ItemActivation
      if (!isRenewal) {
        const activationId = `ACT-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 1000).toString(36).toUpperCase()}`;
        await ItemActivation.create({
          activationId,
          inventoryId: item.inventoryId,
          userId,
          guildId,
          productId: item.productId,
          roleId: role.id,
          activatedAt: new Date(),
          expiresAt,
          status: 'active',
        });
      }

      // Update inventory item status
      item.status = item.itemType === 'TIMED' ? 'active' : 'consumed';
      item.consumedAt = new Date();
      item.expiresAt = expiresAt;
      await item.save();

      const durationStr = item.duration || (item.durationMs ? formatDuration(item.durationMs) : '');
      const successMsg = item.itemType === 'TIMED'
        ? `🎉 Role @${role.name} activated for ${durationStr}! It will expire automatically.`
        : `🎉 Permanent role @${role.name} granted successfully!`;

      return sendJson(res, 200, {
        success: true,
        message: successMsg,
        roleName: role.name,
        expiresAt,
        status: item.status,
        isRenewal
      });
    }

    // ─── BEHAVIOR 2: Manual Claim Items ───────────────────────────────────
    if (item.behaviorType === 'manual_claim') {
      const existingClaim = await ManualClaim.findOne({
        inventoryId: item.inventoryId,
        status: 'pending'
      });

      if (existingClaim) {
        return sendJson(res, 200, {
          success: true,
          message: `Claim already pending for ${item.productName}. Claim ID: ${existingClaim.claimId}. Staff has been notified.`,
          claimId: existingClaim.claimId,
          status: 'claim_required'
        });
      }

      const claimId = `CLM-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 1000).toString(36).toUpperCase()}`;
      await ManualClaim.create({
        claimId,
        inventoryId: item.inventoryId,
        userId,
        guildId,
        productId: item.productId,
        productName: item.productName,
        status: 'pending',
        ticketId: null,
      });

      return sendJson(res, 200, {
        success: true,
        message: `Claim submitted for ${item.productName}! Claim ID: ${claimId}. Staff will fulfill your reward.`,
        claimId,
        status: 'claim_required'
      });
    }

    // ─── BEHAVIOR 3: Consumable / Other ───────────────────────────────────
    item.status = 'consumed';
    item.consumedAt = new Date();
    await item.save();

    return sendJson(res, 200, {
      success: true,
      message: `Successfully used ${item.productName}!`,
      status: 'consumed'
    });
  }

  // 7. GET /api/transactions — STRICT SERVER DATA ISOLATION
  if (pathname === '/api/transactions' && method === 'GET') {
    const guildId = requestedGuildId;
    if (!guildId || guildId === 'global' || guildId === 'invalid') {
      return sendJson(res, 400, { error: 'Please select a valid Discord server from the header.' });
    }

    if (!isPrivileged) {
      const isMember = await isUserMemberOfGuild(userId, guildId, botClient);
      if (!isMember) {
        return sendJson(res, 403, { error: 'Access denied. You are not an active member of this server.' });
      }
    }

    const guildInfo = await resolveGuildInfo(guildId, botClient);
    // User data isolation: strictly show ONLY the logged-in user's records in this server
    const baseFilter = { guildId, userId: session.userId };

    // Date Range Filter
    const dateRange = url.searchParams.get('dateRange') || 'all';
    const startDateParam = url.searchParams.get('startDate');
    const endDateParam = url.searchParams.get('endDate');

    const dateQuery = {};
    const now = new Date();
    if (dateRange === 'today') {
      const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
      const endToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
      dateQuery.createdAt = { $gte: startToday, $lte: endToday };
    } else if (dateRange === '7d') {
      const past7 = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      dateQuery.createdAt = { $gte: past7 };
    } else if (dateRange === '30d') {
      const past30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      dateQuery.createdAt = { $gte: past30 };
    } else if (dateRange === 'current_month' || dateRange === 'month') {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
      dateQuery.createdAt = { $gte: startOfMonth, $lte: endOfMonth };
    } else if (dateRange === 'custom' && (startDateParam || endDateParam)) {
      dateQuery.createdAt = {};
      if (startDateParam) {
        const s = new Date(startDateParam);
        if (!isNaN(s)) dateQuery.createdAt.$gte = s;
      }
      if (endDateParam) {
        const e = new Date(endDateParam);
        if (!isNaN(e)) {
          if (endDateParam.length <= 10) e.setHours(23, 59, 59, 999);
          dateQuery.createdAt.$lte = e;
        }
      }
      if (Object.keys(dateQuery.createdAt).length === 0) delete dateQuery.createdAt;
    }

    const serverDateFilter = { ...baseFilter, ...dateQuery };

    // Transaction Type Filter
    const typeFilter = url.searchParams.get('type') || 'all';
    let typeQuery = {};
    if (typeFilter === 'topup' || typeFilter === 'purchase_credit') {
      typeQuery = { type: { $in: ['purchase_credit', 'topup', 'upi_topup'] } };
    } else if (typeFilter === 'shop' || typeFilter === 'shop_purchase') {
      typeQuery = { type: { $in: ['shop_purchase', 'purchase'] } };
    } else if (typeFilter === 'admin') {
      typeQuery = { type: { $in: ['admin_grant', 'admin_deduct', 'admin'] } };
    } else if (typeFilter === 'reward') {
      typeQuery = { type: { $in: ['DROPBOX_REWARD', 'reward', 'reward_credit'] } };
    } else if (typeFilter === 'transfer') {
      typeQuery = { type: 'transfer' };
    }

    // Direction Filter (credit or debit)
    const direction = url.searchParams.get('direction') || 'all';
    let directionQuery = {};
    if (direction === 'credit') {
      directionQuery = { coins: { $gt: 0 } };
    } else if (direction === 'debit') {
      directionQuery = { coins: { $lt: 0 } };
    }

    // Search Query (reason, orderId, rrn, username, userId)
    const search = (url.searchParams.get('search') || '').trim();
    let searchQuery = {};
    if (search) {
      const safeSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const reg = new RegExp(safeSearch, 'i');
      searchQuery = {
        $or: [
          { reason: reg },
          { orderId: reg },
          { rrn: reg },
          { transactionId: reg },
          { counterparty: reg },
          { counterpartyUsername: reg },
          { username: reg },
          { userId: reg },
          { performedBy: reg }
        ]
      };
    }

    const finalFilter = {
      ...serverDateFilter,
      ...typeQuery,
      ...directionQuery,
      ...searchQuery,
    };

    // Calculate real summary statistics for this exact server & date period
    const summaryAgg = await Ledger.aggregate([
      { $match: serverDateFilter },
      {
        $group: {
          _id: null,
          totalCredits: {
            $sum: { $cond: [{ $gt: ['$coins', 0] }, '$coins', 0] }
          },
          totalCreditsCount: {
            $sum: { $cond: [{ $gt: ['$coins', 0] }, 1, 0] }
          },
          totalDebits: {
            $sum: { $cond: [{ $lt: ['$coins', 0] }, { $abs: '$coins' }, 0] }
          },
          totalDebitsCount: {
            $sum: { $cond: [{ $lt: ['$coins', 0] }, 1, 0] }
          },
          totalCount: { $sum: 1 }
        }
      }
    ]);

    const summaryStats = summaryAgg[0] || {
      totalCredits: 0,
      totalCreditsCount: 0,
      totalDebits: 0,
      totalDebitsCount: 0,
      totalCount: 0
    };

    // Real Category Tab Counts for this server & date range
    const tabCountsAgg = await Ledger.aggregate([
      { $match: serverDateFilter },
      {
        $group: {
          _id: null,
          all: { $sum: 1 },
          topup: {
            $sum: { $cond: [{ $in: ['$type', ['purchase_credit', 'topup', 'upi_topup']] }, 1, 0] }
          },
          shop: {
            $sum: { $cond: [{ $in: ['$type', ['shop_purchase', 'purchase']] }, 1, 0] }
          },
          admin: {
            $sum: { $cond: [{ $in: ['$type', ['admin_grant', 'admin_deduct', 'admin']] }, 1, 0] }
          },
          reward: {
            $sum: { $cond: [{ $in: ['$type', ['DROPBOX_REWARD', 'reward', 'reward_credit']] }, 1, 0] }
          },
          transfer: {
            $sum: { $cond: [{ $in: ['$type', ['transfer']] }, 1, 0] }
          }
        }
      }
    ]);

    const counts = tabCountsAgg[0] || { all: 0, topup: 0, shop: 0, admin: 0, reward: 0, transfer: 0 };

    // Pagination
    const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get('limit') || '10', 10)));
    const totalMatching = await Ledger.countDocuments(finalFilter);
    const totalPages = Math.max(1, Math.ceil(totalMatching / limit));
    const sortOrder = url.searchParams.get('sort') === 'asc' ? 1 : -1;

    const rawRecords = await Ledger.find(finalFilter)
      .sort({ createdAt: sortOrder, _id: sortOrder })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    // Enrich records with user details and clean reason
    const userCache = new Map();
    const enriched = await Promise.all(rawRecords.map(async (l) => {
      const uid = l.userId;
      let uName = l.username;
      let uTag = '#0001';
      let uAvatar = `https://cdn.discordapp.com/embed/avatars/0.png`;

      if (uid) {
        if (userCache.has(uid)) {
          const c = userCache.get(uid);
          uName = uName || c.uName;
          uTag = c.uTag;
          uAvatar = c.uAvatar;
        } else if (uid === session.userId) {
          uName = session.username || uName;
          uAvatar = session.avatar || uAvatar;
          uTag = '#0001';
          userCache.set(uid, { uName, uTag, uAvatar });
        } else {
          try {
            const memberOrUser = botClient?.users?.cache?.get(uid) || await botClient?.users?.fetch(uid).catch(() => null);
            if (memberOrUser) {
              uName = memberOrUser.displayName || memberOrUser.username || uName;
              uTag = memberOrUser.discriminator && memberOrUser.discriminator !== '0' ? `#${memberOrUser.discriminator}` : `#${uid.slice(-4)}`;
              uAvatar = memberOrUser.displayAvatarURL?.({ size: 64 }) || memberOrUser.avatarURL?.() || `https://cdn.discordapp.com/embed/avatars/${(parseInt(uid.slice(-1) || '0') % 5)}.png`;
            } else {
              uName = uName || `User_${uid.slice(-4)}`;
              uTag = `#${uid.slice(-4)}`;
              uAvatar = `https://cdn.discordapp.com/embed/avatars/${(parseInt(uid.slice(-1) || '0') % 5)}.png`;
            }
          } catch {
            uName = uName || `User_${uid.slice(-4)}`;
            uTag = `#${uid.slice(-4)}`;
          }
          userCache.set(uid, { uName, uTag, uAvatar });
        }
      }

      const cleanReason = formatCleanReason(l.reason, l.type);

      return {
        _id: String(l._id),
        guildId: l.guildId,
        userId: l.userId,
        username: uName,
        userTag: uTag,
        avatar: uAvatar,
        coins: l.coins,
        type: l.type,
        direction: l.direction || (l.coins >= 0 ? 'credit' : 'debit'),
        counterparty: l.counterparty || null,
        counterpartyUsername: l.counterpartyUsername || '',
        balanceBefore: l.balanceBefore ?? null,
        balanceAfter: l.balanceAfter ?? null,
        status: l.status || 'completed',
        transactionId: l.transactionId || l.orderId || l.rrn,
        reason: cleanReason,
        description: l.description || cleanReason,
        rawReason: l.reason || '',
        orderId: l.orderId,
        rrn: l.rrn,
        reference: l.transactionId || l.orderId || l.rrn,
        performedBy: l.performedBy,
        createdAt: l.createdAt,
      };
    }));

    return sendJson(res, 200, {
      success: true,
      guildId,
      guildName: guildInfo.guildName,
      transactions: enriched,
      pagination: {
        page,
        limit,
        total: totalMatching,
        totalRecords: totalMatching,
        totalPages,
        startIndex: totalMatching === 0 ? 0 : (page - 1) * limit + 1,
        endIndex: Math.min(totalMatching, page * limit)
      },
      summary: {
        totalCredits: summaryStats.totalCredits,
        totalCreditsCount: summaryStats.totalCreditsCount,
        totalDebits: summaryStats.totalDebits,
        totalDebitsCount: summaryStats.totalDebitsCount,
        totalTransactions: summaryStats.totalCount,
        netChange: summaryStats.totalCredits - summaryStats.totalDebits
      },
      counts: {
        all: counts.all,
        topup: counts.topup,
        shop: counts.shop,
        admin: counts.admin,
        reward: counts.reward,
        transfer: counts.transfer || 0
      }
    });
  }

  // 8. GET /api/transactions/export — EXCEL EXPORT SCOPED TO GUILD
  if (pathname === '/api/transactions/export' && method === 'GET') {
    const guildId = requestedGuildId;
    if (!guildId || guildId === 'global' || guildId === 'invalid') {
      return sendJson(res, 400, { error: 'Please select a valid Discord server from the header.' });
    }

    if (!isPrivileged) {
      const isMember = await isUserMemberOfGuild(userId, guildId, botClient);
      if (!isMember) {
        return sendJson(res, 403, { error: 'Access denied. You are not an active member of this server.' });
      }
    }

    // User data isolation: Excel exports ONLY the logged-in user's records in this server
    const baseFilter = { guildId, userId: session.userId };

    // Date Range
    const dateRange = url.searchParams.get('dateRange') || 'all';
    const startDateParam = url.searchParams.get('startDate');
    const endDateParam = url.searchParams.get('endDate');

    const dateQuery = {};
    const now = new Date();
    if (dateRange === 'today') {
      dateQuery.createdAt = {
        $gte: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0),
        $lte: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999)
      };
    } else if (dateRange === '7d') {
      dateQuery.createdAt = { $gte: new Date(now.getTime() - 7 * 86400000) };
    } else if (dateRange === '30d') {
      dateQuery.createdAt = { $gte: new Date(now.getTime() - 30 * 86400000) };
    } else if (dateRange === 'current_month' || dateRange === 'month') {
      dateQuery.createdAt = {
        $gte: new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0),
        $lte: new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)
      };
    } else if (dateRange === 'custom' && (startDateParam || endDateParam)) {
      dateQuery.createdAt = {};
      if (startDateParam) {
        const s = new Date(startDateParam);
        if (!isNaN(s)) dateQuery.createdAt.$gte = s;
      }
      if (endDateParam) {
        const e = new Date(endDateParam);
        if (!isNaN(e)) {
          if (endDateParam.length <= 10) e.setHours(23, 59, 59, 999);
          dateQuery.createdAt.$lte = e;
        }
      }
      if (Object.keys(dateQuery.createdAt).length === 0) delete dateQuery.createdAt;
    }

    // Type query
    const typeFilter = url.searchParams.get('type') || 'all';
    let typeQuery = {};
    if (typeFilter === 'topup' || typeFilter === 'purchase_credit') {
      typeQuery = { type: { $in: ['purchase_credit', 'topup', 'upi_topup'] } };
    } else if (typeFilter === 'shop' || typeFilter === 'shop_purchase') {
      typeQuery = { type: { $in: ['shop_purchase', 'purchase'] } };
    } else if (typeFilter === 'admin') {
      typeQuery = { type: { $in: ['admin_grant', 'admin_deduct', 'admin'] } };
    } else if (typeFilter === 'reward') {
      typeQuery = { type: { $in: ['DROPBOX_REWARD', 'reward', 'reward_credit'] } };
    }

    // Direction filter
    const direction = url.searchParams.get('direction') || 'all';
    let directionQuery = {};
    if (direction === 'credit') {
      directionQuery = { coins: { $gt: 0 } };
    } else if (direction === 'debit') {
      directionQuery = { coins: { $lt: 0 } };
    }

    // Search query
    const search = (url.searchParams.get('search') || '').trim();
    let searchQuery = {};
    if (search) {
      const safeSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const reg = new RegExp(safeSearch, 'i');
      searchQuery = {
        $or: [
          { reason: reg },
          { orderId: reg },
          { rrn: reg },
          { username: reg },
          { userId: reg },
          { performedBy: reg }
        ]
      };
    }

    const exportFilter = {
      ...baseFilter,
      ...dateQuery,
      ...typeQuery,
      ...directionQuery,
      ...searchQuery,
    };

    const records = await Ledger.find(exportFilter)
      .sort({ createdAt: -1 })
      .limit(5000)
      .lean();

    // ── Build Excel workbook with ExcelJS ────────────────────────────────────
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Ventrix Coin Dashboard';
    workbook.created = now;

    const sheet = workbook.addWorksheet('Transactions', {
      views: [{ state: 'frozen', ySplit: 1 }],
      pageSetup: { paperSize: 9, orientation: 'landscape' },
    });

    // ── Column definitions ─────────────────────────────────────────────────
    sheet.columns = [
      { header: 'Date & Time',         key: 'date',   width: 24 },
      { header: 'Member / User',        key: 'member', width: 22 },
      { header: 'Discord User ID',      key: 'userId', width: 22 },
      { header: 'Coin Change',          key: 'coins',  width: 16 },
      { header: 'Type',                 key: 'type',   width: 18 },
      { header: 'Reason / Item',        key: 'reason', width: 36 },
      { header: 'Reference / Order ID', key: 'ref',    width: 28 },
    ];

    // ── Header row styling ────────────────────────────────────────────────
    const headerRow = sheet.getRow(1);
    headerRow.eachCell((cell) => {
      cell.font      = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11, name: 'Calibri' };
      cell.fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF5B21B6' } };
      cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: false };
      cell.border    = { bottom: { style: 'medium', color: { argb: 'FF7C3AED' } } };
    });
    headerRow.height = 26;

    // ── AutoFilter on header row ──────────────────────────────────────────────
    sheet.autoFilter = {
      from: { row: 1, column: 1 },
      to:   { row: 1, column: sheet.columns.length },
    };

    // ── Data rows ────────────────────────────────────────────────────────────
    const GREEN_FONT = { argb: 'FF15803D' };
    const RED_FONT   = { argb: 'FFB91C1C' };
    const GREEN_BG   = { argb: 'FFF0FDF4' };
    const RED_BG     = { argb: 'FFFEF2F2' };
    const STRIPE_BG  = { argb: 'FFF5F3FF' };

    for (let i = 0; i < records.length; i++) {
      const r = records[i];
      const isOdd = i % 2 === 0;

      let typeLabel = (r.type || 'TRANSACTION').toUpperCase();
      if (r.type === 'purchase_credit')   typeLabel = 'TOP-UP CREDIT';
      else if (r.type === 'shop_purchase') typeLabel = 'SHOP PURCHASE';
      else if (r.type === 'admin_grant')   typeLabel = 'ADMIN GRANT';
      else if (r.type === 'admin_deduct')  typeLabel = 'ADMIN DEDUCT';
      else if (r.type === 'DROPBOX_REWARD') typeLabel = 'REWARD CREDIT';

      const cleanReason = formatCleanReason(r.reason, r.type);
      const ref         = r.orderId || r.rrn || '-';
      const coinVal     = r.coins;
      const isCredit    = coinVal >= 0;
      const coinText    = (isCredit ? '+' : '') + coinVal;

      const row = sheet.addRow({
        date:   new Date(r.createdAt),
        member: r.username || `User_${r.userId.slice(-4)}`,
        userId: r.userId,
        coins:  coinText,
        type:   typeLabel,
        reason: cleanReason,
        ref:    ref,
      });
      row.height = 20;

      // Date cell — native Excel date format
      const dateCell = row.getCell('date');
      dateCell.numFmt = 'mmm d, yyyy  hh:mm:ss AM/PM';
      dateCell.value  = new Date(r.createdAt);

      // Coin Change cell
      const coinCell = row.getCell('coins');
      coinCell.font      = { bold: true, color: isCredit ? GREEN_FONT : RED_FONT, name: 'Calibri', size: 11 };
      coinCell.fill      = { type: 'pattern', pattern: 'solid', fgColor: isCredit ? GREEN_BG : RED_BG };
      coinCell.alignment = { horizontal: 'center', vertical: 'middle' };

      // Row stripe & base alignment
      row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
        if (colNumber === 4) return;
        cell.alignment = { vertical: 'middle', wrapText: false };
        if (isOdd) {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: STRIPE_BG };
        }
        cell.border = { bottom: { style: 'thin', color: { argb: 'FFE9D5FF' } } };
      });
    }

    // ── Empty state ─────────────────────────────────────────────────────────
    if (records.length === 0) {
      const emptyRow = sheet.addRow({ date: 'No records found for the selected filters.' });
      emptyRow.getCell(1).font = { italic: true, color: { argb: 'FF6B7280' } };
    }

    // ── Generate filename ──────────────────────────────────────────────────
    const dateStamp = now.toISOString().slice(0, 10);
    const filename  = `Ventrix_Transactions_${dateStamp}.xlsx`;

    // ── Write buffer and respond ──────────────────────────────────────────────
    let xlsxBuffer;
    try {
      xlsxBuffer = await workbook.xlsx.writeBuffer();
    } catch (xlsxErr) {
      console.error('[Excel Export] writeBuffer failed:', xlsxErr);
      return sendJson(res, 500, { error: 'Failed to generate Excel file. Please try again.' });
    }

    res.writeHead(200, {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': xlsxBuffer.byteLength,
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    });
    return res.end(Buffer.from(xlsxBuffer));
  }

  // 9. GET /api/transactions/detail — AUDIT DETAIL VERIFIED TO GUILD
  if (pathname === '/api/transactions/detail' && method === 'GET') {
    const guildId = requestedGuildId;
    const txId = url.searchParams.get('id');

    if (!guildId || guildId === 'global' || guildId === 'invalid') {
      return sendJson(res, 400, { error: 'Please select a valid Discord server.' });
    }
    if (!txId) {
      return sendJson(res, 400, { error: 'Transaction ID is required.' });
    }

    if (!isPrivileged) {
      const isMember = await isUserMemberOfGuild(userId, guildId, botClient);
      if (!isMember) {
        return sendJson(res, 403, { error: 'Access denied for this server.' });
      }
    }

    // User data isolation: strictly allow viewing only the logged-in user's transaction
    let query = { guildId, userId: session.userId };
    if (mongoose.Types.ObjectId.isValid(txId)) {
      query._id = txId;
    } else {
      query.$or = [{ orderId: txId }, { rrn: txId }, { transactionId: txId }];
    }

    const tx = await Ledger.findOne(query).lean();
    if (!tx) {
      return sendJson(res, 404, { error: 'Transaction record not found in the selected server.' });
    }

    let relatedOrder = null;
    if (tx.orderId) {
      relatedOrder = await Order.findOne({ orderId: tx.orderId, guildId }).lean();
    }

    let relatedPayment = null;
    if (isPrivileged && (tx.rrn || relatedOrder?.rrn)) {
      const searchRrn = tx.rrn || relatedOrder?.rrn;
      relatedPayment = await Payment.findOne({ rrn: searchRrn, guildId }).lean();
    }

    let uName = tx.username;
    let uAvatar = 'https://cdn.discordapp.com/embed/avatars/0.png';
    let uTag = `#${tx.userId.slice(-4)}`;
    try {
      const memberOrUser = botClient?.users?.cache?.get(tx.userId) || await botClient?.users?.fetch(tx.userId).catch(() => null);
      if (memberOrUser) {
        uName = memberOrUser.displayName || memberOrUser.username || uName;
        uTag = memberOrUser.discriminator && memberOrUser.discriminator !== '0' ? `#${memberOrUser.discriminator}` : `#${tx.userId.slice(-4)}`;
        uAvatar = memberOrUser.displayAvatarURL?.({ size: 128 }) || memberOrUser.avatarURL?.() || uAvatar;
      }
    } catch {}

    const cleanReason = formatCleanReason(tx.reason, tx.type);

    return sendJson(res, 200, {
      success: true,
      transaction: {
        _id: String(tx._id),
        guildId: tx.guildId,
        guildName: tx.guildName,
        userId: tx.userId,
        username: uName,
        userTag: uTag,
        avatar: uAvatar,
        coins: tx.coins,
        type: tx.type,
        cleanReason,
        rawReason: tx.reason || 'No description provided.',
        orderId: tx.orderId,
        rrn: tx.rrn,
        performedBy: tx.performedBy || 'system',
        createdAt: tx.createdAt,
        order: relatedOrder ? {
          orderId: relatedOrder.orderId,
          type: relatedOrder.type,
          productName: relatedOrder.productName,
          amountInr: relatedOrder.amountInr,
          coins: relatedOrder.coins,
          status: relatedOrder.status,
          verificationSource: relatedOrder.verificationSource,
          createdAt: relatedOrder.createdAt,
          paidAt: relatedOrder.paidAt
        } : null,
        payment: relatedPayment ? {
          rrn: relatedPayment.rrn,
          amountInr: (relatedPayment.amountPaise || 0) / 100,
          senderName: relatedPayment.senderName || '',
          transactionDate: relatedPayment.transactionDate
        } : null
      }
    });
  }

  // 10. GET /api/orders — STRICT SERVER & USER DATA ISOLATION
  if (pathname === '/api/orders' && method === 'GET') {
    const guildId = requestedGuildId;
    if (!guildId || guildId === 'global' || guildId === 'invalid') {
      return sendJson(res, 400, { error: 'Please select a valid Discord server from the header.' });
    }

    if (!isPrivileged) {
      const isMember = await isUserMemberOfGuild(userId, guildId, botClient);
      if (!isMember) {
        return sendJson(res, 403, { error: 'Access denied. You are not an active member of this server.' });
      }
    }

    const guildInfo = await resolveGuildInfo(guildId, botClient);
    // User data isolation: strictly show ONLY the logged-in user's orders in this server
    const baseFilter = { guildId, userId: session.userId };

    // Status Filter: all, paid, pending, failed
    const statusParam = (url.searchParams.get('status') || 'all').toLowerCase();
    let statusQuery = {};
    if (statusParam === 'paid' || statusParam === 'completed') {
      statusQuery = { status: { $in: ['paid', 'completed'] } };
    } else if (statusParam === 'pending' || statusParam === 'review') {
      statusQuery = { status: { $in: ['pending', 'review'] } };
    } else if (statusParam === 'failed' || statusParam === 'expired' || statusParam === 'rejected') {
      statusQuery = { status: { $in: ['expired', 'rejected'] } };
    }

    // Search Query (orderId, productName, username, rrn)
    const search = (url.searchParams.get('search') || '').trim();
    let searchQuery = {};
    if (search) {
      const safeSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const reg = new RegExp(safeSearch, 'i');
      searchQuery = {
        $or: [
          { orderId: reg },
          { productName: reg },
          { username: reg },
          { rrn: reg }
        ]
      };
    }

    // Status counts strictly scoped to this server and user
    const [allCount, paidCount, pendingCount, failedCount] = await Promise.all([
      Order.countDocuments(baseFilter),
      Order.countDocuments({ ...baseFilter, status: { $in: ['paid', 'completed'] } }),
      Order.countDocuments({ ...baseFilter, status: { $in: ['pending', 'review'] } }),
      Order.countDocuments({ ...baseFilter, status: { $in: ['expired', 'rejected'] } })
    ]);

    // Sorting
    const sortField = url.searchParams.get('sortField') || 'createdAt';
    const sortDir = url.searchParams.get('sortDir') === 'asc' ? 1 : -1;
    const sortObj = {};
    if (sortField === 'coins') sortObj.coins = sortDir;
    else if (sortField === 'amountInr') sortObj.amountInr = sortDir;
    else sortObj.createdAt = sortDir;

    // Pagination
    const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get('limit') || '10', 10)));
    const skip = (page - 1) * limit;

    const finalFilter = {
      ...baseFilter,
      ...statusQuery,
      ...searchQuery
    };

    const totalMatching = await Order.countDocuments(finalFilter);
    const rawOrders = await Order.find(finalFilter)
      .sort(sortObj)
      .skip(skip)
      .limit(limit)
      .lean();

    // Hydrate avatar and formatted fields
    const userCache = new Map();
    const formattedOrders = await Promise.all(rawOrders.map(async (o) => {
      let uAvatar = null;
      let uTag = '#0001';
      let uName = o.username || session.username || 'Member';

      if (!userCache.has(o.userId)) {
        const u = await resolveDiscordUser(o.userId, botClient);
        userCache.set(o.userId, u);
      }
      const memberInfo = userCache.get(o.userId);
      if (memberInfo) {
        uAvatar = memberInfo.avatar;
        uTag = memberInfo.discriminator && memberInfo.discriminator !== '0' ? `#${memberInfo.discriminator}` : '#0001';
        if (memberInfo.username) uName = memberInfo.username;
      }

      // Determine product type
      let category = 'Role Purchase';
      const pNameLower = (o.productName || '').toLowerCase();
      if (o.type === 'coin_purchase' || pNameLower.includes('coin') || pNameLower.includes('vcoin')) {
        category = 'Coin Purchase';
      } else if (pNameLower.includes('claim') || pNameLower.includes('ticket')) {
        category = 'Claim Purchase';
      }

      return {
        _id: o._id,
        orderId: o.orderId,
        userId: o.userId,
        username: uName,
        userTag: uTag,
        avatar: uAvatar,
        guildId: o.guildId,
        guildName: guildInfo.guildName,
        type: o.type,
        category,
        productName: o.productName,
        amountInr: o.amountInr || 0,
        displayAmountInr: (o.amountInr && o.amountInr > 0) ? o.amountInr : (o.coins || 0),
        coins: o.coins || 0,
        status: o.status,
        rrn: o.rrn || null,
        verificationSource: o.verificationSource || null,
        createdAt: o.createdAt,
        paidAt: o.paidAt || null,
        expiresAt: o.expiresAt || null
      };
    }));

    return sendJson(res, 200, {
      guild: {
        id: guildId,
        name: guildInfo.guildName,
        icon: guildInfo.icon
      },
      counts: {
        all: allCount,
        paid: paidCount,
        pending: pendingCount,
        failed: failedCount
      },
      pagination: {
        page,
        limit,
        total: totalMatching,
        totalRecords: totalMatching,
        totalPages: Math.max(1, Math.ceil(totalMatching / limit))
      },
      orders: formattedOrders
    });
  }

  // 11. GET /api/orders/detail — REAL ORDER INSPECT
  if (pathname === '/api/orders/detail' && method === 'GET') {
    const orderId = url.searchParams.get('orderId');
    const guildId = requestedGuildId;
    if (!orderId || !guildId || guildId === 'global' || guildId === 'invalid') {
      return sendJson(res, 400, { error: 'Valid Order ID and Server selection required.' });
    }

    const order = await Order.findOne({ orderId, guildId, userId: session.userId }).lean();
    if (!order) {
      return sendJson(res, 404, { error: 'Order not found in this server.' });
    }

    const guildInfo = await resolveGuildInfo(guildId, botClient);
    const memberInfo = await resolveDiscordUser(order.userId, botClient);

    let relatedPayment = null;
    if (order.rrn) {
      relatedPayment = await Payment.findOne({ rrn: order.rrn }).lean();
    }

    return sendJson(res, 200, {
      order: {
        _id: order._id,
        orderId: order.orderId,
        userId: order.userId,
        username: memberInfo?.username || order.username || session.username,
        userTag: memberInfo?.discriminator && memberInfo?.discriminator !== '0' ? `#${memberInfo.discriminator}` : '#0001',
        avatar: memberInfo?.avatar || null,
        guildId: order.guildId,
        guildName: guildInfo.guildName,
        type: order.type,
        productName: order.productName,
        amountInr: order.amountInr || 0,
        displayAmountInr: (order.amountInr && order.amountInr > 0) ? order.amountInr : (order.coins || 0),
        coins: order.coins || 0,
        status: order.status,
        rrn: order.rrn || null,
        verificationSource: order.verificationSource || null,
        verifiedBy: order.verifiedBy || null,
        rejectionReason: order.rejectionReason || null,
        note: order.note || '',
        createdAt: order.createdAt,
        paidAt: order.paidAt || null,
        expiresAt: order.expiresAt || null,
        payment: relatedPayment ? {
          rrn: relatedPayment.rrn,
          amountInr: (relatedPayment.amountPaise || 0) / 100,
          senderName: relatedPayment.senderName || '',
          transactionDate: relatedPayment.transactionDate
        } : null
      }
    });
  }

  return false;
}

// ─── ADMIN APIS (SERVER-SCOPED) ───────────────────────────────────────────────
export async function handleAdminApi(pathname, method, req, res, session, botClient, url) {
  const requestedGuildId = url.searchParams.get('guildId') || null;

  // Verify admin permissions for server
  const hasAccess = await isUserGuildAdmin(session.userId, requestedGuildId, botClient);
  if (!hasAccess && session.role !== 'owner' && session.role !== 'admin') {
    return sendJson(res, 403, { error: 'Administrator permissions required for this server.' });
  }

  // 1. GET /api/admin/orders - Filtered strictly by server with hydrated user details
  if (pathname === '/api/admin/orders' && method === 'GET') {
    const filter = requestedGuildId && requestedGuildId !== 'global' ? { guildId: requestedGuildId } : {};
    const orders = await Order.find(filter).sort({ createdAt: -1 }).limit(100).lean();

    const hydratedOrders = await Promise.all(
      orders.map(async o => {
        let avatar = null;
        let userTag = '';
        let username = o.username || '';

        const u = await resolveDiscordUser(o.userId, botClient);
        if (u) {
          username = u.username || username;
          userTag =
            u.discriminator && u.discriminator !== '0'
              ? `#${u.discriminator}`
              : u.username
              ? `@${u.username}`
              : `#0001`;
          avatar = u.avatar;
        }
        if (!avatar) {
          const disc = parseInt((o.userId || '0').slice(-1), 10) % 5;
          avatar = `https://cdn.discordapp.com/embed/avatars/${disc || 0}.png`;
        }
        if (!userTag) {
          userTag = o.userId ? `#${o.userId.slice(-4)}` : '#0001';
        }

        return {
          ...o,
          username: username || `User ${o.userId?.slice(-4) || ''}`,
          userTag,
          avatar,
        };
      })
    );

    return sendJson(res, 200, { orders: hydratedOrders });
  }

  // 2. POST /api/admin/approve-payment
  if (pathname === '/api/admin/approve-payment' && method === 'POST') {
    const body = await parseJsonBody(req);
    const orderId = String(body.orderId || '').trim();
    const rrn = String(body.rrn || '').trim();
    const amountInr = Number(body.amount);

    if (!/^\d{8,20}$/.test(rrn)) {
      return sendJson(res, 400, { error: 'Invalid RRN / UTR. Must be 8 to 20 numeric digits.' });
    }

    const order = await Order.findOne({ orderId });
    if (!order) return sendJson(res, 404, { error: 'Order not found.' });
    if (order.status === 'paid') return sendJson(res, 400, { error: 'Order is already credited.' });

    // Validate admin has permission for this order's server
    const canManageOrder = await isUserGuildAdmin(session.userId, order.guildId, botClient);
    if (!canManageOrder) {
      return sendJson(res, 403, { error: 'You do not have admin permissions for this server.' });
    }

    const amountPaise = Math.round(amountInr * 100);
    if (amountPaise !== order.payablePaise) {
      return sendJson(res, 400, {
        error: `Amount mismatch: Order expects ₹${(order.payablePaise / 100).toFixed(2)}, but you entered ₹${amountInr.toFixed(2)}.`,
      });
    }

    const result = await creditVerifiedPayment({
      order,
      rrn,
      amountPaise,
      source: 'admin',
      senderName: 'Web Admin Verification',
      rawSnippet: `Approved via Web Dashboard by ${session.username} in ${order.guildName || order.guildId}`,
      verifiedBy: session.userId,
    });

    if (result.startsWith('credited:')) {
      return sendJson(res, 200, { success: true, message: `Payment approved and coins credited!`, result });
    }

    return sendJson(res, 400, { error: `Failed to credit payment: ${result}` });
  }

  // 3. POST /api/admin/reject-order
  if (pathname === '/api/admin/reject-order' && method === 'POST') {
    const body = await parseJsonBody(req);
    const orderId = String(body.orderId || '').trim();
    const reason = String(body.reason || 'Payment unverified or rejected by admin.').trim();

    const order = await Order.findOne({ orderId });
    if (!order) return sendJson(res, 404, { error: 'Order not found.' });
    if (order.status === 'paid') return sendJson(res, 400, { error: 'Cannot reject an already paid order.' });

    const canManageOrder = await isUserGuildAdmin(session.userId, order.guildId, botClient);
    if (!canManageOrder) {
      return sendJson(res, 403, { error: 'You do not have admin permissions for this server.' });
    }

    order.status = 'rejected';
    order.rejectionReason = reason;
    order.rejectedBy = session.userId;
    order.rejectedAt = new Date();
    await order.save();

    return sendJson(res, 200, { success: true, message: `Order ${orderId} rejected.` });
  }

  // 3b. POST /api/admin/order/delete
  if (pathname === '/api/admin/order/delete' && method === 'POST') {
    const body = await parseJsonBody(req);
    const orderId = String(body.orderId || '').trim();

    const order = await Order.findOne({ orderId });
    if (!order) return sendJson(res, 404, { error: 'Order not found.' });

    const canManageOrder = await isUserGuildAdmin(session.userId, order.guildId, botClient);
    if (!canManageOrder) {
      return sendJson(res, 403, { error: 'You do not have admin permissions for this server.' });
    }

    await Promise.all([
      Order.deleteMany({ orderId }),
      Payment.deleteMany({ orderId }),
      Ledger.deleteMany({ orderId }),
      UserInventory.deleteMany({ orderId }),
    ]);

    return sendJson(res, 200, { success: true, message: `Order ${orderId} permanently deleted from database.` });
  }

  // 4. GET /api/admin/products - Products for server
  if (pathname === '/api/admin/products' && method === 'GET') {
    const guildId = requestedGuildId || 'global';
    const filter = guildId === 'global' ? {} : { guildId: { $in: [guildId, 'global'] } };
    const products = await Product.find(filter).sort({ createdAt: -1 }).lean();
    return sendJson(res, 200, { products });
  }

  // 5. POST /api/admin/product/create - Create item for selected server
  if (pathname === '/api/admin/product/create' && method === 'POST') {
    const body = await parseJsonBody(req);
    const { name, coins, description, imageUrl, stock, behaviorType, duration, roleId, type, guildId } = body;

    const targetGuildId = guildId || requestedGuildId || 'global';
    if (!name || !coins || Number(coins) < 1) {
      return sendJson(res, 400, { error: 'Name and a valid coin price (> 0) are required.' });
    }

    const cleanDuration = String(duration || '').trim();
    const durationMs = cleanDuration ? (parseDuration(cleanDuration) || 0) : 0;
    const formattedDuration = durationMs > 0 ? formatDuration(durationMs) : cleanDuration;

    let finalBehaviorType = behaviorType || 'manual_claim';
    let finalType = type || (durationMs > 0 ? 'TIMED' : 'STATIC');

    if (durationMs > 0) {
      finalType = 'TIMED';
      if (finalBehaviorType === 'role_permanent' || !finalBehaviorType) {
        finalBehaviorType = roleId ? 'role_temporary' : 'consumable';
      }
    } else if (finalBehaviorType === 'role_temporary') {
      finalType = 'TIMED';
    }

    const product = await Product.create({
      guildId: targetGuildId,
      name: String(name).trim(),
      coins: Number(coins),
      description: String(description || '').trim(),
      imageUrl: String(imageUrl || '').trim(),
      stock: stock === '' || stock === null || stock === undefined ? null : Number(stock),
      behaviorType: finalBehaviorType,
      type: finalType,
      duration: formattedDuration,
      durationMs,
      roleId: roleId || null,
      active: true,
      createdBy: session.userId,
    });

    return sendJson(res, 200, { success: true, product });
  }

  // 6. POST /api/admin/product/edit
  if (pathname === '/api/admin/product/edit' && method === 'POST') {
    const body = await parseJsonBody(req);
    const { id, name, coins, description, imageUrl, stock, active, roleId, duration, behaviorType } = body;

    let durationMsUpdate = undefined;
    let formattedDuration = undefined;
    let typeUpdate = undefined;
    let behaviorUpdate = behaviorType;

    if (duration !== undefined) {
      const cleanDuration = String(duration).trim();
      const ms = cleanDuration ? (parseDuration(cleanDuration) || 0) : 0;
      durationMsUpdate = ms;
      formattedDuration = ms > 0 ? formatDuration(ms) : cleanDuration;
      if (ms > 0) {
        typeUpdate = 'TIMED';
        if (behaviorUpdate === 'role_permanent') {
          behaviorUpdate = 'role_temporary';
        }
      }
    }

    const updated = await Product.findByIdAndUpdate(
      id,
      {
        ...(name && { name: String(name).trim() }),
        ...(coins && { coins: Number(coins) }),
        ...(description !== undefined && { description: String(description).trim() }),
        ...(imageUrl !== undefined && { imageUrl: String(imageUrl).trim() }),
        ...(stock !== undefined && { stock: stock === null || stock === '' ? null : Number(stock) }),
        ...(active !== undefined && { active: Boolean(active) }),
        ...(roleId !== undefined && { roleId: roleId || null }),
        ...(duration !== undefined && { duration: formattedDuration }),
        ...(durationMsUpdate !== undefined && { durationMs: durationMsUpdate }),
        ...(typeUpdate && { type: typeUpdate }),
        ...(behaviorUpdate !== undefined && { behaviorType: behaviorUpdate }),
      },
      { new: true }
    );

    return sendJson(res, 200, { success: true, product: updated });
  }

  // 7. POST /api/admin/product/delete - Permanently delete item(s) from database (single or bulk)
  if ((pathname === '/api/admin/product/delete' || pathname === '/api/admin/product/bulk-delete') && method === 'POST') {
    const body = await parseJsonBody(req);
    // Bulk delete mode:
    if (Array.isArray(body.ids) && body.ids.length > 0) {
      const validIds = body.ids.filter(id => typeof id === 'string' && id.trim());
      if (validIds.length === 0) {
        return sendJson(res, 400, { error: 'No valid product IDs provided.' });
      }
      const result = await Product.deleteMany({ _id: { $in: validIds } });
      return sendJson(res, 200, {
        success: true,
        message: `${result.deletedCount} item(s) permanently deleted from database.`,
        deletedCount: result.deletedCount
      });
    }

    // Single item delete mode:
    if (!body.id) {
      return sendJson(res, 400, { error: 'Product ID or array of IDs is required.' });
    }
    const deleted = await Product.findByIdAndDelete(body.id);
    if (!deleted) {
      return sendJson(res, 404, { error: 'Item not found in database.' });
    }
    return sendJson(res, 200, { success: true, message: 'Item permanently deleted from database.' });
  }

  // 8. POST /api/admin/coins/adjust - Give or take coins in specific server
  if (pathname === '/api/admin/coins/adjust' && method === 'POST') {
    const body = await parseJsonBody(req);
    const { targetUserId, coins, action, reason, guildId } = body;

    const targetGuildId = guildId || requestedGuildId || 'global';
    const isCallerSuperAdmin = session.role === 'owner' || session.role === 'admin' || session.isOwner || (process.env.OWNER_ID && session.userId === process.env.OWNER_ID);
    if (!isCallerSuperAdmin && targetGuildId && targetGuildId !== 'global') {
      const canManage = await isUserGuildAdmin(session.userId, targetGuildId, botClient);
      if (!canManage) {
        return sendJson(res, 403, { error: 'Forbidden: You do not have permission to adjust coins in this server.' });
      }
    }
    const guildInfo = await resolveGuildInfo(targetGuildId, botClient);
    const amount = Number(coins);

    if (!targetUserId || !amount || amount <= 0) {
      return sendJson(res, 400, { error: 'Valid Target User ID and positive coin amount required.' });
    }

    const isGive = action === 'give';
    const delta = isGive ? amount : -amount;

    const wallet = await Wallet.findOneAndUpdate(
      { userId: targetUserId, guildId: targetGuildId },
      { $inc: { balance: delta }, $setOnInsert: { guildName: guildInfo.guildName } },
      { upsert: true, new: true }
    );

    if (wallet.balance < 0) {
      await Wallet.updateOne({ userId: targetUserId, guildId: targetGuildId }, { $set: { balance: 0 } });
      wallet.balance = 0;
    }

    await Ledger.create({
      guildId: targetGuildId,
      guildName: guildInfo.guildName,
      userId: targetUserId,
      username: '',
      orderId: newOrderId(),
      rrn: `WEB-ADJ-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      coins: delta,
      type: isGive ? 'admin_grant' : 'admin_deduct',
      reason: reason || `Admin ${isGive ? 'grant' : 'deduction'} via Web Dashboard`,
      performedBy: session.userId,
    });

    return sendJson(res, 200, { success: true, newBalance: wallet.balance, guildName: guildInfo.guildName });
  }

  // 9. GET /api/admin/rate & POST /api/admin/rate
  if (pathname === '/api/admin/rate') {
    const targetGuildId = requestedGuildId || 'global';
    if (method === 'GET') {
      const rate = await getCoinRate(targetGuildId);
      return sendJson(res, 200, { rate, guildId: targetGuildId });
    }
    if (method === 'POST') {
      const body = await parseJsonBody(req);
      const newRate = Number(body.rate);
      if (!newRate || newRate <= 0) return sendJson(res, 400, { error: 'Invalid rate.' });
      await setCoinRate(newRate, session.userId, targetGuildId);
      return sendJson(res, 200, { success: true, rate: newRate, guildId: targetGuildId });
    }
  }

  // 10. GET /api/admin/user-inspect - Inspect ANY Discord user across servers, wallets, inventory, orders
  if (pathname === '/api/admin/user-inspect' && method === 'GET') {
    const targetUserId = (url.searchParams.get('userId') || '').trim();
    if (!targetUserId) {
      return sendJson(res, 400, { error: 'Target Discord User ID is required.' });
    }

    let userObj = null;
    try {
      if (botClient?.users) {
        userObj = await botClient.users.fetch(targetUserId).catch(() => null);
      }
    } catch (e) {}

    // Find any mutual guilds where this user is present
    const mutualGuilds = [];
    if (botClient?.guilds?.cache) {
      for (const guild of botClient.guilds.cache.values()) {
        try {
          let member = guild.members.cache.get(targetUserId);
          if (!member) {
            member = await guild.members.fetch(targetUserId).catch(() => null);
          }
          if (member) {
            mutualGuilds.push({
              guildId: guild.id,
              guildName: guild.name,
              iconUrl: guild.iconURL() || '',
              memberCount: guild.memberCount || 0,
              joinedAt: member.joinedAt,
              roles: member.roles.cache
                .filter(r => r.id !== guild.id)
                .map(r => ({ id: r.id, name: r.name, color: r.hexColor })),
              isAdmin: member.permissions.has('Administrator') || false,
            });
          }
        } catch (e) {}
      }
    }

    // Wallets across all servers
    const wallets = await Wallet.find({ userId: targetUserId }).sort({ balance: -1 }).lean();
    const totalBalance = wallets.reduce((acc, w) => acc + (w.balance || 0), 0);

    // Inventory items
    const inventory = await UserInventory.find({ userId: targetUserId }).sort({ createdAt: -1 }).lean();

    // Orders
    const orders = await Order.find({ userId: targetUserId }).sort({ createdAt: -1 }).limit(100).lean();

    // Ledger transactions
    const ledger = await Ledger.find({ userId: targetUserId }).sort({ createdAt: -1 }).limit(100).lean();

    // Resolve guildName on items, orders, ledger, wallets
    for (const item of inventory) {
      if (!item.guildName) {
        item.guildName = botClient?.guilds?.cache.get(item.guildId)?.name || (item.guildId === 'global' ? 'Global Economy' : item.guildId);
      }
    }
    for (const o of orders) {
      if (!o.guildName) {
        o.guildName = botClient?.guilds?.cache.get(o.guildId)?.name || (o.guildId === 'global' ? 'Global Economy' : o.guildId);
      }
    }
    for (const l of ledger) {
      if (!l.guildName) {
        l.guildName = botClient?.guilds?.cache.get(l.guildId)?.name || (l.guildId === 'global' ? 'Global Economy' : l.guildId);
      }
    }
    for (const w of wallets) {
      if (!w.guildName) {
        w.guildName = botClient?.guilds?.cache.get(w.guildId)?.name || (w.guildId === 'global' ? 'Global Economy' : w.guildId);
      }
    }

    // Server-scoping: filter mutual guilds by caller's permissions
    const isCallerSuperAdmin = session.role === 'owner' || session.role === 'admin';
    const authorizedMutualGuilds = [];
    for (const g of mutualGuilds) {
      if (isCallerSuperAdmin) {
        authorizedMutualGuilds.push(g);
      } else {
        const canManage = await isUserGuildAdmin(session.userId, g.guildId, botClient);
        if (canManage) {
          authorizedMutualGuilds.push(g);
        }
      }
    }

    // Attach server-specific coin balance, items count, and orders count to each authorized mutual guild
    for (const g of authorizedMutualGuilds) {
      const w = wallets.find(wallet => wallet.guildId === g.guildId);
      g.balance = w ? (w.balance || 0) : 0;
      g.itemsCount = inventory.filter(i => i.guildId === g.guildId).length;
      g.ordersCount = orders.filter(o => o.guildId === g.guildId).length;
    }

    const globalWallet = wallets.find(w => w.guildId === 'global');
    let globalGuild = null;
    if (globalWallet && globalWallet.balance > 0 && isCallerSuperAdmin) {
      globalGuild = {
        guildId: 'global',
        guildName: 'Global Economy (Cross-Server)',
        iconUrl: '',
        joinedAt: null,
        roles: [],
        isAdmin: false,
        balance: globalWallet.balance || 0,
        isGlobal: true,
        itemsCount: inventory.filter(i => i.guildId === 'global').length,
        ordersCount: orders.filter(o => o.guildId === 'global').length,
      };
    }

    // Admin / owner status
    const isOwnerUser = getOwnerIds().includes(targetUserId);
    const dbAdmin = await Admin.findOne({ userId: targetUserId }).lean();

    const formattedTag = userObj?.discriminator && userObj.discriminator !== '0'
      ? `#${userObj.discriminator}`
      : userObj?.username
      ? `@${userObj.username}`
      : '#0001';

    const userData = {
      id: targetUserId,
      username: userObj?.username || wallets[0]?.username || orders[0]?.username || 'User_' + targetUserId.slice(-4),
      tag: formattedTag,
      avatarUrl: userObj?.displayAvatarURL?.({ size: 128, dynamic: true }) || 'https://cdn.discordapp.com/embed/avatars/0.png',
      isBot: userObj?.bot || false,
      createdAt: userObj?.createdAt || null,
      isOwner: isOwnerUser,
      isAdmin: isOwnerUser || Boolean(dbAdmin),
    };

    return sendJson(res, 200, {
      success: true,
      user: userData,
      guilds: authorizedMutualGuilds,
      globalGuild,
      wallets,
      totalBalance,
      totalPurchases: inventory.length,
      inventory,
      orders,
      ledger,
    });
  }

  // 11. POST /api/admin/inventory/revoke - Purge item and revoke Discord role (/remove-item)
  if (pathname === '/api/admin/inventory/revoke' && method === 'POST') {
    const body = await parseJsonBody(req);
    const { inventoryId, revokeRole = true } = body;

    if (!inventoryId) {
      return sendJson(res, 400, { error: 'inventoryId is required.' });
    }

    const item = await UserInventory.findOne({ inventoryId });
    if (!item) {
      return sendJson(res, 404, { error: 'Inventory item not found.' });
    }

    const isCallerSuperAdmin = session.role === 'owner' || session.role === 'admin' || session.isOwner || (process.env.OWNER_ID && session.userId === process.env.OWNER_ID);
    if (!isCallerSuperAdmin && item.guildId && item.guildId !== 'global') {
      const canRevoke = await isUserGuildAdmin(session.userId, item.guildId, botClient);
      if (!canRevoke) {
        return sendJson(res, 403, { error: 'Forbidden: You do not have permission to revoke items in this server.' });
      }
    }

    let guild = null;
    if (botClient?.guilds?.cache && item.guildId && item.guildId !== 'global') {
      guild = botClient.guilds.cache.get(item.guildId) || await botClient.guilds.fetch(item.guildId).catch(() => null);
    }

    const result = await purgeSingleInventoryItem(guild, item, revokeRole !== false);

    return sendJson(res, 200, {
      success: true,
      message: `Item "${result.productName}" purged from inventory and database.` + (result.roleRevoked ? ' Discord role was revoked.' : ''),
      roleRevoked: result.roleRevoked,
    });
  }

  // 12. GET /api/admin/order-inspect - Inspect single order (/order)
  if (pathname === '/api/admin/order-inspect' && method === 'GET') {
    const orderId = (url.searchParams.get('orderId') || '').trim();
    if (!orderId) return sendJson(res, 400, { error: 'orderId is required.' });

    const order = await Order.findOne({ orderId }).lean();
    if (!order) return sendJson(res, 404, { error: 'Order not found.' });

    const ledger = await Ledger.find({ orderId }).lean();
    const inventory = await UserInventory.find({ orderId }).lean();

    return sendJson(res, 200, { success: true, order, ledger, inventory });
  }

  // 13. GET /api/admin/roles - Fetch available Discord roles for current server
  if (pathname === '/api/admin/roles' && method === 'GET') {
    const guildId = requestedGuildId;
    if (!guildId || guildId === 'global') {
      return sendJson(res, 200, { roles: [] });
    }
    const guild = botClient?.guilds?.cache?.get(guildId) || await botClient?.guilds?.fetch(guildId).catch(() => null);
    if (!guild) {
      return sendJson(res, 200, { roles: [] });
    }
    const roles = guild.roles.cache
      .filter(r => r.id !== guild.id && !r.managed)
      .map(r => ({ id: r.id, name: r.name, color: r.hexColor, position: r.position }))
      .sort((a, b) => b.position - a.position);
    return sendJson(res, 200, { roles });
  }

  // 14. GET /api/admin/channels - Fetch text channels for current server
  if (pathname === '/api/admin/channels' && method === 'GET') {
    const guildId = requestedGuildId;
    if (!guildId || guildId === 'global') {
      return sendJson(res, 200, { channels: [] });
    }
    const guild = botClient?.guilds?.cache?.get(guildId) || await botClient?.guilds?.fetch(guildId).catch(() => null);
    if (!guild) {
      return sendJson(res, 200, { channels: [] });
    }
    const channels = guild.channels.cache
      .filter(c => c && c.type === ChannelType.GuildText)
      .map(c => ({ id: c.id, name: c.name, position: c.position }))
      .sort((a, b) => a.position - b.position);
    return sendJson(res, 200, { channels });
  }

  // 15. GET /api/admin/shop-config - Comprehensive shop health & stats (/shop-config)
  if (pathname === '/api/admin/shop-config' && method === 'GET') {
    const targetGuildId = requestedGuildId || 'global';
    const rate = await getCoinRate(targetGuildId);
    const activeProducts = await Product.countDocuments(targetGuildId === 'global' ? { active: true } : { guildId: { $in: [targetGuildId, 'global'] }, active: true });
    const pendingOrders = await Order.countDocuments(targetGuildId === 'global' ? { status: 'pending' } : { guildId: targetGuildId, status: 'pending' });
    const reviewOrders = await Order.countDocuments(targetGuildId === 'global' ? { status: 'review' } : { guildId: targetGuildId, status: 'review' });
    const paidOrders = await Order.countDocuments(targetGuildId === 'global' ? { status: 'paid' } : { guildId: targetGuildId, status: 'paid' });

    return sendJson(res, 200, {
      rate,
      guildId: targetGuildId,
      activeProducts,
      pendingOrders,
      reviewOrders,
      paidOrders,
      upiId: config.upiId || 'Not configured',
      upiPayeeName: config.upiPayeeName || 'Not configured',
      gmailConfigured: Boolean(process.env.GMAIL_REFRESH_TOKEN),
      sliceSender: process.env.SLICE_ALLOWED_SENDER || 'Default',
    });
  }

  // 16. GET /api/admin/dropboxes - List Dropbox Events (/dropbox list)
  if (pathname === '/api/admin/dropboxes' && method === 'GET') {
    const targetGuildId = requestedGuildId || 'global';
    const filter = targetGuildId === 'global' ? {} : { guildId: targetGuildId };
    const dropboxes = await DropboxEvent.find(filter).sort({ createdAt: -1 }).limit(25).lean();
    return sendJson(res, 200, { dropboxes });
  }

  // 17. POST /api/admin/dropbox/cancel - Cancel event (/dropbox stop)
  if (pathname === '/api/admin/dropbox/cancel' && method === 'POST') {
    const body = await parseJsonBody(req);
    const { eventId, reason } = body;
    if (!eventId) return sendJson(res, 400, { error: 'eventId is required.' });

    await cancelEvent(botClient, eventId, reason || 'Cancelled via Web Admin Panel', session.userId);
    return sendJson(res, 200, { success: true, message: `Dropbox event ${eventId} cancelled.` });
  }

  // 17.5. POST /api/admin/dropbox/delete - Delete event from database (/dropbox delete)
  if (pathname === '/api/admin/dropbox/delete' && method === 'POST') {
    const body = await parseJsonBody(req);
    const { eventId } = body;
    if (!eventId) return sendJson(res, 400, { error: 'eventId is required.' });

    const event = await DropboxEvent.findOne({ eventId });
    if (!event) {
      return sendJson(res, 404, { error: 'Dropbox event not found in database.' });
    }

    if (event.status === 'active' || event.status === 'ready') {
      await cancelEvent(botClient, eventId, 'Deleted via Web Admin Panel', session.userId).catch(() => {});
    }

    await DropboxEvent.deleteOne({ eventId });
    await DropboxDrop.deleteMany({ eventId });
    await DropboxClaim.deleteMany({ eventId });

    return sendJson(res, 200, { success: true, message: `Dropbox event ${eventId} permanently deleted from database.` });
  }

  // 17.6. POST /api/admin/dropbox/clear-completed - Clear all completed and cancelled events
  if (pathname === '/api/admin/dropbox/clear-completed' && method === 'POST') {
    const targetGuildId = requestedGuildId;
    const filter = { status: { $in: ['completed', 'cancelled'] } };
    if (targetGuildId && targetGuildId !== 'global') {
      filter.guildId = targetGuildId;
    }

    const eventsToDelete = await DropboxEvent.find(filter).select('eventId').lean();
    const eventIds = eventsToDelete.map(e => e.eventId);

    if (eventIds.length === 0) {
      return sendJson(res, 200, { success: true, count: 0, message: 'No ended dropbox events found to clear.' });
    }

    await DropboxEvent.deleteMany({ eventId: { $in: eventIds } });
    await DropboxDrop.deleteMany({ eventId: { $in: eventIds } });
    await DropboxClaim.deleteMany({ eventId: { $in: eventIds } });

    return sendJson(res, 200, {
      success: true,
      count: eventIds.length,
      message: `Successfully deleted ${eventIds.length} ended dropbox event(s) from database.`
    });
  }

  // 18. POST /api/admin/dropbox/create - Create event (/dropbox setup)
  if (pathname === '/api/admin/dropbox/create' && method === 'POST') {
    const body = await parseJsonBody(req);
    const { coins, totalDrops, interval, claimDuration, description, channelMode, dropChannelId, logChannelId, startMode, imageUrl, guildId, distributionMode, maxClaimants } = body;

    const targetGuildId = guildId || requestedGuildId;
    if (!targetGuildId || targetGuildId === 'global') {
      return sendJson(res, 400, { error: 'A specific Discord server must be selected for Dropboxes.' });
    }

    const intervalMs = parseDuration(interval);
    const claimDurationMs = parseDuration(claimDuration);
    if (!intervalMs || !claimDurationMs) {
      return sendJson(res, 400, { error: 'Invalid interval or claim duration. Use formats like 1m, 1h, 1d.' });
    }

    const eventId = generateEventId();
    const guildInfo = await resolveGuildInfo(targetGuildId, botClient);

    const event = await DropboxEvent.create({
      eventId,
      guildId: targetGuildId,
      guildName: guildInfo.guildName,
      createdBy: session.userId,
      coins: Number(coins),
      totalDrops: Number(totalDrops),
      completedDrops: 0,
      intervalMs,
      intervalStr: interval,
      claimDurationMs,
      claimDurationStr: claimDuration,
      description: description || 'Coin Dropbox Event',
      imageUrl: imageUrl || '',
      channelMode: channelMode || 'specific',
      dropChannelId: channelMode === 'specific' ? dropChannelId : null,
      logChannelId: logChannelId || dropChannelId,
      startMode: startMode || 'immediate',
      distributionMode: distributionMode === 'ranked' ? 'ranked' : 'equal',
      maxClaimants: Number(maxClaimants) > 0 ? Number(maxClaimants) : 0,
      status: startMode === 'immediate' ? 'active' : 'ready',
      startedAt: startMode === 'immediate' ? new Date() : null,
      nextDropAt: startMode === 'immediate' ? new Date() : null,
    });

    if (startMode === 'immediate' && botClient) {
      await postDrop(botClient, event, 1).catch(e => console.error('[DROPBOX CREATE POST]', e));
    }

    return sendJson(res, 200, { success: true, eventId, event });
  }

  // 19. POST /api/admin/dropbox/start - Start a ready/delayed event (/dropbox start)
  if (pathname === '/api/admin/dropbox/start' && method === 'POST') {
    const body = await parseJsonBody(req);
    const { eventId } = body;
    if (!eventId) return sendJson(res, 400, { error: 'eventId is required.' });

    const event = await DropboxEvent.findOne({ eventId });
    if (!event) {
      return sendJson(res, 404, { error: `No Dropbox event found with ID "${eventId}".` });
    }

    if (event.status === 'active') {
      return sendJson(res, 400, { error: `Dropbox event #${eventId} is already active and running.` });
    }

    if (event.status === 'completed' || event.status === 'cancelled') {
      return sendJson(res, 400, { error: `Cannot start event #${eventId} because it is already ${event.status}.` });
    }

    // Check if another active event exists in the guild
    const existingActive = await DropboxEvent.findOne({
      guildId: event.guildId,
      status: 'active',
      eventId: { $ne: eventId },
    });
    if (existingActive) {
      return sendJson(res, 400, {
        error: `Cannot start event #${eventId} because event #${existingActive.eventId} is currently running in this server.`,
      });
    }

    event.status = 'active';
    event.startedAt = new Date();
    await event.save();

    // Fire the next drop immediately
    const nextDropNum = event.completedDrops + 1;
    if (botClient) {
      await postDrop(botClient, event, nextDropNum).catch(e => console.error('[DROPBOX START POST]', e));
    }

    return sendJson(res, 200, {
      success: true,
      message: `Dropbox event #${eventId} launched! Drop #${nextDropNum} of ${event.totalDrops} posted.`,
      event,
    });
  }

  // 20. POST /api/admin/dropbox/edit - Edit event configuration
  if (pathname === '/api/admin/dropbox/edit' && method === 'POST') {
    const body = await parseJsonBody(req);
    const { eventId, coins, totalDrops, interval, claimDuration, channelMode, dropChannelId, logChannelId, description, imageUrl, distributionMode, maxClaimants } = body;
    if (!eventId) return sendJson(res, 400, { error: 'eventId is required.' });

    const event = await DropboxEvent.findOne({ eventId });
    if (!event) {
      return sendJson(res, 404, { error: `No Dropbox event found with ID "${eventId}".` });
    }

    if (event.status === 'completed' || event.status === 'cancelled') {
      return sendJson(res, 400, { error: `Cannot edit event #${eventId} because it is already ${event.status}.` });
    }

    const intervalMs = parseDuration(interval);
    const claimDurationMs = parseDuration(claimDuration);
    if (!intervalMs || !claimDurationMs) {
      return sendJson(res, 400, { error: 'Invalid interval or claim duration format (e.g. 5m, 1h).' });
    }

    const newTotalDrops = Number(totalDrops);
    if (newTotalDrops < event.completedDrops) {
      return sendJson(res, 400, { error: `Total drops cannot be less than completed drops (${event.completedDrops}).` });
    }

    event.coins = Number(coins);
    event.totalDrops = newTotalDrops;
    event.intervalMs = intervalMs;
    event.intervalStr = interval;
    event.claimDurationMs = claimDurationMs;
    event.claimDurationStr = claimDuration;
    event.description = description || event.description;
    event.imageUrl = typeof imageUrl === 'string' ? imageUrl.trim() : (event.imageUrl || '');
    event.channelMode = channelMode || event.channelMode || 'specific';
    event.dropChannelId = event.channelMode === 'specific' ? (dropChannelId || event.dropChannelId) : null;
    event.logChannelId = logChannelId || dropChannelId || event.logChannelId;
    if (distributionMode) {
      event.distributionMode = distributionMode === 'ranked' ? 'ranked' : 'equal';
    }
    if (maxClaimants !== undefined) {
      event.maxClaimants = Number(maxClaimants) > 0 ? Number(maxClaimants) : 0;
    }

    await event.save();

    return sendJson(res, 200, {
      success: true,
      message: `Dropbox event #${eventId} updated successfully.`,
      event,
    });
  }

  // 21. GET /api/admin/server-stats - Server record counts
  if (pathname === '/api/admin/server-stats' && method === 'GET') {
    const targetGuildId = requestedGuildId || url.searchParams.get('guildId');
    if (!targetGuildId) return sendJson(res, 400, { error: 'guildId is required.' });

    const hasPerm = await isUserGuildAdmin(session.userId, targetGuildId, botClient);
    if (!hasPerm && session.role !== 'owner' && session.role !== 'admin') {
      return sendJson(res, 403, { error: 'Administrator permissions required for this server.' });
    }

    const [
      wallets,
      products,
      orders,
      payments,
      ledgers,
      inventories,
      activations,
      claims,
      dropboxes,
      configs,
    ] = await Promise.all([
      Wallet.countDocuments({ guildId: targetGuildId }),
      Product.countDocuments({ guildId: targetGuildId }),
      Order.countDocuments({ guildId: targetGuildId }),
      Payment.countDocuments({ guildId: targetGuildId }),
      Ledger.countDocuments({ guildId: targetGuildId }),
      UserInventory.countDocuments({ guildId: targetGuildId }),
      ItemActivation.countDocuments({ guildId: targetGuildId }),
      ManualClaim.countDocuments({ guildId: targetGuildId }),
      DropboxEvent.countDocuments({ guildId: targetGuildId }),
      Config.countDocuments({ guildId: targetGuildId }),
    ]);

    const total =
      wallets +
      products +
      orders +
      payments +
      ledgers +
      inventories +
      activations +
      claims +
      dropboxes +
      configs;

    const cachedGuild = botClient?.guilds?.cache.get(targetGuildId);
    const dbGuild = await Guild.findOne({ guildId: targetGuildId }).lean().catch(() => null);
    const guildName = cachedGuild?.name || dbGuild?.guildName || 'Unknown Server';

    return sendJson(res, 200, {
      guildId: targetGuildId,
      guildName,
      stats: {
        wallets,
        products,
        orders,
        payments,
        ledgers,
        inventories,
        activations,
        claims,
        dropboxes,
        configs,
        total,
      },
    });
  }

  // 22. POST /api/admin/clear-server - Clear / reset server records (/clearserver)
  if (pathname === '/api/admin/clear-server' && method === 'POST') {
    const body = await parseJsonBody(req);
    const targetGuildId = body.guildId || requestedGuildId || url.searchParams.get('guildId');
    const clearType = body.clearType || 'all';

    if (!targetGuildId) return sendJson(res, 400, { error: 'guildId is required.' });

    const hasPerm = await isUserGuildAdmin(session.userId, targetGuildId, botClient);
    if (!hasPerm && session.role !== 'owner' && session.role !== 'admin') {
      return sendJson(res, 403, { error: 'You do not have permission to clear data for this server.' });
    }

    let deletedCounts = {
      wallets: 0,
      products: 0,
      orders: 0,
      payments: 0,
      ledgers: 0,
      inventories: 0,
      activations: 0,
      claims: 0,
      dropboxEvents: 0,
      dropboxDrops: 0,
      dropboxClaims: 0,
      configs: 0,
      totalDeleted: 0,
    };

    if (clearType === 'wallets') {
      const [wRes, invRes, actRes, clRes] = await Promise.all([
        Wallet.deleteMany({ guildId: targetGuildId }),
        UserInventory.deleteMany({ guildId: targetGuildId }),
        ItemActivation.deleteMany({ guildId: targetGuildId }),
        ManualClaim.deleteMany({ guildId: targetGuildId }),
      ]);
      deletedCounts.wallets = wRes.deletedCount;
      deletedCounts.inventories = invRes.deletedCount;
      deletedCounts.activations = actRes.deletedCount;
      deletedCounts.claims = clRes.deletedCount;
      deletedCounts.totalDeleted =
        wRes.deletedCount + invRes.deletedCount + actRes.deletedCount + clRes.deletedCount;
    } else if (clearType === 'orders') {
      const [oRes, payRes, lRes] = await Promise.all([
        Order.deleteMany({ guildId: targetGuildId }),
        Payment.deleteMany({ guildId: targetGuildId }),
        Ledger.deleteMany({ guildId: targetGuildId }),
      ]);
      deletedCounts.orders = oRes.deletedCount;
      deletedCounts.payments = payRes.deletedCount;
      deletedCounts.ledgers = lRes.deletedCount;
      deletedCounts.totalDeleted = oRes.deletedCount + payRes.deletedCount + lRes.deletedCount;
    } else if (clearType === 'products') {
      const pRes = await Product.deleteMany({ guildId: targetGuildId });
      deletedCounts.products = pRes.deletedCount;
      deletedCounts.totalDeleted = pRes.deletedCount;
    } else if (clearType === 'dropboxes') {
      const [evRes, drRes, dcRes] = await Promise.all([
        DropboxEvent.deleteMany({ guildId: targetGuildId }),
        DropboxDrop.deleteMany({ guildId: targetGuildId }),
        DropboxClaim.deleteMany({ guildId: targetGuildId }),
      ]);
      deletedCounts.dropboxEvents = evRes.deletedCount;
      deletedCounts.dropboxDrops = drRes.deletedCount;
      deletedCounts.dropboxClaims = dcRes.deletedCount;
      deletedCounts.totalDeleted = evRes.deletedCount + drRes.deletedCount + dcRes.deletedCount;
    } else if (clearType === 'all') {
      const [
        wRes,
        pRes,
        oRes,
        payRes,
        lRes,
        cfgRes,
        invRes,
        actRes,
        clRes,
        evRes,
        drRes,
        dcRes,
      ] = await Promise.all([
        Wallet.deleteMany({ guildId: targetGuildId }),
        Product.deleteMany({ guildId: targetGuildId }),
        Order.deleteMany({ guildId: targetGuildId }),
        Payment.deleteMany({ guildId: targetGuildId }),
        Ledger.deleteMany({ guildId: targetGuildId }),
        Config.deleteMany({ guildId: targetGuildId }),
        UserInventory.deleteMany({ guildId: targetGuildId }),
        ItemActivation.deleteMany({ guildId: targetGuildId }),
        ManualClaim.deleteMany({ guildId: targetGuildId }),
        DropboxEvent.deleteMany({ guildId: targetGuildId }),
        DropboxDrop.deleteMany({ guildId: targetGuildId }),
        DropboxClaim.deleteMany({ guildId: targetGuildId }),
      ]);

      await Guild.updateOne({ guildId: targetGuildId }, { $set: { status: 'wiped', memberCount: 0 } }).catch(() => {});

      deletedCounts = {
        wallets: wRes.deletedCount,
        products: pRes.deletedCount,
        orders: oRes.deletedCount,
        payments: payRes.deletedCount,
        ledgers: lRes.deletedCount,
        configs: cfgRes.deletedCount,
        inventories: invRes.deletedCount,
        activations: actRes.deletedCount,
        claims: clRes.deletedCount,
        dropboxEvents: evRes.deletedCount,
        dropboxDrops: drRes.deletedCount,
        dropboxClaims: dcRes.deletedCount,
        totalDeleted:
          wRes.deletedCount +
          pRes.deletedCount +
          oRes.deletedCount +
          payRes.deletedCount +
          lRes.deletedCount +
          cfgRes.deletedCount +
          invRes.deletedCount +
          actRes.deletedCount +
          clRes.deletedCount +
          evRes.deletedCount +
          drRes.deletedCount +
          dcRes.deletedCount,
      };
    }

    return sendJson(res, 200, {
      success: true,
      message: `Cleared ${clearType} for server ${targetGuildId}.`,
      clearType,
      ...deletedCounts,
    });
  }

  return false;
}

// ─── BOT OWNER APIS ───────────────────────────────────────────────────────────
export async function handleOwnerApi(pathname, method, req, res, session, botClient, url) {
  if (!pathname.startsWith('/api/owner/')) {
    return false;
  }

  if (session.role !== 'owner') {
    return sendJson(res, 403, { error: 'Bot Owner permissions required.' });
  }

  const parsedUrl = url || new URL(req.url, 'http://localhost');

  // 1. GET /api/owner/admins — Directory of Bot Owners and Dynamic Admins
  if (pathname === '/api/owner/admins' && method === 'GET') {
    const adminData = await listAllAdmins();
    const owners = getOwnerIds();
    const rawDbAdmins = adminData.dbAdmins || [];

    // Resolve username and avatar from Discord cache if missing
    const resolvedAdmins = [];
    for (const a of rawDbAdmins) {
      let displayName = a.username || '';
      let avatarUrl = '';
      const user = await botClient?.users?.fetch(a.userId).catch(() => null);
      if (user) {
        displayName = displayName || user.displayName || user.tag || user.username;
        avatarUrl = user.displayAvatarURL?.({ size: 64 }) || user.avatarURL?.() || '';
      }
      resolvedAdmins.push({
        userId: a.userId,
        username: displayName || `User_${String(a.userId).slice(-4)}`,
        avatar: avatarUrl || `https://cdn.discordapp.com/embed/avatars/${(parseInt(String(a.userId).slice(-1) || '0') % 5)}.png`,
        addedBy: a.addedBy || 'Owner',
        note: a.note || '-',
        isOwner: false,
        createdAt: a.createdAt || null,
      });
    }

    // Include Bot Owners
    const ownerList = [];
    for (const oId of owners) {
      let ownerName = oId === session.userId ? session.username : '';
      let ownerAvatar = oId === session.userId ? session.avatar : '';
      if (!ownerName || !ownerAvatar) {
        const user = await botClient?.users?.fetch(oId).catch(() => null);
        if (user) {
          ownerName = ownerName || user.displayName || user.tag || user.username;
          ownerAvatar = ownerAvatar || user.displayAvatarURL?.({ size: 64 }) || user.avatarURL?.() || '';
        }
      }
      ownerList.push({
        userId: oId,
        username: ownerName || `Owner_${oId.slice(-4)}`,
        avatar: ownerAvatar || `https://cdn.discordapp.com/embed/avatars/0.png`,
        addedBy: 'Environment (.env)',
        note: 'Super-Administrator',
        isOwner: true,
        createdAt: null,
      });
    }

    return sendJson(res, 200, {
      admins: [...ownerList, ...resolvedAdmins],
      owners,
    });
  }

  // 2. POST /api/owner/admin/add — Add Bot Administrator
  if (pathname === '/api/owner/admin/add' && method === 'POST') {
    const body = await parseJsonBody(req);
    const { userId, username = '', note = '' } = body;
    const cleanId = String(userId || '').trim();
    if (!cleanId) return sendJson(res, 400, { error: 'Discord User ID is required.' });
    if (!/^\d{16,21}$/.test(cleanId)) {
      return sendJson(res, 400, { error: 'Invalid Discord User ID. Must be 16-21 digits.' });
    }
    if (getOwnerIds().includes(cleanId)) {
      return sendJson(res, 400, { error: 'This user is already a configured Bot Owner in .env.' });
    }

    // Fetch live username from Discord if not provided
    let finalUsername = username.trim();
    if (!finalUsername) {
      const fetched = await botClient?.users?.fetch(cleanId).catch(() => null);
      if (fetched) finalUsername = fetched.displayName || fetched.tag || fetched.username;
    }

    const record = await addAdminUser({
      userId: cleanId,
      username: finalUsername || `Admin_${cleanId.slice(-4)}`,
      addedBy: session.userId,
      note: note.trim() || 'Bot Administrator'
    });
    return sendJson(res, 200, { success: true, admin: record });
  }

  // 3. POST /api/owner/admin/remove — Remove Bot Administrator
  if (pathname === '/api/owner/admin/remove' && method === 'POST') {
    const body = await parseJsonBody(req);
    const cleanId = String(body.userId || '').trim();
    if (!cleanId) return sendJson(res, 400, { error: 'User ID is required.' });
    if (getOwnerIds().includes(cleanId)) {
      return sendJson(res, 403, { error: 'Protected account: Bot Owners cannot be removed.' });
    }

    await removeAdminUser(cleanId);
    return sendJson(res, 200, { success: true });
  }

  // 4. GET /api/owner/guilds — Connected Discord Servers Directory
  if (pathname === '/api/owner/guilds' && method === 'GET') {
    const dbGuilds = await Guild.find().sort({ lastActiveAt: -1 }).lean();
    const guildMap = new Map();
    for (const g of dbGuilds) {
      guildMap.set(g.guildId, {
        guildId: g.guildId,
        guildName: g.guildName || 'Unknown Server',
        iconUrl: g.iconUrl || '',
        memberCount: g.memberCount || 0,
        status: g.status || 'active',
        lastActiveAt: g.lastActiveAt || g.updatedAt || new Date(),
        joinedAt: g.joinedAt || g.createdAt,
      });
    }

    // Sync from live bot client cache
    if (botClient?.guilds?.cache) {
      for (const g of botClient.guilds.cache.values()) {
        const existing = guildMap.get(g.id);
        if (!existing) {
          guildMap.set(g.id, {
            guildId: g.id,
            guildName: g.name,
            iconUrl: g.iconURL() || '',
            memberCount: g.memberCount || 0,
            status: 'active',
            lastActiveAt: new Date(),
            joinedAt: new Date(),
          });
        } else {
          existing.guildName = g.name;
          existing.memberCount = g.memberCount || existing.memberCount;
          existing.status = 'active';
          if (g.iconURL()) existing.iconUrl = g.iconURL();
        }
      }
    }

    // Aggregate wallet total coins & ledger transactions per guild
    const [walletAgg, ledgerAgg] = await Promise.all([
      Wallet.aggregate([
        { $group: { _id: '$guildId', totalCoins: { $sum: '$balance' }, userCount: { $sum: 1 } } }
      ]),
      Ledger.aggregate([
        { $group: { _id: '$guildId', totalTx: { $sum: 1 } } }
      ]),
    ]);

    const walletStatsMap = new Map();
    for (const w of walletAgg) {
      walletStatsMap.set(w._id, { totalCoins: w.totalCoins || 0, userCount: w.userCount || 0 });
    }

    const ledgerStatsMap = new Map();
    for (const l of ledgerAgg) {
      ledgerStatsMap.set(l._id, l.totalTx || 0);
    }

    const enrichedGuilds = Array.from(guildMap.values()).map(g => {
      const wStats = walletStatsMap.get(g.guildId) || { totalCoins: 0, userCount: 0 };
      const txCount = ledgerStatsMap.get(g.guildId) || 0;
      const isLiveInBot = Boolean(botClient?.guilds?.cache?.has(g.guildId));
      let status = 'active';
      if (!isLiveInBot) {
        status = g.status === 'left' ? 'left' : 'disconnected';
      }

      return {
        guildId: g.guildId,
        guildName: g.guildName || 'Unknown Server',
        iconUrl: g.iconUrl || '',
        memberCount: g.memberCount || 0,
        status,
        isLive: isLiveInBot,
        totalCoins: wStats.totalCoins,
        userCount: wStats.userCount,
        totalTransactions: txCount,
        lastActiveAt: g.lastActiveAt,
        joinedAt: g.joinedAt,
      };
    });

    enrichedGuilds.sort((a, b) => {
      if (a.status === 'active' && b.status !== 'active') return -1;
      if (b.status === 'active' && a.status !== 'active') return 1;
      return new Date(b.lastActiveAt) - new Date(a.lastActiveAt);
    });

    return sendJson(res, 200, { guilds: enrichedGuilds });
  }

  // 5. GET /api/owner/transactions — Cross-Server Coin Transactions & Audit Trail
  if (pathname === '/api/owner/transactions' && method === 'GET') {
    const page = Math.max(1, parseInt(parsedUrl.searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(parsedUrl.searchParams.get('limit') || '5', 10)));
    const search = (parsedUrl.searchParams.get('search') || '').trim();
    const guildId = (parsedUrl.searchParams.get('guildId') || '').trim();
    const type = (parsedUrl.searchParams.get('type') || '').trim();
    const isCsvExport = parsedUrl.searchParams.get('export') === 'csv';

    const filter = {};
    if (guildId && guildId !== 'all') {
      filter.guildId = guildId;
    }
    if (type && type !== 'all') {
      filter.type = type;
    }
    if (search) {
      const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const re = new RegExp(escaped, 'i');
      filter.$or = [
        { guildName: re },
        { guildId: re },
        { username: re },
        { userId: re },
        { orderId: re },
        { rrn: re },
        { reason: re },
        { type: re },
      ];
    }

    const typeLabels = {
      purchase_credit: 'Add Coins',
      shop_purchase: 'Purchase',
      admin_grant: 'Add Coins',
      admin_deduct: 'Coins Removed',
      DROPBOX_REWARD: 'Coin Gift',
      coin_transfer: 'Coin Transfer',
      refund: 'Refund',
    };

    // CSV Export
    if (isCsvExport) {
      const allRecords = await Ledger.find(filter).sort({ createdAt: -1 }).limit(1000).lean();
      const headers = ['#', 'Transaction ID', 'Server Name', 'Guild ID', 'Username', 'User ID', 'Type', 'Amount', 'Date & Time', 'Reference / Order ID', 'Status', 'Reason', 'Performed By'];
      const rows = [headers.join(',')];
      allRecords.forEach((r, idx) => {
        const typeLabel = typeLabels[r.type] || r.type || 'Transaction';
        const dateStr = new Date(r.createdAt).toISOString();
        const row = [
          idx + 1,
          `"${r._id || ''}"`,
          `"${(r.guildName || r.guildId || '').replace(/"/g, '""')}"`,
          `"${r.guildId || ''}"`,
          `"${(r.username || r.userId || '').replace(/"/g, '""')}"`,
          `"${r.userId || ''}"`,
          `"${typeLabel}"`,
          r.coins >= 0 ? `+${r.coins}` : `${r.coins}`,
          `"${dateStr}"`,
          `"${r.orderId || r.rrn || ''}"`,
          `"Success"`,
          `"${(r.reason || '').replace(/"/g, '""')}"`,
          `"${r.performedBy || 'system'}"`,
        ];
        rows.push(row.join(','));
      });

      res.writeHead(200, {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="ventrix-coin-transactions.csv"',
        'Cache-Control': 'no-cache',
      });
      return res.end(rows.join('\r\n'));
    }

    const totalMatching = await Ledger.countDocuments(filter);
    const totalPages = Math.max(1, Math.ceil(totalMatching / limit));

    const records = await Ledger.find(filter)
      .sort({ createdAt: -1, _id: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const formatted = records.map((l, idx) => {
      const typeLabel = typeLabels[l.type] || l.type || 'Transaction';
      const dateObj = new Date(l.createdAt);
      const dateFormatted = !isNaN(dateObj.getTime())
        ? dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + ' ' +
          dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
        : 'Recent';

      return {
        index: (page - 1) * limit + idx + 1,
        id: String(l._id),
        guildId: l.guildId,
        serverName: l.guildName || (l.guildId === 'DM' ? 'Direct Message' : `Guild_${l.guildId.slice(-4)}`),
        userId: l.userId,
        username: l.username || `User_${l.userId.slice(-4)}`,
        type: typeLabel,
        rawType: l.type,
        coins: l.coins,
        displayAmount: l.coins >= 0 ? `+${Number(l.coins).toLocaleString()}` : `${Number(l.coins).toLocaleString()}`,
        isPositive: l.coins >= 0,
        date: dateFormatted,
        timestamp: l.createdAt,
        status: 'Success',
        orderId: l.orderId || '-',
        rrn: l.rrn || '-',
        reason: l.reason || '-',
        performedBy: l.performedBy || 'system',
      };
    });

    return sendJson(res, 200, {
      transactions: formatted,
      pagination: {
        page,
        limit,
        total: totalMatching,
        totalPages,
      },
    });
  }

  // 6. GET /api/owner/economy-overview — System-Wide Coin Economy & Aggregate Metrics
  if (pathname === '/api/owner/economy-overview' && method === 'GET') {
    const [walletAgg, totalTx, totalOrders, paidOrdersAgg, activeGuilds] = await Promise.all([
      Wallet.aggregate([{ $group: { _id: null, totalCoins: { $sum: '$balance' }, userCount: { $sum: 1 } } }]),
      Ledger.countDocuments(),
      Order.countDocuments(),
      Order.aggregate([
        { $match: { status: 'paid' } },
        { $group: { _id: null, count: { $sum: 1 }, totalPaise: { $sum: '$payablePaise' }, totalInr: { $sum: '$amountInr' } } }
      ]),
      Guild.countDocuments({ status: 'active' }),
    ]);

    const totalCirculation = walletAgg[0]?.totalCoins || 0;
    const totalUsers = walletAgg[0]?.userCount || 0;
    const paidStats = paidOrdersAgg[0] || { count: 0, totalPaise: 0, totalInr: 0 };
    const totalRevenueInr = paidStats.totalInr || Math.round(paidStats.totalPaise / 100);

    return sendJson(res, 200, {
      totalCoinsInCirculation: totalCirculation,
      totalTransactions: totalTx,
      totalOrders: totalOrders,
      totalPaidOrders: paidStats.count,
      totalRevenueInr,
      totalActiveServers: activeGuilds || (botClient?.guilds?.cache?.size || 0),
      totalUsersWithWallet: totalUsers,
    });
  }

  // 7. GET /api/owner/guild-details — Detailed Single Server Inspect View
  if (pathname === '/api/owner/guild-details' && method === 'GET') {
    const guildId = (parsedUrl.searchParams.get('guildId') || '').trim();
    if (!guildId) return sendJson(res, 400, { error: 'guildId parameter is required.' });

    const [guildDoc, walletAgg, txCount, topHolders, recentTx, volumeAgg] = await Promise.all([
      Guild.findOne({ guildId }).lean(),
      Wallet.aggregate([
        { $match: { guildId } },
        { $group: { _id: null, totalCoins: { $sum: '$balance' }, userCount: { $sum: 1 } } }
      ]),
      Ledger.countDocuments({ guildId }),
      Wallet.find({ guildId }).sort({ balance: -1 }).limit(5).lean(),
      Ledger.find({ guildId }).sort({ createdAt: -1 }).limit(15).lean(),
      Ledger.aggregate([
        { $match: { guildId } },
        {
          $group: {
            _id: null,
            earned: { $sum: { $cond: [{ $gt: ['$coins', 0] }, '$coins', 0] } },
            spent: { $sum: { $cond: [{ $lt: ['$coins', 0] }, { $abs: '$coins' }, 0] } }
          }
        }
      ]),
    ]);

    const liveGuild = botClient?.guilds?.cache?.get(guildId);
    const guildName = liveGuild?.name || guildDoc?.guildName || 'Unknown Server';
    const memberCount = liveGuild?.memberCount || guildDoc?.memberCount || 0;
    const iconUrl = liveGuild?.iconURL() || guildDoc?.iconUrl || '';
    const isLive = Boolean(liveGuild);

    // Resolve Discord usernames & avatars efficiently
    const userCache = new Map();
    const resolveUserInfo = async (userId, fallbackUsername) => {
      if (!userId) return { username: fallbackUsername || 'Unknown User', avatarUrl: 'https://cdn.discordapp.com/embed/avatars/0.png' };
      if (userCache.has(userId)) return userCache.get(userId);

      let username = (fallbackUsername && !fallbackUsername.startsWith('User_')) ? fallbackUsername : '';
      let avatarUrl = '';

      try {
        const member = liveGuild?.members?.cache?.get(userId);
        if (member) {
          username = member.displayName || member.user?.globalName || member.user?.username || username;
          avatarUrl = member.user?.displayAvatarURL?.({ size: 64 }) || '';
        } else {
          let u = botClient?.users?.cache?.get(userId);
          if (!u && botClient?.users?.fetch) {
            u = await botClient.users.fetch(userId).catch(() => null);
          }
          if (u) {
            username = u.globalName || u.username || username;
            avatarUrl = u.displayAvatarURL?.({ size: 64 }) || '';
          }
        }
      } catch (_) {}

      if (!username || username.startsWith('User_')) {
        try {
          const pastOrder = await Order.findOne({ userId, username: { $ne: '' } }).sort({ createdAt: -1 }).lean();
          if (pastOrder?.username) username = pastOrder.username;
        } catch (_) {}
      }

      if (!username || username.startsWith('User_')) {
        try {
          const pastWallet = await Wallet.findOne({ userId, username: { $ne: '' } }).sort({ updatedAt: -1 }).lean();
          if (pastWallet?.username) username = pastWallet.username;
        } catch (_) {}
      }

      let defaultAvatar = 'https://cdn.discordapp.com/embed/avatars/0.png';
      try {
        if (/^\d+$/.test(userId)) {
          const avatarIndex = Number((BigInt(userId) >> 22n) % 6n);
          defaultAvatar = `https://cdn.discordapp.com/embed/avatars/${avatarIndex}.png`;
        }
      } catch (_) {}

      const resObj = {
        username: username || `User_${userId.slice(-4)}`,
        avatarUrl: avatarUrl || defaultAvatar,
      };
      userCache.set(userId, resObj);
      return resObj;
    };

    const resolvedHolders = await Promise.all(topHolders.map(async h => {
      const info = await resolveUserInfo(h.userId, h.username);
      return {
        userId: h.userId,
        username: info.username,
        avatarUrl: info.avatarUrl,
        balance: h.balance,
      };
    }));

    const resolvedTransactions = await Promise.all(recentTx.map(async t => {
      const info = await resolveUserInfo(t.userId, t.username);
      const createdAt = t.createdAt || new Date();
      return {
        id: String(t._id),
        userId: t.userId,
        username: info.username,
        avatarUrl: info.avatarUrl,
        type: t.type,
        coins: t.coins,
        createdAt: createdAt,
        date: new Date(createdAt).toISOString(),
        reason: t.reason || '-',
      };
    }));

    const volData = volumeAgg[0] || { earned: 0, spent: 0 };

    return sendJson(res, 200, {
      guild: {
        guildId,
        guildName,
        memberCount,
        iconUrl,
        status: isLive ? 'active' : (guildDoc?.status || 'disconnected'),
        isLive,
        joinedAt: guildDoc?.joinedAt || guildDoc?.createdAt,
        lastActiveAt: guildDoc?.lastActiveAt || guildDoc?.updatedAt,
      },
      stats: {
        totalCoins: walletAgg[0]?.totalCoins || 0,
        userCount: walletAgg[0]?.userCount || 0,
        totalTransactions: txCount,
        coinsEarned: volData.earned || 0,
        coinsSpent: volData.spent || 0,
      },
      topHolders: resolvedHolders,
      recentTransactions: resolvedTransactions,
    });
  }

  // 8. POST /api/owner/clear-server — Destructive Server Data Reset (/clearserver)
  if (pathname === '/api/owner/clear-server' && method === 'POST') {
    const body = await parseJsonBody(req);
    const { guildId } = body;
    if (!guildId) return sendJson(res, 400, { error: 'guildId is required.' });

    await Promise.all([
      Wallet.deleteMany({ guildId }),
      Product.deleteMany({ guildId }),
      Order.deleteMany({ guildId }),
      Payment.deleteMany({ guildId }),
      Ledger.deleteMany({ guildId }),
      Config.deleteMany({ guildId }),
      UserInventory.deleteMany({ guildId }),
      ItemActivation.deleteMany({ guildId }),
      ManualClaim.deleteMany({ guildId }),
      DropboxEvent.deleteMany({ guildId }),
      DropboxDrop.deleteMany({ guildId }),
      DropboxClaim.deleteMany({ guildId }),
    ]);

    if (!botClient?.guilds?.cache?.has(guildId)) {
      await Guild.deleteMany({ guildId }).catch(() => {});
    } else {
      await Guild.updateOne({ guildId }, { $set: { status: 'wiped', memberCount: 0 } }).catch(() => {});
    }

    return sendJson(res, 200, { success: true, message: `Database records for server ${guildId} have been wiped.` });
  }

  // 8b. POST /api/owner/delete-guild & DELETE /api/owner/guilds — Permanently remove server from database & dashboard
  if (
    (pathname === '/api/owner/delete-guild' && method === 'POST') ||
    (pathname === '/api/owner/guilds' && method === 'DELETE')
  ) {
    let guildId = (parsedUrl.searchParams.get('guildId') || '').trim();
    if (!guildId && method === 'POST') {
      const body = await parseJsonBody(req).catch(() => ({}));
      guildId = (body.guildId || '').trim();
    }
    if (!guildId) return sendJson(res, 400, { error: 'guildId is required.' });

    // If bot is currently joined to this guild, make it leave
    if (botClient?.guilds?.cache?.has(guildId)) {
      try {
        await botClient.guilds.cache.get(guildId).leave();
      } catch (err) {
        console.warn(`[OWNER:DELETE-GUILD] Could not leave guild ${guildId}:`, err.message);
      }
    }

    // 1. Permanently delete server record from Guild collection
    await Guild.deleteMany({ guildId }).catch(() => {});

    // 2. Wipe all associated database records for this guild
    await Promise.all([
      Wallet.deleteMany({ guildId }),
      Product.deleteMany({ guildId }),
      Order.deleteMany({ guildId }),
      Payment.deleteMany({ guildId }),
      Ledger.deleteMany({ guildId }),
      Config.deleteMany({ guildId }),
      UserInventory.deleteMany({ guildId }),
      ItemActivation.deleteMany({ guildId }),
      ManualClaim.deleteMany({ guildId }),
      DropboxEvent.deleteMany({ guildId }),
      DropboxDrop.deleteMany({ guildId }),
      DropboxClaim.deleteMany({ guildId }),
    ]);

    return sendJson(res, 200, {
      success: true,
      message: `Server ${guildId} and all associated records have been permanently deleted from database and dashboard.`,
    });
  }

  // 9. GET /api/owner/system-stats — Telemetry & Process Health
  if (pathname === '/api/owner/system-stats' && method === 'GET') {
    const mem = process.memoryUsage();
    const totalMem = os.totalmem();
    const memPercent = Math.min(100, Math.max(5, Math.round((mem.rss / totalMem) * 100)));
    const ping = botClient?.ws?.ping >= 0 ? botClient.ws.ping : 0;
    const uptimeSec = Math.floor(process.uptime());
    const uptimeFormatted = uptimeSec < 60 ? `${uptimeSec}s` : uptimeSec < 3600 ? `${Math.floor(uptimeSec / 60)} min` : `${Math.floor(uptimeSec / 3600)}h ${Math.floor((uptimeSec % 3600) / 60)}m`;

    return sendJson(res, 200, {
      rssMb: Math.round(mem.rss / 1024 / 1024),
      rssPercent: memPercent,
      heapUsedMb: Math.round(mem.heapUsed / 1024 / 1024),
      nodeVersion: process.version,
      uptimeSec,
      uptimeFormatted,
      ping,
      pingStatus: ping <= 120 ? 'Optimal' : ping <= 400 ? 'Good' : 'High Latency',
      dbConnected: mongoose.connection.readyState === 1,
      botTag: botClient?.user?.tag || botClient?.user?.username || 'Vyntrix Bot',
      botId: botClient?.user?.id || '',
      guildsCount: botClient?.guilds?.cache?.size || 0,
    });
  }

  return false;
}
