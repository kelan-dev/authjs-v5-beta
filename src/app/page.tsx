import { Poppins } from "next/font/google";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import LoginRouter from "@/components/login-router";
import RegisterRouter from "@/components/register-router";

// ################################################################################################

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["600"],
});

export default function HomePage() {
  return (
    <main className="flex h-screen items-center justify-center">
      <div className="space-y-6 text-center">
        <div className="inline-flex flex-col items-end">
          <h1
            className={cn(
              poppins.className,
              "text-5xl font-semibold text-slate-100 drop-shadow-md",
            )}
          >
            🔐 AuthJS-v5
          </h1>
          <p className="mr-4 text-sm italic text-slate-100">
            {`(JWT Session Strategy)`}
          </p>
        </div>
        <p className="text-lg text-slate-100">
          A project exploring authentication techniques in Next.js
        </p>
        <div className="m-auto h-[2px] w-10/12 rounded-full bg-slate-900/20" />
        <div className="space-x-4">
          <LoginRouter>
            <Button variant="secondary" size="lg" className="rounded-full">
              Sign in
            </Button>
          </LoginRouter>
          <RegisterRouter>
            <Button variant="secondary" size="lg" className="rounded-full">
              Register
            </Button>
          </RegisterRouter>
        </div>
      </div>
    </main>
  );
}
