import { SlashCommandBuilder, EmbedBuilder, AttachmentBuilder, MessageFlags } from 'discord.js';
import { Wallet } from '../../models.js';
import { coinName } from '../../utils/common.js';
import { generateLeaderboardImage } from '../../utils/leaderboard-card.js';

export const data = new SlashCommandBuilder()
  .setName('leaderboard')
  .setDescription('View this server\'s top coin holders and gaming leaderboard (Premium Card)')
  .addStringOption(option =>
    option
      .setName('sort')
      .setDescription('Sort leaderboard by (default: Coin Balance)')
      .setRequired(false)
      .addChoices(
        { name: '🪙 Coin Balance', value: 'balance' },
        { name: '⭐ Rank & Level', value: 'level' },
        { name: '🏆 Game Wins', value: 'wins' },
        { name: '⚔️ War Points', value: 'warpoints' }
      )
  );

export async function execute(interaction) {
  if (!interaction.guild) {
    return interaction.reply({
      content: '❌ Use `/leaderboard` inside a Discord server.',
      flags: MessageFlags.Ephemeral
    });
  }

  await interaction.deferReply();

  try {
    const sortField = interaction.options.getString('sort') || 'balance';
    let sortQuery;
    let sortLabel = 'Highest Balance';

    if (sortField === 'level') {
      sortQuery = { level: -1, xp: -1, balance: -1 };
      sortLabel = 'Rank & Level';
    } else if (sortField === 'wins') {
      sortQuery = { wins: -1, balance: -1 };
      sortLabel = 'Game Wins';
    } else if (sortField === 'warpoints') {
      sortQuery = { warPoints: -1, wins: -1, balance: -1 };
      sortLabel = 'War Points';
    } else {
      sortQuery = { balance: -1 };
      sortLabel = 'Highest Balance';
    }

    // 1. Fetch Top 10 Wallets strictly isolated to current Discord guild
    const topWallets = await Wallet.find({
      guildId: interaction.guildId,
      $or: [{ balance: { $gt: 0 } }, { gamesPlayed: { $gt: 0 } }]
    })
      .sort(sortQuery)
      .limit(10)
      .lean();

    // 2. Handle Empty Leaderboard gracefully
    if (!topWallets || topWallets.length === 0) {
      const emptyEmbed = new EmbedBuilder()
        .setColor(0x64748b)
        .setTitle(`🏆  Server Leaderboard — ${interaction.guild.name}`)
        .setDescription('No coins or games recorded in this server yet.\n\n• Top up coins: `/buycoin`\n• Play games: `/coinflip` · `/mine` · `/guess`')
        .setFooter({ text: 'Ventrix Coins • Empty Leaderboard' })
        .setTimestamp();

      return interaction.editReply({ embeds: [emptyEmbed] });
    }

    // 3. Resolve Discord Usernames & Avatars dynamically
    const memberList = await Promise.all(
      topWallets.map(async (w, index) => {
        let displayName = w.username || 'Unknown Member';
        let avatarUrl = null;

        try {
          const member = await interaction.guild.members.fetch(w.userId).catch(() => null);
          if (member) {
            displayName = member.displayName || member.user.username;
            avatarUrl = member.displayAvatarURL({ extension: 'png', size: 128 });
          } else {
            const user = await interaction.client.users.fetch(w.userId).catch(() => null);
            if (user) {
              displayName = user.displayName || user.username;
              avatarUrl = user.displayAvatarURL({ extension: 'png', size: 128 });
            }
          }
        } catch (_) { }

        const winsCount = Number(w.wins || 0);
        const wpCount = Number(w.warPoints !== undefined && w.warPoints > 0 ? w.warPoints : winsCount);

        return {
          rank: index + 1,
          userId: w.userId,
          username: displayName,
          avatarUrl,
          balance: Number(w.balance || 0),
          level: Number(w.level || 1),
          wins: winsCount,
          warPoints: wpCount
        };
      })
    );

    // 4. Generate Premium Canvas Leaderboard Image (1000x1040 High-Res)
    const guildIconUrl = interaction.guild.iconURL({ extension: 'png', size: 128 });
    const imageBuffer = await generateLeaderboardImage({
      guildName: interaction.guild.name,
      guildIconUrl,
      members: memberList,
      generatedAt: new Date(),
      sortType: sortField,
      sortLabel
    });

    const attachment = new AttachmentBuilder(imageBuffer, { name: 'leaderboard.png' });

    // 5. Send standalone leaderboard image directly (full width, no embed wrapper)
    return interaction.editReply({
      files: [attachment]
    });
  } catch (error) {
    console.error('[LEADERBOARD ERROR]', error);
    const msg = '❌ An error occurred while generating the leaderboard card. Please try again later.';
    if (interaction.deferred || interaction.replied) {
      return interaction.editReply({ content: msg }).catch(() => {});
    }
    return interaction.reply({ content: msg, flags: MessageFlags.Ephemeral }).catch(() => {});
  }
}
