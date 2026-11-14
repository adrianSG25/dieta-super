import type { SupermarketId } from "@/types/dietasuper";

export const SUPERMARKET_META: Record<
  SupermarketId,
  { label: string; bg: string; fg: string; accent: string }
> = {
  aldi: { label: "Aldi", bg: "#00205b", fg: "#ffffff", accent: "#f47b20" },
  lidl: { label: "Lidl", bg: "#0050aa", fg: "#ffffff", accent: "#fff000" },
  asda: { label: "Asda", bg: "#78be20", fg: "#14290a", accent: "#4d8a0f" },
  morrisons: { label: "Morrisons", bg: "#006747", fg: "#ffffff", accent: "#ffd100" },
};

const gbp = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatGbp(amount: number): string {
  return gbp.format(Number.isFinite(amount) ? amount : 0);
}

export function SupermarketBadge({
  id,
  size = "sm",
  className = "",
}: {
  id: SupermarketId;
  size?: "xs" | "sm" | "md";
  className?: string;
}) {
  const meta = SUPERMARKET_META[id];
  const sizing =
    size === "xs"
      ? "px-1.5 py-0.5 text-[10px]"
      : size === "md"
        ? "px-3 py-1 text-sm"
        : "px-2 py-0.5 text-xs";
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-semibold leading-none ${sizing} ${className}`}
      style={{ backgroundColor: meta.bg, color: meta.fg }}
    >
      <span
        aria-hidden
        className="inline-block h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: meta.accent }}
      />
      {meta.label}
    </span>
  );
}

export default SupermarketBadge;
