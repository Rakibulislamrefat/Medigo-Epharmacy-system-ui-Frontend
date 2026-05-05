import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getUsers, type UserRole, type UserStatus } from "../service/usersApi";
import MainContainer from "../../../shared/main-container/MainContainer";
import SectionContainer from "../../../shared/section-container/SectionContainer";
import SectionHeading from "../../../shared/section-heading/SectionHeading";
import CustomButton from "../../../shared/button/CustomButton";
import { Mail, Phone, MapPin, Calendar } from "lucide-react";

const formatDate = (v?: string) => {
  if (!v) return "";
  const d = new Date(v);
  return Number.isNaN(d.getTime())
    ? v
    : d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};

const roleColors: Record<UserRole, { bg: string; text: string; label: string }> = {
  user: { bg: "bg-blue-50", text: "text-blue-600", label: "Patient" },
  doctor: { bg: "bg-green-50", text: "text-green-600", label: "Doctor" },
  pharmacist: { bg: "bg-purple-50", text: "text-purple-600", label: "Pharmacist" },
  admin: { bg: "bg-red-50", text: "text-red-600", label: "Admin" },
};

const statusColors: Record<UserStatus, { bg: string; text: string; dot: string }> = {
  active: { bg: "bg-emerald-50", text: "text-emerald-600", dot: "bg-emerald-500" },
  pending: { bg: "bg-amber-50", text: "text-amber-600", dot: "bg-amber-500" },
  blocked: { bg: "bg-red-50", text: "text-red-600", dot: "bg-red-500" },
};

