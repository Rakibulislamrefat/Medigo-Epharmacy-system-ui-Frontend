import type { ReactNode } from "react";
import { Icons } from "../../../shared/icons/Icons";
import MainContainer from "../../../shared/main-container/MainContainer";
import SectionContainer from "../../../shared/section-container/SectionContainer";

import { useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();

  // Define actions for each card
  const handleClick = () => {
    if (title.toLowerCase().includes("call")) {
      window.open("tel:+1234567890"); // Replace with actual phone number
    } else if (title.toLowerCase().includes("authentic medicine")) {
      navigate("/shop");
    } else if (title.toLowerCase().includes("surgical products")) {
      navigate("/surgical-products");
    } else if (title.toLowerCase().includes("upload prescription")) {
      navigate("/prescription/upload");
    } else if (title.toLowerCase().includes("order history") || title.toLowerCase().includes("my orders")) {
      navigate("/order-history");
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleClick();
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`Open ${title}`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={[
        "flex items-center justify-between gap-4 rounded-xs border border-gray-100 px-5 py-4",
        "min-h-[104px] cursor-pointer transform transition duration-300 ease-out hover:-translate-y-1 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary/50",
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
        <div className="mt-3 inline-flex rounded-full border border-primary/20 bg-white px-3 py-1.5 text-[11px] font-semibold text-primary transition hover:bg-primary hover:text-white">
          Click Here
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
    {
      title: "My orders",
      description:
        "Track and view your order history, delivery status, and payment details.",
      gradientClassName:
        "bg-gradient-to-r from-purple-100 via-purple-50 to-white",
      icon: <Icons.Clock className="!w-7 !h-7 text-primary" />,
    },
  ];

  return (
    <SectionContainer>
      <MainContainer>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-5">
          {cards.map((card) => (
            <HighlightCard key={card.title} {...card} />
          ))}
        </div>
      </MainContainer>
    </SectionContainer>
  );
};

export default OrderHighlights;
