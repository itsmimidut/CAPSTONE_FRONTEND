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
                :id="`btn-${category.id}`" 
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
              <button
                type="button"
                @click="restaurantTypeFilter = 'all'"
                :class="[
                  'px-3 py-1.5 rounded-full text-sm font-semibold border transition-all chip-btn',
                  restaurantTypeFilter === 'all'
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400 hover:text-blue-700'
                ]"
              >
                All
              </button>
              <button
                v-for="filter in restaurantTypeFilters"
                :key="filter"
                type="button"
                @click="restaurantTypeFilter = filter"
                :class="[
                  'px-3 py-1.5 rounded-full text-sm font-semibold border transition-all chip-btn',
                  restaurantTypeFilter === filter
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400 hover:text-blue-700'
                ]"
              >
                {{ filter }}
              </button>
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
                @click="addItem(item.name, item.price)" 
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
                class="cart-item flex justify-between items-center"
              >
                <span class="text-gray-700">{{ item.name }}</span>
                <div class="flex items-center gap-3">
                  <span class="font-semibold text-gray-800">₱{{ item.price.toLocaleString() }}</span>
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
                  <button
                    type="button"
                    class="payment-btn flex-1 py-3 rounded-lg border text-base font-semibold flex items-center justify-center"
                    :class="paymentMethod === 'GCash' ? 'bg-green-50 border-green-600 text-green-700 ring-2 ring-green-200' : 'bg-white border-gray-300 text-gray-700'"
                    @click="paymentMethod = 'GCash'"
                  >
                    <i class="fas fa-wallet text-green-600 text-lg mr-2"></i> GCash
                    <span v-if="paymentMethod === 'GCash'" class="ml-2"><i class="fas fa-check-circle text-primary-blue"></i></span>
                  </button>
                  <button
                    type="button"
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

      <!-- TRANSACTIONS -->
      <div class="card p-6 mt-6">
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
                :class="[
                  'border-b hover:bg-blue-50 transition-colors',
                  trans.source === 'eshop' && !viewedTransactions.has(trans.receiptNo) ? 'bg-yellow-50 border-l-4 border-yellow-400' : ''
                ]"
              >
                <td class="p-3 font-semibold text-blue-700">
                  POS-{{ trans.receiptNo }}
                  <span 
                    v-if="trans.source === 'eshop' && !viewedTransactions.has(trans.receiptNo)"
                    class="ml-2 inline-block bg-yellow-400 text-yellow-900 px-2 py-1 rounded text-xs font-bold"
                  >
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
        <!-- Modal Header -->
        <div class="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 flex justify-between items-center border-b">
          <div>
            <h3 class="text-2xl font-bold"><i class="fas fa-palette mr-2"></i>Customize Receipt</h3>
            <p class="text-blue-100 text-sm mt-1">POS-{{ selectedReceipt?.receiptNo }}</p>
          </div>
          <button @click="showReceiptCustomizer = false" class="text-2xl hover:bg-blue-600 p-2 rounded transition-colors">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <!-- Modal Body -->
        <div class="p-6 space-y-6">
          <!-- Color Settings -->
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
              <div>
                <label class="text-sm font-semibold text-gray-700 mb-2 block">Total Background</label>
                <div class="flex gap-2">
                  <input type="color" v-model="receiptStyle.totalBg" class="w-12 h-10 rounded cursor-pointer">
                  <input type="text" v-model="receiptStyle.totalBg" class="flex-1 border rounded px-2 py-1 text-sm font-mono">
                </div>
              </div>
              <div>
                <label class="text-sm font-semibold text-gray-700 mb-2 block">Total Text</label>
                <div class="flex gap-2">
                  <input type="color" v-model="receiptStyle.totalText" class="w-12 h-10 rounded cursor-pointer">
                  <input type="text" v-model="receiptStyle.totalText" class="flex-1 border rounded px-2 py-1 text-sm font-mono">
                </div>
              </div>
            </div>
          </div>

          <!-- Font Settings -->
          <div class="border rounded-lg p-4 bg-gray-50">
            <h4 class="font-bold text-gray-800 mb-4"><i class="fas fa-font mr-2"></i>Typography</h4>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="text-sm font-semibold text-gray-700 mb-2 block">Company Name Size</label>
                <input type="number" v-model.number="receiptStyle.companySize" min="12" max="32" class="w-full border rounded px-3 py-2">
              </div>
              <div>
                <label class="text-sm font-semibold text-gray-700 mb-2 block">Item Font Size</label>
                <input type="number" v-model.number="receiptStyle.itemSize" min="10" max="16" class="w-full border rounded px-3 py-2">
              </div>
              <div>
                <label class="text-sm font-semibold text-gray-700 mb-2 block">Total Font Size</label>
                <input type="number" v-model.number="receiptStyle.totalSize" min="14" max="28" class="w-full border rounded px-3 py-2">
              </div>
              <div>
                <label class="text-sm font-semibold text-gray-700 mb-2 block">Font Family</label>
                <select v-model="receiptStyle.fontFamily" class="w-full border rounded px-3 py-2">
                  <option value="'Courier New', monospace">Courier New (Default)</option>
                  <option value="'Arial', sans-serif">Arial</option>
                  <option value="'Times New Roman', serif">Times New Roman</option>
                  <option value="'Verdana', sans-serif">Verdana</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Receipt Content Settings -->
          <div class="border rounded-lg p-4 bg-gray-50">
            <h4 class="font-bold text-gray-800 mb-4"><i class="fas fa-file-alt mr-2"></i>Content</h4>
            <div class="space-y-3">
              <div class="flex items-center">
                <input type="checkbox" v-model="receiptStyle.showCompanyName" id="showCompany" class="w-4 h-4 rounded">
                <label for="showCompany" class="ml-3 text-sm font-medium text-gray-700">Show Company Name</label>
              </div>
              <div class="flex items-center">
                <input type="checkbox" v-model="receiptStyle.showDateTime" id="showDateTime" class="w-4 h-4 rounded">
                <label for="showDateTime" class="ml-3 text-sm font-medium text-gray-700">Show Date & Time</label>
              </div>
              <div class="flex items-center">
                <input type="checkbox" v-model="receiptStyle.showFooter" id="showFooter" class="w-4 h-4 rounded">
                <label for="showFooter" class="ml-3 text-sm font-medium text-gray-700">Show Footer Message</label>
              </div>
              <div>
                <label class="text-sm font-semibold text-gray-700 mb-2 block">Company Name</label>
                <input type="text" v-model="receiptStyle.companyName" placeholder="ReserVision" class="w-full border rounded px-3 py-2">
              </div>
              <div>
                <label class="text-sm font-semibold text-gray-700 mb-2 block">Receipt Title</label>
                <input type="text" v-model="receiptStyle.receiptTitle" placeholder="Point of Sale" class="w-full border rounded px-3 py-2">
              </div>
            </div>
          </div>

          <!-- Preview -->
          <div class="border rounded-lg p-4 bg-gray-50">
            <h4 class="font-bold text-gray-800 mb-4"><i class="fas fa-eye mr-2"></i>Preview</h4>
            <div class="bg-white border-2 border-dashed p-4" :style="{ fontFamily: receiptStyle.fontFamily }">
              <div v-if="receiptStyle.showCompanyName" class="text-center" :style="{ fontSize: receiptStyle.companySize + 'px', color: receiptStyle.headerText }">
                <strong>{{ receiptStyle.companyName }}</strong>
              </div>
              <div class="text-center text-sm mb-3" :style="{ fontSize: receiptStyle.itemSize + 'px' }">
                {{ receiptStyle.receiptTitle }}
              </div>
              <div class="border-t border-b py-2 mb-2" v-if="selectedReceipt">
                <div :style="{ fontSize: receiptStyle.itemSize + 'px' }" class="text-sm">Sample Item 1</div>
              </div>
              <div class="text-center font-bold p-2" :style="{ fontSize: receiptStyle.totalSize + 'px', backgroundColor: receiptStyle.totalBg, color: receiptStyle.totalText }">
                TOTAL: ₱1,000.00
              </div>
            </div>
          </div>
        </div>

        <!-- Modal Footer -->
        <div class="sticky bottom-0 bg-gray-100 p-6 flex gap-3 justify-end border-t">
          <button @click="showReceiptCustomizer = false" class="px-6 py-2 bg-gray-300 text-gray-800 rounded-lg font-semibold hover:bg-gray-400 transition-colors">
            Cancel
          </button>
          <button @click="downloadCustomizedReceipt" class="px-6 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors">
            <i class="fas fa-download mr-2"></i>Download Receipt
          </button>
          <button @click="saveReceiptStyle" class="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors">
            <i class="fas fa-save mr-2"></i>Save Style
          </button>
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
  components: {
    AdminSidebar,
    AdminHeader
  },
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
        headerBg: '#1e3a8a',
        headerText: '#ffffff',
        totalBg: '#3b82f6',
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
        {
          id: 'restaurant',
          name: 'Restaurant',
          icon: 'utensils',
          items: []
        },
        {
          id: 'rooms',
          name: 'Rooms',
          icon: 'bed',
          items: []
        },
        {
          id: 'cottage',
          name: 'Cottage',
          icon: 'home',
          items: []
        },
        {
          id: 'event',
          name: 'Event',
          icon: 'calendar-alt',
          items: []
        }
      ],
      viewedTransactions: new Set(JSON.parse(localStorage.getItem('viewedEshopOrders') || '[]'))
    };
  },
  computed: {
    userRole() {
      return this.auth.role || 'staff';
    },
    visibleCategories() {
      if (this.userRole === 'admin') {
        return this.categories;
      }

      if (this.userRole === 'receptionist') {
        return this.categories.filter(category => category.id !== 'restaurant');
      }

      return this.categories.filter(category => category.id === 'restaurant');
    },
    restaurantTypeFilters() {
      const restaurantCategory = this.categories.find(category => category.id === 'restaurant');
      if (!restaurantCategory) {
        return [];
      }

      return [...new Set(
        restaurantCategory.items
          .map(item => (item.description || '').trim())
          .filter(Boolean)
      )].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
    },
    filteredTransactionHistory() {
      if (this.userRole === 'admin') {
        return this.transactionHistory;
      }

      return this.transactionHistory.filter(trans => {
        const hasRestaurantItem = this.hasItemFromCategory(trans.items, 'restaurant');
        
        if (this.userRole === 'restaurantstaff') {
          return hasRestaurantItem;
        }
        
        if (this.userRole === 'receptionist') {
          return !hasRestaurantItem;
        }
        
        return true;
      });
    },
    eshopPendingCount() {
      return this.transactionHistory.filter(trans => 
        trans.source === 'eshop' && !this.viewedTransactions.has(trans.receiptNo)
      ).length;
    }
  },
  watch: {
    visibleCategories(newCategories) {
      if (!newCategories.some(category => category.id === this.currentCategory)) {
        this.currentCategory = newCategories[0]?.id || '';
      }
    },
    currentCategory(newCategory) {
      if (newCategory !== 'restaurant') {
        this.restaurantTypeFilter = 'all';
      }
    },
    eshopPendingCount(newCount) {
      this.notifications.setEshopPending(newCount)
    }
  },
  async mounted() {
    await this.fetchItems();
    await this.fetchTransactions();
    this.updateReceiptNumber();
    
    // Load saved receipt style from localStorage
    const savedStyle = localStorage.getItem('receiptStyle');
    if (savedStyle) {
      try {
        this.receiptStyle = { ...this.receiptStyle, ...JSON.parse(savedStyle) };
      } catch (error) {
        console.error('Error loading saved receipt style:', error);
      }
    }
  },
  methods: {
    async fetchItems() {
      try {
        const response = await axios.get(`${API_BASE}/items`);
        const items = response.data;
        
        console.log('📦 Fetched items from backend:', items);
        console.log('📦 Total items:', items.length);
        
        // Log items by category
        const categoryCounts = {};
        items.forEach(item => {
          categoryCounts[item.category] = (categoryCounts[item.category] || 0) + 1;
        });
        console.log('📦 Items per category:', categoryCounts);
        
        // Group items by category
        this.categories.forEach(category => {
          category.items = items
            .filter(item => item.category === category.id)
            .map(item => ({
              name: item.name,
              price: parseFloat(item.price),
              description: item.description || ''
            }));
          
          console.log(`📦 ${category.name} (${category.id}):`, category.items.length, 'items');
        });
      } catch (error) {
        console.error('Error fetching POS items:', error);
        alert('Failed to load items from server');
      }
    },
    async fetchTransactions() {
      try {
        const response = await axios.get(`${API_BASE}/transactions`);
        this.transactionHistory = response.data.map(trans => {
          // Detect if it's an eshop order by checking receipt number format
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
          }
        });
        
        // Clean up viewed transactions that no longer exist
        const currentReceiptNos = new Set(this.transactionHistory.map(t => t.receiptNo));
        const viewedToKeep = new Set(
          Array.from(this.viewedTransactions).filter(receiptNo => currentReceiptNos.has(receiptNo))
        );
        this.viewedTransactions = viewedToKeep;
        localStorage.setItem('viewedEshopOrders', JSON.stringify(Array.from(this.viewedTransactions)));
      } catch (error) {
        console.error('Error fetching transactions:', error);
      }
    },
    updateReceiptNumber() {
      if (this.transactionHistory.length > 0) {
        const lastReceipt = Math.max(...this.transactionHistory.map(t => parseInt(t.receiptNo)));
        this.receiptNo = lastReceipt + 1;
      }
    },
    showCategory(categoryId) {
      if (!this.visibleCategories.some(category => category.id === categoryId)) {
        return;
      }
      this.currentCategory = categoryId;
      this.searchQuery = '';
      if (categoryId !== 'restaurant') {
        this.restaurantTypeFilter = 'all';
      }
    },
    getFilteredItems(items, categoryId) {
      let filtered = [...items];

      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        filtered = filtered.filter(item => item.name.toLowerCase().includes(query));
      }

      if (categoryId === 'restaurant' && this.restaurantTypeFilter !== 'all') {
        filtered = filtered.filter(
          item => (item.description || '').toLowerCase() === this.restaurantTypeFilter.toLowerCase()
        );
      }

      return filtered;
    },
    hasItemFromCategory(transactionItems, categoryId) {
      const categoryItems = this.categories.find(cat => cat.id === categoryId)?.items || [];
      const categoryItemNames = categoryItems.map(item => item.name.toLowerCase());
      
      return transactionItems.some(transItem => 
        categoryItemNames.includes(transItem.name.toLowerCase())
      );
    },
    filterItems() {
      // Filter is handled reactively in getFilteredItems
    },
    addItem(name, price) {
      this.cart.push({ name, price });
      this.total += price;
    },
    removeItem(index) {
      this.total -= this.cart[index].price;
      this.cart.splice(index, 1);
    },
    clearCart() {
      if (this.cart.length > 0) {
        if (confirm('Are you sure you want to clear all items from the current transaction?')) {
          this.cart = [];
          this.total = 0;
        }
      }
    },
    async checkout() {
      if (this.cart.length === 0) {
        alert("No items added");
        return;
      }

      const now = new Date();
      const date = now.toISOString().split("T")[0];
      const time = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
      
      const transaction = {
        receiptNo: String(this.receiptNo).padStart(3, '0'),
        items: [...this.cart],
        type: "Walk-in",
        payment: this.paymentMethod,
        total: this.total,
        date: date,
        time: time
      };

      const payload = {
        receipt_no: transaction.receiptNo,
        items: transaction.items,
        type: transaction.type,
        payment_method: transaction.payment,
        total_amount: transaction.total,
        transaction_date: transaction.date,
        transaction_time: transaction.time
      };
      
      try {
        // Save to backend
        await axios.post(`${API_BASE}/transactions`, payload);
        
        // Add to local history
        this.transactionHistory.unshift(transaction);

        this.receiptNo++;
        alert(`Transaction completed! Receipt: POS-${transaction.receiptNo}\nTotal: ₱${this.total.toLocaleString()}`);
        
        // Clear cart after successful checkout
        this.cart = [];
        this.total = 0;
      } catch (error) {
        const details = error?.response?.data || error?.message || error;
        console.error('Error saving transaction:', details);
        alert('Failed to save transaction. Please try again.');
      }
    },
    getItemsPreview(items) {
      const itemsList = items.map(item => item.name).join(", ");
      return itemsList.length > 30 ? itemsList.substring(0, 30) + "..." : itemsList;
    },
    viewDetails(receiptNo) {
      const trans = this.transactionHistory.find(t => t.receiptNo === receiptNo);
      if (!trans) return;
      
      // Mark as viewed
      this.viewedTransactions.add(receiptNo);
      
      // Persist to localStorage
      localStorage.setItem('viewedEshopOrders', JSON.stringify(Array.from(this.viewedTransactions)))
      
      let itemsDetail = trans.items.map(item => `${item.name} - ₱${item.price.toLocaleString()}`).join('\n');
      
      alert(`Receipt: POS-${trans.receiptNo}\n` +
            `Date: ${trans.date} ${trans.time}\n` +
            `Type: ${trans.type}\n` +
            `Payment: ${trans.payment}\n\n` +
            `Items:\n${itemsDetail}\n\n` +
            `Total: ₱${trans.total.toLocaleString()}`);
    },
    printReceipt(receiptNo) {
      const trans = this.transactionHistory.find(t => t.receiptNo === receiptNo);
      if (!trans) return;
      
      const printWindow = window.open('', '', 'width=300,height=600');
      
      let itemsHTML = trans.items.map(item => 
        `<tr>
          <td style="padding: 4px 0;">${item.name}</td>
          <td style="padding: 4px 0; text-align: right;">₱${item.price.toLocaleString()}</td>
        </tr>`
      ).join('');
      
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Receipt POS-${trans.receiptNo}</title>
          <style>
            body {
              font-family: 'Courier New', monospace;
              width: 300px;
              margin: 20px auto;
              padding: 20px;
            }
            .header {
              text-align: center;
              border-bottom: 2px dashed #000;
              padding-bottom: 10px;
              margin-bottom: 15px;
            }
            .title {
              font-size: 20px;
              font-weight: bold;
              margin-bottom: 5px;
            }
            .info {
              margin: 10px 0;
              font-size: 12px;
            }
            table {
              width: 100%;
              margin: 15px 0;
              font-size: 13px;
            }
            .total-section {
              border-top: 2px dashed #000;
              padding-top: 10px;
              margin-top: 10px;
            }
            .total {
              font-size: 16px;
              font-weight: bold;
              display: flex;
              justify-content: space-between;
            }
            .footer {
              text-align: center;
              margin-top: 20px;
              border-top: 2px dashed #000;
              padding-top: 10px;
              font-size: 11px;
            }
            @media print {
              body {
                margin: 0;
                padding: 10px;
              }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">ReserVision</div>
            <div>Point of Sale</div>
          </div>
          
          <div class="info">
            <div><strong>Receipt:</strong> POS-${trans.receiptNo}</div>
            <div><strong>Date:</strong> ${trans.date}</div>
            <div><strong>Time:</strong> ${trans.time}</div>
            <div><strong>Type:</strong> ${trans.type}</div>
            <div><strong>Payment:</strong> ${trans.payment}</div>
          </div>
          
          <table>
            <thead>
              <tr style="border-bottom: 1px solid #000;">
                <th style="text-align: left; padding: 5px 0;">Item</th>
                <th style="text-align: right; padding: 5px 0;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHTML}
            </tbody>
          </table>
          
          <div class="total-section">
            <div class="total">
              <span>TOTAL:</span>
              <span>₱${trans.total.toLocaleString()}</span>
            </div>
          </div>
          
          <div class="footer">
            <p>Thank you for your business!</p>
            <p>Please come again</p>
          </div>
        </body>
        </html>
      `);
      
      printWindow.document.close();
      printWindow.focus();
      
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 250);
    },
    async deleteTransaction(receiptNo) {
      if (confirm('Are you sure you want to delete this transaction?')) {
        const transIndex = this.transactionHistory.findIndex(t => t.receiptNo === receiptNo);
        if (transIndex === -1) return;
        
        const transaction = this.transactionHistory[transIndex];
        
        try {
          // Find transaction ID from backend
          const response = await axios.get(`${API_BASE}/transactions`);
          const backendTrans = response.data.find(t => t.receipt_no === transaction.receiptNo);
          
          if (backendTrans) {
            await axios.delete(`${API_BASE}/transactions/${backendTrans.id}`);
          }
          
          this.transactionHistory.splice(transIndex, 1);
        } catch (error) {
          console.error('Error deleting transaction:', error);
          alert('Failed to delete transaction');
        }
      }
    },
    async clearHistory() {
      if (confirm('Are you sure you want to clear all transaction history?')) {
        try {
          await axios.delete(`${API_BASE}/transactions`);
          this.transactionHistory = [];
        } catch (error) {
          console.error('Error clearing history:', error);
          alert('Failed to clear transaction history');
        }
      }
    },
    saveReceiptToCSV(transaction) {
      let csv = 'ReserVision - Receipt\n';
      csv += `Receipt Number,${transaction.receiptNo}\n`;
      csv += `Date,${transaction.date}\n`;
      csv += `Time,${transaction.time}\n`;
      csv += `Type,${transaction.type}\n`;
      csv += `Payment Method,${transaction.payment}\n\n`;
      csv += 'Item,Price\n';
      
      transaction.items.forEach(item => {
        csv += `"${item.name}",${item.price}\n`;
      });
      
      csv += `\nTotal,${transaction.total}\n`;
      
      this.downloadCSV(csv, `Receipt_POS-${transaction.receiptNo}_${transaction.date}.csv`);
    },
    exportAllTransactions() {
      if (this.transactionHistory.length === 0) {
        alert('No transactions to export');
        return;
      }
      
      let csv = 'Receipt Number,Date,Time,Type,Payment Method,Items,Total\n';
      
      this.transactionHistory.forEach(trans => {
        const itemsList = trans.items.map(item => `${item.name} (₱${item.price})`).join('; ');
        csv += `POS-${trans.receiptNo},${trans.date},${trans.time},${trans.type},${trans.payment},"${itemsList}",${trans.total}\n`;
      });
      
      const now = new Date();
      const filename = `POS_Transactions_${now.toISOString().split('T')[0]}.csv`;
      this.downloadCSV(csv, filename);
    },
    downloadCSV(csvContent, filename) {
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      
      if (navigator.msSaveBlob) {
        navigator.msSaveBlob(blob, filename);
      } else {
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    },
    downloadReceipt(receiptNo) {
      const trans = this.transactionHistory.find(t => t.receiptNo === receiptNo);
      if (trans) {
        this.saveReceiptToCSV(trans);
      }
    },
    customizeReceipt(receiptNo) {
      this.selectedReceipt = this.transactionHistory.find(t => t.receiptNo === receiptNo);
      this.showReceiptCustomizer = true;
    },
    downloadCustomizedReceipt() {
      if (!this.selectedReceipt) return;
      
      const trans = this.selectedReceipt;
      let itemsHTML = trans.items.map(item => 
        `<tr>
          <td style="padding: 4px 0;">${item.name}</td>
          <td style="padding: 4px 0; text-align: right;">₱${item.price.toLocaleString()}</td>
        </tr>`
      ).join('');
      
      const printWindow = window.open('', '', 'width=300,height=600');
      
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Receipt POS-${trans.receiptNo}</title>
          <style>
            body {
              font-family: ${this.receiptStyle.fontFamily};
              width: 300px;
              margin: 20px auto;
              padding: 20px;
            }
            .header {
              text-align: center;
              border-bottom: 2px dashed #000;
              padding-bottom: 10px;
              margin-bottom: 15px;
              background-color: ${this.receiptStyle.headerBg};
              color: ${this.receiptStyle.headerText};
              padding: 15px;
              border-radius: 5px;
            }
            .title {
              font-size: ${this.receiptStyle.companySize}px;
              font-weight: bold;
              margin-bottom: 5px;
            }
            .subtitle {
              font-size: 12px;
            }
            .info {
              margin: 10px 0;
              font-size: 12px;
            }
            table {
              width: 100%;
              margin: 15px 0;
              font-size: ${this.receiptStyle.itemSize}px;
            }
            .total-section {
              border-top: 2px dashed #000;
              padding-top: 10px;
              margin-top: 10px;
            }
            .total {
              font-size: ${this.receiptStyle.totalSize}px;
              font-weight: bold;
              display: flex;
              justify-content: space-between;
              background-color: ${this.receiptStyle.totalBg};
              color: ${this.receiptStyle.totalText};
              padding: 10px;
              border-radius: 5px;
            }
            .footer {
              text-align: center;
              margin-top: 20px;
              border-top: 2px dashed #000;
              padding-top: 10px;
              font-size: 11px;
            }
            @media print {
              body {
                margin: 0;
                padding: 10px;
              }
            }
          </style>
        </head>
        <body>
          ${this.receiptStyle.showCompanyName ? `
            <div class="header">
              <div class="title">${this.receiptStyle.companyName}</div>
              <div class="subtitle">${this.receiptStyle.receiptTitle}</div>
            </div>
          ` : ''}
          
          <div class="info">
            <div><strong>Receipt:</strong> POS-${trans.receiptNo}</div>
            ${this.receiptStyle.showDateTime ? `
              <div><strong>Date:</strong> ${trans.date}</div>
              <div><strong>Time:</strong> ${trans.time}</div>
            ` : ''}
            <div><strong>Type:</strong> ${trans.type}</div>
            <div><strong>Payment:</strong> ${trans.payment}</div>
          </div>
          
          <table>
            <thead>
              <tr style="border-bottom: 1px solid #000;">
                <th style="text-align: left; padding: 5px 0;">Item</th>
                <th style="text-align: right; padding: 5px 0;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHTML}
            </tbody>
          </table>
          
          <div class="total-section">
            <div class="total">
              <span>TOTAL:</span>
              <span>₱${trans.total.toLocaleString()}</span>
            </div>
          </div>
          
          ${this.receiptStyle.showFooter ? `
            <div class="footer">
              <p>Thank you for your business!</p>
              <p>Please come again</p>
            </div>
          ` : ''}
        </body>
        </html>
      `);
      
      printWindow.document.close();
      printWindow.focus();
      
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 250);

      // Also download as CSV
      const trans_data = this.selectedReceipt;
      let csv = `${this.receiptStyle.companyName}\n`;
      csv += `${this.receiptStyle.receiptTitle}\n\n`;
      csv += `Receipt Number,${trans_data.receiptNo}\n`;
      csv += `Date,${trans_data.date}\n`;
      csv += `Time,${trans_data.time}\n`;
      csv += `Type,${trans_data.type}\n`;
      csv += `Payment Method,${trans_data.payment}\n\n`;
      csv += 'Item,Price\n';
      
      trans_data.items.forEach(item => {
        csv += `"${item.name}",${item.price}\n`;
      });
      
      csv += `\nTotal,${trans_data.total}\n`;
      
      this.downloadCSV(csv, `Receipt_POS-${trans_data.receiptNo}_${trans_data.date}_customized.csv`);
    },
    saveReceiptStyle() {
      // Save to localStorage for future use
      localStorage.setItem('receiptStyle', JSON.stringify(this.receiptStyle));
      alert('Receipt style saved successfully!');
    }
  }
};
</script>

