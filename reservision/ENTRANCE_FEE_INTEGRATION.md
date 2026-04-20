# Entrance Fee Configuration Module - Integration Guide

## Overview

The Entrance Fee Configuration Module is a complete full-stack feature for managing and calculating entrance fees for resort visitors. It includes backend APIs, Pinia state management, and Vue components for both admin and customer interfaces.

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Vue Components                        │
├─────────────────────────────────────────────────────────┤
│ • EntranceFeeCalculator.vue  (Customer Calculator)       │
│ • EntranceRatesAdmin.vue     (Admin Dashboard)           │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│              Pinia Store                                 │
│    (useEntranceRatesStore)                              │
├─────────────────────────────────────────────────────────┤
│ • State: rates, loading, filters, pagination            │
│ • Actions: fetch, create, update, delete, toggle        │
│ • Getters: filteredRates, paginationInfo                │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│              Axios API Service                           │
│        (entranceRatesAPI)                               │
├─────────────────────────────────────────────────────────┤
│ • getAll(params)       → GET /entrance-rates            │
│ • getByDate(date)      → GET /entrance-rates/by-date    │
│ • getById(id)          → GET /entrance-rates/:id        │
│ • create(data)         → POST /entrance-rates           │
│ • update(id, data)     → PUT /entrance-rates/:id        │
│ • delete(id)           → DELETE /entrance-rates/:id     │
│ • toggleStatus(id)     → PATCH /entrance-rates/:id/status
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│              Express Backend                             │
│    (Node.js + MySQL)                                    │
├─────────────────────────────────────────────────────────┤
│ • Controllers: CRUD operations, pagination, filtering   │
│ • Services: Fee calculation, day-type detection         │
│ • Database: entrance_rates table with indexes           │
└─────────────────────────────────────────────────────────┘
```

## Frontend Components

### 1. EntranceFeeCalculator.vue (Customer-Facing)

**Purpose:** Allow customers to calculate entrance fees before booking

**Features:**
- Date picker with day-type detection (weekday/weekend/holiday)
- Guest count selectors (adults, children, seniors)
- Real-time fee calculation
- Breakdown display by category
- Integrated with Pinia store
- Emits events for parent component integration

**Usage in Booking Flow:**

```vue
<template>
  <div class="booking-page">
    <!-- Booking Form -->
    <BookingForm />
    
    <!-- Entrance Fee Calculator -->
    <EntranceFeeCalculator
      @fee-calculated="handleFeeCalculated"
      @add-to-booking="handleAddFeeToBooking"
    >
      <template #action="{ total, breakdown }">
        <button @click="addEntranceFeeItem(total)">
          Add Entrance Fee (₱{{ total }})
        </button>
      </template>
    </EntranceFeeCalculator>
  </div>
</template>

<script setup>
import EntranceFeeCalculator from '@/components/EntranceFeeCalculator.vue';

const handleFeeCalculated = (result) => {
  console.log('Fee calculated:', result);
  // Update booking summary
};

const handleAddFeeToBooking = (feeData) => {
  // Add to cart/booking
  bookingStore.addItem({
    type: 'entrance_fee',
    ...feeData
  });
};
</script>
```

### 2. EntranceRatesAdmin.vue (Admin Interface)

**Purpose:** Manage entrance rates and rates configuration

**Features:**
- Paginated table of all rates
- Search and filter capabilities
- CRUD operations (Create, Read, Update, Delete)
- Status toggle (Active/Hidden)
- Modal forms for add/edit
- Delete confirmation dialog
- Toast notifications
- Loading and error states

**Importing in Admin Layout:**

```vue
<template>
  <AdminLayout>
    <EntranceRatesAdmin />
  </AdminLayout>
</template>

<script setup>
import EntranceRatesAdmin from '@/components/Admin/EntranceRatesAdmin.vue';
</script>
```

## Frontend Integration Points

### In stores/index.js (if using centralized Pinia setup):

```javascript
import { useEntranceRatesStore } from './entranceRatesStore';

export default {
  entranceRates: useEntranceRatesStore
};
```

### In main.js (Pinia initialization):

```javascript
import { createPinia } from 'pinia';

