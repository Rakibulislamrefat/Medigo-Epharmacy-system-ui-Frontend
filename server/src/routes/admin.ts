import { Router } from "express";
import { User } from "../models/User.js";
import { Medicine } from "../models/Medicine.js";
import { Order } from "../models/Order.js";
import { Doctor } from "../models/Doctor.js";
import { Consultancy } from "../models/Consultancy.js";

const router = Router();

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

router.get("/medicines", async (_req, res) => {
  const medicines = await Medicine.find({})
    .sort({ createdAt: -1 })
    .select({ name: 1, slug: 1, price: 1, stockQty: 1, status: 1, createdAt: 1 })
    .lean();
  res.json({ data: medicines });
});

router.get("/orders", async (_req, res) => {
  const orders = await Order.find({})
    .sort({ createdAt: -1 })
    .select({ orderNumber: 1, status: 1, paymentStatus: 1, grandTotal: 1, createdAt: 1 })
    .lean();
  res.json({ data: orders });
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

