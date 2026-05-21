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
  image?: string;
  imageUrl?: string;
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
  user?: { _id: string; name?: string; email?: string; phone?: string };
  status?: string;
  paymentStatus?: string;
  grandTotal?: number;
  contactName?: string;
  contactPhone?: string;
  deliveryAddress?: {
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    postcode?: string;
    country?: string;
  };
  items?: {
    product?: { _id?: string; name?: string };
    nameSnapshot?: string;
    unitPrice?: number;
    qty?: number;
    lineTotal?: number;
  }[];
  createdAt?: string;
  updatedAt?: string;
};

export type AdminRequestedOrder = {
  _id?: string;
  status?: string;
  paymentStatus?: string;
  grandTotal?: number;
  total?: number;
  createdAt?: string;
  updatedAt?: string;
  medicines?: {
    medicineId?: string;
    name?: string;
    quantity?: number;
    price?: number | null;
    salePrice?: number | null;
  }[];
  items?: {
    name?: string;
    quantity?: number;
    qty?: number;
    price?: number | null;
    salePrice?: number | null;
    lineTotal?: number;
  }[];
};

export type AdminPrescriptionOrder = {
  _id?: string;
  status?: string;
  paymentStatus?: string;
  grandTotal?: number;
  total?: number;
  createdAt?: string;
  updatedAt?: string;
  medicines?: {
    medicineId?: string;
    name?: string;
    quantity?: number;
    price?: number;
    salePrice?: number;
  }[];
};

export type AdminDoctor = {
  _id: string;
  fullName: string;
  profileImage?: string;
  qualifications?: string[];
  specialization?: string;
  experienceYears?: number;
  consultationType?: "online" | "in-person" | "both" | string;
  city?: string;
  availability?: {
    day: string;
    startTime: string;
    endTime: string;
  }[];
  nextAvailableAt?: string;
  fee?: number;
  currency?: string;
  registrationNumber?: string;
  bio?: string;
  languages?: string[];
  email?: string;
  phone?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type AdminDoctorPayload = {
  fullName: string;
  profileImage?: string;
  qualifications?: string[];
  specialization: string;
  experienceYears?: number;
  consultationType: "online" | "in-person" | "both";
  city: string;
  availability?: {
    day: string;
    startTime: string;
    endTime: string;
  }[];
  nextAvailableAt?: string;
  fee: number;
  currency?: string;
  registrationNumber?: string;
  bio?: string;
  languages?: string[];
  email: string;
  phone: string;
  status?: string;
};

export type AdminDoctorPayloadWithFile = AdminDoctorPayload & {
  profileImageFile?: File;
};

export type AdminDoctorUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  status?: string;
};

export type AdminConsultancy = {
  _id: string;
  user?: string | { _id: string; name?: string; email?: string; phone?: string };
  doctor?: string | { _id: string; fullName?: string; specialization?: string };
  transaction?: string | { _id: string } | null;
  status?: string;
  mode?: string;
  scheduledAt?: string;
  durationMinutes?: number;
  patientName?: string;
  contactPhone?: string;
  contactEmail?: string;
  symptoms?: string;
  notes?: string;
  attachments?: string[];
  meetingLink?: string;
  paymentStatus?: string;
  createdAt?: string;
  updatedAt?: string;
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

type AdminPagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
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
  const raw = res.data as unknown;
  const payload = (raw as { data?: unknown })?.data ?? raw;
  const pagination =
    (payload as { pagination?: AdminPagination })?.pagination ??
    (payload as { meta?: AdminPagination })?.meta ??
    (raw as { pagination?: AdminPagination })?.pagination ??
    (raw as { meta?: AdminPagination })?.meta;

  const items = Array.isArray(payload)
    ? (payload as AdminUser[])
    : Array.isArray((payload as { items?: unknown })?.items)
    ? ((payload as { items?: AdminUser[] }).items as AdminUser[])
    : [];

  return {
    items,
    meta: pagination ?? { page: 1, limit: params?.limit ?? 10, total: items.length, totalPages: 1 },
  };
};

export const getAdminMedicines = async (params?: {
  q?: string;
  page?: number;
  limit?: number;
  status?: string;
}): Promise<AdminPaged<AdminMedicine>> => {
  const res = await api.get("/admin/medicines", { params });
  const raw = res.data as unknown;
  const payload = (raw as { data?: unknown })?.data as { data?: unknown; meta?: AdminListMeta } | undefined;
  const data = payload?.data ?? payload ?? raw;
  const meta = payload?.meta ?? (raw as { meta?: AdminListMeta })?.meta;

  const items = Array.isArray(data)
    ? (data as AdminMedicine[])
    : Array.isArray((data as { items?: unknown })?.items)
    ? ((data as { items?: AdminMedicine[] }).items as AdminMedicine[])
    : [];

  return {
    items,
    meta: meta ?? { page: 1, limit: params?.limit ?? 10, total: 0, totalPages: 1 },
  };
};

