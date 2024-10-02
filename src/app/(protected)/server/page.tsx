import UserInfo from "@/app/(protected)/user-info";
import { auth } from "@/auth";
import React from "react";

// ################################################################################################

export default async function ServerPage() {
  // To get the session from a server component, we use the auth function.
  const session = await auth();
  const user = session?.user;
  if (!user) return null;

  return (
    <UserInfo
      user={user}
      label="💻 Server Component"
      description="In a server component, we can access the session data using the auth() function"
    />
  );
}
