import { useMemo, useState } from "react";
import CustomButton from "../../../shared/button/CustomButton";
import { Icons } from "../../../shared/icons/Icons";
import MainContainer from "../../../shared/main-container/MainContainer";
import SectionContainer from "../../../shared/section-container/SectionContainer";
import SectionHeading, { SectionParagraph } from "../../../shared/section-heading/SectionHeading";

const sections = [
  {
    key: "orders",
    title: "Orders & confirmation",
    description:
      "Order requests are confirmed by phone/SMS based on stock availability. Prices may vary based on batch and supplier.",
    Icon: Icons.Cart,
  },
  {
    key: "prescriptions",
    title: "Prescription compliance",
    description:
      "Prescription medicines require a valid prescription. We may refuse or adjust an order to comply with regulations and safety.",
    Icon: Icons.Prescription,
  },
  {
    key: "delivery",
    title: "Delivery & timing",
    description:
      "Delivery timelines depend on location, order volume, and verification needs. We’ll communicate ETA after confirmation.",
    Icon: Icons.Delivery,
  },
  {
    key: "privacy",
    title: "Data & privacy",
    description:
      "We use your data only to process and deliver orders and improve service. For details, review the Privacy Policy.",
    Icon: Icons.Shield,
  },
];

export default function TermsConditionPage() {
  const [active, setActive] = useState(sections[0]?.key ?? "orders");

  const activeSection = useMemo(
    () => sections.find((s) => s.key === active) ?? sections[0],
    [active],
  );

  return (
    <SectionContainer>
      <MainContainer>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-5">
            <SectionHeading
              title="Terms & Conditions"
              description="These terms explain how Medigo e‑Pharmacy services work and what you can expect from us."
              align="left"
            />
            <SectionParagraph className="mt-3">
              We keep things simple and safety-first. For prescription medicines,
              compliance and verification are required before dispatch.
            </SectionParagraph>

            <div className="mt-6 rounded-2xl bg-gradient-to-br from-primary via-primary to-secondary text-white p-6 shadow-lg shadow-primary/10 relative overflow-hidden">
              <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-white/10 blur-[30px]" />
              <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-white/10 blur-[40px]" />
              <div className="relative">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-white/15 flex items-center justify-center border border-white/10">
                    <Icons.Check className="!w-6 !h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white/90">
                      Quick summary
                    </p>
                    <p className="text-xs text-white/70">
                      Confirmation before dispatch
                    </p>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-1 gap-3">
                  {[
                    { text: "Orders are confirmed before delivery.", Icon: Icons.Phone },
                    { text: "Prescription items require verification.", Icon: Icons.Prescription },
                    { text: "Delivery times depend on location and workload.", Icon: Icons.Delivery },
                  ].map(({ text, Icon }) => (
                    <div
                      key={text}
                      className="rounded-xl bg-white/10 border border-white/10 p-4 flex items-start gap-3"
                    >
                      <div className="w-9 h-9 rounded-lg bg-white/15 center-flex shrink-0">
                        <Icon className="!w-5 !h-5 text-white" />
                      </div>
                      <p className="text-xs text-white/80 leading-relaxed">{text}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-6 flex flex-col sm:flex-row gap-2.5">
                  <a href="/privacy" className="sm:flex-1">
                    <CustomButton
                      variant="secondary"
                      size="md"
                      radius="xs"
                      fullWidth
                      rightIcon={<Icons.ArrowForward className="!w-4 !h-4" />}
                    >
                      Privacy Policy
                    </CustomButton>
                  </a>
                  <a href="/contact" className="sm:flex-1">
                    <CustomButton
                      variant="outline"
                      size="md"
                      radius="xs"
                      fullWidth
                      leftIcon={<Icons.Mail className="!w-4 !h-4" />}
                    >
                      Contact Us
                    </CustomButton>
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="rounded-2xl bg-gradient-to-r from-primary/25 via-secondary/20 to-primary/25 p-[1px] shadow-lg shadow-primary/5">
              <div className="bg-white border border-gray-100 rounded-2xl p-6 sm:p-7">
                <div className="flex flex-wrap items-center gap-2">
                  {sections.map(({ key, title }) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setActive(key)}
                      className={[
                        "px-4 py-2 rounded-full text-xs font-black border transition",
                        active === key
                          ? "bg-primary text-white border-primary"
                          : "bg-white text-slate-700 border-gray-200 hover:border-primary hover:text-primary",
                      ].join(" ")}
                    >
                      {title}
                    </button>
                  ))}
                </div>

                <div className="mt-6 rounded-2xl border border-gray-100 bg-light p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/15 center-flex shrink-0">
                      {activeSection?.Icon ? (
                        <activeSection.Icon className="!w-6 !h-6 text-primary" />
                      ) : (
                        <Icons.Check className="!w-6 !h-6 text-primary" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-lg font-black text-dark">
                        {activeSection?.title}
                      </p>
                      <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                        {activeSection?.description}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 rounded-xl border border-gray-100 bg-white p-5">
                  <div className="flex items-start gap-3">
                    <Icons.AlertCircle className="!w-5 !h-5 text-primary mt-0.5" />
                    <div>
                      <p className="text-sm font-black text-dark">
                        Important note
                      </p>
                      <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                        This page is a summary. For specific cases, contact our
                        support team for guidance.
                      </p>
                      <div className="mt-4">
                        <a href="/contact">
                          <CustomButton variant="outline" size="sm" radius="xs">
                            Contact Support
                          </CustomButton>
                        </a>
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

