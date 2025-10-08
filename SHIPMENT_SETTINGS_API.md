# 📦 Shipment Settings API - Delivery Areas Management

## Overview

Complete CRUD API for managing delivery areas and charges in your e-commerce system.

---

## 🎯 Features

✅ **Create** delivery areas with custom charges
✅ **Read** all or active delivery areas  
✅ **Update** area names and charges
✅ **Delete** delivery areas
✅ **Toggle** active/inactive status
✅ **Unique area names** (no duplicates)
✅ **Validation** on all inputs

---

## 📊 Database Schema

```prisma
model DeliveryArea {
  id        Int      @id @default(autoincrement())
  areaName  String   @unique
  charge    Float
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

---

## 🔌 API Endpoints

### 1. Get All Delivery Areas

```http
GET /shipment/delivery-areas
```

**Response:**

```json
[
  {
    "id": 1,
    "areaName": "Inside Chittagong",
    "charge": 60,
    "isActive": true,
    "createdAt": "2025-10-08T05:00:00.000Z",
    "updatedAt": "2025-10-08T05:00:00.000Z"
  },
  {
    "id": 2,
    "areaName": "Outside Chittagong",
    "charge": 100,
    "isActive": true,
    "createdAt": "2025-10-08T05:00:00.000Z",
    "updatedAt": "2025-10-08T05:00:00.000Z"
  },
  {
    "id": 3,
    "areaName": "Inside Dhaka",
    "charge": 80,
    "isActive": true,
    "createdAt": "2025-10-08T05:00:00.000Z",
    "updatedAt": "2025-10-08T05:00:00.000Z"
  }
]
```

---

### 2. Get Active Delivery Areas Only

```http
GET /shipment/delivery-areas/active
```

**Response:** Same as above, but only active areas (isActive: true)

---

### 3. Get Delivery Area by ID

```http
GET /shipment/delivery-areas/:id
```

**Example:**

```http
GET /shipment/delivery-areas/1
```

**Response:**

```json
{
  "id": 1,
  "areaName": "Inside Chittagong",
  "charge": 60,
  "isActive": true,
  "createdAt": "2025-10-08T05:00:00.000Z",
  "updatedAt": "2025-10-08T05:00:00.000Z"
}
```

---

### 4. Create New Delivery Area

```http
POST /shipment/delivery-areas
Content-Type: application/json

{
  "areaName": "Inside Sylhet",
  "charge": 90,
  "isActive": true
}
```

**Request Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| areaName | string | Yes | Unique area name |
| charge | number | Yes | Delivery charge (≥ 0) |
| isActive | boolean | No | Default: true |

**Response:**

```json
{
  "id": 4,
  "areaName": "Inside Sylhet",
  "charge": 90,
  "isActive": true,
  "createdAt": "2025-10-08T06:00:00.000Z",
  "updatedAt": "2025-10-08T06:00:00.000Z"
}
```

**Error Response (Duplicate):**

```json
{
  "statusCode": 409,
  "message": "Delivery area \"Inside Sylhet\" already exists",
  "error": "Conflict"
}
```

---

### 5. Update Delivery Area

```http
PUT /shipment/delivery-areas/:id
Content-Type: application/json

{
  "areaName": "Inside Chittagong City",
  "charge": 70
}
```

**All fields are optional** - update only what you need:

```json
{
  "charge": 65
}
```

**Response:**

```json
{
  "id": 1,
  "areaName": "Inside Chittagong City",
  "charge": 70,
  "isActive": true,
  "createdAt": "2025-10-08T05:00:00.000Z",
  "updatedAt": "2025-10-08T06:30:00.000Z"
}
```

---

### 6. Delete Delivery Area

```http
DELETE /shipment/delivery-areas/:id
```

**Example:**

```http
DELETE /shipment/delivery-areas/4
```

**Response:**

```json
{
  "message": "Delivery area deleted successfully"
}
```

**Error Response (Not Found):**

```json
{
  "statusCode": 404,
  "message": "Delivery area with ID 4 not found",
  "error": "Not Found"
}
```

---

### 7. Toggle Active Status

```http
PATCH /shipment/delivery-areas/:id/toggle
```

**Example:**

```http
PATCH /shipment/delivery-areas/1/toggle
```

**Response:**

```json
{
  "id": 1,
  "areaName": "Inside Chittagong",
  "charge": 60,
  "isActive": false, // Toggled from true to false
  "createdAt": "2025-10-08T05:00:00.000Z",
  "updatedAt": "2025-10-08T07:00:00.000Z"
}
```

---

## 🎨 Frontend Integration

### React/TypeScript Example

```typescript
// API Service
const shipmentApi = {
  // Get all delivery areas
  getAllDeliveryAreas: async () => {
    const response = await fetch(
      'http://localhost:3008/shipment/delivery-areas',
    );
    return response.json();
  },

  // Get active delivery areas only
  getActiveDeliveryAreas: async () => {
    const response = await fetch(
      'http://localhost:3008/shipment/delivery-areas/active',
    );
    return response.json();
  },

  // Create delivery area
  createDeliveryArea: async (data: { areaName: string; charge: number }) => {
    const response = await fetch(
      'http://localhost:3008/shipment/delivery-areas',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      },
    );
    if (!response.ok) throw new Error(await response.text());
    return response.json();
  },

  // Update delivery area
  updateDeliveryArea: async (
    id: number,
    data: { areaName?: string; charge?: number },
  ) => {
    const response = await fetch(
      `http://localhost:3008/shipment/delivery-areas/${id}`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      },
    );
    if (!response.ok) throw new Error(await response.text());
    return response.json();
  },

  // Delete delivery area
  deleteDeliveryArea: async (id: number) => {
    const response = await fetch(
      `http://localhost:3008/shipment/delivery-areas/${id}`,
      {
        method: 'DELETE',
      },
    );
    if (!response.ok) throw new Error(await response.text());
    return response.json();
  },

  // Toggle active status
  toggleDeliveryArea: async (id: number) => {
    const response = await fetch(
      `http://localhost:3008/shipment/delivery-areas/${id}/toggle`,
      {
        method: 'PATCH',
      },
    );
    if (!response.ok) throw new Error(await response.text());
    return response.json();
  },
};

