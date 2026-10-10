// Mão, recompensa e carta ampliada. Viewport 390×844.
const { chromium } = require('playwright-core');
const path = require('path');
const fs = require('fs');
const OUT = path.join(__dirname, '..', 'docs', 'screens', 'icons');
const BANNED = ['🟥', '🟦', '🟨', '🟪', '⚡', '🔒', '🌧️', '⭐', '🛡️', '🔄', '🎭', '🚀', '🐟', '🎯', '🚩', '📏', '📣', '👑', '🧤', '🧱', '💰', '🌟', '🐷', '🐰', '🟧', '🃏'];
(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox'] });
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, locale: 'pt-BR' });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto('file://' + path.join(__dirname, '..', 'copa-relampago.html'));
  await page.waitForSelector('#app');

  await page.evaluate(() => {
    window.FFUI.previewCards('momento');
    const G = window.FFUI.G;
    G.run.cardLv = { pressao: 3, chuveirinho: 2 };
    G.hand = ['chuveirinho'];
    window.FFUI.paintDecision();
  });
  await page.waitForSelector('.dcards .cface');
  const hand = await page.evaluate(banned => {
    const faces = [...document.querySelectorAll('.dcards .cface')];
    const text = faces.map(f => f.innerHTML).join('\n');
    return {
      n: faces.length,
      svg: faces.every(f => f.querySelector('.art svg.mk')),
      label: faces.every(f => (f.getAttribute('aria-label') || '').indexOf('nível') >= 0),
      stars: faces.some(f => f.classList.contains('lv3') && f.querySelector('em') && f.querySelector('em').textContent.indexOf('★') >= 0),
      emoji: banned.filter(ch => text.indexOf(ch) >= 0)
    };
  }, BANNED);
  if (hand.n < 4 || !hand.svg || !hand.label || !hand.stars || hand.emoji.length) throw new Error('mão ' + JSON.stringify(hand));
  await page.screenshot({ path: path.join(OUT, 'mao.png') });

  await page.evaluate(() => window.FFUI.previewCards('pacote'));
  await page.waitForSelector('.offer.cardoffer .cface');
  const reward = await page.evaluate(() => document.querySelectorAll('.offer.cardoffer .art svg').length);
  if (reward < 1) throw new Error('recompensa sem ícone');
  await page.screenshot({ path: path.join(OUT, 'recompensa.png') });

  await page.evaluate(() => {
    const G = window.FFUI.G;
    G.shop = window.FFEngine.genShop(G.run);
    G.screen = 'shop';
    window.FFUI.render();
  });
  await page.waitForTimeout(200);
  const shop = await page.evaluate(() => ({
    offers: document.querySelectorAll('.offer').length,
    marks: document.querySelectorAll('.offer .mk, .offer .tmark').length
  }));
  if (!shop.offers) throw new Error('loja vazia');
  await page.screenshot({ path: path.join(OUT, 'loja.png') });

  await page.evaluate(() => window.FFUI.previewCards('info'));
  await page.waitForSelector('.modal .cface');
  const zoom = await page.evaluate(() => {
    const face = document.querySelector('.modal .cface');
    const art = face.querySelector('.art');
    const box = art.getBoundingClientRect();
    return {
      label: face.getAttribute('aria-label'),
      w: Math.round(box.width),
      svg: !!art.querySelector('svg')
    };
  });
  if (!zoom.svg || zoom.w < 70 || (zoom.label || '').indexOf('Craque') < 0) throw new Error('ampliada ' + JSON.stringify(zoom));
  await page.screenshot({ path: path.join(OUT, 'ampliada.png') });

  if (errors.length) throw new Error(errors.join('\n'));
  await browser.close();
  console.log('icon screens ok', shop);
})().catch(err => { console.error(err); process.exit(1); });
