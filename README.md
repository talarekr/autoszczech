# AutoSzczech (etap 1 — produkcyjnie, bez uploadu zdjęć)

**Stack:** React + Tailwind + i18next (PL/EN/DE) | Node.js + Express + Prisma + PostgreSQL | Panel admina `/admin`.

## 1) Konfiguracja
1. Skopiuj `.env.example` do `.env` i uzupełnij `DATABASE_URL`, `JWT_SECRET`.
2. Ustaw `VITE_API_URL` (domyślnie: https://autoszczech-api.onrender.com).

## 2) Render (backend + DB)
- Utwórz PostgreSQL w Render → skopiuj `DATABASE_URL`.
- **Build Command:** `npm run prisma:generate && npm run prisma:migrate && npm run prisma:seed`
- **Start Command:** `npm run start`

## 3) Vercel (frontend)
- Importuj folder `frontend/`
- Ustaw Environment Variable: `VITE_API_URL` = URL backendu, np. `https://autoszczech-api.onrender.com`

## Dane logowania administratora
- **E-mail:** talarekr@gmail.com
- **Hasło:** ChangeMe123! (z seed) — zmień po 1. logowaniu
- **Panel:** `/admin`
