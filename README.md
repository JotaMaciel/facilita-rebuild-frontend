# Facilita Rebuild — FrontEnd

**Responsável pela versão Rebuild:** João Pedro de França Maciel ([@JotaMaciel](https://github.com/JotaMaciel)).

Reestruturação da interface web do Facilita com foco em acessibilidade, usabilidade, desempenho e integração confiável com o [BackEnd Rebuild](https://github.com/JotaMaciel/facilita-rebuild-backend).

> **Estado atual:** MVP web executável na branch `feat/interface-integrada-api`, integrado ao BackEnd Rebuild. O projeto ainda não reproduz todas as funcionalidades da versão original e não foi publicado em produção.

## Direção técnica
- React + TypeScript + Vite (mantendo tecnologias já usadas na origem).
- Componentes reutilizáveis, responsividade e acessibilidade.
- Tipagem dos contratos de API, tratamento de erro e estados de carregamento.
- Design system consistente, navegação clara e formulários validados.
- Testes de interface e integração.
- Revisão da arquitetura de dados antes de introduzir bibliotecas extras.

## Origem e créditos
Repositório de referência: [fritute/facilita-front-end](https://github.com/fritute/facilita-front-end). O README original identifica **Gustavo Zumba** como desenvolvedor. Esta versão será mantida e aprimorada por João Pedro de França Maciel, preservando essa atribuição de origem.

## Principais ajustes identificados
- O README original documenta `VITE_API_BASE_URL` e `VITE_WEBSOCKET_URL`, enquanto `.env.example` usa `VITE_API_URL` e `VITE_WS_URL`.
- O exemplo atual mistura API remota com Socket.IO local, o que exige padronização por ambiente.
- README original cita scripts `test` e `type-check` que não aparecem em `package.json`.

## Próximos passos
1. Verificar permissões de reutilização e importar o código original.
2. Catalogar páginas, componentes, rotas, serviços e chamadas à API.
3. Padronizar variáveis de ambiente e URLs do BackEnd.
4. Validar build e fluxos essenciais.
5. Evoluir o visual e a acessibilidade com testes de regressão.

## Estado de validação
Os workflows de CI no GitHub Actions executam verificações automáticas da branch. Consulte a aba Actions para confirmar o resultado do commit mais recente; o build local pode ser verificado com `npm run build`.

## Implementação desta branch

Esta branch inclui interface React 19 + TypeScript + Vite, layout responsivo, cadastro, login e criação/listagem de solicitações integradas à [API Rebuild](https://github.com/JotaMaciel/facilita-rebuild-backend/pull/2).

Para executar localmente:

```bash
npm install
cp .env.example .env
npm run dev
```

Configure `VITE_API_BASE_URL` para o endereço da API. Execute o BackEnd antes de testar. O GitHub Actions verifica build TypeScript/Vite, imagem Docker/Nginx e fluxo ponta a ponta com Chromium, API e MySQL. A interface ainda não contém todos os recursos do FrontEnd original.

## Paginação de solicitações
A lista de serviços do cliente carrega até 20 registros por página. Enquanto a API informar `hasNextPage: true`, o botão **Carregar mais serviços** solicita a página seguinte, evitando registros duplicados. A interface bloqueia requisições concorrentes de paginação e descarta respostas atrasadas após encerramento ou troca de sessão. Esse fluxo depende da versão atual da API Rebuild.

## Proteção contra respostas de sessões antigas
O carregamento de identidade e listagens e a paginação verificam a versão da sessão antes de aplicar respostas assíncronas. Ao encerrar ou trocar de conta, respostas iniciadas na sessão anterior são descartadas para evitar que dados antigos reapareçam na interface.

As atualizações periódicas de mensagens (10 segundos) e notificações (30 segundos) também comparam a versão da sessão antes de aplicar respostas. Assim, requisições iniciadas antes do logout não repovoam a interface.

## Alternância de conversas
Ao abrir uma conversa, a lista anterior é limpa e cada solicitação de mensagens recebe uma identificação local. Quando o usuário abre outra conversa antes de a primeira resposta chegar, o resultado antigo é descartado. O mesmo vale para requisições iniciadas antes da troca de sessão.

O envio de mensagens também verifica a conversa e a sessão originais antes de atualizar a interface. Se a resposta chegar após alternar a conversa ou sair da conta, ela não é exibida na conversa atual. Mensagens com o mesmo `id` não são adicionadas duas vezes.

Ao fechar o modal de conversa (botão, Escape ou clique fora), requisições pendentes são invalidadas e as mensagens e o texto digitado são limpos. Respostas de carregamento ou envio que cheguem depois do fechamento não repovoam o modal.

O polling de mensagens não inicia uma segunda consulta enquanto a anterior estiver pendente. Ao receber dados, preserva mensagens já presentes na interface que ainda não vieram na resposta, evitando perder mensagens recém-enviadas por causa de uma atualização atrasada. O resultado também é descartado se a conversa tiver sido fechada ou substituída.

O carregamento inicial de uma conversa também concilia mensagens pelo `id`, preservando mensagens enviadas enquanto a primeira consulta ainda estava pendente. Assim, tanto a abertura quanto o polling evitam sobrescrever mensagens recentes.

As mensagens recebidas por carregamento inicial, polling e envio são conciliadas pelo identificador e ordenadas por `criadoEm` (com `id` como desempate), evitando alterações de ordem quando as respostas chegam fora de sequência.

O polling de notificações não dispara consultas simultâneas e preserva o estado `lida: true` já exibido enquanto chega uma atualização do servidor, evitando que uma resposta atrasada volte a marcar uma notificação como não lida.

A ação **Marcar como lida** também verifica a versão da sessão antes de atualizar a notificação ou exibir erros. Se o usuário trocar de conta durante a requisição, o resultado atrasado é ignorado.

A criação de solicitações também confere a versão da sessão antes de inserir o novo serviço na lista. Se a resposta chegar após logout ou troca de conta, ela não modifica os dados da sessão atual. A lista evita inserir duas vezes o mesmo identificador.

O cancelamento de serviços também verifica a versão da sessão antes de atualizar a lista, exibir erros ou liberar o estado de carregamento. Uma resposta atrasada de outra conta não altera a interface atual; uma operação já processada pela API não é desfeita por essa proteção.

A ação do prestador **Aceitar serviço** descarta respostas que chegam após a troca de conta e evita adicionar duas vezes o mesmo serviço aos atendimentos atribuídos. Essa proteção afeta somente a interface e não reverte operações confirmadas no servidor.

As ações do prestador **Iniciar serviço** e **Concluir serviço** também verificam a versão da sessão após a resposta da API. Se o usuário trocar de conta enquanto a operação está em andamento, a resposta não modifica a lista de atendimentos da sessão atual; isso não reverte alterações já processadas no servidor.

O envio de avaliações também valida a versão da sessão antes de marcar uma avaliação como enviada ou limpar o comentário. Uma resposta atrasada de outra conta é ignorada na interface, e o identificador do serviço não é duplicado na lista de avaliações enviadas.

## Teste ponta a ponta da paginação
O cenário `test/e2e.mjs` utiliza Chromium e a API integrada ao MySQL do GitHub Actions para criar 22 serviços do mesmo cliente, recarregar a interface e conferir que a primeira página mostra 20 itens. Com a inclusão do cenário de cancelamento, o banco contém 23 serviços ao todo. Depois aciona **Carregar mais serviços** e verifica os 23 registros sem duplicação e confirma que o botão desaparece na última página. A validação é executada no job `integration-contract`.

## Teste ponta a ponta de persistência de mensagens
O cenário de Chromium valida que uma mensagem enviada pelo prestador pode ser visualizada pelo cliente depois da conclusão do atendimento. Em seguida, recarrega a página, abre novamente a conversa e verifica se a mensagem continua disponível no MySQL por meio da API.

## Teste ponta a ponta de leitura de notificações
O navegador marca uma notificação de serviço aceito como lida, recarrega a aplicação e verifica que a opção **Marcar como lida** não reaparece na notificação. Esse teste confirma a persistência do estado de leitura na integração entre interface, API e MySQL.

## Teste ponta a ponta de revogação
O teste de navegador revoga a sessão pelo BackEnd, recarrega a aplicação e confirma a remoção do token local, dos serviços, das notificações e dos atendimentos privados. Também verifica diretamente que a API rejeita o JWT revogado com HTTP 401.

O teste E2E também reinsere propositalmente no `sessionStorage` um JWT já revogado e recarrega a página. A interface deve rejeitar a sessão, remover o token e continuar sem exibir serviços ou notificações privadas.

## Teste ponta a ponta de cancelamento
O teste de navegador cria uma solicitação pendente, cancela pela interface e confere o status `CANCELADO`. Depois recarrega a aplicação, verifica que o status continua persistido no MySQL e que a ação de cancelar não aparece novamente.

## Teste de isolamento entre cliente e prestador
No cenário E2E, após autenticar o prestador, o teste faz uma tentativa direta de cancelar um serviço pertencente ao cliente. O BackEnd deve recusar a operação com HTTP 409 (`CANNOT_CANCEL`), sem modificar o estado do serviço. O teste então prossegue com o fluxo legítimo de aceite e atendimento.

## Arquitetura atual
A interface foi dividida em componentes tipados para autenticação, serviços, mensagens, notificações, sessões e navegação. Consulte [a documentação de arquitetura](docs/ARQUITETURA_FRONTEND.md) para responsabilidades, fluxos, integração com a API e limitações do MVP.
