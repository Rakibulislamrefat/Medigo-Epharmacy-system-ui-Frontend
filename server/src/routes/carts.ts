import { Router, type Request, type Response } from "express";
import { Types } from "mongoose";
import { Cart } from "../models/Cart.js";
import { Medicine } from "../models/Medicine.js";

const router = Router();

const sendError = (res: Response, statusCode: number, message: string) => {
  res.status(statusCode).json({ success: false, statusCode, message });
};

const parseQty = (value: unknown): number | null => {
  const qty = typeof value === "number" ? value : Number(value);
  if (!Number.isInteger(qty) || qty < 1) return null;
  return qty;
};

const requireUserId = (req: Request) => {
  return req.auth?.sub;
};

const getMyCart = async (userId: string) => {
  let cart = await Cart.findOne({ user: userId });
  if (!cart) {
    cart = await Cart.create({ user: userId, items: [] });
  }

  return Cart.findById(cart._id)
    .populate({
      path: "items.product",
      select: "name slug price salePrice currency images stockQty status dosageForm strength",
    })
    .lean();
};

const addProductToCart = async (userId: string, productId: string, qty: number) => {
  if (!Types.ObjectId.isValid(productId)) {
    return { statusCode: 400, message: "Invalid productId" };
  }

  const product = await Medicine.findOne({ _id: productId, status: "active" })
    .select({ _id: 1, stockQty: 1 })
    .lean();

  if (!product) {
    return { statusCode: 404, message: "Product not found" };
  }
  if (product.stockQty != null && product.stockQty < qty) {
    return { statusCode: 400, message: "Requested quantity is not available" };
  }

  const cart = await Cart.findOneAndUpdate(
    { user: userId },
    { $setOnInsert: { user: userId } },
    { new: true, upsert: true },
  );

  const item = cart.items.find((entry) => String(entry.product) === productId);
  if (item) {
    item.qty += qty;
    if (product.stockQty != null && item.qty > product.stockQty) {
      return { statusCode: 400, message: "Requested quantity is not available" };
    }
  } else {
    cart.items.push({ product: new Types.ObjectId(productId), qty });
  }

  await cart.save();
  return { cart: await getMyCart(userId) };
};

router.post("/add", async (req, res) => {
  const userId = requireUserId(req);
  if (!userId) {
    sendError(res, 401, "Unauthorized");
    return;
  }

  const body = req.body as { productId?: unknown; qty?: unknown };
  if (typeof body.productId !== "string" || !body.productId.trim()) {
    sendError(res, 400, "productId is required");
    return;
  }

  const qty = parseQty(body.qty ?? 1);
  if (!qty) {
    sendError(res, 400, "qty must be a positive integer");
    return;
  }

  const result = await addProductToCart(userId, body.productId.trim(), qty);
  if ("statusCode" in result) {
    sendError(res, result.statusCode ?? 400, result.message ?? "Cart operation failed");
    return;
  }

  res.status(201).json({
    success: true,
    statusCode: 201,
    message: "Product added to cart",
    data: result.cart,
  });
});

router.post("/products/:productId", async (req, res) => {
  const userId = requireUserId(req);
  if (!userId) {
    sendError(res, 401, "Unauthorized");
    return;
  }

  const qty = parseQty((req.body as { qty?: unknown }).qty ?? 1);
  if (!qty) {
    sendError(res, 400, "qty must be a positive integer");
    return;
  }

  const result = await addProductToCart(userId, req.params.productId, qty);
  if ("statusCode" in result) {
    sendError(res, result.statusCode ?? 400, result.message ?? "Cart operation failed");
    return;
  }

  res.status(201).json({
    success: true,
    statusCode: 201,
    message: "Product added to cart",
    data: result.cart,
  });
});

router.get("/", async (req, res) => {
  const userId = requireUserId(req);
  if (!userId) {
    sendError(res, 401, "Unauthorized");
    return;
  }

  res.json({
    success: true,
    statusCode: 200,
    message: "Cart retrieved",
    data: await getMyCart(userId),
  });
});

router.patch("/me/items", async (req, res) => {
  const userId = requireUserId(req);
  if (!userId) {
    sendError(res, 401, "Unauthorized");
    return;
  }

  const body = req.body as { productId?: unknown; qty?: unknown };
  if (typeof body.productId !== "string" || !Types.ObjectId.isValid(body.productId)) {
    sendError(res, 400, "Invalid productId");
    return;
  }

  const qty = parseQty(body.qty);
  if (!qty) {
    sendError(res, 400, "qty must be a positive integer");
    return;
  }

  const product = await Medicine.findOne({ _id: body.productId, status: "active" })
    .select({ _id: 1, stockQty: 1 })
    .lean();
  if (!product) {
    sendError(res, 404, "Product not found");
    return;
  }
  if (product.stockQty != null && qty > product.stockQty) {
    sendError(res, 400, "Requested quantity is not available");
    return;
  }

  const cart = await Cart.findOne({ user: userId });
  const item = cart?.items.find((entry) => String(entry.product) === body.productId);
  if (!cart || !item) {
    sendError(res, 404, "Cart item not found");
    return;
  }

  item.qty = qty;
  await cart.save();

  res.json({
    success: true,
    statusCode: 200,
    message: "Cart item updated",
    data: await getMyCart(userId),
  });
});

router.delete("/me/items/:productId", async (req, res) => {
  const userId = requireUserId(req);
  if (!userId) {
    sendError(res, 401, "Unauthorized");
    return;
  }
  if (!Types.ObjectId.isValid(req.params.productId)) {
    sendError(res, 400, "Invalid productId");
    return;
  }

  const cart = await Cart.findOne({ user: userId });
  if (!cart) {
    sendError(res, 404, "Cart item not found");
    return;
  }

  const originalLength = cart.items.length;
  const itemIndex = cart.items.findIndex((entry) => String(entry.product) === req.params.productId);
  if (itemIndex >= 0) {
    cart.items.splice(itemIndex, 1);
  }
  if (cart.items.length === originalLength) {
    sendError(res, 404, "Cart item not found");
    return;
  }

  await cart.save();

  res.json({
    success: true,
    statusCode: 200,
    message: "Cart item removed",
    data: await getMyCart(userId),
  });
});

export default router;
