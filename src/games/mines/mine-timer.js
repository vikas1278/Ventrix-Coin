import { resolveMineRound } from '../../services/gaming.js';
import { renderMine } from './mine-ui.js';

export const TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes inactivity timer
const activeTimers = new Map();

export function setMineTimer({ client, guildId, userId, sessionId, channelId, messageId }) {
  clearMineTimer(sessionId);

  const timeoutHandle = setTimeout(async () => {
    activeTimers.delete(sessionId);
    try {
      const result = await resolveMineRound({
        guildId,
        userId,
        sessionId,
        action: 'expire'
      });

      if (result && result.session) {
        if (client && channelId && messageId) {
          const channel = client.channels.cache.get(channelId) || await client.channels.fetch(channelId).catch(() => null);
          if (channel) {
            const message = await channel.messages.fetch(messageId).catch(() => null);
            if (message) {
              await message.edit(renderMine(result.session)).catch(() => {});
            }
          }
        }
      }
    } catch (error) {
      console.error('[MINE TIMEOUT AUTO-SETTLE ERROR]', error);
    }
  }, TIMEOUT_MS);

  activeTimers.set(sessionId, {
    handle: timeoutHandle,
    client,
    guildId,
    userId,
    sessionId,
    channelId,
    messageId,
    startedAt: Date.now()
  });
}

export function clearMineTimer(sessionId) {
  if (activeTimers.has(sessionId)) {
    clearTimeout(activeTimers.get(sessionId).handle);
    activeTimers.delete(sessionId);
  }
}

export function resetMineTimer({ client, guildId, userId, sessionId, channelId, messageId }) {
  const existing = activeTimers.get(sessionId);
  setMineTimer({
    client: client || existing?.client,
    guildId,
    userId,
    sessionId,
    channelId: channelId || existing?.channelId,
    messageId: messageId || existing?.messageId
  });
}

