import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const host = request.headers.get("host") || "";
  const cleanHost = host.split(":")[0].toLowerCase();
  const { pathname, search } = request.nextUrl;

  // Enforce architectural boundary:
  // Subdomains (*.localhost) are STRICTLY and EXCLUSIVELY for the tenant's public website.
  // The central operations dashboard and platform onboarding/login belong exclusively on http://localhost:3000.
  if (
    (pathname.startsWith("/dashboard") || pathname === "/login" || pathname === "/onboard") &&
    cleanHost.endsWith(".localhost") &&
    cleanHost !== "localhost" &&
    cleanHost !== "admin.localhost"
  ) {
    const targetUrl = new URL(pathname, "http://localhost:3000");
    targetUrl.search = search;
    if (pathname.startsWith("/dashboard")) {
      targetUrl.searchParams.set("tenant", cleanHost);
    }
    const finalUrl = targetUrl.toString();

    // Use HTML meta-refresh and script navigation to avoid Next.js dev server normalizing
    // cross-subdomain localhost Location headers into relative paths
    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta http-equiv="refresh" content="0;url=${finalUrl}" />
  <title>Redirecting to Operations Dashboard...</title>
  <script>window.location.replace(${JSON.stringify(finalUrl)});</script>
</head>
<body style="background:#07080D;color:#94a3b8;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;">
  <p>Redirecting to operations dashboard...</p>
</body>
</html>`;

    return new Response(html, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
      },
    });
  }

  const response = NextResponse.next();

  // Persist the active tenant in a cookie so server layouts/pages (which cannot
  // read search params) keep rendering the correct tenant storefront.
  const tenantParam = request.nextUrl.searchParams.get("tenant");
  if (tenantParam) {
    response.cookies.set("tenant_ctx", tenantParam.replace(/:\d+$/, ""), {
      path: "/",
      sameSite: "lax",
      maxAge: 60 * 60 * 12,
    });
  } else if (request.nextUrl.searchParams.has("tenant")) {
    response.cookies.delete("tenant_ctx");
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
