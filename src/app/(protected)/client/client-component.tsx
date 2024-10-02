"use client";

import { Session } from "next-auth";
import UserInfo from "../user-info";
import React from "react";

// ################################################################################################

type ClientComponentProps = {
  session: Session;
};

export default function ClientComponent({ session }: ClientComponentProps) {
  // To get the session from a client component, we use the useSession hook.
  // ⚠ Note: To get the session outside the context of React, use the getSession function.
  // ⚠ Note: Currently not working correctly with Credentials provider.
  // const session = useSession();
  // const user = session.data?.user;
  // if (!user) return null;

  return (
    <UserInfo
      user={session.user}
      label="📱 Client Component"
      description="In a client component, we can access the session data using the useSession() hook"
    />
  );
}
