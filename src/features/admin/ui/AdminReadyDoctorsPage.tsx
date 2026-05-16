import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getAdminReadyDoctors } from "../service/adminApi";

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

export default function AdminReadyDoctorsPage() {
  const [q, setQ] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  useEffect(() => {
    const t = window.setTimeout(() => setPage(1), 100);
    return () => window.clearTimeout(t);
  }, [q, specialization]);

  const { data: paged, isLoading, error } = useQuery({
    queryKey: ["admin", "doctors", "ready", { q, specialization, page, limit }],
    queryFn: () =>
      getAdminReadyDoctors({ q: q || undefined, specialization: specialization || undefined, page, limit }),
    retry: 1,
  });

  const items = paged?.items ?? [];
  const meta = paged?.meta ?? { page: 1, limit, total: 0, totalPages: 1 };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-dark">Ready Doctors</h1>
        <p className="text-sm text-slate-500 mt-1">Doctors flagged as ready for consultations.</p>
      </div>

      <div className="rounded-xl border border-gray-100 bg-white p-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="h-10 w-full sm:w-[320px] rounded-lg border border-gray-200 bg-white px-3 text-sm"
              placeholder="Search name"
            />
            <select
              value={specialization}
              onChange={(e) => setSpecialization(e.target.value)}
              className="h-10 w-full sm:w-[220px] rounded-lg border border-gray-200 bg-white px-3 text-sm"
            >
              <option value="">All categories</option>
              {specializationOptions.map((specialty) => (
                <option key={specialty} value={specialty}>
                  {specialty}
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
              {[10, 20, 50].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {isLoading && <div className="rounded-xl border border-gray-100 bg-white p-5 animate-pulse h-40" />}

      {!isLoading && (error || !paged) && (
        <div className="rounded-xl border border-red-100 bg-red-50 p-5 text-sm text-red-600">Failed to load ready doctors.</div>
      )}

      {!isLoading && paged && (
        <div className="rounded-xl border border-gray-100 bg-white overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <p className="text-sm font-semibold text-dark">Ready doctors</p>
            <span className="text-xs font-black bg-primary/10 text-primary px-3 py-1 rounded-full">{meta.total}</span>
          </div>

          <div className="p-5 grid grid-cols-1 gap-3">
            {items.map((d) => (
              <div key={d._id} className="rounded-lg border border-gray-100 p-3 flex items-center justify-between">
                <div>
                  <div className="font-semibold">{d.fullName}</div>
                  <div className="text-sm text-slate-600">{d.specialization ?? "-"}</div>
                </div>
                <div className="text-sm text-slate-600">Fee: {d.fee ?? "-"} {d.currency ?? ""}</div>
              </div>
            ))}
          </div>

          <div className="px-5 py-4 border-t border-gray-100 flex items-center justify-between">
            <div className="text-sm text-slate-600">
              {meta.total === 0 ? "No results" : `Showing page ${meta.page} of ${meta.totalPages}`}
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
              <span className="text-sm font-semibold text-slate-700">Page {page} / {meta.totalPages}</span>
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
    </div>
  );
}
