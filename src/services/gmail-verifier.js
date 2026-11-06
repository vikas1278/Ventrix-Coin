import { google } from 'googleapis';
import { Order, Payment } from '../models.js';
import { creditVerifiedPayment } from './credit.js';
import { money, formatCoins, coinName, escapeText } from '../utils/common.js';

function gmailClient() {
  const oauth = new google.auth.OAuth2(
    process.env.GMAIL_CLIENT_ID,
    process.env.GMAIL_CLIENT_SECRET,
    process.env.GMAIL_REDIRECT_URI
  );
  oauth.setCredentials({ refresh_token: process.env.GMAIL_REFRESH_TOKEN });
  return google.gmail({ version: 'v1', auth: oauth });
}

function decodePart(data = '') {
  return Buffer.from(data.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8');
}

function collectBody(payload) {
  let out = '';
  if (payload?.body?.data) out += decodePart(payload.body.data) + '\n';
  for (const part of payload?.parts || []) out += collectBody(part) + '\n';
  return out;
}

function header(headers, name) {
  return headers?.find(h => h.name?.toLowerCase() === name.toLowerCase())?.value || '';
}

function extractEmail(fromHeader = '') {
  return (fromHeader.match(/<([^>]+)>/)?.[1] || fromHeader).trim().toLowerCase();
}

/**
 * Extracts payment metadata from a Slice payment notification email.
 * Supports standard Slice incoming transaction formats.
 */
export function parseSliceEmail(body = '', subject = '') {
  const combined = `${subject}\n${body}`;
  const flat = combined
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&#8377;|& #8377;/gi, '₹')
    .replace(/\s+/g, ' ');

  // Amount pattern (e.g. "received ₹100.00 via UPI" or "received 100 in your slice bank account")
  const amountMatch =
    flat.match(/received\s*₹?\s*([\d,]+(?:\.\d{1,2})?)\s*(?:via\s+UPI|in your slice bank account)/i) ||
    flat.match(/received\s*₹?\s*([\d,]+(?:\.\d{1,2})?)/i);

  // RRN (Bank Reference / UTR numeric string)
  const rrnMatch =
    flat.match(/\bRRN\s*[:\-]?\s*(\d{8,20})\b/i) ||
    flat.match(/\bUTR\s*[:\-]?\s*(\d{8,20})\b/i);

  // Transaction Date
  const dateMatch = flat.match(/Transaction date\s*[:\-]?\s*(\d{1,2}[-\s][A-Za-z]{3}[-\s]\d{2,4})/i);

  // Sender Name
  const fromMatch = flat.match(/\bFrom\s*[:\-]?\s*([A-Z0-9 .,&'-]{3,100}?)(?=\s+RRN\b|\s+UTR\b|\s+Transaction date\b|$)/i);

  // Optional Order ID reference in transaction note / text (e.g. "GS-ABCDE-123456")
  const orderIdMatch = flat.match(/\b(GS-[A-Z0-9]+-[A-Z0-9]+)\b/i);

  if (!amountMatch || !rrnMatch) return null;

  const amount = Number(amountMatch[1].replace(/,/g, ''));
  if (!Number.isFinite(amount) || amount <= 0) return null;

  let transactionDate = null;
  if (dateMatch) {
    const d = new Date(dateMatch[1].replace(/(\d{1,2})[-\s]([A-Za-z]{3})[-\s](\d{2,4})/, '$1 $2 $3'));
    if (!Number.isNaN(d.getTime())) transactionDate = d;
  }

  return {
    amountPaise: Math.round(amount * 100),
    rrn: rrnMatch[1],
    transactionDate,
    senderName: fromMatch?.[1]?.trim() || '',
    orderIdRef: orderIdMatch?.[1]?.toUpperCase() || null,
    snippet: flat.slice(0, 500),
  };
}

/**
 * Polls Gmail for incoming payment emails, matches them against pending orders,
 * and credits verified funds to user wallets safely.
 */
export async function pollGmailOnce(client = gmailClient(), discordClient = null) {
  const allowedSender = (process.env.SLICE_ALLOWED_SENDER || '').trim().toLowerCase();
  if (!allowedSender || allowedSender === 'notifications@example.com') {
    throw new Error('Set SLICE_ALLOWED_SENDER to the exact verified sender address from your genuine Slice payment email.');
  }

  const q = `from:${allowedSender} newer_than:7d ${process.env.GMAIL_QUERY_EXTRA || ''}`.trim();
  const listed = await client.users.messages.list({ userId: 'me', q, maxResults: 50 });
  let processed = 0;

  for (const item of listed.data.messages || []) {
    const { data: msg } = await client.users.messages.get({ userId: 'me', id: item.id, format: 'full' });
    const headers = msg.payload?.headers || [];
    const fromHeader = header(headers, 'From');
    const subject = header(headers, 'Subject');
    const from = extractEmail(fromHeader);
    const authResults = `${header(headers, 'Authentication-Results')} ${header(headers, 'ARC-Authentication-Results')}`.toLowerCase();

    // Verify sender
    if (from !== allowedSender) continue;

    // Check SPF / DKIM verification pass
    if (!(authResults.includes('spf=pass') || authResults.includes('dkim=pass'))) {
      console.warn(`[GMAIL] Skipped message ${item.id}: no visible SPF/DKIM pass result.`);
      continue;
    }

    const bodyText = collectBody(msg.payload);
    const parsed = parseSliceEmail(bodyText, subject);
    if (!parsed) continue;

    // Idempotency: skip if this RRN or Gmail message ID is already registered
    const alreadyUsed = await Payment.findOne({
      $or: [{ rrn: parsed.rrn }, { gmailMessageId: item.id }]
    }).lean();
    if (alreadyUsed) continue;

    let targetOrder = null;

    // 1. Direct Order ID match if present in the payment note/email
    if (parsed.orderIdRef) {
      targetOrder = await Order.findOne({
        orderId: parsed.orderIdRef,
        status: { $in: ['pending', 'review'] },
        payablePaise: parsed.amountPaise,
      });
    }

    // 2. If no direct reference, match against pending orders with exact amount
    if (!targetOrder) {
      const candidates = await Order.find({
        status: 'pending',
        payablePaise: parsed.amountPaise,
      }).sort({ createdAt: 1 }).limit(2);

      if (candidates.length === 1) {
        targetOrder = candidates[0];
      } else if (candidates.length > 1) {
        // Ambiguous payment: multiple orders with exact same amount.
        // Move all to 'review' for admin manual verification.
        await Order.updateMany(
          { _id: { $in: candidates.map(o => o._id) } },
          { $set: { status: 'review', note: `Ambiguous: matched multiple orders for ${money(parsed.amountPaise)}` } }
        );

        console.warn(`[GMAIL] Amount ${money(parsed.amountPaise)} matches multiple pending orders; moved to review.`);

        if (discordClient) {
          for (const ord of candidates) {
            try {
              const discordUser = await discordClient.users.fetch(ord.userId);
              await discordUser.send({
                content:
                  `⚠️ **Payment Under Review**\n` +
                  `Your order \`${ord.orderId}\` for **${escapeText(ord.productName)}** (${money(ord.payablePaise)}) ` +
                  `could not be credited automatically because another pending order has the identical amount.\n` +
                  `An administrator will review and verify your payment using \`/approve-payment\` once confirmed.`
              });
            } catch (dmErr) {
              console.warn(`[GMAIL] Could not DM user ${ord.userId}: ${dmErr.message}`);
            }
          }
        }
        continue;
      }
    }

    if (!targetOrder) {
      // Check if there is an expired order for this amount that could be revived in review
      const expiredOrder = await Order.findOne({
        status: 'expired',
        payablePaise: parsed.amountPaise,
      }).sort({ createdAt: -1 });

      if (expiredOrder) {
        expiredOrder.status = 'review';
        expiredOrder.note = `Payment received after expiry. RRN: ${parsed.rrn}`;
        await expiredOrder.save();
        console.warn(`[GMAIL] Received payment for expired order ${expiredOrder.orderId}; moved to review.`);
      }
      continue;
    }

    const result = await creditVerifiedPayment({
      order: targetOrder,
      ...parsed,
      source: 'gmail',
      messageId: item.id,
    });

    if (result.startsWith('credited:')) {
      processed++;
      const newBalance = result.split(':')[1];
      console.log(`[GMAIL] Successfully credited order ${targetOrder.orderId} (${formatCoins(targetOrder.coins)}) to user ${targetOrder.userId}.`);

      // Notify the buyer via DM
      if (discordClient) {
        try {
          const discordUser = await discordClient.users.fetch(targetOrder.userId);
          if (discordUser) {
            await discordUser.send({
              content:
                `✅ **Payment Verified & ${coinName()} Credited!**\n` +
                `Order \`${targetOrder.orderId}\` of **${money(targetOrder.payablePaise)}** has been verified.\n` +
                `**+${formatCoins(targetOrder.coins)}** added to your wallet!\n` +
                `👛 New Balance: **${formatCoins(newBalance)}**.\n` +
                `Thank you for your purchase!`
            });
          }
        } catch (dmErr) {
          console.debug(`[GMAIL] User ${targetOrder.userId} DMs closed.`);
        }
      }
    } else {
      console.warn(`[GMAIL] Did not credit ${targetOrder.orderId}: ${result}`);
    }
  }

  return processed;
}

export function startGmailPolling(discordClient = null) {
  const seconds = Math.max(30, Number(process.env.GMAIL_POLL_SECONDS || 60));
  let running = false;
  const tick = async () => {
    if (running) return;
    running = true;
    try {
      await pollGmailOnce(gmailClient(), discordClient);
    } catch (err) {
      console.error('[GMAIL] Poll failed:', err.message);
    } finally {
      running = false;
    }
  };
  void tick();
  setInterval(tick, seconds * 1000);
}
