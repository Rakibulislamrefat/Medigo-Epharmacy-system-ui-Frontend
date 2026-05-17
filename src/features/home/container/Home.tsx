import { useNavigate } from "react-router-dom";
import HeroSection from "./HeroSection";
import EmergencyBanner from "../ui/EmergencyBanner";
import { rooms } from "../service/homeData";
import HowItWorks from "../ui/HowItWorks";
import OrderHighlights from "../ui/OrderHighlights";
import MedicineCategorySection from "../ui/MedicineCategorySection";
import { SpecialOffersSection } from "../../specialOffers/ui/SpecialOffersPage";
import ImpactStats from "../ui/Impactstats";
import FAQ from "../ui/Faq";
import type { MedicineCategory } from "../service/MedicineCategory.types";

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const Home = () => {
  const navigate = useNavigate();

  const handleViewAll = (_category: MedicineCategory) => {
    navigate("/shop");
  };

  return (
    <main>
      {/* Hero Section with Slider & medicine search */}
      <HeroSection />
      {/* Emergency medicine */}
      <EmergencyBanner />
      {/* how it works */}
      <HowItWorks />
      {/* Order highlights  */}
      <OrderHighlights />
      <MedicineCategorySection onViewAll={handleViewAll} />
      <SpecialOffersSection />
      {/* Impactstats  */}
      <ImpactStats />
      {/* Faq  */}
      <FAQ />
    </main>
  );
};

export default Home;
