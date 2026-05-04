import { Schema, model, Types } from "mongoose";

const ConsultancySchema = new Schema(
  {
    user: { type: Types.ObjectId, ref: "User", required: true, index: true },
    doctor: { type: Types.ObjectId, ref: "Doctor", required: true, index: true },
    status: {
      type: String,
      enum: ["requested", "confirmed", "completed", "cancelled"],
      default: "requested",
      index: true,
    },
    mode: { type: String, enum: ["chat", "video", "audio", "in_person"], default: "chat" },
    scheduledAt: { type: Date, default: null, index: true },
  },
  { timestamps: true },
);

ConsultancySchema.index({ doctor: 1, scheduledAt: 1 });

export const Consultancy = model("Consultancy", ConsultancySchema);

