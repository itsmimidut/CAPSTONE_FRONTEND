<template>
  <div class="eshop-container">
    <!-- HEADER -->
    <header class="eshop-header">
      <div class="header-left">
        <span class="header-icon">🏝️</span>
        <h1 class="header-title">Eduardo's <span class="market-tag">MARKET</span></h1>
      </div>
      <div class="header-right">
        <button class="location-btn" @click="goToStage(3)">
          <span class="location-pin">📍</span>
          <span>Set delivery location</span>
          <span class="dropdown-icon">▼</span>
        </button>
        <button class="cart-header-btn" @click="currentStage === 1 && cart.length > 0 ? proceedToCart() : null">
          <span class="cart-icon-header">🛒</span>
          <span>Cart</span>
          <span v-if="totalItems > 0" class="cart-badge-header">{{ totalItems }}</span>
        </button>
      </div>
    </header>

    <!-- BLUE GRADIENT SECTION WITH STAGE INDICATOR -->
    <div class="blue-gradient-section">
      <div class="stage-indicator-container">
        <div class="stage-tab" :class="{ active: currentStage === 1 }" @click="goToStage(1)">
          <span class="stage-tab-icon">{{ currentStage > 1 ? '✓' : '1' }}</span>
          <span class="stage-tab-text">Browse Menu</span>
        </div>
        <div class="stage-tab" :class="{ active: currentStage === 2 }" @click="cart.length > 0 ? goToStage(2) : null">
          <span class="stage-tab-icon">{{ currentStage > 2 ? '✓' : '2' }}</span>
          <span class="stage-tab-text">Review Cart</span>
        </div>
        <div class="stage-tab" :class="{ active: currentStage === 3 }" @click="cart.length > 0 ? goToStage(3) : null">
          <span class="stage-tab-icon">3</span>
          <span class="stage-tab-text">Checkout</span>
        </div>
      </div>
    </div>

    <!-- MAIN CONTENT -->
    <div class="page">
      <!-- ====================================== -->
      <!-- STAGE 1: BROWSE PRODUCTS WITH PAGINATION -->
      <!-- ====================================== -->
      <div v-if="currentStage === 1" class="stage-container">
        <div class="section-card products-section">
          <div class="section-header">
            <div class="section-title-wrapper">
              <span class="section-icon">🍽️</span>
              <h2 class="section-title">Our Menu</h2>
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

          <div class="product-tabs">
            <div
              v-for="tab in ['restaurant', 'store']"
              :key="tab"
              class="tab"
              :class="{ active: activeTab === tab }"
              @click="switchTab(tab)"
            >
              <span class="tab-emoji">{{ tab === 'restaurant' ? '🍔' : '🛍️' }}</span>
              <span class="tab-text">{{ tabLabels[tab] }}</span>
              <span class="tab-count">{{ getTabCount(tab) }}</span>
            </div>
          </div>

          <div class="products-container">
            <div v-if="isLoading" class="loading-state">
              <div class="loading-spinner"></div>
              <p>Loading delicious items...</p>
            </div>
            <div v-else-if="loadError" class="error-state">
              <span class="error-icon">😢</span>
              <p>{{ loadError }}</p>
              <button class="retry-btn" @click="fetchProducts">Try Again</button>
            </div>
            <div v-else>
              <div class="products-grid">
                <div
                  v-for="(product, idx) in paginatedProducts"
                  :key="idx"
                  class="product-card"
                  :class="{ 'featured': product.featured }"
                >
                  <div class="product-image">
                    <span class="product-emoji">{{ product.emoji }}</span>
                    <span v-if="product.popular" class="popular-badge">🔥 Popular</span>
                  </div>
                  <div class="product-info">
                    <h3 class="product-name">{{ product.name }}</h3>
                    <p class="product-desc">{{ product.desc }}</p>
                    <div class="product-footer">
                      <span class="product-price">₱{{ product.price }}</span>
                      <button
                        class="add-to-cart-btn"
                        :class="{ 'added': isProductAdded(product.name) }"
                        @click="addToCart(product)"
                      >
                        <span class="btn-icon">{{ isProductAdded(product.name) ? '✓' : '+' }}</span>
                        <span>{{ isProductAdded(product.name) ? 'Added' : 'Add' }}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Pagination Controls -->
              <div v-if="filteredProducts.length > itemsPerPage" class="pagination-controls">
                <button 
                  class="pagination-btn" 
                  :disabled="currentPage === 1"
                  @click="previousPage"
                >
                  ← Previous
                </button>
                
                <div class="pagination-pages">
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
                  Next →
                </button>
              </div>

              <!-- Showing items info -->
              <div v-if="filteredProducts.length > 0" class="pagination-info">
                Showing {{ ((currentPage - 1) * itemsPerPage) + 1 }}-{{ Math.min(currentPage * itemsPerPage, filteredProducts.length) }} of {{ filteredProducts.length }} items
              </div>
            </div>
          </div>

          <!-- Cart Preview and Proceed Button -->
          <div v-if="cart.length > 0" class="cart-preview-sticky">
            <div class="cart-preview-info">
              <span class="cart-preview-icon">🛒</span>
              <span class="cart-preview-count">{{ totalItems }} item{{ totalItems !== 1 ? 's' : '' }}</span>
              <span class="cart-preview-total">₱{{ cartTotal }}</span>
            </div>
            <button class="proceed-btn" @click="proceedToCart">
              <span>Review Cart</span>
              <span class="proceed-arrow">→</span>
            </button>
          </div>
        </div>
      </div>

      <!-- ====================================== -->
      <!-- STAGE 2: REVIEW CART -->
      <!-- ====================================== -->
      <div v-if="currentStage === 2" class="stage-container">
        <div class="section-card cart-review-section">
          <div class="section-header">
            <div class="section-title-wrapper">
              <span class="section-icon">🛒</span>
              <h2 class="section-title">Review Your Order</h2>
            </div>
            <span class="cart-item-count">{{ totalItems }} item{{ totalItems !== 1 ? 's' : '' }}</span>
          </div>

          <!-- Empty state -->
          <div v-if="cart.length === 0" class="cart-empty">
            <div class="empty-cart-illustration">
              <span class="empty-cart-icon">🛒</span>
              <span class="empty-cart-emoji">😋</span>
            </div>
            <h3>Your cart is empty</h3>
            <p>Looks like you haven't added anything yet</p>
            <button class="browse-menu-btn" @click="goToStage(1)">
              ← Back to Menu
            </button>
          </div>

          <!-- Cart items -->
          <div v-else class="cart-content">
            <div class="cart-items-list">
              <div v-for="(item, idx) in cart" :key="idx" class="cart-review-item">
                <div class="item-left">
                  <span class="item-emoji">{{ item.emoji }}</span>
                  <div class="item-info">
                    <h4 class="item-name">{{ item.name }}</h4>
                    <p class="item-price-unit">₱{{ item.price }} each</p>
                  </div>
                </div>
                <div class="item-right">
                  <div class="quantity-badge">
                    <button class="qty-btn-small minus" @click="changeQty(idx, -1)">−</button>
                    <span class="qty-display">× {{ item.qty }}</span>
                    <button class="qty-btn-small plus" @click="changeQty(idx, 1)">+</button>
                  </div>
                  <div class="item-subtotal">₱{{ item.price * item.qty }}</div>
                  <button class="remove-btn-small" @click="removeItem(idx)" title="Remove">✕</button>
                </div>
              </div>
            </div>

            <!-- Order Summary -->
            <div class="order-summary-box">
              <h3 class="summary-title">Order Summary</h3>
              <div class="summary-details">
                <div class="summary-line">
                  <span>Subtotal ({{ totalItems }} items)</span>
                  <span class="summary-amount">₱{{ cartTotal }}</span>
                </div>
                <div class="summary-line">
                  <span>Delivery Fee</span>
                  <span class="summary-amount free">FREE</span>
                </div>
                <div v-if="cartTotal > 500" class="summary-line discount-line">
                  <span>Island Discount</span>
                  <span class="summary-amount discount">-₱50</span>
                </div>
                <div class="summary-divider"></div>
                <div class="summary-line total-line">
                  <span>Tentative Total</span>
                  <span class="summary-total-amount">₱{{ calculateTotalWithDiscount }}</span>
                </div>
              </div>
            </div>

            <!-- Navigation Buttons -->
            <div class="stage-navigation">
              <button class="nav-btn nav-back" @click="previousStage">
                <span>← Back to Menu</span>
              </button>
              <button class="nav-btn nav-next" @click="proceedToCheckout">
                <span>Proceed to Checkout</span>
                <span class="proceed-arrow">→</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- ====================================== -->
      <!-- STAGE 3: CHECKOUT & LOCATION -->
      <!-- ====================================== -->
      <div v-if="currentStage === 3" class="stage-container">
        <div class="section-card checkout-section">
          <div class="section-header">
            <div class="section-title-wrapper">
              <span class="section-icon">📍</span>
              <h2 class="section-title">Delivery & Checkout</h2>
            </div>
          </div>

          <div class="checkout-content">
            <!-- Location Selection -->
            <div class="checkout-block">
              <h3 class="block-title">
                <span class="block-icon">📍</span>
                Delivery Location
              </h3>
              
              <div class="location-type-selector">
                <div
                  v-for="type in locationTypes"
                  :key="type"
                  class="location-type"
                  :class="{ active: currentLocType === type }"
                  @click="selectLocType(type)"
                >
                  <span class="type-emoji">{{ locationEmojis[type] }}</span>
                  <span class="type-name">{{ type }}</span>
                </div>
              </div>

              <div v-if="currentLocType !== 'Day Guest'" class="input-group">
                <label class="input-label">
                  {{ currentLocType }} Number
                  <span class="required-star">*</span>
                </label>
                <div class="input-wrapper">
                  <span class="input-icon">🏷️</span>
                  <input
                    v-model="locationNumber"
                    class="form-input"
                    type="text"
                    :placeholder="`Enter your ${currentLocType.toLowerCase()} number`"
                  />
                </div>
              </div>

              <div class="input-group">
                <label class="input-label">Special Instructions (optional)</label>
                <div class="input-wrapper">
                  <span class="input-icon">📝</span>
                  <textarea
                    v-model="locationNotes"
                    class="form-textarea"
                    placeholder="e.g., Please knock gently, baby sleeping..."
                    rows="3"
                  ></textarea>
                </div>
              </div>

              <button class="save-location-btn" @click="saveLocation">
                <span class="btn-icon">📍</span>
                <span>{{ locationSaved ? 'Update Location' : 'Confirm Location' }}</span>
              </button>

              <transition name="slide">
                <div v-if="showLocationSaved" class="success-message">
                  <span class="success-icon">✅</span>
                  <span>Location confirmed!</span>
                </div>
              </transition>
            </div>

            <!-- Order Review -->
            <div class="checkout-block">
              <h3 class="block-title">
                <span class="block-icon">📋</span>
                Order Review
              </h3>

              <div class="checkout-items-preview">
                <div v-for="(item, idx) in cart" :key="idx" class="checkout-item-row">
                  <span class="checkout-item-name">{{ item.name }}</span>
                  <span class="checkout-item-qty">× {{ item.qty }}</span>
                  <span class="checkout-item-price">₱{{ item.price * item.qty }}</span>
                </div>
              </div>

              <div class="checkout-summary">
                <div class="checkout-summary-row">
                  <span>Subtotal</span>
                  <span>₱{{ cartTotal }}</span>
                </div>
                <div class="checkout-summary-row">
                  <span>Delivery</span>
                  <span class="free-text">FREE</span>
                </div>
                <div v-if="cartTotal > 500" class="checkout-summary-row discount">
                  <span>Discount</span>
                  <span>-₱50</span>
                </div>
                <div class="checkout-summary-divider"></div>
                <div class="checkout-summary-row total">
                  <span>Total Amount</span>
                  <span class="total-amount">₱{{ calculateTotalWithDiscount }}</span>
                </div>
              </div>
            </div>

            <!-- Delivery Info Message -->
            <div class="delivery-info-box">
              <span class="info-icon">ℹ️</span>
              <div class="info-text">
                <strong>Delivery Time:</strong> 30-45 minutes<br>
                <strong>Payment:</strong> Cash on delivery
              </div>
            </div>

            <!-- Warning if location not saved -->
            <div v-if="!locationSaved" class="checkout-warning">
              <span class="warning-icon">⚠️</span>
              <span>Please confirm your delivery location before placing order</span>
            </div>

            <!-- Navigation & Submit -->
            <div class="stage-navigation">
              <button class="nav-btn nav-back" @click="previousStage">
                <span>← Back to Cart</span>
              </button>
              <button 
                class="nav-btn nav-submit" 
                :disabled="!locationSaved"
                @click="placeOrder"
              >
                <span class="btn-icon">🛵</span>
                <span>Place Order • ₱{{ calculateTotalWithDiscount }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- SUCCESS TOAST -->
    <div class="toast" :class="{ show: showToast }">
      <span class="toast-icon">🎉</span>
      <div class="toast-content">
        <strong>Order placed successfully!</strong>
        <span>Your food is on the way</span>
      </div>
    </div>

    <!-- FLOATING CART BUTTON (only on Stage 1) -->
    <button 
      class="floating-cart" 
      @click="proceedToCart" 
      v-show="currentStage === 1 && totalItems > 0"
    >
      <span class="floating-cart-icon">🛒</span>
      <span class="floating-cart-count">{{ totalItems }}</span>
    </button>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const API_BASE = 'http://localhost:8000/api/pos'

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
const locationSection = ref(null)
const searchQuery = ref('')

// ── STAGE STATE ──
const currentStage = ref(1) // 1 = Products, 2 = Cart Review, 3 = Checkout

// ── PAGINATION STATE ──
const currentPage = ref(1)
const itemsPerPage = ref(6)

// ── LOCATION DATA ──
const locationTypes = ['Room', 'Cottage', 'Day Guest']
const locationEmojis = {
  'Room': '🛏️',
  'Cottage': '🏡',
  'Day Guest': '☀️'
}

// ── PRODUCTS DATA ──
const fallbackProducts = {
  restaurant: [
    {
      name: 'Beef Mami Noodle Soup',
      price: 185,
      emoji: '🍜',
      desc: 'Rich broth, tender beef, fresh noodles',
      popular: true,
      featured: true
    },
    {
      name: 'Creamy Pasta Carbonara',
      price: 220,
      emoji: '🍝',
      desc: 'Bacon, egg, parmesan, cream sauce',
      popular: true
    },
    {
      name: 'Crispy Calamari',
      price: 240,
      emoji: '🦑',
      desc: 'With garlic aioli dipping sauce'
    },
    {
      name: 'Seafood Sinuglaw Bowl',
      price: 295,
      emoji: '🍚',
      desc: 'Fresh kinilaw + grilled pork, served with rice',
      popular: true,
      featured: true
    },
    {
      name: 'Mango Shake (Large)',
      price: 95,
      emoji: '🥭',
      desc: 'Fresh mango, milk, crushed ice',
      popular: true
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
      emoji: '💧',
      desc: 'Chilled, purified drinking water',
      popular: true
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
      desc: 'Chips + chocolate + candy assorted',
      popular: true
    },
    {
      name: 'Toiletry Kit',
      price: 150,
      emoji: '🪥',
      desc: 'Toothbrush, toothpaste, shampoo, soap'
    }
  ]
}

const products = ref({ ...fallbackProducts })
const isLoading = ref(false)
const loadError = ref('')

// Tab labels
const tabLabels = {
  restaurant: 'Restaurant',
  store: 'Mini Mart'
}

// ── COMPUTED ──
const totalItems = computed(() => {
  return cart.value.reduce((sum, item) => sum + item.qty, 0)
})

const cartTotal = computed(() => {
  return cart.value.reduce((sum, item) => sum + item.price * item.qty, 0)
})

const calculateTotalWithDiscount = computed(() => {
  let total = cartTotal.value
  if (total > 500) {
    total -= 50
  }
  return total
})

const currentLocation = computed(() => {
  if (currentLocType.value === 'Day Guest') {
    return 'Day Guest (Pool/Garden Area)'
  }
  return `${currentLocType.value} ${locationNumber.value}`
})

const filteredProducts = computed(() => {
  const currentProducts = products.value[activeTab.value] || []
  if (!searchQuery.value) return currentProducts
  
  return currentProducts.filter(p => 
    p.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    p.desc.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

// ── PAGINATION COMPUTED ──
const totalPages = computed(() => {
  return Math.ceil(filteredProducts.value.length / itemsPerPage.value)
})

const paginatedProducts = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredProducts.value.slice(start, end)
})

// ── METHODS ──
const getTabCount = (tab) => {
  return products.value[tab]?.length || 0
}

const switchTab = (tab) => {
  activeTab.value = tab
  searchQuery.value = ''
  currentPage.value = 1 // Reset to first page when switching tabs
}

// ── STAGE NAVIGATION ──
const goToStage = (stage) => {
  currentStage.value = stage
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const nextStage = () => {
  if (currentStage.value < 3) {
    currentStage.value++
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

const previousStage = () => {
  if (currentStage.value > 1) {
    currentStage.value--
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

const proceedToCart = () => {
  if (cart.value.length === 0) {
    alert('Please add items to your cart first')
    return
  }
  goToStage(2)
}

const proceedToCheckout = () => {
  if (cart.value.length === 0) {
    alert('Your cart is empty')
    return
  }
  goToStage(3)
}

// ── PAGINATION METHODS ──
const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    window.scrollTo({ top: 300, behavior: 'smooth' })
  }
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
    window.scrollTo({ top: 300, behavior: 'smooth' })
  }
}

const previousPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
    window.scrollTo({ top: 300, behavior: 'smooth' })
  }
}

const scrollToLocation = () => {
  if (locationSection.value) {
    locationSection.value.scrollIntoView({ behavior: 'smooth' })
  }
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
  if (!locationSaved.value) {
    alert('Please set your delivery location first')
    return
  }
  
  if (cart.value.length === 0) {
    alert('Your cart is empty')
    return
  }

  // Process order
  showToast.value = true
  cart.value = []
  locationSaved.value = false
  locationNumber.value = ''
  locationNotes.value = ''
  currentStage.value = 1 // Return to stage 1
  
  setTimeout(() => {
    showToast.value = false
  }, 4000)
}

const scrollToCart = () => {
  if (cartSection.value) {
    cartSection.value.scrollIntoView({ behavior: 'smooth' })
  }
}

const getEmojiForCategory = (category) => {
  if (category === 'restaurant') return '🍽️'
  if (category === 'store') return '🛍️'
  return '🧾'
}

const mapPosItems = (items, category) => {
  return items.map((item) => ({
    name: item.name || 'Unnamed item',
    price: Number.parseFloat(item.price) || 0,
    emoji: getEmojiForCategory(category),
    desc: item.description || 'No description available'
  }))
}

const fetchCategoryItems = async (category) => {
  const response = await fetch(`${API_BASE}/items/category/${category}`)
  if (!response.ok) {
    throw new Error(`Failed to load ${category} items`)
  }
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
      restaurant: restaurant.length > 0 ? restaurant : fallbackProducts.restaurant,
      store
    }
  } catch (error) {
    console.error('Error loading e-shop items:', error)
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
:root {
  --primary: #FF6B4A;
  --primary-dark: #E55A3C;
  --primary-light: #FFE8E3;
  --secondary: #2EC4B6;
  --secondary-dark: #25A096;
  --secondary-light: #E0F7F4;
  --accent: #FFB347;
  --dark: #2D3047;
  --gray-100: #F8F9FA;
  --gray-200: #E9ECEF;
  --gray-300: #DEE2E6;
  --gray-400: #ADB5BD;
  --gray-500: #6C757D;
  --gray-600: #495057;
  --success: #06D6A0;
  --warning: #FFD166;
  --danger: #EF476F;
  --white: #FFFFFF;
  --shadow-sm: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  --shadow-md: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  --shadow-colored: 0 10px 15px -3px rgba(255, 107, 74, 0.2);
}

.eshop-container {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  background: linear-gradient(135deg, #F8F9FA 0%, #E9ECEF 100%);
  min-height: 100vh;
  color: var(--dark);
}

/* ── NAVBAR ── */
.navbar {
  background: var(--white);
  padding: 1rem 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: var(--shadow-md);
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.95);
}

.logo {
  font-size: 1.5rem;
  font-weight: 800;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--dark);
}

.logo-icon {
  font-size: 2rem;
}

.shop-tag {
  background: linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%);
  color: var(--white);
  font-size: 0.75rem;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  letter-spacing: 0.5px;
}

