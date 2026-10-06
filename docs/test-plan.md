# Plano de testes

## Público

1. Abrir a landing em desktop e celular.
2. Confirmar que não existe link visível para a área administrativa.
3. Abrir /solicitar.
4. Tentar enviar o formulário vazio.
5. Enviar um pedido válido.
6. Confirmar a tela de sucesso.
7. Conferir o botão de WhatsApp.
8. Confirmar que visitante não consegue listar dados internos.

## Autenticação

9. Abrir /admin sem login e confirmar redirecionamento.
10. Criar/configurar o primeiro administrador.
11. Confirmar que uma conta não-admin não recebe acesso interno.

## Leads

12. Confirmar que novo pedido aparece em Leads.
13. Pesquisar e filtrar.
14. Converter o lead em cliente + ordem sem redigitar dados.
15. Enviar outro lead com o mesmo WhatsApp e confirmar reaproveitamento do cliente.

## Ordens

16. Alterar status.
17. Preencher diagnóstico, valor e prazo.
18. Confirmar histórico de status.
19. Marcar como Entregue e validar data de conclusão.

## Lembretes

20. Criar lembrete vencido.
21. Criar lembrete para hoje.
22. Criar lembrete futuro.
23. Confirmar categorização.
24. Marcar lembrete como concluído.

## Qualidade

25. Testar buscas sem resultado.
26. Testar responsividade.
27. Executar checagem TypeScript.
28. Executar build de produção.
29. Conferir ausência de segredos no repositório.
