// Screenshots das cartas, viewport de celular. node test/card-screens.js
const { chromium } = require('playwright-core');
const path = require('path'), fs = require('fs');
const OUT = path.join(__dirname, '..', 'docs', 'screens', 'cards');
const FILE = 'file://' + path.join(__dirname, '..', 'copa-relampago.html');
const shots = [
  ['momento', '01-momento.png'],
  ['golpe', '02-contra-golpe.png'],
  ['combo', '03-combo.png'],
  ['info', '04-info.png'],
  ['pacote', '05-pacote.png'],
  ['nivel', '06-nivel.png']
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
  await page.waitForTimeout(300);
  for (const [which, file] of shots) {
    await page.evaluate(w => FFUI.previewCards(w), which);
    await page.waitForTimeout(350);
    const t = await page.evaluate(() => document.body.innerText);
    if (which === 'momento' && !/Energia|Chuveirinho|Melhor quando/.test(t)) throw new Error('momento sem energia ou carta: ' + t.slice(0, 180));
    if (which === 'golpe' && !/CONTRA-GOLPE/.test(t)) throw new Error('sem contra-golpe');
    if (which === 'combo' && !/COMBO|Blitz/.test(t)) throw new Error('sem combo');
    if (which === 'info' && !/Melhor quando/.test(t)) throw new Error('modal sem dica');
    if (which === 'pacote' && !/Pressão Alta|Craque Decide/.test(t)) throw new Error('pacote sem carta nova');
    if (which === 'nivel' && !/Nv3|★★★/.test(t)) throw new Error('carta sem nível 3');
    await page.screenshot({ path: path.join(OUT, file) });
    console.log(file);
  }
  await browser.close();
  if (errors.length) { console.error(errors.join('\n')); process.exit(1); }
  console.log('screens ok', OUT);
})().catch(e => { console.error(e); process.exit(1); });