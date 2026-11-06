// ─── Public Commands ──────────────────────────────────────────────────────────
import * as helpCmd from './commands/public/help.js';
import * as shopCmd from './commands/public/shop.js';
import * as buyItemCmd from './commands/public/buyitem.js';
import * as buyCoinCmd from './commands/public/buycoin.js';
import * as walletCmd from './commands/public/wallet.js';
import * as wallet2Cmd from './commands/public/wallet-2.js';
import * as profileCmd from './commands/public/profile.js';
import * as transactionsCmd from './commands/public/transactions.js';
import * as itemCmd from './commands/public/item.js';
import * as dashboardCmd from './commands/public/dashboard.js';
import * as transferCmd from './commands/public/transfer.js';
import * as inventoryCmd from './commands/public/inventory.js';
import * as mineCmd from './commands/public/mine.js';
import * as coinflipCmd from './commands/public/coinflip.js';
import * as guessCmd from './commands/public/guess.js';
import * as rpsCmd from './commands/public/rps.js';
import * as leaderboardCmd from './commands/public/leaderboard.js';
import * as historyCmd from './commands/public/history.js';

// ─── Admin Commands ───────────────────────────────────────────────────────────
import * as createItemCmd from './commands/admin/create-item.js';
import * as editItemCmd from './commands/admin/edit-item.js';
import * as deleteItemCmd from './commands/admin/delete-item.js';
import * as giveCoinsCmd from './commands/admin/give-coins.js';
import * as removeCoinsCmd from './commands/admin/remove-coins.js';
import * as setRateCmd from './commands/admin/set-rate.js';
import * as approvePaymentCmd from './commands/admin/approve-payment.js';
import * as rejectOrderCmd from './commands/admin/reject-order.js';
import * as shopConfigCmd from './commands/admin/shop-config.js';
import * as orderCmd from './commands/admin/order.js';
import * as orderHistoryCmd from './commands/admin/order-history.js';
import * as removeItemCmd from './commands/admin/remove-item.js';
import * as dropboxCmd from './commands/admin/dropbox.js';
import * as dropboxDeleteCmd from './commands/admin/dropbox-delete.js';
import * as gameSettingsCmd from './commands/admin/game-settings.js';
import * as gameToggleCmd from './commands/admin/game-toggle.js';
import * as serverConfigCmd from './commands/admin/server-config.js';

// ─── Bot Owner Commands ───────────────────────────────────────────────────────
import * as adminAddCmd from './commands/bot-owner/admin-add.js';
import * as adminRemoveCmd from './commands/bot-owner/admin-remove.js';
import * as adminListCmd from './commands/bot-owner/admin-list.js';
import * as clearServerCmd from './commands/bot-owner/clear-server.js';
import * as serverCmd from './commands/bot-owner/server.js';
import * as botBlacklistCmd from './commands/bot-owner/bot-blacklist.js';
import * as botUnblacklistCmd from './commands/bot-owner/bot-unblacklist.js';
import * as botStatsCmd from './commands/bot-owner/bot-stats.js';
import * as botGuildsCmd from './commands/bot-owner/bot-guilds.js';

// ─── Interactive Game Handlers ────────────────────────────────────────────────
import { handleMineButton } from './games/mines/mine-handler.js';

import { err } from './utils/common.js';

