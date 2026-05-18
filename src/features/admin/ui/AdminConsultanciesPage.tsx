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

const formatCurrency = (value: number) =>
  `Tk ${new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
  }).format(value)}`;

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

  const getConsultancyFee = (consultancy: any) => {
    if (consultancy?.doctor && typeof consultancy.doctor === "object") {
      return Number(consultancy.doctor.fee ?? 45);
    }
    return 45;
  };

  const totalRevenue = useMemo(() => {
    return items.reduce((sum, consultancy) => sum + getConsultancyFee(consultancy), 0);
  }, [items]);

  const pageRevenue = useMemo(() => {
    return items.reduce((sum, consultancy) => {
      if (!consultancy?.paymentStatus) return sum;
      return sum + getConsultancyFee(consultancy);
    }, 0);
  }, [items]);

  const revenueByStatus = useMemo(() => {
    const totals = {
      requested: 0,
      confirmed: 0,
      ready: 0,
      completed: 0,
      cancelled: 0,
      other: 0,
    };

    items.forEach((consultancy) => {
      const status = String(consultancy?.status ?? "other").toLowerCase();
      const revenue = consultancy?.paymentStatus ? getConsultancyFee(consultancy) : 0;
      if (Object.prototype.hasOwnProperty.call(totals, status)) {
        (totals as any)[status] += revenue;
      } else {
        totals.other += revenue;
      }
    });

    return totals;
  }, [items]);

  const revenueChartDays = useMemo(() => {
    const dailyRevenue = new Map<string, { label: string; value: number; timestamp: number }>();
    items.forEach((consultancy) => {
      const when = consultancy?.createdAt || consultancy?.scheduledAt;
      if (!when) return;
      const date = new Date(when);
      if (Number.isNaN(date.getTime())) return;
      const label = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      const existing = dailyRevenue.get(label);
      const revenue = consultancy?.paymentStatus ? getConsultancyFee(consultancy) : 0;
      if (existing) {
        existing.value += revenue;
      } else {
        dailyRevenue.set(label, { label, value: revenue, timestamp: date.getTime() });
      }
    });

    return Array.from(dailyRevenue.values())
      .sort((a, b) => a.timestamp - b.timestamp)
      .slice(-7)
      .map(({ label, value }) => ({ label, value }));
  }, [items]);

  const revenueStatusChart = useMemo(() => {
    const groups = [
      { label: "Confirmed", status: "confirmed", color: "#10B981" },
      { label: "Ready", status: "ready", color: "#8B5CF6" },
      { label: "Completed", status: "completed", color: "#2563EB" },
      { label: "Cancelled", status: "cancelled", color: "#EF4444" },
      { label: "Requested", status: "requested", color: "#0EA5E9" },
    ];
    const totalRevenue = groups.reduce(
      (sum, group) => sum + Number((revenueByStatus as any)[group.status] ?? 0),
      0,
    );
    return groups
      .map((group) => ({
        ...group,
        value: Number((revenueByStatus as any)[group.status] ?? 0),
        percent: totalRevenue ? Math.round(((revenueByStatus as any)[group.status] ?? 0) / totalRevenue * 100) : 0,
      }))
      .filter((group) => group.value > 0);
  }, [revenueByStatus]);

  const statusCounts = useMemo(() => {
    const counts = {
      requested: 0,
      confirmed: 0,
      ready: 0,
      completed: 0,
      cancelled: 0,
      other: 0,
    };
    items.forEach((consultancy) => {
      const status = String(consultancy?.status ?? "other").toLowerCase();
      if (Object.prototype.hasOwnProperty.call(counts, status)) {
        (counts as any)[status] += 1;
      } else {
        counts.other += 1;
      }
    });
    return counts;
  }, [items]);

  const statusChartData = useMemo(() => {
    const items = [
      { label: "Requested", value: statusCounts.requested, color: "bg-sky-500" },
      { label: "Confirmed", value: statusCounts.confirmed, color: "bg-emerald-500" },
      { label: "Ready", value: statusCounts.ready, color: "bg-violet-500" },
      { label: "Completed", value: statusCounts.completed, color: "bg-primary" },
      { label: "Cancelled", value: statusCounts.cancelled, color: "bg-red-500" },
    ].filter((item) => item.value > 0);
    const maxValue = Math.max(...items.map((item) => item.value), 1);
    return items.map((item) => ({
      ...item,
      percent: Math.round((item.value / maxValue) * 100),
    }));
  }, [statusCounts]);

  const completedRate = useMemo(() => {
    const visible = items.length || 1;
    return Math.round((statusCounts.completed / visible) * 100);
  }, [items.length, statusCounts.completed]);

  const averageFee = useMemo(() => {
    return items.length ? totalRevenue / items.length : 0;
  }, [items.length, totalRevenue]);

  const summaryCards = [
    {
      label: "Total consultancies",
      value: meta.total,
      description: "Bookings in the current report.",
      accent: "from-sky-500 to-slate-100",
    },
    {
      label: "Revenue estimate",
      value: formatCurrency(totalRevenue),
      description: "Expected revenue across fetched consultancies.",
      accent: "from-emerald-500 to-emerald-100",
    },
    {
      label: "Completed rate",
      value: `${completedRate}%`,
      description: "Consultations finished successfully.",
      accent: "from-violet-500 to-violet-100",
    },
    {
      label: "Average fee",
      value: `${formatCurrency(Math.round(averageFee))}`,
      description: "Average fee per consultancy.",
      accent: "from-orange-500 to-orange-100",
    },
  ];

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
    <div className="space-y-6">
      <div className="rounded-[28px] border border-gray-100 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Admin dashboard</p>
            <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
              Consultancy performance
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-6 text-slate-500">
              Track bookings, revenue and consult status with a cleaner dashboard that highlights the most important admin metrics.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white shadow-sm shadow-primary/25 transition hover:bg-primary-dark"
            >
              Export report
            </button>
            <button
              type="button"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-2 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50"
            >
              Refresh data
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => (
          <div
            key={card.label}
            className={`group rounded-[1.75rem] border border-gray-100 bg-gradient-to-br ${card.accent} p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg`}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-800/70">{card.label}</p>
                <p className="mt-5 text-3xl font-black text-slate-950">{card.value}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-white/90 text-slate-900 shadow-sm">•</div>
            </div>
            <p className="mt-5 text-sm leading-6 text-slate-700/90">{card.description}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.6fr_1fr]">
        <div className="rounded-[1.75rem] border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-500">Revenue trend</p>
              <p className="mt-2 text-xs text-slate-500">Revenue movement across latest consultancies.</p>
            </div>
            <div className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">
              Paid revenue: {formatCurrency(pageRevenue)}
            </div>
          </div>

          <div className="mt-6 overflow-hidden rounded-[1.75rem] bg-slate-100 p-4">
            <svg viewBox="0 0 100 60" className="h-48 w-full">
              <defs>
                <linearGradient id="trendGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#2563EB" />
                  <stop offset="100%" stopColor="#9333EA" />
                </linearGradient>
              </defs>
              <polyline
                fill="none"
                stroke="url(#trendGradient)"
                strokeWidth="2"
                points={
                  revenueChartDays
                    .map((point, index) => {
                      const maxValue = Math.max(...revenueChartDays.map((item) => item.value), 1);
                      const x = revenueChartDays.length > 1 ? (index / (revenueChartDays.length - 1)) * 100 : 0;
                      const y = 100 - Math.round((point.value / maxValue) * 80) - 10;
                      return `${x},${y}`;
                    })
                    .join(" ")
                }
              />
              {revenueChartDays.map((point, index) => {
                const maxValue = Math.max(...revenueChartDays.map((item) => item.value), 1);
                const x = revenueChartDays.length > 1 ? (index / (revenueChartDays.length - 1)) * 100 : 0;
                const y = 100 - Math.round((point.value / maxValue) * 80) - 10;
                return (
                  <circle key={point.label} cx={x} cy={y} r="1.8" fill="#2563EB" />
                );
              })}
            </svg>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3 text-xs text-slate-500">
            {revenueChartDays.map((point) => (
              <div key={point.label} className="rounded-2xl bg-white p-3 shadow-sm">
                <p className="font-semibold text-slate-900">{formatCurrency(point.value)}</p>
                <p className="mt-1">{point.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-4">
          <div className="rounded-[1.75rem] border border-gray-100 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-700">Status breakdown</p>
                <p className="mt-1 text-xs text-slate-500">Revenue and count by consultancy status.</p>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-600">
                {meta.total} total
              </span>
            </div>

            <div className="mt-6 space-y-4">
              {statusChartData.map((item) => (
                <div key={item.label} className="space-y-2">
                  <div className="flex items-center justify-between gap-3 text-sm text-slate-700">
                    <span>{item.label}</span>
                    <span>{item.value}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div className={`h-full rounded-full ${item.color}`} style={{ width: `${item.percent}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-gray-100 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-700">Quick metrics</p>
                <p className="mt-1 text-xs text-slate-500">Important operational numbers at a glance.</p>
              </div>
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700">
                live
              </span>
            </div>

            <div className="mt-6 grid gap-3">
              {[
                { label: "Completed consultancies", value: statusCounts.completed },
                { label: "Ready consultancies", value: statusCounts.ready },
                { label: "Average fee", value: formatCurrency(Math.round(averageFee)) },
              ].map((item) => (
                <div key={item.label} className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-4">
                  <p className="text-sm font-semibold text-slate-900">{item.label}</p>
                  <p className="mt-2 text-2xl font-black text-slate-950">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-[1.75rem] border border-gray-100 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-base font-semibold text-slate-900">Create consultancy</p>
            <p className="mt-1 text-sm text-slate-500">Add a new booking quickly with basic details.</p>
          </div>
          <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-600">
            Fast entry
          </span>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-3 lg:grid-cols-4">
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

