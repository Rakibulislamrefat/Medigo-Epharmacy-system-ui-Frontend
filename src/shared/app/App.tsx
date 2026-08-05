import AOS from "aos";
import "aos/dist/aos.css";
import { Suspense, useEffect, useState } from "react";
import { RouterProvider } from "react-router-dom";
import { router } from "./routes";
import BuildInLoader from "../loader/BuildInLoader";
import { Toaster } from "react-hot-toast";
import { useDispatch } from "react-redux";
import { clearUser, setAuthUser, setLoading, setToken } from "../../redux/slices/userSlice";
import Api from "../../utilities/api";
import { getAuthUserApi } from "../../features/login/service/loginService";

export default function App() {
  const dispatch = useDispatch();
  const [isBooting, setIsBooting] = useState(true);

  useEffect(() => {
    AOS.init({
      duration: 2000, // animation duration in ms
      once: true, // only animate once while scrolling
    });
  }, []);

  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      dispatch(setLoading(true));

      // Development helper: if DEV_ADMIN is set in localStorage, seed a fake admin user
      try {
        const dev = typeof window !== "undefined" && window.localStorage.getItem("DEV_ADMIN");
        if (dev === "1") {
          const fakeAdmin = {
            _id: "dev-admin",
            name: "Dev Admin",
            email: "admin@local",
            phone: "",
            age: null,
            gender: null,
            avatar: "",
            bloodType: null,
            weight: null,
            location: { city: "", country: "", country_code: "", county: "", postcode: "", state: "", state_district: "", coordinates: { lat: null, lng: null } },
            socialLinks: { facebook: null, instagram: null, twitter: null },
            role: "admin" as const,
            isVerified: true,
            isActive: true,
            communityFlags: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          } as const;

          dispatch(setAuthUser(fakeAdmin));
          dispatch(setLoading(false));
          if (mounted) setIsBooting(false);
          return;
        }

        const res = await Api.post("/auth/refresh-token");
        const accessToken = res?.data?.data?.accessToken;

        if (!accessToken) throw new Error("Missing access token");

        dispatch(setToken(accessToken));

        const user = await getAuthUserApi();
        dispatch(setAuthUser(user));
      } catch {
        dispatch(clearUser());
      } finally {
        dispatch(setLoading(false));
        if (mounted) setIsBooting(false);
      }
    };

    void initAuth();

    return () => {
      mounted = false;
    };
  }, [dispatch]);

  if (isBooting) {
    return (
      <>
        <Toaster position="top-right" />
        <BuildInLoader />
      </>
    );
  }

  return (
    <Suspense fallback={<BuildInLoader/>}>
      <Toaster position="top-right" />
      <RouterProvider router={router} />
    </Suspense>
  );
}
