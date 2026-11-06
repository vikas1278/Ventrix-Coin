import { MessageFlags } from 'discord.js';
import { resolveMineRound } from '../../services/gaming.js';
import { MineSession } from '../../models.js';
import { renderMine } from './mine-ui.js';
import { clearMineTimer, resetMineTimer } from './mine-timer.js';

// Sequential promise queue per session to prevent race conditions without discarding player clicks
const sessionQueues = new Map();

/**
 * Directly updates the board message via interaction.update (clears button loading spinner instantly)
 */
async function updateBoard(interaction, rendered) {
  try {
    if (!interaction.replied && !interaction.deferred) {
      return await interaction.update(rendered);
    }
    if (interaction.deferred) {
      return await interaction.editReply(rendered);
    }
    if (interaction.message?.editable) {
      return await interaction.message.edit(rendered);
    }
  } catch (err) {
    if (err?.code !== 10062) {
      console.warn('[MINES updateBoard error]', err?.message || err);
    }
    if (interaction.message?.editable) {
      return await interaction.message.edit(rendered).catch(() => {});
    }
  }
}

export async function handleMineButton(interaction) {
  if (!interaction.guildId) {
    return interaction.reply({
      content: '❌ Mines can only be played inside a server.',
      flags: MessageFlags.Ephemeral
    }).catch(() => {});
  }

  const parts = interaction.customId.split(':');
  const action = parts[1];
  const sessionId = parts[2];
  const index = action === 'tile' ? Number(parts[3]) : null;

  // Queue actions per session so fast consecutive clicks are executed in order rather than dropped
  const queueKey = `${interaction.guildId}::${sessionId}`;
  const previousTask = sessionQueues.get(queueKey) || Promise.resolve();

  const currentTask = previousTask.then(async () => {
    try {
      const session = await MineSession.findOne({
        sessionId,
        guildId: interaction.guildId
      });

      if (!session) {
        return interaction.reply({
          content: '❌ This Mines game could not be found. Start a new one with `/mine`.',
          flags: MessageFlags.Ephemeral
        }).catch(() => {});
      }

      if (session.userId !== interaction.user.id) {
        return interaction.reply({
          content: '❌ This is not your Mines game.',
          flags: MessageFlags.Ephemeral
        }).catch(() => {});
      }

      // If the round has already ended, sync message to final state
      if (session.status !== 'active') {
        clearMineTimer(sessionId);
        const rendered = renderMine(session.toObject());
        return await updateBoard(interaction, rendered);
      }

      const result = await resolveMineRound({
        guildId: interaction.guildId,
        userId: interaction.user.id,
        sessionId,
        action,
        index,
        sessionDoc: session
      });

      if (result.error === 'ALREADY_REVEALED') {
        const rendered = renderMine(session.toObject());
        return await updateBoard(interaction, rendered);
      }

      if (result.error === 'CASHOUT_REQUIRED_SAFE_PICK') {
        return interaction.reply({
          content: '⚠️ Reveal at least one safe tile before cashing out.',
          flags: MessageFlags.Ephemeral
        }).catch(() => {});
      }

      if (result.session && !result.session.playerName) {
        result.session.playerName = interaction.user.globalName || interaction.user.displayName || interaction.user.username;
      }

      if (result.error === 'SESSION_EXPIRED' || result.error === 'SESSION_NOT_ACTIVE') {
        clearMineTimer(sessionId);
        const rendered = renderMine(result.session);
        return await updateBoard(interaction, rendered);
      }

      if (result.session.status === 'active') {
        // Reset 5-minute inactivity timer
        resetMineTimer({
          client: interaction.client,
          guildId: interaction.guildId,
          userId: interaction.user.id,
          sessionId,
          channelId: interaction.channelId,
          messageId: interaction.message?.id
        });
      } else {
        // Round ended: won, lost, or cashed out
        clearMineTimer(sessionId);
      }

      const rendered = renderMine(result.session);
      await updateBoard(interaction, rendered);
    } catch (error) {
      console.error('[MINES BUTTON ERROR]', error);
      const payload = {
        content: '❌ Could not update this Mines round. Please try again.',
        flags: MessageFlags.Ephemeral
      };
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply(payload).catch(() => {});
      } else {
        await interaction.followUp(payload).catch(() => {});
      }
    }
  }).finally(() => {
    if (sessionQueues.get(queueKey) === currentTask) {
      sessionQueues.delete(queueKey);
    }
  });

  sessionQueues.set(queueKey, currentTask);
  await currentTask;
}
