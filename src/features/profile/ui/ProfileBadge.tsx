import { profileStyles as s } from "../service/ProfileStyle";

interface ProfileBadgeProps {
  label:   string;
  color:   "green" | "red" | "amber" | "gray";
  icon?:   string;
}

const colorMap = {
  green: { background: "#E8F8F0", color: "#0F6E56", border: "1px solid #9FE1CB" },
  red:   { background: "#FADBD8", color: "#922B21", border: "1px solid #F5A9A3" },
  amber: { background: "#FEF9F0", color: "#854F0B", border: "1px solid #FAC775" },
  gray:  { background: "#F0EDE8", color: "#666",    border: "1px solid #E8E2DA" },
};

export default function ProfileBadge({ label, color, icon }: ProfileBadgeProps) {
  return (
    <span style={{ ...s.badge, ...colorMap[color] }}>
      {icon && <span>{icon}</span>}
      {label}
    </span>
  );
}