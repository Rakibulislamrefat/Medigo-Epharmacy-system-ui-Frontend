import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import MainContainer from "../../../shared/main-container/MainContainer";
import {
  getRequestedOrders,
  getRequestedOrderDetails,
  verifyPrescriptionOrder,
  rejectPrescriptionOrder,
  type PrescriptionOrder,
  type Medicine,
} from "../service/pharmacistService";
import { Icons } from "../../../shared/icons/Icons";
import CustomButton from "../../../shared/button/CustomButton";
import { updateLocalPharmacistOrder } from "../service/pharmacistStorage";

const orderStatuses = ["all", "pending_ocr", "pending_verification", "verified", "rejected"] as const;
type OrderStatusFilter = (typeof orderStatuses)[number];

export default function RequestedOrdersPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedId = searchParams.get("id");

  const [orders, setOrders] = useState<PrescriptionOrder[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<PrescriptionOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<OrderStatusFilter>("pending_verification");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const data = await getRequestedOrders(
          statusFilter === "all" ? undefined : { status: statusFilter },
        );
        const fetchedOrders = Array.isArray(data?.data) ? data.data : [];
        setOrders(fetchedOrders);
      } catch (err) {
        toast.error("Failed to load orders");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [statusFilter]);

  useEffect(() => {
    if (selectedId) {
      const fetchDetails = async () => {
        try {
          setDetailsLoading(true);
          const data = await getRequestedOrderDetails(selectedId);
          setSelectedOrder(data);
        } catch (err) {
          toast.error("Failed to load order details");
        } finally {
          setDetailsLoading(false);
        }
      };

      fetchDetails();
    }
  }, [selectedId]);

  return (
    <MainContainer>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Requested Orders</h1>
          <p className="mt-2 text-slate-600">Review and verify prescription orders</p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          {orderStatuses.map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                statusFilter === status
                  ? "bg-primary text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              {status.replace(/_/g, " ").toUpperCase()}
            </button>
          ))}
        </div>

        {/* Main Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Orders List */}
          <div className="lg:col-span-1">
            <div className="rounded-2xl border border-slate-200 overflow-hidden h-[600px] flex flex-col">
              <div className="p-4 border-b border-slate-200 bg-slate-50">
                <h3 className="font-semibold text-slate-900">
                  Orders ({orders.length})
                </h3>
              </div>
              <div className="flex-1 overflow-y-auto">
                {loading ? (
                  <div className="p-4 flex items-center justify-center">
                    <Icons.Dashboard className="w-6 h-6 text-primary animate-spin" />
                  </div>
                ) : orders.length > 0 ? (
                  <div className="divide-y">
                    {orders.map((order) => (
                      <OrderListItem
                        key={order._id}
                        order={order}
                        isSelected={selectedOrder?._id === order._id}
                        onSelect={() => setSearchParams({ id: order._id })}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-slate-500">
                    No orders found
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Order Details */}
          <div className="lg:col-span-2">
            {selectedOrder ? (
              <OrderDetails
                order={selectedOrder}
                onOrderUpdated={(updated) => {
                  setSelectedOrder(updated);
                  setOrders((prev) =>
                    prev.map((item) => (item._id === updated._id ? updated : item)),
                  );
                }}
                loading={detailsLoading}
              />
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 p-8 h-[600px] flex items-center justify-center">
                <div className="text-center">
                  <Icons.Prescription className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500">Select an order to view details</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainContainer>
  );
}

function OrderListItem({
  order,
  isSelected,
  onSelect,
}: {
  order: PrescriptionOrder;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const statusColors: Record<string, string> = {
    pending_verification: "bg-yellow-100 text-yellow-800",
    verified: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
    pending_ocr: "bg-blue-100 text-blue-800",
  };
  const suggestedCount = Array.isArray(order?.suggestedMedicines) ? order.suggestedMedicines.length : 0;

  return (
    <button
      onClick={onSelect}
      className={`w-full p-4 text-left hover:bg-slate-50 transition border-l-4 ${
        isSelected ? "border-primary bg-primary/5" : "border-transparent"
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="font-semibold text-slate-900 text-sm">{order.customerName}</p>
          <p className="text-xs text-slate-500 mt-1">{order.customerPhone}</p>
          <div className="mt-2 flex gap-2">
            <span className={`text-xs px-2 py-1 rounded font-medium ${statusColors[order.status]}`}>
              {order.status.replace(/_/g, " ")}
            </span>
            <span className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded">
              {suggestedCount} meds
            </span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-500">
            {new Date(order.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>
    </button>
  );
}

function OrderDetails({
  order,
  onOrderUpdated,
  loading,
}: {
  order: PrescriptionOrder;
  onOrderUpdated: (updated: PrescriptionOrder) => void;
  loading: boolean;
}) {
  const [medicines, setMedicines] = useState<Medicine[]>(() => Array.isArray(order?.suggestedMedicines) ? order.suggestedMedicines : []);
  const [notes, setNotes] = useState(order?.pharmacistNotes || "");
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    setMedicines(Array.isArray(order?.suggestedMedicines) ? order.suggestedMedicines : []);
    setNotes(order?.pharmacistNotes || "");
  }, [order]);

  const handleVerify = async () => {
    setVerifying(true);
    try {
      const updated = await verifyPrescriptionOrder(order._id, {
        verifiedMedicines: medicines,
        pharmacistNotes: notes,
      });
      const nextOrder = updated ?? {
        ...order,
        status: "verified" as const,
        pharmacistNotes: notes,
        suggestedMedicines: medicines,
        updatedAt: new Date().toISOString(),
      };
      onOrderUpdated(nextOrder);
      toast.success("Order verified successfully!");
    } catch {
      const fallback = updateLocalPharmacistOrder(order._id, {
        status: "verified",
        pharmacistNotes: notes,
        suggestedMedicines: medicines,
      });
      if (fallback) {
        onOrderUpdated(fallback);
        toast.success("Order verified locally and updated in the pharmacist view.");
      } else {
        toast.error("Failed to verify order");
      }
    } finally {
      setVerifying(false);
    }
  };

  const handleReject = async () => {
    if (!notes.trim()) {
      toast.error("Please provide a reason for rejection");
      return;
    }

    setVerifying(true);
    try {
      const updated = await rejectPrescriptionOrder(order._id, notes);
      const nextOrder = updated ?? {
        ...order,
        status: "rejected" as const,
        pharmacistNotes: notes,
        updatedAt: new Date().toISOString(),
      };
      onOrderUpdated(nextOrder);
      toast.success("Order rejected");
    } catch {
      const fallback = updateLocalPharmacistOrder(order._id, {
        status: "rejected",
        pharmacistNotes: notes,
      });
      if (fallback) {
        onOrderUpdated(fallback);
        toast.success("Order rejected locally and updated in the pharmacist view.");
      } else {
        toast.error("Failed to reject order");
      }
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="space-y-4">
      {loading && (
        <div className="rounded-2xl border border-slate-200 p-4 text-sm text-slate-500">
          Loading latest OCR details...
        </div>
      )}

      {/* Prescription Image */}
      {order.prescriptionImageUrl && (
        <div className="rounded-2xl border border-slate-200 overflow-hidden">
          <img
            src={order.prescriptionImageUrl}
            alt="Prescription"
            className="w-full h-auto max-h-[360px] object-contain bg-slate-50"
          />
        </div>
      )}

      {/* OCR Status */}
      <div className="rounded-2xl border border-slate-200 p-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="font-semibold text-slate-900">OCR Processing</h3>
            <p className="mt-1 text-sm text-slate-600">
              {order.status === "pending_ocr"
                ? "The prescription is uploaded and waiting for text extraction."
                : "OCR output is available for pharmacist review."}
            </p>
          </div>
          <span className="self-start rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase text-slate-700">
            {order.status.replace(/_/g, " ")}
          </span>
        </div>
      </div>

      {/* Extracted OCR Text */}
      <div className="rounded-2xl border border-slate-200 p-4">
        <h3 className="font-semibold text-slate-900 mb-3">Extracted OCR Text</h3>
        {order.extractedText?.trim() ? (
          <pre className="max-h-56 overflow-auto whitespace-pre-wrap rounded-xl bg-slate-50 p-3 text-sm leading-relaxed text-slate-700">
            {order.extractedText}
          </pre>
        ) : (
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
            No OCR text has been returned yet.
          </div>
        )}
      </div>

      {/* Customer Info */}
      <div className="rounded-2xl border border-slate-200 p-4">
        <h3 className="font-semibold text-slate-900 mb-3">Customer Information</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-600">Name</span>
            <span className="font-medium">{order.customerName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">Phone</span>
            <span className="font-medium">{order.customerPhone}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">Email</span>
            <span className="font-medium">{order.customerEmail}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">Delivery Address</span>
            <span className="font-medium text-right">{order.deliveryAddress}</span>
          </div>
        </div>
      </div>

      {/* Extracted Medicines */}
      <div className="rounded-2xl border border-slate-200 p-4">
        <h3 className="font-semibold text-slate-900 mb-3">Suggested Medicines</h3>
        {medicines.length ? (
          <div className="space-y-3">
            {medicines.map((med, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div className="flex-1">
                <p className="font-medium text-slate-900">{med.name}</p>
                <p className="text-xs text-slate-500">{med.dosage}</p>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  value={med.quantity}
                  onChange={(e) => {
                    const updated = [...medicines];
                    updated[idx].quantity = parseInt(e.target.value) || 1;
                    setMedicines(updated);
                  }}
                  className="w-16 px-2 py-1 border border-slate-200 rounded text-sm"
                />
                <span className="text-sm text-slate-600">qty</span>
              </div>
            </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
            No suggested medicines are available yet.
          </div>
        )}
      </div>

      {/* Pharmacist Notes */}
      <div className="rounded-2xl border border-slate-200 p-4">
        <label className="block font-semibold text-slate-900 mb-2">
          Pharmacist Notes
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add verification notes or rejection reason..."
          rows={3}
          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
        />
      </div>

      {/* Actions */}
      {order.status === "pending_verification" && (
        <div className="flex gap-3">
          <CustomButton
            variant="primary"
            onClick={handleVerify}
            loading={verifying}
            disabled={verifying}
            className="flex-1"
          >
            <Icons.Shield className="w-4 h-4" />
            Verify Order
          </CustomButton>
          <CustomButton
            variant="danger"
            onClick={handleReject}
            loading={verifying}
            disabled={verifying}
            className="flex-1"
          >
            <Icons.AlertCircle className="w-4 h-4" />
            Reject Order
          </CustomButton>
        </div>
      )}
    </div>
  );
}
