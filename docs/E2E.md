# Teste end-to-end no navegador

O workflow `integration-contract` agora executa um teste de navegador Chromium em conjunto com MySQL 8.4 e a API Rebuild.

## Cenário atual
1. O CI aplica as migrações, inicia a API e cadastra uma conta sintética.
2. O Vite compila o FrontEnd apontando para a API de teste.
3. O Chromium abre a interface e preenche o formulário de login.
4. O teste valida a mensagem de boas-vindas e a sessão local.
5. O cliente cria uma solicitação pela interface e verifica que ela aparece na lista.
6. O usuário sai e o teste confirma que a interface voltou ao estado deslogado.
7. O teste cadastra um prestador sintético por HTTP, entra com ele no navegador e verifica o serviço disponível.
8. O prestador aceita e inicia o atendimento, envia uma mensagem e conclui o serviço pelo FrontEnd.
9. O cliente acessa novamente a conta, verifica a conclusão, envia uma avaliação e confere a notificação de serviço aceito.

O arquivo executável é `test/e2e.mjs`. O browser é instalado temporariamente apenas no runner do GitHub Actions.

## Limitações
Este é um teste de fluxo real, mas limitado. Ainda faltam cenários de recuperação de senha, responsividade e acessibilidade, além de mais testes de erros e permissões. O ciclo de serviços foi acrescentado ao teste, mas só será considerado validado depois do CI verde. Os resultados dependem da execução mais recente do CI e não são homologação de produção.

## Responsividade
O teste Chromium também simula uma janela mobile de 390 × 844, verifica a presença do conteúdo principal após recarregar e detecta rolagem horizontal inesperada. Este teste é uma verificação básica, não substitui inspeções visuais nem auditorias de acessibilidade.
