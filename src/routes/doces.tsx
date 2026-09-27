import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { CalcShell, MoneyField, ResultCard } from "@/components/CalcShell";
import { parseMoney, type Result } from "@/lib/calc";
import { addSale } from "@/lib/sales";

export const Route = createFileRoute("/doces")({
  head: () => ({
    meta: [
      { title: "Calculadora de Doces — custo de produção e lucro" },
      { name: "description", content: "Informe o custo de produção e o preço de venda dos seus doces e veja o lucro." },
      { property: "og:title", content: "Calculadora de Doces — custo de produção e lucro" },
      { property: "og:description", content: "Lucro dos seus doces calculado na hora." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: DocesPage,
});

function DocesPage() {
  const [cost, setCost] = useState("");
  const [price, setPrice] = useState("");
  const p = parseMoney(price);
  const c = parseMoney(cost);
  const result: Result = useMemo(
    () => ({
      lines: [
        { label: "Valor da venda", value: p },
        { label: "Custo de produção", value: -c },
      ],
      received: p,
      profit: p - c,
      margin: p > 0 ? ((p - c) / p) * 100 : 0,
    }),
    [p, c],
  );

  return (
    <CalcShell brand="doces" title="Doces" subtitle="Custo de produção e preço de venda">
      <MoneyField label="Custo de produção" value={cost} onChange={setCost} />
      <MoneyField label="Preço de venda" value={price} onChange={setPrice} />
      {p > 0 ? (
        <ResultCard
          result={result}
          onSave={(i) =>
            addSale({
              platform: "doces",
              detail: "Venda direta",
              name: i.name,
              qty: i.qty,
              date: i.date,
              price: p * i.qty,
              cost: c * i.qty,
              profit: result.profit * i.qty,
              margin: result.margin,
            })
          }
        />
      ) : (
        <p className="text-sm text-muted-foreground">Preencha o preço de venda para calcular</p>
      )}
    </CalcShell>
  );
}
