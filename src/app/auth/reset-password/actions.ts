"use server";

import { s, TFormEmail, TFormCreatePassword } from "@/lib/schemas";
import { Result } from "@/lib/result";
import { getUser, updateUser } from "@/data/user";
import {
  canRequestPasswordResetToken,
  createPasswordResetToken,
  deletePasswordResetTokens,
  getPasswordResetToken,
} from "@/data/password-reset-token";
import { z } from "zod";
import { getProp } from "@/lib/type-utils";
import resend from "@/lib/resend";
import bcrypt from "bcryptjs";

// ################################################################################################

/**
 * Request a password reset token for a user's account.
 */
export async function requestPasswordReset(values: TFormEmail) {
  // Validate the incoming data
  const validated = s.form.email.safeParse(values);
  if (!validated.success) return Result.error();

  const { email } = validated.data;

  // Get the user from the database
  const user = await getUser({ email });
  if (!user.success) return Result.error();
  if (!user.data)
    return Result.error({
      message: "An account with this email address does not exist.",
    });

  // Parse the user data so that we can access its fields
  const parsedUser = s.model.user.safeParse(user.data);
  if (!parsedUser.success) return Result.error({ message: "Invalid user." });

  const { password } = parsedUser.data;

  // OAuth users cannot reset their password
  if (!password)
    return Result.error({
      message: "You cannot reset the password for an OAuth account.",
    });

  // Verify that the user is permitted to request a new token
  const canRequest = await canRequestPasswordResetToken(email);
  if (!canRequest.success) return Result.error();
  if (!canRequest.data)
    return Result.error({
      message:
        "You can't request a new verification link until 5 minutes have passed.",
    });

  // Try to create a new password reset token
  const created = await createPasswordResetToken(email);
  if (!created.success) return Result.error();

  // Get the token value from the response data
  const token = getProp(created.data, "token", z.string().uuid());
  if (!token)
    return Result.error({
      message:
        "A verification link could not be created. Please try again later.",
    });

  // Try to send the password reset token via email
  const sent = await emailToken(email, token);
  if (!sent.success)
    return Result.error({
      message:
        "There was a problem sending your verification email. Please try again later.",
    });

  return Result.success({
    message: "We just sent you a password reset link. Please check your email!",
  });
}

// ################################################################################################

async function emailToken(email: string, token: string) {
  // ⚠ NOTE: FOR DEMO PURPOSES ONLY, skip the email for the test account
  if (email === "test@test.com") {
    return Result.success();
  }

  const appUrl = process.env.APP_URL;
  const verificationLink = `${appUrl}/auth/reset-password?token=${token}`;
  try {
    await resend.emails.send({
      from: "noreply@resend.dev",
      to: email,
      subject: "Reset your password",
      html: `A password reset link has been requested for your account. Click <a href="${verificationLink}">here</a> to reset your password. If you did not request this, please ignore this email.`,
    });
    return Result.success();
  } catch (error) {
    return Result.error({ error: error });
  }
}

// ################################################################################################

const tokenSchema = z.string().uuid();

/**
 * Set a new password for a user's account.
 */
export async function createNewPassword(
  values: TFormCreatePassword,
  token: string,
) {
  // Validate the incoming data
  const validated = s.form.createPassword.safeParse(values);
  if (!validated.success) return Result.error();

  const validatedToken = tokenSchema.safeParse(token);
  if (!validatedToken.success) return Result.error();

  const { newPassword, confirmNewPassword } = validated.data;
  const tokenParam = validatedToken.data;

  // Verify that the token exists in the database
  const validToken = await getPasswordResetToken({ token: tokenParam });
  if (!validToken.success) return Result.error();
  if (!validToken.data) return Result.error({ message: "Invalid token." });

  // Parse the token data so that we can access its fields
  const parsed = s.model.token.safeParse(validToken.data);
  if (!parsed.success) return Result.error({ message: "Invalid token." });

  const { email, expires } = parsed.data;

  // Verify that the token has not expired
  const expired = new Date() > expires;
  if (expired) return Result.error({ message: "Token has expired." });

  // Get the user from the database
  const user = await getUser({ email });
  if (!user.success) return Result.error();
  if (!user.data) return Result.error({ message: "User not found." });

  // Parse the user data so that we can access its fields
  const parsedUser = s.model.user.safeParse(user.data);
  if (!parsedUser.success) return Result.error({ message: "Invalid user." });

  const { id, password } = parsedUser.data;

  // OAuth users cannot reset their password
  if (!password)
    return Result.error({
      message: "You cannot reset the password for an OAuth account.",
    });

  const hashedPassword = await bcrypt.hash(newPassword, 14);

  // Update the user's password
  const updated = await updateUser({ id }, { password: hashedPassword });
  if (!updated.success) return Result.error();
  if (!updated.data)
    return Result.error({ message: "Failed to update password." });

  // Delete the password reset token
  await deletePasswordResetTokens(email);

  return Result.success({
    message: "Your password has been updated!",
  });
}
