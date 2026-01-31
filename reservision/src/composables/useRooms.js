/**
 * ============================================================
 * ROOMS COMPOSABLE
 * ============================================================
 * 
 * PURPOSE:
 * - Fetch rooms/cottages/events from backend
 * - Provide helpers for images and formatting
 * - Handle loading and error states
 * 
 * USAGE:
 * import { useRooms } from '@/composables/useRooms'
 * 
 * const { items, loading, error, fetchAll, getRoomImage, formatPrice } = useRooms()
 */

import { ref, computed, readonly } from 'vue'

/**
 * Base API URL - Update if your backend is on different server
 */
const API_BASE_URL = 'http://localhost:8000/api/rooms'

/**
 * Composable for rooms management
 */
export function useRooms() {
    const items = ref([])
    const loading = ref(false)
    const error = ref(null)

    /**
     * Fetch all rooms/cottages/events
     * 
     * @returns {Promise<Array>} Array of room items
     */
    const fetchAll = async () => {
        loading.value = true
        error.value = null

        try {
            const response = await fetch(API_BASE_URL)
            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.message || 'Failed to fetch rooms')
            }

            items.value = Array.isArray(data) ? data : []
            return items.value
        } catch (err) {
            error.value = err.message
            console.error('Failed to fetch rooms:', err)
            items.value = []
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
     * Parse images field (JSON string or array)
     * 
     * @param {string|Array} images - Image data
     * @returns {Array} Array of image URLs
     */
    const parseImages = (images) => {
        if (!images) return []

        if (Array.isArray(images)) return images

        if (typeof images === 'string') {
            const trimmed = images.trim()
            if (trimmed.startsWith('[')) {
                try {
                    const parsed = JSON.parse(trimmed)
                    return Array.isArray(parsed) ? parsed : []
                } catch (e) {
                    return [images]
                }
            }
            return [images]
        }

        return []
    }

    /**
     * Get primary room image
     * 
     * @param {object} item - Room item
     * @param {number} index - Image index
     * @returns {string} Image URL
     */
    const getRoomImage = (item, index = 0) => {
        if (!item) return ''
        const imageArray = parseImages(item.images)
        return imageArray[index] || imageArray[0] || ''
    }

    /**
     * Filter by category type
     * 
     * @param {string} categoryType - 'room' | 'cottage' | 'event'
     * @returns {Array} Filtered items
     */
    const getByCategoryType = computed(() => {
        return (categoryType) => items.value.filter(item => item.category_type === categoryType || item.category === categoryType)
    })

    return {
        items: readonly(items),
        loading: readonly(loading),
        error: readonly(error),
        fetchAll,
        formatPrice,
        getRoomImage,
        getByCategoryType
    }
}
