import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Calendar, Check, Pencil, Plus, Receipt, Save, Trash2, Wallet } from "lucide-react";
import { useState } from "react";
import { BRAND_BG, Logo } from "@/components/CalcShell";
import { brl, parseMoney } from "@/lib/calc";
import { addExpense, formatDate, today, useExpenses, type Expense } from "@/lib/expenses";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/gastos")({
  head: () => ({
    meta: [
      { title: "Gastos — Calculadora de Lucro" },
      { name: "description", content: "Adicione e acompanhe seus gastos para controlar suas finanças." },
      { property: "og:title", content: "Gastos — Calculadora de Lucro" },
      { property: "og:description", content: "Controle total dos seus gastos." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: GastosPage,
});

type View = "menu" | "add" | "list";

function GastosPage() {
  const [view, setView] = useState<View>("menu");

  return (
    <div className={`min-h-screen px-4 py-8 ${BRAND_BG.gastos}`}>
      <div className="mx-auto w-full max-w-lg text-[var(--shopee-foreground)]">
        <Link
          to="/"
          className="mb-6 inline-flex items-center gap-2 text-sm opacity-80 transition-opacity hover:opacity-100"
        >
          <ArrowLeft className="size-4" /> Voltar
        </Link>

        <div className="flex animate-fade-in items-center gap-3">
          <Logo brand="gastos" className="size-14" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Gastos</h1>
            <p className="text-sm opacity-80">Controle seus gastos</p>
          </div>
        </div>

        {view === "menu" ? (
          <MenuView onAdd={() => setView("add")} onList={() => setView("list")} />
        ) : view === "add" ? (
          <AddExpenseView onBack={() => setView("menu")} />
        ) : (
          <ListExpensesView onBack={() => setView("menu")} />
        )}
      </div>
    </div>
  );
}

function MenuView({ onAdd, onList }: { onAdd: () => void; onList: () => void }) {
  const { expenses, signedIn } = useExpenses();
  return (
    <div className="mt-6 space-y-4">
      <button
        onClick={onAdd}
        style={{ animationDelay: "0ms" }}
        className="group flex w-full animate-pop items-center gap-4 rounded-3xl border-2 border-transparent bg-card/90 p-5 text-left shadow-lg backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:border-[var(--gastos)] active:scale-95"
      >
        <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--gastos)] to-[var(--gastos-2)] text-white shadow-lg transition-transform group-hover:scale-110">
          <Plus className="size-7" />
        </span>
        <div>
          <div className="text-lg font-bold text-foreground">Adicionar Gastos</div>
          <div className="text-xs text-muted-foreground">Registre um novo gasto</div>
        </div>
      </button>

      <button
        onClick={onList}
        style={{ animationDelay: "90ms" }}
        className="group flex w-full animate-pop items-center gap-4 rounded-3xl border-2 border-transparent bg-card/90 p-5 text-left shadow-lg backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:border-[var(--gastos)] active:scale-95"
      >
        <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--gastos)] to-[var(--gastos-2)] text-white shadow-lg transition-transform group-hover:scale-110">
          <Receipt className="size-7" />
        </span>
        <div>
          <div className="text-lg font-bold text-foreground">Ver Gastos</div>
          <div className="text-xs text-muted-foreground">
            {expenses.length} gasto(s) registrado(s)
          </div>
        </div>
      </button>

      <p className="text-center text-xs opacity-70">
        {signedIn
          ? "Gastos guardados na sua conta"
          : "Entre na sua conta para guardar os gastos permanentemente."}
      </p>
    </div>
  );
}

const inputCls =
  "w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring";

