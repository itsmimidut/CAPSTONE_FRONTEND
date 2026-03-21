<template>
  <section class="profile-wrap">
    <div class="profile-card">
      <div class="profile-head">
        <div class="avatar-wrap">
          <img
            v-if="avatarPreview"
            :src="avatarPreview"
            alt="Profile"
            class="avatar-img"
          />
          <span v-else class="avatar-initial">{{ userInitial }}</span>
        </div>

        <div class="head-main">
          <h2 class="head-title">Profile Settings</h2>
          <p class="head-sub">Update your personal details and profile photo.</p>
        </div>

        <div class="head-actions">
          <input
            ref="fileInputRef"
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/webp"
            class="hidden-input"
            @change="onImagePicked"
          />
          <button class="btn btn-ghost" type="button" @click="fileInputRef?.click()" :disabled="isSaving">
            Change Photo
          </button>
        </div>
      </div>

      <p v-if="message.text" :class="['message', message.type === 'error' ? 'message-error' : 'message-success']">
        {{ message.text }}
      </p>

      <form class="profile-form" @submit.prevent="saveProfile">
        <div class="grid two-col">
          <label class="field">
            <span>First Name</span>
            <input v-model="form.firstName" type="text" required />
          </label>

          <label class="field">
            <span>Last Name</span>
            <input v-model="form.lastName" type="text" required />
          </label>

          <label class="field">
            <span>Email</span>
            <input v-model="form.email" type="email" disabled />
          </label>

          <label class="field">
            <span>Phone</span>
            <input v-model="form.phone" type="text" />
          </label>

          <label class="field two-col-span">
            <span>Address</span>
            <input v-model="form.address" type="text" />
          </label>

          <label class="field">
            <span>City</span>
            <input v-model="form.city" type="text" />
          </label>

          <label class="field">
            <span>Country</span>
            <input v-model="form.country" type="text" />
          </label>

          <label class="field">
            <span>Postal Code</span>
            <input v-model="form.postalCode" type="text" />
          </label>
        </div>

        <div class="form-actions">
          <button class="btn btn-ghost" type="button" @click="resetForm" :disabled="isSaving">
            Reset
          </button>
          <button class="btn btn-primary" type="submit" :disabled="isSaving || !form.email">
            {{ isSaving ? 'Saving...' : 'Save Profile' }}
          </button>
        </div>
      </form>

      <div class="password-box">
        <h3 class="password-title">Security: Change Password</h3>
        <p class="password-sub">Use your current password to set a new one.</p>

        <form class="password-form" @submit.prevent="changePassword">
          <div class="grid two-col">
            <label class="field">
              <span>Current Password</span>
              <div class="password-input-wrap">
                <input
                  v-model="passwordForm.currentPassword"
                  :type="showCurrentPassword ? 'text' : 'password'"
                  autocomplete="current-password"
                  required
                />
                <button
                  class="password-toggle"
                  type="button"
                  @click="showCurrentPassword = !showCurrentPassword"
                >
                  <i :class="showCurrentPassword ? 'fa fa-eye-slash' : 'fa fa-eye'"></i>
                </button>
              </div>
            </label>

            <label class="field">
              <span>New Password</span>
              <div class="password-input-wrap">
                <input
                  v-model="passwordForm.newPassword"
                  :type="showNewPassword ? 'text' : 'password'"
                  autocomplete="new-password"
                  required
                />
                <button
                  class="password-toggle"
                  type="button"
                  @click="showNewPassword = !showNewPassword"
                >
                  <i :class="showNewPassword ? 'fa fa-eye-slash' : 'fa fa-eye'"></i>
                </button>
              </div>
            </label>

            <label class="field two-col-span">
              <span>Confirm New Password</span>
              <div class="password-input-wrap">
                <input
                  v-model="passwordForm.confirmPassword"
                  :type="showConfirmPassword ? 'text' : 'password'"
                  autocomplete="new-password"
                  required
                />
                <button
                  class="password-toggle"
                  type="button"
                  @click="showConfirmPassword = !showConfirmPassword"
                >
                  <i :class="showConfirmPassword ? 'fa fa-eye-slash' : 'fa fa-eye'"></i>
                </button>
              </div>
            </label>
          </div>

          <div class="strength-box">
            <div class="strength-row">
              <span>Password Strength</span>
              <strong :class="strengthClass">{{ passwordStrengthLabel }}</strong>
            </div>
            <div class="strength-bar">
              <div class="strength-fill" :class="strengthClass" :style="{ width: `${passwordStrengthPercent}%` }"></div>
            </div>
            <ul class="strength-checklist">
              <li :class="{ ok: passwordChecks.minLength }">At least 8 characters</li>
              <li :class="{ ok: passwordChecks.upper }">At least one uppercase letter</li>
              <li :class="{ ok: passwordChecks.lower }">At least one lowercase letter</li>
              <li :class="{ ok: passwordChecks.number }">At least one number</li>
              <li :class="{ ok: passwordChecks.symbol }">At least one symbol</li>
            </ul>
          </div>

          <div class="form-actions">
            <button class="btn btn-ghost" type="button" @click="resetPasswordForm" :disabled="isChangingPassword">
              Clear
            </button>
            <button class="btn btn-primary" type="submit" :disabled="isChangingPassword || !form.email">
              {{ isChangingPassword ? 'Changing...' : 'Change Password' }}
            </button>
          </div>
        </form>
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

