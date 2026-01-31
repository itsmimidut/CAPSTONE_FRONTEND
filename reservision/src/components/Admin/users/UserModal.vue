<template>
  <Teleport to="body">
    <div v-if="show" class="modal" @click="handleBackdropClick">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>{{ isEditing ? 'Edit User' : 'Add New User' }}</h3>
          <button class="close-modal" @click="handleClose">×</button>
        </div>

        <div class="modal-body">
          <div class="form-group">
            <label for="userName">Name</label>
            <input
              id="userName"
              v-model="formData.name"
              type="text"
              class="form-control"
              placeholder="Enter name"
            />
          </div>

          <div class="form-group">
            <label for="userEmail">Email</label>
            <input
              id="userEmail"
              v-model="formData.email"
              type="email"
              class="form-control"
              placeholder="Enter email"
            />
          </div>

          <div class="form-group">
            <label for="userRole">Role</label>
            <select id="userRole" v-model="formData.role" class="form-control">
              <option value="Admin">Admin</option>
              <option value="Staff">Staff</option>
              <option value="Customer">Customer</option>
            </select>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn btn-outline" @click="handleClose">Cancel</button>
          <button class="btn btn-primary" @click="handleSave">Save</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  user: {
    type: Object,
    default: null
  },
  isEditing: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update:show', 'save']);

const formData = ref({
  id: null,
  name: '',
  email: '',
  role: 'Customer'
});

watch(() => props.user, (newUser) => {
  if (newUser) {
    formData.value = { ...newUser };
  } else {
    formData.value = { id: null, name: '', email: '', role: 'Customer' };
  }
}, { immediate: true });

function handleClose() {
  emit('update:show', false);
}

function handleBackdropClick() {
  handleClose();
}

function handleSave() {
  if (!formData.value.name.trim() || !formData.value.email.trim()) {
    alert('Name and email are required');
    return;
  }

  emit('save', { ...formData.value });
}

// Handle ESC key
function handleKeydown(e) {
  if (e.key === 'Escape' && props.show) {
    handleClose();
  }
}

watch(() => props.show, (newShow) => {
  if (newShow) {
    document.addEventListener('keydown', handleKeydown);
  } else {
    document.removeEventListener('keydown', handleKeydown);
  }
});
</script>

<style scoped>
.modal {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
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
  border-radius: 1rem;
  width: 92%;
  max-width: 32.5rem;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
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
  padding: 1rem 1.25rem;
  background: #2B6CB0;
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  margin: 0;
  font-weight: 600;
}

.close-modal {
  background: none;
  border: none;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.25rem;
  transition: background 0.2s;
}

.close-modal:hover {
  background: rgba(255, 255, 255, 0.1);
}

.modal-body {
  padding: 1.5rem;
  overflow-y: auto;
  flex: 1;
}

.modal-footer {
  padding: 0.75rem 1.25rem;
  background: #f3f4f6;
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}

.form-group {
  margin-bottom: 1.125rem;
}

.form-group:last-child {
  margin-bottom: 0;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #1A2E28;
}

.form-control {
  width: 100%;
  padding: 0.625rem 0.875rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  font-size: 0.9375rem;
  transition: all 0.3s;
}

.form-control:focus {
  outline: none;
  border-color: #2B6CB0;
  box-shadow: 0 0 0 3px rgba(43, 108, 176, 0.08);
}

.btn {
  padding: 0.625rem 1rem;
  border: none;
  border-radius: 0.625rem;
  cursor: pointer;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.btn-primary {
  background: #2B6CB0;
  color: white;
}

.btn-primary:hover {
  background: #63B3ED;
}

.btn-outline {
  background: transparent;
  border: 1px solid #e2e8f0;
  color: #1A2E28;
}

.btn-outline:hover {
  background: #e6ebee;
}
</style>