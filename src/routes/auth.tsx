import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, ShieldCheck, Wrench } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Acesso administrativo — ConsertaFlow" },
      { name: "description", content: "Entre no painel administrativo do ConsertaFlow." },
      { property: "og:title", content: "Acesso administrativo — ConsertaFlow" },
      { property: "og:description", content: "Entre no painel administrativo do ConsertaFlow." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [modo, setModo] = useState<"login" | "setup">("login");
  const [existeAdmin, setExisteAdmin] = useState<boolean | null>(null);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    let ativo = true;
    supabase.rpc("admin_exists").then(({ data, error }) => {
      if (!ativo) return;
      setExisteAdmin(error ? true : Boolean(data));
    });
    supabase.auth.getSession().then(({ data }) => {
      if (ativo && data.session) navigate({ to: "/admin", replace: true });
    });
    return () => {
      ativo = false;
    };
  }, [navigate]);

  async function entrar(e: React.FormEvent) {
    e.preventDefault();
    if (carregando) return;
    setCarregando(true);
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password: senha });
    setCarregando(false);
    if (error) {
      toast.error("E-mail ou senha incorretos.");
      return;
    }
    toast.success("Bem-vindo de volta!");
    navigate({ to: "/admin", replace: true });
  }

  async function criarPrimeiroAdmin(e: React.FormEvent) {
    e.preventDefault();
    if (carregando) return;
    if (senha.length < 8) {
      toast.error("Use uma senha com pelo menos 8 caracteres.");
      return;
    }
    setCarregando(true);
    const { error: signUpError } = await supabase.auth.signUp({
      email: email.trim(),
      password: senha,
      options: {
        emailRedirectTo: window.location.origin,
        data: { nome: nome.trim() },
      },
    });
    if (signUpError) {
      setCarregando(false);
      toast.error(
        signUpError.message.includes("registered")
          ? "Este e-mail já está cadastrado. Faça login."
          : "Não foi possível criar a conta. Verifique os dados e tente novamente.",
      );
      return;
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: senha,
    });
    if (signInError) {
      setCarregando(false);
      toast.error("Conta criada. Agora faça login para continuar.");
      setModo("login");
      return;
    }

    const { data, error } = await supabase.rpc("claim_first_admin");
    setCarregando(false);
    if (error || data === false) {
      await supabase.auth.signOut();
      toast.error("A configuração de administrador já foi concluída por outra pessoa.");
      setExisteAdmin(true);
      setModo("login");
      return;
    }
    toast.success("Administrador configurado!");
    navigate({ to: "/admin", replace: true });
  }

  const emSetup = modo === "setup" && existeAdmin === false;

  return (
    <div className="flex min-h-screen flex-col bg-secondary/40">
      <header className="border-b border-border bg-background">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center gap-2 font-semibold text-primary">
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Wrench className="size-4" />
            </span>
            ConsertaFlow
          </Link>
          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
            Voltar ao site
          </Link>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="surface w-full max-w-md p-6 sm:p-8">
          <ShieldCheck className="size-8 text-accent" />
          <h1 className="mt-3 text-xl font-bold text-primary">
            {emSetup ? "Configurar primeiro administrador" : "Área administrativa"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {emSetup
              ? "Crie a conta do administrador responsável por esta assistência."
              : "Entre com seu e-mail e senha para acessar o painel."}
          </p>

          <form onSubmit={emSetup ? criarPrimeiroAdmin : entrar} className="mt-6 grid gap-4">
            {emSetup && (
              <div className="grid gap-1.5">
                <Label htmlFor="nome">Nome</Label>
                <Input
                  id="nome"
                  value={nome}
                  maxLength={120}
                  onChange={(e) => setNome(e.target.value)}
                  required
                />
              </div>
            )}
            <div className="grid gap-1.5">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="senha">Senha</Label>
              <Input
                id="senha"
                type="password"
                autoComplete={emSetup ? "new-password" : "current-password"}
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
              />
            </div>
            <Button type="submit" disabled={carregando}>
              {carregando && <Loader2 className="size-4 animate-spin" />}
              {emSetup ? "Criar administrador" : "Entrar"}
            </Button>
          </form>

          {existeAdmin === false && (
            <button
              type="button"
              onClick={() => setModo(modo === "setup" ? "login" : "setup")}
              className="mt-4 w-full text-center text-sm text-accent underline-offset-4 hover:underline"
            >
              {modo === "setup"
                ? "Já tenho uma conta — entrar"
                : "Primeiro acesso? Configurar administrador"}
            </button>
          )}
          {existeAdmin === true && (
            <p className="mt-4 text-center text-xs text-muted-foreground">
              A criação de administradores está desativada: esta assistência já possui um
              administrador.
            </p>
          )}
        </div>
      </main>
    </div>
  );
}