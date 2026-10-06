import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, MessageCircle } from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { fail } from "@/lib/admin-data";
import { ORDER_STATUS, formatDateTime, statusLabel, whatsappLink } from "@/lib/consertaflow";

export const Route = createFileRoute("/_authenticated/admin/ordens/$id")({
  head: () => ({ meta: [{ title: "Ordem de serviço — ConsertaFlow" }, { name: "description", content: "Detalhes e andamento da ordem de serviço." }, { property: "og:title", content: "Ordem de serviço — ConsertaFlow" }, { property: "og:description", content: "Detalhes e andamento da ordem de serviço." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }, { name: "robots", content: "noindex" }] }),
  component: OrdemPage,
});

type Form = { diagnostico: string; valor: string; prazo: string; observacoes: string; status: string };

function OrdemPage() {
  const { id } = Route.useParams();
  const qc = useQueryClient();
  const [form, setForm] = useState<Form | null>(null);
  const [lembrete, setLembrete] = useState({ texto: "", quando: "" });

  const { data, isLoading } = useQuery({
    queryKey: ["order", id],
    queryFn: async () => {
      const [o, h, r] = await Promise.all([
        supabase.from("service_orders").select("*, clients(*)").eq("id", id).maybeSingle(),
        supabase.from("status_history").select("*").eq("order_id", id).order("created_at", { ascending: false }),
        supabase.from("reminders").select("*").eq("order_id", id).order("reminder_at"),
      ]);
      fail(o.error); fail(h.error); fail(r.error);
      return { order: o.data, history: h.data!, reminders: r.data! };
    },
  });

  useEffect(() => {
    const o = data?.order;
    if (o) setForm({
      diagnostico: o.diagnostico ?? "",
      valor: o.valor_estimado?.toString() ?? "",
      prazo: o.prazo_previsto ?? "",
      observacoes: o.observacoes ?? "",
      status: o.status,
    });
  }, [data?.order]);

  const refresh = () => { qc.invalidateQueries({ queryKey: ["order", id] }); qc.invalidateQueries({ queryKey: ["orders"] }); qc.invalidateQueries({ queryKey: ["reminders"] }); };

  const salvar = useMutation({
    mutationFn: async (f: Form) => {
      const valor = f.valor.trim() ? Number(f.valor.replace(",", ".")) : null;
      if (valor !== null && (isNaN(valor) || valor < 0)) throw new Error("Valor estimado inválido.");
      const { error } = await supabase.from("service_orders").update({
        diagnostico: f.diagnostico.trim() || null,
        valor_estimado: valor,
        prazo_previsto: f.prazo || null,
        observacoes: f.observacoes.trim() || null,
        status: f.status,
      }).eq("id", id);
      fail(error);
    },
    onSuccess: () => { toast.success("Ordem atualizada."); refresh(); },
    onError: (e) => toast.error(e.message),
  });

  const addLembrete = useMutation({
    mutationFn: async () => {
      if (lembrete.texto.trim().length < 2 || !lembrete.quando) throw new Error("Informe texto e data do lembrete.");
      const { error } = await supabase.from("reminders").insert({ order_id: id, texto: lembrete.texto.trim(), reminder_at: new Date(lembrete.quando).toISOString() });
      fail(error);
    },
    onSuccess: () => { setLembrete({ texto: "", quando: "" }); toast.success("Lembrete criado."); refresh(); },
    onError: (e) => toast.error(e.message),
  });

  const concluirLembrete = useMutation({
    mutationFn: async (rid: string) => { const { error } = await supabase.from("reminders").update({ concluido: true }).eq("id", rid); fail(error); },
    onSuccess: refresh,
  });

  if (isLoading || !data) return <AdminShell title="Ordem"><p className="text-muted-foreground">Carregando…</p></AdminShell>;
  const o = data.order;
  if (!o) return <AdminShell title="Ordem não encontrada"><Link to="/admin/ordens" className="underline">Voltar às ordens</Link></AdminShell>;
  const c = o.clients;
  const msg = `Olá ${c?.nome}, sua ordem ${o.codigo} (${o.equipamento_tipo}) está com status: ${statusLabel(o.status)}.`;

  return (
    <AdminShell
      title={`Ordem ${o.codigo}`}
      actions={<Button asChild variant="outline" size="sm"><Link to="/admin/ordens"><ArrowLeft className="size-4" /> Voltar</Link></Button>}
    >
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <section className="surface p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="font-semibold">{c?.nome}</p>
                <p className="text-sm text-muted-foreground">{c?.whatsapp}{c?.email ? ` · ${c.email}` : ""}</p>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status={o.status} />
                {c && <Button asChild size="sm" variant="outline"><a href={whatsappLink(c.whatsapp, msg)} target="_blank" rel="noreferrer"><MessageCircle className="size-4" /> Avisar</a></Button>}
              </div>
            </div>
            <p className="mt-3 text-sm"><b>Equipamento:</b> {o.equipamento_tipo}{o.marca_modelo ? ` — ${o.marca_modelo}` : ""}</p>
            <p className="mt-1 text-sm whitespace-pre-line"><b>Problema relatado:</b> {o.problema_relatado}</p>
            {o.completed_at && <p className="mt-1 text-sm text-success">Concluída em {formatDateTime(o.completed_at)}</p>}
          </section>

          {form && (
            <form className="surface grid gap-3 p-4" onSubmit={(e) => { e.preventDefault(); salvar.mutate(form); }}>
              <h2 className="font-semibold">Atendimento</h2>
              <div className="grid gap-1.5">
                <Label>Status</Label>
                <select className="h-9 rounded-md border border-input bg-background px-3 text-sm" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                  {ORDER_STATUS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
              <div className="grid gap-1.5"><Label>Diagnóstico</Label><Textarea value={form.diagnostico} onChange={(e) => setForm({ ...form, diagnostico: e.target.value })} /></div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="grid gap-1.5"><Label>Valor estimado (R$)</Label><Input inputMode="decimal" value={form.valor} onChange={(e) => setForm({ ...form, valor: e.target.value })} placeholder="0,00" /></div>
                <div className="grid gap-1.5"><Label>Prazo previsto</Label><Input type="date" value={form.prazo} onChange={(e) => setForm({ ...form, prazo: e.target.value })} /></div>
              </div>
              <div className="grid gap-1.5"><Label>Observações</Label><Textarea value={form.observacoes} onChange={(e) => setForm({ ...form, observacoes: e.target.value })} /></div>
              <div className="flex flex-wrap gap-2">
                <Button type="submit" disabled={salvar.isPending}>Salvar alterações</Button>
                {o.status !== "entregue" && (
                  <Button type="button" variant="secondary" disabled={salvar.isPending} onClick={() => salvar.mutate({ ...form, status: "entregue" })}>Concluir (entregue)</Button>
                )}
              </div>
            </form>
          )}
        </div>

        <div className="space-y-4">
          <section className="surface p-4">
            <h2 className="mb-2 font-semibold">Lembretes</h2>
            <ul className="mb-3 space-y-2 text-sm">
              {data.reminders.length === 0 && <li className="text-muted-foreground">Nenhum lembrete.</li>}
              {data.reminders.map((r) => (
                <li key={r.id} className="flex items-start justify-between gap-2">
                  <span className={r.concluido ? "text-muted-foreground line-through" : ""}>{r.texto}<br /><span className="text-xs">{formatDateTime(r.reminder_at)}</span></span>
                  {!r.concluido && <Button size="sm" variant="ghost" onClick={() => concluirLembrete.mutate(r.id)}>Concluir</Button>}
                </li>
              ))}
            </ul>
            <div className="grid gap-2">
              <Input placeholder="Ex.: ligar para aprovar orçamento" value={lembrete.texto} onChange={(e) => setLembrete({ ...lembrete, texto: e.target.value })} />
              <Input type="datetime-local" value={lembrete.quando} onChange={(e) => setLembrete({ ...lembrete, quando: e.target.value })} />
              <Button size="sm" variant="outline" disabled={addLembrete.isPending} onClick={() => addLembrete.mutate()}>Adicionar lembrete</Button>
            </div>
          </section>
          <section className="surface p-4">
            <h2 className="mb-2 font-semibold">Histórico de status</h2>
            <ol className="space-y-2 text-sm">
              {data.history.map((h) => (
                <li key={h.id} className="border-l-2 border-accent pl-3">
                  {h.status_anterior ? `${statusLabel(h.status_anterior)} → ` : "Criada como "}<b>{statusLabel(h.status_novo)}</b>
                  <br /><span className="text-xs text-muted-foreground">{formatDateTime(h.created_at)}</span>
                </li>
              ))}
            </ol>
          </section>
        </div>
      </div>
    </AdminShell>
  );
}