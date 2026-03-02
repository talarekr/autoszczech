# Analiza projektu AutoSzczech

## 1) Charakter repozytorium

Repozytorium `autoszczech` jest monorepo opartym o **npm workspaces** z trzema kluczowymi obszarami:

- `backend/` – REST API (Node.js + Express + Prisma + PostgreSQL),
- `frontend/` – aplikacja webowa (React + Vite + Tailwind + i18next),
- `shared/` – współdzielone moduły domenowe/importery.

W katalogu głównym znajdują się również pliki wdrożeniowe (`render.yaml`), skrypty operacyjne (`scripts/`) i dokumentacja (`README.md`, `MIGRATION_FROM_PREVIOUS_TASK.md`).

## 2) Struktura katalogów i odpowiedzialności

### Root

- `package.json` – definicja workspaces: `backend`, `frontend`.
- `package-lock.json` – wspólny lockfile monorepo.
- `render.yaml` – blueprint Render (backend + PostgreSQL + dysk persistent dla uploadów).
- `scripts/create-github-package.sh` i `scripts/create-main-archive.sh` – przygotowanie paczek projektu.
- `scripts/reset-remote-main.sh` – narzędzie do wymuszonej podmiany historii zdalnej gałęzi.

### Backend (`backend/`)

- `src/index.ts`, `src/start.ts` – inicjalizacja aplikacji i uruchomienie serwera.
- `src/routes/` – moduły endpointów: `auth`, `cars`, `offers`, `favorites`, `admin`, `import`.
- `src/middleware/auth.ts` – walidacja JWT i ochrona endpointów.
- `src/jobs/ftpWatcher.ts` – harmonogram importu ofert JSON + obrazów z FTP.
- `src/lib/` – logika pomocnicza (Prisma, JWT, mail, konfiguracja FTP, importer).
- `prisma/schema.prisma` – model danych i indeksy.
- `prisma/seed.mjs` – seed użytkownika admina i danych startowych.

### Frontend (`frontend/`)

- `src/main.tsx`, `src/App.tsx` – bootstrap i routing aplikacji.
- `src/pages/` – widoki publiczne i administracyjne.
- `src/components/` – komponenty UI (np. karta auta, kalkulatory).
- `src/contexts/` – stan autoryzacji i inwentarza.
- `src/lib/api.ts` – logika wyboru aktywnego backendu (fallbacki URL).
- `src/i18n.ts` + `frontend/i18n.ts` – konfiguracja tłumaczeń.
- `vite.config.ts`, `tailwind.config.cjs`, `postcss.config.cjs` – konfiguracja toolingu.
- `vercel.json` – rewrites dla `/api` i `/uploads` na backend.

### Shared (`shared/`)

- `shared/importers/insurance.ts` – współdzielony importer/mapowanie danych.

## 3) Konfiguracja i zależności

### Workspaces

Root:

- `workspaces: ["backend", "frontend"]`.

### Backend – zależności i skrypty

Skrypty (`backend/package.json`):

- `dev`: `ts-node-dev --respawn --transpile-only src/index.ts`
- `build`: `prisma generate && tsc`
- `start`: `node dist/backend/src/start.js`
- `start:prod`: `npm run prisma:migrate && node dist/backend/src/start.js`

Kluczowe dependency runtime:

- HTTP/API: `express`, `cors`, `helmet`, `morgan`
- Dane: `@prisma/client`, `prisma`
- Auth/konfiguracja: `bcryptjs`, `jsonwebtoken`, `dotenv`

Kluczowe ustawienia TS (`backend/tsconfig.json`):

- `strict: true`
- alias `#shared/* -> ../shared/*`
- kompilacja do `dist`

### Frontend – zależności i skrypty

Skrypty (`frontend/package.json`):

- `dev`: `vite`
- `build`: `vite build`
- `preview`: `vite preview`

Kluczowe dependency runtime:

- `react`, `react-dom`, `react-router-dom`
- `axios`
- `i18next`, `react-i18next`

Kluczowe ustawienia TS/Vite:

- `strict: true` w `frontend/tsconfig.json`
- alias `@shared/* -> ../shared/*`
- plugin React + alias `@shared` w `vite.config.ts`

## 4) Model danych backendu (Prisma)

Główne encje:

- `User` (role, status rejestracji, dane formularza),
- `Car` + `CarImage` (aukcje, metadane, zdjęcia),
- `Offer` (oferty użytkowników),
- `Favorite` (ulubione),
- `ImportJob` (historia importów FTP).

Istotne elementy:

- unikalność `Favorite` po `(userId, carId)`,
- indeksy pod listowanie aukcji (`Car.adminDismissed`, `Car.auctionEnd`, `Car.createdAt`),
- indeksy techniczne pod relacje (`Offer`, `CarImage`, `Favorite`).

## 5) Deployment i środowiska

### Render

`render.yaml` definiuje:

- usługę `autoszczech-backend` (Node),
- bazę `autoszczech-db` (PostgreSQL),
- build: `npm install && npm run build --prefix backend && npm run prisma:migrate --prefix backend`,
- start: `npm run start:prod --prefix backend`,
- persistent disk `/var/data` dla danych importu obrazów.

### Vercel

Frontend jest przygotowany do osobnego deployu z katalogu `frontend/`.
`frontend/vercel.json` przekierowuje `/api/*` i `/uploads/*` na backend, a ruch SPA na `index.html`.

## 6) Weryfikacja techniczna podczas analizy

Wykonane lokalnie:

- `npm run build --prefix backend` – **OK**
- `npm run build --prefix frontend` – **OK**

Uwagi:

- występuje ostrzeżenie npm: `Unknown env config "http-proxy"` (nie blokuje buildów),
- frontend zgłasza ostrzeżenie Vite o rozmiarze chunku (główny bundle ~500 kB po minifikacji).

## 7) Obserwacje i rekomendacje

1. **Architektura**: projekt jest spójny i gotowy do dalszego rozwoju w modelu monorepo (clear separation backend/frontend/shared).
2. **Operacyjność**: deployment jest kompletny (Render + Vercel) i zawiera automatyzację importu FTP.
3. **Wydajność frontend**: warto rozważyć code-splitting cięższych widoków (np. panel admina, detale) w celu redukcji rozmiaru initial chunku.
4. **Bezpieczeństwo konfiguracji**: w repo widoczne są przykładowe/robocze sekrety (np. SMTP/FTP/hasła admina) – rekomendowane jest ich usunięcie z plików wersjonowanych i rotacja wartości produkcyjnych.
