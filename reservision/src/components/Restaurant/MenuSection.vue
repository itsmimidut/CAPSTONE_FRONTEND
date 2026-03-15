<template>
  <div class="menu-section">

    <!-- ── Section Header ── -->
    <div class="section-header">
      <div class="section-header-left">
        <h2 class="section-title">Menu Management</h2>
        <p class="section-subtitle">Manage restaurant menu items and pricing</p>
      </div>
      <div class="header-actions">
        <button class="btn-secondary" @click="showCategoryModal = true">
          <i class="fas fa-layer-group"></i>
          <span>Manage Categories</span>
        </button>
        <button class="btn-primary" @click="showAddItemModal = true">
          <i class="fas fa-plus"></i>
          <span>Add New Item</span>
        </button>
      </div>
    </div>

    <!-- ── Stats Chips ── -->
    <div class="stats-container">
      <div class="stat-chip stat-chip--blue">
        <div class="stat-chip-icon"><i class="fas fa-utensils"></i></div>
        <div class="stat-chip-body">
          <span class="stat-chip-value">{{ menu.length }}</span>
          <span class="stat-chip-label">Total Items</span>
        </div>
      </div>
      <div class="stat-chip stat-chip--green">
        <div class="stat-chip-icon"><i class="fas fa-check-circle"></i></div>
        <div class="stat-chip-body">
          <span class="stat-chip-value">{{ menu.filter(i => i.available).length }}</span>
          <span class="stat-chip-label">Available</span>
        </div>
      </div>
      <div class="stat-chip stat-chip--red">
        <div class="stat-chip-icon"><i class="fas fa-ban"></i></div>
        <div class="stat-chip-body">
          <span class="stat-chip-value">{{ menu.filter(i => !i.available).length }}</span>
          <span class="stat-chip-label">Unavailable</span>
        </div>
      </div>
    </div>

    <!-- ── Search & Filter ── -->
    <div class="controls-bar">
      <div class="search-box">
        <i class="fas fa-search search-icon"></i>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search dishes…"
          class="search-input"
        />
        <button v-if="searchQuery" class="search-clear" @click="searchQuery = ''">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <select v-model="filterCategory" class="filter-select">
        <option value="">All Categories</option>
        <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
      </select>
      <select v-model="filterAvailability" class="filter-select">
        <option value="">All Status</option>
        <option value="available">Available</option>
        <option value="unavailable">Unavailable</option>
      </select>
    </div>

    <!-- ── Menu List ── -->
    <div class="menu-list">

      <div v-if="filteredMenu.length === 0" class="empty-state">
        <div class="empty-icon-wrap"><i class="fas fa-utensils"></i></div>
        <p>No menu items found</p>
        <button class="btn-primary" @click="showAddItemModal = true">
          <i class="fas fa-plus"></i> Add Your First Item
        </button>
      </div>

      <div
        v-for="category in categories"
        :key="category"
        class="category-block"
        v-show="getItemsByCategory(category).length > 0"
      >
        <div class="category-header">
          <div class="category-header-left">
            <span class="category-dot"></span>
            <span class="category-title">{{ category }}</span>
          </div>
          <span class="category-badge">{{ getItemsByCategory(category).length }}</span>
        </div>

        <div class="items-list">
          <div
            v-for="item in getItemsByCategory(category)"
            :key="item.menu_id"
            class="list-item"
            :class="{ 'item-unavailable': !item.available }"
          >
            <div class="item-info">
              <div class="item-details">
                <span class="item-name">{{ item.name }}</span>
                <span v-if="!item.available" class="unavailable-tag">Unavailable</span>
              </div>
              <span class="item-price">₱{{ item.price }}</span>
            </div>

            <div class="item-actions">
              <button
                class="act-btn toggle-btn"
                :class="item.available ? 'toggle-btn--on' : 'toggle-btn--off'"
                @click="handleToggle(item)"
                :title="item.available ? 'Mark unavailable' : 'Mark available'"
              >
                <i :class="item.available ? 'fas fa-check-circle' : 'fas fa-times-circle'"></i>
              </button>
              <button class="act-btn edit-btn" @click="handleEdit(item)" title="Edit">
                <i class="fas fa-edit"></i>
              </button>
              <button class="act-btn delete-btn" @click="handleDelete(item)" title="Delete">
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </div>
        </div>
      </div>

    </div>

    <!-- ══ ADD ITEM MODAL ══ -->
    <div v-if="showAddItemModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-box">
        <div class="modal-head">
          <div class="modal-head-left">
            <div class="modal-head-icon">
              <i class="fas fa-plus"></i>
            </div>
            <div>
              <h3 class="modal-title">Add New Menu Item</h3>
              <p class="modal-sub">Fill in the details below</p>
            </div>
          </div>
          <button class="modal-close-btn" @click="closeModal">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <form @submit.prevent="handleAddItem" class="modal-form">
          <div class="form-group">
            <label class="form-label">Name <span class="req">*</span></label>
            <input v-model="newItem.name" type="text" placeholder="e.g. Grilled Salmon" required class="form-input" />
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Category <span class="req">*</span></label>
              <select v-model="newItem.category" required class="form-input">
                <option value="">Select category</option>
                <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Price (₱) <span class="req">*</span></label>
              <input v-model.number="newItem.price" type="number" placeholder="0" required min="0" step="0.01" class="form-input" />
            </div>
          </div>
          <div class="form-group form-checkbox-row">
            <input id="add-avail" v-model="newItem.available" type="checkbox" class="form-checkbox" />
            <label for="add-avail" class="form-label checkbox-label">Available for ordering</label>
          </div>
          <div class="modal-foot">
            <button type="button" class="btn-cancel" @click="closeModal">Cancel</button>
            <button type="submit" class="btn-primary"><i class="fas fa-plus"></i> Add Item</button>
          </div>
        </form>
      </div>
    </div>

    <!-- ══ EDIT ITEM MODAL ══ -->
    <div v-if="showEditModal" class="modal-overlay" @click.self="closeEditModal">
      <div class="modal-box">
        <div class="modal-head">
          <div class="modal-head-left">
            <div class="modal-head-icon modal-head-icon--gold">
              <i class="fas fa-edit"></i>
            </div>
            <div>
              <h3 class="modal-title">Edit Menu Item</h3>
              <p class="modal-sub">Update the item details</p>
            </div>
          </div>
          <button class="modal-close-btn" @click="closeEditModal">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <form @submit.prevent="handleEditSubmit" class="modal-form">
          <div class="form-group">
            <label class="form-label">Name <span class="req">*</span></label>
            <input v-model="editingItem.name" type="text" placeholder="e.g. Grilled Salmon" required class="form-input" />
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Category <span class="req">*</span></label>
              <select v-model="editingItem.category" required class="form-input">
                <option value="">Select category</option>
                <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Price (₱) <span class="req">*</span></label>
              <input v-model.number="editingItem.price" type="number" placeholder="0" required min="0" step="0.01" class="form-input" />
            </div>
          </div>
          <div class="form-group form-checkbox-row">
            <input id="edit-avail" v-model="editingItem.available" type="checkbox" class="form-checkbox" />
            <label for="edit-avail" class="form-label checkbox-label">Available for ordering</label>
          </div>
          <div class="modal-foot">
            <button type="button" class="btn-cancel" @click="closeEditModal">Cancel</button>
            <button type="submit" class="btn-primary btn-gold"><i class="fas fa-save"></i> Save Changes</button>
          </div>
        </form>
      </div>
    </div>

    <!-- ══ CATEGORY MODAL ══ -->
    <div v-if="showCategoryModal" class="modal-overlay" @click.self="closeCategoryModal">
      <div class="modal-box modal-box--wide">
        <div class="modal-head">
          <div class="modal-head-left">
            <div class="modal-head-icon">
              <i class="fas fa-layer-group"></i>
            </div>
            <div>
              <h3 class="modal-title">Manage Categories</h3>
              <p class="modal-sub">Add, edit or remove menu categories</p>
            </div>
          </div>
          <button class="modal-close-btn" @click="closeCategoryModal">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div class="cat-modal-body">
          <div class="cat-section">
            <h4 class="cat-section-title"><i class="fas fa-list"></i> Current Categories</h4>
            <div class="cat-list">
              <div v-for="(cat, index) in categories" :key="index" class="cat-item">
                <div v-if="editingCategoryIndex === index" class="cat-edit-row">
                  <input
                    v-model="editingCategoryValue"
                    type="text"
                    class="form-input"
                    placeholder="Category name"
                    @keyup.enter="saveEditCategory(index)"
                    @keyup.esc="cancelEditCategory"
                  />
                  <div class="cat-item-actions">
                    <button type="button" class="act-btn edit-btn" @click="saveEditCategory(index)" title="Save">
                      <i class="fas fa-check"></i>
                    </button>
                    <button type="button" class="act-btn delete-btn" @click="cancelEditCategory" title="Cancel">
                      <i class="fas fa-times"></i>
                    </button>
                  </div>
                </div>
                <div v-else class="cat-display-row">
                  <span class="cat-name"><i class="fas fa-tag cat-tag-icon"></i> {{ cat }}</span>
                  <div class="cat-item-actions">
                    <button type="button" class="act-btn edit-btn" @click="startEditCategory(index, cat)" title="Edit">
                      <i class="fas fa-edit"></i>
                    </button>
                    <button type="button" class="act-btn delete-btn" @click="deleteCategory(index)" title="Delete">
                      <i class="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
              </div>
              <div v-if="categories.length === 0" class="empty-cats">
                <i class="fas fa-folder-open"></i>
                <p>No categories yet</p>
              </div>
            </div>
          </div>

          <div class="cat-section cat-section--add">
            <h4 class="cat-section-title"><i class="fas fa-plus-circle"></i> Add New Category</h4>
            <form @submit.prevent="addCategory" class="add-cat-form">
              <input v-model="newCategory" type="text" class="form-input" placeholder="Enter category name" required />
              <button type="submit" class="btn-primary">
                <i class="fas fa-plus"></i> Add
              </button>
            </form>
          </div>

          <div class="cat-info-note">
            <i class="fas fa-info-circle"></i>
            <span>Deleting a category will affect existing menu items assigned to it.</span>
          </div>
        </div>

        <div class="modal-foot modal-foot--right">
          <button type="button" class="btn-cancel" @click="closeCategoryModal">Close</button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue'

