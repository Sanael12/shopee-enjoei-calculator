import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { CalcShell, MoneyField, ResultCard } from "@/components/CalcShell";
import { calcShopee, parseMoney, shopeeTier, SELLER_FEE } from "@/lib/calc";
import { addSale } from "@/lib/sales";

export const Route = createFileRoute("/shopee")({
  head: () => ({
    meta: [
      { title: "Calculadora Shopee — comissão, tarifa e lucro" },
      {
        name: "description",
        content:
          "Informe custo e preço de venda e veja quanto sobra depois da comissão, da tarifa fixa e da taxa de vendedor CPF da Shopee.",
      },
      { property: "og:title", content: "Calculadora Shopee — comissão, tarifa e lucro" },
      { property: "og:description", content: "Cálculo automático por faixa de preço, com subsídio Pix opcional." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ShopeePage,
});

function ShopeePage() {
  const [cost, setCost] = useState("");
  const [price, setPrice] = useState("");
  const [pix, setPix] = useState(true);

  const p = parseMoney(price);
  const c = parseMoney(cost);
  const tier = useMemo(() => shopeeTier(p), [p]);
  const result = useMemo(() => calcShopee(p, c, pix), [p, c, pix]);

  return (
    <CalcShell brand="shopee" title="Shopee" subtitle="Comissão e tarifas pela faixa de preço">
      <MoneyField label="Preço de custo" value={cost} onChange={setCost} />
      <MoneyField label="Preço de venda" value={price} onChange={setPrice} />

      <label className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3">
        <span className="text-sm text-foreground">Descontar subsídio Pix</span>
        <input
          type="checkbox"
          checked={pix}
          onChange={(e) => setPix(e.target.checked)}
          className="size-5 accent-[var(--shopee)]"
        />
      </label>

      {p > 0 ? (
        <>
          <div className="animate-fade-in rounded-xl bg-muted px-4 py-3 text-xs text-muted-foreground">
            Faixa: <strong className="text-foreground">{tier.label}</strong> —{" "}
            {(tier.rate * 100).toFixed(0)}% + R$ {tier.fixed.toFixed(2).replace(".", ",")} + R${" "}
            {SELLER_FEE.toFixed(2).replace(".", ",")} · subsídio Pix {tier.pixLabel} · embalagem R$ 1,00
          </div>
          <ResultCard
            result={result}
            onSave={(i) =>
              addSale({
                platform: "shopee",
                detail: tier.label,
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
        </>
      ) : (
        <p className="text-sm text-muted-foreground">Preencha o preço de venda para calcular</p>
      )}
    </CalcShell>
  );
}
