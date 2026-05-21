import { Link } from "react-router-dom";
import MainContainer from "../../../shared/main-container/MainContainer";
import { Icons } from "../../../shared/icons/Icons";

const metrics = [
  {
    label: "Pending requests",
    value: 12,
    icon: Icons.Cart,
    accent: "from-sky-500 to-cyan-500",
  },
  {
    label: "Prescribed orders",
    value: 8,
    icon: Icons.Prescription,
    accent: "from-emerald-500 to-lime-500",
  },
  {
    label: "Orders ready",
    value: 5,
    icon: Icons.Delivery,
    accent: "from-violet-500 to-fuchsia-500",
  },
  {
    label: "Verification tasks",
    value: 7,
    icon: Icons.Check,
    accent: "from-amber-400 to-orange-500",
  },
];

const actionLinks = [
  {
    label: "Review requested orders",
    to: "/pharmacist/requested-orders",
    description: "Approve or update patient requests.",
    icon: Icons.Cart,
  },
  {
    label: "Review prescribed orders",
    to: "/pharmacist/prescribed-orders",
    description: "Verify prescriptions and prepare dispatch.",
    icon: Icons.Prescription,
  },
];

const MetricCard = ({ label, value, Icon, accent }: { label: string; value: number; Icon: typeof Icons.Dashboard; accent: string }) => (
  <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm">
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">{label}</p>
        <p className="mt-3 text-3xl font-black text-slate-900">{value}</p>
      </div>
      <div className={`rounded-3xl bg-gradient-to-br ${accent} p-3 text-white shadow-sm`}>
        <Icon className="!w-6 !h-6" />
      </div>
    </div>
  </div>
);

export default function PharmacistDashboardPage() {
  return (
    <MainContainer>
      <div className="space-y-8 py-6">
        <div className="rounded-[32px] border border-slate-200 bg-slate-950 p-8 text-white shadow-[0_20px_80px_-24px_rgba(15,23,42,0.6)]">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-300/80">Pharmacist portal</p>
              <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">Your pharmacy operations at a glance</h1>
              <p className="mt-4 max-w-xl text-sm leading-7 text-slate-300">
                Manage incoming prescriptions, review requested medicines, and keep the pharmacy workflow moving with quick access to the tasks that matter most today.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-2">
              {actionLinks.map((action) => (
                <Link
                  key={action.to}
                  to={action.to}
                  className="rounded-3xl bg-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
                >
                  <div className="flex items-center gap-2">
                    <action.icon className="!w-5 !h-5 text-white" />
                    <span>{action.label}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
          {metrics.map((metric) => (
            <MetricCard
              key={metric.label}
              label={metric.label}
              value={metric.value}
              Icon={metric.icon}
              accent={metric.accent}
            />
          ))}
        </div>

        <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Today's overview</p>
                <h2 className="mt-2 text-xl font-black text-slate-900">Immediate priorities</h2>
              </div>
              <div className="rounded-3xl bg-slate-950/5 px-4 py-2 text-sm font-semibold text-slate-700">Updated now</div>
            </div>
            <div className="mt-6 space-y-4">
              <div className="rounded-3xl bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">7 pending pharmacist verifications</p>
                    <p className="mt-1 text-xs text-slate-500">Check prescriptions for accuracy before fulfillment.</p>
                  </div>
                  <Icons.Check className="!w-6 !h-6 text-emerald-500" />
                </div>
              </div>
              <div className="rounded-3xl bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">5 orders ready for dispatch</p>
                    <p className="mt-1 text-xs text-slate-500">Confirm packaging and hand over to delivery.</p>
                  </div>
                  <Icons.Delivery className="!w-6 !h-6 text-sky-500" />
                </div>
              </div>
              <div className="rounded-3xl bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">3 follow-up consultations pending</p>
                    <p className="mt-1 text-xs text-slate-500">Review pharmacist notes and update patient instructions.</p>
                  </div>
                  <Icons.Time className="!w-6 !h-6 text-amber-500" />
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-slate-950 p-6 text-white shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-slate-300">Quick actions</p>
                <h2 className="mt-2 text-xl font-black">Keep workflow moving</h2>
              </div>
              <Icons.Pill className="!w-7 !h-7 text-cyan-300" />
            </div>
            <div className="mt-6 space-y-3">
              {actionLinks.map((action) => (
                <Link
                  key={action.to}
                  to={action.to}
                  className="block rounded-3xl border border-white/10 bg-white/10 px-4 py-4 text-sm font-semibold text-white transition hover:border-white/20 hover:bg-white/15"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span>{action.label}</span>
                    <action.icon className="!w-5 !h-5 text-white" />
                  </div>
                  <p className="mt-2 text-xs text-slate-300">{action.description}</p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </MainContainer>
  );
}
