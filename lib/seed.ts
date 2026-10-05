import "server-only";
import { hashPassword } from "./password";
import PRODUCT_IMAGES from "./product-images.json";
import { DEFAULT_WARRANTY_TERMS, SEED_RANGES, SEED_WARRANTY_RULES } from "./seed-warranty";
import type { Category, Database, Product, Tier } from "./types";

export { DEFAULT_WARRANTY_TERMS, SEED_RANGES, SEED_WARRANTY_RULES };

/** Photos matched from enertec.co.za and Battery Powerzone by scripts/fetch-images.mjs. */
export const imageFor = (code: string): string | undefined => (PRODUCT_IMAGES as Record<string, string>)[code];

export const DEMO_LOGINS = {
  admin: { email: "admin@enertec.co.za", password: "enertec-admin" },
  customer: { email: "buyer@albertonbatterymart.co.za", password: "abm-demo" },
};

export const SEED_CATEGORIES: Category[] = [
  { id: "automotive", name: "Automotive", blurb: "Car & LCV starter batteries", pillar: "batteries" },
  { id: "commercial", name: "Truck & Commercial", blurb: "Heavy duty, agri & plant", pillar: "batteries" },
  { id: "motorcycle", name: "Motorcycle", blurb: "Bikes, quads & powersports", pillar: "batteries" },
  { id: "marine", name: "Marine & Leisure", blurb: "Boats, caravans & off-grid", pillar: "batteries" },
  { id: "deep-cycle", name: "Deep Cycle, Solar & Lithium", blurb: "Leisure, LiFePO4 & inverter storage", pillar: "batteries" },
  { id: "golf-motive", name: "Golf Cart & Motive", blurb: "Golf carts, forklifts, floor care", pillar: "batteries" },
  { id: "standby", name: "Standby & UPS", blurb: "VRLA for alarms, gates & UPS", pillar: "batteries" },
  { id: "chargers", name: "Chargers & Jump Starters", blurb: "Workshop, on-board, EV & portable", pillar: "charging" },
  { id: "testers", name: "Battery Testers", blurb: "Analysers, voltmeters & load testers", pillar: "charging" },
  { id: "accessories", name: "Terminals & Accessories", blurb: "Terminals, covers, cables & mounts", pillar: "accessories" },
];

/** Categories folded into another; chemistry (e.g. lithium) is now a filter, not a category. */
export const RETIRED_CATEGORIES: Record<string, string> = { lithium: "deep-cycle", inverter: "deep-cycle" };

export const DEFAULT_PRICELIST_NOTES = [
  "Prices are in rand and exclude VAT unless marked incl. VAT. E&OE.",
  "Prices are subject to change without notice. Stock is subject to availability.",
].join("\n");

/**
 * Tier 2 is the Alberton Battery Mart price on the Oct 2026 PDF. Costs are
 * back-calculated from that price so the demo reproduces the PDF exactly.
 */
const TIER2_MARKUP = 26;

const TIERS: Tier[] = [
  { id: "t1", name: "Tier 1 · Trade", description: "Standard trade / small dealers", method: "markup", value: 50, byCategory: {} },
  { id: "t2", name: "Tier 2 · Wholesale", description: "Established wholesalers", method: "markup", value: TIER2_MARKUP, byCategory: {} },
  { id: "t3", name: "Tier 3 · Key Account", description: "High volume key accounts", method: "markup", value: 10, byCategory: {} },
];

const SOURCE = "Pricelist 143 · Accessories · Oct 2026";

// [code, description, category, group, Tier 2 price from PDF]
const PRICELIST_143: [string, string, string, string, number][] = [
  ["30ACB-BOSCH-POS", "Battery Terminal Bosch Pos - NO2POS", "accessories", "Terminals", 63],
  ["30ACB-BOSCH-NEG", "Battery Terminal Bosch Neg - NO1NEG", "accessories", "Terminals", 63],
  ["30ACB-MARINE-UNI", "Battery Terminal Marine Universal - N27", "accessories", "Terminals", 52],
  ["30ACB-MARINE-POS", "Marine Battery Terminal Positive", "accessories", "Terminals", 52],
  ["30ACB-TERSML-NEG", "Small Battery Terminal Negative", "accessories", "Terminals", 45],
  ["30ACB-TERSML-POS", "Small Battery Terminal Positive", "accessories", "Terminals", 45],
  ["30ACB-FIELDKIT", "Screw on Post Pair - 7412", "accessories", "Terminals", 60],
  ["30ACB-BOOT-R", "Red Boot Terminal Cover - 7820R", "accessories", "Covers & hardware", 27],
  ["30ACB-BOOT-B", "Black Boot Terminal Cover - 7820B", "accessories", "Covers & hardware", 27],
  ["30ACB-SSNUT-SET", "Stainless Steel Nuts Sinted - 7802", "accessories", "Covers & hardware", 29],
  ["40ACC-SLEEVE/KIT", "Terminal Adaptor Set (Sleeve Kit for JIS)", "accessories", "Covers & hardware", 40],
  ["43INV-BB-INV-W", "Battery Box with Wheels", "accessories", "Boxes & clips", 934],
  ["36CHA-CLIP-ALG", "Alligator Charger Clip", "accessories", "Boxes & clips", 406],
  ["48TES-2015C", "2015C - 12V/24V Battery Tester with printer", "testers", "Testers & analysers", 2698],
  ["48TES-OCV3-DHC", "Digital Battery Voltmeter 4,5 to 39,99", "testers", "Voltmeters", 498],
  ["48TES-OCV5-DHC", "Digital Voltmeter and Mini Tester - 6V / 12V / 24V", "testers", "Voltmeters", 498],
  ["48TES-BT282-DHC", "Electrical Battery & System Analyzer - 12V 40 to 1200 CCA (SAE)", "testers", "Testers & analysers", 1403],
  ["48TES-BTW300-DHC", "Bluetooth Battery Tester (6V / 12V) and System Analyzer (12V / 24V) : 40 to 2000CCA (SAE)", "testers", "Testers & analysers", 3295],
  ["48TES-BT900-DHC", "Battery Tester 12V and System Analyzer (12 & 12V) with Printer - 40 to 2000 CCA (SAE)", "testers", "Testers & analysers", 4901],
  ["48TES-BT1000-DHC", "Battery & Electrical System Analyzer with Printer (6 & 12V Batteries, 12V Start / Stop AGM/EFB Batteries & 12 / 24V Charging / Starting System) - 40 to 2000 CCA (SAE)", "testers", "Testers & analysers", 7242],
  ["48TES-BT2100-DHC", "Bluetooth Battery Tester (6V / 12V) and System Analyzer (12V / 24V) with Printer : 25 to 3000 CCA (SAE)", "testers", "Testers & analysers", 8707],
  ["48TES-BT2100CT-DHC", "Bluetooth Battery Tester (6V / 12V) and System Analyzer (12V / 24V) with Printer : 25 to 3000 CCA (SAE); Includes: Tester + DC Clamp Meter + Volt Test Probe", "testers", "Testers & analysers", 11697],
  ["48TES-500A2-DHC", "Load Tester - Carbon Pile 500 Amp", "testers", "Load testers", 2151],
  ["39PWB-18000-DHC", "Jump Starter 18000mAh + AC Output", "chargers", "Jump starters", 2593],
];

// [SABMA, item code, CCA (SAE), L, W, TH, terminal layout, terminal type, bottom hold-down, mass kg, hydrometer eye, Tier 2 price]
type EbattRow = [string, string, number, number, number, number, string, string, string, number, string, number];

const EBATT_143: EbattRow[] = [
  ["615J", "16BAT615J-EBA", 250, 187, 127, 224, "LHP (1)", "J-Tapered (3)", "B00", 8.5, "Yes", 555],
  ["616J", "16BAT616J-EBA", 250, 187, 127, 224, "RHP (0)", "J-Tapered (3)", "B00", 8.5, "Yes", 550],
  ["616BJ", "16BAT616BJ-EBA", 250, 187, 134, 224, "RHP (0)", "J-Tapered (3)", "B01", 8.5, "Yes", 562],
  ["638", "16BAT638-EBA", 410, 256, 170, 225, "LHP (1)", "Tapered (1)", "B00", 14.6, "Yes", 914],
  ["639", "16BAT639-EBA", 410, 256, 170, 225, "RHP (0)", "Tapered (1)", "B00", 14.6, "Yes", 938],
  ["646", "16BAT646-EBA", 420, 242, 175, 190, "RHP (0)", "Tapered (1)", "B13", 12.9, "Yes", 856],
  ["628", "16BAT628-EBA", 420, 242, 175, 175, "RHP (0)", "Tapered (1)", "B13", 13.1, "Yes", 863],
  ["652", "16BAT652-EBA", 500, 278, 175, 190, "RHP (0)", "Tapered (1)", "B13", 15.7, "Yes", 1067],
  ["657", "16BAT657-EBA", 500, 278, 175, 190, "LHP (1)", "Tapered (1)", "B13", 15.7, "Yes", 1077],
  ["650", "16BAT650-EBA", 500, 305, 171, 225, "LHP (1)", "Tapered (1)", "B00", 17.3, "Yes", 1127],
  ["656", "16BAT656-EBA", 500, 305, 171, 225, "RHP (0)", "Tapered (1)", "B00", 17.3, "Yes", 1205],
  ["668", "16BAT668-EBA", 590, 315, 175, 190, "RHP (0)", "Tapered (1)", "B13", 17.5, "Yes", 1273],
  ["658", "16BAT658-EBA", 640, 353, 175, 190, "RHP (0)", "Tapered (1)", "B13", 19.7, "Yes", 1437],
  ["674S", "23BAT674S-EBA", 690, 330, 175, 219, "-", "Stud Terminal", "B00", 21.8, "Yes", 1585],
];

// [SABMA, item code, Ah (20hr), CCA EN, CCA SAE, L, W, TH, terminal layout, terminal type, bottom hold-down, mass kg, Tier 2 price]
type BlueRow = [string, string, number, number, number, number, number, number, string, string, string, number, number];

