# Enertec Trade Pricelist Portal (demo)

One login for wholesale customers to see the full Enertec range at the prices allocated to them, and a back office
for Enertec to manage costs, margins and customer tiers in one place instead of exporting PDFs from Excel.

## Run it

```bash
npm install
npm run dev
```

Open http://localhost:3000.

For showing it to someone, run the production build instead; pages and the product panel are several times faster:

```bash
npm run build
npm start
```

Works on phones, tablets and desktop. On a phone the price list becomes tappable product cards and the category,
export and back-office menus scroll sideways.

## Demo logins

| Who | Email | Password |
| --- | --- | --- |
| Enertec back office | admin@enertec.co.za | enertec-admin |
| Alberton Battery Mart (Tier 2) | buyer@albertonbatterymart.co.za | abm-demo |
| Vaal Auto Electrical (Tier 1, demo) | parts@vaalauto.example | demo-t1 |
| Highveld Fleet Services (Tier 3, demo) | buying@highveldfleet.example | demo-t3 |

## How pricing works

- Enertec enters a **cost** (ex VAT) per product.
- Each **tier** turns cost into a selling price using either a **markup on cost** or a **GP %**, with optional
  different percentages per category. Prices round to whole rand, like the current PDFs.
- Any single tier price can be overridden manually on the costing grid.
- Each customer is allocated one tier and only ever sees that tier's prices. New sign-ups see the range but no
  prices until Enertec allocates a tier.

Seed data is the Oct 2026 pricelist 143 for **Accessories**, **Ebatt Automotive**, **Enertec Blue Automotive &
Truck**, **Enertec Silver** (SLI, EFB & AGM, automotive and truck), **Industrial** (Discover traction AGM, Enertec golf cart, Optima, lithium, lithium & Delta-Q chargers),
**Marine & Leisure**, **VRLA** (Forbatt AGM & gel standby), **Bull** (Bull JIS/AGM and Enertec Red truck), **Energizer** (automotive, AGM and commercial; discontinued lines
are flagged "while stocks last"), **Lithium Only** (inverter batteries: Enertec Megatank, Deye, Dyness, Fox ESS) and **Motorcycle** (Enertec AGM
and iGel), plus pricelist 231 **CTEK** (consumer, on-board, workshop and EV chargers, diagnostics and charger accessories): 373 products in 10 categories.
If a product's main code changes between lists, the old code goes in `aliases` and the migration carries
Enertec's cost and price edits across to the new code. A product exists once and can be listed in several categories (`alsoIn`), so the Marine
tile shows the whole Marine PDF while each Optima or Discover battery is still costed in one place; the home
category's tier margin applies. Codes a product carries on other lists (`aliases`) are searchable.
Batteries carry their specs (SABMA, V, Ah, reserve minutes, CCA, dimensions, layout, terminal, hold-down, mass,
hydrometer eye) and are searchable by them. Items priced "TBA" on the PDF have a cost of 0 and show as "Price TBA"
until Enertec enters a cost. The Tier 2 price equals the price on that PDF (the Alberton
Battery Mart price); costs were back-calculated at a 26% markup, Tier 1 is 50% markup and Tier 3 is 10% markup,
so the first item reads R50 cost → R75 / R63 / R55.

## Finding products

Categories sit under three pillars: **Batteries** (Automotive, Truck & Commercial, Motorcycle, Marine & Leisure,
Deep Cycle, Solar & Lithium, Golf Cart & Motive, Standby & UPS), **Chargers & testing** and **Accessories**.
Lithium is a battery type, not a category, so lithium and inverter batteries live under Deep Cycle, Solar & Lithium.
Inside a category, buyers narrow by **Brand**, **Type** (Flooded, EFB, AGM, Gel, Lithium, derived from the product
name) and **Voltage**. Search, category and filters all live in the URL, so a filtered view can be bookmarked or shared.
Every column (item code, size, key specs, warranty, price) sorts ascending or descending; on a phone the same sorts
are offered as chips above the list.
Search understands competitor sizes: "Willard 652" or "Exide 646" drops the brand and shows the Enertec equivalents
with a reminder to check layout and CCA.

## Product detail, ranges and counter mode

- **Photos.** 270 of 373 products have a photo taken from enertec.co.za and batterypowerzone.co.za
  (`node scripts/fetch-images.mjs` re-crawls, resizes to 800 px JPEG and writes `lib/product-images.json`); the rest
  show an icon for their kind. Enertec can upload or replace a photo from the product panel; uploads are stored in
  `data/uploads` and served from `/media/…`.
- **Product panel** (click a photo or code; tap a card on a phone): big photo, key specs, warranty and conditions, a
  top-view terminal diagram, all specs, and the same size in every range with the price difference, extra warranty
  months and price per warranty month, so a counter salesperson can explain why Silver costs more than Ebatt. It
  slides over the list without reloading it, gets its own address (`/portal/p/CODE`), and closes with the browser
  Back button, Escape, the × or a click outside, returning to the same scroll position. A copied product link opens
  the panel over its list.
- **Compare ranges** (`/portal/compare?size=652`): every range in one SABMA size side by side, with "best value per
  warranty month" and "longest warranty" badges and editable "why this range" wording.
- **Counter mode** hides trade prices and shows retail at the dealer's markup (default 35%, rounded up to R10), so
  the screen can be turned to an end customer. Retail shows incl. VAT by default, with an excl. VAT switch for
  business customers. "Show my margin" adds the dealer's cost, profit and GP % per line for their own eyes. Exports
  are hidden while it is on.

The portal uses Enertec's brand colours (blue, red and grey from enertec.co.za) and logo, on screen and in the PDF.

## Warranties

Warranties come from rules under **Back office → Warranties & ranges**, seeded from Enertec's published warranty
table. A rule matches on brand, type, category and words in the code or name; the most specific rule wins, and a rule
with a later **valid from** date takes over on that date, so a change can be loaded ahead of time. Any single product
can be overridden from its panel. The page lists products with no warranty rule, all overrides, the general warranty
terms shown to customers and the range comparison wording. Accessories carry no warranty. Enertec Silver flooded
automotive is seeded at 24 months (published table) with a 30-month rule valid from 1 Oct 2026; confirm with Enertec.

## PDF and Excel export

"Download PDF" builds an A4 portrait pricelist (cover, contents with page numbers, running header and
"Page X of Y" footer, watermarked with the customer's name and date) for the current view, any selection of
categories, or the complete range. Each product prints once; with several categories selected, a product listed in
more than one prints under its home category. Every row prints its warranty; "Include product photos" adds a small
photo per row (the full list is about 25 pages and 650 KB). A single category builds in one to two seconds; the
complete list takes about ten seconds the first time and about five after that. "Excel" downloads the current view as CSV. The month and the notes
printed on the PDF and in the portal footer are editable under **Tiers → Pricelist wording**.

## Data

This demo stores everything in `data/db.json`, created from `lib/seed.ts` on first run. Delete that file (or use
"Reset demo data" on the Import page, which asks for confirmation) to start fresh. For a live deployment, swap
`lib/db.ts` for a real database and set `SESSION_SECRET` to a long random value.
