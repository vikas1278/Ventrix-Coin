import {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  PermissionFlagsBits,
  MessageFlags,
} from 'discord.js';
import { DropboxEvent, DropboxDrop, DropboxClaim } from '../../models.js';
import {
  generateEventId,
  postDrop,
  cancelEvent,
  buildDropAnnouncement,
  handleClaimInteraction,
} from '../../services/dropbox.js';
import { parseDuration, formatDuration } from '../../utils/duration.js';
import {
  formatCoins,
  escapeText,
  C,
  err,
  ok,
  info,
  replyEmbed,
  adminOnly,
} from '../../utils/common.js';

export const data = new SlashCommandBuilder()
  .setName('dropbox')
  .setDescription('Manage automated multi-drop coin distribution events (Admin)')
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .setDMPermission(false)
  // Subcommand: setup
  .addSubcommand(sub =>
    sub
      .setName('setup')
      .setDescription('Configure a new multi-drop coin event')
      .addNumberOption(o =>
        o.setName('coins').setDescription('Coins available in each individual drop').setRequired(true).setMinValue(0.000001)
      )
      .addIntegerOption(o =>
        o.setName('total_drops').setDescription('Total number of drops in the event').setRequired(true).setMinValue(1)
      )
      .addStringOption(o =>
        o.setName('interval').setDescription('Time between drops (e.g. 1m, 1h, 1d)').setRequired(true)
      )
      .addStringOption(o =>
        o.setName('claim_duration').setDescription('Claim button duration (e.g. 1m, 30m, 1h)').setRequired(true)
      )
      .addStringOption(o =>
        o.setName('description').setDescription('Custom Dropbox announcement description').setRequired(true)
      )
      .addStringOption(o =>
        o
          .setName('channel_mode')
          .setDescription('Post in a specific channel or pick randomly')
          .setRequired(true)
          .addChoices(
            { name: 'Specific Channel', value: 'specific' },
            { name: 'Random Channel', value: 'random' }
          )
      )
      .addChannelOption(o =>
        o
          .setName('log_channel')
          .setDescription('Channel where event results and logs will be posted')
          .setRequired(true)
          .addChannelTypes(ChannelType.GuildText)
      )
      .addStringOption(o =>
        o
          .setName('start_mode')
          .setDescription('Start immediately upon confirmation or start later manually')
          .setRequired(true)
          .addChoices(
            { name: 'Immediate', value: 'immediate' },
            { name: 'Delayed (Start via /dropbox start)', value: 'delayed' }
          )
      )
      .addChannelOption(o =>
        o
          .setName('drop_channel')
          .setDescription('Required when channel mode is specific')
          .setRequired(false)
          .addChannelTypes(ChannelType.GuildText)
      )
      .addStringOption(o =>
        o
          .setName('distribution_mode')
          .setDescription('Reward mode: equal split or ranked fastest-finger-first')
          .setRequired(false)
          .addChoices(
            { name: '⚡ Ranked (Fastest get more, integer whole coins)', value: 'ranked' },
            { name: '🤝 Equal Split (Distributed equally)', value: 'equal' }
          )
      )
      .addIntegerOption(o =>
        o
          .setName('max_claimants')
          .setDescription('Max users who can claim (e.g. 10). Leave empty for unlimited.')
          .setRequired(false)
          .setMinValue(1)
      )
      .addStringOption(o =>
        o.setName('image').setDescription('Optional announcement image URL').setRequired(false)
      )
  )
  // Subcommand: start
  .addSubcommand(sub =>
    sub
      .setName('start')
      .setDescription('Start a configured or delayed event')
      .addStringOption(o =>
        o.setName('event_id').setDescription('Event ID to start').setRequired(true).setAutocomplete(true)
      )
  )
  // Subcommand: status
  .addSubcommand(sub =>
    sub
      .setName('status')
      .setDescription('Show active event progress, drops, and next drop time')
      .addStringOption(o =>
        o.setName('event_id').setDescription('Event ID (optional - defaults to active event)').setRequired(false).setAutocomplete(true)
      )
  )
  // Subcommand: list
  .addSubcommand(sub =>
    sub.setName('list').setDescription('Show recent Dropbox events with their statuses')
  )
  // Subcommand: preview
  .addSubcommand(sub =>
    sub
      .setName('preview')
      .setDescription('Preview the Dropbox announcement without distributing coins')
      .addStringOption(o =>
        o.setName('event_id').setDescription('Event ID to preview').setRequired(true).setAutocomplete(true)
      )
  )
  // Subcommand: cancel
  .addSubcommand(sub =>
    sub
      .setName('cancel')
      .setDescription('Safely cancel an event after confirmation')
      .addStringOption(o =>
        o.setName('event_id').setDescription('Event ID to cancel').setRequired(true).setAutocomplete(true)
      )
      .addStringOption(o =>
        o.setName('reason').setDescription('Reason for cancelling').setRequired(true)
      )
  )
  // Subcommand: logs
  .addSubcommand(sub =>
    sub
      .setName('logs')
      .setDescription("Show event's stored summary and payout status")
      .addStringOption(o =>
        o.setName('event_id').setDescription('Event ID to inspect').setRequired(true).setAutocomplete(true)
      )
  )
  // Subcommand: delete
  .addSubcommand(sub =>
    sub
      .setName('delete')
      .setDescription('Permanently delete a completed, cancelled or old Dropbox event from database')
      .addStringOption(o =>
        o.setName('event_id').setDescription('Event ID to delete').setRequired(true).setAutocomplete(true)
      )
  );

