import { createBrowserRouter } from "react-router-dom";
import MainLayout from "../../layout/MainLayout";
import Home from "../../../features/home/container/Home";
import LoginPage from "../../../features/login/ui/LoginPage";
import AboutPage from "../../../features/about/ui/About";
import GuestRoute from "./GuestRoute";
import ProtectedRoute from "./ProtectedRoute";
import AdminRoute from "./AdminRoute";
import RegisterPage from "../../../features/register/ui/RegisterPage";
import ForgotPasswordPage from "../../../features/forgotPassword/ui/ForgotPassword";
import ResetPasswordPage from "../../../features/restPassword/ui/ResetPasswordPage";
import ProfilePage from "../../../features/profile/component/ProfilePage";
import SettingsPage from "../../../features/mySetting/ui/MySettingPage";
import VerifyOtpPage from "../../../features/register/ui/VerifyOtpPage";
import SpecialOffersPage from "../../../features/specialOffers/ui/SpecialOffersPage";
import BranchLocationsPage from "../../../features/branchLocations/ui/BranchLocationsPage";
import ReviewsPage from "../../../features/review/ui/ReviewsPage";
import ContactUsPage from "../../../features/contactUs/ui/ContactUsPage";
import RequestOrderPage from "../../../features/requestOrder/ui/RequestOrderPage";
import UploadPrescriptionPage from "../../../features/prescription/ui/UploadPrescriptionPage";
import HowToOrderPage from "../../../features/howToOrder/ui/HowToOrderPage";
import CareerPage from "../../../features/career/ui/CareerPage";
import ReturnPolicyPage from "../../../features/returnPolicy/ui/ReturnPolicyPage";
import TermsConditionPage from "../../../features/termsCondition/ui/TermsConditionPage";
import PrivacyPolicyPage from "../../../features/privacy/ui/PrivacyPolicyPage";
import CategoryPage from "../../../features/category/ui/CategoryPage";
import DoctorConsultancyPage from "../../../features/doctorConsultancy/ui/DoctorConsultancyPage";
import UsersPage from "../../../features/users/ui/UsersPage";
import AdminLayout from "../../layout/AdminLayout";
import AdminDashboardPage from "../../../features/admin/ui/AdminDashboardPage";
import AdminUsersPage from "../../../features/admin/ui/AdminUsersPage";
import AdminMedicinesPage from "../../../features/admin/ui/AdminMedicinesPage";
import AdminOrdersPage from "../../../features/admin/ui/AdminOrdersPage";
import AdminDoctorsPage from "../../../features/admin/ui/AdminDoctorsPage";
import AdminConsultanciesPage from "../../../features/admin/ui/AdminConsultanciesPage";

export const router = createBrowserRouter([
  {
    element: <MainLayout />,
    children: [
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "/about",
        element: <AboutPage />,
      },
      {
        path: "/special-offers",
        element: <SpecialOffersPage />,
      },
      {
        path: "/special/offer",
        element: <SpecialOffersPage />,
      },
      {
        path: "/branch-locations",
        element: <BranchLocationsPage />,
      },
      {
        path: "/review",
        element: <ReviewsPage />,
      },
      {
        path: "/contact-us",
        element: <ContactUsPage />,
      },
      {
        path: "/doctor-consultancy",
        element: <DoctorConsultancyPage />,
      },
      {
        path: "/users",
        element: <UsersPage />,
      },
      {
        path: "/community",
        element: <UsersPage />,
      },
      {
        path: "/contact",
        element: <ContactUsPage />,
      },
      {
        path: "/request-order",
        element: <RequestOrderPage />,
      },
      {
        path: "/order",
        element: <RequestOrderPage />,
      },
      {
        path: "/prescription/history",
        element: <UploadPrescriptionPage />,
      },
      {
        path: "/prescription/upload",
        element: <UploadPrescriptionPage />,
      },
      {
        path: "/howToOrder",
        element: <HowToOrderPage />,
      },
      {
        path: "/how-it-works",
        element: <HowToOrderPage />,
      },
      {
        path: "/how-to-order",
        element: <HowToOrderPage />,
      },
      {
        path: "/category/:slug",
        element: <CategoryPage />,
      },
      {
        path: "/shop",
        element: <CategoryPage mode="all" />,
      },
      {
        path: "/career",
        element: <CareerPage />,
      },
      {
        path: "/return",
        element: <ReturnPolicyPage />,
      },
      {
        path: "/termsCondition",
        element: <TermsConditionPage />,
      },
      {
        path: "/privacy",
        element: <PrivacyPolicyPage />,
      },
      {
        path: "/profile",
        element: (
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/settings",
        element: (
          <ProtectedRoute>
            <SettingsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/login",
        element: (
          <GuestRoute>
            <LoginPage />
          </GuestRoute>
        ),
      },
      {
        path: "/forgot-password",
        element: (
          <GuestRoute>
            <ForgotPasswordPage />
          </GuestRoute>
        ),
      },
      {
        path: "/reset-password",
        element: (
          <GuestRoute>
            <ResetPasswordPage />
          </GuestRoute>
        ),
      },
      {
        path: "/register",
        element: (
          <GuestRoute>
            <RegisterPage />
          </GuestRoute>
        ),
      },
      {
        path: "/verify-otp",
        element: (
          <GuestRoute>
            <VerifyOtpPage />
          </GuestRoute>
        ),
      },
    ],
  },
  {
    path: "/admin",
    element: (
      <AdminRoute>
        <AdminLayout />
      </AdminRoute>
    ),
    children: [
      { index: true, element: <AdminDashboardPage /> },
      { path: "users", element: <AdminUsersPage /> },
      { path: "medicines", element: <AdminMedicinesPage /> },
      { path: "orders", element: <AdminOrdersPage /> },
      { path: "doctors", element: <AdminDoctorsPage /> },
      { path: "consultancies", element: <AdminConsultanciesPage /> },
    ],
  },
]);
