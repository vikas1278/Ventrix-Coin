// Admin Tab HTML
export function getAdminTabHtml({ ICONS }) {
  return `
    <div id="admin-tab" class="tab-content">

      <!-- 🔍 0. UNIVERSAL USER & WALLET INSPECTOR -->
      <div class="admin-card" id="admin-user-inspector-card">
        <div class="admin-card-header">
          <div class="admin-card-header-left">
            <div class="admin-header-icon-badge">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            </div>
            <div>
              <h2 class="admin-card-title">Universal User &amp; Wallet Inspector</h2>
              <div class="admin-card-subtitle">Cross-server Discord ID lookup, inventory revocation &amp; balance manager</div>
            </div>
          </div>
        </div>

        <p style="font-size: 13px; color: var(--muted); margin: 6px 0 16px 0; line-height: 1.5;">
          Enter any Discord User ID to locate which servers they are joined in, inspect their wallet balance in each server, view purchased items, and revoke items or adjust coins instantly.
        </p>

        <form class="inspect-input-row" onsubmit="handleInspectUser(event)">
          <input type="text" id="inspect-user-id-input" class="inspect-input-field" placeholder="Enter Discord User ID (e.g. 527175885309083648)..." oninput="handleInspectInputChange(this.value)" autocomplete="off">
          <button type="submit" id="inspect-submit-btn" class="admin-btn-purple" style="padding: 12px 24px; font-size: 13px; white-space: nowrap; height: 44px; display: inline-flex; align-items: center; gap: 8px;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            Inspect User
          </button>
          <button type="button" id="inspect-clear-btn" class="admin-btn-danger-outline" style="display: none; padding: 12px 16px; height: 44px;" onclick="clearInspectInputAndResults()" title="Clear Inspector">
            ✕ Clear
          </button>
        </form>

        <div id="inspect-loading" style="display: none; text-align: center; padding: 32px 14px; color: var(--muted);">
          <div style="font-size: 26px; margin-bottom: 8px;">🔍</div>
          <div style="font-weight: 700; color: var(--text-heading);">Querying Discord Bot &amp; Database...</div>
          <div style="font-size: 12px; margin-top: 4px;">Fetching mutual server memberships, wallets, orders &amp; inventories...</div>
        </div>

        <div id="inspect-results-container" style="display: none; margin-top: 20px;"></div>
      </div>

      <!-- ⚙️ 1. SHOP CONFIGURATION & TELEMETRY -->
      <div class="admin-card">
        <div class="admin-card-header">
          <div class="admin-card-header-left">
            <div class="admin-header-icon-badge">
              ${ICONS.gear}
            </div>
            <div>
              <h2 class="admin-card-title">Shop Configuration &amp; Telemetry for <span class="admin-curr-server" id="admin-config-server-name">This Server</span></h2>
              <div class="admin-card-subtitle">Manage conversion rates, active items, and pending reviews</div>
            </div>
          </div>
          <button class="admin-btn-purple" onclick="loadAdminConfig()">${ICONS.refresh} Refresh Config</button>
        </div>

        <div class="admin-stat-tiles-grid">
          <div class="admin-stat-tile">
            <div class="admin-stat-icon-box" style="background: rgba(147, 51, 234, 0.18); border-color: rgba(147, 51, 234, 0.35); color: #c084fc;">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
            </div>
            <div class="admin-stat-details">
              <span class="admin-stat-label">CONVERSION RATE</span>
              <strong class="admin-stat-val" id="cfg-rate">1 INR = -- Coins</strong>
            </div>
          </div>

          <div class="admin-stat-tile">
            <div class="admin-stat-icon-box" style="background: rgba(59, 130, 246, 0.18); border-color: rgba(59, 130, 246, 0.35); color: #60a5fa;">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
            </div>
            <div class="admin-stat-details">
              <span class="admin-stat-label">ACTIVE ITEMS</span>
              <strong class="admin-stat-val" id="cfg-items">-- Items</strong>
            </div>
          </div>

          <div class="admin-stat-tile">
            <div class="admin-stat-icon-box" style="background: rgba(245, 158, 11, 0.18); border-color: rgba(245, 158, 11, 0.35); color: #fbbf24;">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            </div>
            <div class="admin-stat-details">
              <span class="admin-stat-label">PENDING / REVIEW ORDERS</span>
              <strong class="admin-stat-val" id="cfg-orders">0 pending / 0 review</strong>
            </div>
          </div>

          <div class="admin-stat-tile">
            <div class="admin-stat-icon-box" style="background: rgba(16, 185, 129, 0.18); border-color: rgba(16, 185, 129, 0.35); color: #34d399;">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="2"/><line x1="7" y1="8" x2="17" y2="8"/><line x1="7" y1="12" x2="17" y2="12"/><line x1="7" y1="16" x2="13" y2="16"/></svg>
            </div>
            <div class="admin-stat-details">
              <span class="admin-stat-label">UPI MERCHANT ID</span>
              <strong class="admin-stat-val" style="font-family: monospace; font-size: 13px;" id="cfg-upi">--</strong>
            </div>
          </div>
        </div>

        <form onsubmit="handleUpdateRate(event)" class="admin-rate-form">
          <div>
            <label class="admin-form-label">Update Rate (1 INR = X Coins)</label>
            <input type="number" id="server-rate-input" class="admin-rate-input" min="1" value="1" required>
          </div>
          <button type="submit" class="admin-btn-gold">
            <span style="font-size: 16px; font-weight: 800; line-height: 1;">+</span> Update Conversion Rate
          </button>
        </form>
      </div>

      <!-- 💳 2. ORDERS & UPI VERIFICATION -->
      <div class="admin-card">
        <div class="admin-card-header">
          <div class="admin-card-header-left">
            <div class="admin-header-icon-badge">
              ${ICONS.card}
            </div>
            <div>
              <h2 class="admin-card-title">Orders &amp; UPI Verification in <span class="admin-curr-server" id="admin-orders-server-name">This Server</span></h2>
              <div class="admin-card-subtitle">Track all orders, payment verification &amp; buyer details</div>
            </div>
          </div>
          <div style="display: flex; gap: 10px; align-items: center;">
            <div class="admin-search-wrapper">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" style="color: var(--muted);"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input type="text" id="admin-orders-search" class="admin-table-search-input" placeholder="Search Order ID / User..." oninput="handleAdminTableSearch(this.value)">
            </div>
            <button class="admin-btn-purple" onclick="loadAdminOrders()">${ICONS.refresh} Refresh</button>
          </div>
        </div>

        <div class="table-responsive">
          <table class="admin-table">
            <thead>
              <tr>
                <th style="width: 220px;">ORDER ID</th>
                <th style="min-width: 180px;">USER</th>
                <th style="min-width: 130px;">AMOUNT (INR)</th>
                <th style="min-width: 120px;">COINS</th>
                <th style="min-width: 110px;">STATUS</th>
                <th style="min-width: 170px;">CREATED</th>
                <th style="text-align: right; min-width: 130px;">ACTIONS</th>
              </tr>
            </thead>
            <tbody id="admin-orders-table">
              <tr><td colspan="7" style="text-align: center; color: var(--muted); padding: 24px;">Loading admin orders...</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 🛍️ 3. MANAGE ITEMS -->
      <div class="admin-card">
        <div class="admin-card-header" style="flex-wrap: wrap; gap: 12px;">
          <div class="admin-card-header-left">
            <div class="admin-header-icon-badge">
              ${ICONS.cart}
            </div>
            <div>
              <h2 class="admin-card-title">Manage Items for <span class="admin-curr-server" id="admin-prod-server-name">This Server</span></h2>
              <div class="admin-card-subtitle">Create, update pricing, search &amp; batch delete items in Discord shop</div>
            </div>
          </div>
          <div style="display: flex; gap: 10px; align-items: center; flex-wrap: wrap;">
            <div class="admin-search-wrapper" style="min-width: 220px;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" style="color: var(--muted);"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input type="text" id="admin-products-search" class="admin-table-search-input" placeholder="Search items by name, role..." oninput="filterAdminProducts(this.value)">
            </div>
            <button id="admin-bulk-delete-btn" class="admin-btn-danger" style="display: none; align-items: center; gap: 6px; padding: 7px 14px; border-radius: 9px; font-weight: 700; font-size: 13px; background: #ef4444; color: #fff; border: none; cursor: pointer; box-shadow: 0 2px 8px rgba(239,68,68,0.3); transition: all 0.2s;" onclick="bulkDeleteSelectedProducts()">
              🗑️ Delete Selected (<span id="admin-selected-count">0</span>)
            </button>
            <button class="admin-btn-purple" onclick="openCreateProductModal()">
              <span style="font-size: 16px; font-weight: 800; line-height: 1;">+</span> Create Shop Item
            </button>
          </div>
        </div>

        <div class="table-responsive">
          <table class="admin-table">
            <thead>
              <tr>
                <th style="width: 44px; text-align: center;">
                  <input type="checkbox" id="admin-prod-select-all" onchange="toggleSelectAllAdminProducts(this.checked)" title="Select all items" style="cursor: pointer; width: 16px; height: 16px; accent-color: var(--accent); vertical-align: middle;">
                </th>
                <th style="min-width: 150px;">NAME</th>
                <th style="width: 70px;">ICON</th>
                <th style="min-width: 110px;">PRICE</th>
                <th style="width: 80px;">STOCK</th>
                <th style="min-width: 200px;">ROLE / DURATION</th>
                <th style="min-width: 130px;">TYPE</th>
                <th style="min-width: 100px;">STATUS</th>
                <th style="text-align: right; min-width: 190px;">ACTIONS</th>
              </tr>
            </thead>
            <tbody id="admin-products-table">
              <tr><td colspan="9" style="text-align: center; color: var(--muted); padding: 24px;">Loading shop items...</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 🪙 4. GIVE OR TAKE COINS -->
      <div class="admin-card">
        <div class="admin-card-header">
          <div class="admin-card-header-left">
            <div class="admin-header-icon-badge">
              ${ICONS.coins}
            </div>
            <div>
              <h2 class="admin-card-title">Give or Take Coins in <span class="admin-curr-server" id="admin-adj-server-name">This Server</span></h2>
              <div class="admin-card-subtitle">Manually credit or debit coins with audit log and reason</div>
            </div>
          </div>
        </div>

        <form onsubmit="handleCoinAdjust(event)" class="admin-adjust-grid">
          <div>
            <label class="admin-form-label">Target Discord User ID</label>
            <input type="text" id="adj-target-id" class="admin-form-input" placeholder="e.g. 527598635009836448" required>
          </div>
          <div>
            <label class="admin-form-label">Coins Amount</label>
            <input type="number" id="adj-amount" class="admin-form-input" min="1" placeholder="100" value="100" required>
          </div>
          <div>
            <label class="admin-form-label">Action</label>
            <select id="adj-action" class="admin-form-select">
              <option value="give">➕ Give Coins (Grant)</option>
              <option value="take">➖ Take Coins (Revoke)</option>
            </select>
          </div>
          <div>
            <label class="admin-form-label">Audit Reason</label>
            <input type="text" id="adj-reason" class="admin-form-input" placeholder="Event reward, manual adjustment, etc.">
          </div>
          <div style="display: flex; align-items: flex-end;">
            <button type="submit" class="admin-btn-purple" style="height: 42px; width: 100%; white-space: nowrap; justify-content: center;">
              ⚡ Apply to Server
            </button>
          </div>
        </form>
      </div>

      <!-- 🎁 5. COIN DROPBOX EVENTS -->
      <div class="admin-card">
        <div class="admin-card-header">
          <div class="admin-card-header-left">
            <div class="admin-header-icon-badge">
              ${ICONS.gift}
            </div>
            <div>
              <h2 class="admin-card-title">Coin Dropbox Events in <span class="admin-curr-server" id="admin-dropbox-server-name">This Server</span></h2>
              <div class="admin-card-subtitle">Auto send limited droppable coins in Discord channels</div>
            </div>
          </div>
          <div style="display: flex; gap: 10px; align-items: center; flex-wrap: wrap;">
            <button class="admin-btn-danger-outline" onclick="clearCompletedDropboxes()">
              🚫 Clear Enabled Dropboxes
            </button>
            <button class="admin-btn-purple" onclick="openCreateDropboxModal()">
              ⚙️ Setup Dropbox Event
            </button>
          </div>
        </div>

        <div class="table-responsive">
          <table class="admin-table">
            <thead>
              <tr>
                <th style="min-width: 180px;">EVENT ID</th>
                <th style="min-width: 130px;">COINS / DROP</th>
                <th style="min-width: 130px;">DROPS PROGRESS</th>
                <th style="min-width: 100px;">INTERVAL</th>
                <th style="min-width: 120px;">CLAIM WINDOW</th>
                <th style="min-width: 120px;">STATUS</th>
                <th style="text-align: right; min-width: 120px;">ACTIONS</th>
              </tr>
            </thead>
            <tbody id="admin-dropboxes-table">
              <tr><td colspan="7" style="text-align: center; color: var(--muted); padding: 24px;">Loading dropboxes...</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- ⚠️ 6. DANGER ZONE: SERVER DATA RESET & CLEAR -->
      <div class="admin-card admin-card-danger" style="border-color: rgba(239, 68, 68, 0.45); background: linear-gradient(180deg, rgba(239, 68, 68, 0.05) 0%, #0b0c16 100%);">
        <div class="admin-card-header">
          <div class="admin-card-header-left">
            <div class="admin-header-icon-badge" style="background: rgba(239, 68, 68, 0.15); border-color: rgba(239, 68, 68, 0.4); color: #ef4444;">
              ${ICONS.danger}
            </div>
            <div>
              <h2 class="admin-card-title" style="color: #ef4444;">Danger Zone: Server Data Reset &amp; Clear</h2>
              <div class="admin-card-subtitle" style="color: #fca5a5;">
                Manage or wipe database records for <span class="admin-curr-server" id="admin-clear-server-name">This Server</span>. Use with caution. This item will permanently delete data and cannot be undone.
              </div>
            </div>
          </div>
          <button class="admin-btn-outline-dark" onclick="loadServerClearStats()">
            ${ICONS.refresh} Refresh Record Counts
          </button>
        </div>

        <!-- Telemetry Row with 6 Colored Dots and Total Records Box -->
        <div class="admin-danger-telemetry">
          <div class="admin-danger-stat-item">
            <span class="admin-stat-dot" style="background: #a855f7;"></span>
            <div class="admin-stat-text">
              <span class="admin-stat-lbl">WALLETS</span>
              <span class="admin-stat-num" id="stat-wallets">0</span>
            </div>
          </div>
          <div class="admin-danger-stat-item">
            <span class="admin-stat-dot" style="background: #3b82f6;"></span>
            <div class="admin-stat-text">
              <span class="admin-stat-lbl">PRODUCTS</span>
              <span class="admin-stat-num" id="stat-products">0</span>
            </div>
          </div>
          <div class="admin-danger-stat-item">
            <span class="admin-stat-dot" style="background: #f97316;"></span>
            <div class="admin-stat-text">
              <span class="admin-stat-lbl">ORDERS</span>
              <span class="admin-stat-num" id="stat-orders">0</span>
            </div>
          </div>
          <div class="admin-danger-stat-item">
            <span class="admin-stat-dot" style="background: #eab308;"></span>
            <div class="admin-stat-text">
              <span class="admin-stat-lbl">LEDGERS</span>
              <span class="admin-stat-num" id="stat-ledgers">0</span>
            </div>
          </div>
          <div class="admin-danger-stat-item">
            <span class="admin-stat-dot" style="background: #ec4899;"></span>
            <div class="admin-stat-text">
              <span class="admin-stat-lbl">INVENTORIES</span>
              <span class="admin-stat-num" id="stat-inventories">0</span>
            </div>
          </div>
          <div class="admin-danger-stat-item">
            <span class="admin-stat-dot" style="background: #06b6d4;"></span>
            <div class="admin-stat-text">
              <span class="admin-stat-lbl">DROPBOXES</span>
              <span class="admin-stat-num" id="stat-dropboxes">0</span>
            </div>
          </div>
          <div class="admin-danger-total-box">
            <span class="admin-total-lbl">TOTAL RECORDS</span>
            <span class="admin-total-num" id="stat-total">0</span>
          </div>
        </div>

        <!-- Danger Zone Action Buttons -->
        <div class="admin-danger-actions">
          <button class="admin-btn-outline-dark" onclick="openClearServerModal('wallets')">
            ${ICONS.wallet} Reset Wallets &amp; Inventories
          </button>
          <button class="admin-btn-outline-dark" onclick="openClearServerModal('orders')">
            ${ICONS.package} Purge Orders &amp; Ledgers
          </button>
          <button class="admin-btn-outline-dark" onclick="openClearServerModal('dropboxes')">
            ${ICONS.gift} Clear All Dropboxes
          </button>
          <button class="admin-btn-outline-dark" onclick="openClearServerModal('products')">
            ${ICONS.cart} Delete Products &amp; Categories
          </button>
          <button class="admin-btn-danger-filled" style="margin-left: auto;" onclick="openClearServerModal('all')">
            ${ICONS.danger} Wipe Entire Server Database (Dangerous)
          </button>
        </div>
      </div>

    </div>
  `;
}
