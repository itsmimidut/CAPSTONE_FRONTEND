import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
// Ensure API_BASE_URL ends with /api and doesn't have double /api
const ENTRANCE_RATES_ENDPOINT = API_BASE_URL.endsWith('/api/entrance-rates')
    ? API_BASE_URL
    : `${API_BASE_URL.replace(/\/api$/, '')}/api/entrance-rates`;

/**
 * Entrance Rates API client
 * Wrapper around all entrance rate endpoints
 */
const entranceRatesAPI = {
    /**
     * Get all entrance rates with pagination and filtering
     * @param {Object} params
     * @param {number} params.page - Page number (default: 1)
     * @param {number} params.limit - Items per page (default: 10)
     * @param {string} params.search - Search by rate name
     * @param {string} params.day_type - Filter by day type (weekday|weekend|holiday)
     * @param {string} params.status - Filter by status (active|hidden)
     */
    getAll: async (params = {}) => {
        try {
            const response = await axios.get(`${ENTRANCE_RATES_ENDPOINT}/`, { params });
            return response.data;
        } catch (error) {
            console.error('Error fetching entrance rates:', error);
            throw error;
        }
    },

    /**
     * Get entrance rates for a specific date
     * Automatically detects weekday/weekend and fetches applicable rates
     * @param {string} date - Date in YYYY-MM-DD format
     */
    getByDate: async (date) => {
        try {
            const response = await axios.get(`${ENTRANCE_RATES_ENDPOINT}/by-date`, {
                params: { date }
            });
            return response.data;
        } catch (error) {
            console.error(`Error fetching rates for date ${date}:`, error);
            throw error;
        }
    },

    /**
     * Get single entrance rate by ID
     * @param {number} id - Rate ID
     */
    getById: async (id) => {
        try {
            const response = await axios.get(`${ENTRANCE_RATES_ENDPOINT}/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching rate ${id}:`, error);
            throw error;
        }
    },

    /**
     * Create new entrance rate
     * @param {Object} rateData
     * @param {string} rateData.name - Rate name (e.g., "Adult", "Child")
     * @param {number} rateData.price - Price per person in PHP
     * @param {string} rateData.day_type - Day type (weekday|weekend|holiday)
     * @param {number} rateData.age_min - Minimum age (optional)
     * @param {number} rateData.age_max - Maximum age (optional)
     * @param {string} rateData.start_time - Start time HH:MM (optional)
     * @param {string} rateData.end_time - End time HH:MM (optional)
     */
    create: async (rateData) => {
        try {
            const response = await axios.post(`${ENTRANCE_RATES_ENDPOINT}/`, rateData);
            return response.data;
        } catch (error) {
            console.error('Error creating entrance rate:', error);
            throw error;
        }
    },

    /**
     * Update existing entrance rate
     * @param {number} id - Rate ID
     * @param {Object} rateData - Fields to update
     */
    update: async (id, rateData) => {
        try {
            const response = await axios.put(`${ENTRANCE_RATES_ENDPOINT}/${id}`, rateData);
            return response.data;
        } catch (error) {
            console.error(`Error updating rate ${id}:`, error);
            throw error;
        }
    },

    /**
     * Delete entrance rate
     * @param {number} id - Rate ID
     */
    delete: async (id) => {
        try {
            const response = await axios.delete(`${ENTRANCE_RATES_ENDPOINT}/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error deleting rate ${id}:`, error);
            throw error;
        }
    },

    /**
     * Toggle entrance rate status (active ↔ hidden)
     * @param {number} id - Rate ID
     */
    toggleStatus: async (id) => {
        try {
            const response = await axios.patch(`${ENTRANCE_RATES_ENDPOINT}/${id}/status`);
            return response.data;
        } catch (error) {
            console.error(`Error toggling status for rate ${id}:`, error);
            throw error;
        }
    }
};

export default entranceRatesAPI;
