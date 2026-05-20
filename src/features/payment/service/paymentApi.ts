import axios from "axios";
import api from "../../../utilities/api";
import type { CartItem } from "../../cart/service/cartApi";
import type { CartAddress } from "../../cart/service/addressApi";
import { getFrontendConfig } from "../../../config/frontend";

type ApiEnvelope<T> = {
  data?: T;
};

export type OrderPayload = {
  items: {
    product: string;
    qty: number;
  }[];
  contactName: string;
  contactPhone: string;
  paymentMethod?: "cod" | "sslcommerz";
  deliveryAddress: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postcode: string;
    country: string;
  };
  addressId?: string;
};

export type PaymentOrder = {
  _id: string;
  contactName?: string;
  contactPhone?: string;
  deliveryAddress?: OrderPayload["deliveryAddress"];
  orderNumber?: string;
  status?: string;
  paymentStatus?: string;
  grandTotal?: number;
  createdAt?: string;
  updatedAt?: string;
};

export type PaymentInitiation = {
  paymentUrl: string;
  transactionId?: string;
};

export type PaymentValidation = {
  transaction?: {
    status?: string;
    transactionId?: string;
    tran_id?: string;
  };
  order?: {
    _id?: string;
    orderNumber?: string;
    paymentStatus?: string;
    status?: string;
    grandTotal?: number;
  };
};

export type OrderTrackingStep = {
  status: string;
  completed: boolean;
  current: boolean;
  timestamp: string | null;
};

export type OrderTrackingDetails = {
  orderId: string;
  orderNumber?: string;
  status?: string;
  paymentStatus?: string;
  placedAt?: string;
  lastUpdatedAt?: string;
  estimatedDelivery?: string | null;
  timeline: OrderTrackingStep[];
  deliveryAddress?: OrderPayload["deliveryAddress"];
  contactPhone?: string;
  items?: {
    product?: {
      _id?: string;
      name?: string;
    };
    nameSnapshot?: string;
    unitPrice?: number;
    qty?: number;
    lineTotal?: number;
  }[];
  totals?: {
    subtotal?: number;
    discountTotal?: number;
    deliveryFee?: number;
    grandTotal?: number;
  };
};

const unwrap = <T,>(data: unknown): T => {
  const response = data as ApiEnvelope<T>;
  return response?.data ?? (data as T);
};

const buildTrackingEndpoint = (idOrNumber: string) => {
  const encodedId = encodeURIComponent(idOrNumber);
  const configuredPath = getFrontendConfig().endpoints.orders.tracking;

  if (configuredPath.includes(":idOrNumber")) {
    return configuredPath.replace(":idOrNumber", encodedId);
  }

  return `/orders/${encodedId}/tracking`;
};

export const buildOrderPayloadFromCart = (
  items: CartItem[],
  address: CartAddress,
  paymentMethod?: OrderPayload["paymentMethod"],
): OrderPayload => ({
  items: items.map((item) => ({
    product: item.product._id,
    qty: item.qty,
  })),
  contactName: address.name,
  contactPhone: address.phone,
  paymentMethod,
  addressId: address._id,
  deliveryAddress: {
    line1: address.line1,
    line2: address.line2 || undefined,
    city: address.city,
    state: address.state,
    postcode: address.postcode,
    country: address.country || "Bangladesh",
  },
});

export const createOrder = async (payload: OrderPayload): Promise<PaymentOrder> => {
  const res = await api.post("/orders", payload);
  return unwrap<PaymentOrder>(res.data);
};

export const initiateSslcommerzPayment = async (
  order: PaymentOrder,
): Promise<PaymentInitiation> => {
  const res = await api.post(getFrontendConfig().endpoints.payments.sslcommerzInitiate, {
    orderId: order._id,
    customerInfo: {
      name: order.contactName,
      phone: order.contactPhone,
      address: order.deliveryAddress?.line1,
      city: order.deliveryAddress?.city,
      postcode: order.deliveryAddress?.postcode,
      country: order.deliveryAddress?.country || "Bangladesh",
    },
  });
  return unwrap<PaymentInitiation>(res.data);
};

export const validateSslcommerzPayment = async (
  transactionId: string,
): Promise<PaymentValidation> => {
  const res = await api.get(`/sslcommerz/validate/${transactionId}`);
  return unwrap<PaymentValidation>(res.data);
};

const unwrapArray = <T>(data: unknown): T[] => {
  const payload = (data as { data?: unknown })?.data ?? data;
  
  // Handle paginated response: data.rows (from GET /orders/my)
  if (payload && typeof payload === "object" && "rows" in payload) {
    const rows = (payload as { rows?: unknown }).rows;
    return Array.isArray(rows) ? (rows as T[]) : [];
  }
  
  // Handle direct array or data.items
  const items = Array.isArray(payload)
    ? payload
    : (payload as { items?: unknown })?.items ?? [];

  return Array.isArray(items) ? (items as T[]) : [];
};

