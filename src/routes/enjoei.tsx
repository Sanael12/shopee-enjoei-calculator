import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { CalcShell, MoneyField, ResultCard } from "@/components/CalcShell";
import { calcEnjoei, ENJOEI_MODES, parseMoney, type EnjoeiMode } from "@/lib/calc";

export const Route = createFileRoute("/enjoei")({
  head: () => ({
    meta: [
      { title: "Calculadora Enjoei — grátis, clássico e turbinado" },
      {
        name: "description",
        content:
          "Compare o lucro nos modos grátis, clássico e turbinado do Enjoei, já com comissão e tarifa fixa descontadas.",
      },
      { property: "og:title", content: "Calculadora Enjoei — grátis, clássico e turbinado" },
      {
        property: "og:description",
        content: "Informe custo e preço de venda e veja quanto sobra em cada modo de anúncio.",
      },
    ],
  }),
  component: EnjoeiPage,
});

const MODES: EnjoeiMode[] = ["gratis", "classico", "turbinado"];

function EnjoeiPage() {
  const [mode, setMode] = useState<EnjoeiMode>("turbinado");
  const [cost, setCost] = useState("");
  const [price, setPrice] = useState("");

  const p = parseMoney(price);
  const c = parseMoney(cost);
  const result = useMemo(() => calcEnjoei(mode, p, c), [mode, p, c]);

  return (
    <CalcShell title="Enjoei" subtitle="escolha o modo de anúncio">
      <div className="grid grid-cols-3 gap-2">
        {MODES.map((m) => {
          const active = m === mode;
          return (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`rounded-xl border px-2 py-3 text-sm font-medium transition-colors ${
                active
                  ? "border-transparent bg-[var(--enjoei)] text-[var(--enjoei-foreground)]"
                  : "border-border bg-card text-foreground hover:bg-accent"
              }`}
            >
              {ENJOEI_MODES[m].name.replace("modo ", "")}
            </button>
          );
        })}
      </div>
      <p className="text-xs text-muted-foreground">{ENJOEI_MODES[mode].desc}</p>

      <MoneyField label="Preço de custo" value={cost} onChange={setCost} />
      <MoneyField label="Preço de venda" value={price} onChange={setPrice} />

      {p > 0 ? (
        <ResultCard result={result} />
      ) : (
        <p className="text-sm text-muted-foreground">preencha o preço de venda para calcular</p>
      )}
    </CalcShell>
  );
}