export async function execute(interaction) {
  if (!adminOnly(interaction)) {
    return replyEmbed(interaction, err('Access Denied', 'This command is restricted to administrators.'));
  }

  const sub = interaction.options.getSubcommand();

  switch (sub) {
    case 'setup':
      return handleSetup(interaction);
    case 'start':
      return handleStart(interaction);
    case 'status':
      return handleStatus(interaction);
    case 'list':
      return handleList(interaction);
    case 'preview':
      return handlePreview(interaction);
    case 'cancel':
      return handleCancelPrompt(interaction);
    case 'logs':
      return handleLogs(interaction);
    case 'delete':
      return handleDelete(interaction);
    default:
      return replyEmbed(interaction, err('Unknown Subcommand', `Subcommand \`${sub}\` not recognized.`));
  }
}

// ─── 1. SETUP SUBCOMMAND ──────────────────────────────────────────────────────
async function handleSetup(interaction) {
  const coins = interaction.options.getNumber('coins');
  const totalDrops = interaction.options.getInteger('total_drops');
  const intervalStr = interaction.options.getString('interval').trim();
  const claimDurationStr = interaction.options.getString('claim_duration').trim();
  const description = interaction.options.getString('description').trim();
  const channelMode = interaction.options.getString('channel_mode');
  const dropChannel = interaction.options.getChannel('drop_channel');
  const logChannel = interaction.options.getChannel('log_channel');
  const startMode = interaction.options.getString('start_mode');
  const distributionMode = interaction.options.getString('distribution_mode') || 'equal';
  const maxClaimants = interaction.options.getInteger('max_claimants') || 0;
  const imageUrl = interaction.options.getString('image')?.trim() || '';

  // 1. Validate intervals
  const intervalMs = parseDuration(intervalStr);
  if (!intervalMs || intervalMs < 10000) {
    return replyEmbed(
      interaction,
      err('Invalid Interval', 'Drop interval must be at least `10s` (e.g. `1m`, `15m`, `1h`, `1d`).')
    );
  }

  const claimDurationMs = parseDuration(claimDurationStr);
  if (!claimDurationMs || claimDurationMs < 5000) {
    return replyEmbed(
      interaction,
      err('Invalid Claim Duration', 'Claim duration must be at least `5s` (e.g. `30s`, `1m`, `30m`).')
    );
  }

  // 2. Validate channel_mode and drop_channel
  if (channelMode === 'specific' && !dropChannel) {
    return replyEmbed(
      interaction,
      err('Missing Drop Channel', 'When `channel_mode` is set to **Specific**, you must select a `drop_channel`.')
    );
  }

  // 3. Validate image URL if provided
  if (imageUrl && !/^https?:\/\/.+/i.test(imageUrl)) {
    return replyEmbed(
      interaction,
      err('Invalid Image URL', 'Please provide a valid image URL starting with `http://` or `https://`.')
    );
  }

  // 4. Validate bot permissions in target channels
  if (dropChannel) {
    const perms = dropChannel.permissionsFor(interaction.guild.members.me);
    if (!perms?.has([PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.EmbedLinks])) {
      return replyEmbed(
        interaction,
        err(
          'Missing Channel Permissions',
          `The bot lacks View, Send Messages, or Embed Links permissions in <#${dropChannel.id}>.`
        )
      );
    }
  }

  const logPerms = logChannel.permissionsFor(interaction.guild.members.me);
  if (!logPerms?.has([PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.EmbedLinks])) {
    return replyEmbed(
      interaction,
      err(
        'Missing Log Channel Permissions',
        `The bot lacks View, Send Messages, or Embed Links permissions in <#${logChannel.id}>.`
      )
    );
  }

  // 5. Prevent multiple overlapping active events in the same guild
  const existingActive = await DropboxEvent.findOne({
    guildId: interaction.guildId,
    status: 'active',
  });
  if (existingActive) {
    return replyEmbed(
      interaction,
      err(
        'Active Event Running',
        `There is already an active Dropbox Event (\`#${existingActive.eventId}\`) running in this server.\n` +
        `Please wait for it to complete or cancel it using \`/dropbox cancel event_id:${existingActive.eventId}\`.`
      )
    );
  }

  const eventId = generateEventId();
  const totalPool = Number((coins * totalDrops).toFixed(6));

  // Create event with pending_setup status
  await DropboxEvent.create({
    eventId,
    guildId: interaction.guildId,
    guildName: interaction.guild?.name || '',
    createdBy: interaction.user.id,
    coins,
    totalDrops,
    completedDrops: 0,
    intervalMs,
    intervalStr: formatDuration(intervalMs),
    claimDurationMs,
    claimDurationStr: formatDuration(claimDurationMs),
    description,
    imageUrl,
    channelMode,
    dropChannelId: dropChannel?.id || null,
    logChannelId: logChannel.id,
    startMode,
    distributionMode,
    maxClaimants,
    status: 'pending_setup',
  });

  const summaryEmbed = new EmbedBuilder()
    .setColor(C.warning)
    .setTitle(`🎁 Dropbox Setup Summary — #${eventId}`)
    .setDescription(
      `Please review the Dropbox event configuration below and click **Confirm & Create** to proceed.\n\n` +
      `**Description:**\n> ${escapeText(description)}`
    )
    .addFields(
      { name: '🪙 Coins per Drop', value: `**${formatCoins(coins)}**`, inline: true },
      { name: '📦 Total Drops', value: `**${totalDrops}** drops`, inline: true },
      { name: '💰 Total Event Pool', value: `**${formatCoins(totalPool)}**`, inline: true },
      { name: '⚡ Mode', value: distributionMode === 'ranked' ? '`RANKED (Fastest-Finger)`' : '`EQUAL SPLIT`', inline: true },
      { name: '🎯 Claim Limit', value: maxClaimants > 0 ? `\`${maxClaimants} Claimants\`` : '`Unlimited`', inline: true },
      { name: '⏱️ Drop Interval', value: `\`${formatDuration(intervalMs)}\``, inline: true },
      { name: '⏳ Claim Duration', value: `\`${formatDuration(claimDurationMs)}\``, inline: true },
      { name: '🚀 Start Mode', value: `\`${startMode.toUpperCase()}\``, inline: true },
      {
        name: '📢 Channel Mode',
        value: channelMode === 'specific' ? `<#${dropChannel.id}> (Specific)` : '🎲 Random text channel',
        inline: true,
      },
      { name: '📋 Log Channel', value: `<#${logChannel.id}>`, inline: true },
      { name: '🆔 Event ID', value: `\`${eventId}\``, inline: true }
    )
    .setFooter({ text: 'Review carefully • Click Confirm to lock in event' })
    .setTimestamp();

  if (imageUrl) {
    summaryEmbed.setThumbnail(imageUrl);
  }

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`dropbox_setup_confirm_${eventId}`)
      .setLabel('🟢 Confirm & Create')
      .setStyle(ButtonStyle.Success),
    new ButtonBuilder()
      .setCustomId(`dropbox_setup_cancel_${eventId}`)
      .setLabel('🔴 Cancel')
      .setStyle(ButtonStyle.Danger)
  );

  return interaction.reply({ embeds: [summaryEmbed], components: [row] });
}