const props = defineProps({ menu: Array })
const emit  = defineEmits(['toggle-availability', 'edit-item', 'delete-item', 'add-item', 'update-item'])

const searchQuery        = ref('')
const filterCategory     = ref('')
const filterAvailability = ref('')
const showAddItemModal   = ref(false)
const showEditModal      = ref(false)
const showCategoryModal  = ref(false)
const editingItem        = ref(null)

const categories = ref([
  'Coffee', 'Hot & Cold Latte', 'Smoothies Frappe',
  'Fruity Smoothies & Shakes', 'Sandwiches & Pastries',
  'Soup', 'Rice', 'Noodles', 'Pasta'
])
const newCategory          = ref('')
const editingCategoryIndex = ref(null)
const editingCategoryValue = ref('')

const newItem = ref({ name: '', category: '', price: 0, available: true })

const filteredMenu = computed(() =>
  props.menu.filter(item => {
    const q = searchQuery.value.toLowerCase()
    return (
      item.name.toLowerCase().includes(q) &&
      (!filterCategory.value    || item.category === filterCategory.value) &&
      (!filterAvailability.value ||
        (filterAvailability.value === 'available' ? item.available : !item.available))
    )
  })
)

const getItemsByCategory = (cat) => filteredMenu.value.filter(i => i.category === cat)

