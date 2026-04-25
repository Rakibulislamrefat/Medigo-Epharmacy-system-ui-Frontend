import React from "react";

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────
interface FooterLink {
  label: string;
  href: string;
}

interface SocialLink {
  href: string;
  label: string;
  icon: React.ReactNode;
}

// ──────────────────────────────────────────────
// SVG Icons (no external icon lib required)
// ──────────────────────────────────────────────
const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const TwitterIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M4 4l16 16M4 20L20 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none"/>
    <path d="M2 3h6.5l13 18H15z"/>
    <path d="M2 21l7.5-7.5"/>
    <path d="M22 3l-7.5 7.5"/>
  </svg>
);

const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
    <circle cx="12" cy="12" r="4"/>
    <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor"/>
  </svg>
);

const LinkedInIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
    <rect x="2" y="9" width="4" height="12"/>
    <circle cx="4" cy="4" r="2"/>
  </svg>
);

const MapPinIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 mt-0.5 shrink-0">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
    <circle cx="12" cy="10" r="3"/>
  </svg>
);

const PhoneIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 mt-0.5 shrink-0">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.09 6.09l1.09-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
  </svg>
);

const MailIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 mt-0.5 shrink-0">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
    <polyline points="22,6 12,13 2,6"/>
  </svg>
);

const ChevronRightIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3">
    <polyline points="9 18 15 12 9 6"/>
  </svg>
);

const HeartIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 inline text-emerald-400">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
);

// ──────────────────────────────────────────────
// Data
// ──────────────────────────────────────────────
const customerLinks: FooterLink[] = [
  { label: "Request Order", href: "/order" },
  { label: "Upload Prescription", href: "/prescription/history" },
  { label: "Site Review", href: "/review" },
  { label: "Special Offers", href: "/special/offer" },
  { label: "How to Order", href: "/howToOrder" },
];

const supportLinks: FooterLink[] = [
  { label: "Career", href: "/career" },
  { label: "Contact Us", href: "/contact" },
  { label: "Return Policy", href: "/return" },
  { label: "Terms & Conditions", href: "/termsCondition" },
  { label: "Privacy Policy", href: "/privacy" },
];

const socialLinks: SocialLink[] = [
  { href: "https://www.facebook.com/rakibulislam.rifat.568", label: "Facebook", icon: <FacebookIcon /> },
  { href: "https://x.com/RIslam12699", label: "Twitter", icon: <TwitterIcon /> },
  { href: "https://www.instagram.com/rakibulislam_rifat/?hl=en", label: "Instagram", icon: <InstagramIcon /> },
  { href: "https://www.linkedin.com/in/rakibulislam12/", label: "LinkedIn", icon: <LinkedInIcon /> },
];

// ──────────────────────────────────────────────
// Sub-components
// ──────────────────────────────────────────────
const LinkList: React.FC<{ title: string; links: FooterLink[] }> = ({ title, links }) => (
  <div>
    <h3 className="text-white font-semibold text-sm uppercase tracking-[0.15em] mb-5 relative inline-block">
      {title}
      <span className="absolute -bottom-1.5 left-0 w-8 h-0.5 bg-emerald-400 rounded-full" />
    </h3>
    <ul className="space-y-3">
      {links.map((link) => (
        <li key={link.href}>
          <a
            href={link.href}
            className="group flex items-center gap-2 text-slate-400 hover:text-emerald-400 text-sm transition-all duration-200"
          >
            <span className="text-emerald-500/50 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all duration-200">
              <ChevronRightIcon />
            </span>
            <span className="group-hover:translate-x-0.5 transition-transform duration-200">
              {link.label}
            </span>
          </a>
        </li>
      ))}
    </ul>
  </div>
);

