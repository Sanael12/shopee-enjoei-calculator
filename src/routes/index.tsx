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
              
              {/* IMAGEM PNG DA SHOPEE SALVA NA PASTA PUBLIC */}
              {it.brand === "shopee" && (
                <span className="size-20 shrink-0 overflow-hidden rounded-2xl shadow-lg bg-[#EE4D2D] flex items-center justify-center p-3">
                  <img src="/https://storage.googleapis.com/gpt-engineer-file-uploads/76366028-6cef-45ed-9c3d-33920d35bc0c/abda4562-7930-41a2-bab0-e69e942038f9?X-Goog-Algorithm=GOOG4-RSA-SHA256&X-Goog-Credential=go-api%40lovable-core-prod.iam.gserviceaccount.com%2F20260928%2Fauto%2Fstorage%2Fgoog4_request&X-Goog-Date=20260928T015952Z&X-Goog-Expires=3599&X-Goog-Signature=aa84f092aded07e6fb824f2b97748df786a919ac87cb9653df72241a47750d807d2b660ae3451880606929f805902a499fd3100ad1a8a5a5b86ba62956c8a6a82b2e3958236002451ae1f1559acda88876e0c80a5d65958e4eed7af5eb714d570a93b3c7b33cd98c2626daa304731be9c5e6adda1dd15dad8f50fa1a488d3f76340937fc001f35f4aae474a9474db8992159c5aff9faacdfa54d2ba40ba397a164a61b0d6b498589394224c29bfd30b27dd424d8c005e02eae41eda37986177f18daac546affac88c4d5d600899125de953d47f5aa7281e3f61e839c50fe846f591a493b438dce7cef8e6e763ce10d28ebea0235deb99ef5b84381435d6a83db&X-Goog-SignedHeaders=host" alt="Shopee" className="w-full h-full object-contain" />
                </span>
              )}

              {/* IMAGEM PNG DO ENJOEI SALVA NA PASTA PUBLIC */}
              {it.brand === "enjoei" && (
                <span className="size-20 shrink-0 overflow-hidden rounded-2xl shadow-lg bg-[#2E0025] flex items-center justify-center p-3">
                  <img src="/enjoei.png" alt="Enjoei" className="w-full h-full object-contain" />
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
