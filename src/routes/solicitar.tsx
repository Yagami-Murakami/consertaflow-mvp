import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Check, CheckCircle2, Clock3, Loader2, MessageCircle, ShieldCheck, Wrench } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PERIODOS, TIPOS_EQUIPAMENTO, URGENCIAS, whatsappAssistencia } from "@/lib/consertaflow";

export const Route = createFileRoute("/solicitar")({
  head: () => ({ meta: [
    { title: "Solicitar atendimento — ConsertaFlow" },
    { name: "description", content: "Envie os dados do equipamento e solicite atendimento técnico com rapidez." },
    { property: "og:title", content: "Solicitar atendimento — ConsertaFlow" },
    { property: "og:description", content: "Conte o que está acontecendo com seu equipamento e receba o retorno da assistência." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: Solicitar,
});

const schema = z.object({
  nome: z.string().trim().min(2, "Informe seu nome completo.").max(120, "Nome muito longo."),
  whatsapp: z.string().trim().min(8, "Informe um WhatsApp válido com DDD.").max(25, "Número muito longo."),
  email: z.string().trim().max(200, "E-mail muito longo.").email("E-mail inválido.").optional().or(z.literal("")),
  equipamento_tipo: z.string().min(1, "Escolha o tipo de equipamento."),
  marca_modelo: z.string().trim().min(2, "Informe a marca e o modelo.").max(120, "Informação muito longa."),
  problema: z.string().trim().min(10, "Descreva o problema com pelo menos 10 caracteres.").max(2000, "Descrição muito longa."),
  urgencia: z.enum(["normal", "urgente"]),
  periodo_contato: z.enum(["manha", "tarde", "noite"]).optional(),
});

type FormState = { nome: string; whatsapp: string; email: string; equipamento_tipo: string; marca_modelo: string; problema: string; urgencia: string; periodo_contato: string };
type Sucesso = { codigo: string; equipamento_tipo: string; marca_modelo: string; problema: string };
const inicial: FormState = { nome: "", whatsapp: "", email: "", equipamento_tipo: "", marca_modelo: "", problema: "", urgencia: "normal", periodo_contato: "" };

function Brand() {
  return <Link to="/" className="flex items-center gap-2.5 font-bold text-primary"><span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground"><Wrench className="size-4" /></span><span className="text-lg">Conserta<span className="text-accent">Flow</span></span></Link>;
}

function Solicitar() {
  const [form, setForm] = useState<FormState>(inicial);
  const [erros, setErros] = useState<Partial<Record<keyof FormState, string>>>({});
  const [enviando, setEnviando] = useState(false);
  const [sucesso, setSucesso] = useState<Sucesso | null>(null);

  function set<K extends keyof FormState>(key: K, value: string) { setForm((f) => ({ ...f, [key]: value })); setErros((e) => ({ ...e, [key]: undefined })); }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (enviando) return;
    const parsed = schema.safeParse({ ...form, periodo_contato: form.periodo_contato || undefined });
    if (!parsed.success) {
      const novos: Partial<Record<keyof FormState, string>> = {};
      for (const issue of parsed.error.issues) { const campo = issue.path[0] as keyof FormState; if (!novos[campo]) novos[campo] = issue.message; }
      setErros(novos); toast.error("Confira os campos destacados.");
      window.setTimeout(() => document.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus(), 0);
      return;
    }
    setEnviando(true);
    const d = parsed.data;
    const { data, error } = await supabase.from("leads").insert({ nome: d.nome, whatsapp: d.whatsapp, email: d.email || null, equipamento_tipo: d.equipamento_tipo, marca_modelo: d.marca_modelo, problema: d.problema, urgencia: d.urgencia, periodo_contato: d.periodo_contato ?? null }).select("codigo, equipamento_tipo, marca_modelo, problema").single();
    setEnviando(false);
    if (error || !data) { toast.error("Não conseguimos enviar seu pedido agora. Tente novamente em instantes."); return; }
    toast.success("Pedido enviado!");
    setSucesso({ codigo: data.codigo, equipamento_tipo: data.equipamento_tipo, marca_modelo: data.marca_modelo ?? "", problema: data.problema });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="request-page min-h-screen bg-secondary/45">
      <header className="border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-5 py-3.5 lg:px-8">
          <Brand />
          <Button asChild variant="ghost" size="sm"><Link to="/"><ArrowLeft /> Voltar</Link></Button>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-5 py-10 sm:py-14 lg:px-8">
        {sucesso ? <SucessoView dados={sucesso} /> : (
          <>
            <div className="max-w-2xl">
              <p className="section-eyebrow">Solicitação de atendimento</p>
              <h1 className="mt-3 text-3xl font-bold text-primary sm:text-4xl">Conte o que está acontecendo.</h1>
              <p className="mt-3 leading-7 text-muted-foreground">Envie as informações do equipamento. A assistência recebe o pedido organizado e retorna pelo seu WhatsApp.</p>
            </div>
            <div className="mt-8 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
              <div className="rounded-xl border border-border bg-card shadow-[var(--shadow-card)]">
                <div className="border-b border-border px-5 py-5 sm:px-8">
                  <ol className="grid grid-cols-3" aria-label="Etapas da solicitação">
                    {["Dados", "Equipamento", "Problema"].map((item, i) => <li key={item} className="relative flex min-w-0 items-center gap-2 text-xs font-semibold text-muted-foreground before:absolute before:top-3 before:right-1/2 before:left-[-50%] before:h-px before:bg-border first:before:hidden"><span className="relative z-10 flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">{i + 1}</span><span className="truncate">{item}</span></li>)}
                  </ol>
                </div>
                <form onSubmit={onSubmit} noValidate className="p-5 sm:p-8">
                  <fieldset className="grid gap-5"><legend className="mb-5 text-lg font-semibold text-primary">Seus dados</legend>
                    <Campo id="nome" label="Nome completo" obrigatorio erro={erros.nome}><Input id="nome" autoComplete="name" value={form.nome} maxLength={120} onChange={(e) => set("nome", e.target.value)} placeholder="Seu nome e sobrenome" aria-invalid={!!erros.nome} /></Campo>
                    <div className="grid gap-5 sm:grid-cols-2"><Campo id="whatsapp" label="WhatsApp" obrigatorio erro={erros.whatsapp}><Input id="whatsapp" autoComplete="tel" inputMode="tel" maxLength={25} value={form.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} placeholder="(11) 99999-9999" aria-invalid={!!erros.whatsapp} /></Campo><Campo id="email" label="E-mail" hint="Opcional" erro={erros.email}><Input id="email" type="email" autoComplete="email" maxLength={200} value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="voce@email.com" aria-invalid={!!erros.email} /></Campo></div>
                  </fieldset>
                  <div className="my-8 h-px bg-border" />
                  <fieldset className="grid gap-5"><legend className="mb-5 text-lg font-semibold text-primary">Equipamento</legend>
                    <div className="grid gap-5 sm:grid-cols-2"><Campo id="equipamento_tipo" label="Tipo de equipamento" obrigatorio erro={erros.equipamento_tipo}><Select value={form.equipamento_tipo} onValueChange={(v) => set("equipamento_tipo", v)}><SelectTrigger id="equipamento_tipo" aria-invalid={!!erros.equipamento_tipo}><SelectValue placeholder="Selecione uma opção" /></SelectTrigger><SelectContent>{TIPOS_EQUIPAMENTO.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select></Campo><Campo id="marca_modelo" label="Marca e modelo" obrigatorio erro={erros.marca_modelo}><Input id="marca_modelo" maxLength={120} value={form.marca_modelo} onChange={(e) => set("marca_modelo", e.target.value)} placeholder="Ex.: Dell Inspiron 15" aria-invalid={!!erros.marca_modelo} /></Campo></div>
                  </fieldset>
                  <div className="my-8 h-px bg-border" />
                  <fieldset className="grid gap-5"><legend className="mb-5 text-lg font-semibold text-primary">O que aconteceu?</legend>
                    <Campo id="problema" label="Descreva o problema" obrigatorio erro={erros.problema}><Textarea id="problema" rows={5} maxLength={2000} value={form.problema} onChange={(e) => set("problema", e.target.value)} placeholder="Conte quando o problema começou, o que acontece e se já tentou alguma solução." aria-invalid={!!erros.problema} /><p className="text-right text-xs text-muted-foreground">{form.problema.length}/2000</p></Campo>
                    <div className="grid gap-5 sm:grid-cols-2"><Campo id="urgencia" label="Nível de urgência" hint="Opcional"><Select value={form.urgencia} onValueChange={(v) => set("urgencia", v)}><SelectTrigger id="urgencia"><SelectValue /></SelectTrigger><SelectContent>{URGENCIAS.map((u) => <SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>)}</SelectContent></Select></Campo><Campo id="periodo_contato" label="Melhor período" hint="Opcional"><Select value={form.periodo_contato} onValueChange={(v) => set("periodo_contato", v)}><SelectTrigger id="periodo_contato"><SelectValue placeholder="Selecione" /></SelectTrigger><SelectContent>{PERIODOS.map((p) => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}</SelectContent></Select></Campo></div>
                  </fieldset>
                  <div className="mt-8 flex flex-col-reverse items-stretch gap-3 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between"><p className="flex items-center gap-2 text-xs text-muted-foreground"><ShieldCheck className="size-4 text-success" /> Seus dados serão usados apenas para este atendimento.</p><Button type="submit" size="lg" disabled={enviando} className="h-11 sm:min-w-40">{enviando && <Loader2 className="animate-spin" />}{enviando ? "Enviando..." : "Enviar pedido"}</Button></div>
                </form>
              </div>
              <aside className="lg:sticky lg:top-8">
                <div className="rounded-xl bg-primary p-6 text-primary-foreground">
                  <p className="text-lg font-semibold">O que acontece depois</p>
                  <ol className="mt-6 space-y-6">
                    {[[CheckCircle2, "Recebemos sua solicitação", "O pedido entra na fila com um número de identificação."], [MessageCircle, "Retornamos pelo WhatsApp", "A equipe entra em contato para combinar os próximos passos."], [Clock3, "Você acompanha o atendimento", "Diagnóstico, aprovação e retirada seguem um fluxo organizado."]].map(([Icon, title, text], i) => { const StepIcon = Icon as typeof CheckCircle2; return <li key={String(title)} className="flex gap-3"><span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary-foreground/10"><StepIcon className="size-4 text-accent" /></span><div><p className="text-sm font-semibold">{title as string}</p><p className="mt-1 text-xs leading-5 text-primary-foreground/65">{text as string}</p></div></li>; })}
                  </ol>
                </div>
                <p className="mt-4 px-2 text-xs leading-5 text-muted-foreground">Não é necessário levar o equipamento antes do retorno da assistência.</p>
              </aside>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

function Campo({ id, label, hint, erro, obrigatorio, children }: { id: string; label: string; hint?: string | undefined; erro?: string | undefined; obrigatorio?: boolean | undefined; children: React.ReactNode }) {
  return <div className="grid gap-2"><div className="flex items-center justify-between gap-3"><Label htmlFor={id}>{label}{obrigatorio && <span className="ml-1 text-destructive">*</span>}</Label>{hint && <span className="text-xs text-muted-foreground">{hint}</span>}</div>{children}{erro && <p id={`${id}-error`} className="text-xs font-medium text-destructive" role="alert">{erro}</p>}</div>;
}

function SucessoView({ dados }: { dados: Sucesso }) {
  const mensagem = `Olá! Acabei de enviar uma solicitação pelo ConsertaFlow. Pedido: ${dados.codigo}. Equipamento: ${dados.equipamento_tipo} ${dados.marca_modelo}. Problema: ${dados.problema}`;
  return <div className="mx-auto max-w-2xl rounded-xl border border-border bg-card p-6 text-center shadow-[var(--shadow-card)] sm:p-10"><span className="mx-auto flex size-16 items-center justify-center rounded-full bg-success/12 text-success"><CheckCircle2 className="size-8" /></span><p className="section-eyebrow mt-6">Solicitação enviada</p><h1 className="mt-2 text-3xl font-bold text-primary">Pedido recebido com sucesso</h1><p className="mx-auto mt-3 max-w-md leading-7 text-muted-foreground">Em breve a assistência entrará em contato. Guarde o número abaixo para acompanhar seu atendimento.</p><div className="mt-8 rounded-lg border border-border bg-secondary/60 p-5 text-left"><p className="text-xs font-semibold text-muted-foreground uppercase">Número do pedido</p><p className="mt-1 text-2xl font-bold text-primary">{dados.codigo}</p><div className="mt-5 grid gap-4 border-t border-border pt-5 text-sm sm:grid-cols-2"><div><p className="text-muted-foreground">Equipamento</p><p className="mt-1 font-semibold">{dados.equipamento_tipo} {dados.marca_modelo}</p></div><div><p className="text-muted-foreground">Problema relatado</p><p className="mt-1 line-clamp-3">{dados.problema}</p></div></div></div><div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row"><Button asChild size="lg"><a href={whatsappAssistencia(mensagem)} target="_blank" rel="noopener noreferrer"><MessageCircle /> Continuar pelo WhatsApp</a></Button><Button asChild variant="outline" size="lg"><Link to="/">Voltar ao início</Link></Button></div></div>;
}