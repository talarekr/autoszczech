import axios from "axios";
import { createContext, useContext, useMemo, useState, useCallback, type ReactNode } from "react";

import { getApiUrl } from "../lib/api";

type UserRole = "ADMIN" | "USER" | null;

interface Session {
  token: string | null;
  email: string | null;
  role: UserRole;
}

interface LoginCredentials {
  email: string;
  password: string;
  remember?: boolean;
}

interface AuthContextValue {
  isLoggedIn: boolean;
  userEmail: string | null;
  userRole: UserRole;
  token: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  updateSession: (next: Partial<Session>) => void;
}

const SESSION_STORAGE_KEY = "autoszczech:session";

class AuthError extends Error {
  translationKey: string;

  constructor(translationKey: string, cause?: unknown) {
    super(translationKey);
    this.name = "AuthError";
    this.translationKey = translationKey;
    if (cause instanceof Error && cause.stack) {
      this.stack = cause.stack;
    }
  }
}

const readStoredSession = (): Session => {
  if (typeof window === "undefined") {
    return { token: null, email: null, role: null };
  }

  try {
    const raw = window.localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) {
      return { token: null, email: null, role: null };
    }
    const parsed = JSON.parse(raw);
    const token = typeof parsed.token === "string" ? parsed.token : null;
    const email = typeof parsed.email === "string" ? parsed.email : null;
    const role = parsed.role === "ADMIN" || parsed.role === "USER" ? parsed.role : null;
    return { token, email, role };
  } catch (error) {
    console.warn("Nie udało się odczytać sesji użytkownika z localStorage.", error);
    return { token: null, email: null, role: null };
  }
};

const persistSession = (session: Session | null) => {
  if (typeof window === "undefined") return;
  try {
    if (session && session.token) {
      window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
    } else {
      window.localStorage.removeItem(SESSION_STORAGE_KEY);
    }
  } catch (error) {
    console.warn("Nie udało się zapisać sesji użytkownika w localStorage.", error);
  }
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session>(() => readStoredSession());

  const login = useCallback(
    async ({ email, password, remember = true }: LoginCredentials) => {
      const trimmedEmail = email.trim().toLowerCase();
      if (!trimmedEmail || !password) {
        throw new AuthError("login.errorMissing");
      }

      try {
        const apiUrl = await getApiUrl();
        const response = await axios.post<{
          token: string;
          role?: string;
          email?: string;
        }>(`${apiUrl}/api/auth/login`, {
          email: trimmedEmail,
          password,
        });

        const token = response.data?.token;
        if (!token) {
          throw new AuthError("login.errorServer");
        }

        const role = response.data?.role === "ADMIN" || response.data?.role === "USER" ? response.data.role : "USER";
        const nextSession: Session = {
          token,
          email: response.data?.email ?? trimmedEmail,
          role,
        };

        setSession(nextSession);
        if (remember) {
          persistSession(nextSession);
        } else {
          persistSession(null);
        }
      } catch (error) {
        if (axios.isAxiosError(error)) {
          if (error.response?.status === 401) {
            throw new AuthError("login.errorInvalid", error);
          }
          if (error.response?.status === 403) {
            throw new AuthError("login.errorPending", error);
          }
        }
        if (error instanceof AuthError) {
          throw error;
        }
        console.error("Nie udało się zalogować użytkownika.", error);
        throw new AuthError("login.errorServer", error);
      }
    },
    []
  );

  const logout = useCallback(() => {
    setSession({ token: null, email: null, role: null });
    persistSession(null);
  }, []);

  const updateSession = useCallback((next: Partial<Session>) => {
    setSession((prev) => {
      const merged = { ...prev, ...next };
      if (merged.token) {
        persistSession(merged);
      } else {
        persistSession(null);
      }
      return merged;
    });
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      isLoggedIn: Boolean(session.token),
      userEmail: session.email,
      userRole: session.role,
      token: session.token,
      login,
      logout,
      updateSession,
    }),
    [session, login, logout, updateSession]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
