import React from "react";
import ClientComponent from "./client-component";
import { auth } from "@/auth";

// ################################################################################################

export default async function ClientPage() {
  // Issue with useSession hook when using the Credentials provider:
  // https://github.com/nextauthjs/next-auth/issues/9504
  // Because of this, I'm just going to pass the session down to the client component until fixed.
  const session = await auth();
  if (!session) return null;

  return <ClientComponent session={session} />;
}
