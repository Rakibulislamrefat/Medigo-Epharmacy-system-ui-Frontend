// src/pages/auth/ResetPasswordPage.tsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Form, { type Field } from "../../../shared/components/Form";
import { resetPasswordApi } from "../service/resetPasswrod";

// ── Types ──────────────────────────────────────────────────
interface ResetFormValues {
  password: string;
  confirmPassword: string;
}

interface ResetFormErrors {
  password?: string;
  confirmPassword?: string;
  [key: string]: string | undefined;
}

// ── Password strength ──────────────────────────────────────
interface StrengthResult {
  score: number; // 0-4
  label: string;
  color: string;
  bgColor: string;
}

const getStrength = (password: string): StrengthResult => {
  if (!password) return { score: 0, label: "", color: "", bgColor: "" };

  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  // Cap at 4
  score = Math.min(score, 4);

  const map: Record<number, Omit<StrengthResult, "score">> = {
    0: { label: "", color: "", bgColor: "" },
    1: { label: "Weak", color: "text-red-500", bgColor: "bg-red-500" },
    2: { label: "Fair", color: "text-orange-500", bgColor: "bg-orange-400" },
    3: { label: "Good", color: "text-yellow-600", bgColor: "bg-yellow-400" },
    4: { label: "Strong", color: "text-green-600", bgColor: "bg-green-500" },
  };

  return { score, ...map[score] };
};

