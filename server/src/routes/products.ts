import { Router } from "express";
import multer from "multer";
import { Medicine } from "../models/Medicine.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
      return;
    }
    cb(new Error("Only image files are allowed"));
  },
});

const isNonEmptyString = (v: unknown): v is string =>
  typeof v === "string" && v.trim().length > 0;

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const parseStringArray = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value.map((v) => (typeof v === "string" ? v.trim() : "")).filter(Boolean);
  }
  if (typeof value === "string") {
    return value
      .split(/[\n,]+/g)
      .map((v) => v.trim())
      .filter(Boolean);
  }
  return [];
};

const parseBoolean = (value: unknown): boolean | undefined => {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    const v = value.trim().toLowerCase();
    if (v === "true") return true;
    if (v === "false") return false;
  }
  return undefined;
};

router.post("/", upload.single("image"), async (req, res) => {
  const body = req.body as {
    name?: unknown;
    genericName?: unknown;
    brandName?: unknown;
    dosageForm?: unknown;
    strength?: unknown;
    description?: unknown;
    indications?: unknown;
    warnings?: unknown;
    otc?: unknown;
    requiresPrescription?: unknown;
    categories?: unknown;
    tags?: unknown;
    sku?: unknown;
    manufacturer?: unknown;
    price?: unknown;
    salePrice?: unknown;
    currency?: unknown;
    stockQty?: unknown;
    status?: unknown;
  };

  if (!isNonEmptyString(body.name)) {
    res.status(400).json({ success: false, statusCode: 400, message: "name is required" });
    return;
  }
  if (!req.file) {
    res.status(400).json({ success: false, statusCode: 400, message: "image is required" });
    return;
  }

  const name = body.name.trim();
  const slug = slugify(name);
  const price = typeof body.price === "number" ? body.price : Number(body.price);
  if (!Number.isFinite(price) || price < 0) {
    res.status(400).json({ success: false, statusCode: 400, message: "Invalid price" });
    return;
  }

  const dosageForm = isNonEmptyString(body.dosageForm) ? body.dosageForm.trim() : "other";
  const allowedDosage = ["tablet", "capsule", "syrup", "injection", "cream", "drops", "other"];
  if (!allowedDosage.includes(dosageForm)) {
    res.status(400).json({ success: false, statusCode: 400, message: "Invalid dosageForm" });
    return;
  }

  const stockQty =
    body.stockQty == null || body.stockQty === ""
      ? 0
      : typeof body.stockQty === "number"
        ? body.stockQty
        : Number(body.stockQty);
  if (!Number.isFinite(stockQty) || stockQty < 0) {
    res.status(400).json({ success: false, statusCode: 400, message: "Invalid stockQty" });
    return;
  }

  const salePrice =
    body.salePrice == null || body.salePrice === ""
      ? null
      : typeof body.salePrice === "number"
        ? body.salePrice
        : Number(body.salePrice);
  if (salePrice != null && (!Number.isFinite(salePrice) || salePrice < 0)) {
    res.status(400).json({ success: false, statusCode: 400, message: "Invalid salePrice" });
    return;
  }

  const status = isNonEmptyString(body.status) ? body.status.trim() : "active";
  if (!["active", "inactive"].includes(status)) {
    res.status(400).json({ success: false, statusCode: 400, message: "Invalid status" });
    return;
  }

  try {
    const imageUrl = await uploadToCloudinary(req.file.buffer, req.file.originalname);
    const created = await Medicine.create({
      name,
      slug,
      price,
      images: [imageUrl],
      genericName: isNonEmptyString(body.genericName) ? body.genericName.trim() : "",
      brandName: isNonEmptyString(body.brandName) ? body.brandName.trim() : "",
      dosageForm,
      strength: isNonEmptyString(body.strength) ? body.strength.trim() : "",
      description: isNonEmptyString(body.description) ? body.description.trim() : "",
      indications: parseStringArray(body.indications),
      warnings: parseStringArray(body.warnings),
      sku: isNonEmptyString(body.sku) ? body.sku.trim() : "",
      manufacturer: isNonEmptyString(body.manufacturer) ? body.manufacturer.trim() : "",
      stockQty,
      categories: parseStringArray(body.categories),
      tags: parseStringArray(body.tags),
      otc: parseBoolean(body.otc) ?? true,
      requiresPrescription: parseBoolean(body.requiresPrescription) ?? false,
      salePrice,
      currency: isNonEmptyString(body.currency) ? body.currency.trim() : "BDT",
      status,
    });

    const product = await Medicine.findById(created._id)
      .select({
        name: 1,
        slug: 1,
        price: 1,
        images: 1,
        genericName: 1,
        dosageForm: 1,
        stockQty: 1,
        status: 1,
        createdAt: 1,
        updatedAt: 1,
      })
      .lean();

    res.status(201).json({
      success: true,
      statusCode: 201,
      message: "Product created",
      data: product,
    });
  } catch (e: unknown) {
    const message = (e as { code?: number })?.code === 11000 ? "Product already exists" : "Failed to create product";
    res.status(400).json({ success: false, statusCode: 400, message });
  }
});

export default router;
