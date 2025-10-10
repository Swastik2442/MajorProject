import { createBrowserRouter } from "react-router";
import { RouterProvider } from "react-router/dom";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ClerkProvider, SignedIn, SignedOut } from "@clerk/clerk-react";
import RootErrorBoundary from "./components/RootErrorBoundary";
import AppLayout from "./layouts/AppLayout";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import "./globals.css";

const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,
    errorElement: <RootErrorBoundary />,
  },
  {
    element: <AppLayout />,
    errorElement: <RootErrorBoundary />,
    children: [
      {
        path: "/",
        element: (<>
          <SignedIn><Dashboard /></SignedIn>
          <SignedOut><Home /></SignedOut>
        </>),
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
    <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY} afterSignOutUrl="/">
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </ClerkProvider>
  );
}
