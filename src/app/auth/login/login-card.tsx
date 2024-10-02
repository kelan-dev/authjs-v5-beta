"use client";

import LinkRouter from "@/components/link-router";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import Header from "@/app/auth/header";
import { useEffect, useState, useTransition } from "react";
import { s, TFormLogin } from "@/lib/schemas";
import { login, sendEmailOTPToken } from "./actions";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon } from "@radix-ui/react-icons";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm, UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import FormSuccess from "@/components/form-success";
import Socials from "../socials";
import { getProp } from "@/lib/type-utils";
import { z } from "zod";
import { Spinner } from "@/components/spinner";
import { useSearchParams } from "next/navigation";
import { toast } from "react-toastify";

// ################################################################################################

export default function LoginCard() {
  const [isPending, startTransition] = useTransition();
  const [showOTP, setShowOTP] = useState(false);

  const searchParams = useSearchParams();
  const emailVerified = searchParams.get("emailVerified");

  const form = useForm<TFormLogin>({
    resolver: zodResolver(s.form.login),
    defaultValues: {
      email: "",
      password: "",
      code: "",
    },
  });

  // On form submission, try to sign the user into the application
  function onSubmit(values: TFormLogin) {
    startTransition(async () => {
      const result = await login({ ...values });
      if (result.success) return;

      // Transition to the OTP input if required
      const show = getProp(result.error, "showOTP", z.boolean());
      if (show) {
        setShowOTP(show);
        return;
      }

      toast.error(result.message);
    });
  }

  // On Resend click, try to email the user a new authentication code
  function handleResendClick() {
    startTransition(async () => {
      const response = await sendEmailOTPToken(form.getValues().email);
      if (response.success) {
        toast.success(response.message);
        return;
      }

      toast.error(response.message);
    });
  }

  // On Back click, return to the credentials form
  function handleBackClick() {
    setShowOTP(false);
    form.resetField("code");
  }

  // When we switch between Credentials or OTP elements, we should set the focus
  useEffect(() => {
    if (showOTP) {
      setTimeout(() => {
        form.setFocus("code", { shouldSelect: true });
      }, 100);
    }
    if (!showOTP) {
      setTimeout(() => {
        form.setFocus("email", { shouldSelect: true });
      }, 100);
    }
  }, [showOTP, form]);

  return (
    <Card className="relative w-[400px] shadow-md">
      <CardHeader>
        <Header label="Welcome back!" />
      </CardHeader>
      <CardContent className="space-y-4">
        {emailVerified && (
          <FormSuccess message="Your email address was verified successfully! Sign in below to continue." />
        )}
        <LoginForm
          form={form}
          showOTP={showOTP}
          isPending={isPending}
          onSubmit={onSubmit}
          handleResendClick={handleResendClick}
        />
      </CardContent>
      <CardFooter>
        <LinkRouter href="/auth/register" label="Don't have an account?" />
      </CardFooter>
      {showOTP && (
        <Button
          className="absolute left-2 top-2 rounded-full"
          variant="outline"
          size="sm"
          onClick={handleBackClick}
        >
          <ArrowLeftIcon />
        </Button>
      )}
    </Card>
  );
}

// ################################################################################################

type LoginFormProps = {
  form: UseFormReturn<TFormLogin>;
  showOTP: boolean;
  isPending: boolean;
  onSubmit: (values: TFormLogin) => void;
  handleResendClick: () => void;
};

function LoginForm({
  form,
  showOTP,
  isPending,
  onSubmit,
  handleResendClick,
}: LoginFormProps) {
  return (
    <div className="space-y-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {!showOTP && (
            <>
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
                          placeholder="test@test.com"
                          disabled={isPending}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => {
                  return (
                    <FormItem>
                      <div className="flex h-[24px] items-center justify-between">
                        <FormLabel>Password</FormLabel>
                        <LinkRouter
                          href="/auth/reset-password"
                          label="Forgot Password?"
                          tabIndex={1}
                          className="w-fit"
                        />
                      </div>

                      <FormControl>
                        <Input
                          {...field}
                          type="password"
                          placeholder="password"
                          disabled={isPending}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />
            </>
          )}
          {showOTP && (
            <div className="flex gap-2">
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => {
                  return (
                    <FormItem className="w-full">
                      <FormLabel>Authentication Code</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="text"
                          placeholder="123456"
                          disabled={isPending}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />
              <Button
                className="self-end rounded-full text-xs"
                variant="outline"
                disabled={isPending}
                onClick={handleResendClick}
                type="button"
              >
                Resend
              </Button>
            </div>
          )}
          <Button
            type="submit"
            className="w-full rounded-full"
            disabled={isPending}
          >
            {isPending && <Spinner size="xs" className="mr-2" />}
            {showOTP ? "Submit" : "Log in"}
          </Button>
        </form>
      </Form>
      {!showOTP && (
        <>
          <div className="flex items-center justify-center">
            <div className="h-[1px] w-full bg-slate-900/20" />
            <span className="mx-4 text-sm text-slate-900/40">OR</span>
            <div className="h-[1px] w-full bg-slate-900/20" />
          </div>
          <Socials />
        </>
      )}
    </div>
  );
}
