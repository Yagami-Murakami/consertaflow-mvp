# ConsertaFlow

Sistema web para organização de pequenas assistências técnicas, centralizando pedidos de atendimento, clientes, ordens de serviço, status e lembretes.

**Aplicação publicada:** https://consertaflow-mvp.lovable.app  
**Repositório:** https://github.com/Yagami-Murakami/consertaflow-mvp


## Prévia do projeto

![ConsertaFlow - prévia da aplicação](https://screenshot2.lovable.dev/lovp_08kb9x65re9r4ab41vzrhneyfq/89ca6c3294d493cab4162b097ab5ceab_1791288770887.png)

## Problema

Pequenas assistências técnicas frequentemente recebem solicitações por WhatsApp, telefone e balcão. Quando essas informações ficam espalhadas em conversas, cadernos e anotações, surgem problemas como perda de pedidos, retrabalho ao cadastrar clientes, dificuldade para acompanhar o status dos reparos e esquecimentos de aprovações ou retiradas.

O ConsertaFlow organiza esse fluxo em um único sistema: o cliente envia a solicitação, o pedido entra como lead e pode ser convertido em cliente e ordem de serviço sem redigitação.

## Solução entregue

A aplicação possui uma área pública e uma área administrativa protegida.

### Área pública
- landing page responsiva e moderna;
- formulário de solicitação de atendimento;
- validação dos dados;
- criação persistente do lead;
- confirmação do pedido;
- continuidade do atendimento pelo WhatsApp.

### Área administrativa
- autenticação;
- dashboard;
- gestão de leads;
- conversão de lead em cliente + ordem de serviço;
- cadastro e histórico de clientes;
- ordens de serviço;
- diagnóstico, valor estimado, prazo e observações;
- fluxo de status;
- histórico de alterações;
- lembretes;
- pesquisa e filtros.

## Segurança

O backend utiliza Lovable Cloud / PostgreSQL com políticas de Row Level Security.

A configuração foi revisada para que:
- visitante anônimo possa criar apenas um lead válido;
- visitante anônimo não consiga listar, editar ou excluir leads;
- clientes, ordens, histórico e lembretes não fiquem acessíveis publicamente;
- somente administradores autenticados acessem os dados internos;
- rotas administrativas sejam protegidas;
- funções internas sensíveis não fiquem expostas a usuários anônimos;
- código e datas de novos pedidos públicos sejam definidos pelo sistema.

O build de produção e a checagem TypeScript passaram após a revisão.

## Mercado — TAM, SAM e SOM

Para a validação de negócio foi considerado como referência o CNAE 9511-8/00 — reparação e manutenção de computadores e equipamentos periféricos.

Cenário utilizado no estudo:
- **TAM:** cerca de 163.667 estabelecimentos no Brasil.
- **SAM:** cerca de 15.449 estabelecimentos no estado do Rio de Janeiro.
- **Preço hipotético:** R$ 49/mês.
- **SOM inicial:** 50 empresas pagantes.

Cálculos:
- **TAM:** 163.667 × R$ 49 × 12 = **R$ 96.236.196/ano**
- **SAM:** 15.449 × R$ 49 × 12 = **R$ 9.084.012/ano**
- **SOM:** 50 × R$ 49 × 12 = **R$ 29.400/ano**

Esses números são estimativas de cenário para validação do desafio, e não uma previsão de faturamento.

Fontes de referência:
- https://censoempresarial.com.br/cnae/9511800-reparacao-manutencao-computadores-equipamentos-perifericos
- https://www.econodata.com.br/empresas/todo-brasil/reparacao-e-manutencao-de-computadores-e-de-equipamentos-perifericos-s-9511800
- https://agenciadenoticias.ibge.gov.br/agencia-noticias/2012-agencia-de-noticias/noticias/47410-internet-chega-a-95-de-domicilios-do-pais-em-2025

## Business Model Canvas

| Bloco | Definição |
|---|---|
| Segmentos de clientes | Micro e pequenas assistências técnicas de computadores, notebooks e eletrônicos |
| Proposta de valor | Centralizar pedidos, clientes, ordens, status e lembretes em um fluxo simples |
| Canais | Landing page, indicação, WhatsApp, redes sociais e prospecção direta |
| Relacionamento | Autoatendimento no formulário, onboarding simples e suporte |
| Fontes de receita | Assinatura mensal; futuramente planos por usuários ou unidades |
| Recursos principais | Aplicação, Lovable Cloud, banco, autenticação e painel |
| Atividades principais | Desenvolvimento, manutenção, suporte, melhorias de UX e aquisição |
| Parceiros principais | Lovable, serviços de e-mail, WhatsApp e possíveis integrações futuras |
| Estrutura de custos | Plataforma, domínio, e-mail, suporte, automações e aquisição |

## Tese de validação

> Se uma pequena assistência técnica tiver um formulário simples para captar solicitações e um painel único para transformar pedidos em ordens e acompanhar status, ela reduzirá a dependência de mensagens e anotações dispersas e perceberá valor suficiente para continuar usando o sistema.

### Hipóteses
1. O responsável pela assistência consegue utilizar o sistema sem treinamento complexo.
2. O formulário captura informações suficientes antes da conversa no WhatsApp.
3. A conversão de lead em cliente e ordem reduz retrabalho.
4. Status e lembretes reduzem esquecimentos.
5. Existe disposição para pagar aproximadamente R$ 49/mês por uma solução simples.

## O que permaneceu manual

Para manter o escopo controlado, algumas operações continuam intencionalmente manuais:
- negociação e fechamento pelo WhatsApp;
- envio do orçamento;
- confirmação de pagamento;
- compra de peças;
- emissão de nota fiscal;
- retirada ou entrega do equipamento;
- notificações automáticas externas.

## Stack

- TypeScript
- React
- TanStack Router
- TanStack Query
- Tailwind CSS
- shadcn/ui
- Lovable Cloud
- PostgreSQL / Supabase
- Row Level Security

## Estrutura principal

```text
src/
├── components/
├── integrations/supabase/
├── lib/
├── routes/
│   ├── index.tsx
│   ├── solicitar.tsx
│   ├── auth.tsx
│   └── _authenticated/
│       ├── admin.dashboard.tsx
│       ├── admin.leads.tsx
│       ├── admin.clientes.tsx
│       ├── admin.ordens.index.tsx
│       ├── admin.ordens.$id.tsx
│       └── admin.lembretes.tsx
drizzle/
└── migrations/
```

## Fluxo principal

1. Visitante acessa a página pública.
2. Envia uma solicitação.
3. O lead é criado no banco.
4. Administrador autentica-se.
5. Lead aparece no painel.
6. Lead é convertido em cliente e ordem.
7. Ordem passa pelos status de atendimento.
8. Diagnóstico, valor e prazo podem ser registrados.
9. Lembretes podem ser criados e concluídos.
10. Histórico de status permanece registrado.

## Status de ordem

- Novo
- Em diagnóstico
- Aguardando aprovação
- Aprovado
- Em reparo
- Pronto para retirada
- Entregue
- Cancelado

## Processo de construção

O projeto foi criado em duas etapas principais no Lovable:

1. geração inicial da landing, formulário, autenticação, banco e políticas;
2. correção e conclusão do painel administrativo, seguida de revisão de segurança.

Na revisão de segurança foram corrigidos dois pontos:
- impedir que um visitante forje status/código de um lead;
- restringir execução pública de funções internas do banco.

Depois disso, a landing page foi reformulada para uma apresentação comercial, removendo referências visíveis a protótipo/MVP e o link público para a área administrativa.

## Mega prompt e correções

A documentação usada durante a construção está em:

- `docs/mega-prompt.md`
- `docs/correcoes.md`
- `docs/test-plan.md`
- `docs/revisao-seguranca.md`

## Observações

O número de WhatsApp usado na configuração do projeto deve ser revisado antes de utilização comercial real.

Este repositório foi preparado como entrega de um desafio prático de validação de produto e desenvolvimento com Lovable.
