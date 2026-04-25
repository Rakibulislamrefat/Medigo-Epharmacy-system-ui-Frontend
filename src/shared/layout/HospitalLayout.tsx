import { NavLink, Outlet } from "react-router-dom";
import { Icons } from "../icons/Icons";

const navItems = [
  { label: "Dashboard", to: "/hospital" },
];

const HospitalLayout = () => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="flex">
        <aside className="hidden lg:flex w-64 flex-col border-r border-slate-200 bg-white">
          <div className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
                <Icons.Hospital className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[3px] text-gray-400">
                  Portal
                </p>
                <p className="text-sm font-semibold text-gray-900">Hospital</p>
              </div>
            </div>
          </div>

          <nav className="px-4 space-y-2">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  [
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold transition",
                    isActive
                      ? "bg-red-50 text-red-700"
                      : "text-gray-600 hover:bg-slate-50",
                  ]
                    .filter(Boolean)
                    .join(" ")
                }
              >
                <Icons.Dashboard className="w-4 h-4" />
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="mt-auto p-6 text-xs text-gray-400">
            BloodConnect Hospital Portal
          </div>
        </aside>

        <div className="flex-1">
          <header className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b border-slate-200">
            <div className="px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Icons.Blood className="w-4 h-4 text-red-500" />
                Donation approvals
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                Hospital shift dashboard
              </div>
            </div>
          </header>

          <main className="p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default HospitalLayout;
