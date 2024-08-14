// export {default} from "next-auth/middleware";
// //[array of protected routes]
// export const config = {matcher: ["/feed"] };

import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

export async function middleware(req) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const url = req.nextUrl.clone();

  if (!token) {
    // Redirect to sign-in page if not authenticated
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  if (url.pathname.startsWith("/admin")) {
    // Redirect to home page if the user is not an admin
    if (!token.isAdmin) {
      url.pathname = "/";
      return NextResponse.redirect(url);
    }
  }

  // Allow access if authenticated and authorized
  return NextResponse.next();
}

export const config = {
  matcher: ["/feed", "/admin/:path*"],
};
