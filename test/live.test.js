// Final ao vivo: mesmas entradas => mesmo placar, mesmas cartas e mesmos lances.
const assert = require('assert');
const E = require('../src/engine.js');
const L = require('../src/live.js');

function squad(seed, sel, coachName, cards) {
  const run = E.newRun(seed, 1, sel, E.flatCoach(78, coachName));
  if (cards) run.cards = cards.slice();
  run.relics = ['cabeca_ouro'];
  return L.packSquad(run, coachName);
}

const home = squad('H1', 'bra82', 'Patrick', ['pressao', 'craque', 'paredao']);
const away = squad('A1', 'hol74', 'Amigo', ['casinha', 'longe', 'peixinho']);
const choices = [
  { c0: 'pressao', c1: 'casinha' },
  { c0: 'craque', c1: null },
  { c0: null, c1: 'peixinho' },
  { c0: 'paredao', c1: 'longe' }
];

const a = L.playFinal(home, away, 'FINALX', choices);
const b = L.playFinal(JSON.parse(JSON.stringify(home)), JSON.parse(JSON.stringify(away)), 'FINALX', choices);
assert(L.sameFinal(a, b), 'mesmas entradas deram finais diferentes');
assert.strictEqual(a.choices.length, b.choices.length);
assert(a.choices.every((c, i) => c.c0 === choices[i].c0 && c.c1 === choices[i].c1), 'cartas aplicadas fora de ordem');
assert(a.texts.some(t => t.includes('pressao') || t.includes('Pressão')) && a.texts.some(t => /Peixinho|peixinho|PEIXINHO|casinha|Casinha|Chute de longe|Paredão/.test(t)), 'narrativa não registrou as cartas');

const other = L.playFinal(home, away, 'FINALX', choices.map((c, i) => i === 0 ? { c0: null, c1: null } : c));
assert(!L.sameFinal(a, other), 'trocar a carta do primeiro minuto não mudou a final');

const ai = L.playFinal(home, away, 'FINALX', [{ c0: 'pressao', c1: null }], [false, true]);
const ai2 = L.playFinal(home, away, 'FINALX', [{ c0: 'pressao', c1: null }], [false, true]);
assert(L.sameFinal(ai, ai2), 'IA do desconectado não é determinística');
assert(ai.choices[0].c1, 'lado sem escolha e marcado como IA ficou sem carta');

const solo = E.newRun('SOLO99', 1, 'bra82');
const m = E.createMatch(solo);
E.simulateRest(m, () => null);
assert(m.done && m.score[0] >= 0, 'partida solo quebrou');
console.log('live: OK', a.score.join(' x '), 'vencedor', a.winner, '· com IA', ai.score.join(' x '));
