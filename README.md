# AutoSzczech (etap 1 — produkcyjnie, bez uploadu zdjęć)

**Stack:** React + Tailwind + i18next (PL/EN/DE) | Node.js + Express + Prisma + PostgreSQL | Panel admina `/admin`.

## 1) Konfiguracja
1. Skopiuj `.env.example` do `.env` i uzupełnij `DATABASE_URL`, `JWT_SECRET` (tylko jeśli chcesz uruchomić backend lokalnie, poza Renderem).
2. Ustaw `VITE_API_URL` (domyślnie: aplikacja automatycznie wybiera działające API, sprawdzając kolejno aktualny origin, `https://autoszczech-backend.onrender.com`, następnie `https://autoszczech.ch`, a w razie potrzeby `https://autoszczech-api.onrender.com`; w trybie developerskim front korzysta z `http://localhost:10000`).

## 2) Render (backend + DB)
- **Blueprint w repozytorium**: plik `render.yaml` automatycznie tworzy usługę backendu, bazę PostgreSQL oraz ustawia wszystkie zmienne środowiskowe (łącznie z danymi FTP). Dodatkowo podłącza dysk `ftp-import-cache`, aby zdjęcia pobrane z FTP nie znikały po restarcie. W panelu Render wybierz **New ➜ Blueprint**, wskaż repozytorium i zatwierdź – platforma sama podstawi `DATABASE_URL`, `JWT_SECRET`, itp. Po dodaniu custom domeny `autoszczech.ch` w Renderze podłącz ją do usługi backendu (opcje **Custom Domains** ➜ `autoszczech.ch`) i zostaw zmienną `PUBLIC_BACKEND_URL=https://autoszczech.ch`, aby linki do zdjęć z importu FTP wskazywały nowy host.
- Jeśli wolisz konfigurację ręczną:
  - Utwórz usługę PostgreSQL w Render i skopiuj `DATABASE_URL`.
  - **Build Command:** `npm run prisma:generate && npm run prisma:migrate && npm run prisma:seed`
  - **Start Command:** `npm run start`

## 3) Vercel (frontend)
- Importuj folder `frontend/`
- Ustaw Environment Variable: `VITE_API_URL` = URL backendu (np. `https://autoszczech-backend.onrender.com` albo inny host); ewentualne końcówki `/api` są automatycznie usuwane, a jeśli zmienna nie jest ustawiona, frontend sam przetestuje dostępne adresy i wybierze działający backend.

## 4) Automatyczny import JSON + zdjęć z zewnętrznego FTP
- Watcher działa domyślnie (`FTP_IMPORT_ENABLED=true`) i co 30 minut sprawdza katalog `uploads/json` na serwerze `hosting2580517.online.pro` (login `hosting2580517`, hasło `autoszczech12!!`).
- Do działania wymagany jest `curl` (Render/Linux mają go preinstalowanego). Każdy plik `.json` jest pobierany, analizowany i – jeżeli suma kontrolna SHA-256 zmieniła się – importowany jako nowa lub zaktualizowana aukcja.
- Podczas importu dla każdej oferty pobierane są również zdjęcia z katalogu `uploads/images`. Pliki trafiają lokalnie do `storage/ftp-images/<ID_AUKCJI>/`, a backend udostępnia je pod adresem `http(s)://.../uploads/ftp/...`. Dzięki temu frontend otrzymuje gotowe, publiczne URL-e obrazków.
- Historia importów zapisywana jest w tabeli `ImportJob` (łącznie z błędami parsowania), aby łatwo sprawdzić, które pliki zostały przetworzone.
- W razie potrzeby możesz ręcznie wyzwolić pojedynczy cykl importu oraz podejrzeć ostatni wynik: `POST /api/admin/ftp/run` (lub `GET /api/admin/ftp/status`). Endpoints wymagają tokenu admina (np. zaloguj się na `talarekr@gmail.com` / `ChangeMe123!`, pobierz token JWT i dodaj nagłówek `Authorization: Bearer <token>`).
- Najważniejsze zmienne środowiskowe (jeśli chcesz zmienić domyślne wartości):
  - `FTP_HOST`, `FTP_PORT`, `FTP_USER`, `FTP_PASSWORD` – dane logowania do zewnętrznego FTP.
  - `FTP_JSON_DIRECTORY` – katalog z plikami `.json` (domyślnie `uploads/json`).
  - `FTP_IMAGE_DIRECTORY` – katalog ze zdjęciami (domyślnie `uploads/images`).
  - `FTP_POLL_INTERVAL_MS` – okres odpytywania w milisekundach (domyślnie 1 800 000 ms = 30 minut).
  - `FTP_PUBLIC_IMAGE_BASE` – publiczny URL bazowy dla zdjęć (domyślnie `http://localhost:<PORT>/uploads/ftp`, albo wartość z `PUBLIC_BACKEND_URL`).
  - `FTP_LOCAL_IMAGE_DIR` – lokalna ścieżka do katalogu przechowywania zdjęć (domyślnie `storage/ftp-images`).
  - `FTP_FALLBACK_PROVIDER` – nazwa partnera, gdy JSON nie zawiera prefiksu oferty.
  - `FTP_MAX_DOWNLOAD_MB` – maksymalny rozmiar pojedynczego pobrania (domyślnie 25 MB).

