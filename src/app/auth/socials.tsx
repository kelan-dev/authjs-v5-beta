"use client";

import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { ACTIVE_SESSION_REDIRECT } from "@/routes";

// To use signIn from a client component, we need to import from "next-auth/react"
import { signIn } from "next-auth/react";

// ################################################################################################

// We can use this component in both the login and register forms. The OAuth
// provider will take the necessary steps to authenticate or register the user.
export default function Socials() {
  function onClick(provider: "google" | "github") {
    signIn(provider, {
      callbackUrl: ACTIVE_SESSION_REDIRECT,
    });
  }

  return (
    <div className="flex w-full items-center gap-2">
      <Button
        variant="outline"
        size="lg"
        className="w-full rounded-full"
        onClick={() => onClick("google")}
      >
        <FcGoogle className="h-5 w-5" />
      </Button>

      <Button
        variant="outline"
        size="lg"
        className="w-full rounded-full"
        onClick={() => onClick("github")}
      >
        <FaGithub className="h-5 w-5" />
      </Button>
    </div>
  );
}
