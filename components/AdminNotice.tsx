const ERRORS = new Map<string, string>([
  ["password", "Nieprawidłowe hasło."],
  ["limit", "Zbyt wiele prób logowania. Spróbuj ponownie za 15 minut."],
  ["disabled", "Panel jest wyłączony. Ustaw ADMIN_PASSWORD i ADMIN_SESSION_SECRET (min. 32 znaki)."],
  ["invalid", "Nie udało się zapisać. Sprawdź pola: liczby z kropką, adresy http(s), slug małymi literami."],
  ["duplicate", "Rekord o tym kluczu już istnieje."],
  ["missing", "Nie znaleziono rekordu."],
  ["shop", "Wybrany sklep nie istnieje."],
  ["confirm", "Zaznacz potwierdzenie, aby wykonać operację."],
  ["shop_has_offers", "Sklep ma oferty. Najpierw usuń lub przenieś jego oferty."],
  ["empty_import", "Wklej dane do importu."],
  ["import", "Import nie został zapisany. Popraw błędy poniżej i spróbuj ponownie."],
]);

const SAVED = new Map<string, string>([
  ["product", "Zapisano produkt."],
  ["offer", "Zapisano ofertę."],
  ["shop", "Zapisano sklep."],
  ["deleted", "Usunięto."],
  ["stock", "Zmieniono dostępność."],
  ["report", "Zgłoszenie zaktualizowane."],
  ["stats", "Statystyki kliknięć wyzerowane."],
]);

export function AdminNotice({ error, saved }: { error?: string; saved?: string }) {
  if (error) {
    return (
      <div className="notice notice-error" role="alert">
        {ERRORS.get(error) ?? "Wystąpił błąd."}
      </div>
    );
  }
  if (saved) {
    return (
      <div className="notice notice-ok" role="status">
        {SAVED.get(saved) ?? "Zapisano."}
      </div>
    );
  }
  return null;
}
