import { Router } from "express";
import { User } from "../models/User.js";
import { Medicine } from "../models/Medicine.js";
import { Order } from "../models/Order.js";
import { Doctor } from "../models/Doctor.js";
import { Consultancy } from "../models/Consultancy.js";

const router = Router();

const isNonEmptyString = (v: unknown): v is string =>
  typeof v === "string" && v.trim().length > 0;

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

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
  const users = await User.find({})
    .sort({ createdAt: -1 })
    .select({ name: 1, email: 1, phone: 1, role: 1, status: 1, createdAt: 1 })
    .lean();
  res.json({ data: users });
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
  const medicines = await Medicine.find({})
    .sort({ createdAt: -1 })
    .select({ name: 1, slug: 1, price: 1, stockQty: 1, status: 1, createdAt: 1 })
    .lean();
  res.json({ data: medicines });
});

router.post("/medicines", async (req, res) => {
  const body = req.body as {
    name?: unknown;
    slug?: unknown;
    price?: unknown;
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

  const price = typeof body.price === "number" ? body.price : Number(body.price);
  if (!Number.isFinite(price) || price < 0) {
    res.status(400).json({ message: "Invalid price" });
    return;
  }

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

  try {
    const created = await Medicine.create({ name, slug, price, stockQty, status });
    const doc = await Medicine.findById(created._id)
      .select({ name: 1, slug: 1, price: 1, stockQty: 1, status: 1, createdAt: 1 })
      .lean();
    res.status(201).json({ data: doc });
  } catch (e: unknown) {
    const msg = (e as { code?: number })?.code === 11000 ? "Slug already exists" : "Failed to create medicine";
    res.status(400).json({ message: msg });
  }
});

router.patch("/medicines/:id", async (req, res) => {
  const { id } = req.params;
  const body = req.body as {
    name?: unknown;
    slug?: unknown;
    price?: unknown;
    stockQty?: unknown;
    status?: unknown;
  };

  const patch: Record<string, unknown> = {};

  if (isNonEmptyString(body.name)) patch.name = body.name.trim();
  if (isNonEmptyString(body.slug)) patch.slug = slugify(body.slug);
  if (body.price != null) {
    const price = typeof body.price === "number" ? body.price : Number(body.price);
    if (!Number.isFinite(price) || price < 0) {
      res.status(400).json({ message: "Invalid price" });
      return;
    }
    patch.price = price;
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
      .select({ name: 1, slug: 1, price: 1, stockQty: 1, status: 1, createdAt: 1 })
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
  const orders = await Order.find({})
    .sort({ createdAt: -1 })
    .select({ orderNumber: 1, status: 1, paymentStatus: 1, grandTotal: 1, createdAt: 1 })
    .lean();
  res.json({ data: orders });
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

router.get("/doctors", async (_req, res) => {
  const doctors = await Doctor.find({})
    .sort({ createdAt: -1 })
    .select({ fullName: 1, specialization: 1, status: 1, createdAt: 1 })
    .lean();
  res.json({ data: doctors });
});

router.get("/consultancies", async (_req, res) => {
  const consultancies = await Consultancy.find({})
    .sort({ createdAt: -1 })
    .select({ status: 1, mode: 1, scheduledAt: 1, createdAt: 1 })
    .lean();
  res.json({ data: consultancies });
});

export default router;
