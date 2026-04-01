<template>
  <div class="inventory-section">

    <!-- ── Section Header ── -->
    <div class="section-header">
      <div class="header-left">
        <h2 class="section-title">Inventory Management</h2>
        <p class="section-subtitle">Track and manage restaurant stock levels</p>
      </div>
      <div class="header-buttons">
        <button class="btn-header btn-outline" @click="showMenuIngredientsModal = true">
          <i class="fas fa-link"></i> View Menu Links
        </button>
        <button class="btn-header btn-outline" @click="showAddIngredientsModal = true">
            <i class="fas fa-plus-circle"></i> Link Ingredients
          </button>
        <button class="btn-header btn-export" @click="openInventoryPreview">
          <i class="fas fa-download"></i> Export Report
        </button>
        <button class="btn-header btn-primary" @click="showAddItemModal = true">
          <i class="fas fa-plus"></i> Add New Item
        </button>
      </div>
    </div>

    <!-- ── Controls ── -->
    <div class="controls-bar">
      <div class="search-wrap">
        <i class="fas fa-search search-icon"></i>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search inventory items…"
          class="search-input"
        />
        <button v-if="searchQuery" class="search-clear" @click="searchQuery = ''">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <select v-model="filterStatus" class="filter-select">
        <option value="">All Status</option>
        <option value="low">Low Stock</option>
        <option value="good">Good Stock</option>
        <option value="critical">Critical</option>
      </select>
    </div>

    <!-- ── Table ── -->
    <div class="table-wrap">
      <table class="inv-table">
        <thead>
          <tr>
            <th>Item</th>
            <th>Quantity</th>
            <th>Unit</th>
            <th>Threshold</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in paginatedInventory" :key="item.id">
            <td class="td-item">
              <div class="item-dot" :class="`dot-${item.status}`"></div>
              {{ item.item }}
            </td>
            <td class="td-center">
              <span class="qty-badge">{{ item.quantity }}</span>
            </td>
            <td class="td-unit">{{ item.unit }}</td>
            <td class="td-center td-muted">{{ item.threshold }}</td>
            <td><StatusBadge :status="item.status" /></td>
            <td>
              <div class="action-row">
                <button class="act-btn act-edit" @click="handleEdit(item)" title="Edit">
                  <i class="fas fa-pencil-alt"></i>
                </button>
                <button class="act-btn act-delete" @click="handleDelete(item)" title="Delete">
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <div v-if="filteredInventory.length === 0" class="empty-state">
        <div class="empty-icon-wrap"><i class="fas fa-box-open"></i></div>
        <p class="empty-title">No items found</p>
        <p class="empty-sub">Try adjusting your search or filters</p>
      </div>
    </div>

    <!-- ── Pagination ── -->
    <div class="table-footer" v-if="filteredInventory.length > 0">
      <span class="footer-info">
        Showing {{ (currentPage - 1) * 10 + 1 }}–{{ Math.min(currentPage * 10, filteredInventory.length) }}
        of {{ filteredInventory.length }} items
      </span>
      <div class="pagination" v-if="totalPages > 1">
        <button class="pg-btn" :disabled="currentPage === 1" @click="currentPage--">
          <i class="fas fa-chevron-left"></i>
        </button>
        <button
          v-for="page in visiblePages" :key="page"
          class="pg-btn" :class="{ active: currentPage === page }"
          @click="currentPage = page"
        >{{ page }}</button>
        <button class="pg-btn" :disabled="currentPage === totalPages" @click="currentPage++">
          <i class="fas fa-chevron-right"></i>
        </button>
      </div>
    </div>

    <!-- ══ ADD ITEM MODAL ══ -->
    <div v-if="showAddItemModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-box">
        <div class="modal-head">
          <div class="modal-head-left">
            <div class="modal-head-icon"><i class="fas fa-plus"></i></div>
            <div>
              <h3 class="modal-title">Add New Item</h3>
              <p class="modal-sub">Fill in the stock details</p>
            </div>
          </div>
          <button class="modal-close-btn" @click="closeModal"><i class="fas fa-times"></i></button>
        </div>
        <form @submit.prevent="handleAddItem" class="modal-form">
          <div class="form-group">
            <label class="form-label">Item Name <span class="req">*</span></label>
            <input v-model="newItem.item" type="text" placeholder="e.g. Salmon Fillet" required class="form-input" />
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Quantity <span class="req">*</span></label>
              <input v-model.number="newItem.quantity" type="number" placeholder="0" required min="0" class="form-input" />
            </div>
            <div class="form-group">
              <label class="form-label">Unit <span class="req">*</span></label>
              <input v-model="newItem.unit" type="text" placeholder="kg, L, pcs" required class="form-input" />
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Low Stock Threshold <span class="req">*</span></label>
            <input v-model.number="newItem.threshold" type="number" placeholder="Alert level" required min="0" step="0.01" class="form-input" />
            <small class="form-hint">Alert triggers when stock falls below this number</small>
          </div>
          <div class="modal-foot">
            <button type="button" class="btn-cancel" @click="closeModal">Cancel</button>
            <button type="submit" class="btn-submit"><i class="fas fa-plus"></i> Add Item</button>
          </div>
        </form>
      </div>
    </div>

    <!-- ══ EDIT ITEM MODAL ══ -->
    <div v-if="showEditModal" class="modal-overlay" @click.self="closeEditModal">
      <div class="modal-box">
        <div class="modal-head">
          <div class="modal-head-left">
            <div class="modal-head-icon modal-head-icon--gold"><i class="fas fa-pencil-alt"></i></div>
            <div>
              <h3 class="modal-title">Edit Item</h3>
              <p class="modal-sub">Update the stock details</p>
            </div>
          </div>
          <button class="modal-close-btn" @click="closeEditModal"><i class="fas fa-times"></i></button>
        </div>
        <form @submit.prevent="handleEditSubmit" class="modal-form">
          <div class="form-group">
            <label class="form-label">Item Name <span class="req">*</span></label>
            <input v-model="editingItem.item" type="text" required class="form-input" />
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Quantity <span class="req">*</span></label>
              <input v-model.number="editingItem.quantity" type="number" required min="0" class="form-input" />
            </div>
            <div class="form-group">
              <label class="form-label">Unit <span class="req">*</span></label>
              <input v-model="editingItem.unit" type="text" required class="form-input" />
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Low Stock Threshold <span class="req">*</span></label>
            <input v-model.number="editingItem.threshold" type="number" required min="0" step="0.01" class="form-input" />
            <small class="form-hint">Alert triggers when stock falls below this number</small>
          </div>
          <div class="modal-foot">
            <button type="button" class="btn-cancel" @click="closeEditModal">Cancel</button>
            <button type="submit" class="btn-submit"><i class="fas fa-save"></i> Save Changes</button>
          </div>
        </form>
      </div>
    </div>

    <!-- ══ VIEW MENU LINKS MODAL ══ -->
    <div v-if="showMenuIngredientsModal" class="modal-overlay" @click.self="showMenuIngredientsModal = false">
      <div class="modal-box modal-wide">
        <div class="modal-head">
          <div class="modal-head-left">
            <div class="modal-head-icon"><i class="fas fa-link"></i></div>
            <div>
              <h3 class="modal-title">Menu–Inventory Links</h3>
              <p class="modal-sub">Ingredients auto-deducted on order</p>
            </div>
          </div>
          <button class="modal-close-btn" @click="showMenuIngredientsModal = false"><i class="fas fa-times"></i></button>
        </div>
        <div class="modal-form">
          <div class="info-banner">
            <i class="fas fa-info-circle"></i>
            <span>When customers order these menu items, linked ingredients are automatically deducted from inventory.</span>
          </div>

          <div v-if="loadingLinks" class="state-center">
            <i class="fas fa-spinner fa-spin"></i> Loading…
          </div>

          <div v-else-if="menuIngredientLinks.length === 0" class="state-center">
            <i class="fas fa-unlink" style="font-size:2rem;color:#c1c8d0;margin-bottom:.5rem;"></i>
            <p style="color:#6b7280;font-size:0.875rem;">No menu items are linked to inventory yet.</p>
          </div>

          <div v-else class="links-grid">
            <div v-for="menu in menuIngredientLinks" :key="menu.menu_id" class="menu-card">
              <div class="menu-card-head">
                <span class="menu-name">{{ menu.menu_name }}</span>
                <span class="menu-cat">{{ menu.category }}</span>
              </div>
              <div class="ing-list">
                <div v-for="ing in menu.ingredients" :key="ing.inventory_id" class="ing-row">
                  <span class="ing-name"><i class="fas fa-cube"></i> {{ ing.item_name }}</span>
                  <span class="ing-qty">{{ ing.quantity_needed }} {{ ing.unit }} / serving</span>
                  <span :class="`ing-avail status-${ing.status}`">{{ ing.inventory_quantity }} {{ ing.unit }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-foot modal-foot--right">
          <button class="btn-cancel" @click="showMenuIngredientsModal = false">Close</button>
        </div>
      </div>
    </div>

    <!-- ══ LINK INGREDIENTS MODAL ══ -->
    <div v-if="showAddIngredientsModal" class="modal-overlay" @click.self="showAddIngredientsModal = false">
      <div class="modal-box">
        <div class="modal-head">
          <div class="modal-head-left">
            <div class="modal-head-icon"><i class="fas fa-plus-circle"></i></div>
            <div>
              <h3 class="modal-title">Link Ingredients to Menu</h3>
              <p class="modal-sub">Connect inventory items to menu dishes</p>
            </div>
          </div>
          <button class="modal-close-btn" @click="showAddIngredientsModal = false"><i class="fas fa-times"></i></button>
        </div>
        <form @submit.prevent="handleAddMenuIngredient" class="modal-form">
          <div class="form-group">
            <label class="form-label">Select Menu Item <span class="req">*</span></label>
            <select v-model="selectedMenuId" required class="form-input">
              <option value="">Choose a menu item…</option>
              <option v-for="menu in availableMenus" :key="menu.menu_id" :value="menu.menu_id">
                {{ menu.name }} — ₱{{ menu.price }}
              </option>
            </select>
          </div>

          <div v-if="selectedMenuCurrentIngredients.length > 0" class="ing-preview-box">
            <p class="ing-preview-title">Current Ingredients</p>
            <div v-for="ing in selectedMenuCurrentIngredients" :key="ing.id" class="ing-preview-row">
              <span>{{ ing.item_name }}</span>
              <span class="qty-chip">{{ ing.quantity_needed }} {{ ing.unit }}</span>
              <button type="button" class="btn-rm" @click="handleRemoveIngredient(ing.id)">
                <i class="fas fa-trash-alt"></i>
              </button>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Add Ingredient <span class="req">*</span></label>
            <div class="ing-input-row">
              <select v-model="newIngredient.inventory_id" class="form-input" style="flex:1">
                <option value="">Select item…</option>
                <option v-for="inv in inventory" :key="inv.id" :value="inv.id || inv.inventory_id">
                  {{ inv.item || inv.item_name }} ({{ inv.quantity }} {{ inv.unit }})
                </option>
              </select>
              <input
                v-model.number="newIngredient.quantity_needed"
                type="number" placeholder="Qty"
                min="0.01" step="0.01"
                class="form-input qty-short"
              />
              <button type="button" class="btn-submit" @click="handleAddSingleIngredient">
                <i class="fas fa-plus"></i>
              </button>
            </div>
            <small class="form-hint">Quantity needed per serving</small>
          </div>

          <div class="modal-foot">
            <button type="button" class="btn-cancel" @click="showAddIngredientsModal = false">Cancel</button>
            <button type="submit" class="btn-submit" :disabled="!selectedMenuId">
              <i class="fas fa-save"></i> Save Links
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- ══ INVENTORY REPORT PREVIEW ══ -->
    <div v-if="showInventoryPreviewModal" class="sales-preview-overlay" @click.self="showInventoryPreviewModal = false">
      <div class="sales-preview-modal">
        <div class="sales-preview-toolbar">
          <div>
            <h3>Restaurant Inventory Report</h3>
            <p>Review before downloading Excel</p>
          </div>
          <div class="sales-preview-actions">
            <button class="btn-download" @click="exportInventoryReport">
              <i class="fas fa-download"></i> Download Excel
            </button>
            <button class="btn-preview" @click="printInventoryReportPreview">
              <i class="fas fa-print"></i> Print
            </button>
            <button class="btn-preview" @click="showInventoryPreviewModal = false">
              <i class="fas fa-xmark"></i> Close
            </button>
          </div>
        </div>
        <div class="sales-preview-scroll">
          <article class="sales-report-print" id="inventory-report-print">
            <header class="srp-header">
              <div class="srp-logo">ER</div>
              <div>
                <h2>Eduardo's Resort</h2>
                <p>Restaurant Inventory Report</p>
              </div>
              <div class="srp-meta">
                <span>Generated</span>
                <strong>{{ inventoryReportGenAt }}</strong>
              </div>
            </header>

            <section class="srp-section">
              <div class="srp-title-row">
                <div>
                  <h3>Inventory Report</h3>
                  <p>{{ props.inventory.length }} total items</p>
                </div>
              </div>
            </section>

            <section class="srp-cards">
              <div class="srp-card">
                <span>Total Items</span>
                <strong>{{ inventoryReportStats.total }}</strong>
              </div>
              <div class="srp-card">
                <span>Low Stock</span>
                <strong>{{ inventoryReportStats.lowStock }}</strong>
              </div>
              <div class="srp-card">
                <span>Out of Stock</span>
                <strong>{{ inventoryReportStats.outOfStock }}</strong>
              </div>
              <div class="srp-card">
                <span>Categories</span>
                <strong>{{ inventoryReportStats.categories }}</strong>
              </div>
            </section>

            <section class="srp-grid">
              <div class="srp-section">
                <h4>Category Breakdown</h4>
                <table class="srp-table">
                  <thead><tr><th>Category</th><th>Items</th></tr></thead>
                  <tbody>
                    <tr v-for="row in inventoryCategoryBreakdown" :key="row.category">
                      <td>{{ row.category || 'Uncategorized' }}</td>
                      <td>{{ row.count }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div class="srp-section">
                <h4>Low Stock Items</h4>
                <table class="srp-table">
                  <thead><tr><th>Item</th><th>Qty</th><th>Threshold</th></tr></thead>
                  <tbody>
                    <tr v-for="item in inventoryLowStockItems" :key="item.id">
                      <td>{{ item.item }}</td>
                      <td>{{ item.quantity }} {{ item.unit }}</td>
                      <td>{{ item.threshold }}</td>
                    </tr>
                    <tr v-if="!inventoryLowStockItems.length">
                      <td colspan="3">All items are sufficiently stocked.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section class="srp-section">
              <h4>Full Inventory List</h4>
              <table class="srp-table">
                <thead>
                  <tr>
                    <th>Item</th><th>Category</th><th>Qty</th><th>Unit</th>
                    <th>Threshold</th><th>Status</th><th>Supplier</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="item in props.inventory" :key="item.id">
                    <td>{{ item.item }}</td>
                    <td>{{ item.category || '-' }}</td>
                    <td>{{ item.quantity }}</td>
                    <td>{{ item.unit }}</td>
                    <td>{{ item.threshold }}</td>
                    <td>{{ item.status }}</td>
                    <td>{{ item.supplier || '-' }}</td>
                  </tr>
                </tbody>
              </table>
            </section>
          </article>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import StatusBadge from './StatusBadge.vue'

const props = defineProps({ inventory: Array })
const emit = defineEmits(['update-stock', 'edit-item', 'delete-item', 'add-item', 'update-item'])

const searchQuery    = ref('')
const filterStatus   = ref('')
const showAddItemModal         = ref(false)
const showEditModal            = ref(false)
const showMenuIngredientsModal = ref(false)
const showAddIngredientsModal  = ref(false)
const showInventoryPreviewModal = ref(false)
const inventoryReportGenAt      = ref('')
const menuIngredientLinks      = ref([])
const loadingLinks             = ref(false)
const availableMenus           = ref([])
const selectedMenuId           = ref('')
const newIngredient            = ref({ inventory_id: '', quantity_needed: 0 })
const addedIngredientsBuffer   = ref([])
const editingItem              = ref(null)
const newItem = ref({ item: '', quantity: 0, unit: '', threshold: 0, image_url: '' })

const currentPage  = ref(1)
const itemsPerPage = 10

const filteredInventory = computed(() =>
  props.inventory.filter(item => {
    const matchesSearch = item.item.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchesStatus = !filterStatus.value || item.status === filterStatus.value
    return matchesSearch && matchesStatus
  })
)

const totalPages = computed(() => Math.max(1, Math.ceil(filteredInventory.value.length / itemsPerPage)))

const paginatedInventory = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return filteredInventory.value.slice(start, start + itemsPerPage)
})

