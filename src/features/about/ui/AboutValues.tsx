import MainContainer from "../../../shared/main-container/MainContainer";
import SectionContainer from "../../../shared/section-container/SectionContainer";
import SectionHeading from "../../../shared/section-heading/SectionHeading";
import { values } from "../service/aboutData";

const AboutValues = () => (
  <div className="bg-light">
    <SectionContainer>
      <MainContainer>
        <div className="text-center mb-10 sm:mb-14">
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="h-px w-10 bg-primary" />
            <span className="text-primary text-xxs font-bold tracking-[0.25em] uppercase">
              What Drives Us
            </span>
            <div className="h-px w-10 bg-primary" />
          </div>
          <SectionHeading title="Our Core Values" align="center" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {values.map(({ icon: Icon, title, desc }, index) => (
            <div key={title}
              className="bg-white rounded-xs shadow-md p-5 sm:p-6 group
                hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
              {/* Watermark number */}
              <span className="absolute top-3 right-4 font-serif text-5xl font-black
                text-gray-50 select-none pointer-events-none leading-none">
                {String(index + 1).padStart(2, "0")}
              </span>

              <div className="w-12 h-12 rounded-xs bg-primary/10 center-flex mb-4
                group-hover:bg-primary transition-all duration-300">
                <Icon className="!w-5 !h-5 text-primary group-hover:text-white transition-colors duration-300" />
              </div>

              <div className="h-0.5 w-6 bg-primary/50 mb-3
                group-hover:w-10 group-hover:bg-primary transition-all duration-300" />

              <h3 className="font-serif font-bold text-dark text-sm sm:text-base mb-2">
                {title}
              </h3>
              <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </MainContainer>
    </SectionContainer>
  </div>
);

export default AboutValues;