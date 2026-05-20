import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getAdminMetrics } from "../service/adminApi";
import { Icons } from "../../../shared/icons/Icons";

const formatCurrency = (value: number) =>
  `Tk ${new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
  }).format(value)}`;

const StatCard = ({
  label,
  value,
  Icon,
  accent,
}: {
  label: string;
  value: number;
  Icon: typeof Icons.Dashboard;
  accent: string;
}) => (
  <div className="rounded-[28px] border border-slate-200/70 bg-white/95 p-5 shadow-[0_24px_80px_-64px_rgba(15,23,42,0.35)] transition-transform duration-300 hover:-translate-y-0.5">
    <div className="flex items-center justify-between gap-4">
      <div className="min-w-0">
        <p className="text-xs font-black tracking-[0.24em] uppercase text-slate-500">
          {label}
        </p>
        <p className="mt-3 text-3xl sm:text-4xl font-black text-slate-900">{value}</p>
      </div>
      <div className={`w-12 h-12 rounded-3xl ${accent} center-flex shadow-sm shadow-slate-200/70`}>
        <Icon className="!w-6 !h-6 text-white" />
      </div>
    </div>
  </div>
);

const InsightBar = ({
  label,
  value,
  max,
  color,
}: {
  label: string;
  value: number;
  max: number;
  color: string;
}) => {
  const percent = max ? Math.round((value / max) * 100) : 0;
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
        <span>{label}</span>
        <span>{percent}%</span>
      </div>
      <div className="h-2.5 rounded-full bg-slate-200 overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
};

