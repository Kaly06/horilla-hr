import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { currentUser } from "@/lib/session";
import { listEmployees, listLeave } from "@/lib/queries";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await currentUser();
  if (!user) redirect("/login");

  const people = listEmployees().map((e) => ({
    id: e.id,
    name: `${e.firstName} ${e.lastName}`,
    role: e.role,
    hue: e.hue,
  }));
  const pendingLeave = listLeave("pending").length;

  return (
    <AppShell
      user={{ name: `${user.firstName} ${user.lastName}`, role: user.role, hue: user.hue }}
      people={people}
      pendingLeave={pendingLeave}
    >
      {children}
    </AppShell>
  );
}
