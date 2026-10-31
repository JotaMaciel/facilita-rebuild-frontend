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

## Recuperação de senha
O fluxo automatizado abre a recuperação a partir do modal de login, envia um endereço sintético inexistente e verifica que a interface exibe uma resposta informativa. A entrega real de e-mail, o link expirado e a redefinição completa continuam fora deste teste de navegador; o BackEnd já possui testes de recuperação via API/MySQL.

## Acessibilidade básica
O Chromium verifica que o campo de e-mail é identificado por seu rótulo, recebe foco e permite avançar para outro controle com Tab. Também confere a presença de um diálogo acessível na recuperação. Trata-se de cobertura inicial: ainda é necessária auditoria WCAG mais ampla, testes de leitor de tela, contraste e foco nos modais.

## Navegação dos modais
O FrontEnd passa a permitir fechar os modais de autenticação e mensagens usando Escape, além de circular o foco entre controles internos com Tab e Shift+Tab. O teste Chromium confirma o fechamento e que o foco permanece dentro do diálogo após a tabulação. Ainda é necessário melhorar o foco inicial e o retorno do foco ao elemento que abriu o modal, além de testar leitores de tela.

## Gerenciamento inicial e retorno de foco
Foi adicionado foco automático no primeiro controle do modal e tentativa de restaurar o foco ao elemento anterior quando o diálogo fecha. O teste no Chromium verifica o retorno ao botão de entrada após Escape. Ainda são necessários testes de leitores de tela, contraste e alterações dinâmicas de conteúdo.

## Revogação de sessão
A interface agora valida `/auth/me` antes de carregar os dados privados. O teste revoga no BackEnd uma sessão autenticada, recarrega a interface e verifica que o token é descartado e nenhum serviço privado fica exposto. Respostas assíncronas de uma sessão anterior são ignoradas quando o token muda.

## Consultas periódicas e autenticação
A atualização automática de mensagens e notificações agora depende da identidade validada em `/auth/me`, não apenas da existência do token local. Assim, falhas temporárias de validação não deixam consultas periódicas atuarem sobre uma sessão cuja identidade não foi confirmada. O teste de token revogado e a simulação de falha de conexão complementam essa proteção.

## Correção de sessão expirada
O BackEnd responde com `SESSION_EXPIRED` quando um token foi revogado ou expirou. O FrontEnd agora mapeia esse erro para a mensagem de autenticação inválida, remove a sessão local e limpa os dados. O teste E2E revoga o token na API, recarrega a interface e confirma o logout; uma falha de rede temporária deve manter o token sem mostrar dados não validados.

## Consultas por perfil
Após validar `/auth/me`, o FrontEnd solicita serviços do cliente somente para `CLIENTE`, e oportunidades e serviços atribuídos somente para `PRESTADOR`. Dessa forma, não faz requisições desnecessárias a recursos de outro perfil. A autorização real continua obrigatória e implementada no BackEnd.