// Map of command handlers
export const commandMap = new Map([
  // Public
  ['help', helpCmd],
  ['shop', shopCmd],
  ['buyitem', buyItemCmd],
  ['buycoin', buyCoinCmd],
  ['wallet', walletCmd],
  ['wallet-2', wallet2Cmd],
  ['profile', profileCmd],
  ['transactions', transactionsCmd],
  ['item', itemCmd],
  ['inventory', inventoryCmd],
  ['dashboard', dashboardCmd],
  ['transfer', transferCmd],
  ['mine', mineCmd],
  ['coinflip', coinflipCmd],
  ['guess', guessCmd],
  ['rps', rpsCmd],
  ['leaderboard', leaderboardCmd],
  ['history', historyCmd],

  // Admin
  ['create-item', createItemCmd],
  ['edit-item', editItemCmd],
  ['delete-item', deleteItemCmd],
  ['give-coins', giveCoinsCmd],
  ['remove-coins', removeCoinsCmd],
  ['set-rate', setRateCmd],
  ['approve-payment', approvePaymentCmd],
  ['reject-order', rejectOrderCmd],
  ['shop-config', shopConfigCmd],
  ['order', orderCmd],
  ['orderhistory', orderHistoryCmd],
  ['dropbox', dropboxCmd],
  ['dropbox-delete', dropboxDeleteCmd],
  ['remove-item', removeItemCmd],
  ['game-settings', gameSettingsCmd],
  ['game-toggle', gameToggleCmd],
  ['server-config', serverConfigCmd],

  // Bot Owner
  ['admin-add', adminAddCmd],
  ['admin-remove', adminRemoveCmd],
  ['admin-list', adminListCmd],
  ['clearserver', clearServerCmd],
  ['server', serverCmd],
  ['bot-blacklist', botBlacklistCmd],
  ['bot-unblacklist', botUnblacklistCmd],
  ['bot-stats', botStatsCmd],
  ['bot-guilds', botGuildsCmd],
]);

// All slash command definitions for deployment
export const commands = [
  // Public
  helpCmd.data,
  shopCmd.data,
  buyItemCmd.data,
  buyCoinCmd.data,
  walletCmd.data,
  wallet2Cmd.data,
  profileCmd.data,
  transactionsCmd.data,
  itemCmd.data,
  inventoryCmd.data,
  dashboardCmd.data,
  transferCmd.data,
  mineCmd.data,
  coinflipCmd.data,
  guessCmd.data,
  rpsCmd.data,
  leaderboardCmd.data,
  historyCmd.data,

  // Admin
  createItemCmd.data,
  editItemCmd.data,
  deleteItemCmd.data,
  giveCoinsCmd.data,
  removeCoinsCmd.data,
  setRateCmd.data,
  approvePaymentCmd.data,
  rejectOrderCmd.data,
  shopConfigCmd.data,
  orderCmd.data,
  orderHistoryCmd.data,
  dropboxCmd.data,
  dropboxDeleteCmd.data,
  removeItemCmd.data,
  gameSettingsCmd.data,
  gameToggleCmd.data,
  serverConfigCmd.data,

  // Bot Owner
  adminAddCmd.data,
  adminRemoveCmd.data,
  adminListCmd.data,
  clearServerCmd.data,
  serverCmd.data,
  botBlacklistCmd.data,
  botUnblacklistCmd.data,
  botStatsCmd.data,
  botGuildsCmd.data,
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

// ─── Component Router (Pagination Buttons & Game Clicks) ─────────────────────
export async function handleComponent(interaction) {
  // Mines Game Button Router
  if (interaction.isButton() && interaction.customId.startsWith('mine:')) {
    return handleMineButton(interaction);
  }

  if ((interaction.isButton() || interaction.isStringSelectMenu()) && interaction.customId.startsWith('shop_')) {
    return shopCmd.component(interaction);
  }

  if (
    interaction.isButton() &&
    (interaction.customId.startsWith('item_page_') || interaction.customId.startsWith('inv_page_'))
  ) {
    return itemCmd.component(interaction);
  }

  if (interaction.isButton() && interaction.customId.startsWith('tx_page_')) {
    return transactionsCmd.component(interaction);
  }

  if (interaction.isButton() && interaction.customId.startsWith('wallet_')) {
    return walletCmd.component(interaction);
  }

  if (interaction.isButton() && interaction.customId.startsWith('prof_')) {
    if (
      interaction.customId.startsWith('prof_vip_') ||
      interaction.customId.startsWith('prof_gamehist_') ||
      interaction.customId.startsWith('prof_grefresh_')
    ) {
      return profileCmd.component(interaction);
    }
    return wallet2Cmd.component(interaction);
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

  if (
    (interaction.isButton() || interaction.isStringSelectMenu()) &&
    interaction.customId.startsWith('srv_')
  ) {
    return serverCmd.component(interaction);
  }

  if (interaction.customId.startsWith('guess_')) {
    return guessCmd.component(interaction);
  }

  // Rock Paper Scissors Game Button Router
  if (interaction.isButton() && interaction.customId.startsWith('rps:')) {
    return rpsCmd.component(interaction);
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
