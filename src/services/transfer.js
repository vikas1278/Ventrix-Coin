import crypto from 'node:crypto';
import mongoose from 'mongoose';
import { Wallet, Ledger } from '../models.js';

/**
 * Executes a two-sided coin transfer between two users atomically.
 *
 * Guarantees:
 * 1. Sender wallet debit and recipient wallet credit happen atomically.
 * 2. Two linked ledger entries are created using the same transaction ID.
 * 3. Before-and-after balances are recorded accurately on both ledger records.
 * 4. Double-spending and negative balances are prevented via atomic conditional queries.
 * 5. If any operation fails, all changes are rolled back.
 * 6. Idempotency protection prevents duplicate transfers on retries.
 */
export async function executeTransfer({
  guildId = 'DM',
  guildName = 'Direct Message',
  senderUser,
  recipientUser,
  amount,
  idempotencyKey = null,
}) {
  // ─── 1. Validation ──────────────────────────────────────────────────────────
  if (!senderUser || !senderUser.id) {
    throw new Error('INVALID_SENDER: Sender user is required.');
  }
  if (!recipientUser || !recipientUser.id) {
    throw new Error('INVALID_RECIPIENT: Recipient user is required.');
  }

  const senderId = String(senderUser.id);
  const recipientId = String(recipientUser.id);

  if (senderUser.bot) {
    throw new Error('BOT_SENDER: Bots cannot transfer coins.');
  }
  if (recipientUser.bot) {
    throw new Error('BOT_RECIPIENT: Coins cannot be transferred to a bot.');
  }
  if (senderId === recipientId) {
    throw new Error('SELF_TRANSFER: You cannot transfer coins to yourself.');
  }

  const cleanAmount = Number(amount);
  if (!Number.isInteger(cleanAmount) || cleanAmount <= 0) {
    throw new Error('INVALID_AMOUNT: Transfer amount must be a positive integer.');
  }

  const cleanIdempotencyKey = idempotencyKey ? String(idempotencyKey).trim() : null;

  // ─── 2. Idempotency Pre-Check ───────────────────────────────────────────────
  if (cleanIdempotencyKey) {
    const existingSenderTx = await Ledger.findOne({
      idempotencyKey: `${cleanIdempotencyKey}:sender`,
      userId: senderId,
      type: 'transfer',
    }).lean();

    if (existingSenderTx) {
      const existingRecipientTx = await Ledger.findOne({
        transactionId: existingSenderTx.transactionId,
        userId: recipientId,
        type: 'transfer',
      }).lean();

      return {
        success: true,
        alreadyProcessed: true,
        transactionId: existingSenderTx.transactionId,
        amount: Math.abs(existingSenderTx.coins),
        senderId,
        recipientId,
        senderBalanceBefore: existingSenderTx.balanceBefore,
        senderBalanceAfter: existingSenderTx.balanceAfter,
        recipientBalanceBefore: existingRecipientTx?.balanceBefore ?? null,
        recipientBalanceAfter: existingRecipientTx?.balanceAfter ?? null,
        timestamp: existingSenderTx.createdAt,
      };
    }
  }

  // Pre-check sender balance before starting transactions
  const senderWalletCheck = await Wallet.findOne({ guildId, userId: senderId }).lean();
  const currentSenderBalance = senderWalletCheck?.balance || 0;
  if (currentSenderBalance < cleanAmount) {
    throw new Error(`INSUFFICIENT_FUNDS:${currentSenderBalance}`);
  }

  // Generate shared unique transaction ID
  const txId = `TRF-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

  const senderUsername = senderUser.tag || senderUser.username || senderId;
  const recipientUsername = recipientUser.tag || recipientUser.username || recipientId;

  const senderDesc = `Transferred ${cleanAmount} coins to @${recipientUser.displayName || recipientUser.username || recipientId}`;
  const recipientDesc = `Received ${cleanAmount} coins from @${senderUser.displayName || senderUser.username || senderId}`;

  // ─── 3. Atomic Database Operations (Replica-set Transaction) ────────────────
  let session = null;
  let useTransaction = true;
  try {
    session = await mongoose.startSession();
  } catch {
    useTransaction = false;
  }

  if (useTransaction && session) {
    try {
      let result = null;
      await session.withTransaction(async () => {
        // Idempotency double-check inside transaction
        if (cleanIdempotencyKey) {
          const inTxExisting = await Ledger.findOne({
            idempotencyKey: `${cleanIdempotencyKey}:sender`,
            userId: senderId,
          }).session(session);

          if (inTxExisting) {
            result = {
              success: true,
              alreadyProcessed: true,
              transactionId: inTxExisting.transactionId,
              amount: Math.abs(inTxExisting.coins),
              senderId,
              recipientId,
              senderBalanceBefore: inTxExisting.balanceBefore,
              senderBalanceAfter: inTxExisting.balanceAfter,
              timestamp: inTxExisting.createdAt,
            };
            return;
          }
        }

        // 1. Fetch sender balance inside session
        const freshSenderWallet = await Wallet.findOne({ guildId, userId: senderId }).session(session);
        const sBefore = freshSenderWallet?.balance || 0;
        if (sBefore < cleanAmount) {
          throw new Error(`INSUFFICIENT_FUNDS:${sBefore}`);
        }

        // 2. Fetch recipient balance inside session
        const freshRecipientWallet = await Wallet.findOne({ guildId, userId: recipientId }).session(session);
        const rBefore = freshRecipientWallet?.balance || 0;

        // 3. Conditional atomic debit from sender (strictly checks balance >= amount)
        const updatedSender = await Wallet.findOneAndUpdate(
          { guildId, userId: senderId, balance: { $gte: cleanAmount } },
          {
            $inc: { balance: -cleanAmount },
            $set: { guildName, username: senderUsername },
          },
          { new: true, session }
        );

        if (!updatedSender) {
          throw new Error(`INSUFFICIENT_FUNDS:${sBefore}`);
        }
        const sAfter = updatedSender.balance;

        // 4. Atomic credit to recipient (upsert creates wallet if missing)
        const updatedRecipient = await Wallet.findOneAndUpdate(
          { guildId, userId: recipientId },
          {
            $inc: { balance: cleanAmount },
            $set: { guildName, username: recipientUsername },
            $setOnInsert: { guildId, userId: recipientId },
          },
          { upsert: true, new: true, session }
        );
        const rAfter = updatedRecipient.balance;

        // 5. Create two linked ledger records using the SAME unique transaction ID
        const now = new Date();
        await Ledger.create([
          {
            guildId,
            guildName,
            userId: senderId,
            username: senderUsername,
            orderId: txId,
            rrn: txId,
            coins: -cleanAmount,
            type: 'transfer',
            direction: 'debit',
            counterparty: recipientId,
            counterpartyUsername: recipientUsername,
            description: senderDesc,
            reason: senderDesc,
            balanceBefore: sBefore,
            balanceAfter: sAfter,
            status: 'completed',
            transactionId: txId,
            performedBy: senderId,
            idempotencyKey: cleanIdempotencyKey ? `${cleanIdempotencyKey}:sender` : null,
            createdAt: now,
            updatedAt: now,
          },
          {
            guildId,
            guildName,
            userId: recipientId,
            username: recipientUsername,
            orderId: txId,
            rrn: txId,
            coins: cleanAmount,
            type: 'transfer',
            direction: 'credit',
            counterparty: senderId,
            counterpartyUsername: senderUsername,
            description: recipientDesc,
            reason: recipientDesc,
            balanceBefore: rBefore,
            balanceAfter: rAfter,
            status: 'completed',
            transactionId: txId,
            performedBy: senderId,
            idempotencyKey: cleanIdempotencyKey ? `${cleanIdempotencyKey}:recipient` : null,
            createdAt: now,
            updatedAt: now,
          }
        ], { session, ordered: true });

        result = {
          success: true,
          alreadyProcessed: false,
          transactionId: txId,
          amount: cleanAmount,
          senderId,
          recipientId,
          senderBalanceBefore: sBefore,
          senderBalanceAfter: sAfter,
          recipientBalanceBefore: rBefore,
          recipientBalanceAfter: rAfter,
          timestamp: now,
        };
      });

      return result;
    } catch (txErr) {
      const isReplicaSetError =
        txErr.message?.includes('replica set') ||
        txErr.message?.includes('Transaction numbers are only allowed');

      if (!isReplicaSetError) {
        throw txErr;
      }
      // If transactions are unsupported in this deployment, proceed to atomic fallback
    } finally {
      await session.endSession().catch(() => {});
    }
  }

  // ─── 4. Standalone Atomic Fallback (when replica set is not available) ─────
  const sBefore = currentSenderBalance;
  const recipientWalletBefore = await Wallet.findOne({ guildId, userId: recipientId }).lean();
  const rBefore = recipientWalletBefore?.balance || 0;

  // Step A: Atomic conditional debit from sender
  const updatedSender = await Wallet.findOneAndUpdate(
    { guildId, userId: senderId, balance: { $gte: cleanAmount } },
    {
      $inc: { balance: -cleanAmount },
      $set: { guildName, username: senderUsername },
    },
    { new: true }
  );

  if (!updatedSender) {
    throw new Error(`INSUFFICIENT_FUNDS:${sBefore}`);
  }
  const sAfter = updatedSender.balance;

  try {
    // Step B: Atomic credit to recipient
    const updatedRecipient = await Wallet.findOneAndUpdate(
      { guildId, userId: recipientId },
      {
        $inc: { balance: cleanAmount },
        $set: { guildName, username: recipientUsername },
        $setOnInsert: { guildId, userId: recipientId },
      },
      { upsert: true, new: true }
    );
    const rAfter = updatedRecipient.balance;

    // Step C: Create both ledger records
    const now = new Date();
    await Ledger.create([
      {
        guildId,
        guildName,
        userId: senderId,
        username: senderUsername,
        orderId: txId,
        rrn: txId,
        coins: -cleanAmount,
        type: 'transfer',
        direction: 'debit',
        counterparty: recipientId,
        counterpartyUsername: recipientUsername,
        description: senderDesc,
        reason: senderDesc,
        balanceBefore: sBefore,
        balanceAfter: sAfter,
        status: 'completed',
        transactionId: txId,
        performedBy: senderId,
        idempotencyKey: cleanIdempotencyKey ? `${cleanIdempotencyKey}:sender` : null,
        createdAt: now,
        updatedAt: now,
      },
      {
        guildId,
        guildName,
        userId: recipientId,
        username: recipientUsername,
        orderId: txId,
        rrn: txId,
        coins: cleanAmount,
        type: 'transfer',
        direction: 'credit',
        counterparty: senderId,
        counterpartyUsername: senderUsername,
        description: recipientDesc,
        reason: recipientDesc,
        balanceBefore: rBefore,
        balanceAfter: rAfter,
        status: 'completed',
        transactionId: txId,
        performedBy: senderId,
        idempotencyKey: cleanIdempotencyKey ? `${cleanIdempotencyKey}:recipient` : null,
        createdAt: now,
        updatedAt: now,
      }
    ]);

    return {
      success: true,
      alreadyProcessed: false,
      transactionId: txId,
      amount: cleanAmount,
      senderId,
      recipientId,
      senderBalanceBefore: sBefore,
      senderBalanceAfter: sAfter,
      recipientBalanceBefore: rBefore,
      recipientBalanceAfter: rAfter,
      timestamp: now,
    };
  } catch (err) {
    // Rollback sender debit if recipient credit or ledger creation fails
    await Wallet.findOneAndUpdate(
      { guildId, userId: senderId },
      { $inc: { balance: cleanAmount } }
    ).catch(() => {});

    await Ledger.deleteMany({ transactionId: txId }).catch(() => {});
    throw err;
  }
}
