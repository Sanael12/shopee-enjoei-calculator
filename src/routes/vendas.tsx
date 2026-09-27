import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Calendar, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { BRAND_BG, Logo, ProfitBadge } from "@/components/CalcShell";
import { brl, LEVEL_STYLE, profitLevel } from "@/lib/calc";
import { formatDate, useSales, type Platform, type Sale } from "@/lib/sales";
import trophy from "@/assets/trofeu-top3.png.asset.json";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/vendas")({
  head: () => ({
    meta: [
      { title: "Minhas vendas — Calculadora de Lucro" },
      { name: "description", content: "Veja todas as vendas salvas, o valor investido, o lucro de cada uma e o total." },
      { property: "og:title", content: "Minhas vendas — Calculadora de Lucro" },
      { property: "og:description", content: "Comparativo de investimento e lucro das suas vendas." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: VendasPage,
});

const PLATFORM_NAME = { shopee: "Shopee", enjoei: "Enjoei", doces: "Doces" } as const;

function SaleRow({ s, i, update, remove }: { s: Sale; i: number; update: (id: string, p: Partial<Sale>) => void; remove: (id: string) => void }) {
  const [editName, setEditName] = useState(false);
  const [editDate, setEditDate] = useState(false);
  const [name, setName] = useState(s.name ?? "");
  const lvl = profitLevel(s.profit, s.margin);

  return (
    <div
      style={{ animationDelay: `${i * 50}ms` }}
      className="animate-fade-in rounded-2xl bg-card p-3 shadow-md [animation-fill-mode:both]"
    >
      <div className="flex items-center gap-3">
        <Logo brand={s.platform} className="size-11" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 text-sm font-semibold text-foreground">
            {s.name || PLATFORM_NAME[s.platform]}
            {s.qty && s.qty > 1 ? <span className="text-xs text-muted-foreground">×{s.qty}</span> : null}
            <ProfitBadge profit={s.profit} margin={s.margin} />
          </div>
          <div className="text-xs text-muted-foreground">
            {PLATFORM_NAME[s.platform]} · {s.detail} · {formatDate(s.date)}
          </div>
          <div className="mt-1 text-xs text-muted-foreground">
            Investido <b className="text-foreground">{brl(s.cost)}</b> · Vendido <b className="text-foreground">{brl(s.price)}</b>
          </div>
        </div>
        <div className={`rounded-xl px-3 py-2 text-right ${LEVEL_STYLE[lvl].cls}`}>
          <div className="text-sm font-bold tabular-nums">{brl(s.profit)}</div>
          <div className="text-[10px] opacity-80">{s.margin.toFixed(1)}%</div>
        </div>
      </div>

      <div className="mt-2 flex gap-2 border-t border-border pt-2">
        <Button variant="ghost" size="sm" onClick={() => setEditName((v) => !v)} className="h-7 gap-1 px-2 text-xs text-muted-foreground">
          <Pencil className="size-3.5" /> Nome
        </Button>
        <Button variant="ghost" size="sm" onClick={() => setEditDate((v) => !v)} className="h-7 gap-1 px-2 text-xs text-muted-foreground">
          <Calendar className="size-3.5" /> Data
        </Button>
        <Button variant="ghost" size="sm" onClick={() => remove(s.id)} className="ml-auto h-7 gap-1 px-2 text-xs text-muted-foreground hover:text-destructive">
          <Trash2 className="size-3.5" /> Apagar
        </Button>
      </div>

      {editName ? (
        <form
          className="mt-2 flex animate-fade-in gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            update(s.id, { name: name.trim() });
            setEditName(false);
          }}
        >
          <input autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="Qual foi a venda?" className="flex-1 rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring" />
          <Button type="submit" className="rounded-lg px-3 text-sm font-semibold">Salvar</Button>
        </form>
      ) : null}
      {editDate ? (
        <input
          type="date"
          defaultValue={s.date.slice(0, 10)}
          onChange={(e) => e.target.value && update(s.id, { date: e.target.value })}
          className="mt-2 w-full animate-fade-in rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
        />
      ) : null}
    </div>
  );
}

