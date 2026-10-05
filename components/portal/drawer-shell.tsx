"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { X } from "lucide-react";

export function DrawerShell({
  closeHref,
  back = false,
  title,
  children,
}: {
  closeHref: string;
  back?: boolean;
  title: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [closed, setClosed] = useState(false);

  useEffect(() => {
    if (closed) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setClosed(true);
      if (back) router.back();
      else router.push(closeHref, { scroll: false });
    };
    document.addEventListener("keydown", onKey);
    document.body.classList.add("overflow-hidden");
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.classList.remove("overflow-hidden");
    };
  }, [closeHref, back, router, closed]);

  // Hide straight away; the URL catches up a moment later.
  if (closed) return null;

  const close = (e: React.MouseEvent) => {
    setClosed(true);
    if (back) {
      e.preventDefault();
      router.back();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true" aria-label={title}>
      <Link href={closeHref} scroll={false} onClick={close} aria-label="Close" tabIndex={-1} className="absolute inset-0 bg-ink/40" />
      <div className="relative flex h-full w-full max-w-2xl flex-col bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-3">
          <span className="font-mono text-sm font-semibold">{title}</span>
          <Link
            href={closeHref}
            scroll={false}
            onClick={close}
            autoFocus
            className="rounded-md p-1.5 text-neutral-500 hover:bg-neutral-100 hover:text-ink"
            aria-label="Close"
          >
            <X className="size-5" />
          </Link>
        </div>
        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
