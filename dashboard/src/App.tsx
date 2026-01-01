import { lazy } from "react";
import { createBrowserRouter } from "react-router";
import { RouterProvider } from "react-router/dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ClerkProvider, SignedIn, SignedOut } from "@clerk/clerk-react";

import { UserEventsProvider } from "@/contexts/userEvents";
const PrivateRoutes = lazy(() => import("@/components/PrivateRoutes"));
const RootErrorBoundary = lazy(() => import("@/components/RootErrorBoundary"));
const AppLayout = lazy(() => import("@/layouts/AppLayout"));

const Dashboard = lazy(() => import("@/pages/Dashboard"));
const Home = lazy(() => import("@/pages/Home"));
const About = lazy(() => import("@/pages/About"));
const Login = lazy(() => import("@/pages/Login"));
const NewClient = lazy(() => import("@/pages/NewClient"));

import "@/globals.css";

const router = createBrowserRouter([
  // === Public routes ===
  {
    path: "/login",
    element: <Login />,
    errorElement: <RootErrorBoundary />,
  },
  {
    path: "/about",
    element: <About />,
    errorElement: <RootErrorBoundary />,
  },

  // === Root route (Home / Dashboard) ===
  {
    path: "/",
    element: (
      <>
        <SignedIn>
          <Dashboard />
        </SignedIn>
        <SignedOut>
          <Home />
        </SignedOut>
      </>
    ),
    errorElement: <RootErrorBoundary />,
  },

  // === Authenticated routes (inside layout) ===
  {
    element: <AppLayout />,
    errorElement: <RootErrorBoundary />,
    children: [
      {
        element: <PrivateRoutes />,
        children: [
          {
            path: "/client/new",
            element: <NewClient />,
          },
        ],
      },
    ],
  },
]);

const queryClient = new QueryClient();

const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
if (!CLERK_PUBLISHABLE_KEY) {
  throw new Error("Missing Clerk Publishable Key");
}

export default function App() {
  return (
    <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY} afterSignOutUrl="/">
      <QueryClientProvider client={queryClient}>
        <UserEventsProvider>
          <RouterProvider router={router} />
        </UserEventsProvider>
      </QueryClientProvider>
    </ClerkProvider>
  );
}
