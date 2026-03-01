# Analiza projektu AutoSzczech

## 1. Zakres i charakter repozytorium

Repozytorium `autoszczech` jest monorepo Node.js oparte o **npm workspaces** z dwoma aplikacjami:
- `frontend/` — aplikacja React + Vite + Tailwind + i18next,
- `backend/` — API Express + Prisma + PostgreSQL,
- `shared/` — kod współdzielony (np. importer danych).

W katalogu głównym znajduje się także infrastruktura wdrożeniowa (`render.yaml`) oraz skrypty pakowania projektu (`scripts/`).

## 2. Struktura katalogów

- `backend/`
  - `src/` — serwer Express, middleware, trasy API, joby (watcher FTP), biblioteki pomocnicze.
  - `prisma/` — schemat bazy danych i migracje SQL.
  - `start.mjs`, `src/start.ts` — bootstrap uruchamiania skompilowanego backendu.
- `frontend/`
  - `src/pages/` — widoki aplikacji (Home, CarDetails, Admin, Login, ClientPanel itd.).
  - `src/components/` — komponenty UI.
  - `src/contexts/` — zarządzanie stanem autoryzacji i inwentarza.
  - `src/lib/` — API client + utility.
  - `src/data/` — dane przykładowe.
- `shared/`
  - `importers/insurance.ts` — element importerów współdzielony między pakietami.
- `scripts/`
  - narzędzia do tworzenia archiwów i resetu gałęzi zdalnej.

## 3. Konfiguracja i uruchamianie

### Root (`package.json`)
- Repozytorium używa `workspaces`: `backend` i `frontend`.

### Frontend
- Bundler: Vite (`frontend/vite.config.ts`).
- `type: module`.
- Skrypty: `dev`, `build`, `preview`.
- Alias współdzielony: `@shared -> ../shared`.

### Backend
- TypeScript + kompilacja do `dist/`.
- Skrypty:
  - `dev` (`ts-node-dev`),
  - `build` (`prisma generate && tsc`),
  - `start` (`node dist/backend/src/start.js`),
  - migracje i seed Prisma.
- Runtime (`src/index.ts`) konfiguruje:
  - bezpieczeństwo (`helmet`),
  - CORS,
  - logowanie (`morgan`),
  - trasy `/api/*`,
  - statyczne serwowanie pobranych obrazów FTP,
  - cykliczny import FTP.

### Deployment
- `render.yaml` tworzy backend + PostgreSQL + wolumen dyskowy na obrazy.
- README opisuje Vercel dla frontendu oraz Render Blueprint dla backendu.

## 4. Zależności

### Frontend (główne)
- `react`, `react-dom`, `react-router-dom`,
- `i18next`, `react-i18next`,
- `axios`,
- dev: `vite`, `typescript`, `tailwindcss`, `postcss`, `autoprefixer`.

### Backend (główne)
- `express`, `cors`, `helmet`, `morgan`,
- `@prisma/client`, `prisma`,
- `bcryptjs`, `jsonwebtoken`, `dotenv`.

## 5. Model danych (Prisma)

Kluczowe encje:
- `User` (role: `USER`/`ADMIN`, status rejestracji),
- `Car` + `CarImage` (aukcje/importy),
- `Offer` (oferty użytkowników),
- `Favorite` (ulubione),
- `ImportJob` (historia importów plików JSON/FTP).

Projekt obsługuje zarówno dane aukcyjne z API/importu, jak i proces ofertowania użytkowników.

## 6. Integracje i przepływy biznesowe

1. Frontend dynamicznie wykrywa URL API (`frontend/src/lib/api.ts`), sondując `/api/health` dla kilku kandydatów.
2. Backend wystawia endpointy dla auth, aut, ofert, ulubionych i admina.
3. Watcher FTP cyklicznie pobiera JSON i obrazy, zapisuje je lokalnie i publikuje przez statyczny mount.
4. Importy są wersjonowane checksumą i logowane do `ImportJob`.

## 7. Wnioski architektoniczne

- Monorepo jest spójnie zorganizowane i gotowe do deployu przez Render/Vercel.
- Dane domenowe są dobrze odseparowane (frontend/backend/shared + Prisma).
- W repo znajdują się dane i hasła przykładowe/deployowe w jawnym tekście (README i `render.yaml`) — warto rozważyć ich rotację oraz przeniesienie do sekretów środowiskowych.
- Mechanizm automatycznego fallbacku API po stronie frontendu zwiększa odporność na problemy z pojedynczym hostem.

## 8. Podsumowanie

Repozytorium jest dojrzałym projektem aplikacji aukcyjnej (MVP+/produkcyjne wdrożenie) z:
- panelem użytkownika i administracyjnym,
- wielojęzycznym frontendem,
- backendem z autoryzacją JWT,
- trwałym importem danych i obrazów z FTP,
- zautomatyzowaną infrastrukturą wdrożeniową.
