# Medigo E-Pharmacy Backend API Documentation

## Data Types

### Medicine Object
```typescript
{
  id: string;           // Unique medicine ID
  name: string;         // Medicine name
  dosage: string;       // Dosage info (e.g., "500mg")
  quantity: number;     // Quantity
  price?: number;       // Price per unit
}
```

### PrescriptionOrder Object
```typescript
{
  _id: string;                                    // MongoDB ID
  prescriptionImageUrl: string;                   // Image URL
  extractedText: string;                          // OCR extracted text
  suggestedMedicines: Medicine[];                 // Extracted medicines
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  deliveryAddress: string;
  city: string;
  country: string;
  status: "pending_ocr" | "pending_verification" | "verified" | "rejected";
  notes?: string;                                 // Customer notes
  pharmacistNotes?: string;                       // Pharmacist notes/reason
  createdAt: string;                              // ISO timestamp
  updatedAt: string;                              // ISO timestamp
}
```

### FulfilledOrder Object
```typescript
{
  _id: string;                    // Unique ID (can be derived from prescription ID)
  prescriptionOrderId: string;    // Links to PrescriptionOrder._id
  medicines: Medicine[];
  totalAmount: number;            // Sum of (price * quantity)
  status: "pending_pickup" | "picked" | "packed" | "ready_for_delivery" | "delivered";
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  createdAt: string;
  updatedAt: string;
}
```

### DashboardStats Object
```typescript
{
  totalOrdersToday: number;       // Total orders created today
  pendingVerification: number;    // Orders awaiting verification
  verifiedToday: number;          // Orders verified today
  ordersReady: number;            // Orders ready for delivery
  recentOrders: PrescriptionOrder[];  // Last 5-10 orders
}
```

---

## API Endpoints

### 1. Pharmacist Dashboard
**Endpoint:** `GET /api/pharmacist/dashboard`

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Query Parameters:** None

**Request Body:** None

**Response (200 OK):**
```json
{
  "data": {
    "totalOrdersToday": 15,
    "pendingVerification": 3,
    "verifiedToday": 12,
    "ordersReady": 5,
    "recentOrders": [
      {
        "_id": "123abc",
        "customerName": "John Doe",
        "customerPhone": "01712345678",
        "status": "pending_verification",
        "createdAt": "2026-07-28T10:00:00Z",
        "updatedAt": "2026-07-28T10:00:00Z"
        // ... other fields
      }
    ]
  }
}
```

---

### 2. Get Requested Orders (Prescription Orders)
**Endpoint:** `GET /api/pharmacist/requested-orders`

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Query Parameters:**
```
status?: "pending_ocr" | "pending_verification" | "verified" | "rejected"
search?: string
page?: number (default: 1)
limit?: number (default: 10)
```

**Example URL:**
```
GET /api/pharmacist/requested-orders?status=pending_verification&page=1&limit=10
```

**Response (200 OK):**
```json
{
  "data": [
    {
      "_id": "ord_123",
      "prescriptionImageUrl": "https://...",
      "extractedText": "Take 1 tablet twice daily",
      "suggestedMedicines": [
        {
          "id": "med_1",
          "name": "Aspirin",
          "dosage": "500mg",
          "quantity": 30,
          "price": 50
        }
      ],
      "customerName": "Rakibul Islam Refat",
      "customerPhone": "01971287162",
      "customerEmail": "rakibulislamrefat127@gmail.com",
      "deliveryAddress": "Road 10, Bhatula, Sector 10, Dhaka District, Dhaka Division, 1231",
      "city": "Dhaka",
      "country": "Bangladesh",
      "status": "pending_verification",
      "notes": "Urgent",
      "pharmacistNotes": null,
      "createdAt": "2026-07-28T09:30:00Z",
      "updatedAt": "2026-07-28T09:30:00Z"
    },
    // ... more orders
  ],
  "total": 42
}
```

---

### 3. Get Order Details
**Endpoint:** `GET /api/pharmacist/requested-orders/:orderId`

