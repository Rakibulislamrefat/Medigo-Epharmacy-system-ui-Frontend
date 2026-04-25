import { useEffect, useMemo, useState } from "react";
import type { RegisterFormData } from "../service/register.type";
import { Field } from "./Field";
import { NavBtns } from "./NextBtn";
import { Icons } from "../../../shared/icons/Icons";

const inputClass = (hasError: boolean) =>
  [
    "w-full rounded-sm border px-3.5 py-2.5 text-sm outline-none transition",
    "bg-gray-50 text-gray-900 border-gray-300",
    "focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20",
    hasError ? "border-danger bg-danger/5 focus:ring-danger/20" : "",
  ]
    .filter(Boolean)
    .join(" ");

export function StepAccount({
  form,
  errors,
  strength,
  set,
  setFieldRef,
  handleInputKeyDown,
  onNext,
}: {
  form: RegisterFormData;
  errors: Record<string, string>;
  strength: { score: number; color: string; label: string };
  set: <K extends keyof RegisterFormData>(field: K, value: RegisterFormData[K]) => void;
  setFieldRef: (key: string) => (el: HTMLInputElement | null) => void;
  handleInputKeyDown: (event: React.KeyboardEvent<HTMLInputElement>, currentKey: string) => void;
  onNext: () => void;
}) {
  const [showPass, setShowPass] = useState(false);

  const avatarPreview = useMemo(() => {
    if (!form.avatar) return null;
    return URL.createObjectURL(form.avatar);
  }, [form.avatar]);

  useEffect(() => {
    return () => {
      if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    };
  }, [avatarPreview]);

  return (
    <div className="animate-in fade-in duration-200">
      <div className="text-xxs font-black tracking-[0.2em] uppercase text-primary mb-5">
        Account details
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Full name" error={errors.name}>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              <Icons.User className="!w-4 !h-4" />
            </span>
            <input
              ref={setFieldRef("name")}
              name="name"
              className={`${inputClass(!!errors.name)} pl-10`}
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              onKeyDown={(e) => handleInputKeyDown(e, "name")}
              placeholder="Your full name"
            />
          </div>
        </Field>
        <Field label="Phone number" error={errors.phone}>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              <Icons.Phone className="!w-4 !h-4" />
            </span>
            <input
              ref={setFieldRef("phone")}
              name="phone"
              className={`${inputClass(!!errors.phone)} pl-10`}
              value={form.phone}
              onChange={(e) => set("phone", e.target.value)}
              onKeyDown={(e) => handleInputKeyDown(e, "phone")}
              placeholder="+8801XXXXXXXXX"
              autoComplete="tel"
            />
          </div>
        </Field>
      </div>

      <Field label="Email address" error={errors.email}>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            <Icons.Mail className="!w-4 !h-4" />
          </span>
          <input
            ref={setFieldRef("email")}
            name="email"
            className={`${inputClass(!!errors.email)} pl-10`}
            type="email"
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
            onKeyDown={(e) => handleInputKeyDown(e, "email")}
            placeholder="you@example.com"
            autoComplete="email"
          />
        </div>
      </Field>

      <Field label="Avatar (optional)" error={errors.avatar}>
        <div className="rounded-sm border border-gray-300 bg-gray-50 p-4 flex flex-col sm:flex-row gap-4">
          <div className="w-20 h-20 rounded-sm overflow-hidden border border-gray-300 bg-white shrink-0">
            {avatarPreview ? (
              <img
                src={avatarPreview}
                alt="Avatar preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full center-flex text-slate-400">
                <Icons.User className="!w-7 !h-7" />
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-sm font-black text-dark">Profile photo</p>
            <p className="text-xs text-slate-500 mt-0.5">
              PNG or JPG, up to 2MB
            </p>

            <label className="mt-3 inline-flex items-center gap-2 rounded-xs border border-primary/20 bg-primary/10 px-3 py-2 text-xs font-bold text-primary hover:bg-primary/15 transition cursor-pointer w-fit">
              <Icons.Plus className="!w-4 !h-4" />
              Choose photo
              <input
                ref={setFieldRef("avatar")}
                name="avatar"
                className="hidden"
                type="file"
                accept="image/*"
                onChange={(e) => set("avatar", e.target.files?.[0] ?? null)}
                onKeyDown={(e) => handleInputKeyDown(e, "avatar")}
              />
            </label>

            {form.avatar?.name && (
              <p className="mt-2 text-xs text-slate-600 break-all">
                {form.avatar.name}
              </p>
            )}
          </div>
        </div>
      </Field>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Password" error={errors.password}>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              <Icons.Shield className="!w-4 !h-4" />
            </span>
            <input
              ref={setFieldRef("password")}
              name="password"
              className={`${inputClass(!!errors.password)} pl-10 pr-20`}
              type={showPass ? "text" : "password"}
              value={form.password}
              onChange={(e) => set("password", e.target.value)}
              onKeyDown={(e) => handleInputKeyDown(e, "password")}
              placeholder="Min 8 characters"
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowPass((p) => !p)}
              aria-label={showPass ? "Hide password" : "Show password"}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-500 hover:text-primary px-2.5 py-1.5 rounded-xs hover:bg-primary/10 transition-colors"
            >
              {showPass ? "Hide" : "Show"}
            </button>
          </div>
          {form.password && (
            <>
              <div className="flex gap-1 mt-2">
                {[1, 2, 3, 4].map((i) => {
                  const active = i <= strength.score;
                  return (
                  <div
                    key={i}
                    className={`flex-1 h-1 rounded-full transition-colors ${
                      active ? "bg-primary" : "bg-gray-200"
                    }`}
                  />
                  );
                })}
              </div>
              <div className="text-xs text-primary mt-1 font-semibold">
                {strength.label}
              </div>
            </>
          )}
        </Field>
        <Field label="Confirm password" error={errors.confirmPassword}>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              <Icons.Shield className="!w-4 !h-4" />
            </span>
            <input
              ref={setFieldRef("confirmPassword")}
              name="confirmPassword"
              className={`${inputClass(!!errors.confirmPassword)} pl-10`}
              type={showPass ? "text" : "password"}
              value={form.confirmPassword}
              onChange={(e) => set("confirmPassword", e.target.value)}
              onKeyDown={(e) => handleInputKeyDown(e, "confirmPassword")}
              placeholder="Re-enter password"
              autoComplete="new-password"
            />
          </div>
        </Field>
      </div>

      <NavBtns onNext={onNext} showBack={false} />
    </div>
  );
}
