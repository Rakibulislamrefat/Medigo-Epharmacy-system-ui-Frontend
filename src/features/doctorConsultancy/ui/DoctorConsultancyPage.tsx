import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import type { RootState } from "../../../redux/store";
import {
  createConsultancy,
  getPublicDoctors,
  sendConsultancyConfirmation,
  type PublicDoctor,
} from "../service/consultancyApi";
import CustomButton from "../../../shared/button/CustomButton";
import { Icons } from "../../../shared/icons/Icons";
import MainContainer from "../../../shared/main-container/MainContainer";
import SectionContainer from "../../../shared/section-container/SectionContainer";

type Doctor = {
  id: string;
  name: string;
  title: string;
  specialty: string;
  experienceYears: number;
  rating: number;
  reviews: number;
  fee: number;
  currency?: string;
  languages: string[];
  nextAvailable: string;
  location: string;
  type: "Online" | "In-person" | "Both";
  profileImage?: string;
};

const specialties = [
  "General Physician",
  "Dermatology",
  "Pediatrics",
  "Gynecology",
  "Cardiology",
  "Diabetology",
  "ENT",
  "Orthopedics",
] as const;

const formatFee = (fee: number, currency = "BDT") => `${currency} ${fee}`;

const formatNextAvailable = (doctor: PublicDoctor) => {
  if (doctor.nextAvailableAt) {
    const date = new Date(doctor.nextAvailableAt);
    if (!Number.isNaN(date.getTime())) {
      return date.toLocaleString("en-GB", {
        day: "2-digit",
        month: "short",
        hour: "numeric",
        minute: "2-digit",
      });
    }
  }

  const slot = doctor.availability?.[0];
  if (slot) {
    return `${slot.day}, ${slot.startTime}-${slot.endTime}`;
  }

  return "To be scheduled";
};

const formatConsultationType = (type?: string): Doctor["type"] => {
  if (type === "online") return "Online";
  if (type === "in-person") return "In-person";
  return "Both";
};

const mapDoctor = (doctor: PublicDoctor): Doctor => ({
  id: doctor._id,
  name: doctor.fullName,
  title: doctor.qualifications?.length ? doctor.qualifications.join(", ") : doctor.bio || "Doctor",
  specialty: doctor.specialization ?? "General Physician",
  experienceYears: doctor.experienceYears ?? 0,
  rating: doctor.rating ?? 0,
  reviews: doctor.totalReviews ?? 0,
  fee: doctor.fee ?? 0,
  currency: doctor.currency ?? "BDT",
  languages: doctor.languages ?? [],
  nextAvailable: formatNextAvailable(doctor),
  location: doctor.city ?? "",
  type: formatConsultationType(doctor.consultationType),
  profileImage: doctor.profileImage || undefined,
});

