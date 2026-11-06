// Dashboard Tab HTML
export function getDashboardTabHtml({ session, initialTheme, ICONS }) {
  return `
        <!-- TAB 1: DASHBOARD -->
        <div id="dashboard-tab" class="tab-content active">

          <!-- ROW 1: COSMIC HERO (FULL WIDTH) -->
          <div class="dash-hero-grid">
            <!-- Hero Cosmic Card -->
            <div class="hero-cosmic-card">
              <span class="floating-crystal crystal-1">💎</span>
              <span class="floating-crystal crystal-2">✨</span>
              <span class="floating-crystal crystal-3">🔮</span>

              <div class="hero-cosmic-content">
                <div class="hero-greeting">Good to see you,</div>
                <div class="hero-username-title">${session.username} 👑</div>
                <div class="hero-subtitle">
                  Manage your server economy, shop items, orders and coin transactions — all in one place.
                </div>
                <div class="hero-meta-pills">
                  <span class="hero-pill">
                    <svg style="width: 15px; height: 15px;" viewBox="0 0 127.14 96.36" fill="#5865F2">
                      <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,45.91,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,45.91,96.12,53,91.08,65.69,84.69,65.69Z"/>
                    </svg>
                    <span id="dash-guild-name">Ventrix Official</span>
                  </span>
                  <span class="hero-pill">
                    <span style="font-size: 14px;">👥</span>
                    <span id="dash-member-count">5 Members</span>
                  </span>
                  <span class="hero-pill tier-hero-pill" id="dash-user-tier-pill" style="cursor: pointer; display: inline-flex; align-items: center; gap: 6px; background: ${initialTheme.bg}; border-color: ${initialTheme.border}; color: ${initialTheme.text}; box-shadow: 0 0 10px ${initialTheme.glow};" onclick="switchTab('wallet-tab')" title="View Top Up Perks Lvl">
                    <span id="dash-tier-icon">${initialTheme.icon}</span>
                    <span id="dash-tier-label" style="font-weight: 700;">${initialTheme.label} TIER</span>
                  </span>
                </div>
              </div>

              <!-- Radiant Central 3D V-Coin with Neon Orbital Rings -->
              <div class="hero-orbital-center">
                <div class="orbital-glow-core"></div>
                <div class="orbital-ring ring-1"></div>
                <div class="orbital-ring ring-2"></div>
                <img src="/assets/vyntrix-coin.png" alt="Ventrix Coin" class="hero-orbital-coin">
              </div>
            </div>
          </div>

          <!-- ROW 2: 4 METRIC CARDS -->
          <div class="metrics-grid">
            <!-- 1: Server Coin Balance -->
            <div class="metric-card metric-gold">
              <div class="metric-left-icon">
                <img src="/assets/vyntrix-coin.png" alt="Coin" class="metric-coin-img">
              </div>
              <div class="metric-body">
                <div class="metric-label-row">
                  <span>Server Coin Balance</span>
                  <span class="metric-eye" onclick="toggleBalanceVisibility()" title="Toggle Balance">👁</span>
                </div>
                <div class="metric-value-row">
                  <span class="metric-num gold-text" id="dash-balance-val">0</span>
                  <span class="metric-unit">VCoins</span>
                </div>
                <div class="metric-subtext">In <span class="dash-curr-server">Ventrix Official</span></div>
              </div>
            </div>

            <!-- 2: Total Servers -->
            <div class="metric-card metric-blue">
              <div class="metric-left-icon icon-blue-bg">
                <span style="font-size: 20px;">👥</span>
              </div>
              <div class="metric-body">
                <div class="metric-label-row">
                  <span>Total Servers</span>
                </div>
                <div class="metric-value-row">
                  <span class="metric-num white-text" id="dash-total-servers">1</span>
                </div>
                <div class="metric-subtext">Across all connected servers</div>
              </div>
            </div>

            <!-- 3: Active Shop Items -->
            <div class="metric-card metric-cyan">
              <div class="metric-left-icon icon-cyan-bg">
                <span style="font-size: 20px;">🛒</span>
              </div>
              <div class="metric-body">
                <div class="metric-label-row">
                  <span>Active Shop Items</span>
                </div>
                <div class="metric-value-row">
                  <span class="metric-num cyan-text" id="dash-items-count">0</span>
                </div>
                <div class="metric-subtext">Roles &amp; digital perks</div>
              </div>
            </div>

            <!-- 4: Total Orders -->
            <div class="metric-card metric-magenta">
              <div class="metric-left-icon icon-magenta-bg">
                <span style="font-size: 20px;">📦</span>
              </div>
              <div class="metric-body">
                <div class="metric-label-row">
                  <span>Total Orders</span>
                </div>
                <div class="metric-value-row">
                  <span class="metric-num magenta-text" id="dash-orders-count">0</span>
                </div>
                <div class="metric-subtext">Completed purchases</div>
              </div>
            </div>
          </div>

          <!-- ROW 3: TOP UP BANNER CARD -->
          <div class="topup-banner-card">
            <div class="topup-banner-left">
              <div class="topup-coins-stack">
                <img src="/assets/vyntrix-coin.png" alt="Gold Coins" class="banner-coins-img">
              </div>
              <div>
                <div class="topup-banner-title">Top Up Coins for this Server</div>
                <div class="topup-banner-subtitle">Add VCoins to manage your shop, rewards and server economy.</div>
              </div>
            </div>
            <div class="topup-banner-right">
              <span style="font-size: 28px; color: #f59e0b; opacity: 0.85;">↗</span>
              <button class="btn-topup-gold-glow" onclick="openTopUpModal()">
                ${ICONS.zap} Top Up Now
              </button>
            </div>
          </div>

          <!-- ROW 4: FEATURED SHOP ITEMS (RECENTLY ADDED) -->
          <div class="shelf-grid">
            <div class="shelf-card">
              <div class="shelf-header">
                <div class="shelf-header-left">
                  <div class="shelf-header-icon">${ICONS.cart}</div>
                  <div>
                    <div class="shelf-title">Featured Shop Items</div>
                    <div class="shelf-subtitle">Recently added items in <span class="dash-curr-server">Ventrix Official</span></div>
                  </div>
                </div>
                <button class="shelf-action-pill" onclick="switchTab('shop-tab')">View All &rarr;</button>
              </div>

              <div id="dash-featured-products" class="featured-products-grid">
                <div style="grid-column: 1 / -1; text-align: center; padding: 32px 16px; color: var(--muted);">
                  <div style="font-size: 28px; margin-bottom: 8px;">🛍️</div>
                  <div style="font-size: 13px;">Loading recently added items...</div>
                </div>
              </div>
            </div>
          </div>

          <!-- ROW 5: 4 QUICK NAVIGATION ACTION CARDS -->
          <div class="quick-nav-cards-grid">
            <div class="quick-nav-card" onclick="switchTab('wallet-tab')">
              <div class="quick-nav-icon-box q-blue">${ICONS.wallet}</div>
              <div class="quick-nav-text">
                <div class="q-title">Server Wallet</div>
                <div class="q-desc">View and manage balance</div>
              </div>
              <span class="q-arrow">&rarr;</span>
            </div>

            <div class="quick-nav-card" onclick="switchTab('shop-tab')">
              <div class="quick-nav-icon-box q-cyan">${ICONS.cart}</div>
              <div class="quick-nav-text">
                <div class="q-title">Shop Catalogue</div>
                <div class="q-desc">Browse shop items</div>
              </div>
              <span class="q-arrow">&rarr;</span>
            </div>

            <div class="quick-nav-card" onclick="switchTab('orders-tab')">
              <div class="quick-nav-icon-box q-green">${ICONS.package}</div>
              <div class="quick-nav-text">
                <div class="q-title">Order History</div>
                <div class="q-desc">Track your purchases</div>
              </div>
              <span class="q-arrow">&rarr;</span>
            </div>

            <div class="quick-nav-card" onclick="switchTab('transactions-tab')">
              <div class="quick-nav-icon-box q-purple">${ICONS.scroll}</div>
              <div class="quick-nav-text">
                <div class="q-title">Transaction Ledger</div>
                <div class="q-desc">View all coin movements</div>
              </div>
              <span class="q-arrow">&rarr;</span>
            </div>
          </div>
        </div>

    <!-- TAB 2: SERVER WALLET (Exact Reference Image Pixel-Perfect Implementation) -->
  `;
}
