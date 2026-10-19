import mongoose from 'mongoose';

// ─── Products Catalogue (Server / Guild Scoped) ───────────────────────────────
const productSchema = new mongoose.Schema({
  guildId: { type: String, required: true, default: 'global', index: true },
  name: { type: String, required: true, trim: true, maxlength: 100 },
  description: { type: String, default: '', maxlength: 1000 },
  imageUrl: { type: String, default: '' },
  coins: { type: Number, required: true, min: 1 }, // Price in coins
  type: {
    type: String,
    enum: ['STATIC', 'TIMED'],
    default: 'STATIC',
    index: true,
  },
  behaviorType: {
    type: String,
    enum: ['role_permanent', 'role_temporary', 'manual_claim', 'consumable'],
    default: 'manual_claim',
    index: true,
  },
  duration: { type: String, default: '' },
  durationMs: { type: Number, default: 0 },
  roleId: { type: String, default: null },
  stock: { type: Number, default: null }, // null = unlimited
  active: { type: Boolean, default: true, index: true },
  createdBy: { type: String, required: true }
}, { timestamps: true });
productSchema.index({ guildId: 1, active: 1 });

// ─── Orders (Coin Purchases via UPI & Item Purchases via Coins) ───────────────
const orderSchema = new mongoose.Schema({
  orderId: { type: String, required: true, unique: true, index: true },
  userId: { type: String, required: true, index: true },
  username: { type: String, default: '' },
  guildId: { type: String, required: true, index: true },
  guildName: { type: String, default: '' },
  type: {
    type: String,
    enum: ['coin_purchase', 'shop_purchase'],
    default: 'coin_purchase',
    index: true,
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    default: null,
  },
  productName: { type: String, required: true },
  amountInr: { type: Number, default: 0 },
  payablePaise: { type: Number, default: 0, index: true },
  coins: { type: Number, required: true },
  status: {
    type: String,
    enum: ['pending', 'paid', 'expired', 'review', 'rejected'],
    default: 'pending',
    index: true,
  },
  upiUri: { type: String, default: '' },
  expiresAt: { type: Date, required: true, index: true },
  paidAt: { type: Date, default: null },
  rrn: { type: String, default: null, index: true },
  verificationSource: {
    type: String,
    enum: ['gmail', 'admin', 'coins', null],
    default: null,
  },
  verifiedBy: { type: String, default: null },
  rejectionReason: { type: String, default: null },
  rejectedBy: { type: String, default: null },
  rejectedAt: { type: Date, default: null },
  note: { type: String, default: '' }
}, { timestamps: true });
orderSchema.index({ guildId: 1, userId: 1, createdAt: -1 });
orderSchema.index({ guildId: 1, status: 1 });

// ─── Incoming Payment Verification Records ────────────────────────────────────
const paymentSchema = new mongoose.Schema({
  rrn: { type: String, required: true, unique: true, index: true },
  amountPaise: { type: Number, required: true },
  transactionDate: { type: Date, default: null },
  senderName: { type: String, default: '' },
  gmailMessageId: { type: String, unique: true, sparse: true },
  orderId: { type: String, required: true, unique: true, index: true },
  guildId: { type: String, default: null, index: true },
  rawSnippet: { type: String, default: '' }
}, { timestamps: true });

// ─── User Coin Wallets (Isolated per Discord Server) ──────────────────────────
const walletSchema = new mongoose.Schema({
  guildId: { type: String, required: true, index: true },
  guildName: { type: String, default: '', index: true },
  userId: { type: String, required: true, index: true },
  username: { type: String, default: '' },
  balance: { type: Number, default: 0, min: 0 }
}, { timestamps: true });
walletSchema.index({ guildId: 1, userId: 1 }, { unique: true });

// ─── Coin Ledger (Immutable Audit Trail per Server & User) ────────────────────
const ledgerSchema = new mongoose.Schema({
  guildId: { type: String, required: true, default: 'DM', index: true },
  guildName: { type: String, default: '' },
  userId: { type: String, required: true, index: true },
  username: { type: String, default: '' },
  orderId: { type: String, required: true, index: true },
  rrn: { type: String, required: true, unique: true, index: true },
  coins: { type: Number, required: true }, // positive: credit, negative: debit
  type: {
    type: String,
    enum: ['purchase_credit', 'shop_purchase', 'admin_grant', 'admin_deduct', 'DROPBOX_REWARD'],
    required: true,
    index: true,
  },
  reason: { type: String, default: '' },
  performedBy: { type: String, default: 'system' }
}, { timestamps: true });
ledgerSchema.index({ guildId: 1, userId: 1, createdAt: -1 });

