import { useState } from "react";
import { profileStyles as s } from "../service/ProfileStyle";

interface ProfileFieldProps {
  label:         string;
  name:          string;
  value:         string;
  onChange:      (val: string) => void;
  type?:         string;
  placeholder?:  string;
  disabled?:     boolean;
  error?:        string;
  hint?:         string;
  readOnly?:     boolean;
}

export default function ProfileField({
  label,
  name,
  value,
  onChange,
  type        = "text",
  placeholder = "",
  disabled    = false,
  error,
  hint,
  readOnly    = false,
}: ProfileFieldProps) {
  const [focused, setFocused] = useState(false);

  const inputStyle: React.CSSProperties = {
    ...s.input,
    ...(focused && !disabled && !readOnly ? s.inputFocused : {}),
    ...(disabled || readOnly ? s.inputDisabled : {}),
    ...(error ? s.inputError : {}),
  };

  return (
    <div style={{ ...s.fieldWrap }}>
      <label htmlFor={name} style={s.label}>{label}</label>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholder}
        disabled={disabled}
        readOnly={readOnly}
        style={inputStyle}
      />
      {error && <span style={s.errorText}>⚠ {error}</span>}
      {hint && !error && <span style={s.hint}>{hint}</span>}
    </div>
  );
}