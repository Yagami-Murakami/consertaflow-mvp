import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AdminShell } from "@/components/admin/AdminShell";
import { StatusBadge } from "@/components/StatusBadge";
import { supabase } from "@/integrations/supabase/client";
import { fail, startOfToday } from "@/lib/admin-data";
import { formatDateTime } from "@/lib/consertaflow";

export const Route = createFileRoute("/_authenticated/admin/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — ConsertaFlow" }, { name: "description", content: "Visão geral da operação da assistência técnica." }, { property: "og:title", content: "Dashboard — ConsertaFlow" }, { property: "og:description", content: "Visão geral da operação da assistência técnica." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }, { name: "robots", content: "noindex" }] }),
  component: Dashboard,
});

function Dashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard"],
    queryFn: async () => {
      const [leads, orders, rem] = await Promise.all([
        supabase.from("leads").select("id, codigo, nome, status, created_at, convertido").order("created_at", { ascending: false }),
        supabase.from("service_orders").select("id, codigo, status, equipamento_tipo, updated_at, clients(nome)").order("updated_at", { ascending: false }),
        supabase.from("reminders").select("id, reminder_at").eq("concluido", false),
      ]);
      fail(leads.error); fail(orders.error); fail(rem.error);
      return { leads: leads.data!, orders: orders.data!, rem: rem.data! };
    },
  });

  const amanha = new Date(startOfToday().getTime() + 86400000);
  const cards = data
    ? [
        { label: "Leads novos", value: data.leads.filter((l) => l.status === "novo").length, to: "/admin/leads" as const },
        { label: "Ordens abertas", value: data.orders.filter((o) => !["entregue", "cancelado"].includes(o.status)).length, to: "/admin/ordens" as const },
        { label: "Prontas p/ retirada", value: data.orders.filter((o) => o.status === "pronto_retirada").length, to: "/admin/ordens" as const },
        { label: "Lembretes vencidos/hoje", value: data.rem.filter((r) => new Date(r.reminder_at) < amanha).length, to: "/admin/lembretes" as const },
      ]
    : [];

  return (
    <AdminShell title="Dashboard">
      {isLoading || !data ? (
        <p className="text-muted-foreground">Carregando…</p>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {cards.map((c) => (
              <Link key={c.label} to={c.to} className="surface p-4 hover:border-accent">
                <p className="text-sm text-muted-foreground">{c.label}</p>
                <p className="mt-1 text-3xl font-bold text-primary">{c.value}</p>
              </Link>
            ))}
          </div>
          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            <section className="surface p-4">
              <h2 className="mb-3 font-semibold">Últimos leads</h2>
              {data.leads.length === 0 && <p className="text-sm text-muted-foreground">Nenhum lead ainda.</p>}
              <ul className="divide-y divide-border">
                {data.leads.slice(0, 5).map((l) => (
                  <li key={l.id} className="flex items-center justify-between gap-2 py-2 text-sm">
                    <span><b>{l.codigo}</b> · {l.nome}<br /><span className="text-xs text-muted-foreground">{formatDateTime(l.created_at)}</span></span>
                    <StatusBadge status={l.status} />
                  </li>
                ))}
              </ul>
            </section>
            <section className="surface p-4">
              <h2 className="mb-3 font-semibold">Ordens recentes</h2>
              {data.orders.length === 0 && <p className="text-sm text-muted-foreground">Nenhuma ordem ainda.</p>}
              <ul className="divide-y divide-border">
                {data.orders.slice(0, 5).map((o) => (
                  <li key={o.id} className="py-2 text-sm">
                    <Link to="/admin/ordens/$id" params={{ id: o.id }} className="flex items-center justify-between gap-2">
                      <span><b>{o.codigo}</b> · {o.clients?.nome}<br /><span className="text-xs text-muted-foreground">{o.equipamento_tipo}</span></span>
                      <StatusBadge status={o.status} />
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </>
      )}
    </AdminShell>
  );
}