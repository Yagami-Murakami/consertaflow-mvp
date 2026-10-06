# Mega prompt usado no Lovable

Crie uma aplicação web full-stack chamada **ConsertaFlow**, em português do Brasil, voltada para micro e pequenas assistências técnicas de computadores, notebooks e eletrônicos.

Use **Lovable Cloud** como backend. A aplicação deve ter persistência, autenticação administrativa e regras de segurança.

## Objetivo

Centralizar:
- pedidos;
- leads;
- clientes;
- ordens de serviço;
- status;
- lembretes;
- continuidade pelo WhatsApp.

## Área pública

Criar landing page e rota /solicitar com:
- nome;
- WhatsApp;
- tipo de equipamento;
- marca/modelo;
- problema relatado;
- e-mail opcional;
- urgência;
- período para contato.

Ao enviar:
- criar lead com status novo;
- gerar identificador;
- mostrar confirmação;
- oferecer botão para continuar no WhatsApp.

## Área administrativa

Rotas:
- /admin/dashboard
- /admin/leads
- /admin/clientes
- /admin/ordens
- /admin/lembretes

Recursos:
- autenticação;
- dashboard;
- busca/filtros;
- conversão de lead em cliente + ordem;
- histórico de clientes;
- diagnóstico;
- orçamento;
- prazo;
- observações;
- histórico de status;
- lembretes.

## Status das ordens

1. Novo
2. Em diagnóstico
3. Aguardando aprovação
4. Aprovado
5. Em reparo
6. Pronto para retirada
7. Entregue
8. Cancelado

## Segurança

- visitante pode somente criar lead;
- visitante não pode listar/editar/excluir dados internos;
- somente admin autenticado acessa clientes, ordens, lembretes e histórico;
- proteger /admin/*;
- aplicar proteção no backend via RLS;
- não expor segredos no frontend;
- validar entradas.

## Critérios de aceite

O fluxo deve funcionar de ponta a ponta:
pedido público -> lead -> cliente -> ordem -> diagnóstico -> aprovação -> reparo -> pronto -> entregue, mantendo histórico e lembretes.

Depois da primeira implementação, foram enviados prompts de correção para concluir o painel, revisar segurança e reformular o visual para aparência comercial.