.nav-right {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.location-pill {
  background: var(--gray-100);
  padding: 0.5rem 1rem;
  border-radius: 40px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid var(--gray-200);
}

.location-pill:hover {
  background: var(--gray-200);
  transform: translateY(-1px);
}

.location-icon {
  font-size: 1.1rem;
}

.location-text {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--gray-600);
}

.dropdown-arrow {
  font-size: 0.7rem;
  color: var(--gray-400);
}

.cart-btn {
  background: linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%);
  color: var(--white);
  border: none;
  border-radius: 40px;
  padding: 0.5rem 1.25rem;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;
  box-shadow: var(--shadow-colored);
}

.cart-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 15px 20px -5px rgba(255, 107, 74, 0.4);
}

.cart-icon {
  font-size: 1.1rem;
}

.cart-text {
  margin-right: 0.25rem;
}

.cart-count {
  background: var(--white);
  color: var(--primary);
  border-radius: 20px;
  width: 24px;
  height: 24px;
  font-size: 0.8rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* ── HERO BANNER ── */
.hero-banner {
  background: linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%);
  margin: 1.5rem 2rem;
  border-radius: 24px;
  padding: 2rem;
  position: relative;
  overflow: hidden;
}

.hero-banner::before {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background: url('data:image/svg+xml,<svg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"><circle cx="30" cy="30" r="10" fill="rgba(255,255,255,0.1)"/></svg>');
  opacity: 0.3;
}