<style scoped>
.pos-container {
  padding: 1.5rem;
  background: #F8F7F4;
  min-height: 100vh;
  max-width: 1240px;
  margin: 0 auto;
}

.pos-grid {
  align-items: stretch;
}

.items-card,
.cart-card {
  min-height: 680px;
  max-height: 680px;
}

.items-card {
  display: flex;
  flex-direction: column;
}

.cart-card {
  display: flex;
  flex-direction: column;
}

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

.cart-items-area::-webkit-scrollbar {
  width: 0;
  height: 0;
}

.cart-empty-state {
  min-height: 250px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #9ca3af;
}

.cart-bottom {
  margin-top: auto;
}

.total-panel {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f3f4f6;
  border-radius: 10px;
  padding: 0.9rem 1rem;
  margin-bottom: 0.85rem;
}

.payment-wrap {
  margin-bottom: 0.2rem;
}

.pay-btn {
  min-height: 52px;
}

.items-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.9rem;
  min-height: 30px;
}

.section-title {
  font-size: 1.50rem;
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
  -ms-overflow-style: none;
}

.category-switch::-webkit-scrollbar {
  display: none;
}

.menu-filter-wrap {
  border-bottom: 1px solid #e5e7eb;
  padding-bottom: 0.65rem;
}

.chip-btn {
  line-height: 1;
}