const handleToggle = (item) => emit('toggle-availability', item.menu_id)
const handleEdit   = (item) => { editingItem.value = { ...item }; showEditModal.value = true }
const handleDelete = (item) => { if (confirm(`Delete ${item.name}?`)) emit('delete-item', item.menu_id) }

const handleEditSubmit = () => {
  if (!editingItem.value) return
  emit('update-item', {
    menu_id:   editingItem.value.menu_id,
    name:      editingItem.value.name,
    category:  editingItem.value.category,
    price:     editingItem.value.price,
    available: editingItem.value.available,
  })
  closeEditModal()
}

const handleAddItem = () => {
  if (newItem.value.name && newItem.value.category && newItem.value.price >= 0) {
    emit('add-item', { ...newItem.value })
    closeModal()
  }
}

const closeModal     = () => { showAddItemModal.value = false; newItem.value = { name: '', category: '', price: 0, available: true } }
const closeEditModal = () => { showEditModal.value = false; editingItem.value = null }

const closeCategoryModal = () => {
  showCategoryModal.value    = false
  editingCategoryIndex.value = null
  editingCategoryValue.value = ''
  newCategory.value          = ''
}

const addCategory = () => {
  const t = newCategory.value.trim()
  if (!t) return
  if (categories.value.includes(t)) { alert('This category already exists'); return }
  categories.value.push(t)
  newCategory.value = ''
}

