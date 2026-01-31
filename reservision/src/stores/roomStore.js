// ==========================================
// FILE: src/stores/roomStore.js
// ==========================================
import { defineStore } from 'pinia'

export const useRoomStore = defineStore('room', {
  state: () => ({
    rooms: [],
    promos: [],
    seasonalPricing: [],
    filters: {
      search: '',
      type: 'all',
      status: 'all'
    }
  }),
  
  getters: {
    totalRooms: (state) => state.rooms.length,
    availableRooms: (state) => state.rooms.filter(r => r.status === 'Available').length,
    occupiedRooms: (state) => state.rooms.filter(r => r.status === 'Occupied').length,
    maintenanceRooms: (state) => state.rooms.filter(r => r.status === 'Under Maintenance').length,
    
    filteredRooms: (state) => {
      let filtered = state.rooms
      
      // Search filter
      if (state.filters.search) {
        const search = state.filters.search.toLowerCase()
        filtered = filtered.filter(r => 
          r.name.toLowerCase().includes(search) ||
          r.room_number.toLowerCase().includes(search) ||
          r.category.toLowerCase().includes(search)
        )
      }
      
      // Type filter
      if (state.filters.type !== 'all') {
        filtered = filtered.filter(r => r.category === state.filters.type)
      }
      
      // Status filter
      if (state.filters.status !== 'all') {
        filtered = filtered.filter(r => r.status === state.filters.status)
      }
      
      return filtered
    },
    
    activePromos: (state) => {
      return state.promos.filter(p => new Date(p.endDate) >= new Date())
    }
  },
  
  actions: {
    loadFromLocalStorage() {
      const rooms = localStorage.getItem('resortRooms')
      const promos = localStorage.getItem('resortPromos')
      const seasonal = localStorage.getItem('resortSeasonalPricing')
      
      this.rooms = rooms ? JSON.parse(rooms) : this.getDemoRooms()
      this.promos = promos ? JSON.parse(promos) : []
      this.seasonalPricing = seasonal ? JSON.parse(seasonal) : []
    },
    
    getDemoRooms() {
      return [
        {
          id: 1,
          name: "Ocean View Suite",
          room_number: "101",
          category: "Suite",
          price: 299,
          max_guests: 2,
          description: "Luxurious suite with panoramic ocean views, king-sized bed, and private balcony.",
          status: "Available",
          available: 1,
          images: ["https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=600&q=80"],
          primaryImageIndex: 0,
          promo: false
        },
        {
          id: 2,
          name: "Garden Cottage",
          room_number: "201",
          category: "Cottage",
          price: 189,
          max_guests: 2,
          description: "Charming cottage nestled in our tropical gardens, perfect for a romantic getaway.",
          status: "Available",
          available: 1,
          images: ["https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80"],
          primaryImageIndex: 0,
          promo: true
        }
      ]
    },
    
    addRoom(roomData) {
      const newRoom = {
        ...roomData,
        id: Date.now()
      }
      this.rooms.push(newRoom)
      this.saveRooms()
    },
    
    updateRoom(id, roomData) {
      const index = this.rooms.findIndex(r => r.id === id)
      if (index !== -1) {
        this.rooms[index] = { ...this.rooms[index], ...roomData }
        this.saveRooms()
      }
    },
    
    deleteRoom(id) {
      this.rooms = this.rooms.filter(r => r.id !== id)
      this.saveRooms()
    },
    
    saveRooms() {
      localStorage.setItem('resortRooms', JSON.stringify(this.rooms))
    },
    
    addPromo(promoData) {
      const newPromo = {
        ...promoData,
        id: Date.now().toString(),
        used: 0
      }
      this.promos.push(newPromo)
      this.savePromos()
    },
    
    updatePromo(id, promoData) {
      const index = this.promos.findIndex(p => p.id === id)
      if (index !== -1) {
        this.promos[index] = { ...this.promos[index], ...promoData }
        this.savePromos()
      }
    },
    
    deletePromo(id) {
      this.promos = this.promos.filter(p => p.id !== id)
      this.savePromos()
    },
    
    savePromos() {
      localStorage.setItem('resortPromos', JSON.stringify(this.promos))
    },
    
    addSeasonalPricing(seasonData) {
      const newSeason = {
        ...seasonData,
        id: Date.now().toString()
      }
      this.seasonalPricing.push(newSeason)
      this.saveSeasonal()
    },
    
    saveSeasonal() {
      localStorage.setItem('resortSeasonalPricing', JSON.stringify(this.seasonalPricing))
    },
    
    applySeasonalPricing(basePrice, roomType) {
      const now = new Date()
      const activeSeason = this.seasonalPricing.find(season => {
        const start = new Date(season.startDate)
        const end = new Date(season.endDate)
        const appliesTo = season.applyTo === 'all' || 
          season.applyTo.split(',').map(s => s.trim()).includes(roomType)
        return now >= start && now <= end && appliesTo
      })
      
      return activeSeason ? Math.round(basePrice * activeSeason.multiplier) : basePrice
    },
    
    setFilter(key, value) {
      this.filters[key] = value
    }
  }
})
