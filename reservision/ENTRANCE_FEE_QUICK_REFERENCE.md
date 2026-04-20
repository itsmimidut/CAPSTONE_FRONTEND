# Entrance Fee Module - Quick Reference

## 📁 Files Created

### Backend (Node.js + MySQL)

**Location:** `CAPSTONE_BACKEND/reservision-backend/`

1. **CREATE_ENTRANCE_RATES_TABLE.sql**
   - Database migration with schema
   - Sample entrance rates data
   - Indexed on: day_type, status, name

2. **controllers/entranceRatesController.js**
   - `getRates()` - Get paginated/filtered rates
   - `getRateById()` - Get single rate
   - `createRate()` - Create new rate
   - `updateRate()` - Update existing rate
   - `deleteRate()` - Delete rate
   - `toggleStatus()` - Toggle active/hidden
   - `getRatesByDate()` - Get rates for specific date

3. **routes/entranceRates.js**
   - 7 RESTful endpoints
   - Proper HTTP methods (GET, POST, PUT, DELETE, PATCH)
   - Query parameter support

4. **services/entranceFeeService.js**
   - `computeEntranceFee()` - Calculate total fee
   - `detectDayType()` - Determine weekday/weekend
   - `findRateForAge()` - Match guest age to rate

### Frontend (Vue 3 + Pinia)

**Location:** `CAPSTONE_FRONTEND/reservision/src/`

1. **components/EntranceFeeCalculator.vue**
   - Customer-facing calculator
   - Guest count controls
   - Real-time calculation
   - Breakdown display
   - Emits: `fee-calculated`, `add-to-booking`

2. **components/Admin/EntranceRatesAdmin.vue**
   - Full admin dashboard
   - Table with pagination
   - Search & filter
   - CRUD modals
   - Status toggle
   - Toast notifications

3. **services/entranceRatesAPI.js**
   - Axios wrapper for all endpoints
   - Error handling
   - Base URL configuration

4. **stores/entranceRatesStore.js**
   - Pinia store (Composition API)
   - State, actions, getters
   - Pagination management
   - Filter handling
   - Modal state

5. **views/BookingExample.vue**
   - 4-step booking wizard
   - Integrates EntranceFeeCalculator
   - Room selection, guest info, fees, review
   - Complete example

### Documentation

1. **ENTRANCE_FEE_INTEGRATION.md**
   - Complete integration guide
   - Architecture diagram
   - API reference
   - Usage examples
   - Troubleshooting

---

## 🚀 Quick Start

### 1. Backend Setup

```bash
# Run migration
mysql -u root -p reservision < CREATE_ENTRANCE_RATES_TABLE.sql

# Add to your Express app
import entranceRatesRoutes from './routes/entrance Rates.js';
app.use('/api/entrance-rates', entranceRatesRoutes);
```

### 2. Frontend Setup

```vue
<!-- Register in your main booking component -->
<EntranceFeeCalculator 
  @add-to-booking="saveToBooking"
/>

<!-- Import store in components that need it -->
<script setup>
import { useEntranceRatesStore } from '@/stores/entranceRatesStore';
const store = useEntranceRatesStore();
</script>
```

### 3. Environment Variables

**.env.local (Frontend)**
```env
VITE_API_URL=http://localhost:3001/api
```

---

## 📊 Data Flow

```
User selects date + guests
         ↓
EntranceFeeCalculator calls store.fetchRatesByDate()
         ↓
Store calls entranceRatesAPI.getByDate()
         ↓
API calls backend GET /entrance-rates/by-date
         ↓
Backend uses computeEntranceFee() to calculate
         ↓
Result returns through store → component
         ↓
Display breakdown & emit add-to-booking event
```

---

## 🎯 Key Features

✅ **Complete CRUD** - Full database operations
✅ **Real-time Calculation** - Instant fee updates
✅ **Admin Dashboard** - Manage rates easily
✅ **Responsive UI** - Mobile-friendly
✅ **State Management** - Pinia integration
✅ **API Integration** - Axios wrapper
✅ **Error Handling** - Comprehensive
✅ **Pagination** - Handle large datasets
✅ **Filtering** - Search & filter rates
✅ **Age-based Pricing** - Different rates per age group

---

## 🔧 Common Tasks

### Add Entrance Fee to Booking

