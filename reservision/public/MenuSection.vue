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
        <i class="fas fa-search"></i>
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
        <i class="fas fa-inbox"></i>
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
      <div class="modal-content">
        <div class="modal-header">
          <h3>Manage Categories</h3>
          <button class="btn-close" @click="closeCategoryModal">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div class="category-modal-body">
          <!-- Current Categories List -->
          <div class="category-section">
            <h4 class="category-section-title">Current Categories</h4>
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
            </div>
          </div>

          <!-- Add New Category -->
          <div class="category-section">
            <h4 class="category-section-title">Add New Category</h4>
            <form @submit.prevent="addCategory" class="add-category-form">
              <input 
                v-model="newCategory"
                type="text"
                class="form-input"
                placeholder="Enter new category name"
              />
              <button type="submit" class="btn-submit">
                <i class="fas fa-plus"></i> Add Category
              </button>
            </form>
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
import { ref, computed } from 'vue'
import StatusBadge from './StatusBadge.vue'
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

const calculatePotentialRevenue = () => {
  return props.menu.reduce((total, item) => {
    return total + item.price
  }, 0).toLocaleString()
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
  if (trimmed && !categories.value.includes(trimmed)) {
    categories.value.push(trimmed)
    newCategory.value = ''
  } else if (categories.value.includes(trimmed)) {
    alert('This category already exists')
  }
}

const startEditCategory = (index, value) => {
  editingCategoryIndex.value = index
  editingCategoryValue.value = value
}

const saveEditCategory = (index) => {
  const trimmed = editingCategoryValue.value.trim()
  if (trimmed && !categories.value.includes(trimmed)) {
    categories.value[index] = trimmed
    cancelEditCategory()
  } else if (categories.value.includes(trimmed) && categories.value[index] !== trimmed) {
    alert('This category already exists')
  } else {
    cancelEditCategory()
  }
}

const cancelEditCategory = () => {
  editingCategoryIndex.value = null
  editingCategoryValue.value = ''
}

const deleteCategory = (index) => {
  const categoryName = categories.value[index]
  const itemsInCategory = props.menu.filter(item => item.category === categoryName).length
  
  if (itemsInCategory > 0) {
    if (!confirm(`There are ${itemsInCategory} item(s) in "${categoryName}". Delete this category anyway?`)) {
      return
    }
  }
  
  categories.value.splice(index, 1)
}

</script>

<style scoped>
.menu-section {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.section-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: #1F2937;
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
  background: linear-gradient(180deg, #2B6CB0, #63B3ED);
  border-radius: 2px;
}

.section-subtitle {
  margin: 0.5rem 0 0 0;
  color: #6B7280;
  font-size: 0.95rem;
}

.btn-add-item {
  background: linear-gradient(135deg, #10B981, #059669);
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
}

.btn-add-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.stats-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.controls-container {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.search-box {
  flex: 1;
  min-width: 250px;
  display: flex;
  align-items: center;
  background: #F3F4F6;
  border-radius: 8px;
  padding: 0 1rem;
  border: 1px solid #E5E7EB;
}

.search-box i {
  color: #9CA3AF;
}

.search-input {
  border: none;
  background: transparent;
  padding: 0.75rem;
  flex: 1;
  font-size: 0.95rem;
  outline: none;
}

.filter-select {
  padding: 0.75rem 1rem;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  background: white;
  color: #374151;
  cursor: pointer;
  font-size: 0.95rem;
  transition: all 0.3s;
}

.filter-select:hover {
  border-color: #2B6CB0;
}

.filter-select:focus {
  outline: none;
  border-color: #2B6CB0;
  box-shadow: 0 0 0 3px rgba(43, 108, 176, 0.1);
}

.menu-container {
  margin-bottom: 2rem;
}

.menu-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 1.75rem;
}

.menu-card {
  background: white;
  border: 1px solid #E5E7EB;
  border-radius: 12px;
  padding: 1.25rem;
  transition: all 0.3s;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
}

.menu-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.12);
  border-color: #2B6CB0;
}

.menu-card.unavailable {
  opacity: 0.65;
  background: #F9FAFB;
}

.menu-card.unavailable::after {
  content: 'UNAVAILABLE';
  position: absolute;
  top: 12px;
  right: 12px;
  background: rgba(220, 38, 38, 0.9);
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.5px;
}

