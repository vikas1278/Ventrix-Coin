import config from '../config.js';
import { getMemberTier, getTierTheme } from '../utils/common.js';

import { getIcons } from './ui-parts/icons.js';
import { renderLoginPage } from './ui-parts/login.js';
import { getBaseStyles } from './ui-parts/styles-base.js';
import { getResponsiveStyles } from './ui-parts/styles-responsive.js';
import { getHeadOpen, getBodyOpen } from './ui-parts/html-shell.js';
import { getDashboardTabHtml } from './ui-parts/tab-dashboard.js';
import { getWalletTabHtml } from './ui-parts/tab-wallet.js';
import { getShopTabHtml } from './ui-parts/tab-shop.js';
import { getOrdersTabHtml } from './ui-parts/tab-orders.js';
import { getTransactionsTabHtml } from './ui-parts/tab-transactions.js';
import { getAdminTabHtml } from './ui-parts/tab-admin.js';
import { getOwnerTabHtml } from './ui-parts/tab-owner.js';
import { getSettingsTabHtml } from './ui-parts/tab-settings.js';
import { getModalsAndShellClose } from './ui-parts/modals.js';
import { getScripts } from './ui-parts/scripts.js';

export { renderLoginPage };

export function getCoinBadgeHtml(customSize) {
  const size = customSize || '1.25em';
  return `<img src="/assets/vyntrix-coin.png" alt="Ventrix Coin" class="coin-icon" style="width: ${size}; height: ${size}; vertical-align: -0.22em; display: inline-block; object-fit: contain; filter: drop-shadow(0 2px 6px rgba(217, 119, 6, 0.35));">`;
}

export function renderDashboardPage({ session, shopName, coinName }) {
  const role = session?.role || 'member';
  const isOwner = role === 'owner';
  const isAdmin = role === 'admin' || isOwner;
  const initialTier = getMemberTier(0, session?.userId);
  const initialTheme = getTierTheme(initialTier);
  const ICONS = getIcons();

  return (
    getHeadOpen({ shopName }) +
    '\n  <style>\n' +
    getBaseStyles() +
    '\n' +
    getResponsiveStyles() +
    '\n  </style>\n</head>\n' +
    getBodyOpen({ ICONS, session, isAdmin, isOwner }) +
    getDashboardTabHtml({ session, initialTheme, ICONS }) +
    getWalletTabHtml({ initialTheme }) +
    getShopTabHtml() +
    getOrdersTabHtml() +
    getTransactionsTabHtml() +
    getAdminTabHtml({ ICONS }) +
    getOwnerTabHtml({ isOwner, ICONS }) +
    getSettingsTabHtml({ session, ICONS }) +
    getModalsAndShellClose({ ICONS }) +
    getScripts({ session, getCoinBadgeHtml, ICONS, isAdmin, isOwner }) +
    '\n</body>\n</html>'
  );
}
