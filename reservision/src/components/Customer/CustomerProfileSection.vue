<template>
  <section>
    <h2 class="text-3xl font-semibold text-gray-800 mb-2">Profile</h2>
    <p class="text-gray-500 mb-6">Manage your account details.</p>

    <div class="bg-white p-6 rounded-xl shadow-sm border w-full max-w-lg">
      <form class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
          <input
            type="text"
            :value="profile.fullName"
            class="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-600"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            type="email"
            :value="profile.email"
            class="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-600"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Phone</label>
          <input
            type="text"
            :value="profile.phone"
            class="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-600"
          />
        </div>
        <button type="submit" class="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg">
          Save Changes
        </button>
      </form>
    </div>
  </section>
</template>

<script setup>
defineProps({
  profile: {
    type: Object,
    default: () => ({
      fullName: '',
      email: '',
      phone: '',
    }),
  },
});
</script>
