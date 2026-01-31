/**
 * ============================================================
 * RATES COMPOSABLE
 * ============================================================
 * 
 * PURPOSE:
 * - Fetch rate entries and rate cards for RatesPage
 * - Provide helpers for lookup by category
 * - Handle loading and error states
 * 
 * USAGE:
 * import { useRates } from '@/composables/useRates'
 * 
 * const { entries, cards, loading, error, fetchEntries, fetchCards, getEntriesByCategory, getCardByCategory } = useRates()
 */

import { ref, computed, readonly } from 'vue'

/**
 * Base API URL - Update if your backend is on different server
 */
const API_BASE_URL = 'http://localhost:8000/api/rates'

export function useRates() {
    const entries = ref([])
    const cards = ref([])
    const loading = ref(false)
    const error = ref(null)

    /**
     * Fetch rate entries (table rows) from backend
     * 
     * @param {string} category - Optional category filter
     * @returns {Promise<Array>}
     */
    const fetchEntries = async (category = '') => {
        loading.value = true
        error.value = null

        try {
            const url = category ? `${API_BASE_URL}/entries?category=${encodeURIComponent(category)}` : `${API_BASE_URL}/entries`
            const response = await fetch(url)
            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.message || 'Failed to fetch rate entries')
            }

            entries.value = Array.isArray(data) ? data : []
            return entries.value
        } catch (err) {
            error.value = err.message
            console.error('Failed to fetch rate entries:', err)
            entries.value = []
            return []
        } finally {
            loading.value = false
        }
    }

    /**
     * Fetch rate cards (single-card sections) from backend
     * 
     * @param {string} category - Optional category filter
     * @returns {Promise<Array>}
     */
    const fetchCards = async (category = '') => {
        loading.value = true
        error.value = null

        try {
            const url = category ? `${API_BASE_URL}/cards?category=${encodeURIComponent(category)}` : `${API_BASE_URL}/cards`
            const response = await fetch(url)
            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.message || 'Failed to fetch rate cards')
            }

            cards.value = Array.isArray(data) ? data : []
            return cards.value
        } catch (err) {
            error.value = err.message
            console.error('Failed to fetch rate cards:', err)
            cards.value = []
            return []
        } finally {
            loading.value = false
        }
    }

    /**
     * Get entries by category
     * 
     * @returns {(category: string) => Array}
     */
    const getEntriesByCategory = computed(() => {
        return (category) => entries.value.filter(entry => entry.category === category)
    })

    /**
     * Get first card by category
     * 
     * @returns {(category: string) => object|null}
     */
    const getCardByCategory = computed(() => {
        return (category) => cards.value.find(card => card.category === category) || null
    })

    return {
        entries: readonly(entries),
        cards: readonly(cards),
        loading: readonly(loading),
        error: readonly(error),
        fetchEntries,
        fetchCards,
        getEntriesByCategory,
        getCardByCategory
    }
}