// ── Password requirement row ───────────────────────────────
const Requirement: React.FC<{ met: boolean; text: string }> = ({
  met,
  text,
}) => (
  <div className="flex items-center gap-2">
    <div
      className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 transition-all duration-200
      ${met ? "bg-green-500" : "bg-gray-200"}`}
    >
      {met && (
        <svg
          className="w-2.5 h-2.5 text-white"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={3}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5 13l4 4L19 7"
          />
        </svg>
      )}
    </div>
    <span
      className={`text-xs transition-colors duration-200 ${met ? "text-green-600" : "text-dark/40"}`}
    >
      {text}
    </span>
  </div>
);

// ── Blood drop SVG ─────────────────────────────────────────
const BloodDrop: React.FC<{ className?: string }> = ({ className = "" }) => (
  <svg
    viewBox="0 0 40 52"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path
      d="M20 2C20 2 4 18.5 4 30C4 39.941 11.163 48 20 48C28.837 48 36 39.941 36 30C36 18.5 20 2 20 2Z"
      fill="white"
      fillOpacity="0.9"
    />
    <path
      d="M20 12C20 12 10 22.5 10 30C10 35.523 14.477 40 20 40C25.523 40 30 35.523 30 30C30 22.5 20 12 20 12Z"
      fill="white"
      fillOpacity="0.25"
    />
  </svg>
);

// ── Success illustration ───────────────────────────────────
const SuccessIllustration: React.FC = () => (
  <div className="relative w-24 h-24 mx-auto mb-6">
    <div className="absolute inset-0 rounded-full bg-green-50 animate-ping opacity-25" />
    <div className="absolute inset-0 rounded-full bg-green-50" />
    <div className="absolute inset-0 flex items-center justify-center">
      <svg
        className="w-10 h-10 text-green-500"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
        />
      </svg>
    </div>
    <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-green-500 flex items-center justify-center border-2 border-white">
      <svg
        className="w-3.5 h-3.5 text-white"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={3}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
    </div>
  </div>
);

// ── Expired token state ────────────────────────────────────
const ExpiredState: React.FC = () => (
  <div className="text-center">
    <div className="relative w-24 h-24 mx-auto mb-6">
      <div className="absolute inset-0 rounded-full bg-orange-50" />
      <div className="absolute inset-0 flex items-center justify-center">
        <svg
          className="w-10 h-10 text-orange-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>
      <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-orange-400 flex items-center justify-center border-2 border-white">
        <svg
          className="w-3.5 h-3.5 text-white"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={3}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </div>
    </div>

    <h2 className="text-2xl font-bold text-dark">Link expired</h2>
    <p className="mt-3 text-sm text-dark/50 leading-relaxed max-w-xs mx-auto">
      This password reset link has expired or has already been used. Reset links
      are only valid for{" "}
      <span className="font-semibold text-dark">15 minutes</span>.
    </p>

    <div className="mt-8 flex flex-col gap-3">
      <Link
        to="/forgot-password"
        className="w-full py-3 rounded-xs bg-primary text-white text-sm font-semibold text-center
          hover:bg-red-700 transition-colors duration-200"
      >
        Request a new link
      </Link>
      <Link
        to="/login"
        className="w-full py-3 rounded-xs border border-gray-200 text-dark text-sm font-semibold text-center
          hover:bg-gray-50 transition-colors duration-200"
      >
        Back to login
      </Link>
    </div>
  </div>
);

// ── Main Component ─────────────────────────────────────────
const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [step, setStep] = useState<"form" | "success" | "expired">("form");
  const [values, setValues] = useState<ResetFormValues>({
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<ResetFormErrors>({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [mounted, setMounted] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [showCpw, setShowCpw] = useState(false);
  const [redirectIn, setRedirectIn] = useState(5);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Auto-redirect after success
  useEffect(() => {
    if (step !== "success") return;
    if (redirectIn <= 0) {
      navigate("/login");
      return;
    }
    const t = setTimeout(() => setRedirectIn((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [step, redirectIn, navigate]);

  // Detect missing token
  useEffect(() => {
    if (!token) setStep("expired");
  }, [token]);

  // ── Derived password checks ────────────────────────────
  const pw = values.password;
  const strength = getStrength(pw);

  const requirements = [
    { met: pw.length >= 8, text: "At least 8 characters" },
    {
      met: /[A-Z]/.test(pw) && /[a-z]/.test(pw),
      text: "Upper & lowercase letters",
    },
    { met: /[0-9]/.test(pw), text: "At least one number" },
    { met: /[^A-Za-z0-9]/.test(pw), text: "At least one special character" },
  ];

  const allMet = requirements.every((r) => r.met);

  // ── Dynamic form fields ────────────────────────────────
  const RESET_FIELDS: Field[] = [
    {
      name: "password",
      label: "New password",
      type: showPw ? "text" : "password",
      placeholder: "Min 8 characters",
      required: true,
      colSpan: "full",
    },
    {
      name: "confirmPassword",
      label: "Confirm new password",
      type: showCpw ? "text" : "password",
      placeholder: "Re-enter your new password",
      required: true,
      colSpan: "full",
    },
  ];

  // Toggle actions passed into Form's fieldActions
  const fieldActions: Record<string, React.ReactNode> = {
    password: (
      <button
        type="button"
        onClick={() => setShowPw((v) => !v)}
        className="p-1 text-dark/30 hover:text-dark/60 transition-colors"
        tabIndex={-1}
        aria-label={showPw ? "Hide password" : "Show password"}
      >
        {showPw ? (
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
            />
          </svg>
        ) : (
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        )}
      </button>
    ),
    confirmPassword: (
      <button
        type="button"
        onClick={() => setShowCpw((v) => !v)}
        className="p-1 text-dark/30 hover:text-dark/60 transition-colors"
        tabIndex={-1}
        aria-label={showCpw ? "Hide password" : "Show password"}
      >
        {showCpw ? (
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
            />
          </svg>
        ) : (
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        )}
      </button>
    ),
  };

  // ── Validation ────────────────────────────────────────────
  const validate = (): boolean => {
    const newErrors: ResetFormErrors = {};

    if (!values.password) {
      newErrors.password = "Password is required";
    } else if (!allMet) {
      newErrors.password = "Password does not meet all requirements";
    }

    if (!values.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (values.password !== values.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ── Handlers ─────────────────────────────────────────────
  const handleChange = (name: string, value: unknown) => {
    setValues((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
    if (apiError) setApiError("");
  };

  const handleSubmit = async (e?: React.SyntheticEvent) => {
    e?.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setApiError("");

    try {
      await resetPasswordApi(token, values.password);
      setStep("success");
    } catch (err: unknown) {
      const error = err as {
        response?: { data?: { message?: string }; status?: number };
      };
      const msg = error?.response?.data?.message ?? "";
      if (
        msg.toLowerCase().includes("expired") ||
        msg.toLowerCase().includes("invalid") ||
        error?.response?.status === 400 ||
        error?.response?.status === 410
      ) {
        setStep("expired");
      } else {
        setApiError(msg || "Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Render ────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex overflow-hidden">
      {/* ── LEFT PANEL ──────────────────────────────────── */}
      <div
        className={`
          hidden lg:flex lg:w-[46%] xl:w-[42%] flex-col relative
          bg-[#6B0F0F] overflow-hidden
          transition-all duration-700
          ${mounted ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8"}
        `}
      >
        {/* Background depth */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-32 -left-32 w-[480px] h-[480px] rounded-full bg-[#8B1A1A]/40" />
          <div className="absolute -bottom-40 -right-20 w-[520px] h-[520px] rounded-full bg-black/20" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#7A1515]/20" />
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />
        </div>

        <div className="relative z-10 flex flex-col h-full px-10 xl:px-14 py-10">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-white/15 backdrop-blur-sm flex items-center justify-center">
              <BloodDrop className="w-5 h-6" />
            </div>
            <span className="text-white font-bold text-xl tracking-tight">
              Blood<span className="text-red-300">Connect</span>
            </span>
          </div>

          {/* Content */}
          <div className="mt-auto mb-auto flex flex-col gap-6 pt-16">
            <div className="w-20 h-20 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center">
              <svg
                className="w-10 h-10 text-red-200"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z"
                />
              </svg>
            </div>

            <h1 className="text-4xl xl:text-5xl font-bold text-white leading-tight">
              Create a<br />
              <span className="text-red-300">new password</span>
            </h1>

            <p className="text-white/60 text-base leading-relaxed max-w-xs">
              Choose a strong password to keep your donor account secure and
              your data protected.
            </p>

            {/* Security tips */}
            <div className="flex flex-col gap-4 mt-2">
              {[
                {
                  icon: "🔑",
                  title: "Use a passphrase",
                  desc: "Three random words are easier to remember and harder to crack.",
                },
                {
                  icon: "🔒",
                  title: "Never reuse passwords",
                  desc: "Each account deserves its own unique password.",
                },
                {
                  icon: "📱",
                  title: "Consider a password manager",
                  desc: "Tools like Bitwarden or 1Password keep you safe effortlessly.",
                },
              ].map((tip) => (
                <div key={tip.title} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0 text-sm">
                    {tip.icon}
                  </div>
                  <div>
                    <p className="text-white/80 text-sm font-semibold">
                      {tip.title}
                    </p>
                    <p className="text-white/40 text-xs leading-snug mt-0.5">
                      {tip.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <p className="mt-auto text-white/30 text-xs">
            © 2025 BloodConnect Bangladesh. All rights reserved.
          </p>
        </div>
      </div>

      {/* ── RIGHT PANEL ─────────────────────────────────── */}
      <div
        className={`
          flex-1 flex flex-col items-center justify-center
          bg-[#FAF7F4] px-6 sm:px-10 py-12
          transition-all duration-700 delay-150
          ${mounted ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"}
        `}
      >
        {/* Mobile logo */}
        <div className="lg:hidden flex items-center gap-2 mb-10">
          <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center">
            <BloodDrop className="w-4 h-5" />
          </div>
          <span className="text-dark font-bold text-lg">
            Blood<span className="text-primary">Connect</span>
          </span>
        </div>

        <div className="w-full max-w-[420px]">
          {/* ── EXPIRED STATE ── */}
          {step === "expired" && <ExpiredState />}

          {/* ── FORM STATE ── */}
          {step === "form" && (
            <div
              className={`transition-all duration-500 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
            >
              {/* Back link */}
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 text-sm text-dark/40 hover:text-dark/70 transition-colors mb-8 group"
              >
                <svg
                  className="w-4 h-4 transition-transform group-hover:-translate-x-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
                Back to login
              </Link>

              <div className="mb-7">
                <h2 className="text-3xl font-bold text-dark tracking-tight">
                  Set a new
                  <br />
                  <span className="text-primary">password</span>
                </h2>
                <p className="mt-2.5 text-sm text-dark/50 leading-relaxed">
                  Must be at least 8 characters with a mix of letters, numbers,
                  and symbols.
                </p>
              </div>

              {/* API error */}
              {apiError && (
                <div className="mb-5 flex items-start gap-2.5 bg-red-50 border border-primary/20 rounded-xs px-4 py-3">
                  <svg
                    className="w-4 h-4 text-primary mt-0.5 shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  <p className="text-sm text-primary">{apiError}</p>
                </div>
              )}

              <Form
                fields={RESET_FIELDS}
                values={values}
                onChange={handleChange}
                onSubmit={handleSubmit}
                errors={errors as Record<string, string>}
                fieldActions={fieldActions}
                loading={loading}
                layout="single"
                showSubmitButton={false}
              />

              {/* Password strength bar */}
              {pw && (
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-dark/40">
                      Password strength
                    </span>
                    <span
                      className={`text-xs font-semibold transition-colors duration-300 ${strength.color}`}
                    >
                      {strength.label}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className={`h-1.5 flex-1 rounded-full transition-all duration-300
                          ${i <= strength.score ? strength.bgColor : "bg-gray-200"}`}
                      />
                    ))}
                  </div>

                  {/* Requirements checklist */}
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-3 p-4 bg-white rounded-xs border border-gray-100">
                    {requirements.map((req) => (
                      <Requirement
                        key={req.text}
                        met={req.met}
                        text={req.text}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Match indicator */}
              {values.confirmPassword && (
                <div
                  className={`mt-3 flex items-center gap-1.5 text-xs font-medium transition-colors duration-200
                  ${values.password === values.confirmPassword ? "text-green-600" : "text-red-500"}`}
                >
                  {values.password === values.confirmPassword ? (
                    <>
                      <svg
                        className="w-3.5 h-3.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2.5}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      Passwords match
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-3.5 h-3.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2.5}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                      Passwords do not match
                    </>
                  )}
                </div>
              )}

              {/* Submit */}
              <button
                type="button"
                onClick={() => void handleSubmit()}
                disabled={loading}
                className={`
                  mt-6 w-full py-3 rounded-xs text-sm font-semibold
                  flex items-center justify-center gap-2
                  transition-all duration-200 active:scale-[0.98]
                  ${
                    loading
                      ? "bg-primary/60 text-white cursor-not-allowed"
                      : "bg-primary text-white hover:bg-red-700 cursor-pointer"
                  }
                `}
              >
                {loading ? (
                  <>
                    <svg
                      className="w-4 h-4 animate-spin"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <circle
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        className="opacity-25"
                      />
                      <path
                        fill="currentColor"
                        className="opacity-75"
                        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                      />
                    </svg>
                    Updating password…
                  </>
                ) : (
                  <>
                    Reset password
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M13 7l5 5m0 0l-5 5m5-5H6"
                      />
                    </svg>
                  </>
                )}
              </button>
            </div>
          )}

          {/* ── SUCCESS STATE ── */}
          {step === "success" && (
            <div className="text-center transition-all duration-500">
              <SuccessIllustration />

              <h2 className="text-2xl font-bold text-dark">
                Password updated!
              </h2>
              <p className="mt-3 text-sm text-dark/50 leading-relaxed max-w-sm mx-auto">
                Your password has been reset successfully. You can now sign in
                with your new password.
              </p>

              {/* Auto-redirect indicator */}
              <div className="mt-8 flex flex-col items-center gap-5">
                <div className="relative w-16 h-16">
                  <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
                    <circle
                      cx="32"
                      cy="32"
                      r="28"
                      fill="none"
                      stroke="#E5E7EB"
                      strokeWidth="4"
                    />
                    <circle
                      cx="32"
                      cy="32"
                      r="28"
                      fill="none"
                      stroke="#B91C1C"
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 28}`}
                      strokeDashoffset={`${2 * Math.PI * 28 * (redirectIn / 5)}`}
                      className="transition-all duration-1000"
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-lg font-bold text-dark">
                    {redirectIn}
                  </span>
                </div>
                <p className="text-xs text-dark/40">
                  Redirecting to login in {redirectIn} second
                  {redirectIn !== 1 ? "s" : ""}…
                </p>
              </div>

              <Link
                to="/login"
                className="mt-6 w-full py-3 rounded-xs bg-primary text-white text-sm font-semibold
                  flex items-center justify-center gap-2 hover:bg-red-700 transition-colors duration-200"
              >
                Sign in now
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
