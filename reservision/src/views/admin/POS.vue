<template>
  <div class="admin-layout" :class="{ 'pos-fullscreen': isFullscreen }">

    <AdminSidebar
      :is-open="sidebarOpen"
      :is-collapsed="sidebarCollapsed"
      @close="sidebarOpen = false"
    />

    <main class="main-content" :class="{ shifted: sidebarCollapsed }">

      <AdminHeader
        :pos-mode="true"
        :categories="visibleCategories"
        :current-category="currentCategory"
        v-model:searchQuery="searchQuery"
        :eshop-pending-count="eshopPendingCount"
        :show-transaction="showTransaction"
        :is-fullscreen="isFullscreen"
        :user-name="auth.user?.name || 'Admin'"
        @toggle-sidebar="sidebarOpen = !sidebarOpen"
        @search="filterItems"
        @scan="openScanner"
        @category-change="showCategory"
        @toggle-transaction="toggleTransaction"
        @toggle-fullscreen="toggleFullscreen"
      />

      <QRCheckInScanner
        :is-open="isCheckinScannerOpen"
        @close="isCheckinScannerOpen = false"
        @check-in-success="handleCheckInSuccess"
      />

      <div class="pos-container">

        <!-- ══ POS VIEW ══ -->
        <div v-show="!showTransaction" class="pos-section">
          <div class="pos-grid">

            <!-- ── Items Panel ── -->
            <div class="items-panel">

              <!-- Panel header -->
              <div class="panel-header">
                <div class="panel-header-left">
                  <div class="panel-icon"><i class="fas fa-th"></i></div>
                  <div>
                    <div class="panel-title">Menu Items</div>
                    <div class="panel-sub">Select items to add to cart</div>
                  </div>
                </div>
              </div>

              <!-- Restaurant type filters -->
              <div
                v-if="currentCategory === 'restaurant' && restaurantTypeFilters.length > 0"
                class="filter-strip"
              >
                <button
                  type="button"
                  @click="restaurantTypeFilter = 'all'; showMoreFilters = false"
                  :class="['filter-chip', restaurantTypeFilter === 'all' ? 'chip--active' : 'chip--idle']"
                >All</button>

                <button
                  v-for="f in visibleFilters" :key="f"
                  type="button"
                  @click="restaurantTypeFilter = f; showMoreFilters = false"
                  :class="['filter-chip', restaurantTypeFilter === f ? 'chip--active' : 'chip--idle']"
                >{{ f }}</button>

                <div v-if="overflowFilters.length > 0" class="more-wrap">
                  <button
                    type="button"
                    :class="['filter-chip chip--more', (showMoreFilters || overflowFilters.includes(restaurantTypeFilter)) ? 'chip--active' : 'chip--idle']"
                    @click.stop="showMoreFilters = !showMoreFilters"
                  >
                    {{ overflowFilters.includes(restaurantTypeFilter) ? restaurantTypeFilter : 'More' }}
                    <i :class="showMoreFilters ? 'fas fa-chevron-up' : 'fas fa-chevron-down'" class="more-arrow"></i>
                  </button>
                  <div v-if="showMoreFilters" class="more-dropdown" @click.stop>
                    <button
                      v-for="f in overflowFilters" :key="f"
                      type="button"
                      :class="['more-item', restaurantTypeFilter === f ? 'more-item--active' : '']"
                      @click="restaurantTypeFilter = f; showMoreFilters = false"
                    >{{ f }}</button>
                  </div>
                </div>
              </div>

              <!-- Items scrollable area -->
              <div class="items-body">
                <div
                  v-for="category in visibleCategories"
                  :key="`items-${category.id}`"
                  v-show="currentCategory === category.id"
                >
                  <!-- Grouped restaurant view (only when not searching) -->
                  <template v-if="category.id === 'restaurant' && restaurantTypeFilter === 'all' && !searchQuery && groupedRestaurantItems.length > 0">
                    <div v-for="group in groupedRestaurantItems" :key="group.type" class="item-group">
                      <div class="group-header">
                        <span class="group-label">{{ group.type }}</span>
                        <span class="group-count">{{ group.items.length }}</span>
                      </div>
                      <div class="items-grid">
                        <button
                          v-for="item in group.items" :key="item.name"
                          @click="handleItemClick(item.name, item.price, category.id)"
                          class="item-card"
                        >
                          <div class="item-card-icon"><i class="fas fa-utensils"></i></div>
                          <div class="item-card-name">{{ item.name }}</div>
                          <div class="item-card-price">₱{{ item.price.toLocaleString() }}</div>
                        </button>
                      </div>
                    </div>
                    <div v-if="uncategorizedRestaurantItems.length > 0" class="item-group">
                      <div class="group-header">
                        <span class="group-label">Other</span>
                        <span class="group-count">{{ uncategorizedRestaurantItems.length }}</span>
                      </div>
                      <div class="items-grid">
                        <button
                          v-for="item in uncategorizedRestaurantItems" :key="item.name"
                          @click="handleItemClick(item.name, item.price, category.id)"
                          class="item-card"
                        >
                          <div class="item-card-icon"><i class="fas fa-utensils"></i></div>
                          <div class="item-card-name">{{ item.name }}</div>
                          <div class="item-card-price">₱{{ item.price.toLocaleString() }}</div>
                        </button>
                      </div>
                    </div>
                  </template>

                  <!-- Flat grid (filtered category OR searching) -->
                  <template v-else>
                    <div v-if="getFilteredItems(category.items, category.id).length === 0" class="items-no-results">
                      <i class="fas fa-search"></i>
                      <p>No items match "<strong>{{ searchQuery }}</strong>"</p>
                    </div>
                    <div v-else class="items-grid">
                      <button
                        v-for="item in getFilteredItems(category.items, category.id)"
                        :key="item.name"
                        @click="handleItemClick(item.name, item.price, category.id)"
                        class="item-card"
                      >
                        <div class="item-card-icon">
                          <i :class="`fas fa-${category.id === 'rooms' ? 'bed' : category.id === 'cottage' ? 'home' : category.id === 'event' ? 'calendar-alt' : 'utensils'}`"></i>
                        </div>
                        <div class="item-card-name">{{ item.name }}</div>
                        <div class="item-card-price">₱{{ item.price.toLocaleString() }}</div>
                      </button>
                    </div>
                  </template>
                </div>
              </div>
            </div>

            <!-- ── Cart Panel ── -->
            <div class="cart-panel">

              <!-- Cart Header -->
              <div class="cart-header">
                <div class="cart-header-left">
                  <div class="cart-header-icon"><i class="fas fa-receipt"></i></div>
                  <div>
                    <div class="cart-header-title">Current Order</div>
                    <div class="cart-header-sub">{{ cart.length }} item{{ cart.length !== 1 ? 's' : '' }}</div>
                  </div>
                </div>
                <button @click="clearCart" class="cart-clear-btn" title="Clear cart">
                  <i class="fas fa-trash-alt"></i>
                </button>
              </div>

              <!-- Cart Items -->
              <div class="cart-items-scroll">
                <div v-if="cart.length === 0" class="cart-empty">
                  <div class="cart-empty-icon"><i class="fas fa-shopping-basket"></i></div>
                  <p>No items yet</p>
                  <span>Tap an item on the left to add it here</span>
                </div>

                <div v-else class="cart-list">
                  <div
                    v-for="(item, index) in cart"
                    :key="index"
                    class="cart-row"
                  >
                    <div class="cart-row-left">
                      <div class="cart-row-name">{{ item.name }}</div>
                      <div v-if="item.isBooking" class="cart-row-meta">
                        <span><i class="fas fa-user"></i> {{ item.firstName }} {{ item.lastName }}</span>
                        <span><i class="fas fa-calendar-alt"></i> {{ item.checkIn }} – {{ item.checkOut }}</span>
                        <span v-if="item.nights"><i class="fas fa-moon"></i> {{ item.nights }} night{{ item.nights > 1 ? 's' : '' }}</span>
                      </div>
                      <div v-else class="cart-row-qty">× {{ item.qty }}</div>
                    </div>
                    <div class="cart-row-right">
                      <span class="cart-row-price">₱{{ item.price.toLocaleString() }}</span>
                      <button @click="removeItem(index)" class="cart-row-remove">
                        <i class="fas fa-times"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Cart Footer -->
              <div class="cart-footer">

                <!-- Total bar -->
                <div class="total-bar">
                  <span class="total-label">Total</span>
                  <span class="total-amount">₱{{ total.toLocaleString() }}</span>
                </div>

                <!-- Payment method -->
                <div class="payment-section">
                  <div class="payment-label"><i class="fas fa-credit-card"></i> Payment Method</div>
                  <div class="payment-btns">
                    <button
                      type="button"
                      :class="['pay-btn', paymentMethod === 'GCash' ? 'pay-btn--gcash' : '']"
                      @click="paymentMethod = 'GCash'"
                    >
                      <i class="fas fa-wallet"></i>
                      <span>GCash</span>
                      <i v-if="paymentMethod === 'GCash'" class="fas fa-check-circle pay-check"></i>
                    </button>
                    <button
                      type="button"
                      :class="['pay-btn', paymentMethod === 'Cash' ? 'pay-btn--cash' : '']"
                      @click="paymentMethod = 'Cash'"
                    >
                      <i class="fas fa-money-bill-wave"></i>
                      <span>Cash</span>
                      <i v-if="paymentMethod === 'Cash'" class="fas fa-check-circle pay-check"></i>
                    </button>
                  </div>
                </div>

                <!-- Checkout -->
                <button @click="checkout" class="checkout-btn">
                  <i class="fas fa-check-circle"></i>
                  <span>Pay & Complete</span>
                  <span class="checkout-amount">₱{{ total.toLocaleString() }}</span>
                </button>

              </div>
            </div>

          </div>
        </div>

        <!-- ══ TRANSACTION HISTORY ══ -->
        <div v-show="showTransaction" class="trans-section">

          <div class="trans-header">
            <div class="trans-header-left">
              <div class="panel-icon"><i class="fas fa-history"></i></div>
              <div>
                <div class="panel-title">POS Transaction History</div>
                <div class="panel-sub">{{ filteredTransactionHistory.length }} transaction{{ filteredTransactionHistory.length !== 1 ? 's' : '' }}</div>
              </div>
            </div>
            <div class="trans-actions">
              <button @click="exportAllTransactions" class="btn-export">
                <i class="fas fa-file-excel"></i> Export Excel
              </button>
              <button @click="clearHistory" class="btn-danger-outline">
                <i class="fas fa-trash"></i> Clear History
              </button>
            </div>
          </div>

          <div class="trans-table-wrap">
            <table class="trans-table">
              <thead>
                <tr>
                  <th>Receipt</th>
                  <th>Items</th>
                  <th>Type</th>
                  <th>Payment</th>
                  <th>Amount</th>
                  <th>Date & Time</th>
                  <th class="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="filteredTransactionHistory.length === 0">
                  <td colspan="7">
                    <div class="trans-empty">
                      <div class="empty-icon-wrap"><i class="fas fa-inbox"></i></div>
                      <p class="empty-title">No transactions yet</p>
                      <p class="empty-sub">Completed transactions will appear here.</p>
                    </div>
                  </td>
                </tr>
                <tr
                  v-else
                  v-for="trans in filteredTransactionHistory"
                  :key="trans.receiptNo"
                  :class="['trans-row', trans.source === 'eshop' && !viewedTransactions.has(trans.receiptNo) ? 'trans-row--new' : '']"
                >
                  <td>
                    <div class="receipt-cell">
                      <span class="receipt-no">POS-{{ trans.receiptNo }}</span>
                      <span v-if="trans.source === 'eshop' && !viewedTransactions.has(trans.receiptNo)" class="new-badge">
                        NEW
                      </span>
                    </div>
                  </td>
                  <td>
                    <div class="items-preview">{{ getItemsPreview(trans.items) }}</div>
                    <button @click="viewDetails(trans.receiptNo)" class="view-btn">
                      <i class="fas fa-eye"></i> View Details
                    </button>
                  </td>
                  <td><span class="type-pill">{{ trans.type }}</span></td>
                  <td>
                    <span :class="['pay-badge', trans.payment === 'GCash' ? 'pay-badge--gcash' : 'pay-badge--cash']">
                      {{ trans.payment }}
                    </span>
                  </td>
                  <td class="amount-cell">₱{{ trans.total.toLocaleString() }}</td>
                  <td>
                    <div class="date-cell">{{ trans.date }}</div>
                    <div class="time-cell">{{ trans.time }}</div>
                  </td>
                  <td>
                    <div class="tbl-acts">
                      <button @click="printReceipt(trans.receiptNo)" class="tbl-btn tbl-btn--print" title="Print"><i class="fas fa-print"></i></button>
                      <button @click="downloadReceipt(trans.receiptNo)" class="tbl-btn tbl-btn--dl" title="Download"><i class="fas fa-download"></i></button>
                      <button @click="customizeReceipt(trans.receiptNo)" class="tbl-btn tbl-btn--cust" title="Customize"><i class="fas fa-palette"></i></button>
                      <button @click="deleteTransaction(trans.receiptNo)" class="tbl-btn tbl-btn--del" title="Delete"><i class="fas fa-trash"></i></button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </main>

    <!-- ══ RECEIPT CUSTOMIZER MODAL ══ -->
    <div v-if="showReceiptCustomizer" class="modal-overlay" @click.self="showReceiptCustomizer = false">
      <div class="modal-box" @click.stop>
        <div class="modal-head">
          <div class="modal-head-left">
            <div class="modal-head-icon modal-head-icon--gold"><i class="fas fa-palette"></i></div>
            <div>
              <div class="modal-title">Customize Receipt</div>
              <div class="modal-sub">POS-{{ selectedReceipt?.receiptNo }}</div>
            </div>
          </div>
          <button @click="showReceiptCustomizer = false" class="modal-close-btn"><i class="fas fa-times"></i></button>
        </div>
        <div class="modal-body">
          <div class="modal-section">
            <div class="modal-section-title"><i class="fas fa-paint-brush"></i> Colors</div>
            <div class="form-row-2">
              <div class="form-group">
                <label class="form-label">Header Background</label>
                <div class="color-row">
                  <input type="color" v-model="receiptStyle.headerBg" class="color-swatch" />
                  <input type="text" v-model="receiptStyle.headerBg" class="form-input font-mono" />
                </div>
              </div>
              <div class="form-group">
                <label class="form-label">Header Text</label>
                <div class="color-row">
                  <input type="color" v-model="receiptStyle.headerText" class="color-swatch" />
                  <input type="text" v-model="receiptStyle.headerText" class="form-input font-mono" />
                </div>
              </div>
            </div>
          </div>
          <div class="modal-section">
            <div class="modal-section-title"><i class="fas fa-file-alt"></i> Content</div>
            <div class="form-group">
              <label class="form-label">Company Name</label>
              <input type="text" v-model="receiptStyle.companyName" class="form-input" />
            </div>
          </div>
        </div>
        <div class="modal-foot">
          <button @click="showReceiptCustomizer = false" class="btn-cancel">Cancel</button>
          <button @click="downloadCustomizedReceipt" class="btn-action btn-action--green"><i class="fas fa-download"></i> Download</button>
          <button @click="saveReceiptStyle" class="btn-action btn-action--primary"><i class="fas fa-save"></i> Save Style</button>
        </div>
      </div>
    </div>

    <!-- ══ BOOKING MODAL ══ -->
    <POSRoomBookingModal
      :is-open="showBookingModal"
      :item-name="pendingBookingItem?.name || ''"
      :item-price="pendingBookingItem?.price || 0"
      @close="showBookingModal = false"
      @confirm="handleBookingConfirm"
    />

    <!-- ══ TRANSACTION DETAILS MODAL ══ -->
    <div v-if="showTransactionDetails && selectedTransaction" class="modal-overlay" @click.self="showTransactionDetails = false">
      <div class="modal-box" @click.stop>
        <div class="modal-head">
          <div class="modal-head-left">
            <div class="modal-head-icon"><i class="fas fa-receipt"></i></div>
            <div>
              <div class="modal-title">Transaction Details</div>
              <div class="modal-sub">POS-{{ selectedTransaction.receiptNo }}</div>
            </div>
          </div>
          <button @click="showTransactionDetails = false" class="modal-close-btn"><i class="fas fa-times"></i></button>
        </div>
        <div class="modal-body">
          <div class="modal-section">
            <div class="modal-section-title"><i class="fas fa-info-circle"></i> Transaction Info</div>
            <div class="detail-grid">
              <div class="detail-row"><span class="detail-key">Receipt No</span><span class="detail-val">POS-{{ selectedTransaction.receiptNo }}</span></div>
              <div class="detail-row"><span class="detail-key">Type</span><span class="detail-val">{{ selectedTransaction.type }}</span></div>
              <div class="detail-row"><span class="detail-key">Date</span><span class="detail-val">{{ selectedTransaction.date }}</span></div>
              <div class="detail-row"><span class="detail-key">Time</span><span class="detail-val">{{ selectedTransaction.time }}</span></div>
            </div>
          </div>
          <div class="modal-section">
            <div class="modal-section-title"><i class="fas fa-shopping-cart"></i> Items</div>
            <div class="items-detail-list">
              <div v-for="(item, idx) in selectedTransaction.items" :key="idx" class="items-detail-row">
                <div class="items-detail-left">
                  <div class="items-detail-name">{{ item.name }}</div>
                  <div v-if="item.bookingReference" class="items-detail-ref"><i class="fas fa-tag"></i> Ref: {{ item.bookingReference }}</div>
                </div>
                <div class="items-detail-price">₱{{ item.price.toLocaleString() }}</div>
              </div>
            </div>
          </div>
          <div class="modal-section">
            <div class="modal-section-title"><i class="fas fa-credit-card"></i> Payment</div>
            <div class="detail-grid">
              <div class="detail-row">
                <span class="detail-key">Method</span>
                <span :class="['pay-badge', selectedTransaction.payment === 'GCash' ? 'pay-badge--gcash' : 'pay-badge--cash']">{{ selectedTransaction.payment }}</span>
              </div>
              <div class="detail-row detail-row--total">
                <span class="detail-key">Total Amount</span>
                <span class="detail-total">₱{{ selectedTransaction.total.toLocaleString() }}</span>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-foot">
          <button @click="printReceipt(selectedTransaction.receiptNo)" class="btn-action btn-action--green"><i class="fas fa-print"></i> Print</button>
          <button @click="showTransactionDetails = false" class="btn-cancel"><i class="fas fa-times"></i> Close</button>
        </div>
      </div>
    </div>

    <!-- ══ TOAST ══ -->
    <transition name="toast">
      <div v-if="toastMessage" :class="['toast', toastType === 'success' ? 'toast--success' : 'toast--error']">
        <i :class="toastType === 'success' ? 'fas fa-check-circle' : 'fas fa-exclamation-circle'"></i>
        {{ toastMessage }}
      </div>
    </transition>

  </div>
