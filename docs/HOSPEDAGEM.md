# Hospedagem do FrontEnd — Facilita Rebuild

## Opção A — hospedagem estática
Hospede o build do Vite em Vercel, Netlify ou outro serviço estático.

- Build: `npm run build`
- Diretório de saída: `dist`
- Variável de build: `VITE_API_BASE_URL=https://SEU-BACKEND/v1/facilita`

**Importante:** variáveis `VITE_*` são incorporadas ao JavaScript público durante o build. Nunca coloque senhas ou tokens secretos nelas.

## Opção B — container Nginx
```bash
docker build --build-arg VITE_API_BASE_URL=https://SEU-BACKEND/v1/facilita -t facilita-rebuild-frontend .
docker run --rm -p 8080:80 facilita-rebuild-frontend
```

A configuração Nginx permite fallback para aplicações SPA. A URL da API deve ser configurada durante a construção da imagem, não após iniciá-la.

## Antes de publicar
- Confirmar que o BackEnd permite o domínio do FrontEnd em `FRONTEND_URL`.
- Usar HTTPS para API e interface.
- Testar cadastro, login, serviços e chat em homologação.
- Não usar dados pessoais reais ou pagamento real em ambiente demonstrativo.
- Validar comportamento em dispositivos móveis, acessibilidade e limites de sessão.

## Estado
Configuração adicionada, sem implantação pública confirmada.
