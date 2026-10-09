// Lances épicos, clima e chefe lendário: frequências e determinismo.
const { E, assert, playRun } = require('./lib');
const N = +(process.argv[2] || 1500);
const byType = {}; let matches = 0, withEpic = 0, total = 0;
const weather = {}; const goalsByW = {}, matchesByW = {};
for (let i = 0; i < N; i++) {
  const R = E.makeRng(9000 + i);
  const { run } = playRun('EP' + i, 1, R, 'random', 'draftRandom');
  for (const h of run.history) {
    matches++; if (h.epics.length) withEpic++;
    h.epics.forEach(id => { byType[id] = (byType[id] || 0) + 1; total++; });
    weather[h.weather] = (weather[h.weather] || 0) + 1;
    goalsByW[h.weather] = (goalsByW[h.weather] || 0) + h.gf + h.ga; matchesByW[h.weather] = (matchesByW[h.weather] || 0) + 1;
  }
}
const pct = x => (100 * x / matches).toFixed(2) + '%';
const out = { partidas: matches, partidasComLanceEpico: pct(withEpic), lancesPorPartida: (total / matches).toFixed(3), porTipo: Object.fromEntries(E.EPIC_IDS.map(k => [k, pct(byType[k] || 0)])),
  clima: Object.fromEntries(Object.keys(weather).map(k => [k, pct(weather[k]) + ' · gols/jogo ' + (goalsByW[k] / matchesByW[k]).toFixed(2)])) };
console.log(JSON.stringify(out, null, 1));
assert(withEpic / matches >= 0.15 && withEpic / matches <= 0.25, 'lances épicos fora de 15-25% das partidas');
E.EPIC_IDS.forEach(k => { assert((byType[k] || 0) > 0, 'nunca aconteceu: ' + k); assert((byType[k] || 0) / matches < 0.07, 'comum demais: ' + k); });
Object.keys(E.WEATHER).forEach(k => assert(weather[k] > 0, 'clima nunca sorteado: ' + k));
// determinismo: mesma seed => mesmos lances e mesmo clima
const a = playRun('DET1', 1, E.makeRng(1), 'random', 'draftRandom').run, b = playRun('DET1', 1, E.makeRng(1), 'random', 'draftRandom').run;
assert.deepStrictEqual(a.history.map(h => [h.weather, h.epics.join()]), b.history.map(h => [h.weather, h.epics.join()]));
// clima no hub = clima na partida
const run = E.newRun('CLIMA', 1, 'bra82'); assert.strictEqual(E.weatherFor(run, 0), E.createMatch(run).weather);
// chefe lendário substitui a Mão Divina na final
const lr = E.newRun('LENDA', 1, 'bra82', null, { legend: 'ita82' }); lr.stage = 6;
const op = E.opponentInfo(lr); assert(op.boss && op.legend === 'ita82' && op.rule === 'muralha');
const lm = E.createMatch(lr); assert.strictEqual(lm.maoMin, -1);
let champs = 0; for (let i = 0; i < 400; i++) { const R = E.makeRng(77 + i); const rr = E.newRun('LG' + i, 1, 'bra82', null, { legend: E.LEGEND_IDS[i % 5] }); rr.stage = 6; const m = E.createMatch(rr); E.simulateRest(m, () => null); E.finishMatch(rr, m); if (rr.status === 'champion') champs++; }
let champsMao = 0; for (let i = 0; i < 400; i++) { const rr = E.newRun('LG' + i, 1, 'bra82'); rr.stage = 6; const m = E.createMatch(rr); E.simulateRest(m, () => null); E.finishMatch(rr, m); if (rr.status === 'champion') champsMao++; }
console.log('final com time inicial: vs lendas ' + (champs / 4).toFixed(1) + '% · vs Mão Divina ' + (champsMao / 4).toFixed(1) + '%');
assert(Math.abs(champs - champsMao) / 400 < 0.12, 'chefes lendários muito diferentes da Mão Divina');
console.log('épicos/clima/lendas: OK');
