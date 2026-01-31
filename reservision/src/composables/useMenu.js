/**
 * ============================================================
 * MENU COMPOSABLE
 * ============================================================
 * 
 * PURPOSE:
 * - Fetch restaurant menu items from backend
 * - Provide categories list for UI tabs
 * - Handle loading and error states
 * 
 * USAGE:
 * import { useMenu } from '@/composables/useMenu'
 * 
 * const { items, categories, loading, error, fetchAll, fetchCategories, formatPrice, getMenuImage } = useMenu()
 */

import { ref, computed, readonly } from 'vue'

/**
 * Base API URL - Update if your backend is on different server
 */
const API_BASE_URL = 'http://localhost:8000/api/restaurant/menu'

/**
 * Composable for menu management
 */
export function useMenu() {
    const items = ref([])
    const categories = ref([])
    const loading = ref(false)
    const error = ref(null)

    /**
     * Fetch all menu items
     * 
     * @returns {Promise<Array>} Array of menu items
     */
    const fetchAll = async () => {
        loading.value = true
        error.value = null

        try {
            const response = await fetch(API_BASE_URL)
            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.message || 'Failed to fetch menu items')
            }

            items.value = Array.isArray(data) ? data : []
            return items.value
        } catch (err) {
            error.value = err.message
            console.error('Failed to fetch menu items:', err)
            items.value = []
            return []
        } finally {
            loading.value = false
        }
    }

    /**
     * Fetch all menu categories
     * 
     * @returns {Promise<Array>} Array of category names
     */
    const fetchCategories = async () => {
        loading.value = true
        error.value = null

        try {
            const response = await fetch(`${API_BASE_URL}/categories`)
            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.message || 'Failed to fetch categories')
            }

            categories.value = Array.isArray(data) ? data : []
            return categories.value
        } catch (err) {
            error.value = err.message
            console.error('Failed to fetch menu categories:', err)
            categories.value = []
            return []
        } finally {
            loading.value = false
        }
    }

    /**
     * Format price for display
     * 
     * @param {number|string} price - Price value
     * @returns {string} Formatted price string
     */
    const formatPrice = (price) => {
        const numeric = Number(price)
        if (Number.isNaN(numeric)) return '₱0'
        return `₱${numeric.toLocaleString('en-PH', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`
    }

    /**
     * Get menu item image
     * 
     * @param {object} item - Menu item
     * @returns {string} Image URL
     */
    const getMenuImage = (item) => {
        if (!item) return ''
        return item.image_url || ''
    }

    /**
     * Get available menu items only
     * 
     * @returns {Array} Filtered menu items
     */
    const availableItems = computed(() => {
        return items.value.filter(item => item.available === 1 || item.available === true)
    })

    return {
        items: readonly(items),
        categories: readonly(categories),
        loading: readonly(loading),
        error: readonly(error),
        fetchAll,
        fetchCategories,
        formatPrice,
        getMenuImage,
        availableItems
    }
}
