import { PermissionFlagsBits } from 'discord.js';
import mongoose from 'mongoose';
import { ItemActivation, UserInventory, Order, Ledger } from '../models.js';

let intervalId = null;

/**
 * Safely removes a role from a member in a specific guild.
 * Checks permissions, cache, and Discord role hierarchy.
 */
async function removeRoleFromGuildMember(guild, userId, roleId) {
  try {
    const role = guild.roles.cache.get(roleId) || await guild.roles.fetch(roleId).catch(() => null);
    if (!role) {
      console.log(`[ROLE-EXPIRATION] Role ${roleId} not found in guild "${guild.name}" (${guild.id}).`);
      return false;
    }

    const member = await guild.members.fetch(userId).catch(() => null);
    if (!member) {
      console.log(`[ROLE-EXPIRATION] Member ${userId} not found in guild "${guild.name}".`);
      return false;
    }

    if (!member.roles.cache.has(role.id)) {
      console.log(`[ROLE-EXPIRATION] Member ${member.user?.tag || userId} does not hold role "${role.name}" in "${guild.name}".`);
      return true; // Already removed
    }

    const botMember = guild.members.me || (guild.client?.user?.id ? await guild.members.fetch(guild.client.user.id).catch(() => null) : null);
    if (!botMember) {
      console.warn(`[ROLE-EXPIRATION] Unable to resolve bot member in guild "${guild.name}".`);
      return false;
    }

    const hasManageRoles = botMember.permissions.has(PermissionFlagsBits.ManageRoles) || botMember.permissions.has(PermissionFlagsBits.Administrator);
    if (!hasManageRoles) {
      console.warn(`[ROLE-EXPIRATION] ⚠️ Bot lacks 'Manage Roles' permission in guild "${guild.name}" (${guild.id}).`);
      return false;
    }

    if (botMember.roles.highest.position <= role.position) {
      console.warn(
        `[ROLE-EXPIRATION] ⚠️ Role Hierarchy Error in "${guild.name}": Bot's highest role "${botMember.roles.highest.name}" (pos ${botMember.roles.highest.position}) ` +
        `is not above target role "${role.name}" (pos ${role.position}). In Server Settings > Roles, please drag the bot's role ABOVE "${role.name}".`
      );
      return false;
    }

    await member.roles.remove(role, 'Temporary item role duration expired');
    console.log(`[ROLE-EXPIRATION] ✅ Successfully removed expired role "${role.name}" from ${member.user?.tag || userId} in "${guild.name}".`);
    return true;
  } catch (err) {
    console.error(`[ROLE-EXPIRATION] Error removing role ${roleId} from ${userId} in guild "${guild?.name || guild?.id}":`, err.message);
    return false;
  }
}

/**
 * Handles role removal for a user across one or all guilds (if guildId is 'global').
 */
async function safeRemoveRole(client, guildId, userId, roleId) {
  if (!userId || !roleId || guildId === 'DM') return;

  if (!guildId || guildId === 'global') {
    // Role could belong to any guild the bot is in; inspect guilds containing this role
    for (const guild of client.guilds.cache.values()) {
      if (guild.roles.cache.has(roleId)) {
        await removeRoleFromGuildMember(guild, userId, roleId);
      }
    }
    return;
  }

  const guild = client.guilds.cache.get(guildId) || await client.guilds.fetch(guildId).catch(() => null);
  if (!guild) {
    console.warn(`[ROLE-EXPIRATION] Guild ${guildId} not found or inaccessible by bot.`);
    return;
  }

  await removeRoleFromGuildMember(guild, userId, roleId);
}

/**
 * Checks and revokes roles for activations whose expiration date has passed.
 * Marks ItemActivation and UserInventory records as expired while preserving
 * financial Order and Ledger audit history.
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

  const handledInventoryIds = new Set();
  const handledRoleRemovals = new Set();

  if (expiredActivations.length > 0) {
    console.log(`[ROLE-EXPIRATION] Processing ${expiredActivations.length} expired activation(s)...`);

    for (const act of expiredActivations) {
      try {
        handledInventoryIds.add(act.inventoryId);
        const roleKey = `${act.guildId}:${act.userId}:${act.roleId}`;

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
          inventoryId: { $ne: act.inventoryId },
          userId: act.userId,
          guildId: { $in: [act.guildId, 'global'] },
          roleId: act.roleId,
          status: 'active',
          $or: [{ expiresAt: null }, { expiresAt: { $gt: now } }]
        }).lean();

        if (!otherActive && !otherInvActive && !handledRoleRemovals.has(roleKey)) {
          handledRoleRemovals.add(roleKey);
          await safeRemoveRole(client, act.guildId, act.userId, act.roleId);
        } else if (otherActive || otherInvActive) {
          console.log(`[ROLE-EXPIRATION] User ${act.userId} still has active grant for role ${act.roleId}. Role retained.`);
        }

        // Purge activation record
        await ItemActivation.deleteOne({ _id: act._id }).catch(() => {});

        // Find and purge associated UserInventory records and order/ledger history
        const invItems = await UserInventory.find({
          $or: [
            { inventoryId: act.inventoryId },
            { userId: act.userId, roleId: act.roleId, status: 'active', expiresAt: { $lte: now } }
          ]
        }).lean();

        for (const inv of invItems) {
          handledInventoryIds.add(inv.inventoryId);
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
  }

  // 2. Process standalone expired UserInventory items (that were not already purged with an ItemActivation above)
  const invFilter = {
    status: 'active',
    expiresAt: { $ne: null, $lte: now },
  };
  if (handledInventoryIds.size > 0) {
    invFilter.inventoryId = { $nin: Array.from(handledInventoryIds) };
  }

  const expiredInvs = await UserInventory.find(invFilter).lean();

  if (expiredInvs.length > 0) {
    console.log(`[ROLE-EXPIRATION] Processing ${expiredInvs.length} standalone expired inventory item(s)...`);

    for (const inv of expiredInvs) {
      try {
        if (handledInventoryIds.has(inv.inventoryId)) continue;
        handledInventoryIds.add(inv.inventoryId);
        const roleKey = `${inv.guildId}:${inv.userId}:${inv.roleId}`;

        if (inv.roleId) {
          const otherActive = await ItemActivation.findOne({
            userId: inv.userId,
            roleId: inv.roleId,
            status: 'active',
            $or: [{ expiresAt: null }, { expiresAt: { $gt: now } }]
          }).lean();

          const otherInvActive = await UserInventory.findOne({
            _id: { $ne: inv._id },
            inventoryId: { $ne: inv.inventoryId },
            userId: inv.userId,
            roleId: inv.roleId,
            status: 'active',
            $or: [{ expiresAt: null }, { expiresAt: { $gt: now } }]
          }).lean();

          if (!otherActive && !otherInvActive && !handledRoleRemovals.has(roleKey)) {
            handledRoleRemovals.add(roleKey);
            await safeRemoveRole(client, inv.guildId, inv.userId, inv.roleId);
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
