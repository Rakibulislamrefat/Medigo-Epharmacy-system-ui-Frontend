import AOS from "aos";
import "aos/dist/aos.css";
import { Suspense, useEffect } from "react";
import { RouterProvider } from "react-router-dom";
import { router } from "./routes";
import BuildInLoader from "../loader/BuildInLoader";
import { Toaster } from "react-hot-toast";
import { useDispatch } from "react-redux";
import { clearUser, setAuthUser, setLoading, setToken } from "../../redux/slices/userSlice";
import Api from "../../utilities/api";
import { getAuthUserApi } from "../../features/login/service/loginService";
export default function App() {
  const dispatch = useDispatch()
  useEffect(() => {
    AOS.init({
      duration: 2000, // animation duration in ms
      once: true, // only animate once while scrolling
    });
  }, []);
   useEffect(() => {
    const initAuth = async () => {
  try {
    dispatch(setLoading(true));

    const res = await Api.post("/auth/refresh-token");
console.log(res.data.data , "app.tsx")
    if (!res?.data?.data?.accessToken) throw new Error();

    dispatch(setToken(res.data.data.accessToken));

    const user = await getAuthUserApi();
    // console.log(user, "app.tsx")
    dispatch(setAuthUser(user));

  } catch {
    dispatch(clearUser());
  } finally {
    dispatch(setLoading(false));
  }
};

    initAuth();
  }, [dispatch]);

  return (
    <Suspense fallback={<BuildInLoader/>}>
      <Toaster position="top-right" />
      <RouterProvider router={router} />
    </Suspense>
  );
}
