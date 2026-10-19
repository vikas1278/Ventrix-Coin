import crypto from 'node:crypto';
import {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  MessageFlags,
  ChannelType,
  PermissionFlagsBits,
} from 'discord.js';
import { DropboxEvent, DropboxDrop, DropboxClaim, Wallet, Ledger } from '../models.js';
import { formatCoins, coinIcon, coinTitleIcon, C, escapeText } from '../utils/common.js';
import { formatDuration } from '../utils/duration.js';

let isSchedulerRunning = false;

export function generateEventId() {
  return `DBX-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(2).toString('hex').toUpperCase()}`;
}

/**
 * Builds the announcement embed according to Section 3 of specifications:
 * 1. Bold title: **🎁 Dropbox #X**
 * 2. The configured description
 * 3. The optional image
 * 4. Total available coins with existing coin emoji
 * 5. Claim duration and current status
 * 6. Green Claim Coins button
 */
export function buildDropAnnouncement({ event, drop, isExpired = false, isCancelled = false }) {
  const isFinished = isExpired || drop.status === 'completed' || drop.status === 'unclaimed';
  const isCanceled = isCancelled || drop.status === 'cancelled';

  let color = C.success;
  let statusText = `🟢 **Claiming Open** • Closes <t:${Math.floor(new Date(drop.claimDeadline).getTime() / 1000)}:R>`;

  if (isCanceled) {
    color = C.muted;
    statusText = '❌ **Cancelled by Administrator**';
  } else if (drop.status === 'unclaimed') {
    color = C.danger;
    statusText = '🔴 **Claim Window Closed** • Ended with 0 claims (Unclaimed)';
  } else if (drop.status === 'completed') {
    color = C.brand;
    statusText = `✅ **Claim Window Closed** • Distributed **${formatCoins(drop.distributedCoins)}** to **${drop.claimantCount}** claimant(s)!`;
  } else if (isExpired || drop.status === 'processing') {
    color = C.warning;
    statusText = '⏳ **Claim Window Closed** • Calculating & distributing equal shares...';
  }

  const embed = new EmbedBuilder()
    .setColor(color)
    .setTitle(`🎁 Dropbox #${drop.dropNumber}`)
    .setDescription(
      `${event.description}\n\n` +
      `🪙 **Available Pool:** **${formatCoins(drop.coins)}**\n` +
      `⏱️ **Claim Duration:** \`${event.claimDurationStr}\`\n` +
      `📊 **Status:** ${statusText}`
    )
    .setFooter({ text: `Event #${event.eventId} • Drop ${drop.dropNumber} of ${event.totalDrops} • Gravity Shop` })
    .setTimestamp(drop.postedAt || new Date());

  if (event.imageUrl && /^https?:\/\/.+/i.test(event.imageUrl)) {
    embed.setImage(event.imageUrl);
  }

  // Row with Claim Button
  let button;
  if (!isFinished && !isCanceled && !isExpired && drop.status === 'open') {
    button = new ButtonBuilder()
      .setCustomId(`dropbox_claim_${event.eventId}_${drop.dropNumber}`)
      .setLabel('🟢 Claim Coins')
      .setStyle(ButtonStyle.Success);
  } else if (isCanceled) {
    button = new ButtonBuilder()
      .setCustomId('dropbox_claim_cancelled')
      .setLabel('❌ Event Cancelled')
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(true);
  } else {
    button = new ButtonBuilder()
      .setCustomId('dropbox_claim_expired')
      .setLabel('🔴 Claim Closed')
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(true);
  }

  const row = new ActionRowBuilder().addComponents(button);
  return { embed, row };
}

/**
 * Posts a drop announcement to the target channel.
 */