// ──────────────────────────────────────────────
// Main Footer Component
// ──────────────────────────────────────────────
const Footer: React.FC = () => {
  return (
    <footer className="relative bg-[#0a1628] text-white overflow-hidden">

      {/* ── Decorative background layers ── */}
      <div className="absolute inset-0 pointer-events-none select-none">
        {/* Radial glow — top-right */}
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-emerald-500/5 blur-3xl" />
        {/* Radial glow — bottom-left */}
        <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-teal-500/5 blur-3xl" />
        {/* Subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(#10b981 1px, transparent 1px), linear-gradient(90deg, #10b981 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      {/* ── Wave divider ── */}
      <div className="relative w-full overflow-hidden leading-none">
        <svg
          viewBox="0 0 1440 56"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full block"
          preserveAspectRatio="none"
        >
          <path
            d="M0 28C240 56 480 0 720 28C960 56 1200 0 1440 28V0H0V28Z"
            fill="#f8fafc"
            fillOpacity="0.04"
          />
        </svg>
      </div>

      {/* ── Main content ── */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-10 pt-8 pb-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">

          {/* ── Col 1: Brand ── */}
          <div className="sm:col-span-2 lg:col-span-1 flex flex-col gap-6">
            {/* Logo */}
            <a href="/" className="inline-flex items-center gap-3 group w-fit">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform duration-200">
                <svg
                  viewBox="0 0 44 44"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-6 h-6"
                  aria-hidden="true"
                >
                  <path
                    d="M12.5 12.5C12.5 10.567 14.067 9 16 9H28C29.933 9 31.5 10.567 31.5 12.5V31.5C31.5 33.433 29.933 35 28 35H16C14.067 35 12.5 33.433 12.5 31.5V12.5Z"
                    fill="white"
                    fillOpacity="0.16"
                  />
                  <path
                    d="M16.2 29V15H18.74L22 21.16L25.26 15H27.8V29H25.44V19.52L22.48 25.02H21.52L18.56 19.54V29H16.2Z"
                    fill="white"
                  />
                  <path
                    d="M9.5 22C9.5 14.82 14.82 9.5 22 9.5C29.18 9.5 34.5 14.82 34.5 22C34.5 29.18 29.18 34.5 22 34.5C14.82 34.5 9.5 29.18 9.5 22Z"
                    stroke="white"
                    strokeOpacity="0.22"
                  />
                </svg>
              </div>
              <div className="leading-tight">
                <div className="text-white font-bold text-base tracking-wide">Medigo</div>
                <div className="text-primary text-xs font-semibold tracking-[0.2em] uppercase">E‑Pharmacy</div>
              </div>
            </a>

            {/* Tagline */}
            <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
              Your trusted partner for quality healthcare. Delivering wellness to your doorstep since 2018.
            </p>

            {/* Contact Details */}
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3 text-slate-400">
                <MapPinIcon />
                <span>Medigo Center, Road Number 12 , Uttara Sector 10,Dhaka.</span>
              </div>
              <div className="flex items-start gap-3 text-slate-400">
                <PhoneIcon />
                <div className="flex flex-col gap-0.5">
                  <a href="tel:01568093262" className="hover:text-emerald-400 transition-colors duration-200">
                    01568093262
                  </a>
                  <a href="tel:01715618751" className="hover:text-emerald-400 transition-colors duration-200">
                    01715618751
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-3 text-slate-400">
                <MailIcon />
                <a href="mailto:medigo@gmail.com" className="hover:text-emerald-400 transition-colors duration-200 break-all">
                  medigo@gmail.com
                </a>
              </div>
            </div>
          </div>

          {/* ── Col 2: For Customer ── */}
          <div>
            <LinkList title="For Customer" links={customerLinks} />
          </div>

          {/* ── Col 3: Support ── */}
          <div>
            <LinkList title="Support" links={supportLinks} />
          </div>

          {/* ── Col 4: Social + Payment ── */}
          <div className="flex flex-col gap-8">

            {/* Social */}
            <div>
              <h3 className="text-white font-semibold text-sm uppercase tracking-[0.15em] mb-5 relative inline-block">
                Let's Socialize
                <span className="absolute -bottom-1.5 left-0 w-8 h-0.5 bg-emerald-400 rounded-full" />
              </h3>
              <div className="flex gap-3">
                {socialLinks.map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    aria-label={s.label}
                    target="_blank"
                    rel="noreferrer"
                    className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-500/40 hover:-translate-y-0.5 transition-all duration-200"
                  >
                    {s.icon}
                  </a>
                ))}
              </div>
            </div>

            {/* Payment Methods */}
            <div>
              <h3 className="text-white font-semibold text-sm uppercase tracking-[0.15em] mb-5 relative inline-block">
                Payment Methods
                <span className="absolute -bottom-1.5 left-0 w-8 h-0.5 bg-emerald-400 rounded-full" />
              </h3>
              <div className="flex flex-wrap gap-2">
                {/* Payment badges */}
                {["Visa", "Mastercard", "bKash", "Nagad", "SSLCOMMERZ"].map((method) => (
                  <span
                    key={method}
                    className="px-3 py-1.5 rounded-md bg-white/5 border border-white/10 text-slate-300 text-xs font-medium hover:border-emerald-500/40 hover:text-emerald-400 transition-all duration-200 cursor-default"
                  >
                    {method}
                  </span>
                ))}
              </div>
            </div>

            {/* Newsletter */}
            <div>
              <h3 className="text-white font-semibold text-sm uppercase tracking-[0.15em] mb-4 relative inline-block">
                Newsletter
                <span className="absolute -bottom-1.5 left-0 w-8 h-0.5 bg-emerald-400 rounded-full" />
              </h3>
              <form
                onSubmit={(e) => e.preventDefault()}
                className="flex gap-2"
              >
                <input
                  type="email"
                  placeholder="Your email"
                  className="flex-1 min-w-0 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/60 focus:bg-white/8 transition-all duration-200"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-semibold tracking-wide transition-all duration-200 hover:shadow-lg hover:shadow-emerald-500/25 shrink-0"
                >
                  Join
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* ── Divider ── */}
        <div className="mt-12 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        {/* ── Bottom bar ── */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <p>
            © {new Date().getFullYear()}&nbsp;
            <span className="text-slate-400 font-medium">Medigo Limited.</span>
            &nbsp;All rights reserved.
          </p>
          <p className="flex items-center gap-1.5">
            Made with <HeartIcon /> by{" "}
            <a
              href="http://iqrasys.com/"
              target="_blank"
              rel="noreferrer"
              className="text-slate-400 hover:text-emerald-400 transition-colors duration-200 font-medium"
            >
              Rakibul Islam Refat
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
