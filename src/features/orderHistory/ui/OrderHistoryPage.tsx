import { useQuery } from "@tanstack/react-query";
import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";
import { Icons } from "../../../shared/icons/Icons";
import CustomButton from "../../../shared/button/CustomButton";
import MainContainer from "../../../shared/main-container/MainContainer";
import SectionContainer from "../../../shared/section-container/SectionContainer";
import { getMyOrders } from "../../payment/service/paymentApi";
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

export default function OrderHistoryPage() {
  const user = useSelector((state: RootState) => state.user.user);

  const {
    data: orders = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["orders"],
    queryFn: getMyOrders,
    enabled: Boolean(user),
    retry: false,
  });

  return (
    <SectionContainer>
      <MainContainer>
        <div className="mb-8">
          <h1 className="text-3xl font-black text-dark">My Orders</h1>
          <p className="mt-2 text-slate-600">
            Track your orders and delivery status
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
