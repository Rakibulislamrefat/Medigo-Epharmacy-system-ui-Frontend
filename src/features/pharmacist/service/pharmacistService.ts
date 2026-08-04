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
  price: number | null;
  rawText?: string;
  ocrName?: string;
  stockQty?: number;
  available?: boolean;
  matchConfidence?: number;
  suggestions?: Array<{ _id?: string; name?: string; price?: number | null; stockQty?: number; score?: number }>;
  selectedMedicineId?: string | null;
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
  customerEmail?: string;
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

const normalizeVerifiedMedicines = (medicines: Medicine[]): Medicine[] =>
  (Array.isArray(medicines) ? medicines : []).map((med) => ({
    ...med,
    name: typeof med.name === "string" ? med.name.trim() || "Medicine" : "Medicine",
    dosage: typeof med.dosage === "string" ? med.dosage.trim() || "As requested" : "As requested",
    quantity: Number.isFinite(med.quantity) && med.quantity > 0 ? med.quantity : 1,
  }));

const notifyVerifiedOrder = async (
  orderId: string,
  details: { customerEmail?: string; customerName?: string },
): Promise<boolean> => {
  const email = details.customerEmail?.trim();
  if (!email) {
    return false;
  }

  const payload = {
    orderId,
    customerEmail: email,
    customerName: details.customerName?.trim() || "Customer",
    type: "verified",
  };

  const endpoints = [
    `/pharmacist/requested-orders/${orderId}/notify`,
    `/pharmacist/requested-orders/${orderId}/send-email`,
    "/pharmacist/notifications/order-verified",
  ];

  for (const endpoint of endpoints) {
    try {
      await api.post(endpoint, payload);
      return true;
    } catch (error: any) {
      const status = error?.response?.status;
      if (status === 404 || status === 400 || status === 405) {
        continue;
      }
      console.warn("Order verification notification failed:", error);
      return false;
    }
  }

  return false;
};

const notifyPrescribedOrderStatusChange = async (
  orderId: string,
  details: { customerEmail?: string; customerName?: string; status?: string },
): Promise<boolean> => {
  const email = details.customerEmail?.trim();
  if (!email) {
    return false;
  }

  const payload = {
    orderId,
    customerEmail: email,
    customerName: details.customerName?.trim() || "Customer",
    status: details.status,
    type: "prescribed_order_status",
  };

  const endpoints = [
    `/pharmacist/prescribed-orders/${orderId}/notify`,
    `/pharmacist/prescribed-orders/${orderId}/send-email`,
    `/pharmacist/notifications/order-status`,
    `/pharmacist/notifications/order-status-update`,
    `/pharmacist/requested-orders/${orderId}/notify`,
    `/pharmacist/requested-orders/${orderId}/send-email`,
  ];

  for (const endpoint of endpoints) {
    try {
      await api.post(endpoint, payload);
      return true;
    } catch (error: any) {
      const status = error?.response?.status;
      if (status === 404 || status === 400 || status === 405) {
        continue;
      }
      console.warn("Order status notification failed:", error);
      return false;
    }
  }

  return false;
};

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
    customerEmail: prescriptionOrder.customerEmail,
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
  const payload = unwrapResponseData<any>(res);

  // If backend returns the OCR-style payload (with suggestedMatches), map it to our PrescriptionOrder shape
  if (payload && (payload.suggestedMatches || payload.data?.suggestedMatches)) {
    const data = payload.data ?? payload;

    const matches: any[] = Array.isArray(data.suggestedMatches) ? data.suggestedMatches : [];
    const baseList: any[] = Array.isArray(data.suggestedMedicines) ? data.suggestedMedicines : [];

    const suggestedMedicines: Medicine[] = matches.map((m, idx) => {
      const line = m.ocrLine ?? m.parsedName ?? `line_${idx}`;
      let base = baseList[idx] ?? {};
      if ((!base || Object.keys(base).length === 0) && m.parsedName) {
        const parsed = String(m.parsedName).toLowerCase();
        const found = baseList.find((b: any) => b?.name && String(b.name).toLowerCase().includes(parsed));
        if (found) base = found;
      }

      // normalize suggestions
      const suggestions = (Array.isArray(m.suggestions) ? m.suggestions : []).map((s: any) => ({
        _id: s._id ?? s.id,
        name: s.name,
        price: s.price ?? s.salePrice ?? null,
        stockQty: s.stock ?? s.stockQty ?? 0,
        score: s.score ?? s.matchScore ?? 0,
      }));

      const chosen = suggestions.find((s: any) => String(s._id) === String(m.selectedMedicineId)) ?? suggestions[0] ?? null;

      const quantity = typeof m.quantity === "number" && m.quantity > 0 ? m.quantity : (base.quantity ?? 1);
      const price = chosen?.price ?? base.price ?? base.salePrice ?? null;
      const stockQty = chosen?.stockQty ?? base.stock ?? base.stockQty ?? undefined;
      const available = chosen ? (typeof stockQty === 'number' ? stockQty > 0 : true) : (base.available !== undefined ? base.available : (price != null && price > 0));
      const matchConfidence = chosen?.score ?? m.score ?? m.matchScore ?? undefined;

      return {
        id: base.id ?? base._id ?? `line_${idx}`,
        name: chosen?.name ?? base.name ?? m.parsedName ?? line,
        dosage: base.dosage ?? m.parsedDosage ?? base?.dosage ?? "As requested",
        quantity,
        price,
        rawText: m.ocrLine ?? undefined,
        stockQty,
        available: !!available,
        matchConfidence,
        suggestions,
        selectedMedicineId: chosen?._id ?? null,
      } as Medicine;
    });

    const order: PrescriptionOrder = {
      _id: data.prescriptionId ?? data._id ?? orderId,
      prescriptionImageUrl: data.prescriptionImageUrl ?? data.imageUrl ?? "",
      extractedText: data.extractedText ?? data.extracted_text ?? "",
      suggestedMedicines,
      customerName: data.customerName ?? data.fullName ?? "Customer",
      customerPhone: data.customerPhone ?? data.phone ?? "",
      customerEmail: data.customerEmail ?? data.email ?? "",
      deliveryAddress: data.deliveryAddress ?? data.address ?? "",
      city: data.city ?? "",
      country: data.country ?? "",
      status: (data.status as PrescriptionOrder["status"]) ?? (data.verificationStatus === "pending" ? "pending_verification" : (data.status ?? "pending_verification")),
      notes: data.notes ?? data.verificationNotes ?? "",
      pharmacistNotes: data.pharmacistNotes ?? "",
      createdAt: data.createdAt ?? data.ocrProcessedAt ?? new Date().toISOString(),
      updatedAt: data.updatedAt ?? new Date().toISOString(),
    };

    // Save to local storage for offline fallback
    saveLocalPharmacistOrder(order);
    return order;
  }

  // Fallback: assume payload is already in our PrescriptionOrder shape
  const order = unwrapResponseData<PrescriptionOrder>(res);
  if (order) saveLocalPharmacistOrder(order);
  return order;
};

