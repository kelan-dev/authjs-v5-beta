import { User } from "next-auth";
import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// ################################################################################################

type UserInfoProps = {
  user?: User;
  label: string;
  description: string;
};

export default function UserInfo({ user, label, description }: UserInfoProps) {
  if (!user) return null;

  return (
    <Card className="shadow-md">
      <CardHeader>
        <p className="text-center text-2xl font-semibold">{label}</p>
        <p className="text-center text-sm text-muted-foreground">
          {description}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
          <p className="text-sm font-medium">ID</p>
          <p className="max-w-[180px] truncate rounded-md bg-slate-100 p-1 font-mono text-xs">
            {user?.id}
          </p>
        </div>
        <div className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
          <p className="text-sm font-medium">Name</p>
          <p className="max-w-[180px] truncate rounded-md bg-slate-100 p-1 font-mono text-xs">
            {user?.name}
          </p>
        </div>
        <div className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
          <p className="text-sm font-medium">Email</p>
          <p className="max-w-[180px] truncate rounded-md bg-slate-100 p-1 font-mono text-xs">
            {user?.email}
          </p>
        </div>
        <div className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
          <p className="text-sm font-medium">Role</p>
          <p className="max-w-[180px] truncate rounded-md bg-slate-100 p-1 font-mono text-xs">
            {user?.role}
          </p>
        </div>
        <div className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
          <p className="text-sm font-medium">Two-Factor Authentication</p>
          <Badge variant={user?.isTwoFactorEnabled ? "success" : "destructive"}>
            {user?.isTwoFactorEnabled ? "Enabled" : "Disabled"}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
