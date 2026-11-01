import { chromium } from 'playwright';
import assert from 'node:assert/strict';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
try {
  await page.goto('http://127.0.0.1:4173/', { waitUntil: 'networkidle' });
  await page.getByRole('button', {name:/Entrar/}).first().click();
  await page.locator('#email').fill('ci-front@example.test');
  await page.locator('#senha').fill('senha-incorreta');
  await page.getByRole('button', {name:/Entrar/}).last().click();
  await page.getByRole('alert').getByText('E-mail ou senha incorretos.').waitFor({timeout:15000});
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
  assert.equal(await page.locator('.service-list .service-item').count(), 0, 'serviços privados devem sumir após logout');
  assert.equal(await page.locator('.notification').count(), 0, 'notificações privadas devem sumir após logout');
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
  await page.getByText('Olá, Prestador!').waitFor({timeout:15000});
  await page.getByText('Área de atendimento').waitFor({timeout:15000});
  assert.equal(await page.locator('.service-form button[type="submit"]').count(),0,'prestador não deve ver formulário de criação');
  assert.equal(await page.locator('.service-list .service-item').filter({hasText:descricao}).count(),0,'prestador não deve receber serviços privados da conta cliente');
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
  await completedService.getByRole('button',{name:'Mensagens'}).click();
  const customerChat = page.getByRole('dialog',{name:'Mensagens do serviço'});
  await customerChat.getByText('Mensagem E2E de atendimento').waitFor({timeout:15000});
  await customerChat.getByRole('button',{name:'Fechar'}).click();
  await page.reload({waitUntil:'networkidle'});
  await page.getByText('Olá, Pessoa!').waitFor({timeout:15000});
  const persistedService = page.locator('.service-list .service-item').filter({hasText:descricao});
  await persistedService.getByRole('button',{name:'Mensagens'}).click();
  await page.getByRole('dialog',{name:'Mensagens do serviço'}).getByText('Mensagem E2E de atendimento').waitFor({timeout:15000});
  await page.getByRole('dialog',{name:'Mensagens do serviço'}).getByRole('button',{name:'Fechar'}).click();
  console.log('E2E navegador: cliente lê mensagem do prestador mesmo após recarregar.');

  await completedService.getByRole('button',{name:'Enviar avaliação'}).click();
  await completedService.getByRole('button',{name:'Enviar avaliação'}).waitFor({state:'detached',timeout:15000});
  await page.getByText('Serviço aceito').first().waitFor({timeout:15000});
  const notification = page.locator('.notification').filter({hasText:'Serviço aceito'}).first();
  await notification.getByRole('button',{name:'Marcar como lida'}).click();
  await notification.getByRole('button',{name:'Marcar como lida'}).waitFor({state:'detached',timeout:15000});
  await page.reload({waitUntil:'networkidle'});
  await page.getByText('Olá, Pessoa!').waitFor({timeout:15000});
  const persistedNotification = page.locator('.notification').filter({hasText:'Serviço aceito'}).first();
  await persistedNotification.waitFor({timeout:15000});
  assert.equal(await persistedNotification.getByRole('button',{name:'Marcar como lida'}).count(),0,'notificação deve permanecer lida após recarregar');
  console.log('E2E navegador: leitura de notificação persiste no banco após reload.');

  console.log('E2E navegador: atendimento concluído, avaliação e notificação do cliente confirmadas.');

  // Validação real da paginação com dados persistidos no MySQL.
  const apiBase = 'http://127.0.0.1:3000/v1/facilita';
  const currentToken = await page.evaluate(() => sessionStorage.getItem('facilita-token'));
  assert.ok(currentToken, 'sessão do cliente precisa continuar ativa');
  for (let index = 0; index < 21; index++) {
    const created = await fetch(apiBase + '/servicos', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + currentToken, 'Content-Type': 'application/json' },
      body: JSON.stringify({ categoria: 'Compras', descricao: 'Solicitação paginada E2E ' + index }),
    });
    assert.equal(created.status, 201, 'serviço de teste ' + index + ' deve ser criado');
  }
  await page.reload({ waitUntil: 'networkidle' });
  await page.getByText('Olá, Pessoa!').waitFor({ timeout: 15000 });
  const serviceCards = page.locator('.service-list .service-item');
  await page.getByRole('button', { name: 'Carregar mais serviços' }).waitFor({ timeout: 15000 });
  assert.equal(await serviceCards.count(), 20, 'primeira página deve conter 20 serviços');
  await page.getByRole('button', { name: 'Carregar mais serviços' }).click();
  await page.waitForFunction(() => document.querySelectorAll('.service-list .service-item').length === 22);
  assert.equal(await page.getByRole('button', { name: 'Carregar mais serviços' }).count(), 0, 'botão desaparece após última página');
  const serviceIds = await serviceCards.locator('small').allTextContents();
  assert.equal(new Set(serviceIds).size, 22, 'nenhum serviço deve ser exibido duas vezes');
  console.log('E2E navegador: 22 serviços em duas páginas, sem duplicações.');

  await page.setViewportSize({width:390,height:844});
  await page.reload({waitUntil:'networkidle'});
  await page.getByRole('heading',{name:/Mais tempo para/}).waitFor({timeout:15000});
  const horizontalOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 2);
  assert.equal(horizontalOverflow,false,'interface mobile não deve ter rolagem horizontal');
  console.log('E2E navegador: viewport mobile sem overflow horizontal.');
  await page.getByRole('button',{name:/Sair/}).first().click();
  await page.getByRole('button',{name:/Entrar/}).first().click();
  await page.getByRole('button',{name:'Esqueci minha senha'}).click();
  await page.locator('#email').fill('endereco-inexistente-e2e@example.test');
  await page.getByRole('button',{name:'Solicitar recuperação'}).click();
  await page.getByRole('status').waitFor({timeout:15000});
  console.log('E2E navegador: solicitação de recuperação responde sem revelar existência de conta.');
  const emailInput = page.locator('#email');
  await emailInput.focus();
  assert.equal(await emailInput.evaluate(el => el === document.activeElement), true, 'email precisa receber foco por teclado');
  await page.keyboard.press('Tab');
  const focusedTag = await page.evaluate(() => document.activeElement?.tagName);
  assert.ok(['BUTTON','INPUT','A'].includes(focusedTag || ''), 'tecla Tab deve alcançar outro controle interativo');
  const modal = page.getByRole('dialog');
  assert.equal(await modal.count(), 1, 'recuperação precisa manter diálogo acessível');
  const accessibleEmail = page.getByRole('textbox', {name:'E-mail'});
  assert.equal(await accessibleEmail.count(),1,'campo de e-mail precisa de rótulo acessível');
  console.log('E2E navegador: rótulos e navegação básica de teclado confirmados.');
  await page.keyboard.press('Escape');
  await page.getByRole('dialog').waitFor({state:'detached',timeout:5000});
  await page.getByRole('button',{name:/Entrar/}).first().click();
  const closeButton = page.getByRole('dialog').getByRole('button',{name:'Fechar'});
  await closeButton.focus();
  await page.keyboard.press('Tab');
  const focusInside = await page.evaluate(() => {
    const dialog = document.querySelector('[role="dialog"]');
    return !!dialog?.contains(document.activeElement);
  });
  assert.equal(focusInside,true,'Tab deve permanecer dentro do modal');
  await page.keyboard.press('Escape');
  await page.getByRole('dialog').waitFor({state:'detached',timeout:5000});
  await page.getByRole('button',{name:/Entrar/}).first().waitFor({state:'visible'});
  await page.waitForFunction(() => document.activeElement?.textContent?.includes('Entrar'));
  console.log('E2E navegador: Escape, foco contido e retorno do foco ao botão de abertura confirmados.');
  await page.getByRole('button',{name:/Entrar/}).first().click();
  await page.locator('#email').fill('ci-front@example.test');
  await page.locator('#senha').fill('SenhaForte123!');
  await page.getByRole('button',{name:/Entrar/}).last().click();
  await page.getByText('Olá, Pessoa!').waitFor({timeout:15000});
  const sessionBeforeNetworkFailure = await page.evaluate(() => sessionStorage.getItem('facilita-token'));
  await page.route('**/v1/facilita/auth/me', route => route.abort('failed'));
  await page.reload({waitUntil:'networkidle'});
  await page.getByRole('alert').getByText(/Não foi possível conectar à API/).waitFor({timeout:15000});
  assert.equal(await page.evaluate(() => sessionStorage.getItem('facilita-token')),sessionBeforeNetworkFailure,'falha transitória não deve revogar token');
  assert.equal(await page.locator('.service-list .service-item').count(),0,'dados privados não carregam sem validação');
  await page.unroute('**/v1/facilita/auth/me');
  await page.getByRole('button',{name:'Tentar novamente'}).click();
  await page.getByText('Olá, Pessoa!').waitFor({timeout:15000});
  const expiredToken = await page.evaluate(() => sessionStorage.getItem('facilita-token'));
  assert.ok(expiredToken);
  const revoked = await fetch('http://127.0.0.1:3000/v1/facilita/auth/logout',{
    method:'POST',headers:{Authorization:'Bearer '+expiredToken}
  });
  assert.equal(revoked.status,200);
  await page.reload({waitUntil:'networkidle'});
  await page.getByRole('button',{name:/Entrar/}).first().waitFor();
  await page.waitForFunction(() => sessionStorage.getItem('facilita-token') === null);
  assert.equal(await page.locator('.service-list .service-item').count(),0,'sessão revogada não deve exibir dados privados');
  assert.equal(await page.locator('.notification').count(),0,'sessão revogada não deve exibir notificações privadas');
  assert.equal(await page.locator('.provider-grid .service-item').count(),0,'sessão revogada não deve exibir atendimentos');
  const rejected = await fetch('http://127.0.0.1:3000/v1/facilita/auth/me',{
    headers:{Authorization:'Bearer '+expiredToken}
  });
  assert.equal(rejected.status,401,'token revogado também deve ser rejeitado diretamente pela API');
  console.log('E2E navegador: token revogado no servidor é rejeitado após recarregar.');






} catch (error) {
  await page.screenshot({ path: 'e2e-failure.png', fullPage: true }).catch(() => {});
  const alerts = await page.getByRole('alert').allTextContents().catch(() => []);
  console.error('Falha E2E. Alertas da interface:', alerts);
  throw error;
} finally {
  await browser.close();
}
