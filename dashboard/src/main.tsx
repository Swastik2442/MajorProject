import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ClerkProvider } from '@clerk/clerk-react';
import App from './App.tsx';

// ✅ Import your Clerk Publishable Key from environment variable
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

// ✅ Ensure key is available to avoid runtime errors
if (!PUBLISHABLE_KEY) {
  throw new Error('❌ Missing Clerk Publishable Key. Please add VITE_CLERK_PUBLISHABLE_KEY in your .env file.');
}

// ✅ Wrap entire app with ClerkProvider
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
      <App />
    </ClerkProvider>
  </StrictMode>,
);
