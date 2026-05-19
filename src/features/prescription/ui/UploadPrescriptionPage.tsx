import { useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import Api from "../../../utilities/api";
import { useLocation } from "../../../hooks/useLocation";
import CustomButton from "../../../shared/button/CustomButton";
import { Icons } from "../../../shared/icons/Icons";
import MainContainer from "../../../shared/main-container/MainContainer";
import SectionContainer from "../../../shared/section-container/SectionContainer";
import SectionHeading, { SectionParagraph } from "../../../shared/section-heading/SectionHeading";
import type { RootState } from "../../../redux/store";
import { defaultMedicineCatalog } from "../../home/service/medicineCatalog";
import type { MedicineProduct } from "../../home/service/MedicineCategory.types";
import { getMedicinesByCategory } from "../../home/service/medicineCategoryApi";

type UploadPrescriptionForm = {
  fullName: string;
  phone: string;
  email: string;
  deliveryAddress: string;
  city: string;
  country: string;
  notes: string;
  file: File | null;
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

export default function UploadPrescriptionPage() {
  const { getLocation, loading: detectingLocation } = useLocation();
  const { user } = useSelector((state: RootState) => state.user);
  const fileRef = useRef<HTMLInputElement | null>(null);

  type SelectedMedicine = MedicineProduct & { qty: number };

  const [allMedicines, setAllMedicines] = useState<MedicineProduct[]>(() =>
    defaultMedicineCatalog.flatMap((category) => category.products),
  );

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const categories = await getMedicinesByCategory();
        if (!mounted) return;
        setAllMedicines(categories.flatMap((c) => c.products));
      } catch (err) {
        // keep default catalog on error
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMedicines, setSelectedMedicines] = useState<SelectedMedicine[]>([]);

  const [form, setForm] = useState<UploadPrescriptionForm>({
    fullName: user?.name ?? "",
    phone: user?.phone ?? "",
    email: user?.email ?? "",
    deliveryAddress: "",
    city: "",
    country: "",
    notes: "",
    file: null,
  });

  const filteredMedicines = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();
    return allMedicines.filter((medicine) =>
      medicine.name.toLowerCase().includes(search),
    );
  }, [allMedicines, searchTerm]);

  const totalAmount = useMemo(
    () =>
      selectedMedicines.reduce(
        (sum, medicine) => sum + medicine.price * medicine.qty,
        0,
      ),
    [selectedMedicines],
  );

  const addMedicine = (medicine: MedicineProduct) => {
    setSelectedMedicines((prev) => {
      const existing = prev.find((item) => item.id === medicine.id);
      if (existing) {
        return prev.map((item) =>
          item.id === medicine.id ? { ...item, qty: item.qty + 1 } : item,
        );
      }
      return [...prev, { ...medicine, qty: 1 }];
    });
  };

  const updateMedicineQty = (id: string, qty: number) => {
    setSelectedMedicines((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, qty: Math.max(1, qty) } : item,
      ),
    );
  };

  const removeMedicine = (id: string) => {
    setSelectedMedicines((prev) => prev.filter((item) => item.id !== id));
  };
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user) return;

    setForm((prev) => ({
      ...prev,
      fullName: prev.fullName.trim() ? prev.fullName : user.name,
      phone: prev.phone.trim() ? prev.phone : user.phone,
      email: prev.email.trim() ? prev.email : user.email,
    }));
  }, [user]);

  const fileMeta = useMemo(() => {
    if (!form.file) return null;
    const sizeMb = (form.file.size / (1024 * 1024)).toFixed(2);
    return { name: form.file.name, sizeMb };
  }, [form.file]);

  const setField = <K extends keyof UploadPrescriptionForm>(
    key: K,
    value: UploadPrescriptionForm[K],
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key as string]: "" }));
  };

  const detectAddress = async () => {
    const result = await getLocation();
    if (!result) return;
    const d = result.details;
    const city = d.city || d.town || d.village || d.quarter || "";
    const addressParts = [
      d.road,
      d.suburb,
      d.quarter,
      d.state_district,
      d.state,
      d.postcode,
    ].filter(Boolean);
    setForm((prev) => ({
      ...prev,
      deliveryAddress: addressParts.join(", "),
      city,
      country: d.country || "",
    }));
    toast.success("Address detected");
  };

  const validate = () => {
    const next: Record<string, string> = {};
    if (!form.fullName.trim()) next.fullName = "Full name is required";
    if (!form.phone.trim()) next.phone = "Phone is required";
    if (!form.email.trim()) next.email = "Email is required";
    if (!form.deliveryAddress.trim()) next.deliveryAddress = "Delivery address is required";
    if (!form.city.trim()) next.city = "City is required";
    if (!form.country.trim()) next.country = "Country is required";
    if (!form.file) next.file = "Please upload a prescription file";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      const payload = new FormData();
      if (form.file) payload.append("prescriptionFile", form.file);
      payload.append("line1", form.deliveryAddress);
      payload.append("city", form.city);
      payload.append("country", form.country);
      // Only send fields accepted by backend validation
      payload.append(
        "medicines",
        JSON.stringify(selectedMedicines.map((item) => item.id)),
      );
      // quantities as an array aligned with `medicines` order: [2,1]
      payload.append(
        "quantities",
        JSON.stringify(selectedMedicines.map((item) => item.qty)),
      );
      // optional notes
      if (form.notes?.trim()) payload.append("notes", form.notes);


      await Api.post("/prescription-orders", payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Prescription uploaded. We’ll confirm by phone shortly.");
      setForm({
        fullName: "",
        phone: "",
        email: "",
        deliveryAddress: "",
        city: "",
        country: "",
        notes: "",
        file: null,
      });
      setSelectedMedicines([]);
      setSearchTerm("");
    } catch (err: unknown) {
      const message =
        (err as any)?.response?.data?.message || "Upload failed. Please try again.";
      toast.error(message);
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
              title="Upload Prescription"
              description="Upload your prescription and we’ll prepare your medicine order from Medigo e‑Pharmacy."
              align="left"
            />
            <SectionParagraph className="mt-3">
              Upload a clear photo or PDF. Our pharmacist will verify it, call to
              confirm availability and pricing, then arrange delivery.
            </SectionParagraph>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <CustomButton
              variant="outline"
              size="sm"
              radius="xs"
              onClick={detectAddress}
              loading={detectingLocation}
              disabled={detectingLocation}
              leftIcon={<Icons.LocationPin className="!w-4 !h-4" />}
            >
              Detect address
            </CustomButton>
            <CustomButton
              variant="primary"
              size="sm"
              radius="xs"
              onClick={() => fileRef.current?.click()}
              leftIcon={<Icons.Prescription className="!w-4 !h-4" />}
            >
              Choose file
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
                      Prescription verification
                    </p>
                  </div>
                </div>

                <div className="mt-7 grid grid-cols-1 gap-3">
                  {[
                    {
                      title: "Upload",
                      desc: "Photo or PDF",
                      Icon: Icons.Prescription,
                    },
                    {
                      title: "Verify",
                      desc: "Pharmacist review",
                      Icon: Icons.Shield,
                    },
                    {
                      title: "Confirm",
                      desc: "Call for pricing & availability",
                      Icon: Icons.Phone,
                    },
                    {
                      title: "Deliver",
                      desc: "Fast doorstep delivery",
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
                    <Icons.Check className="!w-5 !h-5 text-white mt-0.5" />
                    <div>
                      <p className="text-sm font-black">Tip</p>
                      <p className="text-xs text-white/70 mt-1 leading-relaxed">
                        Ensure the prescription is readable, with doctor name,
                        date, and medicine list clearly visible.
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
                      Delivery details
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Where should we deliver your medicines?
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

                <div className="mt-6 rounded-xl border border-gray-100 bg-white p-5">
                  <div className="flex items-start gap-3">
                    <Icons.Prescription className="!w-5 !h-5 text-primary mt-0.5" />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div>
                          <p className="text-sm font-black text-dark">
                            Prescription file <span className="text-danger ml-1">*</span>
                          </p>
                          <p className="text-xs text-slate-500 mt-1">
                            PNG/JPG/PDF, clear and readable.
                          </p>
                        </div>
                        <CustomButton
                          variant="outline"
                          size="sm"
                          radius="xs"
                          onClick={() => fileRef.current?.click()}
                          leftIcon={<Icons.Plus className="!w-4 !h-4" />}
                        >
                          Choose file
                        </CustomButton>
                      </div>

                      {errors.file && (
                        <p className="text-xs text-danger mt-2 flex items-center gap-2">
                          <Icons.AlertCircle className="!w-4 !h-4" />
                          {errors.file}
                        </p>
                      )}

                      {fileMeta ? (
                        <div className="mt-3 rounded-xl border border-gray-100 bg-light p-4 flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-dark break-all">
                              {fileMeta.name}
                            </p>
                            <p className="text-xs text-slate-500 mt-1">
                              {fileMeta.sizeMb} MB
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setField("file", null)}
                            className="inline-flex items-center gap-2 text-xs font-semibold text-danger hover:bg-danger/5 border border-danger/20 px-3 py-2 rounded-full transition-colors shrink-0"
                          >
                            <Icons.Trash className="!w-4 !h-4" />
                            Remove
                          </button>
                        </div>
                      ) : (
                        <div className="mt-3 rounded-xl border border-gray-100 bg-light p-4 flex items-start gap-3">
                          <Icons.Prescription className="!w-5 !h-5 text-primary mt-0.5" />
                          <p className="text-sm text-slate-600 leading-relaxed">
                            Tap “Choose file” to upload your prescription.
                          </p>
                        </div>
                      )}

                      <input
                        ref={fileRef}
                        type="file"
                        className="hidden"
                        accept="image/*,application/pdf"
                        onChange={(e) => setField("file", e.target.files?.[0] ?? null)}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-6 rounded-xl border border-gray-100 bg-white p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm font-black text-dark">Select medicines</p>
                      <p className="text-xs text-slate-500 mt-1">
                        Add medicines to your prescription order and review quantity and total.
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-dark">
                      Total: ৳{totalAmount.toFixed(2)}
                    </p>
                  </div>

                  <div className="mt-4 grid gap-4 xl:grid-cols-[1fr_320px]">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Search medicines
                      </label>
                      <input
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full rounded-sm border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm text-gray-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                        placeholder="Search medicine name"
                      />

                      <div className="mt-4 grid gap-3 max-h-64 overflow-y-auto">
                        {(filteredMedicines.length ? filteredMedicines : allMedicines)
                          .slice(0, 8)
                          .map((medicine) => (
                            <div
                              key={medicine.id}
                              className="flex items-center justify-between gap-3 rounded-xl border border-gray-100 bg-gray-50 p-3"
                            >
                              <div>
                                <p className="text-sm font-semibold text-dark">
                                  {medicine.name}
                                </p>
                                <p className="text-xs text-slate-500 mt-1">
                                  ৳{medicine.price.toFixed(2)} each
                                </p>
                              </div>
                              <CustomButton
                                variant="outline"
                                size="xs"
                                radius="xs"
                                onClick={() => addMedicine(medicine)}
                              >
                                Add
                              </CustomButton>
                            </div>
                          ))}
                      </div>
                    </div>

                    <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-black text-dark">Selected medicines</p>
                        <p className="text-xs text-slate-500">{selectedMedicines.length} added</p>
                      </div>

                      {selectedMedicines.length ? (
                        <div className="mt-4 space-y-3">
                          {selectedMedicines.map((medicine) => (
                            <div
                              key={medicine.id}
                              className="rounded-xl border border-gray-200 bg-white p-3"
                            >
                              <div className="flex items-center justify-between gap-3">
                                <div>
                                  <p className="text-sm font-semibold text-dark">
                                    {medicine.name}
                                  </p>
                                  <p className="text-xs text-slate-500 mt-1">
                                    ৳{medicine.price.toFixed(2)} each
                                  </p>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => removeMedicine(medicine.id)}
                                  className="text-xs font-semibold text-danger hover:text-danger/80"
                                >
                                  Remove
                                </button>
                              </div>
                              <div className="mt-3 flex items-center justify-between gap-3">
                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => updateMedicineQty(medicine.id, medicine.qty - 1)}
                                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-sm text-slate-700"
                                  >
                                    −
                                  </button>
                                  <span className="inline-flex h-9 min-w-[48px] items-center justify-center rounded-lg border border-gray-200 bg-white text-sm font-semibold">
                                    {medicine.qty}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => updateMedicineQty(medicine.id, medicine.qty + 1)}
                                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-sm text-slate-700"
                                  >
                                    +
                                  </button>
                                </div>
                                <p className="text-sm font-semibold text-dark">
                                  Subtotal ৳{(medicine.price * medicine.qty).toFixed(2)}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="mt-4 rounded-xl border border-dashed border-gray-200 bg-white p-4 text-sm text-slate-500">
                          Add medicines from the left panel to build your prescription order.
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Notes (optional)
                  </label>
                  <textarea
                    value={form.notes}
                    onChange={(e) => setField("notes", e.target.value)}
                    className={`${inputClass(false)} min-h-[90px] resize-y`}
                    placeholder="Brand preference, delivery time, nearby landmark..."
                  />
                </div>

                <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <p className="text-xs text-slate-500">
                    By submitting, you agree Medigo may contact you to confirm
                    availability and pricing.
                  </p>
                  <CustomButton
                    variant="primary"
                    size="md"
                    radius="xs"
                    loading={submitting}
                    disabled={submitting}
                    onClick={() => void submit()}
                    rightIcon={<Icons.ArrowForward className="!w-4 !h-4" />}
                  >
                    Submit
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
