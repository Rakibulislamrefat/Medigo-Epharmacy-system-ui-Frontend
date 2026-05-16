import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createAdminConsultancy,
  deleteAdminConsultancy,
  getAdminConsultancies,
  markAdminConsultancyReady,
  sendAdminConsultancyConfirmation,
  updateAdminConsultancy,
} from "../service/adminApi";
import toast from "react-hot-toast";

const getApiErrorMessage = (err: unknown, fallback: string) => {
  const data = (err as { response?: { data?: { message?: string; errors?: string[] } } })?.response
    ?.data;
  return data?.errors?.[0] ?? data?.message ?? fallback;
};

const toIsoOrNull = (value: string) => (value ? new Date(value).toISOString() : null);

const splitCsv = (value: string) =>
  value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

const formatDateTime = (v?: string) => {
  if (!v) return "";
  const d = new Date(v);
  return Number.isNaN(d.getTime())
    ? v
    : d.toLocaleString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
};

const getUserLabel = (user: unknown) => {
  if (!user) return "-";
  if (typeof user === "string") return user;
  const u = user as { name?: string; email?: string; phone?: string; _id?: string };
  return u.name || u.email ? `${u.name ?? "User"}${u.email ? ` (${u.email})` : ""}` : u._id ?? "-";
};

const getDoctorLabel = (doctor: unknown) => {
  if (!doctor) return "-";
  if (typeof doctor === "string") return doctor;
  const d = doctor as { fullName?: string; specialization?: string; _id?: string };
  return d.fullName
    ? `${d.fullName}${d.specialization ? ` (${d.specialization})` : ""}`
    : d._id ?? "-";
};

const toDateTimeLocal = (value?: string) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
};

