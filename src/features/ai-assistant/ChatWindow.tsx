import { useEffect, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import type { Message } from "./useAssistant";
import MessageBubble from "./MessageBubble";
import TypingIndicator from "./TypingIndicator";
import QuickSuggestions from "./QuickSuggestions";

interface ChatWindowProps {
  messages: Message[];
  isTyping: boolean;
  error: string | null;
  onSend: (text: string) => void;
  onClose: () => void;
  onClear: () => void;
  openCart?: () => void;
}

const ChatWindow = ({
  messages,
  isTyping,
  error,
  onSend,
  onClose,
  onClear,
  openCart,
}: ChatWindowProps) => {
  const [input, setInput]               = useState("");
  const [showSuggestions, setShowSuggestions] = useState(true);
  const bottomRef                       = useRef<HTMLDivElement>(null);
  const inputRef                        = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Focus input when window opens
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || isTyping) return;
    setShowSuggestions(false);
    setInput("");
    onSend(trimmed);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSend();
  };

  const handleQuickSelect = (text: string) => {
    setShowSuggestions(false);
    onSend(text);
  };

  return (
    <div
      className="flex flex-col bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden
        w-[calc(100vw-32px)] sm:w-[380px] h-[520px] sm:h-[560px]"
      style={{ boxShadow: "0 24px 64px rgba(13,124,102,0.18)" }}
    >
      {/* ── Header ── */}
      <div className="bg-[#0f2e29] px-4 py-3.5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="relative">
            <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center">
              <span className="text-white font-black text-sm">M</span>
            </div>
            {/* Online dot */}
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-green-400 border-2 border-[#0f2e29]" />
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-tight">MediBot</p>
            <p className="text-white/50 text-[10px]">Medigo AI Assistant</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Clear button */}
          <button
            onClick={onClear}
            title="Clear chat"
            className="w-7 h-7 rounded-lg flex items-center justify-center
              text-white/50 hover:text-white hover:bg-white/10 transition-all"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
              <polyline points="1 4 1 10 7 10" />
              <path d="M3.51 15a9 9 0 1 0 .49-4.95" />
            </svg>
          </button>
          {/* Close button */}
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center
              text-white/50 hover:text-white hover:bg-white/10 transition-all"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      </div>

      {/* ── Messages ── */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scroll-smooth">
        {messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            message={msg}
            onAction={onClose}
            openCart={openCart}
          />
        ))}

        {isTyping && (
          <div className="flex items-start gap-2.5">
            <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center shrink-0">
              <span className="text-white font-black text-xs">M</span>
            </div>
            <TypingIndicator />
          </div>
        )}

        {/* Error strip */}
        {error && (
          <p className="text-center text-[11px] text-red-400 bg-red-50 rounded-lg py-2 px-3">
            {error}
          </p>
        )}

        <div ref={bottomRef} />
      </div>

      {/* ── Quick suggestions (shown only at start) ── */}
      {showSuggestions && messages.length <= 1 && (
        <QuickSuggestions onSelect={handleQuickSelect} />
      )}

      {/* ── Input area ── */}
      <div className="px-4 pb-4 pt-2 border-t border-gray-100 shrink-0">
        <div className="flex items-center gap-2 bg-gray-50 rounded-xl border border-gray-200
          focus-within:border-primary focus-within:bg-white transition-all duration-200 px-3 py-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask MediBot..."
            disabled={isTyping}
            className="flex-1 bg-transparent text-sm text-gray-700 placeholder-gray-400
              focus:outline-none disabled:opacity-50"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="p-2 rounded-lg bg-primary text-white
              hover:bg-[#095c4c] disabled:opacity-30 disabled:cursor-not-allowed
              transition-all duration-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
        <p className="text-[9px] text-gray-400 mt-2 text-center">
          MediBot provides general information — always consult a doctor for medical advice.
        </p>
      </div>
    </div>
  );
};

export default ChatWindow;