import api from "../../../utilities/api";

const unwrap = <T,>(data: unknown): T => {
  const r = data as { data?: unknown };
  return (r?.data as T) ?? (data as T);
};

export type CreateConsultancyPayload = {
  userId?: string;
  doctorId: string;
  status?: string;
  mode?: string;
  scheduledAt?: string | null;
  patientName?: string;
  contactPhone?: string;
  notes?: string;
};

export const createConsultancy = async (payload: CreateConsultancyPayload) => {
  // Prefer public endpoint first
  try {
    const res = await api.post("/consultancies", payload);
    return unwrap(res.data);
  } catch (err) {
    // fallback to admin endpoint (best-effort)
    try {
      const res = await api.post("/admin/consultancies", payload);
      return unwrap(res.data);
    } catch (err2) {
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
