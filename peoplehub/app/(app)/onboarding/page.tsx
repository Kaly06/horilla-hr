import { redirect } from "next/navigation";
import { OnboardingList } from "@/components/onboarding-list";
import { listOnboarding } from "@/lib/queries";
import { currentUser } from "@/lib/session";
import { can, type Capability } from "@/lib/rbac";
import { NoAccess } from "@/components/no-access";

export const metadata = { title: "Onboarding" };

export default async function OnboardingPage() {
  const me = await currentUser();
  if (!me) redirect("/login");

  if (!can(me.accessRole, "onboarding.manage", me.extraPermissions as Capability[])) {
    return (
      <NoAccess
        title="Onboarding is restricted"
        hint="Checklists are managed by HR and administrators."
      />
    );
  }
  return <OnboardingList tasks={listOnboarding()} />;
}
