# Backend Implementation Guide for Medigo Pharmacist Portal

## Quick Start

This guide shows exactly what your backend needs to implement for the pharmacist portal to work fully.

---

## 1. Database Models

### PrescriptionOrder Collection
```typescript
{
  _id: ObjectId;                              // Auto-generated
  prescriptionImageUrl: string;               // URL of prescription image
  extractedText: string;                      // OCR output
  suggestedMedicines: [{                      // Array of medicines
    id: string;
    name: string;
    dosage: string;
    quantity: number;
    price?: number;
  }];
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  deliveryAddress: string;
  city: string;
  country: string;
  status: "pending_ocr" | "pending_verification" | "verified" | "rejected";
  notes?: string;                             // Customer notes
  pharmacistNotes?: string;                   // Pharmacist notes/rejection reason
  createdAt: Date;
  updatedAt: Date;
  
  // Indexes recommended:
  // - { status: 1, createdAt: -1 }
  // - { customerPhone: 1 }
}
```

### FulfilledOrder Collection
```typescript
{
  _id: ObjectId;                              // Auto-generated
  prescriptionOrderId: ObjectId;              // Reference to PrescriptionOrder
  medicines: [{                               // Same medicine structure
    id: string;
    name: string;
    dosage: string;
    quantity: number;
    price?: number;
  }];
  totalAmount: number;                        // Sum of (price * quantity)
  status: "pending_pickup" | "picked" | "packed" | "ready_for_delivery" | "delivered";
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  createdAt: Date;
  updatedAt: Date;
  
  // Indexes recommended:
  // - { status: 1, createdAt: -1 }
  // - { prescriptionOrderId: 1 }
}
```

---

## 2. API Endpoints to Implement

### A. GET /api/pharmacist/dashboard
**Purpose:** Get overview statistics for pharmacist dashboard

**Authentication:** Bearer token (pharmacist role)

**Request:**
```
GET /api/pharmacist/dashboard
Authorization: Bearer {token}
```

**Response (200 OK):**
```json
{
  "status": 200,
  "message": "Dashboard stats retrieved",
  "data": {
    "totalOrdersToday": 15,
    "pendingVerification": 3,
    "verifiedToday": 12,
    "ordersReady": 5,
    "recentOrders": [
      {
        "_id": "ord_123",
        "customerName": "John Doe",
        "customerPhone": "01712345678",
        "status": "pending_verification",
        "createdAt": "2026-07-28T09:30:00Z",
        "updatedAt": "2026-07-28T09:30:00Z",
        // ... other fields
      }
    ]
  }
}
```

**Implementation Notes:**
- Count orders created today (createdAt >= start of day)
- Count pending_verification status orders
- Count verified orders from today
- Count ready_for_delivery status orders
- Get last 10 prescription orders sorted by createdAt DESC

---

### B. GET /api/pharmacist/requested-orders
**Purpose:** List prescription orders with filters

**Authentication:** Bearer token (pharmacist role)

**Request:**
```
GET /api/pharmacist/requested-orders?status=pending_verification&page=1&limit=10
Authorization: Bearer {token}
```

**Query Parameters:**
- `status` (optional): Filter by status
- `search` (optional): Search by customer name/phone
- `page` (default: 1): Pagination
- `limit` (default: 10): Items per page

**Response (200 OK):**
```json
{
  "status": 200,
  "message": "Orders retrieved",
  "data": [
    {
      "_id": "ord_123",
      "prescriptionImageUrl": "https://...",
      "extractedText": "Take 1 tablet twice daily...",
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
  ],
  "total": 42
}
```

**Implementation Notes:**
- Use MongoDB find() with status filter if provided
- Search on customerName and customerPhone (case-insensitive)
- Implement pagination: `skip((page-1) * limit).limit(limit)`
- Return total count for pagination UI
- Sort by createdAt DESC

---

