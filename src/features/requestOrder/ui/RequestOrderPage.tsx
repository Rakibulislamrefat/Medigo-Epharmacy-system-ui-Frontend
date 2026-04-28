import { useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useLocation } from "../../../hooks/useLocation";
import CustomButton from "../../../shared/button/CustomButton";
import { Icons } from "../../../shared/icons/Icons";
import MainContainer from "../../../shared/main-container/MainContainer";
import SectionContainer from "../../../shared/section-container/SectionContainer";
import SectionHeading, { SectionParagraph } from "../../../shared/section-heading/SectionHeading";

type OrderItem = {
  id: string;
  name: string;
  quantity: string;
  notes: string;
};

type RequestOrderForm = {
  fullName: string;
  phone: string;
  email: string;
  deliveryAddress: string;
  city: string;
  country: string;
  deliveryNotes: string;
  prescriptionFile: File | null;
  items: OrderItem[];
};

const inputClass = (hasError: boolean) =>
  [
    "w-full rounded-sm border px-3.5 py-2.5 text-sm outline-none transition",
    "bg-gray-50 text-gray-900 border-gray-300",
    "focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20",
    hasError ? "border-danger bg-danger/5 focus:ring-danger/20" : "",
  ]
    .filter(Boolean)
    .join(" ");

const uid = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;

