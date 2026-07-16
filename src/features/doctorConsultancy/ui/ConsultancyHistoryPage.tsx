import { NavLink } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { Icons } from "../../../shared/icons/Icons";
import CustomButton from "../../../shared/button/CustomButton";
import MainContainer from "../../../shared/main-container/MainContainer";
import SectionContainer from "../../../shared/section-container/SectionContainer";
import { getMyConsultancies, type ConsultancyResponse } from "../service/consultancyApi";
import type { RootState } from "../../../redux/store";

const formatDateTime = (value?: string | null) => {
  if (!value) return "-";
  return new Intl.DateTimeFormat("en-BD", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
};

const getStatusColor = (status?: string) => {
  switch (status?.toLowerCase()) {
    case "requested":
      return "bg-amber-50 text-amber-700 border-amber-200";
    case "confirmed":
    case "ready":
      return "bg-blue-50 text-blue-700 border-blue-200";
    case "completed":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "cancelled":
      return "bg-red-50 text-red-700 border-red-200";
    default:
      return "bg-gray-50 text-slate-700 border-gray-200";
  }
};

const getModeLabel = (mode?: string) => {
  switch (mode) {
    case "chat":
      return "Chat";
    case "video":
      return "Video";
    case "audio":
      return "Audio";
    case "in_person":
      return "In person";
    default:
      return "Unknown";
  }
};

const getDoctorName = (consultancy: ConsultancyResponse) =>
  typeof consultancy.doctor === "string"
    ? consultancy.doctor
    : consultancy.doctor?.fullName || consultancy.doctor?.name || "Doctor";

const getDoctorSpecialization = (consultancy: ConsultancyResponse) =>
  typeof consultancy.doctor === "string"
    ? "General consultation"
    : consultancy.doctor?.specialization ?? "General consultation";

export default function ConsultancyHistoryPage() {
  const user = useSelector((state: RootState) => state.user.user);

  const {
    data: consultancies = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["consultancies", "me"],
    queryFn: getMyConsultancies,
    enabled: Boolean(user),
    retry: false,
  });

  const statusCounts = consultancies.reduce(
    (acc, item) => {
      const status = item.status?.toLowerCase();
      if (status === "requested") acc.requested += 1;
      else if (status === "confirmed") acc.confirmed += 1;
      else if (status === "ready") acc.ready += 1;
      else if (status === "completed") acc.completed += 1;
      else if (status === "cancelled") acc.cancelled += 1;
      else acc.other += 1;
      return acc;
    },
    { requested: 0, confirmed: 0, ready: 0, completed: 0, cancelled: 0, other: 0 },
  );

  if (!user) {
    return (
      <SectionContainer>
        <MainContainer>
          <div className="mx-auto max-w-2xl rounded-3xl border border-gray-100 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Icons.AlertCircle className="!h-7 !w-7" />
            </div>
            <h1 className="mt-5 text-3xl font-black text-dark">Sign in to view your consultancies</h1>
            <p className="mt-3 text-sm text-slate-600">
              Log in to see your booked consultancy requests, appointments, and status updates.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <NavLink to="/login">
                <CustomButton variant="primary" size="sm" radius="full">
                  Sign in
                </CustomButton>
              </NavLink>
              <NavLink to="/doctor-consultancy">
                <CustomButton variant="outline" size="sm" radius="full">
                  Book consultancy
                </CustomButton>
              </NavLink>
            </div>
          </div>
        </MainContainer>
      </SectionContainer>
    );
  }

  return (
    <SectionContainer>
      <MainContainer>
        <div className="mb-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-3xl font-black text-dark">My Consultancies</h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-600">
                Review your booked consultancy appointments, status, doctor details, and next steps.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <NavLink to="/doctor-consultancy">
                <CustomButton variant="outline" size="sm" radius="full">
                  Book new consultancy
                </CustomButton>
              </NavLink>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3 xl:grid-cols-6">
            {[
              { label: "Requested", value: statusCounts.requested },
              { label: "Confirmed", value: statusCounts.confirmed },
              { label: "Ready", value: statusCounts.ready },
              { label: "Completed", value: statusCounts.completed },
              { label: "Cancelled", value: statusCounts.cancelled },
            ].map((item) => (
              <div key={item.label} className="rounded-3xl border border-gray-100 bg-white p-4 shadow-sm">
                <div className="text-sm text-slate-500">{item.label}</div>
                <div className="mt-3 text-2xl font-black text-dark">{item.value}</div>
              </div>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="rounded-3xl border border-gray-100 bg-white p-10 text-center shadow-sm">
            <Icons.Loading className="!h-8 !w-8 mx-auto animate-spin text-primary" />
            <p className="mt-4 text-sm text-slate-600">Loading your consultancy history...</p>
          </div>
        ) : isError ? (
          <div className="rounded-3xl border border-red-100 bg-red-50 p-8 text-center text-red-700 shadow-sm">
            <p className="font-semibold">Unable to load consultancy history.</p>
            <p className="mt-2 text-sm text-red-700">{(error as Error)?.message ?? "Please try again later."}</p>
          </div>
        ) : consultancies.length === 0 ? (
          <div className="rounded-3xl border border-gray-100 bg-white p-10 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Icons.Clock className="!h-7 !w-7" />
            </div>
            <h2 className="mt-5 text-2xl font-black text-dark">No booked consultancies yet</h2>
            <p className="mt-2 text-sm text-slate-600">
              Once you book a consultancy, it will appear here with your appointment details.
            </p>
            <div className="mt-6">
              <NavLink to="/doctor-consultancy">
                <CustomButton variant="primary" size="sm" radius="full">
                  Book your first consultancy
                </CustomButton>
              </NavLink>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            {consultancies.map((consultancy) => (
              <div
                key={consultancy._id ?? consultancy.id ?? consultancy.appointmentId ?? Math.random()}
                className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-500">Doctor</p>
                    <h2 className="mt-1 text-xl font-black text-dark">
                      {getDoctorName(consultancy)}
                    </h2>
                    <p className="mt-2 text-sm text-slate-600">
                      {getDoctorSpecialization(consultancy)}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold capitalize ${getStatusColor(consultancy.status)}`}>
                      {consultancy.status ?? "Unknown"}
                    </span>
                    <span className="inline-flex rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-semibold capitalize text-slate-700">
                      {getModeLabel(consultancy.mode)}
                    </span>
                  </div>
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">
                      Scheduled
                    </p>
                    <p className="mt-2 text-sm font-semibold text-dark">
                      {formatDateTime(consultancy.scheduledAt)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">
                      Booked on
                    </p>
                    <p className="mt-2 text-sm font-semibold text-dark">
                      {formatDateTime(consultancy.createdAt)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">
                      Contact
                    </p>
                    <p className="mt-2 text-sm text-slate-600">
                      {consultancy.contactEmail ?? consultancy.contactPhone ?? "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">
                      Payment
                    </p>
                    <p className="mt-2 text-sm font-semibold text-dark capitalize">
                      {consultancy.paymentStatus ?? "Pending"}
                    </p>
                  </div>
                </div>

                {consultancy.notes ? (
                  <div className="mt-6 rounded-3xl border border-gray-100 bg-gray-50 p-4">
                    <p className="text-sm font-semibold text-slate-500">Notes</p>
                    <p className="mt-2 text-sm text-slate-700">{consultancy.notes}</p>
                  </div>
                ) : null}

                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="text-sm text-slate-500">
                    Appointment ID: {consultancy.appointmentId ?? consultancy._id}
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <NavLink to="/doctor-consultancy">
                      <CustomButton variant="outline" size="sm" radius="full">
                        Book another
                      </CustomButton>
                    </NavLink>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </MainContainer>
    </SectionContainer>
  );
}
