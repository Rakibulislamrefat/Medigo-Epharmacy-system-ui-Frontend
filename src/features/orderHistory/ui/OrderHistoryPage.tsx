import { useQuery } from "@tanstack/react-query";
import { NavLink, useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { Icons } from "../../../shared/icons/Icons";
import CustomButton from "../../../shared/button/CustomButton";
import MainContainer from "../../../shared/main-container/MainContainer";
import SectionContainer from "../../../shared/section-container/SectionContainer";
import { getMyOrders, getOrderTracking } from "../../payment/service/paymentApi";
import type { RootState } from "../../../redux/store";

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

const formatDateTime = (value?: string | null) => {
  if (!value) return "Pending";

  return new Intl.DateTimeFormat("en-BD", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
};

const formatMoney = (value?: number) =>
  typeof value === "number" ? `BDT ${value.toLocaleString("en-BD")}` : "N/A";

export default function OrderHistoryPage() {
  const user = useSelector((state: RootState) => state.user.user);
  const [searchParams] = useSearchParams();
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
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <span
                      className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold capitalize ${getStatusColor(
                        tracking.status,
                      )}`}
                    >
                      {tracking.status || "Unknown"}
                    </span>
                    <span
                      className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold capitalize ${getStatusColor(
                        tracking.paymentStatus,
                      )}`}
                    >
                      {tracking.paymentStatus || "Payment unknown"}
                    </span>
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

              <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
                <h2 className="text-lg font-black text-dark">Tracking Timeline</h2>
                <div className="mt-5 space-y-4">
                  {tracking.timeline.map((step, index) => (
                    <div key={`${step.status}-${index}`} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <span
                          className={[
                            "flex h-9 w-9 items-center justify-center rounded-full border text-white",
                            step.completed ? "border-primary bg-primary" : "border-gray-200 bg-gray-200",
                            step.current ? "ring-4 ring-primary/15" : "",
                          ].join(" ")}
                        >
                          {step.completed ? <Icons.Check className="!h-4 !w-4" /> : index + 1}
                        </span>
                        {index < tracking.timeline.length - 1 && (
                          <span
                            className={`mt-2 h-full min-h-8 w-0.5 ${
                              step.completed ? "bg-primary/50" : "bg-gray-200"
                            }`}
                          />
                        )}
                      </div>

                      <div className="min-w-0 flex-1 pb-3">
                        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                          <p className="text-base font-black capitalize text-dark">
                            {step.status.replace(/_/g, " ")}
                          </p>
                          {step.current && (
                            <span className="w-fit rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                              Current
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-sm text-slate-500">
                          {formatDateTime(step.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

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
        ) : isError ? (
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
        ) : orders.length === 0 ? (
          <div className="mx-auto max-w-2xl rounded-2xl border border-gray-100 bg-white p-6 text-center shadow-sm sm:p-8">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Icons.Clock className="!h-7 !w-7" />
            </div>
            <h2 className="mt-5 text-2xl font-black text-dark">No orders yet</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-slate-600">
              You haven't placed any orders yet. Start shopping to see your orders here.
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
          <div className="space-y-4">
            {orders.map((order) => (
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

                    <NavLink
                      to={`/order-history?track=${encodeURIComponent(order.orderNumber ?? order._id)}`}
                      className="mt-1 inline-flex shrink-0"
                    >
                      <CustomButton variant="outline" size="sm" radius="full">
                        Track order
                      </CustomButton>
                    </NavLink>
                  </div>
                </div>

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
            ))}
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
