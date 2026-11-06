import config from '../../config.js';
import { coinIcon } from '../../utils/common.js';

export function getCoinflipEmoji(type) {
  const custom = config.coinflipEmojis || {};
  if (type === 'heads') return custom.heads || '🪙';
  if (type === 'tails') return custom.tails || '🪙';
  if (type === 'spin') return custom.spin || '🔄';
  return '🪙';
}

/**
 * Compact OwO-style text formatters (Live flipping animation & outcome landing)
 */
export function formatSpinningMessage(playerName, bet, choice, currentSide = 'heads', customSpinIcon = null) {
  const icon = customSpinIcon || (currentSide.toLowerCase() === 'heads' ? getCoinflipEmoji('heads') : getCoinflipEmoji('tails'));
  return `**${playerName}** spent ${coinIcon()} **${bet.toLocaleString()}** and chose **${choice.toLowerCase()}**\nThe coin spins... ${icon} **[ ${currentSide.toUpperCase()} ]**`;
}

export function formatWinMessage(playerName, bet, choice, outcome, payout) {
  const landedSide = (outcome && typeof outcome === 'string') ? outcome.toLowerCase() : choice.toLowerCase();
  const payoutVal = (typeof outcome === 'number') ? outcome : payout;
  const landedEmoji = getCoinflipEmoji(landedSide);
  return `**${playerName}** spent ${coinIcon()} **${bet.toLocaleString()}** and chose **${choice.toLowerCase()}**\nThe coin landed on ${landedEmoji} **${landedSide.toUpperCase()}** and you won ${coinIcon()} **${Number(payoutVal).toLocaleString()}**!!`;
}

export function formatLoseMessage(playerName, bet, choice, outcome) {
  const landedSide = (outcome && typeof outcome === 'string')
    ? outcome.toLowerCase()
    : (choice.toLowerCase() === 'heads' ? 'tails' : 'heads');
  const landedEmoji = getCoinflipEmoji(landedSide);
  return `**${playerName}** spent ${coinIcon()} **${bet.toLocaleString()}** and chose **${choice.toLowerCase()}**\nThe coin landed on ${landedEmoji} **${landedSide.toUpperCase()}** and you lost it all... :c`;
}
