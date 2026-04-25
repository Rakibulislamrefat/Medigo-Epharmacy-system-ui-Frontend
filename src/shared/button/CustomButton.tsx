import type { ReactNode } from "react";

type ButtonVariant =
  | "primary"
  | "secondary"
  | "accent"
  | "outline"
  | "ghost"
  | "danger"
  | "emergency";

type ButtonSize = "xs" | "sm" | "md" | "lg";
type ButtonRadius = "xs" | "sm" | "md" | "lg" | "xl" | "none" | "full";

interface ButtonProps {
  children: ReactNode;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;

  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  type?: "button" | "submit" | "reset";

  disabled?: boolean;
  loading?: boolean;

  variant?: ButtonVariant;
  size?: ButtonSize;
  radius?: ButtonRadius;

  fullWidth?: boolean;
  className?: string;
}

/* ─── Variants ───────────────────────── */
const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-white hover:bg-[#095c4c]",

  secondary:
    "bg-transparent text-dark hover:bg-[#e6f7f4]",

  accent:
    "bg-secondary text-white hover:bg-[#c7810a]",

  outline:
    "border border-primary text-primary hover:bg-primary hover:text-white",

  ghost:
    "bg-transparent text-dark border border-dark hover:bg-[#e6f7f4] hover:border-primary",

  danger:
    "bg-[#fdeef1] text-[#e63b5c] hover:bg-[#e63b5c] hover:text-white",

  emergency:
    "bg-red-700 text-white animate-pulse hover:bg-red-800",
};

/* ─── Sizes ───────────────────────── */
const sizeStyles: Record<ButtonSize, string> = {
  xs: "text-xs px-3 py-1.5",
  sm: "text-sm px-4 py-2",
  md: "text-sm px-6 py-2.5",
  lg: "text-base px-8 py-3",
};

/* ─── Radius ───────────────────────── */
const radiusStyles: Record<ButtonRadius, string> = {
  none: "rounded-none",
  xs: "rounded-xs",
  sm: "rounded-sm",
  md: "rounded-md",
  lg: "rounded-lg",
  xl: "rounded-xl",
  full: "rounded-full",
};

/* ─── Spinner ───────────────────────── */
const Spinner = () => (
  <svg
    className="animate-spin w-4 h-4"
    viewBox="0 0 24 24"
    fill="none"
  >
    <circle
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
      className="opacity-25"
    />
    <path
      fill="currentColor"
      className="opacity-75"
      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
    />
  </svg>
);

/* ─── Button Component ───────────────────────── */
const CustomButton = ({
  children,
  leftIcon,
  rightIcon,
  onClick,
  type = "button",

  disabled = false,
  loading = false,

  variant = "primary",
  size = "md",
  radius = "lg",

  fullWidth = false,
  className = "",
}: ButtonProps) => {
  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      className={[
        "inline-flex items-center justify-center gap-2",
        "font-semibold transition-all duration-300",
        "active:scale-95 focus:outline-none",

        variantStyles[variant],
        sizeStyles[size],
        radiusStyles[radius],

        fullWidth ? "w-full" : "",

        isDisabled
          ? "opacity-50 cursor-not-allowed pointer-events-none"
          : "cursor-pointer",

        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {loading ? (
        <Spinner />
      ) : leftIcon ? (
        <span>{leftIcon}</span>
      ) : null}

      <span>{children}</span>

      {!loading && rightIcon && <span>{rightIcon}</span>}
    </button>
  );
};

export default CustomButton;