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
          <button class="btn-header btn-outline" @click="openInventoryPreview">
            <i class="fas fa-file-export"></i>
            Export Report
          </button>
          <button class="btn-header btn-outline" @click="showAddIngredientsModal = true">
            <i class="fas fa-plus-circle"></i> Link Ingredients
          </button>
        <button class="btn-header btn-primary" @click="showAddItemModal = true">
          <i class="fas fa-plus"></i> Add New Item
        </button>
      </div>
    </div>

    <!-- ── Stats Row ── -->
    <div class="stats-row">
      <div class="stat-chip">
        <div class="stat-icon icon-blue"><i class="fas fa-boxes"></i></div>
        <div class="stat-body">
          <div class="stat-value">{{ inventory.length }}</div>
          <div class="stat-label">Total Items</div>
        </div>
      </div>
      <div class="stat-chip">
        <div class="stat-icon icon-green"><i class="fas fa-check-circle"></i></div>
        <div class="stat-body">
          <div class="stat-value val-green">{{ inventory.filter(i => i.status === 'good').length }}</div>
          <div class="stat-label">Well Stocked</div>
        </div>
      </div>
      <div class="stat-chip">
        <div class="stat-icon icon-amber"><i class="fas fa-exclamation-triangle"></i></div>
        <div class="stat-body">
          <div class="stat-value val-amber">{{ inventory.filter(i => i.status === 'low').length }}</div>
          <div class="stat-label">Low Stock</div>
        </div>
      </div>
      <div class="stat-chip">
        <div class="stat-icon icon-red"><i class="fas fa-times-circle"></i></div>
        <div class="stat-body">
          <div class="stat-value val-red">{{ inventory.filter(i => i.status === 'critical').length }}</div>
          <div class="stat-label">Critical</div>
        </div>
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
    <div v-if="showInventoryPreview" class="report-preview-overlay" @click.self="showInventoryPreview = false">
      <div class="report-preview-modal">
        <div class="report-preview-head">
          <div>
            <h3 class="report-preview-title">Inventory Report Preview</h3>
            <p class="report-preview-sub">Review the report before downloading Excel</p>
          </div>
          <button class="modal-close-btn" @click="showInventoryPreview = false"><i class="fas fa-times"></i></button>
        </div>

        <div class="report-preview-body">
          <article v-if="inventoryPreviewReport" class="inventory-report-sheet">
            <header class="irs-header">
              <div class="irs-brand">
                <div class="irs-logo">ER</div>
                <div>
                  <h4>Eduardo's Resort</h4>
                  <p>Inventory Status Report</p>
                </div>
              </div>
              <div class="irs-meta">
                <span>Generated</span>
                <strong>{{ inventoryPreviewReport.generatedAt }}</strong>
              </div>
            </header>

            <section class="irs-filters">
              <div>
                <span>Search</span>
                <strong>{{ inventoryPreviewReport.applied.search }}</strong>
              </div>
              <div>
                <span>Status</span>
                <strong>{{ inventoryPreviewReport.applied.status }}</strong>
              </div>
              <div>
                <span>Total Visible</span>
                <strong>{{ inventoryPreviewReport.totalItems }}</strong>
              </div>
            </section>

            <section class="irs-cards">
              <div class="irs-card"><span>Total Items</span><strong>{{ inventoryPreviewReport.totalItems }}</strong></div>
              <div class="irs-card"><span>Total Quantity</span><strong>{{ inventoryPreviewReport.totalQty }}</strong></div>
              <div class="irs-card"><span>Low/Critical</span><strong>{{ inventoryPreviewReport.lowCriticalCount }}</strong></div>
              <div class="irs-card"><span>Healthy Stock</span><strong>{{ inventoryPreviewReport.healthyPct }}</strong></div>
            </section>

            <section class="irs-section">
              <h5>Status Breakdown</h5>
              <table class="irs-table">
                <thead>
                  <tr><th>Status</th><th>Count</th><th>Percent</th></tr>
                </thead>
                <tbody>
                  <tr v-for="row in inventoryPreviewReport.statusRows" :key="row.status">
                    <td>{{ row.status }}</td>
                    <td>{{ row.count }}</td>
                    <td>{{ row.percent }}</td>
                  </tr>
                </tbody>
              </table>
            </section>

            <section class="irs-section">
              <h5>Inventory Items</h5>
              <table class="irs-table">
                <thead>
                  <tr>
                    <th>Item Name</th>
                    <th>Quantity</th>
                    <th>Unit</th>
                    <th>Threshold</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="item in inventoryPreviewReport.items" :key="item.id">
                    <td>{{ item.item }}</td>
                    <td>{{ item.quantity }}</td>
                    <td>{{ item.unit }}</td>
                    <td>{{ item.threshold }}</td>
                    <td>{{ item.status }}</td>
                  </tr>
                  <tr v-if="inventoryPreviewReport.items.length === 0">
                    <td colspan="5">No inventory items found for current filter</td>
                  </tr>
                </tbody>
              </table>
            </section>
          </article>
        </div>

        <div class="report-preview-foot">
          <button class="btn-cancel" @click="showInventoryPreview = false">Cancel</button>
          <button class="btn-submit" @click="exportInventoryReport" :disabled="!inventoryPreviewReport">
            <i class="fas fa-file-excel"></i> Download Excel
          </button>
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
const showInventoryPreview     = ref(false)
const inventoryPreviewReport   = ref(null)
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

