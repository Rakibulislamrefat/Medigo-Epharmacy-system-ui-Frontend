import { useMemo, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import { Icons } from "../../../shared/icons/Icons";
import MainContainer from "../../../shared/main-container/MainContainer";
import SectionContainer from "../../../shared/section-container/SectionContainer";
import SectionHeading, { SectionParagraph } from "../../../shared/section-heading/SectionHeading";
import CustomButton from "../../../shared/button/CustomButton";
import { type RootState } from "../../../redux/store";
import { getMyCart, removeCartItem, updateCartItemQty } from "../service/cartApi";
import {
  createAddress,
  listMyAddresses,
  updateAddress,
  deleteAddress,
  type CartAddressPayload,
} from "../service/addressApi";

const emptyAddressForm: CartAddressPayload = {
  label: "",
  name: "",
  phone: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  postcode: "",
  country: "",
  isDefault: false,
};

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

  const createAddressMutation = useMutation({
    mutationFn: (payload: CartAddressPayload) => createAddress(payload),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["addresses"] });
    },
  });

  const updateAddressMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<CartAddressPayload> }) =>
      updateAddress(id, payload),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["addresses"] });
    },
  });

  const deleteAddressMutation = useMutation({
    mutationFn: (id: string) => deleteAddress(id),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["addresses"] });
    },
  });

  const user = useSelector((state: RootState) => state.user.user);

  const {
    data: addresses = [],
    isLoading: isAddressLoading,
  } = useQuery({
    queryKey: ["addresses"],
    queryFn: listMyAddresses,
    enabled: Boolean(user),
    retry: false,
  });

  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [addressForm, setAddressForm] = useState<CartAddressPayload>(emptyAddressForm);
  const [addressErrors, setAddressErrors] = useState<Record<string, string>>({});
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [isAddressSelectOpen, setIsAddressSelectOpen] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);

  const canAddAddress = !user || addresses.length < 3;
  const addressButtonLabel = user ? "Add address" : "Log in to add address";

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

  const handleOpenAddressModal = () => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (!canAddAddress) return;
    setAddressErrors({});
    setAddressForm(emptyAddressForm);
    setEditingAddressId(null);
    setIsAddressModalOpen(true);
  };

  const handleEditAddress = (id: string) => {
    const address = addresses.find((a) => a._id === id);
    if (!address) return;

    setAddressErrors({});
    setAddressForm({
      label: address.label,
      name: address.name,
      phone: address.phone,
      line1: address.line1,
      line2: address.line2 || "",
      city: address.city,
      state: address.state,
      postcode: address.postcode,
      country: address.country,
      isDefault: address.isDefault,
    });
    setEditingAddressId(id);
    setIsAddressModalOpen(true);
  };

  const setAddressField = <K extends keyof CartAddressPayload>(
    key: K,
    value: CartAddressPayload[K],
  ) => {
    setAddressForm((prev) => ({ ...prev, [key]: value }));
    setAddressErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const validateAddressForm = () => {
    const nextErrors: Record<string, string> = {};
    if (!addressForm.label.trim()) nextErrors.label = "Label is required";
    if (!addressForm.name.trim()) nextErrors.name = "Name is required";
    if (!addressForm.phone.trim()) nextErrors.phone = "Phone is required";
    if (!addressForm.line1.trim()) nextErrors.line1 = "Address is required";
    if (!addressForm.city.trim()) nextErrors.city = "City is required";
    if (!addressForm.state.trim()) nextErrors.state = "State is required";
    if (!addressForm.postcode.trim()) nextErrors.postcode = "Postcode is required";
    if (!addressForm.country.trim()) nextErrors.country = "Country is required";
    setAddressErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSaveAddress = async () => {
    if (!validateAddressForm()) return;

    const toastId = toast.loading(
      editingAddressId ? "Updating address..." : "Saving address...",
    );
    try {
      if (editingAddressId) {
        await updateAddressMutation.mutateAsync({
          id: editingAddressId,
          payload: addressForm,
        });
        toast.success("Address updated successfully.", { id: toastId });
      } else {
        await createAddressMutation.mutateAsync(addressForm);
        toast.success("Address added successfully.", { id: toastId });
      }
      setIsAddressModalOpen(false);
      setEditingAddressId(null);
    } catch (err) {
      toast.error(
        editingAddressId ? "Unable to update address." : "Unable to save address.",
        { id: toastId },
      );
    }
  };

  const handleDeleteAddress = async (id: string) => {
    const confirmed = window.confirm("Are you sure you want to delete this address?");
    if (!confirmed) return;

    const toastId = toast.loading("Deleting address...");
    try {
      await deleteAddressMutation.mutateAsync(id);
      toast.success("Address deleted successfully.", { id: toastId });
    } catch (err) {
      toast.error("Unable to delete address.", { id: toastId });
    }
  };

  const handleProceedToOrder = () => {
    if (!cartItems.length) return;
    if (isAddressLoading) {
      toast("Loading saved addresses...");
      return;
    }

    if (!addresses.length) {
      toast.error("Please add a delivery address before placing your order.");
      return;
    }

    const defaultAddress = addresses.find((address) => address.isDefault) ?? addresses[0];
    setSelectedAddressId(defaultAddress?._id ?? null);
    setIsAddressSelectOpen(true);
  };

  const handleConfirmOrder = () => {
    if (!cartItems.length) return;
    if (!selectedAddressId) {
      toast.error("Please select a delivery address.");
      return;
    }

    const selectedAddress = addresses.find((address) => address._id === selectedAddressId);
    if (!selectedAddress) {
      toast.error("Selected address is invalid.");
      return;
    }

    const prefilledItems = cartItems.map((item) => ({
      id: item.product._id,
      name: item.product.name,
      quantity: String(item.qty),
      notes: "",
    }));

    setIsAddressSelectOpen(false);
    navigate("/request-order", {
      state: { prefilledItems, selectedAddress },
    });
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
                  Order Now
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
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                      Delivery address
                    </p>
                    <p className="mt-2 text-sm text-slate-600">
                      {addresses.length > 0
                        ? "Your saved delivery address(es)."
                        : "Add a delivery address to save it for future orders."}
                    </p>
                  </div>
                  {canAddAddress && (
                    <CustomButton
                      variant="outline"
                      size="xs"
                      radius="full"
                      onClick={handleOpenAddressModal}
                    >
                      {addressButtonLabel}
                    </CustomButton>
                  )}
                </div>

                {isAddressLoading ? (
                  <div className="mt-4 rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-4 text-sm text-slate-600">
                    Loading addresses...
                  </div>
                ) : addresses.length > 0 ? (
                  <div className="mt-4 space-y-3">
                    {addresses.map((address) => (
                      <div
                        key={address._id ?? `${address.label}-${address.line1}`}
                        className="rounded-2xl border border-gray-100 bg-gray-50 p-4"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-dark">{address.label}</p>
                            <p className="text-xs text-slate-600 mt-1">{address.name}</p>
                            <p className="text-xs text-slate-600">{address.phone}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            {address.isDefault && (
                              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-600 whitespace-nowrap">
                                Default
                              </span>
                            )}
                            <button
                              onClick={() => handleEditAddress(address._id)}
                              className="rounded-full p-2 text-slate-500 hover:bg-blue-100 hover:text-blue-600 transition"
                              title="Edit address"
                            >
                              <Icons.Edit className="w-4! h-4!" />
                            </button>
                            <button
                              onClick={() => handleDeleteAddress(address._id)}
                              className="rounded-full p-2 text-slate-500 hover:bg-red-100 hover:text-red-600 transition"
                              title="Delete address"
                            >
                              <Icons.Trash className="w-4! h-4!" />
                            </button>
                          </div>
                        </div>
                        <p className="mt-3 text-sm text-slate-700">{address.line1}</p>
                        {address.line2 && (
                          <p className="text-sm text-slate-700">{address.line2}</p>
                        )}
                        <p className="text-sm text-slate-700">
                          {address.city}, {address.state} {address.postcode}
                        </p>
                        <p className="text-sm text-slate-700">{address.country}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="mt-4 rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-4 text-sm text-slate-600">
                    No saved addresses yet.
                  </div>
                )}
              </div>
            )}
          </aside>
        </div>

        {isAddressModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
            <div
              className="absolute inset-0"
              onClick={() => setIsAddressModalOpen(false)}
            />
            <div className="relative w-full max-w-2xl rounded-[2rem] bg-white shadow-2xl ring-1 ring-black/10 overflow-hidden">
              <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
                <div>
                  <p className="text-lg font-semibold text-dark">
                    {editingAddressId ? "Edit delivery address" : "Add delivery address"}
                  </p>
                  <p className="text-sm text-slate-500 mt-1">
                    {editingAddressId
                      ? "Update your address details."
                      : "Save an address for future orders."}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsAddressModalOpen(false);
                    setEditingAddressId(null);
                  }}
                  className="rounded-full p-2 text-slate-500 hover:bg-gray-100 transition"
                >
                  <Icons.Close className="!w-4 !h-4" />
                </button>
              </div>

              <div className="px-6 py-5 space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-sm font-semibold text-slate-700">Label</label>
                    <input
                      value={addressForm.label}
                      onChange={(e) => setAddressField("label", e.target.value)}
                      className="mt-2 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                      placeholder="Home, Office, Parents"
                    />
                    {addressErrors.label && (
                      <p className="mt-1 text-xs text-red-600">{addressErrors.label}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-slate-700">Name</label>
                    <input
                      value={addressForm.name}
                      onChange={(e) => setAddressField("name", e.target.value)}
                      className="mt-2 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                      placeholder="Your full name"
                    />
                    {addressErrors.name && (
                      <p className="mt-1 text-xs text-red-600">{addressErrors.name}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-semibold text-slate-700">Phone</label>
                  <input
                    value={addressForm.phone}
                    onChange={(e) => setAddressField("phone", e.target.value)}
                    className="mt-2 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    placeholder="Phone number"
                  />
                  {addressErrors.phone && (
                    <p className="mt-1 text-xs text-red-600">{addressErrors.phone}</p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-semibold text-slate-700">Address line 1</label>
                  <input
                    value={addressForm.line1}
                    onChange={(e) => setAddressField("line1", e.target.value)}
                    className="mt-2 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    placeholder="Street address, house number"
                  />
                  {addressErrors.line1 && (
                    <p className="mt-1 text-xs text-red-600">{addressErrors.line1}</p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-semibold text-slate-700">Address line 2</label>
                  <input
                    value={addressForm.line2}
                    onChange={(e) => setAddressField("line2", e.target.value)}
                    className="mt-2 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    placeholder="Apartment, suite, unit, building (optional)"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-sm font-semibold text-slate-700">City</label>
                    <input
                      value={addressForm.city}
                      onChange={(e) => setAddressField("city", e.target.value)}
                      className="mt-2 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                      placeholder="City"
                    />
                    {addressErrors.city && (
                      <p className="mt-1 text-xs text-red-600">{addressErrors.city}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-slate-700">State</label>
                    <input
                      value={addressForm.state}
                      onChange={(e) => setAddressField("state", e.target.value)}
                      className="mt-2 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                      placeholder="State"
                    />
                    {addressErrors.state && (
                      <p className="mt-1 text-xs text-red-600">{addressErrors.state}</p>
                    )}
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-sm font-semibold text-slate-700">Postcode</label>
                    <input
                      value={addressForm.postcode}
                      onChange={(e) => setAddressField("postcode", e.target.value)}
                      className="mt-2 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                      placeholder="Postal code"
                    />
                    {addressErrors.postcode && (
                      <p className="mt-1 text-xs text-red-600">{addressErrors.postcode}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-slate-700">Country</label>
                    <input
                      value={addressForm.country}
                      onChange={(e) => setAddressField("country", e.target.value)}
                      className="mt-2 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                      placeholder="Country"
                    />
                    {addressErrors.country && (
                      <p className="mt-1 text-xs text-red-600">{addressErrors.country}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    id="defaultAddress"
                    type="checkbox"
                    checked={addressForm.isDefault}
                    onChange={(e) => setAddressField("isDefault", e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <label htmlFor="defaultAddress" className="text-sm text-slate-700">
                    Set as default address
                  </label>
                </div>
              </div>

              <div className="flex flex-col gap-3 border-t border-gray-100 bg-gray-50 px-6 py-4 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setIsAddressModalOpen(false)}
                  className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <CustomButton
                  variant="primary"
                  size="sm"
                  radius="full"
                  onClick={handleSaveAddress}
                >
                  {editingAddressId ? "Update address" : "Save address"}
                </CustomButton>
              </div>
            </div>
          </div>
        )}
        {isAddressSelectOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
            <div className="absolute inset-0" onClick={() => setIsAddressSelectOpen(false)} />
            <div className="relative w-full max-w-2xl rounded-[2rem] bg-white shadow-2xl ring-1 ring-black/10 overflow-hidden">
              <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
                <div>
                  <p className="text-lg font-semibold text-dark">Select delivery address</p>
                  <p className="text-sm text-slate-500 mt-1">Choose the address to use for this order.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddressSelectOpen(false)}
                  className="rounded-full p-2 text-slate-500 hover:bg-gray-100 transition"
                >
                  <Icons.Close className="!w-4 !h-4" />
                </button>
              </div>

              <div className="px-6 py-5 space-y-4">
                {isAddressLoading ? (
                  <p className="text-sm text-slate-500">Loading addresses...</p>
                ) : addresses.length ? (
                  addresses.map((address) => (
                    <label
                      key={address._id}
                      className={`group block cursor-pointer rounded-2xl border p-4 transition ${
                        selectedAddressId === address._id
                          ? "border-primary bg-primary/10"
                          : "border-gray-200 bg-white hover:border-primary/80"
                      }`}
                    >
                      <input
                        type="radio"
                        name="selectedAddress"
                        value={address._id}
                        checked={selectedAddressId === address._id}
                        onChange={() => setSelectedAddressId(address._id)}
                        className="sr-only"
                      />
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <p className="text-sm font-semibold text-dark">{address.label}</p>
                              <p className="text-xs text-slate-600 mt-1">{address.name}</p>
                              <p className="text-xs text-slate-600">{address.phone}</p>
                            </div>
                            {address.isDefault && (
                              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-600">
                                Default
                              </span>
                            )}
                          </div>
                          <p className="mt-3 text-sm text-slate-700">{address.line1}</p>
                          {address.line2 && (
                            <p className="text-sm text-slate-700">{address.line2}</p>
                          )}
                          <p className="text-sm text-slate-700">
                            {address.city}, {address.state} {address.postcode}
                          </p>
                          <p className="text-sm text-slate-700">{address.country}</p>
                        </div>
                        <div className="flex-shrink-0">
                          <span
                            className={`inline-flex h-5 w-5 items-center justify-center rounded-full border ${
                              selectedAddressId === address._id
                                ? "border-primary bg-primary text-white"
                                : "border-gray-300 bg-white"
                            }`}
                          >
                            {selectedAddressId === address._id ? (
                              <Icons.Check className="!w-4 !h-4" />
                            ) : null}
                          </span>
                        </div>
                      </div>
                    </label>
                  ))
                ) : (
                  <p className="text-sm text-slate-500">No saved addresses available. Add an address first.</p>
                )}
              </div>

              <div className="flex flex-col gap-3 border-t border-gray-100 bg-gray-50 px-6 py-4 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setIsAddressSelectOpen(false)}
                  className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-gray-100"
                >
                  Back
                </button>
                <CustomButton
                  variant="primary"
                  size="sm"
                  radius="full"
                  onClick={handleConfirmOrder}
                  disabled={!selectedAddressId}
                >
                  Continue
                </CustomButton>
              </div>
            </div>
          </div>
        )}      </MainContainer>
    </SectionContainer>
  );
}
