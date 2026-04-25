import { useEffect, useRef, useState } from "react";
import type { ComponentType } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Icons } from "../icons/Icons";
import Button from "../button/CustomButton";
import MainContainer from "../main-container/MainContainer";
import { clearUser } from "../../redux/slices/userSlice";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../redux/store";
import { logoutApi } from "../../features/login/service/loginService";
import toast from "react-hot-toast";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Special Offers", href: "/special-offers" },
  { label: "Branch Locations", href: "/branch-locations" },
  { label: "Review", href: "/review" },
  { label: "Doctor Consultancy", href: "/doctor-consultancy" },
  { label: "About Us", href: "/about" },
  { label: "Contact Us", href: "/contact-us" },
];

interface NavbarProps {
  scrolled: boolean;
  navbarHidden: boolean;
}

const Navbar = ({ scrolled, navbarHidden }: NavbarProps) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const categoryRef = useRef<HTMLDivElement>(null);

  const categoryOptions = [
    "Prescription Medicine",
    "Surgical Product",
    "OTC Medicine",
    "Baby Products",
    "Women's Care",
    "Personal Care",
    "Herbal Supplements",
    "Dental & Oral Care",
    "Diabetic Accessories",
    "Food & Groceries",
    "Books & Stationary",
    "Supplements And Vitamins",
  ];

  const toCategorySlug = (value: string) =>
    value
      .toLowerCase()
      .trim()
      .replace(/&/g, "and")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

  const categoryQuickLinks: Array<{
    label: string;
    href: string;
    Icon: ComponentType<{ className?: string }>;
  }> = [
    { label: "Request Order", href: "/request-order", Icon: Icons.Cart },
    {
      label: "Upload Prescription",
      href: "/prescription/upload",
      Icon: Icons.Prescription,
    },
    { label: "Special Offers", href: "/special-offers", Icon: Icons.Star },
    { label: "How to Order", href: "/howToOrder", Icon: Icons.Check },
    { label: "Branch Locations", href: "/branch-locations", Icon: Icons.LocationPin },
    { label: "Reviews", href: "/review", Icon: Icons.Star },
    { label: "Contact Us", href: "/contact-us", Icon: Icons.Mail },
  ];

  // Fixed: was state.user, should be state.reduxSlice
  const { user, isAuthenticated } = useSelector((s: RootState) => s.user);
  const isDonor = user?.role === "donor";
  const canDonate = !isAuthenticated || isDonor;
  const visibleNavLinks = navLinks.filter(
    (link) => link.label !== "Donate Blood" || canDonate,
  );

  const [searchQuery, setSearchQuery] = useState("");

  const runSearch = () => {
    const q = searchQuery.trim();
    if (!q) return;
    navigate(`/shop?q=${encodeURIComponent(q)}`);
  };
