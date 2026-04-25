import { profileStyles as s } from "../service/ProfileStyle";

const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];

interface BloodTypeSelectorProps {
  value:    string;
  onChange: (val: string) => void;
  error?:   string;
}

export default function BloodTypeSelector({ value, onChange, error }: BloodTypeSelectorProps) {
  return (
    <div style={{ marginBottom: "16px" }}>
      <label style={s.label}>Blood type</label>
      <div style={{ ...s.bloodGrid, marginTop: "6px" }}>
        {BLOOD_TYPES.map((bt) => (
          <button
            key={bt}
            type="button"
            onClick={() => onChange(bt)}
            style={{
              ...s.bloodBtn,
              background:  value === bt ? "#C0392B" : "#F7F5F2",
              color:       value === bt ? "white"   : "#666",
              borderColor: value === bt ? "#C0392B" : "#E8E2DA",
            }}
          >
            {bt}
          </button>
        ))}
      </div>
      {error && <span style={s.errorText}>⚠ {error}</span>}
    </div>
  );
}