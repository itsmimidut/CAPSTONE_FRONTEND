<template>
  <div class="eshop-container">
    <!-- ══════════════════════════════════════════ -->
    <!-- HEADER -->
    <!-- ══════════════════════════════════════════ -->
    <header class="eshop-header">
      <div class="header-left">
        <span class="header-icon">🏝️</span>
        <h1 class="header-title">Eduardo's <span class="market-tag">MARKET</span></h1>
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
    <!-- BLUE GRADIENT SECTION WITH STAGE TABS -->
    <!-- ══════════════════════════════════════════ -->
    <div class="blue-gradient-section">
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
    </div>

    <!-- ══════════════════════════════════════════ -->
    <!-- MAIN CONTENT -->
    <!-- ══════════════════════════════════════════ -->
    <div class="main-wrapper">
      <!-- ========================================== -->
      <!-- STAGE 1: BROWSE PRODUCTS -->
      <!-- ========================================== -->
      <div v-if="currentStage === 1" class="stage-content">
        <div class="menu-container">
          <!-- Menu Header with Search -->
          <div class="menu-header">
            <div class="menu-title-section">
              <span class="menu-icon">🍽️</span>
              <h2 class="menu-title">Our Menu</h2>
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

          <!-- Product Category Tabs -->
          <div class="product-tabs">
            <button
              class="product-tab"
              :class="{ active: activeTab === 'restaurant' }"
              @click="switchTab('restaurant')"
            >
              <span class="tab-emoji">🍔</span>
              <span class="tab-text">Restaurant</span>
              <span class="tab-count">{{ getTabCount('restaurant') }}</span>
            </button>
            <!-- Mini Mart tab temporarily hidden -->
            <!-- <button
              class="product-tab"
              :class="{ active: activeTab === 'store' }"
              @click="switchTab('store')"
            >
              <span class="tab-emoji">🛍️</span>
              <span class="tab-text">Mini Mart</span>
              <span class="tab-count">{{ getTabCount('store') }}</span>
            </button> -->
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
  background: #F5F5F5; /* neutral-gray */
  min-height: 100vh;
}

/* ══════════════════════════════════════════ */
/* HEADER */
/* ══════════════════════════════════════════ */
.eshop-header {
  background: #fff;
  padding: 1rem 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 2px 4px rgba(43, 108, 176, 0.08); /* primary-blue shadow */
}

.header-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.header-icon {
  font-size: 2rem;
}

.header-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #2B6CB0; /* primary-blue */
  margin: 0;
}

.market-tag {
  background: linear-gradient(135deg, #C19A6B 0%, #8B5E3C 100%); /* warm-brown to deep-brown */
  color: #fff;
  padding: 0.2rem 0.8rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.header-right {
  display: flex;
  gap: 1rem;
}

.location-btn {
  background: #fff;
  border: 1px solid #C19A6B; /* warm-brown border */
  padding: 0.6rem 1.2rem;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-size: 0.9rem;
  color: #8B5E3C; /* deep-brown text */
  transition: all 0.2s;
}

.location-btn:hover {
  background: #F5F5F5; /* neutral-gray */
}

.location-pin {
  color: #e91e63;
  font-size: 1.1rem;
}

.dropdown-icon {
  font-size: 0.7rem;
  color: #95a5a6;
}

.cart-header-btn {
  background: #2B6CB0; /* primary-blue */
  border: none;
  color: #fff;
  padding: 0.6rem 1.2rem;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
}

.cart-header-btn:hover {
  background: #63B3ED; /* accent-blue */
}

.cart-icon-header {
  font-size: 1.1rem;
}

.cart-badge-header {
  background: #fff;
  color: #2B6CB0; /* primary-blue */
  border-radius: 50%;
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 700;
}

/* ══════════════════════════════════════════ */
/* BLUE GRADIENT SECTION */
/* ══════════════════════════════════════════ */
.blue-gradient-section {
  background: linear-gradient(135deg, #2B6CB0 0%, #63B3ED 100%); /* primary-blue to accent-blue */
  padding: 2rem;
}

.stage-tabs-container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: center;
  gap: 2rem;
}

.stage-tab-btn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  transition: all 0.3s;
  color: white;
  opacity: 0.7;
}

.stage-tab-btn:hover {
  opacity: 1;
}

.stage-tab-btn.active {
  background: #fff;
  color: #2B6CB0; /* primary-blue */
  opacity: 1;
  box-shadow: 0 4px 12px rgba(43, 108, 176, 0.15);
}

.stage-tab-btn.completed:not(.active) {
  opacity: 1;
}

.stage-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
}

