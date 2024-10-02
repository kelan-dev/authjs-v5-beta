"use client";

import FormError from "@/components/form-error";
import FormSuccess from "@/components/form-success";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { zodResolver } from "@hookform/resolvers/zod";
import { UserRole } from "@prisma/client";
import React, { useState, useTransition } from "react";
import { useForm, UseFormReturn } from "react-hook-form";
import { updateSettings } from "./actions";
import { s, TFormSettings } from "@/lib/schemas";
import { User } from "next-auth";
import { Spinner } from "@/components/spinner";
import { toast } from "react-toastify";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

// ################################################################################################

type SettingsCardProps = {
  user: User;
};

export default function SettingsCard({ user }: SettingsCardProps) {
  const router = useRouter();
  const session = useSession();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isPending, startTransition] = useTransition();

  const form = useForm<TFormSettings>({
    resolver: zodResolver(s.form.settings),
    defaultValues: {
      role: user.role,
      name: user.name || "",
      email: user.email || "",
      newPassword: "",
      confirmNewPassword: "",
      isTwoFactorEnabled: user.isTwoFactorEnabled,
    },
  });

  // On submit, try to update the user's profile settings
  function onSubmit(values: TFormSettings) {
    startTransition(async () => {
      updateSettings(values)
        .then((result) => {
          if (!result?.success) {
            toast.error(result.message);
          }
          if (result?.success) {
            toast.success(result.message);

            // If successful, then we need to refresh the session on the client side
            // TODO: This doesn't seem to be working correctly; the session isn't being updated
            session.update();

            // Refresh the current route so that server components re-render with the new data
            // https://stackoverflow.com/questions/75124513/update-server-component-after-data-has-been-changed-by-client-component-in-next
            router.refresh();
          }
        })
        .catch(() => toast.error("An unexpected error occurred"));
    });
  }

  return (
    <Card className="shadow-md">
      <CardHeader>
        <p className="text-center text-2xl font-semibold">⚙ Settings</p>
        <p className="text-center text-sm text-muted-foreground">
          We can update our profile settings with a server action
        </p>
      </CardHeader>
      <CardContent>
        <SettingsForm
          userIsOAuth={user?.isOAuth || false}
          form={form}
          isPending={isPending}
          onSubmit={onSubmit}
          error={error}
          success={success}
        />
      </CardContent>
    </Card>
  );
}

// ################################################################################################

type SettingsFormProps = {
  userIsOAuth: boolean;
  form: UseFormReturn<TFormSettings>;
  isPending: boolean;
  error: string;
  success: string;
  onSubmit: (values: TFormSettings) => void;
};

function SettingsForm({
  userIsOAuth,
  form,
  isPending,
  error,
  success,
  onSubmit,
}: SettingsFormProps) {
  return (
    <Form {...form}>
      <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Role</FormLabel>
                <Select
                  disabled={isPending}
                  onValueChange={field.onChange}
                  value={field.value}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a Role..." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value={UserRole.ADMIN}>Admin</SelectItem>
                    <SelectItem value={UserRole.USER}>User</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="John Doe"
                    {...field}
                    disabled={isPending}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {!userIsOAuth && (
            <>
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="john.doe@example.com"
                        {...field}
                        disabled={isPending}
                        type="email"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="********"
                        {...field}
                        disabled={isPending}
                        type="password"
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
                        placeholder="********"
                        {...field}
                        disabled={isPending}
                        type="password"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="isTwoFactorEnabled"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Two Factor Authentication</FormLabel>
                      <FormDescription>
                        Enable or disable two factor authentication
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isPending}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </>
          )}
        </div>
        <Button type="submit" disabled={isPending}>
          {isPending && <Spinner size="xs" className="mr-2" />}
          Save Settings
        </Button>
        <FormError message={error} />
        <FormSuccess message={success} />
      </form>
    </Form>
  );
}