// ─── Dynamic Shop Configuration (Per Server / Global fallback) ────────────────
const configSchema = new mongoose.Schema({
  guildId: { type: String, default: 'global', index: true },
  key: { type: String, required: true, index: true },
  value: { type: mongoose.Schema.Types.Mixed, required: true },
  description: { type: String, default: '' },
  updatedBy: { type: String, default: 'system' }
}, { timestamps: true });
configSchema.index({ guildId: 1, key: 1 }, { unique: true });

// ─── Bot Administrators (Dynamic Persistent List) ────────────────────────────
const adminSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true, index: true },
  username: { type: String, default: '' },
  addedBy: { type: String, required: true },
  note: { type: String, default: '' }
}, { timestamps: true });

// ─── User Inventory (Purchased Items Waiting To Be Used or Consumed) ───────────
const userInventorySchema = new mongoose.Schema({
  inventoryId: { type: String, required: true, unique: true, index: true },
  userId: { type: String, required: true, index: true },
  username: { type: String, default: '' },
  guildId: { type: String, required: true, index: true },
  guildName: { type: String, default: '' },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
  productName: { type: String, required: true },
  itemType: { type: String, enum: ['STATIC', 'TIMED'], default: 'STATIC' },
  behaviorType: {
    type: String,
    enum: ['role_permanent', 'role_temporary', 'manual_claim', 'consumable'],
    default: 'manual_claim'
  },
  roleId: { type: String, default: null },
  duration: { type: String, default: '' },
  durationMs: { type: Number, default: 0 },
  quantity: { type: Number, default: 1, min: 1 },
  purchasedAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, default: null, index: true },
  status: {
    type: String,
    enum: ['available', 'active', 'consumed', 'expired', 'claim_required'],
    default: 'available',
    index: true
  },
  consumedAt: { type: Date, default: null },
  orderId: { type: String, default: '' }
}, { timestamps: true });
userInventorySchema.index({ guildId: 1, userId: 1, status: 1 });

// ─── Item Activations (Active Temporary / Permanent Role Grants) ──────────────
const itemActivationSchema = new mongoose.Schema({
  activationId: { type: String, required: true, unique: true, index: true },
  inventoryId: { type: String, required: true, index: true },
  userId: { type: String, required: true, index: true },
  guildId: { type: String, required: true, index: true },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  roleId: { type: String, default: null, index: true },
  activatedAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, default: null, index: true }, // null if permanent
  status: {
    type: String,
    enum: ['active', 'expired', 'revoked'],
    default: 'active',
    index: true
  }
}, { timestamps: true });
itemActivationSchema.index({ guildId: 1, userId: 1, roleId: 1, status: 1 });
itemActivationSchema.index({ status: 1, expiresAt: 1 });

// ─── Manual Claims (Items Requiring Staff Fulfillment or Support Ticket) ───────
const manualClaimSchema = new mongoose.Schema({
  claimId: { type: String, required: true, unique: true, index: true },
  inventoryId: { type: String, required: true, index: true },
  userId: { type: String, required: true, index: true },
  guildId: { type: String, required: true, index: true },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  productName: { type: String, required: true },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'fulfilled'],
    default: 'pending',
    index: true
  },
  ticketId: { type: String, default: null },
  processedAt: { type: Date, default: null },
  processedBy: { type: String, default: null },
  notes: { type: String, default: '' }
}, { timestamps: true });
manualClaimSchema.index({ guildId: 1, userId: 1, status: 1 });
manualClaimSchema.index({ inventoryId: 1, status: 1 });

