import { useContext, createContext } from "react";
import { useUser } from "@clerk/clerk-react";
import { useSse } from "@/hooks/sse";
import { sseFetchWithCredentials } from "@/utils/sseFetchWithCredentials";

const sseUrl = (import.meta.env.VITE_API_URL || "/api") + "/sse";

interface UserEventsProviderState {
  connectionState: "CONNECTING" | "OPEN" | "CLOSED";
  connectionError: Event | null;
  addListener: (eventName: string, handler: (data: unknown) => void) => ((() => void) | undefined);
  getEventData: (eventName: string) => unknown;
  closeConnection?: () => void;
}

const initialState: UserEventsProviderState = {
  connectionState: "CLOSED",
  connectionError: null,
  addListener: () => () => undefined,
  getEventData: () => "",
  closeConnection: () => undefined
};

const UserEventsProviderContext = createContext<UserEventsProviderState>(initialState);

/**
 * A Context Provider to handle the User Events from the API via SSE.
 * @param children Children components to the UserEventsProvider
 * @param props Additional props to the UserEventsProvider
 */
export function UserEventsProvider({ children, ...props }: { children: React.ReactNode }) {
  const { isSignedIn } = useUser();
  const {
    connectionState,
    connectionError,
    addListener,
    getEventData,
    closeConnection,
  } = useSse(sseUrl, {
    disabled: !isSignedIn,
    fetch: sseFetchWithCredentials
  });

  const value: UserEventsProviderState = {
    connectionState,
    connectionError,
    addListener,
    getEventData,
    closeConnection
  };

  return (
    <UserEventsProviderContext.Provider {...props} value={value}>
      {children}
    </UserEventsProviderContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useUserEvents = () => {
  const context = useContext(UserEventsProviderContext);
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (context === undefined)
    throw new Error("useUserEvents must be used within a UserEventsProvider");
  return context;
};
