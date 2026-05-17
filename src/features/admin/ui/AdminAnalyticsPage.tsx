import { Icons } from "../../../shared/icons/Icons";

export default function AdminAnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-dark">Analytics</h1>
            <p className="text-sm text-slate-500 mt-1">
              A concise overview of your admin metrics, performance, and growth trends.
            </p>
          </div>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-primary/20 transition hover:bg-primary-dark"
          >
            <Icons.Star className="!w-4 !h-4 text-white" />
            Explore insights
          </button>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        {[
          { label: "Growth score", value: "78%", note: "Positive trend vs last week" },
          { label: "Revenue pace", value: "Tk 12.4M", note: "Estimated monthly projection" },
          { label: "Consultancy quality", value: "4.8/5", note: "Average customer satisfaction" },
        ].map((item) => (
          <div key={item.label} className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
              {item.label}
            </p>
            <p className="mt-4 text-3xl font-black text-dark">{item.value}</p>
            <p className="mt-2 text-sm text-slate-500">{item.note}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-slate-900">Monthly revenue analysis</p>
            <span className="text-xs font-semibold uppercase text-primary">Tk</span>
          </div>
          <div className="mt-5 h-56 rounded-3xl bg-slate-100" />
        </div>
        <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-slate-900">Top performing consultancies</p>
            <span className="text-xs font-semibold uppercase text-slate-500">Live</span>
          </div>
          <div className="mt-5 h-56 rounded-3xl bg-slate-100" />
        </div>
      </div>
    </div>
  );
}
