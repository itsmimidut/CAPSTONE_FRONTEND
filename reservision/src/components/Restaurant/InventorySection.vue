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
      <div class="search-box">
        <i class="fas fa-search"></i>
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
              <i class="fas fa-cubes"></i>
              {{ item.item }}
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
                <h4><i class="fas fa-utensils"></i> {{ menu.menu_name }}</h4>
                <span class="menu-category">{{ menu.category }}</span>
              </div>
              
              <div class="ingredients-list">
                <div v-for="ing in menu.ingredients" :key="ing.inventory_id" class="ingredient-item">
                  <span class="ing-name">
                    <i class="fas fa-cube"></i> {{ ing.item_name }}
                  </span>
                  <span class="ing-quantity">
                    {{ ing.quantity_needed }} {{ ing.unit }} <small>per serving</small>
                  </span>
                  <span :class="`ing-status status-${ing.status}`">
                    {{ ing.inventory_quantity }} {{ ing.unit }} available
                  </span>
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
                <span>{{ ing.item_name }}</span>
                <span class="qty-badge">{{ ing.quantity_needed }} {{ ing.unit }}</span>
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
                style="flex: 1;"
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
                class="form-input"
                style="flex: 0.5; width: 100px;"
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
 * Functionality: 
 *   - Display inventory items in a sortable/filterable table
 *   - Add new inventory items via modal form
 *   - Edit existing inventory items
 *   - Delete inventory items with confirmation
 *   - Filter and search inventory by name and status
 *   - Calculate and display stock status (low/good) automatically
 *   - Show inventory statistics (low stock count, good stock count, total items)
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

