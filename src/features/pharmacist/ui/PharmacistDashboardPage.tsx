import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import MainContainer from "../../../shared/main-container/MainContainer";
import { getDashboardStats, type DashboardStats, type PrescriptionOrder } from "../service/pharmacistService";
import { Icons } from "../../../shared/icons/Icons";
import CustomButton from "../../../shared/button/CustomButton";

export default function PharmacistDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await getDashboardStats();
        setStats(data);
      } catch (err) {
        const message = (err as any)?.response?.data?.message || "Failed to load dashboard";
        toast.error(message);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <MainContainer>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin">
            <Icons.Dashboard className="w-8 h-8 text-primary" />
          </div>
        </div>
      </MainContainer>
    );
  }

  const statCards = [
    {
      label: "Orders Today",
      value: stats?.totalOrdersToday ?? 0,
      icon: Icons.Cart,
      color: "from-blue-50 to-blue-100",
      textColor: "text-blue-600",
    },
    {
      label: "Pending Verification",
      value: stats?.pendingVerification ?? 0,
      icon: Icons.AlertCircle,
      color: "from-yellow-50 to-yellow-100",
      textColor: "text-yellow-600",
    },
    {
      label: "Verified Today",
      value: stats?.verifiedToday ?? 0,
      icon: Icons.Shield,
      color: "from-green-50 to-green-100",
      textColor: "text-green-600",
    },
    {
      label: "Ready for Delivery",
      value: stats?.ordersReady ?? 0,
      icon: Icons.Prescription,
      color: "from-purple-50 to-purple-100",
      textColor: "text-purple-600",
    },
  ];

  return (
    <MainContainer>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
          <p className="mt-2 text-slate-600">Overview of today's pharmacy tasks and orders</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.label}
                className={`rounded-2xl bg-gradient-to-br ${card.color} p-6 border border-slate-100 shadow-sm hover:shadow-md transition`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">{card.label}</p>
                    <p className={`text-3xl font-bold mt-2 ${card.textColor}`}>{card.value}</p>
                  </div>
                  <div className={`w-12 h-12 rounded-xl bg-white/50 flex items-center justify-center ${card.textColor}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Recent Orders */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Recent Orders</h2>
              <p className="text-sm text-slate-600 mt-1">Latest prescription orders for verification</p>
            </div>
            <Link to="/pharmacist/requested-orders">
              <CustomButton variant="outline" size="sm">
                View All Orders
              </CustomButton>
            </Link>
          </div>

          <div className="space-y-3">
            {stats?.recentOrders && stats.recentOrders.length > 0 ? (
              stats.recentOrders.map((order) => (
                <RecentOrderCard key={order._id} order={order} />
              ))
            ) : (
              <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center">
                <Icons.Prescription className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">No recent orders</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link to="/pharmacist/requested-orders" className="group">
            <div className="rounded-2xl border border-slate-200 p-6 hover:border-primary hover:bg-primary/5 transition cursor-pointer">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 mb-3 group-hover:bg-blue-200 transition">
                <Icons.AlertCircle className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-slate-900">Verify Prescriptions</h3>
              <p className="text-sm text-slate-600 mt-1">Review and verify new prescription orders</p>
            </div>
          </Link>

          <Link to="/pharmacist/prescribed-orders" className="group">
            <div className="rounded-2xl border border-slate-200 p-6 hover:border-primary hover:bg-primary/5 transition cursor-pointer">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center text-green-600 mb-3 group-hover:bg-green-200 transition">
                <Icons.Shield className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-slate-900">Fulfill Orders</h3>
              <p className="text-sm text-slate-600 mt-1">Prepare and ship verified orders</p>
            </div>
          </Link>

          <div className="group">
            <div className="rounded-2xl border border-slate-200 p-6 hover:border-primary hover:bg-primary/5 transition cursor-pointer">
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center text-purple-600 mb-3 group-hover:bg-purple-200 transition">
                <Icons.Pill className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-slate-900">Inventory</h3>
              <p className="text-sm text-slate-600 mt-1">Manage medicine stock and supplies</p>
            </div>
          </div>
        </div>
      </div>
    </MainContainer>
  );
}

function RecentOrderCard({ order }: { order: PrescriptionOrder }) {
  const statusColors: Record<string, string> = {
    pending_verification: "bg-yellow-100 text-yellow-800",
    verified: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
    pending_ocr: "bg-blue-100 text-blue-800",
  };

  const medicineCount = Array.isArray(order?.suggestedMedicines)
    ? order.suggestedMedicines.length
    : 0;
  const status = order?.status ?? "pending_verification";
  const customerName = order?.customerName || "Customer";
  const customerPhone = order?.customerPhone || "Phone not available";
  const createdAt = order?.createdAt ? new Date(order.createdAt) : null;

  return (
    <Link to={`/pharmacist/requested-orders?id=${order?._id ?? ""}`}>
      <div className="rounded-xl border border-slate-200 p-4 hover:border-primary hover:bg-slate-50 transition cursor-pointer">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Icons.Prescription className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-slate-900">{customerName}</p>
                <p className="text-xs text-slate-500 mt-1">{customerPhone}</p>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2 flex-wrap">
              <span className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded">
                {medicineCount} medicines
              </span>
              <span className={`text-xs px-2 py-1 rounded font-medium ${statusColors[status] || "bg-slate-100 text-slate-700"}`}>
                {status.replace("_", " ").toUpperCase()}
              </span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-500">
              {createdAt ? createdAt.toLocaleDateString() : "Unknown date"}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              {createdAt
                ? createdAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                : "--:--"}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}
