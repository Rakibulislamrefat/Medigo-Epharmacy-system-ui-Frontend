import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { User } from "../models/User.js";
import { EmailOtp } from "../models/EmailOtp.js";
import { PasswordResetToken } from "../models/PasswordResetToken.js";
import { env } from "../env.js";

const router = Router();

const sha256 = (value: string) =>
  crypto.createHash("sha256").update(value).digest("hex");

const makeOtp = () => String(Math.floor(100000 + Math.random() * 900000));

router.post("/register", async (req, res) => {
  const body = req.body as {
    name?: string;
    email?: string;
    phone?: string;
    password?: string;
    role?: string;
    addresses?: unknown[];
  };

  const name = body.name?.trim() ?? "";
  const email = (body.email ?? "").trim().toLowerCase();
  const phone = (body.phone ?? "").trim();
  const password = body.password ?? "";
  const role = (body.role ?? "user") as "user" | "admin" | "pharmacist" | "doctor";
  const addresses = Array.isArray(body.addresses) ? body.addresses : [];

  if (!name || !email || !phone || !password) {
    res.status(400).json({ message: "Missing required fields" });
    return;
  }

  if (!["user", "admin", "pharmacist", "doctor"].includes(role)) {
    res.status(400).json({ message: "Invalid role" });
    return;
  }

  const existing = await User.findOne({ $or: [{ email }, { phone }] }).lean();
  if (existing) {
    res.status(409).json({ message: "User already exists" });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await User.create({
    name,
    email,
    phone,
    role,
    passwordHash,
    status: "pending",
    isEmailVerified: false,
    addresses,
  });

  const otp = makeOtp();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
  await EmailOtp.findOneAndUpdate(
    { email },
    { email, otp, expiresAt },
    { upsert: true, new: true },
  );

  const payload =
    env.nodeEnv === "production"
      ? { message: "OTP sent to email" }
      : { message: "OTP sent to email", data: { otp } };

  res.status(201).json(payload);
});

router.post("/verify-otp", async (req, res) => {
  const body = req.body as { email?: string; otp?: string };
  const email = (body.email ?? "").trim().toLowerCase();
  const otp = (body.otp ?? "").trim();

  if (!email || !otp) {
    res.status(400).json({ message: "Email and otp are required" });
    return;
  }

  const record = await EmailOtp.findOne({ email }).lean();
  if (!record || record.otp !== otp || new Date(record.expiresAt).getTime() < Date.now()) {
    res.status(400).json({ message: "Invalid or expired OTP" });
    return;
  }

  const user = await User.findOneAndUpdate(
    { email },
    { isEmailVerified: true, status: "active" },
    { new: true },
  ).lean();

  await EmailOtp.deleteOne({ email });

  if (!user) {
    res.status(404).json({ message: "User not found" });
    return;
  }

  res.json({ message: "Email verified" });
});

router.post("/login", async (req, res) => {
  const body = req.body as { identifier?: string; password?: string };
  const identifier = (body.identifier ?? "").trim();
  const password = body.password ?? "";

  if (!identifier || !password) {
    res.status(400).json({ message: "Identifier and password are required" });
    return;
  }

  const user = await User.findOne({
    $or: [{ email: identifier.toLowerCase() }, { phone: identifier }],
  }).select("+passwordHash").lean();

  if (!user || !user.passwordHash) {
    res.status(401).json({ message: "Invalid credentials" });
    return;
  }

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    res.status(401).json({ message: "Invalid credentials" });
    return;
  }

  if (user.status === "blocked") {
    res.status(423).json({ message: "Account is blocked" });
    return;
  }

  if (!user.isEmailVerified) {
    res.status(423).json({ message: "Please verify your email" });
    return;
  }

  const accessToken = jwt.sign(
    { sub: String(user._id), role: user.role },
    env.jwtSecret,
    { expiresIn: "7d" },
  );

  const safeUser = {
    _id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    isVerified: user.isEmailVerified,
    isActive: user.status === "active",
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };

  res.json({
    message: "Login successful",
    data: { user: safeUser, accessToken },
  });
});

router.post("/forgot-password", async (req, res) => {
  const body = req.body as { email?: string };
  const email = (body.email ?? "").trim().toLowerCase();

  if (!email) {
    res.status(400).json({ message: "Email is required" });
    return;
  }

  const user = await User.findOne({ email }).lean();
  if (!user) {
    res.json({ message: "If the email exists, a reset link has been sent." });
    return;
  }

  const token = crypto.randomBytes(32).toString("hex");
  const tokenHash = sha256(token);
  const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

  await PasswordResetToken.create({ email, tokenHash, expiresAt });

  const payload =
    env.nodeEnv === "production"
      ? { message: "Reset link sent" }
      : {
          message: "Reset link sent",
          data: { token, resetLink: `${env.clientOrigin}/reset-password?token=${token}` },
        };

  res.json(payload);
});

router.post("/reset-password", async (req, res) => {
  const body = req.body as { token?: string; newPassword?: string };
  const token = (body.token ?? "").trim();
  const newPassword = body.newPassword ?? "";

  if (!token || !newPassword) {
    res.status(400).json({ message: "Token and newPassword are required" });
    return;
  }

  if (newPassword.length < 8) {
    res.status(400).json({ message: "Password must be at least 8 characters" });
    return;
  }

  const tokenHash = sha256(token);
  const record = await PasswordResetToken.findOne({ tokenHash }).lean();

  if (!record || new Date(record.expiresAt).getTime() < Date.now()) {
    res.status(400).json({ message: "Invalid or expired token" });
    return;
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);
  await User.updateOne({ email: record.email }, { passwordHash });
  await PasswordResetToken.deleteOne({ tokenHash });

  res.json({ message: "Password reset successful" });
});

export default router;

