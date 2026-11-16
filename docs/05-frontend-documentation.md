# 05. Frontend Documentation

## 1. Overview & Architecture

The **InsureMed** frontend is built as a single-page application (SPA) using **React 19.1.0** and bundled with **Vite 6.3.5**. It delivers a responsive, accessible user experience for policyholders and insurance administrators alike.

### Core Architectural Pillars
- **Framework & Bundler:** React 19 utilizing modern hooks, Suspense boundaries, and functional components, bundled via Vite with Hot Module Replacement (HMR).
- **Styling Engine:** **Tailwind CSS v4** coupled with `@tailwindcss/vite` and `lucide-react` icons.
- **Component Primitives:** Unstyled, accessible UI components from Radix UI primitives (`@radix-ui/react-dialog`, `@radix-ui/react-select`, `@radix-ui/react-tabs`, etc.).
- **Client State Management:** Lightweight, decoupled stores built with **Zustand 5.0.9**.
- **Server State & Caching:** **TanStack React Query v5** for asynchronous query caching, deduplication, and cache invalidation.
- **Routing & Code-Splitting:** **React Router v7** (`createBrowserRouter`) leveraging `React.lazy()` for dynamic route-based code-splitting.

---

## 2. Directory Structure

```text
Clients/src/
├── App.jsx                     # Top-level application shell & auth initializer
├── main.jsx                    # Vite entry point (mounts React DOM & Providers)
├── index.css                   # Tailwind CSS v4 directives & theme variables
├── components/                 # Reusable UI building blocks
│   ├── common/                 # BrandLogo, NotFoundPage, Navbar, Footer
│   ├── layout/                 # Sidebar, Header, PageWrapper
│   ├── modal/                  # Reusable confirmation and detail dialogs
│   ├── ui/                     # Radix UI styled wrappers (Button, Input, Card, Badge)
│   └── users/                  # User portal components (PlanCard, ClaimCard)
├── contexts/                   # React context providers
├── data/                       # Static mock data and configuration constants
├── hooks/                      # Custom React hooks (useAdmin, useAuth, useDebounce)
├── layout/                     # Route layout shells
│   ├── AdminLayout.jsx         # Administrative dashboard layout with sidebar & topbar
│   └── UserLayout.jsx          # Public/customer layout with header & footer
├── lib/                        # Third-party wrappers (axios, utils, tailwind helpers)
├── pages/                      # Page components grouped by domain
│   ├── admin/                  # Administrative management pages
│   │   ├── applications/       # AdminPolicyApplications.jsx
│   │   ├── claim/              # ClaimsManagement.jsx
│   │   ├── dashboard/          # AdminDashboard.jsx
│   │   ├── docs/               # AdminDocs.jsx
│   │   ├── plan/               # CreatePlan.jsx, ListAllPlan.jsx
│   │   ├── policy/             # PolicyList.jsx, ViewPolicyApplication.jsx
│   │   ├── support/            # AdminLiveChat.jsx, Setting.jsx
│   │   ├── ticket/             # AllTicket.jsx
│   │   └── users/              # AdminUserPages.jsx
│   ├── auth/                   # Authentication pages
│   │   ├── AuthPage.jsx        # Login/Register container page
│   │   └── form/               # AuthForm.jsx, ProtectRoutes.jsx
│   └── users/                  # Customer portal pages
│       ├── applications/       # UserApplications.jsx
│       ├── claim/              # ClaimsSubmition.jsx, MyClaims.jsx
│       ├── dashboard/          # Dashboard.jsx, DashboardOverview.jsx
│       ├── home/               # HomePage.jsx (Landing page)
│       ├── notification/       # Notification.jsx
│       ├── plans/              # PlanPages.jsx, PlanDetail.jsx, ApplyPlan.jsx
│       ├── policy/             # MyPolicy.jsx
│       ├── profile/            # ProfilePage.jsx
│       └── support/            # SupportPage.jsx, TicketConversation.jsx
├── routers/                    # Router configuration
│   └── index.jsx               # createBrowserRouter route definitions
├── schemas/                    # Zod validation schemas (forms & inputs)
├── services/                   # Axios API service wrappers
│   ├── adminService.js         # Settings, analytics, global search
│   ├── applicationService.js   # Application submission & review
│   ├── authService.js          # Login, register, logout, me, password
│   ├── chatService.js          # AI conversational assistant
│   ├── claimService.js         # Claim filing, status updates
│   ├── dashboardService.js     # User & admin dashboard metrics
│   ├── notificationService.js  # User notifications
│   ├── planService.js          # Plan catalog & risk score preview
│   ├── policyService.js        # Policy list, renewals, cancellations
│   ├── tickerService.js        # Support tickets & messaging
│   └── userService.js          # Profile updates & admin user management
├── stores/                     # Zustand state management stores
│   ├── authStore.js            # User session, tokens, role tracking
│   ├── notificationStore.js    # Unread alerts & polling state
│   └── uiStore.js              # Theme, sidebar collapse, modal toggles
└── utils/                      # Helper formatting functions (currency, dates)
```