</template>

<script>
import AdminSidebar        from '../../components/Admin/AdminSidebar.vue'
import AdminHeader         from '../../components/Admin/AdminHeader.vue'
import QRCheckInScanner    from '../../components/QRCheckInScanner.vue'
import POSRoomBookingModal from '../../components/POSRoomBookingModal.vue'
import QRCode              from 'qrcode'
import { useAuthStore }    from '../../stores/auth'
import { useNotificationStore } from '../../stores/notifications'
import axios from 'axios'
import * as XLSX from 'xlsx'

const API_BASE = 'http://localhost:8000/api/pos'

export default {
  name: 'POSSystem',
  components: { AdminSidebar, AdminHeader, QRCheckInScanner, POSRoomBookingModal },
  data() {
    return {
      sidebarOpen: false, sidebarCollapsed: false,
      isCheckinScannerOpen: false, showTransaction: false, isFullscreen: false,
      auth: useAuthStore(), notifications: useNotificationStore(),
      cart: [], total: 0, receiptNo: 1,
      currentCategory: 'restaurant', paymentMethod: 'Cash',
      searchQuery: '', restaurantTypeFilter: 'all', showMoreFilters: false,
      transactionHistory: [],
      showReceiptCustomizer: false, selectedReceipt: null,
      receiptStyle: {
        headerBg: '#0C3B5E', headerText: '#ffffff', totalBg: '#1F8DBF', totalText: '#ffffff',
        companySize: 20, itemSize: 13, totalSize: 16, fontFamily: "'Courier New', monospace",
        showCompanyName: true, showDateTime: true, showFooter: true,
        companyName: "Eduardo's Resort", receiptTitle: 'Point of Sale'
      },
      categories: [
        { id: 'restaurant', name: 'Restaurant', icon: 'utensils',     items: [] },
        { id: 'rooms',      name: 'Rooms',      icon: 'bed',          items: [] },
        { id: 'cottage',    name: 'Cottage',    icon: 'home',         items: [] },
        { id: 'event',      name: 'Event',      icon: 'calendar-alt', items: [] }
      ],
      viewedTransactions: new Set(JSON.parse(localStorage.getItem('viewedEshopOrders') || '[]')),
      toastMessage: '', toastType: 'success',
      showBookingModal: false, pendingBookingItem: null,
      showTransactionDetails: false, selectedTransaction: null
    }
  },
  computed: {
    userRole() { return this.auth.role || 'staff' },
    visibleCategories() {
      if (this.userRole === 'admin') return this.categories
      if (this.userRole === 'receptionist') return this.categories.filter(c => c.id !== 'restaurant')
      return this.categories.filter(c => c.id === 'restaurant')
    },
    restaurantTypeFilters() {
      const cat = this.categories.find(c => c.id === 'restaurant')
      if (!cat) return []
      return [...new Set(cat.items.map(i => (i.description || '').trim()).filter(Boolean))].sort((a,b)=>a.localeCompare(b,undefined,{sensitivity:'base'}))
    },
    visibleFilters()  { return this.restaurantTypeFilters.slice(0, 5) },
    overflowFilters() { return this.restaurantTypeFilters.slice(5) },
    filteredTransactionHistory() {
      if (this.userRole === 'admin') return this.transactionHistory
      return this.transactionHistory.filter(t => {
        const hasRest = this.hasItemFromCategory(t.items, 'restaurant')
        if (this.userRole === 'restaurantstaff') return hasRest
        if (this.userRole === 'receptionist')    return !hasRest
        return true
      })
    },
    eshopPendingCount() { return this.transactionHistory.filter(t => t.source === 'eshop' && !this.viewedTransactions.has(t.receiptNo)).length },
    groupedRestaurantItems() {
      const cat = this.categories.find(c => c.id === 'restaurant'); if (!cat) return []
      const items = this.searchQuery
        ? cat.items.filter(i => i.name.toLowerCase().includes(this.searchQuery.toLowerCase()))
        : cat.items
      const groups = {}
      items.forEach(item => { const type=(item.description||'').trim(); if (!type) return; if (!groups[type]) groups[type]=[]; groups[type].push(item) })
      return Object.keys(groups).sort().map(type => ({ type, items: groups[type] }))
    },
    uncategorizedRestaurantItems() {
      const cat = this.categories.find(c => c.id === 'restaurant'); if (!cat) return []
      const items = this.searchQuery
        ? cat.items.filter(i => i.name.toLowerCase().includes(this.searchQuery.toLowerCase()))
        : cat.items
      return items.filter(item => !(item.description||'').trim())
    }
  },
  watch: {
    visibleCategories(newCats) { if (!newCats.some(c=>c.id===this.currentCategory)) this.currentCategory=newCats[0]?.id||'' },
    currentCategory(newCat)  { if (newCat !== 'restaurant') this.restaurantTypeFilter='all' },
    eshopPendingCount(n)      { this.notifications.setEshopPending(n) }
  },
  beforeUnmount() {
    document.removeEventListener('keydown', this._fsKeyHandler)
    document.removeEventListener('fullscreenchange', this._fsChangeHandler)
    document.removeEventListener('click', this._outsideClick)
    if (this._pollInterval) clearInterval(this._pollInterval)
    if (this._visibilityHandler) document.removeEventListener('visibilitychange', this._visibilityHandler)
  },
  async mounted() {
    await this.fetchItems(); await this.fetchTransactions(); this.updateReceiptNumber()
    this._pollInterval = setInterval(()=>this.fetchTransactions(), 30000)
    this._visibilityHandler = ()=>{ if(document.visibilityState==='visible') this.fetchTransactions() }
    document.addEventListener('visibilitychange', this._visibilityHandler)
    this._fsKeyHandler   = e=>{ if(e.ctrlKey&&e.key==='F12'){e.preventDefault();this.toggleFullscreen()} }
    this._fsChangeHandler= ()=>{ this.isFullscreen=!!document.fullscreenElement }
    this._outsideClick   = ()=>{ this.showMoreFilters=false }
    document.addEventListener('keydown', this._fsKeyHandler)
    document.addEventListener('fullscreenchange', this._fsChangeHandler)
    document.addEventListener('click', this._outsideClick)
    const saved = localStorage.getItem('receiptStyle')
    if (saved) { try { this.receiptStyle = {...this.receiptStyle,...JSON.parse(saved)} } catch {} }
  },
  methods: {
    toggleFullscreen() { if(!document.fullscreenElement) document.documentElement.requestFullscreen().catch(()=>{}); else document.exitFullscreen().catch(()=>{}) },
    openScanner()       { this.isCheckinScannerOpen=true },
    toggleTransaction() { this.showTransaction=!this.showTransaction },
    async fetchItems() {
      try {
        const res = await axios.get(`${API_BASE}/items`)
        this.categories.forEach(cat => {
          cat.items = res.data.filter(i=>i.category===cat.id).map(i=>({name:i.name,price:parseFloat(i.price),description:i.description||''}))
        })
      } catch { this.showToast('Failed to load items from server','error') }
    },
    async fetchTransactions() {
      try {
        const res = await axios.get(`${API_BASE}/transactions`)
        this.transactionHistory = res.data.map(t => {
          const isEshop = t.receipt_no && String(t.receipt_no).includes('ESHOP')
          return { receiptNo:t.receipt_no, items:t.items, type:t.type, payment:t.payment_method, total:parseFloat(t.total_amount), date:t.transaction_date, time:t.transaction_time, source:t.source||(isEshop?'eshop':'pos'), bookingDetails:t.bookingDetails||[] }
        })
        const current = new Set(this.transactionHistory.map(t=>t.receiptNo))
        this.viewedTransactions = new Set(Array.from(this.viewedTransactions).filter(r=>current.has(r)))
        localStorage.setItem('viewedEshopOrders', JSON.stringify(Array.from(this.viewedTransactions)))
      } catch(e) { console.error(e) }
    },
    updateReceiptNumber() {
      if (!this.transactionHistory.length) { this.receiptNo=1; return }
      const nums = this.transactionHistory.map(t=>parseInt(String(t.receiptNo).replace(/[^\d]/g,''))).filter(n=>n>0)
      this.receiptNo = nums.length ? Math.max(...nums)+1 : 1
    },
    showCategory(id) { if (!this.visibleCategories.some(c=>c.id===id)) return; this.currentCategory=id; this.searchQuery=''; if(id!=='restaurant') this.restaurantTypeFilter='all' },
    getFilteredItems(items, categoryId) {
      let f=[...items]
      if(this.searchQuery) { const q=this.searchQuery.toLowerCase(); f=f.filter(i=>i.name.toLowerCase().includes(q)) }
      if(categoryId==='restaurant'&&this.restaurantTypeFilter!=='all') f=f.filter(i=>(i.description||'').toLowerCase()===this.restaurantTypeFilter.toLowerCase())
      return f
    },
    hasItemFromCategory(transItems, catId) {
      const names=(this.categories.find(c=>c.id===catId)?.items||[]).map(i=>i.name.toLowerCase())
      return transItems.some(t=>names.includes(t.name.toLowerCase()))
    },
    filterItems() {
      if (this.searchQuery) {
        this.restaurantTypeFilter = 'all'
      }
    },
    handleItemClick(name, price, category) {
      if (['rooms','cottage','event'].includes(category)) { this.pendingBookingItem={name,price,category}; this.showBookingModal=true }
      else this.addItem(name, price)
    },
    async handleBookingConfirm(bookingData) {
      try {
        const bookRes = await axios.post('http://localhost:8000/api/bookings/confirm', {
          guest:{ firstName:bookingData.firstName, lastName:bookingData.lastName, phone:bookingData.phone||'', email:bookingData.email||'', address:'', city:'', postal:'', country:'Philippines' },
          checkIn:bookingData.checkIn, checkOut:bookingData.checkOut, isSwimmingOnly:false,
          items:[{ item_id:this.pendingBookingItem.category, name:this.pendingBookingItem.name, category:this.pendingBookingItem.category, qty:1, guests:bookingData.adults+bookingData.children, price:this.pendingBookingItem.price, perNight:true }],
          paymentMethod:'pos-walkin', total:bookingData.lineTotal
        })
        if (!bookRes.data.success) throw new Error(bookRes.data.error||'Failed to create booking')
        const { bookingId, bookingReference } = bookRes.data.data
        await axios.post(`http://localhost:8000/api/bookings/${bookingId}/check-in`, { checked_in_by:this.userRole||'staff', checked_in_time:new Date().toISOString() })
        const payRes = await axios.post('http://localhost:8000/api/paymongo/create-payment-link', { amount:bookingData.lineTotal, description:`Eduardo's Resort - ${bookingReference}`, bookingId, email:bookingData.email||`walkin-${bookingReference}@resort.local`, paymentMethod:'gcash' })
        if (!payRes.data.success) throw new Error('Failed to create payment link')
        const qr = await QRCode.toDataURL(payRes.data.checkout_url, { errorCorrectionLevel:'H', type:'image/png', width:200, margin:1, color:{dark:'#0C3B5E',light:'#FFFFFF'} })
        this.cart.push({ name:this.pendingBookingItem.name, price:bookingData.lineTotal, isBooking:true, bookingId, bookingReference, paymentUrl:payRes.data.checkout_url, paymentQR:qr, ...bookingData })
        this.total += bookingData.lineTotal
        this.showToast(`Booking created! Ref: ${bookingReference}`, 'success')
        this.pendingBookingItem=null
      } catch(err) { this.showToast(err.message||'Failed to create booking','error') }
    },
    addItem(name, price) {
      const ex = this.cart.find(i=>i.name===name&&!i.isBooking)
      if (ex) { ex.qty++; ex.price=ex.unitPrice*ex.qty } else this.cart.push({ name, price, unitPrice:price, qty:1 })
      this.total += price
    },
    removeItem(index) { const i=this.cart[index]; this.total-=i.isBooking?i.price:i.unitPrice*i.qty; this.cart.splice(index,1) },
    clearCart() { if(this.cart.length>0&&confirm('Clear all items?')) { this.cart=[]; this.total=0 } },
    async checkout() {
      if (!this.cart.length) { this.showToast('No items added','error'); return }
      if (isNaN(this.receiptNo)||this.receiptNo<1) this.receiptNo=1
      const now = new Date()
      const trans = {
        receiptNo: String(Math.floor(this.receiptNo)).padStart(3,'0'),
        items: this.cart.map(i=>({ name:i.name, price:i.price, ...(i.isBooking&&{bookingId:i.bookingId,bookingReference:i.bookingReference}) })),
        type:'Walk-in', payment:this.paymentMethod, total:this.total,
        date: now.toISOString().split('T')[0],
        time: now.toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false}),
        bookingDetails: this.cart.filter(i=>i.isBooking).map(i=>({ firstName:i.firstName, lastName:i.lastName, phone:i.phone, email:i.email, roomName:i.name, checkInDate:i.checkIn, checkOutDate:i.checkOut, nights:i.nights, adults:i.adults, children:i.children, bookingReference:i.bookingReference, paymentUrl:i.paymentUrl }))
      }
      try {
        await axios.post(`${API_BASE}/transactions`, { receipt_no:trans.receiptNo, items:trans.items, type:trans.type, payment_method:trans.payment, total_amount:trans.total, transaction_date:trans.date, transaction_time:trans.time })
        if (this.cart.some(i=>i.isBooking)) this.showBookingReceipt(trans)
        this.transactionHistory.unshift(trans); this.receiptNo++
        this.showToast(`Transaction complete! POS-${trans.receiptNo}`,'success')
        this.cart=[]; this.total=0
      } catch { this.showToast('Failed to save transaction','error') }
    },
    showBookingReceipt(trans) {
      const bookings = this.cart.filter(i=>i.isBooking)
      bookings.forEach(async b => {
        try {
          const r = await axios.post('http://localhost:8000/api/pos/print/booking', { receiptNo:`POS-${trans.receiptNo}`, date:trans.date, time:trans.time, guestName:`${b.firstName} ${b.lastName}`, phone:b.phone||'N/A', email:b.email||'N/A', roomName:b.name, checkInDate:b.checkIn, checkOutDate:b.checkOut, nights:b.nights, adults:b.adults, children:b.children, pricePerNight:b.nights?(b.price/b.nights).toFixed(2):'0.00', total:b.price, paymentMethod:this.paymentMethod, bookingReference:b.bookingReference, paymentUrl:b.paymentUrl })
          if (r.data.success) this.showToast(`Receipt printed! Ref: ${b.bookingReference}`,'success')
        } catch {}
      })
    },
    getItemsPreview(items) { const l=items.map(i=>i.name).join(', '); return l.length>35?l.substring(0,35)+'…':l },
    viewDetails(receiptNo) {
      const t=this.transactionHistory.find(x=>x.receiptNo===receiptNo); if(!t) return
      this.viewedTransactions.add(receiptNo)
      localStorage.setItem('viewedEshopOrders', JSON.stringify(Array.from(this.viewedTransactions)))
      this.selectedTransaction=t; this.showTransactionDetails=true
    },
    printReceipt(receiptNo) {
      const t=this.transactionHistory.find(x=>x.receiptNo===receiptNo); if(!t) return
      const hasBookings=t.items.some(i=>i.bookingReference)
      if (hasBookings&&t.bookingDetails?.length) {
        const b=t.bookingDetails[0]
        axios.post('http://localhost:8000/api/pos/print/booking',{ receiptNo:`POS-${t.receiptNo}`, date:t.date, time:t.time, guestName:`${b.firstName} ${b.lastName}`, phone:b.phone||'N/A', email:b.email||'N/A', roomName:b.roomName||'N/A', checkInDate:b.checkInDate||'N/A', checkOutDate:b.checkOutDate||'N/A', nights:b.nights||0, adults:b.adults||0, children:b.children||0, pricePerNight:b.nights?(t.total/b.nights).toFixed(2):'0.00', total:t.total, paymentMethod:t.payment, bookingReference:b.bookingReference })
          .then(r=>{ if(r.data.success) this.showToast(`Receipt sent to printer! Ref: ${b.bookingReference}`,'success'); else this.showToast('Printer service unavailable','error') }).catch(e=>this.showToast(`Print failed: ${e.message}`,'error'))
      } else {
        axios.post('http://localhost:8000/api/pos/print/regular',{ receiptNo:`POS-${t.receiptNo}`, date:t.date, time:t.time, items:t.items.map(i=>({name:i.name,price:parseFloat(i.price),quantity:1,total:parseFloat(i.price)})), total:t.total, paymentMethod:t.payment })
          .then(r=>{ if(r.data.success) this.showToast('Receipt sent to printer!','success'); else this.showToast('Printer service unavailable','error') }).catch(e=>this.showToast(`Print failed: ${e.message}`,'error'))
      }
    },
    async deleteTransaction(receiptNo) {
      if (!confirm('Delete this transaction permanently?')) return
      const idx=this.transactionHistory.findIndex(t=>t.receiptNo===receiptNo); if(idx===-1) return
      try {
        const res=await axios.get(`${API_BASE}/transactions`)
        const be=res.data.find(t=>t.receipt_no===this.transactionHistory[idx].receiptNo)
        if(be) await axios.delete(`${API_BASE}/transactions/${be.id}`)
        this.transactionHistory.splice(idx,1)
      } catch { this.showToast('Failed to delete transaction','error') }
    },
    async clearHistory() {
      if (!confirm('Clear all transaction history?')) return
      try { await axios.delete(`${API_BASE}/transactions`); this.transactionHistory=[] }
      catch { this.showToast('Failed to clear history','error') }
    },
    exportAllTransactions() {
      if (!this.transactionHistory.length) { this.showToast('No transactions to export','error'); return }
      const data = this.transactionHistory.map((t,i) => ({ 'No.':i+1, 'Receipt No.':`POS-${t.receiptNo}`, 'Items':t.items.map(i=>`${i.name} (₱${i.price})`).join('; '), 'Type':t.type, 'Payment Method':t.payment, 'Total':t.total, 'Date':t.date, 'Time':t.time }))
      const wb=XLSX.utils.book_new(); const ws=XLSX.utils.json_to_sheet(data)
      XLSX.utils.book_append_sheet(wb,ws,'Transactions')
      const fn=`POS_Transactions_${new Date().toISOString().split('T')[0]}.xlsx`
      XLSX.writeFile(wb,fn); this.showToast(`Export successful! ${fn}`,'success')
    },
    downloadReceipt(receiptNo) { const t=this.transactionHistory.find(x=>x.receiptNo===receiptNo); if(t) this.printReceipt(receiptNo) },
    customizeReceipt(receiptNo) { this.selectedReceipt=this.transactionHistory.find(x=>x.receiptNo===receiptNo); this.showReceiptCustomizer=true },
    downloadCustomizedReceipt() { if(this.selectedReceipt) this.printReceipt(this.selectedReceipt.receiptNo) },
    saveReceiptStyle() { localStorage.setItem('receiptStyle',JSON.stringify(this.receiptStyle)); this.showToast('Receipt style saved!','success') },
    handleCheckInSuccess() { this.isCheckinScannerOpen=false; this.showToast('Guest checked in successfully','success') },
    showToast(msg,type='success') { this.toastMessage=msg; this.toastType=type; setTimeout(()=>{this.toastMessage=''},4000) }
  }
}
</script>

