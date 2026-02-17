<template>
  <div class="menu-ingredients-manager">
    <div class="header">
      <h2>Menu Ingredients Management</h2>
      <p class="subtitle">Link menu items to inventory ingredients for automatic stock deduction</p>
    </div>

    <!-- Menu Selection -->
    <div class="menu-selector card">
      <label for="menuSelect">Select Menu Item:</label>
      <select id="menuSelect" v-model="selectedMenuId" @change="loadIngredients" class="form-select">
        <option value="">-- Select a menu item --</option>
        <option v-for="item in menuItems" :key="item.menu_id" :value="item.menu_id">
          {{ item.name }} ({{ item.category }})
        </option>
      </select>
    </div>

    <!-- Current Ingredients for Selected Menu -->
    <div v-if="selectedMenuId" class="ingredients-section card">
      <div class="section-header">
        <h3>Ingredients for {{ selectedMenuName }}</h3>
        <button @click="showAddModal = true" class="btn btn-primary">
          <i class="fas fa-plus"></i> Add Ingredient
        </button>
      </div>

      <div v-if="loading" class="loading">Loading ingredients...</div>
      
      <div v-else-if="ingredients.length === 0" class="empty-state">
        <i class="fas fa-box-open"></i>
        <p>No ingredients linked yet. Add ingredients to enable auto-deduction.</p>
      </div>

      <table v-else class="ingredients-table">
        <thead>
          <tr>
            <th>Ingredient Name</th>
            <th>Quantity Needed</th>
            <th>Unit</th>
            <th>Available Stock</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="ing in ingredients" :key="ing.id">
            <td>{{ ing.item_name }}</td>
            <td>{{ ing.quantity_needed }}</td>
            <td>{{ ing.unit }}</td>
            <td>{{ ing.inventory_quantity }}</td>
            <td>
              <span :class="`badge badge-${ing.inventory_status}`">
                {{ ing.inventory_status }}
              </span>
            </td>
            <td>
              <button @click="editIngredient(ing)" class="btn-icon" title="Edit">
                <i class="fas fa-edit"></i>
              </button>
              <button @click="deleteIngredient(ing.id)" class="btn-icon btn-danger" title="Delete">
                <i class="fas fa-trash"></i>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Add Ingredient Modal -->
    <div v-if="showAddModal" class="modal-overlay" @click.self="showAddModal = false">
      <div class="modal">
        <div class="modal-header">
          <h3>Add Ingredient</h3>
          <button @click="showAddModal = false" class="btn-close">&times;</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>Inventory Item:</label>
            <select v-model="newIngredient.inventory_id" class="form-select">
              <option value="">-- Select inventory item --</option>
              <option v-for="inv in availableInventory" :key="inv.inventory_id" :value="inv.inventory_id">
                {{ inv.item_name }} ({{ inv.quantity }} {{ inv.unit }} available)
              </option>
            </select>
          </div>
          <div class="form-group">
            <label>Quantity Needed per Serving:</label>
            <input 
              type="number" 
              v-model.number="newIngredient.quantity_needed" 
              step="0.01"
              min="0.01"
              class="form-input"
              placeholder="e.g., 0.25"
            />
            <small class="form-hint">Amount of this ingredient needed for one serving</small>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="showAddModal = false" class="btn btn-secondary">Cancel</button>
          <button @click="handleAddIngredient" class="btn btn-primary" :disabled="!canAddIngredient">
            Add Ingredient
          </button>
        </div>
      </div>
    </div>

    <!-- Edit Ingredient Modal -->
    <div v-if="showEditModal" class="modal-overlay" @click.self="showEditModal = false">
      <div class="modal">
        <div class="modal-header">
          <h3>Edit Ingredient Quantity</h3>
          <button @click="showEditModal = false" class="btn-close">&times;</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>Ingredient: {{ editingIngredient.item_name }}</label>
          </div>
          <div class="form-group">
            <label>Quantity Needed per Serving:</label>
            <input 
              type="number" 
              v-model.number="editingIngredient.quantity_needed" 
              step="0.01"
              min="0.01"
              class="form-input"
            />
          </div>
        </div>
        <div class="modal-footer">
          <button @click="showEditModal = false" class="btn btn-secondary">Cancel</button>
          <button @click="handleEditIngredient" class="btn btn-primary">
            Update Quantity
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRestaurantStore } from '@/stores/restaurant';

const store = useRestaurantStore();

// State
const selectedMenuId = ref('');
const ingredients = ref([]);
const loading = ref(false);
const showAddModal = ref(false);
const showEditModal = ref(false);

const newIngredient = ref({
  inventory_id: '',
  quantity_needed: 0
});

const editingIngredient = ref({
  id: null,
  item_name: '',
  quantity_needed: 0
});

// Computed
const menuItems = computed(() => store.menuItems);
const selectedMenuName = computed(() => {
  const menu = menuItems.value.find(m => m.menu_id === parseInt(selectedMenuId.value));
  return menu ? menu.name : '';
});

const availableInventory = computed(() => {
  return store.inventory.filter(inv => {
    return !ingredients.value.some(ing => ing.inventory_id === inv.inventory_id);
  });
});

const canAddIngredient = computed(() => {
  return newIngredient.value.inventory_id && newIngredient.value.quantity_needed > 0;
});