.card-image {
  width: 100%;
  height: 200px;
  border-radius: 8px;
  margin-bottom: 1.25rem;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.menu-card:hover .card-image img {
  transform: scale(1.05);
}

.card-image-placeholder {
  background: linear-gradient(135deg, #F0F9FF, #EFF6FF);
  display: flex;
  align-items: center;
  justify-content:0.75rem;
  gap: 0.75rem;
}

.card-title {
  flex: 1;
  min-width: 0;
}

.card-title h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.2rem;
  font-weight: 700;
  color: #1F2937;
  word-break: break-word;
  line-height: 1.3;
}

.category-badge {
  display: inline-block;
  background: #EEF2FF;
  color: #3B82F6;
  padding: 0.3rem 0.85rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.3px
}

.category-badge {
  display: inline-block;
  background: #EEF2FF;
  color: #2B6CB0;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  margin-top: 0.5rem;
}

.btn-availability {
  width: 36px;
  height: 36px;
  border: 2px solid currentColor;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  transition: all 0.3s;
  flex-shrink: 0;
}

.btn-availability.available {
  background: #DCFCE7;
  color: #16A34A;
  border-color: #16A34A;
}

.btn-availability.available:hover {
  background: #16A34A;
  color: white;
  transform: scale(1.05);
}

.btn-availability.unavailable {
  background: #FEE2E2;
  color: #DC2626;
  border-color: #DC2626;
}

.btn-availability.unavailable:hover {
  background: #DC2626;
  color: white;
  transform: scale(1.05);
}
.card-price {
  display: flex;
flex-direction: column;
  gap: 0.25rem;
  margin-bottom: 1rem;
  padding: 0.85rem 1rem;
  background: linear-gradient(135deg, #DBEAFE, #EFF6FF);
  border-radius: 8px;
  border-left: 3px solid #2B6CB0;
}

.price-label {
  color: #6B7280;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 600;
}

.price-value {
  font-size: 1.75rem;
  font-weight: 800;
  color: #1E40AF;
  line-height: 1;
  font-size: 1.5rem;
  font-weight: 700;
  color: #2B6CB0;
  margin-bottom: 0.25rem;
  padding: 0.75rem 0;
  border-top: 1px solid #F3F4F6;
  border-bottom: 1px solid #F3F4F6;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #4B5563;
  font-size: 0.875rem;
  font-weight: 500;
}

.info-item i {
  color: #3B82F6;
  font-size: 0.95rem;
  font-size: 0.9rem;
}

.info-item i {
  color: #9CA3AF;
}

.card-actions {
  display: flex;
  gap: 0.75rem;
  margin-top: auto;
}

.btn-action {
  flex: 1;
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-size: 0.85rem;
}

.btn-edit {
  background: #FEF3C7;
  color: #D97706;
}

.btn-edit:hover {
  background: #FDE68A;
  transform: translateY(-2px);
}

.btn-delete {
  background: #FEE2E2;
  color: #DC2626;
}

.btn-delete:hover {
  background: #FECACA;
  transform: translateY(-2px);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  color: #9CA3AF;
  text-align: center;
  background: #F9FAFB;
  border-radius: 8px;
  border: 2px dashed #E5E7EB;
}

.empty-state i {
  font-size: 3.5rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.empty-state p {
  font-size: 1.1rem;
  margin-bottom: 1.5rem;
  color: #6B7280;
}

.btn-add-empty {
  background: linear-gradient(135deg, #10B981, #059669);
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
}

.btn-add-empty:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

/* Image Upload Styles */
.image-upload-area {
  border: 2px dashed #E5E7EB;
  border-radius: 8px;
  padding: 2rem;
  text-align: center;
  transition: all 0.3s;
  background: #F9FAFB;
}

.image-upload-area:hover {
  border-color: #2B6CB0;
  background: #EFF6FF;
}

.upload-placeholder {
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  color: #9CA3AF;
}

.upload-placeholder i {
  font-size: 2.5rem;
}

.upload-placeholder p {
  margin: 0;
  font-size: 0.9rem;
}

.image-preview {
  position: relative;
  display: inline-block;
  width: 100%;
}

.image-preview img {
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 8px;
}

.btn-remove-image {
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.btn-remove-image:hover {
  background: rgba(0, 0, 0, 0.8);
}


/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
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
  box-shadow: 0 20px 25px rgba(0, 0, 0, 0.15);
  max-width: 500px;
  width: 100%;
  animation: slideUp 0.3s ease;
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
  border-bottom: 1px solid #E5E7EB;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.25rem;
  color: #1F2937;
}

.btn-close {
  background: none;
  border: none;
  cursor: pointer;
  color: #6B7280;
  font-size: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.3s;
}

.btn-close:hover {
  color: #1F2937;
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
  color: #374151;
  font-size: 0.95rem;
}

.form-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  font-size: 0.95rem;
  transition: all 0.3s;
  box-sizing: border-box;
  background: white;
  color: #1F2937;
}

.form-input:focus {
  outline: none;
  border-color: #2B6CB0;
  box-shadow: 0 0 0 3px rgba(43, 108, 176, 0.1);
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
}

.form-group.checkbox label {
  margin-bottom: 0;
  cursor: pointer;
}

.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid #E5E7EB;
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
  background: #F3F4F6;
  color: #374151;
}

.btn-cancel:hover {
  background: #E5E7EB;
}

.btn-submit {
  background: linear-gradient(135deg, #10B981, #059669);
  color: white;
}

.btn-submit:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  padding: 1rem;
}

.modal-content {
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid #E5E7EB;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.25rem;
  color: #1F2937;
}

.btn-close {
  background: none;
  border: none;
  cursor: pointer;
  color: #6B7280;
  font-size: 1.5rem;
  padding: 0;
}

.btn-close:hover {
  color: #1F2937;
}

.form-checkbox {
  width: auto;
  margin-right: 0.5rem;
}

@media (max-width: 768px) {
  .menu-section {
    padding: 1.5rem;
  }

  .section-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .btn-add-item {
    width: 100%;
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

  .menu-grid {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 1rem;
  }

  .section-title {
    font-size: 1.5rem;
  }

  .form-row {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .stats-container {
    grid-template-columns: 1fr;
  }

  .menu-grid {
    grid-template-columns: 1fr;
  }

  .card-actions {
    flex-direction: column;
  }

  .btn-action {
    width: 100%;
  }
}

/* Header Actions */
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
  background: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.925rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-category:hover {
  background: #e5e7eb;
  border-color: #9ca3af;
}

/* Category Modal Styles */
.category-modal-body {
  padding: 1.5rem 0;
}

.category-section {
  margin-bottom: 2rem;
}

.category-section:last-child {
  margin-bottom: 0;
}

.category-section-title {
  font-size: 1rem;
  font-weight: 600;
  color: #374151;
  margin: 0 0 1rem 0;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #e5e7eb;
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
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.category-item:hover {
  background: #f3f4f6;
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
  color: #1f2937;
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
  background: #dbeafe;
  color: #1e40af;
}

.btn-edit-cat:hover {
  background: #bfdbfe;
}

.btn-delete-cat {
  background: #fee2e2;
  color: #991b1b;
}

.btn-delete-cat:hover {
  background: #fecaca;
}

.btn-save {
  background: #d1fae5;
  color: #065f46;
}

.btn-save:hover {
  background: #a7f3d0;
}

.btn-cancel-edit {
  background: #fee2e2;
  color: #991b1b;
}

.btn-cancel-edit:hover {
  background: #fecaca;
}

.add-category-form {
  display: flex;
  gap: 0.75rem;
}

.add-category-form .form-input {
  flex: 1;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  padding-top: 1.5rem;
  border-top: 1px solid #e5e7eb;
  margin-top: 1.5rem;
}

@media (max-width: 640px) {
  .header-actions {
    width: 100%;
  }

  .btn-category,
  .btn-add-item {
    flex: 1;
    justify-content: center;
  }

  .add-category-form {
    flex-direction: column;
  }

  .add-category-form .btn-submit {
    width: 100%;
  }
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
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  break-inside: avoid;
  page-break-inside: avoid;
  height: fit-content;
}

.category-section-list:last-child {
  margin-bottom: 0;
}

.category-header-list {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.25rem;
  padding-bottom: 0.75rem;
  border-bottom: 2px solid #E5E7EB;
}

.category-title-list {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1F2937;
  margin: 0;
  font-family: 'Playfair Display', serif;
  letter-spacing: 0.5px;
}

.category-count-badge {
  background: #EEF2FF;
  color: #2B6CB0;
  padding: 0.25rem 0.65rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
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
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  transition: all 0.2s ease;
  gap: 0.75rem;
}

.list-item:hover {
  background: #F3F4F6;
  border-color: #2B6CB0;
  transform: translateX(4px);
}

.list-item.item-unavailable {
  opacity: 0.6;
  background: #FEF2F2;
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
  color: #1F2937;
  margin: 0;
}

.unavailable-badge {
  background: #FEE2E2;
  color: #991B1B;
  padding: 0.2rem 0.6rem;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.item-price-list {
  font-size: 1.125rem;
  font-weight: 700;
  color: #2B6CB0;
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
  background: #D1FAE5;
  color: #065F46;
}

.toggle-btn.btn-available:hover {
  background: #A7F3D0;
}

.toggle-btn.btn-unavailable {
  background: #FEE2E2;
  color: #991B1B;
}

.toggle-btn.btn-unavailable:hover {
  background: #FECACA;
}

.edit-btn {
  background: #DBEAFE;
  color: #1E40AF;
}

.edit-btn:hover {
  background: #BFDBFE;
}

.delete-btn {
  background: #FEE2E2;
  color: #991B1B;
}

.delete-btn:hover {
  background: #FECACA;
}

@media (max-width: 1024px) {
  .menu-list {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
}

@media (max-width: 768px) {
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
}
</style>

