import { Router } from "express";
import multer from "multer";
import { User } from "../models/User.js";
import { Medicine } from "../models/Medicine.js";
import { Order } from "../models/Order.js";
import { Doctor } from "../models/Doctor.js";
import { Consultancy } from "../models/Consultancy.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";

const router = Router();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

const isNonEmptyString = (v: unknown): v is string =>
  typeof v === "string" && v.trim().length > 0;

const getQueryString = (value: unknown): string | undefined => {
  if (typeof value === "string") return value;
  if (Array.isArray(value) && typeof value[0] === "string") return value[0];
  return undefined;
};

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const parseStringArray = (value: unknown): string[] | undefined => {
  if (Array.isArray(value)) {
    const out = value
      .map((v) => (typeof v === "string" ? v.trim() : ""))
      .filter(Boolean);
    return out;
  }
  if (typeof value === "string") {
    const out = value
      .split(/[\n,]+/g)
      .map((v) => v.trim())
      .filter(Boolean);
    return out;
  }
  return undefined;
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

const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

router.get("/metrics", async (_req, res) => {
  const [users, medicines, orders, doctors, consultancies] = await Promise.all([
    User.countDocuments({}),
    Medicine.countDocuments({}),
    Order.countDocuments({}),
    Doctor.countDocuments({}),
    Consultancy.countDocuments({}),
  ]);

  res.json({
    data: { users, medicines, orders, doctors, consultancies },
  });
});

router.get("/users", async (_req, res) => {
  const req = _req as unknown as { query?: Record<string, unknown> };
  const qRaw = getQueryString(req.query?.q);
  const roleRaw = getQueryString(req.query?.role);
  const statusRaw = getQueryString(req.query?.status);
  const pageRaw = getQueryString(req.query?.page);
  const limitRaw = getQueryString(req.query?.limit);

  const q = isNonEmptyString(qRaw) ? qRaw.trim().slice(0, 80) : "";
  const role = isNonEmptyString(roleRaw) ? roleRaw.trim() : "";
  const status = isNonEmptyString(statusRaw) ? statusRaw.trim() : "";
  const page = Math.max(1, Number(pageRaw ?? 1) || 1);
  const limit = Math.min(50, Math.max(5, Number(limitRaw ?? 10) || 10));
  const skip = (page - 1) * limit;

  const filter: Record<string, unknown> = {};
  if (role && ["user", "admin", "pharmacist", "doctor"].includes(role)) filter.role = role;
  if (status && ["active", "blocked", "pending"].includes(status)) filter.status = status;
  if (q) {
    const rx = new RegExp(escapeRegex(q), "i");
    filter.$or = [{ name: rx }, { email: rx }, { phone: rx }];
  }

  const [items, total] = await Promise.all([
    User.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select({ name: 1, email: 1, phone: 1, role: 1, status: 1, createdAt: 1 })
      .lean(),
    User.countDocuments(filter),
  ]);

  res.json({
    data: items,
    meta: {
      q,
      role: role && ["user", "admin", "pharmacist", "doctor"].includes(role) ? role : "",
      status: status && ["active", "blocked", "pending"].includes(status) ? status : "",
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    },
  });
});

router.patch("/users/:id", async (req, res) => {
  const { id } = req.params;
  const body = req.body as { role?: unknown; status?: unknown };

  const patch: Record<string, unknown> = {};

  if (isNonEmptyString(body.role)) {
    const role = body.role.trim();
    if (!["user", "admin", "pharmacist", "doctor"].includes(role)) {
      res.status(400).json({ message: "Invalid role" });
      return;
    }
    patch.role = role;
  }

  if (isNonEmptyString(body.status)) {
    const status = body.status.trim();
    if (!["active", "blocked", "pending"].includes(status)) {
      res.status(400).json({ message: "Invalid status" });
      return;
    }
    patch.status = status;
  }

  if (Object.keys(patch).length === 0) {
    res.status(400).json({ message: "Nothing to update" });
    return;
  }

  const updated = await User.findByIdAndUpdate(
    id,
    patch,
    { new: true },
  )
    .select({ name: 1, email: 1, phone: 1, role: 1, status: 1, createdAt: 1 })
    .lean();

  if (!updated) {
    res.status(404).json({ message: "User not found" });
    return;
  }

  res.json({ data: updated });
});

router.get("/medicines", async (_req, res) => {
  const req = _req as unknown as {
    query?: Record<string, unknown>;
  };

  const qRaw = getQueryString(req.query?.q);
  const statusRaw = getQueryString(req.query?.status);
  const pageRaw = getQueryString(req.query?.page);
  const limitRaw = getQueryString(req.query?.limit);

  const q = isNonEmptyString(qRaw) ? qRaw.trim().slice(0, 80) : "";
  const status = isNonEmptyString(statusRaw) ? statusRaw.trim() : "";
  const page = Math.max(1, Number(pageRaw ?? 1) || 1);
  const limit = Math.min(50, Math.max(5, Number(limitRaw ?? 10) || 10));
  const skip = (page - 1) * limit;

  const filter: Record<string, unknown> = {};
  if (status && ["active", "inactive"].includes(status)) filter.status = status;
  if (q) {
    const rx = new RegExp(escapeRegex(q), "i");
    filter.$or = [
      { name: rx },
      { slug: rx },
      { genericName: rx },
      { brandName: rx },
      { manufacturer: rx },
      { sku: rx },
      { categories: rx },
      { tags: rx },
    ];
  }

  const [items, total] = await Promise.all([
    Medicine.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select({
        name: 1,
        slug: 1,
        genericName: 1,
        brandName: 1,
        dosageForm: 1,
        strength: 1,
        description: 1,
        indications: 1,
        warnings: 1,
        otc: 1,
        requiresPrescription: 1,
        categories: 1,
        tags: 1,
        images: 1,
        sku: 1,
        manufacturer: 1,
        price: 1,
        salePrice: 1,
        currency: 1,
        stockQty: 1,
        status: 1,
        createdAt: 1,
      })
      .lean(),
    Medicine.countDocuments(filter),
  ]);

  res.json({
    data: items,
    meta: {
      q,
      status: status && ["active", "inactive"].includes(status) ? status : "",
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    },
  });
});

router.post("/medicines", upload.single("image"), async (req, res) => {
  const body = req.body as {
    name?: unknown;
    slug?: unknown;
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
    images?: unknown;
    sku?: unknown;
    manufacturer?: unknown;
    price?: unknown;
    salePrice?: unknown;
    currency?: unknown;
    stockQty?: unknown;
    status?: unknown;
  };

  if (!isNonEmptyString(body.name)) {
    res.status(400).json({ message: "Name is required" });
    return;
  }
  const name = body.name.trim();

  const slug = isNonEmptyString(body.slug) ? slugify(body.slug) : slugify(name);
  if (!slug) {
    res.status(400).json({ message: "Slug is required" });
    return;
  }

  const dosageForm = isNonEmptyString(body.dosageForm)
    ? body.dosageForm.trim()
    : "other";
  const allowedDosage = ["tablet", "capsule", "syrup", "injection", "cream", "drops", "other"];
  if (!allowedDosage.includes(dosageForm)) {
    res.status(400).json({ message: "Invalid dosageForm" });
    return;
  }

  const price = typeof body.price === "number" ? body.price : Number(body.price);
  if (!Number.isFinite(price) || price < 0) {
    res.status(400).json({ message: "Invalid price" });
    return;
  }

  const salePrice =
    body.salePrice === null || body.salePrice === ""
      ? null
      : body.salePrice == null
        ? null
        : typeof body.salePrice === "number"
          ? body.salePrice
          : Number(body.salePrice);
  if (salePrice != null && (!Number.isFinite(salePrice) || salePrice < 0)) {
    res.status(400).json({ message: "Invalid salePrice" });
    return;
  }

  const currency = isNonEmptyString(body.currency) ? body.currency.trim() : "BDT";

  const stockQty =
    body.stockQty == null ? 0 : typeof body.stockQty === "number" ? body.stockQty : Number(body.stockQty);
  if (!Number.isFinite(stockQty) || stockQty < 0) {
    res.status(400).json({ message: "Invalid stockQty" });
    return;
  }

  const status = isNonEmptyString(body.status) ? body.status.trim() : "active";
  if (!["active", "inactive"].includes(status)) {
    res.status(400).json({ message: "Invalid status" });
    return;
  }

  const otc = parseBoolean(body.otc) ?? true;
  const requiresPrescription = parseBoolean(body.requiresPrescription) ?? false;

  const indications = parseStringArray(body.indications) ?? [];
  const warnings = parseStringArray(body.warnings) ?? [];
  const categories = parseStringArray(body.categories) ?? [];
  const tags = parseStringArray(body.tags) ?? [];
  let images = parseStringArray(body.images) ?? [];

  // Handle image upload
  if (req.file) {
    try {
      const imageUrl = await uploadToCloudinary(req.file.buffer, req.file.originalname);
      images = [imageUrl, ...images]; // Add uploaded image at the beginning
    } catch (error) {
      console.error("Image upload error:", error);
      res.status(500).json({ message: "Failed to upload image" });
      return;
    }
  }

  try {
    const created = await Medicine.create({
      name,
      slug,
      genericName: isNonEmptyString(body.genericName) ? body.genericName.trim() : "",
      brandName: isNonEmptyString(body.brandName) ? body.brandName.trim() : "",
      dosageForm,
      strength: isNonEmptyString(body.strength) ? body.strength.trim() : "",
      description: isNonEmptyString(body.description) ? body.description.trim() : "",
      indications,
      warnings,
      otc,
      requiresPrescription,
      categories,
      tags,
      images,
      sku: isNonEmptyString(body.sku) ? body.sku.trim() : "",
      manufacturer: isNonEmptyString(body.manufacturer) ? body.manufacturer.trim() : "",
      price,
      salePrice,
      currency,
      stockQty,
      status,
    });
    const doc = await Medicine.findById(created._id)
      .select({
        name: 1,
        slug: 1,
        genericName: 1,
        brandName: 1,
        dosageForm: 1,
        strength: 1,
        description: 1,
        indications: 1,
        warnings: 1,
        otc: 1,
        requiresPrescription: 1,
        categories: 1,
        tags: 1,
        images: 1,
        sku: 1,
        manufacturer: 1,
        price: 1,
        salePrice: 1,
        currency: 1,
        stockQty: 1,
        status: 1,
        createdAt: 1,
      })
      .lean();
    res.status(201).json({ data: doc });
  } catch (e: unknown) {
    const msg = (e as { code?: number })?.code === 11000 ? "Slug already exists" : "Failed to create medicine";
    res.status(400).json({ message: msg });
  }
});

router.patch("/medicines/:id", upload.single("image"), async (req, res) => {
  const { id } = req.params;
  const body = req.body as {
    name?: unknown;
    slug?: unknown;
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
    images?: unknown;
    sku?: unknown;
    manufacturer?: unknown;
    price?: unknown;
    salePrice?: unknown;
    currency?: unknown;
    stockQty?: unknown;
    status?: unknown;
  };

  const patch: Record<string, unknown> = {};

  if (isNonEmptyString(body.name)) patch.name = body.name.trim();
  if (isNonEmptyString(body.slug)) patch.slug = slugify(body.slug);
  if (isNonEmptyString(body.genericName)) patch.genericName = body.genericName.trim();
  if (isNonEmptyString(body.brandName)) patch.brandName = body.brandName.trim();
  if (isNonEmptyString(body.strength)) patch.strength = body.strength.trim();
  if (isNonEmptyString(body.description)) patch.description = body.description.trim();
  if (isNonEmptyString(body.sku)) patch.sku = body.sku.trim();
  if (isNonEmptyString(body.manufacturer)) patch.manufacturer = body.manufacturer.trim();
  if (isNonEmptyString(body.currency)) patch.currency = body.currency.trim();

  if (isNonEmptyString(body.dosageForm)) {
    const dosageForm = body.dosageForm.trim();
    const allowedDosage = ["tablet", "capsule", "syrup", "injection", "cream", "drops", "other"];
    if (!allowedDosage.includes(dosageForm)) {
      res.status(400).json({ message: "Invalid dosageForm" });
      return;
    }
    patch.dosageForm = dosageForm;
  }

  const otc = parseBoolean(body.otc);
  if (otc != null) patch.otc = otc;
  const requiresPrescription = parseBoolean(body.requiresPrescription);
  if (requiresPrescription != null) patch.requiresPrescription = requiresPrescription;

  const indications = parseStringArray(body.indications);
  if (indications) patch.indications = indications;
  const warnings = parseStringArray(body.warnings);
  if (warnings) patch.warnings = warnings;
  const categories = parseStringArray(body.categories);
  if (categories) patch.categories = categories;
  const tags = parseStringArray(body.tags);
  if (tags) patch.tags = tags;

  // Handle images - combine existing images with new uploaded image
  let images = parseStringArray(body.images);
  if (req.file) {
    try {
      const imageUrl = await uploadToCloudinary(req.file.buffer, req.file.originalname);
      // If images are provided in body, add the new image at the beginning
      // Otherwise, create new array with just the uploaded image
      images = images ? [imageUrl, ...images] : [imageUrl];
    } catch (error) {
      console.error("Image upload error:", error);
      res.status(500).json({ message: "Failed to upload image" });
      return;
    }
  }
  if (images) patch.images = images;

  if (body.price != null) {
    const price = typeof body.price === "number" ? body.price : Number(body.price);
    if (!Number.isFinite(price) || price < 0) {
      res.status(400).json({ message: "Invalid price" });
      return;
    }
    patch.price = price;
  }

  if (body.salePrice !== undefined) {
    const salePrice =
      body.salePrice === null || body.salePrice === ""
        ? null
        : typeof body.salePrice === "number"
          ? body.salePrice
          : Number(body.salePrice);
    if (salePrice != null && (!Number.isFinite(salePrice) || salePrice < 0)) {
      res.status(400).json({ message: "Invalid salePrice" });
      return;
    }
    patch.salePrice = salePrice;
  }

  if (body.stockQty != null) {
    const stockQty =
      typeof body.stockQty === "number" ? body.stockQty : Number(body.stockQty);
    if (!Number.isFinite(stockQty) || stockQty < 0) {
      res.status(400).json({ message: "Invalid stockQty" });
      return;
    }
    patch.stockQty = stockQty;
  }
  if (isNonEmptyString(body.status)) {
    const status = body.status.trim();
    if (!["active", "inactive"].includes(status)) {
      res.status(400).json({ message: "Invalid status" });
      return;
    }
    patch.status = status;
  }

  if (Object.keys(patch).length === 0) {
    res.status(400).json({ message: "Nothing to update" });
    return;
  }

  try {
    const updated = await Medicine.findByIdAndUpdate(id, patch, { new: true })
      .select({
        name: 1,
        slug: 1,
        genericName: 1,
        brandName: 1,
        dosageForm: 1,
        strength: 1,
        description: 1,
        indications: 1,
        warnings: 1,
        otc: 1,
        requiresPrescription: 1,
        categories: 1,
        tags: 1,
        images: 1,
        sku: 1,
        manufacturer: 1,
        price: 1,
        salePrice: 1,
        currency: 1,
        stockQty: 1,
        status: 1,
        createdAt: 1,
      })
      .lean();
    if (!updated) {
      res.status(404).json({ message: "Medicine not found" });
      return;
    }
    res.json({ data: updated });
  } catch (e: unknown) {
    const msg = (e as { code?: number })?.code === 11000 ? "Slug already exists" : "Failed to update medicine";
    res.status(400).json({ message: msg });
  }
});

router.delete("/medicines/:id", async (req, res) => {
  const { id } = req.params;
  const deleted = await Medicine.findByIdAndDelete(id).lean();
  if (!deleted) {
    res.status(404).json({ message: "Medicine not found" });
    return;
  }
  res.json({ data: { ok: true } });
});

router.get("/orders", async (_req, res) => {
  const req = _req as unknown as { query?: Record<string, unknown> };
  const qRaw = getQueryString(req.query?.q);
  const statusRaw = getQueryString(req.query?.status);
  const paymentRaw = getQueryString(req.query?.paymentStatus);
  const pageRaw = getQueryString(req.query?.page);
  const limitRaw = getQueryString(req.query?.limit);

  const q = isNonEmptyString(qRaw) ? qRaw.trim().slice(0, 80) : "";
  const status = isNonEmptyString(statusRaw) ? statusRaw.trim() : "";
  const paymentStatus = isNonEmptyString(paymentRaw) ? paymentRaw.trim() : "";
  const page = Math.max(1, Number(pageRaw ?? 1) || 1);
  const limit = Math.min(50, Math.max(5, Number(limitRaw ?? 10) || 10));
  const skip = (page - 1) * limit;

  const filter: Record<string, unknown> = {};
  if (status && ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled", "refunded"].includes(status)) {
    filter.status = status;
  }
  if (paymentStatus && ["unpaid", "paid", "failed", "refunded"].includes(paymentStatus)) {
    filter.paymentStatus = paymentStatus;
  }
  if (q) {
    const rx = new RegExp(escapeRegex(q), "i");
    filter.$or = [{ orderNumber: rx }, { _id: rx }];
  }

  const [items, total] = await Promise.all([
    Order.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select({ orderNumber: 1, status: 1, paymentStatus: 1, grandTotal: 1, createdAt: 1 })
      .lean(),
    Order.countDocuments(filter),
  ]);

  res.json({
    data: items,
    meta: {
      q,
      status: status && ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled", "refunded"].includes(status) ? status : "",
      paymentStatus: paymentStatus && ["unpaid", "paid", "failed", "refunded"].includes(paymentStatus) ? paymentStatus : "",
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    },
  });
});

router.patch("/orders/:id/status", async (req, res) => {
  const { id } = req.params;
  const body = req.body as { status?: unknown };

  if (!isNonEmptyString(body.status)) {
    res.status(400).json({ message: "Status is required" });
    return;
  }
  const status = body.status.trim();
  const allowed = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled", "refunded"];
  if (!allowed.includes(status)) {
    res.status(400).json({ message: "Invalid order status" });
    return;
  }

  const updated = await Order.findByIdAndUpdate(
    id,
    { status },
    { new: true },
  )
    .select({ orderNumber: 1, status: 1, paymentStatus: 1, grandTotal: 1, createdAt: 1 })
    .lean();

  if (!updated) {
    res.status(404).json({ message: "Order not found" });
    return;
  }

  res.json({ data: updated });
});

router.patch("/orders/:id", async (req, res) => {
  const { id } = req.params;
  const body = req.body as { status?: unknown; paymentStatus?: unknown };

  const patch: Record<string, unknown> = {};

  if (isNonEmptyString(body.status)) {
    const status = body.status.trim();
    const allowed = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled", "refunded"];
    if (!allowed.includes(status)) {
      res.status(400).json({ message: "Invalid order status" });
      return;
    }
    patch.status = status;
  }

  if (isNonEmptyString(body.paymentStatus)) {
    const paymentStatus = body.paymentStatus.trim();
    const allowed = ["unpaid", "paid", "failed", "refunded"];
    if (!allowed.includes(paymentStatus)) {
      res.status(400).json({ message: "Invalid payment status" });
      return;
    }
    patch.paymentStatus = paymentStatus;
  }

  if (Object.keys(patch).length === 0) {
    res.status(400).json({ message: "Nothing to update" });
    return;
  }

  const updated = await Order.findByIdAndUpdate(id, patch, { new: true })
    .select({ orderNumber: 1, status: 1, paymentStatus: 1, grandTotal: 1, createdAt: 1 })
    .lean();

  if (!updated) {
    res.status(404).json({ message: "Order not found" });
    return;
  }

  res.json({ data: updated });
});

router.get("/doctors", async (_req, res) => {
  const req = _req as unknown as { query?: Record<string, unknown> };
  const qRaw = getQueryString(req.query?.q);
  const statusRaw = getQueryString(req.query?.status);
  const pageRaw = getQueryString(req.query?.page);
  const limitRaw = getQueryString(req.query?.limit);

  const q = isNonEmptyString(qRaw) ? qRaw.trim().slice(0, 80) : "";
  const status = isNonEmptyString(statusRaw) ? statusRaw.trim() : "";
  const page = Math.max(1, Number(pageRaw ?? 1) || 1);
  const limit = Math.min(50, Math.max(5, Number(limitRaw ?? 10) || 10));
  const skip = (page - 1) * limit;

  const filter: Record<string, unknown> = {};
  if (status && ["active", "inactive"].includes(status)) filter.status = status;
  if (q) {
    const rx = new RegExp(escapeRegex(q), "i");
    filter.$or = [{ fullName: rx }, { specialization: rx }];
  }

  const [items, total] = await Promise.all([
    Doctor.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("user", "name email phone")
      .select({ user: 1, fullName: 1, specialization: 1, status: 1, createdAt: 1 })
      .lean(),
    Doctor.countDocuments(filter),
  ]);

  res.json({
    data: items,
    meta: {
      q,
      status: status && ["active", "inactive"].includes(status) ? status : "",
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    },
  });
});

router.post("/doctors", async (req, res) => {
  const body = req.body as { userId?: unknown; fullName?: unknown; specialization?: unknown; status?: unknown };
  if (!isNonEmptyString(body.fullName)) {
    res.status(400).json({ message: "fullName is required" });
    return;
  }

  const doc: Record<string, unknown> = {
    fullName: body.fullName.trim(),
    specialization: isNonEmptyString(body.specialization) ? body.specialization.trim() : "",
    status: isNonEmptyString(body.status) ? body.status.trim() : "active",
  };
  if (doc.status && !["active", "inactive"].includes(String(doc.status))) {
    res.status(400).json({ message: "Invalid status" });
    return;
  }

  if (isNonEmptyString(body.userId)) {
    const user = await User.findById(body.userId.trim()).select({ _id: 1 }).lean();
    if (!user) {
      res.status(400).json({ message: "Invalid userId" });
      return;
    }
    doc.user = user._id;
  }

  try {
    const created = await Doctor.create(doc);
    const out = await Doctor.findById(created._id)
      .populate("user", "name email phone")
      .select({ user: 1, fullName: 1, specialization: 1, status: 1, createdAt: 1 })
      .lean();
    res.status(201).json({ data: out });
  } catch (e: unknown) {
    const msg = (e as { code?: number })?.code === 11000 ? "Doctor user already exists" : "Failed to create doctor";
    res.status(400).json({ message: msg });
  }
});

router.patch("/doctors/:id", async (req, res) => {
  const { id } = req.params;
  const body = req.body as { userId?: unknown; fullName?: unknown; specialization?: unknown; status?: unknown };

  const patch: Record<string, unknown> = {};
  if (isNonEmptyString(body.fullName)) patch.fullName = body.fullName.trim();
  if (isNonEmptyString(body.specialization)) patch.specialization = body.specialization.trim();
  if (isNonEmptyString(body.status)) {
    const status = body.status.trim();
    if (!["active", "inactive"].includes(status)) {
      res.status(400).json({ message: "Invalid status" });
      return;
    }
    patch.status = status;
  }
  if (isNonEmptyString(body.userId)) {
    const user = await User.findById(body.userId.trim()).select({ _id: 1 }).lean();
    if (!user) {
      res.status(400).json({ message: "Invalid userId" });
      return;
    }
    patch.user = user._id;
  }

  if (Object.keys(patch).length === 0) {
    res.status(400).json({ message: "Nothing to update" });
    return;
  }

  try {
    const updated = await Doctor.findByIdAndUpdate(id, patch, { new: true })
      .populate("user", "name email phone")
      .select({ user: 1, fullName: 1, specialization: 1, status: 1, createdAt: 1 })
      .lean();
    if (!updated) {
      res.status(404).json({ message: "Doctor not found" });
      return;
    }
    res.json({ data: updated });
  } catch (e: unknown) {
    const msg = (e as { code?: number })?.code === 11000 ? "Doctor user already exists" : "Failed to update doctor";
    res.status(400).json({ message: msg });
  }
});

router.delete("/doctors/:id", async (req, res) => {
  const { id } = req.params;
  const deleted = await Doctor.findByIdAndDelete(id).lean();
  if (!deleted) {
    res.status(404).json({ message: "Doctor not found" });
    return;
  }
  res.json({ data: { ok: true } });
});

router.get("/consultancies", async (_req, res) => {
  const req = _req as unknown as { query?: Record<string, unknown> };
  const statusRaw = getQueryString(req.query?.status);
  const modeRaw = getQueryString(req.query?.mode);
  const doctorIdRaw = getQueryString(req.query?.doctorId);
  const userIdRaw = getQueryString(req.query?.userId);
  const pageRaw = getQueryString(req.query?.page);
  const limitRaw = getQueryString(req.query?.limit);

  const status = isNonEmptyString(statusRaw) ? statusRaw.trim() : "";
  const mode = isNonEmptyString(modeRaw) ? modeRaw.trim() : "";
  const doctorId = isNonEmptyString(doctorIdRaw) ? doctorIdRaw.trim() : "";
  const userId = isNonEmptyString(userIdRaw) ? userIdRaw.trim() : "";

  const page = Math.max(1, Number(pageRaw ?? 1) || 1);
  const limit = Math.min(50, Math.max(5, Number(limitRaw ?? 10) || 10));
  const skip = (page - 1) * limit;

  const filter: Record<string, unknown> = {};
  if (status && ["requested", "confirmed", "completed", "cancelled"].includes(status)) filter.status = status;
  if (mode && ["chat", "video", "audio", "in_person"].includes(mode)) filter.mode = mode;
  if (doctorId) filter.doctor = doctorId;
  if (userId) filter.user = userId;

  const [items, total] = await Promise.all([
    Consultancy.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("user", "name email phone")
      .populate("doctor", "fullName specialization")
      .select({ user: 1, doctor: 1, status: 1, mode: 1, scheduledAt: 1, createdAt: 1 })
      .lean(),
    Consultancy.countDocuments(filter),
  ]);

  res.json({
    data: items,
    meta: {
      status: status && ["requested", "confirmed", "completed", "cancelled"].includes(status) ? status : "",
      mode: mode && ["chat", "video", "audio", "in_person"].includes(mode) ? mode : "",
      doctorId: doctorId || "",
      userId: userId || "",
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    },
  });
});

router.post("/consultancies", async (req, res) => {
  const body = req.body as { userId?: unknown; doctorId?: unknown; status?: unknown; mode?: unknown; scheduledAt?: unknown };

  if (!isNonEmptyString(body.userId) || !isNonEmptyString(body.doctorId)) {
    res.status(400).json({ message: "userId and doctorId are required" });
    return;
  }

  const user = await User.findById(body.userId.trim()).select({ _id: 1 }).lean();
  if (!user) {
    res.status(400).json({ message: "Invalid userId" });
    return;
  }

  const doctor = await Doctor.findById(body.doctorId.trim()).select({ _id: 1 }).lean();
  if (!doctor) {
    res.status(400).json({ message: "Invalid doctorId" });
    return;
  }

  const status = isNonEmptyString(body.status) ? body.status.trim() : "requested";
  if (!["requested", "confirmed", "completed", "cancelled"].includes(status)) {
    res.status(400).json({ message: "Invalid status" });
    return;
  }

  const mode = isNonEmptyString(body.mode) ? body.mode.trim() : "chat";
  if (!["chat", "video", "audio", "in_person"].includes(mode)) {
    res.status(400).json({ message: "Invalid mode" });
    return;
  }

  const scheduledAt =
    body.scheduledAt == null || body.scheduledAt === ""
      ? null
      : new Date(String(body.scheduledAt));
  if (scheduledAt != null && Number.isNaN(scheduledAt.getTime())) {
    res.status(400).json({ message: "Invalid scheduledAt" });
    return;
  }

  const created = await Consultancy.create({
    user: user._id,
    doctor: doctor._id,
    status,
    mode,
    scheduledAt,
  });
  const out = await Consultancy.findById(created._id)
    .populate("user", "name email phone")
    .populate("doctor", "fullName specialization")
    .select({ user: 1, doctor: 1, status: 1, mode: 1, scheduledAt: 1, createdAt: 1 })
    .lean();
  res.status(201).json({ data: out });
});

router.patch("/consultancies/:id", async (req, res) => {
  const { id } = req.params;
  const body = req.body as { status?: unknown; mode?: unknown; scheduledAt?: unknown };

  const patch: Record<string, unknown> = {};
  if (isNonEmptyString(body.status)) {
    const status = body.status.trim();
    if (!["requested", "confirmed", "completed", "cancelled"].includes(status)) {
      res.status(400).json({ message: "Invalid status" });
      return;
    }
    patch.status = status;
  }
  if (isNonEmptyString(body.mode)) {
    const mode = body.mode.trim();
    if (!["chat", "video", "audio", "in_person"].includes(mode)) {
      res.status(400).json({ message: "Invalid mode" });
      return;
    }
    patch.mode = mode;
  }
  if (body.scheduledAt !== undefined) {
    const scheduledAt =
      body.scheduledAt == null || body.scheduledAt === ""
        ? null
        : new Date(String(body.scheduledAt));
    if (scheduledAt != null && Number.isNaN(scheduledAt.getTime())) {
      res.status(400).json({ message: "Invalid scheduledAt" });
      return;
    }
    patch.scheduledAt = scheduledAt;
  }

  if (Object.keys(patch).length === 0) {
    res.status(400).json({ message: "Nothing to update" });
    return;
  }

  const updated = await Consultancy.findByIdAndUpdate(id, patch, { new: true })
    .populate("user", "name email phone")
    .populate("doctor", "fullName specialization")
    .select({ user: 1, doctor: 1, status: 1, mode: 1, scheduledAt: 1, createdAt: 1 })
    .lean();

  if (!updated) {
    res.status(404).json({ message: "Consultancy not found" });
    return;
  }

  res.json({ data: updated });
});

router.delete("/consultancies/:id", async (req, res) => {
  const { id } = req.params;
  const deleted = await Consultancy.findByIdAndDelete(id).lean();
  if (!deleted) {
    res.status(404).json({ message: "Consultancy not found" });
    return;
  }
  res.json({ data: { ok: true } });
});

export default router;