<style scoped>
/* ── Eduardo's Resort Color Palette ── */
.admin-layout {
  --color-primary:       #0369a1;
  --color-primary-light: #1F8DBF;
  --color-primary-dark:  #1E88B6;
  --color-gold:          #F4C400;
  --color-gold-dark:     #F2C200;
  --color-navy:          #0C3B5E;
  --color-white:         #FFFFFF;
  --color-gray-bg:       #EEF5FB;
  --color-gray-border:   #e5e7eb;
  --color-text-dark:     #1f2937;
  --color-text-light:    #6b7280;
}

@keyframes fadeUp  { from{opacity:0;transform:translateY(6px)}  to{opacity:1;transform:translateY(0)} }
@keyframes slideUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
@keyframes fadeIn  { from{opacity:0}to{opacity:1} }
@keyframes dropIn  { from{opacity:0;transform:translateY(-6px)} to{opacity:1;transform:translateY(0)} }
@keyframes popIn   { from{opacity:0;transform:scale(.95)}       to{opacity:1;transform:scale(1)} }

/* ── Layout ── */
.admin-layout {
  display: flex;
  min-height: 100vh;
  background: var(--color-gray-bg);
  font-family: 'Segoe UI', system-ui, sans-serif;
}
.main-content {
  flex: 1;
  margin-left: 262px;
  padding-top: 64px;
  transition: margin-left .3s ease;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  min-width: 0;
}
.main-content.shifted { margin-left: 72px; }
@media (max-width: 768px) { .main-content { margin-left: 0; } }

