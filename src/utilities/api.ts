import axios from "axios";
import Path from "./paths";
import { store } from "../redux/store";
import { setToken, clearUser } from "../redux/slices/userSlice";

const Api = axios.create({
  baseURL: Path.api,
  withCredentials: true, 
  headers: {
    "Content-Type": "application/json",
  },
});

const refreshBaseURL = Path.server || Path.api.replace(/\/api(\/.*)?$/, "");

const RefreshApi = axios.create({
  baseURL: refreshBaseURL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

let refreshPromise: Promise<string> | null = null;

// ── Request Interceptor ────────────────────────────────────
// Auto-attach access token from Redux to every request
Api.interceptors.request.use(
  (config) => {
    const token = store.getState().user.token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response Interceptor ───────────────────────────────────
// If 401 → try refresh token → retry original request
Api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const requestUrl = originalRequest?.url ?? "";
    const shouldBypassAuthRecovery =
      requestUrl.includes("/auth/login") ||
      requestUrl.includes("/auth/register") ||
      requestUrl.includes("/auth/forgot-password") ||
      requestUrl.includes("/auth/reset-password");

    // skip refresh endpoint itself
    if (
      !originalRequest ||
      requestUrl.includes("/auth/refresh-token") ||
      shouldBypassAuthRecovery
    ) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        if (!refreshPromise) {
          refreshPromise = RefreshApi.post("/api/auth/refresh-token").then((res) => {
            const newToken = res?.data?.data?.accessToken;
            if (!newToken) {
              throw new Error("Missing access token from refresh response");
            }
            return newToken;
          });
        }

        const newToken = await refreshPromise;
        refreshPromise = null;

        store.dispatch(setToken(newToken));

        originalRequest.headers = {
          ...(originalRequest.headers ?? {}),
          Authorization: `Bearer ${newToken}`,
        };

        return Api(originalRequest);
      } catch {
        refreshPromise = null;
        store.dispatch(clearUser());
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default Api;