export async function postDrop(client, event, dropNumber) {
  const guild = await client.guilds.fetch(event.guildId).catch(() => null);
  if (!guild) {
    console.error(`[DROPBOX] Guild ${event.guildId} not found.`);
    return null;
  }

  let targetChannel = null;
  if (event.channelMode === 'specific') {
    targetChannel = await guild.channels.fetch(event.dropChannelId).catch(() => null);
  } else {
    // Random channel mode: pick a random text channel with view and send permissions
    const channels = await guild.channels.fetch().catch(() => null);
    if (channels) {
      const candidates = channels.filter(
        c =>
          c &&
          c.type === ChannelType.GuildText &&
          c.permissionsFor(guild.members.me)?.has([PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages])
      );
      if (candidates.size > 0) {
        targetChannel = candidates.random();
      }
    }
    if (!targetChannel && event.dropChannelId) {
      targetChannel = await guild.channels.fetch(event.dropChannelId).catch(() => null);
    }
  }

  if (!targetChannel) {
    console.error(`[DROPBOX] No writable target channel found for event ${event.eventId} drop #${dropNumber}.`);
    return null;
  }

  const claimDeadline = new Date(Date.now() + event.claimDurationMs);
  const dropId = `${event.eventId}-${dropNumber}`;

  let drop = await DropboxDrop.findOne({ dropId });
  if (!drop) {
    drop = await DropboxDrop.create({
      dropId,
      eventId: event.eventId,
      guildId: event.guildId,
      dropNumber,
      channelId: targetChannel.id,
      coins: event.coins,
      claimDeadline,
      status: 'open',
      postedAt: new Date(),
    });
  } else {
    drop.claimDeadline = claimDeadline;
    drop.status = 'open';
    drop.postedAt = new Date();
    await drop.save();
  }

  const { embed, row } = buildDropAnnouncement({ event, drop });
  const message = await targetChannel.send({ embeds: [embed], components: [row] }).catch(err => {
    console.error(`[DROPBOX] Failed to send drop message to channel ${targetChannel.id}:`, err);
    return null;
  });

  if (message) {
    drop.messageId = message.id;
    await drop.save();
  }

  event.currentDropNumber = dropNumber;
  if (dropNumber < event.totalDrops) {
    event.nextDropAt = new Date(Date.now() + event.intervalMs);
  } else {
    event.nextDropAt = null;
  }
  await event.save();

  return drop;
}

/**
 * Handles a user clicking the 🟢 Claim Coins button.
 */
export async function handleClaimInteraction(interaction) {
  if (!interaction.isButton() || !interaction.customId.startsWith('dropbox_claim_')) return false;

  const parts = interaction.customId.split('_');
  if (parts.length < 4) return false;

  const eventId = parts[2];
  const dropNumber = parseInt(parts[3], 10);

  const drop = await DropboxDrop.findOne({ eventId, dropNumber });
  if (!drop || drop.status !== 'open') {
    return interaction.reply({
      content: '❌ This drop is no longer open for claims.',
      flags: MessageFlags.Ephemeral,
    });
  }

  if (new Date() >= drop.claimDeadline) {
    return interaction.reply({
      content: '⌛ The claim window for this drop has ended.',
      flags: MessageFlags.Ephemeral,
    });
  }

  // Idempotently create claim registration
  try {
    await DropboxClaim.create({
      eventId,
      dropNumber,
      guildId: interaction.guildId || 'DM',
      userId: interaction.user.id,
      claimedAt: new Date(),
    });
  } catch (err) {
    if (err.code === 11000) {
      const alreadyClaimedRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('already_claimed_btn')
          .setLabel(`✅ Already Claimed (Dropbox #${dropNumber})`)
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(true)
      );

      return interaction.reply({
        content: `⚠️ You have already claimed **Dropbox #${dropNumber}**!\nYour entry is securely registered. Coins will be divided equally once the timer ends.`,
        components: [alreadyClaimedRow],
        flags: MessageFlags.Ephemeral,
      });
    }
    throw err;
  }

  await DropboxDrop.updateOne({ eventId, dropNumber }, { $inc: { claimantCount: 1 } });
  const updatedCount = drop.claimantCount + 1;

  const claimedSuccessRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('claimed_success_btn')
      .setLabel(`✅ Claimed (Dropbox #${dropNumber})`)
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(true)
  );

  return interaction.reply({
    content:
      `🎉 **Claim Registered!**\n` +
      `You are claimant **#${updatedCount}** for **Dropbox #${dropNumber}**.\n` +
      `The total pool of **${formatCoins(drop.coins)}** will be split equally among all claimants when the claim window closes!`,
    components: [claimedSuccessRow],
    flags: MessageFlags.Ephemeral,
  });
}

/**
 * Finalizes an expired drop: calculates equal distribution, credits wallets,
 * logs results, and updates message in Discord.
 */
