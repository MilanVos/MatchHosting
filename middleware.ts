import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { nextUrl, auth: session } = req;

  const isLoggedIn = !!session;
  const isAdmin = session?.user?.role === "ADMIN";

  const protectedRoutes = ["/dashboard", "/courses"];
  const adminRoutes = ["/admin"];
  const authRoutes = ["/auth/login", "/auth/register"];

  const isProtectedRoute = protectedRoutes.some((route) =>
    nextUrl.pathname.startsWith(route)
  );
  const isAdminRoute = adminRoutes.some((route) =>
    nextUrl.pathname.startsWith(route)
  );
  const isAuthRoute = authRoutes.some((route) =>
    nextUrl.pathname.startsWith(route)
  );

  if (isAdminRoute && (!isLoggedIn || !isAdmin)) {
    return NextResponse.redirect(new URL("/auth/login", nextUrl));
  }

  if (isProtectedRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL("/auth/login", nextUrl));
  }

  if (isAuthRoute && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|public).*)"],
};
