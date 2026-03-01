<template>
  <div class="admin-layout">
    <!-- Sidebar -->
    <AdminSidebar 
      :is-open="sidebarOpen"
      :is-collapsed="sidebarCollapsed"
      @close="sidebarOpen = false"
    />

    <!-- Main Content -->
    <main 
      class="main-content"
      :class="{ shifted: sidebarCollapsed }"
    >
      <div class="header-container">
        <AdminHeader
          title="Point of Sale"
          subtitle="Walk-in Payments"
          :has-notifications="eshopPendingCount > 0"
          :pending-count="eshopPendingCount"
          @toggle-sidebar="sidebarOpen = !sidebarOpen"
        />
      </div>

      <div class="pos-container">

        <!-- POS GRID -->
        <div class="pos-grid">

          <!-- ITEMS PANEL -->
          <div class="pos-card items-card">
            <div class="pos-card-header">
              <div class="pos-card-header-left">
                <div class="pos-icon-wrap icon-blue">
                  <i class="fas fa-shopping-cart"></i>
                </div>
                <div>
                  <h2 class="pos-card-title">Services / Items</h2>
                  <p class="pos-card-sub">Select items to add to cart</p>
                </div>
              </div>
              <div class="category-switch">
                <button 
                  v-for="category in visibleCategories" 
                  :key="category.id"
                  @click="showCategory(category.id)" 
                  :id="`btn-${category.id}`" 
                  :class="['category-btn', currentCategory === category.id ? 'category-btn--active' : '']"
                >
                  <i :class="`fas fa-${category.icon}`"></i>{{ category.name }}
                </button>
              </div>
            </div>

            <div class="items-body">
              <!-- Search -->
              <div class="search-wrap">
                <i class="fas fa-search search-icon"></i>
                <input 
                  type="text" 
                  v-model="searchQuery" 
                  @input="filterItems"
                  placeholder="Search items..." 
                  class="search-input"
                >
              </div>

              <!-- Restaurant Type Filters -->
              <div
                v-if="currentCategory === 'restaurant' && restaurantTypeFilters.length > 0"
                class="filter-wrap"
              >
                <span class="filter-label">Filter Menu</span>
                <div class="filter-chips">
                  <button type="button" @click="restaurantTypeFilter = 'all'" :class="['chip', restaurantTypeFilter === 'all' ? 'chip--active' : '']">All</button>
                  <button
                    v-for="filter in restaurantTypeFilters"
                    :key="filter"
                    type="button"
                    @click="restaurantTypeFilter = filter"
                    :class="['chip', restaurantTypeFilter === filter ? 'chip--active' : '']"
                  >{{ filter }}</button>
                </div>
              </div>

              <!-- Items Grid -->
              <div class="items-scroll">
                <div 
                  v-for="category in visibleCategories" 
                  :key="`items-${category.id}`"
                  v-show="currentCategory === category.id"
                  class="items-grid"
                >
                  <button 
                    v-for="item in getFilteredItems(category.items, category.id)" 
                    :key="item.name"
                    @click="addItem(item.name, item.price)" 
                    class="item-btn"
                  >
                    <div class="item-name">{{ item.name }}</div>
                    <div class="item-price">&#8369;{{ item.price.toLocaleString() }}</div>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- CART PANEL -->
          <div class="pos-card cart-card">
            <div class="pos-card-header">
              <div class="pos-card-header-left">
                <div class="pos-icon-wrap icon-yellow">
                  <i class="fas fa-receipt"></i>
                </div>
                <div>
                  <h2 class="pos-card-title">Current Transaction</h2>
                  <p class="pos-card-sub">{{ cart.length }} item{{ cart.length !== 1 ? 's' : '' }} added</p>
                </div>
              </div>
              <button @click="clearCart" class="clear-cart-btn">
                <i class="fas fa-trash"></i> Clear
              </button>
            </div>

            <div class="cart-body">
              <!-- Cart Items -->
              <div class="cart-items-area">
                <div v-if="cart.length === 0" class="cart-empty">
                  <i class="fas fa-shopping-basket"></i>
                  <p>No items added yet</p>
                </div>
                <div 
                  v-else
                  v-for="(item, index) in cart" 
                  :key="index"
                  class="cart-item"
                >
                  <span class="cart-item-name">{{ item.name }}</span>
                  <div class="cart-item-right">
                    <span class="cart-item-price">&#8369;{{ item.price.toLocaleString() }}</span>
                    <button @click="removeItem(index)" class="remove-item-btn">
                      <i class="fas fa-times-circle"></i>
                    </button>
                  </div>
                </div>
              </div>

              <!-- Cart Bottom -->
              <div class="cart-bottom">
                <div class="total-panel">
                  <span class="total-label">Total</span>
                  <span class="total-amount">&#8369;{{ total.toLocaleString() }}</span>
                </div>

                <div class="payment-wrap">
                  <label class="payment-label">
                    <i class="fas fa-credit-card"></i> Payment Method
                  </label>
                  <div class="payment-btns">
                    <button
                      type="button"
                      :class="['pay-method-btn', paymentMethod === 'GCash' ? 'pay-method-btn--gcash' : '']"
                      @click="paymentMethod = 'GCash'"
                    >
                      <i class="fas fa-wallet"></i> GCash
                      <i v-if="paymentMethod === 'GCash'" class="fas fa-check-circle pay-check"></i>
                    </button>
                    <button
                      type="button"
                      :class="['pay-method-btn', paymentMethod === 'Cash' ? 'pay-method-btn--cash' : '']"
                      @click="paymentMethod = 'Cash'"
                    >
                      <i class="fas fa-money-bill-wave"></i> Cash
                      <i v-if="paymentMethod === 'Cash'" class="fas fa-check-circle pay-check"></i>
                    </button>
                  </div>
                </div>

                <button @click="checkout" class="checkout-btn">
                  <i class="fas fa-check-circle"></i> Pay &amp; Complete
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- TRANSACTIONS TABLE -->
        <div class="pos-card transactions-card">
          <div class="pos-card-header">
            <div class="pos-card-header-left">
              <div class="pos-icon-wrap icon-blue">
                <i class="fas fa-history"></i>
              </div>
              <div>
                <h2 class="pos-card-title">Recent POS Transactions</h2>
                <p class="pos-card-sub">{{ filteredTransactionHistory.length }} record{{ filteredTransactionHistory.length !== 1 ? 's' : '' }}</p>
              </div>
            </div>
            <div class="trans-header-actions">
              <button @click="exportAllTransactions" class="trans-action-btn trans-action-btn--export">
                <i class="fas fa-file-excel"></i> Export
              </button>
              <button @click="clearHistory" class="trans-action-btn trans-action-btn--clear">
                <i class="fas fa-trash"></i> Clear History
              </button>
            </div>
          </div>

          <div class="table-wrap">
            <table class="pos-table">
              <thead>
                <tr>
                  <th>Receipt</th>
                  <th>Items</th>
                  <th>Type</th>
                  <th>Payment</th>
                  <th>Amount</th>
                  <th>Date &amp; Time</th>
                  <th style="text-align:center">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="filteredTransactionHistory.length === 0">
                  <td colspan="7">
                    <div class="table-empty">
                      <i class="fas fa-inbox"></i>
                      <span>No transactions yet</span>
                    </div>
                  </td>
                </tr>
                <tr 
                  v-else
                  v-for="(trans, index) in filteredTransactionHistory" 
                  :key="trans.receiptNo"
                  :class="['table-row', trans.source === 'eshop' && !viewedTransactions.has(trans.receiptNo) ? 'table-row--new' : '']"
                >
                  <td class="receipt-cell">
                    <span class="receipt-no">POS-{{ trans.receiptNo }}</span>
                    <span 
                      v-if="trans.source === 'eshop' && !viewedTransactions.has(trans.receiptNo)"
                      class="new-badge"
                    ><i class="fas fa-star"></i> NEW</span>
                  </td>
                  <td class="items-cell">
                    <div class="items-preview">{{ getItemsPreview(trans.items) }}</div>
                    <button @click="viewDetails(trans.receiptNo)" class="view-details-btn">
                      <i class="fas fa-eye"></i> View Details
                    </button>
                  </td>
                  <td class="type-cell">{{ trans.type }}</td>
                  <td>
                    <span :class="['payment-badge', trans.payment === 'GCash' ? 'payment-badge--gcash' : 'payment-badge--cash']">
                      {{ trans.payment }}
                    </span>
                  </td>
                  <td class="amount-cell">&#8369;{{ trans.total.toLocaleString() }}</td>
                  <td class="date-cell">
                    {{ trans.date }}
                    <span class="time-sub">{{ trans.time }}</span>
                  </td>
                  <td class="actions-cell">
                    <button @click="printReceipt(trans.receiptNo)"     class="tbl-btn tbl-btn--print"     title="Print"><i class="fas fa-print"></i></button>
                    <button @click="downloadReceipt(trans.receiptNo)"  class="tbl-btn tbl-btn--download"  title="Download"><i class="fas fa-download"></i></button>
                    <button @click="customizeReceipt(trans.receiptNo)" class="tbl-btn tbl-btn--customize" title="Customize"><i class="fas fa-palette"></i></button>
                    <button @click="deleteTransaction(trans.receiptNo)"class="tbl-btn tbl-btn--delete"    title="Delete"><i class="fas fa-trash"></i></button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- RECEIPT CUSTOMIZATION MODAL -->
      <div v-if="showReceiptCustomizer" class="modal-overlay" @click="showReceiptCustomizer = false">
        <div class="modal-box" @click.stop>
          <div class="modal-head">
            <div>
              <h3 class="modal-title"><i class="fas fa-palette"></i> Customize Receipt</h3>
              <p class="modal-sub">POS-{{ selectedReceipt?.receiptNo }}</p>
            </div>
            <button @click="showReceiptCustomizer = false" class="modal-close"><i class="fas fa-times"></i></button>
          </div>

          <div class="modal-body">
            <!-- Colors -->
            <div class="modal-section">
              <h4 class="modal-section-title"><i class="fas fa-paint-brush"></i> Colors</h4>
              <div class="modal-grid-2">
                <div class="form-group">
                  <label class="form-label">Header Background</label>
                  <div class="color-row">
                    <input type="color" v-model="receiptStyle.headerBg" class="color-swatch">
                    <input type="text"  v-model="receiptStyle.headerBg" class="form-input mono">
                  </div>
                </div>
                <div class="form-group">
                  <label class="form-label">Header Text</label>
                  <div class="color-row">
                    <input type="color" v-model="receiptStyle.headerText" class="color-swatch">
                    <input type="text"  v-model="receiptStyle.headerText" class="form-input mono">
                  </div>
                </div>
                <div class="form-group">
                  <label class="form-label">Total Background</label>
                  <div class="color-row">
                    <input type="color" v-model="receiptStyle.totalBg" class="color-swatch">
                    <input type="text"  v-model="receiptStyle.totalBg" class="form-input mono">
                  </div>
                </div>
                <div class="form-group">
                  <label class="form-label">Total Text</label>
                  <div class="color-row">
                    <input type="color" v-model="receiptStyle.totalText" class="color-swatch">
                    <input type="text"  v-model="receiptStyle.totalText" class="form-input mono">
                  </div>
                </div>
              </div>
            </div>

            <!-- Typography -->
            <div class="modal-section">
              <h4 class="modal-section-title"><i class="fas fa-font"></i> Typography</h4>
              <div class="modal-grid-2">
                <div class="form-group">
                  <label class="form-label">Company Name Size</label>
                  <input type="number" v-model.number="receiptStyle.companySize" min="12" max="32" class="form-input">
                </div>
                <div class="form-group">
                  <label class="form-label">Item Font Size</label>
                  <input type="number" v-model.number="receiptStyle.itemSize" min="10" max="16" class="form-input">
                </div>
                <div class="form-group">
                  <label class="form-label">Total Font Size</label>
                  <input type="number" v-model.number="receiptStyle.totalSize" min="14" max="28" class="form-input">
                </div>
                <div class="form-group">
                  <label class="form-label">Font Family</label>
                  <select v-model="receiptStyle.fontFamily" class="form-input">
                    <option value="'Courier New', monospace">Courier New (Default)</option>
                    <option value="'Arial', sans-serif">Arial</option>
                    <option value="'Times New Roman', serif">Times New Roman</option>
                    <option value="'Verdana', sans-serif">Verdana</option>
                  </select>
                </div>
              </div>
            </div>

            <!-- Content -->
            <div class="modal-section">
              <h4 class="modal-section-title"><i class="fas fa-file-alt"></i> Content</h4>
              <div class="modal-checks">
                <label class="check-row"><input type="checkbox" v-model="receiptStyle.showCompanyName" class="check-input"><span>Show Company Name</span></label>
                <label class="check-row"><input type="checkbox" v-model="receiptStyle.showDateTime"    class="check-input"><span>Show Date &amp; Time</span></label>
                <label class="check-row"><input type="checkbox" v-model="receiptStyle.showFooter"      class="check-input"><span>Show Footer Message</span></label>
              </div>
              <div class="modal-grid-2" style="margin-top:1rem">
                <div class="form-group">
                  <label class="form-label">Company Name</label>
                  <input type="text" v-model="receiptStyle.companyName" placeholder="ReserVision" class="form-input">
                </div>
                <div class="form-group">
                  <label class="form-label">Receipt Title</label>
                  <input type="text" v-model="receiptStyle.receiptTitle" placeholder="Point of Sale" class="form-input">
                </div>
              </div>
            </div>

            <!-- Preview -->
            <div class="modal-section">
              <h4 class="modal-section-title"><i class="fas fa-eye"></i> Preview</h4>
              <div class="receipt-preview" :style="{ fontFamily: receiptStyle.fontFamily }">
                <div v-if="receiptStyle.showCompanyName" class="rp-header" :style="{ backgroundColor: receiptStyle.headerBg, color: receiptStyle.headerText }">
                  <div :style="{ fontSize: receiptStyle.companySize + 'px' }"><strong>{{ receiptStyle.companyName }}</strong></div>
                  <div style="font-size:12px">{{ receiptStyle.receiptTitle }}</div>
                </div>
                <div class="rp-body" :style="{ fontSize: receiptStyle.itemSize + 'px' }">
                  <div class="rp-item">Sample Item 1 <span>&#8369;500.00</span></div>
                  <div class="rp-item">Sample Item 2 <span>&#8369;500.00</span></div>
                </div>
                <div class="rp-total" :style="{ fontSize: receiptStyle.totalSize + 'px', backgroundColor: receiptStyle.totalBg, color: receiptStyle.totalText }">
                  TOTAL: &#8369;1,000.00
                </div>
              </div>
            </div>
          </div>

          <div class="modal-foot">
            <button @click="showReceiptCustomizer = false" class="modal-btn modal-btn--cancel">Cancel</button>
            <button @click="downloadCustomizedReceipt"    class="modal-btn modal-btn--download"><i class="fas fa-download"></i> Download</button>
            <button @click="saveReceiptStyle"             class="modal-btn modal-btn--save"><i class="fas fa-save"></i> Save Style</button>
          </div>
        </div>
      </div>

    </main>
  </div>
