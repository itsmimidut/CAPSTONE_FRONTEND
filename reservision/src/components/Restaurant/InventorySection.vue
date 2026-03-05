<template>
  <div class="inventory-section">

    <!-- Section Header -->
    <div class="section-header">
      <div class="header-left">
        <h2 class="section-title">Inventory Management</h2>
        <p class="section-subtitle">Track and manage restaurant stock levels</p>
      </div>
      <div class="header-buttons">
        <button class="btn-header btn-outline-blue" @click="showMenuIngredientsModal = true">
          <i class="fas fa-link"></i> View Menu Links
        </button>
        <button class="btn-header btn-outline-blue" @click="showAddIngredientsModal = true">
          <i class="fas fa-plus-circle"></i> Link Ingredients
        </button>
        <button class="btn-header btn-blue" @click="showAddItemModal = true">
          <i class="fas fa-plus"></i> Add New Item
        </button>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="stats-row">
      <div class="stat-card">
        <div class="stat-icon icon-blue">
          <i class="fas fa-boxes"></i>
        </div>
        <div class="stat-body">
          <div class="stat-value">{{ inventory.length }}</div>
          <div class="stat-label">Total Items</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon icon-green">
          <i class="fas fa-check-circle"></i>
        </div>
        <div class="stat-body">
          <div class="stat-value">{{ inventory.filter(i => i.status === 'good').length }}</div>
          <div class="stat-label">Well Stocked</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon icon-amber">
          <i class="fas fa-exclamation-triangle"></i>
        </div>
        <div class="stat-body">
          <div class="stat-value">{{ inventory.filter(i => i.status === 'low').length }}</div>
          <div class="stat-label">Low Stock</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon icon-red">
          <i class="fas fa-times-circle"></i>
        </div>
        <div class="stat-body">
          <div class="stat-value">{{ inventory.filter(i => i.status === 'critical').length }}</div>
          <div class="stat-label">Critical</div>
        </div>
      </div>
    </div>

    <!-- Search and Filter -->
    <div class="controls-row">
      <div class="search-wrap">
        <i class="fas fa-search search-icon"></i>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search inventory items..."
          class="search-input"
        />
      </div>
      <select v-model="filterStatus" class="filter-select">
        <option value="">All Status</option>
        <option value="low">Low Stock</option>
        <option value="good">Good Stock</option>
        <option value="critical">Critical</option>
      </select>
    </div>

    <!-- Table -->
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
            <td>
              <StatusBadge :status="item.status" />
            </td>
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

      <!-- Empty State -->
      <div v-if="filteredInventory.length === 0" class="empty-state">
        <div class="empty-icon">
          <i class="fas fa-box-open"></i>
        </div>
        <p class="empty-title">No items found</p>
        <p class="empty-sub">Try adjusting your search or filters</p>
      </div>
    </div>

    <!-- Footer with Pagination -->
    <div class="table-footer" v-if="filteredInventory.length > 0">
      <span class="footer-info">
        Showing {{ (currentPage - 1) * 10 + 1 }}–{{ Math.min(currentPage * 10, filteredInventory.length) }} of {{ filteredInventory.length }} items
      </span>
      <div class="pagination" v-if="totalPages > 1">
        <button class="pg-btn" :disabled="currentPage === 1" @click="currentPage--">
          <i class="fas fa-chevron-left"></i>
        </button>
        <button
          v-for="page in visiblePages"
          :key="page"
          class="pg-btn"
          :class="{ active: currentPage === page }"
          @click="currentPage = page"
        >{{ page }}</button>
        <button class="pg-btn" :disabled="currentPage === totalPages" @click="currentPage++">
          <i class="fas fa-chevron-right"></i>
        </button>
      </div>
    </div>

    <!-- ── ADD ITEM MODAL ── -->
    <div v-if="showAddItemModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-box">
        <div class="modal-head">
          <h3>Add New Item</h3>
          <button class="modal-close" @click="closeModal"><i class="fas fa-times"></i></button>
        </div>
        <form @submit.prevent="handleAddItem" class="modal-body">
          <div class="form-group">
            <label>Item Name <span class="req">*</span></label>
            <input v-model="newItem.item" type="text" placeholder="e.g., Salmon Fillet" required class="form-input" />
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Quantity <span class="req">*</span></label>
              <input v-model.number="newItem.quantity" type="number" placeholder="0" required min="0" class="form-input" />
            </div>
            <div class="form-group">
              <label>Unit <span class="req">*</span></label>
              <input v-model="newItem.unit" type="text" placeholder="kg, L, pcs" required class="form-input" />
            </div>
          </div>
          <div class="form-group">
            <label>Low Stock Threshold <span class="req">*</span></label>
            <input v-model.number="newItem.threshold" type="number" placeholder="Alert level" required min="0" step="0.01" class="form-input" />
            <small class="form-hint">Alert triggers when stock falls below this number</small>
          </div>
          <div class="modal-actions">
            <button type="button" class="btn-cancel" @click="closeModal">Cancel</button>
            <button type="submit" class="btn-blue btn-header">
              <i class="fas fa-plus"></i> Add Item
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- ── EDIT ITEM MODAL ── -->
    <div v-if="showEditModal" class="modal-overlay" @click.self="closeEditModal">
      <div class="modal-box">
        <div class="modal-head">
          <h3>Edit Item</h3>
          <button class="modal-close" @click="closeEditModal"><i class="fas fa-times"></i></button>
        </div>
        <form @submit.prevent="handleEditSubmit" class="modal-body">
          <div class="form-group">
            <label>Item Name <span class="req">*</span></label>
            <input v-model="editingItem.item" type="text" required class="form-input" />
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Quantity <span class="req">*</span></label>
              <input v-model.number="editingItem.quantity" type="number" required min="0" class="form-input" />
            </div>
            <div class="form-group">
              <label>Unit <span class="req">*</span></label>
              <input v-model="editingItem.unit" type="text" required class="form-input" />
            </div>
          </div>
          <div class="form-group">
            <label>Low Stock Threshold <span class="req">*</span></label>
            <input v-model.number="editingItem.threshold" type="number" required min="0" step="0.01" class="form-input" />
            <small class="form-hint">Alert triggers when stock falls below this number</small>
          </div>
          <div class="modal-actions">
            <button type="button" class="btn-cancel" @click="closeEditModal">Cancel</button>
            <button type="submit" class="btn-blue btn-header">
              <i class="fas fa-save"></i> Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- ── VIEW MENU LINKS MODAL ── -->
    <div v-if="showMenuIngredientsModal" class="modal-overlay" @click.self="showMenuIngredientsModal = false">
      <div class="modal-box modal-wide">
        <div class="modal-head">
          <h3><i class="fas fa-link"></i> Menu–Inventory Links</h3>
          <button class="modal-close" @click="showMenuIngredientsModal = false"><i class="fas fa-times"></i></button>
        </div>
        <div class="modal-body">
          <div class="info-banner">
            <i class="fas fa-info-circle"></i>
            <span>When customers order these menu items, linked ingredients are automatically deducted from inventory.</span>
          </div>

          <div v-if="loadingLinks" class="state-center">
            <i class="fas fa-spinner fa-spin"></i> Loading...
          </div>

          <div v-else-if="menuIngredientLinks.length === 0" class="state-center">
            <i class="fas fa-unlink" style="font-size:2rem; color:#cbd5e1; margin-bottom:.5rem;"></i>
            <p style="color:#94a3b8;">No menu items are linked to inventory yet.</p>
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
        <div class="modal-actions" style="padding: 1rem 1.5rem; border-top: 1px solid #e8edf8;">
          <button class="btn-cancel" @click="showMenuIngredientsModal = false">Close</button>
        </div>
      </div>
    </div>

    <!-- ── LINK INGREDIENTS MODAL ── -->
    <div v-if="showAddIngredientsModal" class="modal-overlay" @click.self="showAddIngredientsModal = false">
      <div class="modal-box">
        <div class="modal-head">
          <h3><i class="fas fa-plus-circle"></i> Link Ingredients to Menu</h3>
          <button class="modal-close" @click="showAddIngredientsModal = false"><i class="fas fa-times"></i></button>
        </div>
        <form @submit.prevent="handleAddMenuIngredient" class="modal-body">
          <div class="form-group">
            <label>Select Menu Item <span class="req">*</span></label>
            <select v-model="selectedMenuId" required class="form-input">
              <option value="">Choose a menu item...</option>
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
            <label>Add Ingredient <span class="req">*</span></label>
            <div class="ing-input-row">
              <select v-model="newIngredient.inventory_id" class="form-input" style="flex:1">
                <option value="">Select item...</option>
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
              <button type="button" class="btn-blue btn-header" @click="handleAddSingleIngredient">
                <i class="fas fa-plus"></i>
              </button>
            </div>
            <small class="form-hint">Quantity needed per serving</small>
          </div>

          <div class="modal-actions">
            <button type="button" class="btn-cancel" @click="showAddIngredientsModal = false">Cancel</button>
            <button type="submit" class="btn-blue btn-header" :disabled="!selectedMenuId">
              <i class="fas fa-save"></i> Save Links
            </button>
          </div>
        </form>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import StatusBadge from './StatusBadge.vue'