---

## 3. Application Lifecycle & Entry Point

### Entry Flow (`main.jsx` → `App.jsx`)
1. **`main.jsx`:** Mounts the root React DOM node into `index.html`. Wraps the tree with TanStack Query's `QueryClientProvider` and `ToastContainer` for toast alerts.
2. **`App.jsx`:** Initializes authentication state upon load:
   - Calls `authStore.getState().checkAuth()`.
   - Sends `GET /api/v1/auth/me` to determine if a valid session cookie or token exists.
   - Updates `authStore` with user profile and role (`customer`, `admin`, `agent`).
   - Renders the `RouterProvider` once initialization finishes.

```jsx
// Simplified App.jsx Initialization
export default function App() {
  const { checkAuth, isCheckingAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isCheckingAuth) {
    return <FullScreenLoader message="Initializing InsureMed..." />;
  }

  return <RouterProvider router={router} />;
}
```

---

## 4. Routing & Route Protection

The application defines client routes using `createBrowserRouter` in `Clients/src/routers/index.jsx`.

### Route Categories

1. **Public Routes (No Authentication Required):**
   - `/`: Landing page (`HomePage.jsx`) showcasing insurance plans and features.
   - `/auth`: Unified authentication page (`AuthPage.jsx` hosting `AuthForm.jsx`).
   - `*`: 404 handler (`NotFoundPage.jsx`).

2. **Customer Portal Routes (`ProtectedRoute` required):**
   - Mounted under `/dashboard`:
     - `/dashboard`: Metrics overview (`DashboardOverview.jsx`).
     - `/dashboard/plans`: Plan catalog (`PlansPage.jsx`).
     - `/dashboard/plans/:id`: Plan details & benefits (`PlanDetail.jsx`).
     - `/dashboard/apply/:id`: Multi-step policy application (`ApplyPlan.jsx`).
     - `/dashboard/my-policies`: User active and expired policies (`MyPolicies.jsx`).
     - `/dashboard/show/claims`: Submitted claims list (`MyClaims.jsx`).
     - `/dashboard/claims/new`: Claim submission form (`ClaimSubmissionForm.jsx`).
     - `/dashboard/my-applications`: Pending applications (`UserApplications.jsx`).
     - `/dashboard/notifications`: Notification center (`NotificationCenter.jsx`).
     - `/dashboard/profile`: User account profile (`ProfilePage.jsx`).
     - `/dashboard/support`: Support tickets & FAQs (`SupportPage.jsx`).
     - `/dashboard/support/tickets/:id`: Threaded ticket messaging (`TicketDetailPage.jsx`).

