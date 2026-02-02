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
      <div class="pos-container">
      <!-- HEADER -->
      <div class="card p-6 mb-6">
        <h1 class="text-2xl font-bold text-gray-800">Point of Sale</h1>
        <p class="text-sm text-gray-500 mt-1"><i class="fas fa-store mr-1"></i>Walk-in Payments</p>
      </div>

      <!-- POS GRID -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">

        <!-- ITEMS -->
        <div class="lg:col-span-2 card p-6">
          <h2 class="font-bold text-lg mb-4 text-gray-800"><i class="fas fa-shopping-cart mr-2"></i>Services / Items</h2>
          
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
          
          <!-- Category Buttons -->
          <div class="flex gap-3 mb-6 border-b-2 pb-4">
            <button 
              v-for="category in categories" 
              :key="category.id"
              @click="showCategory(category.id)" 
              :id="`btn-${category.id}`" 
              :class="['category-btn px-5 py-3 rounded-lg', currentCategory === category.id ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700']"
            >
              <i :class="`fas fa-${category.icon} mr-2`"></i>{{ category.name }}
            </button>
          </div>

          <!-- Items Grid -->
          <div 
            v-for="category in categories" 
            :key="`items-${category.id}`"
            v-show="currentCategory === category.id"
            class="category-items grid grid-cols-2 md:grid-cols-3 gap-4"
          >
            <button 
              v-for="item in getFilteredItems(category.items)" 
              :key="item.name"
              @click="addItem(item.name, item.price)" 
              class="item-btn p-4 bg-white"
            >
              <div class="font-medium text-gray-800">{{ item.name }}</div>
              <div class="text-green-600 font-bold text-lg mt-1">₱{{ item.price.toLocaleString() }}</div>
            </button>
          </div>
        </div>

        <!-- CART -->
        <div class="card p-6">
          <div class="flex justify-between items-center mb-4">
            <h2 class="font-bold text-lg text-gray-800"><i class="fas fa-receipt mr-2"></i>Current Transaction</h2>
            <button @click="clearCart" class="text-red-600 hover:text-red-800 text-sm font-medium transition-all">
              <i class="fas fa-trash mr-1"></i>Clear All
            </button>
          </div>

          <div class="space-y-2 text-sm min-h-[200px]">
            <div v-if="cart.length === 0" class="text-center text-gray-400 py-8">
              <i class="fas fa-shopping-basket text-4xl mb-2 block"></i>
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

          <hr class="my-4 border-t-2">

          <div class="flex justify-between items-center bg-gray-50 p-4 rounded-lg mb-4">
            <span class="text-lg font-semibold text-gray-700">Total</span>
            <span class="text-2xl font-bold text-blue-600">₱{{ total.toLocaleString() }}</span>
          </div>

          <div class="mb-4">
            <label class="text-sm font-semibold text-gray-700 mb-2 block">
              <i class="fas fa-credit-card mr-2"></i>Payment Method
            </label>
            <select v-model="paymentMethod" class="border-2 p-3 rounded-lg w-full">
              <option>Cash</option>
              <option>GCash</option>
            </select>
          </div>

          <button @click="checkout" class="btn-success w-full bg-green-600 text-white py-4 rounded-lg font-semibold text-lg">
            <i class="fas fa-check-circle mr-2"></i>Pay & Complete
          </button>
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
              <tr v-if="transactionHistory.length === 0">
                <td colspan="7" class="p-8 text-center text-gray-400">
                  <i class="fas fa-inbox text-4xl mb-2 block"></i>No transactions yet
                </td>
              </tr>
              <tr 
                v-else
                v-for="(trans, index) in transactionHistory" 
                :key="trans.receiptNo"
                class="border-b hover:bg-blue-50 transition-colors"
              >
                <td class="p-3 font-semibold text-blue-700">POS-{{ trans.receiptNo }}</td>
                <td class="p-3">
                  <div class="text-gray-700">{{ getItemsPreview(trans.items) }}</div>
                  <button @click="viewDetails(index)" class="text-blue-600 text-xs hover:underline mt-1 transition-all">
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
                  <button @click="printReceipt(index)" class="text-green-600 hover:text-green-800 mr-3 transition-all hover:scale-110 inline-block" title="Print">
                    <i class="fas fa-print text-lg"></i>
                  </button>
                  <button @click="deleteTransaction(index)" class="text-red-600 hover:text-red-800 transition-all hover:scale-110 inline-block" title="Delete">
                    <i class="fas fa-trash text-lg"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
    </main>
  </div>
</template>

