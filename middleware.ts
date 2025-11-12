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

    if (pathname.startsWith("/dashboard/organization") && userRole !== "admin") {
      return new NextResponse("You are not authorized to access this page.", { status: 403 });
    }

    if (pathname.startsWith("/dashboard/clinical") && !["admin", "doctor"].includes(userRole)) {
      return new NextResponse("You are not authorized to access this page.", { status: 403 });
    }

    if (pathname.startsWith("/dashboard/admin") && userRole !== "admin") {
      return new NextResponse("You are not authorized to access this page.", { status: 403 });
    }

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