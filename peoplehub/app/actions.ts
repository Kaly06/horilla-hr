"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getDb } from "@/lib/db";

const DEMO_LOGINS: Record<string, number> = {
  "amara.okafor@peoplehub.app": 1,
  "lina.haddad@peoplehub.app": 3,
  "ravi.menon@peoplehub.app": 2,
};

export async function login(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const id = DEMO_LOGINS[email];
  if (!id) {
    return { error: "That email isn't on the demo list. Pick a suggested account below." };
  }
  const jar = await cookies();
  jar.set("ph_uid", String(id), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  redirect("/");
}

export async function logout() {
  const jar = await cookies();
  jar.delete("ph_uid");
  redirect("/login");
}

export async function setLeaveStatus(id: number, status: "approved" | "declined") {
  const db = getDb();
  db.prepare(`UPDATE leave_requests SET status = ? WHERE id = ?`).run(status, id);
  const row = db.prepare(`SELECT employee_id, type FROM leave_requests WHERE id = ?`).get(id) as any;
  if (row && status === "approved" && row.type === "Annual") {
    db.prepare(
      `UPDATE employees SET status = 'on_leave'
       WHERE id = ? AND status = 'active'`,
    ).run(row.employee_id);
  }
  revalidatePath("/leave");
  revalidatePath("/");
  return { ok: true };
}

export async function toggleTask(id: number, done: boolean) {
  const db = getDb();
  db.prepare(`UPDATE onboarding_tasks SET done = ? WHERE id = ?`).run(done ? 1 : 0, id);
  revalidatePath("/onboarding");
  revalidatePath("/");
  return { ok: true };
}

export async function moveCandidate(id: number, stage: string) {
  const db = getDb();
  db.prepare(`UPDATE candidates SET stage = ? WHERE id = ?`).run(stage, id);
  revalidatePath("/recruitment");
  return { ok: true };
}

export async function punch(action: "in" | "out") {
  const jar = await cookies();
  const uid = Number(jar.get("ph_uid")?.value ?? 0);
  if (!uid) return { ok: false, error: "Not signed in" };

  const db = getDb();
  const today = new Date().toISOString().slice(0, 10);
  const now = new Date();
  const time = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

  const existing = db
    .prepare(`SELECT id, check_in, check_out FROM attendance WHERE employee_id = ? AND date = ?`)
    .get(uid, today) as { id: number; check_in: string | null; check_out: string | null } | undefined;

  if (action === "in") {
    // Grace period is 09:15; anything later counts as a late arrival.
    const minutesNow = now.getHours() * 60 + now.getMinutes();
    const status = minutesNow > 9 * 60 + 15 ? "late" : "present";

    if (existing) {
      // Clocking in again restarts the day: clear the previous clock-out
      // rather than leaving a record that looks already finished.
      db.prepare(
        `UPDATE attendance SET check_in = ?, check_out = NULL, status = ? WHERE id = ?`,
      ).run(time, status, existing.id);
    } else {
      db.prepare(
        `INSERT INTO attendance (employee_id, date, check_in, check_out, status)
         VALUES (?, ?, ?, NULL, ?)`,
      ).run(uid, today, time, status);
    }
  } else {
    // Nothing to clock out of yet — clock them in first so the record is sane.
    if (!existing || !existing.check_in) {
      db.prepare(
        `INSERT INTO attendance (employee_id, date, check_in, check_out, status)
         VALUES (?, ?, NULL, ?, 'present')
         ON CONFLICT(employee_id, date) DO UPDATE SET check_out = excluded.check_out`,
      ).run(uid, today, time);
    } else {
      db.prepare(`UPDATE attendance SET check_out = ? WHERE id = ?`).run(time, existing.id);
    }
  }

  revalidatePath("/attendance");
  revalidatePath("/");
  return { ok: true, time };
}
