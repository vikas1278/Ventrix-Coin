import {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder,
  PermissionFlagsBits,
  MessageFlags,
  ComponentType
} from 'discord.js';
import { UserInventory, ItemActivation, ManualClaim, Product, Order, Ledger } from '../../models.js';
import { coinIcon, coinName, formatCoins, escapeText, C, err, ok, replyEmbed } from '../../utils/common.js';
import { formatDuration } from '../../utils/duration.js';
import { checkExpiredRoles } from '../../services/role-expiration.js';

export const data = new SlashCommandBuilder()
  .setName('item')
  .setDescription('Manage, inspect, and use your purchased shop inventory items')
  .addSubcommand(sub =>
    sub
      .setName('list')
      .setDescription('View purchased items, statuses, and expiration dates')
      .addUserOption(o =>
        o
          .setName('user')
          .setDescription('Member mention or Discord ID to inspect (optional)')
          .setRequired(false)
      )
  )
  .addSubcommand(sub =>
    sub
      .setName('use')
      .setDescription('Select and use or claim an item from your inventory')
  );

const ITEMS_PER_PAGE = 5;

// Status styling & badges
const STATUS_BADGES = {
  available:      { text: 'Available',      emoji: '🟢', desc: 'Ready to use via `/item use`' },
  active:         { text: 'Active',         emoji: '⚡', desc: 'Role / Benefit currently active' },
  claim_required: { text: 'Claim Required', emoji: '📋', desc: 'Requires manual staff fulfillment' },
  consumed:       { text: 'Consumed',       emoji: '⚪', desc: 'Already used / activated' },
  expired:        { text: 'Expired',        emoji: '❌', desc: 'Duration ended — no longer usable' },
};

// ─── Subcommand: /item list ───────────────────────────────────────────────────
export async function buildInventoryEmbed(userId, guildId, pageNumber = 1, callerId = null, targetName = null) {
  const now = new Date();

  const filter = {
    userId,
    guildId: { $in: [guildId, 'global', 'DM'] },
    status: { $in: ['available', 'active', 'claim_required'] },
    $or: [{ expiresAt: null }, { expiresAt: { $gt: now } }]
  };

  const totalItems = await UserInventory.countDocuments(filter);
  const totalPages = Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE));
  const currentPage = Math.min(Math.max(1, pageNumber), totalPages);

  const isSelf = !callerId || callerId === userId;
  const displayName = targetName || `<@${userId}>`;

  if (totalItems === 0) {
    const emptyEmbed = new EmbedBuilder()
      .setColor(C.muted)
      .setTitle(isSelf ? '🎒  Your Inventory is Empty' : `🎒  Inventory is Empty — ${displayName}`)
      .setDescription(
        isSelf
          ? 'You have not purchased any items in this server yet.\n\n' +
            `• Browse available items: \`/shop\`\n` +
            `• Purchase an item: \`/buyitem <item>\`\n` +
            `• Top up ${coinName()}: \`/buycoin\``
          : `<@${userId}> does not have any active or purchased items in this server.`
      )
      .setFooter({ text: isSelf ? 'Purchased items are kept safe in your private inventory' : 'Inspected by member' })
      .setTimestamp();

    return { embed: emptyEmbed, row: null, totalPages: 1, currentPage: 1 };
  }

  const items = await UserInventory.find(filter)
    .sort({ createdAt: -1 })
    .skip((currentPage - 1) * ITEMS_PER_PAGE)
    .limit(ITEMS_PER_PAGE)
    .lean();

  const embed = new EmbedBuilder()
    .setColor(C.brand)
    .setTitle(isSelf ? `🎒  Your Inventory (Page ${currentPage}/${totalPages})` : `🎒  Inventory — ${displayName} (Page ${currentPage}/${totalPages})`)
    .setDescription(
      isSelf
        ? `Here are your purchased items. Use **\`/item use\`** to activate roles or submit claims.\n*Private view for <@${userId}>*`
        : `Viewing purchased and active items for <@${userId}>.`
    )
    .setFooter({
      text: `Total Items: ${totalItems} • Use /item use to activate available items`,
    })
    .setTimestamp();

  for (const item of items) {
    const badge = STATUS_BADGES[item.status] || STATUS_BADGES.available;
    const purchasedTs = Math.floor(new Date(item.purchasedAt).getTime() / 1000);
    const purchaseDate = `<t:${purchasedTs}:d>`;

    let durationInfo = '';
    if (item.itemType === 'TIMED' && item.duration) {
      durationInfo = ` • ⏱️ Duration: \`${item.duration}\``;
    }

    let roleInfo = '';
    if (item.roleId) {
      roleInfo = `\n🎖️ Role: <@&${item.roleId}>`;
    }

    let expiryInfo = '';
    if (item.expiresAt) {
      const expTs = Math.floor(new Date(item.expiresAt).getTime() / 1000);
      expiryInfo = `\n⏰ Expiration: <t:${expTs}:R> (<t:${expTs}:f>)`;
    }

    embed.addFields({
      name: `${badge.emoji}  ${escapeText(item.productName)}  \`[${badge.text}]\``,
      value:
        `🏷️ Type: **${item.itemType}**${durationInfo} • Qty: **${item.quantity || 1}**\n` +
        `📅 Purchased: ${purchaseDate}${roleInfo}${expiryInfo}\n` +
        `🆔 Item ID: \`${item.productId}\` • Inv ID: \`${item.inventoryId}\``,
      inline: false,
    });
  }

  let row = null;
  if (totalPages > 1) {
    const activeCallerId = callerId || userId;
    row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`item_page_${userId}_${currentPage - 1}_${activeCallerId}`)
        .setLabel('◀️ Previous')
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(currentPage <= 1),
      new ButtonBuilder()
        .setCustomId(`item_page_noop_${userId}`)
        .setLabel(`Page ${currentPage} / ${totalPages}`)
        .setStyle(ButtonStyle.Primary)
        .setDisabled(true),
      new ButtonBuilder()
        .setCustomId(`item_page_${userId}_${currentPage + 1}_${activeCallerId}`)
        .setLabel('Next ▶️')
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(currentPage >= totalPages)
    );
  }

  return { embed, row, totalPages, currentPage };
}

