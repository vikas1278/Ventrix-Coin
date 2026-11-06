import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { Product, Order, Wallet, Ledger, UserInventory } from '../../models.js';
import { formatCoins, coinIcon, coinName, newOrderId, escapeText, C, err, replyEmbed } from '../../utils/common.js';
import { parseDuration } from '../../utils/duration.js';

export const data = new SlashCommandBuilder()
  .setName('buyitem')
  .setDescription('Purchase an item using your wallet coins')
  .addStringOption(o =>
    o.setName('item')
      .setDescription('Select an item from the list or enter Product ID')
      .setRequired(true)
      .setAutocomplete(true)
  );

export async function execute(interaction) {
  const input = interaction.options.getString('item') || interaction.options.getString('item_id');
  const clean = String(input || '').trim();
  const guildId = interaction.guildId || 'DM';

  const baseFilter = { active: true };
  if (interaction.guildId) {
    baseFilter.guildId = { $in: [interaction.guildId, 'global'] };
  }

  let product = null;

  // 1. Try finding by 24-character ObjectId
  if (/^[0-9a-fA-F]{24}$/.test(clean)) {
    product = await Product.findOne({ ...baseFilter, _id: clean });
  }

  // 2. If not found by ID, try exact name match
  if (!product) {
    const escaped = clean.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    product = await Product.findOne({
      ...baseFilter,
      name: new RegExp(`^${escaped}$`, 'i'),
    });
  }

  // 3. If not found, try partial name match
  if (!product) {
    const escaped = clean.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    product = await Product.findOne({
      ...baseFilter,
      name: new RegExp(escaped, 'i'),
    });
  }

  if (!product) {
    return replyEmbed(
      interaction,
      err('Item Not Found', `No active shop item was found matching \`${clean}\` in this server.\nUse \`/shop\` to view available items.`)
    );
  }

  // Check stock availability
  if (product.stock !== null && product.stock <= 0) {
    return replyEmbed(
      interaction,
      err('Out of Stock', `**${escapeText(product.name)}** is currently sold out! Please check back later.`)
    );
  }

  const userId = interaction.user.id;

  // Check current wallet balance for this server
  const wallet = await Wallet.findOne({ guildId, userId }).lean();
  const currentBalance = wallet?.balance || 0;

  if (currentBalance < product.coins) {
    const missing = product.coins - currentBalance;
    const embed = new EmbedBuilder()
      .setColor(C.danger)
      .setTitle(`❌  Insufficient ${coinName()}`)
      .setDescription(`You do not have enough ${coinName().toLowerCase()} on this server to purchase **${escapeText(product.name)}**.`)
      .addFields(
        { name: `${coinIcon()} ${coinName()}`, value: `**${formatCoins(product.coins)}**`, inline: true },
        { name: '👛 Your Balance',  value: `**${formatCoins(currentBalance)}**`, inline: true },
        { name: '⚠️ Shortfall',     value: `**${formatCoins(missing)}**`,        inline: true },
      )
      .setFooter({ text: `Need more ${coinName().toLowerCase()}? Run /buycoin amount:<INR> to top up via UPI!` })
      .setTimestamp();

    return replyEmbed(interaction, embed);
  }

  // Decrement stock atomically if limited stock
  if (product.stock !== null) {
    const stockDecremented = await Product.findOneAndUpdate(
      { _id: product._id, active: true, stock: { $gt: 0 } },
      { $inc: { stock: -1 } },
      { new: true }
    );
    if (!stockDecremented) {
      return replyEmbed(
        interaction,
        err('Out of Stock', `**${escapeText(product.name)}** just sold out right before your purchase!`)
      );
    }
  }

  // Atomic deduction from wallet
  const updatedWallet = await Wallet.findOneAndUpdate(
    { guildId, userId, balance: { $gte: product.coins } },
    { $inc: { balance: -product.coins } },
    { new: true }
  );

  if (!updatedWallet) {
    // Rollback stock if coin deduction failed
    if (product.stock !== null) {
      await Product.findByIdAndUpdate(product._id, { $inc: { stock: 1 } });
    }
    return replyEmbed(
      interaction,
      err('Purchase Failed', 'Your coin balance changed before the transaction could be finalized. Please check your balance with `/wallet` and try again.')
    );
  }

  const orderId = newOrderId();
  const inventoryId = `INV-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 10000).toString(36).toUpperCase()}`;

  const initialStatus = product.behaviorType === 'manual_claim' ? 'claim_required' : 'available';

  const guildName = interaction.guild?.name || 'Direct Message';
  const username = interaction.user.tag || interaction.user.username || '';

  // Record purchase in Order, Ledger, and UserInventory
  await Promise.all([
    Order.create({
      orderId,
      userId,
      username,
      guildId,
      guildName,
      type: 'shop_purchase',
      productId: product._id,
      productName: product.name,
      amountInr: 0,
      payablePaise: 0,
      coins: product.coins,
      status: 'paid',
      upiUri: '',
      expiresAt: new Date(),
      paidAt: new Date(),
      verificationSource: 'coins',
      note: `Purchased item ${product.name} (${product.type || 'STATIC'}) for ${product.coins} coins`,
    }),
    Ledger.create({
      guildId,
      guildName,
      userId,
      username,
      orderId,
      rrn: `COIN-BUY-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      coins: -product.coins,
      type: 'shop_purchase',
      reason: `Purchased item: ${product.name} (${product._id})`,
      performedBy: userId,
    }),
    UserInventory.create({
      inventoryId,
      userId,
      username,
      guildId,
      guildName,
      productId: product._id,
      productName: product.name,
      itemType: product.type || 'STATIC',
      behaviorType: product.behaviorType || 'manual_claim',
      roleId: product.roleId || null,
      duration: product.duration || '',
      durationMs: product.durationMs || (product.duration ? parseDuration(product.duration) : 0) || 0,
      quantity: 1,
      purchasedAt: new Date(),
      expiresAt: null,
      status: initialStatus,
      orderId,
    }),
  ]);

  const successEmbed = new EmbedBuilder()
    .setColor(C.success)
    .setTitle(`🎉  Purchase Successful — ${escapeText(product.name)}`)
    .setDescription(
      `Congratulations <@${userId}>! You successfully purchased **${escapeText(product.name)}** using your wallet ${coinName().toLowerCase()}.\n\n` +
      `📦 **The item is now in your inventory!**\n` +
      `👉 Run **\`/item use\`** whenever you are ready to activate or claim it.`
    )
    .addFields(
      { name: '🛒 Item Name',         value: escapeText(product.name),                      inline: true },
      { name: `${coinIcon()} ${coinName()} Deducted`, value: `**${formatCoins(product.coins)}**`, inline: true },
      { name: '👛 Remaining Balance', value: `**${formatCoins(updatedWallet.balance)}**`,   inline: true },
      { name: '🏷️ Type',              value: `**${product.type || 'STATIC'}**`,             inline: true },
      { name: '🎒 Inventory ID',      value: `\`${inventoryId}\``,                          inline: true },
      { name: '🧾 Order Receipt ID',  value: `\`${orderId}\``,                              inline: true },
    )
    .setFooter({ text: 'Use /item list to view your inventory • Use /item use to activate' })
    .setTimestamp();

  if (product.type === 'TIMED' && product.duration) {
    successEmbed.addFields({
      name: '⏱️ Duration',
      value: `\`${product.duration}\` (starts upon activation in \`/item use\`)`,
      inline: false,
    });
  }

  if (product.imageUrl) successEmbed.setThumbnail(product.imageUrl);

  return replyEmbed(interaction, successEmbed);
}

export async function autocomplete(interaction) {
  const focused = interaction.options.getFocused(true);
  const query = String(focused.value || '').trim().toLowerCase();
  const filter = { active: true };
  if (interaction.guildId) filter.guildId = { $in: [interaction.guildId, 'global'] };

  const products = await Product.find(filter).sort({ createdAt: -1 }).limit(25).lean();

  const filtered = products
    .filter(p =>
      !query ||
      p.name.toLowerCase().includes(query) ||
      String(p._id).toLowerCase().includes(query)
    )
    .slice(0, 25);

  return interaction.respond(
    filtered.map(p => {
      const stockBadge = p.stock !== null ? (p.stock > 0 ? `[${p.stock} left]` : '[OUT]') : '';
      return {
        name: `🛍️ ${p.name} — ${formatCoins(p.coins)} ${stockBadge} (${p.type || 'STATIC'})`.slice(0, 100),
        value: String(p._id),
      };
    })
  );
}
