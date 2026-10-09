// Mede a duração real de uma partida no 1x (guardando as cartas nas pausas) e checa se o campinho se mexe.
const { chromium } = require('playwright-core');
const path = require('path');
(async () => {
  const b = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox'] });
  const p = await (await b.newContext({ viewport: { width: 390, height: 844 } })).newPage();
  const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('file://' + path.join(__dirname, '..', 'copa-relampago.html'));
  await p.evaluate((sp) => { const E = window.FFEngine, U = window.FFUI; U.G.run = E.newRun(process_seed(), 1, 'bra82', E.flatCoach(3, 'Prof')); U.G.speed = sp; U.G.match = E.createMatch(U.G.run); U.go('match'); function process_seed() { return 'RITMO' + Math.floor(Math.random() * 1000); } }, +(process.env.SPEED || 1));
  const t0 = Date.now(); let lines = 0, moved = 0;
  let prev = await p.$$eval('.tok', els => els.map(e => e.style.transform));
  while (true) {
    const scr = await p.evaluate(() => window.FFUI.G.screen);
    if (scr !== 'match') break;
    if (await p.$('#decision')) await p.click('#decision [data-c=""]');
    const cur = await p.$$eval('.tok', els => els.map(e => e.style.transform));
    moved += cur.filter((t, i) => t !== prev[i]).length; prev = cur;
    await p.waitForTimeout(250);
  }
  console.log(JSON.stringify({ speed: +(process.env.SPEED || 1), seconds: ((Date.now() - t0) / 1000).toFixed(1), tokenMovesPerSample: (moved / ((Date.now() - t0) / 250)).toFixed(1) + '/14', errors: errs }));
  await b.close();
})();
