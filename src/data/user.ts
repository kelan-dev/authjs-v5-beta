import "server-only";

import prisma from "@/lib/prisma";
import { Result } from "@/lib/result";
import { User } from "@prisma/client";

// ################################################################################################
// CRUD Operations

type UserIdentifier = { id: string } | { email: string };

export async function createUser(data: {
  name: string;
  email: string;
  password: string;
}) {
  try {
    const record = await prisma.user.create({ data });

    return Result.success({ data: record });
  } catch (error) {
    return Result.error({ error: error });
  }
}

export async function getUser(identifier: UserIdentifier) {
  try {
    const record = await prisma.user.findUnique({ where: identifier });

    return Result.success({ data: record });
  } catch (error) {
    return Result.error({ error: error });
  }
}

export async function updateUser(
  identifier: UserIdentifier,
  data: Partial<User>,
) {
  try {
    const record = await prisma.user.update({
      where: identifier,
      data,
    });

    return Result.success({ data: record });
  } catch (error) {
    return Result.error({ error: error });
  }
}

export async function deleteUser(identifier: UserIdentifier) {
  try {
    await prisma.user.delete({ where: identifier });

    return Result.success();
  } catch (error) {
    return Result.error({ error: error });
  }
}

// ################################################################################################
// Utils

export async function userExists(identifier: UserIdentifier) {
  try {
    // https://github.com/prisma/prisma/issues/5022#issuecomment-1033631629
    const exists = await prisma.user
      .findUnique({ where: identifier })
      .then((r) => !!r);

    return Result.success({ data: exists });
  } catch (error) {
    return Result.error({ error: error });
  }
}
