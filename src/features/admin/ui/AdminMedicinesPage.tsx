import { useMemo, useState } from "react";
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

export default function AdminMedicinesPage() {
  const qc = useQueryClient();
  const { data, isLoading, error } = useQuery({
    queryKey: ["admin", "medicines"],
    queryFn: getAdminMedicines,
    retry: 1,
  });

  const [createForm, setCreateForm] = useState({
    name: "",
    slug: "",
    price: "",
    stockQty: "",
    status: "active",
  });

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    slug: "",
    price: "",
    stockQty: "",
    status: "active",
  });

  const statusOptions = useMemo(() => ["active", "inactive"], []);

  const createMutation = useMutation({
    mutationFn: async () =>
      createAdminMedicine({
        name: createForm.name.trim(),
        slug: createForm.slug.trim() ? createForm.slug.trim() : undefined,
        price: Number(createForm.price),
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
        price: Number(editForm.price),
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
                  setCreateForm({ name: "", slug: "", price: "", stockQty: "", status: "active" });
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
      </div>

      {isLoading && (
        <div className="rounded-xl border border-gray-100 bg-white p-5 animate-pulse h-48" />
      )}

      {!isLoading && (error || !data) && (
        <div className="rounded-xl border border-red-100 bg-red-50 p-5 text-sm text-red-600">
          Failed to load medicines.
        </div>
      )}

      {!isLoading && data && (
        <div className="rounded-xl border border-gray-100 bg-white overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <p className="text-sm font-semibold text-dark">All medicines</p>
            <span className="text-xs font-black bg-primary/10 text-primary px-3 py-1 rounded-full">
              {data.length}
            </span>
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
                {data.map((m) => (
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
                            setEditForm({
                              name: m.name ?? "",
                              slug: m.slug ?? "",
                              price: m.price != null ? String(m.price) : "",
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
        </div>
      )}

      {editingId && (
        <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white border border-gray-100 shadow-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <p className="text-sm font-semibold text-dark">Edit medicine</p>
              <button
                type="button"
                onClick={() => setEditingId(null)}
                className="h-9 w-9 rounded-lg hover:bg-gray-50"
              >
                ×
              </button>
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
                <input
                  value={editForm.price}
                  onChange={(e) => setEditForm((p) => ({ ...p, price: e.target.value }))}
                  className="h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm"
                  placeholder="Price"
                  inputMode="decimal"
                />
                <input
                  value={editForm.stockQty}
                  onChange={(e) => setEditForm((p) => ({ ...p, stockQty: e.target.value }))}
                  className="h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm"
                  placeholder="Stock"
                  inputMode="numeric"
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
