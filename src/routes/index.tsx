import { createFileRoute, Link } from "@tanstack/react-router";
import { Candy, Receipt } from "lucide-react";

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
  shopee: "hover:border-[#EE4D2D]",
  enjoei: "hover:border-[#F05B78]",
  doces: "hover:border-[#F05B78]",
  vendas: "hover:border-[#0F172A]",
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
              
              {/* ÍCONE DA SHOPEE IDÊNTICO AO APLICATIVO OFICIAL */}
              {it.brand === "shopee" && (
                <span className="size-20 shrink-0 overflow-hidden rounded-2xl shadow-lg bg-[#EE4D2D] flex items-center justify-center p-3">
                  <svg viewBox="0 0 24 24" className="w-full h-full fill-white">
                    <path d="M19 6.5h-3c0-2.5-1.8-4.5-4-4.5s-4 2-4 4.5H5c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-11c0-1.1-.9-2-2-2zm-7-4c1.1 0 2 1.3 2 3H10c0-1.7.9-3 2-3zm2.5 11.3c-.3.5-.8.9-1.5 1.1v.6c0 .3-.2.5-.5.5h-.5c-.3 0-.5-.2-.5-.5v-.5c-.9-.1-1.6-.6-1.9-1.3-.1-.3 0-.6.3-.7l.5-.3c.2-.1.5 0 .6.2.2.4.6.7 1.1.7.6 0 1-.3 1-.7 0-.3-.2-.5-.8-.7l-1-.3c-1-.3-1.5-.9-1.5-1.7 0-.7.5-1.3 1.3-1.6v-.4c0-.3.2-.5.5-.5h.5c\$.3 0 .5.2.5.5v.4c.7.1 1.3.5 1.6 1.1.1.3 0 .6-.3.7l-.4.3c-.2.1-.5 0-.6-.2-.2-.3-.5-.5-.9-.5-.5 0-.8.2-.8.5 0 .3.2.4.7.6l1 .3c1 .3 1.5.9 1.5 1.7 0 .5-.2.9-.5 1.2z" />
                  </svg>
                </span>
              )}

              {/* ÍCONE DO ENJOEI IDÊNTICO AO APLICATIVO OFICIAL */}
              {it.brand === "enjoei" && (
                <span className="size-20 shrink-0 overflow-hidden rounded-2xl shadow-lg bg-[#2E0025] flex items-center justify-center p-3">
                  <svg viewBox="0 0 24 24" className="w-full h-full fill-white">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 12 10 10-4.48 10-12S17.52 2 12 2zm0 16c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6zm-4-6h8c0 2.21-1.79 4-4 4s-4-1.79-4-4z" />
                  </svg>
                </span>
              )}

              {/* ÍCONE DE DOCES ATUALIZADO PARA ROSA */}
              {it.brand === "doces" && (
                <span className="size-20 shrink-0 overflow-hidden rounded-2xl shadow-lg bg-gradient-to-br from-[#F05B78] to-[#D03B58] flex items-center justify-center text-white">
                  <Candy className="size-1/2" />
                </span>
              )}

              {/* ÍCONE DE VENDAS ATUALIZADO PARA VERDE ESCURO */}
              {it.brand === "vendas" && (
                <span className="size-20 shrink-0 overflow-hidden rounded-2xl shadow-lg bg-[#0F172A] flex items-center justify-center text-white">
                  <Receipt className="size-1/2" />
                </span>
              )}

            </span>
            <span className="text-lg font-bold text-foreground">{it.label}</span>
            <span className="text-xs text-muted-foreground">{it.hint}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
