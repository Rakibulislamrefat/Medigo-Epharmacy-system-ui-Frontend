import type { NavigateFunction } from "react-router-dom";

export type AssistantIntent =
  | "product_search"
  | "prescription"
  | "order_tracking"
  | "promotion"
  | "support"
  | "symptom_advice"
  | "cart"
  | "account"
  | "navigation"
  | "general";

export type AssistantAction = "navigate" | "open_cart" | "none";

export interface AIResponse {
  message: string;
  intent: AssistantIntent;
  action: AssistantAction;
  route: string | null;
  params: Record<string, string> | null;
  showButton: boolean;
  buttonLabel: string | null;
}

interface RouterOptions {
  navigate: NavigateFunction;
  openCart?: () => void;
  closeAssistant?: () => void;
}

export const executeAction = (
  response: AIResponse,
  options: RouterOptions
): void => {
  const { navigate, openCart, closeAssistant } = options;

  if (response.action === "open_cart") {
    openCart?.();
    closeAssistant?.();
    return;
  }

  if (response.action === "navigate" && response.route) {
    const searchString =
      response.params && Object.keys(response.params).length > 0
        ? "?" + new URLSearchParams(response.params).toString()
        : "";
    navigate(`${response.route}${searchString}`);
    closeAssistant?.();
    return;
  }
};

export const FALLBACK_RESPONSES: Record<string, Partial<AIResponse>> = {
  product_search: {
    route: "/shop",
    action: "navigate",
    showButton: true,
    buttonLabel: "Browse Shop",
  },
  prescription: {
    route: "/prescription/upload",
    action: "navigate",
    showButton: true,
    buttonLabel: "Upload Prescription",
  },
  order_tracking: {
    route: "/order",
    action: "navigate",
    showButton: true,
    buttonLabel: "My Orders",
  },
  promotion: {
    route: "/special-offers",
    action: "navigate",
    showButton: true,
    buttonLabel: "See Offers",
  },
  support: {
    route: "/contact-us",
    action: "navigate",
    showButton: true,
    buttonLabel: "Contact Us",
  },
  cart: {
    route: "/shop",
    action: "navigate",
    showButton: true,
    buttonLabel: "Browse Shop",
  },
  account: {
    route: "/profile",
    action: "navigate",
    showButton: true,
    buttonLabel: "My Profile",
  },
};
