<template>
  <section>
    <h2 class="text-3xl font-semibold text-gray-800 mb-2">Support</h2>
    <p class="text-gray-500 mb-6">Need help? Send us a message.</p>

    <div class="bg-white p-6 rounded-xl shadow-sm border w-full max-w-xl">
      <form class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Subject</label>
          <input
            type="text"
            placeholder="Enter subject"
            class="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-600"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Message</label>
          <textarea
            rows="4"
            placeholder="Describe your issue..."
            class="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-600"
          ></textarea>
        </div>
        <button type="submit" class="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg">
          Send Message
        </button>
      </form>
    </div>
  </section>
</template>
