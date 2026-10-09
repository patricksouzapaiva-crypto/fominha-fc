// Screenshots do duelo ao vivo, viewport de celular. node test/duel-screens.js
const { chromium } = require('playwright-core');
const path = require('path'), fs = require('fs');
const OUT = path.join(__dirname, '..', 'docs', 'screens', 'duel');
const FILE = 'file://' + path.join(__dirname, '..', 'copa-relampago.html');
const shots = [
  ['start', '01-chave.png'],
  ['ko', '02-mata-mata.png'],
  ['wait', '03-espera.png'],
  ['final', '04-final.png'],
  ['out', '05-caiu.png']
];
(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox'] });
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, locale: 'pt-BR' });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  await page.goto(FILE);
  await page.waitForTimeout(400);
  for (const [which, file] of shots) {
    await page.evaluate(w => FFUI.previewDuel(w), which);
    await page.waitForTimeout(which === 'final' ? 500 : 250);
    if (which === 'final') {
      const sheet = await page.$('#decision');
      if (!sheet) throw new Error('folha de carta ausente');
    }
    if (which === 'out') {
      const t = await page.textContent('#app');
      if (!/Seu amigo te esperou na final/.test(t) || !/Tentar de novo/.test(t)) throw new Error('texto da eliminação: ' + t.slice(0, 240));
    }
    if (which === 'start' || which === 'ko') {
      const t = await page.textContent('#app');
      if (!/só se encontram na final/.test(t) || !/Grupo A/.test(t) || !/Grupo E/.test(t)) throw new Error('chave incompleta');
    }
    await page.screenshot({ path: path.join(OUT, file) });
    console.log(file);
  }
  await browser.close();
  if (errors.length) { console.error(errors.join('\n')); process.exit(1); }
  console.log('screens ok', OUT);
})().catch(e => { console.error(e); process.exit(1); });
