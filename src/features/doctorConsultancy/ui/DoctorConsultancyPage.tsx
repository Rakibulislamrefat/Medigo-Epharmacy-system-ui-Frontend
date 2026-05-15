import { useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
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
  languages: string[];
  nextAvailable: string;
  location: string;
  type: "Online" | "In‑person" | "Both";
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

const doctorsSeed: Doctor[] = [
  {
    id: "d1",
    name: "Dr. Farhana Islam",
    title: "MBBS, FCPS (Medicine)",
    specialty: "General Physician",
    experienceYears: 10,
    rating: 4.8,
    reviews: 1240,
    fee: 600,
    languages: ["Bangla", "English"],
    nextAvailable: "Today, 6:30 PM",
    location: "Dhaka",
    type: "Online",
  },
  {
    id: "d2",
    name: "Dr. Mahmud Hasan",
    title: "MBBS, MS (Ortho)",
    specialty: "Orthopedics",
    experienceYears: 12,
    rating: 4.7,
    reviews: 890,
    fee: 800,
    languages: ["Bangla", "English"],
    nextAvailable: "Tomorrow, 10:00 AM",
    location: "Dhaka",
    type: "Both",
  },
  {
    id: "d3",
    name: "Dr. Nusrat Jahan",
    title: "MBBS, FCPS (Dermatology)",
    specialty: "Dermatology",
    experienceYears: 8,
    rating: 4.9,
    reviews: 640,
    fee: 900,
    languages: ["Bangla", "English"],
    nextAvailable: "Today, 9:00 PM",
    location: "Chattogram",
    type: "Online",
  },
  {
    id: "d4",
    name: "Dr. Saiful Karim",
    title: "MBBS, DCH (Pediatrics)",
    specialty: "Pediatrics",
    experienceYears: 9,
    rating: 4.6,
    reviews: 520,
    fee: 700,
    languages: ["Bangla", "English"],
    nextAvailable: "Sun, 4:00 PM",
    location: "Sylhet",
    type: "Both",
  },
  {
    id: "d5",
    name: "Dr. Tania Rahman",
    title: "MBBS, FCPS (Gynae)",
    specialty: "Gynecology",
    experienceYears: 11,
    rating: 4.8,
    reviews: 780,
    fee: 1000,
    languages: ["Bangla", "English"],
    nextAvailable: "Mon, 7:00 PM",
    location: "Dhaka",
    type: "In‑person",
  },
  {
    id: "d6",
    name: "Dr. Arif Chowdhury",
    title: "MBBS, MD (Cardiology)",
    specialty: "Cardiology",
    experienceYears: 13,
    rating: 4.7,
    reviews: 410,
    fee: 1200,
    languages: ["Bangla", "English"],
    nextAvailable: "Tue, 11:30 AM",
    location: "Dhaka",
    type: "Both",
  },
];

const formatFee = (fee: number) => `৳${fee}`;

export default function DoctorConsultancyPage() {
  const bookingRef = useRef<HTMLDivElement | null>(null);
  const [query, setQuery] = useState("");
  const [specialty, setSpecialty] = useState<string>("All specialties");
  const [onlyOnline, setOnlyOnline] = useState(false);

  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [patientName, setPatientName] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.location.hash !== "#book-now") return;
    bookingRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const filteredDoctors = useMemo(() => {
    const q = query.trim().toLowerCase();
    return doctorsSeed.filter((d) => {
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
  }, [onlyOnline, query, specialty]);

  const canSubmit =
    Boolean(selectedDoctor) && Boolean(patientName.trim()) && Boolean(phone.trim());

  const submitBooking = () => {
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
    toast.success(
      `Request received! We'll contact you to confirm ${selectedDoctor.name}'s slot.`,
    );
    setSelectedDoctor(null);
    setPatientName("");
    setPhone("");
    setNotes("");
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

                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {filteredDoctors.map((d) => (
                        <div
                          key={d.id}
                          className="group rounded-2xl border border-gray-100 bg-light p-5 hover:bg-white hover:shadow-md transition"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/15 center-flex shrink-0">
                                <Icons.User className="!w-6 !h-6 text-primary" />
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
                            <span className="text-slate-400">•</span>
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
                            <div className="flex items-center gap-2">
                              <Icons.Star className="!w-4 !h-4 text-secondary" />
                              <span>
                                {d.rating.toFixed(1)} ({d.reviews})
                              </span>
                            </div>
                          </div>

                          <div className="mt-4 flex items-center justify-between gap-3">
                            <div>
                              <p className="text-xs text-slate-500">Fee</p>
                              <p className="text-sm font-black text-dark">
                                {formatFee(d.fee)}
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

                    {filteredDoctors.length === 0 && (
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
                                ? `${selectedDoctor.specialty} • Fee ${formatFee(selectedDoctor.fee)}`
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
      </MainContainer>
    </SectionContainer>
  );
}
