# Analiza projektu AutoSzczech

## 1) Charakter i zakres repozytorium

Repozytorium `autoszczech` jest monorepo oparte o **npm workspaces** i zawiera kompletną aplikację webową:

- **frontend** (React + Vite + Tailwind + i18next),
- **backend** (Node.js + Express + Prisma + PostgreSQL),
- **shared** (współdzielone parsery/importery domenowe).

Stan repozytorium potwierdza, że to projekt już działający produkcyjnie (Render + Vercel), a nie szablon startowy.

## 2) Struktura katalogów

### Root

- `package.json` – konfiguracja workspaces (`backend`, `frontend`).
- `package-lock.json` – wspólny lockfile dla całego monorepo.
- `README.md` – instrukcje uruchomienia, wdrożenia i utrzymania.
- `render.yaml` – deklaratywny deployment backendu + PostgreSQL + persistent disk.
- `.env.example` – pełna lista zmiennych środowiskowych backendu i frontendu.
- `scripts/` – skrypty operacyjne (pakowanie archiwów, reset zdalnej gałęzi `main`).

### Backend (`backend/`)

- `src/index.ts` – konfiguracja Express i rejestracja tras API.
- `src/routes/` – endpointy (`auth`, `cars`, `offers`, `favorites`, `admin`, `import`).
- `src/middleware/auth.ts` – autoryzacja JWT i ochrona tras.
- `src/lib/` – biblioteki pomocnicze (Prisma, JWT, mailer, FTP importer).
- `src/jobs/ftpWatcher.ts` – cykliczny import JSON + obrazów z FTP.
- `prisma/schema.prisma` + `prisma/migrations/` – model danych i migracje.

### Frontend (`frontend/`)

- `src/main.tsx`, `src/App.tsx` – bootstrap aplikacji i routing.
- `src/pages/` – widoki publiczne i panelowe (w tym `Admin.tsx`).
- `src/components/` – komponenty wielokrotnego użycia.
- `src/contexts/` – stan sesji i inwentarza.
- `src/lib/api.ts` – wybór aktywnego backendu/fallback URL.
- `src/i18n.ts` – konfiguracja tłumaczeń PL/EN/DE.
- `vite.config.ts`, `tailwind.config.cjs`, `postcss.config.cjs` – tooling build/runtime.
- `vercel.json` – rewrites `/api` i `/uploads` do backendu.

### Shared (`shared/`)

- `shared/importers/insurance.ts` – wspólna logika parsera ofert/importu.

## 3) README — co dokumentuje i jak prowadzi wdrożenie

`README.md` opisuje pełny przepływ operacyjny:

1. **Konfiguracja ENV** (lokalna i produkcyjna),
2. **Render Blueprint** (backend + DB + dysk trwały),
3. **Vercel** (frontend),
4. **Automatyczny import FTP** (JSON + zdjęcia + endpointy administracyjne),
5. **Pakowanie snapshotów projektu** (`zip`, `tar`, base64),
6. **Procedury administracyjne** (np. wymuszony reset zdalnego `main`).

Dokumentacja jest rozbudowana i nastawiona na operacyjne utrzymanie projektu (deploy, import, troubleshooting, pakowanie artefaktów).

## 4) Konfiguracja i zależności

### Monorepo

- Root używa `workspaces: ["backend", "frontend"]`.
- Jedna instalacja zależności obsługuje oba moduły aplikacji.

### Backend (`backend/package.json`)

**Runtime dependencies**:
- API i bezpieczeństwo: `express`, `cors`, `helmet`, `morgan`.
- Dane: `@prisma/client`, `prisma`.
- Autoryzacja i hashowanie: `jsonwebtoken`, `bcryptjs`.
- Konfiguracja: `dotenv`.

**Dev dependencies**:
- `typescript` + pakiet typów (`@types/*`).

**Skrypty**:
- `dev`: lokalny development serwera,
- `build`: `prisma generate && tsc`,
- `start:prod`: migracje + start serwera ze zbudowanego `dist`.

### Frontend (`frontend/package.json`)

**Runtime dependencies**:
- `react`, `react-dom`, `react-router-dom`,
- `axios`,
- `i18next`, `react-i18next`.

**Dev dependencies**:
- `vite`, `@vitejs/plugin-react`,
- `tailwindcss`, `postcss`, `autoprefixer`,
- `typescript`.

**Skrypty**:
- `dev`, `build`, `preview` (standard Vite).

## 5) Dane i model domenowy (Prisma)

Główne encje backendu:

- `User` (role, status rejestracji, dane formularza),
- `Car` + `CarImage` (aukcje i zdjęcia),
- `Offer` (oferty użytkowników),
- `Favorite` (ulubione aukcje),
- `ImportJob` (rejestr cykli importu FTP).

W modelu obecne są indeksy pod listowanie aukcji i relacje (`Car`, `Offer`, `Favorite`, `CarImage`), co wspiera wydajność endpointów listujących.

## 6) Spójność konfiguracji (README vs kod)

Analiza pokazała, że większość dokumentacji i konfiguracji jest spójna, ale warto monitorować poniższe punkty:

1. **Import FTP**
   - Kod backendu używa `FTP_JSON_DIRECTORY`, `FTP_IMAGE_DIRECTORY`, `FTP_PUBLIC_IMAGE_BASE`, `FTP_LOCAL_IMAGE_DIR`.
   - W `.env.example` nadal występują historyczne wpisy (`FTP_DIRECTORY`, `FTP_IMAGE_BASE_URL`), które nie są głównymi nazwami używanymi przez aktualny parser konfiguracji.

2. **Wartości domyślne FTP w kodzie**
   - `backend/src/lib/ftpConfig.ts` zawiera domyślne wartości hosta/użytkownika/hasła FTP, które powinny być traktowane jako techniczne fallbacki, nie docelowa konfiguracja produkcyjna.

3. **Bundle frontendu**
   - Build frontendu przechodzi poprawnie, ale pojawia się ostrzeżenie Vite o chunku >500 kB (potencjalny obszar optymalizacji).

## 7) Weryfikacja wykonana podczas analizy

Wykonane komendy:

- `npm run build --prefix backend` ✅
- `npm run build --prefix frontend` ✅

Wynik:

- oba buildy zakończone sukcesem,
- pojawia się ostrzeżenie npm o `Unknown env config "http-proxy"` (nie blokuje kompilacji),
- frontend zgłasza ostrzeżenie o rozmiarze bundla (informacyjne).

## 8) Podsumowanie architektoniczne

Projekt jest dojrzałym, wdrożonym monorepo z czytelnym podziałem odpowiedzialności i pełnym zapleczem deploymentowym. Najważniejsze obszary do dalszego utrzymania to:

- porządkowanie i ujednolicenie nazw zmiennych środowiskowych związanych z FTP,
- utrzymanie bezpiecznych wartości konfiguracyjnych poza repo,
- optymalizacja rozmiaru bundla frontendu (code-splitting cięższych widoków).
