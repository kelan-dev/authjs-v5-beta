import { auth } from "@/auth";
import SettingsCard from "./settings-card";

// ################################################################################################

export default async function SettingsPage() {
  const session = await auth();
  const user = session?.user;
  if (!user) return null;

  return <SettingsCard user={user} />;
}