.hero-content {
  position: relative;
  z-index: 1;
  color: var(--white);
}

.hero-title {
  font-size: 2.5rem;
  font-weight: 800;
  margin: 0 0 0.5rem;
  line-height: 1.2;
}

.hero-title span {
  font-size: 1.5rem;
  font-weight: 400;
  opacity: 0.9;
}

.hero-subtitle {
  font-size: 1rem;
  opacity: 0.9;
  margin-bottom: 1rem;
}

.hero-badges {
  display: flex;
  gap: 0.75rem;
}

.hero-badge {
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(5px);
  padding: 0.25rem 1rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
}

/* ── PAGE LAYOUT ── */
.page {
  max-width: 1200px;
  margin: 0 auto 2rem;
  padding: 0 2rem;
}

.stage-container {
  width: 100%;
}

/* ══════════════════════════════════════════ */
/* STAGE PROGRESS INDICATOR */
/* ══════════════════════════════════════════ */
.stage-progress {
  max-width: 600px;
  margin: 2rem auto;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  background: var(--white);
  border-radius: 16px;
  box-shadow: var(--shadow-sm);
}

.stage-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  position: relative;
}

.step-circle {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--gray-200);
  color: var(--gray-500);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1.1rem;
  transition: all 0.3s;
}

.stage-step.active .step-circle {
  background: linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%);
  color: var(--white);
  box-shadow: var(--shadow-colored);
}