const BLUE_AUTOMOTIVE_143: BlueRow[] = [
  ["U1-330", "20BAT-U1-BLC", 30, 330, 350, 197, 130, 185, "LHP (1)", "Flat Lug (4)", "B00", 8.2, 595],
  ["618", "20BAT618-BLC", 36, 330, 350, 207, 175, 175, "RHP (0)", "Tapered (1)", "B13", 10.8, 823],
  ["615J", "20BAT615J-BLC", 36, 330, 350, 187, 127, 225, "LHP (1)", "J-Tapered (3)", "B00", 9.6, 717],
  ["616J", "20BAT616J-BLC", 36, 330, 350, 187, 127, 225, "RHP (0)", "J-Tapered (3)", "B00", 9.6, 717],
  ["616BJ", "20BAT616BJ-BLC", 36, 330, 350, 187, 134, 225, "RHP (0)", "J-Tapered (3)", "B01", 9.6, 717],
  ["612", "20BAT612-BLC", 45, 360, 400, 207, 175, 190, "RHP (0)", "Tapered (1)", "B13", 11.6, 877],
  ["634", "20BAT634-BLC", 45, 360, 400, 237, 128, 221, "LHP (1)", "Tapered (1)", "B00", 11.8, 864],
  ["634J", "20BAT634J-BLC", 45, 360, 400, 237, 128, 221, "LHP (1)", "J-Tapered (3)", "B00", 11.8, 864],
  ["636", "20BAT636-BLC", 45, 360, 400, 237, 128, 221, "RHP (0)", "Tapered (1)", "B00", 11.8, 864],
  ["636J", "20BAT636J-BLC", 45, 360, 400, 237, 128, 221, "RHP (0)", "J-Tapered (3)", "B00", 11.8, 864],
  ["628", "20BAT628-BLC", 50, 460, 500, 242, 175, 175, "RHP (0)", "Tapered (1)", "B13", 13.6, 1031],
  ["643", "20BAT643-BLC", 55, 510, 550, 242, 175, 190, "LHP (1)", "Tapered (1)", "B13", 13.8, 1110],
  ["646", "20BAT646-BLC", 55, 510, 550, 242, 175, 190, "RHP (0)", "Tapered (1)", "B13", 13.8, 1110],
  ["621", "20BAT621B-BLC", 60, 470, 500, 229, 175, 222, "RHP (0)", "Tapered (1)", "B01", 15.1, 1173],
  ["622", "20BAT622B-BLC", 60, 470, 500, 229, 175, 222, "LHP (1)", "Tapered (1)", "B01", 15.1, 1173],
  ["638", "20BAT638-BLC", 60, 480, 530, 256, 170, 225, "LHP (1)", "Tapered (1)", "B00", 15.8, 1187],
  ["638B", "20BAT638B-BLC", 60, 480, 530, 256, 173, 225, "LHP (1)", "Tapered (1)", "B02", 15.8, 1187],
  ["639", "20BAT639-BLC", 60, 480, 530, 256, 170, 225, "RHP (0)", "Tapered (1)", "B00", 15.8, 1187],
  ["639B", "20BAT639B-BLC", 60, 480, 530, 256, 173, 225, "RHP (0)", "Tapered (1)", "B02", 15.8, 1187],
  ["647", "20BAT647-BLC", 65, 640, 700, 278, 175, 175, "RHP (0)", "Tapered (1)", "B13", 16, 1280],
  ["652", "20BAT652-BLC", 70, 600, 650, 278, 175, 190, "RHP (0)", "Tapered (1)", "B13", 16.7, 1325],
  ["668", "20BAT668-BLC", 80, 640, 700, 315, 175, 190, "RHP (0)", "Tapered (1)", "B13", 18.6, 1700],
  ["669", "20BAT669-BLC", 80, 640, 700, 315, 175, 190, "LHP (1)", "Tapered (1)", "B13", 18.6, 1700],
  ["650", "20BAT650-BLC", 80, 540, 600, 305, 171, 225, "LHP (1)", "Tapered (1)", "B00", 19.7, 1700],
  ["650B", "20BAT650B-BLC", 80, 540, 600, 305, 171, 225, "LHP (1)", "Tapered (1)", "B01", 19.7, 1700],
  ["656", "20BAT656-BLC", 80, 540, 600, 305, 171, 225, "RHP (0)", "Tapered (1)", "B00", 19.7, 1700],
  ["656B", "20BAT656B-BLC", 80, 540, 600, 305, 171, 225, "RHP (0)", "Tapered (1)", "B01", 19.7, 1700],
  ["658", "20BAT658-BLC", 90, 720, 780, 353, 175, 190, "RHP (0)", "Tapered (1)", "B13", 21.2, 1705],
];

const BLUE_TRUCK_143: BlueRow[] = [
  ["674S", "21BAT674S-BLC", 100, 800, 860, 330, 175, 242, "LHP Middle (7)", "Stud (13)", "B00", 24.5, 1880],
  ["683", "21BAT683-BLC", 125, 740, 800, 505, 183, 222, "LHP (3)", "Tapered (1)", "B00", 31.7, 2379],
  ["682", "21BAT682-BLC", 125, 740, 800, 505, 183, 222, "RHP (4)", "Tapered (1)", "B00", 31.7, 2379],
  ["689", "21BAT689-BLC", 150, 850, 900, 510, 221, 220, "LHP (3)", "Tapered (1)", "B00", 37.8, 2868],
  ["690", "21BAT690-BLC", 150, 850, 900, 510, 221, 220, "RHP (4)", "Tapered (1)", "B00", 37.8, 2868],
  ["692", "21BAT692-BLC", 170, 950, 1000, 510, 221, 220, "LHP (3)", "Tapered (1)", "B00", 39.4, 3281],
  ["695", "21BAT695-BLC", 200, 1150, 1200, 516, 275, 242, "LHP (3)", "Tapered (1)", "B00", 51.5, 3750],
  ["688", "21BAT688-BLC", 200, 1150, 1200, 509, 267, 246, "RHP (4)", "Tapered (1)", "B00", 49.5, 3874],
];

type SeedItem = {
  code: string;
  description: string;
  categoryId: string;
  group: string;
  brand?: string;
  specs?: Record<string, string | number | null>;
  /** null = price TBA on the pricelist */
  tier2: number | null;
  source?: string;
  alsoIn?: string[];
  aliases?: string[];
  discontinued?: boolean;
};

const INDUSTRIAL_SOURCE = "Pricelist 143 · Industrial · Oct 2026";

// [plant part no., item code, V, Ah 20hr, Ah 10hr, Ah 5hr, min @25A, min @75A, min @100A, L, W, H, mass, terminal, Tier 2]
type DiscoverRow = [string, string, number, number, number | null, number, number, number | null, number | null, number, number, number, number, string, number];

const DISCOVER: DiscoverRow[] = [
  ["EVGC6A-A", "12BATGC6A-A-DIS", 6, 220, 200, 190, 475, 125, 88, 260, 180, 267, 30, "AM (M8)", 3574],
  ["EVGT6A-A", "12BATGT6A-A-DIS", 6, 260, 240, 222, 575, 155, 110, 260, 180, 272, 36, "M8 (AM)", 4679],
  ["EV305A-A", "12BAT305A-A-DIS", 6, 330, 305, 290, 770, 220, 160, 295, 180, 365, 49, "AM (M8)", 5840],
  ["EVU1A-A", "12BATU1A-A-DIS", 12, 33, 31, 30, 45, 12, 7, 195, 130, 180, 11, "F7 (M6)", 1531],
  ["EV24A-A", "12BAT24A-A-DIS", 12, 85, null, 72, 160, null, null, 258, 172, 235, 23.5, "AM (M8)", 3003],
  ["EV27A-A", "12BAT27A-A-DIS", 12, 100, 95, 90, 195, 50, 35, 308, 172, 232, 29, "AM (M8)", 3636],
  ["EV31A-A", "12BAT31A-A-DIS", 12, 120, 110, 98, 235, 63, 42, 330, 172, 236, 33, "AM (M8)", 4228],
  ["EV12A-A", "12BAT12A-A-DIS", 12, 140, 130, 120, 300, 80, 55, 327, 180, 274, 40, "AM (M8)", 5283],
];

const dims = (l: number, w: number, h: number) => `${l}×${w}×${h}`;

const INDUSTRIAL_143: SeedItem[] = [
  ...DISCOVER.map(([model, code, v, ah, ah10, ah5, m25, m75, m100, l, w, h, mass, terminal, tier2]) => ({
    code,
    description: `Discover ${model} Deep Cycle Traction AGM ${v}V ${ah}Ah`,
    categoryId: "golf-motive",
    group: "Discover · Deep cycle traction AGM",
    brand: "Discover",
    specs: {
      Model: model, V: v, Ah: ah, "Ah 10hr": ah10, "Ah 5hr": ah5,
      "Min @25A": m25, "Min @75A": m75, "Min @100A": m100,
      "L×W×H mm": dims(l, w, h), "Mass kg": mass, Terminal: terminal,
    },
    tier2,
  })),
  ...([
    ["GC6-225", "21BATGC6-BLC", 6, 225, 261, 182, 290, 28, 2367],
    ["GC8-170", "21BATGC8-BLC", 8, 170, 260, 183, 289, 29, 2509],
    ["GC12-150", "21BATGC12-BLC", 12, 150, 330, 182, 275, 37, 3323],
  ] as const).map(([model, code, v, ah, l, w, h, mass, tier2]) => ({
    code,
    description: `Enertec ${model} Golf Cart Battery (lead acid) ${v}V ${ah}Ah`,
    categoryId: "golf-motive",
    group: "Enertec · Golf cart lead acid",
    brand: "Enertec",
    specs: { Model: model, V: v, Ah: ah, "L×W×H mm": dims(l, w, h), "Mass kg": mass, Terminal: "Threaded Terminals" },
    tier2,
  })),
  ...([
    ["RTS 2.1 (984606)", "13BATRTS2/1-OPT", 6, 50, 815, 253, 90, 200, 8.3, 4214],
    ["YTS 4.2 (982924)", "13BATYTS4/2-OPT", 12, 55, 765, 254, 175, 200, 19.5, 6111],
    ["YTS 5.5 (985823)", "13BATYTS5/5-OPT", 12, 75, 975, 325, 165, 238, 26.5, 7647],
  ] as const).map(([model, code, v, ah, cca, l, w, h, mass, tier2]) => ({
    code,
    description: `Optima ${model} AGM Spiral ${v}V ${ah}Ah`,
    categoryId: "automotive",
    group: "Optima · AGM spiral",
    brand: "Optima",
    specs: { Model: model, V: v, Ah: ah, CCA: cca, "L×W×H mm": dims(l, w, h), Terminal: "LHP Tapered", "Mass kg": mass },
    tier2,
  })),
  ...([
    ["15BAT-24V105-CAM", "15BLI-24V105-BLP", "Power+ Series", 24, 105, 345, 180, 245, 20, 10907, null],
    // Industrial prints the Block batteries as 15BLI-36V105-BLB (36V, 385 mm, 34 kg); the Marine and
    // Lithium Only lists agree on the S-codes and specs below, so the Industrial code is kept as an alias.
    ["S38105", "15BLI-S38105-BLB", "Block Series", 38.4, 105, 460, 320, 245, 35, 14513, "15BLI-36V105-BLB"],
    ["S51105", "15BLI-S51105-BLB", "Block Series", 51.2, 105, 460, 320, 245, 45, 20538, "15BLI-48V105-BLB"],
    ["GC2-24V", "15BLI-24V60-BLG", "GC2 Series", 24, 60, 264, 180, 278, 14.6, 5550, null],
    ["GC2-36V", "15BLI-36V45-BLG", "GC2 Series", 36, 45, 264, 180, 278, 15.7, 6242, null],
    ["GC2-48V", "15BLI-48V30-BLG", "GC2 Series", 48, 30, 264, 180, 278, 14.5, 5920, null],
  ] as const).map(([model, code, series, v, ah, l, w, h, mass, tier2, alias]) => ({
    code,
    description: `Enertec ${series} LiFePO4 ${v}V ${ah}Ah`,
    categoryId: "deep-cycle",
    alsoIn: series === "GC2 Series" ? ["golf-motive"] : undefined,
    group: `Enertec · ${series} LiFePO4`,
    brand: "Enertec",
    specs: { Model: model, V: v, Ah: ah, "L×W×H mm": dims(l, w, h), "Mass kg": mass, Terminal: "M8" },
    tier2,
    aliases: alias ? [alias] : undefined,
  })),
  ...["GC", "UT"].map((variant) => ({
    code: `15BLI-MONITOR-${variant}`,
    description: `Lithium Display Monitor (${variant})`,
    categoryId: "deep-cycle",
    group: "Lithium monitors",
    brand: "Enertec",
    tier2: 389,
  })),
  ...([
    ["35CHG-24V25A", 24, 25, 3232],
    ["35CHG-24V15A", 24, 15, 2116],
    ["35CHG-36V15A", 36, 15, 2116],
    ["35CHG-48V15A", 48, 15, 2116],
    ["35CHG-24V30A", 24, 30, 2282],
    ["35CHG-36V25A", 36, 25, 2282],
    ["35CHG-48V25A", 48, 25, 2282],
  ] as const).map(([code, v, amps, tier2]) => ({
    code,
    description: `Enertec Lithium Charger ${v}V ${amps}A`,
    categoryId: "chargers",
    group: "Enertec · Lithium chargers",
    brand: "Enertec",
    specs: { V: v, Amps: amps },
    tier2,
  })),
  ...([
    ["IC650", "35CHG-24V27A-DQ", 24, 27, 4877],
    ["IC650", "35CHG-36V18A-DQ", 36, 18, 4877],
    ["IC650", "35CHG-48V13A-DQ", 48, 13, 4877],
    ["IC900", "35CHG-48V20A-DQ", 48, 20, null],
  ] as const).map(([model, code, v, amps, tier2]) => ({
    code,
    description: `Delta-Q ${model} Industrial Charger ${v}V ${amps}A`,
    categoryId: "chargers",
    group: "Delta-Q · Industrial chargers",
    brand: "Delta-Q",
    specs: { Model: model, V: v, Amps: amps },
    tier2,
  })),
];

