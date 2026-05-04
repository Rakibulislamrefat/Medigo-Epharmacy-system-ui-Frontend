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
      enum: ["user", "admin", "pharmacist", "doctor"],
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
    isEmailVerified: { type: Boolean, default: false, index: true },
    addresses: { type: [AddressSchema], default: [] },
  },
  { timestamps: true },
);

export const User = model("User", UserSchema);