const startEditCategory = (index, value) => {
  editingCategoryIndex.value = index
  editingCategoryValue.value = value
  nextTick(() => { document.querySelector('.cat-edit-row .form-input')?.focus() })
}

const saveEditCategory = (index) => {
  const t = editingCategoryValue.value.trim()
  if (!t) { alert('Category name cannot be empty'); return }
  if (categories.value.includes(t) && categories.value[index] !== t) { alert('Category already exists'); return }
  categories.value[index] = t
  cancelEditCategory()
}

const cancelEditCategory = () => { editingCategoryIndex.value = null; editingCategoryValue.value = '' }

const deleteCategory = (index) => {
  const name  = categories.value[index]
  const count = props.menu.filter(i => i.category === name).length
  const msg   = count > 0
    ? `There are ${count} item(s) in "${name}". Delete this category anyway?`
    : `Delete category "${name}"?`
  if (confirm(msg)) categories.value.splice(index, 1)
}
</script>

<style scoped>
/* ── Eduardo's Resort Color Palette ── */
.menu-section {
  --color-primary:       #0369a1;
  --color-primary-light: #1F8DBF;
  --color-primary-dark:  #1E88B6;
  --color-gold:          #F4C400;
  --color-gold-dark:     #F2C200;
  --color-navy:          #0C3B5E;
  --color-white:         #FFFFFF;
  --color-white-soft:    rgba(255,255,255,0.1);
  --color-gray-bg:       #EEF5FB;
  --color-gray-border:   #e5e7eb;
  --color-text-dark:     #1f2937;
  --color-text-light:    #6b7280;
}

/* ── Shell ── */
.menu-section {
  background: var(--color-white);
  border-radius: 20px;
  padding: 1.5rem 1.75rem;
  box-shadow: 0 2px 16px rgba(3, 105, 161, 0.08);
  border: 0.5px solid var(--color-gray-border);
}

/* ── Section Header ── */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.75rem;
  padding-bottom: 1rem;
  margin-bottom: 1.25rem;
  border-bottom: 2px solid rgba(244, 196, 0, 0.3);
}
.section-header-left { flex: 1; min-width: 0; }

.section-title {
  font-size: 1.2rem;
  font-weight: 800;
  color: var(--color-navy);
  margin: 0 0 0.2rem;
  display: flex;
  align-items: center;
  gap: 0.65rem;
}
.section-title::before {
  content: '';
  display: inline-block;
  width: 4px;
  height: 1.1em;
  background: var(--color-gold);
  border-radius: 3px;
  flex-shrink: 0;
}

.section-subtitle {
  font-size: 0.8rem;
  color: var(--color-text-light);
  margin: 0;
  padding-left: 0.75rem;
}

/* ── Shared Buttons ── */
.header-actions { display: flex; gap: 0.6rem; flex-wrap: wrap; }

.btn-secondary {
  display: inline-flex; align-items: center; gap: 0.4rem;
  padding: 0.5rem 1rem;
  background: var(--color-white);
  color: var(--color-primary);
  border: 1.5px solid rgba(3, 105, 161, 0.25);
  border-radius: 12px;
  font-weight: 600; font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.18s ease;
}
.btn-secondary:hover {
  background: var(--color-gray-bg);
  border-color: var(--color-gold);
  color: var(--color-navy);
  transform: translateY(-1px);
}

