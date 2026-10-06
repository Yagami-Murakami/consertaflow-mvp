import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { MessageCircle } from "lucide-react";
import { AdminShell, EmptyState } from "@/components/admin/AdminShell";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { convertLead, fail, type Lead } from "@/lib/admin-data";
import { LEAD_STATUS, formatDateTime, whatsappLink } from "@/lib/consertaflow";

export const Route = createFileRoute("/_authenticated/admin/leads")({
  head: () => ({ meta: [{ title: "Leads — ConsertaFlow" }, { name: "description", content: "Pedidos recebidos pela assistência técnica." }, { property: "og:title", content: "Leads — ConsertaFlow" }, { property: "og:description", content: "Pedidos recebidos pela assistência técnica." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }, { name: "robots", content: "noindex" }] }),
  component: LeadsPage,
});

function LeadsPage() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState("todos");

  const { data = [], isLoading } = useQuery({
    queryKey: ["leads"],
    queryFn: async () => {
      const { data, error } = await supabase.from("leads").select("*").order("created_at", { ascending: false });
      fail(error);
      return data!;
    },
  });

  const setStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("leads").update({ status }).eq("id", id);
      fail(error);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["leads"] }),
    onError: (e) => toast.error(e.message),
  });

  const converter = useMutation({
    mutationFn: (lead: Lead) => convertLead(lead),
    onSuccess: (orderId) => {
      toast.success("Lead convertido em cliente e ordem de serviço.");
      qc.invalidateQueries();
      navigate({ to: "/admin/ordens/$id", params: { id: orderId } });
    },
    onError: (e) => toast.error(e.message),
  });

  const q = busca.toLowerCase().trim();
  const lista = data.filter(
    (l) =>
      (filtro === "todos" || l.status === filtro) &&
      (!q || [l.nome, l.whatsapp, l.codigo, l.equipamento_tipo, l.marca_modelo ?? ""].some((v) => v.toLowerCase().includes(q))),
  );

  return (
    <AdminShell title="Leads">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row">
        <Input placeholder="Buscar por nome, WhatsApp, código ou equipamento" value={busca} onChange={(e) => setBusca(e.target.value)} />
        <select className="h-9 rounded-md border border-input bg-background px-3 text-sm" value={filtro} onChange={(e) => setFiltro(e.target.value)}>
          <option value="todos">Todos os status</option>
          {LEAD_STATUS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
      </div>
      {isLoading ? <p className="text-muted-foreground">Carregando…</p> : lista.length === 0 ? (
        <EmptyState titulo="Nenhum lead encontrado" texto="Pedidos feitos pelo formulário público aparecem aqui." />
      ) : (
        <div className="grid gap-3">
          {lista.map((l) => (
            <article key={l.id} className="surface p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-semibold">{l.codigo} · {l.nome} {l.urgencia === "urgente" && <span className="ml-1 text-xs font-medium text-destructive">URGENTE</span>}</p>
                  <p className="text-sm text-muted-foreground">{l.equipamento_tipo}{l.marca_modelo ? ` — ${l.marca_modelo}` : ""} · {formatDateTime(l.created_at)}</p>
                </div>
                <StatusBadge status={l.status} />
              </div>
              <p className="mt-2 text-sm whitespace-pre-line">{l.problema}</p>
              <p className="mt-1 text-xs text-muted-foreground">WhatsApp: {l.whatsapp}{l.email ? ` · ${l.email}` : ""}{l.periodo_contato ? ` · contato: ${l.periodo_contato}` : ""}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button asChild size="sm" variant="outline">
                  <a href={whatsappLink(l.whatsapp, `Olá ${l.nome}, aqui é da assistência sobre seu pedido ${l.codigo}.`)} target="_blank" rel="noreferrer"><MessageCircle className="size-4" /> WhatsApp</a>
                </Button>
                {l.convertido ? (
                  l.order_id && <Button asChild size="sm" variant="outline"><Link to="/admin/ordens/$id" params={{ id: l.order_id }}>Ver ordem</Link></Button>
                ) : (
                  <>
                    <Button size="sm" disabled={converter.isPending} onClick={() => converter.mutate(l)}>Converter em ordem</Button>
                    {l.status !== "em_contato" && <Button size="sm" variant="secondary" onClick={() => setStatus.mutate({ id: l.id, status: "em_contato" })}>Marcar em contato</Button>}
                    {l.status !== "descartado" && <Button size="sm" variant="ghost" onClick={() => setStatus.mutate({ id: l.id, status: "descartado" })}>Descartar</Button>}
                  </>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </AdminShell>
  );
}