/** The -RED code suffix is the Enertec Red range (confirmed by the Bull pricelist). */
const redBrand = (code: string) => (code.endsWith("-RED") ? "Enertec Red" : "Enertec");

const BULL_SOURCE = "Pricelist 143 · Bull · Oct 2026";

// [SABMA, item code, alternate PN, Ah, CCA SAE, L, W, TH, layout, terminal, hold-down, mass, Tier 2 (null = TBA)]
type BullRow = [string, string, string | null, number, number, number, number, number, string, string, string, number, number | null];

const bull = (rows: BullRow[], group: string, brand: string, kind: string): SeedItem[] =>
  rows.map(([sabma, code, altPn, ah, cca, l, w, h, layout, terminal, holdDown, mass, tier2]) => ({
    code,
    description: `${brand} ${sabma} ${kind}`,
    categoryId: "commercial",
    group,
    brand,
    specs: {
      SABMA: sabma, "Alt PN": altPn, Ah: ah, "CCA SAE": cca, "L×W×H mm": dims(l, w, h),
      Layout: layout, Terminal: terminal, "Hold-down": holdDown, "Mass kg": mass,
    },
    tier2,
    source: BULL_SOURCE,
  }));

const BULL_143: SeedItem[] = [
  ...bull(
    [
      ["674S", "27BAT674S-BULL", "175-4370", 110, 1100, 330, 175, 242, "LHP Middle (7)", "Stud (13)", "B01", 27, null],
      ["674P", "27BAT674P-BULL", "9X-3404", 110, 1100, 330, 175, 242, "LHP Middle (7)", "Tapered (1)", "B01", 27, null],
      ["690SHC / 698", "27BAT698-BULL", "153-5710", 205, 1400, 510, 221, 220, "RHP (4)", "Tapered (1)", "B00", 43.7, 4172],
      ["688", "27BAT688-BULL", "153-5720", 230, 1500, 516, 275, 242, "RHP (4)", "Tapered (1)", "B00", 54.9, 5352],
    ],
    "Bull · Truck JIS",
    "Bull",
    "Truck Battery (JIS)",
  ),
  ...bull(
    [
      ["674S AGM", "27BAT674SAGM-BUL", null, 90, 940, 330, 175, 242, "LHP Middle (7)", "Stud (13)", "B00", 26, null],
      ["674P AGM", "27BAT674PAGM-BUL", null, 112, 1190, 330, 175, 242, "LHP Middle (7)", "Tapered (1)", "B00", 21.8, null],
    ],
    "Bull · Truck AGM",
    "Bull",
    "Truck Battery",
  ),
  ...bull(
    [
      ["674S", "23BAT674S-RED", null, 105, 800, 330, 175, 240, "LHP Middle (7)", "Stud (13)", "B01", 24.4, 1880],
      ["674P", "23BAT674P-RED", null, 105, 800, 330, 175, 240, "LHP Middle (7)", "Tapered (1)", "B01", 24.4, 1880],
    ],
    "Enertec Red",
    "Enertec Red",
    "Truck Battery",
  ),
];

const SILVER_SOURCE = "Pricelist 143 · Enertec Silver · Oct 2026";
const R0 = "RHP (0)";
const L1 = "LHP (1)";
const L3 = "LHP (3)";
const T1 = "Tapered (1)";
const JT = "J-Tapered (3)";

// [SABMA, item code, Ah, CCA EN, CCA SAE, L, W, TH, layout, terminal, hold-down, mass, hydro eye, Tier 2 (null = TBA)]
type SilverRow = [string, string, number, number, number, number, number, number, string, string, string, number, boolean, number | null];

const SILVER_SLI: SilverRow[] = [
  ["619", "22BAT619-BLS", 45, 420, 450, 207, 175, 175, R0, T1, "B13", 11.7, true, 857],
  ["612", "22BAT612-BLS", 50, 480, 500, 207, 175, 190, R0, T1, "B13", 12.4, true, 990],
  ["616BJ", "22BAT616BJ-BLS", 40, 360, 410, 187, 134.5, 202, R0, JT, "B01", 9.8, true, 823],
  ["634 HC", "22BAT634-BLS", 50, 420, 450, 237, 128, 222, L1, T1, "B00", 12.5, true, 1022],
  ["634J HC", "22BAT634J-BLS", 50, 420, 450, 237, 128, 222, L1, JT, "B00", 12.5, true, 1022],
  ["636 HC", "22BAT636-BLS", 50, 420, 450, 237, 128, 222, R0, T1, "B00", 12.5, true, 1022],
  ["636J HC", "22BAT636J-BLS", 50, 420, 450, 237, 128, 222, R0, JT, "B00", 12.5, true, 1022],
  ["646 HC", "22BAT646-BLS", 63, 550, 600, 242, 175, 190, R0, T1, "B13", 14.4, true, 1220],
  ["638 HC", "22BAT638-BLS", 70, 520, 550, 256, 170, 225, L1, T1, "B00", 16.9, true, 1224],
  ["638 HC", "22BAT638B-BLS", 70, 520, 550, 256, 173, 225, L1, T1, "B02", 16.9, true, 1224],
  ["639 HC", "22BAT639-BLS", 70, 520, 550, 256, 170, 225, R0, T1, "B00", 16.9, true, 1224],
  ["639 HC", "22BAT639B-BLS", 70, 520, 550, 256, 173, 225, R0, T1, "B02", 16.9, true, 1224],
  ["652 HC", "22BAT652-BLS", 74, 680, 750, 278, 175, 190, R0, T1, "B13", 17.4, true, 1378],
  ["657 HC", "22BAT657-BLS", 74, 680, 750, 278, 175, 190, L1, T1, "B13", 17.4, true, 1378],
  ["659", "22BAT659-BLS", 85, 740, 780, 315, 175, 175, R0, T1, "B13", 19.1, true, 1596],
  ["668", "22BAT668-BLS", 90, 760, 800, 315, 175, 190, R0, T1, "B13", 19.6, true, 1771],
  ["650 HC", "22BAT650-BLS", 92, 680, 750, 305, 171, 225, L1, T1, "B00", 20.1, true, 1771],
  ["650 HC", "22BAT650B-BLS", 92, 680, 750, 305, 171, 225, L1, T1, "B01", 20.1, true, 1771],
  ["656 HC", "22BAT656-BLS", 92, 680, 750, 305, 171, 225, R0, T1, "B00", 20.1, true, 1771],
  ["656 HC", "22BAT656B-BLS", 92, 680, 750, 305, 171, 225, R0, T1, "B01", 20.1, true, 1771],
  ["658", "22BAT658-BLS", 100, 860, 900, 353, 175, 190, R0, T1, "B13", 22.1, true, 1761],
  ["660", "22BAT660-BLS", 110, 940, 1000, 394, 175, 190, R0, T1, "B13", 24.4, true, 2069],
];

const SILVER_EFB: SilverRow[] = [
  ["612 EFB", "22BAT612EFB-BLS", 50, 540, 600, 207, 175, 190, R0, T1, "B13", 15.2, true, 1518],
  ["646 EFB", "22BAT646EFB-BLS", 60, 640, 700, 242, 175, 190, R0, T1, "B13", 17.56, true, 1635],
  ["621 EFB", "22BAT621EFB-BLS", 65, 600, 650, 229, 171, 222, R0, T1, "B00", 17.9, true, 1532],
  ["621B EFB", "22BAT621BEFB-BLS", 65, 600, 650, 229, 175, 222, R0, T1, "B01", 17.9, true, 1532],
  ["639 EFB", "22BAT639EFB-BLS", 70, 645, 710, 260, 172, 222, R0, T1, "B07", 19.7, true, 1738],
  ["651 EFB", "22BAT651EFB-BLS", 70, 640, 700, 278, 175, 175, R0, T1, "B13", 16.3, true, 1721],
  ["652 EFB", "22BAT652EFB-BLS", 70, 680, 750, 278, 175, 190, R0, T1, "B13", 20.4, true, 1807],
  ["659 EFB", "22BAT659EFB-BLS", 75, 680, 750, 315, 175, 175, R0, T1, "B13", 21.1, true, 1897],
  ["656 EFB", "22BAT656EFB-BLS", 80, 680, 750, 305, 171, 222, R0, T1, "B03", 22.1, true, 1931],
  ["668 EFB", "22BAT668EFB-BLS", 80, 750, 800, 315, 175, 190, R0, T1, "B13", 22.9, true, 1993],
];