const formatPreviewDateTime = value => new Date(value).toLocaleString('en-PH', {
  month: 'short', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
})

const toStatusLabel = status => {
  const normalized = String(status || '').toLowerCase()
  if (normalized === 'good') return 'Good'
  if (normalized === 'low') return 'Low'
  if (normalized === 'critical') return 'Critical'
  return normalized ? normalized.charAt(0).toUpperCase() + normalized.slice(1) : 'Unknown'
}

const buildInventoryPreviewReport = () => {
  const statusRowsBase = ['good', 'low', 'critical'].map(status => {
    const count = filteredInventory.value.filter(item => String(item.status || '').toLowerCase() === status).length
    const total = filteredInventory.value.length
    return {
      status: toStatusLabel(status),
      count,
      percent: total ? `${((count / total) * 100).toFixed(2)}%` : '0.00%'
    }
  })

  const totalItems = filteredInventory.value.length
  const totalQty = filteredInventory.value.reduce((sum, item) => sum + Number(item.quantity || 0), 0)
  const lowCriticalCount = filteredInventory.value.filter(item => ['low', 'critical'].includes(String(item.status || '').toLowerCase())).length
  const healthyPct = totalItems ? `${((statusRowsBase[0].count / totalItems) * 100).toFixed(2)}%` : '0.00%'

  return {
    generatedAt: formatPreviewDateTime(new Date()),
    applied: {
      search: searchQuery.value || 'None',
      status: filterStatus.value ? toStatusLabel(filterStatus.value) : 'All Status'
    },
    totalItems,
    totalQty,
    lowCriticalCount,
    healthyPct,
    statusRows: statusRowsBase,
    items: filteredInventory.value.map(item => ({
      id: item.id || item.inventory_id,
      item: item.item || item.item_name || 'N/A',
      quantity: Number(item.quantity || 0),
      unit: item.unit || '-',
      threshold: Number(item.threshold || 0),
      status: toStatusLabel(item.status)
    }))
  }
}

const openInventoryPreview = () => {
  inventoryPreviewReport.value = buildInventoryPreviewReport()
  showInventoryPreview.value = true
}

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