// ─── 2. START SUBCOMMAND ──────────────────────────────────────────────────────
async function handleStart(interaction) {
  const eventId = interaction.options.getString('event_id').trim();
  const event = await DropboxEvent.findOne({ eventId, guildId: interaction.guildId });

  if (!event) {
    return replyEmbed(interaction, err('Event Not Found', `No Dropbox event found with ID \`${escapeText(eventId)}\`.`));
  }

  if (event.status === 'active') {
    return replyEmbed(interaction, err('Already Active', `Dropbox event \`#${eventId}\` is already running!`));
  }

  if (event.status === 'completed' || event.status === 'cancelled') {
    return replyEmbed(
      interaction,
      err('Cannot Start', `Dropbox event \`#${eventId}\` is already **${event.status.toUpperCase()}**.`)
    );
  }

  // Prevent another active event in guild
  const existingActive = await DropboxEvent.findOne({
    guildId: interaction.guildId,
    status: 'active',
    eventId: { $ne: eventId },
  });
  if (existingActive) {
    return replyEmbed(
      interaction,
      err(
        'Overlapping Event',
        `Cannot start event \`#${eventId}\` because event \`#${existingActive.eventId}\` is currently active in this server.`
      )
    );
  }

  event.status = 'active';
  event.startedAt = new Date();
  await event.save();

  // Fire first drop immediately
  const drop = await postDrop(interaction.client, event, event.completedDrops + 1);

  const startEmbed = new EmbedBuilder()
    .setColor(C.success)
    .setTitle(`🚀 Dropbox Event #${eventId} Started!`)
    .setDescription(
      `Drop **#${event.completedDrops + 1}** of **${event.totalDrops}** has been published!\n` +
      `• **Coins per drop:** **${formatCoins(event.coins)}**\n` +
      `• **Interval:** \`${event.intervalStr}\`\n` +
      `• **Claim window:** \`${event.claimDurationStr}\``
    )
    .setFooter({ text: 'Active Event' })
    .setTimestamp();

  return replyEmbed(interaction, startEmbed);
}

