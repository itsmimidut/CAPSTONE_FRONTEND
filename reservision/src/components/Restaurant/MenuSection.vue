<template>
  <div class="menu-section">
    <!-- Header with Controls -->
    <div class="section-header">
      <div>
        <h2 class="section-title">Menu Management</h2>
        <p class="section-subtitle">Manage restaurant menu items and pricing</p>
      </div>
      <div class="header-actions">
        <button class="btn-category" @click="showCategoryModal = true">
          <i class="fas fa-layer-group"></i> Manage Categories
        </button>
        <button class="btn-add-item" @click="showAddItemModal = true">
          <i class="fas fa-plus"></i> Add New Item
        </button>
      </div>
    </div>

    <!-- Stats Container -->
    <div class="stats-container">
      <StatCard 
        label="Total Items"
        :count="menu.length"
        class="stat-total"
        icon="fas fa-utensils"
        color="primary"
      />
      <StatCard 
        label="Available Items"
        :count="menu.filter(i => i.available).length"
        class="stat-available"
        icon="fas fa-check-circle"
        color="success"
      />
      <StatCard 
        label="Unavailable Items"
        :count="menu.filter(i => !i.available).length"
        class="stat-unavailable"
        icon="fas fa-ban"
        color="danger"
      />
    </div>

    <!-- Search and Filter -->
    <div class="controls-container">
      <div class="search-box">
        <i class="fas fa-search search-icon"></i>
        <input 
          v-model="searchQuery"
          type="text" 
          placeholder="Search dishes..."
          class="search-input"
        />
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

    <!-- Category-Based List Menu -->
    <div class="menu-list">
      <div v-if="filteredMenu.length === 0" class="empty-state">
        <i class="fas fa-utensils empty-icon"></i>
        <p>No menu items found</p>
        <button class="btn-add-empty" @click="showAddItemModal = true">
          <i class="fas fa-plus"></i> Add Your First Item
        </button>
      </div>

      <!-- Category Sections -->
      <div v-for="category in categories" :key="category" class="category-section-list">
        <template v-if="getItemsByCategory(category).length > 0">
          <div class="category-header-list">
            <h3 class="category-title-list">{{ category.toUpperCase() }}</h3>
            <span class="category-count-badge">{{ getItemsByCategory(category).length }} items</span>
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
                  <h4 class="item-name-list">{{ item.name }}</h4>
                  <span v-if="!item.available" class="unavailable-badge">Not Available</span>
                </div>
                <div class="item-price-list">₱{{ item.price }}</div>
              </div>
              
              <div class="item-actions">
                <button 
                  class="action-btn toggle-btn"
                  :class="item.available ? 'btn-available' : 'btn-unavailable'"
                  @click="handleToggle(item)"
                  :title="item.available ? 'Mark unavailable' : 'Mark available'"
                >
                  <i :class="item.available ? 'fas fa-check-circle' : 'fas fa-times-circle'"></i>
                </button>
                <button 
                  class="action-btn edit-btn"
                  @click="handleEdit(item)"
                  title="Edit"
                >
                  <i class="fas fa-edit"></i>
                </button>
                <button 
                  class="action-btn delete-btn"
                  @click="handleDelete(item)"
                  title="Delete"
                >
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </div>
          </div>
        </template>
      </div>
    </div>

    <!-- Add Item Modal -->
    <div v-if="showAddItemModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>Add New Menu Item</h3>
          <button class="btn-close" @click="closeModal">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <form @submit.prevent="handleAddItem" class="modal-form">
          <div class="form-group">
            <label for="itemName">Name *</label>
            <input 
              id="itemName"
              v-model="newItem.name"
              type="text" 
              placeholder="e.g., Grilled Salmon"
              required
              class="form-input"
            />
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="category">Category *</label>
              <select 
                id="category"
                v-model="newItem.category"
                required
                class="form-input"
              >
                <option value="">Select Category</option>
                <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
              </select>
            </div>

            <div class="form-group">
              <label for="price">Price (₱) *</label>
              <input 
                id="price"
                v-model.number="newItem.price"
                type="number" 
                placeholder="0"
                required
                min="0"
                step="0.01"
                class="form-input"
              />
            </div>
          </div>

          <div class="form-group checkbox">
            <input 
              id="available"
              v-model="newItem.available"
              type="checkbox"
              class="form-checkbox"
            />
            <label for="available">Available for ordering</label>
          </div>

          <div class="form-actions">
            <button type="button" class="btn-cancel" @click="closeModal">
              Cancel
            </button>
            <button type="submit" class="btn-submit">
              <i class="fas fa-plus"></i> Add Item
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Edit Item Modal -->
    <div v-if="showEditModal" class="modal-overlay" @click.self="closeEditModal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>Edit Menu Item</h3>
          <button class="btn-close" @click="closeEditModal">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <form @submit.prevent="handleEditSubmit" class="modal-form">
          <div class="form-group">
            <label for="editItemName">Name *</label>
            <input 
              id="editItemName"
              v-model="editingItem.name"
              type="text" 
              placeholder="e.g., Grilled Salmon"
              required
              class="form-input"
            />
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="editCategory">Category *</label>
              <select 
                id="editCategory"
                v-model="editingItem.category"
                required
                class="form-input"
              >
                <option value="">Select Category</option>
                <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
              </select>
            </div>

            <div class="form-group">
              <label for="editPrice">Price (₱) *</label>
              <input 
                id="editPrice"
                v-model.number="editingItem.price"
                type="number" 
                placeholder="0"
                required
                min="0"
                step="0.01"
                class="form-input"
              />
            </div>
          </div>

          <div class="form-group checkbox">
            <input 
              id="editAvailable"
              v-model="editingItem.available"
              type="checkbox"
              class="form-checkbox"
            />
            <label for="editAvailable">Available for ordering</label>
          </div>

          <div class="form-actions">
            <button type="button" class="btn-cancel" @click="closeEditModal">
              Cancel
            </button>
            <button type="submit" class="btn-submit">
              <i class="fas fa-save"></i> Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Category Management Modal -->
    <div v-if="showCategoryModal" class="modal-overlay" @click.self="closeCategoryModal">
      <div class="modal-content modal-wide-category">
        <div class="modal-header">
          <h3><i class="fas fa-layer-group"></i> Manage Categories</h3>
          <button class="btn-close" @click="closeCategoryModal">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div class="category-modal-body">
          <!-- Current Categories List -->
          <div class="category-section">
            <h4 class="category-section-title">
              <i class="fas fa-list"></i> Current Categories
            </h4>
            <div class="category-list">
              <div v-for="(cat, index) in categories" :key="index" class="category-item">
                <div v-if="editingCategoryIndex === index" class="category-edit-mode">
                  <input 
                    v-model="editingCategoryValue"
                    type="text"
                    class="form-input"
                    placeholder="Category name"
                    @keyup.enter="saveEditCategory(index)"
                    @keyup.esc="cancelEditCategory"
                    ref="editInput"
                  />
                  <div class="category-actions">
                    <button type="button" class="btn-icon btn-save" @click="saveEditCategory(index)" title="Save">
                      <i class="fas fa-check"></i>
                    </button>
                    <button type="button" class="btn-icon btn-cancel-edit" @click="cancelEditCategory" title="Cancel">
                      <i class="fas fa-times"></i>
                    </button>
                  </div>
                </div>
                <div v-else class="category-display">
                  <span class="category-name">{{ cat }}</span>
                  <div class="category-actions">
                    <button type="button" class="btn-icon btn-edit-cat" @click="startEditCategory(index, cat)" title="Edit">
                      <i class="fas fa-edit"></i>
                    </button>
                    <button type="button" class="btn-icon btn-delete-cat" @click="deleteCategory(index)" title="Delete">
                      <i class="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
              </div>
              <div v-if="categories.length === 0" class="empty-categories">
                <i class="fas fa-folder-open"></i>
                <p>No categories yet</p>
              </div>
            </div>
          </div>

          <!-- Add New Category -->
          <div class="category-section add-section">
            <h4 class="category-section-title">
              <i class="fas fa-plus-circle"></i> Add New Category
            </h4>
            <form @submit.prevent="addCategory" class="add-category-form">
              <input 
                v-model="newCategory"
                type="text"
                class="form-input"
                placeholder="Enter new category name"
                required
              />
              <button type="submit" class="btn-submit">
                <i class="fas fa-plus"></i> Add Category
              </button>
            </form>
          </div>

          <!-- Info Note -->
          <div class="category-info-note">
            <i class="fas fa-info-circle"></i>
            <small>Categories help organize your menu. Deleting a category will affect existing menu items.</small>
          </div>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn-cancel" @click="closeCategoryModal">
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue'
import StatCard from './StatCard.vue'

