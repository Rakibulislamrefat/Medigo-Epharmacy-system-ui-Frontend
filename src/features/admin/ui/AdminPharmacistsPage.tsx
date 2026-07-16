import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getAdminUsers, updateAdminUser, createAdminPharmacist, resetAdminUserPassword } from "../service/adminApi";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Users, Filter, Mail, Phone, Shield, Key, Plus, RefreshCcw, Activity } from "lucide-react";
import clsx from "clsx";

const statuses = ["active", "pending", "blocked"];

const formatDate = (v?: string) => {
  if (!v) return "";
  const d = new Date(v);
  return Number.isNaN(d.getTime())
    ? v
    : d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};

export default function AdminPharmacistsPage() {
  const qc = useQueryClient();
  const [searchText, setSearchText] = useState("");
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [draft, setDraft] = useState<Record<string, { status: string }>>({});
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", status: "active" });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setQ(searchText.trim());
      setPage(1);
    }, 400);
    return () => window.clearTimeout(timer);
  }, [searchText]);

  const { data: paged, isLoading, error } = useQuery({
    queryKey: ["admin", "pharmacists", { q, statusFilter, page, limit }],
    queryFn: () =>
      getAdminUsers({
        q: q || undefined,
        role: "pharmacist",
        status: statusFilter || undefined,
        page,
        limit,
      }),
    retry: 1,
  });

  const users = paged?.items ?? [];
  const meta = paged?.meta ?? { page: 1, limit, total: 0, totalPages: 1 };

  const updateMutation = useMutation({
    mutationFn: async (args: { id: string; status: string }) => updateAdminUser(args.id, { status: args.status }),
    onSuccess: async () => await qc.invalidateQueries({ queryKey: ["admin", "pharmacists"] }),
  });

  const createMutation = useMutation({
    mutationFn: async (payload: { name: string; email: string; phone: string; password: string; status: string }) =>
      createAdminPharmacist(payload),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["admin", "pharmacists"] });
      setForm({ name: "", email: "", phone: "", password: "", status: "active" });
    },
  });

  const resetMutation = useMutation({
    mutationFn: async (userId: string) => resetAdminUserPassword(userId),
    onSuccess: async () => await qc.invalidateQueries({ queryKey: ["admin", "pharmacists"] }),
  });

  const validateForm = () => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = "Name is required";
    if (!form.email.trim()) errs.email = "Email is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = "Enter a valid email";
    if (!form.phone.trim()) errs.phone = "Phone is required";
    if (!form.password.trim()) errs.password = "Password is required";
    if (form.password && form.password.length < 8) errs.password = "Password must be at least 8 characters";
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="space-y-6 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 rounded-3xl border border-white/60 shadow-sm backdrop-blur-md">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
            <Users className="w-8 h-8 text-primary" />
            Pharmacist Management
          </h1>
          <p className="text-sm text-slate-500 mt-2 font-medium">Create and manage pharmacist profiles, account status, and password resets.</p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-3xl border border-slate-200/60 bg-white/80 backdrop-blur-xl shadow-xl shadow-slate-200/40 overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-slate-50/80">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Create Pharmacist</h2>
                <p className="text-sm text-slate-500 mt-1">Add a licensed pharmacist profile and email them the temporary password.</p>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-xs font-semibold text-slate-600 border border-slate-200">
                <Plus className="w-4 h-4 text-primary" /> New profile
              </div>
            </div>
          </div>

          <div className="p-6 space-y-4">
            {([{
              label: "Name",
              value: form.name,
              error: formErrors.name,
              placeholder: "Full name",
              onChange: (value: string) => setForm((prev) => ({ ...prev, name: value })),
            }, {
              label: "Email",
              value: form.email,
              error: formErrors.email,
              placeholder: "pharmacist@example.com",
              onChange: (value: string) => setForm((prev) => ({ ...prev, email: value })),
            }, {
              label: "Phone",
              value: form.phone,
              error: formErrors.phone,
              placeholder: "+8801XXXXXXXXX",
              onChange: (value: string) => setForm((prev) => ({ ...prev, phone: value })),
            }, {
              label: "Password",
              value: form.password,
              error: formErrors.password,
              placeholder: "Enter a secure password",
              type: "password",
              onChange: (value: string) => setForm((prev) => ({ ...prev, password: value })),
            }] as const).map((field) => (
              <div key={field.label}>
                <label className="block text-sm font-semibold text-slate-700 mb-2">{field.label}</label>
                <input
                  value={field.value}
                  type={(field as any).type ?? "text"}
                  onChange={(e) => field.onChange(e.target.value)}
                  placeholder={field.placeholder}
                  className={clsx(
                    "w-full rounded-2xl border px-4 py-3 text-sm outline-none transition",
                    field.error ? "border-rose-300 bg-rose-50 focus:ring-rose-200" : "border-slate-200 bg-white focus:border-primary focus:ring-primary/20"
                  )}
                />
                {field.error && <p className="text-xs text-rose-500 mt-1">{field.error}</p>}
              </div>
            ))}

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value }))}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm focus:border-primary outline-none focus:ring-2 focus:ring-primary/20"
              >
                {statuses.map((status) => (
                  <option key={status} value={status} className="capitalize">{status}</option>
                ))}
              </select>
            </div>

            <button
              type="button"
              disabled={createMutation.isPending}
              onClick={async () => {
                if (!validateForm()) return;
                const toastId = toast.loading("Creating pharmacist...");
                try {
                  await createMutation.mutateAsync(form);
                  toast.success("Pharmacist created and password email queued.", { id: toastId });
                } catch (err) {
                  toast.error("Unable to create pharmacist.", { id: toastId });
                }
              }}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/20 hover:bg-primary/90 transition"
            >
              <Plus className="w-4 h-4" /> Create pharmacist
            </button>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200/60 bg-white/80 backdrop-blur-xl shadow-xl shadow-slate-200/40 overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-slate-50/80">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Pharmacist list</h2>
                <p className="text-sm text-slate-500 mt-1">Search, filter, or reset credentials for any pharmacist account.</p>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-xs font-semibold text-slate-600 border border-slate-200">
                <RefreshCcw className="w-4 h-4 text-primary" /> {users.length} found
              </div>
            </div>
          </div>

          <div className="p-6 space-y-4">
            <div className="grid gap-3 sm:grid-cols-[1fr_180px]">
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white/80 pl-11 pr-4 text-sm focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all shadow-sm"
                  placeholder="Search pharmacists"
                />
              </div>
              <div className="relative group">
                <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setPage(1);
                  }}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white/80 pl-11 pr-4 text-sm focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all shadow-sm appearance-none capitalize"
                >
                  <option value="">All Statuses</option>
                  {statuses.map((status) => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center h-56 gap-4">
                  <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                  <p className="text-sm font-semibold text-slate-500">Loading pharmacists...</p>
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center h-56 gap-3 text-red-500">
                  <Activity className="w-10 h-10" />
                  <p className="text-sm font-semibold">Failed to load pharmacists.</p>
                </div>
              ) : users.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-56 gap-3 text-slate-400">
                  <Users className="w-12 h-12 stroke-[1.5]" />
                  <p className="text-base font-semibold">No pharmacists found</p>
                  <p className="text-sm text-slate-500">Use the form to add a new pharmacist.</p>
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/80">
                      <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Pharmacist</th>
                      <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Contact</th>
                      <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Status</th>
                      <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100/80">
                    <AnimatePresence mode="popLayout">
                      {users.map((user, idx) => (
                        <motion.tr
                          key={user._id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.97 }}
                          transition={{ duration: 0.2, delay: idx * 0.03 }}
                          className="group hover:bg-slate-50/70 transition-colors"
                        >
                          <td className="px-4 py-4 align-top">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary/20 to-primary/5 flex items-center justify-center text-primary font-bold shadow-sm border border-primary/10">
                                {user.name?.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="font-semibold text-slate-900">{user.name}</p>
                                <p className="text-xs text-slate-500 mt-1">Joined {formatDate(user.createdAt)}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4 align-top">
                            <div className="space-y-1 text-xs text-slate-600">
                              <div className="flex items-center gap-2">
                                <Mail className="w-4 h-4 text-slate-400" />
                                {user.email || <span className="italic text-slate-400">No email</span>}
                              </div>
                              <div className="flex items-center gap-2">
                                <Phone className="w-4 h-4 text-slate-400" />
                                {user.phone || <span className="italic text-slate-400">No phone</span>}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4 align-top">
                            <select
                              value={draft[user._id]?.status ?? user.status ?? "active"}
                              onChange={(e) =>
                                setDraft((prev) => ({
                                  ...prev,
                                  [user._id]: { status: e.target.value },
                                }))
                              }
                              className={clsx(
                                "h-10 w-full rounded-2xl border px-3 text-sm outline-none transition",
                                (draft[user._id]?.status ?? user.status) === "active"
                                  ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                                  : (draft[user._id]?.status ?? user.status) === "pending"
                                  ? "bg-amber-50 border-amber-200 text-amber-700"
                                  : "bg-rose-50 border-rose-200 text-rose-700"
                              )}
                            >
                              {statuses.map((status) => (
                                <option key={status} value={status} className="capitalize">{status}</option>
                              ))}
                            </select>
                          </td>
                          <td className="px-4 py-4 align-top text-right space-y-2">
                            <button
                              type="button"
                              disabled={updateMutation.isPending}
                              onClick={async () => {
                                const status = draft[user._id]?.status ?? user.status ?? "active";
                                const toastId = toast.loading("Updating status...");
                                try {
                                  await updateMutation.mutateAsync({ id: user._id, status });
                                  toast.success("Status updated", { id: toastId });
                                  setDraft((prev) => {
                                    const clone = { ...prev };
                                    delete clone[user._id];
                                    return clone;
                                  });
                                } catch {
                                  toast.error("Unable to update status", { id: toastId });
                                }
                              }}
                              className="inline-flex items-center gap-2 rounded-2xl bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 transition"
                            >
                              <Shield className="w-4 h-4" /> Save
                            </button>
                            <button
                              type="button"
                              disabled={resetMutation.isPending}
                              onClick={async () => {
                                const toastId = toast.loading("Sending reset email...");
                                try {
                                  await resetMutation.mutateAsync(user.email ?? "");
                                  toast.success("Password reset email sent.", { id: toastId });
                                } catch {
                                  toast.error("Unable to send reset email.", { id: toastId });
                                }
                              }}
                              className="inline-flex items-center gap-2 rounded-2xl bg-primary px-3 py-2 text-xs font-semibold text-white hover:bg-primary/90 transition"
                            >
                              <Key className="w-4 h-4" /> Reset password
                            </button>
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
              )}
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between text-slate-500 text-sm">
              <p>Page {meta.page} of {meta.totalPages}</p>
              <div className="flex items-center gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                  className="rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Prev
                </button>
                <button
                  disabled={page >= meta.totalPages}
                  onClick={() => setPage((prev) => Math.min(meta.totalPages, prev + 1))}
                  className="rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
