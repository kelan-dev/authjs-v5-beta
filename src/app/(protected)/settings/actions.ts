"use server";

import { Result } from "@/lib/result";
import { updateUser } from "@/data/user";
import { s, TFormSettings } from "@/lib/schemas";
import { User } from "@prisma/client";
import bcrypt from "bcryptjs";
import { auth, unstable_update } from "@/auth";

// ################################################################################################

/**
 * Update the user's settings.
 */
export async function updateSettings(values: TFormSettings): Promise<Result> {
  // Validate the incoming data
  const validated = s.form.settings.safeParse(values);
  if (!validated.success) return Result.error();

  const form = validated.data;

  // Get the current user from the session
  const session = await auth();
  if (!session) return Result.error();
  const authUser = session.user;
  if (!authUser || !authUser.id) return Result.error();

  // OAuth users should not be able to change these fields
  if (authUser.isOAuth) {
    form.email = undefined;
    form.newPassword = undefined;
    form.confirmNewPassword = undefined;
    form.isTwoFactorEnabled = undefined;
  }

  // Build the data object to update the user
  // ⚠ NOTE: This is a bit of a hack. In a real application, this process would be more involved.
  // For example, to change the user's email, we would want to generate a unique token and send
  // a verification email to the new address, and build a new route to handle the change request.
  const dbUpdate: Partial<User> = {};

  if (form.role) dbUpdate.role = form.role;
  if (form.name) dbUpdate.name = form.name;
  if (form.email) dbUpdate.email = form.email;
  if (form.newPassword && form.confirmNewPassword) {
    dbUpdate.password = await bcrypt.hash(form.newPassword, 14);
  }
  if (form.isTwoFactorEnabled !== undefined) {
    dbUpdate.isTwoFactorEnabled = form.isTwoFactorEnabled;
  }

  // Update the user in the database
  const query = await updateUser({ id: authUser.id }, dbUpdate);
  if (!query.success) return Result.error();

  // Update the session with all changed fields (excluding password)
  const { password, ...sessionUpdate } = dbUpdate;
  if (Object.keys(sessionUpdate).length > 0) {
    await unstable_update({
      user: sessionUpdate,
    });
  }

  return Result.success({
    message: "Your settings have been successfully updated.",
  });
}
