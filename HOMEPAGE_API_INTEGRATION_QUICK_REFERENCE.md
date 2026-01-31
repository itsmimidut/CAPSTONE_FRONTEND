# HomePage.vue API Integration - Quick Reference

## ✅ What Was Completed

### 1. RestaurantSection.vue Integration
**Status**: ✅ COMPLETE - Menu items now fetch from inventory API

**Changes Made**:
- Replaced static `dishes` array with API-driven `computed` property
- Added `useInventory()` composable for data fetching
- Implemented filtering by category: `menu`
- Added fallback mockups (3 dishes) for graceful degradation
- Added loading state spinner while fetching data
- Carousel auto-rotates every 5 seconds with real data
- Mobile-responsive with overlay details

**Template Features**:
- Shows loading spinner while `loading === true`
- Auto-rotates through `displayDishes` (API data or fallbacks)
- Mobile: Info overlay with "See More/Less" toggle
- Desktop: Sidebar with item details and action buttons
- Responsive across all screen sizes

---

### 2. SuitesSection.vue Integration
**Status**: ✅ COMPLETE - Room/suite items now fetch from inventory API

**Changes Made**:
- Replaced static `suites` array with API-driven `computed` property
- Added `useInventory()` composable for data fetching
- Implemented filtering by category: `room` or `cottage`
- Added fallback mockups (3 suites) for graceful degradation
- Added loading state spinner while fetching data
- Manual navigation with previous/next buttons
- Hover overlay shows room details: name, description, price, capacity

**Template Features**:
- Shows loading spinner while `loading === true`
- Carousel with manual navigation arrows
- Hover effects reveal room details with gradient overlay
- Displays price and guest capacity on hover
- Responsive carousel (1 col mobile, 2 cols tablet, 3 cols desktop)

---

### 3. useInventory.js Composable
**Status**: ✅ READY - Reusable Vue 3 composable for all components

**Key Functions**:
```javascript
// Main fetch function
await fetchAll(filters)  // Optional: { status: 'good', search: 'menu' }

// Category filters (computed properties)
getRooms        // Filter items by category 'room'
getCottages     // Filter items by category 'cottage'  
getEvents       // Filter items by category 'event'

// Utility functions
getItemImage(item)           // Handles array/JSON/string image formats
getItemDescription(item)     // Fallback descriptions
formatPrice(price)           // Philippine peso formatting (₱)
getGuestInfo(max_guests)     // Format guest capacity

// Reactive state (readonly)
items           // Array of all fetched inventory items
loading         // Boolean: true while fetching
error          // String: error message if failed
```

---

## 📋 API Flow Diagram

```
HomePage.vue (Parent)
    ├── RestaurantSection.vue
    │   ├── Import useInventory()
    │   ├── fetchAll() on mount
    │   ├── Filter items: category = 'menu'
    │   ├── Compute dishes from filtered items
    │   ├── Display displayDishes (API data or fallbacks)
    │   └── Auto-rotate carousel every 5 seconds
    │
    └── SuitesSection.vue
        ├── Import useInventory()
        ├── fetchAll() on mount
        ├── Filter items: category = 'room' or 'cottage'
        ├── Compute rooms from filtered items
        ├── Display displaySuites (API data or fallbacks)
        └── Manual carousel navigation
```

---

## 🔧 How Each Component Works

### RestaurantSection.vue Data Flow
```
API Call: GET /api/restaurant/inventory
    ↓
fetchAll() returns items array
    ↓
dishes computed property:
  - Filters items where category = 'menu'
  - Maps to display structure: {id, name, desc, price, persons, image, status}
    ↓
displayDishes computed property:
  - Returns dishes if items.length > 0
  - Falls back to fallbackDishes array if empty
    ↓
Template renders displayDishes[currentSlide]
```

### SuitesSection.vue Data Flow
```
API Call: GET /api/restaurant/inventory
    ↓
fetchAll() returns items array
    ↓
rooms computed property:
  - Filters items where category = 'room' or 'cottage'
  - Maps to display structure: {id, name, description, image, price, max_guests, status}
    ↓
displaySuites computed property:
  - Returns rooms if items.length > 0
  - Falls back to fallbackSuites array if empty
    ↓
Template renders displaySuites[currentIndex] with carousel animation
```

