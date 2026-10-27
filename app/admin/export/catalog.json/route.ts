import { requireAdmin } from "@/lib/admin-auth";
import { getCatalog } from "@/lib/catalog";
import { todayIso } from "@/lib/dates";

export const dynamic = "force-dynamic";

export async function GET() {
  await requireAdmin();

  return new Response(`${JSON.stringify(getCatalog(), null, 2)}\n`, {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="katalog-${todayIso()}.json"`,
      "Cache-Control": "no-store",
    },
  });
}
