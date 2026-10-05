/**
 * Top view of the battery, front edge towards the viewer, so a counter can check polarity against
 * the vehicle before fitting. Reads the SABMA layout text, e.g. "RHP (0)" or "LHP Middle (7)".
 */
export function TerminalDiagram({ layout, terminal, holdDown }: { layout: string; terminal?: string; holdDown?: string }) {
  const positiveLeft = /LHP/i.test(layout);
  const inset = /middle/i.test(layout) ? 62 : 28;
  const left = inset;
  const right = 240 - inset;
  const pos = positiveLeft ? left : right;
  const neg = positiveLeft ? right : left;

  return (
    <figure className="rounded-lg border border-neutral-200 p-3">
      <svg viewBox="0 0 240 130" className="w-full max-w-72" role="img" aria-label={`Terminal layout ${layout}`}>
        <rect x="8" y="14" width="224" height="100" rx="6" className="fill-neutral-50 stroke-neutral-400" strokeWidth="2" />
        <rect x="8" y="104" width="224" height="10" rx="3" className="fill-neutral-200" />
        <circle cx={pos} cy="34" r="12" className="fill-alert" />
        <text x={pos} y="39" textAnchor="middle" className="fill-white text-[16px] font-bold">+</text>
        <circle cx={neg} cy="34" r="12" className="fill-ink" />
        <text x={neg} y="39" textAnchor="middle" className="fill-white text-[16px] font-bold">−</text>
        <text x="120" y="126" textAnchor="middle" className="fill-neutral-500 text-[9px] uppercase tracking-widest">Front</text>
      </svg>
      <figcaption className="mt-2 text-xs text-neutral-600">
        <span className="font-semibold text-ink">{positiveLeft ? "Positive left" : "Positive right"}</span> · Layout {layout}
        {terminal && <> · {terminal}</>}
        {holdDown && <> · Hold-down {holdDown}</>}
      </figcaption>
    </figure>
  );
}
