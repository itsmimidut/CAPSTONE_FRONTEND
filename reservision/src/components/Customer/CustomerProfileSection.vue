<template>
  <section class="profile-page">
    <!-- Toast Message -->
    <p v-if="message.text" :class="['toast-msg', message.type === 'error' ? 'toast-error' : 'toast-success']">
      <i :class="message.type === 'error' ? 'fas fa-exclamation-circle' : 'fas fa-check-circle'"></i>
      {{ message.text }}
    </p>

    <!-- Avatar Row - Ultra Compact -->
    <div class="avatar-row">
      <div class="profile-avatar">
        <img v-if="avatarPreview" :src="avatarPreview" alt="Profile" class="avatar-img" />
        <span v-else class="avatar-initial">{{ userInitial }}</span>
      </div>
      <div class="avatar-info">
        <div class="pa-name">{{ form.firstName }} {{ form.lastName }}</div>
        <div class="pa-sub">Customer · Eduardo's Resort</div>
        <input
          ref="fileInputRef"
          type="file"
          accept="image/png,image/jpeg,image/jpg,image/webp"
          class="hidden-input"
          @change="onImagePicked"
        />
        <button class="change-photo-btn" type="button" @click="fileInputRef?.click()" :disabled="isSaving">
          <i class="fas fa-camera"></i> Change Photo
        </button>
      </div>
    </div>

    <!-- Combined Form - Compact -->
    <div class="form-compact">
      <!-- Personal Information Section - 2 Columns -->
      <div class="form-section">
        <div class="section-title">
          <i class="fas fa-user-circle"></i>
          <span>Personal Information</span>
        </div>
        <div class="grid-2cols">
          <div class="field-group">
            <label>First Name</label>
            <input v-model="form.firstName" type="text" required placeholder="Enter first name" />
          </div>
          <div class="field-group">
            <label>Last Name</label>
            <input v-model="form.lastName" type="text" required placeholder="Enter last name" />
          </div>
          <div class="field-group">
            <label>Email Address</label>
            <input v-model="form.email" type="email" disabled />
          </div>
          <div class="field-group">
            <label>Phone Number</label>
            <input v-model="form.phone" type="tel" placeholder="Enter phone number" />
          </div>
          <div class="field-group full-width">
            <label>Street Address</label>
            <input v-model="form.address" type="text" placeholder="Enter street address" />
          </div>
          <div class="field-group">
            <label>City</label>
            <input v-model="form.city" type="text" placeholder="Enter city" />
          </div>
          <div class="field-group">
            <label>Country</label>
            <input v-model="form.country" type="text" placeholder="Enter country" />
          </div>
          <div class="field-group">
            <label>Postal Code</label>
            <input v-model="form.postalCode" type="text" placeholder="Enter postal code" />
          </div>
        </div>
      </div>

      <!-- Change Password Section - 3 Columns -->
      <div class="form-section">
        <div class="section-title">
          <i class="fas fa-lock"></i>
          <span>Change Password</span>
        </div>
        <div class="grid-3cols">
          <div class="field-group">
            <label>Current Password</label>
            <div class="input-with-eye">
              <input
                v-model="passwordForm.currentPassword"
                :type="showCurrentPassword ? 'text' : 'password'"
                placeholder="Enter current password"
              />
              <span class="eye-icon" @click="showCurrentPassword = !showCurrentPassword">
                <i :class="showCurrentPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
              </span>
            </div>
          </div>
          <div class="field-group">
            <label>New Password</label>
            <div class="input-with-eye">
              <input
                v-model="passwordForm.newPassword"
                :type="showNewPassword ? 'text' : 'password'"
                placeholder="Enter new password"
              />
              <span class="eye-icon" @click="showNewPassword = !showNewPassword">
                <i :class="showNewPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
              </span>
            </div>
          </div>
          <div class="field-group">
            <label>Confirm Password</label>
            <div class="input-with-eye">
              <input
                v-model="passwordForm.confirmPassword"
                :type="showConfirmPassword ? 'text' : 'password'"
                placeholder="Confirm new password"
              />
              <span class="eye-icon" @click="showConfirmPassword = !showConfirmPassword">
                <i :class="showConfirmPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
              </span>
            </div>
          </div>
        </div>
        
        <!-- Password Strength Indicator -->
        <div class="strength-container">
          <div class="strength-info">
            <span class="strength-label">Password Strength:</span>
            <span class="strength-badge" :class="strengthBadgeClass">{{ passwordStrengthLabel }}</span>
          </div>
          <div class="strength-bar">
            <div class="strength-fill" :style="{ width: passwordStrengthPercent + '%' }" :class="strengthClass"></div>
          </div>
          <div class="password-requirements">
            <span v-for="(rule, i) in passwordRules" :key="i" :class="{ met: rule.passed }">
              <i class="fas" :class="rule.passed ? 'fa-check-circle' : 'fa-circle'"></i>
              {{ rule.text }}
            </span>
          </div>
        </div>
      </div>

      <!-- Action Buttons - Row -->
      <div class="action-buttons">
        <button class="btn-secondary" type="button" @click="resetForm" :disabled="isSaving">
          <i class="fas fa-undo-alt"></i> Reset
        </button>
        <button class="btn-primary" @click="saveProfile" :disabled="isSaving || !form.email">
          <i class="fas fa-save"></i> {{ isSaving ? 'Saving...' : 'Save Profile' }}
        </button>
        <button class="btn-gold" @click="changePassword" :disabled="isChangingPassword || !form.email">
          <i class="fas fa-key"></i> {{ isChangingPassword ? 'Changing...' : 'Update Password' }}
        </button>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue'