### C. GET /api/pharmacist/requested-orders/:id
**Purpose:** Get full details of a prescription order

**Authentication:** Bearer token (pharmacist role)

**Request:**
```
GET /api/pharmacist/requested-orders/ord_123
Authorization: Bearer {token}
```

**Response (200 OK):**
```json
{
  "status": 200,
  "message": "Order retrieved",
  "data": {
    "_id": "ord_123",
    "prescriptionImageUrl": "https://...",
    "extractedText": "Take 1 tablet twice daily...",
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

**Error Response (404):**
```json
{
  "status": 404,
  "message": "Order not found",
  "data": null
}
```

---

### D. PUT /api/pharmacist/requested-orders/:id/verify
**⭐ CRITICAL ENDPOINT - Creates FulfilledOrder**

**Purpose:** Verify prescription and create fulfillment order

**Authentication:** Bearer token (pharmacist role)

**Request:**
```
PUT /api/pharmacist/requested-orders/ord_123/verify
Authorization: Bearer {token}
Content-Type: application/json

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

**Backend Logic:**
```javascript
1. Find PrescriptionOrder by id
2. Validate status is "pending_verification" or "pending_ocr"
3. Validate verifiedMedicines array is not empty
4. Update PrescriptionOrder:
   {
     status: "verified",
     suggestedMedicines: verifiedMedicines,
     pharmacistNotes: pharmacistNotes,
     updatedAt: new Date()
   }
5. Create new FulfilledOrder:
   {
     prescriptionOrderId: orderId,
     medicines: verifiedMedicines,
     totalAmount: sum(medicine.price * medicine.quantity),
     status: "pending_pickup",
     customerName: prescriptionOrder.customerName,
     customerPhone: prescriptionOrder.customerPhone,
     deliveryAddress: prescriptionOrder.deliveryAddress,
     createdAt: new Date(),
     updatedAt: new Date()
   }
6. Save both documents
7. Return updated PrescriptionOrder
```

**Response (200 OK):**
```json
{
  "status": 200,
  "message": "Order verified successfully",
  "data": {
    "_id": "ord_123",
    "status": "verified",
    "suggestedMedicines": [
      { "id": "med_1", "name": "Aspirin", "dosage": "500mg", "quantity": 30, "price": 50 },
      { "id": "med_2", "name": "Paracetamol", "dosage": "500mg", "quantity": 20, "price": 45 }
    ],
    "pharmacistNotes": "Verified and ready for fulfillment",
    "updatedAt": "2026-07-28T10:45:00Z"
    // ... rest of fields
  }
}
```

**Error Response (400):**
```json
{
  "status": 400,
  "message": "Invalid medicine data or order already verified",
  "data": null
}
```

---

### E. PUT /api/pharmacist/requested-orders/:id/reject
**Purpose:** Reject a prescription order

**Authentication:** Bearer token (pharmacist role)

**Request:**
```
PUT /api/pharmacist/requested-orders/ord_123/reject
Authorization: Bearer {token}
Content-Type: application/json

{
  "reason": "Prescription is expired. Please get a new prescription from doctor."
}
```

**Backend Logic:**
```javascript
1. Find PrescriptionOrder by id
2. Validate reason is provided
3. Update PrescriptionOrder:
   {
     status: "rejected",
     pharmacistNotes: reason,
     updatedAt: new Date()
   }
4. Do NOT create FulfilledOrder
5. Save document
6. (Optional) Send notification to customer
7. Return updated PrescriptionOrder
```

**Response (200 OK):**
```json
{
  "status": 200,
  "message": "Order rejected",
  "data": {
    "_id": "ord_123",
    "status": "rejected",
    "pharmacistNotes": "Prescription is expired. Please get a new prescription from doctor.",
    "updatedAt": "2026-07-28T10:50:00Z"
    // ... rest of fields
  }
}
```

---

### F. GET /api/pharmacist/prescribed-orders
**Purpose:** List fulfilled orders with filters

