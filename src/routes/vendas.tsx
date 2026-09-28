import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Calendar, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { BRAND_BG, Logo, ProfitBadge } from "@/components/CalcShell";
import { brl, LEVEL_STYLE, profitLevel } from "@/lib/calc";
import { formatDate, useSales, type Platform, type Sale } from "@/lib/sales";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";

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
  const { sales, loading, error, signedIn, refresh, update, remove, clear } = useSales();
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
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-sm text-[var(--shopee-foreground)]">
          <span>{signedIn ? "Vendas guardadas na sua conta" : "Entre na sua conta para guardar as vendas permanentemente."}</span>
          {signedIn ? <Button variant="outline" size="sm" onClick={() => void supabase?.auth.signOut()}>Sair</Button> : <Button asChild variant="outline" size="sm"><Link to="/auth">Entrar ou criar conta</Link></Button>}
        </div>
        {error ? <div role="alert" className="mt-3 text-sm text-[var(--shopee-foreground)]">{error} <Button variant="link" onClick={() => void refresh()}>Tentar novamente</Button></div> : null}

        <div className="mt-6 grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="min-w-0">
            <div className="space-y-6">
              {loading ? <p className="rounded-2xl bg-card p-8 text-center text-sm text-muted-foreground">Carregando vendas...</p> : null}
              {!loading && !error && sales.length === 0 ? (
                <p className="rounded-2xl bg-card p-8 text-center text-sm text-muted-foreground">
                  Nenhuma venda ainda — calcule e toque em “Salvar venda”
                </p>
              ) : null}
              {groups.map(({ platform, items }) => (
                <section key={platform} aria-label={`Vendas ${PLATFORM_NAME[platform]}`}>
                  <div className="mb-3 flex items-center gap-3 text-[var(--shopee-foreground)]">
                    <Logo brand={platform} className="size-9" />
                    <h2 className="text-lg font-bold">{PLATFORM_NAME[platform]}</h2>
                  </div>
                  <div className="space-y-3">
                    {items.map((s, idx) => (
                      <SaleRow key={s.id} s={s} i={idx} update={update} remove={remove} />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </div>

          {/* Barra Lateral / Resumo Financeiro */}
          <div className="space-y-5">
            <div className="rounded-2xl bg-card p-4 shadow-xl">
              <h2 className="text-sm font-semibold text-muted-foreground">Resumo Geral</h2>
              <div className="mt-3 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Investido:</span>
                  <span className="font-medium">{brl(invested)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Faturamento:</span>
                  <span className="font-medium">{brl(sold)}</span>
                </div>
                <div className={`mt-2 flex justify-between rounded-xl p-3 ${LEVEL_STYLE[lvl].cls}`}>
                  <span className="font-medium">Lucro Total:</span>
                  <div className="text-right">
                    <span className="block font-bold">{brl(profit)}</span>
                    <span className="text-xs opacity-80">Margem: {margin.toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* SEÇÃO DO TROFÉU: Exibindo o Top 3 Produtos */}
            {top.length > 0 ? (
              <div className="rounded-2xl bg-card p-4 shadow-xl">
                <div className="flex items-center gap-2 mb-3">
                  {/* ALTERAÇÃO: Puxando o troféu direto da public */}
                  <img src="/trofeu-top3.png" alt="Troféu" className="size-6 object-contain" />
                  <h2 className="text-sm font-bold text-foreground">Top Produtos Rentáveis</h2>
                </div>
                <div className="space-y-3">
                  {top.map((product, index) => (
                    <div key={index} className="flex items-center justify-between text-xs border-b border-border/40 pb-2 last:border-0 last:pb-0">
                      <div className="min-w-0 flex-1 pr-2">
                        <p className="font-semibold text-foreground truncate">{product.name}</p>
                        <p className="text-[10px] text-muted-foreground">{PLATFORM_NAME[product.platform]} · {product.count} un.</p>
                      </div>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400 shrink-0">{brl(product.profit)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {!loading && sales.length > 0 ? (
              <Button variant="destructive" size="sm" className="w-full rounded-xl" onClick={() => { if(confirm("Apagar tudo permanentemente?")) void clear() }}>
                Limpar Histórico
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
