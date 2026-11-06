import crypto from 'node:crypto';
import { SlashCommandBuilder, MessageFlags } from 'discord.js';
import { Wallet, Ledger } from '../../models.js';
import { getGameSettings } from '../../services/gaming.js';
import { coinIcon, coinName, formatCoins } from '../../utils/common.js';
import { buildRpsStartEmbed, buildRpsButtons } from '../../games/rps/rps-ui.js';
import {
  activeSessions,
  userToSession,
  createRpsSession,
  settleRpsMove
} from '../../games/rps/rps-manager.js';

export const data = new SlashCommandBuilder()
  .setName('rps')
  .setDescription('Play Rock Paper Scissors against the bot for a 2x payout')
  .addIntegerOption(option =>
    option
      .setName('amount')
      .setDescription('Amount of coins to bet')
      .setRequired(true)
      .setMinValue(1)
      .setMaxValue(1000000)
  );

export async function execute(interaction) {
  if (!interaction.guild) {
    return interaction.reply({
      content: '❌ Use `/rps` inside a Discord server.',
      flags: MessageFlags.Ephemeral
    });
  }

  const userKey = `${interaction.guildId}::${interaction.user.id}`;
  if (userToSession.has(userKey)) {
    return interaction.reply({
      content: '⚠️ You already have an active RPS duel in progress! Please choose your move on your active game.',
      flags: MessageFlags.Ephemeral
    });
  }

  const amount = interaction.options.getInteger('amount', true);

  // 1. Verify Server Gaming Settings
  const settings = await getGameSettings(interaction.guildId);
  if (settings.disabledGames?.includes('rps')) {
    return interaction.reply({
      content: '❌ **Rock Paper Scissors** is currently disabled by this server\'s administration.',
      flags: MessageFlags.Ephemeral
    });
  }
  if (!settings.bettingEnabled) {
    return interaction.reply({
      content: '❌ Betting is currently disabled in this server.',
      flags: MessageFlags.Ephemeral
    });
  }
  if (amount < settings.minBet || amount > settings.maxBet) {
    return interaction.reply({
      content: `❌ Your bet must be between **${settings.minBet.toLocaleString()}** and **${settings.maxBet.toLocaleString()}** ${coinIcon()}.`,
      flags: MessageFlags.Ephemeral
    });
  }

  const playerName = interaction.user.displayName || interaction.user.username;
  const playerAvatar = interaction.user.displayAvatarURL({ extension: 'png', size: 128 });

  // 2. Atomic Balance Check & Bet Deduction
  const wallet = await Wallet.findOneAndUpdate(
    { guildId: interaction.guildId, userId: interaction.user.id, balance: { $gte: amount } },
    {
      $inc: { balance: -amount, totalSpent: amount, gamesPlayed: 1 },
      $set: { guildName: interaction.guild.name, username: playerName }
    },
    { new: true }
  );

  if (!wallet) {
    return interaction.reply({
      content: `❌ You don't have enough ${coinName()} for that bet (${formatCoins(amount)} required). Check your balance with \`/wallet\` or top up with \`/buycoin\`.`,
      flags: MessageFlags.Ephemeral
    });
  }

  // 3. Record Bet in Transaction Ledger
  const gameId = `RPS-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
  const txBetId = `TX-BET-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
  await Ledger.create({
    guildId: interaction.guildId,
    guildName: interaction.guild.name,
    userId: interaction.user.id,
    username: playerName,
    orderId: gameId,
    rrn: txBetId,
    coins: -amount,
    type: 'game_bet',
    direction: 'debit',
    description: `RPS bet: ${amount.toLocaleString()} coins`,
    balanceBefore: wallet.balance + amount,
    balanceAfter: wallet.balance,
    transactionId: txBetId,
    performedBy: interaction.user.id
  }).catch(err => console.error('[RPS] Ledger bet error:', err));

  // 4. Initial Game Embed and Action Row Buttons
  const startEmbed = buildRpsStartEmbed({
    playerName,
    playerAvatar,
    amount
  });

  // Temporarily generate sessionId to wire buttons before session record creation
  const tempSessionId = `RPS-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
  const buttonsRow = buildRpsButtons(tempSessionId, false);

  const response = await interaction.reply({
    embeds: [startEmbed],
    components: [buttonsRow],
    withResponse: true
  });
  const replyMessage = response?.resource?.message || (await interaction.fetchReply().catch(() => null));

  // 5. Register Active RPS Session with 30-Second Timeout
  const session = createRpsSession({
    guildId: interaction.guildId,
    guildName: interaction.guild.name,
    channelId: interaction.channelId,
    userId: interaction.user.id,
    playerName,
    playerAvatar,
    bet: amount,
    gameId,
    txBetId,
    client: interaction.client,
    replyMessage
  });

  // Remap temp session ID to actual session ID in activeSessions map
  activeSessions.delete(session.sessionId);
  session.sessionId = tempSessionId;
  activeSessions.set(tempSessionId, session);
  userToSession.set(userKey, tempSessionId);
}

/**
 * Handles Rock, Paper, Scissors Button Clicks
 */
export async function component(interaction) {
  if (!interaction.isButton() || !interaction.customId.startsWith('rps:')) return;

  const parts = interaction.customId.split(':');
  const move = parts[1];
  const sessionId = parts[2];

  const session = activeSessions.get(sessionId);

  // Validate session existence
  if (!session || session.isSettled) {
    return interaction.reply({
      content: '⌛ This RPS duel has already ended or expired. Start a new one with `/rps`.',
      flags: MessageFlags.Ephemeral
    }).catch(() => {});
  }

  // Security: Only game creator can select moves
  if (interaction.user.id !== session.userId) {
    return interaction.reply({
      content: '❌ This is not your RPS game! Start your own with `/rps`.',
      flags: MessageFlags.Ephemeral
    }).catch(() => {});
  }

  // Settle Move
  const result = await settleRpsMove(sessionId, move);
  if (result.error) {
    return interaction.reply({
      content: '⚠️ This RPS duel has already concluded.',
      flags: MessageFlags.Ephemeral
    }).catch(() => {});
  }

  // Update Game Message with Result Embed and Disabled Buttons
  return interaction.update({
    embeds: [result.resultEmbed],
    components: [result.disabledButtons]
  }).catch(() => {});
}

