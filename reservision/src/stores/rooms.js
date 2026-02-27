/**
 * ============================================================
 * Rooms Store (Pinia)
 * ============================================================
 * 
 * Purpose:
 * - Manages rooms/cottages/events data globally
 * - Handles CRUD operations via backend API
 * - Manages promotional pricing and seasonal pricing
 * - Syncs frontend state with backend database
 * 
 * Key Features:
 * - Automatic image JSON parsing (database stores as string)
 * - Automatic data refresh after mutations
 * - Error handling and logging
 * - Support for create, update, delete operations
 * 
 * BACKEND API ENDPOINTS
 * The backend runs on port 8000 and provides these endpoints:
 * - GET /api/rooms              → Fetch all rooms from inventory_items table
 * - POST /api/rooms             → Create room
 * - PUT /api/rooms/:id          → Update room
 * - DELETE /api/rooms/:id       → Delete room
 * - GET /api/promos             → Fetch all promotional pricing
 * - POST /api/promos            → Create promo
 * - PUT /api/promos/:id         → Update promo
 * - DELETE /api/promos/:id      → Delete promo
 * - GET /api/seasons            → Fetch seasonal pricing
 * - POST /api/seasons           → Create seasonal pricing
 * - PUT /api/seasons/:id        → Update seasonal pricing
 * - DELETE /api/seasons/:id     → Delete seasonal pricing
 * 
 * Database Tables:
 * - inventory_items: Rooms, cottages, events
 * - promos: Promotional pricing rules
 * - seasons: Seasonal pricing configurations
 * 
 * Database Columns (inventory_items):
 * - item_id: Unique identifier
 * - room_number: Room ID (e.g., '101')
 * - name: Display name
 * - category: Category fallback
 * - category_type: 'room' | 'cottage' | 'event'
 * - max_guests: Maximum occupancy
 * - price: Price per night/event
 * - description: Full description
 * - images: JSON string array of base64 data URLs
 * - status: 'Available' | 'Occupied' | 'Under Maintenance'
 * - promo: Boolean - limited offer flag
 * - primaryImageIndex: Thumbnail image index
 * - created_at: Timestamp
 * 
 * Image Handling:
 * - Frontend converts images to base64 data URLs
 * - Backend stores as JSON string: "[\"data:image/jpeg;base64,...\"]"
 * - Store parses JSON on fetch for frontend use
 * - On save, images sent as array (backend will stringify)
 */

import { defineStore } from 'pinia'
import axios from 'axios'

// ============================================================
// CONFIGURATION
// ============================================================
/**
 * BACKEND_URL: Where the Express server is running
 * 
 * Default: http://localhost:8000
 * 
 * Change this if:
 * - Backend running on different port
 * - Backend on different machine
 * - Production deployment
 * 
 * Example for production:
 * const BACKEND_URL = 'https://api.reservision.com'
 */
const BACKEND_URL = 'http://localhost:8000'

