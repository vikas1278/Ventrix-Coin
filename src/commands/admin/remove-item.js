import {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ButtonBuilder,
  ButtonStyle,
  MessageFlags,
  PermissionFlagsBits
} from 'discord.js';
import { UserInventory, ItemActivation, ManualClaim, Order, Ledger } from '../../models.js';
import { escapeText, C, err, replyEmbed, adminOnly } from '../../utils/common.js';

export const data = new SlashCommandBuilder()
  .setName('remove-item')
  .setDescription('Remove an item from a user\'s inventory and purge from database (admin)')
  .addUserOption(o =>
    o
      .setName('user')
      .setDescription('Target member mention or Discord User ID')
      .setRequired(false)
  )
  .addStringOption(o =>
    o
      .setName('inventory_id')
      .setDescription('Inventory ID of the item to remove (optional if user selected)')
      .setRequired(false)
      .setAutocomplete(true)
  )
  .addBooleanOption(o =>
    o
      .setName('revoke_role')
      .setDescription('Automatically revoke active Discord role if applicable (default: true)')
      .setRequired(false)
  );

/**
 * Safely removes a role from a member if they have no other active grant for that role.
 */
async function revokeItemRoleIfApplicable(guild, userId, roleId) {
  if (!guild || !userId || !roleId) return false;
  try {
    const hasOtherInv = await UserInventory.findOne({
      userId,
      guildId: { $in: [guild.id, 'global'] },
      roleId,
      status: 'active',
      $or: [{ expiresAt: null }, { expiresAt: { $gt: new Date() } }]
    }).lean();

    const hasOtherAct = await ItemActivation.findOne({
      userId,
      guildId: guild.id,
      roleId,
      status: 'active',
      $or: [{ expiresAt: null }, { expiresAt: { $gt: new Date() } }]
    }).lean();

    if (!hasOtherInv && !hasOtherAct) {
      const member = await guild.members.fetch(userId).catch(() => null);
      const role = guild.roles.cache.get(roleId) || await guild.roles.fetch(roleId).catch(() => null);
      const botMember = guild.members.me || await guild.members.fetchMe().catch(() => null);
      if (member && role && member.roles.cache.has(role.id)) {
        if (botMember && botMember.roles.highest.position > role.position) {
          await member.roles.remove(role, 'Item removed from inventory by administrator');
          return true;
        }
      }
    }
  } catch (err) {
    console.error('[REMOVE-ITEM:REVOKE-ROLE]', err);
  }
  return false;
}

/**
 * Purges a single inventory item and its associated activation, claims, orders, and ledger logs.
 */
async function purgeSingleInventoryItem(guild, item, revokeRole = true) {
  let roleRevoked = false;

  // Revoke role if active and requested
  if (revokeRole && item.roleId && guild) {
    roleRevoked = await revokeItemRoleIfApplicable(guild, item.userId, item.roleId);
  }

  // Purge from DB completely
  await UserInventory.deleteOne({ _id: item._id });
  await ItemActivation.deleteMany({ inventoryId: item.inventoryId }).catch(() => {});
  await ManualClaim.deleteMany({ inventoryId: item.inventoryId }).catch(() => {});

  if (item.orderId) {
    await Order.deleteMany({ orderId: item.orderId }).catch(() => {});
    await Ledger.deleteMany({ orderId: item.orderId }).catch(() => {});
  }

  return { roleRevoked, productName: item.productName };
}

