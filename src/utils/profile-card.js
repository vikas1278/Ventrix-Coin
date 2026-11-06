import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createCanvas, loadImage } from '@napi-rs/canvas';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const COIN_ICON_PATH_1 = path.resolve(__dirname, '../assets/emojis/VYNTRIX COIN.png');
const COIN_ICON_PATH_2 = path.resolve(__dirname, '../assets/emojis/vyntrix_coin_gold.png');

function getCoinAssetPath() {
  if (fs.existsSync(COIN_ICON_PATH_1)) return COIN_ICON_PATH_1;
  if (fs.existsSync(COIN_ICON_PATH_2)) return COIN_ICON_PATH_2;
  return null;
}

let cachedCoinAsset = null;
async function loadCoinAsset() {
  if (cachedCoinAsset) return cachedCoinAsset;
  const p = getCoinAssetPath();
  if (p) {
    try {
      cachedCoinAsset = await loadImage(p);
      return cachedCoinAsset;
    } catch (_) {}
  }
  return null;
}

/**
 * Draws rounded rectangle path
 */
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

/**
 * Truncates text with ellipsis if exceeding maxWidth
 */
function truncateText(ctx, text, maxWidth) {
  if (!text) return '';
  if (ctx.measureText(text).width <= maxWidth) return text;
  let str = String(text);
  while (str.length > 0 && ctx.measureText(str + '…').width > maxWidth) {
    str = str.slice(0, -1);
  }
  return str + '…';
}

/**
 * Draws crisp vector 3D coin stack (2 or 3 slightly offset golden disks)
 */
function drawVectorCoinStack(ctx, cx, cy, size = 16) {
  ctx.save();
  const rX = size * 0.55;
  const rY = size * 0.28;

  const coins = [
    { yOffset: cy + size * 0.22, color1: '#ca8a04', color2: '#eab308' },
    { yOffset: cy - size * 0.08, color1: '#eab308', color2: '#fde047' }
  ];

  for (const c of coins) {
    // Base thickness
    ctx.fillStyle = c.color1;
    ctx.beginPath();
    ctx.ellipse(cx, c.yOffset + 2, rX, rY, 0, 0, Math.PI * 2);
    ctx.fill();

    // Top face
    ctx.fillStyle = c.color2;
    ctx.beginPath();
    ctx.ellipse(cx, c.yOffset, rX, rY, 0, 0, Math.PI * 2);
    ctx.fill();

    // Subtle edge stroke
    ctx.strokeStyle = '#fef08a';
    ctx.lineWidth = 0.8;
    ctx.stroke();
  }
  ctx.restore();
}

/**
 * Draws verified check badge (purple rounded hexagon/circle with white check)
 */
function drawVerifiedBadge(ctx, cx, cy, radius = 9) {
  ctx.save();
  ctx.fillStyle = '#a855f7';
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.fill();

  // White checkmark
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(cx - 4, cy);
  ctx.lineTo(cx - 1, cy + 3.5);
  ctx.lineTo(cx + 4, cy - 3);
  ctx.stroke();
  ctx.restore();
}

/**
 * Draws 3-pointed royal crown in gold
 */
