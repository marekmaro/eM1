// Jedyny plik, który opisuje niszę. Nowa nisza = nowy zestaw wartości tutaj
// oraz nowe dane w data/catalog.json. Kod stron się nie zmienia.

export const niche = {
  brand: {
    name: "Nitkomat",
    tagline: "Szukaj najtańszego kilograma filamentu.",
  },

  // Jednostka, do której przeliczane są wszystkie ceny w serwisie.
  unit: {
    label: "kg",
    weightG: 1000,
  },

  // Materiały pokazywane jako filtry w katalogu.
  materials: ["PLA", "PETG", "ABS", "TPU"],

  navigation: {
    main: [
      { label: "Produkty", href: "/products" },
      { label: "Sklepy", href: "/sklepy" },
      { label: "Statystyki", href: "/statystyki" },
      { label: "Blog", href: "/blog" },
    ],
    tools: [
      { label: "Kalkulator kosztu wydruku", href: "/tools/print-cost" },
      { label: "Radar okazji", href: "/alerts/radar", soon: true },
    ],
    account: [
      { label: "Alerty cenowe", href: "/alerts", soon: true },
      { label: "Premium", href: "/premium", soon: true },
    ],
  },

  // Uzupełnij przed startem. Bez tych danych serwis nie powinien być publiczny.
  legal: {
    operator: "do uzupełnienia",
    contact: "do uzupełnienia",
  },

  disclaimer:
    "Ceny pochodzą z zewnętrznych źródeł i mogą być opóźnione. Koszt dostawy nie jest wliczony w cenę za kilogram. Ostateczną cenę zawsze sprawdź w sklepie.",
};

export type Niche = typeof niche;