function VendasPage() {
  const { sales, update, remove, clear } = useSales();
  const invested = sales.reduce((a, s) => a + s.cost, 0);
  const sold = sales.reduce((a, s) => a + s.price, 0);
  const profit = sales.reduce((a, s) => a + s.profit, 0);
  const margin = sold > 0 ? (profit / sold) * 100 : 0;
  const lvl = profitLevel(profit, margin);
  const groups = (["shopee", "enjoei", "doces"] as const).map((platform) => ({
    platform,
    items: sales.filter((sale) => sale.platform === platform),
  })).filter((group) => group.items.length > 0);
  const products = new Map<string, { name: string; platform: Platform; profit: number; count: number }>();
  for (const sale of sales) {
    const name = sale.name?.trim();
    if (!name) continue;
    const key = `${sale.platform}:${name.toLocaleLowerCase("pt-BR")}`;
    const current = products.get(key);
    if (current) {
      current.profit += sale.profit;
      current.count += sale.qty || 1;
    } else {
      products.set(key, { name, platform: sale.platform, profit: sale.profit, count: sale.qty || 1 });
    }
  }
  const top = [...products.values()].sort((a, b) => b.profit - a.profit).slice(0, 3);
  const topProfit = top.reduce((total, product) => total + product.profit, 0);

  return (
    <div className={`min-h-screen px-4 py-8 ${BRAND_BG.vendas}`}>
      <div className="mx-auto w-full max-w-5xl">
        <Link to="/" className="mb-6 inline-flex items-center gap-2 text-sm text-[var(--shopee-foreground)] opacity-80 hover:opacity-100">
          <ArrowLeft className="size-4" /> Voltar
        </Link>
        <div className="flex animate-fade-in items-center gap-3 text-[var(--shopee-foreground)]">
          <Logo brand="vendas" className="size-14 ring-2 ring-[var(--shopee-foreground)]/40" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Vendas</h1>
            <p className="text-sm opacity-80">{sales.length} venda(s) salva(s)</p>
          </div>
        </div>

        <div className="mt-6 grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="min-w-0">
            <div className="space-y-6">
              {sales.length === 0 ? (
                <p className="rounded-2xl bg-card p-8 text-center text-sm text-muted-foreground">
                  Nenhuma venda ainda — calcule e toque em “Salvar venda”
                </p>
              ) : null}
              {groups.map(({ platform, items }) => (
                <section key={platform} aria-label={`Vendas ${PLATFORM_NAME[platform]}`}>
                  <div className="mb-3 flex items-center gap-3 text-[var(--shopee-foreground)]">
                    <Logo brand={platform} className="size-9" />
                    <h2 className="text-lg font-bold">{PLATFORM_NAME[platform]}</h2>
                    <span className="text-xs opacity-80">{items.length} venda(s)</span>
                  </div>
                  <div className="space-y-3">
                    {items.map((sale, i) => <SaleRow key={sale.id} s={sale} i={i} update={update} remove={remove} />)}
                  </div>
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-t border-[var(--shopee-foreground)]/30 pt-3 text-sm text-[var(--shopee-foreground)]">
                    <span>Investido: <strong className="tabular-nums">{brl(items.reduce((sum, sale) => sum + sale.cost, 0))}</strong></span>
                    <span>Lucro total: <strong className="tabular-nums">{brl(items.reduce((sum, sale) => sum + sale.profit, 0))}</strong></span>
                  </div>
                </section>
              ))}
            </div>

        {sales.length > 0 ? (
          <div className="mt-6 animate-scale-in overflow-hidden rounded-2xl bg-card shadow-2xl">
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
          <Button variant="ghost"
            onClick={() => confirm("Apagar todas as vendas?") && clear()}
            className="mt-4 w-full text-center text-xs text-[var(--shopee-foreground)] opacity-70 hover:opacity-100"
          >
            Apagar todas
          </Button>
        ) : null}
          </div>
          <aside className="order-first overflow-hidden rounded-2xl bg-card shadow-xl lg:order-last" aria-label="Top 3 produtos por lucro">
            <div className="flex items-center gap-3 border-b border-border bg-muted px-4 py-3">
              <img src={trophy.url} alt="Troféu" width={139} height={149} className="size-14 object-contain" />
              <div>
                <h2 className="text-lg font-bold text-foreground">Top 3 produtos</h2>
                <p className="text-xs text-muted-foreground">Maiores lucros acumulados</p>
              </div>
            </div>
            {top.length > 0 ? (
              <ol className="divide-y divide-border">
                {top.map((item) => (
                  <li key={`${item.platform}:${item.name.toLocaleLowerCase("pt-BR")}`} className="flex items-center gap-3 px-4 py-3">
                    <Logo brand={item.platform} className="size-8" />
                    <span className="min-w-0 flex-1 break-words text-sm font-medium text-foreground">{item.name}<small className="block text-xs font-normal text-muted-foreground">{item.count} unidade(s)</small></span>
                    <span className="shrink-0 text-sm font-semibold tabular-nums text-[var(--gain)]">{brl(item.profit)}</span>
                  </li>
                ))}
              </ol>
            ) : <p className="px-4 py-6 text-sm text-muted-foreground">Nomeie suas vendas para ver os produtos aqui.</p>}
            <div className="flex items-center justify-between gap-2 border-t border-border bg-muted px-4 py-4 text-sm text-foreground">
               <span className="font-medium">Lucro total do top 3</span>
              <strong className="tabular-nums">{brl(topProfit)}</strong>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
