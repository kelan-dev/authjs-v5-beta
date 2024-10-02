// The purpose of this declaration file is to extend the types/interfaces of AuthJS.
// AuthJS has three main interfaces to work with: User, Session, and JWT.

import NextAuth, { type DefaultSession } from "next-auth";
import { JWT } from "next-auth/jwt";
import { UserRole } from "@prisma/client";

// Extend the JWT Token type
declare module "next-auth/jwt" {
  interface JWT {
    provider?: string;
    isOAuth?: boolean;
    isTwoFactorEnabled?: boolean;
    role?: UserRole;
  }
}

// Extend the User and Session types
declare module "next-auth" {
  interface User {
    id?: string;
    provider?: string;
    isOAuth?: boolean;
    isTwoFactorEnabled?: boolean;
    role?: UserRole;
    emailVerified?: Date | null;
  }
  interface Session {
    user: DefaultSession["user"] & {
      role?: UserRole;
    };
  }
}
