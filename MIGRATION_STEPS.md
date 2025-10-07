# Migration Steps for User Model Update

## Summary of Changes

I've updated your codebase to handle the new checkout flow where:

1. User information is sent with each checkout request
2. System checks if user exists by phone or email
3. If user doesn't exist, creates a new user automatically
4. Orders are linked to the user

## Files Modified

### 1. `prisma/schema.prisma`

- ✅ Updated User model to only include: `name`, `email`, `phoneNumber`
- ✅ Removed: `password` field (no longer needed for guest checkout)
- ✅ Removed: `posts` relation (not needed)
- ✅ Added unique constraint on `phoneNumber`

### 2. `src/orders/dto/checkout.dto.ts`

- ✅ Created `UserDto` with: name, phone, email, address, deliveryArea
- ✅ Created `ProductDto` matching your frontend structure
- ✅ Updated `CheckoutDto` to match your exact JSON structure

### 3. `src/orders/orders.service.ts`

- ✅ Updated `checkout()` method to:
  - Check if user exists by phone OR email
  - Create user if doesn't exist
  - Link order to user automatically
  - Create order_item entries for all products
  - Create order_shipping entry with user details

## Next Steps - Database Migration

⚠️ **IMPORTANT**: You need to run the database migration to apply schema changes.

### Option 1: Fresh Migration (if development/no important data)

```powershell
# Navigate to project
cd c:\Users\Mediusware\Desktop\Webflow\My_project\rizz-backend

# Reset database (WARNING: Deletes all data)
npx prisma migrate reset --force

# Create and apply new migration
npx prisma migrate dev --name update_user_model_for_checkout

# Generate Prisma Client
npx prisma generate
```

### Option 2: Migration with Data Preservation (if you have existing users)

```powershell
# 1. Create migration file only (don't apply yet)
npx prisma migrate dev --create-only --name update_user_model_for_checkout
```

Then manually edit the migration file in `prisma/migrations/` to:

1. Add `phoneNumber` column with temporary default value
2. Update existing users with phone numbers from their orders' shipping data
3. Remove `password` column
4. Make `phoneNumber` required and unique
5. Drop posts table

Example migration SQL:

```sql
-- Add phoneNumber column (nullable first)
ALTER TABLE "users" ADD COLUMN "phoneNumber" TEXT;

-- Update existing users with phone from their first order
UPDATE "users" u
SET "phoneNumber" = COALESCE(
  (SELECT os.phone FROM "order_shipping" os
   JOIN "orders" o ON o.id = os."orderId"
   WHERE o."userId" = u.id
   LIMIT 1),
  'TEMP_' || u.id::text
);

-- Make phoneNumber required and unique
ALTER TABLE "users" ALTER COLUMN "phoneNumber" SET NOT NULL;
CREATE UNIQUE INDEX "users_phoneNumber_key" ON "users"("phoneNumber");

-- Drop password column
ALTER TABLE "users" DROP COLUMN "password";

-- Drop posts table
DROP TABLE IF EXISTS "posts" CASCADE;

-- Make name required
ALTER TABLE "users" ALTER COLUMN "name" SET NOT NULL;
```

Then apply:

```powershell
npx prisma migrate dev
npx prisma generate
```

## Testing Your Checkout API

### Example Request:

```json
POST http://localhost:3000/orders/checkout
Content-Type: application/json

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
      "originalPrice": 500,
      "image": "https://res.cloudinary.com/...",
      "color": "red",
      "colorId": 2,
      "size": "0",
      "sizeId": 1,
      "quantity": 1,
      "sku": "rizz-bifold-012"
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
  "id": 1,
  "userId": 1,
  "status": "PENDING",
  "total": 330,
  "items": [...],
  "shipping": {
    "fullName": "Ashraful Islam",
    "address1": "I Block",
    "email": "ashrafulislamsay7@gmail.com",
    "phone": "01750514197",
    "deliveryArea": "Inside Dhaka"
  },
  "user": {
    "id": 1,
    "name": "Ashraful Islam",
    "email": "ashrafulislamsay7@gmail.com",
    "phoneNumber": "01750514197"
  }
}
```

## Behavior

1. **First time user**: Creates new user + order
2. **Existing user (same phone)**: Links order to existing user
3. **Existing user (same email)**: Links order to existing user
4. **Stock validation**: Checks inventory before creating order
5. **Stock reduction**: Automatically reduces available quantity
6. **Transaction safety**: All operations in a database transaction (rollback on error)

## Important Notes

- ✅ No authentication required for checkout (guest checkout)
- ✅ User is automatically created if doesn't exist
- ✅ Phone number and email are both unique (no duplicates)
- ✅ Order includes full user details in response
- ✅ Stock is validated and reduced automatically
- ⚠️ Password field removed (you'll need separate auth system if needed)
- ⚠️ Posts table removed (migrate data if needed)

## Rollback (if needed)

If you need to rollback:

```powershell
# See migration history
npx prisma migrate status

# Rollback to specific migration
npx prisma migrate resolve --rolled-back <migration_name>
```
