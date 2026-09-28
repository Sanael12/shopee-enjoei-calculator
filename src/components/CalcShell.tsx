import { Link } from "@tanstack/react-router";
import { ArrowLeft, Candy, Check, Receipt, Save, Skull } from "lucide-react";
import { useState, type ReactNode } from "react";
import { brl, LEVEL_STYLE, profitLevel, type Result } from "@/lib/calc";
import { today } from "@/lib/sales";
import { Button } from "@/components/ui/button";

export type Brand = "shopee" | "enjoei" | "doces" | "vendas";
export const BRAND_BG: Record<Brand, string> = {
  shopee: "bg-gradient-to-br from-[var(--shopee)] to-[var(--shopee-2)]",
  enjoei: "bg-gradient-to-br from-[var(--enjoei)] to-[var(--enjoei-2)]",
  doces: "bg-gradient-to-br from-[var(--doces)] to-[var(--doces-2)]",
  vendas: "bg-gradient-to-br from-[var(--vendas)] to-[var(--vendas-2)]",
};

export function Logo({ brand, className = "size-14" }: { brand: Brand; className?: string }) {
  const base = `${className} shrink-0 overflow-hidden rounded-2xl shadow-lg`;
  
  if (brand === "shopee") {
    return (
      <span className={`${base} block`}>
        <img src="https://r2.dev" alt="Shopee" className="size-full object-cover" />
      </span>
    );
  }
  
  if (brand === "enjoei") {
    return (
      <span className={`${base} block`}>
        <img src="https://r2.dev" alt="Enjoei" className="size-full object-cover" />
      </span>
    );
  }

  const Icon = brand === "doces" ? Candy : Receipt;
  return (
    <span className={`${base} flex items-center justify-center ${BRAND_BG[brand]} text-[var(--shopee-foreground)]`}>
      <Icon className="size-1/2" />
    </span>
  );
}

export function CalcShell({
  title,
  subtitle,
  brand,
  children,
}: {
  title: string;
  subtitle?: string;
  brand: Brand;
  children: ReactNode;
}) {
  return (
    <div className={`min-h-screen px-4 py-8 ${BRAND_BG[brand]}`}>
      <div className="mx-auto w-full max-w-lg text-[var(--shopee-foreground)]">
        <Link
          to="/"
          className="mb-6 inline-flex items-center gap-2 text-sm opacity-80 transition-opacity hover:opacity-100"
        >
          <ArrowLeft className="size-4" /> Voltar
        </Link>
        <div className="flex animate-fade-in items-center gap-3">
          <Logo brand={brand} />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
            {subtitle ? <p className="text-sm opacity-80">{subtitle}</p> : null}
          </div>
        </div>
        <div className="mt-6 animate-fade-in space-y-5 rounded-3xl bg-card p-5 text-card-foreground shadow-2xl">
          {children}
        </div>
      </div>
    </div>
  );
}

export function MoneyField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-foreground">{label}</span>
      <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-3 shadow-sm transition-shadow focus-within:shadow-md focus-within:ring-2 focus-within:ring-ring">
        <span className="text-sm text-muted-foreground">R\$</span>
        <input
          inputMode="decimal"
          value={value}
          placeholder="0,00"
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-transparent text-lg font-semibold text-foreground outline-none placeholder:text-muted-foreground/60"
        />
      </div>
    </label>
  );
}

export function ProfitBadge({ profit, margin }: { profit: number; margin: number }) {
  const lvl = profitLevel(profit, margin);
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${LEVEL_STYLE[lvl].cls}`}
    >
      {lvl === "loss" ? <Skull className="size-3" /> : null}
      {LEVEL_STYLE[lvl].label.charAt(0).toUpperCase() + LEVEL_STYLE[lvl].label.slice(1)}
    </span>
  );
}

export type SaveInfo = { name: string; date: string; qty: number };

const inputCls =
  "w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring";

export function ResultCard({
  result,
  onSave,
}: {
  result: Result;
  onSave?: (info: SaveInfo) => Promise<"saved" | "needsAuth">;
}) {
  const lvl = profitLevel(result.profit, result.margin);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [name, setName] = useState("");
  const [date, setDate] = useState(today());
  const [qty, setQty] = useState("1");
  const q = Math.max(1, Math.floor(Number(qty) || 1));
  return (
    <div className="animate-scale-in space-y-3">
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="divide-y divide-border">
          {result.lines.map((l) => (
            <div key={l.label} className="flex items-center justify-between px-4 py-2.5 text-sm">
              <span className="text-muted-foreground">{l.label}</span>
              <span className="font-medium tabular-nums text-foreground">{brl(l.value)}</span>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between bg-muted px-4 py-2.5 text-sm">
          <span className="text-muted-foreground">Você recebe</span>
          <span className="font-semibold tabular-nums text-foreground">{brl(result.received)}</span>
        </div>
        <div className={`px-4 py-4 transition-colors duration-500 ${LEVEL_STYLE[lvl].cls}`}>
          <div className="flex items-baseline justify-between">
            <span className="flex items-center gap-2 text-sm font-medium opacity-90">
              {lvl === "loss" ? <Skull className="size-6 animate-bounce" /> : null}
              Seu lucro
            </span>
            <span key={result.profit.toFixed(2)} className="animate-scale-in text-2xl font-bold tabular-nums">
              {brl(result.profit)}
            </span>
          </div>
          <div className="mt-1 text-xs opacity-80">
            Margem sobre a venda: {result.margin.toFixed(1)}% · {LEVEL_STYLE[lvl].label}
          </div>
        </div>
      </div>
      {onSave ? (
        <div className="space-y-3 rounded-2xl border border-border bg-muted/50 p-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nome do produto vendido"
            className={inputCls}
          />
          <div className="grid grid-cols-2 gap-3">
            <label className="text-xs text-muted-foreground">
              Data da venda
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={`${inputCls} mt-1`} />
            </label>
            <label className="text-xs text-muted-foreground">
              Quantidade vendida
              <input
                type="number"
                min={1}
                value={qty}
                onChange={(e) => setQty(e.target.value)}
                className={`${inputCls} mt-1`}
              />
            </label>
          </div>
          {q > 1 ? (
            <p className="text-xs text-muted-foreground">
              Lucro total de {q} unidades: <b className="text-foreground">{brl(result.profit * q)}</b>
            </p>
          ) : null}
          <Button
            disabled={saving || saved}
            onClick={async () => {
              setSaving(true);
              setSaveMessage("");
              try {
                const status = await onSave({ name: name.trim(), date: date || today(), qty: q });
                setSaved(true);
                if (status === "needsAuth") setSaveMessage("Venda guardada neste navegador. Entre na sua conta para mantê-la e acessá-la em outros aparelhos.");
                setTimeout(() => setSaved(false), 1800);
              } catch {
                setSaveMessage("Não foi possível salvar. Tente novamente.");
              } finally {
                setSaving(false);
              }
            }}
            className="flex w-full items-center justify-center gap-2 rounded-xl py-3 font-semibold"
          >
            {saved ? (
              <>
                <Check className="size-4" /> Salvo com Sucesso!
              </>
            ) : (
              <>
                <Save className="size-4" /> Guardar Venda
              </>
            )}
          </Button>
          {saveMessage ? <p className="text-center text-xs font-medium text-amber-600 dark:text-amber-400">{saveMessage}</p> : null}
        </div>
      ) : null}
    </div>
  );
}
