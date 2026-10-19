import {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  MessageFlags,
} from 'discord.js';
import {
  Wallet,
  Product,
  Order,
  Ledger,
  Config,
  UserInventory,
  ItemActivation,
  ManualClaim,
  DropboxEvent,
  DropboxDrop,
  DropboxClaim,
  Guild,
} from '../../models.js';
import { ownerOnly, C, err, ok, replyEmbed } from '../../utils/common.js';

export const data = new SlashCommandBuilder()
  .setName('clearserver')
  .setDescription('Wipe all database records for a specific Discord server (Bot Owner Only)')
  .addStringOption(o =>
    o
      .setName('server')
      .setDescription('Select server from list or enter 17-19 digit Server ID')
      .setRequired(true)
      .setAutocomplete(true)
  );

export async function autocomplete(interaction) {
  if (!ownerOnly(interaction)) {
    return interaction.respond([]).catch(() => {});
  }

  const focused = interaction.options.getFocused().trim().toLowerCase();

  try {
    const dbGuilds = await Guild.find({}).sort({ status: 1, guildName: 1 }).limit(50).lean().catch(() => []);

    const knownGuilds = new Map();
    for (const g of dbGuilds) {
      knownGuilds.set(g.guildId, {
        id: g.guildId,
        name: g.guildName,
        status: g.status || 'active',
        memberCount: g.memberCount || 0,
      });
    }

    // Merge with client cache
    if (interaction.client?.guilds?.cache) {
      for (const g of interaction.client.guilds.cache.values()) {
        if (!knownGuilds.has(g.id)) {
          knownGuilds.set(g.id, {
            id: g.id,
            name: g.name,
            status: 'active',
            memberCount: g.memberCount || 0,
          });
        } else {
          const entry = knownGuilds.get(g.id);
          entry.status = 'active';
          entry.name = g.name;
          entry.memberCount = g.memberCount || entry.memberCount;
        }
      }
    }

    const list = Array.from(knownGuilds.values());
    const filtered = list
      .filter(g => g.name.toLowerCase().includes(focused) || g.id.includes(focused))
      .slice(0, 24);

    const choices = filtered.map(g => {
      const badge = g.status === 'active' ? '🟢' : '🔴';
      const statusText = g.status === 'active' ? `(${g.memberCount} members)` : '[BOT LEFT]';
      const label = `${badge} ${g.name} ${statusText}`.slice(0, 100);
      return { name: label, value: g.id };
    });

    if (focused && /^\d{17,20}$/.test(focused) && !choices.some(c => c.value === focused)) {
      choices.unshift({ name: `🔍 Raw Server ID: ${focused}`, value: focused });
    }

    return interaction.respond(choices).catch(() => {});
  } catch {
    return interaction.respond([]).catch(() => {});
  }
}

export async function getGuildRecordCounts(guildId) {
  const [
    wallets,
    products,
    orders,
    ledgers,
    inventories,
    activations,
    claims,
    dropboxEvents,
    dropboxDrops,
    dropboxClaims,
    configs,
  ] = await Promise.all([
    Wallet.countDocuments({ guildId }),
    Product.countDocuments({ guildId }),
    Order.countDocuments({ guildId }),
    Ledger.countDocuments({ guildId }),
    UserInventory.countDocuments({ guildId }),
    ItemActivation.countDocuments({ guildId }),
    ManualClaim.countDocuments({ guildId }),
    DropboxEvent.countDocuments({ guildId }),
    DropboxDrop.countDocuments({ guildId }),
    DropboxClaim.countDocuments({ guildId }),
    Config.countDocuments({ guildId }),
  ]);

  const total =
    wallets +
    products +
    orders +
    ledgers +
    inventories +
    activations +
    claims +
    dropboxEvents +
    dropboxDrops +
    dropboxClaims +
    configs;

  return {
    wallets,
    products,
    orders,
    ledgers,
    inventories,
    activations,
    claims,
    dropboxEvents,
    dropboxDrops,
    dropboxClaims,
    configs,
    total,
  };
}

