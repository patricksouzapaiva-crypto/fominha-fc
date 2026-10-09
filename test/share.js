// Testa a exportação do card de veredito em PNG (rota de download quando não há Web Share).
const { chromium } = require('playwright-core');
const path = require('path');
(async () => {
  const b = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox'] });
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, acceptDownloads: true });
  const p = await ctx.newPage(); const errs = [];
  p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('file://' + path.join(__dirname, '..', 'copa-relampago.html'));
  // monta uma run encerrada rapidamente pela API do motor e abre o veredito
  await p.evaluate(() => {
    const E = window.FFEngine, U = window.FFUI;
    const d = E.coachDraftNew('CAMPEAO'); while (!d.done) E.draftPick(d, E.COACH_ATTR_IDS.find(a => !d.slots[a]));
    const run = E.newRun('CAMPEAO', 1, 'bra82', E.makeCoach('Professor Patrick', d.slots)); run.relics = ['cabeca_ouro', 'luva_ofensiva', 'juiz_ladrao'];
    let g = 0; while (run.status === 'playing' && g++ < 10) { const m = E.createMatch(run); E.simulateRest(m, mm => E.playableCards(mm)[0]); E.finishMatch(run, m); }
    U.G.run = run; U.G.verdict = E.verdict(run); U.go('verdict');
  });
  const [dl] = await Promise.all([p.waitForEvent('download'), p.click('[data-act=share]')]);
  await dl.saveAs(path.join(__dirname, '..', 'screens', 'v3', '13b-card-download.png'));
  console.log('download:', dl.suggestedFilename(), 'erros:', errs.length ? errs : 'nenhum');
  await b.close();
})();
