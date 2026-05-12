import { Schema, model, Types } from "mongoose";

const CartItemSchema = new Schema(
  {
    product: { type: Types.ObjectId, ref: "Medicine", required: true },
    qty: { type: Number, required: true, min: 1 },
  },
  { _id: false },
);

const CartSchema = new Schema(
  {
    user: { type: Types.ObjectId, ref: "User", required: true, unique: true, index: true },
    items: { type: [CartItemSchema], default: [] },
  },
  { timestamps: true },
);

CartSchema.index({ user: 1, "items.product": 1 });

export const Cart = model("Cart", CartSchema);
