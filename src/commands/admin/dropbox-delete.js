import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { DropboxEvent, DropboxDrop, DropboxClaim } from '../../models.js';
import { cancelEvent } from '../../services/dropbox.js';
import {
  formatCoins,
  err,
  ok,
  info,
  replyEmbed,
  adminOnly,
} from '../../utils/common.js';

export const data = new SlashCommandBuilder()
  .setName('dropbox-delete')
  .setDescription('Permanently delete a Dropbox event from database (Admin)')
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .setDMPermission(false)
  .addStringOption(o =>
    o
      .setName('event_id')
      .setDescription('Event ID to delete or choose "all_ended" to wipe ended events')
      .setRequired(true)
      .setAutocomplete(true)
  );

export async function execute(interaction) {
  if (!adminOnly(interaction)) {
    return replyEmbed(interaction, err('Access Denied', 'This command is restricted to administrators.'));
  }

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

export async function autocomplete(interaction) {
  try {
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

    if (!focusedValue || 'all ended clear'.includes(focusedValue.toLowerCase())) {
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