export async function finalizeDrop(client, drop) {
  // Concurrency guard: transition from 'open' -> 'processing'
  const locked = await DropboxDrop.findOneAndUpdate(
    { dropId: drop.dropId, status: 'open' },
    { $set: { status: 'processing' } },
    { new: true }
  );

  if (!locked) return; // Already processed or processing by another worker

  const event = await DropboxEvent.findOne({ eventId: drop.eventId });
  if (!event) {
    locked.status = 'cancelled';
    await locked.save();
    return;
  }

  const claims = await DropboxClaim.find({ eventId: drop.eventId, dropNumber: drop.dropNumber });
  const guild = await client.guilds.fetch(event.guildId).catch(() => null);

  // If nobody claimed the drop
  if (claims.length === 0) {
    locked.status = 'unclaimed';
    locked.claimantCount = 0;
    locked.distributedCoins = 0;
    locked.perUserCoins = 0;
    locked.remainderCoins = drop.coins;
    locked.processedAt = new Date();
    await locked.save();

    event.completedDrops += 1;
    if (event.completedDrops >= event.totalDrops) {
      event.status = 'completed';
      event.completedAt = new Date();
    }
    await event.save();

    // Update announcement message in channel & post result in same drop channel
    if (guild && locked.channelId) {
      const channel = await guild.channels.fetch(locked.channelId).catch(() => null);
      if (channel) {
        if (locked.messageId) {
          const message = await channel.messages.fetch(locked.messageId).catch(() => null);
          if (message) {
            const { embed, row } = buildDropAnnouncement({ event, drop: locked });
            await message.edit({ embeds: [embed], components: [row] }).catch(() => {});
          }
        }

        const channelUnclaimedEmbed = new EmbedBuilder()
          .setColor(C.danger)
          .setTitle(`⌛ Dropbox #${locked.dropNumber} Ended — Unclaimed`)
          .setDescription(
            `The claim window for **Dropbox #${locked.dropNumber}** has expired.\n` +
            `• **Pool:** **${formatCoins(locked.coins)}**\n` +
            `• **Claimants:** **0** (No one claimed this drop).\n` +
            `• **Status:** ⚠️ Unclaimed`
          )
          .setFooter({ text: `Event #${event.eventId} • Drop ${locked.dropNumber}/${event.totalDrops}` })
          .setTimestamp();

        await channel.send({ embeds: [channelUnclaimedEmbed] }).catch(() => {});
      }
    }

    // Send log to logChannel if different from drop channel
    if (guild && event.logChannelId && event.logChannelId !== locked.channelId) {
      const logChannel = await guild.channels.fetch(event.logChannelId).catch(() => null);
      if (logChannel) {
        const logEmbed = new EmbedBuilder()
          .setColor(C.danger)
          .setTitle(`📋 Dropbox #${locked.dropNumber} Results — Event #${event.eventId}`)
          .setDescription(
            `**Status:** ⚠️ **Unclaimed**\n` +
            `• **Available Pool:** **${formatCoins(locked.coins)}**\n` +
            `• **Claimants:** **0**\n` +
            `• **Coins Distributed:** **0**\n` +
            `• **Undistributed Remainder:** **${formatCoins(locked.coins)}**\n\n` +
            `*No users claimed this drop before the claim window expired.*`
          )
          .setFooter({ text: `Event #${event.eventId} • Drop ${locked.dropNumber}/${event.totalDrops}` })
          .setTimestamp();

        await logChannel.send({ embeds: [logEmbed] }).catch(() => {});
      }
    }

    return;
  }

  // Claimants exist: perform equal distribution with 6-decimal precision
  const N = claims.length;
  const rawShare = drop.coins / N;
  const perUserCoins = Math.floor(rawShare * 1e6) / 1e6;
  const totalDistributed = Number((perUserCoins * N).toFixed(6));
  const remainder = Number((drop.coins - totalDistributed).toFixed(6));

  const guildId = event.guildId || 'DM';

  for (const claim of claims) {
    if (claim.paid) continue;

    // Idempotent Wallet increment
    await Wallet.findOneAndUpdate(
      { guildId, userId: claim.userId },
      {
        $inc: { balance: perUserCoins },
        $set: { ...(event.guildName ? { guildName: event.guildName } : {}) },
        $setOnInsert: { guildId, userId: claim.userId },
      },
      { upsert: true, new: true }
    );

    // Ledger record
    const rrn = `DROP-${event.eventId}-${drop.dropNumber}-${claim.userId}`;
    await Ledger.findOneAndUpdate(
      { rrn },
      {
        $setOnInsert: {
          guildId,
          guildName: event.guildName || '',
          userId: claim.userId,
          orderId: event.eventId,
          rrn,
          coins: perUserCoins,
          type: 'DROPBOX_REWARD',
          reason: `Coin Dropbox #${drop.dropNumber}`,
          performedBy: 'dropbox',
        }
      },
      { upsert: true }
    ).catch(() => {});

    claim.rewardCoins = perUserCoins;
    claim.paid = true;
    await claim.save();
  }

  locked.status = 'completed';
  locked.claimantCount = N;
  locked.distributedCoins = totalDistributed;
  locked.perUserCoins = perUserCoins;
  locked.remainderCoins = remainder;
  locked.processedAt = new Date();
  await locked.save();

  event.completedDrops += 1;
  if (event.completedDrops >= event.totalDrops) {
    event.status = 'completed';
    event.completedAt = new Date();
  }
  await event.save();

  // Update announcement message in channel & post results in same drop channel
  if (guild && locked.channelId) {
    const channel = await guild.channels.fetch(locked.channelId).catch(() => null);
    if (channel) {
      if (locked.messageId) {
        const message = await channel.messages.fetch(locked.messageId).catch(() => null);
        if (message) {
          const { embed, row } = buildDropAnnouncement({ event, drop: locked });
          await message.edit({ embeds: [embed], components: [row] }).catch(() => {});
        }
      }

      const winnerMentions = claims.slice(0, 30).map(c => `<@${c.userId}> (+${formatCoins(perUserCoins)})`).join(', ');
      const extraCount = claims.length > 30 ? ` *...and ${claims.length - 30} more*` : '';

      const channelResultEmbed = new EmbedBuilder()
        .setColor(C.success)
        .setTitle(`🎉 Dropbox #${locked.dropNumber} Results & Winners!`)
        .setDescription(
          `**Drop #${locked.dropNumber} has ended! Coins have been distributed equally:**\n\n` +
          `• 🪙 **Total Distributed:** **${formatCoins(totalDistributed)}**\n` +
          `• 👥 **Claimants:** **${N}** member(s)\n` +
          `• 💰 **Each Received:** **+${formatCoins(perUserCoins)}**\n` +
          (remainder > 0 ? `• 🏷️ **Remainder:** ${formatCoins(remainder)}\n\n` : '\n') +
          `**Claimants:**\n${winnerMentions}${extraCount}`
        )
        .setFooter({ text: `Event #${event.eventId} • Drop ${locked.dropNumber}/${event.totalDrops} • Gravity Shop` })
        .setTimestamp();

      await channel.send({ embeds: [channelResultEmbed] }).catch(() => {});
    }
  }

  // Send rich log to logChannel with participant breakdown and pagination if different from drop channel
  if (guild && event.logChannelId && event.logChannelId !== locked.channelId) {
    const logChannel = await guild.channels.fetch(event.logChannelId).catch(() => null);
    if (logChannel) {
      const claimantLines = claims.map(c => `• <@${c.userId}> (\`${c.userId}\`) ➔ **+${formatCoins(perUserCoins)}**`);

      // Chunk claimants into blocks of 25 to respect Discord embed limits
      const chunkSize = 25;
      const chunks = [];
      for (let i = 0; i < claimantLines.length; i += chunkSize) {
        chunks.push(claimantLines.slice(i, i + chunkSize));
      }

      for (let i = 0; i < chunks.length; i++) {
        const isFirst = i === 0;
        const pageTitle = chunks.length > 1 ? ` (Part ${i + 1}/${chunks.length})` : '';

        const logEmbed = new EmbedBuilder()
          .setColor(C.success)
          .setTitle(`📋 Dropbox #${locked.dropNumber} Results — Event #${event.eventId}${pageTitle}`)
          .setTimestamp();

        if (isFirst) {
          logEmbed.setDescription(
            `**Status:** ✅ **Completed & Distributed**\n` +
            `• **Total Available:** **${formatCoins(locked.coins)}**\n` +
            `• **Total Distributed:** **${formatCoins(totalDistributed)}**\n` +
            `• **Number of Claimants:** **${N}**\n` +
            `• **Reward per Claimant:** **${formatCoins(perUserCoins)}**\n` +
            `• **Undistributed Remainder:** **${formatCoins(remainder)}**\n\n` +
            `**Claimants Payout List:**\n` +
            chunks[i].join('\n')
          );
        } else {
          logEmbed.setDescription(
            `**Claimants Payout List (Continued):**\n` +
            chunks[i].join('\n')
          );
        }

        logEmbed.setFooter({ text: `Event #${event.eventId} • Drop ${locked.dropNumber}/${event.totalDrops}` });
        await logChannel.send({ embeds: [logEmbed] }).catch(() => {});
      }

      if (event.status === 'completed') {
        const eventFinishedEmbed = new EmbedBuilder()
          .setColor(C.brand)
          .setTitle(`🎉 Event #${event.eventId} Finished!`)
          .setDescription(
            `All **${event.totalDrops}** drops have been successfully completed.\n` +
            `Total pool of **${formatCoins(event.coins * event.totalDrops)}** has been processed.`
          )
          .setFooter({ text: 'Dropbox System • Event Lifecycle Complete' })
          .setTimestamp();

        await logChannel.send({ embeds: [eventFinishedEmbed] }).catch(() => {});
      }
    }
  }
}

