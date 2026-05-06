import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createAdminMedicine,
  deleteAdminMedicine,
  getAdminMedicines,
  updateAdminMedicine,
} from "../service/adminApi";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, Plus, Pill, Edit2, Trash2, X, ChevronLeft, ChevronRight, 
  Settings2, Activity, Filter, Box
} from "lucide-react";
import clsx from "clsx";

const parseList = (value: string) =>
  value
    .split(/\n+/g)
    .map((v) => v.trim())
    .filter(Boolean);

const joinList = (items?: string[]) => (items?.length ? items.join("\n") : "");

const toNumberOrUndefined = (v: string) => {
  const t = v.trim();
  if (!t) return undefined;
  const n = Number(t);
  return Number.isNaN(n) ? undefined : n;
};

export default function AdminMedicinesPage() {
  const qc = useQueryClient();
  const [searchText, setSearchText] = useState("");
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  useEffect(() => {
    const t = window.setTimeout(() => {
      setQ(searchText.trim());
      setPage(1);
    }, 400);
    return () => window.clearTimeout(t);
  }, [searchText]);

  const { data: paged, isLoading, error } = useQuery({
    queryKey: ["admin", "medicines", { q, statusFilter, page, limit }],
    queryFn: () =>
      getAdminMedicines({
        q: q || undefined,
        status: statusFilter || undefined,
        page,
        limit,
      }),
    retry: 1,
  });

  const items = Array.isArray(paged?.items) ? paged.items : [];
  const meta = paged?.meta ?? { page: 1, limit, total: 0, totalPages: 1 };

  const initialFormState = {
    name: "", slug: "", genericName: "", brandName: "",
    dosageForm: "other", strength: "", description: "",
    indications: "", warnings: "", otc: true,
    requiresPrescription: false, categories: "", tags: "",
    images: "", sku: "", manufacturer: "", price: "",
    salePrice: "", currency: "BDT", stockQty: "", status: "active",
  };

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createForm, setCreateForm] = useState(initialFormState);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState(initialFormState);

  const statusOptions = useMemo(() => ["active", "inactive"], []);
  const dosageFormOptions = useMemo(
    () => ["tablet", "capsule", "syrup", "injection", "cream", "drops", "other"],
    [],
  );
  const limitOptions = useMemo(() => [10, 20, 50], []);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const createMutation = useMutation({
    mutationFn: async () =>
      createAdminMedicine({
        name: createForm.name.trim(),
        slug: createForm.slug.trim() ? createForm.slug.trim() : undefined,
        genericName: createForm.genericName.trim() || undefined,
        brandName: createForm.brandName.trim() || undefined,
        dosageForm: createForm.dosageForm,
        strength: createForm.strength.trim() || undefined,
        description: createForm.description.trim() || undefined,
        indications: createForm.indications.trim() ? parseList(createForm.indications) : undefined,
        warnings: createForm.warnings.trim() ? parseList(createForm.warnings) : undefined,
        otc: createForm.otc,
        requiresPrescription: createForm.requiresPrescription,
        categories: createForm.categories.trim() ? parseList(createForm.categories) : undefined,
        tags: createForm.tags.trim() ? parseList(createForm.tags) : undefined,
        images: createForm.images.trim() ? parseList(createForm.images) : undefined,
        sku: createForm.sku.trim() || undefined,
        manufacturer: createForm.manufacturer.trim() || undefined,
        price: Number(createForm.price),
        salePrice: toNumberOrUndefined(createForm.salePrice) ?? null,
        currency: createForm.currency.trim() || "BDT",
        stockQty: createForm.stockQty ? Number(createForm.stockQty) : undefined,
        status: createForm.status,
      }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["admin", "medicines"] });
      setIsCreateModalOpen(false);
      setCreateForm(initialFormState);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (args: { id: string }) =>
      updateAdminMedicine(args.id, {
        name: editForm.name.trim(),
        slug: editForm.slug.trim() ? editForm.slug.trim() : undefined,
        genericName: editForm.genericName.trim() || undefined,
        brandName: editForm.brandName.trim() || undefined,
        dosageForm: editForm.dosageForm,
        strength: editForm.strength.trim() || undefined,
        description: editForm.description.trim() || undefined,
        indications: editForm.indications.trim() ? parseList(editForm.indications) : undefined,
        warnings: editForm.warnings.trim() ? parseList(editForm.warnings) : undefined,
        otc: editForm.otc,
        requiresPrescription: editForm.requiresPrescription,
        categories: editForm.categories.trim() ? parseList(editForm.categories) : undefined,
        tags: editForm.tags.trim() ? parseList(editForm.tags) : undefined,
        images: editForm.images.trim() ? parseList(editForm.images) : undefined,
        sku: editForm.sku.trim() || undefined,
        manufacturer: editForm.manufacturer.trim() || undefined,
        price: Number(editForm.price),
        salePrice: toNumberOrUndefined(editForm.salePrice) ?? null,
        currency: editForm.currency.trim() || "BDT",
        stockQty: editForm.stockQty ? Number(editForm.stockQty) : undefined,
        status: editForm.status,
      }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["admin", "medicines"] });
      setEditingId(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => deleteAdminMedicine(id),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["admin", "medicines"] });
    },
  });

  const handleSave = async (isEdit: boolean) => {
    const form = isEdit ? editForm : createForm;
    if (!form.name.trim()) return toast.error("Name is required");
    if (!form.price || Number.isNaN(Number(form.price))) return toast.error("Valid price is required");
    
    const t = toast.loading(isEdit ? "Saving..." : "Creating...");
    try {
      if (isEdit && editingId) {
        await updateMutation.mutateAsync({ id: editingId });
      } else {
        await createMutation.mutateAsync();
      }
      toast.success(isEdit ? "Saved" : "Created", { id: t });
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Operation failed";
      toast.error(msg, { id: t });
    }
  };

  const PREDEFINED_CATEGORIES = [
    "Prescription Medicine",
    "Surgical Product",
    "OTC Medicine",
    "Dental & Oral Care",
    "Woman Care",
    "Baby Care",
    "Personal Care",
    "Diabetic Care"
  ];

  const handleCategoryToggle = (category: string, isEdit: boolean) => {
    const setForm = isEdit ? setEditForm : setCreateForm;
    setForm(prev => {
      const currentCategories = parseList(prev.categories);
      const newCategories = currentCategories.includes(category)
        ? currentCategories.filter(c => c !== category)
        : [...currentCategories, category];
      return { ...prev, categories: newCategories.join("\n") };
    });
  };

  const renderFormFields = (
    form: typeof initialFormState, 
    setForm: React.Dispatch<React.SetStateAction<typeof initialFormState>>,
    isEdit: boolean
  ) => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Medicine Name *</label>
          <input value={form.name} onChange={e => setForm(p => ({...p, name: e.target.value}))} className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50/50 px-4 text-sm focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="e.g. Paracetamol" />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Slug (Optional)</label>
          <input value={form.slug} onChange={e => setForm(p => ({...p, slug: e.target.value}))} className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50/50 px-4 text-sm focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="paracetamol-500mg" />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Dosage Form</label>
          <select value={form.dosageForm} onChange={e => setForm(p => ({...p, dosageForm: e.target.value}))} className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50/50 px-4 text-sm focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all">
            {dosageFormOptions.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Price *</label>
          <input value={form.price} onChange={e => setForm(p => ({...p, price: e.target.value}))} inputMode="decimal" className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50/50 px-4 text-sm focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="0.00" />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Stock Qty</label>
          <input value={form.stockQty} onChange={e => setForm(p => ({...p, stockQty: e.target.value}))} inputMode="numeric" className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50/50 px-4 text-sm focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="100" />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</label>
          <select value={form.status} onChange={e => setForm(p => ({...p, status: e.target.value}))} className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50/50 px-4 text-sm focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all">
            {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <div>
        <button type="button" onClick={() => setShowAdvanced(!showAdvanced)} className="flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary/80 transition-colors">
          <Settings2 className="w-4 h-4" />
          {showAdvanced ? "Hide Advanced Fields" : "Show Advanced Fields"}
        </button>
      </div>

      <AnimatePresence>
        {showAdvanced && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="grid grid-cols-1 sm:grid-cols-2 gap-4 overflow-hidden pt-2">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Generic Name</label>
              <input value={form.genericName} onChange={e => setForm(p => ({...p, genericName: e.target.value}))} className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50/50 px-4 text-sm focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Brand Name</label>
              <input value={form.brandName} onChange={e => setForm(p => ({...p, brandName: e.target.value}))} className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50/50 px-4 text-sm focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Strength</label>
              <input value={form.strength} onChange={e => setForm(p => ({...p, strength: e.target.value}))} placeholder="e.g. 500mg" className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50/50 px-4 text-sm focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">SKU</label>
              <input value={form.sku} onChange={e => setForm(p => ({...p, sku: e.target.value}))} className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50/50 px-4 text-sm focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Manufacturer</label>
              <input value={form.manufacturer} onChange={e => setForm(p => ({...p, manufacturer: e.target.value}))} className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50/50 px-4 text-sm focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Sale Price (Optional)</label>
              <input value={form.salePrice} onChange={e => setForm(p => ({...p, salePrice: e.target.value}))} inputMode="decimal" className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50/50 px-4 text-sm focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
            </div>
            <div className="space-y-1 sm:col-span-2">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Description</label>
              <textarea value={form.description} onChange={e => setForm(p => ({...p, description: e.target.value}))} className="w-full min-h-[100px] rounded-xl border border-slate-200 bg-slate-50/50 p-4 text-sm focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-y" />
            </div>
            <div className="flex items-center gap-6 sm:col-span-2 p-4 rounded-xl bg-slate-50 border border-slate-100">
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative flex items-center justify-center">
                  <input type="checkbox" checked={form.otc} onChange={e => setForm(p => ({...p, otc: e.target.checked}))} className="peer sr-only" />
                  <div className="w-5 h-5 rounded border border-slate-300 peer-checked:bg-primary peer-checked:border-primary transition-colors flex items-center justify-center">
                    <motion.div initial={false} animate={{ scale: form.otc ? 1 : 0 }} className="w-2.5 h-2.5 bg-white rounded-sm" />
                  </div>
                </div>
                <span className="text-sm font-semibold text-slate-700 group-hover:text-slate-900">Over-the-Counter (OTC)</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative flex items-center justify-center">
                  <input type="checkbox" checked={form.requiresPrescription} onChange={e => setForm(p => ({...p, requiresPrescription: e.target.checked}))} className="peer sr-only" />
                  <div className="w-5 h-5 rounded border border-slate-300 peer-checked:bg-primary peer-checked:border-primary transition-colors flex items-center justify-center">
                    <motion.div initial={false} animate={{ scale: form.requiresPrescription ? 1 : 0 }} className="w-2.5 h-2.5 bg-white rounded-sm" />
                  </div>
                </div>
                <span className="text-sm font-semibold text-slate-700 group-hover:text-slate-900">Requires Prescription</span>
              </label>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Indications (One per line)</label>
              <textarea value={form.indications} onChange={e => setForm(p => ({...p, indications: e.target.value}))} className="w-full min-h-[100px] rounded-xl border border-slate-200 bg-slate-50/50 p-4 text-sm focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-y" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Warnings (One per line)</label>
              <textarea value={form.warnings} onChange={e => setForm(p => ({...p, warnings: e.target.value}))} className="w-full min-h-[100px] rounded-xl border border-slate-200 bg-slate-50/50 p-4 text-sm focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-y" />
            </div>
            <div className="space-y-3 sm:col-span-2">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Categories</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {PREDEFINED_CATEGORIES.map(category => (
                  <label key={category} className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-white cursor-pointer hover:border-primary/50 transition-colors group">
                    <div className="relative flex items-center justify-center shrink-0">
                      <input 
                        type="checkbox" 
                        checked={parseList(form.categories).includes(category)}
                        onChange={() => handleCategoryToggle(category, isEdit)} 
                        className="peer sr-only" 
                      />
                      <div className="w-5 h-5 rounded border border-slate-300 peer-checked:bg-primary peer-checked:border-primary transition-colors flex items-center justify-center">
                        <motion.div initial={false} animate={{ scale: parseList(form.categories).includes(category) ? 1 : 0 }} className="w-2.5 h-2.5 bg-white rounded-sm" />
                      </div>
                    </div>
                    <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900 select-none">{category}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="space-y-1 sm:col-span-2">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Images URLs (One per line)</label>
              <textarea value={form.images} onChange={e => setForm(p => ({...p, images: e.target.value}))} className="w-full min-h-[100px] rounded-xl border border-slate-200 bg-slate-50/50 p-4 text-sm focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-y" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="space-y-6 pb-20"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 rounded-3xl border border-white/60 shadow-sm backdrop-blur-md">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
            <Pill className="w-8 h-8 text-primary" />
            Medicine Inventory
          </h1>
          <p className="text-sm text-slate-500 mt-2 font-medium">Manage all products, pricing, and stock levels effortlessly.</p>
        </div>
        <button
          onClick={() => {
            setCreateForm(initialFormState);
            setIsCreateModalOpen(true);
            setShowAdvanced(false);
          }}
          className="group relative inline-flex h-12 items-center justify-center overflow-hidden rounded-xl bg-primary px-6 font-semibold text-white shadow-lg shadow-primary/30 transition-all hover:scale-[1.02] hover:shadow-xl hover:shadow-primary/40 active:scale-95"
        >
          <span className="mr-2 relative z-10"><Plus className="w-5 h-5" /></span>
          <span className="relative z-10">Add Medicine</span>
          <div className="absolute inset-0 h-full w-full bg-gradient-to-tr from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-out" />
        </button>
      </div>

      <div className="rounded-3xl border border-slate-200/60 bg-white/70 backdrop-blur-xl shadow-xl shadow-slate-200/40 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-white/50">
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center w-full sm:w-auto">
            <div className="relative group w-full sm:w-[360px]">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
              <input
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="h-11 w-full rounded-xl border border-slate-200 bg-white/80 pl-11 pr-4 text-sm focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all shadow-sm"
                placeholder="Search by name, brand, SKU..."
              />
            </div>
            <div className="relative w-full sm:w-[160px]">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="h-11 w-full rounded-xl border border-slate-200 bg-white/80 pl-11 pr-4 text-sm focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all shadow-sm appearance-none"
              >
                <option value="">All Statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
          
          <div className="flex items-center gap-3 self-end sm:self-auto">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Rows</span>
            <select
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setPage(1);
              }}
              className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm focus:border-primary outline-none shadow-sm cursor-pointer"
            >
              {limitOptions.map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto min-h-[400px]">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-64 gap-4">
              <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
              <p className="text-sm font-semibold text-slate-500 animate-pulse">Loading medicines...</p>
            </div>
          ) : error || !paged ? (
            <div className="flex flex-col items-center justify-center h-64 gap-3 text-red-500">
              <Activity className="w-10 h-10" />
              <p className="text-sm font-semibold">Failed to load medicines. Please try again.</p>
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 gap-3 text-slate-400">
              <Box className="w-12 h-12 stroke-[1.5]" />
              <p className="text-base font-semibold">No medicines found</p>
              <p className="text-sm text-slate-500">Try adjusting your search or filters.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Medicine Details</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Price & Stock</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Status</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/80">
                <AnimatePresence mode="popLayout">
                  {items.map((m, idx) => (
                    <motion.tr 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2, delay: idx * 0.05 }}
                      key={m._id} 
                      className="group hover:bg-slate-50/60 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-800 text-sm group-hover:text-primary transition-colors">{m.name}</span>
                          <span className="text-xs font-medium text-slate-500 mt-0.5">{m.genericName || m.slug}</span>
                          <div className="flex gap-2 mt-1.5">
                            {m.dosageForm && <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600">{m.dosageForm}</span>}
                            {m.requiresPrescription && <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-rose-100 text-rose-600">Rx</span>}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-800 text-sm">{m.price != null ? `৳${m.price}` : "-"}</span>
                          <span className={clsx("text-xs font-semibold mt-1", (m.stockQty || 0) < 10 ? "text-rose-500" : "text-emerald-500")}>
                            {m.stockQty != null ? `${m.stockQty} in stock` : "N/A"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={clsx(
                          "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wide",
                          m.status === "active" ? "bg-emerald-100/80 text-emerald-700" : "bg-slate-100 text-slate-600"
                        )}>
                          <span className={clsx("w-1.5 h-1.5 rounded-full", m.status === "active" ? "bg-emerald-500" : "bg-slate-400")} />
                          {m.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => {
                              setEditForm({
                                name: m.name ?? "", slug: m.slug ?? "", genericName: m.genericName ?? "",
                                brandName: m.brandName ?? "", dosageForm: m.dosageForm ?? "other",
                                strength: m.strength ?? "", description: m.description ?? "",
                                indications: joinList(m.indications), warnings: joinList(m.warnings),
                                otc: m.otc ?? true, requiresPrescription: m.requiresPrescription ?? false,
                                categories: joinList(m.categories), tags: joinList(m.tags),
                                images: joinList(m.images), sku: m.sku ?? "", manufacturer: m.manufacturer ?? "",
                                price: m.price != null ? String(m.price) : "", salePrice: m.salePrice != null ? String(m.salePrice) : "",
                                currency: m.currency ?? "BDT", stockQty: m.stockQty != null ? String(m.stockQty) : "",
                                status: m.status ?? "active",
                              });
                              setShowAdvanced(false);
                              setEditingId(m._id);
                            }}
                            className="p-2 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 hover:text-indigo-700 transition-colors tooltip"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={async () => {
                              if (!window.confirm(`Delete ${m.name}?`)) return;
                              const t = toast.loading("Deleting...");
                              try {
                                await deleteMutation.mutateAsync(m._id);
                                toast.success("Deleted successfully", { id: t });
                              } catch {
                                toast.error("Failed to delete", { id: t });
                              }
                            }}
                            className="p-2 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 hover:text-rose-700 transition-colors tooltip"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          )}
        </div>

        <div className="p-4 sm:px-6 sm:py-5 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm font-medium text-slate-500">
            {meta.total === 0 ? "No records found" : `Showing ${(page - 1) * limit + 1} to ${Math.min(meta.total, page * limit)} of ${meta.total} entries`}
          </p>
          <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl shadow-sm border border-slate-200">
            <button
              disabled={page <= 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
              className="p-2 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:hover:bg-transparent text-slate-600 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="px-4 text-sm font-bold text-slate-700">
              {page} <span className="text-slate-400 font-medium">/ {meta.totalPages}</span>
            </div>
            <button
              disabled={page >= meta.totalPages}
              onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))}
              className="p-2 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:hover:bg-transparent text-slate-600 transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {(isCreateModalOpen || editingId) && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              onClick={() => { setIsCreateModalOpen(false); setEditingId(null); }}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-3xl max-h-[90vh] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-100"
            >
              <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                    {editingId ? <Edit2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  </div>
                  {editingId ? "Edit Medicine" : "Add New Medicine"}
                </h2>
                <button 
                  onClick={() => { setIsCreateModalOpen(false); setEditingId(null); }}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
                {editingId ? renderFormFields(editForm, setEditForm, true) : renderFormFields(createForm, setCreateForm, false)}
              </div>

              <div className="px-6 py-5 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3">
                <button
                  onClick={() => { setIsCreateModalOpen(false); setEditingId(null); }}
                  className="px-6 h-11 rounded-xl font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-colors shadow-sm"
                >
                  Cancel
                </button>
                <button
                  disabled={createMutation.isPending || updateMutation.isPending}
                  onClick={() => handleSave(!!editingId)}
                  className="px-8 h-11 rounded-xl font-bold text-white bg-primary hover:bg-primary/90 transition-colors shadow-lg shadow-primary/30 flex items-center gap-2 disabled:opacity-70"
                >
                  {createMutation.isPending || updateMutation.isPending ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : editingId ? "Save Changes" : "Create Medicine"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
