import ResetPasswordCard from "./reset-password-card";
import React from "react";
import { Suspense } from "react";
import { Spinner } from "@/components/spinner";

// ################################################################################################

export default function NewPasswordPage() {
  return (
    <main className="flex h-screen items-center justify-center">
      <Suspense fallback={<Spinner />}>
        <ResetPasswordCard />
      </Suspense>
    </main>
  );
}