.stage-tab-btn.active .stage-icon {
  background: #2B6CB0; /* primary-blue */
  color: #fff;
}

.stage-tab-btn.completed .stage-icon {
  background: #C19A6B; /* warm-brown */
  color: #fff;
}

.stage-label {
  font-weight: 600;
  font-size: 1rem;
}

/* ══════════════════════════════════════════ */
/* MAIN WRAPPER */
/* ══════════════════════════════════════════ */
.main-wrapper {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.stage-content {
  width: 100%;
}

/* ══════════════════════════════════════════ */
/* STAGE 1: MENU */
/* ══════════════════════════════════════════ */
.menu-container {
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(43, 108, 176, 0.08);
  overflow: hidden;
}

.menu-header {
  padding: 1.5rem 2rem;
  border-bottom: 2px solid #f1f3f5;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.menu-title-section {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.menu-icon {
  font-size: 1.8rem;
}

.menu-title {
  font-size: 1.4rem;
  font-weight: 700;
  color: #2B6CB0; /* primary-blue */
  margin: 0;
}

.search-box {
  position: relative;
}

.search-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  font-size: 1.1rem;
  color: #95a5a6;
}

.search-input {
  padding: 0.7rem 1rem 0.7rem 3rem;
  border: 2px solid #e1e8ed;
  border-radius: 10px;
  font-size: 0.95rem;
  width: 300px;
  transition: border 0.2s;
}

.search-input:focus {
  outline: none;
  border-color: #667eea;
}

/* Product Tabs */
.product-tabs {
  display: flex;
  padding: 0 2rem;
  gap: 0.5rem;
  border-bottom: 2px solid #f1f3f5;
}

.product-tab {
  background: transparent;
  border: none;
  padding: 1rem 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  color: #7f8c8d;
  font-weight: 600;
  border-bottom: 3px solid transparent;
  transition: all 0.2s;
}

.product-tab:hover {
  color: #2B6CB0; /* primary-blue */
}

.product-tab.active {
  color: #2B6CB0; /* primary-blue */
  border-bottom-color: #2B6CB0;
}

.tab-emoji {
  font-size: 1.2rem;
}

.tab-text {
  font-size: 1rem;
}

.tab-count {
  background: #63B3ED22; /* accent-blue, transparent */
  color: #2B6CB0; /* primary-blue */
  padding: 0.2rem 0.6rem;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 700;
}

.product-tab.active .tab-count {
  background: #2B6CB0; /* primary-blue */
  color: #fff;
}

/* Products Section */
.products-section {
  padding: 2rem;
}

.loading-container,
.error-container {
  text-align: center;
  padding: 4rem 2rem;
}

.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-emoji {
  font-size: 3rem;
  display: block;
  margin-bottom: 1rem;
}

.retry-button {
  background: #2B6CB0; /* primary-blue */
  color: #fff;
  border: none;
  padding: 0.75rem 2rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  margin-top: 1rem;
}

.retry-button:hover {
  background: #63B3ED; /* accent-blue */
}

/* 4-Column Grid */
.products-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  margin-bottom: 2rem;
}

.product-card {
  border: 2px solid #f1f3f5;
  border-radius: 12px;
  padding: 1rem;
  transition: all 0.2s;
  background: white;
  display: flex;
  flex-direction: column;
}

