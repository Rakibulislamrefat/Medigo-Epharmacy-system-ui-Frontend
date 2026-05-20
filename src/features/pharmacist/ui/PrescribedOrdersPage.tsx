import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Icons } from "../../../shared/icons/Icons";
import CustomButton from "../../../shared/button/CustomButton";
import MainContainer from "../../../shared/main-container/MainContainer";
import SectionContainer from "../../../shared/section-container/SectionContainer";
import api from "../../../utilities/api";

interface PrescriptionOrder {
  _id?: string;
  prescriptionFile?: string;
  user?: { userId?: string; name?: string; email?: string; phone?: string };
  address?: { line1?: string; line2?: string; city?: string; state?: string; postcode?: string; country?: string } | null;
  medicines?: Array<{ medicineId?: string; name?: string; quantity?: number; price?: number; salePrice?: number }>;
  notes?: string;
  status?: string;
  createdAt?: string;
}

interface PrescribedOrdersPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface PrescribedOrdersResponse {
  items: PrescriptionOrder[];
  pagination: PrescribedOrdersPagination;
}

const ORDER_STATUS_OPTIONS = ["pending", "confirmed", "processing", "delivered", "cancelled"] as const;

type OrderStatusOption = (typeof ORDER_STATUS_OPTIONS)[number];

const parseOrderStatus = (value: string): OrderStatusOption | undefined => {
  return ORDER_STATUS_OPTIONS.includes(value as OrderStatusOption) ? (value as OrderStatusOption) : undefined;
};

