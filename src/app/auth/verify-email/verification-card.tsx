"use client";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import Header from "@/app/auth/header";
import LinkRouter from "@/components/link-router";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import FormError from "@/components/form-error";
import FormSuccess from "@/components/form-success";
import { Result } from "@/lib/result";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { s, TFormVerifyEmail } from "@/lib/schemas";
import { sendEmailVerificationToken } from "../register/actions";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { verifyEmailToken } from "./actions";
import { Spinner } from "@/components/spinner";

// ################################################################################################

export default function VerificationCard() {
  const router = useRouter();
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  // Used to prevent the effect from running twice during development (StrictMode)
  const effectRan = useRef(false);

  useEffect(() => {
    if (effectRan.current) return;
    if (!token && !email) return;

    (async () => {
      // If the email param is present, then try sending a new token
      if (email) {
        const response = await sendEmailVerificationToken(email);
        displayResponse(response);
        return;
      }

      // If the token param is present, then try verifying the token
      if (token) {
        const response = await verifyEmailToken(token);
        if (response.success) router.push("/auth/login?emailVerified=true");
      }
    })();

    return () => {
      effectRan.current = true;
    };
  }, [token, email, router]);

  function handleFormSubmit(result: Result) {
    displayResponse(result);
  }

  function displayResponse(result: Result) {
    setSuccess("");
    setError("");

    result.success
      ? setSuccess(result.message || "")
      : setError(result.message || "");
  }

  return (
    <Card className="w-[400px] shadow-md">
      <CardHeader>
        <Header label="Email verification" />
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center space-y-4">
        {!error && !success && (token || email) && <Spinner />}
        <FormError message={error} />
        <FormSuccess message={success} />
        {(error || (!token && !email)) && (
          <VerificationForm onFormSubmit={handleFormSubmit} />
        )}
      </CardContent>
      <CardFooter>
        <LinkRouter href="/auth/login" label="Back to login" />
      </CardFooter>
    </Card>
  );
}

// ################################################################################################

type VerificationFormProps = {
  onFormSubmit?: (result: Result) => void;
};

function VerificationForm({ onFormSubmit }: VerificationFormProps) {
  const [pending, startTransition] = useTransition();

  // RHF will manage the form in conjunction with ShadCN's Form wrapper component
  const form = useForm<TFormVerifyEmail>({
    resolver: zodResolver(s.form.verifyEmail),
    defaultValues: {
      email: "",
    },
  });

  // On form submission, try to send the user a new email verification token
  function onSubmit(values: TFormVerifyEmail) {
    startTransition(async () => {
      const response = await sendEmailVerificationToken(values.email);
      onFormSubmit?.(response);
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => {
            return (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="email"
                    placeholder="john.doe@example.com"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            );
          }}
        />
        <Button
          type="submit"
          className="w-full rounded-full"
          disabled={pending}
        >
          Resend
        </Button>
      </form>
    </Form>
  );
}
