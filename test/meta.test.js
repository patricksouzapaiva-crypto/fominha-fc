// Meta-jogo: missões, sequência, divisões, duelo, bolão, álbum, galeria.
const { E, assert, playRun } = require('./lib');
const M = require('../src/meta.js');
// datas / semanas ISO
assert.strictEqual(M.isoWeek(new Date(2026, 9, 9)), '2026-W41');
assert.strictEqual(M.isoWeek(new Date(2027, 0, 1)), '2026-W53');
assert.strictEqual(M.weekIndex(new Date(2026, 9, 12)) - M.weekIndex(new Date(2026, 9, 11)), 1, 'semana vira na segunda');
assert.strictEqual(M.weekIndex(new Date(2026, 9, 5)), M.weekIndex(new Date(2026, 9, 11)));
// missões: 3 por dia, uma de cada dificuldade, determinísticas
const days = [...Array(60)].map((_, i) => M.addDays('2026-10-01', i));
days.forEach(d => { const ms = M.missionsFor(d); assert.strictEqual(ms.length, 3); ms.forEach((id, t) => assert.strictEqual(M.MISSIONS[id].tier, t)); assert.deepStrictEqual(ms, M.missionsFor(d)); });
assert(new Set(days.map(d => M.missionsFor(d).join())).size > 20, 'missões variam pouco');
// taxa de conclusão por missão (draft aleatório, nível 1)
const done = {}; const N = 600;
for (let i = 0; i < N; i++) { const run = playRun('MS' + i, 1, E.makeRng(500 + i), 'random', 'draftRandom').run; run.daily = i % 2 ? '2026-10-09' : null; const s = M.runSummary(run); Object.keys(M.MISSIONS).forEach(k => { if (M.MISSIONS[k].ok(s)) done[k] = (done[k] || 0) + 1; }); }
const rate = Object.fromEntries(Object.keys(M.MISSIONS).map(k => [k, (100 * (done[k] || 0) / N).toFixed(0) + '%']));
console.log('missões concluídas por campanha:', JSON.stringify(rate));
Object.keys(M.MISSIONS).forEach(k => { const r = (done[k] || 0) / N; assert(r > 0.03, 'missão impossível demais: ' + k); assert(M.MISSIONS[k].tier === 2 || r > 0.15, 'missão fácil/média difícil demais: ' + k); });
// recompensa: fominhas + cosmético do dia, sem duplicar
const st = {}; M.cosStore(st); assert.strictEqual(st.fominhas, 100);
const ms = M.missionState(st, '2026-10-09');
const champ = playRun('X', 1, E.makeRng(3), 'smart', 'draftGreedy').run; champ.daily = '2026-10-09';
const got = M.missionsCheck(st, champ, '2026-10-09');
assert.strictEqual(M.missionsCheck(st, champ, '2026-10-09').length, 0, 'recompensa duplicada');
got.forEach(g => { if (g.cos) assert(M.ownsCos(st, g.cos)); });
console.log('missões de 09/10:', ms.ids.join(', '), '→ concluídas', got.length);
// cosméticos: compra e equipar
st.fominhas = 130; assert(M.buyCos(st, 'kit_neon')); assert.strictEqual(st.fominhas, 10); assert(!M.buyCos(st, 'kit_noite')); assert(!M.buyCos(st, 'kit_real'), 'cosmético de missão não se compra');
assert(M.equipCos(st, 'kit_neon') && st.cos.kit === 'kit_neon'); assert(!M.equipCos(st, 'kit_noite'));
// sequência
const s2 = {}; ['2026-10-01', '2026-10-02', '2026-10-03'].forEach(d => M.streakPlay(s2, d));
assert.strictEqual(s2.streak.cur, 3); assert.strictEqual(M.streakOf(s2, '2026-10-03').status, 'feito');
assert.strictEqual(M.streakOf(s2, '2026-10-04').status, 'risco'); assert.strictEqual(M.streakOf(s2, '2026-10-05').status, 'perdeu');
M.streakPlay(s2, '2026-10-03'); assert.strictEqual(s2.streak.cur, 3, 'jogar 2x no dia não conta');
M.streakPlay(s2, '2026-10-06'); assert.strictEqual(s2.streak.cur, 1); assert.strictEqual(s2.streak.best, 3);
const s3 = {}; let nb = null; for (let i = 0; i < 7; i++) { const r = M.streakPlay(s3, M.addDays('2026-09-01', i)); if (r.novo) nb = r.novo; }
assert(nb && nb.n === 7 && s3.streak.badges[7]);
// divisões
const L = {}; const w1 = new Date(2026, 9, 6), w2 = new Date(2026, 9, 13), w3 = new Date(2026, 9, 20), w6 = new Date(2026, 10, 10);
[600, 400, 300, 200, 100, 50].forEach(p => M.ligaAdd(L, p, w1));
assert.strictEqual(M.ligaProgress(L.liga).score, 1600, 'soma das 5 melhores');
M.ligaSync(L, w2); assert.strictEqual(L.liga.div, 1); assert.deepStrictEqual([L.liga.anim.from, L.liga.anim.to], [0, 1]);
[1500, 1600].forEach(p => M.ligaAdd(L, p, w2)); M.ligaSync(L, w3); assert.strictEqual(L.liga.div, 2, 'Prata → Ouro');
M.ligaSync(L, w6); assert.strictEqual(L.liga.div, 0, 'semanas sem jogar rebaixam');
assert.strictEqual(M.rollover(4, 5000), 4); assert.strictEqual(M.rollover(4, 4000), 3); assert.strictEqual(M.rollover(0, 0), 0);
// duelo
const runA = playRun('DUELO1', 2, E.makeRng(11), 'random', 'draftRandom').run;
const d = { v: 1, s: runA.seed, l: runA.level, a: M.duelSide(runA, 'Patrick ⚽', 812) };
const code = M.duelEncode(d); assert(/^[A-Za-z0-9_-]+$/.test(code), 'código não é url-safe'); assert(code.length < 400);
const back = M.duelDecode(code); assert.deepStrictEqual(back, d);
const liveCode = M.duelEncode({ v: 2, id: 'ABC123', s: 'copa1', l: 1, host: 'Pat' });
const live = M.duelDecode(liveCode);
assert(live && live.v === 2 && live.id === 'ABC123' && live.s === 'COPA1' && live.host === 'Pat', 'duelo ao vivo');
assert.strictEqual(M.duelDecode(M.duelEncode({ v: 2, id: 'bad', s: 'COPA1', l: 1 })), null);
assert.strictEqual(M.duelDecode('lixo!!'), null); assert.strictEqual(M.duelDecode(M.duelEncode({ v: 1, s: 'X', l: 9, a: d.a })), null);
const runB = playRun('DUELO1', 2, E.makeRng(12), 'random', 'draftRandom').run;
assert.deepStrictEqual(runA.opponents.map(o => o.nome), runB.opponents.map(o => o.nome), 'mesma semente = mesma Copa');
const bSide = M.duelSide(runB, 'Amigo', 500); assert.strictEqual(M.duelWinner(d.a, bSide), 0); assert.strictEqual(M.duelWinner(bSide, d.a), 1);
assert(M.duelDecode(M.duelEncode({ ...d, a: bSide, b: d.a })).b.n === 'Patrick ⚽');
// bolão
assert.deepStrictEqual(M.bolaoSettle({ guess: 2, stake: 25 }, 2), { guess: 2, stake: 25, reach: 2, hit: true, beyond: false, payout: 75, net: 50 });
assert.strictEqual(M.bolaoSettle({ guess: 2, stake: 25 }, 4).net, 0); assert.strictEqual(M.bolaoSettle({ guess: 2, stake: 25 }, 1).net, -25);
assert.strictEqual(M.bolaoSettle({ guess: 5, stake: 50 }, 5).payout, 400);
// álbum e galeria
const al = {}; M.cosStore(al);
const r1 = M.albumCollect(al, runA.players); assert.strictEqual(r1.novos.length, runA.players.length);
const pg = M.ALBUM.find(p => p.id === 'ita'); const r2 = M.albumCollect(al, pg.players);
assert(r2.kits.includes('retro_ita') && M.ownsCos(al, 'retro_ita'), 'página completa libera uniforme retrô');
assert.strictEqual(M.albumStats(al).total, 126);
const gal = {}; M.galleryAdd(gal, champ, 900); M.galleryAdd(gal, champ, 1200); M.galleryAdd(gal, runA, 300);
assert.strictEqual(gal.coaches.length, 2); assert.strictEqual(gal.coaches[0].campanhas, 2); assert.strictEqual(gal.coaches[0].best, 1200);
assert.strictEqual(M.hallOfFame(gal)[0].key, gal.coaches[0].key);
// semanal lendário
const wk = M.isoWeek(new Date(2026, 9, 9)); assert(E.LEGENDS[M.legendOfWeek(wk)]); assert.strictEqual(M.legendSeed(wk), M.legendSeed(wk)); assert(/^L[A-Z0-9]{5}$/.test(M.legendSeed(wk)));
const legs = new Set([...Array(30)].map((_, i) => M.legendOfWeek('2026-W' + String(i + 1).padStart(2, '0')))); assert(legs.size >= 4, 'lendas pouco variadas');
console.log('meta (missões, sequência, divisões, duelo, bolão, álbum, galeria): OK');
