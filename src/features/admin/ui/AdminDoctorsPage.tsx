import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  type AdminDoctor,
  type AdminDoctorPayload,
  createAdminDoctor,
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

const dayOptions = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
] as const;

type DoctorForm = {
  fullName: string;
  profileImage: string;
  qualifications: string;
  specialization: string;
  experienceYears: string;
  consultationType: "online" | "in-person" | "both";
  city: string;
  availabilityDay: string;
  availabilityStartTime: string;
  availabilityEndTime: string;
  nextAvailableAt: string;
  fee: string;
  currency: string;
  registrationNumber: string;
  bio: string;
  languages: string;
  email: string;
  phone: string;
  status: string;
};

const emptyForm: DoctorForm = {
  fullName: "",
  profileImage: "",
  qualifications: "",
  specialization: "",
  experienceYears: "",
  consultationType: "both",
  city: "",
  availabilityDay: "sunday",
  availabilityStartTime: "",
  availabilityEndTime: "",
  nextAvailableAt: "",
  fee: "",
  currency: "BDT",
  registrationNumber: "",
  bio: "",
  languages: "",
  email: "",
  phone: "",
  status: "active",
};

const splitList = (value: string) =>
  value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

const toDatetimeLocal = (value?: string) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const offsetDate = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return offsetDate.toISOString().slice(0, 16);
};

const formatDate = (v?: string) => {
  if (!v) return "";
  const d = new Date(v);
  return Number.isNaN(d.getTime())
    ? v
    : d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};

const buildPayload = (form: DoctorForm): AdminDoctorPayload => {
  const availability =
    form.availabilityStartTime && form.availabilityEndTime
      ? [
          {
            day: form.availabilityDay,
            startTime: form.availabilityStartTime,
            endTime: form.availabilityEndTime,
          },
        ]
      : undefined;

  return {
    fullName: form.fullName.trim(),
    profileImage: form.profileImage.trim() || undefined,
    qualifications: splitList(form.qualifications),
    specialization: form.specialization.trim(),
    experienceYears: form.experienceYears ? Number(form.experienceYears) : undefined,
    consultationType: form.consultationType,
    city: form.city.trim(),
    availability,
    nextAvailableAt: form.nextAvailableAt
      ? new Date(form.nextAvailableAt).toISOString()
      : undefined,
    fee: Number(form.fee),
    currency: form.currency.trim() || "BDT",
    registrationNumber: form.registrationNumber.trim() || undefined,
    bio: form.bio.trim() || undefined,
    languages: splitList(form.languages),
    email: form.email.trim().toLowerCase(),
    phone: form.phone.trim().replace(/[\s-]/g, ""),
    status: form.status,
  };
};

const validateForm = (form: DoctorForm) => {
  if (!form.fullName.trim()) return "Full name is required";
  if (!form.specialization.trim()) return "Specialization is required";
  if (!form.city.trim()) return "City is required";
  if (!form.email.trim()) return "Email is required";
  if (!form.phone.trim()) return "Phone is required";
  if (!bdPhonePattern.test(form.phone.trim().replace(/[\s-]/g, ""))) {
    return "Use a valid Bangladeshi phone number";
  }
  if (!form.fee || Number(form.fee) < 0) return "Fee is required";
  if (form.experienceYears && Number(form.experienceYears) < 0) {
    return "Experience cannot be negative";
  }
  if (
    (form.availabilityStartTime && !form.availabilityEndTime) ||
    (!form.availabilityStartTime && form.availabilityEndTime)
  ) {
    return "Provide both availability start and end time";
  }
  return "";
};

