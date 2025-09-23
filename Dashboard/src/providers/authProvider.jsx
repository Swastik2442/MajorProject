"use strict";

import { useContext, createContext, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

const initialState = {
  user: null,
  loginUser: () => console.error("loginUser not implemented"),
  logoutUser: () => console.error("logoutUser not implemented")
};

const USER_STORAGE_KEY = "nms.dashboard.user";
const AuthProviderContext = createContext(initialState);

/**
 * A Context Provider to handle the Authentication of the User
 * @param children Children components to the AuthProvider
 * @param props Additional props to the AuthProvider
 */
export function AuthProvider({ children, ...props }) {
  const [user, setUser] = useState(localStorage.getItem(USER_STORAGE_KEY) || null);
  const queryClient = useQueryClient();

  const handleLogin = async (data) => {
    const username = data.username, password = data.password;
    console.log(username, password);
    if (username !== "nms" || password !== "nms") {
      throw new Error("Invalid username or password!");
    }
    // const username = await loginUser(data);
    setUser(username);
    localStorage.setItem(USER_STORAGE_KEY, username);
  }

  const handleLogout = async () => {
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
    <AuthProviderContext.Provider {...props} value={value}>
      {children}
    </AuthProviderContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthProviderContext);
  if (context === undefined)
    throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