**URL Parameters:**
```
orderId = string  // The prescription order ID
```

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Response (200 OK):**
```json
{
  "data": {
    "_id": "ord_123",
    "prescriptionImageUrl": "https://...",
    "extractedText": "Take 1 tablet twice daily",
    "suggestedMedicines": [...],
    "customerName": "Rakibul Islam Refat",
    "customerPhone": "01971287162",
    "customerEmail": "rakibulislamrefat127@gmail.com",
    "deliveryAddress": "Road 10, Bhatula...",
    "city": "Dhaka",
    "country": "Bangladesh",
    "status": "pending_verification",
    "notes": null,
    "pharmacistNotes": null,
    "createdAt": "2026-07-28T09:30:00Z",
    "updatedAt": "2026-07-28T09:30:00Z"
  }
}
```

---

### 4. Verify Prescription Order
**Endpoint:** `PUT /api/pharmacist/requested-orders/:orderId/verify`

**URL Parameters:**
```
orderId = string
```

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "verifiedMedicines": [
    {
      "id": "med_1",
      "name": "Aspirin",
      "dosage": "500mg",
      "quantity": 30,
      "price": 50
    },
    {
      "id": "med_2",
      "name": "Paracetamol",
      "dosage": "500mg",
      "quantity": 20,
      "price": 45
    }
  ],
  "pharmacistNotes": "Verified and ready for fulfillment"
}
```

**Response (200 OK):**
```json
{
  "data": {
    "_id": "ord_123",
    "prescriptionImageUrl": "https://...",
    "extractedText": "Take 1 tablet twice daily",
    "suggestedMedicines": [
      {
        "id": "med_1",
        "name": "Aspirin",
        "dosage": "500mg",
        "quantity": 30,
        "price": 50
      },
      {
        "id": "med_2",
        "name": "Paracetamol",
        "dosage": "500mg",
        "quantity": 20,
        "price": 45
      }
    ],
    "customerName": "Rakibul Islam Refat",
    "customerPhone": "01971287162",
    "customerEmail": "rakibulislamrefat127@gmail.com",
    "deliveryAddress": "Road 10, Bhatula...",
    "city": "Dhaka",
    "country": "Bangladesh",
    "status": "verified",
    "notes": null,
    "pharmacistNotes": "Verified and ready for fulfillment",
    "createdAt": "2026-07-28T09:30:00Z",
    "updatedAt": "2026-07-28T10:45:00Z"
  }
}
```

**Error Response (400/500):**
```json
{
  "status": 400,
  "message": "Invalid medicine data",
  "data": null
}
```

---

### 5. Reject Prescription Order
**Endpoint:** `PUT /api/pharmacist/requested-orders/:orderId/reject`

**URL Parameters:**
```
orderId = string
```

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "reason": "Prescription is expired. Please get a new prescription from doctor."
}
```

**Response (200 OK):**
```json
{
  "data": {
    "_id": "ord_123",
    "prescriptionImageUrl": "https://...",
    "extractedText": "Take 1 tablet twice daily",
    "suggestedMedicines": [...],
    "customerName": "Rakibul Islam Refat",
    "customerPhone": "01971287162",
    "customerEmail": "rakibulislamrefat127@gmail.com",
    "deliveryAddress": "Road 10, Bhatula...",
    "city": "Dhaka",
    "country": "Bangladesh",
    "status": "rejected",
    "notes": null,
    "pharmacistNotes": "Prescription is expired. Please get a new prescription from doctor.",
    "createdAt": "2026-07-28T09:30:00Z",
    "updatedAt": "2026-07-28T10:50:00Z"
  }
}
```

---

### 6. Get Prescribed Orders (Fulfilled Orders)
**Endpoint:** `GET /api/pharmacist/prescribed-orders`

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Query Parameters:**
```
status?: "pending_pickup" | "picked" | "packed" | "ready_for_delivery" | "delivered"
search?: string
page?: number (default: 1)
limit?: number (default: 10)
```