// PUT /api/pharmacist/requested-orders/:id/verify
export const verifyPrescriptionOrder = async (
  orderId: string,
  data: {
    verifiedMedicines: Medicine[];
    pharmacistNotes?: string;
    customerEmail?: string;
    customerName?: string;
  },
): Promise<PrescriptionOrder> => {
  try {
    const payload = {
      ...data,
      verifiedMedicines: normalizeVerifiedMedicines(data.verifiedMedicines),
    };

    const res = await api.put(`/pharmacist/requested-orders/${orderId}/verify`, payload);
    const verified = unwrapResponseData<PrescriptionOrder>(res);
    if (verified) {
      void notifyVerifiedOrder(orderId, {
        customerEmail: data.customerEmail,
        customerName: data.customerName,
      });

      // Create fulfilled order from verified prescription
      const fulfilled = createFulfilledFromPrescription(verified);
      saveLocalFulfilledOrder(fulfilled);
      return verified;
    }
  } catch (error) {
    console.warn("Verify API failed, using local fallback:", error);
  }

  // Fallback: update local storage
  const verifiedMedicines = normalizeVerifiedMedicines(data.verifiedMedicines);
  const updated = updateLocalPharmacistOrder(orderId, {
    status: "verified",
    pharmacistNotes: data.pharmacistNotes || "",
    suggestedMedicines: verifiedMedicines,
  });

  void notifyVerifiedOrder(orderId, {
    customerEmail: data.customerEmail,
    customerName: data.customerName,
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
      suggestedMedicines: verifiedMedicines,
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
    suggestedMedicines: verifiedMedicines,
    customerName: "Unknown",
    customerPhone: "",
    customerEmail: data.customerEmail ?? "",
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
      void notifyPrescribedOrderStatusChange(orderId, {
        customerEmail: updated.customerEmail,
        customerName: updated.customerName,
        status,
      });
      return updated;
    }
  } catch (error) {
    console.warn("Update status API failed, using local fallback:", error);
  }

  // Fallback: update local storage
  const updated = updateLocalFulfilledOrder(orderId, { status });
  if (updated) {
    void notifyPrescribedOrderStatusChange(orderId, {
      customerEmail: updated.customerEmail,
      customerName: updated.customerName,
      status,
    });
    return updated;
  }

  throw new Error("Failed to update order status");
};

// POST /api/pharmacist/prescribed-orders/:id/invoice
export const generateInvoice = async (orderId: string): Promise<{ invoiceUrl: string }> => {
  const res = await api.post(`/pharmacist/prescribed-orders/${orderId}/invoice`);
  return unwrapResponseData<{ invoiceUrl: string }>(res);
};