function drawGoldenCrown(ctx, cx, cy, width = 16, height = 11) {
  ctx.save();
  const halfW = width / 2;
  const leftX = cx - halfW;
  const rightX = cx + halfW;
  const baseY = cy + height / 2;
  const tipY = cy - height / 2;
  const valleyY = cy + height * 0.05;

  const grad = ctx.createLinearGradient(leftX, tipY, rightX, baseY);
  grad.addColorStop(0, '#fde047');
  grad.addColorStop(0.5, '#fbbf24');
  grad.addColorStop(1, '#d97706');

  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.moveTo(leftX, baseY);
  ctx.lineTo(leftX, tipY + height * 0.25);
  ctx.lineTo(cx - halfW * 0.45, valleyY);
  ctx.lineTo(cx, tipY);
  ctx.lineTo(cx + halfW * 0.45, valleyY);
  ctx.lineTo(rightX, tipY + height * 0.25);
  ctx.lineTo(rightX, baseY);
  ctx.closePath();
  ctx.fill();

  // Jewels atop points
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(leftX, tipY + height * 0.25, 1.5, 0, Math.PI * 2);
  ctx.arc(cx, tipY, 1.6, 0, Math.PI * 2);
  ctx.arc(rightX, tipY + height * 0.25, 1.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/**
 * Draws delicate laurel wreath branches flanking the OWNER badge
 */
function drawBadgeLaurelWreath(ctx, badgeX, badgeY, badgeW, badgeH, color = '#f59e0b') {
  ctx.save();
  const cy = badgeY + badgeH / 2;

  // Left Branch
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.arc(badgeX - 10, cy, 20, 0.45 * Math.PI, 1.55 * Math.PI, false);
  ctx.stroke();

  ctx.fillStyle = color;
  const leafCount = 5;
  for (let i = 0; i < leafCount; i++) {
    const angle = (0.55 * Math.PI) + (i * 0.22);
    const lx = badgeX - 10 + 20 * Math.cos(angle);
    const ly = cy + 20 * Math.sin(angle);
    ctx.beginPath();
    ctx.ellipse(lx, ly, 4.2, 1.8, angle - 0.4, 0, Math.PI * 2);
    ctx.fill();
  }

  // Right Branch
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.arc(badgeX + badgeW + 10, cy, 20, -0.55 * Math.PI, 0.55 * Math.PI, false);
  ctx.stroke();

  for (let i = 0; i < leafCount; i++) {
    const angle = (-0.45 * Math.PI) + (i * 0.22);
    const rx = badgeX + badgeW + 10 + 20 * Math.cos(angle);
    const ry = cy + 20 * Math.sin(angle);
    ctx.beginPath();
    ctx.ellipse(rx, ry, 4.2, 1.8, angle + 0.4, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

/**
 * Draws upward arrow inside a rounded button container (TOTAL TOP-UP icon)
 */
function drawUploadIcon(ctx, x, y, size = 46, color = '#00f2fe') {
  ctx.save();
  // Button container
  ctx.fillStyle = 'rgba(6, 182, 212, 0.16)';
  roundRect(ctx, x, y, size, size, 12);
  ctx.fill();

  ctx.strokeStyle = 'rgba(56, 189, 248, 0.55)';
  ctx.lineWidth = 1.4;
  roundRect(ctx, x, y, size, size, 12);
  ctx.stroke();

  // White upload arrow
  const cx = x + size / 2;
  const cy = y + size / 2;
  ctx.strokeStyle = '#ffffff';
  ctx.fillStyle = '#ffffff';
  ctx.lineWidth = 2.4;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // Arrow up
  ctx.beginPath();
  ctx.moveTo(cx, cy + 6);
  ctx.lineTo(cx, cy - 7);
  ctx.lineTo(cx - 5, cy - 2);
  ctx.moveTo(cx, cy - 7);
  ctx.lineTo(cx + 5, cy - 2);
  ctx.stroke();

  // Bottom tray line
  ctx.beginPath();
  ctx.moveTo(cx - 7, cy + 8);
  ctx.lineTo(cx + 7, cy + 8);
  ctx.stroke();

  ctx.restore();
}

/**
 * Draws downward arrow inside a rounded button container (TOTAL SPENT icon)
 */
function drawSpentIcon(ctx, x, y, size = 46, color = '#ec4899') {
  ctx.save();
  // Button container
  ctx.fillStyle = 'rgba(236, 72, 153, 0.16)';
  roundRect(ctx, x, y, size, size, 12);
  ctx.fill();

  ctx.strokeStyle = 'rgba(244, 114, 182, 0.55)';
  ctx.lineWidth = 1.4;
  roundRect(ctx, x, y, size, size, 12);
  ctx.stroke();

  // White down arrow
  const cx = x + size / 2;
  const cy = y + size / 2;
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2.4;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  ctx.beginPath();
  ctx.moveTo(cx, cy - 7);
  ctx.lineTo(cx, cy + 6);
  ctx.lineTo(cx - 5, cy + 1);
  ctx.moveTo(cx, cy + 6);
  ctx.lineTo(cx + 5, cy + 1);
  ctx.stroke();

  ctx.restore();
}

/**
 * Draws 3D translucent glowing cyan coin stack for TOTAL TOP-UP card
 */
function drawTranslucentCyanCoinStack(ctx, cx, cy, size = 32) {
  ctx.save();
  const rX = size * 0.65;
  const rY = size * 0.32;

  const stack = [
    { y: cy + 10, fill: 'rgba(6, 182, 212, 0.35)', stroke: 'rgba(56, 189, 248, 0.7)' },
    { y: cy, fill: 'rgba(6, 182, 212, 0.45)', stroke: 'rgba(56, 189, 248, 0.85)' },
    { y: cy - 10, fill: 'rgba(6, 182, 212, 0.6)', stroke: '#38bdf8' }
  ];

  for (const c of stack) {
    // Body rim
    ctx.fillStyle = 'rgba(2, 132, 199, 0.5)';
    ctx.beginPath();
    ctx.ellipse(cx, c.y + 4, rX, rY, 0, 0, Math.PI * 2);
    ctx.fill();

    // Top face
    ctx.fillStyle = c.fill;
    ctx.beginPath();
    ctx.ellipse(cx, c.y, rX, rY, 0, 0, Math.PI * 2);
    ctx.fill();

    // Glowing border
    ctx.strokeStyle = c.stroke;
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }
  ctx.restore();
}

/**
 * Draws translucent neon pink shopping cart for TOTAL SPENT card
 */
function drawNeonPinkShoppingCart(ctx, cx, cy, size = 36) {
  ctx.save();
  ctx.strokeStyle = 'rgba(244, 114, 182, 0.75)';
  ctx.fillStyle = 'rgba(244, 114, 182, 0.75)';
  ctx.lineWidth = 2.2;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  const w = size;
  const h = size * 0.8;
  const x0 = cx - w / 2;
  const y0 = cy - h / 2;

  // Handle & Basket Frame
  ctx.beginPath();
  ctx.moveTo(x0, y0 + 4);
  ctx.lineTo(x0 + 6, y0 + 4);
  ctx.lineTo(x0 + 12, y0 + h - 8);
  ctx.lineTo(x0 + w - 4, y0 + h - 8);
  ctx.lineTo(x0 + w, y0 + 10);
  ctx.lineTo(x0 + 9, y0 + 10);
  ctx.stroke();

  // Grid lines inside basket
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(x0 + 11, y0 + 16);
  ctx.lineTo(x0 + w - 2, y0 + 16);
  ctx.moveTo(x0 + 14, y0 + 8);
  ctx.lineTo(x0 + 16, y0 + h - 8);
  ctx.moveTo(x0 + 22, y0 + 8);
  ctx.lineTo(x0 + 24, y0 + h - 8);
  ctx.stroke();

  // Wheels
  ctx.fillStyle = '#ec4899';
  ctx.beginPath();
  ctx.arc(x0 + 15, y0 + h - 1, 3, 0, Math.PI * 2);
  ctx.arc(x0 + w - 7, y0 + h - 1, 3, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

/**
 * Draws large 3D Golden V Emblem Coin (Left side of Balance Box)
 */
async function drawLargeVyntrixCoin(ctx, cx, cy, radius = 58) {
  ctx.save();

  // 1. Intense Purple/Magenta Radial Aura Glow
  const aura = ctx.createRadialGradient(cx, cy, 10, cx, cy, radius * 1.6);
  aura.addColorStop(0, 'rgba(217, 70, 239, 0.65)');
  aura.addColorStop(0.5, 'rgba(168, 85, 247, 0.25)');
  aura.addColorStop(1, 'transparent');
  ctx.fillStyle = aura;
  ctx.beginPath();
  ctx.arc(cx, cy, radius * 1.6, 0, Math.PI * 2);
  ctx.fill();

  const coinAsset = await loadCoinAsset();
  if (coinAsset) {
    // Draw high-resolution asset coin with circular clip
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.clip();
    const drawSize = radius * 2.06;
    ctx.drawImage(coinAsset, cx - drawSize / 2, cy - drawSize / 2, drawSize, drawSize);
    ctx.restore();
  } else {
    // Pure vector 3D V Emblem Fallback
    // Outer Beveled Golden Ring
    const rimGrad = ctx.createLinearGradient(cx - radius, cy - radius, cx + radius, cy + radius);
    rimGrad.addColorStop(0, '#fffbeb');
    rimGrad.addColorStop(0.3, '#f59e0b');
    rimGrad.addColorStop(0.7, '#d97706');
    rimGrad.addColorStop(1, '#78350f');

    ctx.fillStyle = rimGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fill();

    // Outer Beaded Ring
    ctx.strokeStyle = '#fde047';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, radius - 5, 0, Math.PI * 2);
    ctx.stroke();

    // Inner Coin Face
    const innerGrad = ctx.createRadialGradient(cx - 8, cy - 8, 4, cx, cy, radius - 8);
    innerGrad.addColorStop(0, '#d97706');
    innerGrad.addColorStop(0.6, '#b45309');
    innerGrad.addColorStop(1, '#451a03');

    ctx.fillStyle = innerGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, radius - 8, 0, Math.PI * 2);
    ctx.fill();

    // Laurel Wreath inside coin
    ctx.fillStyle = '#fef08a';
    for (let i = 0; i < 7; i++) {
      const a = (Math.PI * 0.4) + (i * 0.28);
      ctx.beginPath();
      ctx.ellipse(cx - (radius - 20) * Math.cos(a), cy + (radius - 20) * Math.sin(a) - 6, 4.5, 2, -a, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(cx + (radius - 20) * Math.cos(a), cy + (radius - 20) * Math.sin(a) - 6, 4.5, 2, a, 0, Math.PI * 2);
      ctx.fill();
    }

    // Bold Embossed Golden "V"
    const vGrad = ctx.createLinearGradient(cx, cy - 24, cx, cy + 24);
    vGrad.addColorStop(0, '#ffffff');
    vGrad.addColorStop(0.4, '#fde047');
    vGrad.addColorStop(1, '#d97706');

    ctx.fillStyle = vGrad;
    ctx.font = '900 48px "Segoe UI", Impact, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('V', cx, cy + 2);
  }

  // Outer golden and violet neon rings
  ctx.strokeStyle = '#fbbf24';
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = 'rgba(217, 70, 239, 0.75)';
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.arc(cx, cy, radius + 3, 0, Math.PI * 2);
  ctx.stroke();

  ctx.restore();
}

/**
 * Draws ethereal glowing wave ribbons in the Balance Card background
 */
function drawEtherealWaveRibbons(ctx, x, y, width, height) {
  ctx.save();
  ctx.beginPath();
  roundRect(ctx, x, y, width, height, 20);
  ctx.clip();

  // Wave Ribbon 1 (Top purple wave)
  const grad1 = ctx.createLinearGradient(x + 200, y, x + width, y + height);
  grad1.addColorStop(0, 'rgba(168, 85, 247, 0.0)');
  grad1.addColorStop(0.4, 'rgba(168, 85, 247, 0.22)');
  grad1.addColorStop(0.8, 'rgba(236, 72, 153, 0.18)');
  grad1.addColorStop(1, 'transparent');

  ctx.fillStyle = grad1;
  ctx.beginPath();
  ctx.moveTo(x + 280, y + height);
  ctx.bezierCurveTo(x + 450, y + height * 0.4, x + 620, y + height * 0.8, x + width + 40, y + 20);
  ctx.lineTo(x + width + 40, y + height);
  ctx.closePath();
  ctx.fill();

  // Wave Ribbon 2 (Lower luminous pink wave)
  const grad2 = ctx.createLinearGradient(x + 350, y + 40, x + width, y + height);
  grad2.addColorStop(0, 'rgba(236, 72, 153, 0.0)');
  grad2.addColorStop(0.5, 'rgba(236, 72, 153, 0.16)');
  grad2.addColorStop(1, 'rgba(168, 85, 247, 0.25)');

  ctx.fillStyle = grad2;
  ctx.beginPath();
  ctx.moveTo(x + 360, y + height);
  ctx.bezierCurveTo(x + 520, y + height * 0.6, x + 720, y + height * 0.2, x + width + 20, y + height * 0.5);
  ctx.lineTo(x + width + 20, y + height);
  ctx.closePath();
  ctx.fill();

  // Subtle dot matrix grid on right edge
  ctx.fillStyle = 'rgba(168, 85, 247, 0.08)';
  const step = 14;
  for (let dx = x + width - 140; dx < x + width - 20; dx += step) {
    for (let dy = y + 24; dy < y + height - 24; dy += step) {
      ctx.beginPath();
      ctx.arc(dx, dy, 1.2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.restore();
}

/**
 * Draws tech corner brackets ┌ and ┐
 */
function drawCornerBrackets(ctx, x, y, width, height, len = 12, color = 'rgba(192, 132, 252, 0.7)') {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.8;
  ctx.lineCap = 'round';

  // Top-Left ┌
  ctx.beginPath();
  ctx.moveTo(x + 22, y + 22 + len);
  ctx.lineTo(x + 22, y + 22);
  ctx.lineTo(x + 22 + len, y + 22);
  ctx.stroke();

  // Top-Right ┐
  ctx.beginPath();
  ctx.moveTo(x + width - 22 - len, y + 22);
  ctx.lineTo(x + width - 22, y + 22);
  ctx.lineTo(x + width - 22, y + 22 + len);
  ctx.stroke();

  ctx.restore();
}

/**
 * Draws bottom center diamonds ◆ ◆ ◆ with fading horizontal glowing lines
 */
function drawBottomDiamondAccents(ctx, cx, cy, width = 280) {
  ctx.save();
  // Fading horizontal lines
  const lineGrad = ctx.createLinearGradient(cx - width / 2, cy, cx + width / 2, cy);
  lineGrad.addColorStop(0, 'transparent');
  lineGrad.addColorStop(0.35, 'rgba(168, 85, 247, 0.5)');
  lineGrad.addColorStop(0.5, 'rgba(217, 70, 239, 0.85)');
  lineGrad.addColorStop(0.65, 'rgba(168, 85, 247, 0.5)');
  lineGrad.addColorStop(1, 'transparent');

  ctx.strokeStyle = lineGrad;
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(cx - width / 2, cy);
  ctx.lineTo(cx - 24, cy);
  ctx.moveTo(cx + 24, cy);
  ctx.lineTo(cx + width / 2, cy);
  ctx.stroke();

  // Center larger diamond
  ctx.save();
  ctx.shadowColor = 'rgba(217, 70, 239, 0.85)';
  ctx.shadowBlur = 10;
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.moveTo(cx, cy - 6);
  ctx.lineTo(cx + 6, cy);
  ctx.lineTo(cx, cy + 6);
  ctx.lineTo(cx - 6, cy);
  ctx.closePath();
  ctx.fill();

  // Flanking smaller diamonds
  ctx.fillStyle = '#c084fc';
  ctx.beginPath();
  // Left
  ctx.moveTo(cx - 14, cy - 3.5);
  ctx.lineTo(cx - 10.5, cy);
  ctx.lineTo(cx - 14, cy + 3.5);
  ctx.lineTo(cx - 17.5, cy);
  // Right
  ctx.moveTo(cx + 14, cy - 3.5);
  ctx.lineTo(cx + 17.5, cy);
  ctx.lineTo(cx + 14, cy + 3.5);
  ctx.lineTo(cx + 10.5, cy);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  ctx.restore();
}

/**
 * Generates the Pixel-Perfect VYNTRIX Coin Wallet Canvas Card (Matching Reference Screenshot)
 */
export async function generateProfileCardImage({
  username = 'Vikas Singh',
  userId = '527175885309083648',
  avatarUrl = null,
  tierBadge = 'OWNER',
  balance = 0,
  totalPurchased = 0,
  totalSpent = 0
}) {
  const width = 1040;
  const height = 480;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = true;

  // 1. Deep Obsidian Pitch Black Canvas
  ctx.fillStyle = '#07060c';
  ctx.fillRect(0, 0, width, height);

  // 2. Base Card Dimensions
  const cardX = 16;
  const cardY = 16;
  const cardW = width - 32;
  const cardH = height - 32;
  const cardR = 24;

  // 3. Card Background & Ambient Violet Glow
  ctx.save();
  roundRect(ctx, cardX, cardY, cardW, cardH, cardR);
  ctx.clip();

  // Dark background gradient
  const bgGrad = ctx.createLinearGradient(cardX, cardY, cardX + cardW, cardY + cardH);
  bgGrad.addColorStop(0, '#0c0a15');
  bgGrad.addColorStop(0.4, '#100a1c');
  bgGrad.addColorStop(1, '#07060c');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(cardX, cardY, cardW, cardH);

  // Subtle ambient purple bloom at top-center and balance region
  const bloom = ctx.createRadialGradient(cardX + cardW * 0.45, cardY + 140, 20, cardX + cardW * 0.45, cardY + 140, 360);
  bloom.addColorStop(0, 'rgba(168, 85, 247, 0.16)');
  bloom.addColorStop(0.6, 'rgba(217, 70, 239, 0.05)');
  bloom.addColorStop(1, 'transparent');
  ctx.fillStyle = bloom;
  ctx.fillRect(cardX, cardY, cardW, cardH);

  ctx.restore();

  // 4. Outer Neon Border with Specular Cyber Glow
  ctx.save();
  ctx.shadowColor = 'rgba(192, 132, 252, 0.45)';
  ctx.shadowBlur = 18;

  const neonStroke = ctx.createLinearGradient(cardX, cardY, cardX + cardW, cardY + cardH);
  neonStroke.addColorStop(0, '#00f2fe'); // Subtle electric cyan top-left
  neonStroke.addColorStop(0.25, '#c084fc'); // Luminous violet
  neonStroke.addColorStop(0.7, '#ec4899'); // Neon magenta/pink
  neonStroke.addColorStop(1, '#8b5cf6'); // Violet

  ctx.strokeStyle = neonStroke;
  ctx.lineWidth = 2.2;
  roundRect(ctx, cardX, cardY, cardW, cardH, cardR);
  ctx.stroke();
  ctx.restore();

  // Corner brackets ┌ and ┐
  drawCornerBrackets(ctx, cardX, cardY, cardW, cardH);

  // ─── 5. Top Header (Profile, ID, Branding, Owner Badge) ─────────────────────
  const headerY = cardY + 22;

  // Avatar with Glowing Multi-Color Ring
  const avatarSize = 58;
  const avatarX = cardX + 32;
  const avatarY = headerY;
  const avatarCx = avatarX + avatarSize / 2;
  const avatarCy = avatarY + avatarSize / 2;

  ctx.save();
  ctx.beginPath();
  ctx.arc(avatarCx, avatarCy, avatarSize / 2 - 2, 0, Math.PI * 2);
  ctx.clip();

  let avatarLoaded = false;
  if (avatarUrl) {
    try {
      const img = await loadImage(avatarUrl);
      ctx.drawImage(img, avatarX + 2, avatarY + 2, avatarSize - 4, avatarSize - 4);
      avatarLoaded = true;
    } catch (_) {}
  }
  if (!avatarLoaded) {
    ctx.fillStyle = '#2e1065';
    ctx.fillRect(avatarX, avatarY, avatarSize, avatarSize);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText((username[0] || 'U').toUpperCase(), avatarCx, avatarCy);
  }
  ctx.restore();

  // Glowing Avatar Neon Ring
  ctx.save();
  ctx.shadowColor = 'rgba(217, 70, 239, 0.55)';
  ctx.shadowBlur = 12;
  const ringGrad = ctx.createLinearGradient(avatarX, avatarY, avatarX + avatarSize, avatarY + avatarSize);
  ringGrad.addColorStop(0, '#c084fc');
  ringGrad.addColorStop(1, '#ec4899');
  ctx.strokeStyle = ringGrad;
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.arc(avatarCx, avatarCy, avatarSize / 2, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  // Online Pulse Dot (Emerald Green at bottom-right of avatar)
  const dotX = avatarX + avatarSize - 4;
  const dotY = avatarY + avatarSize - 4;
  ctx.fillStyle = '#10b981';
  ctx.beginPath();
  ctx.arc(dotX, dotY, 6.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#0c0a15';
  ctx.lineWidth = 2.5;
  ctx.stroke();

  // Text Group Beside Avatar
  const textStartX = avatarX + avatarSize + 16;

  // Row 1: Username & Purple Verified Check Badge
  ctx.save();
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 22px "Segoe UI", sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  const nameY = headerY + 18;
  const displayName = truncateText(ctx, username, 240);
  ctx.fillText(displayName, textStartX, nameY);

  const nameWidth = ctx.measureText(displayName).width;
  drawVerifiedBadge(ctx, textStartX + nameWidth + 14, nameY, 9);
  ctx.restore();

  // Row 2: ID: <userId>  |  [Coin Stack] VYNTRIX COIN WALLET
  const metaY = headerY + 44;
  ctx.save();
  ctx.fillStyle = '#94a3b8';
  ctx.font = '600 13px "Segoe UI", sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  const idStr = `ID: ${userId}`;
  ctx.fillText(idStr, textStartX, metaY);

  const idWidth = ctx.measureText(idStr).width;
  const sepX = textStartX + idWidth + 14;

  // Vertical separator |
  ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
  ctx.fillRect(sepX, metaY - 7, 1.2, 14);

  // Stacked Coin Icon
  const stackX = sepX + 18;
  drawVectorCoinStack(ctx, stackX, metaY, 14);

  // VYNTRIX COIN WALLET
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 13px "Segoe UI", sans-serif';
  ctx.fillText('VYNTRIX COIN WALLET', stackX + 16, metaY);
  ctx.restore();

  // Top-Right: Laurel Wreath + Glowing OWNER Badge
  const badgeH = 34;
  const isOwnerBadge = String(tierBadge).toUpperCase().includes('OWNER');
  const badgeLabel = isOwnerBadge ? 'OWNER' : String(tierBadge).toUpperCase();
  ctx.font = 'bold 13px "Segoe UI", sans-serif';
  const bTextW = ctx.measureText(badgeLabel).width;
  const badgeW = 20 + bTextW + 32; // icon + padding
  const badgeX = cardX + cardW - badgeW - 46;
  const badgeY = headerY + (avatarSize - badgeH) / 2;

  // Laurel Wreath branches flanking the badge
  drawBadgeLaurelWreath(ctx, badgeX, badgeY, badgeW, badgeH, '#f59e0b');

  // Glowing Badge Container
  ctx.save();
  ctx.shadowColor = 'rgba(236, 72, 153, 0.55)';
  ctx.shadowBlur = 12;
  ctx.fillStyle = 'rgba(30, 16, 48, 0.75)';
  roundRect(ctx, badgeX, badgeY, badgeW, badgeH, 17);
  ctx.fill();

  ctx.strokeStyle = '#ec4899';
  ctx.lineWidth = 1.6;
  roundRect(ctx, badgeX, badgeY, badgeW, badgeH, 17);
  ctx.stroke();
  ctx.restore();

  // Crown Icon + Label
  const crownX = badgeX + 16;
  const crownY = badgeY + badgeH / 2;
  drawGoldenCrown(ctx, crownX, crownY, 15, 10);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 13px "Segoe UI", sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(badgeLabel, crownX + 12, crownY);

  // ─── 6. Middle Section: Main Balance Card ──────────────────────────────────
  const balBoxX = cardX + 26;
  const balBoxY = cardY + 98;
  const balBoxW = cardW - 52;
  const balBoxH = 186;
  const balBoxR = 20;

  ctx.save();
  // Fill & Ethereal Waves
  ctx.fillStyle = '#0b0916';
  roundRect(ctx, balBoxX, balBoxY, balBoxW, balBoxH, balBoxR);
  ctx.fill();

  drawEtherealWaveRibbons(ctx, balBoxX, balBoxY, balBoxW, balBoxH);

  // Glowing Neon Border
  ctx.shadowColor = 'rgba(168, 85, 247, 0.5)';
  ctx.shadowBlur = 16;
  const balStroke = ctx.createLinearGradient(balBoxX, balBoxY, balBoxX + balBoxW, balBoxY);
  balStroke.addColorStop(0, '#a855f7');
  balStroke.addColorStop(0.5, '#c084fc');
  balStroke.addColorStop(1, '#ec4899');
  ctx.strokeStyle = balStroke;
  ctx.lineWidth = 2;
  roundRect(ctx, balBoxX, balBoxY, balBoxW, balBoxH, balBoxR);
  ctx.stroke();
  ctx.restore();

  // Left: Large 3D Gold VYNTRIX Coin Emblem
  const coinCx = balBoxX + 96;
  const coinCy = balBoxY + balBoxH / 2;
  await drawLargeVyntrixCoin(ctx, coinCx, coinCy, 58);

  // Right: BALANCE // Header + Big Balance Amount + [ (V) Coins ] Pill
  const contentX = balBoxX + 185;

  // Header: Coin Stack + "BALANCE" + "//"
  const balHeaderY = balBoxY + 44;
  drawVectorCoinStack(ctx, contentX + 8, balHeaderY, 18);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 19px "Segoe UI", sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('BALANCE', contentX + 26, balHeaderY);

  const balLabelW = ctx.measureText('BALANCE').width;
  // Electric violet //
  ctx.fillStyle = '#c084fc';
  ctx.font = 'bold 18px "Segoe UI", sans-serif';
  ctx.fillText('//', contentX + 26 + balLabelW + 8, balHeaderY);

  // Big Balance Number (Metallic Gold-to-Yellow Radiant Gradient)
  const balAmountY = balBoxY + 120;
  const balStr = Number(balance).toLocaleString();

  // Set 64px font BEFORE measuring so numWidth is 100% accurate!
  ctx.font = 'bold 64px "Segoe UI", sans-serif';
  const numWidth = ctx.measureText(balStr).width;

  ctx.save();
  ctx.shadowColor = 'rgba(245, 158, 11, 0.45)';
  ctx.shadowBlur = 16;

  const numGrad = ctx.createLinearGradient(contentX, balAmountY - 40, contentX, balAmountY + 10);
  numGrad.addColorStop(0, '#fffde7');
  numGrad.addColorStop(0.35, '#fde047');
  numGrad.addColorStop(0.7, '#f59e0b');
  numGrad.addColorStop(1, '#d97706');

  ctx.fillStyle = numGrad;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(balStr, contentX, balAmountY);
  ctx.restore();

  // Oval Pill: [ (V) Coins ] - Placed with clean spacing after the balance number
  const coinPillX = contentX + numWidth + 24;
  const coinPillW = 106;
  const coinPillH = 38;
  const coinPillY = balAmountY - coinPillH / 2;

  ctx.save();
  ctx.fillStyle = 'rgba(16, 12, 28, 0.9)';
  roundRect(ctx, coinPillX, coinPillY, coinPillW, coinPillH, 19);
  ctx.fill();

  ctx.strokeStyle = 'rgba(245, 158, 11, 0.7)';
  ctx.lineWidth = 1.4;
  roundRect(ctx, coinPillX, coinPillY, coinPillW, coinPillH, 19);
  ctx.stroke();

  // Small Crisp Golden V Emblem inside pill
  const pCoinCx = coinPillX + 20;
  const pCoinCy = coinPillY + coinPillH / 2;

  // Outer Golden Ring
  const pGrad = ctx.createLinearGradient(pCoinCx - 10, pCoinCy - 10, pCoinCx + 10, pCoinCy + 10);
  pGrad.addColorStop(0, '#fde047');
  pGrad.addColorStop(0.5, '#f59e0b');
  pGrad.addColorStop(1, '#78350f');

  ctx.fillStyle = pGrad;
  ctx.beginPath();
  ctx.arc(pCoinCx, pCoinCy, 11, 0, Math.PI * 2);
  ctx.fill();

  // Inner Dark Center
  ctx.fillStyle = '#2d1302';
  ctx.beginPath();
  ctx.arc(pCoinCx, pCoinCy, 9, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#fbbf24';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(pCoinCx, pCoinCy, 9, 0, Math.PI * 2);
  ctx.stroke();

  // Golden Letter "V"
  ctx.fillStyle = '#fef08a';
  ctx.font = '900 11px "Segoe UI", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('V', pCoinCx, pCoinCy + 0.5);

  // "Coins" text in bold white
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 15px "Segoe UI", sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('Coins', coinPillX + 38, pCoinCy);
  ctx.restore();

  // ─── 7. Bottom Stats Cards (TOTAL TOP-UP & TOTAL SPENT) ─────────────────────
  const statBoxY = balBoxY + balBoxH + 18;
  const statGap = 20;
  const statBoxW = (balBoxW - statGap) / 2; // ~466px each
  const statBoxH = 102;
  const statBoxR = 18;

  // ── Card 1: TOTAL TOP-UP (Cyan Blue Neon Theme) ──
  const stat1X = balBoxX;

  ctx.save();
  // Fill & subtle cyan glow
  ctx.fillStyle = '#080d19';
  roundRect(ctx, stat1X, statBoxY, statBoxW, statBoxH, statBoxR);
  ctx.fill();

  const cyanBloom = ctx.createRadialGradient(stat1X + 60, statBoxY + 50, 10, stat1X + 60, statBoxY + 50, 180);
  cyanBloom.addColorStop(0, 'rgba(6, 182, 212, 0.16)');
  cyanBloom.addColorStop(1, 'transparent');
  ctx.fillStyle = cyanBloom;
  roundRect(ctx, stat1X, statBoxY, statBoxW, statBoxH, statBoxR);
  ctx.fill();

  // Neon Cyan Glowing Border
  ctx.shadowColor = 'rgba(6, 182, 212, 0.5)';
  ctx.shadowBlur = 14;
  ctx.strokeStyle = '#06b6d4';
  ctx.lineWidth = 1.8;
  roundRect(ctx, stat1X, statBoxY, statBoxW, statBoxH, statBoxR);
  ctx.stroke();
  ctx.restore();

  // Upload Button Icon
  drawUploadIcon(ctx, stat1X + 22, statBoxY + (statBoxH - 46) / 2, 46);

  // Labels: TOTAL TOP-UP & Amount
  const s1TextX = stat1X + 82;
  ctx.fillStyle = '#94a3b8';
  ctx.font = 'bold 12px "Segoe UI", sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText('TOTAL TOP-UP', s1TextX, statBoxY + 24);

  const topUpStr = Number(totalPurchased).toLocaleString();
  ctx.fillStyle = '#00f2fe';
  ctx.font = 'bold 26px "Segoe UI", sans-serif';
  ctx.textBaseline = 'bottom';
  ctx.fillText(topUpStr, s1TextX, statBoxY + 80);

  const topUpWidth = ctx.measureText(topUpStr).width;
  ctx.fillStyle = '#ffffff';
  ctx.font = '600 15px "Segoe UI", sans-serif';
  ctx.fillText('Coins', s1TextX + topUpWidth + 8, statBoxY + 77);

  // Right: Translucent Cyan Coin Stack Illustration
  drawTranslucentCyanCoinStack(ctx, stat1X + statBoxW - 46, statBoxY + statBoxH / 2 + 2, 28);

  // ── Card 2: TOTAL SPENT (Magenta / Pink Neon Theme) ──
  const stat2X = stat1X + statBoxW + statGap;

  ctx.save();
  // Fill & subtle magenta glow
  ctx.fillStyle = '#140918';
  roundRect(ctx, stat2X, statBoxY, statBoxW, statBoxH, statBoxR);
  ctx.fill();

  const magBloom = ctx.createRadialGradient(stat2X + 60, statBoxY + 50, 10, stat2X + 60, statBoxY + 50, 180);
  magBloom.addColorStop(0, 'rgba(236, 72, 153, 0.16)');
  magBloom.addColorStop(1, 'transparent');
  ctx.fillStyle = magBloom;
  roundRect(ctx, stat2X, statBoxY, statBoxW, statBoxH, statBoxR);
  ctx.fill();

  // Neon Magenta Glowing Border
  ctx.shadowColor = 'rgba(236, 72, 153, 0.5)';
  ctx.shadowBlur = 14;
  ctx.strokeStyle = '#ec4899';
  ctx.lineWidth = 1.8;
  roundRect(ctx, stat2X, statBoxY, statBoxW, statBoxH, statBoxR);
  ctx.stroke();
  ctx.restore();

  // Download / Spent Button Icon
  drawSpentIcon(ctx, stat2X + 22, statBoxY + (statBoxH - 46) / 2, 46);

  // Labels: TOTAL SPENT & Amount
  const s2TextX = stat2X + 82;
  ctx.fillStyle = '#94a3b8';
  ctx.font = 'bold 12px "Segoe UI", sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText('TOTAL SPENT', s2TextX, statBoxY + 24);

  const spentStr = Number(totalSpent).toLocaleString();
  ctx.fillStyle = '#ec4899';
  ctx.font = 'bold 26px "Segoe UI", sans-serif';
  ctx.textBaseline = 'bottom';
  ctx.fillText(spentStr, s2TextX, statBoxY + 80);

  const spentWidth = ctx.measureText(spentStr).width;
  ctx.fillStyle = '#ffffff';
  ctx.font = '600 15px "Segoe UI", sans-serif';
  ctx.fillText('Coins', s2TextX + spentWidth + 8, statBoxY + 77);

  // Right: Translucent Glowing Magenta Shopping Cart Illustration
  drawNeonPinkShoppingCart(ctx, stat2X + statBoxW - 48, statBoxY + statBoxH / 2, 34);

  // ─── 8. Bottom Center Diamond Accents ───────────────────────────────────────
  drawBottomDiamondAccents(ctx, cardX + cardW / 2, cardY + cardH, 260);

  return canvas.encode('png');
}