export default function AdminDoctorsPage() {
  const qc = useQueryClient();
  const [searchText, setSearchText] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState(10);
  const [createForm, setCreateForm] = useState<DoctorForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<DoctorForm>(emptyForm);

  useEffect(() => {
    const t = window.setTimeout(() => {
      setSearch(searchText.trim());
      setPage(1);
    }, 400);
    return () => window.clearTimeout(t);
  }, [searchText]);

  const { data: paged, isLoading, error } = useQuery({
    queryKey: ["admin", "doctors", { search, statusFilter, page, rows }],
    queryFn: () =>
      getAdminDoctors({
        search: search || undefined,
        status: statusFilter || undefined,
        page,
        rows,
      }),
    retry: 1,
  });

  const items: AdminDoctor[] = paged?.items ?? [];
  const meta = paged?.meta ?? { page: 1, limit: rows, total: 0, totalPages: 1 };
  const statusOptions = useMemo(() => ["active", "inactive"], []);
  const rowOptions = useMemo(() => [10, 20, 50], []);

  const createMutation = useMutation({
    mutationFn: (payload: AdminDoctorPayload) => createAdminDoctor(payload),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["admin", "doctors"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (args: { id: string; payload: Partial<AdminDoctorPayload> }) =>
      updateAdminDoctor(args.id, args.payload),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["admin", "doctors"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteAdminDoctor(id),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["admin", "doctors"] });
    },
  });

  const startEdit = (doctor: AdminDoctor) => {
    const slot = doctor.availability?.[0];
    setEditingId(doctor._id);
    setEditForm({
      fullName: doctor.fullName ?? "",
      profileImage: doctor.profileImage ?? "",
      qualifications: doctor.qualifications?.join(", ") ?? "",
      specialization: doctor.specialization ?? "",
      experienceYears: doctor.experienceYears?.toString() ?? "",
      consultationType:
        doctor.consultationType === "online" || doctor.consultationType === "in-person"
          ? doctor.consultationType
          : "both",
      city: doctor.city ?? "",
      availabilityDay: slot?.day ?? "sunday",
      availabilityStartTime: slot?.startTime ?? "",
      availabilityEndTime: slot?.endTime ?? "",
      nextAvailableAt: toDatetimeLocal(doctor.nextAvailableAt),
      fee: doctor.fee?.toString() ?? "",
      currency: doctor.currency ?? "BDT",
      registrationNumber: doctor.registrationNumber ?? "",
      bio: doctor.bio ?? "",
      languages: doctor.languages?.join(", ") ?? "",
      email: doctor.email ?? "",
      phone: doctor.phone ?? "",
      status: doctor.status ?? "active",
    });
  };

  const renderDoctorFields = (
    form: DoctorForm,
    setForm: React.Dispatch<React.SetStateAction<DoctorForm>>,
  ) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      <input value={form.fullName} onChange={(e) => setForm((p) => ({ ...p, fullName: e.target.value }))} className="h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm" placeholder="Full name" />
      <input value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} className="h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm" placeholder="Email" type="email" />
      <input value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} className="h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm" placeholder="Phone 01XXXXXXXXX" inputMode="tel" />
      <select value={form.specialization} onChange={(e) => setForm((p) => ({ ...p, specialization: e.target.value }))} className="h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm">
        <option value="">Select specialization</option>
        {specializationOptions.map((specialty) => <option key={specialty} value={specialty}>{specialty}</option>)}
      </select>
      <input value={form.city} onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))} className="h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm" placeholder="City" />
      <input value={form.fee} onChange={(e) => setForm((p) => ({ ...p, fee: e.target.value }))} className="h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm" placeholder="Fee" inputMode="decimal" type="number" min="0" />
      <select value={form.consultationType} onChange={(e) => setForm((p) => ({ ...p, consultationType: e.target.value as DoctorForm["consultationType"] }))} className="h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm">
        <option value="online">online</option>
        <option value="in-person">in-person</option>
        <option value="both">both</option>
      </select>
      <input value={form.experienceYears} onChange={(e) => setForm((p) => ({ ...p, experienceYears: e.target.value }))} className="h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm" placeholder="Experience years" inputMode="numeric" type="number" min="0" />
      <input value={form.currency} onChange={(e) => setForm((p) => ({ ...p, currency: e.target.value }))} className="h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm" placeholder="Currency" />
      <input value={form.registrationNumber} onChange={(e) => setForm((p) => ({ ...p, registrationNumber: e.target.value }))} className="h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm" placeholder="Registration number" />
      <input value={form.profileImage} onChange={(e) => setForm((p) => ({ ...p, profileImage: e.target.value }))} className="h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm" placeholder="Profile image URL" />
      <input value={form.nextAvailableAt} onChange={(e) => setForm((p) => ({ ...p, nextAvailableAt: e.target.value }))} className="h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm" type="datetime-local" />
      <input value={form.qualifications} onChange={(e) => setForm((p) => ({ ...p, qualifications: e.target.value }))} className="h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm" placeholder="Qualifications, comma separated" />
      <input value={form.languages} onChange={(e) => setForm((p) => ({ ...p, languages: e.target.value }))} className="h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm" placeholder="Languages, comma separated" />
      <select value={form.status} onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))} className="h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm">
        {statusOptions.map((s) => <option key={s} value={s}>{s}</option>)}
      </select>
      <select value={form.availabilityDay} onChange={(e) => setForm((p) => ({ ...p, availabilityDay: e.target.value }))} className="h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm">
        {dayOptions.map((d) => <option key={d} value={d}>{d}</option>)}
      </select>
      <input value={form.availabilityStartTime} onChange={(e) => setForm((p) => ({ ...p, availabilityStartTime: e.target.value }))} className="h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm" type="time" />
      <input value={form.availabilityEndTime} onChange={(e) => setForm((p) => ({ ...p, availabilityEndTime: e.target.value }))} className="h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm" type="time" />
      <textarea value={form.bio} onChange={(e) => setForm((p) => ({ ...p, bio: e.target.value }))} className="min-h-20 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm sm:col-span-2 lg:col-span-3" placeholder="Bio" />
    </div>
  );

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-dark">Doctors</h1>
        <p className="text-sm text-slate-500 mt-1">Manage doctor profiles.</p>
      </div>

      <div className="rounded-xl border border-gray-100 bg-white p-5">
        <p className="text-sm font-semibold text-dark">Create doctor</p>
        <div className="mt-4">{renderDoctorFields(createForm, setCreateForm)}</div>
        <div className="mt-4 flex justify-end">
          <button
            type="button"
            disabled={createMutation.isPending}
            onClick={async () => {
              const validation = validateForm(createForm);
              if (validation) {
                toast.error(validation);
                return;
              }
              const t = toast.loading("Creating...");
              try {
                await createMutation.mutateAsync(buildPayload(createForm));
                toast.success("Created", { id: t });
                setCreateForm(emptyForm);
              } catch (err: unknown) {
                toast.error(getApiErrorMessage(err, "Create failed"), { id: t });
              }
            }}
            className="h-10 px-4 rounded-lg bg-primary text-white text-sm font-semibold disabled:opacity-60"
          >
            Add Doctor
          </button>
        </div>
      </div>

      {isLoading && <div className="rounded-xl border border-gray-100 bg-white p-5 animate-pulse h-48" />}

      {!isLoading && (error || !paged) && (
        <div className="rounded-xl border border-red-100 bg-red-50 p-5 text-sm text-red-600">
          Failed to load doctors.
        </div>
      )}

      {!isLoading && paged && (
        <div className="rounded-xl border border-gray-100 bg-white overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <p className="text-sm font-semibold text-dark">All doctors</p>
            <span className="text-xs font-black bg-primary/10 text-primary px-3 py-1 rounded-full">{meta.total}</span>
          </div>

          <div className="px-5 py-4 border-b border-gray-100">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
                <input value={searchText} onChange={(e) => setSearchText(e.target.value)} className="h-10 w-full sm:w-[320px] rounded-lg border border-gray-200 bg-white px-3 text-sm" placeholder="Search doctors" />
                <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="h-10 w-full sm:w-[180px] rounded-lg border border-gray-200 bg-white px-3 text-sm">
                  <option value="">All status</option>
                  {statusOptions.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-500">Rows</span>
                <select value={rows} onChange={(e) => { setRows(Number(e.target.value)); setPage(1); }} className="h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm">
                  {rowOptions.map((n) => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-[1040px] w-full">
              <thead className="bg-light">
                <tr className="text-left text-xs font-black tracking-[0.2em] uppercase text-slate-500">
                  <th className="px-5 py-3">Name</th>
                  <th className="px-5 py-3">Specialization</th>
                  <th className="px-5 py-3">City</th>
                  <th className="px-5 py-3">Type</th>
                  <th className="px-5 py-3">Fee</th>
                  <th className="px-5 py-3">Contact</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Created</th>
                  <th className="px-5 py-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {items.map((d) => (
                  <tr key={d._id} className="text-sm text-dark">
                    <td className="px-5 py-3 font-semibold">{d.fullName}</td>
                    <td className="px-5 py-3 text-slate-600">{d.specialization ?? "-"}</td>
                    <td className="px-5 py-3 text-slate-600">{d.city ?? "-"}</td>
                    <td className="px-5 py-3 text-slate-600">{d.consultationType ?? "-"}</td>
                    <td className="px-5 py-3 text-slate-600">{d.fee ?? "-"} {d.currency ?? ""}</td>
                    <td className="px-5 py-3 text-slate-600">
                      <div>{d.email ?? "-"}</div>
                      <div>{d.phone ?? ""}</div>
                    </td>
                    <td className="px-5 py-3 text-slate-600">{d.status ?? ""}</td>
                    <td className="px-5 py-3 text-slate-600">{formatDate(d.createdAt)}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <button type="button" disabled={createMutation.isPending || updateMutation.isPending || deleteMutation.isPending} onClick={() => startEdit(d)} className="h-9 px-3 rounded-lg border border-gray-200 bg-white text-sm font-semibold hover:bg-gray-50 disabled:opacity-60">
                          Edit
                        </button>
                        <button
                          type="button"
                          disabled={deleteMutation.isPending}
                          onClick={async () => {
                            if (!window.confirm("Delete this doctor?")) return;
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
              {meta.total === 0 ? "No results" : `Showing ${(page - 1) * rows + 1}-${Math.min(meta.total, page * rows)} of ${meta.total}`}
            </div>
            <div className="flex items-center gap-2">
              <button type="button" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className="h-10 px-4 rounded-lg border border-gray-200 bg-white text-sm font-semibold disabled:opacity-60">Prev</button>
              <span className="text-sm font-semibold text-slate-700">Page {page} / {meta.totalPages}</span>
              <button type="button" disabled={page >= meta.totalPages} onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))} className="h-10 px-4 rounded-lg border border-gray-200 bg-white text-sm font-semibold disabled:opacity-60">Next</button>
            </div>
          </div>
        </div>
      )}

      {editingId && (
        <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-4xl rounded-2xl bg-white border border-gray-100 shadow-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <p className="text-sm font-semibold text-dark">Edit doctor</p>
              <button type="button" onClick={() => setEditingId(null)} className="h-9 w-9 rounded-lg hover:bg-gray-50">x</button>
            </div>
            <div className="p-5 max-h-[78vh] overflow-y-auto">
              {renderDoctorFields(editForm, setEditForm)}
              <div className="mt-5 flex items-center justify-end gap-2">
                <button type="button" onClick={() => setEditingId(null)} className="h-10 px-4 rounded-lg border border-gray-200 bg-white text-sm font-semibold hover:bg-gray-50">Cancel</button>
                <button
                  type="button"
                  disabled={updateMutation.isPending}
                  onClick={async () => {
                    if (!editingId) return;
                    const validation = validateForm(editForm);
                    if (validation) {
                      toast.error(validation);
                      return;
                    }
                    const t = toast.loading("Saving...");
                    try {
                      await updateMutation.mutateAsync({ id: editingId, payload: buildPayload(editForm) });
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
