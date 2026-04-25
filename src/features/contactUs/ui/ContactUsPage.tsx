import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import CustomButton from "../../../shared/button/CustomButton";
import { Icons } from "../../../shared/icons/Icons";
import MainContainer from "../../../shared/main-container/MainContainer";
import SectionContainer from "../../../shared/section-container/SectionContainer";
import SectionHeading from "../../../shared/section-heading/SectionHeading";
import {
  contactChannels,
  officeLocations,
  type ContactChannel,
} from "../service/contactUsData";

type ContactFormValues = {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
};

type ContactFormErrors = Partial<Record<keyof ContactFormValues, string>>;

const inputClass = (hasError: boolean) =>
  [
    "w-full rounded-xs border px-3.5 py-2.5 text-sm outline-none transition",
    "bg-light text-dark border-gray-200",
    "focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20",
    hasError ? "border-danger bg-danger/5 focus:ring-danger/20" : "",
  ]
    .filter(Boolean)
    .join(" ");

const iconForChannel = (channel: ContactChannel) => {
  const map = {
    Phone: Icons.Phone,
    Email: Icons.Email,
    Location: Icons.LocationPin,
    Time: Icons.Time,
    HandShake: Icons.HandShake,
    Facebook: Icons.Facebook,
    Instagram: Icons.Instagram,
    Twitter: Icons.Twitter,
  } as const;

  return map[channel.icon];
};