const formatDateTime = (value?: string | null) => {
  if (!value) return "Pending";
  return new Intl.DateTimeFormat("en-BD", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
};

const fetchPrescribedOrders = async (page: number, limit: number, status?: string, user?: string) => {
  const res = await api.get("/prescription-orders", { params: { page, limit, status, user } });
  const d = res.data?.data ?? res.data;
  const items = Array.isArray(d) ? d : Array.isArray(d?.items) ? d.items : Array.isArray(d?.rows) ? d.rows : [];
  const pagination = d?.pagination ?? d?.meta ?? { total: items.length, page, limit, totalPages: Math.ceil((d?.total ?? items.length) / limit) };
  return { items, pagination };
};

const updatePrescriptionOrderStatus = async (id: string, status: OrderStatusOption) => {
  const res = await api.patch(`/prescription-orders/${encodeURIComponent(id)}`, { status });
  return res.data;
};

export default function PrescribedOrdersPage() {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [statusFilter, setStatusFilter] = useState<OrderStatusOption | undefined>(undefined);
  const [statusDrafts, setStatusDrafts] = useState<Record<string, OrderStatusOption | undefined>>({});
  const [savingOrderId, setSavingOrderId] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<PrescriptionOrder | null>(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const queryClient = useQueryClient();

  const { data, isLoading, isError, error } = useQuery<PrescribedOrdersResponse, Error>({
    queryKey: ["pharmacist-prescribed-orders", page, limit, statusFilter],
    queryFn: () => fetchPrescribedOrders(page, limit, statusFilter),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: OrderStatusOption }) => updatePrescriptionOrderStatus(id, status),
    onSuccess: async (_data, variables) => {
      setStatusDrafts((prev) => {
        const next = { ...prev };
        delete next[variables.id];
        return next;
      });
      setSelectedOrder((current) => current?._id === variables.id ? { ...current, status: variables.status } : current);
      await queryClient.invalidateQueries({ queryKey: ["pharmacist-prescribed-orders"] });
      toast.success("Prescription order status updated");
    },
    onError: (err) => {
      const message = (err as any)?.response?.data?.message ?? "Unable to update prescription order status";
      toast.error(message);
    },
    onSettled: () => {
      setSavingOrderId(null);
    },
  });

  const orders: PrescriptionOrder[] = data?.items ?? [];
  const pagination: PrescribedOrdersPagination = data?.pagination ?? { total: orders.length, page, limit, totalPages: 1 };

  const handleOpenOrder = (order: PrescriptionOrder) => {
    setSelectedOrder(order);
    setShowOrderModal(true);
  };

  const handleCloseOrder = () => {
    setShowOrderModal(false);
    setSelectedOrder(null);
  };

  const handleFilterStatus = (status?: OrderStatusOption) => {
    setStatusFilter(status);
    setPage(1);
  };

  const handleDraftStatus = (id: string, status?: OrderStatusOption) => {
    setStatusDrafts((prev) => ({ ...prev, [id]: status }));
    setSelectedOrder((current) => current?._id === id ? { ...current, status } : current);
  };

  const handleSaveStatus = (id: string, status?: OrderStatusOption) => {
    if (!status) {
      toast.error("Please choose a valid status");
      return;
    }
    setSavingOrderId(id);
    updateStatusMutation.mutate({ id, status });
  };

  return (
    <SectionContainer>
      <MainContainer>
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-dark">Prescribed Orders</h1>
            <p className="mt-1 text-sm text-slate-600">Orders created from verified prescriptions (admin view).</p>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={statusFilter ?? ""}
              onChange={(e) => handleFilterStatus(parseOrderStatus(e.target.value))}
              className="rounded px-3 py-2 border"
            >
              <option value="">All status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="processing">Processing</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <CustomButton variant="primary" size="sm" radius="xs" onClick={() => setPage(1)}>
              Apply
            </CustomButton>
          </div>
        </div>

        {isLoading ? (
          <div className="mx-auto max-w-3xl rounded-2xl border border-gray-100 bg-white p-8 text-center">
            <Icons.Loading className="!h-8 !w-8 mx-auto animate-spin text-primary" />
            <p className="mt-4 text-slate-600">Loading prescribed orders...</p>
          </div>
        ) : isError ? (
          <div className="mx-auto max-w-3xl rounded-2xl border border-red-100 bg-red-50 p-6 text-center">
            <p className="font-semibold text-red-700">Unable to load prescribed orders</p>
            <p className="mt-2 text-sm text-red-600">{String((error as any)?.message || error)}</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="mx-auto max-w-2xl rounded-2xl border border-gray-100 bg-white p-6 text-center">
            <Icons.Prescription className="!h-8 !w-8 mx-auto text-primary" />
            <h2 className="mt-4 text-xl font-black">No prescription orders</h2>
            <p className="mt-2 text-sm text-slate-600">No prescription-based orders were found.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const id = order._id ?? "-";
              const meds = order.medicines?.length ?? 0;
              const userName = order.user?.name ?? order.user?.email ?? "Unknown";
              const currentStatus = parseOrderStatus(order.status ?? "");
              const draftStatus = id in statusDrafts ? statusDrafts[id] : currentStatus;
              const hasStatusChange = Boolean(draftStatus && draftStatus !== currentStatus);
              const isSavingStatus = savingOrderId === id && updateStatusMutation.isPending;

              return (
                <div
                  key={id}
                  onClick={() => handleOpenOrder(order)}
                  className="cursor-pointer rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="min-w-0">
                      <p className="text-xs text-slate-500">Order ID</p>
                      <p className="mt-1 break-all font-mono text-sm font-black text-dark">{id}</p>
                      <p className="mt-2 text-xs text-slate-500">{userName} • {formatDateTime(order.createdAt)}</p>
                    </div>

                    <div className="flex flex-col items-start gap-3 sm:items-end">
                      <div className="flex flex-wrap items-center gap-2">
                        <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Status</label>
                        <select
                          value={draftStatus ?? ""}
                          onChange={(e) => {
                            e.stopPropagation();
                            handleDraftStatus(id, parseOrderStatus(e.target.value));
                          }}
                          onClick={(e) => e.stopPropagation()}
                          className="rounded border border-slate-200 bg-white px-3 py-1 text-sm text-slate-700"
                        >
                          <option value="">Unknown</option>
                          {ORDER_STATUS_OPTIONS.map((status) => (
                            <option key={status} value={status}>
                              {status.charAt(0).toUpperCase() + status.slice(1)}
                            </option>
                          ))}
                        </select>
                        <span className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-semibold text-slate-700">{meds} item{meds === 1 ? "" : "s"}</span>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); handleOpenOrder(order); }}
                          className="inline-flex"
                        >
                          <CustomButton variant="outline" size="sm" radius="full">View</CustomButton>
                        </button>
                        {hasStatusChange && (
                          <CustomButton
                            variant="primary"
                            size="sm"
                            radius="full"
                            disabled={isSavingStatus}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSaveStatus(id, draftStatus);
                            }}
                          >
                            {isSavingStatus ? "Saving..." : "Save"}
                          </CustomButton>
                        )}
                      </div>
                    </div>
                  </div>

                  {order.address && (
                    <div className="mt-4 text-sm text-slate-700">
                      <p className="font-semibold">Delivery</p>
                      <p className="mt-1">{[order.address.line1, order.address.city, order.address.country].filter(Boolean).join(", ")}</p>
                    </div>
                  )}
                </div>
              );
            })}

            <div className="flex items-center justify-between">
              <div className="text-sm text-slate-600">Page {pagination.page} of {pagination.totalPages}</div>
              <div className="flex gap-2">
                <CustomButton variant="outline" size="sm" radius="full" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p-1))}>Prev</CustomButton>
                <CustomButton variant="primary" size="sm" radius="full" disabled={page >= pagination.totalPages} onClick={() => setPage((p) => Math.min(pagination.totalPages, p+1))}>Next</CustomButton>
              </div>
            </div>
          </div>
        )}

        {showOrderModal && selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/70 px-4 py-8">
            <div className="w-full max-w-4xl rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="text-2xl font-black text-slate-900">Order details</h2>
                  <p className="mt-1 text-sm text-slate-600">Full information for the selected prescription order.</p>
                </div>
                <button type="button" onClick={handleCloseOrder} className="rounded-full border border-slate-200 bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-200">
                  Close
                </button>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="space-y-2 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Order ID</p>
                  <p className="font-semibold text-slate-900 break-all">{selectedOrder._id ?? "-"}</p>
                </div>
                <div className="space-y-2 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Submitted</p>
                  <p className="font-semibold text-slate-900">{formatDateTime(selectedOrder.createdAt)}</p>
                </div>
                <div className="space-y-2 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Status</p>
                  {(() => {
                    const id = selectedOrder._id ?? "-";
                    const currentStatus = parseOrderStatus(orders.find((order) => order._id === id)?.status ?? selectedOrder.status ?? "");
                    const draftStatus = id in statusDrafts ? statusDrafts[id] : parseOrderStatus(selectedOrder.status ?? "");
                    const hasStatusChange = Boolean(draftStatus && draftStatus !== currentStatus);
                    const isSavingStatus = savingOrderId === id && updateStatusMutation.isPending;

                    return (
                      <div className="flex flex-col gap-3">
                  <select
                    value={draftStatus ?? ""}
                    onChange={(e) => handleDraftStatus(id, parseOrderStatus(e.target.value))}
                    className="w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
                  >
                    <option value="">Unknown</option>
                    {ORDER_STATUS_OPTIONS.map((status) => (
                      <option key={status} value={status}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </option>
                    ))}
                  </select>
                        {hasStatusChange && (
                          <CustomButton
                            variant="primary"
                            size="sm"
                            radius="full"
                            disabled={isSavingStatus}
                            onClick={() => handleSaveStatus(id, draftStatus)}
                          >
                            {isSavingStatus ? "Saving..." : "Save status"}
                          </CustomButton>
                        )}
                      </div>
                    );
                  })()}
                </div>
                <div className="space-y-2 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Customer</p>
                  <p className="font-semibold text-slate-900">{selectedOrder.user?.name ?? selectedOrder.user?.email ?? "Unknown"}</p>
                  {selectedOrder.user?.phone && <p className="text-sm text-slate-600">{selectedOrder.user.phone}</p>}
                </div>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <p className="text-sm font-semibold text-slate-700">Delivery address</p>
                  <p className="mt-2 text-sm text-slate-600">{[selectedOrder.address?.line1, selectedOrder.address?.line2, selectedOrder.address?.city, selectedOrder.address?.state, selectedOrder.address?.postcode, selectedOrder.address?.country].filter(Boolean).join(", ") || "Not available"}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <p className="text-sm font-semibold text-slate-700">Notes</p>
                  <p className="mt-2 min-h-[54px] text-sm text-slate-600">{selectedOrder.notes || "No notes provided."}</p>
                </div>
              </div>

              <div className="mt-6">
                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm font-semibold text-slate-700">Prescribed medicines</p>
                  <p className="text-sm text-slate-500">{selectedOrder.medicines?.length ?? 0} items</p>
                </div>
                <div className="mt-3 space-y-3">
                  {(selectedOrder.medicines ?? []).map((medicine, index) => (
                    <div key={`${medicine.medicineId}-${index}`} className="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-[1fr_auto]">
                      <div>
                        <p className="font-semibold text-slate-900">{medicine.name || "Unknown medicine"}</p>
                        <p className="mt-1 text-sm text-slate-600">Qty: {medicine.quantity ?? 0}</p>
                      </div>
                      <p className="text-right text-sm font-semibold text-slate-900">৳ {(medicine.salePrice ?? medicine.price ?? 0).toLocaleString("en-BD")}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-700">Prescription image</p>
                  {selectedOrder.prescriptionFile ? (
                    <a href={selectedOrder.prescriptionFile} target="_blank" rel="noreferrer">
                      <CustomButton variant="outline" size="sm" radius="full">Open prescription</CustomButton>
                    </a>
                  ) : null}
                </div>
                {selectedOrder.prescriptionFile ? (
                  <div className="mt-4 rounded-3xl border border-slate-200 bg-white p-4">
                    <img src={selectedOrder.prescriptionFile} alt="Prescription" className="h-[360px] w-full rounded-2xl object-contain" />
                  </div>
                ) : (
                  <p className="mt-4 text-sm text-slate-500">No prescription image is available for this order.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </MainContainer>
    </SectionContainer>
  );
}
