import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowRight,
  BellRing,
  CalendarClock,
  Check,
  CheckCircle2,
  ChevronDown,
  ClipboardCheck,
  ClipboardList,
  Clock3,
  Menu,
  MessageCircle,
  MonitorSmartphone,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
  Wrench,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import technicianAsset from "@/assets/technician-workbench.jpg.asset.json";
import circuitAsset from "@/assets/computer-circuit.jpg.asset.json";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ConsertaFlow — Gestão para assistências técnicas" },
      {
        name: "description",
        content:
          "Centralize pedidos, clientes, ordens de serviço, status e lembretes da sua assistência técnica.",
      },
      { property: "og:title", content: "ConsertaFlow — Gestão para assistências técnicas" },
      {
        property: "og:description",
        content: "Do primeiro contato à entrega: toda a operação da assistência em um só fluxo.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

function Logo() {
  return (
    <Link to="/" className="flex shrink-0 items-center gap-2.5 font-semibold text-primary">
      <span className="logo-mark flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <Wrench className="size-4.5" aria-hidden="true" />
      </span>
      <span className="text-lg font-bold">Conserta<span className="text-accent">Flow</span></span>
    </Link>
  );
}

const resources = [
  { icon: ClipboardList, title: "Pedidos", text: "Cada solicitação chega identificada, completa e pronta para atendimento." },
  { icon: Users, title: "Clientes", text: "Contatos e histórico organizados, sem cadastros duplicados ou informações soltas." },
  { icon: Wrench, title: "Ordens de serviço", text: "Diagnóstico, valor, prazo e observações reunidos no mesmo lugar." },
  { icon: Clock3, title: "Status", text: "Visualize o andamento de cada reparo e saiba exatamente o próximo passo." },
  { icon: BellRing, title: "Lembretes", text: "Acompanhe retornos, aprovações e retiradas antes que virem atraso." },
  { icon: MessageCircle, title: "WhatsApp", text: "Continue as conversas pelo canal que seus clientes já usam todos os dias." },
];

const steps = [
  ["01", "Pedido recebido", "O cliente descreve o equipamento e o problema em um formulário objetivo."],
  ["02", "Triagem organizada", "O pedido entra na fila com contato, urgência e todas as informações necessárias."],
  ["03", "Ordem em andamento", "Converta o pedido sem redigitar, registre diagnóstico, orçamento e prazo."],
  ["04", "Acompanhamento claro", "Atualize cada etapa e programe lembretes para aprovações e retornos."],
  ["05", "Entrega registrada", "Finalize o serviço com histórico completo para a próxima visita do cliente."],
];

const faqs = [
  ["O ConsertaFlow funciona para quais equipamentos?", "Para assistências que trabalham com notebooks, computadores, impressoras, consoles, smartphones e outros eletrônicos."],
  ["Preciso mudar meu atendimento pelo WhatsApp?", "Não. O ConsertaFlow organiza as informações e permite continuar a conversa com o cliente pelo WhatsApp."],
  ["Consigo acompanhar o histórico de uma ordem?", "Sim. Cada alteração de status fica registrada, junto com diagnóstico, valor, prazo e observações do serviço."],
  ["Meus dados internos ficam visíveis para clientes?", "Não. O cliente acessa somente o formulário de solicitação. O painel operacional exige acesso autenticado."],
];

function Landing() {
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="min-h-screen overflow-x-clip bg-background">
      <header className="sticky top-0 z-50 border-b border-border/80 bg-background/90 backdrop-blur-xl">
        <div className="mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-5 py-3.5 lg:flex lg:justify-between lg:px-8">
          <Logo />
          <nav className="hidden items-center gap-7 text-sm font-medium text-muted-foreground lg:flex" aria-label="Navegação principal">
            <a href="#recursos" className="nav-link">Recursos</a>
            <a href="#como-funciona" className="nav-link">Como funciona</a>
            <a href="#para-quem" className="nav-link">Para quem é</a>
            <a href="#contato" className="nav-link">Contato</a>
          </nav>
          <div className="flex shrink-0 items-center gap-2">
            <Button asChild size="sm" className="hidden sm:inline-flex">
              <Link to="/solicitar">Solicitar atendimento</Link>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((open) => !open)}
            >
              {menuOpen ? <X /> : <Menu />}
            </Button>
          </div>
        </div>
        {menuOpen && (
          <div className="border-t border-border bg-background px-5 py-5 lg:hidden">
            <nav className="mx-auto grid max-w-7xl gap-1 text-sm font-medium" aria-label="Navegação móvel">
              {[["Recursos", "#recursos"], ["Como funciona", "#como-funciona"], ["Para quem é", "#para-quem"], ["Contato", "#contato"]].map(([label, href]) => (
                <a key={href} href={href} onClick={closeMenu} className="rounded-md px-3 py-3 hover:bg-secondary">{label}</a>
              ))}
              <Button asChild className="mt-3 sm:hidden">
                <Link to="/solicitar" onClick={closeMenu}>Solicitar atendimento</Link>
              </Button>
            </nav>
          </div>
        )}
      </header>

      <main>
        <section className="hero-grid relative border-b border-border/70 pt-14 pb-16 sm:pt-20 sm:pb-20 lg:pt-24 lg:pb-24">
          <div className="mx-auto grid max-w-7xl items-center gap-14 px-5 lg:grid-cols-[minmax(0,0.94fr)_minmax(520px,1.06fr)] lg:px-8">
            <div className="animate-enter relative z-10">
              <span className="inline-flex items-center gap-2 rounded-full border border-accent/25 bg-accent/8 px-3 py-1.5 text-xs font-semibold text-accent">
                <Sparkles className="size-3.5" /> Gestão feita para quem resolve
              </span>
              <h1 className="mt-6 max-w-2xl text-4xl leading-[1.08] font-bold text-primary sm:text-5xl lg:text-[3.65rem]">
                Sua assistência técnica organizada do primeiro contato à entrega.
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-8 text-muted-foreground">
                Pedidos, clientes, ordens de serviço, status e lembretes centralizados para sua equipe trabalhar com clareza e atender melhor.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg" className="h-12 px-6">
                  <Link to="/solicitar">Solicitar atendimento <ArrowRight /></Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="h-12 px-6 bg-background/70">
                  <a href="#recursos">Conhecer o sistema</a>
                </Button>
              </div>
              <div className="mt-9 flex flex-wrap gap-x-6 gap-y-3 text-sm text-muted-foreground">
                {["Menos retrabalho", "Histórico completo", "Rotina sob controle"].map((item) => (
                  <span key={item} className="flex items-center gap-2"><Check className="size-4 text-success" />{item}</span>
                ))}
              </div>
            </div>

            <div className="animate-enter-late relative mx-auto w-full max-w-2xl lg:max-w-none" aria-label="Visão do painel ConsertaFlow">
              <div className="product-window float-soft overflow-hidden rounded-xl border border-border bg-card shadow-[var(--shadow-product)]">
                <div className="flex items-center justify-between border-b border-border bg-card px-4 py-3 sm:px-5">
                  <div className="flex items-center gap-2.5">
                    <span className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground"><Wrench className="size-3.5" /></span>
                    <span className="text-sm font-bold text-primary">ConsertaFlow</span>
                  </div>
                  <div className="flex items-center gap-2"><span className="size-2 rounded-full bg-success" /><span className="text-[11px] text-muted-foreground">Operação online</span></div>
                </div>
                <div className="grid min-h-[380px] grid-cols-[74px_1fr] sm:grid-cols-[150px_1fr]">
                  <div className="border-r border-border bg-primary px-3 py-5 text-primary-foreground">
                    <p className="mb-5 hidden px-2 text-[10px] font-semibold uppercase opacity-60 sm:block">Operação</p>
                    {[ClipboardCheck, Users, Wrench, BellRing].map((Icon, i) => (
                      <div key={i} className={`mb-2 flex items-center gap-2 rounded-md p-2 text-xs ${i === 0 ? "bg-primary-foreground/12" : "opacity-60"}`}>
                        <Icon className="size-4 shrink-0" /><span className="hidden sm:block">{["Visão geral", "Clientes", "Ordens", "Lembretes"][i]}</span>
                      </div>
                    ))}
                  </div>
                  <div className="min-w-0 bg-secondary/45 p-4 sm:p-6">
                    <div className="flex items-start justify-between gap-3">
                      <div><p className="text-[10px] font-semibold text-accent uppercase">Visão geral</p><p className="mt-1 text-base font-bold text-primary sm:text-lg">Bom dia, equipe</p></div>
                      <span className="rounded-full border border-border bg-card px-2.5 py-1 text-[10px] text-muted-foreground">Hoje</span>
                    </div>
                    <div className="mt-5 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                      {[["08", "Novos pedidos"], ["05", "Em reparo"], ["03", "Prontos"]].map(([n, l], i) => (
                        <div key={l} className={`rounded-lg border bg-card p-3 ${i === 2 ? "border-success/30" : "border-border"}`}>
                          <p className="text-xl font-bold text-primary">{n}</p><p className="mt-1 text-[9px] leading-tight text-muted-foreground sm:text-[10px]">{l}</p>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 rounded-lg border border-border bg-card p-3 sm:p-4">
                      <div className="flex items-center justify-between"><p className="text-xs font-semibold">Ordens em andamento</p><span className="text-[10px] text-accent">Ver todas</span></div>
                      <div className="mt-3 space-y-3">
                        {[["OS-1048", "Notebook Dell", "Em diagnóstico", "warning"], ["OS-1047", "PlayStation 5", "Em reparo", "accent"], ["OS-1045", "MacBook Air", "Pronto", "success"]].map(([id, item, status, tone]) => (
                          <div key={id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-t border-border pt-3 first:border-0 first:pt-0">
                            <div className="min-w-0"><p className="truncate text-[11px] font-semibold">{item}</p><p className="text-[9px] text-muted-foreground">{id}</p></div>
                            <span className={`status-dot status-${tone}`}>{status}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute -right-2 -bottom-7 hidden w-56 rounded-lg border border-border bg-card p-4 shadow-[var(--shadow-product)] sm:block lg:-right-5">
                <div className="flex items-center gap-3"><span className="flex size-9 items-center justify-center rounded-full bg-success/12 text-success"><CheckCircle2 className="size-5" /></span><div><p className="text-xs font-semibold">Ordem atualizada</p><p className="text-[10px] text-muted-foreground">Pronta para retirada</p></div></div>
              </div>
            </div>
          </div>
        </section>

        <section id="recursos" className="section-pad scroll-mt-20">
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <SectionHeading eyebrow="Um único fluxo" title="Tudo que você precisa para manter a operação em movimento" text="Saia das conversas espalhadas e acompanhe cada atendimento com informações claras, do pedido à entrega." />
            <div className="mt-12 grid gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
              {resources.map((item) => (
                <article key={item.title} className="feature-cell group bg-card p-6 sm:p-8">
                  <span className="flex size-10 items-center justify-center rounded-lg bg-accent/10 text-accent transition-transform group-hover:-translate-y-0.5"><item.icon className="size-5" /></span>
                  <h3 className="mt-5 text-lg font-semibold text-primary">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="como-funciona" className="section-pad scroll-mt-20 border-y border-border bg-primary text-primary-foreground">
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <div className="max-w-2xl"><p className="section-eyebrow text-accent">Da entrada à entrega</p><h2 className="mt-3 text-3xl leading-tight font-bold sm:text-4xl">Um processo simples para não deixar nenhum serviço parado.</h2></div>
            <div className="relative mt-12 grid gap-8 md:grid-cols-5 md:gap-4">
              <div className="absolute top-5 right-[8%] left-[8%] hidden h-px bg-primary-foreground/15 md:block" />
              {steps.map(([number, title, text]) => (
                <article key={number} className="relative">
                  <span className="relative z-10 flex size-10 items-center justify-center rounded-full border border-accent/50 bg-primary text-xs font-bold text-accent">{number}</span>
                  <h3 className="mt-5 font-semibold">{title}</h3><p className="mt-2 text-sm leading-6 text-primary-foreground/65">{text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section-pad overflow-hidden">
          <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 lg:grid-cols-2 lg:px-8">
            <div className="relative order-2 lg:order-1">
              <div className="overflow-hidden rounded-xl border border-border bg-card shadow-[var(--shadow-product)]">
                <div className="flex items-center justify-between border-b border-border px-5 py-4"><div><p className="text-xs text-muted-foreground">Ordem de serviço</p><p className="font-bold text-primary">OS-1048</p></div><span className="status-dot status-warning">Em diagnóstico</span></div>
                <div className="grid gap-px bg-border sm:grid-cols-2">
                  {[["Cliente", "Marina Almeida"], ["Equipamento", "Notebook Dell Inspiron"], ["Entrada", "06 out, 09:42"], ["Previsão", "09 out, 18:00"]].map(([k,v]) => <div key={k} className="bg-card p-5"><p className="text-xs text-muted-foreground">{k}</p><p className="mt-1 text-sm font-semibold">{v}</p></div>)}
                </div>
                <div className="p-5"><p className="text-xs text-muted-foreground">Relato do cliente</p><p className="mt-2 text-sm leading-6">Liga normalmente, mas a tela apaga após alguns minutos de uso.</p><div className="mt-5 flex items-center gap-3 rounded-lg bg-secondary p-4"><CalendarClock className="size-5 text-accent" /><div><p className="text-sm font-semibold">Lembrete programado</p><p className="text-xs text-muted-foreground">Retornar diagnóstico hoje, às 16h</p></div></div></div>
              </div>
            </div>
            <div className="order-1 lg:order-2 lg:pl-8">
              <p className="section-eyebrow">Controle sem complicação</p>
              <h2 className="mt-3 text-3xl leading-tight font-bold text-primary sm:text-4xl">Cada ordem conta a história completa do atendimento.</h2>
              <p className="mt-5 leading-7 text-muted-foreground">Encontre rapidamente o que foi relatado, o diagnóstico da equipe, o valor informado e tudo que ainda precisa ser feito.</p>
              <ul className="mt-7 space-y-4">
                {["Informações reaproveitadas do pedido original", "Histórico automático de mudanças de status", "Prazos, valores e lembretes no contexto da ordem"].map((item) => <li key={item} className="flex gap-3 text-sm font-medium"><span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-success/12 text-success"><Check className="size-3" /></span>{item}</li>)}
              </ul>
            </div>
          </div>
        </section>

        <section id="para-quem" className="section-pad scroll-mt-20 bg-secondary/55">
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <SectionHeading eyebrow="Rotina real" title="Feito para assistência técnica de verdade" text="Um sistema direto para negócios que precisam ganhar previsibilidade sem burocratizar o atendimento." />
            <div className="mt-12 grid gap-5 lg:grid-cols-[1.25fr_0.75fr]">
              <figure className="image-panel relative min-h-[430px] overflow-hidden rounded-xl">
                <img src={technicianAsset.url} alt="Técnico realizando manutenção em equipamento eletrônico sobre uma bancada organizada" loading="lazy" className="absolute inset-0 size-full object-cover" />
                <div className="image-scrim absolute inset-0" />
                <figcaption className="absolute right-0 bottom-0 left-0 p-6 text-primary-foreground sm:p-8"><p className="text-2xl font-bold">Mais tempo na bancada. Menos tempo procurando informação.</p><p className="mt-2 max-w-xl text-sm text-primary-foreground/75">A equipe sabe o que entrou, o que está aguardando e o que precisa sair hoje.</p></figcaption>
              </figure>
              <div className="grid gap-5">
                <figure className="relative min-h-[210px] overflow-hidden rounded-xl">
                  <img src={circuitAsset.url} alt="Componentes internos de computador preparados para manutenção técnica" loading="lazy" className="absolute inset-0 size-full object-cover" />
                  <div className="image-scrim absolute inset-0" />
                  <figcaption className="absolute right-0 bottom-0 left-0 p-6 text-primary-foreground"><p className="font-semibold">Informação certa, no momento certo.</p></figcaption>
                </figure>
                <div className="rounded-xl border border-border bg-card p-6">
                  <p className="section-eyebrow">Resultados no dia a dia</p>
                  <div className="mt-5 grid gap-4">
                    {["Menos pedidos esquecidos", "Respostas mais consistentes", "Entregas com histórico organizado"].map(item => <div key={item} className="flex items-center gap-3 text-sm font-semibold"><ShieldCheck className="size-5 text-success" />{item}</div>)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="section-pad">
          <div className="mx-auto max-w-4xl px-5 text-center lg:px-8">
            <MessageCircle className="mx-auto size-7 text-accent" />
            <blockquote className="mt-6 text-2xl leading-10 font-semibold text-primary sm:text-3xl">“Organização não deveria tomar mais tempo do que o próprio conserto. O ConsertaFlow foi pensado para tornar cada próximo passo visível.”</blockquote>
            <p className="mt-5 text-sm font-medium text-muted-foreground">Princípio de produto ConsertaFlow</p>
          </div>
        </section>

        <section className="section-pad border-y border-border bg-secondary/45">
          <div className="mx-auto grid max-w-7xl gap-10 px-5 lg:grid-cols-[0.75fr_1.25fr] lg:px-8">
            <div><p className="section-eyebrow">Dúvidas frequentes</p><h2 className="mt-3 text-3xl font-bold text-primary sm:text-4xl">Antes de começar</h2><p className="mt-4 leading-7 text-muted-foreground">Respostas diretas sobre o funcionamento do sistema.</p></div>
            <div className="divide-y divide-border border-y border-border">
              {faqs.map(([q,a]) => <details key={q} className="faq-item group"><summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 font-semibold text-primary"><span>{q}</span><ChevronDown className="size-4 shrink-0 transition-transform group-open:rotate-180" /></summary><p className="max-w-2xl pb-5 text-sm leading-6 text-muted-foreground">{a}</p></details>)}
            </div>
          </div>
        </section>

        <section id="contato" className="scroll-mt-20 bg-primary py-20 text-primary-foreground sm:py-24">
          <div className="mx-auto max-w-3xl px-5 text-center">
            <p className="section-eyebrow text-accent">Próximo atendimento</p>
            <h2 className="mt-4 text-3xl leading-tight font-bold sm:text-5xl">Comece com uma solicitação bem organizada.</h2>
            <p className="mx-auto mt-5 max-w-xl text-primary-foreground/70">Envie os dados do equipamento e deixe o restante do fluxo claro desde o primeiro contato.</p>
            <Button asChild size="lg" variant="secondary" className="mt-8 h-12 px-7"><Link to="/solicitar">Solicitar atendimento <ArrowRight /></Link></Button>
          </div>
        </section>
      </main>

      <footer className="border-t border-border bg-background py-10">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 sm:grid-cols-[1fr_auto] sm:items-end lg:px-8">
          <div><Logo /><p className="mt-4 max-w-sm text-sm leading-6 text-muted-foreground">Gestão de pedidos, clientes e ordens de serviço para assistências técnicas.</p></div>
          <nav className="flex flex-wrap gap-x-5 gap-y-3 text-sm text-muted-foreground" aria-label="Links do rodapé"><a href="#recursos" className="hover:text-foreground">Recursos</a><a href="#como-funciona" className="hover:text-foreground">Como funciona</a><Link to="/solicitar" className="hover:text-foreground">Contato</Link></nav>
          <p className="border-t border-border pt-5 text-xs text-muted-foreground sm:col-span-2">© {new Date().getFullYear()} ConsertaFlow. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}

function SectionHeading({ eyebrow, title, text }: { eyebrow: string; title: string; text: string }) {
  return <div className="max-w-3xl"><p className="section-eyebrow">{eyebrow}</p><h2 className="mt-3 text-3xl leading-tight font-bold text-primary sm:text-4xl">{title}</h2><p className="mt-4 max-w-2xl leading-7 text-muted-foreground">{text}</p></div>;
}