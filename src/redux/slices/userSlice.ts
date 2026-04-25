import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

// ── Public User Type (no sensitive fields) ─────────────────
export interface IReduxUser {
  _id: string;
  name: string;
  email: string;
  phone: string;
  age: number | null;
  gender: "male" | "female" | null;
  avatar: string;
  bloodType: "A+" | "A-" | "B+" | "B-" | "O+" | "O-" | "AB+" | "AB-" | null;
  weight: number | null;
  lastDonationDate?: string | null;
  totalDonations?: number;
  isAvailable?: boolean;
  lastReceivedDate?: string | null;
  totalReceived?: number;
  location: {
    city: string;
    country: string;
    country_code: string;
    county: string;
    postcode: string;
    state: string;
    state_district: string;
    coordinates: { lat: number | null; lng: number | null };
  };
  socialLinks: {
    facebook: string | null;
    instagram: string | null;
    twitter: string | null;
  };
  role: "donor" | "user" | "admin" | "hospital";
  isVerified: boolean;
  isDonorVerified?: boolean;
  isActive: boolean;
  communityFlags: number;
  createdAt: string;
  updatedAt: string;
}

// ── Slice State ────────────────────────────────────────────
interface UserState {
  isAuthenticated: boolean;
  user: IReduxUser | null;
  token: string | null; // access token (from login response)
  isLoading: boolean; // for /me re-fetch on app load
}

const initialState: UserState = {
  isAuthenticated: false,
  user: null,
  token: null,
  isLoading: false,
};


// ── Slice ──────────────────────────────────────────────────
const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    // After POST /api/auth/login
    setUser: (
      state,
      action: PayloadAction<{ user: IReduxUser; token: string }>,
    ) => {
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isLoading = false;
    },

    //After GET /api/auth/me (re-hydrate user on app reload)
    setAuthUser: (state, action: PayloadAction<IReduxUser>) => {
      state.isAuthenticated = true;
      state.user = action.payload;
      state.isLoading = false;
    },

    //After POST /api/auth/logout
    clearUser: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      state.isLoading = false;
    },

    //After profile update (partial user fields only)
    updateUser: (state, action: PayloadAction<Partial<IReduxUser>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },

    //Toggle donor availability (isAvailable field)
    setAvailability: (state, action: PayloadAction<boolean>) => {
      if (state.user) {
        state.user.isAvailable = action.payload;
      }
    },

    // Update access token (after POST /api/auth/refresh-token)
    setToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
    },

    //Loading state (when calling /me on startup)
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
  },
});

export const {
  setUser,
  setAuthUser,
  clearUser,
  updateUser,
  setAvailability,
  setToken,
  setLoading,
} = userSlice.actions;

export default userSlice.reducer;
