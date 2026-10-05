import Image from "next/image";
import { Battery, BatteryCharging, Cable, Gauge, PlugZap, Sun } from "lucide-react";
import { chemistry, isBattery } from "@/lib/catalog";
import type { Product } from "@/lib/types";

const SIZES = {
  sm: { box: "size-12", px: 48, icon: "size-5" },
  md: { box: "size-28", px: 112, icon: "size-10" },
  lg: { box: "aspect-square w-full max-w-72", px: 288, icon: "size-16" },
};

/** Without a photo, an icon for the kind of product keeps the column aligned and still tells rows apart. */
function FallbackIcon({ product: p, className }: { product: Product; className: string }) {
  if (p.categoryId === "chargers") return <PlugZap className={className} />;
  if (p.categoryId === "testers") return <Gauge className={className} />;
  if (p.categoryId === "accessories") return <Cable className={className} />;
  if (/solar|panel/i.test(p.group)) return <Sun className={className} />;
  if (isBattery(p) && chemistry(p) === "Lithium") return <BatteryCharging className={className} />;
  return <Battery className={className} />;
}

export function ProductThumb({ product: p, size = "sm" }: { product: Product; size?: keyof typeof SIZES }) {
  const { box, px, icon } = SIZES[size];
  return (
    <span className={`flex shrink-0 items-center justify-center overflow-hidden rounded-md border border-neutral-200 bg-white ${box}`}>
      {p.image ? (
        <Image
          src={p.image}
          alt={size === "sm" ? "" : p.description}
          width={px}
          height={px}
          unoptimized={p.image.startsWith("/media/")}
          className="size-full object-contain p-0.5"
        />
      ) : (
        <FallbackIcon product={p} className={`${icon} text-neutral-300`} />
      )}
    </span>
  );
}
