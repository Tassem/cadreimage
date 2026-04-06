import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { setAuthTokenGetter, useGetMe } from "@workspace/api-client-react";
import { UserProfile } from "@workspace/api-client-react";

interface AuthContextType {
  token: string | null;
  setToken: (token: string | null) => void;
  user: UserProfile | null;
  isLoading: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setTokenState] = useState<string | null>(() => localStorage.getItem("pro_token"));
  
  const setToken = (newToken: string | null) => {
    if (newToken) {
      localStorage.setItem("pro_token", newToken);
    } else {
      localStorage.removeItem("pro_token");
    }
    setTokenState(newToken);
  };

  const logout = () => {
    setToken(null);
  };

  useEffect(() => {
    setAuthTokenGetter(() => token);
  }, [token]);

  const { data: user, isLoading, isError } = useGetMe({
    query: {
      enabled: !!token,
      retry: false,
    }
  });

  useEffect(() => {
    if (isError) {
      logout();
    }
  }, [isError]);

  return (
    <AuthContext.Provider value={{ token, setToken, user: user || null, isLoading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
