"use client";

import { logout } from "@/app/auth/actions";

// ################################################################################################

export default function LogoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <span onClick={() => logout()} className="cursor-pointer">
      {children}
    </span>
  );
}