</template>

<script>
import AdminSidebar from '../../components/Admin/AdminSidebar.vue';
import AdminHeader from '../../components/admin/AdminHeader.vue';
import { useAuthStore } from '../../stores/auth';
import { useNotificationStore } from '../../stores/notifications';
import axios from 'axios';

const API_BASE = 'http://localhost:8000/api/pos';

export default {
  name: 'POSSystem',
  components: { AdminSidebar, AdminHeader },
  data() {
    return {
      sidebarOpen: false,
      sidebarCollapsed: false,
      auth: useAuthStore(),
      notifications: useNotificationStore(),
      cart: [],
      total: 0,
      receiptNo: 1,
      currentCategory: 'restaurant',
      paymentMethod: 'Cash',
      searchQuery: '',
      restaurantTypeFilter: 'all',
      transactionHistory: [],
      showReceiptCustomizer: false,
      selectedReceipt: null,
      receiptStyle: {
        headerBg: '#1E88B6',
        headerText: '#ffffff',
        totalBg: '#1F8DBF',
        totalText: '#ffffff',
        companySize: 20,
        itemSize: 13,
        totalSize: 16,
        fontFamily: "'Courier New', monospace",
        showCompanyName: true,
        showDateTime: true,
        showFooter: true,
        companyName: 'ReserVision',
        receiptTitle: 'Point of Sale'
      },
      categories: [
        { id: 'restaurant', name: 'Restaurant', icon: 'utensils',     items: [] },
        { id: 'rooms',      name: 'Rooms',      icon: 'bed',          items: [] },
        { id: 'cottage',    name: 'Cottage',    icon: 'home',         items: [] },
        { id: 'event',      name: 'Event',      icon: 'calendar-alt', items: [] }
      ],
      viewedTransactions: new Set(JSON.parse(localStorage.getItem('viewedEshopOrders') || '[]'))
    };
  },
  computed: {
    userRole() { return this.auth.role || 'staff'; },
    visibleCategories() {
      if (this.userRole === 'admin') return this.categories;
      if (this.userRole === 'receptionist') return this.categories.filter(c => c.id !== 'restaurant');
      return this.categories.filter(c => c.id === 'restaurant');
    },
    restaurantTypeFilters() {
      const cat = this.categories.find(c => c.id === 'restaurant');
      if (!cat) return [];
      return [...new Set(cat.items.map(i => (i.description || '').trim()).filter(Boolean))]
        .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
    },
    filteredTransactionHistory() {
      if (this.userRole === 'admin') return this.transactionHistory;
      return this.transactionHistory.filter(trans => {
        const hasRest = this.hasItemFromCategory(trans.items, 'restaurant');
        if (this.userRole === 'restaurantstaff') return hasRest;
        if (this.userRole === 'receptionist') return !hasRest;
        return true;
      });
    },
    eshopPendingCount() {
      return this.transactionHistory.filter(t => t.source === 'eshop' && !this.viewedTransactions.has(t.receiptNo)).length;
    }
  },
  watch: {
    visibleCategories(newCats) {
      if (!newCats.some(c => c.id === this.currentCategory)) this.currentCategory = newCats[0]?.id || '';
    },
    currentCategory(val) { if (val !== 'restaurant') this.restaurantTypeFilter = 'all'; },
    eshopPendingCount(n) { this.notifications.setEshopPending(n); }
  },
  async mounted() {
    await this.fetchItems();
    await this.fetchTransactions();
    this.updateReceiptNumber();
    const saved = localStorage.getItem('receiptStyle');
    if (saved) { try { this.receiptStyle = { ...this.receiptStyle, ...JSON.parse(saved) }; } catch(e) {} }
  },
  methods: {
    async fetchItems() {
      try {
        const res = await axios.get(`${API_BASE}/items`);
        this.categories.forEach(cat => {
          cat.items = res.data.filter(i => i.category === cat.id).map(i => ({
            name: i.name, price: parseFloat(i.price), description: i.description || ''
          }));
        });
      } catch (e) { console.error(e); alert('Failed to load items from server'); }
    },
    async fetchTransactions() {
      try {
        const res = await axios.get(`${API_BASE}/transactions`);
        this.transactionHistory = res.data.map(t => ({
          receiptNo: t.receipt_no, items: t.items, type: t.type,
          payment: t.payment_method, total: parseFloat(t.total_amount),
          date: t.transaction_date, time: t.transaction_time,
          source: t.source || (t.receipt_no?.toString().includes('ESHOP') ? 'eshop' : 'pos')
        }));
        const cur = new Set(this.transactionHistory.map(t => t.receiptNo));
        this.viewedTransactions = new Set(Array.from(this.viewedTransactions).filter(r => cur.has(r)));
        localStorage.setItem('viewedEshopOrders', JSON.stringify(Array.from(this.viewedTransactions)));
      } catch (e) { console.error(e); }
    },
    updateReceiptNumber() {
      if (this.transactionHistory.length > 0)
        this.receiptNo = Math.max(...this.transactionHistory.map(t => parseInt(t.receiptNo))) + 1;
    },
    showCategory(id) {
      if (!this.visibleCategories.some(c => c.id === id)) return;
      this.currentCategory = id; this.searchQuery = '';
      if (id !== 'restaurant') this.restaurantTypeFilter = 'all';
    },
    getFilteredItems(items, categoryId) {
      let filtered = [...items];
      if (this.searchQuery) filtered = filtered.filter(i => i.name.toLowerCase().includes(this.searchQuery.toLowerCase()));
      if (categoryId === 'restaurant' && this.restaurantTypeFilter !== 'all')
        filtered = filtered.filter(i => (i.description || '').toLowerCase() === this.restaurantTypeFilter.toLowerCase());
      return filtered;
    },
    hasItemFromCategory(txItems, catId) {
      const names = (this.categories.find(c => c.id === catId)?.items || []).map(i => i.name.toLowerCase());
      return txItems.some(i => names.includes(i.name.toLowerCase()));
    },
    filterItems() {},
    addItem(name, price) { this.cart.push({ name, price }); this.total += price; },
    removeItem(i) { this.total -= this.cart[i].price; this.cart.splice(i, 1); },
    clearCart() {
      if (this.cart.length > 0 && confirm('Clear all items from the current transaction?')) { this.cart = []; this.total = 0; }
    },
    async checkout() {
      if (!this.cart.length) { alert('No items added'); return; }
      const now = new Date();
      const tx = {
        receiptNo: String(this.receiptNo).padStart(3, '0'),
        items: [...this.cart], type: 'Walk-in', payment: this.paymentMethod,
        total: this.total, date: now.toISOString().split('T')[0],
        time: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
      };
      try {
        await axios.post(`${API_BASE}/transactions`, {
          receipt_no: tx.receiptNo, items: tx.items, type: tx.type,
          payment_method: tx.payment, total_amount: tx.total,
          transaction_date: tx.date, transaction_time: tx.time
        });
        this.transactionHistory.unshift(tx);
        this.receiptNo++;
        alert(`Transaction completed!\nReceipt: POS-${tx.receiptNo}\nTotal: ₱${this.total.toLocaleString()}`);
        this.cart = []; this.total = 0;
      } catch (e) { console.error(e); alert('Failed to save transaction. Please try again.'); }
    },
    getItemsPreview(items) {
      const s = items.map(i => i.name).join(', ');
      return s.length > 30 ? s.substring(0, 30) + '...' : s;
    },
    viewDetails(receiptNo) {
      const t = this.transactionHistory.find(x => x.receiptNo === receiptNo);
      if (!t) return;
      this.viewedTransactions.add(receiptNo);
      localStorage.setItem('viewedEshopOrders', JSON.stringify(Array.from(this.viewedTransactions)));
      alert(`Receipt: POS-${t.receiptNo}\nDate: ${t.date} ${t.time}\nType: ${t.type}\nPayment: ${t.payment}\n\nItems:\n${t.items.map(i=>`${i.name} - ₱${i.price.toLocaleString()}`).join('\n')}\n\nTotal: ₱${t.total.toLocaleString()}`);
    },
    printReceipt(receiptNo) {
      const t = this.transactionHistory.find(x => x.receiptNo === receiptNo);
      if (!t) return;
      const win = window.open('', '', 'width=300,height=600');
      const rows = t.items.map(i=>`<tr><td style="padding:4px 0">${i.name}</td><td style="padding:4px 0;text-align:right">₱${i.price.toLocaleString()}</td></tr>`).join('');
      win.document.write(`<!DOCTYPE html><html><head><title>Receipt POS-${t.receiptNo}</title><style>body{font-family:'Courier New',monospace;width:300px;margin:20px auto;padding:20px}.header{text-align:center;background:#1E88B6;color:#fff;padding:15px;border-radius:6px;margin-bottom:15px}.title{font-size:20px;font-weight:bold;margin-bottom:4px}.info{margin:10px 0;font-size:12px}table{width:100%;margin:15px 0;font-size:13px}.total-section{border-top:2px dashed #ccc;padding-top:10px;margin-top:10px}.total{font-size:16px;font-weight:bold;display:flex;justify-content:space-between;background:#1F8DBF;color:#fff;padding:10px;border-radius:5px}.footer{text-align:center;margin-top:20px;border-top:2px dashed #ccc;padding-top:10px;font-size:11px}</style></head><body><div class="header"><div class="title">ReserVision</div><div>Point of Sale</div></div><div class="info"><div><b>Receipt:</b> POS-${t.receiptNo}</div><div><b>Date:</b> ${t.date}</div><div><b>Time:</b> ${t.time}</div><div><b>Type:</b> ${t.type}</div><div><b>Payment:</b> ${t.payment}</div></div><table><thead><tr style="border-bottom:1px solid #000"><th style="text-align:left;padding:5px 0">Item</th><th style="text-align:right;padding:5px 0">Price</th></tr></thead><tbody>${rows}</tbody></table><div class="total-section"><div class="total"><span>TOTAL:</span><span>₱${t.total.toLocaleString()}</span></div></div><div class="footer"><p>Thank you for your business!</p><p>Please come again</p></div></body></html>`);
      win.document.close(); win.focus(); setTimeout(()=>{ win.print(); win.close(); }, 250);
    },
    async deleteTransaction(receiptNo) {
      if (!confirm('Delete this transaction?')) return;
      const idx = this.transactionHistory.findIndex(t => t.receiptNo === receiptNo);
      if (idx === -1) return;
      try {
        const res = await axios.get(`${API_BASE}/transactions`);
        const bt = res.data.find(t => t.receipt_no === this.transactionHistory[idx].receiptNo);
        if (bt) await axios.delete(`${API_BASE}/transactions/${bt.id}`);
        this.transactionHistory.splice(idx, 1);
      } catch (e) { console.error(e); alert('Failed to delete transaction'); }
    },
    async clearHistory() {
      if (!confirm('Clear all transaction history?')) return;
      try { await axios.delete(`${API_BASE}/transactions`); this.transactionHistory = []; }
      catch (e) { console.error(e); alert('Failed to clear history'); }
    },
    saveReceiptToCSV(t) {
      let csv = `ReserVision - Receipt\nReceipt Number,${t.receiptNo}\nDate,${t.date}\nTime,${t.time}\nType,${t.type}\nPayment Method,${t.payment}\n\nItem,Price\n`;
      t.items.forEach(i => { csv += `"${i.name}",${i.price}\n`; });
      csv += `\nTotal,${t.total}\n`;
      this.downloadCSV(csv, `Receipt_POS-${t.receiptNo}_${t.date}.csv`);
    },
    exportAllTransactions() {
      if (!this.transactionHistory.length) { alert('No transactions to export'); return; }
      let csv = 'Receipt Number,Date,Time,Type,Payment Method,Items,Total\n';
      this.transactionHistory.forEach(t => {
        csv += `POS-${t.receiptNo},${t.date},${t.time},${t.type},${t.payment},"${t.items.map(i=>`${i.name} (₱${i.price})`).join('; ')}",${t.total}\n`;
      });
      this.downloadCSV(csv, `POS_Transactions_${new Date().toISOString().split('T')[0]}.csv`);
    },
    downloadCSV(content, filename) {
      const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob); link.download = filename;
      link.style.display = 'none'; document.body.appendChild(link); link.click(); document.body.removeChild(link);
    },
    downloadReceipt(receiptNo) { const t = this.transactionHistory.find(x => x.receiptNo === receiptNo); if (t) this.saveReceiptToCSV(t); },
    customizeReceipt(receiptNo) { this.selectedReceipt = this.transactionHistory.find(x => x.receiptNo === receiptNo); this.showReceiptCustomizer = true; },
    downloadCustomizedReceipt() {
      if (!this.selectedReceipt) return;
      const t = this.selectedReceipt;
      const rows = t.items.map(i=>`<tr><td style="padding:4px 0">${i.name}</td><td style="padding:4px 0;text-align:right">₱${i.price.toLocaleString()}</td></tr>`).join('');
      const win = window.open('', '', 'width=300,height=600');
      win.document.write(`<!DOCTYPE html><html><head><title>Receipt POS-${t.receiptNo}</title><style>body{font-family:${this.receiptStyle.fontFamily};width:300px;margin:20px auto;padding:20px}.header{text-align:center;background-color:${this.receiptStyle.headerBg};color:${this.receiptStyle.headerText};padding:15px;border-radius:6px;margin-bottom:15px}.title{font-size:${this.receiptStyle.companySize}px;font-weight:bold;margin-bottom:4px}.info{margin:10px 0;font-size:12px}table{width:100%;margin:15px 0;font-size:${this.receiptStyle.itemSize}px}.total-section{border-top:2px dashed #ccc;padding-top:10px;margin-top:10px}.total{font-size:${this.receiptStyle.totalSize}px;font-weight:bold;display:flex;justify-content:space-between;background-color:${this.receiptStyle.totalBg};color:${this.receiptStyle.totalText};padding:10px;border-radius:5px}.footer{text-align:center;margin-top:20px;border-top:2px dashed #ccc;padding-top:10px;font-size:11px}</style></head><body>${this.receiptStyle.showCompanyName?`<div class="header"><div class="title">${this.receiptStyle.companyName}</div><div>${this.receiptStyle.receiptTitle}</div></div>`:''}<div class="info"><div><b>Receipt:</b> POS-${t.receiptNo}</div>${this.receiptStyle.showDateTime?`<div><b>Date:</b> ${t.date}</div><div><b>Time:</b> ${t.time}</div>`:''}<div><b>Type:</b> ${t.type}</div><div><b>Payment:</b> ${t.payment}</div></div><table><thead><tr style="border-bottom:1px solid #000"><th style="text-align:left;padding:5px 0">Item</th><th style="text-align:right;padding:5px 0">Price</th></tr></thead><tbody>${rows}</tbody></table><div class="total-section"><div class="total"><span>TOTAL:</span><span>₱${t.total.toLocaleString()}</span></div></div>${this.receiptStyle.showFooter?`<div class="footer"><p>Thank you for your business!</p><p>Please come again</p></div>`:''}</body></html>`);
      win.document.close(); win.focus(); setTimeout(()=>{ win.print(); win.close(); }, 250);
      let csv = `${this.receiptStyle.companyName}\n${this.receiptStyle.receiptTitle}\n\nReceipt Number,${t.receiptNo}\nDate,${t.date}\nTime,${t.time}\nType,${t.type}\nPayment Method,${t.payment}\n\nItem,Price\n`;
      t.items.forEach(i => { csv += `"${i.name}",${i.price}\n`; });
      csv += `\nTotal,${t.total}\n`;
      this.downloadCSV(csv, `Receipt_POS-${t.receiptNo}_${t.date}_customized.csv`);
    },
    saveReceiptStyle() {
      localStorage.setItem('receiptStyle', JSON.stringify(this.receiptStyle));
      alert('Receipt style saved successfully!');
    }
  }
};
</script>

