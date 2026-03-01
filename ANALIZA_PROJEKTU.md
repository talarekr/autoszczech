# Analiza projektu AutoSzczech

## 1) Charakter repozytorium

Repozytorium `autoszczech` jest monorepo zarządzanym przez **npm workspaces** (`package.json` w katalogu głównym), z podziałem na trzy główne obszary:

- `backend/` — API HTTP (Node.js + Express + Prisma + PostgreSQL),
- `frontend/` — aplikacja kliencka (React + Vite + Tailwind + i18next),
- `shared/` — współdzielony kod domenowy (np. importer danych).

Dodatkowo projekt zawiera pliki i skrypty operacyjne (`render.yaml`, `scripts/*`, dokumentację wdrożeniową).

## 2) Struktura katalogów i odpowiedzialności

### Root

- `README.md` — instrukcja uruchomienia, wdrożenia (Render/Vercel), importu FTP i operacji administracyjnych,
- `render.yaml` — blueprint infrastruktury Render (backend + PostgreSQL + persistent disk),
- `.env.example` — przykładowe zmienne środowiskowe backendu i frontendu,
- `scripts/` — skrypty pomocnicze (tworzenie archiwów, reset zdalnej gałęzi).

### Backend (`backend/`)

- `src/index.ts` + `src/start.ts` — bootstrap aplikacji i serwera,
- `src/routes/` — endpointy (`auth`, `cars`, `offers`, `favorites`, `admin`, `import`),
- `src/middleware/auth.ts` — autoryzacja JWT,
- `src/jobs/ftpWatcher.ts` — cykliczne odpytywanie FTP i uruchamianie importu,
- `src/lib/` — moduły pomocnicze (Prisma client, JWT, konfiguracja FTP, mailer, importer),
- `prisma/schema.prisma` + `prisma/migrations/` — model bazy i migracje,
- `prisma/seed.mjs` — seed konta administratora i danych startowych.

### Frontend (`frontend/`)

- `src/main.tsx`, `src/App.tsx` — wejście i routing aplikacji,
- `src/pages/` — ekrany użytkownika i panel administratora,
- `src/components/` — współdzielone komponenty UI,
- `src/contexts/` — kontekst autoryzacji i danych domenowych,
- `src/lib/api.ts` — wykrywanie/wybór aktywnego backendu,
- `src/i18n.ts` + `frontend/i18n.ts` — konfiguracja internacjonalizacji,
- `tailwind.config.cjs`, `postcss.config.cjs`, `vite.config.ts` — konfiguracja warstwy frontowej.

### Shared (`shared/`)

- `shared/importers/insurance.ts` — współdzielone parsery/mapowanie danych importowanych.

## 3) Konfiguracja i uruchamianie

### Workspaces

`package.json` w root zawiera:

- `workspaces: ["backend", "frontend"]`.

To pozwala instalować zależności i używać wspólnych modułów z jednego lockfile (`package-lock.json`).

### Backend

`backend/package.json` udostępnia m.in.:

- `dev` — `ts-node-dev` (tryb developerski),
- `build` — `prisma generate && tsc`,
- `start` — uruchomienie zbudowanego backendu,
- `start:prod` — migracje + start,
- `prisma:migrate`, `prisma:seed` — operacje bazy.

`backend/tsconfig.json`:

- `strict: true`,
- alias `#shared/* -> ../shared/*`,
- kompilacja do `dist/`.

### Frontend

`frontend/package.json` udostępnia:

- `dev` — Vite dev server,
- `build` — build produkcyjny,
- `preview` — lokalny podgląd builda.

`frontend/tsconfig.json`:

- `strict: true`,
- alias `@shared/* -> ../shared/*`,
- `jsx: react-jsx`.

`frontend/vite.config.ts` utrzymuje alias `@shared` oraz plugin React.

## 4) Zależności

### Backend (runtime)

- `express`, `cors`, `helmet`, `morgan`,
- `@prisma/client`, `prisma`,
- `bcryptjs`, `jsonwebtoken`, `dotenv`.

### Backend (dev)

- `typescript`,
- pakiety `@types/*` dla używanych bibliotek.

### Frontend (runtime)

- `react`, `react-dom`, `react-router-dom`,
- `axios`,
- `i18next`, `react-i18next`.

### Frontend (dev)

- `vite`, `@vitejs/plugin-react`,
- `tailwindcss`, `postcss`, `autoprefixer`,
- `typescript`.

## 5) Infrastruktura i środowiska

### Render

`render.yaml` definiuje:

- usługę web `autoszczech-backend` (Node),
- bazę `autoszczech-db` (PostgreSQL),
- dysk persistent montowany jako `/var/data` (pod obrazy z FTP),
- build/start command zgodne z backendowymi skryptami npm,
- zestaw envów dla importera FTP i publicznego adresu backendu.

### Vercel

Frontend jest przygotowany do wdrożenia z katalogu `frontend/`.

### Zmienne środowiskowe

`.env.example` obejmuje konfigurację:

- bazy i JWT,
- importu FTP,
- SMTP/mailingu,
- URL-i backendu/frontendu.

## 6) Przepływy funkcjonalne

1. Frontend ustala działający adres API (`VITE_API_URL` + fallback przez `/api/health`).
2. Backend wystawia REST API i obsługuje JWT.
3. Watcher FTP pobiera JSON-y i zdjęcia, przetwarza je oraz zapisuje historię importów.
4. Panel admina umożliwia operacje zarządcze i ręczne uruchamianie importu.

## 7) Weryfikacja techniczna wykonana podczas analizy

W ramach analizy uruchomiono build obu aplikacji:

- backend: `npm run build --prefix backend` — **OK**,
- frontend: `npm run build --prefix frontend` — **OK** (z ostrzeżeniem Vite o chunku ~502 kB).

## 8) Wnioski i rekomendacje

- Architektura jest spójna i czytelna: wyraźny podział backend/frontend/shared.
- Konfiguracja wdrożeniowa jest kompletna (Render Blueprint + wskazówki Vercel).
- Warto rozważyć optymalizację bundle frontendu (code splitting), aby ograniczyć duży główny chunk.
- W dokumentacji i `.env.example` widoczne są przykładowe dane wrażliwe — należy traktować je wyłącznie testowo i rotować w środowisku produkcyjnym.
