# Nitkomat

Porównywarka cen filamentu do druku 3D, przeliczanych na złotówki za kilogram. Szablon jest przygotowany tak, żeby po
zmianie konfiguracji i danych obsłużyć inną niszę.

Dane w repozytorium są przykładowe i wymyślone (sklepy i marki z prefiksem „przykładowy”).

## Uruchomienie

```bash
npm install
cp .env.example .env.local   # uzupełnij klucze panelu admina
npm run dev                  # http://localhost:3000
npm run typecheck
npm run build
```

Wymagany Node.js 20.9 lub nowszy (Next.js 16).

## Panel administratora

Panel jest pod `/admin`. Działa tylko po ustawieniu dwóch zmiennych środowiskowych:

- `ADMIN_PASSWORD`: hasło do logowania.
- `ADMIN_SESSION_SECRET`: minimum 32 znaki losowe, np. `openssl rand -hex 32`.

Bez obu zmiennych logowanie jest wyłączone.

Zabezpieczenia:
- Każda strona i akcja w panelu sprawdza sesję (proxy to pierwsza linia obrony, nie jedyna).
- Sesja to podpisany HMAC cookie: `HttpOnly`, `SameSite=Strict`, `Secure` w produkcji, ważna 8 godzin.
- Porównanie hasła jest odporne na ataki czasowe. Po 5 nieudanych próbach logowanie jest blokowane na 15 minut.
- Wszystkie zapisy przechodzą przez walidację (zod). Linki w ofertach akceptują tylko `http(s)`.
- Panel jest oznaczony `noindex` i wykluczony w `robots.txt`.

Ograniczenia v0:
- Dane zapisywane są do `data/catalog.json` (plik tymczasowy + rename). To działa na jednym serwerze z trwałym
  dyskiem. Na platformach bez trwałego systemu plików (np. Vercel) trzeba najpierw przenieść dane do bazy.
- Limit logowania działa w pamięci procesu. Przy kilku instancjach trzeba użyć wspólnego magazynu.
- Adres IP do limitu brany jest z `X-Forwarded-For`. Za reverse proxy ustaw go tak, żeby klient nie mógł go podrobić.

## Struktura

- `config/niche.ts`: jedyny plik opisujący niszę. Nazwa, jednostka przeliczeniowa, filtry materiałów, nawigacja,
  dane prawne i zastrzeżenia.
- `data/catalog.json`: sklepy, produkty i oferty. Docelowo zastąpi go baza, a scrapery lub feedy będą ją zasilać.
- `lib/schema.ts`: walidacja danych, także spójność katalogu (brak osieroconych ofert, unikalne klucze).
- `lib/catalog.ts`: dostęp i zapis danych. Strony korzystają tylko z tego modułu.
- `lib/pricing.ts`: przeliczanie ceny na jednostkę i formatowanie w złotówkach.
- `lib/session.ts`, `lib/admin-auth.ts`, `lib/rate-limit.ts`: logowanie i ochrona panelu.
- `proxy.ts`: ochrona `/admin` (Next.js 16 zamiast `middleware.ts`).
- `app/(site)/`: strony publiczne (strona główna, katalog, karta produktu, kalkulator, regulamin, polityka prywatności).
- `app/admin/`: logowanie i panel (dashboard, edycja produktu, oferty, sklepy).
- `next.config.mjs`: nagłówki bezpieczeństwa (CSP, HSTS, X-Frame-Options i inne).

## Jak dodać nową niszę

1. Zmień wartości w `config/niche.ts` (nazwa, jednostka, materiały, nawigacja).
2. Podmień `data/catalog.json` na dane nowej niszy. Model danych pozostaje ten sam.
3. Dodaj lub usuń narzędzia w sekcji `navigation.tools` i odpowiadające im strony w `app/(site)/tools/`.

## Bezpieczeństwo zależności

Stan z ostatniego sprawdzenia: `npm audit --omit=dev` zgłasza 0 podatności. Next.js 14.2.x miał krytyczne podatności
bez poprawek w tej linii, dlatego projekt działa na Next.js 16 i React 19. Przy aktualizacjach uruchamiaj `npm audit`.

## Do zrobienia przed startem

- Scrapery lub importy feedów sklepów (osobny moduł na każdy sklep).
- Baza danych zamiast pliku JSON.
- Konta użytkowników, alerty mailowe i zapisywanie historii cen.
- Płatności Premium.
- Regulamin i polityka prywatności (obecnie tylko placeholdery), dane operatora w `config/niche.ts`.
- Sitemap i dane strukturalne SEO.
- Cookies: po dodaniu analityki potrzebny baner zgody.
