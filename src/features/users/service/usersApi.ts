import api from "../../../utilities/api";

export type UserRole = "user" | "admin" | "pharmacist" | "doctor";
export type UserStatus = "active" | "blocked" | "pending";

export type Address = {
  _id?: string;
  label: string;
  name: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
  country_code?: string;
  coordinates?: {
    lat: number | null;
    lng: number | null;
  };
  isDefault: boolean;
};

export type User = {
  _id: string;
  role: UserRole;
  status: UserStatus;
  name: string;
  email: string;
  phone: string;
  isEmailVerified: boolean;
  addresses: Address[];
  createdAt: string;
  updatedAt: string;
};

export type UsersListResponse = {
  items: User[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type UsersFilters = {
  q?: string;
  role?: UserRole;
  status?: UserStatus;
  page?: number;
  limit?: number;
};

const unwrap = <T,>(data: unknown): T => {
  const r = data as { data?: unknown };
  return (r?.data as T) ?? (data as T);
};

export const getUsers = async (filters: UsersFilters): Promise<UsersListResponse> => {
  const params = new URLSearchParams();
  if (filters.q) params.append("q", filters.q);
  if (filters.role) params.append("role", filters.role);
  if (filters.status) params.append("status", filters.status);
  if (filters.page) params.append("page", filters.page.toString());
  if (filters.limit) params.append("limit", filters.limit.toString());

  const res = await api.get(`/users${params.toString() ? `?${params}` : ""}`);
  return unwrap<UsersListResponse>(res.data);
};

export const getUserById = async (id: string): Promise<User> => {
  const res = await api.get(`/users/${id}`);
  return unwrap<User>(res.data);
};

export const getConsultants = async (filters: UsersFilters): Promise<UsersListResponse> => {
  const params = new URLSearchParams();
  if (filters.q) params.append("q", filters.q);
  params.append("role", "doctor");
  if (filters.status) params.append("status", filters.status);
  if (filters.page) params.append("page", filters.page.toString());
  if (filters.limit) params.append("limit", filters.limit.toString());

  const res = await api.get(`/users${params.toString() ? `?${params}` : ""}`);
  return unwrap<UsersListResponse>(res.data);
};

export const getPharmacists = async (filters: UsersFilters): Promise<UsersListResponse> => {
  const params = new URLSearchParams();
  if (filters.q) params.append("q", filters.q);
  params.append("role", "pharmacist");
  if (filters.status) params.append("status", filters.status);
  if (filters.page) params.append("page", filters.page.toString());
  if (filters.limit) params.append("limit", filters.limit.toString());

  const res = await api.get(`/users${params.toString() ? `?${params}` : ""}`);
  return unwrap<UsersListResponse>(res.data);
};
