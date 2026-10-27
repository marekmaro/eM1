import { NextResponse } from "next/server";
import { getCatalog } from "@/lib/catalog";
import { recordClick } from "@/lib/stats";
import { safeHref } from "@/lib/url";

export const dynamic = "force-dynamic";

// Przekierowanie do sklepu z licznikiem kliknięć. Cel pochodzi wyłącznie z katalogu,
// nie z parametrów URL, więc nie da się tego użyć jako otwartego przekierowania.
export async function GET(_request: Request, { params }: { params: Promise<{ slug: string; shopId: string }> }) {
  const { slug, shopId } = await params;
  const headers = { "Cache-Control": "no-store" };

  const offer = getCatalog().offers.find((item) => item.productSlug === slug && item.shopId === shopId);
  const target = offer ? safeHref(offer.url) : "#";
  if (!offer || target === "#") {
    return new NextResponse("Nie znaleziono oferty.", { status: 404, headers });
  }

  try {
    recordClick(slug, shopId);
  } catch {
    // Licznik nie może blokować przejścia do sklepu.
  }
  return NextResponse.redirect(target, { status: 302, headers });
}
