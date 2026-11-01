# Checklist de validação final — Facilita Rebuild

Este roteiro complementa os testes automatizados. **Não representa uma homologação concluída**: marque cada etapa somente depois de executá-la em ambiente local ou de demonstração, usando dados fictícios.

## 1. Preparar o ambiente
- [ ] Iniciar o MySQL 8.4 com `docker compose up -d` no repositório do BackEnd.
- [ ] Configurar `.env` do BackEnd com `JWT_SECRET` próprio de desenvolvimento e `DATABASE_URL` local, sem usar segredos reais.
- [ ] Rodar `npm install`, `npm run db:generate`, `npm run db:deploy`, `npm test` e `npm run test:integration`.
- [ ] Iniciar a API com `npm run dev` e confirmar `/v1/facilita/health`.
- [ ] No FrontEnd, definir `VITE_API_BASE_URL=http://localhost:3000/v1/facilita`, executar `npm install`, `npm run build` e `npm run dev`.

## 2. Demonstração funcional
- [ ] Criar e autenticar uma conta de cliente e uma de prestador em navegadores ou perfis diferentes.
- [ ] Cliente: criar solicitação; prestador: visualizar oportunidade, aceitar, iniciar e concluir.
- [ ] Trocar mensagens; atualizar as páginas e confirmar que permanecem disponíveis.
- [ ] Verificar notificação e marcação de leitura; concluir avaliação pelo cliente.
- [ ] Criar outra solicitação, cancelar enquanto pendente e confirmar que o status continua cancelado após atualizar a página.
- [ ] Validar paginação após mais de 20 solicitações.
- [ ] Conferir sessões ativas e revogar uma sessão; confirmar que ela não volta a autenticar.

## 3. Persistência e recuperação
- [ ] Criar um serviço de teste e registrar seu identificador.
- [ ] Reiniciar somente a API; confirmar que sessão e serviço permanecem disponíveis.
- [ ] Reiniciar o contêiner do MySQL **sem remover o volume**; conferir novamente os dados.
- [ ] Testar processo de backup e restauração em ambiente descartável antes de qualquer produção.
- [ ] Verificar recuperação de senha com e-mail de teste e provedor configurado, quando aplicável.

## 4. Usabilidade e acessibilidade
- [ ] Navegar por teclado, abrir e fechar modais com Escape, conferir retorno do foco.
- [ ] Revisar rótulos dos formulários, erros de rede, estados de carregamento e contraste.
- [ ] Inspecionar layout mobile, tablet e desktop, incluindo rolagem horizontal.
- [ ] Produzir capturas de tela com informações fictícias para o portfólio.

## 5. Preparação para publicação (ainda não autorizada)
- [ ] Confirmar CI verde para o commit exato de ambos os PRs.
- [ ] Revisar CORS, HTTPS, política de armazenamento e revogação de sessão, limites de requisição, logs e variáveis de ambiente.
- [ ] Definir hospedagem, domínio, banco persistente, migrações, backups e monitoramento.
- [ ] Revisar autoria, licenças e créditos de origem.
- [ ] Decidir separadamente sobre merge na `main` e deploy, após aprovação explícita.

## Estado verificado em 1º de novembro de 2026
- BackEnd: CI do commit `4f2fe15c` aprovado nas duas execuções, incluindo teste de reinicialização da instância HTTP com reconexão ao MySQL.
- FrontEnd: CI do commit `39028d67` aprovado nas duas execuções; verificações dos commits posteriores de documentação ainda estavam em andamento na última consulta.
- Não foi realizada nesta revisão uma homologação manual completa, nem uma reinicialização real do contêiner MySQL com recuperação de volume. Não há deploy em produção nem merge aprovado.
