import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getAdminMetrics } from "../service/adminApi";
import { Icons } from "../../../shared/icons/Icons";

const formatCurrency = (value: number | string) =>
  typeof value === "number"
    ? `Tk ${new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(value)}`
    : String(value);

export default function AdminAnalyticsPage() {
  const { data } = useQuery({
    queryKey: ["admin", "metrics"],
    queryFn: getAdminMetrics,
    retry: 1,
  });

  const topMetrics = useMemo(
    () => [
      {
        label: "Registered customers",
        value: data ? data.users : "—",
        note: "Active users shopping at Medigo E-Pharmacy.",
        icon: <Icons.Users className="!w-5 !h-5 text-primary" />,
      },
      {
        label: "Medicine listings",
        value: data ? data.medicines : "—",
        note: "Products available in the online pharmacy catalog.",
        icon: <Icons.Pill className="!w-5 !h-5 text-primary" />,
      },
      {
        label: "Orders placed",
        value: data ? data.orders : "—",
        note: "Pharmacy orders placed by customers.",
        icon: <Icons.Cart className="!w-5 !h-5 text-primary" />,
      },
      {
        label: "Doctor consults",
        value: data ? data.consultancies : "—",
        note: "Teleconsultations requested through Medigo.",
        icon: <Icons.Star className="!w-5 !h-5 text-primary" />,
      },
    ],
    [data],
  );

  const activityCards = useMemo(
    () => [
      {
        title: "Prescription uploads",
        value: data ? `${Math.max(Math.round(data.orders * 0.4), 0)}` : "—",
        description: "Customer prescriptions submitted for pharmacist review.",
      },
      {
        title: "Medicine orders",
        value: data ? `${data.orders}` : "—",
        description: "Online pharmacy orders placed during the month.",
      },
      {
        title: "Teleconsult requests",
        value: data ? `${data.consultancies}` : "—",
        description: "Patient consult requests handled by Medigo doctors.",
      },
    ],
    [data],
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-dark">Admin Analytics</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-500 sm:text-base">
            Monitor Medigo E-Pharmacy performance, track medicine demand, and review pharmacy and consultation operations in one dashboard.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <button
            type="button"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-primary/20 transition hover:bg-primary-dark"
          >
            <Icons.Download className="!w-4 !h-4 text-white" />
            Export report
          </button>
          <button
            type="button"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50"
          >
            <Icons.Refresh className="!w-4 !h-4 text-slate-700" />
            Refresh data
          </button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {topMetrics.map((metric) => (
          <div key={metric.label} className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                {metric.label}
              </p>
              <div className="rounded-2xl bg-slate-100 p-2 text-primary">{metric.icon}</div>
            </div>
            <p className="mt-5 text-3xl font-black text-dark">{metric.value}</p>
            <p className="mt-3 text-sm text-slate-500">{metric.note}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-900">Monthly revenue</p>
              <p className="mt-1 text-xs text-slate-500">Track total sales in Taka and projected growth</p>
            </div>
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-semibold uppercase text-emerald-700">
              Stable
            </span>
          </div>
          <div className="mt-5 flex items-end justify-between gap-3">
            <div>
              <p className="text-4xl font-black text-dark">{data ? formatCurrency(Math.max(Math.round(data.orders * 1800), 0)) : "—"}</p>
              <p className="mt-2 text-sm text-slate-500">Estimated revenue from current order volume</p>
            </div>
            <div className="h-24 w-full rounded-3xl bg-slate-100 sm:w-44" />
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {activityCards.map((card) => (
              <div key={card.title} className="rounded-3xl border border-slate-100 bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-900">{card.title}</p>
                <p className="mt-3 text-2xl font-black text-dark">{card.value}</p>
                <p className="mt-2 text-xs text-slate-500">{card.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-900">Top consultancies</p>
              <p className="mt-1 text-xs text-slate-500">Recent teleconsult quality scores and demand drivers for Medigo services</p>
            </div>
            <span className="rounded-full bg-sky-100 px-3 py-1 text-[11px] font-semibold uppercase text-sky-700">
              Live
            </span>
          </div>

          <div className="mt-5 space-y-4">
            {[
              { label: "Teleconsult requests", value: data ? `${data.consultancies}` : "—", trend: "+18%" },
              { label: "Video consults", value: "89", trend: "+12%" },
              { label: "Top-rated doctor", value: "Top doctor", trend: "4.9/5" },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between rounded-3xl border border-slate-100 bg-slate-50 px-4 py-4">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{item.label}</p>
                  <p className="mt-1 text-xs text-slate-500">{item.value}</p>
                </div>
                <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-800 shadow-sm">
                  {item.trend}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-slate-900">Recent demand</p>
              <p className="mt-1 text-xs text-slate-500">Prescription uploads and medicine fulfillment trends</p>
            </div>
            <Icons.Pulse className="!w-6 !h-6 text-primary" />
          </div>

          <div className="mt-5 grid gap-3">
            {[
              { label: "Prescription refill requests", value: data ? `${Math.max(Math.round(data.orders * 0.15), 0)}/day` : "—" },
              { label: "Prescription uploads", value: data ? `${Math.max(Math.round(data.orders * 0.4), 0)}/day` : "—" },
              { label: "Pharmacy conversion rate", value: "8.9%" },
            ].map((item) => (
              <div key={item.label} className="rounded-3xl border border-slate-100 bg-slate-50 px-4 py-4">
                <p className="text-sm font-semibold text-slate-900">{item.label}</p>
                <p className="mt-2 text-2xl font-black text-dark">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