import StatCard from './StatCard.vue'

const props = defineProps({ inventory: Array })
const emit = defineEmits(['update-stock', 'edit-item', 'delete-item', 'add-item', 'update-item'])

const searchQuery = ref('')
const filterStatus = ref('')
const showAddItemModal = ref(false)
const showEditModal = ref(false)
const showMenuIngredientsModal = ref(false)
const showAddIngredientsModal = ref(false)
const menuIngredientLinks = ref([])
const loadingLinks = ref(false)
const availableMenus = ref([])
const selectedMenuId = ref('')
const newIngredient = ref({ inventory_id: '', quantity_needed: 0 })
const addedIngredientsBuffer = ref([])
const editingItem = ref(null)
const imagePreview = ref('')
const editImagePreview = ref('')

const newItem = ref({ item: '', quantity: 0, unit: '', threshold: 0, image_url: '' })

const currentPage = ref(1)
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
  const pages = []
  const max = 5
  let start = Math.max(1, currentPage.value - Math.floor(max / 2))
  let end = Math.min(totalPages.value, start + max - 1)
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
  if (editingItem.value) {
    emit('update-item', {
      id: editingItem.value.id || editingItem.value.inventory_id,
      item_name: editingItem.value.item || editingItem.value.item_name,
      quantity: editingItem.value.quantity,
      unit: editingItem.value.unit,
      threshold: editingItem.value.threshold
    })
    closeEditModal()
  }
}