<style scoped>
/* ── Poster Palette Variables ──────────────────────────── */
:root {
  --blue-1:  #1E88B6;
  --blue-2:  #1F8DBF;
  --yellow-1:#F2C200;
  --yellow-2:#F4C400;
}

/* ── Base ──────────────────────────────────────────────── */
.admin-layout {
  display: flex;
  min-height: 100vh;
  background: #f0f4f8;
  font-family: 'Segoe UI', system-ui, sans-serif;
}

.main-content {
  flex: 1;
  margin-left: 260px;
  transition: margin-left 0.3s ease;
}
.main-content.shifted { margin-left: 70px; }

.header-container {
  padding: 0.85rem 2rem;
  background: #fff;
  border-bottom: 1px solid #e8edf2;
  position: sticky; top: 0; z-index: 50;
  box-shadow: 0 1px 4px rgba(0,0,0,0.05);
}

.pos-container {
  padding: 1.75rem;
  max-width: 1360px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* ── POS Grid ──────────────────────────────────────────── */
.pos-grid {
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 1.5rem;
  align-items: start;
}

/* ── Card Base ─────────────────────────────────────────── */
.pos-card {
  background: #fff;
  border-radius: 18px;
  border: 1px solid #e8edf2;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  overflow: hidden;
}

.pos-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.1rem 1.4rem;
  border-bottom: 1px solid #f1f5f9;
  background: #fafcfe;
  gap: 0.75rem;
  flex-wrap: wrap;
}
.pos-card-header-left { display: flex; align-items: center; gap: 0.8rem; }

