<template>
  <div class="inventory-section">
    <!-- Header Section with Title and Add Item Button -->
    <div class="section-header">
      <div>
        <!-- Main title and subtitle for the inventory management page -->
        <h2 class="section-title">Inventory Management</h2>
        <p class="section-subtitle">Track and manage restaurant inventory levels</p>
      </div>
      <div class="header-buttons">
        <!-- Button to open modal for adding new inventory items -->
        <button class="btn-add-item" @click="showAddItemModal = true">
          <i class="fas fa-plus"></i> Add New Item
        </button>
      </div>
    </div>

    <!-- Stats Container: Display key inventory metrics at a glance -->
    <div class="stats-container">
      <!-- Card showing count of low stock items -->
      <StatCard 
        label="Low Stock Items"
        :count="inventory.filter(i => i.status === 'low').length"
        class="stat-low-stock"
        icon="fas fa-exclamation-triangle"
        color="danger"
      />
      <!-- Card showing count of items with healthy stock levels -->
      <StatCard 
        label="Good Stock Items"
        :count="inventory.filter(i => i.status === 'good').length"
        class="stat-good-stock"
        icon="fas fa-check-circle"
        color="success"
      />
      <!-- Card showing total number of inventory items in system -->
      <StatCard 
        label="Total Items"
        :count="inventory.length"
        class="stat-total"
        icon="fas fa-boxes"
        color="primary"
      />
    </div>

    <!-- Auto-Deduction Info Banner -->
    <div class="auto-deduction-banner">
      <button class="btn-view-links" @click="showMenuIngredientsModal = true">
        <i class="fas fa-link"></i> View Menu Links
      </button>
      <button class="btn-view-links" @click="showAddIngredientsModal = true">
        <i class="fas fa-plus-circle"></i> Link Ingredients to Menu
      </button>
    </div>

    <!-- Search and Filter Controls -->
    <div class="controls-container">
      <!-- Search box for filtering items by name (case-insensitive) -->
      <div class="search-wrapper">
        <i class="fas fa-search search-icon"></i>
        <input 
          v-model="searchQuery"
          type="text" 
          placeholder="Search items..."
          class="search-input"
        />
      </div>
      <!-- Dropdown to filter items by stock status: all, low stock, or good stock -->
      <select v-model="filterStatus" class="filter-select">
        <option value="">All Status</option>
        <option value="low">Low Stock</option>
        <option value="good">Good Stock</option>
      </select>
    </div>

    <!-- Inventory Table: Main data display showing all inventory items -->
    <div class="table-container">
      <table class="inventory-table">
        <thead>
          <tr>
            <!-- Column Headers -->
            <th>Item</th>              <!-- Product name -->
            <th>Quantity</th>          <!-- Current stock quantity -->
            <th>Unit</th>              <!-- Unit of measurement -->
            <th>Status</th>            <!-- Stock status badge (low/good) -->
            <th>Actions</th>           <!-- Edit and delete buttons -->
          </tr>
        </thead>
        <tbody>
          <!-- Row for each filtered inventory item with color coding based on status -->
          <tr v-for="item in filteredInventory" :key="item.id" :class="`status-${item.status}`">
            <!-- Item name with icon -->
            <td class="item-name">
              <i class="fas fa-cubes item-icon"></i>
              <span>{{ item.item }}</span>
            </td>
            <!-- Current quantity with badge styling -->
            <td class="quantity">
              <span class="qty-value">{{ item.quantity }}</span>
            </td>
            <!-- Unit of measurement (kg, L, pcs, etc) -->
            <td class="unit">{{ item.unit }}</td>
            <!-- Status badge: displays "Low Stock" or "Good Stock" with color -->
            <td>
              <StatusBadge :status="item.status" />
            </td>
            <!-- Action buttons: Edit and Delete -->
            <td class="actions-cell">
              <button 
                class="btn-action btn-edit"
                @click="handleEdit(item)"
                title="Edit item"
              >
                <i class="fas fa-edit"></i>
              </button>
              <button 
                class="btn-action btn-delete"
                @click="handleDelete(item)"
                title="Delete item"
              >
                <i class="fas fa-trash"></i>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
      <!-- Empty state message when no items match search/filter criteria -->
      <div v-if="filteredInventory.length === 0" class="empty-state">
        <i class="fas fa-inbox"></i>
        <p>No inventory items found</p>
      </div>
    </div>

    <!-- Add Item Modal: Form for adding new inventory items -->
    <div v-if="showAddItemModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>Add New Inventory Item</h3>
          <!-- Close button for the modal -->
          <button class="btn-close" @click="closeModal">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <!-- Form for entering new inventory item details -->
        <form @submit.prevent="handleAddItem" class="modal-form">
          <!-- Item name input field (required) -->
          <div class="form-group">
            <label for="itemName">Item Name *</label>
            <input 
              id="itemName"
              v-model="newItem.item"
              type="text" 
              placeholder="e.g., Salmon Fillet"
              required
              class="form-input"
            />
          </div>

          <!-- Two-column row for quantity and unit inputs -->
          <div class="form-row">
            <!-- Quantity input field (non-negative number) -->
            <div class="form-group">
              <label for="quantity">Quantity *</label>
              <input 
                id="quantity"
                v-model.number="newItem.quantity"
                type="number" 
                placeholder="0"
                required
                min="0"
                class="form-input"
              />
            </div>

            <!-- Unit input field: specify measurement unit (kg, L, pcs, etc) -->
            <div class="form-group">
              <label for="unit">Unit *</label>
              <input 
                id="unit"
                v-model="newItem.unit"
                type="text" 
                placeholder="e.g., kg, L, pcs"
                required
                class="form-input"
              />
            </div>
          </div>

          <!-- Threshold field for low-stock alert level -->
          <div class="form-group">
            <label for="threshold">Low Stock Threshold *</label>
            <input 
              id="threshold"
              v-model.number="newItem.threshold"
              type="number" 
              placeholder="Alert when stock falls below this level"
              required
              min="0"
              step="0.01"
              class="form-input"
            />
            <small class="form-hint">You'll be alerted when stock falls below this level</small>
          </div>

          <!-- Form action buttons: Cancel and Submit -->
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

    <!-- Edit Item Modal: Form for updating existing inventory items -->
    <div v-if="showEditModal" class="modal-overlay" @click.self="closeEditModal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>Edit Inventory Item</h3>
          <!-- Close button for the modal -->
          <button class="btn-close" @click="closeEditModal">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <!-- Form for editing inventory item details -->
        <form @submit.prevent="handleEditSubmit" class="modal-form">
          <!-- Item name input field -->
          <div class="form-group">
            <label for="editItemName">Item Name *</label>
            <input 
              id="editItemName"
              v-model="editingItem.item"
              type="text" 
              placeholder="e.g., Salmon Fillet"
              required
              class="form-input"
            />
          </div>

          <!-- Two-column row for quantity and unit -->
          <div class="form-row">
            <!-- Updated quantity field -->
            <div class="form-group">
              <label for="editQuantity">Quantity *</label>
              <input 
                id="editQuantity"
                v-model.number="editingItem.quantity"
                type="number" 
                placeholder="0"
                required
                min="0"
                class="form-input"
              />
            </div>

            <!-- Updated unit field -->
            <div class="form-group">
              <label for="editUnit">Unit *</label>
              <input 
                id="editUnit"
                v-model="editingItem.unit"
                type="text" 
                placeholder="e.g., kg, L, pcs"
                required
                class="form-input"
              />
            </div>
          </div>

          <!-- Threshold field for low-stock alert level -->
          <div class="form-group">
            <label for="editThreshold">Low Stock Threshold *</label>
            <input 
              id="editThreshold"
              v-model.number="editingItem.threshold"
              type="number" 
              placeholder="Alert when stock falls below this level"
              required
              min="0"
              step="0.01"
              class="form-input"
            />
            <small class="form-hint">You'll be alerted when stock falls below this level</small>
          </div>

          <!-- Form action buttons: Cancel and Save -->
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

    <!-- Menu Ingredients Modal: Show which menu items use inventory ingredients -->
    <div v-if="showMenuIngredientsModal" class="modal-overlay modal-large" @click.self="showMenuIngredientsModal = false">
      <div class="modal-content modal-wide">
        <div class="modal-header">
          <h3><i class="fas fa-link"></i> Menu-Inventory Links</h3>
          <button class="btn-close" @click="showMenuIngredientsModal = false">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="modal-body">
          <div class="info-box">
            <i class="fas fa-info-circle"></i>
            <p>When customers order these menu items, the linked ingredients are automatically deducted from inventory.</p>
          </div>

          <div v-if="loadingLinks" class="loading-state">
            <i class="fas fa-spinner fa-spin"></i> Loading menu links...
          </div>

          <div v-else-if="menuIngredientLinks.length === 0" class="empty-links">
            <i class="fas fa-unlink"></i>
            <p>No menu items are linked to inventory yet.</p>
            <small>Contact admin to set up menu-ingredient relationships.</small>
          </div>

          <div v-else class="links-grid">
            <div v-for="menu in menuIngredientLinks" :key="menu.menu_id" class="menu-card">
              <div class="menu-header">
                <div class="menu-title-section">
                  <i class="fas fa-utensils menu-icon"></i>
                  <h4>{{ menu.menu_name }}</h4>
                </div>
                <span class="menu-category">{{ menu.category }}</span>
              </div>
              
              <div class="ingredients-list">
                <div v-for="ing in menu.ingredients" :key="ing.inventory_id" class="ingredient-item">
                  <div class="ingredient-info">
                    <span class="ing-name">
                      <i class="fas fa-cube ing-bullet"></i>
                      <span class="ing-name-text">{{ ing.item_name }}</span>
                    </span>
                    <span class="ing-quantity">{{ ing.quantity_needed }} {{ ing.unit }} <span class="per-serving">per serving</span></span>
                  </div>
                  <div class="ingredient-availability">
                    <span :class="`ing-status status-${ing.status}`">
                      <i class="fas fa-box"></i>
                      {{ ing.inventory_quantity }} {{ ing.unit }} available
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn-cancel" @click="showMenuIngredientsModal = false">Close</button>
        </div>
      </div>
    </div>

    <!-- Add Ingredients to Menu Modal -->
    <div v-if="showAddIngredientsModal" class="modal-overlay" @click.self="showAddIngredientsModal = false">
      <div class="modal-content">
        <div class="modal-header">
          <h3><i class="fas fa-plus-circle"></i> Link Ingredients to Menu Item</h3>
          <button class="btn-close" @click="showAddIngredientsModal = false">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <form @submit.prevent="handleAddMenuIngredient" class="modal-form">
          <!-- Select Menu Item -->
          <div class="form-group">
            <label for="selectMenu">Select Menu Item *</label>
            <select 
              id="selectMenu"
              v-model="selectedMenuId"
              required
              class="form-input"
            >
              <option value="">Choose a menu item...</option>
              <option v-for="menu in availableMenus" :key="menu.menu_id" :value="menu.menu_id">
                {{ menu.name }} - ₱{{ menu.price }}
              </option>
            </select>
          </div>

          <!-- Display Current Ingredients for Selected Menu -->
          <div v-if="selectedMenuCurrentIngredients.length > 0" class="ingredient-preview">
            <h4>Current Ingredients:</h4>
            <div class="ingredient-list-view">
              <div v-for="ing in selectedMenuCurrentIngredients" :key="ing.id" class="ingredient-preview-item">
                <span class="preview-item-name">{{ ing.item_name }}</span>
                <span class="preview-qty-badge">{{ ing.quantity_needed }} {{ ing.unit }}</span>
                <button 
                  type="button"
                  class="btn-remove-ing"
                  @click="handleRemoveIngredient(ing.id)"
                  title="Remove ingredient"
                >
                  <i class="fas fa-trash-alt"></i>
                </button>
              </div>
            </div>
          </div>

          <!-- Add New Ingredient Row -->
          <div class="form-group">
            <label for="selectInventory">Add Ingredient *</label>
            <div class="ingredient-input-row">
              <select 
                id="selectInventory"
                v-model="newIngredient.inventory_id"
                required
                class="form-input"
              >
                <option value="">Select inventory item...</option>
                <option v-for="inv in inventory" :key="inv.id" :value="inv.id || inv.inventory_id">
                  {{ inv.item || inv.item_name }} ({{ inv.quantity }} {{ inv.unit }})
                </option>
              </select>
              <input 
                v-model.number="newIngredient.quantity_needed"
                type="number"
                placeholder="Qty"
                required
                min="0.01"
                step="0.01"
                class="form-input quantity-input"
              />
              <button 
                type="button"
                @click="handleAddSingleIngredient"
                class="btn-action-add"
              >
                <i class="fas fa-plus"></i> Add
              </button>
            </div>
            <small class="form-hint">Select an inventory item and specify the quantity needed per serving</small>
          </div>

          <!-- Form action buttons -->
          <div class="form-actions">
            <button type="button" class="btn-cancel" @click="showAddIngredientsModal = false">
              Cancel
            </button>
            <button type="submit" class="btn-submit" :disabled="!selectedMenuId">
              <i class="fas fa-save"></i> Save Links
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
/**
 * InventorySection.vue
 * Purpose: Display and manage restaurant inventory items in a data table with CRUD operations
 */

