import { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { loginApi, pharmacistLoginApi } from "../service/loginService";
import { adminLoginApi } from "../../admin/service/adminLoginService";
import { useDispatch } from "react-redux";
import { setUser } from "../../../redux/slices/userSlice";
import CustomButton from "../../../shared/button/CustomButton";
import { Icons } from "../../../shared/icons/Icons";
import SectionHeading from "../../../shared/section-heading/SectionHeading";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  type Actor = "user" | "admin" | "pharmacist";
  const [actor, setActor] = useState<Actor>("user");
  const [identifier, setIdentifier] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPass, setShowPass] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const dispatch = useDispatch();

  const validate = (): Record<string, string> => {
    const errs: Record<string, string> = {};
    if (!identifier.trim()) errs.identifier = "Email or phone is required";
    if (!password) errs.password = "Password is required";
    return errs;
  };

  const handleSubmit = async (): Promise<void> => {
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    setErrors({});
    setLoading(true);
    const toastId = toast.loading("Signing in...");

    try {
      const res =
        actor === "admin"
          ? await adminLoginApi({ identifier, password })
          : actor === "pharmacist"
          ? await pharmacistLoginApi({ identifier, password })
          : await loginApi({ identifier, password });

      const message = res?.message ?? res?.data?.message ?? "Signed in";
      const user = res?.data?.user ?? res?.user;
      const token = res?.data?.accessToken ?? res?.accessToken;

      if (!user || !token) {
        toast.error("Login response is missing user/token", { id: toastId });
        return;
      }

      const role = user.role as string | undefined;
      const roleMap: Record<Actor, string> = {
        user: "user",
        admin: "admin",
        pharmacist: "pharmacist",
      };
      const expectedRole = roleMap[actor];

      if (role !== expectedRole) {
        const userRoleLabel = role ? `your ${role} account` : "this account";
        const errorMessage =
          actor === "admin"
            ? `Please log in with an admin account.`
            : actor === "pharmacist"
            ? `Please log in with a pharmacist account.`
            : `Please log in with a customer account.`;

        toast.error(errorMessage, { id: toastId });
        setErrors({ identifier: errorMessage });
        return;
      }

      toast.success(message, { id: toastId });
      dispatch(setUser({ user, token }));
      const from = location.state?.from?.pathname || "/";
      const redirectPath =
        actor === "admin"
          ? "/admin"
          : actor === "pharmacist"
          ? "/pharmacist"
          : from || "/";
      navigate(redirectPath, { replace: true });
    } catch (err: unknown) {
      const error = err as {
        response?: { data?: { message?: string }; status?: number };
      };
      const msg = error?.response?.data?.message || "Login failed";
      toast.error(msg, { id: toastId });
      if (error?.response?.status === 401 || error?.response?.status === 423) {
        setErrors({ identifier: msg });
      }
    } finally {
      setLoading(false);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === "Enter" && !loading) void handleSubmit();
  };

  const inputClass = (hasError: boolean) =>
    [
      "w-full rounded-sm border px-3.5 py-2.5 text-sm outline-none transition",
      "bg-gray-50 text-gray-900 border-gray-300",
      "focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20",
      hasError ? "border-red-500 bg-red-50 focus:ring-red-500/20" : "",
    ]
      .filter(Boolean)
      .join(" ");

  return (
    <div className="min-h-screen bg-light">
      <div className="min-h-screen flex flex-col lg:flex-row">
      <div
        className="w-full lg:w-1/2 flex flex-col justify-between relative overflow-hidden text-white
          bg-gradient-to-br from-primary via-primary to-secondary"
      >
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
            e-Pharmacy Login
          </span>

          <h1 className="text-3xl sm:text-[38px] font-black leading-tight mt-6 mb-5 max-w-[520px]">
            Authentic medicine, fast delivery.
            <span className="text-white/80"> Right to your doorstep.</span>
          </h1>

          <p className="text-white/75 text-sm leading-relaxed max-w-[520px]">
            Sign in to track orders, manage prescriptions, and access exclusive
            offers across all branches.
          </p>
        </div>

        <div className="relative z-10 px-7 pb-7 sm:px-10 sm:pb-10 lg:px-14 lg:pb-14 grid grid-cols-2 gap-3">
          {(
            [
              { title: "Authentic", sub: "Verified products" },
              { title: "Fast", sub: "Same-day delivery" },
              { title: "Secure", sub: "Safe checkout" },
              { title: "Support", sub: "Friendly help desk" },
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
        <div className="w-full max-w-[440px]">
          <SectionHeading
            title="Welcome back"
            description="Sign in to Medigo e-Pharmacy to manage your orders and prescriptions."
            align="left"
            className="mb-6"
          />

          <div className="mb-5 flex flex-wrap items-center gap-2 text-sm font-semibold">
            {(
              [
                { value: "user", label: "User" },
                { value: "admin", label: "Admin" },
                { value: "pharmacist", label: "Pharmacist" },
              ] as const
            ).map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setActor(option.value)}
                className={`rounded-full px-4 py-2 transition border text-sm ${
                  actor === option.value
                    ? "border-primary bg-primary text-white"
                    : "border-gray-200 bg-white text-slate-700 hover:border-primary hover:text-primary"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          <div className="bg-white border border-gray-100 rounded-xl p-6 sm:p-7 shadow-md">
            <div className="mb-4">
              <label
                htmlFor="identifier"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                {actor === "admin"
                  ? "Admin email or phone"
                  : actor === "pharmacist"
                  ? "Pharmacist email or phone"
                  : "Email or phone"}{" "}
                <span className="text-danger ml-1">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <Icons.Mail className="!w-4 !h-4" />
                </span>
                <input
                  id="identifier"
                  type="text"
                  value={identifier}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setIdentifier(e.target.value);
                    setErrors((p) => ({ ...p, identifier: "" }));
                  }}
                  onKeyDown={onKeyDown}
                  placeholder="you@example.com"
                  autoComplete="username"
                  className={`${inputClass(!!errors.identifier)} pl-10`}
                />
              </div>
              {errors.identifier && (
                <p className="text-xs text-danger mt-1 flex items-center gap-2">
                  <Icons.AlertCircle className="!w-4 !h-4" />
                  {errors.identifier}
                </p>
              )}
            </div>

            <div className="mb-2">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                Password <span className="text-danger ml-1">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <Icons.Shield className="!w-4 !h-4" />
                </span>
                <input
                  id="password"
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setPassword(e.target.value);
                    setErrors((p) => ({ ...p, password: "" }));
                  }}
                  onKeyDown={onKeyDown}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className={`${inputClass(!!errors.password)} pl-10 pr-20`}
                />
                <button
                  type="button"
                  onClick={() => setShowPass((prev) => !prev)}
                  aria-label={showPass ? "Hide password" : "Show password"}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-500 hover:text-primary px-2.5 py-1.5 rounded-xs hover:bg-primary/10 transition-colors"
                >
                  {showPass ? "Hide" : "Show"}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-danger mt-1 flex items-center gap-2">
                  <Icons.AlertCircle className="!w-4 !h-4" />
                  {errors.password}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between gap-3 mt-5">
              <Link
                to="/forgot-password"
                className="text-xs text-slate-500 hover:text-primary"
              >
                Forgot password?
              </Link>
              <Link to="/" className="text-xs text-slate-500 hover:text-primary">
                Back to home
              </Link>
            </div>

            <div className="mt-6">
              <CustomButton
                variant="primary"
                size="md"
                radius="xs"
                fullWidth
                loading={loading}
                disabled={loading}
                onClick={() => void handleSubmit()}
                rightIcon={<Icons.ArrowForward className="!w-4 !h-4" />}
              >
                Sign in
              </CustomButton>
            </div>
          </div>

          <p className="text-center text-sm text-slate-600 mt-5">
            Don&apos;t have an account?{" "}
            <button
              type="button"
              onClick={() => navigate("/register")}
              className="text-primary font-semibold hover:underline text-base sm:text-lg px-2 py-2 block mx-auto w-full max-w-xs rounded transition"
            >
              Create account
            </button>
          </p>
        </div>
      </div>
      </div>
    </div>
  );
}
