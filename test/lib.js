// Utilitários compartilhados pelos testes headless.
const E = require('../src/engine.js');
const assert = require('assert');

// monta técnico pelo draft (mesmas regras da tela): 'random' escolhe atributo livre ao acaso;
// 'greedy' pega a maior nota livre e usa re-sorteio se a melhor nota livre for < 4
function draftCoach(seed, R, mode) {
  const d = E.coachDraftNew(seed);
  let guard = 0;
  while (!d.done && guard++ < 20) {
    const c = E.COACH_BY_ID[d.current];
    const free = E.COACH_ATTR_IDS.filter(a => !d.slots[a]);
    if (mode === 'greedy') {
      const best = free.reduce((b, a) => c.s[a] > c.s[b] ? a : b, free[0]);
      if (c.s[best] < 85 && d.rolls > 0) { E.draftReroll(d); continue; }
      E.draftPick(d, best);
    } else {
      if (d.rolls > 0 && R.next() < 0.15) { E.draftReroll(d); continue; }
      E.draftPick(d, R.pick(free));
    }
  }
  assert(d.done && Object.keys(d.slots).length === 6);
  return E.makeCoach('Teste', d.slots);
}
function coachFor(spec, seed, R) {
  if (!spec || spec === 'none') return null;
  if (spec.startsWith('flat')) return E.flatCoach(+spec.slice(4));
  if (spec.startsWith('focus:')) { // focus:atk:95:75 => atributo em 95, resto em 75
    const [, a, hi, lo] = spec.split(':'); const c = E.flatCoach(+lo); c.slots[a] = { rating: +hi, from: 'Foco', fromId: '' }; return c;
  }
  if (spec === 'draftRandom') return draftCoach(seed, R, 'random');
  if (spec === 'draftGreedy') return draftCoach(seed, R, 'greedy');
  throw new Error('coach spec ' + spec);
}

function playRun(seed, level, R, strat, coachSpec) {
  const sels = E.selecaoChoices(seed);
  const run = E.newRun(seed, level, R.pick(sels), coachFor(coachSpec, seed, R));
  const stats = { goals: 0, ga: 0, matches: 0, cardsUsed: 0, pens: 0, bossMao: 0, coachEv: 0 };
  let guard = 0;
  while (run.status === 'playing' && guard++ < 20) {
    const m = E.createMatch(run);
    const ev = E.simulateRest(m, mm => {
      const ids = [];
      const room = () => {
        const spent = ids.reduce((s, id) => s + E.CARDS[id].cost, 0);
        return E.playableCards(mm).filter(c => ids.indexOf(c) < 0 && E.CARDS[c].cost <= mm.nrgLeft - spent);
      };
      let g = 0;
      while (g++ < 4) {
        const pl = room();
        if (!pl.length) break;
        if (R.next() >= (strat === 'smart' ? 0.8 : 0.5)) break;
        ids.push(R.pick(pl));
      }
      return ids;
    });
    stats.cardsUsed += ev.filter(e => e.kind === 'card').length;
    stats.bossMao += ev.filter(e => e.gtype === 'mao').length;
    for (const e of ev) { assert(typeof e.text === 'string' && e.text.length > 0, 'evento sem texto'); assert(!/undefined|NaN/.test(e.text + (e.sub || '')), 'texto quebrado: ' + e.text + ' | ' + e.sub); }
    assert(m.minute === 90 && m.done);
    const res = E.finishMatch(run, m);
    stats.coachEv += Object.values(m.stats.coach).reduce((a, b) => a + b, 0);
    for (const w of res.why) assert(!/undefined|NaN/.test(w), 'why quebrado: ' + w);
    assert(['W', 'D', 'L'].includes(res.outcome));
    assert(Number.isFinite(run.fichas) && run.fichas >= 0, 'fichas inválidas');
    if (res.pens) stats.pens++;
    stats.matches++; stats.goals += res.gf; stats.ga += res.ga;
    if (res.reward) {
      let offers = E.genRewards(run);
      assert(offers.length === 3);
      if (strat === 'random' && R.next() < 0.15) { const o2 = E.rerollRewards(run); if (o2) offers = o2; }
      let it;
      if (strat === 'smart') {
        const pl = offers.find(o => o.type === 'player');
        const tgt = E.needsTarget(run, pl);
        const worst = Math.min(...tgt.map(i => run.players[i].rating));
        it = pl.player.rating > worst + 8 ? pl : (offers.find(o => o.type === 'relic') || pl);
      } else it = R.pick(offers);
      const tg = E.needsTarget(run, it);
      E.applyItem(run, it, tg ? R.pick(tg) : undefined);
    }
    if (res.shop) {
      for (const it of E.genShop(run)) {
        if (run.fichas >= it.price && R.next() < 0.6) { const tg = E.needsTarget(run, it); assert(E.buyItem(run, it, tg ? R.pick(tg) : undefined)); }
      }
    }
    assert(run.cards.length <= E.MAX_CARDS && run.relics.length <= E.MAX_RELICS && run.players.length === 7);
    assert(run.players.filter(p => p.pos === 'GOL').length === 1);
  }
  const v = E.verdict(run);
  assert(v.chegou && v.frase && v.titulo);
  if (run.coach) assert(v.coach && v.coach.nome && v.coach.titulo);
  return { run, stats };
}

function batch(level, strat, n, coachSpec, salt) {
  const R = E.makeRng(12345 + level * 7 + (strat === 'smart' ? 99 : 0) + (salt || 0));
  const reach = [0, 0, 0, 0, 0, 0, 0, 0];
  let champ = 0, goals = 0, ga = 0, matches = 0, cards = 0, pens = 0, errors = 0, mao = 0, finals = 0, coachEv = 0;
  const bySel = {};
  for (let i = 0; i < n; i++) {
    const seed = E.randomSeed(R.next);
    try {
      const { run, stats } = playRun(seed, level, R, strat, coachSpec);
      const sc = run.status === 'champion' ? 7 : run.history[run.history.length - 1].stage;
      reach[sc]++;
      if (run.status === 'champion') champ++;
      if (run.history.some(h => h.stage === 6)) finals++;
      goals += stats.goals; ga += stats.ga; matches += stats.matches; cards += stats.cardsUsed; pens += stats.pens; mao += stats.bossMao; coachEv += stats.coachEv;
      bySel[run.selecao] = bySel[run.selecao] || [0, 0]; bySel[run.selecao][0]++; if (run.status === 'champion') bySel[run.selecao][1]++;
    } catch (e) { errors++; if (errors < 4) console.error('ERRO seed', seed, e.stack); }
  }
  return { level, strat, coach: coachSpec || 'none', n, errors, winRate: champ / n, finals: finals / n, reachDist: reach.map(x => (100 * x / n).toFixed(1) + '%'),
    gfPerMatch: (goals / matches).toFixed(2), gaPerMatch: (ga / matches).toFixed(2), cardsPerMatch: (cards / matches).toFixed(2), pensPerMatch: (pens / matches).toFixed(3), maoPerFinal: (mao / (finals || 1)).toFixed(2), coachEventsPerMatch: (coachEv / matches).toFixed(2),
    bySel: Object.fromEntries(Object.entries(bySel).map(([k, v]) => [k, (100 * v[1] / v[0]).toFixed(1) + '%'])) };
}
module.exports = { E, assert, playRun, batch, draftCoach, coachFor };
