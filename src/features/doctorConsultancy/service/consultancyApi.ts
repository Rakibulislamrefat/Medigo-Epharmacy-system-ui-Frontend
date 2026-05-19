import api from "../../../utilities/api";

const unwrap = <T,>(data: unknown): T => {
  const r = data as { data?: unknown };
  return (r?.data as T) ?? (data as T);
};

export type ConsultancyMode = "chat" | "video" | "audio" | "in_person";

export type CreateConsultancyPayload = {
  userId?: string;
  doctorId: string;
  status?: string;
  patientName?: string;
  contactPhone?: string;
  contactEmail?: string;
  mode?: ConsultancyMode;
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
  user?: string;
  doctor?: {
    _id?: string;
    fullName?: string;
    name?: string;
    specialization?: string;
  } | string;
  patientName?: string;
  contactPhone?: string;
  contactEmail?: string;
  status?: string;
  mode?: ConsultancyMode;
  scheduledAt?: string;
  durationMinutes?: number;
  symptoms?: string;
  notes?: string;
  attachments?: string[];
  meetingLink?: string;
  paymentStatus?: string;
  transaction?: string | null;
  createdAt?: string;
  updatedAt?: string;
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
  const res = await api.post("/consultancies", payload);
  return unwrap<ConsultancyResponse>(res.data);
};

export const getMyConsultancies = async (): Promise<ConsultancyResponse[]> => {
  const res = await api.get("/consultancies/me");
  const payload = res.data as { data?: unknown };
  return (payload?.data as ConsultancyResponse[]) ?? (res.data as ConsultancyResponse[]);
};

export const sendConsultancyConfirmation = async (consultancyId: string) => {
  const res = await api.post(`/consultancies/${consultancyId}/send-confirmation`);
  const payload = unwrap<{ success?: boolean }>(res.data);
  return Boolean(payload?.success);
};