const normalizeRegularOrder = (raw: any): PaymentOrder => {
  const o = raw ?? {};
  const _id = o._id as string | undefined;
  const orderNumber = o.orderNumber as string | undefined;
  
  // Map 'total' or 'grandTotal' to grandTotal
  const grandTotal = typeof o.total === "number" ? o.total : 
                     typeof o.grandTotal === "number" ? o.grandTotal : undefined;
  
  const createdAt = o.createdAt;
  const updatedAt = o.updatedAt;
  const contactName = o.contactName ?? o.name;
  const contactPhone = o.contactPhone ?? o.phone;
  
  // Map 'shippingAddress' to 'deliveryAddress'
  const deliveryAddress = o.deliveryAddress ?? o.shippingAddress;
  
  const status = o.status;
  const paymentStatus = o.paymentStatus;

  return {
    _id: String(_id ?? orderNumber ?? `ord_${Math.random().toString(36).slice(2, 9)}`),
    orderNumber,
    grandTotal: typeof grandTotal === "number" ? grandTotal : undefined,
    createdAt,
    updatedAt,
    contactName,
    contactPhone,
    deliveryAddress,
    status,
    paymentStatus,
  } as PaymentOrder;
};

const normalizePrescriptionOrder = (raw: any): PaymentOrder => {
  const o = raw ?? {};
  const _id = (o._id ?? o.id ?? o.prescriptionId ?? o.orderId ?? o.order_id) as string | undefined;
  const orderNumber = (o.orderNumber ?? o.prescriptionNumber ?? o.number ?? o.order_no) as string | undefined;
  const grandTotal =
    typeof o.grandTotal === "number"
      ? o.grandTotal
      : typeof o.total === "number"
      ? o.total
      : (o.totals && (o.totals.grandTotal ?? o.totals.total)) ?? undefined;
  const createdAt = o.createdAt ?? o.created_at ?? o.placedAt ?? o.created;
  const updatedAt = o.updatedAt ?? o.updated_at;
  const contactName = o.contactName ?? o.name ?? o.customer?.name;
  const contactPhone = o.contactPhone ?? o.phone ?? o.customer?.phone;
  const deliveryAddress = o.deliveryAddress ?? o.address ?? o.shippingAddress ?? undefined;
  const status = o.status ?? o.orderStatus ?? o.status_text;
  const paymentStatus = o.paymentStatus ?? o.payment_status ?? o.payment?.status;

  return {
    _id: String(_id ?? orderNumber ?? `presc_${Math.random().toString(36).slice(2, 9)}`),
    orderNumber,
    grandTotal: typeof grandTotal === "number" ? grandTotal : undefined,
    createdAt,
    updatedAt,
    contactName,
    contactPhone,
    deliveryAddress,
    status,
    paymentStatus,
  } as PaymentOrder;
};

const fetchPrescriptionOrders = async (): Promise<PaymentOrder[]> => {
  try {
    const res = await api.get("/prescription-orders/me");
    const raw = unwrapArray<any>(res.data);
    return raw.map(normalizePrescriptionOrder);
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      const fallbackRes = await api.get("/prescription-orders");
      const raw = unwrapArray<any>(fallbackRes.data);
      return raw.map(normalizePrescriptionOrder);
    }

    throw error;
  }
};

export const getMyOrders = async (): Promise<PaymentOrder[]> => {
  const regularOrders = api
    .get("/orders/my")
    .then((res) => {
      const raw = unwrapArray<any>(res.data);
      return raw.map(normalizeRegularOrder);
    });
  
  const prescriptionOrders = fetchPrescriptionOrders();

  const [regularResult, prescriptionResult] = await Promise.allSettled([
    regularOrders,
    prescriptionOrders,
  ]);

  const orders = regularResult.status === "fulfilled" ? regularResult.value : [];
  const prescriptions = prescriptionResult.status === "fulfilled" ? prescriptionResult.value : [];

  if (regularResult.status === "rejected" && prescriptionResult.status === "rejected") {
    const error = regularResult.reason ?? prescriptionResult.reason;
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      const fallbackRes = await api.get("/orders");
      const raw = unwrapArray<any>(fallbackRes.data);
      return [...raw.map(normalizeRegularOrder), ...prescriptions];
    }

    throw error;
  }

  return [...orders, ...prescriptions];
};

export const getOrderTracking = async (
  idOrNumber: string,
): Promise<OrderTrackingDetails> => {
  try {
    const res = await api.get(buildTrackingEndpoint(idOrNumber));
    return unwrap<OrderTrackingDetails>(res.data);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const res = await api.get(
        `/prescription-orders/${encodeURIComponent(idOrNumber)}/tracking`,
      );
      return unwrap<OrderTrackingDetails>(res.data);
    }

    throw error;
  }
};

export const cancelOrder = async (idOrNumber: string): Promise<PaymentOrder> => {
  try {
    const res = await api.patch(`/orders/${encodeURIComponent(idOrNumber)}/cancel`);
    return unwrap<PaymentOrder>(res.data);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const res = await api.patch(
        `/prescription-orders/${encodeURIComponent(idOrNumber)}/cancel`,
      );
      return unwrap<PaymentOrder>(res.data);
    }

    throw error;
  }
};
