import React from "react";
import NavBar from "./navbar";

// ################################################################################################

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mt-8 flex flex-col items-center p-4">
      <NavBar />
      <main className="mt-4 w-full max-w-[450px]">{children}</main>
    </div>
  );
}
