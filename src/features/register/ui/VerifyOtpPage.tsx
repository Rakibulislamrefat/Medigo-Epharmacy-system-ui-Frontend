import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { sendOtpApi, verifyOtpApi } from "../service/otpService";

export default function VerifyOtpPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [email, setEmail] = useState(searchParams.get("email") ?? "");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const validate = () => {
    if (!email.trim()) {
      toast.error("Email is required");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      toast.error("Enter a valid email");
      return false;
    }
    if (!otp.trim()) {
      toast.error("OTP is required");
      return false;
    }
    return true;
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await verifyOtpApi(email.trim(), otp.trim());
      toast.success("Email verified successfully");
      navigate("/login");
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Verification failed";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0 || !email.trim()) return;
    setResendLoading(true);
    try {
      await sendOtpApi(email.trim());
      setCountdown(60);
      toast.success("OTP sent");
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Failed to send OTP";
      toast.error(msg);
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F2ED] flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-[#F0E3D8] bg-white/95 px-6 py-8 shadow-[0_16px_40px_rgba(60,26,18,0.12)]">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-[#1A1A1A]">Verify OTP</h1>
          <p className="mt-2 text-sm text-[#888]">
            We sent a verification code to your email.
          </p>
        </div>

        <form onSubmit={handleVerify} className="mt-6 space-y-4">
          <div>
            <label className="text-xs font-medium text-[#777]">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 h-10 w-full rounded-md border border-[#E8E2DA] bg-[#F9F6F1] px-3 text-sm text-[#1A1A1A]"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-[#777]">OTP</label>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="mt-1 h-10 w-full rounded-md border border-[#E8E2DA] bg-[#F9F6F1] px-3 text-sm text-[#1A1A1A]"
              placeholder="Enter the 6-digit code"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="h-11 w-full rounded-md bg-[#C0392B] text-sm font-semibold text-white disabled:opacity-70"
          >
            {loading ? "Verifying..." : "Verify"}
          </button>
        </form>

        <div className="mt-4 flex items-center justify-between text-sm">
          <button
            type="button"
            onClick={handleResend}
            disabled={resendLoading || countdown > 0}
            className="text-[#C0392B] disabled:opacity-60"
          >
            {countdown > 0 ? `Resend in ${countdown}s` : "Resend OTP"}
          </button>
          <Link to="/login" className="text-[#888] hover:text-[#1A1A1A]">
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}
