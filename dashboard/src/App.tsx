import { createBrowserRouter } from "react-router";
import { RouterProvider } from "react-router/dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ClerkProvider, SignedIn, SignedOut } from "@clerk/clerk-react";

import PrivateRoutes from "./components/PrivateRoutes";
import RootErrorBoundary from "./components/RootErrorBoundary";
import AppLayout from "./layouts/AppLayout";

import Home from "./pages/Home";
import About from "./pages/About"; // ✅ NEW
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import NewClient from "./pages/NewClient";

import "./globals.css";

const router = createBrowserRouter([
  // === Public routes (signed out users) ===
  {
    path: "/login",
    element: <Login />,
    errorElement: <RootErrorBoundary />,
  },
  {
    path: "/",
    element: (
      <>
        <SignedIn>
          <AppLayout>
            <Dashboard />
          </AppLayout>
        </SignedIn>

        <SignedOut>
          <Home />
        </SignedOut>
      </>
    ),
    errorElement: <RootErrorBoundary />,
  },
  {
    path: "/about", // ✅ New public About page
    element: (
      <SignedOut>
        <About />
      </SignedOut>
    ),
    errorElement: <RootErrorBoundary />,
  },

  // === Authenticated routes (protected) ===
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
        <RouterProvider router={router} />
      </QueryClientProvider>
    </ClerkProvider>
  );
}
