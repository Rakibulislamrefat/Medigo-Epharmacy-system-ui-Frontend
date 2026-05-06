import mongoose from "mongoose";
import dotenv from "dotenv";
import { Medicine } from "./src/models/Medicine";

dotenv.config();

const generateMedicines = () => {
  const categories = [
    "Prescription Medicine",
    "Surgical Product",
    "OTC Medicine",
    "Dental & Oral Care",
    "Woman Care",
    "Baby Care",
    "Personal Care",
    "Diabetic Care"
  ];

  const items = [];

  // Prescription Medicine
  const rxNames = ["Amoxicillin", "Azithromycin", "Ciprofloxacin", "Losartan", "Amlodipine", "Metformin", "Atorvastatin", "Omeprazole", "Pantoprazole", "Levothyroxine"];
  rxNames.forEach((name, i) => items.push({
    name: `${name} ${50 * (i + 1)}mg Tablet`,
    slug: `${name.toLowerCase()}-${50 * (i + 1)}mg-tablet`,
    genericName: name,
    brandName: "PharmaCorp",
    dosageForm: "tablet",
    strength: `${50 * (i + 1)}mg`,
    description: `Prescription medication for targeted treatment. Active ingredient: ${name}.`,
    otc: false,
    requiresPrescription: true,
    categories: ["Prescription Medicine"],
    price: 5 + i * 2.5,
    stockQty: 100 + i * 10,
    status: "active"
  }));

  // Surgical Product
  const surgNames = ["Surgical Face Mask 3-Ply", "Latex Examination Gloves", "Surgical Scalpel Blades", "Cotton Swabs Sterile", "Gauze Pads 4x4", "Medical Adhesive Tape", "Surgical Suture Kit", "N95 Respirator Mask", "Surgical Scrub Cap", "Medical Scissors"];
  surgNames.forEach((name, i) => items.push({
    name: name,
    slug: name.toLowerCase().replace(/ /g, "-"),
    brandName: "Medline Surgical",
    dosageForm: "other",
    description: `High-quality clinical grade ${name.toLowerCase()} for hospital and clinical use.`,
    otc: true,
    requiresPrescription: false,
    categories: ["Surgical Product"],
    price: 10 + i * 5,
    stockQty: 500,
    status: "active"
  }));

  // OTC Medicine
  const otcNames = ["Paracetamol 500mg", "Ibuprofen 400mg", "Cetirizine 10mg", "Loratadine 10mg", "Aspirin 81mg", "Antacid Liquid", "Cough Syrup", "Vitamin C 500mg", "Multivitamin Daily", "Melatonin 5mg"];
  otcNames.forEach((name, i) => items.push({
    name: name,
    slug: name.toLowerCase().replace(/ /g, "-"),
    genericName: name.split(" ")[0],
    brandName: "DailyHealth",
    dosageForm: name.includes("Syrup") || name.includes("Liquid") ? "syrup" : "tablet",
    strength: name.split(" ")[1] || "Standard",
    description: `Over the counter medication for common relief. Active ingredient: ${name}.`,
    otc: true,
    requiresPrescription: false,
    categories: ["OTC Medicine"],
    price: 2 + i * 1.5,
    stockQty: 300,
    status: "active"
  }));

  // Dental & Oral Care
  const dentalNames = ["Fluoride Toothpaste", "Sensitive Teeth Toothpaste", "Antibacterial Mouthwash", "Dental Floss Mint", "Soft Bristle Toothbrush", "Medium Bristle Toothbrush", "Electric Toothbrush Heads", "Denture Cleanser Tablets", "Teeth Whitening Strips", "Oral Pain Relief Gel"];
  dentalNames.forEach((name, i) => items.push({
    name: name,
    slug: name.toLowerCase().replace(/ /g, "-"),
    brandName: "SmileCare",
    dosageForm: name.includes("Gel") || name.includes("Toothpaste") ? "cream" : "other",
    description: `Premium quality ${name.toLowerCase()} for optimal dental hygiene.`,
    otc: true,
    requiresPrescription: false,
    categories: ["Dental & Oral Care", "Personal Care"],
    price: 5 + i * 3,
    stockQty: 250,
    status: "active"
  }));

  // Woman Care
  const womanNames = ["Sanitary Pads Regular", "Sanitary Pads Overnight", "Tampons Regular", "Pantyliners", "Intimate Wash", "Pregnancy Test Kit", "Menstrual Cup", "Feminine Wipes", "Iron Supplements", "Calcium Supplements"];
  womanNames.forEach((name, i) => items.push({
    name: name,
    slug: name.toLowerCase().replace(/ /g, "-"),
    brandName: "FemCare",
    dosageForm: name.includes("Supplements") ? "capsule" : "other",
    description: `Essential ${name.toLowerCase()} designed specifically for women's health.`,
    otc: true,
    requiresPrescription: false,
    categories: ["Woman Care"],
    price: 8 + i * 2,
    stockQty: 200,
    status: "active"
  }));

  // Baby Care
  const babyNames = ["Baby Diapers Newborn", "Baby Diapers Size 3", "Baby Wet Wipes", "Tear-Free Baby Shampoo", "Baby Massage Oil", "Diaper Rash Cream", "Baby Talcum Powder", "Baby Feeding Bottle", "Baby Body Wash", "Infant Thermometer"];
  babyNames.forEach((name, i) => items.push({
    name: name,
    slug: name.toLowerCase().replace(/ /g, "-"),
    brandName: "GentleBaby",
    dosageForm: name.includes("Cream") ? "cream" : "other",
    description: `Gentle and safe ${name.toLowerCase()} formulated for delicate baby skin and needs.`,
    otc: true,
    requiresPrescription: false,
    categories: ["Baby Care"],
    price: 15 + i * 4,
    stockQty: 150,
    status: "active"
  }));

  // Personal Care
  const personalNames = ["Moisturizing Body Lotion", "Aloe Vera Gel", "Hand Sanitizer 500ml", "Antibacterial Bar Soap", "Liquid Hand Wash", "Anti-Dandruff Shampoo", "Hair Conditioner", "Sunscreen SPF 50", "Lip Balm", "Deodorant Body Spray"];
  personalNames.forEach((name, i) => items.push({
    name: name,
    slug: name.toLowerCase().replace(/ /g, "-"),
    brandName: "DailyCare",
    dosageForm: name.includes("Gel") || name.includes("Lotion") || name.includes("Sunscreen") ? "cream" : "other",
    description: `Everyday ${name.toLowerCase()} for your personal grooming and hygiene.`,
    otc: true,
    requiresPrescription: false,
    categories: ["Personal Care"],
    price: 4 + i * 3,
    stockQty: 300,
    status: "active"
  }));

  // Diabetic Care
  const diabeticNames = ["Blood Glucose Monitor", "Test Strips (Box of 50)", "Lancets (Box of 100)", "Insulin Syringes 1ml", "Diabetic Socks", "Sugar-Free Sweetener", "Diabetic Foot Cream", "Glucometer Control Solution", "Alcohol Prep Pads", "Sharps Disposal Container"];
  diabeticNames.forEach((name, i) => items.push({
    name: name,
    slug: name.toLowerCase().replace(/ /g, "-"),
    brandName: "DiaCare",
    dosageForm: name.includes("Cream") ? "cream" : "other",
    description: `Reliable ${name.toLowerCase()} designed to assist in daily diabetic management.`,
    otc: true,
    requiresPrescription: false,
    categories: ["Diabetic Care"],
    price: 12 + i * 8,
    stockQty: 100,
    status: "active"
  }));

  return items;
};

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/medigo");
    console.log("Connected to MongoDB.");

    await Medicine.deleteMany({});
    console.log("Cleared existing medicines.");

    const items = generateMedicines();
    await Medicine.insertMany(items);
    console.log(`Successfully inserted ${items.length} medicines across all categories.`);

    process.exit(0);
  } catch (error) {
    console.error("Error seeding medicines:", error);
    process.exit(1);
  }
}

seed();
