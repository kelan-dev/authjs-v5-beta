"use server";

import { auth } from "@/auth";
import { UserRole } from "@prisma/client";

// ################################################################################################

export async function admin() {
  const session = await auth();
  const role = session?.user?.role;

  if (role === UserRole.ADMIN) {
    return { success: true };
  }

  return { success: false };
}
