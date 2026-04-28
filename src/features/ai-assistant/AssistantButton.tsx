interface AssistantButtonProps {
  isOpen: boolean;
  unreadCount: number;
  onClick: () => void;
}

const AssistantButton = ({ isOpen, unreadCount, onClick }: AssistantButtonProps) => (
  <button
    onClick={onClick}
    aria-label="Open MediBot AI Assistant"
    className="relative w-14 h-14 rounded-full bg-primary shadow-lg
      hover:bg-[#095c4c] hover:scale-105 active:scale-95
      flex items-center justify-center
      transition-all duration-200"
    style={{ boxShadow: "0 8px 32px rgba(13,124,102,0.35)" }}
  >
    {isOpen ? (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white"
        viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth={2.5} strokeLinecap="round">
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    ) : (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white"
        viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth={1.8} strokeLinecap="round">
        <path d="M12 2a4 4 0 0 1 4 4v1h1a3 3 0 0 1 3 3v5a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3v-5a3 3 0 0 1 3-3h1V6a4 4 0 0 1 4-4z"/>
        <circle cx="9" cy="13" r="1" fill="currentColor" stroke="none"/>
        <circle cx="15" cy="13" r="1" fill="currentColor" stroke="none"/>
        <path d="M9 17c1 1 5 1 6 0"/>
      </svg>
    )}

    {!isOpen && unreadCount > 0 && (
      <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500
        text-white text-[10px] font-bold flex items-center justify-center
        animate-bounce">
        {unreadCount}
      </span>
    )}

    {!isOpen && (
      <span className="absolute inset-0 rounded-full bg-primary opacity-30 animate-ping" />
    )}
  </button>
);

export default AssistantButton;
