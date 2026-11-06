import {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  MessageFlags
} from 'discord.js';
import { Wallet, GameHistory } from '../../models.js';
import {
  coinName,
  coinIcon,
  formatCoins,
  getMemberTier,
  getTierTheme
} from '../../utils/common.js';
import { buildProfileCardPayload } from './wallet-2.js';

export const data = new SlashCommandBuilder()
  .setName('profile')
  .setDescription('View a player\'s gaming and coin profile')
  .addUserOption(option =>
    option
      .setName('user')
      .setDescription('Player to inspect')
      .setRequired(false)
  );

export async function buildGamingProfileEmbed(targetUser, guildId, member = null) {
  const userId = targetUser.id;
  const wallet = await Wallet.findOne({ guildId, userId }).lean();

  const balance = wallet?.balance || 0;
  const level = wallet?.level || 1;
  const xp = wallet?.xp || 0;
  const gamesPlayed = wallet?.gamesPlayed || 0;
  const wins = wallet?.wins || 0;
  const losses = wallet?.losses || 0;
  const winRate = gamesPlayed > 0 ? ((wins / gamesPlayed) * 100).toFixed(1) : '0.0';

  const tier = getMemberTier(balance, userId, member);
  const theme = getTierTheme(tier);

  const nextLevelXp = level * 250;
  const currentLevelBaseXp = (level - 1) * 250;
  const progressInLevel = Math.max(0, xp - currentLevelBaseXp);
  const xpNeeded = Math.max(0, nextLevelXp - xp);
  const progressPercent = Math.min(100, Math.round((progressInLevel / 250) * 100));

  // Visual XP progress bar (10 blocks)
  const filledBlocks = Math.round((progressPercent / 100) * 10);
  const emptyBlocks = 10 - filledBlocks;
  const progressBar = '▰'.repeat(filledBlocks) + '▱'.repeat(emptyBlocks);

  const embed = new EmbedBuilder()
    .setColor(0x7dbbeb)
    .setTitle(`🎮  ${targetUser.displayName || targetUser.username}'s Profile`)
    .setThumbnail(targetUser.displayAvatarURL({ dynamic: true, size: 256 }))
    .setDescription(
      `**Membership Tier:** ${theme.icon} **${theme.label}**\n` +
      `**Wallet Balance:** **${formatCoins(balance)}**\n` +
      `**Progress:** \`${progressBar}\` \`${progressPercent}%\` *(need ${xpNeeded} XP for Lv ${level + 1})*\n\n` +
      `────────────────────────────────`
    )
    .addFields(
      { name: '🪙 Coin Balance', value: `**${formatCoins(balance)}**`, inline: true },
      { name: '⭐ Level', value: `\`Level ${level}\``, inline: true },
      { name: '✨ Total XP', value: `\`${xp.toLocaleString()} XP\``, inline: true },
      { name: '🎮 Games Played', value: `\`${gamesPlayed.toLocaleString()}\``, inline: true },
      { name: '🏆 Wins', value: `\`${wins.toLocaleString()}\` (${winRate}%)`, inline: true },
      { name: '💥 Losses', value: `\`${losses.toLocaleString()}\``, inline: true }
    )
    .setFooter({ text: `Virtual coins only • ${coinName()}` })
    .setTimestamp();

  return embed;
}

export function buildProfileButtons(targetUserId, callerId) {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`prof_vip_${targetUserId}_${callerId}`)
      .setLabel('🎨 VIP 2.0 Card')
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId(`prof_gamehist_${targetUserId}_${callerId}`)
      .setLabel('📜 Game History')
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId(`prof_grefresh_${targetUserId}_${callerId}`)
      .setLabel('🔄 Refresh')
      .setStyle(ButtonStyle.Success)
  );
}

export async function execute(interaction) {
  if (!interaction.guild) {
    return interaction.reply({
      content: '❌ Use `/profile` inside a Discord server.',
      flags: MessageFlags.Ephemeral
    });
  }

  await interaction.deferReply();

  const targetUser = interaction.options.getUser('user') || interaction.user;
  const member = interaction.guild.members.cache.get(targetUser.id) || await interaction.guild.members.fetch(targetUser.id).catch(() => null);

  const embed = await buildGamingProfileEmbed(targetUser, interaction.guildId, member);
  const row = buildProfileButtons(targetUser.id, interaction.user.id);

  return interaction.editReply({
    embeds: [embed],
    components: [row]
  });
}

export async function component(interaction) {
  const parts = interaction.customId.split('_');
  const action = parts[1];
  const targetUserId = parts[2];
  const callerId = parts[3];

  if (callerId && interaction.user.id !== callerId) {
    return interaction.reply({
      content: '❌ Only the user who ran `/profile` can use these buttons.',
      flags: MessageFlags.Ephemeral
    });
  }

  const targetUser = await interaction.client.users.fetch(targetUserId).catch(() => interaction.user);
  const member = interaction.guild
    ? (interaction.guild.members.cache.get(targetUserId) || await interaction.guild.members.fetch(targetUserId).catch(() => null))
    : null;

  // 1. Open graphical VIP Card
  if (action === 'vip') {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    const { embed, attachment } = await buildProfileCardPayload(
      targetUser,
      interaction.guildId,
      interaction.user.id,
      member
    );
    return interaction.editReply({
      embeds: [embed],
      files: [attachment]
    });
  }

  // 2. Open Game History
  if (action === 'gamehist') {
    const entries = await GameHistory.find({
      guildId: interaction.guildId,
      userId: targetUserId
    })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    if (entries.length === 0) {
      return interaction.reply({
        content: `ℹ️ No game history found for <@${targetUserId}>.`,
        flags: MessageFlags.Ephemeral
      });
    }

    const lines = entries.map((x, i) => {
      const ts = Math.floor(new Date(x.createdAt).getTime() / 1000);
      const sign = x.net >= 0 ? '+' : '';
      const badge = x.won ? '🟢' : x.net === 0 ? '⚪' : '🔴';
      const gameName = x.game === 'mines' ? '💣 Mines' : x.game === 'coinflip' ? '🪙 Coinflip' : x.game;
      return `**${i + 1}. ${gameName}** (${badge} \`${sign}${x.net.toLocaleString()}\` ${coinIcon()})\n` +
        `• Bet: \`${x.bet.toLocaleString()}\` · Payout: \`${x.payout.toLocaleString()}\` · <t:${ts}:R>`;
    });

    const embed = new EmbedBuilder()
      .setColor(0x7dbbeb)
      .setTitle(`🧾  Game History — ${targetUser.displayName || targetUser.username}`)
      .setDescription(lines.join('\n\n'))
      .setTimestamp();

    return interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
  }

  // 3. Refresh Profile
  if (action === 'grefresh') {
    await interaction.deferUpdate();
    const embed = await buildGamingProfileEmbed(targetUser, interaction.guildId, member);
    const row = buildProfileButtons(targetUserId, callerId);
    return interaction.editReply({ embeds: [embed], components: [row] });
  }
}
