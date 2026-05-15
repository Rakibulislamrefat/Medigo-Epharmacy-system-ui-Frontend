import { useState, type FormEvent, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { Icons } from "../../../shared/icons/Icons";
import MainContainer from "../../../shared/main-container/MainContainer";

interface OrderTrackingProps {
  isFloating?: boolean;
}

const OrderTracking = ({ isFloating = false }: OrderTrackingProps) => {
  const navigate = useNavigate();
  const [orderId, setOrderId] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trackingId = orderId.trim();
    navigate(trackingId ? `/order-history?track=${encodeURIComponent(trackingId)}` : "/order-history");
  };

  const content = (
    <form
      onSubmit={handleSubmit}
      className={[
        "flex w-full flex-col gap-3 bg-white p-3 shadow-2xl",
        "rounded-[1.75rem] sm:flex-row sm:items-center sm:gap-2 sm:rounded-full sm:p-5",
      ].join(" ")}
    >
      <label
        htmlFor="order-tracking-id"
        className="flex h-14 min-w-0 flex-1 items-center gap-3 rounded-2xl border border-gray-200 bg-white px-4 transition focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/15 sm:h-[60px] sm:rounded-full sm:px-5"
      >
        <Icons.Search className="!h-7 !w-7 shrink-0 text-primary sm:!h-9 sm:!w-9" />
        <span className="sr-only">Order ID</span>
        <input
          id="order-tracking-id"
          type="text"
          placeholder="Enter your order ID"
          value={orderId}
          onChange={(event) => setOrderId(event.target.value)}
          className="h-full min-w-0 flex-1 bg-transparent text-base font-medium text-slate-700 outline-none placeholder:text-slate-400 sm:text-lg"
          autoComplete="off"
        />
      </label>

      <button
        type="submit"
        className="h-14 w-full shrink-0 rounded-2xl bg-primary px-6 text-base font-black text-white transition hover:bg-[#095c4c] focus:outline-none focus:ring-2 focus:ring-primary/40 focus:ring-offset-2 active:scale-[0.98] sm:h-[60px] sm:w-[178px] sm:rounded-full"
      >
        Track Order
      </button>
    </form>
  );

  const wrapper = (children: ReactNode) => (
    <div className="relative z-[100] w-full overflow-visible">
      {children}
    </div>
  );

  if (isFloating) {
    return wrapper(content);
  }

  return (
    <MainContainer>
      {wrapper(content)}
    </MainContainer>
  );
};

export default OrderTracking;
