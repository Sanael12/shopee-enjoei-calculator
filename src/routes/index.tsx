import { createFileRoute, Link } from "@tanstack/react-router";
import { Candy, Receipt, ShoppingBag, Store } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Calculadora de Lucro — Shopee, Enjoei e Doces" },
      {
        name: "description",
        content: "Calcule quanto você lucra em cada venda na Shopee, no Enjoei e com seus doces, e guarde suas vendas.",
      },
      { property: "og:title", content: "Calculadora de Lucro — Shopee, Enjoei e Doces" },
      { property: "og:description", content: "Comissões, tarifas e lucro calculados automaticamente." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Index,
});

type Brand = "shopee" | "enjoei" | "doces" | "vendas";

const ITEMS: { to: "/shopee" | "/enjoei" | "/doces" | "/vendas"; brand: Brand; label: string; hint: string }[] = [
  { to: "/shopee", brand: "shopee", label: "Shopee", hint: "Comissão por faixa" },
  { to: "/enjoei", brand: "enjoei", label: "Enjoei", hint: "Grátis, clássico ou turbinado" },
  { to: "/doces", brand: "doces", label: "Doces", hint: "Custo de produção" },
  { to: "/vendas", brand: "vendas", label: "Vendas", hint: "Tudo que você salvou" },
];

const RING: Record<Brand, string> = {
  shopee: "hover:border-[var(--shopee)]",
  enjoei: "hover:border-[var(--enjoei)]",
  doces: "hover:border-[var(--doces)]",
  vendas: "hover:border-[var(--vendas)]",
};

const BRAND_BG: Record<Brand, string> = {
  shopee: "bg-gradient-to-br from-orange-500 to-amber-600",
  enjoei: "bg-gradient-to-br from-pink-500 to-rose-600",
  doces: "bg-gradient-to-br from-blue-400 to-teal-500",
  vendas: "bg-gradient-to-br from-violet-500 to-purple-600",
};

function Index() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-[var(--home-1)] via-[var(--home-2)] to-[var(--home-3)] px-4 py-12">
      <div className="pointer-events-none absolute -left-24 top-0 size-96 animate-blob rounded-full bg-orange-500 opacity-20 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-0 size-96 animate-blob rounded-full bg-pink-500 opacity-20 blur-3xl [animation-delay:-3s]" />

      <h1 className="relative animate-fade-in bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 bg-clip-text text-center text-5xl font-extrabold tracking-tight text-transparent">
        Calculadora de Lucro
      </h1>
      <p className="relative mt-3 animate-fade-in text-center text-base text-muted-foreground">
        Escolha onde você está vendendo
      </p>

      <div className="relative mt-10 grid w-full max-w-3xl grid-cols-2 gap-4 md:grid-cols-4">
        {ITEMS.map((it, i) => (
          <Link
            key={it.to}
            to={it.to}
            style={{ animationDelay: `${i * 90}ms` }}
            className={`group flex animate-pop flex-col items-center gap-3 rounded-3xl border-2 border-transparent bg-card/80 p-6 text-center shadow-lg backdrop-blur transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl active:scale-95 ${RING[it.brand]}`}
          >
            <span className="animate-float transition-transform group-hover:scale-110" style={{ animationDelay: `-${i * 0.7}s` }}>
              <span className={`size-20 shrink-0 overflow-hidden rounded-2xl shadow-lg flex items-center justify-center ${BRAND_BG[it.brand]} text-white`}>
                {it.brand === "shopee" && <ShoppingBag className="size-1/2" />}
                {it.brand === "enjoei" && <Store className="size-1/2" />}
                {it.brand === "doces" && <Candy className="size-1/2" />}
                {it.brand === "vendas" && <Receipt className="size-1/2" />}
              </span>
            </span>
            <span className="text-lg font-bold text-foreground">{it.label}</span>
            <span className="text-xs text-muted-foreground">{it.hint}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
