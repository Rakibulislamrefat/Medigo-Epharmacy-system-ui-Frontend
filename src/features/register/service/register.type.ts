export interface RegisterLocation {
  displayName: string;
  road: string;
  quarter: string;
  suburb: string;
  city: string;
  county: string;
  state_district: string;
  state: string;
  postcode: string;
  country: string;
  country_code: string;
  coordinates: {
    lat: number | null;
    lng: number | null;
  };
}

export interface RegisterFormData {
  role: "user" | "admin" | "pharmacist" | "doctor";
  isAvailable: boolean;
  avatar: File | null;
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  bloodType: string;
  gender: string;
  age: string;
  weight: string;
  dateOfBirth: string;
  totalDonations?: string;
  lastDonationDate?: string;
  location: RegisterLocation;
  socialLinks: {
    facebook: string;
    instagram: string;
    twitter: string;
  };
}

export interface RegisterAddress {
  label: string;
  name: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
  country_code: string;
  coordinates: {
    lat: number | null;
    lng: number | null;
  };
  isDefault: boolean;
}

export interface RegisterPayload {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: "user" | "admin" | "pharmacist" | "doctor";
  addresses: RegisterAddress[];
}

export interface RegisterResponse {
  success?: boolean;
  message?: string;
  data?: unknown;
}
