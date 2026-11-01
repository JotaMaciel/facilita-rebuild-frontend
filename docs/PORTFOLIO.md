# Facilita Rebuild — apresentação para portfólio

## Visão geral

O **Facilita Rebuild** é uma reimplementação independente da aplicação web e da API do projeto acadêmico Facilita. O objetivo é aproximar pessoas que precisam de ajuda com tarefas cotidianas e prestadores disponíveis, demonstrando competências em engenharia de software, integração de sistemas e testes automatizados.

**Responsável pelo Rebuild:** João Pedro de França Maciel.

## Tecnologias

| Camada | Tecnologias |
| --- | --- |
| FrontEnd | React 19, TypeScript, Vite, CSS responsivo |
| BackEnd | Node.js 22, Express 5, JavaScript |
| Persistência | MySQL 8.4, Prisma, migrações versionadas |
| Autenticação | Senhas protegidas, token JWT, sessões revogáveis |
| Qualidade | GitHub Actions, testes unitários, integração com MySQL e Chromium/Playwright |
| Empacotamento | Docker e Nginx para o FrontEnd |

## Funcionalidades demonstráveis

- Cadastro e autenticação de clientes e prestadores.
- Recuperação e redefinição de senha por token em ambiente configurado para isso.
- Criação, listagem paginada e cancelamento de solicitações por clientes.
- Visualização e aceite de oportunidades por prestadores.
- Início e conclusão de atendimentos.
- Troca de mensagens vinculadas ao serviço, com consulta periódica.
- Notificações com marcação de leitura.
- Avaliação do atendimento concluído.
- Consulta e encerramento de sessões ativas.
- Proteção de operações e dados por autenticação, papéis e vínculo com o serviço.

## Fluxo de demonstração

1. Iniciar o MySQL e o BackEnd seguindo o [guia de execução local](https://github.com/JotaMaciel/facilita-rebuild-backend/blob/feat/persistencia-autenticacao/docs/EXECUCAO_LOCAL.md).
2. Iniciar o FrontEnd e acessar a aplicação no navegador.
3. Criar ou autenticar uma conta de cliente e cadastrar uma solicitação.
4. Em outra sessão, autenticar um prestador, aceitar a oportunidade e iniciar o atendimento.
5. Trocar mensagens, concluir o serviço e avaliar como cliente.
6. Verificar notificações, encerramento de sessões e persistência após atualizar a página.

Use **contas e dados de demonstração**, nunca credenciais reais. Para o reset de senha, configure um provedor de e-mail ou use apenas o mecanismo local de desenvolvimento previsto no BackEnd.

## Evidências de qualidade

Os workflows do GitHub Actions validam build e contêiner do FrontEnd, a API e banco MySQL de testes. O cenário E2E exercita um fluxo completo no navegador e verifica também cancelamento, paginação, mensagens persistidas, notificações, responsividade e revogação de sessão.

O BackEnd dispõe de testes unitários e de integração com MySQL. Existe também cenário que fecha a instância HTTP, reconecta o Prisma e consulta novamente um serviço previamente persistido. **Antes de divulgar o resultado dessa nova verificação, consulte o CI do commit correspondente.**

- [PR do FrontEnd](https://github.com/JotaMaciel/facilita-rebuild-frontend/pull/1)
- [PR do BackEnd](https://github.com/JotaMaciel/facilita-rebuild-backend/pull/2)
- [Arquitetura do FrontEnd](ARQUITETURA_FRONTEND.md)

## Escopo e limitações

Este é um **MVP de portfólio**, não uma plataforma de contratação em produção. Não há pagamentos reais nem garantia de paridade com todos os recursos do TCC original. O chat usa polling, não comunicação em tempo real via WebSocket. O envio real de recuperação de senha exige configuração externa. Também faltam validação de implantação/backup em produção, capturas de tela definitivas e revisão manual em múltiplos dispositivos.

## Créditos

A origem é um projeto acadêmico desenvolvido em equipe. O Rebuild preserva a atribuição aos autores dos projetos usados como referência:

- [FrontEnd de origem](https://github.com/fritute/facilita-front-end), cuja documentação credita Gustavo Zumba.
- [BackEnd de origem](https://github.com/gioxavier7/servidor-facilita), cuja documentação credita Giovanna Soares Xavier.

A autoria do Rebuild é independente e não substitui o reconhecimento do trabalho original.

## Antes de publicar

Conferir o CI do commit final, revisar as configurações de segurança, executar uma demonstração manual integrada, produzir capturas de tela com dados fictícios e decidir separadamente se haverá merge e deploy.
