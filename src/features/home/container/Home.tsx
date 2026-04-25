import HeroSection from "./HeroSection";
import EmergencyBanner from "../ui/EmergencyBanner";
import { rooms } from "../service/homeData";
import HowItWorks from "../ui/HowItWorks";
import OrderHighlights from "../ui/OrderHighlights";
import MedicineCategorySection from "../ui/MedicineCategorySection";
import { SpecialOffersSection } from "../../specialOffers/ui/SpecialOffersPage";
import ImpactStats from "../ui/Impactstats";
import FAQ from "../ui/Faq";

const Home = () => {
  console.log(rooms  )
  return (
    <main>
      {/* Hero Section with Slider & medicine search */}
      <HeroSection />
      {/* Emergency medicine */}
      <EmergencyBanner/>
      {/* how it works */}
      <HowItWorks />
      {/* Order highlights  */}
      <OrderHighlights />
      <MedicineCategorySection />
      <SpecialOffersSection />
      {/* Impactstats  */}
      <ImpactStats />
      {/* Faq  */}
      <FAQ/>
    </main>
  );
};

export default Home;