// ─── 3. STATUS SUBCOMMAND ─────────────────────────────────────────────────────
async function handleStatus(interaction) {
  const eventId = interaction.options.getString('event_id')?.trim();
  let event;

  if (eventId) {
    event = await DropboxEvent.findOne({ eventId, guildId: interaction.guildId });
  } else {
    event = await DropboxEvent.findOne({ guildId: interaction.guildId, status: 'active' });
    if (!event) {
      event = await DropboxEvent.findOne({ guildId: interaction.guildId }).sort({ createdAt: -1 });
    }
  }

  if (!event) {
    return replyEmbed(interaction, info('No Events Found', 'There are no Dropbox events recorded in this server yet.'));
  }

  const currentDrop = await DropboxDrop.findOne({ eventId: event.eventId, dropNumber: event.currentDropNumber });
  const totalPool = Number((event.coins * event.totalDrops).toFixed(6));

  const statusEmbed = new EmbedBuilder()
    .setColor(event.status === 'active' ? C.success : (event.status === 'completed' ? C.brand : C.muted))
    .setTitle(`📊 Dropbox Event Status — #${event.eventId}`)
    .setDescription(
      `**Status:** **${event.status.toUpperCase()}**\n` +
      `**Description:** ${escapeText(event.description)}`
    )
    .addFields(
      { name: '🪙 Pool per Drop', value: `**${formatCoins(event.coins)}**`, inline: true },
      { name: '📦 Progress', value: `**${event.completedDrops} / ${event.totalDrops}** drops completed`, inline: true },
      { name: '💰 Total Pool', value: `**${formatCoins(totalPool)}**`, inline: true },
      { name: '⚡ Mode', value: event.distributionMode === 'ranked' ? '`RANKED (Fastest-Finger)`' : '`EQUAL SPLIT`', inline: true },
      { name: '🎯 Claim Limit', value: event.maxClaimants > 0 ? `\`${event.maxClaimants} Claimants\`` : '`Unlimited`', inline: true },
      { name: '⏱️ Interval', value: `\`${event.intervalStr}\``, inline: true },
      { name: '⏳ Claim Duration', value: `\`${event.claimDurationStr}\``, inline: true },
      {
        name: '📢 Channel Mode',
        value: event.channelMode === 'specific' ? `<#${event.dropChannelId}>` : '🎲 Random',
        inline: true,
      },
      { name: '📋 Log Channel', value: `<#${event.logChannelId}>`, inline: true },
      {
        name: '⏰ Next Drop Time',
        value: event.status === 'active' && event.nextDropAt
          ? `<t:${Math.floor(new Date(event.nextDropAt).getTime() / 1000)}:R> (<t:${Math.floor(new Date(event.nextDropAt).getTime() / 1000)}:t>)`
          : (event.status === 'active' ? '*Processing Current Drop*' : '`None`'),
        inline: true,
      }
    )
    .setFooter({ text: `Created by <@${event.createdBy}>` })
    .setTimestamp();

  if (currentDrop && currentDrop.status === 'open') {
    statusEmbed.addFields({
      name: `🟢 Active Drop #${currentDrop.dropNumber}`,
      value:
        `• Claimants so far: **${currentDrop.claimantCount}**\n` +
        `• Closes: <t:${Math.floor(new Date(currentDrop.claimDeadline).getTime() / 1000)}:R>`,
      inline: false,
    });
  }

  return replyEmbed(interaction, statusEmbed);
}

