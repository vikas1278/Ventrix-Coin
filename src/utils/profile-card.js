import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createCanvas, loadImage } from '@napi-rs/canvas';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const COIN_ICON_PATH = path.resolve(__dirname, '../assets/emojis/vyntrix_coin_gold.png');

function roundRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

/**
 * Draws a multi-layered Liquid Glassmorphism panel with specular top highlight
 */
function drawGlassPanel(ctx, x, y, width, height, radius = 18, borderHighlight = 'rgba(255, 255, 255, 0.12)') {
  ctx.save();

  // 1. Frosted Liquid Glass Body Gradient
  const glassGrad = ctx.createLinearGradient(x, y, x + width * 0.4, y + height);
  glassGrad.addColorStop(0, 'rgba(255, 255, 255, 0.07)');
  glassGrad.addColorStop(0.3, 'rgba(255, 255, 255, 0.025)');
  glassGrad.addColorStop(0.8, 'rgba(255, 255, 255, 0.015)');
  glassGrad.addColorStop(1, 'rgba(255, 255, 255, 0.05)');

  ctx.fillStyle = glassGrad;
  roundRect(ctx, x, y, width, height, radius);
  ctx.fill();

  // 2. Translucent Glass Border
  ctx.strokeStyle = borderHighlight;
  ctx.lineWidth = 1.2;
  roundRect(ctx, x, y, width, height, radius);
  ctx.stroke();

  // 3. Specular Liquid Top-Edge Refraction Highlight
  ctx.save();
  ctx.beginPath();
  roundRect(ctx, x, y, width, height, radius);
  ctx.clip();

  const highlightGrad = ctx.createLinearGradient(x + 15, y, x + width - 15, y);
  highlightGrad.addColorStop(0, 'rgba(255, 255, 255, 0.0)');
  highlightGrad.addColorStop(0.3, 'rgba(255, 255, 255, 0.35)');
  highlightGrad.addColorStop(0.7, 'rgba(255, 255, 255, 0.35)');
  highlightGrad.addColorStop(1, 'rgba(255, 255, 255, 0.0)');

  ctx.strokeStyle = highlightGrad;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x + 10, y + 1);
  ctx.lineTo(x + width - 10, y + 1);
  ctx.stroke();
  ctx.restore();

  ctx.restore();
}

/**
 * Draws modern tech corner brackets / crosshairs (+)
 */
function drawTechCrosshair(ctx, x, y, size = 8, color = 'rgba(6, 182, 212, 0.45)') {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(x - size, y);
  ctx.lineTo(x + size, y);
  ctx.moveTo(x, y - size);
  ctx.lineTo(x, y + size);
  ctx.stroke();
  ctx.restore();
}

/**
 * Generates an ultra-modern Liquid Glass & Cyber Tech Discord Wallet Card
 */