/**
 * Background Scheduler and Recovery Loop:
 * 1. Checks open drops whose claim window has ended and finalizes them.
 * 2. Checks active events whose next drop time has arrived and posts the next drop.
 * 3. Handles server crash/Render restart recovery seamlessly.
 */
export async function processPendingDropboxTasks(client) {
  if (isSchedulerRunning) return;
  isSchedulerRunning = true;

  try {
    const now = new Date();

    // 1. Finalize expired open drops
    const expiredDrops = await DropboxDrop.find({
      status: 'open',
      claimDeadline: { $lte: now },
    }).limit(10);

    for (const drop of expiredDrops) {
      await finalizeDrop(client, drop).catch(err => {
        console.error(`[DROPBOX] Error finalizing drop ${drop.dropId}:`, err);
      });
    }

    // 2. Process active events ready for the next drop
    const activeEvents = await DropboxEvent.find({
      status: 'active',
    });

    for (const event of activeEvents) {
      // Check if there is an open or processing drop currently running for this event
      const currentActiveDrop = await DropboxDrop.findOne({
        eventId: event.eventId,
        status: { $in: ['open', 'processing'] },
      });

      if (currentActiveDrop) {
        continue; // Wait for current drop claim window to conclude
      }

      if (event.completedDrops >= event.totalDrops) {
        event.status = 'completed';
        event.completedAt = new Date();
        await event.save();
        continue;
      }

      // Check if next drop is due
      if (!event.nextDropAt || event.nextDropAt <= now) {
        const nextDropNum = event.completedDrops + 1;
        await postDrop(client, event, nextDropNum).catch(err => {
          console.error(`[DROPBOX] Error posting drop ${nextDropNum} for event ${event.eventId}:`, err);
        });
      }
    }
  } catch (error) {
    console.error('[DROPBOX SCHEDULER ITERATION ERROR]', error);
  } finally {
    isSchedulerRunning = false;
  }
}