// ─── 4. LIST SUBCOMMAND ───────────────────────────────────────────────────────
async function handleList(interaction) {
  const events = await DropboxEvent.find({ guildId: interaction.guildId }).sort({ createdAt: -1 }).limit(10).lean();

  if (!events.length) {
    return replyEmbed(interaction, info('No Events', 'No Dropbox events have been created in this server yet.'));
  }

  const statusIcons = {
    active: '🟢',
    completed: '✅',
    cancelled: '❌',
    ready: '⏳',
    pending_setup: '🟡',
  };

  const fields = events.map(e => {
    const icon = statusIcons[e.status] || '⚪';
    const dateStr = `<t:${Math.floor(new Date(e.createdAt).getTime() / 1000)}:d>`;
    return {
      name: `${icon} Event \`#${e.eventId}\` • **${e.status.toUpperCase()}**`,
      value:
        `• Drops: **${e.completedDrops}/${e.totalDrops}** • **${formatCoins(e.coins)}** per drop\n` +
        `• Interval: \`${e.intervalStr}\` • Created: ${dateStr}`,
      inline: false,
    };
  });

  const embed = new EmbedBuilder()
    .setColor(C.brand)
    .setTitle('📋 Recent Dropbox Events')
    .setDescription('Here are the most recent Dropbox events configured in this server.')
    .addFields(fields)
    .setFooter({ text: 'Use /dropbox status event_id:<id> for details' })
    .setTimestamp();

  return replyEmbed(interaction, embed);
}

