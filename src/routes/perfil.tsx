import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Check, LogOut, UserRound } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import type { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { BRAND_BG, Logo } from "@/components/CalcShell";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/perfil")({
  head: () => ({
    meta: [
      { title: "Meu perfil — Calculadora de Lucro" },
      { name: "description", content: "Gerencie os dados da sua conta na Calculadora de Lucro." },
      { property: "og:title", content: "Meu perfil — Calculadora de Lucro" },
      {
        property: "og:description",
        content: "Gerencie os dados da sua conta na Calculadora de Lucro.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    let active = true;
    void supabase.auth.getUser().then(({ data }) => {
      if (!active) return;
      if (!data.user) {
        void navigate({ to: "/auth", replace: true });
        return;
      }
      setUser(data.user);
      setName(getDisplayName(data.user));
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT" || !session?.user) {
        setUser(null);
        void navigate({ to: "/auth", replace: true });
        return;
      }
      setUser(session.user);
      setName(getDisplayName(session.user));
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [navigate]);

  const saveProfile = async (event: FormEvent) => {
    event.preventDefault();
    if (!supabase || !user) return;

    setSaving(true);
    setMessage("");
    setError("");
    const { data, error: updateError } = await supabase.auth.updateUser({
      data: { full_name: name.trim() },
    });

    if (updateError) {
      setError("Não foi possível salvar seu perfil. Tente novamente.");
    } else if (data.user) {
      setUser(data.user);
      setName(getDisplayName(data.user));
      setMessage("Perfil atualizado.");
    }
    setSaving(false);
  };

  const signOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
  };

  if (loading) {
    return (
      <div className={`flex min-h-screen items-center justify-center px-4 ${BRAND_BG.vendas}`}>
        <p className="text-[var(--shopee-foreground)]">Carregando perfil...</p>
      </div>
    );
  }

  if (!supabase) {
    return (
      <div className={`min-h-screen px-4 py-8 ${BRAND_BG.vendas}`}>
        <div className="mx-auto max-w-lg text-[var(--shopee-foreground)]">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm opacity-80 hover:opacity-100"
          >
            <ArrowLeft className="size-4" /> Voltar
          </Link>
          <div className="mt-8 rounded-3xl bg-card p-6 text-card-foreground shadow-2xl">
            <h1 className="text-2xl font-bold">Meu perfil</h1>
            <p className="mt-3 text-sm text-destructive">
              Configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY para conectar sua conta.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const initials =
    getDisplayName(user).trim().slice(0, 1).toUpperCase() ||
    user.email?.slice(0, 1).toUpperCase() ||
    "?";
  const provider = user.app_metadata.provider === "google" ? "Google" : "E-mail";

  return (
    <div className={`min-h-screen px-4 py-8 ${BRAND_BG.vendas}`}>
      <div className="mx-auto w-full max-w-lg text-[var(--shopee-foreground)]">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm opacity-80 hover:opacity-100"
        >
          <ArrowLeft className="size-4" /> Voltar
        </Link>
        <div className="mt-8 flex items-center gap-3">
          <Logo brand="vendas" className="size-14 ring-2 ring-[var(--shopee-foreground)]/40" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Meu perfil</h1>
            <p className="text-sm opacity-80">Seus dados e preferências de acesso</p>
          </div>
        </div>

        <div className="mt-6 space-y-5 rounded-3xl bg-card p-5 text-card-foreground shadow-2xl">
          <div className="flex items-center gap-4 rounded-2xl bg-muted p-4">
            <div
              className="flex size-14 items-center justify-center rounded-full bg-[var(--vendas)] text-xl font-bold text-white"
              aria-hidden="true"
            >
              {initials}
            </div>
            <div className="min-w-0">
              <p className="truncate font-semibold text-foreground">
                {getDisplayName(user) || "Sua conta"}
              </p>
              <p className="truncate text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>

          <form onSubmit={(event) => void saveProfile(event)} className="space-y-4">
            <label className="block text-sm font-medium text-foreground">
              Nome de exibição
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Como você quer ser chamado?"
                maxLength={80}
                className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-2.5 text-foreground outline-none focus:ring-2 focus:ring-ring"
              />
            </label>
            <label className="block text-sm font-medium text-foreground">
              E-mail
              <input
                value={user.email ?? ""}
                readOnly
                className="mt-1 w-full rounded-xl border border-input bg-muted px-3 py-2.5 text-muted-foreground outline-none"
              />
              <span className="mt-1 block text-xs font-normal text-muted-foreground">
                Conta conectada pelo {provider}.
              </span>
            </label>
            <Button
              type="submit"
              disabled={saving}
              className="flex w-full items-center justify-center gap-2"
            >
              {message && !saving ? <Check className="size-4" /> : <UserRound className="size-4" />}
              {saving ? "Salvando..." : message ? "Salvo!" : "Salvar alterações"}
            </Button>
          </form>

          {message ? (
            <p role="status" className="text-center text-sm text-[var(--gain)]">
              {message}
            </p>
          ) : null}
          {error ? (
            <p role="alert" className="text-center text-sm text-destructive">
              {error}
            </p>
          ) : null}

          <div className="border-t border-border pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => void signOut()}
              className="w-full gap-2"
            >
              <LogOut className="size-4" /> Sair da conta
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function getDisplayName(user: User) {
  const metadata = user.user_metadata as { full_name?: unknown; name?: unknown } | undefined;
  if (typeof metadata?.full_name === "string" && metadata.full_name.trim())
    return metadata.full_name;
  if (typeof metadata?.name === "string" && metadata.name.trim()) return metadata.name;
  return "";
}
