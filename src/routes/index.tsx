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
  enjoei: "hover:border-[#2E0025]",
  doces: "hover:border-[#F05B78]",
  vendas: "hover:border-[#042F1A]",
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
              
              {/* LOGO OFICIAL DA SHOPEE EM VETOR PURA (NUNCA QUEBRA) */}
              {it.brand === "shopee" && (
                <span className="size-20 shrink-0 overflow-hidden rounded-2xl shadow-lg bg-[#EE4D2D] flex items-center justify-center p-3.5">
                  <svg viewBox="0 0 24 24" className="w-full h-full fill-white" xmlns="http://w3.org">
                    <path d="M19 6h-2c0-2.76-2.24-5-5-5S7 3.24 7 6H5c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-7-3c1.66 0 3 1.34 3 3H9c0-1.66 1.34-3 3-3zm1 12.5h-2v.5c0 .28-.22.5-.5.5h-.5c-.28 0-.5-.22-.5-.5v-.5c-.83-.08-1.5-.54-1.78-1.18-.1-.23 0-.5.23-.6l.45-.22c.18-.09.4 0 .5.17.15.34.49.58.9.58.5 0 .82-.26.82-.58 0-.25-.17-.4-.66-.54l-.82-.23c-.85-.24-1.25-.76-1.25-1.4 0-.59.42-1.07 1.05-1.3v-.35c0-.28.22-.5.5-.5h.5c.28 0 .5.22.5.5v.35c.6.09 1.09.43 1.34.93.1.2.02.47-.18.57l-.37.2c-.17.09-.4 0-.5-.16-.14-.24-.39-.4-.79-.4-.41 0-.66.19-.66.43 0 .22.18.33.61.45l.83.24c.83.24 1.28.75 1.28 1.39 0 .42-.16.79-.42 1.04z" />
                  </svg>
                </span>
              )}

              {/* LOGO OFICIAL DO ENJOEI EM VETOR PURA (NUNCA QUEBRA) */}
              {it.brand === "enjoei" && (
                <span className="size-20 shrink-0 overflow-hidden rounded-2xl shadow-lg bg-[#2E0025] flex items-center justify-center p-3">
                  <svg viewBox="0 0 100 100" className="w-full h-full fill-white" xmlns="http://w3.org">
                    <path d="M50 15c-19.3 0-35 15.7-35 35s15.7 35 35 35 35-15.7 35-35-15.7-35-35-35zm0 54c-10.5 0-19-8.5-19-19s8.5-19 19-19 19 8.5 19 19-8.5 19-19 19zm-13.6-19h27.2c0 7.5-6.1 13.6-13.6 13.6S36.4 57.5 36.4 50z"/>
                  </svg>
                </span>
              )}

              {/* CARTÃO DE DOCES EM ROSA */}
              {it.brand === "doces" && (
                <span className="size-20 shrink-0 overflow-hidden rounded-2xl shadow-lg bg-gradient-to-br from-[#F05B78] to-[#D03B58] flex items-center justify-center text-white">
                  <Candy className="size-1/2" />
                </span>
              )}

              {/* CARTÃO DE VENDAS EM VERDE ESCURO */}
              {it.brand === "vendas" && (
                <span className="size-20 shrink-0 overflow-hidden rounded-2xl shadow-lg bg-gradient-to-br from-[#042F1A] to-[#0B4F2C] flex items-center justify-center text-white">
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
