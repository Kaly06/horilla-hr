import { redirect } from "next/navigation";
import { AttendancePanel } from "@/components/attendance-panel";
import { attendanceForRange, attendanceToday, listEmployees } from "@/lib/queries";
import { currentUser } from "@/lib/session";

export const metadata = { title: "Attendance" };

export default async function AttendancePage() {
  const me = await currentUser();
  if (!me) redirect("/login");

  const iso = new Date().toISOString().slice(0, 10);
  const all = attendanceToday();
  const today = {
    present: all.filter((r) => r.status === "present").length,
    remote: all.filter((r) => r.status === "remote").length,
    late: all.filter((r) => r.status === "late").length,
    absent: all.filter((r) => r.status === "absent").length,
    leave: all.filter((r) => r.status === "leave").length,
  };

  const employees = listEmployees();
  const byId = new Map(employees.map((e) => [e.id, e]));
  const team = all
    .filter((r) => byId.has(r.employeeId))
    .slice(0, 22)
    .map((r) => ({ employee: byId.get(r.employeeId)!, status: r.status, checkIn: r.checkIn }));

  const myRecord = all.find((r) => r.employeeId === me.id) ?? null;

  const range = attendanceForRange(20);
  const buckets = new Map<string, number>();
  for (const r of range) {
    if (r.status === "absent" || r.status === "leave") continue;
    buckets.set(r.date, (buckets.get(r.date) ?? 0) + 1);
  }
  const week = Array.from({ length: 14 })
    .map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (13 - i));
      const key = d.toISOString().slice(0, 10);
      return {
        date: key,
        label: d.toLocaleDateString("en-GB", { weekday: "narrow" }),
        count: buckets.get(key) ?? 0,
      };
    })
    .filter((w) => {
      const dow = new Date(w.date).getDay();
      return dow !== 0 && dow !== 6;
    });

  return (
    <AttendancePanel me={me} myRecord={myRecord} today={today} team={team} week={week} />
  );
}
