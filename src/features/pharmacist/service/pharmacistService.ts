import api from "../../../utilities/api";
import {
  readLocalPharmacistOrders,
  updateLocalPharmacistOrder,
  saveLocalPharmacistOrder,
  readLocalFulfilledOrders,
  saveLocalFulfilledOrder,
  updateLocalFulfilledOrder,
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

// ── Helpers ────────────────────────────────────────────────

const createFulfilledFromPrescription = (prescriptionOrder: PrescriptionOrder): FulfilledOrder => {
  const totalAmount = prescriptionOrder.suggestedMedicines.reduce(
    (sum, med) => sum + ((med.price ?? 0) * med.quantity),
    0
  );

  return {
    _id: `fulfilled-${prescriptionOrder._id}`,
    prescriptionOrderId: prescriptionOrder._id,
    medicines: prescriptionOrder.suggestedMedicines,
    totalAmount,
    status: "pending_pickup",
    customerName: prescriptionOrder.customerName,
    customerPhone: prescriptionOrder.customerPhone,
    deliveryAddress: prescriptionOrder.deliveryAddress,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
};

// ── API Calls ──────────────────────────────────────────────

const unwrapResponseData = <T>(res: { data?: any }): T => {
  const payload = res?.data;
  if (!payload) return undefined as T;

  if (payload?.data !== undefined) {
    return payload.data as T;
  }

  return payload as T;
};
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
  const order = unwrapResponseData<PrescriptionOrder>(res);
  
  // Save to local storage for offline fallback
  if (order) {
    saveLocalPharmacistOrder(order);
  }
  
  return order;
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
    const verified = unwrapResponseData<PrescriptionOrder>(res);
    if (verified) {
      // Create fulfilled order from verified prescription
      const fulfilled = createFulfilledFromPrescription(verified);
      saveLocalFulfilledOrder(fulfilled);
      return verified;
    }
  } catch (error) {
    console.warn("Verify API failed, using local fallback:", error);
  }

  // Fallback: update local storage
  const updated = updateLocalPharmacistOrder(orderId, {
    status: "verified",
    pharmacistNotes: data.pharmacistNotes || "",
    suggestedMedicines: data.verifiedMedicines,
  });

  if (updated) {
    // Create fulfilled order from verified prescription
    const fulfilled = createFulfilledFromPrescription(updated);
    saveLocalFulfilledOrder(fulfilled);
    return updated;
  }

  // If order not in local storage, get it and retry
  const existing = readLocalPharmacistOrders().find((o) => o._id === orderId);
  if (existing) {
    const verified = updateLocalPharmacistOrder(orderId, {
      status: "verified",
      pharmacistNotes: data.pharmacistNotes || "",
      suggestedMedicines: data.verifiedMedicines,
    })!;
    // Create fulfilled order
    const fulfilled = createFulfilledFromPrescription(verified);
    saveLocalFulfilledOrder(fulfilled);
    return verified;
  }

  // Last resort: create order with verified status
  const fallback = {
    _id: orderId,
    prescriptionImageUrl: "",
    extractedText: "",
    suggestedMedicines: data.verifiedMedicines,
    customerName: "Unknown",
    customerPhone: "",
    customerEmail: "",
    deliveryAddress: "",
    city: "",
    country: "",
    status: "verified" as const,
    pharmacistNotes: data.pharmacistNotes || "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  // Create fulfilled order
  const fulfilled = createFulfilledFromPrescription(fallback);
  saveLocalFulfilledOrder(fulfilled);
  
  return fallback;
};

// PUT /api/pharmacist/requested-orders/:id/reject
export const rejectPrescriptionOrder = async (
  orderId: string,
  reason: string,
): Promise<PrescriptionOrder> => {
  try {
    const res = await api.put(`/pharmacist/requested-orders/${orderId}/reject`, { reason });
    const rejected = unwrapResponseData<PrescriptionOrder>(res);
    if (rejected) return rejected;
  } catch (error) {
    console.warn("Reject API failed, using local fallback:", error);
  }

  // Fallback: update local storage
  const updated = updateLocalPharmacistOrder(orderId, {
    status: "rejected",
    pharmacistNotes: reason,
  });

  if (updated) return updated;

  // If order not in local storage, retry
  const existing = readLocalPharmacistOrders().find((o) => o._id === orderId);
  if (existing) {
    return updateLocalPharmacistOrder(orderId, {
      status: "rejected",
      pharmacistNotes: reason,
    })!;
  }

  // Last resort: create order with rejected status
  return {
    _id: orderId,
    prescriptionImageUrl: "",
    extractedText: "",
    suggestedMedicines: [],
    customerName: "Unknown",
    customerPhone: "",
    customerEmail: "",
    deliveryAddress: "",
    city: "",
    country: "",
    status: "rejected",
    pharmacistNotes: reason,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
};

// GET /api/pharmacist/prescribed-orders
export const getPrescribedOrders = async (params?: {
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}): Promise<{ data: FulfilledOrder[]; total: number }> => {
  try {
    const res = await api.get("/pharmacist/prescribed-orders", { params });
    const payload = unwrapResponseData<{ data?: FulfilledOrder[]; total?: number } | FulfilledOrder[]>(res);

    if (Array.isArray(payload)) {
      return { data: payload, total: payload.length };
    }

    return {
      data: Array.isArray(payload?.data) ? payload.data : [],
      total: typeof payload?.total === "number" ? payload.total : 0,
    };
  } catch {
    // Fallback to local storage
    const localOrders = readLocalFulfilledOrders();
    const filtered = params?.status
      ? localOrders.filter((order) => order.status === params.status)
      : localOrders;

    return { data: filtered, total: filtered.length };
  }
};

// GET /api/pharmacist/prescribed-orders/:id
export const getPrescribedOrderDetails = async (orderId: string): Promise<FulfilledOrder> => {
  try {
    const res = await api.get(`/pharmacist/prescribed-orders/${orderId}`);
    const order = unwrapResponseData<FulfilledOrder>(res);
    if (order) {
      saveLocalFulfilledOrder(order);
      return order;
    }
  } catch {
    // Fallback to local storage
  }

  const local = readLocalFulfilledOrders().find((o) => o._id === orderId);
  if (local) return local;

  throw new Error("Order not found");
};

// PUT /api/pharmacist/prescribed-orders/:id/status
export const updateOrderStatus = async (
  orderId: string,
  status: FulfilledOrder["status"],
): Promise<FulfilledOrder> => {
  try {
    const res = await api.put(`/pharmacist/prescribed-orders/${orderId}/status`, { status });
    const updated = unwrapResponseData<FulfilledOrder>(res);
    if (updated) {
      saveLocalFulfilledOrder(updated);
      return updated;
    }
  } catch (error) {
    console.warn("Update status API failed, using local fallback:", error);
  }

  // Fallback: update local storage
  const updated = updateLocalFulfilledOrder(orderId, { status });
  if (updated) return updated;

  throw new Error("Failed to update order status");
};

// POST /api/pharmacist/prescribed-orders/:id/invoice
export const generateInvoice = async (orderId: string): Promise<{ invoiceUrl: string }> => {
  const res = await api.post(`/pharmacist/prescribed-orders/${orderId}/invoice`);
  return unwrapResponseData<{ invoiceUrl: string }>(res);
};
