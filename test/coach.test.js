// Balanceamento e regras do "Monte seu Técnico".
const { E, assert, batch, draftCoach } = require('./lib.js');
const N = +(process.argv[2] || 6000);

// ---- regras do draft
{
  const d1 = E.coachDraftNew('PATRICK'), d2 = E.coachDraftNew('PATRICK');
  assert.strictEqual(d1.current, d2.current, 'mesma semente deve sortear o mesmo técnico');
  assert.strictEqual(d1.rolls, 2);
  const first = d1.current;
  assert(E.draftPick(d1, 'def'));
  assert(!E.draftPick(d1, 'def'), 'slot preenchido não pode repetir');
  assert.strictEqual(d1.slots.def.rating, E.COACH_BY_ID[first].s.def);
  assert(E.draftReroll(d1) && E.draftReroll(d1) && !E.draftReroll(d1), 'só 2 re-sorteios');
  assert.strictEqual(new Set(d1.shown).size, d1.shown.length, 'técnico repetido no draft');
  ['atk', 'mei', 'bol', 'mot', 'est'].forEach(a => assert(E.draftPick(d1, a)));
  assert(d1.done && !d1.current);
  // mesma sequência de ações => mesmo resultado
  const R1 = E.makeRng(7), R2 = E.makeRng(7);
  assert.deepStrictEqual(draftCoach('SEMENTE', R1, 'random'), draftCoach('SEMENTE', R2, 'random'));
}
// ---- pool: ninguém é máximo em tudo, todo mundo tem pico e ponto fraco
for (const c of E.COACHES) {
  const v = Object.values(c.s); const tot = v.reduce((a, b) => a + b, 0);
  assert(v.every(x => x >= 55 && x <= 95), c.id);
  assert(Math.max(...v) >= 85 && Math.min(...v) <= 72, 'sem pico/ponto fraco: ' + c.id);
  const ovr = E.coachOVR(c); assert(ovr >= 74 && ovr <= 82, 'OVR fora do padrão: ' + c.id + ' ' + ovr);
}
console.log(`pool: ${E.COACHES.length} técnicos OK`);
console.log('TABELA: técnico | ATQ DEF POS BPA MEN EST | OVR');
for (const c of E.COACHES) console.log(`${c.nome} | ${E.COACH_ATTR_IDS.map(a => c.s[a]).join(' ')} | ${E.coachOVR(c)}`);

// ---- balanceamento (nível 1, escolhas aleatórias de recompensa/carta)
const pct = x => (100 * x).toFixed(1) + '%';
const rows = [];
const run = (label, spec) => { const r = batch(1, 'random', N, spec, 555); assert.strictEqual(r.errors, 0); rows.push([label, r.winRate, r]); return r.winRate; };
const weak = run('Técnico fraco (tudo 55)', 'flat55');
const mid = run('Técnico médio (tudo 75)', 'flat75');
const strong = run('Técnico máximo teórico (tudo 95)', 'flat95');
const dr = run('Draft aleatório', 'draftRandom');
const dg = run('Draft com melhores escolhas', 'draftGreedy');
const focus = {};
for (const a of E.COACH_ATTR_IDS) focus[a] = run(`Foco ${a} (95 nele, 75 resto)`, `focus:${a}:95:75`);
for (const [l, w, r] of rows) console.log(l.padEnd(36), pct(w), ' eventos de técnico/jogo:', r.coachEventsPerMatch);
const fv = Object.values(focus), spread = Math.max(...fv) - Math.min(...fv);
const out = {
  medio: pct(mid), drafAleatorio: pct(dr), draftMelhor: pct(dg),
  ganhoDraftMelhorVsFraco: ((dg - weak) * 100).toFixed(1) + ' p.p.', ganhoMaximoTeoricoVsFraco: ((strong - weak) * 100).toFixed(1) + ' p.p.',
  focoGanhoVsMedio: Object.fromEntries(Object.entries(focus).map(([a, w]) => [a, ((w - mid) * 100).toFixed(1) + ' p.p.'])), dispersaoFocos: (spread * 100).toFixed(1) + ' p.p.'
};
console.log(JSON.stringify(out, null, 1));
let ok = true;
const chk = (cond, msg) => { if (!cond) { ok = false; console.log('FALHOU:', msg); } };
chk(mid >= 0.25 && mid <= 0.35, 'técnico médio fora de 25-35%');
chk(dg - weak <= 0.15 && dg - weak >= 0.06, 'draft com melhores escolhas deve dar +6 a +15 p.p. sobre o fraco');
chk(strong - weak <= 0.17, 'máximo teórico muito forte');
chk(spread <= 0.05, 'algum atributo isolado domina (dispersão > 5 p.p.)');
chk(Math.min(...fv) - mid >= -0.015, 'algum atributo é inútil');
console.log(ok ? 'coach: OK' : 'coach: AJUSTAR'); if (!ok) process.exitCode = 2;
