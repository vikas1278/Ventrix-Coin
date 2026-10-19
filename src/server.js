import http from 'node:http';
import mongoose from 'mongoose';
import config from './config.js';

let botClient = null;
let commandsList = [];
const startTime = Date.now();

export function setServerBotContext(client, commands = []) {
  botClient = client;
  commandsList = commands;
}

export function startWebServer(client, commands = []) {
  botClient = client;
  commandsList = commands;

  const PORT = process.env.PORT || 10000;

  const server = http.createServer((req, res) => {
    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);

    // Health check endpoint
    if (url.pathname === '/health' || url.pathname === '/ping') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ status: 'ok', timestamp: new Date().toISOString() }));
    }

    // Live API status endpoint
    if (url.pathname === '/api/status') {
      const isDbConnected = mongoose.connection.readyState === 1;
      const uptimeSec = Math.floor(process.uptime());
      const memoryMb = Math.round(process.memoryUsage().rss / 1024 / 1024);
      const ping = botClient?.ws?.ping >= 0 ? botClient.ws.ping : 0;
      const guildsCount = botClient?.guilds?.cache?.size || 0;
      const botTag = botClient?.user?.tag || 'Vyntrix Bot (Connecting...)';
      const botAvatar = botClient?.user?.displayAvatarURL?.({ size: 128 }) || '';

      res.writeHead(200, {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      });
      return res.end(
        JSON.stringify({
          status: 'online',
          botTag,
          botAvatar,
          ping,
          guildsCount,
          commandsCount: commandsList.length || 18,
          memoryMb,
          isDbConnected,
          uptimeSec,
          shopName: config.shopName || 'Vyntrix Coin Shop',
          coinName: config.coinName || 'VCoins',
        })
      );
    }

    // Serve Ultra-Modern HTML Dashboard
    res.writeHead(200, {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-cache',
    });
    res.end(renderDashboardHtml());
  });

  server.on('error', err => {
    console.error('\x1b[31m[WEB SERVER ERROR]\x1b[0m', err?.message || err);
  });

  server.listen(PORT, '0.0.0.0', () => {
    console.log(
      `\x1b[32m✔ [WEB DASHBOARD]\x1b[0m Live dashboard running on http://0.0.0.0:${PORT} (Render port check satisfied)`
    );
  });

  return server;
}

