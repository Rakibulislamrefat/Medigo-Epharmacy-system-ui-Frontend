import { Schema, model } from "mongoose";

const DosageForms = [
  "tablet",
  "capsule",
  "syrup",
  "injection",
  "cream",
  "drops",
  "other",
] as const;

const MedicineSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, index: true },
    slug: { type: String, required: true, trim: true, lowercase: true, unique: true, index: true },
    genericName: { type: String, default: "", trim: true, index: true },
    brandName: { type: String, default: "", trim: true, index: true },
    dosageForm: { type: String, enum: DosageForms, default: "other" },
    strength: { type: String, default: "" },
    description: { type: String, default: "" },
    indications: { type: [String], default: [] },
    warnings: { type: [String], default: [] },
    otc: { type: Boolean, default: true },
    requiresPrescription: { type: Boolean, default: false },
    categories: { type: [String], default: [], index: true },
    tags: { type: [String], default: [] },
    images: { type: [String], default: [] },
    sku: { type: String, default: "", index: true },
    manufacturer: { type: String, default: "" },
    price: { type: Number, required: true, min: 0 },
    salePrice: { type: Number, default: null, min: 0 },
    currency: { type: String, default: "BDT" },
    stockQty: { type: Number, default: 0, min: 0 },
    status: { type: String, enum: ["active", "inactive"], default: "active", index: true },
  },
  { timestamps: true },
);

MedicineSchema.index({ name: "text", genericName: "text", brandName: "text" });

export const Medicine = model("Medicine", MedicineSchema);