import { ref, computed, watch } from 'vue'
import StatusBadge from './StatusBadge.vue'
import StatCard from './StatCard.vue'

// Component props - receives inventory data from parent component
const props = defineProps({
  inventory: Array, // Array of inventory items with id, item, quantity, unit, status, etc
})

// Emits - parent component listens for these events to handle data mutations
const emit = defineEmits(['update-stock', 'edit-item', 'delete-item', 'add-item', 'update-item'])

// ===== State Variables =====

// Search/Filter state
const searchQuery = ref('') // User's search text for filtering items by name
const filterStatus = ref('') // Filter dropdown: '' (all), 'low' (low stock), 'good' (good stock)

// Modal visibility states
const showAddItemModal = ref(false) // Controls visibility of "Add Item" modal dialog
const showEditModal = ref(false) // Controls visibility of "Edit Item" modal dialog
const showMenuIngredientsModal = ref(false) // Controls visibility of "Menu Ingredients" modal
const showAddIngredientsModal = ref(false) // Controls visibility of "Add Ingredients to Menu" modal

// Menu ingredients state
const menuIngredientLinks = ref([]) // Array of menu items with their linked ingredients
const loadingLinks = ref(false) // Loading state for fetching menu links

// Menu items state for linking ingredients
const availableMenus = ref([]) // List of all menu items
const selectedMenuId = ref('') // Currently selected menu item for linking ingredients
const newIngredient = ref({ inventory_id: '', quantity_needed: 0 }) // New ingredient being added
const addedIngredientsBuffer = ref([]) // Temporarily store ingredients before saving

