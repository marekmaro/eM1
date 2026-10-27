# Nitkomat

Porównywarka cen filamentu do druku 3D, przeliczanych na złotówki za kilogram. Szablon jest przygotowany tak, żeby po
zmianie konfiguracji i danych obsłużyć inną niszę.

Dane w repozytorium są przykładowe i wymyślone (sklepy i marki z prefiksem „przykładowy”).

Audyt bezpieczeństwa: [docs/security-audit.md](docs/security-audit.md).

## Uruchomienie lokalnie

```bash
npm install
cp .env.example .env.local   # uzupełnij klucze panelu admina
npm run dev                  # http://localhost:3000
npm run typecheck
npm run build && npm start   # wersja produkcyjna
```

Wymagany Node.js 20.9 lub nowszy (Next.js 16). Zalecany Node.js 22 LTS.

### Uruchomienie w VS Code (Windows, macOS, Linux)

1. Zainstaluj Node.js 22 LTS z nodejs.org oraz Git.
2. W VS Code: `File → Open Folder`, wskaż katalog projektu. Otwórz terminal: `Terminal → New Terminal`.
3. W terminalu:
   ```bash
   npm install
   ```
4. Skopiuj plik z kluczami i uzupełnij go:
   - macOS/Linux: `cp .env.example .env.local`
   - Windows PowerShell: `Copy-Item .env.example .env.local`
   
   W `.env.local` wpisz `ADMIN_PASSWORD` i `ADMIN_SESSION_SECRET`. Losowy sekret wygenerujesz poleceniem
   `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`.
5. Uruchom serwer deweloperski: `npm run dev`, albo w panelu **Run and Debug** wybierz „Nitkomat: serwer deweloperski”
   i naciśnij F5. Otworzy się `http://localhost:3000`.
6. Panel admina: `http://localhost:3000/admin/login`. Hasło to wartość `ADMIN_PASSWORD`.

Konfiguracja `.vscode/` ustawia TypeScript z projektu (`typescript.tsdk`), więc podpowiedzi zgadzają się z kodem.
Plik `.env.local` jest w `.gitignore`, nie trafi do repozytorium.

## Wdrożenie

```bash
cp .env.example .env         # ADMIN_PASSWORD, ADMIN_SESSION_SECRET, TRUST_PROXY=1 za proxy
docker compose up -d --build # aplikacja na 127.0.0.1:3000
```

- Dane są w `./data` (montowane jako wolumen). Ten katalog musi być zapisywalny przez użytkownika w kontenerze (UID
  z obrazu `node:22-alpine`, użytkownik `app`), inaczej panel nie zapisze zmian.
- HTTPS zapewnia reverse proxy. Przykład dla Caddy: `Caddyfile.example`.
- Kopię zapasową rób z `./data` albo z eksportu JSON w panelu (Ustawienia).

## Panel administratora (`/admin`)

- **Pulpit:** liczby, kondycja serwisu (katalog, świeżość cen, dostępność, pokrycie, zgłoszenia, zapis danych,
  pamięć), wykres kliknięć z 30 dni, ostatnie zdarzenia.
- **Produkty:** lista z wyszukiwaniem, dodawanie, edycja, usuwanie z potwierdzeniem.
- **Oferty:** lista z filtrami (starsze niż 7 dni, niedostępne), zmiana dostępności jednym kliknięciem.
- **Import CSV:** wklej dane od sklepów (średnik lub przecinek, polskie ceny). Zapis tylko gdy wszystkie wiersze są
  poprawne, a błędy są wypisane z numerem wiersza.
- **Sklepy:** nazwa i adres, usuwanie tylko bez ofert.
- **Zgłoszenia:** błędne ceny zgłoszone przez użytkowników, z oznaczaniem jako rozwiązane.
- **Statystyki:** kliknięcia dziennie, najczęściej klikane oferty, sklepy i materiały, największe różnice cen.
- **Dziennik:** logowania i zmiany w danych (bez haseł i adresów IP).
- **Ustawienia:** eksport ofert (CSV) i katalogu (JSON), wyzerowanie liczników z potwierdzeniem.