const pinia = createPinia();
app.use(pinia);
```

## Backend Integration

### 1. Database Setup

Run the migration script:

```bash
mysql -u your_user -p your_database < CREATE_ENTRANCE_RATES_TABLE.sql
```

Sample data is included. Rates are configured with:
- **name**: Rate category (Adult, Child, Senior)
- **price**: Cost per person in PHP
- **day_type**: weekday, weekend, or holiday
- **age_min/age_max**: Age eligibility (optional)
- **start_time/end_time**: Time window (optional)
- **status**: active or hidden

### 2. Express Routes Setup

Register routes in your main app.js:

```javascript
import entranceRatesRoutes from './routes/entranceRates.js';

app.use('/api/entrance-rates', entranceRatesRoutes);
```

### 3. Fee Calculation Service

Import and use the calculation service:

```javascript
import { computeEntranceFee } from './services/entranceFeeService.js';

// In a booking confirmation endpoint
const feeData = await computeEntranceFee({
  adults: 2,
  children: 1,
  seniors: 0,
  date: '2026-04-18'
});

// Returns:
// {
//   success: true,
//   total: 1500.00,
//   breakdown: {
//     adults: { count: 2, price: 500, subtotal: 1000 },
//     children: { count: 1, price: 500, subtotal: 500 },
//     seniors: { count: 0, price: 0, subtotal: 0 }
//   },
//   dayType: 'weekday',
//   date: '2026-04-18'
// }
```

## API Endpoints Reference

### GET /api/entrance-rates
**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 10)
- `search` (string) - search by name
- `day_type` (string) - filter by weekday|weekend|holiday
- `status` (string) - filter by active|hidden

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "name": "Adult",
      "price": "500.00",
      "day_type": "weekday",
      "age_min": 18,
      "age_max": 60,
      "status": "active",
      "created_at": "2026-04-18 10:00:00"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 6,
    "totalPages": 1
  }
}
```

### GET /api/entrance-rates/by-date
**Query Parameters:**
- `date` (string, YYYY-MM-DD format) - required

Returns rates applicable for a specific date (auto-detects weekday/weekend)

### POST /api/entrance-rates
**Request Body:**
```json
{
  "name": "Adult",
  "price": 500,
  "day_type": "weekday",
  "age_min": 18,
  "age_max": null,
  "start_time": "08:00",
  "end_time": "18:00"
}
```

### PUT /api/entrance-rates/:id
Same format as POST, updates existing rate

### DELETE /api/entrance-rates/:id
Deletes a rate

### PATCH /api/entrance-rates/:id/status
Toggles status between active and hidden

## State Management (Pinia)

### Store: useEntranceRatesStore

#### State
```javascript
rates: []               // Array of entrance rates
loading: false         // Loading indicator
error: null           // Error message
currentPage: 1        // Current pagination page
totalPages: 1         // Total pages
totalRecords: 0       // Total record count
pageSize: 10          // Items per page
filters: {            // Current active filters
  search: '',
  day_type: '',
  status: ''
}
selectedRate: null    // Rate being edited
isModalOpen: false    // Modal visibility
modalMode: 'view'     // 'view', 'edit', 'create'
```

#### Actions
```javascript
// Fetch rates with pagination and filters
await store.fetchRates(page)

// Fetch rates for a specific date
await store.fetchRatesByDate(date)

// Get single rate by ID
await store.getRateById(id)

// Create new rate
await store.createRate(rateData)

// Update existing rate
await store.updateRate(id, rateData)

// Delete rate
await store.deleteRate(id)

// Toggle rate status
await store.toggleRateStatus(id)

// Update filters and refetch
await store.updateFilters(newFilters)

// Clear all filters
await store.clearFilters()

// Navigate to page
await store.goToPage(pageNumber)
```

#### Getters
```javascript
filteredRates      // Filtered list of rates
paginationInfo     // Pagination metadata
isLoading          // Current loading state
```

## Usage Examples

### Example 1: Simple Fee Calculator
```vue
<template>
  <EntranceFeeCalculator @add-to-booking="saveToBooking" />
</template>

<script setup>
const saveToBooking = (feeData) => {
  // feeData includes: type, visitDate, guestCounts, breakdown, total
  bookingStore.addItem(feeData);
};
</script>
```