const visiblePages = computed(() => {
  const pages = [], max = 5
  let start = Math.max(1, currentPage.value - Math.floor(max / 2))
  let end   = Math.min(totalPages.value, start + max - 1)
  if (end - start < max - 1) start = Math.max(1, end - max + 1)
  for (let i = start; i <= end; i++) pages.push(i)
  return pages
})

const selectedMenuCurrentIngredients = computed(() => {
  if (!selectedMenuId.value) return []
  const menu = menuIngredientLinks.value.find(m => m.menu_id === Number(selectedMenuId.value))
  return menu?.ingredients || []
})

const handleEdit = (item) => { editingItem.value = { ...item }; showEditModal.value = true }

const handleEditSubmit = () => {
  if (!editingItem.value) return
  emit('update-item', {
    id:        editingItem.value.id || editingItem.value.inventory_id,
    item_name: editingItem.value.item || editingItem.value.item_name,
    quantity:  editingItem.value.quantity,
    unit:      editingItem.value.unit,
    threshold: editingItem.value.threshold
  })
  closeEditModal()
}

const closeEditModal = () => { showEditModal.value = false; editingItem.value = null }

const handleDelete = (item) => {
  if (confirm(`Delete "${item.item || item.item_name}"?`))
    emit('delete-item', item.id || item.inventory_id)
}

