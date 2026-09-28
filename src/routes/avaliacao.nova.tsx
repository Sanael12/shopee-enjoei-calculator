import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ChevronDown, Save } from "lucide-react";
import { useMemo, useState } from "react";
import { AvaliacaoShell, fieldCls } from "@/components/avaliacao/AvaliacaoShell";
import { BodyMap } from "@/components/avaliacao/BodyMap";
import { CompositionCards } from "@/components/avaliacao/CompositionCards";
import { saveAssessment } from "@/lib/assessments";
import {
  FOLDS,
  computeComposition,
  formatDateBR,
  parseNum,
  todayISO,
  type Assessment,
  type FoldKey,
  type MeasureKey,
} from "@/lib/body";

export const Route = createFileRoute("/avaliacao/nova")({
  head: () => ({ meta: [{ title: "Nova ficha — Avaliação Física" }] }),
  component: NovaFicha,
});

function toNumbers<K extends string>(values: Partial<Record<K, string>>) {
  const out: Partial<Record<K, number>> = {};
  for (const [k, v] of Object.entries(values) as [K, string][]) {
    const n = parseNum(v);
    if (n !== undefined) out[k] = n;
  }
  return out;
}

function NovaFicha() {
  const navigate = useNavigate();
  const [date, setDate] = useState(todayISO());
  const [age, setAge] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [measures, setMeasures] = useState<Partial<Record<MeasureKey, string>>>({});
  const [folds, setFolds] = useState<Partial<Record<FoldKey, string>>>({});
  const [wrist, setWrist] = useState("");
  const [femur, setFemur] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const draft = useMemo<Omit<Assessment, "id">>(
    () => ({
      date,
      age: parseNum(age) ?? 0,
      height: parseNum(height) ?? 0,
      weight: parseNum(weight) ?? 0,
      measures: toNumbers(measures),
      folds: toNumbers(folds),
      wrist: parseNum(wrist),
      femur: parseNum(femur),
    }),
    [date, age, height, weight, measures, folds, wrist, femur],
  );
  const composition = computeComposition({ ...draft, id: "draft" });

  const submit = async () => {
    setError("");
    if (!draft.age || !draft.height || !draft.weight || !date) {
      setError("Preencha data, idade, altura e peso para salvar.");
      return;
    }
    setSaving(true);
    try {
      await saveAssessment(draft);
      await navigate({ to: "/avaliacao/resultados" });
    } catch {
      setError("Não foi possível salvar a ficha. Tente novamente.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AvaliacaoShell title={date ? formatDateBR(date) : "Nova ficha"} subtitle="Nova ficha de avaliação" back="/avaliacao">
      <form
        className="space-y-5"
        onSubmit={(e) => {
          e.preventDefault();
          void submit();
        }}
      >
        <section className="grid grid-cols-3 gap-3 rounded-3xl bg-card p-4 text-foreground shadow-lg">
          <label className="col-span-3 space-y-1">
            <span className="text-xs font-semibold text-muted-foreground">Data da avaliação</span>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={fieldCls} required />
          </label>
          <label className="space-y-1">
            <span className="text-xs font-semibold text-muted-foreground">Idade</span>
            <input inputMode="numeric" value={age} onChange={(e) => setAge(e.target.value)} placeholder="anos" className={fieldCls} />
          </label>
          <label className="space-y-1">
            <span className="text-xs font-semibold text-muted-foreground">Altura (cm)</span>
            <input inputMode="decimal" value={height} onChange={(e) => setHeight(e.target.value)} placeholder="175" className={fieldCls} />
          </label>
          <label className="space-y-1">
            <span className="text-xs font-semibold text-muted-foreground">Peso (kg)</span>
            <input inputMode="decimal" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="75" className={fieldCls} />
          </label>
        </section>

        <section aria-label="Medidas corporais em centímetros" className="space-y-2">
          <h2 className="text-lg font-bold">Medidas (cm)</h2>
          <BodyMap
            mode="edit"
            values={measures}
            onChange={(key, value) => setMeasures((m) => ({ ...m, [key]: value }))}
          />
        </section>

        <details className="group rounded-3xl bg-card p-4 text-foreground shadow-lg">
          <summary className="flex cursor-pointer list-none items-center justify-between font-semibold">
            <span>
              Dobras cutâneas (mm)
              <span className="block text-xs font-normal text-muted-foreground">
                Opcional — deixa o % de gordura mais preciso e ajustado pela idade
              </span>
            </span>
            <ChevronDown className="size-5 transition-transform group-open:rotate-180" />
          </summary>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {FOLDS.map((f) => (
              <label key={f.key} className="space-y-1">
                <span className="text-xs font-semibold text-muted-foreground">{f.label}</span>
                <input
                  inputMode="decimal"
                  value={folds[f.key] ?? ""}
                  onChange={(e) => setFolds((v) => ({ ...v, [f.key]: e.target.value }))}
                  placeholder="mm"
                  className={fieldCls}
                />
              </label>
            ))}
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Com peitoral, abdominal e coxa já é usado o protocolo de 3 dobras; com as 7, o de 7 dobras.
          </p>
        </details>

        <details className="group rounded-3xl bg-card p-4 text-foreground shadow-lg">
          <summary className="flex cursor-pointer list-none items-center justify-between font-semibold">
            <span>
              Diâmetros ósseos (cm)
              <span className="block text-xs font-normal text-muted-foreground">
                Opcional — melhora o cálculo da massa óssea
              </span>
            </span>
            <ChevronDown className="size-5 transition-transform group-open:rotate-180" />
          </summary>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <label className="space-y-1">
              <span className="text-xs font-semibold text-muted-foreground">Punho</span>
              <input inputMode="decimal" value={wrist} onChange={(e) => setWrist(e.target.value)} placeholder="cm" className={fieldCls} />
            </label>
            <label className="space-y-1">
              <span className="text-xs font-semibold text-muted-foreground">Joelho (fêmur)</span>
              <input inputMode="decimal" value={femur} onChange={(e) => setFemur(e.target.value)} placeholder="cm" className={fieldCls} />
            </label>
          </div>
        </details>

        {composition ? (
          <section className="space-y-2">
            <h2 className="text-lg font-bold">Prévia da composição</h2>
            <CompositionCards current={composition} />
          </section>
        ) : null}

        {error ? (
          <p role="alert" className="rounded-xl bg-red-500/90 px-3 py-2 text-sm font-medium">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={saving}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-white py-4 text-lg font-bold text-[var(--avaliacao-2)] shadow-lg transition-transform hover:-translate-y-0.5 active:scale-95 disabled:opacity-60"
        >
          <Save className="size-5" /> {saving ? "Salvando..." : "Salvar medidas"}
        </button>
      </form>
    </AvaliacaoShell>
  );
}