// ─── Dropbox Events (Multi-Drop Timed Coin Distribution Events) ───────────────
const dropboxEventSchema = new mongoose.Schema({
  eventId: { type: String, required: true, unique: true, index: true },
  guildId: { type: String, required: true, index: true },
  guildName: { type: String, default: '' },
  createdBy: { type: String, required: true },
  coins: { type: Number, required: true, min: 0.000001 },
  totalDrops: { type: Number, required: true, min: 1 },
  completedDrops: { type: Number, default: 0 },
  intervalMs: { type: Number, required: true },
  intervalStr: { type: String, required: true },
  claimDurationMs: { type: Number, required: true },
  claimDurationStr: { type: String, required: true },
  description: { type: String, required: true, maxlength: 2000 },
  imageUrl: { type: String, default: '' },
  channelMode: { type: String, enum: ['specific', 'random'], default: 'specific' },
  dropChannelId: { type: String, default: null },
  logChannelId: { type: String, required: true },
  startMode: { type: String, enum: ['immediate', 'delayed'], default: 'immediate' },
  status: {
    type: String,
    enum: ['pending_setup', 'ready', 'active', 'completed', 'cancelled'],
    default: 'pending_setup',
    index: true,
  },
  cancelReason: { type: String, default: '' },
  cancelledBy: { type: String, default: null },
  nextDropAt: { type: Date, default: null },
  currentDropNumber: { type: Number, default: 0 },
  startedAt: { type: Date, default: null },
  completedAt: { type: Date, default: null },
}, { timestamps: true });
dropboxEventSchema.index({ guildId: 1, status: 1 });

// ─── Dropbox Drops (Individual Drops within an Event) ─────────────────────────
const dropboxDropSchema = new mongoose.Schema({
  dropId: { type: String, required: true, unique: true, index: true },
  eventId: { type: String, required: true, index: true },
  guildId: { type: String, required: true, index: true },
  dropNumber: { type: Number, required: true },
  channelId: { type: String, required: true },
  messageId: { type: String, default: null },
  coins: { type: Number, required: true },
  claimDeadline: { type: Date, required: true, index: true },
  status: {
    type: String,
    enum: ['scheduled', 'open', 'processing', 'completed', 'unclaimed', 'cancelled'],
    default: 'scheduled',
    index: true,
  },
  claimantCount: { type: Number, default: 0 },
  distributedCoins: { type: Number, default: 0 },
  perUserCoins: { type: Number, default: 0 },
  remainderCoins: { type: Number, default: 0 },
  postedAt: { type: Date, default: null },
  processedAt: { type: Date, default: null },
}, { timestamps: true });
dropboxDropSchema.index({ eventId: 1, dropNumber: 1 }, { unique: true });
dropboxDropSchema.index({ status: 1, claimDeadline: 1 });

// ─── Dropbox Claims (Claim Registrations for a Specific Drop) ─────────────────
const dropboxClaimSchema = new mongoose.Schema({
  eventId: { type: String, required: true, index: true },
  dropNumber: { type: Number, required: true },
  guildId: { type: String, required: true, index: true },
  userId: { type: String, required: true, index: true },
  rewardCoins: { type: Number, default: 0 },
  paid: { type: Boolean, default: false },
  claimedAt: { type: Date, default: Date.now },
}, { timestamps: true });
dropboxClaimSchema.index({ eventId: 1, dropNumber: 1, userId: 1 }, { unique: true });

// ─── Guilds / Servers Directory (Multi-Server Tracking) ──────────────────────
const guildSchema = new mongoose.Schema({
  guildId: { type: String, required: true, unique: true, index: true },
  guildName: { type: String, required: true, default: 'Unknown Server', index: true },
  iconUrl: { type: String, default: '' },
  memberCount: { type: Number, default: 0 },
  status: { type: String, enum: ['active', 'left'], default: 'active', index: true },
  joinedAt: { type: Date, default: Date.now },
  leftAt: { type: Date, default: null },
  lastActiveAt: { type: Date, default: Date.now }
}, { timestamps: true });

export const Product        = mongoose.model('Product', productSchema);
export const Order          = mongoose.model('Order', orderSchema);
export const Payment        = mongoose.model('Payment', paymentSchema);
export const Wallet         = mongoose.model('Wallet', walletSchema);
export const Ledger         = mongoose.model('Ledger', ledgerSchema);
export const Config         = mongoose.model('Config', configSchema);
export const Admin          = mongoose.model('Admin', adminSchema);
export const UserInventory  = mongoose.model('UserInventory', userInventorySchema);
export const ItemActivation = mongoose.model('ItemActivation', itemActivationSchema);
export const ManualClaim    = mongoose.model('ManualClaim', manualClaimSchema);
export const DropboxEvent   = mongoose.model('DropboxEvent', dropboxEventSchema);
export const DropboxDrop    = mongoose.model('DropboxDrop', dropboxDropSchema);
export const DropboxClaim   = mongoose.model('DropboxClaim', dropboxClaimSchema);
export const Guild          = mongoose.model('Guild', guildSchema);


