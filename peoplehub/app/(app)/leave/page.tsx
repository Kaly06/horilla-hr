import { LeaveBoard } from "@/components/leave-board";
import { listLeave } from "@/lib/queries";

export const metadata = { title: "Leave" };

export default function LeavePage() {
  return <LeaveBoard requests={listLeave()} />;
}
