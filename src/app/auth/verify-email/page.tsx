import { Suspense } from "react";
import VerificationCard from "@/app/auth/verify-email/verification-card";
import { Spinner } from "@/components/spinner";

// ################################################################################################

export default function VerifyPage() {
  return (
    <main className="flex h-screen items-center justify-center">
      <Suspense fallback={<Spinner />}>
        <VerificationCard />
      </Suspense>
    </main>
  );
}
