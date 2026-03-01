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

      <!-- Stage Tabs -->
      <div class="stage-tabs-container">
        <button class="stage-tab-btn" :class="{ active: currentStage === 1, completed: currentStage > 1 }" @click="goToStage(1)">
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
              />
            </div>
          </div>

          <!-- Products Area - Grouped by Menu Type in 2 Columns -->
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
            <div v-else-if="filteredProducts.length === 0" class="no-results">
              <span class="no-results-emoji">🔍</span>
              <h3>No items found</h3>
              <p>Try adjusting your search</p>
            </div>
            <div v-else>
              <!-- Group products by menu type (desc) and sort by item count -->
              <div v-for="(group, groupIndex) in sortedGroups" :key="groupIndex" class="menu-type-group">
                <h3 class="menu-type-heading">
                  <span class="menu-type-icon">🍽️</span>
                  {{ group.type }}
                </h3>
                <div class="products-two-column">
                  <div
                    v-for="(product, idx) in group.items"
                    :key="groupIndex + '-' + idx"
                    class="product-card-two-col"
                  >
                    <div class="product-info-row">
                      <div class="product-name-type">
                        <h4 class="product-title">{{ product.name }}</h4>
                        <p class="product-type">{{ group.type }}</p>
                      </div>
                      <div class="product-price">₱{{ product.price }}</div>
                    </div>
                    <div class="product-action-row">
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
                  <span class="row-value price-bright-blue">₱{{ cartTotal }}</span>
                </div>
                <div class="summary-row">
                  <span>Delivery Fee</span>
                  <span class="row-value free">FREE</span>
                </div>
                <div v-if="cartTotal > 500" class="summary-row discount">
                  <span>Island Discount</span>
                  <span class="row-value discount price-bright-blue">-₱50</span>
                </div>
                <div class="summary-divider"></div>
                <div class="summary-row total">
                  <span>Tentative Total</span>
                  <span class="row-total price-bright-blue">₱{{ calculateTotalWithDiscount }}</span>
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
                      <span class="price-bright-blue">₱{{ cartTotal }}</span>
                    </div>
                    <div class="order-total-row">
                      <span>Delivery</span>
                      <span class="free-label">FREE</span>
                    </div>
                    <div v-if="cartTotal > 500" class="order-total-row discount">
                      <span>Discount</span>
                      <span class="price-bright-blue">-₱50</span>
                    </div>
                    <div class="order-total-divider"></div>
                    <div class="order-total-row final">
                      <span>Total Amount</span>
                      <span class="final-amount price-bright-blue">₱{{ calculateTotalWithDiscount }}</span>
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

    <!-- Floating Cart -->
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

// Stage
const currentStage = ref(1)

// Location Data
const locationTypes = ['Room', 'Cottage']
const locationEmojis = {
  'Room': '🛏️',
  'Cottage': '🏡'
}

