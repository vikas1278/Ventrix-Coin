// Orders Tab HTML
export function getOrdersTabHtml() {
  return `
    <div id="orders-tab" class="tab-content">
      <div class="orders-panel">
        <!-- 1. Header Row -->
        <div class="orders-header-row">
          <div class="orders-header-left">
            <div class="orders-header-icon-box">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/>
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
                <line x1="12" y1="22.08" x2="12" y2="12"/>
              </svg>
            </div>
            <div>
              <h1 class="orders-header-title">Orders &amp; Purchases in <span id="orders-server-name">Computer World</span></h1>
              <div class="orders-header-subtitle">Track past purchases, role grants, and pending verifications</div>
            </div>
          </div>

          <div class="orders-header-right">
            <div class="orders-search-box">
              <span class="orders-search-icon">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="11" cy="11" r="8"/>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
              </span>
              <input type="text" id="order-user-search-input" class="orders-search-field" placeholder="Search Order ID / Item..." oninput="handleOrderSearchInput(this.value)">
              <button id="order-search-clear" class="orders-search-clear" style="display: none;" onclick="clearOrderSearch()">✕</button>
            </div>
            <button class="btn-orders-refresh" id="order-refresh-btn" onclick="refreshOrdersData()">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="23 4 23 10 17 10"/>
                <polyline points="1 20 1 14 7 14"/>
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
              </svg>
              <span>Refresh</span>
            </button>
          </div>
        </div>

        <!-- 2. Status Filters Row -->
        <div class="orders-filter-row">
          <button class="orders-filter-btn active" id="order-filter-all" onclick="selectOrderStatusFilter('all')">
            <span>All Orders</span>
            <span class="orders-tab-count" id="order-count-all">(0)</span>
          </button>
          <button class="orders-filter-btn" id="order-filter-paid" onclick="selectOrderStatusFilter('paid')">
            <span style="color: #10b981;">✔</span>
            <span>Paid &amp; Completed</span>
            <span class="orders-tab-count" id="order-count-paid">(0)</span>
          </button>
          <button class="orders-filter-btn" id="order-filter-pending" onclick="selectOrderStatusFilter('pending')">
            <span style="color: #f59e0b;">⏳</span>
            <span>Pending</span>
            <span class="orders-tab-count" id="order-count-pending">(0)</span>
          </button>
          <button class="orders-filter-btn" id="order-filter-failed" onclick="selectOrderStatusFilter('failed')">
            <span style="color: #ef4444;">✖</span>
            <span>Expired / Rejected</span>
            <span class="orders-tab-count" id="order-count-failed">(0)</span>
          </button>
        </div>

        <!-- 3. Orders Table -->
        <div class="orders-table-wrapper">
          <table class="orders-table">
            <thead>
              <tr>
                <th style="width: 200px;">ORDER ID</th>
                <th>ITEM / TYPE</th>
                <th style="width: 140px;">AMOUNT (INR)</th>
                <th style="width: 130px;">COINS</th>
                <th style="width: 120px;">STATUS</th>
                <th style="width: 140px;">DATE</th>
                <th style="width: 120px; text-align: right;">ACTIONS</th>
              </tr>
            </thead>
            <tbody id="user-orders-table">
              <tr>
                <td colspan="7" style="text-align: center; color: var(--muted); padding: 30px 0;">Loading orders...</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 4. Pagination Footer -->
        <div class="orders-pagination-bar">
          <div class="orders-pagination-info" id="orders-pagination-info">
            Showing 0 to 0 of 0 orders
          </div>
          <div class="orders-pagination-controls">
            <button class="orders-page-btn" id="order-prev-btn" onclick="prevOrdersPage()" title="Previous Page">‹</button>
            <div id="orders-page-numbers" style="display: flex; gap: 4px;">
              <button class="orders-page-btn active">1</button>
            </div>
            <button class="orders-page-btn" id="order-next-btn" onclick="nextOrdersPage()" title="Next Page">›</button>

            <select id="orders-page-size" class="orders-page-size-select" onchange="changeOrdersPageSize(this.value)">
              <option value="10">10 per page</option>
              <option value="25">25 per page</option>
              <option value="50">50 per page</option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <!-- TAB 5: TRANSACTIONS (RECREATED REFERENCE SAAS UI) -->
  `;
}
