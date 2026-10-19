/**
 * Duration parser and formatter for items and roles.
 * Supports: 1m, 10m, 1h, 12h, 1d, 7d, 30d, 45d, 90d, 2h30m, etc.
 */

export function parseDuration(input) {
  if (!input || typeof input !== 'string') return null;
  const str = input.trim().toLowerCase().replace(/\s+/g, '');
  if (!str) return null;

  // Strict regex: must be combinations of [number]d, [number]h, [number]m, [number]s
  const fullMatch = str.match(/^(?:(\d+)d)?(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/);
  if (!fullMatch || str === '') return null;

  let totalMs = 0;
  let hasUnit = false;

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

  const m = str.match(/(\d+)m/);
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
