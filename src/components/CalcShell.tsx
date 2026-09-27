import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";
import { brl, type Result } from "@/lib/calc";

export function CalcShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background px-4 py-8">
      <div className="mx-auto w-full max-w-lg">
        <Link
          to="/"
          className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> voltar
        </Link>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">{title}</h1>
        {subtitle ? <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p> : null}
        <div className="mt-6 space-y-5">{children}</div>
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
      <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-3 shadow-sm focus-within:ring-2 focus-within:ring-ring">
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

export function ResultCard({ result }: { result: Result }) {
  const positive = result.profit >= 0;
  return (
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
      <div
        className={`px-4 py-4 ${positive ? "bg-[var(--gain)] text-[var(--gain-foreground)]" : "bg-destructive text-destructive-foreground"}`}
      >
        <div className="flex items-baseline justify-between">
          <span className="text-sm font-medium opacity-90">Seu lucro</span>
          <span className="text-2xl font-bold tabular-nums">{brl(result.profit)}</span>
        </div>
        <div className="mt-1 text-xs opacity-80">
          margem sobre a venda: {result.margin.toFixed(1)}%
        </div>
      </div>
    </div>
  );
}
