// Screenshots v4 (390x844). Uso: node test/screens4.js [parte]
const { chromium } = require('playwright-core');
const path = require('path'), fs = require('fs');
const OUT = path.join(__dirname, '..', 'screens', 'v4');
const FILE = 'file://' + path.join(__dirname, '..', 'copa-relampago.html');
const ONLY = process.argv[2] || '';
const errors = [];
(async () => {
  const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox'] });
  const mk = async (rm) => {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, locale: 'pt-BR', reducedMotion: rm ? 'reduce' : 'no-preference' });
    const page = await ctx.newPage();
    page.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') errors.push(m.type() + ': ' + m.text()); });
    page.on('pageerror', e => errors.push('pageerror: ' + e.message + ' @ ' + page.url() + '\n' + (e.stack || '').split('\n').slice(0, 4).join(' | ')));
    return page;
  };
  const shot = (page, n, full) => page.screenshot({ path: `${OUT}/${n}.png`, fullPage: !!full });
  const tipOk = async page => { for (let i = 0; i < 3; i++) { const t = await page.$('[data-act=tipok]'); if (!t) break; await t.click(); await page.waitForTimeout(150); } };
  const want = k => !ONLY || ONLY.split(',').includes(k);

  // ---------- perfil populado ----------
  if (want('meta')) {
    const page = await mk();
    await page.goto(FILE); await page.waitForTimeout(800);
    await shot(page, '00-inicio-novidades');
    await page.evaluate(() => {
      const U = window.FFUI, M = U.M, st = U.G.store, y = M.addDays(M.dayKey(), -1);
      st.coachName = 'Professor Patrick';
      for (let i = 0; i < 7; i++) { U.autoRun({ seed: 'DEMO' + i, sel: i % 3 }); }
      st.streak = { cur: 6, best: 9, last: y, badges: {} };
      st.fominhas = 260; st.tips = { coach: 1, hub: 1, decision: 1, reward: 1, nav: 1, desafios: 1, wx: 1 };
      U.saveStore(); U.go('home');
    });
    await page.waitForTimeout(500);
    await shot(page, '01-inicio-sequencia-risco');
    await page.click('[data-act=tab][data-t=desafios]'); await page.waitForTimeout(500);
    await shot(page, '10-desafios-sequencia');
    await page.evaluate(() => document.querySelector('.mis').closest('.panel').scrollIntoView({ block: 'center' })); await page.waitForTimeout(200);
    await shot(page, '11-missoes');
    await page.evaluate(() => document.querySelector('.legend').scrollIntoView({ block: 'center' })); await page.waitForTimeout(200);
    await shot(page, '12-tecnico-lendario-semanal');
    await page.click('[data-act=playDaily]'); await page.waitForTimeout(500);
    await page.click('[data-act=bguess][data-i="2"]'); await page.click('[data-act=bstake][data-s="25"]'); await page.waitForTimeout(200);
    await shot(page, '13-bolao');
    await page.click('[data-act=bgo]'); await page.waitForTimeout(400);
    await page.evaluate(() => { const U = window.FFUI, G = U.G; U.autoRun({ seed: G.pendingSeed, daily: G.pendingDaily, bolao: G.pendingBolao }); });
    await page.waitForTimeout(1600);
    await shot(page, '14-veredito-bolao');
    await page.evaluate(() => document.querySelector('.vbolao') && document.querySelector('.vbolao').scrollIntoView({ block: 'center' })); await page.waitForTimeout(200);
    await shot(page, '14b-veredito-bolao-card');
    await page.evaluate(() => { const p = [...document.querySelectorAll('.panel .ph')].find(x => /Recompensas/.test(x.textContent)); p && p.scrollIntoView({ block: 'start' }); }); await page.waitForTimeout(200);
    await shot(page, '14c-veredito-recompensas');
    await page.evaluate(() => window.FFUI.go('perfil')); await page.waitForTimeout(400);
    await shot(page, '15-perfil-divisoes');
    await page.click('[data-act=buycos][data-id=kit_neon]'); await page.waitForTimeout(300);
    await page.waitForTimeout(1900); await page.evaluate(() => document.querySelector('.cosgrid').closest('.panel').scrollIntoView({ block: 'start' })); await page.waitForTimeout(200);
    await shot(page, '16-cosmeticos-uniformes');
    await page.click('[data-act=costab][data-t=efeito]'); await page.waitForTimeout(200);
    await page.evaluate(() => document.querySelector('.cosgrid').closest('.panel').scrollIntoView({ block: 'start' })); await page.waitForTimeout(200);
    await shot(page, '16b-cosmeticos-efeitos');
    await page.click('[data-act=tab][data-t=album]'); await page.waitForTimeout(400);
    await shot(page, '17-album');
    await page.click('[data-act=apage][data-p=bra2]'); await page.waitForTimeout(300);
    await shot(page, '17b-album-pagina-brasil');
    await page.click('[data-act=tab][data-t=tecnicos]'); await page.waitForTimeout(400);
    await shot(page, '18-galeria-tecnicos');
    // virada de semana
    await page.goto(FILE + '?debug=week:promote'); await page.waitForTimeout(1500);
    await shot(page, '19-divisao-subiu');
    await page.close();
  }

  // ---------- lances épicos em ação ----------
  const epics = (process.env.EPICS || 'bicicleta,olimpico,golaco,goleiro,cobertura,penalti').split(',');
  if (want('epic')) for (const id of epics) {
    const page = await mk();
    const wx = '';
    await page.goto(FILE + `?debug=epic:${id}${wx ? ',wx:' + wx : ''}`); await page.waitForTimeout(500);
    await page.evaluate(() => { const U = window.FFUI; U.G.store.tipsOff = true; U.setupRun({ seed: 'EPICO1' }); U.G.speed = 2; });
    await page.waitForTimeout(300);
    await page.click('[data-act=play]'); await page.waitForTimeout(600);
    // decide rápido se pausar
    const t0 = Date.now(); let got = false;
    while (Date.now() - t0 < 90000) {
      const d = await page.$('[data-act=usecard][data-c=""]'); if (d) await d.click();
      if (await page.$('.epicfx')) { got = true; break; }
      await page.waitForTimeout(120);
    }
    if (!got) { console.log('sem épico', id); await page.close(); continue; }
    await page.waitForTimeout(id === 'penalti' ? 700 : 600);
    await shot(page, `30-epico-${id}-a-camera-lenta`);
    await page.waitForSelector('.epicfx.hit', { timeout: 8000 }); await page.waitForTimeout(650);
    await shot(page, `30-epico-${id}-b-replay`);
    if (id === 'bicicleta') {
      // termina o jogo instantâneo e mostra o card
      await page.evaluate(() => { const U = window.FFUI, G = U.G, E = window.FFEngine; clearTimeout(G.timer); E.simulateRest(G.match, () => null); G.result = E.finishMatch(G.run, G.match); U.go('result'); });
      await page.waitForTimeout(1400);
      await page.evaluate(() => document.querySelector('.epicp').scrollIntoView({ block: 'start' })); await page.waitForTimeout(500);
      await shot(page, '40-card-lance-epico-resultado');
      const png = await page.evaluate(() => window.FFUI.epicPNG({ ...window.FFUI.G.result.epics[0], seed: window.FFUI.G.run.seed }).toDataURL('image/png'));
      fs.writeFileSync(`${OUT}/41-card-lance-epico-export.png`, Buffer.from(png.split(',')[1], 'base64'));
    }
    await page.close();
  }

  // ---------- movimento reduzido ----------
  if (want('rm')) {
    const page = await mk(true);
    await page.goto(FILE + '?debug=epic:golaco'); await page.waitForTimeout(500);
    await page.evaluate(() => { const U = window.FFUI; U.G.store.tipsOff = true; U.setupRun({ seed: 'EPICO1' }); U.G.speed = 2; });
    await page.click('[data-act=play]');
    await page.waitForSelector('.epicfx', { timeout: 60000 }); await page.waitForTimeout(400);
    await shot(page, '34-epico-movimento-reduzido');
    await page.close();
  }

  // ---------- clima ----------
  if (want('wx')) for (const [wx, n] of [['chuva', '21-clima-chuva-campinho'], ['noite', '22-clima-noite-campinho'], ['neblina', '23-clima-neblina-campinho'], ['calor', '24-clima-calor-campinho']]) {
    const page = await mk();
    await page.goto(FILE + `?debug=wx:${wx}`); await page.waitForTimeout(500);
    await page.evaluate(() => { const U = window.FFUI; U.G.store.tipsOff = true; U.setupRun({ seed: 'CLIMA2' }); });
    await page.waitForTimeout(300);
    if (wx === 'chuva') { await page.evaluate(() => document.querySelector('.wxline').scrollIntoView({ block: 'center' })); await page.waitForTimeout(200); await shot(page, '20-hub-clima-chuva'); }
    await page.click('[data-act=play]'); await page.waitForTimeout(1500);
    await page.evaluate(() => window.scrollTo(0, 0)); await page.waitForTimeout(100);
    await shot(page, n);
    await page.close();
  }

  // ---------- duelo ----------
  if (want('duel')) {
    const pa = await mk();
    await pa.goto(FILE); await pa.waitForTimeout(500);
    const link = await pa.evaluate(() => { const U = window.FFUI; U.G.store.coachName = 'Patrick'; U.G.store.tipsOff = true; U.autoRun({ seed: 'DUELO7', sel: 1 }); document.querySelector('[data-act=duelLink]').click(); return new Promise(r => setTimeout(() => r(U.G.lastDuelLink), 300)); });
    const pb = await mk();
    await pb.goto(link); await pb.waitForTimeout(900);
    await shot(pb, '50-duelo-convite');
    await pb.click('[data-act=duelAccept]'); await pb.waitForTimeout(400);
    await pb.evaluate(() => { const U = window.FFUI, G = U.G; G.store.coachName = 'Amigo do Zap'; G.store.tipsOff = true; U.autoRun({ seed: G.pendingSeed, level: G.pendingLevel, duel: G.pendingDuel, sel: 0 }); });
    await pb.waitForTimeout(1200);
    await pb.evaluate(() => document.querySelector('.duel').closest('.panel').scrollIntoView({ block: 'start' })); await pb.waitForTimeout(300);
    await shot(pb, '51-duelo-comparativo');
    const back = await pb.evaluate(() => { document.querySelector('[data-act=duelReturn]').click(); return new Promise(r => setTimeout(() => r(window.FFUI.G.lastDuelLink), 300)); });
    await pa.goto(back); await pa.waitForTimeout(900);
    await shot(pa, '52-duelo-resposta');
    await pa.close(); await pb.close();
  }
  await browser.close();
  console.log(errors.length ? 'ERROS:\n' + errors.join('\n') : 'zero erros de console');
})().catch(e => { console.error(e); process.exit(1); });