const handleAddItem = () => {
  if (newItem.value.item && newItem.value.quantity >= 0 && newItem.value.unit && newItem.value.threshold >= 0) {
    emit('add-item', {
      item_name: newItem.value.item,
      quantity:  newItem.value.quantity,
      unit:      newItem.value.unit,
      threshold: newItem.value.threshold
    })
    closeModal()
  }
}

const closeModal = () => {
  showAddItemModal.value = false
  newItem.value = { item: '', quantity: 0, unit: '', threshold: 0, image_url: '' }
}

const fetchMenuIngredientLinks = async () => {
  loadingLinks.value = true
  try {
    const res  = await fetch('http://localhost:8000/api/restaurant/menu-with-ingredients')
    const data = await res.json()
    if (data.success) {
      menuIngredientLinks.value = data.data.filter(m => m.ingredients?.length > 0 && m.ingredients[0]?.inventory_id)
    }
  } catch (e) { console.error(e) }
  finally { loadingLinks.value = false }
}

const fetchAvailableMenus = async () => {
  try {
    const res  = await fetch('http://localhost:8000/api/restaurant/menu')
    const data = await res.json()
    availableMenus.value = Array.isArray(data) ? data : (data.data || [])
  } catch (e) { console.error(e) }
}

const handleAddSingleIngredient = () => {
  if (!newIngredient.value.inventory_id || !newIngredient.value.quantity_needed) {
    alert('Please select an item and specify quantity'); return
  }
  const invItem = props.inventory.find(i => (i.id || i.inventory_id) === Number(newIngredient.value.inventory_id))
  if (!invItem) return
  if (selectedMenuCurrentIngredients.value.some(i => i.inventory_id === Number(newIngredient.value.inventory_id))) {
    alert('Already linked to this menu item'); return
  }
  addedIngredientsBuffer.value.push({
    inventory_id:     Number(newIngredient.value.inventory_id),
    quantity_needed:  newIngredient.value.quantity_needed,
    item_name:        invItem.item || invItem.item_name,
    unit:             invItem.unit
  })
  newIngredient.value = { inventory_id: '', quantity_needed: 0 }
}

