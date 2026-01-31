<template>
  <div class="pos-wrapper">
    <!-- SIDEBAR -->
    <aside class="sidebar">
      <div class="p-5 border-b border-white/20 flex items-center gap-3">
        <i class="fas fa-spa"></i>
        <span class="font-serif text-lg">Reservision</span>
      </div>

      <div class="p-4 border-b border-white/20 flex items-center gap-3">
        <i class="fas fa-user"></i>
        <div>
          <div class="font-medium">Admin User</div>
          <div class="text-xs opacity-70">Super Administrator</div>
        </div>
      </div>

      <ul class="p-3 space-y-1">
        <li><a href="index.html" class="nav-link"><i class="fas fa-tachometer-alt"></i>Dashboard</a></li>
        <li><a href="reservation.html" class="nav-link"><i class="fas fa-calendar-check"></i>Reservations</a></li>
        <li><a href="pos.html" class="nav-link active"><i class="fas fa-cash-register"></i>Point of Sale</a></li>
        <li><a href="room_and_cottage.html" class="nav-link"><i class="fas fa-bed"></i>Rooms & Cottages</a></li>
        <li><a href="amenities.html" class="nav-link"><i class="fas fa-concierge-bell"></i>Amenities</a></li>
        <li><a href="usermanagement.html" class="nav-link"><i class="fas fa-users"></i>User Management</a></li>
        <li><a href="reports_analysis.html" class="nav-link"><i class="fas fa-chart-bar"></i>Reports & Analytics</a></li>
        <li><a href="contentmanagement.html" class="nav-link"><i class="fas fa-cog"></i>Site Configuration</a></li>
        <li><a href="vr360_setup.html" class="nav-link"><i class="fas fa-vr-cardboard"></i>VR 360° Setup</a></li>
        <li><a href="feedback.html" class="nav-link"><i class="fas fa-headset"></i>Feedback & Support</a></li>
      </ul>

      <div class="absolute bottom-0 w-full p-3 border-t border-white/20">
        <a href="login2.html" class="nav-link">
          <i class="fas fa-sign-out-alt"></i>Logout
        </a>
      </div>
    </aside>

    <!-- MAIN CONTENT -->
    <main class="main-content">
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
    </main>
  </div>
</template>

<script>
export default {
  name: 'POSSystem',
  data() {
    return {
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
          items: [
            { name: 'Breakfast Set', price: 350 },
            { name: 'Lunch Buffet', price: 450 },
            { name: 'Dinner Set', price: 500 },
            { name: 'Coffee', price: 80 },
            { name: 'Soft Drinks', price: 50 },
            { name: 'Dessert', price: 120 }
          ]
        },
        {
          id: 'rooms',
          name: 'Rooms',
          icon: 'bed',
          items: [
            { name: 'Standard Room', price: 2500 },
            { name: 'Deluxe Room', price: 3500 },
            { name: 'Suite Room', price: 5000 },
            { name: 'Extra Bed', price: 800 },
            { name: 'Room Upgrade', price: 1500 },
            { name: 'Room Service', price: 200 }
          ]
        },
        {
          id: 'cottage',
          name: 'Cottage',
          icon: 'home',
          items: [
            { name: 'Small Cottage', price: 1500 },
            { name: 'Medium Cottage', price: 2500 },
            { name: 'Large Cottage', price: 3500 },
            { name: 'Pool Access', price: 200 },
            { name: 'BBQ Grill', price: 300 },
            { name: 'Karaoke', price: 500 }
          ]
        },
        {
          id: 'event',
          name: 'Event',
          icon: 'calendar-alt',
          items: [
            { name: 'Wedding Package', price: 50000 },
            { name: 'Birthday Package', price: 15000 },
            { name: 'Conference Package', price: 25000 },
            { name: 'Event Venue', price: 10000 },
            { name: 'Catering Service', price: 8000 },
            { name: 'Sound System', price: 3000 }
          ]
        }
      ]
    };
  },
  methods: {
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
    checkout() {
      if (this.cart.length === 0) {
        alert("No items added");
        return;
      }

      const now = new Date();
      const date = now.toISOString().split("T")[0];
      const time = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      
      const transaction = {
        receiptNo: String(this.receiptNo).padStart(3, '0'),
        items: [...this.cart],
        type: "Walk-in",
        payment: this.paymentMethod,
        total: this.total,
        date: date,
        time: time
      };
      
      this.transactionHistory.unshift(transaction);
      
      // Auto-save receipt to CSV
      this.saveReceiptToCSV(transaction);

      this.receiptNo++;
      alert(`Transaction completed! Receipt: POS-${transaction.receiptNo}\nTotal: ₱${this.total.toLocaleString()}\n\nReceipt saved to Downloads folder.`);
      
      // Clear cart after successful checkout
      this.cart = [];
      this.total = 0;
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
    deleteTransaction(index) {
      if (confirm('Are you sure you want to delete this transaction?')) {
        this.transactionHistory.splice(index, 1);
      }
    },
    clearHistory() {
      if (confirm('Are you sure you want to clear all transaction history?')) {
        this.transactionHistory = [];
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
:root {
  --primary: #2B6CB0;
  --bg-light: #F8F7F4;
}

.pos-wrapper {
  font-family: 'Inter', sans-serif;
  background: var(--bg-light);
  margin: 0;
}

.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  width: 260px;
  height: 100vh;
  background: var(--primary);
  color: white;
  z-index: 50;
  box-shadow: 4px 0 12px rgba(0,0,0,0.1);
}

.main-content {
  margin-left: 260px;
  padding: 2rem;
  min-height: 100vh;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1.25rem;
  border-radius: 0.5rem;
  color: rgba(255,255,255,0.9);
  text-decoration: none;
  transition: all 0.2s ease;
}

.nav-link:hover,
.nav-link.active {
  background: rgba(255,255,255,0.15);
  color: white;
  transform: translateX(4px);
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
</style>
