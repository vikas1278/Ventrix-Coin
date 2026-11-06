// Settings Tab HTML
export function getSettingsTabHtml({ session, ICONS }) {
  const role = session?.role || 'member';
  return `
    <!-- TAB 8: SETTINGS -->
    <div id="settings-tab" class="tab-content">
      <!-- User Profile Card -->
      <div class="card">
        <div class="card-title">
          <div class="card-title-left">
            <div class="card-icon-badge">${ICONS.users}</div>
            <div>
              <span>User Profile &amp; Authentication</span>
              <div style="font-size: 12px; color: var(--muted); font-weight: normal; margin-top: 2px;">Verified Discord OAuth2 Session</div>
            </div>
          </div>
        </div>
        <div style="display: flex; align-items: center; gap: 20px; flex-wrap: wrap; padding: 18px; background: var(--subcard-bg); border: 1px solid var(--border); border-radius: 20px;">
          <div class="avatar-ring">
            <img class="user-avatar" src="${session.avatar}" alt="Avatar" style="width: 70px; height: 70px; border-radius: 20px;">
          </div>
          <div style="flex: 1; min-width: 200px;">
            <div style="font-family: 'Outfit', sans-serif; font-size: 22px; font-weight: 800; color: var(--text-heading);">${session.username}</div>
            <div style="font-size: 13px; color: var(--muted); margin-top: 4px;">
              Discord User ID: <code>${session.userId}</code>
            </div>
            <div style="margin-top: 8px; display: flex; gap: 8px; flex-wrap: wrap; align-items: center;">
              <span class="user-role-badge role-${role}">
                ${role === 'owner' ? '👑 Bot Owner' : role === 'admin' ? '🛡️ Admin' : '👛 Member'}
              </span>
              <span class="user-role-badge" id="settings-user-tier-badge" style="display: none; align-items: center; gap: 5px; font-weight: 800;">
                ⭐ VIP Tier
              </span>
              <span class="role-pill" style="color: #10b981; border-color: rgba(16,185,129,0.3);">✔ Discord OAuth2 Session Active</span>
            </div>
          </div>
          <a href="/auth/logout" class="btn-logout" style="padding: 12px 22px; font-size: 14px;">${ICONS.logout} Log Out</a>
        </div>
      </div>

      <!-- Theme Customization Card -->
      <div class="card">
        <div class="card-title">
          <div class="card-title-left">
            <div class="card-icon-badge">${ICONS.sun}</div>
            <div>
              <span>Appearance &amp; Theme Customization</span>
              <div style="font-size: 12px; color: var(--muted); font-weight: normal; margin-top: 2px;">Liquid-glass themes saved across browser sessions</div>
            </div>
          </div>
        </div>
        <div class="theme-picker-grid">
          <div class="theme-picker-card" id="settings-theme-light" onclick="setSpecificTheme('light')">
            <div class="theme-preview-box" style="background: #f4f6fb; border: 1px solid rgba(124, 58, 237, 0.2);">
              <div style="width: 28px; height: 28px; border-radius: 8px; background: #ffffff; box-shadow: 0 4px 10px rgba(0,0,0,0.1); display: flex; align-items: center; justify-content: center; color: #7c3aed;">
                ${ICONS.sun}
              </div>
              <div style="font-size: 12px; font-weight: 800; color: #1e293b;">Lavender White Glass</div>
            </div>
            <div style="display: flex; align-items: center; justify-content: space-between;">
              <div>
                <div style="font-weight: 800; font-size: 15px; color: var(--text-heading);">Light Mode</div>
                <div style="font-size: 12px; color: var(--muted);">Soft lavender-white liquid glass</div>
              </div>
              <span class="theme-active-indicator" id="ind-light" style="font-size: 18px; color: #10b981; display: none;">✔</span>
            </div>
          </div>

          <div class="theme-picker-card" id="settings-theme-dark" onclick="setSpecificTheme('dark')">
            <div class="theme-preview-box" style="background: #07090e; border: 1px solid rgba(139, 92, 246, 0.4);">
              <div style="width: 28px; height: 28px; border-radius: 8px; background: #0e121e; border: 1px solid rgba(255,255,255,0.1); display: flex; align-items: center; justify-content: center; color: #8b5cf6;">
                ${ICONS.moon}
              </div>
              <div style="font-size: 12px; font-weight: 800; color: #f1f5f9;">Midnight Violet Glass</div>
            </div>
            <div style="display: flex; align-items: center; justify-content: space-between;">
              <div>
                <div style="font-weight: 800; font-size: 15px; color: var(--text-heading);">Dark Mode</div>
                <div style="font-size: 12px; color: var(--muted);">Deep midnight with purple/gold glow</div>
              </div>
              <span class="theme-active-indicator" id="ind-dark" style="font-size: 18px; color: #10b981; display: none;">✔</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Infrastructure & Security Diagnostics -->
      <div class="card">
        <div class="card-title">
          <div class="card-title-left">
            <div class="card-icon-badge">${ICONS.gear}</div>
            <div>
              <span>Platform &amp; Session Diagnostics</span>
              <div style="font-size: 12px; color: var(--muted); font-weight: normal; margin-top: 2px;">Security protocols and live connectivity status</div>
            </div>
          </div>
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 14px;">
          <div class="stat-tile">
            <div class="stat-label">Active Discord Guild</div>
            <div class="stat-val" style="font-size: 15px;" id="settings-guild-id">--</div>
            <div style="font-size: 11px; color: var(--muted); margin-top: 4px;">Scoped context</div>
          </div>
          <div class="stat-tile">
            <div class="stat-label">Session Security</div>
            <div class="stat-val" style="font-size: 15px; color: #10b981;">HttpOnly + Lax</div>
            <div style="font-size: 11px; color: var(--muted); margin-top: 4px;">CSRF 24-byte State Verified</div>
          </div>
          <div class="stat-tile">
            <div class="stat-label">Database Store</div>
            <div class="stat-val" style="font-size: 15px; color: #38bdf8;">MongoDB Atlas</div>
            <div style="font-size: 11px; color: var(--muted); margin-top: 4px;">COINS Database Live</div>
          </div>
        </div>
      </div>
    </div>
  `;
}
