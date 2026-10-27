import { redirect } from "next/navigation";
import { LeaveBoard } from "@/components/leave-board";
import { listLeave } from "@/lib/queries";
import { currentUser } from "@/lib/session";
import { can, type Capability } from "@/lib/rbac";

export const metadata = { title: "Leave" };

export default async function LeavePage() {
  const me = await currentUser();
  if (!me) redirect("/login");

  const canApprove = can(me.accessRole, "leave.approve", me.extraPermissions as Capability[]);
  return <LeaveBoard requests={listLeave()} canApprove={canApprove} />;
}
