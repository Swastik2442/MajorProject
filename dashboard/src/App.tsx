import { createBrowserRouter, Outlet } from "react-router";
import { RouterProvider } from "react-router/dom";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ClerkProvider, SignedIn, SignedOut } from "@clerk/clerk-react";
import PrivateRoutes from "./components/PrivateRoutes";
import RootErrorBoundary from "./components/RootErrorBoundary";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import CreateClient from "./pages/CreateClient";
import Client from "./pages/Client";
import Org from "./pages/Org";
import "./globals.css";

const router = createBrowserRouter([
  {
    element: <Outlet />,
    errorElement: <RootErrorBoundary />,
    children: [
      {
        path: "/login",
        element: <Login />,
      },
      {
        path: "/",
        element: (<>
          <SignedIn><Dashboard /></SignedIn>
          <SignedOut><Home /></SignedOut>
        </>),
      },
      {
        element: <PrivateRoutes />,
        children: [
          {
            path: "/org/:orgId",
            element: <Org />,
          },
          {
            path: "/client",
            element: <CreateClient />,
          },
          {
            path: "/client/:clientId",
            element: <Client />,
          },
        ]
      },
    ]
  }
]);

const queryClient = new QueryClient();

const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
if (!CLERK_PUBLISHABLE_KEY) {
  throw new Error("Missing Clerk Publishable Key");
}

export default function App() {
  return (
    <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY} afterSignOutUrl="/login">
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </ClerkProvider>
  );
}
