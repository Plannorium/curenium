import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

// Define public API routes that don't require authentication
const publicApiRoutes = [
  '/api/mobile/auth/login',
  '/api/mobile/auth/register',
  '/api/mobile/auth/forgot-password',
  '/api/auth/refresh-token', // Token refresh endpoint
  '/api/profile', // Mobile clients use JWT tokens for authentication
  '/api/alerts', // Mobile clients use JWT tokens for authentication
  '/api/appointments', // Mobile clients use JWT tokens for authentication
  '/api/shift-tracking', // Mobile clients use JWT tokens for authentication
  '/api/audit-logs', // Mobile clients use JWT tokens for authentication
  '/api/users', // Mobile clients use JWT tokens for authentication
  '/api/organization', // Mobile clients use JWT tokens for authentication
];

export default withAuth(
  function middleware(req) {
    const { token } = req.nextauth;
    const { pathname } = req.nextUrl;

    // Allow public API routes without authentication
    if (publicApiRoutes.some(route => pathname.startsWith(route))) {
      const response = NextResponse.next();

      // Set CORS headers
      response.headers.set('Access-Control-Allow-Origin', '*');
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

      // Handle preflight requests
      if (req.method === 'OPTIONS') {
        return new Response(null, {
          status: 200,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          },
        });
      }

      return response;
    }

    // Add CORS headers to all API routes
    if (pathname.startsWith('/api/')) {
      const response = NextResponse.next();

      // Set CORS headers
      response.headers.set('Access-Control-Allow-Origin', '*');
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

      // Handle preflight requests
      if (req.method === 'OPTIONS') {
        return new Response(null, {
          status: 200,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          },
        });
      }

      return response;
    }

    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    const userRole = token.role as string;

    // Role-based authorization for dashboard pages
    if (pathname.startsWith("/dashboard/organization") && userRole !== "admin") {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }

    if (pathname.startsWith("/dashboard/ehr/lab") && !["admin", "doctor", "pharmacist", "nurse"].includes(userRole)) {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }

    if (pathname.startsWith("/dashboard/ehr/pharmacy") && !["admin", "doctor", "pharmacist", "nurse"].includes(userRole)) {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }

    if (pathname.startsWith("/dashboard/ehr/doctor-dashboard") && userRole !== "doctor" && userRole !== "admin") {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }

    if (pathname.startsWith("/dashboard/ehr/nurses-dashboard") && userRole !== "nurse" && userRole !== "admin") {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }

    if (pathname.startsWith("/dashboard/clinical") && !["admin", "doctor", "nurse"].includes(userRole)) {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }

    if (pathname.startsWith("/dashboard/admin") && userRole !== "admin") {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }

    // Note: Channel and DM membership checks are handled at the API route level
    // to avoid database operations in middleware which can cause performance issues

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;

        // Allow public API routes without authentication
        if (publicApiRoutes.some(route => pathname.startsWith(route))) {
          return true;
        }

        // Require authentication for all other routes
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: ["/dashboard/:path*", "/api/:path*"],
};