// Form data for editing
const editingItem = ref(null) // Currently edited item object with all its fields

// Image preview states (base64 strings for image preview display)
const imagePreview = ref('') // Preview image for new item being added
const editImagePreview = ref('') // Preview image for item being edited

/**
 * Converts image file to Base64 string with optional resizing
 * Purpose: Prepare image data for storage in database as base64 encoded string
 * @param {File} file - Image file from input
 * @param {number} maxWidth - Maximum width for resizing (default: 800px)
 * @returns {Promise<string>} - Base64 encoded image string with JPEG compression
 */
const convertImageToBase64 = (file, maxWidth = 800) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        let width = img.width
        let height = img.height
        
        // Resize if image is larger than maxWidth to optimize storage
        if (width > maxWidth) {
          height = (height * maxWidth) / width
          width = maxWidth
        }
        
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, width, height)
        
        // Convert to base64 with 70% JPEG compression quality
        resolve(canvas.toDataURL('image/jpeg', 0.7))
      }
      img.onerror = reject
      img.src = e.target.result
    }
    reader.onerror = error => reject(error)
    reader.readAsDataURL(file)
  })
}

/**
 * Handles image file selection from input
 * Converts to Base64 and stores in appropriate state (add or edit mode)
 * @param {Event} event - File input change event
 * @param {boolean} isEdit - True if editing existing item, false if adding new
 */
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

