import { Schema, model } from "mongoose";

const MedicineSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, index: true },
    slug: { type: String, required: true, trim: true, lowercase: true, unique: true, index: true },
    price: { type: Number, required: true, min: 0 },
    stockQty: { type: Number, default: 0, min: 0 },
    status: { type: String, enum: ["active", "inactive"], default: "active", index: true },
  },
  { timestamps: true },
);

export const Medicine = model("Medicine", MedicineSchema);