**Example URL:**
```
GET /api/pharmacist/prescribed-orders?status=pending_pickup&page=1&limit=10
```

**Response (200 OK):**
```json
{
  "data": [
    {
      "_id": "fulfilled-ord_123",
      "prescriptionOrderId": "ord_123",
      "medicines": [
        {
          "id": "med_1",
          "name": "Aspirin",
          "dosage": "500mg",
          "quantity": 30,
          "price": 50
        }
      ],
      "totalAmount": 1550,
      "status": "pending_pickup",
      "customerName": "Rakibul Islam Refat",
      "customerPhone": "01971287162",
      "deliveryAddress": "Road 10, Bhatula, Sector 10, Dhaka District, Dhaka Division, 1231",
      "createdAt": "2026-07-28T10:45:00Z",
      "updatedAt": "2026-07-28T10:45:00Z"
    }
  ],
  "total": 5
}
```

---

### 7. Get Fulfilled Order Details
**Endpoint:** `GET /api/pharmacist/prescribed-orders/:orderId`

**URL Parameters:**
```
orderId = string  // The fulfilled order ID
```

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Response (200 OK):**
```json
{
  "data": {
    "_id": "fulfilled-ord_123",
    "prescriptionOrderId": "ord_123",
    "medicines": [...],
    "totalAmount": 1550,
    "status": "pending_pickup",
    "customerName": "Rakibul Islam Refat",
    "customerPhone": "01971287162",
    "deliveryAddress": "Road 10, Bhatula...",
    "createdAt": "2026-07-28T10:45:00Z",
    "updatedAt": "2026-07-28T10:45:00Z"
  }
}
```

---

### 8. Update Fulfilled Order Status
**Endpoint:** `PUT /api/pharmacist/prescribed-orders/:orderId/status`

