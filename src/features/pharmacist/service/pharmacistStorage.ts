import type { PrescriptionOrder } from "./pharmacistService";

const STORAGE_KEY = "medigo_pharmacist_orders";

export const readLocalPharmacistOrders = (): PrescriptionOrder[] => {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const writeLocalPharmacistOrders = (orders: PrescriptionOrder[]) => {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
  } catch {
    // ignore storage errors
  }
};

export const saveLocalPharmacistOrder = (order: PrescriptionOrder) => {
  const existing = readLocalPharmacistOrders();
  const next = [order, ...existing.filter((item) => item._id !== order._id)];
  writeLocalPharmacistOrders(next);
  return next;
};

export const updateLocalPharmacistOrder = (
  orderId: string,
  patch: Partial<PrescriptionOrder>,
) => {
  const existing = readLocalPharmacistOrders();
  const updated = existing.map((item) =>
    item._id === orderId ? { ...item, ...patch, updatedAt: new Date().toISOString() } : item,
  );

  writeLocalPharmacistOrders(updated);
  return updated.find((item) => item._id === orderId) ?? null;
};

export const buildLocalPharmacistOrder = ({
  fullName,
  phone,
  email,
  deliveryAddress,
  city,
  country,
  notes,
  medicines,
  status = "pending_verification",
  id,
}: {
  fullName: string;
  phone: string;
  email: string;
  deliveryAddress: string;
  city: string;
  country: string;
  notes?: string;
  medicines: Array<{ id: string; name: string; dosage?: string; quantity: number; price?: number }>;
  status?: PrescriptionOrder["status"];
  id?: string;
}): PrescriptionOrder => ({
  _id: id ?? `local-${Date.now()}`,
  prescriptionImageUrl: "",
  extractedText: "",
  suggestedMedicines: medicines.map((medicine) => ({
    id: medicine.id,
    name: medicine.name,
    dosage: medicine.dosage ?? "As requested",
    quantity: medicine.quantity || 1,
    price: medicine.price,
  })),
  customerName: fullName || "Customer",
  customerPhone: phone || "",
  customerEmail: email || "",
  deliveryAddress: deliveryAddress || "",
  city: city || "",
  country: country || "",
  status,
  notes: notes || "",
  pharmacistNotes: "",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});
