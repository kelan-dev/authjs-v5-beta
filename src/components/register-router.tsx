"use client";

import { useRouter } from "next/navigation";

// ################################################################################################

type RegisterRouterProps = {
  children?: React.ReactNode;
};

export default function RegisterRouter({ children }: RegisterRouterProps) {
  const router = useRouter();
  return <span onClick={() => router.push("/auth/register")}>{children}</span>;
}
