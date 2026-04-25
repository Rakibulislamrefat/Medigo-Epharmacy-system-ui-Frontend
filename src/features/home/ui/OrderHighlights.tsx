import type { ReactNode } from "react";
import CustomButton from "../../../shared/button/CustomButton";
import { Icons } from "../../../shared/icons/Icons";
import MainContainer from "../../../shared/main-container/MainContainer";
import SectionContainer from "../../../shared/section-container/SectionContainer";

type HighlightCardProps = {
  title: string;
  description: string;
  gradientClassName: string;
  icon: ReactNode;
};

const HighlightCard = ({
  title,
  description,
  gradientClassName,
  icon,
}: HighlightCardProps) => {
  return (
    <div
      className={[
        "flex items-center justify-between gap-4 rounded-xs border border-gray-100 px-5 py-4",
        "min-h-[104px]",
        gradientClassName,
      ].join(" ")}
    >
      <div className="min-w-0">
        <h3 className="text-xs font-black uppercase tracking-wide text-dark leading-snug">
          {title}
        </h3>
        <p className="mt-1 text-[11px] leading-snug text-slate-600">
          {description}
        </p>
        <div className="mt-3">
          <CustomButton variant="primary" size="xs" radius="full">
            Click Here
          </CustomButton>
        </div>
      </div>

      <div className="shrink-0 w-14 h-14 rounded-full bg-white/70 border border-white/60 center-flex">
        {icon}
      </div>
    </div>
  );
};

const OrderHighlights = () => {
  const cards: HighlightCardProps[] = [
    {
      title: "Call to order from 10 AM to 10 PM",
      description:
        "Speak directly with our experts to place your order quick and easy!",
      gradientClassName: "bg-gradient-to-r from-orange-100 via-orange-50 to-white",
      icon: <Icons.Time className="!w-7 !h-7 text-primary" />,
    },
    {
      title: "Get authentic medicine",
      description:
        "Browse and buy your prescription & OTC medicine online. Quick delivery to your doorstep.",
      gradientClassName: "bg-gradient-to-r from-sky-100 via-sky-50 to-white",
      icon: <Icons.Shield className="!w-7 !h-7 text-primary" />,
    },
    {
      title: "Order surgical products",
      description:
        "Explore our range of high-quality surgical supplies. Order now for swift delivery.",
      gradientClassName:
        "bg-gradient-to-r from-blue-100 via-blue-50 to-white",
      icon: <Icons.Delivery className="!w-7 !h-7 text-primary" />,
    },
    {
      title: "Upload prescription",
      description:
        "Easily upload your prescription to order the required medicines. Secure and hassle-free.",
      gradientClassName:
        "bg-gradient-to-r from-green-100 via-green-50 to-white",
      icon: <Icons.Prescription className="!w-7 !h-7 text-primary" />,
    },
  ];

  return (
    <SectionContainer>
      <MainContainer>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
          {cards.map((card) => (
            <HighlightCard key={card.title} {...card} />
          ))}
        </div>
      </MainContainer>
    </SectionContainer>
  );
};

export default OrderHighlights;