const handleAddMenuIngredient = async () => {
  if (!selectedMenuId.value || addedIngredientsBuffer.value.length === 0) {
    alert('Please select a menu item and add at least one ingredient'); return
  }
  try {
    for (const ing of addedIngredientsBuffer.value) {
      await fetch(`http://localhost:8000/api/restaurant/menu/${selectedMenuId.value}/ingredients`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inventory_id: ing.inventory_id, quantity_needed: ing.quantity_needed })
      })
    }
    await fetchMenuIngredientLinks()
    closeAddIngredientsModal()
    alert('Ingredients linked successfully!')
  } catch (e) { console.error(e); alert('Error saving ingredients') }
}

const handleRemoveIngredient = async (id) => {
  if (!confirm('Remove this ingredient?')) return
  try {
    const res  = await fetch(`http://localhost:8000/api/restaurant/menu-ingredients/${id}`, { method: 'DELETE' })
    const data = await res.json()
    if (data.success) { await fetchMenuIngredientLinks(); alert('Removed successfully!') }
  } catch (e) { console.error(e) }
}

const closeAddIngredientsModal = () => {
  showAddIngredientsModal.value = false
  selectedMenuId.value = ''
  newIngredient.value  = { inventory_id: '', quantity_needed: 0 }
  addedIngredientsBuffer.value = []
}

watch([searchQuery, filterStatus], () => { currentPage.value = 1 })
watch(showAddIngredientsModal, v => { if (v) { fetchAvailableMenus(); fetchMenuIngredientLinks() } })
watch(showMenuIngredientsModal, v => { if (v) fetchMenuIngredientLinks() })

// ── Inventory Report ──
const inventoryReportStats = computed(() => ({
  total:      props.inventory.length,
  lowStock:   props.inventory.filter(i => i.quantity > 0 && i.quantity <= i.threshold).length,
  outOfStock: props.inventory.filter(i => i.quantity === 0).length,
  categories: new Set(props.inventory.map(i => i.category || 'Uncategorized')).size
}))

const inventoryCategoryBreakdown = computed(() => {
  const counts = {}
  props.inventory.forEach(i => {
    const cat = i.category || 'Uncategorized'
    counts[cat] = (counts[cat] || 0) + 1
  })
  return Object.entries(counts).map(([category, count]) => ({ category, count })).sort((a, b) => b.count - a.count)
})

const inventoryLowStockItems = computed(() =>
  props.inventory.filter(i => i.quantity <= i.threshold)
)

function openInventoryPreview() {
  inventoryReportGenAt.value = new Date().toLocaleString('en-PH', {
    month: 'short', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
  })
  showInventoryPreviewModal.value = true
}

