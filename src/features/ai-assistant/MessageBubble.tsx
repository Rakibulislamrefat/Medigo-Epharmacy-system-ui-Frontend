import type { Message } from "./useAssistant";
import type { AIResponse } from "./intentRouter";
import { executeAction } from "./intentRouter";
import { useNavigate } from "react-router-dom";
import ActionButton from "./ActionButton";

interface MessageBubbleProps {
  message: Message;
  onAction?: () => void; // closes the assistant after navigation
  openCart?: () => void;
}

const INTENT_ICONS: Record<string, string> = {
  product_search: "💊",
  prescription: "📋",
  order_tracking: "📦",
  promotion: "🏷️",
  support: "🙋",
  symptom_advice: "🩺",
  cart: "🛒",
  account: "👤",
  navigation: "🔗",
  general: "💬",
};

const MessageBubble = ({ message, onAction, openCart }: MessageBubbleProps) => {
  const navigate = useNavigate();
  const isUser = message.role === "user";
  const aiResponse = message.aiResponse as AIResponse | undefined;

  const handleAction = () => {
    if (!aiResponse) return;
    executeAction(aiResponse, {
      navigate,
      openCart,
      closeAssistant: onAction,
    });
  };

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] px-4 py-2.5 rounded-2xl rounded-tr-sm
          bg-primary text-white text-sm leading-relaxed">
          {message.text}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-2.5">
      {/* MediBot avatar */}
      <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center shrink-0 mt-0.5">
        <span className="text-white font-black text-xs">M</span>
      </div>

      <div className="max-w-[80%]">
        {/* Intent badge */}
        {aiResponse?.intent && aiResponse.intent !== "general" && (
          <div className="flex items-center gap-1 mb-1.5">
            <span className="text-[10px]">
              {INTENT_ICONS[aiResponse.intent] ?? "💬"}
            </span>
            <span className="text-[10px] font-semibold text-primary/60 uppercase tracking-wider">
              {aiResponse.intent.replace("_", " ")}
            </span>
          </div>
        )}

        {/* Message bubble */}
        <div className="px-4 py-2.5 rounded-2xl rounded-tl-sm
          bg-primary/10 text-[#0f2e29] text-sm leading-relaxed">
          {message.text}
        </div>

        {/* Action button */}
        {aiResponse?.showButton && aiResponse.buttonLabel && (
          <ActionButton label={aiResponse.buttonLabel} onClick={handleAction} />
        )}

        {/* Timestamp */}
        <p className="text-[10px] text-gray-400 mt-1 ml-1">
          {message.timestamp.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>
    </div>
  );
};

export default MessageBubble;