// src/shared/form/Form.tsx
import React from "react";
import CustomButton from "../button/CustomButton";
import { Icons } from "../icons/Icons";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { cn } from "../../lib/utils";

export type FieldType =
  | "text"
  | "email"
  | "password"
  | "tel"
  | "number"
  | "select"
  | "textarea"
  | "checkbox"
  | "date";

export interface FieldOption {
  value: string;
  label: string;
  id?: string;
}

export interface Field {
  name: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  options?: FieldOption[];
  required?: boolean;
  pattern?: string;
  min?: number;
  max?: number;
  rows?: number;
  colSpan?: "full" | "half";
  disabled?: boolean;
  helperText?: string;
  icon?: React.ElementType;
  className?: string;
  minDate?: Date;
  maxDate?: Date;
}

export interface FormProps<TValues extends object = Record<string, unknown>> {
  fields: Field[];
  values: TValues;
  onChange: (name: string, value: unknown) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  errors?: Record<string, string>;
  fieldActions?: Record<string, React.ReactNode>;
  submitText?: string | React.ReactNode;
  loading?: boolean;
  disabled?: boolean;
  layout?: "single" | "double" | "triple";
  className?: string;
  footer?: React.ReactNode;
  showSubmitButton?: boolean;
}

const Form = <TValues extends object>({
  fields,
  values,
  onChange,
  onSubmit,
  errors = {},
  fieldActions = {},
  submitText = "Submit",
  loading = false,
  disabled = false,
  layout = "single",
  className = "",
  footer,
  showSubmitButton = true,
}: FormProps<TValues>) => {
  const hasCheckbox = fields.some((f) => f.type === "checkbox");
  const valuesRecord = values as Record<string, unknown>;

  const getGridCols = () => {
    if (hasCheckbox) return "grid-cols-1";
    switch (layout) {
      case "double":
        return "grid-cols-1 md:grid-cols-2";
      case "triple":
        return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";
      default:
        return "grid-cols-1";
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, type, value } = e.target;
    let newValue: unknown = value;
    if (type === "checkbox") {
      newValue = (e.target as HTMLInputElement).checked;
    } else if (type === "number") {
      newValue = value === "" ? "" : Number(value);
    }
    onChange(name, newValue);
  };

  const handleDateChange = (name: string, date: Date | null) => {
    onChange(name, date ? date.toISOString().split("T")[0] : "");
  };

  const renderField = (field: Field) => {
    const error = errors[field.name];
    const rawValue = valuesRecord[field.name];
    const Icon = field.icon;
    const action = fieldActions[field.name];

    // ── Base input styles ──────────────────────────────
    const baseInputClass = cn(
      "w-full bg-white border border-gray-200 rounded-xs px-4 py-2.5",
      "text-sm text-dark placeholder-gray-400",
      "transition-all duration-200 outline-none",
      "focus:border-primary focus:ring-2 focus:ring-primary/20",
      "disabled:opacity-50 disabled:cursor-not-allowed",
      Icon && "pl-10", // space for left icon
      action && "pr-10", // space for right action
      error && "border-primary/60 ring-1 ring-primary/20 bg-red-50/30",
      field.className,
    );

    // ── Icon + action wrapper ──────────────────────────
    const renderWithIconAndAction = (element: React.ReactNode) => (
      <div className="relative">
        {/* 
          FIX: Use !w-4 !h-4 to override the createIcon default w-5 h-5 md:w-6 md:h-6.
          Without !, Tailwind picks whichever class appears later in the stylesheet,
          which is the default size — making icons too large inside inputs.
        */}
        {Icon && (
          <Icon className="absolute left-3 top-1/2 -translate-y-1/2 !w-4 !h-4 text-gray-400 z-10 pointer-events-none" />
        )}
        {element}
        {action && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2 z-10">
            {action}
          </div>
        )}
      </div>
    );

    // ── Field renders ──────────────────────────────────
    switch (field.type) {
      case "select":
        return renderWithIconAndAction(
          <select
            id={field.name}
            name={field.name}
            value={
              typeof rawValue === "string" || typeof rawValue === "number"
                ? String(rawValue)
                : ""
            }
            onChange={handleChange}
            disabled={field.disabled || disabled}
            required={field.required}
            className={cn(baseInputClass, "appearance-none cursor-pointer")}
          >
            <option value="">Select {field.label}</option>
            {field.options?.map((opt) => (
              <option key={opt.id || opt.value} value={opt.id || opt.value}>
                {opt.label}
              </option>
            ))}
          </select>,
        );

      case "textarea":
        return renderWithIconAndAction(
          <textarea
            id={field.name}
            name={field.name}
            value={typeof rawValue === "string" ? rawValue : ""}
            onChange={handleChange}
            disabled={field.disabled || disabled}
            required={field.required}
            rows={field.rows || 4}
            placeholder={field.placeholder}
            className={cn(
              baseInputClass,
              "resize-y min-h-[100px]",
              // textarea icon sits at top, not vertically centered
              Icon && "pt-2.5",
            )}
          />,
        );

      case "checkbox":
        return (
          <div className="flex items-start gap-2.5 pt-1">
            <input
              type="checkbox"
              id={field.name}
              name={field.name}
              checked={!!rawValue}
              onChange={handleChange}
              disabled={field.disabled || disabled}
              className="w-4 h-4 mt-0.5 rounded-xs border-gray-300 accent-primary
                focus:ring-primary transition-colors cursor-pointer shrink-0"
            />
            <label
              htmlFor={field.name}
              className="text-sm text-dark/70 cursor-pointer hover:text-primary
                transition-colors select-none leading-snug"
            >
              {field.label}
              {field.required && <span className="text-primary ml-1">*</span>}
            </label>
          </div>
        );

      case "date":
        return renderWithIconAndAction(
          <DatePicker
            selected={
              typeof rawValue === "string" && rawValue ? new Date(rawValue) : null
            }
            onChange={(date: Date | null) => handleDateChange(field.name, date)}
            dateFormat="dd/MM/yyyy"
            placeholderText={field.placeholder || "Select date"}
            className={cn(baseInputClass, "cursor-pointer")}
            minDate={field.minDate}
            maxDate={field.maxDate}
            isClearable
            showYearDropdown
            scrollableYearDropdown
            yearDropdownItemNumber={15}
            wrapperClassName="w-full"
            disabled={field.disabled || disabled}
          />,
        );

      case "number":
        return renderWithIconAndAction(
          <input
            type="number"
            id={field.name}
            name={field.name}
            value={
              typeof rawValue === "number" || typeof rawValue === "string"
                ? rawValue
                : ""
            }
            onChange={handleChange}
            disabled={field.disabled || disabled}
            required={field.required}
            min={field.min}
            max={field.max}
            placeholder={field.placeholder}
            className={baseInputClass}
          />,
        );

      default: // text, email, password, tel
        return renderWithIconAndAction(
          <input
            type={field.type}
            id={field.name}
            name={field.name}
            value={
              typeof rawValue === "string" || typeof rawValue === "number"
                ? rawValue
                : ""
            }
            onChange={handleChange}
            disabled={field.disabled || disabled}
            required={field.required}
            pattern={field.pattern}
            placeholder={field.placeholder}
            className={baseInputClass}
          />,
        );
    }
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault(); // ✅ ALWAYS stop reload first
        onSubmit(e); // then run your logic
      }}
      className={className}
      noValidate
    >
      <div className={cn("grid gap-4 md:gap-5", getGridCols())}>
        {fields.map((field) => (
          <div
            key={field.name}
            className={cn(
              field.type === "checkbox" ? "space-y-0" : "space-y-1.5",
              field.colSpan === "full" && "md:col-span-2",
              field.colSpan === "half" &&
                layout === "double" &&
                "md:col-span-1",
              field.colSpan === "half" &&
                layout === "triple" &&
                "md:col-span-1",
            )}
          >
            {/* Label — not shown for checkbox (label is inline) */}
            {field.type !== "checkbox" && (
              <label
                htmlFor={field.name}
                className="block text-sm font-medium text-dark"
              >
                {field.label}
                {field.required && (
                  <span className="text-primary ml-1" aria-hidden>
                    *
                  </span>
                )}
              </label>
            )}

            {/* Field */}
            {renderField(field)}

            {/* Error message */}
            {errors[field.name] && (
              <p
                className="text-xs text-primary flex items-center gap-1 mt-1"
                role="alert"
              >
                <Icons.AlertCircle className="!w-3 !h-3 shrink-0" />
                {errors[field.name]}
              </p>
            )}

            {/* Helper text (only when no error) */}
            {field.helperText && !errors[field.name] && (
              <p className="text-xs text-dark/50 mt-1">{field.helperText}</p>
            )}
          </div>
        ))}
      </div>

      {/* Submit button */}
      {showSubmitButton && (
        <div className="mt-6 md:mt-8">
          <CustomButton
            type="submit"
            variant="primary"
            size="lg"
            radius="xs"
            fullWidth
            loading={loading}
            disabled={disabled || loading}
          >
            {typeof submitText === "string" ? submitText : submitText}
          </CustomButton>
        </div>
      )}

      {footer && <div className="mt-4">{footer}</div>}
    </form>
  );
};

export default Form;
