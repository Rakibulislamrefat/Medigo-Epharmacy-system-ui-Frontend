import MainContainer from "../../../shared/main-container/MainContainer";
import { stats } from "../service/aboutData";

const AboutStats = () => (
  <div className="-mt-8 relative z-10 mb-0">
    <MainContainer>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map(({ value, label, icon: Icon }) => (
          <div key={label}
            className="bg-white rounded-xs shadow-md p-4 sm:p-5 hover:-translate-y-1 hover:shadow-xl
              transition-all duration-300 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xs bg-primary/10 center-flex shrink-0">
              <Icon className="text-primary" />
            </div>
            <div>
              <p className="font-serif font-black text-dark text-lg sm:text-xl leading-none">{value}</p>
              <p className="text-xxs text-gray-400 uppercase tracking-widest mt-0.5">{label}</p>
            </div>
          </div>
        ))}
      </div>
    </MainContainer>
  </div>
);

export default AboutStats;