.pos-container {
  flex: 1;
  padding: 1.25rem 1.5rem;
  display: flex;
  flex-direction: column;
  min-height: 0;
}
@media (max-width: 768px) { .pos-container { padding: .75rem; } }

/* ── POS grid ── */
.pos-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  animation: fadeUp .25s ease both;
}
.pos-grid {
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 1rem;
  flex: 1;
  min-height: 0;
  /* 64px = AdminHeader, 1.25rem top + 1.25rem bottom = 2.5rem container padding */
  height: calc(100vh - 64px - 2.5rem);
  max-height: calc(100vh - 64px - 2.5rem);
  overflow: hidden;
}
@media (max-width: 900px) { .pos-grid { grid-template-columns: 1fr; height: auto; } }

/* ── Shared panel base ── */
.items-panel, .cart-panel {
  background: var(--color-white);
  border-radius: 20px;
  border: 0.5px solid var(--color-gray-border);
  box-shadow: 0 2px 16px rgba(3,105,161,.08);
  display: flex;
  flex-direction: column;
  min-height: 0;
  height: 100%;        /* fill the full grid cell */
  overflow: hidden;
}

/* ── Panel header (shared) ── */
.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: .9rem 1.2rem;
  border-bottom: 2px solid rgba(244,196,0,.25);
  background: var(--color-navy);
  border-radius: 20px 20px 0 0;
  flex-shrink: 0;
}
.panel-header-left { display: flex; align-items: center; gap: .75rem; }
.panel-icon {
  width: 36px; height: 36px; border-radius: 10px;
  background: rgba(255,255,255,.12);
  display: flex; align-items: center; justify-content: center;
  color: var(--color-gold); font-size: 1rem; flex-shrink: 0;
}
.panel-title { color: var(--color-white); font-size: .95rem; font-weight: 700; }
.panel-sub   { color: rgba(255,255,255,.55); font-size: .72rem; margin-top: 1px; }

