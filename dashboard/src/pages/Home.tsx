import { SignInButton } from "@clerk/clerk-react";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#0f172a] to-[#1e293b] text-white">
      {/* Header */}
      <header className="flex justify-between items-center px-6 py-3 bg-gray-900/80 text-white shadow backdrop-blur-sm">
        <h1 className="text-lg font-semibold">NMS Dashboard</h1>

          <SignInButton mode="modal">
            <button className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md transition">
              Sign In
            </button>
          </SignInButton>
      </header>

      {/* Main content */}
      <main className="flex-1 p-6 w-full">
        {/* Ensure outlet content stretches full height */}
        <div className="min-h-full w-full">
          Hello World
        </div>
      </main>
    </div>
  );
}
