import api from "../../../utilities/api";

export type CartItemProduct = {
  _id: string;
  name: string;
  slug?: string;
  price?: number;
  salePrice?: number | null;
  currency?: string;
  images?: string[];
  stockQty?: number;
  status?: string;
};

export type CartItem = {
  product: CartItemProduct;
  qty: number;
};

export type Cart = {
  _id: string;
  user: string;
  items: CartItem[];
};

const unwrap = <T,>(data: unknown): T => {
  const response = data as { data?: unknown };
  return (response?.data as T) ?? (data as T);
};

export const addProductToCart = async (productId: string, qty = 1): Promise<Cart> => {
  const res = await api.post("/carts/add", { productId, qty });
  return unwrap<Cart>(res.data);
};

export const getMyCart = async (): Promise<Cart> => {
  const res = await api.get("/carts");
  return unwrap<Cart>(res.data);
};

export const updateCartItemQty = async (productId: string, qty: number): Promise<Cart> => {
  const res = await api.patch("/carts/me/items", { productId, qty });
  return unwrap<Cart>(res.data);
};

export const removeCartItem = async (productId: string): Promise<Cart> => {
  const res = await api.delete(`/carts/me/items/${productId}`);
  return unwrap<Cart>(res.data);
};

export const clearCart = async (): Promise<Cart> => {
  const res = await api.delete("/carts/me");
  return unwrap<Cart>(res.data);
};
