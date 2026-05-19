import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, EffectFade } from "swiper/modules";
import { useState } from "react";
import { Link } from "react-router-dom";
import Button from "../../../shared/button/CustomButton";
import { Icons } from "../../../shared/icons/Icons";

const slides = [
  {
    id: 1,
    image: "/assets/images/hero/medicines-hero.jpg",
    category: "Express Delivery",
    title: "Medicines at Your\nDoorstep in 4–6 Hours.",
    subtitle:
      "Order genuine medicines online and get them delivered fast — verified by licensed pharmacists, sealed and safe.",
    primaryLabel: "Shop Medicines",
    primaryLink: "/shop",
    secondaryLabel: "Upload Prescription",
    secondaryLink: "/prescription/upload",
    primaryIcon: Icons.Cart,
    secondaryIcon: Icons.Prescription,
  },
  {
    id: 2,
    image: "/assets/images/hero/prescription-hero.jpg",
    category: "Prescription Orders",
    title: "Upload Your Prescription.\nWe Handle the Rest.",
    subtitle:
      "Simply upload a photo of your doctor's prescription. Our pharmacists review it within 30 minutes and prepare your order.",
    primaryLabel: "Upload Now",
    primaryLink: "/prescription/upload",
    secondaryLabel: "How It Works",
    secondaryLink: "/how-it-works",
    primaryIcon: Icons.Prescription,
    secondaryIcon: Icons.Search,
  },
  {
    id: 3,
    image: "/assets/images/hero/healthcare-hero.jpg",
    category: "Healthcare Products",
    title: "20,000+ Genuine Products.\nOne Trusted Platform.",
    subtitle:
      "From vitamins and supplements to medical devices — everything you need for your family's health in one place.",
    primaryLabel: "Browse All",
    primaryLink: "/shop",
    secondaryLabel: "Special Offers",
    secondaryLink: "/special-offers",
    primaryIcon: Icons.Pill,
    secondaryIcon: Icons.Star,
  },
];

const MedigoHeroSlider = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div className="relative w-full min-h-[520px] h-[70vh] md:h-[80vh] lg:h-[85vh] overflow-hidden">
      <style>
        {`
          @keyframes fadeUp {
            from { opacity: 0; transform: translateY(30px); }
            to   { opacity: 1; transform: translateY(0);     }
          }
          @keyframes fadeIn {
            from { opacity: 0; }
            to   { opacity: 1; }
          }

          .slide-category { animation: fadeUp 0.6s ease 0.2s  both; }
          .slide-title    { animation: fadeUp 0.7s ease 0.35s both; }
          .slide-subtitle { animation: fadeUp 0.7s ease 0.5s  both; }
          .slide-buttons  { animation: fadeUp 0.7s ease 0.65s both; }
          .overlay-fade   { animation: fadeIn 1s   ease       both; }
          .slide-category span,
          .slide-title,
          .slide-subtitle {
            text-shadow: 0 12px 28px rgba(0, 0, 0, 0.45);
          }

          .swiper-pagination-bullet {
            background: rgba(255,255,255,0.4) !important;
            width: 6px !important;
            height: 6px !important;
            transition: all 0.3s !important;
          }
          .swiper-pagination-bullet-active {
            background: #0d7c66 !important;
            width: 22px !important;
            border-radius: 4px !important;
          }

          .medigo-hero-content {
            padding-top: clamp(4.25rem, 9vh, 6.25rem);
            padding-bottom: clamp(6.5rem, 12vh, 7.5rem);
          }
        `}
      </style>

      <Swiper
        modules={[Autoplay, Pagination, EffectFade]}
        effect="fade"
        autoplay={{ delay: 5500, disableOnInteraction: false }}
        pagination={{ clickable: true }}
        loop
        speed={700}
        onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
        className="w-full h-full"
      >
        {slides.map((slide) => (
          <SwiperSlide key={slide.id}>
            {({ isActive }) => (
              <div className="relative w-full h-full">

                {/* Background image */}
                <img
                  src={slide.image}
                  alt={slide.title}
                  className="absolute inset-0 w-full h-full object-cover"
                  style={{
                    transform: isActive ? "scale(1.05)" : "scale(1)",
                    transition: "transform 6s ease",
                  }}
                />

                {/* Overlay — left-heavy dark gradient */}
                <div className="overlay-fade absolute inset-0 bg-[linear-gradient(90deg,rgba(15,46,41,0.96)_0%,rgba(15,46,41,0.86)_55%,rgba(15,46,41,0.35)_78%,transparent_100%)]" />

                {/* Bottom gradient for pagination dots readability */}
                <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/30 to-transparent pointer-events-none" />

                {/* Content */}
                <div className="absolute inset-0 flex items-start md:items-center">
                  <div className="medigo-hero-content relative max-w-2xl px-4 sm:px-6 md:px-12 lg:px-20">

                    {/* Category pill */}
                    <div className="slide-category flex items-center gap-3 mb-5">
                      <div className="h-px w-12 bg-primary" />
                      <span className="text-primary text-xs font-bold tracking-[0.3em] uppercase">
                        {slide.category}
                      </span>
                    </div>

                    {/* Title */}
                    <h1
                      className="slide-title font-serif text-white font-bold tracking-tight whitespace-pre-line break-words
                      drop-shadow-[0_12px_40px_rgba(0,0,0,0.35)]
                      text-[clamp(26px,6vw,52px)] md:text-[clamp(40px,4.2vw,64px)] leading-[1.06] mb-4 sm:mb-5"
                    >
                      {slide.title}
                    </h1>

                    {/* Subtitle */}
                    <p className="slide-subtitle text-white/75 max-w-md leading-relaxed mb-7 sm:mb-8
                      text-[clamp(12px,1.25vw,18px)]">
                      {slide.subtitle}
                    </p>

                    {/* CTA buttons */}
                    <div className="slide-buttons flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                      <Link to={slide.primaryLink} className="w-full sm:w-auto">
                        <Button
                          variant="primary"
                          size="sm"
                          fullWidth
                          leftIcon={<slide.primaryIcon />}
                        >
                          {slide.primaryLabel}
                        </Button>
                      </Link>

                      <Link to={slide.secondaryLink} className="w-full sm:w-auto">
                        <Button
                          variant="outline"
                          size="sm"
                          fullWidth
                          leftIcon={<slide.secondaryIcon />}
                          className="border-white/30 text-white hover:bg-white/10 hover:border-white"
                        >
                          {slide.secondaryLabel}
                        </Button>
                      </Link>
                    </div>

                  </div>
                </div>
              </div>
            )}
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Slide counter — top right */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-10 text-white flex items-center gap-1 text-sm font-mono select-none">
        <span className="font-bold text-primary">
          {String(activeIndex + 1).padStart(2, "0")}
        </span>
        <span className="text-white/30 mx-0.5">/</span>
        <span className="text-white/50">
          {String(slides.length).padStart(2, "0")}
        </span>
      </div>

      {/* Brand tag — bottom left */}
      <div className="absolute bottom-6 sm:bottom-8 left-4 sm:left-6 md:left-12 lg:left-20 z-10
        flex items-center gap-2 select-none">
        <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center">
          <span className="text-white font-black text-xs">M</span>
        </div>
        <span className="text-white/40 text-xs font-semibold tracking-widest uppercase">
          Medigo Pharma
        </span>
      </div>
    </div>
  );
};

export default MedigoHeroSlider;
