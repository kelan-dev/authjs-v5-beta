"use client";

import { Card, CardFooter, CardHeader } from "@/components/ui/card";
import LinkRouter from "@/components/link-router";
import Header from "@/app/auth/header";

// ################################################################################################

export default function ErrorPage() {
  return (
    <main className="flex h-screen items-center justify-center">
      <Card className="w-[400px] shadow-md">
        <CardHeader>
          <Header label="Oops! Something went wrong. :(" />
        </CardHeader>
        <CardFooter>
          <LinkRouter href="/" label="Go back" />
        </CardFooter>
      </Card>
    </main>
  );
}
