import { NextResponse, type NextRequest } from "next/server";
import { tenantFromHost } from "@/lib/hosts";

// Chaque site client est servi par app/s/[site] : le proxy réécrit
// boulangerie.mondomaine.fr/contact en /s/boulangerie/contact sans changer l'URL visible.
export function proxy(request: NextRequest) {
  const tenant = tenantFromHost(request.headers.get("host"));
  if (!tenant) return NextResponse.next();

  const url = request.nextUrl.clone();
  url.pathname = `/s/${encodeURIComponent(tenant)}${url.pathname === "/" ? "" : url.pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  // Les routes /api (formulaires, images) et les fichiers statiques restent partagés par tous les domaines.
  matcher: ["/((?!api/|_next/|_vercel/|favicon.ico|robots.txt|sitemap.xml).*)"],
};
