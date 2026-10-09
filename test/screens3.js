// Screenshots v3 (celular 390x844 + desktop 1280x800). Uso: node test/screens3.js
const { chromium } = require('playwright-core');
const path = require('path'), fs = require('fs');
const OUT = path.join(__dirname, '..', 'screens', 'v3');
const FILE = 'file://' + path.join(__dirname, '..', 'copa-relampago.html');
(async () => {
  const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox'] });
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, locale: 'pt-BR' });
  const page = await ctx.newPage();
  const errors = [];
  page.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') errors.push(m.type() + ': ' + m.text()); });
  page.on('pageerror', e => errors.push('pageerror: ' + e.message));
  const shot = (n, full) => page.screenshot({ path: `${OUT}/${n}.png`, fullPage: !!full });
  const tipOk = async () => { const t = await page.$('[data-act=tipok]'); if (t) { await t.click(); await page.waitForTimeout(150); } };
  await page.goto(FILE); await page.waitForTimeout(900);
  await shot('01-inicio');
  await page.click('[data-act=daily]'); await page.waitForTimeout(500);
  await shot('02-desafio-do-dia');
  await page.click('[data-act=home]'); await page.waitForTimeout(300);
  await page.fill('#seedIn', process.env.SEED || 'PATRICK');
  await page.click('[data-act=start]'); await page.waitForTimeout(500);
  await shot('03-selecao');
  await page.click('.selcard >> nth=0'); await page.waitForTimeout(350);
  await shot('04a-tecnico-roleta');
  await page.waitForTimeout(1200);
  await page.fill('#coachName', 'Professor Patrick');
  await shot('04b-tecnico-sorteio-dica');
  await tipOk(); await page.evaluate(() => window.scrollTo(0, 0));
  await shot('04c-tecnico-sorteio');
  let draws = 0;
  while (await page.$('[data-act=cpick]') && draws++ < 14) {
    const best = await page.evaluate(() => {
      const G = window.FFUI.G, E = window.FFEngine, d = G.draft, c = E.COACH_BY_ID[d.current];
      const free = E.COACH_ATTR_IDS.filter(a => !d.slots[a]);
      const b = free.reduce((x, a) => c.s[a] > c.s[x] ? a : x, free[0]);
      return { a: b, s: c.s[b], rolls: d.rolls };
    });
    if (best.s < 85 && best.rolls > 0) { await page.click('[data-act=creroll]'); await page.waitForTimeout(1300); continue; }
    await page.click(`[data-act=cpick][data-a=${best.a}]`); await page.waitForTimeout(1300);
  }
  await page.waitForTimeout(600);
  await shot('04d-tecnico-pronto', true);
  await page.click('[data-act=cdone]'); await page.waitForTimeout(900);
  await shot('05a-hub-dica');
  await tipOk();
  await shot('05b-hub');
  await shot('05c-hub-completo', true);
  // info de carta (toque)
  await page.click('.item.card >> nth=0'); await page.waitForTimeout(400);
  await shot('05d-info-carta'); await page.click('.modal [data-x]'); await page.waitForTimeout(200);
  let matches = 0, shotDec = false, shotFeed = false, shotGoal = false, shotRes = false, shotPack = false, shotShop = false, t0 = 0, firstMs = 0;
  for (let guard = 0; guard < 9000; guard++) {
    const scr = await page.evaluate(() => window.FFUI.G.screen);
    if (scr === 'hub') { await tipOk(); await page.click('[data-act=play]'); matches++; t0 = Date.now(); await page.evaluate(n => { window.FFUI.G.speed = n === 1 ? 1 : 3; }, matches); continue; }
    if (scr === 'match') {
      if (await page.$('.tip')) { await page.waitForTimeout(500); await tipOk(); }
      const dec = await page.$('#decision');
      if (dec) {
        if (!shotDec) { await page.waitForTimeout(800); await shot('07-partida-carta'); shotDec = true; }
        const c = await page.$('#decision [data-act=usecard][data-c]:not([data-c=""])');
        if (c) await c.click(); else await page.click('#decision [data-c=""]');
        continue;
      }
      if (!shotFeed && matches === 1) {
        const n = await page.$$eval('#feed .fe', els => els.length);
        if (n >= 12 && !(await page.$('.goalfx'))) { await shot('06-partida-feed'); shotFeed = true; }
      }
      if (!shotGoal && await page.$('.goalfx:not(.rival)')) { await page.waitForTimeout(250); await shot('08-gol'); shotGoal = true; }
      await page.waitForTimeout(120); continue;
    }
    if (scr === 'result') {
      if (matches === 1 && !firstMs) firstMs = Date.now() - t0;
      await page.waitForTimeout(300);
      if (!shotRes) { await shot('09-resultado'); await shot('09b-resultado-completo', true); shotRes = true; }
      await page.click('[data-act=afterResult]'); continue;
    }
    if (scr === 'reward') {
      await page.waitForTimeout(400);
      if (await page.$('.pack')) {
        if (!shotPack) { await shot('10a-pacote-dica'); await tipOk(); await shot('10b-pacote'); }
        await tipOk(); await page.click('.pack', { force: true }); await page.waitForTimeout(1500);
        if (!shotPack) { await shot('10c-recompensa-revelada'); shotPack = true; }
      }
      const nOff = await page.$$eval('.offer', els => els.length);
      await page.click(`.offer >> nth=${[2, 0, 2, 1, 2, 0][matches % 6] % nOff}`); await page.waitForTimeout(250);
      const opt = await page.$('.modal .opt'); if (opt) { if (matches === 2) await shot('10d-escolher-quem-sai'); await opt.click(); }
      continue;
    }
    if (scr === 'shop') {
      await page.waitForTimeout(400);
      if (!shotShop) { await shot('11-vestiario'); shotShop = true; }
      await page.click('[data-act=leaveShop]'); continue;
    }
    if (scr === 'verdict') { await page.waitForTimeout(1800); await shot('12-veredito'); await shot('12b-veredito-completo', true); break; }
    await page.waitForTimeout(150);
  }
  // card compartilhável (canvas)
  const data = await page.evaluate(() => window.FFUI.drawCard(window.FFUI.G.verdict).toDataURL('image/png'));
  fs.writeFileSync(`${OUT}/13-card-compartilhavel.png`, Buffer.from(data.split(',')[1], 'base64'));
  const st = await page.evaluate(() => ({ status: window.FFUI.G.run.status, hist: window.FFUI.G.run.history, pts: window.FFUI.G.points, coach: window.FFUI.G.run.coach }));
  await page.click('[data-act=home]'); await page.waitForTimeout(400);
  await shot('14-inicio-com-ranking');
  // desafio do dia jogado: só a tela do desafio com a semente do dia
  // desktop
  const dctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1, locale: 'pt-BR' });
  const dp = await dctx.newPage();
  dp.on('pageerror', e => errors.push('desktop pageerror: ' + e.message));
  dp.on('console', m => { if (m.type() === 'error') errors.push('desktop: ' + m.text()); });
  await dp.goto(FILE); await dp.evaluate(() => { window.__noTips = true; }); await dp.waitForTimeout(400);
  await dp.fill('#seedIn', 'PATRICK'); await dp.click('[data-act=start]'); await dp.waitForTimeout(300);
  await dp.click('.selcard >> nth=0'); await dp.waitForTimeout(1300);
  while (await dp.$('[data-act=cpick]')) { await dp.click('[data-act=cpick] >> nth=0'); await dp.waitForTimeout(1200); }
  await dp.click('[data-act=cdone]'); await dp.waitForTimeout(400);
  await dp.click('[data-act=play]'); await dp.waitForTimeout(16000);
  if (await dp.$('#decision')) { await dp.screenshot({ path: `${OUT}/15-desktop-partida-carta.png` }); await dp.click('#decision [data-c=""]'); await dp.waitForTimeout(4000); }
  await dp.screenshot({ path: `${OUT}/15-desktop-partida.png` });
  console.log(JSON.stringify({ matches, firstMatch1xSeconds: (firstMs / 1000).toFixed(1), shotDec, shotFeed, shotGoal, shotPack, shotShop, status: st.status, pts: st.pts && st.pts.total, hist: st.hist.map(h => `${h.stage}:${h.gf}-${h.ga}${h.outcome}`), coach: st.coach.nome + ' ' + Object.entries(st.coach.slots).map(([a, s]) => a + s.rating + '(' + s.from + ')').join(' ') }));
  console.log('ERROS DE CONSOLE:', errors.length ? errors : 'nenhum');
  await browser.close();
})();
