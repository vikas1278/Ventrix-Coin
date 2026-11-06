import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import config from '../config.js';
import {
  getSessionFromRequest,
  createSession,
  destroySession,
  getDiscordOAuthUrl,
  handleDiscordCallback,
  parseCookies,
  redeemMagicLoginTicket,
} from './auth.js';
import { handleUserApi, handleAdminApi, handleOwnerApi, sendJson } from './api.js';
import { renderLoginPage, renderDashboardPage } from './ui.js';

let botClient = null;
let commandsList = [];

export function setServerBotContext(client, commands = []) {
  botClient = client;
  commandsList = commands;
}

export function startWebServer(client, commands = []) {
  botClient = client;
  commandsList = commands;

  const PORT = process.env.PORT || 10000;
  const shopName = config.shopName || 'Ventrix Coin Shop';
  const coinName = config.coinName || 'VCoins';

  const server = http.createServer(async (req, res) => {
    try {
      const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
      const pathname = url.pathname;
      const method = req.method;

      // ─── Health / Ping (Render Port Check) ──────────────────────────────────
      if (pathname === '/health' || pathname === '/ping') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ status: 'ok', uptime: Math.floor(process.uptime()) }));
      }

      // ─── Static Assets (/assets/*) ──────────────────────────────────────────
      if (pathname.startsWith('/assets/') && method === 'GET') {
        const safePath = path.normalize(pathname.replace('/assets/', '')).replace(/^(\.\.[\/\\])+/, '');
        const filePath = path.join(process.cwd(), 'src', 'web', 'public', safePath);
        if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
          const ext = path.extname(filePath).toLowerCase();
          const mimeTypes = {
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.png': 'image/png',
            '.webp': 'image/webp',
            '.svg': 'image/svg+xml',
          };
          res.writeHead(200, {
            'Content-Type': mimeTypes[ext] || 'application/octet-stream',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
          });
          return fs.createReadStream(filePath).pipe(res);
        }
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        return res.end('Asset Not Found');
      }

      // ─── OAuth2 Discord Flow ───────────────────────────────────────────────
      if (pathname === '/auth/login' && method === 'GET') {
        const oauthUrl = getDiscordOAuthUrl(req);
        if (oauthUrl && process.env.DISCORD_CLIENT_SECRET) {
          res.writeHead(302, { Location: oauthUrl });
          return res.end();
        }
        res.writeHead(302, { Location: '/login' });
        return res.end();
      }

      if (pathname === '/auth/callback' && method === 'GET') {
        const errorParam = url.searchParams.get('error');
        if (errorParam) {
          console.warn('[DISCORD OAUTH CANCELLED/ERROR]', errorParam);
          res.writeHead(302, { Location: `/login?error=${encodeURIComponent(errorParam)}` });
          return res.end();
        }

        const code = url.searchParams.get('code');
        const state = url.searchParams.get('state');
        if (!code) {
          res.writeHead(302, { Location: '/login?error=no_code' });
          return res.end();
        }

        try {
          const session = await handleDiscordCallback(code, req, state);
          const isHttps = req.headers['x-forwarded-proto'] === 'https' || req.connection?.encrypted;
          res.writeHead(302, {
            'Set-Cookie': `vyntrix_session=${session.token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800${isHttps ? '; Secure' : ''}`,
            Location: '/',
          });
          return res.end();
        } catch (e) {
          console.error('[DISCORD OAUTH ERROR]', e);
          res.writeHead(302, { Location: `/login?error=${encodeURIComponent(e.message)}` });
          return res.end();
        }
      }

      // ─── Instant Magic Auto-Login (From Discord /dashboard Command) ─────────
      if (pathname === '/auth/magic' && method === 'GET') {
        const ticket = url.searchParams.get('ticket');
        const session = redeemMagicLoginTicket(ticket);
        if (session) {
          res.writeHead(302, {
            'Set-Cookie': `vyntrix_session=${session.token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800`,
            Location: '/',
          });
          return res.end();
        }
        res.writeHead(302, { Location: '/login?error=invalid_or_expired_login_link' });
        return res.end();
      }

      // ─── Local Dev Verification Login (Loopback Only) ──────────────────────
      if (pathname === '/auth/dev-verify' && method === 'GET') {
        const ip = req.socket.remoteAddress || '';
        const isLoopback = ip === '127.0.0.1' || ip === '::1' || ip === '::ffff:127.0.0.1';
        if (isLoopback) {
          const ownerId = (process.env.BOT_OWNER_IDS || '').split(',')[0].trim() || '527175885309083648';
          const session = createSession({
            userId: ownerId,
            username: 'VentrixAdmin',
            avatar: '',
            globalName: 'Ventrix Super Admin'
          });
          res.writeHead(302, {
            'Set-Cookie': `vyntrix_session=${session.token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800`,
            Location: '/',
          });
          return res.end();
        }
      }

      // ─── Logout ────────────────────────────────────────────────────────────
      if (pathname === '/auth/logout') {
        const cookies = parseCookies(req.headers.cookie);
        destroySession(cookies.vyntrix_session);
        res.writeHead(302, {
          'Set-Cookie': 'vyntrix_session=; Path=/; Max-Age=0',
          Location: '/login',
        });
        return res.end();
      }

      // ─── Login Page View ───────────────────────────────────────────────────
      if (pathname === '/login' && method === 'GET') {
        const session = getSessionFromRequest(req);
        if (session) {
          res.writeHead(302, { Location: '/' });
          return res.end();
        }

        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        return res.end(
          renderLoginPage({
            hasSecret: Boolean(process.env.DISCORD_CLIENT_SECRET),
            shopName,
            coinName,
          })
        );
      }

      // ─── API Routes (Authenticated) ────────────────────────────────────────
      if (pathname.startsWith('/api/')) {
        const session = getSessionFromRequest(req);
        if (!session) {
          return sendJson(res, 401, { error: 'Unauthorized. Please login with Discord.' });
        }

        // Try user APIs
        const handledUser = await handleUserApi(pathname, method, req, res, session, botClient, url);
        if (handledUser !== false) return;

        // Try admin APIs
        const handledAdmin = await handleAdminApi(pathname, method, req, res, session, botClient, url);
        if (handledAdmin !== false) return;

        // Try owner APIs
        const handledOwner = await handleOwnerApi(pathname, method, req, res, session, botClient, url);
        if (handledOwner !== false) return;

        return sendJson(res, 404, { error: 'API route not found' });
      }

      // ─── Main Dashboard Page (Requires Login) ──────────────────────────────
      if ((pathname === '/' || pathname === '/dashboard') && method === 'GET') {
        const session = getSessionFromRequest(req);
        if (!session) {
          res.writeHead(302, { Location: '/login' });
          return res.end();
        }

        const html = renderDashboardPage({
          session,
          shopName,
          coinName,
        });

        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        return res.end(html);
      }

      // Fallback 404
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
    } catch (err) {
      console.error('[HTTP SERVER ROUTE ERROR]', err);
      if (!res.headersSent) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
      }
      res.end(JSON.stringify({ error: 'Internal Server Error', details: err?.message }));
    }
  });

  server.on('error', err => {
    console.error('\x1b[31m[WEB SERVER ERROR]\x1b[0m', err?.message || err);
  });

  server.listen(PORT, '0.0.0.0', () => {
    console.log(
      `\x1b[32m✔ [FULL DASHBOARD]\x1b[0m Discord OAuth2 & Admin Web Control active on http://localhost:${PORT}`
    );
  });

  return server;
}
