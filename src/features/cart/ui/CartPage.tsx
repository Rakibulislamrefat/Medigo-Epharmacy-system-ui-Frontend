import { useMemo } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Icons } from "../../../shared/icons/Icons";
import MainContainer from "../../../shared/main-container/MainContainer";
import SectionContainer from "../../../shared/section-container/SectionContainer";
import SectionHeading, { SectionParagraph } from "../../../shared/section-heading/SectionHeading";
import CustomButton from "../../../shared/button/CustomButton";
import { getMyCart, removeCartItem, updateCartItemQty } from "../service/cartApi";

export default function CartPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();

  const {
    data: cart,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["cart"],
    queryFn: getMyCart,
    retry: false,
    staleTime: 1000 * 60,
  });

  const updateQtyMutation = useMutation({
    mutationFn: ({ productId, qty }: { productId: string; qty: number }) =>
      updateCartItemQty(productId, qty),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["cart"] });
    },
  });

  const removeMutation = useMutation({
    mutationFn: (productId: string) => removeCartItem(productId),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["cart"] });
    },
  });

  const cartItems = cart?.items ?? [];
  const totalItems = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.qty, 0),
    [cartItems],
  );

  const totalAmount = useMemo(
    () =>
      cartItems.reduce(
        (sum, item) =>
          sum + (item.product.salePrice ?? item.product.price ?? 0) * item.qty,
        0,
      ),
    [cartItems],
  );

  const handleQuantityChange = async (productId: string, qty: number) => {
    if (qty < 1) return;
    const toastId = toast.loading("Updating item quantity...");
    try {
      await updateQtyMutation.mutateAsync({ productId, qty });
      toast.success("Quantity updated", { id: toastId });
    } catch (err) {
      toast.error("Unable to update quantity", { id: toastId });
    }
  };

  const handleRemoveItem = async (productId: string) => {
    const toastId = toast.loading("Removing item...");
    try {
      await removeMutation.mutateAsync(productId);
      toast.success("Item removed from cart", { id: toastId });
    } catch (err) {
      toast.error("Unable to remove item", { id: toastId });
    }
  };

  const handleProceedToOrder = () => {
    if (!cartItems.length) return;
    const prefilledItems = cartItems.map((item) => ({
      id: item.product._id,
      name: item.product.name,
      quantity: String(item.qty),
      notes: "",
    }));
    navigate("/request-order", { state: { prefilledItems } });
  };

  return (
    <SectionContainer>
      <MainContainer>
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl w-full">
            <SectionHeading
              title="Your Cart"
              description="Review the items you added to your Medigo cart, update quantities, and continue to request your order."
              align="left"
            />
            <SectionParagraph className="mt-3">
              Items added from product catalog will stay in your cart until you submit an order request or remove them.
            </SectionParagraph>
          </div>

          <div className="flex flex-wrap items-center justify-start gap-2 sm:justify-end w-full sm:w-auto">
            <div className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 flex items-center gap-2 min-w-[120px] sm:min-w-0">
              <Icons.Cart className="!w-4 !h-4 text-primary" />
              {totalItems} item{totalItems === 1 ? "" : "s"}
            </div>
            <CustomButton
              variant="primary"
              size="sm"
              radius="xs"
              onClick={handleProceedToOrder}
              disabled={!cartItems.length}
            >
              Request Order
            </CustomButton>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[2fr_1fr]">
          <div className="space-y-4">
            {isLoading ? (
              <div className="rounded-3xl border border-gray-200 bg-white p-8 text-center text-sm text-slate-500">
                Loading your cart...
              </div>
            ) : isError ? (
              <div className="rounded-3xl border border-gray-200 bg-white p-8 text-center text-sm text-slate-500">
                <p className="font-semibold text-dark">Could not load cart.</p>
                <p className="mt-2 text-sm text-slate-600">
                  {String(error)}
                </p>
                <div className="mt-4 flex justify-center">
                  <NavLink to="/login">
                    <CustomButton variant="primary" size="sm" radius="full">
                      Log in to view cart
                    </CustomButton>
                  </NavLink>
                </div>
              </div>
            ) : cartItems.length === 0 ? (
              <div className="rounded-3xl border border-gray-200 bg-white p-8 text-center">
                <Icons.Cart className="!w-12 !h-12 mx-auto text-primary" />
                <p className="mt-5 text-lg font-semibold text-dark">Your bag is empty</p>
                <p className="mt-2 text-sm text-slate-600">
                  Add medicines to your cart and they will appear here.
                </p>
                <div className="mt-6 flex flex-col gap-3 sm:flex-row justify-center">
                  <NavLink to="/shop">
                    <CustomButton variant="primary" size="sm" radius="full">
                      Continue Shopping
                    </CustomButton>
                  </NavLink>
                  <NavLink to="/request-order">
                    <CustomButton variant="outline" size="sm" radius="full">
                      Request Order Now
                    </CustomButton>
                  </NavLink>
                </div>
              </div>
            ) : (
              cartItems.map((item) => {
                const unitPrice = item.product.salePrice ?? item.product.price ?? 0;
                const subtotal = unitPrice * item.qty;
                return (
                  <div
                    key={item.product._id}
                    className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm"
                  >
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      <div className="flex items-start gap-4">
                        <div className="h-20 w-20 rounded-3xl bg-gray-50 border border-gray-200 overflow-hidden center-flex">
                          {item.product.images?.[0] ? (
                            <img
                              src={item.product.images[0]}
                              alt={item.product.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <Icons.Pill className="!w-6 !h-6 text-primary" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-dark line-clamp-2">
                            {item.product.name}
                          </p>
                          <p className="mt-2 text-xs text-slate-500">
                            {item.product.slug ?? "Medicine item"}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                        <div className="rounded-full border border-gray-200 bg-gray-50 py-1 px-2 flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleQuantityChange(item.product._id, item.qty - 1)}
                            disabled={item.qty <= 1 || updateQtyMutation.status === "pending"}
                            className="rounded-full p-1 text-slate-600 hover:bg-primary/10 transition"
                          >
                            <Icons.Minus className="!w-4 !h-4" />
                          </button>
                          <span className="w-10 text-center text-sm font-semibold text-dark">
                            {item.qty}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleQuantityChange(item.product._id, item.qty + 1)}
                            disabled={updateQtyMutation.status === "pending"}
                            className="rounded-full p-1 text-slate-600 hover:bg-primary/10 transition"
                          >
                            <Icons.Plus className="!w-4 !h-4" />
                          </button>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-dark">
                            ৳{unitPrice.toFixed(2)} each
                          </p>
                          <p className="text-sm text-slate-500">
                            Subtotal ৳{subtotal.toFixed(2)}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(item.product._id)}
                          disabled={removeMutation.status === "pending"}
                          className="inline-flex items-center gap-2 rounded-full border border-red-100 bg-red-50 px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-100 transition"
                        >
                          <Icons.Trash className="!w-4 !h-4" />
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <aside className="space-y-4">
            <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                Cart summary
              </p>
              <div className="mt-5 space-y-4">
                <div className="flex items-center justify-between text-sm text-slate-600">
                  <span>Total items</span>
                  <span>{totalItems}</span>
                </div>
                <div className="flex items-center justify-between text-sm text-slate-600">
                  <span>Estimated subtotal</span>
                  <span>৳{totalAmount.toFixed(2)}</span>
                </div>
              </div>
              <div className="mt-6 space-y-3">
                <CustomButton
                  variant="primary"
                  size="sm"
                  radius="full"
                  fullWidth
                  disabled={!cartItems.length}
                  onClick={handleProceedToOrder}
                >
                  Continue to request order
                </CustomButton>
                <NavLink to="/shop">
                  <CustomButton variant="outline" size="sm" radius="full" fullWidth>
                    Continue shopping
                  </CustomButton>
                </NavLink>
              </div>
            </div>

            {cartItems.length > 0 && (
              <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Need help?
                </p>
                <p className="mt-3 text-sm text-slate-600">
                  If you have a prescription or need assistance selecting the right medicine, our support team is ready to help.
                </p>
                <NavLink to="/contact-us">
                  <CustomButton variant="outline" size="sm" radius="full" fullWidth>
                    Contact support
                  </CustomButton>
                </NavLink>
              </div>
            )}
          </aside>
        </div>
      </MainContainer>
    </SectionContainer>
  );
}
