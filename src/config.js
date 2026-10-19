export const config = {
  // Shop & Coin Branding
  shopName: 'Vyntrix Coin Shop',
  coinName: 'VCoins',
  coinSymbol: '<:vyntrix_coin_gold:1561254716493795358>',
  bannerUrl: 'https://cdn.discordapp.com/attachments/1535900789996781588/1561415061237538886/banner.jpg?ex=6ad64498&is=6ad4f318&hm=2d25488207b8f0e849f08564913f9f57d195bf8784e08e17d3e9afd1a97cd939&', // Add your banner image URL here for instant <100ms /help response

  // UPI Payment Configuration
  upiId: 'gpay-11206677908@okbizaxis',
  upiPayeeName: 'vikas',
  upiNotePrefix: 'VyntrixShop',
  orderTtlMinutes: 10,

  // Coin Economy Default Rate (1 INR = X Coins)
  coinsPerInr: 1,

  // Discord Staff Role ID for STAFF badge on /profile
  staffRoleId: '', // Paste your Discord Staff Role ID here (e.g. '123456789012345678')

  // Membership Tier Thresholds (Based on Current Wallet Balance in VCoins)
  tierThresholds: {
    diamond: 5000,
    gold: 2000,
    silver: 500,
    vip: 100 // 100+ coins = VIP badge (below this = MEMBER)
  }
};

export default config;
