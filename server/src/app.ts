import express from "express";
import cors from "cors";
import { env } from "./env.js";
import authRoutes from "./routes/auth.js";
import adminRoutes from "./routes/admin.js";
import { requireAdmin, requireAuth } from "./middleware/auth.js";

export const createApp = () => {
  const app = express();

  app.use(
    cors({
      origin: env.clientOrigin,
      credentials: true,
    }),
  );
  app.use(express.json({ limit: "1mb" }));

  app.get("/api/v1/health", (_req, res) => {
    res.json({ ok: true });
  });

  app.use("/api/v1/auth", authRoutes);
  app.use("/api/v1/admin", requireAuth, requireAdmin, adminRoutes);

  app.use((_req, res) => {
    res.status(404).json({ message: "Not found" });
  });

  return app;
};