```javascript
const bookingStore = useBookingStore();

const handleAddTob = (feeData) => {
  // feeData = {
  //   type: 'entrance_fee',
  //   visitDate: '2026-04-18',
  //   guestCounts: { adults: 2, children: 1, seniors: 0 },
  //   breakdown: { adults: {}, children: {}, seniors: {} },
  //   total: 1500
  // }
  
  bookingStore.addItem(feeData);
};
```

### Load All Rates (Admin)

```javascript
const store = useEntranceRatesStore();

onMounted(async () => {
  await store.fetchRates(1); // Page 1
});
```

### Calculate Fee Programmatically

```javascript
import { computeEntranceFee } from '@/services/entranceFeeService.js';

const result = await computeEntranceFee({
  adults: 2,
  children: 1,
  seniors: 0,
  date: '2026-04-18'
});

console.log(result.total); // ₱1500
```

### Filter Rates

```javascript
const store = useEntranceRatesStore();

await store.updateFilters({
  search: 'Adult',
  day_type: 'weekday',
  status: 'active'
});
```

---

## 📱 Component APIs

### EntranceFeeCalculator Props
None (uses store directly)

### EntranceFeeCalculator Events
- `@fee-calculated="handler(result)"`
- `@add-to-booking="handler(feeData)"`

### EntranceRatesAdmin Props
None (uses store directly)

---

## 🧪 Testing Checklist

- [ ] Load rates in admin
- [ ] Create new rate
- [ ] Edit rate
- [ ] Delete rate with confirmation
- [ ] Toggle rate status
- [ ] Filter by day type
- [ ] Search by name
- [ ] Calculate fee with date picker
- [ ] Increment/decrement guest counts
- [ ] Breakdown calculation
- [ ] Add to booking

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| No rates loading | Check database migration ran, verify API URL |
| Calculator not calculating | Ensure rates exist with status='active' |
| Pinia store error | Verify pinia initialized in main.js |
| Modal not opening | Check Teleport in DOM, verify z-index |
| API 404 errors | Ensure routes registered in Express app |

---

## 📚 File Structure

```
Backend:
├── CREATE_ENTRANCE_RATES_TABLE.sql
├── controllers/entranceRatesController.js
├── routes/entranceRates.js
└── services/entranceFeeService.js

Frontend:
├── components/
│   ├── EntranceFeeCalculator.vue
│   └── Admin/EntranceRatesAdmin.vue
├── services/entranceRatesAPI.js
├── stores/entranceRatesStore.js
├── views/BookingExample.vue
└── ENTRANCE_FEE_INTEGRATION.md
```

---

## 🔗 Integration Points

### In Booking Flow
→ Add `<EntranceFeeCalculator>` component to booking wizard

### In Admin Dashboard
→ Add route that renders `<EntranceRatesAdmin>`

### In Checkout
→ Calculate fee using `computeEntranceFee()` service

### In Booking Confirmation
→ Display entrance fee breakdown in order summary

---

## 💾 API Endpoints Summary

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/entrance-rates` | List rates (paginated) |
| GET | `/entrance-rates/:id` | Get single rate |
| GET | `/entrance-rates/by-date?date=YYYY-MM-DD` | Get rates for date |
| POST | `/entrance-rates` | Create rate |
| PUT | `/entrance-rates/:id` | Update rate |
| DELETE | `/entrance-rates/:id` | Delete rate |
| PATCH | `/entrance-rates/:id/status` | Toggle status |

---

## 🎨 Customization

### Change Theme Colors
Edit CSS variables in component `<style scoped>`:
```css
--color-primary: #2B6CB0;        /* Blue */
--color-primary-dark: #1e3a5f;
--color-gold: #f4c400;            /* Gold accents */
```

### Modify Rate Categories
Update sample data in `CREATE_ENTRANCE_RATES_TABLE.sql`:
```sql
INSERT INTO entrance_rates (name, price, ...) 
VALUES ('Student', 350, ...);
```

### Change Pagination Size
In store: `pageSize.ref(20)` (default is 10)

---

## ⚡ Performance Tips

- ✅ Rates are paginated (default 10 per page)
- ✅ Indexes on frequently-queried columns
- ✅ Filters reduce result set before pagination
- ✅ Lazy-load rates only when needed
- ✅ Cache rates in Pinia store
- ✅ Use computed getters instead of methods

---

## 📞 Support

Refer to **ENTRANCE_FEE_INTEGRATION.md** for:
- Detailed architecture
- Full API documentation
- Usage examples
- Troubleshooting guide
- Future enhancements

