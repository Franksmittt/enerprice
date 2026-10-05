import { Eye, EyeOff, MonitorSmartphone, X } from "lucide-react";
import { setCounterMode } from "@/app/actions";
import { DEFAULT_RETAIL_MARKUP, type CounterMode } from "@/lib/counter";

/** Turns the screen into a customer-facing price board: trade prices hidden, retail shown. */
export function CounterToggle() {
  return (
    <form action={setCounterMode}>
      <input type="hidden" name="markup" value={DEFAULT_RETAIL_MARKUP} />
      <button
        title="Hide your trade prices and show retail prices, so you can turn the screen to your customer"
        className="flex w-full items-center justify-center gap-1.5 whitespace-nowrap rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm font-semibold hover:bg-neutral-50"
      >
        <MonitorSmartphone className="size-4 shrink-0 max-[359px]:hidden" /> Counter mode
      </button>
    </form>
  );
}

type Mode = NonNullable<CounterMode>;

/** Every switch posts the whole setting, so changing one keeps the others. */
function Settings({ mode, except }: { mode: Mode; except: "markup" | "margin" | "vat" }) {
  return (
    <>
      {except !== "markup" && <input type="hidden" name="markup" value={mode.markup} />}
      {except !== "margin" && <input type="hidden" name="margin" value={mode.margin ? "1" : "0"} />}
      {except !== "vat" && <input type="hidden" name="vat" value={mode.inclVat ? "incl" : "excl"} />}
    </>
  );
}

export function CounterBanner({ counter }: { counter: Mode }) {
  return (
    <div className="bg-alert text-white">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-5 gap-y-2 px-4 py-2 text-sm sm:px-6">
        <span className="flex items-center gap-2 font-semibold">
          <MonitorSmartphone className="size-4 shrink-0" /> Counter mode
          <span className="hidden font-normal text-white/85 xl:inline">· your trade prices are hidden</span>
        </span>

        <form action={setCounterMode} className="ml-auto sm:order-last">
          <input type="hidden" name="mode" value="off" />
          <button className="flex items-center gap-1 rounded px-2 py-0.5 font-semibold hover:bg-white/15">
            <X className="size-4" /> Exit
          </button>
        </form>

        <form action={setCounterMode} className="flex w-full items-center gap-2 sm:w-auto">
          <Settings mode={counter} except="markup" />
          <label htmlFor="markup" className="text-white/85">
            <span className="sm:hidden">Markup</span>
            <span className="hidden sm:inline">Retail = trade +</span>
          </label>
          <input
            id="markup"
            name="markup"
            defaultValue={counter.markup}
            inputMode="decimal"
            className="w-14 rounded border-0 bg-white/15 px-2 py-0.5 text-right font-semibold tabular-nums outline-none focus:bg-white focus:text-ink"
          />
          <span className="text-white/85">
            %<span className="hidden lg:inline">, rounded up to R10</span>
          </span>
          <button className="rounded bg-white px-2.5 py-1 text-xs font-bold text-alert hover:bg-neutral-100">Apply</button>
        </form>

        <div className="flex rounded-md bg-white/15 p-0.5" role="group" aria-label="VAT">
          {[
            { value: "incl", label: "Incl. VAT", on: counter.inclVat },
            { value: "excl", label: "Excl. VAT", on: !counter.inclVat },
          ].map((o) => (
            <form key={o.value} action={setCounterMode}>
              <Settings mode={counter} except="vat" />
              <input type="hidden" name="vat" value={o.value} />
              <button
                aria-pressed={o.on}
                className={`rounded px-2.5 py-1 text-xs font-bold ${o.on ? "bg-white text-alert" : "text-white hover:bg-white/15"}`}
              >
                {o.label}
              </button>
            </form>
          ))}
        </div>

        <form action={setCounterMode}>
          <Settings mode={counter} except="margin" />
          <input type="hidden" name="margin" value={counter.margin ? "0" : "1"} />
          <button
            aria-pressed={counter.margin}
            title="Your cost, profit and GP under each retail price. Turn it off before showing the screen to a customer."
            className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-bold ${
              counter.margin ? "bg-white text-alert" : "bg-white/15 hover:bg-white/25"
            }`}
          >
            {counter.margin ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
            {counter.margin ? "Hide my margin" : "Show my margin"}
          </button>
        </form>
      </div>
    </div>
  );
}
