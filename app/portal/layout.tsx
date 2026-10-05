import Link from "next/link";
import { Suspense } from "react";
import { ArrowLeft, LogOut } from "lucide-react";
import { logout } from "@/app/actions";
import { DrawerPending } from "@/components/portal/drawer-pending";
import { BrandStripe, Wordmark } from "@/components/wordmark";
import { requireSession } from "@/lib/auth";
import { readDb } from "@/lib/db";
import { pricelistNotes } from "@/lib/format";

export default async function PortalLayout({ children, drawer }: LayoutProps<"/portal">) {
  const session = await requireSession();
  const notes = pricelistNotes((await readDb()).settings);
  return (
    <div className="flex min-h-screen flex-col">
      <BrandStripe className="no-print" />
      <header className="no-print border-b border-neutral-200">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <Wordmark href="/portal" />
          <div className="flex min-w-0 items-center gap-1 text-sm sm:gap-3">
            {session.role === "admin" ? (
              <Link
                href="/admin"
                className="flex items-center gap-1.5 rounded-md px-2 py-1.5 font-medium text-neutral-600 hover:bg-neutral-100 hover:text-ink"
              >
                <ArrowLeft className="size-4" /> Back office
              </Link>
            ) : (
              <span className="min-w-0 text-right leading-tight">
                <span className="block truncate font-semibold">{session.user.company}</span>
                {session.user.accountNo && <span className="block truncate text-xs text-neutral-500">Account {session.user.accountNo}</span>}
              </span>
            )}
            <form action={logout} className="shrink-0">
              <button
                aria-label="Sign out"
                className="flex items-center gap-1 rounded-md p-2 text-neutral-500 hover:bg-neutral-100 hover:text-ink sm:px-2 sm:py-1.5"
              >
                <LogOut className="size-4" /> <span className="hidden sm:inline">Sign out</span>
              </button>
            </form>
          </div>
        </div>
      </header>
      {children}
      {drawer}
      <Suspense>
        <DrawerPending />
      </Suspense>
      <footer className="border-t border-neutral-200 px-4 sm:px-6 py-5 text-center text-xs leading-relaxed text-neutral-500">
        {notes.map((line) => (
          <p key={line}>{line}</p>
        ))}
      </footer>
    </div>
  );
}
