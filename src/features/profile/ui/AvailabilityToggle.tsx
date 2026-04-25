import { profileStyles as s } from "../service/ProfileStyle";

interface AvailabilityToggleProps {
  isAvailable: boolean;
  onChange:    (val: boolean) => void;
  loading?:    boolean;
}

export default function AvailabilityToggle({
  isAvailable,
  onChange,
  loading = false,
}: AvailabilityToggleProps) {
  return (
    <div style={s.availRow}>
      <div>
        <div style={s.availLabel}>Available for donation</div>
        <div style={s.availSub}>
          {isAvailable
            ? "You are visible to blood requesters"
            : "You are hidden from blood requesters"}
        </div>
      </div>

      {/* toggle switch */}
      <button
        type="button"
        onClick={() => !loading && onChange(!isAvailable)}
        disabled={loading}
        aria-label="Toggle availability"
        style={{
          width:        "48px",
          height:       "26px",
          borderRadius: "13px",
          border:       "none",
          background:   isAvailable ? "#1D9E75" : "#D5D0CA",
          cursor:       loading ? "not-allowed" : "pointer",
          position:     "relative",
          transition:   "background 0.2s",
          flexShrink:   0,
          padding:      0,
        }}
      >
        <span style={{
          position:     "absolute",
          top:          "3px",
          left:         isAvailable ? "25px" : "3px",
          width:        "20px",
          height:       "20px",
          borderRadius: "50%",
          background:   "white",
          transition:   "left 0.2s",
          boxShadow:    "0 1px 4px rgba(0,0,0,0.15)",
        }}/>
      </button>
    </div>
  );
}