"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { X } from "lucide-react";

/** Page and open product, e.g. `/portal/p/22BAT652-BLS|` (drawer route) or `/portal|22BAT652-BLS` (direct link). */
const here = () => `${window.location.pathname}|${new URLSearchParams(window.location.search).get("p") ?? ""}`;
const openCode = (location: string) => {
  const [path, p] = location.split("|");
  return p || (path.startsWith("/portal/p/") ? path.slice("/portal/p/".length).split("/").map(decodeURIComponent).join("/") : "");
};

/** Paints the drawer frame the instant a `data-drawer` link is clicked, until the real drawer arrives. */
export function DrawerPending() {
  const location = `${usePathname()}|${useSearchParams().get("p") ?? ""}`;
  const [pending, setPending] = useState<{ code: string; from: string } | null>(null);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const onClick = (e: MouseEvent) => {
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const code = (e.target as Element | null)?.closest<HTMLElement>("a[data-drawer]")?.dataset.drawer;
      const from = here();
      if (!code || openCode(from) === code) return;
      setPending({ code, from });
      clearTimeout(timer);
      timer = setTimeout(() => setPending(null), 15000);
    };
    // Capture phase: next/link cancels the click before it would bubble up to the document.
    document.addEventListener("click", onClick, true);
    return () => {
      document.removeEventListener("click", onClick, true);
      clearTimeout(timer);
    };
  }, []);

  // Once the URL moves on the job is done; keeping it would repaint the skeleton when Back returns here.
  if (pending && pending.from !== location) setPending(null);
  if (!pending || pending.from !== location) return null;

  return (
    <div className="fixed inset-0 z-[60] flex justify-end" aria-busy="true" aria-label={`Loading ${pending.code}`}>
      <div className="absolute inset-0 bg-ink/40" />
      <div className="relative flex h-full w-full max-w-2xl flex-col bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-3">
          <span className="font-mono text-sm font-semibold">{pending.code}</span>
          <span className="p-1.5 text-neutral-300">
            <X className="size-5" />
          </span>
        </div>
        <div className="grid animate-pulse gap-5 p-5 sm:grid-cols-[18rem_1fr]">
          <div className="aspect-square w-full max-w-72 rounded-md bg-neutral-100" />
          <div className="space-y-3">
            <div className="h-3 w-24 rounded bg-neutral-100" />
            <div className="h-6 w-4/5 rounded bg-neutral-100" />
            <div className="h-6 w-3/5 rounded bg-neutral-100" />
            <div className="h-4 w-1/2 rounded bg-neutral-100" />
            <div className="h-16 rounded-lg bg-neutral-100" />
          </div>
        </div>
      </div>
    </div>
  );
}