// Methods
const loadIngredients = async () => {
  if (!selectedMenuId.value) {
    ingredients.value = [];
    return;
  }

  loading.value = true;
  try {
    const response = await fetch(`http://localhost:8000/api/restaurant/menu/${selectedMenuId.value}/ingredients`);
    const data = await response.json();
    ingredients.value = data.success ? data.data : [];
  } catch (error) {
    console.error('Error loading ingredients:', error);
    alert('Failed to load ingredients');
  } finally {
    loading.value = false;
  }
};

const handleAddIngredient = async () => {
  try {
    const response = await fetch(`http://localhost:8000/api/restaurant/menu/${selectedMenuId.value}/ingredients`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newIngredient.value)
    });

    const data = await response.json();
    
    if (data.success) {
      alert('Ingredient added successfully!');
      showAddModal.value = false;
      newIngredient.value = { inventory_id: '', quantity_needed: 0 };
      await loadIngredients();
    } else {
      alert(data.message || 'Failed to add ingredient');
    }
  } catch (error) {
    console.error('Error adding ingredient:', error);
    alert('Failed to add ingredient');
  }
};

const editIngredient = (ingredient) => {
  editingIngredient.value = {
    id: ingredient.id,
    item_name: ingredient.item_name,
    quantity_needed: ingredient.quantity_needed
  };
  showEditModal.value = true;
};

const handleEditIngredient = async () => {
  try {
    const response = await fetch(`http://localhost:8000/api/restaurant/menu-ingredients/${editingIngredient.value.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantity_needed: editingIngredient.value.quantity_needed })
    });

    const data = await response.json();
    
    if (data.success) {
      alert('Ingredient updated successfully!');
      showEditModal.value = false;
      await loadIngredients();
    } else {
      alert(data.message || 'Failed to update ingredient');
    }
  } catch (error) {
    console.error('Error updating ingredient:', error);
    alert('Failed to update ingredient');
  }
};

const deleteIngredient = async (id) => {
  if (!confirm('Remove this ingredient from the menu item?')) return;

  try {
    const response = await fetch(`http://localhost:8000/api/restaurant/menu-ingredients/${id}`, {
      method: 'DELETE'
    });

    const data = await response.json();
    
    if (data.success) {
      alert('Ingredient removed successfully!');
      await loadIngredients();
    } else {
      alert(data.message || 'Failed to remove ingredient');
    }
  } catch (error) {
    console.error('Error removing ingredient:', error);
    alert('Failed to remove ingredient');
  }
};

// Lifecycle
onMounted(async () => {
  await Promise.all([
    store.fetchMenuItems(),
    store.fetchInventory()
  ]);
});
</script>

<style scoped>
.menu-ingredients-manager {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.header {
  margin-bottom: 30px;
}

.header h2 {
  margin: 0;
  color: #2d3748;
}

.subtitle {
  color: #718096;
  margin-top: 8px;
}

.card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  margin-bottom: 20px;
}

.menu-selector label {
  display: block;
  font-weight: 600;
  margin-bottom: 8px;
  color: #4a5568;
}

.form-select {
  width: 100%;
  padding: 10px;
  border: 1px solid #cbd5e0;
  border-radius: 6px;
  font-size: 14px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-header h3 {
  margin: 0;
  color: #2d3748;
}

.loading {
  text-align: center;
  padding: 40px;
  color: #718096;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #a0aec0;
}

.empty-state i {
  font-size: 48px;
  margin-bottom: 16px;
}

.ingredients-table {
  width: 100%;
  border-collapse: collapse;
}

.ingredients-table th {
  background: #f7fafc;
  padding: 12px;
  text-align: left;
  font-weight: 600;
  color: #4a5568;
  border-bottom: 2px solid #e2e8f0;
}

.ingredients-table td {
  padding: 12px;
  border-bottom: 1px solid #e2e8f0;
}

.badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
}

.badge-good {
  background: #c6f6d5;
  color: #22543d;
}

.badge-low {
  background: #feebc8;
  color: #7c2d12;
}

.badge-critical {
  background: #fed7d7;
  color: #742a2a;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
}

.btn-primary {
  background: #4299e1;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #3182ce;
}

.btn-primary:disabled {
  background: #cbd5e0;
  cursor: not-allowed;
}

.btn-secondary {
  background: #e2e8f0;
  color: #4a5568;
}

.btn-secondary:hover {
  background: #cbd5e0;
}

.btn-icon {
  background: none;
  border: none;
  padding: 6px 10px;
  cursor: pointer;
  color: #4a5568;
  font-size: 14px;
  transition: color 0.2s;
}

.btn-icon:hover {
  color: #2d3748;
}

.btn-icon.btn-danger:hover {
  color: #e53e3e;
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
  z-index: 1000;
}

.modal {
  background: white;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #e2e8f0;
}

.modal-header h3 {
  margin: 0;
  color: #2d3748;
}

.btn-close {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #a0aec0;
  padding: 0;
  width: 32px;
  height: 32px;
}

.btn-close:hover {
  color: #4a5568;
}

.modal-body {
  padding: 20px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  font-weight: 600;
  margin-bottom: 8px;
  color: #4a5568;
}

.form-input {
  width: 100%;
  padding: 10px;
  border: 1px solid #cbd5e0;
  border-radius: 6px;
  font-size: 14px;
}

.form-hint {
  display: block;
  margin-top: 4px;
  color: #718096;
  font-size: 12px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 20px;
  border-top: 1px solid #e2e8f0;
}
</style>
