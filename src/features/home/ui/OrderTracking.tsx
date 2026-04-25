import { useState, type ReactNode } from "react";
import { Icons } from "../../../shared/icons/Icons";
import MainContainer from "../../../shared/main-container/MainContainer";
import Button from "../../../shared/button/CustomButton";

interface OrderTrackingProps {
  isFloating?: boolean;
}

const OrderTracking = ({ isFloating = false }: OrderTrackingProps) => {
  const [orderId, setOrderId] = useState("");

  // ── Mobile layout (< sm) ──────────────────────────────────────────────
  const mobileContent = (
    <div className="sm:hidden w-full bg-white rounded-2xl shadow-2xl overflow-hidden">
      <div className="flex flex-col gap-3 px-4 py-5">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-3 py-3">
            <Icons.Search className="text-primary shrink-0 w-4 h-4" />
            <input
              type="text"
              placeholder="Enter your order ID"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              className="outline-none bg-transparent text-sm text-gray-700 w-full"
            />
          </div>
        </div>

        <Button
          variant="primary"
          size="md"
          fullWidth
          className="rounded-xl text-sm"
        >
          Track Order
        </Button>
      </div>
    </div>
  );

  // ── Desktop layout (sm+) ──────────────────────────────────────────────
  const desktopContent = (
    <div className="hidden sm:flex w-full bg-white gap-2 rounded-full shadow-2xl overflow-hidden items-center px-5 py-4">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 rounded-full border border-gray-200 bg-white px-4 h-12">
          <Icons.Search className="text-primary shrink-0 w-4 h-4" />
          <input
            type="text"
            placeholder="Enter your order ID"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            className="outline-none bg-transparent text-sm text-gray-700 w-full"
          />
        </div>
      </div>

      <Button
        variant="primary"
        size="sm"
        radius="full"
        className="shrink-0 rounded-full px-8 text-sm h-12"
      >
        Track Order
      </Button>
    </div>
  );

  const wrapper = (children: ReactNode) => (
    <div className="w-full overflow-visible" style={{ position: "relative", zIndex: 100 }}>
      {children}
    </div>
  );

  if (isFloating) {
    return wrapper(<>{mobileContent}{desktopContent}</>);
  }

  return (
    <MainContainer>
      {wrapper(<>{mobileContent}{desktopContent}</>)}
    </MainContainer>
  );
};

export default OrderTracking;