const closeEditModal = () => { showEditModal.value = false; editingItem.value = null; editImagePreview.value = '' }

const handleDelete = (item) => {
  if (confirm(`Delete "${item.item || item.item_name}"?`))
    emit('delete-item', item.id || item.inventory_id)
}

const handleAddItem = () => {
  if (newItem.value.item && newItem.value.quantity >= 0 && newItem.value.unit && newItem.value.threshold >= 0) {
    emit('add-item', {
      item_name: newItem.value.item,
      quantity: newItem.value.quantity,
      unit: newItem.value.unit,
      threshold: newItem.value.threshold
    })
    closeModal()
  }
}

const closeModal = () => {
  showAddItemModal.value = false
  newItem.value = { item: '', quantity: 0, unit: '', threshold: 0, image_url: '' }
  imagePreview.value = ''
}

const fetchMenuIngredientLinks = async () => {
  loadingLinks.value = true
  try {
    const res = await fetch('http://localhost:8000/api/restaurant/menu-with-ingredients')
    const data = await res.json()
    if (data.success) {
      menuIngredientLinks.value = data.data.filter(m => m.ingredients?.length > 0 && m.ingredients[0]?.inventory_id)
    }
  } catch (e) { console.error(e) }
  finally { loadingLinks.value = false }
}

const fetchAvailableMenus = async () => {
  try {
    const res = await fetch('http://localhost:8000/api/restaurant/menu')
    const data = await res.json()
    availableMenus.value = Array.isArray(data) ? data : (data.data || [])
  } catch (e) { console.error(e) }
}

const handleAddSingleIngredient = () => {
  if (!newIngredient.value.inventory_id || !newIngredient.value.quantity_needed) {
    alert('Please select an item and specify quantity')
    return
  }
  const invItem = props.inventory.find(i => (i.id || i.inventory_id) === Number(newIngredient.value.inventory_id))
  if (!invItem) return
  const already = selectedMenuCurrentIngredients.value.some(i => i.inventory_id === Number(newIngredient.value.inventory_id))
  if (already) { alert('Already linked to this menu item'); return }
  addedIngredientsBuffer.value.push({
    inventory_id: Number(newIngredient.value.inventory_id),
    quantity_needed: newIngredient.value.quantity_needed,
    item_name: invItem.item || invItem.item_name,
    unit: invItem.unit
  })
  newIngredient.value = { inventory_id: '', quantity_needed: 0 }
}

