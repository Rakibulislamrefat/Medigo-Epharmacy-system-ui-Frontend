import type { RequestHandler } from "express";
import jwt from "jsonwebtoken";
import { env } from "../env.js";

export type JwtPayload = {
  sub: string;
  role: string;
};

declare module "express-serve-static-core" {
  interface Request {
    auth?: JwtPayload;
  }
}

export const requireAuth: RequestHandler = (req, res, next) => {
  const header = req.headers.authorization ?? "";
  const [type, token] = header.split(" ");
  if (type !== "Bearer" || !token) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  try {
    const decoded = jwt.verify(token, env.jwtSecret) as JwtPayload;
    req.auth = decoded;
    next();
  } catch {
    res.status(401).json({ message: "Unauthorized" });
  }
};

export const requireAdmin: RequestHandler = (req, res, next) => {
  if (!req.auth) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
  if (req.auth.role !== "admin") {
    res.status(403).json({ message: "Forbidden" });
    return;
  }
  next();
};

