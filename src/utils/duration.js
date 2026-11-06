/**
 * Duration parser and formatter for items, roles, and timed events.
 * Supports compact codes and full English terms:
 * 1m, 10m, 1min, 1 minute, 1minutes
 * 1h, 12h, 1hr, 1 hour, 1hours
 * 1d, 7d, 30d, 1day, 1 day, 1days
 * 2h30m, 1d 12h, 30s, etc.
 */

export function parseDuration(input) {
  if (!input || typeof input !== 'string') return null;
  let str = input.trim().toLowerCase();

  // Normalize full names & common abbreviations into canonical unit characters
  str = str
    .replace(/months?/gi, 'mo')
    .replace(/weeks?|wks?/gi, 'w')
    .replace(/minutes?|mins?/gi, 'm')
    .replace(/hours?|hrs?/gi, 'h')
    .replace(/days?/gi, 'd')
    .replace(/seconds?|secs?/gi, 's')
    .replace(/\s+/g, '');

  if (!str) return null;

  // Strict regex: must be valid combination of digits + unit tokens
  const fullMatch = str.match(/^(?:(\d+)mo)?(?:(\d+)w)?(?:(\d+)d)?(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/);
  if (!fullMatch || str === '') return null;

  let totalMs = 0;
  let hasUnit = false;

  const mo = str.match(/(\d+)mo/);
  if (mo) {
    const months = parseInt(mo[1], 10);
    totalMs += months * 30 * 86400 * 1000;
    hasUnit = true;
  }

  // Ensure w doesn't match mo
  const w = str.replace(/\d+mo/g, '').match(/(\d+)w/);
  if (w) {
    const weeks = parseInt(w[1], 10);
    totalMs += weeks * 7 * 86400 * 1000;
    hasUnit = true;
  }

  const d = str.match(/(\d+)d/);
  if (d) {
    const days = parseInt(d[1], 10);
    totalMs += days * 86400 * 1000;
    hasUnit = true;
  }

  const h = str.match(/(\d+)h/);
  if (h) {
    const hours = parseInt(h[1], 10);
    totalMs += hours * 3600 * 1000;
    hasUnit = true;
  }

  const m = str.replace(/\d+mo/g, '').match(/(\d+)m/);
  if (m) {
    const mins = parseInt(m[1], 10);
    totalMs += mins * 60 * 1000;
    hasUnit = true;
  }

  const s = str.match(/(\d+)s/);
  if (s) {
    const secs = parseInt(s[1], 10);
    totalMs += secs * 1000;
    hasUnit = true;
  }

  if (!hasUnit || totalMs <= 0 || !Number.isFinite(totalMs)) return null;
  return totalMs;
}

export function formatDuration(ms) {
  if (!ms || ms <= 0) return '0s';
  const totalSec = Math.floor(ms / 1000);
  const days = Math.floor(totalSec / 86400);
  const hours = Math.floor((totalSec % 86400) / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);
  const seconds = totalSec % 60;

  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (seconds > 0 && parts.length === 0) parts.push(`${seconds}s`);

  return parts.join(' ') || `${totalSec}s`;
}

export function formatDurationText(ms) {
  if (!ms || ms <= 0) return '0 seconds';
  const totalSec = Math.floor(ms / 1000);
  const days = Math.floor(totalSec / 86400);
  const hours = Math.floor((totalSec % 86400) / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);
  const seconds = totalSec % 60;

  const parts = [];
  if (days > 0) parts.push(`${days} ${days === 1 ? 'day' : 'days'}`);
  if (hours > 0) parts.push(`${hours} ${hours === 1 ? 'hour' : 'hours'}`);
  if (minutes > 0) parts.push(`${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`);
  if (seconds > 0 && parts.length === 0) parts.push(`${seconds} ${seconds === 1 ? 'second' : 'seconds'}`);

  return parts.join(' ') || `${totalSec} seconds`;
}
