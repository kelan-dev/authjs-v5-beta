import UserButton from "@/app/(protected)/user-button";
import React from "react";
import NavButtons from "./nav-buttons";
import { auth } from "@/auth";

// ################################################################################################

export default async function NavBar() {
  const session = await auth();

  return (
    <nav className="flex w-full max-w-[600px] items-center justify-between gap-2 rounded-xl bg-secondary p-4 shadow-sm">
      <NavButtons />

      <UserButton session={session} />
    </nav>
  );
}
