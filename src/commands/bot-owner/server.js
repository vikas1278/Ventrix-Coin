import {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder,
  MessageFlags,
  PermissionFlagsBits,
} from 'discord.js';
import mongoose from 'mongoose';
import { ownerOnly, C, err, ok, escapeText } from '../../utils/common.js';
import {
  Guild,
  Wallet,
  Product,
  Order,
  Payment,
  Ledger,
  Config,
  UserInventory,
  ItemActivation,
  ManualClaim,
  DropboxEvent,
  DropboxDrop,
  DropboxClaim,
  GameSettings,
  MineSession,
  GameHistory,
} from '../../models.js';

export const data = new SlashCommandBuilder()
  .setName('server')
  .setDescription('Manage Discord servers the bot is connected to (Bot Owner Only)')
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .setDMPermission(false)
  .addSubcommand(sub =>
    sub
      .setName('list')
      .setDescription('View all servers where the bot is currently joined (Bot Owner Only)')
      .addIntegerOption(o =>
        o
          .setName('page')
          .setDescription('Page number to view')
          .setMinValue(1)
          .setRequired(false)
      )
  )
  .addSubcommand(sub =>
    sub
      .setName('remove')
      .setDescription('Select a server and make the bot leave it (Bot Owner Only)')
      .addStringOption(o =>
        o
          .setName('server')
          .setDescription('Select server from list or enter 17-20 digit Server ID')
          .setRequired(false)
          .setAutocomplete(true)
      )
  );

const SERVERS_PER_PAGE = 5;

// ─── Builder: Server List Embed ──────────────────────────────────────────────
export function buildServerListEmbed(client, pageNumber = 1, callerId = null) {
  const activeGuilds = Array.from(client.guilds.cache.values())
    .sort((a, b) => (b.memberCount || 0) - (a.memberCount || 0));

  const totalServers = activeGuilds.length;
  const totalMembers = activeGuilds.reduce((acc, g) => acc + (g.memberCount || 0), 0);

  if (totalServers === 0) {
    const emptyEmbed = new EmbedBuilder()
      .setColor(C.brand)
      .setTitle('🌐 Connected Servers')
      .setDescription(
        'The bot is currently not joined to any Discord servers.\n\n' +
        'Invite the bot to a server using your OAuth2 invite link.'
      )
      .setFooter({ text: 'Total Servers: 0 • Bot Owner Controls' })
      .setTimestamp();

    return { embed: emptyEmbed, rows: [], totalPages: 1, currentPage: 1 };
  }

  const totalPages = Math.max(1, Math.ceil(totalServers / SERVERS_PER_PAGE));
  const currentPage = Math.min(Math.max(1, pageNumber), totalPages);

  const start = (currentPage - 1) * SERVERS_PER_PAGE;
  const pageGuilds = activeGuilds.slice(start, start + SERVERS_PER_PAGE);

  const header = `Total Servers: **${totalServers}** · Total Members: **${totalMembers.toLocaleString()}** · Page ${currentPage}/${totalPages}\n\n──────────────────\n\n`;

  const blocks = pageGuilds.map((g, idx) => {
    const index = start + idx + 1;
    const joinedTs = g.joinedTimestamp ? Math.floor(g.joinedTimestamp / 1000) : null;
    const joinedStr = joinedTs ? `<t:${joinedTs}:R>` : 'Unknown';
    const ownerStr = g.ownerId ? `<@${g.ownerId}> (\`${g.ownerId}\`)` : '`Unknown`';

    return (
      `**${index}. ${escapeText(g.name)}**\n` +
      `• **ID**: \`${g.id}\`\n` +
      `• **Members**: \`${(g.memberCount || 0).toLocaleString()}\`\n` +
      `• **Owner**: ${ownerStr}\n` +
      `• **Joined**: ${joinedStr}`
    );
  });

  const divider = '\n\n──────────────────\n\n';
  const description = `${header}${blocks.join(divider)}\n\n──────────────────\n\n💡 *Tip: Use \`/server remove\` or click below to leave a server.*`;

  const embed = new EmbedBuilder()
    .setColor(C.brand)
    .setTitle('🌐 Connected Servers Directory')
    .setDescription(description)
    .setFooter({ text: `Page ${currentPage} of ${totalPages} • Bot Owner Controls` })
    .setTimestamp();

  if (client.user?.displayAvatarURL) {
    embed.setThumbnail(client.user.displayAvatarURL({ extension: 'png', size: 128 }));
  }

  const activeCallerId = callerId || '';
  const rows = [];

  const paginationRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`srv_page_${currentPage - 1}_${activeCallerId}`)
      .setLabel('◀ Previous')
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(currentPage <= 1),
    new ButtonBuilder()
      .setCustomId(`srv_indicator_${activeCallerId}`)
      .setLabel(`Page ${currentPage}/${totalPages}`)
      .setStyle(ButtonStyle.Primary)
      .setDisabled(true),
    new ButtonBuilder()
      .setCustomId(`srv_page_${currentPage + 1}_${activeCallerId}`)
      .setLabel('Next ▶')
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(currentPage >= totalPages),
    new ButtonBuilder()
      .setCustomId(`srv_menu_open_${activeCallerId}`)
      .setLabel('🚪 Leave Server')
      .setStyle(ButtonStyle.Danger)
  );
  rows.push(paginationRow);

  return { embed, rows, totalPages, currentPage };
}

