import React, { lazy, Suspense } from "react";
import { createBrowserRouter } from "react-router-dom";

/* Layouts */
import UserLayout from "@/layout/UserLayout";
import AdminLayout from "@/layout/AdminLayout";
import SupportWrapper from "@/components/layout/SupportWrapper"; // The new wrapper we discussed

/* Guards */
import ProtectedRoute from "@/pages/auth/form/ProtectRoutes";

/* Standard Pages */
import CreatePlanPage from "@/pages/admin/plan/CreatePlan";
import Settings from "@/pages/admin/support/Setting";
import AdminPlanListPage from "@/pages/admin/plan/ListAllPlan";
import PolicyList from "@/pages/admin/policy/PolicyList";
import AdminSupportDashboard from "@/pages/admin/ticket/AllTicket";

/* Specialized Chat Pages (Standalone) */
import TicketDetailPage from "@/pages/users/support/TicketConversation";
import AdminLiveChat from "@/pages/admin/support/AdminLiveChat";
import { PageTransition } from "@/components/common/PageTransition";
import NotificationCenter from "@/pages/users/notification/Notification";

/* Lazy Loaded Components */
const HomePage = lazy(() => import("@/pages/users/home/HomePage"));
const PlansPage = lazy(() => import("@/pages/users/plans/PlanPages"));
const PlanDetail = lazy(() => import("@/pages/users/plans/PlanDetail"));
const SupportPage = lazy(() => import("@/pages/users/support/SupportPage"));
const AuthPage = lazy(() => import("@/pages/auth/AuthPage"));
const ProfilePage = lazy(() => import("@/pages/users/profile/ProfilePage"));
const ApplyPlan = lazy(() => import("@/pages/users/plans/ApplyPlan"));
const UserApplications = lazy(
  () => import("@/pages/users/applications/UserApplications"),
);
const ClaimSubmissionForm = lazy(
  () => import("@/pages/users/claim/ClaimsSubmition"),
);
const MyClaims = lazy(() => import("@/pages/users/claim/MyClaims"));
const MyPolicies = lazy(() => import("@/pages/users/policy/MyPolicy"));
const AdminDashboard = lazy(
  () => import("@/pages/admin/dashboard/AdminDashboard"),
);
const AdminPolicyApplications = lazy(
  () => import("@/pages/admin/applications/AdminPolicyApplications"),
);
const ViewPolicyApplication = lazy(
  () => import("@/pages/admin/policy/ViewPolicyApplication"),
);
const AdminUsersPage = lazy(() => import("@/pages/admin/users/AdminUserPages"));
const AdminClaimsManagement = lazy(
  () => import("@/pages/admin/claim/ClaimsManagement"),
);
const NotFoundPage = lazy(() => import("@/components/common/NotFoundPage"));

export const router = createBrowserRouter([
  /* 1. MAIN USER EXPERIENCE (With Navbar/Footer) */
  {
    path: "/",
    element: <UserLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "plans", element: <PlansPage /> },
      { path: "plans/:id", element: <PlanDetail /> },
      { path: "notifications", element: <NotificationCenter /> },
      {
        path: "profile",
        element: (
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        ),
      },
      {
        path: "apply/:id",
        element: (
          <ProtectedRoute>
            <ApplyPlan />
          </ProtectedRoute>
        ),
      },
      {
        path: "my-applications",
        element: (
          <ProtectedRoute>
            <UserApplications />
          </ProtectedRoute>
        ),
      },
      {
        path: "claims/new",
        element: (
          <ProtectedRoute>
            <ClaimSubmissionForm />
          </ProtectedRoute>
        ),
      },
      {
        path: "show/claims",
        element: (
          <ProtectedRoute>
            <MyClaims />
          </ProtectedRoute>
        ),
      },
      {
        path: "my-policies",
        element: (
          <ProtectedRoute>
            <MyPolicies />
          </ProtectedRoute>
        ),
      },
      { path: "*", element: <NotFoundPage /> },
    ],
  },

  /* 2. STANDALONE USER SUPPORT (Wrapped with Chatbot) 
     This stays outside UserLayout to keep it full-screen.
  */
  {
    path: "/support",
    element: (
      <ProtectedRoute>
        <SupportWrapper />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: (
          <PageTransition>
            <SupportPage />
          </PageTransition>
        ),
      },
      {
        path: "tickets/:id",
        element: (
          <PageTransition>
            <TicketDetailPage />
          </PageTransition>
        ),
      },
    ],
  },

  /* 3. MAIN ADMIN DASHBOARD (With Sidebar) */
  {
    path: "/admin",
    element: (
      <ProtectedRoute isAdminRequired={true}>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      { path: "dashboard", element: <AdminDashboard /> },
      { path: "applications", element: <AdminPolicyApplications /> },
      { path: "all-policies", element: <PolicyList /> },
      { path: "policies/details", element: <ViewPolicyApplication /> },
      { path: "users", element: <AdminUsersPage /> },
      { path: "all-claims", element: <AdminClaimsManagement /> },
      { path: "create/plan", element: <CreatePlanPage /> },
      { path: "all-plans", element: <AdminPlanListPage /> },
      { path: "support/tickets", element: <AdminSupportDashboard /> },
      { path: "settings", element: <Settings /> },
    ],
  },

  /* 4. STANDALONE ADMIN LIVE CHAT */
  {
    path: "/admin/tickets/:id",
    element: (
      <ProtectedRoute isAdminRequired={true}>
        <AdminLiveChat />
      </ProtectedRoute>
    ),
  },

  /* 5. AUTHENTICATION */
  { path: "/auth", element: <AuthPage /> },
]);
