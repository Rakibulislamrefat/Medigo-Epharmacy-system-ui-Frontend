import MainContainer from "../../../shared/main-container/MainContainer";
import SectionContainer from "../../../shared/section-container/SectionContainer";
import SectionHeading from "../../../shared/section-heading/SectionHeading";
import { team } from "../service/aboutData";

const AboutTeam = () => (
  <div className="bg-light">
    <SectionContainer>
      <MainContainer>
        <div className="text-center mb-10 sm:mb-14">
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="h-px w-10 bg-primary" />
            <span className="text-primary text-xxs font-bold tracking-[0.25em] uppercase">
              The People
            </span>
            <div className="h-px w-10 bg-primary" />
          </div>
          <SectionHeading
            title="Meet Our Team"
            description="Passionate individuals dedicated to making blood donation accessible to all."
            align="center"
          />
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {team.map((member) => (
            <div key={member.name} className="group bg-white rounded-xs shadow-md p-5 sm:p-6
              hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-center">

              {/* Avatar */}
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-primary/10 border-2 border-red-100
                center-flex mx-auto mb-4 font-black text-primary text-xl sm:text-2xl
                group-hover:bg-primary group-hover:text-white group-hover:border-primary
                transition-all duration-300">
                {member.avatar}
              </div>

              <h3 className="font-serif font-semibold text-dark text-sm sm:text-base leading-tight">
                {member.name}
              </h3>
              <p className="text-primary text-xxs font-bold tracking-widest uppercase mt-1 mb-3">
                {member.role}
              </p>
              <p className="text-gray-400 text-xs italic leading-relaxed">
                "{member.quote}"
              </p>
            </div>
          ))}
        </div>
      </MainContainer>
    </SectionContainer>
  </div>
);


export default AboutTeam;