// ─── Builder: Select Menu for Choosing Server to Leave ───────────────────────
export function buildServerLeaveSelectMenu(client, callerId) {
  const activeGuilds = Array.from(client.guilds.cache.values())
    .sort((a, b) => (b.memberCount || 0) - (a.memberCount || 0));

  if (activeGuilds.length === 0) {
    const embed = err('No Servers', 'The bot is not currently joined to any Discord servers.');
    return { embed, rows: [] };
  }

  const embed = new EmbedBuilder()
    .setColor(0xF59E0B) // Amber
    .setTitle('🚪 Select Server to Leave')
    .setDescription(
      `Please select which server the bot should leave from the dropdown menu below.\n\n` +
      `• Active Servers: **${activeGuilds.length}**\n` +
      `• *Note: You will be asked to confirm before the bot departs.*`
    )
    .setFooter({ text: 'Bot Owner Controls • Server Removal' });

  // Discord select menu supports max 25 options
  const selectGuilds = activeGuilds.slice(0, 25);
  const options = selectGuilds.map(g => ({
    label: g.name.slice(0, 100),
    description: `${(g.memberCount || 0).toLocaleString()} members • ID: ${g.id}`.slice(0, 100),
    value: g.id,
    emoji: '🌐',
  }));

  const selectMenu = new StringSelectMenuBuilder()
    .setCustomId(`srv_select_leave_${callerId}`)
    .setPlaceholder('👉 Choose a server for the bot to leave...')
    .addOptions(options);

  const cancelRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`srv_cancel_leave_${callerId}`)
      .setLabel('Cancel')
      .setStyle(ButtonStyle.Secondary)
  );

  return {
    embed,
    rows: [new ActionRowBuilder().addComponents(selectMenu), cancelRow],
  };
}

// ─── Builder: Confirmation Card Before Leaving ──────────────────────────────
export function buildServerConfirmEmbed(guild, callerId) {
  const iconUrl = guild.iconURL?.({ dynamic: true, size: 256 }) || null;
  const joinedTs = guild.joinedTimestamp ? Math.floor(guild.joinedTimestamp / 1000) : null;
  const joinedStr = joinedTs ? `<t:${joinedTs}:F> (<t:${joinedTs}:R>)` : 'Unknown';
  const ownerStr = guild.ownerId ? `<@${guild.ownerId}> (\`${guild.ownerId}\`)` : '`Unknown`';

  const embed = new EmbedBuilder()
    .setColor(0xEF4444) // Red Danger
    .setTitle('⚠️ Confirm Server Removal')
    .setDescription(
      `Are you sure you want the bot to **leave** this server?\n\n` +
      `**Impact:**\n` +
      `• The bot will exit immediately.\n` +
      `• All slash commands, shop features, and role timers in that server will stop.\n` +
      `• You will need a new invite link to re-add the bot.`
    )
    .addFields(
      { name: '🏠 Server Name', value: `**${escapeText(guild.name)}**`, inline: true },
      { name: '🆔 Server ID', value: `\`${guild.id}\``, inline: true },
      { name: '👥 Member Count', value: `\`${(guild.memberCount || 0).toLocaleString()}\``, inline: true },
      { name: '👑 Server Owner', value: ownerStr, inline: true },
      { name: '📅 Bot Joined At', value: joinedStr, inline: false },
    )
    .setFooter({ text: 'This action cannot be undone automatically.' })
    .setTimestamp();

  if (iconUrl) {
    embed.setThumbnail(iconUrl);
  }

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`srv_do_leave_${guild.id}_${callerId}`)
      .setLabel('✅ Confirm & Leave Server')
      .setStyle(ButtonStyle.Danger),
    new ButtonBuilder()
      .setCustomId(`srv_cancel_leave_${callerId}`)
      .setLabel('❌ Cancel')
      .setStyle(ButtonStyle.Secondary)
  );

  return { embed, rows: [row] };
}

