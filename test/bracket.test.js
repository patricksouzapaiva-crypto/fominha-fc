// Chave do duelo: os dois jogadores ficam em metades opostas e só se encontram na final.
const assert = require('assert');
const B = require('../src/bracket.js');

function check(seed) {
  const cup = B.buildCup(seed);
  assert.strictEqual(cup.groups.length, 8);
  assert.strictEqual(cup.groups[0].teams[0].human, 0);
  assert.strictEqual(cup.groups[4].teams[0].human, 1);
  assert.strictEqual(B.halfOf(0), 0);
  assert.strictEqual(B.halfOf(1), 1);
  assert.notStrictEqual(cup.groups[0].half, cup.groups[4].half);
  const names = [];
  cup.groups.forEach(g => g.teams.forEach(t => { if (t.human == null) names.push(t.nome); }));
  assert.strictEqual(new Set(names).size, names.length, 'CPU repetido na chave');
  assert.strictEqual(names.length, 30);
  [1, 2].forEach(ra => [1, 2].forEach(rb => {
    assert(B.meetOnlyInFinal(0, ra, 1, rb), `encontram antes da final ${seed} ${ra}x${rb}`);
    const pa = cup.ko[0][ra - 1], pb = cup.ko[1][rb - 1];
    [pa.r16, pa.qf, pb.r16, pb.qf].forEach(t => assert(t && t.nome && t.human == null, 'vaga humana no caminho de CPU'));
    assert.notStrictEqual(pa.slots.sf, pb.slots.sf);
    const oppA = new Set([pa.r16.nome, pa.qf.nome]);
    [pb.r16.nome, pb.qf.nome].forEach(n => assert(!oppA.has(n), 'mesmo rival nas duas metades: ' + n));
  }));
  const again = B.buildCup(seed);
  assert.deepStrictEqual(again.groups.map(g => g.teams.map(t => t.nome)), cup.groups.map(g => g.teams.map(t => t.nome)));
  const opps = B.groupOpponents(cup, 0);
  assert.strictEqual(opps.length, 3);
  assert.deepStrictEqual(opps.map(o => o.nome), cup.groups[0].teams.slice(1).map(t => t.nome));
  assert(cup.ko[1][0].r16 && cup.ko[1][0].qf);
}
{
  const cup = B.buildCup('SEMISF');
  B.recordHuman(cup, 0, [[3, 0], [2, 0], [1, 0]]);
  const p = B.placePlayer(B.buildCup('SEMISF'), 0, [[3, 0], [2, 0], [1, 0]]);
  assert(p.qualified);
  const ko = B.koOpponents(cup, 0, p.rank);
  assert.strictEqual(ko.length, 3, 'semi sem rival depois do grupo');
  assert(ko.every(o => o.nome && !/Você|Amigo/.test(o.nome)));
}

for (let i = 0; i < 25; i++) check('CUP' + i + 'Z');
// classificação: 3 vitórias colocam o humano em 1º e classificado
{
  const cup = B.buildCup('CLASS1');
  const p = B.placePlayer(cup, 0, [[2, 0], [1, 0], [3, 1]]);
  assert(p.qualified && p.rank <= 2 && p.pts >= 4, JSON.stringify(p));
  const bad = B.placePlayer(cup, 1, [[0, 2], [0, 1], [1, 1]]);
  assert(!bad.qualified, 'três derrotas não podem classificar');
  assert.strictEqual(cup.groups[0].played['0-1'], undefined, 'placePlayer não pode sujar a copa');
}
console.log('bracket: OK (25 sementes, metades opostas, final única)');
