import api from "../../../utilities/api";

export type AdminUser = {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
  role: string;
  status?: string;
  createdAt?: string;
};

export type AdminMedicine = {
  _id: string;
  name: string;
  slug?: string;
  price?: number;
  stockQty?: number;
  status?: string;
  createdAt?: string;
};

export type AdminOrder = {
  _id: string;
  orderNumber?: string;
  status?: string;
  paymentStatus?: string;
  grandTotal?: number;
  createdAt?: string;
};

export type AdminDoctor = {
  _id: string;
  fullName: string;
  specialization?: string;
  status?: string;
  createdAt?: string;
};

export type AdminConsultancy = {
  _id: string;
  status?: string;
  mode?: string;
  scheduledAt?: string;
  createdAt?: string;
};

export type AdminMetrics = {
  users: number;
  medicines: number;
  orders: number;
  doctors: number;
  consultancies: number;
};

const unwrap = <T,>(data: unknown): T => {
  const r = data as { data?: unknown };
  return (r?.data as T) ?? (data as T);
};

export const getAdminMetrics = async (): Promise<AdminMetrics> => {
  const res = await api.get("/admin/metrics");
  return unwrap<AdminMetrics>(res.data);
};

export const getAdminUsers = async (): Promise<AdminUser[]> => {
  const res = await api.get("/admin/users");
  return unwrap<AdminUser[]>(res.data);
};

export const getAdminMedicines = async (): Promise<AdminMedicine[]> => {
  const res = await api.get("/admin/medicines");
  return unwrap<AdminMedicine[]>(res.data);
};

export const getAdminOrders = async (): Promise<AdminOrder[]> => {
  const res = await api.get("/admin/orders");
  return unwrap<AdminOrder[]>(res.data);
};

export const getAdminDoctors = async (): Promise<AdminDoctor[]> => {
  const res = await api.get("/admin/doctors");
  return unwrap<AdminDoctor[]>(res.data);
};

export const getAdminConsultancies = async (): Promise<AdminConsultancy[]> => {
  const res = await api.get("/admin/consultancies");
  return unwrap<AdminConsultancy[]>(res.data);
};

export const updateAdminUser = async (
  userId: string,
  patch: { role?: string; status?: string },
): Promise<AdminUser> => {
  const res = await api.patch(`/admin/users/${userId}`, patch);
  return unwrap<AdminUser>(res.data);
};

export const createAdminMedicine = async (payload: {
  name: string;
  slug?: string;
  price: number;
  stockQty?: number;
  status?: string;
}): Promise<AdminMedicine> => {
  const res = await api.post("/admin/medicines", payload);
  return unwrap<AdminMedicine>(res.data);
};

export const updateAdminMedicine = async (
  medicineId: string,
  patch: {
    name?: string;
    slug?: string;
    price?: number;
    stockQty?: number;
    status?: string;
  },
): Promise<AdminMedicine> => {
  const res = await api.patch(`/admin/medicines/${medicineId}`, patch);
  return unwrap<AdminMedicine>(res.data);
};

export const deleteAdminMedicine = async (medicineId: string): Promise<void> => {
  await api.delete(`/admin/medicines/${medicineId}`);
};

export const updateAdminOrderStatus = async (
  orderId: string,
  status: string,
): Promise<AdminOrder> => {
  const res = await api.patch(`/admin/orders/${orderId}/status`, { status });
  return unwrap<AdminOrder>(res.data);
};
