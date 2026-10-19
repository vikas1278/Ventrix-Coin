// ─── Public Commands ──────────────────────────────────────────────────────────
import * as helpCmd from './commands/public/help.js';
import * as shopCmd from './commands/public/shop.js';
import * as buyItemCmd from './commands/public/buyitem.js';
import * as buyCoinCmd from './commands/public/buycoin.js';
import * as walletCmd from './commands/public/wallet.js';
import * as profileCmd from './commands/public/profile.js';
import * as transactionsCmd from './commands/public/transactions.js';
import * as itemCmd from './commands/public/item.js';

// ─── Admin Commands ───────────────────────────────────────────────────────────
import * as createItemCmd from './commands/admin/create-item.js';
import * as editItemCmd from './commands/admin/edit-item.js';
import * as deleteItemCmd from './commands/admin/delete-item.js';
import * as giveCoinsCmd from './commands/admin/give-coins.js';
import * as takeCoinsCmd from './commands/admin/take-coins.js';
import * as setRateCmd from './commands/admin/set-rate.js';
import * as approvePaymentCmd from './commands/admin/approve-payment.js';
import * as rejectOrderCmd from './commands/admin/reject-order.js';
import * as shopConfigCmd from './commands/admin/shop-config.js';
import * as orderCmd from './commands/admin/order.js';
import * as orderHistoryCmd from './commands/admin/order-history.js';
import * as removeItemCmd from './commands/admin/remove-item.js';
import * as dropboxCmd from './commands/admin/dropbox.js';

import * as adminAddCmd from './commands/bot-owner/admin-add.js';
import * as adminRemoveCmd from './commands/bot-owner/admin-remove.js';
import * as adminListCmd from './commands/bot-owner/admin-list.js';
import * as clearServerCmd from './commands/bot-owner/clear-server.js';

import { err } from './utils/common.js';

// Map of command handlers
export const commandMap = new Map([
  // Public
  ['help', helpCmd],
  ['shop', shopCmd],
  ['buyitem', buyItemCmd],
  ['buycoin', buyCoinCmd],
  ['wallet', walletCmd],
  ['wallet-2', profileCmd],
  ['profile', profileCmd],
  ['transactions', transactionsCmd],
  ['item', itemCmd],

  // Admin
  ['create-item', createItemCmd],
  ['edit-item', editItemCmd],
  ['delete-item', deleteItemCmd],
  ['give-coins', giveCoinsCmd],
  ['take-coins', takeCoinsCmd],
  ['set-rate', setRateCmd],
  ['approve-payment', approvePaymentCmd],
  ['reject-order', rejectOrderCmd],
  ['shop-config', shopConfigCmd],
  ['order', orderCmd],
  ['orderhistory', orderHistoryCmd],
  ['dropbox', dropboxCmd],
  ['remove-item', removeItemCmd],

  // Bot Owner
  ['admin-add', adminAddCmd],
  ['admin-remove', adminRemoveCmd],
  ['admin-list', adminListCmd],
  ['clearserver', clearServerCmd],
]);

// All slash command definitions for deployment
export const commands = [
  // Public
  helpCmd.data,
  shopCmd.data,
  buyItemCmd.data,
  buyCoinCmd.data,
  walletCmd.data,
  profileCmd.data,
  transactionsCmd.data,
  itemCmd.data,

  // Admin
  createItemCmd.data,
  editItemCmd.data,
  deleteItemCmd.data,
  giveCoinsCmd.data,
  takeCoinsCmd.data,
  setRateCmd.data,
  approvePaymentCmd.data,
  rejectOrderCmd.data,
  shopConfigCmd.data,
  orderCmd.data,
  orderHistoryCmd.data,
  dropboxCmd.data,
  removeItemCmd.data,

  // Bot Owner
  adminAddCmd.data,
  adminRemoveCmd.data,
  adminListCmd.data,
  clearServerCmd.data,
].map(c => c.toJSON());

// ─── Main Slash Command Router ────────────────────────────────────────────────
export async function handleCommand(interaction) {
  const name = interaction.commandName;
  const cmd = commandMap.get(name);

  if (!cmd || typeof cmd.execute !== 'function') {
    return interaction.reply({
      content: `Unknown command: \`/${name}\``,
      ephemeral: true,
    }).catch(() => {});
  }

  try {
    return await cmd.execute(interaction);
  } catch (error) {
    if (error.code === 10062) return; // Ignore stale expired interactions
    console.error(`[COMMAND:${name}]`, error);
    const msg = error.message || 'Something went wrong. Check bot logs or contact an administrator.';
    const errEmbed = err('Command Error', msg);
    if (interaction.deferred || interaction.replied) {
      return interaction.followUp({ embeds: [errEmbed] }).catch(() => {});
    }
    return interaction.reply({ embeds: [errEmbed] }).catch(() => {});
  }
}

// ─── Component Router (Pagination Buttons & Help Category Buttons) ───────────
export async function handleComponent(interaction) {
  if ((interaction.isButton() || interaction.isStringSelectMenu()) && interaction.customId.startsWith('shop_')) {
    return shopCmd.component(interaction);
  }

  if (interaction.isButton() && interaction.customId.startsWith('item_page_')) {
    return itemCmd.component(interaction);
  }

  if (interaction.isButton() && interaction.customId.startsWith('tx_page_')) {
    return transactionsCmd.component(interaction);
  }

  if (interaction.isButton() && interaction.customId.startsWith('wallet_')) {
    return walletCmd.component(interaction);
  }

  if (interaction.isButton() && interaction.customId.startsWith('prof_')) {
    return profileCmd.component(interaction);
  }

  if ((interaction.isButton() || interaction.isStringSelectMenu()) && interaction.customId.startsWith('remove_item_')) {
    return removeItemCmd.component(interaction);
  }

  if (interaction.isButton() && interaction.customId.startsWith('ord_hist_')) {
    return orderHistoryCmd.component(interaction);
  }

  if ((interaction.isButton() || interaction.isStringSelectMenu()) && interaction.customId.startsWith('dropbox_')) {
    return dropboxCmd.component(interaction);
  }

  if ((interaction.isButton() || interaction.isStringSelectMenu()) && interaction.customId.includes('help_')) {
    return helpCmd.component(interaction);
  }

  if (
    interaction.isButton() &&
    (interaction.customId.startsWith('clear_server_') ||
      interaction.customId.startsWith('wipe_guild_') ||
      interaction.customId.startsWith('keep_guild_'))
  ) {
    return clearServerCmd.component(interaction);
  }
}

// ─── Autocomplete Router (Selection for Items) ────────────────────────────────
export async function handleAutocomplete(interaction) {
  const name = interaction.commandName;
  const cmd = commandMap.get(name);

  if (cmd && typeof cmd.autocomplete === 'function') {
    return cmd.autocomplete(interaction);
  }

  return interaction.respond([]).catch(() => {});
}

// Re-exports for helper & test compatibility
export { buildShopCatalogueEmbed } from './commands/public/shop.js';
