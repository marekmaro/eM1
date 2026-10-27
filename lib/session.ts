// Ten moduł działa zarówno w proxy (middleware), jak i w Node, dlatego używa tylko Web Crypto.

export const SESSION_COOKIE = "nitkomat_admin";
export const SESSION_TTL_S = 60 * 60 * 8;

const encoder = new TextEncoder();

export function adminEnabled(): boolean {
  return Boolean(process.env.ADMIN_PASSWORD) && (process.env.ADMIN_SESSION_SECRET ?? "").length >= 32;
}

async function signingKey(): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(process.env.ADMIN_SESSION_SECRET ?? ""),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
}

function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function sign(payload: string): Promise<string> {
  return toHex(await crypto.subtle.sign("HMAC", await signingKey(), encoder.encode(payload)));
}

function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

// Token ma postać: "<czas wygaśnięcia>.<podpis HMAC>".
export async function createSessionToken(): Promise<string> {
  const expires = Math.floor(Date.now() / 1000) + SESSION_TTL_S;
  return `${expires}.${await sign(String(expires))}`;
}

export async function verifySessionToken(token: string | undefined): Promise<boolean> {
  if (!adminEnabled() || !token) return false;

  const [payload, signature, extra] = token.split(".");
  if (!payload || !signature || extra !== undefined || !/^\d+$/.test(payload)) return false;
  if (Number(payload) * 1000 <= Date.now()) return false;

  return constantTimeEqual(await sign(payload), signature);
}
