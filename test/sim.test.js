// Teste headless do motor da Copa Relâmpago: roda N runs com escolhas automáticas.
// O técnico padrão é montado pelo draft com escolhas aleatórias (como um jogador novato faria).
const { E, assert, playRun, batch } = require('./lib.js');
const N = +(process.argv[2] || 1000);

function det() {
  const a = playRun('ABC123', 1, E.makeRng(1), 'random', 'draftRandom').run, b = playRun('ABC123', 1, E.makeRng(1), 'random', 'draftRandom').run;
  assert.deepStrictEqual(a.history, b.history, 'não determinístico');
  assert.deepStrictEqual(a.coach, b.coach, 'técnico não determinístico');
  const s1 = E.newRun('XYZ999', 1, 'bra82'), s2 = E.newRun('XYZ999', 1, 'bra82');
  assert.deepStrictEqual(E.genRewards(s1), E.genRewards(s2));
  assert.deepStrictEqual(s1.opponents, s2.opponents);
  return 'ok';
}
console.log('determinismo:', det());
const results = [
  batch(1, 'random', N, 'draftRandom'), batch(1, 'smart', N, 'draftGreedy'),
  batch(2, 'random', N, 'draftRandom'), batch(3, 'random', Math.floor(N / 2), 'draftRandom'), batch(4, 'random', Math.floor(N / 2), 'draftRandom')
];
for (const r of results) console.log(JSON.stringify(r));
assert.strictEqual(results.reduce((s, r) => s + r.errors, 0), 0, 'houve erros');
const l1 = results[0];
if (!(l1.winRate >= 0.25 && l1.winRate <= 0.35)) { console.log('ATENÇÃO: taxa de vitória nível 1 (técnico de draft aleatório) fora de 25-35%:', l1.winRate); process.exitCode = 2; }
else console.log('OK: taxa de vitória nível 1 (escolhas e draft aleatórios) =', (l1.winRate * 100).toFixed(1) + '%');
