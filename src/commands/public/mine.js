import { SlashCommandBuilder, MessageFlags } from 'discord.js';
import { getGameSettings, startMineRound, updateSessionMessage } from '../../services/gaming.js';
import { renderMine } from '../../games/mines/mine-ui.js';
import { setMineTimer } from '../../games/mines/mine-timer.js';
import { coinIcon, coinName } from '../../utils/common.js';

export const data = new SlashCommandBuilder()
  .setName('mine')
  .setDescription('Start a 3x3 Mines round with your coins')
  .addIntegerOption(option =>
    option
      .setName('bet')
      .setDescription('How many coins do you want to bet?')
      .setRequired(true)
      .setMinValue(1)
      .setMaxValue(1000000)
  );

export async function execute(interaction) {
  if (!interaction.guild) {
    return interaction.reply({
      content: '❌ Use `/mine` inside a Discord server.',
      flags: MessageFlags.Ephemeral
    });
  }

  const bet = interaction.options.getInteger('bet', true);
  await interaction.deferReply();

  const settings = await getGameSettings(interaction.guildId);
  if (settings.disabledGames?.includes('mines')) {
    return interaction.editReply({
      content: '❌ **Mines** is currently disabled by this server\'s administration.'
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

  try {
    const playerName = interaction.user.globalName || interaction.user.displayName || interaction.user.username;
    const session = await startMineRound({
      guildId: interaction.guildId,
      guildName: interaction.guild.name,
      userId: interaction.user.id,
      playerName,
      channelId: interaction.channelId,
      bet,
      client: interaction.client
    });

    const rendered = renderMine(session);
    const response = await interaction.editReply(rendered);
    const messageId = response?.id || (await interaction.fetchReply().then(m => m.id).catch(() => null));

    if (messageId) {
      await updateSessionMessage(interaction.guildId, interaction.user.id, session.sessionId, messageId, interaction.channelId);
      setMineTimer({
        client: interaction.client,
        guildId: interaction.guildId,
        userId: interaction.user.id,
        sessionId: session.sessionId,
        channelId: interaction.channelId,
        messageId
      });
    }
  } catch (error) {
    const code = error.code || error.cause?.code;
    if (code === 'INSUFFICIENT_FUNDS') {
      return interaction.editReply({
        content: `❌ You don't have enough ${coinName()} for that bet. Check your balance with \`/wallet\` or top up with \`/buycoin\`.`
      });
    }
    if (code === 'ACTIVE_MINE') {
      return interaction.editReply({
        content: '⚠️ You already have an active Mines round. Please finish it from your existing game message before starting another.'
      });
    }
    console.error('[MINE COMMAND ERROR]', error);
    return interaction.editReply({
      content: '❌ An error occurred while starting your Mines round. Please try again.'
    });
  }
}