export default function DoctorConsultancyPage() {
  const bookingRef = useRef<HTMLDivElement | null>(null);
  const [query, setQuery] = useState("");
  const [specialty, setSpecialty] = useState<string>("All specialties");
  const [onlyOnline, setOnlyOnline] = useState(false);

  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [patientName, setPatientName] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");

  const {
    data: doctorsResponse,
    isLoading: doctorsLoading,
    error: doctorsError,
  } = useQuery({
    queryKey: ["public", "doctors"],
    queryFn: () => getPublicDoctors({ status: "active", page: 1, rows: 100 }),
    retry: 1,
  });

  const doctors = useMemo(
    () => (doctorsResponse?.items ?? []).map(mapDoctor),
    [doctorsResponse?.items],
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.location.hash !== "#book-now") return;
    bookingRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const filteredDoctors = useMemo(() => {
    const q = query.trim().toLowerCase();
    return doctors.filter((d) => {
      const matchesQuery =
        !q ||
        d.name.toLowerCase().includes(q) ||
        d.specialty.toLowerCase().includes(q) ||
        d.location.toLowerCase().includes(q);

      const matchesSpecialty =
        specialty === "All specialties" || d.specialty === specialty;

      const matchesOnline = !onlyOnline || d.type === "Online" || d.type === "Both";

      return matchesQuery && matchesSpecialty && matchesOnline;
    });
  }, [doctors, onlyOnline, query, specialty]);

  const canSubmit =
    Boolean(selectedDoctor) && Boolean(patientName.trim()) && Boolean(phone.trim());

  const user = useSelector((s: RootState) => s.user.user);

  const submitBooking = async () => {
    if (!selectedDoctor) return;
    if (!patientName.trim()) {
      toast.error("Please enter your name");
      return;
    }
    const cleanedPhone = phone.trim().replace(/[\s-]/g, "");
    const bdPhone = /^(?:\+?88)?01[3-9]\d{8}$/;
    if (!cleanedPhone) {
      toast.error("Please enter your phone number");
      return;
    }
    if (!bdPhone.test(cleanedPhone)) {
      toast.error("Use a valid Bangladeshi number (01XXXXXXXXX)");
      return;
    }
    // Prepare payload to persist
    const payload = {
      userId: user?._id,
      doctorId: selectedDoctor.id,
      status: "requested",
      mode: selectedDoctor.type.toLowerCase(),
      scheduledAt: null,
      patientName: patientName.trim(),
      contactPhone: phone.trim(),
      notes: notes.trim(),
    };

    const t = toast.loading("Submitting booking...");
    try {
      const res = await createConsultancy(payload);
      // res may contain an id or _id depending on backend
      const id = (res && (res._id || res.id || res.appointmentId)) ?? null;

      toast.success(`Request received! Booking ID: ${id ?? "(pending)"}`, { id: t });

      // Generate appointment script including backend id if present
      const script = generateAppointmentScript({
        doctor: selectedDoctor,
        patientName: patientName.trim(),
        phone: phone.trim(),
        notes: notes.trim(),
      }) + (id ? `\n\nBackend ID: ${id}` : "");
      setAppointmentScript(script);
      setShowScriptModal(true);

      // Attempt to send confirmation email (best-effort)
      if (id) {
        try {
          await sendConsultancyConfirmation(id);
        } catch {
          // ignore
        }
      }
    } catch (err) {
      toast.error("Failed to submit booking. Please try again.", { id: t });
      return;
    }

    // Reset form selection but keep script visible
    setSelectedDoctor(null);
    setPatientName("");
    setPhone("");
    setNotes("");
  };

  // Appointment script state
  const [appointmentScript, setAppointmentScript] = useState<string>("");
  const [showScriptModal, setShowScriptModal] = useState(false);

  const generateAppointmentScript = ({
    doctor,
    patientName,
    phone,
    notes,
  }: {
    doctor: Doctor | null;
    patientName: string;
    phone: string;
    notes: string;
  }) => {
    const id = `MDG-APPT-${Date.now().toString().slice(-6)}`;
    const when = doctor?.nextAvailable ?? "To be scheduled";
    const mode = doctor?.type ?? "Unknown";
    const fee = doctor ? formatFee(doctor.fee, doctor.currency) : "N/A";

    return `Appointment Confirmation\n-------------------------\nAppointment ID: ${id}\nDoctor: ${doctor?.name ?? "-"} (${doctor?.specialty ?? "-"})\nMode: ${mode}\nWhen: ${when}\nFee: ${fee}\n\nPatient Name: ${patientName}\nContact: ${phone}\nNotes: ${notes || "-"}\n\nPlease keep this confirmation for your records. Medigo e‑Pharmacy will contact you to confirm the exact slot.`;
  };

  const copyScriptToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(appointmentScript);
      toast.success("Appointment script copied to clipboard");
    } catch (err) {
      toast.error("Failed to copy");
    }
  };

  const downloadScript = () => {
    try {
      const blob = new Blob([appointmentScript], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "medigo-appointment.txt";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      toast.error("Failed to download");
    }
  };

  return (
    <SectionContainer>
      <MainContainer>
        <div>       
          <div id="doctors">
            <div className="rounded-xs shadow-lg shadow-primary/5">
              <div className="bg-white border border-gray-100 rounded-2xl p-6 sm:p-7">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <p className="text-xxs font-black tracking-[0.2em] uppercase text-primary">
                      Doctors
                    </p>
                    <p className="text-sm font-semibold text-dark mt-1">
                      Find the right specialist
                    </p>
                  </div>
                  <span className="text-xxs font-black bg-primary/10 text-primary px-3 py-1 rounded-full w-fit">
                    {filteredDoctors.length} available
                  </span>
                </div>

                <div className="mt-5 grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
                  <div className="lg:col-span-7">
                    <div className="flex flex-col sm:flex-row gap-2">
                      <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                          <Icons.Search className="!w-4 !h-4" />
                        </span>
                        <input
                          value={query}
                          onChange={(e) => setQuery(e.target.value)}
                          className="w-full rounded-full border border-gray-200 bg-gray-50 px-10 py-2.5 text-sm outline-none focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20"
                          placeholder="Search doctor, specialty, city..."
                        />
                      </div>
                      <select
                        value={specialty}
                        onChange={(e) => setSpecialty(e.target.value)}
                        className="w-full sm:w-60 rounded-full border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20"
                      >
                        <option>All specialties</option>
                        {specialties.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>

                    <label className="mt-3 inline-flex items-center gap-2 text-sm text-slate-600 select-none">
                      <input
                        type="checkbox"
                        checked={onlyOnline}
                        onChange={(e) => setOnlyOnline(e.target.checked)}
                        className="w-4 h-4 accent-primary"
                      />
                      Only show online doctors
                    </label>

                    {doctorsLoading && (
                      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {[1, 2, 3, 4].map((n) => (
                          <div
                            key={n}
                            className="h-56 rounded-2xl border border-gray-100 bg-light animate-pulse"
                          />
                        ))}
                      </div>
                    )}

                    {!doctorsLoading && doctorsError && (
                      <div className="mt-5 rounded-xl border border-red-100 bg-red-50 p-5 text-sm text-red-600">
                        Failed to load doctors. Please try again.
                      </div>
                    )}

                    {!doctorsLoading && !doctorsError && (
                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {filteredDoctors.map((d) => (
                        <div
                          key={d.id}
                          className="group rounded-2xl border border-gray-100 bg-light p-5 hover:bg-white hover:shadow-md transition"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/15 center-flex shrink-0">
                                {d.profileImage ? (
                                  <img
                                    src={d.profileImage}
                                    alt={d.name}
                                    className="h-full w-full rounded-xl object-cover"
                                  />
                                ) : (
                                  <Icons.User className="!w-6 !h-6 text-primary" />
                                )}
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-black text-dark truncate">
                                  {d.name}
                                </p>
                                <p className="text-xs text-slate-600 mt-1 truncate">
                                  {d.title}
                                </p>
                              </div>
                            </div>
                            <span className="text-xxs font-black bg-secondary/15 text-secondary px-3 py-1 rounded-full shrink-0">
                              {d.type}
                            </span>
                          </div>

                          <div className="mt-4 flex items-center gap-2 text-sm text-slate-700">
                            <Icons.Heartbeat className="!w-4 !h-4 text-primary" />
                            <span className="font-semibold">{d.specialty}</span>
                            <span className="text-slate-400">-</span>
                            <span className="text-slate-600">
                              {d.experienceYears} yrs
                            </span>
                          </div>

                          <div className="mt-2 grid grid-cols-1 gap-2 text-xs text-slate-600">
                            <div className="flex items-center gap-2">
                              <Icons.LocationPin className="!w-4 !h-4 text-primary" />
                              <span className="truncate">{d.location}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Icons.Clock className="!w-4 !h-4 text-primary" />
                              <span className="truncate">
                                Next: {d.nextAvailable}
                              </span>
                            </div>
                            {/* <div className="flex items-center gap-2">
                              <Icons.Star className="!w-4 !h-4 text-secondary" />
                              <span>
                                {d.rating.toFixed(1)} ({d.reviews})
                              </span>
                            </div> */}
                          </div>

                          <div className="mt-4 flex items-center justify-between gap-3">
                            <div>
                              <p className="text-xs text-slate-500">Fee</p>
                              <p className="text-sm font-black text-dark">
                                {formatFee(d.fee, d.currency)}
                              </p>
                            </div>
                            <CustomButton
                              variant="primary"
                              size="sm"
                              radius="full"
                              onClick={() => {
                                setSelectedDoctor(d);
                                toast.success(`Selected ${d.name}`);
                                requestAnimationFrame(() => {
                                  bookingRef.current?.scrollIntoView({
                                    behavior: "smooth",
                                    block: "start",
                                  });
                                });
                              }}
                              leftIcon={<Icons.ArrowForward className="!w-4 !h-4" />}
                            >
                              Book Now
                            </CustomButton>
                          </div>
                        </div>
                      ))}
                    </div>
                    )}

                    {!doctorsLoading && !doctorsError && filteredDoctors.length === 0 && (
                      <div className="mt-5 rounded-xl border border-gray-100 bg-light p-5 text-sm text-slate-600">
                        No doctors match your filters. Try a different specialty or
                        search term.
                      </div>
                    )}
                  </div>

                  <div className="lg:col-span-5">
                    <div
                      id="book-now"
                      ref={bookingRef}
                      className="rounded-2xl border border-gray-100 bg-white p-5 sm:p-6 shadow-sm lg:sticky lg:top-24"
                    >
                      <p className="text-xxs font-black tracking-[0.2em] uppercase text-primary">
                        Booking
                      </p>
                      <p className="text-sm font-semibold text-dark mt-1">
                        Request a consultation
                      </p>

                      <div className="mt-4 rounded-xl border border-gray-100 bg-light p-4">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/15 center-flex shrink-0">
                            <Icons.Hospital className="!w-5 !h-5 text-primary" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-black text-dark">
                              {selectedDoctor ? selectedDoctor.name : "No doctor selected"}
                            </p>
                            <p className="text-xs text-slate-600 mt-1">
                              {selectedDoctor
                                ? `${selectedDoctor.specialty} - Fee ${formatFee(selectedDoctor.fee, selectedDoctor.currency)}`
                                : "Choose a doctor from the list to start"}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 grid grid-cols-1 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Your name <span className="text-danger ml-1">*</span>
                          </label>
                          <input
                            value={patientName}
                            onChange={(e) => setPatientName(e.target.value)}
                            className="w-full rounded-sm border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm outline-none focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20"
                            placeholder="Full name"
                            autoComplete="name"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Phone number <span className="text-danger ml-1">*</span>
                          </label>
                          <input
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="w-full rounded-sm border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm outline-none focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20"
                            placeholder="01XXXXXXXXX"
                            autoComplete="tel"
                            inputMode="tel"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Symptoms (optional)
                          </label>
                          <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="w-full min-h-24 resize-none rounded-sm border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm outline-none focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20"
                            placeholder="Write a short note for the doctor"
                          />
                        </div>

                        <CustomButton
                          variant="primary"
                          size="md"
                          radius="xs"
                          fullWidth
                          disabled={!canSubmit}
                          onClick={submitBooking}
                          rightIcon={<Icons.ArrowForward className="!w-4 !h-4" />}
                        >
                          Request consultation
                        </CustomButton>

                        <div className="rounded-xl border border-gray-100 bg-white p-4 text-xs text-slate-600 leading-relaxed">
                          For emergencies, please go to the nearest hospital or call
                          emergency services immediately.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Appointment script modal */}
        {showScriptModal && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-2xl rounded-2xl bg-white border border-gray-100 shadow-2xl overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <p className="text-sm font-semibold text-dark">Appointment Confirmation</p>
                <button
                  type="button"
                  onClick={() => setShowScriptModal(false)}
                  className="h-9 w-9 rounded-lg hover:bg-gray-50"
                >
                  ×
                </button>
              </div>

              <div className="p-5">
                <pre className="whitespace-pre-wrap text-sm text-slate-700 bg-gray-50 p-4 rounded-md max-h-[360px] overflow-auto">
                  {appointmentScript}
                </pre>

                <div className="mt-4 flex items-center gap-2 justify-end">
                  <button
                    type="button"
                    onClick={copyScriptToClipboard}
                    className="h-10 px-4 rounded-lg border border-gray-200 bg-white text-sm font-semibold hover:bg-gray-50"
                  >
                    Copy
                  </button>
                  <button
                    type="button"
                    onClick={downloadScript}
                    className="h-10 px-4 rounded-lg border border-gray-200 bg-white text-sm font-semibold hover:bg-gray-50"
                  >
                    Download
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowScriptModal(false)}
                    className="h-10 px-4 rounded-lg bg-primary text-white text-sm font-semibold"
                  >
                    Done
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </MainContainer>
    </SectionContainer>
  );
}