export async function execute(interaction) {
  if (!adminOnly(interaction)) {
    return replyEmbed(interaction, err('Access Denied', 'This command is restricted to administrators.'));
  }

  const targetUser = interaction.options.getUser('user');
  const inputInvId = interaction.options.getString('inventory_id')?.trim();
  const revokeRole = interaction.options.getBoolean('revoke_role') ?? true;
  const guildId = interaction.guildId || 'DM';

  if (!targetUser && !inputInvId) {
    return replyEmbed(
      interaction,
      err(
        'Missing Parameters',
        'Please provide either a **user** (mention or Discord ID) OR a specific **inventory_id** to remove.'
      )
    );
  }

  // ─── Case 1: Specific Inventory ID provided ───────────────────────────────
  if (inputInvId) {
    const itemFilter = { inventoryId: inputInvId };
    if (guildId !== 'DM') itemFilter.guildId = { $in: [guildId, 'global', 'DM'] };
    if (targetUser) itemFilter.userId = targetUser.id;

    const item = await UserInventory.findOne(itemFilter);
    if (!item) {
      return replyEmbed(
        interaction,
        err('Item Not Found', `No inventory item found with ID \`${escapeText(inputInvId)}\`${targetUser ? ` for <@${targetUser.id}>` : ''}.`)
      );
    }

    const { roleRevoked, productName } = await purgeSingleInventoryItem(interaction.guild, item, revokeRole);

    const embed = new EmbedBuilder()
      .setColor(C.danger)
      .setTitle('🗑️  Item Removed From Inventory')
      .setDescription(
        `Successfully removed **${escapeText(productName)}** from <@${item.userId}>'s inventory and permanently purged it from the database.`
      )
      .addFields(
        { name: '👤 Member',         value: `<@${item.userId}> (\`${item.userId}\`)`, inline: true },
        { name: '🎒 Removed Item',   value: `**${escapeText(productName)}**`,          inline: true },
        { name: '🆔 Inventory ID',   value: `\`${item.inventoryId}\``,                inline: true },
        { name: '🎖️ Role Status',    value: roleRevoked ? '✅ Role automatically revoked from member' : (item.roleId ? '⚪ Role retained (or user had other grant)' : 'N/A (No role attached)'), inline: false },
        { name: '🗄️ Database Audit', value: 'Item, activations, order logs, and ledger entries purged.', inline: false }
      )
      .setFooter({ text: `Action performed by ${interaction.user.tag || interaction.user.id}` })
      .setTimestamp();

    return replyEmbed(interaction, embed);
  }

  // ─── Case 2: Target User provided without inventory_id ────────────────────
  const userItems = await UserInventory.find({
    userId: targetUser.id,
    guildId: { $in: [guildId, 'global', 'DM'] }
  }).sort({ createdAt: -1 });

  if (userItems.length === 0) {
    return replyEmbed(
      interaction,
      err('Empty Inventory', `<@${targetUser.id}> does not have any items in their inventory.`)
    );
  }

  // Build a selection dropdown menu so the admin can pick the exact item or remove all
  const selectMenu = new StringSelectMenuBuilder()
    .setCustomId(`remove_item_select_${targetUser.id}_${revokeRole ? 1 : 0}_${interaction.user.id}`)
    .setPlaceholder('Select an item to remove, or choose "Remove ALL Items"...');

  const options = [];

  // Add individual items (up to 24)
  for (const itm of userItems.slice(0, 24)) {
    const roleTag = itm.roleId ? ' [Role Item]' : '';
    const statusTag = itm.status.toUpperCase();
    options.push({
      label: `${itm.productName.slice(0, 60)} (${statusTag})`,
      description: `Inv: ${itm.inventoryId.slice(0, 40)}${roleTag}`,
      value: itm.inventoryId,
      emoji: itm.itemType === 'TIMED' ? '⏱️' : '📦'
    });
  }

  // Option to purge entire inventory
  options.unshift({
    label: `🗑️ Remove ALL Items (${userItems.length} total)`,
    description: 'Permanently purge all inventory items for this user and revoke roles',
    value: '__ALL__',
    emoji: '⚠️'
  });

  selectMenu.addOptions(options);

  const row = new ActionRowBuilder().addComponents(selectMenu);

  const promptEmbed = new EmbedBuilder()
    .setColor(C.brand)
    .setTitle(`🎒  Manage Inventory — ${escapeText(targetUser.displayName || targetUser.username)}`)
    .setDescription(
      `Found **${userItems.length}** item(s) in <@${targetUser.id}>'s inventory.\n\n` +
      `Select an item from the menu below to remove it permanently, or choose **Remove ALL Items**.`
    )
    .setFooter({ text: 'Selection menu active • Only you can select' })
    .setTimestamp();

  return interaction.reply({
    embeds: [promptEmbed],
    components: [row],
    flags: MessageFlags.Ephemeral
  });
}

