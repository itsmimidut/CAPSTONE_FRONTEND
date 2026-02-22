# Inventory Auto-Deduction System Guide

## Overview
This guide explains the complete inventory auto-deduction system that automatically reduces inventory when customers order food items.

**Flow:**
```
Customer Orders Lemonade (with 2 lemons, 0.5kg sugar, 1L water)
        ↓
System checks if enough ingredients exist
        ↓
Order is created (if sufficient stock)
        ↓
Inventory automatically deducted based on menu-ingredient links
        ↓
Inventory status updated (good, low, critical)
```

---

## Frontend Implementation

### 1. InventorySection.vue Component

#### New Modal: "Link Ingredients to Menu Item"
Located in: `c:\Users\John Rhey Tamares\CAPSTONE_FRONTEND\reservision\src\components\Restaurant\InventorySection.vue`

**Features:**
- Select a menu item (e.g., Lemonade)
- View currently linked ingredients
- Add new ingredients with quantities needed per serving
- Remove incorrect ingredient links
- Save all changes at once

#### Key Functions Added:

1. **fetchAvailableMenus()**
   - Fetches all menu items from backend
   - Populates dropdown for staff selection

2. **handleAddSingleIngredient()**
   - Adds ingredient to temporary buffer
   - Validates to prevent duplicates
   - Allows adding multiple ingredients before saving

3. **handleAddMenuIngredient()**
   - Submits all buffered ingredients to backend
   - Creates menu-ingredient associations
   - Refreshes the view after successful save

4. **handleRemoveIngredient(ingredientId)**
   - Removes ingredient from menu item
   - Updates view immediately

#### Computed Property:
- **selectedMenuCurrentIngredients** - Shows current ingredients for selected menu item

#### State Variables:
```javascript
availableMenus         // List of menu items
selectedMenuId         // Currently selected menu
newIngredient          // New ingredient being added
addedIngredientsBuffer // Temporarily stored ingredients before saving
```

---

## Backend Implementation

Your backend is **ALREADY SET UP** with the following:

### Database Tables
```sql
-- Menu Items
CREATE TABLE menu_items (
    menu_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255),
    price DECIMAL(10,2),
    category VARCHAR(100)
);

-- Inventory
CREATE TABLE inventory (
    inventory_id INT PRIMARY KEY AUTO_INCREMENT,
    item_name VARCHAR(255),
    quantity DECIMAL(10,2),
    unit VARCHAR(50),
    threshold DECIMAL(10,2),
    status ENUM('good', 'low', 'critical')
);

-- Menu-Ingredient Links (The Connection)
CREATE TABLE menu_ingredients (
    id INT PRIMARY KEY AUTO_INCREMENT,
    menu_id INT,
    inventory_id INT,
    quantity_needed DECIMAL(10,2),
    FOREIGN KEY (menu_id) REFERENCES menu_items(menu_id),
    FOREIGN KEY (inventory_id) REFERENCES inventory(inventory_id),
    UNIQUE KEY (menu_id, inventory_id)
);

-- Orders
CREATE TABLE orders (
    order_id INT PRIMARY KEY AUTO_INCREMENT,
    table_id INT,
    status VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Order Items
CREATE TABLE order_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT,
    menu_id INT,
    quantity INT,
    unit_price DECIMAL(10,2),
    FOREIGN KEY (order_id) REFERENCES orders(order_id),
    FOREIGN KEY (menu_id) REFERENCES menu_items(menu_id)
);
```

### API Endpoints (Already Implemented)

#### Menu Ingredients Management
```
GET    /api/restaurant/menu/:menuId/ingredients
       - Get all ingredients for a specific menu item

GET    /api/restaurant/menu-with-ingredients
       - Get all menu items with their linked ingredients

POST   /api/restaurant/menu/:menuId/ingredients
       - Add ingredient to menu item
       Body: { inventory_id, quantity_needed }

PUT    /api/restaurant/menu-ingredients/:id
       - Update ingredient quantity
       Body: { quantity_needed }

DELETE /api/restaurant/menu-ingredients/:id
       - Remove ingredient from menu item

GET    /api/restaurant/menu/:menuId/check-availability
       - Check if enough stock exists for an order
```

#### Orders with Auto-Deduction
```
POST   /api/restaurant/orders
       - Creates order AND automatically deducts inventory
       Body: { table_id, items: [{menu_id, quantity, unit_price}] }
       
       Process:
       1. Validates all ingredients exist in sufficient quantity
       2. Creates order record
       3. Adds order items
       4. DEDUCTS inventory for each ingredient
       5. Updates inventory status (good/low/critical)
       6. Updates table status
```

### Controller Files

