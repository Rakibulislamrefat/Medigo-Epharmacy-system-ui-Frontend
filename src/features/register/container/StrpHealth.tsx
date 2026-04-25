import type { RegisterFormData } from "../service/register.type";
import { Field } from "./Field";
import { NavBtns } from "./NextBtn";

const inputClass = (hasError: boolean) =>
  [
    "w-full rounded-sm border px-3.5 py-2.5 text-sm outline-none transition",
    "bg-gray-50 text-gray-900 border-gray-300",
    "focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20",
    hasError ? "border-danger bg-danger/5 focus:ring-danger/20" : "",
  ]
    .filter(Boolean)
    .join(" ");

const selectBtnClass = (active: boolean) =>
  [
    "h-10 rounded-sm border text-sm font-semibold transition-all active:scale-[0.99]",
    active
      ? "bg-primary text-white border-primary shadow-md shadow-primary/10"
      : "bg-gray-50 text-slate-700 border-gray-300 hover:bg-white hover:border-primary/30",
  ].join(" ");

const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-", "Not sure"];

export function StepHealth({
  form,
  errors,
  set,
  setFieldRef,
  handleInputKeyDown,
  focusField,
  onNext,
  onBack,
}: {
  form: RegisterFormData;
  errors: Record<string, string>;
  set: <K extends keyof RegisterFormData>(field: K, value: RegisterFormData[K]) => void;
  setFieldRef: (key: string) => (el: HTMLInputElement | null) => void;
  handleInputKeyDown: (event: React.KeyboardEvent<HTMLInputElement>, currentKey: string) => void;
  focusField: (key: string) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  return (
    <div className="animate-in fade-in duration-200">
      <div className="text-xxs font-black tracking-[0.2em] uppercase text-primary mb-5">
        Health preferences
      </div>

      <Field label="Blood group" error={errors.bloodType} hint="For medication safety and prescriptions">
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {BLOOD_TYPES.map((bt) => (
            <button
              type="button"
              key={bt}
              onClick={() => set("bloodType", bt)}
              className={`${selectBtnClass(form.bloodType === bt)} ${bt === "Not sure" ? "col-span-3 sm:col-span-2" : ""}`}
            >
              {bt}
            </button>
          ))}
        </div>
      </Field>

      <Field label="Gender" error={errors.gender}>
        <div className="grid grid-cols-2 gap-2">
          {["male", "female", "other"].map((g) => (
            <button
              type="button"
              key={g}
              onClick={() => {
                set("gender", g);
                focusField("age");
              }}
              className={`${selectBtnClass(form.gender === g)} capitalize ${g === "other" ? "col-span-2" : ""}`}
            >
              {g}
            </button>
          ))}
        </div>
      </Field>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Field label="Age" error={errors.age} hint="18–65 years">
          <input
            ref={setFieldRef("age")}
            name="age"
            className={inputClass(!!errors.age)}
            type="number"
            value={form.age}
            onChange={(e) => set("age", e.target.value)}
            onKeyDown={(e) => handleInputKeyDown(e, "age")}
            placeholder="25"
            min={18}
            max={65}
          />
        </Field>
        <Field label="Weight (kg)" error={errors.weight} hint="Min 50 kg">
          <input
            ref={setFieldRef("weight")}
            name="weight"
            className={inputClass(!!errors.weight)}
            type="number"
            value={form.weight}
            onChange={(e) => set("weight", e.target.value)}
            onKeyDown={(e) => handleInputKeyDown(e, "weight")}
            placeholder="65"
            min={50}
          />
        </Field>
        <Field label="Date of birth">
          <input
            ref={setFieldRef("dateOfBirth")}
            name="dateOfBirth"
            className={inputClass(false)}
            type="date"
            value={form.dateOfBirth}
            onChange={(e) => set("dateOfBirth", e.target.value)}
            onKeyDown={(e) => handleInputKeyDown(e, "dateOfBirth")}
          />
        </Field>
      </div>

      <NavBtns onNext={onNext} onBack={onBack} />
    </div>
  );
}
