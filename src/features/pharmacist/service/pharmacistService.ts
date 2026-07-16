import api from "../../../utilities/api";
import {
  readLocalPharmacistOrders,
  updateLocalPharmacistOrder,
} from "./pharmacistStorage";

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

const unwrapResponseData = <T>(res: { data?: any }): T => {
  const payload = res?.data;
  if (!payload) return undefined as T;

  if (payload?.data !== undefined) {
    return payload.data as T;
  }

  if (payload?.success !== undefined && payload?.message !== undefined) {
    return payload.data as T;
  }

  return payload as T;
};

// GET /api/pharmacist/dashboard
export const getDashboardStats = async (): Promise<DashboardStats> => {
  const res = await api.get("/pharmacist/dashboard");
  return unwrapResponseData<DashboardStats>(res);
};

// GET /api/pharmacist/requested-orders
export const getRequestedOrders = async (params?: {
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}): Promise<{ data: PrescriptionOrder[]; total: number }> => {
  try {
    const res = await api.get("/pharmacist/requested-orders", { params });
    const payload = unwrapResponseData<{ data?: PrescriptionOrder[]; total?: number } | PrescriptionOrder[]>(res);

    if (Array.isArray(payload)) {
      return { data: payload, total: payload.length };
    }

    const fetched = Array.isArray(payload?.data) ? payload.data : [];
    if (fetched.length) {
      return { data: fetched, total: typeof payload?.total === "number" ? payload.total : fetched.length };
    }
  } catch {
    // fall through to local fallback
  }

  const localOrders = readLocalPharmacistOrders();
  const filtered = params?.status && params.status !== "all"
    ? localOrders.filter((order) => order.status === params.status)
    : localOrders;

  return { data: filtered, total: filtered.length };
};

// GET /api/pharmacist/requested-orders/:id
export const getRequestedOrderDetails = async (orderId: string): Promise<PrescriptionOrder> => {
  const res = await api.get(`/pharmacist/requested-orders/${orderId}`);
  return unwrapResponseData<PrescriptionOrder>(res);
};

// PUT /api/pharmacist/requested-orders/:id/verify
export const verifyPrescriptionOrder = async (
  orderId: string,
  data: {
    verifiedMedicines: Medicine[];
    pharmacistNotes?: string;
  },
): Promise<PrescriptionOrder> => {
  try {
    const res = await api.put(`/pharmacist/requested-orders/${orderId}/verify`, data);
    return unwrapResponseData<PrescriptionOrder>(res);
  } catch {
    const updated = updateLocalPharmacistOrder(orderId, {
      status: "verified",
      pharmacistNotes: data.pharmacistNotes || "",
      suggestedMedicines: data.verifiedMedicines,
    });
    if (updated) return updated;
    throw new Error("Failed to verify order");
  }
};

// PUT /api/pharmacist/requested-orders/:id/reject
export const rejectPrescriptionOrder = async (
  orderId: string,
  reason: string,
): Promise<PrescriptionOrder> => {
  try {
    const res = await api.put(`/pharmacist/requested-orders/${orderId}/reject`, { reason });
    return unwrapResponseData<PrescriptionOrder>(res);
  } catch {
    const updated = updateLocalPharmacistOrder(orderId, {
      status: "rejected",
      pharmacistNotes: reason,
    });
    if (updated) return updated;
    throw new Error("Failed to reject order");
  }
};

// GET /api/pharmacist/prescribed-orders
export const getPrescribedOrders = async (params?: {
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}): Promise<{ data: FulfilledOrder[]; total: number }> => {
  const res = await api.get("/pharmacist/prescribed-orders", { params });
  const payload = unwrapResponseData<{ data?: FulfilledOrder[]; total?: number } | FulfilledOrder[]>(res);

  if (Array.isArray(payload)) {
    return { data: payload, total: payload.length };
  }

  return {
    data: Array.isArray(payload?.data) ? payload.data : [],
    total: typeof payload?.total === "number" ? payload.total : 0,
  };
};

// GET /api/pharmacist/prescribed-orders/:id
export const getPrescribedOrderDetails = async (orderId: string): Promise<FulfilledOrder> => {
  const res = await api.get(`/pharmacist/prescribed-orders/${orderId}`);
  return unwrapResponseData<FulfilledOrder>(res);
};

// PUT /api/pharmacist/prescribed-orders/:id/status
export const updateOrderStatus = async (
  orderId: string,
  status: FulfilledOrder["status"],
): Promise<FulfilledOrder> => {
  const res = await api.put(`/pharmacist/prescribed-orders/${orderId}/status`, { status });
  return unwrapResponseData<FulfilledOrder>(res);
};

// POST /api/pharmacist/prescribed-orders/:id/invoice
export const generateInvoice = async (orderId: string): Promise<{ invoiceUrl: string }> => {
  const res = await api.post(`/pharmacist/prescribed-orders/${orderId}/invoice`);
  return unwrapResponseData<{ invoiceUrl: string }>(res);
};
