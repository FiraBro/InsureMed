import { lazy, Suspense } from "react";
import { createBrowserRouter, Navigate, useParams } from "react-router-dom";

import UserLayout from "@/layout/UserLayout";
import AdminLayout from "@/layout/AdminLayout";
import ProtectedRoute from "@/pages/auth/form/ProtectRoutes";

const HomePage = lazy(() => import("@/pages/users/home/HomePage"));
const Dashboard = lazy(() => import("@/pages/users/dashboard/Dashboard"));
const DashboardOverview = lazy(() => import("@/pages/users/dashboard/DashboardOverview"));
const PlansPage = lazy(() => import("@/pages/users/plans/PlanPages"));
const PlanDetail = lazy(() => import("@/pages/users/plans/PlanDetail"));
const SupportPage = lazy(() => import("@/pages/users/support/SupportPage"));
const TicketDetailPage = lazy(() => import("@/pages/users/support/TicketConversation"));
const AuthPage = lazy(() => import("@/pages/auth/AuthPage"));
const ProfilePage = lazy(() => import("@/pages/users/profile/ProfilePage"));
const ApplyPlan = lazy(() => import("@/pages/users/plans/ApplyPlan"));
const UserApplications = lazy(() => import("@/pages/users/applications/UserApplications"));
const ClaimSubmissionForm = lazy(() => import("@/pages/users/claim/ClaimsSubmition"));
const MyClaims = lazy(() => import("@/pages/users/claim/MyClaims"));
const MyPolicies = lazy(() => import("@/pages/users/policy/MyPolicy"));
const NotificationCenter = lazy(() => import("@/pages/users/notification/Notification"));
const AdminDashboard = lazy(() => import("@/pages/admin/dashboard/AdminDashboard"));
const AdminPolicyApplications = lazy(() => import("@/pages/admin/applications/AdminPolicyApplications"));
const ViewPolicyApplication = lazy(() => import("@/pages/admin/policy/ViewPolicyApplication"));
const PolicyList = lazy(() => import("@/pages/admin/policy/PolicyList"));
const AdminUsersPage = lazy(() => import("@/pages/admin/users/AdminUserPages"));
const AdminClaimsManagement = lazy(() => import("@/pages/admin/claim/ClaimsManagement"));
const CreatePlanPage = lazy(() => import("@/pages/admin/plan/CreatePlan"));
const AdminPlanListPage = lazy(() => import("@/pages/admin/plan/ListAllPlan"));
const AdminSupportDashboard = lazy(() => import("@/pages/admin/ticket/AllTicket"));
const AdminLiveChat = lazy(() => import("@/pages/admin/support/AdminLiveChat"));
const Settings = lazy(() => import("@/pages/admin/support/Setting"));
const NotFoundPage = lazy(() => import("@/components/common/NotFoundPage"));

function LegacyApplyRedirect() {
  const { id } = useParams();
  return <Navigate to={`/dashboard/apply/${id}`} replace />;
}

function RouteFallback() {
  return <div className="flex min-h-[40vh] items-center justify-center text-slate-500" role="status">Loading…</div>;
}

function withSuspense(element) {
  return <Suspense fallback={<RouteFallback />}>{element}</Suspense>;
}

export const router = createBrowserRouter([
  {
    path: "/",
    element: <UserLayout />,
    children: [
      { index: true, element: withSuspense(<HomePage />) },
      { path: "*", element: withSuspense(<NotFoundPage />) },
    ],
  },
  {
    path: "/dashboard",
    element: <ProtectedRoute>{withSuspense(<Dashboard />)}</ProtectedRoute>,
    children: [
      { index: true, element: withSuspense(<DashboardOverview />) },
      { path: "plans", element: withSuspense(<PlansPage />) },
      { path: "plans/:id", element: withSuspense(<PlanDetail />) },
      { path: "apply/:id", element: withSuspense(<ApplyPlan />) },
      { path: "my-policies", element: withSuspense(<MyPolicies />) },
      { path: "show/claims", element: withSuspense(<MyClaims />) },
      { path: "claims/new", element: withSuspense(<ClaimSubmissionForm />) },
      { path: "my-applications", element: withSuspense(<UserApplications />) },
      { path: "notifications", element: withSuspense(<NotificationCenter />) },
      { path: "profile", element: withSuspense(<ProfilePage />) },
      { path: "support", element: withSuspense(<SupportPage />) },
      { path: "support/tickets/:id", element: withSuspense(<TicketDetailPage />) },
      { path: "*", element: withSuspense(<NotFoundPage />) },
    ],
  },
  {
    path: "/admin",
    element: <ProtectedRoute isAdminRequired>{withSuspense(<AdminLayout />)}</ProtectedRoute>,
    children: [
      { index: true, element: <Navigate to="dashboard" replace /> },
      { path: "dashboard", element: withSuspense(<AdminDashboard />) },
      { path: "applications", element: withSuspense(<AdminPolicyApplications />) },
      { path: "all-policies", element: withSuspense(<PolicyList />) },
      { path: "policies/details", element: withSuspense(<ViewPolicyApplication />) },
      { path: "users", element: withSuspense(<AdminUsersPage />) },
      { path: "all-claims", element: withSuspense(<AdminClaimsManagement />) },
      { path: "create/plan", element: withSuspense(<CreatePlanPage />) },
      { path: "all-plans", element: withSuspense(<AdminPlanListPage />) },
      { path: "support/tickets", element: withSuspense(<AdminSupportDashboard />) },
      { path: "tickets/:id", element: withSuspense(<AdminLiveChat />) },
      { path: "settings", element: withSuspense(<Settings />) },
      { path: "*", element: withSuspense(<NotFoundPage />) },
    ],
  },
  { path: "/auth", element: withSuspense(<AuthPage />) },
  { path: "/plans", element: <Navigate to="/dashboard/plans" replace /> },
  { path: "/plans/:id", element: <Navigate to="/dashboard/plans" replace /> },
  { path: "/apply/:id", element: <LegacyApplyRedirect /> },
  { path: "/support", element: <Navigate to="/dashboard/support" replace /> },
  { path: "*", element: withSuspense(<NotFoundPage />) },
]);
