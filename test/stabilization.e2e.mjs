import { chromium } from 'playwright';
import assert from 'node:assert/strict';

const browser = await chromium.launch({ headless: true, ...(process.env.E2E_CHROMIUM_PATH ? { executablePath: process.env.E2E_CHROMIUM_PATH } : {}) });
const page = await browser.newPage();
const apiBase = 'http://127.0.0.1:3000/v1/facilita';
const login = async email => {
  const response = await fetch(apiBase + '/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, senha: 'SenhaForte123!' }) });
  assert.equal(response.status, 200);
  return (await response.json()).token;
};
const setAccount = async token => {
  await page.goto('http://127.0.0.1:4173/');
  await page.evaluate(value => sessionStorage.setItem('facilita-token', value), token);
  await page.reload({ waitUntil: 'networkidle' });
};
try {
  const token = await login('ci-front@example.test');
  await setAccount(token);
  await page.getByText('Olá, Pessoa!').waitFor();
  await page.getByRole('button', { name: 'Carregar mais serviços' }).click();
  const description = 'Solicitação E2E para ajuda com compras';
  const card = page.locator('.service-list .service-item').filter({ hasText: description });
  await card.getByText(/Avaliação enviada/).waitFor();
  assert.equal(await card.getByRole('button', { name: 'Enviar avaliação' }).count(), 0);
  await card.getByRole('button', { name: 'Mensagens', exact: true }).click();
  await page.getByRole('dialog').getByText(/somente para leitura/).waitFor();
  assert.equal(await page.getByRole('dialog').getByRole('button', { name: 'Enviar', exact: true }).count(), 0);
  await page.keyboard.press('Escape');
  console.log('Regressão E2E: avaliação persiste e conversa concluída é somente leitura.');

  // A paginação real com 205 registros é coberta pela integração MySQL do BackEnd.
  // Aqui controlamos duas páginas para verificar a junção e os controles da interface.
  const services = (await (await fetch(apiBase + '/servicos?page=2', { headers: { Authorization: 'Bearer ' + token } })).json()).data;
  const service = services.find(item => item.descricao === description);
  assert.ok(service);
  const messagePath = `**/servicos/${service.id}/mensagens*`;
  const message = index => ({ id: `fixture-${index}`, servicoId: service.id, autorId: 'fixture', texto: `Histórico controlado ${index}`, criadoEm: new Date(1700000000000 + index * 1000).toISOString() });
  await page.clock.install();
  let includePolledMessage = false;
  await page.route(messagePath, route => route.fulfill({ json: route.request().url().includes('before=') ? {
    data: Array.from({ length: 100 }, (_, i) => message(i)), hasMoreMessages: false, nextCursor: null,
  } : {
    data: Array.from({ length: 100 }, (_, i) => message(i + (includePolledMessage ? 101 : 100))), hasMoreMessages: true, nextCursor: 'fixture-100',
  } }));
  await card.getByRole('button', { name: 'Mensagens', exact: true }).click();
  const dialog = page.getByRole('dialog');
  await dialog.getByText('Histórico controlado 199', { exact: true }).waitFor();
  await dialog.getByRole('button', { name: 'Carregar mensagens anteriores' }).click();
  await dialog.getByText('Histórico controlado 0', { exact: true }).waitFor();
  assert.equal(await dialog.locator('.message-list p').count(), 200);
  assert.equal(await dialog.getByRole('button', { name: 'Carregar mensagens anteriores' }).count(), 0);
  const refreshed = page.waitForResponse(response => response.url().includes(`/servicos/${service.id}/mensagens`) && !response.url().includes('before='));
  await dialog.getByRole('button', { name: 'Atualizar mensagens' }).click();
  await refreshed;
  await dialog.getByText('Histórico controlado 199', { exact: true }).waitFor();
  await dialog.getByRole('button', { name: 'Carregar mensagens anteriores' }).waitFor();
  assert.equal(await dialog.getByText('Histórico controlado 200', { exact: true }).count(), 0);
  includePolledMessage = true;
  await page.clock.fastForward(10000);
  await dialog.getByText('Histórico controlado 200', { exact: true }).waitFor();
  await page.getByRole('dialog').getByRole('button', { name: 'Fechar', exact: true }).click();
  await page.unroute(messagePath);
  console.log('Regressão de interface: polling continua após atualizar manualmente a conversa.');
  console.log('Regressão de interface: carrega histórico anterior preservando mensagens recentes.');

  await fetch(apiBase + '/auth/logout', { method: 'POST', headers: { Authorization: 'Bearer ' + token } });
  await page.getByRole('button', { name: 'Ver sessões ativas' }).click();
  await page.waitForFunction(() => sessionStorage.getItem('facilita-token') === null);
  assert.equal(await page.locator('.service-list .service-item').count(), 0);
  assert.equal(await page.locator('.notification').count(), 0);
  await page.getByRole('alert').getByText('Sua sessão expirou. Entre novamente.').waitFor();
  console.log('Regressão E2E: 401 durante uso remove token e dados privados sem reload.');

  await setAccount(await login('prestador-e2e@example.test'));
  await page.getByText('Olá, Prestador!').waitFor();
  const completed = page.locator('.provider-grid .service-item').filter({ hasText: description });
  await completed.getByText('CONCLUIDO').waitFor();
  assert.equal(await completed.getByRole('button', { name: 'Concluir', exact: true }).count(), 0);
  await completed.getByRole('button', { name: 'Mensagens', exact: true }).click();
  await page.getByRole('dialog').getByText('Mensagem E2E de atendimento').waitFor();
  await page.getByRole('dialog').getByText(/somente para leitura/).waitFor();
  console.log('Regressão E2E: prestador acessa histórico após concluir atendimento.');
} catch (error) {
  await page.screenshot({ path: 'e2e-failure.png', fullPage: true }).catch(() => {});
  throw error;
} finally { await browser.close(); }
