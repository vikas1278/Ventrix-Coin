import mongoose from 'mongoose';
import { ItemActivation, UserInventory, Order, Ledger, Product } from '../models.js';

let intervalId = null;

/**
 * Checks and revokes roles for activations whose expiration date has passed.
 * Also removes expired items and their transaction history logs from DB.
 */
export async function checkExpiredRoles(client) {
  if (!client || !client.isReady()) return;
  if (mongoose.connection.readyState !== 1) return; // Only run if MongoDB is actively connected

  const now = new Date();

  // 1. Process expired ItemActivation records
  const expiredActivations = await ItemActivation.find({
    status: 'active',
    expiresAt: { $ne: null, $lte: now }
  }).lean();

  // 2. Process expired UserInventory items
  const expiredInvs = await UserInventory.find({
    status: 'active',
    expiresAt: { $ne: null, $lte: now }
  }).lean();

  if (!expiredActivations.length && !expiredInvs.length) {
    return;
  }

  console.log(`[ROLE-EXPIRATION] Processing ${expiredActivations.length} expired activation(s) and ${expiredInvs.length} expired inventory item(s)...`);

  // Helper to remove role from a guild member safely
  async function safeRemoveRole(guildId, userId, roleId) {
    if (!guildId || !userId || !roleId || guildId === 'DM' || guildId === 'global') return;
    try {
      const guild = client.guilds.cache.get(guildId) || await client.guilds.fetch(guildId).catch(() => null);
      if (!guild) return;

      const member = await guild.members.fetch(userId).catch(() => null);
      if (!member) return;

      const role = guild.roles.cache.get(roleId) || await guild.roles.fetch(roleId).catch(() => null);
      if (!role || !member.roles.cache.has(role.id)) return;

      const botMember = guild.members.me || await guild.members.fetchMe().catch(() => null);
      if (botMember && botMember.roles.highest.position > role.position) {
        await member.roles.remove(role, 'Temporary item role duration expired');
        console.log(`[ROLE-EXPIRATION] Removed role "${role.name}" from ${userId} in "${guild.name}" (expired).`);
      } else {
        console.warn(`[ROLE-EXPIRATION] Bot hierarchy cannot remove role "${role.name}" in "${guild.name}". Bot role position must be higher than this role.`);
      }
    } catch (e) {
      console.error(`[ROLE-EXPIRATION] Error removing role ${roleId} from ${userId}:`, e);
    }
  }

  // Handle expired ItemActivations
  for (const act of expiredActivations) {
    try {
      // Check if user still has another active, non-expired grant for this role
      const otherActive = await ItemActivation.findOne({
        _id: { $ne: act._id },
        userId: act.userId,
        guildId: act.guildId,
        roleId: act.roleId,
        status: 'active',
        $or: [{ expiresAt: null }, { expiresAt: { $gt: now } }]
      }).lean();

      const otherInvActive = await UserInventory.findOne({
        userId: act.userId,
        guildId: { $in: [act.guildId, 'global'] },
        roleId: act.roleId,
        status: 'active',
        $or: [{ expiresAt: null }, { expiresAt: { $gt: now } }]
      }).lean();

      if (!otherActive && !otherInvActive) {
        await safeRemoveRole(act.guildId, act.userId, act.roleId);
      } else {
        console.log(`[ROLE-EXPIRATION] User ${act.userId} still has active grant for role ${act.roleId}. Role retained.`);
      }

      // Purge activation record
      await ItemActivation.deleteOne({ _id: act._id });

      // Find and purge associated UserInventory records
      const invItems = await UserInventory.find({
        $or: [
          { inventoryId: act.inventoryId },
          { userId: act.userId, roleId: act.roleId, status: 'active', expiresAt: { $lte: now } }
        ]
      }).lean();

      for (const inv of invItems) {
        if (inv.orderId) {
          await Order.deleteMany({ orderId: inv.orderId }).catch(() => {});
          await Ledger.deleteMany({ orderId: inv.orderId }).catch(() => {});
        }
        await UserInventory.deleteOne({ _id: inv._id }).catch(() => {});
      }

      if (act.productId) {
        await Order.deleteMany({ userId: act.userId, productId: act.productId, type: 'shop_purchase' }).catch(() => {});
      }
    } catch (err) {
      console.error(`[ROLE-EXPIRATION] Error processing activation ${act.activationId}:`, err);
    }
  }

  // Handle expired UserInventory records
  for (const inv of expiredInvs) {
    try {
      if (inv.roleId) {
        const otherActive = await ItemActivation.findOne({
          userId: inv.userId,
          roleId: inv.roleId,
          status: 'active',
          $or: [{ expiresAt: null }, { expiresAt: { $gt: now } }]
        }).lean();

        const otherInvActive = await UserInventory.findOne({
          _id: { $ne: inv._id },
          userId: inv.userId,
          roleId: inv.roleId,
          status: 'active',
          $or: [{ expiresAt: null }, { expiresAt: { $gt: now } }]
        }).lean();

        if (!otherActive && !otherInvActive) {
          await safeRemoveRole(inv.guildId, inv.userId, inv.roleId);
        }
      }

      if (inv.orderId) {
        await Order.deleteMany({ orderId: inv.orderId }).catch(() => {});
        await Ledger.deleteMany({ orderId: inv.orderId }).catch(() => {});
      }
      await ItemActivation.deleteMany({ inventoryId: inv.inventoryId }).catch(() => {});
      await UserInventory.deleteOne({ _id: inv._id }).catch(() => {});
    } catch (err) {
      console.error(`[ROLE-EXPIRATION] Error processing inventory ${inv.inventoryId}:`, err);
    }
  }
}

/**
 * Starts scheduled background expiration monitor.
 */
export function startRoleExpirationService(client, intervalSeconds = 20) {
  if (intervalId) clearInterval(intervalId);

  const handleErr = (stage, err) => {
    if (err?.name === 'MongoServerSelectionError' || err?.message?.includes('ENOTFOUND')) {
      console.warn(`\x1b[33m[ROLE-EXPIRATION:${stage}]\x1b[0m MongoDB network drop (retrying when reconnected)...`);
      return;
    }
    console.error(`[ROLE-EXPIRATION:${stage}]`, err);
  };

  // Check immediately on launch
  checkExpiredRoles(client).catch(err => handleErr('BOOT', err));

  intervalId = setInterval(() => {
    checkExpiredRoles(client).catch(err => handleErr('CRON', err));
  }, intervalSeconds * 1000);

  console.log(`\x1b[32m✔ [ROLES]      \x1b[0mTemporary role expiration engine active (checking every ${intervalSeconds}s)`);
}
