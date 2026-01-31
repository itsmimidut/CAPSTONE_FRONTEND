<template>
  <div class="menu-section">
    <!-- Header with Controls -->
    <div class="section-header">
      <div>
        <h2 class="section-title">Menu Management</h2>
        <p class="section-subtitle">Manage restaurant menu items and pricing</p>
      </div>
      <button class="btn-add-item" @click="showAddItemModal = true">
        <i class="fas fa-plus"></i> Add New Item
      </button>
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
        <option value="Appetizers">Appetizers</option>
        <option value="Mains">Mains</option>
        <option value="Desserts">Desserts</option>
        <option value="Beverages">Beverages</option>
      </select>
      <select v-model="filterAvailability" class="filter-select">
        <option value="">All Status</option>
        <option value="available">Available</option>
        <option value="unavailable">Unavailable</option>
      </select>
    </div>

    <!-- Menu Grid/Table -->
    <div class="menu-container">
      <!-- Grid View (Default) -->
      <div v-if="filteredMenu.length > 0" class="menu-grid">
        <div v-for="item in filteredMenu" :key="item.menu_id" class="menu-card" :class="{ unavailable: !item.available }">
          <div v-if="item.image_url" class="card-image">
            <img :src="item.image_url" :alt="item.name" />
          </div>
          <div v-else class="card-image card-image-placeholder">
            <i class="fas fa-image"></i>
          </div>

          <div class="card-header">
            <div class="card-title">
              <h3>{{ item.name }}</h3>
              <span class="category-badge">{{ item.category }}</span>
            </div>
            <button 
              class="btn-availability"
              :class="item.available ? 'available' : 'unavailable'"
              @click="handleToggle(item)"
              :title="item.available ? 'Mark unavailable' : 'Mark available'"
            >
              <i :class="item.available ? 'fas fa-check-circle' : 'fas fa-ban'"></i>
            </button>
          </div>

          <div class="card-price">
            <span class="price-label">Price</span>
            <span class="price-value">₱{{ item.price.toLocaleString() }}</span>
          </div>

          <div class="card-info">
            <div class="info-item">
              <i class="fas fa-clock"></i>
              <span>{{ item.prepTime }}</span>
            </div>
          </div>

          <div class="card-actions">
            <button 
              class="btn-action btn-edit"
              @click="handleEdit(item)"
              title="Edit item"
            >
              <i class="fas fa-edit"></i> Edit
            </button>
            <button 
              class="btn-action btn-delete"
              @click="handleDelete(item)"
              title="Delete item"
            >
              <i class="fas fa-trash"></i> Delete
            </button>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="empty-state">
        <i class="fas fa-inbox"></i>
        <p>No menu items found</p>
        <button class="btn-add-empty" @click="showAddItemModal = true">
          <i class="fas fa-plus"></i> Add Your First Item
        </button>
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
            <label for="itemName">Dish Name *</label>
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
                <option value="Appetizers">Appetizers</option>
                <option value="Mains">Mains</option>
                <option value="Desserts">Desserts</option>
                <option value="Beverages">Beverages</option>
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

          <div class="form-group">
            <label for="prepTime">Preparation Time *</label>
            <input 
              id="prepTime"
              v-model="newItem.prepTime"
              type="text" 
              placeholder="e.g., 20min"
              required
              class="form-input"
            />
          </div>

          <div class="form-group">
            <label>Dish Image</label>
            <div 
              class="image-upload-area"
              @dragover="handleDragOver"
              @drop="(e) => handleDragDrop(e, false)"
            >
              <input 
                type="file" 
                accept="image/*" 
                @change="(e) => handleImageUpload(e, false)"
                style="display: none"
                ref="addImageInput"
              />
              <div v-if="!imagePreview" class="upload-placeholder" @click="$refs.addImageInput?.click()">
                <i class="fas fa-cloud-upload-alt"></i>
                <p>Drag and drop image here or click to select</p>
              </div>
              <div v-else class="image-preview">
                <img :src="imagePreview" alt="preview" />
                <button type="button" class="btn-remove-image" @click="imagePreview = ''; newItem.image_url = ''">
                  <i class="fas fa-times"></i>
                </button>
              </div>
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
            <label for="editItemName">Dish Name *</label>
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
                <option value="Appetizers">Appetizers</option>
                <option value="Mains">Mains</option>
                <option value="Desserts">Desserts</option>
                <option value="Beverages">Beverages</option>
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

          <div class="form-group">
            <label for="editPrepTime">Preparation Time *</label>
            <input 
              id="editPrepTime"
              v-model="editingItem.prepTime"
              type="text" 
              placeholder="e.g., 20min"
              required
              class="form-input"
            />
          </div>

          <div class="form-group">
            <label>Dish Image</label>
            <div 
              class="image-upload-area"
              @dragover="handleDragOver"
              @drop="(e) => handleDragDrop(e, true)"
            >
              <input 
                type="file" 
                accept="image/*" 
                @change="(e) => handleImageUpload(e, true)"
                style="display: none"
                ref="editImageInput"
              />
              <div v-if="!editImagePreview" class="upload-placeholder" @click="$refs.editImageInput?.click()">
                <i class="fas fa-cloud-upload-alt"></i>
                <p>Drag and drop image here or click to select</p>
              </div>
              <div v-else class="image-preview">
                <img :src="editImagePreview" alt="preview" />
                <button type="button" class="btn-remove-image" @click="editImagePreview = ''; editingItem.image_url = ''">
                  <i class="fas fa-times"></i>
                </button>
              </div>
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
const editingItem = ref(null)
const imagePreview = ref('')
const editImagePreview = ref('')

