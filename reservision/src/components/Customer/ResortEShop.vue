<template>
  <div class="eshop-container">

    <!-- ══════════════════════════════════════════ -->
    <!-- HEADER                                     -->
    <!-- ══════════════════════════════════════════ -->
    <header class="eshop-header">
      <div class="header-brand">
        <span class="brand-icon">🍽️</span>
        <div class="brand-text">
          <h1 class="header-title">Eduardo's Restaurant</h1>
          <p class="header-sub">Order from the resort kitchen</p>
        </div>
      </div>

      <div class="stage-tabs-container">
        <button
          v-for="(tab, i) in stageTabs"
          :key="i"
          class="stage-tab-btn"
          :class="{ active: currentStage === i + 1, completed: currentStage > i + 1 }"
          @click="i === 0 ? goToStage(1) : i === 1 && cart.length > 0 ? goToStage(2) : i === 2 && cart.length > 0 ? goToStage(3) : null"
        >
          <span class="stage-num">{{ currentStage > i + 1 ? '✓' : i + 1 }}</span>
          <span class="stage-label">{{ tab }}</span>
        </button>
      </div>

      <div class="header-right">
        <button
          class="cart-header-btn"
          :class="{ 'has-items': totalItems > 0 }"
          @click="currentStage === 1 && cart.length > 0 ? proceedToCart() : null"
        >
          <span class="cart-icon-wrap">
            <i class="fas fa-shopping-basket"></i>
            <span v-if="totalItems > 0" class="cart-badge-header">{{ totalItems }}</span>
          </span>
          <span class="cart-btn-label">Cart</span>
        </button>
      </div>
    </header>

    <!-- ══════════════════════════════════════════ -->
    <!-- MAIN CONTENT                               -->
    <!-- ══════════════════════════════════════════ -->
    <div class="main-wrapper">

      <!-- ─────────────────────────────────────── -->
      <!-- STAGE 1 · BROWSE MENU                   -->
      <!-- ─────────────────────────────────────── -->
      <transition name="stage-fade" mode="out-in">
        <div v-if="currentStage === 1" key="stage1" class="stage-content">
          <div class="menu-container">

            <!-- Menu Header Bar -->
            <div class="menu-header">
              <div class="menu-title-section">
                <span class="menu-emoji">🍽️</span>
                <div>
                  <h2 class="menu-title">Our Menu</h2>
                  <p class="menu-sub">{{ filteredProducts.length }} items available</p>
                </div>
              </div>
              <div class="search-box">
                <i class="fas fa-search search-icon"></i>
                <input
                  type="text"
                  placeholder="Search dishes..."
                  class="search-input"
                  v-model="searchQuery"
                />
                <button v-if="searchQuery" class="search-clear" @click="searchQuery = ''">
                  <i class="fas fa-times"></i>
                </button>
              </div>
            </div>

            <!-- Products Area -->
            <div class="products-section">

              <div v-if="isLoading" class="state-container">
                <div class="resort-spinner">
                  <div v-for="n in 4" :key="n" class="spinner-wave" :style="`animation-delay:${(n-1)*0.15}s`"></div>
                </div>
                <p class="state-text">Loading the menu…</p>
              </div>

              <div v-else-if="loadError" class="state-container">
                <span class="state-emoji">😢</span>
                <p class="state-text">{{ loadError }}</p>
                <button class="retry-btn" @click="fetchProducts">
                  <i class="fas fa-redo"></i> Try Again
                </button>
              </div>

              <div v-else-if="filteredProducts.length === 0" class="state-container">
                <span class="state-emoji">🔍</span>
                <h3 class="state-heading">No items found</h3>
                <p class="state-text">Try a different search term</p>
              </div>

              <div v-else class="categories-list">
                <div v-for="(group, gi) in sortedGroups" :key="gi" class="category-block">
                  <div class="category-heading">
                    <span class="category-dot"></span>
                    <h3 class="category-title">{{ group.type }}</h3>
                    <span class="category-count">{{ group.items.length }}</span>
                  </div>
                  <div class="products-grid">
                    <div
                      v-for="(product, pi) in group.items"
                      :key="gi + '-' + pi"
                      class="product-card"
                      :class="{ 'is-added': isProductAdded(product.name) }"
                      @click="openCustomizationModal(product)"
                    >
                      <div class="product-body">
                        <div class="product-info">
                          <h4 class="product-name">{{ product.name }}</h4>
                          <p class="product-cat">{{ group.type }}</p>
                        </div>
                        <div class="product-right">
                          <span class="product-price">₱{{ product.price }}</span>
                          <button
                            class="add-btn"
                            :class="{ added: isProductAdded(product.name) }"
                            @click.stop="openCustomizationModal(product)"
                          >
                            <i :class="isProductAdded(product.name) ? 'fas fa-check' : 'fas fa-plus'"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </transition>

      <!-- ─────────────────────────────────────── -->
      <!-- STAGE 2 · REVIEW CART                   -->
      <!-- ─────────────────────────────────────── -->
      <transition name="stage-fade" mode="out-in">
        <div v-if="currentStage === 2" key="stage2" class="stage-content">
          <div class="panel-container">
            <div class="panel-header">
              <div class="panel-title-wrap">
                <i class="fas fa-shopping-basket panel-icon"></i>
                <div>
                  <h2 class="panel-title">Review Your Order</h2>
                  <p class="panel-sub">{{ totalItems }} item{{ totalItems !== 1 ? 's' : '' }} selected</p>
                </div>
              </div>
            </div>

            <div v-if="cart.length === 0" class="state-container padded">
              <span class="state-emoji">🛒</span>
              <h3 class="state-heading">Your cart is empty</h3>
              <p class="state-text">Go back and add some items</p>
              <button class="primary-btn mt-sm" @click="goToStage(1)">
                <i class="fas fa-arrow-left"></i> Back to Menu
              </button>
            </div>

            <div v-else class="cart-body">
              <div class="cart-items-wrap">
                <transition-group name="cart-item-anim" tag="div" class="cart-items-list">
                  <div v-for="(item, idx) in cart" :key="item.cartKey || `${item.name}-${idx}`" class="cart-item">
                    <div class="ci-avatar">{{ item.name.charAt(0) }}</div>
                    <div class="ci-info">
                      <h4 class="ci-name">{{ item.name }}</h4>
                      <p class="ci-unit">₱{{ item.price }} each</p>
                      <div v-if="item.customization" class="ci-meta">
                        <span>Size: {{ item.customization.sizeLabel }}</span>
                        <span v-if="item.customization.addOns?.length">Add-ons: {{ item.customization.addOns.map(a => a.name).join(', ') }}</span>
                        <span v-if="item.customization.specialRequest">Note: {{ item.customization.specialRequest }}</span>
                      </div>
                    </div>
                    <div class="ci-controls">
                      <button class="qty-btn" @click="changeQty(idx, -1)"><i class="fas fa-minus"></i></button>
                      <span class="qty-val">{{ item.qty }}</span>
                      <button class="qty-btn" @click="changeQty(idx, 1)"><i class="fas fa-plus"></i></button>
                    </div>
                    <span class="ci-total">₱{{ item.price * item.qty }}</span>
                    <button class="ci-remove" @click="removeItem(idx)"><i class="fas fa-times"></i></button>
                  </div>
                </transition-group>
              </div>

              <div class="order-summary-card">
                <h3 class="summary-title">Order Summary</h3>
                <div class="summary-lines">
                  <div class="summary-line">
                    <span>Subtotal ({{ totalItems }} items)</span>
                    <span class="summary-val">₱{{ cartTotal }}</span>
                  </div>
                  <div class="summary-line">
                    <span>Delivery Fee</span>
                    <span class="summary-free">FREE</span>
                  </div>
                  <div class="summary-divider"></div>
                  <div class="summary-line total-line">
                    <span>Total</span>
                    <span class="summary-total">₱{{ cartTotal }}</span>
                  </div>
                </div>
              </div>

              <div class="nav-btns">
                <button class="ghost-btn" @click="previousStage">
                  <i class="fas fa-arrow-left"></i> Back to Menu
                </button>
                <button class="primary-btn" @click="proceedToCheckout">
                  Proceed to Checkout <i class="fas fa-arrow-right"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </transition>

      <!-- ─────────────────────────────────────── -->
      <!-- STAGE 3 · CHECKOUT                      -->
      <!-- ─────────────────────────────────────── -->
      <transition name="stage-fade" mode="out-in">
        <div v-if="currentStage === 3" key="stage3" class="stage-content">
          <div class="panel-container">
            <div class="panel-header navy-header">
              <div class="panel-title-wrap">
                <i class="fas fa-map-marker-alt panel-icon gold-icon"></i>
                <div>
                  <h2 class="panel-title white-title">Delivery &amp; Checkout</h2>
                  <p class="panel-sub light-sub">Confirm your delivery details</p>
                </div>
              </div>
            </div>

            <div class="checkout-body">
              <div class="checkout-cols">

                <!-- LEFT: Delivery -->
                <div class="checkout-col">
                  <div class="checkout-card">
                    <h3 class="card-title"><span class="card-icon">📍</span> Delivery Location</h3>

                    <div class="loc-type-grid">
                      <div
                        v-for="type in locationTypes"
                        :key="type"
                        class="loc-card"
                        :class="{ selected: currentLocType === type }"
                        @click="currentLocType = type"
                      >
                        <span class="loc-emoji">{{ locationEmojis[type] }}</span>
                        <span class="loc-name">{{ type }}</span>
                        <span v-if="currentLocType === type" class="loc-check">
                          <i class="fas fa-check"></i>
                        </span>
                      </div>
                    </div>

                    <div v-if="currentLocType !== 'Day Guest'" class="form-field">
                      <label class="field-label">{{ currentLocType }} Number <span class="req">*</span></label>
                      <div class="input-wrap">
                        <i class="fas fa-hashtag input-icon"></i>
                        <input v-model="locationNumber" class="field-input" type="text" :placeholder="`Enter your ${currentLocType.toLowerCase()} number`" />
                      </div>
                    </div>

                    <div class="form-field">
                      <label class="field-label">Special Instructions <span class="opt">(optional)</span></label>
                      <div class="input-wrap">
                        <i class="fas fa-pencil-alt input-icon ta-icon"></i>
                        <textarea v-model="locationNotes" class="field-textarea" placeholder="e.g., Please knock gently…" rows="3"></textarea>
                      </div>
                    </div>

                    <button class="confirm-loc-btn" :class="{ saved: locationSaved }" @click="saveLocation">
                      <i :class="locationSaved ? 'fas fa-check-circle' : 'fas fa-map-marker-alt'"></i>
                      {{ locationSaved ? '✓ Location Confirmed' : 'Confirm Location' }}
                    </button>

                    <transition name="pop-in">
                      <div v-if="showLocationSaved" class="success-inline">
                        <i class="fas fa-check-circle"></i> Location saved!
                      </div>
                    </transition>
                  </div>

                  <div class="info-card">
                    <div class="info-row"><i class="fas fa-clock info-ic"></i><span><strong>Delivery Time:</strong> 30–45 minutes</span></div>
                    <div class="info-row"><i class="fas fa-money-bill-wave info-ic"></i><span><strong>Payment:</strong> Cash on delivery</span></div>
                  </div>
                </div>

                <!-- RIGHT: Order Review -->
                <div class="checkout-col">
                  <div class="checkout-card">
                    <h3 class="card-title"><span class="card-icon">📋</span> Order Review</h3>

                    <div class="order-items">
                      <div v-for="(item, idx) in cart" :key="idx" class="oi-row">
                        <span class="oi-name">{{ item.name }}</span>
                        <span class="oi-qty">× {{ item.qty }}</span>
                        <span class="oi-price">₱{{ item.price * item.qty }}</span>
                      </div>
                    </div>

                    <div class="order-totals">
                      <div class="total-row"><span>Subtotal</span><span class="tv">₱{{ cartTotal }}</span></div>
                      <div class="total-row"><span>Delivery</span><span class="tv free-green">FREE</span></div>
                      <div class="total-divider"></div>
                      <div class="total-row final-row">
                        <span>Total Amount</span>
                        <span class="final-val">₱{{ cartTotal }}</span>
                      </div>
                    </div>
                  </div>

                  <div v-if="!locationSaved" class="warning-card">
                    <i class="fas fa-exclamation-triangle"></i>
                    Please confirm your delivery location before placing your order.
                  </div>
                </div>

              </div>

              <div class="nav-btns">
                <button class="ghost-btn" @click="previousStage">
                  <i class="fas fa-arrow-left"></i> Back to Cart
                </button>
                <button
                  class="submit-btn"
                  :class="{ ready: locationSaved }"
                  :disabled="!locationSaved"
                  @click="placeOrder"
                >
                  <i class="fas fa-motorcycle"></i>
                  Place Order · ₱{{ cartTotal }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </transition>

    </div>

    <!-- Toast -->
    <transition name="toast-slide">
      <div v-if="showToast" class="global-toast">
        <div class="toast-inner">
          <span class="toast-emoji">🎉</span>
          <div>
            <strong>Order placed!</strong>
            <span>Your food is on its way</span>
          </div>
        </div>
      </div>
    </transition>

    <!-- Item Customization Modal -->
    <div v-if="showCustomizationModal && pendingCustomItem" class="modal-overlay" @click.self="closeCustomizationModal">
      <div class="modal-box" @click.stop>
        <div class="modal-head">
          <div class="modal-head-left">
            <div class="modal-head-icon modal-head-icon--gold"><i class="fas fa-sliders-h"></i></div>
            <div>
              <div class="modal-title">Customize Item</div>
              <div class="modal-sub">{{ pendingCustomItem.name }} • Base ₱{{ Number(pendingCustomItem.price || 0).toLocaleString() }}</div>
            </div>
          </div>
          <button @click="closeCustomizationModal" class="modal-close-btn"><i class="fas fa-times"></i></button>
        </div>

        <div class="modal-body">
          <div class="modal-section">
            <div class="modal-section-title"><i class="fas fa-ruler-combined"></i> Size</div>
            <div class="customize-chip-grid">
              <button
                v-for="size in customizationSizeOptions"
                :key="size.id"
                type="button"
                :class="['customize-chip', customizationForm.sizeId === size.id ? 'customize-chip--active' : '']"
                @click="customizationForm.sizeId = size.id"
              >
                <span>{{ size.label }}</span>
                <small>{{ size.priceDelta > 0 ? `+₱${size.priceDelta}` : 'Included' }}</small>
              </button>
            </div>
          </div>

          <div class="modal-section">
            <div class="modal-section-title"><i class="fas fa-plus-circle"></i> Add-ons</div>
            <div v-if="customizationAddOnOptions.length > 0" class="customize-addon-list">
              <label
                v-for="addon in customizationAddOnOptions"
                :key="addon.id"
                class="customize-addon-item"
              >
                <input
                  type="checkbox"
                  :value="addon.id"
                  v-model="customizationForm.selectedAddOnIds"
                >
                <span>{{ addon.name }}</span>
                <strong>+₱{{ addon.price }}</strong>
              </label>
            </div>
            <div v-else class="customize-addon-list customize-addon-list--disabled">
              <div class="customize-addon-empty">No add-ons available for this item</div>
            </div>
          </div>

          <div class="modal-section">
            <div class="modal-section-title"><i class="fas fa-sticky-note"></i> Special Request</div>
            <textarea
              v-model="customizationForm.specialRequest"
              class="field-textarea"
              rows="3"
              placeholder="No onions, less ice, extra hot, etc."
            ></textarea>
          </div>

          <div class="modal-section">
            <div class="detail-row">
              <span class="detail-key">Base Price</span>
              <span class="detail-val">₱{{ Number(pendingCustomItem.price || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-key">Customizations</span>
              <span class="detail-val">₱{{ customizationExtraAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</span>
            </div>
            <div class="detail-row detail-row--total">
              <span class="detail-key">Item Total</span>
              <span class="detail-total">₱{{ customizedItemUnitPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</span>
            </div>
          </div>
        </div>

        <div class="modal-foot">
          <button @click="closeCustomizationModal" class="ghost-btn">Cancel</button>
          <button @click="confirmCustomization" class="primary-btn">
            <i class="fas fa-check-circle"></i> Confirm
          </button>
        </div>
      </div>
    </div>

    <!-- Floating Cart FAB -->
    <transition name="fab-pop">
      <button v-show="currentStage === 1 && totalItems > 0" class="fab-cart" @click="proceedToCart">
        <i class="fas fa-shopping-basket"></i>
        <span class="fab-badge">{{ totalItems }}</span>
        <span class="fab-label">View Cart · ₱{{ cartTotal }}</span>
      </button>
    </transition>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const API_BASE = 'http://localhost:8000/api/pos'
const stageTabs = ['Browse Menu', 'Review Cart', 'Checkout']
const DEFAULT_SIZE_OPTIONS = [{ id: 'regular', label: 'Regular', priceDelta: 0 }]
const DEFAULT_ADDON_OPTIONS = []

const cart              = ref([])
const currentLocType    = ref('Room')
const locationNumber    = ref('')
const locationNotes     = ref('')
const locationSaved     = ref(false)
const showLocationSaved = ref(false)
const showToast         = ref(false)
const addedProducts     = ref(new Set())
const searchQuery       = ref('')
const currentStage      = ref(1)
const isLoading         = ref(false)
const loadError         = ref('')

const locationTypes  = ['Room', 'Cottage']
const locationEmojis = { Room: '🛏️', Cottage: '🏡' }

const fallbackRestaurant = [
  { name: 'Beef Mami Noodle Soup',  price: 185, desc: 'Noodles' },
  { name: 'Creamy Pasta Carbonara', price: 220, desc: 'Pasta' },
  { name: 'Crispy Calamari',        price: 240, desc: 'Appetizer' },
  { name: 'Seafood Sinuglaw Bowl',  price: 295, desc: 'Seafood' },
  { name: 'Mango Shake (Large)',    price: 95,  desc: 'Shakes' },
  { name: 'Iced Café Latte',        price: 110, desc: 'Coffee' },
  { name: 'Americano',              price: 120, desc: 'Coffee' },
  { name: 'Ampalaya Con Carne',     price: 300, desc: 'Vegetables' },
  { name: 'Banana Smoothie',        price: 180, desc: 'Smoothies' },
  { name: 'Beef Steak',             price: 100, desc: 'Mains' },
  { name: 'Blueberry Cheesecake',   price: 185, desc: 'Pastries' },
  { name: 'Butter Almond Frappe',   price: 180, desc: 'Frappe' },
  { name: 'Buttered Veggies',       price: 250, desc: 'Vegetables' },
  { name: 'Cafe Latte',             price: 150, desc: 'Coffee' },
  { name: 'Chicken Buffalo Wings',  price: 350, desc: 'Chicken' },
  { name: 'Cappuccino',             price: 150, desc: 'Coffee' },
  { name: 'Espresso',               price: 100, desc: 'Coffee' },
]

const products = ref([...fallbackRestaurant])
const showCustomizationModal = ref(false)
const pendingCustomItem = ref(null)
const customizationSizeOptions = ref([...DEFAULT_SIZE_OPTIONS])
const customizationAddOnOptions = ref([...DEFAULT_ADDON_OPTIONS])
const customizationForm = ref({
  sizeId: 'regular',
  selectedAddOnIds: [],
  specialRequest: ''
})

const totalItems = computed(() => cart.value.reduce((s, i) => s + i.qty, 0))
const cartTotal  = computed(() => cart.value.reduce((s, i) => s + i.price * i.qty, 0))

const filteredProducts = computed(() => {
  if (!searchQuery.value) return products.value
  const q = searchQuery.value.toLowerCase()
  return products.value.filter(p => p.name.toLowerCase().includes(q) || p.desc.toLowerCase().includes(q))
})

const groupedProducts = computed(() => {
  const g = {}
  filteredProducts.value.forEach(p => { const t = p.desc || 'Other'; if (!g[t]) g[t] = []; g[t].push(p) })
  return Object.keys(g).map(type => ({ type, items: g[type] }))
})

const sortedGroups = computed(() => [...groupedProducts.value].sort((a, b) => b.items.length - a.items.length))
const selectedCustomizationSize = computed(() =>
  customizationSizeOptions.value.find(s => s.id === customizationForm.value.sizeId) || customizationSizeOptions.value[0]
)
const selectedCustomizationAddOns = computed(() => {
  const selected = new Set(customizationForm.value.selectedAddOnIds || [])
  return customizationAddOnOptions.value.filter(addon => selected.has(addon.id))
})
const customizationExtraAmount = computed(() => {
  const sizeExtra = Number(selectedCustomizationSize.value?.priceDelta || 0)
  const addOnsExtra = selectedCustomizationAddOns.value.reduce((sum, addon) => sum + Number(addon.price || 0), 0)
  return sizeExtra + addOnsExtra
})
const customizedItemUnitPrice = computed(() => Number(pendingCustomItem.value?.price || 0) + customizationExtraAmount.value)

const goToStage     = (s) => { currentStage.value = s; window.scrollTo({ top: 0, behavior: 'smooth' }) }
const previousStage = ()  => currentStage.value > 1 && goToStage(currentStage.value - 1)
const proceedToCart = ()  => { if (!cart.value.length) return alert('Add items first'); goToStage(2) }
const proceedToCheckout = () => { if (!cart.value.length) return alert('Cart is empty'); goToStage(3) }

const isProductAdded = (name) => addedProducts.value.has(name)

const normalizeSizeOptions = (rawSizes) => {
  if (!Array.isArray(rawSizes) || rawSizes.length === 0) return [...DEFAULT_SIZE_OPTIONS]
  return rawSizes.map((size, index) => {
    const label = String(size?.label || size?.name || `Option ${index + 1}`).trim()
    const id = String(size?.id || label || `size-${index + 1}`).trim().toLowerCase().replace(/\s+/g, '-')
    return {
      id,
      label,
      priceDelta: Number(size?.priceDelta ?? size?.price ?? 0)
    }
  })
}

const normalizeAddOnOptions = (rawAddons) => {
  if (!Array.isArray(rawAddons) || rawAddons.length === 0) return [...DEFAULT_ADDON_OPTIONS]
  return rawAddons.map((addon, index) => {
    const name = String(addon?.name || addon?.label || `Add-on ${index + 1}`).trim()
    const id = String(addon?.id || name || `addon-${index + 1}`).trim().toLowerCase().replace(/\s+/g, '-')
    return {
      id,
      name,
      price: Number(addon?.price ?? addon?.amount ?? 0)
    }
  })
}

const openCustomizationModal = (product) => {
  pendingCustomItem.value = {
    name: product.name,
    price: Number(product.price || 0),
    desc: product.desc || ''
  }
  customizationSizeOptions.value = normalizeSizeOptions(product.sizes)
  customizationAddOnOptions.value = normalizeAddOnOptions(product.addons)
  customizationForm.value = {
    sizeId: customizationSizeOptions.value[0]?.id || 'regular',
    selectedAddOnIds: [],
    specialRequest: ''
  }
  showCustomizationModal.value = true
}

const closeCustomizationModal = () => {
  showCustomizationModal.value = false
  pendingCustomItem.value = null
}

const confirmCustomization = () => {
  if (!pendingCustomItem.value) return
  const customPayload = {
    sizeId: selectedCustomizationSize.value?.id || 'regular',
    sizeLabel: selectedCustomizationSize.value?.label || 'Regular',
    sizePriceDelta: Number(selectedCustomizationSize.value?.priceDelta || 0),
    addOns: selectedCustomizationAddOns.value.map(addon => ({ id: addon.id, name: addon.name, price: Number(addon.price || 0) })),
    specialRequest: String(customizationForm.value.specialRequest || '').trim()
  }
  addToCart(pendingCustomItem.value, customPayload)
  closeCustomizationModal()
}

const addToCart = (product, customization = null) => {
  const basePrice = Number(product.price || 0)
  const sizeExtra = Number(customization?.sizePriceDelta || 0)
  const addOnsExtra = Array.isArray(customization?.addOns)
    ? customization.addOns.reduce((sum, addon) => sum + Number(addon.price || 0), 0)
    : 0
  const unitPrice = basePrice + sizeExtra + addOnsExtra

  const signature = customization
    ? JSON.stringify({
      sizeId: customization.sizeId || 'regular',
      addOns: (customization.addOns || []).map(addon => addon.id).sort(),
      specialRequest: (customization.specialRequest || '').trim().toLowerCase()
    })
    : 'default'

  const ex = cart.value.find(i => i.name === product.name && (i.customizationSignature || 'default') === signature)
  if (ex) ex.qty++
  else {
    cart.value.push({
      ...product,
      price: unitPrice,
      basePrice,
      qty: 1,
      customization: customization || null,
      customizationSignature: signature,
      cartKey: `${product.name}__${signature}`
    })
  }
  addedProducts.value.add(product.name)
  setTimeout(() => addedProducts.value.delete(product.name), 900)
}

const changeQty  = (idx, d) => { cart.value[idx].qty += d; if (cart.value[idx].qty <= 0) cart.value.splice(idx, 1) }
const removeItem = (idx)    => cart.value.splice(idx, 1)

const saveLocation = () => {
  if (currentLocType.value !== 'Day Guest' && !locationNumber.value.trim())
    return alert(`Please enter your ${currentLocType.value} number.`)
  locationSaved.value = true
  showLocationSaved.value = true
  setTimeout(() => showLocationSaved.value = false, 3000)
}

const placeOrder = async () => {
  if (!locationSaved.value) return alert('Set delivery location first')
  if (!cart.value.length)   return alert('Cart is empty')
  try {
    const res = await fetch(`${API_BASE}/eshop/order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cart: cart.value.map(i => ({ name: i.name, price: i.price, qty: i.qty })),
        locationType: currentLocType.value,
        locationNumber: locationNumber.value,
        deliveryNotes: locationNotes.value,
        totalAmount: cartTotal.value,
      }),
    })
    const result = await res.json()
    if (!res.ok) throw new Error(result.error || 'Failed')
    showToast.value = true
    cart.value = []; locationSaved.value = false
    locationNumber.value = ''; locationNotes.value = ''
    currentStage.value = 1
    setTimeout(() => showToast.value = false, 4000)
  } catch (e) { alert(`Failed: ${e.message}`) }
}

const fetchProducts = async () => {
  isLoading.value = true; loadError.value = ''
  try {
    const r = await fetch(`${API_BASE}/items/category/restaurant`)
    if (!r.ok) throw new Error('Failed')
    const data = await r.json()
    if (Array.isArray(data) && data.length)
      products.value = data.map(i => ({
        name: i.name || 'Unnamed',
        price: parseFloat(i.price) || 0,
        desc: i.description || 'Other',
        sizes: Array.isArray(i.sizes) ? i.sizes : [],
        addons: Array.isArray(i.addons) ? i.addons : []
      }))
  } catch { loadError.value = 'Unable to load menu.'; products.value = [...fallbackRestaurant] }
  finally { isLoading.value = false }
}

onMounted(fetchProducts)
</script>

<style scoped>
/* ── Design Tokens ──────────────────────────────────────────── */
:root {
  --color-primary:       #0369a1;
  --color-primary-light: #1F8DBF;
  --color-primary-dark:  #1E88B6;
  --color-gold:          #F4C400;
  --color-gold-dark:     #F2C200;
  --color-navy:          #0C3B5E;
  --color-white:         #FFFFFF;
  --color-gray-bg:       #f9fafb;
  --color-gray-border:   #e5e7eb;
  --color-text-dark:     #1f2937;
  --color-text-light:    #6b7280;
}

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

.eshop-container {
  font-family: 'Segoe UI', system-ui, sans-serif;
  background: #EEF5FB;
  min-height: 100vh;
  color: #1f2937;
}

/* ── Header ─────────────────────────────────────────────────── */
.eshop-header {
  background: linear-gradient(135deg, #0C3B5E 0%, #0369a1 60%, #1F8DBF 100%);
  padding: 0 1.5rem;
  height: 68px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  border-bottom: 3px solid #F4C400;
  box-shadow: 0 2px 16px rgba(12,59,94,0.35);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-brand { display: flex; align-items: center; gap: 0.65rem; }
.brand-icon   { font-size: 1.8rem; }

.header-title {
  font-size: 1.15rem;
  font-weight: 800;
  color: #fff;
  line-height: 1.1;
  white-space: nowrap;
}

.header-sub {
  font-size: 0.65rem;
  color: rgba(255,255,255,0.65);
  letter-spacing: 0.04em;
}

/* Stage tabs */
.stage-tabs-container {
  display: flex;
  align-items: center;
  gap: 4px;
  background: rgba(255,255,255,0.08);
  padding: 4px;
  border-radius: 50px;
}

.stage-tab-btn {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.42rem 0.85rem;
  border: none;
  border-radius: 50px;
  background: transparent;
  color: rgba(255,255,255,0.7);
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.stage-tab-btn:hover     { color: #fff; background: rgba(255,255,255,0.12); }
.stage-tab-btn.active    { background: #F4C400; color: #0C3B5E; }
.stage-tab-btn.completed { color: rgba(255,255,255,0.9); }

.stage-num {
  width: 20px; height: 20px;
  border-radius: 50%;
  background: rgba(255,255,255,0.18);
  display: flex; align-items: center; justify-content: center;
  font-size: 0.68rem; font-weight: 800; flex-shrink: 0;
  transition: background 0.2s;
}
.stage-tab-btn.active .stage-num    { background: #0C3B5E; color: #F4C400; }
.stage-tab-btn.completed .stage-num { background: rgba(255,255,255,0.28); }

/* Cart button */
.cart-header-btn {
  display: flex; align-items: center; gap: 0.5rem;
  padding: 0.48rem 1rem;
  background: rgba(255,255,255,0.12);
  border: 1.5px solid rgba(255,255,255,0.25);
  border-radius: 50px;
  color: #fff;
  font-size: 0.82rem; font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}
.cart-header-btn:hover,
.cart-header-btn.has-items { background: #F4C400; border-color: #F4C400; color: #0C3B5E; }

.cart-icon-wrap { position: relative; font-size: 0.95rem; display: flex; align-items: center; }

.cart-badge-header {
  position: absolute; top: -8px; right: -11px;
  background: #ef4444; color: #fff;
  width: 17px; height: 17px;
  border-radius: 50%;
  font-size: 0.58rem; font-weight: 800;
  display: flex; align-items: center; justify-content: center;
  border: 2px solid #0C3B5E;
  animation: badgePop 0.3s ease;
}

@keyframes badgePop {
  0%   { transform: scale(0); }
  70%  { transform: scale(1.2); }
  100% { transform: scale(1); }
}

/* ── Main Wrapper ───────────────────────────────────────────── */
.main-wrapper {
  max-width: 1100px;
  margin: 0 auto;
  padding: 1.5rem;
}

.stage-content { width: 100%; }

.stage-fade-enter-active, .stage-fade-leave-active { transition: opacity 0.2s ease, transform 0.2s ease; }
.stage-fade-enter-from { opacity: 0; transform: translateY(10px); }
.stage-fade-leave-to   { opacity: 0; transform: translateY(-6px); }

/* ── Menu Container — light blue per requirement ────────────── */
.menu-container {
  background: #eff6ff;
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(3,105,161,0.08);
  border: 1px solid #dbeafe;
}

/* White header bar lifts cleanly above the blue bg */
.menu-header {
  background: #fff;
  padding: 1rem 1.5rem;
  border-bottom: 2px solid #F4C400;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}

.menu-title-section { display: flex; align-items: center; gap: 0.75rem; }
.menu-emoji         { font-size: 1.5rem; }

.menu-title {
  font-size: 1.08rem; font-weight: 800; color: #0C3B5E; line-height: 1.2;
}
.menu-sub { font-size: 0.7rem; color: #6b7280; margin-top: 1px; }

/* Search */
.search-box  { position: relative; flex: 0 1 300px; }
.search-icon { position: absolute; left: 0.85rem; top: 50%; transform: translateY(-50%); color: #0369a1; font-size: 0.78rem; }

.search-input {
  width: 100%;
  padding: 0.52rem 2.2rem 0.52rem 2.35rem;
  border: 1.5px solid #dbeafe;
  border-radius: 50px;
  font-size: 0.83rem;
  background: #f0f7ff;
  color: #1f2937;
  transition: all 0.2s;
}
.search-input:focus { outline: none; border-color: #0369a1; background: #fff; box-shadow: 0 0 0 3px rgba(3,105,161,0.1); }

.search-clear {
  position: absolute; right: 0.7rem; top: 50%; transform: translateY(-50%);
  background: none; border: none; color: #9ca3af; font-size: 0.72rem; cursor: pointer;
  transition: color 0.15s;
}
.search-clear:hover { color: #0369a1; }

/* Products Section */
.products-section { padding: 1.25rem 1.5rem; }

/* ── State containers ───────────────────────────────────────── */
.state-container {
  text-align: center; padding: 3rem 1.5rem;
  display: flex; flex-direction: column; align-items: center; gap: 0.8rem;
}
.state-container.padded { padding: 2.5rem 1.5rem; }

.state-emoji   { font-size: 2.8rem; }
.state-heading { font-size: 1.1rem; font-weight: 700; color: #0C3B5E; }
.state-text    { font-size: 0.83rem; color: #6b7280; }

.resort-spinner { display: flex; gap: 5px; align-items: flex-end; height: 38px; margin-bottom: 0.4rem; }

.spinner-wave {
  width: 7px; background: #0369a1; border-radius: 4px;
  animation: waveAnim 0.9s ease-in-out infinite alternate;
}
.spinner-wave:nth-child(1) { height: 18px; }
.spinner-wave:nth-child(2) { height: 30px; }
.spinner-wave:nth-child(3) { height: 24px; }
.spinner-wave:nth-child(4) { height: 36px; }

@keyframes waveAnim {
  from { opacity: 0.4; transform: scaleY(0.6); }
  to   { opacity: 1;   transform: scaleY(1); }
}

.retry-btn {
  display: flex; align-items: center; gap: 0.4rem;
  padding: 0.52rem 1.1rem;
  background: #0369a1; color: #fff;
  border: none; border-radius: 50px;
  font-size: 0.82rem; font-weight: 600; cursor: pointer;
  transition: background 0.2s, transform 0.15s;
}
.retry-btn:hover { background: #0C3B5E; transform: translateY(-1px); }

/* ── Category blocks — clear divisions ──────────────────────── */
.categories-list { display: flex; flex-direction: column; gap: 1rem; }

/* Each category is a white card sitting on the light-blue background */
.category-block {
  background: #fff;
  border-radius: 10px;
  padding: 1.1rem 1.2rem;
  box-shadow: 0 1px 4px rgba(3,105,161,0.07);
  border: 1px solid #dbeafe;
}

/* Category heading row */
.category-heading {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  margin-bottom: 0.9rem;
  padding-bottom: 0.65rem;
  border-bottom: 1.5px solid #eff6ff;
}

/* Gold dot — accent that ties into the system palette */
.category-dot {
  width: 9px; height: 9px;
  border-radius: 50%;
  background: #F4C400;
  flex-shrink: 0;
}

.category-title {
  font-size: 0.9rem; font-weight: 800; color: #0C3B5E;
  flex: 1; letter-spacing: 0.01em;
}

.category-count {
  background: #eff6ff;
  color: #0369a1;
  padding: 0.1rem 0.5rem;
  border-radius: 50px;
  font-size: 0.68rem; font-weight: 700;
}

/* 2-column product grid */
.products-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.55rem;
}

/* Product card */
.product-card {
  background: #f9fafb;
  border: 1.5px solid #e5e7eb;
  border-radius: 8px;
  padding: 0.78rem;
  cursor: pointer;
  transition: border-color 0.2s, box-shadow 0.2s, transform 0.18s, background 0.2s;
}

.product-card:hover {
  border-color: #0369a1;
  background: #eff6ff;
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(3,105,161,0.1);
}

.product-card.is-added { border-color: #F4C400; background: #fffbeb; }

.product-body {
  display: flex; align-items: center;
  justify-content: space-between; gap: 0.7rem;
}

.product-info { flex: 1; min-width: 0; }

.product-name {
  font-size: 0.85rem; font-weight: 700; color: #1f2937;
  line-height: 1.3; margin-bottom: 0.15rem;
}

.product-cat { font-size: 0.68rem; color: #6b7280; }

.product-right {
  display: flex; flex-direction: column; align-items: flex-end;
  gap: 0.42rem; flex-shrink: 0;
}

.product-price {
  font-size: 0.9rem; font-weight: 800; color: #0369a1; white-space: nowrap;
}

.add-btn {
  width: 27px; height: 27px;
  border-radius: 50%;
  background: #0369a1; color: #fff;
  border: none; font-size: 0.7rem; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: all 0.2s;
}
.add-btn:hover { background: #0C3B5E; transform: scale(1.12); }
.add-btn.added { background: #F4C400; color: #0C3B5E; transform: scale(1.1); }

/* ── Panel Container (Cart + Checkout) ──────────────────────── */
.panel-container {
  background: #fff;
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(3,105,161,0.08);
  border: 1px solid #e5e7eb;
  max-width: 900px;
  margin: 0 auto;
}

.panel-header {
  padding: 1.1rem 1.5rem;
  border-bottom: 2px solid #F4C400;
  background: #fff;
}

.navy-header { background: linear-gradient(135deg, #0C3B5E 0%, #0369a1 100%); }

.panel-title-wrap { display: flex; align-items: center; gap: 0.85rem; }

.panel-icon  { font-size: 1.3rem; color: #0369a1; }
.gold-icon   { color: #F4C400 !important; }

.panel-title { font-size: 1.08rem; font-weight: 800; color: #0C3B5E; }
.white-title { color: #fff; }
.panel-sub   { font-size: 0.72rem; color: #6b7280; margin-top: 1px; }
.light-sub   { color: rgba(255,255,255,0.65); }

/* ── Cart Body ──────────────────────────────────────────────── */
.cart-body { padding: 1.25rem 1.5rem; display: flex; flex-direction: column; gap: 1.1rem; }

.cart-items-wrap { max-height: 400px; overflow-y: auto; padding-right: 2px; }
.cart-items-wrap::-webkit-scrollbar { width: 4px; }
.cart-items-wrap::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 4px; }

.cart-items-list { display: flex; flex-direction: column; gap: 0.6rem; }

.cart-item {
  display: flex; align-items: center; gap: 0.8rem;
  padding: 0.78rem 1rem;
  background: #f9fafb;
  border: 1.5px solid #e5e7eb;
  border-radius: 9px;
  transition: border-color 0.2s, background 0.2s;
}
.cart-item:hover { border-color: #bfdbfe; background: #eff6ff; }

.ci-avatar {
  width: 36px; height: 36px; border-radius: 9px;
  background: linear-gradient(135deg, #0369a1, #1F8DBF);
  color: #fff; display: flex; align-items: center; justify-content: center;
  font-weight: 800; font-size: 0.95rem; flex-shrink: 0;
}

.ci-info { flex: 1; min-width: 0; }
.ci-name { font-size: 0.84rem; font-weight: 700; color: #1f2937; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.ci-unit { font-size: 0.7rem; color: #6b7280; margin-top: 1px; }

.ci-controls {
  display: flex; align-items: center; gap: 0.32rem;
  background: #fff; border: 1.5px solid #e5e7eb;
  border-radius: 50px; padding: 0.26rem 0.48rem;
}

.qty-btn {
  background: none; border: none; color: #0369a1;
  font-size: 0.58rem; cursor: pointer; padding: 0.18rem 0.3rem;
  border-radius: 4px; display: flex; align-items: center;
  transition: color 0.15s, background 0.15s;
}
.qty-btn:hover { background: #eff6ff; color: #0C3B5E; }

.qty-val { font-size: 0.82rem; font-weight: 700; color: #0C3B5E; min-width: 20px; text-align: center; }

.ci-total { font-size: 0.86rem; font-weight: 800; color: #0369a1; min-width: 60px; text-align: right; flex-shrink: 0; }

.ci-remove {
  background: none; border: none; color: #d1d5db;
  font-size: 0.7rem; cursor: pointer; padding: 0.26rem; border-radius: 5px;
  transition: color 0.15s, background 0.15s;
}
.ci-remove:hover { color: #ef4444; background: #fee2e2; }

/* Cart item animations */
.cart-item-anim-enter-active { transition: all 0.25s ease; }
.cart-item-anim-leave-active  { transition: all 0.2s ease; }
.cart-item-anim-enter-from    { opacity: 0; transform: translateX(-14px); }
.cart-item-anim-leave-to      { opacity: 0; transform: translateX(14px); }

/* Order summary card */
.order-summary-card {
  background: #f9fafb; border: 1.5px solid #e5e7eb; border-radius: 9px; padding: 1rem 1.2rem;
}

.summary-title { font-size: 0.88rem; font-weight: 700; color: #0C3B5E; margin-bottom: 0.8rem; }
.summary-lines { display: flex; flex-direction: column; gap: 0.48rem; }

.summary-line  { display: flex; justify-content: space-between; font-size: 0.83rem; color: #6b7280; }
.summary-val   { font-weight: 700; color: #0369a1; }
.summary-free  { font-weight: 700; color: #10b981; }
.summary-divider { height: 1px; background: #e5e7eb; margin: 0.3rem 0; }
.total-line    { font-size: 0.92rem; font-weight: 700; color: #0C3B5E; }
.summary-total { font-size: 1.12rem; font-weight: 800; color: #0369a1; }

/* ── Checkout ───────────────────────────────────────────────── */
.checkout-body { padding: 1.5rem; }

.checkout-cols {
  display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; margin-bottom: 1.25rem;
}

.checkout-col { display: flex; flex-direction: column; gap: 1rem; }

.checkout-card {
  background: #f9fafb; border: 1.5px solid #e5e7eb; border-radius: 10px; padding: 1.1rem 1.2rem;
}

.card-title {
  font-size: 0.88rem; font-weight: 700; color: #0C3B5E; margin-bottom: 1rem;
  display: flex; align-items: center; gap: 0.4rem;
}

.card-icon { font-size: 0.95rem; }

.loc-type-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.6rem; margin-bottom: 0.9rem; }

.loc-card {
  background: #fff; border: 1.5px solid #e5e7eb; border-radius: 9px;
  padding: 0.85rem 0.7rem; text-align: center; cursor: pointer;
  position: relative; transition: all 0.2s;
}
.loc-card:hover    { border-color: #0369a1; background: #eff6ff; }
.loc-card.selected { border-color: #0369a1; background: #eff6ff; box-shadow: 0 0 0 3px rgba(3,105,161,0.1); }

.loc-emoji { display: block; font-size: 1.65rem; margin-bottom: 0.35rem; }
.loc-name  { font-size: 0.78rem; font-weight: 700; color: #0C3B5E; }

.loc-check {
  position: absolute; top: 5px; right: 7px;
  width: 17px; height: 17px; background: #0369a1; border-radius: 50%;
  color: #fff; font-size: 0.55rem;
  display: flex; align-items: center; justify-content: center;
}

.form-field   { margin-bottom: 0.8rem; }
.field-label  { display: block; font-size: 0.76rem; font-weight: 700; color: #0C3B5E; margin-bottom: 0.38rem; }
.req { color: #ef4444; margin-left: 2px; }
.opt { font-weight: 400; color: #9ca3af; font-size: 0.7rem; }

.input-wrap  { position: relative; }
.input-icon  { position: absolute; left: 0.8rem; top: 50%; transform: translateY(-50%); color: #0369a1; font-size: 0.72rem; }
.ta-icon     { top: 0.85rem; transform: none; }

.field-input, .field-textarea {
  width: 100%;
  padding: 0.62rem 0.85rem 0.62rem 2.3rem;
  border: 1.5px solid #e5e7eb; border-radius: 8px;
  font-size: 0.83rem; background: #fff; color: #1f2937; font-family: inherit;
  transition: border-color 0.2s, box-shadow 0.2s;
}
.field-input:focus, .field-textarea:focus { outline: none; border-color: #0369a1; box-shadow: 0 0 0 3px rgba(3,105,161,0.1); }
.field-textarea { resize: vertical; }

.confirm-loc-btn {
  width: 100%; padding: 0.72rem; background: #0369a1; color: #fff;
  border: none; border-radius: 8px; font-size: 0.83rem; font-weight: 700;
  cursor: pointer; display: flex; align-items: center; justify-content: center;
  gap: 0.5rem; transition: all 0.2s;
}
.confirm-loc-btn:hover { background: #0C3B5E; transform: translateY(-1px); }
.confirm-loc-btn.saved { background: #059669; }

.success-inline {
  margin-top: 0.6rem; padding: 0.5rem 0.8rem;
  background: #d1fae5; border-radius: 6px;
  font-size: 0.76rem; font-weight: 600; color: #065f46;
  display: flex; align-items: center; gap: 0.4rem;
}

.pop-in-enter-active { animation: popIn 0.22s ease; }
.pop-in-leave-active { animation: popIn 0.18s ease reverse; }
@keyframes popIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }

.info-card {
  background: #eff6ff; border-left: 3px solid #F4C400;
  border-radius: 0 8px 8px 0; padding: 0.8rem 1rem;
  display: flex; flex-direction: column; gap: 0.5rem;
}
.info-row { display: flex; align-items: center; gap: 0.6rem; font-size: 0.78rem; color: #0C3B5E; }
.info-ic  { color: #0369a1; font-size: 0.75rem; width: 14px; flex-shrink: 0; }

.warning-card {
  background: #fffbeb; border: 1.5px solid #fde68a; border-radius: 8px;
  padding: 0.8rem 0.95rem; font-size: 0.78rem; color: #92400e; font-weight: 600;
  display: flex; align-items: center; gap: 0.55rem;
}

/* Order items list */
.order-items {
  background: #fff; border-radius: 8px; padding: 0.45rem;
  margin-bottom: 0.8rem; max-height: 200px; overflow-y: auto;
  border: 1px solid #e5e7eb;
}
.order-items::-webkit-scrollbar { width: 4px; }
.order-items::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 4px; }

.oi-row {
  display: flex; align-items: center; gap: 0.5rem;
  padding: 0.48rem 0.65rem; border-radius: 6px; transition: background 0.15s;
}
.oi-row:hover { background: #f9fafb; }

.oi-name  { flex: 1; font-size: 0.8rem; font-weight: 600; color: #1f2937; }
.oi-qty   { font-size: 0.72rem; color: #6b7280; min-width: 34px; text-align: center; }
.oi-price { font-size: 0.8rem; font-weight: 700; color: #0369a1; min-width: 58px; text-align: right; }

.order-totals { border-top: 1px solid #e5e7eb; padding-top: 0.7rem; display: flex; flex-direction: column; gap: 0.45rem; }

.total-row  { display: flex; justify-content: space-between; font-size: 0.8rem; color: #6b7280; }
.tv         { font-weight: 600; color: #0369a1; }
.free-green { color: #059669 !important; }
.total-divider { height: 1px; background: #e5e7eb; margin: 0.15rem 0; }
.final-row  { font-size: 0.92rem; font-weight: 700; color: #0C3B5E; }
.final-val  { font-size: 1.1rem; font-weight: 800; color: #0369a1; }

/* ── Buttons ────────────────────────────────────────────────── */
.nav-btns { display: flex; gap: 0.8rem; }
.mt-sm    { margin-top: 0.5rem; }

.ghost-btn {
  display: flex; align-items: center; gap: 0.45rem;
  padding: 0.7rem 1.15rem;
  background: #fff; border: 1.5px solid #e5e7eb; border-radius: 8px;
  color: #6b7280; font-size: 0.83rem; font-weight: 600; cursor: pointer;
  transition: all 0.2s;
}
.ghost-btn:hover { border-color: #0369a1; color: #0369a1; background: #eff6ff; transform: translateX(-2px); }

.primary-btn {
  flex: 1; display: flex; align-items: center; justify-content: center; gap: 0.45rem;
  padding: 0.7rem 1.4rem;
  background: #0369a1; color: #fff; border: none; border-radius: 8px;
  font-size: 0.85rem; font-weight: 700; cursor: pointer; transition: all 0.2s;
}
.primary-btn:hover { background: #0C3B5E; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(3,105,161,0.22); }

.submit-btn {
  flex: 1; display: flex; align-items: center; justify-content: center; gap: 0.5rem;
  padding: 0.75rem 1.4rem;
  background: #9ca3af; color: #fff; border: none; border-radius: 8px;
  font-size: 0.85rem; font-weight: 700; cursor: not-allowed; transition: all 0.25s;
}
.submit-btn.ready { background: #F4C400; color: #0C3B5E; cursor: pointer; }
.submit-btn.ready:hover { background: #F2C200; transform: translateY(-1px); box-shadow: 0 4px 14px rgba(244,196,0,0.3); }

/* ── Global Toast ───────────────────────────────────────────── */
.global-toast {
  position: fixed; top: 80px; left: 50%; transform: translateX(-50%);
  background: #fff; border: 2px solid #F4C400; border-radius: 50px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.12); z-index: 1000;
}

.toast-inner { display: flex; align-items: center; gap: 0.8rem; padding: 0.7rem 1.35rem; }
.toast-emoji { font-size: 1.45rem; }
.toast-inner strong { display: block; font-size: 0.88rem; color: #0C3B5E; font-weight: 800; }
.toast-inner span   { font-size: 0.72rem; color: #6b7280; }

.toast-slide-enter-active { animation: toastIn 0.32s cubic-bezier(0.34, 1.56, 0.64, 1); }
.toast-slide-leave-active  { animation: toastIn 0.22s ease reverse; }
@keyframes toastIn {
  from { opacity: 0; transform: translateX(-50%) translateY(-14px); }
  to   { opacity: 1; transform: translateX(-50%) translateY(0); }
}

/* ── Floating Cart FAB ──────────────────────────────────────── */
.fab-cart {
  position: fixed; bottom: 1.5rem; right: 1.5rem;
  display: flex; align-items: center; gap: 0.6rem;
  padding: 0.72rem 1.2rem 0.72rem 0.95rem;
  background: #0C3B5E; color: #fff;
  border: 2px solid #F4C400; border-radius: 50px;
  box-shadow: 0 6px 20px rgba(12,59,94,0.38);
  cursor: pointer; font-size: 0.85rem; font-weight: 700; z-index: 999;
  transition: all 0.22s;
}
.fab-cart:hover { background: #F4C400; color: #0C3B5E; border-color: #0C3B5E; transform: translateY(-2px); box-shadow: 0 8px 22px rgba(244,196,0,0.3); }

.fab-badge {
  background: #ef4444; color: #fff;
  width: 20px; height: 20px; border-radius: 50%;
  font-size: 0.68rem; font-weight: 800;
  display: flex; align-items: center; justify-content: center;
}

.fab-label { white-space: nowrap; }

.fab-pop-enter-active { animation: fabIn 0.32s cubic-bezier(0.34, 1.56, 0.64, 1); }
.fab-pop-leave-active  { animation: fabIn 0.2s ease reverse; }
@keyframes fabIn { from { opacity: 0; transform: scale(0.7) translateY(18px); } to { opacity: 1; transform: scale(1) translateY(0); } }

/* ── Item Customization Modal ───────────────────────────────── */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(12, 59, 94, 0.58);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1200;
  padding: 1rem;
}

.modal-box {
  width: min(680px, 100%);
  max-height: 90vh;
  overflow: auto;
  background: #fff;
  border-radius: 14px;
  box-shadow: 0 14px 42px rgba(12, 59, 94, 0.28);
  border: 1px solid #dbeafe;
}

.modal-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.9rem 1rem;
  border-bottom: 2px solid #f4c400;
  background: #0c3b5e;
}

.modal-head-left { display: flex; align-items: center; gap: 0.7rem; }
.modal-head-icon {
  width: 34px;
  height: 34px;
  border-radius: 9px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.14);
  color: #fff;
}
.modal-head-icon--gold { color: #f4c400; }
.modal-title { color: #fff; font-size: 0.95rem; font-weight: 800; }
.modal-sub { color: rgba(255, 255, 255, 0.7); font-size: 0.72rem; }

.modal-close-btn {
  border: none;
  background: rgba(255, 255, 255, 0.12);
  color: #fff;
  width: 30px;
  height: 30px;
  border-radius: 8px;
  cursor: pointer;
}

.modal-body { padding: 1rem; display: flex; flex-direction: column; gap: 0.9rem; }
.modal-section {
  background: #eff6ff;
  border: 1px solid #dbeafe;
  border-radius: 10px;
  padding: 0.85rem;
}
.modal-section-title {
  color: #0c3b5e;
  font-size: 0.8rem;
  font-weight: 800;
  margin-bottom: 0.65rem;
  display: flex;
  align-items: center;
  gap: 0.45rem;
}

.customize-chip-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 0.55rem;
}

.customize-chip {
  border: 1.5px solid #dbeafe;
  background: #fff;
  border-radius: 10px;
  padding: 0.65rem;
  text-align: left;
  color: #0c3b5e;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  font-size: 0.82rem;
  font-weight: 700;
}
.customize-chip small { color: #64748b; font-size: 0.74rem; }
.customize-chip--active {
  border-color: #0369a1;
  background: #e0f2fe;
  box-shadow: 0 0 0 2px rgba(3, 105, 161, 0.14);
}

.customize-addon-list { display: flex; flex-direction: column; gap: 0.45rem; }
.customize-addon-item {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 0.55rem;
  align-items: center;
  background: #fff;
  border: 1px solid #dbeafe;
  border-radius: 8px;
  padding: 0.5rem 0.65rem;
  font-size: 0.8rem;
}
.customize-addon-item strong { color: #0369a1; }
.customize-addon-list--disabled {
  background: #fff;
  border: 1px dashed #cbd5e1;
  border-radius: 8px;
  padding: 0.7rem;
}
.customize-addon-empty { font-size: 0.76rem; color: #64748b; }

.detail-row { display: flex; justify-content: space-between; font-size: 0.8rem; color: #64748b; }
.detail-row + .detail-row { margin-top: 0.35rem; }
.detail-row--total {
  margin-top: 0.55rem;
  padding-top: 0.55rem;
  border-top: 1px solid #dbeafe;
  font-weight: 800;
  color: #0c3b5e;
}
.detail-total { color: #0369a1; font-size: 1.18rem; }

.modal-foot {
  display: flex;
  justify-content: flex-end;
  gap: 0.55rem;
  padding: 0.85rem 1rem;
  border-top: 1px solid #dbeafe;
}

.ci-meta {
  margin-top: 0.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.14rem;
  font-size: 0.66rem;
  color: #64748b;
}

/* ── Responsive ─────────────────────────────────────────────── */
@media (max-width: 768px) {
  .eshop-header { height: auto; padding: 0.7rem 1rem; flex-wrap: wrap; gap: 0.7rem; }
  .stage-tabs-container { order: 3; width: 100%; }
  .stage-label { display: none; }
  .main-wrapper { padding: 1rem; }
  .products-grid { grid-template-columns: 1fr; }
  .checkout-cols { grid-template-columns: 1fr; }
  .nav-btns { flex-direction: column; }
  .ghost-btn { justify-content: center; }
  .fab-label { display: none; }
  .fab-cart  { padding: 0.85rem; border-radius: 50%; }
  .modal-box { width: 100%; max-height: 94vh; }
}

@media (max-width: 480px) {
  .header-title   { font-size: 1rem; }
  .header-sub     { display: none; }
  .cart-btn-label { display: none; }
}
</style>