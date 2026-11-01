# Chat e notificações — funcionamento atual

- Mensagens são persistidas pela API no MySQL e acessadas por HTTP autenticado.
- A interface consulta a conversa aberta a cada 10 segundos e as notificações a cada 30 segundos.
- Não há ainda transporte em tempo real via WebSocket nem indicador de digitação.
- Atualizações periódicas são interrompidas ao fechar a conversa ou ao sair da conta.
- Mensagens não são criptografadas ponta a ponta; não utilize para dados sensíveis na homologação.

## Próximos passos
Implementar WebSocket com autenticação e checagem de participação por sala, com fallback HTTP, testes de reconexão e de autorização. Evitar ligar chat de terceiros ou serviços originais a esta API de homologação sem revisão dos contratos.
