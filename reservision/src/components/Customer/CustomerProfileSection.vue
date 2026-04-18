<template>
  <section class="profile-page">

    <p v-if="message.text" :class="['toast-msg', message.type === 'error' ? 'toast-error' : 'toast-success']">
      <i :class="message.type === 'error' ? 'fas fa-exclamation-circle' : 'fas fa-check-circle'"></i>
      {{ message.text }}
    </p>

    <!-- ═══ Avatar Card ═══ -->
    <div class="avatar-card">
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

    <!-- ═══ Personal Details ═══ -->
    <div class="form-card">
      <div class="section-head">
        <i class="fas fa-user sh-icon"></i>
        <div>
          <div class="sh-title">Profile Settings</div>
          <div class="sh-sub">Update your personal details and profile photo.</div>
        </div>
      </div>

      <form class="form-fields" @submit.prevent="saveProfile">
        <div class="field-grid">
          <div class="field-group">
            <div class="field-label">First Name</div>
            <input class="field-input" v-model="form.firstName" type="text" required />
          </div>
          <div class="field-group">
            <div class="field-label">Last Name</div>
            <input class="field-input" v-model="form.lastName" type="text" required />
          </div>
        </div>
        <div class="field-group">
          <div class="field-label">Email</div>
          <input class="field-input" v-model="form.email" type="email" disabled />
        </div>
        <div class="field-group">
          <div class="field-label">Phone</div>
          <input class="field-input" v-model="form.phone" type="tel" />
        </div>
        <div class="field-group">
          <div class="field-label">Address</div>
          <input class="field-input" v-model="form.address" type="text" />
        </div>
        <div class="field-grid">
          <div class="field-group">
            <div class="field-label">City</div>
            <input class="field-input" v-model="form.city" type="text" />
          </div>
          <div class="field-group">
            <div class="field-label">Country</div>
            <input class="field-input" v-model="form.country" type="text" />
          </div>
        </div>
        <div class="field-group">
          <div class="field-label">Postal Code</div>
          <input class="field-input postal-input" v-model="form.postalCode" type="text" />
        </div>

        <div class="form-actions">
          <button class="btn-ghost" type="button" @click="resetForm" :disabled="isSaving">Reset</button>
          <button class="btn-primary" type="submit" :disabled="isSaving || !form.email">
            <i class="fas fa-check"></i> {{ isSaving ? 'Saving...' : 'Save Profile' }}
          </button>
        </div>
      </form>
    </div>

    <!-- ═══ Security ═══ -->
    <div class="form-card">
      <div class="section-head">
        <i class="fas fa-shield-alt sh-icon"></i>
        <div>
          <div class="sh-title">Security: Change Password</div>
          <div class="sh-sub">Use your current password to set a new one.</div>
        </div>
      </div>

      <form class="form-fields" @submit.prevent="changePassword">
        <div class="field-group">
          <div class="field-label">Current Password</div>
          <div class="input-wrap">
            <input
              class="field-input has-icon"
              v-model="passwordForm.currentPassword"
              :type="showCurrentPassword ? 'text' : 'password'"
              autocomplete="current-password"
              required
            />
            <span class="input-eye" @click="showCurrentPassword = !showCurrentPassword">
              <i :class="showCurrentPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
            </span>
          </div>
        </div>
        <div class="field-group">
          <div class="field-label">New Password</div>
          <div class="input-wrap">
            <input
              class="field-input has-icon"
              v-model="passwordForm.newPassword"
              :type="showNewPassword ? 'text' : 'password'"
              autocomplete="new-password"
              required
            />
            <span class="input-eye" @click="showNewPassword = !showNewPassword">
              <i :class="showNewPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
            </span>
          </div>
        </div>
        <div class="field-group">
          <div class="field-label">Confirm New Password</div>
          <div class="input-wrap">
            <input
              class="field-input has-icon"
              v-model="passwordForm.confirmPassword"
              :type="showConfirmPassword ? 'text' : 'password'"
              autocomplete="new-password"
              required
            />
            <span class="input-eye" @click="showConfirmPassword = !showConfirmPassword">
              <i :class="showConfirmPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
            </span>
          </div>
        </div>

        <div class="strength-row">
          <span class="strength-label">Password Strength</span>
          <span class="strength-badge" :class="strengthBadgeClass">{{ passwordStrengthLabel }}</span>
        </div>

        <div class="rules-list">
          <div class="rule-item" v-for="(rule, i) in passwordRules" :key="i">
            <div class="rule-icon" :class="{ ok: rule.passed }"><i class="fas fa-check"></i></div>
            {{ rule.text }}
          </div>
        </div>

        <div class="form-actions">
          <button class="btn-ghost" type="button" @click="resetPasswordForm" :disabled="isChangingPassword">Clear</button>
          <button class="btn-primary gold" type="submit" :disabled="isChangingPassword || !form.email">
            <i class="fas fa-lock"></i> {{ isChangingPassword ? 'Changing...' : 'Change Password' }}
          </button>
        </div>
      </form>
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
  { text: 'At least 8 characters', passed: passwordChecks.value.minLength },
  { text: 'At least one uppercase letter', passed: passwordChecks.value.upper },
  { text: 'At least one lowercase letter', passed: passwordChecks.value.lower },
  { text: 'At least one number', passed: passwordChecks.value.number },
  { text: 'At least one symbol', passed: passwordChecks.value.symbol }
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
/* ── Design Tokens ── */
:root {
  --navy:        #0C3B5E;
  --primary:     #0369a1;
  --primary-mid: #1F8DBF;
  --gold:        #F4C400;
  --gold-dark:   #F2C200;
  --bg:          #EEF5FB;
  --surface:     #ffffff;
  --border:      #dbeafe;
  --border-soft: #e5e7eb;
  --text:        #1f2937;
  --text-mid:    #374151;
  --text-sub:    #6b7280;
  --text-light:  #9ca3af;
  --input-bg:    #f0f7ff;
  --shadow:      0 2px 12px rgba(3,105,161,0.09);
  --radius:      12px;
  --radius-sm:   8px;
}