export async function wipeGuildData(guildId) {
  const [
    wRes,
    pRes,
    oRes,
    lRes,
    invRes,
    actRes,
    clRes,
    evRes,
    drRes,
    dcRes,
    cfgRes,
    gRes,
  ] = await Promise.all([
    Wallet.deleteMany({ guildId }),
    Product.deleteMany({ guildId }),
    Order.deleteMany({ guildId }),
    Ledger.deleteMany({ guildId }),
    UserInventory.deleteMany({ guildId }),
    ItemActivation.deleteMany({ guildId }),
    ManualClaim.deleteMany({ guildId }),
    DropboxEvent.deleteMany({ guildId }),
    DropboxDrop.deleteMany({ guildId }),
    DropboxClaim.deleteMany({ guildId }),
    Config.deleteMany({ guildId }),
    Guild.deleteOne({ guildId }),
  ]);

  return {
    wallets: wRes.deletedCount,
    products: pRes.deletedCount,
    orders: oRes.deletedCount,
    ledgers: lRes.deletedCount,
    inventories: invRes.deletedCount,
    activations: actRes.deletedCount,
    claims: clRes.deletedCount,
    dropboxEvents: evRes.deletedCount,
    dropboxDrops: drRes.deletedCount,
    dropboxClaims: dcRes.deletedCount,
    configs: cfgRes.deletedCount,
    guildDeleted: gRes.deletedCount > 0,
    totalDeleted:
      wRes.deletedCount +
      pRes.deletedCount +
      oRes.deletedCount +
      lRes.deletedCount +
      invRes.deletedCount +
      actRes.deletedCount +
      clRes.deletedCount +
      evRes.deletedCount +
      drRes.deletedCount +
      dcRes.deletedCount +
      cfgRes.deletedCount,
  };
}

