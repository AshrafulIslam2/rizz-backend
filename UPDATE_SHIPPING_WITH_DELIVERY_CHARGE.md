# Update Shipping & Delivery Charge Feature

## Overview

Update shipping address and delivery charge. When delivery charge changes, the order total is automatically recalculated.

## API Endpoint

```
PUT /orders/shipping/:shippingId
```

## Request Body (All fields optional)

```typescript
{
  "fullName"?: string;
  "address1"?: string;
  "email"?: string;
  "deliveryArea"?: string;
  "phone"?: string;
  "deliveryCharge"?: number;  // NEW: Updates order total automatically
}
```

## How Delivery Charge Works

### Formula:

```
Subtotal = Current Total - Old Delivery Charge
New Total = Subtotal + New Delivery Charge
```

### Example 1: Decrease Delivery Charge

**Current State:**

- Total: 81
- Delivery Charge: 80
- Subtotal (items): 1

**Update Request:**

```json
{
  "deliveryCharge": 0
}
```

**Calculation:**

```
Subtotal = 81 - 80 = 1
New Total = 1 + 0 = 1
```

**Result:**

- Total: 1
- Delivery Charge: 0

---

### Example 2: Increase Delivery Charge

**Current State:**

- Total: 330
- Delivery Charge: 80
- Subtotal (items): 250

**Update Request:**

```json
{
  "deliveryCharge": 120
}
```

**Calculation:**

```
Subtotal = 330 - 80 = 250
New Total = 250 + 120 = 370
```

**Result:**

- Total: 370
- Delivery Charge: 120

---

### Example 3: Change Delivery Area & Charge

**Current State:**

- Total: 330
- Delivery Charge: 80 (Inside Dhaka)
- Delivery Area: "Inside Dhaka"

**Update Request:**

```json
{
  "deliveryArea": "Outside Dhaka",
  "deliveryCharge": 150
}
```

**Result:**

- Total: 400 (250 items + 150 delivery)
- Delivery Charge: 150
- Delivery Area: "Outside Dhaka"

## API Examples

### 1. Update Only Shipping Info (No Charge Change)

```bash
PUT http://localhost:3008/orders/shipping/6
Content-Type: application/json

{
  "fullName": "Ashraful Islam",
  "address1": "New Address",
  "phone": "+880 1234567890"
}
```

**Response:**

```json
{
  "id": 6,
  "orderId": 7,
  "fullName": "Ashraful Islam",
  "address1": "New Address",
  "email": "admin@example.com",
  "deliveryArea": "Inside Dhaka",
  "phone": "+880 1234567890",
  "createdAt": "2025-10-07T12:03:18.925Z",
  "updatedAt": "2025-10-07T14:30:00.000Z"
}
```

### 2. Update Delivery Charge Only

```bash
PUT http://localhost:3008/orders/shipping/6
Content-Type: application/json

{
  "deliveryCharge": 120
}
```

**Response:**

```json
{
  "id": 6,
  "orderId": 7,
  "fullName": "Ashraful Islam",
  "address1": "I Block",
  "email": "admin@example.com",
  "deliveryArea": "Inside Dhaka",
  "phone": "+880 1234567890",
  "deliveryCharge": 120,
  "newTotal": 370,
  "createdAt": "2025-10-07T12:03:18.925Z",
  "updatedAt": "2025-10-07T14:35:00.000Z"
}
```

### 3. Update Everything Together

```bash
PUT http://localhost:3008/orders/shipping/6
Content-Type: application/json

{
  "fullName": "John Doe",
  "address1": "456 Main Road",
  "email": "john@example.com",
  "deliveryArea": "Outside Dhaka",
  "phone": "+880 9999999999",
  "deliveryCharge": 150
}
```

**Response:**

```json
{
  "id": 6,
  "orderId": 7,
  "fullName": "John Doe",
  "address1": "456 Main Road",
  "email": "john@example.com",
  "deliveryArea": "Outside Dhaka",
  "phone": "+880 9999999999",
  "deliveryCharge": 150,
  "newTotal": 400,
  "createdAt": "2025-10-07T12:03:18.925Z",
  "updatedAt": "2025-10-07T14:40:00.000Z"
}
```

