import { Schema, model } from "mongoose";

const EmailOtpSchema = new Schema(
  {
    email: { type: String, required: true, lowercase: true, trim: true },
    otp: { type: String, required: true },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true },
);

EmailOtpSchema.index({ email: 1 }, { unique: true });
EmailOtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const EmailOtp = model("EmailOtp", EmailOtpSchema);
