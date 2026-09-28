import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { BRAND_BG, Logo } from "@/components/CalcShell";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [
    { title: "Entrar — Calculadora de Lucro" },
    { name: "description", content: "Entre para guardar suas vendas e acessá-las novamente." },
    { property: "og:title", content: "Entrar — Calculadora de Lucro" },
    { property: "og:description", content: "Guarde suas vendas com segurança na sua conta." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ] }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [register, setRegister] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  useEffect(() => {
    if (!supabase) return;
    void supabase.auth.getUser().then(({ data }) => { if (data.user) void navigate({ to: "/vendas" }); });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN") void navigate({ to: "/vendas" });
    });
    return () => subscription.unsubscribe();
  }, [navigate]);
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!supabase) { setError("Configure a conexão com o banco de dados para entrar."); return; }
    setBusy(true); setError(""); setMessage("");
    try {
      if (register) {
        const { data, error: e } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: `${window.location.origin}/vendas` } });
        if (e) throw e;
        if (data.session) void navigate({ to: "/vendas" });
        else setMessage("Confira seu e-mail para confirmar sua conta. Depois, entre para recuperar suas vendas.");
      } else {
        const { error: e } = await supabase.auth.signInWithPassword({ email, password });
        if (e) throw e;
        void navigate({ to: "/vendas" });
      }
    } catch { setError(register ? "Não foi possível criar a conta. Confira os dados e tente novamente." : "E-mail ou senha incorretos. Tente novamente."); }
    finally { setBusy(false); }
  };
  const signInGoogle = async () => {
    if (!supabase) { setError("Configure a conexão com o banco de dados para entrar."); return; }
    setBusy(true); setError("");
    try {
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}/auth` },
      });
      if (oauthError) throw oauthError;
    } catch { setError("Não foi possível entrar com Google. Tente novamente."); }
    finally { setBusy(false); }
  };
  return <div className={`min-h-screen px-4 py-8 ${BRAND_BG.vendas}`}>
    <div className="mx-auto max-w-md">
      <Link to="/" className="inline-flex items-center gap-2 text-sm text-[var(--shopee-foreground)]"><ArrowLeft className="size-4" /> Voltar</Link>
      <div className="mt-8 flex items-center gap-3 text-[var(--shopee-foreground)]"><Logo brand="vendas" /><h1 className="text-3xl font-bold">{register ? "Criar conta" : "Entrar"}</h1></div>
      <div className="mt-6 space-y-5 rounded-2xl bg-card p-6 text-card-foreground shadow-xl">
        <p className="text-sm text-muted-foreground">Suas vendas ficam guardadas na sua conta e podem ser acessadas novamente ao entrar.</p>
        {!supabase && <p role="alert" className="text-sm text-destructive">Configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY para conectar sua conta.</p>}
        <Button type="button" variant="outline" className="w-full" disabled={busy} onClick={() => void signInGoogle()}>Continuar com Google</Button>
        <div className="text-center text-xs text-muted-foreground">Ou use seu e-mail</div>
        <form onSubmit={(e) => void submit(e)} className="space-y-3">
          <label className="block text-sm">E-mail<input type="email" required autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-foreground" /></label>
          <label className="block text-sm">Senha<input type="password" required minLength={6} autoComplete={register ? "new-password" : "current-password"} value={password} onChange={e => setPassword(e.target.value)} className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-foreground" /></label>
          <Button type="submit" disabled={busy} className="w-full">{busy ? "Aguarde..." : register ? "Criar conta" : "Entrar"}</Button>
        </form>
        {message && <p role="status" className="text-sm text-foreground">{message}</p>}
        {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
        <Button variant="link" className="w-full" onClick={() => { setRegister(!register); setError(""); setMessage(""); }}>{register ? "Já tenho uma conta" : "Criar uma conta"}</Button>
      </div>
    </div>
  </div>;
}