const props = defineProps({
  menu: Array,
})

const emit = defineEmits(['toggle-availability', 'edit-item', 'delete-item', 'add-item', 'update-item'])

const searchQuery = ref('')
const filterCategory = ref('')
const filterAvailability = ref('')
const showAddItemModal = ref(false)
const showEditModal = ref(false)
const showCategoryModal = ref(false)
const editingItem = ref(null)

// Category management
const categories = ref([
  'Coffee',
  'Hot & Cold Latte',
  'Smoothies Frappe',
  'Fruity Smoothies & Shakes',
  'Sandwiches & Pastries',
  'Soup',
  'Rice',
  'Noodles',
  'Pasta'
])
const newCategory = ref('')
const editingCategoryIndex = ref(null)
const editingCategoryValue = ref('')
const editInput = ref(null)

const newItem = ref({
  name: '',
  category: '',
  price: 0,
  available: true,
})

const filteredMenu = computed(() => {
  return props.menu.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchesCategory = !filterCategory.value || item.category === filterCategory.value
    const matchesAvailability = !filterAvailability.value || 
      (filterAvailability.value === 'available' ? item.available : !item.available)
    return matchesSearch && matchesCategory && matchesAvailability
  })
})

// Get items by category for gallery display
const getItemsByCategory = (category) => {
  return filteredMenu.value.filter(item => item.category === category)
}

