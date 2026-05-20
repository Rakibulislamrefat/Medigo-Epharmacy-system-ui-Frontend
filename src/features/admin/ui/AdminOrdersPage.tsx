import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getAdminOrders, updateAdminOrderStatus } from "../service/adminApi";
import { Icons } from "../../../shared/icons/Icons";
import toast from "react-hot-toast";

const formatDate = (v?: string) => {
  if (!v) return "";
  const d = new Date(v);
  return Number.isNaN(d.getTime())
    ? v
    : d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};

const formatPrice = (v?: number) => {
  if (!v) return "৳0.00";
  return `৳${v.toFixed(2)}`;
};

const getStatusColor = (status?: string) => {
  switch (status) {
    case "pending":
      return { bg: "bg-yellow-50", text: "text-yellow-700", border: "border-yellow-200" };
    case "confirmed":
      return { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" };
    case "processing":
      return { bg: "bg-indigo-50", text: "text-indigo-700", border: "border-indigo-200" };
    case "shipped":
      return { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200" };
    case "delivered":
      return { bg: "bg-green-50", text: "text-green-700", border: "border-green-200" };
    case "cancelled":
      return { bg: "bg-gray-50", text: "text-gray-700", border: "border-gray-200" };
    case "refunded":
      return { bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-200" };
    default:
      return { bg: "bg-gray-50", text: "text-gray-700", border: "border-gray-200" };
  }
};

const getPaymentColor = (status?: string) => {
  switch (status) {
    case "paid":
      return { bg: "bg-green-50", text: "text-green-700", border: "border-green-200" };
    case "unpaid":
      return { bg: "bg-red-50", text: "text-red-700", border: "border-red-200" };
    case "failed":
      return { bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-200" };
    case "refunded":
      return { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200" };
    default:
      return { bg: "bg-gray-50", text: "text-gray-700", border: "border-gray-200" };
  }
};

export default function AdminOrdersPage() {
  const qc = useQueryClient();
  const [searchText, setSearchText] = useState("");
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  useEffect(() => {
    const t = window.setTimeout(() => {
      setQ(searchText.trim());
      setPage(1);
    }, 400);
    return () => window.clearTimeout(t);
  }, [searchText]);

  const { data: paged, isLoading, error } = useQuery({
    queryKey: ["admin", "orders", { q, statusFilter, paymentFilter, page, limit }],
    queryFn: () =>
      getAdminOrders({
        q: q || undefined,
        status: statusFilter || undefined,
        paymentStatus: paymentFilter || undefined,
        page,
        limit,
      }),
    retry: 1,
  });

  const items = paged?.items ?? [];
  const meta = paged?.meta ?? { page: 1, limit, total: 0, totalPages: 1 };

  const statusOptions = useMemo(
    () => ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled", "refunded"],
    [],
  );
  const paymentOptions = useMemo(() => ["unpaid", "paid", "failed", "refunded"], []);

  const statusMutation = useMutation({
    mutationFn: (args: { id: string; status: string }) =>
      updateAdminOrderStatus(args.id, args.status),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["admin", "orders"] });
    },
  });

  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-dark">Orders</h1>
        <p className="text-sm text-slate-500 mt-1">Track and manage all customer orders.</p>
      </div>

      {isLoading && (
        <div className="rounded-2xl border border-gray-100 bg-white p-8 animate-pulse h-64" />
      )}

      {!isLoading && (error || !paged) && (
        <div className="rounded-2xl border border-red-100 bg-red-50 p-6">
          <div className="flex items-center gap-3">
            <Icons.AlertCircle className="!w-5 !h-5 text-red-600" />
            <div>
              <p className="text-sm font-semibold text-red-700">Failed to load orders</p>
              <p className="text-xs text-red-600 mt-1">Try refreshing the page or check your connection.</p>
            </div>
          </div>
        </div>
      )}

      {!isLoading && paged && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-gray-100 bg-white overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-dark">All orders</p>
                <p className="text-xs text-slate-500 mt-0.5">{meta.total} total orders</p>
              </div>
              <span className="text-xs font-black bg-primary/10 text-primary px-3 py-1.5 rounded-full">
                {meta.total}
              </span>
            </div>

            <div className="px-6 py-4 border-b border-gray-100">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <input
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  className="h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                  placeholder="Search order number..."
                />
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setPage(1);
                  }}
                  className="h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                >
                  <option value="">All statuses</option>
                  {statusOptions.map((s) => (
                    <option key={s} value={s}>
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </option>
                  ))}
                </select>
                <select
                  value={paymentFilter}
                  onChange={(e) => {
                    setPaymentFilter(e.target.value);
                    setPage(1);
                  }}
                  className="h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                >
                  <option value="">All payments</option>
                  {paymentOptions.map((s) => (
                    <option key={s} value={s}>
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </option>
                  ))}
                </select>
                <select
                  value={limit}
                  onChange={(e) => {
                    setLimit(Number(e.target.value));
                    setPage(1);
                  }}
                  className="h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                >
                  <option value={10}>10 per page</option>
                  <option value={20}>20 per page</option>
                  <option value={50}>50 per page</option>
                </select>
              </div>
            </div>

            {items.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <Icons.Cart className="!w-12 !h-12 mx-auto text-gray-300 mb-3" />
                <p className="text-sm font-semibold text-dark">No orders found</p>
                <p className="text-xs text-slate-500 mt-1">Try adjusting your search filters</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {items.map((order, index) => {
                  const statusColor = getStatusColor(order.status);
                  const paymentColor = getPaymentColor(order.paymentStatus);
                  const orderKey = order._id ?? order.orderNumber ?? String(index);
                  const isExpanded = expandedOrder === orderKey;

                  return (
                    <div
                      key={orderKey}
                      className="bg-white hover:bg-gray-50/50 transition-colors"
                    >
                      <button
                        type="button"
                        onClick={() => setExpandedOrder(isExpanded ? null : orderKey)}
                        className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50"
                      >
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10">
                            <Icons.Cart className="!w-5 !h-5 text-primary" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-dark truncate">
                              {order.orderNumber ?? (order._id ? order._id.slice(-8).toUpperCase() : "Unknown")}
                            </p>
                            <p className="text-xs text-slate-500 mt-0.5">
                              {formatDate(order.createdAt)}
                            </p>
                          </div>
                        </div>

                        <div className="hidden sm:flex items-center gap-3 flex-1 justify-center px-4">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${statusColor.bg} ${statusColor.text} ${statusColor.border}`}
                          >
                            {order.status?.charAt(0).toUpperCase() + (order.status?.slice(1) || "")}
                          </span>
                        </div>

                        <div className="hidden lg:flex items-center gap-3 flex-1 justify-center px-4">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${paymentColor.bg} ${paymentColor.text} ${paymentColor.border}`}
                          >
                            {order.paymentStatus?.charAt(0).toUpperCase() + (order.paymentStatus?.slice(1) || "")}
                          </span>
                        </div>

                        <div className="hidden md:flex items-center justify-end flex-1 px-4">
                          <p className="text-sm font-semibold text-dark">
                            {formatPrice(order.grandTotal)}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <Icons.ArrowForward
                            className={`!w-4 !h-4 text-slate-400 transition-transform ${
                              isExpanded ? "rotate-90" : "rotate-0"
                            }`}
                          />
                        </div>
                      </button>

                      {isExpanded && (
                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                              <p className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">
                                Order Status
                              </p>
                              <div className="mt-3 space-y-2 flex flex-wrap gap-2">
                                {statusOptions.map((s) => {
                                  const sColor = getStatusColor(s);
                                  const isActive = order.status === s;
                                  return (
                                    <button
                                      key={s}
                                      type="button"
                                      disabled={statusMutation.status === "pending"}
                                      onClick={async () => {
                                        const t = toast.loading("Updating status...");
                                        try {
                                          await statusMutation.mutateAsync({ id: order._id, status: s });
                                          toast.success("Status updated", { id: t });
                                        } catch (err) {
                                          toast.error("Failed to update status", { id: t });
                                        }
                                      }}
                                      className={`inline-flex items-center px-3 py-2 rounded-lg text-xs font-semibold border transition ${
                                        isActive
                                          ? `${sColor.bg} ${sColor.text} ${sColor.border} ring-2 ring-offset-2 ring-${s === "delivered" ? "green" : s === "pending" ? "yellow" : "primary"}-400`
                                          : "border-gray-200 bg-white text-slate-600 hover:bg-gray-50"
                                      } disabled:opacity-50`}
                                    >
                                      {s.charAt(0).toUpperCase() + s.slice(1)}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>

                            <div>
                              <p className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">
                                Payment Status
                              </p>
                              <div className="mt-3 space-y-2 flex flex-wrap gap-2">
                                {paymentOptions.map((p) => {
                                  const pColor = getPaymentColor(p);
                                  const isActive = order.paymentStatus === p;
                                  return (
                                    <span
                                      key={p}
                                      className={`inline-flex items-center px-3 py-2 rounded-lg text-xs font-semibold border ${
                                        isActive
                                          ? `${pColor.bg} ${pColor.text} ${pColor.border} ring-2 ring-offset-2 ring-${p === "paid" ? "green" : p === "unpaid" ? "red" : "orange"}-400`
                                          : "border-gray-200 bg-white text-slate-600"
                                      }`}
                                    >
                                      {p.charAt(0).toUpperCase() + p.slice(1)}
                                    </span>
                                  );
                                })}
                              </div>
                            </div>
                          </div>

                          <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                              <p className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">
                                Order Total
                              </p>
                              <p className="text-lg font-black text-dark mt-1">
                                {formatPrice(order.grandTotal)}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">
                                Order Date
                              </p>
                              <p className="text-sm font-semibold text-dark mt-1">
                                {formatDate(order.createdAt)}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">
                                Order ID
                              </p>
                              <p className="text-sm font-mono text-slate-600 mt-1 truncate">
                                {order._id}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            <div className="px-6 py-4 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="text-sm text-slate-600">
                {meta.total === 0
                  ? "No results"
                  : (() => {
                      const start = (page - 1) * limit + 1;
                      const end = Math.min(meta.total, page * limit);
                      return `Showing ${start}-${end} of ${meta.total}`;
                    })()}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="h-10 px-4 rounded-lg border border-gray-200 bg-white text-sm font-semibold hover:bg-gray-50 disabled:opacity-60 transition"
                >
                  ← Prev
                </button>
                <span className="text-sm font-semibold text-slate-700">
                  {page} / {meta.totalPages}
                </span>
                <button
                  type="button"
                  disabled={page >= meta.totalPages}
                  onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
                  className="h-10 px-4 rounded-lg border border-gray-200 bg-white text-sm font-semibold hover:bg-gray-50 disabled:opacity-60 transition"
                >
                  Next →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
