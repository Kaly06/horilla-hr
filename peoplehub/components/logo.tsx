import { brand } from "@/lib/brand";

export function Logo({ size = 32, showWordmark = true }: { size?: number; showWordmark?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2.5 select-none">
      <span
        aria-hidden
        className="relative inline-grid place-items-center overflow-hidden rounded-[11px] shadow-sm"
        style={{
          width: size,
          height: size,
          background: "linear-gradient(140deg, var(--brand) 0%, #a78bfa 55%, var(--accent) 130%)",
        }}
      >
        <svg width={size * 0.56} height={size * 0.56} viewBox="0 0 24 24" fill="none">
          <circle cx="9" cy="8.5" r="3.1" fill="white" fillOpacity="0.95" />
          <circle cx="16.4" cy="10.4" r="2.3" fill="white" fillOpacity="0.62" />
          <path
            d="M3.2 19.4c.5-3.2 3-5.3 5.9-5.3s5.4 2.1 5.9 5.3"
            stroke="white"
            strokeWidth="2.1"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M16.6 14.5c2.2.3 3.9 2.1 4.2 4.4"
            stroke="white"
            strokeWidth="1.9"
            strokeLinecap="round"
            fill="none"
            strokeOpacity="0.75"
          />
        </svg>
      </span>
      {showWordmark && (
        <span className="text-[15px] font-semibold tracking-[-0.02em] text-fg">
          {brand.nameParts[0]}
          <span className="text-brand">{brand.nameParts[1] ?? ""}</span>
        </span>
      )}
    </span>
  );
}