/**
 * Handles drag over event for drag-and-drop image upload
 * Sets proper visual feedback during drag
 */
const handleDragOver = (e) => {
  e.preventDefault()
  e.dataTransfer.dropEffect = 'copy'
}

/**
 * Handles dropped files in drag-and-drop image upload
 * Converts dropped image to Base64 like file input
 * @param {DragEvent} e - Drag event containing dropped files
 * @param {boolean} isEdit - True if editing, false if adding
 */
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

/**
 * Reactive object for new inventory item being added
 * Fields:
 * - item: Name/description of the inventory item (matches v-model binding)
 * - quantity: Current stock quantity (number)
 * - unit: Unit of measurement (kg, L, pcs, etc)
 * - threshold: Low stock alert level
 * - image_url: Base64 encoded image data for product preview
 */
const newItem = ref({
  item: '',
  quantity: 0,
  unit: '',
  threshold: 0,
  image_url: '',
})

/**
 * Computed property that filters inventory items based on search query and status filter
 * Used by template to display only relevant items
 * Matching is case-insensitive for search, and exact for status
 * @returns {Array} - Filtered array of inventory items
 */
const filteredInventory = computed(() => {
  return props.inventory.filter(item => {
    const matchesSearch = item.item.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchesStatus = !filterStatus.value || item.status === filterStatus.value
    return matchesSearch && matchesStatus
  })
})

/**
 * Computed property to get current ingredients for selected menu item
 * @returns {Array} - Ingredients linked to the currently selected menu
 */
const selectedMenuCurrentIngredients = computed(() => {
  if (!selectedMenuId.value) return []
  const menu = menuIngredientLinks.value.find(m => m.menu_id === Number(selectedMenuId.value))
  return menu?.ingredients || []
})

/**
 * Opens edit modal with selected item's data
 * Creates a copy of item data to avoid mutating original until save
 * @param {Object} item - Inventory item to edit
 */
const handleEdit = (item) => {
  editingItem.value = { ...item }
  showEditModal.value = true
}

/**
 * Submits edited item changes to parent component
 * Maps item data to correct field names and emits update event
 * Closes modal after submission
 */
const handleEditSubmit = () => {
  if (editingItem.value) {
    const itemToUpdate = {
      id: editingItem.value.id || editingItem.value.inventory_id,
      item_name: editingItem.value.item || editingItem.value.item_name,
      quantity: editingItem.value.quantity,
      unit: editingItem.value.unit,
      threshold: editingItem.value.threshold
    }
    emit('update-item', itemToUpdate)
    closeEditModal()
  }
}

/**
 * Closes edit modal and clears editing state
 */
const closeEditModal = () => {
  showEditModal.value = false
  editingItem.value = null
  editImagePreview.value = ''
}

/**
 * Handles item deletion with user confirmation
 * Shows confirm dialog before deletion to prevent accidents
 * @param {number|string} item - Inventory item to delete
 */
