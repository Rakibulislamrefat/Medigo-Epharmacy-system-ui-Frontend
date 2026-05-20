import axios from "axios";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import { Icons } from "../../../shared/icons/Icons";
import CustomButton from "../../../shared/button/CustomButton";
import MainContainer from "../../../shared/main-container/MainContainer";
import SectionContainer from "../../../shared/section-container/SectionContainer";
import type { RootState } from "../../../redux/store";
import api from "../../../utilities/api";
import { getFrontendConfig } from "../../../config/frontend";
import {
  initiatePrescriptionSslcommerzPayment,
  selectPrescriptionCashOnDelivery,
  type PaymentCustomerInfo,
} from "../../payment/service/paymentApi";

interface PrescriptionOrderMedicine {
  medicineId?: string;
  name?: string;
  quantity?: number;
  price?: number;
  salePrice?: number;
}

interface PrescriptionOrder {
  _id?: string;
  prescriptionFile?: string;
  user?: { userId?: string; name?: string; email?: string; phone?: string };
  address?: { line1?: string; line2?: string; city?: string; state?: string; postcode?: string; country?: string } | null;
  medicines?: PrescriptionOrderMedicine[];
  notes?: string;
  status?: string;
  paymentMethod?: string;
  paymentStatus?: string;
  grandTotal?: number;
  createdAt?: string;
}

const formatDateTime = (value?: string | null) => {
  if (!value) return "Pending";
  return new Intl.DateTimeFormat("en-BD", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
};

const getOrderGrandTotal = (order: PrescriptionOrder) => {
  if ((order as any).grandTotal != null) return (order as any).grandTotal as number;
  if (Array.isArray(order.medicines) && order.medicines.length) {
    return order.medicines.reduce((sum, m) => {
      const qty = Number(m.quantity ?? 0) || 0;
      const price = typeof m.salePrice === "number" ? m.salePrice : typeof m.price === "number" ? m.price : 0;
      return sum + price * qty;
    }, 0);
  }
  return 0;
};

const getApiErrorMessage = (error: unknown, fallback: string) => {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message ?? fallback;
  }

  return error instanceof Error ? error.message : fallback;
};

const fetchPrescribedOrders = async (): Promise<PrescriptionOrder[]> => {
  try {
    const res = await api.get("/prescription-orders/my");
    const data = res.data?.data ?? res.data;
    if (Array.isArray(data)) return data;
    if (Array.isArray((data as any).items)) return (data as any).items;
    if (Array.isArray((data as any).rows)) return (data as any).rows;
    return [];
  } catch (err) {
    if (axios.isAxiosError(err) && err.response?.status === 404) return [];
    throw err;
  }
};

const toPaymentCustomerInfo = (order: PrescriptionOrder): PaymentCustomerInfo => ({
  name: order.user?.name,
  email: order.user?.email,
  phone: order.user?.phone,
  address: order.address?.line1,
  city: order.address?.city,
  postcode: order.address?.postcode,
  country: order.address?.country || "Bangladesh",
});

