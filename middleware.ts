import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const SESSION_COOKIE_NAME = "evolix_session";

const getSecretKey = () => {
  const secret = process.env.AUTH_SECRET || "evolix-os-super-secret-development-key-32-chars";
  return new TextEncoder().encode(secret);
};

// Protected routes requiring authentication
const protectedRoutes = [
  "/dashboard",
  "/attendance",
  "/activity",
  "/workboard",
  "/leads",
  "/quotations",
  "/invoices",
  "/recurring",
  "/clients",
  "/onboarding",
  "/projects",
  "/tasks",
  "/team",
  "/finance",
  "/reports",
];

// Routes restricted strictly to CO_FOUNDER
const coFounderOnlyRoutes = [
  "/activity",
  "/workboard",
  "/leads",
  "/quotations",
  "/invoices",
  "/recurring",
  "/team",
  "/finance",
];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );
  const isProtectedApi = pathname.startsWith("/api/") && !pathname.startsWith("/api/auth/");

  if (!isProtectedRoute && !isProtectedApi) {
    return NextResponse.next();
  }

  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    if (isProtectedApi) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: "Authentication required",
          },
        },
        { status: 401 }
      );
    }

    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  try {
    const secretKey = getSecretKey();
    const { payload } = await jwtVerify(token, secretKey);
    const userRole = payload.role as string;

    // Check Co-Founder only routes
    const isCoFounderOnly = coFounderOnlyRoutes.some((route) =>
      pathname.startsWith(route)
    );

    if (isCoFounderOnly && userRole !== "CO_FOUNDER") {
      if (isProtectedApi) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "FORBIDDEN",
              message: "Access restricted to Co-Founders.",
            },
          },
          { status: 403 }
        );
      }

      // Redirect Interns to dashboard if attempting to access forbidden routes
      const dashboardUrl = new URL("/dashboard", req.url);
      dashboardUrl.searchParams.set("error", "forbidden");
      return NextResponse.redirect(dashboardUrl);
    }

    // Pass role down in request headers for downstream server components / routes
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set("x-user-id", (payload.userId as string) || "");
    requestHeaders.set("x-user-role", userRole || "");

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch (error) {
    if (isProtectedApi) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: "Invalid or expired session token",
          },
        },
        { status: 401 }
      );
    }

    const loginUrl = new URL("/login", req.url);
    return NextResponse.redirect(loginUrl);
  }
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/attendance/:path*",
    "/activity/:path*",
    "/workboard/:path*",
    "/leads/:path*",
    "/quotations/:path*",
    "/invoices/:path*",
    "/recurring/:path*",
    "/clients/:path*",
    "/onboarding/:path*",
    "/projects/:path*",
    "/tasks/:path*",
    "/team/:path*",
    "/finance/:path*",
    "/reports/:path*",
    "/api/:path*",
  ],
};
