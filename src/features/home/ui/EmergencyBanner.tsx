import MainContainer from "../../../shared/main-container/MainContainer";


const EmergencyBanner = () => {
  return (
    <div className="bg-primary text-white py-3">
      <MainContainer>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
          {/* Left — pulse + message */}
          <div className="flex items-center gap-3">
            <span className="relative flex h-2.5 w-2.5 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white" />
            </span>
            <p className="text-xs sm:text-sm font-semibold leading-snug">
              👨‍⚕️ <span className="font-bold">Doctor Appointment:</span> Book a
              consultation with verified doctors — available every day from 8 AM
              to 10 PM.
            </p>
          </div>

          {/* Right — CTA */}
          <a
            href="/doctor-consultancy#book-now"
            className="shrink-0 bg-white/95 text-primary font-bold text-xs px-4 py-1.5 rounded-full border border-white/30 shadow-sm shadow-black/10 hover:bg-white hover:-translate-y-0.5 hover:shadow-md hover:shadow-black/15 transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
          >
            Book Now →
          </a>
        </div>
      </MainContainer>
    </div>
  );
};

export default EmergencyBanner;
