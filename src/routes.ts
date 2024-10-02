export const API_PREFIX = "/api";
export const API_AUTH_PREFIX = `/api/auth`;

export const AUTH_ROUTES = [
  `/auth/error`,
  `/auth/login`,
  `/auth/register`,
  `/auth/reset-password`,
];

export const PUBLIC_ROUTES = ["/", `/auth/new-password`, `/auth/verify-email`];

export const ACTIVE_SESSION_REDIRECT = "/settings";
