import { Outlet, useNavigate } from "react-router";
import { SignedIn, SignedOut } from "@clerk/clerk-react";
import { OrganizationSwitcher, UserButton, SignInButton } from "@/components/clerk";
import Metadata from "@/components/Metadata";

export default function AppLayout({
  showHeader = true,
  showFooter = true,
  children
}: {
  showHeader?: boolean;
  showFooter?: boolean;
  children?: React.ReactNode;
}) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background-darker to-background">
      <Metadata />
      {/* Header */}
      {showHeader && (
        <header className="flex justify-between items-center px-6 py-3 bg-background-darker shadow backdrop-blur-sm">
          <h1
            className="text-lg font-semibold cursor-pointer flex items-center space-x-3"
            onClick={() => {
              void navigate("/", { replace: true, preventScrollReset: true });
            }}
          >
            <img src="/logo.jpeg" alt="Logo" className="size-6" />
            <span>{import.meta.env.VITE_APP_TITLE}</span>
          </h1>
          <SignedIn>
            <div className="flex items-center justify-between space-x-4">
              <OrganizationSwitcher />
              <UserButton />
            </div>
          </SignedIn>
          <SignedOut>
            <SignInButton />
          </SignedOut>
        </header>
      )}

      {/* Main content */}
      <main className="flex-1 p-6 w-full">
        {/* Ensure outlet content stretches full height */}
        <div className="min-h-full w-full">
          <Outlet />
          {children}
        </div>
      </main>

      {/* Footer */}
      {showFooter && (
        <footer className="text-center text-sm text-muted-foreground py-4 border-t">
          &copy; 2025 {import.meta.env.VITE_APP_TITLE}. All rights reserved.
        </footer>
      )}
    </div>
  );
}
