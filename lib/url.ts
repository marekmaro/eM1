// Zwraca adres tylko dla http(s). Inne schematy zamieniamy na "#", żeby nie dało się
// wstrzyknąć javascript: ani data: przez dane z katalogu.
export function safeHref(url: string): string {
  try {
    const { protocol } = new URL(url);
    return protocol === "https:" || protocol === "http:" ? url : "#";
  } catch {
    return "#";
  }
}