**Authentication:** Bearer token (pharmacist role)

**Request:**
```
GET /api/pharmacist/prescribed-orders?status=pending_pickup&page=1&limit=10
Authorization: Bearer {token}
```

**Query Parameters:**
- `status` (optional): Filter by status
- `search` (optional): Search by customer name/phone
- `page` (default: 1): Pagination
- `limit` (default: 10): Items per page

**Response (200 OK):**
```json
{
  "status": 200,
  "message": "Orders retrieved",
  "data": [
    {
      "_id": "fulfilled-ord_123",
      "prescriptionOrderId": "ord_123",
      "medicines": [
        { "id": "med_1", "name": "Aspirin", "dosage": "500mg", "quantity": 30, "price": 50 }
      ],
      "totalAmount": 1550,
      "status": "pending_pickup",
      "customerName": "Rakibul Islam Refat",
      "customerPhone": "01971287162",
      "deliveryAddress": "Road 10, Bhatula...",
      "createdAt": "2026-07-28T10:45:00Z",
      "updatedAt": "2026-07-28T10:45:00Z"
    }
  ],
  "total": 5
}
```

---

### G. GET /api/pharmacist/prescribed-orders/:id
**Purpose:** Get full details of a fulfilled order

**Authentication:** Bearer token (pharmacist role)

**Response (200 OK):**
```json
{
  "status": 200,
  "message": "Order retrieved",
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

### H. PUT /api/pharmacist/prescribed-orders/:id/status
**Purpose:** Update fulfillment order status

**Authentication:** Bearer token (pharmacist role)

**Request:**
```
PUT /api/pharmacist/prescribed-orders/fulfilled-ord_123/status
Authorization: Bearer {token}
Content-Type: application/json

{
  "status": "picked"
}
```

**Valid Status Progression:**
```
pending_pickup → picked → packed → ready_for_delivery → delivered
```

**Backend Logic:**
```javascript
1. Find FulfilledOrder by id
2. Validate new status is one of: pending_pickup, picked, packed, ready_for_delivery, delivered
3. Validate status progression (can only move forward)
4. Update FulfilledOrder:
   {
     status: newStatus,
     updatedAt: new Date()
   }
5. (Optional) Send notification to customer
6. Save document
7. Return updated FulfilledOrder
```

**Response (200 OK):**
```json
{
  "status": 200,
  "message": "Status updated",
  "data": {
    "_id": "fulfilled-ord_123",
    "status": "picked",
    "updatedAt": "2026-07-28T11:00:00Z"
    // ... rest of fields
  }
}
```

---

### I. POST /api/pharmacist/prescribed-orders/:id/invoice
**Purpose:** Generate invoice for fulfilled order

**Authentication:** Bearer token (pharmacist role)

**Request:**
```
POST /api/pharmacist/prescribed-orders/fulfilled-ord_123/invoice
Authorization: Bearer {token}
```

**Backend Logic:**
```javascript
1. Find FulfilledOrder by id
2. Generate PDF invoice with:
   - Order details (ID, date, total)
   - Customer info
   - Medicines list (name, dosage, qty, price)
   - Total amount
