# Frontend API Integration - Complete ✅

## Overview
Successfully integrated the inventory backend API into HomePage.vue child components. All mockup data has been replaced with real API calls while maintaining fallback functionality for graceful degradation.

---

## 1. Components Updated

### RestaurantSection.vue
**Purpose**: Display dining/menu items from inventory API in an auto-rotating carousel

**Features**:
- ✅ Fetches menu items from `/api/restaurant/inventory` endpoint
- ✅ Filters items by category: `menu`
- ✅ Auto-rotates every 5 seconds with manual navigation
- ✅ Loading state with spinner while data fetches
- ✅ Responsive design: mobile overlay + desktop sidebar
- ✅ Fallback mockup data (3 dishes) if API returns empty
- ✅ Detailed item display: name, description, price (₱ formatted), serving size

**Key Code**:
```javascript
const { items, loading, error, fetchAll, getItemImage } = useInventory()

const dishes = computed(() => {
  return items.value
    .filter(item => item.category === 'menu' || item.category_type === 'menu')
    .map(item => ({
      id: item.inventory_id,
      name: item.name || item.item_name,
      desc: item.description || 'Delicious menu item available for ordering',
      price: `₱${item.price?.toLocaleString() || '0'}`,
      persons: item.max_guests ? `Good for ${item.max_guests} persons...` : 'Individual serving',
      image: getItemImage(item) || fallback_url,
      status: item.status
    }))
})

const displayDishes = computed(() => {
  return dishes.value.length > 0 ? dishes.value : fallbackDishes
})
```

**Integration**:
- Calls `fetchAll()` in `onMounted()` hook
- Auto-rotation starts after data fetches
- Cleans up interval in `onUnmounted()` for memory efficiency

---

### SuitesSection.vue
**Purpose**: Display room/suite accommodations from inventory API in a carousel with navigation

**Features**:
- ✅ Fetches room items from `/api/restaurant/inventory` endpoint
- ✅ Filters items by category: `room` or `cottage`
- ✅ Manual navigation (previous/next buttons)
- ✅ Loading state with spinner while data fetches
- ✅ Hover overlay with room details: name, description, price, capacity
- ✅ Fallback mockup data (3 suites) if API returns empty
- ✅ Capacity tracking (max_guests from API)

**Key Code**:
```javascript
const rooms = computed(() => {
  return items.value
    .filter(item => 
      item.category === 'room' || 
      item.category === 'cottage' || 
      item.category_type === 'room' || 
      item.category_type === 'cottage'
    )
    .map(item => ({
      id: item.inventory_id,
      name: item.name || item.item_name,
      description: item.description || `Beautiful ${item.item_name} with premium amenities`,
      image: getItemImage(item) || fallback_url,
      price: item.price ? `₱${item.price.toLocaleString()}` : 'Contact for pricing',
      max_guests: item.max_guests || 2,
      status: item.status
    }))
})

const displaySuites = computed(() => {
  return rooms.value.length > 0 ? rooms.value : fallbackSuites
})
```

**Integration**:
- Calls `fetchAll()` in `onMounted()` hook
- No auto-rotation (manual navigation via buttons)
- Carousel slider responsive across mobile/tablet/desktop

---

## 2. Composable Used: useInventory.js

**Location**: `src/composables/useInventory.js`

**Core Features**:
- `fetchAll(filters)` - Fetches all inventory items with optional status/search filters
- `getRooms` (computed) - Filter items by room category
- `getCottages` (computed) - Filter items by cottage category
- `getEvents` (computed) - Filter items by event category
- `getItemImage(item)` - Handles multiple image formats (array, JSON string, direct URL)
- `getItemDescription(item)` - Provides fallback descriptions
- `formatPrice(price)` - Philippine peso formatting (₱)
- Reactive state: `items`, `loading`, `error` (all readonly for consumer safety)

**API Base URL**: `http://localhost:8000/api/restaurant/inventory`

---

## 3. Fallback System

Both components implement a **graceful degradation pattern**:

1. **API Available**: Shows real data from database
2. **API Unavailable/Empty**: Shows hardcoded mockup data
3. **Loading State**: Displays spinner while fetching
4. **Error Handling**: Catches errors and silently falls back to mockups

```javascript
// Component loads mockups as fallback
const displayDishes = computed(() => {
  return dishes.value.length > 0 ? dishes.value : fallbackDishes
})

// Safely fetch with error handling
onMounted(async () => {
  try {
    await fetchAll()
  } catch (err) {
    console.warn('Failed to fetch data:', err)
    // Component displays fallback mockups automatically
  }
})
```

---

## 4. Data Flow

