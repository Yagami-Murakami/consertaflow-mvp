# Revisão de segurança

A revisão foi executada antes da entrega.

## Verificações

- build de produção;
- checagem TypeScript;
- proteção das rotas administrativas;
- políticas RLS;
- leitura pública de tabelas;
- tentativa de edição/exclusão como visitante;
- tentativa de criação de lead com campos forjados;
- permissões de funções internas;
- procura por tokens e senhas no código;
- redirecionamento de /admin sem autenticação;
- responsividade básica.

## Resultado

Após as correções:
- visitante anônimo consegue apenas criar um lead válido;
- leitura pública de leads, clientes, ordens, lembretes e histórico retorna zero registros;
- alterações e exclusões públicas ficam bloqueadas;
- status, código e timestamps internos não podem ser definidos livremente por visitante;
- funções internas sensíveis não ficam executáveis por anon;
- painel administrativo continua protegido por autenticação + RLS.

## Observação

A URL /admin não é um segredo. A proteção real é feita por autenticação e políticas de acesso no backend. O link para essa área foi removido da página pública apenas por acabamento de produto.
