// Verifica que cada relíquia e carta tem efeito real e aparece na narração.
const E = require('../src/engine.js');
const assert = require('assert');
function runWith(relics, cards, n, sel) {
  const out = { ev: [], res: [] };
  for (let i = 0; i < n; i++) {
    const run = E.newRun('RLQ' + i, 1, sel || 'bra82');
    run.relics = relics.slice(); if (cards) run.cards = cards.slice();
    const m = E.createMatch(run);
    const ev = E.simulateRest(m, mm => E.playableCards(mm)[0] || null);
    out.ev.push(...ev); out.res.push(E.finishMatch(run, m)); out.m = m;
  }
  return out;
}
const R = {};
let o = runWith(['cabeca_ouro'], ['chuveirinho', 'peixinho'], 200);
const hg = o.ev.filter(e => e.kind === 'goal' && e.side === 0 && e.gtype === 'cabeca');
assert(hg.length > 0 && hg.every(e => e.value === 2 && /Cabeça de Ouro/.test(e.sub))); R.cabeca_ouro = `${hg.length} gols de cabeça, todos valendo 2`;
o = runWith(['luva_ofensiva'], null, 200);
const gk = o.ev.filter(e => e.kind === 'goal' && /^goleiro/.test(e.gtype)); assert(gk.length > 0 && gk.every(e => /Luva Ofensiva/.test(e.sub))); R.luva_ofensiva = `${gk.length} gols de goleiro em 200 jogos`;
o = runWith(['escanteio_nunca'], null, 200); const ecn = o.ev.filter(e => /Escanteio Curto Nunca/.test(e.text)); assert(ecn.length > 0); R.escanteio_nunca = `${ecn.length} escanteios viraram cabeçada`;
o = runWith(['paredao_fala'], null, 200); const pf = o.ev.filter(e => /Paredão que Fala/.test(e.text)); assert(pf.length > 0); R.paredao_fala = `${pf.length} ativações`;
o = runWith(['retranca'], ['casinha'], 300); const rr = o.res.filter(r => r.fichas.some(f => /Retranca/.test(f.label))); assert(rr.length > 0 && rr.every(r => r.gf === 1 && r.ga === 0)); R.retranca = `${rr.length} vitórias por 1 a 0 com +3 Fichas`;
{ const run = E.newRun('PROM', 1, 'bra82'); run.relics = ['promessa']; const i = E.promessaIndex(run); const base = run.players[i].rating; run.stage = 1; assert.strictEqual(E.effRating(run, i), base); run.stage = 3; assert.strictEqual(E.effRating(run, i), Math.min(99, base * 2)); R.promessa = `${run.players[i].nome}: ${base} no grupo -> ${E.effRating(run, i)} no mata-mata`; }
{ const run = E.newRun('COF', 1, 'bra82'); run.fichas = 40; assert.strictEqual(E.interestFor(run), 3); run.relics = ['cofrinho']; assert.strictEqual(E.interestFor(run), 5); run.level = 4; assert.strictEqual(E.interestFor(run), 4); R.cofrinho = 'juros máx 3 -> 5 (Libertadores: 4)'; }
o = runWith(['pe_coelho'], null, 300); const pc = o.ev.filter(e => /Pé de Coelho/.test(e.text)); assert(pc.length > 0 && pc.every(e => e.kind === 'goal')); R.pe_coelho = `${pc.length} bolas na trave que entraram`;
o = runWith(['bola_quadrada'], ['longe'], 300); const bq = o.ev.filter(e => e.kind === 'goal' && /Bola Quadrada/.test(e.sub || '')); assert(bq.length > 0 && bq.every(e => e.value === 2)); assert(bq.some(e => e.side === 1)); R.bola_quadrada = `${bq.length} gols de fora valendo 2 (inclui gols do rival)`;
o = runWith(['juiz_ladrao'], null, 200); const jl = o.ev.filter(e => /Juiz Ladrão/.test(e.text)); assert.strictEqual(jl.length, 200); R.juiz_ladrao = `1 pênalti por jogo; ${jl.filter(e => e.side === 0).length}/200 a favor`;
// cartas
for (const c of E.CARD_IDS) { const r = runWith([], [c], 40); assert(r.ev.some(e => e.kind === 'card' && e.card === c), 'carta não usada ' + c); }
o = runWith([], ['craque'], 200); assert(o.ev.some(e => /Craque decide!/.test(e.text) && e.kind === 'goal'));
o = runWith([], ['peixinho'], 200); assert(o.ev.some(e => /PEIXINHO/.test(e.text) && e.kind === 'goal'));
o = runWith([], ['paredao'], 200); assert(o.ev.some(e => /PAREDÃO!/.test(e.text)));
// chefe
{ let mao = 0; for (let i = 0; i < 100; i++) { const run = E.newRun('BOSS' + i, 1, 'cam90'); run.stage = 6; const m = E.createMatch(run); const ev = E.simulateRest(m); mao += ev.filter(e => e.gtype === 'mao').length; } assert.strictEqual(mao, 100); R.chefe = 'A Mão Divina: 1 gol irregular validado em 100/100 finais'; }
console.log(JSON.stringify(R, null, 1)); console.log('relíquias, cartas e chefe: OK');