/* ── Filter strip ── */
.filter-strip {
  display: flex;
  flex-wrap: wrap;
  gap: .4rem;
  padding: .75rem 1.1rem .6rem;
  border-bottom: 0.5px solid var(--color-gray-border);
  background: #fafcff;
  flex-shrink: 0;
}
.filter-chip {
  padding: .3rem .8rem;
  border-radius: 20px;
  font-size: .75rem;
  font-weight: 600;
  border: 1.5px solid;
  cursor: pointer;
  transition: all .15s;
  white-space: nowrap;
  display: inline-flex; align-items: center;
}
.chip--idle   { background: var(--color-white); color: var(--color-text-dark); border-color: var(--color-gray-border); }
.chip--idle:hover { border-color: var(--color-primary-light); color: var(--color-primary); }
.chip--active { background: var(--color-navy); color: var(--color-white); border-color: var(--color-navy); }
.chip--more   { gap: 4px; }
.more-arrow   { font-size: .65rem; }

.more-wrap { position: relative; display: inline-block; }
.more-dropdown {
  position: absolute; top: calc(100% + 6px); left: 0;
  background: var(--color-white); border: 1.5px solid var(--color-gray-border);
  border-radius: 12px; box-shadow: 0 8px 24px rgba(3,105,161,.14);
  z-index: 500; min-width: 170px; padding: .35rem;
  display: flex; flex-direction: column; gap: 2px;
  animation: dropIn .15s ease;
}
.more-item {
  text-align: left; padding: .45rem .75rem; border-radius: 8px;
  font-size: .8rem; font-weight: 600; color: var(--color-text-dark);
  background: none; border: none; cursor: pointer; transition: background .12s;
}
.more-item:hover       { background: rgba(3,105,161,.07); color: var(--color-primary); }
.more-item--active     { background: rgba(3,105,161,.1); color: var(--color-primary); }

