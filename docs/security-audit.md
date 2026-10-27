# Audyt bezpieczeństwa: Nitkomat

Zakres: kod aplikacji (strony publiczne, panel admina, akcje serwerowe, route handlery), konfiguracja
(nagłówki, cookie, proxy), zależności (`npm audit`) i zachowanie wdrożonego serwera produkcyjnego lokalnie.

Data audytu: 2026-10-27. Wersje: Next.js 16.4.3, React 19.2.9, zod 4.6.7.

## Podsumowanie

| Obszar                         | Wynik                                                  |
| ------------------------------ | ------------------------------------------------------ |
| Zależności (`npm audit`)       | 0 podatności (prod i dev)                              |
| Ochrona panelu bez sesji       | 13 z 13 tras przekierowuje na logowanie (307)          |
| Ochrona CSRF akcji serwerowych | Obcy Origin odrzucany przez Next ("Invalid Server Actions request") |
| Flagi cookie sesji             | HttpOnly, SameSite=Strict, Path=/admin, Secure w produkcji, 8 h |
| Limit prób logowania           | 5 prób, szósta blokowana (test w przeglądarce)         |
| Limit zgłoszeń                 | 5 przyjętych, szóste blokowane                         |
| Dane runtime publicznie        | `/data/*`, `/.env*`, `/package.json` → 404             |
| Sekrety w bundlu klienta       | 0 wystąpień hasła i nazwy sekretu w `.next/static`     |
| Metody HTTP                    | POST na `/go` → 405                                    |
| Nagłówki                       | CSP, HSTS, X-Frame-Options, nosniff, Referrer-Policy, Permissions-Policy; brak X-Powered-By |

## Znalezione i naprawione

### 1. Krytyczne: Next.js 14.2.5 z opublikowanymi podatnościami (naprawione)
Linia 14.x ma krytyczne podatności bez poprawek, w tym obejście middleware i zdalne wykonanie kodu w niektórych
konfiguracjach. Przeniesiono się na Next.js 16.4.3 i React 19. Ochrona panelu działa przez `proxy.ts`.

### 2. Wysoka: zod 3.25 z podatnością wyczerpania pamięci (naprawione)
Podatność dotyczy walidacji bardzo dużych kolekcji. Przeniesiono się na zod 4.6.7.

### 3. Wysoka: wspólny kubełek limitów dla klientów bez IP (naprawione)
Gdy brakowało nagłówka IP, wszyscy klienci trafiali do jednego klucza `unknown`. Jeden atakujący mógł zablokować
logowanie i zgłoszenia dla wszystkich. Klucz to teraz odcisk przeglądarki. Nagłówki proxy (`X-Real-IP`,
`X-Forwarded-For`) są używane tylko przy `TRUST_PROXY=1`, bo bez zaufanego proxy klient może je dowolnie podrobić.

### 4. Średnia: przypadkowe usunięcie oferty jednym kliknięciem (naprawione)
Usunięcie oferty wymaga teraz potwierdzenia po stronie serwera (`confirm=on`) i rozwijanego formularza w UI.

### 5. Średnia: wartości z URL poza listą (naprawione)
Filtry katalogu i parametry `error`/`saved` akceptują tylko wartości z listy dozwolonych. Nieznane są ignorowane.

### 6. Średnia: formuły w eksporcie CSV (naprawione prewencyjnie)
Wartości zaczynające się od `= + - @` dostają apostrof. W praktyce pola eksportowane są walidowane (slugi, liczby,
adresy http/https), więc wektor nie występuje, ale zabezpieczenie zostaje.

## Zweryfikowane bez zmian

- **XSS w zgłoszeniach i nazwach:** treść wpisana jako `<img src=x onerror=…>` jest renderowana jako tekst
  (test w przeglądarce: 0 elementów `img` w nagłówku).