export default shipmentApi;
```

### Component Example

```tsx
import { useState, useEffect } from 'react';
import shipmentApi from './api/shipmentApi';

function ShipmentSettings() {
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ areaName: '', charge: 0 });

  // Load delivery areas
  useEffect(() => {
    loadAreas();
  }, []);

  const loadAreas = async () => {
    try {
      const data = await shipmentApi.getAllDeliveryAreas();
      setAreas(data);
    } catch (error) {
      console.error('Failed to load areas:', error);
    }
  };

  // Create new area
  const handleAdd = async (newArea) => {
    setLoading(true);
    try {
      await shipmentApi.createDeliveryArea(newArea);
      await loadAreas();
    } catch (error) {
      alert('Failed to add area: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Update area
  const handleSave = async (id) => {
    setLoading(true);
    try {
      await shipmentApi.updateDeliveryArea(id, editForm);
      await loadAreas();
      setEditingId(null);
    } catch (error) {
      alert('Failed to update area: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Delete area
  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this delivery area?')) return;

    setLoading(true);
    try {
      await shipmentApi.deleteDeliveryArea(id);
      await loadAreas();
    } catch (error) {
      alert('Failed to delete area: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Shipment Settings</h2>
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Area Name</th>
            <th>Charge</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {areas.map((area, index) => (
            <tr key={area.id}>
              <td>{index + 1}</td>
              <td>
                {editingId === area.id ? (
                  <input
                    value={editForm.areaName}
                    onChange={(e) =>
                      setEditForm({ ...editForm, areaName: e.target.value })
                    }
                  />
                ) : (
                  area.areaName
                )}
              </td>
              <td>
                {editingId === area.id ? (
                  <input
                    type="number"
                    value={editForm.charge}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        charge: Number(e.target.value),
                      })
                    }
                  />
                ) : (
                  `৳${area.charge.toFixed(2)}`
                )}
              </td>
              <td>
                {editingId === area.id ? (
                  <>
                    <button
                      onClick={() => handleSave(area.id)}
                      disabled={loading}
                    >
                      {loading ? 'Saving...' : 'Save'}
                    </button>
                    <button onClick={() => setEditingId(null)}>Cancel</button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        setEditingId(area.id);
                        setEditForm({
                          areaName: area.areaName,
                          charge: area.charge,
                        });
                      }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(area.id)}
                      disabled={loading}
                    >
                      Delete
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

---

## ✅ Validation Rules

| Field    | Rules                            |
| -------- | -------------------------------- |
| areaName | Required, must be unique, string |
| charge   | Required, must be ≥ 0, number    |
| isActive | Optional, boolean, default: true |

---

## 🔒 Error Handling

| Status | Error       | Reason                           |
| ------ | ----------- | -------------------------------- |
| 404    | Not Found   | Delivery area doesn't exist      |
| 409    | Conflict    | Area name already exists         |
| 400    | Bad Request | Validation failed (invalid data) |

---

## 🎯 Use Cases

1. **Initial Setup:** Add delivery zones for your business
2. **Price Updates:** Adjust charges based on fuel costs, seasons, etc.
3. **Expansion:** Add new delivery areas as you grow
4. **Deactivation:** Temporarily disable areas without deleting data
5. **Checkout Integration:** Show available delivery options to customers

---

## 🚀 Status: ✅ READY TO USE

All endpoints are functional. Just restart your server and start using the API!
