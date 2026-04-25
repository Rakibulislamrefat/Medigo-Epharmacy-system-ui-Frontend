import { useState, useEffect } from "react";
import Navbar from "../../navbar/Navbar";

const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const [navbarHidden, setNavbarHidden] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Show info bar only when at top
      setScrolled(currentScrollY > 50);

      // Hide navbar when scrolling down, show when scrolling up
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Scrolling down
        setNavbarHidden(true);
      } else {
        // Scrolling up
        setNavbarHidden(false);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  return (
    <>
      {/* Spacer — pushes page content below fixed navbar */}
      <div className="h-[128px] lg:h-[132px]" />

      {/* Navbar is fixed, positioned at top */}
      <Navbar scrolled={scrolled} navbarHidden={navbarHidden} />
    </>
  );
};

export default Header;