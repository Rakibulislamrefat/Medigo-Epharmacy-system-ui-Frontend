import { Icons } from "../../../shared/icons/Icons";
import MainContainer from "../../../shared/main-container/MainContainer";
import SectionContainer from "../../../shared/section-container/SectionContainer";
import SectionHeading from "../../../shared/section-heading/SectionHeading";

const AboutQualitySystem = () => (
  <div className="bg-[#0f2e29] relative overflow-hidden">
    <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full border border-white/5 pointer-events-none" />
    <div className="absolute -bottom-10 -left-10 w-56 h-56 rounded-full border border-white/5 pointer-events-none" />

    <SectionContainer>
      <MainContainer>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">

          {/* Left — checks list */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-px w-10 bg-primary" />
              <span className="text-primary text-xxs font-bold tracking-[0.25em] uppercase">
                Our Quality Standard
              </span>
            </div>
            <SectionHeading
              title="Medicine Quality & Safety Assurance System"
              align="left"
              className="text-white mb-5"
            />
            <p className="text-white/60 text-sm leading-relaxed mb-7">
              Before any medicine reaches your doorstep, it passes through our
              5-step quality assurance process — ensuring every product is genuine,
              safe, and dispensed correctly.
            </p>

            <div className="space-y-3">
              {[
                {
                  label: "Licensed Source Verification",
                  desc: "All products are sourced exclusively from government-licensed manufacturers and distributors.",
                },
                {
                  label: "Pharmacist Review",
                  desc: "Every prescription order is reviewed and approved by a licensed pharmacist before dispatch.",
                },
                {
                  label: "Batch & Expiry Check",
                  desc: "Each batch is inspected for expiry date, seal integrity, and storage compliance.",
                },
                {
                  label: "Cold Chain Compliance",
                  desc: "Temperature-sensitive medicines are stored and transported under monitored cold-chain conditions.",
                },
                {
                  label: "Tamper-Proof Packaging",
                  desc: "Orders are sealed and packed to prevent tampering or contamination during delivery.",
                },
              ].map(({ label, desc }) => (
                <div
                  key={label}
                  className="flex items-start gap-3 rounded-xs px-4 py-3
                    hover:bg-white/10 transition-colors duration-200"
                >
                  <div className="w-7 h-7 rounded-xs center-flex shrink-0 mt-0.5">
                    <Icons.Check className="text-primary" />
                  </div>
                  <div>
                    <p className="text-white text-sm font-semibold leading-tight">{label}</p>
                    <p className="text-white/50 text-xs mt-0.5">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — quality badge visual */}
          <div className="center-flex">
            <div className="bg-white/5 rounded-xs p-8 sm:p-10 text-center border border-white/10 w-full max-w-xs">
              <div className="w-20 h-20 rounded-full bg-primary center-flex mx-auto mb-5 shadow-xl">
                <Icons.Shield className="text-white" />
              </div>
              <p className="font-serif text-white text-xl font-bold mb-1">Quality Assured</p>
              <p className="text-white/50 text-xs mb-6">5-step safety verification</p>
              <div className="space-y-2">
                {[
                  "Licensed Source",
                  "Pharmacist Review",
                  "Batch & Expiry",
                  "Cold Chain",
                  "Sealed Packaging",
                ].map((item) => (
                  <div
                    key={item}
                    className="bg-white/10 rounded-xs py-2 px-4 text-white text-xs font-semibold
                      flex items-center justify-between"
                  >
                    <span>{item}</span>
                    <Icons.Check className="text-green-400" />
                  </div>
                ))}
              </div>
              <div className="mt-5 pt-4 border-t border-white/10">
                <span className="text-primary text-xs font-bold tracking-widest uppercase">
                  Pharmacy Certified
                </span>
              </div>
            </div>
          </div>

        </div>
      </MainContainer>
    </SectionContainer>
  </div>
);

export default AboutQualitySystem;