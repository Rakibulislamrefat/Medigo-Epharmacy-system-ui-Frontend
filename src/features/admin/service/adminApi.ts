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
