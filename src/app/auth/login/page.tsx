import { Suspense } from "react";
import LoginCard from "./login-card";
import { Spinner } from "@/components/spinner";

// ################################################################################################

export default function LoginPage() {
  return (
    <main className="flex h-screen items-center justify-center">
      <Suspense fallback={<Spinner />}>
        <LoginCard />
      </Suspense>
    </main>
  );
}