.stage-step.completed .step-circle {
  background: var(--success);
  color: var(--white);
}

.step-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--gray-500);
  transition: color 0.3s;
}

.stage-step.active .step-label {
  color: var(--primary);
}

.stage-step.completed .step-label {
  color: var(--success);
}

.stage-line {
  width: 80px;
  height: 3px;
  background: var(--gray-200);
  margin: 0 0.5rem;
  transition: background 0.3s;
}

.stage-line.active {
  background: linear-gradient(90deg, var(--primary) 0%, var(--accent) 100%);
}

/* ══════════════════════════════════════════ */
/* PAGINATION CONTROLS */
/* ══════════════════════════════════════════ */
.pagination-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 2rem 1.5rem 1rem;
  margin-top: 1rem;
}

.pagination-btn {
  background: var(--white);
  border: 2px solid var(--gray-300);
  color: var(--gray-700);
  padding: 0.5rem 1.25rem;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.pagination-btn:hover:not(:disabled) {
  background: var(--primary);
  border-color: var(--primary);
  color: var(--white);
  transform: translateY(-2px);
}

.pagination-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.pagination-pages {
  display: flex;
  gap: 0.5rem;
}

.page-number {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  border: 2px solid var(--gray-300);
  background: var(--white);
  color: var(--gray-700);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.page-number:hover {
  border-color: var(--primary);
  color: var(--primary);
}

.page-number.active {
  background: linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%);
  border-color: var(--primary);
  color: var(--white);
  box-shadow: var(--shadow-colored);
}

.pagination-info {
  text-align: center;
  padding: 0.5rem 1.5rem 1.5rem;
  color: var(--gray-500);
  font-size: 0.9rem;
}

/* ══════════════════════════════════════════ */
/* CART PREVIEW STICKY BAR (Stage 1) */
/* ══════════════════════════════════════════ */
.cart-preview-sticky {
  position: sticky;
  bottom: 0;
  background: linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%);
  padding: 1.25rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-radius: 0 0 24px 24px;
  margin-top: 1rem;
  box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.1);
}

