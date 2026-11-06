// Wallet Tab HTML
export function getWalletTabHtml({ initialTheme }) {
  return `
    <div id="wallet-tab" class="tab-content">
      <!-- 1. WALLET BALANCE HERO CARD -->
      <div class="wallet-hero-card">
        <!-- Header & Server Info Row -->
        <div class="wallet-header-row">
          <div class="wallet-header-left">
            <div class="wallet-header-icon-box">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4"></path>
                <path d="M4 6v12a2 2 0 0 0 2 2h14v-4"></path>
                <circle cx="18" cy="14" r="1.5"></circle>
              </svg>
            </div>
            <div>
              <h1 class="wallet-header-title">Server Wallet</h1>
              <div class="wallet-header-subtitle">Your coin balance and wallet management for this server</div>
            </div>
          </div>

          <!-- Informational Server Badge (No dropdown, no switching controls) -->
          <div class="wallet-server-badge">
            <div class="wallet-server-logo-wrap">
              <img id="wallet-header-server-icon" src="" alt="Server Logo" class="wallet-server-logo" style="display: none;" onerror="this.style.display='none'; document.getElementById('wallet-header-server-fallback').style.display='flex';">
              <div id="wallet-header-server-fallback" style="display: flex; width: 100%; height: 100%; align-items: center; justify-content: center; color: #fff;">
                <svg width="22" height="22" viewBox="0 0 127.14 96.36" fill="#fff">
                  <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,45.91,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,45.91,96.12,53,91.08,65.69,84.69,65.69Z"/>
                </svg>
              </div>
            </div>
            <div>
              <div id="wallet-header-server-name" class="wallet-server-name">Selected Server</div>
              <div id="wallet-header-server-members" class="wallet-server-members">-- members</div>
            </div>
          </div>
        </div>

        <!-- Wallet Balance Hero & Actions Row -->
        <div class="wallet-hero-body">
          <div class="wallet-hero-left">
            <div class="wallet-pedestal-artwork">
              <img src="/assets/vyntrix-coin-hero.png?v=${Date.now()}" alt="Vyntrix Coin Pedestal" class="wallet-pedestal-img">
            </div>
            <div class="wallet-balance-box">
              <div class="wallet-balance-heading">
                Current Balance <span class="wallet-info-dot" title="Active balance in this server">i</span>
                <span id="wallet-tier-badge" class="wallet-tier-badge" style="background: ${initialTheme.bg}; border-color: ${initialTheme.border}; color: ${initialTheme.text}; box-shadow: 0 0 10px ${initialTheme.glow};" title="Your Current Membership Tier">
                  <span id="wallet-tier-badge-icon">${initialTheme.icon}</span>
                  <span id="wallet-tier-badge-text">${initialTheme.label}</span>
                </span>
              </div>
              <div class="wallet-balance-val-row">
                <span id="user-balance-val" class="wallet-balance-num">--</span>
              </div>
              <div id="wallet-tier-progress-sub" class="wallet-tier-progress-sub" style="display: none;">
                <div class="wallet-tier-prog-bar-wrap">
                  <div id="wallet-tier-prog-bar-fill" class="wallet-tier-prog-bar-fill" style="width: 0%;"></div>
                </div>
                <div id="wallet-tier-prog-text" class="wallet-tier-prog-text">Loading tier progress...</div>
              </div>
            </div>
          </div>

          <div class="wallet-hero-actions">
            <!-- Top Up Coins Card -->
            <div class="wallet-action-card wallet-action-topup" onclick="openTopUpModal()">
              <div class="wallet-action-icon wallet-icon-purple">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
              </div>
              <div>
                <div class="wallet-action-title">Top Up Coins</div>
                <div class="wallet-action-desc">Add coins to your server wallet</div>
              </div>
              <div class="wallet-action-arrow">→</div>
            </div>

            <!-- Browse Shop Card -->
            <div class="wallet-action-card wallet-action-shop" onclick="switchTab('shop-tab')">
              <div class="wallet-action-icon wallet-icon-blue">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="9" cy="21" r="1"></circle>
                  <circle cx="20" cy="21" r="1"></circle>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                </svg>
              </div>
              <div>
                <div class="wallet-action-title">Browse Shop</div>
                <div class="wallet-action-desc">Use coins to buy roles &amp; items</div>
              </div>
              <div class="wallet-action-arrow">→</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 2. MEMBERSHIP TIERS & BALANCE THRESHOLDS ROADMAP -->
      <div class="wallet-tiers-card">
        <div class="wallet-tiers-card-header">
          <div class="wallet-tiers-header-left">
            <div class="wallet-tiers-icon-box">
              <span style="font-size: 20px;">🏆</span>
            </div>
            <div>
              <div class="wallet-tiers-title">Top Up Perks Lvl</div>
            </div>
          </div>
          <div class="wallet-tiers-header-right">
            <button class="wallet-btn-topup-tier" onclick="openTopUpModal()">
              ⚡ Top Up to Unlock Next Tier
            </button>
          </div>
        </div>

        <!-- Tiers Grid (5 Tiers: Member, VIP, Silver, Gold, Diamond) -->
        <div class="membership-tiers-grid">
          <!-- Tier 1: Member -->
          <div class="tier-card tier-card-member" id="tier-card-member">
            <div class="tier-card-top">
              <div class="tier-card-badge">👤 MEMBER</div>
              <span class="tier-status-pill pill-current" id="tier-pill-member">Active</span>
            </div>
            <div class="tier-card-balance">0+</div>
          </div>

          <!-- Tier 2: VIP -->
          <div class="tier-card tier-card-vip" id="tier-card-vip">
            <div class="tier-card-top">
              <div class="tier-card-badge">⭐ VIP</div>
              <span class="tier-status-pill pill-locked" id="tier-pill-vip">Locked</span>
            </div>
            <div class="tier-card-balance"><span id="tier-threshold-vip">100</span>+</div>
          </div>

          <!-- Tier 3: Silver -->
          <div class="tier-card tier-card-silver" id="tier-card-silver">
            <div class="tier-card-top">
              <div class="tier-card-badge">🥈 SILVER</div>
              <span class="tier-status-pill pill-locked" id="tier-pill-silver">Locked</span>
            </div>
            <div class="tier-card-balance"><span id="tier-threshold-silver">500</span>+</div>
          </div>

          <!-- Tier 4: Gold -->
          <div class="tier-card tier-card-gold" id="tier-card-gold">
            <div class="tier-card-top">
              <div class="tier-card-badge">🥇 GOLD</div>
              <span class="tier-status-pill pill-locked" id="tier-pill-gold">Locked</span>
            </div>
            <div class="tier-card-balance"><span id="tier-threshold-gold">2,000</span>+</div>
          </div>

          <!-- Tier 5: Diamond -->
          <div class="tier-card tier-card-diamond" id="tier-card-diamond">
            <div class="tier-card-top">
              <div class="tier-card-badge">💎 DIAMOND</div>
              <span class="tier-status-pill pill-locked" id="tier-pill-diamond">Locked</span>
            </div>
            <div class="tier-card-balance"><span id="tier-threshold-diamond">5,000</span>+</div>
          </div>
        </div>
      </div>

      <!-- 3. PURCHASED ITEMS / SERVER INVENTORY TABLE CARD -->
      <div class="wallet-tx-card wallet-inventory-card">
        <div class="admin-card-header" style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; flex-wrap: wrap; gap: 12px;">
          <div class="admin-card-header-left" style="display: flex; align-items: center; gap: 14px;">
            <div class="wallet-header-icon-box" style="width: 42px; height: 42px; background: rgba(139, 92, 246, 0.16); border: 1px solid rgba(139, 92, 246, 0.35); border-radius: 12px; display: flex; align-items: center; justify-content: center; color: #c084fc;">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <path d="M16 10a4 4 0 0 1-8 0"></path>
              </svg>
            </div>
            <div>
              <div style="display: flex; align-items: center; gap: 10px;">
                <h2 class="wallet-header-title" style="font-size: 18px; margin: 0;">Purchased Items</h2>
                <span id="wallet-inv-count-badge" class="inv-count-badge">0 Items</span>
              </div>
              <div class="wallet-header-subtitle">Your purchased items &amp; roles in <span class="wallet-curr-server">this server</span> • /item list</div>
            </div>
          </div>
          <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
            <button class="wallet-btn-view-all" onclick="refreshInventory()" title="Refresh Inventory" style="padding: 7px 12px;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>
              <span>Refresh</span>
            </button>
            <button class="wallet-btn-view-all" onclick="switchTab('transactions-tab')" title="View Coin Transactions" style="padding: 7px 12px;">
              <span>Transactions</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
            </button>
            <button class="wallet-btn-view-all" onclick="switchTab('shop-tab')" style="background: linear-gradient(135deg, rgba(139, 92, 246, 0.28), rgba(59, 130, 246, 0.28)); border-color: rgba(139, 92, 246, 0.55); color: #fff;">
              <span>🛒 Browse Shop</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
            </button>
          </div>
        </div>

        <div class="table-responsive">
          <table class="wallet-table">
            <thead>
              <tr>
                <th style="min-width: 250px;">ITEM / BENEFIT</th>
                <th style="min-width: 140px;">TYPE &amp; DURATION</th>
                <th style="min-width: 130px;">PURCHASED</th>
                <th style="min-width: 120px;">STATUS</th>
                <th style="min-width: 160px;">EXPIRATION</th>
                <th style="min-width: 130px; text-align: center;">ACTION</th>
              </tr>
            </thead>
            <tbody id="wallet-inventory-tbody">
              <tr><td colspan="6" style="text-align: center; color: var(--muted); padding: 36px 14px;">Loading server inventory...</td></tr>
            </tbody>
          </table>
        </div>
        <!-- Hidden fallback element for any legacy transaction queries -->
        <tbody id="wallet-recent-transactions-tbody" style="display: none;"></tbody>
      </div>
    </div>

    <!-- TAB 3: SHOP ITEMS (PIXEL-PERFECT REPRODUCTION OF REFERENCE SAAS UI) -->
  `;
}
