<template>
  <div class="admin-layout" :class="{ 'pos-fullscreen': isFullscreen }">

    <AdminSidebar
      v-if="!isFullscreen"
      :is-open="sidebarOpen"
      :is-collapsed="sidebarCollapsed"
      @close="sidebarOpen = false"
    />

    <main class="main-content" :class="{ shifted: sidebarCollapsed && !isFullscreen, 'main-content--fullscreen': isFullscreen }">

      <AdminHeader
        :pos-mode="true"
        :categories="visibleCategories"
        :current-category="currentCategory"
        v-model:searchQuery="searchQuery"
        :eshop-pending-count="eshopPendingCount"
        :show-transaction="showTransaction"
        :is-fullscreen="isFullscreen"
        :user-name="auth.user?.name || 'Admin'"
        @toggle-sidebar="sidebarOpen = !sidebarOpen"
        @search="filterItems"
        @scan="openScanner"
        @category-change="showCategory"
        @toggle-transaction="toggleTransaction"
        @toggle-fullscreen="toggleFullscreen"
      />

      <QRCheckInScanner
        :is-open="isCheckinScannerOpen"
        @close="isCheckinScannerOpen = false"
        @check-in-success="handleCheckInSuccess"
      />

      <div class="pos-container">

        <!-- ══ POS VIEW ══ -->
        <div v-show="!showTransaction" class="pos-section">
          <div class="pos-grid">

            <!-- ── Items Panel ── -->
            <div class="items-panel">

              <!-- Panel header -->
              <div class="panel-header">
                <div class="panel-header-left">
                  <div class="panel-icon"><i class="fas fa-th"></i></div>
                  <div>
                    <div class="panel-title">Menu Items</div>
                    <div class="panel-sub">Select items to add to cart</div>
                  </div>
                </div>
              </div>

              <!-- Restaurant type filters -->
              <div
                v-if="currentCategory === 'restaurant' && restaurantTypeFilters.length > 0"
                class="filter-strip"
              >
                <button
                  type="button"
                  @click="restaurantTypeFilter = 'all'; showMoreFilters = false"
                  :class="['filter-chip', restaurantTypeFilter === 'all' ? 'chip--active' : 'chip--idle']"
                >All</button>

                <button
                  v-for="f in visibleFilters" :key="f"
                  type="button"
                  @click="restaurantTypeFilter = f; showMoreFilters = false"
                  :class="['filter-chip', restaurantTypeFilter === f ? 'chip--active' : 'chip--idle']"
                >{{ f }}</button>

                <div v-if="overflowFilters.length > 0" class="more-wrap">
                  <button
                    type="button"
                    :class="['filter-chip chip--more', (showMoreFilters || overflowFilters.includes(restaurantTypeFilter)) ? 'chip--active' : 'chip--idle']"
                    @click.stop="showMoreFilters = !showMoreFilters"
                  >
                    {{ overflowFilters.includes(restaurantTypeFilter) ? restaurantTypeFilter : 'More' }}
                    <i :class="showMoreFilters ? 'fas fa-chevron-up' : 'fas fa-chevron-down'" class="more-arrow"></i>
                  </button>
                  <div v-if="showMoreFilters" class="more-dropdown" @click.stop>
                    <button
                      v-for="f in overflowFilters" :key="f"
                      type="button"
                      :class="['more-item', restaurantTypeFilter === f ? 'more-item--active' : '']"
                      @click="restaurantTypeFilter = f; showMoreFilters = false"
                    >{{ f }}</button>
                  </div>
                </div>
              </div>

              <!-- Items scrollable area -->
              <div class="items-body">
                <div
                  v-for="category in visibleCategories"
                  :key="`items-${category.id}`"
                  v-show="currentCategory === category.id"
                >
                  <!-- Flat grid (always) -->
                  <div v-if="getFilteredItems(category.items, category.id).length === 0" class="items-no-results">
                    <i class="fas fa-search"></i>
                    <p>No items match "<strong>{{ searchQuery }}</strong>"</p>
                  </div>
                  <div v-else class="items-grid">
                    <button
                      v-for="item in getFilteredItems(category.items, category.id)"
                      :key="item.name"
                      @click="handleItemClick(item, category.id)"
                      class="item-card"
                    >
                      <div class="item-card-icon">
                        <i :class="`fas fa-${category.id === 'rooms' ? 'bed' : category.id === 'cottage' ? 'home' : category.id === 'event' ? 'calendar-alt' : 'utensils'}`"></i>
                      </div>
                      <div class="item-card-name">{{ item.name }}</div>
                      <div class="item-card-price">₱{{ item.price.toLocaleString() }}</div>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- ── Cart Panel ── -->
            <div class="cart-panel">

              <!-- Cart Header -->
              <div class="cart-header">
                <div class="cart-header-left">
                  <div class="cart-header-icon"><i class="fas fa-receipt"></i></div>
                  <div>
                    <div class="cart-header-title">Current Order</div>
                    <div class="cart-header-sub">{{ cart.length }} item{{ cart.length !== 1 ? 's' : '' }}</div>
                  </div>
                </div>
                <button @click="clearCart" class="cart-clear-btn" title="Clear cart">
                  <i class="fas fa-trash-alt"></i>
                </button>
              </div>

              <!-- Cart Items -->
              <div class="cart-items-scroll">
                <div v-if="cart.length === 0" class="cart-empty">
                  <div class="cart-empty-icon"><i class="fas fa-shopping-basket"></i></div>
                  <p>No items yet</p>
                  <span>Tap an item on the left to add it here</span>
                </div>

                <div v-else class="cart-list">
                  <div
                    v-for="(item, index) in cart"
                    :key="index"
                    class="cart-row"
                  >
                    <div class="cart-row-left">
                      <div class="cart-row-name">{{ item.name }}</div>
                      <div v-if="item.isBooking" class="cart-row-meta">
                        <span><i class="fas fa-user"></i> {{ item.firstName }} {{ item.lastName }}</span>
                        <span><i class="fas fa-calendar-alt"></i> {{ item.checkIn }} – {{ item.checkOut }}</span>
                        <span v-if="item.nights"><i class="fas fa-moon"></i> {{ item.nights }} night{{ item.nights > 1 ? 's' : '' }}</span>
                        <span v-if="item.totalDiscount > 0"><i class="fas fa-tag"></i> Discount: -₱{{ Number(item.totalDiscount || 0).toLocaleString() }}</span>
                        <span v-if="item.promoCode"><i class="fas fa-ticket-alt"></i> Promo: {{ item.promoCode }}</span>
                      </div>
                      <div v-else-if="item.customization" class="cart-row-meta">
                        <span class="cart-row-qty-inline">× {{ item.qty }}</span>
                        <span><i class="fas fa-ruler-combined"></i> Size: {{ item.customization.sizeLabel }}</span>
                        <span v-if="item.customization.addOns?.length"><i class="fas fa-plus-circle"></i> Add-ons: {{ item.customization.addOns.map(a => a.name).join(', ') }}</span>
                        <span v-if="item.customization.specialRequest"><i class="fas fa-sticky-note"></i> {{ item.customization.specialRequest }}</span>
                      </div>
                      <div v-else class="cart-row-qty">× {{ item.qty }}</div>
                    </div>
                    <div class="cart-row-right">
                      <span class="cart-row-price">₱{{ item.price.toLocaleString() }}</span>
                      <button @click="removeItem(index)" class="cart-row-remove">
                        <i class="fas fa-times"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Cart Footer -->
              <div class="cart-footer">

                <!-- Total bar -->
                <div class="total-bar">
                  <span class="total-label">Total</span>
                  <span class="total-amount">₱{{ total.toLocaleString() }}</span>
                </div>

                <!-- Checkout -->
                <button @click="openPaymentPanel" class="checkout-btn" :disabled="cart.length === 0">
                  <i class="fas fa-check-circle"></i>
                  <span>Payment</span>
                </button>

              </div>
            </div>

          </div>
        </div>

        <!-- ══ TRANSACTION HISTORY ══ -->
        <div v-show="showTransaction" class="trans-section">

          <div class="trans-header">
            <div class="trans-header-left">
              <div class="panel-icon"><i class="fas fa-history"></i></div>
              <div>
                <div class="panel-title">POS Transaction History</div>
                <div class="panel-sub">
                  {{ filteredTransactionHistory.length }} transaction{{ filteredTransactionHistory.length !== 1 ? 's' : '' }}
                  <span v-if="filteredTransactionHistory.length > 0">
                    • Page {{ currentTransactionPage }} of {{ totalTransactionPages }}
                  </span>
                </div>
              </div>
            </div>
            <div class="trans-actions">
              <button @click="openTransactionsExportPreview" class="btn-export">
                <i class="fas fa-file-excel"></i> Export Excel
              </button>
              <button @click="returnToPOS" class="btn-returnpos">
                <i class="fas fa-arrow-left"></i> Back to POS
              </button>
            </div>
          </div>

          <div class="trans-table-wrap">
            <table class="trans-table">
              <thead>
                <tr>
                  <th>Receipt</th>
                  <th>Items</th>
                  <th>Type</th>
                  <th>Payment</th>
                  <th>Amount</th>
                  <th>Date & Time</th>
                  <th class="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="filteredTransactionHistory.length === 0">
                  <td colspan="7">
                    <div class="trans-empty">
                      <div class="empty-icon-wrap"><i class="fas fa-inbox"></i></div>
                      <p class="empty-title">No transactions yet</p>
                      <p class="empty-sub">Completed transactions will appear here.</p>
                    </div>
                  </td>
                </tr>
                <tr
                  v-else
                  v-for="trans in paginatedTransactionHistory"
                  :key="trans.receiptNo"
                  :class="['trans-row', trans.source === 'eshop' && !viewedTransactions.has(trans.receiptNo) ? 'trans-row--new' : '']"
                >
                  <td>
                    <div class="receipt-cell">
                      <span class="receipt-no">POS-{{ trans.receiptNo }}</span>
                      <span v-if="trans.source === 'eshop' && !viewedTransactions.has(trans.receiptNo)" class="new-badge">
                        NEW
                      </span>
                    </div>
                  </td>
                  <td>
                    <div class="items-preview">{{ getItemsPreview(trans.items) }}</div>
                    <button @click="viewDetails(trans.receiptNo)" class="view-btn">
                      <i class="fas fa-eye"></i> View Details
                    </button>
                  </td>
                  <td><span class="type-pill">{{ trans.type }}</span></td>
                  <td>
                    <span :class="['pay-badge', trans.payment === 'GCash' ? 'pay-badge--gcash' : 'pay-badge--cash']">
                      {{ trans.payment }}
                    </span>
                  </td>
                  <td class="amount-cell">₱{{ trans.total.toLocaleString() }}</td>
                  <td>
                    <div class="date-cell">{{ trans.date }}</div>
                    <div class="time-cell">{{ trans.time }}</div>
                  </td>
                  <td>
                    <div class="tbl-acts">
                      <button @click="printReceipt(trans.receiptNo)" class="tbl-btn tbl-btn--print" title="Print"><i class="fas fa-print"></i></button>
                      <button @click="downloadReceipt(trans.receiptNo)" class="tbl-btn tbl-btn--dl" title="Download"><i class="fas fa-download"></i></button>
                      <button @click="customizeReceipt(trans.receiptNo)" class="tbl-btn tbl-btn--cust" title="Customize"><i class="fas fa-palette"></i></button>
                      <button @click="deleteTransaction(trans.receiptNo)" class="tbl-btn tbl-btn--del" title="Delete"><i class="fas fa-trash"></i></button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div v-if="filteredTransactionHistory.length > transactionItemsPerPage" class="pagination-wrap">
            <button
              class="pagination-btn"
              :disabled="currentTransactionPage === 1"
              @click="goToTransactionPage(currentTransactionPage - 1)"
            >
              <i class="fas fa-chevron-left"></i> Prev
            </button>

            <button
              v-for="page in transactionPageNumbers"
              :key="`page-${page}`"
              class="pagination-btn"
              :class="{ 'pagination-btn--active': page === currentTransactionPage }"
              @click="goToTransactionPage(page)"
            >
              {{ page }}
            </button>

            <button
              class="pagination-btn"
              :disabled="currentTransactionPage === totalTransactionPages"
              @click="goToTransactionPage(currentTransactionPage + 1)"
            >
              Next <i class="fas fa-chevron-right"></i>
            </button>
          </div>

        </div>

        <transition name="pay-panel-fade">
          <div v-if="showPaymentPanel" class="pay-overlay" @click.self="closePaymentPanel">
            <transition name="pay-panel-slide">
              <section v-if="showPaymentPanel" class="pay-panel">
                <div class="pay-workspace pay-workspace--merged">
                  <div class="pay-order-col">
                    <div class="pay-order-head">
                      <div class="pay-col-title">Items</div>
                      <button type="button" class="pay-action pay-action--cancel" @click="closePaymentPanel">
                        <i class="fas fa-times"></i> Cancel
                      </button>
                    </div>

                    <div class="pay-order-list">
                      <div v-if="cart.length === 0" class="pay-empty">No items in current order.</div>
                      <div v-else v-for="(item, index) in cart" :key="`pay-${index}`" class="pay-order-row">
                        <div class="pay-order-main">
                          <strong>{{ item.name }}</strong>
                          <small>× {{ item.isBooking ? 1 : (item.qty || 1) }}</small>
                        </div>
                        <div class="pay-order-price">₱{{ Number(item.price || 0).toLocaleString() }}</div>
                      </div>
                    </div>

                    <div class="pay-order-total">
                      <span>Total</span>
                      <strong>₱{{ total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</strong>
                    </div>
                  </div>

                  <div class="pay-main-col">
                    <div class="pay-col-title">Payment Method</div>
                    <div class="pay-method-grid">
                      <button
                        type="button"
                        :class="['pay-method-btn', paymentMethod === 'Cash' ? 'pay-method-btn--active' : '']"
                        @click="paymentMethod = 'Cash'"
                      >
                        <i class="fas fa-money-bill-wave"></i>
                        <span>Cash</span>
                      </button>
                      <button
                        type="button"
                        :class="['pay-method-btn', paymentMethod === 'GCash' ? 'pay-method-btn--active' : '']"
                        @click="paymentMethod = 'GCash'"
                      >
                        <i class="fas fa-wallet"></i>
                        <span>GCash</span>
                      </button>
                    </div>

                    <div class="pay-details-card">
                      <div class="pay-line">
                        <span>Total:</span>
                        <strong>₱{{ total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</strong>
                      </div>

                      <div class="pay-input-row">
                        <label for="panel-paid">Paid:</label>
                        <input
                          id="panel-paid"
                          ref="paymentAmountInput"
                          v-model="cashReceived"
                          type="text"
                          inputmode="decimal"
                          class="pay-paid-input"
                          :disabled="paymentMethod !== 'Cash'"
                          placeholder="0.00"
                          @focus="selectPaymentAmountInput"
                        />
                      </div>

                      <div class="pay-line" :class="isCashInsufficient ? 'pay-line--warn' : ''">
                        <span>Change:</span>
                        <strong>₱{{ changeAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</strong>
                      </div>

                      <p v-if="isCashInsufficient" class="pay-warning">
                        Insufficient cash amount.
                      </p>

                      <button
                        type="button"
                        class="pay-complete-btn"
                        :disabled="cart.length === 0 || isCashInsufficient"
                        @click="completeFromPaymentPanel"
                      >
                        <i class="fas fa-check-circle"></i>
                        Pay & Complete
                      </button>
                    </div>

                    <div class="pay-keypad">
                      <button type="button" class="key-btn" @click="appendToCashReceived('1')">1</button>
                      <button type="button" class="key-btn" @click="appendToCashReceived('2')">2</button>
                      <button type="button" class="key-btn" @click="appendToCashReceived('3')">3</button>
                      <button type="button" class="key-btn key-btn--danger" @click="backspaceCashReceived"><i class="fas fa-backspace"></i></button>

                      <button type="button" class="key-btn" @click="appendToCashReceived('4')">4</button>
                      <button type="button" class="key-btn" @click="appendToCashReceived('5')">5</button>
                      <button type="button" class="key-btn" @click="appendToCashReceived('6')">6</button>
                      <button type="button" class="key-btn key-btn--warn" @click="clearCashReceived">C</button>

                      <button type="button" class="key-btn" @click="appendToCashReceived('7')">7</button>
                      <button type="button" class="key-btn" @click="appendToCashReceived('8')">8</button>
                      <button type="button" class="key-btn" @click="appendToCashReceived('9')">9</button>
                      <button type="button" class="key-btn key-btn--wide" @click="setExactCash">EXACT</button>

                      <button type="button" class="key-btn" @click="appendToCashReceived('00')">00</button>
                      <button type="button" class="key-btn" @click="appendToCashReceived('0')">0</button>
                      <button type="button" class="key-btn" @click="appendToCashReceived('.')">.</button>
                    </div>
                  </div>
                </div>
              </section>
            </transition>
          </div>
        </transition>

      </div>

    </main>

    <!-- ══ POS REPORT PREVIEW ══ -->
    <div v-if="showTransactionsExportPreview" class="sales-preview-overlay" @click.self="showTransactionsExportPreview = false">
      <div class="sales-preview-modal">
        <div class="sales-preview-toolbar">
          <div>
            <h3>POS Transaction Report</h3>
            <p>Review before downloading Excel</p>
          </div>
          <div class="sales-preview-actions">
            <button class="btn-download" @click="exportAllTransactions">
              <i class="fas fa-download"></i>
              Download Excel
            </button>
            <button class="btn-preview" @click="printPOSReportPreview">
              <i class="fas fa-print"></i>
              Print
            </button>
            <button class="btn-preview" @click="showTransactionsExportPreview = false">
              <i class="fas fa-xmark"></i>
              Close
            </button>
          </div>
        </div>

        <div class="sales-preview-scroll">
          <article class="sales-report-print" id="pos-report-print">
            <header class="srp-header">
              <div class="srp-logo">ER</div>
              <div>
                <h2>Eduardo's Resort</h2>
                <p>POS Transaction Report</p>
              </div>
              <div class="srp-meta">
                <span>Generated</span>
                <strong>{{ posReportGenAt }}</strong>
              </div>
            </header>

            <section class="srp-section">
              <div class="srp-title-row">
                <div>
                  <h3>POS Report</h3>
                  <p>{{ exportPreviewTransactions.length }} transactions</p>
                </div>
              </div>
            </section>

            <section class="srp-cards">
              <div class="srp-card">
                <span>Transactions</span>
                <strong>{{ exportPreviewTransactions.length }}</strong>
              </div>
              <div class="srp-card">
                <span>Total Sales</span>
                <strong>₱{{ exportPreviewTotalSales.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</strong>
              </div>
              <div class="srp-card">
                <span>Cash</span>
                <strong>{{ exportPreviewCashCount }}</strong>
              </div>
              <div class="srp-card">
                <span>GCash</span>
                <strong>{{ exportPreviewGcashCount }}</strong>
              </div>
            </section>

            <section class="srp-section">
              <h4>Transactions List</h4>
              <table class="srp-table">
                <thead>
                  <tr>
                    <th>Receipt</th>
                    <th>Items</th>
                    <th>Type</th>
                    <th>Payment</th>
                    <th>Total</th>
                    <th>Date</th>
                    <th>Time</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="trans in exportPreviewTransactions" :key="`preview-${trans.receiptNo}`">
                    <td>POS-{{ trans.receiptNo }}</td>
                    <td>{{ getItemsPreview(trans.items) }}</td>
                    <td>{{ trans.type || '-' }}</td>
                    <td>{{ trans.payment || '-' }}</td>
                    <td>₱{{ Number(trans.total || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</td>
                    <td>{{ formatPreviewDate(trans.date) }}</td>
                    <td>{{ formatPreviewTime(trans.date, trans.time) }}</td>
                  </tr>
                </tbody>
              </table>
            </section>
          </article>
        </div>
      </div>
    </div>

    <!-- ══ RECEIPT CUSTOMIZER MODAL ══ -->
    <div v-if="showReceiptCustomizer" class="modal-overlay" @click.self="showReceiptCustomizer = false">
      <div class="modal-box" @click.stop>
        <div class="modal-head">
          <div class="modal-head-left">
            <div class="modal-head-icon modal-head-icon--gold"><i class="fas fa-palette"></i></div>
            <div>
              <div class="modal-title">Customize Receipt</div>
              <div class="modal-sub">POS-{{ selectedReceipt?.receiptNo }}</div>
            </div>
          </div>
          <button @click="showReceiptCustomizer = false" class="modal-close-btn"><i class="fas fa-times"></i></button>
        </div>
        <div class="modal-body">
          <div class="modal-section">
            <div class="modal-section-title"><i class="fas fa-paint-brush"></i> Colors</div>
            <div class="form-row-2">
              <div class="form-group">
                <label class="form-label">Header Background</label>
                <div class="color-row">
                  <input type="color" v-model="receiptStyle.headerBg" class="color-swatch" />
                  <input type="text" v-model="receiptStyle.headerBg" class="form-input font-mono" />
                </div>
              </div>
              <div class="form-group">
                <label class="form-label">Header Text</label>
                <div class="color-row">
                  <input type="color" v-model="receiptStyle.headerText" class="color-swatch" />
                  <input type="text" v-model="receiptStyle.headerText" class="form-input font-mono" />
                </div>
              </div>
            </div>
          </div>
          <div class="modal-section">
            <div class="modal-section-title"><i class="fas fa-file-alt"></i> Content</div>
            <div class="form-group">
              <label class="form-label">Company Name</label>
              <input type="text" v-model="receiptStyle.companyName" class="form-input" />
            </div>
          </div>
        </div>
        <div class="modal-foot">
          <button @click="showReceiptCustomizer = false" class="btn-cancel">Cancel</button>
          <button @click="downloadCustomizedReceipt" class="btn-action btn-action--green"><i class="fas fa-download"></i> Download</button>
          <button @click="saveReceiptStyle" class="btn-action btn-action--primary"><i class="fas fa-save"></i> Save Style</button>
        </div>
      </div>
    </div>

    <!-- ══ BOOKING MODAL ══ -->
    <POSRoomBookingModal
      :is-open="showBookingModal"
      :item-name="pendingBookingItem?.name || ''"
      :item-price="pendingBookingItem?.price || 0"
      :item-category="pendingBookingItem?.category || ''"
      :promos="promos"
      @close="showBookingModal = false"
      @confirm="handleBookingConfirm"
    />

    <!-- ══ FOOD CUSTOMIZATION MODAL ══ -->
    <div v-if="showCustomizationModal && pendingCustomItem" class="modal-overlay" @click.self="closeCustomizationModal">
      <div class="modal-box modal-box--customization" @click.stop>
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
                <small>{{ size.priceDelta > 0 ? `₱${size.priceDelta} base` : 'Use item base price' }}</small>
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
              class="form-input"
              rows="3"
              placeholder="No onions, less ice, extra hot, etc."
            ></textarea>
          </div>

          <div class="modal-section">
            <div class="detail-row">
              <span class="detail-key">Original Price</span>
              <span class="detail-val">₱{{ Number(pendingCustomItem.price || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-key">Selected Size Price</span>
              <span class="detail-val">₱{{ selectedSizeBasisPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-key">Add-ons</span>
              <span class="detail-val">₱{{ customizationExtraAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</span>
            </div>
            <div class="detail-row detail-row--total">
              <span class="detail-key">Item Total</span>
              <span class="detail-total">₱{{ customizedItemUnitPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</span>
            </div>
          </div>
        </div>

        <div class="modal-foot">
          <button @click="closeCustomizationModal" class="btn-cancel">Cancel</button>
          <button @click="confirmCustomization" class="btn-action btn-action--primary">
            <i class="fas fa-check-circle"></i> Confirm
          </button>
        </div>
      </div>
    </div>

    <!-- ══ TRANSACTION DETAILS MODAL ══ -->
    <div v-if="showTransactionDetails && selectedTransaction" class="modal-overlay" @click.self="showTransactionDetails = false">
      <div class="modal-box" @click.stop>
        <div class="modal-head">
          <div class="modal-head-left">
            <div class="modal-head-icon"><i class="fas fa-receipt"></i></div>
            <div>
              <div class="modal-title">Receipt Preview</div>
              <div class="modal-sub">POS-{{ selectedTransaction.receiptNo }} • Printable layout</div>
            </div>
          </div>
          <button @click="showTransactionDetails = false" class="modal-close-btn"><i class="fas fa-times"></i></button>
        </div>
        <div class="modal-body">
          <div class="modal-section">
            <div class="modal-section-title"><i class="fas fa-print"></i> Print Preview</div>
            <div class="receipt-preview-wrap">
              <div class="receipt-preview-paper">
                <div class="receipt-center receipt-title-company">
                  {{ receiptStyle.companyName || "Eduardo's Resort" }}
                </div>
                <div class="receipt-center receipt-title-sub">
                  {{ receiptStyle.receiptTitle || 'Point of Sale' }}
                </div>

                <div class="receipt-divider">--------------------------------</div>

                <div class="receipt-meta">
                  <div>Receipt: POS-{{ selectedTransaction.receiptNo }}</div>
                  <div>Type: {{ selectedTransaction.type }}</div>
                  <div>Date: {{ formatReceiptDate(selectedTransaction.date) }}</div>
                  <div>Time: {{ selectedTransaction.time }}</div>
                  <div>Payment: {{ selectedTransaction.payment }}</div>
                </div>

                <div class="receipt-divider">--------------------------------</div>

                <div
                  v-for="(item, idx) in selectedTransaction.items"
                  :key="idx"
                  class="receipt-line-between receipt-item-row"
                >
                  <span class="receipt-item-name-inline">
                    {{ item.name }}
                    <small v-if="item.bookingReference" class="receipt-small-inline">(Ref: {{ item.bookingReference }})</small>
                  </span>
                  <span>₱{{ Number(item.price).toLocaleString() }}</span>
                </div>

                <div class="receipt-divider">--------------------------------</div>

                <div class="receipt-line-between receipt-total-row">
                  <span>TOTAL</span>
                  <span>₱{{ Number(selectedTransaction.total).toLocaleString() }}</span>
                </div>

                <div class="receipt-divider">--------------------------------</div>

                <div class="receipt-center receipt-footer">
                  Thank you for your purchase!
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-foot">
          <button @click="printReceipt(selectedTransaction.receiptNo)" class="btn-action btn-action--green"><i class="fas fa-print"></i> Print</button>
          <button @click="showTransactionDetails = false" class="btn-cancel"><i class="fas fa-times"></i> Close</button>
        </div>
      </div>
    </div>

    <!-- ══ TOAST ══ -->
    <transition name="toast">
      <div v-if="toastMessage" :class="['toast', toastType === 'success' ? 'toast--success' : 'toast--error']">
        <i :class="toastType === 'success' ? 'fas fa-check-circle' : 'fas fa-exclamation-circle'"></i>
        {{ toastMessage }}
      </div>
    </transition>

  </div>
</template>

<script>
import AdminSidebar        from '../../components/Admin/AdminSidebar.vue'
import AdminHeader         from '../../components/Admin/AdminHeader.vue'
import QRCheckInScanner    from '../../components/QRCheckInScanner.vue'
import POSRoomBookingModal from '../../components/POSRoomBookingModal.vue'
import QRCode              from 'qrcode'
import { useAuthStore }    from '../../stores/auth'
import { useNotificationStore } from '../../stores/notifications'
import axios from 'axios'

const API_BASE = 'http://localhost:8000/api/pos'
const DEFAULT_SIZE_OPTIONS = [
  { id: 'regular', label: 'Regular', priceDelta: 0 }
]
const DEFAULT_ADDON_OPTIONS = []

export default {
  name: 'POSSystem',
  components: { AdminSidebar, AdminHeader, QRCheckInScanner, POSRoomBookingModal },
  data() {
    return {
      sidebarOpen: false, sidebarCollapsed: false,
      isCheckinScannerOpen: false, showTransaction: false, isFullscreen: false,
      showPaymentPanel: false,
      auth: useAuthStore(), notifications: useNotificationStore(),
      cart: [], total: 0, receiptNo: 1,
      promos: [],
      currentCategory: 'restaurant', paymentMethod: 'Cash',
      cashReceived: '',
      searchQuery: '', restaurantTypeFilter: 'all', showMoreFilters: false,
      transactionHistory: [],
      showReceiptCustomizer: false, selectedReceipt: null,
      receiptStyle: {
        headerBg: '#0C3B5E', headerText: '#ffffff', totalBg: '#1F8DBF', totalText: '#ffffff',
        companySize: 20, itemSize: 13, totalSize: 16, fontFamily: "'Courier New', monospace",
        showCompanyName: true, showDateTime: true, showFooter: true,
        companyName: "Eduardo's Resort", receiptTitle: 'Point of Sale'
      },
      categories: [
        { id: 'restaurant', name: 'Restaurant', icon: 'utensils',     items: [] },
        { id: 'rooms',      name: 'Rooms',      icon: 'bed',          items: [] },
        { id: 'cottage',    name: 'Cottage',    icon: 'home',         items: [] },
        { id: 'event',      name: 'Event',      icon: 'calendar-alt', items: [] }
      ],
      viewedTransactions: new Set(JSON.parse(localStorage.getItem('viewedEshopOrders') || '[]')),
      toastMessage: '', toastType: 'success',
      showBookingModal: false, pendingBookingItem: null,
      currentTransactionPage: 1,
      transactionItemsPerPage: 10,
      showTransactionsExportPreview: false,
      posReportGenAt: '',
      showTransactionDetails: false, selectedTransaction: null,
      showCustomizationModal: false,
      pendingCustomItem: null,
      customizationSizeOptions: [...DEFAULT_SIZE_OPTIONS],
      customizationAddOnOptions: [...DEFAULT_ADDON_OPTIONS],
      customizationForm: {
        sizeId: 'regular',
        selectedAddOnIds: [],
        specialRequest: ''
      }
    }
  },
  computed: {
    userRole() { return this.auth.role || 'staff' },
    visibleCategories() {
      if (this.userRole === 'admin') return this.categories
      if (this.userRole === 'receptionist') return this.categories.filter(c => c.id !== 'restaurant')
      return this.categories.filter(c => c.id === 'restaurant')
    },
    restaurantTypeFilters() {
      const cat = this.categories.find(c => c.id === 'restaurant')
      if (!cat) return []
      return [...new Set(cat.items.map(i => (i.description || '').trim()).filter(Boolean))].sort((a,b)=>a.localeCompare(b,undefined,{sensitivity:'base'}))
    },
    visibleFilters()  { return this.restaurantTypeFilters.slice(0, 5) },
    overflowFilters() { return this.restaurantTypeFilters.slice(5) },
    cashReceivedNumber() {
      const n = Number(this.cashReceived)
      return Number.isFinite(n) && n >= 0 ? n : 0
    },
    changeAmount() {
      if (this.paymentMethod !== 'Cash') return 0
      return Math.max(0, this.cashReceivedNumber - Number(this.total || 0))
    },
    isCashInsufficient() {
      if (this.paymentMethod !== 'Cash') return false
      return this.cashReceivedNumber < Number(this.total || 0)
    },
    filteredTransactionHistory() {
      if (this.userRole === 'admin') return this.transactionHistory
      return this.transactionHistory.filter(t => {
        const hasRest = this.hasItemFromCategory(t.items, 'restaurant')
        if (this.userRole === 'restaurantstaff') return hasRest
        if (this.userRole === 'receptionist')    return !hasRest
        return true
      })
    },
    totalTransactionPages() {
      return Math.max(1, Math.ceil(this.filteredTransactionHistory.length / this.transactionItemsPerPage))
    },
    paginatedTransactionHistory() {
      const start = (this.currentTransactionPage - 1) * this.transactionItemsPerPage
      const end = start + this.transactionItemsPerPage
      return this.filteredTransactionHistory.slice(start, end)
    },
    transactionPageNumbers() {
      const total = this.totalTransactionPages
      const current = this.currentTransactionPage
      const pages = []

      if (total <= 7) {
        for (let i = 1; i <= total; i++) pages.push(i)
        return pages
      }

      let start = Math.max(1, current - 2)
      let end = Math.min(total, current + 2)

      if (start === 1) end = 5
      if (end === total) start = total - 4

      for (let i = start; i <= end; i++) pages.push(i)
      return pages
    },
    exportPreviewTransactions() {
      return this.userRole === 'admin' ? this.transactionHistory : this.filteredTransactionHistory
    },
    exportPreviewTotalSales() {
      return this.exportPreviewTransactions.reduce((sum, t) => sum + Number(t.total || 0), 0)
    },
    exportPreviewCashCount() {
      return this.exportPreviewTransactions.filter(t => String(t.payment || '').toLowerCase() === 'cash').length
    },
    exportPreviewGcashCount() {
      return this.exportPreviewTransactions.filter(t => String(t.payment || '').toLowerCase() === 'gcash').length
    },
    eshopPendingCount() { return this.transactionHistory.filter(t => t.source === 'eshop' && !this.viewedTransactions.has(t.receiptNo)).length },
    groupedRestaurantItems() {
      const cat = this.categories.find(c => c.id === 'restaurant'); if (!cat) return []
      const items = this.searchQuery
        ? cat.items.filter(i => this.itemMatchesQuery(i, this.searchQuery))
        : cat.items
      const groups = {}
      items.forEach(item => { const type=(item.description||'').trim(); if (!type) return; if (!groups[type]) groups[type]=[]; groups[type].push(item) })
      return Object.keys(groups).sort().map(type => ({ type, items: groups[type] }))
    },
    uncategorizedRestaurantItems() {
      const cat = this.categories.find(c => c.id === 'restaurant'); if (!cat) return []
      const items = this.searchQuery
        ? cat.items.filter(i => this.itemMatchesQuery(i, this.searchQuery))
        : cat.items
      return items.filter(item => !(item.description||'').trim())
    },
    selectedCustomizationSize() {
      return this.customizationSizeOptions.find(s => s.id === this.customizationForm.sizeId) || this.customizationSizeOptions[0]
    },
    selectedCustomizationAddOns() {
      const selected = new Set(this.customizationForm.selectedAddOnIds || [])
      return this.customizationAddOnOptions.filter(addon => selected.has(addon.id))
    },
    selectedSizeBasisPrice() {
      const sizePrice = Number(this.selectedCustomizationSize?.priceDelta || 0)
      const basePrice = Number(this.pendingCustomItem?.price || 0)
      return sizePrice || basePrice
    },
    customizationExtraAmount() {
      const addOnsExtra = this.selectedCustomizationAddOns.reduce((sum, addon) => sum + Number(addon.price || 0), 0)
      return addOnsExtra
    },
    customizedItemUnitPrice() {
      const basePrice = this.selectedSizeBasisPrice
      const addOnsExtra = this.customizationExtraAmount
      // Size price is absolute (replaces base). Fall back to base only when no real size selected.
      return basePrice + addOnsExtra
    }
  },
  watch: {
    visibleCategories(newCats) { if (!newCats.some(c=>c.id===this.currentCategory)) this.currentCategory=newCats[0]?.id||'' },
    currentCategory(newCat)  { if (newCat !== 'restaurant') this.restaurantTypeFilter='all' },
    paymentMethod(newMethod) { if (newMethod !== 'Cash') this.cashReceived = '' },
    showPaymentPanel(isOpen) { if (isOpen) this.focusPaymentAmountInput() },
    eshopPendingCount(n)      { this.notifications.setEshopPending(n) },
    filteredTransactionHistory() {
      if (this.currentTransactionPage > this.totalTransactionPages) {
        this.currentTransactionPage = this.totalTransactionPages
      }
      if (this.currentTransactionPage < 1) {
        this.currentTransactionPage = 1
      }
    }
  },
  beforeUnmount() {
    document.removeEventListener('keydown', this._fsKeyHandler)
    document.removeEventListener('fullscreenchange', this._fsChangeHandler)
    document.removeEventListener('click', this._outsideClick)
    if (this._pollInterval) clearInterval(this._pollInterval)
    if (this._visibilityHandler) document.removeEventListener('visibilitychange', this._visibilityHandler)
  },
  async mounted() {
    await this.fetchItems(); await this.fetchPromos(); await this.fetchTransactions(); this.updateReceiptNumber()
    this._pollInterval = setInterval(()=>this.fetchTransactions(), 30000)
    this._visibilityHandler = ()=>{ if(document.visibilityState==='visible') this.fetchTransactions() }
    document.addEventListener('visibilitychange', this._visibilityHandler)
    this._fsKeyHandler   = e=>{ if(e.ctrlKey&&e.key==='F12'){e.preventDefault();this.toggleFullscreen()} }
    this._fsChangeHandler= ()=>{ this.isFullscreen=!!document.fullscreenElement }
    this._outsideClick   = ()=>{ this.showMoreFilters=false }
    document.addEventListener('keydown', this._fsKeyHandler)
    document.addEventListener('fullscreenchange', this._fsChangeHandler)
    document.addEventListener('click', this._outsideClick)
    const saved = localStorage.getItem('receiptStyle')
    if (saved) { try { this.receiptStyle = {...this.receiptStyle,...JSON.parse(saved)} } catch {} }
  },
  methods: {
      formatReceiptDate(dateValue) {
        if (!dateValue) return 'N/A';
        try {
          const d = new Date(dateValue);
          if (isNaN(d.getTime())) return String(dateValue);
          return d.toLocaleDateString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
          });
        } catch {
          return String(dateValue);
        }
      },
    // ── Fullscreen ──
    toggleFullscreen() {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
      } else {
        document.exitFullscreen().catch(() => {});
      }
    },
    // ── Bookmark Tab Actions ──
    openScanner() {
      this.isCheckinScannerOpen = true;
    },
    openPaymentPanel() {
      if (!this.cart.length) {
        this.showToast('No items added', 'error')
        return
      }
      this.paymentMethod = 'Cash'
      this.showPaymentPanel = true
      if (this.paymentMethod === 'Cash' && !this.cashReceived) {
        this.cashReceived = this.total.toFixed(2)
      }
      this.focusPaymentAmountInput()
    },
    closePaymentPanel() {
      this.showPaymentPanel = false
    },
    focusPaymentAmountInput() {
      this.$nextTick(() => {
        const input = this.$refs.paymentAmountInput
        if (input && typeof input.focus === 'function') {
          input.focus()
          if (typeof input.select === 'function') input.select()
        }
      })
    },
    selectPaymentAmountInput() {
      const input = this.$refs.paymentAmountInput
      if (input && typeof input.select === 'function') input.select()
    },
    appendToCashReceived(token) {
      if (this.paymentMethod !== 'Cash') return
      let current = String(this.cashReceived || '')
      if (token === '.') {
        if (current.includes('.')) return
        current = current || '0'
        this.cashReceived = `${current}.`
        return
      }
      const next = `${current}${token}`
      const normalized = next.replace(/^0+(\d)/, '$1')
      if (!/^\d*(\.\d{0,2})?$/.test(normalized)) return
      this.cashReceived = normalized
    },
    backspaceCashReceived() {
      if (this.paymentMethod !== 'Cash') return
      const current = String(this.cashReceived || '')
      this.cashReceived = current.slice(0, -1)
    },
    clearCashReceived() {
      if (this.paymentMethod !== 'Cash') return
      this.cashReceived = ''
    },
    setExactCash() {
      if (this.paymentMethod !== 'Cash') return
      this.cashReceived = Number(this.total || 0).toFixed(2)
    },
    async completeFromPaymentPanel() {
      const success = await this.checkout()
      if (success) this.showPaymentPanel = false
    },
    toggleTransaction() {
      this.showTransaction = !this.showTransaction;
    },
    returnToPOS() {
      this.showTransaction = false
    },
    goToTransactionPage(page) {
      const target = Number(page)
      if (!Number.isFinite(target)) return
      this.currentTransactionPage = Math.min(this.totalTransactionPages, Math.max(1, target))
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
        const res = await axios.get(`${API_BASE}/items`)
        this.categories.forEach(cat => {
          cat.items = res.data
            .filter(i => i.category === cat.id)
            .map(i => ({
              name: i.name,
              price: parseFloat(i.price),
              description: i.description || '',
              sizes: Array.isArray(i.sizes) ? i.sizes : [],
              addons: Array.isArray(i.addons) ? i.addons : []
            }))
        })
      } catch { this.showToast('Failed to load items from server','error') }
    },
    async fetchPromos() {
      try {
        const res = await axios.get('http://localhost:8000/api/promos')
        this.promos = Array.isArray(res.data) ? res.data : []
      } catch {
        this.promos = []
      }
    },
    async fetchTransactions() {
      try {
        const res = await axios.get(`${API_BASE}/transactions`)
        this.transactionHistory = res.data.map(t => {
          const isEshop = t.receipt_no && String(t.receipt_no).includes('ESHOP')
          return {
            receiptNo:t.receipt_no,
            items:t.items,
            type:t.type,
            payment:t.payment_method,
            total:parseFloat(t.total_amount),
            paidAmount:parseFloat(t.cash_received ?? t.paid_amount ?? t.total_amount),
            changeAmount:parseFloat(t.change_amount ?? 0),
            date:t.transaction_date,
            time:t.transaction_time,
            source:t.source||(isEshop?'eshop':'pos'),
            bookingDetails:t.bookingDetails||[]
          }
        })
        const current = new Set(this.transactionHistory.map(t=>t.receiptNo))
        this.viewedTransactions = new Set(Array.from(this.viewedTransactions).filter(r=>current.has(r)))
        localStorage.setItem('viewedEshopOrders', JSON.stringify(Array.from(this.viewedTransactions)))
      } catch(e) { console.error(e) }
    },
    updateReceiptNumber() {
      if (!this.transactionHistory.length) { this.receiptNo=1; return }
      const nums = this.transactionHistory.map(t=>parseInt(String(t.receiptNo).replace(/[^\d]/g,''))).filter(n=>n>0)
      this.receiptNo = nums.length ? Math.max(...nums)+1 : 1
    },
    itemMatchesQuery(item, query) {
      const q = String(query || '').trim().toLowerCase()
      if (!q) return true
      const name = String(item?.name || '').toLowerCase()
      const type = String(item?.description || '').toLowerCase()
      return name.includes(q) || type.includes(q)
    },
    showCategory(id) { if (!this.visibleCategories.some(c=>c.id===id)) return; this.currentCategory=id; this.searchQuery=''; if(id!=='restaurant') this.restaurantTypeFilter='all' },
    getFilteredItems(items, categoryId) {
      let f=[...items]
      if(this.searchQuery) f=f.filter(i=>this.itemMatchesQuery(i, this.searchQuery))
      if(categoryId==='restaurant'&&this.restaurantTypeFilter!=='all') f=f.filter(i=>(i.description||'').toLowerCase()===this.restaurantTypeFilter.toLowerCase())
      return f
    },
    hasItemFromCategory(transItems, catId) {
      const names=(this.categories.find(c=>c.id===catId)?.items||[]).map(i=>i.name.toLowerCase())
      return transItems.some(t=>names.includes(t.name.toLowerCase()))
    },
    filterItems() {
      if (this.searchQuery) {
        this.restaurantTypeFilter = 'all'
      }
    },
    normalizeSizeOptions(rawSizes) {
      if (!Array.isArray(rawSizes) || rawSizes.length === 0) return [...DEFAULT_SIZE_OPTIONS]
      return rawSizes.map((size, index) => {
        const label = String(size?.label || size?.name || `Option ${index + 1}`).trim()
        const id = String(size?.id || label || `size-${index + 1}`)
          .trim()
          .toLowerCase()
          .replace(/\s+/g, '-')
        return {
          id,
          label,
          // Keep explicit 0 values (e.g., Regular +0) instead of falling back to absolute price.
          priceDelta: Number(size?.priceDelta ?? size?.price ?? 0)
        }
      })
    },
    normalizeAddOnOptions(rawAddons) {
      if (!Array.isArray(rawAddons) || rawAddons.length === 0) return [...DEFAULT_ADDON_OPTIONS]
      return rawAddons.map((addon, index) => {
        const name = String(addon?.name || addon?.label || `Add-on ${index + 1}`).trim()
        const id = String(addon?.id || name || `addon-${index + 1}`)
          .trim()
          .toLowerCase()
          .replace(/\s+/g, '-')
        return {
          id,
          name,
          price: Number(addon?.price ?? addon?.amount ?? 0)
        }
      })
    },
    openCustomizationModal(item) {
      this.pendingCustomItem = { name: item.name, price: Number(item.price || 0) }
      this.customizationSizeOptions = this.normalizeSizeOptions(item.sizes)
      this.customizationAddOnOptions = this.normalizeAddOnOptions(item.addons)
      this.customizationForm = {
        sizeId: this.customizationSizeOptions[0]?.id || 'regular',
        selectedAddOnIds: [],
        specialRequest: ''
      }
      this.showCustomizationModal = true
    },
    closeCustomizationModal() {
      this.showCustomizationModal = false
      this.pendingCustomItem = null
    },
    confirmCustomization() {
      if (!this.pendingCustomItem) return
      const customPayload = {
        sizeId: this.selectedCustomizationSize?.id || 'regular',
        sizeLabel: this.selectedCustomizationSize?.label || 'Regular',
        sizePriceDelta: Number(this.selectedCustomizationSize?.priceDelta || 0),
        addOns: this.selectedCustomizationAddOns.map(addon => ({ id: addon.id, name: addon.name, price: Number(addon.price || 0) })),
        specialRequest: String(this.customizationForm.specialRequest || '').trim()
      }
      this.addItem(this.pendingCustomItem.name, this.pendingCustomItem.price, customPayload)
      this.closeCustomizationModal()
    },
    handleItemClick(item, category) {
      if (['rooms','cottage','event'].includes(category)) {
        this.pendingBookingItem = { name: item.name, price: item.price, category }
        this.showBookingModal = true
      } else {
        this.openCustomizationModal(item)
      }
    },
    async handleBookingConfirm(bookingData) {
      try {
        const bookRes = await axios.post('http://localhost:8000/api/bookings/confirm', {
          guest:{ firstName:bookingData.firstName, lastName:bookingData.lastName, phone:bookingData.phone||'', email:bookingData.email||'', address:'', city:'', postal:'', country:'Philippines' },
          checkIn:bookingData.checkIn, checkOut:bookingData.checkOut, isSwimmingOnly:false,
          items:[{ item_id:this.pendingBookingItem.category, name:this.pendingBookingItem.name, category:this.pendingBookingItem.category, qty:1, guests:bookingData.adults+bookingData.children, price:this.pendingBookingItem.price, perNight:this.pendingBookingItem.category !== 'cottage' }],
          paymentMethod:'pos-walkin', total:bookingData.lineTotal
        })
        if (!bookRes.data.success) throw new Error(bookRes.data.error||'Failed to create booking')
        const { bookingId, bookingReference } = bookRes.data.data
        await axios.post(`http://localhost:8000/api/bookings/${bookingId}/check-in`, { checked_in_by:this.userRole||'staff', checked_in_time:new Date().toISOString() })

        const selectedMethod = String(this.paymentMethod || 'Cash')
        let paymentUrl = null
        let paymentQR = null

        if (selectedMethod.toLowerCase() === 'gcash') {
          const payRes = await axios.post('http://localhost:8000/api/paymongo/create-payment-link', {
            amount:bookingData.lineTotal,
            description:`Eduardo's Resort - ${bookingReference}`,
            bookingId,
            email:bookingData.email||`walkin-${bookingReference}@resort.local`,
            paymentMethod:'gcash'
          })
          if (!payRes.data.success) throw new Error('Failed to create payment link')
          paymentUrl = payRes.data.checkout_url
          paymentQR = await QRCode.toDataURL(paymentUrl, {
            errorCorrectionLevel:'H',
            type:'image/png',
            width:200,
            margin:1,
            color:{dark:'#0C3B5E',light:'#FFFFFF'}
          })
        }

        this.cart.push({
          name:this.pendingBookingItem.name,
          price:bookingData.lineTotal,
          isBooking:true,
          bookingId,
          bookingReference,
          ...(paymentUrl ? { paymentUrl } : {}),
          ...(paymentQR ? { paymentQR } : {}),
          ...bookingData
        })
        this.total += bookingData.lineTotal
        this.showToast(`Booking created! Ref: ${bookingReference}`, 'success')
        this.pendingBookingItem=null
      } catch(err) { this.showToast(err.message||'Failed to create booking','error') }
    },
    addItem(name, price, customization = null) {
      const basePrice = Number(price || 0)
      const sizeExtra = Number(customization?.sizePriceDelta || 0)
      const addOnsExtra = Array.isArray(customization?.addOns)
        ? customization.addOns.reduce((sum, addon) => sum + Number(addon.price || 0), 0)
        : 0
      // Size price is absolute (the full price for that size tier).
      // Fall back to basePrice only when no real size is selected (priceDelta = 0).
      const unitPrice = customization
        ? (sizeExtra || basePrice) + addOnsExtra
        : basePrice

      const signature = customization
        ? JSON.stringify({
          sizeId: customization.sizeId || 'regular',
          addOns: (customization.addOns || []).map(addon => addon.id).sort(),
          specialRequest: (customization.specialRequest || '').trim().toLowerCase()
        })
        : 'default'

      const ex = this.cart.find(i => !i.isBooking && i.name === name && (i.customizationSignature || 'default') === signature)
      if (ex) {
        ex.qty++
        ex.price = ex.unitPrice * ex.qty
      } else {
        this.cart.push({
          name,
          price: unitPrice,
          unitPrice,
          qty: 1,
          customization: customization || null,
          customizationSignature: signature
        })
      }
      this.total += unitPrice
    },
    removeItem(index) { const i=this.cart[index]; this.total-=i.isBooking?i.price:i.unitPrice*i.qty; this.cart.splice(index,1) },
    clearCart() { if(this.cart.length>0&&confirm('Clear all items?')) { this.cart=[]; this.total=0 } },
    async checkout() {
      if (!this.cart.length) { this.showToast('No items added','error'); return false }
      if (this.paymentMethod === 'Cash' && this.isCashInsufficient) { this.showToast('Insufficient cash amount','error'); return false }
      if (isNaN(this.receiptNo)||this.receiptNo<1) this.receiptNo=1
      const now = new Date()
      const paidAmount = this.paymentMethod === 'Cash' ? this.cashReceivedNumber : this.total
      const changeAmount = this.paymentMethod === 'Cash' ? this.changeAmount : 0

      // Generate GCash payment links for booking items that were added before payment
      // method was selected (handleBookingConfirm runs before the payment panel)
      if (this.paymentMethod === 'GCash') {
        for (const cartItem of this.cart) {
          if (cartItem.isBooking && !cartItem.paymentUrl) {
            try {
              const payRes = await axios.post('http://localhost:8000/api/paymongo/create-payment-link', {
                amount: cartItem.price,
                description: `Eduardo's Resort - ${cartItem.bookingReference}`,
                bookingId: cartItem.bookingId,
                email: cartItem.email || `walkin-${cartItem.bookingReference}@resort.local`,
                paymentMethod: 'gcash'
              })
              if (payRes.data.success) {
                cartItem.paymentUrl = payRes.data.checkout_url
                cartItem.paymentQR = await QRCode.toDataURL(cartItem.paymentUrl, {
                  errorCorrectionLevel: 'H', type: 'image/png', width: 200, margin: 1,
                  color: { dark: '#0C3B5E', light: '#FFFFFF' }
                })
              }
            } catch {}
          }
        }
      }

      const trans = {
        receiptNo: String(Math.floor(this.receiptNo)).padStart(3,'0'),
        items: this.cart.map(i=>({
          name:i.name,
          price:i.price,
          qty:i.isBooking ? 1 : (i.qty || 1),
          quantity:i.isBooking ? 1 : (i.qty || 1),
          unitPrice:i.isBooking ? i.price : (i.unitPrice || i.price),
          ...(i.customization ? { customization: i.customization } : {}),
          ...(i.isBooking&&{bookingId:i.bookingId,bookingReference:i.bookingReference})
        })),
        type:'Walk-in', payment:this.paymentMethod, total:this.total,
        paidAmount,
        changeAmount,
        date: now.toISOString().split('T')[0],
        time: now.toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false}),
        bookingDetails: this.cart.filter(i=>i.isBooking).map(i=>({ firstName:i.firstName, lastName:i.lastName, phone:i.phone, email:i.email, roomName:i.name, checkInDate:i.checkIn, checkOutDate:i.checkOut, nights:i.nights, adults:i.adults, children:i.children, bookingReference:i.bookingReference, paymentUrl:i.paymentUrl }))
      }
      try {
        await axios.post(`${API_BASE}/transactions`, {
          receipt_no:trans.receiptNo,
          items:trans.items,
          type:trans.type,
          payment_method:trans.payment,
          total_amount:trans.total,
          cash_received: trans.paidAmount,
          change_amount: trans.changeAmount,
          transaction_date:trans.date,
          transaction_time:trans.time
        })
        this.transactionHistory.unshift(trans); this.receiptNo++
        const printed = await this.printReceipt(trans.receiptNo, { fromCheckout: true })
        if (printed) this.showToast(`Transaction complete! POS-${trans.receiptNo} (receipt printed)`,'success')
        else this.showToast(`Transaction complete! POS-${trans.receiptNo} (print failed)`,'error')
        this.showTransaction = false
        this.cart=[]; this.total=0
        this.cashReceived=''
        return true
      } catch {
        this.showToast('Failed to save transaction','error')
        return false
      }
    },
    showBookingReceipt(trans) {
      const bookings = this.cart.filter(i=>i.isBooking)
      bookings.forEach(async b => {
        try {
          const r = await axios.post('http://localhost:8000/api/pos/print/booking', { receiptNo:`POS-${trans.receiptNo}`, date:trans.date, time:trans.time, guestName:`${b.firstName} ${b.lastName}`, phone:b.phone||'N/A', email:b.email||'N/A', roomName:b.name, checkInDate:b.checkIn, checkOutDate:b.checkOut, nights:b.nights, adults:b.adults, children:b.children, pricePerNight:b.nights?(b.price/b.nights).toFixed(2):'0.00', total:b.price, paymentMethod:this.paymentMethod, bookingReference:b.bookingReference, paymentUrl:b.paymentUrl })
          if (r.data.success) this.showToast(`Receipt printed! Ref: ${b.bookingReference}`,'success')
        } catch {}
      })
    },
    getItemsPreview(items) { const l=items.map(i=>i.name).join(', '); return l.length>35?l.substring(0,35)+'…':l },
    formatPreviewDate(dateValue) {
      if (!dateValue) return '-'
      const raw = String(dateValue).trim()
      const parsed = new Date(raw)
      if (!Number.isNaN(parsed.getTime())) {
        return parsed.toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: '2-digit' })
      }
      if (raw.includes('T')) return raw.split('T')[0]
      return raw
    },
    formatPreviewTime(dateValue, explicitTime) {
      const providedTime = String(explicitTime || '').trim()
      if (providedTime) return providedTime.length > 8 ? providedTime.slice(0, 8) : providedTime

      const rawDate = String(dateValue || '').trim()
      if (!rawDate) return '-'

      const parsed = new Date(rawDate)
      if (!Number.isNaN(parsed.getTime())) {
        return parsed.toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' })
      }

      if (rawDate.includes('T')) {
        const isoTime = (rawDate.split('T')[1] || '').replace('Z', '').split('.')[0]
        return isoTime || '-'
      }

      return '-'
    },
    viewDetails(receiptNo) {
      const t=this.transactionHistory.find(x=>x.receiptNo===receiptNo); if(!t) return
      this.viewedTransactions.add(receiptNo)
      localStorage.setItem('viewedEshopOrders', JSON.stringify(Array.from(this.viewedTransactions)))
      this.selectedTransaction=t; this.showTransactionDetails=true
    },
    async printReceipt(receiptNo, options = {}) {
      const { fromCheckout = false } = options
      const t=this.transactionHistory.find(x=>x.receiptNo===receiptNo); if(!t) return
      const hasBookings=t.items.some(i=>i.bookingReference)
      if (hasBookings&&t.bookingDetails?.length) {
        let printedCount = 0
        for (const b of t.bookingDetails) {
          const bookingLineTotal = Number(
            t.items.find(i => i.bookingReference === b.bookingReference)?.price || t.total || 0
          )
          try {
            const r = await axios.post('http://localhost:8000/api/pos/print/booking', {
              receiptNo:`POS-${t.receiptNo}`,
              date:t.date,
              time:t.time,
              guestName:`${b.firstName} ${b.lastName}`,
              phone:b.phone||'N/A',
              email:b.email||'N/A',
              roomName:b.roomName||'N/A',
              checkInDate:b.checkInDate||'N/A',
              checkOutDate:b.checkOutDate||'N/A',
              nights:b.nights||0,
              adults:b.adults||0,
              children:b.children||0,
              pricePerNight:b.nights?(bookingLineTotal/Number(b.nights)).toFixed(2):'0.00',
              total:bookingLineTotal,
              paidAmount: Number(t.paidAmount ?? t.total),
              changeAmount: Number(t.changeAmount ?? 0),
              paymentMethod:t.payment,
              bookingReference:b.bookingReference,
              paymentUrl:b.paymentUrl
            })
            if (r.data?.success) printedCount++
          } catch (e) {
            if (!fromCheckout) this.showToast(`Print failed: ${e.response?.data?.message || e.message}`,'error')
          }
        }

        if (printedCount > 0) {
          if (!fromCheckout) this.showToast(`Receipt sent to printer (${printedCount})`,'success')
          return true
        }
        if (!fromCheckout) this.showToast('Printer service unavailable','error')
        return false
      } else {
        const payload = {
          receiptNo:`POS-${t.receiptNo}`,
          date:t.date,
          time:t.time,
          items:t.items.map(i => {
            const qty = Number(i.qty || i.quantity || 1)
            const lineTotal = Number(i.price || 0)
            const unitPrice = Number(i.unitPrice || (qty > 0 ? lineTotal / qty : lineTotal))
            return {
              name:i.name,
              price:unitPrice,
              quantity:qty,
              total:lineTotal,
              customization: i.customization
            }
          }),
          total:t.total,
          paidAmount: Number(t.paidAmount ?? t.total),
          changeAmount: Number(t.changeAmount ?? 0),
          paymentMethod:t.payment
        }

        try {
          const r = await axios.post('http://localhost:8000/api/pos/print/regular', payload)
          if (r.data?.success) {
            if (!fromCheckout) this.showToast('Receipt sent to printer!','success')
            return true
          }
          if (!fromCheckout) this.showToast(r.data?.message || 'Printer service unavailable','error')
          return false
        } catch (e) {
          if (!fromCheckout) this.showToast(`Print failed: ${e.response?.data?.message || e.message}`,'error')
          return false
        }
      }
    },
    async deleteTransaction(receiptNo) {
      if (!confirm('Delete this transaction permanently?')) return
      const idx=this.transactionHistory.findIndex(t=>t.receiptNo===receiptNo); if(idx===-1) return
      try {
        const res=await axios.get(`${API_BASE}/transactions`)
        const be=res.data.find(t=>t.receipt_no===this.transactionHistory[idx].receiptNo)
        if(be) await axios.delete(`${API_BASE}/transactions/${be.id}`)
        this.transactionHistory.splice(idx,1)
      } catch { this.showToast('Failed to delete transaction','error') }
    },
    async clearHistory() {
      if (!confirm('Clear all transaction history?')) return
      try { await axios.delete(`${API_BASE}/transactions`); this.transactionHistory=[] }
      catch { this.showToast('Failed to clear history','error') }
    },
    openTransactionsExportPreview() {
      if (!this.exportPreviewTransactions.length) {
        this.showToast('No transactions to export', 'error')
        return
      }
      this.posReportGenAt = new Date().toLocaleString('en-PH', { month: 'short', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
      this.showTransactionsExportPreview = true
    },
    printPOSReportPreview() {
      const el = document.getElementById('pos-report-print')
      if (!el) return
      const w = window.open('', '_blank', 'width=900,height=700')
      const styles = `
        *, *::before, *::after { box-sizing: border-box; }
        body { font-family: system-ui, sans-serif; background: #fff; color: #0f172a; margin: 0; padding: 8mm; }
        .sales-report-print { width: 100%; background: #fff; }
        .srp-header { display: grid; grid-template-columns: 52px 1fr auto; align-items: center; gap: 12px; padding: 10px 14px; background: #0c3b5e; color: #fff; border-radius: 6px 6px 0 0; margin-bottom: 10px; }
        .srp-logo { width: 44px; height: 44px; border-radius: 8px; background: #0c3b5e; color: #f4c400; font-weight: 800; font-size: 14px; display: flex; align-items: center; justify-content: center; border: 2px solid #f4c400; }
        .srp-header h2 { margin: 0; font-size: 15px; color: #fff; }
        .srp-header p { margin: 2px 0 0; font-size: 10px; color: #93c5fd; }
        .srp-meta { text-align: right; font-size: 9px; color: #93c5fd; }
        .srp-meta strong { display: block; color: #fde68a; }
        .srp-section { margin: 10px 0; padding: 8px 12px; border: 1px solid #e2e8f0; border-radius: 6px; }
        .srp-section h4 { margin: 0 0 8px; font-size: 11px; color: #0c3b5e; font-weight: 700; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; }
        .srp-title-row { display: flex; justify-content: space-between; align-items: flex-start; }
        .srp-title-row h3 { margin: 0; font-size: 12px; color: #0c3b5e; }
        .srp-title-row p { margin: 2px 0 0; font-size: 9px; color: #64748b; }
        .srp-cards { display: flex; gap: 8px; padding: 8px 0; margin: 8px 0; flex-wrap: wrap; }
        .srp-card { flex: 1; min-width: 140px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; }
        .srp-card span { display: block; font-size: 8px; text-transform: uppercase; letter-spacing: 0.04em; color: #64748b; margin-bottom: 2px; }
        .srp-card strong { font-size: 16px; font-weight: 800; color: #1e293b; }
        .srp-table { width: 100%; border-collapse: collapse; font-size: 9px; }
        .srp-table th { background: #f0f6fb; color: #0c3b5e; font-weight: 700; font-size: 8px; text-transform: uppercase; padding: 5px 6px; border: 1px solid #e2e8f0; text-align: left; }
        .srp-table td { padding: 4px 6px; border: 1px solid #e2e8f0; color: #1e293b; font-size: 9px; }
        .srp-table tr:nth-child(even) td { background: #f8fafc; }
        @page { size: A4 portrait; margin: 8mm; }
      `
      w.document.write(`<!DOCTYPE html><html><head><title>POS Transaction Report</title><style>${styles}</style></head><body>${el.outerHTML}</body></html>`)
      w.document.close()
      w.focus()
      w.print()
      w.close()
    },
    async exportAllTransactions() {
      if (!this.exportPreviewTransactions.length) { this.showToast('No transactions to export','error'); return }

      try {
        const ExcelJS = (await import('exceljs')).default
        const workbook = new ExcelJS.Workbook()
        workbook.creator = "Eduardo's Resort"
        workbook.created = new Date()

        const ws = workbook.addWorksheet('POS Report', {
          pageSetup: { paperSize: 9, orientation: 'portrait', fitToPage: true, fitToWidth: 1 }
        })

        ws.columns = [
          { width: 14 },
          { width: 22 },
          { width: 40 },
          { width: 14 },
          { width: 16 },
          { width: 16 },
          { width: 14 },
          { width: 12 }
        ]

        const C_DARK_BLUE = 'FF0C3B5E'
        const C_LOGO_BG = 'FF0C3B5E'
        const C_HDR_BG = 'FFE8F4FD'
        const C_TBL_HDR = 'FFF0F6FB'
        const C_CARD_BDR = 'FFDCE8F3'
        const C_WHITE = 'FFFFFFFF'
        const C_ROW_ALT = 'FFF8FBFF'
        const C_GREY_TEXT = 'FF64748B'

        const bdr = c => ({ style: 'thin', color: { argb: c } })
        const cardBorder = { top: bdr(C_CARD_BDR), bottom: bdr(C_CARD_BDR), left: bdr(C_CARD_BDR), right: bdr(C_CARD_BDR) }
        const safeNum = value => {
          const parsed = Number(value)
          return Number.isFinite(parsed) ? parsed : 0
        }
        const safeCurrency = value => `₱${safeNum(value).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

        const secHdr = (cell, text) => {
          cell.value = text
          cell.font = { bold: true, size: 10, color: { argb: C_DARK_BLUE }, name: 'Calibri' }
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: C_TBL_HDR } }
          cell.border = cardBorder
          cell.alignment = { horizontal: 'left', vertical: 'middle', indent: 1 }
        }

        const th = (cell, text, right = false) => {
          cell.value = text
          cell.font = { bold: true, size: 10, color: { argb: C_DARK_BLUE }, name: 'Calibri' }
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: C_TBL_HDR } }
          cell.border = cardBorder
          cell.alignment = { horizontal: right ? 'right' : 'left', indent: right ? 0 : 1 }
        }

        const td = (cell, value, right = false, bold = false, alt = false) => {
          cell.value = value
          cell.font = { size: 10, name: 'Calibri', bold }
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: alt ? C_ROW_ALT : C_WHITE } }
          cell.border = cardBorder
          cell.alignment = { horizontal: right ? 'right' : 'left', indent: right ? 0 : 1 }
        }

        const txRows = this.userRole === 'admin' ? this.transactionHistory : this.filteredTransactionHistory
        const totalSales = txRows.reduce((sum, t) => sum + safeNum(t.total), 0)
        const cashCount = txRows.filter(t => String(t.payment || '').toLowerCase() === 'cash').length
        const gcashCount = txRows.filter(t => String(t.payment || '').toLowerCase() === 'gcash').length

        let r = 1

        ws.getCell(`A${r}`).value = 'ER'
        ws.getCell(`A${r}`).font = { bold: true, size: 14, color: { argb: C_WHITE }, name: 'Calibri' }
        ws.getCell(`A${r}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: C_LOGO_BG } }
        ws.getCell(`A${r}`).alignment = { horizontal: 'center', vertical: 'middle' }
        ws.getCell(`A${r}`).border = cardBorder

        ws.mergeCells(`B${r}:E${r}`)
        ws.getCell(`B${r}`).value = "Eduardo's Resort"
        ws.getCell(`B${r}`).font = { bold: true, size: 15, color: { argb: C_DARK_BLUE }, name: 'Calibri' }
        ws.getCell(`B${r}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: C_HDR_BG } }
        ws.getCell(`B${r}`).alignment = { horizontal: 'left', vertical: 'middle', indent: 1 }

        ws.getCell(`F${r}`).value = 'Generated'
        ws.getCell(`F${r}`).font = { size: 9, color: { argb: C_GREY_TEXT }, name: 'Calibri' }
        ws.getCell(`F${r}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: C_HDR_BG } }
        ws.getCell(`F${r}`).alignment = { horizontal: 'right' }

        ws.mergeCells(`G${r}:H${r}`)
        ws.getCell(`G${r}`).value = new Date().toLocaleString('en-PH', {
          month: 'short', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
        })
        ws.getCell(`G${r}`).font = { bold: true, size: 9, color: { argb: C_DARK_BLUE }, name: 'Calibri' }
        ws.getCell(`G${r}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: C_HDR_BG } }
        ws.getCell(`G${r}`).alignment = { horizontal: 'right' }
        ws.getRow(r).height = 28
        r++

        ws.mergeCells(`A${r}:H${r}`)
        ws.getCell(`A${r}`).value = 'POS Transactions Report'
        ws.getCell(`A${r}`).font = { italic: true, size: 10, color: { argb: C_GREY_TEXT }, name: 'Calibri' }
        ws.getCell(`A${r}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: C_HDR_BG } }
        ws.getCell(`A${r}`).alignment = { horizontal: 'left', indent: 1 }
        ws.getRow(r).height = 16
        r++

        r++

        const cards = [
          { label: 'TRANSACTIONS', value: String(txRows.length) },
          { label: 'TOTAL SALES', value: safeCurrency(totalSales) },
          { label: 'CASH', value: String(cashCount) },
          { label: 'GCASH', value: String(gcashCount) }
        ]
        const cardCols = ['A', 'C', 'E', 'G']

        cards.forEach(({ label }, i) => {
          const cell = ws.getCell(`${cardCols[i]}${r}`)
          cell.value = label
          cell.font = { size: 8, color: { argb: C_GREY_TEXT }, name: 'Calibri' }
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: C_WHITE } }
          cell.border = { top: bdr(C_CARD_BDR), left: bdr(C_CARD_BDR), right: bdr(C_CARD_BDR), bottom: { style: 'hair', color: { argb: C_CARD_BDR } } }
          cell.alignment = { horizontal: 'left', indent: 1 }
        })
        ws.getRow(r).height = 14
        r++

        cards.forEach(({ value }, i) => {
          const cell = ws.getCell(`${cardCols[i]}${r}`)
          cell.value = value
          cell.font = { bold: true, size: 12, color: { argb: C_DARK_BLUE }, name: 'Calibri' }
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: C_WHITE } }
          cell.border = { bottom: bdr(C_CARD_BDR), left: bdr(C_CARD_BDR), right: bdr(C_CARD_BDR), top: { style: 'hair', color: { argb: C_CARD_BDR } } }
          cell.alignment = { horizontal: 'left', indent: 1, vertical: 'middle' }
        })
        ws.getRow(r).height = 22
        r++

        r++

        ws.mergeCells(`A${r}:H${r}`)
        secHdr(ws.getCell(`A${r}`), 'Transactions List')
        ws.getRow(r).height = 16
        r++

        th(ws.getCell(`A${r}`), 'No.', true)
        th(ws.getCell(`B${r}`), 'Receipt')
        th(ws.getCell(`C${r}`), 'Items')
        th(ws.getCell(`D${r}`), 'Type')
        th(ws.getCell(`E${r}`), 'Payment')
        th(ws.getCell(`F${r}`), 'Total', true)
        th(ws.getCell(`G${r}`), 'Date')
        th(ws.getCell(`H${r}`), 'Time')
        r++

        txRows.forEach((t, i) => {
          const alt = i % 2 === 1
          const items = Array.isArray(t.items)
            ? t.items.map(item => `${item.name} (${safeCurrency(item.price)})`).join('; ')
            : ''
          td(ws.getCell(`A${r}`), i + 1, true, false, alt)
          td(ws.getCell(`B${r}`), `POS-${t.receiptNo}`, false, false, alt)
          td(ws.getCell(`C${r}`), items || '-', false, false, alt)
          td(ws.getCell(`D${r}`), t.type || '-', false, false, alt)
          td(ws.getCell(`E${r}`), t.payment || '-', false, false, alt)
          td(ws.getCell(`F${r}`), safeCurrency(t.total), true, false, alt)
          td(ws.getCell(`G${r}`), t.date || '-', false, false, alt)
          td(ws.getCell(`H${r}`), t.time || '-', false, false, alt)
          r++
        })

        const buffer = await workbook.xlsx.writeBuffer()
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
        const url = URL.createObjectURL(blob)
        const anchor = document.createElement('a')
        anchor.href = url
        const fn = `POS_Transactions_Report_${new Date().toISOString().split('T')[0]}.xlsx`
        anchor.download = fn
        document.body.appendChild(anchor)
        anchor.click()
        document.body.removeChild(anchor)
        URL.revokeObjectURL(url)
        this.showTransactionsExportPreview = false
        this.showToast(`Export successful! ${fn}`,'success')
      } catch (e) {
        console.error(e)
        this.showToast('Failed to export transactions report','error')
      }
    },
    downloadReceipt(receiptNo) {
      const trans = this.transactionHistory.find(t => t.receiptNo === receiptNo);
      if (!trans) return;

      let csv = `ReserVision\nReceipt: POS-${trans.receiptNo}\nDate: ${trans.date}\nTime: ${trans.time}\nPayment: ${trans.payment}\n\nItem,Price\n`;
      trans.items.forEach(item => {
        csv += `"${item.name}",${item.price}\n`;
      });
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
}
</script>

<style scoped>
/* ── Eduardo's Resort Color Palette ── */
.admin-layout {
  --color-primary:       #0369a1;
  --color-primary-light: #1F8DBF;
  --color-primary-dark:  #1E88B6;
  --color-gold:          #F4C400;
  --color-gold-dark:     #F2C200;
  --color-navy:          #0C3B5E;
  --color-white:         #FFFFFF;
  --color-gray-bg:       #EEF5FB;
  --color-gray-border:   #e5e7eb;
  --color-text-dark:     #1f2937;
  --color-text-light:    #6b7280;
}

@keyframes fadeUp  { from{opacity:0;transform:translateY(6px)}  to{opacity:1;transform:translateY(0)} }
@keyframes slideUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
@keyframes fadeIn  { from{opacity:0}to{opacity:1} }
@keyframes dropIn  { from{opacity:0;transform:translateY(-6px)} to{opacity:1;transform:translateY(0)} }
@keyframes popIn   { from{opacity:0;transform:scale(.95)}       to{opacity:1;transform:scale(1)} }

/* ── Layout ── */
.admin-layout {
  display: flex;
  min-height: 100vh;
  background: var(--color-gray-bg);
  font-family: 'Segoe UI', system-ui, sans-serif;
}
.main-content {
  flex: 1;
  margin-left: 262px;
  padding-top: 64px;
  transition: margin-left .3s ease;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  min-width: 0;
}
.main-content.shifted { margin-left: 72px; }
@media (max-width: 768px) { .main-content { margin-left: 0; } }

.pos-container {
  flex: 1;
  padding: .35rem 1rem;
  display: flex;
  flex-direction: column;
  min-height: 0;
}
@media (max-width: 768px) { .pos-container { padding: .35rem 1rem; } }

/* ── Payment Workspace Overlay ── */
.pay-overlay {
  position: fixed;
  inset: 0;
  background: rgba(12,59,94,.32);
  /* backdrop-filter: blur(2px); */
  z-index: 0;
  display: flex;
  justify-content: flex-end;
}

.pay-panel {
  width: min(1270px, 100vw);
  height: calc(100vh - 64px);
  margin-top: 64px;
  background: var(--color-white);
  border-left: 1px solid var(--color-gray-border);
  box-shadow: -10px 0 30px rgba(12,59,94,.18);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.pay-action {
  height: 40px;
  border-radius: 10px;
  border: 1px solid var(--color-gray-border);
  background: var(--color-white);
  color: var(--color-text-dark);
  font-size: .8rem;
  font-weight: 700;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: .4rem;
  transition: all .15s ease;
}
.pay-action:hover { border-color: var(--color-primary-light); color: var(--color-primary); }
.pay-action--cancel {
  background: #ef4444;
  color: var(--color-white);
  border-color: #ef4444;
}
.pay-action--cancel:hover { background: #dc2626; border-color: #dc2626; color: var(--color-white); }

.pay-workspace {
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-columns: 260px 210px 1fr;
  gap: .9rem;
  padding: .9rem 1rem 1rem;
  background: var(--color-gray-bg);
}

.pay-order-col,
.pay-method-col,
.pay-keypad-col {
  background: var(--color-white);
  border: 1px solid var(--color-gray-border);
  border-radius: 14px;
  box-shadow: 0 2px 10px rgba(3,105,161,.06);
  display: flex;
  flex-direction: column;
  min-height: 0;
  padding: .85rem;
}

.pay-col-title {
  font-size: .78rem;
  font-weight: 800;
  color: var(--color-navy);
  text-transform: uppercase;
  letter-spacing: .4px;
  margin-bottom: .6rem;
}

.pay-order-list {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  border: 1px solid var(--color-gray-border);
  border-radius: 10px;
  background: #fbfdff;
}
.pay-empty {
  padding: 1rem;
  font-size: .8rem;
  color: var(--color-text-light);
}
.pay-order-row {
  display: flex;
  justify-content: space-between;
  gap: .4rem;
  padding: .55rem .65rem;
  border-bottom: 1px solid #eef2f7;
}
.pay-order-row:last-child { border-bottom: none; }
.pay-order-main { display: flex; flex-direction: column; min-width: 0; }
.pay-order-main strong {
  font-size: .8rem;
  color: var(--color-text-dark);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.pay-order-main small { font-size: .68rem; color: var(--color-text-light); }
.pay-order-price { font-size: .78rem; font-weight: 700; color: var(--color-primary); }

.pay-order-total {
  margin-top: .65rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: .55rem .7rem;
  border-radius: 10px;
  background: rgba(3,105,161,.08);
  color: var(--color-navy);
}
.pay-order-total strong { font-size: 1rem; }

.pay-method-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: .45rem;
}
.pay-method-btn {
  height: 44px;
  border-radius: 10px;
  border: 1px solid var(--color-gray-border);
  background: #f8fbff;
  color: var(--color-text-dark);
  font-size: .78rem;
  font-weight: 700;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: .35rem;
  transition: all .15s ease;
}
.pay-method-btn--ghost {
  margin-top: .25rem;
  border-style: dashed;
  color: var(--color-text-light);
  background: #ffffff;
}
.pay-method-btn:hover { border-color: var(--color-primary-light); color: var(--color-primary); }
.pay-method-btn--active {
  background: rgba(3,105,161,.1);
  border-color: var(--color-primary-light);
  color: var(--color-primary);
}

.pay-details-card {
  margin-top: 0;
  border: 1px solid var(--color-gray-border);
  border-radius: 12px;
  background: #fcfeff;
  padding: .9rem;
}
.pay-line {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: .9rem;
  color: var(--color-text-dark);
  margin-bottom: .55rem;
}
.pay-line strong { color: var(--color-primary); font-size: 1.9rem; line-height: 1; }
.pay-line--warn strong { color: #b91c1c; }

.pay-input-row {
  display: grid;
  grid-template-columns: 52px 1fr;
  align-items: center;
  gap: .5rem;
  margin-bottom: .45rem;
}
.pay-input-row label {
  font-size: .84rem;
  font-weight: 700;
  color: var(--color-text-light);
}
.pay-paid-input {
  height: 42px;
  border-radius: 10px;
  border: 1px solid var(--color-gray-border);
  padding: 0 .6rem;
  font-size: 1.15rem;
  font-weight: 800;
  color: var(--color-text-dark);
  background: var(--color-white);
}
.pay-paid-input:focus {
  outline: none;
  border-color: var(--color-primary-light);
  box-shadow: 0 0 0 3px rgba(3,105,161,.12);
}
.pay-paid-input:disabled { background: #f1f5f9; color: #94a3b8; }

.pay-warning {
  margin: .15rem 0 .5rem;
  font-size: .72rem;
  font-weight: 700;
  color: #b91c1c;
}
.pay-complete-btn {
  width: 100%;
  height: 40px;
  border: none;
  border-radius: 10px;
  background: var(--color-navy);
  color: var(--color-white);
  font-size: .84rem;
  font-weight: 800;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: .4rem;
  transition: all .15s ease;
}
.pay-complete-btn:hover { background: var(--color-primary); }
.pay-complete-btn:disabled {
  background: #94a3b8;
  cursor: not-allowed;
}

.pay-keypad {
  margin-top: auto;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: .45rem;
}
.key-btn {
  height: 52px;
  border-radius: 10px;
  border: 1px solid var(--color-gray-border);
  background: var(--color-white);
  color: var(--color-text-dark);
  font-size: 1rem;
  font-weight: 800;
  cursor: pointer;
  transition: all .12s ease;
}
.key-btn:hover {
  border-color: var(--color-primary-light);
  color: var(--color-primary);
  background: #f3f9ff;
}
.key-btn--danger {
  background: #fee2e2;
  color: #b91c1c;
  border-color: #fecaca;
}
.key-btn--warn {
  background: rgba(244,196,0,.16);
  color: #7a5200;
  border-color: rgba(244,196,0,.45);
}
.key-btn--wide {
  grid-column: span 1;
  font-size: .75rem;
}

.pay-panel-fade-enter-active,
.pay-panel-fade-leave-active { transition: opacity .2s ease; }
.pay-panel-fade-enter-from,
.pay-panel-fade-leave-to { opacity: 0; }

.pay-panel-slide-enter-active,
.pay-panel-slide-leave-active { transition: transform .24s ease; }
.pay-panel-slide-enter-from,
.pay-panel-slide-leave-to { transform: translateX(100%); }

@media (max-width: 1100px) {
  .pay-workspace { grid-template-columns: 1fr; overflow-y: auto; }
  .pay-keypad { grid-template-columns: repeat(4, minmax(0, 1fr)); }
}

@media (max-width: 768px) {
  .pay-panel {
    width: 100vw;
    height: 100vh;
    margin-top: 0;
    border-left: none;
  }
  .pay-actions-row { grid-template-columns: 1fr; }
}

/* ── POS grid ── */
.pos-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  animation: fadeUp .25s ease both;
}
.pos-grid {
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 1rem;
  flex: 1;
  min-height: 0;
  /* 64px = AdminHeader, 1.25rem top + 1.25rem bottom = 2.5rem container padding */
  height: calc(100vh - 64px - 2.5rem);
  max-height: calc(100vh - 64px - 2.5rem);
  overflow: hidden;
}
@media (max-width: 900px) { .pos-grid { grid-template-columns: 1fr; height: auto; } }

/* ── Shared panel base ── */
.items-panel, .cart-panel {
  background: var(--color-white);
  border-radius: 20px;
  border: 0.5px solid var(--color-gray-border);
  box-shadow: 0 2px 16px rgba(3,105,161,.08);
  display: flex;
  flex-direction: column;
  min-height: 0;
  height: 100%;        /* fill the full grid cell */
  overflow: hidden;
}

/* ── Panel header (shared) ── */
.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: .9rem 1.2rem;
  border-bottom: 2px solid rgba(244,196,0,.25);
  background: var(--color-navy);
  border-radius: 20px 20px 0 0;
  flex-shrink: 0;
}
.panel-header-left { display: flex; align-items: center; gap: .75rem; }
.panel-icon {
  width: 36px; height: 36px; border-radius: 10px;
  background: rgba(255,255,255,.12);
  display: flex; align-items: center; justify-content: center;
  color: var(--color-gold); font-size: 1rem; flex-shrink: 0;
}
.panel-title { color: var(--color-white); font-size: .95rem; font-weight: 700; }
.panel-sub   { color: rgba(255,255,255,.55); font-size: .72rem; margin-top: 1px; }

/* ── Filter strip ── */
.filter-strip {
  display: flex;
  flex-wrap: wrap;
  gap: .4rem;
  padding: .75rem 1.1rem .6rem;
  border-bottom: 0.5px solid var(--color-gray-border);
  background: #fafcff;
  flex-shrink: 0;
}
.filter-chip {
  padding: .3rem .8rem;
  border-radius: 20px;
  font-size: .75rem;
  font-weight: 600;
  border: 1.5px solid;
  cursor: pointer;
  transition: all .15s;
  white-space: nowrap;
  display: inline-flex; align-items: center;
}
.chip--idle   { background: var(--color-white); color: var(--color-text-dark); border-color: var(--color-gray-border); }
.chip--idle:hover { border-color: var(--color-primary-light); color: var(--color-primary); }
.chip--active { background: var(--color-navy); color: var(--color-white); border-color: var(--color-navy); }
.chip--more   { gap: 4px; }
.more-arrow   { font-size: .65rem; }

.more-wrap { position: relative; display: inline-block; }
.more-dropdown {
  position: absolute; top: calc(100% + 6px); left: 0;
  background: var(--color-white); border: 1.5px solid var(--color-gray-border);
  border-radius: 12px; box-shadow: 0 8px 24px rgba(3,105,161,.14);
  z-index: 500; min-width: 170px; padding: .35rem;
  display: flex; flex-direction: column; gap: 2px;
  animation: dropIn .15s ease;
}
.more-item {
  text-align: left; padding: .45rem .75rem; border-radius: 8px;
  font-size: .8rem; font-weight: 600; color: var(--color-text-dark);
  background: none; border: none; cursor: pointer; transition: background .12s;
}
.more-item:hover       { background: rgba(3,105,161,.07); color: var(--color-primary); }
.more-item--active     { background: rgba(3,105,161,.1); color: var(--color-primary); }

/* ── Items body ── */
.items-body {
  flex: 1; min-height: 0; overflow-y: auto;
  padding: .85rem 1rem 1rem;
  scrollbar-width: thin;
  scrollbar-color: var(--color-gray-border) transparent;
}
.items-body::-webkit-scrollbar { width: 4px; }
.items-body::-webkit-scrollbar-thumb { background: var(--color-gray-border); border-radius: 4px; }

/* ── Item group ── */
.item-group { margin-bottom: 1.5rem; }
.item-group:last-child { margin-bottom: 0; }
.group-header {
  display: flex; align-items: center; gap: .45rem;
  margin-bottom: .6rem; padding-bottom: .45rem;
  border-bottom: 1.5px solid rgba(244,196,0,.25);
}
.group-label {
  font-size: .7rem; font-weight: 800; color: var(--color-navy);
  text-transform: uppercase; letter-spacing: .7px;
}
.group-count {
  font-size: .65rem; font-weight: 700;
  background: rgba(3,105,161,.08); color: var(--color-primary);
  border: 1px solid rgba(3,105,161,.18);
  padding: .1rem .45rem; border-radius: 20px;
}

/* ── Items grid ── */
.items-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: .6rem;
}
@media (max-width: 1100px) { .items-grid { grid-template-columns: repeat(2, 1fr); } }

/* ── Item card ── */
.item-card {
  background: #EEF5FB;
  border: 1.5px solid #c8dff0;
  border-radius: 14px;
  padding: .75rem .85rem;
  cursor: pointer;
  display: flex; flex-direction: column; align-items: flex-start;
  gap: .35rem; min-height: 78px;
  transition: all .18s ease;
  text-align: left;
}
.item-card:hover {
  background: #dbeafe;
  border-color: var(--color-primary-light);
  box-shadow: 0 4px 12px rgba(31,141,191,.18);
  transform: translateY(-2px);
}
.item-card:active { transform: scale(.97); }

.item-card-icon { font-size: .8rem; color: rgba(3,105,161,.3); margin-bottom: .1rem; }
.item-card-name { font-size: .8rem; font-weight: 600; color: var(--color-text-dark); line-height: 1.3; }
.item-card-price { font-size: .92rem; font-weight: 800; color: var(--color-primary); margin-top: auto; }

/* ═══════════════════════════════════
   CART PANEL
═══════════════════════════════════ */
.cart-panel { flex-shrink: 0; }

/* Cart header */
.cart-header {
  display: flex; justify-content: space-between; align-items: center;
  padding: .9rem 1.2rem;
  background: var(--color-navy);
  border-bottom: 3px solid var(--color-gold);
  border-radius: 20px 20px 0 0;
  flex-shrink: 0;
}
.cart-header-left { display: flex; align-items: center; gap: .65rem; }
.cart-header-icon {
  width: 36px; height: 36px; border-radius: 10px;
  background: rgba(244,196,0,.18);
  display: flex; align-items: center; justify-content: center;
  color: var(--color-gold); font-size: 1rem; flex-shrink: 0;
}
.cart-header-title { color: var(--color-white); font-size: .95rem; font-weight: 700; }
.cart-header-sub   { color: rgba(255,255,255,.55); font-size: .72rem; margin-top: 1px; }

.cart-clear-btn {
  width: 32px; height: 32px; border-radius: 8px;
  background: rgba(239,68,68,.18); border: 1px solid rgba(239,68,68,.35);
  color: #fca5a5; font-size: .8rem; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: all .15s;
}
.cart-clear-btn:hover { background: #ef4444; color: var(--color-white); border-color: #ef4444; }

/* Cart items — ONLY this scrolls */
.cart-items-scroll {
  flex: 1; min-height: 0; overflow-y: auto;
  padding: .5rem 1rem;
  scrollbar-width: thin;
  scrollbar-color: var(--color-gray-border) transparent;
}
.cart-items-scroll::-webkit-scrollbar { width: 4px; }
.cart-items-scroll::-webkit-scrollbar-thumb { background: var(--color-gray-border); border-radius: 4px; }

/* Cart empty */
.cart-empty {
  display: flex; flex-direction: column; align-items: center;
  justify-content: center; height: 100%; min-height: 120px;
  text-align: center; gap: .4rem;
}
.cart-empty-icon {
  width: 52px; height: 52px; border-radius: 50%;
  background: var(--color-gray-bg);
  display: flex; align-items: center; justify-content: center;
  margin-bottom: .35rem;
}
.cart-empty-icon i { font-size: 1.3rem; color: #c1c8d0; }
.cart-empty p    { font-size: .85rem; font-weight: 600; color: #64748b; margin: 0; }
.cart-empty span { font-size: .72rem; color: var(--color-text-light); }

/* Cart rows */
.cart-list { display: flex; flex-direction: column; gap: 1px; }
.cart-row {
  display: flex; justify-content: space-between; align-items: center;
  padding: .55rem .25rem; gap: .5rem;
  border-bottom: 0.5px solid #f1f5f9;
  transition: background .12s;
  border-radius: 8px;
}
.cart-row:hover { background: #f0f6fb; }
.cart-row:last-child { border-bottom: none; }

.cart-row-left  { flex: 1; min-width: 0; }
.cart-row-name  { font-size: .8rem; font-weight: 600; color: var(--color-text-dark); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.cart-row-qty   { font-size: .7rem; color: var(--color-text-light); margin-top: 1px; }
.cart-row-meta  { display: flex; flex-direction: column; gap: 1px; margin-top: 2px; }
.cart-row-meta span { font-size: .68rem; color: var(--color-text-light); display: flex; align-items: center; gap: 4px; }
.cart-row-meta i    { color: #c1c8d0; width: 10px; }
.cart-row-qty-inline { font-size: .72rem !important; font-weight: 700; color: var(--color-navy) !important; }

.cart-row-right { display: flex; align-items: center; gap: .4rem; flex-shrink: 0; }
.cart-row-price { font-size: .82rem; font-weight: 700; color: var(--color-text-dark); white-space: nowrap; }
.cart-row-remove {
  width: 20px; height: 20px; border-radius: 50%;
  background: #fee2e2; border: none; color: #ef4444;
  font-size: .6rem; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: all .12s; flex-shrink: 0;
}
.cart-row-remove:hover { background: #ef4444; color: var(--color-white); }

/* ── COMPACT CART FOOTER — always pinned, never scrolls ── */
.cart-footer {
  flex-shrink: 0;
  padding: .55rem .9rem .7rem;
  border-top: 2px solid rgba(244,196,0,.3);
  display: flex; flex-direction: column; gap: .42rem;
  background: var(--color-white);
}

.total-bar   { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
.total-label { font-size: .65rem; font-weight: 700; color: var(--color-text-light); text-transform: uppercase; letter-spacing: .5px; }
.total-amount{ font-size: 1.2rem; font-weight: 800; color: var(--color-navy); line-height: 1; }

.payment-section { display: flex; flex-direction: column; }
.cash-meta {
  margin-top: .45rem;
  padding: .5rem;
  border: 1px solid rgba(3,105,161,.15);
  border-radius: 10px;
  background: #f8fcff;
}
.cash-row { display: flex; align-items: center; gap: .5rem; }
.cash-label {
  font-size: .7rem;
  font-weight: 700;
  color: var(--color-text-light);
  min-width: 90px;
}
.cash-input {
  flex: 1;
  height: 32px;
  border-radius: 8px;
  border: 1px solid var(--color-gray-border);
  padding: 0 .55rem;
  font-size: .8rem;
  font-weight: 600;
  color: var(--color-text-dark);
  background: var(--color-white);
}
.cash-input:focus {
  outline: none;
  border-color: var(--color-primary-light);
  box-shadow: 0 0 0 2px rgba(31,141,191,.15);
}
.change-row {
  display: flex;
  justify-content: space-between;
  margin-top: .45rem;
  font-size: .76rem;
  color: #166534;
}
.change-row strong { font-weight: 800; }
.change-row--insufficient { color: #b91c1c; }
.cash-warning {
  margin-top: .25rem;
  font-size: .68rem;
  font-weight: 700;
  color: #b91c1c;
}
.payment-label {
  font-size: .62rem; font-weight: 700; color: var(--color-text-light);
  text-transform: uppercase; letter-spacing: .4px;
  display: flex; align-items: center; gap: .3rem; margin-bottom: .3rem;
}
.payment-btns { display: flex; gap: .4rem; }
.pay-btn {
  flex: 1; padding: .36rem .3rem; border: 1.5px solid var(--color-gray-border);
  border-radius: 8px; background: var(--color-gray-bg);
  font-size: .72rem; font-weight: 600; color: var(--color-text-light);
  cursor: pointer; display: flex; align-items: center; justify-content: center; gap: .28rem;
  transition: all .15s; white-space: nowrap;
}
.pay-btn:hover { border-color: var(--color-primary-light); color: var(--color-primary); background: rgba(31,141,191,.05); }
.pay-btn--gcash { background: #f0fdf4; border-color: #22c55e; color: #16a34a; }
.pay-btn--cash  { background: rgba(244,196,0,.1); border-color: var(--color-gold-dark); color: #7a5200; }
.pay-check { font-size: .65rem; }

/* Checkout button */
.checkout-btn {
  width: 100%; padding: .62rem; height: 50px;
  background: var(--color-navy); color: var(--color-white);
  border: none; border-radius: 10px;
  
  font-size: .82rem; font-weight: 700; cursor: pointer;
  display: flex; align-items: center; justify-content: center; gap: .42rem;
  box-shadow: 0 3px 10px rgba(12,59,94,.25);
  transition: all .18s ease;
}
.checkout-btn:hover { background: var(--color-primary); box-shadow: 0 5px 16px rgba(3,105,161,.35); transform: translateY(-1px); }
.checkout-btn:disabled {
  cursor: not-allowed;
  opacity: .65;
  background: #64748b;
  box-shadow: none;
  transform: none;
}
.checkout-btn .checkout-amount {
  margin-left: auto;
  font-size: .72rem;
  background: rgba(255,255,255,.15);
  padding: 2px 8px; border-radius: 20px;
}

/* Search no-results state */
.items-no-results {
  display: flex; flex-direction: column; align-items: center;
  justify-content: center; gap: .5rem;
  padding: 3rem 1rem; text-align: center;
  border: 2px dashed rgba(244,196,0,.35);
  border-radius: 14px; background: rgba(244,196,0,.02);
  margin: .5rem 0;
}
.items-no-results i { font-size: 1.4rem; color: #c1c8d0; }
.items-no-results p { font-size: .85rem; color: var(--color-text-light); margin: 0; }
.items-no-results strong { color: var(--color-text-dark); }

/* ═══════════════════════════════════
   TRANSACTION SECTION
═══════════════════════════════════ */
.trans-section {
  background: var(--color-white);
  border-radius: 20px;
  border: 0.5px solid var(--color-gray-border);
  box-shadow: 0 2px 16px rgba(3,105,161,.08);
  overflow: hidden;
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  animation: fadeUp .25s ease both;
}

.trans-header {
  display: flex; justify-content: space-between; align-items: center;
  flex-wrap: wrap; gap: .75rem;
  padding: 1.1rem 1.5rem;
  background: var(--color-navy);
  border-bottom: 3px solid var(--color-gold);
}
.trans-header-left { display: flex; align-items: center; gap: .75rem; }
.trans-actions     { display: flex; gap: .5rem; flex-wrap: wrap; }

.btn-export {
  display: inline-flex; align-items: center; gap: .4rem;
  padding: .45rem 1rem; border-radius: 10px;
  font-size: .8rem; font-weight: 600; cursor: pointer;
  background: rgba(34,197,94,.15); color: #86efac;
  border: 1px solid rgba(34,197,94,.3); transition: all .15s;
}
.btn-export:hover { background: #22c55e; color: var(--color-white); border-color: #22c55e; }

.btn-returnpos {
  display: inline-flex; align-items: center; gap: .4rem;
  padding: .45rem 1rem; border-radius: 10px;
  font-size: .8rem; font-weight: 600; cursor: pointer;
  background: rgba(15, 177, 227, 0.15); color: #86e1ef;
  border: 1px solid rgba(34, 145, 197, 0.3); transition: all .15s;
}
.btn-returnpos:hover { background: #22c55e; color: var(--color-white); border-color: #22c55e; }


.btn-danger-outline {
  display: inline-flex; align-items: center; gap: .4rem;
  padding: .45rem 1rem; border-radius: 10px;
  font-size: .8rem; font-weight: 600; cursor: pointer;
  background: rgba(239,68,68,.15); color: #fca5a5;
  border: 1px solid rgba(239,68,68,.3); transition: all .15s;
}
.btn-danger-outline:hover { background: #ef4444; color: var(--color-white); border-color: #ef4444; }

.trans-table-wrap {
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding: 0 1rem .20rem;
}
.pagination-wrap {
  padding: .5rem 1.25rem .85rem;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: .45rem;
  flex-wrap: wrap;
  background: linear-gradient(180deg, rgba(255,255,255,.96) 0%, rgba(255,255,255,1) 100%);
  border-top: 1px solid var(--color-gray-border);
  position: sticky;
  bottom: 0;
  z-index: 3;
}

.pagination-btn {
  border: 1px solid var(--color-gray-border);
  background: var(--color-white);
  color: var(--color-text-dark);
  border-radius: 10px;
  min-width: 38px;
  height: 36px;
  padding: 0 .7rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: .35rem;
  font-size: .8rem;
  font-weight: 700;
  cursor: pointer;
  transition: all .15s ease;
}

.pagination-btn:hover:not(:disabled) {
  border-color: var(--color-primary-light);
  color: var(--color-primary);
  transform: translateY(-1px);
}

.pagination-btn:disabled {
  opacity: .45;
  cursor: not-allowed;
}

.pagination-btn--active {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: var(--color-white);
}

.pagination-btn--active:hover {
  color: var(--color-white);
  transform: none;
}
.trans-table { width: 100%; border-collapse: collapse; font-size: .865rem; }

.trans-table thead th {
  padding: .8rem .9rem; text-align: left;
  font-size: .68rem; font-weight: 700; color: var(--color-text-light);
  text-transform: uppercase; letter-spacing: .6px;
  background: var(--color-gray-bg);
  border-bottom: 2px solid rgba(244,196,0,.25);
  position: sticky;
  top: 0;
  z-index: 2;
}
.trans-table thead th:first-child { border-radius: 10px 0 0 0; }
.trans-table thead th:last-child  { border-radius: 0 10px 0 0; }
.text-center { text-align: center; }

.trans-row { border-bottom: 0.1px solid var(--color-gray-border); transition: background .12s; }
.trans-row:hover { background: rgba(3,105,161,.03); }
.trans-row:last-child { border-bottom: none; }
.trans-row--new { background: rgba(244,196,0,.05); border-left: 3px solid var(--color-gold); }

.trans-table td { padding: .49rem .8rem; color: var(--color-text-dark); vertical-align: middle; }

/* Trans table cells */
.receipt-cell { display: flex; align-items: center; gap: .4rem; flex-wrap: wrap; }
.receipt-no   { font-weight: 700; color: var(--color-primary); font-family: monospace; }
.new-badge    { background: var(--color-gold); color: #5a3e00; font-size: .65rem; font-weight: 800; padding: 2px 7px; border-radius: 5px; }

.items-preview { font-size: .82rem; color: var(--color-text-dark); }
.view-btn {
  background: none; border: none; cursor: pointer;
  color: var(--color-primary-light); font-size: .72rem; font-weight: 600;
  margin-top: 3px; display: inline-flex; align-items: center; gap: 4px;
  padding: 0; transition: color .12s;
}
.view-btn:hover { color: var(--color-primary); text-decoration: underline; }

.type-pill { font-size: .75rem; font-weight: 600; color: var(--color-text-light); }

.pay-badge {
  display: inline-flex; align-items: center;
  padding: 3px 10px; border-radius: 20px;
  font-size: .72rem; font-weight: 600;
}
.pay-badge--gcash { background: rgba(22,163,74,.1);  color: #15803d; border: 1px solid rgba(22,163,74,.25); }
.pay-badge--cash  { background: rgba(244,196,0,.12); color: #7a5200; border: 1px solid rgba(244,196,0,.3); }

.amount-cell { font-weight: 700; color: var(--color-text-dark); }
.date-cell   { font-size: .82rem; color: var(--color-text-dark); }
.time-cell   { font-size: .72rem; color: var(--color-text-light); margin-top: 1px; }

.tbl-acts { display: flex; gap: 4px; justify-content: center; }
.tbl-btn {
  width: 30px; height: 30px; border-radius: 8px;
  border: 1px solid var(--color-gray-border); background: var(--color-white);
  font-size: .75rem; cursor: pointer;
  display: inline-flex; align-items: center; justify-content: center;
  transition: all .15s;
}
.tbl-btn:hover { transform: translateY(-1px); }
.tbl-btn--print { color: var(--color-primary-light); }
.tbl-btn--print:hover { background: var(--color-primary-light); color: var(--color-white); border-color: var(--color-primary-light); }
.tbl-btn--dl  { color: var(--color-primary); }
.tbl-btn--dl:hover  { background: var(--color-primary); color: var(--color-white); border-color: var(--color-primary); }
.tbl-btn--cust{ color: #8b5cf6; }
.tbl-btn--cust:hover { background: #8b5cf6; color: var(--color-white); border-color: #8b5cf6; }
.tbl-btn--del { color: #ef4444; }
.tbl-btn--del:hover  { background: #ef4444; color: var(--color-white); border-color: #ef4444; }

/* Trans empty */
.trans-empty {
  display: flex; flex-direction: column; align-items: center;
  gap: .6rem; padding: 3.5rem; text-align: center;
}
.empty-icon-wrap { width: 56px; height: 56px; border-radius: 14px; background: rgba(3,105,161,.08); color: var(--color-primary-light); display: flex; align-items: center; justify-content: center; font-size: 1.4rem; }
.empty-title { font-size: .9rem; font-weight: 700; color: var(--color-text-dark); margin: 0; }
.empty-sub   { font-size: .78rem; color: var(--color-text-light); margin: 0; }

/* ═══════════════════════════════════
   MODALS
═══════════════════════════════════ */
.modal-overlay {
  position: fixed; inset: 0;
  background: rgba(12,59,94,.55); backdrop-filter: blur(6px);
  display: flex; align-items: center; justify-content: center;
  z-index: 1000; padding: 1rem;
  animation: fadeIn .2s ease;
}
.modal-box {
  background: var(--color-white); border-radius: 20px;
  width: 100%; max-width: 520px; max-height: 90vh; overflow-y: auto;
  box-shadow: 0 24px 60px rgba(12,59,94,.22);
  animation: popIn .22s ease;
}

.modal-box--customization {
  max-width: 680px;
  max-height: 94vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-box--customization .modal-head {
  padding: .9rem 1.05rem;
}

.modal-box--customization .modal-body {
  padding: .85rem 1.05rem;
  gap: .65rem;
  overflow: hidden;
}

.modal-box--customization .modal-section {
  padding: .72rem;
  border-radius: 12px;
}

.modal-box--customization .modal-section-title {
  margin: 0 0 .55rem;
  font-size: .72rem;
}

.modal-box--customization .detail-row {
  padding: .28rem 0;
}

.modal-box--customization .detail-total {
  font-size: 1.05rem;
}

.modal-box--customization .modal-foot {
  padding: .72rem 1.05rem;
}

.modal-box--customization .form-input {
  padding: .48rem .7rem;
}

.modal-box--customization textarea.form-input {
  min-height: 66px;
  max-height: 66px;
}

.modal-box--preview {
  max-width: 1260px;
  width: 98vw;
  max-height: 96vh;
}

.modal-box--preview .modal-body {
  padding: .7rem .9rem .65rem;
  gap: .55rem;
  overflow: hidden;
}

.preview-stats-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: .4rem;
}

.preview-stat-card {
  border: 1px solid var(--color-gray-border);
  border-radius: 12px;
  background: linear-gradient(180deg, #ffffff 0%, #f8fbff 100%);
  padding: .45rem .58rem;
  display: flex;
  flex-direction: column;
  gap: .12rem;
}

.preview-stat-label {
  font-size: .58rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .35px;
  color: var(--color-text-light);
  line-height: 1.2;
}

.preview-stat-value {
  font-size: .82rem;
  line-height: 1.15;
  font-weight: 800;
  color: var(--color-primary);
}

.preview-table-wrap {
  border: 1px solid var(--color-gray-border);
  border-radius: 12px;
  background: var(--color-white);
  max-height: none;
  overflow: hidden;
}

.preview-table {
  width: 100%;
  min-width: 0;
  border-collapse: separate;
  border-spacing: 0;
  font-size: .72rem;
}

.preview-table thead th {
  position: sticky;
  top: 0;
  z-index: 2;
  background: #f0f6fb;
  font-size: .6rem;
  text-transform: uppercase;
  letter-spacing: .3px;
  color: var(--color-navy);
  padding: .38rem .45rem;
  text-align: left;
  border-bottom: 1px solid var(--color-gray-border);
}

.preview-table tbody td {
  font-size: .66rem;
  padding: .33rem .45rem;
  color: var(--color-text-dark);
  border-bottom: 1px solid #edf2f7;
  vertical-align: top;
  line-height: 1.4;
}

.preview-table tbody tr:nth-child(even) td {
  background: #fbfdff;
}

.preview-table tbody td:nth-child(1) {
  font-weight: 700;
  color: var(--color-navy);
  min-width: 120px;
}

.preview-table tbody td:nth-child(2) {
  min-width: 160px;
  max-width: 240px;
}

.preview-table tbody td:nth-child(5) {
  text-align: right;
  font-weight: 700;
  color: #0f766e;
  white-space: nowrap;
}

.preview-table tbody td:nth-child(6),
.preview-table tbody td:nth-child(7) {
  white-space: nowrap;
  font-size: .62rem;
}

@media (min-width: 1024px) {
  .modal-box--preview .modal-body {
    zoom: .82;
  }
}

.modal-head {
  display: flex; justify-content: space-between; align-items: center;
  padding: 1.1rem 1.4rem;
  background: var(--color-navy);
  border-radius: 20px 20px 0 0;
  border-bottom: 3px solid var(--color-gold);
  flex-shrink: 0;
}
.modal-head-left { display: flex; align-items: center; gap: .8rem; }
.modal-head-icon {
  width: 40px; height: 40px; border-radius: 12px;
  background: rgba(255,255,255,.12);
  display: flex; align-items: center; justify-content: center;
  font-size: 1rem; color: var(--color-white); flex-shrink: 0;
}
.modal-head-icon--gold { background: rgba(244,196,0,.2); color: var(--color-gold); }
.modal-title { font-size: 1rem; font-weight: 700; color: var(--color-white); margin: 0; }
.modal-sub   { font-size: .72rem; color: rgba(255,255,255,.6); margin: 2px 0 0; }
.modal-close-btn {
  width: 32px; height: 32px; border-radius: 10px;
  background: rgba(255,255,255,.12); border: 1px solid rgba(255,255,255,.2);
  color: var(--color-white); font-size: .85rem; cursor: pointer;
  display: flex; align-items: center; justify-content: center; transition: background .15s;
}
.modal-close-btn:hover { background: rgba(255,255,255,.28); }

.modal-body { padding: 1.25rem 1.4rem; display: flex; flex-direction: column; gap: 1rem; }

.modal-section {
  background: var(--color-gray-bg);
  border: 0.5px solid var(--color-gray-border);
  border-radius: 14px; padding: 1rem;
}
.modal-section-title {
  font-size: .78rem; font-weight: 700; color: var(--color-navy);
  text-transform: uppercase; letter-spacing: .4px;
  margin: 0 0 .85rem; display: flex; align-items: center; gap: .4rem;
}
.modal-section-title i { color: var(--color-primary-light); }

.form-row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: .75rem; }
.form-group { display: flex; flex-direction: column; gap: .35rem; }
.form-label { font-size: .68rem; font-weight: 700; color: var(--color-text-light); text-transform: uppercase; letter-spacing: .4px; }
.form-input {
  width: 100%; padding: .6rem .85rem;
  border: 1.5px solid var(--color-gray-border); border-radius: 10px;
  font-size: .875rem; color: var(--color-text-dark);
  background: var(--color-white); transition: all .15s; box-sizing: border-box;
}
.form-input:focus { outline: none; border-color: var(--color-primary-light); box-shadow: 0 0 0 3px rgba(31,141,191,.1); }
.font-mono { font-family: monospace; font-size: .8rem; }

.color-row { display: flex; gap: .5rem; align-items: center; }
.color-swatch { width: 40px; height: 36px; border-radius: 8px; border: 1.5px solid var(--color-gray-border); cursor: pointer; padding: 2px; flex-shrink: 0; }

/* Detail rows (inside modal) */
.detail-grid    { display: flex; flex-direction: column; gap: .4rem; }
.detail-row {
  display: flex; justify-content: space-between; align-items: center;
  padding: .4rem 0; border-bottom: 0.5px solid var(--color-gray-border); font-size: .875rem;
}
.detail-row:last-child { border-bottom: none; }
.detail-row--total { padding-top: .6rem; border-top: 1px solid var(--color-gray-border); border-bottom: none; }
.detail-key   { color: var(--color-text-light); }
.detail-val   { font-weight: 600; color: var(--color-text-dark); }
.detail-total { font-size: 1.2rem; font-weight: 800; color: var(--color-primary); }

/* Items detail */
.items-detail-list { display: flex; flex-direction: column; gap: .45rem; }
.items-detail-row {
  display: flex; justify-content: space-between; align-items: flex-start;
  padding: .65rem .85rem;
  background: var(--color-white); border-radius: 10px;
  border: 0.5px solid var(--color-gray-border);
  border-left: 3px solid var(--color-gold);
}
.items-detail-left  { flex: 1; }
.items-detail-name  { font-weight: 600; color: var(--color-text-dark); font-size: .875rem; }
.items-detail-ref   { font-size: .7rem; color: var(--color-text-light); margin-top: 2px; display: flex; align-items: center; gap: 4px; }
.items-detail-ref i { color: var(--color-primary-light); }
.items-detail-price { font-weight: 700; color: var(--color-primary); font-size: .875rem; margin-left: .75rem; flex-shrink: 0; }

/* Food customization modal */
.customize-chip-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: .55rem;
}
.customize-chip {
  border: 1px solid var(--color-gray-border);
  border-radius: 10px;
  background: var(--color-white);
  color: var(--color-text-dark);
  padding: .6rem .5rem;
  text-align: left;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 2px;
  transition: all .14s;
}
.customize-chip span { font-size: .8rem; font-weight: 700; }
.customize-chip small { font-size: .68rem; color: var(--color-text-light); }
.customize-chip:hover { border-color: var(--color-primary-light); }
.customize-chip--active {
  border-color: var(--color-primary-light);
  background: rgba(3,105,161,.08);
  box-shadow: 0 0 0 1px rgba(3,105,161,.15);
}

.customize-addon-list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: .5rem;
}
.customize-addon-list--disabled {
  grid-template-columns: 1fr;
}
.customize-addon-empty {
  border: 1px dashed var(--color-gray-border);
  border-radius: 10px;
  padding: .65rem .7rem;
  font-size: .76rem;
  color: var(--color-text-light);
  background: #f8fafc;
}
.customize-addon-item {
  border: 1px solid var(--color-gray-border);
  border-radius: 10px;
  background: var(--color-white);
  padding: .5rem .6rem;
  display: grid;
  grid-template-columns: 16px 1fr auto;
  align-items: center;
  gap: .45rem;
  cursor: pointer;
  font-size: .78rem;
}
.customize-addon-item input { accent-color: var(--color-primary); }
.customize-addon-item strong { color: var(--color-primary); font-size: .72rem; }

.modal-foot {
  display: flex; gap: .55rem; justify-content: flex-end;
  padding: 1rem 1.4rem;
  border-top: 1px solid var(--color-gray-border);
  background: var(--color-gray-bg);
  border-radius: 0 0 20px 20px;
}
.btn-cancel {
  padding: .5rem 1.1rem; border-radius: 10px;
  background: var(--color-white); color: var(--color-text-light);
  border: 1.5px solid var(--color-gray-border);
  font-size: .875rem; font-weight: 600; cursor: pointer; transition: all .15s;
}
.btn-cancel:hover { border-color: var(--color-primary-light); color: var(--color-primary); }
.btn-action {
  padding: .5rem 1.1rem; border-radius: 10px;
  font-size: .875rem; font-weight: 700; cursor: pointer;
  border: none; display: inline-flex; align-items: center; gap: .4rem; transition: all .15s;
}
.btn-action--green   { background: #22c55e; color: var(--color-white); }
.btn-action--green:hover  { background: #16a34a; }
.btn-action--primary { background: var(--color-navy); color: var(--color-white); }
.btn-action--primary:hover { background: var(--color-primary); }
.btn-action--primary i { color: var(--color-gold); }

/* ── Toast ── */
.toast {
  position: fixed; bottom: 2rem; right: 2rem;
  display: flex; align-items: center; gap: .6rem;
  padding: .8rem 1.3rem; border-radius: 14px;
  font-size: .875rem; font-weight: 600;
  color: var(--color-white);
  box-shadow: 0 8px 28px rgba(0,0,0,.18);
  z-index: 9999;
}
.toast--success { background: #16a34a; }
.toast--error   { background: #dc2626; }
.toast-enter-active, .toast-leave-active { transition: all .28s ease; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateY(10px); }

/* ── Responsive ────────────────────────────────────────── */
@media (max-width: 768px) {
  .pos-grid { grid-template-columns: 1fr; }
  .main-content { margin-left: 0; }
  .items-topbar { flex-direction: column; align-items: flex-start; }
  .category-switch { width: 100%; justify-content: flex-start; }
  .customize-chip-grid,
  .customize-addon-list { grid-template-columns: 1fr; }
  .modal-box--customization {
    max-height: 90vh;
    overflow-y: auto;
    display: block;
  }
  .modal-box--customization .modal-body {
    overflow: visible;
  }
  .modal-box--customization textarea.form-input {
    min-height: 84px;
    max-height: 84px;
  }
  .trans-table-wrap { padding: 0 .7rem .2rem; }
  .pagination-wrap { justify-content: center; padding: .45rem .7rem .7rem; }
  .modal-box--preview { max-width: 100%; border-radius: 16px; }
  .preview-stats-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .preview-table { min-width: 760px; }
  /* responsive handled by Vue getTabStyle */
}

/* ── Thermal Receipt Preview ───────────────────────── */
.receipt-preview-paper {
  width: 290px;
  background: #fff;
  color: #111;
  padding: 18px 14px;
  border-radius: 8px;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.12);
  font-family: "Courier New", monospace;
  font-size: 13px;
  line-height: 1.45;
  border: 1px dashed #d1d5db;
}

.receipt-preview-wrap {
  display: flex;
  justify-content: center;
}

.receipt-center {
  text-align: center;
}

.receipt-title-company {
  font-size: 18px;
  font-weight: 700;
  line-height: 1.2;
}

.receipt-title-sub {
  font-size: 13px;
  margin-top: 2px;
  margin-bottom: 8px;
}

.receipt-divider {
  text-align: center;
  letter-spacing: 0.4px;
  color: #374151;
  margin: 8px 0;
  white-space: pre;
}

.receipt-meta {
  display: flex;
  flex-direction: column;
  gap: 2px;
  word-break: break-word;
}

.receipt-item-block {
  padding: 4px 0;
}

.receipt-item-row {
  padding: 2px 0;
  gap: 10px;
}

.receipt-line-between {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 10px;
}

.receipt-item-name {
  font-weight: 700;
  margin-bottom: 2px;
  word-break: break-word;
}

.receipt-item-name-inline {
  flex: 1;
  min-width: 0;
  word-break: break-word;
}

.receipt-small-inline {
  color: #4b5563;
  font-size: 11px;
}

.receipt-small {
  font-size: 11px;
  color: #4b5563;
  margin-bottom: 2px;
}

.receipt-total-row {
  font-size: 15px;
  font-weight: 700;
  margin-top: 4px;
}

.receipt-footer {
  margin-top: 10px;
  font-size: 12px;
}

/* fullscreen mode: header + pos only */
.main-content--fullscreen {
  margin-left: 0 !important;
}

.pos-fullscreen .pos-container {
  padding: 1rem 1rem 1rem;
}

.pos-fullscreen .pos-grid {
  height: calc(100vh - 64px - 2rem);
  max-height: calc(100vh - 64px - 2rem);
}

.pos-fullscreen .pay-panel {
  width: 100vw;
  height: calc(100vh - 64px);
  margin-top: 64px;
  border-left: none;
}

.pay-workspace--merged {
  grid-template-columns: 280px 1fr;
}

.pay-order-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: .75rem;
  margin-bottom: .6rem;
}

.pay-main-col {
  background: var(--color-white);
  border: 1px solid var(--color-gray-border);
  border-radius: 14px;
  box-shadow: 0 2px 10px rgba(3,105,161,.06);
  display: flex;
  flex-direction: column;
  min-height: 0;
  padding: .85rem;
}

.pay-main-col .pay-keypad {
  margin-top: auto;
}

.pay-action--cancel {
  min-width: 118px;
  height: 40px;
  border-radius: 10px;
  border: 1px solid #ef4444;
  background: #ef4444;
  color: #fff;
  font-size: .8rem;
  font-weight: 700;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: .4rem;
  transition: all .15s ease;
}

.pay-action--cancel:hover {
  background: #dc2626;
  border-color: #dc2626;
}

@media (max-width: 1100px) {
  .pay-workspace--merged {
    grid-template-columns: 1fr;
  }
}

/* ── srp-* shared print report classes ── */
.sales-preview-overlay {
  position: fixed;
  inset: 0;
  z-index: 1300;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: .45rem;
  background: rgba(12,59,94,.55);
  backdrop-filter: blur(4px);
}
.sales-preview-modal {
  background: #fff;
  border: 2px solid #f4c400;
  border-radius: 10px;
  box-shadow: 0 20px 48px rgba(15,23,42,.35);
  width: min(1240px, 98vw);
  max-height: 96vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.sales-preview-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: .65rem 1rem;
  border-bottom: 2px solid #0c3b5e;
  background: #0c3b5e;
  color: #fff;
  flex-shrink: 0;
}
.sales-preview-toolbar h3 { margin: 0; font-size: .92rem; color: #f4c400; }
.sales-preview-toolbar p  { margin: 2px 0 0; font-size: .72rem; color: #93c5fd; }
.sales-preview-actions { display: flex; gap: .45rem; }
.sales-preview-scroll { flex: 1; overflow-y: auto; padding: 1rem; }
.sales-report-print { width: 100%; background: #fff; }
.srp-header {
  display: grid;
  grid-template-columns: 52px 1fr auto;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  background: #0c3b5e;
  color: #fff;
  border-radius: 6px 6px 0 0;
  margin-bottom: 10px;
}
.srp-logo {
  width: 44px; height: 44px;
  border-radius: 8px;
  background: #0c3b5e;
  color: #f4c400;
  font-weight: 800; font-size: 14px;
  display: flex; align-items: center; justify-content: center;
  border: 2px solid #f4c400;
}
.srp-header h2 { margin: 0; font-size: 15px; color: #fff; }
.srp-header p  { margin: 2px 0 0; font-size: 10px; color: #93c5fd; }
.srp-meta { text-align: right; font-size: 9px; color: #93c5fd; }
.srp-meta strong { display: block; color: #fde68a; }
.srp-section { margin: 10px 0; padding: 8px 12px; border: 1px solid #e2e8f0; border-radius: 6px; }
.srp-section h4 { margin: 0 0 8px; font-size: 11px; color: #0c3b5e; font-weight: 700; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; }
.srp-title-row { display: flex; justify-content: space-between; align-items: flex-start; }
.srp-title-row h3 { margin: 0; font-size: 12px; color: #0c3b5e; }
.srp-title-row p  { margin: 2px 0 0; font-size: 9px; color: #64748b; }
.srp-cards { display: flex; gap: 8px; padding: 8px 0; margin: 8px 0; flex-wrap: wrap; }
.srp-card { flex: 1; min-width: 140px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; }
.srp-card span { display: block; font-size: 8px; text-transform: uppercase; letter-spacing: 0.04em; color: #64748b; margin-bottom: 2px; }
.srp-card strong { font-size: 16px; font-weight: 800; color: #1e293b; }
.srp-table { width: 100%; border-collapse: collapse; font-size: 9px; }
.srp-table th { background: #f0f6fb; color: #0c3b5e; font-weight: 700; font-size: 8px; text-transform: uppercase; padding: 5px 6px; border: 1px solid #e2e8f0; text-align: left; }
.srp-table td { padding: 4px 6px; border: 1px solid #e2e8f0; color: #1e293b; }
.srp-table tr:nth-child(even) td { background: #f8fafc; }
.btn-download {
  display: inline-flex; align-items: center; gap: .4rem;
  background: #f4c400; color: #0c3b5e;
  border: none; border-radius: 7px;
  padding: .45rem .95rem; font-size: .8rem; font-weight: 700;
  cursor: pointer; transition: background .18s;
}
.btn-download:not(:disabled):hover { background: #ffd700; }
.btn-preview {
  display: inline-flex; align-items: center; gap: .4rem;
  background: rgba(255,255,255,.12); color: #fff;
  border: 1px solid rgba(255,255,255,.28); border-radius: 7px;
  padding: .45rem .95rem; font-size: .8rem; font-weight: 600;
  cursor: pointer; transition: background .18s;
}
.btn-preview:not(:disabled):hover { background: rgba(255,255,255,.22); }
</style>