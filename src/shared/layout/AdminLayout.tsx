import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { Icons } from "../icons/Icons";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../redux/store";
import { clearUser } from "../../redux/slices/userSlice";
import { logoutApi } from "../../features/login/service/loginService";
import toast from "react-hot-toast";

const navItems = [
  { label: "Dashboard", to: "/admin", Icon: Icons.Dashboard },
  { label: "Users", to: "/admin/users", Icon: Icons.User },
  { label: "Medicines", to: "/admin/medicines", Icon: Icons.Pill },
  { label: "Orders", to: "/admin/orders", Icon: Icons.Cart },
  { label: "Doctors", to: "/admin/doctors", Icon: Icons.Hospital },
  { label: "Consultancy", to: "/admin/consultancies", Icon: Icons.Check },
];

const AdminLayout = () => {
  const { user } = useSelector((s: RootState) => s.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logoutApi();
    } finally {
      dispatch(clearUser());
      toast.success("Logout successfully!");
      navigate("/login");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="flex">
        <aside className="hidden lg:flex w-72 flex-col border-r border-slate-200 bg-white">
          <div className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/15">
                <Icons.Dashboard className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-[3px] text-gray-400">
                  Portal
                </p>
                <p className="text-sm font-semibold text-gray-900 truncate">
                  Admin
                </p>
              </div>
            </div>
          </div>

          <nav className="px-4 space-y-1.5">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/admin"}
                className={({ isActive }) =>
                  [
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold transition",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-gray-700 hover:bg-slate-50",
                  ]
                    .filter(Boolean)
                    .join(" ")
                }
              >
                <item.Icon className="w-4 h-4" />
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="mt-auto p-6 border-t border-slate-200">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs text-gray-400">Signed in as</p>
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {user?.name ?? "Admin"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => void handleLogout()}
                className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-100 transition-colors"
              >
                <Icons.Close className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </aside>

        <div className="flex-1">
          <header className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b border-slate-200">
            <div className="px-4 sm:px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Icons.Pill className="w-4 h-4 text-primary" />
                Medigo Admin Panel
              </div>
              <div className="text-xs text-gray-400">
                {user?.email ?? ""}
              </div>
            </div>
          </header>

          <main className="p-4 sm:p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
