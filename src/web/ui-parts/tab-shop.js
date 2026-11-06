// Shop Tab HTML
export function getShopTabHtml() {
  return `
    <div id="shop-tab" class="tab-content">
      <div class="shop-panel">
        <!-- 1. Header Row -->
        <div class="shop-header-row">
          <div class="shop-header-left">
            <div class="shop-header-icon-box">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
            </div>
            <div>
              <h1 class="shop-header-title">Shop Items for <span id="shop-server-name">Vyntrix Official</span></h1>
              <div class="shop-header-subtitle">Browse and claim exclusive server privileges, roles &amp; items</div>
            </div>
          </div>
          <div class="shop-header-right">
            <div class="shop-search-wrapper">
              <svg class="shop-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <input type="text" id="shop-search-input" class="shop-search-input" placeholder="Search shop items..." oninput="handleShopSearch(this.value)">
            </div>
            <button class="btn-shop-refresh" onclick="loadShop(1)">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>
              <span>Refresh</span>
            </button>
          </div>
        </div>

        <!-- 2. Category Tabs Row -->
        <div class="shop-category-tabs">
          <button class="shop-tab-pill active" id="tab-cat-all" onclick="filterShopCategory('all')">
            <span class="tab-pill-icon">🛍️</span>
            <span>All Items</span>
            <span class="tab-pill-count" id="count-all">(28)</span>
          </button>
          <button class="shop-tab-pill" id="tab-cat-roles" onclick="filterShopCategory('roles')">
            <span class="tab-pill-icon">🎭</span>
            <span>Discord Roles</span>
            <span class="tab-pill-count" id="count-roles">(12)</span>
          </button>
          <button class="shop-tab-pill" id="tab-cat-claims" onclick="filterShopCategory('claims')">
            <span class="tab-pill-icon">📜</span>
            <span>Manual Claims</span>
            <span class="tab-pill-count" id="count-claims">(5)</span>
          </button>
        </div>

        <!-- 3. Secondary Controls Bar (Filters, Sort & View Switcher) -->
        <div class="shop-controls-bar">
          <div class="shop-filters-left">
            <select id="shop-filter-type" class="shop-select" onchange="handleShopFilterChange()">
              <option value="all">All Types</option>
              <option value="STATIC">Permanent (Static)</option>
              <option value="TIMED">Timed Perk</option>
            </select>
            <select id="shop-filter-status" class="shop-select" onchange="handleShopFilterChange()">
              <option value="all">All Status</option>
              <option value="in_stock">In Stock</option>
              <option value="out_of_stock">Out of Stock</option>
            </select>
            <select id="shop-filter-price" class="shop-select" onchange="handleShopFilterChange()">
              <option value="all">All Price Ranges</option>
              <option value="under_500">Under 500 VCoins</option>
              <option value="500_1500">500 - 1,500 VCoins</option>
              <option value="1500_3000">1,500 - 3,000 VCoins</option>
              <option value="above_3000">Above 3,000 VCoins</option>
            </select>
            <select id="shop-sort" class="shop-select" onchange="handleShopFilterChange()">
              <option value="newest">Sort by: Newest</option>
              <option value="oldest">Sort by: Oldest</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="popular">Most Popular</option>
              <option value="name_asc">Name: A to Z</option>
            </select>
          </div>

          <div class="shop-view-toggle">
            <button class="shop-view-btn active" id="view-btn-grid" onclick="setShopView('grid')" title="Grid View">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
              <span>Grid</span>
            </button>
            <button class="shop-view-btn" id="view-btn-list" onclick="setShopView('list')" title="List View">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><circle cx="3.5" cy="6" r="1.5" fill="currentColor"/><circle cx="3.5" cy="12" r="1.5" fill="currentColor"/><circle cx="3.5" cy="18" r="1.5" fill="currentColor"/></svg>
              <span>List</span>
            </button>
          </div>
        </div>

        <!-- 4. Products Container (Grid View) -->
        <div id="shop-view-grid-container" class="shop-cards-grid">
          <p style="color: var(--muted); grid-column: 1 / -1; text-align: center; padding: 40px;">Loading shop catalogue for selected server...</p>
        </div>

        <!-- 5. Products Container (List View) -->
        <div id="shop-view-list-container" class="shop-list-table-wrapper" style="display: none;">
          <table class="shop-list-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Category</th>
                <th>Type / Duration</th>
                <th>Stock</th>
                <th>Price</th>
                <th style="text-align: right;">Action</th>
              </tr>
            </thead>
            <tbody id="shop-list-tbody">
              <tr><td colspan="6" style="text-align: center; color: var(--muted); padding: 30px;">Loading items...</td></tr>
            </tbody>
          </table>
        </div>

        <!-- 6. Pagination Bar -->
        <div class="shop-pagination-bar" id="shop-pagination-bar">
          <div class="shop-pagination-info" id="shop-pagination-info">Showing 1-8 of 28 items</div>
          <div class="shop-pagination-buttons" id="shop-pagination-controls">
            <!-- Dynamic pagination controls -->
          </div>
        </div>
      </div>
    </div>

    <!-- TAB 4: ORDERS (PIXEL-PERFECT RECREATION OF REFERENCE SAAS UI - COMPLETELY STATIC / NO ANIMATIONS) -->
  `;
}
