"use server";

import bcrypt from "bcryptjs";
import { createUser, userExists } from "@/data/user";
import { Result } from "@/lib/result";
import { s, TActionSendToken, TFormRegister } from "@/lib/schemas";
import { getProp } from "@/lib/type-utils";
import { z } from "zod";
import {
  canRequestEmailVerificationToken,
  createEmailVerificationToken,
} from "@/data/email-verification-token";
import resend from "@/lib/resend";

// ################################################################################################

/**
 * Create a new user account for use with the Credentials provider.
 */
export async function register(data: TFormRegister): Promise<Result> {
  // Validate the incoming data
  const validated = s.form.register.safeParse(data);
  if (!validated.success) return Result.error();

  const { name, email, newPassword } = validated.data;

  // Verify the email address is not already in use
  const exists = await userExists({ email });
  if (!exists.success) return Result.error();
  if (exists.data)
    return Result.error({
      message: "An account with this email address already exists.",
    });

  // Hash the password.  Be sure to use a sufficient work factor.
  // To learn more about bcrypt, here's a starting point:
  // https://stackoverflow.com/questions/13023361/
  // https://stackoverflow.com/questions/6832445/
  // https://github.com/strapi/strapi/issues/10802
  const startTime = Date.now();
  const hashedPassword = await bcrypt.hash(newPassword, 14);
  const endTime = Date.now();
  console.log(`hash time: ${endTime - startTime} ms`);

  // Try to create the new user in the database
  const created = await createUser({ name, email, password: hashedPassword });
  if (!created.success)
    return Result.error({
      message:
        "There was a problem creating your account. Please try again later, or contact support.",
    });

  // Try to generate an email verification token and send it to the user
  const sent = await sendEmailVerificationToken(email);
  if (!sent.success) {
    return Result.error({
      message:
        "Your account was successfully created, but there was a problem sending your verification email. Please try again later by logging into your account, or contact support.",
    });
  }

  return Result.success({
    message:
      "Thanks for signing up! Please check your email for a link to verify your account.",
  });
}

// ################################################################################################

/**
 * Generate and send an email verification token that can verify a new user's email address.
 */
export async function sendEmailVerificationToken(
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
  const canRequest = await canRequestEmailVerificationToken(email);
  if (!canRequest.success) return Result.error();
  if (!canRequest.data)
    return Result.error({
      message:
        "You can't request a new verification link until 5 minutes have passed.",
    });

  // Try to create a new email verification token
  const created = await createEmailVerificationToken(email);
  if (!created.success) return Result.error();

  // Get the token value from the response data
  const token = getProp(created.data, "token", z.string().uuid());
  if (!token)
    return Result.error({
      message:
        "A verification link could not be created. Please try again later.",
    });

  // Try to send the email verification token via email
  const sent = await emailToken(email, token);
  if (!sent.success)
    return Result.error({
      message:
        "There was a problem sending your verification email. Please try again later.",
    });

  return Result.success({
    message: "We just sent you a verification link. Please check your email!",
  });
}

// ################################################################################################

/**
 * Send an email containing a link to verify a user's email address.
 */
async function emailToken(email: string, token: string) {
  // ⚠ NOTE: FOR DEMO PURPOSES ONLY, skip the email for the test account
  if (email === "test@test.com") {
    return Result.success();
  }

  const appUrl = process.env.APP_URL;
  const verificationLink = `${appUrl}/auth/verify-email?token=${token}`;
  try {
    const response = await resend.emails.send({
      from: "onboarding@resend.dev",
      to: email,
      subject: "Verify your account",
      html: `Thanks for signing up to the AuthJS v5 Demo! Click <a href="${verificationLink}">here</a> to verify your account. If you have any problems, please reach out to us!`,
    });
    return Result.success({ data: response });
  } catch (error) {
    return Result.error({ error: error });
  }
}
