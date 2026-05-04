import { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useRegister } from "../service/UseRegister";
import { useLocation } from "../../../hooks/useLocation";
import type { RegisterFormData } from "../service/register.type";
import toast from "react-hot-toast";
import SectionHeading from "../../../shared/section-heading/SectionHeading";
import { Icons } from "../../../shared/icons/Icons";
import CustomButton from "../../../shared/button/CustomButton";

const FIELD_ORDER = ["name", "email", "phone", "password", "confirmPassword"];

const getPasswordStrength = (val: string) => {
  let score = 0;
  if (val.length >= 8) score++;
  if (/[A-Z]/.test(val)) score++;
  if (/[0-9]/.test(val)) score++;
  if (/[^A-Za-z0-9]/.test(val)) score++;
  const colors = ["#E74C3C", "#E67E22", "#F1C40F", "#1D9E75"];
  const labels = ["Weak", "Fair", "Good", "Strong"];
  return { score, color: colors[score - 1] || "", label: labels[score - 1] || "" };
};

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register, loading } = useRegister();
  const { getLocation } = useLocation();
  const fieldRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const [form, setForm] = useState<RegisterFormData>({
    role: "user",
    isAvailable: false,
    avatar: null,
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    bloodType: "",
    gender: "",
    age: "",
    weight: "",
    dateOfBirth: "",
    location: {
      displayName: "",
      road: "",
      quarter: "",
      suburb: "",
      city: "",
      county: "",
      state_district: "",
      state: "",
      postcode: "",
      country: "",
      country_code: "",
      coordinates: { lat: null, lng: null },
    },
    socialLinks: {
      facebook: "",
      instagram: "",
      twitter: "",
    },
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    const email = form.email.trim();
    const phone = form.phone.trim().replace(/[\s-]/g, "");
    const bdPhone = /^(?:\+?88)?01[3-9]\d{8}$/;

    if (!form.name.trim()) errs.name = "Full name is required";
    if (!email) errs.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      errs.email = "Enter a valid email address";

    if (!phone) errs.phone = "Phone number is required";
    else if (!bdPhone.test(phone))
      errs.phone = "Use a valid Bangladeshi number (01XXXXXXXXX)";

    if (!form.password) errs.password = "Password is required";
    else if (form.password.length < 8) errs.password = "Min 8 characters";

    if (!form.confirmPassword) errs.confirmPassword = "Confirm your password";
    else if (form.password !== form.confirmPassword)
      errs.confirmPassword = "Passwords do not match";

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const setFieldRef = (key: string) => (el: HTMLInputElement | null) => {
    fieldRefs.current[key] = el;
  };

  const focusField = (key: string) => {
    const target = fieldRefs.current[key];
    if (target) {
      target.focus();
      target.select?.();
    }
  };

  const focusNextField = (currentKey: string): boolean => {
    const order = FIELD_ORDER;
    const currentIndex = order.indexOf(currentKey);
    if (currentIndex === -1) return false;
    const nextKey = order[currentIndex + 1];
    if (!nextKey) return false;
    focusField(nextKey);
    return true;
  };

  const handleInputKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>,
    currentKey: string,
  ) => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    const moved = focusNextField(currentKey);
    if (!moved) {
      void handleSubmit();
    }
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    const loadingToast = toast.loading("Creating account...");

    try {
      const locationResult = await getLocation();
      const finalForm = locationResult
        ? {
            ...form,
            location: {
              ...form.location,
              displayName: locationResult.displayName,
              road: locationResult.details.road || "",
              quarter: locationResult.details.quarter || "",
              city: locationResult.details.city || locationResult.details.town || locationResult.details.village || "",
              county: locationResult.details.county || "",
              state_district: locationResult.details.state_district || "",
              state: locationResult.details.state || "",
              postcode: locationResult.details.postcode || "",
              country: locationResult.details.country || "",
              country_code: (locationResult.details.country_code || "").toUpperCase(),
              coordinates: { lat: locationResult.latitude, lng: locationResult.longitude },
            },
          }
        : form;

      if (locationResult) {
        setForm(finalForm);
      }

      const data = await register(finalForm);
      void data;

      toast.success("Account created! Verify your email.", { id: loadingToast });
      navigate(`/verify-otp?email=${encodeURIComponent(finalForm.email.trim())}`);
    } catch (err: unknown) {
      const error = err as {
        response?: {
          data?: {
            errors?: string[];
            message?: string;
            data?: { message?: string };
          };
        };
        message?: string;
      };
      const backendErrors = error?.response?.data?.errors;
      const message =
        (Array.isArray(backendErrors) && backendErrors.length > 0
          ? backendErrors[0]
          : undefined) ||
        error?.response?.data?.message ||
        error?.response?.data?.data?.message ||
        error?.message ||
        "Registration failed";
      toast.error(message, { id: loadingToast });
      setErrors({ submit: message });
    }
  };

  const strength = getPasswordStrength(form.password);
  const phoneHint = useMemo(() => "Example: 01XXXXXXXXX or +8801XXXXXXXXX", []);

  return (
    <div className="min-h-screen bg-light">
      <div className="min-h-screen flex flex-col lg:flex-row">
        <div className="w-full lg:w-1/2 flex flex-col justify-between relative overflow-hidden text-white bg-gradient-to-br from-primary via-primary to-secondary">
          <div className="absolute -top-[140px] -right-[140px] w-[460px] h-[460px] rounded-full bg-white/10 blur-[60px] pointer-events-none" />
          <div className="absolute -bottom-[120px] -left-[120px] w-[380px] h-[380px] rounded-full bg-white/10 blur-[60px] pointer-events-none" />

          <div className="relative z-10 p-7 sm:p-10 lg:p-14">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-white/15 flex items-center justify-center border border-white/10">
                <Icons.Pill className="!w-6 !h-6 text-white" />
              </div>
              <span className="text-lg font-semibold tracking-[0.3px]">
                Medigo
              </span>
            </div>

            <span className="inline-flex mt-8 text-[11px] tracking-[2px] uppercase bg-white/15 px-3 py-1 rounded-full text-white/90 border border-white/10">
              Medigo E-Pharmacy Account
            </span>

            <h1 className="text-3xl sm:text-[38px] font-black leading-tight mt-6 mb-5 max-w-[520px]">
              Your health, our priority.
              <span className="text-white/80"> Medicines made simple.</span>
            </h1>

            <p className="text-white/75 text-sm leading-relaxed max-w-[520px]">
              Join Medigo to access authentic medicines, track prescriptions,
              and enjoy fast, reliable delivery across Bangladesh.
            </p>
          </div>

          <div className="relative z-10 px-7 pb-7 sm:px-10 sm:pb-10 lg:px-14 lg:pb-14 grid grid-cols-2 gap-3">
            {(
              [
                { title: "Authentic", sub: "Verified medicines" },
                { title: "Fast", sub: "Express delivery" },
                { title: "Secure", sub: "Safe payments" },
                { title: "Expert", sub: "Pharmacist support" },
              ] as const
            ).map((s) => (
              <div
                key={s.sub}
                className="bg-white/15 border border-white/10 rounded-xl p-4"
              >
                <div className="text-[22px] font-bold">{s.title}</div>
                <div className="text-xs text-white/70 mt-1">{s.sub}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center bg-light p-5 sm:p-8">
          <div className="w-full max-w-[680px]">
            <SectionHeading
              title="Create your Medigo account"
              description="Create an account to order medicines and upload prescriptions. Press Enter to move through fields quickly."
              align="left"
              className="mb-6"
            />

            <div className="rounded-2xl bg-gradient-to-r from-primary/25 via-secondary/20 to-primary/25 p-[1px] shadow-lg shadow-primary/5">
              <div className="bg-white border border-gray-100 rounded-2xl p-6 sm:p-7">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-7">
                <p className="text-xs text-slate-500">
                  Your account helps you order medicines, upload prescriptions, and
                  manage delivery addresses securely.
                </p>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Icons.Check className="!w-4 !h-4 text-primary" />
                  Secure & private
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Full name <span className="text-danger ml-1">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                      <Icons.User className="!w-4 !h-4" />
                    </span>
                    <input
                      ref={setFieldRef("name")}
                      value={form.name}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, name: e.target.value }))
                      }
                      onKeyDown={(e) => handleInputKeyDown(e, "name")}
                      className={`w-full rounded-sm border px-3.5 py-2.5 text-sm outline-none transition bg-gray-50 text-gray-900 border-gray-300 focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 pl-10 ${
                        errors.name ? "border-danger bg-danger/5 focus:ring-danger/20" : ""
                      }`}
                      placeholder="Your full name"
                      autoComplete="name"
                    />
                  </div>
                  {errors.name && (
                    <p className="text-xs text-danger mt-1 flex items-center gap-2">
                      <Icons.AlertCircle className="!w-4 !h-4" />
                      {errors.name}
                    </p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Email <span className="text-danger ml-1">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                      <Icons.Mail className="!w-4 !h-4" />
                    </span>
                    <input
                      ref={setFieldRef("email")}
                      type="email"
                      value={form.email}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, email: e.target.value }))
                      }
                      onKeyDown={(e) => handleInputKeyDown(e, "email")}
                      className={`w-full rounded-sm border px-3.5 py-2.5 text-sm outline-none transition bg-gray-50 text-gray-900 border-gray-300 focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 pl-10 ${
                        errors.email
                          ? "border-danger bg-danger/5 focus:ring-danger/20"
                          : ""
                      }`}
                      placeholder="you@example.com"
                      autoComplete="email"
                    />
                  </div>
                  {errors.email && (
                    <p className="text-xs text-danger mt-1 flex items-center gap-2">
                      <Icons.AlertCircle className="!w-4 !h-4" />
                      {errors.email}
                    </p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Phone number <span className="text-danger ml-1">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                      <Icons.Phone className="!w-4 !h-4" />
                    </span>
                    <input
                      ref={setFieldRef("phone")}
                      value={form.phone}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, phone: e.target.value }))
                      }
                      onKeyDown={(e) => handleInputKeyDown(e, "phone")}
                      className={`w-full rounded-sm border px-3.5 py-2.5 text-sm outline-none transition bg-gray-50 text-gray-900 border-gray-300 focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 pl-10 ${
                        errors.phone
                          ? "border-danger bg-danger/5 focus:ring-danger/20"
                          : ""
                      }`}
                      placeholder="01XXXXXXXXX"
                      autoComplete="tel"
                      inputMode="tel"
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{phoneHint}</p>
                  {errors.phone && (
                    <p className="text-xs text-danger mt-1 flex items-center gap-2">
                      <Icons.AlertCircle className="!w-4 !h-4" />
                      {errors.phone}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Password <span className="text-danger ml-1">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                      <Icons.Lock className="!w-4 !h-4" />
                    </span>
                    <input
                      ref={setFieldRef("password")}
                      type="password"
                      value={form.password}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, password: e.target.value }))
                      }
                      onKeyDown={(e) => handleInputKeyDown(e, "password")}
                      className={`w-full rounded-sm border px-3.5 py-2.5 text-sm outline-none transition bg-gray-50 text-gray-900 border-gray-300 focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 pl-10 ${
                        errors.password
                          ? "border-danger bg-danger/5 focus:ring-danger/20"
                          : ""
                      }`}
                      placeholder="Minimum 8 characters"
                      autoComplete="new-password"
                    />
                  </div>
                  {strength.score > 0 && (
                    <div className="mt-2 flex items-center gap-3">
                      <div className="flex-1 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-[width] duration-300"
                          style={{
                            width: `${(strength.score / 4) * 100}%`,
                            background: strength.color,
                          }}
                        />
                      </div>
                      <span className="text-xs font-semibold text-slate-600">
                        {strength.label}
                      </span>
                    </div>
                  )}
                  {errors.password && (
                    <p className="text-xs text-danger mt-1 flex items-center gap-2">
                      <Icons.AlertCircle className="!w-4 !h-4" />
                      {errors.password}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Confirm password <span className="text-danger ml-1">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                      <Icons.Lock className="!w-4 !h-4" />
                    </span>
                    <input
                      ref={setFieldRef("confirmPassword")}
                      type="password"
                      value={form.confirmPassword}
                      onChange={(e) =>
                        setForm((p) => ({
                          ...p,
                          confirmPassword: e.target.value,
                        }))
                      }
                      onKeyDown={(e) =>
                        handleInputKeyDown(e, "confirmPassword")
                      }
                      className={`w-full rounded-sm border px-3.5 py-2.5 text-sm outline-none transition bg-gray-50 text-gray-900 border-gray-300 focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 pl-10 ${
                        errors.confirmPassword
                          ? "border-danger bg-danger/5 focus:ring-danger/20"
                          : ""
                      }`}
                      placeholder="Re-enter password"
                      autoComplete="new-password"
                    />
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-xs text-danger mt-1 flex items-center gap-2">
                      <Icons.AlertCircle className="!w-4 !h-4" />
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-end gap-3">
                <CustomButton
                  variant="primary"
                  size="md"
                  radius="xs"
                  loading={loading}
                  disabled={loading}
                  onClick={() => void handleSubmit()}
                  rightIcon={<Icons.ArrowForward className="!w-4 !h-4" />}
                >
                  Create account
                </CustomButton>
              </div>
              </div>
            </div>

            <p className="text-center text-sm text-slate-600 mt-5">
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="text-primary font-semibold hover:underline"
              >
                Sign in
              </button>
            </p>
            <p className="text-center text-xs text-slate-500 mt-2">
              <button
                type="button"
                onClick={() => navigate("/")}
                className="hover:text-primary"
              >
                Back to home
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
