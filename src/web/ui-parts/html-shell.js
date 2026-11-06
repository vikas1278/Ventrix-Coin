// HTML Head and Body Shell
export function getHeadOpen({ shopName }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${shopName} — Server Control Hub</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@500;600;700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;600;700&display=swap" rel="stylesheet">
  <script>
    (function() {
      try {
        var s = localStorage.getItem('vyntrix_theme');
        var t = s || (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
        document.documentElement.setAttribute('data-theme', t);
      } catch(e) {}
    })();
  </script>`;
}

export function getBodyOpen({ ICONS, session, isAdmin, isOwner }) {
  return `<body>
  <!-- Ambient 3D Aurora Mesh Background -->
  <div class="ambient-glow ambient-glow-1"></div>
  <div class="ambient-glow ambient-glow-2"></div>
  <div class="ambient-glow ambient-glow-3"></div>
  <div class="cyber-grid"></div>

  <div class="app-shell">
    <div class="sidebar-backdrop" id="sidebar-backdrop" onclick="toggleSidebar(true)"></div>
    <!-- ─── FIXED LEFT SIDEBAR (OFF-CANVAS ON MOBILE) ─── -->
    <aside class="app-sidebar">
      <div class="sidebar-mobile-header">
        <span style="font-size: 13px; font-weight: 800; color: #c084fc; letter-spacing: 0.05em;">VENTRIX MENU</span>
        <button class="sidebar-mobile-close-btn" onclick="toggleSidebar(true)" title="Close Menu">✕</button>
      </div>
      <div class="sidebar-brand">
        <div class="sidebar-coin-badge">
          <img src="/assets/vyntrix-coin.png" alt="V Coin" class="sidebar-coin-img">
        </div>
        <div>
          <div class="sidebar-brand-name">VENTRIX COIN</div>
          <div class="sidebar-brand-subtitle" id="sidebar-sub-label" style="font-size: 11px; color: #94a3b8; font-weight: 600;">Bot Owner Hub</div>
        </div>
      </div>

      <nav class="sidebar-nav">
        <button class="nav-btn active" id="nav-btn-dashboard" onclick="switchTab('dashboard-tab')">
          <span class="nav-icon">${ICONS.dashboard}</span>
          <span>Dashboard</span>
        </button>
        <button class="nav-btn" id="nav-btn-wallet" onclick="switchTab('wallet-tab')">
          <span class="nav-icon">${ICONS.wallet}</span>
          <span>Server Wallet</span>
        </button>
        <button class="nav-btn" id="nav-btn-shop" onclick="switchTab('shop-tab')">
          <span class="nav-icon">${ICONS.cart}</span>
          <span>Shop Items</span>
        </button>
        <button class="nav-btn" id="nav-btn-orders" onclick="switchTab('orders-tab')">
          <span class="nav-icon">${ICONS.package}</span>
          <span>Orders</span>
        </button>
        <button class="nav-btn" id="nav-btn-transactions" onclick="switchTab('transactions-tab')">
          <span class="nav-icon">${ICONS.chart}</span>
          <span>Transactions</span>
        </button>
        <button class="nav-btn ${isAdmin ? '' : 'is-hidden'}" id="nav-btn-admin" style="display: ${isAdmin ? 'flex' : 'none'} !important;" onclick="switchTab('admin-tab')">
          <span class="nav-icon">${ICONS.shield}</span>
          <span>Server Admin</span>
        </button>
        ${isOwner ? `
        <button class="nav-btn" id="nav-btn-owner" onclick="switchTab('owner-tab')">
          <span class="nav-icon">${ICONS.crown}</span>
          <span>Bot Owner Hub</span>
        </button>
        ` : ''}
      </nav>

      <!-- Bottom Cosmic Corner Wave Backdrop -->
      <div class="sidebar-cosmic-glow">
        <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M-30 190 C 20 150, 60 110, 110 130 C 160 150, 150 70, 210 30" stroke="url(#sbG1)" stroke-width="2" opacity="0.6"/>
          <path d="M-10 200 C 40 160, 80 130, 130 150 C 180 170, 170 90, 230 60" stroke="url(#sbG2)" stroke-width="1.5" opacity="0.4"/>
          <defs>
            <linearGradient id="sbG1" x1="0" y1="1" x2="1" y2="0">
              <stop offset="0%" stop-color="#38bdf8"/>
              <stop offset="50%" stop-color="#c084fc"/>
              <stop offset="100%" stop-color="#f43f5e"/>
            </linearGradient>
            <linearGradient id="sbG2" x1="0" y1="1" x2="1" y2="0">
              <stop offset="0%" stop-color="#818cf8"/>
              <stop offset="100%" stop-color="#c084fc"/>
            </linearGradient>
          </defs>
        </svg>
      </div>

      <div class="sidebar-footer" style="position: relative; z-index: 2; margin-top: auto;">
        <button class="nav-btn" id="nav-btn-settings" onclick="switchTab('settings-tab')">
          <span class="nav-icon">${ICONS.gear}</span>
          <span>Settings</span>
        </button>
      </div>
    </aside>

    <!-- ─── MAIN CONTENT WRAPPER ─── -->
    <div class="app-main">
      <!-- ─── TOP HEADER BAR ─── -->
      <header class="app-header">
        <div style="display: flex; align-items: center; gap: 14px; flex: 1; min-width: 0;">
          <button class="header-sidebar-toggle" onclick="toggleSidebar()" title="Toggle Sidebar">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>

          <!-- Server Selector Pill -->
          <div class="header-server-pill" id="header-server-selector-pill">
            <div class="header-server-avatar-circle" id="header-server-avatar-box">
              <span id="header-server-initials">CW</span>
              <img id="header-server-avatar-img" src="" alt="Icon" style="display: none; width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">
            </div>
            <span class="status-dot-green"></span>
            <div class="header-server-text-wrap">
              <div class="header-server-name-label" id="header-server-display-name">Computer World</div>
              <div class="header-server-members-label" id="header-server-display-members">8 Members</div>
            </div>
            <span class="header-server-chevron">⌵</span>
            <select id="server-select" class="header-server-select-hidden" onchange="changeActiveServer(this.value)">
              <option value="">Loading servers...</option>
            </select>
          </div>
        </div>

        <!-- Right Header Actions -->
        <div class="header-right-actions">
          <div class="header-profile-pill">
            <img class="profile-avatar" src="${session.avatar}" alt="Avatar">
            <span class="profile-username">${session.username}</span>
            <span class="profile-role-tag" id="header-profile-tier-tag" style="background: linear-gradient(135deg, rgba(244, 63, 94, 0.25), rgba(249, 115, 22, 0.3)); border-color: rgba(244, 63, 94, 0.5); color: #fda4af; box-shadow: 0 0 10px rgba(244, 63, 94, 0.3);">
              👑 OWNER
            </span>
          </div>

          <div class="theme-switch-pill" onclick="toggleTheme()" title="Switch Light/Dark Mode">
            <span class="theme-pill-icon" id="theme-pill-sun">${ICONS.sun}</span>
            <span class="theme-pill-icon active-theme-pill" id="theme-pill-moon">${ICONS.moon}</span>
          </div>

          <a href="/auth/logout" class="header-logout-btn" title="Sign Out">
            ${ICONS.logout}
          </a>
        </div>
      </header>

      <!-- ─── TAB CONTENTS AREA ─── -->
      <main class="app-content">
`;
}
