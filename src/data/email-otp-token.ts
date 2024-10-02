import "server-only";

import prisma from "@/lib/prisma";
import crypto from "crypto";
import { Result } from "@/lib/result";

// ################################################################################################
// CRUD Operations

const DURATION = 5 * 60 * 1000;
const RATE_LIMIT = 1 * 60 * 1000;

type EmailOTPTokenIdentifier = { token: string } | { email: string };

export async function createEmailOTPToken(email: string) {
  try {
    const canRequest = await canRequestEmailOTPToken(email);
    if (!canRequest.success) return Result.error();
    if (!canRequest.data) return Result.error();

    // Delete all existing tokens for the given email
    await deleteEmailOTPTokens(email);

    // Create a new token
    const record = await prisma.emailOTPToken.create({
      data: {
        email,
        token: crypto.randomInt(1, 1_000_000).toString().padStart(6, "0"),
        expires: new Date(Date.now() + DURATION),
      },
    });

    return Result.success({ data: record });
  } catch (error) {
    return Result.error({ error: error });
  }
}

export async function getEmailOTPToken(identifier: EmailOTPTokenIdentifier) {
  try {
    let record;
    if ("token" in identifier) {
      record = await prisma.emailOTPToken.findUnique({
        where: { token: identifier.token },
      });
    } else {
      record = await prisma.emailOTPToken.findFirst({
        where: { email: identifier.email },
      });
    }

    return Result.success({ data: record });
  } catch (error) {
    return Result.error({ error: error });
  }
}

export async function deleteEmailOTPTokens(email: string) {
  try {
    const deleted = await prisma.emailOTPToken.deleteMany({
      where: { email },
    });

    return Result.success({ data: deleted.count });
  } catch (error) {
    return Result.error({ error: error });
  }
}

// ################################################################################################
// Utils

export async function canRequestEmailOTPToken(email: string) {
  try {
    const token = await prisma.emailOTPToken.findFirst({
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
