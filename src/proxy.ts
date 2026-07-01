import { NextRequest, NextResponse } from "next/server";


// Route access configuration

const PUBLIC_PATHS = ["/", "/authentication", "/calculators"];

const ROLE_PATHS: Record<string, string[]> = {
  brand: ["/brand"],
  influencer: ["/influencer"],
  admin: ["/admin", "/brand", "/influencer"],
};

function matchesPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );
}

function getRequiredRole(pathname: string): string | null {
  if (pathname.startsWith("/brand")) return "brand";
  if (pathname.startsWith("/influencer")) return "influencer";
  if (pathname.startsWith("/admin")) return "admin";
  return null;
}


// Middleware

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Always allow public routes, PWA assets, and API routes
  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname === "/sw.js" ||
    pathname === "/manifest.webmanifest" ||
    pathname.endsWith(".webmanifest") ||
    pathname.startsWith("/icon-") ||
    matchesPublicPath(pathname)
  ) {
    return NextResponse.next();
  }

  // Read the custom session cookie set by our OTP auth
  const sessionToken = request.cookies.get("reelio_session")?.value;

  if (!sessionToken) {
    // Not authenticated — redirect to login
    const loginUrl = new URL("/authentication", request.url);
    loginUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Validate session + get user role from the backend API
  try {
    // Use the real backend API URL — there is no local /api/auth/session route
    const backendBase =
      process.env.NEXT_PUBLIC_API_URL ||
      "https://backend-api.richyreach.com/api";

    const sessionRes = await fetch(`${backendBase}/auth/session`, {
      headers: {
        // Backend accepts Bearer token (same as the client-side api-client)
        Authorization: `Bearer ${sessionToken}`,
        Cookie: `reelio_session=${sessionToken}`,
      },
      cache: "no-store",
    });

    if (!sessionRes.ok) {
      // Invalid / expired session
      const loginUrl = new URL("/authentication", request.url);
      loginUrl.searchParams.set("redirectTo", pathname);
      const res = NextResponse.redirect(loginUrl);
      // Clear stale cookie
      res.cookies.delete("reelio_session");
      return res;
    }

    const sessionData = (await sessionRes.json()) as any;
    const userRole: string = sessionData?.data?.user?.role ?? "";

    // Enforce role-based access
    const requiredRole = getRequiredRole(pathname);

    if (requiredRole) {
      const allowedRoles = Object.entries(ROLE_PATHS)
        .filter(([, paths]) => paths.some((p) => pathname.startsWith(p)))
        .map(([role]) => role);

      // Admin can access everything
      if (userRole !== "admin" && !allowedRoles.includes(userRole)) {
        // Role mismatch — redirect to user's correct dashboard
        const dashboardUrl = new URL(
          `/${userRole}/dashboard`,
          request.url
        );
        return NextResponse.redirect(dashboardUrl);
      }
    }

    // Pass user role to downstream via headers
    const response = NextResponse.next();
    response.headers.set("x-user-role", userRole);
    return response;
  } catch (err) {
    console.error("[Middleware] Session validation failed:", err);
    const loginUrl = new URL("/authentication", request.url);
    return NextResponse.redirect(loginUrl);
  }
}

export const config = {
  // Match all routes except Next.js internals and static assets
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|webmanifest)$).*)",
  ],
};