const SILVER_AGM: SilverRow[] = [
  ["L0 AGM", "22BATL0AGM-BLS", 40, 420, 460, 175, 175, 168, R0, T1, "B13", 12.1, false, 1532],
  ["612 AGM", "22BAT612AGM-BLS", 50, 570, 630, 207, 175, 190, R0, T1, "B13", 15.3, false, 1974],
  ["636 AGM", "22BAT636AGM-BLS", 45, 390, 430, 237, 128, 220, R0, T1, "B00", 12.9, false, null],
  ["646 AGM", "22BAT646AGM-BLS", 60, 640, 700, 242, 175, 190, R0, T1, "B13", 17.2, false, 2133],
  ["652 AGM", "22BAT652AGM-BLS", 70, 760, 800, 278, 175, 190, R0, T1, "B13", 20, false, 2444],
  ["668 AGM", "22BAT668AGM-BLS", 80, 800, 870, 315, 175, 190, R0, T1, "B13", 22.6, false, 2718],
  ["669 AGM", "22BAT669AGM-BLS", 80, 800, 870, 315, 175, 190, L1, T1, "B13", 22.6, false, 2718],
  ["658 AGM", "22BAT658AGM-BLS", 95, 860, 940, 353, 175, 190, R0, T1, "B13", 26.1, false, 3159],
  ["660 AGM", "22BAT660AGM-BLS", 105, 950, 1050, 394, 175, 190, R0, T1, "B13", 29.8, false, 3518],
];

const SILVER_TRUCK_SLI: SilverRow[] = [
  ["686", "26BAT686-BLS", 140, 950, 1025, 505, 183, 220, L3, T1, "B00", 33.1, true, 2593],
  ["696", "26BAT696-BLS", 185, 1040, 1100, 510, 221, 220, L3, T1, "B00", 41.1, true, 3250],
  ["695", "26BAT695-BLS", 225, 1200, 1300, 516, 275, 242, L3, T1, "B00", 54.5, true, 4575],
  ["695 HC", "26BAT695HC-BLS", 240, 1360, 1450, 516, 275, 242, L3, T1, "B00", 55.5, true, 4680],
];

const SILVER_TRUCK_EFB: SilverRow[] = [
  ["696 EFB", "26BAT696EFB-BLS", 190, 1000, 1050, 510, 221, 200, L3, T1, "B00", 44, true, 4190],
  ["695 EFB", "26BAT695HCEFB-BS", 240, 1200, 1300, 516, 275, 242, L3, T1, "B00", 58.5, true, 4895],
];

const SILVER_TRUCK_AGM: SilverRow[] = [
  ["674 AGM", "26BAT674AGM-BLS", 90, 860, 940, 331, 175, 240, "LHP Middle (7)", T1, "B00", 26.2, false, null],
  ["695 AGM", "26BAT695HCAGM-BLS", 240, 1080, 1150, 516, 275, 242, L3, T1, "B00", 66, false, null],
];

const silver = (rows: SilverRow[], categoryId: string, group: string, kind: string): SeedItem[] =>
  rows.map(([sabma, code, ah, ccaEn, ccaSae, l, w, h, layout, terminal, holdDown, mass, eye, tier2]) => ({
    code,
    description: `Enertec Silver ${sabma} ${kind}`,
    categoryId,
    group,
    brand: "Enertec Silver",
    specs: {
      SABMA: sabma, Ah: ah, "CCA EN": ccaEn, "CCA SAE": ccaSae, "L×W×H mm": dims(l, w, h),
      Layout: layout, Terminal: terminal, "Hold-down": holdDown, "Mass kg": mass, "Hydro eye": eye ? "Yes" : "No",
    },
    tier2,
    source: SILVER_SOURCE,
  }));

const SILVER_AUTOMOTIVE_143: SeedItem[] = [
  ...silver(SILVER_SLI, "automotive", "Enertec Silver · SLI", "Automotive SLI Battery"),
  ...silver(SILVER_EFB, "automotive", "Enertec Silver · EFB", "Automotive EFB Battery"),
  ...silver(SILVER_AGM, "automotive", "Enertec Silver · AGM", "Automotive AGM Battery"),
];

const SILVER_TRUCK_143: SeedItem[] = [
  ...silver(SILVER_TRUCK_SLI, "commercial", "Enertec Silver · Truck SLI", "Truck SLI Battery"),
  ...silver(SILVER_TRUCK_EFB, "commercial", "Enertec Silver · Truck EFB", "Truck EFB Battery"),
  ...silver(SILVER_TRUCK_AGM, "commercial", "Enertec Silver · Truck AGM", "Truck AGM Battery"),
];

const ENERGIZER_SOURCE = "Pricelist 143 · Energizer · Oct 2026";
const D = true;

// [SABMA, item code, discontinued, Ah, CCA, L, W, TH, mass, layout, terminal, Tier 2]
type EnergizerRow = [string, string, boolean, number, number, number, number, number, number, string | null, string, number];

const ENERGIZER_AUTO: EnergizerRow[] = [
  ["305 (6 Volt)", "11BAT305-ENG", D, 70, 300, 175, 167, 220, 9.35, "RHP (0)", "Tapered", 2082],
  ["313 (6 Volt)", "11BAT313-ENG", D, 112, 510, 260, 175, 238, 16.5, "RHP (0)", "Tapered", 2474],
  ["612", "11BAT612-ENG", false, 45, 400, 207, 175, 190, 11.57, "RHP (0)", "Tapered", 990],
  ["615", "11BAT615J-ENG", false, 35, 300, 187, 127, 227, 9.31, "LHP (1)", "J Tapered (3)", 812],
  ["616", "11BAT616J-ENG", false, 35, 300, 187, 127, 227, 9.31, "RHP (0)", "J Tapered (3)", 812],
  ["616", "11BAT616BJ-ENG", false, 35, 300, 187, 140, 227, 9.24, "RHP (0)", "J Tapered (3)", 812],
  ["618", "11BAT618-ENG", D, 35, 330, 207, 175, 175, 10.12, "RHP (0)", "Tapered", 879],
  ["619HC", "11BAT619-ENG", false, 41, 360, 207, 175, 175, 11.05, "RHP (0)", "Tapered", 861],
  ["621", "11BAT621-ENG", false, 60, 510, 232, 173, 225, 14.05, "RHP (0)", "Tapered", 1363],
  ["622", "11BAT622-ENG", false, 60, 510, 232, 173, 225, 14.05, "LHP (1)", "Tapered", 1363],
  ["628", "11BAT628-ENG", false, 53, 470, 242, 175, 175, 12.85, "RHP (0)", "Tapered", 1069],
  ["634", "11BAT634-ENG", D, 45, 330, 238, 129, 227, 11.35, "LHP (1)", "Tapered", 1013],
  ["634 J", "11BAT634J-ENG", D, 45, 330, 238, 129, 227, 11.35, "LHP (1)", "J Tapered (3)", 1013],
  ["636", "11BAT636-ENG", D, 45, 330, 238, 129, 227, 11.35, "RHP (0)", "Tapered", 1013],
  ["636 J", "11BAT636J-ENG", D, 45, 330, 238, 129, 227, 11.35, "RHP (0)", "J Tapered (3)", 1013],
  ["638HC", "11BAT638-ENG", false, 68, 550, 261, 175, 225, 15.59, "LHP (1)", "Tapered", 1224],
  ["639HC", "11BAT639-ENG", false, 68, 550, 261, 175, 225, 15.59, "RHP (0)", "Tapered", 1224],
  ["643", "11BAT643-ENG", D, 60, 540, 242, 175, 190, 14.28, "LHP (1)", "Tapered", 1221],
  ["646HC", "11BAT646-ENG", false, 60, 540, 242, 175, 190, 14.28, "RHP (0)", "Tapered", 1225],
  ["647", "11BAT647-ENG", false, 70, 640, 278, 175, 175, 15.72, "RHP (0)", "Tapered", 1333],
  ["650HC", "11BAT650-ENG", false, 95, 830, 306, 173, 225, 19.68, "LHP (1)", "Tapered", 2034],
  ["652HC", "11BAT652-ENG", false, 74, 680, 278, 175, 190, 17.02, "RHP (0)", "Tapered", 1465],
  ["656HC", "11BAT656-ENG", false, 95, 830, 306, 173, 225, 19.68, "RHP (0)", "Tapered", 2085],
  ["657", "11BAT657-ENG", false, 70, 640, 278, 175, 190, 16.45, "LHP (1)", "Tapered", 1378],
  ["659", "11BAT659-ENG", false, 80, 740, 315, 175, 175, 17.82, "RHP (0)", "Tapered", 1596],
  ["668", "11BAT668-ENG", false, 80, 630, 315, 175, 190, 18.95, "RHP (0)", "Tapered", 1771],
  ["654", "11BAT654-ENG", D, 83, 720, 353, 175, 175, 19.24, "RHP (0)", "Tapered", 1824],
  ["658HC", "11BAT658-ENG", false, 100, 830, 353, 175, 190, 21.71, "RHP (0)", "Tapered", 1967],
  ["660", "11BAT660-ENG", false, 110, 920, 393, 175, 190, 23.91, "RHP (0)", "Tapered", 2345],
];

const ENERGIZER_AGM: EnergizerRow[] = [
  ["646 AGM", "11BAT646AGM-ENG", false, 60, 680, 242, 175, 190, 17.59, "RHP (0)", "Tapered", 2295],
  ["652 AGM", "11BAT652AGM-ENG", false, 70, 760, 278, 175, 190, 20.3, "RHP (0)", "Tapered", 2569],
  ["668 AGM", "11BAT668AGM-ENG", false, 80, 800, 315, 175, 190, 22.93, "RHP (0)", "Tapered", 2925],
  ["658 AGM", "11BAT658AGM-ENG", false, 95, 850, 353, 175, 190, 26.13, "RHP (0)", "Tapered", 3314],
  ["660 AGM", "11BAT660AGM-ENG", false, 105, 950, 394, 175, 190, 28.52, "RHP (0)", "Tapered", 3615],
];

