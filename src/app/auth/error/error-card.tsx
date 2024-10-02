import { Card, CardFooter, CardHeader } from "@/components/ui/card";
import LinkRouter from "@/components/link-router";
import Header from "@/app/auth/header";

// ################################################################################################

export default function ErrorCard() {
  return (
    <Card className="w-[400px] shadow-md">
      <CardHeader>
        <Header label="Oops! Something went wrong. :(" />
      </CardHeader>
      <CardFooter>
        <LinkRouter href="/auth/login" label="Go back to login" />
      </CardFooter>
    </Card>
  );
}
