// Abre o HTML no Chrome headless (viewport de celular), joga e tira screenshots.
const { chromium } = require('playwright-core');
const path = require('path');
const OUT = path.join(__dirname, '..', 'screens');
(async () => {
  const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox'] });
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, locale: 'pt-BR' });
  const page = await ctx.newPage();
  const errors = [];
  page.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') errors.push(m.type() + ': ' + m.text()); });
  page.on('pageerror', e => errors.push('pageerror: ' + e.message));
  await page.goto('file://' + path.join(__dirname, '..', 'copa-relampago.html'));
  await page.waitForTimeout(800);
  await page.screenshot({ path: OUT + '/01-inicio.png' });
  await page.fill('#seedIn', process.env.SEED || 'PATRICK');
  await page.click('[data-act=start]');
  await page.waitForTimeout(400);
  await page.screenshot({ path: OUT + '/02-selecao.png' });
  await page.click('.selcard >> nth=0');
  await page.waitForTimeout(2200);
  // ---- Monte seu Técnico
  await page.fill('#coachName', 'Professor Patrick');
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: OUT + '/03a-tecnico-sorteio.png' });
  let draws = 0;
  while (await page.$('[data-act=cpick]') && draws++ < 12) {
    // pega a maior nota livre; re-sorteia uma vez se a melhor for fraca
    const best = await page.evaluate(() => {
      const G = window.FFUI.G, E = window.FFEngine, d = G.draft, c = E.COACH_BY_ID[d.current];
      const free = E.COACH_ATTR_IDS.filter(a => !d.slots[a]);
      const b = free.reduce((x, a) => c.s[a] > c.s[x] ? a : x, free[0]);
      return { a: b, s: c.s[b], rolls: d.rolls };
    });
    if (best.s < 85 && best.rolls > 0) { await page.click('[data-act=creroll]'); await page.waitForTimeout(450); continue; }
    await page.click(`[data-act=cpick][data-a=${best.a}]`);
    await page.waitForTimeout(450);
    if (draws === 3) await page.screenshot({ path: OUT + '/03b-tecnico-montando.png' });
  }
  await page.waitForTimeout(700);
  await page.screenshot({ path: OUT + '/03c-tecnico-pronto.png', fullPage: true });
  await page.click('[data-act=cdone]');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: OUT + '/03-hub.png' });
  let shotDecision = false, shotReward = false, shotShop = false, matches = 0, shotGoal = false, shotFeed = false;
  let t0 = 0, firstMatchMs = 0;
  for (let guard = 0; guard < 8000; guard++) {
    const scr = await page.evaluate(() => window.FFUI.G.screen);
    if (scr === 'hub') { await page.click('[data-act=play]'); matches++; t0 = Date.now(); await page.evaluate(n => { window.FFUI.G.speed = n === 1 ? 1 : 3; }, matches); continue; }
    if (scr === 'match') {
      const dec = await page.$('#decision');
      if (dec) {
        if (!shotDecision) { await page.waitForTimeout(700); await page.screenshot({ path: OUT + '/04-partida-carta.png' }); shotDecision = true; }
        const c = await page.$('#decision [data-act=usecard][data-c]:not([data-c=""])');
        if (c) await c.click(); else await page.click('#decision [data-c=""]');
        continue;
      }
      if (!shotFeed && matches === 1) {
        const n = await page.$$eval('#feed .fe', els => els.length);
        if (n >= 9 && !(await page.$('.goalfx'))) { await page.screenshot({ path: OUT + '/04a-partida-feed.png' }); shotFeed = true; }
      }
      if (!shotGoal && matches >= 2 && await page.$('.goalfx:not(.rival)')) { await page.screenshot({ path: OUT + '/04b-gol.png' }); shotGoal = true; }
      await page.waitForTimeout(150); continue;
    }
    if (scr === 'result') {
      if (matches === 1 && !firstMatchMs) firstMatchMs = Date.now() - t0;
      if (matches === 1) await page.screenshot({ path: OUT + '/05-resultado.png', fullPage: true });
      await page.click('[data-act=afterResult]'); continue;
    }
    if (scr === 'reward') {
      await page.waitForTimeout(600);
      if (!shotReward) { await page.screenshot({ path: OUT + '/06-recompensas.png' }); shotReward = true; }
      const nOff = await page.$$eval('.offer', els => els.length); await page.click(`.offer >> nth=${[2, 0, 2, 1, 2, 0][matches % 6] % nOff}`);
      await page.waitForTimeout(200);
      const opt = await page.$('.modal .opt'); if (opt) await opt.click();
      continue;
    }
    if (scr === 'shop') {
      await page.waitForTimeout(500);
      if (!shotShop) { await page.screenshot({ path: OUT + '/07-vestiario.png' }); shotShop = true; }
      await page.click('[data-act=leaveShop]'); continue;
    }
    if (scr === 'verdict') { await page.waitForTimeout(900); await page.screenshot({ path: OUT + '/08-veredito.png' }); await page.screenshot({ path: OUT + '/08b-veredito-completo.png', fullPage: true }); break; }
    await page.waitForTimeout(200);
  }
  const st = await page.evaluate(() => ({ status: window.FFUI.G.run.status, hist: window.FFUI.G.run.history, coach: window.FFUI.G.run.coach }));
  await page.click('[data-act=home]'); await page.waitForTimeout(300);
  await page.screenshot({ path: OUT + '/09-inicio-com-recorde.png' });
  console.log(JSON.stringify({ matches, firstMatch1xSeconds: (firstMatchMs / 1000).toFixed(1), shotDecision, shotFeed, shotReward, shotShop, shotGoal, status: st.status, hist: st.hist.map(h => `${h.stage}:${h.gf}-${h.ga}${h.outcome}`), coach: st.coach.nome + ' ' + Object.entries(st.coach.slots).map(([a, s]) => a + s.rating + '(' + s.from + ')').join(' ') }));
  console.log('ERROS DE CONSOLE:', errors.length ? errors : 'nenhum');
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
