import { createFileRoute, Link } from "@tanstack/react-router";
import { Receipt } from "lucide-react";
import { LOGOS } from "@/components/CalcShell";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Calculadora de Lucro — Shopee e Enjoei" },
      {
        name: "description",
        content:
          "Calcule quanto você recebe e quanto lucra em cada venda na Shopee e no Enjoei, já com comissões e tarifas.",
      },
      { property: "og:title", content: "Calculadora de Lucro — Shopee e Enjoei" },
      { property: "og:description", content: "Descontos de comissão e tarifas calculados automaticamente." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Index,
});

const card =
  "group flex animate-pop flex-col items-center gap-3 rounded-3xl border border-border bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:rotate-1 hover:shadow-2xl active:scale-95";

function Index() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-4 py-12">
      <div className="pointer-events-none absolute -left-20 top-10 size-72 animate-blob rounded-full bg-[var(--shopee)] opacity-20 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 bottom-10 size-72 animate-blob rounded-full bg-[var(--enjoei)] opacity-20 blur-3xl [animation-delay:-4s]" />

      <h1 className="animate-fade-in text-center text-4xl font-bold tracking-tight text-foreground">
        calculadora de lucro
      </h1>
      <p className="mt-2 animate-fade-in text-center text-sm text-muted-foreground">
        escolha onde você está vendendo
      </p>

      <div className="relative mt-10 grid w-full max-w-xl grid-cols-3 gap-4">
        <Link to="/shopee" className={card}>
          <img src={LOGOS.shopee} alt="Shopee" className="size-20 animate-float rounded-2xl transition-transform group-hover:scale-110" />
          <span className="text-lg font-semibold text-foreground">Shopee</span>
        </Link>
        <Link to="/enjoei" className={`${card} [animation-delay:100ms]`}>
          <img src={LOGOS.enjoei} alt="Enjoei" className="size-20 animate-float rounded-2xl transition-transform [animation-delay:-1s] group-hover:scale-110" />
          <span className="text-lg font-semibold text-foreground">Enjoei</span>
        </Link>
        <Link to="/vendas" className={`${card} [animation-delay:200ms]`}>
          <span className="flex size-20 animate-float items-center justify-center rounded-2xl bg-primary text-primary-foreground transition-transform [animation-delay:-2s] group-hover:scale-110">
            <Receipt className="size-10" />
          </span>
          <span className="text-lg font-semibold text-foreground">Vendas</span>
        </Link>
      </div>
    </div>
  );
}
