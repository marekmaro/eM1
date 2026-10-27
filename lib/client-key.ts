import { createHash } from "node:crypto";

// Klucz klienta do limitów prób. Nagłówki proxy (X-Forwarded-For, X-Real-IP) ufamy tylko
// wtedy, gdy serwis stoi za własnym reverse proxy i ustawiono TRUST_PROXY=1. Inaczej każdy
// klient mógłby podszyć się pod dowolny adres.
//
// Bez zaufanego proxy używamy odcisku przeglądarki. Jest to słabsze niż IP, ale jeden
// klient nie zablokuje wszystkich pozostałych, co zdarzyłoby się przy wspólnym kubełku.
export function clientKey(headers: Headers): string {
  if (process.env.TRUST_PROXY === "1") {
    const realIp = headers.get("x-real-ip")?.trim();
    if (realIp) return `ip:${realIp}`;
    const forwarded = headers.get("x-forwarded-for")?.split(",")[0]?.trim();
    if (forwarded) return `ip:${forwarded}`;
  }

  const fingerprint = `${headers.get("user-agent") ?? ""}|${headers.get("accept-language") ?? ""}`;
  return `ua:${createHash("sha256").update(fingerprint).digest("hex").slice(0, 16)}`;
}