import axios from 'axios'

const props = defineProps({
  profile: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['profile-updated'])

const configuredApiBase = (import.meta.env.VITE_API_URL || 'http://localhost:8000/api').replace(/\/+$/, '')
const apiBase = /\/api$/i.test(configuredApiBase)
  ? configuredApiBase
  : `${configuredApiBase}/api`
const apiRoot = apiBase.replace(/\/api\/?$/, '')
const fileInputRef = ref(null)
const pickedImageFile = ref(null)
const avatarPreview = ref('')
const isSaving = ref(false)
const isChangingPassword = ref(false)
const showCurrentPassword = ref(false)
const showNewPassword = ref(false)
const showConfirmPassword = ref(false)
const message = reactive({ text: '', type: 'success' })

const form = reactive({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  country: 'Philippines',
  postalCode: '',
  profileImage: ''
})

const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const passwordChecks = computed(() => {
  const value = String(passwordForm.newPassword || '')
  return {
    minLength: value.length >= 8,
    upper: /[A-Z]/.test(value),
    lower: /[a-z]/.test(value),
    number: /\d/.test(value),
    symbol: /[^A-Za-z0-9]/.test(value)
  }
})

const passwordStrengthScore = computed(() => {
  const checks = passwordChecks.value
  return Object.values(checks).filter(Boolean).length
})

const passwordStrengthPercent = computed(() => (passwordStrengthScore.value / 5) * 100)

const passwordStrengthLabel = computed(() => {
  const score = passwordStrengthScore.value
  if (score <= 1) return 'Very Weak'
  if (score <= 2) return 'Weak'
  if (score <= 3) return 'Fair'
  if (score <= 4) return 'Good'
  return 'Strong'
})

const strengthClass = computed(() => {
  const score = passwordStrengthScore.value
  if (score <= 1) return 'weak'
  if (score <= 3) return 'fair'
  if (score <= 4) return 'good'
  return 'strong'
})

const strengthBadgeClass = computed(() => {
  const score = passwordStrengthScore.value
  if (score <= 1) return 'strength-very-weak'
  if (score <= 2) return 'strength-weak'
  if (score <= 3) return 'strength-ok'
  if (score <= 4) return 'strength-strong'
  return 'strength-strong'
})

const passwordRules = computed(() => [
  { text: '8+ characters', passed: passwordChecks.value.minLength },
  { text: 'Uppercase', passed: passwordChecks.value.upper },
  { text: 'Lowercase', passed: passwordChecks.value.lower },
  { text: 'Number', passed: passwordChecks.value.number },
  { text: 'Symbol', passed: passwordChecks.value.symbol }
])

const resolveImageUrl = (rawPath) => {
  const path = String(rawPath || '').trim()
  if (!path) return ''
  if (/^(https?:\/\/|data:|blob:)/i.test(path)) return path
  if (path.startsWith('//')) return `https:${path}`
  if (path.startsWith('/')) return `${apiRoot}${path}`
  return `${apiRoot}/${path.replace(/^\.?\//, '')}`
}

const applyProfile = (p) => {
  const fullName = String(p?.fullName || '').trim()
  const [fullFirst, ...fullLast] = fullName.split(' ').filter(Boolean)

  form.firstName = String(p?.firstName || fullFirst || '').trim()
  form.lastName = String(p?.lastName || fullLast.join(' ') || '').trim()
  form.email = String(p?.email || '').trim()
  form.phone = String(p?.phone || '').trim()
  form.address = String(p?.address || '').trim()
  form.city = String(p?.city || '').trim()
  form.country = String(p?.country || 'Philippines').trim() || 'Philippines'
  form.postalCode = String(p?.postalCode || '').trim()
  form.profileImage = String(p?.profileImage || '').trim()

  avatarPreview.value = resolveImageUrl(form.profileImage)
  pickedImageFile.value = null
  if (fileInputRef.value) fileInputRef.value.value = ''
}

watch(
  () => props.profile,
  (nextProfile) => {
    applyProfile(nextProfile || {})
  },
  { immediate: true, deep: true }
)

const userInitial = computed(() => {
  const source = `${form.firstName} ${form.lastName}`.trim() || form.email || 'G'
  return source.charAt(0).toUpperCase()
})

const showMessage = (text, type = 'success') => {
  message.text = text
  message.type = type
  setTimeout(() => {
    if (message.text === text) message.text = ''
  }, 3500)
}

const onImagePicked = (event) => {
  const file = event.target?.files?.[0]
  if (!file) return

  pickedImageFile.value = file
  avatarPreview.value = URL.createObjectURL(file)
}

const resetForm = () => {
  applyProfile(props.profile || {})
}

const saveProfile = async () => {
  if (!form.email) {
    showMessage('Missing account email. Please log in again.', 'error')
    return
  }

  isSaving.value = true
  try {
    const payload = new FormData()
    payload.append('firstName', form.firstName)
    payload.append('lastName', form.lastName)
    payload.append('phone', form.phone)
    payload.append('address', form.address)
    payload.append('city', form.city)
    payload.append('country', form.country)
    payload.append('postalCode', form.postalCode)

    if (pickedImageFile.value) {
      payload.append('profileImage', pickedImageFile.value)
    } else {
      payload.append('profileImage', form.profileImage)
    }

    const { data } = await axios.put(
      `${apiBase}/customers/profile/${encodeURIComponent(form.email)}`,
      payload,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    )

    const updated = data?.customer || {}
    const normalized = {
      firstName: updated.firstName || form.firstName,
      lastName: updated.lastName || form.lastName,
      fullName: `${updated.firstName || form.firstName} ${updated.lastName || form.lastName}`.trim(),
      email: updated.email || form.email,
      phone: updated.phone || form.phone,
      address: updated.address || form.address,
      city: updated.city || form.city,
      country: updated.country || form.country,
      postalCode: updated.postalCode || form.postalCode,
      profileImage: updated.profileImage || form.profileImage
    }

    applyProfile(normalized)
    emit('profile-updated', normalized)
    showMessage('Profile updated successfully')
  } catch (error) {
    showMessage(error?.response?.data?.error || 'Failed to update profile', 'error')
  } finally {
    isSaving.value = false
  }
}

const changePassword = async () => {
  if (!form.email) {
    showMessage('Missing account email. Please log in again.', 'error')
    return
  }

  if (!passwordChecks.value.minLength) {
    showMessage('New password must be at least 8 characters long', 'error')
    return
  }

  if (!passwordChecks.value.upper || !passwordChecks.value.lower || !passwordChecks.value.number || !passwordChecks.value.symbol) {
    showMessage('New password must include uppercase, lowercase, number, and symbol', 'error')
    return
  }

  if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    showMessage('New password and confirmation do not match', 'error')
    return
  }

  if (passwordForm.newPassword === passwordForm.currentPassword) {
    showMessage('New password must be different from current password', 'error')
    return
  }

  isChangingPassword.value = true
  try {
    const { data } = await axios.post(`${apiBase}/customers/change-password`, {
      email: form.email,
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword
    })

    if (!data?.success) {
      throw new Error(data?.error || 'Failed to change password')
    }

    passwordForm.currentPassword = ''
    passwordForm.newPassword = ''
    passwordForm.confirmPassword = ''
    showMessage('Password changed successfully')
  } catch (error) {
    showMessage(error?.response?.data?.error || error.message || 'Failed to change password', 'error')
  } finally {
    isChangingPassword.value = false
  }
}
</script>

