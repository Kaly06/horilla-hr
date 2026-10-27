import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { currentUser } from "@/lib/session";
import { listEmployees, listLeave } from "@/lib/queries";
import { capabilitiesFor, roleOf, type Capability } from "@/lib/rbac";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await currentUser();
  if (!user) redirect("/login");

  const people = listEmployees().map((e) => ({
    id: e.id,
    name: `${e.firstName} ${e.lastName}`,
    role: e.role,
    hue: e.hue,
  }));
  const capabilities = capabilitiesFor(user.accessRole, user.extraPermissions as Capability[]);
  // Only people who may approve leave should see a badge nagging them to.
  const pendingLeave = capabilities.includes("leave.approve")
    ? listLeave("pending").length
    : 0;

  return (
    <AppShell
      user={{
        name: `${user.firstName} ${user.lastName}`,
        role: user.role,
        hue: user.hue,
        roleName: roleOf(user.accessRole).name,
        capabilities,
      }}
      people={people}
      pendingLeave={pendingLeave}
    >
      {children}
    </AppShell>
  );
}
