const { chromium } = require('playwright-core'); const path = require('path');
const FILE = 'file://' + path.join(__dirname, '..', 'copa-relampago.html');
(async () => {
  const b = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox'] });
  const p = await (await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 })).newPage();
  const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto(FILE); await p.waitForTimeout(400);
  await p.evaluate(() => { FFUI.G.store.tipsOff = true; FFUI.setupRun({ seed: 'L4SR6F', legend: 'ita82', stage: 6 }); });
  await p.waitForTimeout(400);
  await p.screenshot({ path: path.join(__dirname, '..', 'screens', 'v4', '25-final-tecnico-lendario-hub.png') });
  await p.click('[data-act=play]'); await p.waitForTimeout(2500);
  await p.screenshot({ path: path.join(__dirname, '..', 'screens', 'v4', '26-final-tecnico-lendario-partida.png') });
  const r = await p.evaluate(() => { FFUI.autoRun({ seed: 'L4SR6F', legend: 'ita82' }); return { lenda: FFUI.G.store.lenda, opp: FFUI.G.run.history.map(h => h.opp).pop(), st: FFUI.G.run.status }; });
  console.log(JSON.stringify(r), errs);
  await b.close();
})();