/* ── Items body ── */
.items-body {
  flex: 1; min-height: 0; overflow-y: auto;
  padding: .85rem 1rem 1rem;
  scrollbar-width: thin;
  scrollbar-color: var(--color-gray-border) transparent;
}
.items-body::-webkit-scrollbar { width: 4px; }
.items-body::-webkit-scrollbar-thumb { background: var(--color-gray-border); border-radius: 4px; }

/* ── Item group ── */
.item-group { margin-bottom: 1.5rem; }
.item-group:last-child { margin-bottom: 0; }
.group-header {
  display: flex; align-items: center; gap: .45rem;
  margin-bottom: .6rem; padding-bottom: .45rem;
  border-bottom: 1.5px solid rgba(244,196,0,.25);
}
.group-label {
  font-size: .7rem; font-weight: 800; color: var(--color-navy);
  text-transform: uppercase; letter-spacing: .7px;
}
.group-count {
  font-size: .65rem; font-weight: 700;
  background: rgba(3,105,161,.08); color: var(--color-primary);
  border: 1px solid rgba(3,105,161,.18);
  padding: .1rem .45rem; border-radius: 20px;
}

/* ── Items grid ── */
.items-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: .6rem;
}
@media (max-width: 1100px) { .items-grid { grid-template-columns: repeat(2, 1fr); } }

/* ── Item card ── */
.item-card {
  background: #EEF5FB;
  border: 1.5px solid #c8dff0;
  border-radius: 14px;
  padding: .75rem .85rem;
  cursor: pointer;
  display: flex; flex-direction: column; align-items: flex-start;
  gap: .35rem; min-height: 78px;
  transition: all .18s ease;
  text-align: left;
}
.item-card:hover {
  background: #dbeafe;
  border-color: var(--color-primary-light);
  box-shadow: 0 4px 12px rgba(31,141,191,.18);
  transform: translateY(-2px);
}
.item-card:active { transform: scale(.97); }

.item-card-icon { font-size: .8rem; color: rgba(3,105,161,.3); margin-bottom: .1rem; }
.item-card-name { font-size: .8rem; font-weight: 600; color: var(--color-text-dark); line-height: 1.3; }
.item-card-price { font-size: .92rem; font-weight: 800; color: var(--color-primary); margin-top: auto; }

/* ═══════════════════════════════════
   CART PANEL
═══════════════════════════════════ */
.cart-panel { flex-shrink: 0; }

/* Cart header */
.cart-header {
  display: flex; justify-content: space-between; align-items: center;
  padding: .9rem 1.2rem;
  background: var(--color-navy);
  border-bottom: 3px solid var(--color-gold);
  border-radius: 20px 20px 0 0;
  flex-shrink: 0;
}
.cart-header-left { display: flex; align-items: center; gap: .65rem; }
.cart-header-icon {
  width: 36px; height: 36px; border-radius: 10px;
  background: rgba(244,196,0,.18);
  display: flex; align-items: center; justify-content: center;
  color: var(--color-gold); font-size: 1rem; flex-shrink: 0;
}
.cart-header-title { color: var(--color-white); font-size: .95rem; font-weight: 700; }
.cart-header-sub   { color: rgba(255,255,255,.55); font-size: .72rem; margin-top: 1px; }