/**
 * Cancels an event safely:
 * - Marks event cancelled
 * - Closes any open drop and updates announcement message
 * - Logs to logChannel
 */
export async function cancelEvent(client, eventId, reason, cancelledBy) {
  const event = await DropboxEvent.findOne({ eventId });
  if (!event) return null;

  event.status = 'cancelled';
  event.cancelReason = reason;
  event.cancelledBy = cancelledBy;
  await event.save();

  // Cancel any open drops
  const openDrops = await DropboxDrop.find({ eventId, status: { $in: ['scheduled', 'open'] } });
  for (const drop of openDrops) {
    drop.status = 'cancelled';
    await drop.save();

    const guild = await client.guilds.fetch(event.guildId).catch(() => null);
    if (guild && drop.channelId && drop.messageId) {
      const channel = await guild.channels.fetch(drop.channelId).catch(() => null);
      if (channel) {
        const msg = await channel.messages.fetch(drop.messageId).catch(() => null);
        if (msg) {
          const { embed, row } = buildDropAnnouncement({ event, drop, isCancelled: true });
          await msg.edit({ embeds: [embed], components: [row] }).catch(() => {});
        }
      }
    }
  }

  // Send cancellation log
  const guild = await client.guilds.fetch(event.guildId).catch(() => null);
  if (guild && event.logChannelId) {
    const logChannel = await guild.channels.fetch(event.logChannelId).catch(() => null);
    if (logChannel) {
      const cancelEmbed = new EmbedBuilder()
        .setColor(C.danger)
        .setTitle(`🛑 Dropbox Event #${eventId} Cancelled`)
        .setDescription(
          `**Cancelled By:** <@${cancelledBy}>\n` +
          `**Reason:** ${escapeText(reason)}\n` +
          `**Completed Drops:** ${event.completedDrops}/${event.totalDrops}`
        )
        .setFooter({ text: 'Event Cancelled by Administrator' })
        .setTimestamp();

      await logChannel.send({ embeds: [cancelEmbed] }).catch(() => {});
    }
  }

  return event;
}

/**
 * Starts the Dropbox background scheduler.
 */
export function startDropboxScheduler(client, intervalSeconds = 5) {
  processPendingDropboxTasks(client).catch(err => {
    console.error('[DROPBOX SCHEDULER BOOT ERROR]', err);
  });

  setInterval(() => {
    processPendingDropboxTasks(client).catch(err => {
      console.error('[DROPBOX SCHEDULER CRON ERROR]', err);
    });
  }, intervalSeconds * 1000);

  console.log(`\x1b[32m✔ [DROPBOX]\x1b[0m     Background scheduler active (checking every ${intervalSeconds}s)`);
}
