// Telas dos lances épicos ilustrados. Viewport 390×844.
const { chromium } = require('playwright-core');
const path = require('path');
const fs = require('fs');
const OUT = path.join(__dirname, '..', 'docs', 'screens', 'v7');
(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox'] });
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, locale: 'pt-BR' });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto('file://' + path.join(__dirname, '..', 'copa-relampago.html'));
  await page.waitForTimeout(300);

  for (const id of ['bicicleta', 'olimpico', 'virada']) {
    await page.evaluate(w => window.FFUI.previewCareer(w), 'epico-' + id);
    await page.waitForFunction(() => {
      const img = document.querySelector('.epicfx .eart');
      const box = document.querySelector('.epicfx.hold');
      return img && img.complete && img.naturalWidth > 0 && box && box.querySelector('.tapgo') && box.querySelector('.en');
    }, { timeout: 8000 });
    const scene = await page.evaluate(() => {
      const img = document.querySelector('.epicfx .eart');
      const r = img.getBoundingClientRect();
      return {
        art: !!document.querySelector('.escene.art'),
        w: Math.round(r.width),
        h: Math.round(r.height),
        title: document.querySelector('.en').textContent,
        tap: document.querySelector('.tapgo').textContent
      };
    });
    if (!scene.art || scene.h < 120 || scene.tap.indexOf('Toque') < 0) throw new Error(id + ' ' + JSON.stringify(scene));
    await page.screenshot({ path: path.join(OUT, id + '.png') });
  }

  await page.evaluate(() => window.FFUI.previewCareer('epiccard'));
  await page.waitForFunction(() => document.querySelector('canvas.ecv') && document.querySelector('canvas.ecv').dataset.ready === 'art', { timeout: 8000 });
  await page.waitForTimeout(400);
  const card = await page.evaluate(() => {
    const c = document.querySelector('canvas.ecv');
    const r = c.getBoundingClientRect();
    return { w: Math.round(r.width), h: Math.round(r.height), ready: c.dataset.ready };
  });
  if (card.ready !== 'art' || card.w < 300) throw new Error('card ' + JSON.stringify(card));
  await page.screenshot({ path: path.join(OUT, 'card.png') });

  await page.evaluate(() => window.FFUI.previewCareer('epico-bicicleta'));
  await page.waitForFunction(() => document.querySelector('.epicfx .eart'));
  await page.evaluate(() => { document.querySelector('.epicfx .eart').src = 'assets/epic/nao-existe.webp'; });
  await page.waitForFunction(() => !!document.querySelector('.epicfx .escene svg'), { timeout: 4000 });

  const ctx2 = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true, locale: 'pt-BR', reducedMotion: 'reduce' });
  const page2 = await ctx2.newPage();
  await page2.goto('file://' + path.join(__dirname, '..', 'copa-relampago.html'));
  await page2.evaluate(() => window.FFUI.previewCareer('epico-olimpico'));
  await page2.waitForFunction(() => {
    const img = document.querySelector('.epicfx .eart');
    return img && img.complete && img.naturalWidth > 0;
  });
  const motion = await page2.evaluate(() => {
    const img = document.querySelector('.eart');
    const cs = getComputedStyle(img);
    return { anim: cs.animationName, transform: cs.transform };
  });
  if (motion.anim !== 'none') throw new Error('reduced motion ainda anima ' + JSON.stringify(motion));

  if (errors.length) throw new Error(errors.join('\n'));
  await browser.close();
  console.log('v7 screens ok');
})().catch(err => { console.error(err); process.exit(1); });
