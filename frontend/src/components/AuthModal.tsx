import { useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import type { AuthMode } from "../context/AuthContext";

interface Props {
  mode: AuthMode;
  onClose: () => void;
  onSwitchMode: (mode: AuthMode) => void;
  onLogin: (email: string, password: string) => Promise<void>;
  onRegister: (email: string, password: string) => Promise<void>;
}

export default function AuthModal({ mode, onClose, onSwitchMode, onLogin, onRegister }: Props) {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (mode === "login") {
        await onLogin(email, password);
      } else {
        await onRegister(email, password);
      }
    } catch (err: any) {
      const message = err?.response?.data?.error ?? err?.message ?? t("auth.genericError");
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="w-full max-w-md rounded-3xl border border-neutral-800 bg-neutral-900 p-8 shadow-2xl">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">
            {mode === "login" ? t("auth.loginTitle") : t("auth.registerTitle")}
          </h2>
          <button onClick={onClose} className="rounded-full p-2 text-neutral-400 hover:bg-neutral-800">
            <span className="sr-only">{t("auth.close")}</span>
            ×
          </button>
        </div>
        <p className="mt-1 text-sm text-neutral-400">
          {mode === "login" ? t("auth.loginSubtitle") : t("auth.registerSubtitle")}
        </p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-300" htmlFor="auth-email">
              {t("auth.email")}
            </label>
            <input
              id="auth-email"
              type="email"
              required
              className="mt-1 w-full rounded-xl border border-neutral-700 bg-neutral-800/70 px-4 py-3 text-sm focus:border-yellow-400 focus:outline-none"
              placeholder="jan.kowalski@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-300" htmlFor="auth-password">
              {t("auth.password")}
            </label>
            <input
              id="auth-password"
              type="password"
              required
              className="mt-1 w-full rounded-xl border border-neutral-700 bg-neutral-800/70 px-4 py-3 text-sm focus:border-yellow-400 focus:outline-none"
              placeholder="••••••••"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>
          {error && <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-2 text-sm text-red-300">{error}</div>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-yellow-400 px-4 py-3 text-sm font-semibold text-neutral-900 transition hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? t("auth.loading") : mode === "login" ? t("auth.loginCta") : t("auth.registerCta")}
          </button>
        </form>
        <div className="mt-4 text-center text-sm text-neutral-400">
          {mode === "login" ? (
            <button onClick={() => onSwitchMode("register")} className="font-semibold text-yellow-400">
              {t("auth.switchToRegister")}
            </button>
          ) : (
            <button onClick={() => onSwitchMode("login")} className="font-semibold text-yellow-400">
              {t("auth.switchToLogin")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
