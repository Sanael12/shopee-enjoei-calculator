import { createFileRoute, Link } from "@tanstack/react-router";
import { ShoppingBag, Tag } from "lucide-react";

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
      {
        property: "og:description",
        content: "Descontos de comissão e tarifas calculados automaticamente.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-12">
      <h1 className="text-center text-3xl font-bold tracking-tight text-foreground">
        calculadora de lucro
      </h1>
      <p className="mt-2 text-center text-sm text-muted-foreground">
        escolha onde você está vendendo
      </p>

      <div className="mt-8 grid w-full max-w-md grid-cols-2 gap-4">
        <Link
          to="/shopee"
          className="group flex flex-col items-center gap-3 rounded-2xl border border-border bg-card p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
        >
          <span className="flex size-16 items-center justify-center rounded-2xl bg-[var(--shopee)] text-[var(--shopee-foreground)]">
            <ShoppingBag className="size-8" />
          </span>
          <span className="text-lg font-semibold text-foreground">Shopee</span>
        </Link>

        <Link
          to="/enjoei"
          className="group flex flex-col items-center gap-3 rounded-2xl border border-border bg-card p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
        >
          <span className="flex size-16 items-center justify-center rounded-2xl bg-[var(--enjoei)] text-[var(--enjoei-foreground)]">
            <Tag className="size-8" />
          </span>
          <span className="text-lg font-semibold text-foreground">Enjoei</span>
        </Link>
      </div>
    </div>
  );
}
