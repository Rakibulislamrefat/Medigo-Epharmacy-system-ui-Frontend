import type { RegisterFormData } from "../service/register.type";
import { NavBtns } from "./NextBtn";
import { Icons } from "../../../shared/icons/Icons";

export function StepSocials({
  form,
  errors,
  loading,
  setSocial,
  setFieldRef,
  handleInputKeyDown,
  onSubmit,
  onBack,
}: {
  form: RegisterFormData;
  errors: Record<string, string>;
  loading: boolean;
  setSocial: <K extends keyof RegisterFormData["socialLinks"]>(field: K, value: RegisterFormData["socialLinks"][K]) => void;
  setFieldRef: (key: string) => (el: HTMLInputElement | null) => void;
  handleInputKeyDown: (event: React.KeyboardEvent<HTMLInputElement>, currentKey: string) => void;
  onSubmit: () => void;
  onBack: () => void;
}) {
  return (
    <div className="animate-in fade-in duration-200">
      <div className="text-xxs font-black tracking-[0.2em] uppercase text-primary mb-5">
        Social links <span className="text-slate-400 font-semibold tracking-normal normal-case">(optional)</span>
      </div>

      {(
        [
          { key: "facebook", prefix: "facebook.com/", placeholder: "yourprofile" },
          { key: "instagram", prefix: "instagram.com/", placeholder: "yourhandle" },
          { key: "twitter", prefix: "x.com/", placeholder: "yourhandle" },
        ] as const
      ).map(({ key, prefix, placeholder }) => (
        <div key={key} className="mb-4">
          <label className="text-sm font-medium text-slate-700">
            {key.charAt(0).toUpperCase() + key.slice(1)}
          </label>
          <div className="mt-1.5 flex items-center rounded-sm border border-gray-300 overflow-hidden bg-white">
            <span className="px-3 h-10 center-flex text-xs text-slate-500 border-r border-gray-300 bg-gray-50 shrink-0 whitespace-nowrap">
              {prefix}
            </span>
            <input
              ref={setFieldRef(key)}
              name={key}
              className="border-0 outline-none bg-transparent flex-1 h-10 px-3 text-sm text-dark placeholder:text-slate-400"
              value={form.socialLinks[key]}
              onChange={(e) => setSocial(key, e.target.value)}
              onKeyDown={(e) => handleInputKeyDown(e, key)}
              placeholder={placeholder}
            />
          </div>
        </div>
      ))}

      <div className="rounded-xs border border-secondary/20 bg-secondary/10 px-4 py-3 flex items-start gap-3">
        <Icons.Shield className="!w-4 !h-4 text-secondary mt-0.5 shrink-0" />
        <p className="text-sm text-dark/80 leading-relaxed">
          Your information is protected. Medigo uses your details only to manage
          your account and deliveries securely.
        </p>
      </div>

      {errors.submit && (
        <p className="text-sm text-danger mt-4 flex items-start gap-2">
          <Icons.AlertCircle className="!w-4 !h-4 mt-0.5" />
          <span>{errors.submit}</span>
        </p>
      )}

      <NavBtns
        onNext={onSubmit}
        onBack={onBack}
        nextLabel={loading ? "Creating account..." : "Create account"}
        disabled={loading}
      />
    </div>
  );
}