.cart-preview-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  color: var(--white);
}

.cart-preview-icon {
  font-size: 1.5rem;
}

.cart-preview-count {
  font-weight: 600;
  font-size: 1rem;
}

.cart-preview-total {
  font-weight: 800;
  font-size: 1.5rem;
}

.proceed-btn {
  background: var(--white);
  color: var(--primary);
  border: none;
  padding: 0.75rem 2rem;
  border-radius: 12px;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;
}

.proceed-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
}

.proceed-arrow {
  font-size: 1.2rem;
}

/* ══════════════════════════════════════════ */
/* STAGE NAVIGATION BUTTONS */
/* ══════════════════════════════════════════ */
.stage-navigation {
  display: flex;
  gap: 1rem;
  padding: 1.5rem;
  margin-top: 1.5rem;
  border-top: 2px solid var(--gray-200);
}

.nav-btn {
  flex: 1;
  padding: 1rem 2rem;
  border-radius: 12px;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.nav-back {
  background: var(--white);
  border: 2px solid var(--gray-300);
  color: var(--gray-700);
}

.nav-back:hover {
  background: var(--gray-100);
  border-color: var(--gray-400);
}

.nav-next, .nav-submit {
  background: linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%);
  border: none;
  color: var(--white);
  box-shadow: var(--shadow-colored);
}

.nav-next:hover, .nav-submit:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 15px 20px -5px rgba(255, 107, 74, 0.4);
}

.nav-submit:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

/* ══════════════════════════════════════════ */
/* STAGE 2: CART REVIEW STYLES */
/* ══════════════════════════════════════════ */
.cart-review-section {
  max-width: 900px;
  margin: 0 auto;
}

.cart-items-list {
  padding: 1.5rem;
  max-height: 500px;
  overflow-y: auto;
}

.cart-review-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem;
  background: var(--gray-100);
  border-radius: 16px;
  margin-bottom: 1rem;
  transition: all 0.2s;
}

.cart-review-item:hover {
  background: var(--gray-200);
  transform: translateX(4px);
}

.item-left {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
}

.item-emoji {
  font-size: 2.5rem;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--white);
  border-radius: 12px;
}

.item-info {
  flex: 1;
}

.item-name {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--dark);
  margin: 0 0 0.25rem;
}

.item-price-unit {
  font-size: 0.9rem;
  color: var(--gray-500);
  margin: 0;
}

.item-right {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.quantity-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--white);
  padding: 0.5rem 1rem;
  border-radius: 10px;
  border: 2px solid var(--gray-300);
}

.qty-btn-small {
  background: none;
  border: none;
  color: var(--primary);
  font-size: 1.2rem;
  font-weight: 700;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
}

.qty-btn-small:hover {
  color: var(--primary-dark);
}

.qty-display {
  font-weight: 700;
  font-size: 1rem;
  color: var(--dark);
  min-width: 60px;
  text-align: center;
}

.item-subtotal {
  font-weight: 800;
  font-size: 1.2rem;
  color: var(--primary);
  min-width: 100px;
  text-align: right;
}

.remove-btn-small {
  background: var(--danger);
  color: var(--white);
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.remove-btn-small:hover {
  background: #c0392b;
  transform: scale(1.1);
}

.order-summary-box {
  background: var(--gray-100);
  padding: 1.5rem;
  margin: 1.5rem;
  border-radius: 16px;
}

.summary-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--dark);
  margin: 0 0 1rem;
}

.summary-details {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.summary-line {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 1rem;
  color: var(--gray-600);
}

.summary-amount {
  font-weight: 600;
  color: var(--dark);
}

.summary-amount.free {
  color: var(--success);
  font-weight: 700;
}

.summary-amount.discount {
  color: var(--danger);
}

.discount-line {
  color: var(--danger);
}

.summary-divider {
  height: 2px;
  background: var(--gray-300);
  margin: 0.5rem 0;
}

.total-line {
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--dark);
  margin-top: 0.5rem;
}

.summary-total-amount {
  font-size: 1.8rem;
  font-weight: 800;
  color: var(--primary);
}

/* ══════════════════════════════════════════ */
/* STAGE 3: CHECKOUT STYLES */
/* ══════════════════════════════════════════ */
.checkout-section {
  max-width: 900px;
  margin: 0 auto;
}

