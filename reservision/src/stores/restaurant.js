import { defineStore } from 'pinia';
import axios from 'axios';

const API_BASE = 'http://localhost:8000/api/restaurant';

export const useRestaurantStore = defineStore('restaurant', {
    state: () => ({
        tables: [],
        orders: [],
        menuItems: [],
        inventory: [],
        loading: false,
        error: null,
    }),

    getters: {
        getTableById: (state) => (id) => state.tables.find(t => t.table_id === id),
        getOrderById: (state) => (id) => state.orders.find(o => o.order_id === id),
        getMenuItemById: (state) => (id) => state.menuItems.find(m => m.menu_id === id),
        getInventoryById: (state) => (id) => state.inventory.find(i => i.inventory_id === id),
        getOccupiedTables: (state) => state.tables.filter(t => t.status === 'occupied'),
        getAvailableTables: (state) => state.tables.filter(t => t.status === 'available'),
        getReservedTables: (state) => state.tables.filter(t => t.status === 'reserved'),
        getLowStockItems: (state) => state.inventory.filter(i => i.status === 'low' || i.status === 'critical'),
        getPendingOrders: (state) => state.orders.filter(o => o.status === 'pending' || o.status === 'preparing'),
    },

    actions: {
        // Tables Actions
        async fetchTables() {
            this.loading = true;
            try {
                const response = await axios.get(`${API_BASE}/tables`);
                this.tables = response.data;
                this.error = null;
            } catch (err) {
                this.error = err.response?.data?.message || err.message;
                console.error('Error fetching tables:', err);
            } finally {
                this.loading = false;
            }
        },

        async createTable(tableData) {
            try {
                const response = await axios.post(`${API_BASE}/tables`, tableData);
                await this.fetchTables();
                return response.data;
            } catch (err) {
                this.error = err.response?.data?.message || err.message;
                console.error('Error creating table:', err);
                throw err;
            }
        },

        async updateTable(id, tableData) {
            try {
                const response = await axios.put(`${API_BASE}/tables/${id}`, tableData);
                await this.fetchTables();
                return response.data;
            } catch (err) {
                this.error = err.response?.data?.message || err.message;
                console.error('Error updating table:', err);
                throw err;
            }
        },

        async updateTableStatus(id, status) {
            try {
                const response = await axios.patch(`${API_BASE}/tables/${id}/status`, { status });
                await this.fetchTables();
                return response.data;
            } catch (err) {
                this.error = err.response?.data?.message || err.message;
                console.error('Error updating table status:', err);
                throw err;
            }
        },

        async deleteTable(id) {
            try {
                const response = await axios.delete(`${API_BASE}/tables/${id}`);
                await this.fetchTables();
                return response.data;
            } catch (err) {
                this.error = err.response?.data?.message || err.message;
                console.error('Error deleting table:', err);
                throw err;
            }
        },

        // Orders Actions
        async fetchOrders() {
            this.loading = true;
            try {
                const response = await axios.get(`${API_BASE}/orders`);
                this.orders = response.data;
                this.error = null;
            } catch (err) {
                this.error = err.response?.data?.message || err.message;
                console.error('Error fetching orders:', err);
            } finally {
                this.loading = false;
            }
        },

        async fetchOrdersByTable(tableId) {
            try {
                const response = await axios.get(`${API_BASE}/orders/table/${tableId}`);
                return response.data;
            } catch (err) {
                this.error = err.response?.data?.message || err.message;
                console.error('Error fetching orders by table:', err);
                throw err;
            }
        },

        async createOrder(orderData) {
            try {
                const response = await axios.post(`${API_BASE}/orders`, orderData);
                await this.fetchOrders();
                return response.data;
            } catch (err) {
                this.error = err.response?.data?.message || err.message;
                console.error('Error creating order:', err);
                throw err;
            }
        },

        async updateOrderStatus(id, status) {
            try {
                const response = await axios.patch(`${API_BASE}/orders/${id}/status`, { status });
                await this.fetchOrders();
                return response.data;
            } catch (err) {
                this.error = err.response?.data?.message || err.message;
                console.error('Error updating order status:', err);
                throw err;
            }
        },

        async deleteOrder(id) {
            try {
                const response = await axios.delete(`${API_BASE}/orders/${id}`);
                await this.fetchOrders();
                return response.data;
            } catch (err) {
                this.error = err.response?.data?.message || err.message;
                console.error('Error deleting order:', err);
                throw err;
            }
        },

        // Menu Actions
        async fetchMenuItems() {
            this.loading = true;
            try {
                const response = await axios.get(`${API_BASE}/menu`);
                this.menuItems = response.data;
                this.error = null;
            } catch (err) {
                this.error = err.response?.data?.message || err.message;
                console.error('Error fetching menu items:', err);
            } finally {
                this.loading = false;
            }
        },

        async getMenuByCategory(category) {
            try {
                const response = await axios.get(`${API_BASE}/menu/category/${category}`);
                return response.data;
            } catch (err) {
                this.error = err.response?.data?.message || err.message;
                console.error('Error fetching menu by category:', err);
                throw err;
            }
        },

        async getCategories() {
            try {
                const response = await axios.get(`${API_BASE}/menu/categories`);
                return response.data;
            } catch (err) {
                this.error = err.response?.data?.message || err.message;
                console.error('Error fetching categories:', err);
                throw err;
            }
        },

        async createMenuItem(menuData) {
            try {
                const response = await axios.post(`${API_BASE}/menu`, menuData);
                await this.fetchMenuItems();
                return response.data;
            } catch (err) {
                this.error = err.response?.data?.message || err.message;
                console.error('Error creating menu item:', err);
                throw err;
            }
        },

        async updateMenuItem(id, menuData) {
            try {
                const response = await axios.put(`${API_BASE}/menu/${id}`, menuData);
                await this.fetchMenuItems();
                return response.data;
            } catch (err) {
                this.error = err.response?.data?.message || err.message;
                console.error('Error updating menu item:', err);
                throw err;
            }
        },

        async toggleMenuItemAvailability(id, available) {
            try {
                const response = await axios.patch(`${API_BASE}/menu/${id}/availability`, { available });
                await this.fetchMenuItems();
                return response.data;
            } catch (err) {
                this.error = err.response?.data?.message || err.message;
                console.error('Error toggling menu item availability:', err);
                throw err;
            }
        },

        async deleteMenuItem(id) {
            try {
                const response = await axios.delete(`${API_BASE}/menu/${id}`);
                await this.fetchMenuItems();
                return response.data;
            } catch (err) {
                this.error = err.response?.data?.message || err.message;
                console.error('Error deleting menu item:', err);
                throw err;
            }
        },

        // Inventory Actions
        async fetchInventory() {
            this.loading = true;
            try {
                const response = await axios.get(`${API_BASE}/inventory`);
                this.inventory = response.data;
                this.error = null;
            } catch (err) {
                this.error = err.response?.data?.message || err.message;
                console.error('Error fetching inventory:', err);
            } finally {
                this.loading = false;
            }
        },

        async createInventoryItem(inventoryData) {
            try {
                const response = await axios.post(`${API_BASE}/inventory`, inventoryData);
                await this.fetchInventory();
                return response.data;
            } catch (err) {
                this.error = err.response?.data?.message || err.message;
                console.error('Error creating inventory item:', err);
                throw err;
            }
        },

        async updateInventoryItem(id, inventoryData) {
            try {
                const response = await axios.put(`${API_BASE}/inventory/${id}`, inventoryData);
                await this.fetchInventory();
                return response.data;
            } catch (err) {
                this.error = err.response?.data?.message || err.message;
                console.error('Error updating inventory item:', err);
                throw err;
            }
        },

        async updateInventoryQuantity(id, quantity, operation = 'set') {
            try {
                const response = await axios.patch(`${API_BASE}/inventory/${id}/quantity`, { quantity, operation });
                await this.fetchInventory();
                return response.data;
            } catch (err) {
                this.error = err.response?.data?.message || err.message;
                console.error('Error updating inventory quantity:', err);
                throw err;
            }
        },

        async deleteInventoryItem(id) {
            try {
                const response = await axios.delete(`${API_BASE}/inventory/${id}`);
                await this.fetchInventory();
                return response.data;
            } catch (err) {
                this.error = err.response?.data?.message || err.message;
                console.error('Error deleting inventory item:', err);
                throw err;
            }
        },

        // Initialize all data
        async initializeRestaurantData() {
            try {
                await Promise.all([
                    this.fetchTables(),
                    this.fetchOrders(),
                    this.fetchMenuItems(),
                    this.fetchInventory(),
                ]);
            } catch (err) {
                console.error('Error initializing restaurant data:', err);
            }
        },
    },
});
