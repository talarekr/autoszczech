import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";

import { api } from "../api/client";
import type { User } from "../types";

type AuthContextType = {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: { email: string; password: string; firstName: string; lastName: string }) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const raw = await AsyncStorage.getItem("autoszczech_auth");
      if (raw) {
        const parsed = JSON.parse(raw) as { user: User; token: string };
        setUser(parsed.user);
        setToken(parsed.token);
      }
      setLoading(false);
    })();
  }, []);

  const persist = async (nextUser: User, nextToken: string) => {
    setUser(nextUser);
    setToken(nextToken);
    await AsyncStorage.setItem("autoszczech_auth", JSON.stringify({ user: nextUser, token: nextToken }));
  };

  const value = useMemo<AuthContextType>(() => ({
    user,
    token,
    loading,
    login: async (email, password) => {
      const data = await api.login(email, password);
      await persist(data.user, data.token);
    },
    register: async (payload) => {
      const data = await api.register(payload);
      await persist(data.user, data.token);
    },
    logout: async () => {
      setUser(null);
      setToken(null);
      await AsyncStorage.removeItem("autoszczech_auth");
    },
  }), [user, token, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return ctx;
}
