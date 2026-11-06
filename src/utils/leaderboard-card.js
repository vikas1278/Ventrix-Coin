import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createCanvas, loadImage } from '@napi-rs/canvas';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const COIN_ICON_PATH_1 = path.resolve(__dirname, '../assets/emojis/vyntrix_coin_gold.png');
const COIN_ICON_PATH_2 = path.resolve(__dirname, '../assets/emojis/VYNTRIX COIN.png');

function getCoinIconPath() {
  if (fs.existsSync(COIN_ICON_PATH_1)) return COIN_ICON_PATH_1;
  if (fs.existsSync(COIN_ICON_PATH_2)) return COIN_ICON_PATH_2;
  return null;
}

let cachedCoinImage = null;
async function getCoinImage() {
  if (cachedCoinImage) return cachedCoinImage;
  const p = getCoinIconPath();
  if (p) {
    try {
      cachedCoinImage = await loadImage(p);
      return cachedCoinImage;
    } catch (_) { }
  }
  return null;
}

function roundRect(ctx, x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + r);
  ctx.lineTo(x + width, y + height - r);
  ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  ctx.lineTo(x + r, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function truncateText(ctx, text, maxWidth) {
  if (!text) return '';
  if (ctx.measureText(text).width <= maxWidth) return text;
  let truncated = String(text);
  while (truncated.length > 0 && ctx.measureText(truncated + '…').width > maxWidth) {
    truncated = truncated.slice(0, -1);
  }
  return truncated + '…';
}

/**
 * Draws Vector Trophy (replaces unicode emoji to guarantee NO square boxes)
 */
function drawVectorTrophy(ctx, cx, cy, size = 16) {
  ctx.save();
  ctx.fillStyle = '#f59e0b';
  ctx.strokeStyle = '#d97706';
  ctx.lineWidth = 1.2;

  // Cup body
  ctx.beginPath();
  ctx.moveTo(cx - 7, cy - 7);
  ctx.lineTo(cx + 7, cy - 7);
  ctx.quadraticCurveTo(cx + 7, cy + 2, cx, cy + 4);
  ctx.quadraticCurveTo(cx - 7, cy + 2, cx - 7, cy - 7);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Stem & Base
  ctx.fillStyle = '#fbbf24';
  ctx.fillRect(cx - 1.5, cy + 4, 3, 4);
  ctx.fillRect(cx - 6, cy + 8, 12, 2.5);

  // Handles
  ctx.beginPath();
  ctx.arc(cx - 7, cy - 3, 3.5, 0.5 * Math.PI, 1.5 * Math.PI);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(cx + 7, cy - 3, 3.5, -0.5 * Math.PI, 0.5 * Math.PI);
  ctx.stroke();

  ctx.restore();
}

/**
 * Draws Vector Bar Chart (replaces 📊 to guarantee NO square boxes)
 */
function drawVectorBarChart(ctx, x, y, color = '#94a3b8') {
  ctx.save();
  ctx.fillStyle = color;
  // Bar 1 (Short)
  ctx.fillRect(x, y + 8, 3.5, 7);
  // Bar 2 (Medium)
  ctx.fillRect(x + 5.5, y + 4, 3.5, 11);
  // Bar 3 (Tall)
  ctx.fillRect(x + 11, y, 3.5, 15);
  ctx.restore();
}

/**
 * Draws Vector Crossed Swords (replaces ⚔️ to guarantee NO square boxes)
 */
function drawVectorCrossedSwords(ctx, cx, cy, size = 13, color = '#cbd5e1') {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  ctx.lineCap = 'round';
  const r = size / 2;

  // Blade 1 (\)
  ctx.beginPath();
  ctx.moveTo(cx - r, cy - r);
  ctx.lineTo(cx + r, cy + r);
  ctx.stroke();
  // Guard 1
  ctx.beginPath();
  ctx.moveTo(cx - r + 3, cy - r + 5);
  ctx.lineTo(cx - r + 5, cy - r + 3);
  ctx.stroke();

  // Blade 2 (/)
  ctx.beginPath();
  ctx.moveTo(cx + r, cy - r);
  ctx.lineTo(cx - r, cy + r);
  ctx.stroke();
  // Guard 2
  ctx.beginPath();
  ctx.moveTo(cx + r - 3, cy - r + 5);
  ctx.lineTo(cx + r - 5, cy - r + 3);
  ctx.stroke();

  ctx.restore();
}

/**
 * Draws avatar with circular clip, fallback initial if load fails, and stylized ring border
 */
async function drawCircularAvatar(ctx, avatarUrl, x, y, size, initial, borderColor = '#fbbf24', borderWidth = 2.5) {
  const radius = size / 2;
  const centerX = x + radius;
  const centerY = y + radius;

  let loaded = false;
  if (avatarUrl) {
    try {
      const img = await loadImage(avatarUrl);
      ctx.save();
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius - borderWidth, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(img, x + borderWidth, y + borderWidth, size - borderWidth * 2, size - borderWidth * 2);
      ctx.restore();
      loaded = true;
    } catch (_) {
      loaded = false;
    }
  }

  // Fallback initial/silhouette avatar
  if (!loaded) {
    ctx.save();
    const avatarGrad = ctx.createLinearGradient(x, y, x + size, y + size);
    avatarGrad.addColorStop(0, '#2d251e');
    avatarGrad.addColorStop(1, '#1a1612');
    ctx.fillStyle = avatarGrad;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius - borderWidth, 0, Math.PI * 2);
    ctx.fill();

    // Silhouette icon
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.arc(centerX, centerY - size * 0.1, size * 0.18, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(centerX, centerY + size * 0.35, size * 0.32, Math.PI, 0);
    ctx.fill();
    ctx.restore();
  }

  // Ring Border
  ctx.save();
  ctx.strokeStyle = borderColor;
  ctx.lineWidth = borderWidth;
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius - borderWidth / 2, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

/**
 * Draws a 3-pointed royal crown with number inside
 */
function drawCrown(ctx, cx, cy, width, height, crownColor, num) {
  ctx.save();
  const halfW = width / 2;
  const leftX = cx - halfW;
  const rightX = cx + halfW;
  const baseY = cy + height / 2;
  const tipY = cy - height / 2;
  const midTipY = tipY;
  const sideTipY = tipY + height * 0.22;
  const valleyY = cy + height * 0.08;

  ctx.beginPath();
  ctx.moveTo(leftX, baseY);
  ctx.lineTo(leftX, sideTipY);
  ctx.lineTo(cx - halfW * 0.45, valleyY);
  ctx.lineTo(cx, midTipY);
  ctx.lineTo(cx + halfW * 0.45, valleyY);
  ctx.lineTo(rightX, sideTipY);
  ctx.lineTo(rightX, baseY);
  ctx.closePath();

  ctx.fillStyle = crownColor;
  ctx.fill();

  // Jewels on top of the 3 points
  const jewelR = 2.4;
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(leftX, sideTipY, jewelR, 0, Math.PI * 2);
  ctx.arc(cx, midTipY, jewelR, 0, Math.PI * 2);
  ctx.arc(rightX, sideTipY, jewelR, 0, Math.PI * 2);
  ctx.fill();

  // Number inside crown
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 13px "Segoe UI", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(String(num), cx, cy + height * 0.16);

  ctx.restore();
}

/**
 * Draws laurel wreath leaves around an avatar
 */
function drawPodiumLaurel(ctx, cx, cy, radius, color) {
  ctx.save();
  ctx.fillStyle = color;
  const leafCount = 4;
  for (let i = 0; i < leafCount; i++) {
    const angle = (Math.PI * 0.26) + (i * 0.28);
    // Left leaf pair
    const lx = cx - (radius + 9) * Math.cos(angle);
    const ly = cy + (radius + 9) * Math.sin(angle) - (radius * 0.45);
    ctx.beginPath();
    ctx.ellipse(lx, ly, 6.5, 2.8, -angle + 0.3, 0, Math.PI * 2);
    ctx.fill();

    // Right leaf pair
    const rx = cx + (radius + 9) * Math.cos(angle);
    const ry = cy + (radius + 9) * Math.sin(angle) - (radius * 0.45);
    ctx.beginPath();
    ctx.ellipse(rx, ry, 6.5, 2.8, angle - 0.3, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

/**
 * Draws golden laurel branches for the main "HALL OF FAME" header
 */
function drawHeaderLaurelBranch(ctx, startX, startY, isRight, color) {
  ctx.save();
  ctx.fillStyle = color;
  const leaves = 6;
  for (let i = 0; i < leaves; i++) {
    const progress = i / (leaves - 1);
    const dx = (isRight ? 1 : -1) * (i * 10 + 6);
    const dy = -Math.sin(progress * Math.PI) * 18 + (i * 1.5);
    const lx = startX + dx;
    const ly = startY + dy;
    const rot = (isRight ? 0.35 : -0.35) + (progress * (isRight ? 0.2 : -0.2));

    ctx.beginPath();
    ctx.ellipse(lx, ly, 8.5, 3.5, rot, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

/**
 * Draws stylish diagonal gold accent slashes at the bottom right corner
 */
function drawDiagonalGoldStripes(ctx, x, y, width, height) {
  ctx.save();
  ctx.beginPath();
  roundRect(ctx, x, y, width, height, 22);
  ctx.clip();

  const startX = x + width - 88;
  const bottomY = y + height;

  const grad = ctx.createLinearGradient(startX, bottomY - 35, startX + 70, bottomY);
  grad.addColorStop(0, '#f59e0b');
  grad.addColorStop(0.5, '#d97706');
  grad.addColorStop(1, '#78350f');

  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.moveTo(startX, bottomY);
  ctx.lineTo(startX + 35, bottomY - 35);
  ctx.lineTo(startX + 55, bottomY - 35);
  ctx.lineTo(startX + 20, bottomY);
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(startX + 28, bottomY);
  ctx.lineTo(startX + 63, bottomY - 35);
  ctx.lineTo(startX + 85, bottomY - 35);
  ctx.lineTo(startX + 50, bottomY);
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(startX + 58, bottomY);
  ctx.lineTo(startX + 93, bottomY - 35);
  ctx.lineTo(startX + 115, bottomY - 35);
  ctx.lineTo(startX + 80, bottomY);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

/**
 * Main Leaderboard Canvas Card Generator (Exact Reference Match, Enhanced Resolution)
 */
export async function generateLeaderboardImage({
  guildName = 'Hawk Eye Official',
  guildIconUrl = null,
  members = [], // Top 10 members array
  generatedAt = new Date(),
  sortType = 'balance',
  sortLabel = null
}) {
  // Enhanced High-Definition Dimensions (Larger & clearer as requested)
  const width = 1000;
  const height = 1040;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = true;

  const coinImg = await getCoinImage();

  // 1. Outer Dark Canvas Fill
  ctx.fillStyle = '#0a0c13';
  ctx.fillRect(0, 0, width, height);

  // Main Card Dimensions
  const cardX = 14;
  const cardY = 14;
  const cardW = width - 28;
  const cardH = height - 28;
  const cardR = 24;

  // 2. Card Background & Ambient Header Glow
  const cardGrad = ctx.createLinearGradient(cardX, cardY, cardX, cardY + cardH);
  cardGrad.addColorStop(0, '#10131d');
  cardGrad.addColorStop(0.4, '#131622');
  cardGrad.addColorStop(1, '#0c0e17');
  ctx.fillStyle = cardGrad;
  roundRect(ctx, cardX, cardY, cardW, cardH, cardR);
  ctx.fill();

  // Golden Radial Halo behind "HALL OF FAME"
  const halo = ctx.createRadialGradient(cardX + cardW / 2, cardY + 105, 20, cardX + cardW / 2, cardY + 105, 340);
  halo.addColorStop(0, 'rgba(245, 158, 11, 0.24)');
  halo.addColorStop(0.6, 'rgba(217, 119, 6, 0.05)');
  halo.addColorStop(1, 'transparent');
  ctx.fillStyle = halo;
  ctx.fillRect(cardX, cardY, cardW, 280);

  // 3. Card Borders
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.lineWidth = 1.2;
  roundRect(ctx, cardX, cardY, cardW, cardH, cardR);
  ctx.stroke();

  // Left Border: Solid Bright Gold Accent Line
  ctx.save();
  ctx.beginPath();
  roundRect(ctx, cardX, cardY, cardW, cardH, cardR);
  ctx.clip();
  ctx.fillStyle = '#f59e0b';
  ctx.fillRect(cardX, cardY, 5, cardH);
  ctx.restore();

  // ─── 4. Header ──────────────────────────────────────────────────────────────
  const headerTopY = cardY + 28;

  // Top-Left Pill Badge: "Vyntrix Coin"
  const pillW = 150;
  const pillH = 38;
  const pillX = cardX + 32;
  const pillY = headerTopY;

  ctx.save();
  ctx.fillStyle = 'rgba(20, 24, 38, 0.9)';
  roundRect(ctx, pillX, pillY, pillW, pillH, 19);
  ctx.fill();
  ctx.strokeStyle = 'rgba(245, 158, 11, 0.45)';
  ctx.lineWidth = 1.2;
  roundRect(ctx, pillX, pillY, pillW, pillH, 19);
  ctx.stroke();

  if (coinImg) {
    ctx.drawImage(coinImg, pillX + 10, pillY + 7, 24, 24);
  }
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 14px "Segoe UI", sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('Vyntrix Coin', pillX + (coinImg ? 40 : 16), pillY + pillH / 2);
  ctx.restore();

  // Top-Right Server Shield / Badge (Hawk Eye / Server Logo)
  const logoSize = 84;
  const logoX = cardX + cardW - logoSize - 32;
  const logoY = headerTopY - 4;

  let logoDrawn = false;
  if (guildIconUrl) {
    try {
      const gImg = await loadImage(guildIconUrl);
      ctx.save();
      roundRect(ctx, logoX, logoY, logoSize, logoSize, 18);
      ctx.clip();
      ctx.drawImage(gImg, logoX, logoY, logoSize, logoSize);
      ctx.restore();
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.5)';
      ctx.lineWidth = 2;
      roundRect(ctx, logoX, logoY, logoSize, logoSize, 18);
      ctx.stroke();
      logoDrawn = true;
    } catch (_) { }
  }

  if (!logoDrawn) {
    ctx.save();
    const shieldW = logoSize;
    const shieldH = logoSize;
    const sX = logoX;
    const sY = logoY;

    ctx.fillStyle = '#1e1135';
    ctx.beginPath();
    ctx.moveTo(sX, sY + 8);
    ctx.lineTo(sX + shieldW, sY + 8);
    ctx.lineTo(sX + shieldW, sY + shieldH * 0.65);
    ctx.lineTo(sX + shieldW / 2, sY + shieldH);
    ctx.lineTo(sX, sY + shieldH * 0.65);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Shield Emblem: Golden Star & HAWK EYE text (pure vector, no emoji)
    const emX = sX + shieldW / 2;
    const emY = sY + shieldH * 0.4;
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    for (let s = 0; s < 5; s++) {
      ctx.lineTo(
        emX + Math.cos((18 + s * 72) * Math.PI / 180) * 14,
        emY - Math.sin((18 + s * 72) * Math.PI / 180) * 14
      );
      ctx.lineTo(
        emX + Math.cos((54 + s * 72) * Math.PI / 180) * 6,
        emY - Math.sin((54 + s * 72) * Math.PI / 180) * 6
      );
    }
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#f59e0b';
    ctx.font = 'bold 11px "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('HAWK EYE', sX + shieldW / 2, sY + shieldH * 0.72);
    ctx.restore();
  }

  // Center Header: Trophy, Guild Name, Laurel Wreath & "HALL OF FAME"
  const centerX = cardX + cardW / 2;

  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Line 1: Vector Trophy + Guild Name —
  const topHeaderLineY = headerTopY + 14;
  const displayGuild = truncateText(ctx, `${guildName} —`, 380);
  ctx.font = 'bold 16px "Segoe UI", sans-serif';
  const guildTextW = ctx.measureText(displayGuild).width;
  const totalHeaderW = 20 + 8 + guildTextW;
  const startHeaderX = centerX - totalHeaderW / 2;

  drawVectorTrophy(ctx, startHeaderX + 8, topHeaderLineY, 18);
  ctx.fillStyle = '#f1f5f9';
  ctx.textAlign = 'left';
  ctx.fillText(displayGuild, startHeaderX + 24, topHeaderLineY);

  // Line 2: Laurel Leaves + HALL OF FAME
  ctx.textAlign = 'center';
  const titleY = headerTopY + 52;
  const titleGrad = ctx.createLinearGradient(centerX - 150, titleY - 16, centerX + 150, titleY + 16);
  titleGrad.addColorStop(0, '#fef08a');
  titleGrad.addColorStop(0.4, '#fbbf24');
  titleGrad.addColorStop(1, '#d97706');

  ctx.fillStyle = titleGrad;
  ctx.font = '900 37px "Segoe UI", Impact, sans-serif';
  ctx.fillText('HALL OF FAME', centerX, titleY);

  // Laurel branches on Left & Right of HALL OF FAME
  drawHeaderLaurelBranch(ctx, centerX - 155, titleY, false, '#f59e0b');
  drawHeaderLaurelBranch(ctx, centerX + 155, titleY, true, '#f59e0b');

  // Line 3: Dynamic Sort Badge (Icon + Label dynamically centered under HALL OF FAME)
  const subY = titleY + 34;
  ctx.font = 'italic bold 15px "Segoe UI", sans-serif';

  let labelText = sortLabel;
  if (!labelText) {
    if (sortType === 'wins') labelText = 'Game Wins';
    else if (sortType === 'warpoints') labelText = 'War Points';
    else if (sortType === 'level') labelText = 'Rank & Level';
    else labelText = 'Highest Balance';
  }

  const textMetrics = ctx.measureText(labelText);
  const textWidth = textMetrics.width;
  const iconSize = 18;
  const gap = 8;
  const totalW = iconSize + gap + textWidth;
  const startX = centerX - (totalW / 2);
  const iconCenterX = startX + iconSize / 2;
  const iconCenterY = subY - 4;
  const textX = startX + iconSize + gap;

  // Draw corresponding sort icon
  if (sortType === 'wins') {
    drawVectorTrophy(ctx, iconCenterX, iconCenterY, 15);
  } else if (sortType === 'warpoints') {
    drawVectorCrossedSwords(ctx, iconCenterX, iconCenterY, 14, '#fbbf24');
  } else if (sortType === 'level') {
    drawVectorBarChart(ctx, iconCenterX - 7, iconCenterY - 8, '#fbbf24');
  } else {
    // Default: coin balance
    if (coinImg) {
      ctx.drawImage(coinImg, startX, subY - 14, iconSize, iconSize);
    } else {
      drawVectorTrophy(ctx, iconCenterX, iconCenterY, 15);
    }
  }

  ctx.textAlign = 'left';
  ctx.fillStyle = '#fef08a';
  ctx.fillText(labelText, textX, subY);

  ctx.restore();

  // ─── 5. Top 3 Podium (3 Cards: Silver #2, Gold #1, Bronze #3) ───────────────
  const p1 = members[0] || null;
  const p2 = members[1] || null;
  const p3 = members[2] || null;

  const podiumY = cardY + 180;
  const colGap = 18;
  const card1W = 312;
  const card2W = 270;
  const card3W = 270;

  const totalPodiumW = card2W + colGap + card1W + colGap + card3W; // 888px
  const startPodiumX = cardX + (cardW - totalPodiumW) / 2;

  const p2X = startPodiumX;
  const p1X = p2X + card2W + colGap;
  const p3X = p1X + card1W + colGap;

  const podiumCards = [
    {
      player: p2,
      rank: 2,
      x: p2X,
      y: podiumY + 20,
      w: card2W,
      h: 195,
      borderColor: 'rgba(203, 213, 225, 0.75)',
      crownColor: '#cbd5e1',
      laurelColor: '#cbd5e1',
      bgFill: 'rgba(226, 232, 240, 0.04)',
      avatarSize: 52,
      isCenter: false
    },
    {
      player: p1,
      rank: 1,
      x: p1X,
      y: podiumY,
      w: card1W,
      h: 220, // Taller and highlighted
      borderColor: '#f59e0b',
      crownColor: '#fbbf24',
      laurelColor: '#fbbf24',
      bgFill: 'rgba(245, 158, 11, 0.08)',
      avatarSize: 64,
      isCenter: true
    },
    {
      player: p3,
      rank: 3,
      x: p3X,
      y: podiumY + 24,
      w: card3W,
      h: 190,
      borderColor: 'rgba(217, 119, 6, 0.75)',
      crownColor: '#d97706',
      laurelColor: '#d97706',
      bgFill: 'rgba(217, 119, 6, 0.04)',
      avatarSize: 52,
      isCenter: false
    }
  ];

  for (const pc of podiumCards) {
    const { player, rank, x, y, w, h, borderColor, crownColor, laurelColor, bgFill, avatarSize, isCenter } = pc;

    ctx.save();
    ctx.fillStyle = bgFill;
    roundRect(ctx, x, y, w, h, 18);
    ctx.fill();

    if (isCenter) {
      ctx.shadowColor = 'rgba(245, 158, 11, 0.45)';
      ctx.shadowBlur = 20;
    }
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = isCenter ? 2.6 : 1.5;
    roundRect(ctx, x, y, w, h, 18);
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.restore();

    // Crown sitting atop card
    const crownW = isCenter ? 42 : 36;
    const crownH = isCenter ? 28 : 24;
    const crownCx = x + w / 2;
    const crownCy = y - (isCenter ? 14 : 11);
    drawCrown(ctx, crownCx, crownCy, crownW, crownH, crownColor, rank);

    if (player) {
      const avCx = x + w / 2;
      const avCy = y + (isCenter ? 54 : 48);
      const avX = avCx - avatarSize / 2;
      const avY = avCy - avatarSize / 2;

      // Laurel leaves around avatar
      drawPodiumLaurel(ctx, avCx, avCy, avatarSize / 2, laurelColor);

      // Draw Avatar
      await drawCircularAvatar(ctx, player.avatarUrl, avX, avY, avatarSize, player.username, borderColor, isCenter ? 3 : 2.2);

      // Username: @Username
      ctx.save();
      ctx.fillStyle = '#ffffff';
      ctx.font = `bold ${isCenter ? 17 : 15}px "Segoe UI", sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      const uY = avY + avatarSize + (isCenter ? 11 : 9);
      const rawName = String(player.username || 'Member').replace(/^@+/, '');
      ctx.fillText(truncateText(ctx, `@${rawName}`, w - 24), avCx, uY);

      // Coin Icon + Amount
      const cY = uY + (isCenter ? 28 : 24);
      const coinStr = Number(player.balance || 0).toLocaleString();
      ctx.font = `bold ${isCenter ? 24 : 20}px "Segoe UI", sans-serif`;
      const numW = ctx.measureText(coinStr).width;
      const cIconSize = isCenter ? 22 : 18;
      const totalCW = cIconSize + 7 + numW;
      const startCX = avCx - totalCW / 2;

      if (coinImg) {
        ctx.drawImage(coinImg, startCX, cY - 1, cIconSize, cIconSize);
      }
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'left';
      ctx.fillText(coinStr, startCX + cIconSize + 7, cY);

      // Bottom Chips: Level & Wins (e.g. Lv 7 | 83W)
      const chipH = isCenter ? 26 : 24;
      const chipY = y + h - chipH - (isCenter ? 15 : 13);
      const chipGap = 10;
      const chipW = (w - 48 - chipGap) / 2;

      // Left Chip: Lv X
      const chip1X = avCx - chipGap / 2 - chipW;
      ctx.fillStyle = 'rgba(20, 26, 40, 0.85)';
      roundRect(ctx, chip1X, chipY, chipW, chipH, 8);
      ctx.fill();
      ctx.strokeStyle = borderColor;
      ctx.lineWidth = 1;
      roundRect(ctx, chip1X, chipY, chipW, chipH, 8);
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = `bold ${isCenter ? 13 : 12}px "Segoe UI", sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`Lv ${player.level || 1}`, chip1X + chipW / 2, chipY + chipH / 2);

      // Right Chip: XW (Actual Wins!)
      const chip2X = avCx + chipGap / 2;
      ctx.fillStyle = 'rgba(20, 26, 40, 0.85)';
      roundRect(ctx, chip2X, chipY, chipW, chipH, 8);
      ctx.fill();
      ctx.strokeStyle = borderColor;
      ctx.lineWidth = 1;
      roundRect(ctx, chip2X, chipY, chipW, chipH, 8);
      ctx.stroke();

      const winsVal = Number(player.wins !== undefined ? player.wins : (player.warPoints || 0));
      ctx.fillStyle = '#ffffff';
      ctx.fillText(`${winsVal}W`, chip2X + chipW / 2, chipY + chipH / 2);

      ctx.restore();
    } else {
      ctx.save();
      ctx.fillStyle = '#64748b';
      ctx.font = 'italic 14px "Segoe UI", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('Empty Slot', x + w / 2, y + h / 2);
      ctx.restore();
    }
  }

  // ─── 6. Table Header Bar (Y: 440) ──────────────────────────────────────────
  const tableX = cardX + 32;
  const tableW = cardW - 64;
  const tableHeaderY = cardY + 440;
  const headerBarH = 38;

  ctx.save();
  ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
  roundRect(ctx, tableX, tableHeaderY, tableW, headerBarH, 10);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
  ctx.lineWidth = 1;
  roundRect(ctx, tableX, tableHeaderY, tableW, headerBarH, 10);
  ctx.stroke();

  // Column Headers
  ctx.fillStyle = '#94a3b8';
  ctx.font = 'bold 14px "Segoe UI", sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';

  const colY = tableHeaderY + headerBarH / 2;
  ctx.fillText('#', tableX + 20, colY);
  ctx.fillText('Member', tableX + 78, colY);

  // Coins Column Header with coin icon
  const coinColX = tableX + 430;
  if (coinImg) {
    ctx.drawImage(coinImg, coinColX, colY - 9, 18, 18);
  }
  ctx.fillText('Coins', coinColX + (coinImg ? 24 : 0), colY);

  // Level Column Header with Vector Bar Chart (NO emoji tofu box)
  const lvlColX = tableX + 640;
  drawVectorBarChart(ctx, lvlColX, colY - 8, '#38bdf8');
  ctx.fillText('Level', lvlColX + 22, colY);

  // War Points Column Header with Vector Crossed Swords (NO emoji tofu box)
  const wpColX = tableX + 790;
  drawVectorCrossedSwords(ctx, wpColX + 8, colY, 14, '#f59e0b');
  ctx.fillText('War Points', wpColX + 24, colY);

  ctx.restore();

  // ─── 7. Table Rows (Ranks 4 to 10) ──────────────────────────────────────────
  const rowStartY = tableHeaderY + headerBarH + 10;
  const rowH = 50;
  const rowGap = 8;

  for (let i = 3; i < 10; i++) {
    const rowY = rowStartY + (i - 3) * (rowH + rowGap);
    const m = members[i] || null;

    ctx.save();
    ctx.fillStyle = (i % 2 === 0) ? 'rgba(255, 255, 255, 0.025)' : 'rgba(255, 255, 255, 0.015)';
    roundRect(ctx, tableX, rowY, tableW, rowH, 10);
    ctx.fill();

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.lineWidth = 1;
    roundRect(ctx, tableX, rowY, tableW, rowH, 10);
    ctx.stroke();

    const midY = rowY + rowH / 2;

    // Col 1: Rank Number (e.g. 4., 5., 6.)
    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 15px "Segoe UI", sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${i + 1}.`, tableX + 18, midY);

    if (m) {
      // Col 2: Member Chip
      const mChipW = 270;
      const mChipH = 34;
      const mChipX = tableX + 70;
      const mChipY = rowY + (rowH - mChipH) / 2;

      ctx.fillStyle = 'rgba(30, 41, 59, 0.65)';
      roundRect(ctx, mChipX, mChipY, mChipW, mChipH, 8);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.07)';
      ctx.lineWidth = 1;
      roundRect(ctx, mChipX, mChipY, mChipW, mChipH, 8);
      ctx.stroke();

      ctx.fillStyle = '#f1f5f9';
      ctx.font = 'bold 14px "Segoe UI", "Segoe UI Emoji", sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      const cleanUName = String(m.username || 'Member').replace(/^@+/, '');
      const displayText = truncateText(ctx, `@${cleanUName}`, mChipW - 20);
      ctx.fillText(displayText, mChipX + 14, mChipY + mChipH / 2);

      // Col 3: Coins (Gold Coin Icon + Amount)
      const coinIconX = coinColX + 4;
      if (coinImg) {
        ctx.drawImage(coinImg, coinIconX, midY - 10, 20, 20);
      }
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 17px "Segoe UI", sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(Number(m.balance || 0).toLocaleString(), coinIconX + (coinImg ? 28 : 0), midY);

      // Col 4: Level Chip (e.g. Lv 1)
      const lvlChipW = 72;
      const lvlChipH = 32;
      const lvlChipX = lvlColX + 4;
      const lvlChipY = rowY + (rowH - lvlChipH) / 2;

      ctx.fillStyle = 'rgba(30, 41, 59, 0.65)';
      roundRect(ctx, lvlChipX, lvlChipY, lvlChipW, lvlChipH, 8);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.07)';
      ctx.lineWidth = 1;
      roundRect(ctx, lvlChipX, lvlChipY, lvlChipW, lvlChipH, 8);
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 13px "Segoe UI", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`Lv ${m.level || 1}`, lvlChipX + lvlChipW / 2, lvlChipY + lvlChipH / 2);

      // Col 5: War Points Chip (Vector crossed swords + Actual Wins XW)
      const wpChipW = 92;
      const wpChipH = 32;
      const wpChipX = wpColX + 8;
      const wpChipY = rowY + (rowH - wpChipH) / 2;

      ctx.fillStyle = 'rgba(30, 41, 59, 0.65)';
      roundRect(ctx, wpChipX, wpChipY, wpChipW, wpChipH, 8);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.07)';
      ctx.lineWidth = 1;
      roundRect(ctx, wpChipX, wpChipY, wpChipW, wpChipH, 8);
      ctx.stroke();

      const rWinsVal = Number(m.wins !== undefined ? m.wins : (m.warPoints || 0));
      const wpText = `${rWinsVal}W`;
      ctx.font = 'bold 13px "Segoe UI", sans-serif';
      const wpTextW = ctx.measureText(wpText).width;
      const totalInnerW = 14 + 6 + wpTextW;
      const startInnerX = wpChipX + (wpChipW - totalInnerW) / 2;

      // Draw vector crossed swords (NO tofu box)
      drawVectorCrossedSwords(ctx, startInnerX + 7, midY, 13, '#ffffff');

      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'left';
      ctx.fillText(wpText, startInnerX + 18, midY);
    } else {
      ctx.fillStyle = 'rgba(148, 163, 184, 0.35)';
      ctx.font = 'italic 13px "Segoe UI", sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText('— Empty Slot —', tableX + 70, midY);
    }

    ctx.restore();
  }

  // ─── 8. Footer (Y: 980) ─────────────────────────────────────────────────────
  const footerY = cardY + cardH - 42;

  ctx.save();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(cardX + 32, footerY - 12);
  ctx.lineTo(cardX + cardW - 32, footerY - 12);
  ctx.stroke();

  // Left Info Circle + Text
  const infoX = cardX + 36;
  const timeStr = generatedAt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(infoX + 8, footerY + 10, 8, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = '#f59e0b';
  ctx.font = 'bold 11px "Segoe UI", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('i', infoX + 8, footerY + 10);

  ctx.fillStyle = '#94a3b8';
  ctx.font = '500 13px "Segoe UI", sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(`Virtual coins only • Coins • Today at ${timeStr}`, infoX + 24, footerY + 10);
  ctx.restore();

  // Bottom-Right Corner: Diagonal Gold Accent Stripes (matches screenshot!)
  drawDiagonalGoldStripes(ctx, cardX, cardY, cardW, cardH);

  return canvas.toBuffer('image/png');
}
