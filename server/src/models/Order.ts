import { Schema, model, Types } from "mongoose";

const OrderSchema = new Schema(
  {
    orderNumber: { type: String, required: true, unique: true, index: true },
    user: { type: Types.ObjectId, ref: "User", required: true, index: true },
    status: {
      type: String,
      enum: ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled", "refunded"],
      default: "pending",
      index: true,
    },
    paymentStatus: {
      type: String,
      enum: ["unpaid", "paid", "failed", "refunded"],
      default: "unpaid",
      index: true,
    },
    grandTotal: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true },
);

OrderSchema.index({ user: 1, createdAt: -1 });

export const Order = model("Order", OrderSchema);

