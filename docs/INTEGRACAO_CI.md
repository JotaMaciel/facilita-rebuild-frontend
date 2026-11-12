# Integração FrontEnd + API + MySQL no CI

O job `integration-contract` do GitHub Actions:
1. Baixa as branches atuais do FrontEnd e do BackEnd Rebuild.
2. Inicia MySQL 8.4 em ambiente temporário de testes.
3. Gera Prisma Client e aplica as migrações versionadas do BackEnd.
4. Inicia a API e verifica o endpoint de prontidão conectado ao MySQL.
5. Executa cadastro de uma conta sintética através de requisição HTTP.
6. Compila o FrontEnd usando `VITE_API_BASE_URL` apontando para a API de testes e confere a URL no bundle.

## O que é validado e o que não é
Isso valida conectividade, estrutura básica do banco, inicialização dos processos, cadastro e configuração de compilação. Também executa Chromium com interações reais de autenticação, solicitações e atendimento. Consulte `E2E.md` e `ESTABILIZACAO.md`. Os projetos também permanecem em branches; o CI de integração acompanha essas versões e poderá ser fixado em commits estáveis antes da publicação.

O workflow usa credenciais temporárias de CI, não dados pessoais nem chaves de produção.
