import api from "../../../utilities/api";

// ── API Calls ──────────────────────────────────────────────

// POST /api/auth/reset-password
export const resetPasswordApi = async (token: string, password: string) => {
  const res = await api.post("/auth/reset-password", { token, newPassword: password });
  return res.data;
};