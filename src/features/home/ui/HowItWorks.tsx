import { Icons } from "../../../shared/icons/Icons";
import MainContainer from "../../../shared/main-container/MainContainer";
import SectionContainer from "../../../shared/section-container/SectionContainer";
import SectionHeading from "../../../shared/section-heading/SectionHeading";

const steps = [
  {
    number: "01",
    icon: Icons.Search,
    title: "Search Medicine",
    description:
      "Enter the medicine name or category to instantly find verified products near you.",
  },
  {
    number: "02",
    icon: Icons.Prescription,
    title: "Upload Prescription",
    description:
      "Upload your doctor's prescription securely — our pharmacists review it in minutes.",
  },
  {
    number: "03",
    icon: Icons.Cart,
    title: "Place Your Order",
    description:
      "Add items to your cart and checkout easily with multiple payment options.",
  },
  {
    number: "04",
    icon: Icons.Delivery,
    title: "Fast Delivery",
    description:
      "Get your medicines delivered to your doorstep within 4–6 hours. Safe and sealed.",
  },
];

const HowItWorks = () => {
  return (
    <SectionContainer>
      <MainContainer>
        {/* Heading */}
        <SectionHeading
          title="How It Works"
          description="Order your medicines in just a few simple steps. Fast, verified, and delivered to your door."
          align="left"
          className="mb-10 sm:mb-14"
        />

        {/* Steps */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {steps.map((step, index) => (
            <div
              key={step.number}
              className="relative flex flex-col items-center text-center group"
            >
              {/* Connector line — desktop only */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-10 left-[calc(50%+52px)] w-[calc(100%-104px)] h-px bg-primary/20 z-0" />
              )}

              {/* Icon circle */}
              <div
                className="relative z-10 w-15 h-15 sm:w-17 sm:h-17 md:w-20 md:h-20 rounded-full bg-primary/10 border-2 border-primary/20
                  group-hover:bg-primary group-hover:border-primary transition-all duration-300
                  center-flex mb-4 shadow-sm"
              >
                <span className="text-primary group-hover:text-white group-hover:scale-110 transition-all duration-300">
                  <step.icon />
                </span>
              </div>

              {/* Step label */}
              <span className="text-xxs font-black tracking-widest text-primary uppercase mb-1">
                Step {step.number}
              </span>

              <h3 className="font-serif text-base font-bold text-dark mb-2">
                {step.title}
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </MainContainer>
    </SectionContainer>
  );
};

export default HowItWorks;