> W logach backendu pojawi się wpis `Watching ftp://.../uploads/json` oraz raporty `Imported ... added=...`. Problemy ze zdjęciami lub parsowaniem są logowane i zapisywane w kolumnie `errors` tabeli `ImportJob`.

## 5) Paczki do GitHuba
Jeżeli chcesz dostarczyć projekt komuś bez znajomości Git, możesz wykorzystać gotowe archiwa lub wygenerować nowe.

### Nowa paczka `.zip` pod GitHuba
1. Uruchom w katalogu projektu: `./scripts/create-github-package.sh`.
   - Opcjonalnie podaj nazwę pliku oraz katalog główny wewnątrz archiwum, np. `./scripts/create-github-package.sh autoszczech.zip autoszczech-main`.
2. Powstały plik `.zip` zawiera wszystkie śledzone przez Git pliki (bez `node_modules` oraz bez wcześniejszych paczek dzięki regułom `export-ignore`).
3. Gotowy plik możesz wgrać jako _Release asset_ lub przekazać komuś do `git init && git add . && git commit ...`.

> Nadal dostępny jest skrypt `./scripts/create-main-archive.sh`, jeżeli preferujesz archiwum `.tar.gz`.

### Gotowe archiwa w repozytorium

- `autoszczech-github.zip` — najnowszy snapshot projektu w formacie `.zip`, gotowy do wgrania na GitHuba.
- `autoszczech-github.zip.b64.single` — ten sam snapshot zakodowany Base64 w pojedynczej linii (idealny np. do przekazania w czacie).
- `autoszczech-main.tar.xz.b64` — snapshot Base64 (`xz`), jeśli potrzebujesz ultralekkiego transferu (z dołączonym wariantem jednolinijkowym `autoszczech-main.tar.xz.b64.single`).

#### Dekodowanie `autoszczech-github.zip.b64.single`

```bash
base64 -d autoszczech-github.zip.b64.single > autoszczech-github.zip
```

> Plik jest już jednolinijkowy, dlatego nie trzeba usuwać znaków nowej linii.

#### Dekodowanie `autoszczech-main.tar.xz.b64`

Aby zdekodować archiwum Base64:

1. Usuń ewentualne nowe linie: `tr -d '\n' < autoszczech-main.tar.xz.b64 > autoszczech-main.tar.xz.b64.single`
2. Zdekoduj Base64: `base64 -d autoszczech-main.tar.xz.b64 > autoszczech-main.tar.xz`
3. Rozpakuj archiwum: `tar -xJf autoszczech-main.tar.xz`

- Po zdekodowaniu otrzymasz archiwum ~0,17 MB (`xz`) zawierające wyłącznie pliki źródłowe (bez `node_modules`).
- Sumę kontrolną snapshotu sprawdzisz poleceniem: `sha256sum autoszczech-main.tar.xz` (oczekiwany hash: `120b6023a5d24eeedee0652ffca6e794266dd6bb03608d788f0cbb060c2cbf9d`).

### Paczki do wdrożenia

- `autoszczech-deploy.tar.gz` — archiwum wygenerowane ze skryptu `scripts/create-main-archive.sh`, gotowe do wgrania na serwer. Zawiera wszystkie pliki śledzone przez Git z katalogiem głównym `autoszczech/`.

### Plik `codex`

- `codex.tar.xz` — archiwum z pełnym snapshotem repozytorium, gotowe do wczytania w nowej sesji Codex.
  - Aby uzyskać wariant Base64 (`codex.b64`), użyj polecenia: `base64 codex.tar.xz > codex.b64`.
  - Aby wypakować archiwum lokalnie: `tar -xJf codex.tar.xz`.

### Wymuszenie podmiany zdalnej gałęzi `main`

Jeżeli repozytorium na GitHubie posiada już historię, a chcesz ją zastąpić aktualnym stanem projektu, skorzystaj ze skryptu:

```bash
./scripts/reset-remote-main.sh origin main
```

Skrypt utworzy tymczasową gałąź z pojedynczym commitem i wykona `git push --force` do wskazanego zdalnego repozytorium (`origin`) i gałęzi (`main`). Po zakończeniu wróci na poprzednią gałąź lokalną i usunie gałąź tymczasową.

> **Uwaga:** przed uruchomieniem upewnij się, że drzewo robocze jest czyste (`git status --porcelain`) oraz że masz uprawnienia do wymuszonego pushowania do `main`.

## Dane logowania administratora
- **E-mail:** talarekr@gmail.com
- **Hasło:** ChangeMe123! (z seed) — zmień po 1. logowaniu
- **Panel:** `/admin`
- Formularz logowania na froncie łączy się bezpośrednio z API i zapisuje token JWT (przechowywany w localStorage tylko przy zaznaczeniu „Zapamiętaj mnie”). Panel administracyjny wciąż posiada ręczny importer, ale domyślnie oferty spływają automatycznie z FTP – ręczne wgrywanie JSON-ów jest potrzebne tylko awaryjnie.
