import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/session";

// Pierwsza linia obrony panelu. Każda strona i akcja w panelu sprawdza sesję jeszcze raz,
// więc samo obejście proxy nie daje dostępu do danych.
export async function proxy(request: NextRequest) {
  const isLogin = request.nextUrl.pathname === "/admin/login";
  const signedIn = await verifySessionToken(request.cookies.get(SESSION_COOKIE)?.value);

  const response =
    !isLogin && !signedIn
      ? NextResponse.redirect(new URL("/admin/login", request.url))
      : NextResponse.next();

  response.headers.set("X-Robots-Tag", "noindex, nofollow");
  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};
