"use client";

import { admin } from "@/app/(protected)/admin/actions";
import { Button } from "@/components/ui/button";
import React from "react";
import { toast } from "react-toastify";

// ################################################################################################

export default function AdminOnlyTestButtons() {
  function onApiRouteClick() {
    fetch("/api/admin").then((response) => {
      response.ok
        ? toast.success("API Route - Access Allowed")
        : toast.error("API Route - Access Denied");
    });
  }

  function onServerActionClick() {
    admin().then((data) => {
      data.success
        ? toast.success("Server Action - Access Allowed")
        : toast.error("Server Action - Access Denied");
    });
  }

  return (
    <>
      <div className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-md">
        <p className="text-sm font-medium">Admin-only API Route</p>
        <Button onClick={onApiRouteClick}>Click to test</Button>
      </div>
      <div className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-md">
        <p className="text-sm font-medium">Admin-only Server Action</p>
        <Button onClick={onServerActionClick}>Click to test</Button>
      </div>
    </>
  );
}
