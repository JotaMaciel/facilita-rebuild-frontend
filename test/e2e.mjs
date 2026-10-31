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
  const token = await page.evaluate(() => sessionStorage.getItem('facilita-token'));
  assert.ok(token, 'login precisa armazenar sessão');
  await page.getByRole('button', {name:/Sair/}).first().click();
  await page.getByRole('button', {name:/Entrar/}).first().waitFor();
  console.log('E2E navegador: login, exibição da conta e logout concluídos.');
} finally {
  await browser.close();
}
