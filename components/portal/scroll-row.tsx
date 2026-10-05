"use client";

import { useEffect, useRef } from "react";

/** Horizontal scroller that starts with its `aria-current` child in view. */
export function ScrollRow({ className, label, children }: { className?: string; label: string; children: React.ReactNode }) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const row = ref.current;
    const active = row?.querySelector<HTMLElement>("[aria-current]");
    if (!row || !active || row.scrollWidth <= row.clientWidth) return;
    row.scrollLeft = active.offsetLeft - row.clientWidth / 2 + active.offsetWidth / 2;
  }, []);

  return (
    <nav ref={ref} aria-label={label} className={className}>
      {children}
    </nav>
  );
}