const handleDelete = (item) => {
  const itemName = item.item || item.item_name
  if (confirm(`Delete ${itemName}?`)) {
    emit('delete-item', item.id || item.inventory_id)
  }
}

/**
 * Submits new inventory item to parent component
 * Validates required fields before submission
 * Required: item name, unit, threshold and valid quantities >= 0
 * Emits add-item event with formatted data
 */
const handleAddItem = () => {
  if (newItem.value.item && newItem.value.quantity >= 0 && newItem.value.unit && newItem.value.threshold >= 0) {
    const itemToAdd = {
      item_name: newItem.value.item,
      quantity: newItem.value.quantity,
      unit: newItem.value.unit,
      threshold: newItem.value.threshold
    }
    emit('add-item', itemToAdd)
    closeModal()
  }
}

/**
 * Closes add item modal and resets form to initial state
 */
const closeModal = () => {
  showAddItemModal.value = false
  newItem.value = {
    item: '',
    quantity: 0,
    unit: '',
    threshold: 0,
    image_url: '',
  }
  imagePreview.value = ''
}

/**
 * Fetches menu items with their linked ingredients
 * Shows which menu items will auto-deduct from inventory
 */
const fetchMenuIngredientLinks = async () => {
  loadingLinks.value = true
  try {
    const response = await fetch('http://localhost:8000/api/restaurant/menu-with-ingredients')
    const data = await response.json()
    
    if (data.success) {
      // Filter out menu items that have no ingredients
      menuIngredientLinks.value = data.data.filter(menu => {
        return menu.ingredients && menu.ingredients.length > 0 && menu.ingredients[0]?.inventory_id
      })
    }
  } catch (error) {
    console.error('Error fetching menu links:', error)
  } finally {
    loadingLinks.value = false
  }
}

/**
 * Fetches all available menu items from backend
 */
const fetchAvailableMenus = async () => {
  try {
    const response = await fetch('http://localhost:8000/api/restaurant/menu')
    const data = await response.json()
    
    if (Array.isArray(data)) {
      availableMenus.value = data
    } else if (data.success && Array.isArray(data.data)) {
      availableMenus.value = data.data
    }
  } catch (error) {
    console.error('Error fetching menu items:', error)
  }
}

/**
 * Adds a single ingredient to the buffered ingredients list
 * Validates input before adding
 */
const handleAddSingleIngredient = () => {
  if (!newIngredient.value.inventory_id || !newIngredient.value.quantity_needed) {
    alert('Please select an inventory item and specify quantity')
    return
  }

  const inventoryItem = props.inventory.find(
    i => (i.id || i.inventory_id) === Number(newIngredient.value.inventory_id)
  )

  if (!inventoryItem) {
    alert('Inventory item not found')
    return
  }

  // Check if ingredient is already added
  const alreadyAdded = selectedMenuCurrentIngredients.value.some(
    ing => ing.inventory_id === Number(newIngredient.value.inventory_id)
  )

  if (alreadyAdded) {
    alert('This ingredient is already linked to this menu item')
    return
  }

  // Add to buffer
  addedIngredientsBuffer.value.push({
    inventory_id: Number(newIngredient.value.inventory_id),
    quantity_needed: newIngredient.value.quantity_needed,
    item_name: inventoryItem.item || inventoryItem.item_name,
    unit: inventoryItem.unit
  })

  // Reset input
  newIngredient.value = { inventory_id: '', quantity_needed: 0 }
}

/**
 * Submits all buffered ingredients to backend
 * Creates associations between menu item and inventory items
 */
const handleAddMenuIngredient = async () => {
  if (!selectedMenuId.value) {
    alert('Please select a menu item')
    return
  }

  if (addedIngredientsBuffer.value.length === 0) {
    alert('Please add at least one ingredient')
    return
  }

  try {
    for (const ingredient of addedIngredientsBuffer.value) {
      const response = await fetch(
        `http://localhost:8000/api/restaurant/menu/${selectedMenuId.value}/ingredients`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            inventory_id: ingredient.inventory_id,
            quantity_needed: ingredient.quantity_needed
          })
        }
      )

      const data = await response.json()
      if (!data.success) {
        console.error(`Error adding ingredient: ${data.message}`)
      }
    }

    // Refresh menu links and close modal
    await fetchMenuIngredientLinks()
    closeAddIngredientsModal()
    alert('Ingredients linked successfully!')
  } catch (error) {
    console.error('Error saving ingredients:', error)
    alert('Error saving ingredients')
  }
}

/**
 * Removes an ingredient from a menu item
 */
const handleRemoveIngredient = async (ingredientId) => {
  if (!confirm('Remove this ingredient from the menu?')) return

  try {
    const response = await fetch(
      `http://localhost:8000/api/restaurant/menu-ingredients/${ingredientId}`,
      { method: 'DELETE' }
    )

    const data = await response.json()
    if (data.success) {
      await fetchMenuIngredientLinks()
      alert('Ingredient removed successfully!')
    }
  } catch (error) {
    console.error('Error removing ingredient:', error)
    alert('Error removing ingredient')
  }
}