export const getAdminOrders = async (params?: {
  q?: string;
  page?: number;
  limit?: number;
  status?: string;
  paymentStatus?: string;
}): Promise<AdminPaged<AdminOrder>> => {
  try {
    const res = await api.get("/admin/orders", { params });
    const raw = res.data as unknown;
    const payload = (raw as { data?: unknown })?.data ?? raw;
    const pagination =
      (payload as { pagination?: AdminPagination })?.pagination ??
      (payload as { meta?: AdminPagination })?.meta ??
      (raw as { pagination?: AdminPagination })?.pagination ??
      (raw as { meta?: AdminPagination })?.meta;

    const items = Array.isArray(payload)
      ? (payload as AdminOrder[])
      : Array.isArray((payload as { items?: unknown })?.items)
      ? ((payload as { items?: AdminOrder[] }).items as AdminOrder[])
      : [];

    return {
      items,
      meta: pagination ?? { page: 1, limit: params?.limit ?? 10, total: items.length, totalPages: 1 },
    };
  } catch (err) {
    // Fallback: some backends expose orders at /orders instead of /admin/orders
    try {
      const res = await api.get("/orders", { params });
      const raw = res.data as unknown;
      const payload = (raw as { data?: unknown })?.data ?? raw;
      const pagination =
        (payload as { pagination?: AdminPagination })?.pagination ??
        (payload as { meta?: AdminPagination })?.meta ??
        (raw as { pagination?: AdminPagination })?.pagination ??
        (raw as { meta?: AdminPagination })?.meta;

      const items = Array.isArray(payload)
        ? (payload as AdminOrder[])
        : Array.isArray((payload as { items?: unknown })?.items)
        ? ((payload as { items?: AdminOrder[] }).items as AdminOrder[])
        : [];

      return {
        items,
        meta: pagination ?? { page: 1, limit: params?.limit ?? 10, total: items.length, totalPages: 1 },
      };
    } catch (err2) {
      throw err2;
    }
  }
};

export const getAdminReadyOrders = async (params?: {
  q?: string;
  page?: number;
  limit?: number;
  paymentStatus?: string;
}): Promise<AdminPaged<AdminOrder>> => {
  const res = await api.get("/admin/orders/ready", { params });
  const raw = res.data as unknown;
  const payload = (raw as { data?: unknown })?.data ?? raw;
  const pagination =
    (payload as { pagination?: AdminPagination })?.pagination ??
    (payload as { meta?: AdminPagination })?.meta ??
    (raw as { pagination?: AdminPagination })?.pagination ??
    (raw as { meta?: AdminPagination })?.meta;

  const items = Array.isArray(payload)
    ? (payload as AdminOrder[])
    : Array.isArray((payload as { items?: unknown })?.items)
    ? ((payload as { items?: AdminOrder[] }).items as AdminOrder[])
    : [];

  return {
    items,
    meta: pagination ?? { page: 1, limit: params?.limit ?? 10, total: items.length, totalPages: 1 },
  };
};

const toPagedResponse = <T,>(
  raw: unknown,
  fallback: { page: number; limit: number },
): AdminPaged<T> => {
  const payload = (raw as { data?: unknown })?.data ?? raw;
  const pagination =
    (payload as { pagination?: AdminPagination })?.pagination ??
    (payload as { meta?: AdminPagination })?.meta ??
    (raw as { pagination?: AdminPagination })?.pagination ??
    (raw as { meta?: AdminPagination })?.meta;

  const items = Array.isArray(payload)
    ? (payload as T[])
    : Array.isArray((payload as { items?: unknown })?.items)
    ? ((payload as { items?: T[] }).items as T[])
    : Array.isArray((payload as { rows?: unknown })?.rows)
    ? ((payload as { rows?: T[] }).rows as T[])
    : [];

  return {
    items,
    meta: pagination ?? {
      page: fallback.page,
      limit: fallback.limit,
      total: items.length,
      totalPages: 1,
    },
  };
};

export const getAdminRequestedOrders = async (params?: {
  page?: number;
  limit?: number;
  status?: string;
}): Promise<AdminPaged<AdminRequestedOrder>> => {
  const res = await api.get("/request-orders", { params });
  return toPagedResponse<AdminRequestedOrder>(res.data, {
    page: params?.page ?? 1,
    limit: params?.limit ?? 10,
  });
};