- **Linki `javascript:`:** odrzucane po stronie serwera przy zapisie oferty i importu CSV.
- **Otwarte przekierowanie:** `/go/[slug]/[shopId]` przekierowuje tylko na adres z katalogu, nie z parametru URL.
  Nieznane pary dają 404, a próba path traversal (`..%2F`) też 404.
- **Honeypot:** wypełnione ukryte pole nie tworzy zgłoszenia (użytkownik widzi „wysłano”).
- **CSRF:** Next.js sprawdza Origin akcji serwerowych. Żądanie z `evil.example` zostało odrzucone (log serwera:
  `Invalid Server Actions request`). Odpowiedź to 500, co jest brzydkie, ale nie wykonuje akcji.
- **Sfałszowany podpis sesji:** `nitkomat_admin=<czas>.<losowy hex>` daje przekierowanie na logowanie.
- **Porównanie hasła:** skróty SHA-256 porównywane przez `timingSafeEqual`, bez przecieku długości.
- **Dziennik zdarzeń:** nie zawiera hasła ani adresów IP (test: tekst hasła nieobecny w tabeli).
- **Import CSV:** zapis tylko gdy cały plik jest poprawny; import nie zmienia katalogu przy błędach (test).

## Pozostałe ryzyka (świadomie zaakceptowane albo do zrobienia)

| Ryzyko | Ocena | Co zrobić |
| ------ | ----- | --------- |
| Jedno współdzielone hasło admina, brak 2FA | Średnie | Długa fraza (min. 20 znaków), menedżer haseł. 2FA w kolejnej wersji. |
| Sesja nie da się unieważnić po stronie serwera (wylogowanie usuwa cookie w przeglądarce) | Niskie | Token jest ważny do 8 h. Zmiana `ADMIN_SESSION_SECRET` unieważnia wszystkie sesje. Przy potrzebie: lista odwołanych tokenów. |
| CSP zezwala na `unsafe-inline` dla skryptów | Niskie | Next.js wymaga nonce do zaostrzenia. Do zrobienia przy analityce. |
| Licznik kliknięć można zawyżać (brak limitu na `/go`) | Niskie | Limit per klient, gdy licznik będzie miał znaczenie finansowe. |
| Limity w pamięci procesu | Niskie dla jednego serwera | Przy kilku instancjach wspólny magazyn (Redis). |
| Zapisy JSON zakładają jeden proces | Średnie przy skalowaniu | Przejście na bazę przed uruchomieniem wielu instancji. |
| Dziennik i zgłoszenia nie mają rotacji | Niskie | Limit rozmiaru i rotacja przy większym ruchu. |
| Zgłoszenia są treścią od użytkowników (spam, dane osobowe w treści) | Średnie | Moderacja w panelu, pole nie zbiera e-maila ani IP. Polityka prywatności musi to opisać. |
| Brak automatycznej kopii zapasowej danych | Średnie | Regularny eksport JSON (Ustawienia) i kopia katalogu `data/`. |
| Obraz Dockera nie został zbudowany w tym środowisku (brak działającego demona) | Informacyjne | Zbudować i uruchomić `docker compose up` na serwerze docelowym. |

## Konfiguracja wdrożenia (wymagane)

1. Ustaw `ADMIN_PASSWORD` (długa fraza) i `ADMIN_SESSION_SECRET` (`openssl rand -hex 32`) w `.env`.
2. Za reverse proxy (np. Caddy z `Caddyfile.example`) ustaw `TRUST_PROXY=1`. Bez tego limity używają odcisku
   przeglądarki.
3. Serwis publikuj tylko przez HTTPS. HSTS działa wyłącznie na HTTPS.
4. Ścieżka `/admin` jest widoczna w `robots.txt` (dyrektywa `Disallow`), więc każdy ją pozna. Strony panelu mają
   `noindex`, ale dostęp chroni wyłącznie hasło i sesja. Przy wrażliwych danych rozważ przeniesienie panelu pod
   nieprzewidywalną ścieżkę albo dostęp tylko z VPN.
5. Regulamin i polityka prywatności muszą zostać przygotowane przez prawnika przed publicznym startem.
