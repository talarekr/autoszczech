import React from "react";
import { NavLink, Outlet, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "./context/AuthContext";

const languages = [
  { code: "pl", label: "PL" },
  { code: "en", label: "EN" },
  { code: "de", label: "DE" },
];

export default function App() {
  const { t, i18n } = useTranslation();
  const { user, logout, openAuthModal } = useAuth();

  const activeLanguage = i18n.language.split("-")[0];

  return (
    <div className="flex min-h-screen flex-col bg-neutral-950 text-neutral-100">
      <header className="border-b border-neutral-800 bg-neutral-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-5 sm:flex-row sm:items-center sm:justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-400 text-lg font-bold text-neutral-900">
              AS
            </div>
            <div>
              <p className="text-2xl font-semibold tracking-tight">AutoSzczech</p>
              <p className="text-xs uppercase tracking-[0.3em] text-neutral-400">{t("brand.tagline")}</p>
            </div>
          </Link>
          <nav className="flex flex-1 items-center justify-center gap-6 text-sm font-medium text-neutral-400">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `hover:text-white ${isActive ? "text-white" : "text-neutral-400"}`
              }
            >
              {t("nav.auctions")}
            </NavLink>
            <a href="#about" className="hover:text-white">
              {t("nav.about")}
            </a>
            <a href="#contact" className="hover:text-white">
              {t("nav.contact")}
            </a>
            {user?.role === "ADMIN" && (
              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  `hover:text-yellow-300 ${isActive ? "text-yellow-300" : "text-neutral-400"}`
                }
              >
                {t("nav.admin")}
              </NavLink>
            )}
          </nav>
          <div className="flex items-center gap-4">
            <div className="hidden items-center gap-1 rounded-full border border-neutral-800 bg-neutral-900 px-1 py-1 text-xs text-neutral-400 sm:flex">
              {languages.map((language) => (
                <button
                  key={language.code}
                  onClick={() => i18n.changeLanguage(language.code)}
                  className={`rounded-full px-3 py-1 transition ${
                    activeLanguage === language.code
                      ? "bg-yellow-400 text-neutral-900"
                      : "hover:text-white"
                  }`}
                >
                  {language.label}
                </button>
              ))}
            </div>
            {user ? (
              <div className="flex items-center gap-3">
                <div className="hidden rounded-full border border-neutral-700 bg-neutral-900 px-3 py-1 text-sm text-neutral-300 sm:block">
                  {user.email}
                </div>
                <button
                  onClick={logout}
                  className="rounded-full bg-yellow-400 px-4 py-2 text-sm font-semibold text-neutral-900 transition hover:bg-yellow-300"
                >
                  {t("nav.logout")}
                </button>
              </div>
            ) : (
              <button
                onClick={() => openAuthModal("login")}
                className="flex items-center gap-2 rounded-full bg-yellow-400 px-4 py-2 text-sm font-semibold text-neutral-900 shadow-lg shadow-yellow-400/30 transition hover:bg-yellow-300"
              >
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-neutral-900/10 text-base">★</span>
                {t("nav.login")}
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10">
        <Outlet />
      </main>

      <footer className="border-t border-neutral-800 bg-neutral-950/80">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-6 text-sm text-neutral-500 md:flex-row md:items-center md:justify-between">
          <div>© {new Date().getFullYear()} AutoSzczech. {t("footer.rights")}</div>
          <div className="flex flex-wrap gap-4">
            <a href="#regulations" className="hover:text-yellow-300">
              {t("footer.regulations")}
            </a>
            <a href="#privacy" className="hover:text-yellow-300">
              {t("footer.privacy")}
            </a>
            <a href="mailto:kontakt@autoszczech.pl" className="hover:text-yellow-300">
              kontakt@autoszczech.pl
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
