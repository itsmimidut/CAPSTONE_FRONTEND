<template>
  <div class="admin-layout">
    <!-- Sidebar -->
    <AdminSidebar 
      :is-open="sidebarOpen"
      :is-collapsed="sidebarCollapsed"
      @close="sidebarOpen = false"
    />

    <!-- Main Content -->
    <main class="main-content" :class="{ shifted: sidebarCollapsed }">

      <!-- Header -->
      <div class="header-container">
        <AdminHeader
          title="Point of Sale"
          subtitle="Walk-in Payments"
          :has-notifications="eshopPendingCount > 0"
          :pending-count="eshopPendingCount"
          @toggle-sidebar="sidebarOpen = !sidebarOpen"
        />
      </div>

      <!-- QR Check-In Scanner Modal -->
      <QRCheckInScanner
        :is-open="isCheckinScannerOpen"
        @close="isCheckinScannerOpen = false"
        @check-in-success="handleCheckInSuccess"
      />

      <!-- ── BOOKMARK TABS ── -->
      <div class="side-bookmarks">
        <!-- Scanner Tab -->
        <button
          class="bookmark-tab"
          :style="getTabStyle('scanner')"
          @mouseenter="hoveredTab = 'scanner'"
          @mouseleave="hoveredTab = null"
          @click="openScanner"
          title="Check-in Scanner"
        >
          <i class="fas fa-qrcode tab-icon"></i>
          <span v-show="isTabExpanded('scanner')" class="tab-label">Check-in Scanner</span>
        </button>

        <!-- Transaction Tab -->
        <button
          class="bookmark-tab"
          :style="getTabStyle('transaction')"
          @mouseenter="hoveredTab = 'transaction'"
          @mouseleave="hoveredTab = null"
          @click="toggleTransaction"
          title="Transaction History"
        >
          <i class="fas fa-history tab-icon"></i>
          <span v-show="isTabExpanded('transaction')" class="tab-label">Transaction</span>
          <span v-if="eshopPendingCount > 0 && isTabExpanded('transaction')" class="tab-badge">{{ eshopPendingCount }}</span>
        </button>
      </div>

      <div class="pos-container">

        <!-- POS GRID (hidden when transaction is open) -->
        <div v-show="!showTransaction" class="pos-section">

          <!-- Items + Cart Grid -->
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 pos-grid">

            <!-- ITEMS -->
            <div class="lg:col-span-2 card p-5 items-card">
              <div class="items-topbar mb-3">
                <h2 class="font-bold text-gray-800 section-title"><i class="fas fa-shopping-cart mr-2"></i>Services / Items</h2>
                <div class="category-switch">
                  <button 
                    v-for="category in visibleCategories" 
                    :key="category.id"
                    @click="showCategory(category.id)" 
                    :class="['category-btn rounded-lg', currentCategory === category.id ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700']"
                  >
                    <i :class="`fas fa-${category.icon} mr-2`"></i>{{ category.name }}
                  </button>
                </div>
              </div>

              <!-- Search Bar -->
              <div class="mb-4">
                <div class="relative">
                  <i class="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                  <input 
                    type="text" 
                    v-model="searchQuery" 
                    @input="filterItems"
                    placeholder="Search items..." 
                    class="border-2 p-3 pl-10 rounded-lg w-full"
                  >
                </div>
              </div>

              <!-- Restaurant Type Filters -->
              <div
                v-if="currentCategory === 'restaurant' && restaurantTypeFilters.length > 0"
                class="mb-4 menu-filter-wrap"
              >
                <div class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Filter Menu</div>
                <div class="flex flex-wrap gap-2">
                  <button type="button" @click="restaurantTypeFilter = 'all'"
                    :class="['px-3 py-1.5 rounded-full text-sm font-semibold border transition-all chip-btn', restaurantTypeFilter === 'all' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400 hover:text-blue-700']"
                  >All</button>
                  <button
                    v-for="filter in restaurantTypeFilters" :key="filter"
                    type="button" @click="restaurantTypeFilter = filter"
                    :class="['px-3 py-1.5 rounded-full text-sm font-semibold border transition-all chip-btn', restaurantTypeFilter === filter ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400 hover:text-blue-700']"
                  >{{ filter }}</button>
                </div>
              </div>

              <!-- Items Grid -->
              <div class="items-scroll">
                <div 
                  v-for="category in visibleCategories" 
                  :key="`items-${category.id}`"
                  v-show="currentCategory === category.id"
                  class="category-items grid grid-cols-2 md:grid-cols-3 gap-3"
                >
                  <button 
                    v-for="item in getFilteredItems(category.items, category.id)" 
                    :key="item.name"
                    @click="handleItemClick(item.name, item.price, category.id)" 
                    class="item-btn p-3 bg-white"
                  >
                    <div class="font-medium text-gray-800">{{ item.name }}</div>
                    <div class="text-green-600 font-bold text-lg mt-1">₱{{ item.price.toLocaleString() }}</div>
                  </button>
                </div>
              </div>
            </div>

            <!-- CART -->
            <div class="card p-5 cart-card">
              <div class="cart-header">
                <h2 class="font-bold text-lg text-gray-800"><i class="fas fa-receipt mr-2"></i>Current Transaction</h2>
                <button @click="clearCart" class="text-red-600 hover:text-red-800 text-sm font-medium transition-all">
                  <i class="fas fa-trash mr-1"></i>Clear All
                </button>
              </div>

              <div class="cart-content">
                <div class="cart-items-area space-y-2 text-sm">
                  <div v-if="cart.length === 0" class="cart-empty-state">
                    <i class="fas fa-shopping-basket text-5xl mb-3 block"></i>
                    <p>No items added yet</p>
                  </div>
                  <div 
                    v-else
                    v-for="(item, index) in cart" 
                    :key="index"
                    class="cart-item flex justify-between items-start gap-2"
                  >
                    <div class="flex-1">
                      <span class="text-gray-700 font-medium">{{ item.name }}</span>
                      <div v-if="item.isBooking" class="text-xs text-gray-500 mt-1">
                        <div><i class="fas fa-user mr-1"></i>{{ item.firstName }} {{ item.lastName }}</div>
                        <div><i class="fas fa-calendar mr-1"></i>{{ item.checkIn }} to {{ item.checkOut }}</div>
                        <div><i class="fas fa-users mr-1"></i>{{ item.adults }} adult{{ item.adults > 1 ? 's' : '' }}{{ item.children > 0 ? `, ${item.children} child(ren)` : '' }}</div>
                        <div v-if="item.nights"><i class="fas fa-moon mr-1"></i>{{ item.nights }} night{{ item.nights > 1 ? 's' : '' }}</div>
                      </div>
                    </div>
                    <div class="flex items-center gap-3 flex-shrink-0">
                      <span class="font-semibold text-gray-800 whitespace-nowrap">₱{{ item.price.toLocaleString() }}</span>
                      <button @click="removeItem(index)" class="text-red-500 hover:text-red-700 transition-colors">
                        <i class="fas fa-times-circle"></i>
                      </button>
                    </div>
                  </div>
                </div>

                <div class="cart-bottom">
                  <div class="total-panel">
                    <span class="text-lg font-semibold text-gray-700">Total</span>
                    <span class="text-4xl font-bold text-blue-600">₱{{ total.toLocaleString() }}</span>
                  </div>

                  <div class="payment-wrap">
                    <label class="text-sm font-semibold text-gray-700 mb-2 block">
                      <i class="fas fa-credit-card mr-2"></i>Payment Method
                    </label>
                    <div class="flex gap-3 mb-3">
                      <button type="button"
                        class="payment-btn flex-1 py-3 rounded-lg border text-base font-semibold flex items-center justify-center"
                        :class="paymentMethod === 'GCash' ? 'bg-green-50 border-green-600 text-green-700 ring-2 ring-green-200' : 'bg-white border-gray-300 text-gray-700'"
                        @click="paymentMethod = 'GCash'"
                      >
                        <i class="fas fa-wallet text-green-600 text-lg mr-2"></i> GCash
                        <span v-if="paymentMethod === 'GCash'" class="ml-2"><i class="fas fa-check-circle text-primary-blue"></i></span>
                      </button>
                      <button type="button"
                        class="payment-btn flex-1 py-3 rounded-lg border text-base font-semibold flex items-center justify-center"
                        :class="paymentMethod === 'Cash' ? 'bg-yellow-50 border-yellow-600 text-yellow-700 ring-2 ring-yellow-200' : 'bg-white border-gray-300 text-gray-700'"
                        @click="paymentMethod = 'Cash'"
                      >
                        <i class="fas fa-money-bill-wave text-yellow-600 text-lg mr-2"></i> Cash
                        <span v-if="paymentMethod === 'Cash'" class="ml-2"><i class="fas fa-check-circle text-primary-blue"></i></span>
                      </button>
                    </div>
                  </div>

                  <button @click="checkout" class="btn-success w-full bg-green-600 text-white py-4 rounded-lg font-semibold text-lg pay-btn">
                    <i class="fas fa-check-circle mr-2"></i>Pay & Complete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- TRANSACTION HISTORY (shown when showTransaction is true) -->
        <div v-show="showTransaction" class="transaction-section card p-6">
          <div class="flex justify-between items-center mb-4">
            <h2 class="font-bold text-lg text-gray-800"><i class="fas fa-history mr-2"></i>Recent POS Transactions</h2>
            <div class="flex gap-2">
              <button @click="exportAllTransactions" class="text-green-600 hover:text-green-800 text-sm font-medium transition-all">
                <i class="fas fa-file-excel mr-1"></i>Export to Excel
              </button>
              <button @click="clearHistory" class="text-red-600 hover:text-red-800 text-sm font-medium transition-all">
                <i class="fas fa-trash mr-1"></i>Clear History
              </button>
            </div>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="bg-gradient-to-r from-blue-50 to-blue-100 border-b-2 border-blue-200">
                  <th class="p-3 text-left font-semibold text-gray-700">Receipt</th>
                  <th class="p-3 text-left font-semibold text-gray-700">Items</th>
                  <th class="p-3 text-left font-semibold text-gray-700">Type</th>
                  <th class="p-3 text-left font-semibold text-gray-700">Payment</th>
                  <th class="p-3 text-left font-semibold text-gray-700">Amount</th>
                  <th class="p-3 text-left font-semibold text-gray-700">Date & Time</th>
                  <th class="p-3 text-center font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="filteredTransactionHistory.length === 0">
                  <td colspan="7" class="p-8 text-center text-gray-400">
                    <i class="fas fa-inbox text-4xl mb-2 block"></i>No transactions yet
                  </td>
                </tr>
                <tr 
                  v-else
                  v-for="(trans, index) in filteredTransactionHistory" 
                  :key="trans.receiptNo"
                  :class="['border-b hover:bg-blue-50 transition-colors', trans.source === 'eshop' && !viewedTransactions.has(trans.receiptNo) ? 'bg-yellow-50 border-l-4 border-yellow-400' : '']"
                >
                  <td class="p-3 font-semibold text-blue-700">
                    POS-{{ trans.receiptNo }}
                    <span v-if="trans.source === 'eshop' && !viewedTransactions.has(trans.receiptNo)"
                      class="ml-2 inline-block bg-yellow-400 text-yellow-900 px-2 py-1 rounded text-xs font-bold">
                      <i class="fas fa-star mr-1"></i>NEW
                    </span>
                  </td>
                  <td class="p-3">
                    <div class="text-gray-700">{{ getItemsPreview(trans.items) }}</div>
                    <button @click="viewDetails(trans.receiptNo)" class="text-blue-600 text-xs hover:underline mt-1 transition-all">
                      <i class="fas fa-eye"></i> View Details
                    </button>
                  </td>
                  <td class="p-3 text-gray-700">{{ trans.type }}</td>
                  <td class="p-3">
                    <span class="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-medium">{{ trans.payment }}</span>
                  </td>
                  <td class="p-3 font-bold text-gray-800">₱{{ trans.total.toLocaleString() }}</td>
                  <td class="p-3 text-gray-600">
                    {{ trans.date }}<br>
                    <span class="text-xs text-gray-400">{{ trans.time }}</span>
                  </td>
                  <td class="p-3 text-center">
                    <button @click="printReceipt(trans.receiptNo)" class="text-green-600 hover:text-green-800 mr-3 transition-all hover:scale-110 inline-block" title="Print">
                      <i class="fas fa-print text-lg"></i>
                    </button>
                    <button @click="downloadReceipt(trans.receiptNo)" class="text-blue-600 hover:text-blue-800 mr-3 transition-all hover:scale-110 inline-block" title="Download">
                      <i class="fas fa-download text-lg"></i>
                    </button>
                    <button @click="customizeReceipt(trans.receiptNo)" class="text-purple-600 hover:text-purple-800 mr-3 transition-all hover:scale-110 inline-block" title="Customize">
                      <i class="fas fa-palette text-lg"></i>
                    </button>
                    <button @click="deleteTransaction(trans.receiptNo)" class="text-red-600 hover:text-red-800 transition-all hover:scale-110 inline-block" title="Delete">
                      <i class="fas fa-trash text-lg"></i>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>

      <!-- Receipt Customization Modal -->
      <div v-if="showReceiptCustomizer" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div class="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 flex justify-between items-center border-b">
            <div>
              <h3 class="text-2xl font-bold"><i class="fas fa-palette mr-2"></i>Customize Receipt</h3>
              <p class="text-blue-100 text-sm mt-1">POS-{{ selectedReceipt?.receiptNo }}</p>
            </div>
            <button @click="showReceiptCustomizer = false" class="text-2xl hover:bg-blue-600 p-2 rounded transition-colors">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div class="p-6 space-y-6">
            <div class="border rounded-lg p-4 bg-gray-50">
              <h4 class="font-bold text-gray-800 mb-4"><i class="fas fa-paint-brush mr-2"></i>Colors</h4>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="text-sm font-semibold text-gray-700 mb-2 block">Header Background</label>
                  <div class="flex gap-2">
                    <input type="color" v-model="receiptStyle.headerBg" class="w-12 h-10 rounded cursor-pointer">
                    <input type="text" v-model="receiptStyle.headerBg" class="flex-1 border rounded px-2 py-1 text-sm font-mono">
                  </div>
                </div>
                <div>
                  <label class="text-sm font-semibold text-gray-700 mb-2 block">Header Text</label>
                  <div class="flex gap-2">
                    <input type="color" v-model="receiptStyle.headerText" class="w-12 h-10 rounded cursor-pointer">
                    <input type="text" v-model="receiptStyle.headerText" class="flex-1 border rounded px-2 py-1 text-sm font-mono">
                  </div>
                </div>
              </div>
            </div>
            <div class="border rounded-lg p-4 bg-gray-50">
              <h4 class="font-bold text-gray-800 mb-4"><i class="fas fa-file-alt mr-2"></i>Content</h4>
              <div class="space-y-3">
                <div>
                  <label class="text-sm font-semibold text-gray-700 mb-2 block">Company Name</label>
                  <input type="text" v-model="receiptStyle.companyName" class="w-full border rounded px-3 py-2">
                </div>
              </div>
            </div>
          </div>
          <div class="sticky bottom-0 bg-gray-100 p-6 flex gap-3 justify-end border-t">
            <button @click="showReceiptCustomizer = false" class="px-6 py-2 bg-gray-300 text-gray-800 rounded-lg font-semibold">Cancel</button>
            <button @click="downloadCustomizedReceipt" class="px-6 py-2 bg-green-600 text-white rounded-lg font-semibold">
              <i class="fas fa-download mr-2"></i>Download
            </button>
            <button @click="saveReceiptStyle" class="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold">
              <i class="fas fa-save mr-2"></i>Save Style
            </button>
          </div>
        </div>
      </div>

      <!-- Room/Cottage/Event Booking Modal -->
      <POSRoomBookingModal
        :is-open="showBookingModal"
        :item-name="pendingBookingItem?.name || ''"
        :item-price="pendingBookingItem?.price || 0"
        @close="showBookingModal = false"
        @confirm="handleBookingConfirm"
      />

      <!-- Transaction Details Modal -->
      <div v-if="showTransactionDetails && selectedTransaction" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
          <!-- Header -->
          <div class="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 flex justify-between items-center border-b">
            <div>
              <h3 class="text-2xl font-bold"><i class="fas fa-receipt mr-2"></i>Transaction Details</h3>
              <p class="text-blue-100 text-sm mt-1">POS-{{ selectedTransaction.receiptNo }}</p>
            </div>
            <button @click="showTransactionDetails = false" class="text-2xl hover:bg-blue-600 p-2 rounded transition-colors">
              <i class="fas fa-times"></i>
            </button>
          </div>

          <!-- Content -->
          <div class="p-6 space-y-4">
            <!-- Transaction Info -->
            <div class="border rounded-lg p-4 bg-gray-50">
              <h4 class="font-bold text-gray-800 mb-3"><i class="fas fa-info-circle mr-2 text-blue-600"></i>Transaction Info</h4>
              <div class="space-y-2 text-sm">
                <div class="flex justify-between">
                  <span class="text-gray-600">Receipt No:</span>
                  <span class="font-semibold">POS-{{ selectedTransaction.receiptNo }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Type:</span>
                  <span class="font-semibold">{{ selectedTransaction.type }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Date:</span>
                  <span class="font-semibold">{{ selectedTransaction.date }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Time:</span>
                  <span class="font-semibold">{{ selectedTransaction.time }}</span>
                </div>
              </div>
            </div>

            <!-- Items -->
            <div class="border rounded-lg p-4 bg-gray-50">
              <h4 class="font-bold text-gray-800 mb-3"><i class="fas fa-shopping-cart mr-2 text-blue-600"></i>Items</h4>
              <div class="space-y-2">
                <div v-for="(item, idx) in selectedTransaction.items" :key="idx" class="flex justify-between items-start p-2 bg-white rounded border-l-4 border-blue-400">
                  <div class="flex-1">
                    <div class="font-medium text-gray-800">{{ item.name }}</div>
                    <div v-if="item.bookingReference" class="text-xs text-gray-500 mt-1">
                      <i class="fas fa-tag mr-1"></i>Ref: {{ item.bookingReference }}
                    </div>
                  </div>
                  <div class="text-right ml-2">
                    <div class="font-semibold text-blue-600">₱{{ item.price.toLocaleString() }}</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Payment Info -->
            <div class="border rounded-lg p-4 bg-gray-50">
              <h4 class="font-bold text-gray-800 mb-3"><i class="fas fa-credit-card mr-2 text-blue-600"></i>Payment</h4>
              <div class="space-y-2 text-sm">
                <div class="flex justify-between">
                  <span class="text-gray-600">Payment Method:</span>
                  <span class="px-2 py-1 rounded text-xs font-semibold" :class="selectedTransaction.payment === 'GCash' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'">
                    {{ selectedTransaction.payment }}
                  </span>
                </div>
                <div class="flex justify-between pt-2 border-t border-gray-300">
                  <span class="font-bold">Total Amount:</span>
                  <span class="text-xl font-bold text-blue-600">₱{{ selectedTransaction.total.toLocaleString() }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="sticky bottom-0 bg-gray-100 p-4 flex gap-2 justify-end border-t">
            <button 
              @click="printReceipt(selectedTransaction.receiptNo)" 
              class="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
            >
              <i class="fas fa-print mr-2"></i>Print
            </button>
            <button 
              @click="showTransactionDetails = false" 
              class="px-4 py-2 bg-gray-400 text-white rounded-lg font-semibold hover:bg-gray-500 transition-colors"
            >
              <i class="fas fa-times mr-2"></i>Close
            </button>
          </div>
        </div>
      </div>

    </main>

    <!-- Toast -->
    <div 
      v-if="toastMessage" 
      class="fixed bottom-8 right-8 px-6 py-4 rounded-xl font-bold text-sm shadow-2xl z-50 text-white"
      :class="toastType === 'success' ? 'bg-green-500' : 'bg-red-500'"
    >
      {{ toastMessage }}
    </div>
  </div>
</template>

<script>
import AdminSidebar from '../../components/Admin/AdminSidebar.vue';
import AdminHeader from '../../components/admin/AdminHeader.vue';
import QRCheckInScanner from '../../components/QRCheckInScanner.vue';
import POSRoomBookingModal from '../../components/POSRoomBookingModal.vue';
import QRCode from 'qrcode';
import { useAuthStore } from '../../stores/auth';
import { useNotificationStore } from '../../stores/notifications';
import axios from 'axios';
import * as XLSX from 'xlsx';

const API_BASE = 'http://localhost:8000/api/pos';

export default {
  name: 'POSSystem',
  components: { AdminSidebar, AdminHeader, QRCheckInScanner, POSRoomBookingModal },
  data() {
    return {
      sidebarOpen: false,
      sidebarCollapsed: false,
      isCheckinScannerOpen: false,
      showTransaction: false,       // ← controls POS/Transaction toggle
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
        { id: 'restaurant', name: 'Restaurant', icon: 'utensils', items: [] },
        { id: 'rooms',      name: 'Rooms',      icon: 'bed',      items: [] },
        { id: 'cottage',    name: 'Cottage',    icon: 'home',     items: [] },
        { id: 'event',      name: 'Event',      icon: 'calendar-alt', items: [] }
      ],
      viewedTransactions: new Set(JSON.parse(localStorage.getItem('viewedEshopOrders') || '[]')),
      toastMessage: '',
      toastType: 'success',
      hoveredTab: null,
      // Booking Modal
      showBookingModal: false,
      pendingBookingItem: null,
      // Transaction Details Modal
      showTransactionDetails: false,
      selectedTransaction: null
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
      return [...new Set(cat.items.map(i => (i.description || '').trim()).filter(Boolean))].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
    },
    filteredTransactionHistory() {
      if (this.userRole === 'admin') return this.transactionHistory;
      return this.transactionHistory.filter(trans => {
        const hasRestaurantItem = this.hasItemFromCategory(trans.items, 'restaurant');
        if (this.userRole === 'restaurantstaff') return hasRestaurantItem;
        if (this.userRole === 'receptionist') return !hasRestaurantItem;
        return true;
      });
    },
    eshopPendingCount() {
      return this.transactionHistory.filter(t => t.source === 'eshop' && !this.viewedTransactions.has(t.receiptNo)).length;
    }
  },
  watch: {
    visibleCategories(newCats) {
      if (!newCats.some(c => c.id === this.currentCategory)) {
        this.currentCategory = newCats[0]?.id || '';
      }
    },
    currentCategory(newCat) {
      if (newCat !== 'restaurant') this.restaurantTypeFilter = 'all';
    },
    eshopPendingCount(newCount) {
      this.notifications.setEshopPending(newCount);
    }
  },
  async mounted() {
    await this.fetchItems();
    await this.fetchTransactions();
    this.updateReceiptNumber();
    const savedStyle = localStorage.getItem('receiptStyle');
    if (savedStyle) {
      try { this.receiptStyle = { ...this.receiptStyle, ...JSON.parse(savedStyle) }; }
      catch (e) { console.error(e); }
    }
  },
  methods: {
    // ── Bookmark Tab Actions ──
    openScanner() {
      this.isCheckinScannerOpen = true;
    },
    toggleTransaction() {
      this.showTransaction = !this.showTransaction;
    },
    isTabExpanded(tab) {
      if (tab === 'scanner') return this.hoveredTab === 'scanner' || this.isCheckinScannerOpen;
      if (tab === 'transaction') return this.hoveredTab === 'transaction' || this.showTransaction;
      return false;
    },
    getTabStyle(tab) {
      const expanded = this.isTabExpanded(tab);
      const isActive = tab === 'scanner' ? this.isCheckinScannerOpen : this.showTransaction;
      return {
        width: expanded ? '175px' : '44px',
        gap: expanded ? '0.55rem' : '0',
        background: isActive ? '#1e3a8a' : expanded ? '#2d58d4' : '#3b67e6',
        transition: 'width 0.25s cubic-bezier(0.4,0,0.2,1), gap 0.25s, background 0.18s',
      };
    },

    // ── Existing Methods ──
    async fetchItems() {
      try {
        const response = await axios.get(`${API_BASE}/items`);
        const items = response.data;
        this.categories.forEach(category => {
          category.items = items
            .filter(item => item.category === category.id)
            .map(item => ({ name: item.name, price: parseFloat(item.price), description: item.description || '' }));
        });
      } catch (error) {
        this.showToast('❌ Failed to load items from server', 'error');
      }
    },
    async fetchTransactions() {
      try {
        const response = await axios.get(`${API_BASE}/transactions`);
        this.transactionHistory = response.data.map(trans => {
          const isEshop = trans.receipt_no && trans.receipt_no.toString().includes('ESHOP');
          return {
            receiptNo: trans.receipt_no,
            items: trans.items,
            type: trans.type,
            payment: trans.payment_method,
            total: parseFloat(trans.total_amount),
            date: trans.transaction_date,
            time: trans.transaction_time,
            source: trans.source || (isEshop ? 'eshop' : 'pos')
          };
        });
        const currentReceiptNos = new Set(this.transactionHistory.map(t => t.receiptNo));
        this.viewedTransactions = new Set(Array.from(this.viewedTransactions).filter(r => currentReceiptNos.has(r)));
        localStorage.setItem('viewedEshopOrders', JSON.stringify(Array.from(this.viewedTransactions)));
      } catch (e) { console.error(e); }
    },
    updateReceiptNumber() {
      if (this.transactionHistory.length > 0) {
        const numericReceipts = this.transactionHistory
          .map(t => { const n = parseInt(String(t.receiptNo).replace(/[^\d]/g, '')); return isNaN(n) ? 0 : n; })
          .filter(n => n > 0);
        this.receiptNo = numericReceipts.length > 0 ? Math.max(...numericReceipts) + 1 : 1;
      } else {
        this.receiptNo = 1;
      }
    },
    showCategory(categoryId) {
      if (!this.visibleCategories.some(c => c.id === categoryId)) return;
      this.currentCategory = categoryId;
      this.searchQuery = '';
      if (categoryId !== 'restaurant') this.restaurantTypeFilter = 'all';
    },
    getFilteredItems(items, categoryId) {
      let filtered = [...items];
      if (this.searchQuery) {
        const q = this.searchQuery.toLowerCase();
        filtered = filtered.filter(item => item.name.toLowerCase().includes(q));
      }
      if (categoryId === 'restaurant' && this.restaurantTypeFilter !== 'all') {
        filtered = filtered.filter(item => (item.description || '').toLowerCase() === this.restaurantTypeFilter.toLowerCase());
      }
      return filtered;
    },
    hasItemFromCategory(transactionItems, categoryId) {
      const categoryItemNames = (this.categories.find(c => c.id === categoryId)?.items || []).map(i => i.name.toLowerCase());
      return transactionItems.some(t => categoryItemNames.includes(t.name.toLowerCase()));
    },
    filterItems() {},
    // ── Handle Item Click ──
    handleItemClick(name, price, category) {
      if (['rooms', 'cottage', 'event'].includes(category)) {
        // Open booking modal for accommodations
        this.pendingBookingItem = { name, price, category };
        this.showBookingModal = true;
      } else {
        // Direct add for restaurant items
        this.addItem(name, price);
      }
    },
    // ── Handle Booking Confirmation ──
    async handleBookingConfirm(bookingData) {
      try {
        const guestName = `${bookingData.firstName} ${bookingData.lastName}`;
        
        // Step 1: Create booking in database with auto check-in
        const bookingResponse = await axios.post('http://localhost:8000/api/bookings/confirm', {
          guest: {
            firstName: bookingData.firstName,
            lastName: bookingData.lastName,
            phone: bookingData.phone || '',
            email: bookingData.email || '',
            address: '',
            city: '',
            postal: '',
            country: 'Philippines'
          },
          checkIn: bookingData.checkIn,
          checkOut: bookingData.checkOut,
          isSwimmingOnly: false,
          items: [{
            item_id: this.pendingBookingItem.category,
            name: this.pendingBookingItem.name,
            category: this.pendingBookingItem.category,
            qty: 1,
            guests: bookingData.adults + bookingData.children,
            price: this.pendingBookingItem.price,
            perNight: true
          }],
          paymentMethod: 'pos-walkin',
          total: bookingData.lineTotal
        });

        if (!bookingResponse.data.success) {
          throw new Error(bookingResponse.data.error || 'Failed to create booking');
        }

        const { bookingId, bookingReference } = bookingResponse.data.data;

        // Step 2: Auto check-in the booking
        await axios.post(`http://localhost:8000/api/bookings/${bookingId}/check-in`, {
          checked_in_by: this.userRole || 'staff',
          checked_in_time: new Date().toISOString()
        });

        // Step 3: Create PayMongo payment link for walk-in booking
        const paymentResponse = await axios.post('http://localhost:8000/api/paymongo/create-payment-link', {
          amount: bookingData.lineTotal,
          description: `Eduardo's Resort Booking - ${bookingReference}`,
          bookingId: bookingId,
          email: bookingData.email || `walkin-${bookingReference}@resort.local`,
          paymentMethod: 'gcash' // Default for walk-ins, can be changed
        });

        if (!paymentResponse.data.success) {
          throw new Error('Failed to create payment link');
        }

        // Step 4: Generate QR code from the payment link (not booking reference)
        const checkoutUrl = paymentResponse.data.checkout_url;
        const paymentQR = await QRCode.toDataURL(checkoutUrl, {
          errorCorrectionLevel: 'H',
          type: 'image/png',
          width: 200,
          margin: 1,
          color: { dark: '#2B6CB0', light: '#FFFFFF' }
        });

        // Step 5: Add to cart
        this.cart.push({
          name: this.pendingBookingItem.name,
          price: bookingData.lineTotal,
          isBooking: true,
          bookingId,
          bookingReference,
          paymentUrl: checkoutUrl,
          paymentQR, // QR encodes payment link now
          firstName: bookingData.firstName,
          lastName: bookingData.lastName,
          phone: bookingData.phone,
          email: bookingData.email,
          adults: bookingData.adults,
          children: bookingData.children,
          checkIn: bookingData.checkIn,
          checkOut: bookingData.checkOut,
          nights: bookingData.nights,
          specialRequests: bookingData.specialRequests
        });

        this.total += bookingData.lineTotal;
        this.showToast(`✅ Booking created! Reference: ${bookingReference}`, 'success');
        this.pendingBookingItem = null;

      } catch (error) {
        console.error('Booking error:', error);
        this.showToast(error.message || '❌ Failed to create booking', 'error');
      }
    },
    addItem(name, price) { this.cart.push({ name, price }); this.total += price; },
    removeItem(index) { this.total -= this.cart[index].price; this.cart.splice(index, 1); },
    clearCart() {
      if (this.cart.length > 0 && confirm('Clear all items from the current transaction?')) {
        this.cart = []; this.total = 0;
      }
    },
    async checkout() {
      if (this.cart.length === 0) { this.showToast('❌ No items added', 'error'); return; }
      if (isNaN(this.receiptNo) || this.receiptNo < 1) this.receiptNo = 1;
      const now = new Date();
      
      // Separate bookings from regular items for transaction record
      const transactionItems = this.cart.map(item => ({
        name: item.name,
        price: item.isBooking ? item.price : item.price,
        ...(item.isBooking && { bookingId: item.bookingId, bookingReference: item.bookingReference })
      }));

      const transaction = {
        receiptNo: String(Math.floor(this.receiptNo)).padStart(3, '0'),
        items: transactionItems,
        type: 'Walk-in',
        payment: this.paymentMethod,
        total: this.total,
        date: now.toISOString().split('T')[0],
        time: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }),
        // Store complete booking details for later printing
        bookingDetails: this.cart.filter(item => item.isBooking).map(item => ({
          firstName: item.firstName,
          lastName: item.lastName,
          phone: item.phone,
          email: item.email,
          roomName: item.name,
          checkInDate: item.checkIn,
          checkOutDate: item.checkOut,
          nights: item.nights,
          adults: item.adults,
          children: item.children,
          bookingReference: item.bookingReference,
          paymentUrl: item.paymentUrl
        }))
      };
      
      try {
        await axios.post(`${API_BASE}/transactions`, {
          receipt_no: transaction.receiptNo, 
          items: transaction.items, 
          type: transaction.type,
          payment_method: transaction.payment, 
          total_amount: transaction.total,
          transaction_date: transaction.date, 
          transaction_time: transaction.time
        });

        // Show receipt with QR codes for bookings
        const hasBookings = this.cart.some(item => item.isBooking);
        if (hasBookings) {
          this.showBookingReceipt(transaction);
        }

        this.transactionHistory.unshift(transaction);
        this.receiptNo++;
        this.showToast(`✅ Transaction completed! Receipt: POS-${transaction.receiptNo}`, 'success');
        this.cart = []; 
        this.total = 0;
      } catch (error) {
        this.showToast('❌ Failed to save transaction. Please try again.', 'error');
      }
    },
    showBookingReceipt(transaction) {
      const bookings = this.cart.filter(item => item.isBooking);
      
      // Send each booking to thermal printer directly (no dialog)
      bookings.forEach(async (booking, idx) => {
        try {
          const receiptData = {
            receiptNo: `POS-${transaction.receiptNo}`,
            date: transaction.date,
            time: transaction.time,
            guestName: `${booking.firstName} ${booking.lastName}`,
            phone: booking.phone || 'N/A',
            email: booking.email || 'N/A',
            roomName: booking.name,
            checkInDate: booking.checkIn,
            checkOutDate: booking.checkOut,
            nights: booking.nights,
            adults: booking.adults,
            children: booking.children,
            pricePerNight: booking.nights > 0 ? (booking.price / booking.nights).toFixed(2) : '0.00',
            total: booking.price,
            paymentMethod: this.paymentMethod,
            bookingReference: booking.bookingReference,
            paymentUrl: booking.paymentUrl
          };

          // Send to backend thermal printer service  
          const response = await axios.post(`http://localhost:8000/api/pos/print/booking`, receiptData);
          
          if (response.data.success) {
            this.showToast(`✅ Receipt printed! Ref: ${booking.bookingReference}`, 'success');
          } else {
            // If printer fails, fallback to system print dialog (optional)
            console.log('Printer unavailable, falling back to system dialog');
            this.showToast(`⚠️ Printer service unavailable. Using system print dialog.`, 'warning');
            // Could uncomment to use window.print() as fallback
            // this.showSystemPrintDialog(transaction);
          }
        } catch (error) {
          console.error('Print error:', error);
          this.showToast(`⚠️ Print failed: ${error.message}`, 'warning');
        }
      });
    },
    getItemsPreview(items) {
      const list = items.map(i => i.name).join(', ');
      return list.length > 30 ? list.substring(0, 30) + '...' : list;
    },
    viewDetails(receiptNo) {
      const trans = this.transactionHistory.find(t => t.receiptNo === receiptNo);
      if (!trans) return;
      this.viewedTransactions.add(receiptNo);
      localStorage.setItem('viewedEshopOrders', JSON.stringify(Array.from(this.viewedTransactions)));
      this.selectedTransaction = trans;
      this.showTransactionDetails = true;
    },
    printReceipt(receiptNo) {
      const trans = this.transactionHistory.find(t => t.receiptNo === receiptNo);
      if (!trans) return;
      
      // Check if this is a booking transaction
      const hasBookings = trans.items.some(item => item.bookingReference);
      
      if (hasBookings && trans.bookingDetails && trans.bookingDetails.length > 0) {
        // For bookings, send to thermal printer service
        const bookingDetail = trans.bookingDetails[0];
        const receiptData = {
          receiptNo: `POS-${trans.receiptNo}`,
          date: trans.date,
          time: trans.time,
          guestName: `${bookingDetail.firstName} ${bookingDetail.lastName}`,
          phone: bookingDetail.phone || 'N/A',
          email: bookingDetail.email || 'N/A',
          roomName: bookingDetail.roomName || 'N/A',
          checkInDate: bookingDetail.checkInDate || 'N/A',
          checkOutDate: bookingDetail.checkOutDate || 'N/A',
          nights: bookingDetail.nights || 0,
          adults: bookingDetail.adults || 0,
          children: bookingDetail.children || 0,
          pricePerNight: bookingDetail.nights ? (trans.total / bookingDetail.nights).toFixed(2) : '0.00',
          total: trans.total,
          paymentMethod: trans.payment,
          bookingReference: bookingDetail.bookingReference
        };
        
        // Send to backend printer service
        axios.post('http://localhost:8000/api/pos/print/booking', receiptData)
          .then(response => {
            if (response.data.success) {
              this.showToast(`✅ Receipt sent to printer! Ref: ${bookingDetail.bookingReference}`, 'success');
            } else {
              this.showToast(`⚠️ Printer service unavailable`, 'warning');
            }
          })
          .catch(error => {
            this.showToast(`❌ Print failed: ${error.message}`, 'error');
          });
      } else {
        // For regular POS items, send to thermal printer service
        const receiptData = {
          receiptNo: `POS-${trans.receiptNo}`,
          date: trans.date,
          time: trans.time,
          items: trans.items.map(item => ({
            name: item.name,
            price: parseFloat(item.price),
            quantity: 1,
            total: parseFloat(item.price)
          })),
          total: trans.total,
          paymentMethod: trans.payment
        };
        
        // Send to backend printer service
        axios.post('http://localhost:8000/api/pos/print/regular', receiptData)
          .then(response => {
            if (response.data.success) {
              this.showToast(`✅ Receipt sent to printer!`, 'success');
            } else {
              this.showToast(`⚠️ Printer service unavailable`, 'warning');
            }
          })
          .catch(error => {
            this.showToast(`❌ Print failed: ${error.message}`, 'error');
          });
      }
    },
    async deleteTransaction(receiptNo) {
      if (!confirm('Delete this transaction permanently?')) return;
      const idx = this.transactionHistory.findIndex(t => t.receiptNo === receiptNo);
      if (idx === -1) return;
      try {
        const response = await axios.get(`${API_BASE}/transactions`);
        const backend = response.data.find(t => t.receipt_no === this.transactionHistory[idx].receiptNo);
        if (backend) await axios.delete(`${API_BASE}/transactions/${backend.id}`);
        this.transactionHistory.splice(idx, 1);
      } catch (error) {
        this.showToast('❌ Failed to delete transaction', 'error');
      }
    },
    async clearHistory() {
      if (!confirm('Clear all transaction history?')) return;
      try {
        await axios.delete(`${API_BASE}/transactions`);
        this.transactionHistory = [];
      } catch (error) {
        this.showToast('❌ Failed to clear transaction history', 'error');
      }
    },
    exportAllTransactions() {
      if (this.transactionHistory.length === 0) { this.showToast('❌ No transactions to export', 'error'); return; }
      try {
        const data = this.transactionHistory.map((t, i) => ({
          'No.': i + 1, 'Receipt No.': `POS-${t.receiptNo}`,
          'Items': t.items.map(item => `${item.name} (₱${item.price})`).join('; '),
          'Type': t.type, 'Payment Method': t.payment, 'Total': t.total, 'Date': t.date, 'Time': t.time
        }));
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(data);
        XLSX.utils.book_append_sheet(wb, ws, 'Transactions');
        const filename = `POS_Transactions_${new Date().toISOString().split('T')[0]}.xlsx`;
        XLSX.writeFile(wb, filename);
        this.showToast(`✅ Export successful! File: ${filename}`, 'success');
      } catch (error) {
        this.showToast('❌ Failed to export data.', 'error');
      }
    },
    downloadReceipt(receiptNo) {
      const trans = this.transactionHistory.find(t => t.receiptNo === receiptNo);
      if (!trans) return;
      let csv = `ReserVision\nReceipt: POS-${trans.receiptNo}\nDate: ${trans.date}\nTime: ${trans.time}\nPayment: ${trans.payment}\n\nItem,Price\n`;
      trans.items.forEach(item => { csv += `"${item.name}",${item.price}\n`; });
      csv += `\nTotal,${trans.total}\n`;
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `Receipt_POS-${trans.receiptNo}.csv`;
      link.click();
    },
    customizeReceipt(receiptNo) {
      this.selectedReceipt = this.transactionHistory.find(t => t.receiptNo === receiptNo);
      this.showReceiptCustomizer = true;
    },
    downloadReceipt(receiptNo) { const t = this.transactionHistory.find(x => x.receiptNo === receiptNo); if (t) this.saveReceiptToCSV(t); },
    customizeReceipt(receiptNo) { this.selectedReceipt = this.transactionHistory.find(x => x.receiptNo === receiptNo); this.showReceiptCustomizer = true; },
    downloadCustomizedReceipt() {
      if (!this.selectedReceipt) return;
      this.printReceipt(this.selectedReceipt.receiptNo);
    },
    saveReceiptStyle() {
      localStorage.setItem('receiptStyle', JSON.stringify(this.receiptStyle));
      this.showToast('✅ Receipt style saved!', 'success');
    },
    handleCheckInSuccess() {
      this.isCheckinScannerOpen = false;
      this.showToast('✅ Guest checked in successfully', 'success');
    },
    showToast(msg, type = 'success') {
      this.toastMessage = msg;
      this.toastType = type;
      setTimeout(() => { this.toastMessage = ''; }, 4000);
    }
  }
};
</script>

<style scoped>
/* ── Admin Layout ── */
.admin-layout {
  display: flex;
  min-height: 100vh;
  background: #F8F7F4;
}

.main-content {
  flex: 1;
  margin-left: 260px;
  transition: margin-left 0.3s ease;
}

.main-content.shifted { margin-left: 70px; }

.header-container {
  padding: 1rem 2rem;
  background: #ffffff;
  border-bottom: 1px solid #e2e8f0;
  top: 0;
  z-index: 50;
  margin-bottom: 10px;
  margin-top: 20px;
}

.pos-container {
  padding: 1.5rem;
  background: #F8F7F4;
  min-height: 100vh;
  max-width: 1240px;
  margin: 0 auto;
}

/* ── BOOKMARK TABS ── */
.side-bookmarks {
  position: fixed;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  gap: 6px;
  z-index: 400;
}

.bookmark-tab {
  display: flex;
  align-items: center;
  padding: 0.85rem 0.9rem;
  color: #fff;
  font-family: inherit;
  font-size: 0.82rem;
  font-weight: 700;
  border: none;
  border-radius: 10px 0 0 10px;
  cursor: pointer;
  box-shadow: -3px 3px 14px rgba(59, 103, 230, 0.28);
  overflow: hidden;
  white-space: nowrap;
  /* width, gap, background all controlled by Vue :style binding */
}

.tab-icon {
  font-size: 1rem;
  flex-shrink: 0;
  min-width: 16px;
}

.tab-label {
  white-space: nowrap;
  overflow: hidden;
}

.tab-badge {
  background: #ef4444;
  color: #fff;
  font-size: 0.62rem;
  font-weight: 800;
  padding: 0.1rem 0.42rem;
  border-radius: 20px;
  min-width: 18px;
  text-align: center;
  line-height: 1.5;
  flex-shrink: 0;
  margin-left: auto;
}

/* ── POS / Transaction sections ── */
.pos-section { animation: fadeIn 0.22s ease; }
.transaction-section { animation: fadeIn 0.22s ease; }

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(6px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* ── POS Grid ── */
.pos-grid { align-items: stretch; }

.items-card, .cart-card {
  min-height: 680px;
  max-height: 680px;
}

.items-card { display: flex; flex-direction: column; }
.cart-card  { display: flex; flex-direction: column; }

.cart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.9rem;
}

.cart-content {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
}

.cart-items-area {
  flex: 1;
  min-height: 280px;
  overflow-y: auto;
  padding-right: 2px;
  border-bottom: 1px solid #e5e7eb;
  margin-bottom: 0.9rem;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.cart-items-area::-webkit-scrollbar { width: 0; height: 0; }

.cart-empty-state {
  min-height: 250px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #9ca3af;
}

.cart-bottom { margin-top: auto; }

.total-panel {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f3f4f6;
  border-radius: 10px;
  padding: 0.9rem 1rem;
  margin-bottom: 0.85rem;
}

.payment-wrap { margin-bottom: 0.2rem; }
.pay-btn { min-height: 52px; }

.items-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.9rem;
  min-height: 30px;
}

.section-title {
  font-size: 1.5rem;
  line-height: 1;
  margin: 0;
  white-space: nowrap;
}

.category-switch {
  display: flex;
  gap: 0.45rem;
  flex-wrap: nowrap;
  justify-content: flex-end;
  overflow-x: auto;
  scrollbar-width: none;
}
.category-switch::-webkit-scrollbar { display: none; }

.menu-filter-wrap {
  border-bottom: 1px solid #e5e7eb;
  padding-bottom: 0.65rem;
}

.items-scroll {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding-right: 2px;
  scrollbar-width: none;
}
.items-scroll::-webkit-scrollbar { width: 0; height: 0; }

.card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  transition: all 0.3s ease;
}
.card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.12); }

.item-btn {
  transition: all 0.2s ease;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  cursor: pointer;
  min-height: 76px;
}
.item-btn:hover {
  border-color: #3b82f6;
  transform: translateY(-1px);
  box-shadow: 0 6px 14px rgba(59,130,246,0.16);
}

.category-btn {
  transition: all 0.2s ease;
  font-weight: 500;
  border: 1px solid transparent;
  line-height: 1;
  height: 36px;
  padding: 0 15px;
  font-size: 0.86rem;
  white-space: nowrap;
}
.category-btn:hover { transform: translateY(-1px); box-shadow: 0 4px 10px rgba(15,23,42,0.12); }

.btn-success { transition: all 0.2s ease; }
.btn-success:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(22,163,74,0.3); }

.cart-item {
  transition: all 0.2s ease;
  padding: 0.55rem;
  border-radius: 6px;
}
.cart-item:hover { background: #f9fafb; }

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
  .items-topbar { flex-direction: column; align-items: flex-start; }
  .category-switch { width: 100%; justify-content: flex-start; }
  /* responsive handled by Vue getTabStyle */
}
</style>