.items-scroll {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding-right: 2px;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.items-scroll::-webkit-scrollbar {
  width: 0;
  height: 0;
}

.card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  transition: all 0.3s ease;
}

.card:hover {
  box-shadow: 0 4px 16px rgba(0,0,0,0.12);
}

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
  box-shadow: 0 6px 14px rgba(59, 130, 246, 0.16);
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

.category-btn i {
  font-size: 0.75rem;
}

.category-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 10px rgba(15, 23, 42, 0.12);
}

.btn-primary {
  background: var(--primary);
  transition: all 0.2s ease;
}

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(43, 108, 176, 0.3);
}

.btn-success {
  transition: all 0.2s ease;
}

.btn-success:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(22, 163, 74, 0.3);
}

input[type="text"],
select {
  transition: all 0.2s ease;
}

input[type="text"]:focus,
select:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(43, 108, 176, 0.1);
}

table tr {
  transition: background-color 0.15s ease;
}

.cart-item {
  transition: all 0.2s ease;
  padding: 0.55rem;
  border-radius: 6px;
}

.cart-item:hover {
  background: #f9fafb;
}

/* Admin Layout Styles */
.admin-layout {
  display: flex;
  min-height: 100vh;
  background: #F8F7F4;
}

.header-container {
  padding: 1rem 2rem;
  background-color: #ffffff;
  border-bottom: 1px solid #e2e8f0;
  top: 0;
  z-index: 50;
  margin-bottom: 10px;
  margin-top:  20px;
}

.main-content {
  flex: 1;
  margin-left: 260px;
  transition: margin-left 0.3s ease;
}

.main-content.shifted {
  margin-left: 70px;
}

@media (max-width: 768px) {
  .items-topbar {
    flex-direction: column;
    align-items: flex-start;
  }

  .category-switch {
    width: 100%;
    justify-content: flex-start;
  }

  .main-content {
    margin-left: 0;
  }
}
</style>