const handleToggle = (item) => {
  emit('toggle-availability', item.menu_id)
}

const handleEdit = (item) => {
  editingItem.value = { ...item }
  showEditModal.value = true
}

const handleEditSubmit = () => {
  if (editingItem.value) {
    const itemToUpdate = {
      menu_id: editingItem.value.menu_id,
      name: editingItem.value.name,
      category: editingItem.value.category,
      price: editingItem.value.price,
      available: editingItem.value.available,
    }
    emit('update-item', itemToUpdate)
    closeEditModal()
  }
}

const closeEditModal = () => {
  showEditModal.value = false
  editingItem.value = null
}

const handleDelete = (item) => {
  if (confirm(`Delete ${item.name}?`)) {
    emit('delete-item', item.menu_id)
  }
}

const handleAddItem = () => {
  if (newItem.value.name && newItem.value.category && newItem.value.price >= 0) {
    const itemToAdd = {
      name: newItem.value.name,
      category: newItem.value.category,
      price: newItem.value.price,
      available: newItem.value.available,
    }
    emit('add-item', itemToAdd)
    closeModal()
  }
}

const closeModal = () => {
  showAddItemModal.value = false
  newItem.value = {
    name: '',
    category: '',
    price: 0,
    available: true,
  }
}

// Category Management Functions
const closeCategoryModal = () => {
  showCategoryModal.value = false
  editingCategoryIndex.value = null
  editingCategoryValue.value = ''
  newCategory.value = ''
}

const addCategory = () => {
  const trimmed = newCategory.value.trim()
  if (trimmed) {
    if (!categories.value.includes(trimmed)) {
      categories.value.push(trimmed)
      newCategory.value = ''
    } else {
      alert('This category already exists')
    }
  }
}

const startEditCategory = (index, value) => {
  editingCategoryIndex.value = index
  editingCategoryValue.value = value
  // Focus the input after render
  nextTick(() => {
    const input = document.querySelector('.category-edit-mode .form-input')
    if (input) input.focus()
  })
}

const saveEditCategory = (index) => {
  const trimmed = editingCategoryValue.value.trim()
  if (trimmed) {
    if (!categories.value.includes(trimmed) || categories.value[index] === trimmed) {
      categories.value[index] = trimmed
      cancelEditCategory()
    } else {
      alert('This category already exists')
    }
  } else {
    alert('Category name cannot be empty')
  }
}

const cancelEditCategory = () => {
  editingCategoryIndex.value = null
  editingCategoryValue.value = ''
}

const deleteCategory = (index) => {
  const categoryName = categories.value[index]
  const itemsInCategory = props.menu.filter(item => item.category === categoryName).length
  
  let message = `Delete category "${categoryName}"?`
  if (itemsInCategory > 0) {
    message = `There are ${itemsInCategory} item(s) in "${categoryName}". Delete this category anyway? Items will need to be reassigned.`
  }
  
  if (confirm(message)) {
    categories.value.splice(index, 1)
  }
}
</script>

