// Owner Tab HTML
export function getOwnerTabHtml({ isOwner, ICONS }) {
  return `
    <!-- TAB 7: BOT OWNER HUB -->
    ${isOwner
      ? `
    <div id="owner-tab" class="tab-content">
      <!-- 1. HERO BANNER: BOT OWNER OVERWATCH & INFRASTRUCTURE HUB -->
      <div class="owner-hub-hero">
        <div class="owner-hero-content">
          <div class="owner-hero-left">
            <div class="owner-hero-crown-box">
              <span class="owner-crown-emoji">👑</span>
            </div>
            <div class="owner-hero-text">
              <h1 class="owner-hero-title">
                <span class="owner-title-accent">Bot Owner</span> Overwatch &amp; Infrastructure Hub
              </h1>
              <p class="owner-hero-subtitle">
                Global supervision layer for bot operators. Delegate elevated bot administrator permissions across all servers, monitor active Discord guild clusters in real time, and inspect process memory and gateway heartbeat latency.
              </p>
            </div>
          </div>
          <div class="owner-hero-graphic" aria-hidden="true">
            <!-- 3D Isometric Neon Infrastructure Graphic -->
            <svg class="isometric-cluster-svg" viewBox="0 0 340 180" fill="none" xmlns="http://www.w3.org/2000/svg">
              <!-- Grid base plane -->
              <g opacity="0.45">
                <path d="M170 160 L320 85 L170 10 L20 85 Z" stroke="url(#grid-line)" stroke-width="1.2" stroke-dasharray="4 4" fill="url(#grid-fill)"/>
                <path d="M70 60 L220 135" stroke="rgba(139, 92, 246, 0.3)" stroke-width="1"/>
                <path d="M120 35 L270 110" stroke="rgba(139, 92, 246, 0.3)" stroke-width="1"/>
                <path d="M220 35 L70 110" stroke="rgba(56, 189, 248, 0.3)" stroke-width="1"/>
                <path d="M270 60 L120 135" stroke="rgba(56, 189, 248, 0.3)" stroke-width="1"/>
              </g>

              <!-- Central Main Server Rack (3D Isometric) -->
              <g transform="translate(130, 20)">
                <!-- Left Face -->
                <polygon points="40,25 0,48 0,110 40,88" fill="#1e1b4b" stroke="#8b5cf6" stroke-width="1.2"/>
                <!-- Right Face -->
                <polygon points="40,25 80,48 80,110 40,88" fill="#0f172a" stroke="#6366f1" stroke-width="1.2"/>
                <!-- Top Face -->
                <polygon points="40,0 80,23 40,46 0,23" fill="#312e81" stroke="#a855f7" stroke-width="1.2"/>
                
                <!-- Server Blade Slots & LED pulses -->
                <line x1="8" y1="58" x2="34" y2="72" stroke="#38bdf8" stroke-width="2.5" stroke-linecap="round"/>
                <circle cx="12" cy="60" r="1.5" fill="#38bdf8" filter="url(#glow-blue)"/>
                <circle cx="28" cy="69" r="1.5" fill="#34d399" filter="url(#glow-green)"/>

                <line x1="8" y1="72" x2="34" y2="86" stroke="#818cf8" stroke-width="2.5" stroke-linecap="round"/>
                <circle cx="12" cy="74" r="1.5" fill="#c084fc" filter="url(#glow-purple)"/>
                <circle cx="28" cy="83" r="1.5" fill="#38bdf8" filter="url(#glow-blue)"/>

                <line x1="8" y1="86" x2="34" y2="100" stroke="#a855f7" stroke-width="2.5" stroke-linecap="round"/>
                <circle cx="12" cy="88" r="1.5" fill="#fbbf24" filter="url(#glow-amber)"/>
                <circle cx="28" cy="97" r="1.5" fill="#34d399" filter="url(#glow-green)"/>

                <!-- Right face detail -->
                <line x1="46" y1="72" x2="72" y2="58" stroke="rgba(99, 102, 241, 0.4)" stroke-width="2" stroke-linecap="round"/>
                <line x1="46" y1="86" x2="72" y2="72" stroke="rgba(99, 102, 241, 0.4)" stroke-width="2" stroke-linecap="round"/>
                <line x1="46" y1="100" x2="72" y2="86" stroke="rgba(99, 102, 241, 0.4)" stroke-width="2" stroke-linecap="round"/>
              </g>

              <!-- Left Auxiliary Node (3D Isometric) -->
              <g transform="translate(60, 50)">
                <polygon points="30,18 0,35 0,80 30,64" fill="#090d16" stroke="#38bdf8" stroke-width="1.2"/>
                <polygon points="30,18 60,35 60,80 30,64" fill="#0f172a" stroke="#0284c7" stroke-width="1.2"/>
                <polygon points="30,0 60,17 30,34 0,17" fill="#0369a1" stroke="#38bdf8" stroke-width="1.2"/>
                <line x1="6" y1="44" x2="24" y2="54" stroke="#38bdf8" stroke-width="2" stroke-linecap="round"/>
                <circle cx="9" cy="46" r="1.2" fill="#38bdf8"/>
                <line x1="6" y1="56" x2="24" y2="66" stroke="#34d399" stroke-width="2" stroke-linecap="round"/>
                <circle cx="9" cy="58" r="1.2" fill="#34d399"/>
              </g>

              <!-- Right Auxiliary Node (3D Isometric) -->
              <g transform="translate(220, 50)">
                <polygon points="30,18 0,35 0,80 30,64" fill="#180d2c" stroke="#c084fc" stroke-width="1.2"/>
                <polygon points="30,18 60,35 60,80 30,64" fill="#0f172a" stroke="#9333ea" stroke-width="1.2"/>
                <polygon points="30,0 60,17 30,34 0,17" fill="#581c87" stroke="#c084fc" stroke-width="1.2"/>
                <line x1="6" y1="44" x2="24" y2="54" stroke="#e879f9" stroke-width="2" stroke-linecap="round"/>
                <circle cx="21" cy="52" r="1.2" fill="#f43f5e"/>
                <line x1="6" y1="56" x2="24" y2="66" stroke="#c084fc" stroke-width="2" stroke-linecap="round"/>
                <circle cx="21" cy="64" r="1.2" fill="#a855f7"/>
              </g>

              <!-- Neon Holographic Beam & Data Connections -->
              <path d="M90 85 Q 150 120, 170 108 Q 190 95, 250 85" stroke="url(#data-stream)" stroke-width="1.8" fill="none" stroke-linecap="round"/>
              <circle cx="170" cy="108" r="3" fill="#38bdf8" filter="url(#glow-blue)"/>

              <defs>
                <linearGradient id="grid-line" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.8"/>
                  <stop offset="100%" stop-color="#a855f7" stop-opacity="0.8"/>
                </linearGradient>
                <linearGradient id="grid-fill" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stop-color="rgba(56, 189, 248, 0.04)"/>
                  <stop offset="100%" stop-color="rgba(168, 85, 247, 0.08)"/>
                </linearGradient>
                <linearGradient id="data-stream" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stop-color="#38bdf8"/>
                  <stop offset="50%" stop-color="#a855f7"/>
                  <stop offset="100%" stop-color="#34d399"/>
                </linearGradient>
                <filter id="glow-blue" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="2" result="blur" />
                  <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
                <filter id="glow-purple" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="2" result="blur" />
                  <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
                <filter id="glow-green" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="2" result="blur" />
                  <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
                <filter id="glow-amber" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="2" result="blur" />
                  <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
              </defs>
            </svg>
          </div>
        </div>
      </div>

      <!-- 2. SYSTEM TELEMETRY CARDS (4-GRID) -->
      <div class="owner-telemetry-grid">
        <!-- Memory RSS -->
        <div class="owner-stat-card card-rss">
          <div class="owner-stat-icon-wrap icon-blue">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="4" y="4" width="16" height="16" rx="3"/>
              <rect x="9" y="9" width="6" height="6"/>
              <path d="M9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 14h3M1 9h3M1 14h3"/>
            </svg>
          </div>
          <div class="owner-stat-body">
            <div class="owner-stat-label">MEMORY (RSS)</div>
            <div class="owner-stat-value val-blue" id="owner-metric-rss">180 MB</div>
            <div class="owner-stat-progress-wrap">
              <div class="owner-stat-progress-bar">
                <div class="owner-stat-progress-fill fill-blue" id="owner-metric-rss-bar" style="width: 36%;"></div>
              </div>
              <span class="owner-stat-progress-text" id="owner-metric-rss-pct">36%</span>
            </div>
          </div>
        </div>

        <!-- Gateway Ping -->
        <div class="owner-stat-card card-ping">
          <div class="owner-stat-icon-wrap icon-teal">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M5 12.55a11 11 0 0 1 14.08 0"/>
              <path d="M1.42 9a16 16 0 0 1 21.16 0"/>
              <path d="M8.53 16.11a6 6 0 0 1 6.95 0"/>
              <line x1="12" y1="20" x2="12.01" y2="20"/>
            </svg>
          </div>
          <div class="owner-stat-body">
            <div class="owner-stat-label">GATEWAY PING</div>
            <div class="owner-stat-value val-teal" id="owner-metric-ping">323 ms</div>
            <div class="owner-stat-progress-wrap">
              <div class="owner-stat-progress-bar">
                <div class="owner-stat-progress-fill fill-teal" id="owner-metric-ping-bar" style="width: 80%;"></div>
              </div>
              <span class="owner-stat-progress-badge badge-teal" id="owner-metric-ping-badge">Good</span>
            </div>
          </div>
        </div>

        <!-- System Uptime -->
        <div class="owner-stat-card card-uptime">
          <div class="owner-stat-icon-wrap icon-amber">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
          </div>
          <div class="owner-stat-body">
            <div class="owner-stat-label">SYSTEM UPTIME</div>
            <div class="owner-stat-value val-amber" id="owner-metric-uptime">0 min</div>
            <div class="owner-stat-progress-wrap">
              <div class="owner-stat-progress-bar">
                <div class="owner-stat-progress-fill fill-amber" style="width: 100%;"></div>
              </div>
              <span class="owner-stat-progress-badge badge-amber">Running</span>
            </div>
          </div>
        </div>

        <!-- Node.js Version -->
        <div class="owner-stat-card card-node">
          <div class="owner-stat-icon-wrap icon-purple">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
              <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
              <line x1="12" y1="22.08" x2="12" y2="12"/>
            </svg>
          </div>
          <div class="owner-stat-body">
            <div class="owner-stat-label">NODE.JS VERSION</div>
            <div class="owner-stat-value val-purple" id="owner-metric-node">v24.19.0</div>
            <div class="owner-stat-progress-wrap">
              <div style="flex: 1;"></div>
              <span class="owner-stat-progress-badge badge-purple">Latest</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 3. MIDDLE SECTION: GLOBAL BOT ADMINISTRATORS DIRECTORY -->
      <div class="owner-box-card">
        <div class="owner-card-header">
          <div class="owner-header-title-wrap">
            <div class="owner-icon-square icon-square-purple">
              ${ICONS.shield}
            </div>
            <div>
              <h2 class="owner-card-title">Global Bot Administrators Directory</h2>
              <div class="owner-card-subtitle">Manage cross-server elevated operator privileges</div>
            </div>
          </div>
          <button class="btn-owner-add-admin" onclick="openAddAdminModal()">
            <span>+ Add Bot Admin</span>
          </button>
        </div>

        <div class="owner-search-container">
          <span class="owner-search-icon">🔍</span>
          <input type="text" class="owner-input-search" id="owner-admin-search" placeholder="Search admin by ID or username..." oninput="filterOwnerAdmins(this.value)">
        </div>

        <div class="owner-table-wrapper">
          <table class="owner-table">
            <thead>
              <tr>
                <th>USER ID</th>
                <th>USERNAME</th>
                <th>ADDED BY</th>
                <th>NOTE</th>
                <th style="text-align: right;">ACTIONS</th>
              </tr>
            </thead>
            <tbody id="owner-admins-tbody">
              <tr><td colspan="5" class="owner-table-loading">Loading administrators...</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 4. BOTTOM SECTION: CONNECTED DISCORD SERVERS -->
      <div class="owner-box-card" style="margin-top: 22px;">
        <div class="owner-card-header">
          <div class="owner-header-title-wrap">
            <div class="owner-icon-square icon-square-blue">
              ${ICONS.server}
            </div>
            <div>
              <h2 class="owner-card-title">Connected Discord Servers</h2>
              <div class="owner-card-subtitle">Live guilds running Ventrix Shop instances</div>
            </div>
          </div>
          <div style="display: flex; align-items: center; gap: 10px;">
            <button class="btn-owner-refresh" onclick="loadOwnerGuilds()">
              <span class="refresh-icon">↻</span> Refresh
            </button>
          </div>
        </div>

        <div class="owner-search-container" style="margin-bottom: 16px;">
          <span class="owner-search-icon">🔍</span>
          <input type="text" class="owner-input-search" id="owner-guild-search" placeholder="Search servers by name or Guild ID..." oninput="filterOwnerGuilds(this.value)">
          <div class="owner-filter-tabs">
            <button class="filter-tab-btn active" id="filter-guilds-all" onclick="setGuildFilter('all', this)">All</button>
            <button class="filter-tab-btn" id="filter-guilds-active" onclick="setGuildFilter('active', this)">Active</button>
            <button class="filter-tab-btn" id="filter-guilds-left" onclick="setGuildFilter('left', this)">Left</button>
          </div>
        </div>

        <div class="owner-table-wrapper">
          <table class="owner-table">
            <thead>
              <tr>
                <th>SERVER NAME</th>
                <th>GUILD ID</th>
                <th>MEMBERS</th>
                <th>STATUS</th>
                <th>LAST ACTIVE</th>
                <th style="text-align: right;">ACTIONS</th>
              </tr>
            </thead>
            <tbody id="owner-guilds-tbody">
              <tr><td colspan="6" class="owner-table-loading">Loading connected servers...</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>`
      : ''
    }

  `;
}
