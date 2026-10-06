import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { AdminShell, EmptyState } from "@/components/admin/AdminShell";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { fail, type Client } from "@/lib/admin-data";
import { onlyDigits, whatsappLink } from "@/lib/consertaflow";

export const Route = createFileRoute("/_authenticated/admin/clientes")({
  head: () => ({ meta: [{ title: "Clientes — ConsertaFlow" }, { name: "description", content: "Cadastro e histórico de clientes da assistência técnica." }, { property: "og:title", content: "Clientes — ConsertaFlow" }, { property: "og:description", content: "Cadastro e histórico de clientes da assistência técnica." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }, { name: "robots", content: "noindex" }] }),
  component: ClientesPage,
});

function ClientesPage() {
  const qc = useQueryClient();
  const [busca, setBusca] = useState("");
  const [edit, setEdit] = useState<Partial<Client> | null>(null);

  const { data = [], isLoading } = useQuery({
    queryKey: ["clients"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("clients")
        .select("*, service_orders(id, codigo, status, equipamento_tipo)")
        .order("nome");
      fail(error);
      return data!;
    },
  });

  const salvar = useMutation({
    mutationFn: async (c: Partial<Client>) => {
      const nome = c.nome?.trim() ?? "";
      const whatsapp = c.whatsapp?.trim() ?? "";
      if (nome.length < 2 || onlyDigits(whatsapp).length < 8) throw new Error("Informe nome e WhatsApp válidos.");
      const dup = data.find((x) => x.id !== c.id && onlyDigits(x.whatsapp) === onlyDigits(whatsapp));
      if (dup) throw new Error(`Já existe cliente com este WhatsApp: ${dup.nome}.`);
      const payload = { nome, whatsapp, email: c.email?.trim() || null, observacoes: c.observacoes?.trim() || null };
      const { error } = c.id
        ? await supabase.from("clients").update(payload).eq("id", c.id)
        : await supabase.from("clients").insert(payload);
      fail(error);
    },
    onSuccess: () => { toast.success("Cliente salvo."); setEdit(null); qc.invalidateQueries({ queryKey: ["clients"] }); },
    onError: (e) => toast.error(e.message),
  });

  const q = busca.toLowerCase().trim();
  const lista = data.filter((c) => !q || [c.nome, c.whatsapp, c.email ?? ""].some((v) => v.toLowerCase().includes(q)));

  return (
    <AdminShell title="Clientes" actions={<Button onClick={() => setEdit({})}>Novo cliente</Button>}>
      <Input className="mb-4" placeholder="Buscar por nome, WhatsApp ou e-mail" value={busca} onChange={(e) => setBusca(e.target.value)} />
      {isLoading ? <p className="text-muted-foreground">Carregando…</p> : lista.length === 0 ? (
        <EmptyState titulo="Nenhum cliente encontrado" texto="Converta um lead ou cadastre um cliente." />
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {lista.map((c) => (
            <article key={c.id} className="surface p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold">{c.nome}</p>
                  <p className="text-sm text-muted-foreground">{c.whatsapp}{c.email ? ` · ${c.email}` : ""}</p>
                </div>
                <div className="flex gap-1">
                  <Button asChild size="sm" variant="outline"><a href={whatsappLink(c.whatsapp)} target="_blank" rel="noreferrer">WhatsApp</a></Button>
                  <Button size="sm" variant="ghost" onClick={() => setEdit(c)}>Editar</Button>
                </div>
              </div>
              {c.observacoes && <p className="mt-2 text-sm">{c.observacoes}</p>}
              <ul className="mt-3 space-y-1 text-sm">
                {c.service_orders.length === 0 && <li className="text-muted-foreground">Sem ordens.</li>}
                {c.service_orders.map((o) => (
                  <li key={o.id}>
                    <Link to="/admin/ordens/$id" params={{ id: o.id }} className="flex items-center justify-between hover:underline">
                      <span>{o.codigo} · {o.equipamento_tipo}</span><StatusBadge status={o.status} />
                    </Link>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      )}

      <Dialog open={!!edit} onOpenChange={(o) => !o && setEdit(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{edit?.id ? "Editar cliente" : "Novo cliente"}</DialogTitle></DialogHeader>
          {edit && (
            <form className="grid gap-3" onSubmit={(e) => { e.preventDefault(); salvar.mutate(edit); }}>
              <Input placeholder="Nome" value={edit.nome ?? ""} onChange={(e) => setEdit({ ...edit, nome: e.target.value })} />
              <Input placeholder="WhatsApp" value={edit.whatsapp ?? ""} onChange={(e) => setEdit({ ...edit, whatsapp: e.target.value })} />
              <Input placeholder="E-mail (opcional)" value={edit.email ?? ""} onChange={(e) => setEdit({ ...edit, email: e.target.value })} />
              <Textarea placeholder="Observações" value={edit.observacoes ?? ""} onChange={(e) => setEdit({ ...edit, observacoes: e.target.value })} />
              <Button type="submit" disabled={salvar.isPending}>Salvar</Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </AdminShell>
  );
}