import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import axios from "axios";
import { API_URL } from "../lib/api";
import type { AuthUser } from "../lib/types";
import AuthModal from "../components/AuthModal";

export type AuthMode = "login" | "register";

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
  openAuthModal: (mode?: AuthMode) => void;
  closeAuthModal: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const storageKey = "autoszczech:auth";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      const raw = window.localStorage.getItem(storageKey);
      return raw ? (JSON.parse(raw) as AuthUser) : null;
    } catch {
      return null;
    }
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<AuthMode>("login");

  const persist = (next: AuthUser | null) => {
    setUser(next);
    if (typeof window === "undefined") return;
    if (next) {
      window.localStorage.setItem(storageKey, JSON.stringify(next));
    } else {
      window.localStorage.removeItem(storageKey);
    }
  };

  const login = async (email: string, password: string) => {
    const { data } = await axios.post(`${API_URL}/api/auth/login`, { email, password });
    persist({ email: data.email, role: data.role, token: data.token });
  };

  const register = async (email: string, password: string) => {
    await axios.post(`${API_URL}/api/auth/register`, { email, password });
    await login(email, password);
  };

  const logout = () => {
    persist(null);
  };

  const openAuthModal = (mode: AuthMode = "login") => {
    setModalMode(mode);
    setModalOpen(true);
  };

  const closeAuthModal = () => setModalOpen(false);

  const value = useMemo(
    () => ({ user, token: user?.token ?? null, login, register, logout, openAuthModal, closeAuthModal }),
    [user]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
      {modalOpen && (
        <AuthModal
          mode={modalMode}
          onClose={closeAuthModal}
          onSwitchMode={(mode) => setModalMode(mode)}
          onLogin={async (email, password) => {
            await login(email, password);
            closeAuthModal();
          }}
          onRegister={async (email, password) => {
            await register(email, password);
            closeAuthModal();
          }}
        />
      )}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
