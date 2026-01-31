IMAGE UPLOAD FIX - CORRECT PROJECT STRUCTURE
=============================================

## CORRECT PROJECT PATHS
✅ Frontend: c:\Users\John Rhey Tamares\Downloads\CAPSTONE FRONTEND\reservision
✅ Backend:  c:\Users\John Rhey Tamares\Downloads\CAPSTONE BACKEND\reservision-backend

## BACKEND SETUP (reservision-backend)
- Port: 8000
- Technology: Node.js + Express (ES modules)
- Database: MySQL (inventory_items table)
- Image Storage: DATABASE (as base64 JSON strings, NOT disk files)

Server endpoints:
- GET  /api/rooms         → Fetch all rooms
- POST /api/rooms         → Create room
- PUT  /api/rooms/:id     → Update room
- DELETE /api/rooms/:id   → Delete room

## HOW IMAGES WORK

### Backend Design:
The backend stores images as base64 encoded strings in the database:
```
inventory_items.images = '["data:image/jpeg;base64,...", "data:image/png;base64,..."]'
```

This is a JSON array stored in a LONGTEXT column.
No multer, no disk file storage - everything is in the database.

### Flow:
1. User selects image in modal
2. FileReader converts image to base64 data URL
3. Preview displayed immediately
4. User clicks "Save Room"
5. Frontend sends all images as JSON array (base64 strings)
6. Backend stores the entire array in database
7. Next load: Images are fetched as base64 and displayed directly

### Storage Advantages:
✅ No disk space needed
✅ Images backup with database
✅ Simple deployment (no public folder management)
✅ No broken image links
✅ Images displayed directly from data URLs

## FILES UPDATED

### 1. Frontend Store (stores/rooms.js)
- ✅ Changed backend URL to http://localhost:8000
- ✅ Simplified saveRoom() to send JSON (not FormData)
- ✅ Images sent as array of base64 strings

### 2. Room Modal (RoomModal.vue)
- ✅ Removed "files" array (not needed for this backend)
- ✅ FileReader converts images to base64
- ✅ Base64 strings stored in form.images
- ✅ Detailed comments explaining the flow

### 3. Room Card (RoomCard.vue)
- ✅ Updated BACKEND_URL to http://localhost:8000
- ✅ Images displayed directly from base64 data URLs
- ✅ No need to prepend paths (already complete data URLs)

## HOW TO TEST

### Step 1: Start Backend
```bash
cd "c:\Users\John Rhey Tamares\Downloads\CAPSTONE BACKEND\reservision-backend"
npm start
```
Check console: "Server running at http://localhost:8000"

### Step 2: Start Frontend
```bash
cd "c:\Users\John Rhey Tamares\Downloads\CAPSTONE FRONTEND\reservision"
npm run dev
```
Check: http://localhost:5173

### Step 3: Test Upload
1. Navigate to Admin → Rooms
2. Click "Add New Room"
3. Fill details (name, type, price, etc.)
4. Drag & drop or click to select images
5. **Preview appears immediately** (base64 displayed)
6. Click primary image to set thumbnail
7. Click "Save Room"
8. Room appears in list with images ✓

### Step 4: Verify in Database
Open phpMyAdmin:
1. Database: eduardos
2. Table: inventory_items
3. View new room
4. "images" column: shows JSON array of base64 strings

## TROUBLESHOOTING

### ❌ 404 Backend Error
Solution: Check if backend is running on port 8000
```bash
cd CAPSTONE BACKEND/reservision-backend
npm start
```

### ❌ Images don't display
Solution 1: Check browser console (F12)
- Image data should be base64 format: data:image/...
- Should NOT be /uploads/rooms/... (that's for disk storage)

Solution 2: Verify database
- Open phpMyAdmin → inventory_items
- Check if images column has JSON array with base64

### ❌ "Cannot load image"
Solution: Base64 is stored in database but not displaying
- Check if room.images is array of strings
- Each string should start with "data:image/"

### ❌ Save fails silently
Solution: Check browser Network tab (F12)
- POST /api/rooms should return 200 with success
- If error, check request payload format

## KEY DIFFERENCES FROM APPDEV PROJECT

APPDEV (Old):
- Backend port: 3000
- Images stored: On disk (/public/uploads/rooms/)
- Upload method: Multer + FormData
- File paths: Relative (/uploads/rooms/abc.jpg)

CAPSTONE BACKEND (Correct):
- Backend port: 8000
- Images stored: Database (base64 JSON)
- Upload method: JSON with base64 strings
- Data format: Complete data URLs (data:image/...)

## IMPORTANT NOTES

✅ Images are stored as BASE64 in the database
✅ No disk files needed for room images
✅ Each image is a self-contained data URL
✅ Previews display instantly using FileReader
✅ No CORS issues with image paths
✅ Images backup with database automatically

## DATABASE SCHEMA

inventory_items table:
```
- item_id (INT) PRIMARY KEY AUTO_INCREMENT
- room_number (VARCHAR)
- name (VARCHAR)
- category (VARCHAR)
- category_type ENUM('room', 'cottage')
- max_guests (INT)
- price (DECIMAL)
- description (TEXT)
- images (LONGTEXT) ← JSON array of base64 strings
- status ENUM('Available', 'Occupied', 'Under Maintenance')
- promo TINYINT
- primaryImageIndex INT
- created_at TIMESTAMP
```

---

Backend now correctly stores images as JSON base64 in database!