// ─── Autocomplete Handler ────────────────────────────────────────────────────
export async function autocomplete(interaction) {
  if (!ownerOnly(interaction)) {
    return interaction.respond([]).catch(() => {});
  }

  const focused = interaction.options.getFocused().trim().toLowerCase();

  try {
    const guilds = Array.from(interaction.client.guilds.cache.values());
    const filtered = guilds
      .filter(g => g.name.toLowerCase().includes(focused) || g.id.includes(focused))
      .slice(0, 25);

    const choices = filtered.map(g => ({
      name: `${g.name} (${(g.memberCount || 0).toLocaleString()} members - ${g.id})`.slice(0, 100),
      value: g.id,
    }));

    if (focused && /^\d{17,20}$/.test(focused) && !choices.some(c => c.value === focused)) {
      choices.unshift({ name: `🔍 Raw Server ID: ${focused}`, value: focused });
    }

    return interaction.respond(choices).catch(() => {});
  } catch {
    return interaction.respond([]).catch(() => {});
  }
}

// ─── Main Slash Command Executor ──────────────────────────────────────────────
export async function execute(interaction) {
  if (!ownerOnly(interaction)) {
    return interaction.reply({
      embeds: [err('Access Denied', 'This command is strictly restricted to **Bot Owners**.')],
      flags: MessageFlags.Ephemeral,
    });
  }

  const subcommand = interaction.options.getSubcommand();

  if (subcommand === 'list') {
    const page = interaction.options.getInteger('page') || 1;
    const { embed, rows } = buildServerListEmbed(interaction.client, page, interaction.user.id);
    return interaction.reply({
      embeds: [embed],
      components: rows,
      flags: MessageFlags.Ephemeral,
    });
  }

  if (subcommand === 'remove') {
    const serverInput = interaction.options.getString('server');

    // If server parameter was specified (via autocomplete or raw guild ID)
    if (serverInput) {
      const guildId = serverInput.trim();
      const targetGuild = interaction.client.guilds.cache.get(guildId);

      if (!targetGuild) {
        return interaction.reply({
          embeds: [
            err(
              'Server Not Found',
              `The bot is not currently in any server with ID \`${guildId}\`.\n\n` +
              'Use `/server list` to view all active connected servers.'
            )
          ],
          flags: MessageFlags.Ephemeral,
        });
      }

      const { embed, rows } = buildServerConfirmEmbed(targetGuild, interaction.user.id);
      return interaction.reply({
        embeds: [embed],
        components: rows,
        flags: MessageFlags.Ephemeral,
      });
    }

    // If no server was provided, show interactive dropdown select menu
    const { embed, rows } = buildServerLeaveSelectMenu(interaction.client, interaction.user.id);
    return interaction.reply({
      embeds: [embed],
      components: rows,
      flags: MessageFlags.Ephemeral,
    });
  }
}

