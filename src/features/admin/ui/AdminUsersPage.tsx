import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getAdminUsers, updateAdminUser } from "../service/adminApi";
import toast from "react-hot-toast";

const formatDate = (v?: string) => {
  if (!v) return "";
  const d = new Date(v);
  return Number.isNaN(d.getTime())
    ? v
    : d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};

export default function AdminUsersPage() {
  const qc = useQueryClient();
  const { data, isLoading, error } = useQuery({
    queryKey: ["admin", "users"],
    queryFn: getAdminUsers,
    retry: 1,
  });

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

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-dark">Users</h1>
        <p className="text-sm text-slate-500 mt-1">Manage user accounts.</p>
      </div>

      {isLoading && (
        <div className="rounded-xl border border-gray-100 bg-white p-5 animate-pulse h-48" />
      )}

      {!isLoading && (error || !data) && (
        <div className="rounded-xl border border-red-100 bg-red-50 p-5 text-sm text-red-600">
          Failed to load users.
        </div>
      )}

      {!isLoading && data && (
        <div className="rounded-xl border border-gray-100 bg-white overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <p className="text-sm font-semibold text-dark">All users</p>
            <span className="text-xs font-black bg-primary/10 text-primary px-3 py-1 rounded-full">
              {data.length}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-[860px] w-full">
              <thead className="bg-light">
                <tr className="text-left text-xs font-black tracking-[0.2em] uppercase text-slate-500">
                  <th className="px-5 py-3">Name</th>
                  <th className="px-5 py-3">Email</th>
                  <th className="px-5 py-3">Phone</th>
                  <th className="px-5 py-3">Role</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Joined</th>
                  <th className="px-5 py-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.map((u) => (
                  <tr key={u._id} className="text-sm text-dark">
                    <td className="px-5 py-3 font-semibold">{u.name}</td>
                    <td className="px-5 py-3 text-slate-600">{u.email ?? ""}</td>
                    <td className="px-5 py-3 text-slate-600">{u.phone ?? ""}</td>
                    <td className="px-5 py-3">
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
                        className="h-9 rounded-lg border border-gray-200 bg-white px-3 text-sm"
                      >
                        {roles.map((r) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-5 py-3">
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
                        className="h-9 rounded-lg border border-gray-200 bg-white px-3 text-sm"
                      >
                        {statuses.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-5 py-3 text-slate-600">
                      {formatDate(u.createdAt)}
                    </td>
                    <td className="px-5 py-3">
                      <button
                        type="button"
                        disabled={mutation.isPending}
                        onClick={async () => {
                          const role = draft[u._id]?.role ?? u.role;
                          const status = draft[u._id]?.status ?? u.status ?? "active";
                          const t = toast.loading("Updating...");
                          try {
                            await mutation.mutateAsync({ id: u._id, role, status });
                            toast.success("Updated", { id: t });
                            setDraft((p) => {
                              const { [u._id]: _, ...rest } = p;
                              return rest;
                            });
                          } catch (err: unknown) {
                            const msg =
                              (err as { response?: { data?: { message?: string } } })?.response
                                ?.data?.message ?? "Update failed";
                            toast.error(msg, { id: t });
                          }
                        }}
                        className="h-9 px-4 rounded-lg bg-primary text-white text-sm font-semibold disabled:opacity-60"
                      >
                        Save
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
