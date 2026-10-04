import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const { pathname } = request.nextUrl;

  const isAuthPage = pathname.startsWith("/iniciar-sesion") || pathname.startsWith("/registrate");
  const isProtectedRoute = pathname.startsWith("/mapa-barranquilla");
  

  if(!token && isProtectedRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/iniciar-sesion";
    return NextResponse.redirect(url)
  }

  if(isAuthPage && token) {
    const url = request.nextUrl.clone();
    url.pathname = "/mapa-barranquilla";
    return NextResponse.redirect(url)
  }


}
export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