.cart-clear-btn {
  width: 32px; height: 32px; border-radius: 8px;
  background: rgba(239,68,68,.18); border: 1px solid rgba(239,68,68,.35);
  color: #fca5a5; font-size: .8rem; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: all .15s;
}
.cart-clear-btn:hover { background: #ef4444; color: var(--color-white); border-color: #ef4444; }

/* Cart items — ONLY this scrolls */
.cart-items-scroll {
  flex: 1; min-height: 0; overflow-y: auto;
  padding: .5rem 1rem;
  scrollbar-width: thin;
  scrollbar-color: var(--color-gray-border) transparent;
}
.cart-items-scroll::-webkit-scrollbar { width: 4px; }
.cart-items-scroll::-webkit-scrollbar-thumb { background: var(--color-gray-border); border-radius: 4px; }

/* Cart empty */
.cart-empty {
  display: flex; flex-direction: column; align-items: center;
  justify-content: center; height: 100%; min-height: 120px;
  text-align: center; gap: .4rem;
}
.cart-empty-icon {
  width: 52px; height: 52px; border-radius: 50%;
  background: var(--color-gray-bg);
  display: flex; align-items: center; justify-content: center;
  margin-bottom: .35rem;
}
.cart-empty-icon i { font-size: 1.3rem; color: #c1c8d0; }
.cart-empty p    { font-size: .85rem; font-weight: 600; color: #64748b; margin: 0; }
.cart-empty span { font-size: .72rem; color: var(--color-text-light); }

/* Cart rows */
.cart-list { display: flex; flex-direction: column; gap: 1px; }
.cart-row {
  display: flex; justify-content: space-between; align-items: center;
  padding: .55rem .25rem; gap: .5rem;
  border-bottom: 0.5px solid #f1f5f9;
  transition: background .12s;
  border-radius: 8px;
}
.cart-row:hover { background: #f0f6fb; }
.cart-row:last-child { border-bottom: none; }

.cart-row-left  { flex: 1; min-width: 0; }
.cart-row-name  { font-size: .8rem; font-weight: 600; color: var(--color-text-dark); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.cart-row-qty   { font-size: .7rem; color: var(--color-text-light); margin-top: 1px; }
.cart-row-meta  { display: flex; flex-direction: column; gap: 1px; margin-top: 2px; }
.cart-row-meta span { font-size: .68rem; color: var(--color-text-light); display: flex; align-items: center; gap: 4px; }
.cart-row-meta i    { color: #c1c8d0; width: 10px; }

.cart-row-right { display: flex; align-items: center; gap: .4rem; flex-shrink: 0; }
.cart-row-price { font-size: .82rem; font-weight: 700; color: var(--color-text-dark); white-space: nowrap; }
.cart-row-remove {
  width: 20px; height: 20px; border-radius: 50%;
  background: #fee2e2; border: none; color: #ef4444;
  font-size: .6rem; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: all .12s; flex-shrink: 0;
}
.cart-row-remove:hover { background: #ef4444; color: var(--color-white); }

/* ── COMPACT CART FOOTER — always pinned, never scrolls ── */
.cart-footer {
  flex-shrink: 0;
  padding: .55rem .9rem .7rem;
  border-top: 2px solid rgba(244,196,0,.3);
  display: flex; flex-direction: column; gap: .42rem;
  background: var(--color-white);
}

.total-bar   { display: flex; justify-content: space-between; align-items: center; }
.total-label { font-size: .65rem; font-weight: 700; color: var(--color-text-light); text-transform: uppercase; letter-spacing: .5px; }
.total-amount{ font-size: 1.2rem; font-weight: 800; color: var(--color-navy); line-height: 1; }

.payment-section { display: flex; flex-direction: column; }
.payment-label {
  font-size: .62rem; font-weight: 700; color: var(--color-text-light);
  text-transform: uppercase; letter-spacing: .4px;
  display: flex; align-items: center; gap: .3rem; margin-bottom: .3rem;
}
.payment-btns { display: flex; gap: .4rem; }
.pay-btn {
  flex: 1; padding: .36rem .3rem; border: 1.5px solid var(--color-gray-border);
  border-radius: 8px; background: var(--color-gray-bg);
  font-size: .72rem; font-weight: 600; color: var(--color-text-light);
  cursor: pointer; display: flex; align-items: center; justify-content: center; gap: .28rem;
  transition: all .15s; white-space: nowrap;
}
.pay-btn:hover { border-color: var(--color-primary-light); color: var(--color-primary); background: rgba(31,141,191,.05); }
.pay-btn--gcash { background: #f0fdf4; border-color: #22c55e; color: #16a34a; }
.pay-btn--cash  { background: rgba(244,196,0,.1); border-color: var(--color-gold-dark); color: #7a5200; }
.pay-check { font-size: .65rem; }

/* Checkout button */
.checkout-btn {
  width: 100%; padding: .62rem;
  background: var(--color-navy); color: var(--color-white);
  border: none; border-radius: 10px;
  font-size: .82rem; font-weight: 700; cursor: pointer;
  display: flex; align-items: center; justify-content: center; gap: .42rem;
  box-shadow: 0 3px 10px rgba(12,59,94,.25);
  transition: all .18s ease;
}
.checkout-btn:hover { background: var(--color-primary); box-shadow: 0 5px 16px rgba(3,105,161,.35); transform: translateY(-1px); }
.checkout-btn .checkout-amount {
  margin-left: auto;
  font-size: .72rem;
  background: rgba(255,255,255,.15);
  padding: 2px 8px; border-radius: 20px;
}

/* Search no-results state */
.items-no-results {
  display: flex; flex-direction: column; align-items: center;
  justify-content: center; gap: .5rem;
  padding: 3rem 1rem; text-align: center;
  border: 2px dashed rgba(244,196,0,.35);
  border-radius: 14px; background: rgba(244,196,0,.02);
  margin: .5rem 0;
}
.items-no-results i { font-size: 1.4rem; color: #c1c8d0; }
.items-no-results p { font-size: .85rem; color: var(--color-text-light); margin: 0; }
.items-no-results strong { color: var(--color-text-dark); }

/* ═══════════════════════════════════
   TRANSACTION SECTION
═══════════════════════════════════ */
.trans-section {
  background: var(--color-white);
  border-radius: 20px;
  border: 0.5px solid var(--color-gray-border);
  box-shadow: 0 2px 16px rgba(3,105,161,.08);
  overflow: hidden;
  flex: 1;
  animation: fadeUp .25s ease both;
}

.trans-header {
  display: flex; justify-content: space-between; align-items: center;
  flex-wrap: wrap; gap: .75rem;
  padding: 1.1rem 1.5rem;
  background: var(--color-navy);
  border-bottom: 3px solid var(--color-gold);
}
.trans-header-left { display: flex; align-items: center; gap: .75rem; }
.trans-actions     { display: flex; gap: .5rem; flex-wrap: wrap; }

.btn-export {
  display: inline-flex; align-items: center; gap: .4rem;
  padding: .45rem 1rem; border-radius: 10px;
  font-size: .8rem; font-weight: 600; cursor: pointer;
  background: rgba(34,197,94,.15); color: #86efac;
  border: 1px solid rgba(34,197,94,.3); transition: all .15s;
}
.btn-export:hover { background: #22c55e; color: var(--color-white); border-color: #22c55e; }

.btn-danger-outline {
  display: inline-flex; align-items: center; gap: .4rem;
  padding: .45rem 1rem; border-radius: 10px;
  font-size: .8rem; font-weight: 600; cursor: pointer;
  background: rgba(239,68,68,.15); color: #fca5a5;
  border: 1px solid rgba(239,68,68,.3); transition: all .15s;
}
.btn-danger-outline:hover { background: #ef4444; color: var(--color-white); border-color: #ef4444; }

.trans-table-wrap { overflow-x: auto; padding: 0 1.25rem 1.25rem; }
.trans-table { width: 100%; border-collapse: collapse; font-size: .875rem; }

.trans-table thead th {
  padding: .8rem .9rem; text-align: left;
  font-size: .68rem; font-weight: 700; color: var(--color-text-light);
  text-transform: uppercase; letter-spacing: .6px;
  background: var(--color-gray-bg);
  border-bottom: 2px solid rgba(244,196,0,.25);
}
.trans-table thead th:first-child { border-radius: 10px 0 0 0; }
.trans-table thead th:last-child  { border-radius: 0 10px 0 0; }
.text-center { text-align: center; }

.trans-row { border-bottom: 0.5px solid var(--color-gray-border); transition: background .12s; }
.trans-row:hover { background: rgba(3,105,161,.03); }
.trans-row:last-child { border-bottom: none; }
.trans-row--new { background: rgba(244,196,0,.05); border-left: 3px solid var(--color-gold); }

.trans-table td { padding: .8rem .9rem; color: var(--color-text-dark); vertical-align: middle; }

/* Trans table cells */
.receipt-cell { display: flex; align-items: center; gap: .4rem; flex-wrap: wrap; }
.receipt-no   { font-weight: 700; color: var(--color-primary); font-family: monospace; }
.new-badge    { background: var(--color-gold); color: #5a3e00; font-size: .65rem; font-weight: 800; padding: 2px 7px; border-radius: 5px; }

.items-preview { font-size: .82rem; color: var(--color-text-dark); }
.view-btn {
  background: none; border: none; cursor: pointer;
  color: var(--color-primary-light); font-size: .72rem; font-weight: 600;
  margin-top: 3px; display: inline-flex; align-items: center; gap: 4px;
  padding: 0; transition: color .12s;
}
.view-btn:hover { color: var(--color-primary); text-decoration: underline; }

.type-pill { font-size: .75rem; font-weight: 600; color: var(--color-text-light); }

.pay-badge {
  display: inline-flex; align-items: center;
  padding: 3px 10px; border-radius: 20px;
  font-size: .72rem; font-weight: 600;
}
.pay-badge--gcash { background: rgba(22,163,74,.1);  color: #15803d; border: 1px solid rgba(22,163,74,.25); }
.pay-badge--cash  { background: rgba(244,196,0,.12); color: #7a5200; border: 1px solid rgba(244,196,0,.3); }

.amount-cell { font-weight: 700; color: var(--color-text-dark); }
.date-cell   { font-size: .82rem; color: var(--color-text-dark); }
.time-cell   { font-size: .72rem; color: var(--color-text-light); margin-top: 1px; }

.tbl-acts { display: flex; gap: 4px; justify-content: center; }
.tbl-btn {
  width: 30px; height: 30px; border-radius: 8px;
  border: 1px solid var(--color-gray-border); background: var(--color-white);
  font-size: .75rem; cursor: pointer;
  display: inline-flex; align-items: center; justify-content: center;
  transition: all .15s;
}
.tbl-btn:hover { transform: translateY(-1px); }
.tbl-btn--print { color: var(--color-primary-light); }
.tbl-btn--print:hover { background: var(--color-primary-light); color: var(--color-white); border-color: var(--color-primary-light); }
.tbl-btn--dl  { color: var(--color-primary); }
.tbl-btn--dl:hover  { background: var(--color-primary); color: var(--color-white); border-color: var(--color-primary); }
.tbl-btn--cust{ color: #8b5cf6; }
.tbl-btn--cust:hover { background: #8b5cf6; color: var(--color-white); border-color: #8b5cf6; }
.tbl-btn--del { color: #ef4444; }
.tbl-btn--del:hover  { background: #ef4444; color: var(--color-white); border-color: #ef4444; }

/* Trans empty */
.trans-empty {
  display: flex; flex-direction: column; align-items: center;
  gap: .6rem; padding: 3.5rem; text-align: center;
}
.empty-icon-wrap { width: 56px; height: 56px; border-radius: 14px; background: rgba(3,105,161,.08); color: var(--color-primary-light); display: flex; align-items: center; justify-content: center; font-size: 1.4rem; }
.empty-title { font-size: .9rem; font-weight: 700; color: var(--color-text-dark); margin: 0; }
.empty-sub   { font-size: .78rem; color: var(--color-text-light); margin: 0; }

/* ═══════════════════════════════════
   MODALS
═══════════════════════════════════ */
.modal-overlay {
  position: fixed; inset: 0;
  background: rgba(12,59,94,.55); backdrop-filter: blur(6px);
  display: flex; align-items: center; justify-content: center;
  z-index: 1000; padding: 1rem;
  animation: fadeIn .2s ease;
}
.modal-box {
  background: var(--color-white); border-radius: 20px;
  width: 100%; max-width: 520px; max-height: 90vh; overflow-y: auto;
  box-shadow: 0 24px 60px rgba(12,59,94,.22);
  animation: popIn .22s ease;
}

.modal-head {
  display: flex; justify-content: space-between; align-items: center;
  padding: 1.1rem 1.4rem;
  background: var(--color-navy);
  border-radius: 20px 20px 0 0;
  border-bottom: 3px solid var(--color-gold);
  flex-shrink: 0;
}
.modal-head-left { display: flex; align-items: center; gap: .8rem; }
.modal-head-icon {
  width: 40px; height: 40px; border-radius: 12px;
  background: rgba(255,255,255,.12);
  display: flex; align-items: center; justify-content: center;
  font-size: 1rem; color: var(--color-white); flex-shrink: 0;
}
.modal-head-icon--gold { background: rgba(244,196,0,.2); color: var(--color-gold); }
.modal-title { font-size: 1rem; font-weight: 700; color: var(--color-white); margin: 0; }
.modal-sub   { font-size: .72rem; color: rgba(255,255,255,.6); margin: 2px 0 0; }
.modal-close-btn {
  width: 32px; height: 32px; border-radius: 10px;
  background: rgba(255,255,255,.12); border: 1px solid rgba(255,255,255,.2);
  color: var(--color-white); font-size: .85rem; cursor: pointer;
  display: flex; align-items: center; justify-content: center; transition: background .15s;
}
.modal-close-btn:hover { background: rgba(255,255,255,.28); }

.modal-body { padding: 1.25rem 1.4rem; display: flex; flex-direction: column; gap: 1rem; }

.modal-section {
  background: var(--color-gray-bg);
  border: 0.5px solid var(--color-gray-border);
  border-radius: 14px; padding: 1rem;
}
.modal-section-title {
  font-size: .78rem; font-weight: 700; color: var(--color-navy);
  text-transform: uppercase; letter-spacing: .4px;
  margin: 0 0 .85rem; display: flex; align-items: center; gap: .4rem;
}
.modal-section-title i { color: var(--color-primary-light); }

.form-row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: .75rem; }
.form-group { display: flex; flex-direction: column; gap: .35rem; }
.form-label { font-size: .68rem; font-weight: 700; color: var(--color-text-light); text-transform: uppercase; letter-spacing: .4px; }
.form-input {
  width: 100%; padding: .6rem .85rem;
  border: 1.5px solid var(--color-gray-border); border-radius: 10px;
  font-size: .875rem; color: var(--color-text-dark);
  background: var(--color-white); transition: all .15s; box-sizing: border-box;
}
.form-input:focus { outline: none; border-color: var(--color-primary-light); box-shadow: 0 0 0 3px rgba(31,141,191,.1); }
.font-mono { font-family: monospace; font-size: .8rem; }

.color-row { display: flex; gap: .5rem; align-items: center; }
.color-swatch { width: 40px; height: 36px; border-radius: 8px; border: 1.5px solid var(--color-gray-border); cursor: pointer; padding: 2px; flex-shrink: 0; }

/* Detail rows (inside modal) */
.detail-grid    { display: flex; flex-direction: column; gap: .4rem; }
.detail-row {
  display: flex; justify-content: space-between; align-items: center;
  padding: .4rem 0; border-bottom: 0.5px solid var(--color-gray-border); font-size: .875rem;
}
.detail-row:last-child { border-bottom: none; }
.detail-row--total { padding-top: .6rem; border-top: 1px solid var(--color-gray-border); border-bottom: none; }
.detail-key   { color: var(--color-text-light); }
.detail-val   { font-weight: 600; color: var(--color-text-dark); }
.detail-total { font-size: 1.2rem; font-weight: 800; color: var(--color-primary); }

/* Items detail */
.items-detail-list { display: flex; flex-direction: column; gap: .45rem; }
.items-detail-row {
  display: flex; justify-content: space-between; align-items: flex-start;
  padding: .65rem .85rem;
  background: var(--color-white); border-radius: 10px;
  border: 0.5px solid var(--color-gray-border);
  border-left: 3px solid var(--color-gold);
}
.items-detail-left  { flex: 1; }
.items-detail-name  { font-weight: 600; color: var(--color-text-dark); font-size: .875rem; }
.items-detail-ref   { font-size: .7rem; color: var(--color-text-light); margin-top: 2px; display: flex; align-items: center; gap: 4px; }
.items-detail-ref i { color: var(--color-primary-light); }
.items-detail-price { font-weight: 700; color: var(--color-primary); font-size: .875rem; margin-left: .75rem; flex-shrink: 0; }

.modal-foot {
  display: flex; gap: .55rem; justify-content: flex-end;
  padding: 1rem 1.4rem;
  border-top: 1px solid var(--color-gray-border);
  background: var(--color-gray-bg);
  border-radius: 0 0 20px 20px;
}
.btn-cancel {
  padding: .5rem 1.1rem; border-radius: 10px;
  background: var(--color-white); color: var(--color-text-light);
  border: 1.5px solid var(--color-gray-border);
  font-size: .875rem; font-weight: 600; cursor: pointer; transition: all .15s;
}
.btn-cancel:hover { border-color: var(--color-primary-light); color: var(--color-primary); }
.btn-action {
  padding: .5rem 1.1rem; border-radius: 10px;
  font-size: .875rem; font-weight: 700; cursor: pointer;
  border: none; display: inline-flex; align-items: center; gap: .4rem; transition: all .15s;
}
.btn-action--green   { background: #22c55e; color: var(--color-white); }
.btn-action--green:hover  { background: #16a34a; }
.btn-action--primary { background: var(--color-navy); color: var(--color-white); }
.btn-action--primary:hover { background: var(--color-primary); }
.btn-action--primary i { color: var(--color-gold); }

/* ── Toast ── */
.toast {
  position: fixed; bottom: 2rem; right: 2rem;
  display: flex; align-items: center; gap: .6rem;
  padding: .8rem 1.3rem; border-radius: 14px;
  font-size: .875rem; font-weight: 600;
  color: var(--color-white);
  box-shadow: 0 8px 28px rgba(0,0,0,.18);
  z-index: 9999;
}
.toast--success { background: #16a34a; }
.toast--error   { background: #dc2626; }
.toast-enter-active, .toast-leave-active { transition: all .28s ease; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateY(10px); }

/* ── Fullscreen ── */
.pos-fullscreen .main-content { margin-left: 0 !important; padding: 0 !important; }
.pos-fullscreen .pos-container { padding: .65rem !important; flex: 1; display: flex; flex-direction: column; }
.pos-fullscreen .pos-section   { flex: 1; display: flex; flex-direction: column; }
.pos-fullscreen .pos-grid      { flex: 1; height: auto; min-height: 0; }
</style>