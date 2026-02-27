<template>
  <section>
    <div class="flex flex-wrap items-center justify-end gap-4 mb-3">
      <button
        type="button"
        class="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-50 transition"
        @click="toggleEdit"
      >
        <i class="fas fa-pen"></i>
        {{ isEditing ? 'Cancel' : 'Edit Profile' }}
      </button>
    </div>

    <div class="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-blue-100 w-full">
      <div class="grid gap-6 lg:grid-cols-5">
        <div class="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 via-white to-white p-5 sm:p-6 lg:col-span-2">
          <div class="flex flex-col items-center gap-4">
            <div class="relative w-full flex items-center justify-center">
              <div class="w-3/4 aspect-square rounded-2xl border border-blue-100 overflow-hidden bg-blue-50 flex items-center justify-center">
                <img v-if="previewImage" :src="previewImage" alt="Profile" class="w-full h-full object-cover" />
                <span v-else class="text-3xl font-semibold text-blue-600">{{ initials }}</span>
              </div>
              <label v-if="isEditing" class="absolute bottom-2 right-6 bg-blue-600 text-white rounded-full p-2.5 cursor-pointer shadow">
                <input type="file" class="hidden" accept="image/*" @change="handleImageChange" />
                <i class="fas fa-camera text-xs"></i>
              </label>
            </div>
            <div class="text-center">
              <h3 class="text-xl font-semibold text-gray-900">{{ displayName }}</h3>
              <p class="text-sm text-gray-500">{{ form.email || 'No email' }}</p>
            </div>
            <div class="bg-blue-50 text-blue-700 text-xs font-semibold px-4 py-1.5 rounded-full">Customer</div>
            <p class="text-xs text-gray-400 text-center">Your profile image is stored in the customer database.</p>
          </div>
        </div>

        <div class="lg:col-span-3">
          <form class="grid gap-3 sm:gap-4 sm:grid-cols-2" @submit.prevent="saveProfile">
            <div>
              <label class="block text-xs uppercase tracking-wide text-gray-500 mb-2">First Name</label>
              <input
                v-model="form.firstName"
                type="text"
                :disabled="!isEditing"
                class="w-full rounded-lg border px-4 py-2 text-gray-800 bg-white disabled:bg-gray-50"
              />
            </div>
            <div>
              <label class="block text-xs uppercase tracking-wide text-gray-500 mb-2">Last Name</label>
              <input
                v-model="form.lastName"
                type="text"
                :disabled="!isEditing"
                class="w-full rounded-lg border px-4 py-2 text-gray-800 bg-white disabled:bg-gray-50"
              />
            </div>
            <div>
              <label class="block text-xs uppercase tracking-wide text-gray-500 mb-2">Email</label>
              <input
                v-model="form.email"
                type="email"
                disabled
                class="w-full rounded-lg border px-4 py-2 text-gray-500 bg-gray-50"
              />
            </div>
            <div>
              <label class="block text-xs uppercase tracking-wide text-gray-500 mb-2">Phone</label>
              <input
                v-model="form.phone"
                type="text"
                :disabled="!isEditing"
                class="w-full rounded-lg border px-4 py-2 text-gray-800 bg-white disabled:bg-gray-50"
              />
            </div>
            <div class="sm:col-span-2">
              <label class="block text-xs uppercase tracking-wide text-gray-500 mb-2">Address</label>
              <input
                v-model="form.address"
                type="text"
                :disabled="!isEditing"
                class="w-full rounded-lg border px-4 py-2 text-gray-800 bg-white disabled:bg-gray-50"
              />
            </div>
            <div>
              <label class="block text-xs uppercase tracking-wide text-gray-500 mb-2">City</label>
              <input
                v-model="form.city"
                type="text"
                :disabled="!isEditing"
                class="w-full rounded-lg border px-4 py-2 text-gray-800 bg-white disabled:bg-gray-50"
              />
            </div>
            <div>
              <label class="block text-xs uppercase tracking-wide text-gray-500 mb-2">Country</label>
              <input
                v-model="form.country"
                type="text"
                :disabled="!isEditing"
                class="w-full rounded-lg border px-4 py-2 text-gray-800 bg-white disabled:bg-gray-50"
              />
            </div>
            <div>
              <label class="block text-xs uppercase tracking-wide text-gray-500 mb-2">Postal Code</label>
              <input
                v-model="form.postalCode"
                type="text"
                :disabled="!isEditing"
                class="w-full rounded-lg border px-4 py-2 text-gray-800 bg-white disabled:bg-gray-50"
              />
            </div>
            <div class="sm:col-span-2 flex flex-wrap items-center gap-3 pt-1">
              <button
                type="submit"
                :disabled="!isEditing || isSaving"
                class="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
              >
                <i class="fas fa-save"></i>
                {{ isSaving ? 'Saving...' : 'Save Changes' }}
              </button>
              <span v-if="saveMessage" class="text-sm text-green-600">{{ saveMessage }}</span>
              <span v-if="saveError" class="text-sm text-red-600">{{ saveError }}</span>
            </div>
          </form>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue';

