// Transactions Tab HTML
export function getTransactionsTabHtml() {
  return `
    <div id="transactions-tab" class="tab-content">
      <div class="tx-main-card">
        <!-- 1. Header Row -->
        <div class="tx-header-row">
          <div class="tx-header-left">
            <div class="tx-header-icon-box">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
                <polyline points="10 9 9 9 8 9"/>
              </svg>
            </div>
            <div>
              <h1 class="tx-page-title">Transaction History</h1>
              <div class="tx-page-subtitle">Credit and debit records for this server</div>
            </div>
          </div>

          <!-- Top Right Action Controls -->
          <div class="tx-header-actions">
            <!-- Date Range Selector -->
            <div class="tx-date-picker-wrap">
              <button class="btn-tx-secondary" id="tx-date-dropdown-btn" onclick="toggleTxDateDropdown(event)">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
                <span id="tx-date-range-label">Oct 1, 2026 – Oct 31, 2026</span>
                <span class="tx-chevron">▼</span>
              </button>
              <div id="tx-date-dropdown-menu" class="tx-dropdown-menu" style="display: none;">
                <div class="tx-drop-item active" onclick="selectTxDateRange('current_month', 'Oct 1, 2026 – Oct 31, 2026', event)">Oct 1, 2026 – Oct 31, 2026 (Active Month)</div>
                <div class="tx-drop-item" onclick="selectTxDateRange('today', 'Today', event)">Today</div>
                <div class="tx-drop-item" onclick="selectTxDateRange('7d', 'Last 7 Days', event)">Last 7 Days</div>
                <div class="tx-drop-item" onclick="selectTxDateRange('30d', 'Last 30 Days', event)">Last 30 Days</div>
                <div class="tx-drop-item" onclick="selectTxDateRange('all', 'All Records (All-Time)', event)">All-Time Ledger</div>
                <div class="tx-drop-divider"></div>
                <div class="tx-drop-custom">
                  <div style="font-size: 11px; font-weight: 700; color: var(--muted); margin-bottom: 6px;">CUSTOM RANGE</div>
                  <div style="display: flex; gap: 6px; margin-bottom: 6px;">
                    <input type="date" id="tx-date-custom-start" class="tx-date-input">
                    <input type="date" id="tx-date-custom-end" class="tx-date-input">
                  </div>
                  <button class="btn-tx-primary-sm" style="width: 100%;" onclick="applyTxCustomDateRange(event)">Apply Range</button>
                </div>
              </div>
            </div>

            <!-- Refresh Button -->
            <button class="btn-tx-secondary" id="tx-btn-refresh" onclick="refreshTxData()">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="23 4 23 10 17 10"/>
                <polyline points="1 20 1 14 7 14"/>
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
              </svg>
              <span>Refresh</span>
            </button>

            <!-- Export Excel Button -->
            <button class="btn-tx-primary" id="tx-btn-export" onclick="exportTxExcel()">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              <span>Export Excel</span>
            </button>
          </div>
        </div>

        <!-- 2. Transaction Type Filter Tabs Row -->
        <div class="tx-filter-tabs">
          <button class="tx-tab-pill active" id="tx-tab-all" onclick="selectTxFilterTab('all')">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="20" x2="18" y2="10"/>
              <line x1="12" y1="20" x2="12" y2="4"/>
              <line x1="6" y1="20" x2="6" y2="14"/>
            </svg>
            <span>All Records</span>
            <span class="tx-tab-badge" id="tx-count-all">0</span>
          </button>
          <button class="tx-tab-pill" id="tx-tab-topup" onclick="selectTxFilterTab('topup')">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="12" y1="19" x2="12" y2="5"/>
              <polyline points="5 12 12 5 19 12"/>
            </svg>
            <span>Top-Up Credits</span>
            <span class="tx-tab-badge" id="tx-count-topup">0</span>
          </button>
          <button class="tx-tab-pill" id="tx-tab-shop" onclick="selectTxFilterTab('shop')">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="9" cy="21" r="1"/>
              <circle cx="20" cy="21" r="1"/>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
            </svg>
            <span>Purchases</span>
            <span class="tx-tab-badge" id="tx-count-shop">0</span>
          </button>
          <button class="tx-tab-pill" id="tx-tab-admin" onclick="selectTxFilterTab('admin')">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            <span>Admin</span>
            <span class="tx-tab-badge" id="tx-count-admin">0</span>
          </button>
          <button class="tx-tab-pill" id="tx-tab-reward" onclick="selectTxFilterTab('reward')">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#d97706" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 12 20 22 4 22 4 12"/>
              <rect x="2" y="7" width="20" height="5"/>
              <line x1="12" y1="22" x2="12" y2="7"/>
              <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/>
              <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>
            </svg>
            <span>Rewards</span>
            <span class="tx-tab-badge" id="tx-count-reward">0</span>
          </button>
        </div>

        <!-- 3. Four Summary Cards Grid -->
        <div class="tx-stats-grid">
          <!-- Card 1: Total Credits -->
          <div class="tx-stat-card">
            <div class="tx-stat-circle circle-green">
              <span class="stat-arrow-icon">↑</span>
            </div>
            <div class="tx-stat-info">
              <div class="tx-stat-title">Total Credits</div>
              <div class="tx-stat-val text-green" id="tx-stat-credits">+0</div>
              <div class="tx-stat-sub" id="tx-stat-credits-sub">Across 0 transactions</div>
            </div>
          </div>

          <!-- Card 2: Total Debits -->
          <div class="tx-stat-card">
            <div class="tx-stat-circle circle-red">
              <span class="stat-arrow-icon">↓</span>
            </div>
            <div class="tx-stat-info">
              <div class="tx-stat-title">Total Debits</div>
              <div class="tx-stat-val text-red" id="tx-stat-debits">-0</div>
              <div class="tx-stat-sub" id="tx-stat-debits-sub">Across 0 transactions</div>
            </div>
          </div>

          <!-- Card 3: Total Transactions -->
          <div class="tx-stat-card">
            <div class="tx-stat-circle circle-purple">
              <span class="stat-arrow-icon">⇄</span>
            </div>
            <div class="tx-stat-info">
              <div class="tx-stat-title">Total Transactions</div>
              <div class="tx-stat-val text-navy" id="tx-stat-total">0</div>
              <div class="tx-stat-sub">This period</div>
            </div>
          </div>

          <!-- Card 4: Net Change -->
          <div class="tx-stat-card">
            <div class="tx-stat-circle circle-gold">
              <img src="/assets/vyntrix-coin.png" alt="Coin" style="width: 26px; height: 26px; object-fit: contain;">
            </div>
            <div class="tx-stat-info">
              <div class="tx-stat-title">Net Change</div>
              <div class="tx-stat-val text-green" id="tx-stat-net">+0</div>
              <div class="tx-stat-sub">Credits - Debits</div>
            </div>
          </div>
        </div>

        <!-- 4. Table Controls Bar (Search Left, Filter Right) -->
        <div class="tx-table-controls-bar">
          <div class="tx-search-input-box">
            <span class="tx-search-glass">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            </span>
            <input type="text" id="tx-search-input" class="tx-search-field" placeholder="Search reason / RRN / Order ID..." oninput="handleTxSearchInput(this.value)">
            <button id="tx-search-clear-btn" class="tx-search-clear" style="display: none;" onclick="clearTxSearch()">✕</button>
          </div>

          <div class="tx-filter-menu-wrap">
            <button class="btn-tx-secondary" id="tx-filter-toggle-btn" onclick="toggleTxFilterMenu(event)">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
              </svg>
              <span style="color: #7c3aed; font-weight: 700;">Filter</span>
              <span class="tx-chevron">▼</span>
            </button>
            <div id="tx-filter-dropdown" class="tx-dropdown-menu" style="display: none; width: 220px;">
              <div style="font-size: 11px; font-weight: 700; color: var(--muted); padding: 4px 10px;">DIRECTION</div>
              <div class="tx-filter-option" onclick="setTxDirectionFilter('all', event)">
                <input type="radio" name="tx_dir" id="tx_dir_all" checked> <label for="tx_dir_all">All (Credits &amp; Debits)</label>
              </div>
              <div class="tx-filter-option" onclick="setTxDirectionFilter('credit', event)">
                <input type="radio" name="tx_dir" id="tx_dir_credit"> <label for="tx_dir_credit">Credits Only (+)</label>
              </div>
              <div class="tx-filter-option" onclick="setTxDirectionFilter('debit', event)">
                <input type="radio" name="tx_dir" id="tx_dir_debit"> <label for="tx_dir_debit">Debits Only (-)</label>
              </div>
              <div class="tx-drop-divider"></div>
              <button class="btn-tx-reset" onclick="resetTxAllFilters(event)">Reset All Filters</button>
            </div>
          </div>
        </div>

        <!-- 5. 7-Column Transaction Table (NO SERVER COLUMN) -->
        <div class="tx-table-container">
          <table class="tx-table">
            <thead>
              <tr>
                <th class="th-sortable" onclick="toggleTxSort()" title="Click to sort by date">
                  DATE <span id="tx-sort-arrow" style="font-size: 11px; margin-left: 2px;">⇅</span>
                </th>
                <th>MEMBER / USER</th>
                <th>COIN CHANGE</th>
                <th>TYPE</th>
                <th>REASON / ITEM</th>
                <th>REFERENCE / ORDER ID</th>
                <th style="text-align: center;">ACTIONS</th>
              </tr>
            </thead>
            <tbody id="tx-table-body">
              <tr>
                <td colspan="7" style="text-align: center; color: var(--muted); padding: 45px 0;">Loading server transactions...</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 6. Pagination Bar -->
        <div class="tx-pagination-bar">
          <div class="tx-pagination-info">
            Showing <span id="tx-showing-start" style="font-weight: 700; color: var(--text-heading, #0f172a);">0</span> to <span id="tx-showing-end" style="font-weight: 700; color: var(--text-heading, #0f172a);">0</span> of <span id="tx-showing-total" style="font-weight: 700; color: var(--text-heading, #0f172a);">0</span> records
          </div>
          <div class="tx-pagination-buttons" id="tx-pagination-controls">
            <!-- Dynamically generated in JS -->
          </div>
          <div>
            <select class="tx-page-size-select" id="tx-page-size" onchange="changeTxPageSize(this.value)">
              <option value="10" selected>10 per page</option>
              <option value="25">25 per page</option>
              <option value="50">50 per page</option>
              <option value="100">100 per page</option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <!-- TAB 2: ADMIN PANEL (SERVER SCOPED) -->
  `;
}
