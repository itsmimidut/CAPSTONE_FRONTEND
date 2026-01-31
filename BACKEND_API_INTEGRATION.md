# Backend API Integration Guide

## Server Configuration
- **Base URL:** `http://localhost:8000`
- **Port:** 8000
- **CORS:** Enabled

## API Endpoints

### Rooms Management
```
GET    /api/rooms              → Fetch all rooms
GET    /api/rooms/:id          → Get single room by ID
POST   /api/rooms              → Create new room
PUT    /api/rooms/:id          → Update existing room
DELETE /api/rooms/:id          → Delete room
```

**Room Object Structure:**
```javascript
{
  item_id: number,              // Unique identifier (auto-generated on create)
  category: string,             // e.g., "Room" or "Cottage"
  category_type: string,        // e.g., "Standard", "Deluxe", "Suite"
  room_number: string,          // Room number/identifier
  name: string,                 // Display name
  description: string,          // Detailed description
  max_guests: number,           // Maximum occupants
  price: number,                // Nightly rate
  status: string,               // "Available", "Occupied", "Under Maintenance"
  promo: string,                // Associated promo code (optional)
  images: string[],             // Array of image URLs (stored as JSON)
  primaryImageIndex: number,    // Index of main display image
  created_at: timestamp         // Auto-generated
}
```

### Promos Management
```
GET    /api/promos              → Fetch all promos
POST   /api/promos              → Create new promo
PUT    /api/promos/:id          → Update promo
DELETE /api/promos/:id          → Delete promo
```

**Promo Object Structure:**
```javascript
{
  promo_id: number,             // Unique identifier (auto-generated)
  code: string,                 // Promo code (e.g., "SUMMER20")
  type: string,                 // "percentage" or "fixed"
  value: number,                // Discount value (20 for 20% or 500 for ₱500)
  description: string,          // Promo details
  startDate: date,              // Promo start date
  endDate: date,                // Promo end date
  usageLimit: number,           // Max number of times it can be used (nullable)
  created_at: timestamp         // Auto-generated
}
```

### Seasonal Pricing Management
```
GET    /api/seasons             → Fetch all seasons
POST   /api/seasons             → Create seasonal pricing
PUT    /api/seasons/:id         → Update season
DELETE /api/seasons/:id         → Delete season
```

**Seasonal Pricing Object Structure:**
```javascript
{
  id: number,                   // Unique identifier (auto-generated)
  name: string,                 // Season name (e.g., "Peak Season")
  multiplier: number,           // Price multiplier (1.5 = 50% increase)
  startDate: date,              // Season start date
  endDate: date,                // Season end date
  applyTo: string,              // Which rooms to apply to (e.g., "all", room IDs)
  created_at: timestamp         // Auto-generated
}
```

## Frontend Integration (Already Implemented)

### Pinia Store: `src/stores/rooms.js`
The store has all necessary API calls configured:

```javascript
// Fetch all rooms from backend
await roomsStore.fetchRooms()

// Create or update a room
await roomsStore.saveRoom(roomData)

// Delete a room
await roomsStore.deleteRoom(roomId)

// Fetch all promos
await roomsStore.fetchPromos()

// Save promo (create/update)
await roomsStore.savePromo(promoData)

// Delete promo
await roomsStore.deletePromo(promoId)

// Fetch seasonal pricing
await roomsStore.fetchSeasons()

// Save seasonal pricing
await roomsStore.saveSeason(seasonData)

// Delete season
await roomsStore.deleteSeason(seasonId)
```

## Current Data Flow

### RoomAndCottage.vue Component
1. On mount: `roomsStore.fetchRooms()`, `roomsStore.fetchPromos()`, `roomsStore.fetchSeasons()`
2. Renders rooms from `roomsStore.rooms` array
3. On create/update: calls `roomsStore.saveRoom(roomData)`
4. On delete: calls `roomsStore.deleteRoom(roomId)`
5. Same pattern for promos and seasons

### Key Field Mappings
- Backend uses `item_id` for rooms → Frontend uses `room.item_id`
- Backend uses `promo_id` for promos → Frontend uses `promo.promo_id`
- Backend uses `id` for seasons → Frontend uses `season.id`

## Database Tables Used
- `inventory_items` - Stores rooms and cottages
- `promos` - Stores promotional offers
- `seasonal_pricing` - Stores seasonal rate adjustments

## Testing the Connection

### 1. Start Backend Server
```bash
cd c:\Users\John Rhey Tamares\Downloads\CAPSTONE BACKEND\reservision-backend
npm start
```

### 2. Verify Backend is Running
Visit `http://localhost:8000/api/rooms` - should return JSON array

### 3. Frontend will Auto-Load Data
- Open RoomAndCottage.vue page
- Check browser console for any errors
- Verify rooms, promos, and seasons load from API

## Error Handling
Current implementation includes basic try-catch in `onMounted()`. For production:
- Add loading states
- Show user-friendly error messages
- Implement retry logic for failed requests
- Add validation before sending to backend

## Next Steps
1. ✅ Backend API analysis complete
2. ✅ Frontend store already configured
3. Test the connection end-to-end
4. Add error toast notifications
5. Implement loading spinners during API calls
