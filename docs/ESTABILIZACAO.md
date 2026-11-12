# Estabilização para homologação

- 401 em chamada autenticada limpa sessão e dados privados durante o uso, inclusive polling. Erro de rede e credenciais incorretas no login não encerram outra sessão. Resposta atrasada de outro token não encerra a conta atual.
- Avaliação persistida aparece como enviada após reload. Duplicata de outra aba recebe mensagem específica.
- Concluídos continuam visíveis ao prestador. Conversa concluída é somente leitura para cliente e prestador.
- Conversas abrem nas últimas 100 mensagens e permitem carregar anteriores, conciliando IDs. Refresh manual reinicia a janela recente. Polling preserva histórico carregado e continua funcionando após atualização manual da conversa.
- Lockfile fixa dependências e Playwright. `npm ci` instala; `npx playwright install chromium` prepara o navegador.
- `npm run test:e2e` executa fluxo integrado e regressões em sequência. Exige API de teste, MySQL descartável, FrontEnd na porta 4173 e fixture `ci-front@example.test` criada pelo workflow. Contas fixas pressupõem base nova; nunca executar contra dados reais.
- `E2E_CHROMIUM_PATH=/usr/bin/chromium` permite usar Chromium instalado; por padrão usa navegador Playwright.
- Regressões: avaliação após reload, histórico do prestador, somente leitura e 401 sem reload. Paginação visual usa respostas controladas; paginação real com 205 registros é verificada no MySQL pelo BackEnd.

## Implantação conjunta
Requer API atualizada, com paginação e avaliação em serviços. CI ainda consulta a branch de desenvolvimento do BackEnd; confirme o par de commits antes de homologar. Alterações locais não são publicadas automaticamente. TLS, CORS público e e-mail real dependem da homologação hospedada.

## Evidências locais
Build TypeScript/Vite aprovado com Node 22. Fluxo integrado original aprovado no Chromium; regressões adicionais aprovadas após corrigir o foco quando a paginação termina. Auditoria npm: zero avisos na resolução fixada. Testes de navegador não substituem homologação de TLS, proxy, e-mail e domínio público.

A regressão de polling verifica uma nova mensagem recebida na consulta periódica posterior ao refresh manual, depois de aguardar a resposta desse refresh.
