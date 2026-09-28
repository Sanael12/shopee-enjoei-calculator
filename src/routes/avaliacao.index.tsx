import { createFileRoute, Link } from "@tanstack/react-router";
import { ClipboardPlus, LineChart } from "lucide-react";
import { AvaliacaoShell } from "@/components/avaliacao/AvaliacaoShell";
import { useAssessments } from "@/lib/assessments";

export const Route = createFileRoute("/avaliacao/")({
  head: () => ({
    meta: [
      { title: "Avaliação Física — Calculadora de Lucro" },
      { name: "description", content: "Registre suas medidas corporais e acompanhe sua evolução." },
    ],
  }),
  component: AvaliacaoMenu,
});

const OPTIONS = [
  { to: "/avaliacao/nova", icon: ClipboardPlus, title: "Adicionar ficha", hint: "Idade, altura, medidas e peso" },
  { to: "/avaliacao/resultados", icon: LineChart, title: "Ver resultados", hint: "Compare e veja sua evolução" },
] as const;

function AvaliacaoMenu() {
  const { assessments, signedIn } = useAssessments();
  return (
    <AvaliacaoShell title="Avaliação Física" subtitle="Medidas e evolução" back="/">
      <div className="space-y-4">
        {OPTIONS.map((o, i) => (
          <Link
            key={o.to}
            to={o.to}
            style={{ animationDelay: `${i * 90}ms` }}
            className="group flex w-full animate-pop items-center gap-4 rounded-3xl border-2 border-transparent bg-card/90 p-5 text-left shadow-lg backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:border-[var(--avaliacao)] hover:shadow-2xl active:scale-95"
          >
            <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--avaliacao)] to-[var(--avaliacao-2)] text-white shadow-lg transition-transform group-hover:scale-110">
              <o.icon className="size-7" />
            </span>
            <div>
              <div className="text-lg font-bold text-foreground">{o.title}</div>
              <div className="text-xs text-muted-foreground">
                {o.to === "/avaliacao/resultados" ? `${assessments.length} ficha(s) salva(s)` : o.hint}
              </div>
            </div>
          </Link>
        ))}
        <p className="text-center text-xs opacity-80">
          {signedIn
            ? "Fichas guardadas na sua conta"
            : "Entre na sua conta para guardar as fichas permanentemente."}
        </p>
      </div>
    </AvaliacaoShell>
  );
}
