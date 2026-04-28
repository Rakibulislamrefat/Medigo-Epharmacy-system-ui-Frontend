import { Outlet } from "react-router-dom";
import Footer from "./footer/Footer";
import Header from "./header/Header";
import ScrollToTop from "../components/ScrollToTop";
import AIAssistant from "../../features/ai-assistant";

export default function MainLayout() {
  return (
    <div>
      <ScrollToTop />
      <Header />

      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <AIAssistant />
    </div>
  );
}