export default function ContactUsPage() {
  const [values, setValues] = useState<ContactFormValues>({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [errors, setErrors] = useState<ContactFormErrors>({});
  const [loading, setLoading] = useState(false);

  const primaryOffice = useMemo(() => officeLocations[0], []);
  const directionsUrl = useMemo(() => {
    if (!primaryOffice) return "https://www.google.com/maps";
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      primaryOffice.mapQuery,
    )}`;
  }, [primaryOffice]);

  const validate = (): ContactFormErrors => {
    const e: ContactFormErrors = {};
    if (!values.name.trim()) e.name = "Name is required";
    if (!values.email.trim()) e.email = "Email is required";
    if (!values.subject.trim()) e.subject = "Subject is required";
    if (!values.message.trim()) e.message = "Message is required";
    return e;
  };

  const handleSubmit = async (): Promise<void> => {
    const e = validate();
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      await new Promise((r) => setTimeout(r, 650));
      toast.success("Thanks! We received your message.");
      setValues({ name: "", email: "", phone: "", subject: "", message: "" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SectionContainer>
      <MainContainer>
        <div className="relative overflow-hidden rounded-xl border border-gray-100 bg-white shadow-md">
          <div className="absolute -top-20 -right-24 w-80 h-80 rounded-full bg-primary/10 blur-[50px] pointer-events-none" />
          <div className="absolute -bottom-20 -left-24 w-72 h-72 rounded-full bg-secondary/15 blur-[50px] pointer-events-none" />

          <div className="relative p-6 sm:p-8 lg:p-10">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <SectionHeading
                title="Contact Us"
                description="Have a question about orders, delivery, or prescriptions? Reach out and our Medigo support team will respond quickly."
                align="left"
                className="max-w-2xl"
              />
              <a href={directionsUrl} target="_blank" rel="noreferrer">
                <CustomButton
                  variant="outline"
                  size="sm"
                  radius="xs"
                  rightIcon={<Icons.ArrowForward className="!w-4 !h-4" />}
                >
                  Get Directions
                </CustomButton>
              </a>
            </div>

            <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
                  {contactChannels.map((c) => {
                    const Icon = iconForChannel(c);
                    return (
                      <a
                        key={c.id}
                        href={c.href}
                        target={c.href.startsWith("http") ? "_blank" : undefined}
                        rel={c.href.startsWith("http") ? "noreferrer" : undefined}
                        className="group rounded-xs border border-gray-100 bg-light hover:bg-white shadow-sm hover:shadow-md transition-all p-4"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-xs bg-primary/10 border border-primary/15 center-flex shrink-0 group-hover:bg-primary/15 transition-colors">
                            <Icon className="!w-5 !h-5 text-primary" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-3">
                              <p className="text-sm font-black text-dark">
                                {c.title}
                              </p>
                              {c.badge && (
                                <span className="text-xxs font-black px-2.5 py-1 rounded-full bg-secondary/15 text-secondary border border-secondary/10">
                                  {c.badge}
                                </span>
                              )}
                            </div>
                            <p className="mt-1 text-sm text-slate-600 break-words">
                              {c.value}
                            </p>
                          </div>
                        </div>
                        <div className="mt-4 h-1 rounded-full bg-gradient-to-r from-primary/70 via-secondary/70 to-primary/70 opacity-70 group-hover:opacity-100 transition-opacity" />
                      </a>
                    );
                  })}
                </div>

                {primaryOffice && (
                  <div
                    id="hours"
                    className="mt-6 rounded-xs border border-gray-100 bg-white shadow-sm p-5"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xs bg-secondary/15 border border-secondary/15 center-flex shrink-0">
                        <Icons.LocationPin className="!w-5 !h-5 text-secondary" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-black text-dark">
                          {primaryOffice.name}
                        </p>
                        <p className="mt-1 text-sm text-slate-600">
                          {primaryOffice.address}
                        </p>
                        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="flex items-start gap-2.5 rounded-xs border border-gray-100 bg-light px-3 py-2">
                            <Icons.Phone className="!w-4 !h-4 text-primary mt-0.5" />
                            <div className="min-w-0">
                              <p className="text-xxs font-black tracking-wide text-slate-500">
                                PHONE
                              </p>
                              <p className="text-sm font-semibold text-dark truncate">
                                {primaryOffice.phone}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-start gap-2.5 rounded-xs border border-gray-100 bg-light px-3 py-2">
                            <Icons.Email className="!w-4 !h-4 text-primary mt-0.5" />
                            <div className="min-w-0">
                              <p className="text-xxs font-black tracking-wide text-slate-500">
                                EMAIL
                              </p>
                              <p className="text-sm font-semibold text-dark truncate">
                                {primaryOffice.email}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-start gap-2.5 rounded-xs border border-gray-100 bg-light px-3 py-2 sm:col-span-2">
                            <Icons.Time className="!w-4 !h-4 text-primary mt-0.5" />
                            <div className="min-w-0">
                              <p className="text-xxs font-black tracking-wide text-slate-500">
                                HOURS
                              </p>
                              <p className="text-sm font-semibold text-dark truncate">
                                {primaryOffice.hours}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="lg:col-span-7">
                <div className="rounded-xs border border-gray-100 bg-white shadow-sm p-6 sm:p-7">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-black text-dark">
                        Send us a message
                      </p>
                      <p className="mt-1 text-sm text-slate-600">
                        We usually reply within a few hours during support time.
                      </p>
                    </div>
                    <div className="w-10 h-10 rounded-xs bg-primary/10 border border-primary/15 center-flex shrink-0">
                      <Icons.HandShake className="!w-5 !h-5 text-primary" />
                    </div>
                  </div>

                  <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="name"
                        className="block text-sm font-medium text-slate-700 mb-1.5"
                      >
                        Full name <span className="text-danger">*</span>
                      </label>
                      <input
                        id="name"
                        value={values.name}
                        onChange={(e) => {
                          const v = e.target.value;
                          setValues((p) => ({ ...p, name: v }));
                          setErrors((p) => ({ ...p, name: "" }));
                        }}
                        className={inputClass(!!errors.name)}
                        placeholder="Your name"
                      />
                      {errors.name && (
                        <p className="text-xs text-danger mt-1 flex items-center gap-2">
                          <Icons.AlertCircle className="!w-4 !h-4" />
                          {errors.name}
                        </p>
                      )}
                    </div>
                    <div>
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium text-slate-700 mb-1.5"
                      >
                        Email <span className="text-danger">*</span>
                      </label>
                      <input
                        id="email"
                        value={values.email}
                        onChange={(e) => {
                          const v = e.target.value;
                          setValues((p) => ({ ...p, email: v }));
                          setErrors((p) => ({ ...p, email: "" }));
                        }}
                        className={inputClass(!!errors.email)}
                        placeholder="you@example.com"
                      />
                      {errors.email && (
                        <p className="text-xs text-danger mt-1 flex items-center gap-2">
                          <Icons.AlertCircle className="!w-4 !h-4" />
                          {errors.email}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="phone"
                        className="block text-sm font-medium text-slate-700 mb-1.5"
                      >
                        Phone (optional)
                      </label>
                      <input
                        id="phone"
                        value={values.phone}
                        onChange={(e) => {
                          const v = e.target.value;
                          setValues((p) => ({ ...p, phone: v }));
                        }}
                        className={inputClass(false)}
                        placeholder="+8801XXXXXXXXX"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="subject"
                        className="block text-sm font-medium text-slate-700 mb-1.5"
                      >
                        Subject <span className="text-danger">*</span>
                      </label>
                      <input
                        id="subject"
                        value={values.subject}
                        onChange={(e) => {
                          const v = e.target.value;
                          setValues((p) => ({ ...p, subject: v }));
                          setErrors((p) => ({ ...p, subject: "" }));
                        }}
                        className={inputClass(!!errors.subject)}
                        placeholder="Order / Delivery / Prescription"
                      />
                      {errors.subject && (
                        <p className="text-xs text-danger mt-1 flex items-center gap-2">
                          <Icons.AlertCircle className="!w-4 !h-4" />
                          {errors.subject}
                        </p>
                      )}
                    </div>

                    <div className="sm:col-span-2">
                      <label
                        htmlFor="message"
                        className="block text-sm font-medium text-slate-700 mb-1.5"
                      >
                        Message <span className="text-danger">*</span>
                      </label>
                      <textarea
                        id="message"
                        value={values.message}
                        onChange={(e) => {
                          const v = e.target.value;
                          setValues((p) => ({ ...p, message: v }));
                          setErrors((p) => ({ ...p, message: "" }));
                        }}
                        className={`${inputClass(!!errors.message)} min-h-[120px] resize-none`}
                        placeholder="Write your message..."
                      />
                      {errors.message && (
                        <p className="text-xs text-danger mt-1 flex items-center gap-2">
                          <Icons.AlertCircle className="!w-4 !h-4" />
                          {errors.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mt-6 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
                    <p className="text-xs text-slate-500">
                      By sending, you agree to be contacted by Medigo support.
                    </p>
                    <CustomButton
                      variant="primary"
                      size="md"
                      radius="xs"
                      loading={loading}
                      disabled={loading}
                      onClick={() => void handleSubmit()}
                      rightIcon={<Icons.ArrowForward className="!w-4 !h-4" />}
                    >
                      Send Message
                    </CustomButton>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <a
                    href="https://facebook.com"
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-xs border border-gray-100 bg-light hover:bg-white shadow-sm hover:shadow-md transition-all p-4 flex items-center gap-3"
                  >
                    <div className="w-10 h-10 rounded-xs bg-primary/10 border border-primary/15 center-flex">
                      <Icons.Facebook className="!w-5 !h-5 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-black text-dark">Facebook</p>
                      <p className="text-xs text-slate-600 truncate">
                        Follow updates
                      </p>
                    </div>
                  </a>
                  <a
                    href="https://instagram.com"
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-xs border border-gray-100 bg-light hover:bg-white shadow-sm hover:shadow-md transition-all p-4 flex items-center gap-3"
                  >
                    <div className="w-10 h-10 rounded-xs bg-secondary/15 border border-secondary/15 center-flex">
                      <Icons.Instagram className="!w-5 !h-5 text-secondary" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-black text-dark">Instagram</p>
                      <p className="text-xs text-slate-600 truncate">
                        Offers & stories
                      </p>
                    </div>
                  </a>
                  <a
                    href="https://twitter.com"
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-xs border border-gray-100 bg-light hover:bg-white shadow-sm hover:shadow-md transition-all p-4 flex items-center gap-3"
                  >
                    <div className="w-10 h-10 rounded-xs bg-primary/10 border border-primary/15 center-flex">
                      <Icons.Twitter className="!w-5 !h-5 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-black text-dark">X (Twitter)</p>
                      <p className="text-xs text-slate-600 truncate">
                        News & support
                      </p>
                    </div>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </MainContainer>
    </SectionContainer>
  );
}