.checkout-content {
  padding: 1.5rem;
}

.checkout-block {
  background: var(--gray-100);
  padding: 1.5rem;
  border-radius: 16px;
  margin-bottom: 1.5rem;
}

.block-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--dark);
  margin: 0 0 1.25rem;
}

.block-icon {
  font-size: 1.5rem;
}

.checkout-items-preview {
  background: var(--white);
  border-radius: 12px;
  padding: 1rem;
  margin-bottom: 1rem;
}

.checkout-item-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  border-bottom: 1px solid var(--gray-200);
}

.checkout-item-row:last-child {
  border-bottom: none;
}

.checkout-item-name {
  flex: 1;
  font-weight: 600;
  color: var(--dark);
}

.checkout-item-qty {
  color: var(--gray-500);
  margin: 0 1rem;
  min-width: 50px;
}

.checkout-item-price {
  font-weight: 700;
  color: var(--primary);
  min-width: 100px;
  text-align: right;
}

.checkout-summary {
  background: var(--white);
  border-radius: 12px;
  padding: 1.25rem;
}

.checkout-summary-row {
  display: flex;
  justify-content: space-between;
  padding: 0.75rem 0;
  color: var(--gray-600);
}

.checkout-summary-row.total {
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--dark);
  margin-top: 0.5rem;
}

.free-text {
  color: var(--success);
  font-weight: 700;
}

.checkout-summary-row.discount {
  color: var(--danger);
}

.checkout-summary-divider {
  height: 2px;
  background: var(--gray-200);
  margin: 0.75rem 0;
}

.total-amount {
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--primary);
}

.delivery-info-box {
  background: var(--secondary-light);
  border-left: 4px solid var(--secondary);
  padding: 1rem 1.25rem;
  border-radius: 12px;
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.info-icon {
  font-size: 1.5rem;
}

.info-text {
  font-size: 0.95rem;
  color: var(--gray-700);
  line-height: 1.6;
}

.checkout-warning {
  background: var(--warning);
  color: var(--dark);
  padding: 1rem 1.25rem;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
}

.warning-icon {
  font-size: 1.5rem;
}

/* ── SECTION CARD ── */
.section-card {
  background: var(--white);
  border-radius: 24px;
  box-shadow: var(--shadow-md);
  overflow: hidden;
  margin-bottom: 1.5rem;
  transition: transform 0.2s;
}

.section-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.section-header {
  padding: 1.25rem 1.5rem;
  border-bottom: 2px solid var(--gray-200);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.section-title-wrapper {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.section-icon {
  font-size: 1.5rem;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--dark);
  margin: 0;
}

/* ── SEARCH BOX ── */
.search-box {
  position: relative;
}

.search-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--gray-400);
}

.search-input {
  padding: 0.5rem 1rem 0.5rem 2.5rem;
  border: 2px solid var(--gray-200);
  border-radius: 40px;
  font-size: 0.9rem;
  width: 250px;
  transition: all 0.2s;
}

.search-input:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px var(--primary-light);
}

/* ── PRODUCT TABS ── */
.product-tabs {
  display: flex;
  gap: 0.5rem;
  padding: 1rem 1.5rem;
  background: var(--gray-100);
}

.tab {
  flex: 1;
  padding: 0.75rem;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
  background: var(--white);
  border: 2px solid transparent;
}

.tab:hover {
  background: var(--primary-light);
  transform: translateY(-1px);
}

.tab.active {
  background: var(--white);
  border-color: var(--primary);
  box-shadow: var(--shadow-sm);
}

.tab-emoji {
  font-size: 1.2rem;
}

.tab-text {
  font-weight: 600;
  color: var(--gray-600);
}

.tab.active .tab-text {
  color: var(--primary);
}

.tab-count {
  background: var(--gray-200);
  padding: 0.15rem 0.5rem;
  border-radius: 20px;
  font-size: 0.7rem;
  font-weight: 600;
  color: var(--gray-600);
}