export default function AdminDashboardPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["admin", "metrics"],
    queryFn: getAdminMetrics,
    retry: 1,
  });

  const totalCount = useMemo(
    () => (data ? data.users + data.medicines + data.orders + data.doctors + data.consultancies : 1),
    [data],
  );

  const barMetrics = useMemo(() => {
    if (!data) return [];
    const max = Math.max(data.users, data.medicines, data.orders, data.doctors, data.consultancies, 1);
    return [
      { label: "Users", value: data.users, color: "bg-sky-500" },
      { label: "Orders", value: data.orders, color: "bg-emerald-500" },
      { label: "Consults", value: data.consultancies, color: "bg-violet-500" },
      { label: "Doctors", value: data.doctors, color: "bg-fuchsia-500" },
      { label: "Medicines", value: data.medicines, color: "bg-amber-400" },
    ].map((item) => ({ ...item, max }));
  }, [data]);

  const revenueHistory = useMemo(() => {
    if (!data) return [];

    const weeklyOrders = Math.max(Math.round(data.orders / 4), 1);
    const weeklyConsults = Math.max(Math.round(data.consultancies / 4), 1);
    const orderValue = 2200;
    const consultValue = 850;
    const baseRevenue = weeklyOrders * orderValue + weeklyConsults * consultValue;
    const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const weights = [0.85, 0.92, 0.97, 1, 1.05, 1.12, 0.9];

    return labels.map((label, index) => ({
      label,
      value: Math.round(baseRevenue * weights[index] / labels.length),
    }));
  }, [data]);

  const revenueTotal = useMemo(
    () => revenueHistory.reduce((sum, point) => sum + point.value, 0),
    [revenueHistory],
  );

  const revenueMax = useMemo(() => (revenueHistory.length ? Math.max(...revenueHistory.map((p) => p.value), 1) : 1), [revenueHistory]);

  const cardData = useMemo(
    () =>
      data
        ? [
            {
              label: "Users",
              value: data.users,
              Icon: Icons.Users,
              accent: "bg-gradient-to-br from-sky-500 via-cyan-500 to-emerald-500",
            },
            {
              label: "Medicines",
              value: data.medicines,
              Icon: Icons.Pill,
              accent: "bg-gradient-to-br from-amber-400 via-orange-500 to-rose-500",
            },
            {
              label: "Orders",
              value: data.orders,
              Icon: Icons.Cart,
              accent: "bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500",
            },
            {
              label: "Doctors",
              value: data.doctors,
              Icon: Icons.Hospital,
              accent: "bg-gradient-to-br from-violet-500 via-indigo-500 to-sky-500",
            },
            {
              label: "Consults",
              value: data.consultancies,
              Icon: Icons.Check,
              accent: "bg-gradient-to-br from-fuchsia-500 via-pink-500 to-rose-500",
            },
          ]
        : [],
    [data],
  );

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-[128px] rounded-[28px] bg-slate-100 animate-pulse" />
        ))}
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-[28px] border border-red-100 bg-red-50 p-5 text-sm text-red-700 shadow-sm">
        Failed to load admin dashboard data.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-[32px] border border-slate-200/50 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-6 text-white shadow-[0_32px_120px_-60px_rgba(15,23,42,0.75)] sm:p-8">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(56,189,248,0.18),_transparent_22%),radial-gradient(circle_at_bottom_left,_rgba(168,85,247,0.16),_transparent_24%)]" />
        <div className="relative grid gap-6 lg:grid-cols-[1.8fr_1fr] items-center">
          <div className="space-y-4">
            <div className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.28em] text-sky-200/90">
              Enterprise admin overview
            </div>
            <div className="space-y-3">
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
                Medigo Admin Dashboard
              </h1>
              <p className="max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
                Monitor key performance metrics, track operations, and stay ahead with a clean executive summary built for fast decisions.
              </p>
              <Link
                to="/admin/analytics"
                className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white ring-1 ring-white/20 transition hover:bg-white/20"
              >
                View analytics
                <Icons.ArrowForward className="!w-4 !h-4 text-white" />
              </Link>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              <div className="rounded-3xl bg-white/10 border border-white/10 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-300">Total count</p>
                <p className="mt-3 text-3xl font-black text-white">{totalCount}</p>
              </div>
              <div className="rounded-3xl bg-white/10 border border-white/10 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-300">Consults share</p>
                <p className="mt-3 text-3xl font-black text-white">{Math.round((data.consultancies / Math.max(totalCount, 1)) * 100)}%</p>
              </div>
              <div className="rounded-3xl bg-white/10 border border-white/10 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-300">Doctor network</p>
                <p className="mt-3 text-3xl font-black text-white">{data.doctors}</p>
              </div>
            </div>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-[0_20px_80px_-48px_rgba(15,23,42,0.5)] backdrop-blur-xl">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-slate-300">Operational pulse</p>
                <p className="mt-3 text-xl font-black text-white">Actionable insights</p>
              </div>
              <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-[11px] font-black uppercase tracking-[0.25em] text-emerald-200">
                Live
              </span>
            </div>
            <div className="mt-6 space-y-4">
              {barMetrics.slice(0, 3).map((metric) => (
                <div key={metric.label} className="space-y-2">
                  <div className="flex items-center justify-between text-sm font-semibold text-slate-200">
                    <span>{metric.label}</span>
                    <span>{metric.value}</span>
                  </div>
                  <div className="h-2.5 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className={`${metric.color} h-full rounded-full transition-all duration-500`}
                      style={{ width: `${Math.round((metric.value / metric.max) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 rounded-3xl bg-slate-950/70 p-5 text-sm leading-6 text-slate-300">
              <p className="font-semibold text-white">Focus for today</p>
              <ul className="mt-3 space-y-2 text-slate-300">
                <li>• Review order fulfillment status in real time.</li>
                <li>• Confirm high-priority consults for faster patient response.</li>
                <li>• Keep doctor availability and medicine stock aligned.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Estimated revenue (Tk)</p>
            <h2 className="mt-2 text-xl font-black text-slate-900">Weekly revenue trend</h2>
            <p className="mt-2 text-sm text-slate-500 max-w-2xl">
              Estimated weekly revenue in Tk based on order and consultancy volume. Use this chart to track momentum and compare performance over the last seven days.
            </p>
          </div>
          <div className="rounded-3xl bg-slate-950/5 px-4 py-3 text-sm font-semibold text-slate-700">
            Total revenue: <span className="text-slate-900">{formatCurrency(revenueTotal)}</span>
          </div>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-[1.55fr_0.85fr]">
          <div className="rounded-[28px] bg-slate-950/5 p-5">
            <div className="relative overflow-hidden rounded-[24px] bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 p-4">
              <div className="absolute inset-x-0 top-0 h-2 bg-gradient-to-r from-sky-400 via-cyan-400 to-emerald-400 opacity-40 blur-2xl" />
              <div className="flex gap-4">
                <div className="hidden sm:flex flex-col items-end gap-2 pr-3 text-xs text-slate-300 w-20">
                  {[4, 3, 2, 1, 0].map((i) => (
                    <div key={i} className="h-8 flex items-center w-full">
                      {formatCurrency(Math.round((i / 4) * revenueMax))}
                    </div>
                  ))}
                </div>
                <div className="flex-1">
                  <svg viewBox="0 0 100 40" className="relative h-48 w-full">
                <defs>
                  <linearGradient id="revenueGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.55" />
                    <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.05" />
                  </linearGradient>
                </defs>
                <path
                  d={
                    revenueHistory.length === 0
                      ? ""
                      : revenueHistory
                          .map((point, index) => {
                            const x = (index / (revenueHistory.length - 1)) * 100;
                            const maxValue = Math.max(...revenueHistory.map((item) => item.value), 1);
                            const y = 100 - (point.value / maxValue) * 80;
                            return `${index === 0 ? "M" : "L"}${x.toFixed(2)} ${y.toFixed(2)}`;
                          })
                          .join(" ")
                  }
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
                {revenueHistory.length > 0 && (
                  <>
                    <path
                      d={
                        revenueHistory
                          .map((point, index) => {
                            const x = (index / (revenueHistory.length - 1)) * 100;
                            const y = 100 - (point.value / revenueMax) * 80;
                            return `${index === 0 ? "M" : "L"}${x.toFixed(2)} ${y.toFixed(2)}`;
                          })
                          .join(" ") + ` L 100 100 L 0 100 Z`
                      }
                      fill="url(#revenueGradient)"
                      opacity="0.9"
                    />
                    {revenueHistory.map((point, index) => {
                      const x = (index / (revenueHistory.length - 1)) * 100;
                      const y = 100 - (point.value / revenueMax) * 80;
                      return (
                        <circle
                          key={point.label}
                          cx={x}
                          cy={y}
                          r="1.8"
                          fill="#38bdf8"
                          stroke="#fff"
                          strokeWidth="0.9"
                        />
                      );
                    })}
                  </>
                )}
              </svg>
              <div className="grid grid-cols-7 gap-2 text-[11px] uppercase tracking-[0.28em] text-slate-400">
                {revenueHistory.map((point) => (
                  <span key={point.label} className="text-center">
                    {point.label}
                  </span>
                ))}
              </div>
              <div className="mt-2 text-xs text-slate-400 text-center">X axis: Day of week</div>
            </div>
          </div>
            </div>
          </div>

          <div className="space-y-4 rounded-[28px] border border-slate-200/80 bg-white p-5">
            <div className="rounded-3xl bg-slate-950/5 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.28em] text-slate-500">This week</p>
                  <p className="mt-2 text-xl font-black text-slate-900">{formatCurrency(revenueTotal)}</p>
                </div>
                <div className="rounded-3xl bg-sky-500/10 px-3 py-2 text-sky-700">
                  <Icons.Delivery className="!w-5 !h-5 text-sky-600" />
                </div>
              </div>
            </div>
            <div className="space-y-3">
              {revenueHistory.map((point, index) => (
                <div key={point.label} className="flex items-center justify-between text-sm text-slate-600">
                  <span>{point.label}</span>
                  <span className="font-semibold text-slate-900">{formatCurrency(point.value)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-4 xl:grid-cols-[1.65fr_1fr]">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {cardData.map(({ label, value, Icon, accent }) => (
            <StatCard key={label} label={label} value={value} Icon={Icon} accent={accent} />
          ))}
        </div>

        <aside className="space-y-4 rounded-[28px] border border-slate-200/80 bg-slate-50 p-6 shadow-sm">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">Metrics breakdown</p>
            <h2 className="mt-3 text-xl font-black text-slate-900">What’s trending</h2>
          </div>

          <div className="space-y-4">
            {barMetrics.map((metric) => (
              <InsightBar key={metric.label} label={metric.label} value={metric.value} max={metric.max} color={metric.color} />
            ))}
          </div>

          <div className="rounded-3xl bg-white/90 border border-slate-200 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Quick note</p>
            <p className="mt-3 text-sm leading-6 text-slate-700">
              The dashboard is designed to give you a clear view of capacity, conversions, and admin health with a polished, modern presentation.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
