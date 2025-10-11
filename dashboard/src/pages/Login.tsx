import { Navigate } from "react-router";
import { SignedIn, SignedOut } from "@clerk/clerk-react";
import NetworkBackground from "../components/NetworkBackground";
import { SignIn } from "../components/clerk";

export default function Login() {
  return (
    <div className="flex items-center justify-center min-h-screen font-sans relative overflow-hidden bg-[#0a0f1c]">
      <NetworkBackground />
      <SignedIn>
        <Navigate to="/" replace />
      </SignedIn>
      <SignedOut>
        <SignIn />
      </SignedOut>
    </div>
  );
}
