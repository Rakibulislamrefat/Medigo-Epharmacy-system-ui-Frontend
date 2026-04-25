import SectionContainer from "../../../shared/section-container/SectionContainer";
import MainContainer from "../../../shared/main-container/MainContainer";
import SectionHeading from "../../../shared/section-heading/SectionHeading";
import { SectionParagraph } from "../../../shared/section-heading/SectionHeading";
import CustomButton from "../../../shared/button/CustomButton";
import { Icons } from "../../../shared/icons/Icons";
import { NavLink } from "react-router-dom";

type Opening = {
  title: string;
  location: string;
  type: string;
  level: string;
};

const openings: Opening[] = [
  { title: "Pharmacist", location: "Dhaka", type: "On‑site", level: "Full‑time" },
  { title: "Customer Support", location: "Dhaka", type: "Hybrid", level: "Full‑time" },
  { title: "Delivery Rider", location: "Dhaka", type: "On‑site", level: "Contract" },
  { title: "Content & Catalog", location: "Remote", type: "Remote", level: "Part‑time" },
];

const perks = [
  {
    title: "Patient-first culture",
    description:
      "We build safety-first workflows for medicine ordering and prescription handling.",
    Icon: Icons.Heartbeat,
  },
  {
    title: "Growth & learning",
    description:
      "Learn pharmacy ops, customer experience, and product execution with a strong team.",
    Icon: Icons.Star,
  },
  {
    title: "Reliable operations",
    description:
      "Clear processes and quick communication to keep deliveries and support running smoothly.",
    Icon: Icons.Check,
  },
  {
    title: "Impact at scale",
    description:
      "Help people access authentic medicines faster across Bangladesh through Medigo e‑Pharmacy.",
    Icon: Icons.Shield,
  },
];

export default function CareerPage() {
  const email = "medigo@gmail.com";
  const mailto = `mailto:${email}?subject=${encodeURIComponent("Career at Medigo e‑Pharmacy")}`;

  return (
    <SectionContainer>
      <MainContainer>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-5">
            <SectionHeading
              title="Career"
              description="Join Medigo e‑Pharmacy and help people get authentic medicines with a smooth ordering experience."
              align="left"
            />
            <SectionParagraph className="mt-3">
              Send your CV and a short introduction. Mention the role you want
              and your location preference.
            </SectionParagraph>

            <div className="mt-6 rounded-2xl bg-gradient-to-br from-primary via-primary to-secondary text-white p-6 shadow-lg shadow-primary/10 relative overflow-hidden">
              <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-white/10 blur-[30px]" />
              <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-white/10 blur-[40px]" />

              <div className="relative">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-white/15 flex items-center justify-center border border-white/10">
                    <Icons.HandShake className="!w-6 !h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white/90">
                      Medigo e‑Pharmacy
                    </p>
                    <p className="text-xs text-white/70">
                      We’re hiring for operations and support
                    </p>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-1 gap-3">
                  {(["Send CV", "Quick screening", "Interview", "Offer"] as const).map(
                    (step, idx) => (
                      <div
                        key={step}
                        className="flex items-start gap-3 rounded-xl bg-white/10 border border-white/10 p-4"
                      >
                        <div className="w-8 h-8 rounded-lg bg-white/15 center-flex border border-white/10 text-sm font-black">
                          {idx + 1}
                        </div>
                        <div>
                          <p className="text-sm font-bold">{step}</p>
                          <p className="text-xs text-white/70 mt-1">
                            Transparent steps with quick updates.
                          </p>
                        </div>
                      </div>
                    ),
                  )}
                </div>

                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <a href={mailto} className="w-full">
                    <CustomButton
                      variant="secondary"
                      size="md"
                      radius="xs"
                      fullWidth
                      leftIcon={<Icons.Email className="!w-4 !h-4" />}
                    >
                      Email CV
                    </CustomButton>
                  </a>
                  <NavLink to="/contact-us" className="w-full">
                    <CustomButton
                      variant="outline"
                      size="md"
                      radius="xs"
                      fullWidth
                      rightIcon={<Icons.ArrowForward className="!w-4 !h-4" />}
                    >
                      Contact Us
                    </CustomButton>
                  </NavLink>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="rounded-2xl bg-gradient-to-r from-primary/25 via-secondary/20 to-primary/25 p-[1px] shadow-lg shadow-primary/5">
              <div className="bg-white border border-gray-100 rounded-2xl p-6 sm:p-7">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-black tracking-[0.2em] uppercase text-primary">
                      Open Roles
                    </p>
                    <p className="text-sm font-semibold text-dark mt-1">
                      Current openings
                    </p>
                  </div>
                  <span className="text-xxs font-black bg-primary/10 text-primary px-3 py-1 rounded-full">
                    {openings.length} roles
                  </span>
                </div>

                <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {openings.map((role) => (
                    <div
                      key={role.title}
                      className="rounded-2xl border border-gray-100 bg-light p-5 hover:bg-white hover:shadow-md transition"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-base font-black text-dark truncate">
                            {role.title}
                          </p>
                          <p className="text-sm text-slate-600 mt-1">
                            {role.location} • {role.type}
                          </p>
                        </div>
                        <span className="shrink-0 text-xxs font-black bg-secondary/15 text-secondary px-3 py-1 rounded-full">
                          {role.level}
                        </span>
                      </div>

                      <div className="mt-4 flex flex-col sm:flex-row gap-2">
                        <a href={mailto} className="sm:flex-1">
                          <CustomButton
                            variant="primary"
                            size="sm"
                            radius="xs"
                            fullWidth
                            rightIcon={<Icons.ArrowForward className="!w-4 !h-4" />}
                          >
                            Apply
                          </CustomButton>
                        </a>
                        <NavLink to="/contact-us" className="sm:flex-1">
                          <CustomButton
                            variant="outline"
                            size="sm"
                            radius="xs"
                            fullWidth
                          >
                            Ask
                          </CustomButton>
                        </NavLink>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {perks.map(({ title, description, Icon }) => (
                    <div
                      key={title}
                      className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/15 center-flex shrink-0">
                          <Icon className="!w-5 !h-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-black text-dark">{title}</p>
                          <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                            {description}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </MainContainer>
    </SectionContainer>
  );
}