// ============================================================
// PINIA STORE DEFINITION
// ============================================================
export const useRoomsStore = defineStore('rooms', {
  /**
   * STATE
   * 
   * Reactive data that components can access and watch for changes
   * Updates automatically when store methods are called
   */
  state: () => ({
    /**
     * rooms: Array of all rooms/cottages/events
     * 
     * Structure:
     * [
     *   {
     *     item_id: 1,
     *     room_number: '101',
     *     name: 'Ocean View Suite',
     *     category_type: 'room',
     *     max_guests: 2,
     *     price: 199.99,
     *     description: '...',
     *     images: ['data:image/jpeg;base64,...'],
     *     status: 'Available',
     *     promo: false,
     *     primaryImageIndex: 0,
     *     created_at: '2025-01-26...'
     *   },
     *   ...
     * ]
     */
    rooms: [],

    /**
     * promos: Array of promotional pricing rules
     * 
     * Used for:
     * - Discount codes
     * - Limited-time offers
     * - Group pricing
     */
    promos: [],

    /**
     * seasons: Array of seasonal pricing rules
     * 
     * Used for:
     * - Peak season higher rates
     * - Off-season discounts
     * - Holiday pricing
     */
    seasons: []
  }),

  /**
   * ============================================================
   * ACTIONS
   * ============================================================
   * 
   * Methods that modify state or fetch data from backend
   * Can be async (use await axios calls)
   * Called from components via: store.actionName()
   */
  actions: {
    /**
     * ────────────────────────────────────────────────────────
     * ROOMS MANAGEMENT
     * ────────────────────────────────────────────────────────
     */

    /**
     * fetchRooms: Fetch all rooms from backend
     * 
     * Purpose: Populate rooms array with latest data from database
     * 
     * Process:
     * 1. GET request to /api/rooms
     * 2. Backend returns array of room objects
     * 3. Parse JSON images strings back to arrays
     * 4. Store in this.rooms (reactive update)
     * 
     * Image Parsing:
     * - Database stores images as JSON string: "[\"data:...\"]"
     * - Check if string, parse it; otherwise already array
     * - Default to empty array if missing
     * 
     * Usage:
     * const store = useRoomsStore()
     * await store.fetchRooms()  // Fetch from server
     * rooms = store.rooms       // Now contains latest data
     * 
     * Error Handling:
     * - Logs error to console
     * - Re-throws error for caller to handle
     * - Shows error in UI via component error handler
     * 
     * Called from:
     * - Pages on initial load
     * - After save/delete operations (automatic refresh)
     * - When user navigates to admin rooms page
     */
    async fetchRooms() {
      try {
        const { data } = await axios.get(`${BACKEND_URL}/api/rooms`)
        // Parse images JSON strings back to arrays
        this.rooms = data.map(room => ({
          ...room,
          images: typeof room.images === 'string' ? JSON.parse(room.images || '[]') : (room.images || [])
        }))
      } catch (error) {
        console.error('Error fetching rooms:', error)
        throw error
      }
    },

    /**
     * saveRoom: CREATE or UPDATE a room
     * 
     * Purpose: Save room data to backend database
     * 
     * Behavior:
     * - If room.item_id exists → UPDATE existing room (PUT)
     * - If room.item_id missing → CREATE new room (POST)
     * 
     * Data Preparation:
     * - Extract fields from room object
     * - Ensure promo is 0 or 1 for database
     * - Keep images array as-is (will be stringified by backend)
     * 
     * Parameters:
     * @param {Object} room - Room object from RoomModal
     *   Must include:
     *   - room_number: string (unique within type)
     *   - name: string (required)
     *   - category_type: 'room' | 'cottage' | 'event'
     *   - price: number
     *   - max_guests: number
     *   - images: array of data URLs or URLs
     *   - ... other fields
     *   
     *   May include:
     *   - item_id: number (for updates only)
     * 
     * Process Flow:
     * 1. Prepare roomData object with all fields
     * 2. If item_id exists: PUT to /api/rooms/{id}
     * 3. If no item_id: POST to /api/rooms (gets new ID back)
     * 4. Log responses for debugging
     * 5. Refresh rooms list from server (auto-update UI)
     * 
     * Error Handling:
     * - Catches axios errors and logs response/message
     * - Re-throws for component to show error toast
     * 
     * Usage:
     * const store = useRoomsStore()
     * const roomData = { name: '101', price: 199, ... }
     * await store.saveRoom(roomData)  // Creates new room
     * 
     * or
     * 
     * roomData.item_id = 1
     * await store.saveRoom(roomData)  // Updates room with id=1
     * 
     * Called from:
     * - RoomModal component when user clicks Save
     * - Admin rooms page
     */
    async saveRoom(room) {
      try {
        console.log('saveRoom called with:', room)

        // Prepare room data for backend
        const roomData = {
          category: room.category,
          category_type: room.category_type,
          room_number: room.room_number,
          name: room.name,
          description: room.description,
          max_guests: room.max_guests,
          price: room.price,
          quantity: room.quantity || 1,
          status: room.status,
          promo: room.promo ? 1 : 0,
          images: room.images || [], // Array of image URLs/paths
          primaryImageIndex: room.primaryImageIndex || 0
        }

        console.log('Sending roomData to backend:', roomData)

        if (room.item_id) {
          // UPDATE: Send to PUT endpoint
          console.log(`Updating room ${room.item_id}...`)
          const response = await axios.put(
            `${BACKEND_URL}/api/rooms/${room.item_id}`,
            roomData
          )
          console.log('Update response:', response.data)
        } else {
          // CREATE: Send to POST endpoint
          console.log('Creating new room...')
          const { data } = await axios.post(
            `${BACKEND_URL}/api/rooms`,
            roomData
          )
          console.log('Create response:', data)
          room.item_id = data.id
        }

        // Refresh the rooms list from server
        console.log('Fetching rooms after save...')
        await this.fetchRooms()
        console.log('Rooms after save:', this.rooms)
      } catch (error) {
        console.error('Error saving room:', error.response?.data || error.message || error)
        throw error
      }
    },

    /**
     * deleteRoom: Delete a room from backend
     * 
     * Purpose: Permanently remove room from database
     * 
     * Parameters:
     * @param {number} id - item_id of room to delete
     * 
     * Process:
     * 1. Send DELETE request to /api/rooms/{id}
     * 2. Backend removes record from inventory_items
     * 3. Refresh rooms list (auto-update UI)
     * 
     * Response:
     * - { success: true } from backend
     * 
     * Error Handling:
     * - Logs error
     * - Re-throws for caller
     * 
     * Used from:
     * - Admin rooms list (delete button)
     * - RoomModal (delete button)
     * 
     * Warning:
     * - This is permanent deletion (no undo)
     * - Component should show confirmation dialog first
     */
    async deleteRoom(id) {
      try {
        await axios.delete(`${BACKEND_URL}/api/rooms/${id}`)
        await this.fetchRooms()
      } catch (error) {
        console.error('Error deleting room:', error)
        throw error
      }
    },

    /**
     * ────────────────────────────────────────────────────────
     * PROMOS MANAGEMENT
     * ────────────────────────────────────────────────────────
     */

    /**
     * fetchPromos: Fetch all promotional pricing
     */
    async fetchPromos() {
      const { data } = await axios.get(`${BACKEND_URL}/api/promos`)
      this.promos = data
    },

    /**
     * savePromo: CREATE or UPDATE a promotional offer
     */
    async savePromo(promo) {
      if (promo.promo_id) {
        await axios.put(`${BACKEND_URL}/api/promos/${promo.promo_id}`, promo)
      } else {
        const { data } = await axios.post(`${BACKEND_URL}/api/promos`, promo)
        promo.promo_id = data.id
      }
      await this.fetchPromos()
    },

    /**
     * deletePromo: Delete a promotional offer
     */
    async deletePromo(id) {
      await axios.delete(`${BACKEND_URL}/api/promos/${id}`)
      await this.fetchPromos()
    },

    /**
     * ────────────────────────────────────────────────────────
     * SEASONS MANAGEMENT
     * ────────────────────────────────────────────────────────
     */

    /**
     * fetchSeasons: Fetch all seasonal pricing rules
     */
    async fetchSeasons() {
      const { data } = await axios.get(`${BACKEND_URL}/api/seasons`)
      this.seasons = data
    },

    /**
     * saveSeason: CREATE or UPDATE seasonal pricing
     */
    async saveSeason(season) {
      if (season.id) {
        await axios.put(`${BACKEND_URL}/api/seasons/${season.id}`, season)
      } else {
        const { data } = await axios.post(`${BACKEND_URL}/api/seasons`, season)
        season.id = data.id
      }
      await this.fetchSeasons()
    },

    /**
     * deleteSeason: Delete seasonal pricing rule
     */
    async deleteSeason(id) {
      await axios.delete(`${BACKEND_URL}/api/seasons/${id}`)
      await this.fetchSeasons()
    }
  }
})