<style scoped>
.profile-page {
  max-width: 100%;
  padding: 0;
}

/* Toast Message */
.toast-msg {
  position: fixed;
  top: 80px;
  right: 20px;
  z-index: 1000;
  padding: 10px 18px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  animation: slideIn 0.3s ease;
}

.toast-success {
  background: #dcfce7;
  color: #166534;
  border-left: 4px solid #22c55e;
}

.toast-error {
  background: #fee2e2;
  color: #991b1b;
  border-left: 4px solid #ef4444;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* Avatar Row */
.avatar-row {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 20px 24px;
  background: linear-gradient(135deg, #f8fafc 0%, #ffffff 100%);
  border-radius: 16px;
  margin-bottom: 20px;
  border: 1px solid #e2e8f0;
}

.profile-avatar {
  width: 80px;
  height: 80px;
  border-radius: 16px;
  background: linear-gradient(135deg, #0C3B5E, #0369a1);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border: 3px solid #F4C400;
  overflow: hidden;
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-initial {
  color: white;
  font-size: 32px;
  font-weight: 800;
}

.avatar-info {
  flex: 1;
}

.pa-name {
  font-size: 20px;
  font-weight: 700;
  color: #0C3B5E;
  margin-bottom: 4px;
}

.pa-sub {
  font-size: 12px;
  color: #64748b;
  margin-bottom: 10px;
}

.change-photo-btn {
  background: transparent;
  border: 1.5px solid #cbd5e1;
  border-radius: 8px;
  padding: 6px 14px;
  font-size: 12px;
  font-weight: 600;
  color: #334155;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
}

.change-photo-btn:hover {
  border-color: #0369a1;
  color: #0369a1;
  background: rgba(3, 105, 161, 0.05);
}

/* Form Compact */
.form-compact {
  background: white;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  overflow: hidden;
}

.form-section {
  padding: 20px 24px;
  border-bottom: 1px solid #f1f5f9;
}

.form-section:last-of-type {
  border-bottom: none;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 2px solid #F4C400;
}

.section-title i {
  color: #0369a1;
  font-size: 16px;
}

.section-title span {
  font-size: 14px;
  font-weight: 700;
  color: #0C3B5E;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Grid Layouts */
.grid-2cols {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.grid-3cols {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field-group.full-width {
  grid-column: span 2;
}

.field-group label {
  font-size: 11px;
  font-weight: 700;
  color: #0C3B5E;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.field-group input {
  padding: 10px 12px;
  border: 1.5px solid #e2e8f0;
  border-radius: 8px;
  font-size: 13px;
  font-family: inherit;
  background: #f8fafc;
  transition: all 0.2s;
}

.field-group input:focus {
  outline: none;
  border-color: #0369a1;
  background: white;
  box-shadow: 0 0 0 3px rgba(3, 105, 161, 0.1);
}

.field-group input:disabled {
  background: #f1f5f9;
  color: #94a3b8;
  cursor: not-allowed;
}

.field-group input::placeholder {
  color: #94a3b8;
  font-size: 12px;
}

/* Input with eye */
.input-with-eye {
  position: relative;
}

.input-with-eye input {
  width: 100%;
  padding-right: 38px;
}

.eye-icon {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #0369a1;
  font-size: 13px;
  cursor: pointer;
  padding: 4px;
}

.eye-icon:hover {
  color: #0C3B5E;
}

/* Password Strength Container */
.strength-container {
  margin-top: 16px;
  padding: 12px 16px;
  background: #f8fafc;
  border-radius: 10px;
}

.strength-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.strength-label {
  font-size: 11px;
  font-weight: 600;
  color: #475569;
}

.strength-badge {
  font-size: 10px;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: 12px;
}

.strength-very-weak { background: #ef4444; color: white; }
.strength-weak { background: #f97316; color: white; }
.strength-ok { background: #eab308; color: white; }
.strength-strong { background: #22c55e; color: white; }

.strength-bar {
  height: 4px;
  background: #e2e8f0;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 10px;
}

.strength-fill {
  height: 100%;
  transition: width 0.3s ease;
}

.strength-fill.weak { background: #ef4444; }
.strength-fill.fair { background: #f97316; }
.strength-fill.good { background: #eab308; }
.strength-fill.strong { background: #22c55e; }

.password-requirements {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.password-requirements span {
  font-size: 10px;
  color: #64748b;
  display: flex;
  align-items: center;
  gap: 4px;
}

.password-requirements span i {
  font-size: 8px;
}

.password-requirements span.met {
  color: #22c55e;
}

.password-requirements span:not(.met) {
  color: #94a3b8;
}

/* Action Buttons */
.action-buttons {
  display: flex;
  gap: 12px;
  padding: 20px 24px;
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;
}

.btn-secondary,
.btn-primary,
.btn-gold {
  flex: 1;
  padding: 12px 20px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: none;
}

.btn-secondary {
  background: white;
  color: #475569;
  border: 1.5px solid #cbd5e1;
}

.btn-secondary:hover:not(:disabled) {
  border-color: #0369a1;
  color: #0369a1;
  background: #f0f9ff;
}

.btn-primary {
  background: #0369a1;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #0C3B5E;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(3, 105, 161, 0.3);
}

.btn-gold {
  background: #F4C400;
  color: #0C3B5E;
}

.btn-gold:hover:not(:disabled) {
  background: #e2b300;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(244, 196, 0, 0.3);
}

.btn-secondary:disabled,
.btn-primary:disabled,
.btn-gold:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.hidden-input {
  display: none;
}

/* Responsive Design */
@media (min-width: 1280px) {
  .grid-2cols {
    gap: 20px;
  }
  
  .grid-3cols {
    gap: 20px;
  }
  
  .form-section {
    padding: 24px 28px;
  }
  
  .action-buttons {
    padding: 20px 28px;
  }
}

@media (min-width: 1025px) and (max-width: 1279px) {
  .grid-2cols {
    gap: 16px;
  }
  
  .grid-3cols {
    gap: 16px;
  }
}

@media (min-width: 769px) and (max-width: 1024px) {
  .grid-2cols {
    grid-template-columns: 1fr;
    gap: 14px;
  }
  
  .field-group.full-width {
    grid-column: span 1;
  }
  
  .grid-3cols {
    grid-template-columns: 1fr;
    gap: 14px;
  }
  
  .avatar-row {
    padding: 16px 20px;
  }
  
  .profile-avatar {
    width: 70px;
    height: 70px;
  }
  
  .pa-name {
    font-size: 18px;
  }
}

@media (max-width: 768px) {
  .grid-2cols {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  
  .field-group.full-width {
    grid-column: span 1;
  }
  
  .grid-3cols {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  
  .avatar-row {
    flex-direction: column;
    text-align: center;
    padding: 16px;
    gap: 12px;
  }
  
  .avatar-info {
    text-align: center;
  }
  
  .profile-avatar {
    width: 70px;
    height: 70px;
  }
  
  .pa-name {
    font-size: 16px;
  }
  
  .form-section {
    padding: 16px;
  }
  
  .action-buttons {
    flex-direction: column;
    padding: 16px;
    gap: 10px;
  }
  
  .btn-secondary,
  .btn-primary,
  .btn-gold {
    padding: 10px 16px;
  }
  
  .password-requirements {
    gap: 8px;
  }
  
  .password-requirements span {
    font-size: 9px;
  }
}
</style>