.header-buttons {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
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

.btn-restock-all,
.btn-add-item {
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

.btn-restock-all {
  background: linear-gradient(135deg, #2B6CB0, #1E40AF);
}

.btn-restock-all:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(43, 108, 176, 0.3);
}

.btn-add-item {
  background: linear-gradient(135deg, #10B981, #059669);
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

/* Auto-Deduction Banner Styles */
.auto-deduction-banner {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  gap: 1.5rem;
  color: white;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  animation: slideIn 0.5s ease-out;
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

.banner-icon {
  font-size: 3rem;
  opacity: 0.9;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

.banner-content {
  flex: 1;
}

.banner-content h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.25rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.banner-content p {
  margin: 0 0 1rem 0;
  opacity: 0.95;
  line-height: 1.5;
}

.banner-features {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.feature-badge {
  background: rgba(255, 255, 255, 0.2);
  padding: 0.4rem 0.8rem;
  border-radius: 20px;
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.btn-view-links {
  background: white;
  color: #667eea;
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
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
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

.table-container {
  overflow-x: auto;
  border-radius: 12px;
  border: 1px solid #E5E7EB;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.inventory-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
}

.inventory-table thead {
  background: linear-gradient(135deg, #2B6CB0 0%, #1E40AF 100%);
  border-bottom: 3px solid #1E40AF;
}

.inventory-table th {
  padding: 1.25rem 1rem;
  text-align: left;
  font-weight: 700;
  color: white;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.8px;
}

.inventory-table tbody tr {
  border-bottom: 1px solid #E5E7EB;
  transition: all 0.3s ease;
  background: white;
}

.inventory-table tbody tr:hover {
  background: #F0F9FF;
  box-shadow: inset 0 0 0 1px #DBEAFE;
}

.inventory-table tbody tr.status-low {
  border-left: 4px solid #EF4444;
}

.inventory-table tbody tr.status-good {
  border-left: 4px solid #10B981;
}

.inventory-table td {
  padding: 1.25rem 1rem;
  color: #1F2937;
  font-size: 0.95rem;
}

.item-name {
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: #1F2937;
}

.item-name i {
  color: #2B6CB0;
  font-size: 1.1rem;
}

.quantity {
  text-align: center;
}

.qty-value {
  background: linear-gradient(135deg, #EEF2FF, #DBEAFE);
  color: #1E40AF;
  padding: 0.5rem 0.875rem;
  border-radius: 8px;
  font-weight: 700;
  font-size: 0.95rem;
  box-shadow: 0 2px 4px rgba(30, 64, 175, 0.1);
}

.unit {
  text-align: center;
  color: #6B7280;
  font-size: 0.9rem;
  font-weight: 500;
}

.progress-cell {
  width: 150px;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: #E5E7EB;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  transition: width 0.3s ease;
  border-radius: 4px;
}

.actions-cell {
  display: flex;
  gap: 0.75rem;
  justify-content: center;
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
  font-size: 0.95rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.btn-restock {
  background: linear-gradient(135deg, #DBEAFE, #BAE6FD);
  color: #0284C7;
}

.btn-restock:hover {
  background: linear-gradient(135deg, #BAE6FD, #7DD3FC);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(2, 132, 199, 0.2);
}

.btn-edit {
  background: linear-gradient(135deg, #FEF3C7, #FDE68A);
  color: #B45309;
}

.btn-edit:hover {
  background: linear-gradient(135deg, #FDE68A, #FCD34D);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(217, 119, 6, 0.2);
}

.btn-delete {
  background: linear-gradient(135deg, #FEE2E2, #FECACA);
  color: #B91C1C;
}

.btn-delete:hover {
  background: linear-gradient(135deg, #FECACA, #FCA5A5);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(220, 38, 38, 0.2);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  color: #9CA3AF;
  text-align: center;
}

.empty-state i {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.5;
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
}

.form-input:focus {
  outline: none;
  border-color: #2B6CB0;
  box-shadow: 0 0 0 3px rgba(43, 108, 176, 0.1);
}

.form-hint {
  display: block;
  margin-top: 0.5rem;
  color: #6B7280;
  font-size: 0.85rem;
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

.form-hint {
  display: block;
  margin-top: 0.25rem;
  color: #6B7280;
  font-size: 0.85rem;
}

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
    flex-direction: column;
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

  .search-box {
    min-width: auto;
  }

  .filter-select {
    width: 100%;
  }

  .inventory-table {
    font-size: 0.9rem;
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
    width: 32px;
    height: 32px;
    font-size: 0.75rem;
  }

  .modal-content {
    border-radius: 8px;
  }

  .form-actions {
    flex-direction: column;
  }
}

/* Menu Ingredients Modal Styles */
.modal-large {
  z-index: 1001;
}

.modal-wide {
  max-width: 900px;
  max-height: 85vh;
  overflow-y: auto;
}

.info-box {
  background: #EFF6FF;
  border: 1px solid #BFDBFE;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: #1E40AF;
}

.info-box i {
  font-size: 1.25rem;
}

.loading-state {
  text-align: center;
  padding: 3rem;
  color: #6B7280;
  font-size: 1.1rem;
}

.loading-state i {
  margin-right: 0.5rem;
}

.empty-links {
  text-align: center;
  padding: 3rem;
  color: #9CA3AF;
}

.empty-links i {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.empty-links p {
  font-size: 1.1rem;
  margin: 0.5rem 0;
}

.empty-links small {
  color: #6B7280;
}

.links-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
}

.menu-card {
  background: white;
  border: 1px solid #E5E7EB;
  border-radius: 12px;
  padding: 1.25rem;
  transition: all 0.3s;
}

.menu-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.menu-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 2px solid #F3F4F6;
}

.menu-header h4 {
  margin: 0;
  font-size: 1.1rem;
  color: #1F2937;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.menu-category {
  background: #DBEAFE;
  color: #1E40AF;
  padding: 0.3rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
}

.ingredients-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.ingredient-item {
  display: grid;
  grid-template-columns: 1fr auto auto;
  gap: 0.75rem;
  align-items: center;
  padding: 0.75rem;
  background: #F9FAFB;
  border-radius: 8px;
  font-size: 0.9rem;
}

.ing-name {
  font-weight: 600;
  color: #374151;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.ing-name i {
  color: #6B7280;
}

.ing-quantity {
  color: #6B7280;
  white-space: nowrap;
}

.ing-quantity small {
  color: #9CA3AF;
  font-size: 0.75rem;
}

.ing-status {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
  white-space: nowrap;
}

.ing-status.status-good {
  background: #D1FAE5;
  color: #065F46;
}

.ing-status.status-low {
  background: #FEF3C7;
  color: #92400E;
}

.ing-status.status-critical {
  background: #FEE2E2;
  color: #991B1B;
}

@media (max-width: 768px) {
  .links-grid {
    grid-template-columns: 1fr;
  }
  
  .ingredient-item {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }
  
  .auto-deduction-banner {
    flex-direction: column;
    text-align: center;
  }
  
  .banner-icon {
    font-size: 2rem;
  }
}

/* Add Ingredients to Menu Modal Styles */
.ingredient-input-row {
  display: flex;
  gap: 0.75rem;
  align-items: flex-end;
  flex-wrap: wrap;
}

.btn-action-add {
  padding: 0.75rem 1rem;
  background: linear-gradient(135deg, #10B981, #059669);
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
}

.btn-action-add:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.ingredient-preview {
  background: #F0FDF4;
  border: 1px solid #BBEF63;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1.5rem;
}

.ingredient-preview h4 {
  margin: 0 0 0.75rem 0;
  color: #16A34A;
  font-size: 0.95rem;
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
  padding: 0.75rem;
  border-radius: 6px;
  border-left: 3px solid #10B981;
  font-size: 0.9rem;
}

.qty-badge {
  background: #DBEAFE;
  color: #1E40AF;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-weight: 600;
  font-size: 0.85rem;
}

.btn-remove-ing {
  background: #FEE2E2;
  color: #B91C1C;
  border: none;
  padding: 0.5rem;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-remove-ing:hover {
  background: #FCA5A5;
}

.form-submit:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .ingredient-input-row {
    flex-direction: column;
  }

  .ingredient-input-row input,
  .ingredient-input-row select {
    width: 100%;
  }

  .btn-action-add {
    width: 100%;
  }
}
</style>