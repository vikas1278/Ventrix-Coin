import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { formatCoins } from '../../utils/common.js';

export const GUESS_MULTIPLIERS = {
  1: 5.0,  // 5x on 1st attempt
  2: 4.0,  // 4x on 2nd attempt
  3: 3.0,  // 3x on 3rd attempt
  4: 2.0,  // 2x on 4th attempt
  5: 1.5   // 1.5x on 5th attempt
};

export function getMultiplier(attempt) {
  return GUESS_MULTIPLIERS[attempt] || 1.0;
}

/**
 * Initial message matching screenshot:
 * 🤔 7mikeygaming, the mystery machine is ready, you have 5 attempts to guess the number between 1 and 100...
 * type your answer • (Bet: X VCoins)
 */
export function formatStartMessage(playerName, maxAttempts = 5, bet = 10) {
  return `🤔 ${playerName}, the mystery machine is ready, you have ${maxAttempts} attempts to guess the number **between 1 and 100**...\ntype your answer • (Bet: **${formatCoins(bet)}**)`;
}

/**
 * Hint message matching screenshot:
 * 🤔 7mikeygaming, the number you are looking for is less than 60
 * 4 attempts left
 */
export function formatHintMessage(playerName, hint, guess, attemptsLeft) {
  return `🤔 ${playerName}, the number you are looking for is **${hint} than ${guess}**\n${attemptsLeft} attempts left`;
}

/**
 * Winning message
 */
export function formatWinMessage(playerName, secret, attemptsTaken, payout, multiplier, newBalance) {
  return `🎉 ${playerName}, you guessed the number! The mystery number was **${secret}**!\n` +
    `💰 You won **+${formatCoins(payout)}** (${multiplier}x payout) in **${attemptsTaken}** attempt(s)!\n` +
    `👛 New Balance: **${formatCoins(newBalance)}**`;
}

/**
 * Losing message
 */
export function formatLoseMessage(playerName, secret, bet, newBalance) {
  return `💀 ${playerName}, you ran out of attempts! The mystery number was **${secret}**.\n` +
    `💸 Lost: **-${formatCoins(bet)}**\n` +
    `👛 Current Balance: **${formatCoins(newBalance)}**`;
}

/**
 * ActionRow with "Type Your Answer" button
 * This triggers a Discord Modal so it NEVER needs Message Content Intent!
 */
export function buildGuessButton(sessionId) {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`guess_btn_${sessionId}`)
      .setLabel('💬 Type Your Answer')
      .setStyle(ButtonStyle.Primary)
  );
}
