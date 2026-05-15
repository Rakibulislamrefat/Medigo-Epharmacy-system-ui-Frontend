import { NavLink, useLocation } from "react-router-dom";
import { Icons } from "../../../shared/icons/Icons";
import MainContainer from "../../../shared/main-container/MainContainer";
import SectionContainer from "../../../shared/section-container/SectionContainer";
import CustomButton from "../../../shared/button/CustomButton";
import type { PaymentOrder } from "../service/paymentApi";

type OrderConfirmationLocationState = {
  order?: PaymentOrder;
  paymentMethod?: "cod" | "sslcommerz";
};

const formatAddress = (address?: PaymentOrder["deliveryAddress"]) => {
  if (!address) return "Not available";
  return [address.line1, address.line2, address.city, address.state, address.postcode, address.country]
    .filter(Boolean)
    .join(", ");
};

export default function OrderConfirmationPage() {
  const location = useLocation();
  const state = location.state as OrderConfirmationLocationState | null;
  const order = state?.order;
  const paymentMethod = state?.paymentMethod === "sslcommerz" ? "Online payment" : "Cash on delivery";

  return (
    <SectionContainer>
      <MainContainer>
        <div className="mx-auto max-w-2xl rounded-2xl border border-gray-100 bg-white p-6 text-center shadow-sm sm:p-8">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
            <Icons.Check className="!h-7 !w-7" />
          </div>

          <h1 className="mt-5 text-2xl font-black text-dark">Order confirmed</h1>
          <p className="mx-auto mt-2 max-w-md text-sm text-slate-600">
            Your order was placed successfully. Below is the order summary for your reference.
          </p>

          {!order ? (
            <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-700">
              Order details are unavailable. Please go back to your cart or contact support if needed.
            </div>
          ) : (
            <div className="mt-6 space-y-4 text-left">
              <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Order number</p>
                <p className="mt-2 text-lg font-semibold text-dark">
                  {order.orderNumber || order._id}
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-gray-100 bg-white p-5">
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Order ID</p>
                  <p className="mt-2 break-all text-base font-semibold text-dark">{order._id}</p>
                </div>
                <div className="rounded-2xl border border-gray-100 bg-white p-5">
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Payment method</p>
                  <p className="mt-2 text-base font-semibold text-dark">{paymentMethod}</p>
                </div>
                <div className="rounded-2xl border border-gray-100 bg-white p-5">
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Order status</p>
                  <p className="mt-2 text-base font-semibold text-dark">{order.paymentStatus || "Pending"}</p>
                </div>
                <div className="rounded-2xl border border-gray-100 bg-white p-5">
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Order total</p>
                  <p className="mt-2 text-base font-semibold text-dark">
                    {order.grandTotal != null ? order.grandTotal : "Not available"}
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-gray-100 bg-white p-5">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Delivery address</p>
                <p className="mt-2 text-sm text-slate-700">{formatAddress(order.deliveryAddress)}</p>
              </div>
            </div>
          )}

          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <NavLink to="/order-history">
              <CustomButton variant="primary" size="sm" radius="full">
                View order history
              </CustomButton>
            </NavLink>
            <NavLink to="/cart">
              <CustomButton variant="outline" size="sm" radius="full">
                View cart
              </CustomButton>
            </NavLink>
          </div>
        </div>
      </MainContainer>
    </SectionContainer>
  );
}
