import { chromium } from 'playwright';
import assert from 'node:assert/strict';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
try {
  await page.goto('http://127.0.0.1:4173/', { waitUntil: 'networkidle' });
  await page.getByRole('button', {name:/Entrar/}).first().click();
  await page.locator('#email').fill('ci-front@example.test');
  await page.locator('#senha').fill('SenhaForte123!');
  await page.getByRole('button', {name:/Entrar/}).last().click();
  await page.getByText('Olá, Pessoa!').waitFor({ timeout: 15000 });
  const descricao = 'Solicitação E2E para ajuda com compras';
  await page.locator('#descricao').fill(descricao);
  await page.locator('.service-form').getByRole('button', { name: /Criar solicitação/ }).click();
  await page.locator('.service-item').getByText(descricao).waitFor({ timeout: 15000 });
  const token = await page.evaluate(() => sessionStorage.getItem('facilita-token'));
  assert.ok(token, 'login precisa armazenar sessão');
  await page.getByRole('button', {name:/Sair/}).first().click();
  await page.getByRole('button', {name:/Entrar/}).first().waitFor();
  const providerEmail = 'prestador-e2e@example.test';
  const provider = await fetch('http://127.0.0.1:3000/v1/facilita/auth/registro', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({nome:'Prestador E2E', email:providerEmail, senha:'SenhaForte123!', papel:'PRESTADOR'}),
  });
  assert.equal(provider.status, 201, 'cadastro do prestador no banco de testes');
  await page.getByRole('button', {name:/Entrar/}).first().click();
  await page.locator('#email').fill(providerEmail);
  await page.locator('#senha').fill('SenhaForte123!');
  await page.getByRole('button', {name:/Entrar/}).last().click();
  const opportunity = page.locator('.provider-section .service-item').filter({hasText:descricao});
  await opportunity.waitFor({timeout:15000});
  await opportunity.getByRole('button',{name:'Aceitar'}).click();
  await page.getByRole('button',{name:'Iniciar'}).waitFor({timeout:15000});
  await page.getByRole('button',{name:'Iniciar'}).click();
  const assignedService = page.locator('.provider-grid .service-item').filter({hasText:descricao});
  await assignedService.getByRole('button',{name:'Mensagens'}).click();
  await page.locator('#novaMensagem').fill('Mensagem E2E de atendimento');
  await page.getByRole('button',{name:'Enviar'}).click();
  await page.getByText('Mensagem E2E de atendimento').waitFor({timeout:15000});
  await page.getByRole('dialog',{name:'Mensagens do serviço'}).getByRole('button',{name:'Fechar'}).click();
  await page.getByRole('button',{name:'Concluir'}).waitFor({timeout:15000});
  await page.getByRole('button',{name:'Concluir'}).click();
  await page.getByRole('button',{name:/Sair/}).first().click();
  await page.getByRole('button',{name:/Entrar/}).first().click();
  await page.locator('#email').fill('ci-front@example.test');
  await page.locator('#senha').fill('SenhaForte123!');
  await page.getByRole('button',{name:/Entrar/}).last().click();
  await page.getByText('Olá, Pessoa!').waitFor({timeout:15000});
  const completedService = page.locator('.service-list .service-item').filter({hasText:descricao});
  await completedService.getByText('CONCLUIDO').waitFor({timeout:15000});
  await completedService.getByRole('button',{name:'Enviar avaliação'}).click();
  await completedService.getByRole('button',{name:'Enviar avaliação'}).waitFor({state:'detached',timeout:15000});
  await page.getByText('Serviço aceito').first().waitFor({timeout:15000});
  console.log('E2E navegador: atendimento concluído, avaliação e notificação do cliente confirmadas.');

} catch (error) {
  await page.screenshot({ path: 'e2e-failure.png', fullPage: true }).catch(() => {});
  const alerts = await page.getByRole('alert').allTextContents().catch(() => []);
  console.error('Falha E2E. Alertas da interface:', alerts);
  throw error;
} finally {
  await browser.close();
}