export async function generateProfileCardImage({
  username,
  userId,
  avatarUrl,
  tierBadge = 'VIP',
  balance = 0,
  totalPurchased = 0,
  totalSpent = 0
}) {
  const width = 860;
  const height = 460;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  ctx.imageSmoothingEnabled = true;

  // 1. Clean Canvas
  ctx.clearRect(0, 0, width, height);

  // 2. Base Dimensions
  const cardX = 12;
  const cardY = 12;
  const cardW = width - 24;
  const cardH = height - 24;
  const cardR = 26;

  // 3. Cyber Neon Ambient Outer Glow
  ctx.save();
  const neonGrad = ctx.createLinearGradient(cardX, cardY, cardX + cardW, cardY + cardH);
  neonGrad.addColorStop(0, '#00f2fe'); // Electric Cyan
  neonGrad.addColorStop(0.5, '#7928ca'); // Cyber Purple
  neonGrad.addColorStop(1, '#ff0080'); // Neon Magenta

  ctx.shadowColor = 'rgba(121, 40, 202, 0.55)';
  ctx.shadowBlur = 22;
  ctx.strokeStyle = neonGrad;
  ctx.lineWidth = 2.5;
  roundRect(ctx, cardX, cardY, cardW, cardH, cardR);
  ctx.stroke();
  ctx.restore();

  // 4. Deep Obsidian Midnight Base
  ctx.save();
  roundRect(ctx, cardX, cardY, cardW, cardH, cardR);
  ctx.clip();

  const baseFill = ctx.createLinearGradient(0, 0, width, height);
  baseFill.addColorStop(0, '#0a0b12');
  baseFill.addColorStop(0.5, '#0e101a');
  baseFill.addColorStop(1, '#07080d');
  ctx.fillStyle = baseFill;
  ctx.fillRect(cardX, cardY, cardW, cardH);

  // 5. Liquid Fluid Mesh Orbs (Luminous organic floating glows)
  // Liquid Orb 1 (Top-Left / Cyber Violet)
  const orb1 = ctx.createRadialGradient(cardX + 110, cardY + 70, 10, cardX + 110, cardY + 70, 260);
  orb1.addColorStop(0, 'rgba(147, 51, 234, 0.35)');
  orb1.addColorStop(0.6, 'rgba(147, 51, 234, 0.08)');
  orb1.addColorStop(1, 'transparent');
  ctx.fillStyle = orb1;
  ctx.fillRect(cardX, cardY, cardW, cardH);

  // Liquid Orb 2 (Middle-Right / Cyan-Teal)
  const orb2 = ctx.createRadialGradient(cardX + cardW - 130, cardY + 220, 20, cardX + cardW - 130, cardY + 220, 280);
  orb2.addColorStop(0, 'rgba(6, 182, 212, 0.32)');
  orb2.addColorStop(0.5, 'rgba(6, 182, 212, 0.08)');
  orb2.addColorStop(1, 'transparent');
  ctx.fillStyle = orb2;
  ctx.fillRect(cardX, cardY, cardW, cardH);

  // Liquid Orb 3 (Bottom-Center / Hot Magenta)
  const orb3 = ctx.createRadialGradient(cardX + 380, cardY + cardH - 30, 10, cardX + 380, cardY + cardH - 30, 220);
  orb3.addColorStop(0, 'rgba(236, 72, 153, 0.22)');
  orb3.addColorStop(0.7, 'rgba(236, 72, 153, 0.03)');
  orb3.addColorStop(1, 'transparent');
  ctx.fillStyle = orb3;
  ctx.fillRect(cardX, cardY, cardW, cardH);

  // 6. Modern Tech Dotted Matrix Grid
  ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
  const gridStep = 32;
  for (let gx = cardX + 16; gx < cardX + cardW - 16; gx += gridStep) {
    for (let gy = cardY + 16; gy < cardY + cardH - 16; gy += gridStep) {
      ctx.beginPath();
      ctx.arc(gx, gy, 1, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Tech Corner Crosshairs
  drawTechCrosshair(ctx, cardX + 24, cardY + 24, 7, 'rgba(0, 242, 254, 0.5)');
  drawTechCrosshair(ctx, cardX + cardW - 24, cardY + 24, 7, 'rgba(0, 242, 254, 0.5)');
  drawTechCrosshair(ctx, cardX + 24, cardY + cardH - 24, 7, 'rgba(255, 0, 128, 0.4)');
  drawTechCrosshair(ctx, cardX + cardW - 24, cardY + cardH - 24, 7, 'rgba(255, 0, 128, 0.4)');

  ctx.restore(); // end clip

  // 7. Panel 1: User Profile Glass Box
  const userBoxX = cardX + 20;
  const userBoxY = cardY + 20;
  const userBoxW = cardW - 40;
  const userBoxH = 88;

  drawGlassPanel(ctx, userBoxX, userBoxY, userBoxW, userBoxH, 18, 'rgba(255, 255, 255, 0.1)');

  // User Avatar with glowing double-ring
  const avatarSize = 60;
  const avatarX = userBoxX + 16;
  const avatarY = userBoxY + (userBoxH - avatarSize) / 2;

  ctx.save();
  ctx.beginPath();
  ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
  ctx.closePath();
  ctx.clip();

  try {
    if (avatarUrl) {
      const avatarImg = await loadImage(avatarUrl);
      ctx.drawImage(avatarImg, avatarX, avatarY, avatarSize, avatarSize);
    } else {
      ctx.fillStyle = '#6366f1';
      ctx.fillRect(avatarX, avatarY, avatarSize, avatarSize);
    }
  } catch (_) {
    ctx.fillStyle = '#6366f1';
    ctx.fillRect(avatarX, avatarY, avatarSize, avatarSize);
  }
  ctx.restore();

  // Avatar Cyber Gradient Ring
  const avatarRingGrad = ctx.createLinearGradient(avatarX, avatarY, avatarX + avatarSize, avatarY + avatarSize);
  avatarRingGrad.addColorStop(0, '#00f2fe');
  avatarRingGrad.addColorStop(1, '#9d4edd');
  ctx.strokeStyle = avatarRingGrad;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2 + 1, 0, Math.PI * 2);
  ctx.stroke();

  // Online Pulse Dot
  const dotX = avatarX + avatarSize - 4;
  const dotY = avatarY + avatarSize - 4;
  ctx.fillStyle = '#10b981';
  ctx.beginPath();
  ctx.arc(dotX, dotY, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#0e101a';
  ctx.lineWidth = 2.5;
  ctx.stroke();

  // Username
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 24px "Segoe UI", sans-serif';
  const cleanName = username.length > 20 ? username.slice(0, 19) + '…' : username;
  ctx.fillText(cleanName, avatarX + avatarSize + 18, userBoxY + 41);

  // User Cyber Subtitle
  ctx.fillStyle = '#64748b';
  ctx.font = '500 13px "Segoe UI", sans-serif';
  ctx.fillText(userId ? `// ID: ${userId}  •  VYNTRIX COIN WALLET` : '// VERIFIED WALLET ACCOUNT', avatarX + avatarSize + 18, userBoxY + 65);

  function getTierTheme(tier) {
    const t = String(tier || '').toUpperCase();
    if (t.includes('OWNER')) {
      return {
        border: '#f43f5e', // Cyber Crimson-Red
        glow: 'rgba(244, 63, 94, 0.65)',
        bg: 'rgba(244, 63, 94, 0.18)',
        text: '#ff3b69',
        label: 'OWNER'
      };
    }
    if (t.includes('ADMIN')) {
      return {
        border: '#06b6d4', // Electric Tech Cyan
        glow: 'rgba(6, 182, 212, 0.65)',
        bg: 'rgba(6, 182, 212, 0.18)',
        text: '#22d3ee',
        label: 'ADMIN'
      };
    }
    if (t.includes('STAFF')) {
      return {
        border: '#10b981', // Neon Emerald Green
        glow: 'rgba(16, 185, 129, 0.6)',
        bg: 'rgba(16, 185, 129, 0.18)',
        text: '#34d399',
        label: 'STAFF'
      };
    }
    if (t.includes('DIAMOND')) {
      return {
        border: '#a855f7', // Radiant Purple / Diamond
        glow: 'rgba(168, 85, 247, 0.6)',
        bg: 'rgba(168, 85, 247, 0.18)',
        text: '#8e2feeff',
        label: 'DIAMOND'
      };
    }
    if (t.includes('GOLD')) {
      return {
        border: '#eab308', // Radiant Pure Gold
        glow: 'rgba(234, 179, 8, 0.6)',
        bg: 'rgba(234, 179, 8, 0.18)',
        text: '#facc15',
        label: 'GOLD'
      };
    }
    if (t.includes('SILVER')) {
      return {
        border: '#94a3b8', // Silver Platinum
        glow: 'rgba(148, 163, 184, 0.5)',
        bg: 'rgba(148, 163, 184, 0.15)',
        text: '#e2e8f0',
        label: 'SILVER'
      };
    }
    if (t.includes('VIP')) {
      return {
        border: '#d97706', // Cyber Amber / VIP
        glow: 'rgba(217, 119, 6, 0.55)',
        bg: 'rgba(217, 119, 6, 0.16)',
        text: '#39fb24', // User's neon green
        label: 'VIP'
      };
    }
    return {
      border: '#0db2f8ff', // Cyber Tech Cyan / Member
      glow: 'rgba(56, 189, 248, 0.45)',
      bg: 'rgba(56, 189, 248, 0.14)',
      text: '#7dd3fc',
      label: 'MEMBER'
    };
  }

  // Glowing Cyber Role/Tier Badge (clean text without any broken glyph boxes)
  const theme = getTierTheme(tierBadge);
  const badgeText = theme.label;
  ctx.font = 'bold 13px "Segoe UI", sans-serif';
  const textWidth = ctx.measureText(badgeText).width;
  const badgePadX = 18;
  const badgeW = textWidth + badgePadX * 2;
  const badgeH = 32;
  const badgeX = userBoxX + userBoxW - badgeW - 16;
  const badgeY = userBoxY + (userBoxH - badgeH) / 2;

  ctx.save();
  ctx.shadowColor = theme.glow;
  ctx.shadowBlur = 12;
  ctx.fillStyle = theme.bg;
  ctx.strokeStyle = theme.border;
  ctx.lineWidth = 1.4;
  roundRect(ctx, badgeX, badgeY, badgeW, badgeH, 16);
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  ctx.save();
  ctx.fillStyle = theme.text;
  ctx.font = 'bold 13px "Segoe UI", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(badgeText, badgeX + badgeW / 2, badgeY + badgeH / 2);
  ctx.restore();

  // 8. Panel 2: Big Liquid Balance Box
  const balBoxX = userBoxX;
  const balBoxY = userBoxY + userBoxH + 16;
  const balBoxW = userBoxW;
  const balBoxH = 152;

  drawGlassPanel(ctx, balBoxX, balBoxY, balBoxW, balBoxH, 20, 'rgba(255, 255, 255, 0.12)');

  // Cyber Mini-Label: "BALANCE" with live cyber indicator
  ctx.fillStyle = '#94a3b8';
  ctx.font = '700 15px "Segoe UI", sans-serif';
  ctx.fillText('BALANCE', balBoxX + 26, balBoxY + 42);

  // Small Glowing Live Indicator Pill
  const pillX = balBoxX + 115;
  const pillY = balBoxY + 28;
  ctx.fillStyle = 'rgba(34, 197, 94, 0.15)';
  ctx.strokeStyle = 'rgba(34, 197, 94, 0.6)';
  ctx.lineWidth = 1;
  roundRect(ctx, pillX, pillY, 58, 20, 10);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#22c55e';
  ctx.beginPath();
  ctx.arc(pillX + 10, pillY + 10, 3.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.font = 'bold 11px "Segoe UI", sans-serif';
  ctx.fillText('LIVE', pillX + 19, pillY + 14);

  // Big Balance Number (Golden-to-White Radiant Metallic Gradient)
  const balStr = Number(balance).toLocaleString();
  const balGrad = ctx.createLinearGradient(balBoxX + 26, 0, balBoxX + 26 + 280, 0);
  balGrad.addColorStop(0, '#ffffff');
  balGrad.addColorStop(0.35, '#fef08a');
  balGrad.addColorStop(1, '#f59e0b');

  ctx.save();
  ctx.shadowColor = 'rgba(245, 158, 11, 0.35)';
  ctx.shadowBlur = 14;
  ctx.fillStyle = balGrad;
  ctx.font = 'bold 52px "Segoe UI", sans-serif';
  ctx.fillText(balStr, balBoxX + 26, balBoxY + 108);
  ctx.restore();

  // 3D Gold Coin with Warm Liquid Solar Aura
  const coinSize = 106;
  const coinX = balBoxX + balBoxW - coinSize - 26;
  const coinY = balBoxY + (balBoxH - coinSize) / 2;

  ctx.save();
  // Warm golden sun aura
  const coinGlow = ctx.createRadialGradient(coinX + coinSize / 2, coinY + coinSize / 2, 8, coinX + coinSize / 2, coinY + coinSize / 2, 75);
  coinGlow.addColorStop(0, 'rgba(245, 158, 11, 0.38)');
  coinGlow.addColorStop(0.5, 'rgba(234, 179, 8, 0.12)');
  coinGlow.addColorStop(1, 'transparent');
  ctx.fillStyle = coinGlow;
  ctx.beginPath();
  ctx.arc(coinX + coinSize / 2, coinY + coinSize / 2, 75, 0, Math.PI * 2);
  ctx.fill();

  // Subtle outer holographic dash circle
  ctx.strokeStyle = 'rgba(245, 158, 11, 0.25)';
  ctx.lineWidth = 1.5;
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.arc(coinX + coinSize / 2, coinY + coinSize / 2, 60, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  try {
    if (fs.existsSync(COIN_ICON_PATH)) {
      const coinImg = await loadImage(COIN_ICON_PATH);
      ctx.drawImage(coinImg, coinX, coinY, coinSize, coinSize);
    }
  } catch (_) { }

  // 9. Panel 3 & 4: Dual Liquid Glass Stats Grid
  const statBoxY = balBoxY + balBoxH + 16;
  const statGap = 16;
  const statBoxW = (userBoxW - statGap) / 2;
  const statBoxH = 100;

  // Box A: Total Top-up
  const statAX = balBoxX;
  drawGlassPanel(ctx, statAX, statBoxY, statBoxW, statBoxH, 18, 'rgba(6, 182, 212, 0.2)');

  // Crisp cyan upward vector arrow
  ctx.fillStyle = '#38bdf8';
  ctx.beginPath();
  ctx.moveTo(statAX + 28, statBoxY + 26);
  ctx.lineTo(statAX + 34, statBoxY + 35);
  ctx.lineTo(statAX + 22, statBoxY + 35);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#38bdf8';
  ctx.font = '700 12px "Segoe UI", sans-serif';
  ctx.fillText('TOTAL TOP-UP', statAX + 42, statBoxY + 35);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 30px "Segoe UI", sans-serif';
  ctx.fillText(Number(totalPurchased).toLocaleString(), statAX + 24, statBoxY + 76);

  // Box B: Total Spent
  const statBX = balBoxX + statBoxW + statGap;
  drawGlassPanel(ctx, statBX, statBoxY, statBoxW, statBoxH, 18, 'rgba(168, 85, 247, 0.2)');

  // Crisp purple downward vector arrow
  ctx.fillStyle = '#c084fc';
  ctx.beginPath();
  ctx.moveTo(statBX + 28, statBoxY + 35);
  ctx.lineTo(statBX + 34, statBoxY + 26);
  ctx.lineTo(statBX + 22, statBoxY + 26);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#c084fc';
  ctx.font = '700 12px "Segoe UI", sans-serif';
  ctx.fillText('TOTAL SPENT', statBX + 42, statBoxY + 35);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 30px "Segoe UI", sans-serif';
  ctx.fillText(Number(totalSpent).toLocaleString(), statBX + 24, statBoxY + 76);

  return canvas.encode('png');
}
