import api from "../../../utilities/api";

// ── Types ──────────────────────────────────────────────────

export interface Session {
  id: string;
  device: string;
  location: string;
  lastActive: string;
  lastActiveAt: string;
  current: boolean;
  loginMethod: string;
  browser: {
    name: string;
    version: string;
    engine: string;
  };
  deviceDetails: {
    type: string;
    brand: string;
    model: string;
    os: string;
    osVersion: string;
  };
  network: {
    ip: string;
    type: string;
    effectiveType: string;
  };
  createdAt: string;
}

interface SessionsResponse {
  totalSessions: number;
  currentSessionId: string;
  sessions: Session[];
}

interface LogoutSessionResponse {
  loggedOutSessionId: string;
  activeSessions: number;
}

interface LogoutOthersResponse {
  loggedOutCount: number;
  activeSessions: number;
}

interface AccountActionResponse {
  message?: string;
}

// ── API Calls ──────────────────────────────────────────────

// GET /api/auth/sessions
export const getSessionsApi = async (): Promise<SessionsResponse> => {
  const res = await api.get("/auth/sessions");
  return res.data.data;
};

// DELETE /api/auth/sessions/:sessionId
export const logoutSessionApi = async (sessionId: string): Promise<LogoutSessionResponse> => {
  const res = await api.delete(`/auth/sessions/${sessionId}`);
  return res.data.data;
};

// POST /api/auth/sessions/logout-others
export const logoutOtherSessionsApi = async (): Promise<LogoutOthersResponse> => {
  const res = await api.post("/auth/sessions/logout-others");
  return res.data.data;
};

// POST /api/v1/auth/deactivate-account
export const deactivateAccountApi = async (): Promise<AccountActionResponse> => {
  const res = await api.post("/api/v1/auth/deactivate-account");
  return res.data;
};

// DELETE /api/v1/auth/delete-account
export const deleteAccountApi = async (
  reason?: string,
): Promise<AccountActionResponse> => {
  const res = await api.delete("/api/v1/auth/delete-account", {
    data: reason ? { reason } : undefined,
  });
  return res.data;
};
