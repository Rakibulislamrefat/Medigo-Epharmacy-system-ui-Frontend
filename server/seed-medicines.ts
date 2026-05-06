import mongoose from "mongoose";
import dotenv from "dotenv";
import { Medicine } from "./src/models/Medicine";

dotenv.config();

const sampleMedicines = [
  {
    name: "Napa 500mg Tablet",
    slug: "napa-500mg-tablet",
    genericName: "Paracetamol",
    brandName: "Beximco Pharmaceuticals Ltd.",
    dosageForm: "tablet",
    strength: "500mg",
    description: "Napa is used to treat mild to moderate pain and fever.",
    otc: true,
    requiresPrescription: false,
    categories: ["OTC Medicine", "Personal Care"],
    price: 1.20,
    salePrice: null,
    currency: "BDT",
    stockQty: 500,
    status: "active",
  },
  {
    name: "Seclo 20mg Capsule",
    slug: "seclo-20mg-capsule",
    genericName: "Omeprazole",
    brandName: "Square Pharmaceuticals Ltd.",
    dosageForm: "capsule",
    strength: "20mg",
    description: "Seclo is used for the treatment of gastric and duodenal ulcers, heartburn, and acid reflux.",
    otc: true,
    requiresPrescription: false,
    categories: ["OTC Medicine"],
    price: 5.00,
    stockQty: 300,
    status: "active",
  },
  {
    name: "Moxacil 500mg Capsule",
    slug: "moxacil-500mg-capsule",
    genericName: "Amoxicillin",
    brandName: "Square Pharmaceuticals Ltd.",
    dosageForm: "capsule",
    strength: "500mg",
    description: "Moxacil is a penicillin antibiotic used to treat bacterial infections.",
    otc: false,
    requiresPrescription: true,
    categories: ["Prescription Medicine"],
    price: 4.50,
    stockQty: 200,
    status: "active",
  },
  {
    name: "Accu-Chek Active Test Strips",
    slug: "accu-chek-active-test-strips",
    brandName: "Roche Diabetes Care",
    dosageForm: "other",
    description: "Accu-Chek Active test strips for easy and accurate blood glucose testing.",
    otc: true,
    requiresPrescription: false,
    categories: ["Diabetic Care"],
    price: 1250,
    salePrice: 1100,
    stockQty: 50,
    status: "active",
  },
  {
    name: "Sensodyne Fresh Mint Toothpaste",
    slug: "sensodyne-fresh-mint",
    brandName: "GSK",
    dosageForm: "cream",
    strength: "100g",
    description: "Toothpaste for sensitive teeth. Provides daily cavity protection.",
    otc: true,
    requiresPrescription: false,
    categories: ["Dental & Oral Care", "Personal Care"],
    price: 160,
    stockQty: 120,
    status: "active",
  },
  {
    name: "Johnson's Baby Lotion",
    slug: "johnsons-baby-lotion-200ml",
    brandName: "Johnson & Johnson",
    dosageForm: "cream",
    strength: "200ml",
    description: "Clinically proven mildness formula, designed to nourish baby's delicate skin.",
    otc: true,
    requiresPrescription: false,
    categories: ["Baby Care", "Personal Care"],
    price: 350,
    stockQty: 85,
    status: "active",
  },
  {
    name: "Surgical Face Mask (Box of 50)",
    slug: "surgical-face-mask-50pcs",
    brandName: "Medline",
    dosageForm: "other",
    description: "3-ply disposable surgical face masks.",
    otc: true,
    requiresPrescription: false,
    categories: ["Surgical Product"],
    price: 150,
    stockQty: 400,
    status: "active",
  },
  {
    name: "Stayfree Secure Cottony Soft",
    slug: "stayfree-secure-cottony-soft",
    brandName: "Stayfree",
    dosageForm: "other",
    description: "Sanitary pads with cottony soft cover for ultimate comfort.",
    otc: true,
    requiresPrescription: false,
    categories: ["Woman Care", "Personal Care"],
    price: 120,
    stockQty: 150,
    status: "active",
  }
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/medigo");
    console.log("Connected to MongoDB.");

    await Medicine.deleteMany({});
    console.log("Cleared existing medicines.");

    await Medicine.insertMany(sampleMedicines);
    console.log(`Successfully inserted ${sampleMedicines.length} medicines.`);

    process.exit(0);
  } catch (error) {
    console.error("Error seeding medicines:", error);
    process.exit(1);
  }
}

seed();
