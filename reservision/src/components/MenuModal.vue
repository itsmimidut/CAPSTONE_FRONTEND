<template>
  <!-- Overlay -->
  <div 
    v-show="isOpen"
    @click="close"
    class="fixed inset-0 bg-black/60 z-[70] transition-opacity duration-300"
    :class="isOpen ? 'opacity-100' : 'opacity-0'"
  ></div>

  <!-- Modal -->
  <div 
    v-show="isOpen"
    class="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-[900px] max-h-[90vh] bg-white rounded-[20px] shadow-[0_20px_50px_rgba(0,0,0,0.2)] overflow-hidden z-[80] flex flex-col transition-all duration-400"
    :class="isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95'"
  >
    <!-- Header -->
    <div class="bg-gradient-to-r from-primary-blue to-accent-blue text-white p-6 flex justify-between items-center">
      <h3 class="text-xl font-bold">Full Dining Menu</h3>
      <button @click="close" class="text-white hover:text-gray-200">
        <i class="fas fa-times text-xl"></i>
      </button>
    </div>

    <!-- Search -->
    <div class="sticky top-0 z-10 bg-white p-4 border-b border-gray-200">
      <div class="relative">
        <i class="fas fa-search absolute left-6 top-1/2 -translate-y-1/2 text-gray-400"></i>
        <input 
          v-model="searchQuery"
          type="text" 
          placeholder="Search menu items..."
          class="w-full py-3 pl-12 pr-12 border border-gray-300 rounded-full text-sm outline-none transition-all focus:border-primary-blue focus:ring-4 focus:ring-blue-100"
        />
        <button 
          v-show="searchQuery"
          @click="searchQuery = ''"
          class="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer"
        >
          <i class="fas fa-times"></i>
        </button>
      </div>
    </div>

    <!-- Tabs -->
    <div class="flex overflow-x-auto bg-gray-50 border-b border-gray-200 scrollbar-hide">
      <div 
        v-for="tab in tabs" 
        :key="tab.id"
        @click="activeTab = tab.id"
        class="px-6 py-4 font-semibold cursor-pointer whitespace-nowrap transition-all"
        :class="activeTab === tab.id 
          ? 'text-primary-blue border-b-3 border-warm-brown' 
          : 'text-gray-500 hover:text-primary-blue'"
      >
        {{ tab.name }}
      </div>
    </div>

    <!-- Content -->
    <div class="flex-1 overflow-y-auto">
      <div v-if="loading" class="text-center py-12 text-gray-500">
        <i class="fas fa-spinner fa-spin text-3xl mb-4 block"></i>
        <p>Loading menu items...</p>
      </div>
      <div v-else-if="displayItems.length > 0">
        <div 
          v-for="item in displayItems" 
          :key="item.name"
          class="flex justify-between p-6 border-b border-dashed border-gray-200 last:border-b-0"
        >
          <div>
            <h4 class="font-semibold text-gray-800">{{ item.name }}</h4>
            <p class="text-sm text-gray-500 mt-1">{{ item.description }}</p>
          </div>
          <span class="font-bold text-warm-brown whitespace-nowrap ml-4">{{ item.price }}</span>
        </div>
      </div>
      <div v-else class="text-center py-12 text-gray-500">
        <i class="fas fa-utensils text-4xl mb-4 block"></i>
        <p>No items found for "<strong>{{ searchQuery }}</strong>"</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useMenu } from '../composables/useMenu'

const props = defineProps({
  isOpen: Boolean
})

const emit = defineEmits(['close'])

const searchQuery = ref('')
const activeTab = ref('')

// Use menu composable
const { items, categories, loading, error, fetchAll, fetchCategories, formatPrice } = useMenu()

const tabs = computed(() => {
  return (categories.value || []).map(category => ({
    id: category,
    name: category
  }))
})

const filteredItems = computed(() => {
  const query = searchQuery.value.toLowerCase().trim()
  const category = activeTab.value

  const baseItems = items.value.filter(item => item.category === category)
  const availableItems = baseItems.filter(item => item.available === 1 || item.available === true)

  if (!query) return availableItems

  return availableItems.filter(item =>
    (item.name || '').toLowerCase().includes(query) ||
    (item.description || '').toLowerCase().includes(query)
  )
})

const displayItems = computed(() => {
  return filteredItems.value.map(item => ({
    name: item.name,
    description: item.description,
    price: formatPrice(item.price || 0)
  }))
})

const close = () => {
  searchQuery.value = ''
  emit('close')
}

const initializeMenu = async () => {
  await Promise.all([fetchAll(), fetchCategories()])
  if (!activeTab.value && categories.value.length > 0) {
    activeTab.value = categories.value[0]
  }
}

onMounted(async () => {
  await initializeMenu()
})

watch(
  () => props.isOpen,
  async (isOpen) => {
    if (isOpen && items.value.length === 0) {
      await initializeMenu()
    }
  }
)
</script>

<style scoped>
.scrollbar-hide {
  scrollbar-width: none;
  -ms-overflow-style: none;
}
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

.border-b-3 {
  border-bottom-width: 3px;
}

@media (max-width: 640px) {
  div[class*="w-[90%]"] {
    width: 95%;
    border-radius: 16px;
  }
}
</style>