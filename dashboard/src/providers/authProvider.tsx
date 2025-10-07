import { useContext, createContext, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";


interface AuthProviderState {
  /** Username of the User */
  user: string | null;
  /** Function to Login a User */
  loginUser: (data: { username: string; password: string; }) => Promise<void>;
  /** Function to Logout the User */
  logoutUser: () => Promise<void>;
}

const initialState: AuthProviderState = {
  user: null,
  loginUser: async () => {
    console.error("loginUser not implemented");
    return Promise.resolve();
  },
  logoutUser: async () => {
    console.error("logoutUser not implemented");
    return Promise.resolve();
  }
};

const USER_STORAGE_KEY = "nms.dashboard.user";
const AuthProviderContext = createContext<AuthProviderState>(initialState);

/**
 * A Context Provider to handle the Authentication of the User
 * @param children Children components to the AuthProvider
 * @param props Additional props to the AuthProvider
 */
export function AuthProvider({ children }: { children: React.ReactNode; }) {
  const [user, setUser] = useState<AuthProviderState['user']>(localStorage.getItem(USER_STORAGE_KEY) ?? null);
  const queryClient = useQueryClient();

  // eslint-disable-next-line @typescript-eslint/require-await
  const handleLogin: AuthProviderState['loginUser'] = async (data) => {
    const username = data.username, password = data.password;
    console.log(username, password);
    if (username !== "nms" || password !== "nms") {
      throw new Error("Invalid username or password!");
    }
    // const username = await loginUser(data);
    setUser(username);
    localStorage.setItem(USER_STORAGE_KEY, username);
  }

  const handleLogout: AuthProviderState['logoutUser'] = async () => {
    setUser(null);
    localStorage.removeItem(USER_STORAGE_KEY);
    await queryClient.invalidateQueries();
    // await logoutUser();
  }

  const value = {
    user: user,
    loginUser: handleLogin,
    logoutUser: handleLogout
  };

  return (
    <AuthProviderContext.Provider value={value}>
      {children}
    </AuthProviderContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthProviderContext);
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (context === undefined)
    throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