.profile-page {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  max-width: 680px;
  margin: 0 auto;
  width: 100%;
}

/* ── Toast Message ── */
.toast-msg {
  border-radius: var(--radius-sm);
  padding: 10px 14px;
  font-size: 13px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  animation: fadeUp 0.3s ease both;
}
.toast-success { background: #dcfce7; color: #166534; border: 1px solid #86efac; }
.toast-error   { background: #fee2e2; color: #991b1b; border: 1px solid #fca5a5; }

/* ── Avatar Card ── */
.avatar-card {
  background: var(--surface);
  border-radius: var(--radius);
  border: 1px solid var(--border-soft);
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 14px;
  box-shadow: var(--shadow);
  animation: fadeUp 0.3s ease both;
}

.profile-avatar {
  width: 64px; height: 64px;
  border-radius: 14px;
  background: linear-gradient(135deg, #3d7a5a, #2a6080);
  display: flex; align-items: center; justify-content: center;
  font-size: 28px; flex-shrink: 0;
  border: 2px solid var(--gold);
  overflow: hidden;
}

.avatar-img { width: 100%; height: 100%; object-fit: cover; }

.avatar-initial {
  color: #fff; font-size: 26px; font-weight: 800;
}

.avatar-info { display: flex; flex-direction: column; }
.pa-name { font-size: 15px; font-weight: 700; color: var(--navy); }
.pa-sub  { font-size: 11px; color: var(--text-sub); margin-top: 2px; }

.change-photo-btn {
  margin-top: 8px;
  background: transparent;
  border: 1.5px solid var(--border-soft);
  border-radius: 6px;
  padding: 5px 12px;
  font-family: inherit;
  font-size: 11px; font-weight: 600; color: var(--text-mid);
  cursor: pointer;
  display: inline-flex; align-items: center; gap: 5px;
  transition: border-color 0.2s, color 0.2s;
  width: fit-content;
}
.change-photo-btn:hover { border-color: var(--primary); color: var(--primary); }
.change-photo-btn:disabled { opacity: 0.5; cursor: not-allowed; }

/* ── Form Card ── */
.form-card {
  background: var(--surface);
  border-radius: var(--radius);
  border: 1px solid var(--border-soft);
  box-shadow: var(--shadow);
  overflow: hidden;
  animation: fadeUp 0.35s ease both;
}
.form-card:nth-child(3) { animation-delay: 0.05s; }
.form-card:nth-child(4) { animation-delay: 0.1s; }

.section-head {
  padding: 12px 16px 10px;
  border-bottom: 2px solid var(--gold);
  background: linear-gradient(90deg, #eff6ff, #f8fafc);
  display: flex;
  align-items: center;
  gap: 8px;
}
.sh-icon { color: var(--primary); font-size: 13px; flex-shrink: 0; }
.sh-title { font-size: 13px; font-weight: 700; color: var(--navy); }
.sh-sub { font-size: 10px; color: var(--text-sub); margin-top: 1px; }

/* ── Form Fields ── */
.form-fields {
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.field-label {
  font-size: 9px; font-weight: 700;
  letter-spacing: 0.09em;
  text-transform: uppercase;
  color: var(--navy);
}

.field-input {
  width: 100%;
  padding: 10px 12px;
  border: 1.5px solid var(--border);
  border-radius: var(--radius-sm);
  font-family: inherit;
  font-size: 13px; color: var(--text);
  background: var(--input-bg);
  outline: none;
  transition: border-color 0.15s, box-shadow 0.15s, background 0.15s;
}
.field-input:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(3,105,161,0.1);
  background: white;
}
.field-input:disabled {
  background: #f3f4f6; color: var(--text-sub); cursor: not-allowed;
}
.field-input.has-icon { padding-right: 36px; }

.postal-input { max-width: 140px; }

.field-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

/* ── Password Eye Toggle ── */
.input-wrap { position: relative; }
.input-eye {
  position: absolute; right: 10px; top: 50%; transform: translateY(-50%);
  color: var(--primary); font-size: 13px; cursor: pointer;
}

/* ── Password Strength ── */
.strength-row {
  display: flex; align-items: center; justify-content: space-between;
  padding: 8px 12px;
  background: #f9fafb; border: 1px solid var(--border-soft);
  border-radius: var(--radius-sm);
}
.strength-label { font-size: 11px; color: var(--text-sub); font-weight: 500; }
.strength-badge {
  font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 10px;
}
.strength-very-weak { background: #ef4444; color: white; }
.strength-weak      { background: #f97316; color: white; }
.strength-ok        { background: #eab308; color: white; }
.strength-strong    { background: #22c55e; color: white; }

.rules-list {
  display: flex; flex-direction: column; gap: 5px;
  padding: 10px 12px;
  background: #f9fafb;
  border: 1px solid var(--border-soft);
  border-radius: var(--radius-sm);
}
.rule-item {
  display: flex; align-items: center; gap: 7px;
  font-size: 11px; color: var(--text-sub);
}
.rule-icon {
  width: 14px; height: 14px; border-radius: 50%;
  background: var(--border-soft);
  display: flex; align-items: center; justify-content: center;
  font-size: 7px; color: var(--text-light); flex-shrink: 0;
}
.rule-icon.ok { background: #dcfce7; color: #16a34a; }

/* ── Action Buttons ── */
.form-actions {
  display: flex;
  gap: 8px;
  padding-top: 4px;
}

.btn-ghost {
  flex: 1; padding: 11px;
  background: transparent;
  border: 1.5px solid var(--border-soft);
  border-radius: var(--radius-sm);
  font-family: inherit; font-size: 13px; font-weight: 600;
  color: var(--text-sub); cursor: pointer;
  transition: border-color 0.2s, color 0.2s;
}
.btn-ghost:hover:not(:disabled) { border-color: var(--primary); color: var(--primary); }
.btn-ghost:disabled { opacity: 0.5; cursor: not-allowed; }

.btn-primary {
  flex: 2; padding: 11px;
  background: var(--primary); color: white;
  border: none; border-radius: var(--radius-sm);
  font-family: inherit; font-size: 13px; font-weight: 700;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center; gap: 6px;
  transition: background 0.2s, transform 0.1s;
}
.btn-primary:hover:not(:disabled) { background: var(--navy); }
.btn-primary:active:not(:disabled) { transform: scale(0.98); }
.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }

.btn-primary.gold { background: var(--gold); color: var(--navy); }
.btn-primary.gold:hover:not(:disabled) { background: var(--gold-dark); }

/* ── Utilities ── */
.hidden-input { display: none; }

@keyframes fadeUp {
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* ── Responsive ── */
@media (max-width: 480px) {
  .profile-page { padding: 12px; gap: 10px; }
  .field-grid   { grid-template-columns: 1fr; }
  .avatar-card  { flex-direction: column; align-items: flex-start; }
  .postal-input { max-width: 100%; }
}
</style>
