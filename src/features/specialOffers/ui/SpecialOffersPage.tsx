import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import CustomButton from "../../../shared/button/CustomButton";
import { Icons } from "../../../shared/icons/Icons";
import MainContainer from "../../../shared/main-container/MainContainer";
import SectionContainer from "../../../shared/section-container/SectionContainer";
import SectionHeading from "../../../shared/section-heading/SectionHeading";
import { offers, type SpecialOffer } from "../service/specialOffersData";

const SpecialOfferCard = ({
  offer,
  onCopy,
}: {
  offer: SpecialOffer;
  onCopy?: (code: string) => void;
}) => {
  return (
    <div className="group bg-white rounded-xs border border-gray-100 overflow-hidden shadow-md hover:shadow-xl transition-shadow flex flex-col h-[400px] sm:h-[420px]">
      <div className="relative h-44 flex-shrink-0">
        <img
          src={offer.image}
          alt={offer.title}
          className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-dark/70 via-dark/10 to-transparent" />
        <span className="absolute top-3 left-3 inline-flex items-center gap-1 rounded-full bg-secondary text-white text-xxs font-black px-3 py-1">
          <Icons.Check className="!w-4 !h-4" />
          {offer.discount}
        </span>
      </div>

      <div className="p-5 flex flex-col flex-1">
        <div>
          <h3 className="text-lg font-black text-dark leading-tight min-h-[48px]">
            {offer.title}
          </h3>
          <p className="mt-2 text-sm text-slate-600 leading-relaxed min-h-[44px]">
            {offer.description}
          </p>
        </div>

        <div className="mt-auto pt-4 flex flex-wrap items-center justify-between gap-2">
          <div className="inline-flex items-center gap-2 rounded-xs border border-gray-100 bg-primary/5 px-3 py-2">
            <span className="text-xxs font-black tracking-wide text-slate-500">
              CODE
            </span>
            <span className="text-sm font-black text-primary">{offer.code}</span>
            <button
              type="button"
              onClick={() => onCopy?.(offer.code)}
              className="ml-1 inline-flex items-center justify-center w-8 h-8 rounded-xs bg-white border border-gray-100 hover:border-primary hover:text-primary transition-colors"
              aria-label="Copy code"
            >
              <Icons.Copy className="!w-4 !h-4" />
            </button>
          </div>

          <div className="inline-flex items-center gap-2 text-xs text-slate-500">
            <Icons.Clock className="!w-4 !h-4 text-primary" />
            <span className="font-semibold">{offer.expiry}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export const SpecialOffersSection = () => {
  const handleCopy = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      toast.success("Code copied!");
    } catch {
      toast.error("Copy failed");
    }
  };

  return (
    <SectionContainer>
      <MainContainer>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeading
            title="Special Offers"
            description="Grab limited-time deals and save more on every order."
            align="left"
            className="max-w-2xl"
          />

          <Link to="/special-offers" className="shrink-0">
            <CustomButton variant="outline" size="sm" radius="xs">
              View All
            </CustomButton>
          </Link>
        </div>

        <div className="mt-6 relative">
          <button
            type="button"
            aria-label="Previous"
            className="special-offers-prev hidden lg:flex absolute -left-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white shadow-md border border-gray-100 center-flex hover:bg-gray-50"
          >
            <Icons.ArrowBack className="!w-5 !h-5 text-slate-700" />
          </button>
          <button
            type="button"
            aria-label="Next"
            className="special-offers-next hidden lg:flex absolute -right-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white shadow-md border border-gray-100 center-flex hover:bg-gray-50"
          >
            <Icons.Arrow className="!w-5 !h-5 text-slate-700" />
          </button>

          <Swiper
            modules={[Navigation]}
            slidesPerView={1.05}
            spaceBetween={16}
            breakpoints={{
              640: { slidesPerView: 2.1, spaceBetween: 18 },
              1024: { slidesPerView: 3, spaceBetween: 22 },
            }}
            navigation={{
              prevEl: ".special-offers-prev",
              nextEl: ".special-offers-next",
            }}
          >
            {offers.map((offer) => (
              <SwiperSlide key={offer.id} className="h-auto">
                <SpecialOfferCard offer={offer} onCopy={handleCopy} />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </MainContainer>
    </SectionContainer>
  );
};

const SpecialOffersPage = () => {
  const handleCopy = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      toast.success("Code copied!");
    } catch {
      toast.error("Copy failed");
    }
  };

  return (
    <SectionContainer>
      <MainContainer>
        <SectionHeading
          title="Special Offers"
          description="Choose an offer, copy the code, and enjoy instant savings."
          align="left"
          className="mb-10"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {offers.map((offer) => (
            <SpecialOfferCard key={offer.id} offer={offer} onCopy={handleCopy} />
          ))}
        </div>
      </MainContainer>
    </SectionContainer>
  );
};

export default SpecialOffersPage;