export default function AdminConsultanciesPage() {
  const qc = useQueryClient();
  const [statusFilter, setStatusFilter] = useState("");
  const [modeFilter, setModeFilter] = useState("");
  const [doctorIdFilter, setDoctorIdFilter] = useState("");
  const [userIdFilter, setUserIdFilter] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const { data: paged, isLoading, error } = useQuery({
    queryKey: [
      "admin",
      "consultancies",
      { statusFilter, modeFilter, doctorIdFilter, userIdFilter, page, limit },
    ],
    queryFn: () =>
      getAdminConsultancies({
        status: statusFilter || undefined,
        mode: modeFilter || undefined,
        doctor: doctorIdFilter.trim() || undefined,
        user: userIdFilter.trim() || undefined,
        page,
        limit,
      }),
    retry: 1,
  });

  const items = paged?.items ?? [];
  const meta = paged?.meta ?? { page: 1, limit, total: 0, totalPages: 1 };

  const [createForm, setCreateForm] = useState({
    userId: "",
    doctorId: "",
    patientName: "",
    contactPhone: "",
    contactEmail: "",
    mode: "video",
    scheduledAt: "",
    durationMinutes: "30",
    symptoms: "",
    notes: "",
    attachments: "",
  });

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    status: "confirmed",
    mode: "video",
    scheduledAt: "",
    durationMinutes: "30",
    notes: "",
    meetingLink: "",
  });

  const statusOptions = useMemo(
    () => ["requested", "confirmed", "ready", "completed", "cancelled"],
    [],
  );
  const modeOptions = useMemo(() => ["chat", "video", "audio", "in_person"], []);
  const limitOptions = useMemo(() => [10, 20, 50], []);

  const createMutation = useMutation({
    mutationFn: async () =>
      createAdminConsultancy({
        userId: createForm.userId.trim() || undefined,
        doctorId: createForm.doctorId.trim(),
        patientName: createForm.patientName.trim() || undefined,
        contactPhone: createForm.contactPhone.trim() || undefined,
        contactEmail: createForm.contactEmail.trim() || undefined,
        mode: createForm.mode,
        scheduledAt: toIsoOrNull(createForm.scheduledAt),
        durationMinutes: createForm.durationMinutes
          ? Number(createForm.durationMinutes)
          : undefined,
        symptoms: createForm.symptoms.trim() || undefined,
        notes: createForm.notes.trim() || undefined,
        attachments: splitCsv(createForm.attachments),
      }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["admin", "consultancies"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (args: { id: string }) =>
      updateAdminConsultancy(args.id, {
        status: editForm.status,
        mode: editForm.mode,
        scheduledAt: toIsoOrNull(editForm.scheduledAt),
        durationMinutes: editForm.durationMinutes ? Number(editForm.durationMinutes) : undefined,
        notes: editForm.notes.trim() || undefined,
        meetingLink: editForm.meetingLink.trim() || undefined,
      }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["admin", "consultancies"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => deleteAdminConsultancy(id),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["admin", "consultancies"] });
    },
  });

  const readyMutation = useMutation({
    mutationFn: async (id: string) => markAdminConsultancyReady(id),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["admin", "consultancies"] });
    },
  });

  const confirmationMutation = useMutation({
    mutationFn: async (id: string) => sendAdminConsultancyConfirmation(id),
  });

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-dark">Consultancies</h1>
        <p className="text-sm text-slate-500 mt-1">Manage consultation bookings.</p>
      </div>

      <div className="rounded-xl border border-gray-100 bg-white p-5">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-semibold text-dark">Create consultancy</p>
        </div>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <input
            value={createForm.userId}
            onChange={(e) => setCreateForm((p) => ({ ...p, userId: e.target.value }))}
            className="h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm"
            placeholder="User ID"
          />
          <input
            value={createForm.doctorId}
            onChange={(e) => setCreateForm((p) => ({ ...p, doctorId: e.target.value }))}
            className="h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm"
            placeholder="Doctor ID"
          />
          <input
            value={createForm.patientName}
            onChange={(e) => setCreateForm((p) => ({ ...p, patientName: e.target.value }))}
            className="h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm"
            placeholder="Patient name"
          />
          <input
            value={createForm.contactPhone}
            onChange={(e) => setCreateForm((p) => ({ ...p, contactPhone: e.target.value }))}
            className="h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm"
            placeholder="Contact phone"
          />
          <input
            value={createForm.contactEmail}
            onChange={(e) => setCreateForm((p) => ({ ...p, contactEmail: e.target.value }))}
            className="h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm"
            placeholder="Contact email"
            type="email"
          />
          <select
            value={createForm.mode}
            onChange={(e) => setCreateForm((p) => ({ ...p, mode: e.target.value }))}
            className="h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm"
          >
            {modeOptions.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
          <input
            value={createForm.scheduledAt}
            onChange={(e) => setCreateForm((p) => ({ ...p, scheduledAt: e.target.value }))}
            className="h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm"
            type="datetime-local"
          />
          <input
            value={createForm.durationMinutes}
            onChange={(e) => setCreateForm((p) => ({ ...p, durationMinutes: e.target.value }))}
            className="h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm"
            placeholder="Duration minutes"
            type="number"
            min="0"
          />
          <textarea
            value={createForm.symptoms}
            onChange={(e) => setCreateForm((p) => ({ ...p, symptoms: e.target.value }))}
            className="min-h-20 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm lg:col-span-2"
            placeholder="Symptoms"
          />
          <textarea
            value={createForm.notes}
            onChange={(e) => setCreateForm((p) => ({ ...p, notes: e.target.value }))}
            className="min-h-20 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm lg:col-span-2"
            placeholder="Notes"
          />
          <input
            value={createForm.attachments}
            onChange={(e) => setCreateForm((p) => ({ ...p, attachments: e.target.value }))}
            className="h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm lg:col-span-3"
            placeholder="Attachments URLs, comma separated"
          />
          <button
            type="button"
            disabled={createMutation.isPending}
            onClick={async () => {
              if (!createForm.doctorId.trim()) {
                toast.error("Doctor ID is required");
                return;
              }
              if (!createForm.patientName.trim()) {
                toast.error("Patient name is required");
                return;
              }
              if (!createForm.contactPhone.trim()) {
                toast.error("Contact phone is required");
                return;
              }
              if (!createForm.contactEmail.trim()) {
                toast.error("Contact email is required");
                return;
              }
              if (!createForm.scheduledAt) {
                toast.error("Schedule is required");
                return;
              }
              const t = toast.loading("Creating...");
              try {
                await createMutation.mutateAsync();
                toast.success("Created", { id: t });
                setCreateForm({
                  userId: "",
                  doctorId: "",
                  patientName: "",
                  contactPhone: "",
                  contactEmail: "",
                  mode: "video",
                  scheduledAt: "",
                  durationMinutes: "30",
                  symptoms: "",
                  notes: "",
                  attachments: "",
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
          Failed to load consultancies.
        </div>
      )}

      {!isLoading && paged && (
        <div className="rounded-xl border border-gray-100 bg-white overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <p className="text-sm font-semibold text-dark">All consultancies</p>
            <span className="text-xs font-black bg-primary/10 text-primary px-3 py-1 rounded-full">
              {meta.total}
            </span>
          </div>

          <div className="px-5 py-4 border-b border-gray-100">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
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
                <select
                  value={modeFilter}
                  onChange={(e) => {
                    setModeFilter(e.target.value);
                    setPage(1);
                  }}
                  className="h-10 w-full sm:w-[180px] rounded-lg border border-gray-200 bg-white px-3 text-sm"
                >
                  <option value="">All modes</option>
                  {modeOptions.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
                <input
                  value={doctorIdFilter}
                  onChange={(e) => {
                    setDoctorIdFilter(e.target.value);
                    setPage(1);
                  }}
                  className="h-10 w-full sm:w-[260px] rounded-lg border border-gray-200 bg-white px-3 text-sm"
                  placeholder="Doctor ID (optional)"
                />
                <input
                  value={userIdFilter}
                  onChange={(e) => {
                    setUserIdFilter(e.target.value);
                    setPage(1);
                  }}
                  className="h-10 w-full sm:w-[260px] rounded-lg border border-gray-200 bg-white px-3 text-sm"
                  placeholder="User ID (optional)"
                />
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
                  <th className="px-5 py-3">Doctor</th>
                  <th className="px-5 py-3">Patient</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Mode</th>
                  <th className="px-5 py-3">Payment</th>
                  <th className="px-5 py-3">Scheduled</th>
                  <th className="px-5 py-3">Created</th>
                  <th className="px-5 py-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {items.map((c) => (
                  <tr key={c._id} className="text-sm text-dark">
                    <td className="px-5 py-3 text-slate-600">
                      {getUserLabel(c.user)}
                    </td>
                    <td className="px-5 py-3 text-slate-600">
                      {getDoctorLabel(c.doctor)}
                    </td>
                    <td className="px-5 py-3 text-slate-600">
                      {c.patientName || c.contactPhone || ""}
                    </td>
                    <td className="px-5 py-3 text-slate-600">{c.status ?? ""}</td>
                    <td className="px-5 py-3 text-slate-600">{c.mode ?? ""}</td>
                    <td className="px-5 py-3 text-slate-600">{c.paymentStatus ?? ""}</td>
                    <td className="px-5 py-3 text-slate-600">
                      {formatDateTime(c.scheduledAt)}
                    </td>
                    <td className="px-5 py-3 text-slate-600">
                      {formatDateTime(c.createdAt)}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          disabled={
                            createMutation.isPending ||
                            updateMutation.isPending ||
                            deleteMutation.isPending ||
                            readyMutation.isPending ||
                            confirmationMutation.isPending
                          }
                          onClick={() => {
                            setEditingId(c._id);
                            setEditForm({
                              status: c.status ?? "confirmed",
                              mode: c.mode ?? "video",
                              scheduledAt: toDateTimeLocal(c.scheduledAt),
                              durationMinutes: String(c.durationMinutes ?? 30),
                              notes: c.notes ?? "",
                              meetingLink: c.meetingLink ?? "",
                            });
                          }}
                          className="h-9 px-3 rounded-lg border border-gray-200 bg-white text-sm font-semibold hover:bg-gray-50 disabled:opacity-60"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          disabled={readyMutation.isPending || c.status === "ready"}
                          onClick={async () => {
                            const t = toast.loading("Marking ready...");
                            try {
                              await readyMutation.mutateAsync(c._id);
                              toast.success("Marked ready", { id: t });
                            } catch (err: unknown) {
                              toast.error(getApiErrorMessage(err, "Ready update failed"), { id: t });
                            }
                          }}
                          className="h-9 px-3 rounded-lg border border-primary/20 bg-primary/5 text-sm font-semibold text-primary hover:bg-primary/10 disabled:opacity-60"
                        >
                          Ready
                        </button>
                        <button
                          type="button"
                          disabled={confirmationMutation.isPending}
                          onClick={async () => {
                            const t = toast.loading("Sending confirmation...");
                            try {
                              const sent = await confirmationMutation.mutateAsync(c._id);
                              toast.success(sent ? "Confirmation sent" : "Confirmation queued or failed", { id: t });
                            } catch (err: unknown) {
                              toast.error(getApiErrorMessage(err, "Confirmation failed"), { id: t });
                            }
                          }}
                          className="h-9 px-3 rounded-lg border border-gray-200 bg-white text-sm font-semibold hover:bg-gray-50 disabled:opacity-60"
                        >
                          Send
                        </button>
                        <button
                          type="button"
                          disabled={deleteMutation.isPending}
                          onClick={async () => {
                            const ok = window.confirm("Delete this consultancy?");
                            if (!ok) return;
                            const t = toast.loading("Deleting...");
                            try {
                              await deleteMutation.mutateAsync(c._id);
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
              <p className="text-sm font-semibold text-dark">Edit consultancy</p>
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
                <select
                  value={editForm.mode}
                  onChange={(e) => setEditForm((p) => ({ ...p, mode: e.target.value }))}
                  className="h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm"
                >
                  {modeOptions.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
                <input
                  value={editForm.scheduledAt}
                  onChange={(e) => setEditForm((p) => ({ ...p, scheduledAt: e.target.value }))}
                  className="h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm sm:col-span-2"
                  type="datetime-local"
                />
                <input
                  value={editForm.durationMinutes}
                  onChange={(e) => setEditForm((p) => ({ ...p, durationMinutes: e.target.value }))}
                  className="h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm"
                  placeholder="Duration minutes"
                  type="number"
                  min="0"
                />
                <input
                  value={editForm.meetingLink}
                  onChange={(e) => setEditForm((p) => ({ ...p, meetingLink: e.target.value }))}
                  className="h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm"
                  placeholder="Meeting link"
                />
                <textarea
                  value={editForm.notes}
                  onChange={(e) => setEditForm((p) => ({ ...p, notes: e.target.value }))}
                  className="min-h-20 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm sm:col-span-2"
                  placeholder="Notes"
                />
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

