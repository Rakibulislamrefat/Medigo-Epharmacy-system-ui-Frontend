import { useState, useEffect, useRef } from "react";
import AssistantButton from "./AssistantButton";
import ChatWindow from "./ChatWindow";
import { useAssistant } from "./useAssistant";

interface AIAssistantProps {
  /** Optional: call this to open the cart drawer from your app */
  openCart?: () => void;
}

const AIAssistant = ({ openCart }: AIAssistantProps) => {
  const [isOpen, setIsOpen]           = useState(false);
  const [unreadCount, setUnreadCount] = useState(1); // start at 1 to grab attention
  const prevMessageCount              = useRef(1);

  const { messages, isTyping, error, sendMessage, clearMessages } = useAssistant();

  // Track new assistant messages when window is closed → increment badge
  useEffect(() => {
    const newCount = messages.length;
    if (!isOpen && newCount > prevMessageCount.current) {
      setUnreadCount((n) => n + 1);
    }
    prevMessageCount.current = newCount;
  }, [messages, isOpen]);

  const handleOpen = () => {
    setIsOpen(true);
    setUnreadCount(0);
  };

  const handleClose = () => setIsOpen(false);

  const handleClear = () => {
    clearMessages();
  };

  return (
    /* Fixed floating container — bottom right */
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end gap-3">

      {/* Chat window — animate in/out */}
      <div
        className={`transition-all duration-300 origin-bottom-right
          ${isOpen
            ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
            : "opacity-0 scale-95 translate-y-4 pointer-events-none"
          }`}
      >
        <ChatWindow
          messages={messages}
          isTyping={isTyping}
          error={error}
          onSend={sendMessage}
          onClose={handleClose}
          onClear={handleClear}
          openCart={openCart}
        />
      </div>

      {/* FAB trigger button */}
      <AssistantButton
        isOpen={isOpen}
        unreadCount={unreadCount}
        onClick={isOpen ? handleClose : handleOpen}
      />
    </div>
  );
};

export default AIAssistant;