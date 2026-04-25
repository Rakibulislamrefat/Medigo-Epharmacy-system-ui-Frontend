import { Icons } from "../../../shared/icons/Icons";
import MainContainer from "../../../shared/main-container/MainContainer";
import SectionContainer from "../../../shared/section-container/SectionContainer";
import SectionHeading from "../../../shared/section-heading/SectionHeading";
import { faqs } from "../service/aboutData";

const AboutFAQ = () => (
  <div className="bg-white">
    <SectionContainer>
      <MainContainer>
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <div className="flex items-center justify-center gap-3 mb-3">
              <div className="h-px w-10 bg-primary" />
              <span className="text-primary text-xxs font-bold tracking-[0.25em] uppercase">
                Got Questions?
              </span>
              <div className="h-px w-10 bg-primary" />
            </div>
            <SectionHeading title="Frequently Asked Questions" align="center" />
          </div>

          <div className="space-y-3">
            {faqs.map(({ q, a }) => (
              <div key={q} className="bg-light rounded-xs shadow-sm p-5">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-xs center-flex shrink-0 mt-0.5">
                    <Icons.Blood className="text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-dark text-sm mb-1.5">{q}</p>
                    <p className="text-gray-500 text-xs leading-relaxed">{a}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </MainContainer>
    </SectionContainer>
  </div>
);

export default AboutFAQ;