.product-card:hover {
  border-color: #667eea;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
  transform: translateY(-2px);
}

.product-image-area {
  text-align: center;
  margin-bottom: 0.75rem;
}

.product-emoji {
  font-size: 2.5rem;
  background: #f8f9fa;
  width: 60px;
  height: 60px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
}

.product-info-area {
  text-align: center;
  margin-bottom: 0.75rem;
  flex: 1;
}

.product-title {
  font-size: 0.95rem;
  font-weight: 700;
  color: #2c3e50;
  margin: 0 0 0.35rem;
}

.product-subtitle {
  font-size: 0.8rem;
  color: #7f8c8d;
  margin: 0;
  line-height: 1.3;
}

.product-actions-area {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 0.75rem;
  border-top: 1px solid #f1f3f5;
}

.product-price {
  font-size: 1.1rem;
  font-weight: 800;
  color: #2c3e50;
}

.product-add-btn {
  background: #5b8dee;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s;
}

.product-add-btn:hover {
  background: #4a7cd6;
  transform: scale(1.05);
}

.product-add-btn.added {
  background: #10b981;
}

/* Pagination */
.pagination-section {
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 2px solid #f1f3f5;
}

.pagination-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.pagination-btn {
  background: white;
  border: 2px solid #e1e8ed;
  color: #2c3e50;
  padding: 0.6rem 1.2rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.pagination-btn:hover:not(:disabled) {
  background: #667eea;
  border-color: #667eea;
  color: white;
}

.pagination-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.page-numbers {
  display: flex;
  gap: 0.5rem;
}

.page-number {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  border: 2px solid #e1e8ed;
  background: white;
  color: #2c3e50;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.page-number:hover {
  border-color: #667eea;
  color: #667eea;
}

.page-number.active {
  background: #667eea;
  border-color: #667eea;
  color: white;
}

.pagination-info {
  text-align: center;
  color: #7f8c8d;
  font-size: 0.9rem;
}

/* ══════════════════════════════════════════ */
/* STAGE 2: CART REVIEW */
/* ══════════════════════════════════════════ */
.cart-container {
  background: white;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  overflow: hidden;
  max-width: 900px;
  margin: 0 auto;
}

.cart-header {
  padding: 1.5rem 2rem;
  border-bottom: 2px solid #f1f3f5;
  display: flex;
  align-items: center;
  justify-content: space-between;
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
  font-size: 1.4rem;
  font-weight: 700;
  color: #2c3e50;
  margin: 0;
}

.item-count-badge {
  background: #e3f2fd;
  color: #667eea;
  padding: 0.4rem 1rem;
  border-radius: 20px;
  font-weight: 700;
}

.empty-cart {
  text-align: center;
  padding: 4rem 2rem;
}

.empty-illustration {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.empty-cart h3 {
  font-size: 1.5rem;
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.empty-cart p {
  color: #7f8c8d;
  margin-bottom: 2rem;
}

.back-to-menu-btn {
  background: #667eea;
  color: white;
  border: none;
  padding: 0.75rem 2rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
}

.back-to-menu-btn:hover {
  background: #5568d3;
}

.cart-review-content {
  padding: 2rem;
}

.cart-items {
  max-height: 500px;
  overflow-y: auto;
  margin-bottom: 2rem;
}

.cart-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem;
  background: #f8f9fa;
  border-radius: 12px;
  margin-bottom: 1rem;
  transition: all 0.2s;
}

.cart-item:hover {
  background: #e9ecef;
  transform: translateX(4px);
}

.cart-item-left {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
}

.cart-item-emoji {
  font-size: 2.5rem;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border-radius: 12px;
}

.cart-item-details {
  flex: 1;
}

.cart-item-name {
  font-size: 1.1rem;
  font-weight: 700;
  color: #2c3e50;
  margin: 0 0 0.25rem;
}

.cart-item-price-per {
  font-size: 0.9rem;
  color: #7f8c8d;
  margin: 0;
}

.cart-item-right {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.quantity-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: white;
  padding: 0.5rem 1rem;
  border-radius: 10px;
  border: 2px solid #e1e8ed;
}

.qty-btn {
  background: none;
  border: none;
  color: #667eea;
  font-size: 1.2rem;
  font-weight: 700;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
}

.qty-btn:hover {
  color: #5568d3;
}

.qty-value {
  font-weight: 700;
  font-size: 1rem;
  color: #2c3e50;
  min-width: 60px;
  text-align: center;
}

.cart-item-total {
  font-weight: 800;
  font-size: 1.2rem;
  color: #667eea;
  min-width: 100px;
  text-align: right;
}

.remove-btn {
  background: #ef4444;
  color: white;
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.remove-btn:hover {
  background: #dc2626;
  transform: scale(1.1);
}

.cart-summary {
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 12px;
  margin-bottom: 2rem;
}

.summary-heading {
  font-size: 1.1rem;
  font-weight: 700;
  color: #2c3e50;
  margin: 0 0 1rem;
}

.summary-rows {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  font-size: 1rem;
  color: #495057;
}

.row-value {
  font-weight: 600;
  color: #2c3e50;
}

.row-value.free {
  color: #10b981;
  font-weight: 700;
}

.row-value.discount {
  color: #ef4444;
}

.summary-row.discount {
  color: #ef4444;
}

.summary-divider {
  height: 2px;
  background: #dee2e6;
  margin: 0.5rem 0;
}

.summary-row.total {
  font-size: 1.2rem;
  font-weight: 700;
  color: #2c3e50;
  margin-top: 0.5rem;
}

.row-total {
  font-size: 1.8rem;
  font-weight: 800;
  color: #667eea;
}

/* ══════════════════════════════════════════ */
/* STAGE 3: CHECKOUT */
/* ══════════════════════════════════════════ */
.checkout-container {
  background: white;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  overflow: hidden;
  max-width: 1200px;
  margin: 0 auto;
}

.checkout-header {
  background: linear-gradient(135deg, #2B6CB0 0%, #63B3ED 100%);
  padding: 2rem;
  text-align: center;
}

.checkout-title-section {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
}

.checkout-icon {
  font-size: 2rem;
}

.checkout-title {
  font-size: 1.6rem;
  font-weight: 700;
  color: #fff;
  margin: 0;
}

.checkout-body {
  padding: 2rem;
}

.checkout-columns {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-bottom: 2rem;
}

.checkout-left,
.checkout-right {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.checkout-section {
  background: #ffffff;
  padding: 1.5rem;
  border-radius: 12px;
  border: 1px solid #e1e8ed;
}

.section-heading {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.1rem;
  font-weight: 700;
  color: #2c3e50;
  margin: 0 0 1.5rem;
}

.section-icon {
  font-size: 1.3rem;
}

.location-types {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.location-type-option {
  background: white;
  border: 2px solid #e1e8ed;
  padding: 1.5rem 1rem;
  border-radius: 12px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
}

.location-type-option:hover {
  border-color: #667eea;
}

.location-type-option.selected {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-color: #667eea;
  color: white;
}

.location-emoji {
  font-size: 2.5rem;
  display: block;
  margin-bottom: 0.75rem;
}

.location-name {
  font-weight: 600;
  font-size: 1rem;
}

.form-field {
  margin-bottom: 1.5rem;
}

.field-label {
  display: block;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 0.5rem;
  font-size: 0.95rem;
}

.required {
  color: #ef4444;
}

.field-input-wrapper {
  position: relative;
}

.field-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  font-size: 1.1rem;
}

.field-input,
.field-textarea {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 3rem;
  border: 2px solid #e1e8ed;
  border-radius: 10px;
  font-size: 1rem;
  font-family: inherit;
  transition: all 0.2s;
  background: #f8f9fa;
}

.field-input:focus,
.field-textarea:focus {
  outline: none;
  border-color: #667eea;
  background: white;
}

.field-textarea {
  resize: vertical;
}

.confirm-location-btn {
  width: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 0.875rem 1.5rem;
  border-radius: 10px;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.2s;
}

.confirm-location-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.icon-inline {
  font-size: 1.1rem;
}

.success-alert {
  background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
  color: #065f46;
  padding: 0.875rem 1.25rem;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 1rem;
  font-weight: 600;
  border: 2px solid #10b981;
}

.success-icon-inline {
  font-size: 1.2rem;
}

.order-items-list {
  background: #f8f9fa;
  border-radius: 10px;
  padding: 1rem;
  margin-bottom: 1.5rem;
}

.order-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: white;
  border-radius: 8px;
  margin-bottom: 0.5rem;
}

.order-item:last-child {
  margin-bottom: 0;
}

.order-item-name {
  flex: 1;
  font-weight: 600;
  color: #2c3e50;
  font-size: 0.95rem;
}

.order-item-qty {
  color: #7f8c8d;
  margin: 0 1rem;
  font-weight: 600;
  font-size: 0.9rem;
}

.order-item-price {
  font-weight: 700;
  color: #667eea;
  min-width: 80px;
  text-align: right;
  font-size: 1rem;
}

.order-totals {
  background: white;
  border-radius: 10px;
  padding: 1.25rem;
  border: 1px solid #e1e8ed;
}

.order-total-row {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  color: #495057;
  font-size: 0.95rem;
}

.order-total-row.final {
  font-size: 1.1rem;
  font-weight: 700;
  color: #2c3e50;
  margin-top: 0.5rem;
  padding-top: 0.75rem;
}

.free-label {
  color: #10b981;
  font-weight: 700;
}

.order-total-row.discount {
  color: #ef4444;
}

.order-total-divider {
  height: 2px;
  background: #e1e8ed;
  margin: 0.75rem 0;
}

.final-amount {
  font-size: 1.3rem;
  font-weight: 800;
  color: #667eea;
}

.info-box {
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  border-left: 4px solid #3b82f6;
  padding: 1.25rem;
  border-radius: 10px;
  display: flex;
  gap: 1rem;
}

.info-box-icon {
  font-size: 1.5rem;
}

.info-box-text {
  font-size: 0.95rem;
  color: #1e40af;
  line-height: 1.6;
}

.warning-box {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  color: #92400e;
  padding: 1rem;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  font-weight: 600;
  font-size: 0.9rem;
  text-align: center;
  border: 2px solid #f59e0b;
}

.warning-box-icon {
  font-size: 1.3rem;
}

/* ══════════════════════════════════════════ */
/* NAVIGATION BUTTONS */
/* ══════════════════════════════════════════ */
.navigation-buttons {
  display: flex;
  gap: 1rem;
  padding-top: 0;
  border-top: none;
}

.nav-button {
  flex: 1;
  padding: 1rem 2rem;
  border-radius: 10px;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.nav-button.back {
  background: white;
  border: 2px solid #e1e8ed;
  color: #495057;
}

.nav-button.back:hover {
  background: #f8f9fa;
  border-color: #667eea;
}

.nav-button.proceed,
.nav-button.submit {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  color: white;
  box-shadow: 0 2px 8px rgba(43, 108, 176, 0.3);
}

.nav-button.proceed:hover,
.nav-button.submit:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(43, 108, 176, 0.4);
}

.nav-button.submit:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

/* ══════════════════════════════════════════ */
/* TOAST & FLOATING CART */
/* ══════════════════════════════════════════ */
.toast-notification {
  position: fixed;
  top: -100px;
  left: 50%;
  transform: translateX(-50%);
  background: white;
  padding: 1rem 2rem;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.15);
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: top 0.3s;
  z-index: 1000;
}

.toast-notification.visible {
  top: 2rem;
}

.toast-icon-emoji {
  font-size: 2rem;
}

.toast-message {
  display: flex;
  flex-direction: column;
}

.toast-message strong {
  color: #2c3e50;
  font-size: 1rem;
}

.toast-message span {
  color: #7f8c8d;
  font-size: 0.9rem;
}

.floating-cart-button {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: #2B6CB0; /* primary-blue */
  color: #fff;
  border: none;
  box-shadow: 0 8px 24px rgba(43, 108, 176, 0.4);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  z-index: 999;
}

.floating-cart-button:hover {
  transform: scale(1.1);
}

.float-cart-icon {
  font-size: 1.8rem;
}

.float-cart-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  background: #C19A6B; /* warm-brown */
  color: #fff;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
  font-weight: 700;
  border: 3px solid #fff;
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
    padding: 1rem;
  }

  .header-title {
    font-size: 1.2rem;
  }

  .header-right {
    gap: 0.5rem;
  }

  .location-btn span:not(.location-pin) {
    display: none;
  }

  .stage-tabs-container {
    gap: 0.75rem;
  }

  .stage-tab-btn {
    padding: 0.5rem 1rem;
    font-size: 0.85rem;
  }

  .stage-label {
    display: none;
  }

  .main-wrapper {
    padding: 1rem;
  }

  .menu-header {
    flex-direction: column;
    gap: 1rem;
  }

  .search-input {
    width: 100%;
  }

  .products-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  /* Stage 3 Checkout Responsive */
  .checkout-container {
    margin: 0 0.5rem;
  }

  .checkout-header {
    padding: 1.5rem 1rem;
  }

  .checkout-title {
    font-size: 1.4rem;
  }

  .checkout-icon {
    font-size: 1.6rem;
  }

  .checkout-body {
    padding: 1.25rem;
  }

  .checkout-columns {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  .checkout-section {
    padding: 1.25rem;
  }

  .section-heading {
    font-size: 1.05rem;
  }

  .location-types {
    grid-template-columns: 1fr;
  }

  .location-type-option {
    padding: 1.5rem;
  }

  .location-emoji {
    font-size: 2.5rem;
  }

  .navigation-buttons {
    flex-direction: column;
    gap: 0.75rem;
  }

  .nav-button {
    padding: 0.875rem 1.5rem;
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

  .market-tag {
    font-size: 0.65rem;
    padding: 0.15rem 0.6rem;
  }

  .cart-header-btn span:not(.cart-icon-header):not(.cart-badge-header) {
    display: none;
  }

  .blue-gradient-section {
    padding: 1rem;
  }

  .stage-tab-btn {
    padding: 0.5rem;
  }

  .stage-icon {
    width: 28px;
    height: 28px;
    font-size: 0.9rem;
  }

  .products-grid {
    grid-template-columns: 1fr;
  }

  /* Stage 3 Mobile */
  .checkout-header {
    padding: 1.25rem 1rem;
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

  .section-heading {
    font-size: 1rem;
  }

  .section-icon {
    font-size: 1.2rem;
  }

  .location-type-option {
    padding: 1.25rem 1rem;
  }

  .location-emoji {
    font-size: 2rem;
  }

  .location-name {
    font-size: 0.9rem;
  }

  .field-input,
  .field-textarea {
    padding: 0.75rem 0.875rem 0.75rem 2.75rem;
    font-size: 0.9rem;
  }

  .field-icon {
    font-size: 1rem;
    left: 0.875rem;
  }

  .confirm-location-btn {
    font-size: 0.95rem;
    padding: 0.75rem 1.25rem;
  }

  .order-item {
    padding: 0.625rem;
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
    font-size: 1.2rem;
  }

  .info-box,
  .warning-box {
    padding: 0.875rem;
    font-size: 0.85rem;
  }

  .nav-button {
    font-size: 0.95rem;
    padding: 0.75rem 1rem;
  }
}
</style>