const convertImageToBase64 = (file, maxWidth = 800) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        let width = img.width
        let height = img.height
        
        // Resize if image is larger than maxWidth
        if (width > maxWidth) {
          height = (height * maxWidth) / width
          width = maxWidth
        }
        
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, width, height)
        
        // Convert to base64 with compression
        resolve(canvas.toDataURL('image/jpeg', 0.7))
      }
      img.onerror = reject
      img.src = e.target.result
    }
    reader.onerror = error => reject(error)
    reader.readAsDataURL(file)
  })
}

const handleImageUpload = async (event, isEdit = false) => {
  const file = event.target.files?.[0]
  if (!file) return
  
  try {
    const base64 = await convertImageToBase64(file)
    if (isEdit) {
      editingItem.value.image_url = base64
      editImagePreview.value = base64
    } else {
      newItem.value.image_url = base64
      imagePreview.value = base64
    }
  } catch (error) {
    console.error('Error converting image:', error)
    alert('Error uploading image')
  }
}

const handleDragOver = (e) => {
  e.preventDefault()
  e.dataTransfer.dropEffect = 'copy'
}

const handleDragDrop = async (e, isEdit = false) => {
  e.preventDefault()
  const file = e.dataTransfer.files?.[0]
  if (!file) return
  
  try {
    const base64 = await convertImageToBase64(file)
    if (isEdit) {
      editingItem.value.image_url = base64
      editImagePreview.value = base64
    } else {
      newItem.value.image_url = base64
      imagePreview.value = base64
    }
  } catch (error) {
    console.error('Error converting image:', error)
    alert('Error uploading image')
  }
}

const newItem = ref({
  name: '',
  category: '',
  price: 0,
  prepTime: '',
  available: true,
  image_url: '',
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
  editImagePreview.value = item.image_url || ''
  showEditModal.value = true
}

const handleEditSubmit = () => {
  if (editingItem.value) {
    const itemToUpdate = {
      menu_id: editingItem.value.menu_id,
      name: editingItem.value.name,
      category: editingItem.value.category,
      price: editingItem.value.price,
      prep_time: editingItem.value.prepTime,
      available: editingItem.value.available,
      image_url: editingItem.value.image_url || '',
    }
    emit('update-item', itemToUpdate)
    closeEditModal()
  }
}

const closeEditModal = () => {
  showEditModal.value = false
  editingItem.value = null
  editImagePreview.value = ''
}

const handleDelete = (item) => {
  if (confirm(`Delete ${item.name}?`)) {
    emit('delete-item', item.menu_id)
  }
}

const handleAddItem = () => {
  if (newItem.value.name && newItem.value.category && newItem.value.price >= 0 && newItem.value.prepTime) {
    const itemToAdd = {
      name: newItem.value.name,
      category: newItem.value.category,
      price: newItem.value.price,
      prep_time: newItem.value.prepTime,
      available: newItem.value.available,
      image_url: newItem.value.image_url || '',
    }
    emit('add-item', itemToAdd)
    closeModal()
  }
}

const closeModal = () => {
  showAddItemModal.value = false
  imagePreview.value = ''
  newItem.value = {
    name: '',
    category: '',
    price: 0,
    prepTime: '',
    available: true,
    image_url: '',
  }
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
</style>
