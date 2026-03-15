<template>
  <section class="profile-section">

    <!-- ── Top Action Bar ──────────────────────── -->
    <div class="top-bar">
      <div class="top-bar-title">
        <span class="top-bar-icon"><i class="fas fa-user-circle"></i></span>
        <h2 class="top-bar-heading">My Profile</h2>
      </div>
      <button class="edit-toggle-btn" :class="{ cancel: isEditing }" @click="toggleEdit">
        <i :class="isEditing ? 'fas fa-times' : 'fas fa-pen'"></i>
        {{ isEditing ? 'Cancel' : 'Edit Profile' }}
      </button>
    </div>

    <!-- ── Main Card ───────────────────────────── -->
    <div class="profile-card">
      <div class="profile-grid">

        <!-- LEFT: Avatar + identity -->
        <div class="avatar-col">

          <!-- Avatar frame -->
          <div class="avatar-frame-wrap">
            <div class="avatar-frame">
              <img v-if="previewImage" :src="previewImage" alt="Profile" class="avatar-img" />
              <span v-else class="avatar-initials">{{ initials }}</span>
            </div>

            <!-- Camera button (edit mode) -->
            <label v-if="isEditing" class="avatar-camera-btn" title="Change photo">
              <input type="file" class="hidden-input" accept="image/*" @change="handleImageChange" />
              <i class="fas fa-camera"></i>
            </label>

            <!-- Online indicator -->
            <span class="avatar-online-dot"></span>
          </div>

          <!-- Name + email -->
          <div class="avatar-identity">
            <h3 class="avatar-name">{{ displayName }}</h3>
            <p class="avatar-email">{{ form.email || 'No email' }}</p>
          </div>

          <!-- Role badge -->
          <span class="role-badge">
            <i class="fas fa-user"></i> Customer
          </span>

          <!-- Hint -->
          <p class="avatar-hint">
            <i class="fas fa-shield-alt"></i>
            Profile image is stored securely in the customer database.
          </p>
        </div>

        <!-- RIGHT: Form -->
        <div class="form-col">
          <form class="profile-form" @submit.prevent="saveProfile">

            <!-- Name row -->
            <div class="form-grid-2">
              <div class="form-group">
                <label class="form-label">First Name</label>
                <div class="input-wrap">
                  <i class="fas fa-user fi"></i>
                  <input
                    v-model="form.firstName"
                    type="text"
                    :disabled="!isEditing"
                    class="form-input"
                    :class="{ disabled: !isEditing }"
                    placeholder="Juan"
                  />
                </div>
              </div>
              <div class="form-group">
                <label class="form-label">Last Name</label>
                <div class="input-wrap">
                  <i class="fas fa-user fi"></i>
                  <input
                    v-model="form.lastName"
                    type="text"
                    :disabled="!isEditing"
                    class="form-input"
                    :class="{ disabled: !isEditing }"
                    placeholder="Dela Cruz"
                  />
                </div>
              </div>
            </div>

            <!-- Email + Phone -->
            <div class="form-grid-2">
              <div class="form-group">
                <label class="form-label">Email <span class="locked-badge"><i class="fas fa-lock"></i> Locked</span></label>
                <div class="input-wrap">
                  <i class="fas fa-envelope fi"></i>
                  <input
                    v-model="form.email"
                    type="email"
                    disabled
                    class="form-input disabled"
                    placeholder="juan@email.com"
                  />
                </div>
              </div>
              <div class="form-group">
                <label class="form-label">Phone</label>
                <div class="input-wrap">
                  <i class="fas fa-phone fi"></i>
                  <input
                    v-model="form.phone"
                    type="text"
                    :disabled="!isEditing"
                    class="form-input"
                    :class="{ disabled: !isEditing }"
                    placeholder="+63 912 345 6789"
                  />
                </div>
              </div>
            </div>

            <!-- Address -->
            <div class="form-group full">
              <label class="form-label">Street Address</label>
              <div class="input-wrap">
                <i class="fas fa-map-marker-alt fi"></i>
                <input
                  v-model="form.address"
                  type="text"
                  :disabled="!isEditing"
                  class="form-input"
                  :class="{ disabled: !isEditing }"
                  placeholder="123 Resort St."
                />
              </div>
            </div>

            <!-- City + Country + Postal -->
            <div class="form-grid-3">
              <div class="form-group">
                <label class="form-label">City</label>
                <div class="input-wrap">
                  <i class="fas fa-city fi"></i>
                  <input
                    v-model="form.city"
                    type="text"
                    :disabled="!isEditing"
                    class="form-input"
                    :class="{ disabled: !isEditing }"
                    placeholder="Calapan"
                  />
                </div>
              </div>
              <div class="form-group">
                <label class="form-label">Country</label>
                <div class="input-wrap">
                  <i class="fas fa-globe-asia fi"></i>
                  <input
                    v-model="form.country"
                    type="text"
                    :disabled="!isEditing"
                    class="form-input"
                    :class="{ disabled: !isEditing }"
                    placeholder="Philippines"
                  />
                </div>
              </div>
              <div class="form-group">
                <label class="form-label">Postal Code</label>
                <div class="input-wrap">
                  <i class="fas fa-map-pin fi"></i>
                  <input
                    v-model="form.postalCode"
                    type="text"
                    :disabled="!isEditing"
                    class="form-input"
                    :class="{ disabled: !isEditing }"
                    placeholder="5200"
                  />
                </div>
              </div>
            </div>

            <!-- Save row -->
            <div class="form-actions">
              <button
                type="submit"
                class="save-btn"
                :class="{ loading: isSaving }"
                :disabled="!isEditing || isSaving"
              >
                <span class="save-btn-text">
                  <i :class="isSaving ? 'fas fa-spinner fa-spin' : 'fas fa-save'"></i>
                  {{ isSaving ? 'Saving…' : 'Save Changes' }}
                </span>
              </button>

              <transition name="msg-fade">
                <span v-if="saveMessage" class="save-message success-msg">
                  <i class="fas fa-check-circle"></i> {{ saveMessage }}
                </span>
                <span v-else-if="saveError" class="save-message error-msg">
                  <i class="fas fa-exclamation-circle"></i> {{ saveError }}
                </span>
              </transition>
            </div>

          </form>
        </div>

      </div>
    </div>

  </section>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue'