3. **Admin Portal Routes (`ProtectedRoute isAdminRequired` required):**
   - Mounted under `/admin`:
     - `/admin/dashboard`: Executive KPI metrics and financial summaries.
     - `/admin/applications`: Policy applications queue (`AdminPolicyApplications.jsx`).
     - `/admin/all-policies`: All system policies (`PolicyList.jsx`).
     - `/admin/policies/details`: Deep policy inspector (`ViewPolicyApplication.jsx`).
     - `/admin/users`: User management (`AdminUsersPage.jsx`).
     - `/admin/all-claims`: Claims adjudication queue (`AdminClaimsManagement.jsx`).
     - `/admin/create/plan`: New insurance plan builder (`CreatePlanPage.jsx`).
     - `/admin/all-plans`: Plan catalog management (`AdminPlanListPage.jsx`).
     - `/admin/support/tickets`: All support tickets (`AdminSupportDashboard.jsx`).
     - `/admin/tickets/:id`: Support ticket conversation viewer (`AdminLiveChat.jsx`).
     - `/admin/settings`: Global system settings (`Settings.jsx`).
     - `/admin/docs`: Integrated system documentation browser (`AdminDocs.jsx`).

### ProtectedRoute Implementation (`Clients/src/pages/auth/form/ProtectRoutes.jsx`)
`ProtectedRoute` checks two conditions:
- If `isAuthenticated` is false, redirects to `/auth` with a return state.
- If `isAdminRequired` is true and `user.role !== "admin"`, redirects unauthorized users to `/dashboard`.

---

## 5. State Management

### A. Authentication Store (`Clients/src/stores/authStore.js`)
Manages client session credentials using Zustand:
- `user`: Holds the authenticated user object (`_id`, `fullName`, `email`, `role`, `membershipTier`).
- `token`: Stored JWT token (also mirrored in `localStorage` for fallback).
- `isAuthenticated`: Boolean status flag.
- `setAuth(user, token)`: Commits login data to memory and storage.
- `logout()`: Clears credentials and calls `POST /api/v1/auth/logout`.
- `checkAuth()`: Executes `GET /api/v1/auth/me` on application boot.

### B. Notification Store (`Clients/src/stores/notificationStore.js`)
Tracks real-time system alerts:
- `notifications`: Array of active notifications.
- `unreadCount`: Badge count displayed on the header bell icon.
- `setNotifications()`, `markRead()`: Updates notification read states.

### C. UI Store (`Clients/src/stores/uiStore.js`)
Controls UI layout preferences:
- `sidebarOpen`: Controls mobile and desktop sidebar collapse states.
- `toggleSidebar()`: Action toggling navigation visibility.

---

## 6. API Communication Layer

API calls are encapsulated inside `Clients/src/services/` using an Axios client:

```javascript
// Base Axios Configuration (Clients/src/lib/axios.js)
import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3001/api/v1",
  withCredentials: true, // Sends HTTP-only session cookies
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor: Injects Authorization Header if Token Exists
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;
```

### Key Service Modules
- **`authService.js`:** Methods for `login(credentials)`, `register(userData)`, `logout()`, `getMe()`, `updateProfile()`.
- **`planService.js`:** `getPlans(filters)`, `getPlanById(id)`, `previewRiskScore(planData)`, `createPlan(data)`.
- **`claimService.js`:** `createClaim(formData)` (supports `multipart/form-data`), `getMyClaims()`, `updateClaimStatus(id, status)`.
- **`applicationService.js`:** `submitApplication(formData)` (multi-file document uploads), `getMyApplications()`, `approveApplication(id)`, `rejectApplication(id)`.
- **`tickerService.js`:** `createTicket(data)`, `getMyTickets()`, `getTicketById(id)`, `addReply(id, message)`.
- **`chatService.js`:** `sendChatMessage(message, userPlanTier, conversationHistory)`.

---

## 7. Form Handling & UI Patterns

- **Multi-Step Registration (`AuthForm.jsx`):** Employs a 3-step wizard (Account Details → Personal Info → Address Details). Built with robust `try/finally` logic to prevent infinite button loading states upon server validation errors.
- **Multipart Upload Forms:** Application and claim forms utilize HTML5 `FormData` objects passed to Axios with automatic `Content-Type: multipart/form-data` boundary injection.
- **Dynamic Charting:** Dashboard metrics use **Recharts** (`Clients/src/pages/admin/dashboard/AdminDashboard.jsx`) to render responsive monthly revenue and claim trend graphs.