export async function execute(interaction) {
  if (!ownerOnly(interaction)) {
    return replyEmbed(
      interaction,
      err('Access Denied', 'This command is strictly restricted to **Bot Owners**.')
    );
  }

  await interaction.deferReply({ flags: MessageFlags.Ephemeral });

  const targetGuildId = interaction.options.getString('server').trim();
  const cachedGuild = interaction.client?.guilds?.cache.get(targetGuildId);
  const dbGuild = await Guild.findOne({ guildId: targetGuildId }).lean().catch(() => null);

  const serverName = cachedGuild?.name || dbGuild?.guildName || 'Unknown Server';
  const isPresent = Boolean(cachedGuild);

  const counts = await getGuildRecordCounts(targetGuildId);

  if (counts.total === 0) {
    const emptyEmbed = new EmbedBuilder()
      .setColor(C.accent)
      .setTitle('🔍 No Records Found')
      .setDescription(
        `No database records were found for server:\n**${serverName}** (\`${targetGuildId}\`).\n\nThe database has zero footprint for this server.`
      )
      .setFooter({ text: 'Bot Owner Server Manager' })
      .setTimestamp();

    return interaction.editReply({ embeds: [emptyEmbed] });
  }

  const warningEmbed = new EmbedBuilder()
    .setColor(0xed4245) // Danger Red
    .setTitle('⚠️  Confirm Complete Server Data Wipe')
    .setDescription(
      `You are about to **PERMANENTLY DESTROY** all database records for:\n\n` +
      `🏰 **${serverName}**\n` +
      `🆔 **Server ID:** \`${targetGuildId}\`\n` +
      `📡 **Current Bot Status:** ${isPresent ? '🟢 Active in Server' : '🔴 Bot has Left / Kicked'}\n\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `📊 **Records Found in Database:**\n` +
      `• 👛 **Wallets:** \`${counts.wallets}\`\n` +
      `• 🛍️ **Shop Items:** \`${counts.products}\`\n` +
      `• 📦 **Orders (UPI/Coins):** \`${counts.orders}\`\n` +
      `• 📜 **Ledger Audit Trail:** \`${counts.ledgers}\`\n` +
      `• 🎒 **User Inventories:** \`${counts.inventories}\`\n` +
      `• 🎁 **Dropbox Events:** \`${counts.dropboxEvents}\`\n` +
      `• ⚙️ **Shop Configs:** \`${counts.configs}\`\n` +
      `• 🔢 **Total Records:** **${counts.total}**\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
      `🚨 **WARNING:** This action is **IRREVERSIBLE**! All user coin balances, store catalogue items, order records, and settings will be permanently wiped from MongoDB Atlas.`
    )
    .setFooter({ text: 'Danger Zone • Bot Owner Security Clearance Required' })
    .setTimestamp();

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`clear_server_confirm_${targetGuildId}_${interaction.user.id}`)
      .setLabel('🔴 Confirm Wipe All Data')
      .setStyle(ButtonStyle.Danger),
    new ButtonBuilder()
      .setCustomId(`clear_server_cancel_${targetGuildId}_${interaction.user.id}`)
      .setLabel('❌ Cancel')
      .setStyle(ButtonStyle.Secondary)
  );

  return interaction.editReply({ embeds: [warningEmbed], components: [row] });
}

export async function component(interaction) {
  if (!ownerOnly(interaction)) {
    return interaction.reply({
      content: '❌ Only Bot Owners can perform server data wipe operations.',
      ephemeral: true,
    }).catch(() => {});
  }

  const id = interaction.customId;

  // Handle Cancel
  if (id.startsWith('clear_server_cancel_')) {
    const cancelEmbed = new EmbedBuilder()
      .setColor(C.muted || 0x6e7681)
      .setTitle('❌ Operation Cancelled')
      .setDescription('Server data wipe has been cancelled. No database records were modified or deleted.')
      .setTimestamp();

    return interaction.update({ embeds: [cancelEmbed], components: [] });
  }

  // Handle Confirm
  if (id.startsWith('clear_server_confirm_') || id.startsWith('wipe_guild_')) {
    let targetGuildId = '';
    if (id.startsWith('clear_server_confirm_')) {
      const parts = id.replace('clear_server_confirm_', '').split('_');
      targetGuildId = parts[0];
    } else {
      targetGuildId = id.replace('wipe_guild_', '');
    }

    await interaction.deferUpdate();

    const cachedGuild = interaction.client?.guilds?.cache.get(targetGuildId);
    const dbGuild = await Guild.findOne({ guildId: targetGuildId }).lean().catch(() => null);
    const serverName = cachedGuild?.name || dbGuild?.guildName || 'Unknown Server';

    const result = await wipeGuildData(targetGuildId);

    const successEmbed = new EmbedBuilder()
      .setColor(C.success)
      .setTitle('🗑️  Server Data Completely Wiped')
      .setDescription(
        `All database records for **${serverName}** (\`${targetGuildId}\`) have been **permanently deleted**.\n\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `✅ **Cleaned Up Records:**\n` +
        `• 👛 Wallets Deleted: **${result.wallets}**\n` +
        `• 🛍️ Products Deleted: **${result.products}**\n` +
        `• 📦 Orders Deleted: **${result.orders}**\n` +
        `• 📜 Ledger Records: **${result.ledgers}**\n` +
        `• 🎒 Inventories: **${result.inventories}**\n` +
        `• 🎁 Dropbox Events: **${result.dropboxEvents}**\n` +
        `• ⚙️ Configs Deleted: **${result.configs}**\n` +
        `• 🔢 **Total Deleted: ${result.totalDeleted} records**\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
        `✨ *The database now contains zero residual data for this server.*`
      )
      .setFooter({ text: 'Database Purge Completed • Zero Footprint Remaining' })
      .setTimestamp();

    return interaction.editReply({ embeds: [successEmbed], components: [] });
  }

  // Handle Keep Guild Data (from kick notification)
  if (id.startsWith('keep_guild_')) {
    const targetGuildId = id.replace('keep_guild_', '');
    const keepEmbed = new EmbedBuilder()
      .setColor(C.primary)
      .setTitle('💾 Data Retained')
      .setDescription(
        `Database records for server \`${targetGuildId}\` have been preserved.\n\nIf the bot is re-invited, all member balances and store items will be restored. You can also wipe it anytime using \`/clearserver\`.`
      )
      .setTimestamp();

    return interaction.update({ embeds: [keepEmbed], components: [] });
  }
}
