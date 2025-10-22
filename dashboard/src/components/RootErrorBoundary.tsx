// src/components/RootErrorBoundary.tsx
import { useRouteError, isRouteErrorResponse, useNavigate } from "react-router";

export default function RootErrorBoundary() {
  const error = useRouteError();
  const navigate = useNavigate();

  const onBack = () => {
    try {
      void navigate(-1);
    } catch {
      // fallback
      window.history.back();
    }
  };

  const onRetry = () => {
    // reload page to re-run loaders / component code
    window.location.reload();
  };

  // Render structured response (thrown via json / data)
  if (isRouteErrorResponse(error)) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-background-darker via-background to-background-darker">
        <div className="p-8 rounded-2xl shadow-lg border bg-background/50 backdrop-blur-lg max-w-2xl text-center">
          <h1 className="text-4xl font-bold mb-3">
            {error.status} {error.statusText}
          </h1>
          <p className="text-lg opacity-80 mb-6">{error.data ?? ""}</p>

          <div className="flex items-center justify-center gap-3">
            <button
              onClick={onBack}
              className="px-4 py-2 rounded-md border bg-background hover:brightness-110 transition"
            >
              Go Back
            </button>

            <button
              onClick={onRetry}
              className="px-4 py-2 rounded-md text-primary-foreground bg-primary hover:bg-primary/90 transition"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Render thrown Error (stack shown in dev)
  if (error instanceof Error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-background-darker via-background to-background-darker">
        <div className="p-8 rounded-2xl shadow-lg border bg-background/50 backdrop-blur-lg max-w-3xl w-full">
          <h1 className="text-3xl font-bold mb-2">Unexpected Error</h1>
          <p className="text-lg opacity-80 mb-4">{error.message}</p>

          <details className="bg-background-darker/60 p-3 rounded-md text-left text-sm overflow-x-auto max-h-48">
            <summary className="cursor-pointer">Stack trace</summary>
            <pre className="whitespace-pre-wrap mt-2">{error.stack}</pre>
          </details>

          <div className="mt-6 flex items-center gap-3">
            <button
              onClick={onBack}
              className="px-4 py-2 rounded-md border bg-background hover:brightness-110 transition"
            >
              Go Back
            </button>

            <button
              onClick={onRetry}
              className="px-4 py-2 rounded-md text-primary-foreground bg-primary hover:bg-primary/90 transition"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Unknown thrown value
  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-br from-background-darker via-background to-background-darker">
      <div className="p-8 rounded-2xl shadow-lg border bg-background/50 backdrop-blur-lg text-center">
        <h1 className="text-3xl font-bold">Unknown Error</h1>
        <div className="mt-4 flex items-center gap-3 justify-center">
          <button
            onClick={onBack}
            className="px-4 py-2 rounded-md border bg-background hover:brightness-110 transition"
          >
            Go Back
          </button>

          <button
            onClick={onRetry}
            className="px-4 py-2 rounded-md text-primary-foreground bg-primary hover:bg-primary/90 transition"
          >
            Retry
          </button>
        </div>
      </div>
    </div>
  );
}