// console.log(user, "in nabbar")
  const [menuOpen, setMenuOpen] = useState(false);
  const [rendered, setRendered] = useState(false);
  const [visible, setVisible] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // ── Logout ──────────────────────────────────────────
  const handleLogout = async () => {
    try {
      await logoutApi();
    } finally {
      dispatch(clearUser());
      toast.success("Logout successfully!");
      navigate("/login");
    }
  };
  // console.log(user)

  // ── Close dropdown on outside click ─────────────────
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      const clickedOutsideDropdown = !dropdownRef.current?.contains(target);
      const clickedOutsideCategory = !categoryRef.current?.contains(target);

      if (clickedOutsideDropdown && clickedOutsideCategory) {
        setDropdownOpen(false);
        setCategoryOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ── Mobile menu ──────────────────────────────────────
  const openMenu = () => {
    setRendered(true);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setVisible(true));
    });
    setMenuOpen(true);
    document.body.style.overflow = "hidden";
  };

  const closeMenu = () => {
    setVisible(false);
    setMenuOpen(false);
    document.body.style.overflow = "";
    setTimeout(() => setRendered(false), 320);
  };

  const toggleMenu = () => (menuOpen ? closeMenu() : openMenu());

  useEffect(() => {
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ── User Avatar UI ───────────────────────────────────
  const UserAvatar = () => (
    <div className="relative" ref={dropdownRef}>
      {/* Avatar button */}
      <button
        onClick={() => setDropdownOpen((prev) => !prev)}
        className="flex items-center gap-2 group"
      >
        {/* Avatar image or fallback icon */}
        {user?.avatar ? (
          <img
            src={user.avatar}
            alt={user.name}
            className="w-9 h-9 rounded-full object-cover border-2 border-primary/30
              group-hover:border-primary transition-colors"
          />
        ) : (
          <div
            className="w-9 h-9 rounded-full bg-primary/10 border-2 border-primary/30
            group-hover:border-primary transition-colors center-flex"
          >
            <Icons.User className="!w-4 !h-4 text-primary" />
          </div>
        )}

        {/* Name + blood type badge */}
        <div className="hidden xl:flex flex-col items-start leading-tight">
          <span className="text-sm font-semibold text-dark">{user?.name}</span>
          {user?.bloodType && (
            <span className="text-xxs font-bold text-primary">
              {user.bloodType}
            </span>
          )}
        </div>

        <Icons.ArrowForward
          className={`!w-3.5 !h-3.5 text-gray-400 transition-transform duration-200
            ${dropdownOpen ? "rotate-90" : "rotate-0"}`}
        />
      </button>

      {/* Dropdown menu */}
      {dropdownOpen && (
        <div
          className="absolute right-0 top-12 w-56 bg-white rounded-xs shadow-lg
          border border-gray-100 z-50 overflow-hidden"
        >
          {/* User info header */}
          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
            <p className="text-sm font-semibold text-dark truncate">
              {user?.name}
            </p>
            <p className="text-xs text-gray-400 truncate">{user?.email}</p>
            {user?.location?.city && (
              <p className="text-xs text-primary mt-0.5">
                📍 {user.location.city}
              </p>
            )}
          </div>

          {/* Menu items */}
          <div className="py-1">
            <NavLink
              to="/profile"
              onClick={() => setDropdownOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-dark
                hover:bg-gray-50 hover:text-primary transition-colors"
            >
              <Icons.User className="!w-4 !h-4" />
              My Profile
            </NavLink>

            {isDonor && (
              <NavLink
                to="/my-donations"
                onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-dark
                  hover:bg-gray-50 hover:text-primary transition-colors"
              >
                <Icons.Blood className="!w-4 !h-4" />
                My Donations
                {(user?.totalDonations ?? 0) > 0 && (
                  <span
                    className="ml-auto text-xxs font-bold bg-primary/10
                    text-primary px-1.5 py-0.5 rounded-full"
                  >
                    {user?.totalDonations}
                  </span>
                )}
              </NavLink>
            )}

            <NavLink
              to="/settings"
              onClick={() => setDropdownOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-dark
                hover:bg-gray-50 hover:text-primary transition-colors"
            >
              <Icons.Setting className="!w-4 !h-4" />
              Settings
            </NavLink>
          </div>

          {/* Logout */}
          <div className="border-t border-gray-100 py-1">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm
                text-red-500 hover:bg-red-50 transition-colors"
            >
              <Icons.Close className="!w-4 !h-4" />
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* ───── Navbar ───── */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500
          ${scrolled ? "bg-white shadow-md" : "bg-white/90 backdrop-blur-md"}
          ${navbarHidden ? "-translate-y-full" : "translate-y-0"}`}
      >
        <div className={`border-b border-gray-200 transition-all duration-300 overflow-hidden
          ${scrolled ? "max-h-0 opacity-0" : "max-h-24 opacity-100"}`}>
          <MainContainer>
            <div className="flex flex-col gap-3 py-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center">
                <NavLink
                  to="/"
                  className="group inline-flex items-center gap-3 whitespace-nowrap"
                >
                  <span className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-primary/10 border border-primary/15 center-flex shadow-sm shadow-primary/10 group-hover:bg-primary/15 transition-colors">
                    <Icons.Pill className="!w-5 !h-5 sm:!w-5.5 sm:!h-5.5 text-primary" />
                  </span>
                  <span className="font-serif font-black text-dark text-base sm:text-lg md:text-xl leading-none tracking-tight">
                    Med<span className="text-primary">igo</span>
                  </span>
                  <span className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-[9px] sm:text-[10px] md:text-xxs font-black tracking-[0.28em] uppercase text-primary/80">
                    E‑Pharmacy
                  </span>
                </NavLink>
              </div>

              <div className="mx-auto w-full max-w-xl lg:flex-1 lg:mx-0">
                <div className="flex items-center bg-white rounded-full border border-gray-200 overflow-hidden shadow-sm shadow-primary/5
                  transition focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary/30">
                  <input
                    type="text"
                    placeholder="Search by Name / Generic..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") runSearch();
                    }}
                    className="flex-1 bg-transparent px-4 py-2.5 sm:py-3 text-sm text-dark placeholder:text-slate-400 outline-none min-w-0"
                  />
                  <button
                    type="button"
                    aria-label="Search"
                    onClick={runSearch}
                    className="px-4 py-2.5 sm:py-3 text-white bg-primary rounded-full rounded-l-none hover:bg-primary/90 transition-colors"
                  >
                    <Icons.Search className="!w-4 !h-4" />
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-end gap-3 text-xs text-slate-500 lg:gap-4">
                <span className="hidden lg:inline-block text-sm font-medium text-dark">
                  First Ever Life-saving platform in Bangladesh!
                </span>
              </div>
            </div>
          </MainContainer>
        </div>

        <MainContainer>
          <div className="flex items-center justify-between gap-3 py-4">
            <div className="flex items-center gap-3">
              <div className="relative" ref={categoryRef}>
                <button
                  type="button"
                  onClick={() => setCategoryOpen((prev) => !prev)}
                  className="inline-flex items-center gap-2 rounded-xs border border-primary bg-primary/10 px-4 py-2 text-sm font-semibold text-primary transition hover:bg-primary/20 whitespace-nowrap"
                >
                  <span>CATEGORIES</span>
                  <Icons.ArrowForward
                    className={`!w-4 !h-4 transition-transform duration-200
                    ${categoryOpen ? "rotate-90" : "rotate-0"}`}
                  />
                </button>

                {categoryOpen && (
                  <div className="absolute left-0 top-full z-50 mt-2 w-[92vw] max-w-sm sm:w-80 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl">
                    <div className="px-4 py-3 border-b border-gray-100 bg-light">
                      <p className="text-xs font-black tracking-[0.2em] uppercase text-primary">
                        Categories
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        Quick actions and shop categories
                      </p>
                    </div>

                    <div className="p-2">
                      <div className="px-2 py-2">
                        <p className="text-xxs font-black tracking-[0.2em] uppercase text-slate-500">
                          Quick links
                        </p>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                        {categoryQuickLinks.map(({ label, href, Icon }) => (
                          <button
                            key={href}
                            type="button"
                            onClick={() => {
                              navigate(href);
                              setCategoryOpen(false);
                            }}
                            className="group w-full flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-left hover:bg-primary/5 transition-colors"
                          >
                            <span className="flex items-center gap-2.5 min-w-0">
                              <span className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/15 center-flex shrink-0">
                                <Icon className="!w-4 !h-4 text-primary" />
                              </span>
                              <span className="text-sm font-semibold text-dark truncate">
                                {label}
                              </span>
                            </span>
                            <Icons.ArrowForward className="!w-4 !h-4 text-primary/50 group-hover:text-primary transition-colors shrink-0" />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="border-t border-gray-100">
                      <div className="px-4 py-3">
                        <p className="text-xxs font-black tracking-[0.2em] uppercase text-slate-500">
                          Shop by category
                        </p>
                      </div>
                      <div className="max-h-72 overflow-y-auto pb-2 px-2">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                        {categoryOptions.map((item) => (
                          <button
                            key={item}
                            type="button"
                            onClick={() => {
                              navigate(`/category/${toCategorySlug(item)}`);
                              setCategoryOpen(false);
                            }}
                            className="group w-full text-left px-3 py-2.5 text-sm text-dark hover:bg-primary/5 transition-colors rounded-lg"
                          >
                            <span className="flex items-center justify-between gap-3">
                              <span className="flex items-center gap-2.5 min-w-0">
                                <span className="w-8 h-8 rounded-lg bg-white border border-gray-100 center-flex shrink-0 group-hover:border-primary/20 group-hover:bg-primary/5 transition-colors">
                                  <Icons.ArrowForward className="!w-4 !h-4 text-primary" />
                                </span>
                                <span className="truncate">{item}</span>
                              </span>
                              <Icons.ArrowForward className="!w-4 !h-4 text-primary/40 group-hover:text-primary transition-colors shrink-0" />
                            </span>
                          </button>
                        ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <nav className="hidden lg:flex items-center gap-6 flex-1 justify-center">
              {visibleNavLinks.map((link) => (
                <NavLink
                  key={link.label}
                  to={link.href}
                  className={({ isActive }) =>
                    `text-sm font-medium transition-colors duration-200
                    ${isActive ? "text-primary" : "text-dark hover:text-primary"}`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </nav>

            <div className="hidden lg:flex items-center gap-3">
              {isAuthenticated && user ? (
                !isMobile && <UserAvatar />
              ) : (
                <NavLink to="/login">
                  <Button variant="outline" size="sm" radius="xs">
                    Login
                  </Button>
                </NavLink>
              )}

              <NavLink to="/request-order">
                <Button variant="primary" size="sm" radius="xs">
                  Request Order
                </Button>
              </NavLink>
            </div>

            <div className="flex lg:hidden items-center gap-2">
              {isAuthenticated && user ? (
                isMobile && <UserAvatar />
              ) : (
                <NavLink to="/login">
                  <Button variant="outline" size="xs" radius="xs">
                    Login
                  </Button>
                </NavLink>
              )}

              <button
                className="p-1 rounded-xs hover:bg-gray-100 transition-colors"
                onClick={toggleMenu}
                aria-label="Toggle menu"
                aria-expanded={menuOpen}
              >
                <div className="relative w-6 h-6 center-flex">
                  <span
                    className={`absolute transition-all duration-300
                    ${menuOpen ? "opacity-100 rotate-0" : "opacity-0 rotate-90"}`}
                  >
                    <Icons.Close className="!w-5 !h-5" />
                  </span>
                  <span
                    className={`absolute transition-all duration-300
                    ${menuOpen ? "opacity-0 -rotate-90" : "opacity-100 rotate-0"}`}
                  >
                    <Icons.Menu className="!w-5 !h-5" />
                  </span>
                </div>
              </button>
            </div>
          </div>
        </MainContainer>
      </header>

      {/* ───── Mobile Drawer ───── */}
      {rendered && (
        <>
          <div
            onClick={closeMenu}
            className={`lg:hidden fixed inset-0 bg-black/40 z-40 transition-opacity
              duration-300 ${visible ? "opacity-100" : "opacity-0"}`}
          />

          <div
            className={`lg:hidden fixed top-0 right-0 bottom-0 w-[80vw] max-w-xs
              bg-white z-50 flex flex-col shadow-2xl transition-transform
              duration-300 ease-in-out
              ${visible ? "translate-x-0" : "translate-x-full"}`}
          >
            {/* Drawer header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <NavLink
                to="/"
                onClick={closeMenu}
                className="flex items-center gap-2"
              >
                <Icons.Pill className="!w-4 !h-4 text-primary" />
                <span className="font-serif font-bold text-dark text-base">
                  Med<span className="text-primary">igo</span>
                </span>
              </NavLink>
              <button
                onClick={closeMenu}
                className="w-8 h-8 rounded-xs bg-gray-100 center-flex
                  hover:bg-red-50 hover:text-primary transition-colors"
              >
                <Icons.Close className="!w-4 !h-4" />
              </button>
            </div>

            {/* Mobile user info (shown if logged in) */}
            {isAuthenticated && user && (
              <div
                className="mx-4 mt-4 p-3 bg-primary/5 rounded-xs
                flex items-center gap-3"
              >
                <div
                  className="w-10 h-10 rounded-full bg-primary/10
                  border-2 border-primary/20 center-flex shrink-0"
                >
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <Icons.User className="!w-4 !h-4 text-primary" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-dark truncate">
                    {user.name}
                  </p>
                  <p className="text-xs text-gray-400 truncate">{user.email}</p>
                </div>
                {user.bloodType && (
                  <span
                    className="ml-auto text-xs font-black text-primary
                    bg-primary/10 px-2 py-1 rounded-xs shrink-0"
                  >
                    {user.bloodType}
                  </span>
                )}
              </div>
            )}

            {/* Nav links */}
            <nav className="flex-1 overflow-y-auto px-4 py-4">
              {visibleNavLinks.map((link, index) => (
                <NavLink
                  key={link.label}
                  to={link.href}
                  onClick={closeMenu}
                  style={{
                    transitionDelay: visible ? `${index * 40}ms` : "0ms",
                  }}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3 py-3 rounded-xs mb-1
                    text-sm font-medium transition-all duration-300
                    ${visible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4"}
                    ${
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-dark hover:bg-gray-50 hover:text-primary"
                    }`
                  }
                >
                  <span>{link.label}</span>
                  <Icons.ArrowForward className="!w-3.5 !h-3.5 text-primary/60" />
                </NavLink>
              ))}
            </nav>

            {/* Drawer CTA */}
            <div className="px-4 pb-6 pt-3 border-t border-gray-100 flex flex-col gap-2.5">
              {isAuthenticated && user ? (
                <button
                  onClick={() => {
                    handleLogout();
                    closeMenu();
                  }}
                  className="w-full py-2.5 rounded-xs border border-red-200
                    text-red-500 text-sm font-medium hover:bg-red-50 transition-colors"
                >
                  Logout
                </button>
              ) : (
                <NavLink to="/login" onClick={closeMenu}>
                  <Button variant="outline" size="md" radius="xs" fullWidth>
                    Login
                  </Button>
                </NavLink>
              )}
              <NavLink to="/request-order" onClick={closeMenu}>
                <Button variant="primary" size="md" radius="xs" fullWidth>
                  Request Order
                </Button>
              </NavLink>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default Navbar;