export const getAdminPrescriptionOrders = async (params?: {
  page?: number;
  limit?: number;
  status?: string;
  user?: string;
}): Promise<AdminPaged<AdminPrescriptionOrder>> => {
  const res = await api.get("/prescription-orders", { params });
  return toPagedResponse<AdminPrescriptionOrder>(res.data, {
    page: params?.page ?? 1,
    limit: params?.limit ?? 10,
  });
};

export const getAdminReadyDoctors = async (params?: {
  q?: string;
  specialization?: string;
  page?: number;
  limit?: number;
}): Promise<AdminPaged<AdminDoctor>> => {
  const res = await api.get("/admin/doctors/ready", { params });
  const raw = res.data as unknown;
  const payload = (raw as { data?: unknown })?.data ?? raw;
  const pagination =
    (payload as { pagination?: AdminPagination })?.pagination ??
    (payload as { meta?: AdminPagination })?.meta ??
    (raw as { pagination?: AdminPagination })?.pagination ??
    (raw as { meta?: AdminPagination })?.meta;

  const items = Array.isArray(payload)
    ? (payload as AdminDoctor[])
    : Array.isArray((payload as { items?: unknown })?.items)
    ? ((payload as { items?: AdminDoctor[] }).items as AdminDoctor[])
    : [];

  return {
    items,
    meta: pagination ?? { page: 1, limit: params?.limit ?? 10, total: items.length, totalPages: 1 },
  };
};

export const getAdminDoctors = async (params?: {
  search?: string;
  page?: number;
  rows?: number;
  status?: string;
}): Promise<AdminPaged<AdminDoctor>> => {
  const res = await api.get("/doctors", { params });
  const raw = res.data as unknown;
  const payload = (raw as { data?: unknown })?.data ?? raw;
  const pagination =
    (payload as { pagination?: AdminPagination })?.pagination ??
    (payload as { meta?: AdminPagination })?.meta ??
    (raw as { pagination?: AdminPagination })?.pagination ??
    (raw as { meta?: AdminPagination })?.meta;

  const items = Array.isArray(payload)
    ? (payload as AdminDoctor[])
    : Array.isArray((payload as { items?: unknown })?.items)
    ? ((payload as { items?: AdminDoctor[] }).items as AdminDoctor[])
    : [];

  return {
    items,
    meta: pagination ?? { page: 1, limit: params?.rows ?? 10, total: items.length, totalPages: 1 },
  };
};

export const getAdminConsultancies = async (params?: {
  page?: number;
  limit?: number;
  status?: string;
  mode?: string;
  doctor?: string;
  user?: string;
}): Promise<AdminPaged<AdminConsultancy>> => {
  const res = await api.get("/consultancies", { params });
  const raw = res.data as unknown;
  const payload = (raw as { data?: unknown })?.data ?? raw;
  const pagination =
    (payload as { pagination?: AdminPagination })?.pagination ??
    (payload as { meta?: AdminPagination })?.meta ??
    (raw as { pagination?: AdminPagination })?.pagination ??
    (raw as { meta?: AdminPagination })?.meta;
  const items = Array.isArray(payload)
    ? (payload as AdminConsultancy[])
    : Array.isArray((payload as { items?: unknown })?.items)
    ? ((payload as { items?: AdminConsultancy[] }).items as AdminConsultancy[])
    : [];

  return {
    items,
    meta: pagination ?? { page: 1, limit: params?.limit ?? 10, total: items.length, totalPages: 1 },
  };
};

export const updateAdminUser = async (
  userId: string,
  patch: { role?: string; status?: string },
): Promise<AdminUser> => {
  const res = await api.patch(`/admin/users/${userId}`, patch);
  return unwrap<AdminUser>(res.data);
};

export const createAdminPharmacist = async (payload: {
  name: string;
  email: string;
  phone: string;
  password: string;
  status?: string;
}): Promise<AdminUser> => {
  const res = await api.post("/auth/pharmacists", payload);
  return unwrap<AdminUser>(res.data);
};

