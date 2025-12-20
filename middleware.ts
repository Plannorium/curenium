import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { token } = req.nextauth;
    const { pathname } = req.nextUrl;

    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    const userRole = token.role as string;

    // Role-based authorization for dashboard pages
    if (pathname.startsWith("/dashboard/organization") && userRole !== "admin") {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }

    if (pathname.startsWith("/dashboard/ehr/lab") && !["admin", "doctor", "labtech", "nurse"].includes(userRole)) {
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

    if (pathname.startsWith("/dashboard/clinical") && !["admin", "doctor", "nurse", "labtech", "pharmacist"].includes(userRole)) {
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
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: ["/dashboard/:path*"],
};