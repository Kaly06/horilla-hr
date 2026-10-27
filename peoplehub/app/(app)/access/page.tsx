import { redirect } from "next/navigation";
import { AccessManager } from "@/components/access-manager";
import { listAccess } from "@/lib/queries";
import { currentUser } from "@/lib/session";
import { can } from "@/lib/rbac";
import type { Capability } from "@/lib/rbac";
import { NoAccess } from "@/components/no-access";

export const metadata = { title: "Access control" };

export default async function AccessPage() {
  const me = await currentUser();
  if (!me) redirect("/login");

  const allowed = can(me.accessRole, "access.manage", me.extraPermissions as Capability[]);
  if (!allowed) {
    return (
      <NoAccess
        title="Access control is restricted"
        hint="Only an administrator can change roles. Ask your People team if you need more access."
      />
    );
  }

  return <AccessManager people={listAccess()} meId={me.id} isAdmin />;
}