const resetPasswordForm = () => {
  passwordForm.currentPassword = ''
  passwordForm.newPassword = ''
  passwordForm.confirmPassword = ''
  showCurrentPassword.value = false
  showNewPassword.value = false
  showConfirmPassword.value = false
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

    resetPasswordForm()
    showMessage('Password changed successfully')
  } catch (error) {
    const status = error?.response?.status
    if (status === 404) {
      showMessage('Password endpoint not found. Please restart backend server to load latest routes.', 'error')
    } else {
      showMessage(error?.response?.data?.error || error.message || 'Failed to change password', 'error')
    }
  } finally {
    isChangingPassword.value = false
  }
}
</script>

<style scoped>
.profile-wrap {
  width: 100%;
  display: flex;
  justify-content: center;
}

.profile-card {
  width: 100%;
  max-width: 980px;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  box-shadow: 0 8px 26px rgba(12, 59, 94, 0.08);
  padding: 1rem;
  display: grid;
  gap: 0.9rem;
}

.profile-head {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 0.8rem;
  border-bottom: 1px solid #e5e7eb;
  padding-bottom: 0.8rem;
}

.avatar-wrap {
  width: 62px;
  height: 62px;
  border-radius: 14px;
  overflow: hidden;
  background: #0c3b5e;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-initial {
  font-size: 1.2rem;
  font-weight: 800;
}

.head-title {
  margin: 0;
  color: #0c3b5e;
  font-size: 1.1rem;
  font-weight: 800;
}

.head-sub {
  margin: 0.25rem 0 0;
  color: #6b7280;
  font-size: 0.82rem;
}

.profile-form {
  display: grid;
  gap: 0.75rem;
}

.grid {
  display: grid;
  gap: 0.65rem;
}

.two-col {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.two-col-span {
  grid-column: 1 / -1;
}

.field {
  display: grid;
  gap: 0.35rem;
}

.field span {
  color: #6b7280;
  font-size: 0.74rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.field input {
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  font-size: 0.9rem;
  padding: 0.55rem 0.7rem;
  color: #1f2937;
}

.field input:disabled {
  background: #f3f4f6;
  color: #6b7280;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}

.password-box {
  border-top: 1px solid #e5e7eb;
  padding-top: 0.9rem;
  display: grid;
  gap: 0.65rem;
}

.password-title {
  margin: 0;
  color: #0c3b5e;
  font-size: 1rem;
  font-weight: 800;
}

.password-sub {
  margin: 0;
  color: #6b7280;
  font-size: 0.82rem;
}

.password-form {
  display: grid;
  gap: 0.65rem;
}

.password-input-wrap {
  position: relative;
}

.password-input-wrap input {
  width: 100%;
  padding-right: 4.2rem;
}

.password-toggle {
  position: absolute;
  top: 50%;
  right: 0.4rem;
  transform: translateY(-50%);
  border: none;
  background: transparent;
  color: #0369a1;
  font-size: 0.75rem;
  font-weight: 700;
  cursor: pointer;
}

.strength-box {
  border: 1px dashed #cbd5e1;
  border-radius: 10px;
  background: #f8fafc;
  padding: 0.6rem 0.7rem;
  display: grid;
  gap: 0.45rem;
}

.strength-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.78rem;
  color: #475569;
}

.strength-bar {
  height: 8px;
  border-radius: 999px;
  background: #e2e8f0;
  overflow: hidden;
}

.strength-fill {
  height: 100%;
  transition: width 0.2s ease;
}

.strength-fill.weak,
.strength-row strong.weak { color: #b91c1c; background-color: #ef4444; }
.strength-fill.fair,
.strength-row strong.fair { color: #b45309; background-color: #f59e0b; }
.strength-fill.good,
.strength-row strong.good { color: #0369a1; background-color: #0ea5e9; }
.strength-fill.strong,
.strength-row strong.strong { color: #166534; background-color: #22c55e; }

.strength-row strong {
  background: none;
  font-size: 0.78rem;
}

.strength-checklist {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 0.2rem;
  font-size: 0.74rem;
  color: #64748b;
}

.strength-checklist li.ok {
  color: #166534;
  font-weight: 600;
}

.btn {
  border: none;
  border-radius: 10px;
  font-size: 0.82rem;
  font-weight: 700;
  padding: 0.5rem 0.9rem;
  cursor: pointer;
}

.btn:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.btn-ghost {
  background: #f3f4f6;
  color: #1f2937;
}

.btn-ghost:hover:not(:disabled) {
  background: #e5e7eb;
}

.btn-primary {
  background: #0369a1;
  color: #ffffff;
}

.btn-primary:hover:not(:disabled) {
  background: #1f8dbf;
}

.message {
  margin: 0;
  border-radius: 10px;
  padding: 0.55rem 0.75rem;
  font-size: 0.84rem;
  font-weight: 700;
}

.message-success {
  background: #dcfce7;
  color: #166534;
  border: 1px solid #86efac;
}

.message-error {
  background: #fee2e2;
  color: #991b1b;
  border: 1px solid #fca5a5;
}

.hidden-input {
  display: none;
}

@media (max-width: 768px) {
  .two-col {
    grid-template-columns: 1fr;
  }

  .profile-head {
    grid-template-columns: 1fr;
    align-items: start;
  }

  .head-actions {
    justify-self: start;
  }
}
</style>
