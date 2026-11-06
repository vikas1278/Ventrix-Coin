import crypto from 'node:crypto';
import { Wallet, Ledger, GameSettings, MineSession, GameHistory } from '../models.js';
import { clearMineTimer } from '../games/mines/mine-timer.js';
import { renderMine } from '../games/mines/mine-ui.js';

export const GRID_SIZE = 9;
export const MINE_COUNT = 3;

/**
 * Probability calculation for safe tiles
 */
export function chanceAfterSafePicks(picks, gridSize = GRID_SIZE, mineCount = MINE_COUNT) {
  let probability = 1;
  for (let i = 0; i < picks; i++) {
    probability *= (gridSize - mineCount - i) / (gridSize - i);
  }
  return probability;
}

/**
 * Multiplier calculation based on safe picks
 */
export function multiplierForPicks(picks) {
  if (picks <= 0) return 0;
  return 0.95 / chanceAfterSafePicks(picks);
}

// In-memory cache for game settings to make slash commands instant (<1ms)
const settingsCache = new Map();
const SETTINGS_TTL = 30000; // 30s TTL

/**
 * Fetch or initialize guild gaming settings
 */
export async function getGameSettings(guildId) {
  const cached = settingsCache.get(guildId);
  if (cached && (Date.now() - cached.timestamp < SETTINGS_TTL)) {
    return cached.data;
  }

  const doc = await GameSettings.findOne({ guildId }).lean();
  const data = doc || {
    guildId,
    minBet: 1,
    maxBet: 1000000,
    startingCoins: 0,
    disabledGames: [],
    bettingEnabled: true
  };

  settingsCache.set(guildId, { data, timestamp: Date.now() });
  return data;
}

/**
 * Save or update guild gaming settings
 */
export async function saveGameSettings(guildId, updates, updatedBy = 'system') {
  settingsCache.delete(guildId);
  return GameSettings.findOneAndUpdate(
    { guildId },
    {
      $set: {
        ...updates,
        updatedBy
      }
    },
    { upsert: true, new: true }
  ).lean();
}

/**
 * Start a new Mines round
 */
