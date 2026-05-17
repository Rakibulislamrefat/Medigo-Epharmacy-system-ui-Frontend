import { Icons } from "../../../shared/icons/Icons";
import type { MedicineCategory, MedicineProduct } from "./MedicineCategory.types";

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const defaultImages = [
  "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=640&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=640&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?w=640&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=640&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1584744982498-0b3b93b4a27b?w=640&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=640&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1584634731339-252c581abfc5?w=640&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1606206873764-fd15e242df52?w=640&auto=format&fit=crop",
];

const makeProducts = (prefix: string, names: string[]): MedicineProduct[] =>
  names.map((name, i) => ({
    id: `${prefix}-${i + 1}`,
    name,
    price: Math.round((i * 57 + 25) * 10) / 10,
    imageUrl: defaultImages[i % defaultImages.length]!,
  }));

export type MedicineCatalogEntry = {
  slug: string;
  label: string;
  description: string;
  Icon: typeof Icons.Pill;
  products: MedicineProduct[];
};

export const defaultMedicineCatalog: MedicineCatalogEntry[] = [
  {
    slug: slugify("Prescription Medicine"),
    label: "Prescription Medicine",
    description:
      "Upload a prescription for Rx items or request an order — we verify and confirm before delivery.",
    Icon: Icons.Prescription,
    products: makeProducts("rx", [
      "Prodep 20mg Capsule",
      "Valex CR 500mg Tablet",
      "Dormicum 7.5mg Tablet",
      "Systear Eye Drop 10ml",
      "Aripra 10mg Tablet",
      "Mirapro 15mg Tablet",
      "Seclo 20mg Capsule",
      "Napa 500mg Tablet",
    ]),
  },
  {
    slug: slugify("Surgical Product"),
    label: "Surgical Product",
    description:
      "Trusted surgical essentials for clinics and home care — quality checked by Medigo.",
    Icon: Icons.Shield,
    products: makeProducts("surgical", [
      "Disposable Surgical Gloves (Box)",
      "Sterile Gauze Pad (Pack)",
      "Surgical Mask (50 pcs)",
      "Bandage Roll",
      "Digital Thermometer",
      "Antiseptic Solution",
      "Cotton Roll",
      "Medical Tape",
    ]),
  },
  {
    slug: slugify("OTC Medicine"),
    label: "OTC Medicine",
    description:
      "Everyday OTC medicines — fast ordering and doorstep delivery from Medigo e‑Pharmacy.",
    Icon: Icons.Pill,
    products: makeProducts("otc", [
      "Paracetamol 500mg",
      "Oral Rehydration Salts (ORS)",
      "Antacid Tablet",
      "Cough Syrup",
      "Vitamin C Tablets",
      "Nasal Spray",
      "Pain Relief Gel",
      "Antihistamine Tablet",
    ]),
  },
  {
    slug: slugify("Baby Care"),
    label: "Baby Care",
    description:
      "Gentle and reliable baby care products — diapers, hygiene, and essentials.",
    Icon: Icons.Heartbeat,
    products: makeProducts("baby", [
      "Baby Diapers",
      "Baby Wipes",
      "Baby Lotion",
      "Baby Shampoo",
      "Baby Powder",
      "Feeding Bottle",
      "Pacifier",
      "Baby Soap",
    ]),
  },
  {
    slug: slugify("Woman Care"),
    label: "Woman Care",
    description:
      "Women’s wellness essentials — trusted brands and discreet delivery.",
    Icon: Icons.Heartbeat,
    products: makeProducts("women", [
      "Pregnancy Test Kit",
      "Sanitary Pads",
      "Menstrual Cup",
      "Intimate Wash",
      "Iron Supplement",
      "Folic Acid Tablet",
      "Prenatal Vitamins",
      "Heating Patch",
    ]),
  },
  {
    slug: slugify("Personal Care"),
    label: "Personal Care",
    description:
      "Daily care essentials — skincare, hygiene, and wellness products.",
    Icon: Icons.Check,
    products: makeProducts("personal", [
      "Hand Sanitizer",
      "Face Wash",
      "Moisturizing Cream",
      "Sunscreen Lotion",
      "Shampoo",
      "Hair Oil",
      "Body Wash",
      "Lip Balm",
    ]),
  },
  {
    slug: slugify("Dental & Oral Care"),
    label: "Dental & Oral Care",
    description:
      "Oral hygiene essentials — toothpaste, mouthwash, and dental care.",
    Icon: Icons.Check,
    products: makeProducts("oral", [
      "Toothpaste",
      "Mouthwash",
      "Dental Floss",
      "Toothbrush (Soft)",
      "Toothbrush (Medium)",
      "Tongue Cleaner",
      "Whitening Strips",
      "Sensitive Gel",
    ]),
  },
  {
    slug: slugify("Diabetic Care"),
    label: "Diabetic Care",
    description:
      "Diabetes monitoring tools and care essentials — accurate and dependable.",
    Icon: Icons.Clock,
    products: makeProducts("diabetic", [
      "Glucometer",
      "Blood Glucose Test Strips",
      "Lancets (Pack)",
      "Insulin Syringe (Pack)",
      "Alcohol Swabs",
      "Sharps Container",
      "Control Solution",
      "Glucose Tablets",
    ]),
  },
];

export const defaultMedicineCategories: MedicineCategory[] = defaultMedicineCatalog.map(
  (entry) => ({
    key: entry.slug,
    label: entry.label,
    products: entry.products,
  }),
);
