# Arquitetura do FrontEnd — Facilita Rebuild

## Visão geral

O MVP web é desenvolvido em React 19, TypeScript e Vite. A interface se comunica com a API REST do [BackEnd Rebuild](https://github.com/JotaMaciel/facilita-rebuild-backend) por HTTP; a persistência dos dados fica no BackEnd, com Prisma e MySQL. Esta versão não implementa contratação ou pagamentos reais.

## Organização em src/

- `App.tsx`: estado da aplicação, efeitos de carregamento e polling, validação de sessão, operações de serviços e conexão entre os componentes.
- `api.ts`: tipos compartilhados da aplicação, configuração de `VITE_API_BASE_URL`, chamadas HTTP e tradução de erros de API em mensagens para o usuário.
- `components/SiteHeader.tsx`: cabeçalho, navegação responsiva, entrada e saída.
- `components/AuthDialog.tsx`: formulários de login, cadastro, recuperação e redefinição de senha.
- `components/ServiceForm.tsx`: formulário para o cliente criar solicitações.
- `components/ClientServices.tsx`: lista do cliente com paginação, cancelamento, mensagens e avaliação.
- `components/ProviderOpportunities.tsx`: lista de oportunidades e aceite pelo prestador.
- `components/ConversationDialog.tsx`: leitura e envio de mensagens do atendimento.
- `components/NotificationsPanel.tsx`: visualização e leitura de notificações.
- `components/AccountSessions.tsx`: consulta e revogação de sessões da conta.

Os componentes recebem valores e callbacks tipados. A lógica de negócio e as solicitações HTTP continuam em `App.tsx` e `api.ts`, evitando que cada componente visual implemente requisições próprias.

## Principais fluxos

**Cliente:** cadastro/login → criação de solicitação → acompanhamento e cancelamento quando pendente → mensagens durante o atendimento → avaliação após conclusão.

**Prestador:** cadastro/login → oportunidades disponíveis → aceite → início e conclusão do serviço → mensagens.

**Segurança da conta:** autenticação por token → validação com `/auth/me` → consulta/revogação de sessões → limpeza de informações privadas após logout ou token rejeitado.

**Notificações:** consulta pela API → marcação como lida → atualização visual e persistência no servidor.

## Integração e estados

A API usa como base `VITE_API_BASE_URL`, com fallback de desenvolvimento em `http://localhost:3000/v1/facilita`. O `request()` centraliza autorização Bearer, tratamento de erro de rede e tradução dos principais erros HTTP.

O `App.tsx` mantém estado de usuário, token, serviços, conversas e notificações; usa verificações de versão de conta para evitar que respostas assíncronas de uma sessão anterior repopulem dados de outra conta. O polling de mensagens e notificações funciona por consultas periódicas à API, sem WebSocket nesta implementação.

## Testes

A pipeline do GitHub Actions executa build TypeScript/Vite, validação da imagem Docker/Nginx e testes de navegador Chromium contra API e MySQL. O teste `test/e2e.mjs` cobre autenticação, criação/cancelamento, aceite, início e conclusão de atendimento, mensagens, notificações, avaliação, paginação, responsividade e revogação de token. O resultado de cada alteração deve ser confirmado na aba Actions antes da revisão final.

## Limitações e continuidade

A extração dos componentes visuais não significa que toda a lógica já tenha sido distribuída em hooks ou serviços; `App.tsx` ainda centraliza vários estados e operações. O projeto também não possui integração real de pagamento. Antes de considerar a versão pronta para publicação, devem ser revisados ambiente de produção, variáveis de configuração, autenticação, testes e acessibilidade.
