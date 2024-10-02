"use server";

import * as z from "zod";
import {
  deleteEmailVerificationTokens,
  getEmailVerificationToken,
} from "@/data/email-verification-token";
import { s } from "@/lib/schemas";
import { updateUser } from "@/data/user";
import { Result } from "@/lib/result";

// ################################################################################################

const tokenSchema = z.string().uuid();

/**
 * Verify a new user's email address with the provided token.
 */
export async function verifyEmailToken(data: z.infer<typeof tokenSchema>) {
  // Validate the incoming data
  const validated = tokenSchema.safeParse(data);
  if (!validated.success) return Result.error();

  const tokenParam = validated.data;

  // Verify that the token exists in the database
  const validToken = await getEmailVerificationToken({ token: tokenParam });
  if (!validToken.success) return Result.error();
  if (!validToken.data) return Result.error({ message: "Invalid token." });

  // Parse the token data so that we can access its fields
  const parsed = s.model.token.safeParse(validToken.data);
  if (!parsed.success) return Result.error({ message: "Invalid token." });

  const { email, expires } = parsed.data;

  // Verify that the token has not expired
  const expired = new Date() > expires;
  if (expired) return Result.error({ message: "Token has expired." });

  // Update the user's emailVerified field
  const updated = await updateUser({ email }, { emailVerified: new Date() });
  if (!updated.success) return Result.error();
  if (!updated.data)
    return Result.error({ message: "Failed to verify email." });

  // Delete the verification token
  await deleteEmailVerificationTokens(email);

  return Result.success({
    message:
      "Your email has been verified! Click the link below to log in and get started.",
  });
}
