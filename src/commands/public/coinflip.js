 import crypto from 'node:crypto';
import { SlashCommandBuilder, MessageFlags } from 'discord.js';
import { Wallet, Ledger, GameHistory } from '../../models.js';
import { getGameSettings } from '../../services/gaming.js';
import { coinIcon, coinName } from '../../utils/common.js';
import {
  formatSpinningMessage,
  formatWinMessage,
  formatLoseMessage,
  getCoinflipEmoji
} from '../../games/coinflip/coinflip-ui.js';

export const data = new SlashCommandBuilder()
  .setName('coinflip')
  .setDescription('Flip a 3D golden coin for a 2x payout (Heads or Tails)')
  .addIntegerOption(option =>
    option
      .setName('bet')
      .setDescription('Amount of coins to bet')
      .setRequired(true)
      .setMinValue(1)
      .setMaxValue(1000000)
  )
  .addStringOption(option =>
    option
      .setName('choice')
      .setDescription('Predict Heads or Tails')
      .setRequired(true)
      .addChoices(
        { name: '🪙 Heads', value: 'heads' },
        { name: '🪙 Tails', value: 'tails' }
      )
  );

// In-memory concurrency lock to prevent multiple simultaneous games per user
const activeCoinflips = new Set();
export const cooldowns = new Map();
export const COOLDOWN_MS = 10000; // 10 seconds rate limit per user
const sleep = ms => new Promise(r => setTimeout(r, ms));