/**
 * Component handler for interactive item removal select menu and confirmation buttons.
 */
export async function component(interaction) {
  // ─── Button Confirmation: Confirm Purge ALL Items ────────────────────────
  if (interaction.customId.startsWith('remove_item_confirm_')) {
    const parts = interaction.customId.split('_');
    const targetUserId = parts[3];
    const revokeRole = parts[4] === '1';
    const callerId = parts[5] || targetUserId;

    if (interaction.user.id !== callerId) {
      return interaction.reply({
        content: '❌ Only the administrator who invoked this command can confirm the deletion.',
        flags: MessageFlags.Ephemeral
      });
    }

    await interaction.deferUpdate().catch(() => {});

    const guild = interaction.guild;
    const guildId = interaction.guildId || 'DM';

    const items = await UserInventory.find({
      userId: targetUserId,
      guildId: { $in: [guildId, 'global', 'DM'] }
    });

    let revokedCount = 0;
    for (const itm of items) {
      const { roleRevoked } = await purgeSingleInventoryItem(guild, itm, revokeRole);
      if (roleRevoked) revokedCount++;
    }

    const embed = new EmbedBuilder()
      .setColor(C.danger)
      .setTitle('🗑️  All Inventory Items Purged')
      .setDescription(
        `Successfully deleted all **${items.length}** item(s) from <@${targetUserId}>'s inventory and purged all associated records from the database.`
      )
      .addFields(
        { name: '👤 Member',        value: `<@${targetUserId}> (\`${targetUserId}\`)`, inline: true },
        { name: '📦 Items Purged',  value: `**${items.length}** item(s)`,              inline: true },
        { name: '🎖️ Roles Revoked', value: `${revokedCount} role(s) revoked`,        inline: true },
        { name: '🗄️ Database Audit', value: 'All inventory, activation, and transaction records cleared.', inline: false }
      )
      .setFooter({ text: `Purge confirmed by ${interaction.user.tag || interaction.user.id}` })
      .setTimestamp();

    return interaction.editReply({ embeds: [embed], components: [] }).catch(() => {});
  }

  // ─── Button Confirmation: Cancel Purge ────────────────────────────────────
  if (interaction.customId.startsWith('remove_item_cancel_')) {
    const parts = interaction.customId.split('_');
    const targetUserId = parts[3];
    const callerId = parts[4] || targetUserId;

    if (interaction.user.id !== callerId) {
      return interaction.reply({
        content: '❌ Only the administrator who invoked this command can cancel.',
        flags: MessageFlags.Ephemeral
      });
    }

    await interaction.deferUpdate().catch(() => {});

    const cancelEmbed = new EmbedBuilder()
      .setColor(C.muted)
      .setTitle('❌  Action Cancelled')
      .setDescription(`Bulk inventory deletion was cancelled. No items were removed from <@${targetUserId}>'s inventory.`)
      .setTimestamp();

    return interaction.editReply({ embeds: [cancelEmbed], components: [] }).catch(() => {});
  }

  // ─── Select Menu Handling ─────────────────────────────────────────────────
  if (!interaction.customId.startsWith('remove_item_select_')) return;

  const parts = interaction.customId.split('_');
  const targetUserId = parts[3];
  const revokeRole = parts[4] === '1';
  const callerId = parts[5] || targetUserId;

  if (interaction.user.id !== callerId) {
    return interaction.reply({
      content: '❌ Only the administrator who invoked this command can select an item.',
      flags: MessageFlags.Ephemeral
    });
  }

  await interaction.deferUpdate().catch(() => {});

  const selectedValue = interaction.values[0];
  const guild = interaction.guild;
  const guildId = interaction.guildId || 'DM';

  // ─── Option A: Remove ALL Items (Prompt Button Confirmation First) ─────────
  if (selectedValue === '__ALL__') {
    const items = await UserInventory.find({
      userId: targetUserId,
      guildId: { $in: [guildId, 'global', 'DM'] }
    });

    const confirmEmbed = new EmbedBuilder()
      .setColor(C.danger)
      .setTitle('⚠️  Confirm Bulk Inventory Deletion')
      .setDescription(
        `Are you sure you want to permanently delete **ALL ${items.length} item(s)** from <@${targetUserId}>'s inventory?\n\n` +
        `• All inventory items will be erased from the database.\n` +
        `• Associated order and ledger records will be purged.\n` +
        (revokeRole ? `• All active Discord roles granted by these items will be revoked.\n\n` : '\n') +
        `⚠️ **This action is irreversible.** Please click the button below to confirm or cancel.`
      )
      .setFooter({ text: 'Admin confirmation required before deletion' })
      .setTimestamp();

    const confirmRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`remove_item_confirm_${targetUserId}_${revokeRole ? 1 : 0}_${callerId}`)
        .setLabel('🗑️ Yes, Confirm Delete All')
        .setStyle(ButtonStyle.Danger),
      new ButtonBuilder()
        .setCustomId(`remove_item_cancel_${targetUserId}_${callerId}`)
        .setLabel('❌ Cancel')
        .setStyle(ButtonStyle.Secondary)
    );

    return interaction.editReply({
      embeds: [confirmEmbed],
      components: [confirmRow]
    }).catch(() => {});
  }

  // ─── Option B: Remove Single Specific Item ────────────────────────────────
  const item = await UserInventory.findOne({
    inventoryId: selectedValue,
    userId: targetUserId
  });

  if (!item) {
    return interaction.editReply({
      embeds: [err('Item Not Found', 'This inventory item was already removed or does not exist.')],
      components: []
    }).catch(() => {});
  }

  const { roleRevoked, productName } = await purgeSingleInventoryItem(guild, item, revokeRole);

  const embed = new EmbedBuilder()
    .setColor(C.danger)
    .setTitle('🗑️  Item Removed From Inventory')
    .setDescription(
      `Successfully removed **${escapeText(productName)}** from <@${targetUserId}>'s inventory and permanently purged it from the database.`
    )
    .addFields(
      { name: '👤 Member',         value: `<@${targetUserId}> (\`${targetUserId}\`)`, inline: true },
      { name: '🎒 Removed Item',   value: `**${escapeText(productName)}**`,          inline: true },
      { name: '🆔 Inventory ID',   value: `\`${item.inventoryId}\``,                inline: true },
      { name: '🎖️ Role Status',    value: roleRevoked ? '✅ Role automatically revoked from member' : (item.roleId ? '⚪ Role retained (or user had other grant)' : 'N/A (No role attached)'), inline: false },
    )
    .setFooter({ text: `Action performed by ${interaction.user.tag || interaction.user.id}` })
    .setTimestamp();

  return interaction.editReply({ embeds: [embed], components: [] }).catch(() => {});
}

/**
 * Autocomplete for inventory_id option.
 */
export async function autocomplete(interaction) {
  const focused = interaction.options.getFocused(true);
  const query = String(focused.value || '').trim().toLowerCase();
  const targetUser = interaction.options.getUser('user');
  const guildId = interaction.guildId || 'DM';

  const filter = {};
  if (guildId !== 'DM') filter.guildId = { $in: [guildId, 'global', 'DM'] };
  if (targetUser) filter.userId = targetUser.id;

  const items = await UserInventory.find(filter)
    .sort({ createdAt: -1 })
    .limit(25)
    .lean();

  const filtered = items
    .filter(itm =>
      !query ||
      itm.productName.toLowerCase().includes(query) ||
      itm.inventoryId.toLowerCase().includes(query) ||
      itm.userId.includes(query)
    )
    .slice(0, 25);

  return interaction.respond(
    filtered.map(itm => ({
      name: `🎒 ${itm.productName.slice(0, 45)} [${itm.status}] — (${itm.inventoryId.slice(-8)})`.slice(0, 100),
      value: itm.inventoryId
    }))
  ).catch(() => {});
}
