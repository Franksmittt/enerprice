import Image from "next/image";
import Link from "next/link";
import logo from "@/public/brand/enertec-logo-dark.png";

export function Wordmark({ href = "/", sub = "Trade Pricelist" }: { href?: string; sub?: string }) {
  return (
    <Link href={href} className="flex shrink-0 items-center gap-3">
      <Image src={logo} alt="Enertec Batteries" priority className="h-7 w-auto sm:h-9" />
      <span className="hidden border-l border-neutral-300 pl-3 text-[10px] font-bold uppercase leading-tight tracking-[0.2em] text-brand sm:block">
        {sub}
      </span>
    </Link>
  );
}

/** The three bars from the Enertec logo, used as the top edge of every page. */
export function BrandStripe({ className = "" }: { className?: string }) {
  return (
    <div className={`grid h-1 grid-cols-3 ${className}`} aria-hidden>
      <span className="bg-brand-light" />
      <span className="bg-alert" />
      <span className="bg-charcoal-soft" />
    </div>
  );
}
