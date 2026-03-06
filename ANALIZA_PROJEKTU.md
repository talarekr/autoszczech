# Analiza projektu AutoSzczech

## 1) Charakter i zakres repozytorium

Repozytorium `autoszczech` to istniejące monorepo oparte o **npm workspaces**, które zawiera kompletną aplikację produkcyjną:

- **frontend**: React + Vite + Tailwind + i18next,
- **backend**: Node.js + Express + Prisma + PostgreSQL,
- **shared**: logika współdzielona dla importerów.

Projekt jest przygotowany do utrzymania i wdrażania (Render + Vercel), z gotową dokumentacją operacyjną i skryptami pomocniczymi.

## 2) Struktura katalogów

### Root

- `package.json` – konfiguracja workspace’ów (`backend`, `frontend`).
- `package-lock.json` – wspólny lockfile.
- `README.md` – instrukcje konfiguracji, deployu i utrzymania.
- `.env.example` – przykładowe zmienne środowiskowe.
- `render.yaml` – blueprint backendu i bazy PostgreSQL na Render.
- `scripts/` – skrypty operacyjne (pakowanie archiwów, reset zdalnego `main`).
- `ANALIZA_PROJEKTU.md` – dokument analizy technicznej.

### Backend (`backend/`)

- `src/index.ts` – bootstrap Express, middleware, trasy API, uruchamianie watchera FTP.
- `src/start.ts` – start aplikacji ze ścieżką builda produkcyjnego.
- `src/routes/` – endpointy (`auth`, `cars`, `offers`, `favorites`, `import`, `admin`).
- `src/lib/` – moduły narzędziowe (Prisma, JWT, SMTP, FTP config, importer).
- `src/jobs/ftpWatcher.ts` – harmonogram i cykliczne uruchamianie importu.
- `src/middleware/` – autoryzacja i walidacje po stronie API.
- `prisma/schema.prisma` + `prisma/migrations/` – model danych i migracje.

### Frontend (`frontend/`)

- `src/main.tsx`, `src/App.tsx` – punkt wejścia i routing.
- `src/pages/` – strony publiczne i panel administracyjny.
- `src/components/` – komponenty wielokrotnego użytku.
- `src/contexts/` – konteksty aplikacyjne.
- `src/lib/` – helpery i warstwa API.
- `src/i18n.ts` – konfiguracja internacjonalizacji.
- `vite.config.ts`, `tailwind.config.cjs`, `postcss.config.cjs` – konfiguracja toolingu.
- `vercel.json` – konfiguracja wdrożenia frontendu i proxy tras.

### Shared (`shared/`)

- `shared/importers/insurance.ts` – współdzielony parser/importer danych.

## 3) README i dokumentacja operacyjna

`README.md` zawiera pełen przepływ utrzymaniowy:

1. konfigurację środowiska lokalnego i produkcyjnego,
2. wdrożenie backendu + DB przez Render Blueprint,
3. wdrożenie frontendu na Vercel,
4. automatyczny import JSON + zdjęć z FTP,
5. endpointy administracyjne importu,
6. generowanie paczek/snapshotów do dystrybucji,
7. procedury awaryjne (m.in. reset zdalnej gałęzi `main`).

Dokumentacja jest praktyczna i nastawiona na pracę operacyjną, a nie tylko uruchomienie developmentowe.

## 4) Konfiguracja i zależności

### Monorepo

- Root definiuje `workspaces: ["backend", "frontend"]`.
- Całość korzysta ze wspólnego lockfile (`package-lock.json`).

### Backend (`backend/package.json`)

**Kluczowe zależności runtime**:

- API i middleware: `express`, `cors`, `helmet`, `morgan`.
- Dostęp do danych: `@prisma/client`, `prisma`.
- Uwierzytelnianie: `jsonwebtoken`, `bcryptjs`.
- Konfiguracja: `dotenv`.

**Tooling/dev**:

- `typescript` + `@types/*`.

**Skrypty**:

- `dev` – development serwera,
- `build` – `prisma generate && tsc`,
- `start` / `start:prod` – start środowiska produkcyjnego,
- `prisma:*` – operacje na migracjach i seedzie.

### Frontend (`frontend/package.json`)

**Kluczowe zależności runtime**:

- UI i routing: `react`, `react-dom`, `react-router-dom`.
- Komunikacja: `axios`.
- i18n: `i18next`, `react-i18next`.

**Tooling/dev**:

- `vite`, `@vitejs/plugin-react`,
- `tailwindcss`, `postcss`, `autoprefixer`,
- `typescript`.

**Skrypty**:

- `dev`, `build`, `preview` (standardowy workflow Vite).

## 5) Warstwa danych i domena (Prisma)

Na podstawie struktury backendu i dokumentacji projekt obejmuje m.in. encje:

- `User` (role i statusy użytkowników),
- `Car` + `CarImage` (aukcje i zdjęcia),
- `Offer` (oferty składane przez użytkowników),
- `Favorite` (ulubione aukcje),
- `ImportJob` (historia importów FTP i błędów).

Model jest zorientowany na obsługę listowania aukcji, działań użytkownika i automatycznego importu danych zewnętrznych.

## 6) Spójność konfiguracji (obserwacje)

Analiza wykazała kilka istotnych punktów utrzymaniowych:

1. **Nazwy zmiennych FTP w dokumentacji vs kodzie**
   - Kod (`backend/src/lib/ftpConfig.ts`) używa m.in. `FTP_JSON_DIRECTORY`, `FTP_IMAGE_DIRECTORY`, `FTP_PUBLIC_IMAGE_BASE`, `FTP_LOCAL_IMAGE_DIR`.
   - `.env.example` nadal zawiera historyczne nazwy (`FTP_DIRECTORY`, `FTP_IMAGE_BASE_URL`), które nie odpowiadają aktualnej konfiguracji parsera.

2. **Fallback credentials w `ftpConfig.ts`**
   - W kodzie obecne są domyślne fallbacki dla `FTP_HOST`, `FTP_USER`, `FTP_PASSWORD`.
   - Technicznie działa to jako zabezpieczenie przed pustą konfiguracją, ale produkcyjnie zalecane jest pełne nadpisanie ENV i traktowanie fallbacków jako pomoc deweloperska.

3. **Wydajność bundla frontendu**
   - Build frontendu przechodzi poprawnie, ale Vite zgłasza ostrzeżenie o chunku >500 kB.
   - To sygnał do ewentualnego code-splittingu (np. dynamic import dla cięższych widoków panelu).

## 7) Weryfikacja techniczna wykonana podczas analizy

Wykonano lokalne buildy obu workspace’ów:

- `npm run build --prefix backend` ✅
- `npm run build --prefix frontend` ✅

Wyniki:

- oba buildy zakończone sukcesem,
- pojawia się nieblokujące ostrzeżenie npm o `Unknown env config "http-proxy"`,
- frontend zwraca informacyjne ostrzeżenie Vite dotyczące rozmiaru paczki.

## 8) Podsumowanie

Repozytorium jest spójnym, działającym projektem produkcyjnym, a nie szkieletem startowym. Najważniejsze obszary do dalszej poprawy operacyjnej:

- ujednolicenie nazewnictwa zmiennych FTP między `.env.example`, README i kodem,
- przegląd domyślnych fallbacków konfiguracyjnych pod kątem bezpieczeństwa,
- optymalizacja rozmiaru bundle frontendu (code-splitting i manual chunks).