// Fallback Products
const fallbackProducts = {
  restaurant: [
    { name: 'Beef Mami Noodle Soup', price: 185, emoji: '🍜', desc: 'Noodles' },
    { name: 'Creamy Pasta Carbonara', price: 220, emoji: '🍝', desc: 'Pasta' },
    { name: 'Crispy Calamari', price: 240, emoji: '🦑', desc: 'Appetizer' },
    { name: 'Seafood Sinuglaw Bowl', price: 295, emoji: '🍚', desc: 'Seafood' },
    { name: 'Mango Shake (Large)', price: 95, emoji: '🥭', desc: 'Shakes' },
    { name: 'Iced Café Latte', price: 110, emoji: '☕', desc: 'Coffee' },
    { name: 'Americano', price: 120, emoji: '☕', desc: 'Coffee' },
    { name: 'Ampalaya Con Carne', price: 300, emoji: '🥬', desc: 'Vegetables' },
    { name: 'Banana Smoothie', price: 180, emoji: '🍌', desc: 'Smoothies' },
    { name: 'Beef Steak', price: 100, emoji: '🥩', desc: 'Mains' },
    { name: 'Blueberry Cheesecake', price: 185, emoji: '🍰', desc: 'Pastries' },
    { name: 'Butter Almond Frappe', price: 180, emoji: '🥤', desc: 'Frappe' },
    { name: 'Buttered Veggies', price: 250, emoji: '🥦', desc: 'Vegetables' },
    { name: 'Cafe Latte', price: 150, emoji: '☕', desc: 'Coffee' },
    { name: 'Chicken Buffalo Wings', price: 350, emoji: '🍗', desc: 'Chicken' },
    { name: 'Cappuccino', price: 150, emoji: '☕', desc: 'Coffee' },
    { name: 'Espresso', price: 100, emoji: '☕', desc: 'Coffee' }
  ],
  store: [
    { name: 'Sunscreen SPF 50+', price: 180, emoji: '🧴', desc: 'Sunscreen' },
    { name: 'Bottled Water (1L) × 6', price: 90, emoji: '💧', desc: 'Beverages' },
    { name: 'Resort Souvenir T-Shirt', price: 450, emoji: '👕', desc: 'Apparel' },
    { name: 'Resort Flip Flops', price: 350, emoji: '🩴', desc: 'Footwear' },
    { name: 'Snack Bundle Pack', price: 120, emoji: '🍫', desc: 'Snacks' },
    { name: 'Toiletry Kit', price: 150, emoji: '🪥', desc: 'Toiletries' }
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

const calculateTotalWithDiscount = computed(() => {
  const total = cartTotal.value
  return total > 500 ? total - 50 : total
})

const filteredProducts = computed(() => {
  const currentProducts = products.value[activeTab.value] || []
  if (!searchQuery.value) return currentProducts

  return currentProducts.filter(p =>
    p.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    p.desc.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

// Group products by menu type (desc field)
const groupedProducts = computed(() => {
  const groups = {}
  
  filteredProducts.value.forEach(product => {
    const type = product.desc || 'Other'
    if (!groups[type]) {
      groups[type] = []
    }
    groups[type].push(product)
  })
  
  // Convert to array
  return Object.keys(groups).map(type => ({
    type,
    items: groups[type]
  }))
})

// Sort groups by item count (most items first)
const sortedGroups = computed(() => {
  return [...groupedProducts.value].sort((a, b) => b.items.length - a.items.length)
})

// Methods
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
    desc: item.description || 'Other'
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
/* =========================================================
   TROPICAL RESORT COLOR PALETTE - UPDATED
   - Ocean Blue (primary):    #1E88B6 (Cerulean/Ocean Blue)
   - Ocean Blue (dark):       #166B8F
   - Ocean Blue (pale):       #E3F2F9
   - Bright Blue (hover):     #4AA3D0 (lighter ocean blue)
   - Dark Blue (text on yellow): #0D4B6E (darker blue for readability)
   
   - Sunflower Gold (accent): #F2C200 (Warm Golden Yellow)
   - Sunflower Gold (light):  #FFD633
   
   TEXT COLORS:
   - Primary Text: #1A2E40 (Dark blue-gray)
   - Secondary Text: #166B8F
   - Bright Blue Price: #4AA3D0 (for cart/checkout prices)
   - Dark Blue on Yellow: #0D4B6E (for text on yellow backgrounds)
   ========================================================= */

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.eshop-container {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: #E3F2F9;
  min-height: 100vh;
  color: #1A2E40;
}

/* ══════════════════════════════════════════ */
/* HEADER */
/* ══════════════════════════════════════════ */
.eshop-header {
  background: linear-gradient(135deg, #1E88B6 0%, #166B8F 100%);
  padding: 0.85rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.25rem;
  border-bottom: 3px solid #F2C200;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
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
  color: white;
  margin: 0;
  white-space: nowrap;
}

.header-right {
  display: flex;
  gap: 0.75rem;
  flex: 0 0 auto;
}

.cart-header-btn {
  background: rgba(255, 255, 255, 0.15);
  border: 2px solid #1E88B6;
  color: white;
  padding: 0.55rem 1rem;
  border-radius: 30px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s ease;
}

.cart-header-btn:hover {
  background: #F2C200;
  border-color: #F2C200;
  color: #0D4B6E; /* Darker blue on yellow hover */
  transform: translateY(-1px);
}

.cart-icon-header {
  font-size: 1.1rem;
}

.cart-badge-header {
  background: #F2C200;
  color: #1E88B6;
  border-radius: 999px;
  min-width: 22px;
  height: 22px;
  padding: 0 8px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 900;
  border: 2px solid white;
}

/* ══════════════════════════════════════════ */
/* STAGE TABS */
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
  background: rgba(255, 255, 255, 0.15);
  border: 2px solid transparent;
  padding: 0.55rem 0.8rem;
  border-radius: 30px;
  display: flex;
  align-items: center;
  gap: 0.55rem;
  cursor: pointer;
  transition: all 0.2s ease;
  color: white;
  white-space: nowrap;
  position: relative;
  z-index: 1;
}

.stage-tab-btn:hover {
  background: rgba(255, 255, 255, 0.25);
  border-color: #1E88B6;
  color: #0D4B6E; /* Darker blue on hover */
  transform: translateY(-1px);
}

.stage-tab-btn.active {
  background: #F2C200;
  color: #0D4B6E; /* Darker blue on yellow active */
  border-color: #F2C200;
}

.stage-icon {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 900;
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  transition: all 0.2s ease;
}

.stage-tab-btn.active .stage-icon,
.stage-tab-btn:hover .stage-icon {
  background: #0D4B6E; /* Darker blue icon background on yellow */
  color: #F2C200;
  border-color: rgba(255, 255, 255, 0.3);
}

.stage-tab-btn.completed .stage-icon {
  background: #F2C200;
  color: #0D4B6E; /* Darker blue on completed */
  border-color: rgba(255, 255, 255, 0.3);
}

.stage-label {
  font-weight: 600;
  font-size: 0.92rem;
  transition: color 0.2s ease;
}

.stage-tab-btn:hover .stage-label,
.stage-tab-btn.active .stage-label {
  color: #0D4B6E; /* Darker blue text on yellow */
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
/* STAGE 1: MENU - 2 COLUMN GROUPED LAYOUT */
/* ══════════════════════════════════════════ */
.menu-container {
  background: #ffffff;
  border-radius: 20px;
  border: 1px solid rgba(30, 136, 182, 0.2);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.menu-header {
  padding: 1.1rem 1.5rem;
  border-bottom: 2px solid #F2C200;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: nowrap;
  gap: 1.25rem;
  background: white;
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
  font-weight: 800;
  color: #1E88B6;
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
  color: #1E88B6;
}

.search-input {
  padding: 0.6rem 0.9rem 0.6rem 2.8rem;
  border: 2px solid rgba(30, 136, 182, 0.2);
  border-radius: 30px;
  font-size: 0.95rem;
  width: 100%;
  transition: all 0.2s ease;
  background: #E3F2F9;
  color: #1A2E40;
}

.search-input:focus {
  outline: none;
  border-color: #1E88B6;
  background: white;
}

/* Products Section */
.products-section {
  padding: 1.5rem;
}

.loading-container,
.error-container,
.no-results {
  text-align: center;
  padding: 3rem 1.5rem;
  color: #1A2E40;
}

.no-results-emoji {
  font-size: 3rem;
  display: block;
  margin-bottom: 1rem;
}

.no-results h3 {
  font-size: 1.4rem;
  color: #1E88B6;
  margin-bottom: 0.4rem;
  font-weight: 700;
}

.no-results p {
  color: #166B8F;
}

.spinner {
  width: 44px;
  height: 44px;
  border: 4px solid rgba(30, 136, 182, 0.1);
  border-top: 4px solid #F2C200;
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
  background: #1E88B6;
  color: white;
  border: 2px solid #1E88B6;
  padding: 0.65rem 1.6rem;
  border-radius: 30px;
  font-weight: 600;
  cursor: pointer;
  margin-top: 1rem;
  transition: all 0.2s ease;
}

.retry-button:hover {
  background: #F2C200;
  border-color: #F2C200;
  color: #0D4B6E; /* Darker blue on yellow hover */
  transform: translateY(-1px);
}

/* Menu Type Group */
.menu-type-group {
  margin-bottom: 2rem;
}

.menu-type-group:last-child {
  margin-bottom: 0;
}

.menu-type-heading {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.2rem;
  font-weight: 700;
  color: #1E88B6;
  margin: 0 0 1rem 0;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid rgba(242, 194, 0, 0.3);
}

.menu-type-icon {
  font-size: 1.3rem;
}

/* 2-Column Grid */
.products-two-column {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
}

/* Product Card - 2 Column Style with Light Blue Background */
.product-card-two-col {
  background: #E9F2F9;
  border: 1px solid rgba(30, 136, 182, 0.15);
  border-radius: 12px;
  padding: 0.9rem;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
}

.product-card-two-col:hover {
  border-color: #1E88B6;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
}

.product-info-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.75rem;
  min-height: 60px;
}

.product-name-type {
  flex: 1;
}

.product-title {
  font-size: 0.95rem;
  font-weight: 700;
  color: #1A2E40;
  margin: 0 0 0.25rem 0;
  line-height: 1.3;
}

.product-type {
  font-size: 0.8rem;
  color: #166B8F;
  margin: 0;
  font-weight: 500;
}

.product-price {
  font-size: 1rem;
  font-weight: 700;
  color: #1E88B6;
  white-space: nowrap;
  margin-left: 0.5rem;
}

.product-action-row {
  display: flex;
  justify-content: flex-end;
  border-top: 1px solid rgba(242, 194, 0, 0.2);
  padding-top: 0.65rem;
}

.product-add-btn {
  background: #1E88B6;
  color: white;
  border: 2px solid #1E88B6;
  padding: 0.4rem 1.2rem;
  border-radius: 30px;
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  min-width: 70px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.product-add-btn:hover {
  background: #F2C200;
  border-color: #F2C200;
  color: #0D4B6E; /* Darker blue on yellow hover */
  transform: translateY(-1px);
}

.product-add-btn.added {
  background: #F2C200;
  color: #0D4B6E; /* Darker blue on added state */
  border-color: #1E88B6;
}

/* ══════════════════════════════════════════ */
/* STAGE 2: CART REVIEW - BRIGHT BLUE PRICES */
/* ══════════════════════════════════════════ */
.cart-container {
  background: white;
  border-radius: 20px;
  border: 1px solid rgba(30, 136, 182, 0.2);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  max-width: 900px;
  margin: 0 auto;
}

.cart-header {
  padding: 1.2rem 1.5rem;
  border-bottom: 2px solid #F2C200;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: white;
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
  font-weight: 800;
  color: #1E88B6;
  margin: 0;
}

.item-count-badge {
  background: rgba(242, 194, 0, 0.1);
  color: #F2C200;
  padding: 0.35rem 0.9rem;
  border-radius: 30px;
  font-weight: 600;
  border: 2px solid rgba(242, 194, 0, 0.3);
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
  color: #1E88B6;
  margin-bottom: 0.4rem;
  font-weight: 700;
}

.empty-cart p {
  color: #166B8F;
  margin-bottom: 1.5rem;
}

.back-to-menu-btn {
  background: #1E88B6;
  color: white;
  border: 2px solid #1E88B6;
  padding: 0.7rem 1.6rem;
  border-radius: 30px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.back-to-menu-btn:hover {
  background: #F2C200;
  border-color: #F2C200;
  color: #0D4B6E; /* Darker blue on yellow hover */
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
  background: #E3F2F9;
  border: 2px solid rgba(242, 194, 0, 0.2);
  border-radius: 12px;
  margin-bottom: 0.75rem;
  transition: all 0.2s ease;
}

.cart-item:hover {
  border-color: #1E88B6;
  background: white;
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
  background: white;
  border-radius: 30px;
  border: 2px solid rgba(242, 194, 0, 0.3);
}

.cart-item-details {
  flex: 1;
}

.cart-item-name {
  font-size: 1.02rem;
  font-weight: 700;
  color: #1E88B6;
  margin: 0 0 0.2rem;
}

.cart-item-price-per {
  font-size: 0.9rem;
  color: #166B8F;
  margin: 0;
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
  background: white;
  padding: 0.45rem 0.7rem;
  border-radius: 30px;
  border: 2px solid rgba(242, 194, 0, 0.2);
}

.qty-btn {
  background: none;
  border: none;
  color: #F2C200;
  font-size: 1.15rem;
  font-weight: 700;
  cursor: pointer;
  padding: 0.2rem 0.45rem;
  transition: all 0.2s ease;
}

.qty-btn:hover {
  color: #0D4B6E; /* Darker blue on hover */
}

.qty-value {
  font-weight: 600;
  font-size: 0.95rem;
  color: #1E88B6;
  min-width: 56px;
  text-align: center;
}

.cart-item-total {
  font-weight: 700;
  font-size: 1.05rem;
  color: #4AA3D0;
  min-width: 96px;
  text-align: right;
}

.remove-btn {
  background: #F2C200;
  color: #1E88B6;
  border: none;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s ease;
}

.remove-btn:hover {
  background: #1E88B6;
  color: #F2C200;
}

.cart-summary {
  background: white;
  padding: 1.2rem;
  border-radius: 12px;
  border: 2px solid rgba(242, 194, 0, 0.2);
  margin-bottom: 1.25rem;
}

.summary-heading {
  font-size: 1.05rem;
  font-weight: 700;
  color: #1E88B6;
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
  color: #166B8F;
}

.row-value {
  font-weight: 600;
  color: #1E88B6;
}

.row-value.price-bright-blue {
  color: #4AA3D0 !important;
  font-weight: 700;
}

.row-value.free {
  color: #1E88B6 !important;
  font-weight: 600;
}

.row-value.discount {
  color: #4AA3D0;
  font-weight: 600;
}

.summary-row.discount {
  color: #4AA3D0;
}

.summary-divider {
  height: 2px;
  background: #F2C200;
  opacity: 0.3;
  margin: 0.25rem 0;
}

.summary-row.total {
  font-size: 1.08rem;
  font-weight: 700;
  color: #1E88B6;
  margin-top: 0.25rem;
}

.row-total {
  font-size: 1.55rem;
  font-weight: 700;
  color: #4AA3D0;
}

.price-bright-blue {
  color: #4AA3D0 !important;
  font-weight: 700;
}

/* ══════════════════════════════════════════ */
/* STAGE 3: CHECKOUT - BRIGHT BLUE PRICES */
/* ══════════════════════════════════════════ */
.checkout-container {
  background: white;
  border-radius: 20px;
  border: 1px solid rgba(30, 136, 182, 0.2);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  max-width: 1200px;
  margin: 0 auto;
}

.checkout-header {
  background: linear-gradient(135deg, #1E88B6 0%, #166B8F 100%);
  padding: 1.5rem;
  text-align: center;
  border-bottom: 3px solid #F2C200;
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
  font-weight: 800;
  color: white;
  margin: 0;
}

.checkout-body {
  padding: 1.5rem;
  background: white;
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
  background: white;
  padding: 1.25rem;
  border-radius: 12px;
  border: 2px solid rgba(242, 194, 0, 0.2);
}

.section-heading {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.05rem;
  font-weight: 700;
  color: #1E88B6;
  margin: 0 0 1.1rem;
}

.section-icon {
  font-size: 1.25rem;
  color: #F2C200;
}

.location-types {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.85rem;
  margin-bottom: 1.1rem;
}

.location-type-option {
  background: white;
  border: 2px solid rgba(30, 136, 182, 0.2);
  padding: 1.15rem 0.9rem;
  border-radius: 12px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #1A2E40;
}

.location-type-option:hover {
  border-color: #1E88B6;
  background: rgba(30, 136, 182, 0.02);
  color: #0D4B6E; /* Darker blue on hover */
}

.location-type-option.selected {
  background: #1E88B6;
  border-color: #F2C200;
  color: white;
}

.location-type-option.selected:hover {
  color: white; /* Keep white on selected when hovered */
}

.location-emoji {
  font-size: 2.25rem;
  display: block;
  margin-bottom: 0.55rem;
}

.location-name {
  font-weight: 600;
  font-size: 0.98rem;
}

.form-field {
  margin-bottom: 1rem;
}

.field-label {
  display: block;
  font-weight: 600;
  color: #1E88B6;
  margin-bottom: 0.45rem;
  font-size: 0.95rem;
}

.required {
  color: #F2C200;
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
  border: 2px solid rgba(30, 136, 182, 0.2);
  border-radius: 30px;
  font-size: 0.98rem;
  font-family: inherit;
  transition: all 0.2s ease;
  background: #E3F2F9;
  color: #1A2E40;
}

.field-input:focus,
.field-textarea:focus {
  outline: none;
  border-color: #1E88B6;
  background: white;
}

.field-textarea {
  resize: vertical;
  border-radius: 16px;
}

.confirm-location-btn {
  width: 100%;
  background: #1E88B6;
  color: white;
  border: 2px solid #1E88B6;
  padding: 0.8rem 1.2rem;
  border-radius: 30px;
  font-weight: 600;
  font-size: 0.98rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.2s ease;
}

.confirm-location-btn:hover {
  transform: translateY(-1px);
  background: #F2C200;
  border-color: #F2C200;
  color: #0D4B6E; /* Darker blue on yellow hover */
}

.icon-inline {
  font-size: 1.05rem;
}

.success-alert {
  background: rgba(242, 194, 0, 0.1);
  color: #F2C200;
  padding: 0.75rem 1rem;
  border-radius: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 0.85rem;
  font-weight: 600;
  border: 2px solid rgba(242, 194, 0, 0.3);
}

.success-icon-inline {
  font-size: 1.15rem;
}

.order-items-list {
  background: #E3F2F9;
  border-radius: 12px;
  padding: 0.9rem;
  margin-bottom: 1rem;
  border: 2px solid rgba(242, 194, 0, 0.2);
}

.order-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.65rem 0.75rem;
  background: white;
  border-radius: 30px;
  margin-bottom: 0.5rem;
  border: 2px solid rgba(242, 194, 0, 0.2);
}

.order-item:last-child {
  margin-bottom: 0;
}

.order-item-name {
  flex: 1;
  font-weight: 600;
  color: #1E88B6;
  font-size: 0.93rem;
}

.order-item-qty {
  color: #166B8F;
  margin: 0 0.85rem;
  font-size: 0.88rem;
}

.order-item-price {
  font-weight: 600;
  color: #4AA3D0;
  min-width: 80px;
  text-align: right;
  font-size: 0.98rem;
}

.order-totals {
  background: white;
  border-radius: 12px;
  padding: 1rem;
  border: 2px solid rgba(242, 194, 0, 0.2);
}

.order-total-row {
  display: flex;
  justify-content: space-between;
  padding: 0.45rem 0;
  color: #166B8F;
  font-size: 0.93rem;
}

.order-total-row.final {
  font-size: 1.05rem;
  font-weight: 700;
  color: #1E88B6;
  margin-top: 0.35rem;
  padding-top: 0.65rem;
}

.free-label {
  color: #1E88B6 !important;
  font-weight: 600;
}

.order-total-row.discount {
  color: #4AA3D0;
}

.order-total-divider {
  height: 2px;
  background: #F2C200;
  opacity: 0.3;
  margin: 0.65rem 0;
}

.final-amount {
  font-size: 1.2rem;
  font-weight: 700;
  color: #4AA3D0;
}

.info-box {
  background: #E3F2F9;
  border-left: 4px solid #F2C200;
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
  color: #166B8F;
  line-height: 1.55;
}

.warning-box {
  background: rgba(242, 194, 0, 0.1);
  color: #1E88B6;
  padding: 0.9rem;
  border-radius: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.7rem;
  font-weight: 600;
  font-size: 0.9rem;
  text-align: center;
  border: 2px solid rgba(242, 194, 0, 0.3);
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
  border-radius: 30px;
  font-weight: 600;
  font-size: 0.98rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.nav-button.back {
  background: white;
  border: 2px solid rgba(30, 136, 182, 0.2);
  color: #1E88B6;
}

.nav-button.back:hover {
  background: #E3F2F9;
  border-color: #1E88B6;
  color: #0D4B6E; /* Darker blue on hover */
  transform: translateY(-1px);
}

.nav-button.proceed,
.nav-button.submit {
  background: #1E88B6;
  border: 2px solid #1E88B6;
  color: white;
}

.nav-button.proceed:hover,
.nav-button.submit:hover:not(:disabled) {
  transform: translateY(-1px);
  background: #F2C200;
  border-color: #F2C200;
  color: #0D4B6E; /* Darker blue on yellow hover */
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
  padding: 0.9rem 1.4rem;
  border-radius: 30px;
  border: 3px solid #F2C200;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
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
  color: #1E88B6;
  font-size: 0.98rem;
  font-weight: 700;
}

.toast-message span {
  color: #166B8F;
  font-size: 0.88rem;
}

.floating-cart-button {
  position: fixed;
  bottom: 1.5rem;
  right: 1.5rem;
  width: 62px;
  height: 62px;
  border-radius: 50%;
  background: #1E88B6;
  color: white;
  border: 3px solid #F2C200;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  z-index: 999;
}

.floating-cart-button:hover {
  transform: scale(1.05);
  background: #F2C200;
  color: #0D4B6E; /* Darker blue on yellow hover */
}

.float-cart-icon {
  font-size: 1.75rem;
}

.float-cart-badge {
  position: absolute;
  top: -5px;
  right: -5px;
  background: #F2C200;
  color: #1E88B6;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
  font-weight: 700;
  border: 3px solid white;
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
    padding: 1rem;
  }

  .products-two-column {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }

  .menu-type-heading {
    font-size: 1.1rem;
  }

  .checkout-container {
    margin: 0 0.25rem;
  }

  .checkout-header {
    padding: 1.25rem 1rem;
  }

  .checkout-title {
    font-size: 1.35rem;
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

  .checkout-header {
    padding: 1.1rem 1rem;
  }

  .checkout-title {
    font-size: 1.2rem;
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

  .product-info-row {
    min-height: 50px;
  }

  .product-title {
    font-size: 0.9rem;
  }

  .product-type {
    font-size: 0.75rem;
  }

  .product-price {
    font-size: 0.95rem;
  }

  .product-add-btn {
    padding: 0.35rem 1rem;
    height: 32px;
    font-size: 0.8rem;
  }
}
</style>