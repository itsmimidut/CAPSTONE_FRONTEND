import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import entranceRatesAPI from '../services/entranceRatesAPI';

export const useEntranceRatesStore = defineStore('entranceRates', () => {
    // STATE
    const rates = ref([]);
    const loading = ref(false);
    const error = ref(null);
    const currentPage = ref(1);
    const totalPages = ref(1);
    const totalRecords = ref(0);
    const pageSize = ref(10);

    const filters = ref({
        search: '',
        day_type: '',
        status: ''
    });

    const selectedRate = ref(null);
    const isModalOpen = ref(false);
    const modalMode = ref('view'); // view, edit, create

    // GETTERS
    const filteredRates = computed(() => rates.value);

    const paginationInfo = computed(() => ({
        currentPage: currentPage.value,
        totalPages: totalPages.value,
        totalRecords: totalRecords.value,
        pageSize: pageSize.value,
        hasNextPage: currentPage.value < totalPages.value,
        hasPrevPage: currentPage.value > 1
    }));

    const isLoading = computed(() => loading.value);

    // ACTIONS

    /**
     * Fetch all rates with filters and pagination
     */
    const fetchRates = async (page = 1) => {
        loading.value = true;
        error.value = null;

        try {
            const params = {
                page,
                limit: pageSize.value,
                ...filters.value
            };

            const response = await entranceRatesAPI.getAll(params);

            rates.value = response.data;
            currentPage.value = response.pagination.page;
            totalPages.value = response.pagination.totalPages;
            totalRecords.value = response.pagination.total;
        } catch (err) {
            error.value = err.message || 'Failed to fetch entrance rates';
            console.error('Fetch rates error:', err);
        } finally {
            loading.value = false;
        }
    };

    /**
     * Fetch rates for a specific date
     */
    const fetchRatesByDate = async (date) => {
        loading.value = true;
        error.value = null;

        try {
            const response = await entranceRatesAPI.getByDate(date);
            return response.data;
        } catch (err) {
            error.value = err.message || 'Failed to fetch rates for date';
            console.error('Fetch rates by date error:', err);
            return [];
        } finally {
            loading.value = false;
        }
    };

    /**
     * Get single rate by ID
     */
    const getRateById = async (id) => {
        try {
            const response = await entranceRatesAPI.getById(id);
            selectedRate.value = response.data;
            return response.data;
        } catch (err) {
            error.value = err.message || 'Failed to fetch rate';
            console.error('Get rate error:', err);
            return null;
        }
    };

    /**
     * Create new entrance rate
     */
    const createRate = async (rateData) => {
        loading.value = true;
        error.value = null;

        try {
            const response = await entranceRatesAPI.create(rateData);
            rates.value.unshift(response.data);
            return response.data;
        } catch (err) {
            error.value = err.response?.data?.message || err.message || 'Failed to create rate';
            console.error('Create rate error:', err);
            throw err;
        } finally {
            loading.value = false;
        }
    };

    /**
     * Update existing entrance rate
     */
    const updateRate = async (id, rateData) => {
        loading.value = true;
        error.value = null;

        try {
            const response = await entranceRatesAPI.update(id, rateData);

            // Update in local state
            const index = rates.value.findIndex(r => r.id === id);
            if (index !== -1) {
                rates.value[index] = response.data;
            }

            return response.data;
        } catch (err) {
            error.value = err.response?.data?.message || err.message || 'Failed to update rate';
            console.error('Update rate error:', err);
            throw err;
        } finally {
            loading.value = false;
        }
    };

    /**
     * Delete entrance rate
     */
    const deleteRate = async (id) => {
        loading.value = true;
        error.value = null;

        try {
            await entranceRatesAPI.delete(id);

            // Remove from local state
            rates.value = rates.value.filter(r => r.id !== id);
            totalRecords.value -= 1;

            return true;
        } catch (err) {
            error.value = err.response?.data?.message || err.message || 'Failed to delete rate';
            console.error('Delete rate error:', err);
            throw err;
        } finally {
            loading.value = false;
        }
    };

    /**
     * Toggle rate status (active ↔ hidden)
     */
    const toggleRateStatus = async (id) => {
        error.value = null;

        try {
            const response = await entranceRatesAPI.toggleStatus(id);

            // Update in local state
            const index = rates.value.findIndex(r => r.id === id);
            if (index !== -1) {
                rates.value[index] = response.data;
            }

            return response.data;
        } catch (err) {
            error.value = err.response?.data?.message || err.message || 'Failed to toggle status';
            console.error('Toggle status error:', err);
            throw err;
        }
    };

    /**
     * Update filters and refetch
     */
    const updateFilters = async (newFilters) => {
        filters.value = {
            ...filters.value,
            ...newFilters
        };
        currentPage.value = 1; // Reset to first page on filter change
        await fetchRates(1);
    };

    /**
     * Clear all filters
     */
    const clearFilters = async () => {
        filters.value = {
            search: '',
            day_type: '',
            status: ''
        };
        currentPage.value = 1;
        await fetchRates(1);
    };

    /**
     * Set page size and refetch
     */
    const setPageSize = async (size) => {
        pageSize.value = size;
        currentPage.value = 1;
        await fetchRates(1);
    };

    /**
     * Navigate to page
     */
    const goToPage = async (page) => {
        if (page >= 1 && page <= totalPages.value) {
            await fetchRates(page);
        }
    };

    // MODAL HELPERS

    const openModal = (mode = 'create') => {
        modalMode.value = mode;
        isModalOpen.value = true;
    };

    const closeModal = () => {
        isModalOpen.value = false;
        selectedRate.value = null;
        modalMode.value = 'view';
    };

    const openRateForEdit = async (id) => {
        await getRateById(id);
        modalMode.value = 'edit';
        isModalOpen.value = true;
    };

    return {
        // State
        rates,
        loading,
        error,
        filters,
        currentPage,
        totalPages,
        totalRecords,
        pageSize,
        selectedRate,
        isModalOpen,
        modalMode,

        // Getters
        filteredRates,
        paginationInfo,
        isLoading,

        // Actions
        fetchRates,
        fetchRatesByDate,
        getRateById,
        createRate,
        updateRate,
        deleteRate,
        toggleRateStatus,
        updateFilters,
        clearFilters,
        setPageSize,
        goToPage,
        openModal,
        closeModal,
        openRateForEdit
    };
});
