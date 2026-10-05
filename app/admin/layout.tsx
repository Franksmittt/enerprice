import Link from "next/link";
import { Eye, LogOut } from "lucide-react";
import { logout } from "@/app/actions";
import { NavLink } from "@/components/nav-link";
import { ScrollRow } from "@/components/portal/scroll-row";
import { BrandStripe, Wordmark } from "@/components/wordmark";
import { requireAdmin } from "@/lib/auth";
import { readDb } from "@/lib/db";

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const admin = await requireAdmin();
  const db = await readDb();
  const pending = db.customers.filter((c) => c.status === "pending").length;

  return (
    <div className="flex min-h-screen flex-col bg-neutral-50">
      <BrandStripe />
      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <Wordmark href="/admin" sub="Back office" />
          <div className="flex items-center gap-1 text-sm sm:gap-3">
            <Link
              href="/portal"
              className="flex items-center gap-1.5 rounded-md border border-neutral-300 px-3 py-1.5 font-medium hover:bg-neutral-50"
            >
              <Eye className="size-4" /> <span className="sm:hidden">Portal</span>
              <span className="hidden sm:inline">View as customer</span>
            </Link>
            <span className="hidden text-neutral-500 md:inline">{admin.name}</span>
            <form action={logout}>
              <button
                aria-label="Sign out"
                className="flex items-center gap-1 rounded-md p-2 text-neutral-500 hover:bg-neutral-100 hover:text-ink sm:px-2 sm:py-1.5"
              >
                <LogOut className="size-4" /> <span className="hidden sm:inline">Sign out</span>
              </button>
            </form>
          </div>
        </div>
        <ScrollRow
          label="Back office"
          className="relative mx-auto flex max-w-7xl gap-5 overflow-x-auto px-4 [mask-image:linear-gradient(to_right,black_85%,transparent)] [scrollbar-width:none] sm:gap-6 sm:px-6 md:[mask-image:none]"
        >
          <NavLink href="/admin" exact>
            Products & costing
          </NavLink>
          <NavLink href="/admin/tiers">Tiers & margins</NavLink>
          <NavLink href="/admin/warranties">Warranties & ranges</NavLink>
          <NavLink href="/admin/customers">
            Customers
            {pending > 0 && (
              <span className="rounded-full bg-alert px-1.5 text-xs font-bold text-white">{pending}</span>
            )}
          </NavLink>
          <NavLink href="/admin/import">Import pricelist</NavLink>
        </ScrollRow>
      </header>
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 sm:py-8">{children}</main>
    </div>
  );
}