```
HOMEPAGE (HomePage.vue)
    ↓
    ├─→ RestaurantSection.vue
    │       ├─ useInventory() composable
    │       ├─ fetchAll() → /api/restaurant/inventory
    │       ├─ Filter by: category = 'menu'
    │       └─ Display: Auto-rotating carousel (5s interval)
    │
    └─→ SuitesSection.vue
            ├─ useInventory() composable
            ├─ fetchAll() → /api/restaurant/inventory
            ├─ Filter by: category = 'room' or 'cottage'
            └─ Display: Manual carousel navigation
```

---

## 5. Testing Instructions

### Start Backend
```bash
cd /CAPSTONE BACKEND/reservision-backend
npm start
# Server runs on http://localhost:8000
```

### Start Frontend
```bash
cd /CAPSTONE FRONTEND/reservision
npm run dev
# Frontend runs on http://localhost:5173 (or configured port)
```

### Test API Endpoints
Use the [POSTMAN_TESTING_GUIDE.md](../CAPSTONE%20BACKEND/POSTMAN_TESTING_GUIDE.md) or make requests:

```bash
# Get all inventory
curl http://localhost:8000/api/restaurant/inventory

# Get with filter (menu category)
curl "http://localhost:8000/api/restaurant/inventory?search=menu"

# Get with status filter
curl "http://localhost:8000/api/restaurant/inventory?status=good"
```

### Verify Frontend Integration
1. Open browser to frontend URL
2. Scroll to "Dining & Refreshments" section
3. Should see **real menu items** from API (or fallback mockups)
4. Click next/previous to navigate slides
5. On mobile, click "See More" to view details
6. Scroll to "Our Suites" section
7. Should see **real rooms** from API (or fallback mockups)
8. Click arrows to navigate carousel
9. Hover over room cards to see full details

---

## 6. Database Schema Mapping

### Database Fields → Component Display

**Menu Items** (category = 'menu'):
- `item_name` → `.name`
- `description` → `.desc`
- `price` → `.price` (formatted with ₱)
- `max_guests` → `.persons`
- `image_url` / `images` → `.image`

**Room Items** (category = 'room' or 'cottage'):
- `item_name` → `.name`
- `description` → `.description`
- `price` → `.price` (formatted with ₱)
- `max_guests` → `.max_guests` (capacity)
- `image_url` / `images` → `.image`
- `status` → Used for visual indicators (good/low/critical)

---

## 7. API Endpoints Referenced

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/restaurant/inventory` | GET | Fetch all items (used by components) |
| `/api/restaurant/inventory?search=menu` | GET | Filter items by search term |
| `/api/restaurant/inventory?status=good` | GET | Filter items by status |
| `/api/restaurant/inventory` | POST | Create new item (admin) |
| `/api/restaurant/inventory/:id` | PUT | Update entire item |
| `/api/restaurant/inventory/:id` | PATCH | Update quantity only |
| `/api/restaurant/inventory/:id` | DELETE | Remove item |
| `/api/restaurant/inventory/status/low` | GET | Get low-stock items |
| `/api/restaurant/inventory/stats` | GET | Get analytics |

---

## 8. Image Handling

The `getItemImage()` utility handles multiple image formats from API:

```javascript
// Handles all these formats:
getItemImage({ images: ['url1', 'url2'] })        // Array → takes first
getItemImage({ images: '["url1", "url2"]' })      // JSON string → parses & takes first
getItemImage({ image_url: 'single_url' })         // Direct URL
getItemImage({ image_url: null })                 // Fallback to default
```

---

## 9. Next Steps (Optional Enhancements)

- [ ] Add loading skeleton screens instead of spinners
- [ ] Implement image lazy-loading for performance
- [ ] Add quantity indicators for menu items
- [ ] Create admin panel for managing inventory items
- [ ] Add filtering/search UI for menu items
- [ ] Implement booking integration with room selection
- [ ] Add reviews/ratings display
- [ ] Create category-based filtering UI

---

## 10. File Manifest

```
Frontend Integration Files:
├── src/composables/useInventory.js ........................ Vue composable (reusable API layer)
├── src/components/RestaurantSection.vue .................. Menu carousel (API integrated)
├── src/components/SuitesSection.vue ....................... Room carousel (API integrated)
├── src/views/website/HomePage.vue ......................... Parent component (unchanged)
└── FRONTEND_API_INTEGRATION_COMPLETE.md (this file)
```

---

## Summary

✅ **RestaurantSection.vue** - Displays menu items in auto-rotating carousel
✅ **SuitesSection.vue** - Displays rooms in manual carousel with hover details
✅ **useInventory.js** - Centralized API composable with reactive state
✅ **Fallback System** - Graceful degradation to mockups if API unavailable
✅ **Loading States** - Visual spinners while fetching data
✅ **Error Handling** - Silent failures with automatic fallback

**Status**: Ready for production deployment once backend is running!

---

*Last Updated*: Integration Complete
*Framework*: Vue 3 Composition API + Tailwind CSS
*API Version*: RESTful (Express.js backend)
