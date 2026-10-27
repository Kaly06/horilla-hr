import { redirect } from "next/navigation";
import { RecruitmentBoard } from "@/components/recruitment-board";
import { listCandidates } from "@/lib/queries";
import { currentUser } from "@/lib/session";
import { can, type Capability } from "@/lib/rbac";
import { NoAccess } from "@/components/no-access";

export const metadata = { title: "Recruitment" };

export default async function RecruitmentPage() {
  const me = await currentUser();
  if (!me) redirect("/login");

  if (!can(me.accessRole, "recruitment.manage", me.extraPermissions as Capability[])) {
    return (
      <NoAccess
        title="Recruitment is restricted"
        hint="Hiring pipelines are visible to HR managers and administrators only."
      />
    );
  }
  return <RecruitmentBoard candidates={listCandidates()} />;
}
