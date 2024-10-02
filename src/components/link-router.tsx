import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";

// ################################################################################################

type LinkRouterProps = {
  className?: string;
  href: string;
  label: string;
  tabIndex?: number;
};

export default function LinkRouter({
  className,
  href,
  label,
  tabIndex,
}: LinkRouterProps) {
  return (
    <Button
      variant="link"
      className={cn("w-full font-normal", className)}
      size="sm"
      asChild
    >
      <Link href={href} tabIndex={tabIndex}>
        {label}
      </Link>
    </Button>
  );
}