Konfiguracja:
- `ADMIN_PASSWORD`: hasło do logowania.
- `ADMIN_SESSION_SECRET`: minimum 32 znaki losowe, np. `openssl rand -hex 32`.
- `SITE_URL`: publiczny adres serwisu, używany w mapie strony i robots.txt.
- `TRUST_PROXY=1`: tylko za reverse proxy, który dopisuje `X-Forwarded-For` albo `X-Real-IP`.

Bez obu zmiennych logowanie jest wyłączone. Sesja to podpisany cookie: HttpOnly, SameSite=Strict, ważny 8 godzin.

## Strony publiczne

- `/products`: filtry (szukaj, materiał, kolor, tylko dostępne), sortowanie.
- `/products/[slug]`: oferty z paskiem porównania, linki przez licznik kliknięć, formularz „Zgłoś błędną cenę”.
- `/sklepy`: który sklep najczęściej ma najniższą cenę i jak bardzo jego ceny odbiegają.
- `/statystyki`: średnie ceny za materiał i największe różnice cen.
- `/tools/print-cost`: kalkulator kosztu materiału w wydruku.
- `/go/[slug]/[shopId]`: przekierowanie do sklepu z licznikiem kliknięć. Cel pochodzi tylko z katalogu.

## Struktura

- `config/niche.ts`: jedyny plik opisujący niszę. Nazwa, jednostka przeliczeniowa, materiały, nawigacja, dane prawne.
- `data/catalog.json`: sklepy, produkty i oferty. Runtime: `clicks.json`, `reports.json`, `audit.log` (w `.gitignore`).
- `lib/schema.ts`: walidacja danych, w tym spójność katalogu (brak osieroconych ofert, unikalne klucze).
- `lib/catalog.ts`, `lib/store.ts`: dostęp do danych. Zapis atomowy (plik tymczasowy + rename).
- `lib/analytics.ts`, `lib/health.ts`, `lib/stats.ts`, `lib/reports.ts`, `lib/audit.ts`: statystyki, kondycja, dane runtime.
- `lib/offers-csv.ts`: import i eksport CSV z ochroną przed formułami.
- `lib/session.ts`, `lib/admin-auth.ts`, `lib/rate-limit.ts`, `lib/client-key.ts`: logowanie i limity.
- `proxy.ts`: ochrona `/admin`. Każda strona i akcja w panelu sprawdza sesję jeszcze raz.
- `app/(site)/`: strony publiczne. `app/admin/`: panel. `app/go/`: przekierowania ze zliczaniem.
- `next.config.mjs`: nagłówki bezpieczeństwa (CSP, HSTS, X-Frame-Options i inne).
- `components/Logo.tsx`: znak i nazwa marki. `public/icon.svg`: favikona.

## Blog i poradniki

Artykuły są w `content/blog/<slug>.md` i zaczynają się od nagłówka z `title`, `description`, `date` (RRRR-MM-DD),
`tags` oraz opcjonalnie `material` (wtedy pod artykułem pojawia się przycisk do katalogu tego materiału).
Błędny nagłówek przerywa build, więc artykuł nie zniknie po cichu. Strony bloga są statyczne.

Adres serwisu w mapie strony i `robots.txt` bierze się z `SITE_URL` (np. `https://example.pl`). Ustaw go w `.env`.

## Jak dodać nową niszę

1. Zmień wartości w `config/niche.ts` (nazwa, jednostka, materiały, nawigacja, dane prawne).
2. Podmień `data/catalog.json` na dane nowej niszy, albo zaimportuj oferty w panelu. Model danych pozostaje ten sam.
3. Dodaj lub usuń narzędzia w `navigation.tools` i odpowiadające im strony w `app/(site)/tools/`.

## Ograniczenia obecnej wersji

- Dane są w plikach JSON. Zapisy zakładają jeden proces. Przy kilku instancjach trzeba przejść na bazę.
- Limity prób działają w pamięci procesu.
- Brak scraperów i feedów sklepów: ceny wprowadzasz ręcznie lub przez import CSV.
- Brak alertów cenowych, konta użytkownika i płatności Premium (przycisk jest zablokowany jako „wkrótce”).
- Regulamin i polityka prywatności to placeholdery. Przed startem musi je przygotować prawnik.