const ENERGIZER_COMMERCIAL: EnergizerRow[] = [
  ["674 Stud", "23BAT674S-ENG", false, 105, 800, 330, 172, 240, 23.14, null, "Threaded / Stud Terminal", 1880],
  ["674 Pole", "23BAT674P-ENG", false, 105, 800, 330, 172, 240, 23.14, null, "Tapered Terminal", 1880],
  ["682", "23BAT682-ENG", D, 120, 680, 513, 188, 223, 33.8, "RHP (4)", "Tapered", 2653],
  ["683", "23BAT683-ENG", false, 120, 680, 513, 188, 223, 33.2, "LHP (3)", "Tapered", 2653],
  ["686", "23BAT686-ENG", false, 140, 800, 513, 189, 223, 34.69, "LHP (3)", "Tapered", 2995],
  ["690", "23BAT690-ENG", D, 150, 860, 513, 222, 223, 41.43, "RHP (4)", "Tapered", 3442],
  ["689", "23BAT689-ENG", false, 155, 900, 513, 222, 223, 41.43, "LHP (3)", "Tapered", 3155],
  ["692", "23BAT692-ENG", false, 170, 1000, 513, 223, 223, 43.93, "LHP (3)", "Tapered", 3595],
  ["696SHC", "23BAT696SHC-ENG", false, 180, 1400, 513, 223, 217, 46.42, "LHP (3)", "Tapered", 3995],
  ["696", "23BAT696-ENG", false, 180, 1000, 513, 223, 223, 44.64, "LHP (3)", "Tapered", 3550],
  ["688", "23BAT688-ENG", D, 200, 1000, 518, 274, 242, 53.8, "RHP (4)", "Tapered", 4294],
  ["695", "23BAT695-ENG", false, 200, 1050, 518, 274, 242, 53.61, "LHP (3)", "Tapered", 4250],
  ["695SHC", "23BAT695SHC-ENG", false, 225, 1150, 513, 223, 217, 56.77, "LHP (3)", "Tapered", 4650],
];

const energizer = (rows: EnergizerRow[], categoryId: string, group: string, kind: string): SeedItem[] =>
  rows.map(([sabma, code, discontinued, ah, cca, l, w, h, mass, layout, terminal, tier2]) => ({
    code,
    description: `Energizer ${sabma} ${kind}`,
    categoryId,
    group,
    brand: "Energizer",
    specs: {
      SABMA: sabma, Ah: ah, CCA: cca, "L×W×H mm": dims(l, w, h),
      Layout: layout, Terminal: terminal, "Mass kg": mass,
    },
    tier2,
    source: ENERGIZER_SOURCE,
    discontinued: discontinued || undefined,
  }));

const ENERGIZER_AUTOMOTIVE_143: SeedItem[] = [
  ...energizer(ENERGIZER_AUTO, "automotive", "Energizer", "Automotive Battery"),
  ...energizer(ENERGIZER_AGM, "automotive", "Energizer · Automotive AGM", "Automotive AGM Battery"),
];
const ENERGIZER_COMMERCIAL_143 = energizer(ENERGIZER_COMMERCIAL, "commercial", "Energizer · Commercial", "Commercial Battery");

const MOTO_SOURCE = "Pricelist 143 · Motorcycle · Oct 2026";
const RHP = "RHP";
const LHP = "LHP";

// [model, item code, discontinued, Ah (10hr), CCA SAE (-18°C), charge current A, L, W, H, TH, mass, per carton, layout, Tier 2]
type MotoRow = [string, string, boolean, number, number, number | null, number, number, number, number, number, number, string, number];

const MOTO_AGM: MotoRow[] = [
  ["12N53B", "18BAT-12N53B-EN", false, 5, 55, 0.5, 119, 60, 129, 129, 1.77, 10, RHP, 244],
  ["12N73B", "18BAT-12N73B-EN", false, 7, 75, 0.65, 137, 76, 128, 128, 2.54, 10, RHP, 298],
  ["12N7A-3A", "18BAT-12N7A-3A-E", false, 7, 75, 0.7, 148, 60, 128, 128, 2.18, 10, RHP, 292],
  ["12N74A", "18BAT-12N74A-EN", false, 7, 75, 0.65, 137, 76, 128, 128, 2.54, 10, LHP, 301],
  ["12N93B", "18BAT-12N93B-EN", false, 9, 100, 0.8, 137, 76, 134, 134, 2.8, 10, RHP, 345],
  ["12N94M1", "18BAT-12N94M1-EN", false, 9, 100, 0.9, 137, 76, 134, 134, 2.8, 10, LHP, 354],
  ["12N103A", "18BAT-12N103A-EN", D, 11, 120, 1.1, 132, 88, 145, 145, 3.5, 6, RHP, 490],
  ["12N12A41", "18BAT-12N12A41-E", false, 12, 140, 1.2, 134, 78, 156, 156, 3.63, 8, LHP, 530],
  ["12N143A", "18BAT-12N143A-EN", false, 14, 185, 1.4, 132, 88, 163, 163, 4.54, 8, LHP, 572],
  ["4LBS", "18BAT-4LBS-ENT", false, 4, 45, 0.35, 113, 70, 86, 86, 1.3, 10, RHP, 198],
  ["5LBS", "18BAT-5LBS-ENT", false, 5, 55, 0.5, 113, 70, 107, 107, 1.64, 10, RHP, 255],
  ["6.5LBS", "18BAT-6.5LBS-ENT", false, 6.5, 75, 0.6, 138, 65, 100, 100, 1.92, 10, RHP, 263],
  ["7LBS", "18BAT-7LBS-ENT", false, 7, 75, 0.6, 113, 70, 130, 130, 2.15, 10, RHP, 290],
  ["7ABS", "18BAT-7ABS-ENT", false, 7, 90, 0.6, 150, 86, 94, 94, 2.4, 10, LHP, 301],
  ["9BS", "18BAT-9BS-ENT", false, 9, 100, 0.75, 150, 86, 107, 107, 2.72, 10, LHP, 341],
  ["12BS", "18BAT-12BS-ENT", false, 12, 130, 1.2, 150, 86, 130, 130, 3.72, 4, LHP, 494],
  ["14BS", "18BAT-14BS-ENT", false, 14, 150, 1.2, 150, 86, 145, 145, 4.4, 4, LHP, 539],
  ["14LBS", "18BAT-14LBS-ENT", false, 14, 150, 1.4, 150, 86, 145, 145, 4.4, 4, RHP, 570],
  ["14AHBS", "18BAT-14AHBS-ENT", false, 14, 185, 1.4, 132, 88, 163, 163, 4.54, 4, LHP, 621],
  ["16BS", "18BAT-16BS-ENT", false, 16, 240, 1.6, 150, 86, 161, 161, 5.45, 4, LHP, 759],
  ["20BS", "18BAT-20BS-ENT", false, 20, 270, 2, 177, 88, 155, 155, 6.2, 4, LHP, 854],
  ["20LBS", "18BAT-20LBS-ENT", false, 20, 270, 2, 177, 88, 155, 155, 6.2, 4, RHP, 852],
  ["20HLBS", "18BAT-20HLBS-ENT", false, 20, 310, 2, 177, 88, 155, 155, 6.46, 4, RHP, 843],
  ["KIX30L", "18BAT-KIX30L-ENT", false, 30, 400, 3, 166, 127, 175, 175, 9.52, 2, RHP, 1416],
  ["YB3LB", "18BAT-YB3LB-ENT", D, 3, 35, 1.12, 98, 56, 109, 109, 1.19, 10, RHP, 176],
  ["YB12ALA", "18BAT-YB12ALA-EN", false, 12, 140, 1.2, 134, 78, 156, 156, 3.63, 8, RHP, 704],
  ["YB14LA2", "18BAT-YB14LA2-EN", false, 14, 185, 1.4, 132, 88, 163, 163, 4.54, 4, RHP, 589],
  ["YB30CLB", "18BAT-YB30CLB-EN", D, 30, 400, 3, 166, 127, 175, 175, 9.52, 2, RHP, 1401],
  ["YT9B4", "18BAT-YT9B4-ENT", false, 9, 100, 0.9, 150, 70, 105, 105, 2.61, 8, LHP, 382],
  ["KTZ7S", "18BAT-KTZ7S-ENT", false, 6.5, 110, 0.65, 113, 70, 105, 105, 2.2, 10, RHP, 308],
  ["KTZ10S", "18BAT-KTZ10S-ENT", false, 8.6, 170, 0.86, 150, 86, 93, 93, 3.14, 8, LHP, 407],
  ["KTZ14S", "18BAT-KTZ14S-ENT", false, 11.2, 210, 1.12, 150, 86, 110, 110, 3.9, 8, LHP, 482],
  ["KT12ABS", "18BAT-KT12ABS-EN", false, 11.2, 190, 1.05, 150, 86, 104, 104, 3.65, 8, LHP, 453],
];

const MOTO_IGEL: MotoRow[] = [
  ["5LBSG", "18BMO-5LBSG-OUT", false, 5, 125, null, 113, 70, 106, 106, 1.64, 10, RHP, 275],
  ["6.5LBSG", "18BMO-6.5LBSG-OU", false, 6.5, 140, null, 138, 65, 100, 100, 1.91, 10, RHP, 285],
  ["7ABSG", "18BMO-7ABSG-OUT", false, 7, 180, null, 150, 86, 94, 94, 2.4, 8, LHP, 336],
  ["7LBSG", "18BMO-7LBSG-OUT", false, 6.5, 135, null, 113, 70, 130, 130, 2.15, 8, RHP, 312],
  ["14AHBSG", "18BMO-14AHBSG-OU", false, 14, 285, null, 132, 88, 163, 163, 4.54, 8, LHP, 672],
  ["12BSG", "18BMO-12BSG-OUT", false, 12, 200, null, 150, 86, 110, 110, 3.9, 6, LHP, 535],
  ["14SBSG", "18BMO-14SBSG-OUT", false, 11.2, 380, null, 150, 86, 94, 94, 2.4, 8, LHP, 565],
  ["4LBSG", "18BMO-4LBSG-OUT", false, 3.5, 115, null, 113, 70, 85, 85, 1.3, 10, RHP, 214],
  ["7SBSG", "18BMO-7SBSG-OUT", false, 6.5, 220, null, 113, 70, 105, 105, 2.2, 10, RHP, 356],
  ["9BSG", "18BMO-9BSG-OUT", false, 9, 180, null, 137, 76, 134, 134, 2.8, 8, LHP, 396],
];

const moto = (rows: MotoRow[], group: string, brand: string | undefined, kind: string): SeedItem[] =>
  rows.map(([model, code, discontinued, ah, cca, charge, l, w, h, th, mass, perCtn, layout, tier2]) => ({
    code,
    description: `${kind} ${model} 12V ${ah}Ah`,
    categoryId: "motorcycle",
    group,
    brand,
    specs: {
      Model: model, "Ah 10hr": ah, "CCA SAE": cca, "Charge A": charge, "L×W×H mm": dims(l, w, h), "TH mm": th,
      "Mass kg": mass, "Per ctn": perCtn, Layout: layout, Terminal: "Flat Lug",
    },
    tier2,
    source: MOTO_SOURCE,
    discontinued: discontinued || undefined,
  }));