// ─── 5. PREVIEW SUBCOMMAND ────────────────────────────────────────────────────
async function handlePreview(interaction) {
  const eventId = interaction.options.getString('event_id').trim();
  const event = await DropboxEvent.findOne({ eventId, guildId: interaction.guildId });

  if (!event) {
    return replyEmbed(interaction, err('Event Not Found', `No event found with ID \`${escapeText(eventId)}\`.`));
  }

  const mockDrop = {
    dropNumber: 1,
    coins: event.coins,
    claimDeadline: new Date(Date.now() + event.claimDurationMs),
    status: 'open',
    postedAt: new Date(),
  };

  const { embed, row } = buildDropAnnouncement({ event, drop: mockDrop });

  // Disable button in preview
  const previewRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('preview_claim_btn')
      .setLabel('🟢 Claim Coins (Preview Only)')
      .setStyle(ButtonStyle.Success)
      .setDisabled(true)
  );

  return interaction.reply({
    content: `🔍 **Preview of Dropbox Announcement for Event #${eventId}:** *(No coins will be distributed from this preview)*`,
    embeds: [embed],
    components: [previewRow],
    flags: MessageFlags.Ephemeral,
  });
}

// ─── 6. CANCEL SUBCOMMAND (Interactive Confirmation) ──────────────────────────
async function handleCancelPrompt(interaction) {
  const eventId = interaction.options.getString('event_id').trim();
  const reason = interaction.options.getString('reason').trim();
  const event = await DropboxEvent.findOne({ eventId, guildId: interaction.guildId });

  if (!event) {
    return replyEmbed(interaction, err('Event Not Found', `No event found with ID \`${escapeText(eventId)}\`.`));
  }

  if (event.status === 'completed' || event.status === 'cancelled') {
    return replyEmbed(
      interaction,
      err('Already Finalized', `Event \`#${eventId}\` is already **${event.status.toUpperCase()}** and cannot be cancelled.`)
    );
  }

  const promptEmbed = new EmbedBuilder()
    .setColor(C.danger)
    .setTitle(`🛑 Confirm Event Cancellation — #${eventId}`)
    .setDescription(
      `Are you sure you want to cancel Dropbox Event **#${eventId}**?\n\n` +
      `• **Status:** \`${event.status.toUpperCase()}\`\n` +
      `• **Completed Drops:** ${event.completedDrops}/${event.totalDrops}\n` +
      `• **Cancellation Reason:** *${escapeText(reason)}*\n\n` +
      `⚠️ *This will immediately disable any active drops and stop the schedule.*`
    )
    .setFooter({ text: 'Confirm action' })
    .setTimestamp();

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`dropbox_cancel_confirm_${eventId}`)
      .setLabel('🛑 Confirm Cancel')
      .setStyle(ButtonStyle.Danger),
    new ButtonBuilder()
      .setCustomId(`dropbox_cancel_abort_${eventId}`)
      .setLabel('Dismiss')
      .setStyle(ButtonStyle.Secondary)
  );

  // Stash reason on event doc temporarily
  event.cancelReason = reason;
  await event.save();

  return interaction.reply({ embeds: [promptEmbed], components: [row] });
}

// ─── 7. LOGS SUBCOMMAND ───────────────────────────────────────────────────────
async function handleLogs(interaction) {
  const eventId = interaction.options.getString('event_id').trim();
  const event = await DropboxEvent.findOne({ eventId, guildId: interaction.guildId });

  if (!event) {
    return replyEmbed(interaction, err('Event Not Found', `No event found with ID \`${escapeText(eventId)}\`.`));
  }

  const drops = await DropboxDrop.find({ eventId }).sort({ dropNumber: 1 }).lean();
  const totalClaims = await DropboxClaim.countDocuments({ eventId });

  const dropFields = drops.map(d => {
    return {
      name: `📦 Drop #${d.dropNumber} • [${d.status.toUpperCase()}]`,
      value:
        `• Pool: **${formatCoins(d.coins)}** • Distributed: **${formatCoins(d.distributedCoins)}**\n` +
        `• Claimants: **${d.claimantCount}** • Per User: **${formatCoins(d.perUserCoins)}**\n` +
        (d.remainderCoins > 0 ? `• Remainder: **${formatCoins(d.remainderCoins)}**\n` : '') +
        `• Channel: <#${d.channelId}>`,
      inline: false,
    };
  });

  const totalDistributed = drops.reduce((sum, d) => sum + (d.distributedCoins || 0), 0);

  const logsEmbed = new EmbedBuilder()
    .setColor(C.brand)
    .setTitle(`📑 Event Logs & Summary — #${event.eventId}`)
    .setDescription(
      `**Status:** **${event.status.toUpperCase()}**\n` +
      `**Total Drops:** ${event.completedDrops}/${event.totalDrops}\n` +
      `**Total Claim Registrations:** **${totalClaims}**\n` +
      `**Total Coins Distributed:** **${formatCoins(totalDistributed)}**`
    )
    .setFooter({ text: `Configured by <@${event.createdBy}>` })
    .setTimestamp();

  if (dropFields.length > 0) {
    logsEmbed.addFields(dropFields.slice(0, 20));
  } else {
    logsEmbed.addFields({ name: 'Drops', value: 'No drops have been recorded yet.' });
  }

  return replyEmbed(interaction, logsEmbed);
}