export default function PrescribedHistoryPage() {
  const user = useSelector((s: RootState) => s.user.user);
  const queryClient = useQueryClient();
  const [startingPayment, setStartingPayment] = useState<{ id: string; method: "cod" | "online" } | null>(null);
  const isSslcommerzEnabled = getFrontendConfig().features.sslcommerz;

  const { data: orders = [], isLoading, isError, error } = useQuery({
    queryKey: ["prescribed-orders"],
    queryFn: fetchPrescribedOrders,
    enabled: Boolean(user),
    retry: false,
  });

  const codPaymentMutation = useMutation({
    mutationFn: selectPrescriptionCashOnDelivery,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["prescribed-orders"] });
      toast.success("Cash on delivery selected for this order.");
    },
    onError: (err) => {
      const message = (err as any)?.response?.data?.message ?? "Unable to select cash on delivery.";
      toast.error(message);
    },
    onSettled: () => {
      setStartingPayment(null);
    },
  });

  const handleCashOnDelivery = (order: PrescriptionOrder) => {
    const id = order._id;
    if (!id) {
      toast.error("Order ID is missing.");
      return;
    }

    setStartingPayment({ id, method: "cod" });
    codPaymentMutation.mutate(id);
  };

  const handleOnlinePayment = async (order: PrescriptionOrder) => {
    const id = order._id;
    if (!id) {
      toast.error("Order ID is missing.");
      return;
    }

    if (!isSslcommerzEnabled) {
      toast.error("Online payment is unavailable right now.");
      return;
    }

    const toastId = toast.loading("Opening secure payment page...");
    setStartingPayment({ id, method: "online" });

    try {
      const payment = await initiatePrescriptionSslcommerzPayment(id, toPaymentCustomerInfo(order));
      if (!payment.paymentUrl) throw new Error("Payment URL was not returned.");
      window.location.href = payment.paymentUrl;
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Unable to start online payment. Please try again."), { id: toastId });
      setStartingPayment(null);
    }
  };

  return (
    <SectionContainer>
      <MainContainer>
        <div className="mb-8">
          <h1 className="text-3xl font-black text-dark">My Prescribed Orders</h1>
          <p className="mt-2 text-slate-600">View orders created from your uploaded prescriptions.</p>
        </div>

        {!user ? (
          <div className="mx-auto max-w-2xl rounded-2xl border border-gray-100 bg-white p-6 text-center shadow-sm sm:p-8">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Icons.AlertCircle className="!h-7 !w-7" />
            </div>
            <h2 className="mt-5 text-2xl font-black text-dark">Sign in to view orders</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-slate-600">Please sign in to see your prescribed orders.</p>
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
            <p className="mt-4 text-slate-600">Loading your prescribed orders...</p>
          </div>
        ) : isError ? (
          <div className="mx-auto max-w-4xl rounded-2xl border border-red-100 bg-red-50 p-6 text-center shadow-sm">
            <p className="font-semibold text-red-700">Unable to load prescribed orders</p>
            <p className="mt-2 text-sm text-red-600">{String(error) || "Please try again later."}</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="mx-auto max-w-2xl rounded-2xl border border-gray-100 bg-white p-6 text-center shadow-sm sm:p-8">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Icons.Prescription className="!h-7 !w-7" />
            </div>
            <h2 className="mt-5 text-2xl font-black text-dark">No prescribed orders yet</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-slate-600">You haven't received any prescription orders yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const id = order._id ?? "unknown";
              const meds = order.medicines?.length ?? 0;
              const total = getOrderGrandTotal(order);
              const orderStatus = order.status?.toLowerCase();
              const paymentStatus = order.paymentStatus?.toLowerCase();
              const showPaymentOptions = orderStatus === "confirmed" && paymentStatus !== "paid";
              const isCodStarting = startingPayment?.id === id && startingPayment.method === "cod";
              const isOnlineStarting = startingPayment?.id === id && startingPayment.method === "online";

              return (
                <div key={id} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-500">Order ID</p>
                      <p className="mt-1 break-all font-mono text-sm font-black text-dark">{id}</p>
                      <p className="mt-2 text-xs text-slate-500">Submitted {formatDateTime(order.createdAt)}</p>
                    </div>
                    <div className="text-right">
                      <p className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${order.status ? "text-slate-700" : "text-slate-500"}`}>
                        {order.status ?? "unknown"}
                      </p>
                      <p className="mt-3 text-lg font-black text-primary">৳ {total.toLocaleString("en-BD")}</p>
                    </div>
                  </div>

                  {order.paymentStatus && (
                    <p className="mt-4 text-xs font-semibold text-slate-500">
                      Payment: {order.paymentStatus}
                    </p>
                  )}

                  {showPaymentOptions && (
                    <div className="mt-5 rounded-2xl border border-primary/15 bg-primary/5 p-4">
                      <p className="text-sm font-black text-dark">Choose payment option</p>
                      <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                        <CustomButton
                          variant="outline"
                          size="sm"
                          radius="full"
                          disabled={Boolean(startingPayment)}
                          loading={isCodStarting}
                          onClick={() => handleCashOnDelivery(order)}
                        >
                          Cash on delivery
                        </CustomButton>
                        <CustomButton
                          variant="primary"
                          size="sm"
                          radius="full"
                          disabled={Boolean(startingPayment) || !isSslcommerzEnabled}
                          loading={isOnlineStarting}
                          onClick={() => void handleOnlinePayment(order)}
                        >
                          Online payment
                        </CustomButton>
                      </div>
                    </div>
                  )}

                  <div className="mt-4 flex gap-3">
                    <span className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-4 py-2 text-sm font-semibold text-slate-700">
                      {meds} item{meds === 1 ? "" : "s"}
                    </span>
                    <NavLink to={`/prescription/history?track=${encodeURIComponent(id)}`} className="inline-flex">
                      <CustomButton variant="outline" size="sm" radius="full">Track</CustomButton>
                    </NavLink>
                    {order.prescriptionFile && (
                      <a href={order.prescriptionFile} target="_blank" rel="noreferrer">
                        <CustomButton variant="outline" size="sm" radius="full">View prescription</CustomButton>
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </MainContainer>
    </SectionContainer>
  );
}
