import { useState } from "react";

export interface LocationDetails {
  city?: string;
  suburb?: string;
  quarter?: string;
  road?: string;
  town?: string;
  village?: string;
  county?: string;
  state_district?: string;
  state?: string;
  postcode?: string;
  country?: string;
  country_code?: string;
}

export interface LocationResult {
  latitude: number;
  longitude: number;
  displayName: string;
  details: LocationDetails;
}

const ipGeocode = async (): Promise<LocationResult | null> => {
  const fetchJsonWithTimeout = async <T,>(url: string, ms: number): Promise<T> => {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), ms);
    try {
      const res = await fetch(url, { signal: controller.signal });
      if (!res.ok) throw new Error(`Request failed: ${res.status}`);
      return (await res.json()) as T;
    } finally {
      window.clearTimeout(timeoutId);
    }
  };

  const firstFulfilled = async <T,>(promises: Promise<T>[]): Promise<T> =>
    await new Promise<T>((resolve, reject) => {
      let rejected = 0;
      const errors: unknown[] = [];
      for (const p of promises) {
        p.then(resolve).catch((e) => {
          errors.push(e);
          rejected += 1;
          if (rejected === promises.length) reject(errors);
        });
      }
    });

  const withTimeout = async <T,>(
    promise: Promise<T>,
    ms: number,
    fallback: T,
  ): Promise<T> => {
    let timeoutId: number | undefined;
    const timeoutPromise = new Promise<T>((resolve) => {
      timeoutId = window.setTimeout(() => resolve(fallback), ms);
    });
    const result = await Promise.race([promise, timeoutPromise]);
    if (timeoutId !== undefined) window.clearTimeout(timeoutId);
    return result;
  };

  try {
    const providers = [
      async () => {
        const data = await fetchJsonWithTimeout<{
          latitude?: number | string;
          longitude?: number | string;
          city?: string;
          region?: string;
          country_name?: string;
          country_code?: string;
        }>("https://ipapi.co/json/", 3500);
        return {
          latitude: Number(data.latitude),
          longitude: Number(data.longitude),
          city: data.city,
          region: data.region,
          country: data.country_name,
          country_code: data.country_code?.toLowerCase(),
        };
      },
      async () => {
        const data = await fetchJsonWithTimeout<{
          success?: boolean;
          latitude?: number | string;
          longitude?: number | string;
          city?: string;
          region?: string;
          country?: string;
          country_code?: string;
        }>("https://ipwho.is/", 3500);
        if (data.success === false) throw new Error("ipwho.is returned success=false");
        return {
          latitude: Number(data.latitude),
          longitude: Number(data.longitude),
          city: data.city,
          region: data.region,
          country: data.country,
          country_code: data.country_code?.toLowerCase(),
        };
      },
      async () => {
        const data = await fetchJsonWithTimeout<{
          geoplugin_city?: string;
          geoplugin_region?: string;
          geoplugin_countryName?: string;
          geoplugin_countryCode?: string;
          geoplugin_latitude?: string;
          geoplugin_longitude?: string;
        }>("https://www.geoplugin.net/json.gp", 3500);
        return {
          latitude: Number(data.geoplugin_latitude),
          longitude: Number(data.geoplugin_longitude),
          city: data.geoplugin_city,
          region: data.geoplugin_region,
          country: data.geoplugin_countryName,
          country_code: data.geoplugin_countryCode?.toLowerCase(),
        };
      },
      async () => {
        const data = await fetchJsonWithTimeout<{
          city?: string;
          country_name?: string;
          country_code?: string;
          state?: string;
          latitude?: number | string;
          longitude?: number | string;
        }>("https://geolocation-db.com/json/", 2500);
        return {
          latitude: Number(data.latitude),
          longitude: Number(data.longitude),
          city: data.city,
          region: data.state,
          country: data.country_name,
          country_code: data.country_code?.toLowerCase(),
        };
      },
      async () => {
        const data = await fetchJsonWithTimeout<{
          latitude?: number | string;
          longitude?: number | string;
          city?: string;
          region?: string;
          country?: string;
          country_code?: string;
        }>("https://api.ip.sb/geoip", 2500);
        return {
          latitude: Number(data.latitude),
          longitude: Number(data.longitude),
          city: data.city,
          region: data.region,
          country: data.country,
          country_code: data.country_code?.toLowerCase(),
        };
      },
      async () => {
        const data = await fetchJsonWithTimeout<{
          latitude?: number | string;
          longitude?: number | string;
          city?: string;
          stateProv?: string;
          countryName?: string;
          countryCode?: string;
        }>("https://freeipapi.com/api/json", 3500);
        return {
          latitude: Number(data.latitude),
          longitude: Number(data.longitude),
          city: data.city,
          region: data.stateProv,
          country: data.countryName,
          country_code: data.countryCode?.toLowerCase(),
        };
      },
    ] as const;

    let ipData:
      | {
          latitude: number;
          longitude: number;
          city?: string;
          region?: string;
          country?: string;
          country_code?: string;
        }
      | null = null;

    const attempts = providers.map(
      (provider) =>
        provider().then((next) => {
          if (!Number.isFinite(next.latitude) || !Number.isFinite(next.longitude)) {
            throw new Error("Provider returned invalid coordinates");
          }
          return next;
        }),
    );

    ipData = await withTimeout(
      firstFulfilled(attempts),
      5000,
      null,
    );

    if (!ipData) return null;

    const ipDetails: LocationDetails = {
      city: ipData.city,
      state: ipData.region,
      country: ipData.country,
      country_code: ipData.country_code,
    };

    const geo = await reverseGeocode(ipData.latitude, ipData.longitude);
    const details = { ...geo.details, ...ipDetails };
    const displayName =
      geo.displayName ||
      ipData.city ||
      ipData.region ||
      ipData.country ||
      "Unknown location";

    return {
      latitude: ipData.latitude,
      longitude: ipData.longitude,
      displayName,
      details,
    };
  } catch (error) {
    console.error("IP location error:", error);
    return null;
  }
};

