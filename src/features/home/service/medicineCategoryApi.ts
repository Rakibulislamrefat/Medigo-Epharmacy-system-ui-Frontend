import api from "../../../utilities/api";
import type { MedicineCategory } from "./MedicineCategory.types";

export type MedicineCategoryApiItem = {
  category: string;
  medicines: Array<{
    _id: string;
    name: string;
    price?: number;
    images?: string[];
    [key: string]: unknown;
  }>;
};

const normalizeCategoryKey = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");

export const mapCategoryPayload = (payload: MedicineCategoryApiItem[]): MedicineCategory[] =>
  payload.map((item) => ({
    key: normalizeCategoryKey(item.category),
    label: item.category,
    products: item.medicines.map((medicine) => ({
      id: medicine._id,
      name: String(medicine.name || "Unnamed medicine"),
      price: typeof medicine.price === "number" ? medicine.price : 0,
      imageUrl:
        Array.isArray(medicine.images) && medicine.images.length > 0
          ? String(medicine.images[0])
          : "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=640&auto=format&fit=crop",
    })),
  }));

export const getMedicinesByCategory = async (): Promise<MedicineCategory[]> => {
  const res = await api.get("/products/by-category");
  const raw = res.data as { data?: unknown } | unknown;
  const data = (raw as { data?: unknown })?.data ?? raw;
  if (!Array.isArray(data)) return [];
  return mapCategoryPayload(data as MedicineCategoryApiItem[]);
};
