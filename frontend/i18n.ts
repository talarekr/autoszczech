import i18n from "i18next";
import { initReactI18next } from "react-i18next";

export const resources = {
  pl: {
    translation: {
      common: {
        languageSwitcherLabel: "Wybierz język", 
        languages: {
          pl: "Polski",
          en: "English",
          de: "Deutsch",
        },
        fuel: {
          any: "Dowolne paliwo",
          petrol: "Benzyna",
          diesel: "Diesel",
          electric: "Elektryczny",
          hybrid: "Hybryda",
          lpg: "LPG",
          other: "Inne",
        },
        transmission: {
          any: "Dowolna",
          automatic: "Automatyczna",
          manual: "Manualna",
          semiAutomatic: "Półautomatyczna",
          other: "Inna",
        },
        auctionStatus: {
          all: "Wszystkie",
          active: "Aktywna",
          planned: "Zaplanowana",
          finished: "Zakończona",
        },
        ticketPriority: {
          high: "Wysoki",
          medium: "Średni",
          low: "Niski",
        },
        ticketStatus: {
          new: "Nowy",
          inProgress: "W trakcie",
          closed: "Zamknięty",
        },
        userType: {
          buyer: "Kupujący",
          supplier: "Dostawca",
        },
      },
      nav: {
        auctions: "Licytacje",
        clientPanel: "Panel klienta",
        howToBuy: "Jak kupować",
        contact: "Kontakt",
        transportCalculator: "Kalkulator transportu",
        register: "Rejestracja",
        login: "Zaloguj",
        logout: "Wyloguj",
        backHomeAria: "Powrót do strony głównej",
        loginAria: "Przejdź do logowania",
      },
      footer: {
        terms: "Regulamin",
        privacy: "Polityka prywatności",
        cookies: "Pliki cookies",
        admin: "Panel administracyjny",
      },
      calculator: {
        badge: "CHF → PLN",
        heading: "Kalkulator kursów",
        description: "Wpisz kwotę w CHF, a kalkulator przeliczy ją na PLN.",
        amountLabel: "Podaj kwotę",
        amountPlaceholder: "Wpisz kwotę",
        amountAria: "Kwota w frankach szwajcarskich",
        rateLabel: "Aktualny kurs NBP",
        rateValueLabel: "1 CHF =",
        rateSource: "Tabela A NBP",
        rateUpdated: "Aktualizacja z dnia {{date}}",
        rateLoading: "Trwa pobieranie aktualnego kursu…",
        rateError: "Nie udało się pobrać kursu. Używamy ostatniej zapisanej wartości.",
        resultLabel: "Cena po przeliczeniu",
        resultPlaceholder: "—",
      },
      transportCalculator: {
        badge: "Transport",
        title: "Kalkulator transportu",
        lead: "Oblicz orientacyjny koszt cła oraz transportu pojazdu z aukcji do Polski.",
        auctionLabel: "Kwota aukcji z prowizją",
        auctionPlaceholder: "np. 45 000",
        auctionHint: "Cło liczymy od kwoty aukcji razem z prowizją.",
        vehicleLabel: "Rodzaj pojazdu",
        vehicleHint: "Stawka transportu zależy od gabarytu pojazdu.",
        costIncludes: "Stała cena transportu krajowego do Polski.",
        summary: {
          title: "Podsumowanie",
          description: "Wyliczenia bazują na cłach 10% i stałych stawkach transportu.",
          auctionValue: "Cena aukcji (z prowizją)",
          auctionPlaceholder: "— wpisz kwotę aukcji —",
          customs: "Cło (10% wartości)",
          transport: "Transport do Polski",
          importSubtotal: "Razem cło + transport",
          total: "Łącznie z ceną aukcji",
        },
        types: {
          car: "Samochód osobowy",
          vanL1L2: "Dostawczy L1–L2",
          vanL3L4: "Dostawczy L3–L4",
          motorcycle: "Motocykl",
        },
        notes: {
          duty: "Cło to 10% kwoty aukcji z prowizją.",
          disclaimer: "Wynik ma charakter poglądowy i nie obejmuje VAT ani opłat portowych.",
        },
      },
      home: {
        hero: {
          tagline: "import premium",
          title: "Import pojazdów prosto ze Szwajcarii",
          description: "Wyszukaj oferty samochodów, motocykli i pojazdów specjalnych od zaufanych partnerów z całej Europy.",
          points: {
            access: "Dostęp do aukcji 24/7",
            verified: "Weryfikowani dostawcy i przejrzyste warunki",
            logistics: "Pełna obsługa logistyczna i kalkulator transportu",
          },
        },
        search: {
          badge: "Wyszukiwarka ofert",
          title: "Znajdź wymarzony pojazd",
          queryLabel: "Szukaj frazy, np. marka samochodu",
          queryPlaceholder: "np. Audi A4",
          yearFrom: "Rok produkcji od",
          yearTo: "Rok produkcji do",
          fuel: "Rodzaj paliwa",
          transmission: "Skrzynia biegów",
          submit: "Szukaj ofert",
          reset: "Wyczyść filtry",
        },
        listings: {
          heading: "Aktualne aukcje",
          subheading: "Przeglądaj oferty zweryfikowanych dostawców.",
          sortLabel: "Sortuj:",
          sort: {
            endingAsc: "Czas do końca — rosnąco",
            endingDesc: "Czas do końca — malejąco",
            newest: "Najnowsze oferty",
          },
          demoMode: "Nie udało się połączyć z API. Wyświetlamy dane demonstracyjne.",
          loading: "Ładowanie ofert…",
          error: "Nie udało się pobrać ofert. Spróbuj ponownie później.",
          empty: "Brak wyników dla wybranych filtrów. Zmień kryteria wyszukiwania.",
        },
        watchlist: {
          title: "Obserwuj nowe oferty",
          description:
            "Uzupełnij pole o interesujące Cię modele pojazdów, a otrzymasz aktualizacje na Twój adres e-mail w chwili pojawienia się nowych ofert.",
          placeholder: "Np. Audi Q5, BMW X3, Mercedes GLC",
          button: "Zapisz się",
          consent:
            "Zapisując się akceptujesz politykę prywatności i wyrażasz zgodę na przesyłanie informacji handlowych drogą elektroniczną.",
        },
        transport: {
          title: "Kalkulator transportu",
          description:
            "Sprawdź koszty dostawy pojazdu na terenie Europy. Wybierz kraj załadunku i rozładunku, a otrzymasz przybliżoną wycenę.",
          button: "Przejdź do kalkulatora",
          helpTitle: "Potrzebujesz pomocy?",
          phone: "Zadzwoń: +48 123 456 789",
          email: "Napisz: kontakt@autoszczech.pl",
        },
      },
      carCard: {
        noImage: "Brak zdjęcia",
        firstRegistration: "Data pierwszej rejestracji",
        mileage: "Przebieg",
        productionYear: "Rok produkcji",
        fuel: "Rodzaj paliwa",
        transmission: "Skrzynia biegów",
        auctionEndDate: "Data zakończenia aukcji",
        auctionEndsIn: "Koniec aukcji za",
        viewDetails: "Zobacz szczegóły",
      },
      carDetails: {
        back: "← Wstecz",
        returnToList: "← Powrót do listy aukcji",
        loading: "Ładowanie…",
        fetchError: "Nie udało się pobrać danych pojazdu.",
        notFound: "Oferta nie została znaleziona.",
        demoMode: "Nie udało się połączyć z API. Wyświetlamy dane demonstracyjne.",
        galleryAlt: "Miniatura pojazdu",
        noImage: "Brak zdjęcia",
        vehicleInfo: "Informacje o pojeździe",
        info: {
          mileage: "Przebieg",
          firstRegistration: "Data pierwszej rejestracji",
          productionYear: "Rok produkcji",
          fuel: "Rodzaj paliwa",
          transmission: "Skrzynia biegów",
        },
        countdown: {
          title: "Koniec aukcji",
          noDate: "Data w przygotowaniu",
        },
        offerForm: {
          title: "Złóż ofertę",
          highestBid: "Najwyższa oferta",
          minimumBid: "Minimalna kolejna oferta",
          amountLabel: "Kwota oferty (PLN)",
          submit: "Potwierdź ofertę",
          submitting: "Zapisywanie oferty…",
          success: "Twoja oferta na kwotę {{amount}} została zapisana.",
          invalidAmount: "Wprowadź poprawną kwotę oferty.",
          tooLow: "Kwota oferty musi wynosić co najmniej {{amount}}.",
          notLoggedIn: "Zaloguj się, aby złożyć ofertę.",
          unauthorized: "Sesja wygasła. Zaloguj się ponownie, aby licytować.",
          serverErrorDetails: "Nie udało się zapisać oferty: {{message}}.",
          serverError: "Nie udało się zapisać oferty. Spróbuj ponownie za chwilę.",
        },
        loginRequired: {
          title: "Licytacja możliwa tylko dla zalogowanych",
          message: "Aby móc wziąć udział w licytacji na stronie, musisz",
          loginLink: "zalogować",
          afterLoginLink: "się na swoje konto. Nie masz jeszcze konta?",
          registerLink: "Przejdź do rejestracji",
        },
        description: {
          title: "Opis pojazdu",
          fallback: "Sprzedający nie dodał rozszerzonego opisu pojazdu.",
        },
        specs: {
          vin: "VIN",
          registrationNumber: "Numer rejestracyjny",
          firstRegistration: "Data pierwszej rejestracji",
          startDate: "Data rozpoczęcia",
          endDate: "Data zakończenia",
        },
      },
      clientPanel: {
        badge: "Konto klienta",
        title: "Panel klienta",
        subtitle:
          "Zarządzaj swoimi licytacjami, sprawdzaj status dostaw i historię wygranych ofert w jednym miejscu.",
        loggedInAs: "Zalogowano jako {{email}}",
        unauthorized: {
          badge: "Wymagane logowanie",
          title: "Zaloguj się, aby zobaczyć panel klienta",
          description:
            "Dostęp do historii licytacji i wygranych ofert jest możliwy po zalogowaniu. Skorzystaj z konta, aby zarządzać aukcjami.",
          login: "Przejdź do logowania",
          register: "Załóż nowe konto",
        },
        history: {
          heading: "Historia licytacji",
          description: "Śledź postęp trwających aukcji i reaguj na przelicytowania.",
          backToAuctions: "Powrót do aukcji",
          loading: "Ładuję historię Twoich ofert…",
          loadError: "Nie udało się pobrać historii ofert. Spróbuj ponownie.",
          empty: "Nie brałeś jeszcze udziału w żadnej licytacji.",
        },
        wins: {
          heading: "Wygrane oferty",
          description: "Podsumowanie pojazdów, które wygrałeś w ostatnim czasie.",
          empty: "Nie masz jeszcze wygranych aukcji.",
        },
        status: {
          leading: "Prowadzisz",
          outbid: "Przelicytowano Cię",
          awaiting: "Oczekuje na rozstrzygnięcie",
        },
        deliveryStatus: {
          delivered: "Dostarczono",
          inTransit: "W transporcie",
          scheduled: "Dostawa zaplanowana",
        },
        fields: {
          lastBid: "Twoja ostatnia oferta",
          lastBidDate: "Data ostatniej oferty",
          totalBids: "Liczba ofert",
          totalBidsValue_one: "{{count}} oferta",
          totalBidsValue_few: "{{count}} oferty",
          totalBidsValue_many: "{{count}} ofert",
          totalBidsValue_other: "{{count}} ofert",
          firstRegistration: "Pierwsza rejestracja",
          mileage: "Aktualny przebieg",
          finalPrice: "Cena końcowa",
          wonAt: "Data wygranej",
        },
        actions: {
          viewOffer: "Zobacz ofertę",
        },
      },
      login: {
        badge: "Logowanie",
        title: "Zaloguj się do konta kupującego",
        description:
          "Użyj adresu e-mail i hasła ustawionego podczas rejestracji, aby zalogować się do serwisu. Formularz łączy się z API i umożliwia dostęp do funkcji klienta oraz panelu administratora.",
        email: "Adres e-mail",
        password: "Hasło",
        remember: "Zapamiętaj mnie na tym urządzeniu",
        submit: "Zaloguj się",
        loading: "Logowanie…",
        errorMissing: "Podaj adres e-mail i hasło.",
        errorInvalid: "Nieprawidłowy adres e-mail lub hasło.",
        errorServer: "Nie udało się połączyć z serwerem. Spróbuj ponownie.",
        success: "Zalogowano pomyślnie. Za chwilę nastąpi przekierowanie.",
        noAccountTitle: "Nie masz jeszcze konta?",
        noAccountDescription:
          "Skorzystaj z formularza rejestracyjnego, aby uzyskać dostęp do aukcji i pełnej historii licytacji. Po aktywacji konta otrzymasz wiadomość e-mail z potwierdzeniem.",
        registerCta: "Przejdź do rejestracji",
      },
      register: {
        badge: "Rejestracja",
        title: "Załóż konto kupującego",
        description:
          "Aby uzyskać pełny dostęp do zasobów AutoSzczech i składać oferty na aukcjach, uzupełnij wymagane dane i zaakceptuj formularz.",
        personalData: "Dane osobowe",
        submit: "Zarejestruj się",
        success:
          "Dziękujemy! Formularz został wysłany do weryfikacji. Skontaktujemy się z Tobą w ciągu 24 godzin.",
        consent:
          "Akceptuję warunki korzystania z serwisu i wyrażam zgodę na przetwarzanie danych osobowych w celu obsługi konta i licytacji.",
        fields: {
          firstName: "Imię",
          middleName: "Drugie imię",
          lastName: "Nazwisko",
          email: "Adres e-mail",
          phone: "Numer telefonu",
          password: "Hasło",
          confirmPassword: "Powtórz hasło",
          country: "Kraj zamieszkania",
          postalCode: "Kod pocztowy",
          city: "Miasto",
          street: "Ulica",
          houseNumber: "Nr domu",
          apartmentNumber: "Nr mieszkania",
          birthDate: "Data urodzenia",
          taxId: "NIP",
        },
        placeholders: {
          postalCode: "00-000",
          taxId: "Opcjonalnie",
        },
        countries: {
          poland: "Polska",
          germany: "Niemcy",
          czechia: "Czechy",
          slovakia: "Słowacja",
          switzerland: "Szwajcaria",
        },
      },
      admin: {
        badge: "Panel administracyjny",
        title: "Zarządzanie platformą AutoSzczech",
        description:
          "Monitoruj aukcje, kontroluj nowych użytkowników i reaguj na zgłoszenia partnerów w jednym miejscu.",
        integrator: {
          title: "Importer ofert z plików JSON",
          description:
            "Wgraj pliki otrzymane od ubezpieczycieli, aby błyskawicznie dodać samochody do katalogu.",
          fileLabel: "Pliki JSON z ofertami",
          baseUrlLabel: "Adres katalogu ze zdjęciami (opcjonalnie)",
          baseUrlHelp:
            "Jeśli zdjęcia znajdują się w jednym katalogu, podaj jego adres – nazwy plików zostaną dołączone automatycznie.",
          importButton: "Importuj oferty",
          importing: "Importuję…",
          summary: {
            title: "Podsumowanie importu",
            total: "Łącznie: {{count}} ofert",
            preview: "Dodane: {{added}} · Zaktualizowane: {{updated}} · Pominięte: {{skipped}}",
            addedLabel: "Dodane",
            updatedLabel: "Zaktualizowane",
            skippedLabel: "Pominięte",
            totalLabel: "Łącznie",
          },
          errors: {
            title: "Nie udało się zaimportować części ofert",
            invalidFile: "Nieprawidłowy format pliku.",
            missingId: "Brakuje identyfikatora oferty w jednym z rekordów.",
            noFiles: "Dodaj przynajmniej jeden plik przed importem.",
            parseFailed: "Nie udało się odczytać zawartości pliku JSON.",
            noOffers: "Brak poprawnych ofert do zaimportowania.",
            uploadFailed: "Nie udało się zapisać danych na serwerze. Spróbuj ponownie.",
            authRequired: "Zaloguj się jako administrator, aby zapisać oferty w systemie.",
          },
          authHint: "Aby importować oferty bezpośrednio do bazy, zaloguj się na konto administratora przed wgraniem plików.",
        },
        filters: {
          providerAll: "Wszyscy dostawcy",
          searchPlaceholder: "Szukaj pojazdu, ID lub partnera",
        },
        metrics: {
          active: {
            title: "Aktywne aukcje",
            helper: "+12% vs zeszły tydzień",
          },
          planned: {
            title: "Zaplanowane aukcje",
            helper: "{{watchers}} obserwujących",
          },
          finished: {
            title: "Zakończone w tym miesiącu",
            helper: "{{value}} łącznej sprzedaży",
          },
          engagement: {
            title: "Zaangażowanie kupujących",
            helper: "{{interested}} zapisanych klientów",
          },
          watchers: {
            title: "Średnia liczba obserwujących",
            helper: "Top 3 aukcje przekroczyły 140",
          },
        },
        tables: {
          auctions: {
            title: "Lista aukcji",
            countLabel: "{{count}} pozycji",
            headers: {
              auction: "Aukcja",
              partner: "Partner",
              status: "Status",
              start: "Start",
              end: "Koniec",
              bids: "Oferty",
              highestBid: "Najwyższa oferta",
              watchers: "Obserwujący",
            },
          },
          vehicles: {
            title: "Pojazdy w katalogu",
            countLabel: "{{count}} rekordy",
            headers: {
              vehicle: "Pojazd",
              parameters: "Parametry",
              provider: "Dostawca",
              status: "Status",
            },
          },
        },
        verification: {
          title: "Do weryfikacji",
          submissions: "{{count}} zgłoszenia",
          summary: "{{suppliers}} dostawców · {{buyers}} kupujących",
          submittedAt: "Zgłoszono:",
        },
        support: {
          title: "Zgłoszenia wsparcia",
          status: "Status:",
        },
        activity: {
          title: "Aktywność zespołu",
        },
        tasks: {
          title: "Zadania operacyjne",
          due: "Do:",
          owner: "Odpowiedzialny:",
        },
        partners: {
          title: "Partnerzy",
          record: "Rekordowa oferta",
          summary: "Aukcje: {{auctions}} · Oferty: {{bids}}",
        },
      },
    },
  },
  en: {
    translation: {
      common: {
        languageSwitcherLabel: "Select language",
        languages: {
          pl: "Polish",
          en: "English",
          de: "German",
        },
        fuel: {
          any: "Any fuel",
          petrol: "Petrol",
          diesel: "Diesel",
          electric: "Electric",
          hybrid: "Hybrid",
          lpg: "LPG",
          other: "Other",
        },
        transmission: {
          any: "Any",
          automatic: "Automatic",
          manual: "Manual",
          semiAutomatic: "Semi-automatic",
          other: "Other",
        },
        auctionStatus: {
          all: "All",
          active: "Active",
          planned: "Planned",
          finished: "Finished",
        },
        ticketPriority: {
          high: "High",
          medium: "Medium",
          low: "Low",
        },
        ticketStatus: {
          new: "New",
          inProgress: "In progress",
          closed: "Closed",
        },
        userType: {
          buyer: "Buyer",
          supplier: "Supplier",
        },
      },
      nav: {
        auctions: "Auctions",
        clientPanel: "Client panel",
        howToBuy: "How to buy",
        contact: "Contact",
        transportCalculator: "Transport calculator",
        register: "Register",
        login: "Log in",
        logout: "Log out",
        backHomeAria: "Back to homepage",
        loginAria: "Go to login",
      },
      footer: {
        terms: "Terms of service",
        privacy: "Privacy policy",
        cookies: "Cookies",
        admin: "Admin panel",
      },
      calculator: {
        badge: "CHF → PLN",
        heading: "Exchange calculator",
        description: "Enter the amount in CHF to convert it into PLN.",
        amountLabel: "Amount",
        amountPlaceholder: "Enter amount",
        amountAria: "Amount in Swiss francs",
        rateLabel: "NBP daily rate",
        rateValueLabel: "1 CHF =",
        rateSource: "NBP Table A",
        rateUpdated: "Updated on {{date}}",
        rateLoading: "Fetching the latest rate…",
        rateError: "We could not refresh the rate. Using the last saved value.",
        resultLabel: "Converted value",
        resultPlaceholder: "—",
      },
      transportCalculator: {
        badge: "Transport",
        title: "Transport calculator",
        lead: "Estimate customs duty and domestic transport for your auction purchase.",
        auctionLabel: "Auction amount incl. commission",
        auctionPlaceholder: "e.g. 45,000",
        auctionHint: "Duty is calculated from the auction price including commission.",
        vehicleLabel: "Vehicle type",
        vehicleHint: "The transport rate depends on the vehicle size.",
        costIncludes: "Flat-rate domestic transport to Poland.",
        summary: {
          title: "Summary",
          description: "We calculate with 10% duty and fixed transport rates.",
          auctionValue: "Auction price (incl. commission)",
          auctionPlaceholder: "— enter the auction amount —",
          customs: "Duty (10% of value)",
          transport: "Transport to Poland",
          importSubtotal: "Duty + transport",
          total: "Total with auction price",
        },
        types: {
          car: "Passenger car",
          vanL1L2: "Van L1–L2",
          vanL3L4: "Van L3–L4",
          motorcycle: "Motorcycle",
        },
        notes: {
          duty: "Duty is 10% of the auction amount with commission.",
          disclaimer: "The result is indicative and excludes VAT or port surcharges.",
        },
      },
      home: {
        hero: {
          tagline: "premium import",
          title: "Vehicle import straight from Switzerland",
          description:
            "Browse offers for cars, motorcycles and special vehicles from trusted partners across Europe.",
          points: {
            access: "24/7 auction access",
            verified: "Verified partners and transparent conditions",
            logistics: "Complete logistics service and transport calculator",
          },
        },
        search: {
          badge: "Offer search",
          title: "Find your perfect vehicle",
          queryLabel: "Search phrase, e.g. vehicle make",
          queryPlaceholder: "e.g. Audi A4",
          yearFrom: "Production year from",
          yearTo: "Production year to",
          fuel: "Fuel type",
          transmission: "Transmission",
          submit: "Search offers",
          reset: "Reset filters",
        },
        listings: {
          heading: "Current auctions",
          subheading: "Explore offers from verified suppliers.",
          sortLabel: "Sort:",
          sort: {
            endingAsc: "Time remaining — ascending",
            endingDesc: "Time remaining — descending",
            newest: "Newest offers",
          },
          demoMode: "We could not reach the API. Displaying demo data.",
          loading: "Loading offers…",
          error: "Could not load offers. Please try again later.",
          empty: "No results for the selected filters. Adjust the search criteria.",
        },
        watchlist: {
          title: "Follow new offers",
          description:
            "Enter the vehicle models you are interested in and receive e-mail updates as soon as matching offers appear.",
          placeholder: "e.g. Audi Q5, BMW X3, Mercedes GLC",
          button: "Subscribe",
          consent:
            "By subscribing you accept the privacy policy and consent to receiving commercial information electronically.",
        },
        transport: {
          title: "Transport calculator",
          description:
            "Check vehicle delivery costs across Europe. Select loading and destination countries to receive an estimate.",
          button: "Open calculator",
          helpTitle: "Need assistance?",
          phone: "Call: +48 123 456 789",
          email: "Email: kontakt@autoszczech.pl",
        },
      },
      carCard: {
        noImage: "No image",
        firstRegistration: "First registration",
        mileage: "Mileage",
        productionYear: "Production year",
        fuel: "Fuel type",
        transmission: "Transmission",
        auctionEndDate: "Auction end date",
        auctionEndsIn: "Auction ends in",
        viewDetails: "View details",
      },
      carDetails: {
        back: "← Back",
        returnToList: "← Back to auctions list",
        loading: "Loading…",
        fetchError: "Unable to load vehicle data.",
        notFound: "Offer not found.",
        demoMode: "We could not reach the API. Displaying demo data.",
        galleryAlt: "Vehicle thumbnail",
        noImage: "No image",
        vehicleInfo: "Vehicle information",
        info: {
          mileage: "Mileage",
          firstRegistration: "First registration",
          productionYear: "Production year",
          fuel: "Fuel type",
          transmission: "Transmission",
        },
        countdown: {
          title: "Auction end",
          noDate: "Date pending",
        },
        offerForm: {
          title: "Place a bid",
          highestBid: "Highest bid",
          minimumBid: "Minimum next bid",
          amountLabel: "Bid amount (PLN)",
          submit: "Confirm bid",
          submitting: "Saving bid…",
          success: "Your bid for {{amount}} has been saved.",
          invalidAmount: "Enter a valid bid amount.",
          tooLow: "The bid must be at least {{amount}}.",
          notLoggedIn: "Log in to place a bid.",
          unauthorized: "Session expired. Please sign in again to keep bidding.",
          serverErrorDetails: "We couldn't save your bid: {{message}}.",
          serverError: "We couldn't save your bid. Please try again soon.",
        },
        loginRequired: {
          title: "Bidding available to logged-in users only",
          message: "To participate in this auction you need to",
          loginLink: "log in",
          afterLoginLink: "first. Don't have an account yet?",
          registerLink: "Go to registration",
        },
        description: {
          title: "Vehicle description",
          fallback: "The seller has not provided an extended description.",
        },
        specs: {
          vin: "VIN",
          registrationNumber: "Registration number",
          firstRegistration: "First registration date",
          startDate: "Auction start",
          endDate: "Auction end",
        },
      },
      clientPanel: {
        badge: "Your account",
        title: "Client panel",
        subtitle:
          "Manage your bids, track delivery progress and review past wins in one place.",
        loggedInAs: "Signed in as {{email}}",
        unauthorized: {
          badge: "Sign-in required",
          title: "Log in to access the client panel",
          description:
            "Bidding history and winning offers are available after signing in. Use your account to stay on top of every auction.",
          login: "Go to login",
          register: "Create a new account",
        },
        history: {
          heading: "Bidding history",
          description: "Monitor ongoing auctions and respond when someone outbids you.",
          backToAuctions: "Back to auctions",
          loading: "Loading your bidding history…",
          loadError: "We couldn't load your bids. Please try again.",
          empty: "You haven't participated in any auctions yet.",
        },
        wins: {
          heading: "Winning offers",
          description: "A summary of vehicles you've secured recently.",
          empty: "No winning auctions yet.",
        },
        status: {
          leading: "You are leading",
          outbid: "You were outbid",
          awaiting: "Awaiting confirmation",
        },
        deliveryStatus: {
          delivered: "Delivered",
          inTransit: "In transit",
          scheduled: "Delivery scheduled",
        },
        fields: {
          lastBid: "Your last bid",
          lastBidDate: "Last bid date",
          totalBids: "Number of bids",
          totalBidsValue_one: "{{count}} bid",
          totalBidsValue_other: "{{count}} bids",
          firstRegistration: "First registration",
          mileage: "Current mileage",
          finalPrice: "Final price",
          wonAt: "Win date",
        },
        actions: {
          viewOffer: "View offer",
        },
      },
      login: {
        badge: "Login",
        title: "Sign in to your buyer account",
        description:
          "Use the e-mail and password you set during registration to access the platform. The form talks directly to the API so administrators can manage auctions immediately.",
        email: "E-mail address",
        password: "Password",
        remember: "Remember me on this device",
        submit: "Log in",
        loading: "Signing in…",
        errorMissing: "Enter your e-mail address and password.",
        errorInvalid: "Incorrect e-mail or password.",
        errorServer: "We couldn't reach the server. Please try again.",
        success: "Signed in successfully. Redirecting…",
        noAccountTitle: "Don't have an account yet?",
        noAccountDescription:
          "Use the registration form to access auctions and full bidding history. You'll receive a confirmation e-mail once your account is activated.",
        registerCta: "Go to registration",
      },
      register: {
        badge: "Registration",
        title: "Create a buyer account",
        description:
          "Fill in the required information and accept the form to gain full access to AutoSzczech auctions.",
        personalData: "Personal details",
        submit: "Register",
        success: "Thank you! The form has been sent for verification. We'll get back to you within 24 hours.",
        consent:
          "I accept the terms of service and consent to processing my personal data to operate the account and auctions.",
        fields: {
          firstName: "First name",
          middleName: "Middle name",
          lastName: "Last name",
          email: "E-mail address",
          phone: "Phone number",
          password: "Password",
          confirmPassword: "Repeat password",
          country: "Country of residence",
          postalCode: "Postal code",
          city: "City",
          street: "Street",
          houseNumber: "House number",
          apartmentNumber: "Apartment",
          birthDate: "Date of birth",
          taxId: "Tax ID",
        },
        placeholders: {
          postalCode: "00-000",
          taxId: "Optional",
        },
        countries: {
          poland: "Poland",
          germany: "Germany",
          czechia: "Czech Republic",
          slovakia: "Slovakia",
          switzerland: "Switzerland",
        },
      },
      admin: {
        badge: "Admin panel",
        title: "Manage the AutoSzczech platform",
        description: "Monitor auctions, review new users and handle partner tickets in one place.",
        integrator: {
          title: "JSON offer import",
          description:
            "Upload insurer data feeds to instantly publish vehicles in the catalogue.",
          fileLabel: "Offer JSON files",
          baseUrlLabel: "Image base URL (optional)",
          baseUrlHelp:
            "If photos share one directory, provide its URL and the filenames will be appended automatically.",
          importButton: "Import offers",
          importing: "Importing…",
          summary: {
            title: "Import summary",
            total: "Total offers: {{count}}",
            preview: "Added: {{added}} · Updated: {{updated}} · Skipped: {{skipped}}",
            addedLabel: "Added",
            updatedLabel: "Updated",
            skippedLabel: "Skipped",
            totalLabel: "Total",
          },
          errors: {
            title: "Some offers could not be imported",
            invalidFile: "Invalid file format.",
            missingId: "One of the records is missing an offer ID.",
            noFiles: "Add at least one file before importing.",
            parseFailed: "The JSON file could not be parsed.",
            noOffers: "No valid offers were found in the uploaded files.",
            uploadFailed: "Saving the offers on the server failed. Please try again.",
            authRequired: "Sign in as an administrator to store offers in the system.",
          },
          authHint: "Sign in with an administrator account before uploading files to push them directly to the catalogue.",
        },
        filters: {
          providerAll: "All providers",
          searchPlaceholder: "Search vehicle, ID or partner",
        },
        metrics: {
          active: {
            title: "Active auctions",
            helper: "+12% vs last week",
          },
          planned: {
            title: "Planned auctions",
            helper: "{{watchers}} watchers",
          },
          finished: {
            title: "Closed this month",
            helper: "{{value}} total sales",
          },
          engagement: {
            title: "Buyer engagement",
            helper: "{{interested}} registered buyers",
          },
          watchers: {
            title: "Average watchers",
            helper: "Top 3 auctions surpassed 140",
          },
        },
        tables: {
          auctions: {
            title: "Auction list",
            countLabel: "{{count}} items",
            headers: {
              auction: "Auction",
              partner: "Partner",
              status: "Status",
              start: "Start",
              end: "End",
              bids: "Bids",
              highestBid: "Highest bid",
              watchers: "Watchers",
            },
          },
          vehicles: {
            title: "Catalogue vehicles",
            countLabel: "{{count}} records",
            headers: {
              vehicle: "Vehicle",
              parameters: "Parameters",
              provider: "Provider",
              status: "Status",
            },
          },
        },
        verification: {
          title: "Pending verification",
          submissions: "{{count}} submissions",
          summary: "{{suppliers}} suppliers · {{buyers}} buyers",
          submittedAt: "Submitted:",
        },
        support: {
          title: "Support tickets",
          status: "Status:",
        },
        activity: {
          title: "Team activity",
        },
        tasks: {
          title: "Operational tasks",
          due: "Due:",
          owner: "Owner:",
        },
        partners: {
          title: "Partners",
          record: "Record bid",
          summary: "Auctions: {{auctions}} · Bids: {{bids}}",
        },
      },
    },
  },
  de: {
    translation: {
      common: {
        languageSwitcherLabel: "Sprache wählen",
        languages: {
          pl: "Polnisch",
          en: "Englisch",
          de: "Deutsch",
        },
        fuel: {
          any: "Beliebiger Kraftstoff",
          petrol: "Benzin",
          diesel: "Diesel",
          electric: "Elektrisch",
          hybrid: "Hybrid",
          lpg: "Autogas",
          other: "Sonstiger",
        },
        transmission: {
          any: "Beliebig",
          automatic: "Automatik",
          manual: "Schaltgetriebe",
          semiAutomatic: "Halbautomatik",
          other: "Sonstiges",
        },
        auctionStatus: {
          all: "Alle",
          active: "Aktiv",
          planned: "Geplant",
          finished: "Abgeschlossen",
        },
        ticketPriority: {
          high: "Hoch",
          medium: "Mittel",
          low: "Niedrig",
        },
        ticketStatus: {
          new: "Neu",
          inProgress: "In Bearbeitung",
          closed: "Geschlossen",
        },
        userType: {
          buyer: "Käufer",
          supplier: "Lieferant",
        },
      },
      nav: {
        auctions: "Auktionen",
        clientPanel: "Kundenbereich",
        howToBuy: "So kaufen",
        contact: "Kontakt",
        transportCalculator: "Transportrechner",
        register: "Registrieren",
        login: "Anmelden",
        logout: "Abmelden",
        backHomeAria: "Zurück zur Startseite",
        loginAria: "Zum Login",
      },
      footer: {
        terms: "Nutzungsbedingungen",
        privacy: "Datenschutz",
        cookies: "Cookies",
        admin: "Admin-Bereich",
      },
      calculator: {
        badge: "CHF → PLN",
        heading: "Wechselkursrechner",
        description: "Geben Sie den Betrag in CHF ein, um ihn in PLN umzurechnen.",
        amountLabel: "Betrag",
        amountPlaceholder: "Betrag eingeben",
        amountAria: "Betrag in Schweizer Franken",
        rateLabel: "NBP-Tageskurs",
        rateValueLabel: "1 CHF =",
        rateSource: "NBP-Tabelle A",
        rateUpdated: "Aktualisiert am {{date}}",
        rateLoading: "Aktueller Kurs wird geladen…",
        rateError: "Kurs konnte nicht aktualisiert werden. Letzter gespeicherter Wert wird genutzt.",
        resultLabel: "Umgerechneter Wert",
        resultPlaceholder: "—",
      },
      transportCalculator: {
        badge: "Transport",
        title: "Transportkostenrechner",
        lead: "Schätzen Sie Zoll und Inlandstransport für Ihren Auktionskauf.",
        auctionLabel: "Auktionsbetrag inkl. Provision",
        auctionPlaceholder: "z. B. 45 000",
        auctionHint: "Der Zoll wird vom Auktionspreis inklusive Provision berechnet.",
        vehicleLabel: "Fahrzeugtyp",
        vehicleHint: "Der Transportpreis richtet sich nach der Fahrzeuggröße.",
        costIncludes: "Pauschaler Inlandstransport nach Polen.",
        summary: {
          title: "Zusammenfassung",
          description: "Berechnung mit 10 % Zoll und festen Transportkosten.",
          auctionValue: "Auktionspreis (inkl. Provision)",
          auctionPlaceholder: "— Auktionsbetrag eingeben —",
          customs: "Zoll (10 % des Werts)",
          transport: "Transport nach Polen",
          importSubtotal: "Zoll + Transport",
          total: "Gesamt mit Auktionspreis",
        },
        types: {
          car: "Pkw",
          vanL1L2: "Transporter L1–L2",
          vanL3L4: "Transporter L3–L4",
          motorcycle: "Motorrad",
        },
        notes: {
          duty: "Der Zoll beträgt 10 % des Auktionsbetrags inklusive Provision.",
          disclaimer: "Ergebnis ist unverbindlich und enthält keine MwSt. oder Hafengebühren.",
        },
      },
      home: {
        hero: {
          tagline: "premium import",
          title: "Fahrzeugimport direkt aus der Schweiz",
          description:
            "Finden Sie Angebote für Autos, Motorräder und Spezialfahrzeuge von vertrauenswürdigen Partnern in ganz Europa.",
          points: {
            access: "Auktionen rund um die Uhr",
            verified: "Geprüfte Partner und transparente Bedingungen",
            logistics: "Kompletter Logistikservice und Transportrechner",
          },
        },
        search: {
          badge: "Angebotssuche",
          title: "Finden Sie Ihr Wunschfahrzeug",
          queryLabel: "Suchbegriff, z. B. Automarke",
          queryPlaceholder: "z. B. Audi A4",
          yearFrom: "Baujahr ab",
          yearTo: "Baujahr bis",
          fuel: "Kraftstoffart",
          transmission: "Getriebe",
          submit: "Angebote suchen",
          reset: "Filter zurücksetzen",
        },
        listings: {
          heading: "Aktuelle Auktionen",
          subheading: "Entdecken Sie Angebote geprüfter Anbieter.",
          sortLabel: "Sortieren:",
          sort: {
            endingAsc: "Restzeit — aufsteigend",
            endingDesc: "Restzeit — absteigend",
            newest: "Neueste Angebote",
          },
          demoMode: "API nicht erreichbar. Demo-Daten werden angezeigt.",
          loading: "Angebote werden geladen…",
          error: "Angebote konnten nicht geladen werden. Bitte später erneut versuchen.",
          empty: "Keine Ergebnisse für die gewählten Filter. Bitte passen Sie die Suche an.",
        },
        watchlist: {
          title: "Neue Angebote beobachten",
          description:
            "Geben Sie die gewünschten Fahrzeugmodelle ein und erhalten Sie E-Mail-Benachrichtigungen, sobald passende Angebote verfügbar sind.",
          placeholder: "z. B. Audi Q5, BMW X3, Mercedes GLC",
          button: "Anmelden",
          consent:
            "Mit der Anmeldung akzeptieren Sie die Datenschutzbestimmungen und stimmen dem Erhalt kommerzieller Informationen per E-Mail zu.",
        },
        transport: {
          title: "Transportrechner",
          description:
            "Prüfen Sie die Lieferkosten innerhalb Europas. Wählen Sie Belade- und Zielort, um einen Richtwert zu erhalten.",
          button: "Zum Rechner",
          helpTitle: "Brauchen Sie Hilfe?",
          phone: "Anruf: +48 123 456 789",
          email: "E-Mail: kontakt@autoszczech.pl",
        },
      },
      carCard: {
        noImage: "Kein Bild",
        firstRegistration: "Erstzulassung",
        mileage: "Kilometerstand",
        productionYear: "Baujahr",
        fuel: "Kraftstoffart",
        transmission: "Getriebe",
        auctionEndDate: "Auktionsende",
        auctionEndsIn: "Auktion endet in",
        viewDetails: "Details ansehen",
      },
      carDetails: {
        back: "← Zurück",
        returnToList: "← Zurück zur Auktionsliste",
        loading: "Wird geladen…",
        fetchError: "Fahrzeugdaten konnten nicht geladen werden.",
        notFound: "Angebot nicht gefunden.",
        demoMode: "API nicht erreichbar. Demo-Daten werden angezeigt.",
        galleryAlt: "Fahrzeug-Miniatur",
        noImage: "Kein Bild",
        vehicleInfo: "Fahrzeuginformationen",
        info: {
          mileage: "Kilometerstand",
          firstRegistration: "Erstzulassung",
          productionYear: "Baujahr",
          fuel: "Kraftstoffart",
          transmission: "Getriebe",
        },
        countdown: {
          title: "Auktionsende",
          noDate: "Termin in Vorbereitung",
        },
        offerForm: {
          title: "Gebot abgeben",
          highestBid: "Höchstes Gebot",
          minimumBid: "Mindesthöhe nächstes Gebot",
          amountLabel: "Gebotsbetrag (PLN)",
          submit: "Gebot bestätigen",
          submitting: "Gebot wird gespeichert…",
          success: "Dein Gebot über {{amount}} wurde gespeichert.",
          invalidAmount: "Bitte einen gültigen Betrag eingeben.",
          tooLow: "Das Gebot muss mindestens {{amount}} betragen.",
          notLoggedIn: "Bitte melde dich an, um ein Gebot abzugeben.",
          unauthorized: "Sitzung abgelaufen. Melde dich erneut an, um weiterzubieten.",
          serverErrorDetails: "Dein Gebot konnte nicht gespeichert werden: {{message}}.",
          serverError: "Dein Gebot konnte nicht gespeichert werden. Versuche es später noch einmal.",
        },
        loginRequired: {
          title: "Gebote nur für angemeldete Nutzer",
          message: "Um an der Auktion teilzunehmen, müssen Sie sich",
          loginLink: "anmelden",
          afterLoginLink: ". Noch kein Konto?",
          registerLink: "Zur Registrierung",
        },
        description: {
          title: "Fahrzeugbeschreibung",
          fallback: "Der Verkäufer hat keine ausführliche Beschreibung angegeben.",
        },
        specs: {
          vin: "VIN",
          registrationNumber: "Kennzeichen",
          firstRegistration: "Datum der Erstzulassung",
          startDate: "Auktionsstart",
          endDate: "Auktionsende",
        },
      },
      clientPanel: {
        badge: "Ihr Konto",
        title: "Kundenbereich",
        subtitle:
          "Verwalten Sie Ihre Gebote, verfolgen Sie Lieferstatus und sehen Sie Ihre gewonnenen Auktionen auf einen Blick.",
        loggedInAs: "Angemeldet als {{email}}",
        unauthorized: {
          badge: "Anmeldung erforderlich",
          title: "Melden Sie sich an, um den Kundenbereich zu sehen",
          description:
            "Die Biet-Historie und gewonnenen Angebote stehen nur angemeldeten Nutzern zur Verfügung. Nutzen Sie Ihr Konto, um keine Auktion zu verpassen.",
          login: "Zum Login",
          register: "Neues Konto erstellen",
        },
        history: {
          heading: "Biet-Historie",
          description: "Behalten Sie laufende Auktionen im Blick und reagieren Sie auf Überbietungen.",
          backToAuctions: "Zurück zu den Auktionen",
          loading: "Lade deine Gebotshistorie…",
          loadError: "Deine Gebote konnten nicht geladen werden. Bitte versuche es erneut.",
          empty: "Sie haben bisher an keiner Auktion teilgenommen.",
        },
        wins: {
          heading: "Gewonnene Angebote",
          description: "Zusammenfassung der Fahrzeuge, die Sie kürzlich gewonnen haben.",
          empty: "Noch keine gewonnenen Auktionen.",
        },
        status: {
          leading: "Sie führen",
          outbid: "Sie wurden überboten",
          awaiting: "Warten auf Bestätigung",
        },
        deliveryStatus: {
          delivered: "Geliefert",
          inTransit: "Unterwegs",
          scheduled: "Lieferung geplant",
        },
        fields: {
          lastBid: "Ihr letztes Gebot",
          lastBidDate: "Datum des letzten Gebots",
          totalBids: "Anzahl der Gebote",
          totalBidsValue_one: "{{count}} Gebot",
          totalBidsValue_other: "{{count}} Gebote",
          firstRegistration: "Erstzulassung",
          mileage: "Aktueller Kilometerstand",
          finalPrice: "Endpreis",
          wonAt: "Datum des Gewinns",
        },
        actions: {
          viewOffer: "Angebot ansehen",
        },
      },
      login: {
        badge: "Anmeldung",
        title: "Melden Sie sich in Ihrem Käuferkonto an",
        description:
          "Verwenden Sie Ihre Registrierungsdaten, um sich im Portal anzumelden. Das Formular kommuniziert direkt mit der API, sodass Administratoren Auktionen sofort verwalten können.",
        email: "E-Mail-Adresse",
        password: "Passwort",
        remember: "Auf diesem Gerät merken",
        submit: "Anmelden",
        loading: "Anmeldung…",
        errorMissing: "Bitte E-Mail-Adresse und Passwort eingeben.",
        errorInvalid: "E-Mail-Adresse oder Passwort ist falsch.",
        errorServer: "Verbindung zum Server fehlgeschlagen. Bitte erneut versuchen.",
        success: "Erfolgreich angemeldet. Weiterleitung folgt…",
        noAccountTitle: "Noch kein Konto?",
        noAccountDescription:
          "Nutzen Sie das Registrierungsformular, um Zugriff auf Auktionen und die Biet-Historie zu erhalten. Nach der Aktivierung erhalten Sie eine Bestätigungs-E-Mail.",
        registerCta: "Zur Registrierung",
      },
      register: {
        badge: "Registrierung",
        title: "Erstellen Sie ein Käuferkonto",
        description:
          "Füllen Sie die erforderlichen Angaben aus und akzeptieren Sie das Formular, um vollen Zugriff auf AutoSzczech-Auktionen zu erhalten.",
        personalData: "Persönliche Daten",
        submit: "Registrieren",
        success:
          "Vielen Dank! Das Formular wurde zur Prüfung übermittelt. Wir melden uns innerhalb von 24 Stunden.",
        consent:
          "Ich akzeptiere die Nutzungsbedingungen und stimme der Verarbeitung meiner personenbezogenen Daten zur Kontoführung und Teilnahme an Auktionen zu.",
        fields: {
          firstName: "Vorname",
          middleName: "Zweiter Vorname",
          lastName: "Nachname",
          email: "E-Mail-Adresse",
          phone: "Telefonnummer",
          password: "Passwort",
          confirmPassword: "Passwort wiederholen",
          country: "Wohnsitzland",
          postalCode: "Postleitzahl",
          city: "Stadt",
          street: "Straße",
          houseNumber: "Hausnummer",
          apartmentNumber: "Wohnung",
          birthDate: "Geburtsdatum",
          taxId: "Steuernummer",
        },
        placeholders: {
          postalCode: "00-000",
          taxId: "Optional",
        },
        countries: {
          poland: "Polen",
          germany: "Deutschland",
          czechia: "Tschechien",
          slovakia: "Slowakei",
          switzerland: "Schweiz",
        },
      },
      admin: {
        badge: "Admin-Bereich",
        title: "AutoSzczech-Plattform verwalten",
        description:
          "Überwachen Sie Auktionen, prüfen Sie neue Nutzer und bearbeiten Sie Partneranfragen an einem Ort.",
        integrator: {
          title: "JSON-Angebotsimport",
          description:
            "Laden Sie Dateien der Versicherer hoch, um Fahrzeuge direkt in den Katalog zu übernehmen.",
          fileLabel: "Angebotsdateien (JSON)",
          baseUrlLabel: "Basis-URL für Bilder (optional)",
          baseUrlHelp:
            "Falls alle Fotos in einem Verzeichnis liegen, geben Sie dessen Adresse an – Dateinamen werden automatisch ergänzt.",
          importButton: "Angebote importieren",
          importing: "Import läuft…",
          summary: {
            title: "Importübersicht",
            total: "Gesamt: {{count}} Angebote",
            preview: "Neu: {{added}} · Aktualisiert: {{updated}} · Übersprungen: {{skipped}}",
            addedLabel: "Neu",
            updatedLabel: "Aktualisiert",
            skippedLabel: "Übersprungen",
            totalLabel: "Gesamt",
          },
          errors: {
            title: "Einige Angebote konnten nicht importiert werden",
            invalidFile: "Ungültiges Dateiformat.",
            missingId: "In einem Datensatz fehlt die Angebots-ID.",
            noFiles: "Bitte mindestens eine Datei auswählen.",
            parseFailed: "Die JSON-Datei konnte nicht gelesen werden.",
            noOffers: "In den hochgeladenen Dateien wurden keine gültigen Angebote gefunden.",
            uploadFailed: "Die Angebote konnten nicht auf dem Server gespeichert werden. Bitte erneut versuchen.",
            authRequired: "Bitte als Administrator anmelden, um Angebote im System zu speichern.",
          },
          authHint: "Melden Sie sich vor dem Hochladen mit einem Administratorkonto an, um die Fahrzeuge direkt in den Katalog zu übernehmen.",
        },
        filters: {
          providerAll: "Alle Anbieter",
          searchPlaceholder: "Fahrzeug, ID oder Partner suchen",
        },
        metrics: {
          active: {
            title: "Aktive Auktionen",
            helper: "+12 % vs. letzte Woche",
          },
          planned: {
            title: "Geplante Auktionen",
            helper: "{{watchers}} Beobachter",
          },
          finished: {
            title: "Diesen Monat abgeschlossen",
            helper: "{{value}} Gesamtumsatz",
          },
          engagement: {
            title: "Käufer-Engagement",
            helper: "{{interested}} registrierte Käufer",
          },
          watchers: {
            title: "Durchschnittliche Beobachter",
            helper: "Top 3 Auktionen über 140",
          },
        },
        tables: {
          auctions: {
            title: "Auktionsliste",
            countLabel: "{{count}} Einträge",
            headers: {
              auction: "Auktion",
              partner: "Partner",
              status: "Status",
              start: "Start",
              end: "Ende",
              bids: "Gebote",
              highestBid: "Höchstgebot",
              watchers: "Beobachter",
            },
          },
          vehicles: {
            title: "Fahrzeuge im Katalog",
            countLabel: "{{count}} Datensätze",
            headers: {
              vehicle: "Fahrzeug",
              parameters: "Parameter",
              provider: "Anbieter",
              status: "Status",
            },
          },
        },
        verification: {
          title: "Zu verifizieren",
          submissions: "{{count}} Anträge",
          summary: "{{suppliers}} Lieferanten · {{buyers}} Käufer",
          submittedAt: "Eingereicht:",
        },
        support: {
          title: "Support-Tickets",
          status: "Status:",
        },
        activity: {
          title: "Teamaktivität",
        },
        tasks: {
          title: "Operative Aufgaben",
          due: "Fällig:",
          owner: "Verantwortlich:",
        },
        partners: {
          title: "Partner",
          record: "Rekordgebot",
          summary: "Auktionen: {{auctions}} · Gebote: {{bids}}",
        },
      },
    },
  },
} as const;

type ResourceTree = (typeof resources)[keyof typeof resources]["translation"];

const resolveFallback = (key: string, tree: ResourceTree | string | undefined): string | undefined => {
  if (typeof tree === "string") {
    return tree;
  }

  if (!tree) {
    return undefined;
  }

  const segments = key.split(".");

  const result = segments.reduce<string | ResourceTree | undefined>((accumulator, segment) => {
    if (typeof accumulator === "string" || accumulator == null) {
      return accumulator;
    }

    const next = (accumulator as Record<string, unknown>)[segment];

    if (typeof next === "string") {
      return next;
    }

    if (typeof next === "object" && next != null) {
      return next as ResourceTree;
    }

    return undefined;
  }, tree);

  return typeof result === "string" ? result : undefined;
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "pl",
    fallbackLng: ["pl", "en"],
    supportedLngs: ["pl", "en", "de"],
    defaultNS: "translation",
    interpolation: { escapeValue: false },
    returnNull: false,
    initImmediate: false,
    react: { useSuspense: false },
    load: "languageOnly",
    parseMissingKeyHandler: (key) =>
      resolveFallback(key, resources.pl.translation) ?? key,
  });

export default i18n;
