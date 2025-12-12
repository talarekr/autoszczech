# Migracja kodu z projektu "vehicle auction portal"

Dotychczasowe repozytorium nie zawiera plików z tamtego zadania. Aby kontynuować pracę z kodem poprzedniego projektu w tej bazie, przygotuj jedną z poniższych ścieżek:

1. **Masz archiwum (.zip/.tar.gz)**
   - Skopiuj archiwum do katalogu głównego repozytorium.
   - Rozpakuj je do tymczasowego katalogu, np. `tmp-vehicle-portal/`.
   - Zweryfikuj strukturę (`frontend/`, `backend/`, pliki konfiguracyjne) i ręcznie przenieś odpowiednie pliki do aktualnych folderów.
   - Uruchom `git status`, aby sprawdzić, które pliki zostały dodane/zmienione.

2. **Masz zdalne repozytorium Git**
   - Dodaj zdalne źródło: `git remote add portal <URL>` (lub użyj istniejącej nazwy).
   - Pobierz historię: `git fetch portal`.
   - W razie potrzeby wykonaj `git checkout -b portal-import portal/main` i skopiuj potrzebne katalogi do bieżącej gałęzi.
   - Po przeniesieniu plików wróć na gałąź `work` i wykonaj merge lub cherry-pick odpowiednich commitów.

3. **Brak dostępu do kodu**
   - Poproś o link do repozytorium lub archiwum z projektem.
   - Bez źródeł migracja nie jest możliwa.

Po przeniesieniu plików zbuduj i przetestuj projekt (`npm install`, `npm run lint`, testy backendu/frontendu), aby upewnić się, że import jest kompletny.
