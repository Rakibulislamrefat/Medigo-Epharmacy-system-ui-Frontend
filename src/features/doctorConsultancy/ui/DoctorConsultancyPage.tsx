import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import type { RootState } from "../../../redux/store";
import {
  createConsultancy,
  getPublicDoctors,
  sendConsultancyConfirmation,
  type ConsultancyMode,
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

const getDefaultMode = (doctor?: Doctor | null): ConsultancyMode => {
  if (doctor?.type === "In-person") return "in_person";
  return "video";
};

const normalizePhone = (value: string) => {
  const cleaned = value.trim().replace(/[\s-]/g, "");
  return cleaned.startsWith("01") ? `+88${cleaned}` : cleaned;
};

const splitUrls = (value: string) =>
  value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

const escapePdfText = (value: string) =>
  value
    .replace(/[^\x20-\x7E\n]/g, "")
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");

const wrapPdfLine = (line: string, maxLength = 82) => {
  const words = line.split(" ");
  const lines: string[] = [];
  let current = "";

  words.forEach((word) => {
    const next = current ? `${current} ${word}` : word;
    if (next.length <= maxLength) {
      current = next;
      return;
    }
    if (current) lines.push(current);
    current = word;
  });

  if (current) lines.push(current);
  return lines.length ? lines : [""];
};

const createPdfBlob = (text: string) => {
  const pageWidth = 595;
  const pageHeight = 842;
  const marginX = 48;
  const startY = 790;
  const linesPerPage = 45;
  const lines = text
    .split("\n")
    .flatMap((line) => wrapPdfLine(line))
    .map(escapePdfText);
  const pages = Array.from({ length: Math.max(1, Math.ceil(lines.length / linesPerPage)) }, (_, index) =>
    lines.slice(index * linesPerPage, (index + 1) * linesPerPage),
  );
  const objects: string[] = [];
  const pageObjectIds = pages.map((_, index) => 4 + index * 2);

  objects[0] = `1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n`;
  objects[1] = `2 0 obj\n<< /Type /Pages /Kids [${pageObjectIds
    .map((id) => `${id} 0 R`)
    .join(" ")}] /Count ${pages.length} >>\nendobj\n`;
  objects[2] = `3 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n`;

  pages.forEach((pageLines, pageIndex) => {
    const pageObjectId = pageObjectIds[pageIndex];
    const contentObjectId = pageObjectId + 1;
    const content = [
      "BT",
      "/F1 11 Tf",
      "14 TL",
      `${marginX} ${startY} Td`,
      ...pageLines.map((line, index) => `${index === 0 ? "" : "T* "}(${line}) Tj`),
      "ET",
    ].join("\n");

    objects[pageObjectId - 1] =
      `${pageObjectId} 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /Font << /F1 3 0 R >> >> /Contents ${contentObjectId} 0 R >>\nendobj\n`;
    objects[contentObjectId - 1] =
      `${contentObjectId} 0 obj\n<< /Length ${content.length} >>\nstream\n${content}\nendstream\nendobj\n`;
  });

  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  objects.forEach((object) => {
    offsets.push(pdf.length);
    pdf += object;
  });
  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.slice(1).forEach((offset) => {
    pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
  });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return new Blob([pdf], { type: "application/pdf" });
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
  const [contactEmail, setContactEmail] = useState("");
  const [mode, setMode] = useState<ConsultancyMode>("video");
  const [scheduledAt, setScheduledAt] = useState("");
  const [durationMinutes, setDurationMinutes] = useState("30");
  const [symptoms, setSymptoms] = useState("");
  const [notes, setNotes] = useState("");
  const [attachments, setAttachments] = useState("");

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
    Boolean(selectedDoctor) &&
    Boolean(patientName.trim()) &&
    Boolean(phone.trim()) &&
    Boolean(contactEmail.trim()) &&
    Boolean(scheduledAt);

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
    if (!contactEmail.trim()) {
      toast.error("Please enter your email");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail.trim())) {
      toast.error("Use a valid email address");
      return;
    }
    if (!scheduledAt) {
      toast.error("Please choose a schedule");
      return;
    }
    if (!durationMinutes || Number(durationMinutes) <= 0) {
      toast.error("Duration must be greater than 0");
      return;
    }
    const scheduleIso = new Date(scheduledAt).toISOString();
    const attachmentUrls = splitUrls(attachments);
    const payload = {
      userId: user?._id,
      doctorId: selectedDoctor.id,
      patientName: patientName.trim(),
      contactPhone: normalizePhone(phone),
      contactEmail: contactEmail.trim().toLowerCase(),
      mode,
      scheduledAt: scheduleIso,
      durationMinutes: Number(durationMinutes),
      symptoms: symptoms.trim(),
      notes: notes.trim(),
      attachments: attachmentUrls,
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
        phone: normalizePhone(phone),
        contactEmail: contactEmail.trim().toLowerCase(),
        mode,
        scheduledAt: scheduleIso,
        durationMinutes: Number(durationMinutes),
        symptoms: symptoms.trim(),
        notes: notes.trim(),
        attachments: attachmentUrls,
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
    setContactEmail("");
    setMode("video");
    setScheduledAt("");
    setDurationMinutes("30");
    setSymptoms("");
    setNotes("");
    setAttachments("");
  };

  // Appointment script state
  const [appointmentScript, setAppointmentScript] = useState<string>("");
  const [showScriptModal, setShowScriptModal] = useState(false);

  const generateAppointmentScript = ({
    doctor,
    patientName,
    phone,
    contactEmail,
    mode,
    scheduledAt,
    durationMinutes,
    symptoms,
    notes,
    attachments,
  }: {
    doctor: Doctor | null;
    patientName: string;
    phone: string;
    contactEmail: string;
    mode: ConsultancyMode;
    scheduledAt: string;
    durationMinutes: number;
    symptoms: string;
    notes: string;
    attachments: string[];
  }) => {
    const id = `MDG-APPT-${Date.now().toString().slice(-6)}`;
    const scheduleDate = new Date(scheduledAt);
    const when = Number.isNaN(scheduleDate.getTime())
      ? "To be scheduled"
      : scheduleDate.toLocaleString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "numeric",
          minute: "2-digit",
        });
    const fee = doctor ? formatFee(doctor.fee, doctor.currency) : "N/A";
    const summary = `Appointment Confirmation\n-------------------------\nAppointment ID: ${id}\nDoctor: ${doctor?.name ?? "-"} (${doctor?.specialty ?? "-"})\nMode: ${mode}\nWhen: ${when}\nDuration: ${durationMinutes} minutes\nFee: ${fee}\n\nPatient Name: ${patientName}\nContact: ${phone}\nEmail: ${contactEmail}\nSymptoms: ${symptoms || "-"}\nNotes: ${notes || "-"}\nAttachments: ${attachments.length ? attachments.join(", ") : "-"}\n\nPlease keep this confirmation for your records. Medigo e-Pharmacy will contact you to confirm the exact slot.`;
    return summary;
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
      const blob = createPdfBlob(appointmentScript);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "medigo-appointment.pdf";
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
                                setMode(getDefaultMode(d));
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
                            Email <span className="text-danger ml-1">*</span>
                          </label>
                          <input
                            value={contactEmail}
                            onChange={(e) => setContactEmail(e.target.value)}
                            className="w-full rounded-sm border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm outline-none focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20"
                            placeholder="rakib@example.com"
                            autoComplete="email"
                            type="email"
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                              Mode <span className="text-danger ml-1">*</span>
                            </label>
                            <select
                              value={mode}
                              onChange={(e) => setMode(e.target.value as ConsultancyMode)}
                              className="w-full rounded-sm border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm outline-none focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20"
                            >
                              <option value="video">Video</option>
                              <option value="audio">Audio</option>
                              <option value="chat">Chat</option>
                              <option value="in_person">In person</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                              Duration
                            </label>
                            <select
                              value={durationMinutes}
                              onChange={(e) => setDurationMinutes(e.target.value)}
                              className="w-full rounded-sm border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm outline-none focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20"
                            >
                              <option value="15">15 minutes</option>
                              <option value="30">30 minutes</option>
                              <option value="45">45 minutes</option>
                              <option value="60">60 minutes</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Schedule <span className="text-danger ml-1">*</span>
                          </label>
                          <input
                            value={scheduledAt}
                            onChange={(e) => setScheduledAt(e.target.value)}
                            className="w-full rounded-sm border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm outline-none focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20"
                            type="datetime-local"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Symptoms
                          </label>
                          <textarea
                            value={symptoms}
                            onChange={(e) => setSymptoms(e.target.value)}
                            className="w-full min-h-24 resize-none rounded-sm border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm outline-none focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20"
                            placeholder="Fever, headache, and body pain for 2 days"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Notes (optional)
                          </label>
                          <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="w-full min-h-20 resize-none rounded-sm border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm outline-none focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20"
                            placeholder="Patient prefers morning appointment"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Attachment URLs (optional)
                          </label>
                          <textarea
                            value={attachments}
                            onChange={(e) => setAttachments(e.target.value)}
                            className="w-full min-h-20 resize-none rounded-sm border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm outline-none focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20"
                            placeholder="https://example.com/uploads/report-1.pdf"
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