/**
 * Closes add ingredients modal and resets form
 */
const closeAddIngredientsModal = () => {
  showAddIngredientsModal.value = false
  selectedMenuId.value = ''
  newIngredient.value = { inventory_id: '', quantity_needed: 0 }
  addedIngredientsBuffer.value = []
}

// Watch for modal open to fetch menus and links
watch(showAddIngredientsModal, (newVal) => {
  if (newVal) {
    fetchAvailableMenus()
    fetchMenuIngredientLinks()
  }
})

// Watch for viewing menu links
watch(showMenuIngredientsModal, (newVal) => {
  if (newVal) {
    fetchMenuIngredientLinks()
  }
})
</script>

<style scoped>
.inventory-section {
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

.header-buttons {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
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

/* Auto-Deduction Banner Styles */
.auto-deduction-banner {
  background: linear-gradient(135deg, #1F8DBF 0%, #1E88B6 100%);
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  gap: 1.5rem;
  color: white;
  box-shadow: 0 4px 12px rgba(31, 141, 191, 0.3);
  animation: slideIn 0.5s ease-out;
  border-left: 4px solid #F4C400;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.btn-view-links {
  background: white;
  color: #1F8DBF;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s;
  white-space: nowrap;
}

.btn-view-links:hover {
  background: #F4C400;
  color: #1F8DBF;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
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
  border: 2px solid #F4C400;
}

.search-wrapper {
  flex: 1;
  min-width: 250px;
  display: flex;
  align-items: center;
  background: #F9FAFB;
  border-radius: 8px;
  border: 1px solid rgba(31, 141, 191, 0.2);
  transition: all 0.3s ease;
  padding: 0 0.75rem;
  height: 46px;
}

.search-wrapper:focus-within {
  border-color: #F4C400;
  box-shadow: 0 0 0 3px rgba(244, 196, 0, 0.15);
}

.search-icon {
  color: #F4C400;
  font-size: 0.95rem;
  margin-right: 0.75rem;
  width: 16px;
  text-align: center;
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
  height: 100%;
}

.search-input::placeholder {
  color: rgba(31, 141, 191, 0.4);
  font-weight: normal;
}

.filter-select {
  padding: 0 1.25rem;
  border: 1px solid rgba(31, 141, 191, 0.2);
  border-radius: 8px;
  background: white;
  color: #1F8DBF;
  cursor: pointer;
  font-size: 0.95rem;
  transition: all 0.3s;
  font-weight: 500;
  min-width: 160px;
  height: 46px;
}

.filter-select:hover {
  border-color: #1F8DBF;
}

.filter-select:focus {
  outline: none;
  border-color: #F4C400;
  box-shadow: 0 0 0 3px rgba(244, 196, 0, 0.15);
}

/* Table Styles */
.table-container {
  overflow-x: auto;
  border-radius: 12px;
  border: 1px solid rgba(31, 141, 191, 0.1);
  box-shadow: 0 4px 12px rgba(31, 141, 191, 0.08);
}

.inventory-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  table-layout: fixed;
}

.inventory-table thead {
  background: linear-gradient(135deg, #1F8DBF 0%, #1E88B6 100%);
  border-bottom: 3px solid #F4C400;
}

.inventory-table th {
  padding: 1.25rem 1rem;
  text-align: left;
  font-weight: 700;
  color: white;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.8px;
}

.inventory-table th:nth-child(1) { width: 30%; }
.inventory-table th:nth-child(2) { width: 15%; }
.inventory-table th:nth-child(3) { width: 12%; }
.inventory-table th:nth-child(4) { width: 15%; }
.inventory-table th:nth-child(5) { width: 28%; }

.inventory-table tbody tr {
  border-bottom: 1px solid rgba(31, 141, 191, 0.1);
  transition: all 0.3s ease;
  background: white;
}

.inventory-table tbody tr:hover {
  background: rgba(244, 196, 0, 0.05);
  box-shadow: inset 0 0 0 1px rgba(244, 196, 0, 0.2);
}

.inventory-table tbody tr.status-low {
  border-left: 4px solid #F4C400;
}

.inventory-table tbody tr.status-good {
  border-left: 4px solid #1F8DBF;
}

.inventory-table td {
  padding: 1.25rem 1rem;
  color: #1F8DBF;
  font-size: 0.95rem;
  vertical-align: middle;
}

.item-name {
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: #1F8DBF;
}

.item-icon {
  color: #F4C400;
  font-size: 1.1rem;
  width: 20px;
  text-align: center;
}

.quantity {
  text-align: left;
}

.qty-value {
  background: rgba(31, 141, 191, 0.1);
  color: #1F8DBF;
  padding: 0.5rem 0.875rem;
  border-radius: 8px;
  font-weight: 700;
  font-size: 0.95rem;
  border: 1px solid rgba(31, 141, 191, 0.2);
  display: inline-block;
  min-width: 60px;
  text-align: center;
}

.unit {
  text-align: left;
  color: #1E88B6;
  font-size: 0.95rem;
  font-weight: 500;
}

.actions-cell {
  display: flex;
  gap: 0.75rem;
  align-items: center;
  flex-wrap: wrap;
}

.btn-action {
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  font-size: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  flex-shrink: 0;
}

.btn-edit {
  background: rgba(31, 141, 191, 0.1);
  color: #1F8DBF;
}

.btn-edit:hover {
  background: #1F8DBF;
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(31, 141, 191, 0.2);
}

.btn-delete {
  background: rgba(244, 196, 0, 0.1);
  color: #F4C400;
}

.btn-delete:hover {
  background: #F4C400;
  color: #1F8DBF;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(244, 196, 0, 0.3);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  color: #1F8DBF;
  text-align: center;
  background: white;
  border-radius: 12px;
}

.empty-state i {
  font-size: 3rem;
  margin-bottom: 1rem;
  color: #F4C400;
  opacity: 0.5;
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
  color: #1E88B6;
}

.form-input:focus {
  outline: none;
  border-color: #F4C400;
  box-shadow: 0 0 0 3px rgba(244, 196, 0, 0.15);
}

.form-hint {
  display: block;
  margin-top: 0.5rem;
  color: #1F8DBF;
  font-size: 0.85rem;
  opacity: 0.7;
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

/* Menu Ingredients Modal Styles - Reworked for proper alignment */
.modal-large {
  z-index: 1001;
}

.modal-wide {
  max-width: 900px;
  max-height: 85vh;
  overflow-y: auto;
}

.info-box {
  background: rgba(31, 141, 191, 0.1);
  border: 1px solid rgba(31, 141, 191, 0.2);
  border-radius: 8px;
  padding: 1rem 1.25rem;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: #1F8DBF;
  font-size: 0.95rem;
}

.info-box i {
  font-size: 1.25rem;
  color: #F4C400;
  flex-shrink: 0;
}

.info-box p {
  margin: 0;
  line-height: 1.5;
}

.loading-state {
  text-align: center;
  padding: 3rem;
  color: #1F8DBF;
  font-size: 1.1rem;
}

.loading-state i {
  margin-right: 0.5rem;
  color: #F4C400;
}

.empty-links {
  text-align: center;
  padding: 3rem;
  color: #1F8DBF;
}

.empty-links i {
  font-size: 3rem;
  margin-bottom: 1rem;
  color: #F4C400;
  opacity: 0.5;
}

.empty-links p {
  font-size: 1.1rem;
  margin: 0.5rem 0;
}

.empty-links small {
  color: #1E88B6;
  opacity: 0.7;
}

.links-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.25rem;
}

.menu-card {
  background: white;
  border: 1px solid rgba(31, 141, 191, 0.2);
  border-radius: 12px;
  padding: 1.25rem;
  transition: all 0.3s;
  box-shadow: 0 2px 8px rgba(31, 141, 191, 0.05);
}

.menu-card:hover {
  box-shadow: 0 8px 24px rgba(31, 141, 191, 0.15);
  transform: translateY(-2px);
  border-left: 4px solid #F4C400;
}

.menu-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.25rem;
  padding-bottom: 0.75rem;
  border-bottom: 2px solid #F4C400;
}

.menu-title-section {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.menu-icon {
  color: #F4C400;
  font-size: 1.1rem;
  width: 20px;
}

.menu-header h4 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
  color: #1F8DBF;
}

.menu-category {
  background: rgba(244, 196, 0, 0.1);
  color: #F4C400;
  padding: 0.4rem 1rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  border: 1px solid rgba(244, 196, 0, 0.2);
  letter-spacing: 0.3px;
}

.ingredients-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.ingredient-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  background: rgba(31, 141, 191, 0.03);
  border-radius: 8px;
  border-left: 3px solid;
  transition: all 0.2s ease;
}

.ingredient-item:hover {
  background: rgba(244, 196, 0, 0.05);
}

.ingredient-item:has(.status-good) {
  border-left-color: #1F8DBF;
}

.ingredient-item:has(.status-low) {
  border-left-color: #F4C400;
}

.ingredient-info {
  display: flex;
  align-items: center;
  gap: 2rem;
  flex-wrap: wrap;
}

.ing-name {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 180px;
}

.ing-bullet {
  color: #F4C400;
  font-size: 0.85rem;
  width: 16px;
}

.ing-name-text {
  font-weight: 600;
  color: #1F8DBF;
  font-size: 0.95rem;
}

.ing-quantity {
  color: #1E88B6;
  font-size: 0.9rem;
  white-space: nowrap;
}

.per-serving {
  color: rgba(31, 141, 191, 0.5);
  font-size: 0.8rem;
  margin-left: 0.25rem;
}

.ingredient-availability {
  display: flex;
  align-items: center;
}

.ing-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.35rem 1rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  white-space: nowrap;
}

