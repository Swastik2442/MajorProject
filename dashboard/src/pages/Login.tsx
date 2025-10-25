import { Navigate } from "react-router";
import { SignedIn, SignedOut } from "@clerk/clerk-react";
import NetworkBackground from "../components/NetworkBackground";
import { SignIn } from "../components/clerk";
import Metadata from "@/components/Metadata";

export default function Login() {
  return (
    <div className="flex items-center justify-center min-h-screen font-sans relative overflow-hidden">
      <Metadata title={`Login | ${import.meta.env.VITE_APP_TITLE}`} />
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