---

## 🚀 Testing Checklist

- [ ] Backend running on `http://localhost:8000`
- [ ] Frontend running on `http://localhost:5173` (or configured port)
- [ ] RestaurantSection shows real menu items (or fallback mockups)
  - [ ] Auto-rotates every 5 seconds
  - [ ] Mobile overlay displays item details
  - [ ] Desktop sidebar shows all information
  - [ ] Loading spinner appears briefly
- [ ] SuitesSection shows real rooms (or fallback mockups)
  - [ ] Previous/next buttons work
  - [ ] Hover overlay shows room details
  - [ ] Carousel slides smoothly
  - [ ] Loading spinner appears briefly
- [ ] No console errors
- [ ] Responsive on mobile, tablet, desktop

---

## 📊 Database to Component Mapping

### Menu Items (category = 'menu')
| Database Field | Component Property | Display |
|---|---|---|
| inventory_id | id | Unique identifier |
| item_name | name | "Poolside Grill & Café" |
| description | desc | Menu item details |
| price | price | "₱1,200" (formatted) |
| max_guests | persons | "Good for 3–5 persons" |
| images/image_url | image | Carousel background |
| status | status | good/low/critical |

### Room Items (category = 'room' or 'cottage')
| Database Field | Component Property | Display |
|---|---|---|
| inventory_id | id | Unique identifier |
| item_name | name | "Deluxe Suite" |
| description | description | Room details |
| price | price | "₱3,500" (formatted) |
| max_guests | max_guests | 2 (capacity indicator) |
| images/image_url | image | Carousel background |
| status | status | good/low/critical |

---

## 🛠️ Code Examples

### Using useInventory in a New Component
```vue
<script setup>
import { ref, computed, onMounted } from 'vue'
import { useInventory } from '@/composables/useInventory'

const { items, loading, error, fetchAll, getItemImage } = useInventory()

// Filter items by your category
const myItems = computed(() => {
  return items.value.filter(item => item.category === 'my_category')
})

// Fetch on mount
onMounted(async () => {
  await fetchAll()
})
</script>
```

### Adding Custom Filtering
```javascript
// In component's computed property
const filteredItems = computed(() => {
  return items.value.filter(item => 
    item.status === 'good' &&
    (item.category === 'menu' || item.category === 'event') &&
    item.price < 5000
  )
})
```

---

## 📝 Files Modified

| File | Changes | Status |
|------|---------|--------|
| `src/composables/useInventory.js` | Created - API layer composable | ✅ NEW |
| `src/components/RestaurantSection.vue` | Integrated API, added fallbacks | ✅ UPDATED |
| `src/components/SuitesSection.vue` | Integrated API, added fallbacks | ✅ UPDATED |
| `src/views/website/HomePage.vue` | No changes needed (children updated) | ✅ WORKING |

---

## ⚠️ Important Notes

1. **API Must Be Running**: Both components require backend API on `http://localhost:8000`
2. **Fallback Data**: If API unavailable, mockup data displays automatically
3. **Loading States**: Users see spinners while data fetches
4. **Image Handling**: `getItemImage()` handles multiple formats from API
5. **Error Handling**: Errors log to console but don't break components
6. **Readonly State**: `items`, `loading`, `error` are readonly for safety

---

## 🔗 Related Documentation

- [API Documentation](../../CAPSTONE%20BACKEND/reservision-backend/API_DOCUMENTATION.md)
- [Backend Setup Guide](../../CAPSTONE%20BACKEND/reservision-backend/README.md)
- [Postman Testing Guide](../../CAPSTONE%20BACKEND/reservision-backend/POSTMAN_TESTING_GUIDE.md)
- [Full Integration Guide](./FRONTEND_API_INTEGRATION_COMPLETE.md)

---

## 🎯 Next Steps

1. **Verify Backend**: Ensure API is running and accessible
2. **Test Components**: Open frontend and scroll to sections
3. **Check Console**: Look for any errors during data fetch
4. **Add More Components**: Use same pattern for other sections needing API integration
5. **Styling Tweaks**: Adjust CSS for your design preferences

---

**Status**: Ready for Testing ✅
**Framework**: Vue 3 Composition API
**Backend**: Express.js + MySQL
**API**: RESTful (`/api/restaurant/inventory`)
