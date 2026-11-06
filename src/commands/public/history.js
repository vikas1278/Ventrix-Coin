import { SlashCommandBuilder, EmbedBuilder, MessageFlags } from 'discord.js';
import { GameHistory } from '../../models.js';
import { coinIcon, C } from '../../utils/common.js';

export const data = new SlashCommandBuilder()
  .setName('history')
  .setDescription('Show your recent game history and results')
  .addIntegerOption(option =>
    option
      .setName('limit')
      .setDescription('Number of recent rounds (1-10)')
      .setMinValue(1)
      .setMaxValue(10)
      .setRequired(false)
  );

export async function execute(interaction) {
  if (!interaction.guild) {
    return interaction.reply({
      content: '❌ Use `/history` inside a Discord server.',
      flags: MessageFlags.Ephemeral
    });
  }

  const limit = interaction.options.getInteger('limit') || 5;
  const entries = await GameHistory.find({
    guildId: interaction.guildId,
    userId: interaction.user.id
  })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();

  if (entries.length === 0) {
    return interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(C.muted || 0x64748b)
          .setTitle('🧾  Recent Game History')
          .setDescription('You have not played any games yet. Try playing with `/mine`!')
          .setTimestamp()
      ],
      flags: MessageFlags.Ephemeral
    });
  }

  const lines = entries.map((x, i) => {
    const ts = Math.floor(new Date(x.createdAt).getTime() / 1000);
    const sign = x.net >= 0 ? '+' : '';
    const badge = x.won ? '🟢' : x.net === 0 ? '⚪' : '🔴';
    const gameName = x.game === 'mines' ? '💣 Mines' : x.game === 'coinflip' ? '🪙 Coinflip' : x.game;
    return `**${i + 1}. ${gameName}** (${badge} \`${sign}${x.net.toLocaleString()}\` ${coinIcon()})\n` +
      `• Bet: \`${x.bet.toLocaleString()}\` · Payout: \`${x.payout.toLocaleString()}\`\n` +
      `• *${x.description}* · <t:${ts}:R>`;
  });

  const embed = new EmbedBuilder()
    .setColor(0x7dbbeb)
    .setTitle('🧾  Your Recent Game History')
    .setDescription(lines.join('\n\n'))
    .setFooter({ text: `Showing last ${entries.length} round(s)` })
    .setTimestamp();

  return interaction.reply({
    embeds: [embed],
    flags: MessageFlags.Ephemeral
  });
}

