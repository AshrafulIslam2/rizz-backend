# ⚠️ Stop Server & Regenerate Prisma Client

## Changes Made

✅ **Schema Updated:**

- Added `deliveryCharge` to `order` table
- Removed `deliveryCharge` from `order_shipping` table (it's now in order table)
- Updated `orders.service.ts` to save deliveryCharge in the correct place

## Required Steps

### 1. Stop Your NestJS Server

Press `Ctrl + C` in the terminal where the server is running

### 2. Regenerate Prisma Client

```powershell
npx prisma generate
```

### 3. Restart Server

```powershell
npm run start:dev
```

## Why This Happened

The Prisma Client generation fails because your NestJS server is still running and using the old Prisma Client DLL files. Once you stop the server, the files will be unlocked and Prisma can regenerate the client with the new schema.

## After Restart

Your checkout API will work correctly with:

- ✅ User auto-creation by phone/email
- ✅ DeliveryCharge saved in order table
- ✅ All shipping info saved correctly
- ✅ Stock validation and reduction

## Test Request

```json
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

Expected response will include:

- User details
- Order with deliveryCharge = 80
- Order items
- Shipping information
