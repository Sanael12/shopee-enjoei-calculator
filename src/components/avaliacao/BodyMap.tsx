import { useId } from "react";
import { MEASURES, fmt, type MeasureKey, type Trend } from "@/lib/body";

type Anchor = { key: MeasureKey; x: number; y: number; side: "left" | "right" };

// Coordinates are percentages of /avaliacao/corpo.png (896x1200). The image's
// left side is the person's right side.
const ANCHORS: Anchor[] = [
  { key: "pescoco", x: 47, y: 16.5, side: "left" },
  { key: "ombros", x: 34, y: 23, side: "left" },
  { key: "bracoD", x: 31, y: 33, side: "left" },
  { key: "antebracoD", x: 27, y: 43, side: "left" },
  { key: "quadril", x: 40, y: 50, side: "left" },
  { key: "coxaD", x: 42, y: 62, side: "left" },
  { key: "panturrilhaD", x: 39, y: 77, side: "left" },
  { key: "peitoral", x: 58, y: 27, side: "right" },
  { key: "bracoE", x: 69, y: 33, side: "right" },
  { key: "abdomen", x: 52, y: 37, side: "right" },
  { key: "antebracoE", x: 73, y: 43, side: "right" },
  { key: "cintura", x: 60, y: 44, side: "right" },
  { key: "coxaE", x: 58, y: 62, side: "right" },
  { key: "panturrilhaE", x: 61, y: 77, side: "right" },
];

const IMAGE_WIDTH = (896 / 1200) * 100;
const IMAGE_LEFT = (100 - IMAGE_WIDTH) / 2;
const COLUMN = 24;

const INFO = Object.fromEntries(MEASURES.map((m) => [m.key, m])) as Record<
  MeasureKey,
  (typeof MEASURES)[number]
>;

function layout() {
  const bySide = (side: Anchor["side"]) => {
    const list = ANCHORS.filter((a) => a.side === side);
    return list.map((a, i) => ({
      ...a,
      px: IMAGE_LEFT + (a.x / 100) * IMAGE_WIDTH,
      slot: 8 + (i * 84) / (list.length - 1),
    }));
  };
  return [...bySide("left"), ...bySide("right")];
}

const POINTS = layout();

const TREND_CLS: Record<Trend, string> = {
  good: "bg-emerald-500 text-white",
  bad: "bg-red-500 text-white",
  same: "bg-white text-slate-900",
};

type Props =
  | {
      mode: "edit";
      values: Partial<Record<MeasureKey, string>>;
      onChange: (key: MeasureKey, value: string) => void;
    }
  | {
      mode: "view";
      values: Partial<Record<MeasureKey, number>>;
      trends?: Partial<Record<MeasureKey, Trend>>;
      caption: string;
    };

export function BodyMap(props: Props) {
  const markerId = useId().replace(/:/g, "");
  const compact = props.mode === "view";

  return (
    <figure className="w-full">
      <div className="relative aspect-square w-full overflow-hidden rounded-3xl bg-[#2159cf] shadow-inner">
        <img
          src="/avaliacao/corpo.png"
          alt="Silhueta masculina de corpo inteiro com os pontos de medida"
          className="absolute inset-y-0 h-full select-none"
          style={{ left: `${IMAGE_LEFT}%`, width: `${IMAGE_WIDTH}%` }}
          draggable={false}
        />
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="pointer-events-none absolute inset-0 size-full"
          aria-hidden="true"
        >
          <defs>
            <marker
              id={markerId}
              viewBox="0 0 10 10"
              refX="9"
              refY="5"
              markerWidth="5"
              markerHeight="5"
              orient="auto-start-reverse"
              markerUnits="strokeWidth"
            >
              <path d="M0 0 L10 5 L0 10 z" fill="#facc15" />
            </marker>
          </defs>
          {POINTS.map((p) => (
            <line
              key={p.key}
              x1={p.side === "left" ? COLUMN : 100 - COLUMN}
              y1={p.slot}
              x2={p.px}
              y2={p.y}
              stroke="#facc15"
              strokeWidth={compact ? 1 : 1.5}
              vectorEffect="non-scaling-stroke"
              markerEnd={`url(#${markerId})`}
            />
          ))}
        </svg>

        {POINTS.map((p) => (
          <div
            key={p.key}
            className="absolute -translate-y-1/2 px-1"
            style={{
              top: `${p.slot}%`,
              width: `${COLUMN}%`,
              [p.side === "left" ? "left" : "right"]: 0,
            }}
          >
            {props.mode === "edit" ? (
              <label className="flex flex-col gap-0.5 rounded-lg bg-slate-950/35 p-1 backdrop-blur-sm">
                <span className="truncate text-[10px] font-semibold leading-tight text-white sm:text-xs">
                  {INFO[p.key].label}
                </span>
                <span className="flex items-center gap-0.5 rounded-md bg-white px-1 focus-within:ring-2 focus-within:ring-yellow-400">
                  <input
                    inputMode="decimal"
                    value={props.values[p.key] ?? ""}
                    onChange={(e) => props.onChange(p.key, e.target.value)}
                    placeholder="0"
                    aria-label={`${INFO[p.key].label} em centímetros`}
                    className="w-full min-w-0 bg-transparent py-0.5 text-xs font-bold text-slate-900 outline-none placeholder:text-slate-400 sm:text-sm"
                  />
                  <span className="text-[10px] text-slate-500">cm</span>
                </span>
              </label>
            ) : (
              <div
                className={`flex flex-col items-center rounded-md px-0.5 py-0.5 text-center leading-tight shadow ${
                  TREND_CLS[props.trends?.[p.key] ?? "same"]
                }`}
              >
                <span className="text-[8px] font-medium opacity-80 sm:text-[10px]">
                  {INFO[p.key].short}
                </span>
                <span className="text-[10px] font-bold sm:text-xs">{fmt(props.values[p.key])}</span>
              </div>
            )}
          </div>
        ))}
      </div>
      {props.mode === "view" ? (
        <figcaption className="mt-2 text-center text-sm font-semibold">{props.caption}</figcaption>
      ) : null}
    </figure>
  );
}
