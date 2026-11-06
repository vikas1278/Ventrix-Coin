import {
  SlashCommandBuilder,
  EmbedBuilder,
  AttachmentBuilder,
  MessageFlags
} from 'discord.js';
import { Wallet, Ledger } from '../../models.js';
import {
  coinName,
  adminOnly,
  isOwner,
  getMemberTier,
} from '../../utils/common.js';
import { generateProfileCardImage } from '../../utils/profile-card.js';

export const data = new SlashCommandBuilder()
  .setName('wallet-2')
  .setDescription('View your premium VYNTRIX Coin Wallet Dashboard (Neon Gaming UI)')
  .addUserOption(o => o.setName('user').setDescription('Inspect another member\'s wallet card (Admin only)').setRequired(false));

/**
 * Fetches stats, generates the graphical PNG card, and prepares the Discord embed payload
 */
export async function buildProfileCardPayload(targetUser, guildId, callerId, member = null) {
  const userId = targetUser.id;

  // 1. Fetch wallet balance & spent stats
  const wallet = await Wallet.findOne({ guildId: { $in: [guildId, 'global', 'DM'] }, userId }).lean();
  const balance = Number(wallet?.balance || 0);

  // 2. Aggregate Ledger Statistics (Total Purchased & Total Spent)
  const ledgerEntries = await Ledger.find({
    userId,
    guildId: { $in: [guildId, 'global', 'DM'] }
  }).lean();

  let totalPurchased = 0;
  let ledgerSpent = 0;

  for (const entry of ledgerEntries) {
    if (entry.type === 'purchase_credit' || (entry.type === 'admin_grant' && entry.coins > 0)) {
      totalPurchased += Math.abs(entry.coins);
    } else if (entry.type === 'shop_purchase' || entry.type === 'admin_deduct' || entry.type === 'game_bet') {
      ledgerSpent += Math.abs(entry.coins);
    }
  }

  const totalSpent = Math.max(Number(wallet?.totalSpent || 0), ledgerSpent);

  // 3. Resolve Owner / Tier Badge
  const isUserOwner = isOwner(userId);
  const tier = isUserOwner ? 'OWNER' : getMemberTier(balance, userId, member);
  const avatarUrl = targetUser.displayAvatarURL({ extension: 'png', size: 256, forceStatic: true });

  // 4. Generate High-Res Graphical Card (PNG)
  const imageBuffer = await generateProfileCardImage({
    username: targetUser.displayName || targetUser.username,
    userId: targetUser.id,
    avatarUrl,
    tierBadge: tier,
    balance,
    totalPurchased,
    totalSpent
  });

  const attachment = new AttachmentBuilder(imageBuffer, { name: 'vyntrix-wallet.png' });

  // 5. Clean Embed Displaying the Rendered Card (No extra text, no unnecessary timestamps)
  const embed = new EmbedBuilder()
    .setColor(0xa855f7)
    .setImage('attachment://vyntrix-wallet.png');

  return { embed, attachment };
}

// ─── Slash Command Execution ──────────────────────────────────────────────────
export async function execute(interaction) {
  try {
    await interaction.deferReply();
  } catch (err) {
    if (err?.code === 10062) return;
    throw err;
  }
  const targetUser = interaction.options.getUser('user') || interaction.user;

  if (targetUser.id !== interaction.user.id && !adminOnly(interaction)) {
    return interaction.editReply({
      content: '❌ Only administrators can inspect another member\'s wallet card.'
    });
  }

  const guildId = interaction.guildId || 'DM';
  const member = interaction.guild
    ? (interaction.guild.members.cache.get(targetUser.id) || await interaction.guild.members.fetch(targetUser.id).catch(() => null))
    : null;
  const { embed, attachment } = await buildProfileCardPayload(targetUser, guildId, interaction.user.id, member);

  return interaction.editReply({
    embeds: [embed],
    files: [attachment]
  });
}

// ─── Component Interactions Router (Maintained for legacy compatibility) ─────
export async function component(interaction) {
  return interaction.reply({
    content: 'ℹ️ Wallet 2.0 has been upgraded to a clean, premium dashboard.',
    flags: MessageFlags.Ephemeral
  }).catch(() => {});
}