.ing-status i {
  font-size: 0.85rem;
}

.ing-status.status-good {
  background: rgba(31, 141, 191, 0.1);
  color: #1F8DBF;
  border: 1px solid rgba(31, 141, 191, 0.2);
}

.ing-status.status-low {
  background: rgba(244, 196, 0, 0.1);
  color: #F4C400;
  border: 1px solid rgba(244, 196, 0, 0.2);
}

/* Add Ingredients to Menu Modal Styles */
.ingredient-input-row {
  display: flex;
  gap: 0.75rem;
  align-items: center;
  flex-wrap: wrap;
}

.ingredient-input-row .form-input {
  flex: 1;
  min-width: 150px;
}

.ingredient-input-row .quantity-input {
  max-width: 100px;
}

.btn-action-add {
  padding: 0.75rem 1.25rem;
  background: linear-gradient(135deg, #1F8DBF 0%, #1E88B6 100%);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s;
  white-space: nowrap;
  box-shadow: 0 4px 12px rgba(31, 141, 191, 0.2);
  height: 46px;
}

.btn-action-add:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(31, 141, 191, 0.3);
}

.btn-action-add i {
  color: #F4C400;
}

.ingredient-preview {
  background: rgba(31, 141, 191, 0.05);
  border: 1px solid rgba(31, 141, 191, 0.2);
  border-radius: 8px;
  padding: 1.25rem;
  margin-bottom: 1.5rem;
}

