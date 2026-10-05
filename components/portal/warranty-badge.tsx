import { ShieldCheck, ShieldOff } from "lucide-react";
import { warrantyLabel, type Warranty } from "@/lib/warranty";

export function WarrantyBadge({ warranty, short = false }: { warranty: Warranty | null; short?: boolean }) {
  if (!warranty) return null;
  const none = warranty.months === null;
  const label = warrantyLabel(warranty.months, short);
  return (
    <span
      title={warranty.conditions ? `${label} warranty. ${warranty.conditions}` : `${label} warranty`}
      className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-semibold ${
        none ? "bg-neutral-100 text-neutral-500" : "bg-ink text-white"
      }`}
    >
      {none ? <ShieldOff className="size-3" /> : <ShieldCheck className="size-3" />}
      {label}
      {warranty.conditions && <span className="text-[9px] opacity-70">*</span>}
    </span>
  );
}