const exportInventoryReport = async () => {
  try {
    const report = inventoryPreviewReport.value || buildInventoryPreviewReport()
    const ExcelJS = (await import('exceljs')).default
    const workbook = new ExcelJS.Workbook()
    workbook.creator = "Eduardo's Resort"
    workbook.created = new Date()

    const ws = workbook.addWorksheet('Inventory Report', {
      pageSetup: { paperSize: 9, orientation: 'portrait', fitToPage: true, fitToWidth: 1 }
    })

    ws.columns = [
      { width: 28 },
      { width: 14 },
      { width: 18 },
      { width: 16 },
      { width: 16 },
      { width: 18 }
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

    const statusRows = report.statusRows
    const totalItems = report.totalItems
    const totalQty = report.totalQty
    const lowCriticalCount = report.lowCriticalCount
    const healthyPct = report.healthyPct

    let r = 1

    ws.getCell(`A${r}`).value = 'ER'
    ws.getCell(`A${r}`).font = { bold: true, size: 14, color: { argb: C_WHITE }, name: 'Calibri' }
    ws.getCell(`A${r}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: C_LOGO_BG } }
    ws.getCell(`A${r}`).alignment = { horizontal: 'center', vertical: 'middle' }
    ws.getCell(`A${r}`).border = cardBorder

    ws.mergeCells(`B${r}:D${r}`)
    ws.getCell(`B${r}`).value = "Eduardo's Resort"
    ws.getCell(`B${r}`).font = { bold: true, size: 15, color: { argb: C_DARK_BLUE }, name: 'Calibri' }
    ws.getCell(`B${r}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: C_HDR_BG } }
    ws.getCell(`B${r}`).alignment = { horizontal: 'left', vertical: 'middle', indent: 1 }

    ws.getCell(`E${r}`).value = 'Generated'
    ws.getCell(`E${r}`).font = { size: 9, color: { argb: C_GREY_TEXT }, name: 'Calibri' }
    ws.getCell(`E${r}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: C_HDR_BG } }
    ws.getCell(`E${r}`).alignment = { horizontal: 'right' }

    ws.getCell(`F${r}`).value = report.generatedAt
    ws.getCell(`F${r}`).font = { bold: true, size: 9, color: { argb: C_DARK_BLUE }, name: 'Calibri' }
    ws.getCell(`F${r}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: C_HDR_BG } }
    ws.getCell(`F${r}`).alignment = { horizontal: 'right' }
    ws.getRow(r).height = 28
    r++

    ws.mergeCells(`A${r}:F${r}`)
    ws.getCell(`A${r}`).value = 'Inventory Status Report'
    ws.getCell(`A${r}`).font = { italic: true, size: 10, color: { argb: C_GREY_TEXT }, name: 'Calibri' }
    ws.getCell(`A${r}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: C_HDR_BG } }
    ws.getCell(`A${r}`).alignment = { horizontal: 'left', indent: 1 }
    ws.getRow(r).height = 16
    r++

    r++

    const cards = [
      { label: 'TOTAL ITEMS', value: String(totalItems) },
      { label: 'TOTAL QUANTITY', value: String(totalQty) },
      { label: 'LOW/CRITICAL', value: String(lowCriticalCount) },
      { label: 'HEALTHY STOCK', value: healthyPct }
    ]
    const cardCols = ['A', 'B', 'C', 'D']

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

    ws.mergeCells(`A${r}:F${r}`)
    secHdr(ws.getCell(`A${r}`), 'Status Breakdown')
    ws.getRow(r).height = 16
    r++

    th(ws.getCell(`A${r}`), 'Status')
    th(ws.getCell(`B${r}`), 'Count', true)
    th(ws.getCell(`C${r}`), 'Percent', true)
    r++

    statusRows.forEach((row, i) => {
      const alt = i % 2 === 1
      const percent = totalItems ? `${((row.count / totalItems) * 100).toFixed(2)}%` : '0.00%'
      td(ws.getCell(`A${r}`), row.status, false, false, alt)
      td(ws.getCell(`B${r}`), row.count, true, false, alt)
      td(ws.getCell(`C${r}`), percent, true, false, alt)
      r++
    })

    r++

    ws.mergeCells(`A${r}:F${r}`)
    secHdr(ws.getCell(`A${r}`), 'Inventory Items')
    ws.getRow(r).height = 16
    r++

    th(ws.getCell(`A${r}`), 'Item Name')
    th(ws.getCell(`B${r}`), 'Quantity', true)
    th(ws.getCell(`C${r}`), 'Unit')
    th(ws.getCell(`D${r}`), 'Threshold', true)
    th(ws.getCell(`E${r}`), 'Status')
    r++

    report.items.forEach((item, i) => {
      const alt = i % 2 === 1
      td(ws.getCell(`A${r}`), item.item, false, false, alt)
      td(ws.getCell(`B${r}`), item.quantity, true, false, alt)
      td(ws.getCell(`C${r}`), item.unit, false, false, alt)
      td(ws.getCell(`D${r}`), item.threshold, true, false, alt)
      td(ws.getCell(`E${r}`), String(item.status || '').toUpperCase(), false, false, alt)
      r++
    })

    if (!report.items.length) {
      td(ws.getCell(`A${r}`), 'No inventory items found for current filter')
      ws.mergeCells(`A${r}:E${r}`)
      r++
    }

    const buffer = await workbook.xlsx.writeBuffer()
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `Inventory_Report_${new Date().toISOString().split('T')[0]}.xlsx`
    document.body.appendChild(anchor)
    anchor.click()
    document.body.removeChild(anchor)
    URL.revokeObjectURL(url)
    showInventoryPreview.value = false
    alert('Inventory report exported successfully')
  } catch (e) {
    console.error(e)
    alert('Failed to export inventory report')
  }
}

watch([searchQuery, filterStatus], () => { currentPage.value = 1 })
watch(showAddIngredientsModal, v => { if (v) { fetchAvailableMenus(); fetchMenuIngredientLinks() } })
watch(showMenuIngredientsModal, v => { if (v) fetchMenuIngredientLinks() })
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

/* ────────────────────────────────────────────
   STATS ROW  — #dbeafe chips, no borders
──────────────────────────────────────────── */
.stats-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.65rem;
  margin-bottom: 1.1rem;
}

.stat-chip {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  padding: 0.55rem 0.85rem;
  background: #dbeafe;
  border-radius: 10px;
  border: none;
  box-shadow: 0 1px 4px rgba(3,105,161,0.07);
  transition: transform 0.18s ease, box-shadow 0.18s ease;
}
.stat-chip:hover { transform: translateY(-2px); box-shadow: 0 5px 14px rgba(3,105,161,0.1); }

.stat-icon {
  width: 36px; height: 36px;
  border-radius: 9px;
  display: flex; align-items: center; justify-content: center;
  font-size: 0.95rem; flex-shrink: 0;
}
.icon-blue  { background: rgba(31,141,191,0.15); color: var(--color-primary-light); }
.icon-green { background: rgba(34,197,94,0.15);  color: #15803d; }
.icon-amber { background: rgba(217,119,6,0.15);  color: #b45309; }
.icon-red   { background: rgba(239,68,68,0.15);  color: #dc2626; }

.stat-body { display: flex; flex-direction: column; }
.stat-value {
  font-size: 1.3rem; font-weight: 800; line-height: 1;
  color: var(--color-primary-light);
}
.val-green { color: #15803d; }
.val-amber { color: #b45309; }
.val-red   { color: #dc2626; }
.stat-label {
  font-size: 0.68rem; font-weight: 700;
  text-transform: uppercase; letter-spacing: 0.4px;
  color: var(--color-text-light); margin-top: 2px;
}

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

/* ── Inventory Report Preview ── */
.report-preview-overlay {
  position: fixed;
  inset: 0;
  z-index: 1100;
  background: rgba(12,59,94,0.55);
  backdrop-filter: blur(5px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: .45rem;
}

.report-preview-modal {
  width: min(1260px, 99vw);
  max-height: 98vh;
  background: #eef5fb;
  border-radius: 16px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 50px rgba(12,59,94,0.2);
}

.report-preview-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: .8rem;
  padding: .7rem .9rem;
  background: var(--color-navy);
  border-bottom: 3px solid var(--color-gold);
}

.report-preview-title {
  margin: 0;
  font-size: .95rem;
  font-weight: 800;
  color: var(--color-white);
}

.report-preview-sub {
  margin: .15rem 0 0;
  font-size: .72rem;
  color: rgba(255,255,255,.72);
}

.report-preview-body {
  padding: .55rem;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.inventory-report-sheet {
  width: min(1140px, 100%);
  background: var(--color-white);
  color: #0f172a;
  padding: 7mm;
  box-shadow: 0 4px 20px rgba(15,23,42,0.12);
  border-radius: 12px;
}

.irs-header {
  display: grid;
  grid-template-columns: 42px 1fr auto;
  gap: .5rem;
  align-items: center;
  border-bottom: 2px solid var(--color-navy);
  padding-bottom: .35rem;
}

.irs-brand {
  display: contents;
}

.irs-logo {
  width: 42px;
  height: 42px;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-navy);
  color: var(--color-gold);
  font-weight: 800;
}

.irs-header h4 {
  margin: 0;
  font-size: .92rem;
  color: var(--color-navy);
}

.irs-header p {
  margin: .15rem 0 0;
  font-size: .7rem;
  color: var(--color-text-light);
}

.irs-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: .06rem;
}

.irs-meta span {
  font-size: .62rem;
  color: var(--color-text-light);
}

.irs-meta strong {
  font-size: .72rem;
}

.irs-filters {
  margin-top: .42rem;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: .35rem;
  padding: .42rem .55rem;
  border: 1px solid #dce8f3;
  border-radius: 8px;
  background: #f0f6fb;
}

.irs-filters span,
.irs-card span {
  display: block;
  font-size: .6rem;
  color: var(--color-text-light);
  text-transform: uppercase;
  letter-spacing: .04em;
}

.irs-filters strong {
  display: block;
  margin-top: .08rem;
  font-size: .72rem;
}

.irs-cards {
  margin-top: .38rem;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: .32rem;
}

.irs-card {
  border: 1px solid #dce8f3;
  border-radius: 8px;
  padding: .34rem .4rem;
}

.irs-card strong {
  display: block;
  margin-top: .14rem;
  font-size: .8rem;
  color: var(--color-navy);
}

.irs-section {
  margin-top: .42rem;
}

.irs-section h5 {
  margin: 0 0 .2rem;
  font-size: .74rem;
  color: var(--color-navy);
}

.irs-table {
  width: 100%;
  border-collapse: collapse;
  border: 1px solid #dce8f3;
}

.irs-table th,
.irs-table td {
  border: 1px solid #dce8f3;
  padding: .24rem .3rem;
  font-size: .64rem;
  text-align: left;
}

.irs-table th {
  background: #f0f6fb;
  color: var(--color-navy);
  font-weight: 700;
}

.report-preview-foot {
  display: flex;
  justify-content: flex-end;
  gap: .6rem;
  padding: .5rem .9rem .7rem;
  border-top: 1px solid #d7e4ef;
  background: #fff;
}

@media (min-width: 1024px) {
  .inventory-report-sheet { zoom: .8; }
}

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
  .report-preview-modal { width: 100%; max-height: 94vh; }
  .report-preview-body { overflow: auto; padding: .65rem; }
  .inventory-report-sheet { width: 100%; padding: .7rem; }
  .irs-header { grid-template-columns: 1fr; }
  .irs-meta { align-items: flex-start; }
  .irs-filters { grid-template-columns: 1fr; }
  .irs-cards { grid-template-columns: repeat(2, 1fr); }
  .form-row { grid-template-columns: 1fr; }
  .links-grid { grid-template-columns: 1fr; }
  .ing-input-row { flex-wrap: wrap; }
  .qty-short { width: 100%; }
  .stats-row { grid-template-columns: 1fr 1fr; }
}
</style>