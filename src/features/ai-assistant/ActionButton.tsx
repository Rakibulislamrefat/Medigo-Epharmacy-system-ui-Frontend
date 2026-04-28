interface ActionButtonProps {
  label: string;
  onClick: () => void;
}

const ActionButton = ({ label, onClick }: ActionButtonProps) => (
  <button
    onClick={onClick}
    className="mt-2.5 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg
      bg-primary text-white text-xs font-semibold
      hover:bg-[#095c4c] active:scale-95
      transition-all duration-200"
  >
    {label}
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="w-3 h-3"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
    >
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  </button>
);

export default ActionButton;