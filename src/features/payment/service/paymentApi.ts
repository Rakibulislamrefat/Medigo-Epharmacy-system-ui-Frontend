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
  const items = Array.isArray(payload)
    ? payload
    : (payload as { items?: unknown })?.items ?? [];

  return Array.isArray(items) ? (items as T[]) : [];
};

export const getMyOrders = async (): Promise<PaymentOrder[]> => {
  try {
    const res = await api.get("/orders/me");
    return unwrapArray<PaymentOrder>(res.data);
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      const fallbackRes = await api.get("/orders");
      return unwrapArray<PaymentOrder>(fallbackRes.data);
    }

    throw error;
  }
};

export const getOrderTracking = async (
  idOrNumber: string,
): Promise<OrderTrackingDetails> => {
  const res = await api.get(buildTrackingEndpoint(idOrNumber));
  return unwrap<OrderTrackingDetails>(res.data);
};
