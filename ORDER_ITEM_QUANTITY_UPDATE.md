# Order Item Quantity Update Feature

## Overview

This feature allows updating the quantity of individual order items and automatically recalculates the order total based on the new quantity.

## API Endpoint

### Update Order Item Quantity

**Endpoint:** `PUT /orders/items/:itemId/quantity`

**Description:** Updates the quantity of a specific order item. Only the quantity can be modified - all other fields (product, color, size, price) remain unchanged.

**Request Parameters:**

- `itemId` (path parameter): The ID of the order item to update

**Request Body:**

```json
{
  "quantity": 3
}
```

**Validation Rules:**

- `quantity` must be an integer
- `quantity` must be at least 1
- Order must be in `pending` or `processing` status
- Sufficient stock must be available for quantity increases

**Success Response (200):**

```json
{
  "id": 8,
  "orderId": 7,
  "productId": 24,
  "quantity": 3,
  "price": 1,
  "colorId": 2,
  "sizeId": 1,
  "createdAt": "2025-10-07T13:20:37.744Z",
  "updatedAt": "2025-10-08T10:30:00.000Z",
  "product": {
    "id": 24,
    "title": "asdasd",
    "subtitle": "asdasd",
    "description": "asdasd",
    "basePrice": 1,
    "discountedPrice": 1,
    "sku": "rizz-wlt-01ZXxczxc",
    "product_image": [
      {
        "id": 32,
        "url": "https://res.cloudinary.com/...",
        "alt": "Product image 1"
      }
    ]
  },
  "color": {
    "id": 2,
    "name": "red",
    "hexCode": "#FFFFFF"
  },
  "size": {
    "id": 1,
    "value": "0",
    "system": "Generic"
  }
}
```

**Error Responses:**

**404 Not Found:**

```json
{
  "statusCode": 404,
  "message": "Order item not found"
}
```

**400 Bad Request (Insufficient Stock):**

```json
{
  "statusCode": 400,
  "message": "Insufficient stock. Only 5 items available"
}
```

**400 Bad Request (Order Status):**

```json
{
  "statusCode": 400,
  "message": "Cannot modify items in shipped orders"
}
```

**400 Bad Request (Validation):**

```json
{
  "statusCode": 400,
  "message": ["Quantity must be at least 1"]
}
```

## Business Logic

### Automatic Calculations

1. **Stock Management:**
   - When quantity is increased: Stock is reduced by the difference
   - When quantity is decreased: Stock is restored by the difference
   - Stock validation occurs before any changes

2. **Total Recalculation:**

   ```
   New Subtotal = Sum of (Item Price × Item Quantity) for all items
   New Order Total = New Subtotal + Delivery Charge
   ```

3. **Example Calculation:**
   - Original: Item quantity = 1, price = $100, delivery = $10
   - Original Total = ($100 × 1) + $10 = $110
   - Update to quantity = 3
   - New Total = ($100 × 3) + $10 = $310

### Restrictions

1. **Order Status:** Only `pending` and `processing` orders can be modified
2. **Minimum Quantity:** Cannot set quantity below 1
3. **Stock Availability:** Must have sufficient available stock for increases
4. **Single Field:** Only quantity can be updated (price, product, color, size are immutable)

## Usage Examples

### Frontend Integration

```typescript
// Update order item quantity
async function updateOrderItemQuantity(itemId: number, quantity: number) {
  try {
    const response = await fetch(`/orders/items/${itemId}/quantity`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ quantity }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message);
    }

    const updatedItem = await response.json();

    // Fetch updated order to get new total
    const orderResponse = await fetch(`/orders/${updatedItem.orderId}`);
    const order = await orderResponse.json();

    return { item: updatedItem, order };
  } catch (error) {
    console.error('Failed to update quantity:', error);
    throw error;
  }
}

// Example usage
const result = await updateOrderItemQuantity(8, 3);
console.log('New item quantity:', result.item.quantity);
console.log('New order total:', result.order.total);
```

### React Component Example

```tsx
import React, { useState } from 'react';

function OrderItemQuantityEditor({ item, onUpdate }) {
  const [quantity, setQuantity] = useState(item.quantity);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleUpdate = async () => {
    if (quantity === item.quantity) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/orders/items/${item.id}/quantity`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }

      const updated = await response.json();
      onUpdate(updated);
    } catch (err) {
      setError(err.message);
      setQuantity(item.quantity); // Revert on error
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="quantity-editor">
        <button
          onClick={() => setQuantity((q) => Math.max(1, q - 1))}
          disabled={loading || quantity <= 1}
        >
          -
        </button>

        <input
          type="number"
          value={quantity}
          onChange={(e) =>
            setQuantity(Math.max(1, parseInt(e.target.value) || 1))
          }
          min="1"
          disabled={loading}
        />

        <button onClick={() => setQuantity((q) => q + 1)} disabled={loading}>
          +
        </button>

        <button
          onClick={handleUpdate}
          disabled={loading || quantity === item.quantity}
        >
          {loading ? 'Updating...' : 'Update'}
        </button>
      </div>

      {error && <div className="error">{error}</div>}
    </div>
  );
}
```

## Database Impact

### Tables Modified

1. **order_item:** `quantity` field updated
2. **product_quantity:** `available_quantity` adjusted based on quantity change
3. **order:** `total` field recalculated

### Transaction Safety

All changes are wrapped in a Prisma transaction to ensure:

- Stock updates and order updates happen atomically
- No data inconsistency if any step fails
- Automatic rollback on errors

## Testing

Test file available at: `order-item-update-tests.http`

### Test Cases

1. **Increase Quantity:** Change from 1 to 3
2. **Decrease Quantity:** Change from 3 to 1
3. **Validation Error:** Try quantity = 0
4. **Type Error:** Try non-numeric quantity
5. **Not Found:** Try non-existent item ID
6. **Insufficient Stock:** Try quantity exceeding available stock
7. **Total Verification:** Confirm order total is correctly recalculated

## Security Considerations

1. **Authentication:** Currently disabled (guest checkout), but can be enabled with `@UseGuards(JwtAuthGuard)`
2. **Authorization:** Should verify user owns the order before allowing modifications
3. **Order Status:** Prevents modification of shipped/delivered/cancelled orders

## Implementation Files

- **DTO:** `src/orders/dto/update-order-item.dto.ts`
- **Service:** `src/orders/orders.service.ts` - `updateOrderItemQuantity()` method
- **Controller:** `src/orders/orders.controller.ts` - `PUT /orders/items/:itemId/quantity` endpoint
- **Tests:** `order-item-update-tests.http`