const props = defineProps({
  profile: {
    type: Object,
    default: () => ({
      fullName: '', email: '', phone: '',
      address: '', city: '', country: '',
      postalCode: '', profileImage: '',
    }),
  },
})

const emit = defineEmits(['profile-updated'])

const apiBase    = 'http://localhost:8000/api'
const isEditing  = ref(false)
const isSaving   = ref(false)
const saveMessage = ref('')
const saveError  = ref('')
const previewImage = ref('')

const form = reactive({
  firstName: '', lastName: '', email: '', phone: '',
  address: '', city: '', country: '', postalCode: '', profileImage: '',
})

const hydrateForm = () => {
  const fullName = props.profile.fullName || ''
  const [firstName = '', ...rest] = fullName.trim().split(' ')
  form.firstName    = props.profile.firstName || firstName
  form.lastName     = props.profile.lastName  || rest.join(' ')
  form.email        = props.profile.email        || ''
  form.phone        = props.profile.phone        || ''
  form.address      = props.profile.address      || ''
  form.city         = props.profile.city         || ''
  form.country      = props.profile.country      || ''
  form.postalCode   = props.profile.postalCode   || ''
  form.profileImage = props.profile.profileImage || ''
  previewImage.value = form.profileImage
}

watch(() => props.profile, () => { if (!isEditing.value) hydrateForm() }, { immediate: true, deep: true })

const initials = computed(() => {
  const parts = (displayName.value || 'Guest').trim().split(' ').filter(Boolean)
  return parts.slice(0, 2).map(p => p[0].toUpperCase()).join('') || 'G'
})

const displayName = computed(() =>
  `${form.firstName} ${form.lastName}`.trim() || props.profile.fullName || 'Guest'
)

const toggleEdit = () => {
  if (isEditing.value) {
    isEditing.value = false
    saveError.value = ''
    saveMessage.value = ''
    hydrateForm()
    return
  }
  isEditing.value = true
  saveMessage.value = ''
}

const handleImageChange = (event) => {
  const file = event.target.files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = () => { previewImage.value = reader.result; form.profileImage = reader.result }
  reader.readAsDataURL(file)
}