<style scoped>
.menu-section {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 12px rgba(31, 141, 191, 0.08);
  border: 1px solid rgba(31, 141, 191, 0.1);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
  padding-bottom: 1rem;
  border-bottom: 3px solid #F4C400;
}

.section-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: #1F8DBF;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.section-title::before {
  content: '';
  display: inline-block;
  width: 4px;
  height: 2rem;
  background: linear-gradient(180deg, #1F8DBF, #F4C400);
  border-radius: 2px;
}

.section-subtitle {
  margin: 0.5rem 0 0 0;
  color: #1E88B6;
  font-size: 0.95rem;
  opacity: 0.8;
}

.header-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.btn-category {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  background: white;
  color: #1F8DBF;
  border: 2px solid rgba(31, 141, 191, 0.2);
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.925rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-category:hover {
  background: rgba(244, 196, 0, 0.1);
  border-color: #F4C400;
  transform: translateY(-2px);
}

.btn-add-item {
  background: linear-gradient(135deg, #1F8DBF 0%, #1E88B6 100%);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  white-space: nowrap;
  box-shadow: 0 4px 12px rgba(31, 141, 191, 0.2);
}

.btn-add-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(31, 141, 191, 0.3);
}

.btn-add-item i {
  color: #F4C400;
}

.stats-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

/* Controls Container */
.controls-container {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  background: white;
  padding: 1.25rem;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(31, 141, 191, 0.08);
  border: 1px solid rgba(31, 141, 191, 0.1);
  position: relative;
  overflow: hidden;
}

.controls-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background: linear-gradient(90deg, #1F8DBF 50%, #F4C400 50%);
}

.search-box {
  flex: 1;
  min-width: 250px;
  display: flex;
  align-items: center;
  background: #F9FAFB;
  border-radius: 8px;
  padding: 0 1rem;
  border: 2px solid rgba(31, 141, 191, 0.2);
  transition: all 0.3s ease;
}

.search-box:focus-within {
  border-color: #F4C400;
  box-shadow: 0 0 0 3px rgba(244, 196, 0, 0.15);
}

.search-icon {
  color: #F4C400;
  font-size: 0.875rem;
  margin-right: 0.5rem;
}

.search-input {
  border: none;
  background: transparent;
  padding: 0.75rem 0;
  flex: 1;
  font-size: 0.95rem;
  outline: none;
  color: #1F8DBF;
  font-weight: 500;
}

.search-input::placeholder {
  color: rgba(31, 141, 191, 0.4);
  font-weight: normal;
}

.filter-select {
  padding: 0.75rem 1rem;
  border: 2px solid rgba(244, 196, 0, 0.3);
  border-radius: 8px;
  background: white;
  color: #1F8DBF;
  cursor: pointer;
  font-size: 0.95rem;
  transition: all 0.3s;
  font-weight: 500;
  min-width: 150px;
}

.filter-select:hover {
  border-color: #1F8DBF;
}

.filter-select:focus {
  outline: none;
  border-color: #1F8DBF;
  box-shadow: 0 0 0 3px rgba(31, 141, 191, 0.15);
}

/* ========================================
   Category-Based List Layout Styles
   ======================================== */

.menu-list {
  margin-top: 2rem;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2rem;
  column-gap: 2.5rem;
}

.category-section-list {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 12px rgba(31, 141, 191, 0.08);
  break-inside: avoid;
  page-break-inside: avoid;
  height: fit-content;
  border: 1px solid rgba(31, 141, 191, 0.1);
  transition: all 0.3s ease;
}

.category-section-list:hover {
  border-left: 4px solid #F4C400;
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(31, 141, 191, 0.15);
}

.category-header-list {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.25rem;
  padding-bottom: 0.75rem;
  border-bottom: 2px solid #F4C400;
}

.category-title-list {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1F8DBF;
  margin: 0;
  font-family: 'Playfair Display', serif;
  letter-spacing: 0.5px;
}

.category-count-badge {
  background: rgba(244, 196, 0, 0.1);
  color: #F4C400;
  padding: 0.25rem 0.65rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  border: 1px solid rgba(244, 196, 0, 0.2);
}

.items-list {
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
}

.list-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  background: #F9FAFB;
  border: 1px solid rgba(31, 141, 191, 0.1);
  border-radius: 8px;
  transition: all 0.2s ease;
  gap: 0.75rem;
}

