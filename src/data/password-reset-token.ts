import "server-only";

import prisma from "@/lib/prisma";
import crypto from "crypto";
import { Result } from "@/lib/result";

// ################################################################################################
// CRUD Operations

const DURATION = 5 * 60 * 1000;
const RATE_LIMIT = 1 * 60 * 1000;

type PasswordResetTokenIdentifier = { token: string };

export async function createPasswordResetToken(email: string) {
  try {
    const canRequest = await canRequestPasswordResetToken(email);
    if (!canRequest.success) return Result.error();
    if (!canRequest.data) return Result.error();

    // Delete all existing tokens for the given email
    await deletePasswordResetTokens(email);

    // Create a new token
    const record = await prisma.passwordResetToken.create({
      data: {
        email,
        token: crypto.randomUUID(),
        expires: new Date(Date.now() + DURATION),
      },
    });

    return Result.success({ data: record });
  } catch (error) {
    return Result.error({ error: error });
  }
}

export async function getPasswordResetToken(
  identifier: PasswordResetTokenIdentifier,
) {
  try {
    const record = await prisma.passwordResetToken.findUnique({
      where: identifier,
    });

    return Result.success({ data: record });
  } catch (error) {
    return Result.error({ error: error });
  }
}

export async function deletePasswordResetTokens(email: string) {
  try {
    const deleted = await prisma.passwordResetToken.deleteMany({
      where: { email },
    });

    return Result.success({ data: deleted.count });
  } catch (error) {
    return Result.error({ error: error });
  }
}

// ################################################################################################
// Utils

export async function canRequestPasswordResetToken(email: string) {
  try {
    const token = await prisma.passwordResetToken.findFirst({
      where: { email },
      orderBy: { createdAt: "desc" },
    });

    // If a token doesn't exist, then allow the request
    if (!token) return Result.success({ data: true });

    // If 1 minute has passed since the last request, then allow the request
    // TODO: Implement a better rate limiting mechanism
    const nextRequest = new Date(token.createdAt).getTime() + RATE_LIMIT;
    if (new Date() > new Date(nextRequest))
      return Result.success({ data: true });

    return Result.success({ data: false });
  } catch (error) {
    return Result.error({ error: error });
  }
}