export const resetAdminUserPassword = async (email: string): Promise<{ message?: string }> => {
  const res = await api.post("/auth/pharmacists/reset-password", { email });
  return unwrap<{ message?: string }>(res.data);
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
  imageFile?: File;
}): Promise<AdminMedicine> => {
  const formData = new FormData();

  Object.entries(payload).forEach(([key, value]) => {
    if (key === "imageFile" || key === "images") return;
    if (value === null || value === undefined || value === "") return;

    formData.append(key, Array.isArray(value) ? value.join(",") : String(value));
  });

  if (payload.imageFile) {
    formData.append("image", payload.imageFile, payload.imageFile.name);
  }

  const res = await api.post("/products", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
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
    imageFile?: File;
  },
): Promise<AdminMedicine> => {
  // If image file is provided, use FormData
  if (patch.imageFile) {
    const formData = new FormData();

    // Add all text fields
    Object.entries(patch).forEach(([key, value]) => {
      if (key === 'imageFile') return; // Skip imageFile, handle separately

      if (value !== null && value !== undefined) {
        if (Array.isArray(value)) {
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, String(value));
        }
      }
    });

    // Add image file
    formData.append('image', patch.imageFile);

    const res = await api.patch(`/admin/medicines/${medicineId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return unwrap<AdminMedicine>(res.data);
  }

  // Original JSON approach for backward compatibility
  const { imageFile, ...jsonPatch } = patch;
  const res = await api.patch(`/admin/medicines/${medicineId}`, jsonPatch);
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

export const createAdminDoctorUser = async (payload: {
  name: string;
  email: string;
  phone: string;
  password: string;
}): Promise<AdminDoctorUser> => {
  const res = await api.post("/auth/register", {
    name: payload.name,
    email: payload.email,
    phone: payload.phone,
    password: payload.password,
    role: "doctor",
    addresses: [],
  });
  return unwrap<AdminDoctorUser>(res.data);
};

export const createAdminDoctor = async (
  payload: AdminDoctorPayloadWithFile,
): Promise<AdminDoctor> => {
  if (payload.profileImageFile) {
    const formData = new FormData();

    Object.entries(payload).forEach(([key, value]) => {
      if (key === "profileImageFile") return;
      if (value === undefined || value === null) return;
      if (key === "profileImage" && payload.profileImageFile) return;
      if (key === "qualifications" || key === "languages" || key === "availability") {
        formData.append(key, JSON.stringify(value));
        return;
      }
      formData.append(key, String(value));
    });

    formData.append("profileImage", payload.profileImageFile);

    const res = await api.post("/doctors", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return unwrap<AdminDoctor>(res.data);
  }

  const res = await api.post("/doctors", payload);
  return unwrap<AdminDoctor>(res.data);
};

export const updateAdminDoctor = async (
  doctorId: string,
  patch: Partial<AdminDoctorPayloadWithFile>,
): Promise<AdminDoctor> => {
  if (patch.profileImageFile) {
    const formData = new FormData();

    Object.entries(patch).forEach(([key, value]) => {
      if (key === "profileImageFile") return;
      if (value === undefined || value === null) return;
      if (key === "profileImage" && patch.profileImageFile) return;
      if (key === "qualifications" || key === "languages" || key === "availability") {
        formData.append(key, JSON.stringify(value));
        return;
      }
      formData.append(key, String(value));
    });

    formData.append("profileImage", patch.profileImageFile);

    const res = await api.patch(`/doctors/${doctorId}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return unwrap<AdminDoctor>(res.data);
  }

  const res = await api.patch(`/doctors/${doctorId}`, patch);
  return unwrap<AdminDoctor>(res.data);
};

export const deleteAdminDoctor = async (doctorId: string): Promise<void> => {
  await api.delete(`/doctors/${doctorId}`);
};

export const createAdminConsultancy = async (payload: {
  userId?: string;
  doctorId: string;
  patientName?: string;
  contactPhone?: string;
  contactEmail?: string;
  mode?: string;
  scheduledAt?: string | null;
  durationMinutes?: number;
  symptoms?: string;
  notes?: string;
  attachments?: string[];
}): Promise<AdminConsultancy> => {
  const res = await api.post("/consultancies", payload);
  return unwrap<AdminConsultancy>(res.data);
};

export const updateAdminConsultancy = async (
  consultancyId: string,
  patch: {
    status?: string;
    mode?: string;
    scheduledAt?: string | null;
    durationMinutes?: number;
    notes?: string;
    meetingLink?: string;
  },
): Promise<AdminConsultancy> => {
  const res = await api.patch(`/consultancies/${consultancyId}`, patch);
  return unwrap<AdminConsultancy>(res.data);
};

export const markAdminConsultancyReady = async (consultancyId: string): Promise<AdminConsultancy> => {
  const res = await api.patch(`/consultancies/${consultancyId}/ready`);
  return unwrap<AdminConsultancy>(res.data);
};

export const sendAdminConsultancyConfirmation = async (
  consultancyId: string,
): Promise<boolean> => {
  const res = await api.post(`/consultancies/${consultancyId}/send-confirmation`);
  const payload = unwrap<{ success?: boolean }>(res.data);
  return Boolean(payload?.success);
};

export const deleteAdminConsultancy = async (consultancyId: string): Promise<void> => {
  await api.delete(`/consultancies/${consultancyId}`);
};
