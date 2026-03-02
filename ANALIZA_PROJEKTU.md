# Analiza projektu AutoSzczech

## 1) Charakter repozytorium

Repozytorium `autoszczech` to monorepo oparte o **npm workspaces** (`package.json` w katalogu głównym), z wyraźnym podziałem na:

- `backend/` — API (Node.js + Express + Prisma + PostgreSQL),
- `frontend/` — aplikację webową (React + Vite + Tailwind + i18next),
- `shared/` — współdzielone moduły domenowe/importery.

W katalogu głównym znajdują się też pliki operacyjne i wdrożeniowe (`render.yaml`, `scripts/`, dokumentacja).

## 2) Struktura katalogów

### Root

- `README.md` — instrukcja uruchomienia i wdrożenia (Render + Vercel), opis importu FTP, panelu admina i procedur operacyjnych.
- `package.json` — deklaracja workspace (`backend`, `frontend`).
- `package-lock.json` — wspólny lockfile dla całego monorepo.
- `render.yaml` — blueprint usługi backendowej + bazy PostgreSQL + persistent disk dla obrazów.
- `scripts/` — narzędzia do przygotowania paczek i resetu zdalnego `main`.

### Backend (`backend/`)

- `src/start.ts`, `src/index.ts` — start aplikacji i serwera.
- `src/routes/` — endpointy: `auth`, `cars`, `offers`, `favorites`, `admin`, `import`.
- `src/middleware/auth.ts` — autoryzacja JWT.
- `src/jobs/ftpWatcher.ts` — cykliczne odpytywanie FTP i uruchamianie importu.
- `src/lib/` — moduły pomocnicze (Prisma, JWT, mailer, konfiguracja FTP, importer).
- `prisma/schema.prisma` + `prisma/migrations/` — model danych i migracje.
- `prisma/seed.mjs` — dane startowe (m.in. konto admina).

### Frontend (`frontend/`)

- `src/main.tsx`, `src/App.tsx` — bootstrap i routing aplikacji.
- `src/pages/` — widoki użytkownika i panelu administracyjnego.
- `src/components/` — komponenty UI.
- `src/contexts/` — konteksty autoryzacji i danych ofert.
- `src/lib/api.ts` — logika wyboru aktywnego backendu.
- `src/i18n.ts` (+ `frontend/i18n.ts`) — konfiguracja internacjonalizacji.
- `vite.config.ts`, `tailwind.config.cjs`, `postcss.config.cjs` — konfiguracja narzędzi frontowych.

### Shared (`shared/`)

- `shared/importers/insurance.ts` — współdzielone mapowanie/import danych.

## 3) Konfiguracja i zależności

### Workspaces

Root:

- `workspaces: ["backend", "frontend"]`.

### Backend

Skrypty (`backend/package.json`):

- `dev`: `ts-node-dev --respawn --transpile-only src/index.ts`
- `build`: `prisma generate && tsc`
- `start`: `node dist/backend/src/start.js`
- `start:prod`: `npm run prisma:migrate && node dist/backend/src/start.js`

Główne zależności runtime:

- `express`, `cors`, `helmet`, `morgan`
- `@prisma/client`, `prisma`
- `bcryptjs`, `jsonwebtoken`, `dotenv`

Zależności dev:

- `typescript`
- pakiety `@types/*` dla używanych bibliotek

TypeScript (`backend/tsconfig.json`):

- `strict: true`
- alias `#shared/* -> ../shared/*`
- `outDir: dist`

### Frontend

Skrypty (`frontend/package.json`):

- `dev`: `vite`
- `build`: `vite build`
- `preview`: `vite preview`

Główne zależności runtime:

- `react`, `react-dom`, `react-router-dom`
- `axios`
- `i18next`, `react-i18next`

Zależności dev:

- `vite`, `@vitejs/plugin-react`
- `tailwindcss`, `postcss`, `autoprefixer`
- `typescript`

TypeScript (`frontend/tsconfig.json`):

- `strict: true`
- alias `@shared/* -> ../shared/*`

Vite (`frontend/vite.config.ts`):

- plugin React
- alias `@shared` wskazujący na `../shared`

## 4) Deployment i środowiska

### Render (`render.yaml`)

- usługa web: `autoszczech-backend` (Node)
- baza: `autoszczech-db` (PostgreSQL)
- build: instalacja zależności + build backendu + migracje
- start: `npm run start:prod --prefix backend`
- persistent disk: `/var/data` (dla obrazów z importu FTP)
- envy dla DB/JWT oraz importu FTP (host, katalogi, interwał, limit pobierania)

### Vercel

Frontend jest przygotowany do deployu z katalogu `frontend/`.

## 5) Przepływ działania aplikacji

1. Frontend wybiera działający backend (konfiguracja + fallback).
2. Backend wystawia REST API i obsługuje JWT.
3. Watcher FTP cyklicznie pobiera JSON + zdjęcia, importuje oferty i zapisuje historię importów.
4. Panel admina udostępnia operacje administracyjne i ręczne uruchamianie importu.

## 6) Weryfikacja techniczna wykonana podczas analizy

Wykonane lokalnie:

- `npm run build --prefix backend` — **OK**
- `npm run build --prefix frontend` — **OK**

Uwagi:

- podczas obu komend pojawia się ostrzeżenie npm: `Unknown env config "http-proxy"` (nie blokuje builda),
- frontend generuje bundle JS ~502 kB i Vite zgłasza ostrzeżenie o rozmiarze chunku.

## 7) Wnioski

- Repo jest spójnie zorganizowane jako monorepo frontend/backend/shared.
- Konfiguracja wdrożeniowa jest kompletna i gotowa do uruchomienia na Render + Vercel.
- Najbardziej oczywiste miejsce optymalizacji to podział bundle frontendu (code-splitting), aby obniżyć rozmiar głównego chunku.
