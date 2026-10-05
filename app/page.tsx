import Link from "next/link";
import { redirect } from "next/navigation";
import { FileSpreadsheet, Layers, Search, ShieldCheck } from "lucide-react";
import { LoginForm } from "@/components/login-form";
import { BrandStripe, Wordmark } from "@/components/wordmark";
import { getSession } from "@/lib/auth";
import { readDb } from "@/lib/db";
import { DEMO_LOGINS } from "@/lib/seed";

const POINTS = [
  { icon: Search, title: "One place, every product", body: "No more sifting through 20 PDFs. Search by code or browse by category." },
  { icon: Layers, title: "Your price, only yours", body: "Every account sees the pricing tier Enertec has allocated to them." },
  { icon: FileSpreadsheet, title: "Always the latest list", body: "When Enertec updates a cost, every customer's price updates instantly." },
  { icon: ShieldCheck, title: "Secure trade access", body: "Approved wholesale accounts only. Prices are never public." },
];

export default async function Home() {
  const session = await getSession();
  if (session) redirect(session.role === "admin" ? "/admin" : "/portal");
  const db = await readDb();

  const demos = [
    { label: "Enertec back office", ...DEMO_LOGINS.admin },
    { label: "Alberton Battery Mart (Tier 2)", ...DEMO_LOGINS.customer },
    { label: "Vaal Auto Electrical (Tier 1)", email: "parts@vaalauto.example", password: "demo-t1" },
    { label: "Highveld Fleet (Tier 3)", email: "buying@highveldfleet.example", password: "demo-t3" },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <BrandStripe />
      <header className="border-b border-neutral-200">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 sm:px-6 py-4">
          <Wordmark />
          <span className="text-sm text-neutral-500">{db.settings.priceListMonth} pricing · excl. VAT</span>
        </div>
      </header>

      <main className="mx-auto grid w-full max-w-6xl flex-1 content-start gap-8 px-4 py-8 sm:px-6 sm:py-14 lg:grid-cols-[1.2fr_1fr] lg:gap-x-12 lg:gap-y-10">
        <section>
          <p className="text-sm font-semibold uppercase tracking-widest text-brand">Wholesale & dealer portal</p>
          <h1 className="mt-3 text-3xl font-black leading-tight tracking-tight sm:text-5xl">
            The full Enertec range.
            <br />
            Your trade prices.
            <br />
            One login.
          </h1>
          <p className="mt-4 max-w-xl text-base text-neutral-600 sm:mt-5 sm:text-lg">
            Batteries, chargers, testers and accessories with live pricing for your account, from automotive to golf cart and
            lithium.
          </p>
        </section>

        <section className="self-start rounded-xl border border-neutral-200 p-5 shadow-sm sm:p-7 lg:col-start-2 lg:row-span-2 lg:row-start-1">
          <h2 className="text-xl font-bold">Sign in</h2>
          <p className="mb-6 mt-1 text-sm text-neutral-600">Enertec staff and approved trade accounts.</p>
          <LoginForm demos={demos} />
          <p className="mt-6 text-center text-sm text-neutral-600">
            New wholesale customer?{" "}
            <Link href="/register" className="font-semibold text-brand hover:underline">
              Apply for a trade account
            </Link>
          </p>
        </section>

        <section>
          <div className="grid gap-5 sm:grid-cols-2">
            {POINTS.map(({ icon: Icon, title, body }) => (
              <div key={title} className="flex gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-md bg-brand/10 text-brand">
                  <Icon className="size-5" />
                </span>
                <div>
                  <h3 className="font-semibold">{title}</h3>
                  <p className="text-sm text-neutral-600">{body}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-10 flex flex-wrap gap-2">
            {db.categories.map((c) => (
              <span key={c.id} className="rounded-full border border-neutral-200 px-3 py-1 text-sm text-neutral-700">
                {c.name}
              </span>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-neutral-200 py-5 text-center text-xs text-neutral-500">
        Prices exclude VAT @ 15% and are subject to change without notice, exchange rates and stock availability.
      </footer>
    </div>
  );
}
