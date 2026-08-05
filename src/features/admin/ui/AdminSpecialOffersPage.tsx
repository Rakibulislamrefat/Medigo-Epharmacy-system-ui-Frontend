import { useState } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { Icons } from "../../../shared/icons/Icons";
import {
  addSpecialOffer,
  deleteSpecialOffer,
  getSpecialOffers,
  type SpecialOffer,
} from "../../specialOffers/service/specialOffersData";

const initialFormState = {
  title: "",
  discount: "",
  description: "",
  code: "",
  expiry: "",
  image: "",
};

type SpecialOfferForm = Omit<SpecialOffer, "id">;

const isValidOffer = (offer: SpecialOfferForm) =>
  offer.title.trim() && offer.discount.trim() && offer.code.trim() && offer.description.trim();

export default function AdminSpecialOffersPage() {
  const [offers, setOffers] = useState<SpecialOffer[]>(() => getSpecialOffers());
  const [form, setForm] = useState<SpecialOfferForm>(initialFormState);

  const handleInput = (key: keyof SpecialOfferForm, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleAddOffer = () => {
    if (!isValidOffer(form)) {
      toast.error("Please fill in title, discount, code and description.");
      return;
    }

    const updatedOffers = addSpecialOffer({
      title: form.title.trim(),
      discount: form.discount.trim(),
      description: form.description.trim(),
      code: form.code.trim(),
      expiry: form.expiry.trim() || "Limited time",
      image: form.image.trim() || "https://images.unsplash.com/photo-1580281657521-ff71aa1b933d?w=600",
    });

    setOffers(updatedOffers);
    setForm(initialFormState);
    toast.success("Special offer added.");
  };

  const handleDelete = (id: number) => {
    const updatedOffers = deleteSpecialOffer(id);
    setOffers(updatedOffers);
    toast.success("Special offer removed.");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="space-y-6 pb-20"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-3 rounded-3xl bg-primary/10 px-4 py-3 text-primary shadow-sm shadow-primary/10">
            <Icons.Star className="!w-5 !h-5" />
            <span className="text-sm font-semibold">Special Offers Admin</span>
          </div>
          <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-900">Control special offers</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-500">
            Create and manage the special offers that display across the public store.
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">Current offers</p>
          <p className="mt-3 text-4xl font-black text-slate-900">{offers.length}</p>
          <p className="text-sm text-slate-500">Live special offers stored for customers.</p>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white shadow-xl overflow-hidden">
        <div className="p-6 border-b border-slate-200/70">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Add new offer</h2>
              <p className="text-sm text-slate-500">Enter the details to publish a new special offer.</p>
            </div>
            <button
              type="button"
              onClick={handleAddOffer}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-primary/20 transition hover:bg-primary-dark"
            >
              <Icons.Plus className="!w-4 !h-4" />
              Add Offer
            </button>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <label className="space-y-2 text-sm text-slate-600">
              <span className="font-semibold">Title</span>
              <input
                value={form.title}
                onChange={(e) => handleInput("title", e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-primary focus:bg-white"
                placeholder="Wellness Essentials"
              />
            </label>
            <label className="space-y-2 text-sm text-slate-600">
              <span className="font-semibold">Discount label</span>
              <input
                value={form.discount}
                onChange={(e) => handleInput("discount", e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-primary focus:bg-white"
                placeholder="15% OFF"
              />
            </label>
            <label className="space-y-2 text-sm text-slate-600">
              <span className="font-semibold">Promo code</span>
              <input
                value={form.code}
                onChange={(e) => handleInput("code", e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-primary focus:bg-white"
                placeholder="WELLNESS15"
              />
            </label>
            <label className="space-y-2 text-sm text-slate-600">
              <span className="font-semibold">Expiry text</span>
              <input
                value={form.expiry}
                onChange={(e) => handleInput("expiry", e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-primary focus:bg-white"
                placeholder="Ends month-end"
              />
            </label>
            <label className="space-y-2 text-sm text-slate-600 sm:col-span-2">
              <span className="font-semibold">Image URL</span>
              <input
                value={form.image}
                onChange={(e) => handleInput("image", e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-primary focus:bg-white"
                placeholder="https://images.unsplash.com/..."
              />
            </label>
            <label className="space-y-2 text-sm text-slate-600 sm:col-span-2">
              <span className="font-semibold">Description</span>
              <textarea
                value={form.description}
                onChange={(e) => handleInput("description", e.target.value)}
                rows={4}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-primary focus:bg-white resize-none"
                placeholder="Save on vitamins, supplements, and daily wellness items for every family member."
              />
            </label>
          </div>
        </div>

        <div className="p-6">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {offers.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-slate-500">
                No special offers available. Add one using the form above.
              </div>
            ) : (
              offers.map((offer) => (
                <div
                  key={offer.id}
                  className="group rounded-3xl border border-slate-200 bg-slate-50 p-5 shadow-sm transition hover:shadow-lg"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Offer #{offer.id}</p>
                      <h3 className="mt-3 text-lg font-bold text-slate-900">{offer.title}</h3>
                      <p className="mt-2 text-sm text-slate-500">{offer.description}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDelete(offer.id)}
                      className="rounded-2xl border border-rose-100 bg-white p-2 text-rose-600 transition hover:bg-rose-50"
                      aria-label="Delete offer"
                    >
                      <Icons.Trash className="!w-4 !h-4" />
                    </button>
                  </div>
                  <div className="mt-5 flex items-center justify-between gap-3 text-sm text-slate-600">
                    <span className="rounded-2xl bg-white px-3 py-2 font-semibold text-slate-700">{offer.discount}</span>
                    <span className="rounded-2xl bg-white px-3 py-2 text-slate-500">{offer.code}</span>
                    <span className="rounded-2xl bg-white px-3 py-2 text-slate-500">{offer.expiry}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