/* ── PRODUCTS GRID ── */
.products-container {
  padding: 1.5rem;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.product-card {
  background: var(--white);
  border: 2px solid var(--gray-200);
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.2s;
  position: relative;
}

.product-card:hover {
  border-color: var(--primary);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.product-card.featured {
  border-color: var(--primary);
  background: linear-gradient(135deg, var(--white) 0%, var(--primary-light) 100%);
}

.product-image {
  padding: 1rem;
  background: var(--gray-100);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.product-emoji {
  font-size: 3rem;
}

.popular-badge {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: linear-gradient(135deg, var(--accent) 0%, var(--warning) 100%);
  color: var(--dark);
  padding: 0.2rem 0.5rem;
  border-radius: 20px;
  font-size: 0.7rem;
  font-weight: 700;
}

.product-info {
  padding: 1rem;
}

.product-name {
  font-size: 1rem;
  font-weight: 700;
  margin: 0 0 0.25rem;
  color: var(--dark);
}

.product-desc {
  font-size: 0.8rem;
  color: var(--gray-500);
  margin: 0 0 0.75rem;
  line-height: 1.3;
}

.product-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.product-price {
  font-size: 1.25rem;
  font-weight: 800;
  color: var(--primary);
}

.add-to-cart-btn {
  background: var(--primary);
  color: var(--white);
  border: none;
  border-radius: 40px;
  padding: 0.4rem 1rem;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  transition: all 0.2s;
}

.add-to-cart-btn:hover {
  background: var(--primary-dark);
  transform: scale(1.05);
}

.add-to-cart-btn.added {
  background: var(--success);
}

.btn-icon {
  font-size: 1rem;
}

/* ── LOADING & ERROR STATES ── */
.loading-state {
  text-align: center;
  padding: 3rem;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--gray-200);
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-state {
  text-align: center;
  padding: 3rem;
}

.error-icon {
  font-size: 3rem;
  display: block;
  margin-bottom: 1rem;
}

.retry-btn {
  background: var(--primary);
  color: var(--white);
  border: none;
  border-radius: 40px;
  padding: 0.5rem 1.5rem;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  margin-top: 1rem;
}

/* ── CART SECTION ── */
.cart-section {
  background: var(--white);
}

.cart-item-count {
  background: var(--gray-200);
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
}

.cart-empty {
  text-align: center;
  padding: 3rem 1.5rem;
}

.empty-cart-illustration {
  position: relative;
  width: 100px;
  height: 100px;
  margin: 0 auto 1rem;
}

.empty-cart-icon {
  font-size: 4rem;
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
}

.empty-cart-emoji {
  font-size: 2rem;
  position: absolute;
  bottom: 0;
  right: 0;
}

.cart-empty h3 {
  font-size: 1.1rem;
  margin: 0 0 0.25rem;
}

.cart-empty p {
  color: var(--gray-500);
  font-size: 0.9rem;
  margin: 0 0 1rem;
}

.browse-menu-btn {
  background: var(--primary);
  color: var(--white);
  border: none;
  border-radius: 40px;
  padding: 0.5rem 1.5rem;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
}

.cart-content {
  padding: 1.5rem;
}

.cart-items {
  margin-bottom: 1.5rem;
}

.cart-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  border: 2px solid var(--gray-200);
  border-radius: 12px;
  margin-bottom: 0.75rem;
  transition: all 0.2s;
}

.cart-item:hover {
  border-color: var(--primary);
  background: var(--primary-light);
}

.cart-item-image {
  width: 50px;
  height: 50px;
  background: var(--gray-100);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cart-item-emoji {
  font-size: 1.5rem;
}

.cart-item-details {
  flex: 1;
}

.cart-item-name {
  font-size: 0.9rem;
  font-weight: 600;
  margin: 0 0 0.25rem;
}

.cart-item-price {
  font-size: 0.8rem;
  color: var(--gray-500);
}

.cart-item-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.quantity-control {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  background: var(--gray-100);
  border-radius: 30px;
  padding: 0.15rem;
}

.qty-btn {
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 50%;
  background: var(--white);
  color: var(--gray-600);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.qty-btn:hover {
  background: var(--primary);
  color: var(--white);
}

.qty-value {
  min-width: 24px;
  text-align: center;
  font-weight: 700;
  color: var(--dark);
}

.remove-item {
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 50%;
  background: var(--gray-100);
  color: var(--gray-500);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.remove-item:hover {
  background: var(--danger);
  color: var(--white);
}

.cart-summary {
  background: var(--gray-100);
  border-radius: 16px;
  padding: 1.25rem;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.75rem;
  font-size: 0.9rem;
  color: var(--gray-600);
}

.free-delivery {
  color: var(--success);
  font-weight: 700;
}

.summary-row.discount {
  color: var(--success);
  font-weight: 600;
}

.summary-total {
  display: flex;
  justify-content: space-between;
  font-size: 1.1rem;
  font-weight: 800;
  color: var(--dark);
  margin: 1rem 0;
  padding-top: 0.75rem;
  border-top: 2px dashed var(--gray-300);
}

.delivery-warning {
  background: var(--warning);
  color: var(--dark);
  padding: 0.75rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.warning-icon {
  font-size: 1.1rem;
}

.checkout-btn {
  width: 100%;
  background: linear-gradient(135deg, var(--success) 0%, var(--secondary) 100%);
  color: var(--white);
  border: none;
  border-radius: 40px;
  padding: 1rem;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.2s;
}

.checkout-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 15px 20px -5px rgba(6, 214, 160, 0.4);
}

.checkout-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.checkout-note {
  text-align: center;
  font-size: 0.8rem;
  color: var(--gray-500);
  margin-top: 0.75rem;
}

/* ── LOCATION CARD ── */
.location-card {
  background: var(--white);
}

.location-content {
  padding: 1.5rem;
}

.location-type-selector {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.location-type {
  border: 2px solid var(--gray-200);
  border-radius: 12px;
  padding: 0.75rem 0.25rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
}

.location-type:hover {
  border-color: var(--primary);
  background: var(--primary-light);
}

.location-type.active {
  border-color: var(--primary);
  background: linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%);
  color: var(--white);
}

.type-emoji {
  font-size: 1.5rem;
  display: block;
  margin-bottom: 0.25rem;
}

.type-name {
  font-size: 0.8rem;
  font-weight: 600;
}

.input-group {
  margin-bottom: 1.25rem;
}

.input-label {
  display: block;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--gray-600);
  margin-bottom: 0.35rem;
}

.required-star {
  color: var(--danger);
}

.input-wrapper {
  position: relative;
}

.input-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--gray-400);
  z-index: 1;
}

.form-input,
.form-textarea {
  width: 100%;
  border: 2px solid var(--gray-200);
  border-radius: 12px;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  font-size: 0.9rem;
  transition: all 0.2s;
  background: var(--white);
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
  line-height: 1.4;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px var(--primary-light);
}

.save-location-btn {
  width: 100%;
  background: linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%);
  color: var(--white);
  border: none;
  border-radius: 12px;
  padding: 0.75rem;
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.2s;
  margin-bottom: 1rem;
}

.save-location-btn:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-colored);
}

.success-message {
  background: var(--secondary-light);
  border: 2px solid var(--secondary);
  border-radius: 12px;
  padding: 0.75rem;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--secondary-dark);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.success-icon {
  font-size: 1.1rem;
}

.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.saved-location-display {
  background: var(--primary-light);
  border: 2px solid var(--primary);
  border-radius: 12px;
  padding: 1rem;
}

.saved-location-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.saved-icon {
  font-size: 1.2rem;
}

.saved-location-text {
  font-weight: 700;
  color: var(--dark);
}

.saved-notes {
  font-size: 0.8rem;
  color: var(--gray-600);
  margin: 0;
  padding-left: 1.7rem;
}

/* ── TRACKING CARD ── */
.tracking-card {
  background: var(--white);
}

.live-badge {
  background: var(--danger);
  color: var(--white);
  padding: 0.2rem 0.75rem;
  border-radius: 20px;
  font-size: 0.7rem;
  font-weight: 700;
  animation: pulse 1.5s infinite;
}

