import crypto from 'node:crypto';
import { Wallet, Ledger, GameHistory } from '../../models.js';
import {
  RPS_MOVES,
  evaluateRps,
  buildRpsResultEmbed,
  buildRpsTimeoutEmbed,
  buildRpsButtons
} from './rps-ui.js';

// In-memory active game sessions
export const activeSessions = new Map(); // sessionId -> sessionData
export const userToSession = new Map(); // `${guildId}::${userId}` -> sessionId

export const RPS_TIMEOUT_MS = 30000; // 30 seconds

/**
 * Creates and registers a new RPS game session
 */
export function createRpsSession({
  guildId,
  guildName,
  channelId,
  userId,
  playerName,
  playerAvatar,
  bet,
  gameId,
  txBetId,
  client,
  replyMessage
}) {
  const sessionId = `RPS-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
  const userKey = `${guildId}::${userId}`;

  const session = {
    sessionId,
    userKey,
    guildId,
    guildName,
    channelId,
    userId,
    playerName,
    playerAvatar,
    bet,
    gameId,
    txBetId,
    client,
    messageId: replyMessage?.id || null,
    isSettled: false,
    timerHandle: null,
    createdAt: Date.now()
  };

  // Schedule 30-Second Inactivity Timeout
  session.timerHandle = setTimeout(async () => {
    await handleRpsTimeout(sessionId).catch(err => {
      console.error('[RPS TIMEOUT ERROR]', err);
    });
  }, RPS_TIMEOUT_MS);

  activeSessions.set(sessionId, session);
  userToSession.set(userKey, sessionId);

  return session;
}

/**
 * Handles 30-Second Inactivity Expiration (100% Refund)
 */
export async function handleRpsTimeout(sessionId) {
  const session = activeSessions.get(sessionId);
  if (!session || session.isSettled) return;

  session.isSettled = true;
  if (session.timerHandle) clearTimeout(session.timerHandle);

  // 1. Atomic Refund back to user's wallet
  let updatedBalance = 0;
  try {
    const refundedWallet = await Wallet.findOneAndUpdate(
      { guildId: session.guildId, userId: session.userId },
      {
        $inc: { balance: session.bet, totalSpent: -session.bet, gamesPlayed: -1 }
      },
      { new: true }
    );
    if (refundedWallet) {
      updatedBalance = refundedWallet.balance;
    }
  } catch (err) {
    console.error('[RPS TIMEOUT] Wallet refund error:', err);
  }

  // 2. Record Refund in Transaction Ledger
  const refTxId = `TX-REF-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
  await Ledger.create({
    guildId: session.guildId,
    guildName: session.guildName,
    userId: session.userId,
    username: session.playerName,
    orderId: session.gameId,
    rrn: refTxId,
    coins: session.bet,
    type: 'game_refund',
    direction: 'credit',
    description: `RPS refund (expired after 30s): +${session.bet.toLocaleString()} coins`,
    balanceBefore: updatedBalance - session.bet,
    balanceAfter: updatedBalance,
    transactionId: refTxId,
    performedBy: session.userId
  }).catch(err => console.error('[RPS TIMEOUT] Ledger refund error:', err));

  // 3. Record in GameHistory
  await GameHistory.create({
    guildId: session.guildId,
    userId: session.userId,
    game: 'rps',
    bet: session.bet,
    payout: session.bet,
    net: 0,
    won: false,
    score: 0,
    description: `RPS: Expired after 30s — Bet refunded`,
    sessionId: session.gameId,
    txId: refTxId
  }).catch(() => {});

  // 4. Update Discord Message to Disabled Timeout Embed
  try {
    if (session.client && session.channelId && session.messageId) {
      const channel = session.client.channels.cache.get(session.channelId) ||
        await session.client.channels.fetch(session.channelId).catch(() => null);

      if (channel) {
        const msg = await channel.messages.fetch(session.messageId).catch(() => null);
        if (msg) {
          const timeoutEmbed = buildRpsTimeoutEmbed({
            playerName: session.playerName,
            playerAvatar: session.playerAvatar,
            bet: session.bet,
            currentBalance: updatedBalance
          });
          const disabledButtons = buildRpsButtons(sessionId, true);

          await msg.edit({
            embeds: [timeoutEmbed],
            components: [disabledButtons]
          }).catch(() => {});
        }
      }
    }
  } catch (msgErr) {
    console.warn('[RPS TIMEOUT] Could not edit message:', msgErr.message);
  } finally {
    cleanupSession(sessionId);
  }
}

/**
 * Resolves a move chosen by player against crypto-random bot move
 */
