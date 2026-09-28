import { createFileRoute, Link } from "@tanstack/react-router";
import { Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import { AvaliacaoShell, fieldCls } from "@/components/avaliacao/AvaliacaoShell";
import { BodyMap } from "@/components/avaliacao/BodyMap";
import { CompositionCards } from "@/components/avaliacao/CompositionCards";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { useAssessments } from "@/lib/assessments";
import {
  MEASURES,
  computeComposition,
  fmt,
  formatDateBR,
  measureTrend,
  type Goal,
  type MeasureKey,
  type Trend,
} from "@/lib/body";

export const Route = createFileRoute("/avaliacao/resultados")({
  head: () => ({ meta: [{ title: "Resultados — Avaliação Física" }] }),
  component: Resultados,
});

const CHART_CONFIG = {
  peso: { label: "Peso", color: "#2563eb" },
  gordura: { label: "Gordura", color: "#f59e0b" },
  musculo: { label: "Músculo", color: "#10b981" },
  ossos: { label: "Ossos", color: "#94a3b8" },
} satisfies ChartConfig;

const TREND_TEXT: Record<Trend, string> = {
  good: "text-emerald-600",
  bad: "text-red-600",
  same: "text-foreground",
};

function Resultados() {
  const { assessments, loading, error, remove } = useAssessments();
  const [goal, setGoal] = useState<Goal>("ganhar");
  const [currentId, setCurrentId] = useState("");
  const [previousId, setPreviousId] = useState("");

  const current = assessments.find((a) => a.id === currentId) ?? assessments.at(-1);
  const currentIndex = current ? assessments.indexOf(current) : -1;
  const previous =
    assessments.find((a) => a.id === previousId && a.id !== current?.id) ??
    (currentIndex > 0 ? assessments[currentIndex - 1] : undefined);

  const currComp = current ? computeComposition(current) : null;
  const prevComp = previous ? computeComposition(previous) : null;

  const trends = useMemo(() => {
    const out: Partial<Record<MeasureKey, Trend>> = {};
    if (!current || !previous) return out;
    for (const m of MEASURES) out[m.key] = measureTrend(previous.measures[m.key], current.measures[m.key], goal);
    return out;
  }, [current, previous, goal]);

  const weightTrend = measureTrend(previous?.weight, current?.weight, goal === "ganhar" ? "ganhar" : "emagrecer");

  const chartData = useMemo(
    () =>
      assessments.map((a) => {
        const c = computeComposition(a);
        return {
          data: formatDateBR(a.date).slice(0, 5),
          peso: a.weight,
          gordura: c ? Number(c.fatKg.toFixed(1)) : null,
          musculo: c ? Number(c.muscleKg.toFixed(1)) : null,
          ossos: c ? Number(c.boneKg.toFixed(1)) : null,
        };
      }),
    [assessments],
  );

  if (loading)
    return (
      <AvaliacaoShell title="Resultados" back="/avaliacao">
        <p className="text-center opacity-80">Carregando avaliações...</p>
      </AvaliacaoShell>
    );

  if (!current)
    return (
      <AvaliacaoShell title="Resultados" back="/avaliacao">
        <div className="rounded-3xl bg-card p-6 text-center text-foreground shadow-lg">
          <p className="font-semibold">Nenhuma ficha salva ainda.</p>
          <Link to="/avaliacao/nova" className="mt-3 inline-block font-bold text-[var(--avaliacao)] underline">
            Adicionar a primeira ficha
          </Link>
        </div>
      </AvaliacaoShell>
    );

  return (
    <AvaliacaoShell title="Resultados" subtitle="Compare suas avaliações" back="/avaliacao" wide>
      <div className="space-y-6">
        <section className="flex flex-col gap-3 rounded-3xl bg-card p-4 text-foreground shadow-lg sm:flex-row sm:items-end">
          <fieldset className="flex-1">
            <legend className="mb-1 text-xs font-semibold text-muted-foreground">Qual é o foco?</legend>
            <div className="grid grid-cols-2 gap-1 rounded-xl bg-muted p-1">
              {(
                [
                  ["emagrecer", "Emagrecer"],
                  ["ganhar", "Ganhar massa"],
                ] as const
              ).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  aria-pressed={goal === value}
                  onClick={() => setGoal(value)}
                  className={`rounded-lg py-2 text-sm font-semibold transition-colors ${
                    goal === value ? "bg-[var(--avaliacao)] text-white shadow" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </fieldset>
          <label className="flex-1 space-y-1">
            <span className="text-xs font-semibold text-muted-foreground">Avaliação anterior</span>
            <select
              value={previous?.id ?? ""}
              onChange={(e) => setPreviousId(e.target.value)}
              className={fieldCls}
            >
              {previous ? null : <option value="">Nenhuma</option>}
              {assessments
                .filter((a) => a.id !== current.id)
                .map((a) => (
                  <option key={a.id} value={a.id}>
                    {formatDateBR(a.date)}
                  </option>
                ))}
            </select>
          </label>
          <label className="flex-1 space-y-1">
            <span className="text-xs font-semibold text-muted-foreground">Avaliação atual</span>
            <select
              value={current.id}
              onChange={(e) => {
                setCurrentId(e.target.value);
                setPreviousId("");
              }}
              className={fieldCls}
            >
              {assessments.map((a) => (
                <option key={a.id} value={a.id}>
                  {formatDateBR(a.date)}
                </option>
              ))}
            </select>
          </label>
        </section>

        <section aria-label="Comparação das medidas" className="grid grid-cols-2 gap-3">
          {previous ? (
            <BodyMap mode="view" values={previous.measures} caption={`Anterior · ${formatDateBR(previous.date)}`} />
          ) : (
            <div className="flex aspect-square items-center justify-center rounded-3xl border-2 border-dashed border-white/40 p-4 text-center text-sm opacity-80">
              Salve outra ficha para comparar
            </div>
          )}
          <BodyMap
            mode="view"
            values={current.measures}
            trends={trends}
            caption={`Atual · ${formatDateBR(current.date)}`}
          />
        </section>
        <p className="-mt-3 text-center text-xs opacity-80">
          Verde: mudou a favor do foco · Vermelho: mudou contra o foco · Branco: igual
        </p>

        <section className="overflow-hidden rounded-3xl bg-card text-foreground shadow-lg">
          <table className="w-full text-sm">
            <thead className="bg-muted text-xs text-muted-foreground">
              <tr>
                <th className="px-4 py-2 text-left font-semibold">Medida</th>
                <th className="px-2 py-2 text-right font-semibold">Anterior</th>
                <th className="px-2 py-2 text-right font-semibold">Atual</th>
                <th className="px-4 py-2 text-right font-semibold">Diferença</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-border font-semibold">
                <td className="px-4 py-2">Peso (kg)</td>
                <td className="px-2 py-2 text-right">{fmt(previous?.weight)}</td>
                <td className={`px-2 py-2 text-right ${TREND_TEXT[weightTrend]}`}>{fmt(current.weight)}</td>
                <td className={`px-4 py-2 text-right ${TREND_TEXT[weightTrend]}`}>
                  {previous ? `${current.weight - previous.weight > 0 ? "+" : ""}${fmt(current.weight - previous.weight)}` : "—"}
                </td>
              </tr>
              {MEASURES.map((m) => {
                const p = previous?.measures[m.key];
                const c = current.measures[m.key];
                const diff = p !== undefined && c !== undefined ? c - p : undefined;
                const t = trends[m.key] ?? "same";
                return (
                  <tr key={m.key} className="border-t border-border">
                    <td className="px-4 py-2">{m.label} (cm)</td>
                    <td className="px-2 py-2 text-right text-muted-foreground">{fmt(p)}</td>
                    <td className={`px-2 py-2 text-right font-semibold ${TREND_TEXT[t]}`}>{fmt(c)}</td>
                    <td className={`px-4 py-2 text-right font-semibold ${TREND_TEXT[t]}`}>
                      {diff === undefined ? "—" : `${diff > 0 ? "+" : ""}${fmt(diff)}`}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>

        {currComp ? (
          <section className="space-y-2">
            <h2 className="text-lg font-bold">Composição corporal · {formatDateBR(current.date)}</h2>
            <CompositionCards current={currComp} previous={prevComp ?? undefined} />
          </section>
        ) : null}

        <section className="space-y-2">
          <h2 className="text-lg font-bold">Evolução</h2>
          <div className="rounded-3xl bg-card p-4 text-foreground shadow-lg">
            {chartData.length < 2 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                O gráfico aparece a partir da segunda ficha.
              </p>
            ) : (
              <ChartContainer config={CHART_CONFIG} className="aspect-auto h-72 w-full">
                <LineChart data={chartData} margin={{ left: -16, right: 8, top: 8 }}>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="data" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} unit=" kg" width={60} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  {Object.keys(CHART_CONFIG).map((key) => (
                    <Line
                      key={key}
                      dataKey={key}
                      type="monotone"
                      stroke={`var(--color-${key})`}
                      strokeWidth={2.5}
                      dot={{ r: 3 }}
                      connectNulls
                    />
                  ))}
                </LineChart>
              </ChartContainer>
            )}
          </div>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold">Fichas salvas</h2>
          {error ? (
            <p role="alert" className="rounded-xl bg-red-500/90 px-3 py-2 text-sm font-medium">
              {error}
            </p>
          ) : null}
          <ul className="divide-y divide-border overflow-hidden rounded-3xl bg-card text-foreground shadow-lg">
            {[...assessments].reverse().map((a) => (
              <li key={a.id} className="flex items-center justify-between gap-3 px-4 py-3">
                <div>
                  <div className="font-semibold">{formatDateBR(a.date)}</div>
                  <div className="text-xs text-muted-foreground">
                    {fmt(a.weight)} kg · {a.age} anos · {fmt(a.height, 0)} cm
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm(`Apagar a ficha de ${formatDateBR(a.date)}?`)) void remove(a.id);
                  }}
                  className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-red-500/10 hover:text-red-600"
                  aria-label={`Apagar ficha de ${formatDateBR(a.date)}`}
                >
                  <Trash2 className="size-4" />
                </button>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </AvaliacaoShell>
  );
}
