import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Calendar, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { BRAND_BG, Logo, ProfitBadge } from "@/components/CalcShell";
import { brl, LEVEL_STYLE, profitLevel } from "@/lib/calc";
import { formatDate, useSales, type Sale } from "@/lib/sales";

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
        <button onClick={() => setEditName((v) => !v)} className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-muted-foreground hover:bg-accent hover:text-foreground">
          <Pencil className="size-3.5" /> Nome
        </button>
        <button onClick={() => setEditDate((v) => !v)} className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-muted-foreground hover:bg-accent hover:text-foreground">
          <Calendar className="size-3.5" /> Data
        </button>
        <button onClick={() => remove(s.id)} className="ml-auto flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-muted-foreground hover:text-destructive">
          <Trash2 className="size-3.5" /> Apagar
        </button>
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
          <button className="rounded-lg bg-primary px-3 text-sm font-semibold text-primary-foreground">Salvar</button>
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

  return (
    <div className={`min-h-screen px-4 py-8 ${BRAND_BG.vendas}`}>
      <div className="mx-auto w-full max-w-lg">
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

        <div className="mt-6 space-y-3">
          {sales.length === 0 ? (
            <p className="rounded-2xl bg-card p-8 text-center text-sm text-muted-foreground">
              Nenhuma venda ainda — calcule e toque em “Salvar venda”
            </p>
          ) : null}
          {sales.map((s, i) => (
            <SaleRow key={s.id} s={s} i={i} update={update} remove={remove} />
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
          <button
            onClick={() => confirm("Apagar todas as vendas?") && clear()}
            className="mt-4 w-full text-center text-xs text-[var(--shopee-foreground)] opacity-70 hover:opacity-100"
          >
            Apagar todas
          </button>
        ) : null}
      </div>
    </div>
  );
}
