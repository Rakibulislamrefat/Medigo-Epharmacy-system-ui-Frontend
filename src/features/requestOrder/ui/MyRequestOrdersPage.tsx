import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import api from "../../../utilities/api";
import MainContainer from "../../../shared/main-container/MainContainer";
import SectionHeading from "../../../shared/section-heading/SectionHeading";
import SectionContainer from "../../../shared/section-container/SectionContainer";
import { Icons } from "../../../shared/icons/Icons";
import {
  initiateRequestOrderSslcommerzPayment,
  selectRequestOrderCashOnDelivery,
  sendRequestOrderInvoice,
  type PaymentCustomerInfo,
} from "../../payment/service/paymentApi";
import type { RootState } from "../../../redux/store";

interface RequestOrderItem {
  _id?: string;
  id?: string;
  userId?: string;
  customerId?: string;
  user?: string | { _id?: string; userId?: string; name?: string; email?: string; phone?: string };
  customer?: string | { _id?: string; userId?: string; name?: string; email?: string; phone?: string };
  fullName?: string;
  phone?: string;
  email?: string;
  items?: { name: string; quantity: number; price?: number | null }[];
  medicines?: { name: string; quantity: number; price?: number | null }[];
  notes?: string;
  status?: string;
  paymentMethod?: string;
  paymentStatus?: string;
  createdAt?: string;
  isRare?: boolean;
  rare?: boolean;
}

const normalize = (value?: string | null) => value?.trim().toLowerCase() ?? "";

const getNestedString = (value: unknown, keys: string[]) => {
  if (!value || typeof value !== "object") return "";
  const record = value as Record<string, unknown>;
  for (const key of keys) {
    const item = record[key];
    if (typeof item === "string") return item;
  }
  return "";
};

const getOwnerId = (order: RequestOrderItem) =>
  [
    order.userId,
    order.customerId,
    typeof order.user === "string" ? order.user : getNestedString(order.user, ["_id", "userId"]),
    typeof order.customer === "string" ? order.customer : getNestedString(order.customer, ["_id", "userId"]),
  ]
    .map((value) => normalize(value))
    .find(Boolean) ?? "";

const getOwnerEmail = (order: RequestOrderItem) =>
  normalize(
    order.email ??
      (typeof order.user === "object" ? order.user?.email : undefined) ??
      (typeof order.customer === "object" ? order.customer?.email : undefined),
  );

const isOwnRequest = (order: RequestOrderItem, user?: RootState["user"]["user"]) => {
  if (!user) return false;
  const currentUserId = normalize(user._id);
  const currentEmail = normalize(user.email);
  const ownerId = getOwnerId(order);
  const ownerEmail = getOwnerEmail(order);

  return (!!currentUserId && ownerId === currentUserId) || (!!currentEmail && ownerEmail === currentEmail);
};

const fetchMyRequests = async (page = 1, limit = 20) => {
  const res = await api.get("/request-orders/user/all", { params: { page, limit } });
  const payload = res.data?.data ?? res.data;
  const items = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.items)
    ? payload.items
    : Array.isArray(payload?.rows)
    ? payload.rows
    : [];
  return { items, pagination: payload?.pagination ?? payload?.meta ?? { total: items.length, page, limit, totalPages: Math.ceil((payload?.total ?? items.length) / limit) } };
};

const getPaymentLabel = (method?: string) => {
  if (!method) return "Not selected";
  return method === "sslcommerz"
    ? "Online payment (SSLCommerz)"
    : method === "cod"
    ? "Cash on delivery"
    : method;
};

const getRequestOrderItems = (order: RequestOrderItem) => order.items ?? order.medicines ?? [];

const getOrderTotal = (items?: { name?: string; quantity?: number; price?: number | null }[]) =>
  (items ?? []).reduce((sum, item) => sum + (item.price ?? 0) * (item.quantity ?? 1), 0);

const getOrderContactInfo = (order: RequestOrderItem): PaymentCustomerInfo => ({
  name:
    order.fullName ??
    (typeof order.user === "object" ? order.user?.name : undefined) ??
    (typeof order.customer === "object" ? order.customer?.name : undefined),
  email:
    order.email ??
    (typeof order.user === "object" ? order.user?.email : undefined) ??
    (typeof order.customer === "object" ? order.customer?.email : undefined),
  phone:
    order.phone ??
    (typeof order.user === "object" ? order.user?.phone : undefined) ??
    (typeof order.customer === "object" ? order.customer?.phone : undefined),
});

const getRequestOrderPaymentPayload = (order: RequestOrderItem) => {
  const items = getRequestOrderItems(order);
  return {
    orderId: order._id ?? order.id,
    status: order.status,
    pharmacistNotes: order.notes,
    customerInfo: getOrderContactInfo(order),
    items,
    totalAmount: getOrderTotal(items),
  };
};

const hasOrderPricing = (items?: { name?: string; quantity?: number; price?: number | null }[]) =>
  !!items?.some((item) => (item.price ?? 0) > 0);