export default function UsersPage() {
  const [searchText, setSearchText] = useState("");
  const [q, setQ] = useState("");
  const [roleFilter, setRoleFilter] = useState<UserRole | "">("");
  const [statusFilter, setStatusFilter] = useState<UserStatus | "">("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  useEffect(() => {
    const t = window.setTimeout(() => {
      setQ(searchText.trim());
      setPage(1);
    }, 400);
    return () => window.clearTimeout(t);
  }, [searchText]);

  const { data: paged, isLoading, error } = useQuery({
    queryKey: ["users", { q, roleFilter, statusFilter, page, limit }],
    queryFn: () =>
      getUsers({
        q: q || undefined,
        role: roleFilter || undefined,
        status: statusFilter || undefined,
        page,
        limit,
      }),
    retry: 1,
  });

  const items = paged?.items ?? [];
  const meta = paged?.meta ?? { page: 1, limit, total: 0, totalPages: 1 };

  const roles = useMemo(() => ["user", "doctor", "pharmacist", "admin"] as const, []);
  const statuses = useMemo(() => ["active", "pending", "blocked"] as const, []);
  const limitOptions = useMemo(() => [10, 20, 50], []);

  return (
    <MainContainer>
      <SectionContainer>
        <div className="mb-8">
          <SectionHeading
            title="Medigo Community"
            description="Browse and connect with healthcare professionals and patients"
          />
        </div>

        {/* Filters */}
        <div className="rounded-xl border border-gray-100 bg-white p-5 mb-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center flex-1">
              <input
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="h-10 flex-1 rounded-lg border border-gray-200 bg-white px-3 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="Search by name, email, or phone..."
              />
              <select
                value={roleFilter}
                onChange={(e) => {
                  setRoleFilter(e.target.value as UserRole | "");
                  setPage(1);
                }}
                className="h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="">All roles</option>
                {roles.map((r) => (
                  <option key={r} value={r}>
                    {roleColors[r as UserRole].label}
                  </option>
                ))}
              </select>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value as UserStatus | "");
                  setPage(1);
                }}
                className="h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="">All status</option>
                {statuses.map((s) => (
                  <option key={s} value={s}>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500">Show</span>
              <select
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setPage(1);
                }}
                className="h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                {limitOptions.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Results */}
        {isLoading && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="rounded-xl border border-gray-100 bg-white p-5 animate-pulse h-64" />
            ))}
          </div>
        )}

        {!isLoading && (error || !paged) && (
          <div className="rounded-xl border border-red-100 bg-red-50 p-5 text-sm text-red-600">
            Failed to load users. Please try again.
          </div>
        )}

        {!isLoading && paged && items.length === 0 && (
          <div className="rounded-xl border border-amber-100 bg-amber-50 p-5 text-sm text-amber-600 text-center">
            No users found. Try adjusting your search filters.
          </div>
        )}

        {!isLoading && paged && items.length > 0 && (
          <div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {items.map((user) => {
                const roleInfo = roleColors[user.role as UserRole];
                const statusInfo = statusColors[user.status as UserStatus];
                const primaryAddress = user.addresses?.find((a) => a.isDefault) || user.addresses?.[0];

                return (
                  <div
                    key={user._id}
                    className="rounded-xl border border-gray-100 bg-white overflow-hidden hover:shadow-md transition-shadow"
                  >
                    {/* Header with role badge */}
                    <div className={`px-5 py-3 border-b border-gray-100 flex items-start justify-between ${roleInfo.bg}`}>
                      <div className="flex-1">
                        <h3 className="font-semibold text-dark">{user.name}</h3>
                        <span className={`text-xs font-semibold ${roleInfo.text}`}>
                          {roleInfo.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className={`w-2 h-2 rounded-full ${statusInfo.dot}`} />
                        <span className={`text-xs font-semibold ${statusInfo.text}`}>
                          {user.status?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    </div>

                    {/* Body */}
                    <div className="px-5 py-4 space-y-3">
                      {/* Email */}
                      {user.email && (
                        <div className="flex items-start gap-3">
                          <Mail className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="text-xs text-slate-500 font-semibold">Email</p>
                            <p className="text-sm text-dark truncate">{user.email}</p>
                            {user.isEmailVerified && (
                              <span className="text-xs text-emerald-600 font-semibold">✓ Verified</span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Phone */}
                      {user.phone && (
                        <div className="flex items-start gap-3">
                          <Phone className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="text-xs text-slate-500 font-semibold">Phone</p>
                            <p className="text-sm text-dark">{user.phone}</p>
                          </div>
                        </div>
                      )}

                      {/* Location */}
                      {primaryAddress && (
                        <div className="flex items-start gap-3">
                          <MapPin className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="text-xs text-slate-500 font-semibold">Location</p>
                            <p className="text-sm text-dark">
                              {primaryAddress.city}, {primaryAddress.state}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Joined Date */}
                      <div className="flex items-start gap-3">
                        <Calendar className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-xs text-slate-500 font-semibold">Joined</p>
                          <p className="text-sm text-dark">{formatDate(user.createdAt)}</p>
                        </div>
                      </div>
                    </div>

                    {/* Footer with action button */}
                    <div className="px-5 py-3 border-t border-gray-100 bg-gray-50">
                      <CustomButton fullWidth variant="outline" size="sm">
                        View Profile
                      </CustomButton>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-5 py-4 bg-white rounded-xl border border-gray-100">
              <div className="text-sm text-slate-600">
                {meta.total === 0
                  ? "No results"
                  : (() => {
                      const start = (page - 1) * limit + 1;
                      const end = Math.min(meta.total, page * limit);
                      return `Showing ${start}–${end} of ${meta.total} users`;
                    })()}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="h-10 px-4 rounded-lg border border-gray-200 bg-white text-sm font-semibold hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  Previous
                </button>
                <span className="text-sm font-semibold text-slate-700">
                  Page {page} / {meta.totalPages}
                </span>
                <button
                  type="button"
                  disabled={page >= meta.totalPages}
                  onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
                  className="h-10 px-4 rounded-lg border border-gray-200 bg-white text-sm font-semibold hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </SectionContainer>
    </MainContainer>
  );
}
