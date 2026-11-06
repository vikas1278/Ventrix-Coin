// Responsive & tab styles
export function getResponsiveStyles() {
  return `
    @media (max-width: 1200px) {
      .dash-hero-grid { grid-template-columns: 1fr; }
      .metrics-grid { grid-template-columns: repeat(2, 1fr); }
      .shelf-grid { grid-template-columns: 1fr; }
      .quick-nav-cards-grid { grid-template-columns: repeat(2, 1fr); }
    }

    @media (max-width: 768px) {
      /* ─── GLOBAL SCREEN & APP SHELL OVERFLOW GUARDS ─── */
      html, body {
        overflow-x: hidden !important;
        width: 100% !important;
        max-width: 100vw !important;
        position: relative !important;
      }
      .app-shell {
        display: block !important;
        width: 100% !important;
        min-height: 100vh !important;
        position: relative !important;
        overflow-x: hidden !important;
      }
      .sidebar-backdrop {
        z-index: 999 !important;
      }
      .app-sidebar {
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        bottom: 0 !important;
        width: 290px !important;
        max-width: 84vw !important;
        height: 100vh !important;
        height: 100dvh !important;
        z-index: 1005 !important;
        transform: translateX(-100%);
        transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s ease !important;
        box-shadow: none !important;
        border-radius: 0 20px 20px 0 !important;
        padding: 16px 14px 24px !important;
        overflow-y: auto !important;
        -webkit-overflow-scrolling: touch !important;
        /* 100% SOLID OPAQUE BACKGROUND - NO BLURRY SOUP */
        background: #0d1126 !important;
        border-right: 1px solid rgba(139, 92, 246, 0.25) !important;
        backdrop-filter: none !important;
        -webkit-backdrop-filter: none !important;
      }
      [data-theme="light"] .app-sidebar {
        background: #ffffff !important;
        border-right: 1px solid #e2e8f0 !important;
      }
      .app-sidebar.mobile-open {
        transform: translateX(0) !important;
        box-shadow: 14px 0 50px rgba(0, 0, 0, 0.85) !important;
      }
      [data-theme="light"] .app-sidebar.mobile-open {
        box-shadow: 14px 0 40px rgba(15, 23, 42, 0.2) !important;
      }

      /* HIDE BLURRY CORNER GLOW ON MOBILE */
      .sidebar-cosmic-glow {
        display: none !important;
      }

      /* CRISP SHARP MOBILE DRAWER HEADER & CLOSE BUTTON */
      .sidebar-mobile-header {
        display: flex !important;
        align-items: center;
        justify-content: space-between;
        padding-bottom: 12px;
        margin-bottom: 12px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      }
      [data-theme="light"] .sidebar-mobile-header {
        border-bottom-color: #e2e8f0 !important;
      }
      .sidebar-mobile-close-btn {
        background: rgba(255, 255, 255, 0.08);
        border: 1px solid rgba(255, 255, 255, 0.15);
        color: #ffffff;
        width: 36px;
        height: 36px;
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        font-size: 18px;
        font-weight: 700;
      }
      [data-theme="light"] .sidebar-mobile-close-btn {
        background: #f1f5f9 !important;
        border-color: #cbd5e1 !important;
        color: #0f172a !important;
      }

      /* CRISP SHARP MENU BUTTONS IN MOBILE DRAWER */
      .app-sidebar .nav-btn {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px 16px;
        margin-bottom: 6px;
        border-radius: 12px;
        font-size: 14px;
        font-weight: 600;
        color: #cbd5e1;
        background: transparent;
        border: 1px solid transparent;
        opacity: 1;
        position: relative;
        z-index: 1010;
        cursor: pointer;
        pointer-events: auto;
        -webkit-tap-highlight-color: rgba(124, 58, 237, 0.2);
      }
      .app-sidebar .nav-btn.is-hidden,
      .app-sidebar .nav-btn[style*="display: none"],
      .app-sidebar #nav-btn-admin.is-hidden,
      .app-sidebar #nav-btn-admin[style*="display: none"] {
        display: none !important;
      }
      .app-sidebar .nav-btn .nav-icon {
        color: #a78bfa !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        opacity: 1 !important;
      }
      .app-sidebar .nav-btn.active {
        background: linear-gradient(135deg, #7c3aed 0%, #6366f1 100%) !important;
        color: #ffffff !important;
        font-weight: 700 !important;
        box-shadow: 0 4px 16px rgba(124, 58, 237, 0.45) !important;
        border-color: rgba(255, 255, 255, 0.25) !important;
      }
      .app-sidebar .nav-btn.active .nav-icon {
        color: #ffffff !important;
      }
      [data-theme="light"] .app-sidebar .nav-btn {
        color: #334155 !important;
      }
      [data-theme="light"] .app-sidebar .nav-btn .nav-icon {
        color: #7c3aed !important;
      }
      [data-theme="light"] .app-sidebar .nav-btn:hover {
        background: #f8fafc !important;
        color: #0f172a !important;
      }
      [data-theme="light"] .app-sidebar .nav-btn.active {
        background: linear-gradient(135deg, #7c3aed 0%, #6366f1 100%) !important;
        color: #ffffff !important;
      }
      [data-theme="light"] .app-sidebar .nav-btn.active .nav-icon {
        color: #ffffff !important;
      }
      [data-theme="light"] .sidebar-brand-name {
        color: #0f172a !important;
      }
      [data-theme="light"] .sidebar-brand-subtitle {
        color: #64748b !important;
      }

      /* ─── MAIN CONTENT CONTAINER ─── */
      .app-main {
        width: 100% !important;
        min-width: 0 !important;
        padding-bottom: 78px !important;
        overflow-x: hidden !important;
      }
      .app-content {
        padding: 10px 10px 84px !important;
        width: 100% !important;
        max-width: 100vw !important;
        box-sizing: border-box !important;
        overflow-x: hidden !important;
      }
      .tab-content {
        display: none;
        width: 100% !important;
        max-width: 100% !important;
        min-width: 0 !important;
      }
      .tab-content.active {
        display: block !important;
      }

      /* ─── COMPACT RESPONSIVE HEADER BAR ─── */
      .app-header {
        margin: 8px 8px 0 !important;
        padding: 8px 10px !important;
        border-radius: 16px !important;
        gap: 8px !important;
        width: calc(100% - 16px) !important;
        box-sizing: border-box !important;
        justify-content: space-between !important;
      }
      .header-search-wrap,
      .header-search-bar {
        display: none !important;
      }
      .header-server-pill {
        max-width: 140px !important;
        padding: 4px 8px 4px 6px !important;
        min-width: 0 !important;
        flex-shrink: 1 !important;
      }
      .header-server-text-wrap {
        max-width: 75px !important;
        overflow: hidden !important;
      }
      .header-server-name-label {
        font-size: 11.5px !important;
        white-space: nowrap !important;
        overflow: hidden !important;
        text-overflow: ellipsis !important;
      }
      .header-server-members-label {
        display: none !important;
      }
      .header-profile-pill {
        padding: 2px !important;
        border-radius: 50% !important;
        gap: 0 !important;
        background: transparent !important;
        border: none !important;
        box-shadow: none !important;
        flex-shrink: 0 !important;
      }
      .header-profile-pill .profile-username,
      .header-profile-pill .profile-role-tag {
        display: none !important;
      }
      .profile-avatar {
        width: 32px !important;
        height: 32px !important;
      }
      .header-right-actions {
        gap: 6px !important;
        flex-shrink: 0 !important;
      }
      .theme-switch-pill {
        padding: 2px !important;
        gap: 1px !important;
        border-radius: 16px !important;
      }
      .theme-pill-icon {
        width: 26px !important;
        height: 26px !important;
      }
      .theme-pill-icon svg {
        width: 14px !important;
        height: 14px !important;
      }
      .header-logout-btn {
        width: 32px !important;
        height: 32px !important;
        border-radius: 10px !important;
      }
      .header-logout-btn svg {
        width: 15px !important;
        height: 15px !important;
      }
      .header-sidebar-toggle,
      .mobile-menu-btn {
        width: 34px !important;
        height: 34px !important;
        border-radius: 10px !important;
        flex-shrink: 0 !important;
      }

      /* ─── MOBILE BOTTOM NAVIGATION (NATIVE APP FEEL) ─── */
      .mobile-bottom-nav {
        display: flex !important;
        position: fixed !important;
        bottom: 0 !important;
        left: 0 !important;
        right: 0 !important;
        height: 62px !important;
        background: rgba(11, 14, 26, 0.95) !important;
        backdrop-filter: blur(24px) saturate(190%) !important;
        -webkit-backdrop-filter: blur(24px) saturate(190%) !important;
        border-top: 1px solid rgba(255, 255, 255, 0.12) !important;
        z-index: 950 !important;
        justify-content: space-around !important;
        align-items: center !important;
        padding: 4px 4px calc(env(safe-area-inset-bottom, 4px) + 4px) !important;
        box-shadow: 0 -8px 28px rgba(0, 0, 0, 0.5) !important;
      }
      [data-theme="light"] .mobile-bottom-nav {
        background: rgba(255, 255, 255, 0.95) !important;
        border-top-color: #e2e8f0 !important;
        box-shadow: 0 -6px 24px rgba(15, 23, 42, 0.08) !important;
      }
      .mobile-bottom-nav-btn {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 3px;
        background: transparent;
        border: none;
        color: #94a3b8;
        font-size: 10.5px;
        font-weight: 700;
        font-family: inherit;
        cursor: pointer;
        padding: 6px 8px;
        border-radius: 12px;
        flex: 1;
        transition: all 0.2s ease;
        text-decoration: none;
        -webkit-tap-highlight-color: transparent;
      }
      .mobile-bottom-nav-btn.active {
        color: #c084fc !important;
        background: rgba(139, 92, 246, 0.16) !important;
      }
      [data-theme="light"] .mobile-bottom-nav-btn.active {
        color: #7c3aed !important;
        background: rgba(124, 58, 237, 0.12) !important;
      }
      .mobile-bottom-nav-btn .mob-icon svg {
        width: 19px;
        height: 19px;
      }

      /* ─── DASHBOARD HERO & METRICS ─── */
      .dash-hero-grid {
        grid-template-columns: 1fr !important;
        gap: 12px !important;
      }
      .hero-cosmic-card {
        flex-direction: column-reverse !important;
        align-items: center !important;
        text-align: center !important;
        gap: 16px !important;
        padding: 20px 14px !important;
        border-radius: 18px !important;
        min-height: auto !important;
      }
      .hero-cosmic-content {
        max-width: 100% !important;
        width: 100% !important;
      }
      .hero-cosmic-title {
        font-size: 20px !important;
        line-height: 1.3 !important;
      }
      .hero-meta-pills {
        justify-content: center !important;
        flex-wrap: wrap !important;
        gap: 6px !important;
      }
      .hero-orbital-center {
        margin: 0 auto !important;
        transform: scale(0.85);
      }
      .floating-crystal {
        display: none !important;
      }
      .metrics-grid {
        grid-template-columns: repeat(2, 1fr) !important;
        gap: 10px !important;
      }
      .metric-card {
        padding: 14px 12px !important;
        border-radius: 14px !important;
      }
      .metric-value {
        font-size: 19px !important;
      }
      .shelf-grid {
        grid-template-columns: 1fr !important;
        gap: 12px !important;
      }
      .featured-products-grid {
        grid-template-columns: 1fr !important;
        gap: 12px !important;
      }
      .quick-nav-cards-grid {
        grid-template-columns: 1fr !important;
        gap: 10px !important;
      }
      .topup-banner-card {
        flex-direction: column !important;
        text-align: center !important;
        gap: 14px !important;
        padding: 16px 14px !important;
        border-radius: 16px !important;
      }
      .topup-banner-left {
        flex-direction: column !important;
        align-items: center !important;
        gap: 10px !important;
      }
      .btn-topup-neon {
        width: 100% !important;
        justify-content: center !important;
      }

      /* ─── WALLET TAB RESPONSIVE ─── */
      .wallet-hero-card {
        padding: 18px 14px !important;
        border-radius: 18px !important;
        margin-bottom: 16px !important;
      }
      .wallet-header-row {
        flex-direction: column !important;
        align-items: stretch !important;
        gap: 12px !important;
      }
      .wallet-header-left {
        width: 100% !important;
      }
      .wallet-server-badge {
        width: 100% !important;
        box-sizing: border-box !important;
        justify-content: flex-start !important;
      }
      .wallet-hero-body {
        flex-direction: column !important;
        align-items: stretch !important;
        gap: 18px !important;
      }
      .wallet-hero-left {
        flex-direction: column !important;
        align-items: center !important;
        text-align: center !important;
        width: 100% !important;
        min-width: 0 !important;
        gap: 12px !important;
      }
      .wallet-pedestal-artwork {
        width: 110px !important;
        height: 110px !important;
      }
      .wallet-pedestal-img {
        width: 100% !important;
        height: 100% !important;
        object-fit: contain !important;
      }
      .wallet-balance-box {
        align-items: center !important;
        text-align: center !important;
        width: 100% !important;
      }
      .wallet-balance-heading {
        justify-content: center !important;
      }
      .wallet-balance-val-row {
        justify-content: center !important;
      }
      .wallet-balance-num,
      .balance-num {
        font-size: 34px !important;
      }
      .wallet-tier-badge {
        margin-top: 4px !important;
      }
      .wallet-hero-actions {
        width: 100% !important;
        flex-direction: column !important;
        gap: 10px !important;
      }
      .wallet-action-card {
        width: 100% !important;
        min-width: 0 !important;
        box-sizing: border-box !important;
        padding: 14px 16px !important;
      }
      .wallet-tiers-card {
        padding: 18px 14px !important;
        border-radius: 18px !important;
        margin-bottom: 16px !important;
      }
      .wallet-tiers-card-header {
        flex-direction: column !important;
        align-items: stretch !important;
        gap: 12px !important;
      }
      .wallet-btn-topup-tier {
        width: 100% !important;
        justify-content: center !important;
        text-align: center !important;
      }
      .membership-tiers-grid {
        grid-template-columns: repeat(2, 1fr) !important;
        gap: 8px !important;
      }
      .wallet-tx-card {
        padding: 16px 12px !important;
        border-radius: 18px !important;
      }
      .wallet-btn-view-all {
        width: 100% !important;
        justify-content: center !important;
      }

      /* ─── SHOP TAB RESPONSIVE ─── */
      .shop-panel {
        padding: 16px 12px !important;
        border-radius: 18px !important;
      }
      .shop-header-row {
        flex-direction: column !important;
        align-items: stretch !important;
        gap: 12px !important;
      }
      .shop-header-left {
        width: 100% !important;
      }
      .shop-header-right {
        flex-direction: column !important;
        align-items: stretch !important;
        gap: 8px !important;
        width: 100% !important;
      }
      .shop-search-wrapper {
        width: 100% !important;
        max-width: 100% !important;
        min-width: 0 !important;
        box-sizing: border-box !important;
      }
      .shop-search-input {
        width: 100% !important;
      }
      .btn-shop-refresh {
        width: 100% !important;
        justify-content: center !important;
      }
      .shop-category-tabs {
        overflow-x: auto !important;
        -webkit-overflow-scrolling: touch !important;
        flex-wrap: nowrap !important;
        padding-bottom: 6px !important;
        width: 100% !important;
        gap: 8px !important;
      }
      .shop-tab-pill {
        flex-shrink: 0 !important;
        white-space: nowrap !important;
      }
      .shop-controls-bar {
        flex-direction: column !important;
        align-items: stretch !important;
        gap: 10px !important;
      }
      .shop-filters-left {
        display: grid !important;
        grid-template-columns: 1fr 1fr !important;
        gap: 8px !important;
        width: 100% !important;
      }
      .shop-select {
        width: 100% !important;
        min-width: 0 !important;
        box-sizing: border-box !important;
      }
      .shop-view-toggle {
        width: 100% !important;
        display: flex !important;
        justify-content: center !important;
      }
      .shop-view-btn {
        flex: 1 !important;
        justify-content: center !important;
      }
      .shop-cards-grid {
        grid-template-columns: 1fr !important;
        gap: 14px !important;
      }
      .shop-card {
        width: 100% !important;
        min-width: 0 !important;
      }
      .shop-pagination-bar {
        flex-direction: column !important;
        gap: 12px !important;
        align-items: center !important;
        text-align: center !important;
      }
      .shop-pagination-buttons {
        flex-wrap: wrap !important;
        justify-content: center !important;
      }

      /* ─── ORDERS TAB RESPONSIVE ─── */
      .orders-panel {
        padding: 16px 12px !important;
        border-radius: 18px !important;
      }
      .orders-header-row {
        flex-direction: column !important;
        align-items: stretch !important;
        gap: 12px !important;
      }
      .orders-header-left {
        width: 100% !important;
      }
      .orders-header-right {
        flex-direction: column !important;
        align-items: stretch !important;
        gap: 8px !important;
        width: 100% !important;
      }
      .orders-search-box {
        width: 100% !important;
        max-width: 100% !important;
        min-width: 0 !important;
        box-sizing: border-box !important;
      }
      .orders-search-field {
        width: 100% !important;
      }
      .btn-orders-refresh {
        width: 100% !important;
        justify-content: center !important;
      }
      .orders-filter-row {
        overflow-x: auto !important;
        -webkit-overflow-scrolling: touch !important;
        flex-wrap: nowrap !important;
        padding-bottom: 6px !important;
        width: 100% !important;
        gap: 8px !important;
      }
      .orders-filter-btn {
        flex-shrink: 0 !important;
        white-space: nowrap !important;
      }
      .orders-pagination-bar {
        flex-direction: column !important;
        gap: 12px !important;
        align-items: center !important;
        text-align: center !important;
      }
      .orders-pagination-controls {
        flex-wrap: wrap !important;
        justify-content: center !important;
        width: 100% !important;
        gap: 6px !important;
      }

      /* ─── TRANSACTIONS TAB RESPONSIVE ─── */
      .tx-main-card {
        padding: 16px 12px !important;
        border-radius: 18px !important;
      }
      .tx-header-row {
        flex-direction: column !important;
        align-items: stretch !important;
        gap: 12px !important;
      }
      .tx-header-left {
        width: 100% !important;
      }
      .tx-header-actions {
        flex-direction: column !important;
        align-items: stretch !important;
        gap: 8px !important;
        width: 100% !important;
      }
      .tx-date-picker-wrap {
        width: 100% !important;
      }
      #tx-date-dropdown-btn {
        width: 100% !important;
        justify-content: space-between !important;
      }
      #tx-btn-refresh, #tx-btn-export {
        width: 100% !important;
        justify-content: center !important;
      }
      .tx-filter-tabs {
        overflow-x: auto !important;
        -webkit-overflow-scrolling: touch !important;
        flex-wrap: nowrap !important;
        padding-bottom: 6px !important;
        width: 100% !important;
        gap: 8px !important;
      }
      .tx-tab-pill {
        flex-shrink: 0 !important;
        white-space: nowrap !important;
      }
      .tx-stats-grid {
        grid-template-columns: repeat(2, 1fr) !important;
        gap: 8px !important;
      }
      .tx-stat-card {
        padding: 12px 10px !important;
        gap: 10px !important;
      }
      .tx-table-controls-bar {
        flex-direction: column !important;
        align-items: stretch !important;
        gap: 10px !important;
      }
      .tx-search-input-box {
        width: 100% !important;
        max-width: 100% !important;
        min-width: 0 !important;
        box-sizing: border-box !important;
      }
      .tx-search-field {
        width: 100% !important;
      }
      .tx-filter-menu-wrap {
        width: 100% !important;
      }
      #tx-filter-toggle-btn {
        width: 100% !important;
        justify-content: center !important;
      }
      .tx-pagination-bar {
        flex-direction: column !important;
        gap: 12px !important;
        align-items: center !important;
        text-align: center !important;
      }
      .tx-pagination-controls {
        flex-wrap: wrap !important;
        justify-content: center !important;
        gap: 6px !important;
      }

      /* ─── ADMIN TAB RESPONSIVE ─── */
      .admin-card {
        padding: 16px 12px !important;
        border-radius: 18px !important;
        margin-bottom: 16px !important;
      }
      .admin-card-header {
        flex-direction: column !important;
        align-items: stretch !important;
        gap: 12px !important;
      }
      .admin-card-header-left {
        width: 100% !important;
      }
      .inspect-input-row {
        flex-direction: column !important;
        gap: 8px !important;
        width: 100% !important;
      }
      .inspect-input-field {
        width: 100% !important;
        max-width: 100% !important;
        box-sizing: border-box !important;
      }
      #inspect-submit-btn,
      #inspect-clear-btn {
        width: 100% !important;
        justify-content: center !important;
      }
      .admin-stat-tiles-grid {
        grid-template-columns: repeat(2, 1fr) !important;
        gap: 8px !important;
      }
      .admin-rate-form {
        flex-direction: column !important;
        align-items: stretch !important;
        gap: 10px !important;
      }
      .admin-rate-input,
      .admin-btn-gold {
        width: 100% !important;
      }
      .admin-search-wrapper {
        width: 100% !important;
        min-width: 0 !important;
        max-width: 100% !important;
        box-sizing: border-box !important;
      }
      .admin-table-search-input {
        width: 100% !important;
      }
      .admin-adjust-grid {
        grid-template-columns: 1fr !important;
        gap: 10px !important;
      }
      .admin-adjust-grid button {
        width: 100% !important;
      }
      .admin-btn-purple,
      .admin-btn-danger,
      .admin-btn-danger-outline,
      .admin-btn-outline-dark {
        box-sizing: border-box !important;
        justify-content: center !important;
        text-align: center !important;
      }
      .admin-danger-telemetry {
        grid-template-columns: repeat(2, 1fr) !important;
        gap: 8px !important;
      }

      /* ─── BOT OWNER HUB RESPONSIVE ─── */
      .owner-hub-hero {
        padding: 18px 14px !important;
        border-radius: 18px !important;
      }
      .owner-hero-title {
        font-size: 21px !important;
      }
      .owner-hero-content {
        flex-direction: column !important;
        align-items: flex-start !important;
        gap: 12px !important;
      }
      .owner-hero-graphic {
        display: none !important;
      }
      .owner-telemetry-grid {
        grid-template-columns: repeat(2, 1fr) !important;
        gap: 10px !important;
      }
      .owner-stat-card {
        padding: 12px 14px !important;
        border-radius: 14px !important;
        gap: 10px !important;
      }
      .owner-stat-icon-wrap {
        width: 40px !important;
        height: 40px !important;
      }
      .owner-stat-value {
        font-size: 19px !important;
      }
      .owner-middle-grid {
        grid-template-columns: 1fr !important;
        gap: 14px !important;
      }
      .owner-box-card {
        padding: 16px 14px !important;
        border-radius: 16px !important;
      }
      .owner-card-header {
        flex-direction: column !important;
        align-items: stretch !important;
        gap: 12px !important;
      }
      .btn-owner-add-admin,
      .btn-owner-refresh {
        width: 100% !important;
        justify-content: center !important;
      }
      .owner-search-container {
        flex-direction: column !important;
        gap: 8px !important;
        width: 100% !important;
      }
      .owner-input-search {
        width: 100% !important;
        box-sizing: border-box !important;
      }
      .owner-filter-tabs {
        width: 100% !important;
        display: flex !important;
        justify-content: space-between !important;
      }
      .filter-tab-btn {
        flex: 1 !important;
        text-align: center !important;
      }

      /* ─── SETTINGS TAB RESPONSIVE ─── */
      .card {
        padding: 18px 14px !important;
        border-radius: 18px !important;
      }

      /* ─── RESPONSIVE TABLES & CONTAINERS ─── */
      .table-responsive,
      .shop-list-table-wrapper,
      .orders-table-wrapper,
      .owner-table-wrapper,
      .tx-table-wrapper {
        width: 100% !important;
        max-width: 100% !important;
        overflow-x: auto !important;
        -webkit-overflow-scrolling: touch !important;
        border-radius: 14px !important;
        margin-bottom: 14px !important;
        display: block !important;
      }
      table, .shop-list-table, .owner-table, .orders-table, .admin-table, .wallet-table {
        min-width: 580px !important;
      }
      th, td {
        padding: 10px 12px !important;
        font-size: 12.5px !important;
        white-space: nowrap !important;
      }

      /* ─── BOTTOM-SHEET STYLE MODALS ON MOBILE ─── */
      .modal-overlay {
        padding: 10px !important;
        align-items: flex-end !important;
        justify-content: center !important;
      }
      .modal-box {
        max-width: 95vw !important;
        width: 95vw !important;
        padding: 22px 16px 26px !important;
        border-radius: 24px 24px 14px 14px !important;
        max-height: 88vh !important;
        max-height: 88dvh !important;
        overflow-y: auto !important;
        -webkit-overflow-scrolling: touch !important;
        box-sizing: border-box !important;
        margin: 0 auto !important;
      }
      .modal-box input,
      .modal-box select,
      .modal-box textarea {
        font-size: 16px !important;
        width: 100% !important;
        box-sizing: border-box !important;
      }
      .modal-title {
        font-size: 19px !important;
      }
      .modal-close {
        top: 14px !important;
        right: 14px !important;
      }
    }

    @media (max-width: 480px) {
      .metrics-grid {
        grid-template-columns: 1fr !important;
      }
      .tx-stats-grid {
        grid-template-columns: 1fr !important;
      }
      .admin-stat-tiles-grid {
        grid-template-columns: 1fr !important;
      }
      .owner-telemetry-grid {
        grid-template-columns: 1fr !important;
      }
      .membership-tiers-grid {
        grid-template-columns: 1fr !important;
      }
      .shop-filters-left {
        grid-template-columns: 1fr !important;
      }
      .admin-danger-telemetry {
        grid-template-columns: 1fr !important;
      }
      .wallet-balance-num,
      .balance-num {
        font-size: 28px !important;
      }
      .app-header {
        margin: 6px 6px 0 !important;
        padding: 6px 8px !important;
      }
      .header-server-pill {
        max-width: 120px !important;
      }
      .header-server-text-wrap {
        max-width: 60px !important;
      }
    }
    /* ═══════════════════════════════════════════════════════════════
       ADVANCED SHOP ITEMS STYLES (PIXEL-PERFECT REPRODUCTION)
       ═══════════════════════════════════════════════════════════════ */
    .shop-panel {
      background: #ffffff;
      border: 1px solid rgba(226, 232, 240, 0.9);
      border-radius: 20px;
      padding: 28px;
      box-shadow: 0 4px 20px -2px rgba(15, 23, 42, 0.05);
      color: #0f172a;
      position: relative;
    }
    [data-theme="dark"] .shop-panel {
      background: #140f2b !important;
      border-color: rgba(255, 255, 255, 0.08) !important;
      color: #f8fafc !important;
      box-shadow: 0 8px 30px rgba(0, 0, 0, 0.35) !important;
    }

    .shop-header-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 22px;
      flex-wrap: wrap;
      gap: 16px;
    }
    .shop-header-left {
      display: flex;
      align-items: center;
      gap: 14px;
    }
    .shop-header-icon-box {
      width: 48px;
      height: 48px;
      border-radius: 14px;
      background: #ede9fe;
      color: #7c3aed;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    [data-theme="dark"] .shop-header-icon-box {
      background: rgba(124, 58, 237, 0.22);
      color: #c4b5fd;
    }
    .shop-header-title {
      font-size: 22px;
      font-weight: 800;
      color: #0f172a;
      margin: 0;
      font-family: 'Outfit', 'Plus Jakarta Sans', sans-serif;
      letter-spacing: -0.01em;
    }
    [data-theme="dark"] .shop-header-title {
      color: #ffffff;
    }
    .shop-header-subtitle {
      font-size: 13px;
      color: #64748b;
      margin-top: 3px;
    }
    [data-theme="dark"] .shop-header-subtitle {
      color: #94a3b8;
    }
    .shop-header-right {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
    }
    .shop-search-wrapper {
      position: relative;
      width: 250px;
    }
    .shop-search-icon {
      position: absolute;
      left: 14px;
      top: 50%;
      transform: translateY(-50%);
      color: #94a3b8;
      pointer-events: none;
    }
    .shop-search-input {
      width: 100%;
      padding: 9px 14px 9px 38px;
      font-size: 13px;
      font-weight: 500;
      border-radius: 10px;
      border: 1px solid #e2e8f0;
      background: #ffffff;
      color: #0f172a;
      outline: none;
      transition: border-color 0.15s, box-shadow 0.15s;
    }
    [data-theme="dark"] .shop-search-input {
      background: #1c1638;
      border-color: rgba(255, 255, 255, 0.12);
      color: #f8fafc;
    }
    .shop-search-input:focus {
      border-color: #7c3aed;
      box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.15);
    }
    .btn-shop-refresh {
      display: inline-flex;
      align-items: center;
      gap: 7px;
      padding: 9px 18px;
      font-size: 13px;
      font-weight: 700;
      color: #ffffff;
      background: #7c3aed;
      border: none;
      border-radius: 10px;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(124, 58, 237, 0.28);
      transition: background 0.15s, transform 0.15s;
    }
    .btn-shop-refresh:hover {
      background: #6d28d9;
      transform: translateY(-1px);
    }

    /* Category Tabs */
    .shop-category-tabs {
      display: flex;
      gap: 10px;
      margin-bottom: 20px;
      flex-wrap: wrap;
    }
    .shop-tab-pill {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 8px 18px;
      font-size: 13px;
      font-weight: 600;
      border-radius: 9999px;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      color: #64748b;
      cursor: pointer;
      transition: all 0.15s ease;
    }
    [data-theme="dark"] .shop-tab-pill {
      background: #1a1435;
      border-color: rgba(255, 255, 255, 0.08);
      color: #94a3b8;
    }
    .shop-tab-pill:hover {
      border-color: #cbd5e1;
      color: #0f172a;
    }
    [data-theme="dark"] .shop-tab-pill:hover {
      border-color: rgba(255, 255, 255, 0.2);
      color: #ffffff;
    }
    .shop-tab-pill.active {
      background: #7c3aed !important;
      border-color: #7c3aed !important;
      color: #ffffff !important;
      box-shadow: 0 4px 14px rgba(124, 58, 237, 0.3) !important;
    }
    .tab-pill-icon {
      font-size: 14px;
    }
    .tab-pill-count {
      font-size: 12px;
      font-weight: 700;
      opacity: 0.9;
    }

    /* Controls Bar */
    .shop-controls-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
      flex-wrap: wrap;
      gap: 12px;
    }
    .shop-filters-left {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
      align-items: center;
    }
    .shop-select {
      appearance: none;
      -webkit-appearance: none;
      background: #ffffff url('data:image/svg+xml;utf8,<svg fill="%2364748b" height="14" viewBox="0 0 24 24" width="14" xmlns="http://www.w3.org/2000/svg"><path d="M7 10l5 5 5-5z"/></svg>') no-repeat right 12px center;
      padding: 8px 32px 8px 14px;
      font-size: 13px;
      font-weight: 500;
      color: #334155;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      cursor: pointer;
      outline: none;
      transition: border-color 0.15s;
    }
    [data-theme="dark"] .shop-select {
      background: #1c1638 url('data:image/svg+xml;utf8,<svg fill="%2394a3b8" height="14" viewBox="0 0 24 24" width="14" xmlns="http://www.w3.org/2000/svg"><path d="M7 10l5 5 5-5z"/></svg>') no-repeat right 12px center;
      border-color: rgba(255, 255, 255, 0.12);
      color: #e2e8f0;
    }
    .shop-select:focus {
      border-color: #7c3aed;
    }
    .shop-view-toggle {
      display: inline-flex;
      background: #f1f5f9;
      padding: 3px;
      border-radius: 10px;
      border: 1px solid #e2e8f0;
    }
    [data-theme="dark"] .shop-view-toggle {
      background: #1a1435;
      border-color: rgba(255, 255, 255, 0.08);
    }
    .shop-view-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 14px;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 600;
      border: none;
      background: transparent;
      color: #64748b;
      cursor: pointer;
      transition: all 0.15s;
    }
    [data-theme="dark"] .shop-view-btn {
      color: #94a3b8;
    }
    .shop-view-btn.active {
      background: #7c3aed;
      color: #ffffff;
      box-shadow: 0 2px 8px rgba(124, 58, 237, 0.3);
    }

    /* Product Cards Grid */
    .shop-cards-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 20px;
      margin-bottom: 24px;
    }
    @media (max-width: 1280px) {
      .shop-cards-grid { grid-template-columns: repeat(3, 1fr); }
    }
    @media (max-width: 900px) {
      .shop-cards-grid { grid-template-columns: repeat(2, 1fr); }
    }
    @media (max-width: 600px) {
      .shop-cards-grid { grid-template-columns: 1fr; }
    }

    .shop-card {
      background: #ffffff;
      border: 1px solid #f1f5f9;
      border-radius: 16px;
      padding: 18px;
      display: flex;
      flex-direction: column;
      position: relative;
      box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
      transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s;
    }
    [data-theme="dark"] .shop-card {
      background: #181335;
      border-color: rgba(255, 255, 255, 0.07);
      box-shadow: 0 4px 14px rgba(0, 0, 0, 0.2);
    }
    .shop-card:hover {
      transform: translateY(-3px);
      box-shadow: 0 10px 24px rgba(0, 0, 0, 0.06);
      border-color: #e2e8f0;
    }
    [data-theme="dark"] .shop-card:hover {
      border-color: rgba(139, 92, 246, 0.35);
      box-shadow: 0 12px 28px rgba(0, 0, 0, 0.4);
    }

    .shop-stock-badge {
      position: absolute;
      top: 14px;
      right: 14px;
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-size: 11px;
      font-weight: 700;
      padding: 3px 9px;
      border-radius: 9999px;
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }
    .stock-tag-in {
      background: #dcfce7;
      color: #15803d;
    }
    [data-theme="dark"] .stock-tag-in {
      background: rgba(34, 197, 94, 0.16);
      color: #4ade80;
    }
    .stock-tag-out {
      background: #fee2e2;
      color: #b91c1c;
    }
    [data-theme="dark"] .stock-tag-out {
      background: rgba(239, 68, 68, 0.16);
      color: #f87171;
    }
    .stock-tag-unlimited {
      background: #f1f5f9;
      color: #475569;
    }
    [data-theme="dark"] .stock-tag-unlimited {
      background: rgba(255, 255, 255, 0.08);
      color: #94a3b8;
    }

    .shop-card-icon-area {
      height: 72px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-top: 10px;
      margin-bottom: 12px;
    }
    .shop-card-emoji {
      font-size: 48px;
      line-height: 1;
      filter: drop-shadow(0 2px 6px rgba(0,0,0,0.06));
    }
    .shop-card-img {
      max-height: 64px;
      max-width: 80px;
      object-fit: contain;
    }

    .shop-badges-row {
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
      margin-bottom: 8px;
    }
    .shop-badge {
      font-size: 11px;
      font-weight: 600;
      padding: 3px 8px;
      border-radius: 6px;
      display: inline-flex;
      align-items: center;
    }
    .badge-role {
      background: #ede9fe;
      color: #6d28d9;
    }
    [data-theme="dark"] .badge-role {
      background: rgba(139, 92, 246, 0.18);
      color: #c4b5fd;
    }
    .badge-consumable {
      background: #e0f2fe;
      color: #0284c7;
    }
    [data-theme="dark"] .badge-consumable {
      background: rgba(14, 165, 233, 0.18);
      color: #38bdf8;
    }
    .badge-claim {
      background: #fef3c7;
      color: #b45309;
    }
    [data-theme="dark"] .badge-claim {
      background: rgba(245, 158, 11, 0.18);
      color: #fbbf24;
    }
    .badge-server {
      background: #f3f4f6;
      color: #6b7280;
    }
    [data-theme="dark"] .badge-server {
      background: rgba(255, 255, 255, 0.08);
      color: #94a3b8;
    }

    .shop-card-title {
      font-size: 16px;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 6px;
      line-height: 1.3;
      font-family: 'Outfit', 'Plus Jakarta Sans', sans-serif;
    }
    [data-theme="dark"] .shop-card-title {
      color: #ffffff;
    }
    .shop-card-desc {
      font-size: 13px;
      color: #64748b;
      line-height: 1.45;
      margin-bottom: 12px;
      min-height: 38px;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    [data-theme="dark"] .shop-card-desc {
      color: #94a3b8;
    }

    .shop-card-price-row {
      display: flex;
      align-items: center;
      gap: 6px;
      margin-bottom: 14px;
    }
    .shop-card-price-val {
      font-size: 17px;
      font-weight: 800;
      color: #d97706;
      font-family: 'Outfit', sans-serif;
    }
    [data-theme="dark"] .shop-card-price-val {
      color: #fbbf24;
    }
    .shop-coin-icon {
      width: 19px;
      height: 19px;
      object-fit: contain;
    }

    .shop-card-actions {
      display: flex;
      gap: 8px;
      margin-top: auto;
    }
    .btn-card-details {
      flex: 0 0 auto;
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 9px 13px;
      font-size: 12.5px;
      font-weight: 600;
      border-radius: 10px;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      color: #334155;
      cursor: pointer;
      transition: all 0.15s;
    }
    [data-theme="dark"] .btn-card-details {
      background: #1c1638;
      border-color: rgba(255, 255, 255, 0.12);
      color: #e2e8f0;
    }
    .btn-card-details:hover {
      background: #f8fafc;
      border-color: #cbd5e1;
    }
    [data-theme="dark"] .btn-card-details:hover {
      background: #231b46;
    }
    .btn-card-buy {
      flex: 1;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      padding: 9px 14px;
      font-size: 12.5px;
      font-weight: 700;
      border-radius: 10px;
      background: #7c3aed;
      color: #ffffff;
      border: none;
      cursor: pointer;
      transition: all 0.15s;
      box-shadow: 0 2px 8px rgba(124, 58, 237, 0.25);
    }
    .btn-card-buy:hover {
      background: #6d28d9;
    }
    .btn-card-buy.disabled,
    .btn-card-buy:disabled {
      background: #e2e8f0 !important;
      color: #94a3b8 !important;
      cursor: not-allowed !important;
      box-shadow: none !important;
    }
    [data-theme="dark"] .btn-card-buy.disabled,
    [data-theme="dark"] .btn-card-buy:disabled {
      background: rgba(255, 255, 255, 0.08) !important;
      color: #64748b !important;
    }

    /* List View Table */
    .shop-list-table-wrapper {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 14px;
      overflow: hidden;
      margin-bottom: 24px;
    }
    [data-theme="dark"] .shop-list-table-wrapper {
      background: #181335;
      border-color: rgba(255, 255, 255, 0.08);
    }
    .shop-list-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 13px;
    }
    .shop-list-table th {
      text-align: left;
      padding: 12px 16px;
      background: #f8fafc;
      font-size: 11px;
      text-transform: uppercase;
      color: #64748b;
      font-weight: 700;
      border-bottom: 1px solid #e2e8f0;
    }
    [data-theme="dark"] .shop-list-table th {
      background: #15102d;
      border-bottom-color: rgba(255, 255, 255, 0.08);
      color: #94a3b8;
    }
    .shop-list-table td {
      padding: 14px 16px;
      border-bottom: 1px solid #f1f5f9;
      vertical-align: middle;
    }
    [data-theme="dark"] .shop-list-table td {
      border-bottom-color: rgba(255, 255, 255, 0.05);
    }
    .shop-list-table .shop-stock-badge {
      position: static !important;
      display: inline-flex !important;
    }

    /* Pagination Bar */
    .shop-pagination-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 18px;
      border-top: 1px solid #f1f5f9;
      flex-wrap: wrap;
      gap: 12px;
    }
    [data-theme="dark"] .shop-pagination-bar {
      border-top-color: rgba(255, 255, 255, 0.08);
    }
    .shop-pagination-info {
      font-size: 13px;
      color: #64748b;
      font-weight: 500;
    }
    [data-theme="dark"] .shop-pagination-info {
      color: #94a3b8;
    }
    .shop-pagination-buttons {
      display: flex;
      gap: 6px;
      align-items: center;
    }
    .shop-page-btn {
      padding: 6px 12px;
      font-size: 12px;
      font-weight: 600;
      border-radius: 8px;
      border: 1px solid #e2e8f0;
      background: #ffffff;
      color: #334155;
      cursor: pointer;
      transition: all 0.15s;
    }
    [data-theme="dark"] .shop-page-btn {
      background: #1c1638;
      border-color: rgba(255, 255, 255, 0.12);
      color: #e2e8f0;
    }
    .shop-page-btn:hover:not(:disabled) {
      border-color: #cbd5e1;
      background: #f8fafc;
    }
    [data-theme="dark"] .shop-page-btn:hover:not(:disabled) {
      background: #231b46;
    }
    .shop-page-btn.active {
      background: #7c3aed !important;
      border-color: #7c3aed !important;
      color: #ffffff !important;
    }
    .shop-page-btn:disabled {
      opacity: 0.45;
      cursor: not-allowed;
    }

    /* ═══════════════════════════════════════════════════════════════
       COMPREHENSIVE LIGHT THEME RULES
       ═══════════════════════════════════════════════════════════════ */
    [data-theme="light"] body {
      background-color: #f4f6fb;
      color: #1e293b;
    }
    [data-theme="light"] .cyber-grid {
      opacity: 0.15;
      background-image: radial-gradient(#cbd5e1 1.2px, transparent 1.2px);
    }
    [data-theme="light"] .ambient-glow {
      opacity: 0.15;
    }
    [data-theme="light"] .app-sidebar {
      background: #ffffff !important;
      border-right: 1px solid #e2e8f0 !important;
      box-shadow: 2px 0 20px rgba(15, 23, 42, 0.04) !important;
    }
    [data-theme="light"] .sidebar-brand {
      border-bottom-color: #e2e8f0 !important;
    }
    [data-theme="light"] .sidebar-brand-name {
      color: #0f172a !important;
    }
    [data-theme="light"] .nav-btn {
      color: #64748b !important;
    }
    [data-theme="light"] .nav-btn:hover {
      background: #f1f5f9 !important;
      color: #0f172a !important;
    }
    [data-theme="light"] .nav-btn.active {
      background: linear-gradient(135deg, #7c3aed 0%, #6366f1 100%) !important;
      color: #ffffff !important;
    }
    [data-theme="light"] .sidebar-topup-card {
      background: linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%) !important;
      border: 1px solid #ddd6fe !important;
      box-shadow: 0 4px 16px rgba(124, 58, 237, 0.08) !important;
    }
    [data-theme="light"] .sidebar-topup-title {
      color: #1e1b4b !important;
    }
    [data-theme="light"] .sidebar-topup-desc {
      color: #6b7280 !important;
    }
    [data-theme="light"] .header-search-bar {
      background: #ffffff !important;
      border: 1px solid #e2e8f0 !important;
      color: #0f172a !important;
    }
    [data-theme="light"] .header-search-input {
      color: #0f172a !important;
    }
    [data-theme="light"] .search-kbd-badge,
    [data-theme="light"] .header-search-kbd {
      background: #f1f5f9 !important;
      border-color: #cbd5e1 !important;
      color: #64748b !important;
    }
    [data-theme="light"] .card,
    [data-theme="light"] .hero-cosmic-card,
    [data-theme="light"] .metric-card,
    [data-theme="light"] .shelf-card,
    [data-theme="light"] .quick-nav-card,
    [data-theme="light"] .featured-item-card,
    [data-theme="light"] .featured-hero-card {
      background: #ffffff !important;
      border: 1px solid #e2e8f0 !important;
      box-shadow: 0 4px 20px -2px rgba(15, 23, 42, 0.05) !important;
    }
    [data-theme="light"] .card-title,
    [data-theme="light"] .q-title,
    [data-theme="light"] .shelf-title,
    [data-theme="light"] .white-text,
    [data-theme="light"] .item-title,
    [data-theme="light"] .hero-title {
      color: #0f172a !important;
    }
    [data-theme="light"] .hero-greeting,
    [data-theme="light"] .hero-subtitle,
    [data-theme="light"] .q-desc,
    [data-theme="light"] .shelf-subtitle,
    [data-theme="light"] .hero-desc {
      color: #64748b !important;
    }
    [data-theme="light"] .hero-pill {
      background: #f8fafc !important;
      border-color: #e2e8f0 !important;
      color: #1e293b !important;
    }
    [data-theme="light"] .shelf-action-pill {
      background: #f1f5f9 !important;
      border-color: #e2e8f0 !important;
      color: #475569 !important;
    }
    [data-theme="light"] .shelf-action-pill:hover {
      background: #e2e8f0 !important;
      color: #0f172a !important;
    }
    [data-theme="light"] .filter-pill {
      background: #f1f5f9 !important;
      border-color: #e2e8f0 !important;
      color: #475569 !important;
    }
    [data-theme="light"] .filter-pill.active {
      background: #7c3aed !important;
      color: #ffffff !important;
      border-color: #7c3aed !important;
    }
    [data-theme="light"] table thead th {
      background: #f8fafc !important;
      color: #64748b !important;
      border-bottom: 1px solid #e2e8f0 !important;
    }
    [data-theme="light"] table tbody tr {
      background: #ffffff !important;
      border-bottom: 1px solid #f1f5f9 !important;
      color: #1e293b !important;
    }
    [data-theme="light"] table tbody tr:hover {
      background: #f8fafc !important;
    }
    [data-theme="light"] code {
      background: #f1f5f9 !important;
      color: #6366f1 !important;
      border-color: #e2e8f0 !important;
    }
    [data-theme="light"] .modal-content {
      background: #ffffff !important;
      border-color: #e2e8f0 !important;
      color: #0f172a !important;
    }
    [data-theme="light"] .modal-box {
      background: #ffffff !important;
      border: 1px solid #e2e8f0 !important;
      color: #0f172a !important;
      box-shadow: 0 20px 50px rgba(15, 23, 42, 0.12) !important;
    }
    [data-theme="light"] .modal-title {
      color: #0f172a !important;
    }
    [data-theme="light"] .modal-close {
      background: #f1f5f9 !important;
      border-color: #cbd5e1 !important;
      color: #64748b !important;
    }
    [data-theme="light"] .product-card {
      background: #ffffff !important;
      border: 1px solid #e2e8f0 !important;
      box-shadow: 0 4px 16px rgba(15, 23, 42, 0.05) !important;
    }
    [data-theme="light"] .product-title {
      color: #0f172a !important;
    }
    [data-theme="light"] .product-desc {
      color: #64748b !important;
    }
    [data-theme="light"] .form-input,
    [data-theme="light"] .form-control {
      background: #ffffff !important;
      border-color: #cbd5e1 !important;
      color: #0f172a !important;
    }
    [data-theme="light"] .theme-picker-card {
      background: #ffffff !important;
      border: 1px solid #e2e8f0 !important;
    }
    [data-theme="light"] .balance-label {
      color: #64748b !important;
    }
    [data-theme="light"] .balance-num {
      color: #0f172a !important;
    }
    [data-theme="light"] .tx-main-card {
      background: #ffffff !important;
      border: 1px solid #e2e8f0 !important;
      box-shadow: 0 4px 25px -4px rgba(15, 23, 42, 0.05) !important;
    }
    [data-theme="light"] .topup-banner-card {
      background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 50%, #f5f3ff 100%) !important;
      border: 1px solid #fde68a !important;
      box-shadow: 0 6px 20px rgba(245, 158, 11, 0.12) !important;
    }
    [data-theme="light"] .topup-banner-title {
      color: #92400e !important;
    }
    [data-theme="light"] .topup-banner-subtitle {
      color: #78350f !important;
    }
    [data-theme="light"] .hero-username-title {
      background: linear-gradient(135deg, #1e1b4b 0%, #7c3aed 100%) !important;
      -webkit-background-clip: text !important;
      -webkit-text-fill-color: transparent !important;
    }

    /* ═══════════════════════════════════════════════════════════════
       ORDERS & PURCHASES DASHBOARD (EXACT SAAS REFERENCE RECREATION)
       STRICT REQUIREMENT: 100% STATIC — NO ANIMATIONS
       ═══════════════════════════════════════════════════════════════ */
    #orders-tab,
    #orders-tab * {
      animation: none !important;
      transition: none !important;
    }

    .orders-panel {
      background: #0d0e1b;
      border: 1px solid rgba(139, 92, 246, 0.35);
      border-radius: 20px;
      padding: 24px 28px;
      box-shadow: 0 0 35px -5px rgba(139, 92, 246, 0.15);
      position: relative;
    }
    [data-theme="light"] .orders-panel {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      box-shadow: 0 4px 25px -4px rgba(15, 23, 42, 0.06);
    }

    .orders-header-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      flex-wrap: wrap;
      margin-bottom: 22px;
    }
    .orders-header-left {
      display: flex;
      align-items: center;
      gap: 14px;
    }
    .orders-header-icon-box {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      background: rgba(139, 92, 246, 0.15);
      border: 1px solid rgba(139, 92, 246, 0.35);
      color: #c084fc;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    [data-theme="light"] .orders-header-icon-box {
      background: #ede9fe;
      border: 1px solid #ddd6fe;
      color: #7c3aed;
    }
    .orders-header-title {
      font-family: 'Outfit', sans-serif;
      font-size: 20px;
      font-weight: 800;
      color: #ffffff;
      margin: 0;
      letter-spacing: -0.2px;
    }
    [data-theme="light"] .orders-header-title {
      color: #0f172a;
    }
    .orders-header-subtitle {
      font-size: 13px;
      color: #94a3b8;
      margin-top: 2px;
    }
    [data-theme="light"] .orders-header-subtitle {
      color: #64748b;
    }

    .orders-header-right {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
    }
    .orders-search-box {
      display: flex;
      align-items: center;
      gap: 10px;
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.1);
      padding: 8px 16px;
      border-radius: 24px;
      width: 270px;
    }
    [data-theme="light"] .orders-search-box {
      background: #ffffff;
      border-color: #cbd5e1;
    }
    .orders-search-box:focus-within {
      border-color: #7c3aed;
    }
    .orders-search-icon {
      color: #94a3b8;
      display: flex;
      align-items: center;
    }
    .orders-search-field {
      background: transparent;
      border: none;
      outline: none;
      color: #ffffff;
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-size: 13px;
      width: 100%;
    }
    [data-theme="light"] .orders-search-field {
      color: #0f172a;
    }
    .orders-search-field::placeholder {
      color: #64748b;
    }
    .orders-search-clear {
      background: transparent;
      border: none;
      color: #94a3b8;
      cursor: pointer;
      font-size: 12px;
      padding: 0 2px;
    }
    .orders-search-clear:hover {
      color: #ffffff;
    }

    .btn-orders-refresh {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: #7c3aed;
      color: #ffffff;
      border: none;
      border-radius: 12px;
      padding: 9px 18px;
      font-family: 'Outfit', sans-serif;
      font-size: 13px;
      font-weight: 700;
      cursor: pointer;
    }
    .btn-orders-refresh:hover {
      background: #6d28d9;
    }

    /* Status Filters */
    .orders-filter-row {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 22px;
      flex-wrap: wrap;
    }
    .orders-filter-btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 8px 18px;
      border-radius: 20px;
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-size: 13px;
      font-weight: 700;
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.08);
      color: #cbd5e1;
      cursor: pointer;
    }
    [data-theme="light"] .orders-filter-btn {
      background: #f1f5f9;
      border-color: #e2e8f0;
      color: #475569;
    }
    .orders-filter-btn:hover {
      background: rgba(255, 255, 255, 0.08);
      border-color: rgba(255, 255, 255, 0.15);
      color: #ffffff;
    }
    [data-theme="light"] .orders-filter-btn:hover {
      background: #e2e8f0;
      color: #0f172a;
    }
    .orders-filter-btn.active {
      background: #7c3aed !important;
      border-color: #7c3aed !important;
      color: #ffffff !important;
    }
    .orders-tab-count {
      font-size: 12px;
      font-weight: 700;
      opacity: 0.9;
    }

    /* Orders Table */
    .orders-table-wrapper {
      width: 100%;
      overflow-x: auto;
    }
    .orders-table {
      width: 100%;
      border-collapse: separate;
      border-spacing: 0 10px;
      text-align: left;
    }
    .orders-table thead th {
      font-family: 'Outfit', sans-serif;
      font-size: 11px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: #94a3b8;
      padding: 6px 16px;
      border: none;
      background: transparent !important;
    }
    [data-theme="light"] .orders-table thead th {
      color: #64748b;
    }
    .orders-table tbody tr {
      background: rgba(18, 14, 38, 0.7);
    }
    [data-theme="light"] .orders-table tbody tr {
      background: #ffffff;
      box-shadow: 0 2px 8px rgba(15, 23, 42, 0.04);
    }
    .orders-table tbody tr:hover {
      background: rgba(25, 20, 50, 0.85);
    }
    [data-theme="light"] .orders-table tbody tr:hover {
      background: #f8fafc;
    }
    .orders-table tbody td {
      padding: 14px 16px;
      vertical-align: middle;
      border-top: 1px solid rgba(139, 92, 246, 0.15);
      border-bottom: 1px solid rgba(139, 92, 246, 0.15);
    }
    [data-theme="light"] .orders-table tbody td {
      border-top: 1px solid #e2e8f0;
      border-bottom: 1px solid #e2e8f0;
    }
    .orders-table tbody td:first-child {
      border-left: 1px solid rgba(139, 92, 246, 0.15);
      border-top-left-radius: 12px;
      border-bottom-left-radius: 12px;
    }
    [data-theme="light"] .orders-table tbody td:first-child {
      border-left: 1px solid #e2e8f0;
    }
    .orders-table tbody td:last-child {
      border-right: 1px solid rgba(139, 92, 246, 0.15);
      border-top-right-radius: 12px;
      border-bottom-right-radius: 12px;
    }
    [data-theme="light"] .orders-table tbody td:last-child {
      border-right: 1px solid #e2e8f0;
    }

    .order-id-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(139, 92, 246, 0.25);
      padding: 6px 10px;
      border-radius: 8px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 12px;
      font-weight: 700;
      color: #f1f5f9;
    }
    [data-theme="light"] .order-id-badge {
      background: #f8fafc;
      border-color: #cbd5e1;
      color: #1e293b;
    }
    .order-copy-btn {
      background: transparent;
      border: none;
      cursor: pointer;
      color: #94a3b8;
      display: inline-flex;
      align-items: center;
      padding: 2px;
    }
    .order-copy-btn:hover {
      color: #ffffff;
    }
    [data-theme="light"] .order-copy-btn:hover {
      color: #0f172a;
    }

    .order-item-cell {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .order-item-icon-box {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      font-size: 18px;
    }
    .icon-box-crown {
      background: rgba(245, 158, 11, 0.15);
      border: 1px solid rgba(245, 158, 11, 0.35);
    }
    .icon-box-coins {
      background: rgba(139, 92, 246, 0.15);
      border: 1px solid rgba(139, 92, 246, 0.35);
    }
    .order-item-info {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .order-item-title-row {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .order-item-title {
      font-family: 'Outfit', sans-serif;
      font-size: 14px;
      font-weight: 800;
      color: #ffffff;
    }
    [data-theme="light"] .order-item-title {
      color: #0f172a;
    }
    .order-buyer-name {
      font-size: 11px;
      color: #94a3b8;
      display: flex;
      align-items: center;
      gap: 4px;
    }
    [data-theme="light"] .order-buyer-name {
      color: #64748b;
    }
    .order-category-tag {
      background: rgba(139, 92, 246, 0.18);
      border: 1px solid rgba(139, 92, 246, 0.35);
      color: #c084fc;
      border-radius: 8px;
      padding: 3px 8px;
      font-size: 11px;
      font-weight: 700;
      margin-left: 10px;
      white-space: nowrap;
    }
    [data-theme="light"] .order-category-tag {
      background: #ede9fe;
      border-color: #ddd6fe;
      color: #7c3aed;
    }

    .order-amount-inr {
      font-family: 'JetBrains Mono', monospace;
      font-size: 14px;
      font-weight: 700;
      color: #ffffff;
    }
    [data-theme="light"] .order-amount-inr {
      color: #0f172a;
    }

    .order-coins-wrap {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 14px;
      font-weight: 800;
      color: #fbbf24;
    }
    .order-coin-img {
      width: 18px;
      height: 18px;
      object-fit: contain;
    }

    .order-status-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 0.04em;
      text-transform: uppercase;
    }
    .order-status-paid {
      background: rgba(16, 185, 129, 0.15);
      border: 1px solid rgba(16, 185, 129, 0.35);
      color: #34d399;
    }
    .order-status-pending {
      background: rgba(245, 158, 11, 0.15);
      border: 1px solid rgba(245, 158, 11, 0.35);
      color: #fbbf24;
    }
    .order-status-failed {
      background: rgba(239, 68, 68, 0.15);
      border: 1px solid rgba(239, 68, 68, 0.35);
      color: #f87171;
    }

    .order-date-text {
      font-size: 12px;
      color: #cbd5e1;
      font-weight: 600;
      line-height: 1.35;
    }
    [data-theme="light"] .order-date-text {
      color: #475569;
    }
    .order-date-time {
      font-size: 11px;
      color: #94a3b8;
    }
    [data-theme="light"] .order-date-time {
      color: #64748b;
    }

    .order-actions-wrap {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 8px;
    }
    .btn-order-inspect {
      background: #7c3aed;
      color: #ffffff;
      border: none;
      border-radius: 8px;
      padding: 6px 16px;
      font-family: 'Outfit', sans-serif;
      font-size: 12px;
      font-weight: 700;
      cursor: pointer;
    }
    .btn-order-inspect:hover {
      background: #6d28d9;
    }
    .btn-order-dots {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: #cbd5e1;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
    }
    [data-theme="light"] .btn-order-dots {
      background: #f1f5f9;
      border-color: #cbd5e1;
      color: #475569;
    }
    .btn-order-dots:hover {
      color: #ffffff;
      border-color: rgba(255, 255, 255, 0.25);
    }
    [data-theme="light"] .btn-order-dots:hover {
      color: #0f172a;
    }

    /* Orders Pagination */
    .orders-pagination-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      margin-top: 24px;
      flex-wrap: wrap;
    }
    .orders-pagination-info {
      font-size: 13px;
      font-weight: 600;
      color: #94a3b8;
    }
    [data-theme="light"] .orders-pagination-info {
      color: #64748b;
    }
    .orders-pagination-controls {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .orders-page-btn {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 13px;
      font-weight: 700;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: #cbd5e1;
      cursor: pointer;
    }
    [data-theme="light"] .orders-page-btn {
      background: #f1f5f9;
      border-color: #cbd5e1;
      color: #475569;
    }
    .orders-page-btn:hover:not(:disabled) {
      color: #ffffff;
      border-color: rgba(255, 255, 255, 0.25);
    }
    [data-theme="light"] .orders-page-btn:hover:not(:disabled) {
      color: #0f172a;
    }
    .orders-page-btn:disabled {
      opacity: 0.35;
      cursor: not-allowed;
    }
    .orders-page-btn.active {
      background: #7c3aed !important;
      border-color: #7c3aed !important;
      color: #ffffff !important;
    }
    .orders-page-size-select {
      background: rgba(18, 22, 38, 0.85);
      border: 1px solid rgba(255, 255, 255, 0.15);
      color: #ffffff;
      padding: 6px 12px;
      border-radius: 8px;
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-size: 12px;
      font-weight: 600;
      outline: none;
      cursor: pointer;
    }
    [data-theme="light"] .orders-page-size-select {
      background: #ffffff;
      border-color: #cbd5e1;
      color: #0f172a;
    }
    .orders-page-size-select option {
      background: #111422;
      color: #ffffff;
    }
    [data-theme="light"] .orders-page-size-select option {
      background: #ffffff;
      color: #0f172a;
    }

    /* ═══════════════════════════════════════════════════════════════
       TRANSACTIONS / LEDGER DASHBOARD (100% RECREATION OF REFERENCE UI)
       ═══════════════════════════════════════════════════════════════ */
    .tx-main-card {
      background: var(--card-solid, #ffffff);
      border: 1px solid var(--border, #e2e8f0);
      border-radius: 20px;
      padding: 24px 28px;
      box-shadow: 0 4px 25px -4px rgba(0, 0, 0, 0.05);
      position: relative;
    }
    [data-theme="dark"] .tx-main-card {
      background: #0e121e;
      border-color: rgba(255, 255, 255, 0.08);
      box-shadow: 0 12px 35px -4px rgba(0, 0, 0, 0.6);
    }

    /* Header Row */
    .tx-header-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 18px;
      flex-wrap: wrap;
      margin-bottom: 22px;
    }
    .tx-header-left {
      display: flex;
      align-items: center;
      gap: 14px;
    }
    .tx-header-icon-box {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      background: #ede9fe;
      color: #7c3aed;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    [data-theme="dark"] .tx-header-icon-box {
      background: rgba(139, 92, 246, 0.18);
      color: #c084fc;
      border: 1px solid rgba(139, 92, 246, 0.35);
    }
    .tx-page-title {
      font-family: 'Outfit', sans-serif;
      font-size: 20px;
      font-weight: 800;
      color: var(--text-heading, #0f172a);
      margin: 0;
      letter-spacing: -0.2px;
    }
    .tx-page-subtitle {
      font-size: 13px;
      color: var(--muted, #64748b);
      margin: 2px 0 0 0;
      font-weight: 500;
    }
    .tx-header-actions {
      display: flex;
      align-items: center;
      gap: 10px;
      flex-wrap: wrap;
    }

    /* Action Buttons */
    .btn-tx-secondary {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: var(--card-solid, #ffffff);
      border: 1px solid var(--border, #e2e8f0);
      border-radius: 10px;
      padding: 9px 15px;
      color: var(--text, #0f172a);
      font-family: 'Outfit', sans-serif;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.18s ease;
      user-select: none;
      white-space: nowrap;
    }
    .btn-tx-secondary:hover {
      border-color: #cbd5e1;
      background: var(--hover, #f8fafc);
    }
    [data-theme="dark"] .btn-tx-secondary {
      background: rgba(255, 255, 255, 0.04);
      border-color: rgba(255, 255, 255, 0.12);
      color: #f1f5f9;
    }
    [data-theme="dark"] .btn-tx-secondary:hover {
      background: rgba(255, 255, 255, 0.08);
      border-color: rgba(255, 255, 255, 0.2);
    }

    .btn-tx-primary {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: #7c3aed;
      border: 1px solid #7c3aed;
      border-radius: 10px;
      padding: 9px 18px;
      color: #ffffff;
      font-family: 'Outfit', sans-serif;
      font-size: 13px;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.18s ease;
      box-shadow: 0 2px 10px rgba(124, 58, 237, 0.35);
      user-select: none;
      white-space: nowrap;
    }
    .btn-tx-primary:hover {
      background: #6d28d9;
      border-color: #6d28d9;
      transform: translateY(-1px);
      box-shadow: 0 4px 14px rgba(124, 58, 237, 0.45);
    }

    .btn-tx-primary-sm {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background: #7c3aed;
      border: none;
      border-radius: 8px;
      padding: 6px 14px;
      color: #ffffff;
      font-family: 'Outfit', sans-serif;
      font-size: 12px;
      font-weight: 700;
      cursor: pointer;
      transition: background 0.15s ease;
    }
    .btn-tx-primary-sm:hover {
      background: #6d28d9;
    }

    .tx-chevron {
      font-size: 10px;
      color: var(--muted, #64748b);
      margin-left: 2px;
    }

    /* Date dropdown wrap */
    .tx-date-picker-wrap {
      position: relative;
    }
    .tx-dropdown-menu {
      position: absolute;
      top: calc(100% + 8px);
      right: 0;
      background: var(--dropdown-bg, #ffffff);
      border: 1px solid var(--border, #e2e8f0);
      border-radius: 14px;
      padding: 8px;
      width: 260px;
      box-shadow: 0 12px 30px rgba(0, 0, 0, 0.12);
      z-index: 100;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    [data-theme="dark"] .tx-dropdown-menu {
      background: #111422;
      border-color: rgba(139, 92, 246, 0.35);
      box-shadow: 0 16px 40px rgba(0, 0, 0, 0.6);
    }
    .tx-drop-item {
      padding: 8px 12px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 500;
      color: var(--text, #334155);
      cursor: pointer;
      transition: all 0.15s ease;
    }
    .tx-drop-item:hover, .tx-drop-item.active {
      background: #ede9fe;
      color: #7c3aed;
      font-weight: 700;
    }
    [data-theme="dark"] .tx-drop-item:hover, [data-theme="dark"] .tx-drop-item.active {
      background: rgba(139, 92, 246, 0.25);
      color: #ffffff;
    }
    .tx-drop-divider {
      height: 1px;
      background: var(--border, #e2e8f0);
      margin: 4px 0;
    }
    .tx-drop-custom {
      padding: 8px 10px;
    }
    .tx-date-input {
      width: 100%;
      padding: 6px 8px;
      border: 1px solid var(--border, #e2e8f0);
      border-radius: 6px;
      background: var(--input-bg, #f8fafc);
      color: var(--text, #0f172a);
      font-size: 11px;
      outline: none;
    }

    /* Filter Tabs / Pills */
    .tx-filter-tabs {
      display: flex;
      align-items: center;
      gap: 10px;
      flex-wrap: wrap;
      margin-bottom: 22px;
    }
    .tx-tab-pill {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: var(--card-solid, #ffffff);
      border: 1px solid var(--border, #e2e8f0);
      border-radius: 12px;
      padding: 8px 16px;
      color: #475569;
      font-family: 'Outfit', sans-serif;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.18s ease;
      user-select: none;
    }
    .tx-tab-pill:hover:not(.active) {
      border-color: #cbd5e1;
      background: var(--hover, #f8fafc);
      color: var(--text-heading, #0f172a);
    }
    [data-theme="dark"] .tx-tab-pill {
      background: rgba(255, 255, 255, 0.04);
      border-color: rgba(255, 255, 255, 0.1);
      color: #94a3b8;
    }
    [data-theme="dark"] .tx-tab-pill:hover:not(.active) {
      background: rgba(255, 255, 255, 0.08);
      color: #ffffff;
    }
    .tx-tab-pill.active {
      background: #7c3aed !important;
      border-color: #7c3aed !important;
      color: #ffffff !important;
      box-shadow: 0 4px 14px rgba(124, 58, 237, 0.35) !important;
    }
    .tx-tab-badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 22px;
      height: 20px;
      padding: 0 6px;
      border-radius: 10px;
      font-size: 11px;
      font-weight: 700;
      background: #f1f5f9;
      color: #64748b;
      margin-left: 2px;
    }
    [data-theme="dark"] .tx-tab-badge {
      background: rgba(255, 255, 255, 0.08);
      color: #cbd5e1;
    }
    .tx-tab-pill.active .tx-tab-badge {
      background: rgba(255, 255, 255, 0.25) !important;
      color: #ffffff !important;
    }

    /* Summary Cards Grid */
    .tx-stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
      margin-bottom: 24px;
    }
    @media (max-width: 1024px) {
      .tx-stats-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }
    @media (max-width: 640px) {
      .tx-stats-grid {
        grid-template-columns: 1fr;
      }
    }
    .tx-stat-card {
      background: #ffffff;
      border: 1px solid #eef2f6;
      border-radius: 16px;
      padding: 18px 20px;
      display: flex;
      align-items: center;
      gap: 16px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
      transition: all 0.2s ease;
    }
    [data-theme="dark"] .tx-stat-card {
      background: rgba(14, 18, 30, 0.7);
      border-color: rgba(255, 255, 255, 0.08);
      box-shadow: none;
    }
    .tx-stat-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 18px -3px rgba(0, 0, 0, 0.06);
    }
    [data-theme="dark"] .tx-stat-card:hover {
      box-shadow: 0 6px 18px -3px rgba(139, 92, 246, 0.15);
      border-color: rgba(139, 92, 246, 0.3);
    }
    .tx-stat-circle {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      font-size: 18px;
      font-weight: 800;
    }
    .circle-green {
      background: #dcfce7;
      color: #16a34a;
    }
    [data-theme="dark"] .circle-green {
      background: rgba(16, 185, 129, 0.18);
      color: #34d399;
    }
    .circle-red {
      background: #fee2e2;
      color: #ef4444;
    }
    [data-theme="dark"] .circle-red {
      background: rgba(239, 68, 68, 0.18);
      color: #f87171;
    }
    .circle-purple {
      background: #ede9fe;
      color: #7c3aed;
    }
    [data-theme="dark"] .circle-purple {
      background: rgba(139, 92, 246, 0.18);
      color: #c084fc;
    }
    .circle-gold {
      background: #fef3c7;
      color: #d97706;
    }
    [data-theme="dark"] .circle-gold {
      background: rgba(245, 158, 11, 0.18);
      color: #fbbf24;
    }
    .stat-arrow-icon {
      font-size: 22px;
      font-weight: 900;
      line-height: 1;
    }
    .tx-stat-info {
      display: flex;
      flex-direction: column;
      min-width: 0;
    }
    .tx-stat-title {
      font-size: 12px;
      font-weight: 600;
      color: var(--muted, #64748b);
      margin-bottom: 3px;
    }
    .tx-stat-val {
      font-family: 'Outfit', sans-serif;
      font-size: 22px;
      font-weight: 800;
      line-height: 1.1;
      margin-bottom: 2px;
      letter-spacing: -0.3px;
    }
    .text-green {
      color: #16a34a;
    }
    .text-red {
      color: #ef4444;
    }
    .text-navy {
      color: var(--text-heading, #0f172a);
    }
    [data-theme="dark"] .text-green {
      color: #34d399;
    }
    [data-theme="dark"] .text-red {
      color: #f87171;
    }
    .tx-stat-sub {
      font-size: 11px;
      color: #94a3b8;
      font-weight: 500;
    }

    /* Table Filter Controls Bar */
    .tx-table-controls-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 14px;
      margin-bottom: 16px;
      flex-wrap: wrap;
    }
    .tx-search-input-box {
      position: relative;
      display: flex;
      align-items: center;
      width: 320px;
      background: var(--input-bg, #ffffff);
      border: 1px solid var(--input-border, #e2e8f0);
      border-radius: 10px;
      padding: 0 12px;
      height: 40px;
      transition: all 0.18s ease;
    }
    .tx-search-input-box:focus-within {
      border-color: #7c3aed;
      box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.15);
    }
    .tx-search-glass {
      color: var(--muted, #94a3b8);
      flex-shrink: 0;
    }
    .tx-search-field {
      width: 100%;
      border: none;
      outline: none;
      background: transparent;
      font-size: 13px;
      color: var(--text, #0f172a);
      padding: 0 8px;
      font-family: inherit;
    }
    .tx-search-clear {
      background: none;
      border: none;
      color: var(--muted, #94a3b8);
      cursor: pointer;
      font-size: 14px;
      padding: 2px 4px;
      border-radius: 4px;
    }
    .tx-search-clear:hover {
      color: var(--text-heading, #0f172a);
    }
    .tx-filter-menu-wrap {
      position: relative;
    }
    .tx-filter-option {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 10px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 500;
      color: var(--text, #334155);
      cursor: pointer;
      transition: background 0.15s ease;
    }
    .tx-filter-option:hover {
      background: #ede9fe;
      color: #7c3aed;
    }
    [data-theme="dark"] .tx-filter-option:hover {
      background: rgba(139, 92, 246, 0.2);
      color: #ffffff;
    }
    .btn-tx-reset {
      width: 100%;
      padding: 6px;
      border: 1px dashed var(--border, #cbd5e1);
      border-radius: 6px;
      background: transparent;
      color: var(--muted, #64748b);
      font-size: 11px;
      font-weight: 600;
      cursor: pointer;
      margin-top: 4px;
    }
    .btn-tx-reset:hover {
      border-color: #ef4444;
      color: #ef4444;
    }

    /* Table Container & Table */
    .tx-table-container {
      border: 1px solid var(--border, #eef2f6);
      border-radius: 14px;
      overflow-x: auto;
      background: var(--card-solid, #ffffff);
    }
    [data-theme="dark"] .tx-table-container {
      background: #0e121e;
      border-color: rgba(255, 255, 255, 0.08);
    }
    .tx-table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
    }
    .tx-table thead th {
      padding: 14px 18px;
      font-family: 'Outfit', sans-serif;
      font-size: 11px;
      font-weight: 800;
      color: var(--muted, #64748b);
      letter-spacing: 0.05em;
      text-transform: uppercase;
      border-bottom: 1px solid var(--border, #eef2f6);
      background: #f8fafc;
      white-space: nowrap;
    }
    [data-theme="dark"] .tx-table thead th {
      background: rgba(18, 22, 38, 0.85);
      border-bottom-color: rgba(255, 255, 255, 0.08);
      color: #94a3b8;
    }
    .tx-table thead th.th-sortable {
      cursor: pointer;
      user-select: none;
    }
    .tx-table thead th.th-sortable:hover {
      color: #7c3aed;
    }
    .tx-table tbody tr {
      border-bottom: 1px solid #f1f5f9;
      transition: background 0.15s ease;
    }
    [data-theme="dark"] .tx-table tbody tr {
      border-bottom-color: rgba(255, 255, 255, 0.04);
    }
    .tx-table tbody tr:hover {
      background: #faf5ff;
    }
    [data-theme="dark"] .tx-table tbody tr:hover {
      background: rgba(139, 92, 246, 0.08);
    }
    .tx-table tbody td {
      padding: 13px 18px;
      font-size: 13px;
      vertical-align: middle;
    }

    /* Cell details */
    .tx-date-cell {
      display: flex;
      flex-direction: column;
      gap: 2px;
      white-space: nowrap;
    }
    .tx-date-primary {
      font-weight: 700;
      color: var(--text-heading, #0f172a);
      font-size: 13px;
    }
    .tx-date-secondary {
      font-size: 11px;
      color: var(--muted, #64748b);
    }

    .tx-member-cell {
      display: flex;
      align-items: center;
      gap: 10px;
      white-space: nowrap;
    }
    .tx-member-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      object-fit: cover;
      background: #e2e8f0;
      border: 1px solid rgba(139, 92, 246, 0.2);
    }
    .tx-member-meta {
      display: flex;
      flex-direction: column;
    }
    .tx-member-name {
      font-weight: 700;
      color: var(--text-heading, #0f172a);
      font-size: 13px;
      line-height: 1.2;
    }
    .tx-member-id {
      font-size: 11px;
      color: var(--muted, #94a3b8);
      font-weight: 500;
    }

    .tx-coins-cell {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-family: 'Outfit', sans-serif;
      font-size: 15px;
      font-weight: 800;
      white-space: nowrap;
    }
    .tx-coin-icon {
      width: 18px;
      height: 18px;
      object-fit: contain;
      filter: drop-shadow(0 2px 4px rgba(245, 158, 11, 0.4));
    }

    /* Badges */
    .tx-badge {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      font-family: 'Outfit', sans-serif;
      font-size: 11px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      padding: 4px 10px;
      border-radius: 6px;
      white-space: nowrap;
    }
    .badge-admin {
      background: #d1fae5;
      color: #059669;
    }
    [data-theme="dark"] .badge-admin {
      background: rgba(16, 185, 129, 0.16);
      color: #34d399;
      border: 1px solid rgba(16, 185, 129, 0.35);
    }
    .badge-purchase {
      background: #fee2e2;
      color: #dc2626;
    }
    [data-theme="dark"] .badge-purchase {
      background: rgba(239, 68, 68, 0.16);
      color: #f87171;
      border: 1px solid rgba(239, 68, 68, 0.35);
    }
    .badge-topup {
      background: #dcfce7;
      color: #16a34a;
    }
    [data-theme="dark"] .badge-topup {
      background: rgba(16, 185, 129, 0.16);
      color: #34d399;
      border: 1px solid rgba(16, 185, 129, 0.35);
    }
    .badge-reward {
      background: #fef3c7;
      color: #d97706;
    }
    [data-theme="dark"] .badge-reward {
      background: rgba(245, 158, 11, 0.16);
      color: #fbbf24;
      border: 1px solid rgba(245, 158, 11, 0.35);
    }

    .tx-reason-cell {
      color: var(--text, #334155);
      font-size: 13px;
      font-weight: 500;
      max-width: 240px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .tx-ref-cell {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      white-space: nowrap;
    }
    .tx-ref-badge {
      background: #eff6ff;
      color: #4f46e5;
      border-radius: 6px;
      padding: 4px 8px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 12px;
      font-weight: 600;
      letter-spacing: 0.02em;
    }
    [data-theme="dark"] .tx-ref-badge {
      background: rgba(139, 92, 246, 0.15);
      color: #c4b5fd;
      border: 1px solid rgba(139, 92, 246, 0.25);
    }
    .btn-copy-icon {
      background: transparent;
      border: none;
      color: var(--muted, #94a3b8);
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 4px;
      border-radius: 6px;
      transition: all 0.15s ease;
    }
    .btn-copy-icon:hover {
      color: #7c3aed;
      background: #ede9fe;
    }
    [data-theme="dark"] .btn-copy-icon:hover {
      color: #ffffff;
      background: rgba(255, 255, 255, 0.1);
    }

    .btn-tx-dots {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      border: 1px solid var(--border, #e2e8f0);
      background: var(--card-solid, #ffffff);
      color: var(--muted, #64748b);
      font-size: 14px;
      font-weight: 800;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      transition: all 0.15s ease;
      letter-spacing: 1px;
    }
    .btn-tx-dots:hover {
      border-color: #7c3aed;
      color: #7c3aed;
      background: #f8fafc;
    }
    [data-theme="dark"] .btn-tx-dots {
      background: rgba(255, 255, 255, 0.04);
      border-color: rgba(255, 255, 255, 0.1);
      color: #cbd5e1;
    }
    [data-theme="dark"] .btn-tx-dots:hover {
      background: rgba(139, 92, 246, 0.2);
      border-color: #8b5cf6;
      color: #ffffff;
    }

    /* Pagination Footer */
    .tx-pagination-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-top: 18px;
      gap: 14px;
      flex-wrap: wrap;
    }
    .tx-pagination-info {
      font-size: 13px;
      color: var(--muted, #64748b);
    }
    .tx-pagination-buttons {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .tx-page-btn {
      min-width: 32px;
      height: 32px;
      padding: 0 8px;
      border-radius: 8px;
      border: 1px solid var(--border, #e2e8f0);
      background: var(--card-solid, #ffffff);
      color: var(--text, #475569);
      font-family: 'Outfit', sans-serif;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      transition: all 0.15s ease;
    }
    .tx-page-btn:hover:not(.active):not(:disabled) {
      border-color: #cbd5e1;
      background: var(--hover, #f8fafc);
    }
    .tx-page-btn.active {
      background: #7c3aed !important;
      border-color: #7c3aed !important;
      color: #ffffff !important;
      border-radius: 50% !important;
      font-weight: 700;
    }
    .tx-page-btn:disabled {
      opacity: 0.35;
      cursor: not-allowed;
    }
    [data-theme="dark"] .tx-page-btn {
      background: rgba(255, 255, 255, 0.04);
      border-color: rgba(255, 255, 255, 0.1);
      color: #cbd5e1;
    }
    .tx-page-ellipsis {
      padding: 0 4px;
      color: var(--muted, #94a3b8);
      font-size: 12px;
    }
    .tx-page-size-select {
      border: 1px solid var(--border, #e2e8f0);
      border-radius: 8px;
      padding: 6px 12px;
      background: var(--card-solid, #ffffff);
      color: var(--text, #475569);
      font-family: 'Outfit', sans-serif;
      font-size: 13px;
      font-weight: 600;
      outline: none;
      cursor: pointer;
    }
    [data-theme="dark"] .tx-page-size-select {
      background: rgba(18, 22, 38, 0.85);
      border-color: rgba(255, 255, 255, 0.12);
      color: #ffffff;
    }

    /* Empty and Loading States */
    .tx-empty-state {
      text-align: center;
      padding: 50px 20px;
    }
    .tx-empty-icon {
      font-size: 40px;
      margin-bottom: 10px;
    }
    .tx-empty-title {
      font-family: 'Outfit', sans-serif;
      font-size: 16px;
      font-weight: 700;
      color: var(--text-heading, #0f172a);
      margin-bottom: 4px;
    }
    .tx-empty-desc {
      font-size: 13px;
      color: var(--muted, #64748b);
      max-width: 400px;
      margin: 0 auto;
    }
    .tx-loading-spinner {
      width: 28px;
      height: 28px;
      border: 3px solid rgba(124, 58, 237, 0.2);
      border-top-color: #7c3aed;
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
      margin: 0 auto;
    }

    /* Modal detail styling */
    .tx-modal-content {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .tx-detail-banner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 20px;
      border-radius: 14px;
      margin-bottom: 6px;
    }
    .banner-green {
      background: #dcfce7;
      color: #16a34a;
    }
    [data-theme="dark"] .banner-green {
      background: rgba(16, 185, 129, 0.16);
      color: #34d399;
    }
    .banner-red {
      background: #fee2e2;
      color: #ef4444;
    }
    [data-theme="dark"] .banner-red {
      background: rgba(239, 68, 68, 0.16);
      color: #f87171;
    }
    .tx-detail-amount {
      display: flex;
      align-items: center;
      gap: 8px;
      font-family: 'Outfit', sans-serif;
      font-size: 24px;
      font-weight: 900;
    }
    .tx-detail-type {
      font-family: 'Outfit', sans-serif;
      font-size: 12px;
      font-weight: 800;
      letter-spacing: 0.05em;
    }
    .tx-detail-grid {
      display: flex;
      flex-direction: column;
      gap: 10px;
      background: var(--subcard-bg, #f8fafc);
      padding: 16px;
      border-radius: 12px;
      border: 1px solid var(--border, #e2e8f0);
    }
    .tx-detail-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 13px;
      gap: 12px;
    }
    .tx-detail-key {
      color: var(--muted, #64748b);
      font-weight: 500;
    }
    .tx-detail-val {
      font-weight: 600;
      color: var(--text-heading, #0f172a);
      text-align: right;
    }
    .font-mono {
      font-family: 'JetBrains Mono', monospace;
    }
    .font-semibold {
      font-weight: 700;
    }
    .text-muted {
      color: var(--muted, #64748b);
    }
    .btn-copy-inline {
      margin-left: 6px;
      padding: 2px 6px;
      font-size: 11px;
      border: 1px solid var(--border, #cbd5e1);
      border-radius: 4px;
      background: transparent;
      cursor: pointer;
      color: var(--muted, #64748b);
    }
    .btn-copy-inline:hover {
      color: #7c3aed;
      border-color: #7c3aed;
    }
    .tx-detail-divider {
      height: 1px;
      background: var(--border, #e2e8f0);
      margin: 4px 0;
    }
    .tx-detail-section-title {
      font-size: 11px;
      font-weight: 800;
      color: var(--muted, #64748b);
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    /* Top Up Sidebar Card & Global Search styles matching Reference Image */
    .sidebar-topup-card {
      background: linear-gradient(135deg, rgba(237, 233, 254, 0.6) 0%, rgba(245, 243, 255, 0.9) 100%);
      border: 1px solid rgba(124, 58, 237, 0.2);
      border-radius: 18px;
      padding: 16px;
      text-align: center;
      margin: 16px 14px 10px 14px;
      position: relative;
      overflow: hidden;
      box-shadow: 0 4px 15px rgba(124, 58, 237, 0.08);
    }
    [data-theme="dark"] .sidebar-topup-card {
      background: linear-gradient(135deg, rgba(30, 27, 75, 0.6) 0%, rgba(15, 23, 42, 0.8) 100%);
      border-color: rgba(139, 92, 246, 0.3);
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
    }
    .topup-card-art {
      width: 56px;
      height: 56px;
      margin: 0 auto 10px auto;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .topup-coin-art {
      width: 100%;
      height: 100%;
      object-fit: contain;
      filter: drop-shadow(0 6px 12px rgba(245, 158, 11, 0.45));
    }
    .topup-card-title {
      font-family: 'Outfit', sans-serif;
      font-size: 14px;
      font-weight: 800;
      color: var(--text-heading, #0f172a);
      margin-bottom: 4px;
    }
    .topup-card-desc {
      font-size: 11px;
      color: var(--muted, #64748b);
      margin-bottom: 12px;
      line-height: 1.35;
    }
    .btn-sidebar-topup {
      width: 100%;
      background: linear-gradient(135deg, #7c3aed 0%, #6366f1 100%);
      border: none;
      border-radius: 10px;
      padding: 9px 12px;
      color: #ffffff;
      font-family: 'Outfit', sans-serif;
      font-size: 12px;
      font-weight: 700;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      box-shadow: 0 3px 10px rgba(124, 58, 237, 0.35);
      transition: all 0.18s ease;
    }
    .btn-sidebar-topup:hover {
      transform: translateY(-1px);
      box-shadow: 0 6px 16px rgba(124, 58, 237, 0.5);
    }

    .header-global-search {
      display: flex;
      align-items: center;
      gap: 10px;
      background: var(--input-bg, #f8fafc);
      border: 1px solid var(--input-border, #e2e8f0);
      border-radius: 12px;
      padding: 0 14px;
      height: 38px;
      width: 280px;
      transition: all 0.18s ease;
    }
    .header-global-search:focus-within {
      border-color: #7c3aed;
      box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.12);
      width: 320px;
    }
    .header-search-input {
      width: 100%;
      border: none;
      outline: none;
      background: transparent;
      font-size: 13px;
      color: var(--text, #0f172a);
      font-family: inherit;
    }
    .header-search-kbd {
      font-family: 'JetBrains Mono', monospace;
      font-size: 10px;
      color: var(--muted, #94a3b8);
      background: var(--card-solid, #ffffff);
      border: 1px solid var(--border, #e2e8f0);
      border-radius: 4px;
      padding: 2px 6px;
      white-space: nowrap;
    }
    [data-theme="dark"] .header-search-kbd {
      background: rgba(255, 255, 255, 0.08);
      border-color: rgba(255, 255, 255, 0.12);
      color: #94a3b8;
    }

    /* Cosmic Glow for Sidebar corner */
    .sidebar-cosmic-glow {
      position: absolute;
      bottom: -40px;
      left: -50px;
      width: 300px;
      height: 300px;
      background: radial-gradient(circle at 30% 70%, rgba(168, 85, 247, 0.5) 0%, rgba(99, 102, 241, 0.35) 30%, rgba(6, 182, 212, 0.25) 55%, transparent 75%);
      filter: blur(28px);
      pointer-events: none;
      z-index: 0;
    }
    /* ══════════════════════════════════════════════════════════════════════
       SERVER WALLET REDESIGN (Exact Reference Image Pixel-Perfect Implementation)
       ══════════════════════════════════════════════════════════════════════ */
    .wallet-hero-card {
      background: #080c1e;
      border: 1.5px solid rgba(139, 92, 246, 0.35);
      border-radius: 20px;
      padding: 24px 28px;
      margin-bottom: 24px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.05);
      position: relative;
      overflow: hidden;
    }
    [data-theme="light"] .wallet-hero-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
    }

    .wallet-header-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      flex-wrap: wrap;
      margin-bottom: 20px;
    }

    .wallet-header-left {
      display: flex;
      align-items: center;
      gap: 14px;
    }
    .wallet-header-icon-box {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      background: #6d28d9;
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      box-shadow: 0 4px 14px rgba(109, 40, 217, 0.4);
    }
    [data-theme="light"] .wallet-header-icon-box {
      background: #7c3aed;
      color: #ffffff;
    }
    .wallet-header-title {
      font-family: 'Outfit', sans-serif;
      font-size: 20px;
      font-weight: 700;
      color: #ffffff;
      line-height: 1.2;
    }
    [data-theme="light"] .wallet-header-title {
      color: #0f172a;
    }
    .wallet-header-subtitle {
      font-size: 13px;
      color: #94a3b8;
      margin-top: 3px;
    }
    [data-theme="light"] .wallet-header-subtitle {
      color: #64748b;
    }

    /* Server Info Badge (Informational only - no dropdown, no switching) */
    .wallet-server-badge {
      display: inline-flex;
      align-items: center;
      gap: 12px;
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 14px;
      padding: 8px 16px 8px 10px;
      user-select: none;
    }
    [data-theme="light"] .wallet-server-badge {
      background: #f8fafc;
      border-color: #e2e8f0;
    }
    .wallet-server-logo-wrap {
      width: 38px;
      height: 38px;
      border-radius: 10px;
      background: #5865F2;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .wallet-server-logo {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .wallet-server-name {
      font-size: 14px;
      font-weight: 700;
      color: #ffffff;
      white-space: nowrap;
      line-height: 1.2;
    }
    [data-theme="light"] .wallet-server-name {
      color: #0f172a;
    }
    .wallet-server-members {
      font-size: 11.5px;
      color: #94a3b8;
      margin-top: 2px;
    }
    [data-theme="light"] .wallet-server-members {
      color: #64748b;
    }

    /* Hero Balance and Action Cards Container */
    .wallet-hero-body {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 32px;
      flex-wrap: wrap;
    }

    .wallet-hero-left {
      display: flex;
      align-items: center;
      gap: 22px;
      flex: 1;
      min-width: 280px;
    }

    .wallet-pedestal-artwork {
      width: 175px;
      height: 175px;
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      background: transparent;
      border: none;
    }
    .wallet-pedestal-img {
      width: 100%;
      height: 100%;
      object-fit: contain;
      filter: drop-shadow(0 0 24px rgba(168, 85, 247, 0.45));
      border: none;
    }

    .wallet-balance-box {
      display: flex;
      flex-direction: column;
      gap: 5px;
      justify-content: center;
    }
    .wallet-balance-heading {
      font-size: 14.5px;
      font-weight: 600;
      color: #94a3b8;
      letter-spacing: 0.2px;
      display: flex;
      align-items: center;
    }
    [data-theme="light"] .wallet-balance-heading {
      color: #64748b;
    }
    .wallet-info-dot {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 16px;
      height: 16px;
      border-radius: 50%;
      background: #7c3aed;
      color: #ffffff;
      font-size: 10px;
      font-weight: 700;
      margin-left: 6px;
      cursor: help;
    }
    .wallet-balance-val-row {
      display: inline-flex;
      align-items: center;
      gap: 12px;
      line-height: 1;
      margin-top: 2px;
    }
    .wallet-balance-num {
      font-family: 'Outfit', sans-serif;
      font-size: 46px;
      font-weight: 800;
      color: #fbbf24;
      letter-spacing: -0.5px;
      line-height: 1;
      text-shadow: 0 0 24px rgba(251, 191, 36, 0.35);
    }
    [data-theme="light"] .wallet-balance-num {
      color: #d97706;
    }
    .wallet-balance-sub {
      font-size: 12px;
      color: #94a3b8;
      margin-top: 4px;
      line-height: 1.4;
      max-width: 340px;
    }
    [data-theme="light"] .wallet-balance-sub {
      color: #64748b;
    }

    /* Right Action Cards */
    .wallet-hero-actions {
      display: flex;
      align-items: center;
      gap: 16px;
      flex-wrap: wrap;
    }
    .wallet-action-card {
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 16px 20px;
      border-radius: 16px;
      min-width: 230px;
      cursor: pointer;
      transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
      user-select: none;
    }
    .wallet-action-topup {
      background: linear-gradient(135deg, rgba(139, 92, 246, 0.22) 0%, rgba(109, 40, 217, 0.12) 100%);
      border: 1.5px solid rgba(139, 92, 246, 0.4);
    }
    .wallet-action-topup:hover {
      transform: translateY(-2px);
      background: linear-gradient(135deg, rgba(139, 92, 246, 0.3) 0%, rgba(109, 40, 217, 0.18) 100%);
      border-color: rgba(167, 139, 250, 0.65);
      box-shadow: 0 8px 24px rgba(139, 92, 246, 0.3);
    }
    [data-theme="light"] .wallet-action-topup {
      background: #fbf9ff;
      border: 1.5px solid #ddd6fe;
    }
    [data-theme="light"] .wallet-action-topup:hover {
      background: #f5f3ff;
      border-color: #c4b5fd;
      box-shadow: 0 6px 20px rgba(139, 92, 246, 0.15);
    }

    .wallet-action-shop {
      background: linear-gradient(135deg, rgba(37, 99, 235, 0.22) 0%, rgba(29, 78, 216, 0.12) 100%);
      border: 1.5px solid rgba(59, 130, 246, 0.4);
    }
    .wallet-action-shop:hover {
      transform: translateY(-2px);
      background: linear-gradient(135deg, rgba(37, 99, 235, 0.3) 0%, rgba(29, 78, 216, 0.18) 100%);
      border-color: rgba(96, 165, 250, 0.65);
      box-shadow: 0 8px 24px rgba(37, 99, 235, 0.3);
    }
    [data-theme="light"] .wallet-action-shop {
      background: #f8fbff;
      border: 1.5px solid #bfdbfe;
    }
    [data-theme="light"] .wallet-action-shop:hover {
      background: #eff6ff;
      border-color: #93c5fd;
      box-shadow: 0 6px 20px rgba(37, 99, 235, 0.15);
    }

    .wallet-action-icon {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      color: #ffffff;
      font-size: 20px;
    }
    .wallet-icon-purple {
      background: #8b5cf6;
      box-shadow: 0 4px 12px rgba(139, 92, 246, 0.4);
    }
    .wallet-icon-blue {
      background: #2563eb;
      box-shadow: 0 4px 12px rgba(37, 99, 235, 0.4);
    }

    .wallet-action-title {
      font-size: 15px;
      font-weight: 700;
      color: #ffffff;
      line-height: 1.2;
    }
    [data-theme="light"] .wallet-action-title {
      color: #0f172a;
    }
    .wallet-action-desc {
      font-size: 11.5px;
      margin-top: 3px;
    }
    .wallet-action-topup .wallet-action-desc {
      color: #c4b5fd;
    }
    [data-theme="light"] .wallet-action-topup .wallet-action-desc {
      color: #6d28d9;
    }
    .wallet-action-shop .wallet-action-desc {
      color: #93c5fd;
    }
    [data-theme="light"] .wallet-action-shop .wallet-action-desc {
      color: #1d4ed8;
    }

    .wallet-action-arrow {
      margin-left: auto;
      font-size: 18px;
      font-weight: 700;
      transition: transform 0.2s ease;
    }
    .wallet-action-topup .wallet-action-arrow {
      color: #a78bfa;
    }
    [data-theme="light"] .wallet-action-topup .wallet-action-arrow {
      color: #7c3aed;
    }
    .wallet-action-shop .wallet-action-arrow {
      color: #60a5fa;
    }
    [data-theme="light"] .wallet-action-shop .wallet-action-arrow {
      color: #2563eb;
    }
    .wallet-action-card:hover .wallet-action-arrow {
      transform: translateX(3px);
    }

    /* ══════════════════════════════════════════════════════════════════════
       MEMBERSHIP TIERS & BALANCE THRESHOLDS ROADMAP STYLES
       ══════════════════════════════════════════════════════════════════════ */
    .wallet-tier-badge {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      font-size: 11px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      padding: 3px 10px;
      border-radius: 12px;
      border: 1px solid var(--border);
      margin-left: 10px;
      vertical-align: middle;
      transition: all 0.3s ease;
    }
    .wallet-tier-progress-sub {
      margin-top: 10px;
      max-width: 380px;
    }
    .wallet-tier-prog-bar-wrap {
      width: 100%;
      height: 6px;
      background: rgba(255, 255, 255, 0.08);
      border-radius: 10px;
      overflow: hidden;
      margin-bottom: 6px;
    }
    [data-theme="light"] .wallet-tier-prog-bar-wrap {
      background: rgba(0, 0, 0, 0.08);
    }
    .wallet-tier-prog-bar-fill {
      height: 100%;
      border-radius: 10px;
      transition: width 0.6s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .wallet-tier-prog-text {
      font-size: 12px;
      color: #94a3b8;
      font-weight: 500;
      line-height: 1.3;
    }
    [data-theme="light"] .wallet-tier-prog-text {
      color: #64748b;
    }

    /* Roadmap Card */
    .wallet-tiers-card {
      background: #080c1e;
      border: 1.5px solid rgba(139, 92, 246, 0.28);
      border-radius: 20px;
      padding: 24px 28px;
      margin-bottom: 24px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.05);
      position: relative;
      overflow: hidden;
    }
    [data-theme="light"] .wallet-tiers-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
    }
    .wallet-tiers-card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      flex-wrap: wrap;
      margin-bottom: 22px;
    }
    .wallet-tiers-header-left {
      display: flex;
      align-items: center;
      gap: 14px;
    }
    .wallet-tiers-icon-box {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      background: linear-gradient(135deg, rgba(245, 158, 11, 0.25), rgba(168, 85, 247, 0.25));
      border: 1px solid rgba(245, 158, 11, 0.4);
      color: #fbbf24;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      box-shadow: 0 4px 14px rgba(245, 158, 11, 0.25);
    }
    .wallet-tiers-title {
      font-family: 'Outfit', sans-serif;
      font-size: 19px;
      font-weight: 700;
      color: #ffffff;
      line-height: 1.2;
    }
    [data-theme="light"] .wallet-tiers-title {
      color: #0f172a;
    }
    .wallet-tiers-subtitle {
      font-size: 13px;
      color: #94a3b8;
      margin-top: 3px;
    }
    [data-theme="light"] .wallet-tiers-subtitle {
      color: #64748b;
    }
    .wallet-btn-topup-tier {
      background: linear-gradient(135deg, #7c3aed, #9333ea);
      color: #ffffff;
      border: none;
      border-radius: 12px;
      padding: 10px 18px;
      font-size: 13px;
      font-weight: 700;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: all 0.25s ease;
      box-shadow: 0 4px 14px rgba(124, 58, 237, 0.35);
    }
    .wallet-btn-topup-tier:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(124, 58, 237, 0.5);
    }

    /* Grid of 5 Tiers */
    .membership-tiers-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
    }
    .tier-card {
      background: rgba(255, 255, 255, 0.025);
      border: 1.5px solid rgba(255, 255, 255, 0.08);
      border-radius: 16px;
      padding: 18px 16px;
      display: flex;
      flex-direction: column;
      gap: 8px;
      position: relative;
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }
    [data-theme="light"] .tier-card {
      background: #f8fafc;
      border-color: #e2e8f0;
    }
    .tier-card:hover {
      transform: translateY(-3px);
      border-color: rgba(255, 255, 255, 0.2);
    }
    .tier-card-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
    }
    .tier-card-badge {
      font-size: 13px;
      font-weight: 800;
      letter-spacing: 0.04em;
    }
    .tier-status-pill {
      font-size: 10px;
      font-weight: 800;
      text-transform: uppercase;
      padding: 2px 7px;
      border-radius: 8px;
    }
    .pill-current {
      background: rgba(34, 197, 94, 0.2);
      border: 1px solid #22c55e;
      color: #4ade80;
      box-shadow: 0 0 10px rgba(34, 197, 94, 0.35);
    }
    .pill-unlocked {
      background: rgba(59, 130, 246, 0.15);
      border: 1px solid rgba(59, 130, 246, 0.4);
      color: #60a5fa;
    }
    .pill-locked {
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: #94a3b8;
    }
    .tier-card-balance {
      font-family: 'Outfit', sans-serif;
      font-size: 22px;
      font-weight: 800;
      line-height: 1.2;
    }
    .tier-card-desc {
      font-size: 11.5px;
      color: #94a3b8;
      line-height: 1.4;
      flex: 1;
    }
    [data-theme="light"] .tier-card-desc {
      color: #64748b;
    }
    .tier-card-req {
      font-size: 11px;
      font-weight: 600;
      color: #cbd5e1;
      padding-top: 8px;
      border-top: 1px dashed rgba(255, 255, 255, 0.08);
    }
    [data-theme="light"] .tier-card-req {
      color: #475569;
      border-top-color: #e2e8f0;
    }

    /* Individual Tier Color Accents */
    .tier-card-member .tier-card-badge { color: #38bdf8; }
    .tier-card-member .tier-card-balance { color: #7dd3fc; }
    .tier-card-member.tier-active {
      border-color: #38bdf8;
      box-shadow: 0 0 20px rgba(56, 189, 248, 0.3);
      background: rgba(56, 189, 248, 0.06);
    }

    .tier-card-vip .tier-card-badge { color: #f59e0b; }
    .tier-card-vip .tier-card-balance { color: #fbbf24; }
    .tier-card-vip.tier-active {
      border-color: #f59e0b;
      box-shadow: 0 0 20px rgba(245, 158, 11, 0.35);
      background: rgba(245, 158, 11, 0.08);
    }

    .tier-card-silver .tier-card-badge { color: #94a3b8; }
    .tier-card-silver .tier-card-balance { color: #e2e8f0; }
    .tier-card-silver.tier-active {
      border-color: #cbd5e1;
      box-shadow: 0 0 20px rgba(203, 213, 225, 0.35);
      background: rgba(148, 163, 184, 0.08);
    }

    .tier-card-gold .tier-card-badge { color: #eab308; }
    .tier-card-gold .tier-card-balance { color: #facc15; }
    .tier-card-gold.tier-active {
      border-color: #eab308;
      box-shadow: 0 0 24px rgba(234, 179, 8, 0.45);
      background: rgba(234, 179, 8, 0.09);
    }

    .tier-card-diamond .tier-card-badge { color: #c084fc; }
    .tier-card-diamond .tier-card-balance { color: #e9d5ff; }
    .tier-card-diamond.tier-active {
      border-color: #a855f7;
      box-shadow: 0 0 26px rgba(168, 85, 247, 0.5);
      background: rgba(168, 85, 247, 0.1);
    }

    /* Recent Transactions Card & Table */
    .wallet-tx-card {
      background: #0d1226;
      border: 1px solid rgba(139, 92, 246, 0.22);
      border-radius: 20px;
      padding: 24px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
    }
    [data-theme="light"] .wallet-tx-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
    }

    .wallet-table {
      width: 100%;
      border-collapse: separate;
      border-spacing: 0;
    }
    .wallet-table th {
      background: transparent;
      color: #64748b;
      font-size: 11.5px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      padding: 12px 16px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      text-align: left;
    }
    [data-theme="light"] .wallet-table th {
      color: #64748b;
      border-bottom: 1px solid #e2e8f0;
    }
    .wallet-table td {
      padding: 16px;
      font-size: 13.5px;
      color: #e2e8f0;
      border-bottom: 1px solid rgba(255, 255, 255, 0.04);
      vertical-align: middle;
    }
    [data-theme="light"] .wallet-table td {
      color: #1e293b;
      border-bottom: 1px solid #f1f5f9;
    }
    .wallet-table tr:hover td {
      background: rgba(255, 255, 255, 0.02);
    }
    [data-theme="light"] .wallet-table tr:hover td {
      background: #f8fafc;
    }

    .wallet-badge-credit {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 4px 12px;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 700;
      color: #10b981;
      background: rgba(16, 185, 129, 0.14);
      border: 1px solid rgba(16, 185, 129, 0.3);
    }
    .wallet-badge-purchase {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 4px 12px;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 700;
      color: #ef4444;
      background: rgba(239, 68, 68, 0.14);
      border: 1px solid rgba(239, 68, 68, 0.3);
    }

    .wallet-copy-btn {
      background: transparent;
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 8px;
      color: #94a3b8;
      cursor: pointer;
      padding: 6px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
    }
    .wallet-copy-btn:hover {
      color: #ffffff;
      border-color: rgba(168, 85, 247, 0.4);
      background: rgba(168, 85, 247, 0.12);
    }
    [data-theme="light"] .wallet-copy-btn {
      border-color: #e2e8f0;
      color: #64748b;
    }
    [data-theme="light"] .wallet-copy-btn:hover {
      border-color: #cbd5e1;
      color: #0f172a;
      background: #f1f5f9;
    }

    .wallet-btn-view-all {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: rgba(139, 92, 246, 0.14);
      border: 1px solid rgba(139, 92, 246, 0.35);
      color: #c4b5fd;
      padding: 7px 14px;
      border-radius: 10px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .wallet-btn-view-all:hover {
      background: rgba(139, 92, 246, 0.25);
      border-color: rgba(139, 92, 246, 0.6);
      color: #ffffff;
    }
    [data-theme="light"] .wallet-btn-view-all {
      background: #f5f3ff;
      border-color: #ddd6fe;
      color: #7c3aed;
    }
    [data-theme="light"] .wallet-btn-view-all:hover {
      background: #ede9fe;
      border-color: #c4b5fd;
      color: #6d28d9;
    }

    /* ─── SERVER WALLET PURCHASED ITEMS INVENTORY ─── */
    .inv-count-badge {
      display: inline-flex;
      align-items: center;
      padding: 3px 10px;
      border-radius: 20px;
      font-size: 11.5px;
      font-weight: 700;
      color: #c084fc;
      background: rgba(168, 85, 247, 0.15);
      border: 1px solid rgba(168, 85, 247, 0.35);
    }
    .inv-item-cell {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .inv-thumb-box {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      background: rgba(139, 92, 246, 0.14);
      border: 1px solid rgba(139, 92, 246, 0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      overflow: hidden;
      font-size: 22px;
    }
    .inv-thumb-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .inv-item-info {
      display: flex;
      flex-direction: column;
      gap: 3px;
      min-width: 0;
    }
    .inv-item-title {
      font-weight: 700;
      font-size: 14px;
      color: var(--text-heading);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .inv-role-badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-size: 11px;
      font-weight: 600;
      color: #a78bfa;
      background: rgba(167, 139, 250, 0.12);
      border: 1px solid rgba(167, 139, 250, 0.25);
      border-radius: 6px;
      padding: 2px 7px;
      width: fit-content;
    }
    .inv-id-code {
      font-family: monospace;
      font-size: 10.5px;
      color: var(--muted);
      display: inline-flex;
      align-items: center;
      gap: 5px;
    }
    .inv-type-pill {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      font-size: 11px;
      font-weight: 700;
      border-radius: 6px;
      padding: 3px 8px;
    }
    .inv-type-timed {
      color: #38bdf8;
      background: rgba(56, 189, 248, 0.12);
      border: 1px solid rgba(56, 189, 248, 0.25);
    }
    .inv-type-static {
      color: #f59e0b;
      background: rgba(245, 158, 11, 0.12);
      border: 1px solid rgba(245, 158, 11, 0.25);
    }
    .inv-status-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 11px;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.2px;
    }
    .inv-status-available {
      color: #10b981;
      background: rgba(16, 185, 129, 0.14);
      border: 1px solid rgba(16, 185, 129, 0.35);
      box-shadow: 0 0 14px rgba(16, 185, 129, 0.15);
    }
    .inv-status-active {
      color: #38bdf8;
      background: rgba(56, 189, 248, 0.14);
      border: 1px solid rgba(56, 189, 248, 0.35);
      box-shadow: 0 0 14px rgba(56, 189, 248, 0.2);
    }
    .inv-status-claim {
      color: #f59e0b;
      background: rgba(245, 158, 11, 0.14);
      border: 1px solid rgba(245, 158, 11, 0.35);
    }
    .inv-status-consumed {
      color: #94a3b8;
      background: rgba(148, 163, 184, 0.14);
      border: 1px solid rgba(148, 163, 184, 0.25);
    }
    .inv-status-expired {
      color: #ef4444;
      background: rgba(239, 68, 68, 0.14);
      border: 1px solid rgba(239, 68, 68, 0.28);
    }
    .btn-inv-use {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      background: linear-gradient(135deg, #8b5cf6, #6366f1);
      color: #ffffff;
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 9px;
      padding: 7px 16px;
      font-size: 12.5px;
      font-weight: 700;
      cursor: pointer;
      box-shadow: 0 4px 14px rgba(124, 58, 237, 0.35);
      transition: all 0.2s ease;
      white-space: nowrap;
    }
    .btn-inv-use:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 6px 20px rgba(124, 58, 237, 0.55);
      filter: brightness(1.1);
    }
    .btn-inv-use:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    .btn-inv-claim {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 5px;
      background: rgba(245, 158, 11, 0.16);
      color: #f59e0b;
      border: 1px solid rgba(245, 158, 11, 0.4);
      border-radius: 9px;
      padding: 7px 14px;
      font-size: 12px;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s;
      white-space: nowrap;
    }
    .btn-inv-claim:hover {
      background: rgba(245, 158, 11, 0.25);
      color: #fbbf24;
    }
    .inv-disabled-badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 4px;
      padding: 6px 12px;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 600;
      color: var(--muted);
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.07);
      white-space: nowrap;
    }
    [data-theme="light"] .inv-disabled-badge {
      background: #f1f5f9;
      border-color: #e2e8f0;
      color: #64748b;
    }

    /* ══════════════════════════════════════════════════════════════════════
       SERVER ADMIN PANEL (Matches media_1792579935202.png Pixel-for-Pixel)
       ══════════════════════════════════════════════════════════════════════ */
    .admin-card {
      background: #0b0c16;
      border: 1px solid rgba(139, 92, 246, 0.22);
      border-radius: 20px;
      padding: 24px;
      margin-bottom: 24px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    }
    [data-theme="light"] .admin-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
    }

    .admin-card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      margin-bottom: 20px;
      flex-wrap: wrap;
    }
    .admin-card-header-left {
      display: flex;
      align-items: center;
      gap: 14px;
    }
    .admin-header-icon-badge {
      width: 42px;
      height: 42px;
      border-radius: 12px;
      border: 1px solid rgba(139, 92, 246, 0.35);
      background: rgba(139, 92, 246, 0.15);
      color: #c084fc;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      flex-shrink: 0;
    }
    [data-theme="light"] .admin-header-icon-badge {
      background: #f1f5f9;
      border-color: #cbd5e1;
      color: #6366f1;
    }
    .admin-card-title {
      font-family: 'Outfit', sans-serif;
      font-size: 17px;
      font-weight: 700;
      color: #ffffff;
      margin: 0;
      letter-spacing: -0.2px;
    }
    [data-theme="light"] .admin-card-title {
      color: #0f172a;
    }
    .admin-card-subtitle {
      font-size: 12px;
      color: #94a3b8;
      margin-top: 3px;
      font-weight: 400;
    }
    [data-theme="light"] .admin-card-subtitle {
      color: #64748b;
    }

    /* Buttons */
    .admin-btn-purple {
      background: #6366f1;
      color: #ffffff;
      border: none;
      border-radius: 10px;
      padding: 8px 16px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      transition: opacity 0.15s ease;
      white-space: nowrap;
    }
    .admin-btn-purple:hover {
      opacity: 0.9;
    }
    .admin-btn-gold {
      background: #f59e0b;
      color: #000000;
      border: none;
      border-radius: 10px;
      padding: 10px 18px;
      font-size: 13px;
      font-weight: 700;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      transition: opacity 0.15s ease;
      white-space: nowrap;
    }
    .admin-btn-gold:hover {
      opacity: 0.92;
    }
    .admin-btn-danger-outline {
      background: transparent;
      color: #f87171;
      border: 1px solid rgba(239, 68, 68, 0.45);
      border-radius: 8px;
      padding: 6px 12px;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: all 0.15s ease;
      white-space: nowrap;
    }
    .admin-btn-danger-outline:hover {
      background: rgba(239, 68, 68, 0.15);
      border-color: #ef4444;
    }
    .admin-btn-danger-filled {
      background: #dc2626;
      color: #ffffff;
      border: none;
      border-radius: 10px;
      padding: 10px 18px;
      font-size: 13px;
      font-weight: 700;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      transition: opacity 0.15s ease;
      white-space: nowrap;
    }
    .admin-btn-danger-filled:hover {
      opacity: 0.92;
    }
    .admin-btn-outline-dark {
      background: rgba(255, 255, 255, 0.04);
      color: #cbd5e1;
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: 9px;
      padding: 8px 14px;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: all 0.15s ease;
      white-space: nowrap;
    }
    [data-theme="light"] .admin-btn-outline-dark {
      background: #f8fafc;
      color: #334155;
      border-color: #cbd5e1;
    }
    .admin-btn-outline-dark:hover {
      border-color: rgba(255, 255, 255, 0.35);
      color: #ffffff;
    }
    [data-theme="light"] .admin-btn-outline-dark:hover {
      border-color: #94a3b8;
      color: #0f172a;
    }

    /* Small pill action buttons */
    .admin-btn-action-dark {
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid rgba(255, 255, 255, 0.15);
      color: #cbd5e1;
      border-radius: 8px;
      padding: 5px 11px;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 5px;
    }
    [data-theme="light"] .admin-btn-action-dark {
      background: #f1f5f9;
      border-color: #cbd5e1;
      color: #334155;
    }
    .admin-btn-action-purple {
      background: rgba(124, 58, 237, 0.2);
      border: 1px solid rgba(124, 58, 237, 0.45);
      color: #c4b5fd;
      border-radius: 8px;
      padding: 5px 11px;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 5px;
    }
    [data-theme="light"] .admin-btn-action-purple {
      background: #ede9fe;
      border-color: #c4b5fd;
      color: #6d28d9;
    }

    /* Stat tiles grid (Panel 1) */
    .admin-stat-tiles-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
      margin-bottom: 22px;
    }
    @media (max-width: 1100px) {
      .admin-stat-tiles-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }
    @media (max-width: 640px) {
      .admin-stat-tiles-grid {
        grid-template-columns: 1fr;
      }
    }
    .admin-stat-tile {
      background: #0f1222;
      border: 1px solid rgba(139, 92, 246, 0.16);
      border-radius: 14px;
      padding: 16px 18px;
      display: flex;
      align-items: center;
      gap: 14px;
    }
    [data-theme="light"] .admin-stat-tile {
      background: #f8fafc;
      border-color: #e2e8f0;
    }
    .admin-stat-icon-box {
      width: 44px;
      height: 44px;
      border-radius: 10px;
      border: 1px solid;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .admin-stat-details {
      display: flex;
      flex-direction: column;
      min-width: 0;
    }
    .admin-stat-label {
      font-size: 11px;
      font-weight: 700;
      color: #94a3b8;
      letter-spacing: 0.5px;
      text-transform: uppercase;
    }
    [data-theme="light"] .admin-stat-label {
      color: #64748b;
    }
    .admin-stat-val {
      font-size: 15px;
      font-weight: 700;
      color: #ffffff;
      margin-top: 3px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    [data-theme="light"] .admin-stat-val {
      color: #0f172a;
    }

    /* Rate Form */
    .admin-rate-form {
      display: flex;
      gap: 12px;
      align-items: flex-end;
      flex-wrap: wrap;
    }
    .admin-form-label {
      font-size: 12px;
      font-weight: 600;
      color: #94a3b8;
      display: block;
      margin-bottom: 6px;
    }
    [data-theme="light"] .admin-form-label {
      color: #475569;
    }
    .admin-rate-input {
      background: #080911;
      border: 1px solid rgba(139, 92, 246, 0.25);
      border-radius: 10px;
      padding: 10px 14px;
      font-size: 14px;
      color: #ffffff;
      outline: none;
      width: 140px;
    }
    [data-theme="light"] .admin-rate-input {
      background: #ffffff;
      border-color: #cbd5e1;
      color: #0f172a;
    }
    .admin-rate-input:focus {
      border-color: #7c3aed;
    }

    /* Search Input Wrapper */
    .admin-search-wrapper {
      position: relative;
      display: flex;
      align-items: center;
      gap: 8px;
      background: #080911;
      border: 1px solid rgba(139, 92, 246, 0.25);
      border-radius: 10px;
      padding: 0 12px;
      height: 38px;
      width: 260px;
    }
    [data-theme="light"] .admin-search-wrapper {
      background: #f8fafc;
      border-color: #cbd5e1;
    }
    .admin-search-wrapper:focus-within {
      border-color: #7c3aed;
    }
    .admin-table-search-input {
      width: 100%;
      border: none;
      outline: none;
      background: transparent;
      color: #ffffff;
      font-size: 12px;
    }
    [data-theme="light"] .admin-table-search-input {
      color: #0f172a;
    }

    /* Tables */
    .admin-table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
    }
    .admin-table th {
      padding: 12px 14px;
      font-size: 11px;
      font-weight: 700;
      color: #94a3b8;
      letter-spacing: 0.5px;
      text-transform: uppercase;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      white-space: nowrap;
    }
    [data-theme="light"] .admin-table th {
      color: #64748b;
      border-bottom: 1px solid #e2e8f0;
    }
    .admin-table td {
      padding: 14px;
      font-size: 13px;
      color: #cbd5e1;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      vertical-align: middle;
    }
    [data-theme="light"] .admin-table td {
      color: #1e293b;
      border-bottom: 1px solid #f1f5f9;
    }
    .admin-table tr:hover td {
      background: rgba(255, 255, 255, 0.02);
    }
    [data-theme="light"] .admin-table tr:hover td {
      background: #f8fafc;
    }

    /* Order ID pill with copy button */
    .admin-order-id-pill {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 8px;
      padding: 4px 10px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 12px;
      color: #ffffff;
      white-space: nowrap;
    }
    [data-theme="light"] .admin-order-id-pill {
      background: #f1f5f9;
      border-color: #cbd5e1;
      color: #0f172a;
    }
    .admin-copy-btn {
      background: transparent;
      border: none;
      color: #94a3b8;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      padding: 2px;
      border-radius: 4px;
    }
    .admin-copy-btn:hover {
      color: #ffffff;
    }
    [data-theme="light"] .admin-copy-btn:hover {
      color: #0f172a;
    }

    /* User Avatar & Tag */
    .admin-user-avatar {
      width: 34px;
      height: 34px;
      border-radius: 50%;
      object-fit: cover;
      border: 1px solid rgba(139, 92, 246, 0.3);
      flex-shrink: 0;
    }

    /* Status Badges */
    .admin-status-badge {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      font-size: 11px;
      font-weight: 700;
      padding: 4px 10px;
      border-radius: 20px;
      letter-spacing: 0.3px;
      white-space: nowrap;
    }
    .admin-status-badge.status-paid,
    .admin-status-badge.status-active {
      background: rgba(16, 185, 129, 0.15);
      border: 1px solid rgba(16, 185, 129, 0.35);
      color: #34d399;
    }
    .admin-status-badge.status-pending,
    .admin-status-badge.status-ready {
      background: rgba(245, 158, 11, 0.15);
      border: 1px solid rgba(245, 158, 11, 0.35);
      color: #fbbf24;
    }
    .admin-status-badge.status-review {
      background: rgba(59, 130, 246, 0.15);
      border: 1px solid rgba(59, 130, 246, 0.35);
      color: #60a5fa;
    }
    .admin-status-badge.status-rejected,
    .admin-status-badge.status-completed {
      background: rgba(239, 68, 68, 0.15);
      border: 1px solid rgba(239, 68, 68, 0.35);
      color: #f87171;
    }

    /* Type Pill in Products */
    .admin-type-pill {
      display: inline-flex;
      align-items: center;
      background: rgba(124, 58, 237, 0.15);
      border: 1px solid rgba(124, 58, 237, 0.35);
      color: #c4b5fd;
      border-radius: 6px;
      padding: 3px 8px;
      font-size: 11px;
      font-weight: 600;
      white-space: nowrap;
    }
    [data-theme="light"] .admin-type-pill {
      background: #ede9fe;
      border-color: #c4b5fd;
      color: #6d28d9;
    }

    /* Adjust Grid (Panel 4) */
    .admin-adjust-grid {
      display: grid;
      grid-template-columns: 2fr 1fr 1.5fr 2.5fr 1.5fr;
      gap: 14px;
      align-items: flex-end;
    }
    @media (max-width: 1024px) {
      .admin-adjust-grid {
        grid-template-columns: 1fr 1fr;
      }
    }
    @media (max-width: 640px) {
      .admin-adjust-grid {
        grid-template-columns: 1fr;
      }
    }
    .admin-form-input, .admin-form-select {
      width: 100%;
      background: #080911;
      border: 1px solid rgba(139, 92, 246, 0.25);
      border-radius: 10px;
      padding: 10px 14px;
      font-size: 13px;
      color: #ffffff;
      outline: none;
      height: 42px;
      box-sizing: border-box;
    }
    [data-theme="light"] .admin-form-input, [data-theme="light"] .admin-form-select {
      background: #ffffff;
      border-color: #cbd5e1;
      color: #0f172a;
    }
    .admin-form-input:focus, .admin-form-select:focus {
      border-color: #7c3aed;
    }

    /* Danger Zone Telemetry & Total Box (Panel 6) */
    .admin-danger-telemetry {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      background: rgba(0, 0, 0, 0.2);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 14px;
      padding: 14px 18px;
      margin-bottom: 20px;
      flex-wrap: wrap;
    }
    [data-theme="light"] .admin-danger-telemetry {
      background: #f8fafc;
      border-color: #e2e8f0;
    }
    .admin-danger-stat-item {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .admin-stat-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      flex-shrink: 0;
    }
    .admin-stat-text {
      display: flex;
      flex-direction: column;
    }
    .admin-stat-lbl {
      font-size: 10px;
      font-weight: 700;
      color: #94a3b8;
      letter-spacing: 0.5px;
    }
    .admin-stat-num {
      font-size: 16px;
      font-weight: 800;
      color: #ffffff;
    }
    [data-theme="light"] .admin-stat-num {
      color: #0f172a;
    }
    .admin-danger-total-box {
      border: 1.5px solid #ef4444;
      border-radius: 10px;
      padding: 8px 16px;
      background: rgba(239, 68, 68, 0.08);
      text-align: center;
      min-width: 120px;
    }
    .admin-total-lbl {
      display: block;
      font-size: 10px;
      font-weight: 800;
      color: #f87171;
      letter-spacing: 0.5px;
    }
    .admin-total-num {
      font-size: 22px;
      font-weight: 900;
      color: #ef4444;
      line-height: 1.1;
    }
    .admin-danger-actions {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
      align-items: center;
    }

    /* ─── UNIVERSAL USER & WALLET INSPECTOR (Panel 0) ─── */
    .inspect-input-row {
      display: flex;
      gap: 12px;
      align-items: center;
      margin-top: 14px;
    }
    .inspect-input-field {
      flex: 1;
      background: #080911;
      border: 1px solid rgba(139, 92, 246, 0.28);
      border-radius: 10px;
      padding: 12px 16px;
      font-size: 14px;
      color: #ffffff;
      outline: none;
      height: 44px;
      box-sizing: border-box;
      font-family: inherit;
    }
    .inspect-input-field:focus {
      border-color: #8b5cf6;
      box-shadow: 0 0 0 2px rgba(139, 92, 246, 0.2);
    }
    [data-theme="light"] .inspect-input-field {
      background: #ffffff;
      border-color: #cbd5e1;
      color: #0f172a;
    }

    /* Profile Banner */
    .inspect-profile-banner {
      background: #0b0c16;
      border: 1px solid rgba(139, 92, 246, 0.25);
      border-radius: 16px;
      padding: 20px 24px;
      margin-bottom: 20px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 20px;
      flex-wrap: wrap;
    }
    [data-theme="light"] .inspect-profile-banner {
      background: #ffffff;
      border-color: #e2e8f0;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
    }
    .inspect-profile-left {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .inspect-profile-avatar {
      width: 68px;
      height: 68px;
      border-radius: 50%;
      border: 2.5px solid #8b5cf6;
      object-fit: cover;
      box-shadow: 0 4px 16px rgba(139, 92, 246, 0.35);
      flex-shrink: 0;
    }
    .inspect-profile-info {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .inspect-profile-name-row {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
    }
    .inspect-profile-username {
      font-size: 19px;
      font-weight: 800;
      color: #ffffff;
    }
    [data-theme="light"] .inspect-profile-username {
      color: #0f172a;
    }
    .inspect-profile-tag {
      font-size: 13px;
      color: var(--muted);
      font-family: monospace;
    }
    .inspect-profile-pill {
      background: rgba(139, 92, 246, 0.18);
      border: 1px solid rgba(139, 92, 246, 0.4);
      color: #c4b5fd;
      font-size: 11px;
      font-weight: 700;
      padding: 2px 10px;
      border-radius: 20px;
      display: inline-flex;
      align-items: center;
    }
    .inspect-profile-stats-group {
      display: flex;
      align-items: center;
      gap: 28px;
      flex-wrap: wrap;
    }
    .inspect-stat-item {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .inspect-stat-icon {
      width: 40px;
      height: 40px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(139, 92, 246, 0.14);
      border: 1px solid rgba(139, 92, 246, 0.28);
      color: #c4b5fd;
      flex-shrink: 0;
    }
    .inspect-stat-col {
      display: flex;
      flex-direction: column;
    }
    .inspect-stat-label-top {
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: var(--muted);
      font-weight: 700;
    }
    .inspect-stat-number {
      font-size: 16px;
      font-weight: 800;
      color: #ffffff;
      line-height: 1.2;
      margin-top: 1px;
    }
    [data-theme="light"] .inspect-stat-number {
      color: #0f172a;
    }
    .inspect-stat-subtext {
      font-size: 11px;
      color: var(--muted);
      margin-top: 1px;
    }

    /* Server Cards Grid */
    .inspect-servers-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 16px;
      margin-top: 18px;
    }
    .inspect-server-card {
      background: #080911;
      border: 1px solid rgba(139, 92, 246, 0.2);
      border-radius: 14px;
      padding: 18px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      gap: 16px;
      cursor: pointer;
      position: relative;
    }
    [data-theme="light"] .inspect-server-card {
      background: #f8fafc;
      border-color: #e2e8f0;
    }
    .inspect-server-card:hover {
      border-color: rgba(139, 92, 246, 0.5);
      background: #0d0f1a;
    }
    [data-theme="light"] .inspect-server-card:hover {
      background: #f1f5f9;
      border-color: #8b5cf6;
    }
    .inspect-server-card.selected {
      border: 1.5px solid #8b5cf6 !important;
      background: #0e1022 !important;
      box-shadow: 0 0 20px rgba(139, 92, 246, 0.28);
    }
    [data-theme="light"] .inspect-server-card.selected {
      background: #faf5ff !important;
      border-color: #8b5cf6 !important;
      box-shadow: 0 0 16px rgba(139, 92, 246, 0.2);
    }
    .inspect-server-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 12px;
    }
    .inspect-server-identity {
      display: flex;
      align-items: center;
      gap: 12px;
      min-width: 0;
    }
    .inspect-server-icon {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      object-fit: cover;
      border: 1px solid rgba(139, 92, 246, 0.3);
      flex-shrink: 0;
    }
    .inspect-server-icon-placeholder {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      background: rgba(139, 92, 246, 0.16);
      border: 1px solid rgba(139, 92, 246, 0.3);
      color: #c4b5fd;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      font-size: 18px;
      flex-shrink: 0;
    }
    .inspect-server-name {
      font-size: 15px;
      font-weight: 800;
      color: #ffffff;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 165px;
    }
    [data-theme="light"] .inspect-server-name {
      color: #0f172a;
    }
    .inspect-server-meta {
      font-size: 12px;
      color: var(--muted);
      margin-top: 1px;
    }
    .inspect-server-id {
      font-size: 11px;
      color: var(--muted);
      font-family: monospace;
      margin-top: 2px;
    }
    .inspect-server-balance-box {
      text-align: right;
      flex-shrink: 0;
    }
    .inspect-server-balance-label {
      display: block;
      font-size: 10px;
      color: var(--muted);
      text-transform: uppercase;
      font-weight: 700;
    }
    .inspect-server-balance-val {
      display: block;
      font-size: 16px;
      font-weight: 800;
      color: #fbbf24;
      margin-top: 2px;
    }
    .inspect-server-select-btn {
      width: 100%;
      padding: 10px 14px;
      border-radius: 10px;
      font-size: 13px;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      border: 1px solid rgba(255, 255, 255, 0.1);
      background: rgba(255, 255, 255, 0.05);
      color: #cbd5e1;
      cursor: pointer;
    }
    [data-theme="light"] .inspect-server-select-btn {
      background: #e2e8f0;
      border-color: #cbd5e1;
      color: #334155;
    }
    .inspect-server-card.selected .inspect-server-select-btn {
      background: #8b5cf6 !important;
      border-color: #8b5cf6 !important;
      color: #ffffff !important;
    }
    .inspect-server-select-btn:hover {
      background: rgba(139, 92, 246, 0.2);
      border-color: rgba(139, 92, 246, 0.4);
      color: #ffffff;
    }
    .inspect-server-card.selected .inspect-server-select-btn:hover {
      background: #7c3aed !important;
    }

    /* Detailed Management Panel */
    .inspect-detail-card {
      background: #0b0c16;
      border: 1.5px solid rgba(139, 92, 246, 0.35);
      border-radius: 16px;
      padding: 24px;
      margin-top: 24px;
      box-shadow: 0 10px 32px rgba(0, 0, 0, 0.5);
    }
    [data-theme="light"] .inspect-detail-card {
      background: #ffffff;
      border-color: #e2e8f0;
      box-shadow: 0 6px 24px rgba(0, 0, 0, 0.06);
    }
    .inspect-dossier-actions {
      display: flex;
      gap: 8px;
      align-items: center;
      flex-wrap: wrap;
    }
    .btn-credit-green {
      background: #10b981;
      color: #ffffff;
      border: none;
      border-radius: 10px;
      padding: 9px 16px;
      font-size: 13px;
      font-weight: 700;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }
    .btn-credit-green:hover { background: #059669; }
    .btn-debit-red {
      background: #ef4444;
      color: #ffffff;
      border: none;
      border-radius: 10px;
      padding: 9px 16px;
      font-size: 13px;
      font-weight: 700;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }
    .btn-debit-red:hover { background: #dc2626; }

    /* Sub Tabs */
    .inspect-subtabs-nav {
      display: flex;
      gap: 8px;
      border-bottom: 1px solid rgba(139, 92, 246, 0.2);
      padding-bottom: 12px;
      margin: 22px 0 18px 0;
      flex-wrap: wrap;
    }
    [data-theme="light"] .inspect-subtabs-nav {
      border-bottom-color: #e2e8f0;
    }
    .inspect-subtab-pill {
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.08);
      color: var(--muted);
      font-size: 13px;
      font-weight: 700;
      padding: 8px 18px;
      border-radius: 20px;
      cursor: pointer;
    }
    [data-theme="light"] .inspect-subtab-pill {
      background: #f1f5f9;
      border-color: #e2e8f0;
      color: #64748b;
    }
    .inspect-subtab-pill.active {
      background: #8b5cf6 !important;
      border-color: #8b5cf6 !important;
      color: #ffffff !important;
    }

    /* ══════════════════════════════════════════════════════════════════════════
       BOT OWNER OVERWATCH & INFRASTRUCTURE HUB
       ══════════════════════════════════════════════════════════════════════════ */
    .app-sidebar.collapsed {
      width: 80px;
    }
    .app-sidebar.collapsed .sidebar-brand-name,
    .app-sidebar.collapsed .sidebar-brand-subtitle,
    .app-sidebar.collapsed .nav-btn span:not(.nav-icon),
    .app-sidebar.collapsed .sidebar-cosmic-glow {
      display: none !important;
    }
    .app-sidebar.collapsed .nav-btn {
      justify-content: center;
      padding: 12px;
    }

    .header-sidebar-toggle {
      background: transparent;
      border: 1px solid rgba(255, 255, 255, 0.08);
      color: #94a3b8;
      border-radius: 10px;
      width: 38px;
      height: 38px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s ease;
      flex-shrink: 0;
    }
    .header-sidebar-toggle:hover {
      color: #fff;
      border-color: rgba(139, 92, 246, 0.4);
      background: rgba(139, 92, 246, 0.12);
    }
    .header-search-wrap {
      position: relative;
      display: flex;
      align-items: center;
      flex: 1;
      max-width: 480px;
      background: rgba(15, 23, 42, 0.6);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 12px;
      padding: 0 14px;
      transition: all 0.2s ease;
    }
    .header-search-wrap:focus-within {
      border-color: rgba(139, 92, 246, 0.55);
      box-shadow: 0 0 16px rgba(139, 92, 246, 0.2);
      background: rgba(15, 23, 42, 0.85);
    }
    .header-search-icon {
      font-size: 13px;
      color: #64748b;
      margin-right: 8px;
    }
    .header-search-input {
      background: transparent;
      border: none;
      outline: none;
      color: #ffffff;
      font-size: 13px;
      padding: 9px 0;
      width: 100%;
    }
    .header-search-input::placeholder {
      color: #64748b;
    }
    .header-search-shortcut {
      font-size: 11px;
      font-family: 'JetBrains Mono', monospace;
      color: #64748b;
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid rgba(255, 255, 255, 0.08);
      padding: 2px 6px;
      border-radius: 6px;
      margin-left: 8px;
      white-space: nowrap;
    }
    .header-bell-btn {
      position: relative;
      width: 38px;
      height: 38px;
      border-radius: 10px;
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.08);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      color: #94a3b8;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .header-bell-btn:hover {
      color: #ffffff;
      border-color: rgba(139, 92, 246, 0.4);
      background: rgba(139, 92, 246, 0.12);
    }
    .bell-badge-count {
      position: absolute;
      top: -3px;
      right: -3px;
      width: 16px;
      height: 16px;
      border-radius: 50%;
      background: #ef4444;
      color: #ffffff;
      font-size: 10px;
      font-weight: 800;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 2px solid #0b0f19;
    }

    /* Hero Banner */
    .owner-hub-hero {
      background: linear-gradient(135deg, rgba(88, 28, 135, 0.42) 0%, rgba(30, 27, 75, 0.6) 45%, rgba(13, 18, 38, 0.95) 100%);
      border: 1.5px solid rgba(168, 85, 247, 0.35);
      border-radius: 20px;
      padding: 26px 30px;
      margin-bottom: 22px;
      position: relative;
      overflow: hidden;
      box-shadow: 0 16px 40px -10px rgba(124, 58, 237, 0.35);
    }
    .owner-hero-content {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 24px;
      position: relative;
      z-index: 2;
    }
    .owner-hero-left {
      display: flex;
      align-items: flex-start;
      gap: 20px;
      flex: 1;
      max-width: 760px;
    }
    .owner-hero-crown-box {
      width: 54px;
      height: 54px;
      border-radius: 16px;
      background: linear-gradient(135deg, rgba(234, 179, 8, 0.25), rgba(168, 85, 247, 0.35));
      border: 1.5px solid rgba(234, 179, 8, 0.55);
      box-shadow: 0 0 24px rgba(234, 179, 8, 0.4);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .owner-crown-emoji {
      font-size: 26px;
    }
    .owner-hero-title {
      font-family: 'Outfit', sans-serif;
      font-size: 26px;
      font-weight: 800;
      color: #ffffff;
      margin: 0 0 8px 0;
      line-height: 1.25;
      letter-spacing: -0.3px;
    }
    .owner-title-accent {
      background: linear-gradient(135deg, #c084fc 0%, #f472b6 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .owner-hero-subtitle {
      font-size: 13px;
      color: #94a3b8;
      line-height: 1.6;
      margin: 0;
    }
    .owner-hero-graphic {
      width: 280px;
      height: 140px;
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .isometric-cluster-svg {
      width: 100%;
      height: 100%;
      filter: drop-shadow(0 0 20px rgba(124, 58, 237, 0.45));
    }
    @media (max-width: 900px) {
      .owner-hero-graphic { display: none; }
      .owner-hero-content { flex-direction: column; align-items: flex-start; }
    }

    /* 4-Grid Telemetry Cards */
    .owner-telemetry-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
      margin-bottom: 22px;
    }
    @media (max-width: 1100px) {
      .owner-telemetry-grid { grid-template-columns: repeat(2, 1fr); }
    }
    @media (max-width: 600px) {
      .owner-telemetry-grid { grid-template-columns: 1fr; }
    }
    .owner-stat-card {
      background: #0d1226;
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 16px;
      padding: 18px 20px;
      display: flex;
      align-items: center;
      gap: 16px;
      transition: all 0.28s cubic-bezier(0.16, 1, 0.3, 1);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
      position: relative;
      overflow: hidden;
    }
    .owner-stat-card:hover {
      transform: translateY(-3px);
      border-color: rgba(139, 92, 246, 0.35);
      box-shadow: 0 12px 32px rgba(0, 0, 0, 0.45);
    }
    .owner-stat-icon-wrap {
      width: 48px;
      height: 48px;
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .icon-blue {
      background: rgba(14, 165, 233, 0.14);
      border: 1px solid rgba(14, 165, 233, 0.32);
      color: #38bdf8;
    }
    .icon-teal {
      background: rgba(16, 185, 129, 0.14);
      border: 1px solid rgba(16, 185, 129, 0.32);
      color: #34d399;
    }
    .icon-amber {
      background: rgba(245, 158, 11, 0.14);
      border: 1px solid rgba(245, 158, 11, 0.32);
      color: #fbbf24;
    }
    .icon-purple {
      background: rgba(168, 85, 247, 0.14);
      border: 1px solid rgba(168, 85, 247, 0.32);
      color: #c084fc;
    }
    .owner-stat-body {
      flex: 1;
      min-width: 0;
    }
    .owner-stat-label {
      font-size: 11px;
      font-weight: 800;
      color: #94a3b8;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      margin-bottom: 4px;
    }
    .owner-stat-value {
      font-family: 'Outfit', sans-serif;
      font-size: 24px;
      font-weight: 800;
      line-height: 1.2;
      margin-bottom: 6px;
    }
    .val-blue { color: #38bdf8; }
    .val-teal { color: #34d399; }
    .val-amber { color: #fbbf24; }
    .val-purple { color: #e9d5ff; }
    .owner-stat-progress-wrap {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .owner-stat-progress-bar {
      flex: 1;
      height: 4px;
      border-radius: 6px;
      background: rgba(255, 255, 255, 0.08);
      overflow: hidden;
    }
    .owner-stat-progress-fill {
      height: 100%;
      border-radius: 6px;
      transition: width 0.4s ease;
    }
    .fill-blue { background: #38bdf8; }
    .fill-teal { background: #34d399; }
    .fill-amber { background: #fbbf24; }
    .owner-stat-progress-text {
      font-size: 11px;
      font-weight: 700;
      color: #94a3b8;
    }
    .owner-stat-progress-badge {
      font-size: 11px;
      font-weight: 700;
      padding: 1px 6px;
      border-radius: 6px;
    }
    .badge-teal { color: #34d399; }
    .badge-amber { color: #fbbf24; }
    .badge-purple { color: #c084fc; }

    /* Middle Section 2-Column Grid */
    .owner-middle-grid {
      display: grid;
      grid-template-columns: 1fr 1.15fr;
      gap: 20px;
    }
    @media (max-width: 1120px) {
      .owner-middle-grid { grid-template-columns: 1fr; }
    }
    .owner-box-card {
      background: #0d1226;
      border: 1px solid rgba(139, 92, 246, 0.18);
      border-radius: 18px;
      padding: 22px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.35);
      position: relative;
    }
    .owner-card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 16px;
      gap: 12px;
      flex-wrap: wrap;
    }
    .owner-header-title-wrap {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .owner-icon-square {
      width: 42px;
      height: 42px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .icon-square-purple {
      background: rgba(139, 92, 246, 0.18);
      border: 1px solid rgba(139, 92, 246, 0.4);
      color: #c084fc;
    }
    .icon-square-gold {
      background: rgba(245, 158, 11, 0.18);
      border: 1px solid rgba(245, 158, 11, 0.4);
      color: #fbbf24;
    }
    .icon-square-blue {
      background: rgba(59, 130, 246, 0.18);
      border: 1px solid rgba(59, 130, 246, 0.4);
      color: #60a5fa;
    }
    .owner-card-title {
      font-family: 'Outfit', sans-serif;
      font-size: 16px;
      font-weight: 700;
      color: #ffffff;
      margin: 0;
    }
    .owner-card-subtitle {
      font-size: 12px;
      color: #94a3b8;
      margin-top: 2px;
    }
    .btn-owner-add-admin {
      background: linear-gradient(135deg, #7c3aed, #9333ea);
      color: #ffffff;
      font-size: 12.5px;
      font-weight: 700;
      border: none;
      border-radius: 20px;
      padding: 8px 18px;
      cursor: pointer;
      transition: all 0.25s ease;
      box-shadow: 0 4px 14px rgba(124, 58, 237, 0.4);
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }
    .btn-owner-add-admin:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(124, 58, 237, 0.6);
    }
    .btn-owner-view-all {
      background: rgba(139, 92, 246, 0.2);
      border: 1px solid rgba(139, 92, 246, 0.45);
      color: #c084fc;
      font-size: 12px;
      font-weight: 700;
      border-radius: 10px;
      padding: 6px 14px;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .btn-owner-view-all:hover {
      background: rgba(139, 92, 246, 0.35);
      border-color: #c084fc;
      color: #ffffff;
    }
    .btn-owner-refresh {
      background: rgba(139, 92, 246, 0.2);
      border: 1px solid rgba(139, 92, 246, 0.45);
      color: #c084fc;
      font-size: 12px;
      font-weight: 700;
      border-radius: 10px;
      padding: 6px 14px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: all 0.2s ease;
    }
    .btn-owner-refresh:hover {
      background: rgba(139, 92, 246, 0.35);
      color: #ffffff;
    }
    .owner-search-container {
      display: flex;
      align-items: center;
      gap: 10px;
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 12px;
      padding: 0 14px;
      margin-bottom: 12px;
      transition: border-color 0.2s ease;
    }
    .owner-search-container:focus-within {
      border-color: rgba(139, 92, 246, 0.5);
    }
    .owner-search-icon {
      font-size: 13px;
      color: #64748b;
    }
    .owner-input-search {
      background: transparent;
      border: none;
      outline: none;
      color: #ffffff;
      font-size: 13px;
      padding: 9px 0;
      width: 100%;
    }
    .owner-input-search::placeholder {
      color: #64748b;
    }
    .owner-table-wrapper {
      width: 100%;
      overflow-x: auto;
    }
    .owner-table {
      width: 100%;
      border-collapse: separate;
      border-spacing: 0;
      font-size: 13px;
    }
    .owner-table th {
      text-align: left;
      padding: 10px 12px;
      font-size: 11px;
      font-weight: 800;
      color: #64748b;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      border-bottom: 1px solid rgba(255, 255, 255, 0.06);
      white-space: nowrap;
    }
    .owner-table td {
      padding: 12px 12px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.04);
      vertical-align: middle;
      white-space: nowrap;
      color: #cbd5e1;
    }
    .owner-table tr:hover td {
      background: rgba(255, 255, 255, 0.02);
    }
    .owner-table-loading {
      text-align: center;
      padding: 30px !important;
      color: #64748b;
      font-size: 13px;
    }

    /* Badges & Pills in Tables */
    .id-pill {
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      padding: 3px 8px;
      border-radius: 8px;
      background: rgba(139, 92, 246, 0.12);
      border: 1px solid rgba(139, 92, 246, 0.28);
      color: #cbd5e1;
      cursor: copy;
      display: inline-block;
      transition: all 0.2s ease;
    }
    .id-pill:hover {
      background: rgba(139, 92, 246, 0.24);
      border-color: #a855f7;
      color: #ffffff;
    }
    .badge-protected {
      font-size: 11px;
      font-weight: 700;
      padding: 3px 10px;
      border-radius: 8px;
      border: 1px solid rgba(6, 182, 212, 0.4);
      color: #22d3ee;
      background: rgba(6, 182, 212, 0.08);
      display: inline-block;
    }
    .badge-gold-owner {
      font-size: 10px;
      font-weight: 800;
      padding: 2px 7px;
      border-radius: 6px;
      background: rgba(245, 158, 11, 0.2);
      border: 1px solid rgba(245, 158, 11, 0.4);
      color: #fbbf24;
      margin-left: 6px;
    }
    .badge-admin-tag {
      font-size: 10px;
      font-weight: 800;
      padding: 2px 7px;
      border-radius: 6px;
      background: rgba(139, 92, 246, 0.2);
      border: 1px solid rgba(139, 92, 246, 0.4);
      color: #c084fc;
      margin-left: 6px;
    }
    .btn-table-remove {
      border: 1px solid rgba(239, 68, 68, 0.4);
      color: #f87171;
      background: rgba(239, 68, 68, 0.1);
      border-radius: 8px;
      padding: 4px 10px;
      font-size: 11.5px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .btn-table-remove:hover {
      background: rgba(239, 68, 68, 0.25);
      border-color: #ef4444;
      color: #ffffff;
    }
    .btn-table-wipe {
      border: 1px solid rgba(239, 68, 68, 0.4);
      color: #f87171;
      background: rgba(239, 68, 68, 0.1);
      border-radius: 8px;
      padding: 5px 12px;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .btn-table-wipe:hover {
      background: rgba(239, 68, 68, 0.25);
      border-color: #ef4444;
      color: #ffffff;
    }
    .btn-table-inspect {
      border: 1px solid rgba(139, 92, 246, 0.4);
      color: #c084fc;
      background: rgba(139, 92, 246, 0.1);
      border-radius: 8px;
      padding: 5px 12px;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      margin-right: 6px;
      transition: all 0.2s ease;
    }
    .btn-table-inspect:hover {
      background: rgba(139, 92, 246, 0.25);
      border-color: #c084fc;
      color: #ffffff;
    }
    .badge-status-success {
      font-size: 11px;
      font-weight: 700;
      padding: 3px 9px;
      border-radius: 12px;
      background: rgba(16, 185, 129, 0.14);
      border: 1px solid rgba(16, 185, 129, 0.35);
      color: #34d399;
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }
    .badge-status-active {
      font-size: 11px;
      font-weight: 700;
      padding: 3px 9px;
      border-radius: 12px;
      background: rgba(16, 185, 129, 0.14);
      border: 1px solid rgba(16, 185, 129, 0.35);
      color: #34d399;
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }
    .badge-status-left {
      font-size: 11px;
      font-weight: 700;
      padding: 3px 9px;
      border-radius: 12px;
      background: rgba(239, 68, 68, 0.14);
      border: 1px solid rgba(239, 68, 68, 0.35);
      color: #f87171;
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }
    .amt-pos {
      color: #34d399;
      font-weight: 700;
      font-family: 'Outfit', sans-serif;
    }
    .amt-neg {
      color: #f87171;
      font-weight: 700;
      font-family: 'Outfit', sans-serif;
    }
    .tx-type-tag {
      font-size: 11.5px;
      font-weight: 600;
      color: #cbd5e1;
    }
    .owner-filter-tabs {
      display: flex;
      align-items: center;
      gap: 6px;
      margin-left: auto;
    }
    .filter-tab-btn {
      background: transparent;
      border: 1px solid rgba(255, 255, 255, 0.08);
      color: #94a3b8;
      font-size: 12px;
      font-weight: 700;
      padding: 5px 12px;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .filter-tab-btn.active, .filter-tab-btn:hover {
      background: rgba(139, 92, 246, 0.2);
      border-color: rgba(139, 92, 246, 0.5);
      color: #c084fc;
    }
    .modal-box-large {
      max-width: 960px !important;
      width: 95% !important;
    }
    .modal-large-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 18px;
      gap: 16px;
      flex-wrap: wrap;
    }
    .btn-owner-export-csv {
      background: linear-gradient(135deg, #059669, #10b981);
      color: #ffffff;
      font-size: 12.5px;
      font-weight: 700;
      border: none;
      border-radius: 10px;
      padding: 8px 16px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.35);
      transition: all 0.2s ease;
    }
    .btn-owner-export-csv:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 18px rgba(16, 185, 129, 0.5);
    }
    .modal-economy-stats-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 12px;
      margin-bottom: 16px;
    }
    .eco-stat-box {
      background: rgba(255, 255, 255, 0.025);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 12px;
      padding: 12px 14px;
    }
    .eco-stat-label {
      font-size: 10.5px;
      font-weight: 800;
      color: #64748b;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      margin-bottom: 4px;
    }
    .eco-stat-value {
      font-family: 'Outfit', sans-serif;
      font-size: 20px;
      font-weight: 800;
      color: #ffffff;
    }
    .modal-filter-bar {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 14px;
      flex-wrap: wrap;
    }
    .modal-filter-select {
      max-width: 200px;
      font-size: 12.5px;
      padding: 8px 12px;
    }
    .modal-pagination-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-top: 14px;
      gap: 12px;
      flex-wrap: wrap;
    }
    .server-details-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      margin-bottom: 16px;
      flex-wrap: wrap;
    }
    .server-details-avatar {
      width: 48px;
      height: 48px;
      border-radius: 14px;
      background: linear-gradient(135deg, #7c3aed, #3b82f6);
      color: #fff;
      font-size: 18px;
      font-weight: 800;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }
    .server-details-avatar img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .owner-user-title {
      color: #ffffff;
      font-size: 13px;
      font-weight: 700;
    }

    /* Light Theme Overrides for Bot Owner Hub */
    [data-theme="light"] .owner-hub-hero {
      background: linear-gradient(135deg, #f5f3ff 0%, #ede9fe 40%, #ffffff 100%) !important;
      border-color: #ddd6fe !important;
      box-shadow: 0 10px 30px rgba(139, 92, 246, 0.09) !important;
    }
    [data-theme="light"] .owner-hero-title {
      color: #0f172a !important;
    }
    [data-theme="light"] .owner-hero-subtitle {
      color: #475569 !important;
    }
    [data-theme="light"] .owner-box-card {
      background: #ffffff !important;
      border-color: #e2e8f0 !important;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05) !important;
    }
    [data-theme="light"] .owner-stat-card {
      background: #ffffff !important;
      border-color: #e2e8f0 !important;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04) !important;
    }
    [data-theme="light"] .owner-stat-label {
      color: #64748b !important;
      font-weight: 800 !important;
    }
    [data-theme="light"] .val-blue { color: #0284c7 !important; }
    [data-theme="light"] .val-teal { color: #059669 !important; }
    [data-theme="light"] .val-amber { color: #d97706 !important; }
    [data-theme="light"] .val-purple { color: #7c3aed !important; }
    [data-theme="light"] .owner-stat-progress-bar {
      background: #f1f5f9 !important;
    }
    [data-theme="light"] .owner-stat-progress-text {
      color: #64748b !important;
    }
    [data-theme="light"] .badge-teal {
      background: rgba(16, 185, 129, 0.12) !important;
      color: #047857 !important;
    }
    [data-theme="light"] .badge-amber {
      background: rgba(245, 158, 11, 0.12) !important;
      color: #b45309 !important;
    }
    [data-theme="light"] .badge-purple {
      background: rgba(139, 92, 246, 0.12) !important;
      color: #6d28d9 !important;
    }
    [data-theme="light"] .owner-card-title {
      color: #0f172a !important;
    }
    [data-theme="light"] .owner-card-subtitle {
      color: #64748b !important;
    }
    [data-theme="light"] .owner-user-title {
      color: #0f172a !important;
    }
    [data-theme="light"] .owner-table th {
      color: #475569 !important;
      border-bottom: 1px solid #e2e8f0 !important;
      background: #f8fafc !important;
    }
    [data-theme="light"] .owner-table td {
      color: #1e293b !important;
      border-bottom: 1px solid #f1f5f9 !important;
    }
    [data-theme="light"] .owner-table tr:hover td {
      background: #f8fafc !important;
    }
    [data-theme="light"] .owner-table td strong {
      color: #0f172a !important;
    }
    [data-theme="light"] .owner-id-pill {
      background: #ede9fe !important;
      border-color: #ddd6fe !important;
      color: #6d28d9 !important;
    }
    [data-theme="light"] .owner-id-pill:hover {
      background: #ddd6fe !important;
      color: #5b21b6 !important;
    }
    [data-theme="light"] .owner-badge-crown {
      background: #fef3c7 !important;
      border-color: #fde68a !important;
      color: #b45309 !important;
    }
    [data-theme="light"] .owner-btn-protected {
      background: #f1f5f9 !important;
      border-color: #cbd5e1 !important;
      color: #475569 !important;
    }
    [data-theme="light"] .btn-owner-refresh {
      background: #f5f3ff !important;
      border-color: #ddd6fe !important;
      color: #6d28d9 !important;
    }
    [data-theme="light"] .btn-owner-refresh:hover {
      background: #ede9fe !important;
      color: #5b21b6 !important;
    }
    [data-theme="light"] .owner-btn-wipe {
      background: #fee2e2 !important;
      border-color: #fecaca !important;
      color: #dc2626 !important;
    }
    [data-theme="light"] .owner-btn-wipe:hover {
      background: #fca5a5 !important;
      color: #991b1b !important;
    }
    [data-theme="light"] .owner-btn-remove {
      background: #fee2e2 !important;
      border-color: #fecaca !important;
      color: #dc2626 !important;
    }
    [data-theme="light"] .owner-btn-remove:hover {
      background: #fca5a5 !important;
      color: #991b1b !important;
    }
    [data-theme="light"] .filter-tab-btn {
      background: #f8fafc !important;
      border-color: #cbd5e1 !important;
      color: #64748b !important;
    }
    [data-theme="light"] .filter-tab-btn.active {
      background: #ede9fe !important;
      border-color: #a855f7 !important;
      color: #6d28d9 !important;
    }
    [data-theme="light"] .filter-tab-btn:hover {
      color: #6d28d9 !important;
    }
    [data-theme="light"] .owner-search-container {
      background: #f8fafc !important;
      border-color: #cbd5e1 !important;
    }
    [data-theme="light"] .owner-input-search {
      color: #0f172a !important;
    }
    [data-theme="light"] .owner-input-search::placeholder {
      color: #94a3b8 !important;
    }
    [data-theme="light"] .owner-search-icon {
      color: #64748b !important;
    }
    [data-theme="light"] .header-search-wrap {
      background: #f8fafc !important;
      border-color: #e2e8f0 !important;
    }
    [data-theme="light"] .header-search-input {
      color: #0f172a !important;
    }

    /* Server Details Inspector Modal Styles */
    .server-details-box {
      max-width: 960px !important;
      width: 95vw !important;
      max-height: 90vh !important;
      overflow-y: auto !important;
      border: 1px solid rgba(139, 92, 246, 0.4) !important;
      box-shadow: 0 0 50px rgba(139, 92, 246, 0.25) !important;
      padding: 26px !important;
      position: relative !important;
    }
    .server-details-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 16px;
      margin-bottom: 22px;
      padding-bottom: 18px;
      padding-right: 54px; /* Prevents overlap with absolute .modal-close button */
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    }
    .server-details-title {
      margin: 0;
      font-size: 22px;
      font-weight: 800;
      color: #ffffff;
      line-height: 1.2;
    }
    .server-details-section-title {
      margin: 0 0 14px;
      font-size: 14px;
      font-weight: 800;
      color: #ffffff;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .server-details-stat-card {
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.07);
      border-radius: 12px;
      padding: 14px;
      transition: transform 0.2s ease, border-color 0.2s ease;
    }
    .server-details-stat-card:hover {
      border-color: rgba(139, 92, 246, 0.35);
      transform: translateY(-1px);
    }
    .server-details-stat-title {
      font-size: 11px;
      font-weight: 700;
      color: #94a3b8;
      letter-spacing: 0.5px;
      text-transform: uppercase;
    }
    .server-details-stat-sub {
      font-size: 11px;
      color: #94a3b8;
      margin-top: 2px;
    }
    .server-details-panel {
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 14px;
      padding: 18px;
    }
    .server-details-holder-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.05);
      padding: 10px 14px;
      border-radius: 10px;
      gap: 12px;
      transition: all 0.2s ease;
    }
    .server-details-holder-row:hover {
      background: rgba(255, 255, 255, 0.06);
      border-color: rgba(139, 92, 246, 0.3);
    }
    .server-details-user-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      object-fit: cover;
      border: 1.5px solid rgba(139, 92, 246, 0.4);
      flex-shrink: 0;
    }
    .server-details-user-name {
      font-weight: 700;
      font-size: 13px;
      color: #f1f5f9;
      line-height: 1.2;
    }
    .server-details-id-pill {
      font-family: 'JetBrains Mono', monospace;
      font-size: 10.5px;
      padding: 2px 7px;
      border-radius: 6px;
      background: rgba(139, 92, 246, 0.14);
      border: 1px solid rgba(139, 92, 246, 0.3);
      color: #c4b5fd;
      display: inline-flex;
      align-items: center;
      gap: 4px;
      cursor: copy;
      transition: all 0.18s ease;
      user-select: all;
    }
    .server-details-id-pill:hover {
      background: rgba(139, 92, 246, 0.26);
      border-color: #a855f7;
      color: #ffffff;
      transform: scale(1.02);
    }
    .server-details-type-pill {
      font-size: 11px;
      font-weight: 700;
      padding: 3px 8px;
      border-radius: 6px;
      display: inline-block;
      text-transform: capitalize;
    }
    .type-purchase {
      background: rgba(59, 130, 246, 0.15);
      border: 1px solid rgba(59, 130, 246, 0.35);
      color: #60a5fa;
    }
    .type-grant {
      background: rgba(16, 185, 129, 0.15);
      border: 1px solid rgba(16, 185, 129, 0.35);
      color: #34d399;
    }
    .type-deduct {
      background: rgba(239, 68, 68, 0.15);
      border: 1px solid rgba(239, 68, 68, 0.35);
      color: #f87171;
    }
    .type-reward {
      background: rgba(245, 158, 11, 0.15);
      border: 1px solid rgba(245, 158, 11, 0.35);
      color: #fbbf24;
    }
    .server-details-datetime {
      display: flex;
      flex-direction: column;
      gap: 1px;
      font-size: 11px;
      line-height: 1.25;
    }
    .server-details-date {
      color: #e2e8f0;
      font-weight: 600;
      white-space: nowrap;
    }
    .server-details-time {
      color: #94a3b8;
      font-size: 10px;
      font-family: 'JetBrains Mono', monospace;
      white-space: nowrap;
    }

    /* Light Mode Overrides for Server Details Modal */
    [data-theme="light"] .server-details-box {
      background: #ffffff !important;
      border: 1px solid #e2e8f0 !important;
      box-shadow: 0 25px 60px rgba(15, 23, 42, 0.16) !important;
      color: #0f172a !important;
    }
    [data-theme="light"] .server-details-header {
      border-bottom-color: #e2e8f0 !important;
    }
    [data-theme="light"] .server-details-title {
      color: #0f172a !important;
    }
    [data-theme="light"] .server-details-section-title {
      color: #0f172a !important;
    }
    [data-theme="light"] .server-details-stat-card {
      background: #f8fafc !important;
      border: 1px solid #e2e8f0 !important;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.03) !important;
    }
    [data-theme="light"] .server-details-stat-title {
      color: #64748b !important;
    }
    [data-theme="light"] .server-details-stat-sub {
      color: #64748b !important;
    }
    [data-theme="light"] .server-details-panel {
      background: #f8fafc !important;
      border: 1px solid #e2e8f0 !important;
      box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.02) !important;
    }
    [data-theme="light"] .server-details-holder-row {
      background: #ffffff !important;
      border: 1px solid #e2e8f0 !important;
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.03) !important;
    }
    [data-theme="light"] .server-details-holder-row:hover {
      background: #f1f5f9 !important;
      border-color: #cbd5e1 !important;
    }
    [data-theme="light"] .server-details-user-name {
      color: #0f172a !important;
    }
    [data-theme="light"] .server-details-id-pill {
      background: #ede9fe !important;
      border-color: #ddd6fe !important;
      color: #6d28d9 !important;
    }
    [data-theme="light"] .server-details-date {
      color: #1e293b !important;
    }
    [data-theme="light"] .server-details-time {
      color: #64748b !important;
    }
    [data-theme="light"] .server-details-user-avatar {
      border-color: #c4b5fd !important;
    }
  `;
}