const isReadyForPayment = (order: RequestOrderItem) =>
  order.status === "confirmed" ||
  hasOrderPricing(getRequestOrderItems(order));

export default function MyRequestOrdersPage() {
  const [page] = useState(1);
  const [settingPaymentFor, setSettingPaymentFor] = useState<string | null>(null);
  const user = useSelector((state: RootState) => state.user.user);
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["my-request-orders", page, user?._id, user?.email],
    queryFn: () => fetchMyRequests(page, 20),
    enabled: !!user,
  });
  const requestItems: RequestOrderItem[] = Array.isArray(data)
    ? data
    : data?.items ?? [];
  const items = requestItems.filter((order) => isOwnRequest(order, user));

  const updatePaymentMethod = async (orderId: string, method: "cod" | "sslcommerz", order?: RequestOrderItem) => {
    setSettingPaymentFor(orderId);
    const payload = getRequestOrderPaymentPayload(order ?? ({} as RequestOrderItem));

    try {
      if (method === "sslcommerz") {
        const payment = await initiateRequestOrderSslcommerzPayment(orderId, payload);

        if (payment.paymentUrl) {
          window.location.assign(payment.paymentUrl);
          return;
        }

        toast.error("Unable to open the payment gateway. Please try again.");
        return;
      }

      if (method === "cod") {
        await selectRequestOrderCashOnDelivery(orderId, payload);
        await sendRequestOrderInvoice(orderId, payload);
        toast.success("Cash on delivery selected and invoice email sent.");
      }

      await queryClient.invalidateQueries({ queryKey: ["my-request-orders"] });
    } catch (err) {
      console.error("Unable to set payment method", err);
      toast.error("Unable to process payment method. Please try again.");
    } finally {
      setSettingPaymentFor(null);
    }
  };

  return (
    <SectionContainer>
      <MainContainer>
        <div className="max-w-4xl">
          <SectionHeading
            title="My Request Orders"
            description="Your requested medicines and their status."
            align="left"
          />

          <div className="mt-6">
            {isLoading ? (
              <p className="text-sm text-slate-500">Loading…</p>
            ) : items.length === 0 ? (
              <div className="rounded-xl border border-gray-100 p-6 text-center">
                <Icons.Prescription className="!w-10 !h-10 text-primary mx-auto" />
                <p className="mt-4 text-lg font-bold text-slate-800">No request orders</p>
                <p className="mt-2 text-sm text-slate-500">You haven't requested any medicines yet.</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {items.map((o) => (
                  <div key={o._id ?? o.id ?? Math.random().toString()} className="rounded-xl border border-gray-100 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-bold">{o.fullName ?? "You"}</div>
                        <div className="text-xs text-slate-500">{o.email ?? o.phone}</div>
                      </div>
                      <div className="text-sm font-semibold text-slate-700">{o.status ?? "pending"}</div>
                    </div>

                    <div className="mt-3 text-sm text-slate-700">
                      <div className="font-semibold">Items:</div>
                      <ul className="list-disc pl-5 mt-1">
                        {getRequestOrderItems(o).map((it, i) => (
                          <li key={i}>{it.name} — Qty {it.quantity}</li>
                        ))}
                      </ul>
                      {(o.isRare || o.rare) && <div className="mt-2 text-xs text-danger font-semibold">Marked as rare (not available locally)</div>}
                      {getRequestOrderItems(o).length ? (
                        <div className="mt-2 text-xs text-slate-500">
                          Total: ৳{getOrderTotal(getRequestOrderItems(o)).toFixed(2)}
                        </div>
                      ) : null}
                      {o.paymentMethod ? (
                        <div className="mt-2 text-xs text-slate-600 font-semibold">
                          Payment: {getPaymentLabel(o.paymentMethod)}{o.paymentStatus ? ` • ${o.paymentStatus}` : ""}
                        </div>
                      ) : isReadyForPayment(o) ? (
                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          <span className="text-xs font-semibold text-slate-600">Choose payment method:</span>
                          <button
                            type="button"
                            disabled={settingPaymentFor === (o._id ?? o.id ?? "")}
                            onClick={() => updatePaymentMethod(o._id ?? o.id ?? "", "cod", o)}
                            className="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-gray-50 transition"
                          >
                            Cash on delivery
                          </button>
                          <button
                            type="button"
                            disabled={settingPaymentFor === (o._id ?? o.id ?? "")}
                            onClick={() => updatePaymentMethod(o._id ?? o.id ?? "", "sslcommerz", o)}
                            className="rounded-full border border-primary bg-primary/10 px-3 py-1 text-xs font-semibold text-primary hover:bg-primary/20 transition"
                          >
                            Pay online (SSLCommerz)
                          </button>
                        </div>
                      ) : (
                        <div className="mt-2 text-xs text-slate-400">Waiting for pharmacist availability and pricing.</div>
                      )}
                      <div className="mt-2 text-xs text-slate-400">Requested {o.createdAt ?? "—"}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </MainContainer>
    </SectionContainer>
  );
}