.active-order {
  padding: 1.5rem;
  border-bottom: 2px solid var(--gray-200);
}

.order-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.order-number {
  font-weight: 700;
  color: var(--dark);
  margin-right: 0.5rem;
}

.order-time {
  font-size: 0.8rem;
  color: var(--gray-500);
}

.order-status {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.7rem;
  font-weight: 700;
}

.order-status.preparing {
  background: var(--warning);
  color: var(--dark);
}

.order-items-preview {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-bottom: 1.5rem;
}

.item-pill {
  background: var(--gray-100);
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  color: var(--gray-600);
}

.delivery-timeline {
  margin-bottom: 1.5rem;
}

.timeline-step {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1rem;
  position: relative;
}

.timeline-step:not(:last-child)::before {
  content: '';
  position: absolute;
  left: 12px;
  top: 24px;
  bottom: -8px;
  width: 2px;
  background: var(--gray-200);
}

.step-dot {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--gray-200);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  z-index: 1;
}

.timeline-step.completed .step-dot {
  background: var(--success);
  color: var(--white);
}

.timeline-step.active .step-dot {
  background: var(--primary);
  color: var(--white);
  animation: pulse 1.5s infinite;
}

.step-content {
  flex: 1;
}

.step-title {
  display: block;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--dark);
}

.step-time {
  display: block;
  font-size: 0.7rem;
  color: var(--gray-500);
}

.delivery-partner {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: var(--gray-100);
  border-radius: 12px;
}

.partner-icon {
  font-size: 1.5rem;
}

.partner-info {
  flex: 1;
}

.partner-name {
  display: block;
  font-size: 0.9rem;
  font-weight: 600;
}

.partner-eta {
  display: block;
  font-size: 0.7rem;
  color: var(--success);
  font-weight: 600;
}

.call-partner {
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 50%;
  background: var(--primary);
  color: var(--white);
  font-size: 1.2rem;
  cursor: pointer;
  transition: all 0.2s;
}

.call-partner:hover {
  transform: scale(1.1);
  background: var(--primary-dark);
}

.past-orders {
  padding: 1.5rem;
}

.past-orders-title {
  font-size: 1rem;
  font-weight: 700;
  margin: 0 0 1rem;
}

.past-order-item {
  padding: 1rem;
  border: 2px solid var(--gray-200);
  border-radius: 12px;
  margin-bottom: 0.75rem;
  transition: all 0.2s;
}

.past-order-item:hover {
  border-color: var(--primary);
  background: var(--primary-light);
}

.past-order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.past-order-number {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--gray-600);
}

.past-order-status {
  font-size: 0.7rem;
  font-weight: 600;
  padding: 0.15rem 0.5rem;
  border-radius: 12px;
}

.past-order-status.delivered {
  background: var(--success);
  color: var(--white);
}

.past-order-details {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.25rem;
}

.past-order-items {
  font-size: 0.8rem;
  color: var(--gray-600);
}

.past-order-total {
  font-weight: 700;
  color: var(--dark);
}

.past-order-date {
  font-size: 0.7rem;
  color: var(--gray-500);
}

/* ── ACCOUNT CARD ── */
.account-card {
  background: linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%);
  color: var(--white);
}

.account-header {
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.account-avatar {
  width: 60px;
  height: 60px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: 700;
  backdrop-filter: blur(5px);
}

.account-info {
  flex: 1;
}

.account-name {
  font-size: 1.1rem;
  font-weight: 700;
  margin: 0 0 0.25rem;
}

.account-email {
  font-size: 0.8rem;
  opacity: 0.8;
  margin: 0;
}

.account-menu-btn {
  background: none;
  border: none;
  color: var(--white);
  font-size: 1.5rem;
  cursor: pointer;
  opacity: 0.8;
}

.account-stats {
  padding: 1.5rem;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  text-align: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.stat-value {
  display: block;
  font-size: 1.25rem;
  font-weight: 800;
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.7rem;
  opacity: 0.8;
}

.account-actions {
  padding: 1.5rem;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
}

.account-action {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 12px;
  padding: 0.75rem;
  color: var(--white);
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;
  backdrop-filter: blur(5px);
}

.account-action:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
}

.account-action span:first-child {
  font-size: 1.2rem;
}

/* ── TOAST ── */
.toast {
  position: fixed;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%) translateY(100px);
  background: linear-gradient(135deg, var(--success) 0%, var(--secondary) 100%);
  color: var(--white);
  border-radius: 40px;
  padding: 1rem 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  box-shadow: 0 20px 25px -5px rgba(6, 214, 160, 0.4);
  z-index: 999;
  transition: transform 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.toast.show {
  transform: translateX(-50%) translateY(0);
}

.toast-icon {
  font-size: 1.5rem;
}

.toast-content {
  display: flex;
  flex-direction: column;
}

.toast-content strong {
  font-size: 0.9rem;
}

.toast-content span {
  font-size: 0.8rem;
  opacity: 0.9;
}

/* ── FLOATING CART ── */
.floating-cart {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%);
  border: none;
  border-radius: 50%;
  color: var(--white);
  font-size: 1.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-lg);
  transition: all 0.2s;
  z-index: 90;
}

.floating-cart:hover {
  transform: scale(1.1);
  box-shadow: 0 20px 30px -5px rgba(255, 107, 74, 0.5);
}

.floating-cart-count {
  position: absolute;
  top: -5px;
  right: -5px;
  background: var(--white);
  color: var(--primary);
  width: 24px;
  height: 24px;
  border-radius: 50%;
  font-size: 0.8rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid var(--primary);
}

/* ── ANIMATIONS ── */
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

/* ── RESPONSIVE ── */
@media (max-width: 968px) {
  .page {
    grid-template-columns: 1fr;
  }
  
  .products-grid {
    grid-template-columns: 1fr;
  }
  
  .hero-banner {
    margin: 1rem;
  }
  
  .navbar {
    padding: 0.75rem 1rem;
  }
  
  .location-text {
    display: none;
  }
}
</style>