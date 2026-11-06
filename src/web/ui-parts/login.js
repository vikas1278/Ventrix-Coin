// Login page renderer
export function renderLoginPage({ hasSecret, shopName, coinName }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>VENTRIX COIN — Login</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@600;700;800;900&family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    html, body {
      width: 100%;
      height: 100%;
      overflow: hidden;
      font-family: 'Outfit', -apple-system, BlinkMacSystemFont, sans-serif;
    }
    body {
      background-color: #f1edfa;
      background-image: 
        radial-gradient(ellipse at 50% 35%, rgba(255, 255, 255, 0.45) 0%, rgba(236, 231, 251, 0.65) 100%),
        url('/assets/liquid-glass-bg.jpg');
      background-size: cover;
      background-position: center center;
      background-repeat: no-repeat;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      user-select: none;
      -webkit-font-smoothing: antialiased;
      perspective: 1000px;
    }

    /* ─── Ambient Lighting Glows ─── */
    .ambient-glow {
      position: absolute;
      border-radius: 50%;
      pointer-events: none;
      z-index: 1;
    }
    .ambient-glow-1 {
      width: 580px;
      height: 580px;
      top: -100px;
      left: -100px;
      background: radial-gradient(circle, rgba(192, 132, 252, 0.22) 0%, rgba(168, 85, 247, 0.08) 45%, transparent 70%);
      filter: blur(80px);
      animation: floatGlow 16s ease-in-out infinite alternate;
    }
    .ambient-glow-2 {
      width: 620px;
      height: 620px;
      bottom: -120px;
      right: -80px;
      background: radial-gradient(circle, rgba(244, 114, 182, 0.20) 0%, rgba(236, 72, 153, 0.08) 45%, transparent 70%);
      filter: blur(85px);
      animation: floatGlow 20s ease-in-out infinite alternate-reverse;
    }
    @keyframes floatGlow {
      0% { transform: translate(0, 0) scale(1); }
      100% { transform: translate(25px, 20px) scale(1.08); }
    }

    /* ─── Centered Frosted-Glass Login Card ─── */
    .login-wrapper {
      position: relative;
      z-index: 10;
      width: 100%;
      max-width: 480px;
      padding: 24px;
      perspective: 1200px;
    }
    .login-card {
      background: rgba(255, 255, 255, 0.42);
      backdrop-filter: blur(32px) saturate(190%);
      -webkit-backdrop-filter: blur(32px) saturate(190%);
      border: 1.5px solid rgba(255, 255, 255, 0.90);
      border-radius: 36px;
      padding: 48px 46px 42px;
      box-shadow: 
        0 30px 80px -15px rgba(110, 85, 180, 0.24),
        0 10px 25px -5px rgba(0, 0, 0, 0.04),
        inset 0 1px 2px rgba(255, 255, 255, 1);
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.35s ease;
      animation: cardEntrance 0.85s cubic-bezier(0.16, 1, 0.3, 1);
      transform-style: preserve-3d;
      will-change: transform;
    }
    .login-card:hover {
      box-shadow: 
        0 38px 95px -15px rgba(100, 75, 185, 0.32),
        0 12px 32px -5px rgba(0, 0, 0, 0.06),
        inset 0 1px 2px rgba(255, 255, 255, 1);
    }
    @keyframes cardEntrance {
      0% { opacity: 0; transform: translateY(24px) scale(0.96); }
      100% { opacity: 1; transform: translateY(0) scale(1); }
    }

    /* ─── 3D V Coin Emblem ─── */
    .emblem-container {
      width: 116px;
      height: 116px;
      margin-bottom: 22px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
      cursor: pointer;
      animation: floatCoin 4.5s ease-in-out infinite;
    }
    .login-card:hover .emblem-container,
    .emblem-container:hover {
      transform: translateY(-5px) scale(1.08);
    }
    @keyframes floatCoin {
      0%, 100% { transform: translateY(0) rotate(0deg); }
      50% { transform: translateY(-7px) rotate(1.5deg); }
    }
    .v-logo-img {
      width: 100%;
      height: 100%;
      object-fit: contain;
      filter: drop-shadow(0 14px 26px rgba(217, 119, 6, 0.35)) drop-shadow(0 8px 18px rgba(124, 58, 237, 0.30));
      user-select: none;
      -webkit-user-drag: none;
    }

    /* ─── Brand Wordmark ─── */
    .brand-title {
      font-family: 'Outfit', sans-serif;
      font-size: 29px;
      font-weight: 900;
      color: #0b132b;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      margin-bottom: 34px;
      line-height: 1;
      text-shadow: 0 1px 1px rgba(255, 255, 255, 0.85);
    }

    /* ─── Discord Login Pill Button ─── */
    .btn-discord {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      padding: 14px 18px 14px 24px;
      border-radius: 9999px;
      background: linear-gradient(90deg, #4f46e5 0%, #5865F2 50%, #4338ca 100%);
      border: 1px solid rgba(255, 255, 255, 0.38);
      color: #ffffff;
      text-decoration: none;
      box-shadow: 
        0 12px 28px -4px rgba(88, 101, 242, 0.50),
        0 4px 12px rgba(0, 0, 0, 0.06),
        inset 0 1px 1px rgba(255, 255, 255, 0.5);
      transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
      position: relative;
      overflow: hidden;
      cursor: pointer;
    }
    .btn-discord:hover {
      transform: translateY(-2px) scale(1.018);
      box-shadow: 
        0 16px 36px -4px rgba(88, 101, 242, 0.65),
        inset 0 1px 1px rgba(255, 255, 255, 0.65);
    }
    .btn-discord:active {
      transform: translateY(1px) scale(0.985);
      box-shadow: 0 6px 16px rgba(88, 101, 242, 0.38);
    }
    .btn-discord-left {
      display: flex;
      align-items: center;
      gap: 14px;
    }
    .discord-icon {
      width: 24px;
      height: 18px;
      fill: #ffffff;
      flex-shrink: 0;
    }
    .btn-text {
      font-family: 'Outfit', sans-serif;
      font-size: 16px;
      font-weight: 700;
      color: #ffffff;
      letter-spacing: 0.01em;
      white-space: nowrap;
    }
    .btn-arrow-circle {
      width: 34px;
      height: 34px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.18);
      border: 1px solid rgba(255, 255, 255, 0.38);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #ffffff;
      transition: transform 0.25s ease, background 0.25s ease;
      flex-shrink: 0;
    }
    .btn-discord:hover .btn-arrow-circle {
      transform: translateX(3px);
      background: rgba(255, 255, 255, 0.28);
    }

    /* Loading Spinner */
    .btn-spinner {
      display: none;
      width: 18px;
      height: 18px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-top-color: #ffffff;
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
    }
    .btn-discord.loading .btn-arrow-svg {
      display: none;
    }
    .btn-discord.loading .btn-spinner {
      display: block;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    /* ─── Mobile Responsiveness ─── */
    @media (max-width: 640px) {
      .login-wrapper {
        padding: 16px;
      }
      .login-card {
        padding: 42px 28px 36px;
        border-radius: 30px;
      }
      .brand-title {
        font-size: 24px;
        letter-spacing: 0.14em;
        margin-bottom: 28px;
      }
      .btn-text {
        font-size: 15px;
      }
      .emblem-container {
        width: 96px;
        height: 96px;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      *, *::before, *::after {
        animation: none !important;
        transition: none !important;
      }
      .login-card {
        transform: none !important;
      }
    }
  </style>
</head>
<body>
  <!-- Ambient Glow Lights -->
  <div class="ambient-glow ambient-glow-1"></div>
  <div class="ambient-glow ambient-glow-2"></div>

  <!-- Centered Frosted-Glass Login Card -->
  <main class="login-wrapper">
    <div class="login-card" id="tilt-card">
      
      <!-- 1. 3D Ventrix Coin -->
      <div class="emblem-container" title="Ventrix Coin">
        <img src="/assets/vyntrix-coin.png" alt="Ventrix Coin" class="v-logo-img">
      </div>

      <!-- 2. Brand Name -->
      <h1 class="brand-title">VENTRIX COIN</h1>

      <!-- 3. One Primary Button: Login with Discord -->
      <a href="/auth/login" id="discord-login-btn" class="btn-discord" onclick="handleLoginClick(event)">
        <div class="btn-discord-left">
          <svg class="discord-icon" viewBox="0 0 127.14 96.36">
            <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1,105.25,105.25,0,0,0,32.19-16.14c2.64-27.38-4.51-51.11-18.9-72.15ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.86,53,48.83,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,46,96.12,53,91.08,65.69,84.69,65.69Z"/>
          </svg>
          <span class="btn-text">Login with Discord</span>
        </div>
        <div class="btn-arrow-circle">
          <svg class="btn-arrow-svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
          </svg>
          <div class="btn-spinner"></div>
        </div>
      </a>

    </div>
  </main>

  <script>
    function handleLoginClick(e) {
      const btn = document.getElementById('discord-login-btn');
      if (btn && !btn.classList.contains('loading')) {
        btn.classList.add('loading');
      }
    }

    // Smooth scale hover without sideways card tilting
    (function() {
      const card = document.getElementById('tilt-card');
      if (!card) return;
      card.style.transition = 'transform 0.28s cubic-bezier(0.16, 1, 0.3, 1)';
      card.addEventListener('mouseenter', () => {
        card.style.transform = 'translateY(-4px) scale(1.015)';
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = 'translateY(0) scale(1)';
      });
    })();
  </script>
</body>
</html>`;
}
