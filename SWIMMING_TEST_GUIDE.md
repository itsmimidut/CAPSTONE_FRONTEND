# Swimming Lesson Integration - Quick Test Guide

## Pre-Testing Checklist
- [ ] Node.js backend running on `localhost:8000`
- [ ] Vue frontend running on `localhost:5173`
- [ ] MySQL database connected
- [ ] Open browser console (F12) to see logs

## Test 1: Book a Swimming Class
1. Navigate to `http://localhost:5173/swimming`
2. Scroll to "Book a Class Session" section
3. Click "Book Now" button → SwimmingClassBookingModal appears
4. Fill the form:
   - Full Name: `Test User`
   - Email: `test@example.com`
   - Phone: `+63999999999`
   - Lesson Type: `Group Lessons`
   - Skill Level: `Beginner`
   - Preferred Date: Pick any future date
   - Preferred Time: `10:00 AM`
   - Number of Participants: `2`
   - Special Notes: `First time swimming`
5. Check "I agree to terms"
6. Click "Submit"
7. **Expected Results:**
   - Console shows: `POST /api/swimming/class-bookings` success
   - Page redirects to `/confirmation`
   - Displays "🏊 Swimming Lesson Enrolled!"
   - Shows booking reference starting with `SWM`
   - Shows lesson type as "Group Lessons"
   - Shows swimmer icon (🏊)

## Test 2: Verify Admin Reservations Visibility
1. Navigate to admin dashboard (typically `/admin` or admin login page)
2. Go to "Reservation Management"
3. Look for the booking you just created:
   - Guest Name: `Test User`
   - Check-in: The date you selected
   - Booking Type: Should show `🏊 Swimming: Group Lessons` ← **WITH CYAN BADGE**
4. **Expected Results:**
   - Swimming booking appears in list
   - Cyan badge with 🏊 icon clearly visible
   - Label shows lesson type (Group Lessons)
   - Can toggle between table and card views

## Test 3: Filter Reservations by Date
1. In ReservationManagement, use date filters
2. Set "From" date to the swimming class date (or earlier)
3. Set "To" date to the swimming class date (or later)
4. Click "Apply"
5. **Expected Results:**
   - Swimming booking appears in filtered results
   - Pagination updates
   - Booking type still shows `🏊 Swimming: Group Lessons`

## Test 4: Edit/Cancel Swimming Booking (Admin)
1. In ReservationManagement, find your swimming booking
2. Try clicking "Confirm" button (if status is pending)
3. Try clicking "Cancel" button
4. Try clicking "Delete" button
5. **Expected Results:**
   - All CRUD operations work same as room bookings
   - Status updates reflect in both table and card views

## Test 5: Confirmation Page Navigation
1. From ConfirmationPage, click "Enroll Another Class"
2. **Expected Results:**
   - Routes to `/swimming` page
   - Can book another class session
   - For regular bookings, "Make Another Booking" routes to `/reservation`

## Test 6: Multiple Service Types (Rooms + Swimming)
1. Book a room from regular reservation page
2. Book a swimming class from swimming page
3. Go to admin ReservationManagement
4. **Expected Results:**
   - Both bookings visible
   - Room shows: `🏨 Room` or `🏠 Cottage` (amber/blue badge)
   - Swimming shows: `🏊 Swimming: {type}` (cyan badge)
   - Different colors help identify booking types at a glance

## Console Logs to Watch For

### Backend Success
```
// POST /api/swimming/class-bookings
POST request body: {...fullName, email, phone, lessonType...}
✅ Customer created/updated
✅ Booking inserted with ID: 1234
✅ Booking item inserted with type='Event'
✅ Booking log recorded
Response: {success: true, bookingId: 1234, bookingReference: "SWM87654321"}
```

### Frontend Success
```
📡 Fetching from POST /api/swimming/class-bookings
✅ Response success
🎯 Routing to /confirmation
📧 Email from URL: test@example.com
🏊 Service type: swimming
📚 Lesson type: Group Lessons
```

## Troubleshooting

### Issue: Modal doesn't appear
- Check: Is Swimming.vue properly loaded?
- Check console for JavaScript errors
- Verify SwimmingClassBookingModal.vue exists at `/public/SwimmingClassBookingModal.vue`

### Issue: POST fails with 500 error
- Check backend logs for database errors
- Verify customers table schema has required columns
- Verify database connection in backend

### Issue: Booking doesn't appear in admin
- Check backend `/api/bookings/admin/reservations` returns data
- Verify booking's `check_in_date` matches filter dates
- Check browser Network tab to see API response

### Issue: Confirmation page shows generic message
- Check URL query params: `?service=swimming&lessonType=...`
- Verify ConfirmationPage.vue reads these params correctly
- Check browser console for getHeading() output

### Issue: Cyan badge not visible
- Check CSS is loaded (check browser DevTools > Styles)
- Verify badge-swimming class is applied to element
- Check Tailwind CSS compilation (if not scoped CSS)

## Browser DevTools Tips

### Network Tab
1. In ReservationManagement, watch for requests to:
   - `GET /api/bookings/admin/reservations?page=1&limit=15`
2. Verify response includes your swimming booking with:
   - `items_summary` containing "Swimming Lesson"
   - `item_type`: "Event"

### Console Tab
1. Look for debug logs prefixed with 🏊, 📧, 📡, ✅, ❌
2. Search for "Swimming" to filter relevant logs
3. In ConfirmationPage, check: `🏊 Service type: swimming`

### Elements Inspector
1. Select the booking type badge in admin table
2. Verify class shows `badge-swimming`
3. Verify computed styles show cyan background color

## Performance Notes

- Swimming bookings use same database tables as rooms → no performance impact
- Admin query is unchanged → no slowdown
- Only one additional POST endpoint added
- All logic is contained in swimming.js routes

## Security Notes

- Email-based duplicate prevention (customer matching)
- Transaction rollback if any step fails
- Audit logging in booking_logs table
- Same validation/auth flow as regular bookings

---

**Questions?** Check the SWIMMING_INTEGRATION_COMPLETE.md for full documentation.
