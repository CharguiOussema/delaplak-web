import React, { createContext, useState, useEffect, type ReactNode } from "react";
import { useQuery } from "react-query";
import axios from "axios";
import { authService } from "../services/AuthService";
import { apiService } from "../services/api";
import { queryKeys, queryClientManager } from "../services/QueryClientManager";
import type { User } from "../models/entities";

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  token: string | null;
  login: (accessToken: string, user?: User) => void;
  logout: () => Promise<void>;
  refetchUser: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("accessToken"));
  const isAuthenticated = !!token;

  const {
    data: user,
    isLoading: userLoading,
    refetch: refetchUser,
    error: userError,
  } = useQuery<User>({
    queryKey: [queryKeys.CURRENT_USER],
    queryFn: async () => authService.me(),
    enabled: isAuthenticated,
    retry: false,
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    if (userError && axios.isAxiosError(userError) && userError.response?.status === 401) {
      logout();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userError]);

  // Keep local `token` state in sync if another tab/interceptor rewrote localStorage
  // (e.g. the 401-refresh flow in services/api.ts silently rotates the access token).
  useEffect(() => {
    const onStorage = () => setToken(localStorage.getItem("accessToken"));
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const login = (accessToken: string) => {
    apiService.setToken(accessToken);
    setToken(accessToken);
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch {
      // best-effort — clear local session regardless of server response
    }
    apiService.clearToken();
    setToken(null);
    queryClientManager.clear();
  };

  const isLoading = isAuthenticated && userLoading;

  const value: AuthContextType = {
    isAuthenticated,
    isLoading,
    user: user || null,
    token,
    login,
    logout,
    refetchUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
