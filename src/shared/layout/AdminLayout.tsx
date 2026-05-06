import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { Bell, LogOut, Search } from "lucide-react";
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
    <div className="min-h-screen bg-slate-50/50 text-slate-900 font-sans selection:bg-primary/20">
      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden lg:flex w-[280px] flex-col border-r border-slate-200/60 bg-white/80 backdrop-blur-xl z-20 fixed h-screen">
          {/* Brand */}
          <div className="p-6 border-b border-slate-100/60">
            <div className="flex items-center gap-4">
              <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary to-emerald-400 text-white flex items-center justify-center shadow-lg shadow-primary/30">
                <Icons.Dashboard className="w-6 h-6 drop-shadow-sm" />
                <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/20"></div>
              </div>
              <div className="flex flex-col">
                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 mb-0.5">
                  Medigo
                </p>
                <p className="text-lg font-black text-slate-800 tracking-tight leading-none">
                  Admin<span className="text-primary">.</span>
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto scrollbar-hide">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/admin"}
              >
                {({ isActive }) => (
                  <div
                    className={[
                      "group flex items-center gap-4 rounded-2xl px-4 py-3.5 transition-all duration-300 cursor-pointer relative overflow-hidden",
                      isActive
                        ? "bg-gradient-to-r from-primary/10 via-primary/5 to-transparent shadow-sm border border-primary/10"
                        : "hover:bg-slate-50 border border-transparent",
                    ].join(" ")}
                  >
                    {isActive && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r-full shadow-[0_0_10px_rgba(var(--color-primary),0.5)]"></div>
                    )}
                    <item.Icon
                      className={[
                        "w-5 h-5 transition-transform duration-300",
                        isActive
                          ? "text-primary scale-110 drop-shadow-sm"
                          : "text-slate-400 group-hover:text-primary group-hover:scale-110",
                      ].join(" ")}
                    />
                    <span
                      className={[
                        "text-sm font-bold transition-colors duration-300",
                        isActive ? "text-primary" : "text-slate-600 group-hover:text-slate-900",
                      ].join(" ")}
                    >
                      {item.label}
                    </span>
                  </div>
                )}
              </NavLink>
            ))}
          </nav>

          {/* User Footer */}
          <div className="mt-auto p-6 border-t border-slate-100/60 bg-slate-50/50">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-slate-200 to-slate-100 flex items-center justify-center border border-slate-200 text-slate-600 font-bold shadow-inner">
                  {user?.name?.charAt(0).toUpperCase() ?? "A"}
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Signed in as</p>
                  <p className="text-sm font-bold text-slate-800 truncate">
                    {user?.name ?? "Admin"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => void handleLogout()}
                className="group relative p-2.5 rounded-xl bg-white border border-red-100 text-red-500 shadow-sm transition-all duration-300 hover:scale-[1.05] hover:border-red-200 hover:bg-red-50 hover:text-red-600 hover:shadow-md hover:shadow-red-500/10 active:scale-95 tooltip tooltip-left"
                data-tip="Logout"
              >
                <LogOut className="w-5 h-5 transition-transform group-hover:-translate-x-0.5" />
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 lg:ml-[280px] min-h-screen flex flex-col">
          {/* Top Navbar */}
          <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-slate-200/50 shadow-sm shadow-slate-200/10">
            <div className="px-4 sm:px-8 h-20 flex items-center justify-between">
              
              {/* Left: Brand/Context */}
              <div className="flex items-center gap-4">
                <div className="p-2.5 bg-gradient-to-br from-primary/10 to-transparent rounded-xl border border-primary/10 shadow-sm">
                  <Icons.Pill className="w-5 h-5 text-primary drop-shadow-sm" />
                </div>
                <div className="flex flex-col">
                  <span className="text-base font-black text-slate-800 tracking-tight hidden sm:block">Medigo E-Pharmacy Dashboard</span>
                  <span className="text-base font-black text-slate-800 tracking-tight sm:hidden">Medigo Admin</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] hidden sm:block">Central Management System</span>
                </div>
              </div>

              {/* Right: Actions & User */}
              <div className="flex items-center gap-3 sm:gap-6">
                
                {/* Search Bar (Fake for UI feel) */}
                <div className="hidden md:flex relative group">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                  <input 
                    type="text" 
                    placeholder="Quick search..." 
                    className="h-10 w-48 lg:w-64 pl-10 pr-4 rounded-full bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-inner"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                    Ctrl K
                  </div>
                </div>

                <div className="w-px h-8 bg-slate-200 hidden sm:block"></div>

                {/* Notifications */}
                <button className="relative p-2.5 bg-slate-50 border border-slate-200 text-slate-500 hover:text-primary hover:bg-white hover:border-primary/30 hover:shadow-md hover:shadow-primary/5 transition-all duration-300 focus:outline-none rounded-full group">
                  <Bell className="w-5 h-5 group-hover:animate-[wiggle_1s_ease-in-out_infinite]" />
                  <span className="absolute top-0 right-0 w-3 h-3 bg-rose-500 border-2 border-white rounded-full"></span>
                </button>
                
                {/* User Email Pill */}
                <div className="hidden sm:flex items-center gap-2 bg-slate-50 border border-slate-200 pl-2 pr-4 py-1.5 rounded-full shadow-sm">
                  <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                    {user?.email?.charAt(0).toUpperCase() ?? "A"}
                  </div>
                  <span className="text-xs font-bold text-slate-600">
                    {user?.email ?? "admin@medigo.com"}
                  </span>
                </div>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 p-4 sm:p-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
