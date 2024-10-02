import FormSuccess from "@/components/form-success";
import React from "react";

// ################################################################################################

export default function AdminOnlyComponent() {
  return (
    <FormSuccess message="You are an admin! The content of this page will be accessible to you." />
  );
}
