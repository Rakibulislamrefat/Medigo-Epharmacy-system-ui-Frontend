import api from "../../../utilities/api";
import type { CartItem } from "../../cart/service/cartApi";
import type { CartAddress } from "../../cart/service/addressApi";

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

const unwrap = <T,>(data: unknown): T => {
  const response = data as ApiEnvelope<T>;
  return response?.data ?? (data as T);
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
  const res = await api.post("/sslcommerz/initiate", {
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
