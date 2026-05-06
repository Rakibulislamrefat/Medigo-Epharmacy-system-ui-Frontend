import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getAdminUsers, updateAdminUser, type AdminUser } from "../service/adminApi";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, Users, X, ChevronLeft, ChevronRight, 
  Activity, Filter, Mail, Phone, Calendar, Shield, Info
} from "lucide-react";
import clsx from "clsx";

const formatDate = (v?: string) => {
  if (!v) return "";
  const d = new Date(v);
  return Number.isNaN(d.getTime())
    ? v
    : d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};

export default function AdminUsersPage() {
  const qc = useQueryClient();
  const [searchText, setSearchText] = useState("");
  const [q, setQ] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);

  useEffect(() => {
    const t = window.setTimeout(() => {
      setQ(searchText.trim());
      setPage(1);
    }, 400);
    return () => window.clearTimeout(t);
  }, [searchText]);

  const { data: paged, isLoading, error } = useQuery({
    queryKey: ["admin", "users", { q, roleFilter, statusFilter, page, limit }],
    queryFn: () =>
      getAdminUsers({
        q: q || undefined,
        role: roleFilter || undefined,
        status: statusFilter || undefined,
        page,
        limit,
      }),
    retry: 1,
  });

  const items = paged?.items ?? [];
  const meta = paged?.meta ?? { page: 1, limit, total: 0, totalPages: 1 };

  const [draft, setDraft] = useState<Record<string, { role: string; status: string }>>({});

  const mutation = useMutation({
    mutationFn: async (args: { id: string; role: string; status: string }) =>
      updateAdminUser(args.id, { role: args.role, status: args.status }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });

  const roles = useMemo(() => ["user", "admin", "pharmacist", "doctor"], []);
  const statuses = useMemo(() => ["active", "pending", "blocked"], []);
  const limitOptions = useMemo(() => [10, 20, 50], []);

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
            <Users className="w-8 h-8 text-primary" />
            User Management
          </h1>
          <p className="text-sm text-slate-500 mt-2 font-medium">View and manage all registered users, roles, and account statuses.</p>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200/60 bg-white/70 backdrop-blur-xl shadow-xl shadow-slate-200/40 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between bg-white/50">
          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            <div className="relative group w-full sm:w-[320px]">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
              <input
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="h-11 w-full rounded-xl border border-slate-200 bg-white/80 pl-11 pr-4 text-sm focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all shadow-sm"
                placeholder="Search users (name, email, phone)"
              />
            </div>
            <div className="flex gap-3">
              <div className="relative w-1/2 sm:w-[140px]">
                <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <select
                  value={roleFilter}
                  onChange={(e) => {
                    setRoleFilter(e.target.value);
                    setPage(1);
                  }}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white/80 pl-11 pr-4 text-sm focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all shadow-sm appearance-none capitalize"
                >
                  <option value="">All Roles</option>
                  {roles.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div className="relative w-1/2 sm:w-[140px]">
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
                  {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end lg:self-auto">
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
              <p className="text-sm font-semibold text-slate-500 animate-pulse">Loading users...</p>
            </div>
          ) : error || !paged ? (
            <div className="flex flex-col items-center justify-center h-64 gap-3 text-red-500">
              <Activity className="w-10 h-10" />
              <p className="text-sm font-semibold">Failed to load users. Please try again.</p>
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 gap-3 text-slate-400">
              <Users className="w-12 h-12 stroke-[1.5]" />
              <p className="text-base font-semibold">No users found</p>
              <p className="text-sm text-slate-500">Try adjusting your search or filters.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">User Details</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Contact</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Role</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Status</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/80">
                <AnimatePresence mode="popLayout">
                  {items.map((u, idx) => (
                    <motion.tr 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2, delay: idx * 0.05 }}
                      key={u._id} 
                      className="group hover:bg-slate-50/60 transition-colors cursor-pointer"
                      onClick={() => setSelectedUser(u)}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary/20 to-primary/5 flex items-center justify-center text-primary font-bold shadow-sm border border-primary/10">
                            {u.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-800 text-sm group-hover:text-primary transition-colors">{u.name}</span>
                            <span className="text-xs font-medium text-slate-500 mt-0.5">Joined {formatDate(u.createdAt)}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                        <div className="flex flex-col gap-1.5">
                          <div className="flex items-center gap-2 text-xs text-slate-600">
                            <Mail className="w-3.5 h-3.5 text-slate-400" />
                            {u.email || <span className="italic text-slate-400">Not provided</span>}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-slate-600">
                            <Phone className="w-3.5 h-3.5 text-slate-400" />
                            {u.phone || <span className="italic text-slate-400">Not provided</span>}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                        <select
                          value={draft[u._id]?.role ?? u.role}
                          onChange={(e) =>
                            setDraft((p) => ({
                              ...p,
                              [u._id]: {
                                role: e.target.value,
                                status: p[u._id]?.status ?? u.status ?? "active",
                              },
                            }))
                          }
                          className="h-9 w-32 rounded-lg border border-slate-200 bg-white px-3 text-sm focus:border-primary outline-none capitalize shadow-sm transition-all"
                        >
                          {roles.map((r) => <option key={r} value={r}>{r}</option>)}
                        </select>
                      </td>
                      <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                        <select
                          value={draft[u._id]?.status ?? u.status ?? "active"}
                          onChange={(e) =>
                            setDraft((p) => ({
                              ...p,
                              [u._id]: {
                                role: p[u._id]?.role ?? u.role,
                                status: e.target.value,
                              },
                            }))
                          }
                          className={clsx(
                            "h-9 w-32 rounded-lg border px-3 text-sm outline-none capitalize shadow-sm transition-all font-semibold",
                            (draft[u._id]?.status ?? u.status) === "active" ? "bg-emerald-50 border-emerald-200 text-emerald-700" :
                            (draft[u._id]?.status ?? u.status) === "pending" ? "bg-amber-50 border-amber-200 text-amber-700" :
                            "bg-rose-50 border-rose-200 text-rose-700"
                          )}
                        >
                          {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </td>
                      <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                        {draft[u._id] && (
                          <button
                            disabled={mutation.isPending}
                            onClick={async () => {
                              const role = draft[u._id].role;
                              const status = draft[u._id].status;
                              const t = toast.loading("Updating...");
                              try {
                                await mutation.mutateAsync({ id: u._id, role, status });
                                toast.success("Updated", { id: t });
                                setDraft((p) => {
                                  const { [u._id]: _, ...rest } = p;
                                  return rest;
                                });
                              } catch (err: unknown) {
                                const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Update failed";
                                toast.error(msg, { id: t });
                              }
                            }}
                            className="h-9 px-4 rounded-lg bg-primary text-white text-sm font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/30 transition-all disabled:opacity-60"
                          >
                            Save
                          </button>
                        )}
                        {!draft[u._id] && (
                           <button
                            onClick={() => setSelectedUser(u)}
                            className="p-2 rounded-lg bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors tooltip tooltip-left"
                            data-tip="View Details"
                          >
                            <Info className="w-4 h-4" />
                          </button>
                        )}
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
        {selectedUser && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              onClick={() => setSelectedUser(null)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100"
            >
              <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                    <Info className="w-4 h-4" />
                  </div>
                  User Information
                </h2>
                <button 
                  onClick={() => setSelectedUser(null)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6">
                <div className="flex items-center gap-5 mb-8">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-primary/20 to-primary/5 flex items-center justify-center text-primary text-3xl font-bold shadow-inner border border-primary/20">
                    {selectedUser.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-slate-800">{selectedUser.name}</h3>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={clsx(
                        "inline-flex items-center px-2.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider",
                        selectedUser.status === "active" ? "bg-emerald-100 text-emerald-700" :
                        selectedUser.status === "pending" ? "bg-amber-100 text-amber-700" :
                        "bg-rose-100 text-rose-700"
                      )}>
                        {selectedUser.status}
                      </span>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-indigo-100 text-indigo-700">
                        {selectedUser.role}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                    <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0 shadow-sm">
                      <Mail className="w-5 h-5 text-slate-400" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email Address</p>
                      <p className="text-sm font-semibold text-slate-800 mt-1">{selectedUser.email || "Not provided"}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                    <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0 shadow-sm">
                      <Phone className="w-5 h-5 text-slate-400" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Phone Number</p>
                      <p className="text-sm font-semibold text-slate-800 mt-1">{selectedUser.phone || "Not provided"}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                    <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0 shadow-sm">
                      <Shield className="w-5 h-5 text-slate-400" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">User ID</p>
                      <p className="text-sm font-mono text-slate-600 mt-1 break-all">{selectedUser._id}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                    <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0 shadow-sm">
                      <Calendar className="w-5 h-5 text-slate-400" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Joined Date</p>
                      <p className="text-sm font-semibold text-slate-800 mt-1">{formatDate(selectedUser.createdAt)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
