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
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch("https://ipapi.co/json/", { signal: controller.signal });
    if (!res.ok) throw new Error("Failed to fetch IP location");
    const data = (await res.json()) as {
      latitude?: number | string;
      longitude?: number | string;
      city?: string;
      region?: string;
      country_name?: string;
      country_code?: string;
    };

    const latitude = Number(data.latitude);
    const longitude = Number(data.longitude);
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;

    const ipDetails: LocationDetails = {
      city: data.city,
      state: data.region,
      country: data.country_name,
      country_code: data.country_code?.toLowerCase(),
    };

    const geo = await reverseGeocode(latitude, longitude);
    const details = { ...geo.details, ...ipDetails };
    const displayName =
      geo.displayName ||
      data.city ||
      data.region ||
      data.country_name ||
      "Unknown location";

    return { latitude, longitude, displayName, details };
  } catch (error) {
    console.error("IP location error:", error);
    return null;
  } finally {
    window.clearTimeout(timeoutId);
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
