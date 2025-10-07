# ✅ Order Code Feature Added

## What Was Added

### **Unique Order Code Generation**

Every order now gets a unique order code with the format: `ORD-YEAR-RANDOM6`

**Examples:**

- `ORD-2025-9F3C21`
- `ORD-2025-A8B4D2`
- `ORD-2025-XY9K47`

## Changes Made

### 1. **Database Schema** (`prisma/schema.prisma`)

```prisma
model order {
  id             Int             @id @default(autoincrement())
  orderCode      String          @unique  // ✅ NEW: Unique order code
  userId         Int
  status         OrderStatus     @default(PENDING)
  total          Float
  deliveryCharge Float           @default(0)
  createdAt      DateTime        @default(now())
  updatedAt      DateTime        @updatedAt
  items          order_item[]
  shipping       order_shipping?
  user           User            @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("orders")
}
```

### 2. **Orders Service** (`src/orders/orders.service.ts`)

- ✅ Added `generateUniqueOrderCode()` helper function
- ✅ Checks database to ensure code is truly unique
- ✅ Retries up to 10 times if duplicate is found
- ✅ Automatically called during checkout

### 3. **Migration Applied**

- ✅ Existing orders received auto-generated order codes
- ✅ New orders will get codes in format `ORD-YEAR-RANDOM6`
- ✅ Database enforces uniqueness constraint

## How It Works

### Order Code Generation Logic:

1. **Format:** `ORD-{YEAR}-{RANDOM6}`
2. **Random Part:** 6 uppercase alphanumeric characters (36^6 = ~2 billion combinations)
3. **Uniqueness Check:** Queries database before confirming
4. **Retry Logic:** If duplicate found, generates new code (max 10 attempts)

### Code Example:

```typescript
// Generates: ORD-2025-9F3C21
const year = new Date().getFullYear(); // 2025
const randomPart = Math.random().toString(36).substr(2, 6).toUpperCase(); // 9F3C21
const orderCode = `ORD-${year}-${randomPart}`; // ORD-2025-9F3C21
```

## API Response

### Checkout Response Now Includes Order Code:

```json
{
  "id": 4,
  "orderCode": "ORD-2025-9F3C21",  // ✅ NEW
  "userId": 1,
  "status": "PENDING",
  "total": 330,
  "deliveryCharge": 80,
  "createdAt": "2025-10-07T11:35:43.123Z",
  "items": [...],
  "shipping": {...},
  "user": {...}
}
```

## Usage Examples

### 1. Display Order Code to User

```typescript
// Frontend - After successful checkout
const response = await checkout(orderData);
console.log(`Your order code is: ${response.orderCode}`);
// Output: "Your order code is: ORD-2025-9F3C21"
```

### 2. Track Order by Code

```typescript
// Backend - Find order by code
const order = await prisma.order.findUnique({
  where: { orderCode: 'ORD-2025-9F3C21' },
});
```

### 3. Email Confirmation

```
Subject: Order Confirmation - ORD-2025-9F3C21

Dear Ashraful Islam,

Your order has been confirmed!
Order Code: ORD-2025-9F3C21
Total: $330

Track your order using the order code above.
```

## Benefits

✅ **User-Friendly:** Easy to read and communicate
✅ **Unique:** Database constraint ensures no duplicates
✅ **Traceable:** Can be used for order lookup
✅ **Professional:** Looks like a real order number
✅ **Year-Based:** Easy to identify order year
✅ **Short:** Only 14 characters long

## Testing

### Test Checkout:

```bash
POST http://localhost:3008/orders/checkout

{
  "user": {
    "name": "Ashraful Islam",
    "phone": "01750514197",
    "email": "ashrafulislamsay7@gmail.com",
    "address": "I Block",
    "deliveryArea": "Inside Dhaka"
  },
  "products": [
    {
      "id": 22,
      "name": "Rizz-bifold wallet",
      "price": 250,
      "quantity": 1,
      "colorId": 2,
      "sizeId": 1
    }
  ],
  "total": 250,
  "deliveryCharge": 80,
  "totalPayableAmount": 330
}
```

### Expected Response:

```json
{
  "id": 5,
  "orderCode": "ORD-2025-K7M9P3",  // 🎯 Unique code
  "status": "PENDING",
  "total": 330,
  "deliveryCharge": 80,
  ...
}
```

## Status: ✅ READY

The order code feature is fully functional and ready to use!

## Future Enhancements (Optional)

- Add order code to email confirmations
- Create order tracking page using order code
- Add order code to invoice/receipt
- SMS notification with order code
- QR code generation from order code
