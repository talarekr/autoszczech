# Analiza projektu AutoSzczech

## 1. Charakter repozytorium

Repozytorium `autoszczech` to monorepo JavaScript/TypeScript zarządzane przez **npm workspaces** z dwoma głównymi aplikacjami:

- `backend/` — API (Node.js + Express + Prisma + PostgreSQL),
- `frontend/` — aplikacja webowa (React + Vite + Tailwind + i18next),
- `shared/` — kod współdzielony pomiędzy pakietami (np. importer danych).

W katalogu głównym znajdują się również pliki infrastrukturalne i operacyjne (`render.yaml`, `.env.example`, `scripts/*`).

## 2. Struktura katalogów

Najważniejsze katalogi projektu:

- `backend/`
  - `src/index.ts` — główny punkt wejścia API (middleware, trasy, uruchomienie serwera),
  - `src/routes/` — endpointy (`auth`, `cars`, `offers`, `favorites`, `admin`, import),
  - `src/jobs/ftpWatcher.ts` — harmonogram importu FTP,
  - `src/lib/` — logika pomocnicza (konfiguracja FTP, Prisma, uprawnienia admina),
  - `prisma/schema.prisma` — model danych i indeksy,
  - `prisma/migrations/` — migracje bazy.
- `frontend/`
  - `src/main.tsx`, `src/App.tsx` — bootstrap i root aplikacji,
  - `src/pages/` — widoki użytkownika i panelu admin,
  - `src/components/` — komponenty UI,
  - `src/contexts/` — konteksty aplikacyjne,
  - `src/lib/api.ts` — wykrywanie i wybór URL API,
  - `public/` oraz `sample-imports/` — zasoby statyczne i przykładowe importy.
- `shared/importers/insurance.ts` — współdzielone narzędzia importu.
- `scripts/` — skrypty operacyjne (archiwa, reset zdalnej gałęzi).

## 3. Konfiguracja i uruchamianie

### Root

`package.json` w katalogu głównym definiuje workspaces:

- `backend`
- `frontend`

### Backend

`backend/package.json`:

- `dev` — uruchomienie developerskie (`ts-node-dev`),
- `build` — generacja Prisma client + kompilacja TS,
- `start` / `start:prod` — uruchomienie builda,
- `prisma:migrate`, `prisma:seed` — migracje i seed danych.

W runtime backend:

- stosuje `helmet`, `cors`, `morgan`,
- wystawia `/api/health`,
- rejestruje trasy `/api/auth`, `/api/cars`, `/api/offers`, `/api/favorites`, `/api/admin`,
- mountuje statyczne obrazy pobrane przez importer FTP,
- automatycznie tworzy/utrzymuje konta administratora,
- uruchamia pętlę importu FTP (jeśli `FTP_IMPORT_ENABLED=true`).

### Frontend

`frontend/package.json`:

- `dev` — Vite dev server,
- `build` — build produkcyjny,
- `preview` — podgląd builda.

`frontend/src/lib/api.ts` realizuje inteligentny fallback API:

- uwzględnia `VITE_API_URL`,
- testuje lokalny host w development,
- sonduje `/api/health` na kilku kandydatach,
- zapamiętuje działający URL w `localStorage`.

### Deployment

- `render.yaml` definiuje usługę backendu, bazę PostgreSQL i persistent disk na obrazy z FTP.
- README opisuje deployment backendu na Render oraz frontendu na Vercel.

## 4. Zależności

### Backend (runtime)

- `express`, `cors`, `helmet`, `morgan`,
- `@prisma/client`, `prisma`,
- `bcryptjs`, `jsonwebtoken`, `dotenv`.

### Backend (dev)

- `typescript`, `@types/*` dla używanych bibliotek.

### Frontend (runtime)

- `react`, `react-dom`, `react-router-dom`,
- `axios`,
- `i18next`, `react-i18next`.

### Frontend (dev)

- `vite`, `@vitejs/plugin-react`,
- `tailwindcss`, `postcss`, `autoprefixer`,
- `typescript`.

## 5. Model danych (Prisma)

Kluczowe modele i relacje:

- `User` — użytkownicy, role (`USER`/`ADMIN`), status rejestracji,
- `Car` + `CarImage` — aukcje i obrazy,
- `Offer` — oferty użytkowników na samochody,
- `Favorite` — ulubione ogłoszenia,
- `ImportJob` — historia i wynik importów.

W modelach występują indeksy wspierające zapytania listujące (`Car`, `Offer`, `Favorite`, `CarImage`) oraz ograniczenia unikalności (`User.email`, `Car.displayId`, `Favorite[userId,carId]`, `ImportJob.filename`).

## 6. Przepływy funkcjonalne

1. Frontend wybiera dostępny backend i komunikuje się przez REST.
2. Backend obsługuje autoryzację JWT oraz operacje domenowe (samochody, oferty, ulubione, admin).
3. Watcher FTP okresowo pobiera pliki JSON i zdjęcia, aktualizuje bazę i publikuje obrazy statycznie.
4. Historia importów jest zapisywana w `ImportJob`, co wspiera monitoring i diagnostykę.

## 7. Wnioski

- Projekt ma spójną strukturę monorepo i wyraźny podział odpowiedzialności frontend/backend/shared.
- Wdrożenie produkcyjne jest zautomatyzowane (Render blueprint + konfiguracja środowiskowa).
- Logika fallback API i importu FTP zwiększa odporność operacyjną aplikacji.
- W repozytorium nadal występują jawne wartości przykładowych sekretów/poświadczeń w dokumentacji i konfiguracji — warto je traktować wyłącznie jako dane testowe i rotować w środowisku produkcyjnym.
