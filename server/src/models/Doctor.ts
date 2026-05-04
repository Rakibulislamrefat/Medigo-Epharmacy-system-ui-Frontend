import { Schema, model, Types } from "mongoose";

const DoctorSchema = new Schema(
  {
    user: { type: Types.ObjectId, ref: "User", default: null, unique: true, sparse: true },
    fullName: { type: String, required: true, trim: true, index: true },
    specialization: { type: String, default: "", index: true },
    status: { type: String, enum: ["active", "inactive"], default: "active", index: true },
  },
  { timestamps: true },
);

export const Doctor = model("Doctor", DoctorSchema);

