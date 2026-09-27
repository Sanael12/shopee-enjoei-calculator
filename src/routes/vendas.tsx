import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Trash2 } from "lucide-react";
import { LOGOS, ProfitBadge } from "@/components/CalcShell";
import { brl, LEVEL_STYLE, profitLevel } from "@/lib/calc";
import { useSales } from "@/lib/sales";

export const Route = createFileRoute("/vendas")({
  head: () => ({
    meta: [
      { title: "Minhas vendas — Calculadora de Lucro" },
      { name: "description", content: "Veja todas as vendas salvas, o valor investido, o lucro de cada uma e o total." },
      { property: "og:title", content: "Minhas vendas — Calculadora de Lucro" },
      { property: "og:description", content: "Comparativo de investimento e lucro das suas vendas na Shopee e no Enjoei." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: VendasPage,
});

function VendasPage() {
  const { sales, remove, clear } = useSales();
  const invested = sales.reduce((a, s) => a + s.cost, 0);
  const sold = sales.reduce((a, s) => a + s.price, 0);
  const profit = sales.reduce((a, s) => a + s.profit, 0);
  const margin = sold > 0 ? (profit / sold) * 100 : 0;
  const lvl = profitLevel(profit, margin);

  return (
    <div className="min-h-screen bg-background px-4 py-8">
      <div className="mx-auto w-full max-w-lg">
        <Link to="/" className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" /> voltar
        </Link>
        <h1 className="animate-fade-in text-3xl font-bold tracking-tight text-foreground">vendas</h1>
        <p className="mt-1 text-sm text-muted-foreground">{sales.length} venda(s) salva(s)</p>

        <div className="mt-6 space-y-3">
          {sales.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
              nenhuma venda ainda — calcule e toque em “salvar venda”
            </p>
          ) : null}
          {sales.map((s, i) => (
            <div
              key={s.id}
              style={{ animationDelay: `${i * 50}ms` }}
              className="flex animate-fade-in items-center gap-3 rounded-2xl border border-border bg-card p-3 shadow-sm [animation-fill-mode:both]"
            >
              <img src={LOGOS[s.platform]} alt={s.platform} className="size-10 rounded-xl" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  {s.platform === "shopee" ? "Shopee" : "Enjoei"}
                  <ProfitBadge profit={s.profit} margin={s.margin} />
                </div>
                <div className="text-xs text-muted-foreground">
                  {s.detail} · {new Date(s.date).toLocaleDateString("pt-BR")}
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  investido <b className="text-foreground">{brl(s.cost)}</b> · vendido{" "}
                  <b className="text-foreground">{brl(s.price)}</b>
                </div>
              </div>
              <div className={`rounded-xl px-3 py-2 text-right ${LEVEL_STYLE[profitLevel(s.profit, s.margin)].cls}`}>
                <div className="text-sm font-bold tabular-nums">{brl(s.profit)}</div>
                <div className="text-[10px] opacity-80">{s.margin.toFixed(1)}%</div>
              </div>
              <button onClick={() => remove(s.id)} aria-label="Apagar" className="text-muted-foreground hover:text-destructive">
                <Trash2 className="size-4" />
              </button>
            </div>
          ))}
        </div>

        {sales.length > 0 ? (
          <div className="mt-6 animate-scale-in overflow-hidden rounded-2xl border border-border bg-card shadow-lg">
            <div className="flex justify-between px-4 py-3 text-sm">
              <span className="text-muted-foreground">Total gasto (custo)</span>
              <span className="font-semibold tabular-nums text-foreground">{brl(invested)}</span>
            </div>
            <div className="flex justify-between border-t border-border px-4 py-3 text-sm">
              <span className="text-muted-foreground">Total vendido</span>
              <span className="font-semibold tabular-nums text-foreground">{brl(sold)}</span>
            </div>
            <div className={`flex items-baseline justify-between px-4 py-4 ${LEVEL_STYLE[lvl].cls}`}>
              <span className="text-sm font-medium">Total ganho (lucro)</span>
              <span className="text-2xl font-bold tabular-nums">{brl(profit)}</span>
            </div>
          </div>
        ) : null}

        {sales.length > 0 ? (
          <button
            onClick={() => confirm("Apagar todas as vendas?") && clear()}
            className="mt-4 w-full text-center text-xs text-muted-foreground hover:text-destructive"
          >
            apagar todas
          </button>
        ) : null}
      </div>
    </div>
  );
}
