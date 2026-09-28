import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";
import { BRAND_BG, Logo } from "@/components/CalcShell";

export function AvaliacaoShell({
  title,
  subtitle,
  back,
  wide = false,
  children,
}: {
  title: string;
  subtitle?: string;
  back: "/" | "/avaliacao";
  wide?: boolean;
  children: ReactNode;
}) {
  return (
    <div className={`min-h-screen px-4 py-8 ${BRAND_BG.avaliacao}`}>
      <div className={`mx-auto w-full text-white ${wide ? "max-w-4xl" : "max-w-lg"}`}>
        <Link
          to={back}
          className="mb-6 inline-flex items-center gap-2 text-sm opacity-80 transition-opacity hover:opacity-100"
        >
          <ArrowLeft className="size-4" /> Voltar
        </Link>
        <header className="flex animate-fade-in items-center gap-3">
          <Logo brand="avaliacao" className="size-14" />
          <div>
            <h1 className="text-balance text-3xl font-bold tracking-tight">{title}</h1>
            {subtitle ? <p className="text-sm opacity-80">{subtitle}</p> : null}
          </div>
        </header>
        <main className="mt-6">{children}</main>
      </div>
    </div>
  );
}

export const fieldCls =
  "w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring";
