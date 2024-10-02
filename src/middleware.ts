// Middleware runs on the Edge network. Here we are using it to quickly check
// if a user is logged in and route them accordingly.
// https://nextjs.org/docs/app/building-your-application/routing/middleware
// https://authjs.dev/getting-started/session-management/protecting#nextjs-middleware

import {
  ACTIVE_SESSION_REDIRECT,
  PUBLIC_ROUTES,
  AUTH_ROUTES,
  API_AUTH_PREFIX,
  API_PREFIX,
} from "@/routes";
import NextAuth, { NextAuthConfig } from "next-auth";

// ################################################################################################

const authConfig = {
  providers: [],
} satisfies NextAuthConfig;

const { auth } = NextAuth(authConfig);

export default auth((request) => {
  const pathname = request.nextUrl.pathname;

  // The user is logged in if a valid session is present in the request
  const isLoggedIn = !!request.auth;

  // Handle API routes
  if (pathname.startsWith(API_PREFIX)) {
    if (pathname.startsWith(API_AUTH_PREFIX)) return;
    return; // Add logic for other API routes if needed
  }

  // Handle public routes
  if (PUBLIC_ROUTES.includes(pathname)) return;

  // Handle auth routes
  if (AUTH_ROUTES.includes(pathname)) {
    if (!isLoggedIn) return;
    return Response.redirect(new URL(ACTIVE_SESSION_REDIRECT, request.nextUrl));
  }

  // Handle protected routes
  if (!isLoggedIn) {
    return Response.redirect(new URL("/auth/login", request.nextUrl));
  }
});

// Middleware will be invoked on all routes defined by this matcher
export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