.list-item:hover {
  background: rgba(244, 196, 0, 0.05);
  border-color: #F4C400;
  transform: translateX(4px);
}

.list-item.item-unavailable {
  opacity: 0.6;
  background: rgba(239, 68, 68, 0.05);
  border-left: 4px solid #ef4444;
}

.item-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex: 1;
  gap: 1rem;
}

.item-details {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
}

.item-name-list {
  font-size: 1rem;
  font-weight: 600;
  color: #1F8DBF;
  margin: 0;
}

.unavailable-badge {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  padding: 0.2rem 0.6rem;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border: 1px solid rgba(239, 68, 68, 0.2);
}

.item-price-list {
  font-size: 1.125rem;
  font-weight: 700;
  color: #F4C400;
  white-space: nowrap;
}

.item-actions {
  display: flex;
  gap: 0.4rem;
  align-items: center;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.9rem;
}

.action-btn:hover {
  transform: scale(1.1);
}

.toggle-btn.btn-available {
  background: rgba(31, 141, 191, 0.1);
  color: #1F8DBF;
}

.toggle-btn.btn-available:hover {
  background: #1F8DBF;
  color: white;
}

.toggle-btn.btn-unavailable {
  background: rgba(244, 196, 0, 0.1);
  color: #F4C400;
}

.toggle-btn.btn-unavailable:hover {
  background: #F4C400;
  color: #1F8DBF;
}

.edit-btn {
  background: rgba(31, 141, 191, 0.1);
  color: #1F8DBF;
}

.edit-btn:hover {
  background: #1F8DBF;
  color: white;
}

.delete-btn {
  background: rgba(244, 196, 0, 0.1);
  color: #F4C400;
}

.delete-btn:hover {
  background: #F4C400;
  color: #1F8DBF;
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  color: #1F8DBF;
  text-align: center;
  background: white;
  border-radius: 12px;
  border: 2px dashed #F4C400;
  box-shadow: 0 4px 12px rgba(31, 141, 191, 0.08);
  grid-column: span 2;
}

.empty-icon {
  font-size: 3.5rem;
  margin-bottom: 1rem;
  color: #F4C400;
  opacity: 0.5;
}

.empty-state p {
  font-size: 1.1rem;
  margin-bottom: 1.5rem;
  color: #1F8DBF;
}

.btn-add-empty {
  background: linear-gradient(135deg, #1F8DBF 0%, #1E88B6 100%);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 4px 12px rgba(31, 141, 191, 0.2);
}

.btn-add-empty:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(31, 141, 191, 0.3);
}

.btn-add-empty i {
  color: #F4C400;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(31, 141, 191, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.modal-content {
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 25px rgba(31, 141, 191, 0.15);
  max-width: 500px;
  width: 100%;
  animation: slideUp 0.3s ease;
  border: 2px solid #F4C400;
}

.modal-wide-category {
  max-width: 600px;
}

@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 2px solid #F4C400;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.25rem;
  color: #1F8DBF;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-close {
  background: none;
  border: none;
  cursor: pointer;
  color: #1F8DBF;
  font-size: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.3s;
}

.btn-close:hover {
  color: #F4C400;
}

.modal-form {
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #1F8DBF;
  font-size: 0.95rem;
}

.form-input {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid rgba(31, 141, 191, 0.2);
  border-radius: 8px;
  font-size: 0.95rem;
  transition: all 0.3s;
  box-sizing: border-box;
  background: white;
  color: #1E88B6;
}

.form-input:focus {
  outline: none;
  border-color: #F4C400;
  box-shadow: 0 0 0 3px rgba(244, 196, 0, 0.15);
}

.form-group.checkbox {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0;
}

.form-checkbox {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: #F4C400;
}

.form-group.checkbox label {
  margin-bottom: 0;
  cursor: pointer;
  color: #1F8DBF;
}

.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 2px solid rgba(244, 196, 0, 0.3);
}

.btn-cancel,
.btn-submit {
  flex: 1;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-size: 0.95rem;
}

.btn-cancel {
  background: rgba(31, 141, 191, 0.1);
  color: #1F8DBF;
  border: 1px solid rgba(31, 141, 191, 0.2);
}