### Example 2: Inline Integration in Booking Form
```vue
<template>
  <div class="booking-wizard">
    <Step1RoomSelection />
    <Step2GuestInfo />
    <Step3EntranceFees>
      <EntranceFeeCalculator />
    </Step3EntranceFees>
    <Step4Summary />
  </div>
</template>
```

### Example 3: Admin Dashboard Page
```vue
<template>
  <div class="admin-container">
    <AdminHeader title="Resort Settings" />
    <AdminSidebar />
    <main class="admin-main">
      <EntranceRatesAdmin />
    </main>
  </div>
</template>

<script setup>
import EntranceRatesAdmin from '@/components/Admin/EntranceRatesAdmin.vue';
</script>
```

## Environment Variables

**Frontend (.env.local):**
```env
VITE_API_URL=http://localhost:3001/api
```

**Backend (.env):**
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=password
DB_NAME=reservision
NODE_ENV=development
API_PORT=3001
```

## Key Features

✅ **Complete CRUD Operations** - Create, read, update, delete rates
✅ **Dynamic Filtering** - Search, day-type, and status filters
✅ **Real-time Calculation** - Calculate fees based on date and guest count
✅ **Automatic Day-Type Detection** - Weekday/weekend/holiday rates
✅ **Pagination Support** - Handle large rate lists efficiently
✅ **Status Management** - Toggle rates between active/hidden
✅ **Age-Based Pricing** - Different rates for children/seniors
✅ **Time Windows** - Optional time-based rate restrictions
✅ **Responsive Design** - Mobile-friendly interfaces
✅ **Error Handling** - Comprehensive error management
✅ **Loading States** - Visual feedback during operations
✅ **Toast Notifications** - User feedback for actions

## File Structure

```
Backend:
├── routes/
│   └── entranceRates.js                 (7 endpoints)
├── controllers/
│   └── entranceRatesController.js        (7 CRUD functions)
├── services/
│   └── entranceFeeService.js            (Fee calculation)
└── migrations/
    └── CREATE_ENTRANCE_RATES_TABLE.sql  (Database schema)

Frontend:
├── components/
│   ├── EntranceFeeCalculator.vue        (Customer calculator)
│   └── Admin/
│       └── EntranceRatesAdmin.vue       (Admin dashboard)
├── services/
│   └── entranceRatesAPI.js              (Axios wrapper)
└── stores/
    └── entranceRatesStore.js            (Pinia state)
```

## Testing Checklist

- [ ] **Admin Dashboard**
  - [ ] Load rates list
  - [ ] Search by name
  - [ ] Filter by day type
  - [ ] Filter by status
  - [ ] Create new rate
  - [ ] Edit existing rate
  - [ ] Toggle status
  - [ ] Delete rate with confirmation
  - [ ] Pagination navigation

- [ ] **Customer Calculator**
  - [ ] Date picker validation (no past dates)
  - [ ] Guest count controls (increment/decrement)
  - [ ] Real-time calculation on count change
  - [ ] Date-based rate application
  - [ ] Breakdown display
  - [ ] Add to booking event emission

- [ ] **API Integration**
  - [ ] All endpoints respond with correct status codes
  - [ ] Error handling and validation
  - [ ] Pagination parameters
  - [ ] Filter parameters
  - [ ] Database persistence

## Troubleshooting

**Calculator not calculating:**
- Ensure rates are loaded and status is 'active'
- Check that date is in correct YYYY-MM-DD format
- Verify guest count is > 0

**Empty rates list:**
- Run database migration (CREATE_ENTRANCE_RATES_TABLE.sql)
- Verify rates have status 'active'
- Check API endpoint is accessible

**Modal not opening:**
- Ensure Teleport is working (check Vue version)
- Verify body element exists in DOM
- Check z-index values in CSS

**Pinia store errors:**
- Ensure Pinia is initialized in main.js
- Verify store import path is correct
- Check for circular dependencies in imports

## Future Enhancements

- [ ] Holiday calendar integration
- [ ] Discount/promo code support
- [ ] Group rate calculations
- [ ] Rate history and versioning
- [ ] Seasonal rate management
- [ ] Multi-language support
- [ ] Rate templates/presets
- [ ] Bulk import/export
- [ ] Advanced reporting
- [ ] Rate usage analytics