const MOTO_143: SeedItem[] = [
  ...moto(MOTO_AGM, "Enertec · Motorcycle AGM", "Enertec", "Enertec Motorcycle AGM Battery"),
  ...moto(MOTO_IGEL, "iGel · Motorcycle with charge indicator", undefined, "iGel Motorcycle Battery"),
];

const MARINE_SOURCE = "Pricelist 143 · Marine & Leisure · Oct 2026";
const SMALL_TAB = "Small push-on tab (F1)";

const lithium = (code: string, group: string, v: number, ah: number, d: [number, number, number], mass: number, terminal: string, tier2: number): SeedItem => ({
  code,
  description: `Enertec ${group === "LiFePO4" ? "" : `${group} `}LiFePO4 ${v}V ${ah}Ah`,
  categoryId: "deep-cycle",
  alsoIn: ["marine"],
  group: `Enertec · ${group === "LiFePO4" ? "" : `${group} `}LiFePO4`,
  brand: "Enertec",
  specs: { V: v, Ah: ah, "L×W×H mm": dims(...d), "Mass kg": mass, Terminal: terminal },
  tier2,
  source: MARINE_SOURCE,
});

const MARINE_143: SeedItem[] = [
  // [model, item code, V, Ah, RC (min @25A), CCA, L, W, H, foot piece, mass, terminal, Tier 2]
  ...([
    ["M24", "13BAT-M24-BLD", 12, 80, 145, 670, 260, 172, 226, true, 19.2, "Dual Terminal", 1521],
    ["M27", "13BAT-M27-BLD", 12, 95, 170, 760, 305, 171, 226, true, 22.4, "Dual Terminal", 1760],
    ["M31", "13BAT-M31-BLD", 12, 110, null, 900, 330, 175, 219, false, 26, "Dual Terminal", 2022],
    ["674D", "23BAT674D-RED", 12, 105, null, 800, 330, 172, 240, false, 23.14, "Tapered Terminals", 2081],
    ["674DS", "23BAT674DS-RED", 12, 105, null, 800, 330, 172, 240, false, 23.14, "Threaded Terminals", 2081],
  ] as const).map(([model, code, v, ah, rc, cca, l, w, h, foot, mass, terminal, tier2]) => ({
    code,
    description: `${redBrand(code)} ${model} Marine / Leisure Deep Cycle ${v}V ${ah}Ah`,
    categoryId: "marine",
    alsoIn: ["deep-cycle"],
    group: "Enertec · Marine / leisure deep cycle",
    brand: redBrand(code),
    specs: {
      Model: model, V: v, Ah: ah, "Min @25A": rc, CCA: cca,
      "L×W×H mm": dims(l, w, h), "Foot piece": foot ? "Yes" : null, "Mass kg": mass, Terminal: terminal,
    },
    tier2,
    source: MARINE_SOURCE,
  })),
  lithium("15BAT-LITH06", "LiFePO4", 12, 6, [151, 65, 94], 0.8, SMALL_TAB, 666),
  lithium("15BAT-LITH36100", "LiFePO4", 36, 100, [510, 325, 215], 37.5, "M8", 19545),
  lithium("15BLI-12V100-BLS", "Blade Series", 12.8, 100, [573, 376.5, 55.5], 15, "M8", 5699),
  lithium("15BLI-12V200-BLS", "Blade Series", 12.8, 200, [581, 326, 110], 30, "M8", 10750),
  lithium("15BLI-12V80-BLP", "Power+ Series", 12, 80, [260, 167, 210], 9, "M8", 4457),
  lithium("15BLI-12V105-BLP", "Power+ Series", 12, 105, [330, 172, 215], 9, "M8", 5041),
  lithium("15BLI-12V210-BLP", "Power+ Series", 12, 210, [363, 212, 230], 20, "M8", 10763),
  lithium("15BLI-12V10-BLP", "Power+ Series", 12, 10, [151, 99, 94], 1.1, "M5", 594),
  lithium("15BLI-12V20-BLP", "Power+ Series", 12, 20, [181, 77, 165], 2.5, "M8", 1100),
  lithium("15BLI-12V52-BLP", "Power+ Series", 12, 52, [195, 133, 171], 5.3, "M8", 2648),
  lithium("15BLI-12V135-BLP", "Power+ Series", 12, 135, [230, 174, 200], 12.5, "M8", 5896),
  lithium("15BLI-12V320-BLP", "Power+ Series", 12, 320, [345, 190, 245], 27.5, "M8", 12808),
  lithium("15BLI-12V100-BLL", "Power Lite Series", 12, 100, [330, 172, 215], 9, "M8", 3461),
  ...([
    ["7L", "18BAT-PLFP-7L", 2, 140, 107, 56, 85, 0.7, "RHP", 733, "YTZ5S / YTZ7S / YTX7L-BS / YTX4L-BS / YTX5L-BS / YB6.5L-B"],
    ["14BR", "18BAT-PLFP-14BR", 4, 280, 134, 65, 92, 1.15, "LHP", 1230, "YT7-BS / YT9-BS / YTX9-BS / YTX7A-BS / YTZ10S / YT12B-BS / YT14B-BS / YTX14AH-BS / 12N12A-4A"],
    ["20L", "18BAT-PLFP-20L", 6, 360, 148, 86, 105, 1.45, "RHP", 1486, "YTX14L-BS / YTX20L-BS / YTX20HL-BS / YTX24HL-BS"],
  ] as const).map(([model, code, ah, cca, l, w, h, mass, layout, tier2, replaces]) => ({
    code,
    description: `Poweroad PLFP-${model} Lithium Motorcycle Battery 12V ${ah}Ah`,
    categoryId: "motorcycle",
    alsoIn: ["marine"],
    group: "Poweroad · Lithium motorcycle",
    brand: "Poweroad",
    specs: {
      Model: `PLFP-${model}`, V: 12, Ah: ah, CCA: cca, "L×W×H mm": dims(l, w, h), "Mass kg": mass,
      Layout: layout, Terminal: "Flat Lug", Replaces: replaces,
    },
    tier2,
    source: MARINE_SOURCE,
  })),
  ...([
    ["52SLR-110WFP-KIT", 110, 4157],
    ["52SLR-130W-KIT", 130, 4897],
  ] as const).map(([code, watts, tier2]) => ({
    code,
    description: `${watts}W Foldable Solar Panel Kit (incl. 10A MPPT controller with 10 m cable)`,
    categoryId: "deep-cycle",
    alsoIn: ["marine"],
    group: "Enertec Solar · Foldable panels",
    brand: "Enertec Solar",
    specs: { Watts: `${watts} W`, Controller: "10A MPPT", Cable: "10 m" },
    tier2,
    source: MARINE_SOURCE,
  })),
];

const VRLA_SOURCE = "Pricelist 143 · VRLA · Oct 2026";
const SPADE_T1 = "T1 - 4.8mm spade";
const BOLT_E = "E-Type Bolt through";
const PUSH_BI = "Push on Tab - Bi Directional";

// [factory code, item code, Ah (20hr), V, L, W, H, TH, mass, per carton, terminal, Tier 2 (null = TBA), garage door]
type VrlaRow = [string, string, number, number, number, number, number, number, number, number | null, string, number | null, boolean?];

const VRLA_AGM: VrlaRow[] = [
  ["24V3.5", "18BAT-24V3/5LOOM", 3.5, 24, 190, 74, 70, 70, 2.32, null, PUSH_BI, 342, true],
  ["24V5", "18BAT-24V5-FBC", 5, 24, 140, 90, 103, 109, 3.15, null, PUSH_BI, 351, true],
  ["6V1.4", "18BAT-6V1/4-FBC", 1.4, 6, 97, 24, 51, 57, 0.26, 20, SPADE_T1, 60],
  ["6V4.5", "18BAT-6V4/5-FBC", 4.5, 6, 70, 48, 101, 107, 0.73, 20, SPADE_T1, 75],
  ["6V10", "18BAT-6V10-FBT", 10, 6, 151, 50, 94, 100, 1.59, 10, SPADE_T1, 173],
  ["12V1.4", "18BAT-12V1/4-FBC", 1.4, 12, 97, 43, 51, 57, 0.49, 20, SPADE_T1, 94],
  ["12V2.3", "18BAT-12V2/3-FBT", 2.3, 12, 182, 23.7, 61.7, 61.7, 0.725, null, PUSH_BI, null, true],
  ["12V2.4", "18BAT-12V2/4-FBC", 2.4, 12, 178, 35, 61, 67, 0.88, 20, SPADE_T1, 130],
  ["12V4.5", "18BAT-12V4/5-FBC", 4.5, 12, 90, 70, 101, 107, 1.44, 10, SPADE_T1, 139],
  ["12V7.2", "18BAT-12V7/2-FBC", 7.2, 12, 151, 65, 94, 101, 2.05, 6, SPADE_T1, 149],
  ["12V7.2", "18BAT-12V7/2L-FC", 7.2, 12, 151, 65, 94, 101, 2.05, 6, "F2 Large - 6.35mm spade", 149],
  ["12V9", "18BAT-12V9-FBC", 9, 12, 151, 65, 94, 100, 2.4, 10, SPADE_T1, 235],
  ["12V12", "18BAT-12V12-FBC", 12, 12, 151, 98, 95, 101, 3.45, 4, SPADE_T1, 349],
  ["12V18", "18BAT-12V18-FBC", 17, 12, 180, 77, 167, 167, 5.13, 4, BOLT_E, 480],
  ["12V24", "18BAT-12V24-FBC", 24, 12, 166, 175, 126, 126, 7.51, 2, BOLT_E, 740],
  ["12V26", "18BAT-12V26-FBC", 26, 12, 166, 175, 125, 126, 8.15, 2, BOLT_E, null],
  ["12V40", "18BAT-12V40-FBC", 40, 12, 196, 166, 168, 177, 12.5, 2, "M6 Threaded Screw In", 1125],
  ["12V65", "18BAT-12V65-FBT", 65, 12, 349, 166, 174, 174, 20.5, 1, "M6 Threaded Screw In", 2070],
  ["12V70", "18BAT-12V70-FBT", 70, 12, 260, 169, 215, 221, 21.4, 1, "M6 Threaded Screw In", 2021],
  ["12V100", "18BAT-12V100-FBC", 100, 12, 333, 174, 216, 227, 29.8, 1, "M6 Threaded Screw In", 2650],
];