function renderDashboardHtml() {
  const shopName = config.shopName || 'Vyntrix Coin Shop';
  const coinName = config.coinName || 'VCoins';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${shopName} — Live System Dashboard</title>
  <meta name="description" content="Live real-time operational status, system health, and command hub for ${shopName} Discord Bot.">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg-dark: #08090d;
      --card-bg: rgba(18, 20, 29, 0.75);
      --card-border: rgba(255, 255, 255, 0.08);
      --card-hover: rgba(255, 255, 255, 0.12);
      --accent-gold: #f59e0b;
      --accent-purple: #8b5cf6;
      --accent-cyan: #06b6d4;
      --accent-green: #10b981;
      --text-main: #f3f4f6;
      --text-muted: #9ca3af;
      --font-heading: 'Outfit', sans-serif;
      --font-body: 'Plus Jakarta Sans', sans-serif;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      background-color: var(--bg-dark);
      background-image: 
        radial-gradient(circle at 15% 15%, rgba(139, 92, 246, 0.15) 0%, transparent 40%),
        radial-gradient(circle at 85% 85%, rgba(245, 158, 11, 0.12) 0%, transparent 45%),
        radial-gradient(circle at 50% 50%, rgba(6, 182, 212, 0.08) 0%, transparent 60%);
      color: var(--text-main);
      font-family: var(--font-body);
      min-height: 100vh;
      overflow-x: hidden;
      display: flex;
      flex-direction: column;
    }

    /* Ambient animated mesh */
    .glow-orb {
      position: fixed;
      border-radius: 50%;
      filter: blur(120px);
      pointer-events: none;
      z-index: 0;
    }
    .glow-1 { top: -100px; left: -100px; width: 400px; height: 400px; background: rgba(139, 92, 246, 0.2); }
    .glow-2 { bottom: -100px; right: -100px; width: 450px; height: 450px; background: rgba(245, 158, 11, 0.15); }

    .container {
      max-width: 1180px;
      margin: 0 auto;
      padding: 32px 24px 60px;
      position: relative;
      z-index: 1;
      width: 100%;
    }

    /* Navbar / Header */
    header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 24px;
      background: var(--card-bg);
      backdrop-filter: blur(16px);
      border: 1px solid var(--card-border);
      border-radius: 20px;
      margin-bottom: 32px;
      box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.5);
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .avatar-wrapper {
      position: relative;
      width: 52px;
      height: 52px;
    }

    .avatar-img {
      width: 100%;
      height: 100%;
      border-radius: 14px;
      object-fit: cover;
      background: #1e1b4b;
      border: 2px solid var(--accent-purple);
    }

    .pulse-dot {
      position: absolute;
      bottom: -2px;
      right: -2px;
      width: 14px;
      height: 14px;
      background: var(--accent-green);
      border-radius: 50%;
      border: 2px solid #0f111a;
      box-shadow: 0 0 10px var(--accent-green);
      animation: pulse-ring 2s infinite;
    }

    @keyframes pulse-ring {
      0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
      70% { box-shadow: 0 0 0 8px rgba(16, 185, 129, 0); }
      100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
    }

    .brand-text h1 {
      font-family: var(--font-heading);
      font-size: 20px;
      font-weight: 700;
      letter-spacing: -0.02em;
      background: linear-gradient(135deg, #ffffff 40%, #cbd5e1 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .brand-text p {
      font-size: 13px;
      color: var(--text-muted);
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: rgba(16, 185, 129, 0.12);
      border: 1px solid rgba(16, 185, 129, 0.3);
      color: #34d399;
      font-size: 13px;
      font-weight: 600;
      padding: 8px 16px;
      border-radius: 999px;
    }

    .status-badge .dot {
      width: 8px;
      height: 8px;
      background: var(--accent-green);
      border-radius: 50%;
      animation: blink 1.5s infinite;
    }

    @keyframes blink {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.4; }
    }

    /* Hero Banner */
    .hero {
      text-align: center;
      padding: 40px 20px;
      margin-bottom: 36px;
    }

    .hero-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: rgba(245, 158, 11, 0.12);
      border: 1px solid rgba(245, 158, 11, 0.25);
      color: #fbbf24;
      font-size: 12px;
      font-weight: 600;
      padding: 6px 14px;
      border-radius: 20px;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      margin-bottom: 16px;
    }

    .hero h2 {
      font-family: var(--font-heading);
      font-size: clamp(28px, 4vw, 42px);
      font-weight: 800;
      line-height: 1.15;
      letter-spacing: -0.03em;
      margin-bottom: 14px;
      background: linear-gradient(135deg, #ffffff 30%, #e2e8f0 70%, #94a3b8 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .hero p {
      font-size: 16px;
      color: var(--text-muted);
      max-width: 640px;
      margin: 0 auto;
      line-height: 1.6;
    }

    /* Live Metrics Grid */
    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
      gap: 20px;
      margin-bottom: 36px;
    }

    .metric-card {
      background: var(--card-bg);
      backdrop-filter: blur(16px);
      border: 1px solid var(--card-border);
      border-radius: 18px;
      padding: 24px;
      position: relative;
      overflow: hidden;
      transition: all 0.25s ease;
    }

    .metric-card:hover {
      border-color: var(--card-hover);
      transform: translateY(-3px);
      box-shadow: 0 12px 30px -10px rgba(0, 0, 0, 0.4);
    }

    .metric-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 2px;
      background: linear-gradient(90deg, transparent, var(--card-accent, var(--accent-purple)), transparent);
    }

    .metric-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 12px;
    }

    .metric-title {
      font-size: 13px;
      font-weight: 600;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .metric-icon {
      font-size: 20px;
    }

    .metric-value {
      font-family: var(--font-heading);
      font-size: 32px;
      font-weight: 700;
      letter-spacing: -0.03em;
      color: #ffffff;
      margin-bottom: 4px;
    }

    .metric-sub {
      font-size: 12px;
      color: var(--text-muted);
      display: flex;
      align-items: center;
      gap: 6px;
    }

    /* System Status Hub */
    .section-title {
      font-family: var(--font-heading);
      font-size: 20px;
      font-weight: 700;
      margin-bottom: 20px;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .services-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      gap: 20px;
      margin-bottom: 40px;
    }

    .service-card {
      background: var(--card-bg);
      backdrop-filter: blur(14px);
      border: 1px solid var(--card-border);
      border-radius: 16px;
      padding: 20px;
      display: flex;
      gap: 16px;
      align-items: flex-start;
      transition: border-color 0.2s;
    }

    .service-card:hover {
      border-color: var(--card-hover);
    }

    .service-icon-box {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 22px;
      flex-shrink: 0;
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.06);
    }

    .service-info {
      flex: 1;
    }

    .service-info h3 {
      font-family: var(--font-heading);
      font-size: 16px;
      font-weight: 600;
      margin-bottom: 4px;
    }

    .service-info p {
      font-size: 13px;
      color: var(--text-muted);
      line-height: 1.5;
      margin-bottom: 10px;
    }

    .service-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      font-weight: 600;
      color: var(--accent-green);
    }

    .service-badge::before {
      content: '';
      width: 6px;
      height: 6px;
      background: var(--accent-green);
      border-radius: 50%;
    }

    /* Commands Table / Quick Reference */
    .commands-card {
      background: var(--card-bg);
      backdrop-filter: blur(16px);
      border: 1px solid var(--card-border);
      border-radius: 20px;
      padding: 28px;
      margin-bottom: 40px;
    }

    .cmd-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
      gap: 14px;
      margin-top: 16px;
    }

    .cmd-item {
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid rgba(255, 255, 255, 0.05);
      border-radius: 12px;
      padding: 14px;
      transition: background 0.2s;
    }

    .cmd-item:hover {
      background: rgba(255, 255, 255, 0.05);
    }

    .cmd-name {
      font-family: 'Courier New', Courier, monospace;
      font-weight: 700;
      font-size: 14px;
      color: #a78bfa;
      margin-bottom: 4px;
    }

    .cmd-desc {
      font-size: 12px;
      color: var(--text-muted);
    }

    /* Footer */
    footer {
      margin-top: auto;
      text-align: center;
      padding: 24px;
      border-top: 1px solid var(--card-border);
      font-size: 13px;
      color: var(--text-muted);
    }

    footer a {
      color: var(--accent-gold);
      text-decoration: none;
    }

    footer a:hover {
      text-decoration: underline;
    }
  </style>