const reverseGeocode = async (lat: number, lon: number) => {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), 8000);
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`;

    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) throw new Error("Failed to fetch location details");

    const data = await res.json();
    const addr = data.address || {};

    return {
      displayName:
        addr.city ||
        addr.town ||
        addr.village ||
        addr.county ||
        "Unknown location",
      details: addr,
    };
  } catch (error) {
    console.error("Error during reverse geocoding:", error);
    return {
      displayName: "Unknown location",
      details: {},
    };
  } finally {
    window.clearTimeout(timeoutId);
  }
};

export const useLocation = () => {
  const [loading, setLoading] = useState(false);

  const getLocation = async (): Promise<LocationResult | null> => {
    const hostname = window.location.hostname;
    const isLocalhost =
      hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1";
    setLoading(true);
    const canUseBrowserGeolocation =
      Boolean(navigator.geolocation) && (window.isSecureContext || isLocalhost);
    if (!canUseBrowserGeolocation) {
      try {
        return await ipGeocode();
      } finally {
        setLoading(false);
      }
    }

    return await new Promise((resolve) => {
      let settled = false;
      const finish = (value: LocationResult | null) => {
        if (settled) return;
        settled = true;
        setLoading(false);
        resolve(value);
      };

      const fallbackTimeoutId = window.setTimeout(() => {
        finish(null);
      }, 15000);

      try {
        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            window.clearTimeout(fallbackTimeoutId);
            try {
              const { latitude, longitude } = pos.coords;

              const geo = await reverseGeocode(latitude, longitude);

              finish({
                latitude,
                longitude,
                displayName: geo.displayName,
                details: geo.details,
              });
            } catch (error) {
              console.error("Error fetching location:", error);
              finish(null);
            }
          },
          async (error) => {
            window.clearTimeout(fallbackTimeoutId);
            console.error("Geolocation error:", error);
            const ip = await ipGeocode();
            finish(ip);
          },
          { enableHighAccuracy: false, timeout: 12000, maximumAge: 0 },
        );
      } catch (error) {
        window.clearTimeout(fallbackTimeoutId);
        console.error("Geolocation exception:", error);
        void ipGeocode().then(finish);
      }
    });
  };

  return { getLocation, loading };
};