function AddExpenseView({ onBack }: { onBack: () => void }) {
  const [name, setName] = useState("");
  const [date, setDate] = useState(today());
  const [qty, setQty] = useState("1");
  const [amount, setAmount] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [message, setMessage] = useState("");

  const q = Math.max(1, Math.floor(Number(qty) || 1));
  const value = parseMoney(amount);
  const total = value * q;

  const handleSave = async () => {
    if (value <= 0) {
      setMessage("Digite um valor válido.");
      return;
    }
    setSaving(true);
    setMessage("");
    try {
      const status = await addExpense({
        name: name.trim(),
        qty: q,
        amount: value,
        is_negative: true,
        date: date || today(),
      });
      setSaved(true);
      if (status === "needsAuth")
        setMessage("Gasto guardado neste navegador. Entre na sua conta para mantê-lo e acessá-lo em outros aparelhos.");
      else setMessage("Gasto salvo com sucesso!");
      setName("");
      setAmount("");
      setQty("1");
      setTimeout(() => {
        setSaved(false);
        setMessage("");
      }, 2000);
    } catch {
      setMessage("Não foi possível salvar. Tente novamente.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mt-6 animate-fade-in space-y-5 rounded-3xl bg-card p-5 text-card-foreground shadow-2xl">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <button onClick={onBack} className="inline-flex items-center gap-1 hover:text-foreground">
          <ArrowLeft className="size-4" /> Voltar
        </button>
      </div>

      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-foreground">Nome do gasto</span>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ex: Material de embalagem"
          className={inputCls}
        />
      </label>

      <div className="grid grid-cols-3 gap-3">
        <label className="text-xs text-muted-foreground">
          Data
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className={`${inputCls} mt-1`}
          />
        </label>
        <label className="text-xs text-muted-foreground">
          Quantidade
          <input
            type="number"
            min={1}
            value={qty}
            onChange={(e) => setQty(e.target.value)}
            className={`${inputCls} mt-1`}
          />
        </label>
        <label className="text-xs text-muted-foreground">
          Valor (R$)
          <input
            inputMode="decimal"
            value={amount}
            placeholder="0,00"
            onChange={(e) => setAmount(e.target.value)}
            className={`${inputCls} mt-1`}
          />
        </label>
      </div>

      {q > 1 && value > 0 ? (
        <p className="text-xs text-muted-foreground">
          Total de {q} unidades: <b className="text-foreground">{brl(total)}</b>
        </p>
      ) : null}

      <Button
        disabled={saving || value <= 0}
        onClick={handleSave}
        className="flex w-full items-center justify-center gap-2"
      >
        {saved ? <Check className="size-4" /> : <Save className="size-4" />}
        {saved ? "Salvo!" : saving ? "Salvando..." : "Salvar Gasto"}
      </Button>

      {message ? (
        <p className="animate-fade-in text-center text-xs text-muted-foreground text-balance">
          {message}
        </p>
      ) : null}
    </div>
  );
}

function ExpenseRow({
  e,
  i,
  update,
  remove,
}: {
  e: Expense;
  i: number;
  update: (id: string, p: Partial<Expense>) => void;
  remove: (id: string) => void;
}) {
  const [editName, setEditName] = useState(false);
  const [editDate, setEditDate] = useState(false);
  const [editSign, setEditSign] = useState(false);
  const [name, setName] = useState(e.name ?? "");
  const total = e.amount * e.qty;
  const display = e.is_negative ? -total : total;

  return (
    <div
      style={{ animationDelay: `${i * 50}ms` }}
      className="animate-fade-in rounded-2xl bg-card p-3 shadow-md [animation-fill-mode:both]"
    >
      <div className="flex items-center gap-3">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--gastos)] to-[var(--gastos-2)] text-white shadow-lg">
          <Wallet className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 text-sm font-semibold text-foreground">
            {e.name || "Gasto sem nome"}
            {e.qty > 1 ? <span className="text-xs text-muted-foreground">×{e.qty}</span> : null}
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${
                e.is_negative
                  ? "bg-[var(--loss)] text-[var(--loss-foreground)]"
                  : "bg-[var(--gain)] text-[var(--gain-foreground)]"
              }`}
            >
              {e.is_negative ? "Gasto" : "Crédito"}
            </span>
          </div>
          <div className="text-xs text-muted-foreground">{formatDate(e.date)}</div>
          <div className="mt-1 text-xs text-muted-foreground">
            Valor unitário <b className="text-foreground">{brl(e.amount)}</b>
          </div>
        </div>
        <div
          className={`rounded-xl px-3 py-2 text-right ${
            e.is_negative
              ? "bg-[var(--loss)] text-[var(--loss-foreground)]"
              : "bg-[var(--gain)] text-[var(--gain-foreground)]"
          }`}
        >
          <div className="text-sm font-bold tabular-nums">{brl(display)}</div>
        </div>
      </div>

      <div className="mt-2 flex gap-2 border-t border-border pt-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setEditName((v) => !v)}
          className="h-7 gap-1 px-2 text-xs text-muted-foreground"
        >
          <Pencil className="size-3.5" /> Nome
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setEditDate((v) => !v)}
          className="h-7 gap-1 px-2 text-xs text-muted-foreground"
        >
          <Calendar className="size-3.5" /> Data
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setEditSign((v) => !v)}
          className="h-7 gap-1 px-2 text-xs text-muted-foreground"
        >
          {e.is_negative ? "Mudar para crédito" : "Mudar para gasto"}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => remove(e.id)}
          className="ml-auto h-7 gap-1 px-2 text-xs text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="size-3.5" /> Apagar
        </Button>
      </div>

      {editName ? (
        <form
          className="mt-2 flex animate-fade-in gap-2"
          onSubmit={(ev) => {
            ev.preventDefault();
            update(e.id, { name: name.trim() });
            setEditName(false);
          }}
        >
          <input
            autoFocus
            value={name}
            onChange={(ev) => setName(ev.target.value)}
            placeholder="Nome do gasto"
            className="flex-1 rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
          />
          <Button type="submit" className="rounded-lg px-3 text-sm font-semibold">
            Salvar
          </Button>
        </form>
      ) : null}
      {editDate ? (
        <input
          type="date"
          defaultValue={e.date.slice(0, 10)}
          onChange={(ev) => ev.target.value && update(e.id, { date: ev.target.value })}
          className="mt-2 w-full animate-fade-in rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
        />
      ) : null}
      {editSign ? (
        <div className="mt-2 flex animate-fade-in gap-2">
          <Button
            variant={e.is_negative ? "default" : "outline"}
            size="sm"
            onClick={() => {
              update(e.id, { is_negative: true });
              setEditSign(false);
            }}
          >
            Gasto (negativo)
          </Button>
          <Button
            variant={!e.is_negative ? "default" : "outline"}
            size="sm"
            onClick={() => {
              update(e.id, { is_negative: false });
              setEditSign(false);
            }}
          >
            Crédito (positivo)
          </Button>
        </div>
      ) : null}
    </div>
  );
}

function ListExpensesView({ onBack }: { onBack: () => void }) {
  const { expenses, loading, error, signedIn, refresh, update, remove, clear } = useExpenses();
  const totalGastos = expenses
    .filter((e) => e.is_negative)
    .reduce((sum, e) => sum + e.amount * e.qty, 0);
  const totalCreditos = expenses
    .filter((e) => !e.is_negative)
    .reduce((sum, e) => sum + e.amount * e.qty, 0);
  const saldo = totalCreditos - totalGastos;

  return (
    <div className="mt-6 space-y-4">
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1 text-sm opacity-80 hover:opacity-100"
        >
          <ArrowLeft className="size-4" /> Voltar
        </button>
        <div className="flex items-center gap-2 text-sm">
          {signedIn ? (
            <span className="flex items-center gap-2">
              <Button asChild variant="outline" size="sm" className="border-white/20 bg-white text-slate-900">
                <Link to="/perfil">Meu perfil</Link>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="border-white/20 bg-white text-slate-900"
                onClick={() => void supabase.auth.signOut()}
              >
                Sair
              </Button>
            </span>
          ) : (
            <Button asChild variant="outline" size="sm">
              <Link to="/auth">Entrar ou criar conta</Link>
            </Button>
          )}
        </div>
      </div>

      {error ? (
        <div role="alert" className="text-sm text-[var(--shopee-foreground)]">
          {error} <Button variant="link" onClick={() => void refresh()}>Tentar novamente</Button>
        </div>
      ) : null}

      {loading ? (
        <p className="rounded-2xl bg-card p-8 text-center text-sm text-muted-foreground">
          Carregando gastos...
        </p>
      ) : null}

      {!loading && !error && expenses.length === 0 ? (
        <p className="rounded-2xl bg-card p-8 text-center text-sm text-muted-foreground">
          Nenhum gasto ainda — toque em "Adicionar Gastos" para registrar
        </p>
      ) : null}

      <div className="space-y-3">
        {expenses.map((e, i) => (
          <ExpenseRow key={e.id} e={e} i={i} update={update} remove={remove} />
        ))}
      </div>

      {expenses.length > 0 ? (
        <div className="mt-6 animate-scale-in overflow-hidden rounded-2xl bg-card shadow-2xl">
          <div className="flex justify-between px-4 py-3 text-sm">
            <span className="text-muted-foreground">Total de gastos</span>
            <span className="font-semibold tabular-nums text-foreground">{brl(totalGastos)}</span>
          </div>
          <div className="flex justify-between border-t border-border px-4 py-3 text-sm">
            <span className="text-muted-foreground">Total de créditos</span>
            <span className="font-semibold tabular-nums text-foreground">{brl(totalCreditos)}</span>
          </div>
          <div
            className={`flex items-baseline justify-between px-4 py-4 ${
              saldo >= 0
                ? "bg-[var(--gain)] text-[var(--gain-foreground)]"
                : "bg-[var(--loss)] text-[var(--loss-foreground)]"
            }`}
          >
            <span className="text-sm font-medium">Saldo</span>
            <span className="text-2xl font-bold tabular-nums">{brl(saldo)}</span>
          </div>
        </div>
      ) : null}

      {expenses.length > 0 ? (
        <Button
          variant="ghost"
          onClick={() => confirm("Apagar todos os gastos?") && clear()}
          className="mt-4 w-full text-center text-xs text-[var(--shopee-foreground)] opacity-70 hover:opacity-100"
        >
          Apagar todos
        </Button>
      ) : null}
    </div>
  );
}