.ingredient-preview h4 {
  margin: 0 0 1rem 0;
  color: #1F8DBF;
  font-size: 1rem;
  font-weight: 600;
}

.ingredient-list-view {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.ingredient-preview-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  border-left: 3px solid #1F8DBF;
  font-size: 0.9rem;
}

.preview-item-name {
  font-weight: 500;
  color: #1F8DBF;
  flex: 1;
}

.preview-qty-badge {
  background: rgba(244, 196, 0, 0.1);
  color: #F4C400;
  padding: 0.25rem 1rem;
  border-radius: 20px;
  font-weight: 600;
  font-size: 0.85rem;
  border: 1px solid rgba(244, 196, 0, 0.2);
  margin: 0 1rem;
}

.btn-remove-ing {
  background: rgba(244, 196, 0, 0.1);
  color: #F4C400;
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
  flex-shrink: 0;
}

.btn-remove-ing:hover {
  background: #F4C400;
  color: #1F8DBF;
  transform: scale(1.1);
}

.form-submit:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  padding: 1.25rem 1.5rem;
  border-top: 2px solid rgba(244, 196, 0, 0.3);
  background: rgba(31, 141, 191, 0.02);
}

/* Responsive */
@media (max-width: 768px) {
  .inventory-section {
    padding: 1.5rem;
  }

  .section-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .header-buttons {
    width: 100%;
  }

  .header-buttons button {
    width: 100%;
  }

  .stats-container {
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }

  .controls-container {
    flex-direction: column;
  }

  .search-wrapper {
    min-width: auto;
    width: 100%;
  }

  .filter-select {
    width: 100%;
  }

  .inventory-table {
    font-size: 0.9rem;
    table-layout: auto;
  }

  .inventory-table th,
  .inventory-table td {
    padding: 0.75rem;
  }

  .section-title {
    font-size: 1.5rem;
  }

  .form-row {
    grid-template-columns: 1fr;
  }
  
  .auto-deduction-banner {
    flex-direction: column;
    text-align: center;
  }
  
  .ingredient-input-row {
    flex-direction: column;
    align-items: stretch;
  }

  .ingredient-input-row .form-input,
  .ingredient-input-row .quantity-input,
  .btn-action-add {
    width: 100%;
    max-width: none;
  }

  .ingredient-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .ingredient-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }

  .ingredient-availability {
    width: 100%;
  }

  .ing-status {
    width: 100%;
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .stats-container {
    grid-template-columns: 1fr;
  }

  .actions-cell {
    flex-direction: column;
    gap: 0.25rem;
  }

  .btn-action {
    width: 36px;
    height: 36px;
    font-size: 0.875rem;
  }

  .modal-content {
    border-radius: 8px;
  }

  .form-actions {
    flex-direction: column;
  }
  
  .links-grid {
    grid-template-columns: 1fr;
  }
  
  .ingredient-preview-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .preview-qty-badge {
    margin: 0.5rem 0;
  }

  .btn-remove-ing {
    align-self: flex-end;
  }
}
</style>