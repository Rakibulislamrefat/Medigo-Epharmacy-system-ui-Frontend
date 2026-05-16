import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  type AdminDoctor,
  createAdminDoctor,
  createAdminDoctorUser,
  deleteAdminDoctor,
  getAdminDoctors,
  updateAdminDoctor,
} from "../service/adminApi";
import toast from "react-hot-toast";

const getApiErrorMessage = (err: unknown, fallback: string) => {
  const data = (err as { response?: { data?: { message?: string; errors?: string[] } } })?.response
    ?.data;
  return data?.errors?.[0] ?? data?.message ?? fallback;
};

const passwordPattern = /^(?=.*[A-Z])(?=.*\d).{8,64}$/;
const bdPhonePattern = /^(?:\+?88)?01[3-9]\d{8}$/;

const specializationOptions = [
  "General Physician",
  "Dermatology",
  "Pediatrics",
  "Gynecology",
  "Cardiology",
  "Diabetology",
  "ENT",
  "Orthopedics",
] as const;

const formatDate = (v?: string) => {
  if (!v) return "";
  const d = new Date(v);
  return Number.isNaN(d.getTime())
    ? v
    : d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};

export default function AdminDoctorsPage() {
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
    queryKey: ["admin", "doctors", { q, statusFilter, page, limit }],
    queryFn: () =>
      getAdminDoctors({
        q: q || undefined,
        status: statusFilter || undefined,
        page,
        limit,
      }),
    retry: 1,
  });

  const _rawItems = paged?.items;
  const items: AdminDoctor[] = Array.isArray(_rawItems)
    ? _rawItems
    : Array.isArray((_rawItems as any)?.items)
    ? (_rawItems as any).items
    : [];
  const meta = paged?.meta ?? { page: 1, limit, total: 0, totalPages: 1 };

  const [createForm, setCreateForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    specialization: "",
    status: "active",
  });

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    fullName: "",
    specialization: "",
    status: "active",
  });

  const statusOptions = useMemo(() => ["active", "inactive"], []);
  const limitOptions = useMemo(() => [10, 20, 50], []);

  const createMutation = useMutation({
    mutationFn: async (payload: {
      fullName: string;
      email: string;
      phone: string;
      password: string;
      specialization?: string;
      status: string;
    }) => {
      const user = await createAdminDoctorUser({
        name: payload.fullName,
        email: payload.email,
        phone: payload.phone,
        password: payload.password,
      });

      if (!user.id) {
        throw new Error("Doctor user was created but no user ID was returned");
      }

      return createAdminDoctor({
        userId: user.id,
        fullName: payload.fullName,
        specialization: payload.specialization,
        status: payload.status,
      });
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["admin", "doctors"] });
      await qc.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (args: { id: string }) =>
      updateAdminDoctor(args.id, {
        fullName: editForm.fullName.trim() || undefined,
        specialization: editForm.specialization.trim() || undefined,
        status: editForm.status,
      }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["admin", "doctors"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => deleteAdminDoctor(id),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["admin", "doctors"] });
    },
  });

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-dark">Doctors</h1>
        <p className="text-sm text-slate-500 mt-1">Manage doctor profiles.</p>
      </div>

      <div className="rounded-xl border border-gray-100 bg-white p-5">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-semibold text-dark">Create doctor</p>
        </div>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <input
            value={createForm.fullName}
            onChange={(e) => setCreateForm((p) => ({ ...p, fullName: e.target.value }))}
            className="h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm"
            placeholder="Full name"
          />
          <input
            value={createForm.email}
            onChange={(e) => setCreateForm((p) => ({ ...p, email: e.target.value }))}
            className="h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm"
            placeholder="Email"
            type="email"
          />
          <input
            value={createForm.phone}
            onChange={(e) => setCreateForm((p) => ({ ...p, phone: e.target.value }))}
            className="h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm"
            placeholder="Phone 01XXXXXXXXX"
            inputMode="tel"
          />
          <input
            value={createForm.password}
            onChange={(e) => setCreateForm((p) => ({ ...p, password: e.target.value }))}
            className="h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm"
            placeholder="Temporary password"
            type="password"
          />
          <select
            value={createForm.specialization}
            onChange={(e) => setCreateForm((p) => ({ ...p, specialization: e.target.value }))}
            className="h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm"
          >
            <option value="">Select category</option>
            {specializationOptions.map((specialty) => (
              <option key={specialty} value={specialty}>
                {specialty}
              </option>
            ))}
          </select>
          <select
            value={createForm.status}
            onChange={(e) => setCreateForm((p) => ({ ...p, status: e.target.value }))}
            className="h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm"
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
              if (!createForm.fullName.trim()) {
                toast.error("Full name is required");
                return;
              }
              if (!createForm.email.trim()) {
                toast.error("Email is required");
                return;
              }
              if (!createForm.phone.trim()) {
                toast.error("Phone is required");
                return;
              }
              if (!bdPhonePattern.test(createForm.phone.trim().replace(/[\s-]/g, ""))) {
                toast.error("Use a valid Bangladeshi phone number");
                return;
              }
              if (!passwordPattern.test(createForm.password)) {
                toast.error("Password needs 8+ characters, one uppercase letter, and one number");
                return;
              }
              const t = toast.loading("Creating...");
              try {
                await createMutation.mutateAsync({
                  fullName: createForm.fullName.trim(),
                  email: createForm.email.trim().toLowerCase(),
                  phone: createForm.phone.trim().replace(/[\s-]/g, ""),
                  password: createForm.password,
                  specialization: createForm.specialization.trim() || undefined,
                  status: createForm.status,
                });
                toast.success("Created", { id: t });
                setCreateForm({
                  fullName: "",
                  email: "",
                  phone: "",
                  password: "",
                  specialization: "",
                  status: "active",
                });
              } catch (err: unknown) {
                toast.error(getApiErrorMessage(err, "Create failed"), { id: t });
              }
            }}
            className="h-10 px-4 rounded-lg bg-primary text-white text-sm font-semibold disabled:opacity-60"
          >
            Add
          </button>
        </div>
      </div>

      {isLoading && (
        <div className="rounded-xl border border-gray-100 bg-white p-5 animate-pulse h-48" />
      )}

      {!isLoading && (error || !paged) && (
        <div className="rounded-xl border border-red-100 bg-red-50 p-5 text-sm text-red-600">
          Failed to load doctors.
        </div>
      )}

      {!isLoading && paged && (
        <div className="rounded-xl border border-gray-100 bg-white overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <p className="text-sm font-semibold text-dark">All doctors</p>
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
                  placeholder="Search doctors (name, specialization)"
                />
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setPage(1);
                  }}
                  className="h-10 w-full sm:w-[180px] rounded-lg border border-gray-200 bg-white px-3 text-sm"
                >
                  <option value="">All status</option>
                  {statusOptions.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
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
            <table className="min-w-[860px] w-full">
              <thead className="bg-light">
                <tr className="text-left text-xs font-black tracking-[0.2em] uppercase text-slate-500">
                  <th className="px-5 py-3">User</th>
                  <th className="px-5 py-3">Name</th>
                  <th className="px-5 py-3">Specialization</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Created</th>
                  <th className="px-5 py-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {items.map((d) => (
                  <tr key={d._id} className="text-sm text-dark">
                    <td className="px-5 py-3 text-slate-600">
                      {d.user ? `${d.user.name} (${d.user.email})` : "—"}
                    </td>
                    <td className="px-5 py-3 font-semibold">{d.fullName}</td>
                    <td className="px-5 py-3 text-slate-600">
                      {d.specialization ?? ""}
                    </td>
                    <td className="px-5 py-3 text-slate-600">{d.status ?? ""}</td>
                    <td className="px-5 py-3 text-slate-600">
                      {formatDate(d.createdAt)}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          disabled={createMutation.isPending || updateMutation.isPending || deleteMutation.isPending}
                          onClick={() => {
                            setEditingId(d._id);
                            setEditForm({
                              fullName: d.fullName ?? "",
                              specialization: d.specialization ?? "",
                              status: d.status ?? "active",
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
                            const ok = window.confirm("Delete this doctor?");
                            if (!ok) return;
                            const t = toast.loading("Deleting...");
                            try {
                              await deleteMutation.mutateAsync(d._id);
                              toast.success("Deleted", { id: t });
                            } catch (err: unknown) {
                              toast.error(getApiErrorMessage(err, "Delete failed"), { id: t });
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
              <p className="text-sm font-semibold text-dark">Edit doctor</p>
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
                  value={editForm.fullName}
                  onChange={(e) => setEditForm((p) => ({ ...p, fullName: e.target.value }))}
                  className="h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm"
                  placeholder="Full name"
                />
                <select
                  value={editForm.specialization}
                  onChange={(e) =>
                    setEditForm((p) => ({ ...p, specialization: e.target.value }))
                  }
                  className="h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm"
                >
                  <option value="">Select category</option>
                  {specializationOptions.map((specialty) => (
                    <option key={specialty} value={specialty}>
                      {specialty}
                    </option>
                  ))}
                </select>
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
                    if (!editForm.fullName.trim()) {
                      toast.error("Full name is required");
                      return;
                    }
                    const t = toast.loading("Saving...");
                    try {
                      await updateMutation.mutateAsync({ id: editingId });
                      toast.success("Saved", { id: t });
                      setEditingId(null);
                    } catch (err: unknown) {
                      toast.error(getApiErrorMessage(err, "Save failed"), { id: t });
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
