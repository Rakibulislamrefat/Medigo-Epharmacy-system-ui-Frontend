import api from "../../../utilities/api";

// ── Types ──────────────────────────────────────────────────
export interface ForgotPassword {
  email: string;
}


// ── API Calls ──────────────────────────────────────────────
// POST /api/auth/forgot-password
export const forgotPasswordApi = async (email: string) => {
  const res = await api.post("/auth/forgot-password", { email });
  return res.data;
};
