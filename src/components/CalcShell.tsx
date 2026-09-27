import { Link } from "@tanstack/react-router";
import { ArrowLeft, Check, Save, Skull } from "lucide-react";
import { useState, type ReactNode } from "react";
import { brl, LEVEL_STYLE, profitLevel, type Result } from "@/lib/calc";
import shopeeLogo from "@/assets/shopee-logo.png.asset.json";
import enjoeiLogo from "@/assets/enjoei-logo.png.asset.json";

export type Brand = "shopee" | "enjoei";
export const LOGOS: Record<Brand, string> = { shopee: shopeeLogo.url, enjoei: enjoeiLogo.url };
export const BRAND_BG: Record<Brand, string> = {
  shopee: "bg-gradient-to-br from-[var(--shopee)] to-[var(--shopee-2)]",
  enjoei: "bg-gradient-to-br from-[var(--enjoei)] to-[var(--enjoei-2)]",
};

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
          <ArrowLeft className="size-4" /> voltar
        </Link>
        <div className="flex animate-fade-in items-center gap-3">
          <img src={LOGOS[brand]} alt={title} className="size-14 rounded-2xl shadow-lg" />
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
        <span className="text-sm text-muted-foreground">R$</span>
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
      {LEVEL_STYLE[lvl].label}
    </span>
  );
}

export function ResultCard({ result, onSave }: { result: Result; onSave?: () => void }) {
  const lvl = profitLevel(result.profit, result.margin);
  const [saved, setSaved] = useState(false);
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
          <span className="text-muted-foreground">Você recebe da plataforma</span>
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
            margem sobre a venda: {result.margin.toFixed(1)}% · {LEVEL_STYLE[lvl].label}
          </div>
        </div>
      </div>
      {onSave ? (
        <button
          onClick={() => {
            onSave();
            setSaved(true);
            setTimeout(() => setSaved(false), 1800);
          }}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 font-semibold text-primary-foreground shadow-md transition-transform hover:scale-[1.02] active:scale-95"
        >
          {saved ? <Check className="size-5 animate-scale-in" /> : <Save className="size-5" />}
          {saved ? "venda salva!" : "salvar venda"}
        </button>
      ) : null}
    </div>
  );
}
