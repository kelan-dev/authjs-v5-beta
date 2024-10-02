"use client";

import { useRouter } from "next/navigation";

// ################################################################################################

type LoginRouterProps = {
  children?: React.ReactNode;
};

export default function LoginRouter({ children }: LoginRouterProps) {
  const router = useRouter();
  return <span onClick={() => router.push("/auth/login")}>{children}</span>;
}
