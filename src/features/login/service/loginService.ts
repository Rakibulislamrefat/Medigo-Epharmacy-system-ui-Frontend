import api from "../../../utilities/api";
import { type IReduxUser } from "../../../redux/slices/userSlice";

// ── Types ──────────────────────────────────────────────────
export interface LoginPayload {
  identifier: string;
  password: string;
}

export interface AuthResponse {
  message?: string;
  data?: {
    user?: IReduxUser;
    accessToken?: string;
    message?: string;
  };
  user?: IReduxUser;
  accessToken?: string;
}

// ── API Calls ──────────────────────────────────────────────

// POST /api/auth/login
export const loginApi = async (data: LoginPayload): Promise<AuthResponse> => {
  const res = await api.post("/auth/login", data);
  return res.data;
};

// GET /api/auth/me
export const getAuthUserApi = async (): Promise<IReduxUser> => {
  const res = await api.get("/auth/me");
  return res.data.data;
};

// POST /api/auth/logout
export const logoutApi = async (): Promise<void> => {
  await api.post("/auth/logout");
};
