/**
 * Deletes the local SQLite database. The app reseeds itself with fresh
 * demo data the next time it boots.
 *
 *   npm run reset
 */
import fs from "node:fs";
import path from "node:path";

const target = path.join(process.cwd(), ".data");

if (fs.existsSync(target)) {
  fs.rmSync(target, { recursive: true, force: true });
  console.log("✔ Demo database removed. Restart the server to reseed.");
} else {
  console.log("• Nothing to reset — no .data folder yet.");
}