.btn-cancel:hover {
  background: #F4C400;
  color: #1F8DBF;
  border-color: #F4C400;
}

.btn-submit {
  background: linear-gradient(135deg, #1F8DBF 0%, #1E88B6 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(31, 141, 191, 0.2);
}

.btn-submit:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(31, 141, 191, 0.3);
}

.btn-submit i {
  color: #F4C400;
}

/* Category Modal Styles */
.category-modal-body {
  padding: 1.5rem;
  max-height: 70vh;
  overflow-y: auto;
}

.category-section {
  margin-bottom: 2rem;
}

.category-section.add-section {
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 2px dashed rgba(244, 196, 0, 0.3);
}

.category-section-title {
  font-size: 1rem;
  font-weight: 600;
  color: #1F8DBF;
  margin: 0 0 1rem 0;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid rgba(244, 196, 0, 0.3);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.category-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.category-item {
  display: flex;
  align-items: center;
  padding: 0.75rem;
  background: rgba(31, 141, 191, 0.05);
  border: 1px solid rgba(31, 141, 191, 0.1);
  border-radius: 8px;
  transition: all 0.2s ease;
}

.category-item:hover {
  background: rgba(244, 196, 0, 0.05);
  border-color: #F4C400;
}

.category-display,
.category-edit-mode {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  gap: 0.75rem;
}

.category-name {
  flex: 1;
  font-weight: 500;
  color: #1F8DBF;
}

.category-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-edit-cat {
  background: rgba(31, 141, 191, 0.1);
  color: #1F8DBF;
}

.btn-edit-cat:hover {
  background: #1F8DBF;
  color: white;
}

.btn-delete-cat {
  background: rgba(244, 196, 0, 0.1);
  color: #F4C400;
}

.btn-delete-cat:hover {
  background: #F4C400;
  color: #1F8DBF;
}

.btn-save {
  background: rgba(31, 141, 191, 0.1);
  color: #1F8DBF;
}

.btn-save:hover {
  background: #1F8DBF;
  color: white;
}

.btn-cancel-edit {
  background: rgba(244, 196, 0, 0.1);
  color: #F4C400;
}

.btn-cancel-edit:hover {
  background: #F4C400;
  color: #1F8DBF;
}

.add-category-form {
  display: flex;
  gap: 0.75rem;
}

.add-category-form .form-input {
  flex: 1;
}

.empty-categories {
  text-align: center;
  padding: 2rem;
  color: #1F8DBF;
  opacity: 0.5;
}

.empty-categories i {
  font-size: 2rem;
  margin-bottom: 0.5rem;
  color: #F4C400;
}

.empty-categories p {
  margin: 0;
}

.category-info-note {
  margin-top: 1.5rem;
  padding: 0.75rem;
  background: rgba(31, 141, 191, 0.05);
  border-radius: 6px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #1F8DBF;
  font-size: 0.85rem;
}

.category-info-note i {
  color: #F4C400;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  padding: 1rem 1.5rem;
  border-top: 2px solid rgba(244, 196, 0, 0.3);
  background: rgba(31, 141, 191, 0.02);
}

/* Responsive */
@media (max-width: 1024px) {
  .menu-list {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  
  .empty-state {
    grid-column: span 1;
  }
}

@media (max-width: 768px) {
  .menu-section {
    padding: 1.5rem;
  }

  .section-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .header-actions {
    width: 100%;
  }

  .btn-category,
  .btn-add-item {
    flex: 1;
    justify-content: center;
  }

  .stats-container {
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }

  .controls-container {
    flex-direction: column;
  }

  .search-box {
    min-width: auto;
  }

  .filter-select {
    width: 100%;
  }

  .category-section-list {
    padding: 1.25rem;
  }

  .category-title-list {
    font-size: 1.125rem;
  }

  .list-item {
    flex-direction: column;
    align-items: stretch;
    gap: 0.75rem;
  }

  .item-info {
    flex-direction: column;
    align-items: stretch;
    gap: 0.5rem;
  }

  .item-details {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .item-actions {
    justify-content: flex-end;
  }

  .item-price-list {
    font-size: 1rem;
  }

  .section-title {
    font-size: 1.5rem;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .add-category-form {
    flex-direction: column;
  }

  .add-category-form .btn-submit {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .stats-container {
    grid-template-columns: 1fr;
  }
}
</style>