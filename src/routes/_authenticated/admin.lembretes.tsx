import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AdminShell, EmptyState } from "@/components/admin/AdminShell";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { fail, startOfToday } from "@/lib/admin-data";
import { formatDateTime } from "@/lib/consertaflow";

export const Route = createFileRoute("/_authenticated/admin/lembretes")({
  head: () => ({ meta: [{ title: "Lembretes — ConsertaFlow" }, { name: "description", content: "Lembretes de atendimentos e ordens de serviço." }, { property: "og:title", content: "Lembretes — ConsertaFlow" }, { property: "og:description", content: "Lembretes de atendimentos e ordens de serviço." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }, { name: "robots", content: "noindex" }] }),
  component: LembretesPage,
});

function LembretesPage() {
  const qc = useQueryClient();
  const { data = [], isLoading } = useQuery({
    queryKey: ["reminders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reminders")
        .select("*, service_orders(id, codigo, clients(nome))")
        .eq("concluido", false)
        .order("reminder_at");
      fail(error);
      return data!;
    },
  });

  const concluir = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from("reminders").update({ concluido: true }).eq("id", id); fail(error); },
    onSuccess: () => { toast.success("Lembrete concluído."); qc.invalidateQueries({ queryKey: ["reminders"] }); },
    onError: (e) => toast.error(e.message),
  });

  const now = new Date();
  const amanha = new Date(startOfToday().getTime() + 86400000);
  const grupos = [
    { titulo: "Vencidos", itens: data.filter((r) => new Date(r.reminder_at) < now), cls: "text-destructive" },
    { titulo: "Hoje", itens: data.filter((r) => { const d = new Date(r.reminder_at); return d >= now && d < amanha; }), cls: "text-warning" },
    { titulo: "Próximos", itens: data.filter((r) => new Date(r.reminder_at) >= amanha), cls: "text-primary" },
  ];

  return (
    <AdminShell title="Lembretes">
      <p className="mb-4 text-sm text-muted-foreground">Crie lembretes dentro de cada ordem de serviço.</p>
      {isLoading ? <p className="text-muted-foreground">Carregando…</p> : data.length === 0 ? (
        <EmptyState titulo="Nenhum lembrete pendente" texto="Tudo em dia." />
      ) : (
        <div className="grid gap-4 lg:grid-cols-3">
          {grupos.map((g) => (
            <section key={g.titulo} className="surface p-4">
              <h2 className={`mb-3 font-semibold ${g.cls}`}>{g.titulo} ({g.itens.length})</h2>
              {g.itens.length === 0 && <p className="text-sm text-muted-foreground">Nada aqui.</p>}
              <ul className="space-y-3">
                {g.itens.map((r) => (
                  <li key={r.id} className="text-sm">
                    <p>{r.texto}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDateTime(r.reminder_at)} ·{" "}
                      {r.service_orders && (
                        <Link to="/admin/ordens/$id" params={{ id: r.service_orders.id }} className="underline">
                          {r.service_orders.codigo} {r.service_orders.clients?.nome}
                        </Link>
                      )}
                    </p>
                    <Button size="sm" variant="outline" className="mt-1" onClick={() => concluir.mutate(r.id)}>Marcar como concluído</Button>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </AdminShell>
  );
}