// ─── Component Interactions Router (Buttons & Select Menus) ───────────────────
export async function component(interaction) {
  if (!ownerOnly(interaction)) {
    return interaction.reply({
      content: '❌ This action is strictly restricted to **Bot Owners**.',
      flags: MessageFlags.Ephemeral,
    });
  }

  const customId = interaction.customId;

  // 1. Pagination for /server list
  if (customId.startsWith('srv_page_')) {
    const parts = customId.split('_');
    const targetPage = parseInt(parts[2], 10);
    const callerId = parts[3];

    if (callerId && interaction.user.id !== callerId) {
      return interaction.reply({
        content: '❌ Only the bot owner who opened this list can navigate pages.',
        flags: MessageFlags.Ephemeral,
      });
    }

    if (isNaN(targetPage)) return;

    const { embed, rows } = buildServerListEmbed(interaction.client, targetPage, callerId);
    return interaction.update({ embeds: [embed], components: rows }).catch(() => {});
  }

  // 2. Open Leave Server Select Menu from list button
  if (customId.startsWith('srv_menu_open_')) {
    const callerId = customId.split('_')[3];

    if (callerId && interaction.user.id !== callerId) {
      return interaction.reply({
        content: '❌ Only the bot owner can use this button.',
        flags: MessageFlags.Ephemeral,
      });
    }

    const { embed, rows } = buildServerLeaveSelectMenu(interaction.client, callerId);
    return interaction.update({ embeds: [embed], components: rows }).catch(() => {});
  }

  // 3. Server chosen in Select Menu
  if (customId.startsWith('srv_select_leave_')) {
    const callerId = customId.split('_')[3];

    if (callerId && interaction.user.id !== callerId) {
      return interaction.reply({
        content: '❌ Only the bot owner can select a server to leave.',
        flags: MessageFlags.Ephemeral,
      });
    }

    const selectedGuildId = interaction.values?.[0];
    const targetGuild = interaction.client.guilds.cache.get(selectedGuildId);

    if (!targetGuild) {
      return interaction.update({
        embeds: [err('Server Not Found', `The bot is not currently in server ID \`${selectedGuildId}\`.`)],
        components: [],
      }).catch(() => {});
    }

    const { embed, rows } = buildServerConfirmEmbed(targetGuild, callerId);
    return interaction.update({ embeds: [embed], components: rows }).catch(() => {});
  }

  // 4. Confirm & Leave Server Button
  if (customId.startsWith('srv_do_leave_')) {
    const parts = customId.split('_');
    const targetGuildId = parts[3];
    const callerId = parts[4];

    if (callerId && interaction.user.id !== callerId) {
      return interaction.reply({
        content: '❌ Only the bot owner who initiated this removal can confirm it.',
        flags: MessageFlags.Ephemeral,
      });
    }

    const targetGuild = interaction.client.guilds.cache.get(targetGuildId);
    if (!targetGuild) {
      return interaction.update({
        embeds: [err('Server Not Found', `The bot is no longer in server ID \`${targetGuildId}\`.`)],
        components: [],
      }).catch(() => {});
    }

    const guildName = targetGuild.name;
    const memberCount = targetGuild.memberCount || 0;

    try {
      await targetGuild.leave();

      // Update database status if connected
      if (mongoose.connection?.readyState === 1) {
        await Guild.findOneAndUpdate(
          { guildId: targetGuildId },
          { status: 'left', leftAt: new Date() }
        ).catch(() => {});
      }

      const successEmbed = new EmbedBuilder()
        .setColor(0x10B981) // Emerald Green
        .setTitle('🚪 Server Left Successfully')
        .setDescription(
          `The bot has successfully departed from **${escapeText(guildName)}**.\n\n` +
          `• **Server ID**: \`${targetGuildId}\`\n` +
          `• **Members**: \`${memberCount.toLocaleString()}\`\n` +
          `• **Status**: \`Left (Inactive)\`\n\n` +
          `💡 *Tip: Agar is server ko database & web dashboard se bhi completely hatana chahte hain toh niche **🗑️ Delete from DB** button dabayein.*`
        )
        .setFooter({ text: 'Server removal complete • Bot Owner Controls' })
        .setTimestamp();

      const postLeaveRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId(`srv_purge_db_${targetGuildId}_${callerId}`)
          .setLabel('🗑️ Delete from DB & Web')
          .setStyle(ButtonStyle.Danger)
      );

      return interaction.update({ embeds: [successEmbed], components: [postLeaveRow] }).catch(() => {});
    } catch (leaveErr) {
      console.error('[SERVER:REMOVE]', leaveErr);
      return interaction.update({
        embeds: [err('Failed to Leave Server', `Discord API error: ${leaveErr.message || leaveErr}`)],
        components: [],
      }).catch(() => {});
    }
  }

  // 5. Cancel Button
  if (customId.startsWith('srv_cancel_leave_')) {
    const callerId = customId.split('_')[3];

    if (callerId && interaction.user.id !== callerId) {
      return interaction.reply({
        content: '❌ Only the bot owner can cancel this action.',
        flags: MessageFlags.Ephemeral,
      });
    }

    const cancelEmbed = ok(
      'Cancelled',
      'Server removal cancelled. The bot remains in the server.'
    );
    return interaction.update({ embeds: [cancelEmbed], components: [] }).catch(() => {});
  }

  // 6. Delete From DB & Web (Purge completely)
  if (customId.startsWith('srv_purge_db_')) {
    const parts = customId.split('_');
    const targetGuildId = parts[3];
    const callerId = parts[4];

    if (callerId && interaction.user.id !== callerId) {
      return interaction.reply({
        content: '❌ Only the bot owner who initiated this removal can delete the server from database.',
        flags: MessageFlags.Ephemeral,
      });
    }

    try {
      if (mongoose.connection?.readyState === 1) {
        // Permanently remove from Guild collection
        await Guild.deleteMany({ guildId: targetGuildId }).catch(() => {});

        // Delete all associated records
        await Promise.all([
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
          GameSettings.deleteMany({ guildId: targetGuildId }),
          MineSession.deleteMany({ guildId: targetGuildId }),
          GameHistory.deleteMany({ guildId: targetGuildId }),
        ]).catch(() => {});
      }

      const purgedEmbed = new EmbedBuilder()
        .setColor(0xEF4444)
        .setTitle('🗑️ Server Deleted From DB & Web')
        .setDescription(
          `Server ID \`${targetGuildId}\` has been **permanently deleted** from the database and web dashboard.\n\n` +
          `• **Database footprint**: \`0 records (Purged)\`\n` +
          `• **Web dashboard**: \`Removed\``
        )
        .setFooter({ text: 'Permanent deletion complete • Bot Owner Controls' })
        .setTimestamp();

      return interaction.update({ embeds: [purgedEmbed], components: [] }).catch(() => {});
    } catch (err) {
      console.error('[SERVER:PURGE_DB]', err);
      return interaction.update({
        embeds: [err('Failed to Delete from Database', err.message || err)],
        components: [],
      }).catch(() => {});
    }
  }
}
