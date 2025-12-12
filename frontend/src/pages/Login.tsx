import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { useAuth } from "../contexts/AuthContext";

interface FormState {
  email: string;
  password: string;
  remember: boolean;
}

const initialState: FormState = {
  email: "",
  password: "",
  remember: true,
};

export default function Login() {
  const [form, setForm] = useState<FormState>(initialState);
  const [errorKey, setErrorKey] = useState<string | null>(null);
  const [successKey, setSuccessKey] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  const { t } = useTranslation();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) return;

    const email = form.email.trim();
    const password = form.password.trim();

    if (!email || !password) {
      setErrorKey("login.errorMissing");
      setSuccessKey(null);
      return;
    }

    setSubmitting(true);
    setErrorKey(null);
    setSuccessKey(null);

    try {
      await login({ email, password, remember: form.remember });
      setSuccessKey("login.success");
      setTimeout(() => {
        navigate("/", { replace: true });
      }, 1000);
    } catch (error) {
      if (error instanceof Error && "translationKey" in error) {
        setErrorKey((error as { translationKey?: string }).translationKey ?? "login.errorServer");
      } else {
        setErrorKey("login.errorServer");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-10">
      <section className="card space-y-6">
        <div className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-red-600">{t("login.badge")}</p>
          <h1 className="text-3xl font-semibold text-neutral-900">{t("login.title")}</h1>
          <p className="text-sm text-neutral-600">{t("login.description")}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <label className="space-y-2 text-sm font-medium text-neutral-600">
            {t("login.email")}
            <input
              type="email"
              value={form.email}
              onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
              required
              className="w-full rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-800 shadow-inner focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-100"
            />
          </label>

          <label className="space-y-2 text-sm font-medium text-neutral-600">
            {t("login.password")}
            <input
              type="password"
              value={form.password}
              onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
              required
              className="w-full rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-800 shadow-inner focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-100"
            />
          </label>

          <label className="flex items-center gap-3 text-sm text-neutral-600">
            <input
              type="checkbox"
              checked={form.remember}
              onChange={(event) => setForm((prev) => ({ ...prev, remember: event.target.checked }))}
              className="h-5 w-5 rounded border-neutral-300 text-red-600 focus:ring-red-500"
            />
            {t("login.remember")}
          </label>

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex w-full items-center justify-center rounded-full bg-red-600 px-6 py-3 text-sm font-semibold uppercase tracking-widest text-white shadow-sm transition hover:bg-red-500 disabled:cursor-not-allowed disabled:bg-red-400"
          >
            {submitting ? t("login.loading") : t("login.submit")}
          </button>

          {errorKey && <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{t(errorKey)}</p>}
          {successKey && (
            <p className="rounded-2xl bg-green-50 px-4 py-3 text-sm font-medium text-green-700">{t(successKey)}</p>
          )}
        </form>
      </section>

      <section className="card space-y-4 text-sm text-neutral-600">
        <h2 className="text-xl font-semibold text-neutral-900">{t("login.noAccountTitle")}</h2>
        <p>{t("login.noAccountDescription")}</p>
        <Link
          to="/register"
          className="inline-flex items-center justify-center rounded-full bg-neutral-900 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-neutral-800"
        >
          {t("login.registerCta")}
        </Link>
      </section>
    </div>
  );
}
