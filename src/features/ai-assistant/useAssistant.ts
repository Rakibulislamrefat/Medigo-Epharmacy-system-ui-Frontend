import { useState, useCallback, useRef } from "react";
import type { AIResponse } from "./intentRouter";

export interface Message {
  id: string;
  role: "user" | "assistant";
  text: string;
  aiResponse?: AIResponse;
  timestamp: Date;
}

interface ConversationMessage {
  role: "user" | "assistant";
  content: string;
}

const generateId = () => Math.random().toString(36).slice(2, 9);

const normalize = (s: string) => s.toLowerCase().replace(/\s+/g, " ").trim();

const extractQuery = (text: string) => {
  const cleaned = normalize(text)
    .replace(/\b(please|can you|could you|i want|i need|show me|find|search|look for|buy|get)\b/g, "")
    .replace(/\b(medicine|medicines|tablet|tablets|capsule|capsules|syrup|cream)\b/g, "")
    .replace(/\b(in|on)\s+(shop|store)\b/g, "")
    .replace(/[?!.]+/g, "")
    .trim();
  return cleaned;
};

const buildResponse = (patch: Partial<AIResponse> & Pick<AIResponse, "message">): AIResponse => ({
  message: patch.message,
  intent: patch.intent ?? "general",
  action: patch.action ?? "none",
  route: patch.route ?? null,
  params: patch.params ?? null,
  showButton: patch.showButton ?? false,
  buttonLabel: patch.buttonLabel ?? null,
});

const buildRuleResponse = (userText: string): AIResponse => {
  const lower = normalize(userText);

  const wantsRegister = /\b(register|create account|sign up)\b/.test(lower);
  if (wantsRegister) {
    return buildResponse({
      message: "Sure — I can take you to the registration page.",
      intent: "navigation",
      action: "navigate",
      route: "/register",
      showButton: true,
      buttonLabel: "Create Account",
    });
  }

  const wantsLogin = /\b(login|log in|sign in)\b/.test(lower);
  if (wantsLogin) {
    return buildResponse({
      message: "Sure — opening the login page.",
      intent: "navigation",
      action: "navigate",
      route: "/login",
      showButton: true,
      buttonLabel: "Sign In",
    });
  }

  const wantsOrder = /\b(request order|order medicine|place order|order)\b/.test(lower);
  if (wantsOrder) {
    return buildResponse({
      message: "Okay — let’s place your order request.",
      intent: "navigation",
      action: "navigate",
      route: "/request-order",
      showButton: true,
      buttonLabel: "Request Order",
    });
  }

  const wantsPrescription = /\b(upload prescription|prescription upload|prescription)\b/.test(lower);
  if (wantsPrescription) {
    return buildResponse({
      message: "Sure — I’ll take you to upload your prescription.",
      intent: "prescription",
      action: "navigate",
      route: "/prescription/upload",
      showButton: true,
      buttonLabel: "Upload Prescription",
    });
  }

  const wantsOffers = /\b(offer|offers|discount|deal|promotion|promotions)\b/.test(lower);
  if (wantsOffers) {
    return buildResponse({
      message: "Here are the latest special offers.",
      intent: "promotion",
      action: "navigate",
      route: "/special-offers",
      showButton: true,
      buttonLabel: "See Offers",
    });
  }

  const wantsSupport = /\b(contact|support|help|customer care)\b/.test(lower);
  if (wantsSupport) {
    return buildResponse({
      message: "Sure — you can contact our support team here.",
      intent: "support",
      action: "navigate",
      route: "/contact-us",
      showButton: true,
      buttonLabel: "Contact Us",
    });
  }

  const wantsProfile = /\b(profile|account|settings)\b/.test(lower);
  if (wantsProfile) {
    return buildResponse({
      message: "Opening your profile page.",
      intent: "account",
      action: "navigate",
      route: "/profile",
      showButton: true,
      buttonLabel: "My Profile",
    });
  }

  const wantsConsult = /\b(doctor|consult|consultancy)\b/.test(lower);
  if (wantsConsult) {
    return buildResponse({
      message: "Sure — I can take you to doctor consultancy.",
      intent: "navigation",
      action: "navigate",
      route: "/doctor-consultancy",
      showButton: true,
      buttonLabel: "Doctor Consultancy",
    });
  }

  const symptomSerious =
    /\b(chest pain|difficulty breathing|shortness of breath|fainting|seizure)\b/.test(
      lower,
    );
  if (symptomSerious) {
    return buildResponse({
      message:
        "If this is severe or sudden, please seek emergency care immediately. You can also contact support for help.",
      intent: "symptom_advice",
      action: "navigate",
      route: "/contact-us",
      showButton: true,
      buttonLabel: "Contact Support",
    });
  }

  const symptomHeadache = /\b(headache|fever|cold|cough|allergy|runny nose)\b/.test(lower);
  if (symptomHeadache) {
    return buildResponse({
      message:
        "For common symptoms, OTC options may help (for example paracetamol for fever/headache). If symptoms persist, consult a doctor.",
      intent: "symptom_advice",
      action: "navigate",
      route: "/doctor-consultancy",
      showButton: true,
      buttonLabel: "Consult Doctor",
    });
  }

  const wantsSearch =
    /\b(find|search|look for|buy|get)\b/.test(lower) ||
    /\b(paracetamol|napa|antacid|cetirizine|vitamin)\b/.test(lower);

  if (wantsSearch) {
    const q = extractQuery(userText);
    const query = q || userText.trim();
    return buildResponse({
      message: `Sure — showing results for “${query}”.`,
      intent: "product_search",
      action: "navigate",
      route: "/shop",
      params: { q: query },
      showButton: true,
      buttonLabel: "View Results",
    });
  }

  return buildResponse({
    message:
      "I can help you find medicines, upload a prescription, request an order, or contact support. What would you like to do?",
    intent: "general",
    action: "none",
  });
};

export const useAssistant = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: generateId(),
      role: "assistant",
      text: "Hi! I'm MediBot 👋 I can help you find medicines, upload prescriptions, track orders, or answer any pharmacy questions.",
      timestamp: new Date(),
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const historyRef = useRef<ConversationMessage[]>([]);

  const sendMessage = useCallback(async (userText: string) => {
    if (!userText.trim()) return;

    setError(null);

    const userMessage: Message = {
      id: generateId(),
      role: "user",
      text: userText,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);

    historyRef.current.push({ role: "user", content: userText });

    setIsTyping(true);

    try {
      await new Promise((r) => window.setTimeout(r, 450));
      const response = buildRuleResponse(userText);
      historyRef.current.push({ role: "assistant", content: response.message });
      setMessages((prev) => [
        ...prev,
        {
          id: generateId(),
          role: "assistant",
          text: response.message,
          aiResponse: response,
          timestamp: new Date(),
        },
      ]);
    } catch (err) {
      const fallback = buildRuleResponse(userText);
      const errorMessage: Message = {
        id: generateId(),
        role: "assistant",
        text: "Sorry, I'm temporarily unavailable. Please try again in a moment.",
        aiResponse: fallback,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
      setError("Please try again.");
    } finally {
      setIsTyping(false);
    }
  }, []);

  const clearMessages = useCallback(() => {
    historyRef.current = [];
    setMessages([
      {
        id: generateId(),
        role: "assistant",
        text: "Hi! I'm MediBot 👋 I can help you find medicines, upload prescriptions, track orders, or answer any pharmacy questions.",
        timestamp: new Date(),
      },
    ]);
    setError(null);
  }, []);

  return {
    messages,
    isTyping,
    error,
    sendMessage,
    clearMessages,
  };
};
