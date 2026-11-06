import crypto from 'node:crypto';
import { isOwner, isAdmin } from '../utils/common.js';

// In-memory session store: token -> { userId, username, avatar, role, createdAt, expiresAt }
export const sessions = new Map();

// Session expires in 7 days
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

// One-time magic login tickets for /dashboard command (5m expiration)
export const magicTickets = new Map();

export function createMagicLoginTicket({ userId, username = '', avatar = '', globalName = '' }) {
  const ticket = crypto.randomBytes(24).toString('hex');
  magicTickets.set(ticket, {
    userId: String(userId),
    username,
    avatar,
    globalName,
    expiresAt: Date.now() + 5 * 60 * 1000,
  });

  // Clean old tickets if map grows
  if (magicTickets.size > 200) {
    const now = Date.now();
    for (const [k, v] of magicTickets.entries()) {
      if (now > v.expiresAt) magicTickets.delete(k);
    }
  }

  return ticket;
}

export function redeemMagicLoginTicket(ticket) {
  if (!ticket) return null;
  const data = magicTickets.get(ticket);
  if (!data) return null;
  magicTickets.delete(ticket); // strictly one-time use
  if (Date.now() > data.expiresAt) return null;
  return createSession(data);
}

export function parseCookies(cookieHeader = '') {
  const cookies = {};
  if (!cookieHeader) return cookies;
  for (const part of cookieHeader.split(';')) {
    const [rawKey, ...rawVal] = part.trim().split('=');
    if (rawKey) {
      cookies[rawKey.trim()] = decodeURIComponent(rawVal.join('='));
    }
  }
  return cookies;
}

export function getUserRole(userId) {
  const uid = String(userId);
  if (isOwner(uid)) return 'owner';
  if (isAdmin(uid)) return 'admin';
  return 'user';
}

export async function isUserGuildAdmin(userId) {
  const uid = String(userId);
  // Strictly Bot Owner (.env) or Bot Admin added via /admin-add
  return isOwner(uid) || isAdmin(uid);
}

export function createSession({ userId, username = '', avatar = '', globalName = '' }) {
  const token = crypto.randomBytes(32).toString('hex');
  const role = getUserRole(userId);
  const now = Date.now();

  const session = {
    token,
    userId: String(userId),
    username: username || globalName || `User_${String(userId).slice(-4)}`,
    globalName: globalName || username,
    avatar: avatar
      ? `https://cdn.discordapp.com/avatars/${userId}/${avatar}.png?size=128`
      : 'https://cdn.discordapp.com/embed/avatars/0.png',
    role,
    createdAt: now,
    expiresAt: now + SESSION_TTL_MS,
  };

  sessions.set(token, session);
  return session;
}

export function getSessionFromRequest(req) {
  const cookies = parseCookies(req.headers.cookie);
  const token = cookies.vyntrix_session;
  if (!token) return null;

  const session = sessions.get(token);
  if (!session) return null;

  if (Date.now() > session.expiresAt) {
    sessions.delete(token);
    return null;
  }

  // Refresh user role in case admin status changed in DB
  session.role = getUserRole(session.userId);
  return session;
}

export function destroySession(token) {
  if (token) sessions.delete(token);
}

export const oauthStates = new Map();

export function getDiscordOAuthUrl(req) {
  const clientId = process.env.DISCORD_CLIENT_ID;
  if (!clientId) return null;

  const proto = req.headers['x-forwarded-proto'] || (req.connection.encrypted ? 'https' : 'http');
  const host = req.headers['x-forwarded-host'] || req.headers.host || 'localhost';
  const redirectUri = `${proto}://${host}/auth/callback`;

  // Cryptographically secure CSRF state token (10 min expiry)
  const state = crypto.randomBytes(24).toString('hex');
  oauthStates.set(state, { createdAt: Date.now(), expiresAt: Date.now() + 10 * 60 * 1000 });

  // Clean old expired states
  const now = Date.now();
  if (oauthStates.size > 200) {
    for (const [k, v] of oauthStates.entries()) {
      if (now > v.expiresAt) oauthStates.delete(k);
    }
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'identify',
    prompt: 'consent',
    state,
  });

  return `https://discord.com/api/oauth2/authorize?${params.toString()}`;
}

export async function handleDiscordCallback(code, req, state) {
  const clientId = process.env.DISCORD_CLIENT_ID;
  const clientSecret = process.env.DISCORD_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error('DISCORD_CLIENT_SECRET is not configured in .env');
  }

  // Validate OAuth2 state parameter for CSRF protection if provided
  if (state) {
    const stateRecord = oauthStates.get(state);
    if (!stateRecord) {
      console.warn('[OAUTH2] State not found in memory (possibly due to recent bot restart), proceeding with token exchange.');
    } else if (Date.now() > stateRecord.expiresAt) {
      oauthStates.delete(state);
      console.warn('[OAUTH2] State expired, proceeding with token exchange.');
    } else {
      oauthStates.delete(state);
    }
  }

  const proto = req.headers['x-forwarded-proto'] || (req.connection.encrypted ? 'https' : 'http');
  const host = req.headers['x-forwarded-host'] || req.headers.host || 'localhost';
  const redirectUri = `${proto}://${host}/auth/callback`;

  // Exchange code for token
  const tokenRes = await fetch('https://discord.com/api/oauth2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
    }),
  });

  if (!tokenRes.ok) {
    const errText = await tokenRes.text();
    throw new Error(`Discord OAuth exchange failed: ${errText}`);
  }

  const tokenData = await tokenRes.json();
  const accessToken = tokenData.access_token;

  // Fetch Discord user profile
  const userRes = await fetch('https://discord.com/api/users/@me', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!userRes.ok) {
    throw new Error('Failed to fetch Discord user profile');
  }

  const discordUser = await userRes.json();
  return createSession({
    userId: discordUser.id,
    username: discordUser.username,
    avatar: discordUser.avatar,
    globalName: discordUser.global_name,
  });
}