const props = defineProps({
  profile: {
    type: Object,
    default: () => ({
      fullName: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      country: '',
      postalCode: '',
      profileImage: '',
    }),
  },
});

const emit = defineEmits(['profile-updated']);

const apiBase = 'http://localhost:8000/api';
const isEditing = ref(false);
const isSaving = ref(false);
const saveMessage = ref('');
const saveError = ref('');
const previewImage = ref('');

const form = reactive({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  country: '',
  postalCode: '',
  profileImage: '',
});

const hydrateForm = () => {
  const fullName = props.profile.fullName || '';
  const [firstName = '', ...rest] = fullName.trim().split(' ');
  form.firstName = props.profile.firstName || firstName;
  form.lastName = props.profile.lastName || rest.join(' ');
  form.email = props.profile.email || '';
  form.phone = props.profile.phone || '';
  form.address = props.profile.address || '';
  form.city = props.profile.city || '';
  form.country = props.profile.country || '';
  form.postalCode = props.profile.postalCode || '';
  form.profileImage = props.profile.profileImage || '';
  previewImage.value = form.profileImage;
};

watch(() => props.profile, () => {
  if (!isEditing.value) {
    hydrateForm();
  }
}, { immediate: true, deep: true });

const initials = computed(() => {
  const name = displayName.value || 'Guest';
  const parts = name.trim().split(' ').filter(Boolean);
  return parts.slice(0, 2).map(part => part[0].toUpperCase()).join('') || 'G';
});

const displayName = computed(() => {
  const full = `${form.firstName} ${form.lastName}`.trim();
  return full || props.profile.fullName || 'Guest';
});

const toggleEdit = () => {
  if (isEditing.value) {
    isEditing.value = false;
    saveError.value = '';
    saveMessage.value = '';
    hydrateForm();
    return;
  }
  isEditing.value = true;
  saveMessage.value = '';
};

const handleImageChange = async (event) => {
  const file = event.target.files?.[0];
  if (!file) {
    return;
  }
  const reader = new FileReader();
  reader.onload = () => {
    previewImage.value = reader.result;
    form.profileImage = reader.result;
  };
  reader.readAsDataURL(file);
};

const saveProfile = async () => {
  if (!form.email) {
    saveError.value = 'Email is required to update the profile.';
    return;
  }
  isSaving.value = true;
  saveError.value = '';
  saveMessage.value = '';
  try {
    const response = await fetch(`${apiBase}/customers/profile/${encodeURIComponent(form.email)}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        firstName: form.firstName,
        lastName: form.lastName,
        phone: form.phone,
        address: form.address,
        city: form.city,
        country: form.country,
        postalCode: form.postalCode,
        profileImage: form.profileImage,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to update profile');
    }

    const payload = await response.json();
    const customer = payload.customer || {};
    emit('profile-updated', {
      fullName: `${customer.firstName || ''} ${customer.lastName || ''}`.trim(),
      email: customer.email || form.email,
      phone: customer.phone || form.phone,
      address: customer.address || form.address,
      city: customer.city || form.city,
      country: customer.country || form.country,
      postalCode: customer.postalCode || form.postalCode,
      profileImage: customer.profileImage || form.profileImage,
      firstName: customer.firstName || form.firstName,
      lastName: customer.lastName || form.lastName,
    });

    isEditing.value = false;
    saveMessage.value = 'Profile updated successfully.';
  } catch (error) {
    saveError.value = error?.message || 'Failed to update profile.';
  } finally {
    isSaving.value = false;
  }
};
</script>