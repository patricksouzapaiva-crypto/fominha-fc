// Teste headless do Modo Duelo: abre o link com parâmetros (#duelo=...), joga a mesma Copa,
// confere o comparativo e devolve o desafio. Uso: node test/duel.e2e.js
const { chromium } = require('playwright-core');
const assert = require('assert'), path = require('path');
const M = require('../src/meta.js'), E = require('../src/engine.js');
const FILE = 'file://' + path.join(__dirname, '..', 'copa-relampago.html');
(async () => {
  const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox'] });
  const errors = [];
  const mk = async () => { const p = await (await browser.newContext({ viewport: { width: 390, height: 844 } })).newPage(); p.on('pageerror', e => errors.push(e.message)); p.on('console', m => { if (m.type() === 'error') errors.push(m.text()); }); return p; };
  // 1) desafiante: link montado no Node (mesmo formato do jogo)
  const d = { v: 1, s: 'DUELOX', l: 2, a: { n: 'Patrick', sel: 'bra82', p: 1234, r: 3, gf: 18, ga: 7, h: [[0, 3, 1], [1, 2, 2], [2, 4, 0], [3, 2, 1], [4, 1, 1, 5, 4], [5, 0, 2]] } };
  const url = FILE + '#duelo=' + M.duelEncode(d);
  const b = await mk();
  await b.goto(url); await b.waitForTimeout(700);
  const inv = await b.textContent('#app');
  assert(/Você foi desafiado/.test(inv) && /PATRICK|Patrick/.test(inv) && /1\.234/.test(inv) && /DUELOX/.test(inv), 'tela de convite');
  await b.click('[data-act=duelAccept]'); await b.waitForTimeout(400);
  const st = await b.evaluate(() => ({ seed: FFUI.G.pendingSeed, lv: FFUI.G.pendingLevel, duel: !!FFUI.G.pendingDuel, scr: FFUI.G.screen, hash: location.hash }));
  assert.deepStrictEqual([st.seed, st.lv, st.duel, st.scr, st.hash], ['DUELOX', 2, true, 'selecao', ''], 'aceitar leva pra seleção com a mesma semente e nível');
  // escolhe a seleção pela UI e joga o resto em modo rápido
  await b.click('.selcard >> nth=0'); await b.waitForTimeout(300);
  const opp = await b.evaluate(() => FFUI.G.run.opponents.map(o => o.nome));
  const ref = E.newRun('DUELOX', 2, E.selecaoChoices('DUELOX')[0]).opponents.map(o => o.nome);
  assert.deepStrictEqual(opp, ref, 'mesmos rivais da Copa do desafiante');
  await b.evaluate(() => { const G = FFUI.G; G.store.coachName = 'Amigo'; FFUI.autoRun({ seed: G.run.seed, level: G.run.level, duel: G.run.duel }); });
  await b.waitForTimeout(500);
  const ver = await b.evaluate(() => ({ duel: !!document.querySelector('.duel'), rows: document.querySelectorAll('.duel .dr').length, win: (document.querySelector('.dwin') || {}).textContent, me: FFUI.G.verdict.points, w: FFUI.G.metaRes.duel.w, hist: FFUI.G.store.duels.length }));
  assert(ver.duel && ver.rows === 7 && ver.hist === 1, 'comparativo rodada a rodada no veredito');
  const expectW = ver.me > 1234 ? 0 : ver.me < 1234 ? 1 : ver.w;
  assert.strictEqual(ver.w, expectW, 'vencedor correto');
  assert(ver.win.includes(ver.w === 0 ? 'Amigo' : ver.w === 1 ? 'Patrick' : 'Empate'), 'texto do vencedor');
  // 2) devolve o desafio
  await b.click('[data-act=duelReturn]'); await b.waitForTimeout(300);
  const back = await b.evaluate(() => FFUI.G.lastDuelLink);
  const bd = M.duelDecode(back.split('#duelo=')[1]);
  assert(bd && bd.a.n === 'Amigo' && bd.b.n === 'Patrick' && bd.b.p === 1234 && bd.a.p === ver.me, 'link de volta carrega os dois resultados');
  const a = await mk();
  await a.goto(FILE); await a.waitForTimeout(400);
  await a.goto(FILE + '#duelo=' + back.split('#duelo=')[1]); await a.waitForTimeout(500); // troca só o hash (sem recarregar)
  const res = await a.textContent('#app');
  assert(/Resultado do duelo/.test(res) && /Amigo/.test(res) && /Patrick/.test(res), 'resposta abre o comparativo');
  // 3) link quebrado não quebra o jogo
  const c = await mk(); await c.goto(FILE + '#duelo=bananas!!'); await c.waitForTimeout(500);
  assert.strictEqual(await c.evaluate(() => FFUI.G.screen), 'home');
  await browser.close();
  assert.deepStrictEqual(errors, [], 'erros de console: ' + errors.join(' | '));
  console.log(`duelo e2e: OK (amigo fez ${ver.me} x 1234 · vencedor: ${ver.win.trim()})`);
})().catch(e => { console.error(e); process.exit(1); });
