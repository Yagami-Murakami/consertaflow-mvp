import { Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Bell,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Users,
  Wrench,
  Inbox,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

const links = [
  { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/leads", label: "Leads", icon: Inbox },
  { to: "/admin/clientes", label: "Clientes", icon: Users },
  { to: "/admin/ordens", label: "Ordens", icon: ClipboardList },
  { to: "/admin/lembretes", label: "Lembretes", icon: Bell },
] as const;

export function AdminShell({
  title,
  actions,
  children,
}: {
  title: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: isAdmin, isLoading: checando } = useQuery({
    queryKey: ["is-admin"],
    queryFn: async () => {
      const { data } = await supabase.rpc("is_admin");
      return data === true;
    },
  });

  async function sair() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="min-h-screen bg-secondary/40">
      <header className="border-b border-border bg-primary text-primary-foreground">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <Link to="/admin/dashboard" className="flex items-center gap-2 font-semibold">
            <span className="flex size-8 items-center justify-center rounded-lg bg-accent">
              <Wrench className="size-4" />
            </span>
            ConsertaFlow
          </Link>
          <Button
            size="sm"
            variant="ghost"
            onClick={sair}
            className="text-primary-foreground hover:bg-white/10 hover:text-primary-foreground"
          >
            <LogOut className="size-4" /> Sair
          </Button>
        </div>
        <nav className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-2 pb-2 text-sm">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              activeProps={{ className: "bg-white/15" }}
              className="flex items-center gap-1.5 rounded-md px-3 py-1.5 whitespace-nowrap transition-colors hover:bg-white/10"
            >
              <l.icon className="size-4" /> {l.label}
            </Link>
          ))}
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-xl font-bold text-primary sm:text-2xl">{title}</h1>
          {actions}
        </div>
        {checando ? (
          <p className="text-muted-foreground">Verificando acesso…</p>
        ) : isAdmin ? (
          children
        ) : (
          <EmptyState titulo="Acesso restrito" texto="Sua conta não tem permissão de administrador." />
        )}
      </main>
    </div>
  );
}

export function EmptyState({ titulo, texto }: { titulo: string; texto?: string }) {
  return (
    <div className="surface p-10 text-center">
      <p className="font-medium text-foreground">{titulo}</p>
      {texto && <p className="mt-1 text-sm text-muted-foreground">{texto}</p>}
    </div>
  );
}