<script>
import AdminSidebar from '../../components/Admin/AdminSidebar.vue';
import axios from 'axios';

const API_BASE = 'http://localhost:8000/api/pos';

export default {
  name: 'POSSystem',
  components: {
    AdminSidebar
  },
  data() {
    return {
      sidebarOpen: false,
      sidebarCollapsed: false,
      cart: [],
      total: 0,
      receiptNo: 1,
      currentCategory: 'restaurant',
      paymentMethod: 'Cash',
      searchQuery: '',
      transactionHistory: [],
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
      ]
    };
  },
  async mounted() {
    await this.fetchItems();
    await this.fetchTransactions();
    this.updateReceiptNumber();
  },
  methods: {
    async fetchItems() {
      try {
        const response = await axios.get(`${API_BASE}/items`);
        const items = response.data;
        
        // Group items by category
        this.categories.forEach(category => {
          category.items = items
            .filter(item => item.category === category.id)
            .map(item => ({
              name: item.name,
              price: parseFloat(item.price)
            }));
        });
      } catch (error) {
        console.error('Error fetching POS items:', error);
        alert('Failed to load items from server');
      }
    },
    async fetchTransactions() {
      try {
        const response = await axios.get(`${API_BASE}/transactions`);
        this.transactionHistory = response.data.map(trans => ({
          receiptNo: trans.receipt_no,
          items: trans.items,
          type: trans.type,
          payment: trans.payment_method,
          total: parseFloat(trans.total_amount),
          date: trans.transaction_date,
          time: trans.transaction_time
        }));
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
      this.currentCategory = categoryId;
      this.searchQuery = '';
    },
    getFilteredItems(items) {
      if (!this.searchQuery) return items;
      return items.filter(item => 
        item.name.toLowerCase().includes(this.searchQuery.toLowerCase())
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
      
      try {
        // Save to backend
        await axios.post(`${API_BASE}/transactions`, transaction);
        
        // Add to local history
        this.transactionHistory.unshift(transaction);
        
        // Auto-save receipt to CSV
        this.saveReceiptToCSV(transaction);

        this.receiptNo++;
        alert(`Transaction completed! Receipt: POS-${transaction.receiptNo}\nTotal: ₱${this.total.toLocaleString()}\n\nReceipt saved successfully.`);
        
        // Clear cart after successful checkout
        this.cart = [];
        this.total = 0;
      } catch (error) {
        console.error('Error saving transaction:', error);
        alert('Failed to save transaction. Please try again.');
      }
    },
    getItemsPreview(items) {
      const itemsList = items.map(item => item.name).join(", ");
      return itemsList.length > 30 ? itemsList.substring(0, 30) + "..." : itemsList;
    },
    viewDetails(index) {
      const trans = this.transactionHistory[index];
      let itemsDetail = trans.items.map(item => `${item.name} - ₱${item.price.toLocaleString()}`).join('\n');
      
      alert(`Receipt: POS-${trans.receiptNo}\n` +
            `Date: ${trans.date} ${trans.time}\n` +
            `Type: ${trans.type}\n` +
            `Payment: ${trans.payment}\n\n` +
            `Items:\n${itemsDetail}\n\n` +
            `Total: ₱${trans.total.toLocaleString()}`);
    },
    printReceipt(index) {
      const trans = this.transactionHistory[index];
      
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
    async deleteTransaction(index) {
      if (confirm('Are you sure you want to delete this transaction?')) {
        const transaction = this.transactionHistory[index];
        
        try {
          // Find transaction ID from backend
          const response = await axios.get(`${API_BASE}/transactions`);
          const backendTrans = response.data.find(t => t.receipt_no === transaction.receiptNo);
          
          if (backendTrans) {
            await axios.delete(`${API_BASE}/transactions/${backendTrans.transaction_id}`);
          }
          
          this.transactionHistory.splice(index, 1);
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
    }
  }
};
</script>

<style scoped>
.pos-container {
  padding: 2rem;
  background: #F8F7F4;
  min-height: 100vh;
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
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  cursor: pointer;
}

.item-btn:hover {
  border-color: var(--primary);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(43, 108, 176, 0.2);
}

.category-btn {
  transition: all 0.2s ease;
  font-weight: 500;
  border: none;
}

.category-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
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
  padding: 0.5rem;
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

.main-content {
  flex: 1;
  margin-left: 260px;
  transition: margin-left 0.3s ease;
}

.main-content.shifted {
  margin-left: 70px;
}

@media (max-width: 768px) {
  .main-content {
    margin-left: 0;
  }
}
</style>