async function exportInventoryReport() {
  const ExcelJS = (await import('exceljs')).default
  const wb = new ExcelJS.Workbook()
  const ws = wb.addWorksheet('Inventory Report')

  ws.columns = [
    { header: 'Item',      key: 'item',      width: 28 },
    { header: 'Category',  key: 'category',  width: 20 },
    { header: 'Qty',       key: 'quantity',  width: 10 },
    { header: 'Unit',      key: 'unit',      width: 10 },
    { header: 'Threshold', key: 'threshold', width: 12 },
    { header: 'Status',    key: 'status',    width: 14 },
    { header: 'Supplier',  key: 'supplier',  width: 22 },
  ]

  const hdr = ws.getRow(1)
  hdr.font = { bold: true, color: { argb: 'FFFFFFFF' } }
  hdr.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0C3B5E' } }
  hdr.alignment = { vertical: 'middle', horizontal: 'center' }
  hdr.height = 18

  props.inventory.forEach(i => {
    ws.addRow({
      item:      i.item || '-',
      category:  i.category || '-',
      quantity:  Number(i.quantity ?? 0),
      unit:      i.unit || '-',
      threshold: Number(i.threshold ?? 0),
      status:    i.status || '-',
      supplier:  i.supplier || '-',
    })
  })

  ws.eachRow((row, n) => {
    if (n === 1) return
    row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: n % 2 === 0 ? 'FFF8FAFC' : 'FFFFFFFF' } }
    row.alignment = { vertical: 'middle' }
  })

  const buf = await wb.xlsx.writeBuffer()
  const blob = new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `Inventory_Report_${new Date().toISOString().split('T')[0]}.xlsx`
  a.click()
  URL.revokeObjectURL(url)
}

