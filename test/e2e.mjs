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
  await page.getByRole('button',{name:'Concluir'}).waitFor({timeout:15000});
  await page.getByRole('button',{name:'Concluir'}).click();
  console.log('E2E navegador: cliente cria solicitação; prestador aceita, inicia e conclui.');

} finally {
  await browser.close();
}
