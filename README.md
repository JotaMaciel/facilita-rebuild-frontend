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
