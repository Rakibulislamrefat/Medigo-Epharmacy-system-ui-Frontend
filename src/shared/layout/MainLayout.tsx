import { Outlet } from "react-router-dom";
// import ScrollToTop from "../scoll/ScrollToTop";
import Footer from "./footer/Footer";
import Header from "./header/Header";
import ScrollToTop from "../components/ScrollToTop";

export default function MainLayout() {
  return (
    <div>
      <ScrollToTop />
      <Header />

      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
