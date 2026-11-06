// Client-side JavaScript — extracted from ui.js

export function getScripts({ session, getCoinBadgeHtml, ICONS, isAdmin, isOwner }) {
  return `  <script>
    const CURRENT_USER_AVATAR = '${session?.avatar || 'https://cdn.discordapp.com/embed/avatars/0.png'}';
    const COIN_ICON_HTML = '${getCoinBadgeHtml()}';
    const CLIENT_ICONS = {
      trash: '<svg class="btn-icon-shake" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>',
      userMinus: '<svg class="btn-icon-shake" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="23" y1="11" x2="17" y2="11"/></svg>',
      arrowLeft: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>',
      arrowRight: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>',
      check: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',
      cross: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
      edit: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>',
      play: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>',
      cart: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>',
      eye: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>',
      sun: '${ICONS.sun}',
      moon: '${ICONS.moon}',
      chart: '${ICONS.chart}',
      copy: '${ICONS.copy}',
      calendar: '${ICONS.calendar}',
      doc: '${ICONS.doc}',
      arrowUp: '${ICONS.arrowUp}',
      refresh: '${ICONS.refresh}'
    };
    const ICONS = CLIENT_ICONS;
    const esc = s => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    let currentGuildId = localStorage.getItem('vyntrix_active_guild') || '';
    let currentGuildName = 'Selected Server';
    let currentWalletBalance = 0;
    let availableGuilds = [];
    let isCurrentGuildAdmin = ${isAdmin ? 'true' : 'false'};
    const isBotOwner = ${isOwner ? 'true' : 'false'};

    let activeApproveOrderId = null;
    let activeApproveAmount = 0;

    function showToast(msg, isError = false) {
      const t = document.getElementById('toast');
      t.textContent = (isError ? '⚠️ ' : '✔ ') + msg;
      t.style.display = 'flex';
      t.style.borderColor = isError ? '#ef4444' : '#10b981';
      setTimeout(() => { t.style.display = 'none'; }, 4000);
    }

    // ─── STATE & IN-MEMORY CACHES ───
    let allUserOrders = [];
    let allUserLedger = [];
    let allUserInventory = [];
    let allShopProducts = [];
    let currentCategoryFilter = 'all';
    let currentLedgerTypeFilter = 'all';
    let currentShopQuery = '';
    let currentOrderQuery = '';
    let currentLedgerQuery = '';
    let ledgerCurrentPage = 1;
    let ledgerPageSize = 10;
    let ledgerSortDesc = true;
    let ledgerDateFilter = 'all';

    // ─── THEME CONTROLS (LIGHT / DARK MODE) ───
    function initTheme() {
      const saved = localStorage.getItem('vyntrix_theme');
      const theme = saved || (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
      applyTheme(theme);
    }

    function toggleTheme() {
      const current = document.documentElement.getAttribute('data-theme') || 'dark';
      const next = current === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      localStorage.setItem('vyntrix_theme', next);
      showToast((next === 'light' ? '☀️ Switched to Light' : '🌙 Switched to Dark') + ' Mode');
    }

    function setSpecificTheme(theme) {
      applyTheme(theme);
      localStorage.setItem('vyntrix_theme', theme);
      showToast((theme === 'light' ? '☀️ Light' : '🌙 Dark') + ' Mode Activated');
    }

    function applyTheme(theme) {
      document.documentElement.setAttribute('data-theme', theme);
      const icon = document.getElementById('theme-toggle-icon');
      const label = document.getElementById('theme-toggle-text');
      if (icon && label) {
        if (theme === 'light') {
          icon.innerHTML = CLIENT_ICONS.sun;
          label.textContent = 'Light';
        } else {
          icon.innerHTML = CLIENT_ICONS.moon;
          label.textContent = 'Dark';
        }
      }

      const pillSun = document.getElementById('theme-pill-sun');
      const pillMoon = document.getElementById('theme-pill-moon');
      if (pillSun && pillMoon) {
        pillSun.classList.toggle('active-theme-pill', theme === 'light');
        pillMoon.classList.toggle('active-theme-pill', theme !== 'light');
      }

      const indLight = document.getElementById('ind-light');
      const indDark = document.getElementById('ind-dark');
      const cardLight = document.getElementById('settings-theme-light');
      const cardDark = document.getElementById('settings-theme-dark');
      if (indLight && indDark) {
        indLight.style.display = theme === 'light' ? 'inline' : 'none';
        indDark.style.display = theme === 'dark' ? 'inline' : 'none';
      }
      if (cardLight && cardDark) {
        cardLight.classList.toggle('active-theme', theme === 'light');
        cardDark.classList.toggle('active-theme', theme === 'dark');
      }
    }

    let balanceHidden = false;
    function toggleBalanceVisibility() {
      balanceHidden = !balanceHidden;
      const el = document.getElementById('dash-balance-val');
      if (el) {
        if (balanceHidden) {
          el.dataset.origVal = el.textContent;
          el.textContent = '••••';
        } else {
          el.textContent = el.dataset.origVal || '0';
        }
      }
    }



    function handleGlobalHeaderSearch(val) {
      const raw = (val || '').trim();
      const adminTab = document.getElementById('admin-tab');

      // Extract 17-21 digit Discord User ID if present
      const match = raw.match(/\d{17,21}/);
      const q = match ? match[0] : raw;

      if (match) {
        if (adminTab && !adminTab.classList.contains('active')) {
          switchTab('admin-tab');
        }
        const inspectInp = document.getElementById('inspect-user-id-input');
        if (inspectInp) inspectInp.value = q;
        const adjTarget = document.getElementById('adj-target-id');
        if (adjTarget) adjTarget.value = q;
        if (lastInspectedUserId !== q) {
          handleInspectUser(null, q);
        }
      }

      if (adminTab && adminTab.classList.contains('active')) {
        const adminSearchInp = document.getElementById('admin-orders-search');
        if (adminSearchInp && adminSearchInp.value !== val) {
          adminSearchInp.value = val;
        }
        filterAdminOrders(val);

        const adminProdSearchInp = document.getElementById('admin-products-search');
        if (adminProdSearchInp && adminProdSearchInp.value !== val) {
          adminProdSearchInp.value = val;
        }
        filterAdminProducts(val);
      } else {
        const ordersTab = document.getElementById('orders-tab');
        const txTab = document.getElementById('transactions-tab');
        if (ordersTab && ordersTab.classList.contains('active')) {
          const inp = document.getElementById('order-user-search-input');
          if (inp) { inp.value = val; handleOrdersSearchInput(val); }
        } else if (txTab && txTab.classList.contains('active')) {
          const inp = document.getElementById('tx-search-input');
          if (inp) inp.value = val;
          handleTxSearchInput(val);
        } else {
          const shopInp = document.getElementById('shop-search-input');
          if (shopInp) { shopInp.value = val; handleShopSearch(val); }
        }
      }
    }

    function handleAdminTableSearch(val) {
      filterAdminOrders(val);
      const raw = (val || '').trim();
      const match = raw.match(/\d{17,21}/);
      const q = match ? match[0] : raw;
      if (match) {
        const inspectInp = document.getElementById('inspect-user-id-input');
        if (inspectInp && inspectInp.value !== q) {
          inspectInp.value = q;
          handleInspectUser(null, q);
        }
        const adjTarget = document.getElementById('adj-target-id');
        if (adjTarget) adjTarget.value = q;
      }
    }

    function switchTab(tabId) {
      document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
      document.querySelectorAll('.tab-btn, .nav-btn').forEach(el => el.classList.remove('active'));
      
      const targetContent = document.getElementById(tabId);
      if (targetContent) targetContent.classList.add('active');

      const btnId = 'btn-tab-' + tabId.replace('-tab', '');
      const navBtnId = 'nav-btn-' + tabId.replace('-tab', '');
      const btn = document.getElementById(btnId);
      const navBtn = document.getElementById(navBtnId);
      if (btn) btn.classList.add('active');
      if (navBtn) navBtn.classList.add('active');

      document.querySelectorAll('.mobile-bottom-nav-btn').forEach(el => el.classList.remove('active'));
      const mobBtn = document.getElementById('mob-nav-' + tabId.replace('-tab', ''));
      if (mobBtn) mobBtn.classList.add('active');

      if (window.innerWidth <= 768 && typeof toggleSidebar === 'function') {
        toggleSidebar(true);
      }

      try {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      } catch (e) {}

      try {
        if (tabId === 'dashboard-tab') {
          loadUserData();
          loadShop();
          renderDashboardFeatured();
        } else if (tabId === 'wallet-tab') {
          loadUserData();
        } else if (tabId === 'shop-tab') {
          loadShop();
        } else if (tabId === 'orders-tab') {
          currentOrderStatusFilter = 'all';
          currentOrderSearch = '';
          currentOrdersPage = 1;
          const searchInp = document.getElementById('order-user-search-input');
          if (searchInp) searchInp.value = '';
          const clearBtn = document.getElementById('order-search-clear');
          if (clearBtn) clearBtn.style.display = 'none';
          document.querySelectorAll('#orders-tab .orders-filter-btn').forEach(el => el.classList.remove('active'));
          const allBtn = document.getElementById('order-filter-all');
          if (allBtn) allBtn.classList.add('active');
          loadOrdersData(true);
        } else if (tabId === 'transactions-tab') {
          currentTxType = 'all';
          currentTxSearch = '';
          currentTxDirection = 'all';
          currentTxPage = 1;
          const searchInp = document.getElementById('tx-search-input');
          if (searchInp) searchInp.value = '';
          const clearBtn = document.getElementById('tx-search-clear-btn');
          if (clearBtn) clearBtn.style.display = 'none';
          document.querySelectorAll('#transactions-tab .tx-tab-pill').forEach(el => el.classList.remove('active'));
          const allPill = document.getElementById('tx-tab-all');
          if (allPill) allPill.classList.add('active');
          loadTransactionsData(true);
        } else if (tabId === 'admin-tab') {
          if (!isCurrentGuildAdmin && !isBotOwner) {
            showToast('You do not have Administrator permissions for this server.', true);
            switchTab('dashboard-tab');
            return;
          }
          loadAdminOrders();
          loadAdminProducts();
          loadAdminRate();
          loadAdminConfig();
          loadAdminDropboxes();
          loadGuildRoles();
          loadGuildChannels();
          loadServerClearStats();
        } else if (tabId === 'owner-tab') {
          loadOwnerSystemStats();
          loadOwnerAdmins();
          loadOwnerGuilds();
        } else if (tabId === 'settings-tab') {
          const theme = document.documentElement.getAttribute('data-theme') || 'dark';
          applyTheme(theme);
          const setGuildEl = document.getElementById('settings-guild-id');
          if (setGuildEl) setGuildEl.textContent = currentGuildName + (currentGuildId ? ' (' + currentGuildId + ')' : '');
        }
      } catch (err) {
        console.error('Tab switch loading error:', err);
      }
    }

    function closeModal(id) {
      document.getElementById(id).classList.remove('active');
    }

    // ─── INITIALIZE GUILDS / SERVERS ───
    async function initGuilds() {
      try {
        const res = await fetch('/api/guilds');
        const data = await res.json();
        availableGuilds = data.guilds || [];

        const select = document.getElementById('server-select');
        if (availableGuilds.length === 0) {
          select.innerHTML = '<option value="">❌ No Mutual Servers Found</option>';
          currentGuildId = '';
          currentGuildName = 'No Mutual Servers';
          const actEl = document.getElementById('active-server-status');
          if (actEl) actEl.textContent = '⚠️ Not in any server with bot';
          const walEl = document.getElementById('wallet-server-name');
          if (walEl) walEl.textContent = 'No Mutual Server';
          const balEl = document.getElementById('user-balance-val');
          if (balEl) balEl.textContent = '0';
          const pContainer = document.getElementById('products-container');
          if (pContainer) {
            pContainer.innerHTML = \`
              <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--muted);">
                <div style="font-size: 32px; margin-bottom: 8px;">🏰</div>
                <div style="font-weight: 700; color: #fff; margin-bottom: 4px;">No Mutual Servers Found</div>
                <div style="font-size: 13px;">You are not currently in any Discord server where this bot is present.<br>Please join a server where the bot is added to access your coins and the shop.</div>
              </div>
            \`;
          }
          const lTbody = document.getElementById('user-ledger-table');
          if (lTbody) lTbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: var(--muted);">No mutual server connected.</td></tr>';
          return;
        } else {
          // Check if stored guild still exists in available mutual guilds (ignore 'global')
          if (!currentGuildId || currentGuildId === 'global' || !availableGuilds.some(g => g.guildId === currentGuildId)) {
            currentGuildId = availableGuilds[0].guildId;
            localStorage.setItem('vyntrix_active_guild', currentGuildId);
          }

          select.innerHTML = availableGuilds.map(g => {
            const memberInfo = g.memberCount ? \` (\${g.memberCount} members)\` : '';
            return \`
              <option value="\${g.guildId}" \${g.guildId === currentGuildId ? 'selected' : ''}>
                🏰 \${g.guildName}\${memberInfo}
              </option>
            \`;
          }).join('');

          const selectedObj = availableGuilds.find(g => g.guildId === currentGuildId);
          currentGuildName = selectedObj?.guildName || 'Selected Server';
        }

        updateServerLabels();
        await loadUserData();
        await loadShop();
        renderDashboardFeatured();
      } catch (e) {
        console.error('Guilds init error:', e);
      }
    }

    function changeActiveServer(newGuildId) {
      currentGuildId = newGuildId;
      localStorage.setItem('vyntrix_active_guild', newGuildId);
      const selectedObj = availableGuilds.find(g => g.guildId === currentGuildId);
      currentGuildName = selectedObj?.guildName || 'Selected Server';

      updateServerLabels();
      loadUserData();
      loadShop();
      renderDashboardFeatured();

      // Immediately reload server-isolated transactions if on transactions tab
      const txTab = document.getElementById('transactions-tab');
      if (txTab && txTab.classList.contains('active')) {
        loadTransactionsData(true);
      }

      // Immediately reload server-isolated orders if on orders tab
      const ordersTab = document.getElementById('orders-tab');
      if (ordersTab && ordersTab.classList.contains('active')) {
        loadOrdersData(true);
      }

      const adminTab = document.getElementById('admin-tab');
      if (adminTab && adminTab.classList.contains('active')) {
        loadAdminOrders();
        loadAdminProducts();
        loadAdminRate();
        loadAdminConfig();
        loadAdminDropboxes();
        loadGuildRoles();
        loadGuildChannels();
        loadServerClearStats();
      }
    }

    function updateServerLabels() {
      const setLbl = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.textContent = val;
      };
      setLbl('wallet-server-name', currentGuildName);
      setLbl('shop-server-name', currentGuildName);
      setLbl('orders-server-name', currentGuildName);
      setLbl('ledger-server-name', currentGuildName);
      setLbl('topup-target-server', currentGuildName);
      setLbl('dash-server-badge', '🏰 ' + currentGuildName);
      setLbl('settings-guild-id', currentGuildName + (currentGuildId ? ' (' + currentGuildId + ')' : ''));

      const selectedObj = availableGuilds.find(g => g.guildId === currentGuildId);
      const memberCount = selectedObj?.memberCount || 8;
      setLbl('dash-guild-name', currentGuildName);
      setLbl('dash-member-count', memberCount + ' Members');
      setLbl('dash-total-servers', availableGuilds.length || 1);

      // Floating Header Server Badge updates
      setLbl('header-server-display-name', currentGuildName);
      setLbl('header-server-display-members', memberCount + ' Members');
      const headerInitials = (currentGuildName || 'CW').split(' ').filter(Boolean).map(w => w[0]).join('').substring(0, 2).toUpperCase() || 'CW';
      setLbl('header-server-initials', headerInitials);
      const hLogoEl = document.getElementById('header-server-avatar-img');
      const hInitEl = document.getElementById('header-server-initials');
      if (hLogoEl && hInitEl) {
        if (selectedObj?.iconUrl) {
          hLogoEl.src = selectedObj.iconUrl;
          hLogoEl.style.display = 'block';
          hInitEl.style.display = 'none';
        } else {
          hLogoEl.style.display = 'none';
          hInitEl.style.display = 'block';
        }
      }

      // Informational server badge on redesigned wallet page
      setLbl('wallet-header-server-name', currentGuildName);
      setLbl('wallet-header-server-members', memberCount + ' members');
      const walletLogoEl = document.getElementById('wallet-header-server-icon');
      const fallbackEl = document.getElementById('wallet-header-server-fallback');
      if (walletLogoEl) {
        if (selectedObj?.iconUrl) {
          walletLogoEl.src = selectedObj.iconUrl;
          walletLogoEl.style.display = 'block';
          if (fallbackEl) fallbackEl.style.display = 'none';
        } else {
          walletLogoEl.style.display = 'none';
          if (fallbackEl) fallbackEl.style.display = 'flex';
        }
      }

      document.querySelectorAll('.dash-curr-server').forEach(el => el.textContent = currentGuildName);
      document.querySelectorAll('.wallet-curr-server').forEach(el => el.textContent = currentGuildName);

      setLbl('admin-orders-server-name', currentGuildName);
      setLbl('admin-prod-server-name', currentGuildName);
      setLbl('admin-adj-server-name', currentGuildName);
      setLbl('admin-config-server-name', currentGuildName);
      setLbl('admin-dropbox-server-name', currentGuildName);
      setLbl('dropbox-target-server', currentGuildName);
      setLbl('admin-clear-server-name', currentGuildName);
      document.querySelectorAll('.admin-curr-server').forEach(el => el.textContent = currentGuildName);
    }

    // ─── USER DATA LOADER ───
    async function loadUserData() {
      if (!currentGuildId) return;
      try {
        const res = await fetch(\`/api/me?guildId=\${currentGuildId}\`);
        if (!res.ok) return;
        const data = await res.json();

        // Update server balance & total balance across elements
        currentWalletBalance = data.user?.balance || 0;
        const balStr = (data.user?.balance || 0).toLocaleString();
        const totalStr = (data.user?.totalBalance || 0).toLocaleString();

        const userBalVal = document.getElementById('user-balance-val');
        if (userBalVal) userBalVal.textContent = balStr;
        const dashBalVal = document.getElementById('dash-balance-val');
        if (dashBalVal) dashBalVal.textContent = balStr;

        const userTotVal = document.getElementById('user-total-balance');
        if (userTotVal) userTotVal.textContent = totalStr;
        const dashTotVal = document.getElementById('dash-total-balance');
        if (dashTotVal) dashTotVal.textContent = totalStr;

        const rateDisplay = document.getElementById('wallet-rate-display');
        if (rateDisplay) rateDisplay.textContent = data.user?.conversionRate || 1;

        // Update admin tab visibility based on server permissions
        isCurrentGuildAdmin = Boolean(data.user?.isGuildAdmin || isBotOwner);
        const btnAdmin = document.getElementById('nav-btn-admin');
        if (btnAdmin) {
          if (isCurrentGuildAdmin) {
            btnAdmin.style.setProperty('display', 'flex', 'important');
            btnAdmin.classList.remove('is-hidden');
          } else {
            btnAdmin.style.setProperty('display', 'none', 'important');
            btnAdmin.classList.add('is-hidden');
          }
        }

        const actStatusEl = document.getElementById('active-server-status');
        if (actStatusEl) {
          actStatusEl.textContent = isCurrentGuildAdmin ? '🛡️ Admin Access' : '👛 Member Access';
        }

        // ─── MEMBERSHIP TIER SYNCHRONIZATION (DISCORD /PROFILE MATCHED) ───
        if (data.user?.tierTheme) {
          const t = data.user.tierTheme;
          const prog = data.user.tierProgress || {};
          const thresholds = data.config?.tierThresholds || { diamond: 5000, gold: 2000, silver: 500, vip: 100 };

          // 1. Header Profile Role/Tier Tag
          const headerTierTag = document.getElementById('header-profile-tier-tag');
          if (headerTierTag) {
            headerTierTag.innerHTML = t.icon + ' ' + t.label;
            headerTierTag.style.background = t.bg;
            headerTierTag.style.borderColor = t.border;
            headerTierTag.style.color = t.text;
            headerTierTag.style.boxShadow = '0 0 12px ' + t.glow;
          }

          // 2. Dashboard Cosmic Hero Pill
          const dashTierPill = document.getElementById('dash-user-tier-pill');
          const dashTierIcon = document.getElementById('dash-tier-icon');
          const dashTierLabel = document.getElementById('dash-tier-label');
          if (dashTierPill) {
            if (dashTierIcon) dashTierIcon.textContent = t.icon;
            if (dashTierLabel) dashTierLabel.textContent = t.label + ' TIER';
            dashTierPill.style.borderColor = t.border;
            dashTierPill.style.background = t.bg;
            dashTierPill.style.color = t.text;
            dashTierPill.style.boxShadow = '0 0 10px ' + t.glow;
          }

          // 3. Server Wallet Balance Box Badge & Progress Bar
          const walletTierBadge = document.getElementById('wallet-tier-badge');
          const walletTierIcon = document.getElementById('wallet-tier-badge-icon');
          const walletTierText = document.getElementById('wallet-tier-badge-text');
          if (walletTierBadge) {
            walletTierBadge.style.display = 'inline-flex';
            if (walletTierIcon) walletTierIcon.textContent = t.icon;
            if (walletTierText) walletTierText.textContent = t.label;
            walletTierBadge.style.background = t.bg;
            walletTierBadge.style.borderColor = t.border;
            walletTierBadge.style.color = t.text;
            walletTierBadge.style.boxShadow = '0 0 12px ' + t.glow;
          }

          const progSub = document.getElementById('wallet-tier-progress-sub');
          const progFill = document.getElementById('wallet-tier-prog-bar-fill');
          const progText = document.getElementById('wallet-tier-prog-text');
          if (progSub && progFill && progText) {
            progSub.style.display = 'block';
            progFill.style.width = (prog.percentage || 0) + '%';
            progFill.style.background = t.text || '#8b5cf6';
            progFill.style.boxShadow = '0 0 10px ' + (t.glow || 'rgba(139, 92, 246, 0.5)');
            progText.innerHTML = prog.message || t.perks;
          }

          // 4. Update Interactive Membership Tiers Roadmap Grid
          updateMembershipTiersGrid(data.user?.balance || 0, data.user?.tier, thresholds);

          // 5. Settings Tab User Profile Badge
          const setTierBadge = document.getElementById('settings-user-tier-badge');
          if (setTierBadge) {
            setTierBadge.style.display = 'inline-flex';
            setTierBadge.innerHTML = t.icon + ' ' + t.label + ' Tier';
            setTierBadge.style.background = t.bg;
            setTierBadge.style.borderColor = t.border;
            setTierBadge.style.color = t.text;
            setTierBadge.style.boxShadow = '0 0 12px ' + t.glow;
          }
        }

        // Cache lists for interactive searching and category filtering
        allUserOrders = data.recentOrders || [];
        allUserLedger = data.ledger || [];
        allUserInventory = data.inventory || [];

        const dashOrdersCount = document.getElementById('dash-orders-count');
        if (dashOrdersCount) dashOrdersCount.textContent = allUserOrders.length;

        renderUserOrders();
        renderUserLedger();
        renderWalletInventory();
        renderWalletMiniLedger();

      } catch (e) {
        console.error(e);
      }
    }

    // ─── MEMBERSHIP TIERS ROADMAP CONTROLLER ───
    function updateMembershipTiersGrid(balance = 0, activeTier = 'MEMBER', thresholds = {}) {
      const vipThresh = thresholds.vip ?? 100;
      const silverThresh = thresholds.silver ?? 500;
      const goldThresh = thresholds.gold ?? 2000;
      const diamondThresh = thresholds.diamond ?? 5000;

      const setThresh = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.textContent = Number(val).toLocaleString();
      };
      setThresh('tier-threshold-vip', vipThresh);
      setThresh('tier-threshold-silver', silverThresh);
      setThresh('tier-threshold-gold', goldThresh);
      setThresh('tier-threshold-diamond', diamondThresh);

      const tiers = [
        { id: 'member', min: 0, label: 'MEMBER' },
        { id: 'vip', min: vipThresh, label: 'VIP' },
        { id: 'silver', min: silverThresh, label: 'SILVER' },
        { id: 'gold', min: goldThresh, label: 'GOLD' },
        { id: 'diamond', min: diamondThresh, label: 'DIAMOND' },
      ];

      const currentTierNormalized = String(activeTier || 'MEMBER').toUpperCase();

      tiers.forEach(t => {
        const card = document.getElementById('tier-card-' + t.id);
        const pill = document.getElementById('tier-pill-' + t.id);
        const req = document.getElementById('tier-req-' + t.id);
        if (!card) return;

        card.classList.remove('tier-active', 'tier-unlocked', 'tier-locked');

        const isCurrent = currentTierNormalized === t.label;
        const isUnlocked = balance >= t.min || ['OWNER', 'ADMIN', 'STAFF'].includes(currentTierNormalized);

        if (isCurrent) {
          card.classList.add('tier-active');
          if (pill) {
            pill.textContent = 'Active Tier';
            pill.className = 'tier-status-pill pill-current';
          }
          if (req) req.innerHTML = '✔ <strong>Active Level</strong>';
        } else if (isUnlocked) {
          card.classList.add('tier-unlocked');
          if (pill) {
            pill.textContent = 'Unlocked';
            pill.className = 'tier-status-pill pill-unlocked';
          }
          if (req) req.innerHTML = '✔ Unlocked perk tier';
        } else {
          card.classList.add('tier-locked');
          if (pill) {
            pill.textContent = 'Locked';
            pill.className = 'tier-status-pill pill-locked';
          }
          const needed = t.min - balance;
          if (req) req.innerHTML = 'Need <strong>' + Number(needed).toLocaleString() + '</strong> more';
        }
      });
    }

    // ─── REAL SERVER-SCOPED ORDERS CONTROLLER (100% DATABASE CONNECTED - STRICTLY STATIC) ───
    let currentOrderStatusFilter = 'all'; // 'all' | 'paid' | 'pending' | 'failed'
    let currentOrderSearch = '';
    let currentOrdersPage = 1;
    let currentOrdersPageSize = 10;
    let orderSearchDebounceTimer = null;
    let cachedOrdersData = null;

    function formatOrderDateTime(d) {
      const dateObj = (d instanceof Date) ? d : new Date(d);
      if (isNaN(dateObj.getTime())) return { date: '10/20/2026', time: '10:42:15 PM' };
      const m = String(dateObj.getMonth() + 1).padStart(2, '0');
      const day = String(dateObj.getDate()).padStart(2, '0');
      const yr = dateObj.getFullYear();
      const dateStr = m + '/' + day + '/' + yr;
      let hours = dateObj.getHours();
      const minutes = String(dateObj.getMinutes()).padStart(2, '0');
      const seconds = String(dateObj.getSeconds()).padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12;
      const timeStr = hours + ':' + minutes + ':' + seconds + ' ' + ampm;
      return { date: dateStr, time: timeStr };
    }

    function copyOrderId(orderId, btn) {
      if (!orderId) return;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(orderId);
      } else {
        const input = document.createElement('input');
        input.value = orderId;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
      }
      showToast('Copied Order ID: ' + orderId);
      if (btn) {
        const origSvg = btn.innerHTML;
        btn.innerHTML = '<span style="color:#10b981; font-weight:800; font-size:12px;">✔</span>';
        setTimeout(() => { btn.innerHTML = origSvg; }, 1500);
      }
    }

    async function loadOrdersData(resetPage = false) {
      if (resetPage) currentOrdersPage = 1;
      const ordersTbody = document.getElementById('user-orders-table');
      if (!ordersTbody) return;
      if (!currentGuildId) {
        ordersTbody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: var(--muted); padding: 30px 0;">Please select a Discord server to view orders.</td></tr>';
        return;
      }

      // Update server name in heading
      const sNameEl = document.getElementById('orders-server-name');
      if (sNameEl) sNameEl.textContent = currentGuildName || 'This Server';

      try {
        const queryParams = new URLSearchParams({
          guildId: currentGuildId,
          status: currentOrderStatusFilter,
          search: currentOrderSearch,
          page: currentOrdersPage,
          limit: currentOrdersPageSize
        });

        const res = await fetch(\`/api/orders?\${queryParams.toString()}\`);
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          ordersTbody.innerHTML = \`<tr><td colspan="7" style="text-align: center; color: var(--red); padding: 30px 0;">\${errData.error || 'Failed to load orders.'} <button class="btn-orders-refresh" style="padding: 4px 10px; font-size: 11px; margin-left: 8px;" onclick="loadOrdersData()">Retry</button></td></tr>\`;
          return;
        }

        const data = await res.json();
        cachedOrdersData = data;
        renderOrdersTable(data.orders || []);
        updateOrdersCounts(data.counts || {});
        updateOrdersPagination(data.pagination || {});
      } catch (err) {
        console.error('Error fetching orders:', err);
        ordersTbody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: var(--red); padding: 30px 0;">Network error while fetching orders. <button class="btn-orders-refresh" style="padding: 4px 10px; font-size: 11px; margin-left: 8px;" onclick="loadOrdersData()">Retry</button></td></tr>';
      }
    }

    function renderOrdersTable(orders) {
      const ordersTbody = document.getElementById('user-orders-table');
      if (!ordersTbody) return;

      if (!orders || orders.length === 0) {
        ordersTbody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: var(--muted); padding: 40px 0; font-size: 13px;">No matching orders found in this category. Click <strong>All Orders</strong> above to view full history.</td></tr>';
        return;
      }

      ordersTbody.innerHTML = orders.map(o => {
        const isCoin = o.category === 'Coin Purchase';
        const iconHtml = isCoin
          ? '<div class="order-item-icon-box icon-box-coins"><img src="/assets/vyntrix-coin.png" style="width:24px;height:24px;object-fit:contain;" alt="Coin"></div>'
          : '<div class="order-item-icon-box icon-box-crown"><span style="font-size:20px;">👑</span></div>';

        const amountFormatted = '₹' + (o.displayAmountInr || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        const coinsFormatted = (o.coins || 0).toLocaleString();

        let statusBadgeClass = 'order-status-paid';
        let statusText = '● PAID';
        if (o.status === 'pending' || o.status === 'review') {
          statusBadgeClass = 'order-status-pending';
          statusText = '⏳ PENDING';
        } else if (o.status === 'expired' || o.status === 'rejected') {
          statusBadgeClass = 'order-status-failed';
          statusText = '✖ ' + (o.status || 'EXPIRED').toUpperCase();
        }

        const dt = formatOrderDateTime(o.createdAt);

        return \`
          <tr>
            <td>
              <div class="order-id-badge">
                <span>\${o.orderId}</span>
                <button class="order-copy-btn" onclick="copyOrderId('\${o.orderId}', this)" title="Copy Order ID">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                  </svg>
                </button>
              </div>
            </td>
            <td>
              <div class="order-item-cell">
                \${iconHtml}
                <div class="order-item-info">
                  <div class="order-item-title-row">
                    <span class="order-item-title">\${o.productName}</span>
                    <span class="order-category-tag">\${o.category || 'Role Purchase'}</span>
                  </div>
                  <div class="order-buyer-name">
                    <span>👤</span>
                    <span>\${o.username || 'Member'}</span>
                  </div>
                </div>
              </div>
            </td>
            <td>
              <span class="order-amount-inr">\${amountFormatted}</span>
            </td>
            <td>
              <div class="order-coins-wrap">
                <span>\${coinsFormatted}</span>
                <img src="/assets/vyntrix-coin.png" class="order-coin-img" alt="V">
              </div>
            </td>
            <td>
              <span class="order-status-badge \${statusBadgeClass}">\${statusText}</span>
            </td>
            <td>
              <div class="order-date-text">\${dt.date}</div>
              <div class="order-date-time">\${dt.time}</div>
            </td>
            <td>
              <div class="order-actions-wrap">
                <button class="btn-order-inspect" onclick="inspectOrderDetails('\${o.orderId}')">Inspect</button>
                <button class="btn-order-dots" onclick="inspectOrderDetails('\${o.orderId}')" title="Inspect Order Details">⋮</button>
              </div>
            </td>
          </tr>
        \`;
      }).join('');
    }

    function updateOrdersCounts(counts) {
      const cAll = document.getElementById('order-count-all');
      const cPaid = document.getElementById('order-count-paid');
      const cPending = document.getElementById('order-count-pending');
      const cFailed = document.getElementById('order-count-failed');
      if (cAll) cAll.textContent = \`(\${counts.all || 0})\`;
      if (cPaid) cPaid.textContent = \`(\${counts.paid || 0})\`;
      if (cPending) cPending.textContent = \`(\${counts.pending || 0})\`;
      if (cFailed) cFailed.textContent = \`(\${counts.failed || 0})\`;
    }

    function updateOrdersPagination(p) {
      const info = document.getElementById('orders-pagination-info');
      const total = p.total || 0;
      const page = p.page || 1;
      const limit = p.limit || 10;
      const totalPages = p.totalPages || 1;

      const from = total === 0 ? 0 : (page - 1) * limit + 1;
      const to = Math.min(page * limit, total);

      if (info) {
        info.textContent = \`Showing \${from} to \${to} of \${total} orders\`;
      }

      const prevBtn = document.getElementById('order-prev-btn');
      const nextBtn = document.getElementById('order-next-btn');
      if (prevBtn) prevBtn.disabled = page <= 1;
      if (nextBtn) nextBtn.disabled = page >= totalPages;

      const pageNumsContainer = document.getElementById('orders-page-numbers');
      if (pageNumsContainer) {
        let pagesHtml = '';
        const startP = Math.max(1, page - 2);
        const endP = Math.min(totalPages, startP + 4);
        for (let i = startP; i <= endP; i++) {
          pagesHtml += \`<button class="orders-page-btn \${i === page ? 'active' : ''}" onclick="goToOrdersPage(\${i})">\${i}</button>\`;
        }
        pageNumsContainer.innerHTML = pagesHtml || '<button class="orders-page-btn active">1</button>';
      }
    }

    function selectOrderStatusFilter(status) {
      currentOrderStatusFilter = status;
      document.querySelectorAll('#orders-tab .orders-filter-btn').forEach(el => el.classList.remove('active'));
      const activeBtn = document.getElementById('order-filter-' + status);
      if (activeBtn) activeBtn.classList.add('active');
      loadOrdersData(true);
    }

    function handleOrderSearchInput(val) {
      currentOrderSearch = (val || '').trim();
      const clearBtn = document.getElementById('order-search-clear');
      if (clearBtn) clearBtn.style.display = currentOrderSearch ? 'inline' : 'none';

      clearTimeout(orderSearchDebounceTimer);
      orderSearchDebounceTimer = setTimeout(() => {
        loadOrdersData(true);
      }, 250);
    }

    function clearOrderSearch() {
      const input = document.getElementById('order-user-search-input');
      if (input) input.value = '';
      currentOrderSearch = '';
      const clearBtn = document.getElementById('order-search-clear');
      if (clearBtn) clearBtn.style.display = 'none';
      loadOrdersData(true);
    }

    function refreshOrdersData() {
      loadOrdersData(false);
    }

    function changeOrdersPageSize(size) {
      currentOrdersPageSize = parseInt(size, 10) || 10;
      loadOrdersData(true);
    }

    function prevOrdersPage() {
      if (currentOrdersPage > 1) {
        currentOrdersPage--;
        loadOrdersData(false);
      }
    }

    function nextOrdersPage() {
      const totalPages = cachedOrdersData?.pagination?.totalPages || 1;
      if (currentOrdersPage < totalPages) {
        currentOrdersPage++;
        loadOrdersData(false);
      }
    }

    function goToOrdersPage(pg) {
      currentOrdersPage = pg;
      loadOrdersData(false);
    }

    function renderUserOrders() {
      loadOrdersData(false);
    }

    function renderUserLedger() {
      if (typeof loadTransactionsData === 'function') loadTransactionsData(false);
    }

    // ─── REAL SERVER-SCOPED TRANSACTION LEDGER (100% DATABASE CONNECTED) ───
    let currentTxType = 'all'; // 'all' | 'topup' | 'shop' | 'admin' | 'reward'
    let currentTxDateRange = 'current_month'; // 'current_month' | 'today' | '7d' | '30d' | 'all' | 'custom'
    let currentTxCustomStart = '';
    let currentTxCustomEnd = '';
    let currentTxDirection = 'all'; // 'all' | 'credit' | 'debit'
    let currentTxSearch = '';
    let currentTxPage = 1;
    let currentTxPageSize = 10;
    let currentTxSort = 'desc'; // 'desc' | 'asc'
    let txSearchDebounceTimer = null;
    let currentTxRecords = [];
    let currentTxSummary = null;
    let currentTxCounts = null;
    let currentTxPagination = null;
    let isTxLoading = false;

    function formatTxDateTime(d) {
      const dateObj = (d instanceof Date) ? d : new Date(d);
      if (isNaN(dateObj.getTime())) return { date: 'Oct 20, 2026', time: '10:42:15 PM' };
      const dateStr = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      let hours = dateObj.getHours();
      const minutes = String(dateObj.getMinutes()).padStart(2, '0');
      const seconds = String(dateObj.getSeconds()).padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12;
      const timeStr = hours + ':' + minutes + ':' + seconds + ' ' + ampm;
      return { date: dateStr, time: timeStr };
    }

    function copyTxReference(text, btn) {
      if (!text) return;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text);
      } else {
        const input = document.createElement('input');
        input.value = text;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
      }
      showToast('Copied: ' + text);
      if (btn) {
        const origHtml = btn.innerHTML;
        btn.innerHTML = '<span style="color:#10b981; font-weight:800; font-size:12px;">✔</span>';
        setTimeout(() => { btn.innerHTML = origHtml; }, 1500);
      }
    }

    function toggleTxSort() {
      currentTxSort = (currentTxSort === 'desc') ? 'asc' : 'desc';
      const arrow = document.getElementById('tx-sort-arrow');
      if (arrow) arrow.textContent = currentTxSort === 'desc' ? '▼' : '▲';
      loadTransactionsData(false);
    }

    function toggleTxDateDropdown(e) {
      if (e) e.stopPropagation();
      const drop = document.getElementById('tx-date-dropdown-menu');
      if (!drop) return;
      drop.style.display = drop.style.display === 'none' ? 'flex' : 'none';
    }

    function selectTxDateRange(val, label, e) {
      if (e) e.stopPropagation();
      currentTxDateRange = val;
      const txt = document.getElementById('tx-date-range-label');
      if (txt) txt.textContent = label;
      const drop = document.getElementById('tx-date-dropdown-menu');
      if (drop) {
        drop.style.display = 'none';
        drop.querySelectorAll('.tx-drop-item').forEach(el => el.classList.remove('active'));
        if (e && e.target) e.target.classList.add('active');
      }
      loadTransactionsData(true);
    }

    function applyTxCustomDateRange(e) {
      if (e) e.stopPropagation();
      const startInp = document.getElementById('tx-date-custom-start');
      const endInp = document.getElementById('tx-date-custom-end');
      if (!startInp || !endInp || !startInp.value || !endInp.value) {
        showToast('Please select both start and end dates');
        return;
      }
      currentTxDateRange = 'custom';
      currentTxCustomStart = startInp.value;
      currentTxCustomEnd = endInp.value;
      const txt = document.getElementById('tx-date-range-label');
      if (txt) txt.textContent = startInp.value + ' – ' + endInp.value;
      const drop = document.getElementById('tx-date-dropdown-menu');
      if (drop) drop.style.display = 'none';
      loadTransactionsData(true);
    }

    function selectTxFilterTab(type) {
      currentTxType = type;
      document.querySelectorAll('#transactions-tab .tx-tab-pill').forEach(el => el.classList.remove('active'));
      const activePill = document.getElementById('tx-tab-' + type);
      if (activePill) activePill.classList.add('active');
      loadTransactionsData(true);
    }

    function toggleTxFilterMenu(e) {
      if (e) e.stopPropagation();
      const drop = document.getElementById('tx-filter-dropdown');
      if (!drop) return;
      drop.style.display = drop.style.display === 'none' ? 'flex' : 'none';
    }

    function setTxDirectionFilter(dir, e) {
      if (e) e.stopPropagation();
      currentTxDirection = dir;
      const drop = document.getElementById('tx-filter-dropdown');
      if (drop) drop.style.display = 'none';
      loadTransactionsData(true);
    }

    function resetTxAllFilters(e) {
      if (e) e.stopPropagation();
      currentTxType = 'all';
      currentTxDateRange = 'current_month';
      currentTxDirection = 'all';
      currentTxSearch = '';
      currentTxPage = 1;
      const searchInp = document.getElementById('tx-search-input');
      if (searchInp) searchInp.value = '';
      const clearBtn = document.getElementById('tx-search-clear-btn');
      if (clearBtn) clearBtn.style.display = 'none';
      const rangeLabel = document.getElementById('tx-date-range-label');
      if (rangeLabel) rangeLabel.textContent = 'Oct 1, 2026 – Oct 31, 2026';
      document.querySelectorAll('#transactions-tab .tx-tab-pill').forEach(el => el.classList.remove('active'));
      const allPill = document.getElementById('tx-tab-all');
      if (allPill) allPill.classList.add('active');
      const drop = document.getElementById('tx-filter-dropdown');
      if (drop) drop.style.display = 'none';
      const dirRadio = document.getElementById('tx_dir_all');
      if (dirRadio) dirRadio.checked = true;
      loadTransactionsData(true);
    }

    function handleTxSearchInput(val) {
      const q = (val || '').trim();
      const clearBtn = document.getElementById('tx-search-clear-btn');
      if (clearBtn) clearBtn.style.display = q ? 'block' : 'none';

      clearTimeout(txSearchDebounceTimer);
      txSearchDebounceTimer = setTimeout(() => {
        currentTxSearch = q;
        loadTransactionsData(true);
      }, 250);
    }

    function clearTxSearch() {
      const inp = document.getElementById('tx-search-input');
      if (inp) inp.value = '';
      const clearBtn = document.getElementById('tx-search-clear-btn');
      if (clearBtn) clearBtn.style.display = 'none';
      currentTxSearch = '';
      loadTransactionsData(true);
    }

    function refreshTxData() {
      const btn = document.getElementById('tx-btn-refresh');
      if (btn) {
        btn.classList.add('loading');
        setTimeout(() => btn.classList.remove('loading'), 1000);
      }
      loadTransactionsData(false);
    }

    function changeTxPageSize(size) {
      currentTxPageSize = parseInt(size, 10) || 10;
      loadTransactionsData(true);
    }

    function goToTxPage(page) {
      currentTxPage = page;
      loadTransactionsData(false);
      const container = document.querySelector('.tx-main-card');
      if (container) container.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    function closeTxModal() {
      const modal = document.getElementById('tx-detail-modal');
      if (modal) modal.style.display = 'none';
    }

    async function inspectTransactionDetail(txId) {
      const modal = document.getElementById('tx-detail-modal');
      const body = document.getElementById('tx-modal-body');
      if (!modal || !body) return;

      body.innerHTML = \`
        <div style="text-align: center; padding: 30px; color: var(--muted);">
          <div style="display: inline-block; animation: spin 1s linear infinite; margin-bottom: 8px;">⏳</div>
          <div>Loading authorized transaction record...</div>
        </div>\`;
      modal.style.display = 'flex';

      try {
        const res = await fetch(\`/api/transactions/detail?id=\${encodeURIComponent(txId)}&guildId=\${encodeURIComponent(currentGuildId)}\`);
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || \`HTTP \${res.status}\`);
        }
        const data = await res.json();
        if (!data.success || !data.transaction) {
          throw new Error(data.error || 'Record not found in this guild');
        }

        const item = data.transaction;
        const esc = s => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
        const dt = formatTxDateTime(item.createdAt);
        const isPos = (item.coins || 0) >= 0;
        const refCode = item.reference || item.orderId || item.rrn || 'N/A';

        body.innerHTML = \`
          <div style="background: rgba(124, 58, 237, 0.08); border: 1px solid rgba(124, 58, 237, 0.25); border-radius: 14px; padding: 14px 18px; display: flex; align-items: center; justify-content: space-between;">
            <div>
              <div style="font-size: 11px; text-transform: uppercase; color: var(--muted); font-weight: 800; letter-spacing: 0.05em;">Reference / Order Identifier</div>
              <div style="font-family: monospace; font-size: 16px; font-weight: 800; color: #7c3aed; margin-top: 2px;">#\${esc(refCode)}</div>
            </div>
            <button class="btn-tx-secondary" style="padding: 6px 12px; font-size: 12px;" onclick="copyTxReference('\${esc(refCode)}', this)">
              📋 Copy Code
            </button>
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
            <div style="background: var(--subcard-bg, #f8fafc); border: 1px solid var(--border, #e2e8f0); border-radius: 12px; padding: 12px 14px;">
              <div style="font-size: 11px; color: var(--muted); text-transform: uppercase; font-weight: 700;">Timestamp</div>
              <div style="font-weight: 700; color: var(--text-heading, #0f172a); font-size: 13px; margin-top: 3px;">\${dt.date} &bull; \${dt.time}</div>
            </div>
            <div style="background: var(--subcard-bg, #f8fafc); border: 1px solid var(--border, #e2e8f0); border-radius: 12px; padding: 12px 14px;">
              <div style="font-size: 11px; color: var(--muted); text-transform: uppercase; font-weight: 700;">Discord Server Scope</div>
              <div style="font-weight: 700; color: #7c3aed; font-size: 13px; margin-top: 3px;">🏰 \${esc(data.guildName || currentGuildName)}</div>
            </div>
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
            <div style="background: var(--subcard-bg, #f8fafc); border: 1px solid var(--border, #e2e8f0); border-radius: 12px; padding: 12px 14px;">
              <div style="font-size: 11px; color: var(--muted); text-transform: uppercase; font-weight: 700;">Coin Change</div>
              <div style="font-family: 'Outfit', sans-serif; font-size: 18px; font-weight: 800; color: \${isPos ? '#16a34a' : '#ef4444'}; margin-top: 2px;">
                \${isPos ? '+' : ''}\${Number(item.coins || 0).toLocaleString()} VCoins
              </div>
            </div>
            <div style="background: var(--subcard-bg, #f8fafc); border: 1px solid var(--border, #e2e8f0); border-radius: 12px; padding: 12px 14px;">
              <div style="font-size: 11px; color: var(--muted); text-transform: uppercase; font-weight: 700;">Transaction Category</div>
              <div style="font-weight: 700; font-size: 13px; color: #7c3aed; margin-top: 3px; text-transform: uppercase;">
                \${esc(item.type || 'Standard Record')}
              </div>
            </div>
          </div>
          <div style="background: var(--subcard-bg, #f8fafc); border: 1px solid var(--border, #e2e8f0); border-radius: 12px; padding: 12px 14px;">
            <div style="font-size: 11px; color: var(--muted); text-transform: uppercase; font-weight: 700;">Member / User</div>
            <div style="font-weight: 700; color: var(--text-heading, #0f172a); font-size: 13px; margin-top: 3px;">
              \${esc(item.username || 'User')} <span style="color: var(--muted); font-size: 11px;">#\${esc(item.userTag || item.userId || '')}</span>
            </div>
          </div>
          <div style="background: var(--subcard-bg, #f8fafc); border: 1px solid var(--border, #e2e8f0); border-radius: 12px; padding: 12px 14px;">
            <div style="font-size: 11px; color: var(--muted); text-transform: uppercase; font-weight: 700;">Reason / Item Description</div>
            <div style="color: var(--text, #334155); font-size: 13px; margin-top: 3px; line-height: 1.5;">\${esc(item.reason || 'Verified immutable ledger consensus record')}</div>
          </div>
          \${item.linkedOrder ? \`
            <div style="background: rgba(16, 185, 129, 0.08); border: 1px solid rgba(16, 185, 129, 0.25); border-radius: 12px; padding: 12px 14px;">
              <div style="font-size: 11px; color: #059669; text-transform: uppercase; font-weight: 700;">Linked Shop Order</div>
              <div style="font-size: 13px; color: var(--text); margin-top: 3px;">Order #\${esc(item.linkedOrder.orderId)} &bull; \${esc(item.linkedOrder.productName || 'Shop Item')} &bull; Status: <strong>\${esc(item.linkedOrder.status)}</strong></div>
            </div>\` : ''}
          <div style="display: flex; justify-content: flex-end; margin-top: 6px;">
            <button class="btn-tx-primary" style="padding: 8px 22px; font-size: 13px;" onclick="closeTxModal()">Close Record</button>
          </div>\`;
      } catch (err) {
        body.innerHTML = \`
          <div style="text-align: center; padding: 30px; color: #ef4444;">
            <div style="font-weight: 700; margin-bottom: 6px;">Unable to Inspect Record</div>
            <div style="font-size: 13px; color: var(--muted); margin-bottom: 12px;">\${err.message || 'Transaction does not exist or belongs to another guild.'}</div>
            <button class="btn-tx-secondary" onclick="closeTxModal()">Dismiss</button>
          </div>\`;
      }
    }

    function exportTxExcel() {
      if (!currentGuildId) {
        showToast('Please select a server first');
        return;
      }

      // Show loading state on button
      const btn = document.getElementById('tx-btn-export');
      if (btn) {
        btn.disabled = true;
        btn.querySelector('span').textContent = 'Exporting...';
      }

      const params = new URLSearchParams({
        guildId: currentGuildId,
        type: currentTxType,
        dateRange: currentTxDateRange,
        direction: currentTxDirection,
        search: currentTxSearch
      });
      if (currentTxDateRange === 'custom') {
        if (currentTxCustomStart) params.set('startDate', currentTxCustomStart);
        if (currentTxCustomEnd) params.set('endDate', currentTxCustomEnd);
      }

      // Use fetch so we can handle errors and restore button state
      fetch(\`/api/transactions/export?\${params.toString()}\`)
        .then(async (resp) => {
          if (!resp.ok) {
            const err = await resp.json().catch(() => ({}));
            throw new Error(err.error || \`Export failed (HTTP \${resp.status})\`);
          }
          return resp.blob();
        })
        .then((blob) => {
          const dlUrl = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = dlUrl;
          const today = new Date().toISOString().slice(0, 10);
          a.download = \`Ventrix_Transactions_\${today}.xlsx\`;
          document.body.appendChild(a);
          a.click();
          setTimeout(() => { URL.revokeObjectURL(dlUrl); a.remove(); }, 2000);
          showToast('Excel file downloaded successfully!');
        })
        .catch((err) => {
          showToast(err.message || 'Export failed. Please try again.');
        })
        .finally(() => {
          if (btn) {
            btn.disabled = false;
            btn.querySelector('span').textContent = 'Export Excel';
          }
        });
    }

    async function loadTransactionsData(resetPage = false) {
      if (resetPage) currentTxPage = 1;
      const tbody = document.getElementById('tx-table-body');

      if (!currentGuildId) {
        if (tbody) {
          tbody.innerHTML = \`
            <tr>
              <td colspan="7" style="text-align: center; color: var(--muted); padding: 50px 20px;">
                <div style="font-size: 30px; margin-bottom: 8px;">🏰</div>
                <div style="font-weight: 700; font-size: 15px; color: var(--text-heading, #0f172a);">No Discord Server Selected</div>
                <div style="font-size: 13px; color: var(--muted); margin-top: 4px;">Please select an authorized Discord server from the header selector.</div>
              </td>
            </tr>\`;
        }
        updateTxSummaryCards({ totalCredits: 0, totalDebits: 0, creditCount: 0, debitCount: 0, totalTransactions: 0, netChange: 0 });
        updateTxTabCounts({ all: 0, topup: 0, shop: 0, admin: 0, reward: 0 });
        updateTxPagination({ page: 1, limit: currentTxPageSize, totalRecords: 0, totalPages: 1 });
        return;
      }

      if (tbody) {
        tbody.innerHTML = \`
          <tr>
            <td colspan="7" style="text-align: center; color: var(--muted); padding: 45px 0;">
              <div style="display: inline-flex; align-items: center; gap: 8px; font-weight: 600;">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="animation: spin 1s linear infinite;"><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/></svg>
                <span>Loading \${currentGuildName || 'server'} transactions...</span>
              </div>
            </td>
          </tr>\`;
      }

      isTxLoading = true;
      try {
        const params = new URLSearchParams({
          guildId: currentGuildId,
          type: currentTxType,
          dateRange: currentTxDateRange,
          direction: currentTxDirection,
          search: currentTxSearch,
          page: String(currentTxPage),
          limit: String(currentTxPageSize),
          sort: currentTxSort
        });
        if (currentTxDateRange === 'custom') {
          if (currentTxCustomStart) params.set('startDate', currentTxCustomStart);
          if (currentTxCustomEnd) params.set('endDate', currentTxCustomEnd);
        }

        const res = await fetch(\`/api/transactions?\${params.toString()}\`);
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || \`HTTP \${res.status}\`);
        }

        const data = await res.json();
        if (!data.success) throw new Error(data.error || 'Failed to load server records');

        currentTxRecords = data.transactions || [];
        currentTxSummary = data.summary || { totalCredits: 0, totalDebits: 0, creditCount: 0, debitCount: 0, totalTransactions: 0, netChange: 0 };
        currentTxCounts = data.counts || { all: 0, topup: 0, shop: 0, admin: 0, reward: 0 };
        currentTxPagination = data.pagination || { page: 1, limit: currentTxPageSize, totalRecords: 0, totalPages: 1 };

        updateTxSummaryCards(currentTxSummary);
        updateTxTabCounts(currentTxCounts);
        renderTxTableRows(currentTxRecords);
        updateTxPagination(currentTxPagination);
      } catch (err) {
        console.error('Error fetching transactions:', err);
        if (tbody) {
          tbody.innerHTML = \`
            <tr>
              <td colspan="7" style="text-align: center; color: #ef4444; padding: 40px 20px;">
                <div style="font-weight: 700; font-size: 14px; margin-bottom: 6px;">Error Loading Server Transactions</div>
                <div style="font-size: 12px; color: var(--muted); margin-bottom: 12px;">\${err.message || 'Server error or network failure.'}</div>
                <button class="btn-tx-secondary" onclick="loadTransactionsData()">Retry</button>
              </td>
            </tr>\`;
        }
      } finally {
        isTxLoading = false;
      }
    }

    function updateTxSummaryCards(summary) {
      const s = summary || { totalCredits: 0, totalDebits: 0, creditCount: 0, debitCount: 0, totalTransactions: 0, netChange: 0 };
      
      const creditsEl = document.getElementById('tx-stat-credits');
      const creditsSubEl = document.getElementById('tx-stat-credits-sub');
      if (creditsEl) creditsEl.textContent = '+' + Number(s.totalCredits || 0).toLocaleString();
      if (creditsSubEl) creditsSubEl.textContent = \`Across \${s.totalTransactions || s.creditCount || 0} transactions\`;

      const debitsEl = document.getElementById('tx-stat-debits');
      const debitsSubEl = document.getElementById('tx-stat-debits-sub');
      if (debitsEl) debitsEl.textContent = '-' + Math.abs(Number(s.totalDebits || 0)).toLocaleString();
      if (debitsSubEl) debitsSubEl.textContent = \`Across \${s.totalTransactions || s.debitCount || 0} transactions\`;

      const totalEl = document.getElementById('tx-stat-total');
      if (totalEl) totalEl.textContent = Number(s.totalTransactions || 0).toLocaleString();

      const netEl = document.getElementById('tx-stat-net');
      const net = Number(s.netChange || 0);
      if (netEl) {
        netEl.textContent = (net >= 0 ? '+' : '-') + Math.abs(net).toLocaleString();
        netEl.className = 'tx-stat-val ' + (net >= 0 ? 'text-green' : 'text-red');
      }
    }

    function updateTxTabCounts(counts) {
      const c = counts || { all: 0, topup: 0, shop: 0, admin: 0, reward: 0 };
      const setC = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.textContent = Number(val || 0).toLocaleString();
      };
      setC('tx-count-all', c.all);
      setC('tx-count-topup', c.topup);
      setC('tx-count-shop', c.shop);
      setC('tx-count-admin', c.admin);
      setC('tx-count-reward', c.reward);
    }

    function renderTxTableRows(records) {
      const tbody = document.getElementById('tx-table-body');
      if (!tbody) return;

      const esc = s => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

      if (!records || records.length === 0) {
        tbody.innerHTML = \`
          <tr>
            <td colspan="7" style="text-align: center; color: var(--muted); padding: 50px 20px;">
              <div style="font-size: 26px; margin-bottom: 6px;">📋</div>
              <div style="font-weight: 700; font-size: 14px; color: var(--text-heading, #0f172a);">No transactions found for this server.</div>
              <div style="font-size: 12px; color: var(--muted); margin-top: 4px;">
                \${(currentTxSearch || currentTxType !== 'all' || currentTxDirection !== 'all' || currentTxDateRange !== 'current_month') 
                  ? 'Try clearing active filters or selecting another date period.' 
                  : 'Ledger records will appear here as transactions occur in this guild.'}
              </div>
              \${(currentTxSearch || currentTxType !== 'all' || currentTxDirection !== 'all' || currentTxDateRange !== 'current_month')
                ? '<button class="btn-tx-secondary" style="margin-top: 12px;" onclick="resetTxAllFilters()">Reset Filters</button>'
                : ''}
            </td>
          </tr>\`;
        return;
      }

      tbody.innerHTML = records.map(tx => {
        const dt = formatTxDateTime(tx.createdAt);
        const isPos = (tx.coins || 0) >= 0;
        const coinSign = isPos ? '+' : '-';
        const coinAmt = Math.abs(tx.coins || 0).toLocaleString();
        const avatar = tx.avatar || (tx.username === 'vikassingh' ? CURRENT_USER_AVATAR : 'https://cdn.discordapp.com/embed/avatars/0.png');
        const username = tx.username || (tx.userId ? 'User_' + tx.userId.slice(-4) : 'Server Member');
        const userTag = tx.userTag || (tx.userId ? '#' + tx.userId.slice(-4) : '#0001');
        const refCode = tx.reference || tx.orderId || tx.rrn || '02C9F6';
        const cleanReason = tx.cleanReason || tx.reason || 'No description';
        const fullReason = tx.reason || cleanReason;

        let typeBadge = '';
        const lType = (tx.type || '').toLowerCase();
        if (lType === 'admin_grant' || lType === 'admin_credit') {
          typeBadge = '<span class="tx-badge badge-admin"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14"/></svg> ADMIN GRANT</span>';
        } else if (lType === 'shop_purchase' || lType === 'purchase') {
          typeBadge = '<span class="tx-badge badge-purchase"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg> SHOP PURCHASE</span>';
        } else if (lType === 'purchase_credit' || lType === 'topup' || lType === 'topup_credit') {
          typeBadge = '<span class="tx-badge badge-topup"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg> TOP-UP CREDIT</span>';
        } else if (lType === 'reward' || lType === 'reward_credit' || lType === 'dropbox_reward') {
          typeBadge = '<span class="tx-badge badge-reward"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></svg> REWARD CREDIT</span>';
        } else if (lType === 'admin_deduct') {
          typeBadge = '<span class="tx-badge badge-purchase"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><line x1="9" y1="12" x2="15" y2="12"/></svg> ADMIN DEDUCT</span>';
        } else if (lType === 'transfer') {
          typeBadge = (tx.coins < 0 || tx.direction === 'debit')
            ? '<span class="tx-badge badge-purchase"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg> TRANSFER SENT</span>'
            : '<span class="tx-badge badge-topup"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><line x1="17" y1="7" x2="7" y2="17"/><polyline points="17 17 7 17 7 7"/></svg> TRANSFER RECV</span>';
        } else if (lType === 'refund') {
          typeBadge = '<span class="tx-badge badge-admin">REFUND</span>';
        } else {
          typeBadge = '<span class="tx-badge badge-topup">' + esc((tx.type || 'LEDGER').toUpperCase()) + '</span>';
        }

        return \`
          <tr>
            <td>
              <div class="tx-date-cell">
                <span class="tx-date-primary">\${dt.date}</span>
                <span class="tx-date-secondary">\${dt.time}</span>
              </div>
            </td>
            <td>
              <div class="tx-member-cell">
                <img src="\${avatar}" class="tx-member-avatar" alt="Avatar" onerror="this.onerror=null;this.src='https://cdn.discordapp.com/embed/avatars/0.png'">
                <div class="tx-member-meta">
                  <span class="tx-member-name">\${esc(username)}</span>
                  <span class="tx-member-id">\${esc(userTag)}</span>
                </div>
              </div>
            </td>
            <td>
              <div class="tx-coins-cell \${isPos ? 'text-green' : 'text-red'}">
                <span>\${coinSign}\${coinAmt}</span>
                <img src="/assets/vyntrix-coin.png" class="tx-coin-icon" alt="V">
              </div>
            </td>
            <td>\${typeBadge}</td>
            <td>
              <div class="tx-reason-cell" title="\${esc(fullReason)}">\${esc(cleanReason)}</div>
            </td>
            <td>
              <div class="tx-ref-cell">
                <span class="tx-ref-badge">#\${esc(refCode)}</span>
                <button class="btn-copy-icon" onclick="copyTxReference('\${esc(refCode)}', this)" title="Copy reference ID">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                </button>
              </div>
            </td>
            <td style="text-align: center;">
              <button class="btn-tx-dots" onclick="inspectTransactionDetail('\${tx._id || refCode}')" title="View details">•••</button>
            </td>
          </tr>\`;
      }).join('');
    }

    function updateTxPagination(pagination) {
      const p = pagination || { page: 1, limit: currentTxPageSize, total: 0, totalRecords: 0, totalPages: 1 };
      const total = (p.total !== undefined ? p.total : p.totalRecords) || 0;
      const start = p.startIndex !== undefined ? p.startIndex : (total === 0 ? 0 : (p.page - 1) * (p.limit || currentTxPageSize) + 1);
      const end = p.endIndex !== undefined ? p.endIndex : Math.min(total, p.page * (p.limit || currentTxPageSize));

      const setVal = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
      setVal('tx-showing-start', start);
      setVal('tx-showing-end', end);
      setVal('tx-showing-total', total);

      const controls = document.getElementById('tx-pagination-controls');
      if (!controls) return;

      const totalPages = Math.max(1, p.totalPages || 1);
      const currentPage = p.page || 1;

      let html = '';
      html += \`<button class="tx-page-btn" \${currentPage <= 1 ? 'disabled' : ''} onclick="goToTxPage(\${currentPage - 1})" title="Previous Page">&lt;</button>\`;

      if (totalPages <= 7) {
        for (let i = 1; i <= totalPages; i++) {
          html += \`<button class="tx-page-btn \${i === currentPage ? 'active' : ''}" onclick="goToTxPage(\${i})">\${i}</button>\`;
        }
      } else {
        html += \`<button class="tx-page-btn \${currentPage === 1 ? 'active' : ''}" onclick="goToTxPage(1)">1</button>\`;
        if (currentPage > 3) html += \`<span class="tx-page-ellipsis">...</span>\`;

        const startP = Math.max(2, currentPage - 1);
        const endP = Math.min(totalPages - 1, currentPage + 1);
        for (let i = startP; i <= endP; i++) {
          html += \`<button class="tx-page-btn \${i === currentPage ? 'active' : ''}" onclick="goToTxPage(\${i})">\${i}</button>\`;
        }

        if (currentPage < totalPages - 2) html += \`<span class="tx-page-ellipsis">...</span>\`;
        html += \`<button class="tx-page-btn \${currentPage === totalPages ? 'active' : ''}" onclick="goToTxPage(\${totalPages})">\${totalPages}</button>\`;
      }

      html += \`<button class="tx-page-btn" \${currentPage >= totalPages ? 'disabled' : ''} onclick="goToTxPage(\${currentPage + 1})" title="Next Page">&gt;</button>\`;
      controls.innerHTML = html;
    }

    document.addEventListener('click', (e) => {
      const dateDrop = document.getElementById('tx-date-dropdown-menu');
      if (dateDrop && dateDrop.style.display !== 'none' && !e.target.closest('.tx-date-picker-wrap')) {
        dateDrop.style.display = 'none';
      }
      const filterDrop = document.getElementById('tx-filter-dropdown');
      if (filterDrop && filterDrop.style.display !== 'none' && !e.target.closest('.tx-filter-menu-wrap')) {
        filterDrop.style.display = 'none';
      }
    });

    // ─── RENDER WALLET PURCHASED ITEMS INVENTORY (/item list) ───
    function renderWalletInventory() {
      const tbody = document.getElementById('wallet-inventory-tbody');
      const badge = document.getElementById('wallet-inv-count-badge');
      if (!tbody) return;

      const src = (allUserInventory && allUserInventory.length > 0)
        ? allUserInventory.filter(it => !it.guildId || it.guildId === 'global' || it.guildId === currentGuildId)
        : [];

      if (badge) {
        badge.textContent = src.length + (src.length === 1 ? ' Item' : ' Items');
      }

      if (src.length === 0) {
        tbody.innerHTML = \`
          <tr>
            <td colspan="6" style="text-align: center; padding: 48px 20px;">
              <div style="width: 58px; height: 58px; border-radius: 16px; background: rgba(139, 92, 246, 0.12); border: 1px solid rgba(139, 92, 246, 0.25); display: flex; align-items: center; justify-content: center; font-size: 28px; margin: 0 auto 16px;">🎒</div>
              <div style="font-size: 16px; font-weight: 700; color: var(--text-heading); margin-bottom: 6px;">Your Inventory is Empty</div>
              <div style="font-size: 13px; color: var(--muted); max-width: 440px; margin: 0 auto 20px; line-height: 1.5;">You haven't purchased any items or roles in <strong>\${esc(currentGuildName)}</strong> yet. Browse the server shop to unlock exclusive perks!</div>
              <button class="wallet-btn-view-all" onclick="switchTab('shop-tab')" style="margin: 0 auto; padding: 9px 22px; font-size: 13.5px; background: linear-gradient(135deg, rgba(139, 92, 246, 0.35), rgba(59, 130, 246, 0.35)); color: #fff; border-color: rgba(139, 92, 246, 0.6);">
                <span>🛒 Browse Server Shop</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
              </button>
            </td>
          </tr>
        \`;
        return;
      }

      tbody.innerHTML = src.map(item => {
        // Thumbnail & Icon
        const hasImg = item.imageUrl && item.imageUrl.trim().length > 0;
        const iconSymbol = item.icon || (item.behaviorType && item.behaviorType.startsWith('role') ? '🎖️' : (item.behaviorType === 'manual_claim' ? '📋' : '👑'));
        const thumbHtml = hasImg
          ? \`<div class="inv-thumb-box"><img src="\${esc(item.imageUrl)}" class="inv-thumb-img" alt="\${esc(item.productName)}" onerror="this.parentElement.innerHTML='\${iconSymbol}'"></div>\`
          : \`<div class="inv-thumb-box">\${iconSymbol}</div>\`;

        // Role tag
        let roleHtml = '';
        if (item.roleName) {
          roleHtml = \`<div class="inv-role-badge">🎖️ @\${esc(item.roleName)}</div>\`;
        } else if (item.roleId) {
          roleHtml = \`<div class="inv-role-badge">🎖️ Role: \${esc(item.roleId.slice(0, 10))}...</div>\`;
        }

        // Type & duration
        const isTimed = item.itemType === 'TIMED' || item.behaviorType === 'role_temporary';
        const typePill = isTimed
          ? \`<span class="inv-type-pill inv-type-timed">⏱️ TIMED</span>\`
          : \`<span class="inv-type-pill inv-type-static">🌟 STATIC</span>\`;
        const durationText = item.duration ? \` • <strong>\${esc(item.duration)}</strong>\` : (isTimed ? ' • <strong>Duration set</strong>' : ' • <strong>Permanent</strong>');

        // Purchased Date
        const pd = new Date(item.purchasedAt || item.createdAt);
        const pDateStr = isNaN(pd.getTime()) ? '--' : pd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        const pTimeStr = isNaN(pd.getTime()) ? '' : pd.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

        // Status badge
        let statusBadge = '';
        const st = (item.status || 'available').toLowerCase();
        if (st === 'available') {
          statusBadge = '<span class="inv-status-badge inv-status-available">🟢 Available</span>';
        } else if (st === 'active') {
          statusBadge = '<span class="inv-status-badge inv-status-active">⚡ Active</span>';
        } else if (st === 'claim_required') {
          statusBadge = '<span class="inv-status-badge inv-status-claim">📋 Claim Required</span>';
        } else if (st === 'consumed') {
          statusBadge = '<span class="inv-status-badge inv-status-consumed">⚪ Consumed</span>';
        } else if (st === 'expired') {
          statusBadge = '<span class="inv-status-badge inv-status-expired">❌ Expired</span>';
        } else {
          statusBadge = \`<span class="inv-status-badge inv-status-available">🟢 \${esc(st)}</span>\`;
        }

        // Expiration column
        let expHtml = '';
        if (st === 'active' && item.expiresAt) {
          const expD = new Date(item.expiresAt);
          const diffMs = expD.getTime() - Date.now();
          if (diffMs > 0) {
            const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
            const diffDays = Math.floor(diffHours / 24);
            const remainingStr = diffDays > 0 ? \`\${diffDays}d \${diffHours % 24}h remaining\` : \`\${diffHours}h remaining\`;
            expHtml = \`
              <div style="font-weight: 700; color: #38bdf8; font-size: 13px;">\${remainingStr}</div>
              <div style="font-size: 11px; color: var(--muted); margin-top: 2px;">Until \${expD.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
            \`;
          } else {
            expHtml = '<span style="color: #ef4444; font-size: 12px; font-weight: 600;">Ended</span>';
          }
        } else if (!isTimed) {
          expHtml = '<span style="color: #10b981; font-size: 12.5px; font-weight: 600;">Permanent (Never)</span>';
        } else if (st === 'available') {
          expHtml = \`<span style="color: var(--muted); font-size: 12px;">Starts on activation (\${esc(item.duration || 'Timed')})</span>\`;
        } else if (st === 'expired') {
          const expD = item.expiresAt ? new Date(item.expiresAt) : null;
          const expStr = expD && !isNaN(expD.getTime()) ? expD.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Expired';
          expHtml = \`<span style="color: #ef4444; font-size: 12px; font-weight: 600;">Ended on \${expStr}</span>\`;
        } else {
          expHtml = '<span style="color: var(--muted); font-size: 12px;">--</span>';
        }

        // Action column
        let actionBtn = '';
        if (st === 'available') {
          actionBtn = \`
            <button class="btn-inv-use" onclick="useInventoryItem('\${esc(item.inventoryId)}', this)" title="Activate item benefits in Discord">
              <span>⚡ Use Item</span>
            </button>
          \`;
        } else if (st === 'claim_required') {
          actionBtn = \`
            <button class="btn-inv-claim" onclick="showClaimInfoModal('\${esc(item.inventoryId)}', '\${esc(item.productName)}')" title="View or submit fulfillment claim">
              <span>📋 Claim</span>
            </button>
          \`;
        } else if (st === 'active') {
          actionBtn = '<span class="inv-disabled-badge" style="color: #38bdf8; border-color: rgba(56, 189, 248, 0.35); font-weight: 700;">⚡ Active Role</span>';
        } else if (st === 'consumed') {
          actionBtn = '<span class="inv-disabled-badge">⚪ Used</span>';
        } else if (st === 'expired') {
          actionBtn = '<span class="inv-disabled-badge" style="color: #ef4444; border-color: rgba(239, 68, 68, 0.3);">❌ Expired</span>';
        } else {
          actionBtn = '<span class="inv-disabled-badge">--</span>';
        }

        const invRef = item.inventoryId || '';

        return \`
          <tr>
            <td>
              <div class="inv-item-cell">
                \${thumbHtml}
                <div class="inv-item-info">
                  <div class="inv-item-title" title="\${esc(item.productName)}">\${esc(item.productName)}</div>
                  \${roleHtml}
                  <div class="inv-id-code">
                    <span>ID: \${esc(invRef)}</span>
                    <button class="wallet-copy-btn" style="padding: 2px 4px; border-radius: 4px;" onclick="copyWalletRef('\${esc(invRef)}')" title="Copy Inventory ID">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                    </button>
                  </div>
                </div>
              </div>
            </td>
            <td>
              <div>\${typePill}\${durationText}</div>
              <div style="font-size: 11px; color: var(--muted); margin-top: 3px;">Qty: <strong>\${item.quantity || 1}</strong></div>
            </td>
            <td>
              <div style="font-weight: 600; color: var(--text-heading); font-size: 13px;">\${esc(pDateStr)}</div>
              <div style="font-size: 11px; color: var(--muted); margin-top: 2px;">\${esc(pTimeStr)}</div>
            </td>
            <td>\${statusBadge}</td>
            <td>\${expHtml}</td>
            <td style="text-align: center;">\${actionBtn}</td>
          </tr>
        \`;
      }).join('');
    }

    async function useInventoryItem(inventoryId, btn) {
      if (!inventoryId || !currentGuildId) {
        showToast('Please select a valid server first', true);
        return;
      }

      const origHtml = btn ? btn.innerHTML : '';
      if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<span style="display:inline-block; animation:spin 1s linear infinite;">⏳</span> Activating...';
      }

      try {
        const res = await fetch('/api/inventory/use', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ inventoryId, guildId: currentGuildId })
        });
        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          showToast(data.error || 'Failed to use item.', true);
          if (btn) {
            btn.disabled = false;
            btn.innerHTML = origHtml;
          }
          return;
        }

        showToast(data.message || 'Item successfully activated!');
        // Refresh inventory and user data immediately
        await refreshInventory();
        loadUserData();

      } catch (err) {
        console.error('useInventoryItem error:', err);
        showToast(err.message || 'Network error while using item.', true);
        if (btn) {
          btn.disabled = false;
          btn.innerHTML = origHtml;
        }
      }
    }

    async function refreshInventory() {
      if (!currentGuildId) return;
      try {
        const res = await fetch(\`/api/inventory?guildId=\${currentGuildId}\`);
        if (res.ok) {
          const data = await res.json();
          allUserInventory = data.inventory || [];
          renderWalletInventory();
        }
      } catch (e) {
        console.error('refreshInventory error:', e);
      }
    }

    function showClaimInfoModal(inventoryId, productName) {
      if (!confirm('Do you want to submit a fulfillment claim for "' + productName + '" in this server?')) {
        return;
      }
      useInventoryItem(inventoryId, null);
    }

    // ─── RENDER WALLET RECENT TRANSACTIONS (Matches Reference Image Pixel-for-Pixel) ───
    function renderWalletMiniLedger() {
      const tbody = document.getElementById('wallet-recent-transactions-tbody') || document.getElementById('wallet-mini-ledger');
      if (!tbody) return;

      const src = (allUserLedger && allUserLedger.length > 0) ? allUserLedger : [];
      const mini = src.slice(0, 5);

      if (mini.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: var(--muted); padding: 36px 14px;">No transactions recorded for this wallet yet.</td></tr>';
        return;
      }

      // Calculate actual running balances backwards from current balance
      let runningBal = currentWalletBalance || 0;
      const balances = [];
      for (let i = 0; i < mini.length; i++) {
        balances.push(Math.max(0, runningBal));
        runningBal -= (mini[i].coins || 0);
      }

      tbody.innerHTML = mini.map((l, idx) => {
        const d = new Date(l.createdAt);
        const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        const timeStr = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

        const isCredit = (l.coins > 0) || l.type === 'purchase_credit' || l.type === 'admin_grant' || l.type === 'DROPBOX_REWARD' || (l.type === 'transfer' && l.coins > 0);
        let typeBadge = isCredit
          ? '<span class="wallet-badge-credit">Credit</span>'
          : '<span class="wallet-badge-purchase">Purchase</span>';
        if (l.type === 'transfer') {
          typeBadge = isCredit
            ? '<span class="wallet-badge-credit">Transfer In</span>'
            : '<span class="wallet-badge-purchase">Transfer Out</span>';
        }

        const desc = formatWalletTxDescription(l);
        const amtStr = isCredit
          ? \`+\${Math.abs(l.coins || 0).toLocaleString()}\`
          : \`-\${Math.abs(l.coins || 0).toLocaleString()}\`;
        const amtColor = isCredit ? '#10b981' : '#ef4444';

        const rowBal = balances[idx] !== undefined ? balances[idx].toLocaleString() : '--';
        const ref = l.orderId || l.rrn || l._id || '';

        return \`
          <tr>
            <td>
              <div style="font-weight: 600; color: var(--text-heading); font-size: 13px;">\${esc(dateStr)}</div>
              <div style="font-size: 11px; color: var(--muted); margin-top: 2px;">\${esc(timeStr)}</div>
            </td>
            <td>\${typeBadge}</td>
            <td style="font-weight: 500; color: var(--text); font-size: 13.5px; max-width: 280px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="\${esc(desc)}">
              \${esc(desc)}
            </td>
            <td>
              <span style="font-weight: 700; color: \${amtColor}; display: inline-flex; align-items: center; gap: 5px;">
                \${amtStr} \${COIN_ICON_HTML}
              </span>
            </td>
            <td>
              <span style="font-weight: 600; color: var(--text); font-size: 13px;">\${rowBal}</span>
            </td>
            <td style="text-align: center;">
              \${ref ? \`
                <button class="wallet-copy-btn" onclick="copyWalletRef('\${esc(ref)}')" title="Copy Reference: \${esc(ref)}">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                  </svg>
                </button>
              \` : '-'}
            </td>
          </tr>
        \`;
      }).join('');
    }

    function formatWalletTxDescription(l) {
      if (!l) return 'Wallet Transaction';
      let reason = (l.reason || '').trim();
      // Remove any trailing MongoDB ObjectIds or technical metadata like (6ad8d0404f8ed5a22f182dc4)
      reason = reason.replace(/\s*\([a-f0-9]{24}\)/gi, '').trim();

      if (l.type === 'purchase_credit') {
        return reason || 'UPI payment verified';
      }
      if (l.type === 'shop_purchase') {
        if (/^purchased item:\s*/i.test(reason)) {
          return 'Purchased: ' + reason.replace(/^purchased item:\s*/i, '').trim();
        }
        if (/^purchased:\s*/i.test(reason)) {
          return 'Purchased: ' + reason.replace(/^purchased:\s*/i, '').trim();
        }
        return reason ? 'Purchased: ' + reason : 'Purchased item from shop';
      }
      if (l.type === 'admin_grant') {
        return reason || 'Manual credit by admin';
      }
      if (l.type === 'admin_deduct') {
        return reason || 'Manual debit by admin';
      }
      if (l.type === 'DROPBOX_REWARD') {
        return 'Dropbox event reward';
      }
      if (l.type === 'transfer') {
        return reason || (l.coins < 0 ? 'Transferred coins' : 'Received coins');
      }
      return reason || 'Wallet transaction';
    }

    function copyWalletRef(ref) {
      if (!ref || ref === '-') return;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(ref).then(() => {
          showToast('Reference copied: ' + ref);
        }).catch(() => {
          fallbackCopyText(ref);
        });
      } else {
        fallbackCopyText(ref);
      }
    }
    function fallbackCopyText(text) {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      showToast('Reference copied: ' + text);
    }

    // ─── RENDER DASHBOARD FEATURED (RECENTLY ADDED PRODUCTS) ───
    async function renderDashboardFeatured() {
      const container = document.getElementById('dash-featured-products');
      if (!container) return;

      if (!currentGuildId) {
        container.innerHTML = \`
          <div style="grid-column: 1 / -1; text-align: center; padding: 32px 16px; color: var(--muted);">
            <div style="font-size: 32px; margin-bottom: 8px;">🏰</div>
            <div style="font-size: 13px; font-weight: 600;">Please select a server to view recently added items.</div>
          </div>
        \`;
        return;
      }

      try {
        const res = await fetch(\`/api/shop?guildId=\${encodeURIComponent(currentGuildId)}&sort=newest&limit=4\`);
        const data = await res.json();
        const recentProducts = (data && data.products) ? data.products : [];

        if (recentProducts.length === 0) {
          container.innerHTML = \`
            <div style="grid-column: 1 / -1; text-align: center; padding: 36px 16px; color: var(--muted); background: rgba(255, 255, 255, 0.02); border-radius: 16px; border: 1px dashed var(--border);">
              <div style="font-size: 36px; margin-bottom: 8px;">🛍️</div>
              <div style="font-weight: 700; font-size: 14px; color: var(--text-heading); margin-bottom: 4px;">No shop items added yet</div>
              <div style="font-size: 12px; color: var(--muted);">Recently added shop items for this server will appear here.</div>
            </div>
          \`;
          return;
        }

        const iconBgColors = ['gold-circle', 'purple-circle', 'key-circle', 'cyan-circle'];

        container.innerHTML = recentProducts.map((p, idx) => {
          const isOutOfStock = p.stock !== null && p.stock !== undefined && p.stock <= 0;
          const bgCircle = iconBgColors[idx % iconBgColors.length];
          const escapedName = (p.name || 'Item').replace(/'/g, "\\\\'");
          const priceFormatted = (p.coins || 0).toLocaleString();

          const iconHtml = p.imageUrl
            ? \`<img src="\${esc(p.imageUrl)}" alt="\${esc(p.name)}" style="width: 48px; height: 48px; border-radius: 14px; object-fit: cover; margin: 8px 0 10px;">\`
            : \`<div class="item-icon-circle \${bgCircle}">\${esc(p.icon || '🛍️')}</div>\`;

          const tagBadgeHtml = isOutOfStock
            ? '<span class="item-tag-popular" style="background: #ef4444;">OUT OF STOCK</span>'
            : '<span class="item-tag-popular" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%);">NEW</span>';

          return \`
            <div class="featured-item-card" onclick="inspectProductDetails('\${p._id}')" title="Click to view details for \${esc(p.name)}">
              \${tagBadgeHtml}
              \${iconHtml}
              <div class="item-title" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%; width: 100%; text-align: center;" title="\${esc(p.name)}">\${esc(p.name)}</div>
              <div class="item-price">
                <img src="/assets/vyntrix-coin.png" class="mini-coin-badge" alt="coin">
                <span>\${priceFormatted} VCoins</span>
              </div>
              \${isOutOfStock ? \`
                <button type="button" class="btn-item-purchase disabled" disabled style="opacity: 0.55; cursor: not-allowed; background: var(--border); box-shadow: none;">
                  Out of Stock
                </button>
              \` : \`
                <button type="button" class="btn-item-purchase" onclick="event.stopPropagation(); buyItem('\${p._id}', '\${escapedName}', \${p.coins})">
                  \${CLIENT_ICONS.cart} Purchase
                </button>
              \`}
            </div>
          \`;
        }).join('');
      } catch (err) {
        console.error('renderDashboardFeatured error:', err);
        container.innerHTML = \`
          <div style="grid-column: 1 / -1; text-align: center; padding: 24px 16px; color: var(--muted);">
            <div style="font-size: 13px;">Unable to load recently added items.</div>
          </div>
        \`;
      }
    }

    // ─── SHOP LOADER & RENDERING (ADVANCED SAAS ARCHITECTURE) ───
    let currentShopCategory = 'all';
    let currentShopType = 'all';
    let currentShopStatus = 'all';
    let currentShopPrice = 'all';
    let currentShopSort = 'newest';
    let currentShopSearch = '';
    let currentShopPage = 1;
    let currentShopLimit = 8;
    let currentShopView = 'grid';
    let currentShopTotal = 0;
    let currentShopTotalPages = 1;
    let currentShopUserBalance = 0;
    let shopSearchDebounceTimer = null;

    async function loadShop(page = 1) {
      if (!currentGuildId) return;
      currentShopPage = page;
      try {
        const queryParams = new URLSearchParams({
          guildId: currentGuildId,
          category: currentShopCategory,
          type: currentShopType,
          status: currentShopStatus,
          priceRange: currentShopPrice,
          sort: currentShopSort,
          search: currentShopSearch,
          page: String(currentShopPage),
          limit: String(currentShopLimit)
        });

        const res = await fetch(\`/api/shop?\${queryParams.toString()}\`);
        const data = await res.json();
        allShopProducts = data.products || [];
        currentShopTotal = data.total || 0;
        currentShopTotalPages = data.totalPages || 1;
        currentShopUserBalance = data.userBalance || 0;

        // Update dashboard count
        const dashItemsCount = document.getElementById('dash-items-count');
        if (dashItemsCount) dashItemsCount.textContent = data.categoryCounts?.all || allShopProducts.length;

        // Update category tab count badges dynamically
        if (data.categoryCounts) {
          const cAll = document.getElementById('count-all');
          const cRoles = document.getElementById('count-roles');
          const cConsumables = document.getElementById('count-consumables');
          const cClaims = document.getElementById('count-claims');
          if (cAll) cAll.textContent = \`(\${data.categoryCounts.all || 0})\`;
          if (cRoles) cRoles.textContent = \`(\${data.categoryCounts.roles || 0})\`;
          if (cConsumables) cConsumables.textContent = \`(\${data.categoryCounts.consumables || 0})\`;
          if (cClaims) cClaims.textContent = \`(\${data.categoryCounts.claims || 0})\`;
        }

        // Update server name in header
        const srvName = document.getElementById('shop-server-name');
        if (srvName) srvName.textContent = currentGuildName || data.guildName || 'This Server';

        renderShopProducts();
        renderDashboardFeatured();
      } catch (e) {
        console.error('loadShop error:', e);
      }
    }

    function renderShopProducts() {
      const gridContainer = document.getElementById('shop-view-grid-container');
      const listTbody = document.getElementById('shop-list-tbody');
      const paginationInfo = document.getElementById('shop-pagination-info');
      const paginationControls = document.getElementById('shop-pagination-controls');

      if (!gridContainer) return;

      // Update Pagination info
      const from = currentShopTotal === 0 ? 0 : (currentShopPage - 1) * currentShopLimit + 1;
      const to = Math.min(currentShopPage * currentShopLimit, currentShopTotal);
      if (paginationInfo) {
        paginationInfo.textContent = \`Showing \${from}-\${to} of \${currentShopTotal} items\`;
      }

      // Update Pagination controls
      if (paginationControls) {
        let btnsHtml = '';
        btnsHtml += \`<button class="shop-page-btn" \${currentShopPage <= 1 ? 'disabled' : ''} onclick="loadShop(\${currentShopPage - 1})">&larr; Previous</button>\`;
        
        const startP = Math.max(1, currentShopPage - 2);
        const endP = Math.min(currentShopTotalPages, startP + 4);
        for (let i = startP; i <= endP; i++) {
          btnsHtml += \`<button class="shop-page-btn \${i === currentShopPage ? 'active' : ''}" onclick="loadShop(\${i})">\${i}</button>\`;
        }
        
        btnsHtml += \`<button class="shop-page-btn" \${currentShopPage >= currentShopTotalPages ? 'disabled' : ''} onclick="loadShop(\${currentShopPage + 1})">Next &rarr;</button>\`;
        paginationControls.innerHTML = btnsHtml;
      }

      if (allShopProducts.length === 0) {
        const emptyHtml = \`
          <div style="grid-column: 1 / -1; text-align: center; padding: 48px 20px; background: rgba(0,0,0,0.02); border-radius: 16px; border: 1px dashed var(--border);">
            <div style="font-size: 38px; margin-bottom: 10px;">🛍️</div>
            <h4 style="font-size: 16px; font-weight: 700; color: var(--text-heading); margin-bottom: 4px;">No products match your criteria</h4>
            <p style="font-size: 13px; color: var(--muted); margin: 0;">Try adjusting your search query, category tabs, or filters.</p>
          </div>
        \`;
        gridContainer.innerHTML = emptyHtml;
        if (listTbody) {
          listTbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: var(--muted); padding: 36px;">No products match your criteria.</td></tr>';
        }
        return;
      }

      // Render Grid Cards
      gridContainer.innerHTML = allShopProducts.map(p => {
        const isRole = p.behaviorType === 'role_permanent' || p.behaviorType === 'role_timed' || p.behaviorType === 'role_temporary' || p.roleId;
        const isConsumable = p.behaviorType === 'consumable';
        const isClaim = p.behaviorType === 'manual_claim';

        let categoryBadgeClass = 'badge-role';
        let categoryLabel = 'Discord Role';
        if (isConsumable) {
          categoryBadgeClass = 'badge-consumable';
          categoryLabel = 'Consumable';
        } else if (isClaim) {
          categoryBadgeClass = 'badge-claim';
          categoryLabel = 'Manual Claim';
        }

        const isOutOfStock = p.stock !== null && p.stock !== undefined && p.stock <= 0;
        let stockPillHtml = '';
        if (p.stock === null || p.stock === undefined) {
          stockPillHtml = '<span class="shop-stock-badge stock-tag-unlimited">&bull; UNLIMITED</span>';
        } else if (p.stock > 0) {
          stockPillHtml = \`<span class="shop-stock-badge stock-tag-in">&bull; \${p.stock} IN STOCK</span>\`;
        } else {
          stockPillHtml = '<span class="shop-stock-badge stock-tag-out">&bull; 0 IN STOCK</span>';
        }

        const iconHtml = p.imageUrl
          ? \`<img class="shop-card-img" src="\${p.imageUrl}" alt="\${esc(p.name)}">\`
          : \`<div class="shop-card-emoji">\${p.icon || '👑'}</div>\`;

        const escapedName = (p.name || 'Item').replace(/'/g, "\\\\'");
        const priceFormatted = (p.coins || 0).toLocaleString();

        return \`
          <div class="shop-card" onclick="inspectProductDetails('\${p._id}')" style="cursor: pointer;" title="Click to view details for \${esc(p.name)}">
            \${stockPillHtml}
            <div class="shop-card-icon-area">
              \${iconHtml}
            </div>
            <div class="shop-badges-row">
              <span class="shop-badge \${categoryBadgeClass}">\${categoryLabel}</span>
              <span class="shop-badge badge-server">Server Item</span>
            </div>
            <h3 class="shop-card-title">\${esc(p.name)}</h3>
            <p class="shop-card-desc">\${esc(p.description || 'Get exclusive access and perks in this server.')}</p>
            <div class="shop-card-price-row">
              <span class="shop-card-price-val">\${priceFormatted}</span>
              <img src="/assets/vyntrix-coin.png" class="shop-coin-icon" alt="V Coin">
            </div>
            <div class="shop-card-actions" onclick="event.stopPropagation()">
              <button type="button" class="btn-card-details" onclick="event.stopPropagation(); inspectProductDetails('\${p._id}')" title="View complete details">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                <span>Details</span>
              </button>
              \${isOutOfStock ? \`
                <button type="button" class="btn-card-buy disabled" disabled>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
                  <span>Out of Stock</span>
                </button>
              \` : \`
                <button type="button" class="btn-card-buy" onclick="event.stopPropagation(); buyItem('\${p._id}', '\${escapedName}', \${p.coins})">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
                  <span>Buy Item</span>
                </button>
              \`}
            </div>
          </div>
        \`;
      }).join('');

      // Render List View Rows
      if (listTbody) {
        listTbody.innerHTML = allShopProducts.map(p => {
          const isRole = p.behaviorType === 'role_permanent' || p.behaviorType === 'role_timed' || p.behaviorType === 'role_temporary' || p.roleId;
          const isConsumable = p.behaviorType === 'consumable';
          const isClaim = p.behaviorType === 'manual_claim';

          let categoryBadgeClass = 'badge-role';
          let categoryLabel = 'Discord Role';
          if (isConsumable) {
            categoryBadgeClass = 'badge-consumable';
            categoryLabel = 'Consumable';
          } else if (isClaim) {
            categoryBadgeClass = 'badge-claim';
            categoryLabel = 'Manual Claim';
          }

          const isOutOfStock = p.stock !== null && p.stock !== undefined && p.stock <= 0;
          let stockText = 'Unlimited';
          if (p.stock !== null && p.stock !== undefined) {
            stockText = p.stock > 0 ? \`\${p.stock} in stock\` : 'Out of stock';
          }

          const typeText = p.duration ? \`Timed (\${p.duration})\` : (p.type || 'Permanent');
          const escapedName = (p.name || 'Item').replace(/'/g, "\\\\'");

          return \`
            <tr onclick="inspectProductDetails('\${p._id}')" style="cursor: pointer;">
              <td>
                <div style="display: flex; align-items: center; gap: 12px;">
                  <span style="font-size: 26px;">\${p.icon || '👑'}</span>
                  <div>
                    <div style="font-weight: 700; color: var(--text-heading); font-size: 14px;">\${esc(p.name)}</div>
                    <div style="font-size: 12px; color: var(--muted); max-width: 280px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">\${esc(p.description || '')}</div>
                  </div>
                </div>
              </td>
              <td><span class="shop-badge \${categoryBadgeClass}">\${categoryLabel}</span></td>
              <td><span style="font-weight: 600; color: var(--text-heading); font-size: 12px;">\${typeText}</span></td>
              <td>
                <span class="shop-stock-badge \${p.stock === null ? 'stock-tag-unlimited' : (p.stock > 0 ? 'stock-tag-in' : 'stock-tag-out')}">
                  &bull; \${stockText}
                </span>
              </td>
              <td>
                <strong style="color: #d97706; display: inline-flex; align-items: center; gap: 4px; font-size: 14px;">
                  \${(p.coins || 0).toLocaleString()} <img src="/assets/vyntrix-coin.png" class="shop-coin-icon" alt="V Coin">
                </strong>
              </td>
              <td style="text-align: right;" onclick="event.stopPropagation()">
                <div style="display: inline-flex; gap: 6px; align-items: center; justify-content: flex-end;">
                  <button type="button" class="btn-card-details" onclick="event.stopPropagation(); inspectProductDetails('\${p._id}')" style="padding: 6px 10px; font-size: 12px;">Details</button>
                  \${isOutOfStock ? \`
                    <button type="button" class="btn-card-buy disabled" disabled style="padding: 6px 12px; font-size: 12px;">Out of Stock</button>
                  \` : \`
                    <button type="button" class="btn-card-buy" onclick="event.stopPropagation(); buyItem('\${p._id}', '\${escapedName}', \${p.coins})" style="padding: 6px 14px; font-size: 12px;">Buy</button>
                  \`}
                </div>
              </td>
            </tr>
          \`;
        }).join('');
      }
    }

    function filterShopCategory(category) {
      currentShopCategory = category;
      document.querySelectorAll('#shop-tab .shop-tab-pill').forEach(el => el.classList.remove('active'));
      const activePill = document.getElementById('tab-cat-' + category);
      if (activePill) activePill.classList.add('active');
      loadShop(1);
    }

    function handleShopFilterChange() {
      const typeSelect = document.getElementById('shop-filter-type');
      const statusSelect = document.getElementById('shop-filter-status');
      const priceSelect = document.getElementById('shop-filter-price');
      const sortSelect = document.getElementById('shop-sort');

      if (typeSelect) currentShopType = typeSelect.value;
      if (statusSelect) currentShopStatus = statusSelect.value;
      if (priceSelect) currentShopPrice = priceSelect.value;
      if (sortSelect) currentShopSort = sortSelect.value;

      loadShop(1);
    }

    function handleShopSearch(val) {
      currentShopSearch = (val || '').trim();
      clearTimeout(shopSearchDebounceTimer);
      shopSearchDebounceTimer = setTimeout(() => {
        loadShop(1);
      }, 250);
    }

    function setShopView(view) {
      currentShopView = view;
      const gridCont = document.getElementById('shop-view-grid-container');
      const listCont = document.getElementById('shop-view-list-container');
      const gridBtn = document.getElementById('view-btn-grid');
      const listBtn = document.getElementById('view-btn-list');

      if (view === 'grid') {
        if (gridCont) gridCont.style.display = 'grid';
        if (listCont) listCont.style.display = 'none';
        if (gridBtn) gridBtn.classList.add('active');
        if (listBtn) listBtn.classList.remove('active');
      } else {
        if (gridCont) gridCont.style.display = 'none';
        if (listCont) listCont.style.display = 'block';
        if (gridBtn) gridBtn.classList.remove('active');
        if (listBtn) listBtn.classList.add('active');
      }
    }

    // ─── INSPECT PRODUCT DETAILS MODAL ───
    function inspectProductDetails(productId) {
      const p = (allShopProducts && allShopProducts.find(item => item._id === productId)) ||
                (typeof cachedAdminProducts !== 'undefined' && cachedAdminProducts && cachedAdminProducts.find(item => item._id === productId));
      if (!p) {
        showToast('Item details not found', true);
        return;
      }

      const body = document.getElementById('product-details-body');
      if (!body) return;

      let behaviorLabel = 'Manual Claim';
      let behaviorColor = '#3b82f6';
      let behaviorIcon = '🎫';
      if (p.behaviorType === 'role_permanent') {
        behaviorLabel = 'Discord Role (Permanent)';
        behaviorColor = '#a78bfa';
        behaviorIcon = '🎭';
      } else if (p.behaviorType === 'role_temporary') {
        behaviorLabel = \`Temporary Role (\${p.duration || 'Timed'})\`;
        behaviorColor = '#ec4899';
        behaviorIcon = '⏳';
      } else if (p.behaviorType === 'consumable') {
        behaviorLabel = 'Consumable Item';
        behaviorColor = '#10b981';
        behaviorIcon = '⚡';
      }

      let stockBadge = '<span class="role-pill" style="color: #60a5fa; border-color: rgba(96,165,250,0.3); background: rgba(96,165,250,0.1);">♾️ Unlimited Stock</span>';
      let isOutOfStock = false;
      if (p.stock !== null && p.stock !== undefined) {
        if (p.stock > 0) {
          stockBadge = \`<span class="status-pill status-paid" style="font-size: 12px;">🟢 \${p.stock} in stock</span>\`;
        } else {
          isOutOfStock = true;
          stockBadge = '<span class="status-pill status-rejected" style="font-size: 12px;">🔴 Out of Stock</span>';
        }
      }

      const scopeBadge = p.guildId === 'global'
        ? '<span class="server-badge" style="background: rgba(59,130,246,0.15); color: #60a5fa; border: 1px solid rgba(59,130,246,0.3);">🌐 Global Item</span>'
        : \`<span class="server-badge" style="background: rgba(167,139,250,0.15); color: #c4b5fd; border: 1px solid rgba(167,139,250,0.3);">🏰 \${currentGuildName} Exclusive</span>\`;

      const escapedName = (p.name || 'Item').replace(/'/g, "\\\\'");

      body.innerHTML = \`
        \${p.imageUrl ? \`
          <div style="position: relative; width: 100%; height: 230px; background: #0b0c16; overflow: hidden; border-radius: 20px 20px 0 0;">
            <img src="\${p.imageUrl}" alt="\${p.name}" style="width: 100%; height: 100%; object-fit: cover;">
            <div style="position: absolute; inset: 0; background: linear-gradient(180deg, rgba(10,8,22,0.15) 0%, rgba(10,8,22,0.88) 100%);"></div>
            <div style="position: absolute; bottom: 16px; left: 20px; right: 20px; z-index: 2;">
              <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 8px;">
                \${scopeBadge}
                <span class="role-pill" style="color: \${behaviorColor}; border-color: \${behaviorColor}44; background: \${behaviorColor}18;">\${behaviorIcon} \${behaviorLabel}</span>
                \${stockBadge}
              </div>
              <h2 style="font-family: 'Outfit', sans-serif; font-size: 24px; font-weight: 800; color: #fff; margin: 0; text-shadow: 0 2px 10px rgba(0,0,0,0.8);">\${p.name}</h2>
            </div>
          </div>
        \` : \`
          <div style="padding: 24px 24px 16px; border-bottom: 1px solid var(--border); background: var(--subcard-bg); border-radius: 20px 20px 0 0;">
            <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 10px;">
              \${scopeBadge}
              <span class="role-pill" style="color: \${behaviorColor}; border-color: \${behaviorColor}44; background: \${behaviorColor}18;">\${behaviorIcon} \${behaviorLabel}</span>
              \${stockBadge}
            </div>
            <h2 style="font-family: 'Outfit', sans-serif; font-size: 24px; font-weight: 800; color: var(--text-heading); margin: 0;">\${p.name}</h2>
          </div>
        \`}

        <div style="padding: 20px 24px;">
          <!-- Price Card -->
          <div style="display: flex; justify-content: space-between; align-items: center; background: linear-gradient(135deg, rgba(245,158,11,0.12), rgba(124,58,237,0.12)); border: 1px solid rgba(245,158,11,0.25); border-radius: 16px; padding: 14px 18px; margin-bottom: 18px;">
            <div>
              <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: var(--muted); font-weight: 700;">Price in VCoins</div>
              <div style="font-family: 'Outfit', sans-serif; font-size: 26px; font-weight: 800; color: #fbbf24; display: flex; align-items: center; gap: 8px; margin-top: 2px;">
                \${p.coins.toLocaleString()} <span style="display: inline-flex; align-items: center;">\${COIN_ICON_HTML}</span>
              </div>
            </div>
            <div style="text-align: right;">
              <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: var(--muted); font-weight: 700;">Availability</div>
              <div style="font-size: 13px; font-weight: 700; color: \${isOutOfStock ? '#ef4444' : '#10b981'}; margin-top: 4px;">
                \${isOutOfStock ? 'Out of Stock' : (p.stock > 0 ? p.stock + ' Units Left' : 'In Stock (Unlimited)')}
              </div>
            </div>
          </div>

          <!-- Description & Perks -->
          <div style="margin-bottom: 18px;">
            <div style="font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: var(--muted); margin-bottom: 8px; display: flex; align-items: center; gap: 6px;">
              <span>📝</span> Description &amp; Perks
            </div>
            <div style="background: var(--subcard-bg); border: 1px solid var(--border); border-radius: 14px; padding: 16px; font-size: 14px; color: var(--text); line-height: 1.7; white-space: pre-wrap; word-break: break-word;">
              \${p.description ? p.description : '<span style="color: var(--muted); font-style: italic;">No specific description provided for this item.</span>'}
            </div>
          </div>

          <!-- Specifications Table -->
          <div style="margin-bottom: 22px;">
            <div style="font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: var(--muted); margin-bottom: 8px; display: flex; align-items: center; gap: 6px;">
              <span>⚙️</span> Item Specifications
            </div>
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px;">
              <div style="background: var(--subcard-bg); border: 1px solid var(--border); border-radius: 12px; padding: 12px 14px;">
                <div style="font-size: 11px; color: var(--muted); font-weight: 600; text-transform: uppercase;">Discord Role Granted</div>
                <div style="margin-top: 4px; font-size: 13px; font-weight: 700; color: var(--text-heading);">
                  \${p.roleId ? \`<span style="color: #a78bfa; font-family: monospace;">Role: \${p.roleId}</span>\` : '<span style="color: var(--muted);">None (No Role)</span>'}
                </div>
              </div>
              <div style="background: var(--subcard-bg); border: 1px solid var(--border); border-radius: 12px; padding: 12px 14px;">
                <div style="font-size: 11px; color: var(--muted); font-weight: 600; text-transform: uppercase;">Duration / Expiry</div>
                <div style="margin-top: 4px; font-size: 13px; font-weight: 700; color: var(--text-heading);">
                  \${p.duration ? p.duration : (p.behaviorType === 'role_temporary' ? 'Timed Expiry' : 'Permanent / Lifetime')}
                </div>
              </div>
              <div style="background: var(--subcard-bg); border: 1px solid var(--border); border-radius: 12px; padding: 12px 14px;">
                <div style="font-size: 11px; color: var(--muted); font-weight: 600; text-transform: uppercase;">Behavior Type</div>
                <div style="margin-top: 4px; font-size: 13px; font-weight: 700; color: var(--text-heading);">
                  <code>\${p.behaviorType || p.type || 'STATIC'}</code>
                </div>
              </div>
              <div style="background: var(--subcard-bg); border: 1px solid var(--border); border-radius: 12px; padding: 12px 14px;">
                <div style="font-size: 11px; color: var(--muted); font-weight: 600; text-transform: uppercase;">Product ID</div>
                <div style="margin-top: 4px; display: flex; align-items: center; justify-content: space-between; gap: 6px;">
                  <span style="font-size: 12px; font-weight: 600; font-family: monospace; color: var(--muted); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="\${p._id}">
                    \${p._id}
                  </span>
                  <button type="button" class="btn-secondary btn-sm" style="padding: 2px 7px; font-size: 10px; height: 22px; flex-shrink: 0;" onclick="navigator.clipboard.writeText('\${p._id}'); showToast('Copied Product ID!');" title="Copy Product ID">📋</button>
                </div>
              </div>
            </div>
          </div>

          <!-- Actions / CTA -->
          <div style="display: flex; gap: 12px; align-items: center; border-top: 1px solid var(--border); padding-top: 18px;">
            <button class="btn-secondary" style="flex: 1; justify-content: center; height: 46px;" onclick="closeModal('product-details-modal')">Close</button>
            \${isOutOfStock ? \`
              <button class="btn-primary disabled" disabled style="flex: 2; justify-content: center; height: 46px; font-size: 15px; font-weight: 700; opacity: 0.55; cursor: not-allowed; background: var(--border); box-shadow: none;">
                \${CLIENT_ICONS.cart} Out of Stock
              </button>
            \` : \`
              <button class="btn-primary" style="flex: 2; justify-content: center; height: 46px; font-size: 15px; font-weight: 700;" onclick="closeModal('product-details-modal'); buyItem('\${p._id}', '\${escapedName}', \${p.coins})">
                \${CLIENT_ICONS.cart} Buy Item (\${p.coins.toLocaleString()} Coins)
              </button>
            \`}
          </div>
        </div>
      \`;

      document.getElementById('product-details-modal').classList.add('active');
    }

    // ─── INSPECT ORDER DETAILS MODAL ───
    async function inspectOrderDetails(orderId) {
      if (!orderId) return;
      const modal = document.getElementById('order-inspect-modal');
      const body = document.getElementById('order-inspect-body');
      if (!body) return;

      body.innerHTML = '<div style="text-align: center; padding: 30px; color: var(--muted);">Loading order details...</div>';
      if (modal) modal.classList.add('active');

      try {
        const res = await fetch(\`/api/orders/detail?orderId=\${encodeURIComponent(orderId)}&guildId=\${encodeURIComponent(currentGuildId)}\`);
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          body.innerHTML = \`<div style="text-align: center; color: var(--red); padding: 25px;">\${errData.error || 'Failed to load order inspection.'}</div>\`;
          return;
        }

        const data = await res.json();
        const o = data.order;
        if (!o) {
          body.innerHTML = '<div style="text-align: center; color: var(--red); padding: 25px;">Order not found.</div>';
          return;
        }

        const isCoin = o.category === 'Coin Purchase' || (o.type && o.type.includes('coin'));
        const iconHtml = isCoin
          ? '<img src="/assets/vyntrix-coin.png" style="width:24px;height:24px;object-fit:contain;" alt="Coin">'
          : '<span style="font-size:20px;">👑</span>';

        const amountFormatted = '₹' + (o.displayAmountInr || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        const coinsFormatted = (o.coins || 0).toLocaleString();

        let statusBadgeClass = 'order-status-paid';
        let statusText = '● PAID';
        if (o.status === 'pending' || o.status === 'review') {
          statusBadgeClass = 'order-status-pending';
          statusText = '⏳ PENDING';
        } else if (o.status === 'expired' || o.status === 'rejected') {
          statusBadgeClass = 'order-status-failed';
          statusText = '✖ ' + (o.status || 'EXPIRED').toUpperCase();
        }

        body.innerHTML = \`
          <div style="background: var(--subcard-bg); border: 1px solid var(--border); border-radius: 14px; padding: 18px; margin-bottom: 14px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; padding-bottom: 10px; border-bottom: 1px solid var(--border);">
              <span style="font-size: 11px; color: var(--muted); text-transform: uppercase; font-weight: 800; letter-spacing: 0.05em;">Order Identifier</span>
              <div class="order-id-badge" style="font-size: 12px;">
                <span>\${o.orderId}</span>
                <button class="order-copy-btn" onclick="copyOrderId('\${o.orderId}', this)" title="Copy Order ID">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                </button>
              </div>
            </div>

            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
              <span style="font-size: 12px; color: var(--muted); font-weight: 700;">Status</span>
              <span class="order-status-badge \${statusBadgeClass}">\${statusText}</span>
            </div>

            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
              <span style="font-size: 12px; color: var(--muted); font-weight: 700;">Item / Product</span>
              <div style="display: flex; align-items: center; gap: 8px;">
                \${iconHtml}
                <strong style="color: var(--text-heading); font-size: 14px;">\${o.productName}</strong>
              </div>
            </div>

            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
              <span style="font-size: 12px; color: var(--muted); font-weight: 700;">Buyer / Member</span>
              <span style="color: var(--text); font-weight: 600;">👤 \${o.username || 'Member'} \${o.userTag || ''}</span>
            </div>

            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
              <span style="font-size: 12px; color: var(--muted); font-weight: 700;">Discord Server</span>
              <span style="color: var(--text); font-weight: 600;">🏰 \${o.guildName || currentGuildName}</span>
            </div>

            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
              <span style="font-size: 12px; color: var(--muted); font-weight: 700;">Amount (INR)</span>
              <span class="order-amount-inr" style="font-size: 14px;">\${amountFormatted}</span>
            </div>

            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
              <span style="font-size: 12px; color: var(--muted); font-weight: 700;">Coins</span>
              <div class="order-coins-wrap" style="font-size: 14px;">
                <span>\${coinsFormatted}</span>
                <img src="/assets/vyntrix-coin.png" class="order-coin-img" alt="V">
              </div>
            </div>

            \${o.rrn ? \`
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
              <span style="font-size: 12px; color: var(--muted); font-weight: 700;">Payment Ref (RRN)</span>
              <code style="font-size: 12px;">\${o.rrn}</code>
            </div>\` : ''}

            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="font-size: 12px; color: var(--muted); font-weight: 700;">Created Date</span>
              <span style="font-size: 12px; color: var(--text);">\${new Date(o.createdAt).toLocaleString()}</span>
            </div>
            \${o.paidAt ? \`
            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 10px;">
              <span style="font-size: 12px; color: var(--muted); font-weight: 700;">Completed Date</span>
              <span style="font-size: 12px; color: #10b981; font-weight: 600;">\${new Date(o.paidAt).toLocaleString()}</span>
            </div>\` : ''}
          </div>
          <div style="display: flex; justify-content: flex-end; gap: 10px;">
            <button class="btn-primary" style="padding: 8px 20px; font-size: 13px;" onclick="closeModal('order-inspect-modal')">Close</button>
          </div>
        \`;
      } catch (err) {
        console.error('Error inspecting order:', err);
        body.innerHTML = '<div style="text-align: center; color: var(--red); padding: 25px;">Failed to fetch order details.</div>';
      }
    }

    async function buyItem(productId, name, price) {
      if (currentShopUserBalance < price) {
        showToast(\`Insufficient balance! You have \${currentShopUserBalance.toLocaleString()} VCoins but need \${price.toLocaleString()} VCoins.\`, true);
        openTopUpModal();
        return;
      }

      if (!confirm(\`Are you sure you want to purchase \${name} for \${price} coins in \${currentGuildName}?\`)) return;

      try {
        const res = await fetch('/api/buyitem', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId, guildId: currentGuildId })
        });
        const data = await res.json();
        if (res.ok) {
          showToast(\`Successfully bought \${name} in \${currentGuildName}!\`);
          if (data.roleAssigned) {
            showToast('Discord role granted directly to your account!');
          }
          currentShopUserBalance = data.newBalance;
          loadUserData();
          loadShop(currentShopPage);
          renderDashboardFeatured();
        } else {
          showToast(data.error || 'Failed to purchase item', true);
        }
      } catch (e) {
        showToast('Network error while purchasing', true);
      }
    }

    // ─── TOP UP MODAL ───
    function openTopUpModal() {
      if (!currentGuildId) {
        showToast('Please join or select a mutual server first', true);
        return;
      }
      document.getElementById('topup-step-1').style.display = 'block';
      document.getElementById('topup-step-2').style.display = 'none';
      document.getElementById('topup-modal').classList.add('active');
    }

    async function generateUpiOrder() {
      const amount = Number(document.getElementById('topup-amount').value);
      if (!amount || amount < 1) return showToast('Enter at least ₹1', true);

      try {
        const res = await fetch('/api/buycoin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount, guildId: currentGuildId })
        });
        const data = await res.json();
        if (res.ok && data.order) {
          document.getElementById('topup-qr-img').src = data.order.qrDataUrl;
          document.getElementById('topup-display-inr').textContent = '₹' + data.order.amountInr.toFixed(2);
          document.getElementById('topup-upi-link').href = data.order.upiUri;
          document.getElementById('topup-step-1').style.display = 'none';
          document.getElementById('topup-step-2').style.display = 'block';
          loadUserData();
        } else {
          showToast(data.error || 'Failed to create UPI order', true);
        }
      } catch (e) {
        showToast('Error creating order', true);
      }
    }

    // ─── ADMIN ACTIONS (SERVER SCOPED) ───
    async function loadAdminOrders() {
      try {
        const res = await fetch(\`/api/admin/orders?guildId=\${currentGuildId}\`);
        if (!res.ok) return;
        const data = await res.json();
        const tbody = document.getElementById('admin-orders-table');

        if (!data.orders || data.orders.length === 0) {
          tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: var(--muted); padding: 30px;">No orders found for this server.</td></tr>';
          return;
        }

        tbody.innerHTML = data.orders.map(o => {
          const avatar = o.avatar || 'https://cdn.discordapp.com/embed/avatars/0.png';
          const username = o.username || (o.userId ? 'User ' + o.userId.slice(-4) : 'User');
          const userTag = o.userTag || (o.userId ? '#' + o.userId.slice(-4) : '#0001');
          const createdStr = new Date(o.createdAt).toLocaleString('en-US', {
            month: '2-digit', day: '2-digit', year: 'numeric',
            hour: 'numeric', minute: '2-digit', second: '2-digit',
            hour12: true
          });
          const statusClass = (o.status || 'pending').toLowerCase();

          return \`
            <tr data-userid="\${esc(o.userId || '')}" data-orderid="\${esc((o.orderId || '').toLowerCase())}" data-username="\${esc(username.toLowerCase())}" data-tag="\${esc(userTag.toLowerCase())}">
              <td>
                <div class="admin-order-id-pill">
                  <span>\${esc(o.orderId)}</span>
                  <button type="button" class="admin-copy-btn" onclick="copyToClipboard('\${esc(o.orderId)}')" title="Copy Order ID">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                    </svg>
                  </button>
                </div>
              </td>
              <td>
                <div style="display: flex; align-items: center; gap: 10px;">
                  <img src="\${avatar}" class="admin-user-avatar" alt="Avatar" onerror="this.onerror=null;this.src='https://cdn.discordapp.com/embed/avatars/0.png'">
                  <div style="display: flex; flex-direction: column; min-width: 0;">
                    <span style="font-weight: 700; color: var(--text-heading); font-size: 13px; line-height: 1.2;">\${esc(username)}</span>
                    <span style="font-size: 11px; color: var(--muted); font-family: monospace;">\${esc(userTag)}</span>
                  </div>
                </div>
              </td>
              <td><strong>₹\${(o.amountInr || 0).toFixed(2)}</strong></td>
              <td>
                <span style="font-weight: 700; color: #fbbf24; display: inline-flex; align-items: center; gap: 4px;">
                  \${(o.coins || 0).toLocaleString()} \${COIN_ICON_HTML}
                </span>
              </td>
              <td>
                <span class="admin-status-badge status-\${statusClass}">
                  ● \${esc((o.status || 'PENDING').toUpperCase())}
                </span>
              </td>
              <td style="color: var(--muted); font-size: 12px;">\${createdStr}</td>
              <td style="text-align: right;">
                <div style="display: inline-flex; gap: 6px; align-items: center; justify-content: flex-end;">
                  \${o.status === 'pending' || o.status === 'review' ? \`
                    <button class="btn-gold btn-sm" style="padding: 5px 10px; font-size: 11px;" onclick="openApproveModal('\${esc(o.orderId)}', \${o.amountInr})">Approve</button>
                    <button class="admin-btn-danger-outline" style="padding: 5px 10px; font-size: 11px;" onclick="rejectOrder('\${esc(o.orderId)}')">Reject</button>
                  \` : ''}
                  <button class="admin-btn-danger-outline" onclick="deleteOrder('\${esc(o.orderId)}')">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          \`;
        }).join('');
      } catch (e) {
        console.error('loadAdminOrders error:', e);
      }
    }

    async function deleteOrder(orderId) {
      if (!confirm(\`Are you sure you want to permanently delete order \${orderId} from the database?\`)) return;

      try {
        const res = await fetch('/api/admin/order/delete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId })
        });
        const data = await res.json();
        if (res.ok) {
          showToast(\`Order \${orderId} deleted from database.\`);
          loadAdminOrders();
          loadUserData();
        } else {
          showToast(data.error || 'Failed to delete order', true);
        }
      } catch (e) {
        showToast('Error deleting order', true);
      }
    }

    function openApproveModal(orderId, amount) {
      activeApproveOrderId = orderId;
      activeApproveAmount = amount;
      document.getElementById('approve-order-details').textContent = \`Order ID: \${orderId} | Amount: ₹\${amount.toFixed(2)}\`;
      document.getElementById('approve-rrn-input').value = '';
      document.getElementById('approve-modal').classList.add('active');
    }

    async function submitApprovePayment() {
      const rrn = document.getElementById('approve-rrn-input').value.trim();
      if (!rrn) return showToast('Please enter RRN / UTR number', true);

      try {
        const res = await fetch('/api/admin/approve-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId: activeApproveOrderId, amount: activeApproveAmount, rrn })
        });
        const data = await res.json();
        if (res.ok) {
          showToast('Payment successfully approved and credited!');
          closeModal('approve-modal');
          loadAdminOrders();
          loadUserData();
        } else {
          showToast(data.error || 'Failed to approve', true);
        }
      } catch (e) {
        showToast('Network error during approval', true);
      }
    }

    async function rejectOrder(orderId) {
      const reason = prompt('Enter rejection reason for this order:');
      if (!reason) return;

      try {
        const res = await fetch('/api/admin/reject-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId, reason })
        });
        const data = await res.json();
        if (res.ok) {
          showToast('Order rejected.');
          loadAdminOrders();
        } else {
          showToast(data.error || 'Failed to reject', true);
        }
      } catch (e) {}
    }

    // ─── UNIVERSAL USER & WALLET INSPECTOR (/profile, /wallet, /transactions, /orderhistory, /remove-item) ───
    let lastInspectedUserId = '';
    let currentInspectData = null;
    let currentInspectSelectedGuildId = null;
    let currentInspectSubTab = 'items';

    function handleInspectInputChange(val) {
      const clearBtn = document.getElementById('inspect-clear-btn');
      if (clearBtn) {
        clearBtn.style.display = val && val.trim() ? 'block' : 'none';
      }
      if (!val || !val.trim()) {
        clearInspectResults();
      }
    }

    function clearInspectInputAndResults() {
      const input = document.getElementById('inspect-user-id-input');
      if (input) {
        input.value = '';
        input.focus();
      }
      clearInspectResults();
    }

    function clearInspectResults() {
      lastInspectedUserId = '';
      currentInspectData = null;
      currentInspectSelectedGuildId = null;
      const container = document.getElementById('inspect-results-container');
      if (container) {
        container.style.display = 'none';
        container.innerHTML = '';
      }
      const loading = document.getElementById('inspect-loading');
      if (loading) {
        loading.style.display = 'none';
      }
      const clearBtn = document.getElementById('inspect-clear-btn');
      if (clearBtn) {
        clearBtn.style.display = 'none';
      }
    }

    async function handleInspectUser(e, directUserId) {
      if (e) e.preventDefault();
      const input = document.getElementById('inspect-user-id-input');
      const rawUser = (directUserId || (input ? input.value : '')).trim();
      const digitMatch = rawUser.match(/\d{17,21}/);
      const userId = digitMatch ? digitMatch[0] : rawUser;
      if (!userId) {
        clearInspectResults();
        return showToast('Please enter a valid Discord User ID', true);
      }

      if (input && input.value !== userId) {
        input.value = userId;
      }

      const clearBtn = document.getElementById('inspect-clear-btn');
      if (clearBtn) clearBtn.style.display = 'block';

      lastInspectedUserId = userId;
      // CRITICAL REQUIREMENT: Do not open the full wallet management interface automatically when user is found
      currentInspectSelectedGuildId = null;

      const loading = document.getElementById('inspect-loading');
      const container = document.getElementById('inspect-results-container');
      if (loading) loading.style.display = 'block';
      if (container) {
        container.style.display = 'none';
        container.innerHTML = '';
      }

      try {
        const res = await fetch(\`/api/admin/user-inspect?userId=\${encodeURIComponent(userId)}\`);
        const data = await res.json();
        if (loading) loading.style.display = 'none';

        if (!res.ok || !data.success) {
          if (container) {
            container.style.display = 'block';
            container.innerHTML = \`<div style="padding: 16px; background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.25); border-radius: 12px; color: #f87171;">
              ⚠️ \${data.error || 'User not found or database query failed.'}
            </div>\`;
          }
          return;
        }

        currentInspectData = data;
        renderUserInspection();
      } catch (err) {
        if (loading) loading.style.display = 'none';
        showToast('Error inspecting user', true);
      }
    }

    async function reloadUserInspection(userId, preserveGuildId) {
      try {
        const res = await fetch(\`/api/admin/user-inspect?userId=\${encodeURIComponent(userId)}\`);
        const data = await res.json();
        if (res.ok && data.success) {
          currentInspectData = data;
          if (preserveGuildId) {
            currentInspectSelectedGuildId = preserveGuildId;
          }
          renderUserInspection();
        }
      } catch (e) {}
    }

    function selectInspectServer(guildId) {
      currentInspectSelectedGuildId = guildId;
      renderUserInspection();
      const detailEl = document.getElementById('inspect-server-detail-section');
      if (detailEl) {
        detailEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }

    function setInspectSubTab(tabName) {
      currentInspectSubTab = tabName;
      renderUserInspection();
    }

    function renderUserInspection() {
      const data = currentInspectData;
      const container = document.getElementById('inspect-results-container');
      if (!data || !container) return;
      container.style.display = 'block';

      const u = data.user;
      const mutualGuilds = data.guilds || [];
      const totalBalance = data.totalBalance || 0;
      const totalPurchases = data.totalPurchases || (data.inventory ? data.inventory.length : 0);

      // 1. Profile Banner
      const profileBannerHtml = \`
        <div class="inspect-profile-banner">
          <div class="inspect-profile-left">
            <img class="inspect-profile-avatar" src="\${u.avatarUrl}" alt="Avatar">
            <div class="inspect-profile-info">
              <div class="inspect-profile-name-row">
                <span class="inspect-profile-username">\${u.username}</span>
                <span class="inspect-profile-tag">\${u.tag}</span>
                <span class="inspect-profile-pill">Discord User</span>
                \${u.isOwner ? '<span class="user-role-badge role-owner" style="margin-left: 4px;">👑 Bot Owner</span>' : ''}
              </div>
              <div style="display: flex; align-items: center; gap: 8px; margin-top: 4px;">
                <code style="color: #c4b5fd; font-size: 13px; font-family: monospace;">\${u.id}</code>
                <button type="button" onclick="navigator.clipboard.writeText('\${u.id}'); showToast('Copied User ID to clipboard');" title="Copy User ID" style="background: transparent; border: none; color: var(--muted); cursor: pointer; padding: 2px 4px; display: inline-flex; align-items: center;">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                </button>
              </div>
            </div>
          </div>

          <div class="inspect-profile-stats-group">
            <div class="inspect-stat-item">
              <div class="inspect-stat-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="8" rx="2" ry="2"></rect><rect x="2" y="14" width="20" height="8" rx="2" ry="2"></rect><line x1="6" y1="6" x2="6.01" y2="6"></line><line x1="6" y1="18" x2="6.01" y2="18"></line></svg>
              </div>
              <div class="inspect-stat-col">
                <span class="inspect-stat-label-top">JOINED SERVERS</span>
                <span class="inspect-stat-number">\${mutualGuilds.length} servers</span>
                <span class="inspect-stat-subtext">User is a member of \${mutualGuilds.length} server\${mutualGuilds.length === 1 ? '' : 's'}</span>
              </div>
            </div>

            <div class="inspect-stat-item">
              <div class="inspect-stat-icon" style="color: #fbbf24; background: rgba(251,191,36,0.12); border-color: rgba(251,191,36,0.25);">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"></circle><path d="M12 6v12M15 9.5A3.5 3.5 0 0 0 12 7c-2 0-3 1-3 2.5s1 2 3 2.5 3 1 3 2.5-1 2.5-3 2.5a3.5 3.5 0 0 1-3-2.5"></path></svg>
              </div>
              <div class="inspect-stat-col">
                <span class="inspect-stat-label-top">TOTAL BALANCE</span>
                <span class="inspect-stat-number" style="color: #fbbf24;">\${totalBalance.toLocaleString()} VCoins</span>
                <span class="inspect-stat-subtext">Across all servers (Aggregate)</span>
              </div>
            </div>

            <div class="inspect-stat-item">
              <div class="inspect-stat-icon" style="color: #a78bfa; background: rgba(167,139,250,0.12); border-color: rgba(167,139,250,0.25);">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
              </div>
              <div class="inspect-stat-col">
                <span class="inspect-stat-label-top">TOTAL PURCHASES</span>
                <span class="inspect-stat-number">\${totalPurchases} items</span>
                <span class="inspect-stat-subtext">Across all servers</span>
              </div>
            </div>
          </div>
        </div>
      \`;

      // 2. Server Selection Cards Section
      let serverCardsHtml = '';
      if (mutualGuilds.length === 0) {
        serverCardsHtml = \`
          <div style="padding: 28px 20px; text-align: center; background: rgba(255,255,255,0.02); border: 1px dashed rgba(255,255,255,0.1); border-radius: 14px; color: var(--muted); margin-top: 14px;">
            <div style="font-size: 26px; margin-bottom: 8px;">🏰</div>
            <strong style="color: #e2e8f0; font-size: 14px;">No Authorized Mutual Servers Found</strong>
            <p style="font-size: 12px; margin-top: 4px; color: var(--muted);">
              This user was not found in any Discord server where you are authorized to inspect records.
            </p>
          </div>
        \`;
      } else {
        serverCardsHtml = \`
          <div class="inspect-servers-grid">
            \${mutualGuilds.map(g => {
              const isSelected = currentInspectSelectedGuildId === g.guildId;
              return \`
                <div class="inspect-server-card \${isSelected ? 'selected' : ''}" onclick="selectInspectServer('\${g.guildId}')">
                  <div class="inspect-server-header">
                    <div class="inspect-server-identity">
                      \${g.iconUrl
                        ? \`<img src="\${g.iconUrl}" class="inspect-server-icon" alt="\${g.guildName}">\`
                        : \`<div class="inspect-server-icon-placeholder">\${(g.guildName || 'S').charAt(0).toUpperCase()}</div>\`
                      }
                      <div style="min-width: 0;">
                        <div class="inspect-server-name" title="\${g.guildName}">\${g.guildName}</div>
                        \${g.memberCount ? \`<div class="inspect-server-meta">\${g.memberCount} members</div>\` : ''}
                        <div class="inspect-server-id">ID: \${g.guildId}</div>
                      </div>
                    </div>
                    <div class="inspect-server-balance-box">
                      <span class="inspect-server-balance-label">Balance</span>
                      <span class="inspect-server-balance-val">\${(g.balance || 0).toLocaleString()} \${COIN_ICON_HTML}</span>
                    </div>
                  </div>

                  <button type="button" class="inspect-server-select-btn" onclick="event.stopPropagation(); selectInspectServer('\${g.guildId}')">
                    \${isSelected ? '✔ Currently Selected' : 'Select Server'}
                  </button>
                </div>
              \`;
            }).join('')}
          </div>
        \`;
      }

      // 3. Detailed Management Panel (Rendered only after a server is selected)
      let detailSectionHtml = '';
      if (!currentInspectSelectedGuildId) {
        detailSectionHtml = \`
          <div style="text-align: center; padding: 32px 20px; background: rgba(255,255,255,0.02); border: 1px dashed rgba(255,255,255,0.1); border-radius: 14px; margin-top: 20px; color: var(--muted);">
            <div style="font-size: 26px; margin-bottom: 6px;">👆</div>
            <strong style="color: #cbd5e1; font-size: 14px;">Select a Server to View Detailed Records</strong>
            <div style="font-size: 12px; color: var(--muted); margin-top: 4px;">Click <strong>Select Server</strong> on any server card above to view wallet, purchases, roles and authorized management actions.</div>
          </div>
        \`;
      } else {
        const selGuild = mutualGuilds.find(g => g.guildId === currentInspectSelectedGuildId);
        if (!selGuild) {
          currentInspectSelectedGuildId = null;
          renderUserInspection();
          return;
        }

        const serverItems = (data.inventory || []).filter(i => i.guildId === selGuild.guildId);
        const serverOrders = (data.orders || []).filter(o => o.guildId === selGuild.guildId);
        const serverLedger = (data.ledger || []).filter(l => l.guildId === selGuild.guildId);
        const serverRoles = selGuild.roles || [];

        // Joined server duration
        let joinedDuration = '';
        if (selGuild.joinedAt) {
          const joinedDate = new Date(selGuild.joinedAt);
          const now = new Date();
          let monthsDiff = (now.getFullYear() - joinedDate.getFullYear()) * 12 + (now.getMonth() - joinedDate.getMonth());
          if (monthsDiff < 0) monthsDiff = 0;
          const y = Math.floor(monthsDiff / 12);
          const m = monthsDiff % 12;
          if (y > 0 && m > 0) joinedDuration = \`(\${y} year\${y > 1 ? 's' : ''}, \${m} month\${m > 1 ? 's' : ''})\`;
          else if (y > 0) joinedDuration = \`(\${y} year\${y > 1 ? 's' : ''})\`;
          else if (m > 0) joinedDuration = \`(\${m} month\${m > 1 ? 's' : ''})\`;
          else joinedDuration = '(Recently joined)';
        }

        // Subtabs content
        let activeTabContentHtml = '';
        if (currentInspectSubTab === 'items') {
          if (serverItems.length === 0) {
            activeTabContentHtml = \`<div style="text-align: center; padding: 28px 14px; color: var(--muted); font-size: 13px;">No items purchased by this user in <strong>\${selGuild.guildName}</strong>.</div>\`;
          } else {
            activeTabContentHtml = \`
              <div class="table-responsive">
                <table>
                  <thead>
                    <tr>
                      <th>ITEM / ROLE</th>
                      <th>TYPE</th>
                      <th>PRICE (VCOINS)</th>
                      <th>PURCHASED ON</th>
                      <th>STATUS</th>
                      <th>ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    \${serverItems.map(inv => \`
                      <tr>
                        <td>
                          <div style="display: flex; align-items: center; gap: 10px;">
                            <span style="font-size: 18px;">👑</span>
                            <div>
                              <strong style="color: var(--text-heading); font-size: 13px;">\${inv.productName}</strong>
                              <div style="font-size: 11px; color: var(--muted);">ID: \${inv.inventoryId}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span class="role-pill" style="color: #a78bfa; border-color: rgba(167,139,250,0.3); background: rgba(167,139,250,0.1);">\${inv.itemType || 'Role Purchase'}</span>
                        </td>
                        <td>
                          <span style="font-weight: 700; color: #fbbf24; display: inline-flex; align-items: center; gap: 4px;">\${(inv.priceCoins || inv.price || 0).toLocaleString()} \${COIN_ICON_HTML}</span>
                        </td>
                        <td>
                          <div style="font-size: 12px; color: var(--text-heading);">\${new Date(inv.purchasedAt || inv.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                          <div style="font-size: 10px; color: var(--muted);">\${new Date(inv.purchasedAt || inv.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</div>
                        </td>
                        <td>
                          <span class="status-pill status-\${inv.status === 'active' || inv.status === 'available' ? 'paid' : 'pending'}">● \${inv.status || 'Active'}</span>
                        </td>
                        <td>
                          <button type="button" class="admin-btn-danger-outline btn-sm" onclick="revokeServerItem('\${inv.inventoryId}', '\${inv.productName.replace(/'/g, "\\\\'")}', '\${selGuild.guildId}')" style="display: inline-flex; align-items: center; gap: 4px;">
                            🗑️ Revoke
                          </button>
                        </td>
                      </tr>
                    \`).join('')}
                  </tbody>
                </table>
              </div>
            \`;
          }
        } else if (currentInspectSubTab === 'orders') {
          if (serverOrders.length === 0) {
            activeTabContentHtml = \`<div style="text-align: center; padding: 28px 14px; color: var(--muted); font-size: 13px;">No orders found for this user in <strong>\${selGuild.guildName}</strong>.</div>\`;
          } else {
            activeTabContentHtml = \`
              <div class="table-responsive">
                <table>
                  <thead>
                    <tr>
                      <th>ORDER ID</th>
                      <th>ITEM</th>
                      <th>AMOUNT (INR)</th>
                      <th>COINS</th>
                      <th>STATUS</th>
                      <th>CREATED</th>
                    </tr>
                  </thead>
                  <tbody>
                    \${serverOrders.map(o => \`
                      <tr>
                        <td><code>\${o.orderId}</code></td>
                        <td><strong>\${o.productName}</strong></td>
                        <td>₹\${(o.amountInr || 0).toFixed(2)}</td>
                        <td>\${o.coins} \${COIN_ICON_HTML}</td>
                        <td><span class="status-pill status-\${o.status}">\${o.status}</span></td>
                        <td>\${new Date(o.createdAt).toLocaleDateString()}</td>
                      </tr>
                    \`).join('')}
                  </tbody>
                </table>
              </div>
            \`;
          }
        } else if (currentInspectSubTab === 'roles') {
          if (serverRoles.length === 0) {
            activeTabContentHtml = \`<div style="text-align: center; padding: 28px 14px; color: var(--muted); font-size: 13px;">No custom roles held by this user in <strong>\${selGuild.guildName}</strong>.</div>\`;
          } else {
            activeTabContentHtml = \`
              <div class="table-responsive">
                <table>
                  <thead>
                    <tr>
                      <th>ROLE NAME</th>
                      <th>ROLE ID</th>
                      <th>COLOR</th>
                      <th>STATUS</th>
                    </tr>
                  </thead>
                  <tbody>
                    \${serverRoles.map(r => \`
                      <tr>
                        <td>
                          <span class="role-pill" style="border-left: 3px solid \${r.color && r.color !== '#000000' ? r.color : '#8b5cf6'}; font-size: 12px; font-weight: 700;">\${r.name}</span>
                        </td>
                        <td><code>\${r.id}</code></td>
                        <td>\${r.color && r.color !== '#000000' ? \`<span style="display: inline-block; width: 14px; height: 14px; border-radius: 3px; background: \${r.color}; vertical-align: middle; margin-right: 4px;"></span><code>\${r.color}</code>\` : '<span style="color: var(--muted); font-size: 11px;">Default</span>'}</td>
                        <td><span class="status-pill status-paid">● Assigned in Discord</span></td>
                      </tr>
                    \`).join('')}
                  </tbody>
                </table>
              </div>
            \`;
          }
        } else if (currentInspectSubTab === 'ledger') {
          if (serverLedger.length === 0) {
            activeTabContentHtml = \`<div style="text-align: center; padding: 28px 14px; color: var(--muted); font-size: 13px;">No ledger transactions on record in <strong>\${selGuild.guildName}</strong>.</div>\`;
          } else {
            activeTabContentHtml = \`
              <div class="table-responsive">
                <table>
                  <thead>
                    <tr>
                      <th>DATE / TIME</th>
                      <th>CHANGE</th>
                      <th>TYPE</th>
                      <th>REASON</th>
                      <th>REFERENCE / ORDER ID</th>
                    </tr>
                  </thead>
                  <tbody>
                    \${serverLedger.map(l => \`
                      <tr>
                        <td>\${new Date(l.createdAt).toLocaleDateString()} \${new Date(l.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                        <td>
                          <strong style="color: \${l.coins >= 0 ? '#10b981' : '#ef4444'}; font-size: 13px; display: inline-flex; align-items: center; gap: 4px;">
                            \${l.coins >= 0 ? '+' : ''}\${l.coins.toLocaleString()} \${COIN_ICON_HTML}
                          </strong>
                        </td>
                        <td><code>\${l.type}</code></td>
                        <td>\${l.reason || '-'}</td>
                        <td><code>\${l.orderId || l.rrn || '-'}</code></td>
                      </tr>
                    \`).join('')}
                  </tbody>
                </table>
              </div>
            \`;
          }
        }

        detailSectionHtml = \`
          <div class="inspect-detail-card" id="inspect-server-detail-section">
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 14px; margin-bottom: 20px;">
              <div>
                <h3 style="font-size: 18px; font-weight: 800; color: var(--text-heading); margin: 0;">Server: \${selGuild.guildName}</h3>
                <div style="font-size: 12px; color: var(--muted); margin-top: 3px;">
                  ID: \${selGuild.guildId} \${selGuild.memberCount ? \`• \${selGuild.memberCount} members\` : ''}
                </div>
              </div>
              <div class="inspect-dossier-actions">
                <button type="button" class="btn-credit-green" onclick="openQuickCoinAdjust('\${u.id}', '\${selGuild.guildId}', 'give', '\${selGuild.guildName.replace(/'/g, "\\\\'")}')">
                  + Credit Coins
                </button>
                <button type="button" class="btn-debit-red" onclick="openQuickCoinAdjust('\${u.id}', '\${selGuild.guildId}', 'take', '\${selGuild.guildName.replace(/'/g, "\\\\'")}')">
                  - Debit Coins
                </button>
                <button type="button" class="admin-btn-purple btn-sm" onclick="setInspectSubTab('items')" style="height: 38px;">
                  ⚡ Revoke Item
                </button>
                <button type="button" class="admin-btn-secondary btn-sm" onclick="setInspectSubTab('ledger')" style="height: 38px;">
                  📋 View All Transactions
                </button>
              </div>
            </div>

            <!-- 4 Telemetry Stat Tiles -->
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 14px; margin-bottom: 20px;">
              <div class="stat-card" style="padding: 16px;">
                <div class="stat-label">VCOINS BALANCE</div>
                <div class="stat-value" style="color: #fbbf24; font-size: 22px; display: flex; align-items: center; gap: 6px;">
                  \${(selGuild.balance || 0).toLocaleString()} \${COIN_ICON_HTML}
                </div>
                <div style="font-size: 11px; color: var(--muted); margin-top: 3px;">Available coins in this server</div>
              </div>

              <div class="stat-card" style="padding: 16px;">
                <div class="stat-label">TOTAL PURCHASES</div>
                <div class="stat-value" style="font-size: 22px;">\${serverItems.length} items</div>
                <div style="font-size: 11px; color: var(--muted); margin-top: 3px;">Successfully purchased</div>
              </div>

              <div class="stat-card" style="padding: 16px;">
                <div class="stat-label">TOTAL ORDERS</div>
                <div class="stat-value" style="font-size: 22px;">\${serverOrders.length} orders</div>
                <div style="font-size: 11px; color: var(--muted); margin-top: 3px;">All time orders in this server</div>
              </div>

              <div class="stat-card" style="padding: 16px;">
                <div class="stat-label">JOINED SERVER</div>
                <div class="stat-value" style="font-size: 16px; margin-top: 4px;">
                  \${selGuild.joinedAt ? new Date(selGuild.joinedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                </div>
                <div style="font-size: 11px; color: var(--muted); margin-top: 3px;">\${joinedDuration || 'Server member'}</div>
              </div>
            </div>

            <!-- Sub Tabs -->
            <div class="inspect-subtabs-nav">
              <button type="button" class="inspect-subtab-pill \${currentInspectSubTab === 'items' ? 'active' : ''}" onclick="setInspectSubTab('items')">
                Purchased Items (\${serverItems.length})
              </button>
              <button type="button" class="inspect-subtab-pill \${currentInspectSubTab === 'orders' ? 'active' : ''}" onclick="setInspectSubTab('orders')">
                Orders (\${serverOrders.length})
              </button>
              <button type="button" class="inspect-subtab-pill \${currentInspectSubTab === 'roles' ? 'active' : ''}" onclick="setInspectSubTab('roles')">
                Inventory / Roles (\${serverRoles.length})
              </button>
              <button type="button" class="inspect-subtab-pill \${currentInspectSubTab === 'ledger' ? 'active' : ''}" onclick="setInspectSubTab('ledger')">
                Coin Transactions (\${serverLedger.length})
              </button>
            </div>

            <!-- Tab Content -->
            \${activeTabContentHtml}
          </div>
        \`;
      }

      container.innerHTML = \`
        \${profileBannerHtml}

        <div style="margin-top: 24px;">
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; margin-bottom: 4px;">
            <div>
              <h3 style="font-size: 16px; font-weight: 800; color: var(--text-heading); margin: 0;">Select a Server to View Details</h3>
              <div style="font-size: 12px; color: var(--muted); margin-top: 3px;">
                This user is a member of \${mutualGuilds.length} server\${mutualGuilds.length === 1 ? '' : 's'}. Select a server below to view wallet, purchases, roles and manage actions.
              </div>
            </div>
            <button type="button" class="admin-btn-secondary btn-sm" onclick="handleInspectUser(null, lastInspectedUserId)" style="display: inline-flex; align-items: center; gap: 6px;">
              🔄 Refresh Servers
            </button>
          </div>

          \${serverCardsHtml}
        </div>

        \${detailSectionHtml}
      \`;
    }

    async function openQuickCoinAdjust(userId, guildId, action, guildName) {
      const isGive = action === 'give';
      const promptText = prompt(
        (isGive ? 'Credit (+)' : 'Debit (-)') + ' Coins in server "' + guildName + '"\\n\\nEnter coin amount:'
      );
      if (!promptText) return;
      const amount = parseFloat(promptText.trim());
      if (!amount || isNaN(amount) || amount <= 0) {
        return showToast('Invalid coin amount entered', true);
      }
      const reasonPrompt = prompt('Enter reason for this adjustment (optional):', isGive ? 'Admin Grant' : 'Admin Deduction') || '';

      showToast('Processing coin adjustment in ' + guildName + '...');
      try {
        const res = await fetch('/api/admin/coins/adjust', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            targetUserId: userId,
            guildId: guildId,
            coins: amount,
            action: isGive ? 'give' : 'take',
            reason: reasonPrompt
          })
        });
        const data = await res.json();
        if (res.ok && data.success) {
          showToast('✅ ' + (isGive ? 'Credited' : 'Debited') + ' ' + amount.toLocaleString() + ' coins in ' + guildName + '! New balance: ' + data.newBalance.toLocaleString());
          await reloadUserInspection(userId, guildId);
        } else {
          showToast(data.error || 'Failed to adjust coins', true);
        }
      } catch (err) {
        showToast('Network error during coin adjustment', true);
      }
    }

    async function revokeServerItem(inventoryId, productName, guildId) {
      if (!confirm(\`Are you sure you want to revoke and delete "\${productName}" from this user? This will remove the item from the database and automatically revoke their Discord role if active.\`)) {
        return;
      }

      try {
        const res = await fetch('/api/admin/inventory/revoke', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ inventoryId, revokeRole: true })
        });
        const data = await res.json();
        if (res.ok) {
          showToast(data.message || 'Item revoked successfully!');
          if (currentInspectData && currentInspectData.user) {
            await reloadUserInspection(currentInspectData.user.id, guildId);
          }
        } else {
          showToast(data.error || 'Failed to revoke item', true);
        }
      } catch (err) {
        showToast('Network error revoking item', true);
      }
    }

    function prefillCoinAdjust(userId, guildId, action) {
      document.getElementById('adj-target-id').value = userId;
      document.getElementById('adj-action').value = action;
      if (guildId && guildId !== currentGuildId) {
        changeActiveServer(guildId);
      }
      document.getElementById('adj-amount').focus();
      showToast(\`Selected user \${userId} for coin adjustment in server.\`);
    }

    // ─── SHOP CONFIG & TELEMETRY (/shop-config) ───
    async function loadAdminConfig() {
      try {
        const res = await fetch(\`/api/admin/shop-config?guildId=\${currentGuildId}\`);
        if (!res.ok) return;
        const data = await res.json();
        document.getElementById('cfg-rate').textContent = \`1 INR = \${data.rate} Coins\`;
        document.getElementById('cfg-items').textContent = \`\${data.activeProducts} items\`;
        document.getElementById('cfg-orders').textContent = \`\${data.pendingOrders} pending / \${data.reviewOrders} review\`;
        document.getElementById('cfg-upi').textContent = data.upiId || 'Not Set';
        document.getElementById('server-rate-input').value = data.rate || 1;
      } catch (e) {}
    }

    // ─── DROPBOXES MANAGEMENT (/dropbox) ───
    let cachedAdminDropboxes = [];

    async function loadAdminDropboxes() {
      try {
        const res = await fetch(\`/api/admin/dropboxes?guildId=\${currentGuildId}\`);
        if (!res.ok) return;
        const data = await res.json();
        cachedAdminDropboxes = data.dropboxes || [];
        const tbody = document.getElementById('admin-dropboxes-table');

        if (!data.dropboxes || data.dropboxes.length === 0) {
          tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: var(--muted);">No dropboxes created for this server yet.</td></tr>';
          return;
        }

        tbody.innerHTML = data.dropboxes.map(d => {
          const isCompleted = d.status === 'completed' || d.completedDrops >= d.totalDrops;
          const statusBadge = isCompleted
            ? '<span class="admin-status-badge status-completed">● COMPLETED</span>'
            : d.status === 'active'
            ? '<span class="admin-status-badge status-active">● ACTIVE</span>'
            : '<span class="admin-status-badge status-ready">● READY</span>';

          const modeBadge = d.distributionMode === 'ranked'
            ? '<span style="display:inline-block; font-size:10px; font-weight:700; color:#38bdf8; background:rgba(56,189,248,0.15); border:1px solid rgba(56,189,248,0.3); border-radius:4px; padding:1px 6px; margin-top:3px;">⚡ RANKED</span>'
            : '<span style="display:inline-block; font-size:10px; font-weight:700; color:#a78bfa; background:rgba(167,139,250,0.15); border:1px solid rgba(167,139,250,0.3); border-radius:4px; padding:1px 6px; margin-top:3px;">🤝 EQUAL</span>';
          const capText = d.maxClaimants > 0 ? ('<div style="font-size:11px; color:var(--muted); margin-top:2px;">Cap: <strong>' + esc(d.maxClaimants) + '</strong></div>') : '';

          return \`
            <tr>
              <td>
                <code style="font-family: monospace; font-size: 12px; color: #c4b5fd;">\${esc(d.eventId)}</code>
                <div>\${modeBadge}</div>
              </td>
              <td>
                <span style="font-weight: 700; color: #fbbf24; display: inline-flex; align-items: center; gap: 4px;">\${d.coins} \${COIN_ICON_HTML}</span>
                \${capText}
              </td>
              <td>\${d.completedDrops} / \${d.totalDrops}</td>
              <td>\${esc(d.intervalStr || d.interval + 'm')}</td>
              <td>\${esc(d.claimDurationStr || d.claimDuration + 'm')}</td>
              <td>\${statusBadge}</td>
              <td style="text-align: right;">
                <div style="display: inline-flex; gap: 6px; align-items: center; justify-content: flex-end;">
                  \${d.status === 'ready' ? \`
                    <button class="btn-gold btn-sm" style="padding: 5px 10px; font-size: 11px;" onclick="startDropbox('\${esc(d.eventId)}')">▶ Start</button>
                  \` : ''}
                  <button class="admin-btn-danger-outline" onclick="deleteDropbox('\${esc(d.eventId)}')">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          \`;
        }).join('');
      } catch (e) {}
    }

    async function cancelDropbox(eventId) {
      const reason = prompt('Enter cancellation reason for this dropbox event:') || 'Cancelled via Admin Dashboard';
      try {
        const res = await fetch('/api/admin/dropbox/cancel', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ eventId, reason })
        });
        const data = await res.json();
        if (res.ok) {
          showToast(\`Dropbox event \${eventId} cancelled.\`);
          loadAdminDropboxes();
        } else {
          showToast(data.error || 'Failed to cancel dropbox', true);
        }
      } catch (e) {}
    }

    async function deleteDropbox(eventId) {
      if (!confirm(\`Are you sure you want to permanently delete Dropbox event \${eventId} from the database? This cannot be undone.\`)) {
        return;
      }
      try {
        const res = await fetch('/api/admin/dropbox/delete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ eventId })
        });
        const data = await res.json();
        if (res.ok) {
          showToast(\`Dropbox event \${eventId} deleted from database.\`);
          loadAdminDropboxes();
        } else {
          showToast(data.error || 'Failed to delete dropbox event', true);
        }
      } catch (e) {
        showToast('Network error deleting dropbox', true);
      }
    }

    async function clearCompletedDropboxes() {
      if (!confirm('Are you sure you want to delete all completed and cancelled dropbox events for this server from the database?')) {
        return;
      }
      try {
        const res = await fetch('/api/admin/dropbox/clear-completed', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ guildId: currentGuildId })
        });
        const data = await res.json();
        if (res.ok) {
          showToast(\`Deleted \${data.count || 0} ended dropbox events.\`);
          loadAdminDropboxes();
        } else {
          showToast(data.error || 'Failed to clear completed dropboxes', true);
        }
      } catch (e) {
        showToast('Network error clearing dropboxes', true);
      }
    }

    async function startDropbox(eventId) {
      if (!confirm(\`Are you sure you want to start Dropbox event \${eventId}? Drop #1 will be published immediately in the configured drop channel!\`)) {
        return;
      }
      try {
        const res = await fetch('/api/admin/dropbox/start', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ eventId })
        });
        const data = await res.json();
        if (res.ok) {
          showToast(\`🚀 Dropbox event \${eventId} started successfully!\`);
          loadAdminDropboxes();
        } else {
          showToast(data.error || 'Failed to start dropbox', true);
        }
      } catch (e) {
        showToast('Network error starting dropbox', true);
      }
    }

    function toggleDropChannelField(prefix) {
      const mode = document.getElementById(\`\${prefix}-channel-mode\`)?.value;
      const container = document.getElementById(\`\${prefix}-channel-container\`);
      if (container) {
        container.style.display = mode === 'random' ? 'none' : 'block';
      }
    }

    async function openCreateDropboxModal() {
      await loadGuildChannels();
      document.getElementById('dropbox-target-server').textContent = currentGuildName;
      toggleDropChannelField('dbx');
      document.getElementById('dropbox-modal').classList.add('active');
    }

    async function openEditDropboxModal(eventId) {
      await loadGuildChannels();
      const event = (cachedAdminDropboxes || []).find(e => e.eventId === eventId);
      if (!event) return showToast('Event not found in cache', true);

      document.getElementById('edit-dbx-id').value = event.eventId;
      document.getElementById('edit-dbx-display-id').textContent = event.eventId;
      document.getElementById('edit-dbx-coins').value = event.coins;
      document.getElementById('edit-dbx-total').value = event.totalDrops;
      document.getElementById('edit-dbx-interval').value = event.intervalStr;
      document.getElementById('edit-dbx-claim').value = event.claimDurationStr;
      document.getElementById('edit-dbx-desc').value = event.description || '';
      document.getElementById('edit-dbx-image').value = event.imageUrl || '';

      const distSelect = document.getElementById('edit-dbx-dist-mode');
      if (distSelect) distSelect.value = event.distributionMode || 'ranked';

      const maxClaimantsInput = document.getElementById('edit-dbx-max-claimants');
      if (maxClaimantsInput) maxClaimantsInput.value = event.maxClaimants || 0;

      const modeSelect = document.getElementById('edit-dbx-channel-mode');
      if (modeSelect) modeSelect.value = event.channelMode || 'specific';
      toggleDropChannelField('edit-dbx');

      const dropSelect = document.getElementById('edit-dbx-channel');
      if (dropSelect && event.dropChannelId) dropSelect.value = event.dropChannelId;

      const logSelect = document.getElementById('edit-dbx-log-channel');
      if (logSelect && event.logChannelId) logSelect.value = event.logChannelId;

      document.getElementById('edit-dropbox-modal').classList.add('active');
    }

    async function handleSaveDropboxEdit(e) {
      e.preventDefault();
      const eventId = document.getElementById('edit-dbx-id').value;
      const coins = Number(document.getElementById('edit-dbx-coins').value);
      const totalDrops = Number(document.getElementById('edit-dbx-total').value);
      const interval = document.getElementById('edit-dbx-interval').value.trim();
      const claimDuration = document.getElementById('edit-dbx-claim').value.trim();
      const channelMode = document.getElementById('edit-dbx-channel-mode').value;
      const dropChannelId = document.getElementById('edit-dbx-channel').value;
      const logChannelId = document.getElementById('edit-dbx-log-channel').value;
      const description = document.getElementById('edit-dbx-desc').value.trim();
      const imageUrl = document.getElementById('edit-dbx-image').value.trim();
      const distributionMode = document.getElementById('edit-dbx-dist-mode')?.value || 'ranked';
      const maxClaimants = Number(document.getElementById('edit-dbx-max-claimants')?.value) || 0;

      try {
        const res = await fetch('/api/admin/dropbox/edit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            eventId,
            coins,
            totalDrops,
            interval,
            claimDuration,
            channelMode,
            dropChannelId,
            logChannelId: logChannelId || dropChannelId,
            description,
            imageUrl,
            distributionMode,
            maxClaimants
          })
        });
        const data = await res.json();
        if (res.ok) {
          showToast(\`Dropbox event \${eventId} updated successfully!\`);
          closeModal('edit-dropbox-modal');
          loadAdminDropboxes();
        } else {
          showToast(data.error || 'Failed to update dropbox event', true);
        }
      } catch (err) {
        showToast('Network error saving dropbox edit', true);
      }
    }

    async function handleCreateDropbox(e) {
      e.preventDefault();
      const coins = Number(document.getElementById('dbx-coins').value);
      const totalDrops = Number(document.getElementById('dbx-total').value);
      const interval = document.getElementById('dbx-interval').value.trim();
      const claimDuration = document.getElementById('dbx-claim').value.trim();
      const channelMode = document.getElementById('dbx-channel-mode').value;
      const dropChannelId = document.getElementById('dbx-channel').value;
      const logChannelId = document.getElementById('dbx-log-channel').value;
      const description = document.getElementById('dbx-desc').value.trim();
      const imageUrl = document.getElementById('dbx-image').value.trim();
      const startMode = document.getElementById('dbx-start-mode').value;
      const distributionMode = document.getElementById('dbx-dist-mode')?.value || 'ranked';
      const maxClaimants = Number(document.getElementById('dbx-max-claimants')?.value) || 0;

      try {
        const res = await fetch('/api/admin/dropbox/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            guildId: currentGuildId,
            coins,
            totalDrops,
            interval,
            claimDuration,
            channelMode,
            dropChannelId: channelMode === 'specific' ? dropChannelId : null,
            logChannelId: logChannelId || dropChannelId,
            description,
            imageUrl,
            startMode,
            distributionMode,
            maxClaimants
          })
        });
        const data = await res.json();
        if (res.ok) {
          showToast(\`Dropbox event #\${data.eventId} launched successfully!\`);
          closeModal('dropbox-modal');
          loadAdminDropboxes();
        } else {
          showToast(data.error || 'Failed to launch dropbox', true);
        }
      } catch (e) {
        showToast('Network error creating dropbox', true);
      }
    }

    // ─── ROLES & CHANNELS LOADER ───
    let currentServerRoles = [];
    let currentServerChannels = [];

    async function loadGuildRoles() {
      try {
        const res = await fetch(\`/api/admin/roles?guildId=\${currentGuildId}\`);
        if (!res.ok) return;
        const data = await res.json();
        currentServerRoles = data.roles || [];

        const prodRoleSelect = document.getElementById('prod-role-id');
        const editRoleSelect = document.getElementById('edit-prod-role-id');
        const optionsHtml = '<option value="">No Role Assigned</option>' +
          currentServerRoles.map(r => \`<option value="\${r.id}">@\${r.name}</option>\`).join('');

        if (prodRoleSelect) prodRoleSelect.innerHTML = optionsHtml;
        if (editRoleSelect) editRoleSelect.innerHTML = optionsHtml;
      } catch (e) {}
    }

    async function loadGuildChannels() {
      try {
        const res = await fetch(\`/api/admin/channels?guildId=\${currentGuildId}\`);
        if (!res.ok) return;
        const data = await res.json();
        currentServerChannels = data.channels || [];

        const optionsHtml = currentServerChannels.length > 0
          ? currentServerChannels.map(c => \`<option value="\${c.id}">#\${c.name}</option>\`).join('')
          : '<option value="">No text channels found</option>';

        const chSelect = document.getElementById('dbx-channel');
        if (chSelect) chSelect.innerHTML = optionsHtml;

        const logSelect = document.getElementById('dbx-log-channel');
        if (logSelect) logSelect.innerHTML = optionsHtml;

        const editChSelect = document.getElementById('edit-dbx-channel');
        if (editChSelect) editChSelect.innerHTML = optionsHtml;

        const editLogSelect = document.getElementById('edit-dbx-log-channel');
        if (editLogSelect) editLogSelect.innerHTML = optionsHtml;
      } catch (e) {}
    }

    // ─── PRODUCTS MANAGEMENT (/create-item, /edit-item, /delete-item) ───
    let cachedAdminProducts = [];

    async function loadAdminProducts() {
      try {
        const res = await fetch(\`/api/admin/products?guildId=\${currentGuildId}\`);
        if (!res.ok) return;
        const data = await res.json();
        cachedAdminProducts = data.products || [];
        const tbody = document.getElementById('admin-products-table');

        const selectAll = document.getElementById('admin-prod-select-all');
        if (selectAll) { selectAll.checked = false; selectAll.indeterminate = false; }
        updateAdminProductBulkSelection();

        if (cachedAdminProducts.length === 0) {
          tbody.innerHTML = '<tr><td colspan="9" style="text-align: center; color: var(--muted); padding: 24px;">No products found for this server.</td></tr>';
          return;
        }

        tbody.innerHTML = cachedAdminProducts.map(p => {
          const iconDisplay = p.imageUrl
            ? \`<img src="\${esc(p.imageUrl)}" style="width: 24px; height: 24px; border-radius: 6px; object-fit: cover;">\`
            : \`<span style="font-size: 18px;">\${p.icon || '👑'}</span>\`;
          const typeLabel = p.behaviorType === 'role_temporary' ? 'Role Purchase' : (p.type || 'Role Purchase');
          const stockDisplay = p.stock === null || p.stock === undefined
            ? '<span style="color: var(--muted); font-size: 11px;">Unlimited</span>'
            : p.stock;

          return \`
            <tr data-prodid="\${esc(p._id)}" data-name="\${esc((p.name || '').toLowerCase())}" data-role="\${esc((p.roleId || '').toLowerCase())}" data-type="\${esc((typeLabel || '').toLowerCase())}" data-coins="\${p.coins || 0}">
              <td style="text-align: center;">
                <input type="checkbox" class="admin-prod-checkbox" value="\${esc(p._id)}" onchange="updateAdminProductBulkSelection()" style="cursor: pointer; width: 16px; height: 16px; accent-color: var(--accent); vertical-align: middle;">
              </td>
              <td><strong style="font-size: 13px; color: var(--text-heading);">\${esc(p.name)}</strong></td>
              <td>\${iconDisplay}</td>
              <td><span style="font-weight: 700; color: #fbbf24; display: inline-flex; align-items: center; gap: 4px;">\${p.coins} \${COIN_ICON_HTML}</span></td>
              <td>\${stockDisplay}</td>
              <td>
                <div>
                  \${p.roleId ? \`<div style="font-size: 11px; color: #a78bfa; font-family: monospace;">Role: \${esc(p.roleId)}</div>\` : ''}
                  <div style="font-size: 11px; color: var(--muted);">\${esc(p.duration || 'Permanent')}</div>
                </div>
              </td>
              <td><span class="admin-type-pill">\${esc(typeLabel)}</span></td>
              <td>
                <span style="display: inline-flex; align-items: center; gap: 5px; font-size: 12px; font-weight: 600; color: \${p.active ? '#10b981' : '#ef4444'};">
                  ● \${p.active ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td style="text-align: right;">
                <div style="display: inline-flex; gap: 6px; align-items: center; justify-content: flex-end;">
                  <button class="admin-btn-action-dark" onclick="inspectProductDetails('\${esc(p._id)}')" title="View Item Details">👁️ View</button>
                  <button class="admin-btn-action-purple" onclick="openEditProductModal('\${esc(p._id)}')">✏️ Edit</button>
                  <button class="admin-btn-danger-outline" onclick="deleteProduct('\${esc(p._id)}')">🗑️ Delete</button>
                </div>
              </td>
            </tr>
          \`;
        }).join('');

        const currentSearch = document.getElementById('admin-products-search')?.value || '';
        if (currentSearch) {
          filterAdminProducts(currentSearch);
        }
      } catch (e) {
        console.error('loadAdminProducts error:', e);
      }
    }

    async function openCreateProductModal() {
      await loadGuildRoles();
      document.getElementById('product-modal').classList.add('active');
    }

    async function handleCreateProduct(e) {
      e.preventDefault();
      const name = document.getElementById('prod-name').value;
      const coins = document.getElementById('prod-coins').value;
      const description = document.getElementById('prod-desc').value;
      const imageUrl = document.getElementById('prod-img').value;
      const stock = document.getElementById('prod-stock').value;
      const behaviorType = document.getElementById('prod-behavior').value;
      const roleId = document.getElementById('prod-role-id').value;
      const duration = document.getElementById('prod-duration').value;

      try {
        const res = await fetch('/api/admin/product/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name,
            coins,
            description,
            imageUrl,
            stock,
            behaviorType,
            roleId,
            duration,
            guildId: currentGuildId
          })
        });
        const data = await res.json();
        if (res.ok) {
          showToast('Item created successfully!');
          closeModal('product-modal');
          loadAdminProducts();
          loadShop();
        } else {
          showToast(data.error || 'Failed to create item', true);
        }
      } catch (e) {}
    }

    async function openEditProductModal(productId) {
      await loadGuildRoles();
      const p = cachedAdminProducts.find(item => item._id === productId);
      if (!p) return;

      document.getElementById('edit-prod-id').value = p._id;
      document.getElementById('edit-prod-name').value = p.name;
      document.getElementById('edit-prod-coins').value = p.coins;
      document.getElementById('edit-prod-stock').value = p.stock !== null ? p.stock : '';
      document.getElementById('edit-prod-behavior').value = p.behaviorType || 'role_permanent';
      document.getElementById('edit-prod-active').value = p.active ? 'true' : 'false';
      document.getElementById('edit-prod-role-id').value = p.roleId || '';
      document.getElementById('edit-prod-duration').value = p.duration || '';
      document.getElementById('edit-prod-desc').value = p.description || '';
      document.getElementById('edit-prod-img').value = p.imageUrl || '';

      document.getElementById('edit-product-modal').classList.add('active');
    }

    async function handleEditProduct(e) {
      e.preventDefault();
      const id = document.getElementById('edit-prod-id').value;
      const name = document.getElementById('edit-prod-name').value.trim();
      const coins = Number(document.getElementById('edit-prod-coins').value);
      const stock = document.getElementById('edit-prod-stock').value;
      const behaviorType = document.getElementById('edit-prod-behavior').value;
      const active = document.getElementById('edit-prod-active').value === 'true';
      const roleId = document.getElementById('edit-prod-role-id').value;
      const duration = document.getElementById('edit-prod-duration').value.trim();
      const description = document.getElementById('edit-prod-desc').value.trim();
      const imageUrl = document.getElementById('edit-prod-img').value.trim();

      try {
        const res = await fetch('/api/admin/product/edit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id,
            name,
            coins,
            stock: stock === '' ? null : Number(stock),
            behaviorType,
            active,
            roleId,
            duration,
            description,
            imageUrl
          })
        });
        const data = await res.json();
        if (res.ok) {
          showToast('Product updated successfully!');
          closeModal('edit-product-modal');
          loadAdminProducts();
          loadShop();
        } else {
          showToast(data.error || 'Failed to update item', true);
        }
      } catch (e) {
        showToast('Network error updating product', true);
      }
    }

    async function deleteProduct(id) {
      if (!confirm('Are you sure you want to permanently delete this item from the database?')) return;
      try {
        const res = await fetch('/api/admin/product/delete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id })
        });
        const data = await res.json();
        if (res.ok && data.success) {
          showToast('Item permanently deleted from database!');
          loadAdminProducts();
          loadShop();
        } else {
          showToast(data.error || 'Failed to delete item', true);
        }
      } catch (e) {
        showToast('Network error deleting item', true);
      }
    }

    // ─── PRODUCTS FILTER & BULK ACTIONS ───
    function filterAdminProducts(query) {
      const q = (query || '').toLowerCase().trim();
      const tbody = document.getElementById('admin-products-table');
      if (!tbody) return;
      const rows = tbody.querySelectorAll('tr');
      let visibleCount = 0;
      let totalRows = 0;

      rows.forEach(tr => {
        if (tr.id === 'admin-products-search-empty') return;
        totalRows++;
        const name = (tr.getAttribute('data-name') || '').toLowerCase();
        const role = (tr.getAttribute('data-role') || '').toLowerCase();
        const type = (tr.getAttribute('data-type') || '').toLowerCase();
        const coins = (tr.getAttribute('data-coins') || '').toLowerCase();
        const text = tr.textContent.toLowerCase();

        const match = !q || name.includes(q) || role.includes(q) || type.includes(q) || coins.includes(q) || text.includes(q);
        tr.style.display = match ? '' : 'none';
        if (match) visibleCount++;
      });

      const existingEmpty = document.getElementById('admin-products-search-empty');
      if (totalRows > 0 && visibleCount === 0 && q) {
        if (!existingEmpty) {
          const tr = document.createElement('tr');
          tr.id = 'admin-products-search-empty';
          tr.innerHTML = \`<td colspan="9" style="text-align: center; color: var(--muted); padding: 32px 14px;">
            <div style="font-size: 15px; font-weight: 700; color: var(--text-heading); margin-bottom: 6px;">🔍 No items found matching "\${esc(query)}"</div>
            <div style="font-size: 12px;">Try searching with a different item name, role, or price.</div>
          </td>\`;
          tbody.appendChild(tr);
        }
      } else if (existingEmpty) {
        existingEmpty.remove();
      }

      updateAdminProductBulkSelection();
    }

    function toggleSelectAllAdminProducts(checked) {
      const tbody = document.getElementById('admin-products-table');
      if (!tbody) return;
      const rows = tbody.querySelectorAll('tr');
      rows.forEach(tr => {
        if (tr.style.display !== 'none' && tr.id !== 'admin-products-search-empty') {
          const cb = tr.querySelector('.admin-prod-checkbox');
          if (cb) cb.checked = checked;
        }
      });
      updateAdminProductBulkSelection();
    }

    function updateAdminProductBulkSelection() {
      const tbody = document.getElementById('admin-products-table');
      const selectAll = document.getElementById('admin-prod-select-all');
      const bulkBtn = document.getElementById('admin-bulk-delete-btn');
      const countSpan = document.getElementById('admin-selected-count');
      if (!tbody) return;

      const visibleCheckboxes = Array.from(tbody.querySelectorAll('tr'))
        .filter(tr => tr.style.display !== 'none' && tr.id !== 'admin-products-search-empty')
        .map(tr => tr.querySelector('.admin-prod-checkbox'))
        .filter(Boolean);

      const allCheckboxes = Array.from(tbody.querySelectorAll('.admin-prod-checkbox'));
      const checkedBoxes = allCheckboxes.filter(cb => cb.checked);
      const checkedCount = checkedBoxes.length;

      if (bulkBtn) {
        bulkBtn.style.display = checkedCount > 0 ? 'inline-flex' : 'none';
      }

      if (countSpan) {
        countSpan.textContent = checkedCount;
      }

      if (selectAll) {
        const visibleChecked = visibleCheckboxes.filter(cb => cb.checked);
        if (visibleCheckboxes.length > 0 && visibleChecked.length === visibleCheckboxes.length) {
          selectAll.checked = true;
          selectAll.indeterminate = false;
        } else if (visibleChecked.length > 0) {
          selectAll.checked = false;
          selectAll.indeterminate = true;
        } else {
          selectAll.checked = false;
          selectAll.indeterminate = false;
        }
      }
    }

    async function bulkDeleteSelectedProducts() {
      const tbody = document.getElementById('admin-products-table');
      if (!tbody) return;
      const checkedBoxes = Array.from(tbody.querySelectorAll('.admin-prod-checkbox:checked'));
      const ids = checkedBoxes.map(cb => cb.value).filter(Boolean);

      if (ids.length === 0) {
        showToast('Please select at least one item to delete.', true);
        return;
      }

      const confirmMsg = \`Are you sure you want to permanently delete \${ids.length} selected item(s) from the database?\`;
      if (!confirm(confirmMsg)) return;

      try {
        const res = await fetch('/api/admin/product/delete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ids })
        });
        const data = await res.json();
        if (res.ok && data.success) {
          showToast(\`\${data.deletedCount || ids.length} item(s) permanently deleted from database!\`);
          loadAdminProducts();
          loadShop();
        } else {
          showToast(data.error || 'Failed to delete selected items', true);
        }
      } catch (e) {
        showToast('Network error deleting items', true);
      }
    }

    // ─── ORDERS FILTER & INSPECT (/order) ───
    function filterAdminOrders(query) {
      const q = (query || '').toLowerCase().trim();
      const tbody = document.getElementById('admin-orders-table');
      if (!tbody) return;
      const rows = tbody.querySelectorAll('tr');
      let visibleCount = 0;
      let totalRows = 0;

      rows.forEach(tr => {
        if (tr.id === 'admin-orders-search-empty') return;
        totalRows++;
        const userId = (tr.getAttribute('data-userid') || '').toLowerCase();
        const orderId = (tr.getAttribute('data-orderid') || '').toLowerCase();
        const username = (tr.getAttribute('data-username') || '').toLowerCase();
        const tag = (tr.getAttribute('data-tag') || '').toLowerCase();
        const text = tr.textContent.toLowerCase();

        const match = !q || userId.includes(q) || orderId.includes(q) || username.includes(q) || tag.includes(q) || text.includes(q);
        tr.style.display = match ? '' : 'none';
        if (match) visibleCount++;
      });

      const existingEmpty = document.getElementById('admin-orders-search-empty');
      if (totalRows > 0 && visibleCount === 0 && q) {
        if (!existingEmpty) {
          const tr = document.createElement('tr');
          tr.id = 'admin-orders-search-empty';
          tr.innerHTML = \`<td colspan="7" style="text-align: center; color: var(--muted); padding: 32px 14px;">
            <div style="font-size: 15px; font-weight: 700; color: var(--text-heading); margin-bottom: 6px;">🔍 No orders found matching "\${esc(query)}"</div>
            <div style="font-size: 12px; color: var(--muted);">Search matches Discord User ID (e.g. <code>527598635009836448</code>), buyer username, or Order ID.</div>
          </td>\`;
          tbody.appendChild(tr);
        }
      } else if (existingEmpty) {
        existingEmpty.remove();
      }
    }

    async function inspectOrder(orderId) {
      try {
        const res = await fetch(\`/api/admin/order-inspect?orderId=\${encodeURIComponent(orderId)}\`);
        const data = await res.json();
        if (!res.ok || !data.order) return showToast('Order details not found', true);

        const o = data.order;
        const body = document.getElementById('order-inspect-body');
        body.innerHTML = \`
          <div style="background: rgba(255,255,255,0.03); padding: 14px; border-radius: 12px; margin-bottom: 12px;">
            <p><strong>Order ID:</strong> <code>\${o.orderId}</code></p>
            <p><strong>Server:</strong> 🏰 \${o.guildName || o.guildId}</p>
            <p><strong>User:</strong> \${o.username || o.userId} (<code>\${o.userId}</code>)</p>
            <p><strong>Type:</strong> \${o.type}</p>
            <p><strong>Amount (INR):</strong> ₹\${(o.amountInr || 0).toFixed(2)}</p>
            <p><strong>Coins:</strong> \${o.coins} \${COIN_ICON_HTML}</p>
            <p><strong>Status:</strong> <span class="status-pill status-\${o.status}">\${o.status}</span></p>
            <p><strong>Bank RRN / UTR:</strong> <code>\${o.rrn || 'N/A'}</code></p>
            <p><strong>Verification Source:</strong> \${o.verificationSource || 'N/A'}</p>
            <p><strong>Created:</strong> \${new Date(o.createdAt).toLocaleString()}</p>
            \${o.paidAt ? \`<p><strong>Paid At:</strong> \${new Date(o.paidAt).toLocaleString()}</p>\` : ''}
            \${o.rejectionReason ? \`<p style="color: #f87171;"><strong>Rejection Reason:</strong> \${o.rejectionReason}</p>\` : ''}
          </div>
        \`;
        document.getElementById('order-inspect-modal').classList.add('active');
      } catch (e) {
        showToast('Error inspecting order', true);
      }
    }

    // ─── COINS ADJUSTMENT (/give-coins, /remove-coins) ───
    async function handleCoinAdjust(e) {
      e.preventDefault();
      const targetUserId = document.getElementById('adj-target-id').value.trim();
      const coins = Number(document.getElementById('adj-amount').value);
      const action = document.getElementById('adj-action').value;
      const reason = document.getElementById('adj-reason').value.trim();

      try {
        const res = await fetch('/api/admin/coins/adjust', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ targetUserId, coins, action, reason, guildId: currentGuildId })
        });
        const data = await res.json();
        if (res.ok) {
          showToast(\`Successfully \${action === 'give' ? 'granted' : 'deducted'} coins in \${currentGuildName}!\`);
          document.getElementById('adj-target-id').value = '';
          document.getElementById('adj-amount').value = '';
          loadUserData();
          if (lastInspectedUserId === targetUserId) {
            handleInspectUser();
          }
        } else {
          showToast(data.error || 'Failed to adjust coins', true);
        }
      } catch (e) {}
    }

    // ─── RATE UPDATER (/set-rate) ───
    async function loadAdminRate() {
      try {
        const res = await fetch(\`/api/admin/rate?guildId=\${currentGuildId}\`);
        if (!res.ok) return;
        const data = await res.json();
        document.getElementById('server-rate-input').value = data.rate || 1;
      } catch (e) {}
    }

    async function handleUpdateRate(e) {
      e.preventDefault();
      const rate = Number(document.getElementById('server-rate-input').value);
      try {
        const res = await fetch(\`/api/admin/rate?guildId=\${currentGuildId}\`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ rate, guildId: currentGuildId })
        });
        if (res.ok) {
          showToast(\`Rate updated to 1 INR = \${rate} coins for \${currentGuildName}!\`);
          loadAdminConfig();
        } else {
          showToast('Failed to update rate', true);
        }
      } catch (e) {}
    }

    // ─── BOT OWNER ACTIONS ───
    let allOwnerAdmins = [];
    let allOwnerGuilds = [];
    let currentGuildFilter = 'all';
    let currentGuildSearch = '';
    let ownerModalTxState = {
      page: 1,
      limit: 10,
      totalPages: 1,
      totalCount: 0,
      search: '',
      type: '',
      status: ''
    };
    let modalTxSearchTimer = null;

    // 1. System Telemetry
    async function loadOwnerSystemStats() {
      try {
        const res = await fetch('/api/owner/system-stats');
        if (!res.ok) return;
        const data = await res.json();
        
        // Memory (RSS)
        const rssEl = document.getElementById('owner-metric-rss');
        const rssPctEl = document.getElementById('owner-metric-rss-pct');
        const rssBarEl = document.getElementById('owner-metric-rss-bar');
        if (rssEl) rssEl.textContent = (data.rssMb || 180) + ' MB';
        if (rssPctEl) rssPctEl.textContent = (data.rssPercent || 36) + '%';
        if (rssBarEl) rssBarEl.style.width = Math.min(data.rssPercent || 36, 100) + '%';

        // Gateway Ping
        const pingEl = document.getElementById('owner-metric-ping');
        const pingBadgeEl = document.getElementById('owner-metric-ping-badge');
        if (pingEl) pingEl.textContent = (data.ping || 0) + ' ms';
        if (pingBadgeEl) {
          pingBadgeEl.textContent = data.pingStatus || (data.ping < 200 ? 'Good' : 'High');
          pingBadgeEl.style.color = (data.ping < 200 ? '#10b981' : '#f59e0b');
        }

        // System Uptime
        const uptimeEl = document.getElementById('owner-metric-uptime');
        if (uptimeEl) {
          const mins = Math.floor((data.uptimeSec || 0) / 60);
          uptimeEl.textContent = mins + ' min';
        }

        // Node.js Version
        const nodeEl = document.getElementById('owner-metric-node');
        if (nodeEl) nodeEl.textContent = data.nodeVersion || 'v24.19.0';
      } catch (e) {
        console.error('Error loading owner system stats:', e);
      }
    }

    // 2. Global Bot Administrators Directory
    async function loadOwnerAdmins() {
      const tbody = document.getElementById('owner-admins-tbody');
      if (!tbody) return;
      tbody.innerHTML = '<tr><td colspan="5" class="owner-table-loading">Loading administrators...</td></tr>';
      try {
        const res = await fetch('/api/owner/admins');
        if (!res.ok) {
          tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: #ef4444; padding: 20px;">Failed to load administrators.</td></tr>';
          return;
        }
        const data = await res.json();
        allOwnerAdmins = Array.isArray(data.admins) ? data.admins : (data.admins?.dbAdmins || []);
        renderOwnerAdmins(allOwnerAdmins);
      } catch (e) {
        console.error('Error loading owner admins:', e);
        if (tbody) tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: #ef4444; padding: 20px;">Network error loading admins.</td></tr>';
      }
    }

    function renderOwnerAdmins(admins) {
      const tbody = document.getElementById('owner-admins-tbody');
      if (!tbody) return;

      if (!admins || admins.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: var(--muted); padding: 24px;">No administrators found matching criteria.</td></tr>';
        return;
      }

      tbody.innerHTML = admins.map(a => {
        const isOwner = a.isOwner || a.isProtected || a.role === 'owner';
        const avatarUrl = a.avatar || 'https://cdn.discordapp.com/embed/avatars/0.png';
        const displayUser = a.username || a.userId;
        const note = a.note || (isOwner ? 'Super-Administrator' : 'Bot Admin');
        const addedBy = a.addedBy || 'Environment(.env)';

        return \`
          <tr>
            <td>
              <code class="owner-id-pill" title="Click to copy ID">\${a.userId}</code>
            </td>
            <td>
              <div style="display: flex; align-items: center; gap: 8px;">
                <img src="\${avatarUrl}" style="width: 24px; height: 24px; border-radius: 50%; object-fit: cover; border: 1px solid rgba(255,255,255,0.15);" onerror="this.src='https://cdn.discordapp.com/embed/avatars/0.png'">
                <strong class="owner-user-title">\${displayUser}</strong>
                \${isOwner ? '<span class="owner-badge-crown">👑 Owner</span>' : ''}
              </div>
            </td>
            <td style="color: var(--muted); font-size: 12px;">\${addedBy}</td>
            <td style="color: var(--text-main, #334155); font-size: 12px;">\${note}</td>
            <td style="text-align: right;">
              \${isOwner
                ? '<span class="owner-btn-protected">Protected</span>'
                : '<button class="owner-btn-remove" onclick="removeBotAdmin(\\\'' + a.userId + '\\\', \\\'' + displayUser.replace(/'/g, "\\\\'") + '\\\')">🗑️ Remove</button>'
              }
            </td>
          </tr>
        \`;
      }).join('');
    }

    function filterOwnerAdmins(query) {
      const q = (query || '').toLowerCase().trim();
      if (!q) {
        renderOwnerAdmins(allOwnerAdmins);
        return;
      }
      const filtered = allOwnerAdmins.filter(a =>
        (a.userId && a.userId.toLowerCase().includes(q)) ||
        (a.username && a.username.toLowerCase().includes(q)) ||
        (a.note && a.note.toLowerCase().includes(q)) ||
        (a.addedBy && a.addedBy.toLowerCase().includes(q))
      );
      renderOwnerAdmins(filtered);
    }

    function openAddAdminModal() {
      const idInp = document.getElementById('new-admin-id');
      const userInp = document.getElementById('new-admin-user');
      const noteInp = document.getElementById('new-admin-note');
      if (idInp) idInp.value = '';
      if (userInp) userInp.value = '';
      if (noteInp) noteInp.value = '';
      const modal = document.getElementById('admin-modal');
      if (modal) modal.classList.add('active');
    }

    async function handleAddAdmin(e) {
      e.preventDefault();
      const userId = (document.getElementById('new-admin-id')?.value || '').trim();
      const username = (document.getElementById('new-admin-user')?.value || '').trim();
      const note = (document.getElementById('new-admin-note')?.value || '').trim();

      if (!/^[0-9]{16,21}$/.test(userId)) {
        return showToast('Please enter a valid 16-21 digit Discord User ID', true);
      }

      showToast('Adding bot administrator...');
      try {
        const res = await fetch('/api/owner/admin/add', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, username, note })
        });
        const data = await res.json();
        if (res.ok && data.success) {
          showToast('✅ Administrator added successfully!');
          closeModal('admin-modal');
          loadOwnerAdmins();
        } else {
          showToast(data.error || 'Failed to add administrator', true);
        }
      } catch (err) {
        showToast('Network error adding administrator', true);
      }
    }

    async function removeBotAdmin(userId, username) {
      if (!confirm(\`Are you sure you want to remove administrator "\${username}" (\${userId})?\`)) return;
      showToast('Removing administrator...');
      try {
        const res = await fetch('/api/owner/admin/remove', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId })
        });
        const data = await res.json();
        if (res.ok && data.success) {
          showToast('✅ Administrator removed successfully.');
          loadOwnerAdmins();
        } else {
          showToast(data.error || 'Failed to remove administrator', true);
        }
      } catch (err) {
        showToast('Network error removing administrator', true);
      }
    }

    // 3. Server Coin Transactions (Dashboard Table)
    function formatTxType(type, reason) {
      const t = String(type || '').toUpperCase();
      if (t === 'ADD') return 'Add Coins';
      if (t === 'REMOVE') return 'Remove Coins';
      if (t === 'PURCHASE') return 'Purchase';
      if (t === 'ORDER_PAYMENT') return 'Order Payment';
      if (t === 'GIFT') return 'Coin Gift';
      if (t === 'TRANSFER') return 'Transfer';
      if (t === 'REFUND') return 'Refund';
      if (t === 'ADMIN_ADJUST') return 'Admin Adjust';
      return type || reason || 'Transaction';
    }

    function formatOwnerDate(dtStr) {
      if (!dtStr) return '-';
      const d = new Date(dtStr);
      if (isNaN(d.getTime())) return '-';
      const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
      const month = months[d.getMonth()];
      const day = d.getDate();
      const year = d.getFullYear();
      const hours = String(d.getHours()).padStart(2, '0');
      const mins = String(d.getMinutes()).padStart(2, '0');
      return \`\${month} \${day}, \${year} \${hours}:\${mins}\`;
    }

    async function loadOwnerTransactions(limit = 5) {
      const tbody = document.getElementById('owner-transactions-tbody');
      if (!tbody) return;

      const guildLabel = document.getElementById('owner-tx-guild-label');
      if (guildLabel) guildLabel.textContent = currentGuildName || 'Selected Server';

      try {
        const guildParam = currentGuildId ? \`&guildId=\${encodeURIComponent(currentGuildId)}\` : '';
        const res = await fetch(\`/api/owner/transactions?limit=\${limit}\${guildParam}\`);
        if (!res.ok) {
          tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: #ef4444; padding: 20px;">Failed to load transactions.</td></tr>';
          return;
        }
        const data = await res.json();
        const txs = data.transactions || [];
        if (txs.length === 0) {
          const sName = currentGuildName || 'this server';
          tbody.innerHTML = \`<tr><td colspan="7" style="text-align: center; color: var(--muted); padding: 24px;">No coin transactions recorded in <strong>\${sName}</strong>.</td></tr>\`;
          return;
        }

        tbody.innerHTML = txs.map((t, idx) => {
          const isPos = (t.coins || 0) >= 0;
          const amtFormatted = isPos ? \`+\${t.coins.toLocaleString()}\` : \`-\${Math.abs(t.coins).toLocaleString()}\`;
          const amtClass = isPos ? 'amt-pos' : 'amt-neg';
          const typeName = formatTxType(t.type, t.reason);
          const dt = formatOwnerDate(t.createdAt);
          const status = t.status || 'success';
          const isFailed = status === 'failed';
          const statusText = isFailed ? 'Failed' : 'Success';

          return \`
            <tr style="cursor: pointer;" onclick="inspectOwnerTransactionDetail('\${t.id}')" title="Click to view transaction audit details">
              <td style="color: var(--muted); font-size: 12px;">\${idx + 1}</td>
              <td style="font-weight: 600; color: #e2e8f0;">\${t.serverName || t.guildName || 'Global'}</td>
              <td style="color: #cbd5e1; font-size: 13px;">\${t.username || t.userId}</td>
              <td style="color: var(--muted); font-size: 12px;">\${typeName}</td>
              <td><span class="\${amtClass}">\${amtFormatted}</span></td>
              <td style="color: var(--muted); font-size: 12px; white-space: nowrap;">\${dt}</td>
              <td style="text-align: right;">
                <span class="owner-status-pill \${isFailed ? 'status-left' : 'status-active'}">
                  <span class="owner-status-dot"></span>\${statusText}
                </span>
              </td>
            </tr>
          \`;
        }).join('');
      } catch (e) {
        console.error('Error loading owner transactions:', e);
        if (tbody) tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: #ef4444; padding: 20px;">Network error loading transactions.</td></tr>';
      }
    }

    // 4. All Transactions Modal & CSV Export
    function openAllTransactionsModal() {
      const modal = document.getElementById('all-transactions-modal');
      if (!modal) return;
      modal.classList.add('active');
      const searchInp = document.getElementById('owner-modal-tx-search');
      const typeSel = document.getElementById('owner-modal-tx-type');
      const statusSel = document.getElementById('owner-modal-tx-status');
      if (searchInp) searchInp.value = '';
      if (typeSel) typeSel.value = '';
      if (statusSel) statusSel.value = '';
      loadOwnerModalTransactions(1);
    }

    function debounceModalTxSearch() {
      clearTimeout(modalTxSearchTimer);
      modalTxSearchTimer = setTimeout(() => {
        loadOwnerModalTransactions(1);
      }, 300);
    }

    async function loadOwnerModalTransactions(page = 1) {
      const tbody = document.getElementById('owner-modal-tx-tbody');
      if (!tbody) return;
      tbody.innerHTML = '<tr><td colspan="10" class="owner-table-loading">Loading transactions...</td></tr>';

      const search = (document.getElementById('owner-modal-tx-search')?.value || '').trim();
      const type = document.getElementById('owner-modal-tx-type')?.value || '';
      const status = document.getElementById('owner-modal-tx-status')?.value || '';

      ownerModalTxState.page = page;
      ownerModalTxState.search = search;
      ownerModalTxState.type = type;
      ownerModalTxState.status = status;

      try {
        const queryParams = new URLSearchParams({
          page: page,
          limit: ownerModalTxState.limit,
          search: search,
          type: type,
          status: status
        });
        if (currentGuildId) {
          queryParams.set('guildId', currentGuildId);
        }

        const res = await fetch(\`/api/owner/transactions?\${queryParams.toString()}\`);
        if (!res.ok) {
          tbody.innerHTML = '<tr><td colspan="10" style="text-align: center; color: #ef4444; padding: 20px;">Failed to fetch ledger transactions.</td></tr>';
          return;
        }

        const data = await res.json();
        const txs = data.transactions || [];
        const total = data.total || 0;
        const totalPages = data.totalPages || 1;
        ownerModalTxState.totalPages = totalPages;
        ownerModalTxState.totalCount = total;

        // Update count & page labels
        const countEl = document.getElementById('owner-modal-tx-count');
        const pageEl = document.getElementById('owner-modal-tx-page-info');
        const prevBtn = document.getElementById('owner-modal-tx-prev');
        const nextBtn = document.getElementById('owner-modal-tx-next');

        if (countEl) {
          const start = total === 0 ? 0 : (page - 1) * ownerModalTxState.limit + 1;
          const end = Math.min(page * ownerModalTxState.limit, total);
          countEl.textContent = \`Showing \${start} - \${end} of \${total.toLocaleString()} transactions\`;
        }
        if (pageEl) pageEl.textContent = \`Page \${page} of \${totalPages}\`;
        if (prevBtn) prevBtn.disabled = page <= 1;
        if (nextBtn) nextBtn.disabled = page >= totalPages;

        if (txs.length === 0) {
          tbody.innerHTML = '<tr><td colspan="10" style="text-align: center; color: var(--muted); padding: 28px;">No transactions found matching your criteria.</td></tr>';
          return;
        }

        tbody.innerHTML = txs.map((t, idx) => {
          const rowNum = (page - 1) * ownerModalTxState.limit + idx + 1;
          const isPos = (t.coins || 0) >= 0;
          const amtFormatted = isPos ? \`+\${t.coins.toLocaleString()}\` : \`-\${Math.abs(t.coins).toLocaleString()}\`;
          const amtClass = isPos ? 'amt-pos' : 'amt-neg';
          const typeName = formatTxType(t.type, t.reason);
          const dt = formatOwnerDate(t.createdAt);
          const status = t.status || 'success';
          const isFailed = status === 'failed';
          const prevBal = (t.previousBalance != null) ? t.previousBalance.toLocaleString() : '-';
          const newBal = (t.newBalance != null) ? t.newBalance.toLocaleString() : '-';

          return \`
            <tr>
              <td style="color: var(--muted); font-size: 12px;">\${rowNum}</td>
              <td style="font-weight: 600; color: #fff;">\${t.serverName || t.guildName || 'Global'}</td>
              <td>
                <div style="font-size: 13px; font-weight: 600; color: #e2e8f0;">\${t.username || t.userId}</div>
                <div style="font-size: 11px; color: var(--muted); font-family: monospace;">\${t.userId}</div>
              </td>
              <td><span style="background: rgba(255,255,255,0.06); padding: 2px 7px; border-radius: 4px; font-size: 11px;">\${typeName}</span></td>
              <td><span class="\${amtClass}">\${amtFormatted}</span></td>
              <td style="color: var(--muted); font-size: 12px;">\${prevBal}</td>
              <td style="color: #cbd5e1; font-size: 12px; font-weight: 600;">\${newBal}</td>
              <td style="color: var(--muted); font-size: 12px; white-space: nowrap;">\${dt}</td>
              <td>
                <span class="owner-status-pill \${isFailed ? 'status-left' : 'status-active'}">
                  <span class="owner-status-dot"></span>\${isFailed ? 'Failed' : 'Success'}
                </span>
              </td>
              <td style="text-align: right;">
                <button class="btn-owner-refresh" style="padding: 4px 10px; font-size: 11px;" onclick="inspectOwnerTransactionDetail('\${t.id}')">Inspect</button>
              </td>
            </tr>
          \`;
        }).join('');
      } catch (e) {
        console.error('Error loading modal transactions:', e);
        if (tbody) tbody.innerHTML = '<tr><td colspan="10" style="text-align: center; color: #ef4444; padding: 20px;">Network error loading transactions.</td></tr>';
      }
    }

    function prevModalTxPage() {
      if (ownerModalTxState.page > 1) {
        loadOwnerModalTransactions(ownerModalTxState.page - 1);
      }
    }

    function nextModalTxPage() {
      if (ownerModalTxState.page < ownerModalTxState.totalPages) {
        loadOwnerModalTransactions(ownerModalTxState.page + 1);
      }
    }

    function exportOwnerTransactionsCsv() {
      const search = (document.getElementById('owner-modal-tx-search')?.value || '').trim();
      const type = document.getElementById('owner-modal-tx-type')?.value || '';
      const status = document.getElementById('owner-modal-tx-status')?.value || '';
      const params = new URLSearchParams({
        export: 'csv',
        search,
        type,
        status
      });
      if (currentGuildId) {
        params.set('guildId', currentGuildId);
      }
      window.location.href = \`/api/owner/transactions?\${params.toString()}\`;
    }

    // 5. Connected Discord Servers
    async function loadOwnerGuilds() {
      const tbody = document.getElementById('owner-guilds-tbody');
      if (!tbody) return;
      tbody.innerHTML = '<tr><td colspan="6" class="owner-table-loading">Loading connected servers...</td></tr>';
      try {
        const res = await fetch('/api/owner/guilds');
        if (!res.ok) {
          tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: #ef4444; padding: 20px;">Failed to load connected servers.</td></tr>';
          return;
        }
        const data = await res.json();
        allOwnerGuilds = data.guilds || [];
        renderOwnerGuilds();
      } catch (e) {
        console.error('Error loading owner guilds:', e);
        if (tbody) tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: #ef4444; padding: 20px;">Network error loading servers.</td></tr>';
      }
    }

    function renderOwnerGuilds() {
      const tbody = document.getElementById('owner-guilds-tbody');
      if (!tbody) return;

      let list = allOwnerGuilds;

      // Status Filter
      if (currentGuildFilter === 'active') {
        list = list.filter(g => g.status === 'active');
      } else if (currentGuildFilter === 'left') {
        list = list.filter(g => g.status === 'left' || g.status === 'disconnected');
      }

      // Search Filter
      if (currentGuildSearch) {
        const q = currentGuildSearch.toLowerCase();
        list = list.filter(g =>
          (g.guildName && g.guildName.toLowerCase().includes(q)) ||
          (g.guildId && g.guildId.toLowerCase().includes(q))
        );
      }

      if (list.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: var(--muted); padding: 24px;">No Discord servers found matching criteria.</td></tr>';
        return;
      }

      tbody.innerHTML = list.map(g => {
        const isActive = g.status === 'active';
        const iconUrl = g.iconUrl || g.icon || 'https://cdn.discordapp.com/embed/avatars/0.png';
        const memberCount = (g.memberCount || 0).toLocaleString();
        const lastActive = g.lastActiveAt ? new Date(g.lastActiveAt).toLocaleDateString() : (g.updatedAt ? new Date(g.updatedAt).toLocaleDateString() : 'N/A');

        return \`
          <tr style="cursor: pointer;" onclick="inspectServer('\${g.guildId}')" title="Click to view server details and coin statistics">
            <td>
              <div style="display: flex; align-items: center; gap: 10px;">
                <img src="\${iconUrl}" class="owner-guild-avatar" onerror="this.src='https://cdn.discordapp.com/embed/avatars/0.png'">
                <strong class="owner-user-title">\${g.guildName || 'Unknown Server'}</strong>
              </div>
            </td>
            <td>
              <code class="owner-id-pill" onclick="event.stopPropagation()" title="Click to copy ID">\${g.guildId}</code>
            </td>
            <td style="color: var(--text-main, #334155); font-size: 13px; font-weight: 600;">\${memberCount}</td>
            <td>
              <span class="owner-status-pill \${isActive ? 'status-active' : 'status-left'}">
                <span class="owner-status-dot"></span>\${isActive ? 'Active' : 'Left'}
              </span>
            </td>
            <td style="color: var(--muted); font-size: 12px;">\${lastActive}</td>
            <td style="text-align: right;" onclick="event.stopPropagation()">
              <button class="btn-owner-refresh" style="padding: 5px 10px; font-size: 11px; margin-right: 6px;" onclick="inspectServer('\${g.guildId}')">Inspect</button>
              \${!isActive
                ? '<button class="owner-btn-delete" style="padding: 5px 10px; font-size: 11px; margin-right: 6px; background: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.45); color: #ef4444; border-radius: 6px; cursor: pointer; font-weight: 700; transition: all 0.2s;" onclick="deleteServerPermanently(\\\'' + g.guildId + '\\\', \\\'' + encodeURIComponent(g.guildName || 'Unknown Server') + '\\\')">🗑️ Delete</button>'
                : '<button class="owner-btn-wipe" onclick="openClearServerModal(\\\'all\\\', \\\'' + g.guildId + '\\\', \\\'' + encodeURIComponent(g.guildName || 'Unknown Server') + '\\\')">🗑️ Wipe Server</button>'
              }
            </td>
          </tr>
        \`;
      }).join('');
    }

    function filterOwnerGuilds(query) {
      currentGuildSearch = (query || '').trim();
      renderOwnerGuilds();
    }

    function setGuildFilter(status, btn) {
      currentGuildFilter = status;
      document.querySelectorAll('.owner-filter-tabs .filter-tab-btn').forEach(b => b.classList.remove('active'));
      if (btn) btn.classList.add('active');
      renderOwnerGuilds();
    }

    function formatInspectorDateTime(dateStr) {
      if (!dateStr) return { date: '-', time: '' };
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return { date: '-', time: '' };
      const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
      const dateFormatted = \`\${d.getDate()} \${months[d.getMonth()]} \${d.getFullYear()}\`;
      let hours = d.getHours();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12 || 12;
      const mins = String(d.getMinutes()).padStart(2, '0');
      const secs = String(d.getSeconds()).padStart(2, '0');
      const timeFormatted = \`\${hours}:\${mins}:\${secs} \${ampm}\`;
      return { date: dateFormatted, time: timeFormatted };
    }

    function escapeOwnerHtml(str) {
      if (str == null) return '';
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }

    // 6. Server Details Inspector Modal
    async function inspectServer(guildId) {
      if (!guildId) return;
      const modal = document.getElementById('server-details-modal');
      if (modal) modal.classList.add('active');

      const nameEl = document.getElementById('srv-det-name');
      const idEl = document.getElementById('srv-det-id');
      const membersEl = document.getElementById('srv-det-members');
      const iconEl = document.getElementById('srv-det-icon');
      const statusBadge = document.getElementById('srv-det-status-badge');
      const coinsEl = document.getElementById('srv-det-coins');
      const usersEl = document.getElementById('srv-det-users');
      const txCountEl = document.getElementById('srv-det-tx-count');
      const volEl = document.getElementById('srv-det-volume');
      const topHoldersEl = document.getElementById('srv-det-top-wallets');
      const recentTxEl = document.getElementById('srv-det-recent-tx');
      const wipeBtn = document.getElementById('srv-det-wipe-btn');
      const deleteBtn = document.getElementById('srv-det-delete-btn');

      if (nameEl) nameEl.textContent = 'Loading server...';
      if (topHoldersEl) topHoldersEl.innerHTML = '<div style="color: var(--muted); font-size: 12px; text-align: center; padding: 12px;">Loading holders...</div>';
      if (recentTxEl) recentTxEl.innerHTML = '<tr><td colspan="4" class="owner-table-loading">Loading recent transactions...</td></tr>';

      try {
        const res = await fetch(\`/api/owner/guild-details?guildId=\${encodeURIComponent(guildId)}\`);
        if (!res.ok) {
          if (nameEl) nameEl.textContent = 'Failed to load server details';
          return;
        }
        const data = await res.json();
        const g = data.guild || {};
        const stats = data.stats || {};
        const holders = data.topHolders || [];
        const recentTxs = data.recentTransactions || [];

        if (nameEl) nameEl.textContent = g.guildName || 'Unknown Server';
        if (idEl) idEl.textContent = g.guildId || guildId;
        if (membersEl) membersEl.textContent = \`\${(g.memberCount || 0).toLocaleString()} members\`;
        if (iconEl) iconEl.src = g.iconUrl || g.icon || 'https://cdn.discordapp.com/embed/avatars/0.png';

        if (statusBadge) {
          const isActive = g.status === 'active';
          statusBadge.className = \`owner-status-pill \${isActive ? 'status-active' : 'status-left'}\`;
          statusBadge.innerHTML = \`<span class="owner-status-dot"></span>\${isActive ? 'Active' : 'Left'}\`;
        }

        if (coinsEl) coinsEl.textContent = \`\${(stats.totalCoins || 0).toLocaleString()} 🪙\`;
        if (usersEl) usersEl.textContent = \`\${(stats.userCount || 0).toLocaleString()} users\`;
        if (txCountEl) txCountEl.textContent = \`\${(stats.totalTransactions || 0).toLocaleString()}\`;
        if (volEl) volEl.textContent = \`+\${(stats.coinsEarned || 0).toLocaleString()} / -\${(stats.coinsSpent || 0).toLocaleString()}\`;

        if (wipeBtn) {
          wipeBtn.onclick = () => openClearServerModal('all', g.guildId || guildId, encodeURIComponent(g.guildName || 'Server'));
        }

        if (deleteBtn) {
          const isLeft = g.status !== 'active';
          deleteBtn.style.display = isLeft ? 'inline-block' : 'none';
          deleteBtn.onclick = () => deleteServerPermanently(g.guildId || guildId, encodeURIComponent(g.guildName || 'Server'));
        }

        // Top Coin Holders with Avatars, Usernames & Discord IDs
        if (topHoldersEl) {
          if (holders.length === 0) {
            topHoldersEl.innerHTML = '<div style="color: var(--muted); font-size: 12px; text-align: center; padding: 16px;">No active coin holders in this server.</div>';
          } else {
            const medals = ['🥇', '🥈', '🥉', '4.', '5.'];
            topHoldersEl.innerHTML = holders.map((h, i) => {
              const avatar = h.avatarUrl || 'https://cdn.discordapp.com/embed/avatars/0.png';
              const uname = escapeOwnerHtml(h.username || \`User_\${(h.userId || '').slice(-4)}\`);
              const uid = escapeOwnerHtml(h.userId || '');
              const bal = (h.balance != null ? h.balance : (h.coins || 0)).toLocaleString();

              return \`
                <div class="server-details-holder-row">
                  <div style="display: flex; align-items: center; gap: 10px;">
                    <span style="font-size: 16px; min-width: 22px; text-align: center;">\${medals[i] || (i + 1) + '.'}</span>
                    <img src="\${avatar}" class="server-details-user-avatar" onerror="this.src='https://cdn.discordapp.com/embed/avatars/0.png'">
                    <div>
                      <div class="server-details-user-name">\${uname}</div>
                      <code class="server-details-id-pill" title="Click to copy Discord ID" onclick="navigator.clipboard.writeText('\${uid}'); showToast('📋 Copied Discord ID!')">🆔 \${uid}</code>
                    </div>
                  </div>
                  <div style="font-weight: 800; color: #fbbf24; font-size: 13px; text-align: right; white-space: nowrap;">
                    \${bal} 🪙
                  </div>
                </div>
              \`;
            }).join('');
          }
        }

        // Recent Transactions with User Avatars, Discord IDs, and Formatted Date & Time
        if (recentTxEl) {
          if (recentTxs.length === 0) {
            recentTxEl.innerHTML = '<tr><td colspan="4" style="text-align: center; color: var(--muted); padding: 18px;">No recent transactions for this server.</td></tr>';
          } else {
            recentTxEl.innerHTML = recentTxs.map(t => {
              const isPos = (t.coins || 0) >= 0;
              const amtFormatted = isPos ? \`+\${(t.coins || 0).toLocaleString()}\` : \`-\${Math.abs(t.coins || 0).toLocaleString()}\`;
              const amtClass = isPos ? 'amt-pos' : 'amt-neg';
              const typeName = formatTxType(t.type, t.reason);

              let typeClass = 'type-purchase';
              const lowType = (t.type || '').toLowerCase();
              if (lowType.includes('grant') || lowType.includes('credit')) typeClass = 'type-grant';
              else if (lowType.includes('deduct') || lowType.includes('wipe')) typeClass = 'type-deduct';
              else if (lowType.includes('dropbox') || lowType.includes('reward')) typeClass = 'type-reward';

              const dt = formatInspectorDateTime(t.createdAt || t.date);
              const avatar = t.avatarUrl || 'https://cdn.discordapp.com/embed/avatars/0.png';
              const uname = escapeOwnerHtml(t.username || \`User_\${(t.userId || '').slice(-4)}\`);
              const uid = escapeOwnerHtml(t.userId || '');

              return \`
                <tr>
                  <td>
                    <div style="display: flex; align-items: center; gap: 8px;">
                      <img src="\${avatar}" class="server-details-user-avatar" onerror="this.src='https://cdn.discordapp.com/embed/avatars/0.png'">
                      <div>
                        <div class="server-details-user-name">\${uname}</div>
                        <code class="server-details-id-pill" title="Click to copy Discord ID" onclick="navigator.clipboard.writeText('\${uid}'); showToast('📋 Copied Discord ID!')">🆔 \${uid}</code>
                      </div>
                    </div>
                  </td>
                  <td><span class="server-details-type-pill \${typeClass}">\${typeName}</span></td>
                  <td><span class="\${amtClass}" style="font-weight: 800; font-size: 12px;">\${amtFormatted} 🪙</span></td>
                  <td>
                    <div class="server-details-datetime">
                      <span class="server-details-date">\${dt.date}</span>
                      <span class="server-details-time">\${dt.time}</span>
                    </div>
                  </td>
                </tr>
              \`;
            }).join('');
          }
        }
      } catch (err) {
        console.error('Error fetching server details:', err);
      }
    }

    // 7. Transaction Audit Inspector
    async function inspectOwnerTransactionDetail(txId) {
      if (!txId) return;
      const modal = document.getElementById('tx-detail-modal');
      const body = document.getElementById('tx-modal-body');
      if (!modal || !body) return;

      body.innerHTML = \`
        <div style="text-align: center; padding: 28px; color: var(--muted);">
          <div style="display: inline-block; animation: spin 1s linear infinite; margin-bottom: 8px;">⏳</div>
          <div>Loading transaction audit record...</div>
        </div>
      \`;
      modal.classList.add('active');

      try {
        const res = await fetch(\`/api/owner/transactions?search=\${encodeURIComponent(txId)}&limit=1\`);
        if (!res.ok) throw new Error('Failed to load transaction');
        const data = await res.json();
        const tx = (data.transactions && data.transactions[0]) ? data.transactions[0] : null;

        if (!tx) {
          body.innerHTML = '<div style="text-align: center; color: #ef4444; padding: 20px;">Transaction record not found.</div>';
          return;
        }

        const isPos = (tx.coins || 0) >= 0;
        const refCode = tx.orderId || tx.rrn || tx.id || 'N/A';
        const typeName = formatTxType(tx.type, tx.reason);
        const dt = formatOwnerDate(tx.createdAt);
        const status = tx.status || 'success';

        body.innerHTML = \`
          <div style="background: rgba(124, 58, 237, 0.12); border: 1px solid rgba(124, 58, 237, 0.3); border-radius: 12px; padding: 12px 16px; display: flex; align-items: center; justify-content: space-between;">
            <div>
              <div style="font-size: 11px; text-transform: uppercase; color: var(--muted); font-weight: 700; letter-spacing: 0.05em;">Transaction Reference</div>
              <div style="font-family: monospace; font-size: 15px; font-weight: 800; color: #a78bfa; margin-top: 2px;">#\${refCode}</div>
            </div>
            <button class="btn-owner-refresh" style="padding: 5px 10px; font-size: 11px;" onclick="navigator.clipboard.writeText('\${refCode}'); showToast('📋 Copied Code!')">
              📋 Copy
            </button>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
            <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 10px; padding: 10px 14px;">
              <div style="font-size: 11px; color: var(--muted); text-transform: uppercase; font-weight: 700;">Server Scope</div>
              <div style="font-weight: 700; color: var(--text-heading, #fff); font-size: 13px; margin-top: 2px;">🏰 \${tx.guildName || 'Global'}</div>
              <div style="font-size: 10px; color: var(--muted); font-family: monospace;">\${tx.guildId || ''}</div>
            </div>
            <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 10px; padding: 10px 14px;">
              <div style="font-size: 11px; color: var(--muted); text-transform: uppercase; font-weight: 700;">User Account</div>
              <div style="font-weight: 700; color: var(--text-heading, #fff); font-size: 13px; margin-top: 2px;">👤 \${tx.username || tx.userId}</div>
              <div style="font-size: 10px; color: var(--muted); font-family: monospace;">\${tx.userId || ''}</div>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
            <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 10px; padding: 10px 14px;">
              <div style="font-size: 11px; color: var(--muted); text-transform: uppercase; font-weight: 700;">Coin Change</div>
              <div style="font-size: 18px; font-weight: 800; color: \${isPos ? '#10b981' : '#ef4444'}; margin-top: 2px;">
                \${isPos ? '+' : ''}\${Number(tx.coins || 0).toLocaleString()} 🪙
              </div>
            </div>
            <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 10px; padding: 10px 14px;">
              <div style="font-size: 11px; color: var(--muted); text-transform: uppercase; font-weight: 700;">Category</div>
              <div style="font-weight: 700; font-size: 13px; color: #a78bfa; margin-top: 4px;">\${typeName}</div>
            </div>
          </div>

          <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 10px; padding: 10px 14px;">
            <div style="font-size: 11px; color: var(--muted); text-transform: uppercase; font-weight: 700;">Balance Audit</div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 4px; font-size: 13px;">
              <span>Previous: <strong style="color: var(--text-main, #cbd5e1);">\${(tx.previousBalance != null) ? tx.previousBalance.toLocaleString() : 'N/A'}</strong></span>
              <span>&rarr;</span>
              <span>New: <strong style="color: #fbbf24;">\${(tx.newBalance != null) ? tx.newBalance.toLocaleString() : 'N/A'}</strong></span>
            </div>
          </div>

          <div style="display: flex; justify-content: space-between; align-items: center; font-size: 12px; color: var(--muted); padding: 4px 6px;">
            <span>Timestamp: <strong style="color: var(--text-main, #cbd5e1);">\${dt}</strong></span>
            <span>Status: <span class="owner-status-pill \${status === 'failed' ? 'status-left' : 'status-active'}"><span class="owner-status-dot"></span>\${status.toUpperCase()}</span></span>
          </div>
        \`;
      } catch (err) {
        body.innerHTML = \`<div style="text-align: center; color: #ef4444; padding: 20px;">Error: \${err.message}</div>\`;
      }
    }

    // 8. Global Header Search (Ctrl+K) & Sidebar Toggle
    function toggleSidebar(forceClose) {
      const sidebar = document.querySelector('.app-sidebar');
      const main = document.querySelector('.app-main');
      const backdrop = document.getElementById('sidebar-backdrop');
      const isMobile = window.innerWidth <= 768;

      if (isMobile) {
        const isOpen = sidebar && sidebar.classList.contains('mobile-open');
        if (forceClose === true || isOpen) {
          if (sidebar) sidebar.classList.remove('mobile-open');
          if (backdrop) backdrop.classList.remove('active');
          document.body.classList.remove('sidebar-open-scroll-lock');
        } else {
          if (sidebar) sidebar.classList.add('mobile-open');
          if (backdrop) backdrop.classList.add('active');
          document.body.classList.add('sidebar-open-scroll-lock');
        }
      } else {
        if (sidebar) sidebar.classList.toggle('collapsed');
        if (main) main.classList.toggle('sidebar-collapsed');
      }
    }

    // ─── PERMANENT SERVER DELETION (WEB & DB) ───
    async function deleteServerPermanently(guildId, encodedName) {
      if (!guildId) return;
      var serverName = decodeURIComponent(encodedName || 'Server');
      var ok = confirm('Are you sure you want to PERMANENTLY delete "' + serverName + '" (' + guildId + ') from both the Web Dashboard and the Database?\\n\\nThis will completely erase the server footprint and it will no longer appear anywhere.');
      if (!ok) return;

      try {
        var res = await fetch('/api/owner/delete-guild?guildId=' + encodeURIComponent(guildId), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ guildId: guildId })
        });
        var data = await res.json().catch(function() { return {}; });

        if (res.ok && data.success) {
          showToast('Server permanently removed from DB & Web!');
          closeModal('server-details-modal');
          loadOwnerGuilds();
        } else {
          showToast('Failed to delete server: ' + (data.error || 'Server error'), true);
        }
      } catch (err) {
        showToast('Network error deleting server: ' + err.message, true);
      }
    }

    // Global Header & Sidebar Toggle

    // ─── SERVER DATA CLEAR & RESET (/clearserver) ───
    let clearServerAction = {
      type: 'all',
      guildId: '',
      guildName: ''
    };

    async function loadServerClearStats() {
      if (!currentGuildId) return;
      try {
        const res = await fetch(\`/api/admin/server-stats?guildId=\${currentGuildId}\`);
        if (!res.ok) return;
        const data = await res.json();
        const s = data.stats || {};
        const setVal = (id, val) => {
          const el = document.getElementById(id);
          if (el) el.textContent = (val || 0).toLocaleString();
        };
        setVal('stat-wallets', s.wallets);
        setVal('stat-products', s.products);
        setVal('stat-orders', s.orders);
        setVal('stat-ledgers', s.ledgers);
        setVal('stat-inventories', s.inventories);
        setVal('stat-dropboxes', s.dropboxes);
        setVal('stat-total', s.total);
      } catch (e) {
        console.error('Error loading server clear stats:', e);
      }
    }

    function openClearServerModal(type = 'all', overrideGuildId = null, overrideGuildName = null) {
      const gId = overrideGuildId || currentGuildId;
      const gName = overrideGuildName ? decodeURIComponent(overrideGuildName) : currentGuildName;

      if (!gId) {
        showToast('Please select a server first.', true);
        return;
      }

      clearServerAction = {
        type,
        guildId: gId,
        guildName: gName
      };

      const titleEl = document.getElementById('clear-modal-title');
      const subEl = document.getElementById('clear-modal-subtitle');
      const warnEl = document.getElementById('clear-modal-warning');
      const inputEl = document.getElementById('clear-confirm-input');
      const btnEl = document.getElementById('clear-modal-confirm-btn');

      inputEl.value = '';
      btnEl.disabled = true;
      btnEl.style.opacity = '0.5';
      btnEl.style.cursor = 'not-allowed';

      let typeLabel = 'All Data & Footprint';
      let desc = \`All member coin balances, shop items, order records, audit ledgers, and configurations for <strong>\${gName}</strong> (<code>\${gId}</code>) will be <strong>PERMANENTLY PURGED</strong>.\`;

      if (type === 'wallets') {
        typeLabel = 'Wallets & Inventories';
        desc = \`All member coin balances, item inventory collections, activations, and manual claims for <strong>\${gName}</strong> will be reset to zero.\`;
      } else if (type === 'orders') {
        typeLabel = 'Orders & Ledgers';
        desc = \`All UPI & Coin order records, payment audit slips, and ledger transaction history for <strong>\${gName}</strong> will be permanently deleted.\`;
      } else if (type === 'dropboxes') {
        typeLabel = 'Dropbox Events';
        desc = \`All active, scheduled, and completed coin dropboxes, drops, and claim history for <strong>\${gName}</strong> will be wiped.\`;
      } else if (type === 'products') {
        typeLabel = 'Shop Catalogue';
        desc = \`All shop products and catalog items created for <strong>\${gName}</strong> will be permanently deleted.\`;
      }

      titleEl.textContent = \`Clear \${typeLabel}\`;
      subEl.textContent = \`Target Server: \${gName} (\${gId})\`;
      warnEl.innerHTML = \`⚠️ <strong>Warning:</strong> \${desc}<br><br>🚨 This action is <strong>IRREVERSIBLE</strong>!\`;

      document.getElementById('clear-server-modal').classList.add('active');
      setTimeout(() => inputEl.focus(), 100);
    }

    function validateClearInput() {
      const val = document.getElementById('clear-confirm-input').value.trim();
      const btnEl = document.getElementById('clear-modal-confirm-btn');
      if (val === 'CONFIRM') {
        btnEl.disabled = false;
        btnEl.style.opacity = '1';
        btnEl.style.cursor = 'pointer';
      } else {
        btnEl.disabled = true;
        btnEl.style.opacity = '0.5';
        btnEl.style.cursor = 'not-allowed';
      }
    }

    async function executeClearServer() {
      const inputVal = document.getElementById('clear-confirm-input').value.trim();
      if (inputVal !== 'CONFIRM') return;

      const { type, guildId, guildName } = clearServerAction;
      const btnEl = document.getElementById('clear-modal-confirm-btn');
      btnEl.disabled = true;
      btnEl.textContent = '⏳ Clearing Data...';

      try {
        const res = await fetch(\`/api/admin/clear-server?guildId=\${guildId}\`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ guildId, clearType: type })
        });
        const data = await res.json();
        if (res.ok && data.success) {
          showToast(\`Server data cleared successfully! (\${data.totalDeleted || 0} records purged)\`);
          closeModal('clear-server-modal');
          // Refresh active views
          loadServerClearStats();
          loadAdminOrders();
          loadAdminProducts();
          loadAdminDropboxes();
          loadUserData();
          loadShop();
          if (document.getElementById('owner-tab')?.classList.contains('active')) {
            loadOwnerGuilds();
          }
        } else {
          showToast(data.error || 'Failed to clear server data.', true);
        }
      } catch (e) {
        showToast('Error communicating with server.', true);
      } finally {
        btnEl.textContent = '🗑️ Permanently Delete';
        btnEl.disabled = false;
      }
    }

    // ─── 3D INTERACTIVE TILT & DYNAMIC DEPTH ───
    (function setup3DTilt() {
      let isThrottled = false;
      document.addEventListener('mousemove', (e) => {
        if (isThrottled) return;
        isThrottled = true;
        requestAnimationFrame(() => {
          isThrottled = false;
          const interactiveCards = document.querySelectorAll('.card, .product-card, .inspect-server-card, .server-bar, header');
          interactiveCards.forEach(card => {
            const rect = card.getBoundingClientRect();
            if (e.clientX >= rect.left - 20 && e.clientX <= rect.right + 20 &&
                e.clientY >= rect.top - 20 && e.clientY <= rect.bottom + 20) {
              const x = e.clientX - rect.left;
              const y = e.clientY - rect.top;
              const centerX = rect.width / 2;
              const centerY = rect.height / 2;
              const rotateX = ((y - centerY) / centerY) * -3.5;
              const rotateY = ((x - centerX) / centerX) * 3.5;
              card.style.transform = 'perspective(1000px) rotateX(' + rotateX.toFixed(2) + 'deg) rotateY(' + rotateY.toFixed(2) + 'deg) translateY(-3px)';
            } else {
              if (card.style.transform && card.style.transform.indexOf('rotateX') !== -1) {
                card.style.transform = '';
              }
            }
          });
        });
      });
    })();

    // ─── 1-CLICK CLIPBOARD COPY FOR DISCORD IDS ───
    document.addEventListener('click', (e) => {
      const codeEl = e.target.closest('code');
      if (codeEl && codeEl.textContent) {
        const text = codeEl.textContent.trim();
        if (/^[0-9]{16,21}$/.test(text)) {
          navigator.clipboard.writeText(text).then(() => {
            showToast('📋 Copied ID: ' + text);
          }).catch(() => {});
        }
      }
    });

    // Start UI
    initTheme();
    initGuilds();
    setTimeout(() => {
      const hash = (window.location.hash || '').replace('#', '');
      if (hash && document.getElementById(hash + '-tab')) {
        switchTab(hash + '-tab');
      }
    }, 150);
    window.addEventListener('hashchange', () => {
      const hash = (window.location.hash || '').replace('#', '');
      if (hash && document.getElementById(hash + '-tab')) {
        switchTab(hash + '-tab');
      }
    });
  </script>`;
}
