<template>
  <section>
    <div class="flex flex-wrap items-center justify-between gap-4 mb-6">
      <div>
        <h2 class="text-3xl font-semibold text-gray-900">Service Requests</h2>
        <p class="text-gray-500 mt-1">Submit a request and track its status in real time.</p>
      </div>
      <div class="flex items-center gap-2 text-xs font-semibold text-blue-700 bg-blue-50 px-3 py-1 rounded-full">
        <span class="h-2 w-2 rounded-full bg-blue-500"></span>
        Automated coordination
      </div>
    </div>

    <div class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div class="bg-white p-6 rounded-2xl shadow-sm border border-blue-100">
        <form class="grid gap-4 sm:grid-cols-2" @submit.prevent="submitRequest">
          <div>
            <label class="block text-xs uppercase tracking-wide text-gray-500 mb-2">Category</label>
            <select v-model="form.category" class="w-full rounded-lg border px-4 py-2 text-gray-800 bg-white">
              <option value="">Select a category</option>
              <option value="Room Service">Room Service</option>
              <option value="Housekeeping">Housekeeping</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Amenities">Amenities</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label class="block text-xs uppercase tracking-wide text-gray-500 mb-2">Priority</label>
            <select v-model="form.priority" class="w-full rounded-lg border px-4 py-2 text-gray-800 bg-white">
              <option value="Normal">Normal</option>
              <option value="High">High</option>
              <option value="Urgent">Urgent</option>
            </select>
          </div>
          <div>
            <label class="block text-xs uppercase tracking-wide text-gray-500 mb-2">Room Number</label>
            <input
              v-model="form.roomNumber"
              type="text"
              placeholder="Optional"
              class="w-full rounded-lg border px-4 py-2 text-gray-800 bg-white"
            />
          </div>
          <div class="sm:col-span-2">
            <label class="block text-xs uppercase tracking-wide text-gray-500 mb-2">Subject</label>
            <input
              v-model="form.subject"
              type="text"
              placeholder="Short summary of your request"
              class="w-full rounded-lg border px-4 py-2 text-gray-800 bg-white"
            />
          </div>
          <div class="sm:col-span-2">
            <label class="block text-xs uppercase tracking-wide text-gray-500 mb-2">Details</label>
            <textarea
              v-model="form.message"
              rows="4"
              placeholder="Describe the request so we can assist quickly"
              class="w-full rounded-lg border px-4 py-2 text-gray-800 bg-white"
            ></textarea>
          </div>
          <div class="sm:col-span-2 flex flex-wrap items-center gap-3">
            <button
              type="submit"
              :disabled="isSubmitting"
              class="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
            >
              <i class="fas fa-paper-plane"></i>
              {{ isSubmitting ? 'Submitting...' : 'Submit Request' }}
            </button>
            <span v-if="submitMessage" class="text-sm text-green-600">{{ submitMessage }}</span>
            <span v-if="submitError" class="text-sm text-red-600">{{ submitError }}</span>
          </div>
        </form>
      </div>

      <div class="bg-white p-6 rounded-2xl shadow-sm border border-blue-100">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-gray-900">My Requests</h3>
          <span class="text-xs text-gray-500">{{ requests.length }} total</span>
        </div>
        <div class="space-y-4">
          <div v-if="requests.length === 0" class="text-sm text-gray-400 text-center py-6">
            No requests yet.
          </div>
          <div v-for="item in requests" :key="item.request_id" class="rounded-xl border border-gray-100 p-4">
            <div class="flex items-start justify-between gap-3">
              <div>
                <p class="text-sm font-semibold text-gray-900">{{ item.subject }}</p>
                <p class="text-xs text-gray-500 mt-1">{{ item.category }} · Priority {{ item.priority }}</p>
              </div>
              <span :class="['text-xs font-semibold px-2 py-1 rounded-full', statusBadge(item.status)]">
                {{ item.status }}
              </span>
            </div>
            <p class="text-xs text-gray-500 mt-3">{{ formatDate(item.created_at) }}</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, reactive, ref } from 'vue';
import { useAuthStore } from '../../stores/auth';

const apiBase = 'http://localhost:8000/api';
const auth = useAuthStore();

const form = reactive({
  category: '',
  priority: 'Normal',
  roomNumber: '',
  subject: '',
  message: '',
});

const requests = ref([]);
const isSubmitting = ref(false);
const submitMessage = ref('');
const submitError = ref('');

const customerEmail = computed(() => auth.user?.email || '');
const customerName = computed(() => auth.user?.name || 'Guest');

const formatDate = (value) => {
  if (!value) {
    return '';
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};

const statusBadge = (status) => {
  const normalized = String(status || '').toLowerCase();
  if (normalized.includes('open')) {
    return 'bg-blue-50 text-blue-700';
  }
  if (normalized.includes('progress')) {
    return 'bg-yellow-50 text-yellow-700';
  }
  if (normalized.includes('resolved')) {
    return 'bg-green-50 text-green-700';
  }
  return 'bg-gray-100 text-gray-600';
};

const loadRequests = async () => {
  if (!customerEmail.value) {
    return;
  }
  const response = await fetch(`${apiBase}/service-requests?email=${encodeURIComponent(customerEmail.value)}`);
  if (!response.ok) {
    return;
  }
  const payload = await response.json();
  requests.value = payload.data || [];
};

const submitRequest = async () => {
  submitMessage.value = '';
  submitError.value = '';
  if (!form.category || !form.subject || !form.message) {
    submitError.value = 'Please fill out category, subject, and details.';
    return;
  }

  if (!customerEmail.value) {
    submitError.value = 'Please log in to submit a request.';
    return;
  }

  isSubmitting.value = true;
  try {
    const response = await fetch(`${apiBase}/service-requests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        customerName: customerName.value,
        customerEmail: customerEmail.value,
        roomNumber: form.roomNumber,
        category: form.category,
        priority: form.priority,
        subject: form.subject,
        message: form.message,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to submit request');
    }

    submitMessage.value = 'Request submitted successfully.';
    form.category = '';
    form.priority = 'Normal';
    form.roomNumber = '';
    form.subject = '';
    form.message = '';
    await loadRequests();
  } catch (error) {
    submitError.value = error?.message || 'Failed to submit request.';
  } finally {
    isSubmitting.value = false;
  }
};

loadRequests();
</script>