// ─── COMPONENT ROUTER FOR BUTTONS ─────────────────────────────────────────────
export async function component(interaction) {
  const id = interaction.customId;

  // 1. Claim button interaction
  if (id.startsWith('dropbox_claim_')) {
    return handleClaimInteraction(interaction);
  }

  if (!adminOnly(interaction)) {
    return interaction.reply({
      content: '❌ Only administrators can interact with Dropbox setup controls.',
      flags: MessageFlags.Ephemeral,
    });
  }

  // 2. Setup Confirm
  if (id.startsWith('dropbox_setup_confirm_')) {
    const eventId = id.replace('dropbox_setup_confirm_', '');
    const event = await DropboxEvent.findOne({ eventId, guildId: interaction.guildId });

    if (!event || event.status !== 'pending_setup') {
      return interaction.reply({
        content: '⚠️ This setup has already been handled or does not exist.',
        flags: MessageFlags.Ephemeral,
      });
    }

    if (event.startMode === 'immediate') {
      event.status = 'active';
      event.startedAt = new Date();
      await event.save();

      const drop = await postDrop(interaction.client, event, 1);
      const confirmEmbed = new EmbedBuilder()
        .setColor(C.success)
        .setTitle(`✅ Dropbox Event #${eventId} Confirmed & Started!`)
        .setDescription(
          `Event has been launched!\n` +
          `• Drop **#1** has been published to ${event.channelMode === 'specific' ? `<#${event.dropChannelId}>` : 'a random text channel'}.\n` +
          `• Remaining drops: **${event.totalDrops - 1}**\n` +
          `• Next drop: <t:${Math.floor(new Date(event.nextDropAt).getTime() / 1000)}:R>`
        )
        .setTimestamp();

      return interaction.update({ embeds: [confirmEmbed], components: [] });
    } else {
      event.status = 'ready';
      await event.save();

      const readyEmbed = new EmbedBuilder()
        .setColor(C.success)
        .setTitle(`✅ Dropbox Event #${eventId} Created & Ready!`)
        .setDescription(
          `Event is saved and waiting to be launched.\n` +
          `When you are ready, run: **\`/dropbox start event_id:${eventId}\`**`
        )
        .setTimestamp();

      return interaction.update({ embeds: [readyEmbed], components: [] });
    }
  }

  // 3. Setup Cancel
  if (id.startsWith('dropbox_setup_cancel_')) {
    const eventId = id.replace('dropbox_setup_cancel_', '');
    await DropboxEvent.deleteOne({ eventId, status: 'pending_setup' });

    return interaction.update({
      content: `❌ Dropbox setup for event **#${eventId}** was cancelled.`,
      embeds: [],
      components: [],
    });
  }

  // 4. Cancel Confirm
  if (id.startsWith('dropbox_cancel_confirm_')) {
    const eventId = id.replace('dropbox_cancel_confirm_', '');
    const event = await DropboxEvent.findOne({ eventId, guildId: interaction.guildId });

    if (!event) {
      return interaction.reply({ content: 'Event not found.', flags: MessageFlags.Ephemeral });
    }

    await cancelEvent(interaction.client, eventId, event.cancelReason || 'Cancelled by admin', interaction.user.id);

    return interaction.update({
      content: `🛑 **Dropbox Event #${eventId} has been successfully cancelled.**`,
      embeds: [],
      components: [],
    });
  }

  // 5. Cancel Abort
  if (id.startsWith('dropbox_cancel_abort_')) {
    return interaction.update({
      content: '⚪ Cancellation request dismissed.',
      embeds: [],
      components: [],
    });
  }
}

