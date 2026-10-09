// Modo Carreira: calendário, mentores, propostas e o equilíbrio da pirâmide.
const C = require('../src/career.js');
const E = require('../src/engine.js');
const assert = require('assert');

function nums(over) {
  const o = { atk: 60, def: 60, mei: 60, bol: 60, mot: 60, est: 60 };
  Object.assign(o, over || {});
  return o;
}

// calendário: 20 clubes, 38 rodadas, todo mundo joga 38
{
  const ids = Array.from({ length: 20 }, (_, i) => 't' + i);
  const rr = C.roundRobin(ids);
  assert.strictEqual(rr.length, 38);
  const games = {}, homes = {};
  rr.forEach(round => {
    const seen = {};
    assert.strictEqual(round.length, 10);
    round.forEach(([a, b]) => {
      assert(a !== b && !seen[a] && !seen[b]);
      seen[a] = seen[b] = 1;
      games[a] = (games[a] || 0) + 1; games[b] = (games[b] || 0) + 1;
      homes[a] = (homes[a] || 0) + 1;
    });
  });
  ids.forEach(id => { assert.strictEqual(games[id], 38); assert.strictEqual(homes[id], 19); });
}

// tabela: 3 pontos, saldo e ordem
{
  const c = C.create({ seed: 'TABELA', nome: 'P', nums: nums({ atk: 72, def: 66 }), policy: 'play' });
  const ids = c.members[0];
  assert.strictEqual(ids.length, 20);
  c.played[0].push({ h: ids[0], a: ids[1], hg: 2, ag: 0 });
  const t = C.table(c, 0);
  const row = t.find(r => r.id === ids[0]);
  assert.strictEqual(row.pts, 3);
  assert.strictEqual(row.gp - row.gc, 2);
  assert.strictEqual(t[0].id, ids[0]);
}

// mesma semente, mesma carreira
{
  const a = C.simulate('IGUAL', 'good');
  const b = C.simulate('IGUAL', 'good');
  assert.deepStrictEqual(a.mentors.map(m => m.coachId + ':' + m.stat), b.mentors.map(m => m.coachId + ':' + m.stat));
  assert.strictEqual(a.reachedA, b.reachedA);
  assert.deepStrictEqual(a.titles, b.titles);
}

// mentor: determinismo, fallback quando o atributo já é 99, teto em 99
{
  const c1 = C.create({ seed: 'MENTOR', nome: 'P', nums: nums(), policy: 'play' });
  const c2 = C.create({ seed: 'MENTOR', nome: 'P', nums: nums(), policy: 'play' });
  c1.seasons = 5; c2.seasons = 5;
  const A = C.rollMentor(c1), B = C.rollMentor(c2);
  assert.strictEqual(A.id, B.id);
  const ranked = C.rankedStats(A);
  const slots = {};
  E.COACH_ATTR_IDS.forEach(a => { slots[a] = { rating: 70 }; });
  assert.strictEqual(C.mentorStat(A, slots), ranked[0]);
  slots[ranked[0]].rating = 99;
  assert.strictEqual(C.mentorStat(A, slots), ranked[1]);
  ranked.forEach(a => { slots[a].rating = 99; });
  assert.strictEqual(C.mentorStat(A, slots), null);

  const g = C.create({ seed: 'TETO', nome: 'P', nums: nums({ atk: 98 }), policy: 'play' });
  g.mentors = [{ stat: 'atk', coachId: 'simeone' }, { stat: 'atk', coachId: 'simeone' }];
  C.applyGrowth(g);
  assert.strictEqual(g.coach.slots.atk.rating, 99);
  const line = C.mentorText(g, { stat: 'atk', coachId: 'simeone' });
  assert(/Defesa|Ataque/.test(line) && /2x|3x/.test(line), line);
}

// proposta europeia não aparece cedo; o encaixe exige reputação e título
{
  const c = C.create({ seed: 'OFERTA', nome: 'P', nums: nums(), policy: 'play' });
  c.rep = 12; c.seasons = 1; c.age = 41; c.summary = { toDiv: 0, div: 0, pos: 8 };
  const early = C.buildOffers(c, 'fim');
  assert(early.every(o => o.from === 'brasil'), 'sem Europa no começo');
  const euro = { kind: 'euro', div: 4, ambition: 'champions', fanPressure: 60, clubId: 'ajax' };
  c.rep = 30; c.titles.A = 0;
  assert.strictEqual(C.offerFit(c, euro), false);
  c.squad.forEach(p => { p.rating = 80; });
  c.rep = 86; c.titles.A = 1; c.seasons = 12;
  assert.strictEqual(C.offerFit(c, euro), true);
  const low = { kind: 'brasil', div: 0, ambition: 'campeao', fanPressure: 40, clubId: c.clubId };
  c.squad.forEach(p => { p.rating = 57; });
  assert.strictEqual(C.offerFit(c, low), false);
}

// save/load conserva a temporada
{
  const c = C.create({ seed: 'SAVE1', nome: 'Nara', nums: nums({ mei: 70 }), policy: 'play', slot: 1 });
  C.skipLive(c);
  C.persist(c);
  const back = C.loadStore().slots[1];
  assert.strictEqual(back.nome, 'Nara');
  assert.strictEqual(back.seed, c.seed);
  assert.strictEqual(back.round, c.round);
  assert.strictEqual(back.members[0].length, 20);
}

// equilíbrio: boa sobe em ~4-8, ruim é demitida, mentor acelera de verdade
{
  const b = C.balance(12);
  console.log('balance', JSON.stringify(b));
  assert(b.good.medianToA >= 4 && b.good.medianToA <= 8, 'mediana boa ' + b.good.medianToA);
  assert(b.good.minToA >= 4 && b.good.maxToA <= 10);
  assert(b.good.reachA >= 10);
  assert(b.good.sack <= 2);
  assert(b.good.aTitleRate >= 8 && b.good.aTitleRate <= 45, 'taças da A ' + b.good.aTitleRate);
  assert(b.bad.sack >= 6, 'demissões ' + b.bad.sack);
  assert(b.bad.medianToA == null || b.bad.medianToA > b.good.medianToA);
  assert(b.mentor.medianDelta >= 8, 'mentor ' + b.mentor.medianDelta);
  assert(b.good.titleA < b.good.reachA * 8, 'título da A não pode ser todo ano');
}

console.log('career ok');
