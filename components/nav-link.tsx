"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function NavLink({ href, children, exact = false }: { href: string; children: React.ReactNode; exact?: boolean }) {
  const pathname = usePathname();
  const active = exact ? pathname === href : pathname.startsWith(href);
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`flex shrink-0 items-center gap-2 whitespace-nowrap border-b-2 px-1 py-3 text-sm font-medium transition ${
        active ? "border-brand text-ink" : "border-transparent text-neutral-500 hover:text-ink"
      }`}
    >
      {children}
    </Link>
  );
}
