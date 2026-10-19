import mongoose from 'mongoose';
import { Order, Payment, Wallet, Ledger } from '../models.js';

/**
 * Credits verified incoming UPI payment to user's wallet idempotently.
 * Uses MongoDB replica-set transactions when supported, with an atomic fallback
 * for standalone MongoDB instances to ensure safe execution in all environments.
 */
export async function creditVerifiedPayment({
  order,
  rrn,
  amountPaise,
  source,
  messageId = null,
  transactionDate = null,
  senderName = '',
  rawSnippet = '',
  verifiedBy = null,
}) {
  const cleanRrn = String(rrn).trim();

  // Pre-check for duplicate RRN before starting session
  const existingPayment = await Payment.findOne({ rrn: cleanRrn }).lean();
  if (existingPayment) {
    return 'duplicate-rrn';
  }

  // Pre-check order status and amount match
  const targetOrder = await Order.findOne({ orderId: order.orderId });
  if (!targetOrder) {
    return 'order-missing';
  }
  if (targetOrder.status === 'paid') {
    return 'order-already-paid';
  }
  if (targetOrder.status !== 'pending' && targetOrder.status !== 'review') {
    return 'order-not-payable';
  }
  if (targetOrder.payablePaise !== amountPaise) {
    return 'amount-mismatch';
  }

  // Attempt transactional execution
  let session = null;
  let useTransaction = true;
  try {
    session = await mongoose.startSession();
  } catch {
    useTransaction = false;
  }

  if (useTransaction && session) {
    try {
      let outcome = 'already-processed';
      await session.withTransaction(async () => {
        // Double-check within transaction
        const rrnConflict = await Payment.findOne({ rrn: cleanRrn }).session(session);
        if (rrnConflict) {
          outcome = 'duplicate-rrn';
          return;
        }

        const freshOrder = await Order.findOne({ orderId: order.orderId }).session(session);
        if (!freshOrder || freshOrder.status === 'paid') {
          outcome = 'order-already-paid';
          return;
        }
        if (freshOrder.status !== 'pending' && freshOrder.status !== 'review') {
          outcome = 'order-not-payable';
          return;
        }
        if (freshOrder.payablePaise !== amountPaise) {
          outcome = 'amount-mismatch';
          return;
        }

        const freshGuildId = freshOrder.guildId || 'DM';
        const paymentDoc = {
          rrn: cleanRrn,
          amountPaise,
          transactionDate,
          senderName: String(senderName).slice(0, 100),
          orderId: freshOrder.orderId,
          guildId: freshGuildId,
          rawSnippet: String(rawSnippet).slice(0, 500),
        };
        if (messageId) paymentDoc.gmailMessageId = messageId;

        await Payment.create([paymentDoc], { session });

        const wallet = await Wallet.findOneAndUpdate(
          { guildId: freshGuildId, userId: freshOrder.userId },
          {
            $inc: { balance: freshOrder.coins },
            $set: {
              ...(freshOrder.guildName ? { guildName: freshOrder.guildName } : {}),
              ...(freshOrder.username ? { username: freshOrder.username } : {}),
            },
            $setOnInsert: { guildId: freshGuildId, userId: freshOrder.userId },
          },
          { upsert: true, new: true, session }
        );

        await Ledger.create([{
          guildId: freshGuildId,
          guildName: freshOrder.guildName || '',
          userId: freshOrder.userId,
          username: freshOrder.username || '',
          orderId: freshOrder.orderId,
          rrn: cleanRrn,
          coins: freshOrder.coins,
          type: 'purchase_credit',
          reason: `UPI payment verified via ${source}`,
          performedBy: verifiedBy || source,
        }], { session });

        freshOrder.status = 'paid';
        freshOrder.paidAt = new Date();
        freshOrder.rrn = cleanRrn;
        freshOrder.verificationSource = source;
        freshOrder.verifiedBy = verifiedBy || (source === 'admin' ? 'admin' : 'gmail');
        await freshOrder.save({ session });

        outcome = `credited:${wallet.balance}`;
      });

      return outcome;
    } catch (txErr) {
      // If error indicates transactions are unsupported on this deployment, fall back gracefully
      const isReplicaSetError = txErr.message?.includes('replica set') ||
        txErr.message?.includes('Transaction numbers are only allowed');

      if (!isReplicaSetError) {
        throw txErr;
      }
      // Otherwise fallback to safe atomic sequence below
    } finally {
      await session.endSession().catch(() => {});
    }
  }

  // ─── Standalone Atomic Fallback (when replica-set is not available) ──────────
  try {
    const targetGuildId = targetOrder.guildId || 'DM';
    const paymentDoc = {
      rrn: cleanRrn,
      amountPaise,
      transactionDate,
      senderName: String(senderName).slice(0, 100),
      orderId: targetOrder.orderId,
      guildId: targetGuildId,
      rawSnippet: String(rawSnippet).slice(0, 500),
    };
    if (messageId) paymentDoc.gmailMessageId = messageId;

    // Unique index on rrn ensures idempotency here
    await Payment.create(paymentDoc);

    const updatedOrder = await Order.findOneAndUpdate(
      { orderId: targetOrder.orderId, status: { $in: ['pending', 'review'] }, payablePaise: amountPaise },
      {
        $set: {
          status: 'paid',
          paidAt: new Date(),
          rrn: cleanRrn,
          verificationSource: source,
          verifiedBy: verifiedBy || source,
        }
      },
      { new: true }
    );

    if (!updatedOrder) {
      return 'order-already-paid';
    }

    const wallet = await Wallet.findOneAndUpdate(
      { guildId: targetGuildId, userId: targetOrder.userId },
      {
        $inc: { balance: targetOrder.coins },
        $set: {
          ...(targetOrder.guildName ? { guildName: targetOrder.guildName } : {}),
          ...(targetOrder.username ? { username: targetOrder.username } : {}),
        },
        $setOnInsert: { guildId: targetGuildId, userId: targetOrder.userId },
      },
      { upsert: true, new: true }
    );

    await Ledger.create({
      guildId: targetGuildId,
      guildName: targetOrder.guildName || '',
      userId: targetOrder.userId,
      username: targetOrder.username || '',
      orderId: targetOrder.orderId,
      rrn: cleanRrn,
      coins: targetOrder.coins,
      type: 'purchase_credit',
      reason: `UPI payment verified via ${source} (standalone mode)`,
      performedBy: verifiedBy || source,
    });

    return `credited:${wallet.balance}`;
  } catch (err) {
    if (err.code === 11000) {
      return 'duplicate-rrn';
    }
    throw err;
  }
}