// ─── 8. DELETE SUBCOMMAND ─────────────────────────────────────────────────────
async function handleDelete(interaction) {
  const eventId = interaction.options.getString('event_id').trim();
  const guildId = interaction.guildId;

  if (eventId.toLowerCase() === 'all_ended' || eventId.toLowerCase() === 'clear_ended') {
    const endedEvents = await DropboxEvent.find({
      guildId,
      status: { $in: ['completed', 'cancelled'] },
    }).select('eventId').lean();

    if (endedEvents.length === 0) {
      return replyEmbed(
        interaction,
        info('No Ended Dropboxes', 'There are no completed or cancelled Dropbox events to clear in this server.')
      );
    }

    const eventIds = endedEvents.map(e => e.eventId);
    await DropboxEvent.deleteMany({ guildId, eventId: { $in: eventIds } });
    await DropboxDrop.deleteMany({ eventId: { $in: eventIds } });
    await DropboxClaim.deleteMany({ eventId: { $in: eventIds } });

    return replyEmbed(
      interaction,
      ok(
        '🧹 Ended Dropboxes Cleared',
        `Successfully deleted **${eventIds.length}** ended/cancelled Dropbox event(s) and all their associated records from the database.`
      )
    );
  }

  const event = await DropboxEvent.findOne({ eventId, guildId });
  if (!event) {
    return replyEmbed(
      interaction,
      err('Event Not Found', `No Dropbox event found with ID \`${eventId}\` in this server.`)
    );
  }

  // Cancel any active timers if event is still active/ready
  if (event.status === 'active' || event.status === 'ready') {
    await cancelEvent(interaction.client, eventId, 'Event deleted by admin', interaction.user.id).catch(() => {});
  }

  // Permanently delete event and all related drop messages and claim records
  await DropboxEvent.deleteOne({ eventId, guildId });
  await DropboxDrop.deleteMany({ eventId });
  await DropboxClaim.deleteMany({ eventId });

  return replyEmbed(
    interaction,
    ok(
      'Dropbox Event Deleted',
      `Dropbox event \`${eventId}\` and its drop records have been permanently deleted from the database.`
    )
  );
}

// ─── AUTOCOMPLETE ROUTER ──────────────────────────────────────────────────────
export async function autocomplete(interaction) {
  try {
    const sub = interaction.options.getSubcommand(false);
    const focusedValue = interaction.options.getFocused().trim();
    const filter = { guildId: interaction.guildId };

    if (focusedValue && focusedValue.toLowerCase() !== 'all_ended') {
      filter.eventId = { $regex: new RegExp(focusedValue, 'i') };
    }

    const events = await DropboxEvent.find(filter).sort({ createdAt: -1 }).limit(15).lean();

    const choices = events.map(e => ({
      name: `#${e.eventId} • [${e.status.toUpperCase()}] • ${e.completedDrops}/${e.totalDrops} drops (${formatCoins(e.coins)}/drop)`,
      value: e.eventId,
    }));

    if (sub === 'delete' && (!focusedValue || 'all ended clear'.includes(focusedValue.toLowerCase()))) {
      choices.unshift({
        name: '🧹 Clear ALL Ended & Cancelled Dropboxes',
        value: 'all_ended',
      });
    }

    return interaction.respond(choices.slice(0, 25)).catch(() => {});
  } catch {
    return interaction.respond([]).catch(() => {});
  }
}
