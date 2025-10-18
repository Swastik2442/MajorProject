import { Outlet } from "react-router";
import { SignedIn, SignedOut } from "@clerk/clerk-react";
import { OrganizationSwitcher, UserButton, SignInButton } from "../components/clerk";

export default function AppLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background-darker to-background">
      {/* Header */}
      <header className="flex justify-between items-center px-6 py-3 bg-background-darker shadow backdrop-blur-sm">
        <h1 className="text-lg font-semibold">NMS</h1>
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

      {/* Main content */}
      <main className="flex-1 p-6 w-full">
        {/* Ensure outlet content stretches full height */}
        <div className="min-h-full w-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
