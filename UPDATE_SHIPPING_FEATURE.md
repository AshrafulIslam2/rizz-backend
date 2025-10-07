# Update Shipping Address Feature

## Overview
Users can now update their shipping address for an order. All fields are optional - update only what needs to be changed.

## API Endpoint

### Update Shipping Address
```
PUT /orders/:id/shipping
```

**Parameters:**
- `id` (path parameter): Order ID
- `userId` (query parameter, optional): User ID for verification

**Request Body (all fields optional):**
```json
{
  "fullName": "Updated Name",
  "address1": "New Address",
  "email": "newemail@example.com",
  "deliveryArea": "Outside Dhaka",
  "phone": "+880 1234567890"
}
```

## Usage Examples

### Update Only Full Name
```bash
PUT http://localhost:3008/orders/6/shipping?userId=1
Content-Type: application/json

{
  "fullName": "Ashraful Islam Updated"
}
```

**Response:**
```json
{
  "id": 6,
  "orderId": 6,
  "fullName": "Ashraful Islam Updated",
  "address1": "I Block",
  "email": "admin@example.com",
  "deliveryArea": "Inside Dhaka",
  "phone": "+880 1234567890",
  "createdAt": "2025-10-07T12:03:18.925Z",
  "updatedAt": "2025-10-07T13:30:45.123Z"
}
```

### Update Multiple Fields
```bash
PUT http://localhost:3008/orders/6/shipping?userId=1
Content-Type: application/json

{
  "address1": "123 New Street, Apartment 4B",
  "deliveryArea": "Outside Dhaka",
  "phone": "+880 9876543210"
}
```

**Response:**
```json
{
  "id": 6,
  "orderId": 6,
  "fullName": "Ashraful Islam",
  "address1": "123 New Street, Apartment 4B",
  "email": "admin@example.com",
  "deliveryArea": "Outside Dhaka",
  "phone": "+880 9876543210",
  "createdAt": "2025-10-07T12:03:18.925Z",
  "updatedAt": "2025-10-07T13:32:15.456Z"
}
```

### Update All Fields
```bash
PUT http://localhost:3008/orders/6/shipping?userId=1
Content-Type: application/json

{
  "fullName": "John Doe",
  "address1": "456 Main Road, House 7",
  "email": "john@example.com",
  "deliveryArea": "Chittagong",
  "phone": "+880 1111111111"
}
```

**Response:**
```json
{
  "id": 6,
  "orderId": 6,
  "fullName": "John Doe",
  "address1": "456 Main Road, House 7",
  "email": "john@example.com",
  "deliveryArea": "Chittagong",
  "phone": "+880 1111111111",
  "createdAt": "2025-10-07T12:03:18.925Z",
  "updatedAt": "2025-10-07T13:35:22.789Z"
}
```

## Error Responses

### Order Not Found
```json
{
  "statusCode": 404,
  "message": "Order not found",
  "error": "Not Found"
}
```

### Unauthorized (Wrong User)
```json
{
  "statusCode": 404,
  "message": "Order not found",
  "error": "Not Found"
}
```

### Shipping Info Not Found
```json
{
  "statusCode": 404,
  "message": "Shipping information not found for this order",
  "error": "Not Found"
}
```

### Validation Error (Invalid Email)
```json
{
  "statusCode": 400,
  "message": ["email must be an email"],
  "error": "Bad Request"
}
```

## Security

- **User Verification:** If `userId` is provided, the system verifies the order belongs to that user
- **Admin Access:** Admins can update shipping without `userId` parameter
- **Privacy:** Users can only update shipping for their own orders

## Features

✅ **Partial Updates:** Update only the fields you need
✅ **Validation:** Email format and other fields are validated
✅ **Authorization:** Users can only update their own orders
✅ **Flexible:** All fields are optional
✅ **Audit Trail:** `updatedAt` timestamp is automatically updated

## Frontend Integration

### React/JavaScript Example
```javascript
const updateShipping = async (orderId, updates, userId) => {
  const response = await fetch(
    `http://localhost:3008/orders/${orderId}/shipping?userId=${userId}`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    }
  );
  
  if (!response.ok) {
    throw new Error('Failed to update shipping address');
  }
  
  return response.json();
};

// Usage
const result = await updateShipping(6, {
  address1: 'New Address',
  phone: '+880 1234567890'
}, 1);

console.log('Updated shipping:', result);
```

### Form Handling Example
```javascript
const handleSubmit = async (e) => {
  e.preventDefault();
  
  const updates = {};
  if (fullName) updates.fullName = fullName;
  if (address1) updates.address1 = address1;
  if (email) updates.email = email;
  if (deliveryArea) updates.deliveryArea = deliveryArea;
  if (phone) updates.phone = phone;
  
  try {
    const updated = await updateShipping(orderId, updates, userId);
    alert('Shipping address updated successfully!');
  } catch (error) {
    alert('Failed to update shipping address');
  }
};
```

## Use Cases

1. **Customer Changed Address:** User moved to a new location before order delivery
2. **Typo Correction:** Fix spelling mistakes in name or address
3. **Phone Update:** Change contact number
4. **Delivery Area Change:** Switch between inside/outside Dhaka
5. **Email Correction:** Update email for order notifications

## Notes

- Only updates the shipping information, does not affect order items or status
- Changes are immediately reflected in the database
- `updatedAt` timestamp tracks when the last change was made
- Can be called multiple times for the same order
- No limit on number of updates (consider adding rate limiting in production)

## Status: ✅ READY

The update shipping address feature is fully functional and ready to use!
