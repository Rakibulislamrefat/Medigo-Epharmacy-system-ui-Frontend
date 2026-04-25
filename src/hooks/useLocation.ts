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

const reverseGeocode = async (lat: number, lon: number) => {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`;

    const res = await fetch(url);
    if (!res.ok) throw new Error();

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
  } catch {
    return {
      displayName: "Unknown location",
      details: {},
    };
  }
};

export const useLocation = () => {
  const [loading, setLoading] = useState(false);

  const getLocation = async (): Promise<LocationResult | null> => {
    if (!navigator.geolocation) return null;

    setLoading(true);

    return await new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          try {
            const { latitude, longitude } = pos.coords;

            const geo = await reverseGeocode(latitude, longitude);

            resolve({
              latitude,
              longitude,
              displayName: geo.displayName,
              details: geo.details,
            });
          } catch {
            resolve(null);
          } finally {
            setLoading(false);
          }
        },
        () => {
          setLoading(false);
          resolve(null);
        }
      );
    });
  };

  return { getLocation, loading };
};
