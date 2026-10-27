import { RecruitmentBoard } from "@/components/recruitment-board";
import { listCandidates } from "@/lib/queries";

export const metadata = { title: "Recruitment" };

export default function RecruitmentPage() {
  return <RecruitmentBoard candidates={listCandidates()} />;
}