const VRLA_GEL: VrlaRow[] = [
  ["12V8G", "18BAT-12V8G-FBC", 8, 12, 151, 65, 95, 101, 2.6, 10, SPADE_T1, 230],
  ["12V18G", "18BAT-12V18G-FB", 18, 12, 182, 77, 166, 166, 5.18, 4, BOLT_E, 560],
  ["12V24G", "18BAT-12V24G-FBC", 24, 12, 166, 175, 126, 126, 7.57, 2, BOLT_E, null],
  ["12V26G", "18BAT-12V26G-FBT", 26, 12, 166, 175, 126, 126, 8.27, 2, BOLT_E, 1004],
  ["12V33G", "18BAT-12V33G-FBC", 33, 12, 196, 131, 163, 169, 9.85, 2, "M6 Threaded Screw In", 1075],
  ["12V100G", "18BAT-12V100G-FC", 100, 12, 330, 174, 219, 227, 30.01, 1, "M8 Threaded Screw In", 2840],
  ["12V200G", "18BAT-12V200G-FC", 200, 12, 524, 239, 218, 226, 66, 1, BOLT_E, 5725],
];

/** Small Forbatt AGMs the Marine & Leisure list also carries. */
const VRLA_ON_MARINE = new Set(["18BAT-6V4/5-FBC", "18BAT-12V7/2-FBC", "18BAT-12V12-FBC"]);

const vrla = (rows: VrlaRow[], kind: "AGM" | "Gel"): SeedItem[] =>
  rows.map(([model, code, ah, v, l, w, h, th, mass, perCtn, terminal, tier2, garage]) => {
    const alsoIn = [
      ...(VRLA_ON_MARINE.has(code) ? ["marine"] : []),
      ...(kind === "Gel" || ah >= 40 ? ["deep-cycle"] : []),
    ];
    return {
      code,
      description: `Forbatt ${kind} ${garage ? "Garage Door " : ""}Battery ${v}V ${ah}Ah`,
      categoryId: "standby",
      alsoIn: alsoIn.length ? alsoIn : undefined,
      group: `Forbatt · ${kind}${garage ? " garage door" : ""}`,
      brand: "Forbatt",
      specs: {
        Model: model, V: v, Ah: ah, "L×W×H mm": dims(l, w, h), "TH mm": th,
        "Mass kg": mass, "Per ctn": perCtn, Terminal: terminal,
      },
      tier2,
      source: VRLA_SOURCE,
    };
  });

const VRLA_143: SeedItem[] = [...vrla(VRLA_AGM, "AGM"), ...vrla(VRLA_GEL, "Gel")];

const INVERTER_SOURCE = "Pricelist 143 · Lithium Only · Oct 2026";

// [item code, description, group, brand, V, kWh, L, W, H, mass, Tier 2]; null specs = accessory with none printed
type InverterRow = [string, string, string, string, number | null, number | null, number | null, number | null, number | null, number | null, number];

const INVERTER_ROWS: InverterRow[] = [
  ["22MEG-GL48100", "Enertec Megatank 51.2V 5.12kWh Inverter Battery", "Enertec Megatank", "Enertec", 51.2, 5.12, 600, 435, 198, 52, 14500],
  ["15BAT-5.12-DEYE", "Deye BOS-G High Voltage Battery 5.12kWh", "Deye · BOS-G high voltage", "Deye", 51.2, 5.12, 570, 440, 133, 44, 19474],
  ["15BAT-BMU-DEYE", "Deye BOS-G Cluster Control Box (BMU)", "Deye · BOS-G high voltage", "Deye", null, null, null, null, null, null, 11579],
  ["15BAT-51100HV-DY", "Dyness High Voltage Battery 5.12kWh", "Dyness · High voltage", "Dyness", 51.2, 5.12, 558, 545, 190, 50, 17000],
  ["15BAT-BDU-DYNE", "Dyness HV Cluster Control Box (BDU)", "Dyness · High voltage", "Dyness", null, null, null, null, null, null, 10300],
  ["15BAT-RACK-DYNE", "Dyness HV Battery Rack (12)", "Dyness · High voltage", "Dyness", null, null, null, null, null, null, 5670],
  ["15BAT-A48100-DYN", "Dyness A48100 Low Voltage Battery 4.8kWh", "Dyness · Low voltage", "Dyness", 48, 4.8, null, null, null, null, 12890],
  ["15BAT-BX51100-DY", "Dyness BX51100 Low Voltage Battery 5.12kWh", "Dyness · Low voltage", "Dyness", 51.2, 5.12, null, null, null, null, 13021],
  ["15BAT-DL5C-DYNE", "Dyness DL5C Low Voltage Battery 5.12kWh", "Dyness · Low voltage", "Dyness", 51.2, 5.12, 558, 545, 150, 54, 10750],
  ["15BAT-PBOX-DYNE", "Dyness Power Box Pro 10.24kWh", "Dyness · Low voltage", "Dyness", 51.2, 10.24, 555, 210, 928, 103, 24000],
  ["15BAT-EP10-FOX", "Fox ESS EP10 10kWh HV Battery", "Fox ESS · High voltage", "Fox ESS", 384, 10.36, 710, 625, 147, 99, 31772],
  // Printed as 192V / 15.8 kWh; the description says 5kWh, so 15.8 is likely a typo for 5.18.
  ["15BAT-EP5-FOX", "Fox ESS EP5 5kWh HV Battery", "Fox ESS · High voltage", "Fox ESS", 192, 15.8, 380, 625, 147, 50.5, 18250],
];

const INVERTER_MODELS: Record<string, string> = {
  "22MEG-GL48100": "Megatank GL48100",
  "15BAT-5.12-DEYE": "BOS-G",
  "15BAT-51100HV-DY": "51100 HV",
  "15BAT-A48100-DYN": "A48100",
  "15BAT-BX51100-DY": "BX51100",
  "15BAT-DL5C-DYNE": "DL5C",
  "15BAT-PBOX-DYNE": "Power Box Pro",
  "15BAT-EP10-FOX": "EP10",
  "15BAT-EP5-FOX": "EP5",
};

const INVERTER_143: SeedItem[] = INVERTER_ROWS.map(([code, description, group, brand, v, kwh, l, w, h, mass, tier2]) => ({
  code,
  description,
  categoryId: "deep-cycle",
  group,
  brand,
  specs: v === null && kwh === null ? undefined : {
    Model: INVERTER_MODELS[code], V: v, kWh: kwh, "L×W×H mm": l && w && h ? dims(l, w, h) : null, "Mass kg": mass,
  },
  tier2,
  source: INVERTER_SOURCE,
}));

const CTEK_SOURCE = "Pricelist 231 · CTEK · Oct 2026";

// [item code, description, Tier 2 (null = TBA)]
type CtekRow = [string, string, number | null];

/** CTEK lines are described in prose (no spec table), so they carry no specs and the description stays visible. */
const ctek = (rows: CtekRow[], group: string, categoryId: string, alsoIn?: (code: string) => string[] | undefined): SeedItem[] =>
  rows.map(([code, description, tier2]) => ({
    code,
    description: code.startsWith("79P-") ? description : `CTEK ${description}`,
    categoryId,
    alsoIn: alsoIn?.(code),
    group,
    brand: code.startsWith("79P-") ? "Enertec" : "CTEK",
    tier2,
    source: CTEK_SOURCE,
  }));

const CTEK_MARINE = new Set(["36INT-40-315-CTK", "36INT-40-192-CTK", "36INT-40-201-CTK"]);
const onMarine = (code: string) => (CTEK_MARINE.has(code) ? ["marine"] : undefined);
const onChargers = () => ["chargers"];

const CTEK_231: SeedItem[] = [
  ...ctek([
    ["36CON-40-107-CTK", "CT5 START/STOP - 12V 3.8A Charger", 1839],
    ["36CON-40-161-CTK", "CT5 TIME TO GO - 12V 5A Charger", 1987],
    ["36CON-56-707-CTK", "XS0.8 - 12V 0.8A Charger", 982],
    ["36CON-56-309-CTK", "MXS3.8 - 12V 3.8A Charger", 1531],
    ["36CON-56-305-CTK", "MXS5.0T - 12V 5A Charger", 1830],
    ["36CON-56-731-CTK", "MXS7.0 - 12V 7A Charger / Power Supply", 3014],
    ["36CON-56-708-CTK", "MXS10 - 12V 10A Charger / Power Supply", 3673],
    ["36CON-56-899-CTK", "LITHIUM XS - 12V 5A Charger", 2555],
    ["36CON-40-330-CTK", "CS ONE EU - 12V Charger", 3474],
    ["36CON-40-462-CTK", "CS FREE - Portable Charger & 12V Power Bank", 4889],
  ], "CTEK · Consumer chargers & power bank", "chargers"),
  ...ctek([
    ["36ACC-40-468-CTK", "CS Free Bag", null],
    ["36ACC-40-463-CTK", "CS Free Solar Panel Charge Kit", 5649],
    ["36ACC-40-464-CTK", "USB-C Charge Cable 12V Plug", 488],
    ["36ACC-40-465-CTK", "USB-C Charge Cable Clamps", 488],
    ["36ACC-40-476-CTK", "CS ONE Bumper", 301],
    ["36ACC-40-375-CTK", "CS Wall Mount", 429],
    ["36ACC-40-376-CTK", "CS Connect Adapter Cable", 145],
    ["36ACC-40-377-CTK", "Quick Connector - Accessories", 194],
  ], "CTEK · CS range accessories", "accessories", onChargers),
  ...ctek([
    ["36ACC-56-259-CTK", "Comfort Connect M6 Bulk", 26],
    ["36ACC-56-260-CTK", "Comfort Connect M6", 116],
    ["36ACC-56-261-CTK", "Comfort Connect M8 Blister Pack", 105],
    ["36ACC-56-263-CTK", "Comfort Connect Cig Plug", 212],
    ["36ACC-56-573-CTK", "Comfort Connect Cig Socket", 216],
    ["36ACC-56-304-CTK", "Comfort Connect Extension 2.5m", 233],
    ["36ACC-56-329-CTK", "Comfort Connect M10", 101],
  ], "CTEK · Comfort Connect", "accessories", onChargers),
  ...ctek([
    ["36ACC-56-380-CTK", "Comfort Indicator Panel M8 1.5m", 389],
    ["36ACC-56-382-CTK", "Comfort Indicator Eyelet M8", 173],
    ["36ACC-56-384-CTK", "Comfort Indicator Clamp Bulk", 239],
    ["36ACC-56-629-CTK", "Comfort Indicator Eyelet M6", 198],
    ["36ACC-56-870-CTK", "Comfort Indicator Cig Plug", 311],
  ], "CTEK · Battery status indicators", "accessories", onChargers),
  ...ctek([
    ["36ACC-40-057-CTK", "Bumper10", 238],
    ["36ACC-56-915-CTK", "Bumper60", 200],
    ["36ACC-40-058-CTK", "Bumper100", 272],
    ["36ACC-40-059-CTK", "Bumper120", 317],
    ["36ACC-40-060-CTK", "Bumper300", 578],
  ], "CTEK · Protective bumper covers", "accessories", onChargers),
  ...ctek([
    ["36ACC-56-314-CTK", "Wall Hanger 300", 601],
    ["36ACC-40-068-CTK", "Wall Hanger PRO40/70", 1294],
    ["36ACC-40-187-CTK", "Wall Hanger PRO60", 873],
    ["79P-TRL-CTK", "Trolley for Chargers (Enertec)", null],
  ], "CTEK · Professional brackets & wall hangers", "accessories", onChargers),
  ...ctek([
    ["36EV-40-353-CTK", "NJORD GO - EV Portable Charger 11kW, 3 Phase 16A, Bluetooth, WiFi", null],
    ["36EV-910-17092-C", "STORM 2 - EV Charger 1.4 - 22kW, 3 Phase 32A, 2 Cable T2 4m", 72170],
  ], "CTEK · E-mobility (EV charging)", "chargers"),
  ...ctek([
    ["36INT-40-315-CTK", "D250SE - 12V 20A DC/DC Charger", 5011],
    // Printed with only the CTEK part number as its description.
    ["36INT-40-289-CTK", "40-678 - 12V", 4950],
  ], "CTEK · On-board DC/DC chargers", "chargers", onMarine),
  ...ctek([
    ["36INT-40-192-CTK", "M15 EU - 12V 15A Marine Charger", 3524],
    ["36INT-40-201-CTK", "M25 - 12V 25A Marine Charger", 6124],
    ["36INT-40-189-CTK", "i1225 - 12V 25A Universal Charger", 5832],
  ], "CTEK · On-board 220V AC chargers", "chargers", onMarine),
  ...ctek([
    ["36PRO-40-095-CTK", "MXS10EC - 12V 10A Charger / Power Supply", 4349],
    ["36PRO-40-194-CTK", "PRO25S - 12V 25A Charger / Power Supply", 6114],
    ["36PRO-40-197-CTK", "PRO25SE - 12V 25A Charger / Power Supply", 7981],
    ["36PRO-40-150-CTK", "PRO60 - 12V 60A Power Supply", 21181],
    ["36PRO-40-230-CTK", "PRO120 - 12V 120A Power Supply", 32230],
  ], "CTEK · Workshop chargers (12V)", "chargers"),
  ...ctek([
    ["36PRO-56-995-CTK", "MXTS40 - 12/24V 40/20A Power Supply", 13733],
    ["36PRO-56-733-CTK", "MXT4.0 - 24V 4A Charger", 3214],
    ["36PRO-56-734-CTK", "MXT14 - 24V 14A Charger", 5804],
  ], "CTEK · Workshop chargers (12/24V & 24V)", "chargers"),
  ...ctek([
    ["36DIA-40-209-CTK", "PRO Battery Tester - 12V", 11739],
    ["36DIA-40-245-CTK", "Battery Monitor Bulk - 12V", 3172],
    ["36DIA-56-924-CTK", "Battery Analyzer EN - 12V", 1561],
  ], "CTEK · Diagnostics", "testers"),
];

