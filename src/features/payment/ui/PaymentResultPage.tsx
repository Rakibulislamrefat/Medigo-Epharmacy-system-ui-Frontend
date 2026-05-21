import { useEffect, useMemo, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import CustomButton from "../../../shared/button/CustomButton";
import { Icons } from "../../../shared/icons/Icons";
import MainContainer from "../../../shared/main-container/MainContainer";
import SectionContainer from "../../../shared/section-container/SectionContainer";
import {
  validateSslcommerzPayment,
  sendRequestOrderInvoice,
  type PaymentValidation,
} from "../service/paymentApi";

type PaymentResultPageProps = {
  mode: "success" | "failed" | "cancelled";
};

const getTitle = (mode: PaymentResultPageProps["mode"]) => {
  if (mode === "success") return "Payment Status";
  if (mode === "failed") return "Payment Failed";
  return "Payment Cancelled";
};

const getMessage = (mode: PaymentResultPageProps["mode"]) => {
  if (mode === "success") return "We are confirming your SSLCommerz payment with the server.";
  if (mode === "failed") return "SSLCommerz returned a failed payment response.";
  return "The SSLCommerz payment session was cancelled before completion.";
};

const statusClass = (status?: string) => {
  switch (status) {
    case "success":
    case "paid":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case "failed":
      return "border-red-200 bg-red-50 text-red-700";
    case "initiated":
    case "unpaid":
      return "border-amber-200 bg-amber-50 text-amber-700";
    default:
      return "border-gray-200 bg-gray-50 text-slate-700";
  }
};

export default function PaymentResultPage({ mode }: PaymentResultPageProps) {
  const location = useLocation();
  const transactionId = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get("tran_id") || params.get("transactionId") || params.get("transaction_id");
  }, [location.search]);

  const [result, setResult] = useState<PaymentValidation | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(mode === "success");
  const [invoiceSent, setInvoiceSent] = useState(false);

  useEffect(() => {
    if (mode !== "success") return;

    if (!transactionId) {
      setError("Missing transaction id from SSLCommerz callback.");
      setLoading(false);
      return;
    }

    let mounted = true;
    const validate = async () => {
      try {
        const data = await validateSslcommerzPayment(transactionId);
        if (mounted) setResult(data);
      } catch {
        if (mounted) setError("Could not validate this payment right now.");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    void validate();

    return () => {
      mounted = false;
    };
  }, [mode, transactionId]);

  useEffect(() => {
    if (!result?.order?._id || invoiceSent) return;

    const paymentSuccess =
      result.transaction?.status === "success" ||
      result.order.paymentStatus === "paid" ||
      result.order.paymentStatus === "success";

    if (!paymentSuccess) return;

    let mounted = true;
    const sendInvoice = async () => {
      try {
        await sendRequestOrderInvoice(result.order!._id);
        if (mounted) setInvoiceSent(true);
      } catch (error) {
        console.error("Could not send invoice after payment", error);
      }
    };

    void sendInvoice();

    return () => {
      mounted = false;
    };
  }, [invoiceSent, result]);

  const transactionStatus = result?.transaction?.status;
  const paymentStatus = result?.order?.paymentStatus;
  const orderInfo = result?.order;

  return (
    <SectionContainer>
      <MainContainer>
        <div className="mx-auto max-w-2xl rounded-2xl border border-gray-100 bg-white p-6 text-center shadow-sm sm:p-8">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
            {mode === "success" ? (
              <Icons.Check className="!h-7 !w-7" />
            ) : (
              <Icons.AlertCircle className="!h-7 !w-7" />
            )}
          </div>

          <h1 className="mt-5 text-2xl font-black text-dark">{getTitle(mode)}</h1>
          <p className="mx-auto mt-2 max-w-md text-sm text-slate-600">{getMessage(mode)}</p>

          {loading && (
            <div className="mt-6 rounded-xl border border-gray-100 bg-gray-50 p-4 text-sm font-semibold text-slate-600">
              Validating payment...
            </div>
          )}

          {!loading && error && (
            <div className="mt-6 rounded-xl border border-red-100 bg-red-50 p-4 text-sm font-semibold text-red-700">
              {error}
            </div>
          )}

          {!loading && !error && result && (
            <>
              <div className="mt-6 grid gap-3 text-left sm:grid-cols-2">
                <div className={`rounded-xl border p-4 ${statusClass(transactionStatus)}`}>
                  <p className="text-xs font-black uppercase tracking-[0.18em]">Transaction</p>
                  <p className="mt-2 text-lg font-black capitalize">
                    {transactionStatus || "Unknown"}
                  </p>
                </div>
                <div className={`rounded-xl border p-4 ${statusClass(paymentStatus)}`}>
                  <p className="text-xs font-black uppercase tracking-[0.18em]">Order payment</p>
                  <p className="mt-2 text-lg font-black capitalize">
                    {paymentStatus || "Unknown"}
                  </p>
                </div>
              </div>

              {orderInfo && (
                <div className="mt-4 grid gap-3 text-left sm:grid-cols-2">
                  <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Order ID</p>
                    <p className="mt-2 text-lg font-semibold text-dark break-all">{orderInfo._id || "Unknown"}</p>
                  </div>
                  <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Order number</p>
                    <p className="mt-2 text-lg font-semibold text-dark">
                      {orderInfo.orderNumber || "Not available"}
                    </p>
                  </div>
                  <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Order status</p>
                    <p className="mt-2 text-lg font-semibold text-dark capitalize">
                      {orderInfo.status || orderInfo.paymentStatus || "Unknown"}
                    </p>
                  </div>
                  <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Total amount</p>
                    <p className="mt-2 text-lg font-semibold text-dark">
                      {orderInfo.grandTotal != null ? orderInfo.grandTotal : "Not available"}
                    </p>
                  </div>
                </div>
              )}
            </>
          )}

          {transactionId && (
            <p className="mt-5 break-all text-xs text-slate-500">
              Transaction ID: <span className="font-semibold">{transactionId}</span>
            </p>
          )}

          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <NavLink to="/cart">
              <CustomButton variant="outline" size="sm" radius="full">
                Back to cart
              </CustomButton>
            </NavLink>
            <NavLink to="/">
              <CustomButton variant="primary" size="sm" radius="full">
                Go home
              </CustomButton>
            </NavLink>
          </div>
        </div>
      </MainContainer>
    </SectionContainer>
  );
}
