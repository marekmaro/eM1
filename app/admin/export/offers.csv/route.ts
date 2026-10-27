import { requireAdmin } from "@/lib/admin-auth";
import { getCatalog } from "@/lib/catalog";
import { offersToCsv } from "@/lib/offers-csv";
import { todayIso } from "@/lib/dates";

export const dynamic = "force-dynamic";

export async function GET() {
  await requireAdmin();

  return new Response(offersToCsv(getCatalog()), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="oferty-${todayIso()}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
