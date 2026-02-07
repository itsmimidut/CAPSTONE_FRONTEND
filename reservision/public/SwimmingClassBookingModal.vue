<template>
  <div class="modal-overlay" @click.self="handleClose">
    <div class="modal-card">
      <div class="modal-header">
        <div>
          <h2 class="modal-title">Book a Swimming Class</h2>
          <p class="modal-subtitle">Reserve a specific class session</p>
        </div>
        <button class="close-btn" type="button" @click="handleClose">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <form class="modal-body" @submit.prevent="handleSubmit">
        <div class="grid">
          <div class="form-group">
            <label class="label">Full Name *</label>
            <input v-model="form.fullName" type="text" class="input" placeholder="Juan Dela Cruz" required />
          </div>

          <div class="form-group">
            <label class="label">Email *</label>
            <input v-model="form.email" type="email" class="input" placeholder="name@email.com" required />
          </div>

          <div class="form-group">
            <label class="label">Phone *</label>
            <input v-model="form.phone" type="tel" class="input" placeholder="09xx xxx xxxx" required />
          </div>

          <div class="form-group">
            <label class="label">Lesson Type *</label>
            <select v-model="form.lessonType" class="input" required>
              <option value="">Select lesson type</option>
              <option value="Group Lessons">Group Lessons</option>
              <option value="Private Lessons">Private Lessons</option>
              <option value="Kids Lessons">Kids Lessons</option>
              <option value="Advanced Training">Advanced Training</option>
            </select>
          </div>

          <div class="form-group">
            <label class="label">Skill Level</label>
            <select v-model="form.skillLevel" class="input">
              <option value="">Select skill level</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>

          <div class="form-group">
            <label class="label">Preferred Date *</label>
            <input v-model="form.preferredDate" type="date" class="input" required />
          </div>

          <div class="form-group">
            <label class="label">Preferred Time Slot *</label>
            <select v-model="form.preferredTime" class="input" required>
              <option value="">Select time slot</option>
              <option value="6:00 AM - 7:00 AM">6:00 AM - 7:00 AM</option>
              <option value="8:00 AM - 9:00 AM">8:00 AM - 9:00 AM</option>
              <option value="10:00 AM - 11:00 AM">10:00 AM - 11:00 AM</option>
              <option value="2:00 PM - 3:00 PM">2:00 PM - 3:00 PM</option>
              <option value="4:00 PM - 5:00 PM">4:00 PM - 5:00 PM</option>
            </select>
          </div>

          <div class="form-group">
            <label class="label">Number of Participants</label>
            <input v-model.number="form.participants" type="number" min="1" class="input" />
          </div>
        </div>

        <div class="form-group">
          <label class="label">Special Requests</label>
          <textarea v-model="form.notes" class="textarea" rows="3" placeholder="Any notes or preferences"></textarea>
        </div>

        <label class="checkbox">
          <input v-model="form.agree" type="checkbox" />
          <span>I agree to be contacted about my booking request.</span>
        </label>

        <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>

        <div class="modal-actions">
          <button type="button" class="btn-secondary" @click="handleClose">Cancel</button>
          <button type="submit" class="btn-primary">Submit Booking</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, watch } from 'vue'

const props = defineProps({
  preselectedType: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['close', 'submit'])

const form = reactive({
  fullName: '',
  email: '',
  phone: '',
  lessonType: '',
  skillLevel: '',
  preferredDate: '',
  preferredTime: '',
  participants: 1,
  notes: '',
  agree: false
})

const errorMessage = ref('')

watch(
  () => props.preselectedType,
  (value) => {
    if (value) {
      form.lessonType = value
    }
  },
  { immediate: true }
)

const handleClose = () => {
  emit('close')
}

const handleSubmit = () => {
  errorMessage.value = ''

  if (!form.fullName.trim()) {
    errorMessage.value = 'Full name is required.'
    return
  }

  if (!form.email.trim()) {
    errorMessage.value = 'Email is required.'
    return
  }

  if (!form.phone.trim()) {
    errorMessage.value = 'Phone number is required.'
    return
  }

  if (!form.lessonType) {
    errorMessage.value = 'Please select a lesson type.'
    return
  }

  if (!form.preferredDate) {
    errorMessage.value = 'Please choose a preferred date.'
    return
  }

  if (!form.preferredTime) {
    errorMessage.value = 'Please choose a preferred time slot.'
    return
  }

  if (!form.agree) {
    errorMessage.value = 'You must agree to be contacted.'
    return
  }

  emit('submit', { ...form })
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 1.5rem;
}

.modal-card {
  width: 100%;
  max-width: 820px;
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.2);
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 1.75rem;
  background: linear-gradient(135deg, #2b6cb0, #63b3ed);
  color: #fff;
}

.modal-title {
  font-size: 1.5rem;
  font-weight: 700;
}

.modal-subtitle {
  font-size: 0.95rem;
  opacity: 0.9;
}

.close-btn {
  background: transparent;
  border: none;
  color: #fff;
  font-size: 1.25rem;
  cursor: pointer;
}

.modal-body {
  padding: 1.75rem;
}

.grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.label {
  font-weight: 600;
  font-size: 0.9rem;
  color: #1a202c;
}

.input,
.textarea {
  width: 100%;
  padding: 0.75rem 0.9rem;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  background: #fff;
  font-size: 0.95rem;
}

.textarea {
  resize: vertical;
}

.checkbox {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  margin-top: 1rem;
  font-size: 0.9rem;
  color: #2d3748;
}

.error-message {
  margin-top: 0.75rem;
  color: #e53e3e;
  font-weight: 600;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1.5rem;
}

.btn-primary,
.btn-secondary {
  border: none;
  border-radius: 10px;
  padding: 0.75rem 1.5rem;
  font-weight: 600;
  cursor: pointer;
}

.btn-primary {
  background: #2b6cb0;
  color: #fff;
}

.btn-secondary {
  background: #e2e8f0;
  color: #1a202c;
}
</style>
