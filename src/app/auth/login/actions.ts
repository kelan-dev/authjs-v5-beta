"use server";

import { signIn } from "@/auth";
import { ACTIVE_SESSION_REDIRECT } from "@/routes";
import { s, TActionLogin, TActionSendToken } from "@/lib/schemas";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { Result } from "@/lib/result";
import { z } from "zod";
import { getProp } from "@/lib/type-utils";
import { userExists } from "@/data/user";
import {
  canRequestEmailOTPToken,
  createEmailOTPToken,
} from "@/data/email-otp-token";
import resend from "@/lib/resend";

// ################################################################################################

/**
 * Log into the application with the Credentials provider
 */
export async function login(data: TActionLogin): Promise<Result> {
  // Validate the incoming data
  const validated = s.action.login.safeParse(data);
  if (!validated.success) return Result.error();

  const { email, password, code } = validated.data;

  // Try to sign the user into the application
  try {
    await signIn("credentials", {
      email,
      password,
      code,
      redirectTo: ACTIVE_SESSION_REDIRECT,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      if (error.type === "CredentialsSignin") {
        return Result.error({
          message: "Incorrect user name or password. Please try again.",
        });
      }

      if (error.type === "CallbackRouteError") {
        // https://github.com/nextauthjs/next-auth/issues/9900#issuecomment-2228807677
        const code = getProp(error, "cause.err.code", z.string());
        switch (code) {
          case "emailVerificationRequired":
            redirect(`/auth/verify-email?email=${encodeURIComponent(email)}`);
          case "twoFactorCodeRequired":
            sendEmailOTPToken(email);
            return Result.error({
              error: { showOTP: true },
            });
          case "invalidAuthenticationCode":
            return Result.error({
              message: "Invalid authentication code. Please try again.",
            });
          default:
            return Result.error({
              message:
                "Something went wrong during sign-in. Please try again later.",
            });
        }
      }

      return Result.error({
        message: "Something went wrong during sign-in. Please try again later.",
      });
    }
    // NextJS redirects by throwing an error.  Since we're catching it here,
    // we need to rethrow it in order to continue the redirect.
    throw error;
  }

  return Result.success();
}

// ################################################################################################

/**
 * Send an email containing a one-time password (OTP) to the user.
 */
export async function sendEmailOTPToken(
  data: TActionSendToken,
): Promise<Result> {
  // Validate the incoming data
  const validated = s.action.sendToken.safeParse(data);
  if (!validated.success) return Result.error();

  const email = validated.data;

  // Verify that the email address exists in the database
  const exists = await userExists({ email });
  if (!exists.success) return Result.error();
  if (!exists.data)
    return Result.error({
      message: "An account with this email address does not exist.",
    });

  // Verify that the user is permitted to request a new token
  const canRequest = await canRequestEmailOTPToken(email);
  if (!canRequest.success) return Result.error();
  if (!canRequest.data)
    return Result.error({
      message:
        "You can't request a new authentication code until 60 seconds have passed.",
    });

  // Try to create a new OTP token
  const create = await createEmailOTPToken(email);
  if (!create.success) return Result.error();

  // Get the new token value from the response data
  const token = getProp(create.data, "token", z.string());
  if (!token)
    return Result.error({
      message:
        "An authentication code could not be created. Please try again later.",
    });

  // Try to send the authentication code via email
  const sent = await emailOTPToken(email, token);
  if (!sent.success)
    return Result.error({
      message:
        "There was a problem sending your authentication code. Please try again later.",
    });

  return Result.success({
    message:
      "We just sent you a new authentication code. Please check your email!",
  });
}

// ################################################################################################

async function emailOTPToken(email: string, code: string) {
  // ⚠ NOTE: FOR DEMO PURPOSES ONLY, skip the email for the test account
  if (email === "test@test.com") {
    return Result.success();
  }

  try {
    const response = await resend.emails.send({
      from: "onboarding@resend.dev",
      to: email,
      subject: "OTP Code",
      html: `Your OTP code is ${code}. This code will expire in 5 minutes.`,
    });
    return Result.success({ data: response });
  } catch (error) {
    return Result.error({ error: error });
  }
}
