import {
  SlashCommandBuilder,
  EmbedBuilder,
  MessageFlags,
} from 'discord.js';
import { executeTransfer } from '../../services/transfer.js';
import { Wallet } from '../../models.js';
import {
  formatCoins,
  coinIcon,
  coinName,
  C,
  err,
} from '../../utils/common.js';

export const data = new SlashCommandBuilder()
  .setName('transfer')
  .setDescription('Transfer coins to another member')
  .addUserOption(o =>
    o
      .setName('user')
      .setDescription('Recipient member mention or Discord user ID')
      .setRequired(true)
  )
  .addIntegerOption(o =>
    o
      .setName('amount')
      .setDescription('Coin amount to transfer')
      .setRequired(true)
      .setMinValue(1)
  );

// In-flight mutex locks per sender user ID to prevent concurrent double-spending
const activeTransfers = new Set();

// Cooldown map: userId -> lastTransferTimestamp
const cooldowns = new Map();
const COOLDOWN_MS = 5000;

export async function execute(interaction) {
  const sender = interaction.user;
  const senderId = sender.id;
  const guildId = interaction.guildId || 'DM';
  const guildName = interaction.guild?.name || 'Direct Message';
  const amount = interaction.options.getInteger('amount');

  // ─── 1. Rate Limiting / Cooldown Check ──────────────────────────────────────
  const now = Date.now();
  const lastTime = cooldowns.get(senderId);
  if (lastTime && now - lastTime < COOLDOWN_MS) {
    const remainingSec = Math.ceil((COOLDOWN_MS - (now - lastTime)) / 1000);
    return interaction.reply({
      embeds: [
        err(
          'Please Slow Down',
          `You must wait **${remainingSec}s** before initiating another transfer.`
        )
      ],
      flags: MessageFlags.Ephemeral,
    });
  }

  // ─── 2. In-Flight Transfer Lock Check ───────────────────────────────────────
  if (activeTransfers.has(senderId)) {
    return interaction.reply({
      embeds: [
        err(
          'Transfer in Progress',
          'A coin transfer is already currently being processed for your account. Please wait a moment.'
        )
      ],
      flags: MessageFlags.Ephemeral,
    });
  }

  // ─── 3. Resolve Recipient (Mentions & Raw IDs) ──────────────────────────────
  let recipient = interaction.options.getUser('user');
  if (!recipient) {
    const rawVal = interaction.options.get('user')?.value;
    if (rawVal) {
      recipient = await interaction.client.users.fetch(rawVal).catch(() => null);
    }
  }

  if (!recipient) {
    return interaction.reply({
      embeds: [
        err(
          'User Not Found',
          'Could not find a valid Discord user with the supplied mention or ID. Please check and try again.'
        )
      ],
      flags: MessageFlags.Ephemeral,
    });
  }

  // ─── 4. Transfer Parameter Validations ──────────────────────────────────────
  if (sender.bot) {
    return interaction.reply({
      embeds: [err('Invalid Sender', 'Discord bots are not permitted to transfer coins.')],
      flags: MessageFlags.Ephemeral,
    });
  }

  if (recipient.bot) {
    return interaction.reply({
      embeds: [
        err(
          'Invalid Recipient',
          'You cannot transfer coins to a bot. Please select a human member.'
        )
      ],
      flags: MessageFlags.Ephemeral,
    });
  }

  if (recipient.id === senderId) {
    return interaction.reply({
      embeds: [
        err(
          'Invalid Transfer',
          'You cannot transfer coins to yourself.'
        )
      ],
      flags: MessageFlags.Ephemeral,
    });
  }

  if (!Number.isInteger(amount) || amount <= 0) {
    return interaction.reply({
      embeds: [
        err(
          'Invalid Amount',
          'Transfer amount must be a positive whole number greater than 0.'
        )
      ],
      flags: MessageFlags.Ephemeral,
    });
  }

  // ─── 5. Wallet Balance Pre-Check ───────────────────────────────────────────
  const currentWallet = await Wallet.findOne({ guildId, userId: senderId }).lean();
  const currentBalance = currentWallet?.balance || 0;
  if (currentBalance < amount) {
    return interaction.reply({
      embeds: [
        err(
          'Insufficient Balance',
          `You only have **${formatCoins(currentBalance)}** on this server, which is not enough to transfer **${formatCoins(amount)}**.\n\n` +
          `• Check your balance: \`/wallet\`\n` +
          `• Top up ${coinName()}: \`/buycoin\``
        )
      ],
      flags: MessageFlags.Ephemeral,
    });
  }

  // ─── 6. Execute Transfer Atomically ─────────────────────────────────────────
  activeTransfers.add(senderId);
  try {
    // Acknowledge interaction publicly before running database transaction
    await interaction.deferReply();

    const result = await executeTransfer({
      guildId,
      guildName,
      senderUser: sender,
      recipientUser: recipient,
      amount,
      idempotencyKey: interaction.id,
    });

    cooldowns.set(senderId, Date.now());

    // ─── 7. Professional Ventrix-Themed Success Embed ─────────────────────────
    const embed = new EmbedBuilder()
      .setColor(C.success)
      .setTitle(`💸  Transfer Completed Successfully`)
      .setDescription(
        `Successfully transferred **${formatCoins(result.amount)}** from <@${senderId}> to <@${recipient.id}>.`
      )
      .addFields(
        { name: '📤 Sender',            value: `<@${senderId}>`,                                inline: true },
        { name: '📥 Recipient',         value: `<@${recipient.id}>`,                             inline: true },
        { name: `${coinIcon()} Amount`, value: `**${formatCoins(result.amount)}**`,             inline: true },
        { name: '👛 Sender Remaining', value: `**${formatCoins(result.senderBalanceAfter)}**`,  inline: true },
        { name: '💰 Recipient Updated', value: `**${formatCoins(result.recipientBalanceAfter)}**`, inline: true },
        { name: '🔖 Transaction ID',    value: `\`${result.transactionId}\``,                   inline: true },
      );

    return interaction.editReply({ embeds: [embed] });
  } catch (error) {
    if (error.message?.startsWith('INSUFFICIENT_FUNDS')) {
      const parts = error.message.split(':');
      const bal = Number(parts[1]) || 0;
      const failEmbed = err(
        'Insufficient Balance',
        `Your coin balance changed before the transaction completed. You only have **${formatCoins(bal)}** available.`
      );
      if (interaction.deferred) {
        return interaction.editReply({ embeds: [failEmbed] });
      }
      return interaction.reply({ embeds: [failEmbed], flags: MessageFlags.Ephemeral });
    }

    console.error(`[TRANSFER_ERROR] From ${senderId} to ${recipient?.id}:`, error);
    const genericErr = err(
      'Transfer Failed',
      'An unexpected database error occurred while processing the coin transfer. No coins were deducted.'
    );

    if (interaction.deferred) {
      return interaction.editReply({ embeds: [genericErr] });
    }
    return interaction.reply({ embeds: [genericErr], flags: MessageFlags.Ephemeral });
  } finally {
    activeTransfers.delete(senderId);
  }
}

