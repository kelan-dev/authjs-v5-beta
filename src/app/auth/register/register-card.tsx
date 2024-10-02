"use client";

import LinkRouter from "@/components/link-router";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import Header from "@/app/auth/header";
import Socials from "@/app/auth/socials";
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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { s, TFormRegister } from "@/lib/schemas";
import { useEffect, useRef, useState, useTransition } from "react";
import { register } from "./actions";
import FormSuccess from "@/components/form-success";
import { Spinner } from "@/components/spinner";
import { toast } from "react-toastify";

// ################################################################################################

export default function RegisterCard() {
  const [success, setSuccess] = useState("");

  return (
    <Card className="w-[400px] shadow-md">
      <CardHeader>
        <Header label="Create an account to get started." />
      </CardHeader>
      {!success && (
        <CardContent className="space-y-4">
          <RegisterForm setSuccess={setSuccess} />
          <div className="flex items-center justify-center">
            <div className="h-[1px] w-full bg-slate-900/20" />
            <span className="mx-4 text-sm text-slate-900/40">OR</span>
            <div className="h-[1px] w-full bg-slate-900/20" />
          </div>
          <Socials />
        </CardContent>
      )}
      {success && (
        <CardContent>
          <FormSuccess message={success} />
        </CardContent>
      )}
      <CardFooter>
        <LinkRouter href="/auth/login" label="Already have an account?" />
      </CardFooter>
    </Card>
  );
}

// ################################################################################################

type RegisterFormProps = {
  setSuccess: (success: string) => void;
};

function RegisterForm({ setSuccess }: RegisterFormProps) {
  const [isPending, startTransition] = useTransition();

  const form = useForm<TFormRegister>({
    resolver: zodResolver(s.form.register),
    defaultValues: {
      name: "",
      email: "",
      newPassword: "",
      confirmNewPassword: "",
    },
  });

  // Focus on the name field when the form is rendered
  const { setFocus } = form;
  useEffect(() => {
    setFocus("name");
  }, [setFocus]);

  // On form submission, try to create a new user account in the database
  function onSubmit(values: TFormRegister) {
    setSuccess("");
    startTransition(async () => {
      const result = await register(values);
      if (result.success) {
        setSuccess(result.message || "Success");
      }
      if (!result.success) {
        toast.error(result.message || "Error");
      }
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <>
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => {
              return (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} type="text" placeholder="John Doe" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              );
            }}
          />
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
          <FormField
            control={form.control}
            name="newPassword"
            render={({ field }) => {
              return (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input {...field} type="password" placeholder="********" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              );
            }}
          />
          <FormField
            control={form.control}
            name="confirmNewPassword"
            render={({ field }) => {
              return (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <Input {...field} type="password" placeholder="********" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              );
            }}
          />
        </>
        <Button
          type="submit"
          className="w-full rounded-full"
          disabled={isPending}
        >
          {isPending && <Spinner size="xs" className="mr-2" />}
          Create account
        </Button>
      </form>
    </Form>
  );
}
