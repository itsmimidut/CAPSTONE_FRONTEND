<template>
  <div class="eshop-container">
    <!-- NAVBAR -->
    <nav class="navbar">
      <div class="logo">
        Eduardo's <span class="shop-tag">SHOP</span>
      </div>
      <div class="nav-right">
        <div class="room-badge">
          <span class="dot"></span>
          <span>{{ locationSaved ? currentLocation : 'Set your location' }}</span>
        </div>
        <button class="cart-btn" @click="scrollToCart">
          🛒 Cart <span class="cart-count">{{ totalItems }}</span>
        </button>
      </div>
    </nav>

    <!-- PAGE -->
    <div class="page">
      <!-- LEFT: PRODUCTS + CART -->
      <div class="left-col">
        <!-- SECTION 1: PRODUCTS -->
        <div class="section-card">
          <div class="product-tabs">
            <div
              v-for="tab in ['restaurant', 'store']"
              :key="tab"
              class="tab"
              :class="{ active: activeTab === tab }"
              @click="switchTab(tab)"
            >
              {{ tabLabels[tab] }}
            </div>
          </div>

          <!-- Restaurant Products -->
          <div v-if="activeTab === 'restaurant'" class="product-list">
            <div
              v-for="(product, idx) in products.restaurant"
              :key="idx"
              class="product-item"
            >
              <div class="product-emoji">{{ product.emoji }}</div>
              <div class="product-details">
                <div class="product-name">{{ product.name }}</div>
                <div class="product-desc">{{ product.desc }}</div>
              </div>
              <div class="product-right">
                <div class="product-price">₱{{ product.price }}</div>
                <button
                  class="add-btn"
                  :class="{ 'added-btn': isProductAdded(product.name) }"
                  @click="addToCart(product)"
                >
                  {{ isProductAdded(product.name) ? '✓ Added' : '+ Add' }}
                </button>
              </div>
            </div>
          </div>

          <!-- Store Products -->
          <div v-if="activeTab === 'store'" class="product-list">
            <div
              v-for="(product, idx) in products.store"
              :key="idx"
              class="product-item"
            >
              <div class="product-emoji">{{ product.emoji }}</div>
              <div class="product-details">
                <div class="product-name">{{ product.name }}</div>
                <div class="product-desc">{{ product.desc }}</div>
              </div>
              <div class="product-right">
                <div class="product-price">₱{{ product.price }}</div>
                <button
                  class="add-btn"
                  :class="{ 'added-btn': isProductAdded(product.name) }"
                  @click="addToCart(product)"
                >
                  {{ isProductAdded(product.name) ? '✓ Added' : '+ Add' }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- SECTION 2: CART -->
        <div ref="cartSection" class="section-card">
          <div class="section-head">
            <div class="section-title">🛒 Your Cart</div>
            <span style="font-size: 0.75rem; color: var(--gray-400)">{{ totalItems }} item{{ totalItems !== 1 ? 's' : '' }}</span>
          </div>

          <!-- Empty state -->
          <div v-if="cart.length === 0" class="cart-empty">
            <div class="empty-icon">🛒</div>
            <div>Your cart is empty</div>
            <div style="font-size: 0.72rem; margin-top: 0.25rem; color: var(--gray-400)">
              Add items from the menu above
            </div>
          </div>

          <!-- Cart items -->
          <div v-else style="padding: 0.75rem 1rem">
            <div class="cart-items">
              <div v-for="(item, idx) in cart" :key="idx" class="cart-item">
                <div class="cart-item-emoji">{{ item.emoji }}</div>
                <div class="cart-item-info">
                  <div class="cart-item-name">{{ item.name }}</div>
                  <div class="cart-item-price">₱{{ item.price }} each</div>
                </div>
                <div class="cart-qty">
                  <button class="qty-btn" @click="changeQty(idx, -1)">−</button>
                  <span class="qty-val">{{ item.qty }}</span>
                  <button class="qty-btn" @click="changeQty(idx, 1)">+</button>
                </div>
                <button class="remove-btn" @click="removeItem(idx)">✕</button>
              </div>
            </div>
          </div>

          <!-- Cart footer -->
          <div v-if="cart.length > 0" class="cart-footer">
            <div class="cart-row">
              <span>Subtotal</span>
              <span>₱{{ cartTotal }}</span>
            </div>
            <div class="cart-row">
              <span>Delivery</span>
              <span style="color: var(--green); font-weight: 800">FREE</span>
            </div>
            <div class="cart-total">
              <span>Total</span>
              <span>₱{{ cartTotal }}</span>
            </div>
            <div v-if="!locationSaved" class="no-location-warning">
              ⚠️ Please set your delivery location first
            </div>
            <button
              class="order-btn"
              :disabled="!locationSaved"
              @click="placeOrder"
            >
              🎉 Place Order
            </button>
          </div>
        </div>
      </div>
      <!-- /left-col -->

      <!-- RIGHT COLUMN -->
      <div class="right-col">
        <!-- SECTION 3: DELIVERY LOCATION -->
        <div class="section-card">
          <div class="section-head">
            <div class="section-title">📍 Where Are You?</div>
          </div>
          <div class="section-body">
            <div class="form-group">
              <div class="form-label">I am staying in a…</div>
              <div class="location-types">
                <div
                  v-for="type in locationTypes"
                  :key="type"
                  class="loc-type"
                  :class="{ active: currentLocType === type }"
                  @click="selectLocType(type)"
                >
                  <span class="loc-emoji">{{ locationEmojis[type] }}</span>{{ type }}
                </div>
              </div>
            </div>

            <div v-if="currentLocType !== 'Day Guest'" class="form-group">
              <label class="form-label">{{ currentLocType }} Number</label>
              <input
                v-model="locationNumber"
                class="form-input"
                type="text"
                :placeholder="
                  currentLocType === 'Room' ? 'e.g. 204' : 'e.g. Cottage 3'
                "
              />
            </div>

            <div class="form-group">
              <label class="form-label">Special Instructions (optional)</label>
              <textarea
                v-model="locationNotes"
                class="form-textarea"
                placeholder="e.g. Please knock, baby sleeping…"
              ></textarea>
            </div>

            <button class="save-loc-btn" @click="saveLocation">
              📍 Save Location
            </button>
            <div v-if="showLocationSaved" class="loc-saved">
              ✅ <span>{{ currentLocation }} — saved!</span>
            </div>
          </div>
        </div>

        <!-- SECTION 4: ACCOUNT & ORDERS -->
        <div class="section-card">
          <div class="account-head">
            <div class="avatar">J</div>
            <div>
              <div class="account-name">Juan dela Cruz</div>
              <div class="account-room">
                📍 {{ locationSaved ? currentLocation : 'Location not set' }}
              </div>
            </div>
          </div>
          <div class="section-body" style="padding-top: 0.75rem">
            <div class="section-title" style="margin-bottom: 0.75rem; font-size: 0.875rem">
              📦 Your Orders
            </div>

            <!-- Active order -->
            <div class="order-card">
              <div class="order-header">
                <div>
                  <div class="order-id">#ORD-0042</div>
                  <div class="order-date">Today, 2:14 PM</div>
                </div>
                <span class="status-badge status-on_the_way">🛵 On the way</span>
              </div>
              <div class="order-body">
                <div class="order-items-text">Beef Mami × 1, Mango Shake × 2</div>
                <div class="order-total-text">Total: ₱375</div>
              </div>
              <div class="order-progress">
                <div class="progress-steps">
                  <div class="progress-fill" style="width: 66%"></div>
                  <div class="prog-step">
                    <div class="prog-dot done">✓</div>
                    <div class="prog-label done">Placed</div>
                  </div>
                  <div class="prog-step">
                    <div class="prog-dot done">✓</div>
                    <div class="prog-label done">Preparing</div>
                  </div>
                  <div class="prog-step">
                    <div class="prog-dot active">🛵</div>
                    <div class="prog-label active">On the way</div>
                  </div>
                  <div class="prog-step">
                    <div class="prog-dot">📦</div>
                    <div class="prog-label">Delivered</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Past orders -->
            <div class="order-card">
              <div class="order-header">
                <div>
                  <div class="order-id">#ORD-0038</div>
                  <div class="order-date">Today, 10:05 AM</div>
                </div>
                <span class="status-badge status-delivered">✅ Delivered</span>
              </div>
              <div class="order-body">
                <div class="order-items-text">Iced Café Latte × 1, Toiletry Kit × 1</div>
                <div class="order-total-text">Total: ₱260</div>
              </div>
            </div>

            <div class="order-card">
              <div class="order-header">
                <div>
                  <div class="order-id">#ORD-0031</div>
                  <div class="order-date">Yesterday, 7:30 PM</div>
                </div>
                <span class="status-badge status-delivered">✅ Delivered</span>
              </div>
              <div class="order-body">
                <div class="order-items-text">Crispy Calamari × 2, Pasta Carbonara × 1</div>
                <div class="order-total-text">Total: ₱700</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- /right-col -->
    </div>
    <!-- /page -->

    <!-- TOAST -->
    <div class="toast" :class="{ show: showToast }">
      🎉 Order placed! We'll deliver to you shortly.
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

// ── STATE ──
const activeTab = ref('restaurant')
const cart = ref([])
const currentLocType = ref('Room')
const locationNumber = ref('')
const locationNotes = ref('')
const locationSaved = ref(false)
const showLocationSaved = ref(false)
const showToast = ref(false)
const addedProducts = ref(new Set())
const cartSection = ref(null)

// ── LOCATION DATA ──
const locationTypes = ['Room', 'Cottage', 'Day Guest']
const locationEmojis = {
  'Room': '🛏️',
  'Cottage': '🏡',
  'Day Guest': '☀️'
}

// ── PRODUCTS DATA ──
const products = ref({
  restaurant: [
    {
      name: 'Beef Mami Noodle Soup',
      price: 185,
      emoji: '🍜',
      desc: 'Rich broth, tender beef, fresh noodles'
    },
    {
      name: 'Creamy Pasta Carbonara',
      price: 220,
      emoji: '🍝',
      desc: 'Bacon, egg, parmesan, cream sauce'
    },
    {
      name: 'Crispy Calamari',
      price: 240,
      emoji: '🍤',
      desc: 'With garlic aioli dipping sauce'
    },
    {
      name: 'Seafood Sinuglaw Bowl',
      price: 295,
      emoji: '🍚',
      desc: 'Fresh kinilaw + grilled pork, served with rice'
    },
    {
      name: 'Mango Shake (Large)',
      price: 95,
      emoji: '🥤',
      desc: 'Fresh mango, milk, crushed ice'
    },
    {
      name: 'Iced Café Latte',
      price: 110,
      emoji: '☕',
      desc: 'Resort blend espresso + fresh milk'
    }
  ],
  store: [
    {
      name: 'Sunscreen SPF 50+',
      price: 180,
      emoji: '🧴',
      desc: 'Resort edition, water-resistant'
    },
    {
      name: 'Bottled Water (1L) × 6',
      price: 90,
      emoji: '🧃',
      desc: 'Chilled, purified drinking water'
    },
    {
      name: 'Resort Souvenir T-Shirt',
      price: 450,
      emoji: '👕',
      desc: 'Available in S, M, L, XL'
    },
    {
      name: 'Resort Flip Flops',
      price: 350,
      emoji: '🩴',
      desc: 'Eduardo\'s branded, all sizes'
    },
    {
      name: 'Snack Bundle Pack',
      price: 120,
      emoji: '🍫',
      desc: 'Chips + chocolate + candy assorted'
    },
    {
      name: 'Toiletry Kit',
      price: 150,
      emoji: '🪥',
      desc: 'Toothbrush, toothpaste, shampoo, soap'
    }
  ]
})

// Tab labels
const tabLabels = {
  restaurant: '🍽️ Restaurant',
  store: '🏪 Store'
}

// ── COMPUTED ──
const totalItems = computed(() => {
  return cart.value.reduce((sum, item) => sum + item.qty, 0)
})

const cartTotal = computed(() => {
  return cart.value.reduce((sum, item) => sum + item.price * item.qty, 0)
})

const currentLocation = computed(() => {
  if (currentLocType.value === 'Day Guest') {
    return 'Day Guest (Pool/Garden Area)'
  }
  return `${currentLocType.value} ${locationNumber.value}`
})

// ── METHODS ──
const switchTab = (tab) => {
  activeTab.value = tab
}

const isProductAdded = (productName) => {
  return addedProducts.value.has(productName)
}

const addToCart = (product) => {
  const existing = cart.value.find((i) => i.name === product.name)
  if (existing) {
    existing.qty++
  } else {
    cart.value.push({ ...product, qty: 1 })
  }

  addedProducts.value.add(product.name)
  setTimeout(() => {
    addedProducts.value.delete(product.name)
  }, 1200)
}

const changeQty = (idx, delta) => {
  cart.value[idx].qty += delta
  if (cart.value[idx].qty <= 0) {
    cart.value.splice(idx, 1)
  }
}

const removeItem = (idx) => {
  cart.value.splice(idx, 1)
}

const selectLocType = (type) => {
  currentLocType.value = type
  if (type === 'Day Guest') {
    locationNumber.value = ''
  }
}

const saveLocation = () => {
  if (currentLocType.value !== 'Day Guest' && !locationNumber.value.trim()) {
    alert(`Please enter your ${currentLocType.value} number.`)
    return
  }
  locationSaved.value = true
  showLocationSaved.value = true
  setTimeout(() => {
    showLocationSaved.value = false
  }, 3000)
}

const placeOrder = () => {
  showToast.value = true
  cart.value = []
  setTimeout(() => {
    showToast.value = false
  }, 4000)
}

const scrollToCart = () => {
  if (cartSection.value) {
    cartSection.value.scrollIntoView({ behavior: 'smooth' })
  }
}
</script>

<style scoped>
:root {
  --blue-dark: #1e3a8a;
  --blue: #1e40af;
  --blue-light: #dbeafe;
  --yellow: #f59e0b;
  --yellow-light: #fef3c7;
  --white: #ffffff;
  --gray-50: #f8fafc;
  --gray-100: #f1f5f9;
  --gray-200: #e2e8f0;
  --gray-400: #94a3b8;
  --gray-600: #475569;
  --gray-800: #1e293b;
  --green: #10b981;
  --green-light: #d1fae5;
  --red: #ef4444;
  --red-light: #fee2e2;
  --orange: #f97316;
}

.eshop-container {
  font-family: 'Nunito', sans-serif;
  background: var(--gray-100);
  color: var(--gray-800);
}

/* ── NAVBAR ── */
.navbar {
  background: var(--blue);
  padding: 0.85rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 2px 12px rgba(30, 64, 175, 0.3);
}

.logo {
  color: white;
  font-size: 1.2rem;
  font-weight: 900;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.logo .shop-tag {
  background: var(--yellow);
  color: var(--blue-dark);
  font-size: 0.65rem;
  font-weight: 900;
  padding: 0.15rem 0.5rem;
  border-radius: 4px;
  letter-spacing: 1px;
}

.nav-right {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.room-badge {
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  border-radius: 999px;
  padding: 0.3rem 0.85rem;
  font-size: 0.78rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.room-badge .dot {
  width: 7px;
  height: 7px;
  background: var(--green);
  border-radius: 50%;
}

.cart-btn {
  background: var(--yellow);
  color: var(--blue-dark);
  border: none;
  border-radius: 999px;
  padding: 0.4rem 1rem;
  font-family: 'Nunito', sans-serif;
  font-size: 0.82rem;
  font-weight: 900;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  transition: all 0.2s;
}

.cart-btn:hover {
  background: #fbbf24;
  transform: translateY(-1px);
}

.cart-count {
  background: var(--red);
  color: white;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  font-size: 0.65rem;
  font-weight: 900;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* ── PAGE LAYOUT ── */
.page {
  max-width: 1100px;
  margin: 1.5rem auto;
  padding: 0 1rem;
  display: grid;
  grid-template-columns: 1fr 360px;
  gap: 1.25rem;
  align-items: start;
}

/* ── SECTION CARD ── */
.section-card {
  background: white;
  border-radius: 14px;
  border: 1px solid var(--gray-200);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  margin-bottom: 1.25rem;
}

.section-head {
  padding: 1rem 1.25rem;
  border-bottom: 1px solid var(--gray-200);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.section-title {
  font-size: 1rem;
  font-weight: 800;
  color: var(--blue-dark);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.section-body {
  padding: 1.25rem;
}

/* ── PRODUCT TABS ── */
.product-tabs {
  display: flex;
  gap: 0;
  border-bottom: 2px solid var(--gray-200);
}

.tab {
  flex: 1;
  padding: 0.75rem;
  text-align: center;
  font-size: 0.875rem;
  font-weight: 700;
  color: var(--gray-600);
  cursor: pointer;
  border-bottom: 3px solid transparent;
  margin-bottom: -2px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
}

.tab:hover {
  color: var(--blue);
}

.tab.active {
  color: var(--blue);
  border-bottom-color: var(--yellow);
  background: var(--blue-light);
}

/* ── PRODUCT LIST ── */
.product-list {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.product-item {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  padding: 0.75rem;
  border: 1.5px solid var(--gray-200);
  border-radius: 10px;
  transition: all 0.2s;
  cursor: pointer;
}

.product-item:hover {
  border-color: var(--blue);
  background: var(--blue-light);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(30, 64, 175, 0.08);
}

.product-emoji {
  width: 52px;
  height: 52px;
  background: var(--gray-100);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.75rem;
  flex-shrink: 0;
  border: 1px solid var(--gray-200);
}

.product-details {
  flex: 1;
  min-width: 0;
}

.product-name {
  font-size: 0.875rem;
  font-weight: 700;
  color: var(--gray-800);
  margin-bottom: 0.2rem;
}

.product-desc {
  font-size: 0.72rem;
  color: var(--gray-400);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.product-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.4rem;
  flex-shrink: 0;
}

.product-price {
  font-size: 0.95rem;
  font-weight: 900;
  color: var(--blue-dark);
}

.add-btn {
  background: var(--blue);
  color: white;
  border: none;
  border-radius: 6px;
  padding: 0.3rem 0.7rem;
  font-family: 'Nunito', sans-serif;
  font-size: 0.75rem;
  font-weight: 800;
  cursor: pointer;
  transition: background 0.2s;
  white-space: nowrap;
}

.add-btn:hover {
  background: var(--blue-dark);
}

.added-btn {
  background: var(--green);
  color: white;
  border: none;
  border-radius: 6px;
  padding: 0.3rem 0.7rem;
  font-family: 'Nunito', sans-serif;
  font-size: 0.75rem;
  font-weight: 800;
  cursor: pointer;
  white-space: nowrap;
}

/* ── RIGHT COLUMN ── */
.right-col {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

/* ── DELIVERY FORM ── */
.form-group {
  margin-bottom: 0.85rem;
}

.form-label {
  display: block;
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--gray-600);
  margin-bottom: 0.35rem;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.form-select,
.form-input,
.form-textarea {
  width: 100%;
  border: 1.5px solid var(--gray-200);
  border-radius: 8px;
  padding: 0.55rem 0.75rem;
  font-family: 'Nunito', sans-serif;
  font-size: 0.875rem;
  color: var(--gray-800);
  outline: none;
  transition: border-color 0.2s;
  background: white;
}

.form-select:focus,
.form-input:focus,
.form-textarea:focus {
  border-color: var(--blue);
  box-shadow: 0 0 0 3px var(--blue-light);
}

.form-textarea {
  resize: vertical;
  min-height: 70px;
}

.location-types {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.loc-type {
  border: 1.5px solid var(--gray-200);
  border-radius: 8px;
  padding: 0.6rem 0.4rem;
  text-align: center;
  cursor: pointer;
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--gray-600);
  transition: all 0.2s;
}

.loc-type:hover {
  border-color: var(--blue);
  color: var(--blue);
}

.loc-type.active {
  border-color: var(--blue);
  background: var(--blue-light);
  color: var(--blue);
}

.loc-type .loc-emoji {
  font-size: 1.3rem;
  display: block;
  margin-bottom: 0.2rem;
}

.save-loc-btn {
  width: 100%;
  background: var(--blue);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.6rem;
  font-family: 'Nunito', sans-serif;
  font-size: 0.85rem;
  font-weight: 800;
  cursor: pointer;
  transition: background 0.2s;
}

.save-loc-btn:hover {
  background: var(--blue-dark);
}

.loc-saved {
  background: var(--green-light);
  border: 1px solid var(--green);
  border-radius: 8px;
  padding: 0.5rem 0.75rem;
  font-size: 0.78rem;
  font-weight: 700;
  color: #065f46;
  align-items: center;
  gap: 0.4rem;
  margin-top: 0.5rem;
  display: flex;
}

/* ── CART ── */
.cart-empty {
  text-align: center;
  padding: 1.5rem;
  color: var(--gray-400);
  font-size: 0.875rem;
}

.cart-empty .empty-icon {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
}

.cart-items {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.cart-item {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  padding: 0.6rem;
  border: 1px solid var(--gray-200);
  border-radius: 8px;
}

.cart-item-emoji {
  width: 40px;
  height: 40px;
  background: var(--gray-100);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.3rem;
  flex-shrink: 0;
}

.cart-item-info {
  flex: 1;
  min-width: 0;
}

.cart-item-name {
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--gray-800);
}

.cart-item-price {
  font-size: 0.72rem;
  color: var(--gray-400);
}

.cart-qty {
  display: flex;
  align-items: center;
  gap: 0.2rem;
  flex-shrink: 0;
}

.qty-btn {
  width: 24px;
  height: 24px;
  border: 1.5px solid var(--gray-200);
  border-radius: 5px;
  background: white;
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
  color: var(--gray-800);
}

.qty-btn:hover {
  background: var(--blue-light);
  border-color: var(--blue);
  color: var(--blue);
}

.qty-val {
  font-size: 0.82rem;
  font-weight: 800;
  min-width: 20px;
  text-align: center;
}

.remove-btn {
  background: none;
  border: none;
  color: var(--gray-400);
  cursor: pointer;
  font-size: 0.8rem;
  padding: 0.2rem;
  transition: color 0.15s;
}

.remove-btn:hover {
  color: var(--red);
}

.cart-footer {
  padding: 0.75rem 1rem;
  border-top: 1px solid var(--gray-200);
}

.cart-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
  color: var(--gray-600);
  margin-bottom: 0.3rem;
}

.cart-total {
  display: flex;
  justify-content: space-between;
  font-size: 1rem;
  font-weight: 900;
  color: var(--blue-dark);
  margin: 0.5rem 0 0.75rem;
  padding-top: 0.5rem;
  border-top: 1px dashed var(--gray-200);
}

.order-btn {
  width: 100%;
  background: var(--yellow);
  color: var(--blue-dark);
  border: none;
  border-radius: 10px;
  padding: 0.75rem;
  font-family: 'Nunito', sans-serif;
  font-size: 0.9rem;
  font-weight: 900;
  cursor: pointer;
  transition: all 0.2s;
}

.order-btn:hover:not(:disabled) {
  background: #fbbf24;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
}

.order-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.no-location-warning {
  background: var(--yellow-light);
  border: 1px solid var(--yellow);
  border-radius: 8px;
  padding: 0.5rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 700;
  color: #92400e;
  margin-bottom: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

/* ── ACCOUNT & ORDERS ── */
.account-head {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid var(--gray-200);
}

.avatar {
  width: 42px;
  height: 42px;
  background: var(--blue);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.1rem;
  font-weight: 900;
  flex-shrink: 0;
}

.account-name {
  font-size: 0.9rem;
  font-weight: 800;
  color: var(--gray-800);
}

.account-room {
  font-size: 0.75rem;
  color: var(--gray-400);
}

.order-card {
  border: 1.5px solid var(--gray-200);
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 0.75rem;
}

.order-card:last-child {
  margin-bottom: 0;
}

.order-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.65rem 0.85rem;
  background: var(--gray-50);
  border-bottom: 1px solid var(--gray-200);
}

.order-id {
  font-size: 0.75rem;
  font-weight: 800;
  color: var(--blue);
}

.order-date {
  font-size: 0.68rem;
  color: var(--gray-400);
}

.status-badge {
  border-radius: 999px;
  padding: 0.2rem 0.65rem;
  font-size: 0.68rem;
  font-weight: 800;
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

.status-pending {
  background: var(--yellow-light);
  color: #92400e;
}

.status-preparing {
  background: #ede9fe;
  color: #5b21b6;
}

.status-on_the_way {
  background: #dbeafe;
  color: var(--blue);
}

.status-delivered {
  background: var(--green-light);
  color: #065f46;
}

.order-body {
  padding: 0.65rem 0.85rem;
}

.order-items-text {
  font-size: 0.78rem;
  color: var(--gray-600);
  margin-bottom: 0.3rem;
}

.order-total-text {
  font-size: 0.82rem;
  font-weight: 800;
  color: var(--blue-dark);
}

/* Active order progress bar */
.order-progress {
  padding: 0.65rem 0.85rem;
  border-top: 1px solid var(--gray-200);
}

.progress-steps {
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
}

.progress-steps::before {
  content: '';
  position: absolute;
  top: 12px;
  left: 12px;
  right: 12px;
  height: 2px;
  background: var(--gray-200);
  z-index: 0;
}

.progress-fill {
  position: absolute;
  top: 12px;
  left: 12px;
  height: 2px;
  background: var(--green);
  z-index: 1;
  transition: width 0.5s ease;
}

.prog-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.3rem;
  z-index: 2;
}

.prog-dot {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 2px solid var(--gray-200);
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.65rem;
}

.prog-dot.done {
  background: var(--green);
  border-color: var(--green);
  color: white;
}

.prog-dot.active {
  background: var(--blue);
  border-color: var(--blue);
  color: white;
  animation: pulse 1.5s infinite;
}

.prog-label {
  font-size: 0.6rem;
  color: var(--gray-400);
  font-weight: 700;
  text-align: center;
}

.prog-label.done {
  color: var(--green);
}

.prog-label.active {
  color: var(--blue);
}

@keyframes pulse {
  0%,
  100% {
    box-shadow: 0 0 0 0 rgba(30, 64, 175, 0.3);
  }
  50% {
    box-shadow: 0 0 0 5px rgba(30, 64, 175, 0);
  }
}

/* ── ORDER SUCCESS TOAST ── */
.toast {
  position: fixed;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%) translateY(100px);
  background: var(--green);
  color: white;
  border-radius: 50px;
  padding: 0.75rem 1.5rem;
  font-size: 0.875rem;
  font-weight: 800;
  box-shadow: 0 8px 24px rgba(16, 185, 129, 0.4);
  z-index: 999;
  transition: transform 0.4s ease;
  white-space: nowrap;
}

.toast.show {
  transform: translateX(-50%) translateY(0);
}
</style>
