import React from "react";
import { Outlet, Link, NavLink } from "react-router-dom";

import { useTranslation } from "react-i18next";

import { ChfPlnCalculator } from "./components/ChfPlnCalculator";
import { useAuth } from "./contexts/AuthContext";
import autoszczechLogo from "./assets/autoszczech-logo.svg";

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `text-sm font-medium transition-colors duration-150 ${isActive ? "text-red-600" : "text-neutral-500 hover:text-neutral-800"}`;

const languageOrder: Array<{ code: string; flag: string }> = [
  { code: "pl", flag: "🇵🇱" },
  { code: "de", flag: "🇩🇪" },
  { code: "en", flag: "🇬🇧" },
];

export default function App() {
  const { isLoggedIn, userEmail, logout } = useAuth();
  const { t, i18n, ready } = useTranslation();
  const isReady = ready && i18n.isInitialized;

  const languageOptions = languageOrder.map(({ code, flag }) => ({
    code,
    flag,
    label: `${flag} ${t(`common.languages.${code}`)}`,
  }));

  if (!isReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-100 text-neutral-500">
        <span className="animate-pulse text-sm font-semibold uppercase tracking-[0.4em]">
          AUTOSZCZECH
        </span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-100">
      <header className="border-b border-neutral-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-4 py-4">
          <Link to="/" className="flex items-center" aria-label={t("nav.backHomeAria")}
          >
            <img src={autoszczechLogo} alt="Autoszczech" className="h-10 w-auto" />
          </Link>
          <nav className="hidden items-center gap-8 md:flex">
            <NavLink to="/" className={navLinkClass} end>
              {t("nav.auctions")}
            </NavLink>
            {isLoggedIn && (
              <NavLink to="/panel" className={navLinkClass}>
                {t("nav.clientPanel")}
              </NavLink>
            )}
            <a href="#jak-kupowac" className="text-sm font-medium text-neutral-500 transition-colors hover:text-neutral-800">
              {t("nav.howToBuy")}
            </a>
            <NavLink to="/transport-calculator" className={navLinkClass}>
              {t("nav.transportCalculator")}
            </NavLink>
            <a href="#kontakt" className="text-sm font-medium text-neutral-500 transition-colors hover:text-neutral-800">
              {t("nav.contact")}
            </a>
          </nav>
          <div className="flex items-center gap-3">
            <NavLink
              to="/register"
              className={({ isActive }) =>
                `hidden text-sm font-semibold text-neutral-600 transition-colors hover:text-neutral-900 md:inline ${
                  isActive ? "text-red-600" : ""
                }`
              }
            >
              {t("nav.register")}
            </NavLink>
            {isLoggedIn ? (
              <div className="flex items-center gap-3">
                <NavLink
                  to="/panel"
                  className={({ isActive }) =>
                    `inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm font-semibold text-neutral-700 shadow-sm transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 ${
                      isActive ? "border-red-300 bg-red-50 text-red-600" : ""
                    }`
                  }
                >
                  {t("nav.clientPanel")}
                </NavLink>
                {userEmail && (
                  <span className="hidden text-sm font-semibold text-neutral-600 md:inline" title={userEmail}>
                    {userEmail}
                  </span>
                )}
                <button
                  type="button"
                  onClick={logout}
                  className="inline-flex items-center justify-center rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm font-semibold text-neutral-700 shadow-sm transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                >
                  {t("nav.logout")}
                </button>
              </div>
            ) : (
              <NavLink
                to="/login"
                className={({ isActive }) =>
                  `inline-flex h-11 w-11 items-center justify-center rounded-full border border-neutral-200 bg-white text-lg shadow-sm transition hover:border-red-100 hover:bg-red-50 ${
                    isActive ? "border-red-300 bg-red-50 text-red-600" : ""
                  }`
                }
                aria-label={t("nav.loginAria")}
              >
                🔒
              </NavLink>
            )}
            <div className="relative">
              <label htmlFor="language-select" className="sr-only">
                {t("common.languageSwitcherLabel")}
              </label>
              <select
                id="language-select"
                value={i18n.language.split("-")[0]}
                onChange={(event) => i18n.changeLanguage(event.target.value)}
                className="inline-flex items-center rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm font-semibold text-neutral-700 shadow-sm transition focus:border-red-300 focus:outline-none focus:ring-2 focus:ring-red-100"
              >
                {languageOptions.map((option) => (
                  <option key={option.code} value={option.code}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </header>
      <div className="mx-auto w-full max-w-[calc(72rem+18rem)] px-4 py-10">
        <div className="mx-auto grid w-full gap-10 lg:grid-cols-[minmax(0,72rem)_16rem] lg:items-start lg:gap-12">
          <main className="order-1 w-full lg:order-none">
            <Outlet />
          </main>
          <aside className="order-2 lg:order-none lg:sticky lg:top-1/2 lg:h-fit lg:-translate-y-1/2">
            <ChfPlnCalculator />
          </aside>
        </div>
      </div>
      <footer className="border-t border-neutral-200 bg-white/70">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-6 text-sm text-neutral-500 md:flex-row md:items-center md:justify-between">
          <p className="font-semibold text-neutral-800">© {new Date().getFullYear()} AutoSzczech</p>
          <div className="flex flex-wrap items-center gap-4">
            <a href="#regulamin" className="hover:text-red-600">
              {t("footer.terms")}
            </a>
            <a href="#polityka" className="hover:text-red-600">
              {t("footer.privacy")}
            </a>
            <a href="#cookies" className="hover:text-red-600">
              {t("footer.cookies")}
            </a>
            <NavLink to="/admin" className={({ isActive }) => `hover:text-red-600 ${isActive ? "text-red-600" : ""}`}>
              {t("footer.admin")}
            </NavLink>
          </div>
        </div>
      </footer>
    </div>
  );
}
