import MainContainer from "../../../shared/main-container/MainContainer";
import SectionContainer from "../../../shared/section-container/SectionContainer";
import SectionHeading from "../../../shared/section-heading/SectionHeading";
import { milestones } from "../service/aboutData";

const AboutTimeline = () => (
  <div className="bg-white">
    <SectionContainer>
      <MainContainer>
        <div className="text-center mb-10 sm:mb-14">
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="h-px w-10 bg-primary" />
            <span className="text-primary text-xxs font-bold tracking-[0.25em] uppercase">
              Our Journey
            </span>
            <div className="h-px w-10 bg-primary" />
          </div>
          <SectionHeading title="Milestones" align="center" />
        </div>

        <div className="max-w-2xl mx-auto relative pl-8 border-l-2 border-primary/20">
          {milestones.map((m, index) => (
            <div key={m.year} className="relative mb-6 last:mb-0">
              {/* Dot */}
              <div className={`absolute -left-10 top-9 w-3.5 h-3.5 rounded-full border-2 border-white
                shadow-md ${index === milestones.length - 1 ? "bg-primary" : "bg-primary/60"}`} />

              <div className="bg-white rounded-xs shadow-md hover:shadow-lg
                transition-shadow duration-300 p-4 sm:p-5">
                <span className="text-primary font-extrabold text-sm tracking-widest block mb-1">
                  {m.year}
                </span>
                <p className="text-secondary text-sm font-medium">{m.event}</p>
              </div>
            </div>
          ))}
        </div>
      </MainContainer>
    </SectionContainer>
  </div>
);
export default AboutTimeline;