.pos-icon-wrap {
  width: 40px; height: 40px; border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  font-size: 1rem; flex-shrink: 0;
}
.icon-blue   { background: rgba(31,141,191,.12); color: #1F8DBF; }
.icon-yellow { background: rgba(244,196,0,.18);  color: #a07800; }

.pos-card-title { font-size: 0.97rem; font-weight: 700; color: #1e293b; margin: 0; }
.pos-card-sub   { font-size: 0.75rem; color: #94a3b8; margin: 0.1rem 0 0; }

/* ── Category Buttons ──────────────────────────────────── */
.category-switch {
  display: flex; gap: 0.4rem; flex-wrap: nowrap;
  overflow-x: auto; scrollbar-width: none;
}
.category-switch::-webkit-scrollbar { display: none; }

.category-btn {
  display: inline-flex; align-items: center; gap: 0.4rem;
  height: 34px; padding: 0 13px;
  border-radius: 9px; border: 1.5px solid #e8edf2;
  background: #f8fafc; color: #64748b;
  font-size: 0.82rem; font-weight: 600; white-space: nowrap;
  cursor: pointer; transition: all 0.15s;
}
.category-btn i { font-size: 0.72rem; }
.category-btn:hover {
  border-color: #1F8DBF; color: #1F8DBF;
  background: rgba(31,141,191,.06);
}
.category-btn--active {
  background: #1F8DBF; color: #fff;
  border-color: #1F8DBF;
  box-shadow: 0 3px 10px rgba(31,141,191,.3);
}
.category-btn--active:hover { background: #1E88B6; border-color: #1E88B6; color: #fff; }

/* ── Items Body ────────────────────────────────────────── */
.items-body {
  padding: 1.1rem 1.4rem;
  display: flex; flex-direction: column; gap: 0.9rem;
}

.search-wrap { position: relative; }
.search-icon {
  position: absolute; left: 0.9rem; top: 50%; transform: translateY(-50%);
  color: #94a3b8; font-size: 0.85rem; pointer-events: none;
}
.search-input {
  width: 100%; padding: 0.65rem 0.9rem 0.65rem 2.4rem;
  border: 1.5px solid #e8edf2; border-radius: 10px;
  font-size: 0.9rem; color: #1e293b; background: #f8fafc;
  transition: all 0.15s; box-sizing: border-box;
}
.search-input:focus {
  outline: none; border-color: #1F8DBF; background: #fff;
  box-shadow: 0 0 0 3px rgba(31,141,191,.1);
}

/* ── Filter Chips ──────────────────────────────────────── */
.filter-wrap { border-bottom: 1px solid #f1f5f9; padding-bottom: 0.75rem; }
.filter-label {
  font-size: 0.7rem; font-weight: 700; color: #94a3b8;
  text-transform: uppercase; letter-spacing: 0.5px;
  display: block; margin-bottom: 0.5rem;
}
.filter-chips { display: flex; flex-wrap: wrap; gap: 0.4rem; }
.chip {
  padding: 0.25rem 0.75rem; border-radius: 30px;
  border: 1.5px solid #e8edf2; background: #fff;
  font-size: 0.78rem; font-weight: 600; color: #64748b;
  cursor: pointer; transition: all 0.15s;
}
.chip:hover { border-color: #1F8DBF; color: #1F8DBF; }
.chip--active { background: #1F8DBF; color: #fff; border-color: #1F8DBF; }

/* ── Items Grid ────────────────────────────────────────── */
.items-scroll {
  max-height: 440px; overflow-y: auto; scrollbar-width: none;
}
.items-scroll::-webkit-scrollbar { display: none; }

.items-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 0.65rem; }

.item-btn {
  padding: 0.8rem; min-height: 76px;
  border: 1.5px solid #e8edf2; border-radius: 12px;
  background: #fff; cursor: pointer; text-align: left;
  display: flex; flex-direction: column; justify-content: space-between;
  transition: all 0.2s;
}
.item-btn:hover {
  border-color: #1F8DBF;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(31,141,191,.15);
  background: rgba(31,141,191,.03);
}
.item-name  { font-size: 0.83rem; font-weight: 600; color: #1e293b; line-height: 1.3; }
.item-price { font-size: 1rem; font-weight: 700; color: #1F8DBF; margin-top: 0.35rem; }

/* ── Cart ──────────────────────────────────────────────── */
.cart-card { display: flex; flex-direction: column; }

.clear-cart-btn {
  display: inline-flex; align-items: center; gap: 0.35rem;
  font-size: 0.8rem; font-weight: 600; color: #ef4444;
  background: rgba(239,68,68,.08); border: 1.5px solid rgba(239,68,68,.2);
  border-radius: 8px; padding: 0.35rem 0.75rem;
  cursor: pointer; transition: all 0.15s;
}
.clear-cart-btn:hover { background: #ef4444; color: #fff; border-color: #ef4444; }

.cart-body { display: flex; flex-direction: column; flex: 1; padding: 1.1rem 1.4rem; }

.cart-items-area {
  flex: 1; min-height: 240px; max-height: 240px;
  overflow-y: auto; scrollbar-width: none;
  border-bottom: 1px solid #f1f5f9; margin-bottom: 1rem;
}
.cart-items-area::-webkit-scrollbar { display: none; }

.cart-empty {
  min-height: 220px; display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  color: #94a3b8; gap: 0.6rem; text-align: center;
}
.cart-empty i { font-size: 2.2rem; color: #d1d5db; }
.cart-empty p  { font-size: 0.88rem; margin: 0; }

.cart-item {
  display: flex; justify-content: space-between; align-items: center;
  padding: 0.55rem 0.5rem; border-radius: 8px; transition: background 0.15s;
}
.cart-item:hover { background: #f8fafc; }
.cart-item-name  { font-size: 0.88rem; color: #334155; font-weight: 500; }
.cart-item-right { display: flex; align-items: center; gap: 0.6rem; }
.cart-item-price { font-size: 0.9rem; font-weight: 700; color: #1e293b; }
.remove-item-btn { background: none; border: none; cursor: pointer; color: #fca5a5; font-size: 1rem; transition: color 0.15s; }
.remove-item-btn:hover { color: #ef4444; }

/* ── Cart Bottom ───────────────────────────────────────── */
.cart-bottom { display: flex; flex-direction: column; gap: 0.85rem; }

.total-panel {
  display: flex; justify-content: space-between; align-items: center;
  background: rgba(31,141,191,.06);
  border: 1.5px solid rgba(31,141,191,.2);
  border-radius: 12px; padding: 0.85rem 1rem;
}
.total-label  { font-size: 0.95rem; font-weight: 600; color: #64748b; }
.total-amount { font-size: 2rem; font-weight: 800; color: #1F8DBF; line-height: 1; }

.payment-label {
  display: block; font-size: 0.78rem; font-weight: 700;
  color: #64748b; text-transform: uppercase; letter-spacing: 0.4px;
  margin-bottom: 0.5rem;
}
.payment-btns { display: flex; gap: 0.6rem; }
.pay-method-btn {
  flex: 1; padding: 0.65rem 0.5rem; border-radius: 10px;
  border: 1.5px solid #e8edf2; background: #fff;
  font-size: 0.85rem; font-weight: 600; color: #64748b;
  cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 0.35rem;
  transition: all 0.15s;
}
.pay-method-btn:hover { border-color: #1E88B6; color: #1E88B6; }

/* GCash selected — green tint */
.pay-method-btn--gcash {
  background: rgba(34,197,94,.06); border-color: #22c55e;
  color: #15803d; box-shadow: 0 0 0 3px rgba(34,197,94,.12);
}
/* Cash selected — yellow/golden tint matching palette */
.pay-method-btn--cash {
  background: rgba(242,194,0,.1); border-color: #F2C200;
  color: #8a6500; box-shadow: 0 0 0 3px rgba(244,196,0,.18);
}
.pay-check { font-size: 0.8rem; color: #1F8DBF; }

.checkout-btn {
  width: 100%; padding: 0.9rem;
  background: linear-gradient(135deg, #1F8DBF, #1E88B6);
  color: #fff; border: none; border-radius: 12px;
  font-size: 1rem; font-weight: 700; cursor: pointer;
  display: flex; align-items: center; justify-content: center; gap: 0.5rem;
  transition: all 0.2s;
  box-shadow: 0 4px 14px rgba(31,141,191,.35);
}
.checkout-btn:hover {
  background: linear-gradient(135deg, #1E88B6, #1a7aa8);
  transform: translateY(-1px);
  box-shadow: 0 6px 18px rgba(30,136,182,.4);
}

/* ── Transactions ──────────────────────────────────────── */
.transactions-card { width: 100%; }

.trans-header-actions { display: flex; gap: 0.5rem; flex-wrap: wrap; }
.trans-action-btn {
  display: inline-flex; align-items: center; gap: 0.4rem;
  padding: 0.4rem 0.9rem; border-radius: 9px;
  font-size: 0.8rem; font-weight: 600; cursor: pointer;
  transition: all 0.15s; border: 1.5px solid;
}
.trans-action-btn--export {
  color: #15803d; background: rgba(34,197,94,.08); border-color: rgba(34,197,94,.3);
}
.trans-action-btn--export:hover { background: #22c55e; color: #fff; border-color: #22c55e; }
.trans-action-btn--clear {
  color: #ef4444; background: rgba(239,68,68,.08); border-color: rgba(239,68,68,.3);
}
.trans-action-btn--clear:hover { background: #ef4444; color: #fff; border-color: #ef4444; }

.table-wrap { overflow-x: auto; }
.pos-table { width: 100%; border-collapse: collapse; font-size: 0.875rem; }

.pos-table thead tr {
  background: linear-gradient(90deg, rgba(31,141,191,.08), rgba(30,136,182,.13));
  border-bottom: 2px solid rgba(31,141,191,.2);
}
.pos-table th {
  padding: 0.85rem 1rem; text-align: left;
  font-size: 0.75rem; font-weight: 700; color: #64748b;
  text-transform: uppercase; letter-spacing: 0.4px;
}
.pos-table td { padding: 0.85rem 1rem; border-bottom: 1px solid #f1f5f9; color: #334155; }

.table-row { transition: background 0.15s; }
.table-row:hover { background: rgba(31,141,191,.03); }
/* NEW eshop row — golden yellow accent from palette */
.table-row--new {
  background: rgba(242,194,0,.07);
  border-left: 3px solid #F4C400;
}
.table-row:last-child td { border-bottom: none; }

.table-empty {
  display: flex; flex-direction: column; align-items: center;
  gap: 0.5rem; padding: 3rem; color: #94a3b8; text-align: center;
}
.table-empty i { font-size: 2rem; color: #d1d5db; }

.receipt-no { font-weight: 700; color: #1F8DBF; }
/* NEW badge uses yellow-2 from palette */
.new-badge {
  display: inline-block; margin-left: 0.4rem;
  background: #F4C400; color: #6b4e00;
  font-size: 0.68rem; font-weight: 800;
  padding: 0.15rem 0.5rem; border-radius: 5px;
}

.items-preview { color: #334155; font-size: 0.85rem; }
.view-details-btn {
  background: none; border: none; cursor: pointer;
  color: #1F8DBF; font-size: 0.75rem; font-weight: 600;
  margin-top: 0.2rem; display: inline-flex; align-items: center; gap: 0.25rem;
  transition: color 0.15s; padding: 0;
}
.view-details-btn:hover { color: #1E88B6; text-decoration: underline; }

.type-cell  { color: #64748b; font-size: 0.85rem; }
.amount-cell{ font-weight: 700; color: #1e293b; }
.date-cell  { color: #334155; font-size: 0.85rem; }
.time-sub   { display: block; font-size: 0.75rem; color: #94a3b8; margin-top: 0.1rem; }

/* Payment badges */
.payment-badge {
  display: inline-block; padding: 0.25rem 0.65rem;
  border-radius: 30px; font-size: 0.75rem; font-weight: 600;
}
.payment-badge--gcash { background: rgba(34,197,94,.1);  color: #15803d; }
/* Cash badge uses palette yellow */
.payment-badge--cash  { background: rgba(242,194,0,.15); color: #7a5200; }

.actions-cell { text-align: center; white-space: nowrap; }
.tbl-btn {
  width: 30px; height: 30px; border-radius: 7px;
  border: 1.5px solid #e8edf2; background: #fff;
  font-size: 0.85rem; cursor: pointer;
  display: inline-flex; align-items: center; justify-content: center;
  transition: all 0.15s; margin: 0 2px;
}
.tbl-btn:hover { transform: translateY(-1px); }
/* Print — blue-2 */
.tbl-btn--print    { color: #1F8DBF; }
.tbl-btn--print:hover    { background: #1F8DBF; color: #fff; border-color: #1F8DBF; }
/* Download — blue-1 */
.tbl-btn--download { color: #1E88B6; }
.tbl-btn--download:hover { background: #1E88B6; color: #fff; border-color: #1E88B6; }
/* Customize — purple kept as-is (not part of this palette) */
.tbl-btn--customize{ color: #8b5cf6; }
.tbl-btn--customize:hover{ background: #8b5cf6; color: #fff; border-color: #8b5cf6; }
/* Delete — red */
.tbl-btn--delete   { color: #ef4444; }
.tbl-btn--delete:hover   { background: #ef4444; color: #fff; border-color: #ef4444; }

/* ── Modal ─────────────────────────────────────────────── */
.modal-overlay {
  position: fixed; inset: 0;
  background: rgba(15,23,42,.55); backdrop-filter: blur(5px);
  display: flex; align-items: center; justify-content: center;
  z-index: 1000; animation: fadeIn 0.2s;
}
@keyframes fadeIn { from { opacity:0; } to { opacity:1; } }

.modal-box {
  background: #fff; border-radius: 20px;
  width: 90%; max-width: 620px; max-height: 90vh; overflow-y: auto;
  box-shadow: 0 20px 50px rgba(0,0,0,.2);
  animation: slideUp 0.25s ease;
}
@keyframes slideUp {
  from { transform: translateY(20px); opacity: 0; }
  to   { transform: translateY(0);    opacity: 1; }
}

/* Modal header uses blue gradient from palette */
.modal-head {
  display: flex; justify-content: space-between; align-items: flex-start;
  padding: 1.4rem 1.5rem;
  background: linear-gradient(135deg, #1E88B6, #1F8DBF);
  border-radius: 20px 20px 0 0;
}
.modal-title { font-size: 1.2rem; font-weight: 700; color: #fff; margin: 0; }
.modal-sub   { font-size: 0.82rem; color: rgba(255,255,255,.75); margin: 0.25rem 0 0; }
.modal-close {
  width: 34px; height: 34px; border-radius: 9px;
  background: rgba(255,255,255,.15); border: none; color: #fff;
  font-size: 1rem; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: background 0.15s;
}
.modal-close:hover { background: rgba(255,255,255,.3); }

.modal-body { padding: 1.5rem; display: flex; flex-direction: column; gap: 1.25rem; }

.modal-section {
  background: #f8fafc; border: 1px solid #e8edf2;
  border-radius: 14px; padding: 1.1rem;
}
.modal-section-title {
  font-size: 0.9rem; font-weight: 700; color: #1e293b; margin: 0 0 1rem;
  display: flex; align-items: center; gap: 0.4rem;
}
.modal-section-title i { color: #1F8DBF; }

.modal-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }

.form-group  { display: flex; flex-direction: column; gap: 0.4rem; }
.form-label  { font-size: 0.75rem; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.4px; }
.form-input  {
  padding: 0.6rem 0.85rem; border: 1.5px solid #e8edf2;
  border-radius: 9px; font-size: 0.9rem; color: #1e293b;
  background: #fff; transition: all 0.15s;
  width: 100%; box-sizing: border-box;
}
.form-input:focus { outline: none; border-color: #1F8DBF; box-shadow: 0 0 0 3px rgba(31,141,191,.1); }
.form-input.mono  { font-family: monospace; font-size: 0.82rem; }

.color-row { display: flex; gap: 0.5rem; align-items: center; }
.color-swatch {
  width: 42px; height: 36px; border-radius: 8px;
  border: 1.5px solid #e8edf2; cursor: pointer; padding: 2px; flex-shrink: 0;
}

.modal-checks { display: flex; flex-direction: column; gap: 0.6rem; }
.check-row {
  display: flex; align-items: center; gap: 0.65rem;
  font-size: 0.88rem; color: #334155; cursor: pointer; font-weight: 500;
}
.check-input { width: 16px; height: 16px; accent-color: #1F8DBF; cursor: pointer; }

/* Receipt preview */
.receipt-preview {
  background: #fff; border: 2px dashed #e8edf2;
  border-radius: 10px; padding: 1rem;
}
.rp-header { text-align: center; padding: 12px; border-radius: 7px; margin-bottom: 10px; }
.rp-body   { margin: 8px 0; }
.rp-item   { display: flex; justify-content: space-between; padding: 4px 0; border-bottom: 1px solid #f1f5f9; }
.rp-total  { text-align: center; font-weight: 700; padding: 10px; border-radius: 7px; margin-top: 8px; }

.modal-foot {
  padding: 1.1rem 1.5rem; border-top: 1px solid #f1f5f9;
  background: #fafcfe; border-radius: 0 0 20px 20px;
  display: flex; gap: 0.6rem; justify-content: flex-end;
}
.modal-btn {
  padding: 0.55rem 1.2rem; border-radius: 10px;
  font-size: 0.88rem; font-weight: 700; cursor: pointer;
  display: inline-flex; align-items: center; gap: 0.4rem;
  transition: all 0.15s; border: none;
}
.modal-btn--cancel   { background: #f1f5f9; color: #64748b; }
.modal-btn--cancel:hover { background: #e2e8f0; }
.modal-btn--download { background: #22c55e; color: #fff; }
.modal-btn--download:hover { background: #16a34a; }
/* Save uses blue-2 */
.modal-btn--save     { background: #1F8DBF; color: #fff; }
.modal-btn--save:hover { background: #1E88B6; }

/* ── Responsive ────────────────────────────────────────── */
@media (max-width: 1024px) {
  .pos-grid { grid-template-columns: 1fr; }
}
@media (max-width: 768px) {
  .main-content { margin-left: 0; }
  .pos-container { padding: 1rem; }
  .pos-card-header { flex-direction: column; align-items: flex-start; }
  .items-grid { grid-template-columns: repeat(2,1fr); }
  .modal-grid-2 { grid-template-columns: 1fr; }
}
</style>