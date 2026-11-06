import crypto from 'node:crypto';
import {
  SlashCommandBuilder,
  MessageFlags,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder
} from 'discord.js';
import { Wallet, Ledger, GameHistory } from '../../models.js';
import { getGameSettings } from '../../services/gaming.js';
import { formatCoins, coinIcon, coinName } from '../../utils/common.js';
import {
  getMultiplier,
  formatStartMessage,
  formatHintMessage,
  formatWinMessage,
  formatLoseMessage,
  buildGuessButton
} from '../../games/guess/guess-ui.js';

export const data = new SlashCommandBuilder()
  .setName('guess')
  .setDescription('Guess the mystery number between 1 and 100 within 5 attempts for VCoin prizes!')
  .addIntegerOption(option =>
    option
      .setName('bet')
      .setDescription('Amount of VCoins to bet (optional, default: 10)')
      .setRequired(false)
      .setMinValue(1)
      .setMaxValue(1000000)
  );

// In-memory active game sessions
export const activeSessions = new Map(); // sessionId -> sessionData
const userToSession = new Map(); // `${guildId}::${userId}` -> sessionId

export async function execute(interaction) {
  if (!interaction.guild) {
    return interaction.reply({
      content: '❌ Use `/guess` inside a Discord server.',
      flags: MessageFlags.Ephemeral
    });
  }

  const userKey = `${interaction.guildId}::${interaction.user.id}`;
  if (userToSession.has(userKey)) {
    return interaction.reply({
      content: '⚠️ You already have an active Mystery Guess game! Click **💬 Type Your Answer** on your current message to continue.',
      flags: MessageFlags.Ephemeral
    });
  }

  const bet = interaction.options.getInteger('bet') || 10;

  // 1. Check Server Gaming Settings
  const settings = await getGameSettings(interaction.guildId);
  if (settings.disabledGames?.includes('guess')) {
    return interaction.reply({
      content: '❌ **Number Guess** is currently disabled by this server\'s administration.',
      flags: MessageFlags.Ephemeral
    });
  }
  if (!settings.bettingEnabled) {
    return interaction.reply({
      content: '❌ Betting is currently disabled in this server.',
      flags: MessageFlags.Ephemeral
    });
  }
  if (bet < settings.minBet || bet > settings.maxBet) {
    return interaction.reply({
      content: `❌ Your bet must be between **${settings.minBet.toLocaleString()}** and **${settings.maxBet.toLocaleString()}** ${coinIcon()}.`,
      flags: MessageFlags.Ephemeral
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
    return interaction.reply({
      content: `❌ You don't have enough ${coinName()} for that bet (${formatCoins(bet)} required). Check your balance with \`/wallet\`.`,
      flags: MessageFlags.Ephemeral
    });
  }

  // 3. Record Bet in Transaction Ledger
  const gameId = `GUESS-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
  const txBetId = `TX-BET-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
  await Ledger.create({
    guildId: interaction.guildId,
    guildName: interaction.guild.name,
    userId: interaction.user.id,
    username: playerName,
    orderId: gameId,
    rrn: txBetId,
    coins: -bet,
    type: 'game_bet',
    direction: 'debit',
    description: `Number Guess Bet: ${bet.toLocaleString()} ${coinName()}`,
    balanceBefore: wallet.balance + bet,
    balanceAfter: wallet.balance,
    transactionId: txBetId,
    performedBy: interaction.user.id
  }).catch(err => console.error('[GUESS] Ledger bet error:', err));

  // 4. Create Game Session
  const sessionId = crypto.randomBytes(4).toString('hex');
  const secretNumber = crypto.randomInt(1, 101); // 1 to 100 inclusive
  const maxAttempts = 5;

  const session = {
    sessionId,
    userKey,
    guildId: interaction.guildId,
    channelId: interaction.channelId,
    userId: interaction.user.id,
    playerName,
    bet,
    gameId,
    txBetId,
    secretNumber,
    maxAttempts,
    attemptsTaken: 0,
    walletBefore: wallet.balance,
    collector: null,
    isGameOver: false
  };

  activeSessions.set(sessionId, session);
  userToSession.set(userKey, sessionId);

  // 5. Send Initial Start Message with "Type Your Answer" Button
  const startContent = formatStartMessage(playerName, maxAttempts, bet);
  const actionRow = buildGuessButton(sessionId);

  await interaction.reply({
    content: startContent,
    components: [actionRow]
  });

  // 6. Optional Message Collector (works if bot is mentioned e.g. @Bot 60, without needing privileged intent)
  const channel = interaction.channel;
  if (channel?.createMessageCollector) {
    const collector = channel.createMessageCollector({
      filter: m => m.author.id === interaction.user.id,
      time: 120000
    });

    session.collector = collector;

    collector.on('collect', async m => {
      if (session.isGameOver) return;
      const clean = m.content.replace(/<@!?\d+>/g, '').trim();
      const parsed = parseInt(clean, 10);
      if (Number.isNaN(parsed) || parsed < 1 || parsed > 100) return;

      await handleGuessAttempt(session, parsed, channel);
    });

    collector.on('end', (_, reason) => {
      if (!session.isGameOver && reason === 'time') {
        cleanupSession(session);
        channel.send({
          content: `⌛ **${playerName}**, your mystery guess session timed out.`
        }).catch(() => {});
      }
    });
  }
}

/**
 * Handles Button clicks and Modal Submissions (100% immune to Message Content Intent restrictions)
 */
export async function component(interaction) {
  // A. Button Click -> Open Modal
  if (interaction.isButton() && interaction.customId.startsWith('guess_btn_')) {
    const sessionId = interaction.customId.replace('guess_btn_', '');
    const session = activeSessions.get(sessionId);

    if (!session || session.isGameOver) {
      return interaction.reply({
        content: '⌛ This game session has ended. Start a new one with `/guess`.',
        flags: MessageFlags.Ephemeral
      });
    }

    if (interaction.user.id !== session.userId) {
      return interaction.reply({
        content: '❌ This is not your game session. Start your own with `/guess`!',
        flags: MessageFlags.Ephemeral
      });
    }

    const modal = new ModalBuilder()
      .setCustomId(`guess_modal_${sessionId}`)
      .setTitle('Mystery Number Machine');

    const numberInput = new TextInputBuilder()
      .setCustomId('guess_input_num')
      .setLabel('Your Answer (Number between 1 and 100)')
      .setStyle(TextInputStyle.Short)
      .setPlaceholder('e.g. 60')
      .setRequired(true)
      .setMinLength(1)
      .setMaxLength(3);

    modal.addComponents(new ActionRowBuilder().addComponents(numberInput));
    return interaction.showModal(modal);
  }

  // B. Modal Submit -> Process Guess
  if (interaction.isModalSubmit() && interaction.customId.startsWith('guess_modal_')) {
    const sessionId = interaction.customId.replace('guess_modal_', '');
    const session = activeSessions.get(sessionId);

    if (!session || session.isGameOver) {
      return interaction.reply({
        content: '⌛ This game session has ended. Start a new one with `/guess`.',
        flags: MessageFlags.Ephemeral
      });
    }

    const raw = interaction.fields.getTextInputValue('guess_input_num').trim();
    const num = parseInt(raw, 10);

    if (Number.isNaN(num) || num < 1 || num > 100) {
      return interaction.reply({
        content: '⚠️ Please enter a valid number between **1 and 100**.',
        flags: MessageFlags.Ephemeral
      });
    }

    await handleGuessAttempt(session, num, interaction.channel, interaction);
  }
}

/**
 * Shared guess resolution logic
 */
async function handleGuessAttempt(session, num, channel, modalInteraction = null) {
  if (session.isGameOver) return;

  session.attemptsTaken += 1;
  const attemptsLeft = session.maxAttempts - session.attemptsTaken;

  if (num === session.secretNumber) {
    // ─── WINNER ───
    session.isGameOver = true;
    cleanupSession(session);

    const multiplier = getMultiplier(session.attemptsTaken);
    const payout = Math.floor(session.bet * multiplier);
    const txWinId = `TX-WIN-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

    // Credit wallet
    const updatedWallet = await Wallet.findOneAndUpdate(
      { guildId: session.guildId, userId: session.userId },
      {
        $inc: { balance: payout, totalEarned: payout, wins: 1, xp: 25 },
        $set: { username: session.playerName }
      },
      { new: true }
    );

    // Ledger record
    await Ledger.create({
      guildId: session.guildId,
      userId: session.userId,
      username: session.playerName,
      orderId: session.gameId,
      rrn: txWinId,
      coins: payout,
      type: 'game_payout',
      direction: 'credit',
      description: `Number Guess WIN (Attempt #${session.attemptsTaken}): +${payout.toLocaleString()} ${coinName()}`,
      balanceBefore: (updatedWallet?.balance ?? 0) - payout,
      balanceAfter: updatedWallet?.balance ?? 0,
      transactionId: txWinId,
      performedBy: session.userId
    }).catch(err => console.error('[GUESS] Ledger win error:', err));

    // GameHistory record
    await GameHistory.create({
      guildId: session.guildId,
      userId: session.userId,
      game: 'guess',
      bet: session.bet,
      payout,
      net: payout - session.bet,
      won: true,
      score: session.attemptsTaken,
      description: `Number Guess: Solved ${session.secretNumber} in ${session.attemptsTaken} attempt(s) — Won ${multiplier}x!`,
      sessionId: session.gameId,
      txId: txWinId
    }).catch(err => console.error('[GUESS] History win error:', err));

    const winMsg = formatWinMessage(
      session.playerName,
      session.secretNumber,
      session.attemptsTaken,
      payout,
      multiplier,
      updatedWallet?.balance ?? (session.walletBefore + payout)
    );

    if (modalInteraction) {
      await modalInteraction.reply({ content: winMsg }).catch(() => {});
    } else if (channel) {
      await channel.send({ content: winMsg }).catch(() => {});
    }
    return;
  }

  // ─── INCORRECT GUESS ───
  const hint = num > session.secretNumber ? 'less' : 'greater';

  if (attemptsLeft <= 0) {
    // ─── OUT OF ATTEMPTS (LOSE) ───
    session.isGameOver = true;
    cleanupSession(session);

    const updatedWallet = await Wallet.findOneAndUpdate(
      { guildId: session.guildId, userId: session.userId },
      {
        $inc: { losses: 1, xp: 5 },
        $set: { username: session.playerName }
      },
      { new: true }
    );

    await GameHistory.create({
      guildId: session.guildId,
      userId: session.userId,
      game: 'guess',
      bet: session.bet,
      payout: 0,
      net: -session.bet,
      won: false,
      score: 0,
      description: `Number Guess: Ran out of attempts. Secret was ${session.secretNumber}`,
      sessionId: session.gameId,
      txId: session.txBetId
    }).catch(err => console.error('[GUESS] History lose error:', err));

    const loseMsg = formatLoseMessage(
      session.playerName,
      session.secretNumber,
      session.bet,
      updatedWallet?.balance ?? session.walletBefore
    );

    if (modalInteraction) {
      await modalInteraction.reply({ content: loseMsg }).catch(() => {});
    } else if (channel) {
      await channel.send({ content: loseMsg }).catch(() => {});
    }
    return;
  }

  // ─── HINT MESSAGE WITH NEXT GUESS BUTTON ───
  const hintMsg = formatHintMessage(session.playerName, hint, num, attemptsLeft);
  const actionRow = buildGuessButton(session.sessionId);

  if (modalInteraction) {
    await modalInteraction.reply({
      content: hintMsg,
      components: [actionRow]
    }).catch(() => {});
  } else if (channel) {
    await channel.send({
      content: hintMsg,
      components: [actionRow]
    }).catch(() => {});
  }
}

function cleanupSession(session) {
  if (session.collector) {
    session.collector.stop('ended');
  }
  activeSessions.delete(session.sessionId);
  userToSession.delete(session.userKey);
}
