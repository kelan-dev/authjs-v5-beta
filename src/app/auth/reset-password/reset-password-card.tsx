"use client";

import { useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { s, TFormEmail, TFormCreatePassword } from "@/lib/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { requestPasswordReset, createNewPassword } from "./actions";
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
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { toast } from "react-toastify";
import Header from "../header";
import LinkRouter from "@/components/link-router";
import { Spinner } from "@/components/spinner";

// ################################################################################################

export default function ResetPasswordCard() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  return (
    <Card className="relative w-[400px] shadow-md">
      <CardHeader>
        {token ? (
          <Header label="Confirm your new password below" />
        ) : (
          <Header label="Request a password reset link below" />
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {!token && <RequestResetForm />}
        {token && <CreatePasswordForm token={token} />}
      </CardContent>
      <CardFooter>
        <LinkRouter href="/auth/login" label="Back to login" />
      </CardFooter>
    </Card>
  );
}

// ################################################################################################

function RequestResetForm() {
  const [isPending, startTransition] = useTransition();

  const form = useForm<TFormEmail>({
    resolver: zodResolver(s.form.email),
    defaultValues: {
      email: "",
    },
  });

  function onSubmit(values: TFormEmail) {
    startTransition(async () => {
      const result = await requestPasswordReset({ email: values.email });
      if (result.success) toast.success(result.message);
      else toast.error(result.message);
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => {
            return (
              <FormItem className="w-full">
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="text"
                    placeholder="email@example.com"
                    disabled={isPending}
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
          disabled={isPending}
        >
          {isPending && <Spinner size="xs" className="mr-2" />}
          Send Reset Link
        </Button>
      </form>
    </Form>
  );
}

// ################################################################################################

type CreatePasswordFormProps = {
  token: string;
};

function CreatePasswordForm({ token }: CreatePasswordFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<TFormCreatePassword>({
    resolver: zodResolver(s.form.createPassword),
    defaultValues: {
      newPassword: "",
      confirmNewPassword: "",
    },
  });

  function onSubmit(values: TFormCreatePassword) {
    startTransition(async () => {
      const result = await createNewPassword(values, token);
      if (result.success) {
        toast.success(result.message);
        router.push("/auth/login");
      } else {
        toast.error(result.message);
      }
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="newPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>New Password</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="password"
                  placeholder="********"
                  disabled={isPending}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="confirmNewPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm New Password</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="password"
                  placeholder="********"
                  disabled={isPending}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          className="w-full rounded-full"
          disabled={isPending}
        >
          {isPending && <Spinner size="xs" className="mr-2" />}
          Reset Password
        </Button>
      </form>
    </Form>
  );
}
