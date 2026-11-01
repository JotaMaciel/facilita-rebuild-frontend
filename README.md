# Facilita Rebuild — FrontEnd

**Responsável pela versão Rebuild:** João Pedro de França Maciel ([@JotaMaciel](https://github.com/JotaMaciel)).

Reestruturação da interface web do Facilita com foco em acessibilidade, usabilidade, desempenho e integração confiável com o [BackEnd Rebuild](https://github.com/JotaMaciel/facilita-rebuild-backend).

> **Estado atual:** preparação da migração; ainda não há aplicação executável neste repositório.

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

Configure `VITE_API_BASE_URL` para o endereço da API. Execute o BackEnd antes de testar. A interface ainda depende de validação de build e testes end-to-end e não contém os recursos completos do FrontEnd original.

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
