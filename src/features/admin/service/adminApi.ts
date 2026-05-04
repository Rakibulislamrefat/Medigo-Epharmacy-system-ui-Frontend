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
  genericName?: string;
  brandName?: string;
  dosageForm?: string;
  strength?: string;
  description?: string;
  indications?: string[];
  warnings?: string[];
  otc?: boolean;
  requiresPrescription?: boolean;
  categories?: string[];
  tags?: string[];
  images?: string[];
  sku?: string;
  manufacturer?: string;
  price?: number;
  salePrice?: number | null;
  currency?: string;
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
  user?: { _id: string; name: string; email?: string; phone?: string } | null;
  fullName: string;
  specialization?: string;
  status?: string;
  createdAt?: string;
};

export type AdminConsultancy = {
  _id: string;
  user?: { _id: string; name: string; email?: string; phone?: string };
  doctor?: { _id: string; fullName: string; specialization?: string };
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

export type AdminListMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  q?: string;
  status?: string;
  role?: string;
  paymentStatus?: string;
  mode?: string;
  doctorId?: string;
  userId?: string;
};

export type AdminPaged<T> = {
  items: T[];
  meta: AdminListMeta;
};

const unwrap = <T,>(data: unknown): T => {
  const r = data as { data?: unknown };
  return (r?.data as T) ?? (data as T);
};

export const getAdminMetrics = async (): Promise<AdminMetrics> => {
  const res = await api.get("/admin/metrics");
  return unwrap<AdminMetrics>(res.data);
};

export const getAdminUsers = async (params?: {
  q?: string;
  page?: number;
  limit?: number;
  role?: string;
  status?: string;
}): Promise<AdminPaged<AdminUser>> => {
  const res = await api.get("/admin/users", { params });
  const r = res.data as { data?: AdminUser[]; meta?: AdminListMeta };
  return {
    items: r?.data ?? [],
    meta: r?.meta ?? { page: 1, limit: params?.limit ?? 10, total: 0, totalPages: 1 },
  };
};

export const getAdminMedicines = async (params?: {
  q?: string;
  page?: number;
  limit?: number;
  status?: string;
}): Promise<AdminPaged<AdminMedicine>> => {
  const res = await api.get("/admin/medicines", { params });
  const r = res.data as { data?: AdminMedicine[]; meta?: AdminListMeta };
  return {
    items: r?.data ?? [],
    meta: r?.meta ?? { page: 1, limit: 10, total: 0, totalPages: 1 },
  };
};

export const getAdminOrders = async (params?: {
  q?: string;
  page?: number;
  limit?: number;
  status?: string;
  paymentStatus?: string;
}): Promise<AdminPaged<AdminOrder>> => {
  const res = await api.get("/admin/orders", { params });
  const r = res.data as { data?: AdminOrder[]; meta?: AdminListMeta };
  return {
    items: r?.data ?? [],
    meta: r?.meta ?? { page: 1, limit: params?.limit ?? 10, total: 0, totalPages: 1 },
  };
};

export const getAdminDoctors = async (params?: {
  q?: string;
  page?: number;
  limit?: number;
  status?: string;
}): Promise<AdminPaged<AdminDoctor>> => {
  const res = await api.get("/admin/doctors", { params });
  const r = res.data as { data?: AdminDoctor[]; meta?: AdminListMeta };
  return {
    items: r?.data ?? [],
    meta: r?.meta ?? { page: 1, limit: params?.limit ?? 10, total: 0, totalPages: 1 },
  };
};

export const getAdminConsultancies = async (params?: {
  page?: number;
  limit?: number;
  status?: string;
  mode?: string;
  doctorId?: string;
  userId?: string;
}): Promise<AdminPaged<AdminConsultancy>> => {
  const res = await api.get("/admin/consultancies", { params });
  const r = res.data as { data?: AdminConsultancy[]; meta?: AdminListMeta };
  return {
    items: r?.data ?? [],
    meta: r?.meta ?? { page: 1, limit: params?.limit ?? 10, total: 0, totalPages: 1 },
  };
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
  genericName?: string;
  brandName?: string;
  dosageForm?: string;
  strength?: string;
  description?: string;
  indications?: string[] | string;
  warnings?: string[] | string;
  otc?: boolean;
  requiresPrescription?: boolean;
  categories?: string[] | string;
  tags?: string[] | string;
  images?: string[] | string;
  sku?: string;
  manufacturer?: string;
  price: number;
  salePrice?: number | null;
  currency?: string;
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
    genericName?: string;
    brandName?: string;
    dosageForm?: string;
    strength?: string;
    description?: string;
    indications?: string[] | string;
    warnings?: string[] | string;
    otc?: boolean;
    requiresPrescription?: boolean;
    categories?: string[] | string;
    tags?: string[] | string;
    images?: string[] | string;
    sku?: string;
    manufacturer?: string;
    price?: number;
    salePrice?: number | null;
    currency?: string;
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

export const updateAdminOrder = async (
  orderId: string,
  patch: { status?: string; paymentStatus?: string },
): Promise<AdminOrder> => {
  const res = await api.patch(`/admin/orders/${orderId}`, patch);
  return unwrap<AdminOrder>(res.data);
};

export const createAdminDoctor = async (payload: {
  userId?: string;
  fullName: string;
  specialization?: string;
  status?: string;
}): Promise<AdminDoctor> => {
  const res = await api.post("/admin/doctors", payload);
  return unwrap<AdminDoctor>(res.data);
};

export const updateAdminDoctor = async (
  doctorId: string,
  patch: { userId?: string; fullName?: string; specialization?: string; status?: string },
): Promise<AdminDoctor> => {
  const res = await api.patch(`/admin/doctors/${doctorId}`, patch);
  return unwrap<AdminDoctor>(res.data);
};

export const deleteAdminDoctor = async (doctorId: string): Promise<void> => {
  await api.delete(`/admin/doctors/${doctorId}`);
};

export const createAdminConsultancy = async (payload: {
  userId: string;
  doctorId: string;
  status?: string;
  mode?: string;
  scheduledAt?: string | null;
}): Promise<AdminConsultancy> => {
  const res = await api.post("/admin/consultancies", payload);
  return unwrap<AdminConsultancy>(res.data);
};

export const updateAdminConsultancy = async (
  consultancyId: string,
  patch: { status?: string; mode?: string; scheduledAt?: string | null },
): Promise<AdminConsultancy> => {
  const res = await api.patch(`/admin/consultancies/${consultancyId}`, patch);
  return unwrap<AdminConsultancy>(res.data);
};

export const deleteAdminConsultancy = async (consultancyId: string): Promise<void> => {
  await api.delete(`/admin/consultancies/${consultancyId}`);
};
