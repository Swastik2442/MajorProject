import { Outlet, Navigate } from 'react-router';
import { SignedIn, SignedOut } from '@clerk/clerk-react';

export default function PrivateRoutes() {
  return (
    <>
      <SignedIn>
        <Outlet />
      </SignedIn>
      <SignedOut>
        <Navigate to="/login" replace />
      </SignedOut>
    </>
  );
}