export default function RequestOrderPage() {
  const { getLocation, loading: detectingLocation } = useLocation();
  const fileRef = useRef<HTMLInputElement | null>(null);

  const [form, setForm] = useState<RequestOrderForm>({
    fullName: "",
    phone: "",
    email: "",
    deliveryAddress: "",
    city: "",
    country: "",
    deliveryNotes: "",
    prescriptionFile: null,
    items: [{ id: uid(), name: "", quantity: "1", notes: "" }],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const itemCount = useMemo(
    () =>
      form.items.reduce((acc, it) => acc + (Number(it.quantity || 0) || 0), 0),
    [form.items],
  );

  const setField = <K extends keyof RequestOrderForm>(
    key: K,
    value: RequestOrderForm[K],
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key as string]: "" }));
  };

  const setItem = (id: string, patch: Partial<OrderItem>) => {
    setForm((prev) => ({
      ...prev,
      items: prev.items.map((it) => (it.id === id ? { ...it, ...patch } : it)),
    }));
    setErrors((prev) => ({ ...prev, items: "" }));
  };

  const addItem = () => {
    setForm((prev) => ({
      ...prev,
      items: [...prev.items, { id: uid(), name: "", quantity: "1", notes: "" }],
    }));
  };

  const removeItem = (id: string) => {
    setForm((prev) => {
      const nextItems = prev.items.filter((it) => it.id !== id);
      return {
        ...prev,
        items: nextItems.length
          ? nextItems
          : [{ id: uid(), name: "", quantity: "1", notes: "" }],
      };
    });
  };

  const detectAddress = async () => {
    const loadingToastId = toast.loading("Detecting your location...");
    try {
      const result = await getLocation();
      if (!result) {
        toast.error("Failed to detect location. Please check your browser settings and try again.", {
          id: loadingToastId,
        });
        return;
      }

      const details = result.details;
      const city =
        details.city ||
        details.town ||
        details.village ||
        details.quarter ||
        "";
      const addressParts = [
        details.road,
        details.suburb,
        details.quarter,
        details.state_district,
        details.state,
        details.postcode,
      ].filter(Boolean);

      const nextAddress = addressParts.join(", ");
      const nextCountry = details.country || "";

      const fallbackAddress =
        nextAddress ||
        (result.displayName && result.displayName !== "Unknown location"
          ? result.displayName
          : `Lat ${result.latitude.toFixed(6)}, Lng ${result.longitude.toFixed(6)}`);

      if (!fallbackAddress && !city && !nextCountry) {
        toast.error("We couldn't resolve your address. Please enter it manually.", {
          id: loadingToastId,
        });
        return;
      }

      setForm((prev) => ({
        ...prev,
        deliveryAddress: fallbackAddress,
        city,
        country: nextCountry,
      }));

      toast.success(
        nextAddress
          ? "Address detected successfully."
          : "Location detected. Please review and complete your address.",
        { id: loadingToastId },
      );
    } catch (error) {
      console.error("Error detecting address:", error);
      toast.error("An error occurred while detecting your location. Please try again later.", {
        id: loadingToastId,
      });
    }
  };

  const validate = () => {
    const next: Record<string, string> = {};
    if (!form.fullName.trim()) next.fullName = "Full name is required";
    if (!form.phone.trim()) next.phone = "Phone is required";
    if (!form.email.trim()) next.email = "Email is required";
    if (!form.deliveryAddress.trim()) next.deliveryAddress = "Delivery address is required";
    if (!form.city.trim()) next.city = "City is required";
    if (!form.country.trim()) next.country = "Country is required";
    const hasItem = form.items.some((it) => it.name.trim());
    if (!hasItem) next.items = "Add at least one medicine item";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      await new Promise((r) => setTimeout(r, 450));
      toast.success("Order request submitted. We’ll contact you shortly.");
      setForm({
        fullName: "",
        phone: "",
        email: "",
        deliveryAddress: "",
        city: "",
        country: "",
        deliveryNotes: "",
        prescriptionFile: null,
        items: [{ id: uid(), name: "", quantity: "1", notes: "" }],
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SectionContainer>
      <MainContainer>
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <SectionHeading
              title="Request Order"
              description="Place an order request for medicine and get fast delivery from Medigo e‑Pharmacy."
              align="left"
            />
            <SectionParagraph className="mt-3">
              Upload your prescription for prescription items, or list the
              medicine names and quantities. Our team will confirm availability
              and pricing before dispatch.
            </SectionParagraph>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 flex items-center gap-2">
              <Icons.Cart className="!w-4 !h-4 text-primary" />
              {itemCount} items
            </div>
            <CustomButton
              variant="outline"
              size="sm"
              radius="xs"
              onClick={() => fileRef.current?.click()}
              leftIcon={<Icons.Prescription className="!w-4 !h-4" />}
            >
              Upload prescription
            </CustomButton>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4">
            <div className="rounded-2xl bg-gradient-to-br from-primary via-primary to-secondary text-white p-6 shadow-lg shadow-primary/10 relative overflow-hidden">
              <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-white/10 blur-[30px]" />
              <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-white/10 blur-[40px]" />

              <div className="relative">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-white/15 flex items-center justify-center border border-white/10">
                    <Icons.Pill className="!w-6 !h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white/90">
                      Medigo e‑Pharmacy
                    </p>
                    <p className="text-xs text-white/70">
                      Authentic medicine, fast delivery
                    </p>
                  </div>
                </div>

                <div className="mt-7 grid grid-cols-1 gap-3">
                  {[
                    {
                      title: "Add items",
                      desc: "Enter medicine names & quantity",
                      Icon: Icons.Cart,
                    },
                    {
                      title: "Upload prescription",
                      desc: "Optional but recommended",
                      Icon: Icons.Prescription,
                    },
                    {
                      title: "Confirm by phone",
                      desc: "We verify availability and pricing",
                      Icon: Icons.Phone,
                    },
                    {
                      title: "Doorstep delivery",
                      desc: "Fast delivery to your address",
                      Icon: Icons.Delivery,
                    },
                  ].map(({ title, desc, Icon }) => (
                    <div
                      key={title}
                      className="rounded-xl bg-white/10 border border-white/10 p-4 flex items-start gap-3"
                    >
                      <div className="w-9 h-9 rounded-lg bg-white/15 center-flex shrink-0">
                        <Icon className="!w-5 !h-5 text-white" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-black">{title}</p>
                        <p className="text-xs text-white/70 mt-1">{desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-7 rounded-xl bg-white/10 border border-white/10 p-4">
                  <div className="flex items-start gap-3">
                    <Icons.Shield className="!w-5 !h-5 text-white mt-0.5" />
                    <div>
                      <p className="text-sm font-black">Secure & private</p>
                      <p className="text-xs text-white/70 mt-1 leading-relaxed">
                        We use your details only to confirm and deliver your
                        order securely.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-8">
            <div className="rounded-2xl bg-gradient-to-r from-primary/25 via-secondary/20 to-primary/25 p-[1px] shadow-lg shadow-primary/5">
              <div className="bg-white border border-gray-100 rounded-2xl p-6 sm:p-7">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Full name <span className="text-danger ml-1">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                        <Icons.User className="!w-4 !h-4" />
                      </span>
                      <input
                        value={form.fullName}
                        onChange={(e) => setField("fullName", e.target.value)}
                        className={`${inputClass(!!errors.fullName)} pl-10`}
                        placeholder="Your full name"
                        autoComplete="name"
                      />
                    </div>
                    {errors.fullName && (
                      <p className="text-xs text-danger mt-1 flex items-center gap-2">
                        <Icons.AlertCircle className="!w-4 !h-4" />
                        {errors.fullName}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Phone <span className="text-danger ml-1">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                        <Icons.Phone className="!w-4 !h-4" />
                      </span>
                      <input
                        value={form.phone}
                        onChange={(e) => setField("phone", e.target.value)}
                        className={`${inputClass(!!errors.phone)} pl-10`}
                        placeholder="+8801XXXXXXXXX"
                        autoComplete="tel"
                      />
                    </div>
                    {errors.phone && (
                      <p className="text-xs text-danger mt-1 flex items-center gap-2">
                        <Icons.AlertCircle className="!w-4 !h-4" />
                        {errors.phone}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Email <span className="text-danger ml-1">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                      <Icons.Mail className="!w-4 !h-4" />
                    </span>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setField("email", e.target.value)}
                      className={`${inputClass(!!errors.email)} pl-10`}
                      placeholder="you@example.com"
                      autoComplete="email"
                    />
                  </div>
                  {errors.email && (
                    <p className="text-xs text-danger mt-1 flex items-center gap-2">
                      <Icons.AlertCircle className="!w-4 !h-4" />
                      {errors.email}
                    </p>
                  )}
                </div>

                <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <p className="text-xxs font-black tracking-[0.2em] uppercase text-primary">
                      Delivery address
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Provide your address or use auto-detect.
                    </p>
                  </div>
                  <CustomButton
                    variant="outline"
                    size="sm"
                    radius="xs"
                    loading={detectingLocation}
                    disabled={detectingLocation}
                    onClick={detectAddress}
                    leftIcon={<Icons.LocationPin className="!w-4 !h-4" />}
                  >
                    Detect my location
                  </CustomButton>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Address line <span className="text-danger ml-1">*</span>
                  </label>
                  <input
                    value={form.deliveryAddress}
                    onChange={(e) => setField("deliveryAddress", e.target.value)}
                    className={inputClass(!!errors.deliveryAddress)}
                    placeholder="Road, area, house / apartment"
                    autoComplete="street-address"
                  />
                  {errors.deliveryAddress && (
                    <p className="text-xs text-danger mt-1 flex items-center gap-2">
                      <Icons.AlertCircle className="!w-4 !h-4" />
                      {errors.deliveryAddress}
                    </p>
                  )}
                </div>

                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      City <span className="text-danger ml-1">*</span>
                    </label>
                    <input
                      value={form.city}
                      onChange={(e) => setField("city", e.target.value)}
                      className={inputClass(!!errors.city)}
                      placeholder="Dhaka"
                      autoComplete="address-level2"
                    />
                    {errors.city && (
                      <p className="text-xs text-danger mt-1 flex items-center gap-2">
                        <Icons.AlertCircle className="!w-4 !h-4" />
                        {errors.city}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Country <span className="text-danger ml-1">*</span>
                    </label>
                    <input
                      value={form.country}
                      onChange={(e) => setField("country", e.target.value)}
                      className={inputClass(!!errors.country)}
                      placeholder="Bangladesh"
                      autoComplete="country-name"
                    />
                    {errors.country && (
                      <p className="text-xs text-danger mt-1 flex items-center gap-2">
                        <Icons.AlertCircle className="!w-4 !h-4" />
                        {errors.country}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Delivery notes (optional)
                  </label>
                  <textarea
                    value={form.deliveryNotes}
                    onChange={(e) => setField("deliveryNotes", e.target.value)}
                    className={`${inputClass(false)} min-h-[90px] resize-y`}
                    placeholder="Gate code, delivery time, nearby landmark..."
                  />
                </div>

                <div className="mt-6 rounded-xl border border-gray-100 bg-light p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <p className="text-xxs font-black tracking-[0.2em] uppercase text-primary">
                        Medicine items
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        Add items you want to order.
                      </p>
                    </div>
                    <CustomButton
                      variant="primary"
                      size="sm"
                      radius="xs"
                      onClick={addItem}
                      leftIcon={<Icons.Plus className="!w-4 !h-4" />}
                    >
                      Add item
                    </CustomButton>
                  </div>

                  {errors.items && (
                    <p className="text-xs text-danger mt-3 flex items-center gap-2">
                      <Icons.AlertCircle className="!w-4 !h-4" />
                      {errors.items}
                    </p>
                  )}

                  <div className="mt-4 grid grid-cols-1 gap-4">
                    {form.items.map((it, index) => (
                      <div
                        key={it.id}
                        className="bg-white rounded-xl border border-gray-100 p-4"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-sm font-black text-dark">
                            Item {index + 1}
                          </p>
                          <button
                            type="button"
                            onClick={() => removeItem(it.id)}
                            className="inline-flex items-center gap-2 text-xs font-semibold text-danger hover:bg-danger/5 border border-danger/20 px-3 py-2 rounded-full transition-colors"
                          >
                            <Icons.Trash className="!w-4 !h-4" />
                            Remove
                          </button>
                        </div>

                        <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div className="md:col-span-2">
                            <label className="block text-xs font-semibold text-slate-600 mb-1">
                              Medicine name
                            </label>
                            <input
                              value={it.name}
                              onChange={(e) =>
                                setItem(it.id, { name: e.target.value })
                              }
                              className={inputClass(false)}
                              placeholder="e.g. Napa 500mg / Seclo 20mg"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1">
                              Quantity
                            </label>
                            <input
                              type="number"
                              min={1}
                              value={it.quantity}
                              onChange={(e) =>
                                setItem(it.id, { quantity: e.target.value })
                              }
                              className={inputClass(false)}
                              placeholder="1"
                            />
                          </div>
                        </div>

                        <div className="mt-3">
                          <label className="block text-xs font-semibold text-slate-600 mb-1">
                            Notes (optional)
                          </label>
                          <input
                            value={it.notes}
                            onChange={(e) =>
                              setItem(it.id, { notes: e.target.value })
                            }
                            className={inputClass(false)}
                            placeholder="Brand preference, strength, etc."
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6 rounded-xl border border-gray-100 bg-white p-5">
                  <div className="flex items-start gap-3">
                    <Icons.Prescription className="!w-5 !h-5 text-primary mt-0.5" />
                    <div className="min-w-0">
                      <p className="text-sm font-black text-dark">
                        Prescription (optional)
                      </p>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                        Upload a clear photo or PDF to speed up verification for
                        prescription medicines.
                      </p>

                      <div className="mt-4 flex flex-wrap items-center gap-2">
                        <CustomButton
                          variant="outline"
                          size="sm"
                          radius="xs"
                          onClick={() => fileRef.current?.click()}
                          leftIcon={<Icons.Plus className="!w-4 !h-4" />}
                        >
                          Choose file
                        </CustomButton>
                        {form.prescriptionFile ? (
                          <button
                            type="button"
                            onClick={() => setField("prescriptionFile", null)}
                            className="text-xs font-semibold text-slate-600 hover:text-danger"
                          >
                            Remove
                          </button>
                        ) : (
                          <span className="text-xs text-slate-500">
                            PNG/JPG/PDF
                          </span>
                        )}
                      </div>
                      {form.prescriptionFile && (
                        <p className="mt-2 text-xs text-slate-600 break-all">
                          {form.prescriptionFile.name}
                        </p>
                      )}
                      <input
                        ref={fileRef}
                        type="file"
                        className="hidden"
                        accept="image/*,application/pdf"
                        onChange={(e) =>
                          setField(
                            "prescriptionFile",
                            e.target.files?.[0] ?? null,
                          )
                        }
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="text-xs text-slate-500">
                    By submitting, you agree that Medigo may contact you to
                    confirm pricing and availability.
                  </div>
                  <CustomButton
                    variant="primary"
                    size="md"
                    radius="xs"
                    loading={submitting}
                    disabled={submitting}
                    onClick={() => void submit()}
                    rightIcon={<Icons.ArrowForward className="!w-4 !h-4" />}
                  >
                    Submit request
                  </CustomButton>
                </div>
              </div>
            </div>
          </div>
        </div>
      </MainContainer>
    </SectionContainer>
  );
}
