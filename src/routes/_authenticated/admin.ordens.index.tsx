import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { AdminShell, EmptyState } from "@/components/admin/AdminShell";
import { StatusBadge } from "@/components/StatusBadge";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { fail } from "@/lib/admin-data";
import { ORDER_STATUS, formatDate, formatMoney } from "@/lib/consertaflow";

export const Route = createFileRoute("/_authenticated/admin/ordens/")({
  head: () => ({ meta: [{ title: "Ordens de serviço — ConsertaFlow" }, { name: "description", content: "Acompanhamento das ordens de serviço da assistência." }, { property: "og:title", content: "Ordens de serviço — ConsertaFlow" }, { property: "og:description", content: "Acompanhamento das ordens de serviço da assistência." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }, { name: "robots", content: "noindex" }] }),
  component: OrdensPage,
});

function OrdensPage() {
  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState("abertas");
  const { data = [], isLoading } = useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("service_orders")
        .select("*, clients(nome, whatsapp)")
        .order("updated_at", { ascending: false });
      fail(error);
      return data!;
    },
  });

  const q = busca.toLowerCase().trim();
  const lista = data.filter((o) => {
    const okStatus =
      filtro === "todas" ||
      (filtro === "abertas" ? !["entregue", "cancelado"].includes(o.status) : o.status === filtro);
    const okBusca =
      !q ||
      [o.codigo, o.equipamento_tipo, o.marca_modelo ?? "", o.clients?.nome ?? "", o.clients?.whatsapp ?? ""].some((v) =>
        v.toLowerCase().includes(q),
      );
    return okStatus && okBusca;
  });

  return (
    <AdminShell title="Ordens de serviço">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row">
        <Input placeholder="Buscar por código, cliente, WhatsApp ou equipamento" value={busca} onChange={(e) => setBusca(e.target.value)} />
        <select className="h-9 rounded-md border border-input bg-background px-3 text-sm" value={filtro} onChange={(e) => setFiltro(e.target.value)}>
          <option value="abertas">Em aberto</option>
          <option value="todas">Todas</option>
          {ORDER_STATUS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
      </div>
      {isLoading ? <p className="text-muted-foreground">Carregando…</p> : lista.length === 0 ? (
        <EmptyState titulo="Nenhuma ordem encontrada" texto="Converta um lead para criar uma ordem de serviço." />
      ) : (
        <div className="grid gap-2">
          {lista.map((o) => (
            <Link key={o.id} to="/admin/ordens/$id" params={{ id: o.id }} className="surface flex flex-wrap items-center justify-between gap-2 p-4 hover:border-accent">
              <div>
                <p className="font-semibold">{o.codigo} · {o.clients?.nome}</p>
                <p className="text-sm text-muted-foreground">
                  {o.equipamento_tipo}{o.marca_modelo ? ` — ${o.marca_modelo}` : ""} · Prazo: {formatDate(o.prazo_previsto)} · {formatMoney(o.valor_estimado)}
                </p>
              </div>
              <StatusBadge status={o.status} />
            </Link>
          ))}
        </div>
      )}
    </AdminShell>
  );
}