const saveProfile = async () => {
  if (!form.email) { saveError.value = 'Email is required to update the profile.'; return }
  isSaving.value = true; saveError.value = ''; saveMessage.value = ''
  try {
    const res = await fetch(`${apiBase}/customers/profile/${encodeURIComponent(form.email)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firstName: form.firstName, lastName: form.lastName,
        phone: form.phone, address: form.address,
        city: form.city, country: form.country,
        postalCode: form.postalCode, profileImage: form.profileImage,
      }),
    })
    if (!res.ok) throw new Error('Failed to update profile')
    const { customer = {} } = await res.json()
    emit('profile-updated', {
      fullName:     `${customer.firstName || ''} ${customer.lastName || ''}`.trim(),
      email:        customer.email        || form.email,
      phone:        customer.phone        || form.phone,
      address:      customer.address      || form.address,
      city:         customer.city         || form.city,
      country:      customer.country      || form.country,
      postalCode:   customer.postalCode   || form.postalCode,
      profileImage: customer.profileImage || form.profileImage,
      firstName:    customer.firstName    || form.firstName,
      lastName:     customer.lastName     || form.lastName,
    })
    isEditing.value = false
    saveMessage.value = 'Profile updated successfully.'
    setTimeout(() => saveMessage.value = '', 4000)
  } catch (err) {
    saveError.value = err?.message || 'Failed to update profile.'
  } finally {
    isSaving.value = false
  }
}
</script>

<style scoped>
/* ── Design Tokens ──────────────────────────────────────────── */
:root {
  --color-primary:       #0369a1;
  --color-primary-light: #1F8DBF;
  --color-primary-dark:  #1E88B6;
  --color-gold:          #F4C400;
  --color-gold-dark:     #F2C200;
  --color-navy:          #0C3B5E;
  --color-white:         #FFFFFF;
  --color-gray-bg:       #f9fafb;
  --color-gray-border:   #e5e7eb;
  --color-text-dark:     #1f2937;
  --color-text-light:    #6b7280;
}

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

.profile-section {
  font-family: 'Segoe UI', system-ui, sans-serif;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  color: #1f2937;
}

/* ── Top Bar ────────────────────────────────────────────────── */
.top-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}

.top-bar-title {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.top-bar-icon {
  width: 32px; height: 32px;
  border-radius: 8px;
  background: #eff6ff; color: #0369a1;
  display: flex; align-items: center; justify-content: center;
  font-size: 0.88rem;
}

.top-bar-heading {
  font-size: 1rem; font-weight: 800; color: #0C3B5E;
}

/* Edit toggle button */
.edit-toggle-btn {
  display: inline-flex; align-items: center; gap: 0.45rem;
  padding: 0.5rem 1.1rem;
  background: #fff;
  border: 1.5px solid #dbeafe;
  border-radius: 50px;
  font-family: inherit; font-size: 0.8rem; font-weight: 700;
  color: #0369a1; cursor: pointer;
  transition: all 0.2s;
}

.edit-toggle-btn:hover {
  background: #eff6ff;
  border-color: #0369a1;
  transform: translateY(-1px);
}

.edit-toggle-btn.cancel {
  background: #fff; color: #ef4444;
  border-color: #fecaca;
}

.edit-toggle-btn.cancel:hover {
  background: #fef2f2; border-color: #ef4444;
}

/* ── Profile Card ───────────────────────────────────────────── */
.profile-card {
  background: #fff;
  border-radius: 14px;
  border: 1px solid #dbeafe;
  box-shadow: 0 2px 12px rgba(3,105,161,0.07);
  overflow: hidden;
}

/* ── Profile Grid ───────────────────────────────────────────── */
.profile-grid {
  display: grid;
  grid-template-columns: 260px 1fr;
  min-height: 420px;
}

@media (max-width: 900px) {
  .profile-grid { grid-template-columns: 1fr; }
}

/* ── Avatar Column ──────────────────────────────────────────── */
.avatar-col {
  background: #eff6ff;
  border-right: 1px solid #dbeafe;
  padding: 1.75rem 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.85rem;
}

@media (max-width: 900px) {
  .avatar-col {
    border-right: none;
    border-bottom: 1px solid #dbeafe;
    padding: 1.5rem;
  }
}

/* Avatar frame */
.avatar-frame-wrap {
  position: relative;
  width: 120px; height: 120px;
}

.avatar-frame {
  width: 100%; height: 100%;
  border-radius: 50%;
  background: linear-gradient(135deg, #0C3B5E, #0369a1);
  border: 3px solid #fff;
  box-shadow: 0 4px 16px rgba(3,105,161,0.2);
  overflow: hidden;
  display: flex; align-items: center; justify-content: center;
}

.avatar-img {
  width: 100%; height: 100%; object-fit: cover;
}

.avatar-initials {
  font-size: 2.2rem; font-weight: 800;
  color: #fff; line-height: 1;
  user-select: none;
}

/* Camera button */
.avatar-camera-btn {
  position: absolute;
  bottom: 4px; right: 4px;
  width: 30px; height: 30px;
  border-radius: 50%;
  background: #F4C400; color: #0C3B5E;
  display: flex; align-items: center; justify-content: center;
  font-size: 0.7rem; cursor: pointer;
  box-shadow: 0 2px 8px rgba(244,196,0,0.4);
  transition: background 0.18s, transform 0.15s;
  border: 2px solid #fff;
}

.avatar-camera-btn:hover { background: #F2C200; transform: scale(1.1); }

.hidden-input { display: none; }

/* Online dot */
.avatar-online-dot {
  position: absolute;
  top: 6px; right: 6px;
  width: 12px; height: 12px;
  border-radius: 50%;
  background: #10b981;
  border: 2px solid #eff6ff;
  box-shadow: 0 0 0 2px rgba(16,185,129,0.25);
}

/* Identity */
.avatar-identity { text-align: center; }

.avatar-name {
  font-size: 1rem; font-weight: 800; color: #0C3B5E;
  line-height: 1.2; margin-bottom: 0.2rem;
}

.avatar-email {
  font-size: 0.75rem; color: #6b7280;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  max-width: 200px;
}

/* Role badge */
.role-badge {
  display: inline-flex; align-items: center; gap: 0.4rem;
  background: #fff;
  border: 1.5px solid #dbeafe;
  color: #0369a1;
  font-size: 0.72rem; font-weight: 700;
  padding: 0.3rem 0.85rem;
  border-radius: 20px;
  letter-spacing: 0.03em;
}

/* Hint */
.avatar-hint {
  font-size: 0.7rem; color: #6b7280;
  text-align: center; line-height: 1.45;
  display: flex; align-items: flex-start; gap: 0.35rem;
  max-width: 180px;
}

.avatar-hint i { color: #0369a1; margin-top: 1px; flex-shrink: 0; }

/* ── Form Column ────────────────────────────────────────────── */
.form-col {
  padding: 1.75rem 1.5rem;
}

.profile-form { display: flex; flex-direction: column; gap: 0.9rem; }

/* Form grids */
.form-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 0.85rem; }
.form-grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 0.85rem; }

@media (max-width: 640px) {
  .form-grid-2 { grid-template-columns: 1fr; }
  .form-grid-3 { grid-template-columns: 1fr 1fr; }
}

@media (max-width: 420px) {
  .form-grid-3 { grid-template-columns: 1fr; }
}

.form-group { display: flex; flex-direction: column; gap: 0.32rem; }
.form-group.full { grid-column: 1 / -1; }

/* Label */
.form-label {
  font-size: 0.68rem; font-weight: 700;
  text-transform: uppercase; letter-spacing: 0.07em;
  color: #0C3B5E;
  display: flex; align-items: center; gap: 0.45rem;
}

.locked-badge {
  display: inline-flex; align-items: center; gap: 0.25rem;
  background: #f3f4f6; color: #9ca3af;
  font-size: 0.6rem; font-weight: 700;
  padding: 0.1rem 0.45rem; border-radius: 20px;
  text-transform: none; letter-spacing: 0;
}

/* Input */
.input-wrap { position: relative; }

.fi {
  position: absolute; left: 0.75rem; top: 50%; transform: translateY(-50%);
  color: #0369a1; font-size: 0.7rem; pointer-events: none;
}

.form-input {
  width: 100%;
  padding: 0.6rem 0.85rem 0.6rem 2.2rem;
  border: 1.5px solid #dbeafe;
  border-radius: 8px;
  font-family: inherit; font-size: 0.85rem;
  color: #1f2937; background: #f0f7ff;
  transition: border-color 0.18s, background 0.18s, box-shadow 0.18s;
  outline: none;
}

.form-input:focus {
  border-color: #0369a1;
  background: #fff;
  box-shadow: 0 0 0 3px rgba(3,105,161,0.1);
}

/* Disabled state — softer, not harsh */
.form-input.disabled {
  background: #f9fafb;
  border-color: #e5e7eb;
  color: #6b7280;
  cursor: default;
}

/* ── Form Actions ───────────────────────────────────────────── */
.form-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
  padding-top: 0.25rem;
}

/* Save button */
.save-btn {
  position: relative;
  display: inline-flex; align-items: center; justify-content: center; gap: 0.45rem;
  padding: 0.68rem 1.5rem;
  background: #F4C400; color: #0C3B5E;
  border: none; border-radius: 9px;
  font-family: inherit; font-size: 0.85rem; font-weight: 800;
  cursor: pointer;
  transition: background 0.18s, transform 0.15s, box-shadow 0.18s;
  box-shadow: 0 3px 10px rgba(244,196,0,0.3);
}

.save-btn:hover:not(:disabled) {
  background: #F2C200;
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(244,196,0,0.38);
}

.save-btn:disabled {
  background: #e5e7eb; color: #9ca3af;
  cursor: not-allowed; box-shadow: none; transform: none;
}

.save-btn.loading { pointer-events: none; opacity: 0.85; }

/* Messages */
.save-message {
  display: inline-flex; align-items: center; gap: 0.4rem;
  font-size: 0.8rem; font-weight: 600;
}

.success-msg { color: #059669; }
.error-msg   { color: #ef4444; }

/* Message fade */
.msg-fade-enter-active, .msg-fade-leave-active { transition: opacity 0.25s ease; }
.msg-fade-enter-from, .msg-fade-leave-to { opacity: 0; }
</style>