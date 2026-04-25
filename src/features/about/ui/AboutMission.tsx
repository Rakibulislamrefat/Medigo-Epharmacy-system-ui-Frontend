import { Icons } from "../../../shared/icons/Icons";
import MainContainer from "../../../shared/main-container/MainContainer";
import SectionContainer from "../../../shared/section-container/SectionContainer";
import SectionHeading from "../../../shared/section-heading/SectionHeading";

const AboutMission = () => (
  <div className="bg-white">
    <SectionContainer>
      <MainContainer>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">

          {/* Left — text */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-px w-10 bg-primary" />
              <span className="text-primary text-xxs font-bold tracking-[0.25em] uppercase">
                Who We Are
              </span>
            </div>
            <SectionHeading
              title="More Than a Pharmacy — A Promise"
              align="left"
              className="mb-4"
            />
            <p className="text-gray-500 text-sm leading-relaxed mb-4">
              Medigo E-Pharmacy was built on a simple but urgent truth — millions of people
              across Bangladesh struggle to access genuine medicines on time. Pharmacies
              are far. Counterfeits are common. Prescriptions go unfilled. We exist to
              fix that, one verified order at a time.
            </p>
            <p className="text-gray-500 text-sm leading-relaxed mb-7">
              With over 20,000 products, licensed pharmacist oversight, and a delivery
              network covering all 64 districts, we ensure that when someone needs
              medicine — it arrives fast, sealed, and genuine.
            </p>

            <div className="flex flex-col gap-3">
              {[
                "Genuine medicines sourced from licensed manufacturers only",
                "Every Rx order reviewed by a certified pharmacist before dispatch",
                "Express 4–6 hour delivery across Dhaka, nationwide within 2 days",
              ].map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-xs bg-primary/10 center-flex shrink-0 mt-0.5">
                    <Icons.Check className="text-primary" />
                  </div>
                  <span className="text-sm text-gray-600">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right — visual card stack */}
          <div className="relative h-72 sm:h-96">
            {/* Back card */}
            <div className="absolute top-4 left-4 right-0 bottom-0 bg-primary/10 rounded-xs" />
            {/* Front card */}
            <div className="absolute inset-0 right-4 bg-white rounded-xs shadow-xl p-6 sm:p-8
              border border-gray-100 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-12 h-12 rounded-xs bg-primary center-flex">
                    <Icons.Pill className="text-white" />
                  </div>
                  <div>
                    <p className="font-serif font-bold text-dark text-base">Our Mission</p>
                    <p className="text-xxs text-gray-400 uppercase tracking-widest">Medigo</p>
                  </div>
                </div>
                <p className="font-serif text-lg sm:text-xl text-dark leading-snug italic">
                  "To make genuine medicines accessible to every household in Bangladesh —
                  delivered fast, verified safe, and priced fairly."
                </p>
              </div>
              <div className="border-t border-gray-100 pt-4 flex items-center justify-between">
                <span className="text-xs text-gray-400">Founded 2018</span>
                <span className="text-xs font-bold text-primary uppercase tracking-widest">
                  50,000+ Customers
                </span>
              </div>
            </div>
          </div>

        </div>
      </MainContainer>
    </SectionContainer>
  </div>
);

export default AboutMission;