### 4. Remove Delivery Charge (Free Delivery)

```bash
PUT http://localhost:3008/orders/shipping/6
Content-Type: application/json

{
  "deliveryCharge": 0
}
```

**Response:**

```json
{
  "id": 6,
  "orderId": 7,
  "fullName": "Ashraful Islam",
  "address1": "I Block",
  "email": "admin@example.com",
  "deliveryArea": "Inside Dhaka",
  "phone": "+880 1234567890",
  "deliveryCharge": 0,
  "newTotal": 250,
  "createdAt": "2025-10-07T12:03:18.925Z",
  "updatedAt": "2025-10-07T14:45:00.000Z"
}
```

## Use Cases

### 1. **Change Delivery Location**

Customer moves from "Inside Dhaka" to "Outside Dhaka"

```json
{
  "deliveryArea": "Outside Dhaka",
  "deliveryCharge": 150
}
```

### 2. **Apply Free Delivery Promotion**

Admin decides to offer free delivery

```json
{
  "deliveryCharge": 0
}
```

### 3. **Correct Wrong Delivery Charge**

Delivery charge was entered incorrectly

```json
{
  "deliveryCharge": 100
}
```

### 4. **Express Delivery Upgrade**

Customer wants faster delivery

```json
{
  "deliveryArea": "Express Delivery - Inside Dhaka",
  "deliveryCharge": 200
}
```

## Transaction Safety

✅ **Atomic Operation:** All updates happen in a database transaction
✅ **Rollback on Error:** If any part fails, nothing is changed
✅ **Consistent Data:** Shipping and order are always in sync

## Frontend Integration

### React/JavaScript Example

```javascript
const updateShippingAndCharge = async (shippingId, updates) => {
  const response = await fetch(
    `http://localhost:3008/orders/shipping/${shippingId}`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    },
  );

  if (!response.ok) {
    throw new Error('Failed to update shipping');
  }

  return response.json();
};

// Example: Update delivery area and charge
const result = await updateShippingAndCharge(6, {
  deliveryArea: 'Outside Dhaka',
  deliveryCharge: 150,
});

console.log('New Total:', result.newTotal);
console.log('Delivery Charge:', result.deliveryCharge);
```

### Form with Delivery Area Dropdown

```javascript
const deliveryRates = {
  'Inside Dhaka': 80,
  'Outside Dhaka': 150,
  'Express - Inside Dhaka': 120,
  'Express - Outside Dhaka': 200,
};

const handleDeliveryAreaChange = async (newArea) => {
  const newCharge = deliveryRates[newArea];

  const result = await updateShippingAndCharge(shippingId, {
    deliveryArea: newArea,
    deliveryCharge: newCharge,
  });

  // Update UI with new total
  setOrderTotal(result.newTotal);
  setDeliveryCharge(result.deliveryCharge);
};
```

## Error Responses

### Shipping Not Found

```json
{
  "statusCode": 404,
  "message": "Shipping information not found",
  "error": "Not Found"
}
```

### Validation Error

```json
{
  "statusCode": 400,
  "message": ["deliveryCharge must be a number"],
  "error": "Bad Request"
}
```

## Important Notes

⚠️ **Delivery Charge Must Be Valid Number:** Including zero (0) for free delivery
⚠️ **Automatic Total Update:** You don't need to calculate the new total
⚠️ **All Changes in Transaction:** Either all updates succeed or none do
✅ **Flexible Updates:** Update shipping info, charge, or both
✅ **No User Check:** Direct update by shipping ID

## Summary

This feature allows you to:

- ✅ Update shipping address information
- ✅ Change delivery charge dynamically
- ✅ Automatically recalculate order total
- ✅ Handle all delivery scenarios (free, standard, express, etc.)
- ✅ Maintain data consistency with transactions

## Status: ✅ READY TO USE
