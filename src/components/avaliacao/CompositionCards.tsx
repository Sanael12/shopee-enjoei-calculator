import { fmt, type Composition } from "@/lib/body";

type Row = {
  label: string;
  kg: keyof Composition;
  pct: keyof Composition;
  better: "up" | "down" | "none";
  color: string;
};

const ROWS: Row[] = [
  { label: "Gordura", kg: "fatKg", pct: "fatPct", better: "down", color: "bg-amber-400" },
  { label: "Massa muscular", kg: "muscleKg", pct: "musclePct", better: "up", color: "bg-emerald-400" },
  { label: "Ossos", kg: "boneKg", pct: "bonePct", better: "none", color: "bg-slate-300" },
  { label: "Órgãos e resíduos", kg: "residualKg", pct: "residualPct", better: "none", color: "bg-sky-300" },
];

function deltaCls(diff: number, better: Row["better"]) {
  if (better === "none" || Math.abs(diff) < 0.05) return "text-muted-foreground";
  return (better === "up") === diff > 0 ? "text-emerald-600" : "text-red-600";
}

export function CompositionCards({ current, previous }: { current: Composition; previous?: Composition | undefined }) {
  return (
    <div className="space-y-3 rounded-3xl bg-card p-4 text-foreground shadow-lg">
      <div className="flex h-4 w-full overflow-hidden rounded-full" aria-hidden="true">
        {ROWS.map((r) => (
          <span key={r.label} className={r.color} style={{ width: `${current[r.pct] as number}%` }} />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3">
        {ROWS.map((r) => {
          const kg = current[r.kg] as number;
          const pct = current[r.pct] as number;
          const diff = previous ? kg - (previous[r.kg] as number) : undefined;
          return (
            <div key={r.label} className="rounded-2xl border border-border p-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                <span className={`size-2.5 rounded-full ${r.color}`} aria-hidden="true" />
                {r.label}
              </div>
              <div className="mt-1 text-xl font-bold">{fmt(kg)} kg</div>
              <div className="text-sm text-muted-foreground">{fmt(pct)}%</div>
              {diff !== undefined ? (
                <div className={`text-xs font-semibold ${deltaCls(diff, r.better)}`}>
                  {diff > 0 ? "+" : ""}
                  {fmt(diff)} kg
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
      <p className="text-xs text-muted-foreground">
        IMC {fmt(current.bmi)} · Gordura: {current.fatMethod}. Ossos: {current.boneMethod}. Cálculos para homens.
      </p>
    </div>
  );
}
