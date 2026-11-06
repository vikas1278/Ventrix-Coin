// Modals, Mobile Bottom Nav, and Toast HTML
export function getModalsAndShellClose({ ICONS }) {
  return `
      </main>
    </div>
  </div>

  <!-- MODAL: Top Up Coins via UPI -->
  <div id="topup-modal" class="modal-overlay">
    <div class="modal-box">
      <button class="modal-close" onclick="closeModal('topup-modal')">&times;</button>
      <h3 class="modal-title" style="display: flex; align-items: center; gap: 10px;">${ICONS.zap} <span>Buy Coins via UPI QR</span></h3>
      <p style="font-size: 13px; color: #c4b5fd; margin-bottom: 12px;">Server: <strong id="topup-target-server">Loading...</strong></p>
      <div id="topup-step-1">
        <div class="form-group">
          <label class="form-label">Enter Amount in INR (₹)</label>
          <input type="number" id="topup-amount" class="form-input" min="1" placeholder="e.g. 100" value="100">
        </div>
        <p style="font-size: 12px; color: var(--muted); margin-bottom: 16px;">Coins will be credited to your wallet in this specific server.</p>
        <button class="btn-gold" style="width: 100%; justify-content: center;" onclick="generateUpiOrder()">${ICONS.zap} Generate UPI QR Code</button>
      </div>
      <div id="topup-step-2" style="display: none; text-align: center;">
        <img id="topup-qr-img" src="" alt="UPI QR" style="width: 220px; height: 220px; border-radius: 12px; margin: 10px auto; border: 1px solid var(--border);">
        <p style="font-weight: 700; font-size: 18px; color: #fff; margin-bottom: 4px;">Pay <span id="topup-display-inr">₹0</span></p>
        <p style="font-size: 13px; color: var(--muted); margin-bottom: 16px;">Scan with Google Pay, PhonePe, Paytm, or Slice. Once paid, coins are credited automatically or verified by admin.</p>
        <a id="topup-upi-link" href="#" class="btn-primary" style="display: block; text-decoration: none; margin-bottom: 8px;">Open in UPI App</a>
      </div>
    </div>
  </div>

  <!-- MODAL: Approve Payment -->
  <div id="approve-modal" class="modal-overlay">
    <div class="modal-box">
      <button class="modal-close" onclick="closeModal('approve-modal')">&times;</button>
      <h3 class="modal-title" style="display: flex; align-items: center; gap: 10px;">${ICONS.check} <span>Approve Payment</span></h3>
      <p style="font-size: 13px; color: var(--muted); margin-bottom: 14px;" id="approve-order-details">Order Details</p>
      <div class="form-group">
        <label class="form-label">Enter Bank Statement RRN / UTR (8–20 digits)</label>
        <input type="text" id="approve-rrn-input" class="form-input" placeholder="e.g. 329012345678" required>
      </div>
      <button class="btn-gold" style="width: 100%; justify-content: center;" onclick="submitApprovePayment()">${ICONS.check} Verify &amp; Credit Coins</button>
    </div>
  </div>

  <!-- MODAL: Add Product -->
  <div id="product-modal" class="modal-overlay">
    <div class="modal-box" style="max-width: 520px; max-height: 90vh; overflow-y: auto;">
      <button class="modal-close" onclick="closeModal('product-modal')">&times;</button>
      <h3 class="modal-title" style="display: flex; align-items: center; gap: 10px;">${ICONS.plus} <span>Create Shop Item</span></h3>
      <form onsubmit="handleCreateProduct(event)">
        <div class="form-group">
          <label class="form-label">Item Name</label>
          <input type="text" id="prod-name" class="form-input" required placeholder="e.g. VIP Pass / Special Role">
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
          <div class="form-group">
            <label class="form-label">Coin Price</label>
            <input type="number" id="prod-coins" class="form-input" required min="1" placeholder="500">
          </div>
          <div class="form-group">
            <label class="form-label">Stock (Blank = Unlimited)</label>
            <input type="number" id="prod-stock" class="form-input" placeholder="Unlimited">
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Behavior Type</label>
          <select id="prod-behavior" class="form-input">
            <option value="role_permanent">🎭 Permanent Discord Role</option>
            <option value="role_temporary">⏱️ Temporary Discord Role</option>
            <option value="manual_claim">🎫 Manual Claim / Staff Ticket</option>
          </select>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
          <div class="form-group">
            <label class="form-label">Auto-Assigned Role (Optional)</label>
            <select id="prod-role-id" class="form-input">
              <option value="">No Role Assigned</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Duration (e.g. 1m, 1h, 7d, 30d)</label>
            <input type="text" id="prod-duration" class="form-input" placeholder="e.g. 1m (1 min), 1d (1 day)">
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Description</label>
          <input type="text" id="prod-desc" class="form-input" placeholder="Special perks, commands, or access">
        </div>
        <div class="form-group">
          <label class="form-label">Image URL (Optional)</label>
          <input type="url" id="prod-img" class="form-input" placeholder="https://...">
        </div>
        <button type="submit" class="btn-gold" style="width: 100%; justify-content: center; height: 44px;">${ICONS.plus} Save Item to Catalogue</button>
      </form>
    </div>
  </div>

  <!-- MODAL: Edit Product -->
  <div id="edit-product-modal" class="modal-overlay">
    <div class="modal-box" style="max-width: 520px; max-height: 90vh; overflow-y: auto;">
      <button class="modal-close" onclick="closeModal('edit-product-modal')">&times;</button>
      <h3 class="modal-title" style="display: flex; align-items: center; gap: 10px;">${ICONS.edit} <span>Edit Shop Item</span></h3>
      <form onsubmit="handleEditProduct(event)">
        <input type="hidden" id="edit-prod-id">
        <div class="form-group">
          <label class="form-label">Item Name</label>
          <input type="text" id="edit-prod-name" class="form-input" required>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
          <div class="form-group">
            <label class="form-label">Coin Price</label>
            <input type="number" id="edit-prod-coins" class="form-input" required min="1">
          </div>
          <div class="form-group">
            <label class="form-label">Stock (Blank = Unlimited)</label>
            <input type="number" id="edit-prod-stock" class="form-input" placeholder="Unlimited">
          </div>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
          <div class="form-group">
            <label class="form-label">Behavior Type</label>
            <select id="edit-prod-behavior" class="form-input">
              <option value="role_permanent">🎭 Permanent Discord Role</option>
              <option value="role_temporary">⏱️ Temporary Discord Role</option>
              <option value="manual_claim">🎫 Manual Claim / Staff Ticket</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Active Status</label>
            <select id="edit-prod-active" class="form-input">
              <option value="true">🟢 Active (Visible in Shop)</option>
              <option value="false">🔴 Inactive (Hidden)</option>
            </select>
          </div>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
          <div class="form-group">
            <label class="form-label">Discord Role</label>
            <select id="edit-prod-role-id" class="form-input">
              <option value="">No Role Assigned</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Duration (e.g. 1m, 1h, 7d, 30d)</label>
            <input type="text" id="edit-prod-duration" class="form-input" placeholder="e.g. 1m, 1h, 7d, 30d">
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Description</label>
          <input type="text" id="edit-prod-desc" class="form-input">
        </div>
        <div class="form-group">
          <label class="form-label">Image URL</label>
          <input type="url" id="edit-prod-img" class="form-input">
        </div>
        <button type="submit" class="btn-primary" style="width: 100%; justify-content: center; height: 44px;">${ICONS.check} Save Changes</button>
      </form>
    </div>
  </div>

  <!-- MODAL: Create Dropbox Event (/dropbox setup) -->
  <div id="dropbox-modal" class="modal-overlay">
    <div class="modal-box" style="max-width: 520px; max-height: 90vh; overflow-y: auto;">
      <button class="modal-close" onclick="closeModal('dropbox-modal')">&times;</button>
      <h3 class="modal-title" style="display: flex; align-items: center; gap: 10px;">${ICONS.gift} <span>Setup Coin Dropbox Event</span></h3>
      <p style="font-size: 13px; color: var(--muted); margin-bottom: 14px;">Automated timed coin drops in <strong id="dropbox-target-server">Server</strong></p>
      <form onsubmit="handleCreateDropbox(event)">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
          <div class="form-group">
            <label class="form-label">Coins Per Drop</label>
            <input type="number" id="dbx-coins" class="form-input" required min="1" placeholder="50" value="50">
          </div>
          <div class="form-group">
            <label class="form-label">Total Drops</label>
            <input type="number" id="dbx-total" class="form-input" required min="1" placeholder="5" value="5">
          </div>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
          <div class="form-group">
            <label class="form-label">Interval (e.g. 5m, 1h)</label>
            <input type="text" id="dbx-interval" class="form-input" required placeholder="5m" value="5m">
          </div>
          <div class="form-group">
            <label class="form-label">Claim Window (e.g. 1m, 30m)</label>
            <input type="text" id="dbx-claim" class="form-input" required placeholder="1m" value="1m">
          </div>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
          <div class="form-group">
            <label class="form-label">Reward Distribution Mode</label>
            <select id="dbx-dist-mode" class="form-input">
              <option value="ranked">⚡ Ranked (Fastest-Finger — No Decimals)</option>
              <option value="equal">🤝 Equal Split (All claimants get equal share)</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Claimant Cap (Max Winners)</label>
            <input type="number" id="dbx-max-claimants" class="form-input" min="0" placeholder="0 for unlimited (e.g. 10)" value="0">
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Channel Selection Mode</label>
          <select id="dbx-channel-mode" class="form-input" onchange="toggleDropChannelField('dbx')">
            <option value="specific">🎯 Specific Channel (Drop in channel selected below)</option>
            <option value="random">🎲 Random Channel (Picks a random text channel for each drop)</option>
          </select>
        </div>
        <div class="form-group" id="dbx-channel-container">
          <label class="form-label">Drop Channel (Where coin drops appear)</label>
          <select id="dbx-channel" class="form-input">
            <option value="">Loading text channels...</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Log Channel (Where claim summaries &amp; logs are posted)</label>
          <select id="dbx-log-channel" class="form-input" required>
            <option value="">Loading text channels...</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Announcement Description</label>
          <input type="text" id="dbx-desc" class="form-input" required placeholder="Fastest clickers share the coin pool!" value="Fastest clickers share the coin pool!">
        </div>
        <div class="form-group">
          <label class="form-label">Banner / Image URL (Optional)</label>
          <input type="url" id="dbx-image" class="form-input" placeholder="https://cdn.discordapp.com/attachments/.../banner.png">
        </div>
        <div class="form-group">
          <label class="form-label">Start Mode</label>
          <select id="dbx-start-mode" class="form-input">
            <option value="immediate">⚡ Start Drop 1 Immediately</option>
            <option value="delayed">⏳ Delayed / Manual Start (Start later via ▶️ Start button)</option>
          </select>
        </div>
        <button type="submit" class="btn-gold" style="width: 100%; justify-content: center; height: 44px;">${ICONS.zap} Launch Dropbox Event</button>
      </form>
    </div>
  </div>

  <!-- MODAL: Edit Dropbox Event (/dropbox edit) -->
  <div id="edit-dropbox-modal" class="modal-overlay">
    <div class="modal-box" style="max-width: 520px; max-height: 90vh; overflow-y: auto;">
      <button class="modal-close" onclick="closeModal('edit-dropbox-modal')">&times;</button>
      <h3 class="modal-title" style="display: flex; align-items: center; gap: 10px;">${ICONS.edit} <span>Edit Coin Dropbox Event</span></h3>
      <p style="font-size: 13px; color: var(--muted); margin-bottom: 14px;">Modify event configuration for <code id="edit-dbx-display-id">DBX-...</code></p>
      <form onsubmit="handleSaveDropboxEdit(event)">
        <input type="hidden" id="edit-dbx-id">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
          <div class="form-group">
            <label class="form-label">Coins Per Drop</label>
            <input type="number" id="edit-dbx-coins" class="form-input" required min="0.000001" step="any">
          </div>
          <div class="form-group">
            <label class="form-label">Total Drops</label>
            <input type="number" id="edit-dbx-total" class="form-input" required min="1">
          </div>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
          <div class="form-group">
            <label class="form-label">Interval (e.g. 5m, 1h)</label>
            <input type="text" id="edit-dbx-interval" class="form-input" required placeholder="5m">
          </div>
          <div class="form-group">
            <label class="form-label">Claim Window (e.g. 1m, 30m)</label>
            <input type="text" id="edit-dbx-claim" class="form-input" required placeholder="1m">
          </div>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
          <div class="form-group">
            <label class="form-label">Reward Distribution Mode</label>
            <select id="edit-dbx-dist-mode" class="form-input">
              <option value="ranked">⚡ Ranked (Fastest-Finger — No Decimals)</option>
              <option value="equal">🤝 Equal Split (All claimants get equal share)</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Claimant Cap (Max Winners)</label>
            <input type="number" id="edit-dbx-max-claimants" class="form-input" min="0" placeholder="0 for unlimited (e.g. 10)">
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Channel Selection Mode</label>
          <select id="edit-dbx-channel-mode" class="form-input" onchange="toggleDropChannelField('edit-dbx')">
            <option value="specific">🎯 Specific Channel</option>
            <option value="random">🎲 Random Channel</option>
          </select>
        </div>
        <div class="form-group" id="edit-dbx-channel-container">
          <label class="form-label">Drop Channel</label>
          <select id="edit-dbx-channel" class="form-input">
            <option value="">Loading text channels...</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Log Channel (Logs &amp; Results)</label>
          <select id="edit-dbx-log-channel" class="form-input" required>
            <option value="">Loading text channels...</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Announcement Description</label>
          <input type="text" id="edit-dbx-desc" class="form-input" required placeholder="Announcement message">
        </div>
        <div class="form-group">
          <label class="form-label">Banner / Image URL (Optional)</label>
          <input type="url" id="edit-dbx-image" class="form-input" placeholder="https://cdn.discordapp.com/attachments/.../banner.png">
        </div>
        <button type="submit" class="btn-primary" style="width: 100%; justify-content: center; height: 44px;">${ICONS.check} Save Event Changes</button>
      </form>
    </div>
  </div>

  <!-- MODAL: Order Breakdown Inspector (/order) -->
  <div id="order-inspect-modal" class="modal-overlay">
    <div class="modal-box" style="max-width: 520px;">
      <button class="modal-close" onclick="closeModal('order-inspect-modal')">&times;</button>
      <h3 class="modal-title" style="display: flex; align-items: center; gap: 10px;">${ICONS.package} <span>Order Inspector</span></h3>
      <div id="order-inspect-body" style="font-size: 13px; color: var(--text);">
        <!-- Populated dynamically -->
      </div>
    </div>
  </div>

  <!-- MODAL: Product Details / Item Inspector -->
  <div id="product-details-modal" class="modal-overlay" onclick="if(event.target===this) closeModal('product-details-modal')">
    <div class="modal-box" style="max-width: 580px; max-height: 90vh; overflow-y: auto; padding: 0; position: relative; border: 1px solid rgba(167, 139, 250, 0.25); box-shadow: 0 25px 60px -10px rgba(0,0,0,0.85), 0 0 40px rgba(139, 92, 246, 0.15);">
      <button class="modal-close" style="top: 14px; right: 14px; z-index: 20; background: rgba(0,0,0,0.65); backdrop-filter: blur(8px); border: 1px solid rgba(255,255,255,0.15); border-radius: 50%; width: 34px; height: 34px; display: flex; align-items: center; justify-content: center; color: #fff; cursor: pointer; transition: all 0.2s;" onclick="closeModal('product-details-modal')">&times;</button>
      <div id="product-details-body">
        <!-- Populated dynamically -->
      </div>
    </div>
  </div>

  <!-- MODAL: Add Admin -->
  <div id="admin-modal" class="modal-overlay">
    <div class="modal-box">
      <button class="modal-close" onclick="closeModal('admin-modal')">&times;</button>
      <h3 class="modal-title" style="display: flex; align-items: center; gap: 10px;">${ICONS.userPlus} <span>Add Bot Admin</span></h3>
      <form onsubmit="handleAddAdmin(event)">
        <div class="form-group">
          <label class="form-label">Discord User ID</label>
          <input type="text" id="new-admin-id" class="form-input" required placeholder="527175885309083648">
        </div>
        <div class="form-group">
          <label class="form-label">Username (Optional)</label>
          <input type="text" id="new-admin-user" class="form-input" placeholder="vikassingh">
        </div>
        <div class="form-group">
          <label class="form-label">Note / Role Reason</label>
          <input type="text" id="new-admin-note" class="form-input" placeholder="Head Manager">
        </div>
        <button type="submit" class="btn-primary" style="width: 100%; justify-content: center;">${ICONS.userPlus} Save Admin</button>
      </form>
    </div>
  </div>

  <!-- MODAL: Clear Server Data (/clearserver) -->
  <div id="clear-server-modal" class="modal-overlay">
    <div class="modal-box" style="max-width: 500px; border: 1px solid rgba(239, 68, 68, 0.4);">
      <button class="modal-close" onclick="closeModal('clear-server-modal')">&times;</button>
      <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 12px;">
        <span style="font-size: 28px;">🚨</span>
        <div>
          <h3 class="modal-title" style="margin: 0; color: #ef4444;" id="clear-modal-title">Confirm Server Data Wipe</h3>
          <p style="font-size: 12px; color: var(--muted); margin-2px 0 0;" id="clear-modal-subtitle">Irreversible database purge</p>
        </div>
      </div>

      <div style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 8px; padding: 12px; margin-bottom: 16px; font-size: 13px; line-height: 1.5; color: #fca5a5;" id="clear-modal-warning">
        You are about to permanently delete records for server <strong id="clear-target-guild-name" style="color: #fff;">Selected Server</strong>. This action cannot be undone!
      </div>

      <div style="margin-bottom: 16px;">
        <label class="form-label" style="font-weight: 600;">Type <span style="color: #ef4444; font-family: monospace;">CONFIRM</span> to proceed:</label>
        <input type="text" id="clear-confirm-input" class="form-input" placeholder="Type CONFIRM here" autocomplete="off" oninput="validateClearInput()">
      </div>

      <div style="display: flex; gap: 10px; justify-content: flex-end;">
        <button type="button" class="btn-secondary" onclick="closeModal('clear-server-modal')">Cancel</button>
        <button type="button" id="clear-modal-confirm-btn" class="btn-logout" style="background: #dc2626; color: #fff; opacity: 0.5; cursor: not-allowed;" disabled onclick="executeClearServer()">
          ${ICONS.trash} Permanently Delete
        </button>
      </div>
    </div>
  </div>

  <!-- MODAL: Transaction Details Inspection -->
  <div id="tx-detail-modal" class="modal-overlay">
    <div class="modal-box" style="max-width: 540px; border-color: rgba(139, 92, 246, 0.45); box-shadow: 0 0 40px rgba(139, 92, 246, 0.25);">
      <button class="modal-close" onclick="closeModal('tx-detail-modal')">&times;</button>
      <div style="display: flex; align-items: center; gap: 14px; margin-bottom: 20px;">
        <div class="card-icon-badge" style="background: rgba(139, 92, 246, 0.2); border-color: rgba(139, 92, 246, 0.4); color: #c084fc;">
          ${ICONS.doc}
        </div>
        <div>
          <h3 class="modal-title" style="margin: 0; font-size: 19px;">Transaction Details</h3>
          <p style="font-size: 12px; color: var(--muted); margin-top: 2px;">Immutable ledger record from MongoDB Atlas</p>
        </div>
      </div>

      <div style="display: flex; flex-direction: column; gap: 12px;" id="tx-modal-body"></div>
    </div>
  </div>

  <!-- MODAL: All Server Coin Transactions -->
  <div id="all-transactions-modal" class="modal-overlay">
    <div class="modal-box" style="max-width: 1000px; width: 95vw; max-height: 90vh; display: flex; flex-direction: column; padding: 24px; border: 1px solid rgba(139, 92, 246, 0.35); box-shadow: 0 0 45px rgba(139, 92, 246, 0.2);">
      <button class="modal-close" onclick="closeModal('all-transactions-modal')">&times;</button>
      
      <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 14px; margin-bottom: 18px; flex-wrap: wrap;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <div style="width: 44px; height: 44px; border-radius: 12px; background: rgba(245, 158, 11, 0.15); border: 1px solid rgba(245, 158, 11, 0.3); display: flex; align-items: center; justify-content: center; font-size: 20px;">
            🪙
          </div>
          <div>
            <h3 class="modal-title" style="margin: 0; font-size: 20px; font-weight: 800; color: var(--text-heading, #fff);">Global Server Coin Transactions</h3>
            <div style="font-size: 12px; color: var(--muted); margin-top: 3px;">Full immutable ledger of coin movements across all connected Discord servers</div>
          </div>
        </div>
        <div style="display: flex; gap: 10px; align-items: center; flex-wrap: wrap;">
          <button class="btn-owner-primary" onclick="exportOwnerTransactionsCsv()" style="background: linear-gradient(135deg, #059669, #10b981); border: 1px solid rgba(16, 185, 129, 0.4); font-size: 12px; padding: 8px 14px; border-radius: 9px; color: #fff; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; font-weight: 700;">
            📥 Export CSV
          </button>
          <button class="btn-owner-refresh" onclick="loadOwnerModalTransactions(1)" style="font-size: 12px; padding: 7px 14px;">
            <span class="refresh-icon">↻</span> Refresh
          </button>
        </div>
      </div>

      <!-- Filters Bar -->
      <div style="display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 14px; background: rgba(255,255,255,0.02); padding: 10px 12px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.06); align-items: center;">
        <div style="position: relative; flex: 1; min-width: 220px;">
          <input type="text" id="owner-modal-tx-search" class="owner-input-search" placeholder="Search by Tx ID, Server, User, Order ID..." oninput="debounceModalTxSearch()" style="width: 100%; padding-left: 34px;">
          <svg style="position: absolute; left: 10px; top: 10px; color: var(--muted);" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        </div>
        <select id="owner-modal-tx-type" class="owner-input-search" onchange="loadOwnerModalTransactions(1)" style="width: auto; padding: 7px 12px; cursor: pointer;">
          <option value="">All Types</option>
          <option value="ADD">Coins Added</option>
          <option value="REMOVE">Coins Removed</option>
          <option value="PURCHASE">Shop Purchase</option>
          <option value="ORDER_PAYMENT">Order Payment</option>
          <option value="TRANSFER">Coin Transfer</option>
          <option value="GIFT">Coin Gift</option>
          <option value="REFUND">Refund</option>
          <option value="ADMIN_ADJUST">Admin Adjustment</option>
        </select>
        <select id="owner-modal-tx-status" class="owner-input-search" onchange="loadOwnerModalTransactions(1)" style="width: auto; padding: 7px 12px; cursor: pointer;">
          <option value="">All Statuses</option>
          <option value="success">Success</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
        </select>
      </div>

      <!-- Scrollable Table -->
      <div class="owner-table-wrapper" style="flex: 1; overflow-y: auto; max-height: 480px;">
        <table class="owner-table">
          <thead>
            <tr>
              <th style="width: 36px;">#</th>
              <th>SERVER NAME</th>
              <th>USER</th>
              <th>TYPE</th>
              <th>AMOUNT</th>
              <th>PREV BAL</th>
              <th>NEW BAL</th>
              <th>DATE</th>
              <th>STATUS</th>
              <th style="text-align: right;">ACTIONS</th>
            </tr>
          </thead>
          <tbody id="owner-modal-tx-tbody">
            <tr><td colspan="10" class="owner-table-loading">Loading transactions...</td></tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination Footer -->
      <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 14px; padding-top: 12px; border-top: 1px solid rgba(255,255,255,0.06); font-size: 13px; color: var(--muted);">
        <div id="owner-modal-tx-count">Showing 0 of 0 transactions</div>
        <div style="display: flex; gap: 8px; align-items: center;">
          <button id="owner-modal-tx-prev" class="btn-owner-refresh" style="padding: 6px 14px; font-size: 12px;" onclick="prevModalTxPage()" disabled>Previous</button>
          <span id="owner-modal-tx-page-info" style="font-weight: 700; color: #fff; min-width: 60px; text-align: center;">Page 1</span>
          <button id="owner-modal-tx-next" class="btn-owner-refresh" style="padding: 6px 14px; font-size: 12px;" onclick="nextModalTxPage()" disabled>Next</button>
        </div>
      </div>
    </div>
  </div>

  <!-- MODAL: Connected Server Details Inspector -->
  <div id="server-details-modal" class="modal-overlay">
    <div class="modal-box server-details-box">
      <button class="modal-close" onclick="closeModal('server-details-modal')">&times;</button>
      
      <!-- Server Hero Header -->
      <div class="server-details-header">
        <div style="display: flex; align-items: center; gap: 14px;">
          <img id="srv-det-icon" src="https://cdn.discordapp.com/embed/avatars/0.png" style="width: 52px; height: 52px; border-radius: 14px; border: 2px solid rgba(139,92,246,0.5); object-fit: cover;">
          <div>
            <div style="display: flex; align-items: center; gap: 10px;">
              <h2 id="srv-det-name" class="server-details-title">Server Name</h2>
              <span id="srv-det-status-badge" class="owner-status-pill status-active"><span class="owner-status-dot"></span>Active</span>
            </div>
            <div style="font-size: 12px; color: var(--muted); margin-top: 4px; display: flex; gap: 8px; align-items: center;">
              <span>Guild ID: <code id="srv-det-id" class="server-details-id-pill" style="font-size: 11px;">000000000000000000</code></span>
              <span>•</span>
              <span id="srv-det-members" style="color: var(--text-main, #cbd5e1); font-weight: 600;">0 members</span>
            </div>
          </div>
        </div>
        <div style="display: flex; gap: 10px; align-items: center;">
          <button id="srv-det-wipe-btn" class="owner-btn-wipe" style="padding: 8px 14px; font-size: 12px;">
            🗑️ Wipe Data
          </button>
          <button id="srv-det-delete-btn" class="owner-btn-delete" style="padding: 8px 14px; font-size: 12px;">
            ❌ Delete Server
          </button>
        </div>
      </div>

      <!-- 4 Server Stat Tiles -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; margin-bottom: 24px;">
        <div class="server-details-stat-card">
          <div class="server-details-stat-title">COINS IN CIRCULATION</div>
          <div id="srv-det-coins" style="font-size: 20px; font-weight: 800; color: #fbbf24; margin-top: 4px;">0</div>
          <div class="server-details-stat-sub">Aggregate wallet balance</div>
        </div>
        <div class="server-details-stat-card">
          <div class="server-details-stat-title">ACTIVE WALLETS</div>
          <div id="srv-det-users" style="font-size: 20px; font-weight: 800; color: #38bdf8; margin-top: 4px;">0 users</div>
          <div class="server-details-stat-sub">Users holding coins</div>
        </div>
        <div class="server-details-stat-card">
          <div class="server-details-stat-title">TOTAL TRANSACTIONS</div>
          <div id="srv-det-tx-count" style="font-size: 20px; font-weight: 800; color: #a78bfa; margin-top: 4px;">0</div>
          <div class="server-details-stat-sub">All-time ledger records</div>
        </div>
        <div class="server-details-stat-card">
          <div class="server-details-stat-title">VOLUME EARNED / SPENT</div>
          <div id="srv-det-volume" style="font-size: 15px; font-weight: 800; color: #10b981; margin-top: 6px;">+0 / -0</div>
          <div class="server-details-stat-sub">Coins credited vs spent</div>
        </div>
      </div>

      <!-- Top Balances & Recent Transactions Grid -->
      <div style="display: grid; grid-template-columns: 1fr 1.45fr; gap: 16px;">
        <!-- Top Coin Holders -->
        <div class="server-details-panel">
          <h4 class="server-details-section-title">🏆 Top Coin Holders</h4>
          <div id="srv-det-top-wallets" style="display: flex; flex-direction: column; gap: 8px;">
            <div style="color: var(--muted); font-size: 12px; text-align: center; padding: 12px;">Loading holders...</div>
          </div>
        </div>

        <!-- Recent Guild Transactions -->
        <div class="server-details-panel">
          <h4 class="server-details-section-title">📜 Recent Server Transactions</h4>
          <div class="owner-table-wrapper" style="max-height: 270px; overflow-y: auto;">
            <table class="owner-table" style="font-size: 12px;">
              <thead>
                <tr>
                  <th>USER & DISCORD ID</th>
                  <th>TYPE</th>
                  <th>AMOUNT</th>
                  <th>DATE & TIME</th>
                </tr>
              </thead>
              <tbody id="srv-det-recent-tx">
                <tr><td colspan="4" class="owner-table-loading">Loading recent transactions...</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- ─── MOBILE BOTTOM NAVIGATION BAR ─── -->
    <nav class="mobile-bottom-nav">
      <button class="mobile-bottom-nav-btn active" id="mob-nav-dashboard" onclick="switchTab('dashboard-tab')">
        <span class="mob-icon">${ICONS.dashboard}</span>
        <span>Dashboard</span>
      </button>
      <button class="mobile-bottom-nav-btn" id="mob-nav-wallet" onclick="switchTab('wallet-tab')">
        <span class="mob-icon">${ICONS.wallet}</span>
        <span>Wallet</span>
      </button>
      <button class="mobile-bottom-nav-btn" id="mob-nav-shop" onclick="switchTab('shop-tab')">
        <span class="mob-icon">${ICONS.cart}</span>
        <span>Shop</span>
      </button>
      <button class="mobile-bottom-nav-btn" id="mob-nav-orders" onclick="switchTab('orders-tab')">
        <span class="mob-icon">${ICONS.package}</span>
        <span>Orders</span>
      </button>
      <button class="mobile-bottom-nav-btn" id="mob-nav-more" onclick="toggleSidebar()">
        <span class="mob-icon">${ICONS.gear}</span>
        <span>Menu</span>
      </button>
    </nav>
  </div>

  <!-- Toast Notification -->
  <div id="toast"><span>Notification</span></div>

  `;
}