// ─── Subcommand: /item use ────────────────────────────────────────────────────
export async function handleItemUse(interaction) {
  const userId = interaction.user.id;
  const guildId = interaction.guildId || 'DM';

  if (!interaction.guildId) {
    return replyEmbed(interaction, err('Guild Only', 'Items can only be used inside a Discord server.'));
  }

  // Find all usable items
  const now = new Date();
  const usableItems = await UserInventory.find({
    userId,
    guildId: { $in: [guildId, 'global'] },
    status: { $in: ['available', 'claim_required'] },
    $or: [{ expiresAt: null }, { expiresAt: { $gt: now } }]
  })
    .sort({ createdAt: -1 })
    .limit(25)
    .lean();

  if (!usableItems.length) {
    return replyEmbed(
      interaction,
      err(
        'No Usable Items',
        'You do not have any items ready to use or claim right now.\n\n' +
        '• Check your inventory: `/item list`\n' +
        '• Browse available items: `/shop`\n' +
        '• Purchase with coins: `/buyitem <item>`'
      )
    );
  }

  const selectOptions = usableItems.map(item => {
    let icon = '📦';
    if (item.behaviorType.startsWith('role')) icon = '🎖️';
    if (item.behaviorType === 'manual_claim') icon = '📋';

    let desc = `${item.itemType} • ${item.behaviorType.replace('_', ' ').toUpperCase()}`;
    if (item.duration) desc += ` (${item.duration})`;

    return {
      label: item.productName.slice(0, 100),
      description: desc.slice(0, 100),
      value: item.inventoryId,
      emoji: icon,
    };
  });

  const selectMenu = new StringSelectMenuBuilder()
    .setCustomId(`item_use_select_${userId}`)
    .setPlaceholder('👉 Choose an item from your inventory to use or claim...')
    .addOptions(selectOptions);

  const row = new ActionRowBuilder().addComponents(selectMenu);

  const promptEmbed = new EmbedBuilder()
    .setColor(C.brand)
    .setTitle('🎒  Use an Inventory Item')
    .setDescription(
      `Select an item from the dropdown below to activate its role or submit a manual fulfillment claim.\n\n` +
      `**Available for use:** \`${usableItems.length}\` item(s)`
    )
    .setFooter({ text: 'Select menu expires in 60 seconds • Only you can select' })
    .setTimestamp();

  await interaction.reply({
    embeds: [promptEmbed],
    components: [row],
    flags: MessageFlags.Ephemeral
  });
  const responseMessage = await interaction.fetchReply();

  // Collector for user's selection
  const collector = responseMessage.createMessageComponentCollector({
    componentType: ComponentType.StringSelect,
    time: 60_000,
    filter: i => i.user.id === userId && i.customId === `item_use_select_${userId}`
  });

  collector.on('collect', async selectInteraction => {
    try {
      // Acknowledge the select menu interaction immediately so Discord doesn't timeout (3s limit)
      await selectInteraction.deferUpdate().catch(() => {});
      const selectedInvId = selectInteraction.values[0];

      // Re-validate selection on server
      const item = await UserInventory.findOne({
        inventoryId: selectedInvId,
        userId,
        guildId: { $in: [guildId, 'global'] },
        status: { $in: ['available', 'claim_required'] },
      });

      if (!item) {
        return interaction.editReply({
          embeds: [err('Item Not Available', 'This item is no longer available or was already used.')],
          components: []
        }).catch(() => {});
      }

      // ─── Behavior 1: Discord Role Items (Permanent or Timed) ───────────────
      if (item.behaviorType === 'role_permanent' || item.behaviorType === 'role_temporary') {
        if (!item.roleId) {
          return interaction.editReply({
            embeds: [err('Role Not Configured', 'This item has no Discord role ID associated with it. Contact an admin.')],
            components: []
          }).catch(() => {});
        }

        const guild = interaction.guild;
        const role = guild.roles.cache.get(item.roleId) || await guild.roles.fetch(item.roleId).catch(() => null);

        if (!role) {
          return interaction.editReply({
            embeds: [err('Role Missing', 'The configured role for this item was deleted or does not exist in this server.')],
            components: []
          }).catch(() => {});
        }

        const botMember = guild.members.me;
        if (!botMember.permissions.has(PermissionFlagsBits.ManageRoles)) {
          return interaction.editReply({
            embeds: [err('Bot Missing Permission', 'The bot lacks the `Manage Roles` permission required to grant this reward.')],
            components: []
          }).catch(() => {});
        }

        if (botMember.roles.highest.position <= role.position) {
          return interaction.editReply({
            embeds: [err('Role Hierarchy Error', `The bot's highest role is lower than <@&${role.id}>. An administrator must move the bot's role above it.`)],
            components: []
          }).catch(() => {});
        }

        const member = await guild.members.fetch(userId);
        const hasRoleAlready = member.roles.cache.has(role.id);

        let expiresAt = null;
        let isRenewal = false;

        if (item.itemType === 'TIMED' || item.behaviorType === 'role_temporary') {
          const durationMs = item.durationMs || 86400000;

          // Check if user already has an active activation for this role
          const existingActivation = await ItemActivation.findOne({
            userId,
            guildId,
            roleId: role.id,
            status: 'active',
            expiresAt: { $gt: new Date() }
          });

          if (existingActivation) {
            // Extend existing activation: base time is the existing activation expiration
            isRenewal = true;
            const baseTs = Math.max(Date.now(), existingActivation.expiresAt ? existingActivation.expiresAt.getTime() : Date.now());
            expiresAt = new Date(baseTs + durationMs);
            existingActivation.expiresAt = expiresAt;
            existingActivation.inventoryId = item.inventoryId;
            await existingActivation.save();

            // Synchronize ALL active items for this user & role in UserInventory
            // so earlier items don't prematurely expire before the total stacked duration completes!
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
            // New timed activation starting at activation time
            expiresAt = new Date(Date.now() + durationMs);
          }
        } else {
          // Permanent role: if user already has it, prevent duplicate consumption
          if (hasRoleAlready) {
            return interaction.editReply({
              embeds: [
                err(
                  'Already Have Role',
                  `You already have the **<@&${role.id}>** role assigned to you!\nYour inventory item has not been consumed.`
                )
              ],
              components: []
            }).catch(() => {});
          }
        }

        // Assign the role if not already holding it
        if (!hasRoleAlready) {
          await member.roles.add(role.id, `Used inventory item: ${item.productName} (${item.inventoryId})`);
        }

        // Create ItemActivation record
        const activationId = `ACT-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 1000).toString(36).toUpperCase()}`;
        if (!isRenewal) {
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

        // Consume the inventory item
        item.status = item.itemType === 'TIMED' ? 'active' : 'consumed';
        item.consumedAt = new Date();
        item.expiresAt = expiresAt;
        await item.save();

        const roleEmbed = new EmbedBuilder()
          .setColor(C.success)
          .setTitle(`🎉  Role Activated — ${escapeText(item.productName)}`)
          .setDescription(
            `Successfully granted role **<@&${role.id}>** to <@${userId}>!\n\n` +
            (item.itemType === 'TIMED'
              ? `⏱️ **Duration:** \`${item.duration || formatDuration(item.durationMs)}\`\n` +
                `⏰ **Expires:** <t:${Math.floor(expiresAt.getTime() / 1000)}:R> (<t:${Math.floor(expiresAt.getTime() / 1000)}:f>)\n` +
                (isRenewal ? '*(Duration extended from your existing active role)*\n' : '') +
                'The role will be automatically removed when the duration ends.'
              : '🌟 **Duration:** Permanent (Never expires)')
          )
          .addFields(
            { name: '👤 Recipient', value: `<@${userId}>`, inline: true },
            { name: '🎖️ Role',      value: `<@&${role.id}>`, inline: true },
            { name: '🎒 Status',    value: '`Applied & Consumed`', inline: true },
          )
          .setFooter({ text: 'Check active items anytime with /item list' })
          .setTimestamp();

        collector.stop('used');
        return interaction.editReply({ embeds: [roleEmbed], components: [] }).catch(() => {});
      }

      // ─── Behavior 2: Static / Manual Claim Items ───────────────────────────
      if (item.behaviorType === 'manual_claim') {
        const existingClaim = await ManualClaim.findOne({
          inventoryId: item.inventoryId,
          status: 'pending'
        });

        if (existingClaim) {
          return interaction.editReply({
            embeds: [
              err(
                'Claim Already Pending',
                `You already submitted a claim for **${escapeText(item.productName)}** (Claim ID: \`${existingClaim.claimId}\`).\n` +
                'Please wait for server staff to process your ticket or claim.'
              )
            ],
            components: []
          }).catch(() => {});
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

        const supportChannelId = process.env.SUPPORT_CHANNEL_ID;
        const supportInfo = supportChannelId
          ? `Please visit <#${supportChannelId}> or open a support ticket with your Claim ID.`
          : 'Please open a support ticket in this server or contact an administrator with your Claim ID.';

        const claimEmbed = new EmbedBuilder()
          .setColor(C.warning)
          .setTitle('📋  Manual Claim Required')
          .setDescription(
            `You selected **${escapeText(item.productName)}**.\n\n` +
            `This item requires **manual fulfillment**. ${supportInfo}\n\n` +
            `**Your item will remain safely in your inventory until the claim is processed.**`
          )
          .addFields(
            { name: '🆔 Claim ID',       value: `\`${claimId}\``, inline: true },
            { name: '🎒 Inventory ID',   value: `\`${item.inventoryId}\``, inline: true },
            { name: '📊 Claim Status',   value: '`Pending Staff Review`', inline: true },
          )
          .setFooter({ text: 'Provide this Claim ID to staff when claiming your reward' })
          .setTimestamp();

        collector.stop('used');
        return interaction.editReply({ embeds: [claimEmbed], components: [] }).catch(() => {});
      }

      // ─── Behavior 3: Consumable Reward ─────────────────────────────────────
      item.status = 'consumed';
      item.consumedAt = new Date();
      await item.save();

      const consumableEmbed = new EmbedBuilder()
        .setColor(C.success)
        .setTitle(`✨  Reward Consumed — ${escapeText(item.productName)}`)
        .setDescription(`You successfully used **${escapeText(item.productName)}**!`)
        .addFields(
          { name: '🎒 Inventory ID', value: `\`${item.inventoryId}\``, inline: true },
          { name: '📊 Status',       value: '`Consumed`', inline: true },
        )
        .setTimestamp();

      collector.stop('used');
      return interaction.editReply({ embeds: [consumableEmbed], components: [] }).catch(() => {});

    } catch (collectErr) {
      console.error('[ITEM:USE:COLLECT]', collectErr);
      return interaction.editReply({
        embeds: [err('Usage Error', collectErr.message || 'Failed to use item.')],
        components: []
      }).catch(() => {});
    }
  });

  collector.on('end', (collected, reason) => {
    if (reason === 'time' && collected.size === 0) {
      interaction.editReply({
        components: [
          new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
              .setCustomId('item_use_expired')
              .setPlaceholder('⌛ Menu expired. Run /item use again to select an item.')
              .setDisabled(true)
              .addOptions({ label: 'Expired', value: 'expired' })
          )
        ]
      }).catch(() => {});
    }
  });
}

// ─── Main Slash Command Executor ──────────────────────────────────────────────
export async function execute(interaction) {
  const subcommand = interaction.options.getSubcommand();

  if (subcommand === 'list') {
    // Proactively clean up any expired roles via Discord client
    checkExpiredRoles(interaction.client).catch(() => {});

    const targetUser = interaction.options.getUser('user') || interaction.user;
    const { embed, row } = await buildInventoryEmbed(
      targetUser.id,
      interaction.guildId || 'DM',
      1,
      interaction.user.id,
      targetUser.displayName || targetUser.username
    );
    const components = row ? [row] : [];
    return interaction.reply({ embeds: [embed], components });
  }

  if (subcommand === 'use') {
    return handleItemUse(interaction);
  }
}

// ─── Component Handler (Pagination Buttons for /item list) ────────────────────
export async function component(interaction) {
  if (!interaction.customId.startsWith('item_page_')) return;

  const parts = interaction.customId.split('_');
  const targetUserId = parts[2];
  const targetPage = parseInt(parts[3], 10);
  const callerId = parts[4] || targetUserId;

  if (interaction.user.id !== callerId) {
    return interaction.reply({
      content: '❌ Only the user who ran this command can interact with the inventory pagination.',
      flags: MessageFlags.Ephemeral
    });
  }

  if (isNaN(targetPage)) return;

  const { embed, row } = await buildInventoryEmbed(
    targetUserId,
    interaction.guildId || 'DM',
    targetPage,
    callerId
  );
  const components = row ? [row] : [];

  return interaction.update({ embeds: [embed], components });
}
