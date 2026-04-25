import type { RegisterFormData } from "../service/register.type";
import { Field } from "./Field";
import { NavBtns } from "./NextBtn";
import CustomButton from "../../../shared/button/CustomButton";
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

export function StepLocation({
  form,
  errors,
  detectingLocation,
  setLocation,
  setCoordinate,
  setFieldRef,
  handleInputKeyDown,
  onDetectLocation,
  onNext,
  onBack,
}: {
  form: RegisterFormData;
  errors: Record<string, string>;
  detectingLocation: boolean;
  setLocation: <K extends keyof RegisterFormData["location"]>(field: K, value: RegisterFormData["location"][K]) => void;
  setCoordinate: (axis: "lat" | "lng", value: string) => void;
  setFieldRef: (key: string) => (el: HTMLInputElement | null) => void;
  handleInputKeyDown: (event: React.KeyboardEvent<HTMLInputElement>, currentKey: string) => void;
  onDetectLocation: () => void;
  onNext: () => void;
  onBack: () => void;
}) {
  return (
    <div className="animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
        <div className="text-xxs font-black tracking-[0.2em] uppercase text-primary">
          Delivery address
        </div>
        <CustomButton
          variant="outline"
          size="sm"
          radius="xs"
          loading={detectingLocation}
          disabled={detectingLocation}
          onClick={onDetectLocation}
          leftIcon={<Icons.LocationPin className="!w-4 !h-4" />}
        >
          Detect my location
        </CustomButton>
      </div>

      {errors.location && (
        <p className="text-xs text-danger mb-3 flex items-center gap-2">
          <Icons.AlertCircle className="!w-4 !h-4" />
          {errors.location}
        </p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="City / Town" error={errors.city}>
          <input
            ref={setFieldRef("city")}
            name="city"
            className={inputClass(!!errors.city)}
            value={form.location.city}
            onChange={(e) => setLocation("city", e.target.value)}
            onKeyDown={(e) => handleInputKeyDown(e, "city")}
            placeholder="Dhaka"
            autoComplete="address-level2"
          />
        </Field>
        <Field label="State / Division">
          <input
            ref={setFieldRef("state")}
            name="state"
            className={inputClass(false)}
            value={form.location.state}
            onChange={(e) => setLocation("state", e.target.value)}
            onKeyDown={(e) => handleInputKeyDown(e, "state")}
            placeholder="Dhaka Division"
            autoComplete="address-level1"
          />
        </Field>
        <Field label="District">
          <input
            ref={setFieldRef("state_district")}
            name="state_district"
            className={inputClass(false)}
            value={form.location.state_district}
            onChange={(e) => setLocation("state_district", e.target.value)}
            onKeyDown={(e) => handleInputKeyDown(e, "state_district")}
            placeholder="Dhaka District"
          />
        </Field>
        <Field label="County">
          <input
            ref={setFieldRef("county")}
            name="county"
            className={inputClass(false)}
            value={form.location.county}
            onChange={(e) => setLocation("county", e.target.value)}
            onKeyDown={(e) => handleInputKeyDown(e, "county")}
            placeholder="County"
          />
        </Field>
        <Field label="Country" error={errors.country}>
          <input
            ref={setFieldRef("country")}
            name="country"
            className={inputClass(!!errors.country)}
            value={form.location.country}
            onChange={(e) => setLocation("country", e.target.value)}
            onKeyDown={(e) => handleInputKeyDown(e, "country")}
            placeholder="Bangladesh"
            autoComplete="country-name"
          />
        </Field>
        <Field label="Postcode">
          <input
            ref={setFieldRef("postcode")}
            name="postcode"
            className={inputClass(false)}
            value={form.location.postcode}
            onChange={(e) => setLocation("postcode", e.target.value)}
            onKeyDown={(e) => handleInputKeyDown(e, "postcode")}
            placeholder="1207"
            autoComplete="postal-code"
          />
        </Field>
        <Field label="Latitude">
          <input
            ref={setFieldRef("lat")}
            name="lat"
            className={inputClass(false)}
            type="number"
            step="any"
            value={form.location.coordinates.lat ?? ""}
            onChange={(e) => setCoordinate("lat", e.target.value)}
            onKeyDown={(e) => handleInputKeyDown(e, "lat")}
            placeholder="23.8103"
          />
        </Field>
        <Field label="Longitude">
          <input
            ref={setFieldRef("lng")}
            name="lng"
            className={inputClass(false)}
            type="number"
            step="any"
            value={form.location.coordinates.lng ?? ""}
            onChange={(e) => setCoordinate("lng", e.target.value)}
            onKeyDown={(e) => handleInputKeyDown(e, "lng")}
            placeholder="90.4125"
          />
        </Field>
      </div>

      <NavBtns onNext={onNext} onBack={onBack} />
    </div>
  );
}
