# ✅ User Model Update - Complete

## Changes Summary

All files have been successfully updated to remove password-based authentication and support the new guest checkout flow.

## Files Modified

### 1. **User Model** (`prisma/schema.prisma`)

```prisma
model User {
  id          Int      @id @default(autoincrement())
  name        String
  email       String   @unique
  phoneNumber String   @unique
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  orders      order[]
}
```

- ✅ Removed `password` field
- ✅ Added `phoneNumber` field (unique)
- ✅ Made `name` required
- ✅ Removed `posts` relation

### 2. **User Service** (`src/users/users.service.ts`)

- ✅ Removed bcrypt import
- ✅ Removed password hashing logic
- ✅ Updated all methods to use new User model fields
- ✅ Updated select statements to include `phoneNumber`

### 3. **User DTOs** (`src/users/dto/user.dto.ts`)

```typescript
export class CreateUserDto {
  name: string;
  email: string;
  phoneNumber: string;
}

export class UpdateUserDto {
  name?: string;
  email?: string;
  phoneNumber?: string;
}
```

- ✅ Removed `password` field
- ✅ Added `phoneNumber` field
- ✅ Made `name` required

### 4. **Auth Service** (`src/auth/auth.service.ts`)

- ✅ Disabled password-based login
- ✅ Disabled password-based registration
- ✅ Methods now throw BadRequestException with clear message
- ✅ Added helper methods for future token-based auth
- ✅ Removed bcrypt dependency

### 5. **Auth DTOs** (`src/auth/dto/auth.dto.ts`)

- ✅ Replaced `password` with `phoneNumber`
- ✅ Added documentation comments

### 6. **Auth Types** (`src/auth/types/auth.types.ts`)

- ✅ Renamed `UserWithoutPassword` to `UserResponse`
- ✅ Updated to include `phoneNumber`

### 7. **Orders Service** (`src/orders/orders.service.ts`)

- ✅ Checks if user exists by phone OR email
- ✅ Creates user automatically if not found
- ✅ Links order to user

### 8. **Checkout DTO** (`src/orders/dto/checkout.dto.ts`)

- ✅ Matches frontend JSON structure
- ✅ Includes user information

## Next Step: Run Migration

You need to apply the database migration:

```powershell
cd c:\Users\Mediusware\Desktop\Webflow\My_project\rizz-backend

# Apply migration
npx prisma migrate dev --name remove_password_add_phone

# If you get a conflict error about existing users, run:
npx prisma migrate reset --force
npx prisma migrate dev --name remove_password_add_phone
```

## API Usage

### Checkout (Auto-creates user)

```bash
POST http://localhost:3000/orders/checkout

{
  "user": {
    "name": "Ashraful Islam",
    "phone": "01750514197",
    "email": "ashrafulislamsay7@gmail.com",
    "address": "I Block",
    "deliveryArea": "Inside Dhaka"
  },
  "products": [...],
  "total": 250,
  "deliveryCharge": 80,
  "totalPayableAmount": 330
}
```

### Create User Manually

```bash
POST http://localhost:3000/users

{
  "name": "John Doe",
  "email": "john@example.com",
  "phoneNumber": "01234567890"
}
```

### Login/Register (Disabled)

```bash
POST http://localhost:3000/auth/login
# Returns: "Password-based authentication is disabled"
```

## Status: ✅ READY

All TypeScript errors resolved. Just run the migration command above to update your database.
