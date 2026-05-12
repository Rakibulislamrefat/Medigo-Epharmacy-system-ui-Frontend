import { Schema, model } from "mongoose";

export type UserRole = "user" | "admin" | "pharmacist" | "doctor";
export type UserStatus = "active" | "blocked" | "pending";

const AddressSchema = new Schema(
  {
    label: { type: String, default: "Home" },
    name: { type: String, default: "" },
    phone: { type: String, default: "" },
    line1: { type: String, default: "" },
    line2: { type: String, default: "" },
    city: { type: String, default: "" },
    state: { type: String, default: "" },
    postcode: { type: String, default: "" },
    country: { type: String, default: "" },
    country_code: { type: String, default: "" },
    coordinates: {
      lat: { type: Number, default: null },
      lng: { type: Number, default: null },
    },
    isDefault: { type: Boolean, default: false },
  },
  { _id: false },
);

const UserSchema = new Schema(
  {
    role: {
      type: String,
      enum: ["user", "admin", "pharmacist", "doctor", "donor"],
      default: "user",
      index: true,
    },
    status: {
      type: String,
      enum: ["active", "blocked", "pending"],
      default: "pending",
      index: true,
    },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true, unique: true },
    phone: { type: String, required: true, trim: true, unique: true },
    passwordHash: { type: String, required: true, select: false },
    avatar: { type: String, trim: true, default: "" },
    bloodType: {
      type: String,
      enum: ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"],
      default: null,
    },
    gender: {
      type: String,
      enum: ["male", "female"],
      default: null,
    },
    age: { type: Number, default: null },
    weight: { type: Number, default: null },
    dateOfBirth: { type: String, default: null },
    isAvailable: { type: Boolean, default: false },
    isDonorVerified: { type: Boolean, default: false },
    totalDonations: { type: Number, default: 0 },
    lastDonationDate: { type: String, default: null },
    totalReceived: { type: Number, default: 0 },
    lastReceivedDate: { type: String, default: null },
    communityFlags: { type: Number, default: 0 },
    location: {
      type: {
        city: { type: String, default: "" },
        state: { type: String, default: "" },
        state_district: { type: String, default: "" },
        county: { type: String, default: "" },
        country: { type: String, default: "" },
        country_code: { type: String, default: "" },
        postcode: { type: String, default: "" },
        coordinates: {
          lat: { type: Number, default: null },
          lng: { type: Number, default: null },
        },
      },
      default: {},
    },
    socialLinks: {
      type: {
        facebook: { type: String, default: null },
        instagram: { type: String, default: null },
        twitter: { type: String, default: null },
      },
      default: {},
    },
    isEmailVerified: { type: Boolean, default: false, index: true },
    addresses: { type: [AddressSchema], default: [] },
  },
  { timestamps: true },
);

export const User = model("User", UserSchema);
