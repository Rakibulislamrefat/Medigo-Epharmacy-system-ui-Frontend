import HomeSlider from "../ui/HomeSlider";
import OrderTracking from "../ui/OrderTracking";

const HeroSection = () => {
  return (
    <section className="relative">

      {/* Slider */}
      <div className="relative">
        <HomeSlider />

        <div
          className="absolute bottom-0 left-0 right-0 translate-y-1/2 z-20
            px-4 flex justify-center"
        >
          <div className="w-full max-w-3xl">
            <OrderTracking isFloating />
          </div>
        </div>
      </div>

      {/* Spacer — must be ~half the floating card's height at each breakpoint */}
      <div className="h-24 sm:h-10 md:h-14 bg-white" />

    </section>
  );
};

export default HeroSection;