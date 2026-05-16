import api from "../../../utilities/api";

const unwrap = <T,>(data: unknown): T => {
  const r = data as { data?: unknown };
  return (r?.data as T) ?? (data as T);
};

export type CreateConsultancyPayload = {
  userId?: string;
  doctorId: string;
  status?: string;
  patientName?: string;
  contactPhone?: string;
  contactEmail?: string;
  mode?: string;
  scheduledAt?: string | null;
  durationMinutes?: number;
  symptoms?: string;
  notes?: string;
  attachments?: string[];
  meetingLink?: string;
  paymentStatus?: string;
  transactionId?: string | null;
};

export type ConsultancyResponse = {
  _id?: string;
  id?: string;
  appointmentId?: string;
};

export type PublicDoctor = {
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
  rating?: number;
  totalReviews?: number;
  fee?: number;
  currency?: string;
  bio?: string;
  languages?: string[];
  status?: string;
};

export type PublicDoctorsResponse = {
  items: PublicDoctor[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

export const getPublicDoctors = async (params?: {
  search?: string;
  status?: string;
  page?: number;
  rows?: number;
}): Promise<PublicDoctorsResponse> => {
  const res = await api.get("/doctors", { params });
  const payload = unwrap<PublicDoctorsResponse | PublicDoctor[]>(res.data);

  if (Array.isArray(payload)) {
    return { items: payload };
  }

  return {
    items: Array.isArray(payload?.items) ? payload.items : [],
    pagination: payload?.pagination,
  };
};

export const createConsultancy = async (
  payload: CreateConsultancyPayload,
): Promise<ConsultancyResponse> => {
  // Prefer public endpoint first
  try {
    const res = await api.post("/consultancies", payload);
    return unwrap<ConsultancyResponse>(res.data);
  } catch (err) {
    // fallback to admin endpoint (best-effort)
    try {
      const res = await api.post("/admin/consultancies", payload);
      return unwrap<ConsultancyResponse>(res.data);
    } catch {
      throw err; // rethrow original error
    }
  }
};

export const sendConsultancyConfirmation = async (consultancyId: string) => {
  // Best-effort: try a couple of plausible endpoints
  const attempts = [
    `/consultancies/${consultancyId}/send-confirmation`,
    `/admin/consultancies/${consultancyId}/send-confirmation`,
    `/consultancies/${consultancyId}/notify`,
  ];

  for (const p of attempts) {
    try {
      await api.post(p);
      return true;
    } catch {
      // try next
    }
  }

  return false;
};
