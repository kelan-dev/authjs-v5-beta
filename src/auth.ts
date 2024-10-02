// This is the AuthJS configuration file. Here we control the behavior of the
// library and specify custom authentication logic, adapters, pages, etc.
// https://authjs.dev/getting-started/installation?framework=next.js

import NextAuth from "next-auth";
import prisma from "@/lib/prisma";
import { PrismaAdapter } from "@auth/prisma-adapter";
import type { Adapter } from "next-auth/adapters";
import { cache } from "react";
import Credentials from "next-auth/providers/credentials";
import Github from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { CredentialsSignin } from "next-auth";
import { getUser } from "@/data/user";
import { deleteEmailOTPTokens, getEmailOTPToken } from "./data/email-otp-token";
import { z } from "zod";
import { s } from "./lib/schemas";
import { getProp } from "./lib/type-utils";

// ################################################################################################

export const OAUTH_PROVIDERS = ["github", "google"];

const {
  handlers,
  signIn,
  signOut,
  auth: authjs,
  unstable_update,
} = NextAuth({
  adapter: PrismaAdapter(prisma) as Adapter,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    Github({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    }),
    Credentials({
      // Called when the user attempts to sign in via the Credentials provider
      async authorize(credentials) {
        // Validate the incoming data
        const vCredentials = s.action.login.safeParse(credentials);
        if (!vCredentials.success) throw new Error();

        const { email, password, code } = vCredentials.data;

        // Get the user from the database
        const qGetUser = await getUser({ email });
        if (!qGetUser.success) throw new Error();
        if (!qGetUser.data) throw new CredentialsSignin();

        // Validate the user data
        const vUser = s.model.user.safeParse(qGetUser.data);
        if (!vUser.success) throw new Error();

        const user = vUser.data;

        // Verify that the user has confirmed their email address
        if (!user.emailVerified) throw new EmailVerificationRequired();

        // Verify that the provided password matches the user's hashed password
        const match = await bcrypt.compare(password, user.password ?? "");
        if (!match) throw new CredentialsSignin();

        // If two-factor is not enabled, then the user is now authenticated
        if (!user.isTwoFactorEnabled) return user;

        // Verify that the user has provided an authentication code
        if (!code) throw new TwoFactorCodeRequired();

        // ⚠ NOTE: FOR DEMO PURPOSES ONLY, allow any code to pass for the test account
        if (email === "test@test.com") {
          await deleteEmailOTPTokens(email);
          return user;
        }

        // Get the token from the database
        const qGetToken = await getEmailOTPToken({ email });
        if (!qGetToken.success) throw new Error();
        if (!qGetToken.data) throw new InvalidAuthenticationCode();

        // Verify that the code has not expired
        const expiration = getProp(qGetToken.data, "expires", z.date());
        if (!expiration) throw new Error();
        if (new Date() > expiration) throw new InvalidAuthenticationCode();

        // Verify that the provided code matches the token
        const token = getProp(qGetToken.data, "token", z.string());
        if (!token) throw new Error();
        if (code !== token) throw new InvalidAuthenticationCode();

        // Remove the token from the database
        await deleteEmailOTPTokens(email);

        // The user has provided valid credentials and code, so they are now authenticated
        return user;
      },
    }),
  ],
  callbacks: {
    // Called when the user attempts to sign in
    async signIn({ user, account, profile, email, credentials }) {
      return true;
    },
    // Called when a JWT is created or updated
    async jwt({ token, user, account, profile, trigger, session }) {
      // User, Account, and Profile are defined when the user is signing in
      if (user) {
        token.isTwoFactorEnabled = user.isTwoFactorEnabled;
        token.role = user.role;
      }
      if (account) {
        token.provider = account.provider;
        token.isOAuth = OAUTH_PROVIDERS.includes(account.provider);
      }

      // Trigger and Session are defined when the session is being updated
      if (trigger === "update" && session?.user) {
        const vUser = s.action.updateUserSettings.safeParse(session.user);
        if (vUser.success) {
          Object.assign(token, vUser.data);
        } else {
          console.error("Invalid session update", vUser.error);
          throw new Error("Invalid session settings");
        }
      }

      return token;
    },
    // Called when the session is checked (useSession(), auth(), etc).
    // ⚠ NOTE: Anything returned in the session is available to the client in unencrypted form.
    async session({ session, token, user }) {
      if (session.user && token) {
        session.user.id = token.sub ?? "";
        session.user.isTwoFactorEnabled = token.isTwoFactorEnabled;
        session.user.role = token.role;
        session.user.provider = token.provider;
        session.user.isOAuth = token.isOAuth;
      }
      return session;
    },
  },
  // Asynchronous functions that are useful for logging or effects.
  events: {
    // Called when the user creates or links an account via an OAuth provider.
    async linkAccount({ user, account, profile }) {
      try {
        await prisma.user.update({
          where: { id: user.id },
          data: { emailVerified: new Date() },
        });
      } catch (error) {
        console.error("Error updating user after account link", error);
      }
    },
  },
});

// ################################################################################################

class EmailVerificationRequired extends Error {
  static type = "EmailVerificationRequired";
  code: string = "emailVerificationRequired";
}

class TwoFactorCodeRequired extends Error {
  static type = "TwoFactorCodeRequired";
  code: string = "twoFactorCodeRequired";
}

class InvalidAuthenticationCode extends Error {
  static type = "InvalidAuthenticationCode";
  code: string = "invalidAuthenticationCode";
}

// ################################################################################################

// Cache the auth function so that we only have to retrieve the session once per request
export const auth = cache(authjs);

export { handlers, signIn, signOut, unstable_update };