**Location:** `c:\Users\John Rhey Tamares\CAPSTONE_BACKEND\reservision-backend\controllers\`

1. **menuIngredientsController.js**
   - `getMenuIngredients()` - Get ingredients for menu item
   - `getAllMenuWithIngredients()` - Get all menus with ingredients
   - `addMenuIngredient()` - Link ingredient to menu
   - `updateMenuIngredient()` - Update quantity needed
   - `deleteMenuIngredient()` - Remove ingredient link
   - `checkMenuAvailability()` - Verify enough stock

2. **ordersController.js**
   - `createOrder()` - **MOST IMPORTANT** - Creates order AND deducts inventory
     - Checks ingredient availability
     - Creates order
     - Deducts inventory for each ingredient
     - Updates inventory status based on threshold
     - Uses database transaction (atomic operation)

### Safety Features (Already Built-in)

1. **Stock Validation**
   - System checks if enough ingredients exist BEFORE creating order
   - Returns error if insufficient stock
   - No order created if validation fails

2. **Automatic Status Update**
   - After deduction, inventory status updates:
     - `critical`: quantity ≤ threshold × 0.25
     - `low`: quantity ≤ threshold
     - `good`: quantity > threshold

3. **Transaction Safety**
   - Uses database transactions
   - If any step fails, entire operation rolled back
   - No partial inventory updates

4. **Duplicate Prevention**
   - UNIQUE constraint on (menu_id, inventory_id)
   - Can't link same ingredient to menu twice

---

## How to Use (Step-by-Step)

### Step 1: Add Inventory Items
1. Go to Inventory Management
2. Click "Add New Item"
3. Enter: Lemon, Quantity: 10, Unit: pcs, Threshold: 2
4. Enter: Sugar, Quantity: 5, Unit: kg, Threshold: 1
5. Enter: Water, Quantity: 10, Unit: L, Threshold: 2
6. Click "Add Item"

### Step 2: Link Ingredients to Menu Items
1. Click "Link Ingredients to Menu" button (in banner)
2. Select "Lemonade" from dropdown
3. Click "Add Ingredient"
4. Select "Lemon" and enter "2" (pcs)
5. Click green "Add" button
6. Click "Add Ingredient" again
7. Select "Sugar" and enter "0.5" (kg)
8. Click green "Add" button
9. Click "Add Ingredient" one more time
10. Select "Water" and enter "1" (L)
11. Click green "Add" button
12. Click "Save Links"

### Step 3: View Menu-Ingredient Links
1. Click "View Menu Links" button
2. See which menus use which ingredients
3. Verify quantities

### Step 4: Customer Places Order
**When customer orders 2 Lemonades:**
- System automatically checks: Do we have 4 lemons (2×2), 1kg sugar (2×0.5), 2L water (2×1)?
- If YES: Order created, inventory updated
- If NO: Order rejected, user sees which ingredient is missing

**Inventory after order:**
- Lemons: 10 → 6 (deducted 4)
- Sugar: 5 → 4 (deducted 1)
- Water: 10 → 8 (deducted 2)

---

## API Request Examples

### Link Ingredient to Menu
```bash
POST http://localhost:8000/api/restaurant/menu/5/ingredients
Content-Type: application/json

{
  "inventory_id": 3,
  "quantity_needed": 2
}
```

### Create Order (With Auto-Deduction)
```bash
POST http://localhost:8000/api/restaurant/orders
Content-Type: application/json

{
  "table_id": 1,
  "items": [
    {
      "menu_id": 5,
      "quantity": 2,
      "unit_price": 75
    }
  ]
}
```

### Check Menu Availability
```bash
GET http://localhost:8000/api/restaurant/menu/5/check-availability?quantity=2

Response:
{
  "success": true,
  "available": true,
  "ingredients": [
    {
      "item_name": "Lemon",
      "quantity_needed": 2,
      "inventory_quantity": 10,
      "unit": "pcs",
      "has_enough": true
    }
  ]
}
```

---

## Testing the System

### Using Postman

1. **Add to Menu Links**
   - Method: POST
   - URL: `http://localhost:8000/api/restaurant/menu/1/ingredients`
   - Body (JSON):
   ```json
   {
     "inventory_id": 1,
     "quantity_needed": 2
   }
   ```

2. **Check Availability**
   - Method: GET
   - URL: `http://localhost:8000/api/restaurant/menu/1/check-availability?quantity=1`

3. **Create Order**
   - Method: POST
   - URL: `http://localhost:8000/api/restaurant/orders`
   - Body (JSON):
   ```json
   {
     "table_id": 1,
     "items": [
       {
         "menu_id": 1,
         "quantity": 1,
         "unit_price": 100
       }
     ]
   }
   ```

4. **View All Menu Links**
   - Method: GET
   - URL: `http://localhost:8000/api/restaurant/menu-with-ingredients`

---

## Troubleshooting

### Ingredients Not Appearing in Modal
- ✓ Ensure inventory items are added first
- ✓ Check browser console for API errors
- ✓ Verify backend is running on port 8000

### Order Rejected (Insufficient Stock)
- Check inventory quantity vs threshold
- System calculates: `quantity_needed × order_quantity`
- Example: Lemonade needs 2 lemons, customer orders 3 = needs 6 lemons total

### Quantity Too Low After Order
- This is correct! Inventory deducts based on ingredient usage
- Example: If 100 items in stock, order 2 units of menu item that uses 3 items each = 100 - 6 = 94

---

## Summary

Your system now has:
✅ Frontend modal to link ingredients to menu items  
✅ Backend API endpoints for menu-ingredient management  
✅ Automatic inventory deduction on order  
✅ Stock validation before order creation  
✅ Automatic status updates (good/low/critical)  
✅ Safety with database transactions  
✅ Duplicate prevention  

**The system is ready to use!**
