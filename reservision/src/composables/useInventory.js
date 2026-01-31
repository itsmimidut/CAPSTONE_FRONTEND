/**
 * ============================================================
 * INVENTORY COMPOSABLE
 * ============================================================
 * 
 * PURPOSE:
 * - Manage inventory data fetching from API
 * - Provide reactive state for inventory items
 * - Handle loading and error states
 * 
 * USAGE:
 * import { useInventory } from '@/composables/useInventory'
 * 
 * const { items, loading, error, fetchAll, getRoomsByCategory } = useInventory()
 */

import { ref, computed, readonly } from 'vue'

/**
 * Base API URL - Update if your backend is on different server
 */
const API_BASE_URL = 'http://localhost:8000/api/restaurant/inventory'

/**
 * Composable for inventory management
 */
export function useInventory() {
    const items = ref([])
    const loading = ref(false)
    const error = ref(null)

    /**
     * Fetch all inventory items with optional filters
     * 
     * @param {object} filters - Optional filters { status, search, category }
     * @returns {Promise<Array>} Array of items
     */
    const fetchAll = async (filters = {}) => {
        loading.value = true
        error.value = null

        try {
            let endpoint = API_BASE_URL
            const params = new URLSearchParams()

            if (filters.status) params.append('status', filters.status)
            if (filters.search) params.append('search', filters.search)

            if (params.toString()) endpoint += `?${params}`

            const response = await fetch(endpoint)
            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.message || 'Failed to fetch inventory')
            }

            items.value = data.data || []
            return items.value
        } catch (err) {
            error.value = err.message
            console.error('Failed to fetch inventory:', err)
            return []
        } finally {
            loading.value = false
        }
    }

    /**
     * Get items filtered by category (e.g., 'room', 'cottage', 'event')
     * 
     * @param {string} category - Category to filter by
     * @returns {Array} Filtered items
     */
    const getByCategory = computed(() => {
        return (category) => {
            return items.value.filter(item =>
                item.category === category || item.category_type === category
            )
        }
    })

    /**
     * Get rooms (all room types)
     * 
     * @returns {Array} All room items
     */
    const getRooms = computed(() => {
        return items.value.filter(item =>
            item.category === 'room' || item.category_type === 'room'
        )
    })

    /**
     * Get cottages
     * 
     * @returns {Array} All cottage items
     */
    const getCottages = computed(() => {
        return items.value.filter(item =>
            item.category === 'cottage' || item.category_type === 'cottage'
        )
    })

    /**
     * Get events/spaces
     * 
     * @returns {Array} All event items
     */
    const getEvents = computed(() => {
        return items.value.filter(item =>
            item.category === 'event' || item.category_type === 'event'
        )
    })

    /**
     * Get low stock items
     * 
     * @returns {Promise<Array>} Low stock items
     */
    const fetchLowStock = async () => {
        loading.value = true
        error.value = null

        try {
            const response = await fetch(`${API_BASE_URL}/status/low`)
            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.message || 'Failed to fetch low stock items')
            }

            return data.data || []
        } catch (err) {
            error.value = err.message
            console.error('Failed to fetch low stock:', err)
            return []
        } finally {
            loading.value = false
        }
    }

    /**
     * Get single item by ID
     * 
     * @param {number} id - Item ID
     * @returns {Promise<object>} Item data
     */
    const fetchOne = async (id) => {
        loading.value = true
        error.value = null

        try {
            const response = await fetch(`${API_BASE_URL}/${id}`)
            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.message || 'Item not found')
            }

            return data.data
        } catch (err) {
            error.value = err.message
            console.error(`Failed to fetch item ${id}:`, err)
            return null
        } finally {
            loading.value = false
        }
    }

    /**
     * Format price for display
     * 
     * @param {number} price - Price value
     * @returns {string} Formatted price string
     */
    const formatPrice = (price) => {
        return `₱${price.toLocaleString('en-PH', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`
    }

    /**
     * Get item image (handles both array and single image)
     * 
     * @param {object} item - Item object
     * @param {number} index - Image index (default 0)
     * @returns {string} Image URL or path
     */
    const getItemImage = (item, index = 0) => {
        if (!item) return ''

        // If images is a string (direct URL)
        if (typeof item.images === 'string') {
            return item.images
        }

        // If images is JSON string, parse it
        if (typeof item.images === 'string' && item.images.startsWith('[')) {
            try {
                const imageArray = JSON.parse(item.images)
                return imageArray[index] || imageArray[0] || ''
            } catch (e) {
                return item.images
            }
        }

        // If images is array
        if (Array.isArray(item.images)) {
            return item.images[index] || item.images[0] || ''
        }

        return ''
    }

    /**
     * Get item description or generate one
     * 
     * @param {object} item - Item object
     * @returns {string} Description
     */
    const getItemDescription = (item) => {
        if (item.description) return item.description

        // Generate default description based on type
        const descriptions = {
            room: `Comfortable room with ${item.max_guests} guests capacity. Available for booking.`,
            cottage: `Spacious cottage perfect for families. Accommodates up to ${item.max_guests} guests.`,
            event: `Event space available for ${item.max_guests} guests. Perfect for celebrations.`
        }

        return descriptions[item.category_type] || descriptions[item.category] || 'Available for booking'
    }

    /**
     * Get formatted guest info
     * 
     * @param {object} item - Item object
     * @returns {string} Guest info
     */
    const getGuestInfo = (item) => {
        if (!item.max_guests) return ''
        return `Good for ${item.max_guests} person${item.max_guests > 1 ? 's' : ''}`
    }

    return {
        items: readonly(items),
        loading: readonly(loading),
        error: readonly(error),
        fetchAll,
        fetchOne,
        fetchLowStock,
        getByCategory,
        getRooms,
        getCottages,
        getEvents,
        formatPrice,
        getItemImage,
        getItemDescription,
        getGuestInfo
    }
}
