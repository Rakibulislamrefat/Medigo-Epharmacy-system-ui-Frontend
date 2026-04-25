import MainContainer from "../../../shared/main-container/MainContainer";
import SectionContainer from "../../../shared/section-container/SectionContainer";
import SectionHeading from "../../../shared/section-heading/SectionHeading";

const stats = [
  { value: "50,000+", label: "Happy Customers", emoji: "😊" },
  { value: "20,000+", label: "Medicines Available", emoji: "💊" },
  { value: "4–6 hrs", label: "Average Delivery", emoji: "🚚" },
  { value: "98%", label: "Orders Fulfilled", emoji: "✅" },
];

const ImpactStats = () => {
  return (
    <div className="bg-primary">
      <SectionContainer>
        <MainContainer>
          {/* Heading — white on green */}
          <SectionHeading
            title="Numbers That Matter"
            description="Every number represents a customer served with care. Together, we're making healthcare more accessible across Bangladesh."
            align="center"
            className="mb-10 sm:mb-14 text-white [&_p]:text-primary-light"
          />

          {/* Stats grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {stats.map(({ value, label, emoji }) => (
              <div
                key={label}
                className="glass border border-white/20 rounded-xl p-5 sm:p-6 flex flex-col items-center text-center text-white hover:bg-white/20 transition-all duration-300"
              >
                <span className="text-3xl sm:text-4xl mb-3">{emoji}</span>
                <span className="font-serif text-2xl sm:text-3xl lg:text-4xl font-black mb-1">
                  {value}
                </span>
                <span className="text-primary-light text-xxs sm:text-xs font-semibold uppercase tracking-widest">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </MainContainer>
      </SectionContainer>
    </div>
  );
};

export default ImpactStats;