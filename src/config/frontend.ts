export type FrontendConfig = {
  apiBaseUrl: string;
  frontendUrl: string;
  features: {
    sslcommerz: boolean;
    cloudinaryUploads: boolean;
  };
  endpoints: {
    orders: {
      tracking: string;
    };
    auth: {
      login: string;
      adminLogin: string;
    };
    payments: {
      sslcommerzInitiate: string;
    };
  };
};

type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
};

const trimTrailingSlash = (value: string) => value.replace(/\/+$/, "");

const fallbackApiBaseUrl = trimTrailingSlash(
  (import.meta.env.VITE_API_URL as string | undefined) ||
    (import.meta.env.VITE_SERVER_URL as string | undefined) ||
    "http://localhost:5000/api/v1",
);

const fallbackFrontendUrl = trimTrailingSlash(
  (import.meta.env.VITE_CLIENT_URL as string | undefined) ||
    window.location.origin,
);

const fallbackConfig: FrontendConfig = {
  apiBaseUrl: fallbackApiBaseUrl,
  frontendUrl: fallbackFrontendUrl,
  features: {
    sslcommerz: true,
    cloudinaryUploads: true,
  },
  endpoints: {
    orders: {
      tracking: "/orders/:idOrNumber/tracking",
    },
    auth: {
      login: "/auth/login",
      adminLogin: "/auth/admin-login",
    },
    payments: {
      sslcommerzInitiate: "/sslcommerz/initiate",
    },
  },
};

let frontendConfig = fallbackConfig;

const asRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === "object" ? (value as Record<string, unknown>) : {};

const asString = (value: unknown, fallback: string) =>
  typeof value === "string" && value.trim() ? value.trim() : fallback;

const asBoolean = (value: unknown, fallback: boolean) =>
  typeof value === "boolean" ? value : fallback;

const normalizeConfig = (rawConfig: unknown): FrontendConfig => {
  const maybeEnvelope = asRecord(rawConfig);
  const raw = asRecord(maybeEnvelope.data ?? rawConfig) as DeepPartial<FrontendConfig>;

  return {
    apiBaseUrl: trimTrailingSlash(asString(raw.apiBaseUrl, fallbackConfig.apiBaseUrl)),
    frontendUrl: trimTrailingSlash(asString(raw.frontendUrl, fallbackConfig.frontendUrl)),
    features: {
      sslcommerz: asBoolean(raw.features?.sslcommerz, fallbackConfig.features.sslcommerz),
      cloudinaryUploads: asBoolean(
        raw.features?.cloudinaryUploads,
        fallbackConfig.features.cloudinaryUploads,
      ),
    },
    endpoints: {
      orders: {
        tracking: asString(
          raw.endpoints?.orders?.tracking,
          fallbackConfig.endpoints.orders.tracking,
        ),
      },
      auth: {
        login: asString(raw.endpoints?.auth?.login, fallbackConfig.endpoints.auth.login),
        adminLogin: asString(
          raw.endpoints?.auth?.adminLogin,
          fallbackConfig.endpoints.auth.adminLogin,
        ),
      },
      payments: {
        sslcommerzInitiate: asString(
          raw.endpoints?.payments?.sslcommerzInitiate,
          fallbackConfig.endpoints.payments.sslcommerzInitiate,
        ),
      },
    },
  };
};

export const getFrontendConfig = () => frontendConfig;

export const initializeFrontendConfig = async (): Promise<FrontendConfig> => {
  try {
    const response = await fetch(`${fallbackConfig.apiBaseUrl}/config/frontend`, {
      credentials: "include",
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Frontend config request failed with ${response.status}`);
    }

    frontendConfig = normalizeConfig(await response.json());
  } catch (error) {
    console.warn("Using fallback frontend config.", error);
    frontendConfig = fallbackConfig;
  }

  return frontendConfig;
};