3. Save PDF or generate on-the-fly
4. Return signed URL for PDF download
5. URL should be accessible for 1 hour
```

**Response (200 OK):**
```json
{
  "status": 200,
  "message": "Invoice generated",
  "data": {
    "invoiceUrl": "https://api.medigo.com/invoices/inv_ord_123_2026.pdf?token=xxx&expires=3600"
  }
}
```

---

## 3. Authentication Middleware

```typescript
// Sample Express middleware
async function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  
  if (!token) {
    return res.status(401).json({
      status: 401,
      message: "No token provided",
      data: null
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (decoded.role !== "pharmacist") {
      return res.status(403).json({
        status: 403,
        message: "Pharmacist role required",
        data: null
      });
    }
    
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({
      status: 401,
      message: "Invalid token",
      data: null
    });
  }
}
```

---

## 4. Express Route Example

```typescript
import express from "express";
import { authMiddleware } from "../middleware/auth";

const router = express.Router();

// Dashboard
router.get("/dashboard", authMiddleware, getDashboardStats);

// Requested Orders
router.get("/requested-orders", authMiddleware, getRequestedOrders);
router.get("/requested-orders/:id", authMiddleware, getRequestedOrderDetails);
router.put("/requested-orders/:id/verify", authMiddleware, verifyOrder);
router.put("/requested-orders/:id/reject", authMiddleware, rejectOrder);

// Prescribed Orders
router.get("/prescribed-orders", authMiddleware, getPrescribedOrders);
router.get("/prescribed-orders/:id", authMiddleware, getPrescribedOrderDetails);
router.put("/prescribed-orders/:id/status", authMiddleware, updateOrderStatus);
router.post("/prescribed-orders/:id/invoice", authMiddleware, generateInvoice);

export default router;
```

---

## 5. Implementation Checklist

- [ ] Create PrescriptionOrder Mongoose schema
- [ ] Create FulfilledOrder Mongoose schema
- [ ] Create database indexes
- [ ] Implement authMiddleware
- [ ] Implement getDashboardStats controller
- [ ] Implement getRequestedOrders controller
- [ ] Implement getRequestedOrderDetails controller
- [ ] **Implement verifyOrder controller** (creates FulfilledOrder)
- [ ] Implement rejectOrder controller
- [ ] Implement getPrescribedOrders controller
- [ ] Implement getPrescribedOrderDetails controller
- [ ] Implement updateOrderStatus controller
- [ ] Implement generateInvoice controller
- [ ] Setup error handling middleware
- [ ] Setup CORS for frontend URL
- [ ] Test all endpoints with Postman/Insomnia
- [ ] Add input validation
- [ ] Add logging
- [ ] Add rate limiting
- [ ] Deploy to staging
- [ ] Test with frontend

---

## 6. Testing with Postman

### Setup:
1. Create environment with:
   - `baseUrl`: http://localhost:5000/api
   - `token`: (from login endpoint)

2. Test flow:
```
1. POST /auth/pharmacist-login → Get token
2. GET {{baseUrl}}/pharmacist/dashboard → See stats
3. GET {{baseUrl}}/pharmacist/requested-orders → Get orders
4. GET {{baseUrl}}/pharmacist/requested-orders/[id] → Get details
5. PUT {{baseUrl}}/pharmacist/requested-orders/[id]/verify → Verify
6. GET {{baseUrl}}/pharmacist/prescribed-orders → See fulfilled
7. PUT {{baseUrl}}/pharmacist/prescribed-orders/[id]/status → Update
```

---

## 7. Common Pitfalls to Avoid

❌ **Don't:**
- Return data without wrapping in status/message format
- Forget to create FulfilledOrder on verification
- Allow status to go backwards
- Verify already verified orders
- Reject already rejected orders
- Return raw MongoDB errors to frontend

✅ **Do:**
- Follow consistent response format
- Always update updatedAt timestamp
- Validate all inputs
- Check authentication on every endpoint
- Log errors for debugging
- Return user-friendly error messages
- Handle race conditions (concurrent requests)
- Use transactions for multi-document updates

---

## 8. Performance Tips

- Index frequently queried fields
- Use select() to limit fields returned
- Implement caching for dashboard stats
- Use pagination to avoid large responses
- Add timeouts for external API calls
- Monitor database query performance

---

## Support

For questions about the pharmacist portal implementation:
1. Check [PHARMACIST_PORTAL_COMPLETE.md](./PHARMACIST_PORTAL_COMPLETE.md)
2. Check [BACKEND_API_DOCUMENTATION.md](./BACKEND_API_DOCUMENTATION.md)
3. Review example responses above

**Happy coding! 🚀**
