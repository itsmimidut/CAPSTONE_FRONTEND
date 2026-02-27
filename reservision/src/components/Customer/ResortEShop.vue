<template>
  <div class="eshop-container">
    <!-- ══════════════════════════════════════════ -->
    <!-- HEADER -->
    <!-- ══════════════════════════════════════════ -->
    <header class="eshop-header">
      <div class="header-left">
        <span class="header-icon">🏝️</span>
        <h1 class="header-title">Eduardo's Market</h1>
      </div>

      <!-- Stage Tabs moved into the header row -->
      <div class="stage-tabs-container">
        <button class="stage-tab-btn" :class="{ active: currentStage === 1,completed: currentStage > 1 }" @click="goToStage(1)">
          <span class="stage-icon">{{ currentStage > 1 ? '✓' : '1' }}</span>
          <span class="stage-label">Browse Menu</span>
        </button>
        <button class="stage-tab-btn" :class="{ active: currentStage === 2, completed: currentStage > 2 }" @click="cart.length > 0 ? goToStage(2) : null">
          <span class="stage-icon">{{ currentStage > 2 ? '✓' : '2' }}</span>
          <span class="stage-label">Review Cart</span>
        </button>
        <button class="stage-tab-btn" :class="{ active: currentStage === 3 }" @click="cart.length > 0 ? goToStage(3) : null">
          <span class="stage-icon">3</span>
          <span class="stage-label">Checkout</span>
        </button>
      </div>

      <div class="header-right">
        <!-- <button class="location-btn" @click="goToStage(3)">
          <span class="location-pin">📍</span>
          <span>Set delivery location</span>
          <span class="dropdown-icon">▼</span>
        </button> -->
        <button class="cart-header-btn" @click="currentStage === 1 && cart.length > 0 ? proceedToCart() : null">
          <span class="cart-icon-header">🛒</span>
          <span>Cart</span>
          <span v-if="totalItems > 0" class="cart-badge-header">{{ totalItems }}</span>
        </button>
      </div>
    </header>

    <!-- ══════════════════════════════════════════ -->
    <!-- MAIN CONTENT -->
    <!-- ══════════════════════════════════════════ -->
    <div class="main-wrapper">
      <!-- ========================================== -->
      <!-- STAGE 1: BROWSE PRODUCTS -->
      <!-- ========================================== -->
      <div v-if="currentStage === 1" class="stage-content">
        <div class="menu-container">
          <!-- Menu Header with Search (Updated Layout) -->
          <div class="menu-header">
            <div class="menu-title-section">
              <span class="menu-icon">🍽️</span>
              <h2 class="menu-title">Our Menus</h2>
            </div>

            <div class="search-box">
              <span class="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Search dishes..."
                class="search-input"
                v-model="searchQuery"
                @input="currentPage = 1"
              />
            </div>
          </div>

          <!-- Products Grid Area -->
          <div class="products-section">
            <div v-if="isLoading" class="loading-container">
              <div class="spinner"></div>
              <p>Loading items...</p>
            </div>
            <div v-else-if="loadError" class="error-container">
              <span class="error-emoji">😢</span>
              <p>{{ loadError }}</p>
              <button class="retry-button" @click="fetchProducts">Try Again</button>
            </div>
            <div v-else>
              <!-- 2-Column Product Grid -->
              <div class="products-grid">
                <div
                  v-for="(product, idx) in paginatedProducts"
                  :key="idx"
                  class="product-card"
                >
                  <div class="product-image-area">
                    <span class="product-emoji">🍽️</span>
                  </div>
                  <div class="product-info-area">
                    <h3 class="product-title">{{ product.name }}</h3>
                    <p class="product-subtitle">{{ product.desc }}</p>
                  </div>
                  <div class="product-actions-area">
                    <span class="product-price">₱{{ product.price }}</span>
                    <button
                      class="product-add-btn"
                      :class="{ added: isProductAdded(product.name) }"
                      @click="addToCart(product)"
                    >
                      ✓ Add
                    </button>
                  </div>
                </div>
              </div>

              <!-- Pagination -->
              <div class="pagination-section">
                <div class="pagination-controls">
                  <button
                    class="pagination-btn"
                    :disabled="currentPage === 1"
                    @click="previousPage"
                  >
                    Previous
                  </button>

                  <div class="page-numbers">
                    <button
                      v-for="page in totalPages"
                      :key="page"
                      class="page-number"
                      :class="{ active: currentPage === page }"
                      @click="goToPage(page)"
                    >
                      {{ page }}
                    </button>
                  </div>

                  <button
                    class="pagination-btn"
                    :disabled="currentPage === totalPages"
                    @click="nextPage"
                  >
                    Next
                  </button>
                </div>

                <div class="pagination-info">
                  Showing {{ ((currentPage - 1) * itemsPerPage) + 1 }}-{{ Math.min(currentPage * itemsPerPage, filteredProducts.length) }} of {{ filteredProducts.length }} items
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ========================================== -->
      <!-- STAGE 2: REVIEW CART -->
      <!-- ========================================== -->
      <div v-if="currentStage === 2" class="stage-content">
        <div class="cart-container">
          <div class="cart-header">
            <div class="cart-title-section">
              <span class="cart-icon">🛒</span>
              <h2 class="cart-title">Review Your Order</h2>
            </div>
            <span class="item-count-badge">{{ totalItems }} item{{ totalItems !== 1 ? 's' : '' }}</span>
          </div>

          <div v-if="cart.length === 0" class="empty-cart">
            <div class="empty-illustration">
              <span class="empty-icon">🛒</span>
              <span class="empty-emoji">😋</span>
            </div>
            <h3>Your cart is empty</h3>
            <p>Looks like you haven't added anything yet</p>
            <button class="back-to-menu-btn" @click="goToStage(1)">
              ← Back to Menu
            </button>
          </div>

          <div v-else class="cart-review-content">
            <div class="cart-items">
              <div v-for="(item, idx) in cart" :key="idx" class="cart-item">
                <div class="cart-item-left">
                  <span class="cart-item-emoji">{{ item.emoji }}</span>
                  <div class="cart-item-details">
                    <h4 class="cart-item-name">{{ item.name }}</h4>
                    <p class="cart-item-price-per">₱{{ item.price }} each</p>
                  </div>
                </div>
                <div class="cart-item-right">
                  <div class="quantity-controls">
                    <button class="qty-btn" @click="changeQty(idx, -1)">−</button>
                    <span class="qty-value">× {{ item.qty }}</span>
                    <button class="qty-btn" @click="changeQty(idx, 1)">+</button>
                  </div>
                  <div class="cart-item-total">₱{{ item.price * item.qty }}</div>
                  <button class="remove-btn" @click="removeItem(idx)">✕</button>
                </div>
              </div>
            </div>

            <div class="cart-summary">
              <h3 class="summary-heading">Order Summary</h3>
              <div class="summary-rows">
                <div class="summary-row">
                  <span>Subtotal ({{ totalItems }} items)</span>
                  <span class="row-value">₱{{ cartTotal }}</span>
                </div>
                <div class="summary-row">
                  <span>Delivery Fee</span>
                  <span class="row-value free">FREE</span>
                </div>
                <div v-if="cartTotal > 500" class="summary-row discount">
                  <span>Island Discount</span>
                  <span class="row-value discount">-₱50</span>
                </div>
                <div class="summary-divider"></div>
                <div class="summary-row total">
                  <span>Tentative Total</span>
                  <span class="row-total">₱{{ calculateTotalWithDiscount }}</span>
                </div>
              </div>
            </div>

            <div class="navigation-buttons">
              <button class="nav-button back" @click="previousStage">
                ← Back to Menu
              </button>
              <button class="nav-button proceed" @click="proceedToCheckout">
                Proceed to Checkout →
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- ========================================== -->
      <!-- STAGE 3: CHECKOUT -->
      <!-- ========================================== -->
      <div v-if="currentStage === 3" class="stage-content">
        <div class="checkout-container">
          <div class="checkout-header">
            <div class="checkout-title-section">
              <span class="checkout-icon">📍</span>
              <h2 class="checkout-title">Delivery & Checkout</h2>
            </div>
          </div>

          <div class="checkout-body">
            <!-- Two Column Layout -->
            <div class="checkout-columns">
              <!-- LEFT COLUMN: Delivery Location -->
              <div class="checkout-left">
                <div class="checkout-section">
                  <h3 class="section-heading">
                    <span class="section-icon">📍</span>
                    Delivery Location
                  </h3>

                  <div class="location-types">
                    <div
                      v-for="type in locationTypes"
                      :key="type"
                      class="location-type-option"
                      :class="{ selected: currentLocType === type }"
                      @click="selectLocType(type)"
                    >
                      <span class="location-emoji">{{ locationEmojis[type] }}</span>
                      <span class="location-name">{{ type }}</span>
                    </div>
                  </div>

                  <div v-if="currentLocType !== 'Day Guest'" class="form-field">
                    <label class="field-label">
                      {{ currentLocType }} Number
                      <span class="required">*</span>
                    </label>
                    <div class="field-input-wrapper">
                      <span class="field-icon">🏷️</span>
                      <input
                        v-model="locationNumber"
                        class="field-input"
                        type="text"
                        :placeholder="`Enter your ${currentLocType.toLowerCase()} number`"
                      />
                    </div>
                  </div>

                  <div class="form-field">
                    <label class="field-label">Special Instructions (optional)</label>
                    <div class="field-input-wrapper">
                      <span class="field-icon">📝</span>
                      <textarea
                        v-model="locationNotes"
                        class="field-textarea"
                        placeholder="e.g., Please knock gently, baby sleeping..."
                        rows="3"
                      ></textarea>
                    </div>
                  </div>

                  <button class="confirm-location-btn" @click="saveLocation">
                    <span class="icon-inline">📍</span>
                    {{ locationSaved ? 'Update Location' : 'Confirm Location' }}
                  </button>

                  <transition name="slide-down">
                    <div v-if="showLocationSaved" class="success-alert">
                      <span class="success-icon-inline">✅</span>
                      Location confirmed!
                    </div>
                  </transition>
                </div>
              </div>

              <!-- RIGHT COLUMN: Order Review -->
              <div class="checkout-right">
                <div class="checkout-section">
                  <h3 class="section-heading">
                    <span class="section-icon">📋</span>
                    Order Review
                  </h3>

                  <div class="order-items-list">
                    <div v-for="(item, idx) in cart" :key="idx" class="order-item">
                      <span class="order-item-name">{{ item.name }}</span>
                      <span class="order-item-qty">× {{ item.qty }}</span>
                      <span class="order-item-price">₱{{ item.price * item.qty }}</span>
                    </div>
                  </div>

                  <div class="order-totals">
                    <div class="order-total-row">
                      <span>Subtotal</span>
                      <span>₱{{ cartTotal }}</span>
                    </div>
                    <div class="order-total-row">
                      <span>Delivery</span>
                      <span class="free-label">FREE</span>
                    </div>
                    <div v-if="cartTotal > 500" class="order-total-row discount">
                      <span>Discount</span>
                      <span>-₱50</span>
                    </div>
                    <div class="order-total-divider"></div>
                    <div class="order-total-row final">
                      <span>Total Amount</span>
                      <span class="final-amount">₱{{ calculateTotalWithDiscount }}</span>
                    </div>
                  </div>
                </div>

                <div class="info-box">
                  <span class="info-box-icon">ℹ️</span>
                  <div class="info-box-text">
                    <strong>Delivery Time:</strong> 30-45 minutes<br>
                    <strong>Payment:</strong> Cash on delivery
                  </div>
                </div>

                <div v-if="!locationSaved" class="warning-box">
                  <span class="warning-box-icon">⚠️</span>
                  Please confirm your delivery location before placing order
                </div>
              </div>
            </div>

            <!-- Navigation Buttons -->
            <div class="navigation-buttons">
              <button class="nav-button back" @click="previousStage">
                ← Back to Cart
              </button>
              <button
                class="nav-button submit"
                :disabled="!locationSaved"
                @click="placeOrder"
              >
                <span class="icon-inline">🛵</span>
                Place Order • ₱{{ calculateTotalWithDiscount }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Toast Notification -->
    <div class="toast-notification" :class="{ visible: showToast }">
      <span class="toast-icon-emoji">🎉</span>
      <div class="toast-message">
        <strong>Order placed successfully!</strong>
        <span>Your food is on the way</span>
      </div>
    </div>

    <!-- Floating Cart (Stage 1 only) -->
    <button
      class="floating-cart-button"
      @click="proceedToCart"
      v-show="currentStage === 1 && totalItems > 0"
    >
      <span class="float-cart-icon">🛒</span>
      <span class="float-cart-badge">{{ totalItems }}</span>
    </button>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const API_BASE = 'http://localhost:8000/api/pos'

// State
const activeTab = ref('restaurant')
const cart = ref([])
const currentLocType = ref('Room')
const locationNumber = ref('')
const locationNotes = ref('')
const locationSaved = ref(false)
const showLocationSaved = ref(false)
const showToast = ref(false)
const addedProducts = ref(new Set())
const searchQuery = ref('')

// Stage & Pagination
const currentStage = ref(1)
const currentPage = ref(1)
const itemsPerPage = ref(16)

// Location Data (Day Guest removed)
const locationTypes = ['Room', 'Cottage']
const locationEmojis = {
  'Room': '🛏️',
  'Cottage': '🏡'
}

// Fallback Products
const fallbackProducts = {
  restaurant: [
    { name: 'Beef Mami Noodle Soup', price: 185, emoji: '🍜', desc: 'Rich broth, tender beef, fresh noodles' },
    { name: 'Creamy Pasta Carbonara', price: 220, emoji: '🍝', desc: 'Bacon, egg, parmesan, cream sauce' },
    { name: 'Crispy Calamari', price: 240, emoji: '🦑', desc: 'With garlic aioli dipping sauce' },
    { name: 'Seafood Sinuglaw Bowl', price: 295, emoji: '🍚', desc: 'Fresh kinilaw + grilled pork, served with rice' },
    { name: 'Mango Shake (Large)', price: 95, emoji: '🥭', desc: 'Fresh mango, milk, crushed ice' },
    { name: 'Iced Café Latte', price: 110, emoji: '☕', desc: 'Resort blend espresso + fresh milk' }
  ],
  store: [
    { name: 'Sunscreen SPF 50+', price: 180, emoji: '🧴', desc: 'Resort edition, water-resistant' },
    { name: 'Bottled Water (1L) × 6', price: 90, emoji: '💧', desc: 'Chilled, purified drinking water' },
    { name: 'Resort Souvenir T-Shirt', price: 450, emoji: '👕', desc: 'Available in S, M, L, XL' },
    { name: 'Resort Flip Flops', price: 350, emoji: '🩴', desc: 'Eduardo\'s branded, all sizes' },
    { name: 'Snack Bundle Pack', price: 120, emoji: '🍫', desc: 'Chips + chocolate + candy assorted' },
    { name: 'Toiletry Kit', price: 150, emoji: '🪥', desc: 'Toothbrush, toothpaste, shampoo, soap' }
  ]
}

const products = ref({ ...fallbackProducts })
const isLoading = ref(false)
const loadError = ref('')

// Computed
const totalItems = computed(() =>
  cart.value.reduce((sum, item) => sum + item.qty, 0)
)

const cartTotal = computed(() =>
  cart.value.reduce((sum, item) => sum + item.price * item.qty, 0)
)

// Apply discount if cart total is over 500
const calculateTotalWithDiscount = computed(() => {
  const total = cartTotal.value
  return total > 500 ? total - 50 : total
})

// Discount removed — total is now direct subtotal
const finalTotal = computed(() => cartTotal.value)

const filteredProducts = computed(() => {
  const currentProducts = products.value[activeTab.value] || []
  if (!searchQuery.value) return currentProducts

  return currentProducts.filter(p =>
    p.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    p.desc.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

const totalPages = computed(() =>
  Math.ceil(filteredProducts.value.length / itemsPerPage.value)
)

const paginatedProducts = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  return filteredProducts.value.slice(start, start + itemsPerPage.value)
})

// Methods
const getTabCount = (tab) => products.value[tab]?.length || 0

const switchTab = (tab) => {
  activeTab.value = tab
  searchQuery.value = ''
  currentPage.value = 1
}

const goToStage = (stage) => {
  currentStage.value = stage
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const previousStage = () =>
  currentStage.value > 1 && goToStage(currentStage.value - 1)

const proceedToCart = () => {
  if (cart.value.length === 0)
    return alert('Please add items to your cart first')
  goToStage(2)
}

const proceedToCheckout = () => {
  if (cart.value.length === 0)
    return alert('Your cart is empty')
  goToStage(3)
}

const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    window.scrollTo({ top: 300, behavior: 'smooth' })
  }
}

const nextPage = () =>
  currentPage.value < totalPages.value && currentPage.value++

const previousPage = () =>
  currentPage.value > 1 && currentPage.value--

const isProductAdded = (productName) =>
  addedProducts.value.has(productName)

const addToCart = (product) => {
  const existing = cart.value.find(i => i.name === product.name)

  if (existing) {
    existing.qty++
  } else {
    cart.value.push({ ...product, qty: 1 })
  }

  addedProducts.value.add(product.name)
  setTimeout(() => addedProducts.value.delete(product.name), 1200)
}

const changeQty = (idx, delta) => {
  cart.value[idx].qty += delta
  if (cart.value[idx].qty <= 0)
    cart.value.splice(idx, 1)
}

const removeItem = (idx) =>
  cart.value.splice(idx, 1)

const selectLocType = (type) => {
  currentLocType.value = type
}

const saveLocation = () => {
  if (!locationNumber.value.trim()) {
    return alert(`Please enter your ${currentLocType.value} number.`)
  }

  locationSaved.value = true
  showLocationSaved.value = true
  setTimeout(() => showLocationSaved.value = false, 3000)
}

const placeOrder = async () => {
  if (!locationSaved.value)
    return alert('Please set your delivery location first')

  if (cart.value.length === 0)
    return alert('Your cart is empty')

  try {
    const orderData = {
      cart: cart.value.map(item => ({
        name: item.name,
        price: item.price,
        qty: item.qty
      })),
      locationType: currentLocType.value,
      locationNumber: locationNumber.value,
      deliveryNotes: locationNotes.value,
      totalAmount: calculateTotalWithDiscount.value
    }

    const response = await fetch(`${API_BASE}/eshop/order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData)
    })

    const result = await response.json()

    if (!response.ok)
      throw new Error(result.error || 'Failed to place order')

    showToast.value = true

    // Reset
    cart.value = []
    locationSaved.value = false
    locationNumber.value = ''
    locationNotes.value = ''
    currentStage.value = 1

    setTimeout(() => showToast.value = false, 4000)

  } catch (error) {
    alert(`Failed to place order: ${error.message}`)
  }
}

const getEmojiForCategory = (category) => {
  if (category === 'restaurant') return '🍽️'
  if (category === 'store') return '🛍️'
  return '🧾'
}

const mapPosItems = (items, category) => {
  return items.map(item => ({
    name: item.name || 'Unnamed item',
    price: parseFloat(item.price) || 0,
    emoji: getEmojiForCategory(category),
    desc: item.description || 'No description available'
  }))
}

const fetchCategoryItems = async (category) => {
  const response = await fetch(`${API_BASE}/items/category/${category}`)
  if (!response.ok)
    throw new Error(`Failed to load ${category} items`)
  const data = await response.json()
  return Array.isArray(data) ? data : []
}

const fetchProducts = async () => {
  isLoading.value = true
  loadError.value = ''

  try {
    const [restaurantItems, storeItems] = await Promise.all([
      fetchCategoryItems('restaurant'),
      fetchCategoryItems('store')
    ])

    const restaurant = mapPosItems(restaurantItems, 'restaurant')
    const store = storeItems.length > 0
      ? mapPosItems(storeItems, 'store')
      : fallbackProducts.store

    products.value = {
      restaurant: restaurant.length > 0
        ? restaurant
        : fallbackProducts.restaurant,
      store
    }

  } catch (error) {
    loadError.value = 'Unable to load items from the server.'
    products.value = { ...fallbackProducts }
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchProducts()
})
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.eshop-container {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: #eff6ff; /* palette: blue-50 */
  min-height: 100vh;
  color: #1e3a8a; /* palette: blue-900 (default text) */
}

/* ══════════════════════════════════════════ */
/* HEADER */
/* ══════════════════════════════════════════ */
.eshop-header {
  background: #ffffff;
  padding: 0.85rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.25rem;
  border-bottom: 2px solid rgba(191, 219, 254, 0.50); /* palette: soft blue divider */
  box-shadow: 0 8px 18px rgba(30, 64, 175, 0.30); /* palette: blue overlay */
}

.header-left {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  flex: 0 0 auto;
}

.header-icon {
  font-size: 1.85rem;
}

.header-title {
  font-size: 1.4rem;
  font-weight: 800;
  color: #1e40af; /* palette: primary blue */
  margin: 0;
  white-space: nowrap;
}

.header-right {
  display: flex;
  gap: 0.75rem;
  flex: 0 0 auto;
}

.location-btn {
  background: #ffffff;
  border: 2px solid #d4af37; /* palette: gold */
  padding: 0.55rem 1rem;
  border-radius: 10px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-size: 0.9rem;
  color: #1e40af;
  transition: background 0.2s, border-color 0.2s, color 0.2s, transform 0.2s;
}

.location-btn:hover {
  background: #eff6ff;
  transform: translateY(-1px);
}

.location-pin {
  color: #d4af37;
  font-size: 1.1rem;
}

.dropdown-icon {
  font-size: 0.7rem;
  color: #1d4ed8; /* palette: blue-700 */
}

.cart-header-btn {
  background: #1e40af; /* palette: primary blue */
  border: 2px solid #1e40af;
  color: #ffffff;
  padding: 0.55rem 1rem;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-weight: 900;
  transition: background 0.2s, border-color 0.2s, transform 0.2s, box-shadow 0.2s;
  box-shadow: 0 10px 22px rgba(30, 64, 175, 0.30);
}

.cart-header-btn:hover {
  background: #d4af37; /* palette: gold hover */
  border-color: #d4af37;
  color: #1e3a8a; /* palette: blue-900 text on gold */
  transform: translateY(-1px);
}

.cart-icon-header {
  font-size: 1.1rem;
}

.cart-badge-header {
  background: #ffffff;
  color: #1e40af;
  border-radius: 999px;
  min-width: 22px;
  height: 22px;
  padding: 0 8px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 900;
  border: 2px solid rgba(191, 219, 254, 0.50);
}

/* ══════════════════════════════════════════ */
/* STAGE TABS (Now in Header) */
/* ══════════════════════════════════════════ */
.stage-tabs-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
  flex: 1 1 auto;
  min-width: 0;
}

.stage-tab-btn {
  background: rgba(59, 130, 246, 0.15); /* palette: blue tint */
  border: 2px solid rgba(191, 219, 254, 0.50); /* palette: soft blue border */
  padding: 0.55rem 0.8rem;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 0.55rem;
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s, transform 0.2s, color 0.2s, box-shadow 0.2s;
  color: #1e40af;
  white-space: nowrap;
  position: relative;
  z-index: 1;
  pointer-events: auto;
}

.stage-tab-btn:hover {
  background: rgba(30, 64, 175, 0.30); /* palette: blue overlay */
  color: #ffffff;
  transform: translateY(-1px);
}

.stage-tab-btn.active {
  background: #1e40af;
  color: #ffffff;
  border-color: #1e40af;
  box-shadow: 0 10px 22px rgba(30, 64, 175, 0.30);
}

.stage-tab-btn.completed:not(.active) {
  opacity: 1;
}

.stage-icon {
  width: 28px;
  height: 28px;
  border-radius: 999px;
  background: rgba(59, 130, 246, 0.15); /* palette: blue tint */
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 900;
  color: #1e40af;
  border: 2px solid rgba(191, 219, 254, 0.50);
}

.stage-tab-btn.active .stage-icon {
  background: #ffffff;
  color: #1e40af;
  border-color: rgba(255, 255, 255, 0.30); /* palette: soft white border */
}

.stage-tab-btn.completed .stage-icon {
  background: #d4af37; /* palette: gold */
  color: #1e3a8a; /* palette: deep blue */
  border-color: rgba(212, 175, 55, 0.20); /* palette: gold overlay */
}

.stage-label {
  font-weight: 900;
  font-size: 0.92rem;
}

/* ══════════════════════════════════════════ */
/* MAIN WRAPPER */
/* ══════════════════════════════════════════ */
.main-wrapper {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1.25rem 1.5rem;
}

.stage-content {
  width: 100%;
}

/* ══════════════════════════════════════════ */
/* STAGE 1: MENU */
/* ══════════════════════════════════════════ */
.menu-container {
  background: #ffffff;
  border-radius: 14px;
  border: 2px solid rgba(191, 219, 254, 0.50);
  box-shadow: 0 12px 26px rgba(30, 64, 175, 0.30);
  overflow: hidden;
}

.menu-header {
  padding: 1.1rem 1.5rem;
  border-bottom: 2px solid rgba(191, 219, 254, 0.50);
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: nowrap;
  gap: 1.25rem;
  background: #ffffff;
}

.menu-title-section {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  flex-wrap: nowrap;
  min-width: 0;
}

.menu-icon {
  font-size: 1.6rem;
}

.menu-title {
  font-size: 1.25rem;
  font-weight: 950;
  color: #1e40af;
  margin: 0;
  white-space: nowrap;
}

.search-box {
  position: relative;
  width: 360px;
  max-width: 100%;
  flex: 0 1 420px;
  margin-left: auto;
}

.search-icon {
  position: absolute;
  left: 0.9rem;
  top: 50%;
  transform: translateY(-50%);
  font-size: 1.05rem;
  color: #1d4ed8; /* palette: blue-700 */
}

.search-input {
  padding: 0.6rem 0.9rem 0.6rem 2.8rem;
  border: 2px solid rgba(191, 219, 254, 0.50);
  border-radius: 10px;
  font-size: 0.95rem;
  width: 100%;
  transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
  background: #eff6ff;
  color: #1e3a8a;
}

.search-input:focus {
  outline: none;
  border-color: #2563eb; /* palette: blue-600 */
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15); /* palette: blue tint */
  background: #ffffff;
}

/* Products Section */
.products-section {
  padding: 1.25rem 1.5rem 1.5rem;
}

.loading-container,
.error-container {
  text-align: center;
  padding: 3rem 1.5rem;
  color: #1e3a8a;
}

.spinner {
  width: 44px;
  height: 44px;
  border: 4px solid #eff6ff; /* palette: blue-50 */
  border-top: 4px solid #2563eb; /* palette: blue-600 */
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-emoji {
  font-size: 2.75rem;
  display: block;
  margin-bottom: 1rem;
}

.retry-button {
  background: #1e40af;
  color: #ffffff;
  border: 2px solid #1e40af;
  padding: 0.65rem 1.6rem;
  border-radius: 10px;
  font-weight: 900;
  cursor: pointer;
  margin-top: 1rem;
  transition: background 0.2s, border-color 0.2s, color 0.2s, transform 0.2s, box-shadow 0.2s;
  box-shadow: 0 10px 22px rgba(30, 64, 175, 0.30);
}

.retry-button:hover {
  background: #d4af37; /* gold hover */
  border-color: #d4af37;
  color: #1e3a8a;
  transform: translateY(-1px);
}

/* Simplified Product Grid */
.products-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.95rem;
  margin-bottom: 1.25rem;
}

/* Card */
.product-card {
  background: #ffffff;
  border: 2px solid rgba(191, 219, 254, 0.50);
  border-radius: 14px;
  padding: 0.9rem;
  transition: border-color 0.2s, box-shadow 0.2s, background 0.2s, transform 0.2s;
  display: flex;
  flex-direction: column;
}

.product-card:hover {
  background: #eff6ff;
  border-color: rgba(212, 175, 55, 0.20); /* gold emphasis */
  box-shadow: 0 14px 34px rgba(30, 64, 175, 0.30);
  transform: translateY(-1px);
}

.product-image-area {
  display: flex;
  justify-content: center;
  margin-bottom: 0.65rem;
}

.product-emoji {
  font-size: 2.1rem;
  background: #ffffff;
  width: 52px;
  height: 52px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  border: 2px solid rgba(191, 219, 254, 0.50);
}

.product-info-area {
  text-align: left;
  margin-bottom: 0.75rem;
  flex: 1;
}

.product-title {
  font-size: 0.95rem;
  font-weight: 950;
  color: #1e3a8a; /* blue-900 */
  margin: 0 0 0.35rem;
  line-height: 1.25;
}

.product-subtitle {
  font-size: 0.82rem;
  color: #1d4ed8; /* blue-700 for readable secondary text */
  margin: 0;
  line-height: 1.35;
}

.product-actions-area {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 0.75rem;
  border-top: 2px solid rgba(191, 219, 254, 0.50);
  gap: 0.75rem;
}

.product-price {
  font-size: 1.05rem;
  font-weight: 950;
  color: #1e40af;
  white-space: nowrap;
}

.product-add-btn {
  background: #1e40af; /* blue normal */
  color: #ffffff;
  border: 2px solid #1e40af;
  padding: 0.5rem 0.9rem;
  border-radius: 10px;
  font-weight: 950;
  font-size: 0.85rem;
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s, color 0.2s, transform 0.2s, box-shadow 0.2s;
  white-space: nowrap;
  box-shadow: 0 10px 22px rgba(30, 64, 175, 0.30);
}

.product-add-btn:hover {
  background: #d4af37; /* gold hover */
  border-color: #d4af37;
  color: #1e3a8a;
  transform: translateY(-1px);
}

.product-add-btn.added {
  background: #d4af37;
  border-color: #d4af37;
  color: #1e3a8a;
}

/* Pagination */
.pagination-section {
  margin-top: 1.25rem;
  padding-top: 1.25rem;
  border-top: 2px solid rgba(191, 219, 254, 0.50);
}

.pagination-controls {
  display: grid;
  grid-template-columns: 160px 1fr 160px;
  align-items: center;
  gap: 0.9rem;
  margin-bottom: 0.75rem;
}

.pagination-btn {
  width: 100%;
  background: #ffffff;
  border: 2px solid rgba(191, 219, 254, 0.50);
  color: #1e3a8a;
  padding: 0.6rem 0.9rem;
  border-radius: 10px;
  font-weight: 950;
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s, color 0.2s, transform 0.2s, box-shadow 0.2s;
  height: 40px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.pagination-btn:hover:not(:disabled) {
  background: #d4af37; /* gold hover */
  border-color: #d4af37;
  color: #1e3a8a;
  transform: translateY(-1px);
  box-shadow: 0 10px 22px rgba(30, 64, 175, 0.30);
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-numbers {
  display: flex;
  justify-content: center;
  gap: 0.45rem;
  flex-wrap: wrap;
  padding: 0 0.25rem;
}

.page-number {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  border: 2px solid rgba(191, 219, 254, 0.50);
  background: #ffffff;
  color: #1e3a8a;
  font-weight: 950;
  cursor: pointer;
  transition: border-color 0.2s, color 0.2s, background 0.2s, transform 0.2s, box-shadow 0.2s;
}

.page-number:hover {
  border-color: #d4af37;
  color: #1e3a8a;
  background: rgba(212, 175, 55, 0.10); /* subtle gold tint */
  transform: translateY(-1px);
}

.page-number.active {
  background: #1e40af;
  border-color: #1e40af;
  color: #ffffff;
  box-shadow: 0 10px 22px rgba(30, 64, 175, 0.30);
}

.pagination-info {
  text-align: center;
  color: #1d4ed8; /* blue-700 */
  font-size: 0.88rem;
}

/* ══════════════════════════════════════════ */
/* STAGE 2: CART REVIEW */
/* ══════════════════════════════════════════ */
.cart-container {
  background: #ffffff;
  border-radius: 14px;
  border: 2px solid rgba(191, 219, 254, 0.50);
  box-shadow: 0 12px 26px rgba(30, 64, 175, 0.30);
  overflow: hidden;
  max-width: 900px;
  margin: 0 auto;
}

.cart-header {
  padding: 1.2rem 1.5rem;
  border-bottom: 2px solid rgba(191, 219, 254, 0.50);
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #ffffff;
}

.cart-title-section {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.cart-icon {
  font-size: 1.8rem;
}

.cart-title {
  font-size: 1.3rem;
  font-weight: 950;
  color: #1e3a8a;
  margin: 0;
}

.item-count-badge {
  background: #eff6ff;
  color: #1e40af;
  padding: 0.35rem 0.9rem;
  border-radius: 999px;
  font-weight: 950;
  border: 2px solid rgba(191, 219, 254, 0.50);
}

.empty-cart {
  text-align: center;
  padding: 3.25rem 1.5rem;
}

.empty-illustration {
  font-size: 3.5rem;
  margin-bottom: 0.75rem;
}

.empty-cart h3 {
  font-size: 1.4rem;
  color: #1e3a8a;
  margin-bottom: 0.4rem;
  font-weight: 950;
}

.empty-cart p {
  color: #1d4ed8;
  margin-bottom: 1.5rem;
  font-weight: 700;
}

.back-to-menu-btn {
  background: #1e40af; /* blue normal */
  color: #ffffff;
  border: 2px solid #1e40af;
  padding: 0.7rem 1.6rem;
  border-radius: 10px;
  font-weight: 950;
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s, color 0.2s, transform 0.2s, box-shadow 0.2s;
  box-shadow: 0 10px 22px rgba(30, 64, 175, 0.30);
}

.back-to-menu-btn:hover {
  background: #d4af37; /* gold hover */
  border-color: #d4af37;
  color: #1e3a8a;
  transform: translateY(-1px);
}

.cart-review-content {
  padding: 1.5rem;
}

.cart-items {
  max-height: 460px;
  overflow-y: auto;
  margin-bottom: 1.25rem;
}

.cart-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  background: #eff6ff;
  border: 2px solid rgba(191, 219, 254, 0.50);
  border-radius: 12px;
  margin-bottom: 0.75rem;
  transition: background 0.2s, border-color 0.2s, transform 0.2s;
}

.cart-item:hover {
  background: #ffffff;
  border-color: rgba(212, 175, 55, 0.20);
  transform: translateY(-1px);
}

.cart-item-left {
  display: flex;
  align-items: center;
  gap: 0.9rem;
  flex: 1;
}

.cart-item-emoji {
  font-size: 2.2rem;
  width: 54px;
  height: 54px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #ffffff;
  border-radius: 12px;
  border: 2px solid rgba(191, 219, 254, 0.50);
}

.cart-item-details {
  flex: 1;
}

.cart-item-name {
  font-size: 1.02rem;
  font-weight: 950;
  color: #1e3a8a;
  margin: 0 0 0.2rem;
}

.cart-item-price-per {
  font-size: 0.9rem;
  color: #1d4ed8;
  margin: 0;
  font-weight: 700;
}

.cart-item-right {
  display: flex;
  align-items: center;
  gap: 0.85rem;
}

.quantity-controls {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  background: #ffffff;
  padding: 0.45rem 0.7rem;
  border-radius: 10px;
  border: 2px solid rgba(191, 219, 254, 0.50);
}

.qty-btn {
  background: none;
  border: none;
  color: #1e40af;
  font-size: 1.15rem;
  font-weight: 950;
  cursor: pointer;
  padding: 0.2rem 0.45rem;
  transition: color 0.2s, transform 0.2s;
}

.qty-btn:hover {
  color: #d4af37; /* gold emphasis */
  transform: translateY(-1px);
}

.qty-value {
  font-weight: 950;
  font-size: 0.95rem;
  color: #1e3a8a;
  min-width: 56px;
  text-align: center;
}

.cart-item-total {
  font-weight: 950;
  font-size: 1.05rem;
  color: #1e40af;
  min-width: 96px;
  text-align: right;
}

.remove-btn {
  background: #d4af37;
  color: #1e3a8a;
  border: 2px solid #d4af37;
  width: 34px;
  height: 34px;
  border-radius: 10px;
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s, transform 0.2s, box-shadow 0.2s;
  box-shadow: 0 10px 22px rgba(30, 64, 175, 0.30);
}

.remove-btn:hover {
  background: #b8941f;
  border-color: #b8941f;
  transform: translateY(-1px);
}

.cart-summary {
  background: #ffffff;
  padding: 1.2rem;
  border-radius: 12px;
  border: 2px solid rgba(191, 219, 254, 0.50);
  margin-bottom: 1.25rem;
}

.summary-heading {
  font-size: 1.05rem;
  font-weight: 950;
  color: #1e3a8a;
  margin: 0 0 0.85rem;
}

.summary-rows {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.98rem;
  color: #1d4ed8;
  font-weight: 800;
}

.row-value {
  font-weight: 950;
  color: #1e3a8a;
}

.row-value.free {
  color: #2563eb;
  font-weight: 950;
}

.row-value.discount {
  color: #b8941f;
  font-weight: 950;
}

.summary-row.discount {
  color: #b8941f;
  font-weight: 950;
}

.summary-divider {
  height: 2px;
  background: rgba(191, 219, 254, 0.50);
  margin: 0.25rem 0;
}

.summary-row.total {
  font-size: 1.08rem;
  font-weight: 950;
  color: #1e3a8a;
  margin-top: 0.25rem;
}

.row-total {
  font-size: 1.55rem;
  font-weight: 950;
  color: #1e40af;
}

/* ══════════════════════════════════════════ */
/* STAGE 3: CHECKOUT */
/* ══════════════════════════════════════════ */
.checkout-container {
  background: #ffffff;
  border-radius: 14px;
  border: 2px solid rgba(191, 219, 254, 0.50);
  box-shadow: 0 12px 26px rgba(30, 64, 175, 0.30);
  overflow: hidden;
  max-width: 1200px;
  margin: 0 auto;
}

.checkout-header {
  background: #1e40af;
  padding: 1.5rem;
  text-align: center;
  border-bottom: 3px solid rgba(212, 175, 55, 0.20);
}

.checkout-title-section {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
}

.checkout-icon {
  font-size: 1.85rem;
}

.checkout-title {
  font-size: 1.5rem;
  font-weight: 950;
  color: #ffffff;
  margin: 0;
}

.checkout-body {
  padding: 1.5rem;
  background: #ffffff;
}

.checkout-columns {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  margin-bottom: 1.25rem;
}

.checkout-left,
.checkout-right {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.checkout-section {
  background: #ffffff;
  padding: 1.25rem;
  border-radius: 12px;
  border: 2px solid rgba(191, 219, 254, 0.50);
}

.section-heading {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.05rem;
  font-weight: 950;
  color: #1e3a8a;
  margin: 0 0 1.1rem;
}

.section-icon {
  font-size: 1.25rem;
}

.location-types {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.85rem;
  margin-bottom: 1.1rem;
}

.location-type-option {
  background: #ffffff;
  border: 2px solid rgba(191, 219, 254, 0.50);
  padding: 1.15rem 0.9rem;
  border-radius: 12px;
  text-align: center;
  cursor: pointer;
  transition: border-color 0.2s, background 0.2s, color 0.2s, transform 0.2s;
  color: #1e3a8a;
}

.location-type-option:hover {
  border-color: #d4af37;
  background: rgba(212, 175, 55, 0.10);
  transform: translateY(-1px);
}

.location-type-option.selected {
  background: #1e40af;
  border-color: #1e40af;
  color: #ffffff;
}

.location-emoji {
  font-size: 2.25rem;
  display: block;
  margin-bottom: 0.55rem;
}

.location-name {
  font-weight: 950;
  font-size: 0.98rem;
}

.form-field {
  margin-bottom: 1rem;
}

.field-label {
  display: block;
  font-weight: 950;
  color: #1e3a8a;
  margin-bottom: 0.45rem;
  font-size: 0.95rem;
}

.required {
  color: #b8941f;
}

.field-input-wrapper {
  position: relative;
}

.field-icon {
  position: absolute;
  left: 0.9rem;
  top: 50%;
  transform: translateY(-50%);
  font-size: 1.05rem;
}

.field-input,
.field-textarea {
  width: 100%;
  padding: 0.7rem 0.9rem 0.7rem 2.8rem;
  border: 2px solid rgba(191, 219, 254, 0.50);
  border-radius: 10px;
  font-size: 0.98rem;
  font-family: inherit;
  transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
  background: #eff6ff;
  color: #1e3a8a;
}

.field-input:focus,
.field-textarea:focus {
  outline: none;
  border-color: #2563eb;
  background: #ffffff;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
}

.field-textarea {
  resize: vertical;
}

.confirm-location-btn {
  width: 100%;
  background: #1e40af; /* blue normal */
  color: #ffffff;
  border: 2px solid #1e40af;
  padding: 0.8rem 1.2rem;
  border-radius: 10px;
  font-weight: 950;
  font-size: 0.98rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: transform 0.2s, box-shadow 0.2s, background 0.2s, border-color 0.2s, color 0.2s;
  box-shadow: 0 10px 22px rgba(30, 64, 175, 0.30);
}

.confirm-location-btn:hover {
  transform: translateY(-1px);
  background: #d4af37; /* gold hover */
  border-color: #d4af37;
  color: #1e3a8a;
}

.icon-inline {
  font-size: 1.05rem;
}

.success-alert {
  background: #eff6ff;
  color: #1e40af;
  padding: 0.75rem 1rem;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 0.85rem;
  font-weight: 950;
  border: 2px solid rgba(191, 219, 254, 0.50);
}

.success-icon-inline {
  font-size: 1.15rem;
}

.order-items-list {
  background: #eff6ff;
  border-radius: 12px;
  padding: 0.9rem;
  margin-bottom: 1rem;
  border: 2px solid rgba(191, 219, 254, 0.50);
}

.order-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.65rem 0.75rem;
  background: #ffffff;
  border-radius: 10px;
  margin-bottom: 0.5rem;
  border: 2px solid rgba(191, 219, 254, 0.50);
}

.order-item:last-child {
  margin-bottom: 0;
}

.order-item-name {
  flex: 1;
  font-weight: 950;
  color: #1e3a8a;
  font-size: 0.93rem;
}

.order-item-qty {
  color: #1d4ed8;
  margin: 0 0.85rem;
  font-weight: 900;
  font-size: 0.88rem;
}

.order-item-price {
  font-weight: 950;
  color: #1e40af;
  min-width: 80px;
  text-align: right;
  font-size: 0.98rem;
}

.order-totals {
  background: #ffffff;
  border-radius: 12px;
  padding: 1rem;
  border: 2px solid rgba(191, 219, 254, 0.50);
}

.order-total-row {
  display: flex;
  justify-content: space-between;
  padding: 0.45rem 0;
  color: #1d4ed8;
  font-size: 0.93rem;
  font-weight: 800;
}

.order-total-row.final {
  font-size: 1.05rem;
  font-weight: 950;
  color: #1e3a8a;
  margin-top: 0.35rem;
  padding-top: 0.65rem;
}

.free-label {
  color: #2563eb;
  font-weight: 950;
}

.order-total-row.discount {
  color: #b8941f;
  font-weight: 950;
}

.order-total-divider {
  height: 2px;
  background: rgba(191, 219, 254, 0.50);
  margin: 0.65rem 0;
}

.final-amount {
  font-size: 1.2rem;
  font-weight: 950;
  color: #1e40af;
}

.info-box {
  background: #eff6ff;
  border-left: 5px solid #2563eb;
  padding: 1rem;
  border-radius: 12px;
  display: flex;
  gap: 0.85rem;
}

.info-box-icon {
  font-size: 1.4rem;
}

.info-box-text {
  font-size: 0.93rem;
  color: #1e40af;
  line-height: 1.55;
  font-weight: 800;
}

.warning-box {
  background: rgba(212, 175, 55, 0.20);
  color: #1e3a8a;
  padding: 0.9rem;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.7rem;
  font-weight: 950;
  font-size: 0.9rem;
  text-align: center;
  border: 2px solid rgba(212, 175, 55, 0.20);
}

.warning-box-icon {
  font-size: 1.25rem;
}

/* ══════════════════════════════════════════ */
/* NAVIGATION BUTTONS */
/* ══════════════════════════════════════════ */
.navigation-buttons {
  display: flex;
  gap: 0.85rem;
  padding-top: 0;
  border-top: none;
}

.nav-button {
  flex: 1;
  padding: 0.95rem 1.4rem;
  border-radius: 12px;
  font-weight: 950;
  font-size: 0.98rem;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s, background 0.2s, border-color 0.2s, color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.nav-button.back {
  background: #ffffff;
  border: 2px solid rgba(191, 219, 254, 0.50);
  color: #1e3a8a;
}

.nav-button.back:hover {
  background: #eff6ff;
  border-color: #d4af37;
  transform: translateY(-1px);
  box-shadow: 0 10px 22px rgba(30, 64, 175, 0.30);
}

.nav-button.proceed,
.nav-button.submit {
  background: #1e40af; /* blue normal */
  border: 2px solid #1e40af;
  color: #ffffff;
  box-shadow: 0 10px 22px rgba(30, 64, 175, 0.30);
}

.nav-button.proceed:hover,
.nav-button.submit:hover:not(:disabled) {
  transform: translateY(-1px);
  background: #d4af37; /* gold hover */
  border-color: #d4af37;
  color: #1e3a8a;
  box-shadow: 0 14px 34px rgba(30, 64, 175, 0.30);
}

.nav-button.submit:disabled {
  opacity: 0.55;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

/* ══════════════════════════════════════════ */
/* TOAST & FLOATING CART */
/* ══════════════════════════════════════════ */
.toast-notification {
  position: fixed;
  top: -100px;
  left: 50%;
  transform: translateX(-50%);
  background: #ffffff;
  padding: 0.9rem 1.4rem;
  border-radius: 12px;
  border: 2px solid rgba(191, 219, 254, 0.50);
  box-shadow: 0 14px 34px rgba(30, 64, 175, 0.30);
  display: flex;
  align-items: center;
  gap: 0.9rem;
  transition: top 0.3s;
  z-index: 1000;
}

.toast-notification.visible {
  top: 1.25rem;
}

.toast-icon-emoji {
  font-size: 1.8rem;
}

.toast-message {
  display: flex;
  flex-direction: column;
}

.toast-message strong {
  color: #1e3a8a;
  font-size: 0.98rem;
  font-weight: 950;
}

.toast-message span {
  color: #1d4ed8;
  font-size: 0.88rem;
  font-weight: 800;
}

.floating-cart-button {
  position: fixed;
  bottom: 1.5rem;
  right: 1.5rem;
  width: 62px;
  height: 62px;
  border-radius: 50%;
  background: #1e40af; /* blue normal */
  color: #ffffff;
  border: 2px solid #1e40af;
  box-shadow: 0 14px 34px rgba(30, 64, 175, 0.30);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s, box-shadow 0.2s, background 0.2s, border-color 0.2s, color 0.2s;
  z-index: 999;
}

.floating-cart-button:hover {
  transform: scale(1.06);
  background: #d4af37; /* gold hover */
  border-color: #d4af37;
  color: #1e3a8a;
  box-shadow: 0 18px 40px rgba(30, 64, 175, 0.30);
}

.float-cart-icon {
  font-size: 1.75rem;
}

.float-cart-badge {
  position: absolute;
  top: -5px;
  right: -5px;
  background: #d4af37;
  color: #1e3a8a;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
  font-weight: 950;
  border: 3px solid #ffffff;
}

/* Slide animation */
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s;
}

.slide-down-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.slide-down-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

/* ══════════════════════════════════════════ */
/* RESPONSIVE DESIGN */
/* ══════════════════════════════════════════ */

/* Tablet and smaller */
@media (max-width: 768px) {
  .eshop-header {
    padding: 0.85rem 1rem;
    gap: 0.75rem;
    flex-wrap: wrap;
  }

  .header-title {
    font-size: 1.15rem;
  }

  .header-right {
    gap: 0.5rem;
  }

  .location-btn span:not(.location-pin) {
    display: none;
  }

  .stage-tabs-container {
    order: 3;
    width: 100%;
    justify-content: center;
    gap: 0.5rem;
    margin-top: 0.5rem;
  }

  .stage-tab-btn {
    padding: 0.5rem 0.7rem;
    font-size: 0.85rem;
  }

  .stage-label {
    display: none;
  }

  .main-wrapper {
    padding: 1rem;
  }

  .menu-header {
    flex-wrap: wrap;
    gap: 0.9rem;
    padding: 1rem 1.15rem;
  }

  .search-box {
    width: 100%;
    flex: 1 1 100%;
    margin-left: 0;
  }

  .products-section {
    padding: 1rem 1.15rem 1.25rem;
  }

  .products-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.85rem;
  }

  .pagination-controls {
    grid-template-columns: 1fr;
    gap: 0.65rem;
  }

  .pagination-btn {
    height: 42px;
  }

  .page-numbers {
    order: 2;
  }

  /* Stage 3 Checkout Responsive */
  .checkout-container {
    margin: 0 0.25rem;
  }

  .checkout-header {
    padding: 1.25rem 1rem;
  }

  .checkout-title {
    font-size: 1.35rem;
  }

  .checkout-icon {
    font-size: 1.6rem;
  }

  .checkout-body {
    padding: 1.1rem;
  }

  .checkout-columns {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .checkout-section {
    padding: 1.1rem;
  }

  .location-types {
    grid-template-columns: 1fr;
  }

  .navigation-buttons {
    flex-direction: column;
    gap: 0.75rem;
  }

  .nav-button {
    padding: 0.85rem 1.15rem;
  }
}

/* Mobile phones */
@media (max-width: 480px) {
  .header-icon {
    font-size: 1.5rem;
  }

  .header-title {
    font-size: 1rem;
  }

  .cart-header-btn span:not(.cart-icon-header):not(.cart-badge-header) {
    display: none;
  }

  .stage-tab-btn {
    padding: 0.45rem;
  }

  .stage-icon {
    width: 28px;
    height: 28px;
    font-size: 0.9rem;
  }

  .main-wrapper {
    padding: 0.85rem;
  }

  .products-grid {
    grid-template-columns: 1fr;
  }

  .product-card {
    padding: 0.9rem;
  }

  .pagination-btn {
    height: 42px;
  }

  /* Stage 3 Mobile */
  .checkout-header {
    padding: 1.1rem 1rem;
  }

  .checkout-title {
    font-size: 1.2rem;
  }

  .checkout-icon {
    font-size: 1.4rem;
  }

  .checkout-body {
    padding: 1rem;
  }

  .checkout-section {
    padding: 1rem;
  }

  .field-input,
  .field-textarea {
    padding: 0.7rem 0.85rem 0.7rem 2.65rem;
    font-size: 0.92rem;
  }

  .field-icon {
    font-size: 1rem;
    left: 0.85rem;
  }

  .confirm-location-btn {
    font-size: 0.95rem;
    padding: 0.75rem 1.1rem;
  }

  .order-item {
    padding: 0.6rem 0.7rem;
  }

  .order-item-name {
    font-size: 0.9rem;
  }

  .order-item-qty,
  .order-item-price {
    font-size: 0.85rem;
  }

  .order-total-row {
    font-size: 0.9rem;
    padding: 0.375rem 0;
  }

  .order-total-row.final {
    font-size: 1rem;
  }

  .final-amount {
    font-size: 1.15rem;
  }

  .info-box,
  .warning-box {
    padding: 0.85rem;
    font-size: 0.85rem;
  }

  .nav-button {
    font-size: 0.95rem;
    padding: 0.75rem 1rem;
  }
}
</style>