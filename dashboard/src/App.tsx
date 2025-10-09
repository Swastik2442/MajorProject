import { createBrowserRouter } from "react-router";
import { RouterProvider } from "react-router/dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
  RedirectToSignIn,
} from "@clerk/clerk-react";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import "./globals.css";

// ✅ Define app routes
const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/",
    element: (
      <>
        <SignedIn>
          <Dashboard />
        </SignedIn>
        <SignedOut>
          <RedirectToSignIn />
        </SignedOut>
      </>
    ),
  },
]);

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      {/* ✅ Simple responsive header with Clerk components */}
      <header className="flex justify-between items-center px-6 py-3 bg-gray-900 text-white shadow">
        <h1 className="text-lg font-semibold">NMS Dashboard</h1>

        <div>
          <SignedOut>
            <SignInButton mode="modal">
              <button className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md transition">
                Sign In
              </button>
            </SignInButton>
          </SignedOut>

          <SignedIn>
            <UserButton afterSignOutUrl="/login" />
          </SignedIn>
        </div>
      </header>

      {/* ✅ Router + QueryClient context */}
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}
