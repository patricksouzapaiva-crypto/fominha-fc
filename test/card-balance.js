// Taxa de título: cada carta forçada contra a linha de base (mão inicial, joga 50%).
// node test/card-balance.js [n]
const { E, draftCoach } = require('./lib.js');
const N = +(process.argv[2] || 100);

function cup(seed, card, always) {
  const R = E.makeRng(E.hashStr(seed + ':bal'));
  const run = E.newRun(seed, 1, R.pick(E.selecaoChoices(seed)), draftCoach(seed, R, 'random'));
  if (card) run.cards = [card];
  let g = 0;
  while (run.status === 'playing' && g++ < 20) {
    const m = E.createMatch(run);
    E.simulateRest(m, mm => {
      const pl = E.playableCards(mm);
      if (!pl.length) return null;
      if (always) return pl[0];
      return R.next() < 0.5 ? R.pick(pl) : null;
    });
    const res = E.finishMatch(run, m);
    if (res.reward) {
      const offers = E.genRewards(run);
      const it = R.pick(offers);
      const tg = E.needsTarget(run, it);
      E.applyItem(run, it, tg ? R.pick(tg) : undefined);
    }
    if (res.shop) {
      for (const it of E.genShop(run)) {
        if (run.fichas >= it.price && R.next() < 0.6) {
          const tg = E.needsTarget(run, it);
          E.buyItem(run, it, tg ? R.pick(tg) : undefined);
        }
      }
    }
  }
  return run.status === 'champion' ? 1 : 0;
}

const seeds = [];
const R = E.makeRng(20261009);
for (let i = 0; i < N; i++) seeds.push(E.randomSeed(R.next));
const base = seeds.reduce((s, seed) => s + cup(seed, null, true), 0) / N;
const rows = [{ nome: '(mão inicial, joga sempre)', id: '', win: base, delta: 0 }];
for (const id of E.CARD_IDS) {
  const w = seeds.reduce((s, seed) => s + cup(seed, id, true), 0) / N;
  rows.push({ nome: E.CARDS[id].nome, id, win: w, delta: w - base });
}
console.log('n=' + N + ' copas nível 1, draft aleatório, mesma semente');
rows.forEach(r => console.log(r.nome + '\t' + (100 * r.win).toFixed(1) + '%\t' + (r.delta >= 0 ? '+' : '') + (100 * r.delta).toFixed(1)));
const hot = rows.filter(r => r.id && r.delta > 0.15);
if (hot.length) {
  console.error('carta dominante:', hot.map(r => r.nome).join(', '));
  process.exitCode = 2;
}