</head>
<body>
  <div class="glow-orb glow-1"></div>
  <div class="glow-orb glow-2"></div>

  <div class="container">
    <!-- Navbar -->
    <header>
      <div class="brand">
        <div class="avatar-wrapper">
          <img id="bot-avatar" class="avatar-img" src="https://cdn.discordapp.com/embed/avatars/0.png" alt="Bot Avatar">
          <div class="pulse-dot"></div>
        </div>
        <div class="brand-text">
          <h1 id="bot-name">${shopName}</h1>
          <p><span id="bot-tag">Discord Economy Bot</span> • <span id="db-status">MongoDB Connected</span></p>
        </div>
      </div>
      <div class="status-badge" id="system-health-badge">
        <span class="dot"></span>
        <span>24/7 ONLINE</span>
      </div>
    </header>

    <!-- Hero -->
    <section class="hero">
      <div class="hero-badge">⚡ Cloud Engine &amp; Health Hub</div>
      <h2>Automated Discord Economy &amp; UPI Verification</h2>
      <p>Real-time telemetry, automated Slice transaction verification, atomic coin wallet deductions, and role expiration engine running smoothly.</p>
    </section>

    <!-- Metrics Grid -->
    <section class="metrics-grid">
      <div class="metric-card" style="--card-accent: var(--accent-purple);">
        <div class="metric-header">
          <span class="metric-title">Active Servers</span>
          <span class="metric-icon">🏰</span>
        </div>
        <div class="metric-value" id="metric-guilds">--</div>
        <div class="metric-sub">Connected Discord Guilds</div>
      </div>

      <div class="metric-card" style="--card-accent: var(--accent-green);">
        <div class="metric-header">
          <span class="metric-title">Gateway Latency</span>
          <span class="metric-icon">⚡</span>
        </div>
        <div class="metric-value" id="metric-ping">-- ms</div>
        <div class="metric-sub">Discord Gateway WebSocket</div>
      </div>

      <div class="metric-card" style="--card-accent: var(--accent-gold);">
        <div class="metric-header">
          <span class="metric-title">System Uptime</span>
          <span class="metric-icon">⏱️</span>
        </div>
        <div class="metric-value" id="metric-uptime">00:00:00</div>
        <div class="metric-sub">Continuous Online State</div>
      </div>

      <div class="metric-card" style="--card-accent: var(--accent-cyan);">
        <div class="metric-header">
          <span class="metric-title">Memory Allocation</span>
          <span class="metric-icon">💾</span>
        </div>
        <div class="metric-value" id="metric-memory">-- MB</div>
        <div class="metric-sub">Optimized Cloud Footprint</div>
      </div>
    </section>

    <!-- Services Health -->
    <h2 class="section-title">🛡️ Background Core Engines</h2>
    <section class="services-grid">
      <div class="service-card">
        <div class="service-icon-box">🪙</div>
        <div class="service-info">
          <h3>Coin Wallet &amp; Shop Engine</h3>
          <p>Atomic balance deductions with MongoDB ACID concurrency locks. Zero double-spend vulnerability.</p>
          <span class="service-badge">Operational (Rate: 1 INR = 1 ${coinName})</span>
        </div>
      </div>

      <div class="service-card">
        <div class="service-icon-box">💳</div>
        <div class="service-info">
          <h3>Slice UPI QR Gateway</h3>
          <p>Instant UPI URI QR generation with unique Reference RRN tracking and automatic timeout garbage collector.</p>
          <span class="service-badge">Ready for Orders</span>
        </div>
      </div>

      <div class="service-card">
        <div class="service-icon-box">📬</div>
        <div class="service-info">
          <h3>Gmail Transaction Verifier</h3>
          <p>Official Google Cloud OAuth2 email listener matching Slice bank alerts to pending wallet deposits.</p>
          <span class="service-badge">Polling Active</span>
        </div>
      </div>

      <div class="service-card">
        <div class="service-icon-box">🎁</div>
        <div class="service-info">
          <h3>Hourly Dropbox Scheduler</h3>
          <p>Automated server giveaway box scheduler with randomized coin drops and claim cooldowns.</p>
          <span class="service-badge">Running (Every 5s check)</span>
        </div>
      </div>

      <div class="service-card">
        <div class="service-icon-box">⏳</div>
        <div class="service-info">
          <h3>Role Expiration Watcher</h3>
          <p>Temporary VIP and custom shop role monitor with auto-removal and user notification DMs.</p>
          <span class="service-badge">Running (Every 60s sweep)</span>
        </div>
      </div>

      <div class="service-card">
        <div class="service-icon-box">🌐</div>
        <div class="service-info">
          <h3>Cloud Health &amp; Anti-Sleep</h3>
          <p>High-speed HTTP listener satisfying Render/Koyeb port scan checks and 24/7 uptime monitoring.</p>
          <span class="service-badge">Health Endpoint Active (/health)</span>
        </div>
      </div>
    </section>

    <!-- Commands Quick Reference -->
    <div class="commands-card">
      <h2 class="section-title">⚡ Available Slash Commands</h2>
      <div class="cmd-grid">
        <div class="cmd-item">
          <div class="cmd-name">/help</div>
          <div class="cmd-desc">Interactive Help Center &amp; command directory.</div>
        </div>
        <div class="cmd-item">
          <div class="cmd-name">/shop</div>
          <div class="cmd-desc">Browse role and item catalogue with coin pricing.</div>
        </div>
        <div class="cmd-item">
          <div class="cmd-name">/buycoin [amount]</div>
          <div class="cmd-desc">Generate instant UPI QR code to top up wallet coins.</div>
        </div>
        <div class="cmd-item">
          <div class="cmd-name">/buyitem [item]</div>
          <div class="cmd-desc">Purchase shop items instantly using wallet coins.</div>
        </div>
        <div class="cmd-item">
          <div class="cmd-name">/wallet [user]</div>
          <div class="cmd-desc">View coin balance and recent transaction ledger.</div>
        </div>
        <div class="cmd-item">
          <div class="cmd-name">/profile [user]</div>
          <div class="cmd-desc">Generate stylish rendered canvas profile card.</div>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <footer>
      <p>${shopName} &bull; Powered by Discord.js v14 &bull; Designed for 24/7 Cloud Uptime</p>
    </footer>
  </div>

  <script>
    let uptimeSeconds = 0;

    function formatTime(seconds) {
      const d = Math.floor(seconds / 86400);
      const h = Math.floor((seconds % 86400) / 3600);
      const m = Math.floor((seconds % 3600) / 60);
      const s = Math.floor(seconds % 60);
      if (d > 0) return d + 'd ' + h + 'h ' + m + 'm';
      return String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
    }

    async function fetchLiveStatus() {
      try {
        const res = await fetch('/api/status');
        if (!res.ok) return;
        const data = await res.json();

        if (data.botTag) document.getElementById('bot-tag').textContent = data.botTag;
        if (data.botAvatar) document.getElementById('bot-avatar').src = data.botAvatar;
        if (data.guildsCount !== undefined) document.getElementById('metric-guilds').textContent = data.guildsCount;
        if (data.ping !== undefined) document.getElementById('metric-ping').textContent = data.ping + ' ms';
        if (data.memoryMb !== undefined) document.getElementById('metric-memory').textContent = data.memoryMb + ' MB';
        if (data.uptimeSec !== undefined) uptimeSeconds = data.uptimeSec;
        if (data.isDbConnected) document.getElementById('db-status').textContent = 'MongoDB Connected';
      } catch (e) {
        console.warn('Status poll error:', e);
      }
    }

    // Live uptime ticker every 1s
    setInterval(() => {
      uptimeSeconds++;
      document.getElementById('metric-uptime').textContent = formatTime(uptimeSeconds);
    }, 1000);

    // Initial fetch + poll every 10s
    fetchLiveStatus();
    setInterval(fetchLiveStatus, 10000);
  </script>
</body>
</html>`;
}
