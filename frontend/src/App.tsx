import React, { useEffect, useRef, useState } from "react";
import { Outlet, NavLink, useLocation } from "react-router-dom";

import { useTranslation } from "react-i18next";

import { ChfPlnCalculator } from "./components/ChfPlnCalculator";
import { useAuth } from "./contexts/AuthContext";

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `text-sm font-medium transition-colors duration-150 ${isActive ? "text-red-600" : "text-neutral-500 hover:text-neutral-800"}`;

const languageOrder: Array<{ code: string; flag: string }> = [
  { code: "pl", flag: "🇵🇱" },
  { code: "de", flag: "🇩🇪" },
  { code: "en", flag: "🇬🇧" },
];

export default function App() {
  const { isLoggedIn, logout } = useAuth();
  const { t, i18n, ready } = useTranslation();
  const isReady = ready && i18n.isInitialized;
  const [isAuthMenuOpen, setIsAuthMenuOpen] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const authMenuRef = useRef<HTMLDivElement | null>(null);
  const location = useLocation();

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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (authMenuRef.current && !authMenuRef.current.contains(event.target as Node)) {
        setIsAuthMenuOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  useEffect(() => {
    setIsMobileNavOpen(false);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-neutral-100">
      <header className="sticky top-0 z-30 border-b border-neutral-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-[calc(72rem+18rem)] items-center justify-between gap-6 px-4 py-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-700 shadow-sm transition hover:border-red-100 hover:bg-red-50 md:hidden"
              onClick={() => setIsMobileNavOpen((open) => !open)}
              aria-expanded={isMobileNavOpen}
              aria-controls="mobile-navigation"
              aria-label={t("nav.openMenu")}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5" aria-hidden>
                <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <a href="/" className="flex items-center" aria-label={t("nav.backHomeAria")}>
              <img
                src="/logo.png"
                alt="AutoSzczech.ch"
                className="h-11 w-auto object-contain md:h-[90px]"
                loading="lazy"
              />
            </a>
          </div>
          <nav className="hidden items-center gap-8 md:flex">
            <NavLink to="/" className={navLinkClass} end>
              {t("nav.auctions")}
            </NavLink>
            <NavLink to="/how-to-buy" className={navLinkClass}>
              {t("nav.howToBuy")}
            </NavLink>
            <NavLink to="/transport-calculator" className={navLinkClass}>
              {t("nav.transportCalculator")}
            </NavLink>
            <NavLink to="/contact" className={navLinkClass}>
              {t("nav.contact")}
            </NavLink>
          </nav>
          <div className="flex items-center gap-3">
            <div className="relative" ref={authMenuRef}>
              <button
                type="button"
                onClick={() => setIsAuthMenuOpen((open) => !open)}
                aria-expanded={isAuthMenuOpen}
                aria-haspopup="true"
                aria-label={t("nav.authMenuAria")}
                className={`inline-flex h-11 w-11 items-center justify-center rounded-full border border-neutral-200 bg-white text-lg shadow-sm transition hover:border-red-100 hover:bg-red-50 ${
                  isAuthMenuOpen ? "border-red-300 bg-red-50 text-red-600" : ""
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="h-5 w-5"
                  aria-hidden
                >
                  <path
                    d="M12 12c2.485 0 4.5-2.015 4.5-4.5S14.485 3 12 3 7.5 5.015 7.5 7.5 9.515 12 12 12Z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M5 20.4c.87-3.07 3.54-5.15 7-5.15s6.13 2.08 7 5.15"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              {isAuthMenuOpen && (
                <div className="absolute right-0 z-20 mt-3 w-52 overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-lg shadow-black/5">
                  {isLoggedIn ? (
                    <>
                      <NavLink
                        to="/panel"
                        onClick={() => setIsAuthMenuOpen(false)}
                        className={({ isActive }) =>
                          `flex items-center gap-2 px-4 py-3 text-sm font-semibold transition hover:bg-neutral-50 ${
                            isActive ? "text-red-600" : "text-neutral-700"
                          }`
                        }
                      >
                        {t("nav.clientPanel")}
                      </NavLink>
                      <button
                        type="button"
                        onClick={() => {
                          logout();
                          setIsAuthMenuOpen(false);
                        }}
                        className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm font-semibold text-neutral-700 transition hover:bg-neutral-50"
                      >
                        {t("nav.logout")}
                      </button>
                    </>
                  ) : (
                    <>
                      <NavLink
                        to="/login"
                        onClick={() => setIsAuthMenuOpen(false)}
                        className={({ isActive }) =>
                          `flex items-center gap-2 px-4 py-3 text-sm font-semibold transition hover:bg-neutral-50 ${
                            isActive ? "text-red-600" : "text-neutral-700"
                          }`
                        }
                      >
                        {t("nav.login")}
                      </NavLink>
                      <NavLink
                        to="/register"
                        onClick={() => setIsAuthMenuOpen(false)}
                        className={({ isActive }) =>
                          `flex items-center gap-2 px-4 py-3 text-sm font-semibold transition hover:bg-neutral-50 ${
                            isActive ? "text-red-600" : "text-neutral-700"
                          }`
                        }
                      >
                        {t("nav.register")}
                      </NavLink>
                    </>
                  )}
                </div>
              )}
            </div>
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
        {isMobileNavOpen && (
          <div className="md:hidden" id="mobile-navigation">
            <div className="mx-auto w-full max-w-[calc(72rem+18rem)] px-4 pb-4">
              <nav className="space-y-2 rounded-2xl border border-neutral-200 bg-white p-4 shadow-lg shadow-black/5">
                <NavLink
                  to="/"
                  onClick={() => setIsMobileNavOpen(false)}
                  className={({ isActive }) =>
                    `block rounded-xl px-3 py-2 text-base font-semibold transition hover:bg-neutral-50 ${
                      isActive ? "bg-red-50 text-red-600" : "text-neutral-800"
                    }`
                  }
                  end
                >
                  {t("nav.auctions")}
                </NavLink>
                <NavLink
                  to="/how-to-buy"
                  onClick={() => setIsMobileNavOpen(false)}
                  className={({ isActive }) =>
                    `block rounded-xl px-3 py-2 text-base font-semibold transition hover:bg-neutral-50 ${
                      isActive ? "bg-red-50 text-red-600" : "text-neutral-800"
                    }`
                  }
                >
                  {t("nav.howToBuy")}
                </NavLink>
                <NavLink
                  to="/transport-calculator"
                  onClick={() => setIsMobileNavOpen(false)}
                  className={({ isActive }) =>
                    `block rounded-xl px-3 py-2 text-base font-semibold transition hover:bg-neutral-50 ${
                      isActive ? "bg-red-50 text-red-600" : "text-neutral-800"
                    }`
                  }
                >
                  {t("nav.transportCalculator")}
                </NavLink>
                <NavLink
                  to="/contact"
                  onClick={() => setIsMobileNavOpen(false)}
                  className={({ isActive }) =>
                    `block rounded-xl px-3 py-2 text-base font-semibold transition hover:bg-neutral-50 ${
                      isActive ? "bg-red-50 text-red-600" : "text-neutral-800"
                    }`
                  }
                >
                  {t("nav.contact")}
                </NavLink>
              </nav>
            </div>
          </div>
        )}
      </header>
      {isMobileNavOpen && (
        <button
          type="button"
          className="fixed inset-0 z-20 bg-black/20 md:hidden"
          onClick={() => setIsMobileNavOpen(false)}
          aria-label={t("nav.closeMenu")}
        />
      )}
      <div className="relative z-0 mx-auto w-full max-w-[calc(72rem+18rem)] px-4 py-10">
        <div className="mx-auto grid w-full grid-cols-1 gap-10 lg:grid-cols-[minmax(0,72rem)_16rem] lg:items-start lg:gap-12">
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
            <NavLink
              to="/terms"
              className={({ isActive }) => `hover:text-red-600 ${isActive ? "text-red-600" : ""}`}
            >
              {t("footer.terms")}
            </NavLink>
            <NavLink
              to="/privacy-policy"
              className={({ isActive }) => `hover:text-red-600 ${isActive ? "text-red-600" : ""}`}
            >
              {t("footer.privacy")}
            </NavLink>
            <a href="#cookies" className="hover:text-red-600">
              {t("footer.cookies")}
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
