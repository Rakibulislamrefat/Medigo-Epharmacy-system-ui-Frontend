import api from "../../../utilities/api";

// ── Types ──────────────────────────────────────────────────

export interface Medicine {
  id: string;
  name: string;
  dosage: string;
  quantity: number;
  price?: number;
}

export interface PrescriptionOrder {
  _id: string;
  prescriptionImageUrl: string;
  extractedText: string;
  suggestedMedicines: Medicine[];
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  deliveryAddress: string;
  city: string;
  country: string;
  status: "pending_ocr" | "pending_verification" | "verified" | "rejected";
  notes?: string;
  pharmacistNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FulfilledOrder {
  _id: string;
  prescriptionOrderId: string;
  medicines: Medicine[];
  totalAmount: number;
  status: "pending_pickup" | "picked" | "packed" | "ready_for_delivery" | "delivered";
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  totalOrdersToday: number;
  pendingVerification: number;
  verifiedToday: number;
  ordersReady: number;
  recentOrders: PrescriptionOrder[];
}

// ── API Calls ──────────────────────────────────────────────

// GET /api/pharmacist/dashboard
export const getDashboardStats = async (): Promise<DashboardStats> => {
  const res = await api.get("/pharmacist/dashboard");
  return res.data.data;
};

// GET /api/pharmacist/requested-orders
export const getRequestedOrders = async (params?: {
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}): Promise<{ data: PrescriptionOrder[]; total: number }> => {
  const res = await api.get("/pharmacist/requested-orders", { params });
  return res.data.data;
};

// GET /api/pharmacist/requested-orders/:id
export const getRequestedOrderDetails = async (orderId: string): Promise<PrescriptionOrder> => {
  const res = await api.get(`/pharmacist/requested-orders/${orderId}`);
  return res.data.data;
};

// PUT /api/pharmacist/requested-orders/:id/verify
export const verifyPrescriptionOrder = async (
  orderId: string,
  data: {
    verifiedMedicines: Medicine[];
    pharmacistNotes?: string;
  },
): Promise<PrescriptionOrder> => {
  const res = await api.put(`/pharmacist/requested-orders/${orderId}/verify`, data);
  return res.data.data;
};

// PUT /api/pharmacist/requested-orders/:id/reject
export const rejectPrescriptionOrder = async (
  orderId: string,
  reason: string,
): Promise<PrescriptionOrder> => {
  const res = await api.put(`/pharmacist/requested-orders/${orderId}/reject`, { reason });
  return res.data.data;
};

// GET /api/pharmacist/prescribed-orders
export const getPrescribedOrders = async (params?: {
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}): Promise<{ data: FulfilledOrder[]; total: number }> => {
  const res = await api.get("/pharmacist/prescribed-orders", { params });
  return res.data.data;
};

// GET /api/pharmacist/prescribed-orders/:id
export const getPrescribedOrderDetails = async (orderId: string): Promise<FulfilledOrder> => {
  const res = await api.get(`/pharmacist/prescribed-orders/${orderId}`);
  return res.data.data;
};

// PUT /api/pharmacist/prescribed-orders/:id/status
export const updateOrderStatus = async (
  orderId: string,
  status: FulfilledOrder["status"],
): Promise<FulfilledOrder> => {
  const res = await api.put(`/pharmacist/prescribed-orders/${orderId}/status`, { status });
  return res.data.data;
};

// POST /api/pharmacist/prescribed-orders/:id/invoice
export const generateInvoice = async (orderId: string): Promise<{ invoiceUrl: string }> => {
  const res = await api.post(`/pharmacist/prescribed-orders/${orderId}/invoice`);
  return res.data.data;
};
