import { Link } from "react-router-dom";
import MainContainer from "../../../shared/main-container/MainContainer";
import { Icons } from "../../../shared/icons/Icons";
import CustomButton from "../../../shared/button/CustomButton";

const AboutBanner = () => (
  <div className="relative bg-[#0f2e29] overflow-hidden pt-16 pb-24">
    {/* Decorative circles */}
    <div className="absolute -top-16 -right-16 w-72 h-72 rounded-full border border-white/5 pointer-events-none" />
    <div className="absolute top-8  -right-4  w-40 h-40 rounded-full border border-white/5 pointer-events-none" />
    <div className="absolute -bottom-10 -left-10 w-52 h-52 rounded-full border border-white/5 pointer-events-none" />

    <MainContainer>
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-white/40 text-xs tracking-widest uppercase mb-8">
        <Link to="/" className="hover:text-primary transition-colors">Home</Link>
        <Icons.ArrowForward className="!w-4 !h-4 text-white/20" />
        <span className="text-primary font-semibold">About Us</span>
      </nav>

      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
        <div className="max-w-xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px w-10 bg-primary" />
            <span className="text-primary text-xxs font-bold tracking-[0.3em] uppercase">
              Our Story
            </span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl text-white font-bold leading-tight mb-4">
            Medicines Delivered.<br />
            <span className="text-primary">Health Protected.</span>
          </h1>
          <p className="text-white/60 text-sm leading-relaxed">
            Medigo <span className="text-primary font-semibold">E-Pharmacy</span> is Bangladesh's most trusted online pharmacy — built to make
            genuine medicines, healthcare products, and pharmacist support accessible
            to every household, fast.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
          <CustomButton variant="primary" size="md" radius="xs" leftIcon={<Icons.Cart />}>
            Shop Medicines
          </CustomButton>
          <CustomButton
            variant="outline"
            size="md"
            radius="xs"
            leftIcon={<Icons.Prescription />}
            className="border-white/30 text-white hover:bg-white/10 hover:border-white"
          >
            Upload Prescription
          </CustomButton>
        </div>
      </div>
    </MainContainer>
  </div>
);

export default AboutBanner;