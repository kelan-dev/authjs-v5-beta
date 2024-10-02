import { Poppins } from "next/font/google";
import { cn } from "@/lib/utils";

// ################################################################################################

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["600"],
});

type HeaderProps = {
  label: string;
};

export default function Header({ label }: HeaderProps) {
  return (
    <div className="flex w-full flex-col items-center justify-center gap-4">
      <h1 className={cn(poppins.className, "text-3xl font-semibold")}>
        🔐 AuthJS-v5
      </h1>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}
