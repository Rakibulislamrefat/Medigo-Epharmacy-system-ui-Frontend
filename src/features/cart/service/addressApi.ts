import api from "../../../utilities/api";

export type CartAddress = {
  _id: string;
  label: string;
  name: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
  isDefault: boolean;
};

export type CartAddressPayload = {
  label: string;
  name: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
  isDefault?: boolean;
};

const unwrap = <T,>(response: unknown): T => {
  const data = response as { data?: unknown };
  return (data?.data as T) ?? (response as T);
};

export const listMyAddresses = async (): Promise<CartAddress[]> => {
  const res = await api.get("/addresses");
  return unwrap<CartAddress[]>(res.data);
};

export const createAddress = async (
  payload: CartAddressPayload,
): Promise<CartAddress> => {
  const res = await api.post("/addresses", payload);
  return unwrap<CartAddress>(res.data);
};

export const getAddress = async (id: string): Promise<CartAddress> => {
  const res = await api.get(`/addresses/${id}`);
  return unwrap<CartAddress>(res.data);
};

export const updateAddress = async (
  id: string,
  payload: Partial<CartAddressPayload>,
): Promise<CartAddress> => {
  const res = await api.patch(`/addresses/${id}`, payload);
  return unwrap<CartAddress>(res.data);
};

export const setDefaultAddress = async (id: string): Promise<CartAddress> => {
  const res = await api.patch(`/addresses/${id}/default`);
  return unwrap<CartAddress>(res.data);
};

export const deleteAddress = async (id: string): Promise<void> => {
  await api.delete(`/addresses/${id}`);
};
