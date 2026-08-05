import axios from "axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { NavLink, useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import { Icons } from "../../../shared/icons/Icons";
import CustomButton from "../../../shared/button/CustomButton";
import MainContainer from "../../../shared/main-container/MainContainer";
import SectionContainer from "../../../shared/section-container/SectionContainer";
import {
  cancelOrder,
  getMyOrders,
  getMyRequestedOrders,
  getMyPrescriptionOrders,
  getOrderTracking,
} from "../../payment/service/paymentApi";
import type { RootState } from "../../../redux/store";
import type { PaymentOrder } from "../../payment/service/paymentApi";

const CANCEL_WINDOW_HOURS = 2;

// FUL: Order status progression timeline based on pharmacist portal
const FUL_ORDER_STATUS_FLOW = [
  "pending_pickup",
  "picked",
  "packed",
  "ready_for_delivery",
  "delivered",
] as const;

// MDG: Requested Order status flow
const MDG_REQUESTED_ORDER_FLOW = [
  "requested",
  "acknowledged",
  "processing",
  "ready",
  "delivered",
] as const;

// MDG: Prescription Order status flow
const MDG_PRESCRIPTION_ORDER_FLOW = [
  "pending_ocr",
  "pending_verification",
  "verified",
  "picked",
  "packed",
  "ready_for_delivery",
  "delivered",
] as const;

const getStatusColor = (status?: string) => {
  switch (status?.toLowerCase()) {
    case "delivered":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "pending":
    case "initiated":
    case "unpaid":
      return "bg-amber-50 text-amber-700 border-amber-200";
    case "paid":
      return "bg-blue-50 text-blue-700 border-blue-200";
    case "failed":
    case "cancelled":
      return "bg-red-50 text-red-700 border-red-200";
    default:
      return "bg-gray-50 text-slate-700 border-gray-200";
  }
};

const buildCompleteTimeline = (timelineSteps: any[], statusFlow: readonly string[] = FUL_ORDER_STATUS_FLOW) => {
  // Create a map of existing timeline steps for quick lookup
  const stepMap = new Map(timelineSteps.map((step) => [step.status, step]));

  // Build complete timeline with all expected statuses
  const completeTimeline = statusFlow.map((status) => {
    const existingStep = stepMap.get(status);
    if (existingStep) {
      return existingStep;
    }

    // Create placeholder steps for statuses not yet reached
    return {
      status,
      completed: false,
      current: false,
      timestamp: null,
    };
  });

  // Mark current status based on last completed step
  let lastCompletedIndex = -1;
  completeTimeline.forEach((step, idx) => {
    if (step.completed) {
      lastCompletedIndex = idx;
    }
  });

  // Set current to the next incomplete step after the last completed
  if (lastCompletedIndex < completeTimeline.length - 1) {
    completeTimeline[lastCompletedIndex + 1].current = true;
  } else if (lastCompletedIndex === completeTimeline.length - 1) {
    // All completed, mark the last one as current
    completeTimeline[lastCompletedIndex].current = true;
  }

  return completeTimeline;
};

