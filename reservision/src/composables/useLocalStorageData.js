import { ref, watch, onMounted } from 'vue'

export default function useLocalStorageData(key, defaultValue = []) {
  const data = ref(defaultValue)

  // Load from localStorage on mount
  onMounted(() => {
    const stored = localStorage.getItem(key)
    if (stored) {
      try {
        data.value = JSON.parse(stored)
      } catch (e) {
        console.error(`Failed to parse localStorage key "${key}"`, e)
      }
    }
  })

  // Auto-save to localStorage whenever data changes
  watch(data, (newValue) => {
    localStorage.setItem(key, JSON.stringify(newValue))
  }, { deep: true })

  return data
}