/** Products already seeded from other lists that the Marine & Leisure pricelist also carries. */
const ALSO_ON_MARINE = new Set([
  "12BATU1A-A-DIS", "12BAT24A-A-DIS", "12BAT27A-A-DIS", "12BAT31A-A-DIS", "12BAT12A-A-DIS",
  "21BATGC6-BLC", "21BATGC8-BLC", "21BATGC12-BLC",
  "13BATRTS2/1-OPT", "13BATYTS4/2-OPT", "13BATYTS5/5-OPT",
  "15BLI-24V105-BLP", "15BLI-S38105-BLB", "15BLI-S51105-BLB",
  "15BLI-24V60-BLG", "15BLI-36V45-BLG", "15BLI-48V30-BLG",
  "35CHG-24V15A", "35CHG-36V15A", "35CHG-48V15A", "35CHG-24V30A", "35CHG-36V25A", "35CHG-48V25A",
  "15BLI-MONITOR-GC", "15BLI-MONITOR-UT",
]);

function fromSeedItem(item: SeedItem, now: string): Product {
  const specs = item.specs
    ? Object.fromEntries(Object.entries(item.specs).flatMap(([k, v]) => (v === null ? [] : [[k, String(v)]])))
    : undefined;
  return {
    id: idFor(item.code),
    code: item.code,
    description: item.description,
    categoryId: item.categoryId,
    group: item.group,
    brand: item.brand,
    specs,
    alsoIn: item.alsoIn,
    aliases: item.aliases,
    cost: item.tier2 === null ? 0 : costFromTier2(item.tier2),
    overrides: {},
    source: item.source ?? INDUSTRIAL_SOURCE,
    isNew: false,
    discontinued: item.discontinued,
    updatedAt: now,
  };
}

/** Bump when seed products are added so existing local databases pick them up. */
export const SEED_VERSION = 17;

const costFromTier2 = (tier2: number) => Math.round((tier2 / (1 + TIER2_MARKUP / 100)) * 100) / 100;
const idFor = (code: string) => code.toLowerCase().replace(/[^a-z0-9]+/g, "-");

export function seedProducts(now = new Date().toISOString()): Product[] {
  const accessories: Product[] = PRICELIST_143.map(([code, description, categoryId, group, tier2]) => ({
    id: idFor(code),
    code,
    description,
    categoryId,
    group,
    cost: costFromTier2(tier2),
    overrides: {},
    source: SOURCE,
    isNew: code === "39PWB-18000-DHC" || code === "48TES-BT2100CT-DHC",
    updatedAt: now,
  }));

  const ebatt: Product[] = EBATT_143.map(([sabma, code, cca, l, w, th, layout, terminal, holdDown, mass, eye, tier2]) => ({
    id: idFor(code),
    code,
    description: `Ebatt ${sabma} Automotive SLI Battery`,
    categoryId: "automotive",
    group: "Ebatt",
    brand: "Ebatt",
    specs: {
      SABMA: sabma,
      "CCA SAE": String(cca),
      "L×W×H mm": `${l}×${w}×${th}`,
      Layout: layout,
      Terminal: terminal,
      "Hold-down": holdDown,
      "Mass kg": String(mass),
      "Hydro eye": eye,
    },
    cost: costFromTier2(tier2),
    overrides: {},
    source: "Pricelist 143 · Ebatt Automotive · Oct 2026",
    isNew: false,
    updatedAt: now,
  }));

  const blue = (rows: BlueRow[], categoryId: string, kind: string, list: string): Product[] =>
    rows.map(([sabma, code, ah, ccaEn, ccaSae, l, w, th, layout, terminal, holdDown, mass, tier2]) => ({
      id: idFor(code),
      code,
      description: `Enertec Blue ${sabma} ${kind} Battery`,
      categoryId,
      group: "Enertec Blue",
      brand: "Enertec Blue",
      specs: {
        SABMA: sabma,
        Ah: String(ah),
        "CCA EN": String(ccaEn),
        "CCA SAE": String(ccaSae),
        "L×W×H mm": `${l}×${w}×${th}`,
        Layout: layout,
        Terminal: terminal,
        "Hold-down": holdDown,
        "Mass kg": String(mass),
        "Hydro eye": "Yes",
      },
      cost: costFromTier2(tier2),
      overrides: {},
      source: `Pricelist 143 · Enertec Blue ${list} · Oct 2026`,
      isNew: false,
      updatedAt: now,
    }));

  return [
    ...blue(BLUE_AUTOMOTIVE_143, "automotive", "Automotive SLI", "Automotive"),
    ...SILVER_AUTOMOTIVE_143.map((item) => fromSeedItem(item, now)),
    ...ebatt,
    ...ENERGIZER_AUTOMOTIVE_143.map((item) => fromSeedItem(item, now)),
    ...blue(BLUE_TRUCK_143, "commercial", "Truck SLI", "Truck"),
    ...SILVER_TRUCK_143.map((item) => fromSeedItem(item, now)),
    ...BULL_143.map((item) => fromSeedItem(item, now)),
    ...ENERGIZER_COMMERCIAL_143.map((item) => fromSeedItem(item, now)),
    ...MOTO_143.map((item) => fromSeedItem(item, now)),
    ...MARINE_143.map((item) => fromSeedItem(item, now)),
    ...VRLA_143.map((item) => fromSeedItem(item, now)),
    ...INDUSTRIAL_143.map((item) =>
      fromSeedItem(ALSO_ON_MARINE.has(item.code) ? { ...item, alsoIn: [...(item.alsoIn ?? []), "marine"] } : item, now),
    ),
    ...INVERTER_143.map((item) => fromSeedItem(item, now)),
    ...CTEK_231.map((item) => fromSeedItem(item, now)),
    ...accessories,
  ];
}

export function buildSeed(): Database {
  const now = new Date().toISOString();
  const products = seedProducts(now).map((p) => ({ ...p, image: imageFor(p.code) }));

  return {
    settings: {
      priceListMonth: "October 2026",
      vatRate: 0.15,
      seedVersion: SEED_VERSION,
      pricelistNotes: DEFAULT_PRICELIST_NOTES,
      warrantyTerms: DEFAULT_WARRANTY_TERMS,
    },
    categories: SEED_CATEGORIES,
    tiers: TIERS,
    products,
    warrantyRules: SEED_WARRANTY_RULES,
    ranges: SEED_RANGES,
    admins: [
      { id: "adm_1", name: "Enertec Admin", email: DEMO_LOGINS.admin.email, passwordHash: hashPassword(DEMO_LOGINS.admin.password) },
    ],
    customers: [
      {
        id: "cus_abm",
        accountNo: "ABM001",
        company: "Alberton Battery Mart",
        contact: "Buyer",
        email: DEMO_LOGINS.customer.email,
        phone: "011 000 0000",
        passwordHash: hashPassword(DEMO_LOGINS.customer.password),
        tierId: "t2",
        status: "active",
        createdAt: now,
      },
      {
        id: "cus_vaal",
        accountNo: "VAE002",
        company: "Vaal Auto Electrical (demo)",
        contact: "Workshop Manager",
        email: "parts@vaalauto.example",
        phone: "016 000 0000",
        passwordHash: hashPassword("demo-t1"),
        tierId: "t1",
        status: "active",
        createdAt: now,
      },
      {
        id: "cus_fleet",
        accountNo: "HFS003",
        company: "Highveld Fleet Services (demo)",
        contact: "Procurement",
        email: "buying@highveldfleet.example",
        phone: "011 000 0001",
        passwordHash: hashPassword("demo-t3"),
        tierId: "t3",
        status: "active",
        createdAt: now,
      },
      {
        id: "cus_pending",
        accountNo: "",
        company: "Germiston Batteries (demo)",
        contact: "Owner",
        email: "info@germistonbatteries.example",
        phone: "011 000 0002",
        passwordHash: hashPassword("demo-pending"),
        tierId: null,
        status: "pending",
        createdAt: now,
      },
    ],
  };
}