**URL Parameters:**
```
orderId = string
```

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "status": "picked"  // or "packed", "ready_for_delivery", "delivered"
}
```

**Response (200 OK):**
```json
{
  "data": {
    "_id": "fulfilled-ord_123",
    "prescriptionOrderId": "ord_123",
    "medicines": [...],
    "totalAmount": 1550,
    "status": "picked",
    "customerName": "Rakibul Islam Refat",
    "customerPhone": "01971287162",
    "deliveryAddress": "Road 10, Bhatula...",
    "createdAt": "2026-07-28T10:45:00Z",
    "updatedAt": "2026-07-28T11:00:00Z"
  }
}
```

---

### 9. Generate Invoice
**Endpoint:** `POST /api/pharmacist/prescribed-orders/:orderId/invoice`

**URL Parameters:**
```
orderId = string
```

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:** None

**Response (200 OK):**
```json
{
  "data": {
    "invoiceUrl": "https://api.medigo.com/invoices/inv_123_2026.pdf"
  }
}
```

---

## Standard Response Format

All responses should follow this format:

**Success Response:**
```json
{
  "status": 200,
  "message": "Operation successful",
  "data": { /* response data */ }
}
```

**Error Response:**
```json
{
  "status": 400,
  "message": "Error description",
  "data": null
}
```

**Alternative Success Format (if wrapping data):**
```json
{
  "data": { /* response data */ }
}
```

---

## Implementation Checklist for Backend

### Database Schema

1. **PrescriptionOrder Collection**
   - ✅ _id (ObjectId)
   - ✅ prescriptionImageUrl (String)
   - ✅ extractedText (String)
   - ✅ suggestedMedicines (Array of Medicine objects)
   - ✅ customerName (String)
   - ✅ customerPhone (String)
   - ✅ customerEmail (String)
   - ✅ deliveryAddress (String)
   - ✅ city (String)
   - ✅ country (String)
   - ✅ status (Enum: pending_ocr, pending_verification, verified, rejected)
   - ✅ notes (String, optional)
   - ✅ pharmacistNotes (String, optional)
   - ✅ createdAt (Date)
   - ✅ updatedAt (Date)

2. **FulfilledOrder Collection**
   - ✅ _id (ObjectId)
   - ✅ prescriptionOrderId (ObjectId, reference to PrescriptionOrder)
   - ✅ medicines (Array of Medicine objects)
   - ✅ totalAmount (Number)
   - ✅ status (Enum: pending_pickup, picked, packed, ready_for_delivery, delivered)
   - ✅ customerName (String)
   - ✅ customerPhone (String)
   - ✅ deliveryAddress (String)
   - ✅ createdAt (Date)
   - ✅ updatedAt (Date)

### Routes to Implement

1. ✅ `GET /pharmacist/dashboard` - Get dashboard stats
2. ✅ `GET /pharmacist/requested-orders` - List prescription orders with filtering
3. ✅ `GET /pharmacist/requested-orders/:id` - Get order details
4. ✅ `PUT /pharmacist/requested-orders/:id/verify` - Verify prescription and create fulfilled order
5. ✅ `PUT /pharmacist/requested-orders/:id/reject` - Reject prescription
6. ✅ `GET /pharmacist/prescribed-orders` - List fulfilled orders with filtering
7. ✅ `GET /pharmacist/prescribed-orders/:id` - Get fulfilled order details
8. ✅ `PUT /pharmacist/prescribed-orders/:id/status` - Update fulfillment status
9. ✅ `POST /pharmacist/prescribed-orders/:id/invoice` - Generate invoice PDF

---

## Key Implementation Notes

### Verification Flow
1. Frontend sends: `verifiedMedicines` array and `pharmacistNotes`
2. Backend updates PrescriptionOrder status to "verified"
3. Backend **creates a new FulfilledOrder** with:
   - prescriptionOrderId pointing to the PrescriptionOrder._id
   - medicines from verifiedMedicines
   - totalAmount calculated from medicines
   - status = "pending_pickup"
4. Return the updated PrescriptionOrder

### Rejection Flow
1. Frontend sends: rejection reason
2. Backend updates PrescriptionOrder status to "rejected"
3. Backend stores reason in pharmacistNotes
4. **No FulfilledOrder is created**
5. Return the updated PrescriptionOrder

### Status Progression
- Fulfilled orders progress through: pending_pickup → picked → packed → ready_for_delivery → delivered
- Each status update should trigger notifications to customer

### Authentication
- All endpoints require Bearer token in Authorization header
- Token should be JWT verified on backend

### Filtering & Pagination
- Use MongoDB `find()` with status filter
- Implement skip/limit for pagination
- Support case-insensitive search on customerName, customerPhone

---

## Example Express.js Implementation

```typescript
// GET /api/pharmacist/dashboard
app.get('/api/pharmacist/dashboard', authMiddleware, async (req, res) => {
  try {
    const today = new Date().setHours(0, 0, 0, 0);
    
    const totalOrdersToday = await PrescriptionOrder.countDocuments({
      createdAt: { $gte: new Date(today) }
    });
    
    const pendingVerification = await PrescriptionOrder.countDocuments({
      status: 'pending_verification'
    });
    
    const verifiedToday = await PrescriptionOrder.countDocuments({
      status: 'verified',
      createdAt: { $gte: new Date(today) }
    });
    
    const ordersReady = await FulfilledOrder.countDocuments({
      status: 'ready_for_delivery'
    });
    
    const recentOrders = await PrescriptionOrder.find()
      .sort({ createdAt: -1 })
      .limit(10);
    
    res.json({
      status: 200,
      message: 'Dashboard stats retrieved',
      data: {
        totalOrdersToday,
        pendingVerification,
        verifiedToday,
        ordersReady,
        recentOrders
      }
    });
  } catch (err) {
    res.status(500).json({
      status: 500,
      message: 'Failed to retrieve dashboard stats',
      data: null
    });
  }
});
```

---

This documentation covers all the data formats and API contracts your backend needs to implement. Let me know if you need clarification on any endpoint!
