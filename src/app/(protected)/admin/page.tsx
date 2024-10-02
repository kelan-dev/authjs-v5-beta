import RoleGate from "@/components/role-gate";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { UserRole } from "@prisma/client";
import React from "react";
import AdminOnlyComponent from "./admin-only-component";
import AdminOnlyTestButtons from "./admin-only-test-buttons";

// ################################################################################################

export default function AdminPage() {
  return (
    <Card className="shadow-md">
      <CardHeader>
        <p className="text-center text-2xl font-semibold">🔑 Admin</p>
        <p className="text-center text-sm text-muted-foreground">
          Use a Role Gate to easily restrict access to protected pages or
          components
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <RoleGate allowedRole={UserRole.ADMIN}>
          <AdminOnlyComponent />
        </RoleGate>
        <AdminOnlyTestButtons />
      </CardContent>
    </Card>
  );
}
