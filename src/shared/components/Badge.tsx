interface BadgeProps {
  label: string;
  variant?: "primary" | "secondary" | "danger" | "success";
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
}

const variantStyles: Record<string, string> = {
  primary:   "bg-primary text-secondary",
  secondary: "bg-secondary text-white",
  danger:    "bg-red-500 text-white",
  success:   "bg-green-500 text-white",
};

const positionStyles: Record<string, string> = {
  "top-left":     "top-4 left-4",
  "top-right":    "top-4 right-4",
  "bottom-left":  "bottom-4 left-4",
  "bottom-right": "bottom-4 right-4",
};

const Badge = ({
  label,
  variant = "primary",
  position = "top-right",
}: BadgeProps) => {
  return (
    <div
      className={`absolute ${positionStyles[position]} ${variantStyles[variant]}
        font-bold px-3 py-1.5 rounded-xl text-xs tracking-wide shadow-md z-10`}
    >
      {label}
    </div>
  );
};

export default Badge;