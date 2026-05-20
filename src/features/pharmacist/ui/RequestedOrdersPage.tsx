import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Icons } from "../../../shared/icons/Icons";
import CustomButton from "../../../shared/button/CustomButton";
import MainContainer from "../../../shared/main-container/MainContainer";
import SectionContainer from "../../../shared/section-container/SectionContainer";
import api from "../../../utilities/api";

// ─── Types ───────────────────────────────────────────────────────────────────

type OrderStatus = "pending" | "confirmed" | "cancelled";

interface RequestOrder {
  _id?: string;
  prescriptionFile?: string;
  prescriptionUrl?: string;
  fullName?: string;
  phone?: string;
  email?: string;
  deliveryAddress?: string;
  city?: string;
  country?: string;
  deliveryNotes?: string;
  user?: { userId?: string; name?: string; email?: string; phone?: string };
  address?: {
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    postcode?: string;
    country?: string;
  } | null;
  medicines?: Array<{
    medicineId?: string;
    name?: string;
    quantity?: number;
    price?: number;
    salePrice?: number;
  }>;
  items?: Array<{
    name?: string;
    quantity?: number;
    notes?: string;
    imageUrl?: string | null;
    price?: number | null;
  }>;
  notes?: string;
  status?: OrderStatus;
  createdAt?: string;
  updatedAt?: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface RequestOrdersResponse {
  items: RequestOrder[];
  pagination: Pagination;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const STATUS_OPTIONS: OrderStatus[] = [
  "pending",
  "confirmed",
  "cancelled",
];

const STATUS_STYLES: Record<OrderStatus, { bg: string; text: string; dot: string }> = {
  pending:    { bg: "bg-amber-50 border-amber-200",   text: "text-amber-700",  dot: "bg-amber-400"  },
  confirmed:  { bg: "bg-blue-50 border-blue-200",     text: "text-blue-700",   dot: "bg-blue-500"   },
  cancelled:  { bg: "bg-red-50 border-red-200",       text: "text-red-700",    dot: "bg-red-400"    },
};

const fallbackStyle = { bg: "bg-gray-50 border-gray-200", text: "text-gray-700", dot: "bg-gray-400" };

const getStatusStyle = (status?: string) =>
  STATUS_STYLES[(status as OrderStatus) ?? ""] ?? fallbackStyle;

const formatDateTime = (value?: string | null) => {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-BD", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
};

const calcTotal = (items?: Array<{ price?: number | null; salePrice?: number | null; quantity?: number }>) =>
  (items ?? []).reduce(
    (sum, m) => sum + (m.salePrice ?? m.price ?? 0) * (m.quantity ?? 1),
    0
  );

const getOrderItems = (order: RequestOrder) => order.items ?? order.medicines ?? [];

const getPrescriptionUrl = (order: RequestOrder) => order.prescriptionUrl ?? order.prescriptionFile;

const getCustomerName = (order: RequestOrder) =>
  order.fullName ?? order.user?.name ?? order.email ?? order.user?.email ?? "Unknown";

const getDeliveryText = (order: RequestOrder) =>
  order.deliveryAddress
    ? [order.deliveryAddress, order.city, order.country].filter(Boolean).join(", ")
    : [order.address?.line1, order.address?.city, order.address?.country].filter(Boolean).join(", ");

// ─── API ─────────────────────────────────────────────────────────────────────

const fetchRequestOrders = async (
  page: number,
  limit: number,
  status?: string
): Promise<RequestOrdersResponse> => {
  const res = await api.get("/request-orders", { params: { page, limit, status } });
  const d = res.data?.data ?? res.data;
  const items: RequestOrder[] = Array.isArray(d)
    ? d
    : Array.isArray(d?.items)
    ? d.items
    : Array.isArray(d?.rows)
    ? d.rows
    : [];
  const pagination: Pagination = d?.pagination ?? d?.meta ?? {
    total: items.length,
    page,
    limit,
    totalPages: Math.ceil((d?.total ?? items.length) / limit),
  };
  return { items, pagination };
};

const updateOrderStatus = async (id: string, status: OrderStatus) => {
  const res = await api.patch(`/request-orders/${id}`, { status });
  return res.data;
};

// ─── Status Badge ─────────────────────────────────────────────────────────────

// ─── Inline Status Dropdown ───────────────────────────────────────────────────

function StatusDropdown({
  orderId,
  current,
  onSuccess,
}: {
  orderId: string;
  current?: OrderStatus;
  onSuccess: () => void;
}) {
  const [value, setValue] = useState<OrderStatus>(current ?? "pending");
  const [saving, setSaving] = useState(false);

  const handleChange = async (next: OrderStatus) => {
    setValue(next);
    setSaving(true);
    try {
      await updateOrderStatus(orderId, next);
      onSuccess();
    } catch {
      setValue(current ?? "pending");
    } finally {
      setSaving(false);
    }
  };

  const s = getStatusStyle(value);

  return (
    <div className="relative">
      <select
        value={value}
        disabled={saving}
        onChange={(e) => handleChange(e.target.value as OrderStatus)}
        className={`appearance-none cursor-pointer rounded-full border pl-8 pr-6 py-1 text-xs font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-offset-1 ${s.bg} ${s.text} ${saving ? "opacity-60" : ""}`}
        style={{ WebkitAppearance: "none" }}
      >
        {STATUS_OPTIONS.map((opt) => (
          <option key={opt} value={opt}>
            {opt.charAt(0).toUpperCase() + opt.slice(1)}
          </option>
        ))}
      </select>
      {/* Dot indicator */}
      <span
        className={`pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-1.5 w-1.5 rounded-full ${s.dot}`}
      />
      {/* Chevron */}
      <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-current opacity-60">
        {saving ? (
          <svg className="h-3 w-3 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="30 70" />
          </svg>
        ) : (
          <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M6 9l6 6 6-6" />
          </svg>
        )}
      </span>
    </div>
  );
}

// ─── Order Detail Modal ───────────────────────────────────────────────────────

function OrderDetailModal({
  order,
  onClose,
  onStatusChange,
}: {
  order: RequestOrder;
  onClose: () => void;
  onStatusChange: () => void;
}) {
  const id = order._id ?? "-";
  const items = getOrderItems(order);
  const total = calcTotal(items);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      {/* Panel */}
      <div
        className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between gap-4 rounded-t-3xl bg-white/90 backdrop-blur-md border-b border-gray-100 px-6 py-4">
          <div>
            <p className="text-xs text-slate-500 font-medium">Request Order</p>
            <p className="font-mono text-sm font-black text-dark break-all">{id}</p>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
            aria-label="Close"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-6 py-5 space-y-6">
          {/* Status row */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-700">Order Status</span>
            <StatusDropdown
              orderId={id}
              current={order.status}
              onSuccess={onStatusChange}
            />
          </div>

          {/* Prescription image */}
          {order.prescriptionFile && (
            <div>
              <p className="mb-2 text-sm font-semibold text-slate-700">Prescription</p>
              <button
                onClick={() => window.open(order.prescriptionFile, "_blank")}
                className="group relative w-full overflow-hidden rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 p-3 text-left transition-all hover:border-primary hover:bg-primary/5"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                    <svg className="h-6 w-6 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="M9 12h6M9 16h4M14 3H6a2 2 0 00-2 2v14a2 2 0 002 2h12a2 2 0 002-2V8z" />
                      <polyline points="14 3 14 8 19 8" />
                    </svg>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-dark group-hover:text-primary transition-colors">
                      View Prescription Image
                    </p>
                    <p className="truncate text-xs text-slate-400 mt-0.5">Opens in new tab</p>
                  </div>
                  <svg className="h-4 w-4 text-slate-400 group-hover:text-primary transition-colors shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" />
                  </svg>
                </div>
              </button>
            </div>
          )}

          {/* Customer info */}
          <div className="rounded-2xl bg-gray-50 p-4 space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">Customer</p>
            <InfoRow label="Name"  value={order.user?.name ?? "—"} />
            <InfoRow label="Email" value={order.user?.email ?? "—"} />
            <InfoRow label="Phone" value={order.user?.phone ?? "—"} />
            <InfoRow label="Placed" value={formatDateTime(order.createdAt)} />
          </div>

          {/* Delivery address */}
          {order.address && (
            <div className="rounded-2xl bg-gray-50 p-4 space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">Delivery Address</p>
              <InfoRow label="Line 1"    value={order.address.line1 ?? "—"} />
              {order.address.line2 && <InfoRow label="Line 2" value={order.address.line2} />}
              <InfoRow label="City"     value={order.address.city ?? "—"} />
              <InfoRow label="State"    value={order.address.state ?? "—"} />
              <InfoRow label="Postcode" value={order.address.postcode ?? "—"} />
              <InfoRow label="Country"  value={order.address.country ?? "—"} />
            </div>
          )}

          {/* Medicines */}
          {(order.medicines?.length ?? 0) > 0 && (
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                Medicines ({order.medicines!.length})
              </p>
              <div className="rounded-2xl border border-gray-100 overflow-hidden">
                {order.medicines!.map((med, i) => (
                  <div
                    key={med.medicineId ?? i}
                    className="flex items-center justify-between gap-3 px-4 py-3 border-b border-gray-50 last:border-0 bg-white"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-dark truncate">{med.name ?? "Unknown"}</p>
                      <p className="text-xs text-slate-400 mt-0.5">Qty: {med.quantity ?? 1}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-black text-dark">
                        ৳{((med.salePrice ?? med.price ?? 0) * (med.quantity ?? 1)).toFixed(2)}
                      </p>
                      {med.salePrice && med.price && med.salePrice < med.price && (
                        <p className="text-xs text-slate-400 line-through">৳{med.price.toFixed(2)}</p>
                      )}
                    </div>
                  </div>
                ))}
                <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-t border-gray-100">
                  <p className="text-sm font-semibold text-slate-600">Total</p>
                  <p className="text-base font-black text-dark">৳{total.toFixed(2)}</p>
                </div>
              </div>
            </div>
          )}

          {/* Notes */}
          {order.notes && (
            <div className="rounded-2xl bg-amber-50 border border-amber-100 p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-amber-600 mb-2">Notes</p>
              <p className="text-sm text-slate-700 leading-relaxed">{order.notes}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 rounded-b-3xl border-t border-gray-100 bg-white/90 backdrop-blur-md px-6 py-4 flex justify-end gap-3">
          {order.prescriptionFile && (
            <CustomButton
              variant="outline"
              size="sm"
              radius="full"
              onClick={() => window.open(order.prescriptionFile, "_blank")}
            >
              Open Prescription
            </CustomButton>
          )}
          <CustomButton variant="primary" size="sm" radius="full" onClick={onClose}>
            Done
          </CustomButton>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 py-1">
      <span className="text-xs text-slate-500 shrink-0">{label}</span>
      <span className="text-xs font-semibold text-dark text-right break-all">{value}</span>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function RequestOrdersPage() {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [selectedOrder, setSelectedOrder] = useState<RequestOrder | null>(null);

  const queryClient = useQueryClient();

  const { data, isLoading, isError, error } = useQuery<RequestOrdersResponse, Error>({
    queryKey: ["request-orders", page, limit, statusFilter],
    queryFn: () => fetchRequestOrders(page, limit, statusFilter),
  });

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["request-orders"] });

  const orders: RequestOrder[] = data?.items ?? [];
  const pagination: Pagination = data?.pagination ?? {
    total: orders.length,
    page,
    limit,
    totalPages: 1,
  };

  return (
    <>
      <SectionContainer>
        <MainContainer>
          {/* Page header */}
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black text-dark">Request Orders</h1>
              <p className="mt-1 text-sm text-slate-600">
                Manage all incoming request-based orders.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <select
                value={statusFilter ?? ""}
                onChange={(e) => {
                  setStatusFilter(e.target.value || undefined);
                  setPage(1);
                }}
                className="rounded-lg px-3 py-2 border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                <option value="">All statuses</option>
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* States */}
          {isLoading ? (
            <div className="mx-auto max-w-3xl rounded-2xl border border-gray-100 bg-white p-8 text-center">
              <Icons.Loading className="!h-8 !w-8 mx-auto animate-spin text-primary" />
              <p className="mt-4 text-slate-600">Loading request orders…</p>
            </div>
          ) : isError ? (
            <div className="mx-auto max-w-3xl rounded-2xl border border-red-100 bg-red-50 p-6 text-center">
              <p className="font-semibold text-red-700">Unable to load request orders</p>
              <p className="mt-2 text-sm text-red-600">
                {String((error as any)?.message ?? error)}
              </p>
            </div>
          ) : orders.length === 0 ? (
            <div className="mx-auto max-w-2xl rounded-2xl border border-gray-100 bg-white p-6 text-center">
              <Icons.Prescription className="!h-8 !w-8 mx-auto text-primary" />
              <h2 className="mt-4 text-xl font-black">No request orders</h2>
              <p className="mt-2 text-sm text-slate-600">
                No orders matched the selected filter.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => {
                const id = order._id ?? "-";
                const orderItems = getOrderItems(order);
                const prescriptionUrl = getPrescriptionUrl(order);
                const meds = orderItems.length;
                const userName = getCustomerName(order);
                const total = calcTotal(orderItems);

                return (
                  <div
                    key={id}
                    className="group rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
                  >
                    <div className="flex items-start justify-between gap-4">
                      {/* Left — order info (clickable → modal) */}
                      <button
                        className="min-w-0 flex-1 text-left"
                        onClick={() => setSelectedOrder(order)}
                      >
                        <p className="text-xs text-slate-500">Order ID</p>
                        <p className="mt-1 break-all font-mono text-sm font-black text-dark group-hover:text-primary transition-colors">
                          {id}
                        </p>
                        <p className="mt-2 text-xs text-slate-500">
                          {userName} •{" "}
                          {formatDateTime(order.createdAt)}
                        </p>

                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          <span className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-semibold text-slate-700">
                            {meds} item{meds === 1 ? "" : "s"}
                          </span>
                          {total > 0 && (
                            <span className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-semibold text-slate-700">
                              ৳{total.toFixed(2)}
                            </span>
                          )}
                          {prescriptionUrl && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                window.open(prescriptionUrl, "_blank");
                              }}
                              className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary hover:bg-primary/10 transition-colors"
                            >
                              <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M9 12h6M9 16h4M14 3H6a2 2 0 00-2 2v14a2 2 0 002 2h12a2 2 0 002-2V8z" />
                                <polyline points="14 3 14 8 19 8" />
                              </svg>
                              Prescription
                            </button>
                          )}
                        </div>
                      </button>

                      {/* Right — status dropdown */}
                      <div className="flex flex-col items-end gap-3 shrink-0">
                        <StatusDropdown
                          orderId={id}
                          current={order.status}
                          onSuccess={invalidate}
                        />
                        <div className="flex gap-2">
                          <CustomButton
                            variant="outline"
                            size="sm"
                            radius="full"
                            onClick={() => setSelectedOrder(order)}
                          >
                            View Details
                          </CustomButton>
                        </div>
                      </div>
                    </div>

                    {/* Delivery snippet */}
                    {getDeliveryText(order) && (
                      <div className="mt-4 border-t border-gray-50 pt-4">
                        <p className="text-xs text-slate-400 mb-1 font-medium">Delivery</p>
                        <p className="text-sm text-slate-700">{getDeliveryText(order)}</p>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Pagination */}
              <div className="flex items-center justify-between pt-2">
                <p className="text-sm text-slate-600">
                  Page {pagination.page} of {pagination.totalPages}
                  <span className="ml-2 text-slate-400">
                    ({pagination.total} total)
                  </span>
                </p>
                <div className="flex gap-2">
                  <CustomButton
                    variant="outline"
                    size="sm"
                    radius="full"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    Prev
                  </CustomButton>
                  <CustomButton
                    variant="primary"
                    size="sm"
                    radius="full"
                    disabled={page >= pagination.totalPages}
                    onClick={() =>
                      setPage((p) => Math.min(pagination.totalPages, p + 1))
                    }
                  >
                    Next
                  </CustomButton>
                </div>
              </div>
            </div>
          )}
        </MainContainer>
      </SectionContainer>

      {/* Order detail modal */}
      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onStatusChange={() => {
            invalidate();
            setSelectedOrder(null);
          }}
        />
      )}
    </>
  );
}
