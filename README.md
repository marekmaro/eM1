# Nitkomat

Porównywarka cen filamentu do druku 3D, przeliczanych na złotówki za kilogram. Szablon projektu jest przygotowany tak,
żeby po zmianie konfiguracji i danych obsłużyć inną niszę.

Dane w repozytorium są przykładowe i wymyślone (sklepy i marki z prefiksem „przykładowy”).

## Uruchomienie

```bash
npm install
npm run dev        # http://localhost:3000
npm run typecheck
npm run build
```

## Struktura

- `config/niche.ts`: jedyny plik opisujący niszę. Nazwa, jednostka przeliczeniowa, filtry materiałów, nawigacja,
  dane prawne i zastrzeżenia.
- `data/catalog.json`: sklepy, produkty i oferty. Docelowo zastąpi go baza, a scrapery lub feedy będą ją zasilać.
- `lib/types.ts`: model danych (sklep, produkt, oferta).
- `lib/pricing.ts`: przeliczanie ceny na jednostkę i formatowanie w złotówkach.
- `lib/catalog.ts`: dostęp do danych. Strony korzystają tylko z tego modułu.
- `app/`: strony. Strona główna, katalog, karta produktu, kalkulator kosztu wydruku, regulamin i polityka prywatności.

## Jak dodać nową niszę

1. Zmień wartości w `config/niche.ts` (nazwa, jednostka, materiały, nawigacja).
2. Podmień `data/catalog.json` na dane nowej niszy. Model danych pozostaje ten sam.
3. Dodaj lub usuń narzędzia w sekcji `navigation.tools` i odpowiadające im strony w `app/tools/`.

## Do zrobienia przed startem

- Scrapery lub importy feedów sklepów (osobny moduł na każdy sklep).
- Baza danych zamiast pliku JSON.
- Konta użytkowników, alerty mailowe i zapisywanie historii cen.
- Płatności Premium.
- Regulamin i polityka prywatności (obecnie tylko placeholdery), dane operatora w `config/niche.ts`.
- Sitemap i dane strukturalne SEO.