const formatDateTime = (value?: string | null) => {
  if (!value) return "Pending";

  return new Intl.DateTimeFormat("en-BD", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
};

const formatMoney = (value?: number) =>
  typeof value === "number" ? `BDT ${value.toLocaleString("en-BD")}` : "N/A";

const getApiErrorMessage = (error: unknown, fallback: string) => {
  if (axios.isAxiosError(error)) {
    const message = (error.response?.data as { message?: string })?.message;
    return message || fallback;
  }

  return error instanceof Error ? error.message : fallback;
};

const detectOrderType = (status?: string): "FUL" | "MDG_REQUESTED" | "MDG_PRESCRIPTION" => {
  if (!status) return "FUL";
  const statusLower = status.toLowerCase();
  
  // Check for MDG Prescription statuses
  if (MDG_PRESCRIPTION_ORDER_FLOW.some(s => s === statusLower)) {
    return "MDG_PRESCRIPTION";
  }
  
  // Check for MDG Requested statuses
  if (MDG_REQUESTED_ORDER_FLOW.some(s => s === statusLower)) {
    return "MDG_REQUESTED";
  }
  
  // Default to FUL
  return "FUL";
};

const getStatusFlowByType = (orderType: "FUL" | "MDG_REQUESTED" | "MDG_PRESCRIPTION") => {
  switch (orderType) {
    case "MDG_REQUESTED":
      return MDG_REQUESTED_ORDER_FLOW;
    case "MDG_PRESCRIPTION":
      return MDG_PRESCRIPTION_ORDER_FLOW;
    case "FUL":
    default:
      return FUL_ORDER_STATUS_FLOW;
  }
};

const getTrackingTitle = (orderType: "FUL" | "MDG_REQUESTED" | "MDG_PRESCRIPTION") => {
  switch (orderType) {
    case "MDG_REQUESTED":
      return "Request Processing Timeline";
    case "MDG_PRESCRIPTION":
      return "Prescription Processing Timeline";
    case "FUL":
    default:
      return "Tracking Timeline";
  }
};

const TrackingTimelineCard = ({ 
  title, 
  timelineSteps, 
  statusFlow 
}: { 
  title: string; 
  timelineSteps: any[]; 
  statusFlow: readonly string[] 
}) => (
  <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
    <h3 className="text-lg font-black text-dark">{title}</h3>
    <div className="mt-5 space-y-4">
      {buildCompleteTimeline(timelineSteps, statusFlow).map((step, index) => (
        <div key={`${step.status}-${index}`} className="flex gap-4">
          <div className="flex flex-col items-center">
            <span
              className={[
                "flex h-9 w-9 items-center justify-center rounded-full border text-white font-bold transition-all",
                step.completed ? "border-emerald-500 bg-emerald-500" : step.current ? "border-primary bg-primary" : "border-gray-300 bg-gray-100 text-gray-400",
                step.current ? "ring-4 ring-primary/20 shadow-md" : step.completed ? "ring-2 ring-emerald-200" : "",
              ].join(" ")}
            >
              {step.completed ? <Icons.Check className="!h-4 !w-4" /> : index + 1}
            </span>
            {index < statusFlow.length - 1 && (
              <span
                className={`mt-2 h-full min-h-8 w-0.5 transition-colors ${
                  step.completed ? "bg-emerald-500" : step.current ? "bg-primary/30" : "bg-gray-200"
                }`}
              />
            )}
          </div>

          <div className="min-w-0 flex-1 pb-3">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <p className={`text-base font-black capitalize transition-colors ${
                step.completed ? "text-emerald-700" : step.current ? "text-primary" : "text-slate-500"
              }`}>
                {step.status.replace(/_/g, " ")}
              </p>
              {step.current && !step.completed && (
                <span className="w-fit rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary animate-pulse">
                  In Progress
                </span>
              )}
              {step.completed && (
                <span className="w-fit rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                  Completed
                </span>
              )}
            </div>
            {step.timestamp && (
              <p className="mt-1 text-sm text-slate-600">
                {formatDateTime(step.timestamp)}
              </p>
            )}
            {!step.timestamp && !step.completed && (
              <p className="mt-1 text-sm text-slate-400 italic">
                Awaiting update
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  </div>
);

const getOrderPlacedAt = (order: PaymentOrder) => order.createdAt ?? order.updatedAt;

const getCancelEligibility = (order: PaymentOrder) => {
  const status = order.status?.toLowerCase();
  const paymentStatus = order.paymentStatus?.toLowerCase();
  const placedAt = getOrderPlacedAt(order);
  const placedTime = placedAt ? new Date(placedAt).getTime() : Number.NaN;
  const deadline = Number.isFinite(placedTime)
    ? placedTime + CANCEL_WINDOW_HOURS * 60 * 60 * 1000
    : Number.NaN;
  const inactiveStatuses = ["cancelled", "delivered", "shipped", "refunded"];
  const canCancel =
    Boolean(order._id) &&
    !inactiveStatuses.includes(status ?? "") &&
    paymentStatus !== "refunded" &&
    Number.isFinite(deadline) &&
    Date.now() <= deadline;

  return {
    canCancel,
    deadline: Number.isFinite(deadline) ? new Date(deadline).toISOString() : null,
  };
};

export default function OrderHistoryPage() {
  const user = useSelector((state: RootState) => state.user.user);
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const trackingId = searchParams.get("track")?.trim() ?? "";

  const {
    data: orders = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["orders"],
    queryFn: getMyOrders,
    enabled: Boolean(user) && !trackingId,
    retry: false,
  });

  const { data: requestedOrders = [] } = useQuery({
    queryKey: ["requested-orders"],
    queryFn: getMyRequestedOrders,
    enabled: Boolean(user) && !trackingId,
    retry: false,
  });

  const { data: prescriptionOrders = [] } = useQuery({
    queryKey: ["prescription-orders"],
    queryFn: getMyPrescriptionOrders,
    enabled: Boolean(user) && !trackingId,
    retry: false,
  });

  const cancelMutation = useMutation({
    mutationFn: cancelOrder,
    onSuccess: async (order) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["orders"] }),
        trackingId
          ? queryClient.invalidateQueries({ queryKey: ["order-tracking", trackingId] })
          : Promise.resolve(),
      ]);

      const isRefunded = order.paymentStatus?.toLowerCase() === "refunded";
      toast.success(
        isRefunded
          ? "Order cancelled. Refund processed and email sent."
          : "Order cancelled. A confirmation email has been sent.",
      );
    },
    onError: (err) => {
      toast.error(getApiErrorMessage(err, "Unable to cancel this order."));
    },
  });

  const handleCancelOrder = (order: PaymentOrder) => {
    const { canCancel } = getCancelEligibility(order);

    if (!canCancel) {
      toast.error(`Orders can only be cancelled within ${CANCEL_WINDOW_HOURS} hours of placing.`);
      return;
    }

    const isPaid = order.paymentStatus?.toLowerCase() === "paid";
    const message = isPaid
      ? "Cancel this order? The paid amount will be refunded automatically and an email will be sent."
      : "Cancel this order? A cancellation email will be sent.";

    if (window.confirm(message)) {
      cancelMutation.mutate(order.orderNumber ?? order._id);
    }
  };

  const {
    data: tracking,
    isLoading: isTrackingLoading,
    isError: isTrackingError,
    error: trackingError,
  } = useQuery({
    queryKey: ["order-tracking", trackingId],
    queryFn: () => getOrderTracking(trackingId),
    enabled: Boolean(user) && Boolean(trackingId),
    retry: false,
  });

  return (
    <SectionContainer>
      <MainContainer>
        <div className="mb-8">
          <h1 className="text-3xl font-black text-dark">My Orders</h1>
          <p className="mt-2 text-slate-600">
            {trackingId
              ? `Tracking results for ${trackingId}`
              : "Track your orders and delivery status"}
          </p>
        </div>

        {!user ? (
          <div className="mx-auto max-w-2xl rounded-2xl border border-gray-100 bg-white p-6 text-center shadow-sm sm:p-8">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Icons.AlertCircle className="!h-7 !w-7" />
            </div>
            <h2 className="mt-5 text-2xl font-black text-dark">Sign in to view orders</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-slate-600">
              Please log in to your account to see your order history.
            </p>
            <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
              <NavLink to="/login">
                <CustomButton variant="primary" size="sm" radius="full">
                  Sign in
                </CustomButton>
              </NavLink>
              <NavLink to="/">
                <CustomButton variant="outline" size="sm" radius="full">
                  Go home
                </CustomButton>
              </NavLink>
            </div>
          </div>
        ) : trackingId ? (
          isTrackingLoading ? (
            <div className="mx-auto max-w-4xl rounded-2xl border border-gray-100 bg-white p-8 text-center">
              <Icons.Loading className="!h-8 !w-8 mx-auto animate-spin text-primary" />
              <p className="mt-4 text-slate-600">Loading tracking details...</p>
            </div>
          ) : isTrackingError || !tracking ? (
            <div className="mx-auto max-w-2xl rounded-2xl border border-gray-100 bg-white p-6 text-center shadow-sm sm:p-8">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Icons.Search className="!h-7 !w-7" />
              </div>
              <h2 className="mt-5 text-2xl font-black text-dark">Order not found</h2>
              <p className="mx-auto mt-2 max-w-md text-sm text-slate-600">
                {trackingError instanceof Error
                  ? trackingError.message
                  : `No tracking data matched "${trackingId}". Check the order ID and try again.`}
              </p>
              <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
                <NavLink to="/order-history">
                  <CustomButton variant="primary" size="sm" radius="full">
                    View all orders
                  </CustomButton>
                </NavLink>
                <NavLink to="/">
                  <CustomButton variant="outline" size="sm" radius="full">
                    Go home
                  </CustomButton>
                </NavLink>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-500">Order number</p>
                    <h2 className="mt-1 break-all font-mono text-xl font-black text-dark sm:text-2xl">
                      {tracking.orderNumber || tracking.orderId}
                    </h2>
                    <p className="mt-2 text-sm text-slate-600">
                      Placed {formatDateTime(tracking.placedAt)}
                    </p>
                    {(() => {
                      const orderType = detectOrderType(tracking.status);
                      return (
                        <p className="mt-2 inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold capitalize bg-slate-100 text-slate-700 border border-slate-200">
                          {orderType === "MDG_REQUESTED" ? "Request Order (MDG)" : orderType === "MDG_PRESCRIPTION" ? "Prescription Order (MDG)" : "Online Order (FUL)"}
                        </p>
                      );
                    })()}
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <span
                      className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold capitalize ${getStatusColor(
                        tracking.status,
                      )}`}
                    >
                      {tracking.status || "Unknown"}
                    </span>
                    {tracking.paymentStatus && (
                      <span
                        className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold capitalize ${getStatusColor(
                          tracking.paymentStatus,
                        )}`}
                      >
                        {tracking.paymentStatus || "Payment unknown"}
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">
                      Last updated
                    </p>
                    <p className="mt-1 text-sm font-semibold text-dark">
                      {formatDateTime(tracking.lastUpdatedAt)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">
                      Estimated delivery
                    </p>
                    <p className="mt-1 text-sm font-semibold text-dark">
                      {formatDateTime(tracking.estimatedDelivery)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">
                      Contact phone
                    </p>
                    <p className="mt-1 text-sm font-semibold text-dark">
                      {tracking.contactPhone || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">
                      Grand total
                    </p>
                    <p className="mt-1 text-sm font-semibold text-dark">
                      {formatMoney(tracking.totals?.grandTotal)}
                    </p>
                  </div>
                </div>
              </div>

              {(() => {
                const orderType = detectOrderType(tracking.status);
                const statusFlow = getStatusFlowByType(orderType);
                const timelineTitle = getTrackingTitle(orderType);

                return (
                  <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
                    <h2 className="text-lg font-black text-dark">{timelineTitle}</h2>
                    <div className="mt-5 space-y-4">
                      {buildCompleteTimeline(tracking.timeline, statusFlow).map((step, index) => (
                        <div key={`${step.status}-${index}`} className="flex gap-4">
                          <div className="flex flex-col items-center">
                            <span
                              className={[
                                "flex h-9 w-9 items-center justify-center rounded-full border text-white font-bold transition-all",
                                step.completed ? "border-emerald-500 bg-emerald-500" : step.current ? "border-primary bg-primary" : "border-gray-300 bg-gray-100 text-gray-400",
                                step.current ? "ring-4 ring-primary/20 shadow-md" : step.completed ? "ring-2 ring-emerald-200" : "",
                              ].join(" ")}
                            >
                              {step.completed ? <Icons.Check className="!h-4 !w-4" /> : index + 1}
                            </span>
                            {index < statusFlow.length - 1 && (
                              <span
                                className={`mt-2 h-full min-h-8 w-0.5 transition-colors ${
                                  step.completed ? "bg-emerald-500" : step.current ? "bg-primary/30" : "bg-gray-200"
                                }`}
                              />
                            )}
                          </div>

                          <div className="min-w-0 flex-1 pb-3">
                            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                              <p className={`text-base font-black capitalize transition-colors ${
                                step.completed ? "text-emerald-700" : step.current ? "text-primary" : "text-slate-500"
                              }`}>
                                {step.status.replace(/_/g, " ")}
                              </p>
                              {step.current && !step.completed && (
                                <span className="w-fit rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary animate-pulse">
                                  In Progress
                                </span>
                              )}
                              {step.completed && (
                                <span className="w-fit rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                                  Completed
                                </span>
                              )}
                            </div>
                            {step.timestamp && (
                              <p className="mt-1 text-sm text-slate-600">
                                {formatDateTime(step.timestamp)}
                              </p>
                            )}
                            {!step.timestamp && !step.completed && (
                              <p className="mt-1 text-sm text-slate-400 italic">
                                Awaiting update
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}

              <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
                <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
                  <h2 className="text-lg font-black text-dark">Items</h2>
                  <div className="mt-4 divide-y divide-gray-100">
                    {(tracking.items ?? []).length > 0 ? (
                      tracking.items?.map((item, index) => (
                        <div key={`${item.product?._id ?? item.nameSnapshot}-${index}`} className="py-3">
                          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                              <p className="font-semibold text-dark">
                                {item.nameSnapshot || item.product?.name || "Order item"}
                              </p>
                              <p className="mt-1 text-sm text-slate-500">
                                Qty {item.qty ?? 0} x {formatMoney(item.unitPrice)}
                              </p>
                            </div>
                            <p className="font-black text-dark">{formatMoney(item.lineTotal)}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="py-3 text-sm text-slate-500">No item details available.</p>
                    )}
                  </div>
                </div>

                <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
                  <h2 className="text-lg font-black text-dark">Delivery</h2>
                  <p className="mt-3 text-sm leading-6 text-slate-700">
                    {tracking.deliveryAddress
                      ? [
                          tracking.deliveryAddress.line1,
                          tracking.deliveryAddress.line2,
                          tracking.deliveryAddress.city,
                          tracking.deliveryAddress.state,
                          tracking.deliveryAddress.postcode,
                          tracking.deliveryAddress.country,
                        ]
                          .filter(Boolean)
                          .join(", ")
                      : "No delivery address available."}
                  </p>
                  <div className="mt-5 space-y-2 border-t border-gray-100 pt-4">
                    <div className="flex justify-between gap-3 text-sm">
                      <span className="text-slate-500">Subtotal</span>
                      <span className="font-semibold text-dark">
                        {formatMoney(tracking.totals?.subtotal)}
                      </span>
                    </div>
                    <div className="flex justify-between gap-3 text-sm">
                      <span className="text-slate-500">Discount</span>
                      <span className="font-semibold text-dark">
                        {formatMoney(tracking.totals?.discountTotal)}
                      </span>
                    </div>
                    <div className="flex justify-between gap-3 text-sm">
                      <span className="text-slate-500">Delivery fee</span>
                      <span className="font-semibold text-dark">
                        {formatMoney(tracking.totals?.deliveryFee)}
                      </span>
                    </div>
                    <div className="flex justify-between gap-3 border-t border-gray-100 pt-3 text-base">
                      <span className="font-black text-dark">Grand total</span>
                      <span className="font-black text-primary">
                        {formatMoney(tracking.totals?.grandTotal)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        ) : isLoading ? (
          <div className="mx-auto max-w-4xl rounded-2xl border border-gray-100 bg-white p-8 text-center">
            <Icons.Loading className="!h-8 !w-8 mx-auto animate-spin text-primary" />
            <p className="mt-4 text-slate-600">Loading your orders...</p>
          </div>
        ) : isError && orders.length === 0 && requestedOrders.length === 0 && prescriptionOrders.length === 0 ? (
          <div className="mx-auto max-w-4xl rounded-2xl border border-red-100 bg-red-50 p-6 text-center shadow-sm">
            <p className="font-semibold text-red-700">Unable to load orders</p>
            <p className="mt-2 text-sm text-red-600">
              {String(error) || "Please try again later."}
            </p>
            <div className="mt-5 flex justify-center">
              <CustomButton variant="primary" size="sm" radius="full" onClick={() => window.location.reload()}>
                Retry
              </CustomButton>
            </div>
          </div>
        ) : orders.length === 0 && requestedOrders.length === 0 && prescriptionOrders.length === 0 ? (
          <div className="mx-auto max-w-2xl rounded-2xl border border-gray-100 bg-white p-6 text-center shadow-sm sm:p-8">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Icons.Clock className="!h-7 !w-7" />
            </div>
            <h2 className="mt-5 text-2xl font-black text-dark">No orders yet</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-slate-600">
              You haven't placed any orders yet. Start shopping to see your order history here.
            </p>
            <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
              <NavLink to="/shop">
                <CustomButton variant="primary" size="sm" radius="full">
                  Shop now
                </CustomButton>
              </NavLink>
              <NavLink to="/cart">
                <CustomButton variant="outline" size="sm" radius="full">
                  View cart
                </CustomButton>
              </NavLink>
            </div>
          </div>
        ) : (
          <div>
            {isError && (
              <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm font-semibold text-red-700">
                Some order history data could not be loaded. Refresh the page if the issue persists.
              </div>
            )}
            <div className="space-y-6">
            {orders.length > 0 && (
              <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <h2 className="text-2xl font-black text-dark">My Online Orders (FUL)</h2>
                <p className="mt-2 text-sm text-slate-500">
                  Orders placed through the website checkout with full tracking integration.
                </p>
                <div className="mt-6 space-y-4">
                  {orders.map((order) => {
                    const cancelEligibility = getCancelEligibility(order);
                    const cancelKey = order.orderNumber ?? order._id;
                    const isCancelling = cancelMutation.isPending && cancelMutation.variables === cancelKey;

                    return (
                      <div
                        key={order._id}
                        className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:shadow-md"
                      >
                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-slate-500">Order ID</p>
                            <p className="mt-1 break-all font-mono text-sm font-black text-dark">
                              {order.orderNumber || order._id}
                            </p>
                            {cancelEligibility.deadline && (
                              <p className="mt-2 text-xs font-semibold text-slate-500">
                                Cancel available until {formatDateTime(cancelEligibility.deadline)}
                              </p>
                            )}
                          </div>

                          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                            <div>
                              <p className="text-sm font-semibold text-slate-500">Grand Total</p>
                              <p className="mt-1 text-lg font-black text-dark">
                                {order.grandTotal ? `৳ ${order.grandTotal}` : "N/A"}
                              </p>
                            </div>

                            <div>
                              <p className="text-sm font-semibold text-slate-500">Payment Status</p>
                              <p
                                className={`mt-1 inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold capitalize ${getStatusColor(
                                  order.paymentStatus,
                                )}`}
                              >
                                {order.paymentStatus || "Unknown"}
                              </p>
                            </div>

                            {order.status && (
                              <div>
                                <p className="text-sm font-semibold text-slate-500">Order Status</p>
                                <p
                                  className={`mt-1 inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold capitalize ${getStatusColor(
                                    order.status,
                                  )}`}
                                >
                                  {order.status}
                                </p>
                              </div>
                            )}

                            <div className="mt-1 flex shrink-0 flex-wrap gap-2">
                              <NavLink
                                to={`/order-history?track=${encodeURIComponent(order.orderNumber ?? order._id)}`}
                                className="inline-flex"
                              >
                                <CustomButton variant="outline" size="sm" radius="full">
                                  Track order
                                </CustomButton>
                              </NavLink>

                              <CustomButton
                                variant="danger"
                                size="sm"
                                radius="full"
                                loading={isCancelling}
                                disabled={!cancelEligibility.canCancel || cancelMutation.isPending}
                                onClick={() => handleCancelOrder(order)}
                              >
                                Cancel order
                              </CustomButton>
                            </div>
                          </div>
                        </div>

                        {cancelEligibility.canCancel && order.paymentStatus?.toLowerCase() === "paid" && (
                          <div className="mt-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
                            Paid orders cancelled within {CANCEL_WINDOW_HOURS} hours are refunded automatically,
                            and a cancellation/refund email is sent to your account email.
                          </div>
                        )}

                        {order.deliveryAddress && (
                          <div className="mt-4 border-t border-gray-100 pt-4">
                            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">
                              Delivery Address
                            </p>
                            <p className="mt-2 text-sm text-slate-700">
                              {[
                                order.deliveryAddress.line1,
                                order.deliveryAddress.line2,
                                order.deliveryAddress.city,
                                order.deliveryAddress.state,
                                order.deliveryAddress.postcode,
                                order.deliveryAddress.country,
                              ]
                                .filter(Boolean)
                                .join(", ")}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {requestedOrders.length > 0 && (
              <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <h2 className="text-2xl font-black text-dark">Requested Orders (MDG)</h2>
                <p className="mt-2 text-sm text-slate-500">
                  Orders submitted through the request order form with full tracking.
                </p>
                <div className="mt-6 space-y-4">
                  {requestedOrders.map((order) => (
                    <div key={order._id} className="rounded-2xl border border-gray-100 bg-slate-50 p-4">
                      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                          <p className="text-sm font-semibold text-slate-500">Request ID</p>
                          <p className="mt-1 break-all font-mono text-sm font-black text-dark">{order._id}</p>
                          <p className="mt-2 inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold capitalize bg-blue-50 text-blue-700 border-blue-200">
                            {order.status ?? "Pending"}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-slate-500">Requested At</p>
                          <p className="mt-1 text-sm font-black text-dark">{formatDateTime(order.createdAt)}</p>
                        </div>
                      </div>
                      <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        <div>
                          <p className="text-sm font-semibold text-slate-500">Customer</p>
                          <p className="mt-1 text-sm font-medium text-dark">{order.fullName ?? order.email ?? "-"}</p>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-500">Phone</p>
                          <p className="mt-1 text-sm font-medium text-dark">{order.phone ?? "-"}</p>
                        </div>
                      </div>
                      
                      {/* MDG Requested Order Tracking Timeline */}
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <TrackingTimelineCard 
                          title="Order Progress"
                          timelineSteps={[
                            { status: order.status ?? "requested", completed: order.status !== "requested", current: order.status === "requested", timestamp: order.createdAt },
                            ...Array.from({ length: 4 }, (_, i) => ({
                              status: MDG_REQUESTED_ORDER_FLOW[i + 1] || "unknown",
                              completed: false,
                              current: false,
                              timestamp: null,
                            }))
                          ]}
                          statusFlow={MDG_REQUESTED_ORDER_FLOW}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {prescriptionOrders.length > 0 && (
              <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <h2 className="text-2xl font-black text-dark">Prescription Orders (MDG)</h2>
                <p className="mt-2 text-sm text-slate-500">
                  Prescription-based orders processed by pharmacy staff with full tracking.
                </p>
                <div className="mt-6 space-y-4">
                  {prescriptionOrders.map((order) => (
                    <div key={order._id} className="rounded-2xl border border-gray-100 bg-slate-50 p-4">
                      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                          <p className="text-sm font-semibold text-slate-500">Prescription ID</p>
                          <p className="mt-1 break-all font-mono text-sm font-black text-dark">{order._id}</p>
                          <p className="mt-2 inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold capitalize bg-purple-50 text-purple-700 border-purple-200">
                            {order.status ?? "Pending"}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-slate-500">Submitted At</p>
                          <p className="mt-1 text-sm font-black text-dark">{formatDateTime(order.createdAt)}</p>
                        </div>
                      </div>
                      <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        <div>
                          <p className="text-sm font-semibold text-slate-500">Customer</p>
                          <p className="mt-1 text-sm font-medium text-dark">{order.customerName ?? "-"}</p>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-500">Phone</p>
                          <p className="mt-1 text-sm font-medium text-dark">{order.customerPhone ?? "-"}</p>
                        </div>
                      </div>
                      <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        <div>
                          <p className="text-sm font-semibold text-slate-500">Amount</p>
                          <p className="mt-1 text-sm font-black text-dark">{formatMoney(order.totalAmount)}</p>
                        </div>
                      </div>
                      
                      {/* MDG Prescription Order Tracking Timeline */}
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <TrackingTimelineCard 
                          title="Prescription Processing"
                          timelineSteps={[
                            { status: order.status ?? "pending_ocr", completed: order.status !== "pending_ocr", current: order.status === "pending_ocr", timestamp: order.createdAt },
                            ...Array.from({ length: 6 }, (_, i) => ({
                              status: MDG_PRESCRIPTION_ORDER_FLOW[i + 1] || "unknown",
                              completed: false,
                              current: false,
                              timestamp: null,
                            }))
                          ]}
                          statusFlow={MDG_PRESCRIPTION_ORDER_FLOW}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        )}

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <NavLink to="/shop">
            <CustomButton variant="primary" size="sm" radius="full">
              Continue shopping
            </CustomButton>
          </NavLink>
          <NavLink to="/">
            <CustomButton variant="outline" size="sm" radius="full">
              Go home
            </CustomButton>
          </NavLink>
        </div>
      </MainContainer>
    </SectionContainer>
  );
}
