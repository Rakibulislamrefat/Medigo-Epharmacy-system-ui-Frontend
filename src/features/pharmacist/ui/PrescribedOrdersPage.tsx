import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import MainContainer from "../../../shared/main-container/MainContainer";
import {
  getPrescribedOrders,
  getPrescribedOrderDetails,
  updateOrderStatus,
  generateInvoice,
  type FulfilledOrder,
} from "../service/pharmacistService";
import { Icons } from "../../../shared/icons/Icons";
import CustomButton from "../../../shared/button/CustomButton";

export default function PrescribedOrdersPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedId = searchParams.get("id");

  const [orders, setOrders] = useState<FulfilledOrder[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<FulfilledOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("pending_pickup");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const data = await getPrescribedOrders({ status: statusFilter });
        setOrders(data.data);
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
          const data = await getPrescribedOrderDetails(selectedId);
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
          <h1 className="text-3xl font-bold text-slate-900">Prescribed Orders</h1>
          <p className="mt-2 text-slate-600">Prepare and fulfill verified orders</p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          {(["pending_pickup", "picked", "packed", "ready_for_delivery", "delivered"] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                statusFilter === status
                  ? "bg-primary text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              {status.replace("_", " ").toUpperCase()}
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
                onOrderUpdated={(updated) => setSelectedOrder(updated)}
                loading={detailsLoading}
              />
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 p-8 h-[600px] flex items-center justify-center">
                <div className="text-center">
                  <Icons.Cart className="w-12 h-12 text-slate-300 mx-auto mb-3" />
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
  order: FulfilledOrder;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const statusColors: Record<string, string> = {
    pending_pickup: "bg-yellow-100 text-yellow-800",
    picked: "bg-blue-100 text-blue-800",
    packed: "bg-purple-100 text-purple-800",
    ready_for_delivery: "bg-green-100 text-green-800",
    delivered: "bg-slate-100 text-slate-800",
  };

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
              {order.status.replace("_", " ")}
            </span>
            <span className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded">
              ${order.totalAmount.toFixed(2)}
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
  order: FulfilledOrder;
  onOrderUpdated: (updated: FulfilledOrder) => void;
  loading: boolean;
}) {
  const [updating, setUpdating] = useState(false);
  const [generatingInvoice, setGeneratingInvoice] = useState(false);

  const statusOptions: Array<FulfilledOrder["status"]> = [
    "pending_pickup",
    "picked",
    "packed",
    "ready_for_delivery",
    "delivered",
  ];

  const statusColors: Record<string, string> = {
    pending_pickup: "bg-yellow-100 text-yellow-800",
    picked: "bg-blue-100 text-blue-800",
    packed: "bg-purple-100 text-purple-800",
    ready_for_delivery: "bg-green-100 text-green-800",
    delivered: "bg-slate-100 text-slate-800",
  };

  const currentStatusIndex = statusOptions.indexOf(order.status);

  const handleStatusUpdate = async (newStatus: FulfilledOrder["status"]) => {
    try {
      setUpdating(true);
      const updated = await updateOrderStatus(order._id, newStatus);
      onOrderUpdated(updated);
      toast.success(`Order marked as ${newStatus.replace("_", " ")}`);
    } catch (err) {
      toast.error("Failed to update status");
    } finally {
      setUpdating(false);
    }
  };

  const handleGenerateInvoice = async () => {
    try {
      setGeneratingInvoice(true);
      const result = await generateInvoice(order._id);
      window.open(result.invoiceUrl, "_blank");
      toast.success("Invoice generated");
    } catch (err) {
      toast.error("Failed to generate invoice");
    } finally {
      setGeneratingInvoice(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Status Progress */}
      <div className="rounded-2xl border border-slate-200 p-4">
        <h3 className="font-semibold text-slate-900 mb-4">Order Status</h3>
        <div className="flex items-center gap-2">
          {statusOptions.map((status, idx) => (
            <div key={status} className="flex items-center">
              <button
                onClick={() => handleStatusUpdate(status)}
                disabled={updating || idx <= currentStatusIndex}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition ${
                  idx <= currentStatusIndex
                    ? `${statusColors[status]} cursor-pointer`
                    : "bg-slate-200 text-slate-400 cursor-not-allowed"
                }`}
                title={status.replace("_", " ")}
              >
                {idx + 1}
              </button>
              {idx < statusOptions.length - 1 && (
                <div
                  className={`w-8 h-0.5 ${
                    idx < currentStatusIndex ? "bg-primary" : "bg-slate-300"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
        <p className="text-sm text-slate-600 mt-4">
          Current: <span className="font-medium">{order.status.replace("_", " ").toUpperCase()}</span>
        </p>
      </div>

      {/* Order Summary */}
      <div className="rounded-2xl border border-slate-200 p-4">
        <h3 className="font-semibold text-slate-900 mb-3">Order Summary</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-600">Order ID</span>
            <span className="font-mono text-xs">{order._id}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">Total Amount</span>
            <span className="font-semibold text-lg">${order.totalAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">Created</span>
            <span>{new Date(order.createdAt).toLocaleString()}</span>
          </div>
        </div>
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
            <span className="text-slate-600">Delivery Address</span>
            <span className="font-medium text-right">{order.deliveryAddress}</span>
          </div>
        </div>
      </div>

      {/* Medicines */}
      <div className="rounded-2xl border border-slate-200 p-4">
        <h3 className="font-semibold text-slate-900 mb-3">Medicines</h3>
        <div className="space-y-2">
          {order.medicines.map((med, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div className="flex-1">
                <p className="font-medium text-slate-900">{med.name}</p>
                <p className="text-xs text-slate-500">{med.dosage}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">{med.quantity}x</p>
                {med.price && <p className="text-xs text-slate-500">${(med.price * med.quantity).toFixed(2)}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <CustomButton
          variant="primary"
          onClick={handleGenerateInvoice}
          loading={generatingInvoice}
          disabled={generatingInvoice}
          className="flex-1"
        >
          <Icons.Prescription className="w-4 h-4" />
          Generate Invoice
        </CustomButton>
        {currentStatusIndex < statusOptions.length - 1 && (
          <CustomButton
            variant="primary"
            onClick={() => handleStatusUpdate(statusOptions[currentStatusIndex + 1])}
            loading={updating}
            disabled={updating}
            className="flex-1"
          >
            <Icons.Shield className="w-4 h-4" />
            Next Status
          </CustomButton>
        )}
      </div>
    </div>
  );
}
