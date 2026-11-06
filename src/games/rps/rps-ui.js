import {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} from 'discord.js';
import { coinIcon } from '../../utils/common.js';

export const RPS_MOVES = {
  rock: {
    id: 'rock',
    name: 'Rock',
    emoji: '🪨',
    style: ButtonStyle.Danger,
    beats: 'scissors',
    action: 'destroys'
  },
  paper: {
    id: 'paper',
    name: 'Paper',
    emoji: '📄',
    style: ButtonStyle.Success,
    beats: 'rock',
    action: 'covers'
  },
  scissors: {
    id: 'scissors',
    name: 'Scissors',
    emoji: '✂️',
    style: ButtonStyle.Primary,
    beats: 'paper',
    action: 'cut'
  }
};

/**
 * Evaluates outcome of an RPS duel
 * @param {'rock'|'paper'|'scissors'} playerMove
 * @param {'rock'|'paper'|'scissors'} botMove
 * @returns {{ outcome: 'win'|'lose'|'draw', reason: string }}
 */
export function evaluateRps(playerMove, botMove) {
  const p = RPS_MOVES[playerMove];
  const b = RPS_MOVES[botMove];

  if (!p || !b) {
    return { outcome: 'draw', reason: 'Invalid moves provided.' };
  }

  if (playerMove === botMove) {
    return {
      outcome: 'draw',
      reason: `🤝 Both selected ${p.name}! Your bet has been refunded.`
    };
  }

  if (p.beats === botMove) {
    const actionVerb = playerMove === 'scissors' ? 'cut' : `${p.action}`;
    return {
      outcome: 'win',
      reason: `🏆 ${p.name} ${actionVerb} ${b.name}! You won!`
    };
  }

  const botActionVerb = botMove === 'scissors' ? 'cut' : `${b.action}`;
  return {
    outcome: 'lose',
    reason: `💔 ${b.name} ${botActionVerb} ${p.name}! You lost!`
  };
}

/**
 * Builds the initial interactive game Embed
 */
export function buildRpsStartEmbed({ playerName, playerAvatar, amount }) {
  const cIcon = coinIcon();
  const winPayout = amount * 2;

  return new EmbedBuilder()
    .setColor(0x7c3aed) // Vibrant Purple
    .setTitle('🪨 RPS DUEL')
    .setAuthor({ name: playerName, iconURL: playerAvatar || undefined })
    .setDescription(
      `**Player:** **${playerName}**\n` +
      `**Bet Amount:** ${cIcon} **${amount.toLocaleString()}**\n` +
      `**Win Multiplier:** **2.0x** (Payout: ${cIcon} **${winPayout.toLocaleString()}**)\n\n` +
      `👉 **Choose your move below!**`
    )
    .setFooter({ text: '⏱️ You have 30 seconds to choose your move' })
    .setTimestamp();
}

/**
 * Builds the ActionRow with Rock, Paper, Scissors buttons
 */
export function buildRpsButtons(sessionId, disabled = false, chosenMove = null, botMove = null) {
  const row = new ActionRowBuilder();

  for (const key of ['rock', 'paper', 'scissors']) {
    const m = RPS_MOVES[key];
    const button = new ButtonBuilder()
      .setCustomId(`rps:${m.id}:${sessionId}`)
      .setLabel(m.name.toUpperCase())
      .setEmoji(m.emoji)
      .setStyle(m.style)
      .setDisabled(disabled);

    if (disabled && chosenMove === m.id) {
      button.setLabel(`${m.name.toUpperCase()} (YOU)`);
    }

    row.addComponents(button);
  }

  return row;
}

/**
 * Builds the final settled result Embed
 */
export function buildRpsResultEmbed({
  playerName,
  playerAvatar,
  playerMove,
  botMove,
  outcome,
  reason,
  bet,
  payout,
  net,
  newBalance
}) {
  const cIcon = coinIcon();
  const p = RPS_MOVES[playerMove] || { name: playerMove, emoji: '❓' };
  const b = RPS_MOVES[botMove] || { name: botMove, emoji: '❓' };

  let color = 0x64748b;
  const title = '🪨 RPS DUEL';
  let outcomeBadge = '';

  if (outcome === 'win') {
    color = 0x10b981; // Success Green
    outcomeBadge = `✅ **WIN (+${net.toLocaleString()} coins)**`;
  } else if (outcome === 'lose') {
    color = 0xef4444; // Danger Red
    outcomeBadge = `❌ **LOST (-${bet.toLocaleString()} coins)**`;
  } else {
    color = 0xf59e0b; // Amber Gold
    outcomeBadge = `🤝 **DRAW (100% Refunded)**`;
  }

  return new EmbedBuilder()
    .setColor(color)
    .setTitle(title)
    .setAuthor({ name: playerName, iconURL: playerAvatar || undefined })
    .setDescription(
      `### ${reason}\n\n` +
      `**Your Move:** ${p.emoji} **${p.name}**\n` +
      `**Bot's Move:** ${b.emoji} **${b.name}**\n\n` +
      `**Result:** ${outcomeBadge}\n` +
      `**Bet:** ${cIcon} **${bet.toLocaleString()}**\n` +
      `**Payout:** ${cIcon} **${payout.toLocaleString()}**`
    )
    .setFooter({ text: 'RPS Duel • Game Over' })
    .setTimestamp();
}

/**
 * Builds the 30-Second Timeout / Refund Embed
 */
export function buildRpsTimeoutEmbed({ playerName, playerAvatar, bet }) {
  const cIcon = coinIcon();

  return new EmbedBuilder()
    .setColor(0x64748b) // Neutral Slate
    .setTitle('⌛ RPS DUEL — GAME EXPIRED')
    .setAuthor({ name: playerName, iconURL: playerAvatar || undefined })
    .setDescription(
      `**${playerName}**, your RPS game has **expired** after 30 seconds of inactivity.\n\n` +
      `🛡️ Your bet of ${cIcon} **${bet.toLocaleString()}** has been **100% refunded** back to your wallet.`
    )
    .setFooter({ text: 'RPS Duel • Bet Refunded' })
    .setTimestamp();
}