const handleAddMenuIngredient = async () => {
  if (!selectedMenuId.value || addedIngredientsBuffer.value.length === 0) {
    alert('Please select a menu item and add at least one ingredient')
    return
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
    const res = await fetch(`http://localhost:8000/api/restaurant/menu-ingredients/${id}`, { method: 'DELETE' })
    const data = await res.json()
    if (data.success) { await fetchMenuIngredientLinks(); alert('Removed successfully!') }
  } catch (e) { console.error(e) }
}

const closeAddIngredientsModal = () => {
  showAddIngredientsModal.value = false
  selectedMenuId.value = ''
  newIngredient.value = { inventory_id: '', quantity_needed: 0 }
  addedIngredientsBuffer.value = []
}

watch([searchQuery, filterStatus], () => { currentPage.value = 1 })
watch(showAddIngredientsModal, v => { if (v) { fetchAvailableMenus(); fetchMenuIngredientLinks() } })
watch(showMenuIngredientsModal, v => { if (v) fetchMenuIngredientLinks() })
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

* { box-sizing: border-box; margin: 0; padding: 0; }

.inventory-section {
  font-family: 'Plus Jakarta Sans', sans-serif;
  background: #fff;
  border-radius: 16px;
  border: 1px solid #e8edf8;
  box-shadow: 0 1px 8px rgba(59, 103, 230, 0.06);
  overflow: hidden;
}

/* ── Header ── */
.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem 1.75rem;
  border-bottom: 1px solid #e8edf8;
  flex-wrap: wrap;
  gap: 1rem;
}

.section-title {
  font-size: 1.1rem;
  font-weight: 800;
  color: #0f1b4c;
  letter-spacing: -0.3px;
}

.section-subtitle {
  font-size: 0.78rem;
  color: #8b96b8;
  font-weight: 500;
  margin-top: 2px;
}

.header-buttons {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  flex-wrap: wrap;
}

/* Shared button base */
.btn-header {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;
  border: none;
  transition: all 0.18s;
  white-space: nowrap;
}

