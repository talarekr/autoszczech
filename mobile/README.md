# AutoSzczech Mobile (iOS)

Aplikacja mobilna Expo/React Native korzystająca z backendu AutoSzczech.

## Czy da się zainstalować lokalnie na iPhone bez publikacji w App Store?
Tak, są 2 opcje:

1. **Expo Go (najszybciej, dev):** uruchamiasz `npm run start -w mobile` i otwierasz projekt na iPhonie przez QR.
2. **Build `.ipa` bez App Store (sideload):**
   - lokalnie przez Xcode (`expo run:ios --device`) lub
   - przez EAS internal distribution (`eas build --profile preview --platform ios`).

> To jest instalacja **bez publikacji** w App Store. Przy iOS nadal potrzebujesz konta Apple Developer (zwłaszcza dla stabilnej dystrybucji na urządzeniach).

## Wymagania
- Node 18+
- npm
- Dla instalacji bezpośredniej na urządzeniu: macOS + Xcode
- Backend API dostępny publicznie (np. Render)

## Konfiguracja

```bash
npm install
export EXPO_PUBLIC_API_URL="https://autoszczech-backend.onrender.com"
```

## Uruchomienie

```bash
npm run start -w mobile
```

lub emulator/symulator:

```bash
npm run ios -w mobile
```

## Build iOS do testów (bez App Store)

### EAS internal distribution

```bash
npm install -g eas-cli
cd mobile
eas login
eas build --profile preview --platform ios
```

Po zakończeniu builda dostaniesz link instalacyjny do `.ipa` (dystrybucja wewnętrzna).
