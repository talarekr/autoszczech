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
        openMenu: "Otwórz menu",
        closeMenu: "Zamknij menu",
        backHomeAria: "Powrót do strony głównej",
        authMenuAria: "Otwórz menu logowania i rejestracji",
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
        costIncludes: "Cena transportu krajowego do Polski.",
        entity: {
          label: "Podmiot",
          hint: "Wybierz czy sprowadzasz pojazd jako osoba prywatna czy firma.",
          individual: "Osoba fizyczna 19% VAT",
          company: "Firma 0% VAT",
        },
        customsLabel: "Cło",
        customsHint: "Wybierz stawkę cła odpowiednią do pochodzenia pojazdu.",
        customsOptions: {
          nonEu: "Wyprodukowany poza UE — cło 10%",
          eu: "Wyprodukowany w UE — cło 0%",
        },
        additional: {
          title: "Kalkulacja nie zawiera dodatkowych opłat takich jak:",
          intro: "Kalkulacja nie zawiera dodatkowych opłat takich jak:",
          items: {
            excise:
              "Akcyza opłacana w Polsce przez właściciela pojazdu. Obecnie obowiązują dwie stawki podatku akcyzowego w Polsce – 3,1% dla aut o pojemności silnika do 2000 ccm oraz 18,6% dla pojazdów przekraczających tę wartość. Akcyzę najlepiej wyliczyć od całkowitej ceny auta.",
            usDuty:
              "Od 22 czerwca 2018 r. przy imporcie niektórych towarów pochodzących z USA do UE należy brać pod uwagę dodatkowe cło 25 procent. Dotyczy to motocykli oraz niektórych jednostek pływających.",
            loadingFee:
              "Dodatkowa opłata za załadowanie pojazdu poważnie uszkodzonego, niebędącego w stanie wjechać na kołach na lawetę. Opłata w wysokości 50–100 CHF;",
            specialTransport: "Transport ciężarówek, przyczep, pojazdów specjalnych, sprzętu rolniczego. Cena do uzgodnienia.",
            pickup: "Odbiór pojazdów w siedzibie firmy, dostawa na życzenie klienta pod dom za dodatkową opłatą.",
          },
          contact:
            "W przypadku jakichkolwiek wątpliwości zachęcamy do kontaktu telefonicznego z naszym biurem lub poprzez formularz kontaktowy.",
        },
        summary: {
          title: "Podsumowanie",
          description: "Wyliczenia bazują na wybranej stawce cła i stałych stawkach transportu.",
          auctionValue: "Cena aukcji (z prowizją)",
          auctionPlaceholder: "— wpisz kwotę aukcji —",
          customs: "Cło ({{rate}}%)",
          vat: "VAT",
          vatZero: "0%",
          transportPln: "Transport do Polski (PLN)",
          forwarding: "Spedycja",
          transportCosts: "Koszty transportu (cło + VAT + transport + spedycja)",
          registration: {
            title: "Możliwość rejestracji pojazdu *",
            content:
              "Na życzenie klienta przygotujemy pojazd do rejestracji w Polsce. W razie pytań zapraszamy do kontaktu.",
          },
        },
        types: {
          car: "Samochód osobowy",
          vanL1L2: "Dostawczy L1–L2",
          vanL3L4: "Dostawczy L3–L4",
          motorcycle: "Motocykl",
        },
      },
      contact: {
        badge: "Kontakt",
        title: "Skontaktuj się z nami",
        lead: "Wybierz odpowiednią osobę i napisz do nas bezpośrednio w formularzu.",
        sections: {
          office: {
            title: "Biuro",
            description:
              "Masz pytania, potrzebujesz wyceny lub chcesz dowiedzieć się więcej o naszej ofercie? Pomożemy Ci dobrać najlepsze rozwiązanie.",
            phoneLabel: "Telefon",
            phone: "+48 500 800 504",
            emailLabel: "E-mail",
            email: "biuro@autoszczech.ch",
          },
          transport: {
            title: "Transport",
            description:
              "Skorzystaj z dedykowanej opieki w zakresie wyceny i organizacji transportu. Pomożemy dobrać najbardziej optymalną trasę i termin.",
            phoneLabel: "Telefon",
            phone: "+48 739 637 800",
            emailLabel: "E-mail",
            email: "transport@autoszczech.ch",
          },
        },
        form: {
          badge: "Formularz",
          title: "Formularz kontaktowy",
          name: "Imię",
          namePlaceholder: "Wpisz imię",
          phone: "Numer telefonu",
          phonePlaceholder: "Wpisz numer telefonu",
          email: "Adres e-mail",
          emailPlaceholder: "Podaj adres e-mail",
          message: "Treść wiadomości",
          messagePlaceholder: "Wpisz treść wiadomości",
          consent: "Zgadzam się na przetwarzanie danych osobowych przez AutoSzczech.",
          submit: "Wyślij wiadomość",
        },
        location: {
          badge: "Kontakt",
          title: "Nasza lokalizacja",
          address: "Korytnica 52A\n08-455 Trojanów, Polska",
          hoursTitle: "Godziny otwarcia",
          hours:
            "Poniedziałek–Piątek: 08:00–17:00\nSobota: 09:00–13:00\nNiedziela: nieczynne (Na telefon: +48 500 800 504)",
          phoneLabel: "Telefon",
          phone: "+48 500 800 504",
          emailLabel: "E-mail",
          email: "biuro@autoszczech.ch",
          mapTitle: "Nasza lokalizacja",
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
          provider: "Ubezpieczalnia",
          providerAny: "Dowolna ubezpieczalnia",
          providers: {
            BEST: "BEST",
            REST: "REST",
            AXA: "AXA",
            ALLIANZ: "ALLIANZ",
            SCC: "SCC",
          },
          submit: "Szukaj ofert",
          reset: "Wyczyść filtry",
        },
        listings: {
          heading: "Aktualne aukcje",
          subheading: "Przeglądaj oferty zweryfikowanych dostawców.",
          countLabel: "Ilość ofert",
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
        lightbox: {
          open: "Powiększ zdjęcie",
          close: "Zamknij podgląd",
          previous: "Poprzednie zdjęcie",
          next: "Następne zdjęcie",
        },
        vehicleInfo: "Informacje o pojeździe",
        info: {
          mileage: "Przebieg",
          firstRegistration: "Data pierwszej rejestracji",
          productionYear: "Rok produkcji",
          location: "Lokalizacja",
          provider: "Ubezpieczalnia",
        },
        countdown: {
          title: "Koniec aukcji",
          noDate: "Data w przygotowaniu",
        },
        offerForm: {
          title: "Złóż ofertę",
          highestBid: "Najwyższa oferta",
          minimumBid: "Minimalna kolejna oferta",
          amountLabel: "Kwota oferty (CHF)",
          submit: "Potwierdź ofertę",
          submitting: "Zapisywanie oferty…",
          success: "Twoja oferta na kwotę {{amount}} została pomyślnie złożona.",
          invalidAmount: "Wprowadź poprawną kwotę oferty.",
          tooLow: "Kwota oferty musi wynosić co najmniej {{amount}}.",
          notLoggedIn: "Zaloguj się, aby złożyć ofertę.",
          unauthorized: "Sesja wygasła. Zaloguj się ponownie, aby licytować.",
          serverErrorDetails: "Nie udało się zapisać oferty: {{message}}.",
          serverError: "Nie udało się zapisać oferty. Spróbuj ponownie za chwilę.",
        },
        favorites: {
          title: "Dodaj aukcję do ulubionych",
          subtitle: "Zapisz tę ofertę, aby szybko do niej wrócić.",
          addButton: "Dodaj do ulubionych",
          removeButton: "Usuń z ulubionych",
          loading: "Zapisywanie…",
          added: "Oferta została dodana do ulubionych.",
          removed: "Oferta została usunięta z ulubionych.",
          loginHint: "Zaloguj się, aby dodawać oferty do ulubionych",
          loginLink: "Przejdź do logowania",
          loginRequired: "Musisz być zalogowany, aby dodać ofertę do ulubionych.",
          error: "Nie udało się zapisać ulubionych. Spróbuj ponownie.",
          loadError: "Nie udało się pobrać Twojej listy ulubionych.",
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
          translator: {
            label: "Przetłumacz opis",
            helper: "Opis pochodzi z pliku w języku niemieckim. Wybierz język i przetłumacz tekst Google Translate.",
            selectLabel: "Wybierz język tłumaczenia",
            action: "Przetłumacz",
            loading: "Tłumaczenie…",
            error: "Nie udało się pobrać tłumaczenia. Spróbuj ponownie.",
            attribution: "Tłumaczenie: Google Translate",
          },
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
        tabsLabel: "Nawigacja",
        tabsHeading: "Panel klienta",
        tabs: {
          offers: "Moje oferty",
          favorites: "Ulubione aukcje",
          settings: "Ustawienia konta",
        },
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
        offers: {
          title: "Moje oferty",
          description: "Przeglądaj aktualne licytacje oraz wygrane aukcje oznaczone przez administrację.",
          filters: {
            ongoing: "Trwające",
            won: "Wygrane",
            all: "Wszystkie oferty",
          },
          emptyActive: "Brak trwających aukcji z Twoimi ofertami.",
          emptyAll: "Nie masz jeszcze historii złożonych ofert.",
          emptyWon: "Nie masz jeszcze aukcji oznaczonych jako wygrane.",
        },
        favorites: {
          heading: "Ulubione aukcje",
          description: "Pojazdy zapisane na Twojej liście ulubionych.",
          loading: "Ładujemy ulubione pojazdy…",
          empty: "Lista ulubionych jest pusta.",
          error: "Nie udało się pobrać ulubionych pojazdów.",
          view: "Zobacz aukcję",
          remove: "Usuń z ulubionych",
          location: "Lokalizacja: {{location}}",
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
        winnerStatus: {
          WON: "Wygrana",
          AWARDED: "Wygrana przyznana",
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
        settings: {
          heading: "Ustawienia konta",
          description: "Zaktualizuj dane podane przy rejestracji. Możesz zmienić adres e-mail oraz hasło.",
          emailLabel: "Adres e-mail",
          passwordLabel: "Nowe hasło",
          confirmPasswordLabel: "Potwierdź hasło",
          helper: "Pozostaw hasło puste, jeśli nie chcesz go zmieniać.",
          memberSince: "Użytkownik od {{date}}",
          save: "Zapisz zmiany",
          saving: "Zapisywanie…",
          reset: "Przywróć dane",
          success: "Zapisaliśmy Twoje dane profilu.",
          error: "Nie udało się zaktualizować profilu. Spróbuj ponownie.",
          duplicateEmail: "Podany adres e-mail jest już zajęty.",
          passwordMismatch: "Hasła muszą być identyczne.",
          nothingToUpdate: "Brak zmian do zapisania.",
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
        errorPending: "Twoje konto oczekuje na akceptację administracji.",
        errorServer: "Nie udało się połączyć z serwerem. Spróbuj ponownie.",
        success: "Zalogowano pomyślnie. Za chwilę nastąpi przekierowanie.",
        noAccountTitle: "Nie masz jeszcze konta?",
        noAccountDescription:
          "Skorzystaj z formularza rejestracyjnego, aby uzyskać dostęp do aukcji i pełnej historii licytacji. Po aktywacji konta otrzymasz wiadomość e-mail z potwierdzeniem.",
        registerCta: "Przejdź do rejestracji",
        reset: {
          badge: "Reset hasła",
          title: "Nie pamiętasz hasła?",
          description: "Ustaw nowe hasło dla swojego konta za pomocą adresu e-mail użytego przy rejestracji.",
          cta: "Otwórz formularz",
          hide: "Zamknij formularz",
          newPassword: "Nowe hasło",
          confirmPassword: "Powtórz nowe hasło",
          submit: "Zresetuj hasło",
          loading: "Resetowanie hasła…",
          success: "Jeśli podany adres istnieje, zaktualizowaliśmy hasło.",
          errorMissing: "Podaj adres e-mail i nowe hasło.",
          errorTooShort: "Hasło musi mieć co najmniej 8 znaków.",
          errorMismatch: "Hasła muszą być identyczne.",
          errorServer: "Nie udało się zresetować hasła. Spróbuj ponownie.",
        },
      },
      register: {
        badge: "Rejestracja",
        title: "Załóż konto kupującego",
        description:
          "Aby uzyskać pełny dostęp do zasobów AutoSzczech i składać oferty na aukcjach, uzupełnij wymagane dane i zaakceptuj formularz.",
        submitting: "Wysyłanie zgłoszenia…",
        personalData: "Dane osobowe",
        submit: "Zarejestruj się",
        success:
          "Dziękujemy! Formularz został wysłany do weryfikacji. Skontaktujemy się z Tobą w ciągu 24 godzin.",
        errors: {
          consent: "Musisz zaakceptować regulamin i politykę prywatności.",
          mismatch: "Hasła muszą być identyczne.",
          duplicate: "Użytkownik z takim e-mailem już istnieje.",
          server: "Nie udało się wysłać formularza. Spróbuj ponownie.",
        },
        consent: {
          prefix: "Akceptuję ",
          terms: "regulamin serwisu",
          conjunction: " oraz ",
          privacy: "politykę prywatności",
          suffix: "",
        },
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
          pesel: "PESEL",
        },
        placeholders: {
          postalCode: "00-000",
          taxId: "Opcjonalnie",
          pesel: "Opcjonalnie",
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
        bids: {
          badge: "Aukcje z ofertami",
          title: "Przyznaj wygraną",
          description: "Filtruj aukcje według ubezpieczyciela i wybierz zwycięskie oferty.",
          filters: {
            insurers: "Ubezpieczyciele",
          },
        actions: {
          refresh: "Odśwież",
          showOffers: "Pokaż oferty",
          hideOffers: "Ukryj oferty",
          viewAuction: "Szczegóły aukcji",
          dismiss: "Aukcja nierozstrzygnięta",
        },
        newOffers: "Nowa oferta",
        countdown: {
          label: "Do końca aukcji",
          ended: "Zakończona",
        },
        loading: "Ładuję aukcje z ofertami…",
        empty: "Brak aukcji z ofertami dla wybranego ubezpieczyciela.",
        authRequired: "Zaloguj się jako administrator, aby przeglądać oferty klientów.",
          loadError: "Nie udało się pobrać aukcji. Spróbuj ponownie.",
          saveError: "Nie udało się zapisać statusu zwycięzcy.",
          labels: {
            highest: "Najwyższa oferta",
            offers: "Liczba ofert",
          },
          table: {
            bid: "Oferta",
            user: "Klient",
            placed: "Złożono",
            message: "Wiadomość",
            actions: "Akcje",
          },
          status: {
            WON: "Wygrana",
            AWARDED: "Wygrana przyznana",
          },
          details: {
            title: "Szczegóły aukcji",
            subtitle: "{{vehicle}} · {{provider}}",
          },
        },
        clients: {
          tab: "Klienci",
          authRequired: "Zaloguj się jako administrator, aby zarządzać klientami.",
          loadError: "Nie udało się pobrać zgłoszeń klientów.",
          searchError: "Nie udało się wyszukać klientów.",
          approveError: "Nie udało się zaakceptować zgłoszenia.",
          pendingBadge: "Nowe zgłoszenia",
          pendingTitle: "Oczekujące konta",
          pendingDescription: "Zatwierdź nowych użytkowników zanim uzyskają dostęp do panelu.",
          pendingEmpty: "Brak oczekujących wniosków.",
          loading: "Ładuję zgłoszenia…",
          searchBadge: "Baza klientów",
          searchTitle: "Wyszukaj klientów",
          searchDescription: "Filtruj po adresie e-mail, imieniu lub nazwisku.",
          searchPlaceholder: "Wpisz e-mail, imię lub nazwisko",
          searchCta: "Szukaj",
          searching: "Szukam klientów…",
          searchEmpty: "Brak wyników dla podanego zapytania.",
          approve: "Akceptuj",
          approving: "Akceptuję…",
          status: {
            PENDING: "Do akceptacji",
            APPROVED: "Aktywne konto",
          },
          unknownName: "Nieznane dane",
        },
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
      howToBuyPage: {
        badge: "Jak kupować",
        title: "Jak kupować w AutoSzczech",
        lead:
          "Poznaj zasady udziału w aukcjach, sposób rozliczenia oraz proces dostawy pojazdu – krok po kroku.",
        info: {
          badge: "Najważniejsze",
          title: "Najważniejsze informacje",
        },
        highlights: [
          {
            title: "Licytacje bez wadium",
            description:
              "Dla większości pojazdów nie wymagamy wpłaty zabezpieczenia. Wadium obowiązuje jedynie przy autach o wartości powyżej 20 000 CHF.",
          },
          {
            title: "Forma płatności",
            description:
              "Możliwy jest przelew bezpośrednio do Szwajcarii lub płatność gotówką przy odbiorze pojazdu, po wcześniejszym ustaleniu.",
          },
          {
            title: "Cło 10%",
            description:
              "Dotyczy samochodów wyprodukowanych poza UE lub tych, które w dokumentach posiadają oznaczenie ‘Typenschein X’.",
          },
        ],
        process: {
          badge: "Proces zakupu",
          title: "Proces zakupu – krok po kroku",
          step: "Krok",
        },
        steps: [
          {
            title: "Złożenie oferty",
            description:
              "Składasz ofertę na wybrany pojazd za pośrednictwem naszego portalu. Aukcje organizowane przez szwajcarskie firmy ubezpieczeniowe mają charakter przetargowy – uczestnicy nie widzą wzajemnych ofert (tzw. licytacje kopertowe).\nUwaga: każda złożona oferta jest wiążąca i w przypadku jej przyjęcia rodzi obowiązek zapłaty.",
          },
          {
            title: "Informacja o wyniku aukcji",
            description:
              "Po zakończeniu aukcji informacja o wygranej pojawi się w panelu klienta oraz zostanie wysłana e-mailem.\nWyjątek stanowią aukcje firmy Allianz – kończą się one zawsze o godzinie 14:59:59 (od poniedziałku do piątku), a decyzja o przyznaniu pojazdu może trwać nawet do 30 dni. Informacja o wygranej również pojawi się w panelu klienta.\nZdarzają się także sytuacje, w których pojazd może zostać przyznany oferentowi z „drugiego miejsca” – dotyczy to wyłącznie aukcji firmy ubezpieczeniowej SCC.",
          },
          {
            title: "Decyzja sprzedającego",
            description:
              "Po zakończeniu aukcji oczekujemy maksymalnie 30 dni na potwierdzenie sprzedaży pojazdu. Najczęściej decyzja zapada w ciągu pierwszych dwóch tygodni.\nJeśli po 30 dniach status aukcji nie zmieni się na „przyznany”, oznacza to brak akceptacji oferty przez sprzedającego.",
          },
          {
            title: "Finalizacja zakupu",
            description:
              "Po przyznaniu pojazdu należy rozliczyć transakcję oraz uzupełnić dane kupującego w panelu klienta, przesyłając wymagane dokumenty (szczegóły otrzymasz e-mailem).\nPłatność realizowana jest przelewem zagranicznym w walucie CHF lub – po ustaleniu – gotówką przy dostawie. Szczegółowe instrukcje wysyłamy na adres e-mail podany podczas rejestracji.",
          },
          {
            title: "Dostawa pojazdu",
            description:
              "Samochód zostanie dostarczony pod wskazany adres. Poniżej znajdziesz listę dokumentów oraz dodatkowe koszty po stronie kupującego.",
          },
        ],
        delivery: {
          badge: "Dostawa",
          title: "Dostawa pojazdu",
          points: [
            "Samochód zostanie dostarczony pod wskazany adres wraz z kompletem dokumentów potrzebnych do rejestracji w Polsce:",
            "Dołączamy następujące dokumenty:",
            "oryginalny dowód pojazdu,",
            "faktura zakupu,",
            "dokumenty odprawy granicznej,",
            "faktura za transport.",
          ],
          footer:
            "Koszty takie jak akcyza, tłumaczenia, ewentualna opinia rzeczoznawcy, badanie techniczne oraz opłaty w wydziale komunikacji Klient pokrywa we własnym zakresie. Współpracujemy z firmą, która może pomóc w formalnościach związanych z akcyzą, rejestracją pojazdu oraz ubezpieczeniem.",
        },
        transport: {
          badge: "Transport",
          title: "Transport",
          description: [
            "Koszt transportu wyliczany jest na podstawie kalkulatora dostępnego po zalogowaniu i dotyczy dostawy do centralnej Polski.",
            "Regiony skrajne kraju wymagają indywidualnej wyceny.",
          ],
          bulletTitle: "Indywidualnie wyceniany jest również transport:",
          bullets: [
            "pojazdów powyżej 2200 kg,",
            "busów,",
            "łodzi motorowych,",
            "maszyn rolniczych.",
          ],
          extraFeesTitle: "Możliwe dodatkowe opłaty transportowe:",
          extraFees: [
            "załadunek pojazdu z poważnym uszkodzeniem (np. urwane koło, uszkodzona skrzynia biegów): 50 CHF,",
            "konieczność dojazdu po pojazd pociągiem: 50 CHF (bilet w jedną stronę).",
          ],
        },
      },
      privacyPolicyPage: {
        badge: "Polityka prywatności",
        title: "Polityka prywatności serwisu autoszczech.ch",
        lead:
          "Zasady przetwarzania danych osobowych użytkowników Serwisu, w tym informacje o administratorze, celach i podstawach prawnych oraz prawach osób, których dane dotyczą.",
        intro: [
          "Niniejsza Polityka Prywatności określa zasady przetwarzania danych osobowych użytkowników serwisu internetowego autoszczech.ch (dalej: \"Serwis\").",
          "Administrator dokłada szczególnej staranności, aby chronić prywatność osób korzystających z Serwisu oraz zapewnić bezpieczeństwo przetwarzanych danych osobowych.",
        ],
        sections: [
          {
            title: "§1. Administrator danych osobowych",
            paragraphs: [
              "Administratorem danych osobowych jest:",
              "JACEK SZCZĘCH\nFIRMA HANDLOWO – USŁUGOWA AUTO SZCZĘCH JACEK SZCZĘCH\nNIP: 8261450580\nREGON: 140317079\nAdres: Korytnica, ul. 52A, 08-455\nAdres e-mail: biuro@autoszczech.ch",
              "Administrator jest odpowiedzialny za przetwarzanie danych osobowych zgodnie z obowiązującymi przepisami prawa, w szczególności z Rozporządzeniem Parlamentu Europejskiego i Rady (UE) 2016/679 (RODO).",
              "Kontakt w sprawach związanych z ochroną danych osobowych możliwy jest za pośrednictwem adresu e-mail: biuro@autoszczech.ch.",
            ],
          },
          {
            title: "§2. Zasady przetwarzania danych osobowych",
            paragraphs: [],
            bullets: [
              "Dane osobowe są przetwarzane w sposób zgodny z prawem, rzetelny i przejrzysty.",
              "Administrator stosuje odpowiednie środki techniczne i organizacyjne w celu zabezpieczenia danych przed ich utratą, nieuprawnionym dostępem, modyfikacją lub ujawnieniem.",
              "Dostęp do danych osobowych mają wyłącznie osoby upoważnione przez Administratora.",
              "Korzystanie z Serwisu w zakresie przeglądania treści jest możliwe bez podawania danych osobowych.",
            ],
          },
          {
            title: "§3. Cele i podstawy przetwarzania danych",
            paragraphs: ["Dane osobowe użytkowników mogą być przetwarzane w następujących celach:"],
            bullets: [
              "realizacji usług świadczonych za pośrednictwem Serwisu, w tym obsługi zapytań oraz kontaktu z użytkownikami – na podstawie art. 6 ust. 1 lit. b i f RODO;",
              "realizacji obowiązków wynikających z przepisów prawa (np. księgowych i podatkowych) – art. 6 ust. 1 lit. c RODO;",
              "przesyłania informacji handlowych lub newslettera – wyłącznie na podstawie dobrowolnie wyrażonej zgody (art. 6 ust. 1 lit. a RODO);",
              "dochodzenia lub zabezpieczenia ewentualnych roszczeń – art. 6 ust. 1 lit. f RODO.",
            ],
            afterBullets: [
              "Podanie danych osobowych jest dobrowolne, jednak w niektórych przypadkach może być niezbędne do skorzystania z określonych funkcjonalności Serwisu.",
            ],
          },
          {
            title: "§4. Zakres przetwarzanych danych",
            paragraphs: [
              "Administrator przetwarza wyłącznie dane niezbędne do realizacji określonych celów.",
            ],
            bullets: [
              "Zakres danych może obejmować m.in.: imię, nazwisko, adres e-mail, numer telefonu, adres IP oraz inne dane przekazane dobrowolnie przez użytkownika w treści formularzy lub korespondencji.",
              "Adresy IP mogą być wykorzystywane do celów technicznych, statystycznych oraz związanych z bezpieczeństwem Serwisu.",
            ],
          },
          {
            title: "§5. Prawa osób, których dane dotyczą",
            paragraphs: ["Każdej osobie, której dane są przetwarzane, przysługują następujące prawa:"],
            bullets: [
              "prawo dostępu do danych oraz otrzymania ich kopii;",
              "prawo do sprostowania danych;",
              "prawo do usunięcia danych (\"prawo do bycia zapomnianym\");",
              "prawo do ograniczenia przetwarzania;",
              "prawo do przenoszenia danych;",
              "prawo wniesienia sprzeciwu wobec przetwarzania danych;",
              "prawo cofnięcia zgody w dowolnym momencie (jeśli przetwarzanie odbywa się na podstawie zgody);",
              "prawo wniesienia skargi do Prezesa Urzędu Ochrony Danych Osobowych.",
            ],
            afterBullets: [
              "Realizacja powyższych praw następuje poprzez kontakt z Administratorem pod adresem e-mail: biuro@autoszczech.ch.",
            ],
          },
          {
            title: "§6. Odbiorcy danych",
            paragraphs: [
              "Dane osobowe mogą być przekazywane podmiotom uprawnionym do ich otrzymania na podstawie przepisów prawa.",
              "Dane mogą być również powierzane podmiotom współpracującym z Administratorem, takim jak dostawcy usług IT, hostingowych, księgowych lub marketingowych – wyłącznie na podstawie odpowiednich umów powierzenia przetwarzania danych.",
              "Dane osobowe nie są przekazywane do państw trzecich ani organizacji międzynarodowych.",
            ],
          },
          {
            title: "§7. Okres przechowywania danych",
            paragraphs: [
              "Dane osobowe są przechowywane przez okres niezbędny do realizacji celu, dla którego zostały zebrane, lub do momentu cofnięcia zgody.",
              "Po upływie tego okresu dane są usuwane lub anonimizowane zgodnie z obowiązującymi przepisami.",
            ],
          },
        ],
        closing: [
          "Administrator nie podejmuje decyzji wobec użytkowników w sposób wyłącznie zautomatyzowany, w tym w formie profilowania.",
          "Administrator zastrzega sobie prawo do wprowadzania zmian w niniejszej Polityce Prywatności. Aktualna wersja dokumentu będzie każdorazowo publikowana w Serwisie.",
          "Polityka Prywatności obowiązuje od dnia jej opublikowania.",
        ],
      },
      termsPage: {
        badge: "Regulamin",
        title: "Regulamin serwisu autoszczech.ch",
        lead: "Zasady korzystania z serwisu oraz udziału w aukcjach pojazdów.",
        intro: [
          "Regulamin określa zasady korzystania z Serwisu oraz warunki udziału w aukcjach pojazdów.",
        ],
        sections: [
          {
            title: "§1. Informacje ogólne",
            paragraphs: [
              "Właścicielem oraz operatorem serwisu internetowego autoszczech.ch (dalej: \"Serwis\") jest:\nJACEK SZCZĘCH, prowadzący działalność gospodarczą pod firmą\nFIRMA HANDLOWO – USŁUGOWA AUTO SZCZĘCH JACEK SZCZĘCH,\nNIP: 8261450580, REGON: 140317079,\nadres: Korytnica, ul. 52A, 08-455,\ne-mail: biuro@autoszczech.ch,\nzwany dalej \"Operatorem\".",
              "Użytkownikiem Serwisu może być każda osoba fizyczna lub prawna, która założyła konto użytkownika, zapoznała się z Regulaminem oraz Polityką Prywatności i zaakceptowała ich treść.",
              "Informacje publikowane w Serwisie mają charakter wyłącznie informacyjny i nie stanowią oferty handlowej w rozumieniu Kodeksu cywilnego ani innych obowiązujących przepisów prawa.",
            ],
          },
          {
            title: "§2. Charakter Serwisu",
            paragraphs: [
              "Serwis pełni funkcję platformy umożliwiającej dostęp do aukcji pojazdów, części oraz innych przedmiotów związanych z motoryzacją.",
              "Operator nie jest producentem ani ubezpieczycielem pojazdów i nie ponosi odpowiedzialności za ich stan techniczny.",
              "Użytkownik podejmuje decyzje zakupowe na własną odpowiedzialność.",
              "Opisy i zdjęcia pojazdów pochodzą od podmiotów trzecich, a Operator nie odpowiada za ewentualne nieścisłości lub błędy w ich treści.",
            ],
          },
          {
            title: "§3. Zasady udziału w aukcjach",
            paragraphs: ["Każda aukcja posiada indywidualny numer identyfikacyjny. Użytkownik za pośrednictwem Serwisu wskazuje przedmiot aukcji oraz oferowaną cenę, a Operator składa ofertę w imieniu Użytkownika w ramach danej aukcji."],
            bullets: [
              "Złożone oferty są wiążące i nie podlegają wycofaniu.",
            ],
          },
          {
            title: "§4. Wynik aukcji i przyznanie przedmiotu",
            paragraphs: ["Informacja o wyniku aukcji przekazywana jest Użytkownikowi po jej zakończeniu."],
            bullets: [
              "Ostateczne przyznanie pojazdu przez podmiot organizujący aukcję może nastąpić w terminie do 30 dni roboczych.",
              "Organizator aukcji może powtórzyć procedurę aukcyjną lub ponownie rozpatrzyć złożone oferty.",
              "Aukcje oznaczone jako Allianz mogą mieć odrębne zasady informowania o wyniku.",
            ],
          },
          {
            title: "§5. Płatności i realizacja",
            paragraphs: ["Po przyznaniu przedmiotu Operator przekazuje Użytkownikowi informacje dotyczące płatności."],
            bullets: [
              "Użytkownik zobowiązuje się do uregulowania należności w terminie 5 dni roboczych.",
              "Wydanie pojazdu oraz dokumentów następuje po spełnieniu wszystkich zobowiązań finansowych.",
            ],
          },
          {
            title: "§6. Kary umowne",
            paragraphs: [],
            bullets: [
              "W przypadku opóźnienia w płatności Operator może naliczyć opłatę parkingową w wysokości 30 CHF za każdy dzień zwłoki.",
              "Brak zapłaty za przyznany pojazd skutkuje obowiązkiem zapłaty kary umownej w wysokości 20% zaoferowanej kwoty, jednak nie mniej niż 2000 CHF.",
              "Nieopłacenie i nieodebranie przedmiotu może skutkować usunięciem konta użytkownika oraz zablokowaniem dalszego dostępu do Serwisu.",
            ],
          },
          {
            title: "§7. Wydanie pojazdu i stan techniczny",
            paragraphs: [],
            bullets: [
              "Wydanie pojazdu następuje pod adresem wskazanym przez Użytkownika lub w siedzibie Operatora.",
              "Organizator aukcji nie odpowiada za różnice w stanie pojazdu pomiędzy momentem prezentacji a odbiorem.",
              "Elementy dodatkowe oraz wyposażenie ruchome nie stanowią przedmiotu aukcji.",
              "Pojazd może zostać wydany z jednym kompletem kluczy.",
            ],
          },
          {
            title: "§8. Rozstrzyganie sporów",
            paragraphs: [],
            bullets: [
              "Strony zobowiązują się w pierwszej kolejności do polubownego rozwiązania ewentualnych sporów.",
              "W przypadku braku porozumienia, spory rozstrzygane będą przez sąd właściwy dla siedziby Operatora.",
            ],
          },
          {
            title: "§9. Postanowienia końcowe",
            paragraphs: [],
            bullets: [
              "Rejestracja w Serwisie oznacza akceptację niniejszego Regulaminu.",
              "Operator zastrzega sobie prawo do zmiany Regulaminu.",
              "Aktualna wersja Regulaminu jest publikowana w Serwisie autoszczech.ch.",
              "Regulamin obowiązuje od dnia jego opublikowania.",
            ],
          },
        ],
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
        openMenu: "Open menu",
        closeMenu: "Close menu",
        backHomeAria: "Back to homepage",
        authMenuAria: "Open login and registration menu",
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
        costIncludes: "Price of domestic transport to Poland.",
        entity: {
          label: "Entity",
          hint: "Choose whether you import as a private person or a company.",
          individual: "Private person 19% VAT",
          company: "Company 0% VAT",
        },
        customsLabel: "Customs duty",
        customsHint: "Choose the duty rate based on where the vehicle was built.",
        customsOptions: {
          nonEu: "Manufactured outside the EU — 10% duty",
          eu: "Manufactured in the EU — 0% duty",
        },
        additional: {
          title: "The calculation does not include additional charges such as:",
          intro: "The calculation does not include additional charges such as:",
          items: {
            excise:
              "Excise tax paid in Poland by the vehicle owner. Two rates apply: 3.1% for engines up to 2000 ccm and 18.6% above that value. We recommend calculating excise based on the full vehicle price.",
            usDuty:
              "Since 22 June 2018, imports of certain US-origin goods into the EU may include an additional 25% duty. This applies to motorcycles and certain watercraft.",
            loadingFee:
              "Additional fee for loading a heavily damaged vehicle that cannot drive onto the trailer. Charge ranges from 50–100 CHF.",
            specialTransport: "Transport of trucks, trailers, special vehicles or agricultural equipment. Price to be agreed.",
            pickup: "Vehicle pickup at our headquarters; home delivery available on request for an extra fee.",
          },
          contact: "If you have any questions, please contact our office by phone or via the contact form.",
        },
        summary: {
          title: "Summary",
          description: "Calculated with your selected duty rate and fixed transport costs.",
          auctionValue: "Auction price (incl. commission)",
          auctionPlaceholder: "— enter the auction amount —",
          customs: "Duty ({{rate}}%)",
          vat: "VAT",
          vatZero: "0%",
          transportPln: "Transport to Poland (PLN)",
          forwarding: "Forwarding",
          transportCosts: "Transport costs (duty + VAT + transport + forwarding)",
          registration: {
            title: "Vehicle registration available *",
            content:
              "On request, we will prepare the vehicle for registration in Poland. If you have any questions, feel free to contact us.",
          },
        },
        types: {
          car: "Passenger car",
          vanL1L2: "Van L1–L2",
          vanL3L4: "Van L3–L4",
          motorcycle: "Motorcycle",
        },
      },
      contact: {
        badge: "Contact",
        title: "Get in touch with us",
        lead: "Choose the right person and send us a direct message through the form.",
        sections: {
          office: {
            title: "Office",
            description:
              "Have questions, need a quote or want to learn more about our offer? We will help you choose the best solution.",
            phoneLabel: "Phone",
            phone: "+48 500 800 504",
            emailLabel: "Email",
            email: "biuro@autoszczech.ch",
          },
          transport: {
            title: "Transport",
            description:
              "Get dedicated assistance for transport pricing and arrangements. We will help choose the best route and date.",
            phoneLabel: "Phone",
            phone: "+48 739 637 800",
            emailLabel: "Email",
            email: "transport@autoszczech.ch",
          },
        },
        form: {
          badge: "Form",
          title: "Contact form",
          name: "Name",
          namePlaceholder: "Enter your name",
          phone: "Phone number",
          phonePlaceholder: "Enter your phone number",
          email: "Email address",
          emailPlaceholder: "Enter your email address",
          message: "Message",
          messagePlaceholder: "Write your message",
          consent: "I agree to the processing of personal data by AutoSzczech.",
          submit: "Send message",
        },
        location: {
          badge: "Contact",
          title: "Our location",
          address: "Korytnica 52A\n08-455 Trojanów, Poland",
          hoursTitle: "Opening hours",
          hours:
            "Monday–Friday: 08:00–17:00\nSaturday: 09:00–13:00\nSunday: closed (On call: +48 500 800 504)",
          phoneLabel: "Phone",
          phone: "+48 500 800 504",
          emailLabel: "Email",
          email: "biuro@autoszczech.ch",
          mapTitle: "Our location",
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
          provider: "Insurer",
          providerAny: "Any insurer",
          providers: {
            BEST: "BEST",
            REST: "REST",
            AXA: "AXA",
            ALLIANZ: "ALLIANZ",
            SCC: "SCC",
          },
          submit: "Search offers",
          reset: "Reset filters",
        },
        listings: {
          heading: "Current auctions",
          subheading: "Explore offers from verified suppliers.",
          countLabel: "Number of offers",
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
        lightbox: {
          open: "Enlarge photo",
          close: "Close preview",
          previous: "Previous photo",
          next: "Next photo",
        },
        vehicleInfo: "Vehicle information",
        info: {
          mileage: "Mileage",
          firstRegistration: "First registration",
          productionYear: "Production year",
          location: "Location",
          provider: "Insurance provider",
        },
        countdown: {
          title: "Auction end",
          noDate: "Date pending",
        },
        offerForm: {
          title: "Place a bid",
          highestBid: "Highest bid",
          minimumBid: "Minimum next bid",
          amountLabel: "Bid amount (CHF)",
          submit: "Confirm bid",
          submitting: "Saving bid…",
          success: "Your bid for {{amount}} was submitted successfully.",
          invalidAmount: "Enter a valid bid amount.",
          tooLow: "The bid must be at least {{amount}}.",
          notLoggedIn: "Log in to place a bid.",
          unauthorized: "Session expired. Please sign in again to keep bidding.",
          serverErrorDetails: "We couldn't save your bid: {{message}}.",
          serverError: "We couldn't save your bid. Please try again soon.",
        },
        favorites: {
          title: "Add this auction to favourites",
          subtitle: "Save the offer to return to it quickly.",
          addButton: "Add to favourites",
          removeButton: "Remove from favourites",
          loading: "Saving…",
          added: "The offer has been added to favourites.",
          removed: "The offer has been removed from favourites.",
          loginHint: "Sign in to add offers to favourites",
          loginLink: "Go to login",
          loginRequired: "You must be logged in to add this offer to favourites.",
          error: "Could not update favourites. Please try again.",
          loadError: "Unable to load your favourites list.",
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
          translator: {
            label: "Translate description",
            helper: "The description is supplied in German. Choose a language and translate it with Google Translate.",
            selectLabel: "Choose translation language",
            action: "Translate",
            loading: "Translating…",
            error: "We couldn't fetch the translation. Please try again.",
            attribution: "Translation: Google Translate",
          },
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
        tabsLabel: "Navigation",
        tabsHeading: "Client area",
        tabs: {
          offers: "My bids",
          favorites: "Favourite auctions",
          settings: "Account settings",
        },
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
        offers: {
          title: "My bids",
          description: "Browse your active auctions and the ones marked as won by the admin team.",
          filters: {
            ongoing: "Ongoing",
            won: "Won",
            all: "All bids",
          },
          emptyActive: "No active auctions with your bids right now.",
          emptyAll: "You haven't placed any bids yet.",
          emptyWon: "You don't have any auctions marked as won yet.",
        },
        favorites: {
          heading: "Favourite auctions",
          description: "Vehicles saved to your favourites list.",
          loading: "Loading favourite vehicles…",
          empty: "Your favourites list is empty.",
          error: "Couldn't load favourite vehicles.",
          view: "View auction",
          remove: "Remove from favourites",
          location: "Location: {{location}}",
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
        winnerStatus: {
          WON: "Won",
          AWARDED: "Win granted",
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
        settings: {
          heading: "Account settings",
          description: "Update the details you provided during registration. You can change your e-mail and password.",
          emailLabel: "E-mail address",
          passwordLabel: "New password",
          confirmPasswordLabel: "Confirm password",
          helper: "Leave the password field blank if you don't want to change it.",
          memberSince: "Member since {{date}}",
          save: "Save changes",
          saving: "Saving…",
          reset: "Reset changes",
          success: "Your profile details have been saved.",
          error: "We couldn't update your profile. Please try again.",
          duplicateEmail: "That e-mail address is already taken.",
          passwordMismatch: "Passwords must match.",
          nothingToUpdate: "No changes to save.",
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
        errorPending: "Your account is awaiting administrator approval.",
        errorServer: "We couldn't reach the server. Please try again.",
        success: "Signed in successfully. Redirecting…",
        noAccountTitle: "Don't have an account yet?",
        noAccountDescription:
          "Use the registration form to access auctions and full bidding history. You'll receive a confirmation e-mail once your account is activated.",
        registerCta: "Go to registration",
        reset: {
          badge: "Password reset",
          title: "Forgot your password?",
          description: "Set a new password for your account using the e-mail address you registered with.",
          cta: "Open reset form",
          hide: "Hide reset form",
          newPassword: "New password",
          confirmPassword: "Repeat new password",
          submit: "Reset password",
          loading: "Resetting password…",
          success: "If the address exists, we've updated the password.",
          errorMissing: "Enter your e-mail address and a new password.",
          errorTooShort: "Password must be at least 8 characters long.",
          errorMismatch: "Passwords must match.",
          errorServer: "Password reset failed. Please try again.",
        },
      },
      register: {
        badge: "Registration",
        title: "Create a buyer account",
        description:
          "Fill in the required information and accept the form to gain full access to AutoSzczech auctions.",
        submitting: "Sending request…",
        personalData: "Personal details",
        submit: "Register",
        success: "Thank you! The form has been sent for verification. We'll get back to you within 24 hours.",
        errors: {
          consent: "You must accept the terms and privacy policy.",
          mismatch: "Passwords must match.",
          duplicate: "A user with this e-mail already exists.",
          server: "We couldn't submit the form. Please try again.",
        },
        consent: {
          prefix: "I accept the ",
          terms: "terms of service",
          conjunction: " and the ",
          privacy: "privacy policy",
          suffix: "",
        },
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
          pesel: "PESEL",
        },
        placeholders: {
          postalCode: "00-000",
          taxId: "Optional",
          pesel: "Optional",
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
        bids: {
          badge: "Auction bids",
          title: "Assign winners",
          description: "Filter auctions by insurer and pick the winning offers.",
          filters: {
            insurers: "Insurers",
          },
        actions: {
          refresh: "Refresh",
          showOffers: "Show offers",
          hideOffers: "Hide offers",
          viewAuction: "Auction details",
          dismiss: "Mark unresolved",
        },
        newOffers: "New bid",
        countdown: {
          label: "Time left",
          ended: "Ended",
        },
        loading: "Loading auctions with bids…",
        empty: "No auctions with client offers for this insurer.",
        authRequired: "Sign in as an administrator to review client bids.",
          loadError: "Could not load auctions. Please try again.",
          saveError: "Could not save the winner status.",
          labels: {
            highest: "Highest bid",
            offers: "Offers",
          },
          table: {
            bid: "Bid",
            user: "Customer",
            placed: "Placed",
            message: "Message",
            actions: "Actions",
          },
          status: {
            WON: "Won",
            AWARDED: "Win granted",
          },
          details: {
            title: "Auction details",
            subtitle: "{{vehicle}} · {{provider}}",
          },
        },
        clients: {
          tab: "Clients",
          authRequired: "Sign in as an administrator to manage clients.",
          loadError: "Could not load client requests.",
          searchError: "Client search failed.",
          approveError: "Could not approve this request.",
          pendingBadge: "New requests",
          pendingTitle: "Pending accounts",
          pendingDescription: "Approve new users before they access the panel.",
          pendingEmpty: "No pending requests.",
          loading: "Loading requests…",
          searchBadge: "Client directory",
          searchTitle: "Search clients",
          searchDescription: "Filter by email address, first or last name.",
          searchPlaceholder: "Enter email, first or last name",
          searchCta: "Search",
          searching: "Searching clients…",
          searchEmpty: "No results for this query.",
          approve: "Approve",
          approving: "Approving…",
          status: {
            PENDING: "Awaiting approval",
            APPROVED: "Active account",
          },
          unknownName: "Unknown",
        },
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
      howToBuyPage: {
        badge: "How to buy",
        title: "How to buy at AutoSzczech",
        lead:
          "Poznaj zasady udziału w aukcjach, sposób rozliczenia oraz proces dostawy pojazdu – krok po kroku.",
        info: {
          badge: "Key info",
          title: "Najważniejsze informacje",
        },
        highlights: [
          {
            title: "Licytacje bez wadium",
            description:
              "Dla większości pojazdów nie wymagamy wpłaty zabezpieczenia. Wadium obowiązuje jedynie przy autach o wartości powyżej 20 000 CHF.",
          },
          {
            title: "Forma płatności",
            description:
              "Możliwy jest przelew bezpośrednio do Szwajcarii lub płatność gotówką przy odbiorze pojazdu, po wcześniejszym ustaleniu.",
          },
          {
            title: "Cło 10%",
            description:
              "Dotyczy samochodów wyprodukowanych poza UE lub tych, które w dokumentach posiadają oznaczenie ‘Typenschein X’.",
          },
        ],
        process: {
          badge: "Process",
          title: "Proces zakupu – krok po kroku",
          step: "Step",
        },
        steps: [
          {
            title: "Złożenie oferty",
            description:
              "Składasz ofertę na wybrany pojazd za pośrednictwem naszego portalu. Aukcje organizowane przez szwajcarskie firmy ubezpieczeniowe mają charakter przetargowy – uczestnicy nie widzą wzajemnych ofert (tzw. licytacje kopertowe).\nUwaga: każda złożona oferta jest wiążąca i w przypadku jej przyjęcia rodzi obowiązek zapłaty.",
          },
          {
            title: "Informacja o wyniku aukcji",
            description:
              "Po zakończeniu aukcji informacja o wygranej pojawi się w panelu klienta oraz zostanie wysłana e-mailem.\nWyjątek stanowią aukcje firmy Allianz – kończą się one zawsze o godzinie 14:59:59 (od poniedziałku do piątku), a decyzja o przyznaniu pojazdu może trwać nawet do 30 dni. Informacja o wygranej również pojawi się w panelu klienta.\nZdarzają się także sytuacje, w których pojazd może zostać przyznany oferentowi z „drugiego miejsca” – dotyczy to wyłącznie aukcji firmy ubezpieczeniowej SCC.",
          },
          {
            title: "Decyzja sprzedającego",
            description:
              "Po zakończeniu aukcji oczekujemy maksymalnie 30 dni na potwierdzenie sprzedaży pojazdu. Najczęściej decyzja zapada w ciągu pierwszych dwóch tygodni.\nJeśli po 30 dniach status aukcji nie zmieni się na „przyznany”, oznacza to brak akceptacji oferty przez sprzedającego.",
          },
          {
            title: "Finalizacja zakupu",
            description:
              "Po przyznaniu pojazdu należy rozliczyć transakcję oraz uzupełnić dane kupującego w panelu klienta, przesyłając wymagane dokumenty (szczegóły otrzymasz e-mailem).\nPłatność realizowana jest przelewem zagranicznym w walucie CHF lub – po ustaleniu – gotówką przy dostawie. Szczegółowe instrukcje wysyłamy na adres e-mail podany podczas rejestracji.",
          },
          {
            title: "Dostawa pojazdu",
            description:
              "Samochód zostanie dostarczony pod wskazany adres. Poniżej znajdziesz listę dokumentów oraz dodatkowe koszty po stronie kupującego.",
          },
        ],
        delivery: {
          badge: "Delivery",
          title: "Dostawa pojazdu",
          points: [
            "Samochód zostanie dostarczony pod wskazany adres wraz z kompletem dokumentów potrzebnych do rejestracji w Polsce:",
            "Dołączamy następujące dokumenty:",
            "oryginalny dowód pojazdu,",
            "faktura zakupu,",
            "dokumenty odprawy granicznej,",
            "faktura za transport.",
          ],
          footer:
            "Koszty takie jak akcyza, tłumaczenia, ewentualna opinia rzeczoznawcy, badanie techniczne oraz opłaty w wydziale komunikacji Klient pokrywa we własnym zakresie. Współpracujemy z firmą, która może pomóc w formalnościach związanych z akcyzą, rejestracją pojazdu oraz ubezpieczeniem.",
        },
        transport: {
          badge: "Transport",
          title: "Transport",
          description: [
            "Koszt transportu wyliczany jest na podstawie kalkulatora dostępnego po zalogowaniu i dotyczy dostawy do centralnej Polski.",
            "Regiony skrajne kraju wymagają indywidualnej wyceny.",
          ],
          bulletTitle: "Indywidualnie wyceniany jest również transport:",
          bullets: [
            "pojazdów powyżej 2200 kg,",
            "busów,",
            "łodzi motorowych,",
            "maszyn rolniczych.",
          ],
          extraFeesTitle: "Możliwe dodatkowe opłaty transportowe:",
          extraFees: [
            "załadunek pojazdu z poważnym uszkodzeniem (np. urwane koło, uszkodzona skrzynia biegów): 50 CHF,",
            "konieczność dojazdu po pojazd pociągiem: 50 CHF (bilet w jedną stronę).",
          ],
        },
      },
      privacyPolicyPage: {
        badge: "Polityka prywatności",
        title: "Polityka prywatności serwisu autoszczech.ch",
        lead:
          "Zasady przetwarzania danych osobowych użytkowników Serwisu, w tym informacje o administratorze, celach i podstawach prawnych oraz prawach osób, których dane dotyczą.",
        intro: [
          "Niniejsza Polityka Prywatności określa zasady przetwarzania danych osobowych użytkowników serwisu internetowego autoszczech.ch (dalej: \"Serwis\").",
          "Administrator dokłada szczególnej staranności, aby chronić prywatność osób korzystających z Serwisu oraz zapewnić bezpieczeństwo przetwarzanych danych osobowych.",
        ],
        sections: [
          {
            title: "§1. Administrator danych osobowych",
            paragraphs: [
              "Administratorem danych osobowych jest:",
              "JACEK SZCZĘCH\nFIRMA HANDLOWO – USŁUGOWA AUTO SZCZĘCH JACEK SZCZĘCH\nNIP: 8261450580\nREGON: 140317079\nAdres: Korytnica, ul. 52A, 08-455\nAdres e-mail: biuro@autoszczech.ch",
              "Administrator jest odpowiedzialny za przetwarzanie danych osobowych zgodnie z obowiązującymi przepisami prawa, w szczególności z Rozporządzeniem Parlamentu Europejskiego i Rady (UE) 2016/679 (RODO).",
              "Kontakt w sprawach związanych z ochroną danych osobowych możliwy jest za pośrednictwem adresu e-mail: biuro@autoszczech.ch.",
            ],
          },
          {
            title: "§2. Zasady przetwarzania danych osobowych",
            paragraphs: [],
            bullets: [
              "Dane osobowe są przetwarzane w sposób zgodny z prawem, rzetelny i przejrzysty.",
              "Administrator stosuje odpowiednie środki techniczne i organizacyjne w celu zabezpieczenia danych przed ich utratą, nieuprawnionym dostępem, modyfikacją lub ujawnieniem.",
              "Dostęp do danych osobowych mają wyłącznie osoby upoważnione przez Administratora.",
              "Korzystanie z Serwisu w zakresie przeglądania treści jest możliwe bez podawania danych osobowych.",
            ],
          },
          {
            title: "§3. Cele i podstawy przetwarzania danych",
            paragraphs: ["Dane osobowe użytkowników mogą być przetwarzane w następujących celach:"],
            bullets: [
              "realizacji usług świadczonych za pośrednictwem Serwisu, w tym obsługi zapytań oraz kontaktu z użytkownikami – na podstawie art. 6 ust. 1 lit. b i f RODO;",
              "realizacji obowiązków wynikających z przepisów prawa (np. księgowych i podatkowych) – art. 6 ust. 1 lit. c RODO;",
              "przesyłania informacji handlowych lub newslettera – wyłącznie na podstawie dobrowolnie wyrażonej zgody (art. 6 ust. 1 lit. a RODO);",
              "dochodzenia lub zabezpieczenia ewentualnych roszczeń – art. 6 ust. 1 lit. f RODO.",
            ],
            afterBullets: [
              "Podanie danych osobowych jest dobrowolne, jednak w niektórych przypadkach może być niezbędne do skorzystania z określonych funkcjonalności Serwisu.",
            ],
          },
          {
            title: "§4. Zakres przetwarzanych danych",
            paragraphs: [
              "Administrator przetwarza wyłącznie dane niezbędne do realizacji określonych celów.",
            ],
            bullets: [
              "Zakres danych może obejmować m.in.: imię, nazwisko, adres e-mail, numer telefonu, adres IP oraz inne dane przekazane dobrowolnie przez użytkownika w treści formularzy lub korespondencji.",
              "Adresy IP mogą być wykorzystywane do celów technicznych, statystycznych oraz związanych z bezpieczeństwem Serwisu.",
            ],
          },
          {
            title: "§5. Prawa osób, których dane dotyczą",
            paragraphs: ["Każdej osobie, której dane są przetwarzane, przysługują następujące prawa:"],
            bullets: [
              "prawo dostępu do danych oraz otrzymania ich kopii;",
              "prawo do sprostowania danych;",
              "prawo do usunięcia danych (\"prawo do bycia zapomnianym\");",
              "prawo do ograniczenia przetwarzania;",
              "prawo do przenoszenia danych;",
              "prawo wniesienia sprzeciwu wobec przetwarzania danych;",
              "prawo cofnięcia zgody w dowolnym momencie (jeśli przetwarzanie odbywa się na podstawie zgody);",
              "prawo wniesienia skargi do Prezesa Urzędu Ochrony Danych Osobowych.",
            ],
            afterBullets: [
              "Realizacja powyższych praw następuje poprzez kontakt z Administratorem pod adresem e-mail: biuro@autoszczech.ch.",
            ],
          },
          {
            title: "§6. Odbiorcy danych",
            paragraphs: [
              "Dane osobowe mogą być przekazywane podmiotom uprawnionym do ich otrzymania na podstawie przepisów prawa.",
              "Dane mogą być również powierzane podmiotom współpracującym z Administratorem, takim jak dostawcy usług IT, hostingowych, księgowych lub marketingowych – wyłącznie na podstawie odpowiednich umów powierzenia przetwarzania danych.",
              "Dane osobowe nie są przekazywane do państw trzecich ani organizacji międzynarodowych.",
            ],
          },
          {
            title: "§7. Okres przechowywania danych",
            paragraphs: [
              "Dane osobowe są przechowywane przez okres niezbędny do realizacji celu, dla którego zostały zebrane, lub do momentu cofnięcia zgody.",
              "Po upływie tego okresu dane są usuwane lub anonimizowane zgodnie z obowiązującymi przepisami.",
            ],
          },
        ],
        closing: [
          "Administrator nie podejmuje decyzji wobec użytkowników w sposób wyłącznie zautomatyzowany, w tym w formie profilowania.",
          "Administrator zastrzega sobie prawo do wprowadzania zmian w niniejszej Polityce Prywatności. Aktualna wersja dokumentu będzie każdorazowo publikowana w Serwisie.",
          "Polityka Prywatności obowiązuje od dnia jej opublikowania.",
        ],
      },
      termsPage: {
        badge: "Regulamin",
        title: "Regulamin serwisu autoszczech.ch",
        lead: "Zasady korzystania z serwisu oraz udziału w aukcjach pojazdów.",
        intro: [
          "Regulamin określa zasady korzystania z Serwisu oraz warunki udziału w aukcjach pojazdów.",
        ],
        sections: [
          {
            title: "§1. Informacje ogólne",
            paragraphs: [
              "Właścicielem oraz operatorem serwisu internetowego autoszczech.ch (dalej: \"Serwis\") jest:\nJACEK SZCZĘCH, prowadzący działalność gospodarczą pod firmą\nFIRMA HANDLOWO – USŁUGOWA AUTO SZCZĘCH JACEK SZCZĘCH,\nNIP: 8261450580, REGON: 140317079,\nadres: Korytnica, ul. 52A, 08-455,\ne-mail: biuro@autoszczech.ch,\nzwany dalej \"Operatorem\".",
              "Użytkownikiem Serwisu może być każda osoba fizyczna lub prawna, która założyła konto użytkownika, zapoznała się z Regulaminem oraz Polityką Prywatności i zaakceptowała ich treść.",
              "Informacje publikowane w Serwisie mają charakter wyłącznie informacyjny i nie stanowią oferty handlowej w rozumieniu Kodeksu cywilnego ani innych obowiązujących przepisów prawa.",
            ],
          },
          {
            title: "§2. Charakter Serwisu",
            paragraphs: [
              "Serwis pełni funkcję platformy umożliwiającej dostęp do aukcji pojazdów, części oraz innych przedmiotów związanych z motoryzacją.",
              "Operator nie jest producentem ani ubezpieczycielem pojazdów i nie ponosi odpowiedzialności za ich stan techniczny.",
              "Użytkownik podejmuje decyzje zakupowe na własną odpowiedzialność.",
              "Opisy i zdjęcia pojazdów pochodzą od podmiotów trzecich, a Operator nie odpowiada za ewentualne nieścisłości lub błędy w ich treści.",
            ],
          },
          {
            title: "§3. Zasady udziału w aukcjach",
            paragraphs: ["Każda aukcja posiada indywidualny numer identyfikacyjny. Użytkownik za pośrednictwem Serwisu wskazuje przedmiot aukcji oraz oferowaną cenę, a Operator składa ofertę w imieniu Użytkownika w ramach danej aukcji."],
            bullets: [
              "Złożone oferty są wiążące i nie podlegają wycofaniu.",
            ],
          },
          {
            title: "§4. Wynik aukcji i przyznanie przedmiotu",
            paragraphs: ["Informacja o wyniku aukcji przekazywana jest Użytkownikowi po jej zakończeniu."],
            bullets: [
              "Ostateczne przyznanie pojazdu przez podmiot organizujący aukcję może nastąpić w terminie do 30 dni roboczych.",
              "Organizator aukcji może powtórzyć procedurę aukcyjną lub ponownie rozpatrzyć złożone oferty.",
              "Aukcje oznaczone jako Allianz mogą mieć odrębne zasady informowania o wyniku.",
            ],
          },
          {
            title: "§5. Płatności i realizacja",
            paragraphs: ["Po przyznaniu przedmiotu Operator przekazuje Użytkownikowi informacje dotyczące płatności."],
            bullets: [
              "Użytkownik zobowiązuje się do uregulowania należności w terminie 5 dni roboczych.",
              "Wydanie pojazdu oraz dokumentów następuje po spełnieniu wszystkich zobowiązań finansowych.",
            ],
          },
          {
            title: "§6. Kary umowne",
            paragraphs: [],
            bullets: [
              "W przypadku opóźnienia w płatności Operator może naliczyć opłatę parkingową w wysokości 30 CHF za każdy dzień zwłoki.",
              "Brak zapłaty za przyznany pojazd skutkuje obowiązkiem zapłaty kary umownej w wysokości 20% zaoferowanej kwoty, jednak nie mniej niż 2000 CHF.",
              "Nieopłacenie i nieodebranie przedmiotu może skutkować usunięciem konta użytkownika oraz zablokowaniem dalszego dostępu do Serwisu.",
            ],
          },
          {
            title: "§7. Wydanie pojazdu i stan techniczny",
            paragraphs: [],
            bullets: [
              "Wydanie pojazdu następuje pod adresem wskazanym przez Użytkownika lub w siedzibie Operatora.",
              "Organizator aukcji nie odpowiada za różnice w stanie pojazdu pomiędzy momentem prezentacji a odbiorem.",
              "Elementy dodatkowe oraz wyposażenie ruchome nie stanowią przedmiotu aukcji.",
              "Pojazd może zostać wydany z jednym kompletem kluczy.",
            ],
          },
          {
            title: "§8. Rozstrzyganie sporów",
            paragraphs: [],
            bullets: [
              "Strony zobowiązują się w pierwszej kolejności do polubownego rozwiązania ewentualnych sporów.",
              "W przypadku braku porozumienia, spory rozstrzygane będą przez sąd właściwy dla siedziby Operatora.",
            ],
          },
          {
            title: "§9. Postanowienia końcowe",
            paragraphs: [],
            bullets: [
              "Rejestracja w Serwisie oznacza akceptację niniejszego Regulaminu.",
              "Operator zastrzega sobie prawo do zmiany Regulaminu.",
              "Aktualna wersja Regulaminu jest publikowana w Serwisie autoszczech.ch.",
              "Regulamin obowiązuje od dnia jego opublikowania.",
            ],
          },
        ],
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
        openMenu: "Menü öffnen",
        closeMenu: "Menü schließen",
        backHomeAria: "Zurück zur Startseite",
        authMenuAria: "Login- und Registrierungsmenü öffnen",
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
        costIncludes: "Preis für den Inlandstransport nach Polen.",
        entity: {
          label: "Steuerpflichtiger",
          hint: "Wählen Sie, ob Sie als Privatperson oder Firma importieren.",
          individual: "Privatperson 19 % MwSt.",
          company: "Firma 0 % MwSt.",
        },
        customsLabel: "Zoll",
        customsHint: "Wähle den Zollsatz passend zum Herkunftsland des Fahrzeugs.",
        customsOptions: {
          nonEu: "Außerhalb der EU produziert — 10 % Zoll",
          eu: "In der EU produziert — 0 % Zoll",
        },
        additional: {
          title: "Die Kalkulation enthält nicht zusätzliche Gebühren wie:",
          intro: "Die Kalkulation enthält nicht zusätzliche Gebühren wie:",
          items: {
            excise:
              "Verbrauchsteuer, die in Polen vom Fahrzeughalter gezahlt wird. Es gelten zwei Sätze: 3,1 % für Motoren bis 2000 ccm und 18,6 % für größere. Am besten auf Basis des Gesamtpreises des Fahrzeugs berechnen.",
            usDuty:
              "Seit dem 22. Juni 2018 kann bei Import bestimmter Waren mit Ursprung USA in die EU ein zusätzlicher Zollsatz von 25 % anfallen. Betrifft Motorräder und bestimmte Wasserfahrzeuge.",
            loadingFee:
              "Zusätzliche Gebühr für das Verladen stark beschädigter Fahrzeuge, die nicht aus eigener Kraft auf den Anhänger fahren können. Gebühr 50–100 CHF.",
            specialTransport: "Transport von Lkw, Anhängern, Spezialfahrzeugen oder Landmaschinen. Preis nach Vereinbarung.",
            pickup: "Abholung der Fahrzeuge am Firmensitz; Lieferung bis vor die Haustür auf Wunsch gegen Aufpreis.",
          },
          contact: "Bei Fragen kontaktieren Sie bitte unser Büro telefonisch oder über das Kontaktformular.",
        },
        summary: {
          title: "Zusammenfassung",
          description: "Berechnung mit gewähltem Zollsatz und festen Transportkosten.",
          auctionValue: "Auktionspreis (inkl. Provision)",
          auctionPlaceholder: "— Auktionsbetrag eingeben —",
          customs: "Zoll ({{rate}} %)",
          vat: "MwSt.",
          vatZero: "0%",
          transportPln: "Transport nach Polen (PLN)",
          forwarding: "Spedition",
          transportCosts: "Transportkosten (Zoll + MwSt. + Transport + Spedition)",
          registration: {
            title: "Möglichkeit der Fahrzeugzulassung *",
            content:
              "Auf Wunsch bereiten wir das Fahrzeug für die Zulassung in Polen vor. Bei Fragen stehen wir Ihnen gerne zur Verfügung.",
          },
        },
        types: {
          car: "Pkw",
          vanL1L2: "Transporter L1–L2",
          vanL3L4: "Transporter L3–L4",
          motorcycle: "Motorrad",
        },
      },
      contact: {
        badge: "Kontakt",
        title: "Kontaktieren Sie uns",
        lead: "Wählen Sie die richtige Ansprechperson und schreiben Sie uns direkt über das Formular.",
        sections: {
          office: {
            title: "Büro",
            description:
              "Haben Sie Fragen, benötigen Sie ein Angebot oder möchten Sie mehr über unser Angebot erfahren? Wir helfen Ihnen bei der Auswahl der besten Lösung.",
            phoneLabel: "Telefon",
            phone: "+48 500 800 504",
            emailLabel: "E-Mail",
            email: "biuro@autoszczech.ch",
          },
          transport: {
            title: "Transport",
            description:
              "Profitieren Sie von individueller Betreuung bei Preisgestaltung und Organisation des Transports. Wir wählen mit Ihnen die optimale Route und den Termin.",
            phoneLabel: "Telefon",
            phone: "+48 739 637 800",
            emailLabel: "E-Mail",
            email: "transport@autoszczech.ch",
          },
        },
        form: {
          badge: "Formular",
          title: "Kontaktformular",
          name: "Name",
          namePlaceholder: "Geben Sie Ihren Namen ein",
          phone: "Telefonnummer",
          phonePlaceholder: "Geben Sie Ihre Telefonnummer ein",
          email: "E-Mail-Adresse",
          emailPlaceholder: "Geben Sie Ihre E-Mail-Adresse ein",
          message: "Nachricht",
          messagePlaceholder: "Geben Sie Ihre Nachricht ein",
          consent: "Ich stimme der Verarbeitung meiner personenbezogenen Daten durch AutoSzczech zu.",
          submit: "Nachricht senden",
        },
        location: {
          badge: "Kontakt",
          title: "Unser Standort",
          address: "Korytnica 52A\n08-455 Trojanów, Polen",
          hoursTitle: "Öffnungszeiten",
          hours:
            "Montag–Freitag: 08:00–17:00\nSamstag: 09:00–13:00\nSonntag: geschlossen (Telefonisch: +48 500 800 504)",
          phoneLabel: "Telefon",
          phone: "+48 500 800 504",
          emailLabel: "E-Mail",
          email: "biuro@autoszczech.ch",
          mapTitle: "Unser Standort",
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
          provider: "Versicherer",
          providerAny: "Beliebiger Versicherer",
          providers: {
            BEST: "BEST",
            REST: "REST",
            AXA: "AXA",
            ALLIANZ: "ALLIANZ",
            SCC: "SCC",
          },
          submit: "Angebote suchen",
          reset: "Filter zurücksetzen",
        },
        listings: {
          heading: "Aktuelle Auktionen",
          subheading: "Entdecken Sie Angebote geprüfter Anbieter.",
          countLabel: "Anzahl der Angebote",
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
        lightbox: {
          open: "Foto vergrößern",
          close: "Vorschau schließen",
          previous: "Vorheriges Foto",
          next: "Nächstes Foto",
        },
        vehicleInfo: "Fahrzeuginformationen",
        info: {
          mileage: "Kilometerstand",
          firstRegistration: "Erstzulassung",
          productionYear: "Baujahr",
          location: "Standort",
          provider: "Versicherung",
        },
        countdown: {
          title: "Auktionsende",
          noDate: "Termin in Vorbereitung",
        },
        offerForm: {
          title: "Gebot abgeben",
          highestBid: "Höchstes Gebot",
          minimumBid: "Mindesthöhe nächstes Gebot",
          amountLabel: "Gebotsbetrag (CHF)",
          submit: "Gebot bestätigen",
          submitting: "Gebot wird gespeichert…",
          success: "Dein Gebot über {{amount}} wurde erfolgreich abgegeben.",
          invalidAmount: "Bitte einen gültigen Betrag eingeben.",
          tooLow: "Das Gebot muss mindestens {{amount}} betragen.",
          notLoggedIn: "Bitte melde dich an, um ein Gebot abzugeben.",
          unauthorized: "Sitzung abgelaufen. Melde dich erneut an, um weiterzubieten.",
          serverErrorDetails: "Dein Gebot konnte nicht gespeichert werden: {{message}}.",
          serverError: "Dein Gebot konnte nicht gespeichert werden. Versuche es später noch einmal.",
        },
        favorites: {
          title: "Auktion zu Favoriten hinzufügen",
          subtitle: "Speichern Sie das Angebot, um schnell zurückzukehren.",
          addButton: "Zu Favoriten hinzufügen",
          removeButton: "Aus Favoriten entfernen",
          loading: "Wird gespeichert…",
          added: "Das Angebot wurde zu den Favoriten hinzugefügt.",
          removed: "Das Angebot wurde aus den Favoriten entfernt.",
          loginHint: "Bitte melden Sie sich an, um Angebote zu Favoriten hinzuzufügen",
          loginLink: "Zum Login",
          loginRequired: "Sie müssen angemeldet sein, um dieses Angebot zu Favoriten hinzuzufügen.",
          error: "Favoriten konnten nicht aktualisiert werden. Bitte erneut versuchen.",
          loadError: "Ihre Favoritenliste konnte nicht geladen werden.",
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
          translator: {
            label: "Beschreibung übersetzen",
            helper: "Die Beschreibung liegt auf Deutsch vor. Wähle eine Sprache und übersetze den Text mit Google Translate.",
            selectLabel: "Zielsprache wählen",
            action: "Übersetzen",
            loading: "Wird übersetzt…",
            error: "Die Übersetzung konnte nicht geladen werden. Bitte versuche es erneut.",
            attribution: "Übersetzung: Google Translate",
          },
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
        tabsLabel: "Navigation",
        tabsHeading: "Kundenbereich",
        tabs: {
          offers: "Meine Gebote",
          favorites: "Beobachtete Auktionen",
          settings: "Kontoeinstellungen",
        },
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
        offers: {
          title: "Meine Gebote",
          description: "Sieh dir laufende Auktionen und vom Admin markierte Gewinn-Auktionen an.",
          filters: {
            ongoing: "Laufend",
            won: "Gewonnen",
            all: "Alle Gebote",
          },
          emptyActive: "Keine laufenden Auktionen mit deinen Geboten.",
          emptyAll: "Du hast noch keine Gebote abgegeben.",
          emptyWon: "Noch keine als gewonnen markierten Auktionen.",
        },
        favorites: {
          heading: "Favorisierte Auktionen",
          description: "Fahrzeuge, die Sie auf Ihre Favoritenliste gesetzt haben.",
          loading: "Favorisierte Fahrzeuge werden geladen…",
          empty: "Ihre Favoritenliste ist leer.",
          error: "Favoriten konnten nicht geladen werden.",
          view: "Auktion ansehen",
          remove: "Aus Favoriten entfernen",
          location: "Standort: {{location}}",
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
        winnerStatus: {
          WON: "Gewonnen",
          AWARDED: "Gewinn zuerkannt",
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
        settings: {
          heading: "Kontoeinstellungen",
          description: "Aktualisieren Sie die Daten aus der Registrierung. Sie können E-Mail-Adresse und Passwort ändern.",
          emailLabel: "E-Mail-Adresse",
          passwordLabel: "Neues Passwort",
          confirmPasswordLabel: "Passwort bestätigen",
          helper: "Feld für Passwort leer lassen, wenn es unverändert bleiben soll.",
          memberSince: "Mitglied seit {{date}}",
          save: "Änderungen speichern",
          saving: "Speichere…",
          reset: "Eingaben zurücksetzen",
          success: "Deine Profildaten wurden gespeichert.",
          error: "Profil konnte nicht aktualisiert werden. Bitte erneut versuchen.",
          duplicateEmail: "Diese E-Mail-Adresse wird bereits verwendet.",
          passwordMismatch: "Die Passwörter müssen übereinstimmen.",
          nothingToUpdate: "Keine Änderungen zum Speichern.",
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
        errorPending: "Ihr Konto wartet auf die Freigabe durch den Administrator.",
        errorServer: "Verbindung zum Server fehlgeschlagen. Bitte erneut versuchen.",
        success: "Erfolgreich angemeldet. Weiterleitung folgt…",
        noAccountTitle: "Noch kein Konto?",
        noAccountDescription:
          "Nutzen Sie das Registrierungsformular, um Zugriff auf Auktionen und die Biet-Historie zu erhalten. Nach der Aktivierung erhalten Sie eine Bestätigungs-E-Mail.",
        registerCta: "Zur Registrierung",
        reset: {
          badge: "Passwort zurücksetzen",
          title: "Passwort vergessen?",
          description: "Setzen Sie Ihr Passwort mit der E-Mail-Adresse zurück, die Sie bei der Registrierung verwendet haben.",
          cta: "Reset-Formular öffnen",
          hide: "Reset-Formular schließen",
          newPassword: "Neues Passwort",
          confirmPassword: "Neues Passwort wiederholen",
          submit: "Passwort zurücksetzen",
          loading: "Passwort wird zurückgesetzt…",
          success: "Falls die Adresse existiert, wurde das Passwort aktualisiert.",
          errorMissing: "Bitte E-Mail-Adresse und neues Passwort eingeben.",
          errorTooShort: "Das Passwort muss mindestens 8 Zeichen haben.",
          errorMismatch: "Passwörter müssen übereinstimmen.",
          errorServer: "Passwort konnte nicht zurückgesetzt werden. Bitte erneut versuchen.",
        },
      },
      register: {
        badge: "Registrierung",
        title: "Erstellen Sie ein Käuferkonto",
        description:
          "Füllen Sie die erforderlichen Angaben aus und akzeptieren Sie das Formular, um vollen Zugriff auf AutoSzczech-Auktionen zu erhalten.",
        submitting: "Antrag wird gesendet…",
        personalData: "Persönliche Daten",
        submit: "Registrieren",
        success:
          "Vielen Dank! Das Formular wurde zur Prüfung übermittelt. Wir melden uns innerhalb von 24 Stunden.",
        errors: {
          consent: "Sie müssen die Nutzungsbedingungen und den Datenschutz akzeptieren.",
          mismatch: "Die Passwörter müssen übereinstimmen.",
          duplicate: "Ein Benutzer mit dieser E-Mail existiert bereits.",
          server: "Das Formular konnte nicht gesendet werden. Bitte erneut versuchen.",
        },
        consent: {
          prefix: "Ich akzeptiere die ",
          terms: "Nutzungsbedingungen",
          conjunction: " sowie die ",
          privacy: "Datenschutzrichtlinie",
          suffix: "",
        },
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
          pesel: "PESEL",
        },
        placeholders: {
          postalCode: "00-000",
          taxId: "Optional",
          pesel: "Optional",
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
        bids: {
          badge: "Auktionsgebote",
          title: "Gewinner festlegen",
          description: "Filtern Sie Auktionen nach Versicherer und wählen Sie die siegreichen Gebote aus.",
          filters: {
            insurers: "Versicherer",
          },
          actions: {
            refresh: "Aktualisieren",
            showOffers: "Gebote anzeigen",
            hideOffers: "Gebote ausblenden",
            viewAuction: "Auktionsdetails",
            dismiss: "Auktion nicht entschieden",
          },
          newOffers: "Neues Gebot",
          countdown: {
            label: "Restzeit",
            ended: "Beendet",
          },
          loading: "Auktionen mit Geboten werden geladen…",
          empty: "Keine Auktionen mit Kundenangeboten für diesen Versicherer.",
          authRequired: "Bitte als Administrator anmelden, um Kundenangebote einzusehen.",
          loadError: "Auktionen konnten nicht geladen werden. Bitte erneut versuchen.",
          saveError: "Der Gewinnerstatus konnte nicht gespeichert werden.",
          labels: {
            highest: "Höchstes Gebot",
            offers: "Gebote",
          },
          table: {
            bid: "Gebot",
            user: "Kunde",
            placed: "Abgegeben",
            message: "Nachricht",
            actions: "Aktionen",
          },
          status: {
            WON: "Gewonnen",
            AWARDED: "Gewinn zuerkannt",
          },
          details: {
            title: "Auktionsdetails",
            subtitle: "{{vehicle}} · {{provider}}",
          },
        },
        clients: {
          tab: "Kunden",
          authRequired: "Bitte als Administrator anmelden, um Kunden zu verwalten.",
          loadError: "Kundenanfragen konnten nicht geladen werden.",
          searchError: "Kundensuche fehlgeschlagen.",
          approveError: "Anfrage konnte nicht freigegeben werden.",
          pendingBadge: "Neue Anfragen",
          pendingTitle: "Ausstehende Konten",
          pendingDescription: "Geben Sie neue Nutzer frei, bevor sie Zugriff erhalten.",
          pendingEmpty: "Keine ausstehenden Anfragen.",
          loading: "Anfragen werden geladen…",
          searchBadge: "Kundenverzeichnis",
          searchTitle: "Kunden suchen",
          searchDescription: "Filtern Sie nach E-Mail-Adresse, Vor- oder Nachname.",
          searchPlaceholder: "E-Mail, Vor- oder Nachname eingeben",
          searchCta: "Suchen",
          searching: "Kunden werden gesucht…",
          searchEmpty: "Keine Ergebnisse für diese Suche.",
          approve: "Freigeben",
          approving: "Wird freigegeben…",
          status: {
            PENDING: "Wartet auf Freigabe",
            APPROVED: "Aktives Konto",
          },
          unknownName: "Unbekannt",
        },
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
      howToBuyPage: {
        badge: "So kaufen",
        title: "Jak kupować w AutoSzczech",
        lead:
          "Poznaj zasady udziału w aukcjach, sposób rozliczenia oraz proces dostawy pojazdu – krok po kroku.",
        info: {
          badge: "Wichtig",
          title: "Najważniejsze informacje",
        },
        highlights: [
          {
            title: "Licytacje bez wadium",
            description:
              "Dla większości pojazdów nie wymagamy wpłaty zabezpieczenia. Wadium obowiązuje jedynie przy autach o wartości powyżej 20 000 CHF.",
          },
          {
            title: "Forma płatności",
            description:
              "Możliwy jest przelew bezpośrednio do Szwajcarii lub płatność gotówką przy odbiorze pojazdu, po wcześniejszym ustaleniu.",
          },
          {
            title: "Cło 10%",
            description:
              "Dotyczy samochodów wyprodukowanych poza UE lub tych, które w dokumentach posiadają oznaczenie ‘Typenschein X’.",
          },
        ],
        process: {
          badge: "Ablauf",
          title: "Proces zakupu – krok po kroku",
          step: "Schritt",
        },
        steps: [
          {
            title: "Złożenie oferty",
            description:
              "Składasz ofertę na wybrany pojazd za pośrednictwem naszego portalu. Aukcje organizowane przez szwajcarskie firmy ubezpieczeniowe mają charakter przetargowy – uczestnicy nie widzą wzajemnych ofert (tzw. licytacje kopertowe).\nUwaga: każda złożona oferta jest wiążąca i w przypadku jej przyjęcia rodzi obowiązek zapłaty.",
          },
          {
            title: "Informacja o wyniku aukcji",
            description:
              "Po zakończeniu aukcji informacja o wygranej pojawi się w panelu klienta oraz zostanie wysłana e-mailem.\nWyjątek stanowią aukcje firmy Allianz – kończą się one zawsze o godzinie 14:59:59 (od poniedziałku do piątku), a decyzja o przyznaniu pojazdu może trwać nawet do 30 dni. Informacja o wygranej również pojawi się w panelu klienta.\nZdarzają się także sytuacje, w których pojazd może zostać przyznany oferentowi z „drugiego miejsca” – dotyczy to wyłącznie aukcji firmy ubezpieczeniowej SCC.",
          },
          {
            title: "Decyzja sprzedającego",
            description:
              "Po zakończeniu aukcji oczekujemy maksymalnie 30 dni na potwierdzenie sprzedaży pojazdu. Najczęściej decyzja zapada w ciągu pierwszych dwóch tygodni.\nJeśli po 30 dniach status aukcji nie zmieni się na „przyznany”, oznacza to brak akceptacji oferty przez sprzedającego.",
          },
          {
            title: "Finalizacja zakupu",
            description:
              "Po przyznaniu pojazdu należy rozliczyć transakcję oraz uzupełnić dane kupującego w panelu klienta, przesyłając wymagane dokumenty (szczegóły otrzymasz e-mailem).\nPłatność realizowana jest przelewem zagranicznym w walucie CHF lub – po ustaleniu – gotówką przy dostawie. Szczegółowe instrukcje wysyłamy na adres e-mail podany podczas rejestracji.",
          },
          {
            title: "Dostawa pojazdu",
            description:
              "Samochód zostanie dostarczony pod wskazany adres. Poniżej znajdziesz listę dokumentów oraz dodatkowe koszty po stronie kupującego.",
          },
        ],
        delivery: {
          badge: "Lieferung",
          title: "Dostawa pojazdu",
          points: [
            "Samochód zostanie dostarczony pod wskazany adres wraz z kompletem dokumentów potrzebnych do rejestracji w Polsce:",
            "Dołączamy następujące dokumenty:",
            "oryginalny dowód pojazdu,",
            "faktura zakupu,",
            "dokumenty odprawy granicznej,",
            "faktura za transport.",
          ],
          footer:
            "Koszty takie jak akcyza, tłumaczenia, ewentualna opinia rzeczoznawcy, badanie techniczne oraz opłaty w wydziale komunikacji Klient pokrywa we własnym zakresie. Współpracujemy z firmą, która może pomóc w formalnościach związanych z akcyzą, rejestracją pojazdu oraz ubezpieczeniem.",
        },
        transport: {
          badge: "Transport",
          title: "Transport",
          description: [
            "Koszt transportu wyliczany jest na podstawie kalkulatora dostępnego po zalogowaniu i dotyczy dostawy do centralnej Polski.",
            "Regiony skrajne kraju wymagają indywidualnej wyceny.",
          ],
          bulletTitle: "Indywidualnie wyceniany jest również transport:",
          bullets: [
            "pojazdów powyżej 2200 kg,",
            "busów,",
            "łodzi motorowych,",
            "maszyn rolniczych.",
          ],
          extraFeesTitle: "Możliwe dodatkowe opłaty transportowe:",
          extraFees: [
            "załadunek pojazdu z poważnym uszkodzeniem (np. urwane koło, uszkodzona skrzynia biegów): 50 CHF,",
            "konieczność dojazdu po pojazd pociągiem: 50 CHF (bilet w jedną stronę).",
          ],
        },
      },
      privacyPolicyPage: {
        badge: "Polityka prywatności",
        title: "Polityka prywatności serwisu autoszczech.ch",
        lead:
          "Zasady przetwarzania danych osobowych użytkowników Serwisu, w tym informacje o administratorze, celach i podstawach prawnych oraz prawach osób, których dane dotyczą.",
        intro: [
          "Niniejsza Polityka Prywatności określa zasady przetwarzania danych osobowych użytkowników serwisu internetowego autoszczech.ch (dalej: \"Serwis\").",
          "Administrator dokłada szczególnej staranności, aby chronić prywatność osób korzystających z Serwisu oraz zapewnić bezpieczeństwo przetwarzanych danych osobowych.",
        ],
        sections: [
          {
            title: "§1. Administrator danych osobowych",
            paragraphs: [
              "Administratorem danych osobowych jest:",
              "JACEK SZCZĘCH\nFIRMA HANDLOWO – USŁUGOWA AUTO SZCZĘCH JACEK SZCZĘCH\nNIP: 8261450580\nREGON: 140317079\nAdres: Korytnica, ul. 52A, 08-455\nAdres e-mail: biuro@autoszczech.ch",
              "Administrator jest odpowiedzialny za przetwarzanie danych osobowych zgodnie z obowiązującymi przepisami prawa, w szczególności z Rozporządzeniem Parlamentu Europejskiego i Rady (UE) 2016/679 (RODO).",
              "Kontakt w sprawach związanych z ochroną danych osobowych możliwy jest za pośrednictwem adresu e-mail: biuro@autoszczech.ch.",
            ],
          },
          {
            title: "§2. Zasady przetwarzania danych osobowych",
            paragraphs: [],
            bullets: [
              "Dane osobowe są przetwarzane w sposób zgodny z prawem, rzetelny i przejrzysty.",
              "Administrator stosuje odpowiednie środki techniczne i organizacyjne w celu zabezpieczenia danych przed ich utratą, nieuprawnionym dostępem, modyfikacją lub ujawnieniem.",
              "Dostęp do danych osobowych mają wyłącznie osoby upoważnione przez Administratora.",
              "Korzystanie z Serwisu w zakresie przeglądania treści jest możliwe bez podawania danych osobowych.",
            ],
          },
          {
            title: "§3. Cele i podstawy przetwarzania danych",
            paragraphs: ["Dane osobowe użytkowników mogą być przetwarzane w następujących celach:"],
            bullets: [
              "realizacji usług świadczonych za pośrednictwem Serwisu, w tym obsługi zapytań oraz kontaktu z użytkownikami – na podstawie art. 6 ust. 1 lit. b i f RODO;",
              "realizacji obowiązków wynikających z przepisów prawa (np. księgowych i podatkowych) – art. 6 ust. 1 lit. c RODO;",
              "przesyłania informacji handlowych lub newslettera – wyłącznie na podstawie dobrowolnie wyrażonej zgody (art. 6 ust. 1 lit. a RODO);",
              "dochodzenia lub zabezpieczenia ewentualnych roszczeń – art. 6 ust. 1 lit. f RODO.",
            ],
            afterBullets: [
              "Podanie danych osobowych jest dobrowolne, jednak w niektórych przypadkach może być niezbędne do skorzystania z określonych funkcjonalności Serwisu.",
            ],
          },
          {
            title: "§4. Zakres przetwarzanych danych",
            paragraphs: [
              "Administrator przetwarza wyłącznie dane niezbędne do realizacji określonych celów.",
            ],
            bullets: [
              "Zakres danych może obejmować m.in.: imię, nazwisko, adres e-mail, numer telefonu, adres IP oraz inne dane przekazane dobrowolnie przez użytkownika w treści formularzy lub korespondencji.",
              "Adresy IP mogą być wykorzystywane do celów technicznych, statystycznych oraz związanych z bezpieczeństwem Serwisu.",
            ],
          },
          {
            title: "§5. Prawa osób, których dane dotyczą",
            paragraphs: ["Każdej osobie, której dane są przetwarzane, przysługują następujące prawa:"],
            bullets: [
              "prawo dostępu do danych oraz otrzymania ich kopii;",
              "prawo do sprostowania danych;",
              "prawo do usunięcia danych (\"prawo do bycia zapomnianym\");",
              "prawo do ograniczenia przetwarzania;",
              "prawo do przenoszenia danych;",
              "prawo wniesienia sprzeciwu wobec przetwarzania danych;",
              "prawo cofnięcia zgody w dowolnym momencie (jeśli przetwarzanie odbywa się na podstawie zgody);",
              "prawo wniesienia skargi do Prezesa Urzędu Ochrony Danych Osobowych.",
            ],
            afterBullets: [
              "Realizacja powyższych praw następuje poprzez kontakt z Administratorem pod adresem e-mail: biuro@autoszczech.ch.",
            ],
          },
          {
            title: "§6. Odbiorcy danych",
            paragraphs: [
              "Dane osobowe mogą być przekazywane podmiotom uprawnionym do ich otrzymania na podstawie przepisów prawa.",
              "Dane mogą być również powierzane podmiotom współpracującym z Administratorem, takim jak dostawcy usług IT, hostingowych, księgowych lub marketingowych – wyłącznie na podstawie odpowiednich umów powierzenia przetwarzania danych.",
              "Dane osobowe nie są przekazywane do państw trzecich ani organizacji międzynarodowych.",
            ],
          },
          {
            title: "§7. Okres przechowywania danych",
            paragraphs: [
              "Dane osobowe są przechowywane przez okres niezbędny do realizacji celu, dla którego zostały zebrane, lub do momentu cofnięcia zgody.",
              "Po upływie tego okresu dane są usuwane lub anonimizowane zgodnie z obowiązującymi przepisami.",
            ],
          },
        ],
        closing: [
          "Administrator nie podejmuje decyzji wobec użytkowników w sposób wyłącznie zautomatyzowany, w tym w formie profilowania.",
          "Administrator zastrzega sobie prawo do wprowadzania zmian w niniejszej Polityce Prywatności. Aktualna wersja dokumentu będzie każdorazowo publikowana w Serwisie.",
          "Polityka Prywatności obowiązuje od dnia jej opublikowania.",
        ],
      },
      termsPage: {
        badge: "Regulamin",
        title: "Regulamin serwisu autoszczech.ch",
        lead: "Zasady korzystania z serwisu oraz udziału w aukcjach pojazdów.",
        intro: [
          "Regulamin określa zasady korzystania z Serwisu oraz warunki udziału w aukcjach pojazdów.",
        ],
        sections: [
          {
            title: "§1. Informacje ogólne",
            paragraphs: [
              "Właścicielem oraz operatorem serwisu internetowego autoszczech.ch (dalej: \"Serwis\") jest:\nJACEK SZCZĘCH, prowadzący działalność gospodarczą pod firmą\nFIRMA HANDLOWO – USŁUGOWA AUTO SZCZĘCH JACEK SZCZĘCH,\nNIP: 8261450580, REGON: 140317079,\nadres: Korytnica, ul. 52A, 08-455,\ne-mail: biuro@autoszczech.ch,\nzwany dalej \"Operatorem\".",
              "Użytkownikiem Serwisu może być każda osoba fizyczna lub prawna, która założyła konto użytkownika, zapoznała się z Regulaminem oraz Polityką Prywatności i zaakceptowała ich treść.",
              "Informacje publikowane w Serwisie mają charakter wyłącznie informacyjny i nie stanowią oferty handlowej w rozumieniu Kodeksu cywilnego ani innych obowiązujących przepisów prawa.",
            ],
          },
          {
            title: "§2. Charakter Serwisu",
            paragraphs: [
              "Serwis pełni funkcję platformy umożliwiającej dostęp do aukcji pojazdów, części oraz innych przedmiotów związanych z motoryzacją.",
              "Operator nie jest producentem ani ubezpieczycielem pojazdów i nie ponosi odpowiedzialności za ich stan techniczny.",
              "Użytkownik podejmuje decyzje zakupowe na własną odpowiedzialność.",
              "Opisy i zdjęcia pojazdów pochodzą od podmiotów trzecich, a Operator nie odpowiada za ewentualne nieścisłości lub błędy w ich treści.",
            ],
          },
          {
            title: "§3. Zasady udziału w aukcjach",
            paragraphs: ["Każda aukcja posiada indywidualny numer identyfikacyjny. Użytkownik za pośrednictwem Serwisu wskazuje przedmiot aukcji oraz oferowaną cenę, a Operator składa ofertę w imieniu Użytkownika w ramach danej aukcji."],
            bullets: [
              "Złożone oferty są wiążące i nie podlegają wycofaniu.",
            ],
          },
          {
            title: "§4. Wynik aukcji i przyznanie przedmiotu",
            paragraphs: ["Informacja o wyniku aukcji przekazywana jest Użytkownikowi po jej zakończeniu."],
            bullets: [
              "Ostateczne przyznanie pojazdu przez podmiot organizujący aukcję może nastąpić w terminie do 30 dni roboczych.",
              "Organizator aukcji może powtórzyć procedurę aukcyjną lub ponownie rozpatrzyć złożone oferty.",
              "Aukcje oznaczone jako Allianz mogą mieć odrębne zasady informowania o wyniku.",
            ],
          },
          {
            title: "§5. Płatności i realizacja",
            paragraphs: ["Po przyznaniu przedmiotu Operator przekazuje Użytkownikowi informacje dotyczące płatności."],
            bullets: [
              "Użytkownik zobowiązuje się do uregulowania należności w terminie 5 dni roboczych.",
              "Wydanie pojazdu oraz dokumentów następuje po spełnieniu wszystkich zobowiązań finansowych.",
            ],
          },
          {
            title: "§6. Kary umowne",
            paragraphs: [],
            bullets: [
              "W przypadku opóźnienia w płatności Operator może naliczyć opłatę parkingową w wysokości 30 CHF za każdy dzień zwłoki.",
              "Brak zapłaty za przyznany pojazd skutkuje obowiązkiem zapłaty kary umownej w wysokości 20% zaoferowanej kwoty, jednak nie mniej niż 2000 CHF.",
              "Nieopłacenie i nieodebranie przedmiotu może skutkować usunięciem konta użytkownika oraz zablokowaniem dalszego dostępu do Serwisu.",
            ],
          },
          {
            title: "§7. Wydanie pojazdu i stan techniczny",
            paragraphs: [],
            bullets: [
              "Wydanie pojazdu następuje pod adresem wskazanym przez Użytkownika lub w siedzibie Operatora.",
              "Organizator aukcji nie odpowiada za różnice w stanie pojazdu pomiędzy momentem prezentacji a odbiorem.",
              "Elementy dodatkowe oraz wyposażenie ruchome nie stanowią przedmiotu aukcji.",
              "Pojazd może zostać wydany z jednym kompletem kluczy.",
            ],
          },
          {
            title: "§8. Rozstrzyganie sporów",
            paragraphs: [],
            bullets: [
              "Strony zobowiązują się w pierwszej kolejności do polubownego rozwiązania ewentualnych sporów.",
              "W przypadku braku porozumienia, spory rozstrzygane będą przez sąd właściwy dla siedziby Operatora.",
            ],
          },
          {
            title: "§9. Postanowienia końcowe",
            paragraphs: [],
            bullets: [
              "Rejestracja w Serwisie oznacza akceptację niniejszego Regulaminu.",
              "Operator zastrzega sobie prawo do zmiany Regulaminu.",
              "Aktualna wersja Regulaminu jest publikowana w Serwisie autoszczech.ch.",
              "Regulamin obowiązuje od dnia jego opublikowania.",
            ],
          },
        ],
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