function printInventoryReportPreview() {
  const el = document.getElementById('inventory-report-print')
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
    .srp-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin: 10px 0; }
    .srp-table { width: 100%; border-collapse: collapse; font-size: 9px; }
    .srp-table th { background: #f0f6fb; color: #0c3b5e; font-weight: 700; font-size: 8px; text-transform: uppercase; padding: 5px 6px; border: 1px solid #e2e8f0; text-align: left; }
    .srp-table td { padding: 4px 6px; border: 1px solid #e2e8f0; color: #1e293b; font-size: 9px; }
    .srp-table tr:nth-child(even) td { background: #f8fafc; }
    @page { size: A4 portrait; margin: 8mm; }
  `
  w.document.write(`<!DOCTYPE html><html><head><title>Inventory Report</title><style>${styles}</style></head><body>${el.outerHTML}</body></html>`)
  w.document.close()
  w.focus()
  w.print()
  w.close()
}
</script>

<style scoped>
/* ── Eduardo's Resort Color Palette ── */
.inventory-section {
  --color-primary:       #0369a1;
  --color-primary-light: #1F8DBF;
  --color-primary-dark:  #1E88B6;
  --color-gold:          #F4C400;
  --color-gold-dark:     #F2C200;
  --color-navy:          #0C3B5E;
  --color-white:         #FFFFFF;
  --color-white-soft:    rgba(255,255,255,0.1);
  --color-gray-bg:       #f9fafb;
  --color-gray-border:   #e5e7eb;
  --color-text-dark:     #1f2937;
  --color-text-light:    #6b7280;
}

/* ── Shell ── */
.inventory-section {
  background: var(--color-white);
  border-radius: 16px;
  padding: 1.25rem 1.5rem;
  box-shadow: 0 2px 10px rgba(3,105,161,0.07);
  border: none;
  font-family: 'Segoe UI', system-ui, sans-serif;
}

/* ────────────────────────────────────────────
   SECTION HEADER
──────────────────────────────────────────── */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.75rem;
  padding-bottom: 0.85rem;
  margin-bottom: 1.1rem;
  border-bottom: 1px solid rgba(3,105,161,0.1);
}

.section-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--color-navy);
  margin: 0 0 0.1rem;
  display: flex;
  align-items: center;
  gap: 0.6rem;
}
.section-title::before {
  content: '';
  display: inline-block;
  width: 3px;
  height: 1.1em;
  background: var(--color-gold);
  border-radius: 2px;
  flex-shrink: 0;
}

.section-subtitle {
  font-size: 0.78rem;
  color: var(--color-text-light);
  margin: 0;
  padding-left: 0.55rem;
}

.header-buttons { display: flex; align-items: center; gap: 0.6rem; flex-wrap: wrap; }

/* Buttons — match MenuSection exactly */
.btn-header {
  display: inline-flex; align-items: center; gap: 0.4rem;
  padding: 0.5rem 1rem;
  border-radius: 9px;
  font-size: 0.85rem; font-weight: 700;
  cursor: pointer; border: none;
  transition: all 0.18s ease;
  white-space: nowrap;
}

.btn-outline {
  background: var(--color-white);
  color: var(--color-primary);
  border: 1.5px solid rgba(3,105,161,0.25);
}
.btn-outline:hover {
  background: var(--color-gray-bg);
  border-color: var(--color-gold);
  color: var(--color-navy);
  transform: translateY(-1px);
}

.btn-primary {
  background: var(--color-navy);
  color: var(--color-white);
  box-shadow: 0 2px 8px rgba(12,59,94,0.22);
}
.btn-primary:hover {
  background: var(--color-primary);
  transform: translateY(-1px);
  box-shadow: 0 4px 14px rgba(3,105,161,0.28);
}
.btn-primary i { color: var(--color-gold); }

.btn-export {
  background: #0c3b5e;
  color: #fff;
  box-shadow: 0 2px 8px rgba(12,59,94,0.22);
}
.btn-export:hover {
  background: #0369a1;
  transform: translateY(-1px);
  box-shadow: 0 4px 14px rgba(3,105,161,0.28);
}
.btn-export i { color: #f4c400; }

/* ── Inventory Report Preview Overlay ── */
.sales-preview-overlay {
  position: fixed; inset: 0; z-index: 2100;
  background: rgba(0,0,0,0.55);
  display: flex; align-items: center; justify-content: center;
  padding: 16px;
}
.sales-preview-modal {
  background: #fff;
  border: 2px solid #f4c400;
  border-radius: 10px;
  box-shadow: 0 20px 48px rgba(15,23,42,.35);
  width: min(1240px, 98vw);
  max-height: 96vh;
  display: flex; flex-direction: column;
  overflow: hidden;
}
.sales-preview-toolbar {
  display: flex; align-items: center; justify-content: space-between;
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
.srp-section {
  margin: 10px 0; padding: 8px 12px;
  border: 1px solid #e2e8f0; border-radius: 6px;
}
.srp-section h4 {
  margin: 0 0 8px;
  font-size: 11px; color: #0c3b5e;
  font-weight: 700;
  border-bottom: 1px solid #e2e8f0; padding-bottom: 4px;
}
.srp-title-row { display: flex; justify-content: space-between; align-items: flex-start; }
.srp-title-row h3 { margin: 0; font-size: 12px; color: #0c3b5e; }
.srp-title-row p  { margin: 2px 0 0; font-size: 9px; color: #64748b; }
.srp-cards { display: flex; gap: 8px; padding: 8px 0; margin: 8px 0; flex-wrap: wrap; }
.srp-card { flex: 1; min-width: 140px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; }
.srp-card span { display: block; font-size: 8px; text-transform: uppercase; letter-spacing: 0.04em; color: #64748b; margin-bottom: 2px; }
.srp-card strong { font-size: 16px; font-weight: 800; color: #1e293b; }
.srp-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin: 10px 0; }
.srp-table { width: 100%; border-collapse: collapse; font-size: 9px; }
.srp-table th {
  background: #f0f6fb; color: #0c3b5e;
  font-weight: 700; font-size: 8px; text-transform: uppercase;
  padding: 5px 6px; border: 1px solid #e2e8f0; text-align: left;
}
.srp-table td { padding: 4px 6px; border: 1px solid #e2e8f0; color: #1e293b; font-size: 9px; }
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

/* ────────────────────────────────────────────
   CONTROLS BAR  — #dbeafe bg, no borders
──────────────────────────────────────────── */
.controls-bar {
  display: flex;
  gap: 0.65rem;
  flex-wrap: wrap;
  padding: 0.7rem 0.9rem;
  background: #dbeafe;
  border-radius: 10px;
  border: none;
  margin-bottom: 1.1rem;
}

.search-wrap {
  flex: 1; min-width: 200px;
  position: relative; display: flex; align-items: center;
}
.search-icon {
  position: absolute; left: 11px;
  color: var(--color-text-light); font-size: 0.82rem; pointer-events: none;
}
.search-input {
  width: 100%; height: 36px;
  padding: 0 34px 0 34px;
  border: 1px solid rgba(3,105,161,0.12);
  border-radius: 9px;
  font-size: 0.875rem; color: var(--color-text-dark);
  background: var(--color-white);
  outline: none; transition: all 0.15s;
}
.search-input:focus {
  border-color: rgba(3,105,161,0.3);
  box-shadow: 0 0 0 3px rgba(31,141,191,0.1);
}
.search-input::placeholder { color: var(--color-text-light); }
.search-clear {
  position: absolute; right: 9px;
  background: none; border: none; color: var(--color-text-light);
  font-size: 0.7rem; cursor: pointer; padding: 4px; border-radius: 50%;
  transition: color 0.15s;
}
.search-clear:hover { color: #ef4444; }

.filter-select {
  height: 36px; padding: 0 0.85rem;
  border: 1px solid rgba(3,105,161,0.12);
  border-radius: 9px;
  background: var(--color-white); color: var(--color-text-dark);
  font-size: 0.875rem; font-weight: 500;
  cursor: pointer; min-width: 148px;
  transition: border-color 0.15s;
}
.filter-select:focus {
  outline: none;
  border-color: rgba(3,105,161,0.3);
  box-shadow: 0 0 0 3px rgba(31,141,191,0.08);
}

/* ────────────────────────────────────────────
   TABLE
──────────────────────────────────────────── */
.table-wrap {
  overflow-x: auto;
  border-radius: 12px;
  background: #eff6ff;
  padding: 0 0 0.5rem;
}

.inv-table { width: 100%; border-collapse: collapse; }

/* Header: navy bg + gold accent — matches sidebar header zone */
.inv-table thead tr { background: var(--color-navy); }
.inv-table th {
  padding: 0.75rem 1.1rem;
  text-align: left;
  font-size: 0.72rem; font-weight: 700;
  color: var(--color-white);
  text-transform: uppercase; letter-spacing: 0.07em;
  white-space: nowrap;
}
/* Gold accent on first th — mirrors gold-left-bar pattern */
.inv-table th:first-child { border-left: 3px solid var(--color-gold); }

.inv-table tbody tr {
  border-bottom: 1px solid rgba(3,105,161,0.08);
  transition: background 0.15s;
  background: #eff6ff;
}
.inv-table tbody tr:last-child { border-bottom: none; }
.inv-table tbody tr:hover { background: #dbeafe; }

.inv-table td {
  padding: 0.8rem 1.1rem;
  font-size: 0.875rem;
  color: var(--color-text-dark);
}

.td-item {
  display: flex; align-items: center; gap: 0.6rem;
  font-weight: 600; color: var(--color-navy);
}

.item-dot {
  width: 7px; height: 7px;
  border-radius: 50%; flex-shrink: 0;
}
.dot-good     { background: #10b981; }
.dot-low      { background: #f59e0b; }
.dot-critical { background: #ef4444; }

.td-center { text-align: center; }
.td-unit   { color: var(--color-text-light); font-weight: 500; }
.td-muted  { color: var(--color-text-light); }

/* Qty badge: primary-light tint */
.qty-badge {
  display: inline-block;
  background: rgba(31,141,191,0.18);
  color: var(--color-primary);
  padding: 0.2rem 0.65rem;
  border-radius: 6px;
  font-weight: 700; font-size: 0.85rem;
}

.action-row { display: flex; gap: 0.35rem; }

.act-btn {
  width: 30px; height: 30px;
  border: 1px solid rgba(3,105,161,0.12);
  border-radius: 7px;
  background: var(--color-white);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; font-size: 0.75rem;
  transition: all 0.15s; color: var(--color-text-light);
}
.act-btn:hover { transform: translateY(-1px); }
.act-edit:hover   { background: var(--color-primary-light); color: var(--color-white); border-color: var(--color-primary-light); }
.act-delete:hover { background: #ef4444; color: var(--color-white); border-color: #ef4444; }

/* ── Empty State ── */
.empty-state {
  display: flex; flex-direction: column; align-items: center;
  justify-content: center; padding: 3.5rem 2rem; text-align: center;
}
.empty-icon-wrap {
  width: 52px; height: 52px; border-radius: 12px;
  background: rgba(3,105,161,0.08); color: var(--color-primary-light);
  display: flex; align-items: center; justify-content: center;
  font-size: 1.4rem; margin-bottom: 0.85rem;
}
.empty-title { font-weight: 700; color: var(--color-text-dark); margin-bottom: 0.25rem; }
.empty-sub   { font-size: 0.82rem; color: var(--color-text-light); }

/* ── Table Footer / Pagination ── */
.table-footer {
  display: flex; align-items: center;
  justify-content: space-between;
  padding: 0.75rem 0.75rem 0;
  flex-wrap: wrap; gap: 0.75rem;
}
.footer-info { font-size: 0.78rem; color: var(--color-text-light); font-weight: 500; }

.pagination { display: flex; align-items: center; gap: 0.3rem; }

.pg-btn {
  min-width: 30px; height: 30px; padding: 0 0.45rem;
  border: 1px solid rgba(3,105,161,0.15);
  border-radius: 7px; background: var(--color-white);
  color: var(--color-text-light);
  font-size: 0.82rem; font-weight: 600;
  cursor: pointer; display: flex; align-items: center; justify-content: center;
  transition: all 0.15s;
}
.pg-btn:hover:not(:disabled) {
  border-color: var(--color-primary-light);
  color: var(--color-primary-light);
  background: #eff6ff;
}
.pg-btn.active {
  background: var(--color-navy);
  border-color: var(--color-navy);
  color: var(--color-white);
}
.pg-btn:disabled { opacity: 0.35; cursor: not-allowed; }

/* ────────────────────────────────────────────
   MODALS — identical structure to MenuSection
──────────────────────────────────────────── */
.modal-overlay {
  position: fixed; inset: 0;
  background: rgba(12,59,94,0.55); backdrop-filter: blur(5px);
  display: flex; align-items: center; justify-content: center;
  z-index: 1000; padding: 1rem;
  animation: fadeIn 0.2s ease;
}
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

.modal-box {
  background: var(--color-white); border-radius: 18px;
  width: 100%; max-width: 480px;
  max-height: 90vh; overflow-y: auto;
  box-shadow: 0 20px 50px rgba(12,59,94,0.2);
  animation: slideUp 0.22s ease;
}
.modal-wide { max-width: 820px; }

@keyframes slideUp {
  from { transform: translateY(18px); opacity: 0; }
  to   { transform: translateY(0);    opacity: 1; }
}

/* Modal header: navy bg + gold bottom border */
.modal-head {
  display: flex; justify-content: space-between; align-items: center;
  padding: 1.1rem 1.4rem;
  background: var(--color-navy);
  border-radius: 18px 18px 0 0;
  border-bottom: 3px solid var(--color-gold);
}
.modal-head-left { display: flex; align-items: center; gap: 0.75rem; }

.modal-head-icon {
  width: 36px; height: 36px; border-radius: 9px;
  background: rgba(255,255,255,0.12);
  display: flex; align-items: center; justify-content: center;
  font-size: 0.95rem; color: var(--color-white); flex-shrink: 0;
}
.modal-head-icon--gold { background: rgba(244,196,0,0.2); color: var(--color-gold); }

.modal-title { font-size: 0.95rem; font-weight: 700; color: var(--color-white); margin: 0; }
.modal-sub   { font-size: 0.7rem; color: rgba(255,255,255,0.65); margin: 2px 0 0; }

.modal-close-btn {
  width: 30px; height: 30px; border-radius: 8px;
  background: rgba(255,255,255,0.12); border: 1px solid rgba(255,255,255,0.2);
  color: var(--color-white); font-size: 0.82rem; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: background 0.15s;
}
.modal-close-btn:hover { background: rgba(255,255,255,0.28); }

.modal-form {
  padding: 1.25rem 1.4rem;
  display: flex; flex-direction: column; gap: 1rem;
}

.form-group { display: flex; flex-direction: column; gap: 0.4rem; }
.form-row   { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }

.form-label {
  font-size: 0.72rem; font-weight: 700;
  color: var(--color-text-light);
  text-transform: uppercase; letter-spacing: 0.4px;
  display: block; margin-bottom: 0.2rem;
}
.req { color: #ef4444; margin-left: 2px; }

.form-input {
  width: 100%; padding: 0.62rem 0.85rem;
  border: 1.5px solid var(--color-gray-border);
  border-radius: 9px; font-size: 0.875rem;
  color: var(--color-text-dark); background: var(--color-white);
  transition: all 0.15s; box-sizing: border-box;
}
.form-input:focus {
  outline: none;
  border-color: var(--color-primary-light);
  box-shadow: 0 0 0 3px rgba(31,141,191,0.1);
}

.form-hint { font-size: 0.72rem; color: var(--color-text-light); }

.modal-foot {
  display: flex; gap: 0.6rem; justify-content: flex-end;
  padding: 1rem 1.4rem;
  border-top: 1px solid var(--color-gray-border);
  background: var(--color-gray-bg);
  border-radius: 0 0 18px 18px;
}
.modal-foot--right { justify-content: flex-end; }

.btn-cancel {
  padding: 0.52rem 1.1rem; border-radius: 9px;
  background: var(--color-white); color: var(--color-text-light);
  border: 1.5px solid var(--color-gray-border);
  font-size: 0.875rem; font-weight: 600; cursor: pointer;
  transition: all 0.15s;
}
.btn-cancel:hover { border-color: var(--color-primary-light); color: var(--color-primary); }

.btn-submit {
  padding: 0.52rem 1.2rem; border-radius: 9px;
  background: var(--color-navy); color: var(--color-white);
  border: none; font-size: 0.875rem; font-weight: 700;
  cursor: pointer; display: inline-flex; align-items: center; gap: 0.4rem;
  box-shadow: 0 2px 8px rgba(12,59,94,0.22);
  transition: all 0.15s;
}
.btn-submit:hover { background: var(--color-primary); transform: translateY(-1px); box-shadow: 0 4px 14px rgba(3,105,161,0.28); }
.btn-submit:disabled { opacity: 0.45; cursor: not-allowed; transform: none; }
.btn-submit i { color: var(--color-gold); }

/* ── Info Banner ── */
.info-banner {
  display: flex; align-items: flex-start; gap: 0.6rem;
  background: rgba(3,105,161,0.06);
  border: 1px solid rgba(3,105,161,0.15);
  border-radius: 9px; padding: 0.8rem 1rem;
  font-size: 0.82rem; color: var(--color-primary);
  margin-bottom: 1rem;
}
.info-banner i { color: var(--color-primary-light); flex-shrink: 0; margin-top: 1px; }

.state-center {
  display: flex; flex-direction: column; align-items: center;
  padding: 2.5rem; color: var(--color-text-light);
  gap: 0.5rem; font-size: 0.9rem;
}

/* ── Links Grid ── */
.links-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 0.85rem;
}

.menu-card {
  border: 1px solid var(--color-gray-border);
  border-radius: 12px; overflow: hidden;
}
.menu-card-head {
  display: flex; justify-content: space-between; align-items: center;
  padding: 0.65rem 0.9rem;
  background: #eff6ff;
  border-bottom: 1px solid var(--color-gray-border);
}
.menu-name { font-weight: 700; font-size: 0.875rem; color: var(--color-navy); }
.menu-cat {
  background: rgba(3,105,161,0.1); color: var(--color-primary);
  padding: 0.15rem 0.55rem; border-radius: 20px;
  font-size: 0.7rem; font-weight: 700;
}

.ing-list { padding: 0.5rem; display: flex; flex-direction: column; gap: 0.35rem; }
.ing-row {
  display: flex; align-items: center; gap: 0.5rem;
  padding: 0.45rem 0.6rem;
  background: var(--color-gray-bg); border-radius: 7px; font-size: 0.82rem;
}
.ing-name { flex: 1; font-weight: 600; color: var(--color-text-dark); display: flex; align-items: center; gap: 0.35rem; }
.ing-name i { color: var(--color-text-light); font-size: 0.7rem; }
.ing-qty  { color: var(--color-text-light); white-space: nowrap; }
.ing-avail { padding: 0.12rem 0.5rem; border-radius: 20px; font-size: 0.7rem; font-weight: 700; white-space: nowrap; }
.status-good     { background: #d1fae5; color: #065f46; }
.status-low      { background: #fef3c7; color: #92400e; }
.status-critical { background: #fee2e2; color: #991b1b; }

/* ── Ingredient Preview ── */
.ing-preview-box {
  background: rgba(34,197,94,0.05);
  border: 1px solid rgba(34,197,94,0.2);
  border-radius: 9px; padding: 0.85rem;
}
.ing-preview-title {
  font-size: 0.72rem; font-weight: 700; color: #15803d;
  text-transform: uppercase; letter-spacing: 0.4px; margin-bottom: 0.55rem;
}
.ing-preview-row {
  display: flex; align-items: center; gap: 0.55rem;
  padding: 0.45rem 0.6rem; background: var(--color-white);
  border-radius: 7px; margin-bottom: 0.35rem; font-size: 0.85rem;
}
.ing-preview-row:last-child { margin-bottom: 0; }
.ing-preview-row span:first-child { flex: 1; font-weight: 600; color: var(--color-text-dark); }

.qty-chip {
  background: rgba(3,105,161,0.1); color: var(--color-primary);
  padding: 0.15rem 0.55rem; border-radius: 6px;
  font-weight: 700; font-size: 0.75rem;
}

.btn-rm {
  background: rgba(239,68,68,0.08); color: #dc2626; border: none;
  width: 26px; height: 26px; border-radius: 6px;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; font-size: 0.7rem; transition: background 0.15s;
}
.btn-rm:hover { background: #fecaca; }

.ing-input-row { display: flex; gap: 0.5rem; align-items: center; }
.qty-short { width: 90px; flex-shrink: 0; }

/* ── Responsive ── */
@media (max-width: 900px) {
  .stats-row { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 768px) {
  .inventory-section { padding: 1rem; }
  .section-header { flex-direction: column; align-items: flex-start; }
  .header-buttons { width: 100%; }
  .btn-header { flex: 1; justify-content: center; }
  .form-row { grid-template-columns: 1fr; }
  .links-grid { grid-template-columns: 1fr; }
  .ing-input-row { flex-wrap: wrap; }
  .qty-short { width: 100%; }
  .stats-row { grid-template-columns: 1fr 1fr; }
}
</style>