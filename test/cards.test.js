// Cartas do técnico: custo, contra-golpe, combo, nível, energia e determinismo.
const assert = require('assert');
const E = require('../src/engine.js');

assert.strictEqual(E.CARD_IDS.length, 14, 'o baralho tem 14 cartas');
for (const id of E.CARD_IDS) {
  const c = E.CARDS[id];
  assert(c.cost >= 1 && c.cost <= 3, id + ' custo');
  assert(E.CARD_TYPES[c.tipo], id + ' tipo');
  assert(c.dur === 'uso único' || c.dur === 'até o fim' || /^\d+ min$/.test(c.dur), id + ' duração');
  assert(c.tip && c.tip.length > 8, id + ' dica');
  const t1 = E.cardText(id, 1), t3 = E.cardText(id, 3);
  assert(!/undefined|NaN|\{\{/.test(t1 + t3), id + ' texto');
  if (id !== 'catimba') assert(/\d/.test(t1), id + ' efeito numérico');
  if (id !== 'catimba') assert(t1 !== t3, id + ' sobe de nível');
}
assert.deepStrictEqual(E.BEATS, { pressao: 'posse', posse: 'contra', contra: 'pressao' });
assert(E.COMBOS.length >= 5);
assert(E.COMBOS.some(c => c.id === 'blitz' && c.cards.join() === 'pressao,submagica'));
assert(E.COMBOS.some(c => c.id === 'aereo' && c.relic === 'cabeca_ouro'));

function pause(cards, coach) {
  const run = E.newRun('CARDT', 1, 'bra82', coach || E.flatCoach(70, 'T'));
  run.cards = cards.slice();
  const m = E.createMatch(run);
  let g = 0;
  while (!m.awaiting && !m.done && g++ < 400) E.stepMatch(m);
  assert(m.awaiting, 'partida sem momento de carta');
  return { run, m };
}

{
  const hi = E.newRun('EST', 1, 'bra82', E.flatCoach(90, 'E'));
  const lo = E.newRun('EST', 1, 'bra82', E.flatCoach(80, 'E'));
  assert.strictEqual(E.nrgMax(hi), 4);
  assert.strictEqual(E.nrgMax(lo), 3);
  assert.strictEqual(pause(['casinha'], hi.coach && E.flatCoach(90, 'E')).m.nrgMax, 4);
}

{
  const { m } = pause(['casinha', 'toque']);
  assert.strictEqual(m.nrgLeft, 3);
  E.playCards(m, ['casinha', 'toque']);
  assert.strictEqual(m.nrgLeft, 1);
  assert(m.used.indexOf('casinha') >= 0 && m.used.indexOf('toque') >= 0);
}

{
  const { m } = pause(['craque', 'casinha']);
  E.playCards(m, ['craque', 'casinha']);
  assert(m.used.indexOf('craque') >= 0, 'craque não entrou');
  assert(m.used.indexOf('casinha') < 0, 'casinha entrou sem energia');
  assert.strictEqual(m.nrgLeft, 0);
}

{
  const { m } = pause(['pressao']);
  m.fxOpp.style = 'posse'; m.fxOpp.styleUntil = 200;
  const ev = E.playCards(m, ['pressao']);
  assert(ev.some(e => e.kind === 'counter' && /CONTRA-GOLPE/.test(e.text)));
  assert.strictEqual(m.fx.golpeUntil, m.minute + 10);
}

{
  const { m } = pause(['pressao', 'submagica']);
  const ev = E.playCards(m, ['pressao', 'submagica']);
  assert(ev.some(e => e.kind === 'combo' && e.combo === 'blitz'));
  assert.strictEqual(m.fx.blitz, true);
  assert.strictEqual(m.fx.pressaoFadiga, 0);
  assert.strictEqual(m.fx.fadigaPct, 0);
}

{
  const { run, m } = pause(['chuveirinho']);
  run.relics = ['cabeca_ouro'];
  const ev = E.playCards(m, ['chuveirinho']);
  assert(ev.some(e => e.kind === 'combo' && e.combo === 'aereo'));
  assert.strictEqual(m.fx.aereo, true);
}

{
  const run = E.newRun('LV', 1, 'bra82');
  run.cards = ['pressao', 'casinha'];
  E.applyItem(run, { type: 'card', id: 'pressao' });
  assert.strictEqual(E.cardLevel(run, 'pressao'), 2);
  assert.strictEqual(run.cards.length, 2);
  E.applyItem(run, { type: 'card', id: 'pressao' });
  assert.strictEqual(E.cardLevel(run, 'pressao'), 3);
  E.applyItem(run, { type: 'card', id: 'pressao' });
  assert.strictEqual(E.cardLevel(run, 'pressao'), 3);
  assert(E.cardNums(run, 'pressao').roubo > E.CARDS.pressao.lv[0].roubo);
  assert.strictEqual(E.needsTarget(run, { type: 'card', id: 'pressao' }), null);
}

{
  const home = E.newRun('PH', 1, 'bra82', E.flatCoach(75, 'H'));
  const away = E.newRun('PA', 1, 'hol74', E.flatCoach(75, 'A'));
  home.cards = ['pressao']; away.cards = ['catimba'];
  const m = E.createPvpMatch(home, away, 'CAT1');
  let g = 0; while (!m.awaiting && !m.done && g++ < 400) E.stepMatch(m);
  const ev = E.applyPvpCards(m, 'pressao', 'catimba');
  assert(ev.some(e => /Catimba/.test(e.text) && /anulada/.test(e.text)), 'catimba do visitante não cancelou');
  assert(m.fx.pressaoUntil < 0, 'pressão sobreviveu à catimba');
  assert(m.used.indexOf('pressao') >= 0 && m.nrgLeft === E.nrgMax(home) - 2);
}

{
  const home = E.newRun('PH2', 1, 'bra82', E.flatCoach(75, 'H'));
  const away = E.newRun('PA2', 1, 'hol74', E.flatCoach(75, 'A'));
  home.cards = ['catimba']; away.cards = ['pressao'];
  const m = E.createPvpMatch(home, away, 'CAT2');
  let g = 0; while (!m.awaiting && !m.done && g++ < 400) E.stepMatch(m);
  const ev = E.applyPvpCards(m, ['catimba'], ['pressao']);
  assert(ev.some(e => /anulada/.test(e.text)));
  assert(m.fxAway.pressaoUntil < 0);
}

function texts(seed) {
  const run = E.newRun(seed, 1, 'bra82', E.flatCoach(76, 'D'));
  run.cards = ['pressao', 'casinha', 'contra'];
  const m = E.createMatch(run);
  return E.simulateRest(m, mm => (E.playableCards(mm)[0] || null)).map(e => e.min + '|' + e.kind + '|' + e.text).join('\n');
}
assert.strictEqual(texts('DET77'), texts('DET77'));
assert.notStrictEqual(texts('DET77'), texts('DET78'));

{
  const { m } = pause(['casinha']);
  const p = E.previewCard(m, 'casinha');
  assert(p.you1 < p.you0 && p.them1 < p.them0);
  const q = E.previewCard(m, 'craque');
  assert(q.you1 > q.you0);
}

console.log('cartas: OK', E.CARD_IDS.length, 'cartas ·', E.COMBOS.map(c => c.nome).join(', '));
