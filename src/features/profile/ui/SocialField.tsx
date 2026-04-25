import { profileStyles as s } from "../service/ProfileStyle";

interface SocialFieldProps {
  platform:    string;
  prefix:      string;
  value:       string;
  onChange:    (val: string) => void;
  placeholder: string;
}

export default function SocialField({
  platform,
  prefix,
  value,
  onChange,
  placeholder,
}: SocialFieldProps) {
  return (
    <div style={{ marginBottom: "14px" }}>
      <label style={{ ...s.label, display: "block", marginBottom: "6px" }}>
        {platform}
      </label>
      <div style={s.socialField}>
        <span style={s.socialPrefix}>{prefix}</span>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          style={s.socialInput}
        />
      </div>
    </div>
  );
}