.btn-blue {
  background: #3b67e6;
  color: #fff;
}
.btn-blue:hover { background: #2d58d4; transform: translateY(-1px); }
.btn-blue:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

.btn-outline-blue {
  background: #eff4ff;
  color: #3b67e6;
  border: 1.5px solid #c7d7fd;
}
.btn-outline-blue:hover { background: #dde8ff; transform: translateY(-1px); }

/* ── Stats Row ── */
.stats-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1px;
  background: #e8edf8;
  border-bottom: 1px solid #e8edf8;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  padding: 1.1rem 1.5rem;
  background: #fff;
  transition: background 0.15s;
}
.stat-card:hover { background: #fafbff; }

.stat-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  flex-shrink: 0;
}

.icon-blue  { background: #eff4ff; color: #3b67e6; }
.icon-green { background: #f0fdf4; color: #16a34a; }
.icon-amber { background: #fffbeb; color: #d97706; }
.icon-red   { background: #fef2f2; color: #dc2626; }

.stat-value {
  font-size: 1.5rem;
  font-weight: 800;
  color: #0f1b4c;
  letter-spacing: -0.5px;
  line-height: 1;
}

.stat-label {
  font-size: 0.72rem;
  color: #8b96b8;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-top: 3px;
}

/* ── Controls ── */
.controls-row {
  display: flex;
  gap: 0.75rem;
  padding: 1.1rem 1.75rem;
  border-bottom: 1px solid #e8edf8;
  background: #fafbff;
  flex-wrap: wrap;
}

.search-wrap {
  flex: 1;
  min-width: 200px;
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 0.85rem;
  color: #8b96b8;
  font-size: 0.82rem;
}

.search-input {
  width: 100%;
  padding: 0.55rem 0.85rem 0.55rem 2.2rem;
  border: 1.5px solid #e8edf8;
  border-radius: 8px;
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 0.87rem;
  color: #0f1b4c;
  background: #fff;
  outline: none;
  transition: border-color 0.15s, box-shadow 0.15s;
}
.search-input:focus { border-color: #3b67e6; box-shadow: 0 0 0 3px rgba(59,103,230,0.1); }

.filter-select {
  padding: 0.55rem 0.85rem;
  border: 1.5px solid #e8edf8;
  border-radius: 8px;
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 0.87rem;
  color: #0f1b4c;
  background: #fff;
  cursor: pointer;
  outline: none;
  transition: border-color 0.15s;
}
.filter-select:focus { border-color: #3b67e6; }

/* ── Table ── */
.table-wrap {
  overflow-x: auto;
}

.inv-table {
  width: 100%;
  border-collapse: collapse;
}

.inv-table thead tr {
  background: #3b67e6;
}

.inv-table th {
  padding: 0.85rem 1.25rem;
  text-align: left;
  font-size: 0.73rem;
  font-weight: 700;
  color: #fff;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  white-space: nowrap;
}

.inv-table tbody tr {
  border-bottom: 1px solid #f0f4ff;
  transition: background 0.15s;
}
.inv-table tbody tr:last-child { border-bottom: none; }
.inv-table tbody tr:hover { background: #f5f8ff; }

.inv-table td {
  padding: 0.9rem 1.25rem;
  font-size: 0.87rem;
  color: #1e2a4a;
}

.td-item {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-weight: 600;
  color: #0f1b4c;
}

.item-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}
.dot-good     { background: #10b981; }
.dot-low      { background: #f59e0b; }
.dot-critical { background: #ef4444; }

.td-center { text-align: center; }
.td-unit   { color: #8b96b8; font-weight: 500; }
.td-muted  { color: #8b96b8; }

.qty-badge {
  display: inline-block;
  background: #eff4ff;
  color: #3b67e6;
  padding: 0.25rem 0.7rem;
  border-radius: 6px;
  font-weight: 700;
  font-size: 0.85rem;
}

.action-row {
  display: flex;
  gap: 0.4rem;
}

.act-btn {
  width: 34px;
  height: 34px;
  border: none;
  border-radius: 7px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 0.78rem;
  transition: all 0.18s;
}

.act-edit   { background: #fef9ec; color: #d97706; }
.act-edit:hover   { background: #fde68a; transform: translateY(-1px); }
.act-delete { background: #fef2f2; color: #dc2626; }
.act-delete:hover { background: #fecaca; transform: translateY(-1px); }

/* ── Empty State ── */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
}

.empty-icon {
  width: 56px;
  height: 56px;
  background: #f0f4ff;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #3b67e6;
  font-size: 1.4rem;
  margin-bottom: 1rem;
}

.empty-title { font-weight: 700; color: #0f1b4c; margin-bottom: 0.25rem; }
.empty-sub   { font-size: 0.82rem; color: #8b96b8; }



/* ── Modal ── */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 27, 76, 0.35);
  backdrop-filter: blur(2px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

.modal-box {
  background: #fff;
  border-radius: 14px;
  box-shadow: 0 20px 40px rgba(15, 27, 76, 0.15);
  width: 100%;
  max-width: 480px;
  max-height: 90vh;
  overflow-y: auto;
  animation: slideUp 0.22s ease;
}

.modal-wide { max-width: 820px; }

@keyframes slideUp {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
}

.modal-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #e8edf8;
}

.modal-head h3 {
  font-size: 1rem;
  font-weight: 800;
  color: #0f1b4c;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.modal-close {
  background: #f0f4ff;
  border: none;
  width: 30px;
  height: 30px;
  border-radius: 7px;
  color: #3b67e6;
  font-size: 0.85rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s;
}
.modal-close:hover { background: #dde8ff; }

.modal-body {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.1rem;
}

.form-group { display: flex; flex-direction: column; gap: 0.4rem; }

.form-group label {
  font-size: 0.78rem;
  font-weight: 700;
  color: #4b5a7a;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.req { color: #ef4444; }

.form-input {
  padding: 0.6rem 0.85rem;
  border: 1.5px solid #e8edf8;
  border-radius: 8px;
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 0.87rem;
  color: #0f1b4c;
  background: #fafbff;
  outline: none;
  transition: border-color 0.15s, box-shadow 0.15s;
  width: 100%;
}
.form-input:focus { border-color: #3b67e6; box-shadow: 0 0 0 3px rgba(59,103,230,0.1); background: #fff; }

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.85rem;
}

.form-hint {
  font-size: 0.75rem;
  color: #8b96b8;
}

.modal-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
  padding-top: 0.5rem;
  border-top: 1px solid #f0f4ff;
  margin-top: 0.5rem;
}

.btn-cancel {
  padding: 0.55rem 1.1rem;
  background: #f0f4ff;
  color: #4b5a7a;
  border: none;
  border-radius: 8px;
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.15s;
}
.btn-cancel:hover { background: #e2e9f8; }

/* ── Info Banner ── */
.info-banner {
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
  background: #eff4ff;
  border: 1px solid #c7d7fd;
  border-radius: 8px;
  padding: 0.85rem 1rem;
  font-size: 0.83rem;
  color: #2d58d4;
  margin-bottom: 1.25rem;
}

.state-center {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2.5rem;
  color: #8b96b8;
  gap: 0.5rem;
  font-size: 0.9rem;
}

/* ── Links Grid ── */
.links-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1rem;
}

.menu-card {
  border: 1px solid #e8edf8;
  border-radius: 10px;
  overflow: hidden;
}

.menu-card-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  background: #f5f8ff;
  border-bottom: 1px solid #e8edf8;
}

.menu-name { font-weight: 700; font-size: 0.88rem; color: #0f1b4c; }

.menu-cat {
  background: #eff4ff;
  color: #3b67e6;
  padding: 0.2rem 0.6rem;
  border-radius: 20px;
  font-size: 0.72rem;
  font-weight: 700;
}

.ing-list { padding: 0.6rem; display: flex; flex-direction: column; gap: 0.4rem; }

.ing-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.6rem;
  background: #fafbff;
  border-radius: 7px;
  font-size: 0.82rem;
}

.ing-name { flex: 1; font-weight: 600; color: #1e2a4a; display: flex; align-items: center; gap: 0.4rem; }
.ing-name i { color: #8b96b8; font-size: 0.75rem; }
.ing-qty  { color: #8b96b8; white-space: nowrap; }

.ing-avail {
  padding: 0.15rem 0.55rem;
  border-radius: 20px;
  font-size: 0.72rem;
  font-weight: 700;
  white-space: nowrap;
}
.status-good     { background: #d1fae5; color: #065f46; }
.status-low      { background: #fef3c7; color: #92400e; }
.status-critical { background: #fee2e2; color: #991b1b; }

/* ── Ingredient Preview ── */
.ing-preview-box {
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 8px;
  padding: 0.85rem;
}

.ing-preview-title {
  font-size: 0.75rem;
  font-weight: 700;
  color: #16a34a;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.6rem;
}

.ing-preview-row {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.5rem 0.6rem;
  background: #fff;
  border-radius: 6px;
  margin-bottom: 0.4rem;
  font-size: 0.85rem;
}
.ing-preview-row:last-child { margin-bottom: 0; }
.ing-preview-row span:first-child { flex: 1; font-weight: 600; color: #0f1b4c; }

.qty-chip {
  background: #eff4ff;
  color: #3b67e6;
  padding: 0.2rem 0.6rem;
  border-radius: 6px;
  font-weight: 700;
  font-size: 0.78rem;
}

.btn-rm {
  background: #fef2f2;
  color: #dc2626;
  border: none;
  width: 28px;
  height: 28px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 0.72rem;
  transition: background 0.15s;
}
.btn-rm:hover { background: #fecaca; }

.ing-input-row {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.qty-short { width: 90px; flex-shrink: 0; }

/* ── Responsive ── */
@media (max-width: 768px) {
  .stats-row { grid-template-columns: repeat(2, 1fr); }
  .section-header { flex-direction: column; align-items: flex-start; }
  .header-buttons { width: 100%; }
  .btn-header { flex: 1; justify-content: center; }
  .form-row { grid-template-columns: 1fr; }
  .links-grid { grid-template-columns: 1fr; }
  .ing-input-row { flex-wrap: wrap; }
  .qty-short { width: 100%; }
}

/* ── Pagination ── */
.table-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.85rem 1.75rem;
  border-top: 1px solid #e8edf8;
  background: #fafbff;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.footer-info {
  font-size: 0.78rem;
  color: #8b96b8;
  font-weight: 500;
}

.pagination {
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.pg-btn {
  min-width: 32px;
  height: 32px;
  padding: 0 0.5rem;
  border: 1.5px solid #e8edf8;
  border-radius: 7px;
  background: #fff;
  color: #4b5a7a;
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
}

.pg-btn:hover:not(:disabled) {
  border-color: #3b67e6;
  color: #3b67e6;
  background: #eff4ff;
}

.pg-btn.active {
  background: #3b67e6;
  border-color: #3b67e6;
  color: #fff;
}

.pg-btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

</style>