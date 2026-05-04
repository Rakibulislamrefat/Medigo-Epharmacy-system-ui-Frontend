import { useQuery } from "@tanstack/react-query";
import { getAdminMetrics } from "../service/adminApi";
import { Icons } from "../../../shared/icons/Icons";

const StatCard = ({
  label,
  value,
  Icon,
}: {
  label: string;
  value: number;
  Icon: typeof Icons.Dashboard;
}) => (
  <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
    <div className="flex items-center justify-between gap-3">
      <div className="min-w-0">
        <p className="text-xs font-black tracking-[0.2em] uppercase text-slate-500">
          {label}
        </p>
        <p className="mt-2 text-3xl font-black text-dark">{value}</p>
      </div>
      <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/15 center-flex shrink-0">
        <Icon className="!w-5 !h-5 text-primary" />
      </div>
    </div>
  </div>
);

export default function AdminDashboardPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["admin", "metrics"],
    queryFn: getAdminMetrics,
    retry: 1,
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-[108px] rounded-xl bg-white border border-gray-100 animate-pulse" />
        ))}
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-xl border border-red-100 bg-red-50 p-5 text-sm text-red-600">
        Failed to load admin dashboard data.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-dark">Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">
          Quick overview of Medigo admin metrics.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard label="Users" value={data.users} Icon={Icons.User} />
        <StatCard label="Medicines" value={data.medicines} Icon={Icons.Pill} />
        <StatCard label="Orders" value={data.orders} Icon={Icons.Cart} />
        <StatCard label="Doctors" value={data.doctors} Icon={Icons.Hospital} />
        <StatCard label="Consults" value={data.consultancies} Icon={Icons.Check} />
      </div>
    </div>
  );
}
