import { createHash, timingSafeEqual } from "node:crypto";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/session";

// Porównanie skrótów SHA-256 o stałej długości, żeby nie ujawniać długości hasła.
export function passwordMatches(input: string): boolean {
  const expected = process.env.ADMIN_PASSWORD ?? "";
  if (!expected) return false;

  const a = createHash("sha256").update(input, "utf8").digest();
  const b = createHash("sha256").update(expected, "utf8").digest();
  return timingSafeEqual(a, b);
}

// Używane przez każdą akcję i stronę panelu, nie tylko przez proxy.
export async function requireAdmin(): Promise<void> {
  const jar = await cookies();
  if (!(await verifySessionToken(jar.get(SESSION_COOKIE)?.value))) {
    redirect("/admin/login");
  }
}
