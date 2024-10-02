"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FaUser } from "react-icons/fa";
import { ExitIcon } from "@radix-ui/react-icons";
import LogoutWrapper from "@/components/logout-wrapper";
import { Skeleton } from "@/components/ui/skeleton";
import { Session } from "next-auth";

// ################################################################################################

type UserButtonProps = {
  session: Session | null;
};

export default function UserButton({ session }: UserButtonProps) {
  if (!session?.user) {
    return <Skeleton className="h-10 w-10 rounded-full" />;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Avatar>
          <AvatarImage src={session?.user?.image || "/placeholder.jpg"} />
          <AvatarFallback className="bg-sky-500">
            <FaUser className="text-white" />
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-40" align="end">
        <LogoutWrapper>
          <DropdownMenuItem>
            <ExitIcon className="mr-2 h-4 w-4" />
            Sign out
          </DropdownMenuItem>
        </LogoutWrapper>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
