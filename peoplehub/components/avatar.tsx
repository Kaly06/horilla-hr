import type { Employee } from "@/lib/types";

export function initials(first: string, last: string) {
  return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
}

export function Avatar({
  first,
  last,
  hue,
  size = 36,
  ring = false,
}: {
  first: string;
  last: string;
  hue: number;
  size?: number;
  ring?: boolean;
}) {
  return (
    <span
      aria-hidden
      className={`inline-grid shrink-0 place-items-center rounded-full font-semibold tracking-tight ${
        ring ? "ring-2 ring-surface" : ""
      }`}
      style={{
        width: size,
        height: size,
        fontSize: size * 0.34,
        color: `hsl(${hue} 62% 26%)`,
        background: `linear-gradient(150deg, hsl(${hue} 78% 88%), hsl(${(hue + 28) % 360} 74% 78%))`,
      }}
    >
      {initials(first, last)}
    </span>
  );
}

export function EmployeeAvatar({ e, size = 36, ring }: { e: Employee; size?: number; ring?: boolean }) {
  return <Avatar first={e.firstName} last={e.lastName} hue={e.hue} size={size} ring={ring} />;
}
