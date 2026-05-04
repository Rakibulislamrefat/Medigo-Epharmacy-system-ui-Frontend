import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createAdminMedicine,
  deleteAdminMedicine,
  getAdminMedicines,
  updateAdminMedicine,
} from "../service/adminApi";
import toast from "react-hot-toast";

const formatDate = (v?: string) => {
  if (!v) return "";
  const d = new Date(v);
  return Number.isNaN(d.getTime())
    ? v
    : d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};

const parseList = (value: string) =>
  value
    .split(/[\n,]+/g)
    .map((v) => v.trim())
    .filter(Boolean);

const joinList = (items?: string[]) => (items?.length ? items.join(", ") : "");

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

  const items = paged?.items ?? [];
  const meta = paged?.meta ?? { page: 1, limit, total: 0, totalPages: 1 };

  const [createForm, setCreateForm] = useState({
    name: "",
    slug: "",
    genericName: "",
    brandName: "",
    dosageForm: "other",
    strength: "",
    description: "",
    indications: "",
    warnings: "",
    otc: true,
    requiresPrescription: false,
    categories: "",
    tags: "",
    images: "",
    sku: "",
    manufacturer: "",
    price: "",
    salePrice: "",
    currency: "BDT",
    stockQty: "",
    status: "active",
  });

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    slug: "",
    genericName: "",
    brandName: "",
    dosageForm: "other",
    strength: "",
    description: "",
    indications: "",
    warnings: "",
    otc: true,
    requiresPrescription: false,
    categories: "",
    tags: "",
    images: "",
    sku: "",
    manufacturer: "",
    price: "",
    salePrice: "",
    currency: "BDT",
    stockQty: "",
    status: "active",
  });

  const statusOptions = useMemo(() => ["active", "inactive"], []);
  const dosageFormOptions = useMemo(
    () => ["tablet", "capsule", "syrup", "injection", "cream", "drops", "other"],
    [],
  );
  const limitOptions = useMemo(() => [10, 20, 50], []);
  const [showCreateAdvanced, setShowCreateAdvanced] = useState(false);
  const [showEditAdvanced, setShowEditAdvanced] = useState(false);

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
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => deleteAdminMedicine(id),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["admin", "medicines"] });
    },
  });

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-dark">Medicines</h1>
        <p className="text-sm text-slate-500 mt-1">Manage products and stock.</p>
      </div>

      <div className="rounded-xl border border-gray-100 bg-white p-5">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-semibold text-dark">Create medicine</p>
          <button
            type="button"
            onClick={() => setShowCreateAdvanced((v) => !v)}
            className="text-xs font-semibold text-primary hover:underline"
          >
            {showCreateAdvanced ? "Hide fields" : "More fields"}
          </button>
        </div>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <input
            value={createForm.name}
            onChange={(e) => setCreateForm((p) => ({ ...p, name: e.target.value }))}
            className="h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm"
            placeholder="Name"
          />
          <input
            value={createForm.slug}
            onChange={(e) => setCreateForm((p) => ({ ...p, slug: e.target.value }))}
            className="h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm"
            placeholder="Slug (optional)"
          />
          <select
            value={createForm.dosageForm}
            onChange={(e) => setCreateForm((p) => ({ ...p, dosageForm: e.target.value }))}
            className="h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm"
          >
            {dosageFormOptions.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <input
            value={createForm.price}
            onChange={(e) => setCreateForm((p) => ({ ...p, price: e.target.value }))}
            className="h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm"
            placeholder="Price"
            inputMode="decimal"
          />
          <input
            value={createForm.stockQty}
            onChange={(e) => setCreateForm((p) => ({ ...p, stockQty: e.target.value }))}
            className="h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm"
            placeholder="Stock"
            inputMode="numeric"
          />
          <div className="flex items-center gap-2">
            <select
              value={createForm.status}
              onChange={(e) => setCreateForm((p) => ({ ...p, status: e.target.value }))}
              className="h-10 flex-1 rounded-lg border border-gray-200 bg-white px-3 text-sm"
            >
              {statusOptions.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <button
              type="button"
              disabled={createMutation.isPending}
              onClick={async () => {
                if (!createForm.name.trim()) {
                  toast.error("Name is required");
                  return;
                }
                if (!createForm.price || Number.isNaN(Number(createForm.price))) {
                  toast.error("Valid price is required");
                  return;
                }
                const t = toast.loading("Creating...");
                try {
                  await createMutation.mutateAsync();
                  toast.success("Created", { id: t });
                  setCreateForm({
                    name: "",
                    slug: "",
                    genericName: "",
                    brandName: "",
                    dosageForm: "other",
                    strength: "",
                    description: "",
                    indications: "",
                    warnings: "",
                    otc: true,
                    requiresPrescription: false,
                    categories: "",
                    tags: "",
                    images: "",
                    sku: "",
                    manufacturer: "",
                    price: "",
                    salePrice: "",
                    currency: "BDT",
                    stockQty: "",
                    status: "active",
                  });
                } catch (err: unknown) {
                  const msg =
                    (err as { response?: { data?: { message?: string } } })?.response?.data
                      ?.message ?? "Create failed";
                  toast.error(msg, { id: t });
                }
              }}
              className="h-10 px-4 rounded-lg bg-primary text-white text-sm font-semibold disabled:opacity-60"
            >
              Add
            </button>
          </div>
        </div>

        {showCreateAdvanced && (
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              value={createForm.genericName}
              onChange={(e) => setCreateForm((p) => ({ ...p, genericName: e.target.value }))}
              className="h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm"
              placeholder="Generic name"
            />
            <input
              value={createForm.brandName}
              onChange={(e) => setCreateForm((p) => ({ ...p, brandName: e.target.value }))}
              className="h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm"
              placeholder="Brand name"
            />
            <input
              value={createForm.strength}
              onChange={(e) => setCreateForm((p) => ({ ...p, strength: e.target.value }))}
              className="h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm"
              placeholder="Strength (e.g., 500mg)"
            />
            <input
              value={createForm.sku}
              onChange={(e) => setCreateForm((p) => ({ ...p, sku: e.target.value }))}
              className="h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm"
              placeholder="SKU"
            />
            <input
              value={createForm.manufacturer}
              onChange={(e) => setCreateForm((p) => ({ ...p, manufacturer: e.target.value }))}
              className="h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm"
              placeholder="Manufacturer"
            />
            <input
              value={createForm.salePrice}
              onChange={(e) => setCreateForm((p) => ({ ...p, salePrice: e.target.value }))}
              className="h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm"
              placeholder="Sale price (optional)"
              inputMode="decimal"
            />
            <input
              value={createForm.currency}
              onChange={(e) => setCreateForm((p) => ({ ...p, currency: e.target.value }))}
              className="h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm"
              placeholder="Currency (BDT)"
            />
            <div className="flex items-center gap-4">
              <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={createForm.otc}
                  onChange={(e) => setCreateForm((p) => ({ ...p, otc: e.target.checked }))}
                />
                OTC
              </label>
              <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={createForm.requiresPrescription}
                  onChange={(e) =>
                    setCreateForm((p) => ({ ...p, requiresPrescription: e.target.checked }))
                  }
                />
                Requires Rx
              </label>
            </div>
            <textarea
              value={createForm.description}
              onChange={(e) => setCreateForm((p) => ({ ...p, description: e.target.value }))}
              className="min-h-24 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm sm:col-span-2"
              placeholder="Description"
            />
            <textarea
              value={createForm.indications}
              onChange={(e) => setCreateForm((p) => ({ ...p, indications: e.target.value }))}
              className="min-h-20 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
              placeholder="Indications (comma or new line separated)"
            />
            <textarea
              value={createForm.warnings}
              onChange={(e) => setCreateForm((p) => ({ ...p, warnings: e.target.value }))}
              className="min-h-20 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
              placeholder="Warnings (comma or new line separated)"
            />
            <input
              value={createForm.categories}
              onChange={(e) => setCreateForm((p) => ({ ...p, categories: e.target.value }))}
              className="h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm"
              placeholder="Categories (comma separated)"
            />
            <input
              value={createForm.tags}
              onChange={(e) => setCreateForm((p) => ({ ...p, tags: e.target.value }))}
              className="h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm"
              placeholder="Tags (comma separated)"
            />
            <textarea
              value={createForm.images}
              onChange={(e) => setCreateForm((p) => ({ ...p, images: e.target.value }))}
              className="min-h-16 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm sm:col-span-2"
              placeholder="Image URLs (comma or new line separated)"
            />
          </div>
        )}
      </div>

      {isLoading && (
        <div className="rounded-xl border border-gray-100 bg-white p-5 animate-pulse h-48" />
      )}

      {!isLoading && (error || !paged) && (
        <div className="rounded-xl border border-red-100 bg-red-50 p-5 text-sm text-red-600">
          Failed to load medicines.
        </div>
      )}

      {!isLoading && paged && (
        <div className="rounded-xl border border-gray-100 bg-white overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <p className="text-sm font-semibold text-dark">All medicines</p>
            <span className="text-xs font-black bg-primary/10 text-primary px-3 py-1 rounded-full">
              {meta.total}
            </span>
          </div>

          <div className="px-5 py-4 border-b border-gray-100">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
                <input
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  className="h-10 w-full sm:w-[320px] rounded-lg border border-gray-200 bg-white px-3 text-sm"
                  placeholder="Search medicines (name, slug, brand, SKU...)"
                />
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setPage(1);
                  }}
                  className="h-10 w-full sm:w-[160px] rounded-lg border border-gray-200 bg-white px-3 text-sm"
                >
                  <option value="">All status</option>
                  <option value="active">active</option>
                  <option value="inactive">inactive</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-500">Rows</span>
                <select
                  value={limit}
                  onChange={(e) => {
                    setLimit(Number(e.target.value));
                    setPage(1);
                  }}
                  className="h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm"
                >
                  {limitOptions.map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-[900px] w-full">
              <thead className="bg-light">
                <tr className="text-left text-xs font-black tracking-[0.2em] uppercase text-slate-500">
                  <th className="px-5 py-3">Name</th>
                  <th className="px-5 py-3">Slug</th>
                  <th className="px-5 py-3">Price</th>
                  <th className="px-5 py-3">Stock</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Created</th>
                  <th className="px-5 py-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {items.map((m) => (
                  <tr key={m._id} className="text-sm text-dark">
                    <td className="px-5 py-3 font-semibold">{m.name}</td>
                    <td className="px-5 py-3 text-slate-600">{m.slug ?? ""}</td>
                    <td className="px-5 py-3 text-slate-600">
                      {m.price != null ? `${m.price}` : ""}
                    </td>
                    <td className="px-5 py-3 text-slate-600">
                      {m.stockQty != null ? `${m.stockQty}` : ""}
                    </td>
                    <td className="px-5 py-3 text-slate-600">{m.status ?? ""}</td>
                    <td className="px-5 py-3 text-slate-600">
                      {formatDate(m.createdAt)}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          disabled={createMutation.isPending || updateMutation.isPending || deleteMutation.isPending}
                          onClick={() => {
                            setEditingId(m._id);
                          setShowEditAdvanced(false);
                            setEditForm({
                              name: m.name ?? "",
                              slug: m.slug ?? "",
                            genericName: m.genericName ?? "",
                            brandName: m.brandName ?? "",
                            dosageForm: m.dosageForm ?? "other",
                            strength: m.strength ?? "",
                            description: m.description ?? "",
                            indications: joinList(m.indications),
                            warnings: joinList(m.warnings),
                            otc: m.otc ?? true,
                            requiresPrescription: m.requiresPrescription ?? false,
                            categories: joinList(m.categories),
                            tags: joinList(m.tags),
                            images: joinList(m.images),
                            sku: m.sku ?? "",
                            manufacturer: m.manufacturer ?? "",
                              price: m.price != null ? String(m.price) : "",
                            salePrice: m.salePrice != null ? String(m.salePrice) : "",
                            currency: m.currency ?? "BDT",
                              stockQty: m.stockQty != null ? String(m.stockQty) : "",
                              status: m.status ?? "active",
                            });
                          }}
                          className="h-9 px-3 rounded-lg border border-gray-200 bg-white text-sm font-semibold hover:bg-gray-50 disabled:opacity-60"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          disabled={deleteMutation.isPending}
                          onClick={async () => {
                            const ok = window.confirm("Delete this medicine?");
                            if (!ok) return;
                            const t = toast.loading("Deleting...");
                            try {
                              await deleteMutation.mutateAsync(m._id);
                              toast.success("Deleted", { id: t });
                            } catch (err: unknown) {
                              const msg =
                                (err as { response?: { data?: { message?: string } } })?.response?.data
                                  ?.message ?? "Delete failed";
                              toast.error(msg, { id: t });
                            }
                          }}
                          className="h-9 px-3 rounded-lg border border-red-200 bg-red-50 text-sm font-semibold text-red-600 hover:bg-red-100 disabled:opacity-60"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="px-5 py-4 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="text-sm text-slate-600">
              {meta.total === 0
                ? "No results"
                : (() => {
                    const start = (page - 1) * limit + 1;
                    const end = Math.min(meta.total, page * limit);
                    return `Showing ${start}-${end} of ${meta.total}`;
                  })()}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="h-10 px-4 rounded-lg border border-gray-200 bg-white text-sm font-semibold disabled:opacity-60"
              >
                Prev
              </button>
              <span className="text-sm font-semibold text-slate-700">
                Page {page} / {meta.totalPages}
              </span>
              <button
                type="button"
                disabled={page >= meta.totalPages}
                onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
                className="h-10 px-4 rounded-lg border border-gray-200 bg-white text-sm font-semibold disabled:opacity-60"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {editingId && (
        <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white border border-gray-100 shadow-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <p className="text-sm font-semibold text-dark">Edit medicine</p>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowEditAdvanced((v) => !v)}
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  {showEditAdvanced ? "Hide fields" : "More fields"}
                </button>
                <button
                  type="button"
                  onClick={() => setEditingId(null)}
                  className="h-9 w-9 rounded-lg hover:bg-gray-50"
                >
                  ×
                </button>
              </div>
            </div>
            <div className="p-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  value={editForm.name}
                  onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))}
                  className="h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm"
                  placeholder="Name"
                />
                <input
                  value={editForm.slug}
                  onChange={(e) => setEditForm((p) => ({ ...p, slug: e.target.value }))}
                  className="h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm"
                  placeholder="Slug"
                />
                <select
                  value={editForm.dosageForm}
                  onChange={(e) => setEditForm((p) => ({ ...p, dosageForm: e.target.value }))}
                  className="h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm"
                >
                  {dosageFormOptions.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <input
                  value={editForm.price}
                  onChange={(e) => setEditForm((p) => ({ ...p, price: e.target.value }))}
                  className="h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm"
                  placeholder="Price"
                  inputMode="decimal"
                />
                <input
                  value={editForm.salePrice}
                  onChange={(e) => setEditForm((p) => ({ ...p, salePrice: e.target.value }))}
                  className="h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm"
                  placeholder="Sale price (optional)"
                  inputMode="decimal"
                />
                <input
                  value={editForm.stockQty}
                  onChange={(e) => setEditForm((p) => ({ ...p, stockQty: e.target.value }))}
                  className="h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm"
                  placeholder="Stock"
                  inputMode="numeric"
                />
                <input
                  value={editForm.currency}
                  onChange={(e) => setEditForm((p) => ({ ...p, currency: e.target.value }))}
                  className="h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm"
                  placeholder="Currency (BDT)"
                />
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm((p) => ({ ...p, status: e.target.value }))}
                  className="h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm"
                >
                  {statusOptions.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              {showEditAdvanced && (
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    value={editForm.genericName}
                    onChange={(e) => setEditForm((p) => ({ ...p, genericName: e.target.value }))}
                    className="h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm"
                    placeholder="Generic name"
                  />
                  <input
                    value={editForm.brandName}
                    onChange={(e) => setEditForm((p) => ({ ...p, brandName: e.target.value }))}
                    className="h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm"
                    placeholder="Brand name"
                  />
                  <input
                    value={editForm.strength}
                    onChange={(e) => setEditForm((p) => ({ ...p, strength: e.target.value }))}
                    className="h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm"
                    placeholder="Strength (e.g., 500mg)"
                  />
                  <input
                    value={editForm.sku}
                    onChange={(e) => setEditForm((p) => ({ ...p, sku: e.target.value }))}
                    className="h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm"
                    placeholder="SKU"
                  />
                  <input
                    value={editForm.manufacturer}
                    onChange={(e) => setEditForm((p) => ({ ...p, manufacturer: e.target.value }))}
                    className="h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm"
                    placeholder="Manufacturer"
                  />
                  <div className="flex items-center gap-4">
                    <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                      <input
                        type="checkbox"
                        checked={editForm.otc}
                        onChange={(e) => setEditForm((p) => ({ ...p, otc: e.target.checked }))}
                      />
                      OTC
                    </label>
                    <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                      <input
                        type="checkbox"
                        checked={editForm.requiresPrescription}
                        onChange={(e) =>
                          setEditForm((p) => ({ ...p, requiresPrescription: e.target.checked }))
                        }
                      />
                      Requires Rx
                    </label>
                  </div>
                  <textarea
                    value={editForm.description}
                    onChange={(e) => setEditForm((p) => ({ ...p, description: e.target.value }))}
                    className="min-h-24 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm sm:col-span-2"
                    placeholder="Description"
                  />
                  <textarea
                    value={editForm.indications}
                    onChange={(e) => setEditForm((p) => ({ ...p, indications: e.target.value }))}
                    className="min-h-20 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
                    placeholder="Indications (comma or new line separated)"
                  />
                  <textarea
                    value={editForm.warnings}
                    onChange={(e) => setEditForm((p) => ({ ...p, warnings: e.target.value }))}
                    className="min-h-20 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
                    placeholder="Warnings (comma or new line separated)"
                  />
                  <input
                    value={editForm.categories}
                    onChange={(e) => setEditForm((p) => ({ ...p, categories: e.target.value }))}
                    className="h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm"
                    placeholder="Categories (comma separated)"
                  />
                  <input
                    value={editForm.tags}
                    onChange={(e) => setEditForm((p) => ({ ...p, tags: e.target.value }))}
                    className="h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm"
                    placeholder="Tags (comma separated)"
                  />
                  <textarea
                    value={editForm.images}
                    onChange={(e) => setEditForm((p) => ({ ...p, images: e.target.value }))}
                    className="min-h-16 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm sm:col-span-2"
                    placeholder="Image URLs (comma or new line separated)"
                  />
                </div>
              )}

              <div className="mt-5 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingId(null)}
                  className="h-10 px-4 rounded-lg border border-gray-200 bg-white text-sm font-semibold hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={updateMutation.isPending}
                  onClick={async () => {
                    if (!editingId) return;
                    if (!editForm.name.trim()) {
                      toast.error("Name is required");
                      return;
                    }
                    if (!editForm.price || Number.isNaN(Number(editForm.price))) {
                      toast.error("Valid price is required");
                      return;
                    }
                    const t = toast.loading("Saving...");
                    try {
                      await updateMutation.mutateAsync({ id: editingId });
                      toast.success("Saved", { id: t });
                      setEditingId(null);
                    } catch (err: unknown) {
                      const msg =
                        (err as { response?: { data?: { message?: string } } })?.response?.data
                          ?.message ?? "Save failed";
                      toast.error(msg, { id: t });
                    }
                  }}
                  className="h-10 px-4 rounded-lg bg-primary text-white text-sm font-semibold disabled:opacity-60"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