.btn-primary {
  display: inline-flex; align-items: center; gap: 0.4rem;
  padding: 0.5rem 1.1rem;
  background: var(--color-navy);
  color: var(--color-white);
  border: none;
  border-radius: 12px;
  font-weight: 700; font-size: 0.85rem;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(12, 59, 94, 0.22);
  transition: all 0.18s ease;
}
.btn-primary:hover {
  background: var(--color-primary);
  transform: translateY(-1px);
  box-shadow: 0 4px 14px rgba(3, 105, 161, 0.28);
}
.btn-primary i { color: var(--color-gold); }

/* Gold variant for edit submit */
.btn-gold {
  background: #92700a;
}
.btn-gold:hover { background: #7a5200; }
.btn-gold i { color: #fde68a; }

/* ── Stats Chips ── */
.stats-container {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  margin-bottom: 1.25rem;
}

.stat-chip {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  padding: 0.65rem 1rem;
  border-radius: 14px;
  background: var(--color-gray-bg);
  border: 0.5px solid var(--color-gray-border);
  flex: 1;
  min-width: 120px;
  transition: transform 0.18s ease, box-shadow 0.18s ease;
}
.stat-chip:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 16px rgba(3, 105, 161, 0.1);
}

.stat-chip-icon {
  width: 38px; height: 38px;
  border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  font-size: 1rem; flex-shrink: 0;
}
.stat-chip--blue  .stat-chip-icon { background: rgba(31, 141, 191, 0.12); color: var(--color-primary-light); }
.stat-chip--green .stat-chip-icon { background: rgba(22, 163, 74, 0.12);  color: #16a34a; }
.stat-chip--red   .stat-chip-icon { background: rgba(239, 68, 68, 0.1);   color: #ef4444; }

.stat-chip-body  { display: flex; flex-direction: column; }
.stat-chip-value {
  font-size: 1.35rem; font-weight: 800; line-height: 1;
  color: var(--color-text-dark);
}
.stat-chip--blue  .stat-chip-value { color: var(--color-primary-light); }
.stat-chip--green .stat-chip-value { color: #15803d; }
.stat-chip--red   .stat-chip-value { color: #dc2626; }
.stat-chip-label {
  font-size: 0.68rem; font-weight: 700;
  text-transform: uppercase; letter-spacing: 0.5px;
  color: var(--color-text-light); margin-top: 2px;
}

/* ── Controls Bar ── */
.controls-bar {
  display: flex;
  gap: 0.65rem;
  flex-wrap: wrap;
  padding: 0.85rem 1rem;
  background: var(--color-gray-bg);
  border-radius: 14px;
  border: 0.5px solid var(--color-gray-border);
  margin-bottom: 1.25rem;
}

.search-box {
  flex: 1; min-width: 220px;
  position: relative;
  display: flex; align-items: center;
}
.search-icon {
  position: absolute; left: 12px;
  color: var(--color-text-light); font-size: 0.82rem; pointer-events: none;
}
.search-input {
  width: 100%; height: 38px;
  padding: 0 36px;
  border: 1.5px solid var(--color-gray-border);
  border-radius: 10px;
  font-size: 0.875rem; color: var(--color-text-dark);
  background: var(--color-white);
  outline: none; transition: all 0.15s;
}
.search-input:focus {
  border-color: var(--color-primary-light);
  box-shadow: 0 0 0 3px rgba(31, 141, 191, 0.1);
}
.search-input::placeholder { color: var(--color-text-light); }
.search-clear {
  position: absolute; right: 10px;
  background: none; border: none; color: var(--color-text-light);
  font-size: 0.7rem; cursor: pointer; padding: 4px; border-radius: 50%;
  transition: color 0.15s;
}
.search-clear:hover { color: #ef4444; }

.filter-select {
  height: 38px; padding: 0 0.9rem;
  border: 1.5px solid var(--color-gray-border);
  border-radius: 10px;
  background: var(--color-white);
  color: var(--color-text-dark);
  font-size: 0.875rem; font-weight: 500;
  cursor: pointer; min-width: 148px;
  transition: border-color 0.15s;
}
.filter-select:focus {
  outline: none;
  border-color: var(--color-primary-light);
  box-shadow: 0 0 0 3px rgba(31, 141, 191, 0.08);
}

/* ── Menu List ── */
.menu-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

/* ── Category Block ── */
.category-block {
  background: var(--color-gray-bg);
  border-radius: 16px;
  padding: 1rem 1.1rem;
  border: 0.5px solid var(--color-gray-border);
  height: fit-content;
  transition: box-shadow 0.18s ease, transform 0.18s ease;
}
.category-block:hover {
  box-shadow: 0 6px 20px rgba(3, 105, 161, 0.1);
  transform: translateY(-2px);
}

.category-header {
  display: flex; align-items: center; justify-content: space-between;
  padding-bottom: 0.6rem;
  margin-bottom: 0.7rem;
  border-bottom: 1.5px solid rgba(244, 196, 0, 0.25);
}
.category-header-left {
  display: flex; align-items: center; gap: 0.5rem;
}
.category-dot {
  width: 8px; height: 8px;
  border-radius: 50%;
  background: var(--color-gold);
  flex-shrink: 0;
}
.category-title {
  font-size: 0.78rem;
  font-weight: 800;
  color: var(--color-navy);
  text-transform: uppercase;
  letter-spacing: 0.6px;
}
.category-badge {
  font-size: 0.68rem; font-weight: 700;
  background: rgba(3, 105, 161, 0.08);
  color: var(--color-primary);
  border: 1px solid rgba(3, 105, 161, 0.18);
  padding: 0.1rem 0.55rem; border-radius: 20px;
}

/* ── Item Rows ── */
.items-list { display: flex; flex-direction: column; gap: 0.4rem; }

.list-item {
  display: flex; align-items: center; justify-content: space-between;
  padding: 0.55rem 0.75rem;
  background: var(--color-white);
  border: 0.5px solid var(--color-gray-border);
  border-radius: 10px;
  gap: 0.65rem;
  transition: all 0.15s ease;
}
.list-item:hover {
  background: rgba(31, 141, 191, 0.05);
  border-color: rgba(31, 141, 191, 0.25);
  transform: translateX(3px);
  box-shadow: 0 2px 8px rgba(3, 105, 161, 0.08);
}
.list-item.item-unavailable {
  opacity: 0.58;
  background: rgba(239, 68, 68, 0.03);
  border-left: 3px solid #ef4444;
  border-radius: 0 10px 10px 0;
}

.item-info {
  display: flex; align-items: center;
  justify-content: space-between; flex: 1; gap: 0.75rem; min-width: 0;
}
.item-details { display: flex; align-items: center; gap: 0.5rem; min-width: 0; }
.item-name {
  font-size: 0.875rem; font-weight: 600;
  color: var(--color-text-dark);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.unavailable-tag {
  font-size: 0.62rem; font-weight: 700;
  text-transform: uppercase; letter-spacing: 0.4px; white-space: nowrap;
  background: rgba(239, 68, 68, 0.1); color: #dc2626;
  border: 1px solid rgba(239, 68, 68, 0.22);
  padding: 0.1rem 0.5rem; border-radius: 20px;
}
.item-price {
  font-size: 0.95rem; font-weight: 700;
  color: #7a5200;
  white-space: nowrap; flex-shrink: 0;
}

/* ── Action Buttons ── */
.item-actions { display: flex; gap: 0.3rem; flex-shrink: 0; }

.act-btn {
  width: 30px; height: 30px;
  border-radius: 8px;
  border: 1px solid var(--color-gray-border);
  background: var(--color-white);
  font-size: 0.78rem; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  color: var(--color-text-light);
  transition: all 0.15s ease;
}
.act-btn:hover { transform: translateY(-1px); }

.toggle-btn--on  { color: var(--color-primary-light); }
.toggle-btn--on:hover  { background: var(--color-primary-light); color: var(--color-white); border-color: var(--color-primary-light); }
.toggle-btn--off { color: #92700a; }
.toggle-btn--off:hover { background: var(--color-gold); color: var(--color-navy); border-color: var(--color-gold); }
.edit-btn:hover   { background: var(--color-primary-light); color: var(--color-white); border-color: var(--color-primary-light); }
.delete-btn:hover { background: #ef4444; color: var(--color-white); border-color: #ef4444; }

/* ── Empty State ── */
.empty-state {
  grid-column: span 2;
  display: flex; flex-direction: column; align-items: center;
  justify-content: center; gap: 0.85rem;
  padding: 4rem 2rem; text-align: center;
  border: 2px dashed rgba(244, 196, 0, 0.4);
  border-radius: 16px;
  background: rgba(244, 196, 0, 0.03);
  color: var(--color-text-light);
}
.empty-icon-wrap {
  width: 60px; height: 60px; border-radius: 16px;
  background: rgba(3, 105, 161, 0.08); color: var(--color-primary-light);
  display: flex; align-items: center; justify-content: center;
  font-size: 1.6rem;
}
.empty-state p { font-size: 0.95rem; font-weight: 600; color: var(--color-text-dark); margin: 0; }

/* ── Modal Overlay ── */
.modal-overlay {
  position: fixed; inset: 0;
  background: rgba(12, 59, 94, 0.55);
  backdrop-filter: blur(5px);
  display: flex; align-items: center; justify-content: center;
  z-index: 1000; padding: 1rem;
  animation: fadeIn 0.2s ease;
}
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

.modal-box {
  background: var(--color-white);
  border-radius: 20px;
  width: 100%; max-width: 480px;
  max-height: 90vh; overflow-y: auto;
  box-shadow: 0 24px 60px rgba(12, 59, 94, 0.22);
  animation: slideUp 0.22s ease;
}
.modal-box--wide { max-width: 560px; }
@keyframes slideUp {
  from { transform: translateY(18px); opacity: 0; }
  to   { transform: translateY(0);    opacity: 1; }
}

/* Modal header */
.modal-head {
  display: flex; justify-content: space-between; align-items: center;
  padding: 1.1rem 1.4rem;
  background: var(--color-navy);
  border-radius: 20px 20px 0 0;
  border-bottom: 3px solid var(--color-gold);
}
.modal-head-left { display: flex; align-items: center; gap: 0.8rem; }

.modal-head-icon {
  width: 40px; height: 40px; border-radius: 12px;
  background: rgba(255, 255, 255, 0.12);
  display: flex; align-items: center; justify-content: center;
  font-size: 1rem; color: var(--color-white); flex-shrink: 0;
}
.modal-head-icon--gold { background: rgba(244, 196, 0, 0.2); color: var(--color-gold); }

.modal-title { font-size: 1rem; font-weight: 700; color: var(--color-white); margin: 0; }
.modal-sub   { font-size: 0.72rem; color: rgba(255, 255, 255, 0.6); margin: 2px 0 0; }

.modal-close-btn {
  width: 32px; height: 32px; border-radius: 10px;
  background: rgba(255, 255, 255, 0.12); border: 1px solid rgba(255, 255, 255, 0.2);
  color: var(--color-white); font-size: 0.85rem; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: background 0.15s;
}
.modal-close-btn:hover { background: rgba(255, 255, 255, 0.28); }

/* ── Modal Form ── */
.modal-form { padding: 1.4rem; display: flex; flex-direction: column; gap: 0.1rem; }
.form-group  { margin-bottom: 1rem; }
.form-row    { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }

.form-label {
  display: block; margin-bottom: 0.4rem;
  font-size: 0.72rem; font-weight: 700;
  color: var(--color-text-light);
  text-transform: uppercase; letter-spacing: 0.4px;
}
.req { color: #ef4444; margin-left: 2px; }

.form-input {
  width: 100%; padding: 0.65rem 0.9rem;
  border: 1.5px solid var(--color-gray-border);
  border-radius: 10px; font-size: 0.9rem;
  color: var(--color-text-dark);
  background: var(--color-white);
  transition: all 0.15s; box-sizing: border-box;
}
.form-input:focus {
  outline: none;
  border-color: var(--color-primary-light);
  box-shadow: 0 0 0 3px rgba(31, 141, 191, 0.1);
}

.form-checkbox-row { display: flex; align-items: center; gap: 0.6rem; margin-bottom: 0; }
.form-checkbox     { width: 16px; height: 16px; accent-color: var(--color-primary-light); cursor: pointer; }
.checkbox-label    { margin: 0; text-transform: none; letter-spacing: 0; font-size: 0.875rem; color: var(--color-text-dark); }

/* ── Modal Footer ── */
.modal-foot {
  display: flex; gap: 0.6rem; justify-content: flex-end;
  padding: 1rem 1.4rem;
  border-top: 1px solid var(--color-gray-border);
  background: var(--color-gray-bg);
  border-radius: 0 0 20px 20px;
}
.modal-foot--right { justify-content: flex-end; }

.btn-cancel {
  padding: 0.55rem 1.1rem; border-radius: 10px;
  background: var(--color-white); color: var(--color-text-light);
  border: 1.5px solid var(--color-gray-border);
  font-size: 0.875rem; font-weight: 600; cursor: pointer;
  transition: all 0.15s;
}
.btn-cancel:hover { border-color: var(--color-primary-light); color: var(--color-primary); }

/* ── Category Modal Body ── */
.cat-modal-body {
  padding: 1.4rem;
  max-height: 65vh; overflow-y: auto;
  display: flex; flex-direction: column; gap: 1.25rem;
}

.cat-section { display: flex; flex-direction: column; gap: 0.65rem; }
.cat-section--add {
  padding-top: 1rem;
  border-top: 2px dashed rgba(244, 196, 0, 0.3);
}

.cat-section-title {
  font-size: 0.75rem; font-weight: 700;
  color: var(--color-navy);
  text-transform: uppercase; letter-spacing: 0.5px;
  display: flex; align-items: center; gap: 0.4rem;
  margin: 0;
}
.cat-section-title i { color: var(--color-primary-light); }

.cat-list { display: flex; flex-direction: column; gap: 0.4rem; }

.cat-item {
  padding: 0.6rem 0.9rem;
  background: var(--color-gray-bg);
  border: 0.5px solid var(--color-gray-border);
  border-radius: 10px;
  transition: border-color 0.15s;
}
.cat-item:hover { border-color: rgba(244, 196, 0, 0.4); }

.cat-display-row,
.cat-edit-row {
  display: flex; align-items: center; justify-content: space-between;
  gap: 0.75rem; width: 100%;
}
.cat-name {
  flex: 1; font-size: 0.875rem; font-weight: 500;
  color: var(--color-text-dark);
  display: flex; align-items: center; gap: 0.4rem;
}
.cat-tag-icon { color: var(--color-primary-light); font-size: 0.72rem; }
.cat-item-actions { display: flex; gap: 0.3rem; flex-shrink: 0; }

.add-cat-form { display: flex; gap: 0.6rem; }
.add-cat-form .form-input { flex: 1; }

.empty-cats {
  text-align: center; padding: 1.5rem;
  color: var(--color-text-light); font-size: 0.85rem;
}
.empty-cats i { font-size: 1.5rem; color: var(--color-gold); display: block; margin-bottom: 0.4rem; }

.cat-info-note {
  display: flex; align-items: flex-start; gap: 0.5rem;
  padding: 0.7rem 0.9rem;
  background: rgba(3, 105, 161, 0.05);
  border-radius: 10px;
  border: 1px solid rgba(3, 105, 161, 0.12);
  font-size: 0.75rem; color: var(--color-text-light); line-height: 1.5;
}
.cat-info-note i { color: var(--color-primary-light); flex-shrink: 0; margin-top: 1px; }

/* ── Responsive ── */
@media (max-width: 1024px) {
  .menu-list    { grid-template-columns: 1fr; }
  .empty-state  { grid-column: span 1; }
}
@media (max-width: 768px) {
  .menu-section   { padding: 1rem; border-radius: 14px; }
  .section-header { flex-direction: column; align-items: flex-start; }
  .header-actions { width: 100%; }
  .btn-secondary, .btn-primary { flex: 1; justify-content: center; }
  .stats-container { flex-direction: column; }
  .controls-bar    { flex-direction: column; }
  .filter-select   { width: 100%; }
  .form-row        { grid-template-columns: 1fr; }
  .add-cat-form    { flex-direction: column; }
  .list-item       { flex-wrap: wrap; }
}
</style>