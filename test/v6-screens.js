// Telas da atualização de arte, relato e pênaltis. Viewport 390×844.
const { chromium } = require('playwright-core');
const path = require('path');
const fs = require('fs');
const OUT = path.join(__dirname, '..', 'docs', 'screens', 'v6');
(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox'] });
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, locale: 'pt-BR' });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto('file://' + path.join(__dirname, '..', 'copa-relampago.html'));
  await page.waitForTimeout(300);

  await page.evaluate(() => window.FFUI.previewCareer('criar'));
  await page.waitForTimeout(150);
  const before = await page.evaluate(() => document.getElementById('app').className);
  for (let i = 0; i < 4; i++) await page.click('[data-act=carPlus][data-a=atk]');
  const draft = await page.evaluate(() => ({
    cls: document.getElementById('app').className,
    n: document.querySelector('[data-a=atk]').parentElement.querySelector('b').textContent,
    left: document.querySelector('.topbar .chip:last-child').textContent
  }));
  if (draft.n !== '64' || draft.left.indexOf('14') < 0) throw new Error('pontos não atualizaram ' + JSON.stringify(draft));
  if (draft.cls !== before) throw new Error('a tela de criação reanimou: ' + before + ' -> ' + draft.cls);
  await page.screenshot({ path: path.join(OUT, 'criar.png') });

  await page.evaluate(() => window.FFUI.previewCareer('propostas'));
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(OUT, 'propostas.png') });
  await page.click('[data-act=carAccept]');
  await page.waitForTimeout(250);
  const afterAccept = await page.evaluate(() => window.FFUI.G.screen);
  if (afterAccept === 'carInbox') throw new Error('aceitar ficou na caixa');
  await page.screenshot({ path: path.join(OUT, 'aceitar.png') });

  await page.evaluate(() => window.FFUI.previewCareer('relato'));
  await page.waitForTimeout(200);
  const report = await page.evaluate(() => ({
    score: !!document.querySelector('.rscore'),
    goals: document.querySelectorAll('.gl').length,
    motm: !!document.querySelector('.motm')
  }));
  if (!report.score || !report.motm) throw new Error('relato incompleto ' + JSON.stringify(report));
  await page.screenshot({ path: path.join(OUT, 'relato.png') });

  await page.evaluate(() => window.FFUI.previewCareer('tabela'));
  await page.waitForTimeout(150);
  const badges = await page.evaluate(() => document.querySelectorAll('.ctr svg.badge').length);
  if (badges < 18) throw new Error('tabela sem escudos ' + badges);
  await page.screenshot({ path: path.join(OUT, 'tabela.png') });

  for (const ev of ['lesao', 'protesto', 'joia']) {
    await page.evaluate(w => window.FFUI.previewCareer(w), ev);
    await page.waitForTimeout(150);
    const fit = await page.evaluate(() => {
      const art = document.querySelector('.evart');
      const opts = [...document.querySelectorAll('.optbig')];
      return {
        art: !!(art && art.getBoundingClientRect().height > 40),
        opts: opts.length === 3 && opts.every(b => b.getBoundingClientRect().bottom < window.innerHeight - 2)
      };
    });
    if (!fit.art || !fit.opts) throw new Error(ev + ' não cabe ' + JSON.stringify(fit));
    await page.screenshot({ path: path.join(OUT, 'evento-' + ev + '.png') });
  }

  await page.evaluate(() => window.FFUI.previewCareer('jogo'));
  await page.waitForTimeout(250);
  await page.evaluate(() => { document.querySelectorAll('.sheet,.tip').forEach(x => x.remove()); const p = document.getElementById('pitch'); if (p) p.scrollIntoView({ block: 'center' }); });
  await page.waitForTimeout(200);
  const pitch = await page.evaluate(() => ({
    stadium: !!document.querySelector('.stadium'),
    toks: document.querySelectorAll('#pitch .tok').length,
    badge: !!document.querySelector('.sb svg.badge')
  }));
  if (!pitch.stadium || pitch.toks < 10) throw new Error('campo ' + JSON.stringify(pitch));
  await page.screenshot({ path: path.join(OUT, 'jogo.png') });

  await page.evaluate(() => window.FFUI.previewCareer('penaltis'));
  await page.waitForTimeout(200);
  const pen = await page.evaluate(() => ({
    who: (document.querySelector('.penwho b') || {}).textContent || '',
    dots: (document.querySelector('.pendots') || {}).textContent || ''
  }));
  if (!pen.who || pen.dots.indexOf('●') < 0) throw new Error('pênaltis ' + JSON.stringify(pen));
  await page.screenshot({ path: path.join(OUT, 'penaltis.png') });

  for (const which of ['overlay', 'epic2']) {
    await page.evaluate(w => window.FFUI.previewCareer(w), which);
    await page.waitForSelector('.tapgo', { timeout: 8000 });
    const label = await page.evaluate(() => (document.querySelector('.tapgo') || {}).textContent || '');
    if (label.indexOf('Toque para continuar') < 0) throw new Error('sem toque ' + which);
    await page.screenshot({ path: path.join(OUT, which === 'overlay' ? 'overlay.png' : 'epico-cobertura.png') });
    await page.click('.tapgo');
    await page.waitForTimeout(200);
    const gone = await page.evaluate(() => !document.querySelector('.epicfx'));
    if (!gone) throw new Error('overlay não saiu');
  }

  if (errors.length) throw new Error(errors.join('\n'));
  await browser.close();
  console.log('v6 screens ok');
})().catch(e => { console.error(e); process.exit(1); });