export async function settleRpsMove(sessionId, playerMove) {
  const session = activeSessions.get(sessionId);
  if (!session) {
    return { error: 'SESSION_NOT_FOUND' };
  }
  if (session.isSettled) {
    return { error: 'ALREADY_SETTLED' };
  }

  // Atomic state settlement lock
  session.isSettled = true;
  if (session.timerHandle) clearTimeout(session.timerHandle);

  // 1. Cryptographically Secure Bot Move Selection
  const moves = ['rock', 'paper', 'scissors'];
  const botMove = moves[crypto.randomInt(0, 3)];

  // 2. Evaluate Outcome
  const { outcome, reason } = evaluateRps(playerMove, botMove);

  const bet = session.bet;
  let payout = 0;
  let net = 0;
  let won = false;

  const txId = `TX-${outcome.toUpperCase()}-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
  let updatedBalance = 0;

  if (outcome === 'win') {
    payout = bet * 2;
    net = bet;
    won = true;

    // Credit 2.0x Payout atomically to user wallet
    const updatedWallet = await Wallet.findOneAndUpdate(
      { guildId: session.guildId, userId: session.userId },
      {
        $inc: { balance: payout, totalEarned: payout, wins: 1, xp: 15 },
        $set: { guildName: session.guildName, username: session.playerName }
      },
      { new: true }
    );
    if (updatedWallet) {
      updatedBalance = updatedWallet.balance;
      const newLevel = Math.floor((updatedWallet.xp || 0) / 250) + 1;
      if (updatedWallet.level !== newLevel) {
        updatedWallet.level = newLevel;
        await updatedWallet.save().catch(() => {});
      }
    }

    // Ledger Win Record
    await Ledger.create({
      guildId: session.guildId,
      guildName: session.guildName,
      userId: session.userId,
      username: session.playerName,
      orderId: session.gameId,
      rrn: txId,
      coins: payout,
      type: 'game_payout',
      direction: 'credit',
      description: `RPS WIN: ${playerMove.toUpperCase()} vs ${botMove.toUpperCase()} (+${payout.toLocaleString()} coins)`,
      balanceBefore: updatedBalance - payout,
      balanceAfter: updatedBalance,
      transactionId: txId,
      performedBy: session.userId
    }).catch(err => console.error('[RPS] Ledger win error:', err));

    // GameHistory Win Record
    await GameHistory.create({
      guildId: session.guildId,
      userId: session.userId,
      game: 'rps',
      bet,
      payout,
      net,
      won: true,
      score: 1,
      description: `RPS: Picked ${playerMove.toUpperCase()} vs ${botMove.toUpperCase()} — Won 2x!`,
      sessionId: session.gameId,
      txId
    }).catch(() => {});
  } else if (outcome === 'lose') {
    payout = 0;
    net = -bet;
    won = false;

    // Record loss and XP in wallet
    const updatedWallet = await Wallet.findOneAndUpdate(
      { guildId: session.guildId, userId: session.userId },
      {
        $inc: { losses: 1, xp: 5 },
        $set: { guildName: session.guildName, username: session.playerName }
      },
      { new: true }
    );
    if (updatedWallet) {
      updatedBalance = updatedWallet.balance;
    }

    // GameHistory Loss Record
    await GameHistory.create({
      guildId: session.guildId,
      userId: session.userId,
      game: 'rps',
      bet,
      payout: 0,
      net: -bet,
      won: false,
      score: 0,
      description: `RPS: Picked ${playerMove.toUpperCase()} vs ${botMove.toUpperCase()} — Lost`,
      sessionId: session.gameId,
      txId: session.txBetId
    }).catch(() => {});
  } else {
    // DRAW: 100% Refund complete bet back to user wallet
    payout = bet;
    net = 0;
    won = false;

    const updatedWallet = await Wallet.findOneAndUpdate(
      { guildId: session.guildId, userId: session.userId },
      {
        $inc: { balance: bet, totalSpent: -bet, gamesPlayed: -1 },
        $set: { guildName: session.guildName, username: session.playerName }
      },
      { new: true }
    );
    if (updatedWallet) {
      updatedBalance = updatedWallet.balance;
    }

    // Ledger Refund Record
    await Ledger.create({
      guildId: session.guildId,
      guildName: session.guildName,
      userId: session.userId,
      username: session.playerName,
      orderId: session.gameId,
      rrn: txId,
      coins: bet,
      type: 'game_refund',
      direction: 'credit',
      description: `RPS DRAW: Both selected ${playerMove.toUpperCase()} (Refunded ${bet.toLocaleString()} coins)`,
      balanceBefore: updatedBalance - bet,
      balanceAfter: updatedBalance,
      transactionId: txId,
      performedBy: session.userId
    }).catch(err => console.error('[RPS] Ledger draw error:', err));

    // GameHistory Draw Record
    await GameHistory.create({
      guildId: session.guildId,
      userId: session.userId,
      game: 'rps',
      bet,
      payout: bet,
      net: 0,
      won: false,
      score: 0,
      description: `RPS: Both picked ${playerMove.toUpperCase()} — Draw (Refunded)`,
      sessionId: session.gameId,
      txId
    }).catch(() => {});
  }

  // 3. Prepare Final Result Embed & Disabled Buttons
  const resultEmbed = buildRpsResultEmbed({
    playerName: session.playerName,
    playerAvatar: session.playerAvatar,
    playerMove,
    botMove,
    outcome,
    reason,
    bet,
    payout,
    net,
    newBalance: updatedBalance
  });

  const disabledButtons = buildRpsButtons(sessionId, true, playerMove, botMove);

  // 4. Memory Cleanup
  cleanupSession(sessionId);

  return {
    success: true,
    outcome,
    playerMove,
    botMove,
    reason,
    bet,
    payout,
    net,
    newBalance: updatedBalance,
    resultEmbed,
    disabledButtons
  };
}

/**
 * Frees session memory and user locks
 */
export function cleanupSession(sessionId) {
  const session = activeSessions.get(sessionId);
  if (session) {
    if (session.timerHandle) clearTimeout(session.timerHandle);
    userToSession.delete(session.userKey);
    activeSessions.delete(sessionId);
  }
}

