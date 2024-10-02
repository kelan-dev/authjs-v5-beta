import { UserRole } from "@prisma/client";
import React from "react";
import FormError from "./form-error";
import { auth } from "@/auth";

// ################################################################################################

type RoleGateProps = {
  children: React.ReactNode;
  allowedRole: UserRole;
};

export default async function RoleGate({
  children,
  allowedRole,
}: RoleGateProps) {
  const session = await auth();

  if (!session) {
    return (
      <FormError message="You must be signed in to access this content." />
    );
  }

  if (session.user.role !== allowedRole) {
    return (
      <FormError message="You're not authorized to access this content." />
    );
  }

  return <>{children}</>;
}
