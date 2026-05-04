import { useQuery } from "@tanstack/react-query";
import { getAdminMedicines } from "../service/adminApi";

const formatDate = (v?: string) => {
  if (!v) return "";
  const d = new Date(v);
  return Number.isNaN(d.getTime())
    ? v
    : d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};

export default function AdminMedicinesPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["admin", "medicines"],
    queryFn: getAdminMedicines,
    retry: 1,
  });

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-dark">Medicines</h1>
        <p className="text-sm text-slate-500 mt-1">Manage products and stock.</p>
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

