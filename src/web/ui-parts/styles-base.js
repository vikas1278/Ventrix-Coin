// Base styles
export function getBaseStyles() {
  return `
    :root, [data-theme="dark"] {
      color-scheme: dark;
      --bg: #07090e;
      --sidebar-bg: #0b0c16;
      --header-bg: rgba(11, 12, 22, 0.88);
      --ambient-1: rgba(139, 92, 246, 0.22);
      --ambient-2: rgba(245, 158, 11, 0.16);
      --ambient-3: rgba(56, 189, 248, 0.14);
      --card: rgba(14, 18, 30, 0.75);
      --card-solid: #0e121e;
      --border: rgba(255, 255, 255, 0.08);
      --border-hover: rgba(168, 85, 247, 0.45);
      --border-accent: rgba(139, 92, 246, 0.35);
      --glass-specular: rgba(255, 255, 255, 0.12);
      --hover: rgba(255, 255, 255, 0.06);
      --accent: #8b5cf6;
      --accent-glow: rgba(139, 92, 246, 0.4);
      --accent-hover: #9d6fff;
      --gold: #f59e0b;
      --gold-glow: rgba(245, 158, 11, 0.35);
      --green: #10b981;
      --green-glow: rgba(16, 185, 129, 0.4);
      --red: #ef4444;
      --red-glow: rgba(239, 68, 68, 0.35);
      --text: #f1f5f9;
      --text-heading: #ffffff;
      --muted: #94a3b8;
      --input-bg: rgba(18, 22, 38, 0.75);
      --input-border: rgba(255, 255, 255, 0.12);
      --input-text: #ffffff;
      --dropdown-bg: #111422;
      --dropdown-text: #f8fafc;
      --server-bar-bg: rgba(16, 20, 36, 0.75);
      --modal-bg: rgba(14, 18, 30, 0.96);
      --modal-overlay: rgba(3, 5, 12, 0.82);
      --subcard-bg: rgba(255, 255, 255, 0.025);
      --stat-box-bg: rgba(0, 0, 0, 0.35);
      --table-hover: rgba(139, 92, 246, 0.08);
      --table-border: rgba(255, 255, 255, 0.06);
      --tabs-bar-bg: rgba(13, 16, 28, 0.8);
      --inspect-gradient: linear-gradient(135deg, rgba(30, 27, 75, 0.45), rgba(15, 23, 42, 0.7));
      --server-card-bg: rgba(255, 255, 255, 0.03);
      --server-card-hover: rgba(139, 92, 246, 0.12);
      --toggle-bg: rgba(255, 255, 255, 0.06);
      --toggle-border: rgba(255, 255, 255, 0.14);
      --toggle-text: #f8fafc;
      --shadow: 0 20px 50px -10px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.06);
      --shadow-3d: 0 16px 40px -10px rgba(0, 0, 0, 0.7), 0 30px 60px -12px rgba(139, 92, 246, 0.15);
      --badge-bg: rgba(255, 255, 255, 0.04);
      --badge-border: rgba(255, 255, 255, 0.08);
    }

    [data-theme="light"] {
      color-scheme: light;
      --bg: #f4f6fb;
      --sidebar-bg: #ffffff;
      --header-bg: rgba(255, 255, 255, 0.95);
      --ambient-1: rgba(139, 92, 246, 0.08);
      --ambient-2: rgba(245, 158, 11, 0.06);
      --ambient-3: rgba(56, 189, 248, 0.06);
      --card: #ffffff;
      --card-solid: #ffffff;
      --border: #e2e8f0;
      --border-hover: #cbd5e1;
      --border-accent: rgba(124, 58, 237, 0.28);
      --glass-specular: rgba(255, 255, 255, 0.95);
      --hover: rgba(15, 23, 42, 0.04);
      --accent: #7c3aed;
      --accent-glow: rgba(124, 58, 237, 0.25);
      --accent-hover: #6d28d9;
      --gold: #d97706;
      --gold-glow: rgba(217, 119, 6, 0.2);
      --green: #059669;
      --green-glow: rgba(5, 150, 105, 0.2);
      --red: #dc2626;
      --red-glow: rgba(220, 38, 38, 0.2);
      --text: #1e293b;
      --text-heading: #0f172a;
      --muted: #64748b;
      --input-bg: #ffffff;
      --input-border: #cbd5e1;
      --input-text: #0f172a;
      --dropdown-bg: #ffffff;
      --dropdown-text: #0f172a;
      --server-bar-bg: #ffffff;
      --modal-bg: #ffffff;
      --modal-overlay: rgba(15, 23, 42, 0.5);
      --subcard-bg: #f8fafc;
      --stat-box-bg: #f1f5f9;
      --table-hover: #f8fafc;
      --table-border: #e2e8f0;
      --tabs-bar-bg: #ffffff;
      --inspect-gradient: linear-gradient(135deg, #faf5ff, #f8fafc);
      --server-card-bg: #ffffff;
      --server-card-hover: rgba(124, 58, 237, 0.06);
      --toggle-bg: #f1f5f9;
      --toggle-border: #cbd5e1;
      --toggle-text: #0f172a;
      --shadow: 0 4px 20px -2px rgba(15, 23, 42, 0.06);
      --shadow-3d: 0 10px 25px -4px rgba(15, 23, 42, 0.08);
      --badge-bg: #f1f5f9;
      --badge-border: #e2e8f0;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background-color: var(--bg);
      color: var(--text);
      font-family: 'Plus Jakarta Sans', sans-serif;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      position: relative;
      overflow-x: hidden;
      transition: background-color 0.3s ease, color 0.3s ease;
    }

    /* ─── Ambient 3D Aurora Mesh ─── */
    .ambient-glow {
      position: fixed;
      border-radius: 50%;
      filter: blur(100px);
      pointer-events: none;
      z-index: 0;
      opacity: 0.7;
    }
    .ambient-glow-1 {
      width: 580px; height: 580px;
      top: -120px; left: -100px;
      background: var(--ambient-1);
      animation: none !important;
    }
    .ambient-glow-2 {
      width: 520px; height: 520px;
      bottom: -60px; right: -80px;
      background: var(--ambient-2);
      animation: none !important;
    }
    .ambient-glow-3 {
      width: 400px; height: 400px;
      top: 45%; left: 50%;
      transform: translate(-50%, -50%);
      background: var(--ambient-3);
      animation: none !important;
    }
    .cyber-grid {
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background-image: radial-gradient(var(--border) 1.2px, transparent 1.2px);
      background-size: 32px 32px;
      pointer-events: none;
      z-index: 0;
      mask-image: radial-gradient(ellipse at 50% 35%, black 40%, transparent 85%);
      -webkit-mask-image: radial-gradient(ellipse at 50% 35%, black 40%, transparent 85%);
      opacity: 0.65;
    }
    @keyframes floatOrb1 {
      0% { transform: translate(0, 0) scale(1); }
      100% { transform: translate(80px, 60px) scale(1.15); }
    }
    @keyframes floatOrb2 {
      0% { transform: translate(0, 0) scale(1); }
      100% { transform: translate(-70px, -50px) scale(1.1); }
    }
    @keyframes floatOrb3 {
      0% { transform: translate(-50%, -50%) scale(1); }
      100% { transform: translate(-45%, -40px) scale(0.9); }
    }

    .container {
      max-width: 1260px;
      margin: 0 auto;
      padding: 24px 20px 80px;
      width: 100%;
      position: relative;
      z-index: 10;
    }

    /* ─── 3D Glass Header ─── */
    header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 18px 28px;
      background: var(--card);
      backdrop-filter: blur(28px) saturate(190%);
      -webkit-backdrop-filter: blur(28px) saturate(190%);
      border: 1px solid var(--border);
      border-radius: 24px;
      margin-bottom: 22px;
      flex-wrap: wrap;
      gap: 18px;
      box-shadow: var(--shadow-3d), inset 0 1px 1px 0 var(--glass-specular);
      transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
      transform-style: preserve-3d;
    }
    header:hover {
      border-color: var(--border-hover);
      box-shadow: 0 20px 50px -10px rgba(0, 0, 0, 0.35), 0 0 30px -4px var(--accent-glow), inset 0 1px 1px 0 var(--glass-specular);
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .brand-coin-box {
      width: 48px;
      height: 48px;
      border-radius: 16px;
      background: linear-gradient(135deg, rgba(139, 92, 246, 0.25), rgba(245, 158, 11, 0.25));
      border: 1px solid var(--border-accent);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 8px 20px -3px var(--gold-glow), inset 0 1px 1px rgba(255, 255, 255, 0.4);
      animation: floatCoin 3.5s ease-in-out infinite;
    }
    .brand-title {
      font-family: 'Outfit', sans-serif;
      font-size: 22px;
      font-weight: 800;
      letter-spacing: -0.5px;
      background: linear-gradient(135deg, var(--text-heading) 0%, #cbd5e1 55%, var(--accent) 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    /* Radar Beacon for Live Status */
    .status-beacon {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      font-size: 12px;
      font-weight: 600;
      color: var(--green);
      margin-top: 2px;
    }
    .beacon-dot {
      position: relative;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--green);
      box-shadow: 0 0 10px var(--green);
      display: inline-block;
    }
    .beacon-dot::after {
      content: '';
      position: absolute;
      top: -4px; left: -4px; right: -4px; bottom: -4px;
      border-radius: 50%;
      border: 1.5px solid var(--green);
      animation: beaconWave 2s cubic-bezier(0, 0.2, 0.8, 1) infinite;
    }
    @keyframes beaconWave {
      0% { transform: scale(0.6); opacity: 1; }
      100% { transform: scale(2.4); opacity: 0; }
    }

    .user-profile {
      display: flex;
      align-items: center;
      gap: 16px;
      flex-wrap: wrap;
    }
    .user-meta { text-align: right; }
    .user-name {
      font-family: 'Outfit', sans-serif;
      font-weight: 800;
      font-size: 15px;
      color: var(--text-heading);
    }
    .user-role-badge {
      display: inline-block;
      font-size: 10px;
      font-weight: 800;
      text-transform: uppercase;
      padding: 3px 10px;
      border-radius: 20px;
      letter-spacing: 0.05em;
      margin-top: 3px;
    }
    .role-owner {
      background: linear-gradient(135deg, rgba(245, 158, 11, 0.25), rgba(217, 119, 6, 0.35));
      color: #fbbf24;
      border: 1px solid rgba(245, 158, 11, 0.45);
      box-shadow: 0 2px 10px rgba(245, 158, 11, 0.2);
    }
    .role-admin {
      background: linear-gradient(135deg, rgba(139, 92, 246, 0.25), rgba(124, 58, 237, 0.35));
      color: #c4b5fd;
      border: 1px solid rgba(139, 92, 246, 0.45);
      box-shadow: 0 2px 10px rgba(139, 92, 246, 0.2);
    }
    .role-user {
      background: var(--badge-bg);
      color: var(--muted);
      border: 1px solid var(--badge-border);
    }

    .avatar-ring {
      position: relative;
      display: inline-flex;
    }
    .user-avatar {
      width: 46px;
      height: 46px;
      border-radius: 14px;
      border: 2px solid var(--accent);
      object-fit: cover;
      box-shadow: 0 6px 16px var(--accent-glow);
      transition: transform 0.25s ease;
    }
    .avatar-ring:hover .user-avatar {
      transform: scale(1.08) rotate(2deg);
    }

    /* 3D Theme Toggle Button */
    .theme-toggle-btn {
      display: inline-flex;
      align-items: center;
      gap: 7px;
      background: var(--toggle-bg);
      border: 1px solid var(--toggle-border);
      color: var(--toggle-text);
      font-family: 'Outfit', sans-serif;
      font-size: 13px;
      font-weight: 700;
      padding: 8px 16px;
      border-radius: 14px;
      cursor: pointer;
      backdrop-filter: blur(14px);
      box-shadow: 0 4px 14px rgba(0, 0, 0, 0.06), inset 0 1px 1px var(--glass-specular);
      transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
      user-select: none;
    }
    .theme-toggle-btn:hover {
      border-color: var(--accent);
      transform: translateY(-2px);
      box-shadow: 0 6px 20px var(--accent-glow);
    }
    .theme-toggle-btn:active { transform: translateY(1px); }
    .theme-toggle-icon { font-size: 15px; }

    /* 3D Logout Button */
    .btn-logout {
      background: linear-gradient(135deg, rgba(239, 68, 68, 0.14), rgba(220, 38, 38, 0.22));
      border: 1px solid rgba(239, 68, 68, 0.35);
      color: #f87171;
      padding: 9px 16px;
      border-radius: 14px;
      text-decoration: none;
      font-family: 'Outfit', sans-serif;
      font-size: 13px;
      font-weight: 700;
      box-shadow: 0 4px 14px rgba(239, 68, 68, 0.15), inset 0 1px 1px rgba(255, 255, 255, 0.15);
      transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
      display: inline-flex;
      align-items: center;
      gap: 6px;
      cursor: pointer;
    }
    .btn-logout:hover {
      background: linear-gradient(135deg, rgba(239, 68, 68, 0.28), rgba(220, 38, 38, 0.4));
      color: #ffffff;
      transform: translateY(-2px);
      box-shadow: 0 8px 24px var(--red-glow);
    }
    .btn-logout:active { transform: translateY(1px); }

    /* ─── 3D SERVER COMMAND DECK (SERVER BAR) ─── */
    .server-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: var(--server-bar-bg);
      backdrop-filter: blur(28px) saturate(190%);
      -webkit-backdrop-filter: blur(28px) saturate(190%);
      border: 1px solid var(--border-accent);
      border-radius: 20px;
      padding: 14px 24px;
      margin-bottom: 24px;
      flex-wrap: wrap;
      gap: 16px;
      box-shadow: var(--shadow-3d), inset 0 1px 1px 0 var(--glass-specular);
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .server-bar:hover {
      border-color: var(--accent);
      box-shadow: 0 20px 45px -8px var(--accent-glow), inset 0 1px 1px 0 var(--glass-specular);
    }
    .server-selector-box {
      display: flex;
      align-items: center;
      gap: 14px;
      flex: 1;
      min-width: 290px;
    }
    .server-label {
      font-family: 'Outfit', sans-serif;
      font-weight: 800;
      font-size: 14px;
      color: var(--accent);
      display: flex;
      align-items: center;
      gap: 8px;
      white-space: nowrap;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .server-dropdown {
      background: var(--input-bg);
      border: 1px solid var(--input-border);
      color: var(--input-text);
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-size: 14px;
      font-weight: 600;
      padding: 10px 18px;
      border-radius: 14px;
      outline: none;
      cursor: pointer;
      flex: 1;
      max-width: 440px;
      box-shadow: 0 4px 14px rgba(0, 0, 0, 0.08), inset 0 1px 1px var(--glass-specular);
      transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .server-dropdown:focus {
      border-color: var(--accent);
      box-shadow: 0 0 0 3px var(--accent-glow);
    }
    .server-meta-badge {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 12px;
      font-weight: 700;
      color: var(--muted);
      background: var(--badge-bg);
      padding: 8px 18px;
      border-radius: 24px;
      border: 1px solid var(--badge-border);
      backdrop-filter: blur(12px);
    }

    /* ─── 3D SEGMENTED FLOATING TABS DOCK ─── */
    .tabs-bar {
      display: flex;
      gap: 10px;
      margin-bottom: 24px;
      background: var(--tabs-bar-bg);
      backdrop-filter: blur(28px) saturate(190%);
      -webkit-backdrop-filter: blur(28px) saturate(190%);
      padding: 8px;
      border-radius: 20px;
      border: 1px solid var(--border);
      box-shadow: var(--shadow-3d), inset 0 1px 1px 0 var(--glass-specular);
      overflow-x: auto;
    }
    .tab-btn {
      background: transparent;
      border: none;
      color: var(--muted);
      font-family: 'Outfit', sans-serif;
      font-size: 14px;
      font-weight: 700;
      padding: 11px 22px;
      border-radius: 14px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 9px;
      transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
      white-space: nowrap;
      position: relative;
    }
    .tab-btn:hover:not(.active) {
      color: var(--text-heading);
      background: var(--hover);
      transform: translateY(-2px);
    }
    .tab-btn.active {
      background: linear-gradient(135deg, var(--accent) 0%, #6d28d9 100%);
      color: #ffffff;
      box-shadow: 0 8px 24px -2px var(--accent-glow), inset 0 1px 1px rgba(255, 255, 255, 0.4);
      transform: translateY(-2px);
      border: 1px solid rgba(255, 255, 255, 0.2);
    }

    /* ─── DYNAMIC BIG & SMALL SCALING ANIMATIONS ─── */
    @keyframes tabZoomEntrance {
      0% { opacity: 0; transform: scale(0.92) translateY(24px); }
      65% { transform: scale(1.02) translateY(-4px); }
      100% { opacity: 1; transform: scale(1) translateY(0); }
    }
    @keyframes pulseBigSmall {
      0% { transform: scale(0.95); }
      50% { transform: scale(1.06); }
      100% { transform: scale(0.95); }
    }
    @keyframes badgeBreathe {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.14); }
    }
    @keyframes radarScanPulse {
      0% { transform: scale(0.6); opacity: 1; }
      50% { transform: scale(1.5); opacity: 0.45; }
      100% { transform: scale(2.4); opacity: 0; }
    }
    @keyframes scanLineGlow {
      0% { transform: translateY(-100%); opacity: 0.1; }
      50% { opacity: 0.6; }
      100% { transform: translateY(300%); opacity: 0.1; }
    }

    .pulse-scale {
      animation: pulseBigSmall 3.5s ease-in-out infinite;
    }
    .badge-breathe {
      animation: badgeBreathe 2.5s ease-in-out infinite;
    }

    /* Tab Switch Animations with Scale Morph */
    .tab-content {
      display: none;
    }
    .tab-content.active {
      display: block;
      animation: tabZoomEntrance 0.42s cubic-bezier(0.16, 1, 0.3, 1);
    }

    /* ─── 3D GLASS CARDS WITH DYNAMIC SCALE ZOOM ─── */
    .card {
      background: var(--card);
      backdrop-filter: blur(28px) saturate(190%);
      -webkit-backdrop-filter: blur(28px) saturate(190%);
      border: 1px solid var(--border);
      border-radius: 24px;
      padding: 26px;
      margin-bottom: 22px;
      box-shadow: var(--shadow-3d), inset 0 1px 1px 0 var(--glass-specular);
      position: relative;
      transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.25s ease, border-color 0.25s ease;
    }
    .card:hover {
      border-color: var(--border-hover);
      transform: translateY(-4px) scale(1.015);
      box-shadow: 0 20px 48px -10px rgba(0, 0, 0, 0.45), 0 0 30px -4px var(--accent-glow), inset 0 1px 1px 0 var(--glass-specular);
    }
    .card:active {
      transform: scale(0.99);
    }
    .card-title {
      font-family: 'Outfit', sans-serif;
      font-size: 19px;
      font-weight: 800;
      letter-spacing: -0.3px;
      margin-bottom: 20px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      color: var(--text-heading);
      flex-wrap: wrap;
      gap: 12px;
    }

    /* ─── 3D HOLOGRAPHIC WALLET HERO ─── */
    .wallet-hero {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 24px;
      flex-wrap: wrap;
    }
    .wallet-balance-box {
      display: flex;
      align-items: center;
      gap: 20px;
    }
    .wallet-coin-icon {
      width: 64px;
      height: 64px;
      border-radius: 20px;
      background: linear-gradient(135deg, rgba(245, 158, 11, 0.25), rgba(217, 119, 6, 0.35));
      border: 1px solid rgba(245, 158, 11, 0.45);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 12px 30px -4px var(--gold-glow), inset 0 1px 1px rgba(255, 255, 255, 0.5);
      animation: floatCoin 3.5s ease-in-out infinite;
      transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    .wallet-hero:hover .wallet-coin-icon {
      transform: scale(1.15) rotate(6deg);
    }
    @keyframes floatCoin {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-7px); }
    }
    .coin-icon {
      filter: drop-shadow(0 6px 14px rgba(245, 158, 11, 0.45));
    }
    .balance-label {
      font-size: 12px;
      color: var(--muted);
      text-transform: uppercase;
      font-weight: 800;
      letter-spacing: 0.06em;
    }
    .balance-num {
      font-family: 'Outfit', sans-serif;
      font-size: 40px;
      font-weight: 900;
      letter-spacing: -1px;
      background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      line-height: 1.1;
      margin-top: 2px;
      transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    .wallet-hero:hover .balance-num {
      transform: scale(1.04);
    }

    /* ─── 3D PUSH BUTTONS WITH TACTILE DEPTH & SCALING ─── */
    .btn-gold {
      background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%);
      color: #fff;
      border: 1px solid rgba(255, 255, 255, 0.35);
      font-family: 'Outfit', sans-serif;
      font-weight: 800;
      font-size: 14px;
      padding: 13px 24px;
      border-radius: 16px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 10px;
      box-shadow: 0 5px 0 #b45309, 0 10px 24px rgba(245, 158, 11, 0.45), inset 0 1px 1px rgba(255, 255, 255, 0.5);
      transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
      position: relative;
      overflow: hidden;
      transform: translateY(0);
      user-select: none;
    }
    .btn-gold:hover {
      transform: scale(1.06) translateY(-2px);
      box-shadow: 0 7px 0 #b45309, 0 16px 36px rgba(245, 158, 11, 0.65), inset 0 1px 1px rgba(255, 255, 255, 0.7);
    }
    .btn-gold:active {
      transform: scale(0.94) translateY(4px);
      box-shadow: 0 1px 0 #b45309, 0 4px 10px rgba(245, 158, 11, 0.3);
    }

    .btn-primary {
      background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
      color: #fff;
      border: 1px solid rgba(255, 255, 255, 0.28);
      font-family: 'Outfit', sans-serif;
      font-weight: 800;
      padding: 10px 20px;
      border-radius: 14px;
      cursor: pointer;
      font-size: 13px;
      box-shadow: 0 4px 0 #5b21b6, 0 8px 20px rgba(124, 58, 237, 0.38), inset 0 1px 1px rgba(255, 255, 255, 0.4);
      transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
      position: relative;
      overflow: hidden;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      transform: translateY(0);
      user-select: none;
    }
    .btn-primary:hover {
      transform: scale(1.06) translateY(-2px);
      box-shadow: 0 6px 0 #5b21b6, 0 14px 30px rgba(124, 58, 237, 0.6), inset 0 1px 1px rgba(255, 255, 255, 0.6);
    }
    .btn-primary:active {
      transform: scale(0.94) translateY(3px);
      box-shadow: 0 1px 0 #5b21b6, 0 3px 8px rgba(124, 58, 237, 0.3);
    }

    .btn-secondary {
      background: var(--subcard-bg);
      border: 1px solid var(--border-accent);
      color: var(--text-heading);
      font-family: 'Outfit', sans-serif;
      font-weight: 800;
      padding: 9px 16px;
      border-radius: 12px;
      cursor: pointer;
      font-size: 13px;
      box-shadow: 0 4px 0 var(--border), 0 6px 14px rgba(0, 0, 0, 0.06), inset 0 1px 1px var(--glass-specular);
      transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
      display: inline-flex;
      align-items: center;
      gap: 7px;
      transform: translateY(0);
      user-select: none;
    }
    .btn-secondary:hover {
      border-color: var(--accent);
      transform: scale(1.06) translateY(-2px);
      box-shadow: 0 6px 0 var(--accent), 0 12px 24px var(--accent-glow);
    }
    .btn-secondary:active {
      transform: scale(0.94) translateY(3px);
      box-shadow: 0 1px 0 var(--accent);
    }

    /* ─── 3D Card Icon Badges with Big Scaling ─── */
    .card-title-left {
      display: flex;
      align-items: center;
      gap: 14px;
    }
    .card-icon-badge {
      width: 44px;
      height: 44px;
      border-radius: 14px;
      background: linear-gradient(135deg, rgba(139, 92, 246, 0.25), rgba(99, 102, 241, 0.18));
      border: 1.5px solid var(--border-accent);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      color: var(--accent);
      box-shadow: 0 6px 18px var(--accent-glow), inset 0 1px 1px rgba(255, 255, 255, 0.5);
      flex-shrink: 0;
      transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.35s ease;
    }
    .card:hover .card-icon-badge {
      transform: scale(1.15);
      box-shadow: 0 0 28px var(--accent-glow);
    }

    /* ─── Icon Micro-Animations ─── */
    .btn-icon-spin {
      display: inline-flex;
      transition: transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    button:hover .btn-icon-spin, a:hover .btn-icon-spin {
      transform: scale(1.25) rotate(180deg);
    }
    .btn-icon-bounce {
      display: inline-flex;
      transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    button:hover .btn-icon-bounce, a:hover .btn-icon-bounce {
      transform: scale(1.35) translateY(-3px);
    }
    .btn-icon-shake {
      display: inline-flex;
    }
    button:hover .btn-icon-shake, a:hover .btn-icon-shake {
      animation: shakeIcon 0.4s ease-in-out;
    }
    @keyframes shakeIcon {
      0%, 100% { transform: scale(1.2) rotate(0deg); }
      25% { transform: scale(1.25) rotate(-14deg); }
      75% { transform: scale(1.25) rotate(14deg); }
    }

    /* ─── Badge Tag & Pill Stat with Breathing Glow ─── */
    .badge-tag {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 11px;
      font-weight: 700;
      padding: 4px 12px;
      border-radius: 10px;
      background: var(--badge-bg);
      border: 1px solid var(--badge-border);
      color: var(--muted);
      transition: transform 0.25s ease;
    }
    .badge-tag:hover {
      transform: scale(1.08);
    }
    .pill-stat {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      font-weight: 800;
      padding: 4px 12px;
      border-radius: 20px;
      background: rgba(139, 92, 246, 0.12);
      color: var(--accent);
      border: 1px solid var(--border-accent);
      transition: transform 0.25s ease;
    }
    .pill-stat:hover {
      transform: scale(1.08);
    }

    /* ─── CYBER HUD HERO BANNERS (FOR ADMIN & BOT OWNER HUBS) ─── */
    .hud-hero-banner {
      background: linear-gradient(135deg, rgba(139, 92, 246, 0.14) 0%, rgba(14, 18, 32, 0.85) 100%);
      border: 1.5px solid var(--border-accent);
      border-radius: 24px;
      padding: 24px 28px;
      margin-bottom: 24px;
      position: relative;
      overflow: hidden;
      box-shadow: 0 16px 40px -10px var(--accent-glow), inset 0 1px 1px var(--glass-specular);
      transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    .hud-hero-banner:hover {
      transform: scale(1.015) translateY(-3px);
    }
    .hud-top-meta {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      flex-wrap: wrap;
      margin-bottom: 12px;
    }
    .hud-chip {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      font-size: 11px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      padding: 4px 14px;
      border-radius: 20px;
      background: rgba(139, 92, 246, 0.2);
      border: 1px solid var(--border-accent);
      color: var(--accent);
    }
    .hud-chip-gold {
      background: rgba(245, 158, 11, 0.2);
      border-color: rgba(245, 158, 11, 0.45);
      color: #fbbf24;
    }
    .hud-dot-radar {
      width: 7px; height: 7px;
      border-radius: 50%;
      background: currentColor;
      position: relative;
      display: inline-block;
    }
    .hud-dot-radar::after {
      content: '';
      position: absolute;
      top: -3px; left: -3px; right: -3px; bottom: -3px;
      border-radius: 50%;
      border: 1.5px solid currentColor;
      animation: radarScanPulse 2s infinite;
    }
    .hud-title {
      font-family: 'Outfit', sans-serif;
      font-size: 24px;
      font-weight: 900;
      color: var(--text-heading);
      letter-spacing: -0.5px;
      margin-bottom: 6px;
    }
    .hud-desc {
      font-size: 13px;
      color: var(--muted);
      line-height: 1.6;
    }

    /* ─── DANGER ZONE HIGH-SECURITY CYBER SHIELD ─── */
    .danger-zone-hud {
      border: 1.5px solid rgba(239, 68, 68, 0.45) !important;
      background: linear-gradient(180deg, rgba(239, 68, 68, 0.09) 0%, rgba(14, 18, 30, 0.95) 100%) !important;
      position: relative;
      overflow: hidden;
    }
    .danger-zone-hud::before {
      content: '';
      position: absolute;
      top: 0; left: 0; right: 0;
      height: 4px;
      background: repeating-linear-gradient(45deg, #ef4444, #ef4444 14px, #7f1d1d 14px, #7f1d1d 28px);
    }

    /* ─── 3D PRODUCTS GRID & CARDS ─── */
    .products-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 22px;
    }
    .product-card {
      background: var(--subcard-bg);
      border: 1px solid var(--border);
      border-radius: 20px;
      padding: 20px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      box-shadow: var(--shadow-3d), inset 0 1px 1px var(--glass-specular);
      transform-style: preserve-3d;
      overflow: hidden;
      cursor: pointer;
    }
    .product-card:hover {
      border-color: var(--accent);
      transform: translateY(-5px) scale(1.02);
      box-shadow: 0 20px 45px -8px var(--accent-glow), inset 0 1px 1px var(--glass-specular);
    }
    .product-img {
      width: 100%;
      height: 150px;
      border-radius: 14px;
      object-fit: cover;
      margin-bottom: 16px;
      background: var(--stat-box-bg);
      border: 1px solid var(--border);
      transition: transform 0.3s ease;
    }
    .product-card:hover .product-img {
      transform: scale(1.03);
    }
    .product-title {
      font-family: 'Outfit', sans-serif;
      font-size: 17px;
      font-weight: 800;
      margin-bottom: 6px;
      color: var(--text-heading);
    }
    .product-desc {
      font-size: 13px;
      color: var(--muted);
      margin-bottom: 16px;
      line-height: 1.6;
      flex: 1;
    }
    .product-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-top: 14px;
      border-top: 1px solid var(--border);
    }
    .product-price {
      font-family: 'Outfit', sans-serif;
      font-weight: 800;
      color: #fbbf24;
      font-size: 16px;
      display: flex;
      align-items: center;
      gap: 4px;
    }

    /* ─── MODERN 3D TABLES (FLOATING CARD ROWS & SCROLLABLE CONTAINER) ─── */
    .table-responsive {
      width: 100%;
      overflow-x: auto;
      overflow-y: auto;
      max-height: 480px;
      padding: 4px 6px;
      scrollbar-width: thin;
      scrollbar-color: rgba(139, 92, 246, 0.45) rgba(255, 255, 255, 0.02);
    }
    .table-responsive::-webkit-scrollbar {
      width: 6px;
      height: 6px;
    }
    .table-responsive::-webkit-scrollbar-track {
      background: rgba(255, 255, 255, 0.02);
      border-radius: 6px;
    }
    .table-responsive::-webkit-scrollbar-thumb {
      background: rgba(139, 92, 246, 0.35);
      border-radius: 6px;
      border: 1px solid rgba(139, 92, 246, 0.2);
    }
    .table-responsive::-webkit-scrollbar-thumb:hover {
      background: rgba(139, 92, 246, 0.65);
    }
    table {
      width: 100%;
      border-collapse: separate;
      border-spacing: 0 8px;
      text-align: left;
      font-size: 13px;
    }
    thead {
      position: sticky;
      top: 0;
      z-index: 10;
    }
    thead tr th {
      position: sticky;
      top: 0;
      padding: 12px 18px;
      color: var(--muted);
      border: none;
      font-weight: 800;
      text-transform: uppercase;
      font-size: 11px;
      letter-spacing: 0.08em;
      background: var(--card-solid);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
      z-index: 10;
    }
    thead tr th:first-child {
      border-top-left-radius: 12px;
      border-bottom-left-radius: 12px;
    }
    thead tr th:last-child {
      border-top-right-radius: 12px;
      border-bottom-right-radius: 12px;
    }
    tbody tr {
      background: var(--subcard-bg);
      backdrop-filter: blur(12px);
      transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    }
    tbody tr:hover {
      background: var(--table-hover);
      transform: translateY(-2px);
      box-shadow: 0 8px 24px -4px rgba(0, 0, 0, 0.12), 0 0 0 1px var(--border-accent);
    }
    tbody tr td {
      padding: 15px 18px;
      border: none;
      border-top: 1px solid var(--table-border);
      border-bottom: 1px solid var(--table-border);
      color: var(--text);
    }
    tbody tr td:first-child {
      border-left: 1px solid var(--table-border);
      border-top-left-radius: 14px;
      border-bottom-left-radius: 14px;
    }
    tbody tr td:last-child {
      border-right: 1px solid var(--table-border);
      border-top-right-radius: 14px;
      border-bottom-right-radius: 14px;
    }

    .server-badge {
      font-size: 11px;
      background: rgba(139, 92, 246, 0.18);
      color: #c4b5fd;
      border: 1px solid rgba(139, 92, 246, 0.35);
      padding: 3px 10px;
      border-radius: 20px;
      font-weight: 700;
      display: inline-block;
      white-space: nowrap;
    }

    /* ─── STATUS PILLS WITH GLOWING RADAR DOTS ─── */
    .status-pill {
      font-size: 11px;
      font-weight: 800;
      padding: 4px 12px;
      border-radius: 20px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }
    .status-pill::before {
      content: '';
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: currentColor;
      box-shadow: 0 0 8px currentColor;
    }
    .status-paid {
      background: rgba(16, 185, 129, 0.16);
      color: #10b981;
      border: 1px solid rgba(16, 185, 129, 0.35);
    }
    .status-pending {
      background: rgba(245, 158, 11, 0.16);
      color: #fbbf24;
      border: 1px solid rgba(245, 158, 11, 0.35);
    }
    .status-rejected {
      background: rgba(239, 68, 68, 0.16);
      color: #f87171;
      border: 1px solid rgba(239, 68, 68, 0.35);
    }

    /* ─── 3D MODALS ─── */
    .modal-overlay {
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: var(--modal-overlay);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      display: none;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: 20px;
      animation: fadeIn 0.25s ease;
    }
    .modal-overlay.active { display: flex; }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

    .modal-box {
      background: var(--modal-bg);
      backdrop-filter: blur(32px) saturate(190%);
      border: 1px solid var(--border-accent);
      border-radius: 28px;
      padding: 34px;
      max-width: 500px;
      width: 100%;
      box-shadow: 0 30px 80px -15px rgba(0, 0, 0, 0.8), 0 0 40px -5px var(--accent-glow), inset 0 1px 1px var(--glass-specular);
      position: relative;
      animation: modalPop 0.32s cubic-bezier(0.16, 1, 0.3, 1);
    }
    @keyframes modalPop {
      0% { opacity: 0; transform: scale(0.92) translateY(20px); }
      100% { opacity: 1; transform: scale(1) translateY(0); }
    }
    .modal-title {
      font-family: 'Outfit', sans-serif;
      font-size: 22px;
      font-weight: 800;
      margin-bottom: 18px;
      color: var(--text-heading);
    }
    .modal-close {
      position: absolute;
      top: 22px; right: 24px;
      background: var(--subcard-bg);
      border: 1px solid var(--border);
      border-radius: 12px;
      width: 36px; height: 36px;
      display: flex; align-items: center; justify-content: center;
      color: var(--muted); font-size: 20px; cursor: pointer;
      transition: all 0.2s ease;
    }
    .modal-close:hover {
      color: var(--text-heading);
      background: var(--hover);
      border-color: var(--accent);
      transform: rotate(90deg);
    }

    /* ─── FORMS & INPUTS ─── */
    .form-group { margin-bottom: 18px; }
    .form-label {
      display: block;
      font-size: 13px;
      font-weight: 700;
      color: var(--muted);
      margin-bottom: 7px;
    }
    .form-input {
      width: 100%;
      background: var(--input-bg);
      border: 1px solid var(--input-border);
      border-radius: 14px;
      padding: 12px 16px;
      color: var(--input-text);
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-size: 14px;
      outline: none;
      box-shadow: 0 4px 14px rgba(0, 0, 0, 0.05), inset 0 1px 1px var(--glass-specular);
      transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .form-input:focus {
      border-color: var(--accent);
      box-shadow: 0 0 0 3px var(--accent-glow);
    }

    /* CRITICAL FIX FOR NATIVE SELECT & OPTION DROPDOWN POPUPS */
    select.form-input,
    select.server-dropdown,
    select {
      background-color: var(--input-bg);
      color: var(--input-text);
      color-scheme: inherit;
    }
    select.form-input option,
    select.server-dropdown option,
    select option,
    option {
      background-color: var(--dropdown-bg) !important;
      color: var(--dropdown-text) !important;
      padding: 10px 14px;
    }

    /* ─── USER INSPECTOR DOSSIER & SUB-CARDS ─── */
    .inspect-box {
      background: var(--inspect-gradient);
      border: 1px solid var(--border-accent);
      border-radius: 20px;
      padding: 24px;
      margin-top: 18px;
      box-shadow: var(--shadow-3d);
    }
    .user-profile-header {
      display: flex;
      align-items: center;
      gap: 18px;
      margin-bottom: 22px;
      flex-wrap: wrap;
    }
    .inspect-avatar {
      width: 72px;
      height: 72px;
      border-radius: 20px;
      border: 2px solid var(--accent);
      object-fit: cover;
      box-shadow: 0 8px 24px var(--accent-glow);
    }
    .sub-card {
      background: var(--subcard-bg);
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 18px;
      margin-bottom: 18px;
      box-shadow: inset 0 1px 1px var(--glass-specular);
    }
    .sub-card-title {
      font-family: 'Outfit', sans-serif;
      font-size: 15px;
      font-weight: 800;
      color: var(--accent);
      margin-bottom: 14px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .role-pill {
      font-size: 11px;
      padding: 3px 10px;
      border-radius: 20px;
      font-weight: 700;
      display: inline-flex;
      align-items: center;
      gap: 5px;
      margin: 3px 5px 3px 0;
      background: var(--badge-bg);
      border: 1px solid var(--badge-border);
    }
    .guild-tag {
      background: rgba(88, 101, 242, 0.15);
      border: 1px solid rgba(88, 101, 242, 0.3);
      color: #c7d2fe;
      border-radius: 12px;
      padding: 12px 16px;
      margin-bottom: 12px;
    }

    /* ─── SERVER CARDS & TELEMETRY ─── */
    .inspect-servers-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 18px;
      margin-top: 16px;
    }
    .inspect-server-card {
      background: var(--server-card-bg);
      border: 1px solid var(--border-accent);
      border-radius: 18px;
      padding: 20px;
      cursor: pointer;
      transition: all 0.28s cubic-bezier(0.16, 1, 0.3, 1);
      position: relative;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      box-shadow: var(--shadow-3d), inset 0 1px 1px var(--glass-specular);
      transform-style: preserve-3d;
    }
    .inspect-server-card:hover {
      background: var(--server-card-hover);
      border-color: var(--accent);
      transform: translateY(-5px) scale(1.02);
      box-shadow: 0 16px 36px var(--accent-glow), inset 0 1px 1px var(--glass-specular);
    }
    .inspect-server-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 14px;
      margin-bottom: 14px;
    }
    .inspect-server-icon {
      width: 48px;
      height: 48px;
      border-radius: 14px;
      object-fit: cover;
      border: 1.5px solid var(--border-accent);
      flex-shrink: 0;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }
    .inspect-server-icon-placeholder {
      width: 48px;
      height: 48px;
      border-radius: 14px;
      background: linear-gradient(135deg, rgba(139, 92, 246, 0.25), rgba(168, 85, 247, 0.35));
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 22px;
      border: 1.5px solid var(--border-accent);
      flex-shrink: 0;
    }
    .inspect-server-name {
      font-family: 'Outfit', sans-serif;
      font-size: 16px;
      font-weight: 800;
      color: var(--text-heading);
      line-height: 1.3;
    }
    .inspect-server-id {
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      color: var(--muted);
      margin-top: 3px;
    }
    .inspect-server-stats {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 10px;
      margin: 14px 0;
      background: var(--stat-box-bg);
      border-radius: 12px;
      padding: 12px;
      border: 1px solid var(--border);
    }
    .inspect-server-stat-box { text-align: center; }
    .stat-mini-label {
      display: block;
      font-size: 9px;
      font-weight: 800;
      letter-spacing: 0.08em;
      color: var(--muted);
      text-transform: uppercase;
    }
    .stat-mini-val {
      display: block;
      font-family: 'Outfit', sans-serif;
      font-size: 14px;
      font-weight: 800;
      margin-top: 3px;
      color: var(--text-heading);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .inspect-server-btn {
      margin-top: 14px;
      background: linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(168, 85, 247, 0.2));
      border: 1px solid rgba(139, 92, 246, 0.45);
      color: var(--accent);
      font-family: 'Outfit', sans-serif;
      font-size: 12px;
      font-weight: 800;
      padding: 11px 16px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      transition: all 0.25s ease;
      cursor: pointer;
      width: 100%;
    }
    .inspect-server-card:hover .inspect-server-btn {
      background: var(--accent);
      color: #fff;
      border-color: var(--accent);
      box-shadow: 0 6px 18px var(--accent-glow);
    }
    .dossier-top-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 14px;
      margin-bottom: 22px;
      padding-bottom: 18px;
      border-bottom: 1px solid var(--border);
    }

    .stat-tile {
      background: var(--subcard-bg);
      border: 1px solid var(--border);
      border-radius: 18px;
      padding: 18px 20px;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06), inset 0 1px 1px var(--glass-specular);
      transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
      position: relative;
      overflow: hidden;
    }
    .stat-tile:hover {
      transform: scale(1.05) translateY(-4px);
      border-color: var(--accent);
      box-shadow: 0 16px 36px -8px var(--accent-glow), inset 0 1px 1px var(--glass-specular);
    }
    .stat-tile:active {
      transform: scale(0.96) translateY(2px);
    }
    .stat-label {
      font-size: 11px;
      color: var(--muted);
      text-transform: uppercase;
      font-weight: 800;
      letter-spacing: 0.08em;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .stat-val {
      font-family: 'Outfit', sans-serif;
      font-size: 26px;
      font-weight: 900;
      color: var(--text-heading);
      margin-top: 6px;
      letter-spacing: -0.5px;
      transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    .stat-tile:hover .stat-val {
      transform: scale(1.06);
    }

    .telemetry-tile {
      background: var(--subcard-bg);
      border: 1.5px solid var(--border);
      padding: 22px;
      border-radius: 20px;
      transition: all 0.32s cubic-bezier(0.34, 1.56, 0.64, 1);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08), inset 0 1px 1px var(--glass-specular);
      position: relative;
      overflow: hidden;
    }
    .telemetry-tile::after {
      content: '';
      position: absolute;
      top: 0; right: 0; width: 60px; height: 60px;
      background: radial-gradient(circle at top right, var(--accent-glow), transparent 70%);
      pointer-events: none;
      transition: opacity 0.3s ease;
      opacity: 0.4;
    }
    .telemetry-tile:hover {
      transform: scale(1.06) translateY(-5px);
      border-color: var(--accent);
      box-shadow: 0 20px 45px -8px var(--accent-glow), inset 0 1px 1px var(--glass-specular);
    }
    .telemetry-tile:hover::after {
      opacity: 1;
    }
    .telemetry-tile:active {
      transform: scale(0.95) translateY(2px);
    }
    .telemetry-label {
      font-size: 11px;
      color: var(--muted);
      font-weight: 800;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      margin-bottom: 8px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .telemetry-val {
      font-family: 'Outfit', sans-serif;
      font-size: 30px;
      font-weight: 900;
      letter-spacing: -0.5px;
      transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    .telemetry-tile:hover .telemetry-val {
      transform: scale(1.08);
    }
    .telemetry-rss { color: #38bdf8; text-shadow: 0 0 20px rgba(56, 189, 248, 0.4); }
    .telemetry-ping { color: var(--green); text-shadow: 0 0 20px rgba(16, 185, 129, 0.4); }
    .telemetry-uptime { color: var(--gold); text-shadow: 0 0 20px rgba(245, 158, 11, 0.4); }
    .telemetry-node { color: var(--accent); text-shadow: 0 0 20px var(--accent-glow); }
    .btn-sm {
      padding: 6px 12px;
      font-size: 12px;
      border-radius: 10px;
    }

    code {
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.9em;
      padding: 3px 8px;
      border-radius: 8px;
      background: rgba(139, 92, 246, 0.12);
      border: 1px solid var(--border-accent);
      color: var(--text-heading);
      cursor: copy;
      transition: all 0.2s ease;
    }
    code:hover {
      background: rgba(139, 92, 246, 0.25);
      border-color: var(--accent);
      box-shadow: 0 0 12px var(--accent-glow);
    }

    /* ─── 3D TOAST CAPSULE ─── */
    #toast {
      position: fixed;
      bottom: 28px; right: 28px;
      background: var(--card-solid);
      backdrop-filter: blur(28px) saturate(190%);
      border: 1px solid var(--border-accent);
      color: var(--text-heading);
      padding: 16px 24px;
      border-radius: 18px;
      box-shadow: 0 20px 50px -10px rgba(0, 0, 0, 0.8), 0 0 30px -5px var(--accent-glow);
      display: none;
      align-items: center;
      gap: 12px;
      z-index: 2000;
      font-family: 'Outfit', sans-serif;
      font-size: 14px;
      font-weight: 700;
      animation: toastSlide 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }
    @keyframes toastSlide {
      from { transform: translateY(20px) scale(0.9); opacity: 0; }
      to { transform: translateY(0) scale(1); opacity: 1; }
    }

    /* ─── FILTER PILLS & TOOLBARS ─── */
    .filter-bar {
      display: flex;
      align-items: center;
      gap: 10px;
      flex-wrap: wrap;
      margin-bottom: 20px;
    }
    .filter-pill {
      background: var(--subcard-bg);
      border: 1px solid var(--border);
      color: var(--muted);
      font-family: 'Outfit', sans-serif;
      font-size: 13px;
      font-weight: 700;
      padding: 7px 16px;
      border-radius: 20px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
      user-select: none;
    }
    .filter-pill:hover:not(.active) {
      color: var(--text-heading);
      border-color: var(--border-hover);
      transform: translateY(-2px);
    }
    .filter-pill.active {
      background: linear-gradient(135deg, var(--accent) 0%, #6d28d9 100%);
      color: #ffffff;
      border-color: var(--accent);
      box-shadow: 0 4px 16px var(--accent-glow);
      transform: translateY(-2px);
    }

    /* ─── QUICK ACTION BUTTONS ─── */
    .quick-actions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
      gap: 14px;
      margin-bottom: 24px;
    }
    .quick-action-btn {
      background: var(--subcard-bg);
      border: 1.5px solid var(--border);
      border-radius: 18px;
      padding: 18px;
      display: flex;
      align-items: center;
      gap: 14px;
      color: var(--text-heading);
      cursor: pointer;
      text-decoration: none;
      transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
      box-shadow: 0 4px 16px rgba(0,0,0,0.06), inset 0 1px 1px var(--glass-specular);
    }
    .quick-action-btn:hover {
      border-color: var(--accent);
      transform: translateY(-4px) scale(1.02);
      box-shadow: 0 16px 36px -8px var(--accent-glow);
    }
    .quick-action-btn:active {
      transform: scale(0.97);
    }
    .quick-action-icon {
      width: 44px;
      height: 44px;
      border-radius: 14px;
      background: linear-gradient(135deg, rgba(139, 92, 246, 0.25), rgba(168, 85, 247, 0.15));
      border: 1px solid var(--border-accent);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      color: var(--accent);
      flex-shrink: 0;
    }



    /* ─── THEME PICKER CARDS IN SETTINGS ─── */
    .theme-picker-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 18px;
      margin-top: 14px;
    }
    .theme-picker-card {
      background: var(--subcard-bg);
      border: 2px solid var(--border);
      border-radius: 20px;
      padding: 20px;
      cursor: pointer;
      transition: all 0.28s cubic-bezier(0.16, 1, 0.3, 1);
      position: relative;
    }
    .theme-picker-card:hover {
      transform: translateY(-4px);
      border-color: var(--border-hover);
    }
    .theme-picker-card.active-theme {
      border-color: var(--accent);
      box-shadow: 0 0 24px var(--accent-glow);
    }
    .theme-preview-box {
      height: 90px;
      border-radius: 12px;
      margin-bottom: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      border: 1px solid rgba(255, 255, 255, 0.12);
      position: relative;
      overflow: hidden;
    }
    /* ─── APP SHELL & LEFT SIDEBAR LAYOUT ─── */
    .app-shell {
      display: flex;
      min-height: 100vh;
      width: 100%;
      position: relative;
      z-index: 10;
    }
    .app-sidebar {
      width: 250px;
      flex-shrink: 0;
      background: var(--sidebar-bg, rgba(14, 11, 28, 0.88));
      backdrop-filter: blur(28px) saturate(190%);
      -webkit-backdrop-filter: blur(28px) saturate(190%);
      border-right: 1px solid var(--border);
      display: flex;
      flex-direction: column;
      padding: 22px 14px 18px;
      position: sticky;
      top: 0;
      height: 100vh;
      overflow-y: auto;
      z-index: 100;
      box-shadow: 4px 0 24px rgba(0, 0, 0, 0.25);
    }
    .sidebar-brand {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
      padding: 6px 0 18px;
      margin-bottom: 12px;
      border-bottom: 1px solid var(--border);
      text-decoration: none;
    }
    .sidebar-coin-badge {
      width: 66px;
      height: 66px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(139, 92, 246, 0.35) 0%, rgba(20, 15, 45, 0.8) 70%);
      border: 1.5px solid rgba(245, 158, 11, 0.45);
      box-shadow: 0 0 24px rgba(139, 92, 246, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.4);
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
    }
    .sidebar-coin-img {
      width: 50px;
      height: 50px;
      object-fit: contain;
      filter: drop-shadow(0 4px 10px rgba(245, 158, 11, 0.5));
    }
    .sidebar-brand-name {
      font-family: 'Outfit', sans-serif;
      font-size: 15px;
      font-weight: 800;
      color: var(--text-heading);
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }
    .sidebar-nav {
      display: flex;
      flex-direction: column;
      gap: 5px;
      flex: 1;
    }
    .nav-btn {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 11px 16px;
      border-radius: 14px;
      color: var(--muted);
      background: transparent;
      border: 1px solid transparent;
      cursor: pointer;
      font-family: 'Outfit', sans-serif;
      font-size: 14px;
      font-weight: 600;
      transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1);
      width: 100%;
      text-align: left;
      user-select: none;
    }
    .nav-btn .nav-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 20px;
      height: 20px;
      flex-shrink: 0;
      transition: transform 0.2s ease;
    }
    .nav-btn:hover {
      transform: scale(1.02);
      color: var(--text-heading);
      background: var(--hover);
      border-color: rgba(255, 255, 255, 0.05);
    }
    .nav-btn:hover .nav-icon {
      transform: scale(1.1);
    }
    .nav-btn.active {
      background: linear-gradient(135deg, #7c3aed 0%, #6366f1 100%);
      color: #ffffff;
      font-weight: 700;
      border-color: rgba(255, 255, 255, 0.2);
      box-shadow: 0 8px 24px rgba(124, 58, 237, 0.45), inset 0 1px 1px rgba(255, 255, 255, 0.4);
    }
    .sidebar-topup-card {
      background: radial-gradient(circle at 50% 20%, rgba(139, 92, 246, 0.25) 0%, rgba(16, 12, 34, 0.95) 80%);
      border: 1px solid rgba(139, 92, 246, 0.3);
      border-radius: 20px;
      padding: 16px 14px;
      text-align: center;
      margin-top: 14px;
      margin-bottom: 10px;
      box-shadow: 0 10px 24px rgba(0, 0, 0, 0.35);
      transition: transform 0.22s ease, box-shadow 0.22s ease;
    }
    .sidebar-topup-card:hover {
      transform: scale(1.02);
      box-shadow: 0 14px 32px rgba(124, 58, 237, 0.3);
    }
    .sidebar-topup-img-wrap {
      width: 58px;
      height: 58px;
      margin: 0 auto 6px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .sidebar-topup-coins {
      width: 52px;
      height: 52px;
      object-fit: contain;
      filter: drop-shadow(0 6px 14px rgba(245, 158, 11, 0.55));
      animation: floatCoin 3s ease-in-out infinite;
    }
    .sidebar-topup-title {
      font-family: 'Outfit', sans-serif;
      font-size: 14px;
      font-weight: 800;
      color: #ffffff;
      margin-bottom: 3px;
    }
    .sidebar-topup-desc {
      font-size: 11px;
      color: var(--muted);
      line-height: 1.35;
      margin-bottom: 12px;
    }
    .btn-sidebar-topup {
      background: linear-gradient(135deg, #f59e0b 0%, #eab308 100%);
      color: #0b0918;
      font-family: 'Outfit', sans-serif;
      font-weight: 800;
      font-size: 13px;
      padding: 9px 14px;
      border-radius: 12px;
      width: 100%;
      border: 1px solid rgba(255, 255, 255, 0.3);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      box-shadow: 0 6px 18px rgba(245, 158, 11, 0.4);
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .btn-sidebar-topup:hover {
      transform: scale(1.04);
      box-shadow: 0 10px 24px rgba(245, 158, 11, 0.6);
    }
    .sidebar-footer {
      border-top: 1px solid var(--border);
      padding-top: 10px;
    }

    /* ─── APP MAIN & HEADER ─── */
    .app-main {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-width: 0;
      min-height: 100vh;
    }
    .app-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      padding: 12px 24px;
      margin: 16px 28px 0;
      border-radius: 24px;
      background: linear-gradient(135deg, #18143d 0%, #2e1065 24%, #4338ca 52%, #6366f1 78%, #38bdf8 100%) !important;
      border: 1px solid rgba(255, 255, 255, 0.22) !important;
      box-shadow: 0 14px 38px rgba(79, 70, 229, 0.32), 0 2px 6px rgba(0, 0, 0, 0.12), inset 0 1px 1px rgba(255, 255, 255, 0.45) !important;
      position: relative;
      overflow: hidden;
      z-index: 90;
      animation: none !important;
      transition: none !important;
      transform: none !important;
      backdrop-filter: none !important;
      -webkit-backdrop-filter: none !important;
    }
    .app-header:hover {
      border-color: rgba(255, 255, 255, 0.22) !important;
      box-shadow: 0 14px 38px rgba(79, 70, 229, 0.32), 0 2px 6px rgba(0, 0, 0, 0.12), inset 0 1px 1px rgba(255, 255, 255, 0.45) !important;
      transform: none !important;
    }
    .app-header::before,
    .app-header::after {
      display: none !important;
      content: none !important;
    }
    .header-server-pill {
      display: flex;
      align-items: center;
      gap: 10px;
      background: rgba(10, 8, 28, 0.45) !important;
      backdrop-filter: blur(14px) !important;
      -webkit-backdrop-filter: blur(14px) !important;
      border: 1px solid rgba(255, 255, 255, 0.18) !important;
      padding: 6px 16px 6px 8px;
      border-radius: 30px;
      cursor: pointer;
      position: relative;
      animation: none !important;
      transition: none !important;
      transform: none !important;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
    }
    .header-server-pill:hover {
      background: rgba(15, 12, 38, 0.65) !important;
      border-color: rgba(255, 255, 255, 0.32) !important;
      transform: none !important;
    }
    .header-server-avatar-circle {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: #0f172a;
      border: 1.5px solid rgba(255, 255, 255, 0.35);
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: 'Outfit', sans-serif;
      font-size: 12px;
      font-weight: 800;
      color: #ffffff;
      flex-shrink: 0;
      overflow: hidden;
    }
    .header-server-text-wrap {
      display: flex;
      flex-direction: column;
      line-height: 1.2;
    }
    .header-server-name-label {
      font-family: 'Outfit', sans-serif;
      font-size: 13px;
      font-weight: 700;
      color: #ffffff;
      white-space: nowrap;
    }
    .header-server-members-label {
      font-size: 11px;
      font-weight: 600;
      color: #cbd5e1;
      white-space: nowrap;
    }
    .header-server-chevron {
      color: #cbd5e1;
      font-size: 12px;
      font-weight: 700;
      margin-left: 2px;
    }
    .header-server-select-hidden {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      opacity: 0;
      cursor: pointer;
      z-index: 2;
    }
    .discord-pill-icon {
      width: 18px;
      height: 18px;
      flex-shrink: 0;
    }
    .status-dot-green {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #10b981;
      box-shadow: 0 0 10px #10b981;
      flex-shrink: 0;
    }
    .header-server-select {
      background: transparent;
      border: none;
      color: var(--text-heading);
      font-family: 'Outfit', sans-serif;
      font-size: 13px;
      font-weight: 700;
      cursor: pointer;
      outline: none;
      padding-right: 4px;
    }
    .header-server-select option {
      background: var(--dropdown-bg);
      color: var(--dropdown-text);
    }
    .header-search-bar {
      display: flex;
      align-items: center;
      gap: 10px;
      background: var(--subcard-bg);
      border: 1px solid var(--border);
      padding: 8px 16px;
      border-radius: 24px;
      flex: 1;
      max-width: 440px;
      transition: all 0.2s ease;
    }
    .header-search-bar:focus-within {
      border-color: var(--accent);
      box-shadow: 0 0 18px var(--accent-glow);
    }
    .header-search-input {
      background: transparent;
      border: none;
      color: var(--text-heading);
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-size: 13px;
      width: 100%;
      outline: none;
    }
    .header-search-input::placeholder {
      color: var(--muted);
    }
    .search-kbd-badge {
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      font-weight: 600;
      color: var(--muted);
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.1);
      padding: 2px 6px;
      border-radius: 6px;
      flex-shrink: 0;
    }
    .header-right-actions {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-shrink: 0;
    }
    .header-icon-btn {
      width: 38px;
      height: 38px;
      border-radius: 12px;
      background: rgba(10, 8, 28, 0.45) !important;
      border: 1px solid rgba(255, 255, 255, 0.18) !important;
      color: var(--muted);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      position: relative;
      transition: all 0.2s ease;
    }
    .header-icon-btn:hover {
      color: var(--text-heading);
      border-color: var(--border-hover);
      transform: scale(1.05);
    }
    .notif-badge {
      position: absolute;
      top: 7px;
      right: 7px;
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: #ef4444;
      box-shadow: 0 0 8px #ef4444;
    }
    .header-profile-pill {
      display: flex;
      align-items: center;
      gap: 10px;
      background: rgba(10, 8, 28, 0.45) !important;
      backdrop-filter: blur(14px) !important;
      -webkit-backdrop-filter: blur(14px) !important;
      border: 1px solid rgba(255, 255, 255, 0.18) !important;
      padding: 5px 14px 5px 6px;
      border-radius: 24px;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
    }
    .profile-avatar {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      object-fit: cover;
      border: 1.5px solid rgba(255, 255, 255, 0.4);
    }
    .profile-username {
      font-family: 'Outfit', sans-serif;
      font-size: 13px;
      font-weight: 700;
      color: #ffffff !important;
    }
    .profile-role-tag {
      font-size: 10px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      padding: 3px 9px;
      border-radius: 12px;
      background: linear-gradient(135deg, rgba(244, 63, 94, 0.25), rgba(249, 115, 22, 0.3)) !important;
      border: 1px solid rgba(244, 63, 94, 0.5) !important;
      color: #fda4af !important;
      box-shadow: 0 0 10px rgba(244, 63, 94, 0.3) !important;
    }
    .theme-switch-pill {
      display: flex;
      align-items: center;
      background: rgba(10, 8, 28, 0.45) !important;
      border: 1px solid rgba(255, 255, 255, 0.18) !important;
      border-radius: 20px;
      padding: 3px;
      cursor: pointer;
      gap: 2px;
      transition: all 0.2s ease;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
    }
    .theme-switch-pill:hover {
      border-color: rgba(255, 255, 255, 0.3);
      transform: none !important;
    }
    .header-logout-btn {
      width: 38px;
      height: 38px;
      border-radius: 12px;
      background: #ffffff !important;
      border: 1px solid rgba(255, 255, 255, 0.9) !important;
      color: #0f172a !important;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      box-shadow: 0 4px 14px rgba(0, 0, 0, 0.16);
      transition: all 0.2s ease;
      text-decoration: none;
      flex-shrink: 0;
    }
    .header-logout-btn:hover {
      transform: none !important;
      box-shadow: 0 6px 18px rgba(0, 0, 0, 0.25);
    }
    .header-logout-btn svg {
      width: 18px;
      height: 18px;
      stroke: #0f172a !important;
    }
    .theme-pill-icon {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--muted);
      transition: all 0.2s ease;
    }
    .theme-pill-icon.active-theme-pill {
      background: linear-gradient(135deg, #7c3aed 0%, #6366f1 100%);
      color: #ffffff;
      box-shadow: 0 2px 10px rgba(124, 58, 237, 0.45);
    }
    .app-content {
      padding: 24px 28px 60px;
      flex: 1;
    }

    /* ─── DASHBOARD HERO (FULL WIDTH) ─── */
    .dash-hero-grid {
      display: grid;
      grid-template-columns: 1fr;
      width: 100%;
      margin-bottom: 22px;
    }
    .hero-cosmic-card {
      background: radial-gradient(circle at 82% 50%, rgba(139, 92, 246, 0.3) 0%, rgba(18, 13, 38, 0.95) 75%), linear-gradient(135deg, #161033 0%, #0d091e 100%);
      border: 1px solid rgba(139, 92, 246, 0.35);
      border-radius: 24px;
      padding: 28px 40px;
      position: relative;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: space-between;
      min-height: 210px;
      width: 100%;
      box-shadow: 0 16px 40px rgba(0, 0, 0, 0.45), inset 0 1px 1px rgba(255, 255, 255, 0.15);
      transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .hero-cosmic-card:hover {
      transform: translateY(-4px) scale(1.008);
      box-shadow: 0 20px 48px rgba(124, 58, 237, 0.35);
    }
    .hero-cosmic-content {
      position: relative;
      z-index: 2;
      max-width: 620px;
    }
    .hero-greeting {
      font-size: 15px;
      color: #cbd5e1;
      font-weight: 600;
    }
    .hero-username-title {
      font-family: 'Outfit', sans-serif;
      font-size: 30px;
      font-weight: 900;
      background: linear-gradient(135deg, #ffffff 0%, #f472b6 60%, #c084fc 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin: 4px 0 8px;
    }
    .hero-subtitle {
      font-size: 13px;
      color: #94a3b8;
      line-height: 1.5;
      margin-bottom: 16px;
    }
    .hero-meta-pills {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
    }
    .hero-pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 14px;
      border-radius: 20px;
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.12);
      color: #ffffff;
      font-size: 12px;
      font-weight: 700;
      font-family: 'Outfit', sans-serif;
    }
    .hero-orbital-center {
      position: relative;
      width: 160px;
      height: 160px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      z-index: 1;
      margin-right: 15px;
    }
    .orbital-glow-core {
      position: absolute;
      width: 120px;
      height: 120px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(245, 158, 11, 0.45) 0%, rgba(139, 92, 246, 0.4) 50%, transparent 70%);
      filter: blur(14px);
    }
    .orbital-ring {
      position: absolute;
      border-radius: 50%;
      border: 1.5px solid rgba(139, 92, 246, 0.6);
      box-shadow: 0 0 15px rgba(139, 92, 246, 0.45);
    }
    .ring-1 {
      width: 140px;
      height: 75px;
      transform: rotate(-25deg);
      border-color: rgba(168, 85, 247, 0.65);
      animation: spinRing1 12s linear infinite;
    }
    .ring-2 {
      width: 150px;
      height: 85px;
      transform: rotate(35deg);
      border-color: rgba(56, 189, 248, 0.55);
      animation: spinRing2 16s linear infinite reverse;
    }
    @keyframes spinRing1 {
      0% { transform: rotate(-25deg); }
      100% { transform: rotate(335deg); }
    }
    @keyframes spinRing2 {
      0% { transform: rotate(35deg); }
      100% { transform: rotate(395deg); }
    }
    .hero-orbital-coin {
      width: 105px;
      height: 105px;
      object-fit: contain;
      position: relative;
      z-index: 2;
      filter: drop-shadow(0 8px 24px rgba(245, 158, 11, 0.6));
      animation: floatCoin 4s ease-in-out infinite;
    }
    .floating-crystal {
      position: absolute;
      font-size: 18px;
      filter: drop-shadow(0 0 10px rgba(168, 85, 247, 0.8));
      pointer-events: none;
    }
    .crystal-1 { top: 22px; right: 190px; animation: floatCrystal 5s ease-in-out infinite; }
    .crystal-2 { bottom: 22px; right: 25px; animation: floatCrystal 6s ease-in-out infinite 1s; }
    .crystal-3 { top: 24px; right: 30px; font-size: 14px; animation: floatCrystal 4s ease-in-out infinite 2s; }
    @keyframes floatCrystal {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-8px); }
    }

    /* ─── 4 METRIC CARDS ─── */
    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
      margin-bottom: 22px;
    }
    .metric-card {
      background: rgba(18, 14, 38, 0.85);
      border-radius: 20px;
      padding: 18px 20px;
      display: flex;
      align-items: center;
      gap: 16px;
      box-shadow: 0 10px 28px rgba(0, 0, 0, 0.35);
      transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .metric-card:hover {
      transform: translateY(-4px) scale(1.02);
    }
    .metric-gold {
      border: 1px solid rgba(245, 158, 11, 0.35);
      box-shadow: 0 0 24px rgba(245, 158, 11, 0.08);
    }
    .metric-gold:hover {
      border-color: rgba(245, 158, 11, 0.6);
      box-shadow: 0 14px 34px rgba(245, 158, 11, 0.2);
    }
    .metric-blue {
      border: 1px solid rgba(59, 130, 246, 0.35);
      box-shadow: 0 0 24px rgba(59, 130, 246, 0.08);
    }
    .metric-blue:hover {
      border-color: rgba(59, 130, 246, 0.6);
      box-shadow: 0 14px 34px rgba(59, 130, 246, 0.2);
    }
    .metric-cyan {
      border: 1px solid rgba(20, 184, 166, 0.35);
      box-shadow: 0 0 24px rgba(20, 184, 166, 0.08);
    }
    .metric-cyan:hover {
      border-color: rgba(20, 184, 166, 0.6);
      box-shadow: 0 14px 34px rgba(20, 184, 166, 0.2);
    }
    .metric-magenta {
      border: 1px solid rgba(217, 70, 239, 0.35);
      box-shadow: 0 0 24px rgba(217, 70, 239, 0.08);
    }
    .metric-magenta:hover {
      border-color: rgba(217, 70, 239, 0.6);
      box-shadow: 0 14px 34px rgba(217, 70, 239, 0.2);
    }
    .metric-left-icon {
      width: 48px;
      height: 48px;
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .metric-coin-img {
      width: 44px;
      height: 44px;
      object-fit: contain;
      filter: drop-shadow(0 4px 10px rgba(245, 158, 11, 0.5));
    }
    .icon-blue-bg { background: rgba(59, 130, 246, 0.18); color: #3b82f6; border: 1px solid rgba(59, 130, 246, 0.35); }
    .icon-cyan-bg { background: rgba(20, 184, 166, 0.18); color: #14b8a6; border: 1px solid rgba(20, 184, 166, 0.35); }
    .icon-magenta-bg { background: rgba(217, 70, 239, 0.18); color: #d946ef; border: 1px solid rgba(217, 70, 239, 0.35); }
    .metric-body { flex: 1; min-width: 0; }
    .metric-label-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 12px;
      color: var(--muted);
      font-weight: 600;
    }
    .metric-eye { cursor: pointer; font-size: 14px; color: var(--muted); transition: color 0.15s; }
    .metric-eye:hover { color: var(--text-heading); }
    .metric-value-row {
      display: flex;
      align-items: baseline;
      gap: 6px;
      margin: 3px 0 2px;
    }
    .metric-num {
      font-family: 'Outfit', sans-serif;
      font-size: 26px;
      font-weight: 800;
      line-height: 1.1;
    }
    .gold-text { color: #fbbf24; }
    .white-text { color: #ffffff; }
    .cyan-text { color: #2dd4bf; }
    .magenta-text { color: #e879f9; }
    .metric-unit { font-size: 13px; font-weight: 700; color: var(--muted); }
    .metric-subtext {
      font-size: 11px;
      color: var(--muted);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    /* ─── TOP UP BANNER CARD ─── */
    .topup-banner-card {
      background: radial-gradient(circle at 10% 50%, rgba(245, 158, 11, 0.25) 0%, transparent 60%), linear-gradient(90deg, #1f143a 0%, #2b1754 50%, #1f143a 100%);
      border: 1px solid rgba(245, 158, 11, 0.4);
      border-radius: 20px;
      padding: 18px 28px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 22px;
      box-shadow: 0 12px 32px rgba(0, 0, 0, 0.4);
      position: relative;
      overflow: hidden;
      transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .topup-banner-card:hover {
      transform: translateY(-4px) scale(1.015);
      border-color: rgba(245, 158, 11, 0.65);
      box-shadow: 0 18px 42px rgba(245, 158, 11, 0.25);
    }
    .topup-banner-left {
      display: flex;
      align-items: center;
      gap: 20px;
    }
    .topup-coins-stack {
      width: 58px;
      height: 58px;
      flex-shrink: 0;
    }
    .banner-coins-img {
      width: 100%;
      height: 100%;
      object-fit: contain;
      filter: drop-shadow(0 6px 14px rgba(245, 158, 11, 0.6));
    }
    .topup-banner-title {
      font-family: 'Outfit', sans-serif;
      font-size: 18px;
      font-weight: 800;
      color: #ffffff;
      margin-bottom: 4px;
    }
    .topup-banner-subtitle {
      font-size: 13px;
      color: #cbd5e1;
    }
    .topup-banner-right {
      display: flex;
      align-items: center;
      gap: 18px;
    }
    .btn-topup-gold-glow {
      background: linear-gradient(135deg, #f59e0b 0%, #eab308 100%);
      color: #0b0918;
      font-family: 'Outfit', sans-serif;
      font-weight: 800;
      font-size: 14px;
      padding: 12px 24px;
      border-radius: 14px;
      border: 1px solid rgba(255, 255, 255, 0.35);
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      box-shadow: 0 8px 24px rgba(245, 158, 11, 0.45);
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .btn-topup-gold-glow:hover {
      transform: scale(1.05);
      box-shadow: 0 12px 32px rgba(245, 158, 11, 0.7);
    }

    /* ─── FEATURED PRODUCTS SHELF ─── */
    .shelf-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 22px;
      margin-bottom: 24px;
      align-items: stretch;
    }
    .shelf-card {
      background: rgba(18, 14, 38, 0.85);
      border: 1px solid rgba(139, 92, 246, 0.3);
      border-radius: 24px;
      padding: 22px;
      box-shadow: 0 12px 32px rgba(0, 0, 0, 0.4);
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      transition: transform 0.28s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.28s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.28s ease;
      transform-origin: center center;
    }
    .shelf-card:hover {
      transform: translateY(-4px) scale(1.012);
      border-color: rgba(139, 92, 246, 0.55);
      box-shadow: 0 20px 48px rgba(124, 58, 237, 0.25);
    }
    .shelf-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 18px;
    }
    .shelf-header-left {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .shelf-header-icon {
      width: 34px;
      height: 34px;
      border-radius: 12px;
      background: rgba(139, 92, 246, 0.2);
      border: 1px solid rgba(139, 92, 246, 0.35);
      color: #a78bfa;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.2s ease;
    }
    .shelf-card:hover .shelf-header-icon {
      transform: scale(1.1);
    }
    .shelf-title {
      font-family: 'Outfit', sans-serif;
      font-size: 15px;
      font-weight: 700;
      color: var(--text-heading);
    }
    .shelf-subtitle {
      font-size: 11px;
      color: var(--muted);
      margin-top: 1px;
    }
    .shelf-action-pill {
      background: var(--subcard-bg);
      border: 1px solid var(--border-accent);
      color: #a78bfa;
      font-family: 'Outfit', sans-serif;
      font-size: 12px;
      font-weight: 700;
      padding: 6px 14px;
      border-radius: 14px;
      cursor: pointer;
      transition: all 0.22s ease;
    }
    .shelf-action-pill:hover {
      background: rgba(139, 92, 246, 0.25);
      border-color: #a78bfa;
      color: #ffffff;
      transform: scale(1.05);
    }

    /* Featured Products Dynamic Grid & Hero */
    .featured-products-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
      gap: 16px;
      flex: 1;
      align-items: stretch;
    }
    .featured-products-grid.single-item {
      display: flex;
      flex-direction: column;
      grid-template-columns: none;
    }
    .featured-products-grid.double-item {
      grid-template-columns: repeat(2, 1fr);
    }

    .featured-item-card {
      background: var(--subcard-bg);
      border: 1px solid var(--border);
      border-radius: 18px;
      padding: 16px 12px;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: space-between;
      position: relative;
      transition: transform 0.26s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.26s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.26s ease;
      cursor: pointer;
    }
    .featured-item-card:hover {
      transform: translateY(-5px) scale(1.035);
      border-color: rgba(139, 92, 246, 0.6);
      box-shadow: 0 14px 32px rgba(124, 58, 237, 0.3);
    }

    /* Single Hero Featured Card Layout */
    .featured-hero-card {
      background: linear-gradient(135deg, rgba(139, 92, 246, 0.12) 0%, rgba(30, 27, 75, 0.25) 50%, rgba(18, 14, 38, 0.6) 100%);
      border: 1.5px solid rgba(139, 92, 246, 0.35);
      border-radius: 20px;
      padding: 24px 22px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      flex: 1;
      width: 100%;
      min-height: 270px;
      position: relative;
      cursor: pointer;
      transition: transform 0.28s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.28s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.28s ease;
    }
    .featured-hero-card:hover {
      transform: translateY(-5px) scale(1.025);
      border-color: rgba(168, 85, 247, 0.7);
      box-shadow: 0 18px 45px rgba(124, 58, 237, 0.35);
    }
    .hero-badge-pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: linear-gradient(135deg, #ef4444 0%, #f97316 100%);
      color: #ffffff;
      font-size: 11px;
      font-weight: 800;
      padding: 4px 14px;
      border-radius: 20px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 12px;
      box-shadow: 0 4px 14px rgba(239, 68, 68, 0.4);
    }
    .hero-icon-circle {
      width: 62px;
      height: 62px;
      border-radius: 20px;
      background: linear-gradient(135deg, rgba(245, 158, 11, 0.25), rgba(139, 92, 246, 0.25));
      border: 1.5px solid rgba(245, 158, 11, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 30px;
      margin-bottom: 12px;
      box-shadow: 0 8px 24px rgba(245, 158, 11, 0.25);
      transition: transform 0.22s ease;
    }
    .featured-hero-card:hover .hero-icon-circle {
      transform: scale(1.12) rotate(4deg);
    }
    .hero-title {
      font-family: 'Outfit', sans-serif;
      font-weight: 800;
      font-size: 20px;
      color: var(--text-heading);
      margin-bottom: 6px;
    }
    .hero-desc {
      font-size: 13px;
      color: var(--muted);
      max-width: 420px;
      margin-bottom: 14px;
      line-height: 1.5;
    }
    .hero-price-tag {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-family: 'Outfit', sans-serif;
      font-weight: 800;
      font-size: 16px;
      color: #fbbf24;
      background: rgba(245, 158, 11, 0.12);
      border: 1px solid rgba(245, 158, 11, 0.35);
      padding: 6px 18px;
      border-radius: 20px;
      margin-bottom: 16px;
    }
    .hero-purchase-btn {
      background: linear-gradient(135deg, #7c3aed 0%, #6366f1 100%);
      color: #ffffff;
      font-family: 'Outfit', sans-serif;
      font-size: 13px;
      font-weight: 700;
      padding: 10px 28px;
      border-radius: 14px;
      border: 1px solid rgba(255, 255, 255, 0.25);
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      transition: all 0.2s ease;
      box-shadow: 0 6px 20px rgba(124, 58, 237, 0.45);
    }
    .hero-purchase-btn:hover {
      transform: scale(1.05);
      box-shadow: 0 10px 28px rgba(124, 58, 237, 0.65);
    }

    .item-tag-popular {
      position: absolute;
      top: 10px;
      right: 10px;
      font-size: 9px;
      font-weight: 800;
      background: #ef4444;
      color: #ffffff;
      padding: 2px 6px;
      border-radius: 6px;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    .item-icon-circle {
      width: 48px;
      height: 48px;
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 22px;
      margin: 8px 0 10px;
      transition: transform 0.2s ease;
    }
    .featured-item-card:hover .item-icon-circle {
      transform: scale(1.12);
    }
    .gold-circle { background: rgba(245, 158, 11, 0.15); border: 1px solid rgba(245, 158, 11, 0.35); }
    .purple-circle { background: rgba(139, 92, 246, 0.15); border: 1px solid rgba(139, 92, 246, 0.35); }
    .key-circle { background: rgba(234, 179, 8, 0.15); border: 1px solid rgba(234, 179, 8, 0.35); }
    .cyan-circle { background: rgba(6, 182, 212, 0.15); border: 1px solid rgba(6, 182, 212, 0.35); }
    .item-title {
      font-family: 'Outfit', sans-serif;
      font-weight: 800;
      font-size: 14px;
      color: var(--text-heading);
      margin-bottom: 6px;
    }
    .item-price {
      display: flex;
      align-items: center;
      gap: 5px;
      font-family: 'Outfit', sans-serif;
      font-weight: 800;
      font-size: 13px;
      color: #fbbf24;
      margin-bottom: 12px;
    }
    .mini-coin-badge {
      width: 16px;
      height: 16px;
      object-fit: contain;
    }
    .btn-item-purchase {
      background: linear-gradient(135deg, #7c3aed 0%, #6366f1 100%);
      color: #ffffff;
      font-family: 'Outfit', sans-serif;
      font-size: 12px;
      font-weight: 700;
      padding: 8px 16px;
      border-radius: 12px;
      border: 1px solid rgba(255, 255, 255, 0.25);
      cursor: pointer;
      width: 100%;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      transition: all 0.2s ease;
      box-shadow: 0 4px 14px rgba(124, 58, 237, 0.35);
    }
    .btn-item-purchase:hover {
      transform: scale(1.05);
      box-shadow: 0 8px 22px rgba(124, 58, 237, 0.55);
    }



    /* ─── 4 QUICK NAVIGATION ACTION CARDS ─── */
    .quick-nav-cards-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
      margin-bottom: 22px;
    }
    .quick-nav-card {
      background: rgba(18, 14, 38, 0.85);
      border: 1px solid rgba(139, 92, 246, 0.28);
      border-radius: 18px;
      padding: 16px 18px;
      display: flex;
      align-items: center;
      gap: 14px;
      cursor: pointer;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
      transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .quick-nav-card:hover {
      transform: translateY(-4px) scale(1.02);
      border-color: var(--border-hover);
      box-shadow: 0 14px 32px rgba(124, 58, 237, 0.25);
    }
    .quick-nav-icon-box {
      width: 42px;
      height: 42px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .q-blue { background: rgba(59, 130, 246, 0.18); color: #3b82f6; border: 1px solid rgba(59, 130, 246, 0.35); }
    .q-cyan { background: rgba(20, 184, 166, 0.18); color: #14b8a6; border: 1px solid rgba(20, 184, 166, 0.35); }
    .q-green { background: rgba(16, 185, 129, 0.18); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.35); }
    .q-purple { background: rgba(139, 92, 246, 0.18); color: #a78bfa; border: 1px solid rgba(139, 92, 246, 0.35); }
    .quick-nav-text { flex: 1; min-width: 0; }
    .q-title {
      font-family: 'Outfit', sans-serif;
      font-size: 14px;
      font-weight: 800;
      color: var(--text-heading);
    }
    .q-desc {
      font-size: 11px;
      color: var(--muted);
      margin-top: 2px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .q-arrow {
      color: var(--muted);
      font-size: 18px;
      transition: transform 0.2s ease, color 0.2s ease;
    }
    .quick-nav-card:hover .q-arrow {
      transform: translateX(3px);
      color: var(--text-heading);
    }

    /* ═══════════════════════════════════════════════════════════════
       MOBILE & TABLET RESPONSIVE SYSTEM (PHONE + PC PERFECT)
       ═══════════════════════════════════════════════════════════════ */
    .sidebar-backdrop {
      display: none;
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.65);
      z-index: 999 !important;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.25s ease;
    }
    .sidebar-backdrop.active {
      display: block !important;
      opacity: 1 !important;
      pointer-events: auto !important;
    }
    body.sidebar-open-scroll-lock {
      overflow: hidden !important;
    }

    .mobile-bottom-nav {
      display: none;
    }

    .sidebar-mobile-header {
      display: none;
    }

  `;
}