export async function startMineRound({ guildId, guildName = '', userId, playerName = 'Player', channelId = null, bet, client = null }) {
  // 1. Auto-resolve any previous active round so the user's bet/winnings are NEVER stuck
  const previousSession = await MineSession.findOne({ guildId, userId, status: 'active' });
  if (previousSession) {
    try {
      clearMineTimer(previousSession.sessionId);
      if (previousSession.revealed && previousSession.revealed.length > 0) {
        // Auto-cashout safe picks: user gets their accumulated payout credited!
        const res = await resolveMineRound({
          guildId,
          userId,
          sessionId: previousSession.sessionId,
          action: 'cashout'
        });
        if (client && previousSession.channelId && previousSession.messageId && res?.session) {
          // Asynchronously update old message without blocking new round startup
          (async () => {
            try {
              const oldChan = client.channels.cache.get(previousSession.channelId) || await client.channels.fetch(previousSession.channelId).catch(() => null);
              if (oldChan) {
                const oldMsg = await oldChan.messages.fetch(previousSession.messageId).catch(() => null);
                if (oldMsg) await oldMsg.edit(renderMine(res.session)).catch(() => {});
              }
            } catch (_) {}
          })();
        }
      } else {
        // No moves were made: 100% refund the bet back to user wallet
        await Wallet.findOneAndUpdate(
          { guildId, userId },
          {
            $inc: { balance: previousSession.bet, totalSpent: -previousSession.bet, gamesPlayed: -1 }
          }
        ).catch(() => {});

        previousSession.status = 'expired';
        previousSession.endedAt = new Date();
        await previousSession.save().catch(() => {});

        const refTxId = `TX-REFUND-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
        Ledger.create({
          guildId,
          guildName,
          userId,
          username: playerName,
          orderId: previousSession.sessionId,
          rrn: refTxId,
          coins: previousSession.bet,
          type: 'game_refund',
          direction: 'credit',
          description: `Mines bet refund (round abandoned, 0 moves): +${previousSession.bet.toLocaleString()} coins`,
          balanceBefore: 0,
          balanceAfter: previousSession.bet,
          transactionId: refTxId,
          performedBy: userId
        }).catch(() => {});

        if (client && previousSession.channelId && previousSession.messageId) {
          // Asynchronously update old message without blocking new round startup
          (async () => {
            try {
              const oldChan = client.channels.cache.get(previousSession.channelId) || await client.channels.fetch(previousSession.channelId).catch(() => null);
              if (oldChan) {
                const oldMsg = await oldChan.messages.fetch(previousSession.messageId).catch(() => null);
                if (oldMsg) await oldMsg.edit(renderMine(previousSession.toObject())).catch(() => {});
              }
            } catch (_) {}
          })();
        }
      }
    } catch (prevErr) {
      console.warn('[MINE] Failed to cleanly settle previous session:', prevErr.message);
    }
  }

  // 2. Atomic check and deduction of bet from user's coin wallet
  const wallet = await Wallet.findOneAndUpdate(
    { guildId, userId, balance: { $gte: bet } },
    {
      $inc: { balance: -bet, totalSpent: bet, gamesPlayed: 1 },
      $set: { guildName, username: playerName }
    },
    { new: true }
  );

  if (!wallet) {
    const err = new Error('INSUFFICIENT_FUNDS');
    err.code = 'INSUFFICIENT_FUNDS';
    throw err;
  }

  // 3. Generate random unique positions for 3 mines in 3x3 grid (0..8)
  const minePositions = [];
  while (minePositions.length < MINE_COUNT) {
    const pos = Math.floor(Math.random() * GRID_SIZE);
    if (!minePositions.includes(pos)) minePositions.push(pos);
  }

  const sessionId = `MINE-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 5 * 60 * 1000); // 5 minutes inactivity expiry

  // 4. Create active MineSession in MongoDB
  const session = await MineSession.create({
    sessionId,
    guildId,
    userId,
    playerName,
    channelId,
    messageId: null,
    game: 'mines',
    bet,
    minePositions,
    revealed: [],
    explodedIndex: null,
    status: 'active',
    payout: 0,
    balanceAfterBet: wallet.balance,
    createdAt: now,
    expiresAt
  });

  // 5. Record bet deduction in official Coin Ledger
  const txId = `TX-BET-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
  Ledger.create({
    guildId,
    guildName,
    userId,
    username: playerName,
    orderId: sessionId,
    rrn: txId,
    coins: -bet,
    type: 'game_bet',
    direction: 'debit',
    description: `Mines bet: ${bet.toLocaleString()} coins`,
    balanceBefore: wallet.balance + bet,
    balanceAfter: wallet.balance,
    transactionId: txId,
    performedBy: userId
  }).catch(err => console.error('[GAMING] Ledger error:', err));

  return session.toObject();
}

/**
 * Update message details for a session
 */
export async function updateSessionMessage(guildId, userId, sessionId, messageId, channelId = null) {
  try {
    const update = { messageId };
    if (channelId) update.channelId = channelId;
    await MineSession.findOneAndUpdate({ guildId, userId, sessionId }, { $set: update });
  } catch (err) {
    console.error('[GAMING] updateSessionMessage error:', err);
  }
}

/**
 * Resolve an action (tile click, cashout, expire) in a Mines round
 */
export async function resolveMineRound({ guildId, userId, sessionId, action, index, sessionDoc = null }) {
  const session = sessionDoc || await MineSession.findOne({ sessionId, guildId, userId });
  if (!session || session.status !== 'active') {
    return { error: 'SESSION_NOT_ACTIVE', session: session?.toObject?.() || session };
  }

  const isExpired = new Date(session.expiresAt).getTime() <= Date.now();
  if (isExpired || action === 'expire') {
    session.status = 'expired';
  } else if (action === 'tile') {
    if (!Number.isInteger(index) || index < 0 || index > 8) {
      return { error: 'INVALID_TILE', session: session.toObject() };
    }
    if (session.revealed.includes(index)) {
      return { error: 'ALREADY_REVEALED', session: session.toObject() };
    }
    if (session.minePositions.includes(index)) {
      session.status = 'lost';
      session.explodedIndex = index;
    } else {
      session.revealed.push(index);
      if (session.revealed.length === 6) {
        session.status = 'won'; // Cleared all 6 non-mine tiles!
      }
    }
  } else if (action === 'cashout') {
    if (session.revealed.length === 0) {
      return { error: 'CASHOUT_REQUIRED_SAFE_PICK', session: session.toObject() };
    }
    session.status = 'cashed_out';
  } else {
    return { error: 'INVALID_ACTION', session: session.toObject() };
  }

  // If game is still active, bump inactivity timer and persist state
  if (session.status === 'active') {
    session.expiresAt = new Date(Date.now() + 5 * 60 * 1000);
    await session.save();
    return { session: session.toObject(), completed: false };
  }

  // Round completed: calculate payout, XP, win/loss stats
  const safePicks = session.revealed.length;
  let payout = 0;
  if (session.status === 'lost') {
    payout = 0;
  } else if (session.status === 'expired') {
    // If timed out, award current winnings if safe picks were made; if 0 picks, refund the bet!
    payout = safePicks > 0 ? Math.floor(session.bet * multiplierForPicks(safePicks)) : session.bet;
  } else {
    payout = Math.floor(session.bet * multiplierForPicks(safePicks));
  }

  const isRefund = session.status === 'expired' && safePicks === 0;
  const won = payout > session.bet;
  const net = payout - session.bet;
  const xpGained = session.status === 'lost' ? 5 : (10 + safePicks * 3);
  const now = new Date();
  const txPrefix = session.status === 'lost' ? 'LOSS' : (isRefund ? 'REFUND' : 'WIN');
  const txId = `TX-${txPrefix}-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

  // Credit payout / refund atomically back into user's wallet
  let finalBalance = session.balanceAfterBet || 0;
  if (payout > 0) {
    const wallet = await Wallet.findOneAndUpdate(
      { guildId, userId },
      {
        $inc: {
          balance: payout,
          totalEarned: won ? net : 0,
          wins: won ? 1 : 0,
          losses: (!won && !isRefund && session.status === 'lost') ? 1 : 0,
          xp: xpGained
        }
      },
      { new: true }
    );
    if (wallet) {
      finalBalance = wallet.balance;
      const calculatedLevel = Math.floor((wallet.xp || 0) / 250) + 1;
      if (wallet.level !== calculatedLevel) {
        wallet.level = calculatedLevel;
        wallet.save().catch(() => {});
      }
    }
  } else {
    const wallet = await Wallet.findOneAndUpdate(
      { guildId, userId },
      {
        $inc: {
          losses: 1,
          xp: xpGained
        }
      },
      { new: true }
    );
    if (wallet) {
      finalBalance = wallet.balance;
    }
  }

  session.payout = payout;
  session.balanceAfter = finalBalance;
  session.endedAt = now;
  session.txId = txId;
  await session.save();

  // Create Ledger record and GameHistory in the background so button handler finishes in <30ms
  if (payout > 0) {
    Ledger.create({
      guildId,
      userId,
      username: session.playerName,
      orderId: session.sessionId,
      rrn: txId,
      coins: payout,
      type: isRefund ? 'game_refund' : 'game_payout',
      direction: 'credit',
      description: isRefund
        ? `Mines timeout refund (0 moves): +${payout.toLocaleString()} coins`
        : `Mines payout: +${payout.toLocaleString()} coins (${safePicks} safe tiles, ${session.status})`,
      balanceBefore: finalBalance - payout,
      balanceAfter: finalBalance,
      transactionId: txId,
      performedBy: userId
    }).catch(err => console.error('[GAMING] Ledger error:', err));
  }

  const desc = session.status === 'expired'
    ? (safePicks > 0 ? `Mines: ${safePicks} safe tile(s), timeout auto-cashout` : `Mines: 0 safe tiles, timeout refunded`)
    : `Mines: ${safePicks} safe tile(s), ${session.status}`;

  GameHistory.create({
    guildId,
    userId,
    game: 'mines',
    bet: session.bet,
    payout,
    net,
    won,
    score: safePicks,
    description: desc,
    sessionId: session.sessionId,
    txId
  }).catch(err => console.error('[GAMING] GameHistory error:', err));

  return { session: session.toObject(), completed: true };
}