export async function execute(interaction) {
  if (!interaction.guild) {
    return interaction.reply({
      content: '❌ Use `/coinflip` inside a Discord server.',
      flags: MessageFlags.Ephemeral
    });
  }

  const bet = interaction.options.getInteger('bet', true);
  const choice = interaction.options.getString('choice', true).toLowerCase();

  const lockKey = `${interaction.guildId}::${interaction.user.id}`;

  // 10-Second Cooldown / Rate Limit Check
  const now = Date.now();
  const lastFlip = cooldowns.get(lockKey);
  if (lastFlip && (now - lastFlip < COOLDOWN_MS)) {
    const remainingSec = Math.ceil((COOLDOWN_MS - (now - lastFlip)) / 1000);
    return interaction.reply({
      content: `⏳ **Please slow down!** Coinflip has a **10s** cooldown.\nYou can flip again in **${remainingSec}s**.`,
      flags: MessageFlags.Ephemeral
    });
  }

  if (activeCoinflips.has(lockKey)) {
    return interaction.reply({
      content: '⚠️ You already have a coinflip in progress! Please wait for it to land.',
      flags: MessageFlags.Ephemeral
    });
  }
  activeCoinflips.add(lockKey);

  // Immediately defer the interaction to Discord (<20ms).
  // This satisfies Discord's 3-second timeout requirement and completely eliminates DiscordAPIError[10062]: Unknown interaction.
  try {
    await interaction.deferReply();
  } catch (deferErr) {
    activeCoinflips.delete(lockKey);
    if (deferErr?.code === 10062) return;
    throw deferErr;
  }

  let betDeducted = false;
  let outcomeSettled = false;

  try {
    // 1. Verify Server Gaming Settings
    const settings = await getGameSettings(interaction.guildId);
    if (settings.disabledGames?.includes('coinflip')) {
      return interaction.editReply({
        content: '❌ **Coinflip** is currently disabled by this server\'s administration.'
      });
    }
    if (!settings.bettingEnabled) {
      return interaction.editReply({
        content: '❌ Betting is currently disabled in this server.'
      });
    }
    if (bet < settings.minBet || bet > settings.maxBet) {
      return interaction.editReply({
        content: `❌ Your bet must be between **${settings.minBet.toLocaleString()}** and **${settings.maxBet.toLocaleString()}** ${coinIcon()}.`
      });
    }

    const playerName = interaction.user.displayName || interaction.user.username;

    // 2. Atomic Balance Check & Deduction
    const wallet = await Wallet.findOneAndUpdate(
      { guildId: interaction.guildId, userId: interaction.user.id, balance: { $gte: bet } },
      {
        $inc: { balance: -bet, totalSpent: bet, gamesPlayed: 1 },
        $set: { guildName: interaction.guild.name, username: playerName }
      },
      { new: true }
    );

    if (!wallet) {
      return interaction.editReply({
        content: `❌ You don't have enough ${coinName()} for that bet. Check your balance with \`/wallet\` or top up with \`/buycoin\`.`
      });
    }

    betDeducted = true;
    cooldowns.set(lockKey, Date.now());
    setTimeout(() => {
      if (cooldowns.get(lockKey) && (Date.now() - cooldowns.get(lockKey) >= COOLDOWN_MS)) {
        cooldowns.delete(lockKey);
      }
    }, COOLDOWN_MS);

    // 3. Send Initial Spinning Message (Instantly clears "thinking..." with custom animated spin emoji)
    await interaction.editReply({
      content: formatSpinningMessage(playerName, bet, choice, 'flipping', getCoinflipEmoji('spin'))
    });

    // 4. Record Bet in Transaction Ledger
    const flipId = `FLIP-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
    const txBetId = `TX-BET-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
    await Ledger.create({
      guildId: interaction.guildId,
      guildName: interaction.guild.name,
      userId: interaction.user.id,
      username: playerName,
      orderId: flipId,
      rrn: txBetId,
      coins: -bet,
      type: 'game_bet',
      direction: 'debit',
      description: `Coinflip bet on ${choice.toUpperCase()}: ${bet.toLocaleString()} coins`,
      balanceBefore: wallet.balance + bet,
      balanceAfter: wallet.balance,
      transactionId: txBetId,
      performedBy: interaction.user.id
    }).catch(err => console.error('[COINFLIP] Ledger bet error:', err));

    // 5. Cryptographically Secure 50/50 Random Coin Flip
    const outcome = crypto.randomInt(0, 2) === 0 ? 'heads' : 'tails';
    const won = outcome === choice;

    // Fast, responsive suspense delay (750ms) while animated coin is spinning mid-air.
    // By using a single clean outcome edit, we completely eliminate Discord's message-edit rate limits (429)!
    await sleep(750);

    // 6. Settle Game Outcome & Payout
    if (won) {
      const payout = bet * 2;
      const txWinId = `TX-WIN-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

      // Credit 2x total payout to wallet
      const updatedWallet = await Wallet.findOneAndUpdate(
        { guildId: interaction.guildId, userId: interaction.user.id },
        {
          $inc: { balance: payout, totalEarned: payout, wins: 1, xp: 15 },
          $set: { guildName: interaction.guild.name, username: playerName }
        },
        { new: true }
      );

      // Level check
      const newLevel = Math.floor(((updatedWallet?.xp || 0)) / 250) + 1;
      if (updatedWallet && updatedWallet.level !== newLevel) {
        updatedWallet.level = newLevel;
        await updatedWallet.save().catch(() => {});
      }

      // Record payout in Ledger
      await Ledger.create({
        guildId: interaction.guildId,
        guildName: interaction.guild.name,
        userId: interaction.user.id,
        username: playerName,
        orderId: flipId,
        rrn: txWinId,
        coins: payout,
        type: 'game_payout',
        direction: 'credit',
        description: `Coinflip WIN on ${outcome.toUpperCase()}: +${payout.toLocaleString()} coins`,
        balanceBefore: (updatedWallet?.balance ?? 0) - payout,
        balanceAfter: updatedWallet?.balance ?? 0,
        transactionId: txWinId,
        performedBy: interaction.user.id
      }).catch(err => console.error('[COINFLIP] Ledger win error:', err));

      // Record in GameHistory
      await GameHistory.create({
        guildId: interaction.guildId,
        userId: interaction.user.id,
        game: 'coinflip',
        bet,
        payout,
        net: bet,
        won: true,
        score: 1,
        description: `Coinflip: Picked ${choice.toUpperCase()} vs ${outcome.toUpperCase()} — Won 2x!`,
        sessionId: flipId,
        txId: txWinId
      }).catch(err => console.error('[COINFLIP] History error:', err));

      outcomeSettled = true;

      // Edit reply to show winning result (Stops and lands on outcome)
      return interaction.editReply({
        content: formatWinMessage(playerName, bet, choice, outcome, payout)
      }).catch(() => {});
    } else {
      // User lost: record loss and XP
      const updatedWallet = await Wallet.findOneAndUpdate(
        { guildId: interaction.guildId, userId: interaction.user.id },
        {
          $inc: { losses: 1, xp: 5 },
          $set: { guildName: interaction.guild.name, username: playerName }
        },
        { new: true }
      );

      // Record in GameHistory
      await GameHistory.create({
        guildId: interaction.guildId,
        userId: interaction.user.id,
        game: 'coinflip',
        bet,
        payout: 0,
        net: -bet,
        won: false,
        score: 0,
        description: `Coinflip: Picked ${choice.toUpperCase()} vs ${outcome.toUpperCase()} — Lost`,
        sessionId: flipId,
        txId: txBetId
      }).catch(err => console.error('[COINFLIP] History error:', err));

      outcomeSettled = true;

      // Edit reply to show losing result (Stops and lands on outcome)
      return interaction.editReply({
        content: formatLoseMessage(playerName, bet, choice, outcome)
      }).catch(() => {});
    }
  } catch (error) {
    console.error('[COINFLIP ERROR]', error);

    // Automatic safety refund if bet was deducted but flip threw an error before completing
    if (betDeducted && !outcomeSettled) {
      cooldowns.delete(lockKey);
      await Wallet.findOneAndUpdate(
        { guildId: interaction.guildId, userId: interaction.user.id },
        { $inc: { balance: bet, totalSpent: -bet, gamesPlayed: -1 } }
      ).catch(() => {});
    }

    const msg = '❌ An error occurred during your coinflip. Please try again.';
    if (interaction.deferred || interaction.replied) {
      return interaction.editReply({ content: msg }).catch(() => {});
    }
    return interaction.reply({ content: msg, flags: MessageFlags.Ephemeral }).catch(() => {});
  } finally {
    activeCoinflips.delete(lockKey);
  }
}

